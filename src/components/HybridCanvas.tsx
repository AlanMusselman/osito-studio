import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  AutoShapeControlPoint,
  AutoShapeDefinition,
  AutoShapeObject,
  BezierNode,
  BitmapObject,
  CanvasObject,
  CanvasSlice,
  ConnectionPortId,
  GridAndSnapSettings,
  PixelSelection,
  SmartGuideLine,
  TextObject,
  ToolId,
  ToolOptions,
  VectorPathObject,
} from '../types/editor';
import {
  dragAutoShapeControlPoint,
  evaluateAutoShape,
  interactAutoShapeInPreview,
} from '../engine/autoshapes';
import {
  buildConnectorNodesAndBounds,
  computeBestPortPair,
  getAllObjectPorts,
  getObjectPortCoords,
  getPortNormal,
} from '../engine/connectorEngine';
import {
  buildCssFilterString,
  buildLassoSelection,
  buildMagicWandSelection,
  buildOvalSelection,
  buildRectSelection,
  commitFloatingPixels,
  createBlankBitmapDataUrl,
  floatSelectedPixels,
  floodFillOnBitmap,
  getBitmapSelectionGeometrySync,
  getCachedImage,
  isBitmapOpaqueAtCanvasPointSync,
  isPointInPixelSelection,
  paintBitmapStroke,
  translatePixelSelection,
} from '../engine/bitmapEngine';
import { toHexColor, shiftHexBrightness } from './LiveColorPicker';

export interface HybridCanvasProps {
  objects: CanvasObject[];
  selectedIds: string[];
  selectedNodeIds: string[];
  activeTool: ToolId;
  toolOptions: ToolOptions;
  gridSettings: GridAndSnapSettings;
  pixelSelection: PixelSelection;
  autoShapes: AutoShapeDefinition[];
  onSelectObjects: (ids: string[]) => void;
  onSelectNodes: (nodeIds: string[]) => void;
  onUpdateObject: (id: string, patch: Partial<CanvasObject>, recordHistory?: boolean) => void;
  onAddObject: (obj: CanvasObject) => void;
  onUpdatePixelSelection: (sel: PixelSelection) => void;
  onUpdateToolOptions: (patch: Partial<ToolOptions>) => void;
  onUpdateGridSettings: (patch: Partial<GridAndSnapSettings>) => void;
  onSelectTool: (tool: ToolId) => void;
  onRecordHistorySnapshot: () => void;
  canvasRefOut?: React.MutableRefObject<HTMLCanvasElement | null>;
  slices?: CanvasSlice[];
  selectedSliceId?: string | null;
  onSelectSlice?: (sliceId: string | null) => void;
  onUpdateSlice?: (sliceId: string, patch: Partial<CanvasSlice>) => void;
  onAddSlice?: (slice: CanvasSlice) => void;
  onDeleteSlice?: (sliceId: string) => void;
  onExportSlicesZip?: () => void;
  onSmartRemoveBackground?: () => void;
  onVectorizeSelectionToBezier?: () => void;
  onConnectObjects?: (
    fromId: string,
    fromPort: ConnectionPortId,
    toId: string,
    toPort: ConnectionPortId
  ) => void;
  onSpawnConnectedNode?: (
    fromId: string,
    fromPort: ConnectionPortId,
    canvasX: number,
    canvasY: number
  ) => void;
}

type HandleType = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'rotate';

interface DragInteraction {
  mode:
    | 'move-objects'
    | 'resize-object'
    | 'rotate-object'
    | 'marquee-select-objects'
    | 'drag-bezier-node'
    | 'drag-bezier-cp1'
    | 'drag-bezier-cp2'
    | 'drag-autoshape-handle'
    | 'draw-shape'
    | 'draw-pen-handle'
    | 'draw-connector'
    | 'pixel-marquee-rect'
    | 'pixel-marquee-oval'
    | 'pixel-lasso'
    | 'move-floating-pixels'
    | 'bitmap-paint'
    | 'pan-canvas'
    | 'crop-canvas'
    | 'move-slice'
    | 'resize-slice'
    | 'draw-slice'
    | 'preview-scrub-autoshape';
  startCanvasX: number;
  startCanvasY: number;
  currentCanvasX: number;
  currentCanvasY: number;
  startClientX: number;
  startClientY: number;
  targetObjectId?: string;
  targetSliceId?: string;
  initialSlice?: CanvasSlice;
  handle?: HandleType;
  nodeId?: string;
  controlPointId?: string;
  fromObjectId?: string;
  fromPort?: ConnectionPortId;
  snapTargetObjectId?: string;
  snapTargetPort?: ConnectionPortId;
  initialObjectsMap?: Map<string, CanvasObject>;
  lassoPoints?: Array<{ x: number; y: number }>;
  lastPaintPoint?: { x: number; y: number };
  floatingStart?: { x: number; y: number };
  isShiftConstrained?: boolean;
}

/**
 * Wraps and reflows text paragraphs to fit within `maxWidth` pixels using the active 2D context font metrics.
 * Handles both word-level wrapping and character-level breaking when a single word exceeds `maxWidth`.
 */
export function wrapTextToBoxWidth(
  ctx: CanvasRenderingContext2D,
  rawText: string,
  maxWidth: number
): string[] {
  const safeMaxW = Math.max(12, maxWidth);
  const paragraphs = (rawText || '').split('\n');
  const wrappedLines: string[] = [];

  for (const para of paragraphs) {
    if (para.trim().length === 0) {
      wrappedLines.push('');
      continue;
    }

    const words = para.split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(candidate).width <= safeMaxW) {
        currentLine = candidate;
      } else {
        if (currentLine) {
          wrappedLines.push(currentLine);
          currentLine = '';
        }
        // If the single word itself is wider than safeMaxW, break it character by character
        if (ctx.measureText(word).width > safeMaxW) {
          let charChunk = '';
          for (const ch of word) {
            const nextChunk = charChunk + ch;
            if (ctx.measureText(nextChunk).width <= safeMaxW || charChunk.length === 0) {
              charChunk = nextChunk;
            } else {
              wrappedLines.push(charChunk);
              charChunk = ch;
            }
          }
          currentLine = charChunk;
        } else {
          currentLine = word;
        }
      }
    }

    if (currentLine) {
      wrappedLines.push(currentLine);
    }
  }

  return wrappedLines.length > 0 ? wrappedLines : [''];
}

/**
 * Traces a cubic Bezier node array onto a 2D canvas context in local object coordinates.
 */
export function traceBezierNodesOnContext(
  ctx: CanvasRenderingContext2D,
  nodes: BezierNode[],
  closed: boolean,
  offsetX = 0,
  offsetY = 0
) {
  if (nodes.length === 0) return;
  ctx.moveTo(nodes[0].x + offsetX, nodes[0].y + offsetY);

  for (let i = 0; i < nodes.length - 1; i++) {
    const curr = nodes[i];
    const next = nodes[i + 1];
    ctx.bezierCurveTo(
      curr.cp2x + offsetX,
      curr.cp2y + offsetY,
      next.cp1x + offsetX,
      next.cp1y + offsetY,
      next.x + offsetX,
      next.y + offsetY
    );
  }

  if (closed && nodes.length > 1) {
    const last = nodes[nodes.length - 1];
    const first = nodes[0];
    ctx.bezierCurveTo(
      last.cp2x + offsetX,
      last.cp2y + offsetY,
      first.cp1x + offsetX,
      first.cp1y + offsetY,
      first.x + offsetX,
      first.y + offsetY
    );
    ctx.closePath();
  }
}

/**
 * Renders a single CanvasObject onto any 2D context (used both by the interactive viewport
 * and by clean PNG / Rasterize exports).
 */
export function renderCanvasObjectToContext(
  ctx: CanvasRenderingContext2D,
  rawObj: CanvasObject,
  autoShapes: AutoShapeDefinition[],
  onAsyncImageReady?: () => void
) {
  if (!rawObj.visible) return;

  const st =
    rawObj.activeState && rawObj.activeState !== 'default'
      ? rawObj.stateVariants?.[rawObj.activeState]
      : undefined;

  const obj: CanvasObject = st
    ? ({
        ...rawObj,
        fill: st.fill ?? rawObj.fill,
        fillGradientEnd: st.fillGradientEnd ?? rawObj.fillGradientEnd,
        stroke: st.stroke ?? rawObj.stroke,
        strokeWidth: st.strokeWidth ?? rawObj.strokeWidth,
        opacity: st.opacity ?? rawObj.opacity,
        shadow: st.shadow ?? rawObj.shadow,
        y: rawObj.y,
        ...(rawObj.type === 'autoshape' && st.params
          ? { params: { ...(rawObj as AutoShapeObject).params, ...st.params } }
          : {}),
      } as CanvasObject)
    : rawObj;

  ctx.save();
  ctx.globalAlpha = obj.opacity ?? 1;
  ctx.globalCompositeOperation = obj.blendMode || 'source-over';

  const snap = obj.pixelSnap !== false;
  const safeX = Number.isFinite(obj.x) ? obj.x : 0;
  const safeY = Number.isFinite(obj.y) ? obj.y : 0;
  const safeW = Number.isFinite(obj.width) && obj.width > 0 ? obj.width : 1;
  const safeH = Number.isFinite(obj.height) && obj.height > 0 ? obj.height : 1;
  const ox = snap ? Math.round(safeX) : safeX;
  const oy = snap ? Math.round(safeY) : safeY;
  const ow = snap ? Math.max(1, Math.round(safeW)) : Math.max(1, safeW);
  const oh = snap ? Math.max(1, Math.round(safeH)) : Math.max(1, safeH);

  // Translate to exact integer origin when unrotated, or rotate around center when rotated
  if (obj.rotation && Number.isFinite(obj.rotation)) {
    const cx = ox + ow / 2;
    const cy = oy + oh / 2;
    ctx.translate(cx, cy);
    ctx.rotate((obj.rotation * Math.PI) / 180);
    ctx.translate(-ow / 2, -oh / 2);
  } else {
    ctx.translate(ox, oy);
  }

  // Fireworks MX Live Drop Shadow
  if (obj.shadow?.enabled) {
    ctx.shadowColor = obj.shadow.color || 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = obj.shadow.blur ?? 8;
    ctx.shadowOffsetX = obj.shadow.offsetX ?? 0;
    ctx.shadowOffsetY = obj.shadow.offsetY ?? 4;
  }

  // Helper to resolve Fill style with finite positive coordinate guarantees
  const applyFillStyle = () => {
    if (!obj.fill || obj.fill === 'none' || obj.fillType === 'none') return false;
    const gradW = Number.isFinite(ow) && ow > 0 ? Math.max(1, ow) : 1;
    const gradH = Number.isFinite(oh) && oh > 0 ? Math.max(1, oh) : 1;
    if (obj.fillType === 'linear-gradient') {
      const grad = ctx.createLinearGradient(0, 0, gradW, gradH);
      try {
        grad.addColorStop(0, obj.fill);
        grad.addColorStop(1, obj.fillGradientEnd || '#525252');
      } catch {
        ctx.fillStyle = obj.fill;
        return true;
      }
      ctx.fillStyle = grad;
    } else if (obj.fillType === 'radial-gradient') {
      const outerR = Math.max(2.5, Math.max(gradW, gradH) / 2);
      const innerR = Math.min(2, outerR * 0.4);
      const grad = ctx.createRadialGradient(
        gradW / 2,
        gradH / 2,
        innerR,
        gradW / 2,
        gradH / 2,
        outerR
      );
      try {
        grad.addColorStop(0, obj.fill);
        grad.addColorStop(1, obj.fillGradientEnd || '#525252');
      } catch {
        ctx.fillStyle = obj.fill;
        return true;
      }
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = obj.fill;
    }
    return true;
  };

  // Fireworks MX Pixel-Perfect Stroke Helper (handles Inside / Center / Outside + 0.5px odd stroke snapping)
  const fillAndStrokeCurrentPath = (isClosed: boolean, retracePath?: () => void) => {
    if (applyFillStyle()) {
      ctx.fill();
    }
    if (obj.fill && obj.fill !== 'none' && obj.fillType !== 'none') {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    if (obj.stroke && obj.stroke !== 'none' && obj.strokeWidth > 0) {
      ctx.strokeStyle = obj.stroke;
      ctx.lineJoin = 'miter';
      ctx.lineCap = 'butt';

      if (isClosed && obj.strokeAlign === 'inside') {
        ctx.save();
        ctx.clip();
        ctx.lineWidth = obj.strokeWidth * 2;
        ctx.stroke();
        ctx.restore();
      } else if (isClosed && obj.strokeAlign === 'outside') {
        ctx.save();
        const pad = Math.max(64, obj.strokeWidth * 4 + 32);
        ctx.rect(-pad, -pad, ow + pad * 2, oh + pad * 2);
        ctx.clip('evenodd');
        if (retracePath) {
          ctx.beginPath();
          retracePath();
        }
        ctx.lineWidth = obj.strokeWidth * 2;
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.lineWidth = obj.strokeWidth;
        ctx.stroke();
      }
    }
  };

  if (obj.type === 'bitmap') {
    const bmp = obj as BitmapObject;
    const img = getCachedImage(bmp.imageDataUrl, onAsyncImageReady);
    if (img) {
      ctx.imageSmoothingEnabled = false;
      const filterStr = buildCssFilterString(bmp.filters);
      if (filterStr !== 'none') {
        ctx.filter = filterStr;
      }
      const pixelateFactor = Math.max(1, Math.round(bmp.filters?.pixelate || 1));
      if (pixelateFactor > 1) {
        const lowW = Math.max(1, Math.round(ow / pixelateFactor));
        const lowH = Math.max(1, Math.round(oh / pixelateFactor));
        const pixCanvas = document.createElement('canvas');
        pixCanvas.width = lowW;
        pixCanvas.height = lowH;
        const pixCtx = pixCanvas.getContext('2d');
        if (pixCtx) {
          pixCtx.imageSmoothingEnabled = false;
          pixCtx.drawImage(img, 0, 0, lowW, lowH);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(pixCanvas, 0, 0, lowW, lowH, 0, 0, ow, oh);
        } else {
          ctx.drawImage(img, 0, 0, ow, oh);
        }
      } else {
        ctx.drawImage(img, 0, 0, ow, oh);
      }
      ctx.filter = 'none';
    }
  } else if (obj.type === 'vector-path') {
    const vec = obj as VectorPathObject;
    const oddCenterOffset =
      snap && vec.strokeAlign === 'center' && vec.strokeWidth % 2 === 1 ? 0.5 : 0;

    const traceVecPath = () => {
      traceBezierNodesOnContext(ctx, vec.nodes, vec.closed, oddCenterOffset, oddCenterOffset);
    };
    ctx.beginPath();
    traceVecPath();
    fillAndStrokeCurrentPath(vec.closed, traceVecPath);

    // Lucidchart-Style Smart Connector Arrowheads & Midpoint Label Badge
    if (vec.connectorMeta && vec.nodes.length >= 2) {
      const strokeColor =
        vec.stroke && vec.stroke !== 'none' ? vec.stroke : '#38bdf8';
      const headLen = Math.max(9, (vec.strokeWidth || 2) * 4.2);

      const drawConnectorArrow = (
        tipX: number,
        tipY: number,
        refX: number,
        refY: number
      ) => {
        const dx = tipX - refX;
        const dy = tipY - refY;
        if (Math.hypot(dx, dy) < 0.01) return;
        const angle = Math.atan2(dy, dx);
        ctx.save();
        ctx.translate(tipX + oddCenterOffset, tipY + oddCenterOffset);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-headLen, -headLen * 0.54);
        ctx.lineTo(-headLen * 0.8, 0);
        ctx.lineTo(-headLen, headLen * 0.54);
        ctx.closePath();
        ctx.fillStyle = strokeColor;
        ctx.fill();
        ctx.restore();
      };

      if (vec.connectorMeta.endArrow !== false) {
        const last = vec.nodes[vec.nodes.length - 1];
        const prev = vec.nodes[vec.nodes.length - 2];
        const hasTangent =
          Math.hypot(last.x - last.cp1x, last.y - last.cp1y) > 1;
        const nTo = getPortNormal(vec.connectorMeta.toPort || 'w');
        const distPrev = Math.hypot(last.x - prev.x, last.y - prev.y);
        const refX = hasTangent
          ? last.cp1x
          : distPrev > 1
          ? prev.x
          : last.x + nTo.nx * 16;
        const refY = hasTangent
          ? last.cp1y
          : distPrev > 1
          ? prev.y
          : last.y + nTo.ny * 16;
        drawConnectorArrow(last.x, last.y, refX, refY);
      }

      if (vec.connectorMeta.startArrow) {
        const first = vec.nodes[0];
        const second = vec.nodes[1];
        const hasTangent =
          Math.hypot(first.x - first.cp2x, first.y - first.cp2y) > 1;
        const nFrom = getPortNormal(vec.connectorMeta.fromPort || 'e');
        const distSecond = Math.hypot(first.x - second.x, first.y - second.y);
        const refX = hasTangent
          ? first.cp2x
          : distSecond > 1
          ? second.x
          : first.x + nFrom.nx * 16;
        const refY = hasTangent
          ? first.cp2y
          : distSecond > 1
          ? second.y
          : first.y + nFrom.ny * 16;
        drawConnectorArrow(first.x, first.y, refX, refY);
      }

      if (vec.connectorMeta.label && vec.connectorMeta.label.trim().length > 0) {
        const midIdx = Math.floor(vec.nodes.length / 2);
        const nA = vec.nodes[Math.max(0, midIdx - 1)];
        const nB = vec.nodes[midIdx];
        const midX = (nA.x + nB.x) / 2;
        const midY = (nA.y + nB.y) / 2;
        const labelStr = vec.connectorMeta.label.trim();

        ctx.save();
        ctx.font = '600 10px "JetBrains Mono", monospace';
        const tw = Math.ceil(ctx.measureText(labelStr).width) + 12;
        const th = 18;
        const bx = Math.round(midX - tw / 2);
        const by = Math.round(midY - th / 2);
        ctx.fillStyle = '#111111';
        ctx.fillRect(bx, by, tw, th);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.25;
        ctx.strokeRect(bx + 0.5, by + 0.5, tw, th);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelStr, midX, midY + 0.5);
        ctx.restore();
      }
    }
  } else if (obj.type === 'autoshape') {
    const asObj = obj as AutoShapeObject;
    const def =
      autoShapes.find((d) => d.id === asObj.shapeDefId) || autoShapes[0];
    if (def) {
      const evaluated = evaluateAutoShape(
        def,
        ow,
        oh,
        asObj.params,
        asObj.customCode
      );
      const oddCenterOffset =
        snap && asObj.strokeAlign === 'center' && asObj.strokeWidth % 2 === 1 ? 0.5 : 0;

      if (evaluated.paths.length <= 1) {
        const traceSingleSubPath = () => {
          evaluated.paths.forEach((subPath) => {
            traceBezierNodesOnContext(
              ctx,
              subPath.nodes,
              subPath.closed,
              oddCenterOffset,
              oddCenterOffset
            );
          });
        };
        ctx.beginPath();
        traceSingleSubPath();
        const anyClosed = evaluated.paths.some((p) => p.closed);
        fillAndStrokeCurrentPath(anyClosed, traceSingleSubPath);
      } else {
        // Multi-subpath AutoShape: Render outer primary container (subpath 0) with primary fill & stroke,
        // then render inner subpaths (content blocks, buttons, headers, icons) individually with color-harmonized contrast
        const primarySubPath = evaluated.paths[0];
        const tracePrimarySubPath = () => {
          traceBezierNodesOnContext(
            ctx,
            primarySubPath.nodes,
            primarySubPath.closed,
            oddCenterOffset,
            oddCenterOffset
          );
        };
        ctx.beginPath();
        tracePrimarySubPath();
        fillAndStrokeCurrentPath(primarySubPath.closed, tracePrimarySubPath);

        const baseFillHex = toHexColor(asObj.fill, '#3b82f6');
        const hasVisibleFill =
          Boolean(asObj.fill) && asObj.fill !== 'none' && asObj.fillType !== 'none';
        const innerStrokeColor =
          asObj.stroke && asObj.stroke !== 'none' && asObj.strokeWidth > 0
            ? asObj.stroke
            : shiftHexBrightness(baseFillHex, 36);
        const innerStrokeW =
          asObj.stroke && asObj.stroke !== 'none' && asObj.strokeWidth > 0
            ? Math.max(1, Math.min(asObj.strokeWidth, 2.5))
            : 1.25;

        for (let idx = 1; idx < evaluated.paths.length; idx++) {
          const subPath = evaluated.paths[idx];
          ctx.beginPath();
          traceBezierNodesOnContext(
            ctx,
            subPath.nodes,
            subPath.closed,
            oddCenterOffset,
            oddCenterOffset
          );

          if (subPath.closed && hasVisibleFill) {
            ctx.save();
            const deltaLum = idx % 2 === 1 ? 18 : -14;
            ctx.fillStyle = shiftHexBrightness(baseFillHex, deltaLum);
            ctx.globalAlpha = (ctx.globalAlpha || 1) * 0.65;
            ctx.fill();
            ctx.restore();
          }

          ctx.save();
          ctx.strokeStyle = innerStrokeColor;
          ctx.lineWidth = innerStrokeW;
          ctx.lineJoin = 'miter';
          ctx.lineCap = 'butt';
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  } else if (obj.type === 'text') {
    const txt = obj as TextObject;
    const fontSize = txt.fontSize || 16;
    ctx.font = `${txt.fontWeight || '600'} ${fontSize}px "${txt.fontFamily || 'Inter'}", sans-serif`;
    if ('letterSpacing' in ctx && typeof txt.letterSpacing === 'number') {
      (ctx as unknown as { letterSpacing: string }).letterSpacing = `${txt.letterSpacing}px`;
    }
    ctx.textBaseline = 'top';
    ctx.textAlign = txt.textAlign || 'left';
    const alignX =
      txt.textAlign === 'center' ? ow / 2 : txt.textAlign === 'right' ? ow : 0;

    // Reflow and word-wrap text dynamically to the current text block width (ow)
    const lines = wrapTextToBoxWidth(ctx, txt.text || '', ow);
    const lineHeight = fontSize * 1.3;
    const totalTextH = lines.length * lineHeight;
    // Vertically realign inside the text block when box height exceeds wrapped lines height
    const offsetY =
      txt.textAlign === 'center' && oh > totalTextH
        ? Math.round((oh - totalTextH) / 2)
        : 0;

    if (applyFillStyle()) {
      lines.forEach((line, idx) => {
        ctx.fillText(line, alignX, offsetY + idx * lineHeight);
      });
    }
    if (txt.stroke && txt.stroke !== 'none' && txt.strokeWidth > 0) {
      ctx.strokeStyle = txt.stroke;
      ctx.lineWidth = txt.strokeWidth;
      lines.forEach((line, idx) => {
        ctx.strokeText(line, alignX, offsetY + idx * lineHeight);
      });
    }
  }

  ctx.restore();
}

export const HybridCanvas: React.FC<HybridCanvasProps> = ({
  objects,
  selectedIds,
  selectedNodeIds,
  activeTool,
  toolOptions,
  gridSettings,
  pixelSelection,
  autoShapes,
  onSelectObjects,
  onSelectNodes,
  onUpdateObject,
  onAddObject,
  onUpdatePixelSelection,
  onUpdateToolOptions,
  onUpdateGridSettings,
  onSelectTool,
  onRecordHistorySnapshot,
  canvasRefOut,
  slices = [],
  selectedSliceId = null,
  onSelectSlice,
  onUpdateSlice,
  onAddSlice,
  onDeleteSlice,
  onExportSlicesZip,
  onSmartRemoveBackground,
  onVectorizeSelectionToBezier,
  onConnectObjects,
  onSpawnConnectedNode,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 1100, height: 700 });
  const [cursorCoords, setCursorCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredPixelHex, setHoveredPixelHex] = useState<string>('#141414');
  const [spacePressed, setSpacePressed] = useState(false);
  const [marchingAntsOffset, setMarchingAntsOffset] = useState(0);
  const [smartGuides, setSmartGuides] = useState<SmartGuideLine[]>([]);
  const [activePenObjectId, setActivePenObjectId] = useState<string | null>(null);
  const [selectBehindCycleIndex, setSelectBehindCycleIndex] = useState(0);
  const [resizeHudLabel, setResizeHudLabel] = useState<string | null>(null);
  const [renderTick, setRenderTick] = useState(0);
  const [hoveredObjectId, setHoveredObjectId] = useState<string | null>(null);
  const [hoveredPort, setHoveredPort] = useState<{
    objectId: string;
    port: ConnectionPortId;
  } | null>(null);
  const [previewHoverObjectId, setPreviewHoverObjectId] = useState<string | null>(null);
  const [previewActiveObjectId, setPreviewActiveObjectId] = useState<string | null>(null);

  const isPreviewMode = gridSettings.canvasViewMode === 'preview';
  const isSliceMode = gridSettings.canvasViewMode === 'slice';

  // Real websites render dropdowns, nested flyout menus, and mega-menus as floating z-index overlays
  // (`position: absolute; z-index: 50`) on top of the hero/page content — never pushing page layout down!
  const containerReflowOffsets = React.useMemo(() => {
    const offsets = new Map<string, { dx: number; dy: number }>();
    for (const o of objects) {
      offsets.set(o.id, { dx: 0, dy: 0 });
    }
    return offsets;
  }, [objects]);

  const interactionRef = useRef<DragInteraction | null>(null);

  useEffect(() => {
    if (canvasRefOut) {
      canvasRefOut.current = viewportCanvasRef.current;
    }
  }, [canvasRefOut]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      setViewportSize({
        width: Math.max(300, el.clientWidth),
        height: Math.max(200, el.clientHeight),
      });
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Animate Marching Ants when pixelSelection is active
  useEffect(() => {
    if (!pixelSelection.active && !interactionRef.current) return;
    const timer = window.setInterval(() => {
      setMarchingAntsOffset((prev) => (prev + 1) % 16);
    }, 80);
    return () => window.clearInterval(timer);
  }, [pixelSelection.active]);

  // Track Spacebar for instant Hand panning
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        setSpacePressed(true);
      }
      if (e.key === 'Escape' || e.key === 'Enter') {
        setActivePenObjectId(null);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const rulerThickness = gridSettings.showRulers && !isPreviewMode ? 22 : 0;
  // Keep document origin anchored to the same 22px offset whether rulers or preview mode are toggled so the canvas never shifts position
  const docOriginRulerOffset = 22;

  const getDocOriginOnScreen = useCallback(() => {
    const docScreenW = gridSettings.canvasWidth * gridSettings.zoom;
    const docScreenH = gridSettings.canvasHeight * gridSettings.zoom;
    const baseX =
      docOriginRulerOffset +
      Math.max(28, (viewportSize.width - docOriginRulerOffset - docScreenW) / 2) +
      gridSettings.panX;
    const baseY =
      docOriginRulerOffset +
      Math.max(28, (viewportSize.height - docOriginRulerOffset - docScreenH) / 2) +
      gridSettings.panY;
    return { originX: Math.round(baseX), originY: Math.round(baseY) };
  }, [
    gridSettings.canvasWidth,
    gridSettings.canvasHeight,
    gridSettings.zoom,
    gridSettings.panX,
    gridSettings.panY,
    docOriginRulerOffset,
    viewportSize.width,
    viewportSize.height,
  ]);

  const clientToCanvasCoords = useCallback(
    (clientX: number, clientY: number, applySnapping = false) => {
      const canvas = viewportCanvasRef.current;
      if (!canvas) return { x: 0, y: 0, rawX: 0, rawY: 0 };
      const rect = canvas.getBoundingClientRect();
      const { originX, originY } = getDocOriginOnScreen();
      const rawX = (clientX - rect.left - originX) / gridSettings.zoom;
      const rawY = (clientY - rect.top - originY) / gridSettings.zoom;

      let x = rawX;
      let y = rawY;
      if (applySnapping) {
        if (gridSettings.snapToGrid && gridSettings.gridSize > 1) {
          x = Math.round(x / gridSettings.gridSize) * gridSettings.gridSize;
          y = Math.round(y / gridSettings.gridSize) * gridSettings.gridSize;
        } else if (gridSettings.snapToPixel) {
          x = Math.round(x);
          y = Math.round(y);
        }
      } else if (gridSettings.snapToPixel) {
        x = Math.round(x);
        y = Math.round(y);
      }

      return { x, y, rawX, rawY };
    },
    [getDocOriginOnScreen, gridSettings.zoom, gridSettings.snapToGrid, gridSettings.gridSize, gridSettings.snapToPixel]
  );

  // Helper to get or create active Bitmap layer when using a Bitmap tool
  const ensureTargetBitmapObject = useCallback(
    (hitRegion?: { x: number; y: number; width?: number; height?: number }): BitmapObject => {
      const visibleBitmaps = objects.filter(
        (o): o is BitmapObject => o.type === 'bitmap' && o.visible && !o.locked
      );

      if (hitRegion && visibleBitmaps.length > 0) {
        const rx = hitRegion.x;
        const ry = hitRegion.y;
        const rw = Math.max(1, hitRegion.width ?? 1);
        const rh = Math.max(1, hitRegion.height ?? 1);

        const scored = visibleBitmaps
          .map((bmp) => {
            const ix0 = Math.max(bmp.x, rx);
            const iy0 = Math.max(bmp.y, ry);
            const ix1 = Math.min(bmp.x + bmp.width, rx + rw);
            const iy1 = Math.min(bmp.y + bmp.height, ry + rh);
            const overlapArea = Math.max(0, ix1 - ix0) * Math.max(0, iy1 - iy0);
            return { bmp, overlapArea };
          })
          .filter((item) => item.overlapArea > 0);

        if (scored.length > 0) {
          const regionArea = rw * rh;
          // If a selected bitmap overlaps a meaningful portion of the marquee, prefer it
          const selectedHit = scored.find(
            (item) =>
              selectedIds.includes(item.bmp.id) &&
              item.overlapArea >= Math.min(regionArea * 0.25, item.bmp.width * item.bmp.height * 0.25)
          );
          if (selectedHit) return selectedHit.bmp;

          // Otherwise pick the bitmap with the largest overlap (or topmost on tie)
          scored.sort((a, b) => b.overlapArea - a.overlapArea);
          return scored[0].bmp;
        }
      }

      if (pixelSelection.active && pixelSelection.targetBitmapId) {
        const found = visibleBitmaps.find((b) => b.id === pixelSelection.targetBitmapId);
        if (found) return found;
      }

      for (const id of selectedIds) {
        const found = visibleBitmaps.find((o) => o.id === id);
        if (found) return found;
      }

      if (pixelSelection.targetBitmapId) {
        const found = visibleBitmaps.find((o) => o.id === pixelSelection.targetBitmapId);
        if (found) return found;
      }

      if (visibleBitmaps.length > 0) {
        return visibleBitmaps[visibleBitmaps.length - 1];
      }

      const newBmp: BitmapObject = {
        id: `bmp-${Date.now()}`,
        name: 'Bitmap Pixel Layer',
        type: 'bitmap',
        visible: true,
        locked: false,
        x: 0,
        y: 0,
        width: gridSettings.canvasWidth,
        height: gridSettings.canvasHeight,
        pixelWidth: gridSettings.canvasWidth,
        pixelHeight: gridSettings.canvasHeight,
        rotation: 0,
        opacity: 1,
        blendMode: 'source-over',
        fill: 'none',
        fillType: 'none',
        fillGradientEnd: '#000000',
        stroke: 'none',
        strokeWidth: 0,
        strokeAlign: 'center',
        pixelSnap: true,
        shadow: { enabled: false, color: '#000000', blur: 0, offsetX: 0, offsetY: 0 },
        imageDataUrl: createBlankBitmapDataUrl(gridSettings.canvasWidth, gridSettings.canvasHeight),
        filters: { brightness: 0, contrast: 0, blur: 0, hueRotate: 0, invert: false, pixelate: 1 },
      };
      onAddObject(newBmp);
      return newBmp;
    },
    [selectedIds, objects, pixelSelection.active, pixelSelection.targetBitmapId, gridSettings.canvasWidth, gridSettings.canvasHeight, onAddObject]
  );

  // Helper: Inverse-rotates a world point (px, py) around object center when obj.rotation is non-zero
  const unrotatePointForObject = useCallback(
    (obj: CanvasObject, px: number, py: number): { x: number; y: number } => {
      if (!obj.rotation || !Number.isFinite(obj.rotation)) {
        return { x: px, y: py };
      }
      const safeW = Math.max(1, obj.width || 1);
      const safeH = Math.max(1, obj.height || 1);
      const cx = obj.x + safeW / 2;
      const cy = obj.y + safeH / 2;
      const rad = (-obj.rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const dx = px - cx;
      const dy = py - cy;
      return {
        x: cx + dx * cos - dy * sin,
        y: cy + dx * sin + dy * cos,
      };
    },
    []
  );

  // Hit-test diamond AutoShape handles on selected AutoShape
  const hitTestAutoShapeControlHandle = useCallback(
    (canvasX: number, canvasY: number): { obj: AutoShapeObject; cp: AutoShapeControlPoint } | null => {
      const safeZoom = Math.max(0.1, gridSettings.zoom || 1);
      const hitRadius = 9 / safeZoom;
      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        if (!selectedIds.includes(obj.id) || obj.type !== 'autoshape' || !obj.visible || obj.locked) continue;
        const asObj = obj as AutoShapeObject;
        const def = autoShapes.find((d) => d.id === asObj.shapeDefId) || autoShapes[0];
        if (!def) continue;
        const safeW = Math.max(1, asObj.width || 1);
        const safeH = Math.max(1, asObj.height || 1);
        const unrot = unrotatePointForObject(asObj, canvasX, canvasY);
        const evaluated = evaluateAutoShape(def, safeW, safeH, asObj.params, asObj.customCode);
        for (const cp of evaluated.controlPoints) {
          const handleX = asObj.x + cp.x;
          const handleY = asObj.y + cp.y;
          if (
            Math.hypot(canvasX - handleX, canvasY - handleY) <= hitRadius ||
            Math.hypot(unrot.x - handleX, unrot.y - handleY) <= hitRadius
          ) {
            return { obj: asObj, cp };
          }
        }
      }
      return null;
    },
    [objects, selectedIds, autoShapes, gridSettings.zoom, unrotatePointForObject]
  );

  // Hit-test bounding box & contour resize handles on single selected object
  const hitTestResizeHandles = useCallback(
    (canvasX: number, canvasY: number): { obj: CanvasObject; handle: HandleType } | null => {
      if (selectedIds.length !== 1) return null;
      const obj = objects.find((o) => o.id === selectedIds[0]);
      if (!obj || !obj.visible || obj.locked) return null;

      const safeZoom = Math.max(0.1, gridSettings.zoom || 1);
      const r = 7 / safeZoom;
      const x = Number.isFinite(obj.x) ? obj.x : 0;
      const y = Number.isFinite(obj.y) ? obj.y : 0;
      const w = Math.max(1, Number.isFinite(obj.width) ? obj.width : 1);
      const h = Math.max(1, Number.isFinite(obj.height) ? obj.height : 1);
      const unrot = unrotatePointForObject(obj, canvasX, canvasY);

      let handles: Array<{ id: HandleType; hx: number; hy: number }> = [
        { id: 'nw', hx: x, hy: y },
        { id: 'n', hx: x + w / 2, hy: y },
        { id: 'ne', hx: x + w, hy: y },
        { id: 'e', hx: x + w, hy: y + h / 2 },
        { id: 'se', hx: x + w, hy: y + h },
        { id: 's', hx: x + w / 2, hy: y + h },
        { id: 'sw', hx: x, hy: y + h },
        { id: 'w', hx: x, hy: y + h / 2 },
      ];

      if (obj.type === 'bitmap') {
        const geom = getBitmapSelectionGeometrySync(obj as BitmapObject);
        if (geom && geom.hasCutout) {
          handles = geom.handles.map((hNode) => ({
            id: hNode.id,
            hx: x + hNode.lx,
            hy: y + hNode.ly,
          }));
          geom.contourVertices.forEach((vNode) => {
            handles.push({
              id: vNode.mappedHandle,
              hx: x + vNode.lx,
              hy: y + vNode.ly,
            });
          });
        }
      }

      if (activeTool === 'scale') {
        handles.push({ id: 'rotate', hx: x + w / 2, hy: y - 22 / safeZoom });
      }

      for (const hItem of handles) {
        if (
          Math.hypot(canvasX - hItem.hx, canvasY - hItem.hy) <= r ||
          Math.hypot(unrot.x - hItem.hx, unrot.y - hItem.hy) <= r
        ) {
          return { obj, handle: hItem.id };
        }
      }
      return null;
    },
    [selectedIds, objects, gridSettings.zoom, activeTool, unrotatePointForObject]
  );

  // Hit-test 8 bounding box resize handles on the selected Web Slice
  const hitTestSliceResizeHandles = useCallback(
    (canvasX: number, canvasY: number): { slice: CanvasSlice; handle: HandleType } | null => {
      if (gridSettings.showSlices === false || !selectedSliceId || !slices.length) return null;
      const slice = slices.find((s) => s.id === selectedSliceId);
      if (!slice) return null;

      const safeZoom = Math.max(0.1, gridSettings.zoom || 1);
      const r = 8 / safeZoom;
      const x = Number.isFinite(slice.x) ? slice.x : 0;
      const y = Number.isFinite(slice.y) ? slice.y : 0;
      const w = Math.max(1, Number.isFinite(slice.width) ? slice.width : 1);
      const h = Math.max(1, Number.isFinite(slice.height) ? slice.height : 1);
      const handles: Array<{ id: HandleType; hx: number; hy: number }> = [
        { id: 'nw', hx: x, hy: y },
        { id: 'n', hx: x + w / 2, hy: y },
        { id: 'ne', hx: x + w, hy: y },
        { id: 'e', hx: x + w, hy: y + h / 2 },
        { id: 'se', hx: x + w, hy: y + h },
        { id: 's', hx: x + w / 2, hy: y + h },
        { id: 'sw', hx: x, hy: y + h },
        { id: 'w', hx: x, hy: y + h / 2 },
      ];

      for (const hItem of handles) {
        if (Math.hypot(canvasX - hItem.hx, canvasY - hItem.hy) <= r) {
          return { slice, handle: hItem.id };
        }
      }
      return null;
    },
    [gridSettings.showSlices, gridSettings.zoom, selectedSliceId, slices]
  );

  // Hit-test Web Slice header badge, border edge, or interior
  const hitTestSlice = useCallback(
    (canvasX: number, canvasY: number, includeInterior: boolean): CanvasSlice | null => {
      if (gridSettings.showSlices === false || !slices.length) return null;
      const safeZoom = Math.max(0.1, gridSettings.zoom || 1);
      const edgeTol = 6 / safeZoom;
      const badgeH = 18 / safeZoom;

      for (let i = slices.length - 1; i >= 0; i--) {
        const s = slices[i];
        const sw = Math.max(1, s.width || 1);
        const sh = Math.max(1, s.height || 1);
        const badgeW = Math.max(Math.min(sw, 220 / safeZoom), 140 / safeZoom);
        const inBadge =
          canvasX >= s.x - 2 &&
          canvasX <= s.x + badgeW &&
          canvasY >= s.y - badgeH &&
          canvasY <= s.y + 4 / safeZoom;
        if (inBadge) return s;

        const inOuterBox =
          canvasX >= s.x - edgeTol &&
          canvasX <= s.x + sw + edgeTol &&
          canvasY >= s.y - edgeTol &&
          canvasY <= s.y + sh + edgeTol;

        if (!inOuterBox) continue;

        if (includeInterior) {
          return s;
        }

        // Check if near any of the 4 border edges
        const nearLeft = Math.abs(canvasX - s.x) <= edgeTol;
        const nearRight = Math.abs(canvasX - (s.x + sw)) <= edgeTol;
        const nearTop = Math.abs(canvasY - s.y) <= edgeTol;
        const nearBottom = Math.abs(canvasY - (s.y + sh)) <= edgeTol;
        if (nearLeft || nearRight || nearTop || nearBottom) {
          return s;
        }
      }
      return null;
    },
    [gridSettings.showSlices, gridSettings.zoom, slices]
  );

  // Hit-test Subselection Tool (A) Bezier anchor nodes and control handles (cp1, cp2)
  const hitTestBezierSubselection = useCallback(
    (
      canvasX: number,
      canvasY: number
    ): { obj: VectorPathObject; node: BezierNode; part: 'anchor' | 'cp1' | 'cp2' } | null => {
      const safeZoom = Math.max(0.1, gridSettings.zoom || 1);
      const hitRadius = 8 / safeZoom;
      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        if (obj.type !== 'vector-path' || !obj.visible || obj.locked) continue;
        const vec = obj as VectorPathObject;
        const unrot = unrotatePointForObject(vec, canvasX, canvasY);
        if (selectedIds.includes(vec.id)) {
          for (const node of vec.nodes) {
            const cp1WorldX = vec.x + node.cp1x;
            const cp1WorldY = vec.y + node.cp1y;
            if (
              Math.hypot(canvasX - cp1WorldX, canvasY - cp1WorldY) <= hitRadius ||
              Math.hypot(unrot.x - cp1WorldX, unrot.y - cp1WorldY) <= hitRadius
            ) {
              return { obj: vec, node, part: 'cp1' };
            }
            const cp2WorldX = vec.x + node.cp2x;
            const cp2WorldY = vec.y + node.cp2y;
            if (
              Math.hypot(canvasX - cp2WorldX, canvasY - cp2WorldY) <= hitRadius ||
              Math.hypot(unrot.x - cp2WorldX, unrot.y - cp2WorldY) <= hitRadius
            ) {
              return { obj: vec, node, part: 'cp2' };
            }
          }
        }
        for (const node of vec.nodes) {
          const nx = vec.x + node.x;
          const ny = vec.y + node.y;
          if (
            Math.hypot(canvasX - nx, canvasY - ny) <= hitRadius ||
            Math.hypot(unrot.x - nx, unrot.y - ny) <= hitRadius
          ) {
            return { obj: vec, node, part: 'anchor' };
          }
        }
      }
      return null;
    },
    [objects, selectedIds, gridSettings.zoom, unrotatePointForObject]
  );

  // Hit-test Lucidchart-style 4-way Magnetic Connection Ports (N, E, S, W)
  const hitTestConnectionPort = useCallback(
    (
      canvasX: number,
      canvasY: number
    ): { obj: CanvasObject; port: ConnectionPortId; x: number; y: number } | null => {
      if (isPreviewMode || isSliceMode) return null;
      const safeZoom = Math.max(0.1, gridSettings.zoom || 1);
      const hitR = 9 / safeZoom;
      const outwardOffset = 14 / safeZoom;

      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        if (!obj.visible || obj.locked) continue;
        if (obj.type === 'vector-path' && (obj as VectorPathObject).connectorMeta) continue;
        // Only check ports on objects whose ports are currently visible (selected, hovered, or in Connector tool)
        const portsVisible =
          activeTool === 'connector' ||
          selectedIds.includes(obj.id) ||
          hoveredObjectId === obj.id ||
          hoveredPort?.objectId === obj.id;
        if (!portsVisible) continue;

        const unrot = unrotatePointForObject(obj, canvasX, canvasY);
        const ports = getAllObjectPorts(obj);
        for (const p of ports) {
          const handleX = p.x + p.nx * outwardOffset;
          const handleY = p.y + p.ny * outwardOffset;
          if (
            Math.hypot(canvasX - handleX, canvasY - handleY) <= hitR ||
            Math.hypot(unrot.x - handleX, unrot.y - handleY) <= hitR ||
            (activeTool === 'connector' &&
              (Math.hypot(canvasX - p.x, canvasY - p.y) <= hitR ||
                Math.hypot(unrot.x - p.x, unrot.y - p.y) <= hitR))
          ) {
            return { obj, port: p.port, x: p.x, y: p.y };
          }
        }
      }
      return null;
    },
    [
      isPreviewMode,
      isSliceMode,
      gridSettings.zoom,
      objects,
      activeTool,
      selectedIds,
      hoveredObjectId,
      hoveredPort,
      unrotatePointForObject,
    ]
  );

  // Mouse Down Handler
  const handleMouseDown = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0 && e.button !== 1) return;
    const { x, y, rawX, rawY } = clientToCanvasCoords(e.clientX, e.clientY, true);

    if (activeTool === 'hand' || spacePressed || e.button === 1) {
      interactionRef.current = {
        mode: 'pan-canvas',
        startCanvasX: rawX,
        startCanvasY: rawY,
        currentCanvasX: rawX,
        currentCanvasY: rawY,
        startClientX: e.clientX,
        startClientY: e.clientY,
      };
      return;
    }

    if (activeTool === 'zoom') {
      const factor = e.altKey ? 0.5 : 2;
      const nextZoom = Math.max(0.25, Math.min(16, Number((gridSettings.zoom * factor).toFixed(2))));
      onUpdateGridSettings({ zoom: nextZoom });
      return;
    }

    // Live Preview Mode: Interactive widget execution (:hover / :active + live AutoShape toggling/scrubbing + Nested Menus)
    if (isPreviewMode) {
      // Check if clicking inside any Navbar or Sidebar Nested Menu first!
      const nestedMenuTargets = [...objects]
        .reverse()
        .filter((o) => {
          if (!o.visible) return false;
          if (o.type === 'autoshape') {
            const ao = o as AutoShapeObject;
            return (
              ao.shapeDefId !== 'ui-dropdown-select' &&
              ao.shapeDefId !== 'layout-mega-menu' &&
              Boolean(
                ao.params?.hasNestedMenu ||
                  ao.shapeDefId === 'layout-sticky-navbar' ||
                  ao.name.toLowerCase().includes('navbar')
              )
            );
          }
          return Boolean(o.params?.hasNestedMenu);
        });

      for (const nestedMenuTarget of nestedMenuTargets) {
        const isSidebar =
          (nestedMenuTarget.type === 'autoshape' &&
            ((nestedMenuTarget as AutoShapeObject).shapeDefId === 'layout-sidebar-shell' ||
              (nestedMenuTarget as AutoShapeObject).shapeDefId === 'sitemap-navigation-tree')) ||
          nestedMenuTarget.height > nestedMenuTarget.width * 1.1;

        const navOff = containerReflowOffsets.get(nestedMenuTarget.id) || { dx: 0, dy: 0 };
        const navX = nestedMenuTarget.x + navOff.dx;
        const navY = nestedMenuTarget.y + navOff.dy;

        if (!isSidebar) {
          const navStartX = navX + Math.round(nestedMenuTarget.width * 0.22);
          const navSpanW = Math.round(nestedMenuTarget.width * 0.54);
          const itemW = Math.max(52, Math.floor(navSpanW / 4));
          const currentOpenMenu = Number(nestedMenuTarget.params?.openMenuIndex ?? 0);
          const isMenuOpen = currentOpenMenu > 0;
          const activeMenuIdx = Math.max(0, Math.min(3, (currentOpenMenu || 1) - 1));
          const menuX = Math.min(
            gridSettings.canvasWidth - 430,
            Math.max(12, navStartX + activeMenuIdx * itemW)
          );
          const menuY = navY + nestedMenuTarget.height + 4;
          const menuW = 216;
          const menuH = 152;
          const subX = menuX + menuW + 4;
          const subY = menuY;
          const subW = 208;
          const subH = 152;

          // Click on top-level navbar menu item (1..4) -> toggle open/close floating dropdown overlay (z-index overlay without pushing page layout down)
          if (
            rawY >= navY &&
            rawY <= navY + nestedMenuTarget.height &&
            rawX >= navStartX &&
            rawX <= navStartX + itemW * 4
          ) {
            const clickedIdx = Math.max(
              1,
              Math.min(4, Math.floor((rawX - navStartX) / itemW) + 1)
            );
            const nextOpenIdx = currentOpenMenu === clickedIdx ? 0 : clickedIdx;
            onUpdateObject(
              nestedMenuTarget.id,
              {
                params: {
                  ...nestedMenuTarget.params,
                  hasNestedMenu: true,
                  activeTab: clickedIdx,
                  activeLink: clickedIdx,
                  openMenuIndex: nextOpenIdx,
                  openSubMenuIndex: nextOpenIdx > 0 ? 1 : 0,
                },
              },
              false
            );
            setPreviewActiveObjectId(nestedMenuTarget.id);
            return;
          }

          if (isMenuOpen) {
            // Click inside Level-1 Dropdown Menu -> select Level-2 Nested Submenu!
            if (
              rawX >= menuX &&
              rawX <= menuX + menuW &&
              rawY >= menuY &&
              rawY <= menuY + menuH
            ) {
              const rowIdx = Math.max(1, Math.min(4, Math.floor((rawY - (menuY + 27)) / 30) + 1));
              onUpdateObject(
                nestedMenuTarget.id,
                {
                  params: {
                    ...nestedMenuTarget.params,
                    hasNestedMenu: true,
                    openSubMenuIndex: rowIdx,
                  },
                },
                false
              );
              setPreviewActiveObjectId(nestedMenuTarget.id);
              return;
            }

            // Click inside Level-2 Nested Submenu Flyout
            if (
              rawX >= subX &&
              rawX <= subX + subW &&
              rawY >= subY &&
              rawY <= subY + subH
            ) {
              const leafIdx = Math.max(
                1,
                Math.min(4, Math.floor((rawY - (subY + 27)) / 28) + 1)
              );
              onUpdateObject(
                nestedMenuTarget.id,
                {
                  params: {
                    ...nestedMenuTarget.params,
                    hasNestedMenu: true,
                    selectedLeafIndex: leafIdx,
                  },
                },
                false
              );
              setPreviewActiveObjectId(nestedMenuTarget.id);
              return;
            }

            // Clicking outside an open navbar dropdown closes it cleanly
            onUpdateObject(
              nestedMenuTarget.id,
              {
                params: {
                  ...nestedMenuTarget.params,
                  openMenuIndex: 0,
                  openSubMenuIndex: 0,
                },
              },
              false
            );
          }
        } else {
          // Sidebar Nested Menu (both High-Fidelity Vector Sidebars and AutoShape Sidebars):
          // clicking inside an open Sidebar Nested Submenu flyout selects the branch item;
          // clicking inside sidebar nav items toggles the sidebar flyout submenu in Preview Mode!
          const curOpen = Number(nestedMenuTarget.params?.openMenuIndex ?? 0);
          const flyX = navX + nestedMenuTarget.width + 6;
          const flyY = navY + 42;
          const flyW = 202;
          const flyH = 142;

          if (
            curOpen > 0 &&
            rawX >= flyX &&
            rawX <= flyX + flyW &&
            rawY >= flyY &&
            rawY <= flyY + flyH
          ) {
            const leafIdx = Math.max(
              1,
              Math.min(4, Math.floor((rawY - (flyY + 27)) / 27) + 1)
            );
            onUpdateObject(
              nestedMenuTarget.id,
              {
                params: {
                  ...nestedMenuTarget.params,
                  hasNestedMenu: true,
                  selectedLeafIndex: leafIdx,
                },
              },
              false
            );
            setPreviewActiveObjectId(nestedMenuTarget.id);
            return;
          }

          if (nestedMenuTarget.type !== 'autoshape') {
            if (
              rawX >= navX &&
              rawX <= navX + nestedMenuTarget.width &&
              rawY >= navY + 64 &&
              rawY <= navY + 300
            ) {
              const clickedRow = Math.max(1, Math.min(6, Math.floor((rawY - (navY + 64)) / 38) + 1));
              const nextOpen = curOpen === clickedRow ? 0 : clickedRow;
              onUpdateObject(
                nestedMenuTarget.id,
                {
                  params: {
                    ...nestedMenuTarget.params,
                    hasNestedMenu: true,
                    activeItem: clickedRow,
                    openMenuIndex: nextOpen,
                  },
                },
                false
              );
              setPreviewActiveObjectId(nestedMenuTarget.id);
              return;
            } else if (curOpen > 0) {
              onUpdateObject(
                nestedMenuTarget.id,
                {
                  params: {
                    ...nestedMenuTarget.params,
                    openMenuIndex: 0,
                  },
                },
                false
              );
            }
          } else if (
            curOpen > 0 &&
            (rawX < navX ||
              rawX > navX + nestedMenuTarget.width ||
              rawY < navY ||
              rawY > navY + nestedMenuTarget.height)
          ) {
            onUpdateObject(
              nestedMenuTarget.id,
              {
                params: {
                  ...nestedMenuTarget.params,
                  openMenuIndex: 0,
                },
              },
              false
            );
          }
        }
      }

      const clicked = [...objects]
        .reverse()
        .find((o) => {
          if (!o.visible) return false;
          const off = containerReflowOffsets.get(o.id) || { dx: 0, dy: 0 };
          const ox = o.x + off.dx;
          const oy = o.y + off.dy;
          return rawX >= ox && rawX <= ox + o.width && rawY >= oy && rawY <= oy + o.height;
        });
      setPreviewActiveObjectId(clicked ? clicked.id : null);

      if (clicked && clicked.type === 'autoshape') {
        const asObj = clicked as AutoShapeObject;
        const off = containerReflowOffsets.get(asObj.id) || { dx: 0, dy: 0 };
        const def = autoShapes.find((d) => d.id === asObj.shapeDefId) || autoShapes[0];
        if (def) {
          const localX = rawX - (asObj.x + off.dx);
          const localY = rawY - (asObj.y + off.dy);
          const res = interactAutoShapeInPreview(
            def,
            localX,
            localY,
            asObj.width,
            asObj.height,
            asObj.params,
            asObj.customCode,
            false
          );
          if (res.changed) {
            onRecordHistorySnapshot();
            onUpdateObject(asObj.id, { params: res.params }, false);
          }
          interactionRef.current = {
            mode: 'preview-scrub-autoshape',
            startCanvasX: rawX,
            startCanvasY: rawY,
            currentCanvasX: rawX,
            currentCanvasY: rawY,
            startClientX: e.clientX,
            startClientY: e.clientY,
            targetObjectId: asObj.id,
          };
        }
      }
      return;
    }

    if (activeTool === 'eyedropper') {
      onUpdateToolOptions({ primaryColor: hoveredPixelHex });
      return;
    }

    // Lucidchart-Style Magnetic Connection Port Dragging (from Pointer, AutoShape, or Smart Connector Tool)
    if (
      activeTool === 'pointer' ||
      activeTool === 'connector' ||
      activeTool === 'autoshape'
    ) {
      const hitPort = hitTestConnectionPort(rawX, rawY);
      if (hitPort) {
        onRecordHistorySnapshot();
        interactionRef.current = {
          mode: 'draw-connector',
          startCanvasX: hitPort.x,
          startCanvasY: hitPort.y,
          currentCanvasX: rawX,
          currentCanvasY: rawY,
          startClientX: e.clientX,
          startClientY: e.clientY,
          fromObjectId: hitPort.obj.id,
          fromPort: hitPort.port,
        };
        return;
      }

      // If Smart Connector tool (X) is active and user clicks anywhere inside a shape, start from its nearest port
      if (activeTool === 'connector') {
        const hitShape = [...objects]
          .reverse()
          .find(
            (o) =>
              o.visible &&
              !o.locked &&
              !(o.type === 'vector-path' && (o as VectorPathObject).connectorMeta) &&
              rawX >= o.x &&
              rawX <= o.x + o.width &&
              rawY >= o.y &&
              rawY <= o.y + o.height
          );
        if (hitShape) {
          const allPorts = getAllObjectPorts(hitShape);
          let nearest = allPorts[0];
          let minD = Infinity;
          for (const p of allPorts) {
            const d = Math.hypot(rawX - p.x, rawY - p.y);
            if (d < minD) {
              minD = d;
              nearest = p;
            }
          }
          onRecordHistorySnapshot();
          interactionRef.current = {
            mode: 'draw-connector',
            startCanvasX: nearest.x,
            startCanvasY: nearest.y,
            currentCanvasX: rawX,
            currentCanvasY: rawY,
            startClientX: e.clientX,
            startClientY: e.clientY,
            fromObjectId: hitShape.id,
            fromPort: nearest.port,
          };
          return;
        }
      }
    }

    // Diamond AutoShape Control Handle
    if (activeTool === 'pointer' || activeTool === 'subselect' || activeTool === 'autoshape') {
      const hitDiamond = hitTestAutoShapeControlHandle(rawX, rawY);
      if (hitDiamond) {
        onRecordHistorySnapshot();
        interactionRef.current = {
          mode: 'drag-autoshape-handle',
          startCanvasX: rawX,
          startCanvasY: rawY,
          currentCanvasX: rawX,
          currentCanvasY: rawY,
          startClientX: e.clientX,
          startClientY: e.clientY,
          targetObjectId: hitDiamond.obj.id,
          controlPointId: hitDiamond.cp.id,
        };
        return;
      }
    }

    // Subselection Tool (A): Direct Cubic Bezier Node & Handle Manipulation
    if (activeTool === 'subselect') {
      const hitNode = hitTestBezierSubselection(rawX, rawY);
      if (hitNode) {
        onRecordHistorySnapshot();
        if (!selectedIds.includes(hitNode.obj.id)) {
          onSelectObjects([hitNode.obj.id]);
        }
        onSelectNodes([hitNode.node.id]);
        const initialMap = new Map<string, CanvasObject>();
        initialMap.set(hitNode.obj.id, JSON.parse(JSON.stringify(hitNode.obj)));
        interactionRef.current = {
          mode:
            hitNode.part === 'cp1'
              ? 'drag-bezier-cp1'
              : hitNode.part === 'cp2'
              ? 'drag-bezier-cp2'
              : 'drag-bezier-node',
          startCanvasX: rawX,
          startCanvasY: rawY,
          currentCanvasX: rawX,
          currentCanvasY: rawY,
          startClientX: e.clientX,
          startClientY: e.clientY,
          targetObjectId: hitNode.obj.id,
          nodeId: hitNode.node.id,
          initialObjectsMap: initialMap,
        };
        return;
      }

      const clickedObj = [...objects]
        .reverse()
        .find(
          (o) =>
            o.visible &&
            !o.locked &&
            rawX >= o.x &&
            rawX <= o.x + o.width &&
            rawY >= o.y &&
            rawY <= o.y + o.height
        );
      if (clickedObj) {
        onSelectObjects([clickedObj.id]);
        onSelectNodes([]);
      } else {
        onSelectObjects([]);
        onSelectNodes([]);
      }
      return;
    }

    // Web Slice Tool (K) or Slice Resize Handles in Pointer/Scale/Slice/Crop modes
    if (
      activeTool === 'pointer' ||
      activeTool === 'select-behind' ||
      activeTool === 'scale' ||
      activeTool === 'slice' ||
      activeTool === 'crop'
    ) {
      const hitSliceHandle = hitTestSliceResizeHandles(rawX, rawY);
      if (hitSliceHandle) {
        onSelectSlice?.(hitSliceHandle.slice.id);
        onSelectObjects([]);
        interactionRef.current = {
          mode: 'resize-slice',
          startCanvasX: x,
          startCanvasY: y,
          currentCanvasX: x,
          currentCanvasY: y,
          startClientX: e.clientX,
          startClientY: e.clientY,
          targetSliceId: hitSliceHandle.slice.id,
          initialSlice: { ...hitSliceHandle.slice },
          handle: hitSliceHandle.handle,
        };
        return;
      }
    }

    // Dedicated Web Slice Tool (K): Click/drag inside any slice to select & move it, or drag on empty space to draw a new slice
    if (activeTool === 'slice') {
      const hitExistingSlice = hitTestSlice(rawX, rawY, true);
      if (hitExistingSlice) {
        onSelectSlice?.(hitExistingSlice.id);
        onSelectObjects([]);
        interactionRef.current = {
          mode: 'move-slice',
          startCanvasX: x,
          startCanvasY: y,
          currentCanvasX: x,
          currentCanvasY: y,
          startClientX: e.clientX,
          startClientY: e.clientY,
          targetSliceId: hitExistingSlice.id,
          initialSlice: { ...hitExistingSlice },
        };
        return;
      }

      onSelectSlice?.(null);
      onSelectObjects([]);
      interactionRef.current = {
        mode: 'draw-slice',
        startCanvasX: Math.max(0, x),
        startCanvasY: Math.max(0, y),
        currentCanvasX: Math.max(0, x),
        currentCanvasY: Math.max(0, y),
        startClientX: e.clientX,
        startClientY: e.clientY,
      };
      return;
    }

    // Pointer (V), Select Behind, or Scale (Q) Tool
    if (activeTool === 'pointer' || activeTool === 'select-behind' || activeTool === 'scale') {
      // Check resize / rotate handles FIRST so bitmap/object handles always work cleanly
      const hitHandle = hitTestResizeHandles(rawX, rawY);
      if (hitHandle) {
        onSelectSlice?.(null);
        onRecordHistorySnapshot();
        const initialMap = new Map<string, CanvasObject>();
        initialMap.set(hitHandle.obj.id, JSON.parse(JSON.stringify(hitHandle.obj)));
        interactionRef.current = {
          mode: hitHandle.handle === 'rotate' ? 'rotate-object' : 'resize-object',
          startCanvasX: x,
          startCanvasY: y,
          currentCanvasX: x,
          currentCanvasY: y,
          startClientX: e.clientX,
          startClientY: e.clientY,
          targetObjectId: hitHandle.obj.id,
          handle: hitHandle.handle,
          initialObjectsMap: initialMap,
          isShiftConstrained: e.shiftKey,
        };
        return;
      }

      // Check if clicking a Web Slice header badge (#SLICE: ...) or border edge with Pointer Tool
      const hitSliceBadgeOrEdge = hitTestSlice(rawX, rawY, false);
      if (hitSliceBadgeOrEdge) {
        onSelectSlice?.(hitSliceBadgeOrEdge.id);
        onSelectObjects([]);
        interactionRef.current = {
          mode: 'move-slice',
          startCanvasX: x,
          startCanvasY: y,
          currentCanvasX: x,
          currentCanvasY: y,
          startClientX: e.clientX,
          startClientY: e.clientY,
          targetSliceId: hitSliceBadgeOrEdge.id,
          initialSlice: { ...hitSliceBadgeOrEdge },
        };
        return;
      }

      // Check if dragging inside an active Bitmap Pixel Selection (Marching Ants) -> Float & Move Pixels!
      if (pixelSelection.active && isPointInPixelSelection(pixelSelection, rawX, rawY)) {
        onSelectSlice?.(null);
        onRecordHistorySnapshot();
        const bmp = ensureTargetBitmapObject();
        let activeSel = pixelSelection;
        if (!activeSel.floatingPixels) {
          const floated = await floatSelectedPixels(bmp, activeSel, e.altKey);
          onUpdateObject(bmp.id, floated.updatedBitmap, false);
          activeSel = floated.updatedSelection;
          onUpdatePixelSelection(activeSel);
        }
        if (activeSel.floatingPixels) {
          interactionRef.current = {
            mode: 'move-floating-pixels',
            startCanvasX: Math.round(rawX),
            startCanvasY: Math.round(rawY),
            currentCanvasX: Math.round(rawX),
            currentCanvasY: Math.round(rawY),
            startClientX: e.clientX,
            startClientY: e.clientY,
            targetObjectId: bmp.id,
            floatingStart: { x: activeSel.floatingPixels.x, y: activeSel.floatingPixels.y },
          };
          return;
        }
      }

      // Hit-test objects at cursor (ignoring transparent cut-out regions on bitmaps)
      const hits = [...objects]
        .reverse()
        .filter(
          (o) =>
            o.visible &&
            !o.locked &&
            rawX >= o.x &&
            rawX <= o.x + o.width &&
            rawY >= o.y &&
            rawY <= o.y + o.height &&
            (o.type !== 'bitmap' || isBitmapOpaqueAtCanvasPointSync(o as BitmapObject, rawX, rawY))
        );

      if (hits.length > 0) {
        onSelectSlice?.(null);
        let targetObj = hits[0];
        if (activeTool === 'select-behind') {
          const idx = selectBehindCycleIndex % hits.length;
          targetObj = hits[idx];
          setSelectBehindCycleIndex((prev) => prev + 1);
        } else {
          setSelectBehindCycleIndex(0);
        }

        let nextSelected = selectedIds;
        if (e.shiftKey) {
          nextSelected = selectedIds.includes(targetObj.id)
            ? selectedIds.filter((id) => id !== targetObj.id)
            : [...selectedIds, targetObj.id];
          onSelectObjects(nextSelected);
        } else if (!selectedIds.includes(targetObj.id)) {
          nextSelected = [targetObj.id];
          onSelectObjects(nextSelected);
        }

        onRecordHistorySnapshot();
        const initialMap = new Map<string, CanvasObject>();
        if (e.altKey) {
          // Alt+Drag (Option+Drag): Duplicate selected objects on canvas and drag the clones
          const clonedIds: string[] = [];
          const nowStamp = Date.now();
          objects.forEach((o, idx) => {
            if (nextSelected.includes(o.id)) {
              const clone: CanvasObject = JSON.parse(JSON.stringify(o));
              clone.id = `${o.id}-dup-${nowStamp}-${idx}`;
              clone.name = `${o.name} Copy`;
              onAddObject(clone);
              clonedIds.push(clone.id);
              initialMap.set(clone.id, clone);
            }
          });
          if (clonedIds.length > 0) {
            onSelectObjects(clonedIds);
          }
        } else {
          objects.forEach((o) => {
            if (nextSelected.includes(o.id)) {
              initialMap.set(o.id, JSON.parse(JSON.stringify(o)));
            }
          });
        }

        interactionRef.current = {
          mode: 'move-objects',
          startCanvasX: x,
          startCanvasY: y,
          currentCanvasX: x,
          currentCanvasY: y,
          startClientX: e.clientX,
          startClientY: e.clientY,
          initialObjectsMap: initialMap,
        };
      } else {
        // No object underneath: check if clicking inside a Web Slice interior
        const hitSliceInterior = hitTestSlice(rawX, rawY, true);
        if (hitSliceInterior) {
          onSelectSlice?.(hitSliceInterior.id);
          onSelectObjects([]);
          interactionRef.current = {
            mode: 'move-slice',
            startCanvasX: x,
            startCanvasY: y,
            currentCanvasX: x,
            currentCanvasY: y,
            startClientX: e.clientX,
            startClientY: e.clientY,
            targetSliceId: hitSliceInterior.id,
            initialSlice: { ...hitSliceInterior },
          };
          return;
        }

        onSelectSlice?.(null);
        if (!e.shiftKey) {
          onSelectObjects([]);
        }
        interactionRef.current = {
          mode: 'marquee-select-objects',
          startCanvasX: rawX,
          startCanvasY: rawY,
          currentCanvasX: rawX,
          currentCanvasY: rawY,
          startClientX: e.clientX,
          startClientY: e.clientY,
        };
      }
      return;
    }

    // Bitmap Selection Tools
    if (activeTool === 'marquee-rect' || activeTool === 'marquee-oval') {
      if (
        !e.shiftKey &&
        !e.altKey &&
        toolOptions.selectionOperation === 'new' &&
        pixelSelection.active &&
        isPointInPixelSelection(pixelSelection, rawX, rawY)
      ) {
        onRecordHistorySnapshot();
        const bmp = ensureTargetBitmapObject();
        let activeSel = pixelSelection;
        if (!activeSel.floatingPixels) {
          const floated = await floatSelectedPixels(bmp, activeSel, false);
          onUpdateObject(bmp.id, floated.updatedBitmap, false);
          activeSel = floated.updatedSelection;
          onUpdatePixelSelection(activeSel);
        }
        if (activeSel.floatingPixels) {
          interactionRef.current = {
            mode: 'move-floating-pixels',
            startCanvasX: Math.round(rawX),
            startCanvasY: Math.round(rawY),
            currentCanvasX: Math.round(rawX),
            currentCanvasY: Math.round(rawY),
            startClientX: e.clientX,
            startClientY: e.clientY,
            targetObjectId: bmp.id,
            floatingStart: { x: activeSel.floatingPixels.x, y: activeSel.floatingPixels.y },
          };
          return;
        }
      }

      if (pixelSelection.floatingPixels) {
        const bmp = ensureTargetBitmapObject();
        const committed = await commitFloatingPixels(bmp, pixelSelection);
        onUpdateObject(bmp.id, committed.updatedBitmap, false);
        onUpdatePixelSelection(committed.updatedSelection);
      }

      interactionRef.current = {
        mode: activeTool === 'marquee-rect' ? 'pixel-marquee-rect' : 'pixel-marquee-oval',
        startCanvasX: Math.round(rawX),
        startCanvasY: Math.round(rawY),
        currentCanvasX: Math.round(rawX),
        currentCanvasY: Math.round(rawY),
        startClientX: e.clientX,
        startClientY: e.clientY,
      };
      return;
    }

    if (activeTool === 'lasso') {
      interactionRef.current = {
        mode: 'pixel-lasso',
        startCanvasX: Math.round(rawX),
        startCanvasY: Math.round(rawY),
        currentCanvasX: Math.round(rawX),
        currentCanvasY: Math.round(rawY),
        startClientX: e.clientX,
        startClientY: e.clientY,
        lassoPoints: [{ x: Math.round(rawX), y: Math.round(rawY) }],
      };
      return;
    }

    if (activeTool === 'magic-wand') {
      const bmp = ensureTargetBitmapObject();
      onSelectObjects([bmp.id]);
      const op = e.shiftKey
        ? 'add'
        : e.altKey
        ? 'subtract'
        : toolOptions.selectionOperation;
      const wandSel = await buildMagicWandSelection(
        bmp,
        Math.round(rawX),
        Math.round(rawY),
        gridSettings.canvasWidth,
        gridSettings.canvasHeight,
        toolOptions.wandTolerance,
        toolOptions.wandContiguous,
        pixelSelection,
        op,
        toolOptions.selectionFeather
      );
      onUpdatePixelSelection(wandSel);
      return;
    }

    // Paint Bucket Tool (G): Recolor clicked AutoShape / Vector / Text object OR flood-fill Bitmap
    if (activeTool === 'bucket') {
      const hitTopObj = [...objects]
        .reverse()
        .find(
          (o) =>
            o.visible &&
            !o.locked &&
            rawX >= o.x &&
            rawX <= o.x + o.width &&
            rawY >= o.y &&
            rawY <= o.y + o.height
        );

      if (
        hitTopObj &&
        (hitTopObj.type === 'autoshape' ||
          hitTopObj.type === 'vector-path' ||
          hitTopObj.type === 'text')
      ) {
        onRecordHistorySnapshot();
        onSelectObjects([hitTopObj.id]);
        if (e.altKey) {
          onUpdateObject(
            hitTopObj.id,
            {
              stroke: toolOptions.secondaryColor,
              strokeWidth: Math.max(1, hitTopObj.strokeWidth || 2),
            },
            false
          );
        } else {
          const nextFill = toolOptions.primaryColor;
          const patch: Partial<CanvasObject> = {
            fill: nextFill,
            fillType: hitTopObj.fillType === 'none' ? 'solid' : hitTopObj.fillType,
          };
          if (
            hitTopObj.fillType === 'linear-gradient' ||
            hitTopObj.fillType === 'radial-gradient'
          ) {
            patch.fillGradientEnd = shiftHexBrightness(nextFill, -26);
          }
          onUpdateObject(hitTopObj.id, patch, false);
        }
        return;
      }

      onRecordHistorySnapshot();
      const bmp = ensureTargetBitmapObject();
      onSelectObjects([bmp.id]);
      const filled = await floodFillOnBitmap(
        bmp,
        Math.round(rawX),
        Math.round(rawY),
        toolOptions.primaryColor,
        toolOptions.wandTolerance,
        pixelSelection
      );
      onUpdateObject(bmp.id, filled, false);
      return;
    }

    if (activeTool === 'brush' || activeTool === 'pencil' || activeTool === 'eraser') {
      onRecordHistorySnapshot();
      const bmp = ensureTargetBitmapObject();
      onSelectObjects([bmp.id]);
      const pt = { x: Math.round(rawX), y: Math.round(rawY) };
      const updated = await paintBitmapStroke(bmp, pt, pt, activeTool, toolOptions, pixelSelection);
      onUpdateObject(bmp.id, updated, false);
      interactionRef.current = {
        mode: 'bitmap-paint',
        startCanvasX: pt.x,
        startCanvasY: pt.y,
        currentCanvasX: pt.x,
        currentCanvasY: pt.y,
        startClientX: e.clientX,
        startClientY: e.clientY,
        targetObjectId: bmp.id,
        lastPaintPoint: pt,
      };
      return;
    }

    // Cubic Bezier Pen Tool (P)
    if (activeTool === 'pen') {
      onRecordHistorySnapshot();
      const existingPenObj = activePenObjectId
        ? (objects.find((o) => o.id === activePenObjectId && o.type === 'vector-path') as
            | VectorPathObject
            | undefined)
        : undefined;

      if (!existingPenObj) {
        const newId = `vec-pen-${Date.now()}`;
        const firstNode: BezierNode = {
          id: `node-${Date.now()}`,
          x: 0,
          y: 0,
          cp1x: 0,
          cp1y: 0,
          cp2x: 0,
          cp2y: 0,
          pointType: 'corner',
        };
        const newVec: VectorPathObject = {
          id: newId,
          name: 'Bezier Pen Path',
          type: 'vector-path',
          visible: true,
          locked: false,
          x,
          y,
          width: 1,
          height: 1,
          rotation: 0,
          opacity: 1,
          blendMode: 'source-over',
          fill: toolOptions.primaryColor,
          fillType: 'none',
          fillGradientEnd: '#525252',
          stroke: toolOptions.secondaryColor,
          strokeWidth: toolOptions.defaultStrokeWidth || 2,
          strokeAlign: 'center',
          pixelSnap: toolOptions.defaultPixelSnap,
          shadow: { enabled: false, color: 'rgba(0,0,0,0.4)', blur: 8, offsetX: 0, offsetY: 4 },
          nodes: [firstNode],
          closed: false,
        };
        onAddObject(newVec);
        onSelectObjects([newId]);
        onSelectNodes([firstNode.id]);
        setActivePenObjectId(newId);
        interactionRef.current = {
          mode: 'draw-pen-handle',
          startCanvasX: x,
          startCanvasY: y,
          currentCanvasX: x,
          currentCanvasY: y,
          startClientX: e.clientX,
          startClientY: e.clientY,
          targetObjectId: newId,
          nodeId: firstNode.id,
        };
      } else {
        const firstNode = existingPenObj.nodes[0];
        const firstWorldX = existingPenObj.x + firstNode.x;
        const firstWorldY = existingPenObj.y + firstNode.y;
        if (
          existingPenObj.nodes.length >= 2 &&
          Math.hypot(x - firstWorldX, y - firstWorldY) <= 10 / gridSettings.zoom
        ) {
          onUpdateObject(existingPenObj.id, {
            closed: true,
            fillType: 'solid',
          });
          setActivePenObjectId(null);
          return;
        }

        const newNodeId = `node-${Date.now()}`;
        const localX = x - existingPenObj.x;
        const localY = y - existingPenObj.y;
        const newNode: BezierNode = {
          id: newNodeId,
          x: localX,
          y: localY,
          cp1x: localX,
          cp1y: localY,
          cp2x: localX,
          cp2y: localY,
          pointType: 'corner',
        };
        const nextNodes = [...existingPenObj.nodes, newNode];
        const xs = nextNodes.map((n) => existingPenObj.x + n.x);
        const ys = nextNodes.map((n) => existingPenObj.y + n.y);
        const maxW = Math.max(1, Math.max(...xs) - existingPenObj.x);
        const maxH = Math.max(1, Math.max(...ys) - existingPenObj.y);

        onUpdateObject(existingPenObj.id, {
          nodes: nextNodes,
          width: Math.max(existingPenObj.width, maxW),
          height: Math.max(existingPenObj.height, maxH),
        });
        onSelectNodes([newNodeId]);
        interactionRef.current = {
          mode: 'draw-pen-handle',
          startCanvasX: x,
          startCanvasY: y,
          currentCanvasX: x,
          currentCanvasY: y,
          startClientX: e.clientX,
          startClientY: e.clientY,
          targetObjectId: existingPenObj.id,
          nodeId: newNodeId,
        };
      }
      return;
    }

    // Text Tool (T)
    if (activeTool === 'text') {
      onRecordHistorySnapshot();
      const newTxt: TextObject = {
        id: `txt-${Date.now()}`,
        name: 'UI Text Layer',
        type: 'text',
        visible: true,
        locked: false,
        x,
        y,
        width: 220,
        height: 36,
        rotation: 0,
        opacity: 1,
        blendMode: 'source-over',
        fill: toolOptions.primaryColor,
        fillType: 'solid',
        fillGradientEnd: '#ffffff',
        stroke: 'none',
        strokeWidth: 0,
        strokeAlign: 'center',
        pixelSnap: true,
        shadow: { enabled: false, color: '#000000', blur: 0, offsetX: 0, offsetY: 0 },
        text: 'Pixel-Perfect Heading',
        fontFamily: 'Inter',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'left',
        letterSpacing: 0,
      };
      onAddObject(newTxt);
      onSelectObjects([newTxt.id]);
      onSelectTool('pointer');
      return;
    }

    // Crop Canvas Tool (C)
    if (activeTool === 'crop') {
      interactionRef.current = {
        mode: 'crop-canvas',
        startCanvasX: Math.max(0, x),
        startCanvasY: Math.max(0, y),
        currentCanvasX: Math.max(0, x),
        currentCanvasY: Math.max(0, y),
        startClientX: e.clientX,
        startClientY: e.clientY,
      };
      return;
    }

    // Vector Shapes & JS AutoShape Tool
    if (
      activeTool === 'line' ||
      activeTool === 'rect' ||
      activeTool === 'ellipse' ||
      activeTool === 'autoshape'
    ) {
      onRecordHistorySnapshot();
      const newId = `obj-${Date.now()}`;
      let createdObj: CanvasObject;

      if (activeTool === 'autoshape') {
        const def =
          autoShapes.find((d) => d.id === toolOptions.activeAutoShapeId) || autoShapes[0];
        createdObj = {
          id: newId,
          name: `${def.name} (JS)`,
          type: 'autoshape',
          shapeDefId: def.id,
          visible: true,
          locked: false,
          x,
          y,
          width: 8,
          height: 8,
          rotation: 0,
          opacity: 1,
          blendMode: 'source-over',
          fill: toolOptions.primaryColor,
          fillType: 'solid',
          fillGradientEnd: '#525252',
          stroke: toolOptions.secondaryColor,
          strokeWidth: toolOptions.defaultStrokeWidth,
          strokeAlign: 'center',
          pixelSnap: toolOptions.defaultPixelSnap,
          shadow: { enabled: false, color: 'rgba(0,0,0,0.4)', blur: 10, offsetX: 0, offsetY: 4 },
          params: { ...def.defaultParams },
        };
      } else {
        createdObj = {
          id: newId,
          name:
            activeTool === 'rect'
              ? 'Vector Rectangle'
              : activeTool === 'ellipse'
              ? 'Vector Ellipse'
              : 'Vector Line',
          type: 'vector-path',
          visible: true,
          locked: false,
          x,
          y,
          width: 4,
          height: 4,
          rotation: 0,
          opacity: 1,
          blendMode: 'source-over',
          fill: activeTool === 'line' ? 'none' : toolOptions.primaryColor,
          fillType: activeTool === 'line' ? 'none' : 'solid',
          fillGradientEnd: '#525252',
          stroke: toolOptions.secondaryColor,
          strokeWidth: Math.max(1, toolOptions.defaultStrokeWidth),
          strokeAlign: 'center',
          pixelSnap: toolOptions.defaultPixelSnap,
          shadow: { enabled: false, color: 'rgba(0,0,0,0.4)', blur: 8, offsetX: 0, offsetY: 4 },
          closed: activeTool !== 'line',
          nodes: [
            { id: 'n1', x: 0, y: 0, cp1x: 0, cp1y: 0, cp2x: 0, cp2y: 0, pointType: 'corner' },
            { id: 'n2', x: 4, y: 4, cp1x: 4, cp1y: 4, cp2x: 4, cp2y: 4, pointType: 'corner' },
          ],
        };
      }

      onAddObject(createdObj);
      onSelectObjects([newId]);
      interactionRef.current = {
        mode: 'draw-shape',
        startCanvasX: x,
        startCanvasY: y,
        currentCanvasX: x,
        currentCanvasY: y,
        startClientX: e.clientX,
        startClientY: e.clientY,
        targetObjectId: newId,
      };
    }
  };

  // Mouse Move Handler
  const handleMouseMove = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y, rawX, rawY } = clientToCanvasCoords(e.clientX, e.clientY, true);
    setCursorCoords({ x: Math.round(rawX), y: Math.round(rawY) });

    if (activeTool === 'eyedropper' && viewportCanvasRef.current) {
      const canvasEl = viewportCanvasRef.current;
      const rect = canvasEl.getBoundingClientRect();
      const ctx = canvasEl.getContext('2d');
      if (ctx && canvasEl.width > 0 && canvasEl.height > 0) {
        const dpr = window.devicePixelRatio || 1;
        const px = Math.max(
          0,
          Math.min(canvasEl.width - 1, Math.round((e.clientX - rect.left) * dpr))
        );
        const py = Math.max(
          0,
          Math.min(canvasEl.height - 1, Math.round((e.clientY - rect.top) * dpr))
        );
        const data = ctx.getImageData(px, py, 1, 1).data;
        const hex = `#${[data[0], data[1], data[2]]
          .map((v) => v.toString(16).padStart(2, '0'))
          .join('')}`;
        setHoveredPixelHex(hex);
      }
    }

    const drag = interactionRef.current;
    if (!drag) {
      if (isPreviewMode) {
        let hoveredMenuTargetId: string | null = null;
        const nestedMenuTargets = [...objects]
          .reverse()
          .filter((o) => {
            if (!o.visible) return false;
            if (o.type === 'autoshape') {
              const ao = o as AutoShapeObject;
              return (
                ao.shapeDefId !== 'ui-dropdown-select' &&
                ao.shapeDefId !== 'layout-mega-menu' &&
                Boolean(
                  ao.params?.hasNestedMenu ||
                    ao.shapeDefId === 'layout-sticky-navbar' ||
                    ao.name.toLowerCase().includes('navbar')
                )
              );
            }
            return Boolean(o.params?.hasNestedMenu);
          });

        for (const nestedMenuTarget of nestedMenuTargets) {
          const isSidebar =
            (nestedMenuTarget.type === 'autoshape' &&
              ((nestedMenuTarget as AutoShapeObject).shapeDefId === 'layout-sidebar-shell' ||
                (nestedMenuTarget as AutoShapeObject).shapeDefId === 'sitemap-navigation-tree')) ||
            nestedMenuTarget.height > nestedMenuTarget.width * 1.1;
          const navOff = containerReflowOffsets.get(nestedMenuTarget.id) || { dx: 0, dy: 0 };
          const navX = nestedMenuTarget.x + navOff.dx;
          const navY = nestedMenuTarget.y + navOff.dy;

          if (!isSidebar) {
            const navStartX = navX + Math.round(nestedMenuTarget.width * 0.22);
            const navSpanW = Math.round(nestedMenuTarget.width * 0.54);
            const itemW = Math.max(52, Math.floor(navSpanW / 4));
            const currentOpenMenu = Number(nestedMenuTarget.params?.openMenuIndex ?? 0);
            if (
              rawY >= navY &&
              rawY <= navY + nestedMenuTarget.height &&
              rawX >= navStartX &&
              rawX <= navStartX + itemW * 4
            ) {
              hoveredMenuTargetId = nestedMenuTarget.id;
              // When a dropdown menu is already open, hovering across sibling top-level navbar tabs switches the active floating dropdown live (just like a real website)
              if (currentOpenMenu > 0) {
                const hoveredTopIdx = Math.max(
                  1,
                  Math.min(4, Math.floor((rawX - navStartX) / itemW) + 1)
                );
                if (hoveredTopIdx !== currentOpenMenu) {
                  onUpdateObject(
                    nestedMenuTarget.id,
                    {
                      params: {
                        ...nestedMenuTarget.params,
                        hasNestedMenu: true,
                        activeTab: hoveredTopIdx,
                        activeLink: hoveredTopIdx,
                        openMenuIndex: hoveredTopIdx,
                        openSubMenuIndex: 1,
                      },
                    },
                    false
                  );
                }
              }
              break;
            }
            if (currentOpenMenu > 0) {
              const activeMenuIdx = Math.max(0, Math.min(3, currentOpenMenu - 1));
              const menuX = Math.min(
                gridSettings.canvasWidth - 430,
                Math.max(12, navStartX + activeMenuIdx * itemW)
              );
              const menuY = navY + nestedMenuTarget.height + 4;
              const menuW = 216;
              const menuH = 152;
              const subX = menuX + menuW + 4;
              const subY = menuY;
              const subW = 208;
              const subH = 152;

              if (
                rawX >= menuX &&
                rawX <= menuX + menuW &&
                rawY >= menuY &&
                rawY <= menuY + menuH
              ) {
                hoveredMenuTargetId = nestedMenuTarget.id;
                if (rawY >= menuY + 24) {
                  const hoveredRowIdx = Math.max(
                    1,
                    Math.min(4, Math.floor((rawY - (menuY + 27)) / 30) + 1)
                  );
                  if (Number(nestedMenuTarget.params?.openSubMenuIndex ?? 1) !== hoveredRowIdx) {
                    onUpdateObject(
                      nestedMenuTarget.id,
                      {
                        params: {
                          ...nestedMenuTarget.params,
                          hasNestedMenu: true,
                          openSubMenuIndex: hoveredRowIdx,
                        },
                      },
                      false
                    );
                  }
                }
                break;
              }
              if (
                rawX >= subX &&
                rawX <= subX + subW &&
                rawY >= subY &&
                rawY <= subY + subH
              ) {
                hoveredMenuTargetId = nestedMenuTarget.id;
                break;
              }
            }
          } else {
            const curOpen = Number(nestedMenuTarget.params?.openMenuIndex ?? 0);
            const flyX = navX + nestedMenuTarget.width + 6;
            const flyY = navY + 42;
            const flyW = 202;
            const flyH = 142;
            if (
              curOpen > 0 &&
              rawX >= flyX &&
              rawX <= flyX + flyW &&
              rawY >= flyY &&
              rawY <= flyY + flyH
            ) {
              hoveredMenuTargetId = nestedMenuTarget.id;
              break;
            }
          }
        }

        const hovered = hoveredMenuTargetId
          ? objects.find((o) => o.id === hoveredMenuTargetId)
          : [...objects]
              .reverse()
              .find((o) => {
                if (!o.visible) return false;
                const off = containerReflowOffsets.get(o.id) || { dx: 0, dy: 0 };
                const ox = o.x + off.dx;
                const oy = o.y + off.dy;
                return rawX >= ox && rawX <= ox + o.width && rawY >= oy && rawY <= oy + o.height;
              });
        const nextPreviewId = hovered ? hovered.id : null;
        if (nextPreviewId !== previewHoverObjectId) {
          setPreviewHoverObjectId(nextPreviewId);
        }
        return;
      }

      if (!isSliceMode) {
        const portHit = hitTestConnectionPort(rawX, rawY);
        const nextPort = portHit ? { objectId: portHit.obj.id, port: portHit.port } : null;
        if (
          nextPort?.objectId !== hoveredPort?.objectId ||
          nextPort?.port !== hoveredPort?.port
        ) {
          setHoveredPort(nextPort);
        }

        const hoveredShape = [...objects]
          .reverse()
          .find(
            (o) =>
              o.visible &&
              !o.locked &&
              !(o.type === 'vector-path' && (o as VectorPathObject).connectorMeta) &&
              rawX >= o.x - 18 / gridSettings.zoom &&
              rawX <= o.x + o.width + 18 / gridSettings.zoom &&
              rawY >= o.y - 18 / gridSettings.zoom &&
              rawY <= o.y + o.height + 18 / gridSettings.zoom
          );
        const nextHoveredId = hoveredShape ? hoveredShape.id : null;
        if (nextHoveredId !== hoveredObjectId) {
          setHoveredObjectId(nextHoveredId);
        }
      }
      return;
    }

    drag.currentCanvasX = x;
    drag.currentCanvasY = y;

    if (drag.mode === 'preview-scrub-autoshape' && drag.targetObjectId) {
      const target = objects.find(
        (o) => o.id === drag.targetObjectId && o.type === 'autoshape'
      ) as AutoShapeObject | undefined;
      if (target) {
        const def = autoShapes.find((d) => d.id === target.shapeDefId) || autoShapes[0];
        if (def) {
          const off = containerReflowOffsets.get(target.id) || { dx: 0, dy: 0 };
          const localX = rawX - (target.x + off.dx);
          const localY = rawY - (target.y + off.dy);
          const res = interactAutoShapeInPreview(
            def,
            localX,
            localY,
            target.width,
            target.height,
            target.params,
            target.customCode,
            true
          );
          if (res.changed) {
            onUpdateObject(target.id, { params: res.params }, false);
          }
        }
      }
      return;
    }

    if (drag.mode === 'draw-connector' && drag.fromObjectId && drag.fromPort) {
      drag.currentCanvasX = rawX;
      drag.currentCanvasY = rawY;
      const sourceObj = objects.find((o) => o.id === drag.fromObjectId);
      let snapObjId: string | undefined;
      let snapPort: ConnectionPortId | undefined;
      const snapR = 16 / gridSettings.zoom;
      const outwardOffset = 14 / gridSettings.zoom;

      for (let i = objects.length - 1; i >= 0; i--) {
        const other = objects[i];
        if (
          other.id === drag.fromObjectId ||
          !other.visible ||
          other.locked ||
          (other.type === 'vector-path' && (other as VectorPathObject).connectorMeta)
        ) {
          continue;
        }
        const ports = getAllObjectPorts(other);
        for (const p of ports) {
          const handleX = p.x + p.nx * outwardOffset;
          const handleY = p.y + p.ny * outwardOffset;
          if (
            Math.hypot(rawX - p.x, rawY - p.y) <= snapR ||
            Math.hypot(rawX - handleX, rawY - handleY) <= snapR
          ) {
            snapObjId = other.id;
            snapPort = p.port;
            break;
          }
        }
        if (snapObjId) break;

        if (
          rawX >= other.x &&
          rawX <= other.x + other.width &&
          rawY >= other.y &&
          rawY <= other.y + other.height &&
          sourceObj
        ) {
          const pair = computeBestPortPair(sourceObj, other);
          snapObjId = other.id;
          snapPort = pair.toPort;
          break;
        }
      }

      drag.snapTargetObjectId = snapObjId;
      drag.snapTargetPort = snapPort;

      if (snapObjId && snapPort) {
        const targetObj = objects.find((o) => o.id === snapObjId);
        setResizeHudLabel(
          `SMART CONNECTOR • Link to "${targetObj?.name || 'Shape'}" (${snapPort.toUpperCase()} Port)`
        );
      } else {
        setResizeHudLabel(
          'SMART CONNECTOR • Drag to any shape port to link, or release on empty canvas to auto-spawn connected node'
        );
      }
      setRenderTick((t) => t + 1);
      return;
    }

    if (drag.mode === 'pan-canvas') {
      const dx = e.clientX - drag.startClientX;
      const dy = e.clientY - drag.startClientY;
      drag.startClientX = e.clientX;
      drag.startClientY = e.clientY;
      onUpdateGridSettings({
        panX: gridSettings.panX + dx,
        panY: gridSettings.panY + dy,
      });
      return;
    }

    // Move Web Slice on Canvas
    if (drag.mode === 'move-slice' && drag.targetSliceId && drag.initialSlice) {
      const dx = Math.round(x - drag.startCanvasX);
      const dy = Math.round(y - drag.startCanvasY);
      const nx = Math.max(0, Math.min(gridSettings.canvasWidth - 8, drag.initialSlice.x + dx));
      const ny = Math.max(0, Math.min(gridSettings.canvasHeight - 8, drag.initialSlice.y + dy));
      onUpdateSlice?.(drag.targetSliceId, { x: nx, y: ny });
      setResizeHudLabel(
        `SLICE MOVE • #${drag.initialSlice.name} • X:${nx} Y:${ny}px (${drag.initialSlice.width}×${drag.initialSlice.height}px)`
      );
      return;
    }

    // Resize Web Slice via 8 Bounding Handles on Canvas
    if (drag.mode === 'resize-slice' && drag.targetSliceId && drag.initialSlice && drag.handle) {
      const initS = drag.initialSlice;
      const dx = Math.round(x - drag.startCanvasX);
      const dy = Math.round(y - drag.startCanvasY);
      let nx = initS.x;
      let ny = initS.y;
      let nw = Math.max(8, initS.width);
      let nh = Math.max(8, initS.height);

      if (drag.handle.includes('e')) nw = Math.max(8, initS.width + dx);
      if (drag.handle.includes('s')) nh = Math.max(8, initS.height + dy);
      if (drag.handle.includes('w')) {
        const deltaW = Math.min(dx, initS.width - 8);
        nx = Math.max(0, initS.x + deltaW);
        nw = Math.max(8, initS.width - deltaW);
      }
      if (drag.handle.includes('n')) {
        const deltaH = Math.min(dy, initS.height - 8);
        ny = Math.max(0, initS.y + deltaH);
        nh = Math.max(8, initS.height - deltaH);
      }

      if (e.shiftKey) {
        const aspect = Math.max(1, initS.width) / Math.max(1, initS.height);
        nh = Math.max(8, Math.round(nw / aspect));
      }

      onUpdateSlice?.(drag.targetSliceId, { x: nx, y: ny, width: nw, height: nh });
      setResizeHudLabel(
        `SLICE RESIZE • #${initS.name} • ${nw}×${nh}px (X:${nx} Y:${ny})`
      );
      return;
    }

    if (drag.mode === 'move-objects' && drag.initialObjectsMap) {
      let dx = x - drag.startCanvasX;
      let dy = y - drag.startCanvasY;
      const activeGuides: SmartGuideLine[] = [];

      if (gridSettings.snapToObjects && drag.initialObjectsMap.size >= 1) {
        const movingIds = new Set(drag.initialObjectsMap.keys());
        const initObjs = Array.from(drag.initialObjectsMap.values());
        const groupMinX = Math.min(...initObjs.map((o) => o.x));
        const groupMinY = Math.min(...initObjs.map((o) => o.y));
        const groupMaxX = Math.max(...initObjs.map((o) => o.x + o.width));
        const groupMaxY = Math.max(...initObjs.map((o) => o.y + o.height));
        const groupW = Math.max(1, groupMaxX - groupMinX);
        const groupH = Math.max(1, groupMaxY - groupMinY);

        const candX = groupMinX + dx;
        const candY = groupMinY + dy;
        const snapThreshold = 5 / gridSettings.zoom;

        for (const other of objects) {
          if (movingIds.has(other.id) || !other.visible) continue;
          const xPairs = [
            { target: other.x, offset: 0 },
            { target: other.x + other.width / 2, offset: -groupW / 2 },
            { target: other.x + other.width, offset: -groupW },
          ];
          for (const p of xPairs) {
            if (Math.abs(candX - (p.target + p.offset)) <= snapThreshold) {
              dx = p.target + p.offset - groupMinX;
              activeGuides.push({
                orientation: 'vertical',
                position: Math.round(p.target),
                start: Math.min(candY, other.y),
                end: Math.max(candY + groupH, other.y + other.height),
                label: `${Math.round(p.target)}px`,
              });
              break;
            }
          }
          const yPairs = [
            { target: other.y, offset: 0 },
            { target: other.y + other.height / 2, offset: -groupH / 2 },
            { target: other.y + other.height, offset: -groupH },
          ];
          for (const p of yPairs) {
            if (Math.abs(candY - (p.target + p.offset)) <= snapThreshold) {
              dy = p.target + p.offset - groupMinY;
              activeGuides.push({
                orientation: 'horizontal',
                position: Math.round(p.target),
                start: Math.min(candX, other.x),
                end: Math.max(candX + groupW, other.x + other.width),
                label: `${Math.round(p.target)}px`,
              });
              break;
            }
          }
        }
      }
      setSmartGuides(activeGuides);

      drag.initialObjectsMap.forEach((initObj, id) => {
        const nx = gridSettings.snapToPixel ? Math.round(initObj.x + dx) : initObj.x + dx;
        const ny = gridSettings.snapToPixel ? Math.round(initObj.y + dy) : initObj.y + dy;
        onUpdateObject(id, { x: nx, y: ny }, false);
      });
      return;
    }

    // Fireworks MX Handle Scaling: Shift = Constrained Proportional Aspect Ratio | No Shift = Free Skew/Stretch
    if (drag.mode === 'resize-object' && drag.targetObjectId && drag.initialObjectsMap && drag.handle) {
      const initObj = drag.initialObjectsMap.get(drag.targetObjectId);
      if (!initObj) return;
      const rawDx = x - drag.startCanvasX;
      const rawDy = y - drag.startCanvasY;
      let dx = rawDx;
      let dy = rawDy;
      if (initObj.rotation && Number.isFinite(initObj.rotation)) {
        const rad = (-initObj.rotation * Math.PI) / 180;
        const cosA = Math.cos(rad);
        const sinA = Math.sin(rad);
        dx = rawDx * cosA - rawDy * sinA;
        dy = rawDx * sinA + rawDy * cosA;
      }

      const initW = Math.max(1, initObj.width);
      const initH = Math.max(1, initObj.height);
      const aspectRatio = initW / initH;

      let nx = initObj.x;
      let ny = initObj.y;
      let nw = initW;
      let nh = initH;

      // 1. Compute unconstrained free skew/stretch dimensions first
      if (drag.handle.includes('e')) nw = Math.max(4, initW + dx);
      if (drag.handle.includes('s')) nh = Math.max(4, initH + dy);
      if (drag.handle.includes('w')) {
        const deltaW = Math.min(dx, initW - 4);
        nx = initObj.x + deltaW;
        nw = initW - deltaW;
      }
      if (drag.handle.includes('n')) {
        const deltaH = Math.min(dy, initH - 4);
        ny = initObj.y + deltaH;
        nh = initH - deltaH;
      }

      // 2. If Shift is held: Lock/Constrain Aspect Ratio accurately from the opposite anchor point!
      if (e.shiftKey) {
        drag.isShiftConstrained = true;
        const isCorner =
          drag.handle === 'nw' ||
          drag.handle === 'ne' ||
          drag.handle === 'se' ||
          drag.handle === 'sw';

        if (isCorner) {
          const scaleX = nw / initW;
          const scaleY = nh / initH;
          // Use whichever axis was dragged further from 1.0
          const dominantScale =
            Math.abs(scaleX - 1) >= Math.abs(scaleY - 1) ? scaleX : scaleY;
          const clampedScale = Math.max(4 / Math.min(initW, initH), dominantScale);

          nw = Math.max(4, Math.round(initW * clampedScale));
          nh = Math.max(4, Math.round(initH * clampedScale));

          if (drag.handle.includes('w')) {
            nx = Math.round(initObj.x + initW - nw);
          }
          if (drag.handle.includes('n')) {
            ny = Math.round(initObj.y + initH - nh);
          }
        } else if (drag.handle === 'e' || drag.handle === 'w') {
          nh = Math.max(4, Math.round(nw / aspectRatio));
          ny = Math.round(initObj.y + (initH - nh) / 2);
          if (drag.handle === 'w') {
            nx = Math.round(initObj.x + initW - nw);
          }
        } else if (drag.handle === 'n' || drag.handle === 's') {
          nw = Math.max(4, Math.round(nh * aspectRatio));
          nx = Math.round(initObj.x + (initW - nw) / 2);
          if (drag.handle === 'n') {
            ny = Math.round(initObj.y + initH - nh);
          }
        }
        setResizeHudLabel(
          `CONSTRAINED (SHIFT) • ${Math.round(nw)}×${Math.round(nh)}px (${aspectRatio.toFixed(2)}:1)`
        );
      } else {
        drag.isShiftConstrained = false;
        setResizeHudLabel(
          `FREE SKEW / STRETCH • ${Math.round(nw)}×${Math.round(nh)}px (Hold Shift to Constrain)`
        );
      }

      if (initObj.type === 'vector-path') {
        const vecInit = initObj as VectorPathObject;
        const scaleX = nw / initW;
        const scaleY = nh / initH;
        const scaledNodes = vecInit.nodes.map((n) => ({
          ...n,
          x: n.x * scaleX,
          y: n.y * scaleY,
          cp1x: n.cp1x * scaleX,
          cp1y: n.cp1y * scaleY,
          cp2x: n.cp2x * scaleX,
          cp2y: n.cp2y * scaleY,
        }));
        onUpdateObject(
          initObj.id,
          { x: nx, y: ny, width: nw, height: nh, nodes: scaledNodes } as Partial<VectorPathObject>,
          false
        );
      } else if (initObj.type === 'text') {
        const txtInit = initObj as TextObject;
        let nextFontSize = txtInit.fontSize || 16;
        // When using the Scale tool (Q) with Shift held, scale fontSize proportionally with box
        if (activeTool === 'scale' && e.shiftKey) {
          nextFontSize = Math.max(8, Math.round(txtInit.fontSize * (nh / initH)));
        }
        // Measure wrapped text lines at the new block width (nw) so box height & alignment reflow cleanly
        const measureCtx = viewportCanvasRef.current?.getContext('2d');
        if (measureCtx) {
          measureCtx.save();
          measureCtx.font = `${txtInit.fontWeight || '600'} ${nextFontSize}px "${txtInit.fontFamily || 'Inter'}", sans-serif`;
          const wrapped = wrapTextToBoxWidth(measureCtx, txtInit.text || '', nw);
          measureCtx.restore();
          const lineHeight = nextFontSize * 1.3;
          const autoHeight = Math.max(Math.ceil(lineHeight), Math.ceil(wrapped.length * lineHeight + 4));
          // When dragging horizontal side handles (e/w), hug the reflowed line height; for corner/vertical handles, ensure box is at least autoHeight
          if (drag.handle === 'e' || drag.handle === 'w') {
            nh = autoHeight;
          } else {
            nh = Math.max(autoHeight, nh);
          }
          setResizeHudLabel(
            `TEXT REFLOW (${(txtInit.textAlign || 'left').toUpperCase()}) • ${Math.round(nw)}×${Math.round(nh)}px • ${wrapped.length} ${wrapped.length === 1 ? 'LINE' : 'LINES'}`
          );
        }
        onUpdateObject(
          initObj.id,
          { x: nx, y: ny, width: nw, height: nh, fontSize: nextFontSize } as Partial<TextObject>,
          false
        );
      } else {
        onUpdateObject(initObj.id, { x: nx, y: ny, width: nw, height: nh }, false);
      }
      return;
    }

    if (drag.mode === 'rotate-object' && drag.targetObjectId && drag.initialObjectsMap) {
      const initObj = drag.initialObjectsMap.get(drag.targetObjectId);
      if (!initObj) return;
      const cx = initObj.x + initObj.width / 2;
      const cy = initObj.y + initObj.height / 2;
      let angleDeg = ((Math.atan2(rawY - cy, rawX - cx) * 180) / Math.PI) + 90;
      if (e.shiftKey) {
        angleDeg = Math.round(angleDeg / 15) * 15;
      } else {
        angleDeg = Math.round(angleDeg);
      }
      onUpdateObject(initObj.id, { rotation: angleDeg }, false);
      return;
    }

    // AutoShape Diamond Control Handle Dragging
    if (drag.mode === 'drag-autoshape-handle' && drag.targetObjectId && drag.controlPointId) {
      const obj = objects.find((o) => o.id === drag.targetObjectId && o.type === 'autoshape') as
        | AutoShapeObject
        | undefined;
      if (!obj) return;
      const def = autoShapes.find((d) => d.id === obj.shapeDefId) || autoShapes[0];
      if (!def) return;
      const unrot = unrotatePointForObject(obj, rawX, rawY);
      const localX = unrot.x - obj.x;
      const localY = unrot.y - obj.y;
      const nextParams = dragAutoShapeControlPoint(
        def,
        drag.controlPointId,
        localX,
        localY,
        obj.width,
        obj.height,
        obj.params,
        obj.customCode
      );
      onUpdateObject(obj.id, { params: nextParams } as Partial<AutoShapeObject>, false);
      return;
    }

    // Subselection Tool (A): Drag Bezier Node or Cubic Handle (cp1 / cp2)
    if (
      (drag.mode === 'drag-bezier-node' ||
        drag.mode === 'drag-bezier-cp1' ||
        drag.mode === 'drag-bezier-cp2') &&
      drag.targetObjectId &&
      drag.nodeId
    ) {
      const vec = objects.find((o) => o.id === drag.targetObjectId && o.type === 'vector-path') as
        | VectorPathObject
        | undefined;
      if (!vec) return;
      const unrot = unrotatePointForObject(vec, rawX, rawY);
      const snappedX = gridSettings.snapToPixel ? Math.round(unrot.x) : unrot.x;
      const snappedY = gridSettings.snapToPixel ? Math.round(unrot.y) : unrot.y;
      const localX = snappedX - vec.x;
      const localY = snappedY - vec.y;

      const updatedNodes = vec.nodes.map((node) => {
        if (node.id !== drag.nodeId) return node;
        if (drag.mode === 'drag-bezier-node') {
          const dx = localX - node.x;
          const dy = localY - node.y;
          return {
            ...node,
            x: localX,
            y: localY,
            cp1x: node.cp1x + dx,
            cp1y: node.cp1y + dy,
            cp2x: node.cp2x + dx,
            cp2y: node.cp2y + dy,
          };
        }
        if (drag.mode === 'drag-bezier-cp1') {
          const nextNode = { ...node, cp1x: localX, cp1y: localY };
          if (e.altKey) {
            nextNode.pointType = 'corner';
          } else if (node.pointType === 'symmetric') {
            nextNode.cp2x = node.x - (localX - node.x);
            nextNode.cp2y = node.y - (localY - node.y);
          } else if (node.pointType === 'smooth') {
            const angle = Math.atan2(localY - node.y, localX - node.x) + Math.PI;
            const len = Math.hypot(node.cp2x - node.x, node.cp2y - node.y);
            nextNode.cp2x = node.x + Math.cos(angle) * len;
            nextNode.cp2y = node.y + Math.sin(angle) * len;
          }
          return nextNode;
        }
        if (drag.mode === 'drag-bezier-cp2') {
          const nextNode = { ...node, cp2x: localX, cp2y: localY };
          if (e.altKey) {
            nextNode.pointType = 'corner';
          } else if (node.pointType === 'symmetric') {
            nextNode.cp1x = node.x - (localX - node.x);
            nextNode.cp1y = node.y - (localY - node.y);
          } else if (node.pointType === 'smooth') {
            const angle = Math.atan2(localY - node.y, localX - node.x) + Math.PI;
            const len = Math.hypot(node.cp1x - node.x, node.cp1y - node.y);
            nextNode.cp1x = node.x + Math.cos(angle) * len;
            nextNode.cp1y = node.y + Math.sin(angle) * len;
          }
          return nextNode;
        }
        return node;
      });

      onUpdateObject(vec.id, { nodes: updatedNodes } as Partial<VectorPathObject>, false);
      return;
    }

    if (drag.mode === 'draw-pen-handle' && drag.targetObjectId && drag.nodeId) {
      const vec = objects.find((o) => o.id === drag.targetObjectId && o.type === 'vector-path') as
        | VectorPathObject
        | undefined;
      if (!vec) return;
      const localX = rawX - vec.x;
      const localY = rawY - vec.y;
      const updatedNodes = vec.nodes.map((n) => {
        if (n.id !== drag.nodeId) return n;
        const dx = localX - n.x;
        const dy = localY - n.y;
        return {
          ...n,
          pointType: Math.hypot(dx, dy) > 2 ? 'symmetric' : 'corner',
          cp2x: n.x + dx,
          cp2y: n.y + dy,
          cp1x: n.x - dx,
          cp1y: n.y - dy,
        } as BezierNode;
      });
      onUpdateObject(vec.id, { nodes: updatedNodes } as Partial<VectorPathObject>, false);
      return;
    }

    if (drag.mode === 'draw-shape' && drag.targetObjectId) {
      const obj = objects.find((o) => o.id === drag.targetObjectId);
      if (!obj) return;
      const bx = Math.min(drag.startCanvasX, x);
      const by = Math.min(drag.startCanvasY, y);
      let bw = Math.max(4, Math.abs(x - drag.startCanvasX));
      let bh = Math.max(4, Math.abs(y - drag.startCanvasY));
      if (e.shiftKey) {
        const s = Math.max(bw, bh);
        bw = s;
        bh = s;
      }

      if (obj.type === 'autoshape') {
        onUpdateObject(obj.id, { x: bx, y: by, width: bw, height: bh }, false);
      } else if (obj.type === 'vector-path') {
        let nodes: BezierNode[] = [];
        if (activeTool === 'line') {
          nodes = [
            {
              id: 'n1',
              x: drag.startCanvasX - bx,
              y: drag.startCanvasY - by,
              cp1x: drag.startCanvasX - bx,
              cp1y: drag.startCanvasY - by,
              cp2x: drag.startCanvasX - bx,
              cp2y: drag.startCanvasY - by,
              pointType: 'corner',
            },
            {
              id: 'n2',
              x: x - bx,
              y: y - by,
              cp1x: x - bx,
              cp1y: y - by,
              cp2x: x - bx,
              cp2y: y - by,
              pointType: 'corner',
            },
          ];
        } else if (activeTool === 'rect') {
          nodes = [
            { id: 'n1', x: 0, y: 0, cp1x: 0, cp1y: 0, cp2x: 0, cp2y: 0, pointType: 'corner' },
            { id: 'n2', x: bw, y: 0, cp1x: bw, cp1y: 0, cp2x: bw, cp2y: 0, pointType: 'corner' },
            { id: 'n3', x: bw, y: bh, cp1x: bw, cp1y: bh, cp2x: bw, cp2y: bh, pointType: 'corner' },
            { id: 'n4', x: 0, y: bh, cp1x: 0, cp1y: bh, cp2x: 0, cp2y: bh, pointType: 'corner' },
          ];
        } else if (activeTool === 'ellipse') {
          const rx = bw / 2;
          const ry = bh / 2;
          const kx = rx * 0.5522847498;
          const ky = ry * 0.5522847498;
          nodes = [
            { id: 'n1', x: rx, y: 0, cp1x: rx - kx, cp1y: 0, cp2x: rx + kx, cp2y: 0, pointType: 'smooth' },
            { id: 'n2', x: bw, y: ry, cp1x: bw, cp1y: ry - ky, cp2x: bw, cp2y: ry + ky, pointType: 'smooth' },
            { id: 'n3', x: rx, y: bh, cp1x: rx + kx, cp1y: bh, cp2x: rx - kx, cp2y: bh, pointType: 'smooth' },
            { id: 'n4', x: 0, y: ry, cp1x: 0, cp1y: ry + ky, cp2x: 0, cp2y: ry - ky, pointType: 'smooth' },
          ];
        }
        onUpdateObject(
          obj.id,
          { x: bx, y: by, width: bw, height: bh, nodes } as Partial<VectorPathObject>,
          false
        );
      }
      return;
    }

    if (drag.mode === 'move-floating-pixels' && drag.floatingStart) {
      const dx = Math.round(rawX) - drag.startCanvasX;
      const dy = Math.round(rawY) - drag.startCanvasY;
      onUpdatePixelSelection(translatePixelSelection(pixelSelection, dx, dy));
      drag.startCanvasX = Math.round(rawX);
      drag.startCanvasY = Math.round(rawY);
      return;
    }

    if (drag.mode === 'pixel-lasso' && drag.lassoPoints) {
      drag.lassoPoints.push({ x: Math.round(rawX), y: Math.round(rawY) });
      setRenderTick((t) => t + 1);
      return;
    }

    if (
      drag.mode === 'bitmap-paint' &&
      drag.targetObjectId &&
      drag.lastPaintPoint &&
      (activeTool === 'brush' || activeTool === 'pencil' || activeTool === 'eraser')
    ) {
      const bmp = objects.find((o) => o.id === drag.targetObjectId && o.type === 'bitmap') as
        | BitmapObject
        | undefined;
      if (!bmp) return;
      const nextPt = { x: Math.round(rawX), y: Math.round(rawY) };
      const prevPt = drag.lastPaintPoint;
      drag.lastPaintPoint = nextPt;
      const painted = await paintBitmapStroke(bmp, prevPt, nextPt, activeTool, toolOptions, pixelSelection);
      onUpdateObject(bmp.id, painted, false);
      return;
    }

    setRenderTick((t) => t + 1);
  };

  // Mouse Up Handler
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPreviewMode) {
      setPreviewActiveObjectId(null);
    }
    const drag = interactionRef.current;
    setSmartGuides([]);
    setResizeHudLabel(null);
    if (!drag) return;

    const { rawX, rawY } = clientToCanvasCoords(e.clientX, e.clientY, false);

    if (drag.mode === 'draw-connector' && drag.fromObjectId && drag.fromPort) {
      if (drag.snapTargetObjectId && drag.snapTargetPort) {
        onConnectObjects?.(
          drag.fromObjectId,
          drag.fromPort,
          drag.snapTargetObjectId,
          drag.snapTargetPort
        );
      } else if (Math.hypot(rawX - drag.startCanvasX, rawY - drag.startCanvasY) >= 36) {
        onSpawnConnectedNode?.(
          drag.fromObjectId,
          drag.fromPort,
          Math.round(rawX),
          Math.round(rawY)
        );
      }
      interactionRef.current = null;
      setRenderTick((t) => t + 1);
      return;
    }

    if (drag.mode === 'marquee-select-objects') {
      const bx = Math.min(drag.startCanvasX, rawX);
      const by = Math.min(drag.startCanvasY, rawY);
      const bw = Math.abs(rawX - drag.startCanvasX);
      const bh = Math.abs(rawY - drag.startCanvasY);
      if (bw > 3 || bh > 3) {
        const matched = objects
          .filter(
            (o) =>
              o.visible &&
              !o.locked &&
              o.x < bx + bw &&
              o.x + o.width > bx &&
              o.y < by + bh &&
              o.y + o.height > by
          )
          .map((o) => o.id);
        onSelectObjects(matched);
      }
    } else if (drag.mode === 'pixel-marquee-rect' || drag.mode === 'pixel-marquee-oval') {
      const bx = Math.min(drag.startCanvasX, Math.round(rawX));
      const by = Math.min(drag.startCanvasY, Math.round(rawY));
      const bw = Math.abs(Math.round(rawX) - drag.startCanvasX);
      const bh = Math.abs(Math.round(rawY) - drag.startCanvasY);
      const op = e.shiftKey
        ? 'add'
        : e.altKey
        ? 'subtract'
        : toolOptions.selectionOperation;
      const bmp = ensureTargetBitmapObject({ x: bx, y: by, width: bw, height: bh });
      if (bw <= 2 && bh <= 2 && op === 'new') {
        onUpdatePixelSelection({
          active: false,
          targetBitmapId: null,
          bounds: { x: 0, y: 0, width: 0, height: 0 },
          mask: null,
          maskWidth: 0,
          maskHeight: 0,
          outlinePolygons: [],
          floatingPixels: null,
        });
      } else {
        if (!selectedIds.includes(bmp.id)) {
          onSelectObjects([bmp.id]);
        }
        const nextSel =
          drag.mode === 'pixel-marquee-rect'
            ? buildRectSelection(
                bx,
                by,
                bw,
                bh,
                gridSettings.canvasWidth,
                gridSettings.canvasHeight,
                pixelSelection,
                op,
                toolOptions.selectionFeather,
                bmp.id
              )
            : buildOvalSelection(
                bx,
                by,
                bw,
                bh,
                gridSettings.canvasWidth,
                gridSettings.canvasHeight,
                pixelSelection,
                op,
                toolOptions.selectionFeather,
                bmp.id
              );
        onUpdatePixelSelection(nextSel);
      }
    } else if (drag.mode === 'pixel-lasso' && drag.lassoPoints && drag.lassoPoints.length >= 3) {
      const op = e.shiftKey
        ? 'add'
        : e.altKey
        ? 'subtract'
        : toolOptions.selectionOperation;
      const xs = drag.lassoPoints.map((p) => p.x);
      const ys = drag.lassoPoints.map((p) => p.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);
      const bmp = ensureTargetBitmapObject({
        x: minX,
        y: minY,
        width: Math.max(1, maxX - minX),
        height: Math.max(1, maxY - minY),
      });
      if (!selectedIds.includes(bmp.id)) {
        onSelectObjects([bmp.id]);
      }
      const nextSel = buildLassoSelection(
        drag.lassoPoints,
        gridSettings.canvasWidth,
        gridSettings.canvasHeight,
        pixelSelection,
        op,
        toolOptions.selectionFeather,
        bmp.id
      );
      onUpdatePixelSelection(nextSel);
    } else if (drag.mode === 'draw-slice' || drag.mode === 'crop-canvas') {
      const bx = Math.max(0, Math.min(drag.startCanvasX, Math.round(rawX)));
      const by = Math.max(0, Math.min(drag.startCanvasY, Math.round(rawY)));
      const bw = Math.round(Math.abs(rawX - drag.startCanvasX));
      const bh = Math.round(Math.abs(rawY - drag.startCanvasY));
      const isDocumentCropMode =
        drag.mode === 'crop-canvas' && gridSettings.sliceToolMode === 'crop';
      if (!isDocumentCropMode) {
        if (bw >= 12 && bh >= 12) {
          const newSliceId = 'slice-' + Date.now();
          onAddSlice?.({
            id: newSliceId,
            name: 'ui-slice-' + ((slices?.length || 0) + 1),
            x: bx,
            y: by,
            width: bw,
            height: bh,
            formats: ['webp', 'avif', 'svg'],
            scales: [1, 2, 3],
          });
          onSelectSlice?.(newSliceId);
          onUpdateGridSettings({ showSlices: true });
        }
      } else if (bw >= 32 && bh >= 32) {
        onRecordHistorySnapshot();
        objects.forEach((o) => {
          onUpdateObject(o.id, { x: o.x - bx, y: o.y - by }, false);
        });
        onUpdateGridSettings({ canvasWidth: bw, canvasHeight: bh });
        onSelectTool('pointer');
      }
    } else if (drag.mode === 'draw-shape') {
      onSelectTool('pointer');
    }

    interactionRef.current = null;
    setRenderTick((t) => t + 1);
  };

  // Mouse Wheel Zoom / Pan
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.25 : 0.8;
      const nextZoom = Math.max(
        0.25,
        Math.min(16, Number((gridSettings.zoom * zoomFactor).toFixed(2)))
      );
      onUpdateGridSettings({ zoom: nextZoom });
    } else {
      onUpdateGridSettings({
        panX: gridSettings.panX - e.deltaX,
        panY: gridSettings.panY - e.deltaY,
      });
    }
  };

  // Main Canvas Render Pipeline (100% Monochrome Greyscale Chrome)
  useEffect(() => {
    const canvas = viewportCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = viewportSize.width * dpr;
    canvas.height = viewportSize.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 1. Clear Pasteboard Background (Pure Monochrome Dark #0a0a0a)
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, viewportSize.width, viewportSize.height);

    const { originX, originY } = getDocOriginOnScreen();
    const docW = gridSettings.canvasWidth * gridSettings.zoom;
    const docH = gridSettings.canvasHeight * gridSettings.zoom;

    // 2. Document Drop Shadow & Background Matte ('slate' = Pure Solid Matte #141414 with NO checkerboard squares)
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle =
      gridSettings.canvasBackground === 'white'
        ? '#ffffff'
        : gridSettings.canvasBackground === 'slate'
        ? '#141414'
        : '#141414';
    ctx.fillRect(originX, originY, docW, docH);
    ctx.restore();

    // Eye-Safe Monochrome Checkerboard for transparent / checker canvas modes (aligned to 16px grid to prevent Hermann Grid / moiré beat)
    if (
      gridSettings.canvasBackground === 'dark-checker' ||
      gridSettings.canvasBackground === 'light-checker' ||
      gridSettings.canvasBackground === 'transparent'
    ) {
      const light = gridSettings.canvasBackground === 'light-checker';
      const c1 = light ? '#f3f3f3' : '#131313';
      const c2 = light ? '#eaeaea' : '#161616';
      const tile = Math.max(16, gridSettings.gridSize || 16) * (gridSettings.zoom >= 1 ? 1 : 1);
      ctx.save();
      ctx.beginPath();
      ctx.rect(originX, originY, docW, docH);
      ctx.clip();
      ctx.fillStyle = c1;
      ctx.fillRect(originX, originY, docW, docH);
      ctx.fillStyle = c2;
      for (let py = 0; py < docH; py += tile) {
        for (let px = (Math.floor(py / tile) % 2) * tile; px < docW; px += tile * 2) {
          ctx.fillRect(originX + px, originY + py, tile, tile);
        }
      }
      ctx.restore();
    }

    // 3. Render Hybrid Objects clipped to Canvas
    ctx.save();
    ctx.beginPath();
    ctx.rect(originX, originY, docW, docH);
    ctx.clip();
    ctx.translate(originX, originY);
    ctx.scale(gridSettings.zoom, gridSettings.zoom);

    if (gridSettings.zoom >= 2) {
      ctx.imageSmoothingEnabled = false;
    }

    const hasLiveInteractiveNavbarInPreview =
      isPreviewMode &&
      objects.some(
        (o) =>
          o.visible &&
          Boolean(o.params?.hasNestedMenu) &&
          o.height <= o.width * 1.1
      );

    objects.forEach((obj) => {
      // In Live Preview Mode, step 3b renders the 4 top-level navbar buttons interactively;
      // skip static duplicate child pill/text layers (`starter-nav-btn-*` / `web-navbar-item-*`) so they never ghost or bleed hover shadows!
      if (
        hasLiveInteractiveNavbarInPreview &&
        (obj.id.startsWith('starter-nav-btn-') || obj.id.startsWith('web-navbar-item-'))
      ) {
        return;
      }
      const reflowOff = containerReflowOffsets.get(obj.id) || { dx: 0, dy: 0 };
      let renderObj =
        reflowOff.dx !== 0 || reflowOff.dy !== 0
          ? { ...obj, x: obj.x + reflowOff.dx, y: obj.y + reflowOff.dy }
          : obj;
      if (isPreviewMode) {
        if (obj.id === previewActiveObjectId) {
          if (obj.stateVariants?.active) {
            renderObj = { ...renderObj, activeState: 'active' };
          } else {
            renderObj = {
              ...renderObj,
              stroke:
                obj.stroke && obj.stroke !== 'none' && (obj.strokeWidth ?? 0) > 0
                  ? '#ffffff'
                  : obj.stroke,
            };
          }
        } else if (obj.id === previewHoverObjectId) {
          if (obj.stateVariants?.hover) {
            renderObj = { ...renderObj, activeState: 'hover' };
          } else {
            renderObj = {
              ...renderObj,
              stroke:
                obj.stroke && obj.stroke !== 'none' && (obj.strokeWidth ?? 0) > 0
                  ? '#ffffff'
                  : obj.stroke,
            };
          }
        } else if (
          obj.type === 'vector-path' &&
          (obj as VectorPathObject).connectorMeta &&
          (previewHoverObjectId || previewActiveObjectId)
        ) {
          const meta = (obj as VectorPathObject).connectorMeta!;
          const focusId = previewActiveObjectId || previewHoverObjectId;
          if (meta.fromObjectId === focusId || meta.toObjectId === focusId) {
            renderObj = {
              ...renderObj,
              stroke: '#38bdf8',
              strokeWidth: Math.max(3, (obj.strokeWidth || 2) + 1.25),
              shadow: {
                enabled: true,
                color: 'rgba(56, 189, 248, 0.5)',
                blur: 10,
                offsetX: 0,
                offsetY: 0,
              },
            };
          }
        }
      }
      renderCanvasObjectToContext(ctx, renderObj, autoShapes, () => setRenderTick((t) => t + 1));
    });

    // 3b. Render Interactive Nested Menus on Web Layouts in Live Preview Mode!
    if (isPreviewMode) {
      const DEFAULT_TOP_MENUS = ['Products ▾', 'Solutions ▾', 'Developers ▾', 'Pricing ▾'];
      const DEFAULT_LEVEL1_MENUS: Record<number, string[]> = {
        0: [
          'AI Vector & Pixel Studio ▸',
          'Programmable JS AutoShapes ▸',
          'Lucid Sitemap & Flow Engine ▸',
          'Multi-Scale Retina .ZIP',
        ],
        1: [
          'Design Systems & Tokens ▸',
          'Interactive Web Prototyping ▸',
          'SaaS Landing Page Builder ▸',
          'Enterprise Team Workflows',
        ],
        2: [
          'JSF Plugin SDK & API ▸',
          'React + Tailwind Codegen ▸',
          'SVG & Bezier Path Engine ▸',
          'W3C Design Token JSON',
        ],
        3: [
          'Starter Free Tier ▸',
          'Pro Studio ($19/mo) ▸',
          'Team Cloud Bundle ▸',
          'Enterprise Custom SLA',
        ],
      };
      const DEFAULT_LEVEL2_SUBMENUS: Record<number, string[]> = {
        0: [
          '• Cubic Bezier Pen (P)',
          '• Magic Wand & Alpha Cut',
          '• One-Click Vectorizer',
          '• 400% 1px Pixel Loupe',
        ],
        1: [
          '• 125+ Smart AutoShapes',
          '• Diamond Control Handles',
          '• Live Preview Widgets',
          '• Custom .JSF Code Studio',
        ],
        2: [
          '• N/E/S/W Magnetic Ports',
          '• Orthogonal Elbow Routing',
          '• CSV / Markdown Import',
          '• Auto-Branching Sitemaps',
        ],
        3: [
          '• @1x / @2x / @3x Export',
          '• WebP + AVIF + Inline SVG',
          '• WCAG 2.2 Contrast Audit',
          '• One-Click AI Studio Ship',
        ],
      };

      objects.forEach((obj) => {
        if (!obj.visible) return;
        const isAutoShape = obj.type === 'autoshape';
        const asObj = obj as AutoShapeObject;
        if (
          isAutoShape &&
          (asObj.shapeDefId === 'ui-dropdown-select' || asObj.shapeDefId === 'layout-mega-menu')
        ) {
          return;
        }
        const isNestedMenuShape = Boolean(
          obj.params?.hasNestedMenu ||
            (isAutoShape &&
              (asObj.shapeDefId === 'layout-sticky-navbar' ||
                asObj.name.toLowerCase().includes('navbar')))
        );
        if (!isNestedMenuShape) return;

        let TOP_MENUS = DEFAULT_TOP_MENUS;
        if (typeof obj.params?.customTopMenus === 'string' && obj.params.customTopMenus.trim()) {
          const parsedTop = obj.params.customTopMenus
            .split('|')
            .map((s) => s.trim())
            .filter(Boolean);
          if (parsedTop.length >= 4) {
            TOP_MENUS = parsedTop.slice(0, 4);
          }
        }

        let LEVEL1_MENUS = DEFAULT_LEVEL1_MENUS;
        if (
          typeof obj.params?.customLevel1Menus === 'string' &&
          obj.params.customLevel1Menus.trim()
        ) {
          try {
            const parsedL1 = JSON.parse(obj.params.customLevel1Menus);
            if (parsedL1 && typeof parsedL1 === 'object') {
              LEVEL1_MENUS = parsedL1;
            }
          } catch {
            // Fallback to default Level-1 menus
          }
        }

        let LEVEL2_SUBMENUS = DEFAULT_LEVEL2_SUBMENUS;
        if (
          typeof obj.params?.customLevel2Menus === 'string' &&
          obj.params.customLevel2Menus.trim()
        ) {
          try {
            const parsedL2 = JSON.parse(obj.params.customLevel2Menus);
            if (parsedL2 && typeof parsedL2 === 'object') {
              LEVEL2_SUBMENUS = parsedL2;
            }
          } catch {
            // Fallback to default Level-2 submenus
          }
        }

        const isSidebar =
          (isAutoShape &&
            (asObj.shapeDefId === 'layout-sidebar-shell' ||
              asObj.shapeDefId === 'sitemap-navigation-tree')) ||
          obj.height > obj.width * 1.1;

        const accentColor =
          obj.stroke && obj.stroke !== 'none' ? obj.stroke : '#38bdf8';
        const navOff = containerReflowOffsets.get(obj.id) || { dx: 0, dy: 0 };
        const navX = obj.x + navOff.dx;
        const navY = obj.y + navOff.dy;

        if (!isSidebar) {
          const navStartX = navX + Math.round(obj.width * 0.22);
          const navSpanW = Math.round(obj.width * 0.54);
          const itemW = Math.max(52, Math.floor(navSpanW / 4));
          const openMenuIndex = Number(obj.params?.openMenuIndex ?? 0);
          const isDropdownOpen = openMenuIndex > 0;
          const navCy = navY + obj.height / 2;

          // Determine hovered or active top-level menu index (0..3)
          let activeTopIdx = Math.max(
            0,
            Math.min(3, (openMenuIndex || Number(obj.params?.activeTab ?? obj.params?.activeLink ?? 1)) - 1)
          );
          if (
            cursorCoords.y >= navY &&
            cursorCoords.y <= navY + obj.height &&
            cursorCoords.x >= navStartX &&
            cursorCoords.x <= navStartX + itemW * 4
          ) {
            activeTopIdx = Math.max(
              0,
              Math.min(3, Math.floor((cursorCoords.x - navStartX) / itemW))
            );
          }

          ctx.save();
          ctx.textBaseline = 'middle';

          if (isAutoShape) {
            // Paint clean navbar interior surface so underlying wireframe strokes never slice through buttons
            ctx.fillStyle = obj.fill && obj.fill !== 'none' ? obj.fill : '#0f172a';
            ctx.fillRect(navX + 1.5, navY + 1.5, Math.max(4, obj.width - 3), Math.max(4, obj.height - 3));

            // Left Brand Emblem + Title
            const logoR = Math.min(8, obj.height * 0.22);
            const logoCx = navX + 14 + logoR;
            ctx.beginPath();
            ctx.arc(logoCx, navCy, logoR, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
            ctx.fill();
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.font = '700 11px "Inter", sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';
            ctx.fillText('OSITO WEB', logoCx + logoR + 8, navCy + 0.5);

            // Render all 4 Top-Level Nav Items as tactile rounded buttons
            const btnH = Math.max(20, Math.min(30, obj.height - 14));
            const btnY = navY + (obj.height - btnH) / 2;
            const btnR = Math.min(8, btnH * 0.35);

            TOP_MENUS.forEach((label, idx) => {
              const btnX = navStartX + idx * itemW + 4;
              const btnW = Math.max(36, itemW - 8);
              const isCurrent = idx === activeTopIdx;

              ctx.beginPath();
              ctx.roundRect(btnX, btnY, btnW, btnH, btnR);
              ctx.fillStyle = isCurrent ? 'rgba(56, 189, 248, 0.24)' : '#1e293b';
              ctx.fill();
              ctx.strokeStyle = isCurrent ? accentColor : '#475569';
              ctx.lineWidth = isCurrent ? 1.5 : 1;
              ctx.stroke();

              ctx.font = isCurrent ? '600 11px "Inter", sans-serif' : '500 11px "Inter", sans-serif';
              ctx.fillStyle = isCurrent ? '#ffffff' : '#e2e8f0';
              ctx.textAlign = 'center';
              ctx.fillText(label, btnX + btnW / 2, navCy + 0.5);
            });

            // Right-Hand Primary CTA Pill Button
            const ctaW = Math.max(68, Math.min(96, Math.round(obj.width * 0.14)));
            const ctaH = btnH;
            const ctaX = navX + obj.width - ctaW - 12;
            const ctaY = btnY;
            if (ctaX > navStartX + itemW * 4 + 4) {
              const isCtaHovered =
                cursorCoords.x >= ctaX &&
                cursorCoords.x <= ctaX + ctaW &&
                cursorCoords.y >= ctaY &&
                cursorCoords.y <= ctaY + ctaH;
              ctx.beginPath();
              ctx.roundRect(ctaX, ctaY, ctaW, ctaH, ctaH / 2);
              ctx.fillStyle = isCtaHovered ? '#ffffff' : accentColor;
              ctx.fill();
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1;
              ctx.stroke();

              ctx.font = '700 10px "Inter", sans-serif';
              ctx.fillStyle = '#090d16';
              ctx.textAlign = 'center';
              ctx.fillText('Get Started ▸', ctaX + ctaW / 2, navCy + 0.5);
            }
          } else {
            // Non-AutoShape High-Fidelity Vector Navbar (`web-navbar-surface-...`):
            // Render interactive top-level nav buttons in the center nav strip (preserving left Brand & right CTA child layers)
            // and highlight the currently hovered or open top-level nav button (`Products ▾`, `Solutions ▾`, `Developers ▾`, `Pricing ▾`)!
            const isHoveringTopNav =
              cursorCoords.y >= navY &&
              cursorCoords.y <= navY + obj.height &&
              cursorCoords.x >= navStartX &&
              cursorCoords.x <= navStartX + itemW * 4;
            const btnH = Math.max(20, Math.min(30, obj.height - 14));
            const btnY = navY + (obj.height - btnH) / 2;
            const btnR = Math.min(8, btnH * 0.35);

            // Cleanly paint the navbar background strip behind the 4 nav buttons (matching linear-gradient or solid fill)
            // so underlying static TextObject labels never ghost behind the live interactive 3b buttons!
            if (obj.fillType === 'linear-gradient' && obj.fill && obj.fill !== 'none') {
              const navGrad = ctx.createLinearGradient(
                navX,
                navY,
                navX + Math.max(1, obj.width),
                navY + Math.max(1, obj.height)
              );
              try {
                navGrad.addColorStop(0, obj.fill);
                navGrad.addColorStop(1, obj.fillGradientEnd || obj.fill);
                ctx.fillStyle = navGrad;
              } catch {
                ctx.fillStyle = obj.fill;
              }
            } else {
              ctx.fillStyle = obj.fill && obj.fill !== 'none' ? obj.fill : '#0f172a';
            }
            ctx.fillRect(
              navStartX - 2,
              navY + 2,
              itemW * 4 + 4,
              Math.max(4, obj.height - 4)
            );

            TOP_MENUS.forEach((label, idx) => {
              const btnX = navStartX + idx * itemW + 4;
              const btnW = Math.max(36, itemW - 8);
              const isCurrent =
                idx === activeTopIdx &&
                (isHoveringTopNav ||
                  isDropdownOpen ||
                  Number(obj.params?.activeTab ?? obj.params?.activeLink ?? 0) > 0);

              ctx.beginPath();
              ctx.roundRect(btnX, btnY, btnW, btnH, btnR);
              ctx.fillStyle = isCurrent ? 'rgba(56, 189, 248, 0.24)' : '#1e293b';
              ctx.fill();
              ctx.strokeStyle = isCurrent ? accentColor : '#475569';
              ctx.lineWidth = isCurrent ? 1.5 : 1;
              ctx.stroke();

              ctx.font = isCurrent ? '600 11px "Inter", sans-serif' : '500 11px "Inter", sans-serif';
              ctx.fillStyle = isCurrent ? '#ffffff' : '#e2e8f0';
              ctx.textAlign = 'center';
              ctx.fillText(label, btnX + btnW / 2, navCy + 0.5);
            });
          }

          // Render Level-1 Dropdown Flyout + Level-2 Submenu as a floating z-index overlay on top of the page layout (never pushing containers below down!)
          if (isDropdownOpen) {
            const openTabIdx = Math.max(0, Math.min(3, openMenuIndex - 1));
            const menuX = Math.min(
              gridSettings.canvasWidth - 430,
              Math.max(12, navStartX + openTabIdx * itemW)
            );
            const menuY = navY + asObj.height + 4;
            const menuW = 216;
            const menuH = 152;

            ctx.shadowColor = 'rgba(0, 0, 0, 0.88)';
            ctx.shadowBlur = 28;
            ctx.shadowOffsetY = 12;
            ctx.fillStyle = '#0b1120';
            ctx.fillRect(menuX, menuY, menuW, menuH);
            ctx.shadowColor = 'transparent';
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(menuX + 0.5, menuY + 0.5, menuW, menuH);

            // Level-1 Header Strip
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(menuX + 1, menuY + 1, menuW - 2, 22);
            ctx.font = '700 9px "JetBrains Mono", monospace';
            ctx.fillStyle = accentColor;
            ctx.textAlign = 'left';
            ctx.fillText(
              `NESTED MENU: ${TOP_MENUS[openTabIdx].replace(' ▾', '').toUpperCase()}`,
              menuX + 10,
              menuY + 12
            );

            const level1Rows = LEVEL1_MENUS[openTabIdx] || LEVEL1_MENUS[0];
            let activeSubIdx = Math.max(
              0,
              Math.min(3, Number(asObj.params?.openSubMenuIndex ?? 1) - 1)
            );
            if (
              cursorCoords.x >= menuX &&
              cursorCoords.x <= menuX + menuW &&
              cursorCoords.y >= menuY + 24 &&
              cursorCoords.y <= menuY + menuH
            ) {
              activeSubIdx = Math.max(
                0,
                Math.min(3, Math.floor((cursorCoords.y - (menuY + 26)) / 30))
              );
            }

            level1Rows.forEach((rowLabel, rIdx) => {
              const ry = menuY + 27 + rIdx * 30;
              const isRowActive = rIdx === activeSubIdx;
              ctx.beginPath();
              ctx.roundRect(menuX + 6, ry, menuW - 12, 25, 6);
              ctx.fillStyle = isRowActive ? 'rgba(56, 189, 248, 0.24)' : '#172236';
              ctx.fill();
              ctx.strokeStyle = isRowActive ? accentColor : '#334155';
              ctx.lineWidth = isRowActive ? 1.25 : 1;
              ctx.stroke();

              ctx.font = isRowActive ? '600 10.5px "Inter", sans-serif' : '500 10.5px "Inter", sans-serif';
              ctx.fillStyle = isRowActive ? '#ffffff' : '#e2e8f0';
              ctx.textAlign = 'left';
              ctx.fillText(rowLabel, menuX + 14, ry + 13);
            });

            // Level-2 Nested Submenu Cascade Flyout to the right of Level-1 Panel!
            const subX = menuX + menuW + 4;
            const subY = menuY;
            const subW = 208;
            const subH = 152;

            ctx.shadowColor = 'rgba(0, 0, 0, 0.88)';
            ctx.shadowBlur = 28;
            ctx.shadowOffsetY = 12;
            ctx.fillStyle = '#0d1526';
            ctx.fillRect(subX, subY, subW, subH);
            ctx.shadowColor = 'transparent';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.25;
            ctx.strokeRect(subX + 0.5, subY + 0.5, subW, subH);

            ctx.fillStyle = '#1e293b';
            ctx.fillRect(subX + 1, subY + 1, subW - 2, 22);
            ctx.font = '700 9px "JetBrains Mono", monospace';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';
            ctx.fillText('SUBMENU ITEMS (LEVEL 2)', subX + 10, subY + 12);

            const level2Rows = LEVEL2_SUBMENUS[activeSubIdx] || LEVEL2_SUBMENUS[0];
            const selectedLeaf = Number(asObj.params?.selectedLeafIndex ?? 1) - 1;
            level2Rows.forEach((leafLabel, lIdx) => {
              const ly = subY + 27 + lIdx * 28;
              const isLeafHovered =
                (cursorCoords.x >= subX &&
                  cursorCoords.x <= subX + subW &&
                  cursorCoords.y >= ly &&
                  cursorCoords.y <= ly + 24) ||
                lIdx === selectedLeaf;

              ctx.beginPath();
              ctx.roundRect(subX + 6, ly, subW - 12, 23, 5);
              ctx.fillStyle = isLeafHovered ? 'rgba(56, 189, 248, 0.22)' : '#1a2436';
              ctx.fill();
              ctx.strokeStyle = isLeafHovered ? accentColor : '#334155';
              ctx.lineWidth = isLeafHovered ? 1.25 : 1;
              ctx.stroke();

              ctx.font = isLeafHovered ? '600 10px "Inter", sans-serif' : '500 10px "Inter", sans-serif';
              ctx.fillStyle = isLeafHovered ? '#ffffff' : '#e2e8f0';
              ctx.textAlign = 'left';
              ctx.fillText(leafLabel.replace(/^•\s*/, ''), subX + 14, ly + 12);
            });
          }

          ctx.restore();
        } else if (Number(asObj.params?.openMenuIndex ?? 0) > 0) {
          // Sidebar Nested Tree Menu Flyout in Preview Mode (only when explicitly opened, and right containers are reflowed!)
          const flyX = navX + asObj.width + 6;
          const flyY = navY + 42;
          const flyW = 202;
          const flyH = 142;

          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.72)';
          ctx.shadowBlur = 18;
          ctx.shadowOffsetY = 6;
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(flyX, flyY, flyW, flyH);
          ctx.shadowColor = 'transparent';
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(flyX + 0.5, flyY + 0.5, flyW, flyH);

          ctx.fillStyle = '#1e293b';
          ctx.fillRect(flyX + 1, flyY + 1, flyW - 2, 22);
          ctx.font = '700 9px "JetBrains Mono", monospace';
          ctx.fillStyle = accentColor;
          ctx.textAlign = 'left';
          ctx.fillText('SIDEBAR NESTED SUBMENU', flyX + 10, flyY + 12);

          const branchItems = [
            'Realtime Overview',
            'Funnel Conversion ▸',
            'Cohort Retention',
            'API Webhook Logs',
          ];
          const selectedSidebarLeaf = Number(asObj.params?.selectedLeafIndex ?? 2) - 1;
          branchItems.forEach((item, idx) => {
            const by = flyY + 27 + idx * 27;
            const isHover =
              cursorCoords.x >= flyX &&
              cursorCoords.x <= flyX + flyW &&
              cursorCoords.y >= by &&
              cursorCoords.y <= by + 23;
            const isActive = isHover || idx === selectedSidebarLeaf;

            ctx.beginPath();
            ctx.roundRect(flyX + 6, by, flyW - 12, 23, 5);
            ctx.fillStyle = isActive ? 'rgba(56, 189, 248, 0.22)' : '#172236';
            ctx.fill();
            ctx.strokeStyle = isActive ? accentColor : '#334155';
            ctx.lineWidth = isActive ? 1.25 : 1;
            ctx.stroke();

            ctx.font = isActive ? '600 10px "JetBrains Mono", monospace' : '500 10px "JetBrains Mono", monospace';
            ctx.fillStyle = isActive ? '#ffffff' : '#cbd5e1';
            ctx.fillText(item, flyX + 14, by + 12);
          });
          ctx.restore();
        }
      });
    }

    if (!isPreviewMode && pixelSelection.active && pixelSelection.floatingPixels) {
      const fp = pixelSelection.floatingPixels;
      const fpImg = getCachedImage(fp.imageDataUrl, () => setRenderTick((t) => t + 1));
      if (fpImg) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(fpImg, fp.x, fp.y, fp.width, fp.height);
      }
    }

    ctx.restore();

    // 4. Render Eye-Safe Monochrome Major Layout Grid & 1px Pixel Grid (Hidden in Live Preview Mode)
    ctx.save();
    ctx.beginPath();
    ctx.rect(originX, originY, docW, docH);
    ctx.clip();

    if (!isPreviewMode && gridSettings.showMajorGrid && gridSettings.gridSize >= 4) {
      const step = gridSettings.gridSize * gridSettings.zoom;
      if (step >= 6) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let gx = originX; gx <= originX + docW; gx += step) {
          const sx = Math.round(gx) + 0.5;
          ctx.moveTo(sx, originY);
          ctx.lineTo(sx, originY + docH);
        }
        for (let gy = originY; gy <= originY + docH; gy += step) {
          const sy = Math.round(gy) + 0.5;
          ctx.moveTo(originX, sy);
          ctx.lineTo(originX + docW, sy);
        }
        ctx.stroke();
      }
    }

    if (!isPreviewMode && gridSettings.showPixelGrid && gridSettings.zoom >= 4) {
      const step = gridSettings.zoom;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.045)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let gx = originX; gx <= originX + docW; gx += step) {
        const sx = Math.round(gx) + 0.5;
        ctx.moveTo(sx, originY);
        ctx.lineTo(sx, originY + docH);
      }
      for (let gy = originY; gy <= originY + docH; gy += step) {
        const sy = Math.round(gy) + 0.5;
        ctx.moveTo(originX, sy);
        ctx.lineTo(originX + docW, sy);
      }
      ctx.stroke();
    }
    ctx.restore();

    // Crisp 1px Monochrome Document Frame Border
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.strokeRect(originX - 0.5, originY - 0.5, docW + 1, docH + 1);

    // 4b. Multi-Scale Retina Web Slice Overlays (Interactive: Click, Move & 8-Handle Resize!)
    if (!isPreviewMode && gridSettings.showSlices !== false && slices && slices.length > 0) {
      slices.forEach((slice) => {
        const isSliceSelected = slice.id === selectedSliceId;
        const sx = Math.round(originX + slice.x * gridSettings.zoom);
        const sy = Math.round(originY + slice.y * gridSettings.zoom);
        const sw = Math.round(slice.width * gridSettings.zoom);
        const sh = Math.round(slice.height * gridSettings.zoom);

        ctx.save();
        ctx.fillStyle = isSliceSelected
          ? 'rgba(16, 185, 129, 0.09)'
          : 'rgba(16, 185, 129, 0.03)';
        ctx.fillRect(sx, sy, sw, sh);

        ctx.strokeStyle = isSliceSelected ? '#10b981' : '#525252';
        ctx.lineWidth = isSliceSelected ? 1.5 : 1;
        ctx.setLineDash([]);
        ctx.strokeRect(sx + 0.5, sy + 0.5, sw, sh);

        if (!isSliceSelected) {
          ctx.strokeStyle = '#d4d4d4';
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(sx + 0.5, sy + 0.5, sw, sh);
          ctx.setLineDash([]);
        }

        const scaleLabel = (slice.scales && slice.scales.length > 0 ? slice.scales : [1, 2, 3])
          .map((s) => `@${s}x`)
          .join('/');
        const badgeText = `#SLICE: ${slice.name} (${slice.width}×${slice.height} ${scaleLabel})`;
        ctx.font = '600 10px "JetBrains Mono", monospace';
        const tw = Math.round(ctx.measureText(badgeText).width + 10);
        const by = sy >= 18 ? sy - 17 : sy + 2;
        ctx.fillStyle = isSliceSelected ? '#10b981' : '#141414';
        ctx.fillRect(sx, by, tw, 16);
        ctx.strokeStyle = isSliceSelected ? '#ffffff' : '#737373';
        ctx.lineWidth = 1;
        ctx.strokeRect(sx + 0.5, by + 0.5, tw, 16);
        ctx.fillStyle = isSliceSelected ? '#0a0a0a' : '#e5e5e5';
        ctx.fillText(badgeText, sx + 5, by + 11);

        // Draw 8 Interactive Resize Handles when this Web Slice is Selected!
        if (isSliceSelected) {
          const handlePts = [
            { x: sx, y: sy },
            { x: sx + sw / 2, y: sy },
            { x: sx + sw, y: sy },
            { x: sx + sw, y: sy + sh / 2 },
            { x: sx + sw, y: sy + sh },
            { x: sx + sw / 2, y: sy + sh },
            { x: sx, y: sy + sh },
            { x: sx, y: sy + sh / 2 },
          ];
          handlePts.forEach((p) => {
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 1.5;
            ctx.fillRect(Math.round(p.x - 3.5), Math.round(p.y - 3.5), 7, 7);
            ctx.strokeRect(Math.round(p.x - 3.5), Math.round(p.y - 3.5), 7, 7);
          });
        }

        ctx.restore();
      });
    }

    // 5. Render Monochrome Fireworks MX Overlays: Selection Handles, Bezier Nodes, AutoShape Diamonds (Hidden in Preview Mode)
    if (!isPreviewMode) {
      selectedIds.forEach((id) => {
        const obj = objects.find((o) => o.id === id);
        if (!obj || !obj.visible) return;

        const sx = originX + obj.x * gridSettings.zoom;
        const sy = originY + obj.y * gridSettings.zoom;
        const sw = obj.width * gridSettings.zoom;
        const sh = obj.height * gridSettings.zoom;

        // Selection bounding box on canvas (Cyan for Vector/Text, Amber for AutoShapes, Purple for Bitmaps)
        const accentColor =
          obj.type === 'autoshape'
            ? '#f59e0b'
            : obj.type === 'bitmap'
            ? '#a855f7'
            : '#06b6d4';

        ctx.save();
        if (obj.rotation && Number.isFinite(obj.rotation)) {
          const cx = sx + sw / 2;
          const cy = sy + sh / 2;
          ctx.translate(cx, cy);
          ctx.rotate((obj.rotation * Math.PI) / 180);
          ctx.translate(-cx, -cy);
        }
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.25;

        const bmpGeom =
          obj.type === 'bitmap'
            ? getBitmapSelectionGeometrySync(obj as BitmapObject, () =>
                setRenderTick((t) => t + 1)
              )
            : null;

        if (bmpGeom && bmpGeom.hasCutout && bmpGeom.outlinePolygons.length > 0) {
          // Trace the exact uncut bitmap contour so the cut-out area is excluded from the selection boundary!
          ctx.beginPath();
          bmpGeom.outlinePolygons.forEach((poly) => {
            if (poly.length === 0) return;
            ctx.moveTo(
              Math.round(sx + poly[0].x * gridSettings.zoom) + 0.5,
              Math.round(sy + poly[0].y * gridSettings.zoom) + 0.5
            );
            for (let i = 1; i < poly.length; i++) {
              ctx.lineTo(
                Math.round(sx + poly[i].x * gridSettings.zoom) + 0.5,
                Math.round(sy + poly[i].y * gridSettings.zoom) + 0.5
              );
            }
          });
          ctx.stroke();
        } else {
          ctx.strokeRect(
            Math.round(sx) + 0.5,
            Math.round(sy) + 0.5,
            Math.round(sw),
            Math.round(sh)
          );
        }

        // Active Component State Badge on Selected Object (Default / :hover / :active / Dark Mode)
        if (obj.activeState && obj.activeState !== 'default') {
          const badgeText = `STATE: :${obj.activeState.toUpperCase()}`;
          ctx.font = '600 10px "JetBrains Mono", monospace';
          const textW = ctx.measureText(badgeText).width;
          const bx = Math.round(sx + sw - textW - 10);
          const by = Math.round(sy - 19);
          ctx.fillStyle = '#141414';
          ctx.fillRect(bx, by, Math.round(textW + 10), 16);
          ctx.strokeStyle = '#d4d4d4';
          ctx.lineWidth = 1;
          ctx.strokeRect(bx + 0.5, by + 0.5, Math.round(textW + 10), 16);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(badgeText, bx + 5, by + 11);
        }

        // Draw Sharp Square Resize / Contour Nodes when in Pointer, Subselect, or Scale mode
        if (
          activeTool === 'pointer' ||
          activeTool === 'select-behind' ||
          activeTool === 'scale' ||
          (activeTool === 'subselect' && obj.type === 'bitmap')
        ) {
          const pts =
            bmpGeom && bmpGeom.hasCutout
              ? [
                  ...bmpGeom.handles.map((hNode) => ({
                    x: sx + hNode.lx * gridSettings.zoom,
                    y: sy + hNode.ly * gridSettings.zoom,
                  })),
                  ...bmpGeom.contourVertices.map((vNode) => ({
                    x: sx + vNode.lx * gridSettings.zoom,
                    y: sy + vNode.ly * gridSettings.zoom,
                  })),
                ]
              : [
                  { x: sx, y: sy },
                  { x: sx + sw / 2, y: sy },
                  { x: sx + sw, y: sy },
                  { x: sx + sw, y: sy + sh / 2 },
                  { x: sx + sw, y: sy + sh },
                  { x: sx + sw / 2, y: sy + sh },
                  { x: sx, y: sy + sh },
                  { x: sx, y: sy + sh / 2 },
                ];
          pts.forEach((p) => {
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 1.5;
            ctx.fillRect(Math.round(p.x - 3.5), Math.round(p.y - 3.5), 7, 7);
            ctx.strokeRect(Math.round(p.x - 3.5), Math.round(p.y - 3.5), 7, 7);
          });

          if (activeTool === 'scale') {
            const rotY = sy - 22;
            ctx.beginPath();
            ctx.moveTo(sx + sw / 2, sy);
            ctx.lineTo(sx + sw / 2, rotY);
            ctx.strokeStyle = accentColor;
            ctx.stroke();

            ctx.fillStyle = accentColor;
            ctx.strokeStyle = '#ffffff';
            ctx.fillRect(Math.round(sx + sw / 2 - 4), Math.round(rotY - 4), 8, 8);
            ctx.strokeRect(Math.round(sx + sw / 2 - 4), Math.round(rotY - 4), 8, 8);
          }
        }

        // Draw Yellow Diamond Control Points for AutoShapes on Canvas!
        if (obj.type === 'autoshape') {
          const asObj = obj as AutoShapeObject;
          const def = autoShapes.find((d) => d.id === asObj.shapeDefId) || autoShapes[0];
          if (def) {
            const evaluated = evaluateAutoShape(
              def,
              asObj.width,
              asObj.height,
              asObj.params,
              asObj.customCode
            );
            evaluated.controlPoints.forEach((cp) => {
              const hx = originX + (asObj.x + cp.x) * gridSettings.zoom;
              const hy = originY + (asObj.y + cp.y) * gridSettings.zoom;

              ctx.save();
              ctx.translate(hx, hy);
              ctx.rotate(Math.PI / 4);
              ctx.fillStyle = '#facc15';
              ctx.strokeStyle = '#0a0a0a';
              ctx.lineWidth = 1.5;
              ctx.fillRect(-5, -5, 10, 10);
              ctx.strokeRect(-5, -5, 10, 10);
              ctx.restore();

              // Sharp-cornered label tag next to diamond
              ctx.font = '600 10px "JetBrains Mono", monospace';
              const textW = ctx.measureText(cp.label).width;
              ctx.fillStyle = '#111111';
              ctx.fillRect(Math.round(hx + 8), Math.round(hy - 8), Math.round(textW + 8), 16);
              ctx.strokeStyle = '#525252';
              ctx.lineWidth = 1;
              ctx.strokeRect(
                Math.round(hx + 8) + 0.5,
                Math.round(hy - 8) + 0.5,
                Math.round(textW + 8),
                16
              );
              ctx.fillStyle = '#fde047';
              ctx.fillText(cp.label, Math.round(hx + 12), Math.round(hy + 3));
            });
          }
        }

        // Draw Cubic Bezier Anchor Points & Tangent Handles when in Subselection (A) or Pen (P) mode
        if (obj.type === 'vector-path' && (activeTool === 'subselect' || activeTool === 'pen')) {
          const vec = obj as VectorPathObject;
          vec.nodes.forEach((node) => {
            const nx = originX + (vec.x + node.x) * gridSettings.zoom;
            const ny = originY + (vec.y + node.y) * gridSettings.zoom;
            const cp1x = originX + (vec.x + node.cp1x) * gridSettings.zoom;
            const cp1y = originY + (vec.y + node.cp1y) * gridSettings.zoom;
            const cp2x = originX + (vec.x + node.cp2x) * gridSettings.zoom;
            const cp2y = originY + (vec.y + node.cp2y) * gridSettings.zoom;
            const isNodeSelected = selectedNodeIds.includes(node.id);

            if (Math.hypot(cp1x - nx, cp1y - ny) > 1) {
              ctx.beginPath();
              ctx.moveTo(nx, ny);
              ctx.lineTo(cp1x, cp1y);
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 1;
              ctx.stroke();

              ctx.fillStyle = '#38bdf8';
              ctx.strokeStyle = '#0a0a0a';
              ctx.fillRect(Math.round(cp1x - 3), Math.round(cp1y - 3), 6, 6);
              ctx.strokeRect(Math.round(cp1x - 3), Math.round(cp1y - 3), 6, 6);
            }

            if (Math.hypot(cp2x - nx, cp2y - ny) > 1) {
              ctx.beginPath();
              ctx.moveTo(nx, ny);
              ctx.lineTo(cp2x, cp2y);
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 1;
              ctx.stroke();

              ctx.fillStyle = '#38bdf8';
              ctx.strokeStyle = '#0a0a0a';
              ctx.fillRect(Math.round(cp2x - 3), Math.round(cp2y - 3), 6, 6);
              ctx.strokeRect(Math.round(cp2x - 3), Math.round(cp2y - 3), 6, 6);
            }

            ctx.fillStyle = isNodeSelected ? '#06b6d4' : '#ffffff';
            ctx.strokeStyle = '#0a0a0a';
            ctx.lineWidth = 1.5;
            ctx.fillRect(Math.round(nx - 4), Math.round(ny - 4), 8, 8);
            ctx.strokeRect(Math.round(nx - 4), Math.round(ny - 4), 8, 8);
          });
        }

        ctx.restore();
      });
    }

    // 5b. Render Lucidchart-Style 4-Way Magnetic Connection Ports (N, E, S, W) in Design Mode
    if (!isPreviewMode && !isSliceMode) {
      const dragNow = interactionRef.current;
      const isDrawingConnector = dragNow?.mode === 'draw-connector';

      objects.forEach((obj) => {
        if (!obj.visible || obj.locked) return;
        if (obj.type === 'vector-path' && (obj as VectorPathObject).connectorMeta) return;

        const showPortsForObject =
          activeTool === 'connector' ||
          isDrawingConnector ||
          selectedIds.includes(obj.id) ||
          hoveredObjectId === obj.id ||
          hoveredPort?.objectId === obj.id;

        if (!showPortsForObject) return;

        const ports = getAllObjectPorts(obj);
        ports.forEach((p) => {
          const edgeScreenX = originX + p.x * gridSettings.zoom;
          const edgeScreenY = originY + p.y * gridSettings.zoom;
          const handleScreenX = edgeScreenX + p.nx * 14;
          const handleScreenY = edgeScreenY + p.ny * 14;

          const isHovered =
            hoveredPort?.objectId === obj.id && hoveredPort?.port === p.port;
          const isSnappedTarget =
            isDrawingConnector &&
            dragNow?.snapTargetObjectId === obj.id &&
            dragNow?.snapTargetPort === p.port;
          const isActiveSource =
            isDrawingConnector &&
            dragNow?.fromObjectId === obj.id &&
            dragNow?.fromPort === p.port;
          const isHighlighted = isHovered || isSnappedTarget || isActiveSource;

          ctx.save();
          // Stem line connecting object edge to floating port dot
          ctx.beginPath();
          ctx.moveTo(edgeScreenX, edgeScreenY);
          ctx.lineTo(handleScreenX, handleScreenY);
          ctx.strokeStyle = isHighlighted ? '#38bdf8' : 'rgba(56, 189, 248, 0.45)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Port circle with + indicator
          const radius = isHighlighted ? 6 : 4.5;
          ctx.beginPath();
          ctx.arc(handleScreenX, handleScreenY, radius, 0, Math.PI * 2);
          ctx.fillStyle = isHighlighted ? '#38bdf8' : '#0a0a0a';
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = isHighlighted ? '#ffffff' : '#38bdf8';
          ctx.stroke();

          if (isHighlighted) {
            ctx.beginPath();
            ctx.moveTo(handleScreenX - 3, handleScreenY);
            ctx.lineTo(handleScreenX + 3, handleScreenY);
            ctx.moveTo(handleScreenX, handleScreenY - 3);
            ctx.lineTo(handleScreenX, handleScreenY + 3);
            ctx.strokeStyle = '#0a0a0a';
            ctx.lineWidth = 1.4;
            ctx.stroke();
          }
          ctx.restore();
        });
      });
    }

    // 6. Render Active Bitmap Pixel Selection (Marching Ants)
    if (!isPreviewMode && pixelSelection.active && pixelSelection.outlinePolygons.length > 0) {
      ctx.save();
      ctx.lineWidth = 1.25;

      const traceAnts = () => {
        ctx.beginPath();
        pixelSelection.outlinePolygons.forEach((poly) => {
          if (poly.length === 0) return;
          ctx.moveTo(
            originX + poly[0].x * gridSettings.zoom,
            originY + poly[0].y * gridSettings.zoom
          );
          for (let i = 1; i < poly.length; i++) {
            ctx.lineTo(
              originX + poly[i].x * gridSettings.zoom,
              originY + poly[i].y * gridSettings.zoom
            );
          }
        });
      };

      ctx.strokeStyle = '#0a0a0a';
      ctx.setLineDash([]);
      traceAnts();
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = -marchingAntsOffset;
      traceAnts();
      ctx.stroke();
      ctx.restore();
    }

    // 7. Render Active Drag Previews
    const drag = interactionRef.current;
    if (drag) {
      if (drag.mode === 'draw-connector' && drag.fromObjectId && drag.fromPort) {
        const sourceObj = objects.find((o) => o.id === drag.fromObjectId);
        if (sourceObj) {
          const startPt = getObjectPortCoords(sourceObj, drag.fromPort);
          let endX = drag.currentCanvasX;
          let endY = drag.currentCanvasY;
          let endPort: ConnectionPortId =
            drag.fromPort === 'e'
              ? 'w'
              : drag.fromPort === 'w'
              ? 'e'
              : drag.fromPort === 's'
              ? 'n'
              : 's';

          if (drag.snapTargetObjectId && drag.snapTargetPort) {
            const targetObj = objects.find((o) => o.id === drag.snapTargetObjectId);
            if (targetObj) {
              const targetPt = getObjectPortCoords(targetObj, drag.snapTargetPort);
              endX = targetPt.x;
              endY = targetPt.y;
              endPort = drag.snapTargetPort;
            }
          }

          const previewGeom = buildConnectorNodesAndBounds(
            { x: startPt.x, y: startPt.y },
            drag.fromPort,
            { x: endX, y: endY },
            endPort,
            'elbow'
          );

          ctx.save();
          ctx.translate(
            originX + previewGeom.x * gridSettings.zoom,
            originY + previewGeom.y * gridSettings.zoom
          );
          ctx.scale(gridSettings.zoom, gridSettings.zoom);
          ctx.beginPath();
          traceBezierNodesOnContext(ctx, previewGeom.nodes, false, 0, 0);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.setLineDash(drag.snapTargetObjectId ? [] : [5, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          if (previewGeom.nodes.length >= 2) {
            const last = previewGeom.nodes[previewGeom.nodes.length - 1];
            const prev = previewGeom.nodes[previewGeom.nodes.length - 2];
            const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
            ctx.translate(last.x, last.y);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-10, -5.5);
            ctx.lineTo(-8, 0);
            ctx.lineTo(-10, 5.5);
            ctx.closePath();
            ctx.fillStyle = '#38bdf8';
            ctx.fill();
          }
          ctx.restore();

          // If dragging onto empty canvas (>= 36px), preview ghost Sitemap/Workflow node that will spawn on drop
          if (
            !drag.snapTargetObjectId &&
            Math.hypot(endX - startPt.x, endY - startPt.y) >= 36
          ) {
            const gw = Math.min(200, Math.max(120, sourceObj.width)) * gridSettings.zoom;
            const gh = Math.min(110, Math.max(64, sourceObj.height)) * gridSettings.zoom;
            let gx = originX + endX * gridSettings.zoom - gw / 2;
            let gy = originY + endY * gridSettings.zoom - gh / 2;
            if (drag.fromPort === 'e') gx = originX + endX * gridSettings.zoom;
            if (drag.fromPort === 'w') gx = originX + endX * gridSettings.zoom - gw;
            if (drag.fromPort === 's') gy = originY + endY * gridSettings.zoom;
            if (drag.fromPort === 'n') gy = originY + endY * gridSettings.zoom - gh;

            ctx.save();
            ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.25;
            ctx.setLineDash([4, 4]);
            ctx.fillRect(gx, gy, gw, gh);
            ctx.strokeRect(gx + 0.5, gy + 0.5, gw, gh);
            ctx.setLineDash([]);
            ctx.fillStyle = '#38bdf8';
            ctx.font = '600 10px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('+ SPAWN NODE', gx + gw / 2, gy + gh / 2 + 3);
            ctx.restore();
          }
        }
      } else if (drag.mode === 'marquee-select-objects') {
        const bx = originX + Math.min(drag.startCanvasX, drag.currentCanvasX) * gridSettings.zoom;
        const by = originY + Math.min(drag.startCanvasY, drag.currentCanvasY) * gridSettings.zoom;
        const bw = Math.abs(drag.currentCanvasX - drag.startCanvasX) * gridSettings.zoom;
        const bh = Math.abs(drag.currentCanvasY - drag.startCanvasY) * gridSettings.zoom;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.strokeStyle = '#d4d4d4';
        ctx.lineWidth = 1;
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeRect(bx + 0.5, by + 0.5, bw, bh);
      } else if (drag.mode === 'pixel-marquee-rect' || drag.mode === 'pixel-marquee-oval') {
        const bx = originX + Math.min(drag.startCanvasX, drag.currentCanvasX) * gridSettings.zoom;
        const by = originY + Math.min(drag.startCanvasY, drag.currentCanvasY) * gridSettings.zoom;
        const bw = Math.abs(drag.currentCanvasX - drag.startCanvasX) * gridSettings.zoom;
        const bh = Math.abs(drag.currentCanvasY - drag.startCanvasY) * gridSettings.zoom;
        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.setLineDash([4, 4]);
        ctx.lineDashOffset = -marchingAntsOffset;
        if (drag.mode === 'pixel-marquee-rect') {
          ctx.strokeRect(bx + 0.5, by + 0.5, bw, bh);
        } else {
          ctx.beginPath();
          ctx.ellipse(bx + bw / 2, by + bh / 2, bw / 2, bh / 2, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      } else if (drag.mode === 'pixel-lasso' && drag.lassoPoints && drag.lassoPoints.length > 1) {
        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(
          originX + drag.lassoPoints[0].x * gridSettings.zoom,
          originY + drag.lassoPoints[0].y * gridSettings.zoom
        );
        drag.lassoPoints.forEach((pt) => {
          ctx.lineTo(originX + pt.x * gridSettings.zoom, originY + pt.y * gridSettings.zoom);
        });
        ctx.stroke();
        ctx.restore();
      } else if (drag.mode === 'draw-slice' || drag.mode === 'crop-canvas') {
        const bx = originX + Math.min(drag.startCanvasX, drag.currentCanvasX) * gridSettings.zoom;
        const by = originY + Math.min(drag.startCanvasY, drag.currentCanvasY) * gridSettings.zoom;
        const bw = Math.abs(drag.currentCanvasX - drag.startCanvasX) * gridSettings.zoom;
        const bh = Math.abs(drag.currentCanvasY - drag.startCanvasY) * gridSettings.zoom;
        ctx.fillStyle =
          drag.mode === 'draw-slice'
            ? 'rgba(16, 185, 129, 0.14)'
            : 'rgba(255, 255, 255, 0.12)';
        ctx.strokeStyle = drag.mode === 'draw-slice' ? '#10b981' : '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeRect(bx, by, bw, bh);
      }
    }

    // Monochrome Smart Alignment Guides
    if (smartGuides.length > 0) {
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      smartGuides.forEach((g) => {
        ctx.beginPath();
        if (g.orientation === 'vertical') {
          const sx = originX + g.position * gridSettings.zoom + 0.5;
          ctx.moveTo(sx, originY + g.start * gridSettings.zoom);
          ctx.lineTo(sx, originY + g.end * gridSettings.zoom);
        } else {
          const sy = originY + g.position * gridSettings.zoom + 0.5;
          ctx.moveTo(originX + g.start * gridSettings.zoom, sy);
          ctx.lineTo(originX + g.end * gridSettings.zoom, sy);
        }
        ctx.stroke();
      });
      ctx.restore();
    }

    // 8. Top & Left Monochrome Pixel Rulers
    if (!isPreviewMode && gridSettings.showRulers) {
      ctx.fillStyle = '#111111';
      ctx.fillRect(rulerThickness, 0, viewportSize.width - rulerThickness, rulerThickness);
      ctx.fillRect(0, rulerThickness, rulerThickness, viewportSize.height - rulerThickness);
      ctx.fillStyle = '#181818';
      ctx.fillRect(0, 0, rulerThickness, rulerThickness);

      ctx.strokeStyle = '#292929';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, rulerThickness + 0.5);
      ctx.lineTo(viewportSize.width, rulerThickness + 0.5);
      ctx.moveTo(rulerThickness + 0.5, 0);
      ctx.lineTo(rulerThickness + 0.5, viewportSize.height);
      ctx.stroke();

      ctx.fillStyle = '#737373';
      ctx.font = '500 9px "JetBrains Mono", monospace';
      const stepPx = gridSettings.zoom >= 4 ? 10 : gridSettings.zoom >= 1 ? 50 : 100;

      for (let px = 0; px <= gridSettings.canvasWidth; px += stepPx) {
        const sx = Math.round(originX + px * gridSettings.zoom) + 0.5;
        if (sx >= rulerThickness && sx <= viewportSize.width) {
          ctx.beginPath();
          ctx.moveTo(sx, rulerThickness - 6);
          ctx.lineTo(sx, rulerThickness);
          ctx.strokeStyle = '#525252';
          ctx.stroke();
          ctx.fillText(String(px), sx + 2, 11);
        }
      }

      for (let py = 0; py <= gridSettings.canvasHeight; py += stepPx) {
        const sy = Math.round(originY + py * gridSettings.zoom) + 0.5;
        if (sy >= rulerThickness && sy <= viewportSize.height) {
          ctx.beginPath();
          ctx.moveTo(rulerThickness - 6, sy);
          ctx.lineTo(rulerThickness, sy);
          ctx.strokeStyle = '#525252';
          ctx.stroke();
          ctx.save();
          ctx.translate(10, sy + 2);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(String(py), 0, 0);
          ctx.restore();
        }
      }

      const curScreenX = originX + cursorCoords.x * gridSettings.zoom;
      const curScreenY = originY + cursorCoords.y * gridSettings.zoom;
      ctx.strokeStyle = '#e5e5e5';
      ctx.beginPath();
      ctx.moveTo(curScreenX, 0);
      ctx.lineTo(curScreenX, rulerThickness);
      ctx.moveTo(0, curScreenY);
      ctx.lineTo(rulerThickness, curScreenY);
      ctx.stroke();
    }
  }, [
    viewportSize,
    objects,
    selectedIds,
    selectedNodeIds,
    activeTool,
    gridSettings,
    pixelSelection,
    autoShapes,
    slices,
    selectedSliceId,
    marchingAntsOffset,
    smartGuides,
    cursorCoords,
    getDocOriginOnScreen,
    rulerThickness,
    renderTick,
    isPreviewMode,
    isSliceMode,
    hoveredObjectId,
    hoveredPort,
    previewHoverObjectId,
    previewActiveObjectId,
  ]);

  const getCursorStyle = () => {
    if (spacePressed || activeTool === 'hand') return 'cursor-grab active:cursor-grabbing';
    if (activeTool === 'zoom') return 'cursor-zoom-in';
    if (isPreviewMode) return previewHoverObjectId ? 'cursor-pointer' : 'cursor-default';
    if (hoveredPort) return 'cursor-crosshair';
    if (
      activeTool === 'marquee-rect' ||
      activeTool === 'marquee-oval' ||
      activeTool === 'lasso' ||
      activeTool === 'magic-wand' ||
      activeTool === 'pencil' ||
      activeTool === 'brush' ||
      activeTool === 'eraser' ||
      activeTool === 'line' ||
      activeTool === 'pen' ||
      activeTool === 'rect' ||
      activeTool === 'ellipse' ||
      activeTool === 'autoshape' ||
      activeTool === 'connector' ||
      activeTool === 'slice' ||
      activeTool === 'crop'
    ) {
      return 'cursor-crosshair';
    }
    if (activeTool === 'text') return 'cursor-text';
    return 'cursor-default';
  };

  const hasSelectedBitmap = objects.some((o) => selectedIds.includes(o.id) && o.type === 'bitmap');
  const isBitmapToolActive =
    activeTool === 'magic-wand' ||
    activeTool === 'marquee-rect' ||
    activeTool === 'marquee-oval' ||
    activeTool === 'lasso' ||
    activeTool === 'brush' ||
    activeTool === 'pencil' ||
    activeTool === 'eraser' ||
    activeTool === 'bucket';
  const showBitmapAiActions = pixelSelection.active || hasSelectedBitmap || isBitmapToolActive;

  const cycleCanvasBackdrop = () => {
    const nextBg =
      gridSettings.canvasBackground === 'slate'
        ? 'dark-checker'
        : gridSettings.canvasBackground === 'dark-checker'
        ? 'white'
        : 'slate';
    onUpdateGridSettings({ canvasBackground: nextBg });
  };

  const backdropLabel =
    gridSettings.canvasBackground === 'slate'
      ? 'Matte'
      : gridSettings.canvasBackground === 'white' || gridSettings.canvasBackground === 'light-checker'
      ? 'Light'
      : 'Checker';

  const handleSliceSelectedObject = () => {
    const selectedObj = objects.find((o) => selectedIds.includes(o.id));
    if (!selectedObj) return;
    onAddSlice?.({
      id: 'slice-' + Date.now(),
      name:
        (selectedObj.name || 'ui-slice')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || `ui-slice-${(slices?.length || 0) + 1}`,
      x: Math.max(0, Math.round(selectedObj.x)),
      y: Math.max(0, Math.round(selectedObj.y)),
      width: Math.max(8, Math.round(selectedObj.width)),
      height: Math.max(8, Math.round(selectedObj.height)),
      formats: ['webp', 'avif', 'svg'],
      scales: [1, 2, 3],
      targetObjectId: selectedObj.id,
    });
    onUpdateGridSettings({ showSlices: true });
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 h-full overflow-hidden bg-[#0a0a0a] select-none rounded-none"
    >
      <canvas
        ref={viewportCanvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`w-full h-full block rounded-none ${getCursorStyle()}`}
      />

      {/* Live Constrained vs Free Skew Resize HUD Banner */}
      {resizeHudLabel && (
        <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 bg-[#141414] border border-[#ffffff] px-3 py-1 text-[11px] font-mono text-[#ffffff] shadow-2xl rounded-none uppercase tracking-wider">
          {resizeHudLabel}
        </div>
      )}

      {/* Floating Bottom-Left Compact Pixel HUD & Zoom Bar (Hidden in Clean Published Site View) */}
      {!(isPreviewMode && gridSettings.showToolHints === false) && (
      <div className="absolute bottom-3 left-7 flex flex-wrap items-center gap-1.5 bg-[#121212] border border-[#2e2e2e] px-2.5 py-1 text-[11px] font-mono text-[#d4d4d4] shadow-xl rounded-none max-w-[calc(100%-2rem)]">
        <span className="text-[#ffffff] font-semibold">
          X:{cursorCoords.x} Y:{cursorCoords.y}px
        </span>
        <span className="text-[#404040]">|</span>
        <button
          onClick={() =>
            onUpdateGridSettings({ zoom: Math.max(0.25, Number((gridSettings.zoom / 1.5).toFixed(2))) })
          }
          className="px-1.5 hover:text-white hover:bg-[#262626] rounded-none"
          title="Zoom Out (Ctrl + -)"
        >
          -
        </button>
        <button
          onClick={() => onUpdateGridSettings({ zoom: 1, panX: 0, panY: 0 })}
          className="px-1.5 text-[#ffffff] hover:bg-[#262626] rounded-none font-semibold"
          title="Reset to 100% Pixel-Perfect Zoom (Ctrl + 0)"
        >
          {Math.round(gridSettings.zoom * 100)}%
        </button>
        <button
          onClick={() =>
            onUpdateGridSettings({ zoom: Math.min(16, Number((gridSettings.zoom * 1.5).toFixed(2))) })
          }
          className="px-1.5 hover:text-white hover:bg-[#262626] rounded-none"
          title="Zoom In (Ctrl + +) • 400%+ shows 1px Pixel Grid"
        >
          +
        </button>
        <button
          onClick={() => onUpdateGridSettings({ zoom: gridSettings.zoom >= 4 ? 1 : 4 })}
          className={`px-1.5 py-0.5 rounded-none text-[10px] border ${
            gridSettings.zoom >= 4
              ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-semibold'
              : 'border-[#333333] hover:bg-[#242424] text-[#a3a3a3]'
          }`}
          title="Toggle 400% Pixel Loupe Mode"
        >
          400% Loupe
        </button>
        <span className="text-[#404040]">|</span>
        <button
          onClick={() => onUpdateGridSettings({ snapToPixel: !gridSettings.snapToPixel })}
          className={`px-1.5 py-0.5 rounded-none text-[10px] border ${
            gridSettings.snapToPixel
              ? 'bg-[#2a2a2a] text-[#ffffff] border-[#737373]'
              : 'border-[#262626] text-[#737373] hover:bg-[#1f1f1f]'
          }`}
        >
          1px Snap: {gridSettings.snapToPixel ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={() => onUpdateGridSettings({ showMajorGrid: !gridSettings.showMajorGrid })}
          className={`px-1.5 py-0.5 rounded-none text-[10px] border ${
            gridSettings.showMajorGrid
              ? 'bg-[#2a2a2a] text-[#ffffff] border-[#737373]'
              : 'border-[#262626] text-[#737373] hover:bg-[#1f1f1f]'
          }`}
          title="Toggle Major Layout Grid Overlay"
        >
          Grid: {gridSettings.showMajorGrid ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={cycleCanvasBackdrop}
          className="px-1.5 py-0.5 rounded-none text-[10px] border bg-[#1d1d1d] text-[#ffffff] border-[#525252] hover:bg-[#2a2a2a]"
          title="Cycle Eye-Safe Canvas Backdrop: Solid Matte Dark (#141414) → Checker → Light"
        >
          Backdrop: {backdropLabel}
        </button>
      </div>
      )}

      {/* Contextual Floating Tool Hint & Interactive Action Bar (Sharp 0px corners, Monochrome Greyscale) */}
      {gridSettings.showToolHints !== false && (
        <div className="pointer-events-auto absolute top-7 left-1/2 -translate-x-1/2 bg-[#121212] border border-[#2e2e2e] px-3.5 py-1 text-[11px] text-[#d4d4d4] shadow-lg flex flex-wrap items-center gap-2 rounded-none max-w-[92%]">
          {isPreviewMode ? (
            <span>
              <strong className="text-white">LIVE PREVIEW MODE:</strong> All overlays & handles hidden • Hover or click components on canvas to test{' '}
              <span className="text-white font-semibold">:hover</span> and{' '}
              <span className="text-white font-semibold">:active</span> interactive states!
            </span>
          ) : (
            <>
              {activeTool === 'pointer' && (
                <span>
                  <strong className="text-white">Pointer (V):</strong> Drag handles to resize, drag{' '}
                  <span className="text-white font-semibold">◆ handles</span> on AutoShapes, or drag any{' '}
                  <span className="text-[#38bdf8] font-semibold">● N/E/S/W port</span> to auto-connect workflows!
                </span>
              )}
              {activeTool === 'connector' && (
                <span>
                  <strong className="text-white">Smart Connector (X):</strong> Drag from any shape's{' '}
                  <span className="text-[#38bdf8] font-semibold">● N/E/S/W port</span> to link to another shape, or release on empty canvas to auto-spawn a connected Sitemap/Workflow node!
                </span>
              )}
              {activeTool === 'subselect' && (
                <span>
                  <strong className="text-white">Subselection (A):</strong> Click any Vector Path to edit individual Bezier anchor nodes & cubic handles (<kbd className="text-white">Alt</kbd>-drag breaks handle symmetry).
                </span>
              )}
              {activeTool === 'magic-wand' && (
                <span>
                  <strong className="text-white">Magic Wand (W):</strong> Click any zone on the Bitmap layer to flood-select matching pixels (<kbd className="text-white">Shift</kbd> +Add, <kbd className="text-white">Alt</kbd> -Subtract).
                </span>
              )}
              {(activeTool === 'marquee-rect' || activeTool === 'marquee-oval' || activeTool === 'lasso') && (
                <span>
                  <strong className="text-white">Bitmap Marquee ({activeTool.toUpperCase()}):</strong> Drag to select pixels • Press <kbd className="text-white">Ctrl+X</kbd> to Cut or <kbd className="text-white">Ctrl+C</kbd> to Copy selected pixels, then <kbd className="text-white">Ctrl+V</kbd> to Paste as a separate bitmap (leaving unselected pixels untouched)!
                </span>
              )}
              {activeTool === 'pen' && (
                <span>
                  <strong className="text-white">Bezier Pen (P):</strong> Click for sharp corners, click-drag for smooth Bezier handles. Click first node or press <kbd className="text-white">Enter</kbd> to finish.
                </span>
              )}
              {activeTool === 'autoshape' && (
                <span>
                  <strong className="text-white">JS AutoShape:</strong> Drag on canvas to draw{' '}
                  <span className="text-white font-semibold">{toolOptions.activeAutoShapeId}</span>, then drag its ◆ handles or{' '}
                  <span className="text-[#38bdf8] font-semibold">● ports</span> to connect!
                </span>
              )}
              {activeTool === 'crop' && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <strong className="text-white">Slice & Crop (C):</strong>
                  <button
                    onClick={() => onUpdateGridSettings({ sliceToolMode: 'slice', showSlices: true })}
                    className={`px-2 py-0.5 text-[10px] font-mono border rounded-none ${
                      gridSettings.sliceToolMode !== 'crop'
                        ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-semibold'
                        : 'bg-[#1a1a1a] text-[#a3a3a3] border-[#333333] hover:text-white'
                    }`}
                  >
                    [Draw Export Slice (C)]
                  </button>
                  <button
                    onClick={() => onUpdateGridSettings({ sliceToolMode: 'crop' })}
                    className={`px-2 py-0.5 text-[10px] font-mono border rounded-none ${
                      gridSettings.sliceToolMode === 'crop'
                        ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-semibold'
                        : 'bg-[#1a1a1a] text-[#a3a3a3] border-[#333333] hover:text-white'
                    }`}
                  >
                    [Crop Document]
                  </button>
                  <button
                    onClick={handleSliceSelectedObject}
                    disabled={selectedIds.length === 0}
                    className="px-2 py-0.5 text-[10px] font-mono border border-[#525252] bg-[#1f1f1f] text-[#ffffff] hover:bg-[#2e2e2e] disabled:opacity-40 rounded-none"
                    title="Create a Retina Export Slice matching the selected object's bounding box"
                  >
                    + Slice Selected Object
                  </button>
                  <button
                    onClick={() => onExportSlicesZip?.()}
                    className="px-2 py-0.5 text-[10px] font-mono border border-[#737373] bg-[#262626] text-[#ffffff] hover:bg-[#363636] font-semibold rounded-none"
                    title="Batch Export all Slices at @1x, @2x, and @3x into a single .ZIP archive"
                  >
                    Batch Export {slices?.length || 0} Slices (.ZIP @1x/@2x/@3x)
                  </button>
                </div>
              )}
              {activeTool !== 'pointer' &&
                activeTool !== 'connector' &&
                activeTool !== 'subselect' &&
                activeTool !== 'magic-wand' &&
                activeTool !== 'marquee-rect' &&
                activeTool !== 'marquee-oval' &&
                activeTool !== 'lasso' &&
                activeTool !== 'pen' &&
                activeTool !== 'autoshape' &&
                activeTool !== 'crop' && (
                  <span>
                    <strong className="text-white uppercase">{activeTool}:</strong> Active on hybrid canvas • Hold <kbd className="text-white">Space</kbd> to Pan, <kbd className="text-white">Ctrl+Wheel</kbd> to Zoom.
                  </span>
                )}
            </>
          )}
          {showBitmapAiActions && (
            <div className="flex items-center gap-1.5 pl-1 border-l border-[#333333]">
              <button
                onClick={() => onSmartRemoveBackground?.()}
                className="px-2 py-0.5 text-[10px] font-mono border border-[#525252] bg-[#1f1f1f] text-[#ffffff] hover:bg-[#2e2e2e] font-semibold rounded-none"
                title="One-Click Smart Background Removal on active Bitmap / Magic Wand selection"
              >
                Smart Remove BG
              </button>
              <button
                onClick={() => onVectorizeSelectionToBezier?.()}
                className="px-2 py-0.5 text-[10px] font-mono border border-[#737373] bg-[#262626] text-[#ffffff] hover:bg-[#363636] font-semibold rounded-none"
                title="Trace active Bitmap or Pixel Selection into editable Cubic Bezier Vector Paths"
              >
                Vectorize → Bezier [VEC]
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => onUpdateGridSettings({ showToolHints: false })}
            className="ml-1 pl-2 border-l border-[#2e2e2e] text-[10px] font-mono text-[#737373] hover:text-[#ffffff] transition"
            title="Hide top tool tips (re-enable via 'Tips: OFF' in top bar)"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

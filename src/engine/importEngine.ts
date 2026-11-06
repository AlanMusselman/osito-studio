import {
  AutoShapeDefinition,
  AutoShapeObject,
  BezierNode,
  CanvasObject,
  CanvasSlice,
  GridAndSnapSettings,
  VectorPathObject,
} from '../types/editor';
import { computeBestPortPair, createSmartConnectorObject } from './connectorEngine';

export const ALL_IMPORT_ACCEPT_STRING =
  '.png,.jpg,.jpeg,.webp,.avif,.gif,.bmp,.ico,.svg,.json,.osito.json,.js,.csv,.txt,.md,image/png,image/jpeg,image/webp,image/avif,image/gif,image/bmp,image/x-icon,image/svg+xml,application/json,text/javascript,text/csv,text/plain,text/markdown';

export type ImportModeFilter =
  | 'all'
  | 'raster-alpha'
  | 'raster-photo'
  | 'svg-vector'
  | 'svg-bitmap'
  | 'autoshape-js'
  | 'sitemap-data'
  | 'project-json';

export function getAcceptStringForImportMode(mode: ImportModeFilter): string {
  switch (mode) {
    case 'raster-alpha':
      return '.png,.webp,.avif,image/png,image/webp,image/avif';
    case 'raster-photo':
      return '.jpg,.jpeg,.gif,.bmp,.ico,image/jpeg,image/gif,image/bmp,image/x-icon';
    case 'svg-vector':
    case 'svg-bitmap':
      return '.svg,image/svg+xml';
    case 'autoshape-js':
      return '.js,.autoshape.js,.json,text/javascript,application/javascript';
    case 'sitemap-data':
      return '.csv,.txt,.md,text/csv,text/plain,text/markdown';
    case 'project-json':
      return '.osito.json,.json,application/json';
    case 'all':
    default:
      return ALL_IMPORT_ACCEPT_STRING;
  }
}

/**
 * Parses an SVG path `d` attribute (supporting M, L, H, V, C, S, Q, Z in absolute & relative forms)
 * into world-coordinate BezierNode arrays.
 */
function parseSvgPathDToSubpaths(
  dAttr: string
): Array<{ nodes: BezierNode[]; closed: boolean }> {
  if (!dAttr || typeof dAttr !== 'string' || !dAttr.trim()) return [];
  const subpaths: Array<{ nodes: BezierNode[]; closed: boolean }> = [];
  const tokenRegex = /([MmLlHhVvCcSsQqTtAaZz])|(-?\d*\.?\d+(?:e[-+]?\d+)?)/gi;
  const tokens: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(dAttr)) !== null) {
    tokens.push(match[0]);
  }

  let idx = 0;
  let cmd = '';
  let curX = 0;
  let curY = 0;
  let startX = 0;
  let startY = 0;
  let lastQuadCtrlX = 0;
  let lastQuadCtrlY = 0;
  let currentNodes: BezierNode[] = [];
  let nodeCounter = 0;

  const nextNum = (): number => {
    if (idx >= tokens.length) return 0;
    const v = parseFloat(tokens[idx++]);
    return Number.isFinite(v) ? v : 0;
  };

  const isCommandToken = (t: string) => /^[MmLlHhVvCcSsQqTtAaZz]$/.test(t);

  const pushCornerNode = (x: number, y: number) => {
    currentNodes.push({
      id: `svg-n-${Date.now()}-${nodeCounter++}`,
      x,
      y,
      cp1x: x,
      cp1y: y,
      cp2x: x,
      cp2y: y,
      pointType: 'corner',
    });
  };

  while (idx < tokens.length) {
    if (isCommandToken(tokens[idx])) {
      cmd = tokens[idx++];
    } else if (!cmd) {
      idx++;
      continue;
    }

    const isRel = cmd === cmd.toLowerCase();
    const upper = cmd.toUpperCase();

    if (upper === 'Z') {
      if (currentNodes.length > 0) {
        subpaths.push({ nodes: currentNodes, closed: true });
        currentNodes = [];
      }
      curX = startX;
      curY = startY;
      cmd = '';
      continue;
    }

    if (upper === 'M') {
      if (currentNodes.length > 0) {
        subpaths.push({ nodes: currentNodes, closed: false });
        currentNodes = [];
      }
      const x = nextNum() + (isRel ? curX : 0);
      const y = nextNum() + (isRel ? curY : 0);
      curX = x;
      curY = y;
      startX = x;
      startY = y;
      lastQuadCtrlX = curX;
      lastQuadCtrlY = curY;
      pushCornerNode(curX, curY);
      cmd = isRel ? 'l' : 'L';
    } else if (upper === 'L') {
      const x = nextNum() + (isRel ? curX : 0);
      const y = nextNum() + (isRel ? curY : 0);
      curX = x;
      curY = y;
      lastQuadCtrlX = curX;
      lastQuadCtrlY = curY;
      pushCornerNode(curX, curY);
    } else if (upper === 'H') {
      const x = nextNum() + (isRel ? curX : 0);
      curX = x;
      lastQuadCtrlX = curX;
      lastQuadCtrlY = curY;
      pushCornerNode(curX, curY);
    } else if (upper === 'V') {
      const y = nextNum() + (isRel ? curY : 0);
      curY = y;
      lastQuadCtrlX = curX;
      lastQuadCtrlY = curY;
      pushCornerNode(curX, curY);
    } else if (upper === 'C') {
      const x1 = nextNum() + (isRel ? curX : 0);
      const y1 = nextNum() + (isRel ? curY : 0);
      const x2 = nextNum() + (isRel ? curX : 0);
      const y2 = nextNum() + (isRel ? curY : 0);
      const x = nextNum() + (isRel ? curX : 0);
      const y = nextNum() + (isRel ? curY : 0);
      if (currentNodes.length > 0) {
        const prev = currentNodes[currentNodes.length - 1];
        prev.cp2x = x1;
        prev.cp2y = y1;
        prev.pointType = 'smooth';
      }
      currentNodes.push({
        id: `svg-n-${Date.now()}-${nodeCounter++}`,
        x,
        y,
        cp1x: x2,
        cp1y: y2,
        cp2x: x,
        cp2y: y,
        pointType: 'smooth',
      });
      curX = x;
      curY = y;
      lastQuadCtrlX = curX;
      lastQuadCtrlY = curY;
    } else if (upper === 'S') {
      const x2 = nextNum() + (isRel ? curX : 0);
      const y2 = nextNum() + (isRel ? curY : 0);
      const x = nextNum() + (isRel ? curX : 0);
      const y = nextNum() + (isRel ? curY : 0);
      if (currentNodes.length > 0) {
        const prev = currentNodes[currentNodes.length - 1];
        const rx = 2 * prev.x - prev.cp1x;
        const ry = 2 * prev.y - prev.cp1y;
        prev.cp2x = rx;
        prev.cp2y = ry;
      }
      currentNodes.push({
        id: `svg-n-${Date.now()}-${nodeCounter++}`,
        x,
        y,
        cp1x: x2,
        cp1y: y2,
        cp2x: x,
        cp2y: y,
        pointType: 'smooth',
      });
      curX = x;
      curY = y;
      lastQuadCtrlX = curX;
      lastQuadCtrlY = curY;
    } else if (upper === 'Q') {
      const qx = nextNum() + (isRel ? curX : 0);
      const qy = nextNum() + (isRel ? curY : 0);
      const x = nextNum() + (isRel ? curX : 0);
      const y = nextNum() + (isRel ? curY : 0);
      const cp1x = curX + (2 / 3) * (qx - curX);
      const cp1y = curY + (2 / 3) * (qy - curY);
      const cp2x = x + (2 / 3) * (qx - x);
      const cp2y = y + (2 / 3) * (qy - y);
      if (currentNodes.length > 0) {
        const prev = currentNodes[currentNodes.length - 1];
        prev.cp2x = cp1x;
        prev.cp2y = cp1y;
      }
      currentNodes.push({
        id: `svg-n-${Date.now()}-${nodeCounter++}`,
        x,
        y,
        cp1x: cp2x,
        cp1y: cp2y,
        cp2x: x,
        cp2y: y,
        pointType: 'smooth',
      });
      lastQuadCtrlX = qx;
      lastQuadCtrlY = qy;
      curX = x;
      curY = y;
    } else if (upper === 'T') {
      const qx = 2 * curX - lastQuadCtrlX;
      const qy = 2 * curY - lastQuadCtrlY;
      const x = nextNum() + (isRel ? curX : 0);
      const y = nextNum() + (isRel ? curY : 0);
      const cp1x = curX + (2 / 3) * (qx - curX);
      const cp1y = curY + (2 / 3) * (qy - curY);
      const cp2x = x + (2 / 3) * (qx - x);
      const cp2y = y + (2 / 3) * (qy - y);
      if (currentNodes.length > 0) {
        const prev = currentNodes[currentNodes.length - 1];
        prev.cp2x = cp1x;
        prev.cp2y = cp1y;
      }
      currentNodes.push({
        id: `svg-n-${Date.now()}-${nodeCounter++}`,
        x,
        y,
        cp1x: cp2x,
        cp1y: cp2y,
        cp2x: x,
        cp2y: y,
        pointType: 'smooth',
      });
      lastQuadCtrlX = qx;
      lastQuadCtrlY = qy;
      curX = x;
      curY = y;
    } else if (upper === 'A') {
      // Consume 7 SVG Arc parameters: rx, ry, x-axis-rotation, large-arc-flag, sweep-flag, x, y
      nextNum();
      nextNum();
      nextNum();
      nextNum();
      nextNum();
      const x = nextNum() + (isRel ? curX : 0);
      const y = nextNum() + (isRel ? curY : 0);
      curX = x;
      curY = y;
      lastQuadCtrlX = curX;
      lastQuadCtrlY = curY;
      pushCornerNode(curX, curY);
    } else {
      idx++;
    }
  }

  if (currentNodes.length > 0) {
    subpaths.push({ nodes: currentNodes, closed: false });
  }

  return subpaths.filter((sp) => sp.nodes.length >= 2);
}

function normalizeNodesToVectorObject(
  worldNodes: BezierNode[],
  closed: boolean,
  name: string,
  fill: string,
  stroke: string,
  strokeWidth: number,
  opacity: number,
  offsetX: number,
  offsetY: number,
  fillTypeOverride?: 'solid' | 'linear-gradient' | 'radial-gradient' | 'none',
  fillGradientEndOverride?: string
): VectorPathObject {
  const xs = worldNodes
    .flatMap((n) => [n.x, n.cp1x, n.cp2x])
    .filter((v) => Number.isFinite(v));
  const ys = worldNodes
    .flatMap((n) => [n.y, n.cp1y, n.cp2y])
    .filter((v) => Number.isFinite(v));
  const minX = xs.length > 0 ? Math.min(...xs) : 0;
  const minY = ys.length > 0 ? Math.min(...ys) : 0;
  const maxX = xs.length > 0 ? Math.max(...xs) : 4;
  const maxY = ys.length > 0 ? Math.max(...ys) : 4;
  const width = Math.max(4, Math.round(maxX - minX));
  const height = Math.max(4, Math.round(maxY - minY));

  const localNodes: BezierNode[] = worldNodes.map((n, i) => ({
    ...n,
    id: `n_${Date.now()}_${i}`,
    x: Number((n.x - minX).toFixed(2)),
    y: Number((n.y - minY).toFixed(2)),
    cp1x: Number((n.cp1x - minX).toFixed(2)),
    cp1y: Number((n.cp1y - minY).toFixed(2)),
    cp2x: Number((n.cp2x - minX).toFixed(2)),
    cp2y: Number((n.cp2y - minY).toFixed(2)),
  }));

  const hasFill = fill && fill !== 'none' && fill !== 'transparent';
  const hasStroke = stroke && stroke !== 'none' && stroke !== 'transparent';

  return {
    id: `vec-svg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    type: 'vector-path',
    visible: true,
    locked: false,
    x: Math.round(minX + offsetX),
    y: Math.round(minY + offsetY),
    width,
    height,
    rotation: 0,
    opacity: Number.isFinite(opacity) ? opacity : 1,
    blendMode: 'source-over',
    fill: hasFill ? fill : '#38bdf8',
    fillType: fillTypeOverride ?? (hasFill ? 'solid' : 'none'),
    fillGradientEnd: fillGradientEndOverride || '#6366f1',
    stroke: hasStroke ? stroke : hasFill ? 'none' : '#38bdf8',
    strokeWidth: hasStroke ? Math.max(1, strokeWidth) : hasFill ? 0 : 2,
    strokeAlign: 'center',
    pixelSnap: true,
    shadow: { enabled: false, color: 'rgba(0,0,0,0.4)', blur: 8, offsetX: 0, offsetY: 4 },
    nodes: localNodes,
    closed,
  };
}

/**
 * Parses an SVG string into editable Cubic Bezier VectorPathObject layers.
 */
export function parseSvgToVectorObjects(
  svgText: string,
  baseName: string,
  canvasWidth: number,
  canvasHeight: number
): VectorPathObject[] {
  if (!svgText || typeof svgText !== 'string' || !svgText.trim()) return [];
  let svgEl: SVGSVGElement | null = null;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    svgEl = doc.querySelector('svg');
  } catch {
    return [];
  }
  if (!svgEl) return [];

  // Parse <linearGradient> and <radialGradient> stops so url(#id) fills round-trip cleanly
  const gradientMap = new Map<
    string,
    { type: 'linear-gradient' | 'radial-gradient'; start: string; end: string }
  >();
  svgEl.querySelectorAll('linearGradient, radialGradient').forEach((gradEl) => {
    const gid = gradEl.getAttribute('id');
    if (!gid) return;
    const stops = Array.from(gradEl.querySelectorAll('stop'));
    const colors = stops
      .map((st) => st.getAttribute('stop-color') || '')
      .filter(Boolean);
    if (colors.length > 0) {
      gradientMap.set(gid, {
        type:
          gradEl.tagName.toLowerCase() === 'radialgradient'
            ? 'radial-gradient'
            : 'linear-gradient',
        start: colors[0],
        end: colors[colors.length - 1] || colors[0],
      });
    }
  });

  const results: VectorPathObject[] = [];
  const offsetX = Math.round(Math.max(1, canvasWidth || 960) * 0.12);
  const offsetY = Math.round(Math.max(1, canvasHeight || 600) * 0.12);
  let shapeIndex = 1;

  const elements = svgEl.querySelectorAll('path, rect, circle, ellipse, line, polygon, polyline');
  elements.forEach((el) => {
    const tag = el.tagName.toLowerCase();
    const rawFill = el.getAttribute('fill') || svgEl.getAttribute('fill') || '#38bdf8';
    const rawStroke = el.getAttribute('stroke') || svgEl.getAttribute('stroke') || 'none';
    let fill = rawFill;
    let fillTypeOverride: 'solid' | 'linear-gradient' | 'radial-gradient' | 'none' | undefined;
    let fillGradEnd: string | undefined;

    const gradMatch = rawFill.match(/^url\(\s*#([^\s)]+)\s*\)$/i);
    if (gradMatch) {
      const resolved = gradientMap.get(gradMatch[1]);
      if (resolved) {
        fill = resolved.start;
        fillTypeOverride = resolved.type;
        fillGradEnd = resolved.end;
      } else {
        fill = '#38bdf8';
      }
    }
    const stroke = /^url\(/i.test(rawStroke) ? '#38bdf8' : rawStroke;
    const strokeWidth = parseFloat(el.getAttribute('stroke-width') || '2') || 2;
    const opacity = parseFloat(el.getAttribute('opacity') || '1') || 1;
    const label = el.getAttribute('id') || `${baseName || 'SVG'} Path ${shapeIndex++}`;

    if (tag === 'path') {
      const d = el.getAttribute('d') || '';
      const subpaths = parseSvgPathDToSubpaths(d);
      subpaths.forEach((sp, spIdx) => {
        results.push(
          normalizeNodesToVectorObject(
            sp.nodes,
            sp.closed,
            subpaths.length > 1 ? `${label} (${spIdx + 1})` : label,
            fill,
            stroke,
            strokeWidth,
            opacity,
            offsetX,
            offsetY,
            fillTypeOverride,
            fillGradEnd
          )
        );
      });
    } else if (tag === 'rect') {
      const x = parseFloat(el.getAttribute('x') || '0') || 0;
      const y = parseFloat(el.getAttribute('y') || '0') || 0;
      const w = Math.max(1, parseFloat(el.getAttribute('width') || '100') || 100);
      const h = Math.max(1, parseFloat(el.getAttribute('height') || '60') || 60);
      const nodes: BezierNode[] = [
        { id: 'r1', x, y, cp1x: x, cp1y: y, cp2x: x, cp2y: y, pointType: 'corner' },
        { id: 'r2', x: x + w, y, cp1x: x + w, cp1y: y, cp2x: x + w, cp2y: y, pointType: 'corner' },
        {
          id: 'r3',
          x: x + w,
          y: y + h,
          cp1x: x + w,
          cp1y: y + h,
          cp2x: x + w,
          cp2y: y + h,
          pointType: 'corner',
        },
        { id: 'r4', x, y: y + h, cp1x: x, cp1y: y + h, cp2x: x, cp2y: y + h, pointType: 'corner' },
      ];
      results.push(
        normalizeNodesToVectorObject(
          nodes,
          true,
          label,
          fill,
          stroke,
          strokeWidth,
          opacity,
          offsetX,
          offsetY,
          fillTypeOverride,
          fillGradEnd
        )
      );
    } else if (tag === 'circle' || tag === 'ellipse') {
      const cx = parseFloat(el.getAttribute('cx') || '50') || 50;
      const cy = parseFloat(el.getAttribute('cy') || '50') || 50;
      const rx = Math.max(
        1,
        tag === 'circle'
          ? parseFloat(el.getAttribute('r') || '40') || 40
          : parseFloat(el.getAttribute('rx') || '40') || 40
      );
      const ry = Math.max(
        1,
        tag === 'circle'
          ? rx
          : parseFloat(el.getAttribute('ry') || '40') || 40
      );
      const k = 0.5522847498;
      const kx = rx * k;
      const ky = ry * k;
      const nodes: BezierNode[] = [
        { id: 'e1', x: cx, y: cy - ry, cp1x: cx - kx, cp1y: cy - ry, cp2x: cx + kx, cp2y: cy - ry, pointType: 'smooth' },
        { id: 'e2', x: cx + rx, y: cy, cp1x: cx + rx, cp1y: cy - ky, cp2x: cx + rx, cp2y: cy + ky, pointType: 'smooth' },
        { id: 'e3', x: cx, y: cy + ry, cp1x: cx + kx, cp1y: cy + ry, cp2x: cx - kx, cp2y: cy + ry, pointType: 'smooth' },
        { id: 'e4', x: cx - rx, y: cy, cp1x: cx - rx, cp1y: cy + ky, cp2x: cx - rx, cp2y: cy - ky, pointType: 'smooth' },
      ];
      results.push(
        normalizeNodesToVectorObject(
          nodes,
          true,
          label,
          fill,
          stroke,
          strokeWidth,
          opacity,
          offsetX,
          offsetY,
          fillTypeOverride,
          fillGradEnd
        )
      );
    } else if (tag === 'line') {
      const x1 = parseFloat(el.getAttribute('x1') || '0') || 0;
      const y1 = parseFloat(el.getAttribute('y1') || '0') || 0;
      const x2 = parseFloat(el.getAttribute('x2') || '100') || 100;
      const y2 = parseFloat(el.getAttribute('y2') || '100') || 100;
      const nodes: BezierNode[] = [
        { id: 'l1', x: x1, y: y1, cp1x: x1, cp1y: y1, cp2x: x1, cp2y: y1, pointType: 'corner' },
        { id: 'l2', x: x2, y: y2, cp1x: x2, cp1y: y2, cp2x: x2, cp2y: y2, pointType: 'corner' },
      ];
      results.push(
        normalizeNodesToVectorObject(
          nodes,
          false,
          label,
          'none',
          stroke === 'none' ? '#38bdf8' : stroke,
          strokeWidth,
          opacity,
          offsetX,
          offsetY
        )
      );
    } else if (tag === 'polygon' || tag === 'polyline') {
      const ptsRaw = (el.getAttribute('points') || '').trim();
      const nums = ptsRaw
        .split(/[\s,]+/)
        .map((v) => parseFloat(v))
        .filter((v) => Number.isFinite(v));
      const nodes: BezierNode[] = [];
      for (let i = 0; i + 1 < nums.length; i += 2) {
        const px = nums[i];
        const py = nums[i + 1];
        nodes.push({
          id: `p_${i}`,
          x: px,
          y: py,
          cp1x: px,
          cp1y: py,
          cp2x: px,
          cp2y: py,
          pointType: 'corner',
        });
      }
      if (nodes.length >= 2) {
        results.push(
          normalizeNodesToVectorObject(
            nodes,
            tag === 'polygon',
            label,
            tag === 'polygon' ? fill : 'none',
            stroke,
            strokeWidth,
            opacity,
            offsetX,
            offsetY,
            tag === 'polygon' ? fillTypeOverride : 'none',
            fillGradEnd
          )
        );
      }
    }
  });

  return results;
}

/**
 * Parses an imported `.csv`, `.txt`, or `.md` Sitemap / Workflow outline into connected
 * AutoShape Sitemap/Workflow nodes + Lucidchart auto-connecting lines.
 */
export function parseSitemapOrWorkflowText(
  rawText: string,
  fileName: string,
  sitemapDef: AutoShapeDefinition,
  primaryColor: string,
  secondaryColor: string
): CanvasObject[] {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) return [];
  const lines = rawText
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((l) => l.trim().length > 0);

  if (lines.length === 0) return [];

  const isCsv =
    (fileName || '').toLowerCase().endsWith('.csv') ||
    (lines[0].includes(',') && lines.length >= 2);

  const createdNodes: AutoShapeObject[] = [];
  const createdConnectors: VectorPathObject[] = [];

  const makeNode = (
    title: string,
    x: number,
    y: number,
    w = 160,
    h = 92
  ): AutoShapeObject => ({
    id: `sitemap-import-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: title || 'Sitemap Node',
    type: 'autoshape',
    shapeDefId: sitemapDef?.id || 'sitemap-page-card',
    visible: true,
    locked: false,
    x: Math.round(x),
    y: Math.round(y),
    width: Math.max(16, w),
    height: Math.max(16, h),
    rotation: 0,
    opacity: 1,
    blendMode: 'source-over',
    fill: primaryColor || '#06b6d4',
    fillType: 'linear-gradient',
    fillGradientEnd: '#6366f1',
    stroke: secondaryColor || '#38bdf8',
    strokeWidth: 2,
    strokeAlign: 'center',
    pixelSnap: true,
    shadow: {
      enabled: true,
      color: 'rgba(0,0,0,0.45)',
      blur: 12,
      offsetX: 0,
      offsetY: 4,
    },
    params: { ...(sitemapDef?.defaultParams || {}) },
  });

  if (isCsv) {
    // Parse CSV rows: From, To, Label (or Node, Parent)
    const nodeByName = new Map<string, AutoShapeObject>();
    const edges: Array<{ from: string; to: string; label?: string }> = [];

    lines.forEach((line, idx) => {
      const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      if (
        idx === 0 &&
        /^(from|source|parent|page|node|step)$/i.test(cols[0] || '')
      ) {
        return; // skip header row
      }
      const fromName = cols[0] || `Node ${idx + 1}`;
      const toName = cols[1];
      const edgeLabel = cols[2] || '';
      if (!nodeByName.has(fromName)) {
        nodeByName.set(fromName, makeNode(fromName, 80, 80));
      }
      if (toName) {
        if (!nodeByName.has(toName)) {
          nodeByName.set(toName, makeNode(toName, 80, 80));
        }
        edges.push({ from: fromName, to: toName, label: edgeLabel });
      }
    });

    const allNodes = Array.from(nodeByName.values());
    const colsCount = Math.max(2, Math.ceil(Math.sqrt(allNodes.length)));
    allNodes.forEach((node, idx) => {
      const col = idx % colsCount;
      const row = Math.floor(idx / colsCount);
      node.x = 70 + col * 240;
      node.y = 70 + row * 150;
      createdNodes.push(node);
    });

    edges.forEach((edge) => {
      const fromObj = nodeByName.get(edge.from);
      const toObj = nodeByName.get(edge.to);
      if (fromObj && toObj && fromObj.id !== toObj.id) {
        const { fromPort, toPort } = computeBestPortPair(fromObj, toObj);
        createdConnectors.push(
          createSmartConnectorObject(fromObj, fromPort, toObj, toPort, {
            routing: 'elbow',
            stroke: secondaryColor || '#38bdf8',
            strokeWidth: 2,
            label: edge.label,
          })
        );
      }
    });
  } else {
    // Parse indented outline (.txt / .md) into hierarchical tree levels
    interface OutlineEntry {
      title: string;
      depth: number;
      node: AutoShapeObject;
    }
    const entries: OutlineEntry[] = [];
    const levelCounts = new Map<number, number>();

    lines.forEach((rawLine) => {
      const leadingSpaces = rawLine.match(/^(\s*)/)?.[1].length || 0;
      const cleaned = rawLine.replace(/^[\s\-*+#\d.]+/, '').trim() || 'Sitemap Node';
      const depth = Math.min(5, Math.floor(leadingSpaces / 2));
      const rowAtDepth = levelCounts.get(depth) || 0;
      levelCounts.set(depth, rowAtDepth + 1);

      const x = 64 + depth * 230;
      const y = 64 + rowAtDepth * 128;
      const node = makeNode(cleaned, x, y);
      createdNodes.push(node);

      // Connect to most recent parent at depth - 1 (or root at depth 0)
      for (let i = entries.length - 1; i >= 0; i--) {
        if (entries[i].depth < depth) {
          const parentNode = entries[i].node;
          createdConnectors.push(
            createSmartConnectorObject(parentNode, 'e', node, 'w', {
              routing: 'elbow',
              stroke: secondaryColor || '#38bdf8',
              strokeWidth: 2,
            })
          );
          break;
        }
      }

      entries.push({ title: cleaned, depth, node });
    });
  }

  return [...createdNodes, ...createdConnectors];
}

/**
 * Parses an imported `.js` or `.autoshape.js` file into a custom AutoShapeDefinition.
 */
export function parseCustomAutoShapeJsFile(
  rawText: string,
  fileName: string
): AutoShapeDefinition | null {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) return null;
  const baseName = (fileName || '')
    .replace(/\.autoshape\.js$/i, '')
    .replace(/\.(js|json)$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(rawText);
    const sourceCode = parsed?.jsSourceCode || parsed?.code;
    if (parsed && typeof sourceCode === 'string' && parsed.name) {
      return {
        id: parsed.id || `custom-${Date.now()}`,
        name: parsed.name,
        category: parsed.category || 'Custom JS',
        description: parsed.description || 'Imported Custom JS AutoShape',
        iconName: parsed.iconName || 'Code2',
        defaultParams: parsed.defaultParams || {},
        paramSchema: Array.isArray(parsed.paramSchema) ? parsed.paramSchema : [],
        jsSourceCode: sourceCode,
      };
    }
  } catch {
    // Plain JS procedural code body
  }

  if (
    rawText.includes('buildNodes') ||
    rawText.includes('drawCustom') ||
    rawText.includes('paths') ||
    rawText.includes('return')
  ) {
    return {
      id: `custom-js-${Date.now()}`,
      name: baseName || 'Imported JS AutoShape',
      category: 'Custom JS',
      description: `Imported from ${fileName || 'custom.js'}`,
      iconName: 'Code2',
      defaultParams: {},
      paramSchema: [],
      jsSourceCode: rawText,
    };
  }

  return null;
}

/**
 * Parses an imported `.osito.json` or `.json` project bundle.
 */
export function parseOsitoProjectBundle(rawText: string): {
  gridSettings?: Partial<GridAndSnapSettings>;
  objects?: CanvasObject[];
  slices?: CanvasSlice[];
  customAutoShapes?: AutoShapeDefinition[];
} | null {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) return null;
  try {
    const data = JSON.parse(rawText);
    if (data && Array.isArray(data.objects)) {
      const validObjects = (data.objects as CanvasObject[])
        .filter((o) => o && typeof o === 'object' && typeof o.id === 'string' && typeof o.type === 'string')
        .map((o) => ({
          ...o,
          x: Number.isFinite(o.x) ? o.x : 0,
          y: Number.isFinite(o.y) ? o.y : 0,
          width: Math.max(1, Number.isFinite(o.width) ? o.width : 1),
          height: Math.max(1, Number.isFinite(o.height) ? o.height : 1),
        }));
      const validSlices = Array.isArray(data.slices)
        ? (data.slices as CanvasSlice[])
            .filter((s) => s && typeof s === 'object' && typeof s.id === 'string')
            .map((s) => ({
              ...s,
              x: Number.isFinite(s.x) ? s.x : 0,
              y: Number.isFinite(s.y) ? s.y : 0,
              width: Math.max(1, Number.isFinite(s.width) ? s.width : 1),
              height: Math.max(1, Number.isFinite(s.height) ? s.height : 1),
            }))
        : undefined;
      return {
        gridSettings: data.gridSettings,
        objects: validObjects,
        slices: validSlices,
        customAutoShapes: Array.isArray(data.customAutoShapes)
          ? data.customAutoShapes
          : undefined,
      };
    }
  } catch {
    // Not a valid JSON project bundle
  }
  return null;
}

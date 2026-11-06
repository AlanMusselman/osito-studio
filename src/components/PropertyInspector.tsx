import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  Code2,
  GitCommit,
  Image as ImageIcon,
  Grid,
  Trash2,
  RefreshCw,
  Move,
  Wand2,
  FlipHorizontal,
  FlipVertical,
  Contrast,
  Sun,
  CheckSquare,
  Square,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Pencil,
  Zap,
  Scissors,
  Download,
  Eye,
  Copy,
  Crosshair,
} from 'lucide-react';
import {
  ToolId,
  CanvasObject,
  AutoShapeDefinition,
  PixelSelection,
  ToolOptions,
  GridAndSnapSettings,
  AutoShapeObject,
  VectorPathObject,
  BitmapObject,
  TextObject,
  CanvasSlice,
  ComponentStateId,
  ComponentStateOverride,
  ConnectorRoutingStyle,
} from '../types/editor';
import { LiveColorPicker, shiftHexBrightness, toHexColor } from './LiveColorPicker';

export interface PropertyInspectorProps {
  activeTool: ToolId;
  selectedObjects: CanvasObject[];
  selectedNodeIds: string[];
  autoShapes: AutoShapeDefinition[];
  pixelSelection: PixelSelection;
  toolOptions: ToolOptions;
  gridSettings: GridAndSnapSettings;
  onUpdateObject: (id: string, patch: Partial<CanvasObject>, recordHistory?: boolean) => void;
  onRecordHistorySnapshot?: () => void;
  onUpdateToolOptions: (patch: Partial<ToolOptions>) => void;
  onUpdateGridSettings: (patch: Partial<GridAndSnapSettings>) => void;
  onOpenAutoShapeStudio: () => void;
  onConvertAutoShapeToPaths: (id: string) => void;
  onRasterizeObject: (id: string) => void;
  onClearPixelSelection: () => void;
  onInvertPixelSelection: () => void;
  onDeleteSelectedPixels: () => void;
  onFloatSelectedPixels: () => void;
  onCutSelectedPixels?: () => void;
  onCopySelectedPixels?: () => void;
  onPasteSelectedPixels?: () => void;
  onApplyPixelEffect: (
    effect:
      | 'invert'
      | 'grayscale'
      | 'sepia'
      | 'brighten'
      | 'contrast'
      | 'pixelate-4px'
      | 'flip-h'
      | 'flip-v'
  ) => void;
  onChangeSelectedNodesType: (pointType: 'corner' | 'smooth' | 'symmetric') => void;
  slices?: CanvasSlice[];
  selectedSliceId?: string | null;
  onSelectSlice?: (sliceId: string | null) => void;
  onUpdateSlice?: (sliceId: string, patch: Partial<CanvasSlice>) => void;
  onDeleteSlice?: (sliceId: string) => void;
  onExportSlicesZip?: () => void;
  onAddSliceFromSelection?: () => void;
  onSmartRemoveBackground?: () => void;
  onVectorizeSelectionToBezier?: () => void;
  onSelectComponentState?: (stateId: ComponentStateId) => void;
  onAutoGenerateComponentStates?: () => void;
  onBranchConnectedNode?: (sourceId: string, direction: 'e' | 's') => void;
  onDuplicateSelected?: () => void;
  onFlipSelected?: (axis: 'h' | 'v') => void;
  onCenterSelectedOnCanvas?: () => void;
  onShowToast?: (msg: string) => void;
}

export type OsitoLiveEffectPresetId =
  | 'neon-cyber-glow'
  | 'tactile-glassmorphism'
  | 'web20-gel-button'
  | 'hard-blueprint-shadow'
  | 'gold-foil-badge'
  | 'clear-effects';

const OSITO_LIVE_EFFECT_PRESETS: Array<{
  id: OsitoLiveEffectPresetId;
  label: string;
  title: string;
  accentClass: string;
}> = [
  {
    id: 'neon-cyber-glow',
    label: '✦ Neon Glow',
    title: 'Neon Cyber Glow — Electric cyan gradient, luminous rim stroke & 22px outer neon bloom',
    accentClass: 'border-cyan-500/50 text-cyan-200 hover:bg-cyan-500/20',
  },
  {
    id: 'tactile-glassmorphism',
    label: '◈ Glass UI',
    title: 'Tactile Glassmorphism — Frosted translucent slate, crisp 1.5px specular border & deep ambient shadow',
    accentClass: 'border-slate-400/50 text-slate-200 hover:bg-slate-400/20',
  },
  {
    id: 'web20-gel-button',
    label: '● Web 2.0 Gel',
    title: 'Retro Web 2.0 Gel Button — Classic Aqua gloss gradient & sapphire shadow',
    accentClass: 'border-sky-400/50 text-sky-200 hover:bg-sky-400/20',
  },
  {
    id: 'hard-blueprint-shadow',
    label: '▣ Blueprint',
    title: 'Hard Blueprint Shadow — Crisp 0px-blur neo-brutalist offset shadow (+5px, +5px) & technical cyan frame',
    accentClass: 'border-indigo-400/50 text-indigo-200 hover:bg-indigo-400/20',
  },
  {
    id: 'gold-foil-badge',
    label: '★ Gold Foil',
    title: 'Crisp Gold Foil Badge — Executive metallic gold gradient, champagne highlight rim & warm amber glow',
    accentClass: 'border-amber-400/60 text-amber-200 hover:bg-amber-400/20',
  },
  {
    id: 'clear-effects',
    label: '✕ Clear FX',
    title: 'Clear Live Effects — Strip all drop shadows/glows, restore 100% opacity, and reset bitmap filters',
    accentClass: 'border-[#383838] text-[#a3a3a3] hover:text-[#ffffff] hover:bg-[#242424]',
  },
];

const BITMAP_TOOL_IDS: ToolId[] = [
  'marquee-rect',
  'marquee-oval',
  'lasso',
  'magic-wand',
  'brush',
  'pencil',
  'eraser',
  'bucket',
];

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({
  activeTool,
  selectedObjects,
  selectedNodeIds,
  autoShapes,
  pixelSelection,
  toolOptions,
  gridSettings,
  onUpdateObject,
  onRecordHistorySnapshot,
  onUpdateToolOptions,
  onUpdateGridSettings,
  onOpenAutoShapeStudio,
  onConvertAutoShapeToPaths,
  onRasterizeObject,
  onClearPixelSelection,
  onInvertPixelSelection,
  onDeleteSelectedPixels,
  onFloatSelectedPixels,
  onCutSelectedPixels,
  onCopySelectedPixels,
  onPasteSelectedPixels,
  onApplyPixelEffect,
  onChangeSelectedNodesType,
  slices,
  selectedSliceId = null,
  onSelectSlice,
  onUpdateSlice,
  onDeleteSlice,
  onExportSlicesZip,
  onAddSliceFromSelection,
  onSmartRemoveBackground,
  onVectorizeSelectionToBezier,
  onSelectComponentState,
  onAutoGenerateComponentStates,
  onBranchConnectedNode,
  onDuplicateSelected,
  onFlipSelected,
  onCenterSelectedOnCanvas,
  onShowToast,
}) => {
  const [panelTitle, setPanelTitle] = useState<string>('PROPERTIES INSPECTOR');
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [draftTitle, setDraftTitle] = useState<string>('PROPERTIES INSPECTOR');

  const handleStartRename = () => {
    setDraftTitle(panelTitle);
    setIsEditingTitle(true);
  };

  const handleCommitRename = () => {
    const trimmed = draftTitle.trim();
    if (trimmed) {
      setPanelTitle(trimmed);
    }
    setIsEditingTitle(false);
  };

  const isBitmapToolActive = BITMAP_TOOL_IDS.includes(activeTool);
  const primaryObj = selectedObjects.length === 1 ? selectedObjects[0] : null;
  const selectedSlice =
    (selectedSliceId && slices?.find((s) => s.id === selectedSliceId)) ||
    (activeTool === 'slice' && slices && slices.length > 0 ? slices[0] : null) ||
    null;

  // Determine badge title & pure monochrome greyscale styling
  let badgeTitle = 'CANVAS DOCUMENT';
  let badgeSubtitle = `${gridSettings.canvasWidth} × ${gridSettings.canvasHeight} px`;
  let badgeAccent = 'border-[#383838] bg-[#161616] text-[#e5e5e5]';
  let badgeDot = 'bg-[#a3a3a3]';

  if (selectedSlice && (selectedSliceId || activeTool === 'slice')) {
    badgeTitle = 'WEB SLICE OVERLAY';
    badgeSubtitle = `#${selectedSlice.name} (${selectedSlice.width}×${selectedSlice.height}px)`;
    badgeAccent = 'border-[#888888] bg-[#1c1c1c] text-[#ffffff]';
    badgeDot = 'bg-[#ffffff]';
  } else if (pixelSelection.active || isBitmapToolActive) {
    badgeTitle = pixelSelection.active ? 'PIXEL MARQUEE' : 'BITMAP TOOL';
    badgeSubtitle = pixelSelection.active
      ? `${Math.round(pixelSelection.bounds.width)} × ${Math.round(pixelSelection.bounds.height)} px ants`
      : `Mode: ${activeTool.toUpperCase()}`;
    badgeAccent = 'border-[#737373] bg-[#1c1c1c] text-[#ffffff]';
    badgeDot = 'bg-[#ffffff] animate-pulse';
  } else if (selectedObjects.length > 1) {
    badgeTitle = 'MULTI-SELECTION';
    badgeSubtitle = `${selectedObjects.length} Hybrid Objects`;
    badgeAccent = 'border-[#888888] bg-[#242424] text-[#ffffff]';
    badgeDot = 'bg-[#ffffff]';
  } else if (primaryObj) {
    if (primaryObj.type === 'autoshape') {
      const def = autoShapes.find((s) => s.id === primaryObj.shapeDefId);
      badgeTitle = 'JS AUTOSHAPE';
      badgeSubtitle = def?.name || primaryObj.name;
      badgeAccent = 'border-[#888888] bg-[#1c1c1c] text-[#ffffff]';
      badgeDot = 'bg-[#ffffff] rotate-45';
    } else if (primaryObj.type === 'vector-path') {
      badgeTitle = 'VECTOR PATH';
      badgeSubtitle = `${primaryObj.nodes.length} Bezier Nodes`;
      badgeAccent = 'border-[#737373] bg-[#1c1c1c] text-[#ffffff]';
      badgeDot = 'bg-[#d4d4d4]';
    } else if (primaryObj.type === 'bitmap') {
      badgeTitle = 'BITMAP OBJECT';
      badgeSubtitle = `${primaryObj.pixelWidth} × ${primaryObj.pixelHeight} px Raster`;
      badgeAccent = 'border-[#737373] bg-[#1c1c1c] text-[#ffffff]';
      badgeDot = 'bg-[#d4d4d4]';
    } else if (primaryObj.type === 'text') {
      badgeTitle = 'TEXT OBJECT';
      badgeSubtitle = `${primaryObj.fontFamily} (${primaryObj.fontSize}px)`;
      badgeAccent = 'border-[#737373] bg-[#1c1c1c] text-[#ffffff]';
      badgeDot = 'bg-[#d4d4d4]';
    }
  }

  const renderNumberInput = (
    label: string,
    value: number,
    onChange: (val: number) => void,
    min?: number,
    max?: number,
    step = 1,
    widthClass = 'w-14'
  ) => (
    <label className="flex items-center gap-1 text-[11px] text-[#a3a3a3]">
      <span className="font-mono text-[10px] text-[#a3a3a3] select-none">{label}</span>
      <input
        type="number"
        value={Number.isFinite(value) ? Math.round(value * 10) / 10 : 0}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const parsed = parseFloat(e.target.value);
          if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
            let clamped = parsed;
            if (min !== undefined) clamped = Math.max(min, clamped);
            if (max !== undefined) clamped = Math.min(max, clamped);
            onChange(clamped);
          }
        }}
        className={`${widthClass} bg-[#0a0a0a] border border-[#2e2e2e] focus:border-[#ffffff] rounded-none px-1.5 py-0.5 text-[11px] font-mono text-[#f5f5f5] outline-none`}
      />
    </label>
  );

  const updateObjectWithStateVariant = (
    obj: CanvasObject,
    rawPatch: Partial<CanvasObject>,
    recordHistory = true
  ) => {
    const patch: Partial<CanvasObject> = { ...rawPatch };

    // When changing primary Fill color on a gradient AutoShape/Vector, harmonize fillGradientEnd automatically
    if (patch.fill !== undefined && patch.fill !== 'none') {
      if (obj.fillType === 'none' && patch.fillType === undefined) {
        patch.fillType = 'solid';
      }
      const effectiveFillType = patch.fillType ?? obj.fillType;
      if (
        (effectiveFillType === 'linear-gradient' || effectiveFillType === 'radial-gradient') &&
        patch.fillGradientEnd === undefined
      ) {
        patch.fillGradientEnd = shiftHexBrightness(patch.fill, -26);
      }
    }

    if (patch.stroke !== undefined && patch.stroke !== 'none') {
      if ((!obj.strokeWidth || obj.strokeWidth <= 0) && patch.strokeWidth === undefined) {
        patch.strokeWidth = 2;
      }
    }

    const activeState: ComponentStateId = obj.activeState || 'default';
    if (activeState !== 'default') {
      const existingVariants = obj.stateVariants || {};
      const currentVariant: ComponentStateOverride = {
        ...(existingVariants[activeState] || {}),
      };
      if (patch.fill !== undefined) currentVariant.fill = patch.fill;
      if (patch.fillGradientEnd !== undefined)
        currentVariant.fillGradientEnd = patch.fillGradientEnd;
      if (patch.stroke !== undefined) currentVariant.stroke = patch.stroke;
      if (patch.strokeWidth !== undefined)
        currentVariant.strokeWidth = patch.strokeWidth;
      if (patch.opacity !== undefined) currentVariant.opacity = patch.opacity;
      if (patch.shadow !== undefined) currentVariant.shadow = patch.shadow;

      onUpdateObject(
        obj.id,
        {
          ...patch,
          stateVariants: {
            ...existingVariants,
            [activeState]: currentVariant,
          },
        },
        recordHistory
      );
    } else if (obj.stateVariants) {
      const existingDefault: ComponentStateOverride = {
        ...(obj.stateVariants.default || {}),
      };
      if (patch.fill !== undefined) existingDefault.fill = patch.fill;
      if (patch.fillGradientEnd !== undefined)
        existingDefault.fillGradientEnd = patch.fillGradientEnd;
      if (patch.stroke !== undefined) existingDefault.stroke = patch.stroke;
      if (patch.strokeWidth !== undefined)
        existingDefault.strokeWidth = patch.strokeWidth;
      if (patch.opacity !== undefined) existingDefault.opacity = patch.opacity;
      if (patch.shadow !== undefined) existingDefault.shadow = patch.shadow;

      onUpdateObject(
        obj.id,
        {
          ...patch,
          stateVariants: {
            ...obj.stateVariants,
            default: existingDefault,
          },
        },
        recordHistory
      );
    } else {
      onUpdateObject(obj.id, patch, recordHistory);
    }
  };

  const handleSelectState = (obj: CanvasObject, stateId: ComponentStateId) => {
    if (onSelectComponentState) {
      onSelectComponentState(stateId);
      return;
    }
    const existingVariants = obj.stateVariants || {};
    const defaultVariant: ComponentStateOverride = existingVariants.default || {
      fill: obj.fill,
      fillGradientEnd: obj.fillGradientEnd,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
      opacity: obj.opacity,
      shadow: obj.shadow,
    };
    const targetVariant =
      stateId === 'default'
        ? defaultVariant
        : existingVariants[stateId] || defaultVariant;

    onUpdateObject(obj.id, {
      activeState: stateId,
      fill: targetVariant.fill ?? obj.fill,
      fillGradientEnd: targetVariant.fillGradientEnd ?? obj.fillGradientEnd,
      stroke: targetVariant.stroke ?? obj.stroke,
      strokeWidth: targetVariant.strokeWidth ?? obj.strokeWidth,
      opacity: targetVariant.opacity ?? obj.opacity,
      shadow: targetVariant.shadow ?? obj.shadow,
      stateVariants: {
        ...existingVariants,
        default: defaultVariant,
      },
    });
  };

  const handleAutoGenerateStates = (obj: CanvasObject) => {
    if (onAutoGenerateComponentStates) {
      onAutoGenerateComponentStates();
      return;
    }
    const baseVariant: ComponentStateOverride = obj.stateVariants?.default || {
      fill: obj.fill,
      fillGradientEnd: obj.fillGradientEnd,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
      opacity: obj.opacity,
      shadow: obj.shadow,
    };
    onUpdateObject(obj.id, {
      activeState: obj.activeState || 'default',
      stateVariants: {
        default: baseVariant,
        hover: {
          fill: '#383838',
          stroke: '#ffffff',
          strokeWidth: Math.max(1, baseVariant.strokeWidth ?? obj.strokeWidth),
          opacity: 1,
          offsetY: -1,
          scale: 1.02,
          shadow: {
            enabled: true,
            color: 'rgba(0,0,0,0.6)',
            blur: 14,
            offsetX: 0,
            offsetY: 5,
          },
        },
        active: {
          fill: '#161616',
          stroke: '#a3a3a3',
          strokeWidth: Math.max(1, baseVariant.strokeWidth ?? obj.strokeWidth),
          opacity: 0.95,
          offsetY: 1,
          scale: 0.98,
        },
        dark: {
          fill: '#141414',
          stroke: '#e5e5e5',
          strokeWidth: Math.max(1, baseVariant.strokeWidth ?? obj.strokeWidth),
          opacity: 1,
        },
      },
    });
  };

  const applyLiveEffectPresetToSingleObject = (
    obj: CanvasObject,
    presetId: OsitoLiveEffectPresetId,
    recordHistory = true
  ) => {
    const isText = obj.type === 'text';
    const isBitmap = obj.type === 'bitmap';

    if (presetId === 'clear-effects') {
      if (isBitmap) {
        onUpdateObject(
          obj.id,
          {
            opacity: 1,
            shadow: {
              enabled: false,
              color: 'rgba(0,0,0,0)',
              blur: 0,
              offsetX: 0,
              offsetY: 0,
            },
            filters: {
              brightness: 0,
              contrast: 0,
              blur: 0,
              hueRotate: 0,
              invert: false,
              pixelate: 1,
            },
          } as Partial<BitmapObject>,
          recordHistory
        );
      } else {
        updateObjectWithStateVariant(
          obj,
          {
            opacity: 1,
            shadow: {
              enabled: false,
              color: 'rgba(0,0,0,0)',
              blur: 0,
              offsetX: 0,
              offsetY: 0,
            },
          },
          recordHistory
        );
      }
      return;
    }

    if (presetId === 'neon-cyber-glow') {
      if (isBitmap) {
        const bmp = obj as BitmapObject;
        onUpdateObject(
          obj.id,
          {
            opacity: 1,
            shadow: {
              enabled: true,
              color: 'rgba(6, 182, 212, 0.92)',
              blur: 22,
              offsetX: 0,
              offsetY: 0,
            },
            filters: { ...bmp.filters, brightness: 12, contrast: 22 },
          } as Partial<BitmapObject>,
          recordHistory
        );
      } else {
        updateObjectWithStateVariant(
          obj,
          {
            fill: isText ? '#67e8f9' : '#06b6d4',
            fillType: isText ? 'solid' : 'linear-gradient',
            fillGradientEnd: '#3b82f6',
            stroke: isText ? 'none' : '#67e8f9',
            strokeWidth: isText ? 0 : 2,
            opacity: 1,
            shadow: {
              enabled: true,
              color: 'rgba(6, 182, 212, 0.92)',
              blur: 22,
              offsetX: 0,
              offsetY: 0,
            },
          },
          recordHistory
        );
      }
      return;
    }

    if (presetId === 'tactile-glassmorphism') {
      if (isBitmap) {
        onUpdateObject(
          obj.id,
          {
            opacity: 0.9,
            shadow: {
              enabled: true,
              color: 'rgba(15, 23, 42, 0.78)',
              blur: 24,
              offsetX: 0,
              offsetY: 8,
            },
          } as Partial<BitmapObject>,
          recordHistory
        );
      } else {
        updateObjectWithStateVariant(
          obj,
          {
            fill: isText ? '#f8fafc' : '#1e293b',
            fillType: isText ? 'solid' : 'linear-gradient',
            fillGradientEnd: '#0f172a',
            stroke: isText ? 'none' : '#e2e8f0',
            strokeWidth: isText ? 0 : 1.5,
            opacity: isText ? 0.96 : 0.88,
            shadow: {
              enabled: true,
              color: 'rgba(15, 23, 42, 0.78)',
              blur: 24,
              offsetX: 0,
              offsetY: 8,
            },
          },
          recordHistory
        );
      }
      return;
    }

    if (presetId === 'web20-gel-button') {
      if (isBitmap) {
        const bmp = obj as BitmapObject;
        onUpdateObject(
          obj.id,
          {
            opacity: 1,
            shadow: {
              enabled: true,
              color: 'rgba(29, 78, 216, 0.72)',
              blur: 18,
              offsetX: 0,
              offsetY: 6,
            },
            filters: { ...bmp.filters, brightness: 8, contrast: 16 },
          } as Partial<BitmapObject>,
          recordHistory
        );
      } else {
        updateObjectWithStateVariant(
          obj,
          {
            fill: isText ? '#e0f2fe' : '#38bdf8',
            fillType: isText ? 'solid' : 'linear-gradient',
            fillGradientEnd: '#1d4ed8',
            stroke: isText ? 'none' : '#bae6fd',
            strokeWidth: isText ? 0 : 2,
            opacity: 1,
            shadow: {
              enabled: true,
              color: 'rgba(29, 78, 216, 0.72)',
              blur: 16,
              offsetX: 0,
              offsetY: 6,
            },
          },
          recordHistory
        );
      }
      return;
    }

    if (presetId === 'hard-blueprint-shadow') {
      if (isBitmap) {
        onUpdateObject(
          obj.id,
          {
            opacity: 1,
            shadow: {
              enabled: true,
              color: '#06b6d4',
              blur: 0,
              offsetX: 5,
              offsetY: 5,
            },
          } as Partial<BitmapObject>,
          recordHistory
        );
      } else {
        updateObjectWithStateVariant(
          obj,
          {
            fill: isText ? '#ffffff' : '#0f172a',
            fillType: 'solid',
            fillGradientEnd: '#1e293b',
            stroke: isText ? 'none' : '#38bdf8',
            strokeWidth: isText ? 0 : 2,
            opacity: 1,
            shadow: {
              enabled: true,
              color: '#06b6d4',
              blur: 0,
              offsetX: isText ? 3 : 5,
              offsetY: isText ? 3 : 5,
            },
          },
          recordHistory
        );
      }
      return;
    }

    if (presetId === 'gold-foil-badge') {
      if (isBitmap) {
        const bmp = obj as BitmapObject;
        onUpdateObject(
          obj.id,
          {
            opacity: 1,
            shadow: {
              enabled: true,
              color: 'rgba(245, 158, 11, 0.75)',
              blur: 18,
              offsetX: 0,
              offsetY: 4,
            },
            filters: { ...bmp.filters, brightness: 10, contrast: 18 },
          } as Partial<BitmapObject>,
          recordHistory
        );
      } else {
        updateObjectWithStateVariant(
          obj,
          {
            fill: isText ? '#fde047' : '#f59e0b',
            fillType: isText ? 'solid' : 'linear-gradient',
            fillGradientEnd: '#b45309',
            stroke: isText ? 'none' : '#fef08a',
            strokeWidth: isText ? 0 : 2,
            opacity: 1,
            shadow: {
              enabled: true,
              color: 'rgba(245, 158, 11, 0.75)',
              blur: 18,
              offsetX: 0,
              offsetY: 4,
            },
          },
          recordHistory
        );
      }
    }
  };

  const handleApplyLiveEffectPreset = (
    targets: CanvasObject[],
    presetId: OsitoLiveEffectPresetId
  ) => {
    if (targets.length === 0) return;
    onRecordHistorySnapshot?.();
    targets.forEach((obj) => {
      applyLiveEffectPresetToSingleObject(obj, presetId, false);
    });
    const presetMeta = OSITO_LIVE_EFFECT_PRESETS.find((p) => p.id === presetId);
    onShowToast?.(
      presetId === 'clear-effects'
        ? `Cleared Live Effects on ${targets.length} selected layer${targets.length > 1 ? 's' : ''}`
        : `Applied Osito "${presetMeta?.label || presetId}" Live Filter to ${
            targets.length
          } layer${targets.length > 1 ? 's' : ''}!`
    );
  };

  const handleFallbackFlipSingleObject = (obj: CanvasObject, axis: 'h' | 'v') => {
    if (onFlipSelected) {
      onFlipSelected(axis);
      return;
    }
    if (obj.type === 'bitmap') {
      onApplyPixelEffect(axis === 'h' ? 'flip-h' : 'flip-v');
      return;
    }
    if (obj.type === 'vector-path') {
      const vec = obj as VectorPathObject;
      const flippedNodes = vec.nodes.map((n) =>
        axis === 'h'
          ? {
              ...n,
              x: Math.round((vec.width - n.x) * 10) / 10,
              cp1x: Math.round((vec.width - n.cp1x) * 10) / 10,
              cp2x: Math.round((vec.width - n.cp2x) * 10) / 10,
            }
          : {
              ...n,
              y: Math.round((vec.height - n.y) * 10) / 10,
              cp1y: Math.round((vec.height - n.cp1y) * 10) / 10,
              cp2y: Math.round((vec.height - n.cp2y) * 10) / 10,
            }
      );
      onUpdateObject(vec.id, { nodes: flippedNodes } as Partial<VectorPathObject>, true);
      onShowToast?.(`Flipped "${vec.name}" ${axis === 'h' ? 'Horizontally' : 'Vertically'}`);
      return;
    }
    const nextRot = ((obj.rotation || 0) + 180) % 360;
    onUpdateObject(obj.id, { rotation: nextRot }, true);
    onShowToast?.(`Rotated/Flipped "${obj.name}" (${nextRot}°)`);
  };

  const handleFallbackCenterObjects = (targets: CanvasObject[]) => {
    if (onCenterSelectedOnCanvas) {
      onCenterSelectedOnCanvas();
      return;
    }
    if (targets.length === 0) return;
    onRecordHistorySnapshot?.();
    const minX = Math.min(...targets.map((t) => t.x));
    const maxX = Math.max(...targets.map((t) => t.x + t.width));
    const minY = Math.min(...targets.map((t) => t.y));
    const maxY = Math.max(...targets.map((t) => t.y + t.height));
    const dx = Math.round((gridSettings.canvasWidth - (maxX - minX)) / 2 - minX);
    const dy = Math.round((gridSettings.canvasHeight - (maxY - minY)) / 2 - minY);
    targets.forEach((t) => {
      onUpdateObject(t.id, { x: Math.round(t.x + dx), y: Math.round(t.y + dy) }, false);
    });
    onShowToast?.(`Centered ${targets.length} layer${targets.length > 1 ? 's' : ''} on canvas`);
  };

  const renderLiveEffectsAndQuickActionsBar = (targets: CanvasObject[]) => {
    if (targets.length === 0) return null;
    const primary = targets[0];
    return (
      <div className="flex items-center gap-1">
        <div className="h-4 w-[1px] bg-[#2e2e2e] mx-0.5" />
        {/* Compact Osito "+Live FX" Preset Dropdown */}
        <select
          value=""
          onChange={(e) => {
            const val = e.target.value as OsitoLiveEffectPresetId;
            if (!val) return;
            handleApplyLiveEffectPreset(targets, val);
          }}
          title="Apply 1-Click Osito Live Effect Preset"
          className="bg-[#181818] hover:bg-[#242424] border border-[#383838] rounded-none px-1.5 py-0.5 text-[10px] font-mono text-[#d4d4d4] hover:text-white outline-none cursor-pointer"
        >
          <option value="">+ Live FX...</option>
          {OSITO_LIVE_EFFECT_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>

        {/* Compact Icon-First Quick Layer Actions */}
        {onDuplicateSelected && (
          <button
            type="button"
            onClick={() => onDuplicateSelected()}
            title="Duplicate Selected Layer(s) (Ctrl+Alt+D)"
            className="p-1 rounded-none bg-[#181818] hover:bg-[#2a2a2a] text-[#d4d4d4] hover:text-[#ffffff] border border-[#383838] transition-colors"
          >
            <Copy className="w-3 h-3" />
          </button>
        )}
        <button
          type="button"
          onClick={() => handleFallbackFlipSingleObject(primary, 'h')}
          title="Flip Horizontally (Mirror X)"
          className="p-1 rounded-none bg-[#181818] hover:bg-[#2a2a2a] text-[#d4d4d4] hover:text-[#ffffff] border border-[#383838] transition-colors"
        >
          <FlipHorizontal className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => handleFallbackFlipSingleObject(primary, 'v')}
          title="Flip Vertically (Mirror Y)"
          className="p-1 rounded-none bg-[#181818] hover:bg-[#2a2a2a] text-[#d4d4d4] hover:text-[#ffffff] border border-[#383838] transition-colors"
        >
          <FlipVertical className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => handleFallbackCenterObjects(targets)}
          title={`Center on ${gridSettings.canvasWidth}×${gridSettings.canvasHeight}px Canvas`}
          className="p-1 rounded-none bg-[#181818] hover:bg-[#2a2a2a] text-[#d4d4d4] hover:text-[#ffffff] border border-[#383838] transition-colors"
        >
          <Crosshair className="w-3 h-3" />
        </button>
      </div>
    );
  };

  const renderCommonTransformAndStyle = (obj: CanvasObject) => {
    const activeState: ComponentStateId = obj.activeState || 'default';
    return (
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 pb-1.5 border-b border-[#242424] w-full">
        {/* Coordinates & Dimensions */}
        <div className="flex items-center gap-2">
          {renderNumberInput('X', obj.x, (v) => onUpdateObject(obj.id, { x: v }))}
          {renderNumberInput('Y', obj.y, (v) => onUpdateObject(obj.id, { y: v }))}
          {renderNumberInput(
            'W',
            obj.width,
            (v) => onUpdateObject(obj.id, { width: Math.max(1, v) }),
            1
          )}
          {renderNumberInput(
            'H',
            obj.height,
            (v) => onUpdateObject(obj.id, { height: Math.max(1, v) }),
            1
          )}
          {renderNumberInput(
            '∠°',
            obj.rotation,
            (v) => onUpdateObject(obj.id, { rotation: v }),
            -360,
            360,
            1,
            'w-12'
          )}
        </div>

        <div className="h-4 w-[1px] bg-[#2e2e2e]" />

        {/* Fill & Gradient Controls (for non-bitmap objects) */}
        {obj.type !== 'bitmap' && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-[#a3a3a3]">Fill</span>
            <select
              value={obj.fillType}
              onChange={(e) =>
                updateObjectWithStateVariant(obj, {
                  fillType: e.target.value as CanvasObject['fillType'],
                })
              }
              className="bg-[#0a0a0a] border border-[#2e2e2e] rounded-none px-1.5 py-0.5 text-[11px] text-[#e5e5e5] outline-none"
            >
              <option value="solid">Solid</option>
              <option value="linear-gradient">Linear Grad</option>
              <option value="radial-gradient">Radial Grad</option>
              <option value="none">None</option>
            </select>

            <LiveColorPicker
              value={toHexColor(obj.fill, '#3b82f6')}
              onDragStart={() => onRecordHistorySnapshot?.()}
              onChange={(hex, recordHistory = false) => {
                updateObjectWithStateVariant(obj, { fill: hex }, recordHistory);
                onUpdateToolOptions({ primaryColor: hex });
              }}
              title="Primary Fill Color — Click or Press-and-Hold & Drag around to scrub color live on object"
              className="w-5 h-5"
            />

            {(obj.fillType === 'linear-gradient' || obj.fillType === 'radial-gradient') && (
              <LiveColorPicker
                value={toHexColor(obj.fillGradientEnd, '#6366f1')}
                onDragStart={() => onRecordHistorySnapshot?.()}
                onChange={(hex, recordHistory = false) =>
                  updateObjectWithStateVariant(obj, { fillGradientEnd: hex }, recordHistory)
                }
                title="Gradient End Color — Click or Press-and-Hold & Drag around to scrub color live"
                className="w-5 h-5"
              />
            )}
          </div>
        )}

        {/* Stroke Controls */}
        {obj.type !== 'bitmap' && (
          <>
            <div className="h-4 w-[1px] bg-[#2e2e2e]" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase text-[#a3a3a3]">Stroke</span>
              <LiveColorPicker
                value={toHexColor(obj.stroke, '#94a3b8')}
                onDragStart={() => onRecordHistorySnapshot?.()}
                onChange={(hex, recordHistory = false) => {
                  updateObjectWithStateVariant(obj, { stroke: hex }, recordHistory);
                  onUpdateToolOptions({ secondaryColor: hex });
                }}
                title="Stroke Color — Click or Press-and-Hold & Drag around to scrub stroke color live"
                className="w-5 h-5"
              />
              <input
                type="number"
                min={0}
                max={40}
                step={1}
                value={Number.isFinite(obj.strokeWidth) ? obj.strokeWidth : 0}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (Number.isNaN(val)) return;
                  updateObjectWithStateVariant(obj, {
                    strokeWidth: Math.max(0, Math.min(40, val)),
                  });
                }}
                className="w-11 bg-[#0a0a0a] border border-[#2e2e2e] rounded-none px-1 py-0.5 text-[11px] font-mono text-[#f5f5f5]"
                title="Stroke Width (px)"
              />
              <select
                value={obj.strokeAlign}
                onChange={(e) =>
                  onUpdateObject(obj.id, {
                    strokeAlign: e.target.value as CanvasObject['strokeAlign'],
                  })
                }
                title="Osito Stroke Alignment"
                className="bg-[#0a0a0a] border border-[#2e2e2e] rounded-none px-1 py-0.5 text-[10px] text-[#d4d4d4]"
              >
                <option value="inside">Inside</option>
                <option value="center">Center</option>
                <option value="outside">Outside</option>
              </select>
            </div>
          </>
        )}

        <div className="h-4 w-[1px] bg-[#2e2e2e]" />

        {/* Opacity & Pixel Snap */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-[10px] font-mono text-[#a3a3a3]">
            <span>α%</span>
            <input
              type="range"
              min={5}
              max={100}
              value={Math.round(obj.opacity * 100)}
              onMouseDown={() => onRecordHistorySnapshot?.()}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (Number.isNaN(val)) return;
                updateObjectWithStateVariant(
                  obj,
                  {
                    opacity: Math.max(0.05, Math.min(1, val / 100)),
                  },
                  false
                );
              }}
              className="w-16 accent-[#e5e5e5] cursor-pointer"
            />
            <span className="w-7 text-[#e5e5e5]">{Math.round(obj.opacity * 100)}%</span>
          </label>

          <button
            type="button"
            onClick={() => onUpdateObject(obj.id, { pixelSnap: !obj.pixelSnap })}
            title="Osito 1px Pixel-Snap (rounds vertices & offsets odd strokes +0.5px)"
            className={`px-2 py-0.5 rounded-none text-[10px] font-mono border flex items-center gap-1 transition-colors ${
              obj.pixelSnap
                ? 'bg-[#e5e5e5] border-[#ffffff] text-[#0a0a0a] font-semibold'
                : 'bg-[#0a0a0a] border-[#2e2e2e] text-[#737373]'
            }`}
          >
            <Grid className="w-3 h-3" />
            <span>1px Snap</span>
          </button>

          {/* Drop Shadow Toggle */}
          <button
            type="button"
            onClick={() =>
              updateObjectWithStateVariant(obj, {
                shadow: { ...obj.shadow, enabled: !obj.shadow.enabled },
              })
            }
            className={`px-2 py-0.5 rounded-none text-[10px] font-mono border transition-colors ${
              obj.shadow.enabled
                ? 'bg-[#262626] border-[#888888] text-[#ffffff]'
                : 'bg-[#0a0a0a] border-[#2e2e2e] text-[#737373]'
            }`}
          >
            Shadow
          </button>
        </div>

        <div className="h-4 w-[1px] bg-[#2e2e2e]" />

        {/* Interactive Component State Bar */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono uppercase text-[#a3a3a3] mr-0.5">
            STATE:
          </span>
          {(
            [
              { id: 'default', label: 'Default' },
              { id: 'hover', label: ':hover' },
              { id: 'active', label: ':active' },
              { id: 'dark', label: 'Dark' },
            ] as const
          ).map((st) => {
            const isSelectedState = activeState === st.id;
            const hasSavedVariant = Boolean(obj.stateVariants?.[st.id]);
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => handleSelectState(obj, st.id)}
                title={`Switch component state to ${st.label}${
                  st.id !== 'default'
                    ? ' (editing Fill, Stroke, or Opacity saves to this state)'
                    : ''
                }`}
                className={`px-1.5 py-0.5 rounded-none text-[10px] font-mono border transition-colors ${
                  isSelectedState
                    ? 'bg-[#e5e5e5] border-[#ffffff] text-[#0a0a0a] font-bold'
                    : hasSavedVariant
                    ? 'bg-[#1c1c1c] border-[#737373] text-[#ffffff] hover:bg-[#262626]'
                    : 'bg-[#0a0a0a] border-[#2e2e2e] text-[#a3a3a3] hover:text-[#e5e5e5]'
                }`}
              >
                {st.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => handleAutoGenerateStates(obj)}
            title="Auto-generate Default, :hover, :active, and Dark Mode component states"
            className="px-1.5 py-0.5 rounded-none text-[10px] font-mono bg-[#242424] hover:bg-[#e5e5e5] text-[#ffffff] hover:text-[#0a0a0a] border border-[#737373] flex items-center gap-0.5 transition-colors"
          >
            <Zap className="w-2.5 h-2.5" />
            <span>Auto-States</span>
          </button>

          {onAddSliceFromSelection && (
            <button
              type="button"
              onClick={onAddSliceFromSelection}
              title="Create a Retina Web Slice (@1x/@2x/@3x) around this selected object"
              className="px-1.5 py-0.5 rounded-none text-[10px] font-mono bg-[#161616] hover:bg-[#242424] text-[#d4d4d4] hover:text-[#ffffff] border border-[#383838] flex items-center gap-0.5"
            >
              <Scissors className="w-2.5 h-2.5" />
              <span>+Slice</span>
            </button>
          )}
        </div>
        {renderLiveEffectsAndQuickActionsBar([obj])}
      </div>
    );
  };

  const renderBitmapMarqueeAndToolControls = () => (
    <div className="flex flex-col gap-2 w-full">
      {/* Row 1: Selection Mode, Tolerance, Feather, Brush Options */}
      <div className="flex flex-wrap items-center gap-3 pb-1.5 border-b border-[#242424]">
        {/* Selection Boolean Mode */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono uppercase text-[#d4d4d4] mr-1">
            Marquee:
          </span>
          {(
            [
              { id: 'new', label: 'New' },
              { id: 'add', label: '+Add (⇧)' },
              { id: 'subtract', label: '-Sub (⌥)' },
              { id: 'intersect', label: '∩ Intersect' },
            ] as const
          ).map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => onUpdateToolOptions({ selectionOperation: mode.id })}
              className={`px-2 py-0.5 rounded-none text-[10px] font-mono border transition-colors ${
                toolOptions.selectionOperation === mode.id
                  ? 'bg-[#e5e5e5] border-[#ffffff] text-[#0a0a0a] font-semibold'
                  : 'bg-[#0a0a0a] border-[#2e2e2e] text-[#a3a3a3] hover:text-[#e5e5e5]'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="h-4 w-[1px] bg-[#2e2e2e]" />

        {/* Magic Wand Tolerance & Contiguous */}
        <div className="flex items-center gap-2">
          <Wand2 className="w-3.5 h-3.5 text-[#d4d4d4]" />
          <label className="flex items-center gap-1.5 text-[10px] font-mono text-[#d4d4d4]">
            <span>Tolerance</span>
            <input
              type="range"
              min={0}
              max={255}
              value={toolOptions.wandTolerance}
              onChange={(e) =>
                onUpdateToolOptions({ wandTolerance: Number(e.target.value) })
              }
              className="w-20 accent-[#e5e5e5] cursor-pointer"
            />
            <span className="w-7 text-[#ffffff]">{toolOptions.wandTolerance}</span>
          </label>

          <button
            type="button"
            onClick={() =>
              onUpdateToolOptions({ wandContiguous: !toolOptions.wandContiguous })
            }
            className={`px-2 py-0.5 rounded-none text-[10px] font-mono border flex items-center gap-1 ${
              toolOptions.wandContiguous
                ? 'bg-[#262626] border-[#888888] text-[#ffffff]'
                : 'bg-[#0a0a0a] border-[#2e2e2e] text-[#a3a3a3]'
            }`}
          >
            {toolOptions.wandContiguous ? (
              <CheckSquare className="w-3 h-3" />
            ) : (
              <Square className="w-3 h-3" />
            )}
            <span>Contiguous</span>
          </button>
        </div>

        <div className="h-4 w-[1px] bg-[#2e2e2e]" />

        {/* Feather & Brush Size */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1 text-[10px] font-mono text-[#d4d4d4]">
            <span>Feather</span>
            <input
              type="number"
              min={0}
              max={30}
              value={toolOptions.selectionFeather}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (Number.isNaN(val)) return;
                onUpdateToolOptions({
                  selectionFeather: Math.max(0, Math.min(30, val)),
                });
              }}
              className="w-11 bg-[#0a0a0a] border border-[#2e2e2e] rounded-none px-1 py-0.5 text-[11px] text-[#f5f5f5]"
            />
            <span>px</span>
          </label>

          <label className="flex items-center gap-1 text-[10px] font-mono text-[#d4d4d4]">
            <span>Brush Size</span>
            <input
              type="range"
              min={1}
              max={64}
              value={toolOptions.brushSize}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (Number.isNaN(val)) return;
                onUpdateToolOptions({ brushSize: Math.max(1, Math.min(128, val)) });
              }}
              className="w-16 accent-[#e5e5e5] cursor-pointer"
            />
            <span className="w-7 text-[#ffffff]">{toolOptions.brushSize}px</span>
          </label>

          <label className="flex items-center gap-1 text-[10px] font-mono text-[#d4d4d4]">
            <span>Opacity</span>
            <input
              type="number"
              min={1}
              max={100}
              value={toolOptions.brushOpacity}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (Number.isNaN(val)) return;
                onUpdateToolOptions({
                  brushOpacity: Math.min(100, Math.max(1, val)),
                });
              }}
              className="w-12 bg-[#0a0a0a] border border-[#2e2e2e] rounded-none px-1 py-0.5 text-[11px] text-[#f5f5f5]"
            />
            <span>%</span>
          </label>
        </div>
      </div>

      {/* Row 2: Active Marching Ants Actions & Destructive Pixel Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-[#d4d4d4] bg-[#161616] border border-[#383838] px-2 py-0.5 rounded-none">
            {pixelSelection.active
              ? `Ants: (${Math.round(pixelSelection.bounds.x)}, ${Math.round(
                  pixelSelection.bounds.y
                )}) ${Math.round(pixelSelection.bounds.width)}×${Math.round(
                  pixelSelection.bounds.height
                )}px`
              : 'Drag on canvas or click with Magic Wand to select pixels'}
          </span>

          <button
            type="button"
            disabled={!pixelSelection.active}
            onClick={() => onCutSelectedPixels?.()}
            title="Cut selected bitmap pixels to clipboard and leave unselected bitmap untouched (Ctrl+X / ⌘+X)"
            className="px-2 py-1 rounded-none text-[11px] font-semibold bg-[#e5e5e5] hover:bg-[#ffffff] disabled:opacity-40 text-[#0a0a0a] border border-[#ffffff] flex items-center gap-1 transition-all"
          >
            <Scissors className="w-3 h-3" />
            <span>Cut (Ctrl+X)</span>
          </button>

          <button
            type="button"
            disabled={!pixelSelection.active}
            onClick={() => onCopySelectedPixels?.()}
            title="Copy selected bitmap pixels to clipboard (Ctrl+C / ⌘+C)"
            className="px-2 py-1 rounded-none text-[11px] font-medium bg-[#242424] hover:bg-[#e5e5e5] disabled:opacity-40 text-[#e5e5e5] hover:text-[#0a0a0a] border border-[#484848] flex items-center gap-1 transition-all"
          >
            <span>Copy (Ctrl+C)</span>
          </button>

          <button
            type="button"
            onClick={() => onPasteSelectedPixels?.()}
            title="Paste cut or copied bitmap selection as a new layer on top (Ctrl+V / ⌘+V)"
            className="px-2 py-1 rounded-none text-[11px] font-medium bg-[#242424] hover:bg-[#e5e5e5] text-[#e5e5e5] hover:text-[#0a0a0a] border border-[#484848] flex items-center gap-1 transition-all"
          >
            <span>Paste (Ctrl+V)</span>
          </button>

          <button
            type="button"
            disabled={!pixelSelection.active}
            onClick={onFloatSelectedPixels}
            className="px-2 py-1 rounded-none text-[11px] font-medium bg-[#242424] hover:bg-[#e5e5e5] disabled:opacity-40 text-[#e5e5e5] hover:text-[#0a0a0a] border border-[#484848] flex items-center gap-1 transition-all"
          >
            <Move className="w-3 h-3" />
            <span>Float / Move Pixels</span>
          </button>

          <button
            type="button"
            disabled={!pixelSelection.active}
            onClick={onDeleteSelectedPixels}
            className="px-2 py-1 rounded-none text-[11px] font-medium bg-[#1c1c1c] hover:bg-[#383838] disabled:opacity-40 text-[#d4d4d4] border border-[#484848] flex items-center gap-1 transition-all"
          >
            <Trash2 className="w-3 h-3" />
            <span>Erase Pixels (Del)</span>
          </button>

          <button
            type="button"
            disabled={!pixelSelection.active}
            onClick={onInvertPixelSelection}
            className="px-2 py-1 rounded-none text-[11px] font-mono bg-[#161616] hover:bg-[#242424] disabled:opacity-40 text-[#e5e5e5] border border-[#383838] flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Invert Marquee</span>
          </button>

          <button
            type="button"
            disabled={!pixelSelection.active}
            onClick={onClearPixelSelection}
            className="px-2 py-1 rounded-none text-[11px] font-mono bg-[#161616] hover:bg-[#242424] disabled:opacity-40 text-[#d4d4d4] border border-[#383838]"
          >
            Deselect (Ctrl+D)
          </button>
        </div>

        {/* Instant Pixel Filters & AI / Vectorize Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onSmartRemoveBackground?.()}
            title="AI Smart Background Removal — flood-remove background pixels to transparency"
            className="px-2 py-0.5 rounded-none text-[10px] font-mono font-semibold bg-[#e5e5e5] hover:bg-[#ffffff] text-[#0a0a0a] border border-[#ffffff] flex items-center gap-1 transition-colors"
          >
            <Wand2 className="w-3 h-3 text-[#0a0a0a]" />
            <span>AI Smart Remove BG</span>
          </button>

          <button
            type="button"
            onClick={() => onVectorizeSelectionToBezier?.()}
            title="Trace active pixel selection or bitmap silhouette into editable Cubic Bezier Vector Path"
            className="px-2 py-0.5 rounded-none text-[10px] font-mono font-semibold bg-[#242424] hover:bg-[#e5e5e5] text-[#ffffff] hover:text-[#0a0a0a] border border-[#737373] flex items-center gap-1 transition-colors"
          >
            <GitCommit className="w-3 h-3" />
            <span>Trace → Bezier [VEC]</span>
          </button>

          <div className="h-4 w-[1px] bg-[#2e2e2e] mx-0.5" />

          <span className="text-[10px] font-mono text-[#a3a3a3] mr-1">Pixel FX:</span>
          <button
            type="button"
            onClick={() => onApplyPixelEffect('invert')}
            className="px-2 py-0.5 rounded-none text-[10px] font-mono bg-[#161616] hover:bg-[#242424] text-[#d4d4d4] hover:text-[#ffffff] border border-[#2e2e2e]"
          >
            Invert Colors
          </button>
          <button
            type="button"
            onClick={() => onApplyPixelEffect('grayscale')}
            className="px-2 py-0.5 rounded-none text-[10px] font-mono bg-[#161616] hover:bg-[#242424] text-[#d4d4d4] hover:text-[#ffffff] border border-[#2e2e2e]"
          >
            Grayscale
          </button>
          <button
            type="button"
            onClick={() => onApplyPixelEffect('pixelate-4px')}
            className="px-2 py-0.5 rounded-none text-[10px] font-mono bg-[#161616] hover:bg-[#242424] text-[#d4d4d4] hover:text-[#ffffff] border border-[#2e2e2e]"
          >
            Pixelate 4px
          </button>
          <button
            type="button"
            onClick={() => onApplyPixelEffect('contrast')}
            className="px-2 py-0.5 rounded-none text-[10px] font-mono bg-[#161616] hover:bg-[#242424] text-[#d4d4d4] hover:text-[#ffffff] border border-[#2e2e2e]"
          >
            Contrast+
          </button>
        </div>
      </div>
    </div>
  );

  const renderAutoShapeInspector = (obj: AutoShapeObject) => {
    const def = autoShapes.find((s) => s.id === obj.shapeDefId);
    return (
      <div className="flex flex-col gap-2 w-full">
        {renderCommonTransformAndStyle(obj)}

        {/* Row 2: Dynamic JS AutoShape Parameters + Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-mono uppercase text-[#e5e5e5] flex items-center gap-1">
              <span>JS Params:</span>
            </span>

            {def?.paramSchema.map((param) => {
              const currentVal = obj.params[param.key] ?? param.defaultValue;
              if (param.type === 'number') {
                return (
                  <label
                    key={param.key}
                    className="flex items-center gap-1.5 text-[11px] font-mono text-[#d4d4d4] bg-[#0a0a0a] px-2 py-0.5 rounded-none border border-[#2e2e2e]"
                  >
                    <span className="text-[#e5e5e5]">{param.label}</span>
                    <input
                      type="range"
                      min={param.min ?? 0}
                      max={param.max ?? 100}
                      step={param.step ?? 1}
                      value={Number.isFinite(Number(currentVal)) ? Number(currentVal) : Number(param.defaultValue)}
                      onMouseDown={() => onRecordHistorySnapshot?.()}
                      onChange={(e) => {
                        const parsed = parseFloat(e.target.value);
                        if (Number.isNaN(parsed)) return;
                        onUpdateObject(
                          obj.id,
                          {
                            params: {
                              ...obj.params,
                              [param.key]: parsed,
                            },
                          } as Partial<AutoShapeObject>,
                          false
                        );
                      }}
                      className="w-20 accent-[#e5e5e5] cursor-pointer"
                    />
                    <span className="text-[#ffffff] w-8 text-right">
                      {Math.round(Number(currentVal) * 10) / 10}
                    </span>
                  </label>
                );
              }
              if (param.type === 'boolean') {
                return (
                  <button
                    key={param.key}
                    type="button"
                    onClick={() =>
                      onUpdateObject(obj.id, {
                        params: {
                          ...obj.params,
                          [param.key]: !currentVal,
                        },
                      } as Partial<AutoShapeObject>)
                    }
                    className={`px-2 py-0.5 rounded-none text-[10px] font-mono border ${
                      currentVal
                        ? 'bg-[#262626] border-[#888888] text-[#ffffff]'
                        : 'bg-[#0a0a0a] border-[#2e2e2e] text-[#a3a3a3]'
                    }`}
                  >
                    {param.label}: {currentVal ? 'ON' : 'OFF'}
                  </button>
                );
              }
              return null;
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {onBranchConnectedNode && (
              <>
                <button
                  type="button"
                  onClick={() => onBranchConnectedNode(obj.id, 'e')}
                  title="Lucidchart Quick Branch: Spawn a connected child Sitemap/Workflow node to the right"
                  className="px-2 py-1 rounded-none text-[11px] font-mono bg-[#1a1a1a] hover:bg-[#e5e5e5] text-[#e5e5e5] hover:text-[#0a0a0a] border border-[#525252] flex items-center gap-1 transition-all"
                >
                  <span>+ Branch Right →</span>
                </button>
                <button
                  type="button"
                  onClick={() => onBranchConnectedNode(obj.id, 's')}
                  title="Lucidchart Quick Branch: Spawn a connected child Sitemap/Workflow node below"
                  className="px-2 py-1 rounded-none text-[11px] font-mono bg-[#1a1a1a] hover:bg-[#e5e5e5] text-[#e5e5e5] hover:text-[#0a0a0a] border border-[#525252] flex items-center gap-1 transition-all"
                >
                  <span>+ Branch Down ↓</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onOpenAutoShapeStudio}
              className="px-2.5 py-1 rounded-none text-[11px] font-semibold bg-[#e5e5e5] hover:bg-[#ffffff] text-[#0a0a0a] border border-[#ffffff] flex items-center gap-1 transition-all"
            >
              <Code2 className="w-3.5 h-3.5 text-[#0a0a0a]" />
              <span>Edit AutoShape JS</span>
            </button>

            <button
              type="button"
              onClick={() => onConvertAutoShapeToPaths(obj.id)}
              title="Ungroup procedural AutoShape into editable Bezier Vector Paths"
              className="px-2.5 py-1 rounded-none text-[11px] font-medium bg-[#1c1c1c] hover:bg-[#2e2e2e] text-[#e5e5e5] border border-[#484848] flex items-center gap-1 transition-all"
            >
              <GitCommit className="w-3.5 h-3.5 text-[#d4d4d4]" />
              <span>Convert to Vector Paths</span>
            </button>

            <button
              type="button"
              onClick={() => onRasterizeObject(obj.id)}
              title="Flatten into a pixel-editable Bitmap Layer"
              className="px-2.5 py-1 rounded-none text-[11px] font-medium bg-[#161616] hover:bg-[#242424] text-[#d4d4d4] border border-[#383838] flex items-center gap-1 transition-all"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#a3a3a3]" />
              <span>Rasterize to Bitmap</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderVectorPathInspector = (obj: VectorPathObject) => (
    <div className="flex flex-col gap-2 w-full">
      {renderCommonTransformAndStyle(obj)}

      {obj.connectorMeta ? (
        /* Row 2: Lucidchart-Style Smart Connector Routing, Arrowhead & Label Controls */
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-[#ffffff] bg-[#242424] border border-[#525252] px-2 py-0.5 rounded-none">
              SMART CONNECTOR
            </span>

            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono uppercase text-[#a3a3a3]">Routing:</span>
              {(
                [
                  { id: 'elbow', label: '90° Elbow' },
                  { id: 'curved', label: 'Curved S-Line' },
                  { id: 'straight', label: 'Straight' },
                ] as Array<{ id: ConnectorRoutingStyle; label: string }>
              ).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() =>
                    onUpdateObject(obj.id, {
                      connectorMeta: { ...obj.connectorMeta!, routing: r.id },
                    } as Partial<VectorPathObject>)
                  }
                  className={`px-2 py-0.5 rounded-none text-[10px] font-mono border transition-colors ${
                    obj.connectorMeta?.routing === r.id
                      ? 'bg-[#e5e5e5] border-[#ffffff] text-[#0a0a0a] font-bold'
                      : 'bg-[#0a0a0a] border-[#2e2e2e] text-[#a3a3a3] hover:text-[#ffffff]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="h-4 w-[1px] bg-[#2e2e2e]" />

            <button
              type="button"
              onClick={() =>
                onUpdateObject(obj.id, {
                  connectorMeta: {
                    ...obj.connectorMeta!,
                    startArrow: !obj.connectorMeta?.startArrow,
                  },
                } as Partial<VectorPathObject>)
              }
              className={`px-2 py-0.5 rounded-none text-[10px] font-mono border ${
                obj.connectorMeta?.startArrow
                  ? 'bg-[#262626] border-[#888888] text-[#ffffff]'
                  : 'bg-[#0a0a0a] border-[#2e2e2e] text-[#737373]'
              }`}
            >
              ← Start Arrow
            </button>

            <button
              type="button"
              onClick={() =>
                onUpdateObject(obj.id, {
                  connectorMeta: {
                    ...obj.connectorMeta!,
                    endArrow: obj.connectorMeta?.endArrow === false ? true : false,
                  },
                } as Partial<VectorPathObject>)
              }
              className={`px-2 py-0.5 rounded-none text-[10px] font-mono border ${
                obj.connectorMeta?.endArrow !== false
                  ? 'bg-[#262626] border-[#888888] text-[#ffffff]'
                  : 'bg-[#0a0a0a] border-[#2e2e2e] text-[#737373]'
              }`}
            >
              End Arrow →
            </button>

            <div className="h-4 w-[1px] bg-[#2e2e2e]" />

            <label className="flex items-center gap-1.5 text-[10px] font-mono text-[#a3a3a3]">
              <span>Label:</span>
              <input
                type="text"
                placeholder="Yes / No / API..."
                value={obj.connectorMeta?.label || ''}
                onChange={(e) =>
                  onUpdateObject(obj.id, {
                    connectorMeta: {
                      ...obj.connectorMeta!,
                      label: e.target.value,
                    },
                  } as Partial<VectorPathObject>)
                }
                className="w-28 bg-[#0a0a0a] border border-[#2e2e2e] rounded-none px-1.5 py-0.5 text-[11px] font-mono text-[#ffffff]"
              />
            </label>
          </div>

          <span className="text-[10px] font-mono text-[#a3a3a3]">
            Auto-routes dynamically when connected shapes move or resize
          </span>
        </div>
      ) : (
        /* Row 2: Bezier Node Controls & Path Operations */
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onUpdateObject(obj.id, { closed: !obj.closed })}
              className={`px-2.5 py-1 rounded-none text-[11px] font-mono border flex items-center gap-1 ${
                obj.closed
                  ? 'bg-[#262626] border-[#888888] text-[#ffffff]'
                  : 'bg-[#0a0a0a] border-[#2e2e2e] text-[#a3a3a3]'
              }`}
            >
              {obj.closed ? (
                <CheckSquare className="w-3.5 h-3.5" />
              ) : (
                <Square className="w-3.5 h-3.5" />
              )}
              <span>Closed Path</span>
            </button>

            <div className="h-4 w-[1px] bg-[#2e2e2e]" />

            <span className="text-[10px] font-mono uppercase text-[#d4d4d4]">
              Bezier Nodes ({selectedNodeIds.length || obj.nodes.length}):
            </span>

            {(
              [
                { type: 'corner', label: 'Corner Point' },
                { type: 'smooth', label: 'Smooth Curve' },
                { type: 'symmetric', label: 'Symmetric Handles' },
              ] as const
            ).map((pt) => (
              <button
                key={pt.type}
                type="button"
                onClick={() => onChangeSelectedNodesType(pt.type)}
                className="px-2 py-1 rounded-none text-[11px] font-mono bg-[#161616] hover:bg-[#242424] text-[#e5e5e5] hover:text-[#ffffff] border border-[#383838] hover:border-[#737373] transition-colors"
              >
                {pt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {onBranchConnectedNode && (
              <>
                <button
                  type="button"
                  onClick={() => onBranchConnectedNode(obj.id, 'e')}
                  className="px-2 py-1 rounded-none text-[10px] font-mono bg-[#1a1a1a] hover:bg-[#e5e5e5] text-[#e5e5e5] hover:text-[#0a0a0a] border border-[#525252]"
                >
                  + Branch Right →
                </button>
                <button
                  type="button"
                  onClick={() => onBranchConnectedNode(obj.id, 's')}
                  className="px-2 py-1 rounded-none text-[10px] font-mono bg-[#1a1a1a] hover:bg-[#e5e5e5] text-[#e5e5e5] hover:text-[#0a0a0a] border border-[#525252]"
                >
                  + Branch Down ↓
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => onRasterizeObject(obj.id)}
              className="px-2.5 py-1 rounded-none text-[11px] font-medium bg-[#161616] hover:bg-[#242424] text-[#e5e5e5] border border-[#383838] flex items-center gap-1"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#a3a3a3]" />
              <span>Rasterize to Bitmap</span>
            </button>
          </div>
        </div>
      )}

      {/* Row 3 (when selected vector path is an Interactive Nested Menu Navbar) */}
      {Boolean(obj.params?.hasNestedMenu) && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#262626]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold uppercase text-[#0a0a0a] bg-[#e5e5e5] px-2 py-0.5 rounded-none">
              INTERACTIVE NESTED NAVBAR
            </span>
            <span className="text-[10px] font-mono text-[#a3a3a3]">Dropdown Tab:</span>
            {[
              { idx: 0, label: 'Closed' },
              { idx: 1, label: '1. Tab 1 ▾' },
              { idx: 2, label: '2. Tab 2 ▾' },
              { idx: 3, label: '3. Tab 3 ▾' },
              { idx: 4, label: '4. Tab 4 ▾' },
            ].map((tab) => {
              const activeOpen = Number(obj.params?.openMenuIndex ?? 0) === tab.idx;
              return (
                <button
                  key={tab.idx}
                  type="button"
                  onClick={() =>
                    onUpdateObject(obj.id, {
                      params: {
                        ...(obj.params || {}),
                        openMenuIndex: tab.idx,
                        openSubMenuIndex: tab.idx > 0 ? Number(obj.params?.openSubMenuIndex || 1) : 0,
                      },
                    } as Partial<VectorPathObject>)
                  }
                  className={`px-2 py-0.5 rounded-none text-[10px] font-mono border transition ${
                    activeOpen
                      ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-bold'
                      : 'bg-[#0a0a0a] text-[#d4d4d4] border-[#2e2e2e] hover:border-[#737373]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}

            {Number(obj.params?.openMenuIndex ?? 0) > 0 && (
              <>
                <div className="h-4 w-[1px] bg-[#2e2e2e]" />
                <span className="text-[10px] font-mono text-[#a3a3a3]">Level-2 Submenu:</span>
                {[1, 2, 3, 4].map((subIdx) => {
                  const isSubActive = Number(obj.params?.openSubMenuIndex ?? 1) === subIdx;
                  return (
                    <button
                      key={subIdx}
                      type="button"
                      onClick={() =>
                        onUpdateObject(obj.id, {
                          params: {
                            ...(obj.params || {}),
                            openSubMenuIndex: subIdx,
                          },
                        } as Partial<VectorPathObject>)
                      }
                      className={`px-1.5 py-0.5 rounded-none text-[10px] font-mono border transition ${
                        isSubActive
                          ? 'bg-[#262626] text-[#ffffff] border-[#ffffff] font-bold'
                          : 'bg-[#0a0a0a] text-[#a3a3a3] border-[#2e2e2e]'
                      }`}
                    >
                      Row {subIdx} ▸
                    </button>
                  );
                })}
              </>
            )}
          </div>

          <label className="flex items-center gap-1.5 text-[10px] font-mono text-[#a3a3a3]">
            <span>Top Labels (|):</span>
            <input
              type="text"
              value={
                typeof obj.params?.customTopMenus === 'string' && obj.params.customTopMenus
                  ? obj.params.customTopMenus
                  : 'Products ▾|Solutions ▾|Developers ▾|Pricing ▾'
              }
              onChange={(e) =>
                onUpdateObject(obj.id, {
                  params: {
                    ...(obj.params || {}),
                    customTopMenus: e.target.value,
                  },
                } as Partial<VectorPathObject>)
              }
              className="w-64 bg-[#0a0a0a] border border-[#383838] px-2 py-0.5 text-[10px] font-mono text-[#ffffff]"
              title="Customize the 4 top-level navbar menu buttons separated by | (rendered in Live Preview Mode)"
            />
          </label>
        </div>
      )}
    </div>
  );

  const renderBitmapObjectInspector = (obj: BitmapObject) => (
    <div className="flex flex-col gap-2 w-full">
      {renderCommonTransformAndStyle(obj)}

      {/* Row 2: Osito Live Bitmap Filters & Destructive Effects */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-mono uppercase text-[#d4d4d4] flex items-center gap-1">
            <Sliders className="w-3 h-3" />
            <span>Live Filters:</span>
          </span>

          <label className="flex items-center gap-1 text-[10px] font-mono text-[#d4d4d4]">
            <Sun className="w-3 h-3 text-[#d4d4d4]" />
            <span>Bright</span>
            <input
              type="range"
              min={-100}
              max={100}
              value={obj.filters.brightness}
              onMouseDown={() => onRecordHistorySnapshot?.()}
              onChange={(e) =>
                onUpdateObject(
                  obj.id,
                  {
                    filters: { ...obj.filters, brightness: Number(e.target.value) },
                  } as Partial<BitmapObject>,
                  false
                )
              }
              className="w-16 accent-[#e5e5e5]"
            />
          </label>

          <label className="flex items-center gap-1 text-[10px] font-mono text-[#d4d4d4]">
            <Contrast className="w-3 h-3 text-[#d4d4d4]" />
            <span>Contrast</span>
            <input
              type="range"
              min={-100}
              max={100}
              value={obj.filters.contrast}
              onMouseDown={() => onRecordHistorySnapshot?.()}
              onChange={(e) =>
                onUpdateObject(
                  obj.id,
                  {
                    filters: { ...obj.filters, contrast: Number(e.target.value) },
                  } as Partial<BitmapObject>,
                  false
                )
              }
              className="w-16 accent-[#e5e5e5]"
            />
          </label>

          <label className="flex items-center gap-1 text-[10px] font-mono text-[#d4d4d4]">
            <span>Blur</span>
            <input
              type="range"
              min={0}
              max={20}
              value={obj.filters.blur}
              onMouseDown={() => onRecordHistorySnapshot?.()}
              onChange={(e) =>
                onUpdateObject(
                  obj.id,
                  {
                    filters: { ...obj.filters, blur: Number(e.target.value) },
                  } as Partial<BitmapObject>,
                  false
                )
              }
              className="w-14 accent-[#e5e5e5]"
            />
          </label>

          <label className="flex items-center gap-1 text-[10px] font-mono text-[#d4d4d4]">
            <span>Pixelate</span>
            <input
              type="range"
              min={1}
              max={24}
              value={obj.filters.pixelate}
              onMouseDown={() => onRecordHistorySnapshot?.()}
              onChange={(e) =>
                onUpdateObject(
                  obj.id,
                  {
                    filters: { ...obj.filters, pixelate: Number(e.target.value) },
                  } as Partial<BitmapObject>,
                  false
                )
              }
              className="w-14 accent-[#e5e5e5] cursor-pointer"
            />
            <span className="w-6 text-[#ffffff]">{obj.filters.pixelate}px</span>
          </label>

          {(obj.filters.brightness !== 0 ||
            obj.filters.contrast !== 0 ||
            obj.filters.blur !== 0 ||
            obj.filters.pixelate > 1 ||
            obj.filters.invert) && (
            <button
              type="button"
              onClick={() =>
                onUpdateObject(
                  obj.id,
                  {
                    filters: {
                      brightness: 0,
                      contrast: 0,
                      blur: 0,
                      pixelate: 1,
                      invert: false,
                    },
                  } as Partial<BitmapObject>,
                  true
                )
              }
              title="Reset all non-destructive live bitmap filters"
              className="px-2 py-0.5 rounded-none text-[10px] font-mono bg-[#161616] hover:bg-[#242424] text-[#d4d4d4] hover:text-[#ffffff] border border-[#383838]"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Destructive Pixel Buffer Transforms & AI / Vectorize Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onSmartRemoveBackground?.()}
            title="AI Smart Background Removal — flood-remove background pixels to transparency"
            className="px-2 py-1 rounded-none text-[10px] font-mono font-semibold bg-[#e5e5e5] hover:bg-[#ffffff] text-[#0a0a0a] border border-[#ffffff] flex items-center gap-1 transition-colors"
          >
            <Wand2 className="w-3 h-3 text-[#0a0a0a]" />
            <span>AI Smart Remove BG</span>
          </button>

          <button
            type="button"
            onClick={() => onVectorizeSelectionToBezier?.()}
            title="Trace bitmap silhouette into an editable Cubic Bezier Vector Path"
            className="px-2 py-1 rounded-none text-[10px] font-mono font-semibold bg-[#242424] hover:bg-[#e5e5e5] text-[#ffffff] hover:text-[#0a0a0a] border border-[#737373] flex items-center gap-1 transition-colors"
          >
            <GitCommit className="w-3 h-3" />
            <span>Trace → Bezier [VEC]</span>
          </button>

          <div className="h-4 w-[1px] bg-[#2e2e2e] mx-0.5" />

          <button
            type="button"
            onClick={() => onApplyPixelEffect('pixelate-4px')}
            title="Apply Mosaic Pixelation to active selection or bitmap"
            className="px-2 py-1 rounded-none text-[10px] font-mono bg-[#161616] hover:bg-[#242424] text-[#e5e5e5] border border-[#383838]"
          >
            Pixelate
          </button>
          <button
            type="button"
            onClick={() => onApplyPixelEffect('invert')}
            className="px-2 py-1 rounded-none text-[10px] font-mono bg-[#161616] hover:bg-[#242424] text-[#e5e5e5] border border-[#383838]"
          >
            Invert
          </button>
          <button
            type="button"
            onClick={() => onApplyPixelEffect('grayscale')}
            className="px-2 py-1 rounded-none text-[10px] font-mono bg-[#161616] hover:bg-[#242424] text-[#e5e5e5] border border-[#383838]"
          >
            Grayscale
          </button>
          <button
            type="button"
            onClick={() => onApplyPixelEffect('flip-h')}
            title="Flip Bitmap Horizontally"
            className="p-1 rounded-none bg-[#161616] hover:bg-[#242424] text-[#e5e5e5] border border-[#383838]"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onApplyPixelEffect('flip-v')}
            title="Flip Bitmap Vertically"
            className="p-1 rounded-none bg-[#161616] hover:bg-[#242424] text-[#e5e5e5] border border-[#383838]"
          >
            <FlipVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderTextObjectInspector = (obj: TextObject) => (
    <div className="flex flex-col gap-2 w-full">
      {renderCommonTransformAndStyle(obj)}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-[11px] font-mono text-[#d4d4d4]">
            <span>Text:</span>
            <input
              type="text"
              value={obj.text}
              onChange={(e) =>
                onUpdateObject(obj.id, { text: e.target.value } as Partial<TextObject>)
              }
              className="w-48 bg-[#0a0a0a] border border-[#2e2e2e] focus:border-[#ffffff] rounded-none px-2 py-0.5 text-xs text-[#f5f5f5] outline-none"
            />
          </label>

          <select
            value={obj.fontFamily}
            onChange={(e) =>
              onUpdateObject(obj.id, {
                fontFamily: e.target.value,
              } as Partial<TextObject>)
            }
            className="bg-[#0a0a0a] border border-[#2e2e2e] rounded-none px-2 py-0.5 text-[11px] text-[#e5e5e5]"
          >
            <option value="Inter, system-ui, sans-serif">Inter UI</option>
            <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
            <option value="'Space Grotesk', sans-serif">Space Grotesk</option>
            <option value="Georgia, serif">Georgia Serif</option>
          </select>

          {renderNumberInput(
            'Size',
            obj.fontSize,
            (v) =>
              onUpdateObject(obj.id, {
                fontSize: Math.max(8, v),
              } as Partial<TextObject>),
            8,
            200
          )}

          {renderNumberInput(
            'Track',
            obj.letterSpacing ?? 0,
            (v) =>
              onUpdateObject(obj.id, {
                letterSpacing: Math.max(-10, Math.min(50, v)),
              } as Partial<TextObject>),
            -10,
            50,
            0.5,
            'w-12'
          )}

          <select
            value={obj.fontWeight}
            onChange={(e) =>
              onUpdateObject(obj.id, {
                fontWeight: e.target.value as TextObject['fontWeight'],
              } as Partial<TextObject>)
            }
            className="bg-[#0a0a0a] border border-[#2e2e2e] rounded-none px-1.5 py-0.5 text-[11px] text-[#e5e5e5]"
          >
            <option value="400">Regular</option>
            <option value="500">Medium</option>
            <option value="600">SemiBold</option>
            <option value="700">Bold</option>
          </select>

          <div className="flex items-center border border-[#2e2e2e] rounded-none overflow-hidden">
            {(
              [
                { align: 'left', icon: AlignLeft },
                { align: 'center', icon: AlignCenter },
                { align: 'right', icon: AlignRight },
              ] as const
            ).map(({ align, icon: Icon }) => (
              <button
                key={align}
                type="button"
                onClick={() =>
                  onUpdateObject(obj.id, { textAlign: align } as Partial<TextObject>)
                }
                className={`p-1 rounded-none ${
                  obj.textAlign === align
                    ? 'bg-[#e5e5e5] text-[#0a0a0a]'
                    : 'bg-[#0a0a0a] text-[#a3a3a3]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRasterizeObject(obj.id)}
          className="px-2.5 py-1 rounded-none text-[11px] font-medium bg-[#161616] hover:bg-[#242424] text-[#e5e5e5] border border-[#383838] flex items-center gap-1"
        >
          <ImageIcon className="w-3.5 h-3.5 text-[#a3a3a3]" />
          <span>Rasterize Text to Pixels</span>
        </button>
      </div>
    </div>
  );

  const renderWebSliceInspector = (slice: CanvasSlice | null) => {
    const allSlices = slices || [];
    const activeScales: Array<1 | 2 | 3> =
      slice?.scales && slice.scales.length > 0 ? slice.scales : [1, 2, 3];
    const activeFormats: Array<'webp' | 'avif' | 'svg' | 'png'> =
      slice?.formats && slice.formats.length > 0 ? slice.formats : ['webp', 'avif', 'svg'];

    const toggleScale = (sc: 1 | 2 | 3) => {
      if (!slice || !onUpdateSlice) return;
      const exists = activeScales.includes(sc);
      const next = exists
        ? activeScales.filter((s) => s !== sc)
        : ([...activeScales, sc].sort() as Array<1 | 2 | 3>);
      if (next.length > 0) {
        onUpdateSlice(slice.id, { scales: next });
      }
    };

    const toggleFormat = (fmt: 'webp' | 'avif' | 'svg' | 'png') => {
      if (!slice || !onUpdateSlice) return;
      const exists = activeFormats.includes(fmt);
      const next = exists
        ? activeFormats.filter((f) => f !== fmt)
        : [...activeFormats, fmt];
      if (next.length > 0) {
        onUpdateSlice(slice.id, { formats: next });
      }
    };

    return (
      <div className="flex flex-col gap-2 w-full">
        {/* Row 1: Slice Selector, Name, X / Y / W / H Coordinates & Delete */}
        <div className="flex flex-wrap items-center gap-3 pb-1.5 border-b border-[#242424]">
          <div className="flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-[#ffffff]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#e5e5e5]">
              Slice:
            </span>
            <select
              value={slice?.id || ''}
              onChange={(e) => onSelectSlice?.(e.target.value || null)}
              className="bg-[#0a0a0a] border border-[#383838] rounded-none px-2 py-0.5 text-[11px] font-mono text-[#ffffff]"
            >
              {allSlices.map((s) => (
                <option key={s.id} value={s.id}>
                  #{s.name} ({s.width}×{s.height})
                </option>
              ))}
            </select>
          </div>

          {slice && (
            <>
              <label className="flex items-center gap-1 text-[11px] text-[#a3a3a3]">
                <span className="font-mono text-[10px]">Name</span>
                <input
                  type="text"
                  value={slice.name}
                  onChange={(e) =>
                    onUpdateSlice?.(slice.id, {
                      name: e.target.value.replace(/\s+/g, '-').toLowerCase(),
                    })
                  }
                  className="w-36 bg-[#0a0a0a] border border-[#2e2e2e] focus:border-[#ffffff] rounded-none px-2 py-0.5 text-[11px] font-mono text-[#ffffff] outline-none"
                />
              </label>

              <div className="flex items-center gap-2">
                {renderNumberInput('X', slice.x, (v) =>
                  onUpdateSlice?.(slice.id, { x: Math.max(0, Math.round(v)) })
                )}
                {renderNumberInput('Y', slice.y, (v) =>
                  onUpdateSlice?.(slice.id, { y: Math.max(0, Math.round(v)) })
                )}
                {renderNumberInput(
                  'W',
                  slice.width,
                  (v) => onUpdateSlice?.(slice.id, { width: Math.max(1, Math.round(v)) }),
                  1
                )}
                {renderNumberInput(
                  'H',
                  slice.height,
                  (v) => onUpdateSlice?.(slice.id, { height: Math.max(1, Math.round(v)) }),
                  1
                )}
              </div>
            </>
          )}
        </div>

        {/* Row 2: Retina Scales (@1x/@2x/@3x), Formats (WebP/AVIF/SVG), Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {slice && (
              <>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono uppercase text-[#a3a3a3]">Scales:</span>
                  {([1, 2, 3] as const).map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => toggleScale(sc)}
                      className={`px-1.5 py-0.5 rounded-none text-[10px] font-mono border transition-colors ${
                        activeScales.includes(sc)
                          ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-semibold'
                          : 'bg-[#0a0a0a] text-[#a3a3a3] border-[#2e2e2e]'
                      }`}
                    >
                      @{sc}x
                    </button>
                  ))}
                </div>

                <div className="h-4 w-[1px] bg-[#2e2e2e]" />

                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono uppercase text-[#a3a3a3]">Formats:</span>
                  {(['webp', 'avif', 'svg'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => toggleFormat(fmt)}
                      className={`px-1.5 py-0.5 rounded-none text-[10px] font-mono uppercase border transition-colors ${
                        activeFormats.includes(fmt)
                          ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-semibold'
                          : 'bg-[#0a0a0a] text-[#a3a3a3] border-[#2e2e2e]'
                      }`}
                    >
                      .{fmt}
                    </button>
                  ))}
                </div>
              </>
            )}

            <span className="text-[10px] font-mono text-[#737373]">
              Tip: Drag #SLICE badge or use Web Slice Tool (K) to move &amp; resize slices on screen
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {slice && (
              <button
                type="button"
                onClick={() => {
                  onDeleteSlice?.(slice.id);
                  onSelectSlice?.(null);
                }}
                className="px-2 py-1 rounded-none text-[10px] font-mono bg-[#161616] hover:bg-[#2e2e2e] text-[#d4d4d4] hover:text-[#ffffff] border border-[#383838] flex items-center gap-1"
                title="Delete Selected Web Slice (Delete)"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete Slice</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onExportSlicesZip?.()}
              className="px-2.5 py-1 rounded-none text-[11px] font-mono font-semibold bg-[#e5e5e5] hover:bg-[#ffffff] text-[#0a0a0a] border border-[#ffffff] flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Slices (.ZIP)</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderMultiSelectionInspector = (objs: CanvasObject[]) => {
    const first = objs[0];
    const applyToAll = (rawPatch: Partial<CanvasObject>, recordHistory = true) => {
      if (recordHistory) {
        onRecordHistorySnapshot?.();
      }
      objs.forEach((o) => {
        updateObjectWithStateVariant(o, rawPatch, false);
      });
    };

    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-wrap items-center gap-3 pb-1.5 border-b border-[#242424]">
          <span className="text-[10px] font-mono uppercase text-[#ffffff] bg-[#242424] border border-[#525252] px-2 py-0.5 rounded-none">
            GROUP / MULTI-EDIT ({objs.length} OBJECTS)
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-[#a3a3a3]">Fill</span>
            <select
              value={first.fillType}
              onChange={(e) =>
                applyToAll({ fillType: e.target.value as CanvasObject['fillType'] }, true)
              }
              className="bg-[#0a0a0a] border border-[#2e2e2e] rounded-none px-1.5 py-0.5 text-[11px] text-[#e5e5e5] outline-none"
            >
              <option value="solid">Solid</option>
              <option value="linear-gradient">Linear Grad</option>
              <option value="radial-gradient">Radial Grad</option>
              <option value="none">None</option>
            </select>

            <LiveColorPicker
              value={toHexColor(first.fill, '#3b82f6')}
              onDragStart={() => onRecordHistorySnapshot?.()}
              onChange={(hex, recordHistory = false) => {
                applyToAll({ fill: hex }, recordHistory);
                onUpdateToolOptions({ primaryColor: hex });
              }}
              title="Batch Primary Fill Color — Click or Press-and-Hold & Drag to recolor all selected objects live"
              className="w-5 h-5"
            />

            {(first.fillType === 'linear-gradient' || first.fillType === 'radial-gradient') && (
              <LiveColorPicker
                value={toHexColor(first.fillGradientEnd, '#6366f1')}
                onDragStart={() => onRecordHistorySnapshot?.()}
                onChange={(hex, recordHistory = false) =>
                  applyToAll({ fillGradientEnd: hex }, recordHistory)
                }
                title="Batch Gradient End Color — Click or Press-and-Hold & Drag to scrub color live"
                className="w-5 h-5"
              />
            )}
          </div>

          <div className="h-4 w-[1px] bg-[#2e2e2e]" />

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase text-[#a3a3a3]">Stroke</span>
            <LiveColorPicker
              value={toHexColor(first.stroke, '#94a3b8')}
              onDragStart={() => onRecordHistorySnapshot?.()}
              onChange={(hex, recordHistory = false) => {
                applyToAll({ stroke: hex }, recordHistory);
                onUpdateToolOptions({ secondaryColor: hex });
              }}
              title="Batch Stroke Color — Click or Press-and-Hold & Drag to scrub stroke color live"
              className="w-5 h-5"
            />
            <input
              type="number"
              min={0}
              max={40}
              step={1}
              value={Number.isFinite(first.strokeWidth) ? first.strokeWidth : 0}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (Number.isNaN(val)) return;
                applyToAll(
                  { strokeWidth: Math.max(0, Math.min(40, val)) },
                  true
                );
              }}
              className="w-11 bg-[#0a0a0a] border border-[#2e2e2e] rounded-none px-1 py-0.5 text-[11px] font-mono text-[#f5f5f5]"
              title="Batch Stroke Width (px)"
            />
          </div>

          <div className="h-4 w-[1px] bg-[#2e2e2e]" />

          <label className="flex items-center gap-1 text-[10px] font-mono text-[#a3a3a3]">
            <span>α%</span>
            <input
              type="range"
              min={5}
              max={100}
              value={Math.round(first.opacity * 100)}
              onMouseDown={() => onRecordHistorySnapshot?.()}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (Number.isNaN(val)) return;
                applyToAll({ opacity: Math.max(0.05, Math.min(1, val / 100)) }, false);
              }}
              className="w-16 accent-[#e5e5e5] cursor-pointer"
            />
            <span className="w-7 text-[#e5e5e5]">{Math.round(first.opacity * 100)}%</span>
          </label>
        </div>

        {renderLiveEffectsAndQuickActionsBar(objs)}

        <div className="flex items-center justify-between text-[10px] font-mono text-[#a3a3a3]">
          <span>
            Tip: Press and hold any Fill or Stroke color swatch and drag around to live-scrub colors on all {objs.length} selected objects
          </span>
        </div>
      </div>
    );
  };

  const renderDocumentInspector = () => {
    const slicesVisible = gridSettings.showSlices !== false;
    const sliceCount = slices?.length || 0;

    return (
      <div className="flex flex-col gap-2 w-full">
        {/* Row 1: Canvas Presets, Size & Eye-Comfort Backdrop Selector */}
        <div className="flex flex-wrap items-center gap-3 pb-1.5 border-b border-[#242424]">
          <div className="flex items-center gap-2">
            {renderNumberInput(
              'W',
              gridSettings.canvasWidth,
              (v) =>
                onUpdateGridSettings({ canvasWidth: Math.max(64, Math.min(4096, Math.round(v))) }),
              64,
              4096,
              1,
              'w-16'
            )}
            {renderNumberInput(
              'H',
              gridSettings.canvasHeight,
              (v) =>
                onUpdateGridSettings({ canvasHeight: Math.max(64, Math.min(4096, Math.round(v))) }),
              64,
              4096,
              1,
              'w-16'
            )}
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-[#a3a3a3] mr-1">Presets:</span>
            {[
              { label: '1280×800', w: 1280, h: 800 },
              { label: '1024×768', w: 1024, h: 768 },
              { label: '800×600', w: 800, h: 600 },
              { label: '512×512 Icon', w: 512, h: 512 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  onUpdateGridSettings({
                    canvasWidth: preset.w,
                    canvasHeight: preset.h,
                  })
                }
                className="px-2 py-0.5 rounded-none text-[10px] font-mono bg-[#161616] hover:bg-[#242424] text-[#d4d4d4] hover:text-[#ffffff] border border-[#2e2e2e]"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-[#2e2e2e]" />

          {/* Eye-Comfort Backdrop Selector */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-[#d4d4d4] flex items-center gap-1 mr-0.5">
              <Eye className="w-3 h-3 text-[#d4d4d4]" />
              <span>Backdrop:</span>
            </span>
            {(
              [
                { id: 'slate', label: 'Solid Matte (No Squares)' },
                { id: 'dark-checker', label: 'Subtle Checker' },
                { id: 'light-checker', label: 'Light Checker' },
                { id: 'white', label: 'Pure White' },
              ] as const
            ).map((bg) => (
              <button
                key={bg.id}
                type="button"
                onClick={() => onUpdateGridSettings({ canvasBackground: bg.id })}
                className={`px-2 py-0.5 rounded-none text-[10px] font-mono border transition-colors ${
                  gridSettings.canvasBackground === bg.id
                    ? 'bg-[#e5e5e5] border-[#ffffff] text-[#0a0a0a] font-semibold'
                    : 'bg-[#0a0a0a] border-[#2e2e2e] text-[#a3a3a3] hover:text-[#e5e5e5]'
                }`}
              >
                {bg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Eye-Comfort Grid Toggles, Slices Overlay & Precision Snapping Engine */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase text-[#d4d4d4]">
              Rulers, Grid & Slices:
            </span>

            {/* Show Rulers Toggle button */}
            <button
              type="button"
              onClick={() =>
                onUpdateGridSettings({ showRulers: !gridSettings.showRulers })
              }
              title="Toggle Top & Left 22px Pixel Rulers & Guide Dragging"
              className={`px-2 py-0.5 rounded-none text-[10px] font-mono border transition-colors ${
                gridSettings.showRulers
                  ? 'bg-[#e5e5e5] border-[#ffffff] text-[#0a0a0a] font-semibold'
                  : 'bg-[#0a0a0a] border-[#2e2e2e] text-[#a3a3a3] hover:text-[#e5e5e5]'
              }`}
            >
              Rulers: {gridSettings.showRulers ? 'ON' : 'OFF'}
            </button>

            {/* Layout Grid Toggle button */}
            <button
              type="button"
              onClick={() =>
                onUpdateGridSettings({ showMajorGrid: !gridSettings.showMajorGrid })
              }
              title="Toggle Major Layout Grid Overlay"
              className={`px-2 py-0.5 rounded-none text-[10px] font-mono border transition-colors ${
                gridSettings.showMajorGrid
                  ? 'bg-[#e5e5e5] border-[#ffffff] text-[#0a0a0a] font-semibold'
                  : 'bg-[#0a0a0a] border-[#2e2e2e] text-[#a3a3a3] hover:text-[#e5e5e5]'
              }`}
            >
              Grid: {gridSettings.showMajorGrid ? 'ON' : 'OFF'}
            </button>

            <select
              value={gridSettings.gridSize}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!Number.isNaN(val) && val >= 1) {
                  onUpdateGridSettings({ gridSize: val });
                }
              }}
              className="bg-[#0a0a0a] border border-[#2e2e2e] rounded-none px-1.5 py-0.5 text-[10px] font-mono text-[#e5e5e5]"
            >
              <option value={8}>8px UI Grid</option>
              <option value={10}>10px Grid</option>
              <option value={16}>16px Icon Grid</option>
              <option value={32}>32px Block Grid</option>
            </select>

            {/* 1px Pixel Grid Toggle button */}
            <button
              type="button"
              onClick={() =>
                onUpdateGridSettings({ showPixelGrid: !gridSettings.showPixelGrid })
              }
              title="Toggle 1px Pixel Loupe Grid (visible at ≥400% zoom)"
              className={`px-2 py-0.5 rounded-none text-[10px] font-mono border transition-colors ${
                gridSettings.showPixelGrid
                  ? 'bg-[#262626] border-[#888888] text-[#ffffff]'
                  : 'bg-[#0a0a0a] border-[#2e2e2e] text-[#a3a3a3] hover:text-[#e5e5e5]'
              }`}
            >
              1px Grid: {gridSettings.showPixelGrid ? 'ON' : 'OFF'}
            </button>

            <button
              type="button"
              onClick={() =>
                onUpdateGridSettings({ snapToPixel: !gridSettings.snapToPixel })
              }
              className={`px-2 py-0.5 rounded-none text-[10px] font-mono border ${
                gridSettings.snapToPixel
                  ? 'bg-[#262626] border-[#888888] text-[#ffffff]'
                  : 'bg-[#0a0a0a] border-[#2e2e2e] text-[#a3a3a3]'
              }`}
            >
              Snap 1px: {gridSettings.snapToPixel ? 'ON' : 'OFF'}
            </button>

            <button
              type="button"
              onClick={() =>
                onUpdateGridSettings({ snapToGrid: !gridSettings.snapToGrid })
              }
              className={`px-2 py-0.5 rounded-none text-[10px] font-mono border ${
                gridSettings.snapToGrid
                  ? 'bg-[#262626] border-[#888888] text-[#ffffff]'
                  : 'bg-[#0a0a0a] border-[#2e2e2e] text-[#a3a3a3]'
              }`}
            >
              Snap Grid ({gridSettings.gridSize}px)
            </button>

            <button
              type="button"
              onClick={() =>
                onUpdateGridSettings({ snapToObjects: !gridSettings.snapToObjects })
              }
              className={`px-2 py-0.5 rounded-none text-[10px] font-mono border ${
                gridSettings.snapToObjects
                  ? 'bg-[#262626] border-[#888888] text-[#ffffff]'
                  : 'bg-[#0a0a0a] border-[#2e2e2e] text-[#a3a3a3]'
              }`}
            >
              Smart Guides
            </button>

            <div className="h-4 w-[1px] bg-[#2e2e2e]" />

            {/* Slices Overlay Toggle button + Export Slices .ZIP button */}
            <button
              type="button"
              onClick={() =>
                onUpdateGridSettings({ showSlices: !slicesVisible })
              }
              title="Toggle Retina Export Slice Overlays on Canvas"
              className={`px-2 py-0.5 rounded-none text-[10px] font-mono border flex items-center gap-1 transition-colors ${
                slicesVisible
                  ? 'bg-[#262626] border-[#888888] text-[#ffffff]'
                  : 'bg-[#0a0a0a] border-[#2e2e2e] text-[#a3a3a3]'
              }`}
            >
              <Scissors className="w-3 h-3" />
              <span>
                Slices ({sliceCount}): {slicesVisible ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onExportSlicesZip?.()}
              title="Export all active slices at @1x, @2x, @3x (WebP + AVIF + SVG) into a single .ZIP archive"
              className="px-2 py-0.5 rounded-none text-[10px] font-mono font-semibold bg-[#242424] hover:bg-[#e5e5e5] text-[#ffffff] hover:text-[#0a0a0a] border border-[#737373] flex items-center gap-1 transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Export Slices .ZIP</span>
            </button>

            <button
              type="button"
              onClick={() =>
                onUpdateGridSettings({
                  showToolHints: gridSettings.showToolHints === false ? true : false,
                })
              }
              title="Enable / Disable the Middle-Top Contextual Tool Tips Bar"
              className={`px-2 py-0.5 rounded-none text-[10px] font-mono border transition-colors ${
                gridSettings.showToolHints !== false
                  ? 'bg-[#262626] border-[#888888] text-[#ffffff]'
                  : 'bg-[#0a0a0a] border-[#2e2e2e] text-[#a3a3a3]'
              }`}
            >
              Tips: {gridSettings.showToolHints !== false ? 'ON' : 'OFF'}
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenAutoShapeStudio}
            className="px-2.5 py-1 rounded-none text-[11px] font-semibold bg-[#e5e5e5] hover:bg-[#ffffff] text-[#0a0a0a] border border-[#ffffff] flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0a0a0a]" />
            <span>Open JS AutoShape Studio</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <footer className="min-h-[118px] max-h-36 bg-[#111111] border-t border-[#2e2e2e] px-3 py-1.5 flex items-center gap-3 select-none shrink-0 z-20 rounded-none">
      {/* Left Osito Inspector Identity Badge */}
      <div
        className={`w-48 h-full rounded-none border p-2.5 flex flex-col justify-between shrink-0 ${badgeAccent}`}
      >
        <div className="flex items-center justify-between gap-1">
          {isEditingTitle ? (
            <input
              type="text"
              value={draftTitle}
              autoFocus
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={handleCommitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCommitRename();
                if (e.key === 'Escape') setIsEditingTitle(false);
              }}
              className="w-full bg-[#0a0a0a] border border-[#888888] px-1 py-0 text-[9px] font-mono uppercase tracking-wider text-[#ffffff] rounded-none outline-none"
            />
          ) : (
            <div
              onDoubleClick={handleStartRename}
              title="Double-click to rename panel"
              className="flex items-center gap-1 cursor-pointer group min-w-0"
            >
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#a3a3a3] group-hover:text-[#ffffff] truncate">
                {panelTitle}
              </span>
              <button
                type="button"
                onClick={handleStartRename}
                title="Rename Panel"
                className="opacity-60 group-hover:opacity-100 text-[#a3a3a3] hover:text-[#ffffff] p-0.5 rounded-none"
              >
                <Pencil className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>
        <div>
          <div className="text-xs font-bold tracking-tight truncate">{badgeTitle}</div>
          <div className="text-[10px] font-mono opacity-80 truncate">
            {badgeSubtitle}
          </div>
        </div>
        <div className="text-[9px] font-mono opacity-65 flex items-center justify-between pt-1 border-t border-[#2e2e2e]">
          <span>OSITO ENGINE</span>
          <span>{Math.round(gridSettings.zoom * 100)}%</span>
        </div>
      </div>

      {/* Main Dynamic Property Controls */}
      <div className="flex-1 h-full flex items-center overflow-x-auto">
        {selectedSlice && (selectedSliceId || activeTool === 'slice')
          ? renderWebSliceInspector(selectedSlice)
          : pixelSelection.active || isBitmapToolActive
          ? renderBitmapMarqueeAndToolControls()
          : selectedObjects.length > 1
          ? renderMultiSelectionInspector(selectedObjects)
          : primaryObj?.type === 'autoshape'
          ? renderAutoShapeInspector(primaryObj)
          : primaryObj?.type === 'vector-path'
          ? renderVectorPathInspector(primaryObj)
          : primaryObj?.type === 'bitmap'
          ? renderBitmapObjectInspector(primaryObj)
          : primaryObj?.type === 'text'
          ? renderTextObjectInspector(primaryObj)
          : renderDocumentInspector()}
      </div>
    </footer>
  );
};

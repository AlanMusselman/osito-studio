import React, { useState, useRef, useEffect } from 'react';
import {
  MousePointer,
  MousePointerClick,
  Layers,
  Maximize2,
  Crop,
  SquareDashedBottom,
  CircleDashed,
  Lasso,
  Wand2,
  Brush,
  Pencil,
  Eraser,
  PaintBucket,
  Pipette,
  Minus,
  PenTool,
  Square,
  Circle,
  Type,
  Sparkles,
  Hand,
  ZoomIn,
  ArrowLeftRight,
  ChevronRight,
  Code2,
  Plus,
  Grid,
  Scissors,
  Eye,
  EyeOff,
  Share2,
} from 'lucide-react';
import {
  ToolId,
  ToolOptions,
  AutoShapeDefinition,
  AutoShapeCategory,
  AUTOSHAPE_GROUP_ORDER,
} from '../types/editor';
import { AutoShapeThumbnail } from './AutoShapeThumbnail';
import { LiveColorPicker, toHexColor } from './LiveColorPicker';

export interface LeftToolDockProps {
  activeTool: ToolId;
  onSelectTool: (tool: ToolId) => void;
  toolOptions: ToolOptions;
  onUpdateToolOptions: (patch: Partial<ToolOptions>) => void;
  onLiveColorChange?: (
    role: 'primary' | 'secondary',
    hex: string,
    recordHistory?: boolean
  ) => void;
  onRecordHistorySnapshot?: () => void;
  autoShapes: AutoShapeDefinition[];
  onInsertAutoShape: (shapeDefId: string) => void;
  onOpenAutoShapeStudio: () => void;
  showSlices?: boolean;
  onToggleShowSlices?: () => void;
}

interface ToolItemConfig {
  id: ToolId;
  label: string;
  shortcut: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SELECT_TOOLS: ToolItemConfig[] = [
  {
    id: 'pointer',
    label: 'Pointer Tool',
    shortcut: 'V',
    description:
      'Black Arrow: Select, move & resize objects, web slices, or float marquee pixels',
    icon: MousePointer,
  },
  {
    id: 'subselect',
    label: 'Subselection Tool',
    shortcut: 'A',
    description: 'White Arrow: Edit Bezier nodes, control handles & AutoShape diamond handles',
    icon: MousePointerClick,
  },
  {
    id: 'select-behind',
    label: 'Select Behind',
    shortcut: '⇧V',
    description: 'Click through overlapping Z-order objects',
    icon: Layers,
  },
  {
    id: 'scale',
    label: 'Scale / Transform',
    shortcut: 'Q',
    description: '8-handle bounding box scale & rotation transform',
    icon: Maximize2,
  },
  {
    id: 'crop',
    label: 'Crop Document',
    shortcut: 'C',
    description: 'Crop document bounds or draw export slice regions',
    icon: Crop,
  },
];

const WEB_TOOLS: ToolItemConfig[] = [
  {
    id: 'slice',
    label: 'Web Slice Tool',
    shortcut: 'K',
    description:
      'Draw new Retina Web Slices (@1x/@2x/@3x) or click, drag & resize slices on screen',
    icon: Scissors,
  },
];

const BITMAP_TOOLS: ToolItemConfig[] = [
  {
    id: 'marquee-rect',
    label: 'Rectangular Marquee',
    shortcut: 'M',
    description: 'Select rectangular pixel region (Marching Ants)',
    icon: SquareDashedBottom,
  },
  {
    id: 'marquee-oval',
    label: 'Oval Marquee',
    shortcut: '⌥M',
    description: 'Select elliptical pixel region',
    icon: CircleDashed,
  },
  {
    id: 'lasso',
    label: 'Polygon / Freehand Lasso',
    shortcut: 'L',
    description: 'Draw freehand pixel selection outline',
    icon: Lasso,
  },
  {
    id: 'magic-wand',
    label: 'Magic Wand',
    shortcut: 'W',
    description: 'Flood-select contiguous or global pixels by color tolerance (0-255)',
    icon: Wand2,
  },
  {
    id: 'brush',
    label: 'Paint Brush',
    shortcut: 'B',
    description: 'Raster brush with configurable size, hardness & opacity',
    icon: Brush,
  },
  {
    id: 'pencil',
    label: '1px Pixel Pencil',
    shortcut: 'Y',
    description: 'Osito signature crisp 1-pixel aliased bitmap pencil',
    icon: Pencil,
  },
  {
    id: 'eraser',
    label: 'Pixel Eraser',
    shortcut: 'E',
    description: 'Erase pixels to transparency on active bitmap layer',
    icon: Eraser,
  },
  {
    id: 'bucket',
    label: 'Paint Bucket Fill',
    shortcut: 'G',
    description: 'Flood-fill pixels within tolerance or active marquee',
    icon: PaintBucket,
  },
  {
    id: 'eyedropper',
    label: 'Eyedropper Color Picker',
    shortcut: 'I',
    description: 'Sample exact pixel RGBA color from canvas',
    icon: Pipette,
  },
];

const VECTOR_TOOLS: ToolItemConfig[] = [
  {
    id: 'connector',
    label: 'Smart Connector Line',
    shortcut: 'X',
    description:
      'Lucidchart-style Auto-Connecting Line: Drag between N/E/S/W ports or drop on empty canvas to auto-spawn nodes',
    icon: Share2,
  },
  {
    id: 'line',
    label: 'Line Tool',
    shortcut: 'N',
    description: 'Crisp pixel-snapped vector line',
    icon: Minus,
  },
  {
    id: 'pen',
    label: 'Bezier Pen Tool',
    shortcut: 'P',
    description: 'Plot precision cubic Bezier vector paths & curves',
    icon: PenTool,
  },
  {
    id: 'rect',
    label: 'Rectangle Tool',
    shortcut: 'U',
    description: 'Draw pixel-snapped vector rectangle',
    icon: Square,
  },
  {
    id: 'ellipse',
    label: 'Ellipse Tool',
    shortcut: 'O',
    description: 'Draw clean vector circle or ellipse',
    icon: Circle,
  },
  {
    id: 'text',
    label: 'Text Tool',
    shortcut: 'T',
    description: 'Create crisp UI & badge typography',
    icon: Type,
  },
];

const VIEW_TOOLS: ToolItemConfig[] = [
  {
    id: 'hand',
    label: 'Hand Pan Tool',
    shortcut: 'H',
    description: 'Pan viewport across the canvas (or hold Spacebar)',
    icon: Hand,
  },
  {
    id: 'zoom',
    label: 'Zoom Loupe',
    shortcut: 'Z',
    description: 'Click to zoom in, Alt+Click to zoom out',
    icon: ZoomIn,
  },
];

export const LeftToolDock: React.FC<LeftToolDockProps> = ({
  activeTool,
  onSelectTool,
  toolOptions,
  onUpdateToolOptions,
  onLiveColorChange,
  onRecordHistorySnapshot,
  autoShapes,
  onInsertAutoShape,
  onOpenAutoShapeStudio,
  showSlices = false,
  onToggleShowSlices,
}) => {
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const [flyoutGroup, setFlyoutGroup] = useState<'All' | AutoShapeCategory>('All');
  const [flyoutSearch, setFlyoutSearch] = useState('');
  const [activeSwatch, setActiveSwatch] = useState<'primary' | 'secondary'>('primary');
  const flyoutRef = useRef<HTMLDivElement>(null);

  const activeAutoShape =
    autoShapes.find((s) => s.id === toolOptions.activeAutoShapeId) || autoShapes[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target as Node)) {
        setFlyoutOpen(false);
      }
    };
    if (flyoutOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [flyoutOpen]);

  const handleSwapColors = () => {
    const nextPrimary = toolOptions.secondaryColor;
    const nextSecondary = toolOptions.primaryColor;
    onRecordHistorySnapshot?.();
    onUpdateToolOptions({
      primaryColor: nextPrimary,
      secondaryColor: nextSecondary,
    });
    onLiveColorChange?.('primary', nextPrimary, false);
    onLiveColorChange?.('secondary', nextSecondary, false);
  };

  const handleResetColors = () => {
    onRecordHistorySnapshot?.();
    onUpdateToolOptions({
      primaryColor: '#06b6d4',
      secondaryColor: '#38bdf8',
    });
    onLiveColorChange?.('primary', '#06b6d4', false);
    onLiveColorChange?.('secondary', '#38bdf8', false);
  };

  const renderToolButton = (tool: ToolItemConfig) => {
    const Icon = tool.icon;
    const isActive = activeTool === tool.id;

    return (
      <button
        key={tool.id}
        type="button"
        onClick={() => onSelectTool(tool.id)}
        title={`${tool.label} (${tool.shortcut})\n${tool.description}`}
        className={`group relative flex items-center justify-center w-8 h-8 rounded-none border transition-all ${
          isActive
            ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-semibold'
            : 'bg-[#161616] border-[#2e2e2e] text-[#a3a3a3] hover:text-[#ffffff] hover:bg-[#242424] hover:border-[#484848]'
        }`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono leading-none opacity-65 group-hover:opacity-100">
          {tool.shortcut}
        </span>
      </button>
    );
  };

  return (
    <aside
      className={`w-[76px] bg-[#111111] border-r border-[#2e2e2e] flex flex-col justify-between py-2 px-1.5 select-none shrink-0 rounded-none ${
        flyoutOpen ? 'z-40' : 'z-20'
      }`}
    >
      <div className="flex flex-col gap-2.5">
        {/* SELECT SECTION */}
        <div>
          <div className="text-[9px] font-mono uppercase tracking-wider text-[#a3a3a3] px-0.5 mb-1 flex items-center justify-between">
            <span>Select</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {SELECT_TOOLS.map(renderToolButton)}
          </div>
        </div>

        {/* BITMAP SECTION */}
        <div className="border-t border-[#242424] pt-2">
          <div className="text-[9px] font-mono uppercase tracking-wider text-[#a3a3a3] px-0.5 mb-1 flex items-center justify-between">
            <span>Bitmap</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {BITMAP_TOOLS.map(renderToolButton)}
          </div>
        </div>

        {/* VECTOR & JS AUTOSHAPES SECTION */}
        <div className="border-t border-[#242424] pt-2 relative" ref={flyoutRef}>
          <div className="text-[9px] font-mono uppercase tracking-wider text-[#a3a3a3] px-0.5 mb-1 flex items-center justify-between">
            <span>Vector</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {VECTOR_TOOLS.map(renderToolButton)}

            {/* JS AUTOSHAPE FLYOUT TRIGGER */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  onSelectTool('autoshape');
                  setFlyoutOpen((prev) => !prev);
                }}
                title={`JS AutoShape Tool: ${activeAutoShape?.name || 'AutoShape'}\nClick to choose or code programmable Osito JS AutoShapes`}
                className={`group relative flex items-center justify-center w-8 h-8 rounded-none border transition-all ${
                  activeTool === 'autoshape'
                    ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-semibold'
                    : 'bg-[#161616] border-[#383838] text-[#d4d4d4] hover:text-[#ffffff] hover:bg-[#242424] hover:border-[#737373]'
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <ChevronRight
                  className={`w-2.5 h-2.5 absolute bottom-0 right-0 ${
                    activeTool === 'autoshape' ? 'text-[#0a0a0a]' : 'text-[#a3a3a3]'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* JS AUTOSHAPES FLYOUT MENU */}
          {flyoutOpen && (
            <div className="fixed left-[76px] top-[52px] max-h-[calc(100vh-148px)] w-80 bg-[#111111] border border-[#383838] rounded-none shadow-2xl p-2.5 z-50 flex flex-col">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#242424]">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#f5f5f5]">
                    JS Programmable AutoShapes ({autoShapes.length})
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#d4d4d4] bg-[#1c1c1c] px-1.5 py-0.5 rounded-none border border-[#383838]">
                  .JSF
                </span>
              </div>

              {/* Search Bar */}
              <div className="mb-2">
                <input
                  type="text"
                  value={flyoutSearch}
                  onChange={(e) => setFlyoutSearch(e.target.value)}
                  placeholder={`Search ${autoShapes.length} AutoShapes (Sitemap, Bento, Hero)...`}
                  className="w-full bg-[#161616] border border-[#2e2e2e] focus:border-[#ffffff] rounded-none px-2 py-1 text-[10px] font-mono text-[#f5f5f5] placeholder-[#666666] outline-none"
                />
              </div>

              {/* Group Filter Strip */}
              <div className="flex items-center gap-1 flex-wrap pb-2 mb-2 border-b border-[#242424]">
                <button
                  type="button"
                  onClick={() => setFlyoutGroup('All')}
                  className={`px-1.5 py-0.5 text-[9px] font-mono rounded-none border transition-colors ${
                    flyoutGroup === 'All'
                      ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-semibold'
                      : 'bg-[#161616] text-[#a3a3a3] border-[#2e2e2e] hover:text-[#ffffff]'
                  }`}
                >
                  All
                </button>
                {AUTOSHAPE_GROUP_ORDER.filter((grp) =>
                  autoShapes.some((s) => s.category === grp)
                ).map((grp) => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setFlyoutGroup((prev) => (prev === grp ? 'All' : grp))}
                    className={`px-1.5 py-0.5 text-[9px] font-mono rounded-none border transition-colors ${
                      flyoutGroup === grp
                        ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-semibold'
                        : 'bg-[#161616] text-[#a3a3a3] border-[#2e2e2e] hover:text-[#ffffff]'
                    }`}
                  >
                    {grp}
                  </button>
                ))}
              </div>

              <div className="flex-1 min-h-0 max-h-64 overflow-y-auto space-y-2.5 pr-0.5">
                {AUTOSHAPE_GROUP_ORDER.filter((grp) =>
                  flyoutGroup === 'All' ? true : grp === flyoutGroup
                )
                  .map((grp) => {
                    const q = flyoutSearch.trim().toLowerCase();
                    return {
                      grp,
                      items: autoShapes.filter(
                        (s) =>
                          s.category === grp &&
                          (!q ||
                            s.name.toLowerCase().includes(q) ||
                            s.description.toLowerCase().includes(q) ||
                            s.id.toLowerCase().includes(q))
                      ),
                    };
                  })
                  .filter((g) => g.items.length > 0)
                  .map(({ grp, items }) => (
                    <div key={grp} className="space-y-1">
                      <div className="flex items-center justify-between px-1 py-0.5 bg-[#161616] border-l-2 border-[#d4d4d4]">
                        <span className="text-[9px] font-mono uppercase tracking-wider font-semibold text-[#d4d4d4]">
                          {grp}
                        </span>
                        <span className="text-[9px] font-mono text-[#737373]">{items.length}</span>
                      </div>
                      {items.map((shape) => {
                        const isSelected = toolOptions.activeAutoShapeId === shape.id;
                        return (
                          <div
                            key={shape.id}
                            className={`flex items-center justify-between gap-2 p-1.5 rounded-none border transition-colors ${
                              isSelected
                                ? 'bg-[#262626] border-[#888888] text-[#ffffff]'
                                : 'bg-[#161616] border-transparent hover:border-[#383838] text-[#d4d4d4]'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateToolOptions({ activeAutoShapeId: shape.id });
                                onSelectTool('autoshape');
                                setFlyoutOpen(false);
                              }}
                              className="flex-1 flex items-center gap-2 text-left pr-1 rounded-none min-w-0"
                            >
                              <AutoShapeThumbnail shape={shape} width={44} height={32} />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium flex items-center gap-1.5">
                                  <span className="truncate">{shape.name}</span>
                                </div>
                                <div className="text-[10px] text-[#a3a3a3] line-clamp-1">
                                  {shape.description}
                                </div>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onInsertAutoShape(shape.id);
                                setFlyoutOpen(false);
                              }}
                              title="Insert onto Canvas immediately"
                              className="px-2 py-1 text-[10px] font-mono bg-[#242424] hover:bg-[#e5e5e5] text-[#e5e5e5] hover:text-[#0a0a0a] rounded-none border border-[#484848] shrink-0 transition-colors"
                            >
                              + Drop
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setFlyoutOpen(false);
                  onOpenAutoShapeStudio();
                }}
                className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-none bg-[#e5e5e5] hover:bg-[#ffffff] border border-[#ffffff] text-[#0a0a0a] text-xs font-semibold transition-all"
              >
                <Code2 className="w-3.5 h-3.5 text-[#0a0a0a]" />
                <span>+ Edit / New JS AutoShape</span>
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* WEB SECTION (Fireworks MX Web Layer & Slice Tools) */}
        <div className="border-t border-[#242424] pt-2">
          <div className="text-[9px] font-mono uppercase tracking-wider text-[#a3a3a3] px-0.5 mb-1 flex items-center justify-between">
            <span>Web</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {WEB_TOOLS.map(renderToolButton)}
            <button
              type="button"
              onClick={() => onToggleShowSlices?.()}
              title={`Show / Hide Web Slices (2)\nCurrently: ${showSlices ? 'VISIBLE' : 'HIDDEN'}`}
              className={`group relative flex items-center justify-center w-8 h-8 rounded-none border transition-all ${
                showSlices
                  ? 'bg-[#242424] text-[#ffffff] border-[#737373]'
                  : 'bg-[#161616] border-[#2e2e2e] text-[#737373] hover:text-[#ffffff] hover:bg-[#242424]'
              }`}
            >
              {showSlices ? (
                <Eye className="w-4 h-4 shrink-0" />
              ) : (
                <EyeOff className="w-4 h-4 shrink-0" />
              )}
              <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono leading-none opacity-65 group-hover:opacity-100">
                2
              </span>
            </button>
          </div>
        </div>

        {/* VIEW SECTION */}
        <div className="border-t border-[#242424] pt-2">
          <div className="text-[9px] font-mono uppercase tracking-wider text-[#a3a3a3] px-0.5 mb-1">
            View
          </div>
          <div className="grid grid-cols-2 gap-1">
            {VIEW_TOOLS.map(renderToolButton)}
          </div>
        </div>
      </div>

      {/* COLORS & PIXEL SNAP FOOTER */}
      <div className="border-t border-[#242424] pt-2.5 flex flex-col items-center gap-2">
        <div className="w-full flex items-center justify-between px-0.5">
          <span className="text-[9px] font-mono uppercase text-[#a3a3a3]">Colors</span>
          <button
            type="button"
            onClick={handleSwapColors}
            title="Swap Fill & Stroke Colors (Shift+X)"
            className="text-[#a3a3a3] hover:text-[#ffffff] p-0.5 rounded-none hover:bg-[#242424] transition-colors"
          >
            <ArrowLeftRight className="w-3 h-3" />
          </button>
        </div>

        {/* Overlapping Fill & Stroke Swatches (Click or Press-and-Hold & Drag to scrub live) */}
        <div className="relative w-12 h-11">
          {/* Primary Fill / Brush Color */}
          <div
            onMouseDownCapture={() => setActiveSwatch('primary')}
            className={`absolute top-0 left-0.5 ${
              activeSwatch === 'primary' ? 'z-20' : 'z-10 opacity-90 hover:opacity-100'
            }`}
          >
            <LiveColorPicker
              value={toHexColor(toolOptions.primaryColor, '#06b6d4')}
              onDragStart={() => onRecordHistorySnapshot?.()}
              onChange={(hex, recordHistory = false) => {
                setActiveSwatch('primary');
                onUpdateToolOptions({ primaryColor: hex });
                onLiveColorChange?.('primary', hex, recordHistory);
              }}
              title={`Primary Fill / Brush Color (${toolOptions.primaryColor}) — Click or Press-and-Hold & Drag around to scrub color live`}
              className={`w-7 h-7 border-2 shadow-md ${
                activeSwatch === 'primary'
                  ? 'border-[#ffffff] ring-1 ring-[#0a0a0a]'
                  : 'border-[#737373]'
              }`}
            />
          </div>

          {/* Secondary Stroke Color */}
          <div
            onMouseDownCapture={() => setActiveSwatch('secondary')}
            className={`absolute bottom-0 right-0.5 ${
              activeSwatch === 'secondary' ? 'z-20' : 'z-10 opacity-90 hover:opacity-100'
            }`}
          >
            <LiveColorPicker
              value={toHexColor(toolOptions.secondaryColor, '#38bdf8')}
              onDragStart={() => onRecordHistorySnapshot?.()}
              onChange={(hex, recordHistory = false) => {
                setActiveSwatch('secondary');
                onUpdateToolOptions({ secondaryColor: hex });
                onLiveColorChange?.('secondary', hex, recordHistory);
              }}
              title={`Secondary Stroke Color (${toolOptions.secondaryColor}) — Click or Press-and-Hold & Drag around to scrub stroke live`}
              className={`w-7 h-7 border-2 shadow-md ${
                activeSwatch === 'secondary'
                  ? 'border-[#ffffff] ring-1 ring-[#0a0a0a]'
                  : 'border-[#737373]'
              }`}
            />
            <span className="w-2.5 h-2.5 bg-[#111111] border border-[#383838] rounded-none pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>

          {/* Default Colors mini button */}
          <button
            type="button"
            onClick={handleResetColors}
            title="Reset Default Colors (D)"
            className="absolute bottom-0 left-0.5 w-3.5 h-3.5 rounded-none bg-[#1c1c1c] border border-[#484848] flex items-center justify-center hover:border-[#ffffff]"
          >
            <span className="w-1.5 h-1.5 bg-[#d4d4d4] block rounded-none" />
          </button>
        </div>

        {/* Default 1px Pixel Snap Toggle */}
        <button
          type="button"
          onClick={() =>
            onUpdateToolOptions({ defaultPixelSnap: !toolOptions.defaultPixelSnap })
          }
          title="Osito 1px Pixel-Snap Alignment for new shapes"
          className={`w-full py-1 px-1 rounded-none text-[9px] font-mono flex items-center justify-center gap-1 border transition-colors ${
            toolOptions.defaultPixelSnap
              ? 'bg-[#e5e5e5] border-[#ffffff] text-[#0a0a0a] font-semibold'
              : 'bg-[#161616] border-[#2e2e2e] text-[#737373] hover:text-[#d4d4d4]'
          }`}
        >
          <Grid className="w-2.5 h-2.5" />
          <span>1px SNAP</span>
        </button>
      </div>
    </aside>
  );
};

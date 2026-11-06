import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
  ArrowDownToLine,
  Copy,
  Trash2,
  Plus,
  Sparkles,
  Code2,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  Grid,
  Undo2,
  Redo2,
  Image as ImageIcon,
  GripVertical,
  Pencil,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  FolderPlus,
  History,
  X,
  Check,
  FileCode2,
  Palette,
  Columns,
  Rows,
  Monitor,
  Smartphone,
  Tablet,
  Contrast,
  Zap,
  Scissors,
  Download,
  Search,
} from 'lucide-react';
import {
  CanvasObject,
  AutoShapeObject,
  BitmapObject,
  AutoShapeDefinition,
  AutoShapeCategory,
  AUTOSHAPE_GROUP_ORDER,
  TextObject,
  CanvasSlice,
  ComponentStateId,
  ComponentStateOverride,
} from '../types/editor';
import { AutoShapeThumbnail } from './AutoShapeThumbnail';
import { toHexColor } from './LiveColorPicker';
import {
  DEEP_RESEARCH_PRESETS,
  auditCanvasDesignReadiness,
  runDeepMarketResearch,
} from '../engine/deepResearchEngine';
import { ColorThemePalette } from '../engine/creationEngine';

export type DockPanelId =
  | 'layers'
  | 'history'
  | 'align'
  | 'autoshapes'
  | 'css-code'
  | 'tokens'
  | 'ux-audit';

export interface DockPanelTab {
  id: DockPanelId;
  title: string;
}

export interface DockPanelGroup {
  id: string;
  title: string;
  collapsed: boolean;
  activePanelId: DockPanelId | null;
  panels: DockPanelTab[];
  heightRatio?: number;
}

const STORAGE_KEY = 'osito_panel_groups_v3';
const DOCK_WIDTH_STORAGE_KEY = 'osito_right_dock_width_v1';
const MIN_DOCK_WIDTH = 210;
const MAX_DOCK_WIDTH = 640;
const DEFAULT_DOCK_WIDTH = 310;
const MAX_SPLITS = 3;
const MAX_PANEL_GROUPS = MAX_SPLITS + 1; // 1 base group + up to 3 splits = up to 4 stacked groups

const DEFAULT_PANEL_GROUPS: DockPanelGroup[] = [
  {
    id: 'group-studio-main',
    title: 'STUDIO INSPECTOR',
    collapsed: false,
    activePanelId: 'layers',
    heightRatio: 1,
    panels: [
      { id: 'layers', title: 'Layers' },
      { id: 'autoshapes', title: 'Shapes' },
      { id: 'css-code', title: 'Code' },
      { id: 'ux-audit', title: 'UX & AI' },
      { id: 'align', title: 'Align' },
      { id: 'tokens', title: 'Document' },
      { id: 'history', title: 'History' },
    ],
  },
];

const ALL_PANEL_IDS: DockPanelId[] = [
  'layers',
  'autoshapes',
  'css-code',
  'ux-audit',
  'align',
  'tokens',
  'history',
];

const DEFAULT_TAB_TITLES: Record<DockPanelId, string> = {
  layers: 'Layers',
  autoshapes: 'Shapes',
  'css-code': 'Code',
  'ux-audit': 'UX & AI',
  align: 'Align',
  tokens: 'Document',
  history: 'History',
};

function cloneDefaultGroups(): DockPanelGroup[] {
  return DEFAULT_PANEL_GROUPS.map((g) => ({
    ...g,
    panels: g.panels.map((p) => ({ ...p })),
  }));
}

function loadSavedDockWidth(): number {
  if (typeof window === 'undefined') return DEFAULT_DOCK_WIDTH;
  try {
    const raw = window.localStorage.getItem(DOCK_WIDTH_STORAGE_KEY);
    if (!raw) return DEFAULT_DOCK_WIDTH;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return DEFAULT_DOCK_WIDTH;
    return Math.max(MIN_DOCK_WIDTH, Math.min(MAX_DOCK_WIDTH, Math.round(parsed)));
  } catch {
    return DEFAULT_DOCK_WIDTH;
  }
}

function loadSavedPanelGroups(): DockPanelGroup[] {
  if (typeof window === 'undefined') return cloneDefaultGroups();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefaultGroups();
    const parsed = JSON.parse(raw) as DockPanelGroup[];
    if (!Array.isArray(parsed) || parsed.length === 0) return cloneDefaultGroups();

    const seenPanels = new Set<DockPanelId>();
    const sanitized: DockPanelGroup[] = parsed.map((g, idx) => {
      const validPanels: DockPanelTab[] = Array.isArray(g.panels)
        ? g.panels
            .filter(
              (p): p is DockPanelTab =>
                Boolean(p) &&
                ALL_PANEL_IDS.includes(p.id) &&
                !seenPanels.has(p.id) &&
                typeof p.title === 'string'
            )
            .map((p) => {
              seenPanels.add(p.id);
              const trimmedTitle = p.title.trim();
              const normalizedTitle =
                p.id === 'tokens' &&
                (trimmedTitle === 'Design Tokens' || trimmedTitle === 'Tokens')
                  ? 'Document'
                  : trimmedTitle || DEFAULT_TAB_TITLES[p.id];
              return { id: p.id, title: normalizedTitle };
            })
        : [];

      const activeId =
        g.activePanelId && validPanels.some((p) => p.id === g.activePanelId)
          ? g.activePanelId
          : validPanels[0]?.id ?? null;

      return {
        id: typeof g.id === 'string' && g.id ? g.id : `group-${idx}`,
        title:
          typeof g.title === 'string' && g.title.trim()
            ? g.title.trim()
            : `PANEL GROUP ${idx + 1}`,
        collapsed: Boolean(g.collapsed),
        activePanelId: activeId,
        panels: validPanels,
        heightRatio:
          typeof g.heightRatio === 'number' && Number.isFinite(g.heightRatio)
            ? Math.max(0.15, Math.min(5, g.heightRatio))
            : 1,
      };
    });

    // Enforce MAX_PANEL_GROUPS (up to 3 splits = 4 groups max)
    const clampedGroups = sanitized.slice(0, MAX_PANEL_GROUPS);
    if (sanitized.length > MAX_PANEL_GROUPS) {
      for (let i = MAX_PANEL_GROUPS; i < sanitized.length; i++) {
        clampedGroups[MAX_PANEL_GROUPS - 1].panels.push(...sanitized[i].panels);
      }
    }

    // Ensure all 7 core Osito panels are present
    for (const pid of ALL_PANEL_IDS) {
      if (!seenPanels.has(pid)) {
        const targetGroupIdx =
          pid === 'ux-audit' || pid === 'autoshapes' || pid === 'css-code' || pid === 'tokens'
            ? Math.min(1, clampedGroups.length - 1)
            : 0;
        clampedGroups[targetGroupIdx].panels.push({
          id: pid,
          title: DEFAULT_TAB_TITLES[pid],
        });
        if (!clampedGroups[targetGroupIdx].activePanelId) {
          clampedGroups[targetGroupIdx].activePanelId = pid;
        }
      }
    }

    return clampedGroups;
  } catch {
    return cloneDefaultGroups();
  }
}

/**
 * Parse a hex/rgb color string into [r, g, b] in 0..255 for WCAG 2.2 relative luminance calculation.
 */
function parseColorToRgb(colorStr: string): [number, number, number] | null {
  if (!colorStr || colorStr === 'transparent' || colorStr === 'none') return null;
  const trimmed = colorStr.trim();
  if (trimmed.startsWith('#')) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
        return [r, g, b];
      }
    } else if (hex.length >= 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
        return [r, g, b];
      }
    }
  }
  const rgbMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    return [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])];
  }
  return null;
}

function getRelativeLuminance([r, g, b]: [number, number, number]): number {
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function computeWcagContrast(colorA: string, colorB: string): number | null {
  const rgbA = parseColorToRgb(colorA);
  const rgbB = parseColorToRgb(colorB);
  if (!rgbA || !rgbB) return null;
  const lumA = getRelativeLuminance(rgbA);
  const lumB = getRelativeLuminance(rgbB);
  const brightest = Math.max(lumA, lumB);
  const darkest = Math.min(lumA, lumB);
  return (brightest + 0.05) / (darkest + 0.05);
}

export interface LayersAndHistoryPanelProps {
  objects: CanvasObject[];
  selectedIds: string[];
  onSelectObject: (id: string, multi?: boolean) => void;
  onUpdateObject: (id: string, patch: Partial<CanvasObject>) => void;
  onReorderObject: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  onMoveLayer?: (
    draggedId: string,
    targetId: string,
    placement: 'above' | 'below'
  ) => void;
  onDuplicateObject: (id: string) => void;
  onDeleteObject: (id: string) => void;
  onRasterizeObject: (id: string) => void;
  onAddBlankBitmapLayer: () => void;
  autoShapes: AutoShapeDefinition[];
  onInsertAutoShape: (shapeDefId: string) => void;
  onOpenAutoShapeStudio: () => void;
  onAlignSelected: (
    alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | 'snap-pixel'
  ) => void;
  onApplyCanvasPreset?: (width: number, height: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  historyCount: number;
  onUndo: () => void;
  onRedo: () => void;
  slices?: CanvasSlice[];
  onAddSlice?: (slice: CanvasSlice) => void;
  onDeleteSlice?: (sliceId: string) => void;
  onExportSlicesZip?: () => void;
  onExportReactTailwindAppZip?: () => void;
  onSelectComponentState?: (stateId: ComponentStateId) => void;
  onAutoGenerateComponentStates?: () => void;
  onAutoPolishCanvas?: (theme?: ColorThemePalette) => void;
  onOpenDeepResearchWithQuery?: (query: string) => void;
  onInstantSpawnResearchedWebsite?: (query: string) => void;
  onInstantSpawnStrategyBoard?: (query: string) => void;
}

export const LayersAndHistoryPanel: React.FC<LayersAndHistoryPanelProps> = ({
  objects,
  selectedIds,
  onSelectObject,
  onUpdateObject,
  onReorderObject,
  onMoveLayer,
  onDuplicateObject,
  onDeleteObject,
  onRasterizeObject,
  onAddBlankBitmapLayer,
  autoShapes,
  onInsertAutoShape,
  onOpenAutoShapeStudio,
  onAlignSelected,
  onApplyCanvasPreset,
  canUndo,
  canRedo,
  historyCount,
  onUndo,
  onRedo,
  slices = [],
  onAddSlice,
  onDeleteSlice,
  onExportSlicesZip,
  onExportReactTailwindAppZip,
  onSelectComponentState,
  onAutoGenerateComponentStates,
  onAutoPolishCanvas,
  onOpenDeepResearchWithQuery,
  onInstantSpawnResearchedWebsite,
  onInstantSpawnStrategyBoard,
}) => {
  const [dockResearchQuery, setDockResearchQuery] = useState<string>(
    DEEP_RESEARCH_PRESETS[0].prompt
  );
  const liveDockDossier = useMemo(
    () => runDeepMarketResearch(dockResearchQuery),
    [dockResearchQuery]
  );
  const liveDockAudit = useMemo(
    () => auditCanvasDesignReadiness(objects, slices, 960, 600),
    [objects, slices]
  );
  // --- 1. Resizable Right Dock Width & Vertical Split Sash State ---
  const [panelWidth, setPanelWidth] = useState<number>(() => loadSavedDockWidth());
  const [isResizingDock, setIsResizingDock] = useState(false);
  const dockResizeCleanupRef = useRef<(() => void) | null>(null);
  const splitResizeCleanupRef = useRef<(() => void) | null>(null);
  const [activeSplitResizeIndex, setActiveSplitResizeIndex] = useState<number | null>(null);
  const groupSectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    return () => {
      dockResizeCleanupRef.current?.();
      splitResizeCleanupRef.current?.();
    };
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(DOCK_WIDTH_STORAGE_KEY, String(panelWidth));
    } catch {
      // Ignore storage quota errors
    }
  }, [panelWidth]);

  const handleStartDockResize = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dockResizeCleanupRef.current?.();
    const startX = e.clientX;
    const startWidth = panelWidth;
    setIsResizingDock(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Since dock is on the right side, dragging left (smaller clientX) widens the dock
      const deltaX = startX - moveEvent.clientX;
      const nextWidth = Math.max(
        MIN_DOCK_WIDTH,
        Math.min(MAX_DOCK_WIDTH, Math.round(startWidth + deltaX))
      );
      setPanelWidth(nextWidth);
    };

    const cleanup = () => {
      setIsResizingDock(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', cleanup);
      dockResizeCleanupRef.current = null;
    };

    dockResizeCleanupRef.current = cleanup;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', cleanup);
  };

  // --- 2. Dockable Panel Groups State ---
  const [panelGroups, setPanelGroups] = useState<DockPanelGroup[]>(() =>
    loadSavedPanelGroups()
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(panelGroups));
    } catch {
      // Ignore storage quota errors
    }
  }, [panelGroups]);

  // --- 3. Smart Tab Overflow Measurement & Right-Arrow (`>`) Dropdown State ---
  const tabStripRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const tabButtonRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [overflowByGroup, setOverflowByGroup] = useState<
    Record<string, { isOverflowing: boolean; hiddenCount: number }>
  >({});
  const [overflowDropdownGroupId, setOverflowDropdownGroupId] = useState<string | null>(
    null
  );

  const measureAllTabStrips = useCallback(() => {
    const nextState: Record<string, { isOverflowing: boolean; hiddenCount: number }> = {};
    for (const grp of panelGroups) {
      if (grp.collapsed) {
        nextState[grp.id] = { isOverflowing: false, hiddenCount: 0 };
        continue;
      }
      const stripEl = tabStripRefs.current[grp.id];
      if (!stripEl) {
        nextState[grp.id] = { isOverflowing: false, hiddenCount: 0 };
        continue;
      }
      const isOverflowing = stripEl.scrollWidth > stripEl.clientWidth + 2;
      let hiddenCount = 0;
      if (isOverflowing) {
        const stripRect = stripEl.getBoundingClientRect();
        for (const p of grp.panels) {
          const tabEl = tabButtonRefs.current[`${grp.id}:${p.id}`];
          if (tabEl) {
            const tabRect = tabEl.getBoundingClientRect();
            if (
              tabRect.right > stripRect.right + 3 ||
              tabRect.left < stripRect.left - 3
            ) {
              hiddenCount++;
            }
          }
        }
        if (hiddenCount === 0) hiddenCount = 1;
      }
      nextState[grp.id] = { isOverflowing, hiddenCount };
    }
    setOverflowByGroup(nextState);
  }, [panelGroups]);

  useEffect(() => {
    measureAllTabStrips();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      measureAllTabStrips();
    });
    Object.values(tabStripRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [panelWidth, panelGroups, measureAllTabStrips]);

  // Inline Rename state for Panel Groups
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupTitle, setEditingGroupTitle] = useState('');

  // Inline Rename state for Panel Tabs
  const [editingPanelId, setEditingPanelId] = useState<DockPanelId | null>(null);
  const [editingPanelTitle, setEditingPanelTitle] = useState('');

  // Inline Rename state for Canvas Layer Rows
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingLayerName, setEditingLayerName] = useState('');

  // Panel Tab Drag-and-Drop state
  const [draggedPanel, setDraggedPanel] = useState<{
    panelId: DockPanelId;
    sourceGroupId: string;
  } | null>(null);
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null);
  const [dragOverTabId, setDragOverTabId] = useState<DockPanelId | null>(null);
  const [dragOverNewGroupZone, setDragOverNewGroupZone] = useState(false);

  // Layer Row Drag-and-Drop Reordering state
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
  const [layerDropIndicator, setLayerDropIndicator] = useState<{
    targetId: string;
    placement: 'above' | 'below';
  } | null>(null);

  // Layer Search, Type Filter & Expandable Height State (for 50+ layer website layouts)
  const [layerSearchQuery, setLayerSearchQuery] = useState<string>('');
  const [layerTypeFilter, setLayerTypeFilter] = useState<
    'all' | 'autoshape' | 'vector-path' | 'bitmap' | 'text'
  >('all');
  const [isLayersTall, setIsLayersTall] = useState<boolean>(false);

  // Modern Web Designer Panel States
  const [codeTabMode, setCodeTabMode] = useState<'css' | 'states' | 'react'>('css');
  const [copiedBadge, setCopiedBadge] = useState<string | null>(null);
  const [activeShapeGroup, setActiveShapeGroup] = useState<'All' | AutoShapeCategory>('All');
  const [shapeSearchQuery, setShapeSearchQuery] = useState<string>('');
  const [onlyPreviewInteractive, setOnlyPreviewInteractive] = useState<boolean>(false);
  const [collapsedShapeGroups, setCollapsedShapeGroups] = useState<Record<string, boolean>>({});

  const triggerCopyFeedback = (label: string, textToCopy: string) => {
    const fallbackCopy = () => {
      try {
        const ta = document.createElement('textarea');
        ta.value = textToCopy;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        // ignore fallback clipboard errors
      }
    };
    if (
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function'
    ) {
      navigator.clipboard.writeText(textToCopy).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
    setCopiedBadge(label);
    setTimeout(() => {
      setCopiedBadge((prev) => (prev === label ? null : prev));
    }, 1600);
  };

  // Display top-most Z-order objects first (Osito layer stack order: objects.length - 1 down to 0)
  const reversedObjects = useMemo(() => [...objects].reverse(), [objects]);

  const selectedObjects = useMemo(
    () => objects.filter((o) => selectedIds.includes(o.id)),
    [objects, selectedIds]
  );

  // --- Layer Rename Handlers ---
  const startLayerRename = (obj: CanvasObject) => {
    setEditingLayerId(obj.id);
    setEditingLayerName(obj.name);
  };

  const commitLayerRename = (id: string) => {
    if (editingLayerName.trim()) {
      onUpdateObject(id, { name: editingLayerName.trim() });
    }
    setEditingLayerId(null);
  };

  // --- Group Rename Handlers ---
  const startGroupRename = (group: DockPanelGroup) => {
    setEditingGroupId(group.id);
    setEditingGroupTitle(group.title);
  };

  const commitGroupRename = (groupId: string) => {
    const trimmed = editingGroupTitle.trim();
    if (trimmed) {
      setPanelGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, title: trimmed } : g))
      );
    }
    setEditingGroupId(null);
  };

  // --- Panel Tab Rename Handlers ---
  const startPanelRename = (panel: DockPanelTab) => {
    setEditingPanelId(panel.id);
    setEditingPanelTitle(panel.title);
  };

  const commitPanelRename = (panelId: DockPanelId) => {
    const trimmed = editingPanelTitle.trim();
    if (trimmed) {
      setPanelGroups((prev) =>
        prev.map((g) => ({
          ...g,
          panels: g.panels.map((p) =>
            p.id === panelId ? { ...p, title: trimmed } : p
          ),
        }))
      );
    }
    setEditingPanelId(null);
  };

  // --- Panel Group & Split Management (Up to 3 Splits / 4 Stacked Panes) ---
  const handleResetPanels = () => {
    const defaults = cloneDefaultGroups();
    setPanelGroups(defaults);
    setEditingGroupId(null);
    setEditingPanelId(null);
    setOverflowDropdownGroupId(null);
  };

  const handleEqualizeSplits = () => {
    setPanelGroups((prev) =>
      prev.map((g) => ({
        ...g,
        collapsed: false,
        heightRatio: 1,
      }))
    );
  };

  const handleStartSplitResize = (
    e: React.MouseEvent<HTMLDivElement>,
    splitIndex: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    splitResizeCleanupRef.current?.();

    const topGroup = panelGroups[splitIndex];
    const bottomGroup = panelGroups[splitIndex + 1];
    if (!topGroup || !bottomGroup) return;

    const topEl = groupSectionRefs.current[topGroup.id];
    const bottomEl = groupSectionRefs.current[bottomGroup.id];
    const startY = e.clientY;
    const startTopPx = topEl ? topEl.getBoundingClientRect().height : 220;
    const startBottomPx = bottomEl ? bottomEl.getBoundingClientRect().height : 220;
    const totalPairPx = Math.max(180, startTopPx + startBottomPx);
    const startTopWeight = topGroup.heightRatio ?? 1;
    const startBottomWeight = bottomGroup.heightRatio ?? 1;
    const totalPairWeight = Math.max(0.3, startTopWeight + startBottomWeight);

    setActiveSplitResizeIndex(splitIndex);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const minPanePx = 88;
      const clampedTopPx = Math.max(
        minPanePx,
        Math.min(totalPairPx - minPanePx, startTopPx + deltaY)
      );
      const nextTopRatio = Math.max(
        0.15,
        Math.round(((clampedTopPx / totalPairPx) * totalPairWeight) * 100) / 100
      );
      const nextBottomRatio = Math.max(
        0.15,
        Math.round((totalPairWeight - nextTopRatio) * 100) / 100
      );

      setPanelGroups((prev) =>
        prev.map((g, idx) => {
          if (idx === splitIndex) {
            return { ...g, collapsed: false, heightRatio: nextTopRatio };
          }
          if (idx === splitIndex + 1) {
            return { ...g, collapsed: false, heightRatio: nextBottomRatio };
          }
          return g;
        })
      );
    };

    const cleanup = () => {
      setActiveSplitResizeIndex(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', cleanup);
      splitResizeCleanupRef.current = null;
    };

    splitResizeCleanupRef.current = cleanup;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', cleanup);
  };

  const handleNudgeSplit = (splitIndex: number, direction: 'up' | 'down') => {
    setPanelGroups((prev) => {
      const topGroup = prev[splitIndex];
      const bottomGroup = prev[splitIndex + 1];
      if (!topGroup || !bottomGroup) return prev;
      const topWeight = topGroup.heightRatio ?? 1;
      const bottomWeight = bottomGroup.heightRatio ?? 1;
      const totalPairWeight = Math.max(0.4, topWeight + bottomWeight);
      const step = totalPairWeight * 0.18;
      const rawNextTop = direction === 'up' ? topWeight - step : topWeight + step;
      const nextTop = Math.max(
        0.2,
        Math.min(totalPairWeight - 0.2, Math.round(rawNextTop * 100) / 100)
      );
      const nextBottom = Math.max(
        0.2,
        Math.round((totalPairWeight - nextTop) * 100) / 100
      );
      return prev.map((g, idx) => {
        if (idx === splitIndex) {
          return { ...g, collapsed: false, heightRatio: nextTop };
        }
        if (idx === splitIndex + 1) {
          return { ...g, collapsed: false, heightRatio: nextBottom };
        }
        return g;
      });
    });
  };

  const handleMoveGroupOrder = (groupId: string, direction: 'up' | 'down') => {
    setPanelGroups((prev) => {
      const idx = prev.findIndex((g) => g.id === groupId);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(idx, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });
  };

  const handleAddNewGroup = () => {
    if (panelGroups.length >= MAX_PANEL_GROUPS) return;
    const newId = `group-custom-${Date.now()}`;
    setPanelGroups((prev) => {
      if (prev.length >= MAX_PANEL_GROUPS) return prev;
      const newGroupNumber = prev.length + 1;

      // Find the group with the most tabs (>= 2) and automatically detach a tab into the new split so it immediately has live content
      let donorGroupIdx = -1;
      let maxTabs = 1;
      prev.forEach((g, idx) => {
        if (g.panels.length > maxTabs) {
          maxTabs = g.panels.length;
          donorGroupIdx = idx;
        }
      });

      if (donorGroupIdx !== -1) {
        const donor = prev[donorGroupIdx];
        const detachIdx =
          donor.panels.findIndex((p) => p.id !== donor.activePanelId) !== -1
            ? donor.panels.findIndex((p) => p.id !== donor.activePanelId)
            : donor.panels.length - 1;
        const detachedTab = donor.panels[detachIdx];
        const remainingDonorPanels = donor.panels.filter((_, i) => i !== detachIdx);
        const updatedPrev = prev.map((g, idx) =>
          idx === donorGroupIdx
            ? {
                ...g,
                panels: remainingDonorPanels,
                activePanelId:
                  g.activePanelId === detachedTab.id
                    ? remainingDonorPanels[0]?.id ?? null
                    : g.activePanelId,
              }
            : g
        );
        return [
          ...updatedPrev,
          {
            id: newId,
            title: `SPLIT ${newGroupNumber - 1}: ${detachedTab.title.toUpperCase()}`,
            collapsed: false,
            activePanelId: detachedTab.id,
            panels: [detachedTab],
            heightRatio: 1,
          },
        ];
      }

      return [
        ...prev,
        {
          id: newId,
          title: `SPLIT ${newGroupNumber - 1}`,
          collapsed: false,
          activePanelId: null,
          panels: [],
          heightRatio: 1,
        },
      ];
    });
  };

  const handleToggleGroupCollapse = (groupId: string) => {
    setPanelGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, collapsed: !g.collapsed } : g))
    );
  };

  const handleRemoveGroup = (groupId: string) => {
    setPanelGroups((prev) => {
      if (prev.length <= 1) return prev;
      const groupToRemove = prev.find((g) => g.id === groupId);
      if (!groupToRemove) return prev;
      const remaining = prev.filter((g) => g.id !== groupId);
      if (groupToRemove.panels.length > 0 && remaining.length > 0) {
        const target = remaining[0];
        const mergedPanels = [...target.panels, ...groupToRemove.panels];
        remaining[0] = {
          ...target,
          collapsed: false,
          activePanelId: target.activePanelId ?? mergedPanels[0]?.id ?? null,
          panels: mergedPanels,
        };
      }
      return remaining;
    });
  };

  const activatePanelInGroup = (groupId: string, panelId: DockPanelId) => {
    setPanelGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, activePanelId: panelId } : g))
    );
    setOverflowDropdownGroupId(null);

    // Smoothly auto-scroll the selected tab into view inside the horizontal tab strip
    requestAnimationFrame(() => {
      const tabEl = tabButtonRefs.current[`${groupId}:${panelId}`];
      if (tabEl) {
        tabEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        });
      }
      setTimeout(measureAllTabStrips, 180);
    });
  };

  const movePanelToGroup = (
    panelId: DockPanelId,
    targetGroupId: string | 'NEW_GROUP',
    beforePanelId?: DockPanelId
  ) => {
    setPanelGroups((prev) => {
      let movingTab: DockPanelTab | null = null;
      for (const g of prev) {
        const found = g.panels.find((p) => p.id === panelId);
        if (found) {
          movingTab = { ...found };
          break;
        }
      }
      if (!movingTab) return prev;

      let actualTargetGroupId = targetGroupId;
      let workingGroups = prev.map((g) => {
        const filtered = g.panels.filter((p) => p.id !== panelId);
        const nextActive =
          g.activePanelId === panelId ? filtered[0]?.id ?? null : g.activePanelId;
        return {
          ...g,
          panels: filtered,
          activePanelId: nextActive,
        };
      });

      if (targetGroupId === 'NEW_GROUP') {
        if (workingGroups.length >= MAX_PANEL_GROUPS) {
          actualTargetGroupId = workingGroups[workingGroups.length - 1].id;
        } else {
          const newGroupId = `group-custom-${Date.now()}`;
          actualTargetGroupId = newGroupId;
          workingGroups = [
            ...workingGroups,
            {
              id: newGroupId,
              title: `SPLIT ${workingGroups.length}: ${movingTab.title.toUpperCase()}`,
              collapsed: false,
              activePanelId: movingTab.id,
              panels: [],
              heightRatio: 1,
            },
          ];
        }
      }

      return workingGroups.map((g) => {
        if (g.id !== actualTargetGroupId) return g;
        const nextPanels = [...g.panels];
        if (beforePanelId) {
          const idx = nextPanels.findIndex((p) => p.id === beforePanelId);
          if (idx !== -1) {
            nextPanels.splice(idx, 0, movingTab!);
          } else {
            nextPanels.push(movingTab!);
          }
        } else {
          nextPanels.push(movingTab!);
        }
        return {
          ...g,
          collapsed: false,
          activePanelId: movingTab!.id,
          panels: nextPanels,
        };
      });
    });
    setOverflowDropdownGroupId(null);
  };

  // --- Layer Z-Order Drag-and-Drop Reorder Execution ---
  const executeLayerMove = (
    draggedId: string,
    targetId: string,
    placement: 'above' | 'below'
  ) => {
    if (draggedId === targetId) return;

    if (onMoveLayer) {
      onMoveLayer(draggedId, targetId, placement);
      return;
    }

    const fromIdx = objects.findIndex((o) => o.id === draggedId);
    const targetIdx = objects.findIndex((o) => o.id === targetId);
    if (fromIdx === -1 || targetIdx === -1) return;

    const targetIdxAfterRemove = fromIdx < targetIdx ? targetIdx - 1 : targetIdx;
    const desiredIdx =
      placement === 'above' ? targetIdxAfterRemove + 1 : targetIdxAfterRemove;
    const delta = desiredIdx - fromIdx;

    if (delta > 0) {
      for (let i = 0; i < delta; i++) {
        onReorderObject(draggedId, 'up');
      }
    } else if (delta < 0) {
      for (let i = 0; i < Math.abs(delta); i++) {
        onReorderObject(draggedId, 'down');
      }
    }
  };

  // --- Modern Auto-Layout Stack & Distribute Actions ---
  const handleAutoStack = (
    axis: 'horizontal' | 'vertical',
    gap: number
  ) => {
    const targets =
      selectedObjects.length >= 2
        ? [...selectedObjects]
        : objects.filter((o) => o.visible && !o.locked);
    if (targets.length < 2) return;

    if (axis === 'horizontal') {
      const sorted = [...targets].sort((a, b) => a.x - b.x);
      const anchorY = Math.round(sorted[0].y);
      let cursorX = Math.round(sorted[0].x);
      for (const obj of sorted) {
        onUpdateObject(obj.id, {
          x: Math.round(cursorX),
          y: anchorY,
        });
        cursorX += Math.round(obj.width) + gap;
      }
    } else {
      const sorted = [...targets].sort((a, b) => a.y - b.y);
      const anchorX = Math.round(sorted[0].x);
      let cursorY = Math.round(sorted[0].y);
      for (const obj of sorted) {
        onUpdateObject(obj.id, {
          x: anchorX,
          y: Math.round(cursorY),
        });
        cursorY += Math.round(obj.height) + gap;
      }
    }
  };

  const handleDistributeEvenly = (axis: 'horizontal' | 'vertical') => {
    const targets =
      selectedObjects.length >= 3
        ? [...selectedObjects]
        : objects.filter((o) => o.visible && !o.locked);
    if (targets.length < 3) return;

    if (axis === 'horizontal') {
      const sorted = [...targets].sort((a, b) => a.x - b.x);
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const totalSpan = last.x + last.width - first.x;
      const sumWidths = sorted.reduce((acc, o) => acc + o.width, 0);
      const gap = (totalSpan - sumWidths) / (sorted.length - 1);
      let cursorX = first.x;
      for (const obj of sorted) {
        onUpdateObject(obj.id, { x: Math.round(cursorX) });
        cursorX += obj.width + gap;
      }
    } else {
      const sorted = [...targets].sort((a, b) => a.y - b.y);
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const totalSpan = last.y + last.height - first.y;
      const sumHeights = sorted.reduce((acc, o) => acc + o.height, 0);
      const gap = (totalSpan - sumHeights) / (sorted.length - 1);
      let cursorY = first.y;
      for (const obj of sorted) {
        onUpdateObject(obj.id, { y: Math.round(cursorY) });
        cursorY += obj.height + gap;
      }
    }
  };

  // --- Strict Monochrome Greyscale Type Badge ---
  const renderTypeBadge = (obj: CanvasObject) => {
    if (obj.type === 'autoshape') {
      return (
        <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-none bg-[#d4d4d4] text-[#111111] border border-[#f5f5f5] shrink-0">
          JS
        </span>
      );
    }
    if (obj.type === 'vector-path') {
      return (
        <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-none bg-[#262626] text-[#e5e5e5] border border-[#525252] shrink-0">
          VEC
        </span>
      );
    }
    if (obj.type === 'bitmap') {
      return (
        <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-none bg-[#1c1c1c] text-[#a3a3a3] border border-[#383838] shrink-0">
          BMP
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-none bg-[#2e2e2e] text-[#f5f5f5] border border-[#737373] shrink-0">
        TXT
      </span>
    );
  };

  // --- Render Individual Panel Contents ---
  const renderLayersPanelContent = () => {
    const primarySelectedId = selectedIds[0] ?? null;
    const normalizedLayerQuery = layerSearchQuery.trim().toLowerCase();

    const filteredLayerEntries = reversedObjects
      .map((obj, visualIdx) => ({
        obj,
        zIndexNumber: objects.length - visualIdx,
      }))
      .filter(({ obj }) => {
        if (layerTypeFilter !== 'all' && obj.type !== layerTypeFilter) {
          return false;
        }
        if (normalizedLayerQuery) {
          const textContent =
            obj.type === 'text' ? ((obj as TextObject).text || '').toLowerCase() : '';
          return (
            obj.name.toLowerCase().includes(normalizedLayerQuery) ||
            obj.type.toLowerCase().includes(normalizedLayerQuery) ||
            textContent.includes(normalizedLayerQuery)
          );
        }
        return true;
      });

    const isFilterActive = layerTypeFilter !== 'all' || normalizedLayerQuery.length > 0;

    return (
      <div className="flex flex-col flex-1 min-h-0 h-full bg-[#111111] transition-all">
        {/* Layers Sub-Toolbar */}
        <div className="px-2 py-1.5 border-b border-[#2e2e2e] bg-[#161616] flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#a3a3a3] truncate">
              {isFilterActive
                ? `${filteredLayerEntries.length}/${objects.length} Layers`
                : `${objects.length} ${objects.length === 1 ? 'Layer' : 'Layers'}`}
            </span>
            {primarySelectedId && (
              <div className="flex items-center gap-0.5 ml-1 border-l border-[#2e2e2e] pl-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onReorderObject(primarySelectedId, 'top')}
                  title="Bring to Front (Top of Z-Order)"
                  className="p-0.5 rounded-none bg-[#1c1c1c] hover:bg-[#2e2e2e] text-[#d4d4d4] border border-[#383838]"
                >
                  <ArrowUpToLine className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onReorderObject(primarySelectedId, 'up')}
                  title="Bring Forward"
                  className="p-0.5 rounded-none bg-[#1c1c1c] hover:bg-[#2e2e2e] text-[#d4d4d4] border border-[#383838]"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onReorderObject(primarySelectedId, 'down')}
                  title="Send Backward"
                  className="p-0.5 rounded-none bg-[#1c1c1c] hover:bg-[#2e2e2e] text-[#d4d4d4] border border-[#383838]"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onReorderObject(primarySelectedId, 'bottom')}
                  title="Send to Back (Bottom of Z-Order)"
                  className="p-0.5 rounded-none bg-[#1c1c1c] hover:bg-[#2e2e2e] text-[#d4d4d4] border border-[#383838]"
                >
                  <ArrowDownToLine className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {panelGroups.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  const nextTall = !isLayersTall;
                  setIsLayersTall(nextTall);
                  setPanelGroups((prev) =>
                    prev.map((g) =>
                      g.panels.some((p) => p.id === 'layers')
                        ? { ...g, heightRatio: nextTall ? 2.2 : 1 }
                        : g
                    )
                  );
                }}
                title="Toggle Compact / Tall Split Ratio for Layers Pane"
                className={`px-1.5 py-0.5 rounded-none text-[9px] font-mono border transition-colors ${
                  isLayersTall
                    ? 'bg-[#2e2e2e] text-[#ffffff] border-[#737373]'
                    : 'bg-[#181818] text-[#a3a3a3] border-[#383838] hover:text-white'
                }`}
              >
                {isLayersTall ? 'Tall' : 'Normal'}
              </button>
            )}
            <button
              type="button"
              onClick={onAddBlankBitmapLayer}
              title="Create a new blank Raster Bitmap Layer for pixel painting & marquees"
              className="px-2 py-0.5 rounded-none text-[10px] font-mono bg-[#242424] hover:bg-[#383838] text-[#f5f5f5] border border-[#525252] flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>+ Bitmap</span>
            </button>
          </div>
        </div>

        {/* Instant Layer Search & Type Filter Bar (Essential for 50+ Layer Website Layouts) */}
        <div className="px-2 py-1 border-b border-[#242424] bg-[#141414] flex items-center gap-1">
          <div className="relative flex-1 min-w-0">
            <Search className="w-3 h-3 text-[#737373] absolute left-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={layerSearchQuery}
              onChange={(e) => setLayerSearchQuery(e.target.value)}
              placeholder="Filter layers..."
              className="w-full pl-5 pr-5 py-0.5 bg-[#0a0a0a] border border-[#2e2e2e] focus:border-[#a3a3a3] rounded-none text-[10px] font-mono text-[#ffffff] placeholder-[#666666] outline-none"
            />
            {layerSearchQuery && (
              <button
                type="button"
                onClick={() => setLayerSearchQuery('')}
                title="Clear layer search"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#ffffff]"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'autoshape', label: 'JS' },
                { id: 'vector-path', label: 'VEC' },
                { id: 'bitmap', label: 'BMP' },
                { id: 'text', label: 'TXT' },
              ] as const
            ).map((filterOpt) => (
              <button
                key={filterOpt.id}
                type="button"
                onClick={() => setLayerTypeFilter(filterOpt.id)}
                className={`px-1 py-0.5 text-[9px] font-mono border rounded-none transition-colors ${
                  layerTypeFilter === filterOpt.id
                    ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-bold'
                    : 'bg-[#181818] text-[#a3a3a3] border-[#2e2e2e] hover:text-[#ffffff]'
                }`}
                title={`Filter layers by ${filterOpt.label}`}
              >
                {filterOpt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Draggable Layers Stack */}
        <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
          {reversedObjects.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 text-xs text-[#737373] font-mono">
              No objects on canvas. Draw a Vector, Bitmap, or insert a JS AutoShape.
            </div>
          ) : filteredLayerEntries.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 text-xs text-[#737373] font-mono gap-1.5">
              <span>No layers match &ldquo;{layerSearchQuery || layerTypeFilter}&rdquo;.</span>
              <button
                type="button"
                onClick={() => {
                  setLayerSearchQuery('');
                  setLayerTypeFilter('all');
                }}
                className="px-2 py-0.5 bg-[#1c1c1c] hover:bg-[#2e2e2e] border border-[#484848] text-[10px] text-[#e5e5e5]"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            filteredLayerEntries.map(({ obj, zIndexNumber }) => {
              const isSelected = selectedIds.includes(obj.id);
              const isBeingDragged = draggedLayerId === obj.id;
              const showTopLine =
                layerDropIndicator?.targetId === obj.id &&
                layerDropIndicator.placement === 'above';
              const showBottomLine =
                layerDropIndicator?.targetId === obj.id &&
                layerDropIndicator.placement === 'below';

              return (
                <div
                  key={obj.id}
                  draggable={editingLayerId !== obj.id}
                  onDragStart={(e) => {
                    e.stopPropagation();
                    setDraggedLayerId(obj.id);
                    setDraggedPanel(null);
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', `layer:${obj.id}`);
                  }}
                  onDragOver={(e) => {
                    if (!draggedLayerId || draggedLayerId === obj.id) return;
                    e.preventDefault();
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = 'move';
                    const rect = e.currentTarget.getBoundingClientRect();
                    const offsetY = e.clientY - rect.top;
                    const placement: 'above' | 'below' =
                      offsetY < rect.height / 2 ? 'above' : 'below';
                    setLayerDropIndicator({ targetId: obj.id, placement });
                  }}
                  onDragLeave={(e) => {
                    e.stopPropagation();
                    if (layerDropIndicator?.targetId === obj.id) {
                      setLayerDropIndicator(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (draggedLayerId && draggedLayerId !== obj.id) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const offsetY = e.clientY - rect.top;
                      const placement: 'above' | 'below' =
                        offsetY < rect.height / 2 ? 'above' : 'below';
                      executeLayerMove(draggedLayerId, obj.id, placement);
                    }
                    setDraggedLayerId(null);
                    setLayerDropIndicator(null);
                  }}
                  onDragEnd={() => {
                    setDraggedLayerId(null);
                    setLayerDropIndicator(null);
                  }}
                  onClick={(e) =>
                    onSelectObject(obj.id, e.shiftKey || e.metaKey || e.ctrlKey)
                  }
                  onDoubleClick={() => startLayerRename(obj)}
                  style={{
                    borderTop: showTopLine ? '2px solid #ffffff' : undefined,
                    borderBottom: showBottomLine ? '2px solid #ffffff' : undefined,
                  }}
                  className={`group relative flex items-center justify-between px-1.5 py-1.5 rounded-none border cursor-pointer transition-colors ${
                    isBeingDragged ? 'opacity-40 ' : ''
                  }${
                    isSelected
                      ? 'bg-[#2e2e2e] border-[#d4d4d4] text-[#ffffff]'
                      : 'bg-[#161616] border-[#242424] hover:border-[#525252] text-[#d4d4d4]'
                  }`}
                >
                  <div className="flex items-center gap-1 min-w-0 flex-1">
                    {/* Drag Grip Handle */}
                    <span
                      title="Drag up or down to reorder Z-index"
                      className="text-[#525252] group-hover:text-[#a3a3a3] cursor-grab active:cursor-grabbing shrink-0"
                    >
                      <GripVertical className="w-3 h-3" />
                    </span>

                    {/* Visibility Toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateObject(obj.id, { visible: !obj.visible });
                      }}
                      title={obj.visible ? 'Hide Layer' : 'Show Layer'}
                      className="text-[#a3a3a3] hover:text-[#ffffff] p-0.5 rounded-none shrink-0"
                    >
                      {obj.visible ? (
                        <Eye className="w-3.5 h-3.5 text-[#d4d4d4]" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-[#525252]" />
                      )}
                    </button>

                    {/* Lock Toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateObject(obj.id, { locked: !obj.locked });
                      }}
                      title={obj.locked ? 'Unlock Layer' : 'Lock Layer'}
                      className="text-[#a3a3a3] hover:text-[#ffffff] p-0.5 rounded-none shrink-0"
                    >
                      {obj.locked ? (
                        <Lock className="w-3 h-3 text-[#ffffff]" />
                      ) : (
                        <Unlock className="w-3 h-3 text-[#525252] opacity-60 group-hover:opacity-100" />
                      )}
                    </button>

                    {renderTypeBadge(obj)}

                    {editingLayerId === obj.id ? (
                      <input
                        type="text"
                        value={editingLayerName}
                        autoFocus
                        onChange={(e) => setEditingLayerName(e.target.value)}
                        onBlur={() => commitLayerRename(obj.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitLayerRename(obj.id);
                          if (e.key === 'Escape') setEditingLayerId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-[#0a0a0a] border border-[#ffffff] rounded-none px-1 py-0.5 text-xs text-[#ffffff] outline-none font-mono"
                      />
                    ) : (
                      <span
                        title={`Z-Order #${zIndexNumber}: ${obj.name} (Double-click to rename, drag to reorder)`}
                        className={`text-xs truncate ${
                          !obj.visible ? 'line-through text-[#737373]' : ''
                        }`}
                      >
                        {obj.name}
                      </span>
                    )}
                  </div>

                  {/* Quick Layer Action Controls */}
                  <div
                    className="flex items-center gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity ml-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => startLayerRename(obj)}
                      title="Rename Layer"
                      className="p-0.5 hover:bg-[#383838] text-[#a3a3a3] hover:text-[#ffffff] rounded-none"
                    >
                      <Pencil className="w-2.5 h-2.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onReorderObject(obj.id, 'up')}
                      title="Bring Forward"
                      className="p-0.5 hover:bg-[#383838] text-[#a3a3a3] hover:text-[#ffffff] rounded-none"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onReorderObject(obj.id, 'down')}
                      title="Send Backward"
                      className="p-0.5 hover:bg-[#383838] text-[#a3a3a3] hover:text-[#ffffff] rounded-none"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    {obj.type !== 'bitmap' && (
                      <button
                        type="button"
                        onClick={() => onRasterizeObject(obj.id)}
                        title="Flatten / Rasterize to Bitmap Layer"
                        className="p-0.5 hover:bg-[#383838] text-[#a3a3a3] hover:text-[#ffffff] rounded-none"
                      >
                        <ImageIcon className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDuplicateObject(obj.id)}
                      title="Duplicate Object (Ctrl+D)"
                      className="p-0.5 hover:bg-[#383838] text-[#a3a3a3] hover:text-[#ffffff] rounded-none"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteObject(obj.id)}
                      title="Delete Object (Del)"
                      className="p-0.5 hover:bg-[#383838] text-[#a3a3a3] hover:text-[#ffffff] rounded-none"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderHistoryPanelContent = () => {
    const stepsList = Array.from({ length: Math.max(1, historyCount + 1) }, (_, i) => i + 1);

    return (
      <div className="flex flex-col flex-1 min-h-0 h-full bg-[#111111] p-2 space-y-2">
        <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-1.5">
          <div className="flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-[#d4d4d4]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#d4d4d4]">
              Osito Undo Stack ({historyCount + 1} States)
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={!canUndo}
              onClick={onUndo}
              title="Step Backward / Undo (Ctrl+Z)"
              className="px-2 py-0.5 rounded-none bg-[#1c1c1c] hover:bg-[#2e2e2e] disabled:opacity-30 text-[#f5f5f5] border border-[#383838] text-[10px] font-mono flex items-center gap-1"
            >
              <Undo2 className="w-3 h-3" />
              <span>Undo</span>
            </button>
            <button
              type="button"
              disabled={!canRedo}
              onClick={onRedo}
              title="Step Forward / Redo (Ctrl+Y)"
              className="px-2 py-0.5 rounded-none bg-[#1c1c1c] hover:bg-[#2e2e2e] disabled:opacity-30 text-[#f5f5f5] border border-[#383838] text-[10px] font-mono flex items-center gap-1"
            >
              <Redo2 className="w-3 h-3" />
              <span>Redo</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
          {stepsList.reverse().map((stepNum, idx) => {
            const isCurrent = idx === 0;
            return (
              <div
                key={stepNum}
                onClick={() => {
                  if (!isCurrent && canUndo) {
                    onUndo();
                  }
                }}
                className={`px-2 py-1 border rounded-none flex items-center justify-between text-[11px] font-mono cursor-pointer ${
                  isCurrent
                    ? 'bg-[#2e2e2e] border-[#d4d4d4] text-[#ffffff]'
                    : 'bg-[#161616] border-[#242424] text-[#a3a3a3] hover:border-[#525252]'
                }`}
              >
                <span>
                  {stepNum === 1
                    ? '01. Osito Document Initialized'
                    : `${String(stepNum).padStart(2, '0')}. Canvas State Snapshot`}
                </span>
                <span className="text-[9px] uppercase px-1 bg-[#111111] border border-[#383838] text-[#d4d4d4]">
                  {isCurrent ? 'ACTIVE' : 'SAVED'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAutoShapesPanelContent = () => {
    const q = shapeSearchQuery.trim().toLowerCase();
    const isShapeInteractive = (s: AutoShapeDefinition) =>
      Boolean(s.previewInteractive || s.jsSourceCode.includes('onPreviewClick') || s.paramSchema.length > 0);

    const filteredPool = autoShapes.filter((s) => {
      if (onlyPreviewInteractive && !isShapeInteractive(s)) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      );
    });

    const groupsWithShapes = AUTOSHAPE_GROUP_ORDER.map((groupName) => ({
      groupName,
      items: filteredPool.filter((s) => s.category === groupName),
    })).filter((g) => g.items.length > 0);

    // Include any legacy/uncategorized shapes so nothing is ever hidden
    const knownSet = new Set<string>(AUTOSHAPE_GROUP_ORDER);
    const uncategorized = filteredPool.filter((s) => !knownSet.has(s.category));
    if (uncategorized.length > 0) {
      const creativeGroup = groupsWithShapes.find((g) => g.groupName === 'Creative & Vector');
      if (creativeGroup) {
        creativeGroup.items.push(...uncategorized);
      } else {
        groupsWithShapes.push({ groupName: 'Creative & Vector', items: uncategorized });
      }
    }

    const visibleGroups =
      activeShapeGroup === 'All'
        ? groupsWithShapes
        : groupsWithShapes.filter((g) => g.groupName === activeShapeGroup);

    const SHORT_GROUP_LABELS: Record<AutoShapeCategory, string> = {
      'User Interface': 'UI Controls',
      'Web & Layouts': 'Web & Layouts',
      'Data & Charts': 'Data & Charts',
      'Badges & Icons': 'Badges & Icons',
      'Flow & Diagrams': 'Sitemaps & Flow',
      'Creative & Vector': 'Creative',
      'Custom JS': 'Custom JS',
      Basic: 'Basic',
      'Callouts & UI': 'Callouts',
      'Mechanical & Technical': 'Technical',
    };

    return (
      <div className="flex flex-col flex-1 min-h-0 h-full bg-[#111111]">
        {/* Search & Interactive Preview Filter Bar */}
        <div className="px-2 pt-1.5 pb-1 bg-[#0d0d0d] border-b border-[#242424] flex items-center gap-1.5">
          <input
            type="text"
            value={shapeSearchQuery}
            onChange={(e) => setShapeSearchQuery(e.target.value)}
            placeholder={`Search ${autoShapes.length} AutoShapes (Sitemap, Bento, Hero, Tabs)...`}
            className="flex-1 min-w-0 bg-[#141414] border border-[#2e2e2e] focus:border-[#ffffff] rounded-none px-2 py-1 text-[10px] font-mono text-[#f5f5f5] placeholder-[#666666] outline-none"
          />
          {shapeSearchQuery && (
            <button
              type="button"
              onClick={() => setShapeSearchQuery('')}
              className="px-1.5 py-1 bg-[#1c1c1c] hover:bg-[#2e2e2e] border border-[#383838] text-[9px] font-mono text-[#a3a3a3] hover:text-white rounded-none"
              title="Clear search"
            >
              ✕
            </button>
          )}
          <button
            type="button"
            onClick={() => setOnlyPreviewInteractive((prev) => !prev)}
            title="Filter AutoShapes that respond interactively to clicks/drags in Live Preview Mode"
            className={`px-1.5 py-1 rounded-none text-[9px] font-mono border shrink-0 transition-colors ${
              onlyPreviewInteractive
                ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-bold'
                : 'bg-[#161616] text-[#d4d4d4] border-[#383838] hover:text-[#ffffff]'
            }`}
          >
            ⚡ Preview Ready
          </button>
        </div>

        {/* Group Filter Pill Bar */}
        <div className="px-2 py-1.5 border-b border-[#242424] bg-[#0d0d0d] flex items-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveShapeGroup('All')}
            className={`px-1.5 py-0.5 text-[9px] font-mono rounded-none border transition-colors ${
              activeShapeGroup === 'All'
                ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-semibold'
                : 'bg-[#161616] text-[#a3a3a3] border-[#2e2e2e] hover:text-[#ffffff] hover:border-[#525252]'
            }`}
          >
            All ({filteredPool.length})
          </button>
          {groupsWithShapes.map(({ groupName, items }) => {
            const isSelected = activeShapeGroup === groupName;
            return (
              <button
                key={groupName}
                type="button"
                onClick={() =>
                  setActiveShapeGroup((prev) => (prev === groupName ? 'All' : groupName))
                }
                title={`Filter by ${groupName} (${items.length} AutoShapes)`}
                className={`px-1.5 py-0.5 text-[9px] font-mono rounded-none border transition-colors ${
                  isSelected
                    ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-semibold'
                    : 'bg-[#161616] text-[#a3a3a3] border-[#2e2e2e] hover:text-[#ffffff] hover:border-[#525252]'
                }`}
              >
                {SHORT_GROUP_LABELS[groupName] || groupName} ({items.length})
              </button>
            );
          })}
        </div>

        {/* Grouped AutoShape Sections */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2.5">
          {visibleGroups.map(({ groupName, items }) => {
            const isCollapsed =
              Boolean(collapsedShapeGroups[groupName]) &&
              activeShapeGroup === 'All' &&
              !q;
            return (
              <div key={groupName} className="border border-[#242424] bg-[#0f0f0f] rounded-none">
                <button
                  type="button"
                  onClick={() =>
                    setCollapsedShapeGroups((prev) => ({
                      ...prev,
                      [groupName]: !prev[groupName],
                    }))
                  }
                  className="w-full px-2 py-1 bg-[#161616] hover:bg-[#1f1f1f] border-b border-[#242424] flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    {isCollapsed ? (
                      <ChevronRight className="w-3 h-3 text-[#a3a3a3]" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-[#d4d4d4]" />
                    )}
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#e5e5e5]">
                      {groupName}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono px-1 py-0.2 bg-[#111111] border border-[#2e2e2e] text-[#a3a3a3]">
                    {items.length}
                  </span>
                </button>

                {!isCollapsed && (
                  <div className="p-1.5 grid grid-cols-2 gap-1.5">
                    {items.map((shape) => {
                      const hasLivePreview = isShapeInteractive(shape);
                      return (
                        <button
                          key={shape.id}
                          type="button"
                          onClick={() => onInsertAutoShape(shape.id)}
                          title={`${shape.name} [${shape.category}]\n${shape.description}${
                            shape.previewHint ? `\n⚡ Preview Mode: ${shape.previewHint}` : '\n⚡ Interactive in Preview Mode'
                          }\nClick to insert onto Osito canvas`}
                          className="flex flex-col items-center justify-between p-1.5 rounded-none border border-[#2e2e2e] bg-[#161616] hover:bg-[#242424] hover:border-[#d4d4d4] text-left transition-colors group"
                        >
                          <div className="relative w-full flex items-center justify-center py-1 bg-[#0d0d0d] border border-[#242424] mb-1.5">
                            <AutoShapeThumbnail
                              shape={shape}
                              width={72}
                              height={42}
                              className="border-none"
                            />
                            {hasLivePreview && (
                              <span
                                className="absolute top-0.5 right-0.5 px-1 py-0 text-[7px] font-mono bg-[#1f1f1f] text-[#e5e5e5] border border-[#484848]"
                                title={shape.previewHint || 'Interactive in Live Preview Mode'}
                              >
                                LIVE
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between w-full gap-1">
                            <span className="text-[10px] font-medium text-[#d4d4d4] group-hover:text-[#ffffff] truncate">
                              {shape.name.replace(/^Smart\s+/i, '')}
                            </span>
                            <span className="text-[9px] font-mono text-[#a3a3a3] group-hover:text-[#ffffff] shrink-0">
                              {shape.paramSchema.length}◆
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-2 border-t border-[#2e2e2e] bg-[#161616]">
          <button
            type="button"
            onClick={onOpenAutoShapeStudio}
            className="w-full py-1.5 px-2.5 rounded-none bg-[#242424] hover:bg-[#383838] border border-[#737373] text-[#f5f5f5] text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-[#ffffff]" />
            <span>+ Create / Edit JS AutoShape</span>
          </button>
        </div>
      </div>
    );
  };

  const renderAlignPanelContent = () => {
    return (
      <div className="p-2.5 bg-[#111111] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#a3a3a3]">
            Alignment & 1px Grid
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={!canUndo}
              onClick={onUndo}
              title="Undo (Ctrl+Z)"
              className="p-1 rounded-none bg-[#1c1c1c] hover:bg-[#2e2e2e] disabled:opacity-35 text-[#d4d4d4] border border-[#383838]"
            >
              <Undo2 className="w-3 h-3" />
            </button>
            <button
              type="button"
              disabled={!canRedo}
              onClick={onRedo}
              title="Redo (Ctrl+Y)"
              className="p-1 rounded-none bg-[#1c1c1c] hover:bg-[#2e2e2e] disabled:opacity-35 text-[#d4d4d4] border border-[#383838]"
            >
              <Redo2 className="w-3 h-3" />
            </button>
            <span className="text-[9px] font-mono text-[#a3a3a3] px-1">
              {historyCount}st
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          <button
            type="button"
            onClick={() => onAlignSelected('left')}
            title="Align Left Edge"
            className="p-1.5 rounded-none bg-[#161616] hover:bg-[#2e2e2e] text-[#d4d4d4] hover:text-[#ffffff] border border-[#383838] flex items-center justify-center"
          >
            <AlignStartVertical className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onAlignSelected('center')}
            title="Align Horizontal Center"
            className="p-1.5 rounded-none bg-[#161616] hover:bg-[#2e2e2e] text-[#d4d4d4] hover:text-[#ffffff] border border-[#383838] flex items-center justify-center"
          >
            <AlignCenterVertical className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onAlignSelected('right')}
            title="Align Right Edge"
            className="p-1.5 rounded-none bg-[#161616] hover:bg-[#2e2e2e] text-[#d4d4d4] hover:text-[#ffffff] border border-[#383838] flex items-center justify-center"
          >
            <AlignEndVertical className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onAlignSelected('top')}
            title="Align Top Edge"
            className="p-1.5 rounded-none bg-[#161616] hover:bg-[#2e2e2e] text-[#d4d4d4] hover:text-[#ffffff] border border-[#383838] flex items-center justify-center"
          >
            <AlignStartHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onAlignSelected('middle')}
            title="Align Vertical Middle"
            className="p-1.5 rounded-none bg-[#161616] hover:bg-[#2e2e2e] text-[#d4d4d4] hover:text-[#ffffff] border border-[#383838] flex items-center justify-center"
          >
            <AlignCenterHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onAlignSelected('bottom')}
            title="Align Bottom Edge"
            className="p-1.5 rounded-none bg-[#161616] hover:bg-[#2e2e2e] text-[#d4d4d4] hover:text-[#ffffff] border border-[#383838] flex items-center justify-center"
          >
            <AlignEndHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onAlignSelected('snap-pixel')}
            title="Round All Coordinates & Dimensions to Exact Integer 1px Grid"
            className="p-1.5 rounded-none bg-[#2e2e2e] hover:bg-[#525252] text-[#ffffff] border border-[#a3a3a3] flex items-center justify-center"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onAlignSelected('snap-pixel')}
          className="w-full py-1 px-2 rounded-none bg-[#1c1c1c] hover:bg-[#2e2e2e] border border-[#383838] text-[10px] font-mono text-[#d4d4d4] hover:text-[#ffffff] flex items-center justify-center gap-1.5"
        >
          <Grid className="w-3 h-3" />
          <span>1px Snap All Coordinates</span>
        </button>

        {/* Modern Web Auto-Layout Stack & Distribute Section */}
        <div className="pt-2 border-t border-[#2e2e2e] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#d4d4d4]">
              Auto-Layout Stack & Flex Flow
            </span>
            <span className="text-[9px] font-mono text-[#737373]">
              {selectedObjects.length >= 2
                ? `${selectedObjects.length} selected`
                : 'All visible'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => handleAutoStack('horizontal', 8)}
              title="Stack selected (or visible) objects horizontally with 8px gap"
              className="py-1 px-1.5 rounded-none bg-[#161616] hover:bg-[#2e2e2e] border border-[#383838] text-[10px] font-mono text-[#d4d4d4] hover:text-[#ffffff] flex items-center justify-center gap-1"
            >
              <Columns className="w-3 h-3 shrink-0" />
              <span>Stack H (8px)</span>
            </button>
            <button
              type="button"
              onClick={() => handleAutoStack('horizontal', 16)}
              title="Stack selected (or visible) objects horizontally with 16px gap"
              className="py-1 px-1.5 rounded-none bg-[#161616] hover:bg-[#2e2e2e] border border-[#383838] text-[10px] font-mono text-[#d4d4d4] hover:text-[#ffffff] flex items-center justify-center gap-1"
            >
              <Columns className="w-3 h-3 shrink-0" />
              <span>Stack H (16px)</span>
            </button>
            <button
              type="button"
              onClick={() => handleAutoStack('vertical', 8)}
              title="Stack selected (or visible) objects vertically with 8px gap"
              className="py-1 px-1.5 rounded-none bg-[#161616] hover:bg-[#2e2e2e] border border-[#383838] text-[10px] font-mono text-[#d4d4d4] hover:text-[#ffffff] flex items-center justify-center gap-1"
            >
              <Rows className="w-3 h-3 shrink-0" />
              <span>Stack V (8px)</span>
            </button>
            <button
              type="button"
              onClick={() => handleAutoStack('vertical', 16)}
              title="Stack selected (or visible) objects vertically with 16px gap"
              className="py-1 px-1.5 rounded-none bg-[#161616] hover:bg-[#2e2e2e] border border-[#383838] text-[10px] font-mono text-[#d4d4d4] hover:text-[#ffffff] flex items-center justify-center gap-1"
            >
              <Rows className="w-3 h-3 shrink-0" />
              <span>Stack V (16px)</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => handleDistributeEvenly('horizontal')}
              title="Distribute objects evenly across horizontal span"
              className="py-1 px-1.5 rounded-none bg-[#1c1c1c] hover:bg-[#2e2e2e] border border-[#383838] text-[10px] font-mono text-[#d4d4d4] hover:text-[#ffffff]"
            >
              Distribute Evenly H
            </button>
            <button
              type="button"
              onClick={() => handleDistributeEvenly('vertical')}
              title="Distribute objects evenly across vertical span"
              className="py-1 px-1.5 rounded-none bg-[#1c1c1c] hover:bg-[#2e2e2e] border border-[#383838] text-[10px] font-mono text-[#d4d4d4] hover:text-[#ffffff]"
            >
              Distribute Evenly V
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- Interactive Component State Helpers ---
  const handleSelectStateForObject = (
    obj: CanvasObject,
    stateId: ComponentStateId
  ) => {
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

  const handleAutoGenerateStatesForObject = (obj: CanvasObject) => {
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

  const handleCreateSliceFromObject = (obj: CanvasObject) => {
    const slugName =
      (obj.name || 'osito-slice')
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'osito-slice';
    const newSlice: CanvasSlice = {
      id: `slice-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      name: slugName,
      x: Math.round(obj.x),
      y: Math.round(obj.y),
      width: Math.max(1, Math.round(obj.width)),
      height: Math.max(1, Math.round(obj.height)),
      formats: ['webp', 'avif', 'svg', 'png'],
      scales: [1, 2, 3],
      targetObjectId: obj.id,
    };
    onAddSlice?.(newSlice);
  };

  const renderRetinaSliceExporterSection = (targetObj: CanvasObject | null) => (
    <div className="pt-2 border-t border-[#2e2e2e] space-y-1.5">
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#d4d4d4] flex items-center gap-1">
          <Scissors className="w-3 h-3 text-[#ffffff] shrink-0" />
          <span>Retina Slices ({slices.length})</span>
        </span>
        {targetObj && (
          <button
            type="button"
            onClick={() => handleCreateSliceFromObject(targetObj)}
            title="Create a Retina Web Slice (@1x/@2x/@3x) around the selected object"
            className="px-1.5 py-0.5 rounded-none bg-[#1c1c1c] hover:bg-[#2e2e2e] text-[#f5f5f5] border border-[#525252] text-[9px] font-mono flex items-center gap-1 transition-colors"
          >
            <Plus className="w-2.5 h-2.5" />
            <span>+ Slice from Selected</span>
          </button>
        )}
      </div>

      {/* Active Slices List */}
      <div className="max-h-28 overflow-y-auto space-y-1 pr-0.5">
        {slices.length === 0 ? (
          <div className="px-2 py-1.5 bg-[#0a0a0a] border border-[#242424] text-[10px] font-mono text-[#737373] text-center">
            No active slices. Click &ldquo;+ Slice from Selected&rdquo; or use Slice Tool (C).
          </div>
        ) : (
          slices.map((slice) => (
            <div
              key={slice.id}
              className="flex items-center justify-between gap-1.5 px-2 py-1 bg-[#161616] border border-[#2e2e2e] rounded-none text-[10px] font-mono"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[#ffffff] font-semibold truncate">
                  {slice.name}{' '}
                  <span className="text-[#a3a3a3] font-normal">
                    ({Math.round(slice.width)}&times;{Math.round(slice.height)}px)
                  </span>
                </div>
                <div className="text-[9px] text-[#737373] truncate">
                  @1x/@2x/@3x &middot; WebP / AVIF / SVG
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDeleteSlice?.(slice.id)}
                title={`Delete slice "${slice.name}"`}
                className="px-1.5 py-0.5 bg-[#0a0a0a] hover:bg-[#2e2e2e] text-[#a3a3a3] hover:text-[#ffffff] border border-[#383838] rounded-none text-[10px] font-mono shrink-0"
              >
                &times;
              </button>
            </div>
          ))
        )}
      </div>

      {/* Batch Export .ZIP Button */}
      <button
        type="button"
        onClick={() => onExportSlicesZip?.()}
        className="w-full py-1.5 px-2 rounded-none bg-[#e5e5e5] hover:bg-[#ffffff] text-[#0a0a0a] border border-[#ffffff] text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-colors"
      >
        <Download className="w-3.5 h-3.5 text-[#0a0a0a] shrink-0" />
        <span>Batch Export .ZIP (@1x/@2x/@3x WebP + AVIF + SVG)</span>
      </button>
    </div>
  );

  // --- Modern Web Inspector: CSS3, States (:hover/:active/dark), React + Tailwind & Slice Exporter ---
  const renderCssAndReactPanelContent = () => {
    const targetObj = selectedObjects[0] ?? null;

    if (!targetObj) {
      const docSnippet =
        codeTabMode === 'react'
          ? [
              `export function OsitoCanvasStage() {`,
              `  return (`,
              `    <main className="relative min-h-screen bg-[#0c0c0c] text-[#e5e5e5] font-sans antialiased">`,
              `      {/* ${objects.length} active layers on canvas — select any card, button, or layer to inspect its JSX */}`,
              `    </main>`,
              `  );`,
              `}`,
            ].join('\n')
          : [
              `/* No Object Selected — Osito Document Root Overview (${objects.length} Layers) */`,
              `.osito-canvas-stage {`,
              `  position: relative;`,
              `  background: #0c0c0c;`,
              `  color: #e5e5e5;`,
              `  box-sizing: border-box;`,
              `}`,
            ].join('\n');

      return (
        <div className="p-2.5 bg-[#111111] space-y-2">
          <div className="p-2.5 bg-[#0a0a0a] border border-[#242424] space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#d4d4d4]">
                No Object Selected ({objects.length} Layers)
              </span>
              {reversedObjects[0] && (
                <button
                  type="button"
                  onClick={() => onSelectObject(reversedObjects[0].id, false)}
                  className="px-2 py-0.5 bg-[#1c1c1c] hover:bg-[#2e2e2e] border border-[#484848] text-[9px] font-mono text-[#ffffff] transition-colors"
                >
                  Select Top Layer
                </button>
              )}
            </div>
            <div className="text-[10px] font-mono text-[#8c8c8c]">
              Click any card, button, vector, or bitmap layer on the canvas to generate live CSS3,
              :hover/:active states, and React + Tailwind code.
            </div>
          </div>

          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center bg-[#0a0a0a] border border-[#2e2e2e] rounded-none p-0.5">
              {(
                [
                  { id: 'css', label: 'Document CSS' },
                  { id: 'react', label: 'React Stage' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCodeTabMode(tab.id)}
                  className={`px-1.5 py-0.5 text-[9px] font-mono rounded-none transition-colors ${
                    (codeTabMode === 'react' ? 'react' : 'css') === tab.id
                      ? 'bg-[#e5e5e5] text-[#0a0a0a] font-bold'
                      : 'text-[#a3a3a3] hover:text-[#ffffff]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => triggerCopyFeedback('code', docSnippet)}
              className="px-2 py-0.5 rounded-none bg-[#242424] hover:bg-[#383838] text-[#ffffff] border border-[#737373] text-[10px] font-mono flex items-center gap-1 shrink-0"
            >
              {copiedBadge === 'code' ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-2 bg-[#0a0a0a] border border-[#2e2e2e] rounded-none text-[10px] font-mono text-[#e5e5e5] overflow-x-auto max-h-36 leading-relaxed select-all">
            {docSnippet}
          </pre>

          {renderRetinaSliceExporterSection(null)}
        </div>
      );
    }

    const w = Math.round(targetObj.width);
    const h = Math.round(targetObj.height);
    const x = Math.round(targetObj.x);
    const y = Math.round(targetObj.y);
    const activeState: ComponentStateId = targetObj.activeState || 'default';

    // Extract corner radius from AutoShape parameters when inspecting high-fidelity cards or buttons
    const autoShapeParams =
      targetObj.type === 'autoshape'
        ? (targetObj as AutoShapeObject).params || {}
        : {};
    const inferredRadius =
      typeof autoShapeParams.cornerRadius === 'number'
        ? Math.round(autoShapeParams.cornerRadius)
        : typeof autoShapeParams.radius === 'number'
        ? Math.round(autoShapeParams.radius)
        : 0;
    const isInteractiveButtonLike =
      /btn|button|cta|pill|tab|nav|badge/i.test(targetObj.name) ||
      Boolean(targetObj.stateVariants) ||
      (targetObj.type === 'autoshape' &&
        /button|pill|tab|navbar|dropdown/i.test((targetObj as AutoShapeObject).shapeDefId));
    const innerLabelText =
      typeof autoShapeParams.label === 'string' && autoShapeParams.label.trim().length > 0
        ? autoShapeParams.label.trim()
        : typeof autoShapeParams.title === 'string' && autoShapeParams.title.trim().length > 0
        ? autoShapeParams.title.trim()
        : targetObj.name;

    // Resolve state variants (using saved stateVariants or intelligent monochrome defaults)
    const defaultVariant: ComponentStateOverride =
      targetObj.stateVariants?.default || {
        fill: targetObj.fill,
        fillGradientEnd: targetObj.fillGradientEnd,
        stroke: targetObj.stroke,
        strokeWidth: targetObj.strokeWidth,
        opacity: targetObj.opacity,
        shadow: targetObj.shadow,
      };
    const hoverVariant: ComponentStateOverride =
      targetObj.stateVariants?.hover || {
        fill: '#383838',
        stroke: '#ffffff',
        strokeWidth: Math.max(1, defaultVariant.strokeWidth ?? targetObj.strokeWidth),
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
      };
    const activeVariant: ComponentStateOverride =
      targetObj.stateVariants?.active || {
        fill: '#161616',
        stroke: '#a3a3a3',
        strokeWidth: Math.max(1, defaultVariant.strokeWidth ?? targetObj.strokeWidth),
        opacity: 0.95,
        offsetY: 1,
        scale: 0.98,
      };
    const darkVariant: ComponentStateOverride =
      targetObj.stateVariants?.dark || {
        fill: '#141414',
        stroke: '#e5e5e5',
        strokeWidth: Math.max(1, defaultVariant.strokeWidth ?? targetObj.strokeWidth),
        opacity: 1,
      };

    const bgRule =
      targetObj.fillType === 'none'
        ? 'transparent'
        : targetObj.fillType === 'linear-gradient'
        ? `linear-gradient(135deg, ${targetObj.fill}, ${targetObj.fillGradientEnd})`
        : targetObj.fillType === 'radial-gradient'
        ? `radial-gradient(circle, ${targetObj.fill}, ${targetObj.fillGradientEnd})`
        : targetObj.fill;

    const baseFill = defaultVariant.fill ?? targetObj.fill;
    const baseStroke = defaultVariant.stroke ?? targetObj.stroke;
    const baseStrokeW = defaultVariant.strokeWidth ?? targetObj.strokeWidth;
    const baseOpacity = defaultVariant.opacity ?? targetObj.opacity;

    const cssSelectorName = isInteractiveButtonLike ? '.osito-btn' : '.osito-card';

    const statesCssBlock = [
      `/* ${targetObj.name} — Interactive Component States */`,
      `${cssSelectorName} {`,
      `  width: ${w}px;`,
      `  height: ${h}px;`,
      targetObj.type === 'text'
        ? `  color: ${baseFill};`
        : `  background: ${baseFill};`,
      baseStrokeW > 0 && baseStroke !== 'transparent' && baseStroke !== 'none'
        ? `  border: ${baseStrokeW}px solid ${baseStroke};`
        : `  border: 1px solid transparent;`,
      inferredRadius > 0 ? `  border-radius: ${inferredRadius}px;` : `  border-radius: 0px;`,
      `  opacity: ${Number(baseOpacity.toFixed(2))};`,
      `  transition: all 160ms cubic-bezier(0.22, 1, 0.36, 1);`,
      `  cursor: pointer;`,
      `}`,
      ``,
      `${cssSelectorName}:hover {`,
      targetObj.type === 'text'
        ? `  color: ${hoverVariant.fill ?? '#ffffff'};`
        : `  background: ${hoverVariant.fill ?? '#383838'};`,
      hoverVariant.stroke && hoverVariant.stroke !== 'none'
        ? `  border-color: ${hoverVariant.stroke};`
        : `  border-color: #ffffff;`,
      `  opacity: ${Number((hoverVariant.opacity ?? 1).toFixed(2))};`,
      `  transform: translateY(${hoverVariant.offsetY ?? -1}px) scale(${
        hoverVariant.scale ?? 1.02
      });`,
      hoverVariant.shadow?.enabled
        ? `  box-shadow: ${hoverVariant.shadow.offsetX}px ${hoverVariant.shadow.offsetY}px ${hoverVariant.shadow.blur}px ${hoverVariant.shadow.color};`
        : `  box-shadow: 0px 5px 14px rgba(0, 0, 0, 0.55);`,
      `}`,
      ``,
      `${cssSelectorName}:active {`,
      targetObj.type === 'text'
        ? `  color: ${activeVariant.fill ?? '#d4d4d4'};`
        : `  background: ${activeVariant.fill ?? '#161616'};`,
      activeVariant.stroke && activeVariant.stroke !== 'none'
        ? `  border-color: ${activeVariant.stroke};`
        : `  border-color: #a3a3a3;`,
      `  opacity: ${Number((activeVariant.opacity ?? 0.95).toFixed(2))};`,
      `  transform: translateY(${activeVariant.offsetY ?? 1}px) scale(${
        activeVariant.scale ?? 0.98
      });`,
      `}`,
      ``,
      `@media (prefers-color-scheme: dark) {`,
      `  ${cssSelectorName} {`,
      targetObj.type === 'text'
        ? `    color: ${darkVariant.fill ?? '#f5f5f5'};`
        : `    background: ${darkVariant.fill ?? '#141414'};`,
      darkVariant.stroke && darkVariant.stroke !== 'none'
        ? `    border-color: ${darkVariant.stroke};`
        : `    border-color: #e5e5e5;`,
      `    opacity: ${Number((darkVariant.opacity ?? 1).toFixed(2))};`,
      `  }`,
      `}`,
    ].join('\n');

    const cssLines: string[] = [
      `/* ${targetObj.name} (${targetObj.type.toUpperCase()} — State: ${activeState.toUpperCase()}) */`,
      `width: ${w}px;`,
      `height: ${h}px;`,
    ];

    if (targetObj.type === 'text') {
      const txt = targetObj as TextObject;
      const cleanFontFamily = txt.fontFamily.includes(',')
        ? txt.fontFamily
        : `'${txt.fontFamily}', sans-serif`;
      cssLines.push(`color: ${txt.fill};`);
      cssLines.push(`font-family: ${cleanFontFamily};`);
      cssLines.push(`font-size: ${txt.fontSize}px;`);
      cssLines.push(`font-weight: ${txt.fontWeight};`);
      cssLines.push(`text-align: ${txt.textAlign};`);
      if (txt.letterSpacing) {
        cssLines.push(`letter-spacing: ${txt.letterSpacing}px;`);
      }
    } else if (targetObj.type === 'bitmap') {
      const bmp = targetObj as BitmapObject;
      cssLines.push(`object-fit: contain;`);
      if (bmp.filters) {
        const filterParts: string[] = [];
        if (bmp.filters.brightness !== 0) {
          filterParts.push(`brightness(${100 + bmp.filters.brightness}%)`);
        }
        if (bmp.filters.contrast !== 0) {
          filterParts.push(`contrast(${100 + bmp.filters.contrast}%)`);
        }
        if (bmp.filters.blur > 0) {
          filterParts.push(`blur(${bmp.filters.blur}px)`);
        }
        if (bmp.filters.invert) {
          filterParts.push(`invert(1)`);
        }
        if (filterParts.length > 0) {
          cssLines.push(`filter: ${filterParts.join(' ')};`);
        }
      }
    } else {
      cssLines.push(`background: ${bgRule};`);
      if (inferredRadius > 0) {
        cssLines.push(`border-radius: ${inferredRadius}px;`);
      }
    }

    if (targetObj.strokeWidth > 0 && targetObj.stroke !== 'transparent' && targetObj.stroke !== 'none') {
      cssLines.push(`border: ${targetObj.strokeWidth}px solid ${targetObj.stroke};`);
    }
    if (targetObj.shadow?.enabled) {
      cssLines.push(
        `box-shadow: ${targetObj.shadow.offsetX}px ${targetObj.shadow.offsetY}px ${targetObj.shadow.blur}px ${targetObj.shadow.color};`
      );
    }
    if (targetObj.opacity < 1) {
      cssLines.push(`opacity: ${Number(targetObj.opacity.toFixed(2))};`);
    }
    if (targetObj.rotation !== 0) {
      cssLines.push(`transform: rotate(${Math.round(targetObj.rotation)}deg);`);
    }

    const cssCode = targetObj.stateVariants
      ? `${cssLines.join('\n')}\n\n${statesCssBlock}`
      : cssLines.join('\n');

    const twClasses: string[] = [
      'w-[' + w + 'px]',
      'h-[' + h + 'px]',
      'transition-all',
      'duration-150',
    ];
    if (inferredRadius > 0) {
      twClasses.push('rounded-[' + inferredRadius + 'px]');
    }
    if (targetObj.type === 'text') {
      const txt = targetObj as TextObject;
      twClasses.push('text-[' + txt.fontSize + 'px]');
      twClasses.push('font-[' + txt.fontWeight + ']');
      twClasses.push('text-[' + txt.fill + ']');
    } else if (targetObj.type !== 'bitmap' && targetObj.fillType === 'solid') {
      twClasses.push('bg-[' + baseFill + ']');
      twClasses.push('hover:bg-[' + (hoverVariant.fill ?? '#383838') + ']');
      twClasses.push('active:bg-[' + (activeVariant.fill ?? '#161616') + ']');
      twClasses.push('dark:bg-[' + (darkVariant.fill ?? '#141414') + ']');
    }
    if (targetObj.strokeWidth > 0 && targetObj.stroke !== 'transparent' && targetObj.stroke !== 'none') {
      twClasses.push('border-[' + targetObj.strokeWidth + 'px]');
      twClasses.push('border-[' + baseStroke + ']');
      if (hoverVariant.stroke && hoverVariant.stroke !== 'none') twClasses.push('hover:border-[' + hoverVariant.stroke + ']');
      if (darkVariant.stroke && darkVariant.stroke !== 'none') twClasses.push('dark:border-[' + darkVariant.stroke + ']');
    }
    if (isInteractiveButtonLike) {
      twClasses.push('hover:-translate-y-[1px]', 'active:translate-y-[1px]');
    }
    if (targetObj.opacity < 1) {
      twClasses.push('opacity-' + Math.round(targetObj.opacity * 100));
    }
    if (targetObj.rotation !== 0) {
      twClasses.push('rotate-[' + Math.round(targetObj.rotation) + 'deg]');
    }
    const tailwindCode = twClasses.join(' ');

    const safeComponentName =
      targetObj.name
        .replace(/[^a-zA-Z0-9]/g, '')
        .replace(/^[0-9]+/, '') || 'OsitoElement';

    const reactTailwindCode =
      targetObj.type === 'text'
        ? `export function ${safeComponentName}() {\n  return (\n    <span\n      className="${tailwindCode}"\n      style={{ fontFamily: '${
            (targetObj as TextObject).fontFamily
          }' }}\n    >\n      ${(targetObj as TextObject).text}\n    </span>\n  );\n}`
        : targetObj.type === 'bitmap'
        ? `export function ${safeComponentName}() {\n  return (\n    <img\n      src="/assets/${targetObj.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')}.png"\n      alt="${targetObj.name}"\n      width={${w}}\n      height={${h}}\n      className="object-contain ${tailwindCode}"\n    />\n  );\n}`
        : isInteractiveButtonLike
        ? `export function ${safeComponentName}() {\n  return (\n    <button\n      type="button"\n      aria-label="${
            targetObj.name
          }"\n      className="osito-btn inline-flex items-center justify-center ${tailwindCode}"\n      style={{\n        background: '${bgRule}',${
            targetObj.shadow?.enabled
              ? `\n        boxShadow: '${targetObj.shadow.offsetX}px ${targetObj.shadow.offsetY}px ${targetObj.shadow.blur}px ${targetObj.shadow.color}',`
              : ''
          }\n      }}\n    >\n      ${innerLabelText}\n    </button>\n  );\n}`
        : `export function ${safeComponentName}() {\n  return (\n    <div\n      role="region"\n      aria-label="${
            targetObj.name
          }"\n      className="osito-card relative ${tailwindCode}"\n      style={{\n        background: '${bgRule}',${
            targetObj.shadow?.enabled
              ? `\n        boxShadow: '${targetObj.shadow.offsetX}px ${targetObj.shadow.offsetY}px ${targetObj.shadow.blur}px ${targetObj.shadow.color}',`
              : ''
          }\n      }}\n    >\n      {/* ${innerLabelText} (${w}×${h}px) */}\n    </div>\n  );\n}`;

    const displayedCode =
      codeTabMode === 'css'
        ? cssCode
        : codeTabMode === 'states'
        ? statesCssBlock
        : reactTailwindCode;

    // WCAG 2.2 Contrast Audit against dark canvas (#0a0a0a) and stroke/surface
    const contrastVsDark = computeWcagContrast(targetObj.fill, '#0a0a0a');
    const contrastVsLight = computeWcagContrast(targetObj.fill, '#ffffff');
    const bestContrast = Math.max(contrastVsDark ?? 1, contrastVsLight ?? 1);
    const wcagBadge =
      bestContrast >= 7
        ? 'WCAG AAA PASS'
        : bestContrast >= 4.5
        ? 'WCAG AA PASS'
        : 'LOW CONTRAST';

    return (
      <div className="p-2.5 bg-[#111111] space-y-2">
        {/* Selected Target Summary & WCAG 2.2 Auditor */}
        <div className="flex items-center justify-between gap-1 border-b border-[#2e2e2e] pb-1.5">
          <div className="min-w-0">
            <div className="text-[10px] font-mono font-bold text-[#ffffff] truncate">
              {targetObj.name} ({w}&times;{h} @{x},{y})
            </div>
            <div className="text-[9px] font-mono text-[#a3a3a3] flex items-center gap-1.5 mt-0.5">
              <Contrast className="w-3 h-3 text-[#d4d4d4] shrink-0" />
              <span>
                Contrast {bestContrast.toFixed(1)}:1 (vs Dark{' '}
                {(contrastVsDark ?? 1).toFixed(1)}:1)
              </span>
            </div>
          </div>
          <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#242424] text-[#ffffff] border border-[#737373] rounded-none shrink-0">
            {wcagBadge}
          </span>
        </div>

        {/* Interactive Component States (Default / :hover / :active / Dark Mode) */}
        <div className="p-1.5 bg-[#161616] border border-[#2e2e2e] rounded-none space-y-1.5">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#d4d4d4]">
              Interactive Component States
            </span>
            <span className="text-[9px] font-mono text-[#a3a3a3]">
              Active: <strong className="text-[#ffffff]">{activeState}</strong>
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {(
              [
                { id: 'default', label: 'Default' },
                { id: 'hover', label: ':hover' },
                { id: 'active', label: ':active' },
                { id: 'dark', label: 'Dark' },
              ] as const
            ).map((st) => {
              const isSelectedState = activeState === st.id;
              const hasVariant = Boolean(targetObj.stateVariants?.[st.id]);
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleSelectStateForObject(targetObj, st.id)}
                  className={`py-1 px-1 rounded-none text-[10px] font-mono border text-center transition-colors ${
                    isSelectedState
                      ? 'bg-[#e5e5e5] border-[#ffffff] text-[#0a0a0a] font-bold'
                      : hasVariant
                      ? 'bg-[#1c1c1c] border-[#737373] text-[#ffffff] hover:bg-[#262626]'
                      : 'bg-[#0a0a0a] border-[#2e2e2e] text-[#a3a3a3] hover:text-[#ffffff]'
                  }`}
                >
                  {st.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              handleAutoGenerateStatesForObject(targetObj);
              setCodeTabMode('states');
            }}
            className="w-full py-1 px-2 rounded-none bg-[#242424] hover:bg-[#e5e5e5] text-[#ffffff] hover:text-[#0a0a0a] border border-[#737373] text-[10px] font-mono font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            <Zap className="w-3 h-3 shrink-0" />
            <span>⚡ Link &amp; Generate 4 States</span>
          </button>
        </div>

        {/* Code Format Switcher ([CSS] [States :hover/:active] [React + Tailwind]) & Copy Button */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center bg-[#0a0a0a] border border-[#2e2e2e] rounded-none p-0.5">
            {(
              [
                { id: 'css', label: 'CSS' },
                { id: 'states', label: 'States :hover/:active' },
                { id: 'react', label: 'React + Tailwind' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCodeTabMode(tab.id)}
                className={`px-1.5 py-0.5 text-[9px] font-mono rounded-none transition-colors ${
                  codeTabMode === tab.id
                    ? 'bg-[#e5e5e5] text-[#0a0a0a] font-bold'
                    : 'text-[#a3a3a3] hover:text-[#ffffff]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => triggerCopyFeedback('code', displayedCode)}
            className="px-2 py-0.5 rounded-none bg-[#242424] hover:bg-[#383838] text-[#ffffff] border border-[#737373] text-[10px] font-mono flex items-center gap-1 shrink-0"
          >
            {copiedBadge === 'code' ? (
              <>
                <Check className="w-3 h-3" />
                <span>COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Live Code Block */}
        <pre className="p-2 bg-[#0a0a0a] border border-[#2e2e2e] rounded-none text-[10px] font-mono text-[#e5e5e5] overflow-x-auto max-h-44 leading-relaxed select-all">
          {displayedCode}
        </pre>

        {/* 1-Click Full Runnable React + Tailwind App Repo Exporter (.ZIP) */}
        {onExportReactTailwindAppZip && (
          <button
            type="button"
            onClick={onExportReactTailwindAppZip}
            className="w-full py-1.5 px-2.5 rounded-none bg-[#e5e5e5] hover:bg-[#ffffff] text-[#0a0a0a] border border-[#ffffff] text-[10px] font-mono font-bold flex items-center justify-between transition"
            title="Export the entire canvas layout as a runnable Vite + React 19 + TypeScript + Tailwind CSS project (.ZIP) with interactive nested menus & W3C tokens"
          >
            <span className="flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Export Full React + Tailwind App</span>
            </span>
            <span className="px-1 bg-[#0a0a0a] text-[#ffffff] text-[8.5px]">.ZIP REPO</span>
          </button>
        )}

        {/* Multi-Scale Retina Slice Exporter (@1x, @2x, @3x WebP / AVIF / SVG .ZIP) */}
        {renderRetinaSliceExporterSection(targetObj)}
      </div>
    );
  };

  // --- Live Design Tokens & Responsive Viewport Panel ---
  const renderTokensPanelContent = () => {
    // Extract and deduplicate normalized hex colors across all canvas objects (#06b6d4 === #06B6D4)
    const colorMap = new Map<string, number>();
    const fontSet = new Set<string>();

    const recordNormalizedColor = (rawColor?: string) => {
      if (!rawColor) return;
      const trimmed = rawColor.trim();
      if (!trimmed || trimmed === 'transparent' || trimmed === 'none') return;
      const normalized = toHexColor(trimmed, '').trim().toLowerCase();
      if (!normalized || !/^#[0-9a-f]{6}$/.test(normalized)) return;
      colorMap.set(normalized, (colorMap.get(normalized) ?? 0) + 1);
    };

    for (const obj of objects) {
      if (obj.type === 'text') {
        const txt = obj as TextObject;
        fontSet.add(`${txt.fontFamily} ${txt.fontSize}px (${txt.fontWeight})`);
      }
      // Skip dummy fill/stroke placeholders on raster bitmap layers
      if (obj.type === 'bitmap') {
        continue;
      }
      if (obj.fillType !== 'none') {
        recordNormalizedColor(obj.fill);
      }
      if (obj.fillType === 'linear-gradient' || obj.fillType === 'radial-gradient') {
        recordNormalizedColor(obj.fillGradientEnd);
      }
      if (obj.strokeWidth > 0) {
        recordNormalizedColor(obj.stroke);
      }
    }

    const colorTokens = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([hex, count], idx) => ({
        name: `--osito-color-${idx + 1}`,
        value: hex,
        count,
      }));

    const cssVariablesBlock = [
      ':root {',
      ...colorTokens.map((t) => `  ${t.name}: ${t.value};`),
      '}',
    ].join('\n');

    const w3cJsonBlock = JSON.stringify(
      {
        color: Object.fromEntries(
          colorTokens.map((t) => [
            t.name.replace(/^--/, ''),
            { $value: t.value, $type: 'color', usageCount: t.count },
          ])
        ),
      },
      null,
      2
    );

    const applyResponsiveSize = (w: number, h: number) => {
      const safeW = Math.max(1, Math.round(w));
      const safeH = Math.max(1, Math.round(h));
      if (onApplyCanvasPreset) {
        onApplyCanvasPreset(safeW, safeH);
      } else if (selectedObjects.length > 0) {
        onUpdateObject(selectedObjects[0].id, { width: safeW, height: safeH });
      }
    };

    return (
      <div className="p-2.5 bg-[#111111] space-y-2.5">
        {/* Extracted Document Colors Header & Export Actions */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#d4d4d4]">
            Document Colors ({colorTokens.length})
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => triggerCopyFeedback('css-vars', cssVariablesBlock)}
              title="Copy CSS Custom Properties (:root)"
              className="px-1.5 py-0.5 rounded-none bg-[#1c1c1c] hover:bg-[#2e2e2e] text-[#d4d4d4] hover:text-[#ffffff] border border-[#383838] text-[9px] font-mono"
            >
              {copiedBadge === 'css-vars' ? 'COPIED :root' : 'Copy :root'}
            </button>
            <button
              type="button"
              onClick={() => triggerCopyFeedback('w3c-json', w3cJsonBlock)}
              title="Copy Document Tokens JSON"
              className="px-1.5 py-0.5 rounded-none bg-[#242424] hover:bg-[#383838] text-[#ffffff] border border-[#737373] text-[9px] font-mono"
            >
              {copiedBadge === 'w3c-json' ? 'COPIED JSON' : 'Copy JSON'}
            </button>
          </div>
        </div>

        {/* Color Swatch List */}
        <div className="max-h-28 overflow-y-auto space-y-1 pr-0.5">
          {colorTokens.length === 0 ? (
            <div className="text-[10px] font-mono text-[#737373] py-2 text-center">
              No active document colors on canvas.
            </div>
          ) : (
            colorTokens.map((token) => (
              <div
                key={token.name}
                onClick={() =>
                  triggerCopyFeedback(token.name, `${token.name}: ${token.value};`)
                }
                title="Click to copy CSS variable declaration"
                className="flex items-center justify-between px-2 py-1 bg-[#161616] hover:bg-[#242424] border border-[#2e2e2e] rounded-none cursor-pointer text-[10px] font-mono"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3 h-3 border border-[#ffffff] rounded-none shrink-0"
                    style={{ backgroundColor: token.value }}
                  />
                  <span className="text-[#d4d4d4] truncate">{token.name}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[#ffffff] uppercase">{token.value}</span>
                  <span className="text-[9px] px-1 bg-[#0a0a0a] border border-[#383838] text-[#a3a3a3]">
                    {copiedBadge === token.name ? 'COPIED' : `${token.count}x`}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Document Fonts Summary */}
        {fontSet.size > 0 && (
          <div className="pt-1.5 border-t border-[#2e2e2e]">
            <div className="text-[9px] font-mono uppercase text-[#a3a3a3] mb-1">
              Document Fonts ({fontSet.size})
            </div>
            <div className="flex flex-wrap gap-1">
              {Array.from(fontSet).map((fontLabel) => (
                <span
                  key={fontLabel}
                  className="px-1.5 py-0.5 bg-[#161616] border border-[#2e2e2e] text-[9px] font-mono text-[#d4d4d4] rounded-none"
                >
                  {fontLabel}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Document Size / Frame Presets */}
        <div className="pt-1.5 border-t border-[#2e2e2e] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase text-[#a3a3a3]">
              Document Size Presets
            </span>
            <span className="text-[9px] font-mono text-[#737373]">
              {onApplyCanvasPreset
                ? 'Canvas Size'
                : selectedObjects[0]
                ? 'Selected Frame'
                : 'Select Object'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => applyResponsiveSize(375, 667)}
              title="Apply Mobile Viewport Size (375×667)"
              className="py-1 px-1 bg-[#161616] hover:bg-[#2e2e2e] border border-[#383838] rounded-none text-[9px] font-mono text-[#d4d4d4] hover:text-[#ffffff] flex items-center justify-center gap-1"
            >
              <Smartphone className="w-2.5 h-2.5 shrink-0" />
              <span>375&times;667</span>
            </button>
            <button
              type="button"
              onClick={() => applyResponsiveSize(768, 540)}
              title="Apply Tablet Viewport Size (768×540)"
              className="py-1 px-1 bg-[#161616] hover:bg-[#2e2e2e] border border-[#383838] rounded-none text-[9px] font-mono text-[#d4d4d4] hover:text-[#ffffff] flex items-center justify-center gap-1"
            >
              <Tablet className="w-2.5 h-2.5 shrink-0" />
              <span>768&times;540</span>
            </button>
            <button
              type="button"
              onClick={() => applyResponsiveSize(960, 640)}
              title="Apply Desktop Viewport Size (960×640)"
              className="py-1 px-1 bg-[#161616] hover:bg-[#2e2e2e] border border-[#383838] rounded-none text-[9px] font-mono text-[#d4d4d4] hover:text-[#ffffff] flex items-center justify-center gap-1"
            >
              <Monitor className="w-2.5 h-2.5 shrink-0" />
              <span>960&times;640</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderUxAndStrategyPanelContent = () => {
    return (
      <div className="p-2 space-y-2.5 bg-[#111111]">
        {/* 1. LIVE CANVAS UX & CONVERSION READINESS SCORE */}
        <div className="p-2 bg-[#161616] border border-[#383838] space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase text-[#ffffff] flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#ffffff]" />
                <span>Live Canvas UX Score</span>
              </div>
              <div className="text-[8.5px] font-mono text-[#a3a3a3]">
                {objects.length} layers • {slices.length} Retina slices
              </div>
            </div>
            <div className="px-2 py-0.5 bg-[#e5e5e5] text-[#0a0a0a] font-mono text-xs font-extrabold border border-[#ffffff]">
              {liveDockAudit.overallScore}% ({liveDockAudit.grade})
            </div>
          </div>

          <div className="space-y-1">
            {liveDockAudit.categories.map((cat) => {
              const pct = Math.round((cat.score / cat.maxScore) * 100);
              return (
                <div key={cat.id} className="space-y-0.5" title={cat.recommendation || cat.summary}>
                  <div className="flex items-center justify-between text-[8.5px] font-mono">
                    <span className="text-[#d4d4d4] truncate">{cat.label}</span>
                    <span className="text-[#ffffff] font-bold">
                      {cat.score}/{cat.maxScore}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-[#0a0a0a] overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor:
                          pct >= 90 ? '#10b981' : pct >= 70 ? '#38bdf8' : '#f59e0b',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {onAutoPolishCanvas && (
            <button
              type="button"
              onClick={() => onAutoPolishCanvas()}
              className="w-full py-1.5 px-2 bg-[#e5e5e5] hover:bg-[#ffffff] text-[#0a0a0a] border border-[#ffffff] font-mono text-[10px] font-bold flex items-center justify-center gap-1 transition"
              title="1-Click Auto-Boost: Snap all coordinates to 1px, repair contrast, inject :hover/:active states, and provision Retina slices"
            >
              <Sparkles className="w-3 h-3" />
              <span>1-Click Auto-Boost Canvas Score</span>
            </button>
          )}
        </div>

        {/* 2. QUICK DEEP RESEARCH & COMPETITOR CO-PILOT */}
        <div className="p-2 bg-[#161616] border border-[#2e2e2e] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-mono font-bold uppercase text-[#ffffff]">
              Quick Deep Research Co-Pilot
            </span>
            <span className="text-[8px] font-mono px-1.5 py-0.2 bg-[#262626] text-[#e5e5e5] border border-[#484848]">
              {liveDockDossier.industryName}
            </span>
          </div>

          <input
            type="text"
            value={dockResearchQuery}
            onChange={(e) => setDockResearchQuery(e.target.value)}
            placeholder="Type any brand, product or industry..."
            className="w-full bg-[#0a0a0a] border border-[#383838] focus:border-[#ffffff] px-2 py-1 text-[10px] font-mono text-[#ffffff] outline-none"
          />

          {/* Quick Industry Preset Pills */}
          <div className="flex flex-wrap gap-1">
            {DEEP_RESEARCH_PRESETS.slice(0, 6).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setDockResearchQuery(preset.prompt)}
                className={`px-1.5 py-0.5 text-[8.5px] font-mono border transition ${
                  dockResearchQuery === preset.prompt
                    ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-bold'
                    : 'bg-[#0c0c0c] text-[#a3a3a3] border-[#2e2e2e] hover:text-white'
                }`}
              >
                {preset.badge}
              </button>
            ))}
          </div>

          {/* Mini Synthesized Dossier Preview */}
          <div className="p-1.5 bg-[#0c0c0c] border border-[#262626] space-y-1 text-[9px] font-mono">
            <div className="text-[#ffffff] font-bold truncate">
              {liveDockDossier.brandName} • {liveDockDossier.eyebrow}
            </div>
            <div className="text-[#a3a3a3] leading-tight line-clamp-2">
              Hook: &ldquo;{liveDockDossier.threeSecondHook}&rdquo;
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[8px] text-[#737373]">
                Theme: {liveDockDossier.recommendedTheme.name}
              </span>
              <div className="flex items-center gap-0.5">
                {[
                  liveDockDossier.recommendedTheme.primary,
                  liveDockDossier.recommendedTheme.secondary,
                  liveDockDossier.recommendedTheme.accent,
                ].map((c, idx) => (
                  <span
                    key={idx}
                    className="w-2.5 h-2.5 border border-white/30"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 3 Instant Execution Buttons */}
          <div className="grid grid-cols-2 gap-1">
            {onInstantSpawnResearchedWebsite && (
              <button
                type="button"
                onClick={() => onInstantSpawnResearchedWebsite(dockResearchQuery)}
                className="py-1.5 px-1.5 bg-[#242424] hover:bg-[#e5e5e5] text-[#ffffff] hover:text-[#0a0a0a] border border-[#525252] font-mono text-[9px] font-bold truncate transition"
                title="Spawn 100% Vector Website Layout with researched copy, palette & nested menus"
              >
                + Spawn Website
              </button>
            )}
            {onInstantSpawnStrategyBoard && (
              <button
                type="button"
                onClick={() => onInstantSpawnStrategyBoard(dockResearchQuery)}
                className="py-1.5 px-1.5 bg-[#1c1c1c] hover:bg-[#e5e5e5] text-[#e5e5e5] hover:text-[#0a0a0a] border border-[#484848] font-mono text-[9px] font-bold truncate transition"
                title="Spawn 90+ layer Executive Competitor & Strategy Board with live magnetic connectors"
              >
                + Strategy Board
              </button>
            )}
          </div>

          {onOpenDeepResearchWithQuery && (
            <button
              type="button"
              onClick={() => onOpenDeepResearchWithQuery(dockResearchQuery)}
              className="w-full py-1 px-2 bg-[#121212] hover:bg-[#242424] text-[#d4d4d4] hover:text-[#ffffff] border border-[#383838] font-mono text-[9px] text-center transition"
            >
              Open Full Deep Research Dossier Studio ↗
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderPanelById = (panelId: DockPanelId) => {
    switch (panelId) {
      case 'layers':
        return renderLayersPanelContent();
      case 'history':
        return renderHistoryPanelContent();
      case 'ux-audit':
        return renderUxAndStrategyPanelContent();
      case 'autoshapes':
        return renderAutoShapesPanelContent();
      case 'align':
        return renderAlignPanelContent();
      case 'css-code':
        return renderCssAndReactPanelContent();
      case 'tokens':
        return renderTokensPanelContent();
    }
  };

  const getPanelIcon = (panelId: DockPanelId) => {
    switch (panelId) {
      case 'layers':
        return <Layers className="w-3 h-3 shrink-0" />;
      case 'history':
        return <History className="w-3 h-3 shrink-0" />;
      case 'ux-audit':
        return <Zap className="w-3 h-3 shrink-0" />;
      case 'autoshapes':
        return <Sparkles className="w-3 h-3 shrink-0" />;
      case 'align':
        return <Grid className="w-3 h-3 shrink-0" />;
      case 'css-code':
        return <FileCode2 className="w-3 h-3 shrink-0" />;
      case 'tokens':
        return <Palette className="w-3 h-3 shrink-0" />;
    }
  };

  return (
    <aside
      style={{ width: `${panelWidth}px` }}
      className="relative bg-[#0a0a0a] border-l border-[#2e2e2e] flex flex-col select-none shrink-0 z-20 rounded-none"
    >
      {/* INTERACTIVE VERTICAL RESIZE HANDLE STRIP ON LEFT EDGE */}
      <div
        onMouseDown={handleStartDockResize}
        onDoubleClick={() => setPanelWidth(DEFAULT_DOCK_WIDTH)}
        title={`Drag left or right to resize Osito panel dock (${panelWidth}px). Double-click to reset to ${DEFAULT_DOCK_WIDTH}px.`}
        className={`absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize z-30 transition-colors ${
          isResizingDock
            ? 'bg-[#ffffff]'
            : 'hover:bg-[#525252] active:bg-[#ffffff]'
        }`}
      />

      {/* TOP DOCK HEADER: Compact Undo/Redo & Panel Controls */}
      <div className="px-2.5 py-1 bg-[#141414] border-b border-[#2e2e2e] flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#d4d4d4] truncate">
            INSPECTOR
          </span>
          <div className="flex items-center gap-0.5 ml-1">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="p-1 rounded-none bg-[#1c1c1c] hover:bg-[#2e2e2e] text-[#d4d4d4] hover:text-white border border-[#383838] disabled:opacity-35 transition"
            >
              <Undo2 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className="p-1 rounded-none bg-[#1c1c1c] hover:bg-[#2e2e2e] text-[#d4d4d4] hover:text-white border border-[#383838] disabled:opacity-35 transition"
            >
              <Redo2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleAddNewGroup}
            disabled={panelGroups.length >= MAX_PANEL_GROUPS}
            title={
              panelGroups.length >= MAX_PANEL_GROUPS
                ? `Maximum of ${MAX_SPLITS} splits (${MAX_PANEL_GROUPS} stacked panel groups) reached`
                : `Split dock into an additional Panel Group (${
                    panelGroups.length - 1
                  }/${MAX_SPLITS} splits active)`
            }
            className="px-1.5 py-0.5 rounded-none bg-[#1c1c1c] hover:bg-[#2e2e2e] disabled:opacity-35 disabled:cursor-not-allowed text-[#a3a3a3] hover:text-[#ffffff] border border-[#383838] text-[9px] font-mono flex items-center gap-1 transition-colors"
          >
            <FolderPlus className="w-2.5 h-2.5" />
            <span>
              {panelGroups.length > 1
                ? `+ Split (${panelGroups.length - 1}/${MAX_SPLITS})`
                : '+ Split'}
            </span>
          </button>
          {panelGroups.length > 1 && (
            <>
              <button
                type="button"
                onClick={handleEqualizeSplits}
                title="Equalize vertical split heights across all open panel groups"
                className="px-1.5 py-0.5 rounded-none bg-[#1c1c1c] hover:bg-[#2e2e2e] text-[#a3a3a3] hover:text-[#ffffff] border border-[#383838] text-[9px] font-mono transition-colors"
              >
                = Equal
              </button>
              <button
                type="button"
                onClick={handleResetPanels}
                title="Merge all splits back into a single unified dock"
                className="px-1.5 py-0.5 rounded-none bg-[#1c1c1c] hover:bg-[#2e2e2e] text-[#a3a3a3] hover:text-[#ffffff] border border-[#383838] text-[9px] font-mono flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Merge</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* DOCKABLE PANEL GROUPS STACK (Supports up to 3 draggable vertical splits / 4 stacked groups) */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden p-1">
        {panelGroups.map((group, groupIdx) => {
          const isGroupDragTarget =
            dragOverGroupId === group.id && draggedPanel !== null;
          const activePanel =
            group.panels.find((p) => p.id === group.activePanelId) ??
            group.panels[0] ??
            null;
          const groupOverflow = overflowByGroup[group.id] ?? {
            isOverflowing: false,
            hiddenCount: 0,
          };
          const hasSplitBelow = groupIdx < panelGroups.length - 1;
          const isSplitDragging = activeSplitResizeIndex === groupIdx;

          return (
            <React.Fragment key={group.id}>
              <section
                ref={(el) => {
                  groupSectionRefs.current[group.id] = el;
                }}
                style={
                  group.collapsed
                    ? undefined
                    : {
                        flexGrow: group.heightRatio ?? 1,
                        flexShrink: 1,
                        flexBasis: '0%',
                        minHeight: '88px',
                      }
                }
                onDragOver={(e) => {
                  if (!draggedPanel) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverGroupId !== group.id) {
                    setDragOverGroupId(group.id);
                  }
                }}
                onDragLeave={() => {
                  if (dragOverGroupId === group.id) {
                    setDragOverGroupId(null);
                  }
                }}
                onDrop={(e) => {
                  if (!draggedPanel) return;
                  e.preventDefault();
                  e.stopPropagation();
                  movePanelToGroup(draggedPanel.panelId, group.id);
                  setDraggedPanel(null);
                  setDragOverGroupId(null);
                  setDragOverTabId(null);
                }}
                className={`relative border rounded-none bg-[#111111] transition-colors ${
                  group.collapsed
                    ? 'shrink-0'
                    : 'flex flex-col min-h-0 overflow-hidden'
                } ${overflowDropdownGroupId === group.id ? 'z-30' : 'z-10'} ${
                  isGroupDragTarget
                    ? 'border-[#ffffff] bg-[#1c1c1c]'
                    : 'border-[#2e2e2e]'
                }`}
              >
                {/* PANEL GROUP ACCORDION BAR (Only shown when split into multiple groups or renaming) */}
                {(panelGroups.length > 1 || editingGroupId === group.id) && (
                  <div className="px-2 py-1 bg-[#1c1c1c] border-b border-[#2e2e2e] flex items-center justify-between gap-1 shrink-0">
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => handleToggleGroupCollapse(group.id)}
                        title={
                          group.collapsed
                            ? 'Expand Panel Group'
                            : 'Collapse Panel Group'
                        }
                        className="p-0.5 text-[#a3a3a3] hover:text-[#ffffff] rounded-none shrink-0"
                      >
                        {group.collapsed ? (
                          <ChevronRight className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {editingGroupId === group.id ? (
                        <div className="flex items-center gap-1 flex-1">
                          <input
                            type="text"
                            value={editingGroupTitle}
                            autoFocus
                            onChange={(e) => setEditingGroupTitle(e.target.value)}
                            onBlur={() => commitGroupRename(group.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitGroupRename(group.id);
                              if (e.key === 'Escape') setEditingGroupId(null);
                            }}
                            className="w-full bg-[#0a0a0a] border border-[#ffffff] rounded-none px-1 py-0.5 text-[10px] font-mono font-bold text-[#ffffff] outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => commitGroupRename(group.id)}
                            className="p-0.5 bg-[#2e2e2e] text-[#ffffff] border border-[#737373] rounded-none"
                            title="Save Group Name"
                          >
                            <Check className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <span
                          onDoubleClick={() => startGroupRename(group)}
                          title="Double-click to rename this Split Panel Group"
                          className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#e5e5e5] truncate cursor-pointer"
                        >
                          {group.title}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      {panelGroups.length > 1 && (
                        <>
                          <button
                            type="button"
                            disabled={groupIdx === 0}
                            onClick={() => handleMoveGroupOrder(group.id, 'up')}
                            title="Move Split Group Up in Stack"
                            className="p-0.5 text-[#a3a3a3] hover:text-[#ffffff] hover:bg-[#2e2e2e] disabled:opacity-25 rounded-none"
                          >
                            <ArrowUp className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            disabled={groupIdx === panelGroups.length - 1}
                            onClick={() => handleMoveGroupOrder(group.id, 'down')}
                            title="Move Split Group Down in Stack"
                            className="p-0.5 text-[#a3a3a3] hover:text-[#ffffff] hover:bg-[#2e2e2e] disabled:opacity-25 rounded-none"
                          >
                            <ArrowDown className="w-2.5 h-2.5" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => startGroupRename(group)}
                        title="Rename Panel Group"
                        className="p-0.5 text-[#737373] hover:text-[#ffffff] hover:bg-[#2e2e2e] rounded-none"
                      >
                        <Pencil className="w-2.5 h-2.5" />
                      </button>
                      {panelGroups.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveGroup(group.id)}
                          title={
                            group.panels.length === 0
                              ? 'Remove Empty Panel Group'
                              : 'Close Split (merges tabs into top group)'
                          }
                          className="p-0.5 text-[#737373] hover:text-[#ffffff] hover:bg-[#2e2e2e] rounded-none"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* PANEL TABS BAR & ACTIVE PANEL BODY */}
                {!group.collapsed && (
                  <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                    {/* Single-Line Horizontal Tab Bar with Smart Overflow Right-Arrow (`>`) */}
                    <div className="relative flex items-center bg-[#161616] border-b border-[#2e2e2e] shrink-0">
                      <div
                        ref={(el) => {
                          tabStripRefs.current[group.id] = el;
                        }}
                        onScroll={measureAllTabStrips}
                        className="flex items-center flex-nowrap overflow-x-auto flex-1 min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      >
                        {group.panels.map((panel) => {
                          const isActive = activePanel?.id === panel.id;
                          const isTabDragTarget =
                            dragOverTabId === panel.id &&
                            draggedPanel !== null &&
                            draggedPanel.panelId !== panel.id;

                          return (
                            <div
                              key={panel.id}
                              ref={(el) => {
                                tabButtonRefs.current[`${group.id}:${panel.id}`] = el;
                              }}
                              draggable={editingPanelId !== panel.id}
                              onDragStart={(e) => {
                                e.stopPropagation();
                                setDraggedLayerId(null);
                                setDraggedPanel({
                                  panelId: panel.id,
                                  sourceGroupId: group.id,
                                });
                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData(
                                  'text/plain',
                                  `panel:${panel.id}:${group.id}`
                                );
                              }}
                              onDragOver={(e) => {
                                if (!draggedPanel) return;
                                e.preventDefault();
                                e.stopPropagation();
                                e.dataTransfer.dropEffect = 'move';
                                setDragOverTabId(panel.id);
                                setDragOverGroupId(group.id);
                              }}
                              onDragLeave={(e) => {
                                e.stopPropagation();
                                if (dragOverTabId === panel.id) {
                                  setDragOverTabId(null);
                                }
                              }}
                              onDrop={(e) => {
                                if (!draggedPanel) return;
                                e.preventDefault();
                                e.stopPropagation();
                                movePanelToGroup(
                                  draggedPanel.panelId,
                                  group.id,
                                  panel.id
                                );
                                setDraggedPanel(null);
                                setDragOverTabId(null);
                                setDragOverGroupId(null);
                              }}
                              onDragEnd={() => {
                                setDraggedPanel(null);
                                setDragOverTabId(null);
                                setDragOverGroupId(null);
                                setDragOverNewGroupZone(false);
                              }}
                              onClick={() => activatePanelInGroup(group.id, panel.id)}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                startPanelRename(panel);
                              }}
                              title="Click to switch tab, double-click to rename, or drag to another split pane"
                              className={`group/tab relative shrink-0 px-2.5 py-1.5 text-[11px] font-mono flex items-center gap-1.5 border-r border-[#2e2e2e] cursor-pointer rounded-none transition-colors ${
                                isTabDragTarget
                                  ? 'border-l-2 border-l-[#ffffff] bg-[#2e2e2e]'
                                  : ''
                              } ${
                                isActive
                                  ? 'bg-[#111111] text-[#ffffff] font-semibold border-t-2 border-t-[#ffffff]'
                                  : 'bg-[#161616] text-[#a3a3a3] hover:bg-[#1c1c1c] hover:text-[#e5e5e5]'
                              }`}
                            >
                              {getPanelIcon(panel.id)}

                              {editingPanelId === panel.id ? (
                                <input
                                  type="text"
                                  value={editingPanelTitle}
                                  autoFocus
                                  onChange={(e) => setEditingPanelTitle(e.target.value)}
                                  onBlur={() => commitPanelRename(panel.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') commitPanelRename(panel.id);
                                    if (e.key === 'Escape') setEditingPanelId(null);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-24 bg-[#0a0a0a] border border-[#ffffff] rounded-none px-1 py-0 text-[11px] font-mono text-[#ffffff] outline-none"
                                />
                              ) : (
                                <span className="whitespace-nowrap">
                                  {panel.title}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Smart Tab Overflow Right-Arrow (`>`) Button */}
                      {groupOverflow.isOverflowing && (
                        <div className="relative shrink-0 border-l border-[#2e2e2e] bg-[#161616]">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOverflowDropdownGroupId((prev) =>
                                prev === group.id ? null : group.id
                              );
                            }}
                            title={`More Panels (+${groupOverflow.hiddenCount})`}
                            className={`px-1.5 py-1.5 text-[10px] font-mono flex items-center gap-0.5 rounded-none transition-colors ${
                              overflowDropdownGroupId === group.id
                                ? 'bg-[#e5e5e5] text-[#0a0a0a] font-bold'
                                : 'bg-[#1c1c1c] hover:bg-[#2e2e2e] text-[#ffffff]'
                            }`}
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                            <span className="text-[9px] px-1 bg-[#0a0a0a] text-[#d4d4d4] border border-[#383838]">
                              +{groupOverflow.hiddenCount}
                            </span>
                          </button>

                          {overflowDropdownGroupId === group.id && (
                            <div className="absolute right-0 top-full mt-0.5 w-48 bg-[#161616] border border-[#ffffff] shadow-2xl z-40 rounded-none py-1">
                              {group.panels.map((p) => {
                                const isCurrent = activePanel?.id === p.id;
                                return (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => activatePanelInGroup(group.id, p.id)}
                                    className={`w-full text-left px-2.5 py-1.5 text-[11px] font-mono flex items-center justify-between gap-2 rounded-none transition-colors ${
                                      isCurrent
                                        ? 'bg-[#2e2e2e] text-[#ffffff] font-bold'
                                        : 'text-[#d4d4d4] hover:bg-[#242424] hover:text-[#ffffff]'
                                    }`}
                                  >
                                    <span className="flex items-center gap-1.5 truncate">
                                      {getPanelIcon(p.id)}
                                      <span className="truncate">{p.title}</span>
                                    </span>
                                    {isCurrent && (
                                      <Check className="w-3 h-3 text-[#ffffff] shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Active Panel Body or Empty Group Drop Zone */}
                    <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
                      {activePanel ? (
                        renderPanelById(activePanel.id)
                      ) : (
                        <div className="p-3 bg-[#111111] text-center space-y-2">
                          <p className="text-[10px] font-mono text-[#a3a3a3]">
                            Empty Panel Group. Select a panel to dock here:
                          </p>
                          <div className="flex flex-wrap items-center justify-center gap-1">
                            {ALL_PANEL_IDS.map((pid) => (
                              <button
                                key={pid}
                                type="button"
                                onClick={() => movePanelToGroup(pid, group.id)}
                                className="px-2 py-0.5 text-[10px] font-mono bg-[#1c1c1c] hover:bg-[#2e2e2e] text-[#d4d4d4] hover:text-[#ffffff] border border-[#383838] rounded-none"
                              >
                                + {DEFAULT_TAB_TITLES[pid]}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>

              {/* INTERACTIVE HORIZONTAL SPLIT RESIZE SASH (Move split up or down by dragging or clicking ▲/▼) */}
              {hasSplitBelow && (
                <div
                  onMouseDown={(e) => handleStartSplitResize(e, groupIdx)}
                  onDoubleClick={handleEqualizeSplits}
                  title={`Split #${
                    groupIdx + 1
                  } of ${
                    panelGroups.length - 1
                  } — Drag up or down to resize split height, click ▲/▼ to step split, or double-click to equalize`}
                  className={`group/split relative h-3 my-0.5 shrink-0 cursor-row-resize flex items-center justify-between px-1.5 select-none transition-colors ${
                    isSplitDragging
                      ? 'bg-[#2e2e2e] border-y border-[#ffffff]'
                      : 'bg-[#141414] hover:bg-[#242424] border-y border-[#2e2e2e]'
                  }`}
                >
                  <span className="text-[8px] font-mono uppercase tracking-wider text-[#737373] group-hover/split:text-[#d4d4d4] pointer-events-none">
                    SPLIT {groupIdx + 1}/{panelGroups.length - 1}
                  </span>

                  {/* Center Tactile Grip Pill */}
                  <div className="flex flex-col items-center justify-center gap-[1.5px] pointer-events-none">
                    <div
                      className={`w-8 h-[1.5px] transition-colors ${
                        isSplitDragging
                          ? 'bg-[#ffffff]'
                          : 'bg-[#525252] group-hover/split:bg-[#ffffff]'
                      }`}
                    />
                    <div
                      className={`w-8 h-[1.5px] transition-colors ${
                        isSplitDragging
                          ? 'bg-[#ffffff]'
                          : 'bg-[#525252] group-hover/split:bg-[#ffffff]'
                      }`}
                    />
                  </div>

                  {/* Quick 1-Click Split Nudge Up / Down Controls */}
                  <div
                    className="flex items-center gap-0.5"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => handleNudgeSplit(groupIdx, 'up')}
                      title="Move Split Up (expand lower pane)"
                      className="px-1 py-0 text-[8px] font-mono leading-tight bg-[#1c1c1c] hover:bg-[#e5e5e5] text-[#a3a3a3] hover:text-[#0a0a0a] border border-[#383838]"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNudgeSplit(groupIdx, 'down')}
                      title="Move Split Down (expand upper pane)"
                      className="px-1 py-0 text-[8px] font-mono leading-tight bg-[#1c1c1c] hover:bg-[#e5e5e5] text-[#a3a3a3] hover:text-[#0a0a0a] border border-[#383838]"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* BOTTOM DROP ZONE: Only shown while actively dragging a panel tab and < MAX_PANEL_GROUPS */}
        {draggedPanel !== null && panelGroups.length < MAX_PANEL_GROUPS && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              setDragOverNewGroupZone(true);
            }}
            onDragLeave={() => setDragOverNewGroupZone(false)}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              movePanelToGroup(draggedPanel.panelId, 'NEW_GROUP');
              setDraggedPanel(null);
              setDragOverNewGroupZone(false);
              setDragOverGroupId(null);
              setDragOverTabId(null);
            }}
            className={`p-2 border border-dashed rounded-none text-center transition-colors ${
              dragOverNewGroupZone
                ? 'border-[#ffffff] bg-[#242424] text-[#ffffff]'
                : 'border-[#383838] bg-[#111111] text-[#a3a3a3]'
            }`}
          >
            <span className="text-[10px] font-mono uppercase tracking-wider">
              + Drop Tab Here for Split Panel Group
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};

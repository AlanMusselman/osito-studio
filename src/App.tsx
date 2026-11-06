import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sparkles,
  Code2,
  Rocket,
  Upload,
  RotateCcw,
  CheckCircle2,
  Wand2,
  MousePointer,
  MousePointerClick,
  Download,
  ChevronDown,
  Layers,
  Scissors,
  Eye,
  Save,
  Palette,
  Layout,
  Hexagon,
  Keyboard,
  Settings,
  Compass,
  Search,
  ShieldCheck,
} from 'lucide-react';
import {
  AutoShapeDefinition,
  AutoShapeObject,
  BitmapObject,
  CanvasObject,
  CanvasSlice,
  ComponentStateId,
  ConnectionPortId,
  GridAndSnapSettings,
  PixelSelection,
  ToolId,
  ToolOptions,
  VectorPathObject,
} from './types/editor';
import {
  createSmartConnectorObject,
  syncAllConnectors,
} from './engine/connectorEngine';
import { shiftHexBrightness, toHexColor } from './components/LiveColorPicker';
import {
  ImportModeFilter,
  getAcceptStringForImportMode,
  parseCustomAutoShapeJsFile,
  parseOsitoProjectBundle,
  parseSitemapOrWorkflowText,
  parseSvgToVectorObjects,
} from './engine/importEngine';
import {
  DEFAULT_AUTOSHAPES,
  convertAutoShapeToVectorPath,
  evaluateAutoShape,
  loadCustomAutoShapes,
  saveCustomAutoShapes,
} from './engine/autoshapes';
import {
  applyDestructivePixelEffect,
  commitFloatingPixels,
  createDemoBitmapCardDataUrl,
  createEmptyPixelSelection,
  deleteSelectedPixels,
  extractOrCutSelectedBitmapPixels,
  extractOrCutSelectedBitmapPixelsSync,
  floatSelectedPixels,
  invertPixelSelection,
  primeImageCache,
  rasterizeObjectToBitmap,
  selectAllPixels,
  smartRemoveBitmapBackground,
  vectorizeBitmapSelectionToBezier,
} from './engine/bitmapEngine';
import {
  createDefaultStarterSlices,
  exportFullReactTailwindAppZip,
  exportSlicesToMultiScaleZip,
  generateSmartStateVariants,
} from './engine/sliceZipExporter';
import { createStarterSceneObjects } from './engine/starterScene';
import { LeftToolDock } from './components/LeftToolDock';
import { PropertyInspector } from './components/PropertyInspector';
import { LayersAndHistoryPanel } from './components/LayersAndHistoryPanel';
import { PublishModal } from './components/PublishModal';
import { AutoShapeCodeStudio } from './components/AutoShapeCodeStudio';
import {
  CreationStudioModal,
  CreationStudioTab,
} from './components/CreationStudioModal';
import {
  ShortcutsModal,
  ShortcutItem,
} from './components/ShortcutsModal';
import {
  COLOR_THEME_PRESETS,
  ColorThemePalette,
  LogoGeneratorConfig,
  WEBSITE_LAYOUT_TEMPLATES,
  WebsiteLayoutTemplateId,
  applyColorThemeToCanvasObjects,
  createColorThemeSwatchCardObjects,
  generateLogoCanvasObjects,
  generateWebsiteLayoutObjects,
} from './engine/creationEngine';
import {
  DeepResearchDossier,
  auditCanvasDesignReadiness,
  autoPolishCanvasObjects,
  generateDeepResearchStrategyBoardObjects,
  runDeepMarketResearch,
} from './engine/deepResearchEngine';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { HybridCanvas, renderCanvasObjectToContext } from './components/HybridCanvas';

interface HistorySnapshot {
  objects: CanvasObject[];
  selectedIds: string[];
  pixelSelection: PixelSelection;
}

function clonePixelSelection(sel: PixelSelection): PixelSelection {
  if (!sel.active) return createEmptyPixelSelection();
  return {
    active: sel.active,
    targetBitmapId: sel.targetBitmapId,
    bounds: { ...sel.bounds },
    mask: sel.mask ? new Uint8Array(sel.mask) : null,
    maskWidth: sel.maskWidth,
    maskHeight: sel.maskHeight,
    outlinePolygons: sel.outlinePolygons.map((poly) => poly.map((pt) => ({ ...pt }))),
    floatingPixels: sel.floatingPixels ? { ...sel.floatingPixels } : null,
  };
}

export const App: React.FC = () => {
  // 1. Programmable JS AutoShapes Library (Built-In + User Custom JS)
  const [customAutoShapes, setCustomAutoShapes] = useState<AutoShapeDefinition[]>(() =>
    loadCustomAutoShapes()
  );
  const allAutoShapes = React.useMemo(
    () => [...DEFAULT_AUTOSHAPES, ...customAutoShapes],
    [customAutoShapes]
  );

  // 2. Hybrid Canvas Layer Stack + Undo/Redo History
  const [objects, setObjects] = useState<CanvasObject[]>(() => createStarterSceneObjects());
  const [historyPast, setHistoryPast] = useState<HistorySnapshot[]>([]);
  const [historyFuture, setHistoryFuture] = useState<HistorySnapshot[]>([]);

  // 3. Selection & Active Tool State
  const [selectedIds, setSelectedIds] = useState<string[]>(['obj-bitmap-hero']);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<ToolId>('pointer');
  const [pixelSelection, setPixelSelection] = useState<PixelSelection>(() =>
    createEmptyPixelSelection()
  );

  // Pre-warm synchronous bitmap image cache for all BitmapObjects so synchronous Cut/Copy/Paste works immediately
  useEffect(() => {
    objects.forEach((obj) => {
      if (obj.type === 'bitmap' && obj.imageDataUrl) {
        primeImageCache(obj.imageDataUrl);
      }
    });
  }, [objects]);

  // 4. Tool Options & Grid/Snap Settings (Vibrant Canvas Object Colors, Monochrome UI Chrome)
  const [toolOptions, setToolOptions] = useState<ToolOptions>({
    selectionOperation: 'new',
    wandTolerance: 32,
    wandContiguous: true,
    selectionFeather: 0,
    selectionAntiAlias: true,
    brushSize: 8,
    brushHardness: 85,
    brushOpacity: 100,
    primaryColor: '#06b6d4',
    secondaryColor: '#38bdf8',
    defaultStrokeWidth: 2,
    defaultPixelSnap: true,
    activeAutoShapeId: 'star',
  });

  const [slices, setSlices] = useState<CanvasSlice[]>(() => createDefaultStarterSlices());
  const [selectedSliceId, setSelectedSliceId] = useState<string | null>(null);

  const [gridSettings, setGridSettings] = useState<GridAndSnapSettings>({
    canvasWidth: 960,
    canvasHeight: 600,
    canvasBackground: 'slate',
    zoom: 1,
    panX: 0,
    panY: 0,
    showPixelGrid: true,
    showMajorGrid: false,
    gridSize: 16,
    snapToGrid: false,
    snapToPixel: true,
    snapToObjects: true,
    showRulers: true,
    showSlices: false,
    showToolHints: true,
    sliceToolMode: 'slice',
    canvasViewMode: 'design',
    guides: [],
  });

  // 5. Studio Modals & Menus
  const [isCodeStudioOpen, setIsCodeStudioOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPublishedSiteView, setIsPublishedSiteView] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('published') === '1' || params.get('mode') === 'published';
  });
  const [isCreationStudioOpen, setIsCreationStudioOpen] = useState(false);
  const [creationStudioTab, setCreationStudioTab] = useState<CreationStudioTab>('logo');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [initialResearchQuery, setInitialResearchQuery] = useState<string>('');
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  const [importModeFilter, setImportModeFilter] = useState<ImportModeFilter>('all');
  const [isSaveMenuOpen, setIsSaveMenuOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isPresetMenuOpen, setIsPresetMenuOpen] = useState(false);
  const [activeShowcaseIndex, setActiveShowcaseIndex] = useState<number>(0);
  const [isDemoTourPlaying, setIsDemoTourPlaying] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const importMenuRef = useRef<HTMLDivElement | null>(null);
  const saveMenuRef = useRef<HTMLDivElement | null>(null);
  const createMenuRef = useRef<HTMLDivElement | null>(null);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);
  const settingsMenuRef = useRef<HTMLDivElement | null>(null);
  const presetMenuRef = useRef<HTMLDivElement | null>(null);

  // Fireworks MX Clipboard & Temporary Spacebar Hand-Pan State
  const clipboardObjectsRef = useRef<CanvasObject[]>([]);
  const clipboardSliceRef = useRef<CanvasSlice | null>(null);
  const pasteCascadeStepRef = useRef<number>(0);
  const tempHandPrevToolRef = useRef<ToolId | null>(null);

  const closeAllTopMenus = useCallback(() => {
    setIsSettingsMenuOpen(false);
    setIsImportMenuOpen(false);
    setIsSaveMenuOpen(false);
    setIsCreateMenuOpen(false);
    setIsExportMenuOpen(false);
    setIsPresetMenuOpen(false);
  }, []);

  const toggleTopMenu = useCallback(
    (menu: 'settings' | 'import' | 'save' | 'create' | 'export' | 'preset') => {
      setIsSettingsMenuOpen((prev) => (menu === 'settings' ? !prev : false));
      setIsImportMenuOpen((prev) => (menu === 'import' ? !prev : false));
      setIsSaveMenuOpen((prev) => (menu === 'save' ? !prev : false));
      setIsCreateMenuOpen((prev) => (menu === 'create' ? !prev : false));
      setIsExportMenuOpen((prev) => (menu === 'export' ? !prev : false));
      setIsPresetMenuOpen((prev) => (menu === 'preset' ? !prev : false));
    },
    []
  );

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (importMenuRef.current && !importMenuRef.current.contains(e.target as Node)) {
        setIsImportMenuOpen(false);
      }
      if (saveMenuRef.current && !saveMenuRef.current.contains(e.target as Node)) {
        setIsSaveMenuOpen(false);
      }
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
        setIsCreateMenuOpen(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(e.target as Node)) {
        setIsSettingsMenuOpen(false);
      }
      if (presetMenuRef.current && !presetMenuRef.current.contains(e.target as Node)) {
        setIsPresetMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const triggerFileImportDialog = useCallback(
    (mode: ImportModeFilter) => {
      setImportModeFilter(mode);
      closeAllTopMenus();
      window.setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.accept = getAcceptStringForImportMode(mode);
          fileInputRef.current.click();
        }
      }, 0);
    },
    [closeAllTopMenus]
  );

  const showToast = useCallback((msg: string) => {
    setStatusToast(msg);
    window.setTimeout(() => {
      setStatusToast((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  // Record Undo History Snapshot (captures canvas objects, active selection IDs, and pixelSelection state)
  const recordHistorySnapshot = useCallback(() => {
    const snapshot: HistorySnapshot = {
      objects: JSON.parse(JSON.stringify(objects)),
      selectedIds: [...selectedIds],
      pixelSelection: clonePixelSelection(pixelSelection),
    };
    setHistoryPast((prev) => [...prev.slice(-29), snapshot]);
    setHistoryFuture([]);
  }, [objects, selectedIds, pixelSelection]);

  const handleUndo = useCallback(() => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    const currentSnapshot: HistorySnapshot = {
      objects: JSON.parse(JSON.stringify(objects)),
      selectedIds: [...selectedIds],
      pixelSelection: clonePixelSelection(pixelSelection),
    };
    setHistoryFuture((f) => [currentSnapshot, ...f]);
    setHistoryPast((p) => p.slice(0, -1));
    previous.objects.forEach((obj) => {
      if (obj.type === 'bitmap' && obj.imageDataUrl) {
        primeImageCache(obj.imageDataUrl);
      }
    });
    setObjects(previous.objects);
    setSelectedIds(
      previous.selectedIds.filter((id) => previous.objects.some((o) => o.id === id))
    );
    const restoredSel = clonePixelSelection(previous.pixelSelection);
    if (
      restoredSel.active &&
      restoredSel.targetBitmapId &&
      !previous.objects.some((o) => o.id === restoredSel.targetBitmapId)
    ) {
      setPixelSelection(createEmptyPixelSelection());
    } else {
      setPixelSelection(restoredSel);
    }
    showToast('Undo applied');
  }, [historyPast, objects, selectedIds, pixelSelection, showToast]);

  const handleRedo = useCallback(() => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    const currentSnapshot: HistorySnapshot = {
      objects: JSON.parse(JSON.stringify(objects)),
      selectedIds: [...selectedIds],
      pixelSelection: clonePixelSelection(pixelSelection),
    };
    setHistoryPast((p) => [...p, currentSnapshot]);
    setHistoryFuture((f) => f.slice(1));
    next.objects.forEach((obj) => {
      if (obj.type === 'bitmap' && obj.imageDataUrl) {
        primeImageCache(obj.imageDataUrl);
      }
    });
    setObjects(next.objects);
    setSelectedIds(next.selectedIds.filter((id) => next.objects.some((o) => o.id === id)));
    const restoredSel = clonePixelSelection(next.pixelSelection);
    if (
      restoredSel.active &&
      restoredSel.targetBitmapId &&
      !next.objects.some((o) => o.id === restoredSel.targetBitmapId)
    ) {
      setPixelSelection(createEmptyPixelSelection());
    } else {
      setPixelSelection(restoredSel);
    }
    showToast('Redo applied');
  }, [historyFuture, objects, selectedIds, pixelSelection, showToast]);

  // Object CRUD Helpers (Automatically re-routes Lucidchart Smart Connectors when any object moves/resizes)
  const handleUpdateObject = useCallback(
    (id: string, patch: Partial<CanvasObject>, recordHistory = true) => {
      if (recordHistory) {
        recordHistorySnapshot();
      }
      setObjects((prev) => {
        const updated = prev.map((obj) =>
          obj.id === id ? ({ ...obj, ...patch } as CanvasObject) : obj
        );
        return syncAllConnectors(updated);
      });
    },
    [recordHistorySnapshot]
  );

  const handleAddObject = useCallback(
    (newObj: CanvasObject) => {
      recordHistorySnapshot();
      setObjects((prev) => syncAllConnectors([...prev, newObj]));
    },
    [recordHistorySnapshot]
  );

  // Lucidchart-Style Smart Connector & Auto-Spawn Sitemap / Workflow Node Handlers
  const handleConnectObjects = useCallback(
    (
      fromId: string,
      fromPort: ConnectionPortId,
      toId: string,
      toPort: ConnectionPortId
    ) => {
      const fromObj = objects.find((o) => o.id === fromId);
      const toObj = objects.find((o) => o.id === toId);
      if (!fromObj || !toObj || fromId === toId) return;

      recordHistorySnapshot();
      const connector = createSmartConnectorObject(fromObj, fromPort, toObj, toPort, {
        routing: 'elbow',
        stroke: toolOptions.secondaryColor || '#38bdf8',
        strokeWidth: 2,
      });
      setObjects((prev) => [...prev, connector]);
      setSelectedIds([connector.id]);
      showToast(
        `Connected "${fromObj.name}" (${fromPort.toUpperCase()}) → "${toObj.name}" (${toPort.toUpperCase()})`
      );
    },
    [objects, toolOptions.secondaryColor, recordHistorySnapshot, showToast]
  );

  const handleSpawnConnectedNode = useCallback(
    (
      fromId: string,
      fromPort: ConnectionPortId,
      canvasX: number,
      canvasY: number
    ) => {
      const fromObj = objects.find((o) => o.id === fromId);
      if (!fromObj) return;

      recordHistorySnapshot();

      const isSourceAutoShape = fromObj.type === 'autoshape';
      const defaultSitemapDef =
        allAutoShapes.find(
          (d) =>
            d.id ===
            (isSourceAutoShape
              ? (fromObj as AutoShapeObject).shapeDefId
              : 'sitemap-node')
        ) ||
        allAutoShapes.find((d) => d.id === 'sitemap-node') ||
        allAutoShapes[0];

      const nw = Math.min(200, Math.max(130, Math.round(fromObj.width)));
      const nh = Math.min(115, Math.max(76, Math.round(fromObj.height)));
      let nx = Math.round(canvasX - nw / 2);
      let ny = Math.round(canvasY - nh / 2);
      let toPort: ConnectionPortId = 'w';

      if (fromPort === 'e') {
        nx = Math.round(canvasX);
        toPort = 'w';
      } else if (fromPort === 'w') {
        nx = Math.round(canvasX - nw);
        toPort = 'e';
      } else if (fromPort === 's') {
        ny = Math.round(canvasY);
        toPort = 'n';
      } else if (fromPort === 'n') {
        ny = Math.round(canvasY - nh);
        toPort = 's';
      }

      const spawnedNode: AutoShapeObject = {
        id: `autoshape-node-${Date.now()}`,
        name: `${defaultSitemapDef.name} ${objects.length + 1}`,
        type: 'autoshape',
        shapeDefId: defaultSitemapDef.id,
        visible: true,
        locked: false,
        x: Math.max(8, nx),
        y: Math.max(8, ny),
        width: nw,
        height: nh,
        rotation: 0,
        opacity: 1,
        blendMode: 'source-over',
        fill: fromObj.fill && fromObj.fill !== 'none' ? fromObj.fill : toolOptions.primaryColor,
        fillType:
          fromObj.fillType && fromObj.fillType !== 'none'
            ? fromObj.fillType
            : 'linear-gradient',
        fillGradientEnd: fromObj.fillGradientEnd || '#6366f1',
        stroke:
          fromObj.stroke && fromObj.stroke !== 'none'
            ? fromObj.stroke
            : toolOptions.secondaryColor,
        strokeWidth: Math.max(2, fromObj.strokeWidth || 2),
        strokeAlign: 'center',
        pixelSnap: true,
        shadow: {
          enabled: true,
          color: 'rgba(0, 0, 0, 0.45)',
          blur: 12,
          offsetX: 0,
          offsetY: 4,
        },
        params: isSourceAutoShape
          ? { ...(fromObj as AutoShapeObject).params }
          : { ...defaultSitemapDef.defaultParams },
      };

      const connector = createSmartConnectorObject(fromObj, fromPort, spawnedNode, toPort, {
        routing: 'elbow',
        stroke:
          fromObj.stroke && fromObj.stroke !== 'none'
            ? fromObj.stroke
            : toolOptions.secondaryColor || '#38bdf8',
        strokeWidth: 2,
      });

      setObjects((prev) => [...prev, spawnedNode, connector]);
      setSelectedIds([spawnedNode.id]);
      setActiveTool('pointer');
      showToast(
        `Auto-spawned & linked "${spawnedNode.name}" — move either node to see live auto-routing!`
      );
    },
    [objects, allAutoShapes, toolOptions.primaryColor, toolOptions.secondaryColor, recordHistorySnapshot, showToast]
  );

  const handleBranchConnectedNode = useCallback(
    (sourceId: string, direction: 'e' | 's') => {
      const sourceObj = objects.find((o) => o.id === sourceId);
      if (!sourceObj) return;
      const targetX =
        direction === 'e'
          ? sourceObj.x + sourceObj.width + 92
          : sourceObj.x + sourceObj.width / 2;
      const targetY =
        direction === 's'
          ? sourceObj.y + sourceObj.height + 76
          : sourceObj.y + sourceObj.height / 2;
      handleSpawnConnectedNode(sourceId, direction, targetX, targetY);
    },
    [objects, handleSpawnConnectedNode]
  );

  // Commit any floating pixels and remove bitmap selections when exiting bitmap mode
  const handleSelectTool = useCallback(
    async (nextTool: ToolId) => {
      const bitmapModeTools: ToolId[] = [
        'marquee-rect',
        'marquee-oval',
        'lasso',
        'magic-wand',
        'brush',
        'pencil',
        'eraser',
        'bucket',
        'eyedropper',
      ];
      const isExitingBitmapMode = !bitmapModeTools.includes(nextTool);

      if (pixelSelection.active) {
        if (pixelSelection.floatingPixels && pixelSelection.targetBitmapId) {
          const targetBmp = objects.find(
            (o) => o.id === pixelSelection.targetBitmapId && o.type === 'bitmap'
          ) as BitmapObject | undefined;
          if (targetBmp) {
            const committed = await commitFloatingPixels(targetBmp, pixelSelection);
            handleUpdateObject(targetBmp.id, committed.updatedBitmap, false);
            if (isExitingBitmapMode) {
              setPixelSelection(createEmptyPixelSelection());
            } else {
              setPixelSelection(committed.updatedSelection);
            }
          } else if (isExitingBitmapMode) {
            setPixelSelection(createEmptyPixelSelection());
          }
        } else if (isExitingBitmapMode) {
          setPixelSelection(createEmptyPixelSelection());
        }
      }
      setActiveTool(nextTool);
    },
    [pixelSelection, objects, handleUpdateObject]
  );

  // Clear bitmap selection if user selects a non-bitmap object or deselects bitmap layer
  const handleSelectObjects = useCallback(
    async (nextIds: string[]) => {
      setSelectedIds(nextIds);
      if (nextIds.length > 0) {
        const primarySelected = objects.find(
          (o) => o.id === nextIds[0] && o.type !== 'bitmap'
        );
        if (primarySelected) {
          setToolOptions((prev) => ({
            ...prev,
            primaryColor:
              primarySelected.fill && primarySelected.fill !== 'none'
                ? toHexColor(primarySelected.fill, prev.primaryColor)
                : prev.primaryColor,
            secondaryColor:
              primarySelected.stroke && primarySelected.stroke !== 'none'
                ? toHexColor(primarySelected.stroke, prev.secondaryColor)
                : prev.secondaryColor,
          }));
        }
      }
      const hasBitmapSelected = objects.some(
        (o) => nextIds.includes(o.id) && o.type === 'bitmap'
      );
      if (pixelSelection.active && !hasBitmapSelected) {
        if (pixelSelection.floatingPixels && pixelSelection.targetBitmapId) {
          const targetBmp = objects.find(
            (o) => o.id === pixelSelection.targetBitmapId && o.type === 'bitmap'
          ) as BitmapObject | undefined;
          if (targetBmp) {
            const committed = await commitFloatingPixels(targetBmp, pixelSelection);
            handleUpdateObject(targetBmp.id, committed.updatedBitmap, false);
          }
        }
        setPixelSelection(createEmptyPixelSelection());
      }
    },
    [objects, pixelSelection, handleUpdateObject]
  );

  // Live Color Scrubbing from Left Tool Dock -> updates selected AutoShapes/Vectors/Text on canvas immediately
  const handleLiveDockColorChange = useCallback(
    (role: 'primary' | 'secondary', hex: string, recordHistory = false) => {
      if (selectedIds.length === 0) return;
      if (recordHistory) {
        recordHistorySnapshot();
      }
      setObjects((prev) => {
        const updated = prev.map((obj) => {
          if (!selectedIds.includes(obj.id) || obj.type === 'bitmap') return obj;
          const activeState = obj.activeState || 'default';
          if (role === 'primary') {
            const nextFillType = obj.fillType === 'none' ? 'solid' : obj.fillType;
            const nextGradEnd =
              nextFillType === 'linear-gradient' || nextFillType === 'radial-gradient'
                ? shiftHexBrightness(hex, -26)
                : obj.fillGradientEnd;
            const nextVariants = obj.stateVariants
              ? {
                  ...obj.stateVariants,
                  [activeState]: {
                    ...(obj.stateVariants[activeState] || {}),
                    fill: hex,
                    fillGradientEnd: nextGradEnd,
                  },
                }
              : undefined;
            return {
              ...obj,
              fill: hex,
              fillType: nextFillType,
              fillGradientEnd: nextGradEnd,
              ...(nextVariants ? { stateVariants: nextVariants } : {}),
            } as CanvasObject;
          } else {
            const nextStrokeW =
              !obj.strokeWidth || obj.strokeWidth <= 0 ? 2 : obj.strokeWidth;
            const nextVariants = obj.stateVariants
              ? {
                  ...obj.stateVariants,
                  [activeState]: {
                    ...(obj.stateVariants[activeState] || {}),
                    stroke: hex,
                    strokeWidth: nextStrokeW,
                  },
                }
              : undefined;
            return {
              ...obj,
              stroke: hex,
              strokeWidth: nextStrokeW,
              ...(nextVariants ? { stateVariants: nextVariants } : {}),
            } as CanvasObject;
          }
        });
        return syncAllConnectors(updated);
      });
    },
    [selectedIds, recordHistorySnapshot]
  );

  // Insert a JS AutoShape directly onto the canvas (with non-overlapping placement for menus & containers)
  const handleInsertAutoShape = useCallback(
    (shapeDefId: string) => {
      const def = allAutoShapes.find((d) => d.id === shapeDefId) || allAutoShapes[0];
      if (!def) return;
      recordHistorySnapshot();

      const isNavbarOrMegaMenu =
        def.id === 'layout-sticky-navbar' || def.id === 'layout-mega-menu';
      const defaultW = isNavbarOrMegaMenu
        ? Math.min(760, Math.max(320, gridSettings.canvasWidth - 48))
        : 180;
      const defaultH =
        def.id === 'layout-sticky-navbar'
          ? 56
          : def.id === 'layout-mega-menu'
          ? 180
          : 140;

      const offset = (objects.length % 5) * 16;
      let spawnX = isNavbarOrMegaMenu
        ? Math.round((gridSettings.canvasWidth - defaultW) / 2)
        : Math.round(gridSettings.canvasWidth / 2 - defaultW / 2 + offset);
      let spawnY = isNavbarOrMegaMenu
        ? 18
        : Math.round(gridSettings.canvasHeight / 2 - defaultH / 2 + offset);

      // Avoid overlapping any top navbar / mega-menu / dropdown container when spawning a normal shape
      if (!isNavbarOrMegaMenu) {
        const topMenus = objects.filter(
          (o) =>
            o.visible &&
            o.type === 'autoshape' &&
            ((o as AutoShapeObject).shapeDefId === 'layout-sticky-navbar' ||
              (o as AutoShapeObject).shapeDefId === 'layout-mega-menu' ||
              (o as AutoShapeObject).shapeDefId === 'ui-dropdown-select')
        );
        for (const tm of topMenus) {
          if (
            spawnX < tm.x + tm.width &&
            spawnX + defaultW > tm.x &&
            spawnY < tm.y + tm.height + 12 &&
            spawnY + defaultH > tm.y
          ) {
            spawnY = Math.min(
              Math.max(18, gridSettings.canvasHeight - defaultH - 16),
              Math.round(tm.y + tm.height + 16)
            );
          }
        }
      }

      const newShape: AutoShapeObject = {
        id: `autoshape-${Date.now()}`,
        name: `${def.name} (JS)`,
        type: 'autoshape',
        shapeDefId: def.id,
        visible: true,
        locked: false,
        x: spawnX,
        y: spawnY,
        width: defaultW,
        height: defaultH,
        rotation: 0,
        opacity: 1,
        blendMode: 'source-over',
        fill: toolOptions.primaryColor,
        fillType: 'linear-gradient',
        fillGradientEnd: shiftHexBrightness(toolOptions.primaryColor, -26),
        stroke: toolOptions.secondaryColor,
        strokeWidth: 2,
        strokeAlign: 'center',
        pixelSnap: true,
        shadow: {
          enabled: true,
          color: 'rgba(0, 0, 0, 0.45)',
          blur: 14,
          offsetX: 0,
          offsetY: 4,
        },
        params: { ...def.defaultParams },
      };

      setObjects((prev) => {
        if (!isNavbarOrMegaMenu) {
          return [...prev, newShape];
        }
        // If inserting a top navbar or mega-menu, push down any containers that would be overlapped by it
        const menuBottom = spawnY + defaultH + 14;
        const overlapped = prev.filter(
          (o) => o.visible && o.y < menuBottom && o.y + o.height > spawnY
        );
        if (overlapped.length === 0) {
          return [...prev, newShape];
        }
        const minTop = Math.min(...overlapped.map((o) => o.y));
        const shiftDown = Math.max(0, Math.round(menuBottom - minTop));
        const shifted = prev.map((o) =>
          o.visible && o.y >= minTop - 2 ? { ...o, y: o.y + shiftDown } : o
        );
        return [...shifted, newShape];
      });
      setSelectedIds([newShape.id]);
      setToolOptions((prev) => ({ ...prev, activeAutoShapeId: def.id }));
      setActiveTool('pointer');
      showToast(`Added "${def.name}" — drag its yellow ◆ handles or edit its JS code!`);
    },
    [allAutoShapes, objects, gridSettings, toolOptions, recordHistorySnapshot, showToast]
  );

  // Convert JS AutoShape to Editable Cubic Bezier Vector Path
  const handleConvertAutoShapeToPaths = useCallback(
    (id: string) => {
      const target = objects.find((o) => o.id === id && o.type === 'autoshape') as
        | AutoShapeObject
        | undefined;
      if (!target) return;
      const def = allAutoShapes.find((d) => d.id === target.shapeDefId) || allAutoShapes[0];
      if (!def) return;
      recordHistorySnapshot();
      const vecPath = convertAutoShapeToVectorPath(target, def);
      setObjects((prev) => prev.map((o) => (o.id === id ? vecPath : o)));
      setActiveTool('subselect');
      showToast('Converted AutoShape to editable Cubic Bezier Vector Path (Subselect Tool A active)');
    },
    [objects, allAutoShapes, recordHistorySnapshot, showToast]
  );

  // Rasterize any Vector / AutoShape / Text object into a Bitmap layer on the same canvas
  const handleRasterizeObject = useCallback(
    (id: string) => {
      const target = objects.find((o) => o.id === id);
      if (!target || target.type === 'bitmap') return;
      recordHistorySnapshot();
      const bmp = rasterizeObjectToBitmap(target, (ctx, obj) => {
        const localClone = { ...obj, x: 0, y: 0 };
        renderCanvasObjectToContext(ctx, localClone, allAutoShapes);
      });
      setObjects((prev) => prev.map((o) => (o.id === id ? bmp : o)));
      showToast(`Rasterized "${target.name}" into pixel-editable Bitmap layer`);
    },
    [objects, allAutoShapes, recordHistorySnapshot, showToast]
  );

  // Add a new Demo / Blank Bitmap Layer
  const handleAddBlankBitmapLayer = useCallback(() => {
    recordHistorySnapshot();
    const newBmp: BitmapObject = {
      id: `bmp-${Date.now()}`,
      name: `Bitmap Layer ${objects.filter((o) => o.type === 'bitmap').length + 1}`,
      type: 'bitmap',
      visible: true,
      locked: false,
      x: 120,
      y: 96,
      width: 320,
      height: 200,
      pixelWidth: 320,
      pixelHeight: 200,
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
      imageDataUrl: createDemoBitmapCardDataUrl(320, 200),
      filters: { brightness: 0, contrast: 0, blur: 0, hueRotate: 0, invert: false, pixelate: 1 },
    };
    setObjects((prev) => [...prev, newBmp]);
    setSelectedIds([newBmp.id]);
    showToast('Added new Bitmap Pixel Layer (try Magic Wand W or Shift+Scale handles!)');
  }, [objects, recordHistorySnapshot, showToast]);

  // Universal Multi-Format File Importer (PNG/JPG/WebP/AVIF/GIF/BMP/ICO, SVG Vector/Bitmap, .osito.json, .js AutoShape, .csv/.txt/.md Sitemap)
  const importRasterDataUrlAsBitmap = useCallback(
    (dataUrl: string, fileName: string, offsetStep = 0) => {
      primeImageCache(dataUrl);
      const img = new Image();
      img.onload = () => {
        recordHistorySnapshot();
        const w = Math.min(img.naturalWidth || 320, gridSettings.canvasWidth - 64);
        const h = Math.round(
          w * ((img.naturalHeight || 200) / Math.max(1, img.naturalWidth || 320))
        );
        const newBmp: BitmapObject = {
          id: `bmp-import-${Date.now()}-${offsetStep}`,
          name: fileName.replace(/\.[^.]+$/, '') || 'Imported Bitmap',
          type: 'bitmap',
          visible: true,
          locked: false,
          x: Math.round((gridSettings.canvasWidth - w) / 2 + offsetStep * 18),
          y: Math.round((gridSettings.canvasHeight - h) / 2 + offsetStep * 18),
          width: w,
          height: h,
          pixelWidth: w,
          pixelHeight: h,
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
          imageDataUrl: dataUrl,
          filters: {
            brightness: 0,
            contrast: 0,
            blur: 0,
            hueRotate: 0,
            invert: false,
            pixelate: 1,
          },
        };
        setObjects((prev) => [...prev, newBmp]);
        setSelectedIds([newBmp.id]);
        showToast(`Imported bitmap "${fileName}" (${w}×${h}px) onto hybrid canvas`);
      };
      img.src = dataUrl;
    },
    [gridSettings.canvasWidth, gridSettings.canvasHeight, recordHistorySnapshot, showToast]
  );

  const handleImportBitmapFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(e.target.files || []);
    if (fileList.length === 0) return;

    fileList.forEach((file, idx) => {
      const lowerName = file.name.toLowerCase();
      const baseName = file.name.replace(/\.[^.]+$/, '') || 'Imported Asset';

      // 1. SVG File (.svg): Editable Cubic Bezier Vector Paths OR Flattened Bitmap Layer
      if (lowerName.endsWith('.svg') || file.type === 'image/svg+xml') {
        if (importModeFilter === 'svg-bitmap') {
          const reader = new FileReader();
          reader.onload = () => {
            importRasterDataUrlAsBitmap(String(reader.result || ''), file.name, idx);
          };
          reader.readAsDataURL(file);
        } else {
          const textReader = new FileReader();
          textReader.onload = () => {
            const svgText = String(textReader.result || '');
            const vecObjs = parseSvgToVectorObjects(
              svgText,
              baseName,
              gridSettings.canvasWidth,
              gridSettings.canvasHeight
            );
            if (vecObjs.length > 0) {
              recordHistorySnapshot();
              setObjects((prev) => [...prev, ...vecObjs]);
              setSelectedIds(vecObjs.map((v) => v.id));
              showToast(
                `Imported "${file.name}" as ${vecObjs.length} editable Cubic Bezier Vector Path(s)!`
              );
            } else {
              // Fallback if SVG contains only embedded raster <image>
              const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgText)}`;
              importRasterDataUrlAsBitmap(dataUrl, file.name, idx);
            }
          };
          textReader.readAsText(file);
        }
        return;
      }

      // 2. Osito Project Bundle (.osito.json / .json) or Custom AutoShape JSON
      if (lowerName.endsWith('.json') || file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = () => {
          const rawText = String(reader.result || '');
          const bundle = parseOsitoProjectBundle(rawText);
          if (bundle && bundle.objects) {
            recordHistorySnapshot();
            if (bundle.gridSettings) {
              setGridSettings((prev) => ({ ...prev, ...bundle.gridSettings }));
            }
            if (bundle.customAutoShapes && bundle.customAutoShapes.length > 0) {
              const merged = [...customAutoShapes, ...bundle.customAutoShapes];
              setCustomAutoShapes(merged);
              saveCustomAutoShapes(merged);
            }
            if (bundle.slices) {
              setSlices(bundle.slices);
            }
            setObjects(syncAllConnectors(bundle.objects));
            setSelectedIds(bundle.objects[0] ? [bundle.objects[0].id] : []);
            showToast(
              `Restored Osito Project "${file.name}" (${bundle.objects.length} layers)!`
            );
            return;
          }

          const customShape = parseCustomAutoShapeJsFile(rawText, file.name);
          if (customShape) {
            const updatedCustom = [
              ...customAutoShapes.filter((c) => c.id !== customShape.id),
              customShape,
            ];
            setCustomAutoShapes(updatedCustom);
            saveCustomAutoShapes(updatedCustom);
            handleInsertAutoShape(customShape.id);
            showToast(`Imported Custom JS AutoShape "${customShape.name}"!`);
            return;
          }

          showToast(`Could not parse JSON file "${file.name}"`);
        };
        reader.readAsText(file);
        return;
      }

      // 3. Programmable JS AutoShape Script (.autoshape.js / .js)
      if (lowerName.endsWith('.js')) {
        const reader = new FileReader();
        reader.onload = () => {
          const rawText = String(reader.result || '');
          const customShape = parseCustomAutoShapeJsFile(rawText, file.name);
          if (customShape) {
            const updatedCustom = [
              ...customAutoShapes.filter((c) => c.id !== customShape.id),
              customShape,
            ];
            setCustomAutoShapes(updatedCustom);
            saveCustomAutoShapes(updatedCustom);
            handleInsertAutoShape(customShape.id);
            showToast(`Loaded JS AutoShape Plugin "${customShape.name}"!`);
          } else {
            showToast(`Invalid JS AutoShape script in "${file.name}"`);
          }
        };
        reader.readAsText(file);
        return;
      }

      // 4. Sitemap / Workflow Diagram Data (.csv / .txt / .md)
      if (
        lowerName.endsWith('.csv') ||
        lowerName.endsWith('.txt') ||
        lowerName.endsWith('.md')
      ) {
        const reader = new FileReader();
        reader.onload = () => {
          const rawText = String(reader.result || '');
          const sitemapDef =
            allAutoShapes.find((d) => d.id === 'sitemap-node') || allAutoShapes[0];
          const generated = parseSitemapOrWorkflowText(
            rawText,
            file.name,
            sitemapDef,
            toolOptions.primaryColor,
            toolOptions.secondaryColor
          );
          if (generated.length > 0) {
            recordHistorySnapshot();
            setObjects((prev) => syncAllConnectors([...prev, ...generated]));
            setSelectedIds(generated.map((g) => g.id));
            showToast(
              `Generated Sitemap / Workflow diagram from "${file.name}" (${generated.length} nodes & connectors)!`
            );
          } else {
            showToast(`No sitemap or workflow nodes found in "${file.name}"`);
          }
        };
        reader.readAsText(file);
        return;
      }

      // 5. Default: Raster & Web Images (.png, .jpg, .jpeg, .webp, .avif, .gif, .bmp, .ico)
      const reader = new FileReader();
      reader.onload = () => {
        importRasterDataUrlAsBitmap(String(reader.result || ''), file.name, idx);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // Bitmap Selection Actions
  const findTargetBitmap = useCallback((): BitmapObject | null => {
    const visibleBitmaps = objects.filter(
      (o): o is BitmapObject => o.type === 'bitmap' && o.visible && !o.locked
    );

    if (pixelSelection.active) {
      const b = pixelSelection.bounds;
      const overlapsSelection = (bmp: BitmapObject) =>
        bmp.x < b.x + Math.max(1, b.width) &&
        bmp.x + bmp.width > b.x &&
        bmp.y < b.y + Math.max(1, b.height) &&
        bmp.y + bmp.height > b.y;

      if (pixelSelection.targetBitmapId) {
        const targetBmp = visibleBitmaps.find((o) => o.id === pixelSelection.targetBitmapId);
        if (targetBmp && overlapsSelection(targetBmp)) return targetBmp;
      }

      for (const id of selectedIds) {
        const selBmp = visibleBitmaps.find((o) => o.id === id);
        if (selBmp && overlapsSelection(selBmp)) return selBmp;
      }

      for (let i = visibleBitmaps.length - 1; i >= 0; i--) {
        if (overlapsSelection(visibleBitmaps[i])) return visibleBitmaps[i];
      }

      if (pixelSelection.targetBitmapId) {
        const targetBmp = visibleBitmaps.find((o) => o.id === pixelSelection.targetBitmapId);
        if (targetBmp) return targetBmp;
      }
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
    return null;
  }, [selectedIds, objects, pixelSelection.active, pixelSelection.bounds, pixelSelection.targetBitmapId]);

  const handleDeleteSelectedPixels = useCallback(async () => {
    const bmp = findTargetBitmap();
    if (!bmp || !pixelSelection.active) return;
    recordHistorySnapshot();
    if (pixelSelection.floatingPixels) {
      setPixelSelection(createEmptyPixelSelection());
      showToast('Deleted floating pixel selection');
      return;
    }
    const updated = await deleteSelectedPixels(bmp, pixelSelection);
    handleUpdateObject(bmp.id, updated, false);
    showToast('Cleared pixels inside active Marching Ants selection');
  }, [findTargetBitmap, pixelSelection, recordHistorySnapshot, handleUpdateObject, showToast]);

  const handleFloatSelectedPixels = useCallback(async () => {
    const bmp = findTargetBitmap();
    if (!bmp || !pixelSelection.active) return;
    recordHistorySnapshot();
    const floated = await floatSelectedPixels(bmp, pixelSelection, false);
    handleUpdateObject(bmp.id, floated.updatedBitmap, false);
    setPixelSelection(floated.updatedSelection);
    if (
      activeTool !== 'marquee-rect' &&
      activeTool !== 'marquee-oval' &&
      activeTool !== 'lasso' &&
      activeTool !== 'magic-wand'
    ) {
      setActiveTool('marquee-rect');
    }
    showToast('Floated selected pixels — drag inside marquee to reposition!');
  }, [findTargetBitmap, pixelSelection, activeTool, recordHistorySnapshot, handleUpdateObject, showToast]);

  const handleApplyPixelEffect = useCallback(
    async (
      effect:
        | 'invert'
        | 'grayscale'
        | 'sepia'
        | 'brighten'
        | 'contrast'
        | 'pixelate-4px'
        | 'flip-h'
        | 'flip-v'
    ) => {
      let bmp = findTargetBitmap();
      if (!bmp) return;
      recordHistorySnapshot();
      let activeSel = pixelSelection;
      if (activeSel.active && activeSel.floatingPixels) {
        const committed = await commitFloatingPixels(bmp, activeSel);
        bmp = committed.updatedBitmap;
        activeSel = committed.updatedSelection;
        setPixelSelection(activeSel);
      }
      const updated = await applyDestructivePixelEffect(bmp, effect, activeSel);
      handleUpdateObject(bmp.id, updated, false);
      showToast(
        `Applied "${effect}" to ${activeSel.active ? 'selected marquee pixels' : bmp.name}`
      );
    },
    [findTargetBitmap, pixelSelection, recordHistorySnapshot, handleUpdateObject, showToast]
  );

  // Layer Ordering & Drag-and-Drop Reordering
  const handleReorderObject = useCallback(
    (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
      recordHistorySnapshot();
      setObjects((prev) => {
        const idx = prev.findIndex((o) => o.id === id);
        if (idx === -1) return prev;
        const copy = [...prev];
        const [item] = copy.splice(idx, 1);
        if (direction === 'top') copy.push(item);
        else if (direction === 'bottom') copy.unshift(item);
        else if (direction === 'up') copy.splice(Math.min(copy.length, idx + 1), 0, item);
        else if (direction === 'down') copy.splice(Math.max(0, idx - 1), 0, item);
        return copy;
      });
    },
    [recordHistorySnapshot]
  );

  // Drag-and-Drop Layer Move Handler
  const handleMoveLayer = useCallback(
    (draggedId: string, targetId: string, placement: 'above' | 'below') => {
      if (draggedId === targetId) return;
      recordHistorySnapshot();
      setObjects((prev) => {
        const fromIdx = prev.findIndex((o) => o.id === draggedId);
        if (fromIdx === -1) return prev;
        const next = [...prev];
        const [draggedItem] = next.splice(fromIdx, 1);
        const targetIdx = next.findIndex((o) => o.id === targetId);
        if (targetIdx === -1) {
          next.push(draggedItem);
          return next;
        }
        const insertIdx = placement === 'above' ? targetIdx + 1 : targetIdx;
        next.splice(insertIdx, 0, draggedItem);
        return next;
      });
      showToast('Reordered layer via drag and drop');
    },
    [recordHistorySnapshot, showToast]
  );

  const handleDuplicateObject = useCallback(
    (id: string) => {
      const orig = objects.find((o) => o.id === id);
      if (!orig) return;
      recordHistorySnapshot();
      const clone: CanvasObject = {
        ...JSON.parse(JSON.stringify(orig)),
        id: `${orig.type}-${Date.now()}`,
        name: `${orig.name} Copy`,
        x: orig.x + 16,
        y: orig.y + 16,
      };
      setObjects((prev) => syncAllConnectors([...prev, clone]));
      setSelectedIds([clone.id]);
      showToast(`Duplicated "${orig.name}" (+16px, +16px on top)`);
    },
    [objects, recordHistorySnapshot, showToast]
  );

  // Fireworks MX Clipboard & Cloning Engine (Ctrl+C Copy, Ctrl+X Cut, Ctrl+V Paste in Place, Ctrl+Shift+V Paste Offset Above)
  const cloneObjectsWithRemappedIds = useCallback(
    (sourceObjects: CanvasObject[], dx: number, dy: number, suffix: string): CanvasObject[] => {
      const stamp = Date.now();
      const idMap = new Map<string, string>();
      sourceObjects.forEach((obj, idx) => {
        idMap.set(
          obj.id,
          `${obj.type}-${stamp}-${idx}-${Math.random().toString(36).slice(2, 6)}`
        );
      });

      return sourceObjects.map((obj) => {
        const cloned: CanvasObject = JSON.parse(JSON.stringify(obj));
        const newId = idMap.get(obj.id) || `${obj.type}-${stamp}`;
        cloned.id = newId;
        const alreadyHasSelectionTag =
          /\((?:Cut|Copied) Selection\)$/i.test(obj.name) && suffix === '(In Place)';
        cloned.name = suffix && !alreadyHasSelectionTag ? `${obj.name} ${suffix}` : obj.name;
        cloned.x = Math.round(obj.x + dx);
        cloned.y = Math.round(obj.y + dy);

        if (cloned.type === 'bitmap' && cloned.imageDataUrl) {
          primeImageCache(cloned.imageDataUrl);
        }

        if (cloned.type === 'vector-path' && cloned.connectorMeta) {
          const mappedFrom = idMap.get(cloned.connectorMeta.fromObjectId);
          const mappedTo = idMap.get(cloned.connectorMeta.toObjectId);
          cloned.connectorMeta = {
            ...cloned.connectorMeta,
            fromObjectId: mappedFrom || cloned.connectorMeta.fromObjectId,
            toObjectId: mappedTo || cloned.connectorMeta.toObjectId,
          };
        }
        return cloned;
      });
    },
    []
  );

  const handleCopySelection = useCallback(() => {
    // 1. Priority: Active Bitmap Marquee / Lasso / Magic Wand Pixel Selection
    if (pixelSelection.active) {
      const bmp = findTargetBitmap();
      if (bmp) {
        const applyCopyResult = (res: {
          extractedBitmap: BitmapObject | null;
          updatedSourceBitmap: BitmapObject;
          extractedPixelCount: number;
        }) => {
          if (res.extractedBitmap) {
            primeImageCache(res.extractedBitmap.imageDataUrl);
            clipboardObjectsRef.current = [res.extractedBitmap];
            clipboardSliceRef.current = null;
            pasteCascadeStepRef.current = 0;
            showToast(
              `Copied selected bitmap pixels (${res.extractedBitmap.width}×${res.extractedBitmap.height}px) — Press Ctrl+V to paste as a new BitmapObject layer!`
            );
          } else {
            showToast('No bitmap pixels inside the active marquee selection to copy');
          }
        };

        const syncRes = extractOrCutSelectedBitmapPixelsSync(bmp, pixelSelection, 'copy');
        if (syncRes) {
          applyCopyResult(syncRes);
        } else {
          extractOrCutSelectedBitmapPixels(bmp, pixelSelection, 'copy').then(applyCopyResult);
        }
        return;
      }
    }

    // 2. Whole Canvas Objects
    if (selectedIds.length > 0) {
      const selectedList = objects.filter((o) => selectedIds.includes(o.id));
      if (selectedList.length > 0) {
        clipboardObjectsRef.current = JSON.parse(JSON.stringify(selectedList));
        clipboardSliceRef.current = null;
        pasteCascadeStepRef.current = 0;
        showToast(
          `Copied ${selectedList.length} object${selectedList.length > 1 ? 's' : ''} — Ctrl+V Paste in Place · Ctrl+Shift+V Paste Offset Above`
        );
        return;
      }
    }

    // 3. Web Slice
    if (selectedSliceId) {
      const foundSlice = slices.find((s) => s.id === selectedSliceId);
      if (foundSlice) {
        clipboardSliceRef.current = JSON.parse(JSON.stringify(foundSlice));
        clipboardObjectsRef.current = [];
        pasteCascadeStepRef.current = 0;
        showToast(
          `Copied Web Slice "${foundSlice.name}" — Ctrl+V Paste in Place · Ctrl+Shift+V Paste Offset`
        );
        return;
      }
    }

    showToast('Select a bitmap marquee region, object, or Web Slice first to copy (Ctrl+C / ⌘+C)');
  }, [pixelSelection, findTargetBitmap, objects, selectedIds, selectedSliceId, slices, showToast]);

  const handleCutSelection = useCallback(() => {
    // 1. Priority: Active Bitmap Marquee / Lasso / Magic Wand Pixel Selection
    // Cuts ONLY the selected pixels from the bitmap (leaving all unselected pixels untouched)
    // and stores the extracted bitmap piece in the clipboard so Ctrl+V pastes it cleanly!
    if (pixelSelection.active) {
      const bmp = findTargetBitmap();
      if (bmp) {
        const applyCutResult = (res: {
          extractedBitmap: BitmapObject | null;
          updatedSourceBitmap: BitmapObject;
          extractedPixelCount: number;
        }) => {
          if (!res.extractedBitmap) {
            showToast('No opaque bitmap pixels inside the active marquee selection to cut');
            return;
          }
          recordHistorySnapshot();
          primeImageCache(res.extractedBitmap.imageDataUrl);
          primeImageCache(res.updatedSourceBitmap.imageDataUrl);
          clipboardObjectsRef.current = [res.extractedBitmap];
          clipboardSliceRef.current = null;
          pasteCascadeStepRef.current = 0;
          handleUpdateObject(bmp.id, res.updatedSourceBitmap, false);
          setPixelSelection(createEmptyPixelSelection());
          setSelectedIds([bmp.id]);
          showToast(
            `Cut selected bitmap region (${res.extractedBitmap.width}×${res.extractedBitmap.height}px) — unselected bitmap left untouched! Press Ctrl+V to paste.`
          );
        };

        const syncRes = extractOrCutSelectedBitmapPixelsSync(bmp, pixelSelection, 'cut');
        if (syncRes) {
          applyCutResult(syncRes);
        } else {
          extractOrCutSelectedBitmapPixels(bmp, pixelSelection, 'cut').then(applyCutResult);
        }
        return;
      }
    }

    // 2. Whole Canvas Objects
    if (selectedIds.length > 0) {
      const selectedList = objects.filter((o) => selectedIds.includes(o.id));
      if (selectedList.length > 0) {
        clipboardObjectsRef.current = JSON.parse(JSON.stringify(selectedList));
        clipboardSliceRef.current = null;
        pasteCascadeStepRef.current = 0;
        recordHistorySnapshot();
        setObjects((prev) => prev.filter((o) => !selectedIds.includes(o.id)));
        setSelectedIds([]);
        showToast(
          `Cut ${selectedList.length} object${selectedList.length > 1 ? 's' : ''} to clipboard (Ctrl+V Paste in Place · Ctrl+Shift+V Paste Offset Above)`
        );
        return;
      }
    }

    // 3. Web Slice
    if (selectedSliceId) {
      const foundSlice = slices.find((s) => s.id === selectedSliceId);
      if (foundSlice) {
        clipboardSliceRef.current = JSON.parse(JSON.stringify(foundSlice));
        clipboardObjectsRef.current = [];
        pasteCascadeStepRef.current = 0;
        setSlices((prev) => prev.filter((s) => s.id !== selectedSliceId));
        setSelectedSliceId(null);
        showToast(`Cut Web Slice "${foundSlice.name}" to clipboard`);
        return;
      }
    }

    showToast('Select a bitmap marquee region, object, or Web Slice first to cut (Ctrl+X / ⌘+X)');
  }, [
    pixelSelection,
    findTargetBitmap,
    handleUpdateObject,
    objects,
    selectedIds,
    selectedSliceId,
    slices,
    recordHistorySnapshot,
    showToast,
  ]);

  const handlePasteSelection = useCallback(
    (mode: 'in-place' | 'offset-above') => {
      // 1. If Web Slice is in clipboard
      if (clipboardSliceRef.current && clipboardObjectsRef.current.length === 0) {
        const srcSlice = clipboardSliceRef.current;
        let dx = 0;
        let dy = 0;
        if (mode === 'offset-above') {
          pasteCascadeStepRef.current += 1;
          dx = 16 * pasteCascadeStepRef.current;
          dy = 16 * pasteCascadeStepRef.current;
        }
        const newSlice: CanvasSlice = {
          ...JSON.parse(JSON.stringify(srcSlice)),
          id: `slice-${Date.now()}`,
          name: `${srcSlice.name}-${mode === 'in-place' ? 'inplace' : 'copy'}`,
          x: Math.max(0, Math.round(srcSlice.x + dx)),
          y: Math.max(0, Math.round(srcSlice.y + dy)),
        };
        setSlices((prev) => [...prev, newSlice]);
        setSelectedSliceId(newSlice.id);
        setGridSettings((prev) => ({ ...prev, showSlices: true }));
        showToast(
          mode === 'in-place'
            ? `Pasted Web Slice "${newSlice.name}" in place (Ctrl+V)`
            : `Pasted Web Slice "${newSlice.name}" offset (+${dx}px, +${dy}px) above (Ctrl+Shift+V)`
        );
        return;
      }

      // 2. If clipboard is empty but an active pixel marquee exists, copy it first so Ctrl+V works directly
      if (clipboardObjectsRef.current.length === 0 && pixelSelection.active) {
        const bmp = findTargetBitmap();
        if (bmp) {
          const syncRes = extractOrCutSelectedBitmapPixelsSync(bmp, pixelSelection, 'copy');
          if (syncRes?.extractedBitmap) {
            primeImageCache(syncRes.extractedBitmap.imageDataUrl);
            clipboardObjectsRef.current = [syncRes.extractedBitmap];
            pasteCascadeStepRef.current = 0;
          }
        }
      }

      // 3. If clipboard is empty but objects are selected, seed clipboard from current selection
      if (clipboardObjectsRef.current.length === 0 && selectedIds.length > 0) {
        clipboardObjectsRef.current = JSON.parse(
          JSON.stringify(objects.filter((o) => selectedIds.includes(o.id)))
        );
        pasteCascadeStepRef.current = 0;
      }

      const sourceList = clipboardObjectsRef.current;
      if (sourceList.length === 0) {
        showToast('Clipboard is empty — select a marquee region or object and press Ctrl+X / Ctrl+C first');
        return;
      }

      recordHistorySnapshot();

      // Clear any active Marching Ants selection when pasting so the newly pasted layer is cleanly selected
      if (pixelSelection.active) {
        setPixelSelection(createEmptyPixelSelection());
      }

      let dx = 0;
      let dy = 0;
      if (mode === 'offset-above') {
        pasteCascadeStepRef.current += 1;
        dx = 16 * pasteCascadeStepRef.current;
        dy = 16 * pasteCascadeStepRef.current;
      }

      const suffix = mode === 'in-place' ? '(In Place)' : 'Copy';
      const pastedObjects = cloneObjectsWithRemappedIds(sourceList, dx, dy, suffix);

      setObjects((prev) => syncAllConnectors([...prev, ...pastedObjects]));
      setSelectedIds(pastedObjects.map((o) => o.id));

      // Switch from pixel marquee tools to Pointer (V) upon pasting so the user sees the pasted
      // bitmap's selection handles and can immediately drag/move it without clearing the selection
      if (
        activeTool === 'marquee-rect' ||
        activeTool === 'marquee-oval' ||
        activeTool === 'lasso' ||
        activeTool === 'magic-wand'
      ) {
        setActiveTool('pointer');
      }

      if (mode === 'in-place') {
        showToast(
          `Pasted ${pastedObjects.length} layer${pastedObjects.length > 1 ? 's' : ''} in place on top — drag with Pointer (V) to reposition!`
        );
      } else {
        showToast(
          `Pasted ${pastedObjects.length} layer${pastedObjects.length > 1 ? 's' : ''} above (+${dx}px right, +${dy}px down on top) (Ctrl+Shift+V / ⌘+⇧+V)`
        );
      }
    },
    [
      pixelSelection,
      findTargetBitmap,
      objects,
      selectedIds,
      activeTool,
      recordHistorySnapshot,
      cloneObjectsWithRemappedIds,
      showToast,
    ]
  );

  // Fireworks MX "Edit > Clone" (Ctrl+Shift+D / ⌘+⇧+D) — Clones selected objects in place (0,0 offset) on top
  const handleCloneSelectedInPlace = useCallback(() => {
    const selectedList = objects.filter((o) => selectedIds.includes(o.id));
    if (selectedList.length === 0) {
      showToast('Select an object first to Clone in Place (Ctrl+Shift+D / ⌘+⇧+D)');
      return;
    }
    recordHistorySnapshot();
    const cloned = cloneObjectsWithRemappedIds(selectedList, 0, 0, 'Clone');
    setObjects((prev) => syncAllConnectors([...prev, ...cloned]));
    setSelectedIds(cloned.map((o) => o.id));
    showToast(
      `Cloned ${cloned.length} object${cloned.length > 1 ? 's' : ''} in place on top (Ctrl+Shift+D)`
    );
  }, [objects, selectedIds, recordHistorySnapshot, cloneObjectsWithRemappedIds, showToast]);

  // Fireworks MX "Edit > Duplicate" (Ctrl+Alt+D / ⌘+⌥+D) — Duplicates selected objects offset (+16px, +16px) on top
  const handleDuplicateSelectedOffset = useCallback(() => {
    const selectedList = objects.filter((o) => selectedIds.includes(o.id));
    if (selectedList.length === 0) {
      showToast('Select an object first to Duplicate (Ctrl+Alt+D / ⌘+⌥+D)');
      return;
    }
    recordHistorySnapshot();
    const duplicated = cloneObjectsWithRemappedIds(selectedList, 16, 16, 'Copy');
    setObjects((prev) => syncAllConnectors([...prev, ...duplicated]));
    setSelectedIds(duplicated.map((o) => o.id));
    showToast(
      `Duplicated ${duplicated.length} object${duplicated.length > 1 ? 's' : ''} (+16px, +16px on top) (Ctrl+Alt+D)`
    );
  }, [objects, selectedIds, recordHistorySnapshot, cloneObjectsWithRemappedIds, showToast]);

  const handleDeleteObject = useCallback(
    (id: string) => {
      recordHistorySnapshot();
      setObjects((prev) => prev.filter((o) => o.id !== id));
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
    },
    [recordHistorySnapshot]
  );

  const handleAlignSelected = useCallback(
    (
      alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | 'snap-pixel'
    ) => {
      recordHistorySnapshot();
      if (alignment === 'snap-pixel') {
        setObjects((prev) =>
          syncAllConnectors(
            prev.map((o) => ({
              ...o,
              x: Math.round(o.x),
              y: Math.round(o.y),
              width: Math.max(1, Math.round(o.width)),
              height: Math.max(1, Math.round(o.height)),
              pixelSnap: true,
            }))
          )
        );
        showToast('Snapped all objects to exact 1px integer grid!');
        return;
      }

      const targets = objects.filter((o) => selectedIds.includes(o.id));
      if (targets.length === 0) return;
      const minX = targets.length === 1 ? 0 : Math.min(...targets.map((t) => t.x));
      const maxX =
        targets.length === 1
          ? gridSettings.canvasWidth
          : Math.max(...targets.map((t) => t.x + t.width));
      const minY = targets.length === 1 ? 0 : Math.min(...targets.map((t) => t.y));
      const maxY =
        targets.length === 1
          ? gridSettings.canvasHeight
          : Math.max(...targets.map((t) => t.y + t.height));

      setObjects((prev) =>
        syncAllConnectors(
          prev.map((o) => {
            if (!selectedIds.includes(o.id)) return o;
            if (alignment === 'left') return { ...o, x: Math.round(minX) };
            if (alignment === 'center')
              return { ...o, x: Math.round((minX + maxX) / 2 - o.width / 2) };
            if (alignment === 'right') return { ...o, x: Math.round(maxX - o.width) };
            if (alignment === 'top') return { ...o, y: Math.round(minY) };
            if (alignment === 'middle')
              return { ...o, y: Math.round((minY + maxY) / 2 - o.height / 2) };
            if (alignment === 'bottom') return { ...o, y: Math.round(maxY - o.height) };
            return o;
          })
        )
      );
    },
    [objects, selectedIds, gridSettings.canvasWidth, gridSettings.canvasHeight, recordHistorySnapshot, showToast]
  );

  const handleFlipSelected = useCallback(
    (axis: 'h' | 'v') => {
      if (pixelSelection.active) {
        handleApplyPixelEffect(axis === 'h' ? 'flip-h' : 'flip-v');
        return;
      }
      const targets = objects.filter((o) => selectedIds.includes(o.id));
      if (targets.length === 0) {
        showToast('Select an object first to Flip');
        return;
      }
      if (targets.length === 1 && targets[0].type === 'bitmap') {
        handleApplyPixelEffect(axis === 'h' ? 'flip-h' : 'flip-v');
        return;
      }

      recordHistorySnapshot();
      const minX = Math.min(...targets.map((t) => t.x));
      const maxX = Math.max(...targets.map((t) => t.x + t.width));
      const minY = Math.min(...targets.map((t) => t.y));
      const maxY = Math.max(...targets.map((t) => t.y + t.height));

      setObjects((prev) =>
        syncAllConnectors(
          prev.map((o) => {
            if (!selectedIds.includes(o.id)) return o;
            const nextX =
              targets.length > 1 && axis === 'h'
                ? Math.round(minX + maxX - (o.x + o.width))
                : o.x;
            const nextY =
              targets.length > 1 && axis === 'v'
                ? Math.round(minY + maxY - (o.y + o.height))
                : o.y;

            if (o.type === 'vector-path') {
              const vec = o as VectorPathObject;
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
              return { ...vec, x: nextX, y: nextY, nodes: flippedNodes };
            }

            const nextRot = ((o.rotation || 0) + 180) % 360;
            return { ...o, x: nextX, y: nextY, rotation: nextRot };
          })
        )
      );
      showToast(
        `Flipped ${targets.length} layer${targets.length > 1 ? 's' : ''} ${
          axis === 'h' ? 'Horizontally (↔)' : 'Vertically (↕)'
        }`
      );
    },
    [pixelSelection.active, handleApplyPixelEffect, objects, selectedIds, recordHistorySnapshot, showToast]
  );

  const handleCenterSelectedOnCanvas = useCallback(() => {
    const targets = objects.filter((o) => selectedIds.includes(o.id));
    if (targets.length === 0) {
      showToast('Select an object first to center on canvas');
      return;
    }
    recordHistorySnapshot();
    const minX = Math.min(...targets.map((t) => t.x));
    const maxX = Math.max(...targets.map((t) => t.x + t.width));
    const minY = Math.min(...targets.map((t) => t.y));
    const maxY = Math.max(...targets.map((t) => t.y + t.height));
    const dx = Math.round((gridSettings.canvasWidth - (maxX - minX)) / 2 - minX);
    const dy = Math.round((gridSettings.canvasHeight - (maxY - minY)) / 2 - minY);
    setObjects((prev) =>
      syncAllConnectors(
        prev.map((o) =>
          selectedIds.includes(o.id)
            ? { ...o, x: Math.round(o.x + dx), y: Math.round(o.y + dy) }
            : o
        )
      )
    );
    showToast(
      `Centered ${targets.length} layer${targets.length > 1 ? 's' : ''} on ${gridSettings.canvasWidth}×${gridSettings.canvasHeight}px canvas`
    );
  }, [objects, selectedIds, gridSettings.canvasWidth, gridSettings.canvasHeight, recordHistorySnapshot, showToast]);

  const handleChangeSelectedNodesType = useCallback(
    (pointType: 'corner' | 'smooth' | 'symmetric') => {
      if (selectedIds.length === 0) return;
      recordHistorySnapshot();
      setObjects((prev) =>
        prev.map((o) => {
          if (!selectedIds.includes(o.id) || o.type !== 'vector-path') return o;
          const vec = o as VectorPathObject;
          const nextNodes = vec.nodes.map((n) => {
            if (selectedNodeIds.length > 0 && !selectedNodeIds.includes(n.id)) return n;
            if (pointType === 'corner') {
              return { ...n, cp1x: n.x, cp1y: n.y, cp2x: n.x, cp2y: n.y, pointType: 'corner' as const };
            }
            const offset = 28;
            return {
              ...n,
              cp1x: n.cp1x === n.x ? n.x - offset : n.cp1x,
              cp1y: n.cp1y === n.y ? n.y : n.cp1y,
              cp2x: n.cp2x === n.x ? n.x + offset : n.cp2x,
              cp2y: n.cp2y === n.y ? n.y : n.cp2y,
              pointType,
            };
          });
          return { ...vec, nodes: nextNodes };
        })
      );
      showToast(`Updated Bezier nodes to ${pointType.toUpperCase()} mode`);
    },
    [selectedIds, selectedNodeIds, recordHistorySnapshot, showToast]
  );

  // Export Artwork Handlers (Multi-Format & Multi-Scale Raster + Vector + Slice + Clipboard)
  const handleExportRaster = useCallback(
    (
      format: 'png' | 'webp' | 'jpeg',
      scale: 1 | 2 | 3 = 1,
      selectionOnly = false
    ) => {
      const targetList = selectionOnly
        ? objects.filter((o) => selectedIds.includes(o.id) && o.visible)
        : objects.filter((o) => o.visible);

      if (selectionOnly && targetList.length === 0) {
        showToast('Select at least one object on the canvas to export a slice');
        return;
      }

      let cropX = 0;
      let cropY = 0;
      let exportW = gridSettings.canvasWidth;
      let exportH = gridSettings.canvasHeight;

      if (selectionOnly) {
        const minX = Math.min(...targetList.map((o) => o.x));
        const minY = Math.min(...targetList.map((o) => o.y));
        const maxX = Math.max(...targetList.map((o) => o.x + o.width));
        const maxY = Math.max(...targetList.map((o) => o.y + o.height));
        const pad = 4;
        cropX = Math.floor(minX - pad);
        cropY = Math.floor(minY - pad);
        exportW = Math.max(8, Math.ceil(maxX - minX + pad * 2));
        exportH = Math.max(8, Math.ceil(maxY - minY + pad * 2));
      }

      const offscreen = document.createElement('canvas');
      offscreen.width = exportW * scale;
      offscreen.height = exportH * scale;
      const ctx = offscreen.getContext('2d');
      if (!ctx) return;

      ctx.scale(scale, scale);

      if (!selectionOnly) {
        if (gridSettings.canvasBackground === 'white' || format === 'jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, exportW, exportH);
        } else if (gridSettings.canvasBackground === 'slate') {
          ctx.fillStyle = '#1c1c1c';
          ctx.fillRect(0, 0, exportW, exportH);
        }
      } else if (format === 'jpeg') {
        ctx.fillStyle = '#141414';
        ctx.fillRect(0, 0, exportW, exportH);
      }

      ctx.translate(-cropX, -cropY);
      targetList.forEach((obj) => {
        renderCanvasObjectToContext(ctx, obj, allAutoShapes);
      });

      const mimeType =
        format === 'webp'
          ? 'image/webp'
          : format === 'jpeg'
          ? 'image/jpeg'
          : 'image/png';
      const ext = format === 'jpeg' ? 'jpg' : format;
      const suffix = selectionOnly ? `-slice-${scale}x` : scale > 1 ? `-${scale}x` : '';
      const link = document.createElement('a');
      link.download = `osito${suffix}-${Date.now()}.${ext}`;
      link.href = offscreen.toDataURL(mimeType, format === 'png' ? undefined : 0.92);
      link.click();
      setIsExportMenuOpen(false);
      showToast(
        `Exported ${selectionOnly ? 'Selected Slice ' : ''}${format.toUpperCase()} @${scale}x (${offscreen.width}×${offscreen.height}px)!`
      );
    },
    [gridSettings, objects, selectedIds, allAutoShapes, showToast]
  );

  const handleExportPng = useCallback(() => {
    handleExportRaster('png', 1, false);
  }, [handleExportRaster]);

  const buildSvgString = useCallback(() => {
    const escapeXml = (raw: string | number | undefined | null): string =>
      String(raw ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

    const nodesToSvgD = (nodes: VectorPathObject['nodes'], closed: boolean, ox: number, oy: number) => {
      if (nodes.length === 0) return '';
      let d = `M ${nodes[0].x + ox} ${nodes[0].y + oy}`;
      for (let i = 0; i < nodes.length - 1; i++) {
        const c = nodes[i];
        const n = nodes[i + 1];
        d += ` C ${c.cp2x + ox} ${c.cp2y + oy}, ${n.cp1x + ox} ${n.cp1y + oy}, ${n.x + ox} ${n.y + oy}`;
      }
      if (closed && nodes.length > 1) {
        const last = nodes[nodes.length - 1];
        const first = nodes[0];
        d += ` C ${last.cp2x + ox} ${last.cp2y + oy}, ${first.cp1x + ox} ${first.cp1y + oy}, ${first.x + ox} ${first.y + oy} Z`;
      }
      return d;
    };

    const parts: string[] = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${gridSettings.canvasWidth}" height="${gridSettings.canvasHeight}" viewBox="0 0 ${gridSettings.canvasWidth} ${gridSettings.canvasHeight}">`,
    ];

    objects.forEach((obj) => {
      if (!obj.visible) return;
      if (obj.type === 'vector-path') {
        const d = nodesToSvgD(obj.nodes, obj.closed, obj.x, obj.y);
        parts.push(
          `  <path d="${escapeXml(d)}" fill="${escapeXml(obj.fillType === 'none' ? 'none' : obj.fill)}" stroke="${escapeXml(obj.stroke)}" stroke-width="${obj.strokeWidth}" opacity="${obj.opacity}" />`
        );
      } else if (obj.type === 'autoshape') {
        const def = allAutoShapes.find((s) => s.id === obj.shapeDefId) || allAutoShapes[0];
        if (def) {
          const ev = evaluateAutoShape(def, obj.width, obj.height, obj.params, obj.customCode);
          const d = ev.paths.map((p) => nodesToSvgD(p.nodes, p.closed, obj.x, obj.y)).join(' ');
          parts.push(
            `  <path d="${escapeXml(d)}" fill="${escapeXml(obj.fillType === 'none' ? 'none' : obj.fill)}" stroke="${escapeXml(obj.stroke)}" stroke-width="${obj.strokeWidth}" opacity="${obj.opacity}" />`
          );
        }
      } else if (obj.type === 'bitmap') {
        parts.push(
          `  <image x="${obj.x}" y="${obj.y}" width="${obj.width}" height="${obj.height}" href="${escapeXml(obj.imageDataUrl)}" opacity="${obj.opacity}" />`
        );
      } else if (obj.type === 'text') {
        parts.push(
          `  <text x="${obj.x}" y="${obj.y + obj.fontSize}" fill="${escapeXml(obj.fill)}" font-family="${escapeXml(obj.fontFamily)}" font-size="${obj.fontSize}" font-weight="${escapeXml(obj.fontWeight)}">${escapeXml(obj.text)}</text>`
        );
      }
    });

    parts.push('</svg>');
    return parts.join('\n');
  }, [gridSettings, objects, allAutoShapes]);

  const handleExportSvg = useCallback(() => {
    const svgContent = buildSvgString();
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = `osito-${Date.now()}.svg`;
    link.href = URL.createObjectURL(blob);
    link.click();
    setIsExportMenuOpen(false);
    showToast('Exported Hybrid Vector/Bitmap SVG!');
  }, [buildSvgString, showToast]);

  const handleCopySvgToClipboard = useCallback(async () => {
    const svgContent = buildSvgString();
    try {
      await navigator.clipboard.writeText(svgContent);
      setIsExportMenuOpen(false);
      showToast('Copied inline <svg> code to clipboard!');
    } catch {
      showToast('Unable to access clipboard');
    }
  }, [buildSvgString, showToast]);

  const handleExportProjectJson = useCallback(() => {
    const payload = {
      app: 'Osito (Pixel + Vector Editor)',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      gridSettings,
      objects,
      slices,
      customAutoShapes,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = `project-${Date.now()}.osito.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
    setIsSaveMenuOpen(false);
    setIsExportMenuOpen(false);
    showToast('Saved .osito.json project bundle!');
  }, [gridSettings, objects, slices, customAutoShapes, showToast]);

  // Save Dropdown & Creative Generators Studio Handlers
  const handleQuickSaveToBrowser = useCallback(() => {
    try {
      const payload = {
        app: 'Osito (Pixel + Vector Editor)',
        savedAt: new Date().toISOString(),
        gridSettings,
        objects,
        slices,
        customAutoShapes,
      };
      localStorage.setItem('osito_saved_workspace_v1', JSON.stringify(payload));
      setIsSaveMenuOpen(false);
      showToast('Saved workspace snapshot to browser storage (Instant Restore ready)!');
    } catch {
      showToast('Could not save to browser storage (quota exceeded)');
    }
  }, [gridSettings, objects, slices, customAutoShapes, showToast]);

  const handleRestoreFromBrowserSave = useCallback(() => {
    try {
      const raw = localStorage.getItem('osito_saved_workspace_v1');
      if (!raw) {
        showToast('No browser workspace snapshot found yet — click "Save to Browser Workspace" first.');
        return;
      }
      const parsed = JSON.parse(raw);
      recordHistorySnapshot();
      if (Array.isArray(parsed.objects)) setObjects(parsed.objects);
      if (Array.isArray(parsed.slices)) setSlices(parsed.slices);
      if (parsed.gridSettings) {
        setGridSettings((prev) => ({ ...prev, ...parsed.gridSettings }));
      }
      if (Array.isArray(parsed.customAutoShapes)) {
        setCustomAutoShapes(parsed.customAutoShapes);
        saveCustomAutoShapes(parsed.customAutoShapes);
      }
      setIsSaveMenuOpen(false);
      showToast('Restored workspace snapshot from browser storage!');
    } catch {
      showToast('Failed to restore browser workspace snapshot');
    }
  }, [recordHistorySnapshot, showToast]);

  const handleSaveSelectedAutoShapePlugin = useCallback(() => {
    const selectedAutoShape = objects.find(
      (o): o is AutoShapeObject => selectedIds.includes(o.id) && o.type === 'autoshape'
    );
    const activeDef = selectedAutoShape
      ? allAutoShapes.find((d) => d.id === selectedAutoShape.shapeDefId)
      : allAutoShapes.find((d) => d.id === toolOptions.activeAutoShapeId) || allAutoShapes[0];

    if (!activeDef) {
      showToast('Select an AutoShape first to save as a .autoshape.js plugin');
      return;
    }

    const codeBody = selectedAutoShape?.customCode || activeDef.jsSourceCode;
    const header = [
      `// @name: ${activeDef.name}`,
      `// @id: ${activeDef.id}`,
      `// @category: ${activeDef.category}`,
      `// @description: ${activeDef.description}`,
      `// @defaultParams: ${JSON.stringify(selectedAutoShape?.params || activeDef.defaultParams)}`,
      '',
      codeBody,
    ].join('\n');

    const blob = new Blob([header], { type: 'application/javascript' });
    const link = document.createElement('a');
    link.download = `${activeDef.id}.autoshape.js`;
    link.href = URL.createObjectURL(blob);
    link.click();
    setIsSaveMenuOpen(false);
    showToast(`Saved "${activeDef.name}" as ${activeDef.id}.autoshape.js!`);
  }, [objects, selectedIds, allAutoShapes, toolOptions.activeAutoShapeId, showToast]);

  const handleSaveSitemapMarkdown = useCallback(() => {
    const lines: string[] = [
      '# Osito Architecture & Sitemap Specification',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      '## 1. Canvas Nodes & Components',
    ];
    objects.forEach((obj) => {
      if (obj.type === 'vector-path' && obj.connectorMeta) return;
      const label =
        obj.type === 'autoshape'
          ? String(obj.params.label ?? obj.params.title ?? obj.params.brand ?? obj.name)
          : obj.type === 'text'
          ? obj.text
          : obj.name;
      lines.push(`- **[${obj.type.toUpperCase()}]** \`${obj.name}\` — "${label}" (${Math.round(obj.width)}×${Math.round(obj.height)}px at ${Math.round(obj.x)},${Math.round(obj.y)})`);
    });

    const connectors = objects.filter(
      (o): o is VectorPathObject => o.type === 'vector-path' && Boolean(o.connectorMeta)
    );
    if (connectors.length > 0) {
      lines.push('', '## 2. Connected Sitemap & Workflow Edges');
      connectors.forEach((c) => {
        const meta = c.connectorMeta;
        if (!meta) return;
        const src = objects.find((o) => o.id === meta.fromObjectId);
        const dst = objects.find((o) => o.id === meta.toObjectId);
        lines.push(
          `- \`${src?.name || meta.fromObjectId}\` (${meta.fromPort}) --> \`${dst?.name || meta.toObjectId}\` (${meta.toPort})${meta.label ? ` : "${meta.label}"` : ''}`
        );
      });
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.download = `sitemap-workflow-${Date.now()}.md`;
    link.href = URL.createObjectURL(blob);
    link.click();
    setIsSaveMenuOpen(false);
    showToast('Saved Sitemap & Workflow Markdown specification (.md)!');
  }, [objects, showToast]);

  const handleSaveThemeCssVariables = useCallback(() => {
    const css = [
      ':root {',
      `  --osito-primary: ${toolOptions.primaryColor};`,
      `  --osito-secondary: ${toolOptions.secondaryColor};`,
      `  --osito-canvas-width: ${gridSettings.canvasWidth}px;`,
      `  --osito-canvas-height: ${gridSettings.canvasHeight}px;`,
      '}',
    ].join('\n');
    const blob = new Blob([css], { type: 'text/css' });
    const link = document.createElement('a');
    link.download = `osito-theme-${Date.now()}.css`;
    link.href = URL.createObjectURL(blob);
    link.click();
    setIsSaveMenuOpen(false);
    showToast('Saved CSS Theme Variables (.css)!');
  }, [toolOptions.primaryColor, toolOptions.secondaryColor, gridSettings.canvasWidth, gridSettings.canvasHeight, showToast]);

  const openCreationStudioTab = useCallback((tab: CreationStudioTab) => {
    setCreationStudioTab(tab);
    setIsCreationStudioOpen(true);
    setIsCreateMenuOpen(false);
  }, []);

  const liveLogoPreviewIdsRef = useRef<string[]>([]);

  const handleLivePreviewLogoOnCanvas = useCallback(
    (config: LogoGeneratorConfig) => {
      const created = generateLogoCanvasObjects(
        config,
        gridSettings.canvasWidth,
        gridSettings.canvasHeight
      );
      const prevIds = new Set(liveLogoPreviewIdsRef.current);
      liveLogoPreviewIdsRef.current = created.map((o) => o.id);
      setObjects((prev) => [...prev.filter((o) => !prevIds.has(o.id)), ...created]);
      setSelectedIds(created.map((o) => o.id));
    },
    [gridSettings.canvasWidth, gridSettings.canvasHeight]
  );

  const handleGenerateLogo = useCallback(
    (config: LogoGeneratorConfig) => {
      recordHistorySnapshot();
      const created = generateLogoCanvasObjects(
        config,
        gridSettings.canvasWidth,
        gridSettings.canvasHeight
      );
      const prevPreviewIds = new Set(liveLogoPreviewIdsRef.current);
      liveLogoPreviewIdsRef.current = [];
      setObjects((prev) => [
        ...prev.filter((o) => !prevPreviewIds.has(o.id)),
        ...created,
      ]);
      setSelectedIds(created.map((o) => o.id));
      setActiveTool('pointer');
      showToast(`Generated "${config.brandName}" vector logo lockup (${created.length} layers)!`);
    },
    [recordHistorySnapshot, gridSettings.canvasWidth, gridSettings.canvasHeight, showToast]
  );

  const handleGenerateWebsiteLayout = useCallback(
    (
      templateId: WebsiteLayoutTemplateId,
      theme: ColorThemePalette,
      replaceCanvas: boolean,
      switchToPreview: boolean,
      customBrief?: string
    ) => {
      recordHistorySnapshot();
      const generated = generateWebsiteLayoutObjects(
        templateId,
        theme,
        gridSettings.canvasWidth,
        gridSettings.canvasHeight,
        customBrief
      );
      setObjects((prev) => (replaceCanvas ? generated : [...prev, ...generated]));
      setSelectedIds(generated.slice(0, 1).map((o: CanvasObject) => o.id));
      setToolOptions((prev) => ({
        ...prev,
        primaryColor: theme.primary,
        secondaryColor: theme.secondary,
      }));
      if (switchToPreview) {
        setGridSettings((prev) => ({
          ...prev,
          canvasViewMode: 'preview',
          showSlices: false,
        }));
      }
      setActiveTool('pointer');
      showToast(
        `Generated High-Fidelity Website Layout (${generated.length} vector & typography layers)${
          switchToPreview ? ' — Live Preview Mode active! Click nav buttons to expand nested dropdowns.' : '!'
        }`
      );
    },
    [recordHistorySnapshot, gridSettings.canvasWidth, gridSettings.canvasHeight, showToast]
  );

  const handleApplyColorTheme = useCallback(
    (theme: ColorThemePalette) => {
      recordHistorySnapshot();
      setObjects((prev) => applyColorThemeToCanvasObjects(prev, theme));
      setToolOptions((prev) => ({
        ...prev,
        primaryColor: theme.primary,
        secondaryColor: theme.secondary,
      }));
      showToast(`Applied "${theme.name}" color theme across canvas objects!`);
    },
    [recordHistorySnapshot, showToast]
  );

  const handleSpawnThemeSwatchCard = useCallback(
    (theme: ColorThemePalette) => {
      recordHistorySnapshot();
      const cards = createColorThemeSwatchCardObjects(
        theme,
        gridSettings.canvasWidth,
        gridSettings.canvasHeight
      );
      setObjects((prev) => [...prev, ...cards]);
      setSelectedIds(cards.map((o) => o.id));
      showToast(`Inserted "${theme.name}" Color Theme Swatch Card on canvas!`);
    },
    [recordHistorySnapshot, gridSettings.canvasWidth, gridSettings.canvasHeight, showToast]
  );

  // Live Canvas Design Readiness & UX Audit Report
  const canvasAuditReport = React.useMemo(
    () =>
      auditCanvasDesignReadiness(
        objects,
        slices,
        gridSettings.canvasWidth,
        gridSettings.canvasHeight
      ),
    [objects, slices, gridSettings.canvasWidth, gridSettings.canvasHeight]
  );

  const handleSpawnStrategyBoard = useCallback(
    (dossier: DeepResearchDossier, replaceCanvas: boolean) => {
      recordHistorySnapshot();
      const generated = generateDeepResearchStrategyBoardObjects(
        dossier,
        gridSettings.canvasWidth,
        gridSettings.canvasHeight
      );
      setObjects((prev) => (replaceCanvas ? generated : [...prev, ...generated]));
      setSelectedIds(generated.slice(0, 1).map((o: CanvasObject) => o.id));
      setGridSettings((prev) => ({
        ...prev,
        canvasViewMode: 'design',
        showSlices: false,
      }));
      setActiveTool('pointer');
      showToast(
        `Spawned "${dossier.brandName}" Deep Research & Competitive Strategy Board (${generated.length} layers)!`
      );
    },
    [recordHistorySnapshot, gridSettings.canvasWidth, gridSettings.canvasHeight, showToast]
  );

  const handleAutoPolishCanvas = useCallback(
    (theme?: ColorThemePalette) => {
      recordHistorySnapshot();
      const polished = autoPolishCanvasObjects(
        objects,
        slices,
        theme,
        gridSettings.canvasWidth,
        gridSettings.canvasHeight
      );
      setObjects(polished.objects);
      setSlices(polished.slices);
      showToast(polished.fixedSummary);
    },
    [
      recordHistorySnapshot,
      objects,
      slices,
      gridSettings.canvasWidth,
      gridSettings.canvasHeight,
      showToast,
    ]
  );

  const handleOpenDeepResearchWithQuery = useCallback((query: string) => {
    setInitialResearchQuery(query);
    setCreationStudioTab('deep-research' as CreationStudioTab);
    setIsCreationStudioOpen(true);
    setIsCreateMenuOpen(false);
  }, []);

  const handleInstantSpawnResearchedWebsite = useCallback(
    (query: string) => {
      const dossier = runDeepMarketResearch(query);
      handleGenerateWebsiteLayout(
        dossier.recommendedTemplateId,
        dossier.recommendedTheme,
        true,
        true,
        query
      );
    },
    [handleGenerateWebsiteLayout]
  );

  const handleInstantSpawnStrategyBoard = useCallback(
    (query: string) => {
      const dossier = runDeepMarketResearch(query);
      handleSpawnStrategyBoard(dossier, true);
    },
    [handleSpawnStrategyBoard]
  );

  const handleResetStarterShowcase = useCallback(() => {
    closeAllTopMenus();
    recordHistorySnapshot();
    setObjects(createStarterSceneObjects());
    setSlices(createDefaultStarterSlices());
    setSelectedSliceId(null);
    setSelectedNodeIds([]);
    setSelectedIds(['obj-bitmap-hero']);
    setPixelSelection(createEmptyPixelSelection());
    setActiveTool('pointer');
    setActiveShowcaseIndex(0);
    setGridSettings((prev) => ({
      ...prev,
      canvasWidth: 960,
      canvasHeight: 600,
      canvasViewMode: 'design',
      showSlices: false,
      zoom: 1,
      panX: 0,
      panY: 0,
    }));
    showToast('Loaded Showcase 1/6: Flagship Fireworks MX Hybrid Lab');
  }, [closeAllTopMenus, recordHistorySnapshot, showToast]);

  const handleLoadShowcasePreset = useCallback(
    (presetIndex: number) => {
      const normalized = ((presetIndex % 6) + 6) % 6;
      closeAllTopMenus();
      setActiveShowcaseIndex(normalized);

      if (normalized === 0) {
        handleResetStarterShowcase();
      } else if (normalized === 1) {
        handleInstantSpawnResearchedWebsite(
          'Osito Autonomous Security Drones & Real-Time Fleet Telemetry AI'
        );
      } else if (normalized === 2) {
        handleGenerateWebsiteLayout(
          'bento-product',
          COLOR_THEME_PRESETS[0],
          true,
          true,
          'Osito CUB-75 & SHARD-75 Aerospace Avionics Suite'
        );
      } else if (normalized === 3) {
        handleInstantSpawnStrategyBoard(
          'Osito Autonomous Security Drones & STEM Flight Academy'
        );
      } else if (normalized === 4) {
        handleGenerateWebsiteLayout(
          'analytics-dashboard',
          COLOR_THEME_PRESETS[1] || COLOR_THEME_PRESETS[0],
          true,
          true,
          'Osito Fleet Command & Aerial Inspection Telemetry'
        );
      } else if (normalized === 5) {
        handleGenerateWebsiteLayout(
          'sitemap-architecture',
          COLOR_THEME_PRESETS[2] || COLOR_THEME_PRESETS[0],
          true,
          false,
          'Osito Multi-Site Conversion & Autonomous Dispatch Flow'
        );
      }
    },
    [
      closeAllTopMenus,
      handleResetStarterShowcase,
      handleInstantSpawnResearchedWebsite,
      handleGenerateWebsiteLayout,
      handleInstantSpawnStrategyBoard,
    ]
  );

  const handleCycleNextShowcasePreset = useCallback(() => {
    handleLoadShowcasePreset(activeShowcaseIndex + 1);
  }, [activeShowcaseIndex, handleLoadShowcasePreset]);

  const demoTourSteps = React.useMemo(
    () => [
      {
        idx: 0,
        badge: 'SCENE 1/6 • HYBRID VECTOR + BITMAP LAB',
        title: 'Flagship Fireworks MX Hybrid Studio',
        detail:
          'Simultaneous Cubic Bezier paths (A), 1px Bitmap Marquee Cut/Paste (M), and 125+ programmable .JSF AutoShapes (◆) on one unified canvas.',
      },
      {
        idx: 1,
        badge: 'SCENE 2/6 • LIVE :HOVER & NESTED MENUS',
        title: 'Autonomous Security Drone Website',
        detail:
          'Live Preview Mode active — hover & click the top navigation bar to test multi-level flyout dropdowns and interactive :hover states.',
      },
      {
        idx: 2,
        badge: 'SCENE 3/6 • BENTO HARDWARE & LIVE FX',
        title: 'Apple-Style Bento Hardware Grid',
        detail:
          '1px pixel-snapped hardware showcase cards with custom gradients, 1-Click Live Effects (+FX), and @1x/@2x/@3x Retina web slices.',
      },
      {
        idx: 3,
        badge: 'SCENE 4/6 • EXECUTIVE AI STRATEGY BOARD',
        title: 'Deep Research & Competitive War-Room',
        detail:
          'Auto-synthesized 25+ layer executive strategy board with ICP personas, competitor moat matrix, and live WCAG 2.2 contrast scoring.',
      },
      {
        idx: 4,
        badge: 'SCENE 5/6 • REAL-TIME TELEMETRY HUD',
        title: 'AI Fleet Command & KPI Dashboard',
        detail:
          'Programmable sparklines, radial gauges, and telemetry widgets driven by live JavaScript AutoShape diamond control handles.',
      },
      {
        idx: 5,
        badge: 'SCENE 6/6 • MAGNETIC FLOW BLUEPRINT',
        title: 'System Architecture & Auto-Routing',
        detail:
          'Lucidchart-style magnetic N/E/S/W ports with orthogonal elbow connectors that automatically re-route whenever nodes move.',
      },
    ],
    []
  );

  const handleToggleDemoTour = useCallback(() => {
    closeAllTopMenus();
    setIsDemoTourPlaying((prev) => {
      const nextState = !prev;
      if (nextState) {
        const nextIdx = (activeShowcaseIndex + 1) % 6;
        handleLoadShowcasePreset(nextIdx);
        showToast(
          `▶ Started Interactive Demo Tour (${nextIdx + 1}/6): ${demoTourSteps[nextIdx].title}`
        );
      } else {
        showToast('■ Stopped Demo Tour — canvas ready for live editing!');
      }
      return nextState;
    });
  }, [closeAllTopMenus, activeShowcaseIndex, handleLoadShowcasePreset, demoTourSteps, showToast]);

  useEffect(() => {
    if (!isDemoTourPlaying) return;
    const timerId = window.setInterval(() => {
      const nextIdx = (activeShowcaseIndex + 1) % 6;
      handleLoadShowcasePreset(nextIdx);
    }, 4400);
    return () => window.clearInterval(timerId);
  }, [isDemoTourPlaying, activeShowcaseIndex, handleLoadShowcasePreset]);

  const handleExportInteractiveHtmlShowcase = useCallback(() => {
    const visibleList = objects.filter((o) => o.visible);
    const exportW = gridSettings.canvasWidth;
    const exportH = gridSettings.canvasHeight;

    // 1. Render crisp @2x Retina PNG Data URL of current canvas
    const offscreen = document.createElement('canvas');
    offscreen.width = exportW * 2;
    offscreen.height = exportH * 2;
    const ctx = offscreen.getContext('2d');
    if (ctx) {
      ctx.scale(2, 2);
      ctx.fillStyle = gridSettings.canvasBackground === 'white' ? '#ffffff' : '#0d1117';
      ctx.fillRect(0, 0, exportW, exportH);
      visibleList.forEach((obj) => {
        renderCanvasObjectToContext(ctx, obj, allAutoShapes);
      });
    }
    const pngDataUrl = offscreen.toDataURL('image/png');
    const svgContent = buildSvgString();

    // 2. Collect unique hex colors from canvas objects
    const colorSet = new Set<string>();
    visibleList.forEach((o) => {
      if (o.fill && o.fill.startsWith('#')) colorSet.add(o.fill.toUpperCase());
      if (o.fillGradientEnd && o.fillGradientEnd.startsWith('#'))
        colorSet.add(o.fillGradientEnd.toUpperCase());
      if (o.stroke && o.stroke.startsWith('#')) colorSet.add(o.stroke.toUpperCase());
    });
    const paletteColors = Array.from(colorSet).slice(0, 12);

    const vectorCount = visibleList.filter((o) => o.type === 'vector-path' && !o.connectorMeta).length;
    const connectorCount = visibleList.filter((o) => o.type === 'vector-path' && o.connectorMeta).length;
    const autoShapeCount = visibleList.filter((o) => o.type === 'autoshape').length;
    const bitmapCount = visibleList.filter((o) => o.type === 'bitmap').length;
    const textCount = visibleList.filter((o) => o.type === 'text').length;

    const escapeHtml = (str: string) =>
      String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const htmlDoc = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Osito Studio 4.0 — Interactive Design Showcase (${exportW}×${exportH}px)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0a0a0a;
      color: #e5e5e5;
      font-family: 'Inter', system-ui, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      background: #121212;
      border-bottom: 1px solid #2a2a2a;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-badge {
      background: linear-gradient(135deg, #06b6d4, #6366f1);
      color: #fff;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 11px;
      padding: 4px 8px;
      border: 1px solid #ffffff;
    }
    .brand h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 16px;
      color: #ffffff;
      letter-spacing: 0.03em;
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
    }
    button {
      background: #1c1c1c;
      color: #e5e5e5;
      border: 1px solid #404040;
      padding: 6px 12px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.15s;
    }
    button:hover, button.active {
      background: #e5e5e5;
      color: #0a0a0a;
      border-color: #ffffff;
      font-weight: 600;
    }
    main {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 340px;
      min-height: 0;
    }
    @media (max-width: 1024px) {
      main { grid-template-columns: 1fr; }
    }
    .stage {
      background: #0e0e0e;
      background-image: radial-gradient(#262626 1px, transparent 1px);
      background-size: 16px 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
      overflow: auto;
    }
    .canvas-frame {
      position: relative;
      box-shadow: 0 24px 60px rgba(0,0,0,0.85);
      border: 1px solid #383838;
      background: #0d1117;
      transition: transform 0.2s ease;
      transform-origin: center center;
    }
    .canvas-frame img {
      display: block;
      width: ${exportW}px;
      height: ${exportH}px;
      image-rendering: -webkit-optimize-contrast;
    }
    .pixel-grid-overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
      display: none;
      background-image:
        linear-gradient(to right, rgba(56, 189, 248, 0.16) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(56, 189, 248, 0.16) 1px, transparent 1px);
      background-size: 8px 8px;
    }
    .sidebar {
      background: #121212;
      border-left: 1px solid #2a2a2a;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
    }
    .section-title {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #a3a3a3;
      margin-bottom: 8px;
      border-bottom: 1px solid #262626;
      padding-bottom: 4px;
    }
    .stat-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .stat-card {
      background: #181818;
      border: 1px solid #2e2e2e;
      padding: 8px 10px;
    }
    .stat-val {
      font-size: 15px;
      font-weight: 700;
      color: #38bdf8;
    }
    .swatch-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
    }
    .swatch {
      background: #181818;
      border: 1px solid #333;
      padding: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }
    .swatch:hover { border-color: #fff; }
    .swatch-box { width: 16px; height: 16px; border: 1px solid rgba(255,255,255,0.2); flex-shrink: 0; }
    .layer-list {
      max-height: 280px;
      overflow-y: auto;
      border: 1px solid #262626;
      background: #161616;
    }
    .layer-item {
      padding: 6px 8px;
      border-bottom: 1px solid #222;
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }
    .layer-type { color: #38bdf8; font-size: 9px; text-transform: uppercase; }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <span class="brand-badge">OSITO STUDIO 4.0</span>
      <h1>Hybrid Pixel + Cubic Bezier Vector + JS AutoShape Showcase</h1>
      <span style="font-family:'JetBrains Mono',monospace;font-size:11px;padding:3px 8px;background:#13241c;color:#6ee7b7;border:1px solid #10b981;">
        UX Audit: ${canvasAuditReport.overallScore}% (${canvasAuditReport.grade})
      </span>
    </div>
    <div class="controls">
      <button id="btn-raster" class="active" onclick="setMode('raster')">1. Crisp Retina @2x</button>
      <button id="btn-svg" onclick="setMode('svg')">2. Live Vector SVG</button>
      <button id="btn-grid" onclick="toggleGrid()">1px Loupe Grid: OFF</button>
      <button id="btn-zoom" onclick="cycleZoom()">Zoom: 100%</button>
      <a href="${pngDataUrl}" download="osito-showcase-2x.png" style="text-decoration:none;">
        <button>Download @2x PNG</button>
      </a>
    </div>
  </header>
  <main>
    <div class="stage">
      <div class="canvas-frame" id="canvas-frame">
        <div id="view-raster">
          <img src="${pngDataUrl}" alt="Osito Hybrid Canvas Render" />
        </div>
        <div id="view-svg" style="display:none;width:${exportW}px;height:${exportH}px;">
          ${svgContent}
        </div>
        <div class="pixel-grid-overlay" id="pixel-grid"></div>
      </div>
    </div>
    <aside class="sidebar">
      <div>
        <div class="section-title">1. Hybrid Document Telemetry</div>
        <div class="stat-grid">
          <div class="stat-card"><div class="stat-val">${visibleList.length}</div><div>Total Layers</div></div>
          <div class="stat-card"><div class="stat-val">${exportW}×${exportH}</div><div>Pixel Bounds</div></div>
          <div class="stat-card"><div class="stat-val">${vectorCount + autoShapeCount}</div><div>Vectors &amp; JS Shapes</div></div>
          <div class="stat-card"><div class="stat-val">${bitmapCount} / ${textCount}</div><div>Bitmaps / Text</div></div>
          <div class="stat-card"><div class="stat-val">${connectorCount}</div><div>Smart Connectors</div></div>
          <div class="stat-card"><div class="stat-val">${slices.length}</div><div>Retina Slices</div></div>
        </div>
      </div>
      <div>
        <div class="section-title">2. Document Color Tokens (Click to Copy)</div>
        <div class="swatch-grid">
          ${paletteColors
            .map(
              (hex) => `
            <div class="swatch" onclick="navigator.clipboard.writeText('${escapeHtml(hex)}');this.title='Copied!'">
              <span class="swatch-box" style="background:${escapeHtml(hex)}"></span>
              <span>${escapeHtml(hex)}</span>
            </div>`
            )
            .join('')}
        </div>
      </div>
      <div>
        <div class="section-title">3. Z-Order Hybrid Layer Stack (${visibleList.length})</div>
        <div class="layer-list">
          ${[...visibleList]
            .reverse()
            .map(
              (o) => `
            <div class="layer-item">
              <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(o.name)}</span>
              <span class="layer-type">${escapeHtml(o.type)}</span>
            </div>`
            )
            .join('')}
        </div>
      </div>
    </aside>
  </main>
  <script>
    let zoomLevel = 1;
    let gridOn = false;
    function setMode(mode) {
      document.getElementById('view-raster').style.display = mode === 'raster' ? 'block' : 'none';
      document.getElementById('view-svg').style.display = mode === 'svg' ? 'block' : 'none';
      document.getElementById('btn-raster').className = mode === 'raster' ? 'active' : '';
      document.getElementById('btn-svg').className = mode === 'svg' ? 'active' : '';
    }
    function toggleGrid() {
      gridOn = !gridOn;
      document.getElementById('pixel-grid').style.display = gridOn ? 'block' : 'none';
      const btn = document.getElementById('btn-grid');
      btn.textContent = '1px Loupe Grid: ' + (gridOn ? 'ON' : 'OFF');
      btn.className = gridOn ? 'active' : '';
    }
    function cycleZoom() {
      zoomLevel = zoomLevel === 1 ? 1.35 : zoomLevel === 1.35 ? 0.75 : 1;
      document.getElementById('canvas-frame').style.transform = 'scale(' + zoomLevel + ')';
      document.getElementById('btn-zoom').textContent = 'Zoom: ' + Math.round(zoomLevel * 100) + '%';
    }
  </script>
</body>
</html>`;

    const blob = new Blob([htmlDoc], { type: 'text/html' });
    const link = document.createElement('a');
    link.download = `osito-interactive-showcase-${Date.now()}.html`;
    link.href = URL.createObjectURL(blob);
    link.click();
    setIsExportMenuOpen(false);
    showToast('Exported standalone Interactive HTML Showcase (.html)!');
  }, [objects, gridSettings, allAutoShapes, buildSvgString, canvasAuditReport, slices.length, showToast]);

  const handleExportCleanProductionHtml = useCallback(() => {
    const visibleList = objects.filter((o) => o.visible);
    const exportW = gridSettings.canvasWidth;
    const exportH = gridSettings.canvasHeight;
    const svgContent = buildSvgString();

    // Detect if the design has a top navbar with nested menus so the exported index.html includes live floating dropdown menus
    const navbarObj = visibleList.find(
      (o) =>
        Boolean(o.params?.hasNestedMenu) ||
        o.name.toLowerCase().includes('navbar') ||
        (o.type === 'autoshape' && (o as AutoShapeObject).shapeDefId === 'layout-sticky-navbar')
    );
    const customTopMenusRaw =
      typeof navbarObj?.params?.customTopMenus === 'string' && navbarObj.params.customTopMenus.trim()
        ? navbarObj.params.customTopMenus
        : 'Products ▾|Solutions ▾|Developers ▾|Pricing ▾';
    const topMenus = customTopMenusRaw
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 4);
    while (topMenus.length < 4) {
      topMenus.push(['Products ▾', 'Solutions ▾', 'Developers ▾', 'Pricing ▾'][topMenus.length]);
    }

    const cleanHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Published Website — Built with Osito Studio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: ${gridSettings.canvasBackground === 'white' ? '#ffffff' : '#090d16'};
      color: #f8fafc;
      font-family: 'Inter', system-ui, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow-x: hidden;
    }
    .site-viewport {
      position: relative;
      width: 100%;
      max-width: ${exportW}px;
      margin: 0 auto;
    }
    .site-viewport svg {
      display: block;
      width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <main class="site-viewport">
    ${svgContent}
  </main>
</body>
</html>`;

    const blob = new Blob([cleanHtml], { type: 'text/html' });
    const link = document.createElement('a');
    link.download = 'index.html';
    link.href = URL.createObjectURL(blob);
    link.click();
    setIsExportMenuOpen(false);
    showToast('Downloaded clean production index.html (zero Studio UI — ready for Netlify / Vercel / Firebase)!');
  }, [objects, gridSettings, buildSvgString, showToast]);

  const handleLaunchPublishedSiteView = useCallback(() => {
    setIsPublishModalOpen(false);
    setIsExportMenuOpen(false);
    setSelectedIds([]);
    setSelectedSliceId(null);
    setGridSettings((prev) => ({
      ...prev,
      canvasViewMode: 'preview',
      showSlices: false,
    }));
    setIsPublishedSiteView(true);
    showToast('Launched Clean Published View — Studio UI & Share button hidden (Press Esc to return)');
  }, [showToast]);

  // Web Slice & Multi-Scale Retina ZIP Exporter Handlers
  const handleAddSlice = useCallback(
    (newSlice: CanvasSlice) => {
      setSlices((prev) => [...prev, newSlice]);
      setSelectedSliceId(newSlice.id);
      setGridSettings((prev) => ({ ...prev, showSlices: true }));
      showToast(`Added Web Slice "${newSlice.name}" (${newSlice.width}×${newSlice.height}px)`);
    },
    [showToast]
  );

  const handleUpdateSlice = useCallback(
    (sliceId: string, patch: Partial<CanvasSlice>) => {
      setSlices((prev) =>
        prev.map((s) => (s.id === sliceId ? { ...s, ...patch } : s))
      );
    },
    []
  );

  const handleDeleteSlice = useCallback(
    (sliceId: string) => {
      setSlices((prev) => prev.filter((s) => s.id !== sliceId));
      setSelectedSliceId((prev) => (prev === sliceId ? null : prev));
      showToast('Removed Web Slice overlay');
    },
    [showToast]
  );

  const handleAddSliceFromSelection = useCallback(() => {
    const target = objects.find((o) => selectedIds.includes(o.id));
    if (!target) {
      showToast('Select an object on canvas first to create a slice');
      return;
    }
    const slug = target.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'component-slice';
    const newSlice: CanvasSlice = {
      id: `slice-${Date.now()}`,
      name: `${slug}-${slices.length + 1}`,
      x: Math.max(0, Math.round(target.x - 4)),
      y: Math.max(0, Math.round(target.y - 4)),
      width: Math.max(16, Math.round(target.width + 8)),
      height: Math.max(16, Math.round(target.height + 8)),
      formats: ['webp', 'avif', 'svg'],
      scales: [1, 2, 3],
      targetObjectId: target.id,
    };
    handleAddSlice(newSlice);
  }, [objects, selectedIds, slices.length, handleAddSlice, showToast]);

  const handleExportSlicesZip = useCallback(async () => {
    const activeSlices =
      slices.length > 0
        ? slices
        : [
            {
              id: 'slice-full-canvas',
              name: 'full-canvas',
              x: 0,
              y: 0,
              width: gridSettings.canvasWidth,
              height: gridSettings.canvasHeight,
              formats: ['webp', 'avif', 'svg'] as Array<'webp' | 'avif' | 'svg' | 'png'>,
              scales: [1, 2, 3] as Array<1 | 2 | 3>,
            },
          ];
    showToast(`Packaging ${activeSlices.length} slice(s) (@1x/@2x/@3x WebP + AVIF + SVG)...`);
    const { blob, filename, fileCount } = await exportSlicesToMultiScaleZip({
      slices: activeSlices,
      objects,
      autoShapes: allAutoShapes,
      renderObjectToCtx: (ctx, obj, defs) => renderCanvasObjectToContext(ctx, obj, defs),
    });
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    setIsExportMenuOpen(false);
    showToast(`Exported ${fileCount} retina assets in ${filename}!`);
  }, [slices, gridSettings.canvasWidth, gridSettings.canvasHeight, objects, allAutoShapes, showToast]);

  const handleExportFullReactTailwindAppZip = useCallback(async () => {
    showToast('Packaging runnable Vite + React 19 + Tailwind CSS repository (.ZIP)...');
    const resolvedCanvasBg =
      gridSettings.canvasBackground === 'white'
        ? '#ffffff'
        : gridSettings.canvasBackground === 'light-checker'
        ? '#f8fafc'
        : '#0b0f19';
    const { blob, filename, fileCount } = await exportFullReactTailwindAppZip({
      objects,
      slices,
      autoShapes: allAutoShapes,
      canvasWidth: gridSettings.canvasWidth,
      canvasHeight: gridSettings.canvasHeight,
      canvasBgColor: resolvedCanvasBg,
    });
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    setIsExportMenuOpen(false);
    showToast(
      `Exported runnable React + Tailwind App (${fileCount} files in ${filename}) — unzip & run "npm install && npm run dev"!`
    );
  }, [
    objects,
    slices,
    allAutoShapes,
    gridSettings.canvasWidth,
    gridSettings.canvasHeight,
    gridSettings.canvasBackground,
    showToast,
  ]);

  // AI Smart Background Removal & Bitmap-to-Bezier Vectorization
  const handleSmartRemoveBackground = useCallback(async () => {
    const targetBmp =
      (objects.find(
        (o) =>
          o.type === 'bitmap' &&
          (selectedIds.includes(o.id) || pixelSelection.targetBitmapId === o.id)
      ) as BitmapObject | undefined) ||
      (objects.find((o) => o.type === 'bitmap') as BitmapObject | undefined);

    if (!targetBmp) {
      showToast('Select or import a Bitmap layer first');
      return;
    }
    recordHistorySnapshot();
    const { imageDataUrl, removedPixels } = await smartRemoveBitmapBackground(
      targetBmp,
      toolOptions.wandTolerance || 38
    );
    handleUpdateObject(targetBmp.id, { imageDataUrl } as Partial<BitmapObject>, false);
    showToast(`Smart BG Removal knocked out ${removedPixels.toLocaleString()} background pixels!`);
  }, [objects, selectedIds, pixelSelection.targetBitmapId, toolOptions.wandTolerance, recordHistorySnapshot, handleUpdateObject, showToast]);

  const handleVectorizeSelectionToBezier = useCallback(async () => {
    const targetBmp =
      (objects.find(
        (o) =>
          o.type === 'bitmap' &&
          (selectedIds.includes(o.id) || pixelSelection.targetBitmapId === o.id)
      ) as BitmapObject | undefined) ||
      (objects.find((o) => o.type === 'bitmap') as BitmapObject | undefined);

    if (!targetBmp) {
      showToast('Select a Bitmap layer or Magic Wand pixel region to vectorize');
      return;
    }
    recordHistorySnapshot();
    const tracedVector = await vectorizeBitmapSelectionToBezier(targetBmp, pixelSelection, 2.2);
    setObjects((prev) => [...prev, tracedVector]);
    setSelectedIds([tracedVector.id]);
    setSelectedNodeIds(tracedVector.nodes.map((n) => n.id));
    setActiveTool('subselect');
    showToast(`Traced bitmap selection into Cubic Bezier Vector (${tracedVector.nodes.length} nodes)!`);
  }, [objects, selectedIds, pixelSelection, recordHistorySnapshot, showToast]);

  // Interactive Component States (Default / :hover / :active / Dark Mode)
  const handleSelectComponentState = useCallback(
    (stateId: ComponentStateId) => {
      const target = objects.find((o) => selectedIds.includes(o.id));
      if (!target) return;
      const variants = target.stateVariants || generateSmartStateVariants(target);
      handleUpdateObject(
        target.id,
        {
          activeState: stateId,
          stateVariants: variants,
        },
        false
      );
      showToast(`Previewing "${target.name}" in [${stateId.toUpperCase()}] state`);
    },
    [objects, selectedIds, handleUpdateObject, showToast]
  );

  const handleAutoGenerateComponentStates = useCallback(() => {
    const target = objects.find((o) => selectedIds.includes(o.id));
    if (!target) {
      showToast('Select an AutoShape or Vector object first');
      return;
    }
    recordHistorySnapshot();
    const variants = generateSmartStateVariants(target);
    handleUpdateObject(
      target.id,
      {
        activeState: target.activeState || 'hover',
        stateVariants: variants,
      },
      false
    );
    showToast(`Linked Default / :hover / :active / Dark Mode states for "${target.name}"!`);
  }, [objects, selectedIds, recordHistorySnapshot, handleUpdateObject, showToast]);

  const selectedObjects = React.useMemo(
    () => objects.filter((o) => selectedIds.includes(o.id)),
    [objects, selectedIds]
  );

  const selectedAutoShapeObject = React.useMemo(
    () =>
      (selectedObjects.find((o) => o.type === 'autoshape') as AutoShapeObject | undefined) || null,
    [selectedObjects]
  );

  // Complete Macromedia Fireworks MX Cross-Platform Keyboard Shortcuts Catalog (Windows & macOS)
  const fireworksShortcutsList: ShortcutItem[] = React.useMemo(
    () => [
      // 0. Omnibar & Deep Research
      {
        id: 'omnibar-command-palette',
        category: 'Omnibar & Deep Research',
        label: 'Omnibar Command Palette & Instant Deep Research',
        description:
          'Open the universal Ctrl+K Omnibar to run Deep Research, spawn 1-Click Vector Websites, or Auto-Polish Canvas',
        winKeys: ['Ctrl', 'K'],
        macKeys: ['⌘', 'K'],
        action: () => {
          setIsShortcutsModalOpen(false);
          setIsCommandPaletteOpen(true);
        },
      },
      {
        id: 'deep-research-studio',
        category: 'Omnibar & Deep Research',
        label: 'Deep Research & Strategy Co-Pilot Studio',
        description:
          'Synthesize ICP personas, competitor teardowns, conversion architecture, and 1-Click Executive Strategy Boards',
        winKeys: ['Ctrl', 'K'],
        macKeys: ['⌘', 'K'],
        action: () => {
          setIsShortcutsModalOpen(false);
          openCreationStudioTab('deep-research' as CreationStudioTab);
        },
      },
      {
        id: 'auto-polish-canvas',
        category: 'Omnibar & Deep Research',
        label: '1-Click Auto-Polish Canvas (WCAG + Hover + 1px Snap)',
        description:
          'Automatically repair low-contrast text, add interactive :hover/:active variants, and snap coordinates to 1px grid',
        winKeys: ['Ctrl', 'K'],
        macKeys: ['⌘', 'K'],
        action: () => {
          setIsShortcutsModalOpen(false);
          handleAutoPolishCanvas();
        },
      },

      // 1. Clipboard & Cloning
      {
        id: 'copy',
        category: 'Clipboard & Cloning',
        label: 'Copy Selection',
        description: 'Copy active bitmap pixel marquee selection, canvas object(s), or Web Slice to clipboard',
        winKeys: ['Ctrl', 'C'],
        macKeys: ['⌘', 'C'],
        action: handleCopySelection,
      },
      {
        id: 'cut',
        category: 'Clipboard & Cloning',
        label: 'Cut Selection',
        description: 'Cut active bitmap pixel marquee selection (leaving transparent alpha), object(s), or Web Slice to clipboard',
        winKeys: ['Ctrl', 'X'],
        macKeys: ['⌘', 'X'],
        action: handleCutSelection,
      },
      {
        id: 'paste-in-place',
        category: 'Clipboard & Cloning',
        label: 'Paste in Place (On Top)',
        description: 'Fireworks MX signature: pastes copied bitmap pixels or object(s) as a new layer at exact X,Y coordinates on top',
        winKeys: ['Ctrl', 'V'],
        macKeys: ['⌘', 'V'],
        action: () => handlePasteSelection('in-place'),
      },
      {
        id: 'paste-offset-above',
        category: 'Clipboard & Cloning',
        label: 'Paste Offset Above (Down & Right)',
        description: 'Places pasted object(s) on top of stack shifted down and right (+16px, +16px)',
        winKeys: ['Ctrl', 'Shift', 'V'],
        macKeys: ['⌘', '⇧', 'V'],
        action: () => handlePasteSelection('offset-above'),
      },
      {
        id: 'clone-in-place',
        category: 'Clipboard & Cloning',
        label: 'Clone in Place (Edit > Clone)',
        description: 'Immediately clones selected object(s) in place (0px offset) on top of stack',
        winKeys: ['Ctrl', 'Shift', 'D'],
        macKeys: ['⌘', '⇧', 'D'],
        action: handleCloneSelectedInPlace,
      },
      {
        id: 'duplicate-offset',
        category: 'Clipboard & Cloning',
        label: 'Duplicate Offset (Edit > Duplicate)',
        description: 'Immediately duplicates selected object(s) shifted down & right (+16px, +16px)',
        winKeys: ['Ctrl', 'Alt', 'D'],
        macKeys: ['⌘', '⌥', 'D'],
        action: handleDuplicateSelectedOffset,
      },

      // 2. Arrange & Layers
      {
        id: 'bring-to-front',
        category: 'Arrange & Layers',
        label: 'Bring to Front',
        description: 'Move selected object(s) to the very top of the layer stack',
        winKeys: ['Ctrl', 'Shift', ']'],
        macKeys: ['⌘', '⇧', ']'],
        action: () => {
          if (selectedIds[0]) handleReorderObject(selectedIds[0], 'top');
        },
      },
      {
        id: 'bring-forward',
        category: 'Arrange & Layers',
        label: 'Bring Forward',
        description: 'Move selected object(s) up one level in the layer stack',
        winKeys: ['Ctrl', ']'],
        macKeys: ['⌘', ']'],
        action: () => {
          if (selectedIds[0]) handleReorderObject(selectedIds[0], 'up');
        },
      },
      {
        id: 'send-backward',
        category: 'Arrange & Layers',
        label: 'Send Backward',
        description: 'Move selected object(s) down one level in the layer stack',
        winKeys: ['Ctrl', '['],
        macKeys: ['⌘', '['],
        action: () => {
          if (selectedIds[0]) handleReorderObject(selectedIds[0], 'down');
        },
      },
      {
        id: 'send-to-back',
        category: 'Arrange & Layers',
        label: 'Send to Back',
        description: 'Move selected object(s) to the bottom of the layer stack',
        winKeys: ['Ctrl', 'Shift', '['],
        macKeys: ['⌘', '⇧', '['],
        action: () => {
          if (selectedIds[0]) handleReorderObject(selectedIds[0], 'bottom');
        },
      },
      {
        id: 'lock-layer',
        category: 'Arrange & Layers',
        label: 'Lock / Unlock Selected Layer',
        description: 'Toggle lock status on selected canvas object(s)',
        winKeys: ['Ctrl', 'L'],
        macKeys: ['⌘', 'L'],
      },
      {
        id: 'hide-layer',
        category: 'Arrange & Layers',
        label: 'Show / Hide Selected Layer',
        description: 'Toggle visibility on selected canvas object(s)',
        winKeys: ['Ctrl', 'Shift', 'H'],
        macKeys: ['⌘', '⇧', 'H'],
      },

      // 3. Select, Path & Pixels
      {
        id: 'undo',
        category: 'Select, Path & Pixels',
        label: 'Undo',
        description: 'Step backward in canvas history',
        winKeys: ['Ctrl', 'Z'],
        macKeys: ['⌘', 'Z'],
        action: handleUndo,
      },
      {
        id: 'redo',
        category: 'Select, Path & Pixels',
        label: 'Redo',
        description: 'Step forward in canvas history',
        winKeys: ['Ctrl', 'Y'],
        macKeys: ['⌘', '⇧', 'Z'],
        action: handleRedo,
      },
      {
        id: 'select-all',
        category: 'Select, Path & Pixels',
        label: 'Select All (Objects or Pixels)',
        description: 'Select all unlocked objects (or all pixels in Bitmap Marquee mode)',
        winKeys: ['Ctrl', 'A'],
        macKeys: ['⌘', 'A'],
      },
      {
        id: 'deselect',
        category: 'Select, Path & Pixels',
        label: 'Deselect All / Exit Marquee',
        description: 'Clear active Marching Ants pixel selection or deselect canvas objects',
        winKeys: ['Ctrl', 'D'],
        macKeys: ['⌘', 'D'],
      },
      {
        id: 'invert-selection',
        category: 'Select, Path & Pixels',
        label: 'Select Inverse',
        description: 'Invert active pixel marquee selection or invert selected canvas objects',
        winKeys: ['Ctrl', 'Shift', 'I'],
        macKeys: ['⌘', '⇧', 'I'],
      },
      {
        id: 'convert-to-paths',
        category: 'Select, Path & Pixels',
        label: 'Ungroup / Convert AutoShape to Paths',
        description: 'Flatten parametric AutoShape into editable Cubic Bezier anchor nodes',
        winKeys: ['Ctrl', 'Shift', 'P'],
        macKeys: ['⌘', '⇧', 'P'],
        action: () => {
          if (selectedIds[0]) handleConvertAutoShapeToPaths(selectedIds[0]);
        },
      },
      {
        id: 'flatten-selection',
        category: 'Select, Path & Pixels',
        label: 'Flatten Selection to Bitmap',
        description: 'Fireworks MX Modify > Flatten Selection: rasterize vector/AutoShape to pixels',
        winKeys: ['Ctrl', 'Alt', 'Shift', 'Z'],
        macKeys: ['⌘', '⌥', '⇧', 'Z'],
        action: () => {
          if (selectedIds[0]) handleRasterizeObject(selectedIds[0]);
        },
      },
      {
        id: 'nudge-1px',
        category: 'Select, Path & Pixels',
        label: 'Nudge Selection 1px (or 10px)',
        description: 'Use Arrow keys for 1px nudge, or Shift + Arrow keys for 10px nudge',
        winKeys: ['Arrows', 'Shift+Arrows'],
        macKeys: ['Arrows', '⇧+Arrows'],
      },

      // 4. Tools (Single Key — Classic Fireworks MX)
      {
        id: 'tool-pointer',
        category: 'Tools (Single Key)',
        label: 'Pointer Tool',
        description: 'Select, move, resize & manipulate yellow AutoShape handles',
        winKeys: ['V', '0'],
        macKeys: ['V', '0'],
        action: () => handleSelectTool('pointer'),
      },
      {
        id: 'tool-select-behind',
        category: 'Tools (Single Key)',
        label: 'Select Behind Tool',
        description: 'Click through overlapping objects to select layers underneath',
        winKeys: ['Shift', 'V'],
        macKeys: ['⇧', 'V'],
        action: () => handleSelectTool('select-behind'),
      },
      {
        id: 'tool-subselect',
        category: 'Tools (Single Key)',
        label: 'Subselection Tool',
        description: 'Direct Cubic Bezier anchor point & control handle editor',
        winKeys: ['A', '1'],
        macKeys: ['A', '1'],
        action: () => handleSelectTool('subselect'),
      },
      {
        id: 'tool-scale',
        category: 'Tools (Single Key)',
        label: 'Scale / Free Transform Tool',
        description: 'Scale, rotate, and transform objects or floating pixels',
        winKeys: ['Q'],
        macKeys: ['Q'],
        action: () => handleSelectTool('scale'),
      },
      {
        id: 'tool-crop',
        category: 'Tools (Single Key)',
        label: 'Crop Tool',
        description: 'Trim canvas bounds or crop selected bitmap layer',
        winKeys: ['C'],
        macKeys: ['C'],
        action: () => handleSelectTool('crop'),
      },
      {
        id: 'tool-connector',
        category: 'Tools (Single Key)',
        label: 'Smart Connector Tool',
        description: 'Draw auto-routing Lucidchart/Fireworks connectors between N/E/S/W ports',
        winKeys: ['X'],
        macKeys: ['X'],
        action: () => handleSelectTool('connector'),
      },
      {
        id: 'tool-marquee',
        category: 'Tools (Single Key)',
        label: 'Marquee Tool (Cycle Rect / Oval)',
        description: 'Press M to select Rectangular Marquee; press M again for Oval Marquee',
        winKeys: ['M'],
        macKeys: ['M'],
        action: () =>
          handleSelectTool(activeTool === 'marquee-rect' ? 'marquee-oval' : 'marquee-rect'),
      },
      {
        id: 'tool-lasso',
        category: 'Tools (Single Key)',
        label: 'Lasso Pixel Selection Tool',
        description: 'Freehand pixel selection marquee',
        winKeys: ['L'],
        macKeys: ['L'],
        action: () => handleSelectTool('lasso'),
      },
      {
        id: 'tool-wand',
        category: 'Tools (Single Key)',
        label: 'Magic Wand Tool',
        description: 'Flood-select contiguous or global pixels by color tolerance',
        winKeys: ['W'],
        macKeys: ['W'],
        action: () => handleSelectTool('magic-wand'),
      },
      {
        id: 'tool-brush',
        category: 'Tools (Single Key)',
        label: 'Pixel Brush Tool',
        description: 'Paint soft or hard strokes on bitmap layers (use [ and ] to resize)',
        winKeys: ['B'],
        macKeys: ['B'],
        action: () => handleSelectTool('brush'),
      },
      {
        id: 'tool-pencil',
        category: 'Tools (Single Key)',
        label: '1px Pixel Pencil Tool',
        description: 'Crisp anti-aliased or 1px pixel-art drawing',
        winKeys: ['Y'],
        macKeys: ['Y'],
        action: () => handleSelectTool('pencil'),
      },
      {
        id: 'tool-eraser',
        category: 'Tools (Single Key)',
        label: 'Pixel Eraser Tool',
        description: 'Erase bitmap pixels to transparency (use [ and ] to resize)',
        winKeys: ['E'],
        macKeys: ['E'],
        action: () => handleSelectTool('eraser'),
      },
      {
        id: 'tool-bucket',
        category: 'Tools (Single Key)',
        label: 'Paint Bucket Fill Tool',
        description: 'Flood-fill bitmap regions or recolor vector objects',
        winKeys: ['G'],
        macKeys: ['G'],
        action: () => handleSelectTool('bucket'),
      },
      {
        id: 'tool-eyedropper',
        category: 'Tools (Single Key)',
        label: 'Eyedropper Color Picker',
        description: 'Sample exact hex color from any pixel or vector on canvas',
        winKeys: ['I'],
        macKeys: ['I'],
        action: () => handleSelectTool('eyedropper'),
      },
      {
        id: 'tool-pen',
        category: 'Tools (Single Key)',
        label: 'Cubic Bezier Pen Tool',
        description: 'Plot precision vector anchor nodes and smooth tangent handles',
        winKeys: ['P'],
        macKeys: ['P'],
        action: () => handleSelectTool('pen'),
      },
      {
        id: 'tool-line',
        category: 'Tools (Single Key)',
        label: 'Vector Line Tool',
        description: 'Draw crisp vector line segments',
        winKeys: ['N'],
        macKeys: ['N'],
        action: () => handleSelectTool('line'),
      },
      {
        id: 'tool-shapes',
        category: 'Tools (Single Key)',
        label: 'Rectangle / Ellipse / AutoShape (Cycle)',
        description: 'Press U repeatedly to cycle Rectangle → Ellipse → Smart AutoShape',
        winKeys: ['U', 'O'],
        macKeys: ['U', 'O'],
        action: () => handleSelectTool('rect'),
      },
      {
        id: 'tool-text',
        category: 'Tools (Single Key)',
        label: 'Typography Text Tool',
        description: 'Insert and style vector typography layers',
        winKeys: ['T'],
        macKeys: ['T'],
        action: () => handleSelectTool('text'),
      },
      {
        id: 'tool-slice',
        category: 'Tools (Single Key)',
        label: 'Web Slice Tool & Overlay',
        description: 'Draw and edit Multi-Scale Retina Web Slices (@1x/@2x/@3x)',
        winKeys: ['K', '2'],
        macKeys: ['K', '2'],
        action: () => {
          setGridSettings((prev) => ({ ...prev, showSlices: true, canvasViewMode: 'slice' }));
          handleSelectTool('slice');
        },
      },
      {
        id: 'tool-hand-zoom',
        category: 'Tools (Single Key)',
        label: 'Hand Pan (H / Space) & Zoom (Z)',
        description: 'Press H (or hold Spacebar) to pan; press Z to zoom',
        winKeys: ['H', 'Space', 'Z'],
        macKeys: ['H', 'Space', 'Z'],
        action: () => handleSelectTool('hand'),
      },
      {
        id: 'swap-colors',
        category: 'Tools (Single Key)',
        label: 'Swap Fill & Stroke Colors / Default Colors',
        description: 'Press Shift+X to swap Fill & Stroke; press D to reset default swatches',
        winKeys: ['Shift+X', 'D'],
        macKeys: ['⇧+X', 'D'],
      },

      // 5. View, Zoom & Grids
      {
        id: 'view-preview',
        category: 'View, Zoom & Grids',
        label: 'Toggle Live Preview Mode',
        description: 'Test interactive AutoShapes and cascading Nested Menus on canvas',
        winKeys: ['F12', '3'],
        macKeys: ['F12', '3'],
        action: () =>
          setGridSettings((prev) => ({
            ...prev,
            canvasViewMode: prev.canvasViewMode === 'preview' ? 'design' : 'preview',
            showSlices: false,
          })),
      },
      {
        id: 'zoom-in-out',
        category: 'View, Zoom & Grids',
        label: 'Zoom In / Zoom Out / Reset 100%',
        description: 'Step magnification up/down or reset to 100% actual pixel view',
        winKeys: ['Ctrl++', 'Ctrl+-', 'Ctrl+0'],
        macKeys: ['⌘++', '⌘+-', '⌘+0'],
      },
      {
        id: 'zoom-presets',
        category: 'View, Zoom & Grids',
        label: 'Fireworks Magnification Presets (50%–800%)',
        description: 'Ctrl+1 (100%), Ctrl+2 (200%), Ctrl+3 (300%), Ctrl+4 (400%), Ctrl+5 (50%), Ctrl+8 (800%)',
        winKeys: ['Ctrl+1..8'],
        macKeys: ['⌘+1..8'],
      },
      {
        id: 'toggle-grid-rulers',
        category: 'View, Zoom & Grids',
        label: 'Toggle Grid, Snap to Grid & Rulers',
        description: "Ctrl+' (Grid), Ctrl+Shift+' (Snap to Grid), Ctrl+Alt+R (Rulers), Tab (Tips)",
        winKeys: ["Ctrl+'", 'Ctrl+Alt+R', 'Tab'],
        macKeys: ["⌘+'", '⌘+⌥+R', 'Tab'],
      },

      // 6. File & Studios
      {
        id: 'quick-save',
        category: 'File & Studios',
        label: 'Save to Browser / Save .osito.json Bundle',
        description: 'Ctrl+S saves browser snapshot; Ctrl+Shift+S downloads .osito.json bundle',
        winKeys: ['Ctrl+S', 'Ctrl+Shift+S'],
        macKeys: ['⌘+S', '⌘+⇧+S'],
        action: handleQuickSaveToBrowser,
      },
      {
        id: 'import-file',
        category: 'File & Studios',
        label: 'Import File (PNG, SVG, JS, CSV, JSON)',
        description: 'Open universal multi-file import dialog',
        winKeys: ['Ctrl', 'I'],
        macKeys: ['⌘', 'I'],
        action: () => triggerFileImportDialog('all'),
      },
      {
        id: 'quick-export',
        category: 'File & Studios',
        label: 'Quick Export PNG @1x',
        description: 'Immediately render and download crisp PNG @1x',
        winKeys: ['Ctrl', 'Shift', 'E'],
        macKeys: ['⌘', '⇧', 'E'],
        action: handleExportPng,
      },
      {
        id: 'open-studios',
        category: 'File & Studios',
        label: 'JS AutoShape Studio (F9) & Creation Studio (F10)',
        description: 'Open Programmable JS AutoShape Studio (F9) or Logo/Layout/Theme Studio (F10)',
        winKeys: ['F9', 'F10'],
        macKeys: ['F9', 'F10'],
        action: () => openCreationStudioTab('web-layout'),
      },
    ],
    [
      handleCopySelection,
      handleCutSelection,
      handlePasteSelection,
      handleCloneSelectedInPlace,
      handleDuplicateSelectedOffset,
      selectedIds,
      handleReorderObject,
      handleUndo,
      handleRedo,
      handleConvertAutoShapeToPaths,
      handleRasterizeObject,
      handleSelectTool,
      activeTool,
      handleQuickSaveToBrowser,
      triggerFileImportDialog,
      handleExportPng,
      openCreationStudioTab,
      handleAutoPolishCanvas,
    ]
  );

  // Global Macromedia Fireworks MX Keyboard Shortcuts Engine (Windows Ctrl/Alt & macOS ⌘/⌥)
  useEffect(() => {
    const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 6, 8, 12, 16];

    const onKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      const code = e.code;
      const k = e.key.toLowerCase();

      // Universal Omnibar Command Palette & Deep Research Launcher (Ctrl+K / ⌘+K)
      // Works anywhere (even when no object is selected or inside an input)
      if (isCmdOrCtrl && (k === 'k' || code === 'KeyK') && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      const targetEl = e.target as HTMLElement | null;
      const activeEl = document.activeElement as HTMLElement | null;
      const checkEditable = (el: HTMLElement | null): boolean => {
        if (!el) return false;
        const tag = el.tagName;
        return (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          el.isContentEditable ||
          Boolean(el.closest?.('input, textarea, select, [contenteditable="true"]'))
        );
      };
      const isEditableInput = checkEditable(targetEl) || checkEditable(activeEl);

      // Guard: Never hijack typing, Backspace/Delete, Ctrl+Z/C/X/V/A/D, or tool hotkeys inside any input/textarea/select/contentEditable!
      if (isEditableInput) {
        if (e.key === 'Escape') {
          if (isCommandPaletteOpen) {
            setIsCommandPaletteOpen(false);
          } else {
            activeEl?.blur?.();
          }
        }
        return;
      }

      // Allow F1 or Ctrl+/ (⌘+/) anywhere outside inputs to toggle Shortcuts Modal
      if (e.key === 'F1' || (isCmdOrCtrl && (e.key === '/' || code === 'Slash'))) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }

      // Handle Escape when any studio modal or dropdown menu is open
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
          return;
        }
        if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
          return;
        }
        if (isCreationStudioOpen) {
          setIsCreationStudioOpen(false);
          return;
        }
        if (isPublishModalOpen) {
          setIsPublishModalOpen(false);
          return;
        }
        if (isCodeStudioOpen) {
          setIsCodeStudioOpen(false);
          return;
        }
        if (isPublishedSiteView) {
          setIsPublishedSiteView(false);
          setGridSettings((prev) => ({ ...prev, canvasViewMode: 'design' }));
          showToast('Returned to Studio Editor from Published Site View');
          return;
        }
        setIsImportMenuOpen(false);
        setIsSaveMenuOpen(false);
        setIsCreateMenuOpen(false);
        setIsExportMenuOpen(false);
        setIsSettingsMenuOpen(false);
        if (pixelSelection.active) {
          setPixelSelection(createEmptyPixelSelection());
          showToast('Cleared Marching Ants pixel selection');
          return;
        }
        if (selectedIds.length > 0 || selectedSliceId) {
          setSelectedIds([]);
          setSelectedSliceId(null);
          showToast('Deselected all');
        }
        handleSelectTool('pointer');
        return;
      }

      // If any modal dialog is open, do not trigger background canvas shortcuts
      if (
        isCommandPaletteOpen ||
        isCodeStudioOpen ||
        isCreationStudioOpen ||
        isPublishModalOpen ||
        isShortcutsModalOpen
      ) {
        return;
      }

      // Handle Ctrl/⌘ + '+' / '=' (Zoom In), '-' (Zoom Out), '0' (Reset 100%) globally so browser UI doesn't zoom
      if (isCmdOrCtrl && !e.altKey) {
        if (
          e.key === '+' ||
          e.key === '=' ||
          code === 'Equal' ||
          code === 'NumpadAdd'
        ) {
          e.preventDefault();
          setGridSettings((prev) => {
            const nextStep =
              ZOOM_STEPS.find((s) => s > prev.zoom + 0.01) ??
              Math.min(16, Number((prev.zoom * 1.25).toFixed(2)));
            showToast(`Zoom In: ${Math.round(nextStep * 100)}%`);
            return { ...prev, zoom: nextStep };
          });
          return;
        }

        if (
          e.key === '-' ||
          e.key === '_' ||
          code === 'Minus' ||
          code === 'NumpadSubtract'
        ) {
          e.preventDefault();
          setGridSettings((prev) => {
            const prevStep =
              [...ZOOM_STEPS].reverse().find((s) => s < prev.zoom - 0.01) ??
              Math.max(0.25, Number((prev.zoom * 0.8).toFixed(2)));
            showToast(`Zoom Out: ${Math.round(prevStep * 100)}%`);
            return { ...prev, zoom: prevStep };
          });
          return;
        }

        if (e.key === '0' || code === 'Digit0' || code === 'Numpad0') {
          e.preventDefault();
          setGridSettings((prev) => ({ ...prev, zoom: 1, panX: 0, panY: 0 }));
          showToast('Reset Zoom: 100% (Actual Pixels)');
          return;
        }
      }

      // Function Keys: F9 (JS AutoShape Studio), F10 (Creation Studio), F12 (Preview Mode)
      if (e.key === 'F9') {
        e.preventDefault();
        setIsCodeStudioOpen((prev) => !prev);
        return;
      }
      if (e.key === 'F10') {
        e.preventDefault();
        setIsCreationStudioOpen((prev) => !prev);
        return;
      }
      if (e.key === 'F12' || (isCmdOrCtrl && e.key === 'Enter')) {
        e.preventDefault();
        setGridSettings((prev) => {
          const nextMode = prev.canvasViewMode === 'preview' ? 'design' : 'preview';
          showToast(
            nextMode === 'preview'
              ? 'Live Preview Mode (F12): Click navbars & interactive AutoShapes on canvas!'
              : 'Returned to Design View Mode'
          );
          return { ...prev, canvasViewMode: nextMode, showSlices: false };
        });
        return;
      }

      // Hold Spacebar for Temporary Hand Pan Tool
      if (e.code === 'Space' && !isCmdOrCtrl && !e.altKey) {
        e.preventDefault();
        if (activeTool !== 'hand') {
          tempHandPrevToolRef.current = activeTool;
          setActiveTool('hand');
        }
        return;
      }

      // Tab: Toggle Contextual Tool Tips Bar
      if (e.key === 'Tab' && !isCmdOrCtrl && !e.altKey) {
        e.preventDefault();
        setGridSettings((prev) => {
          const nextTips = prev.showToolHints === false ? true : false;
          showToast(`Contextual Tool Tips: ${nextTips ? 'ON' : 'OFF'} (Tab)`);
          return { ...prev, showToolHints: nextTips };
        });
        return;
      }

      // =====================================================================
      // CTRL / ⌘ SHORTCUTS (Windows & macOS)
      // =====================================================================
      if (isCmdOrCtrl) {
        // 1. Copy: Ctrl+C / ⌘+C
        if ((k === 'c' || code === 'KeyC') && !e.shiftKey && !e.altKey) {
          e.preventDefault();
          handleCopySelection();
          return;
        }

        // 2. Cut: Ctrl+X / ⌘+X
        if ((k === 'x' || code === 'KeyX') && !e.shiftKey && !e.altKey) {
          e.preventDefault();
          handleCutSelection();
          return;
        }

        // 3. Paste in Place (Ctrl+V / ⌘+V) vs Paste Offset Above Down & Right (Ctrl+Shift+V / ⌘+⇧+V)
        if ((k === 'v' || code === 'KeyV') && !e.altKey) {
          e.preventDefault();
          if (e.shiftKey) {
            handlePasteSelection('offset-above');
          } else {
            handlePasteSelection('in-place');
          }
          return;
        }

        // 4. Undo / Redo: Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y, and Flatten Selection (Ctrl+Alt+Shift+Z)
        if (k === 'z' || code === 'KeyZ') {
          e.preventDefault();
          if (e.altKey && e.shiftKey) {
            if (selectedIds[0]) {
              handleRasterizeObject(selectedIds[0]);
            } else {
              showToast('Select a Vector or AutoShape object to Flatten to Bitmap');
            }
            return;
          }
          if (e.shiftKey) handleRedo();
          else handleUndo();
          return;
        }
        if ((k === 'y' || code === 'KeyY') && !e.altKey) {
          e.preventDefault();
          handleRedo();
          return;
        }

        // 5. Clone in Place (Ctrl+Shift+D / ⌘+⇧+D), Duplicate Offset (Ctrl+Alt+D / ⌘+⌥+D), Deselect (Ctrl+D / ⌘+D)
        if (k === 'd' || code === 'KeyD') {
          e.preventDefault();
          if (e.shiftKey && !e.altKey) {
            handleCloneSelectedInPlace();
            return;
          }
          if (e.altKey && !e.shiftKey) {
            handleDuplicateSelectedOffset();
            return;
          }
          if (pixelSelection.active) {
            setPixelSelection(createEmptyPixelSelection());
            showToast('Deselected Marching Ants pixel marquee (Ctrl+D)');
          } else if (selectedIds.length > 0 || selectedSliceId) {
            setSelectedIds([]);
            setSelectedSliceId(null);
            showToast('Deselected all objects (Ctrl+D)');
          }
          return;
        }

        // 6. Select All (Ctrl+A / ⌘+A)
        if ((k === 'a' || code === 'KeyA') && !e.shiftKey && !e.altKey) {
          e.preventDefault();
          if (
            activeTool === 'marquee-rect' ||
            activeTool === 'marquee-oval' ||
            activeTool === 'magic-wand' ||
            activeTool === 'lasso'
          ) {
            const bmp = findTargetBitmap();
            setPixelSelection(
              selectAllPixels(gridSettings.canvasWidth, gridSettings.canvasHeight, bmp?.id || null)
            );
            showToast('Selected all canvas pixels (Ctrl+A)');
          } else {
            const allUnlocked = objects.filter((o) => o.visible && !o.locked).map((o) => o.id);
            setSelectedIds(allUnlocked);
            showToast(`Selected all ${allUnlocked.length} unlocked objects (Ctrl+A)`);
          }
          return;
        }

        // 7. Select Inverse (Ctrl+Shift+I / ⌘+⇧+I) or Import File (Ctrl+I / ⌘+I)
        if (k === 'i' || code === 'KeyI') {
          e.preventDefault();
          if (e.shiftKey) {
            if (pixelSelection.active) {
              setPixelSelection(
                invertPixelSelection(
                  pixelSelection,
                  gridSettings.canvasWidth,
                  gridSettings.canvasHeight
                )
              );
              showToast('Inverted pixel marquee selection (Ctrl+Shift+I)');
            } else {
              const invertedIds = objects
                .filter((o) => o.visible && !o.locked && !selectedIds.includes(o.id))
                .map((o) => o.id);
              setSelectedIds(invertedIds);
              showToast(`Inverted object selection (${invertedIds.length} selected)`);
            }
          } else {
            triggerFileImportDialog('all');
          }
          return;
        }

        // 8. Arrange Z-Order: Ctrl+] / Ctrl+[ / Ctrl+Shift+] / Ctrl+Shift+[ (and Ctrl+ArrowUp / Ctrl+ArrowDown)
        if (
          code === 'BracketRight' ||
          e.key === ']' ||
          e.key === '}' ||
          code === 'ArrowUp'
        ) {
          if (selectedIds.length > 0) {
            e.preventDefault();
            const dir = e.shiftKey ? 'top' : 'up';
            selectedIds.forEach((id) => handleReorderObject(id, dir));
            showToast(
              e.shiftKey
                ? 'Brought selection to Front (Ctrl+Shift+])'
                : 'Brought selection Forward (Ctrl+])'
            );
            return;
          }
        }
        if (
          code === 'BracketLeft' ||
          e.key === '[' ||
          e.key === '{' ||
          code === 'ArrowDown'
        ) {
          if (selectedIds.length > 0) {
            e.preventDefault();
            const dir = e.shiftKey ? 'bottom' : 'down';
            selectedIds.forEach((id) => handleReorderObject(id, dir));
            showToast(
              e.shiftKey
                ? 'Sent selection to Back (Ctrl+Shift+[)'
                : 'Sent selection Backward (Ctrl+[)'
            );
            return;
          }
        }

        // 9. Convert AutoShape to Editable Bezier Paths / Ungroup (Ctrl+Shift+P or Ctrl+Shift+G)
        if (
          ((k === 'p' || code === 'KeyP') && e.shiftKey) ||
          ((k === 'g' || code === 'KeyG') && e.shiftKey && !e.altKey)
        ) {
          e.preventDefault();
          if (selectedIds[0]) {
            handleConvertAutoShapeToPaths(selectedIds[0]);
          } else {
            showToast('Select an AutoShape first to convert to Bezier paths (Ctrl+Shift+P)');
          }
          return;
        }

        // 10. Toggle Grid (Ctrl+Alt+G or Ctrl+') & Snap to Grid (Ctrl+Shift+')
        if ((k === 'g' || code === 'KeyG') && e.altKey) {
          e.preventDefault();
          setGridSettings((prev) => {
            const next = !prev.showMajorGrid;
            showToast(`Layout Grid: ${next ? 'ON' : 'OFF'}`);
            return { ...prev, showMajorGrid: next };
          });
          return;
        }
        if (code === 'Quote' || e.key === "'" || e.key === '"') {
          e.preventDefault();
          if (e.shiftKey) {
            setGridSettings((prev) => {
              const next = !prev.snapToGrid;
              showToast(`Snap to Grid: ${next ? 'ON' : 'OFF'} (Ctrl+Shift+')`);
              return { ...prev, snapToGrid: next };
            });
          } else {
            setGridSettings((prev) => {
              const next = !prev.showMajorGrid;
              showToast(`Layout Grid: ${next ? 'ON' : 'OFF'} (Ctrl+')`);
              return { ...prev, showMajorGrid: next };
            });
          }
          return;
        }

        // 11. Group / Link Component States (Ctrl+G without Shift/Alt)
        if ((k === 'g' || code === 'KeyG') && !e.shiftKey && !e.altKey) {
          e.preventDefault();
          handleAutoGenerateComponentStates();
          return;
        }

        // 12. Toggle Rulers (Ctrl+Alt+R / ⌘+⌥+R)
        if ((k === 'r' || code === 'KeyR') && e.altKey) {
          e.preventDefault();
          setGridSettings((prev) => {
            const next = !prev.showRulers;
            showToast(`Canvas Rulers: ${next ? 'ON' : 'OFF'} (Ctrl+Alt+R)`);
            return { ...prev, showRulers: next };
          });
          return;
        }

        // 13. Toggle Smart Object Alignment Guides (Ctrl+; / ⌘+;)
        if (code === 'Semicolon' || e.key === ';') {
          e.preventDefault();
          setGridSettings((prev) => {
            const next = !prev.snapToObjects;
            showToast(`Smart Alignment Guides: ${next ? 'ON' : 'OFF'} (Ctrl+;)`);
            return { ...prev, snapToObjects: next };
          });
          return;
        }

        // 14. Lock / Unlock Selected Layer (Ctrl+L / ⌘+L)
        if ((k === 'l' || code === 'KeyL') && !e.shiftKey && !e.altKey) {
          if (selectedIds.length > 0) {
            e.preventDefault();
            recordHistorySnapshot();
            setObjects((prev) =>
              prev.map((o) =>
                selectedIds.includes(o.id) ? { ...o, locked: !o.locked } : o
              )
            );
            showToast('Toggled lock on selected layer(s) (Ctrl+L)');
            return;
          }
        }

        // 15. Show / Hide Selected Layer (Ctrl+Shift+H / ⌘+⇧+H)
        if ((k === 'h' || code === 'KeyH') && e.shiftKey && !e.altKey) {
          if (selectedIds.length > 0) {
            e.preventDefault();
            recordHistorySnapshot();
            setObjects((prev) =>
              prev.map((o) =>
                selectedIds.includes(o.id) ? { ...o, visible: !o.visible } : o
              )
            );
            showToast('Toggled visibility on selected layer(s) (Ctrl+Shift+H)');
            return;
          }
        }

        // 16. Float Selected Pixels or Clone Layer (Ctrl+J / ⌘+J)
        if ((k === 'j' || code === 'KeyJ') && !e.shiftKey && !e.altKey) {
          e.preventDefault();
          if (pixelSelection.active) {
            handleFloatSelectedPixels();
          } else {
            handleCloneSelectedInPlace();
          }
          return;
        }

        // 17. Save Workspace (Ctrl+S) or Save .osito.json Project Bundle (Ctrl+Shift+S)
        if (k === 's' || code === 'KeyS') {
          e.preventDefault();
          if (e.shiftKey) {
            handleExportProjectJson();
          } else {
            handleQuickSaveToBrowser();
          }
          return;
        }

        // 18. Quick Export PNG @1x (Ctrl+Shift+E / ⌘+⇧+E)
        if ((k === 'e' || code === 'KeyE') && e.shiftKey) {
          e.preventDefault();
          handleExportPng();
          return;
        }

        // 19. Fireworks MX Magnification Presets: Ctrl+1 (100%), Ctrl+2 (200%), Ctrl+3 (300%), Ctrl+4 (400%), Ctrl+5 (50%), Ctrl+8 (800%)
        const zoomPresetMap: Record<string, number> = {
          Digit1: 1,
          Digit2: 2,
          Digit3: 3,
          Digit4: 4,
          Digit5: 0.5,
          Digit8: 8,
        };
        if (zoomPresetMap[code] !== undefined && !e.shiftKey && !e.altKey) {
          e.preventDefault();
          const targetZoom = zoomPresetMap[code];
          setGridSettings((prev) => ({
            ...prev,
            zoom: targetZoom,
            ...(targetZoom === 1 ? { panX: 0, panY: 0 } : {}),
          }));
          showToast(`Magnification: ${Math.round(targetZoom * 100)}%`);
          return;
        }

        return;
      }

      // =====================================================================
      // DELETE / BACKSPACE & ARROW NUDGE
      // =====================================================================
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (pixelSelection.active) {
          handleDeleteSelectedPixels();
        } else if (selectedIds.length > 0) {
          recordHistorySnapshot();
          setObjects((prev) => prev.filter((o) => !selectedIds.includes(o.id)));
          setSelectedIds([]);
          showToast('Deleted selected object(s)');
        } else if (selectedSliceId) {
          setSlices((prev) => prev.filter((s) => s.id !== selectedSliceId));
          setSelectedSliceId(null);
          showToast('Deleted selected Web Slice');
        }
        return;
      }

      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) &&
        (selectedIds.length > 0 || selectedSliceId)
      ) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        if (selectedIds.length > 0) {
          setObjects((prev) =>
            syncAllConnectors(
              prev.map((o) =>
                selectedIds.includes(o.id) ? { ...o, x: o.x + dx, y: o.y + dy } : o
              )
            )
          );
        } else if (selectedSliceId) {
          setSlices((prev) =>
            prev.map((s) =>
              s.id === selectedSliceId
                ? { ...s, x: Math.max(0, s.x + dx), y: Math.max(0, s.y + dy) }
                : s
            )
          );
        }
        return;
      }

      // =====================================================================
      // SINGLE-KEY FIREWORKS MX TOOL & COLOR SHORTCUTS
      // =====================================================================
      if (!isCmdOrCtrl && !e.altKey) {
        // '?' (Shift + /) opens the Fireworks MX Keyboard Shortcuts Modal
        if (e.key === '?') {
          e.preventDefault();
          setIsShortcutsModalOpen((prev) => !prev);
          return;
        }

        // '[' and ']' adjust Brush / Pencil / Eraser size
        if (e.key === '[' || e.key === ']') {
          const delta = e.key === ']' ? 2 : -2;
          setToolOptions((prev) => {
            const nextSize = Math.max(1, Math.min(128, (prev.brushSize || 8) + delta));
            showToast(`Brush Size: ${nextSize}px (${e.key})`);
            return { ...prev, brushSize: nextSize };
          });
          return;
        }

        // Shift + X: Swap Fill & Stroke Colors (Classic Fireworks MX)
        if (k === 'x' && e.shiftKey) {
          e.preventDefault();
          setToolOptions((prev) => {
            const nextPrimary = prev.secondaryColor;
            const nextSecondary = prev.primaryColor;
            return {
              ...prev,
              primaryColor: nextPrimary,
              secondaryColor: nextSecondary,
            };
          });
          if (selectedIds.length > 0) {
            recordHistorySnapshot();
            setObjects((prev) =>
              prev.map((o) =>
                selectedIds.includes(o.id)
                  ? {
                      ...o,
                      fill: o.stroke !== 'none' ? o.stroke : toolOptions.secondaryColor,
                      stroke: o.fill !== 'none' ? o.fill : toolOptions.primaryColor,
                    }
                  : o
              )
            );
          }
          showToast('Swapped Fill & Stroke colors (Shift+X)');
          return;
        }

        // D: Reset Fill & Stroke to Default Swatches (Classic Fireworks MX)
        if (k === 'd' && !e.shiftKey) {
          setToolOptions((prev) => ({
            ...prev,
            primaryColor: '#06b6d4',
            secondaryColor: '#38bdf8',
          }));
          showToast('Reset Fill & Stroke swatches to Default (D)');
          return;
        }

        // View Mode Keys: 1 (Design), 2 (Slice), 3 (Preview)
        if (k === '1' && !e.shiftKey) {
          setGridSettings((prev) => ({
            ...prev,
            canvasViewMode: 'design',
            showSlices: false,
          }));
          handleSelectTool('pointer');
          showToast('Design View Mode (1)');
          return;
        }
        if (k === '2' && !e.shiftKey) {
          setGridSettings((prev) => {
            const nextShow = !(prev.showSlices !== false);
            showToast(`Web Layer Slices: ${nextShow ? 'ON' : 'OFF'} (2)`);
            return {
              ...prev,
              showSlices: nextShow,
              canvasViewMode: nextShow ? 'slice' : 'design',
            };
          });
          return;
        }
        if (k === '3' && !e.shiftKey) {
          setGridSettings((prev) => {
            const nextMode = prev.canvasViewMode === 'preview' ? 'design' : 'preview';
            showToast(
              nextMode === 'preview'
                ? 'Live Preview Mode (3): Click navbars & interactive AutoShapes!'
                : 'Design View Mode'
            );
            return { ...prev, canvasViewMode: nextMode, showSlices: false };
          });
          return;
        }

        // Tool Selection Keys
        if (k === 'v' && e.shiftKey) handleSelectTool('select-behind');
        else if (k === 'k') {
          setGridSettings((prev) => ({ ...prev, showSlices: true, canvasViewMode: 'slice' }));
          handleSelectTool('slice');
        } else if (k === 'x') handleSelectTool('connector');
        else if (k === 'v' || k === '0') handleSelectTool('pointer');
        else if (k === 'a') handleSelectTool('subselect');
        else if (k === 'q') handleSelectTool('scale');
        else if (k === 'c') handleSelectTool('crop');
        else if (k === 'm') {
          // Cycle Rectangular Marquee <-> Oval Marquee like Fireworks MX
          handleSelectTool(activeTool === 'marquee-rect' ? 'marquee-oval' : 'marquee-rect');
        } else if (k === 'l') handleSelectTool('lasso');
        else if (k === 'w') handleSelectTool('magic-wand');
        else if (k === 'b') handleSelectTool('brush');
        else if (k === 'y') handleSelectTool('pencil');
        else if (k === 'e') handleSelectTool('eraser');
        else if (k === 'g') handleSelectTool('bucket');
        else if (k === 'i') handleSelectTool('eyedropper');
        else if (k === 'n') handleSelectTool('line');
        else if (k === 'p') handleSelectTool('pen');
        else if (k === 'u') {
          // Cycle Rectangle -> Ellipse -> AutoShape like Fireworks MX
          const nextShapeTool: ToolId =
            activeTool === 'rect'
              ? 'ellipse'
              : activeTool === 'ellipse'
              ? 'autoshape'
              : 'rect';
          handleSelectTool(nextShapeTool);
        } else if (k === 'o') handleSelectTool('ellipse');
        else if (k === 't') handleSelectTool('text');
        else if (k === 'h') handleSelectTool('hand');
        else if (k === 'z') handleSelectTool('zoom');
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && tempHandPrevToolRef.current) {
        const prevTool = tempHandPrevToolRef.current;
        tempHandPrevToolRef.current = null;
        setActiveTool(prevTool);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [
    isCommandPaletteOpen,
    isCodeStudioOpen,
    isShortcutsModalOpen,
    isCreationStudioOpen,
    isPublishModalOpen,
    isPublishedSiteView,
    handleCopySelection,
    handleCutSelection,
    handlePasteSelection,
    handleCloneSelectedInPlace,
    handleDuplicateSelectedOffset,
    handleUndo,
    handleRedo,
    activeTool,
    findTargetBitmap,
    gridSettings.canvasWidth,
    gridSettings.canvasHeight,
    objects,
    pixelSelection,
    selectedIds,
    selectedSliceId,
    toolOptions.primaryColor,
    toolOptions.secondaryColor,
    handleDeleteSelectedPixels,
    handleFloatSelectedPixels,
    handleReorderObject,
    handleConvertAutoShapeToPaths,
    handleRasterizeObject,
    handleAutoGenerateComponentStates,
    handleQuickSaveToBrowser,
    handleExportProjectJson,
    handleExportPng,
    triggerFileImportDialog,
    recordHistorySnapshot,
    handleSelectTool,
    showToast,
  ]);

  return (
    <div className="flex flex-col w-screen h-screen bg-[#0c0c0c] text-[#e5e5e5] overflow-hidden select-none rounded-none">
      {/* Top Monochrome Command Header (Hidden in Clean Published Website View so Share & Publish button and Studio bars disappear) */}
      {!isPublishedSiteView && (
      <header
        style={{ zIndex: 999 }}
        className="relative z-[999] h-10 px-2.5 bg-[#141414] border-b border-[#292929] flex items-center justify-between shrink-0 rounded-none"
      >
        {/* Left: Canvas View Mode Switcher (Design | Slice | Preview) & Grid/Backdrop Controls */}
        <div className="flex items-center gap-2">
          {/* Top-Left Canvas View Mode Toggle: Design | Slice | Preview */}
          <div className="flex items-center bg-[#0c0c0c] p-0.5 border border-[#292929] rounded-none">
            <button
              onClick={() => {
                closeAllTopMenus();
                setGridSettings((prev) => ({
                  ...prev,
                  canvasViewMode: 'design',
                  showSlices: false,
                }));
                if (activeTool === 'slice') {
                  handleSelectTool('pointer');
                }
                showToast('Design View: Vector, Bitmap, AutoShape & Smart Connector ports active');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs font-medium transition ${
                (gridSettings.canvasViewMode || 'design') === 'design'
                  ? 'bg-[#e5e5e5] text-[#0a0a0a] font-semibold'
                  : 'text-[#8c8c8c] hover:text-white'
              }`}
              title="Design View Mode — Edit Vector, Bitmap, AutoShapes & Smart Workflow Connectors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Design</span>
            </button>
            <button
              onClick={() => {
                closeAllTopMenus();
                setGridSettings((prev) => ({
                  ...prev,
                  canvasViewMode: 'slice',
                  showSlices: true,
                }));
                handleSelectTool('slice');
                showToast('Slice View: Draw, move & resize Multi-Scale Retina Web Slices (@1x/@2x/@3x)');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs font-medium transition ${
                gridSettings.canvasViewMode === 'slice'
                  ? 'bg-[#e5e5e5] text-[#0a0a0a] font-semibold'
                  : 'text-[#8c8c8c] hover:text-white'
              }`}
              title="Slice View Mode — Draw, select, move & resize Retina Web Slices (@1x/@2x/@3x)"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Slice</span>
            </button>
            <button
              onClick={() => {
                closeAllTopMenus();
                setGridSettings((prev) => ({
                  ...prev,
                  canvasViewMode: 'preview',
                  showSlices: false,
                }));
                showToast('Live Preview Mode: All handles hidden — hover/click objects to test :hover & :active states!');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs font-medium transition ${
                gridSettings.canvasViewMode === 'preview'
                  ? 'bg-[#e5e5e5] text-[#0a0a0a] font-semibold'
                  : 'text-[#8c8c8c] hover:text-white'
              }`}
              title="Live Preview Mode — Clean canvas view with interactive :hover and :active state testing"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          <div className="h-5 w-px bg-[#292929] mx-0.5" />

          {/* Unified Studio Settings & Preferences Dropdown (Rulers, Grid, Snap, Backdrop, Tool Options, Shortcuts) */}
          <div className="flex items-center gap-1.5">
            <div ref={settingsMenuRef} className="relative">
              <button
                type="button"
                onClick={() => toggleTopMenu('settings')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-none border text-xs font-semibold transition ${
                  isSettingsMenuOpen
                    ? 'bg-[#ffffff] text-[#0a0a0a] border-[#ffffff]'
                    : 'bg-[#1c1c1c] hover:bg-[#292929] border-[#484848] text-[#e5e5e5]'
                }`}
                title="Open All Studio Settings & Preferences (Show Rulers, Grids, Snapping, Canvas Backdrop, Dimensions & Tool Defaults)"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
                <ChevronDown className="w-3 h-3 opacity-80" />
              </button>

              {isSettingsMenuOpen && (
                <div
                  style={{ zIndex: 999 }}
                  className="absolute left-0 top-full mt-1 w-96 max-h-[82vh] overflow-y-auto bg-[#121212] border border-[#525252] shadow-2xl z-[999] rounded-none divide-y divide-[#262626] font-mono text-[11px]"
                >
                  {/* Header */}
                  <div className="px-3 py-2 bg-[#181818] flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffffff] flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5" />
                      <span>All Studio Settings &amp; Preferences</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSettingsMenuOpen(false)}
                      className="text-[#a3a3a3] hover:text-white px-1"
                    >
                      ✕
                    </button>
                  </div>

                  {/* 1. View Overlays & Rulers */}
                  <div className="p-2.5 space-y-1.5">
                    <div className="text-[9px] uppercase tracking-wider text-[#a3a3a3] font-semibold">
                      1. View Overlays &amp; Rulers
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setGridSettings((prev) => ({
                            ...prev,
                            showRulers: !prev.showRulers,
                          }))
                        }
                        className={`px-2 py-1.5 border text-left flex items-center justify-between transition ${
                          gridSettings.showRulers
                            ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-bold'
                            : 'bg-[#181818] text-[#a3a3a3] border-[#333333] hover:text-white'
                        }`}
                      >
                        <span>Show Rulers</span>
                        <span>{gridSettings.showRulers ? 'ON' : 'OFF'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setGridSettings((prev) => ({
                            ...prev,
                            showToolHints: prev.showToolHints === false ? true : false,
                          }))
                        }
                        className={`px-2 py-1.5 border text-left flex items-center justify-between transition ${
                          gridSettings.showToolHints !== false
                            ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-bold'
                            : 'bg-[#181818] text-[#a3a3a3] border-[#333333] hover:text-white'
                        }`}
                      >
                        <span>Show Tool Tips</span>
                        <span>{gridSettings.showToolHints !== false ? 'ON' : 'OFF'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setGridSettings((prev) => ({
                            ...prev,
                            showMajorGrid: !prev.showMajorGrid,
                          }))
                        }
                        className={`px-2 py-1.5 border text-left flex items-center justify-between transition ${
                          gridSettings.showMajorGrid
                            ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-bold'
                            : 'bg-[#181818] text-[#a3a3a3] border-[#333333] hover:text-white'
                        }`}
                      >
                        <span>Layout Grid</span>
                        <span>{gridSettings.showMajorGrid ? 'ON' : 'OFF'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setGridSettings((prev) => ({
                            ...prev,
                            showPixelGrid: !prev.showPixelGrid,
                          }))
                        }
                        className={`px-2 py-1.5 border text-left flex items-center justify-between transition ${
                          gridSettings.showPixelGrid
                            ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-bold'
                            : 'bg-[#181818] text-[#a3a3a3] border-[#333333] hover:text-white'
                        }`}
                      >
                        <span>1px Loupe Grid</span>
                        <span>{gridSettings.showPixelGrid ? 'ON' : 'OFF'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setGridSettings((prev) => ({
                            ...prev,
                            showSlices: !(prev.showSlices !== false),
                          }))
                        }
                        className={`px-2 py-1.5 border text-left flex items-center justify-between transition col-span-2 ${
                          gridSettings.showSlices !== false
                            ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-bold'
                            : 'bg-[#181818] text-[#a3a3a3] border-[#333333] hover:text-white'
                        }`}
                      >
                        <span>Show Web Layer Slices (Retina @1x/@2x/@3x)</span>
                        <span>{gridSettings.showSlices !== false ? 'ON' : 'OFF'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. Snapping & Alignment Engine */}
                  <div className="p-2.5 space-y-1.5">
                    <div className="text-[9px] uppercase tracking-wider text-[#a3a3a3] font-semibold">
                      2. Snapping &amp; Alignment Engine
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setGridSettings((prev) => ({
                            ...prev,
                            snapToPixel: !prev.snapToPixel,
                          }))
                        }
                        className={`px-2 py-1.5 border text-center transition ${
                          gridSettings.snapToPixel
                            ? 'bg-[#262626] text-[#ffffff] border-[#ffffff] font-bold'
                            : 'bg-[#181818] text-[#737373] border-[#333333]'
                        }`}
                      >
                        1px Snap: {gridSettings.snapToPixel ? 'ON' : 'OFF'}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setGridSettings((prev) => ({
                            ...prev,
                            snapToGrid: !prev.snapToGrid,
                          }))
                        }
                        className={`px-2 py-1.5 border text-center transition ${
                          gridSettings.snapToGrid
                            ? 'bg-[#262626] text-[#ffffff] border-[#ffffff] font-bold'
                            : 'bg-[#181818] text-[#737373] border-[#333333]'
                        }`}
                      >
                        Snap Grid: {gridSettings.snapToGrid ? 'ON' : 'OFF'}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setGridSettings((prev) => ({
                            ...prev,
                            snapToObjects: !prev.snapToObjects,
                          }))
                        }
                        className={`px-2 py-1.5 border text-center transition ${
                          gridSettings.snapToObjects
                            ? 'bg-[#262626] text-[#ffffff] border-[#ffffff] font-bold'
                            : 'bg-[#181818] text-[#737373] border-[#333333]'
                        }`}
                      >
                        Smart Guides: {gridSettings.snapToObjects ? 'ON' : 'OFF'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-[#d4d4d4]">Grid Spacing Size:</span>
                      <div className="flex items-center gap-1">
                        {[8, 10, 16, 32, 64].map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() =>
                              setGridSettings((prev) => ({ ...prev, gridSize: sz }))
                            }
                            className={`px-2 py-0.5 border text-[10px] ${
                              gridSettings.gridSize === sz
                                ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-bold'
                                : 'bg-[#181818] text-[#a3a3a3] border-[#333333]'
                            }`}
                          >
                            {sz}px
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. Canvas Backdrop & Document Dimensions */}
                  <div className="p-2.5 space-y-2">
                    <div className="text-[9px] uppercase tracking-wider text-[#a3a3a3] font-semibold">
                      3. Canvas Backdrop &amp; Document Size
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {(
                        [
                          { id: 'slate', label: 'Solid Matte (No Squares)' },
                          { id: 'dark-checker', label: 'Subtle Dark Checker' },
                          { id: 'light-checker', label: 'Light Checkerboard' },
                          { id: 'white', label: 'Pure White' },
                        ] as const
                      ).map((bg) => (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={() =>
                            setGridSettings((prev) => ({ ...prev, canvasBackground: bg.id }))
                          }
                          className={`px-2 py-1 border text-left text-[10px] transition ${
                            gridSettings.canvasBackground === bg.id
                              ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-bold'
                              : 'bg-[#181818] text-[#a3a3a3] border-[#333333] hover:text-white'
                          }`}
                        >
                          {bg.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <label className="flex items-center gap-1.5 text-[10px] text-[#d4d4d4]">
                        <span>W (px)</span>
                        <input
                          type="number"
                          min={64}
                          max={4096}
                          value={gridSettings.canvasWidth}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (Number.isNaN(val)) return;
                            setGridSettings((prev) => ({
                              ...prev,
                              canvasWidth: Math.max(
                                64,
                                Math.min(4096, Math.round(val))
                              ),
                            }));
                          }}
                          className="w-16 bg-[#0a0a0a] border border-[#383838] px-1.5 py-0.5 text-white"
                        />
                      </label>
                      <label className="flex items-center gap-1.5 text-[10px] text-[#d4d4d4]">
                        <span>H (px)</span>
                        <input
                          type="number"
                          min={64}
                          max={4096}
                          value={gridSettings.canvasHeight}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (Number.isNaN(val)) return;
                            setGridSettings((prev) => ({
                              ...prev,
                              canvasHeight: Math.max(
                                64,
                                Math.min(4096, Math.round(val))
                              ),
                            }));
                          }}
                          className="w-16 bg-[#0a0a0a] border border-[#383838] px-1.5 py-0.5 text-white"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setGridSettings((prev) => ({
                            ...prev,
                            zoom: 1,
                            panX: 0,
                            panY: 0,
                          }))
                        }
                        className="px-2 py-0.5 bg-[#1c1c1c] hover:bg-[#2e2e2e] border border-[#484848] text-[10px] text-white"
                      >
                        Center 100%
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {[
                        { label: '1280×800', w: 1280, h: 800 },
                        { label: '1024×768', w: 1024, h: 768 },
                        { label: '960×600', w: 960, h: 600 },
                        { label: '800×600', w: 800, h: 600 },
                        { label: '512×512', w: 512, h: 512 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() =>
                            setGridSettings((prev) => ({
                              ...prev,
                              canvasWidth: preset.w,
                              canvasHeight: preset.h,
                            }))
                          }
                          className="px-1.5 py-0.5 bg-[#181818] hover:bg-[#2a2a2a] border border-[#333333] text-[9px] text-[#d4d4d4]"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Default Tool & Bitmap Selection Settings */}
                  <div className="p-2.5 space-y-2">
                    <div className="text-[9px] uppercase tracking-wider text-[#a3a3a3] font-semibold">
                      4. Default Tool &amp; Selection Preferences
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center justify-between bg-[#181818] border border-[#2e2e2e] px-2 py-1">
                        <span className="text-[10px] text-[#d4d4d4]">Default Stroke</span>
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={toolOptions.defaultStrokeWidth}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (Number.isNaN(val)) return;
                            setToolOptions((prev) => ({
                              ...prev,
                              defaultStrokeWidth: Math.max(0, Math.min(20, val)),
                            }));
                          }}
                          className="w-12 bg-[#0a0a0a] border border-[#383838] px-1 py-0.5 text-white text-right"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() =>
                          setToolOptions((prev) => ({
                            ...prev,
                            defaultPixelSnap: !prev.defaultPixelSnap,
                          }))
                        }
                        className={`px-2 py-1 border text-left flex items-center justify-between ${
                          toolOptions.defaultPixelSnap
                            ? 'bg-[#262626] text-white border-[#737373]'
                            : 'bg-[#181818] text-[#737373] border-[#2e2e2e]'
                        }`}
                      >
                        <span className="text-[10px]">New Shape 1px</span>
                        <span>{toolOptions.defaultPixelSnap ? 'ON' : 'OFF'}</span>
                      </button>

                      <label className="flex items-center justify-between bg-[#181818] border border-[#2e2e2e] px-2 py-1">
                        <span className="text-[10px] text-[#d4d4d4]">Wand Tol.</span>
                        <input
                          type="number"
                          min={0}
                          max={255}
                          value={toolOptions.wandTolerance}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (Number.isNaN(val)) return;
                            setToolOptions((prev) => ({
                              ...prev,
                              wandTolerance: Math.max(
                                0,
                                Math.min(255, Math.round(val))
                              ),
                            }));
                          }}
                          className="w-12 bg-[#0a0a0a] border border-[#383838] px-1 py-0.5 text-white text-right"
                        />
                      </label>

                      <label className="flex items-center justify-between bg-[#181818] border border-[#2e2e2e] px-2 py-1">
                        <span className="text-[10px] text-[#d4d4d4]">Feather (px)</span>
                        <input
                          type="number"
                          min={0}
                          max={30}
                          value={toolOptions.selectionFeather}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (Number.isNaN(val)) return;
                            setToolOptions((prev) => ({
                              ...prev,
                              selectionFeather: Math.max(
                                0,
                                Math.min(30, Math.round(val))
                              ),
                            }));
                          }}
                          className="w-12 bg-[#0a0a0a] border border-[#383838] px-1 py-0.5 text-white text-right"
                        />
                      </label>
                    </div>
                  </div>

                  {/* 5. Keyboard Shortcuts & Reset Defaults */}
                  <div className="p-2.5 bg-[#161616] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingsMenuOpen(false);
                        setIsShortcutsModalOpen(true);
                      }}
                      className="flex-1 py-1.5 px-2 bg-[#222222] hover:bg-[#333333] border border-[#484848] text-white flex items-center justify-center gap-1.5 transition"
                    >
                      <Keyboard className="w-3.5 h-3.5" />
                      <span>Keyboard Shortcuts (?)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setGridSettings({
                          canvasWidth: 960,
                          canvasHeight: 600,
                          canvasBackground: 'slate',
                          zoom: 1,
                          panX: 0,
                          panY: 0,
                          showPixelGrid: true,
                          showMajorGrid: false,
                          gridSize: 16,
                          snapToGrid: false,
                          snapToPixel: true,
                          snapToObjects: true,
                          showRulers: true,
                          showSlices: false,
                          showToolHints: true,
                          sliceToolMode: 'slice',
                          canvasViewMode: 'design',
                          guides: [],
                        });
                        showToast('Restored default studio settings');
                      }}
                      className="py-1.5 px-2.5 bg-[#181818] hover:bg-[#2a2a2a] border border-[#383838] text-[#a3a3a3] hover:text-white transition"
                    >
                      Reset Defaults
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Unified File & Showcase Menu (Import, Save, 6 Showcase Presets & Auto-Play Demo Tour) */}
          <div ref={importMenuRef} className="relative">
            <div ref={saveMenuRef} className="hidden" />
            <div ref={presetMenuRef} className="hidden" />
            <button
              onClick={() => toggleTopMenu('import')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-none border text-xs font-semibold transition ${
                isImportMenuOpen || isSaveMenuOpen || isPresetMenuOpen
                  ? 'bg-[#ffffff] text-[#0a0a0a] border-[#ffffff]'
                  : 'bg-[#1c1c1c] hover:bg-[#292929] border-[#484848] text-[#e5e5e5]'
              }`}
              title="File Menu — Switch 6 Live Showcase Presets, Run Demo Tour, Import Files (PNG/SVG/JS/CSV), or Save Project"
            >
              <Save className="w-3.5 h-3.5" />
              <span>File &amp; Presets</span>
              {isDemoTourPlaying && (
                <span className="w-2 h-2 bg-amber-400 inline-block animate-pulse" />
              )}
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            {(isImportMenuOpen || isSaveMenuOpen || isPresetMenuOpen) && (
              <div
                style={{ zIndex: 999 }}
                className="absolute left-0 top-full mt-1 w-80 max-h-[82vh] overflow-y-auto bg-[#121212] border border-[#525252] shadow-2xl z-[999] rounded-none divide-y divide-[#262626] font-mono text-[11px]"
              >
                {/* Section 1: 6 Instant Showcase Presets + Auto-Play Demo Tour */}
                <div className="p-2 space-y-1.5 bg-[#161616]">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#d4d4d4]">
                      Showcase Presets ({activeShowcaseIndex + 1}/6)
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleCycleNextShowcasePreset}
                        className="px-1.5 py-0.5 text-[9px] bg-[#1c1c1c] hover:bg-[#2a2a2a] border border-[#383838] text-[#d4d4d4] hover:text-white"
                        title="Cycle to Next Showcase Preset"
                      >
                        Next ▸
                      </button>
                      <button
                        onClick={handleToggleDemoTour}
                        className={`px-2 py-0.5 text-[9px] font-semibold border transition ${
                          isDemoTourPlaying
                            ? 'bg-amber-400 text-[#0a0a0a] border-amber-200 font-bold'
                            : 'bg-[#222222] hover:bg-[#333333] text-amber-300 border-[#484848]'
                        }`}
                      >
                        {isDemoTourPlaying ? '■ Stop Tour' : '▶ Demo Tour'}
                      </button>
                      <button
                        onClick={handleResetStarterShowcase}
                        className="px-1.5 py-0.5 text-[9px] bg-[#1c1c1c] hover:bg-[#2a2a2a] border border-[#383838] text-[#a3a3a3] hover:text-white flex items-center gap-1"
                        title="Reset Default Showcase"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    {[
                      { idx: 0, label: '1. Fireworks MX Hybrid Lab', tag: 'Default' },
                      { idx: 1, label: '2. Security Drone Website', tag: 'Nested Nav' },
                      { idx: 2, label: '3. Apple Bento Hardware Grid', tag: 'Bento UI' },
                      { idx: 3, label: '4. Executive AI Strategy Board', tag: 'War-Room' },
                      { idx: 4, label: '5. AI Telemetry Dashboard', tag: 'Analytics' },
                      { idx: 5, label: '6. System Flow Blueprint', tag: 'Connectors' },
                    ].map((item) => (
                      <button
                        key={item.idx}
                        onClick={() => handleLoadShowcasePreset(item.idx)}
                        className={`w-full px-2 py-1 text-left flex items-center justify-between transition ${
                          activeShowcaseIndex === item.idx
                            ? 'bg-[#e5e5e5] text-[#0a0a0a] font-bold'
                            : 'bg-[#1c1c1c] hover:bg-[#282828] text-[#d4d4d4]'
                        }`}
                      >
                        <span className="truncate pr-2">{item.label}</span>
                        <span
                          className={`text-[9px] px-1 shrink-0 ${
                            activeShowcaseIndex === item.idx
                              ? 'bg-[#0a0a0a] text-[#ffffff]'
                              : 'bg-[#262626] text-[#a3a3a3]'
                          }`}
                        >
                          {item.tag}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section 2: Import Files */}
                <div className="p-2 space-y-1">
                  <div className="text-[9px] uppercase tracking-wider text-[#a3a3a3] font-semibold mb-1">
                    Import Into Canvas
                  </div>
                  <button
                    onClick={() => triggerFileImportDialog('all')}
                    className="w-full flex items-center justify-between px-2 py-1.5 bg-[#1c1c1c] hover:bg-[#2a2a2a] border border-[#383838] text-[#ffffff] font-semibold transition"
                  >
                    <span className="flex items-center gap-1.5">
                      <Upload className="w-3 h-3 text-[#d4d4d4]" />
                      <span>Import File (Any Format)...</span>
                    </span>
                    <span className="text-[9px] text-[#a3a3a3]">PNG/SVG/JS/CSV</span>
                  </button>
                  <div className="grid grid-cols-2 gap-1 pt-0.5">
                    <button
                      onClick={() => triggerFileImportDialog('svg-vector')}
                      className="px-2 py-1 bg-[#181818] hover:bg-[#262626] border border-[#2e2e2e] text-left text-[10px] text-[#d4d4d4] hover:text-white"
                    >
                      SVG → Vector
                    </button>
                    <button
                      onClick={() => triggerFileImportDialog('raster-alpha')}
                      className="px-2 py-1 bg-[#181818] hover:bg-[#262626] border border-[#2e2e2e] text-left text-[10px] text-[#d4d4d4] hover:text-white"
                    >
                      PNG / WebP / JPG
                    </button>
                    <button
                      onClick={() => triggerFileImportDialog('autoshape-js')}
                      className="px-2 py-1 bg-[#181818] hover:bg-[#262626] border border-[#2e2e2e] text-left text-[10px] text-[#d4d4d4] hover:text-white"
                    >
                      JS AutoShape (.js)
                    </button>
                    <button
                      onClick={() => triggerFileImportDialog('sitemap-data')}
                      className="px-2 py-1 bg-[#181818] hover:bg-[#262626] border border-[#2e2e2e] text-left text-[10px] text-[#d4d4d4] hover:text-white"
                    >
                      Sitemap (.csv/.md)
                    </button>
                  </div>
                </div>

                {/* Section 3: Save & Workspace Snapshots */}
                <div className="p-2 space-y-1">
                  <div className="text-[9px] uppercase tracking-wider text-[#a3a3a3] font-semibold mb-1">
                    Save Project &amp; Snapshots
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={handleQuickSaveToBrowser}
                      className="px-2 py-1.5 bg-[#1c1c1c] hover:bg-[#2a2a2a] border border-[#383838] text-left text-[10px] text-[#ffffff] font-semibold"
                    >
                      Quick Save (Browser)
                    </button>
                    <button
                      onClick={handleRestoreFromBrowserSave}
                      className="px-2 py-1.5 bg-[#181818] hover:bg-[#262626] border border-[#2e2e2e] text-left text-[10px] text-[#d4d4d4] hover:text-white"
                    >
                      Restore Last Save
                    </button>
                  </div>
                  <button
                    onClick={handleExportProjectJson}
                    className="w-full flex items-center justify-between px-2 py-1.5 bg-[#181818] hover:bg-[#262626] text-[#d4d4d4] hover:text-white transition"
                  >
                    <span>Save Osito Project Bundle</span>
                    <span className="text-[9px] text-[#737373]">.osito.json</span>
                  </button>
                  <button
                    onClick={handleSaveSelectedAutoShapePlugin}
                    className="w-full flex items-center justify-between px-2 py-1.5 bg-[#181818] hover:bg-[#262626] text-[#d4d4d4] hover:text-white transition"
                  >
                    <span>Save Selected AutoShape Plugin</span>
                    <span className="text-[9px] text-[#737373]">.autoshape.js</span>
                  </button>
                  <button
                    onClick={handleSaveSitemapMarkdown}
                    className="w-full flex items-center justify-between px-2 py-1.5 bg-[#181818] hover:bg-[#262626] text-[#d4d4d4] hover:text-white transition"
                  >
                    <span>Save Sitemap &amp; Workflow Spec</span>
                    <span className="text-[9px] text-[#737373]">.md</span>
                  </button>
                  <button
                    onClick={handleSaveThemeCssVariables}
                    className="w-full flex items-center justify-between px-2 py-1.5 bg-[#181818] hover:bg-[#262626] text-[#d4d4d4] hover:text-white transition"
                  >
                    <span>Save Color Theme CSS Variables</span>
                    <span className="text-[9px] text-[#737373]">.css</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Clean Omnibar Command Palette & Live UX Readiness Pill (Ctrl+K) */}
        <div className="flex items-center">
          <button
            onClick={() => {
              closeAllTopMenus();
              setIsCommandPaletteOpen(true);
            }}
            className="flex items-center gap-2.5 px-3 py-1 rounded-none bg-[#0e0e0e] hover:bg-[#1a1a1a] border border-[#383838] hover:border-[#666666] text-xs text-[#d4d4d4] transition min-w-[260px] justify-between"
            title="Open Universal Command Palette, Instant Deep Research & Canvas UX Audit (Ctrl+K / ⌘+K)"
          >
            <span className="flex items-center gap-1.5 text-[#a3a3a3]">
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>Search tools, AI research, presets...</span>
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px]">
              <span className="px-1.5 py-0.2 bg-[#1c1c1c] border border-[#333333] text-emerald-300">
                UX {canvasAuditReport.overallScore}%
              </span>
              <kbd className="px-1.5 py-0.2 bg-[#1c1c1c] border border-[#383838] text-[#a3a3a3]">
                Ctrl+K
              </kbd>
            </span>
          </button>
        </div>

        {/* Right: Create & AI Studio, Export, and Publish */}
        <div className="flex items-center gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={getAcceptStringForImportMode(importModeFilter)}
            onChange={handleImportBitmapFile}
            className="hidden"
          />

          {/* Unified Create & AI Studio Dropdown (Deep Research, Logo, Website, Theme, JS AutoShape Studio, Auto-Polish) */}
          <div ref={createMenuRef} className="relative">
            <button
              onClick={() => toggleTopMenu('create')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-none border text-xs font-semibold transition ${
                isCreateMenuOpen
                  ? 'bg-[#ffffff] text-[#0a0a0a] border-[#ffffff]'
                  : 'bg-[#1c1c1c] hover:bg-[#292929] border-[#525252] text-[#ffffff]'
              }`}
              title="Create & AI Studio — Deep Research Co-Pilot, Logo Generator, Website Layout Generator, Color Theme Maker & JS AutoShape Studio"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Create &amp; AI</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            {isCreateMenuOpen && (
              <div
                style={{ zIndex: 999 }}
                className="absolute right-0 top-full mt-1 w-80 bg-[#121212] border border-[#525252] shadow-2xl z-[999] rounded-none divide-y divide-[#262626] font-mono text-[11px]"
              >
                {/* Main Creative Generators Studio Launchers */}
                <div className="p-2 space-y-1.5">
                  <div className="text-[9px] uppercase tracking-wider text-[#a3a3a3] mb-1">
                    Creative Generators &amp; AI Studio
                  </div>
                  <button
                    onClick={() => openCreationStudioTab('deep-research' as CreationStudioTab)}
                    className="w-full flex items-center justify-between px-2.5 py-2 bg-[#152232] hover:bg-[#1d3147] border border-cyan-500/50 text-[#ffffff] transition"
                  >
                    <span className="flex items-center gap-2 font-semibold text-cyan-200">
                      <Compass className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Deep Research &amp; Strategy Co-Pilot...</span>
                    </span>
                    <span className="text-[9px] px-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      AI
                    </span>
                  </button>
                  <button
                    onClick={() => openCreationStudioTab('web-layout')}
                    className="w-full flex items-center justify-between px-2.5 py-2 bg-[#1c1c1c] hover:bg-[#2e2e2e] border border-[#404040] text-[#ffffff] transition"
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <Layout className="w-3.5 h-3.5 text-[#d4d4d4]" />
                      <span>Website Layout Generator...</span>
                    </span>
                    <span className="text-[9px] text-[#a3a3a3]">Nested Menus</span>
                  </button>
                  <button
                    onClick={() => openCreationStudioTab('logo')}
                    className="w-full flex items-center justify-between px-2.5 py-2 bg-[#1c1c1c] hover:bg-[#2e2e2e] border border-[#404040] text-[#ffffff] transition"
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <Hexagon className="w-3.5 h-3.5 text-[#d4d4d4]" />
                      <span>Vector Logo Generator...</span>
                    </span>
                    <span className="text-[9px] text-[#a3a3a3]">8 Emblems</span>
                  </button>
                  <button
                    onClick={() => openCreationStudioTab('color-theme')}
                    className="w-full flex items-center justify-between px-2.5 py-2 bg-[#1c1c1c] hover:bg-[#2e2e2e] border border-[#404040] text-[#ffffff] transition"
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <Palette className="w-3.5 h-3.5 text-[#d4d4d4]" />
                      <span>Color Theme Maker...</span>
                    </span>
                    <span className="text-[9px] text-[#a3a3a3]">HSL Harmonies</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsCreateMenuOpen(false);
                      setIsCodeStudioOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 bg-[#1c1c1c] hover:bg-[#2e2e2e] border border-[#404040] text-[#ffffff] transition"
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <Code2 className="w-3.5 h-3.5 text-[#d4d4d4]" />
                      <span>JS AutoShape Code Studio...</span>
                    </span>
                    <span className="text-[9px] text-[#a3a3a3]">{allAutoShapes.length} Shapes</span>
                  </button>
                  <button
                    onClick={() => {
                      handleAutoPolishCanvas();
                      setIsCreateMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 bg-[#13241c] hover:bg-[#193327] border border-emerald-500/40 text-emerald-200 transition"
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>1-Click Auto-Polish Canvas</span>
                    </span>
                    <span className="text-[9px] text-emerald-300">
                      UX {canvasAuditReport.overallScore}% ({canvasAuditReport.grade})
                    </span>
                  </button>
                </div>

                {/* Quick 1-Click Website Layout Presets */}
                <div className="p-2 space-y-1">
                  <div className="text-[9px] uppercase tracking-wider text-[#737373] mb-1">
                    Instant Website Layout (1-Click)
                  </div>
                  {WEBSITE_LAYOUT_TEMPLATES.slice(0, 4).map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => {
                        handleGenerateWebsiteLayout(
                          tpl.id,
                          COLOR_THEME_PRESETS[0],
                          true,
                          true
                        );
                        setIsCreateMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2 py-1.5 bg-[#181818] hover:bg-[#262626] text-[#d4d4d4] hover:text-white transition text-left"
                    >
                      <span className="truncate pr-2">{tpl.name}</span>
                      <span className="text-[9px] text-[#a3a3a3] shrink-0">Spawn</span>
                    </button>
                  ))}
                </div>

                {/* Quick 1-Click Color Theme Switcher */}
                <div className="p-2 space-y-1">
                  <div className="text-[9px] uppercase tracking-wider text-[#737373] mb-1">
                    Instant Color Theme Recolor
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {COLOR_THEME_PRESETS.slice(0, 6).map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          handleApplyColorTheme(theme);
                          setIsCreateMenuOpen(false);
                        }}
                        className="flex items-center justify-between px-2 py-1 bg-[#181818] hover:bg-[#262626] border border-[#2a2a2a] text-[10px] text-[#d4d4d4] hover:text-white transition"
                      >
                        <span className="truncate mr-1">{theme.name.split(' ')[0]}</span>
                        <span className="flex items-center gap-0.5 shrink-0">
                          <span
                            className="w-2.5 h-2.5 inline-block border border-[#404040]"
                            style={{ backgroundColor: theme.primary }}
                          />
                          <span
                            className="w-2.5 h-2.5 inline-block border border-[#404040]"
                            style={{ backgroundColor: theme.secondary }}
                          />
                          <span
                            className="w-2.5 h-2.5 inline-block border border-[#404040]"
                            style={{ backgroundColor: theme.accent }}
                          />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Multi-Format & Multi-Scale Export Dropdown Menu */}
          <div ref={exportMenuRef} className="relative">
            <button
              onClick={() => toggleTopMenu('export')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-none border text-xs font-medium transition ${
                isExportMenuOpen
                  ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-semibold'
                  : 'bg-[#1c1c1c] hover:bg-[#292929] border-[#484848] text-[#f5f5f5]'
              }`}
              title="Export Interactive HTML Showcase, PNG (@1x/@2x/@3x), WebP, Multi-Scale Retina Slices (.ZIP), SVG, or Osito Project"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {isExportMenuOpen && (
              <div
                style={{ zIndex: 999 }}
                className="absolute right-0 top-full mt-1 w-72 bg-[#121212] border border-[#484848] shadow-2xl z-[999] rounded-none divide-y divide-[#262626] font-mono text-[11px]"
              >
                {/* Section 0: Shareable Interactive HTML Showcase & Multi-Scale Retina Slice ZIP Exporter */}
                <div className="py-1 bg-[#181818]">
                  <div className="px-3 py-1 text-[9px] uppercase tracking-wider text-emerald-300 font-semibold">
                    Full-Stack Repo &amp; Retina Bundles
                  </div>
                  <button
                    onClick={handleExportFullReactTailwindAppZip}
                    className="w-full px-3 py-1.5 text-left text-[#ffffff] font-bold bg-[#1f2937]/70 hover:bg-[#e5e5e5] hover:text-[#0a0a0a] flex items-center justify-between transition"
                  >
                    <span>Full React + Tailwind App Repo</span>
                    <span className="text-[10px] px-1 bg-cyan-400 text-[#0a0a0a] font-bold">
                      .ZIP REPO
                    </span>
                  </button>
                  <button
                    onClick={handleExportInteractiveHtmlShowcase}
                    className="w-full px-3 py-1.5 text-left text-emerald-200 font-semibold hover:bg-[#26382f] flex items-center justify-between"
                  >
                    <span>Interactive HTML Showcase</span>
                    <span className="text-[10px] px-1 bg-emerald-400 text-[#0a0a0a] font-bold">
                      .HTML
                    </span>
                  </button>
                  <button
                    onClick={handleExportSlicesZip}
                    className="w-full px-3 py-1.5 text-left text-[#ffffff] font-semibold hover:bg-[#2e2e2e] flex items-center justify-between"
                  >
                    <span>Batch Export Slices (@1x/@2x/@3x)</span>
                    <span className="text-[10px] px-1 bg-[#e5e5e5] text-[#0a0a0a]">.ZIP</span>
                  </button>
                  <button
                    onClick={() => {
                      handleAddSliceFromSelection();
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-[#d4d4d4] hover:bg-[#262626] hover:text-white flex items-center justify-between"
                  >
                    <span>+ Create Slice from Selected</span>
                    <span className="text-[10px] text-[#737373]">{slices.length} active</span>
                  </button>
                </div>

                {/* Section 1: Raster Canvas Exports */}
                <div className="py-1">
                  <div className="px-3 py-1 text-[9px] uppercase tracking-wider text-[#737373]">
                    Raster Canvas Export
                  </div>
                  <button
                    onClick={() => handleExportRaster('png', 1, false)}
                    className="w-full px-3 py-1.5 text-left text-[#e5e5e5] hover:bg-[#262626] hover:text-white flex items-center justify-between"
                  >
                    <span>PNG @1x (Pixel-Perfect)</span>
                    <span className="text-[10px] text-[#737373]">
                      {gridSettings.canvasWidth}×{gridSettings.canvasHeight}
                    </span>
                  </button>
                  <button
                    onClick={() => handleExportRaster('png', 2, false)}
                    className="w-full px-3 py-1.5 text-left text-[#e5e5e5] hover:bg-[#262626] hover:text-white flex items-center justify-between"
                  >
                    <span>PNG @2x (Retina HiDPI)</span>
                    <span className="text-[10px] text-[#737373]">
                      {gridSettings.canvasWidth * 2}×{gridSettings.canvasHeight * 2}
                    </span>
                  </button>
                  <button
                    onClick={() => handleExportRaster('png', 3, false)}
                    className="w-full px-3 py-1.5 text-left text-[#e5e5e5] hover:bg-[#262626] hover:text-white flex items-center justify-between"
                  >
                    <span>PNG @3x (Ultra-HD Mobile)</span>
                    <span className="text-[10px] text-[#737373]">
                      {gridSettings.canvasWidth * 3}×{gridSettings.canvasHeight * 3}
                    </span>
                  </button>
                  <button
                    onClick={() => handleExportRaster('webp', 1, false)}
                    className="w-full px-3 py-1.5 text-left text-[#e5e5e5] hover:bg-[#262626] hover:text-white flex items-center justify-between"
                  >
                    <span>WebP @1x (Modern Web)</span>
                    <span className="text-[10px] text-[#737373]">.webp</span>
                  </button>
                  <button
                    onClick={() => handleExportRaster('webp', 2, false)}
                    className="w-full px-3 py-1.5 text-left text-[#e5e5e5] hover:bg-[#262626] hover:text-white flex items-center justify-between"
                  >
                    <span>WebP @2x (Retina WebP)</span>
                    <span className="text-[10px] text-[#737373]">.webp</span>
                  </button>
                  <button
                    onClick={() => handleExportRaster('jpeg', 1, false)}
                    className="w-full px-3 py-1.5 text-left text-[#e5e5e5] hover:bg-[#262626] hover:text-white flex items-center justify-between"
                  >
                    <span>JPEG @1x (Opaque 92%)</span>
                    <span className="text-[10px] text-[#737373]">.jpg</span>
                  </button>
                </div>

                {/* Section 2: Selected Object Slice Export */}
                <div className="py-1">
                  <div className="px-3 py-1 text-[9px] uppercase tracking-wider text-[#737373]">
                    Component Slice Export
                  </div>
                  <button
                    onClick={() => handleExportRaster('png', 1, true)}
                    className="w-full px-3 py-1.5 text-left text-[#e5e5e5] hover:bg-[#262626] hover:text-white flex items-center justify-between"
                  >
                    <span>Selected Object Slice (@1x)</span>
                    <span className="text-[10px] text-[#737373]">PNG</span>
                  </button>
                  <button
                    onClick={() => handleExportRaster('png', 2, true)}
                    className="w-full px-3 py-1.5 text-left text-[#e5e5e5] hover:bg-[#262626] hover:text-white flex items-center justify-between"
                  >
                    <span>Selected Object Slice (@2x)</span>
                    <span className="text-[10px] text-[#737373]">Retina</span>
                  </button>
                </div>

                {/* Section 3: Vector, Code & Project Bundle */}
                <div className="py-1">
                  <div className="px-3 py-1 text-[9px] uppercase tracking-wider text-[#737373]">
                    Vector & Project Bundle
                  </div>
                  <button
                    onClick={handleExportSvg}
                    className="w-full px-3 py-1.5 text-left text-[#e5e5e5] hover:bg-[#262626] hover:text-white flex items-center justify-between"
                  >
                    <span>SVG Vector + Hybrid File</span>
                    <span className="text-[10px] text-[#737373]">.svg</span>
                  </button>
                  <button
                    onClick={handleCopySvgToClipboard}
                    className="w-full px-3 py-1.5 text-left text-[#e5e5e5] hover:bg-[#262626] hover:text-white flex items-center justify-between"
                  >
                    <span>Copy Inline &lt;svg&gt; Markup</span>
                    <span className="text-[10px] text-[#737373]">Copy</span>
                  </button>
                  <button
                    onClick={() => {
                      handleExportProjectJson();
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-[#e5e5e5] hover:bg-[#262626] hover:text-white flex items-center justify-between"
                  >
                    <span>Osito Project Bundle</span>
                    <span className="text-[10px] text-[#737373]">.osito.json</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              closeAllTopMenus();
              setIsPublishModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-[#e5e5e5] hover:bg-[#ffffff] text-xs font-semibold text-[#0a0a0a] border border-[#ffffff] transition"
            title="Share Single-File HTML Studio, Browse 6 Showcase Presets, Export Clean Production HTML, or Publish Online"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Share &amp; Publish</span>
          </button>
        </div>
      </header>
      )}

      {/* Subtle Exit Pill when previewing Published Site View inside the Studio (hidden when URL has ?published=1 for public visitors) */}
      {isPublishedSiteView &&
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('published') !== '1' && (
          <div className="fixed bottom-3 right-3 z-[9999] opacity-25 hover:opacity-100 transition-opacity duration-200">
            <button
              type="button"
              onClick={() => {
                setIsPublishedSiteView(false);
                setGridSettings((prev) => ({ ...prev, canvasViewMode: 'design' }));
                showToast('Returned to Studio Editor');
              }}
              className="px-2.5 py-1 bg-[#111111]/90 hover:bg-[#1f1f1f] text-[#e5e5e5] border border-[#444444] text-[10px] font-mono shadow-lg flex items-center gap-1.5"
              title="Exit Clean Published Website View and return to Studio Editor (Esc)"
            >
              <span>Exit Published View (Esc)</span>
            </button>
          </div>
        )}

      {/* Main 3-Column Studio Workspace */}
      <div className="relative z-10 flex flex-1 min-h-0 overflow-hidden">
        {!isPublishedSiteView && (
          <LeftToolDock
            activeTool={activeTool}
            onSelectTool={(tool) => {
              if (tool === 'slice') {
                setGridSettings((prev) => ({
                  ...prev,
                  showSlices: true,
                  canvasViewMode: 'slice',
                }));
              } else if (gridSettings.canvasViewMode === 'preview') {
                setGridSettings((prev) => ({ ...prev, canvasViewMode: 'design' }));
              }
              handleSelectTool(tool);
            }}
            toolOptions={toolOptions}
            onUpdateToolOptions={(patch) => setToolOptions((prev) => ({ ...prev, ...patch }))}
            onLiveColorChange={handleLiveDockColorChange}
            onRecordHistorySnapshot={recordHistorySnapshot}
            autoShapes={allAutoShapes}
            onInsertAutoShape={handleInsertAutoShape}
            onOpenAutoShapeStudio={() => setIsCodeStudioOpen(true)}
            showSlices={gridSettings.showSlices !== false}
            onToggleShowSlices={() =>
              setGridSettings((prev) => {
                const nextShow = !(prev.showSlices !== false);
                showToast(`Web Layer Slices: ${nextShow ? 'ON' : 'OFF'}`);
                return {
                  ...prev,
                  showSlices: nextShow,
                  canvasViewMode: nextShow ? 'slice' : 'design',
                };
              })
            }
          />
        )}

        <HybridCanvas
          objects={objects}
          selectedIds={selectedIds}
          selectedNodeIds={selectedNodeIds}
          activeTool={activeTool}
          toolOptions={toolOptions}
          gridSettings={gridSettings}
          pixelSelection={pixelSelection}
          autoShapes={allAutoShapes}
          slices={slices}
          selectedSliceId={selectedSliceId}
          onSelectSlice={setSelectedSliceId}
          onUpdateSlice={handleUpdateSlice}
          onAddSlice={handleAddSlice}
          onDeleteSlice={handleDeleteSlice}
          onExportSlicesZip={handleExportSlicesZip}
          onSmartRemoveBackground={handleSmartRemoveBackground}
          onVectorizeSelectionToBezier={handleVectorizeSelectionToBezier}
          onConnectObjects={handleConnectObjects}
          onSpawnConnectedNode={handleSpawnConnectedNode}
          onSelectObjects={handleSelectObjects}
          onSelectNodes={setSelectedNodeIds}
          onUpdateObject={handleUpdateObject}
          onAddObject={handleAddObject}
          onUpdatePixelSelection={setPixelSelection}
          onUpdateToolOptions={(patch) => setToolOptions((prev) => ({ ...prev, ...patch }))}
          onUpdateGridSettings={(patch) => setGridSettings((prev) => ({ ...prev, ...patch }))}
          onSelectTool={handleSelectTool}
          onRecordHistorySnapshot={recordHistorySnapshot}
        />

        {!isPublishedSiteView && (
          <LayersAndHistoryPanel
            objects={objects}
            selectedIds={selectedIds}
            onSelectObject={(id, multi) => {
              if (multi) {
                const next = selectedIds.includes(id)
                  ? selectedIds.filter((i) => i !== id)
                  : [...selectedIds, id];
                handleSelectObjects(next);
              } else {
                handleSelectObjects([id]);
              }
            }}
            onUpdateObject={(id, patch) => handleUpdateObject(id, patch, true)}
            onReorderObject={handleReorderObject}
            onMoveLayer={handleMoveLayer}
            onDuplicateObject={handleDuplicateObject}
            onDeleteObject={handleDeleteObject}
            onRasterizeObject={handleRasterizeObject}
            onAddBlankBitmapLayer={handleAddBlankBitmapLayer}
            autoShapes={allAutoShapes}
            onInsertAutoShape={handleInsertAutoShape}
            onOpenAutoShapeStudio={() => setIsCodeStudioOpen(true)}
            onAlignSelected={handleAlignSelected}
            onApplyCanvasPreset={(width, height) => {
              setGridSettings((prev) => ({
                ...prev,
                canvasWidth: width,
                canvasHeight: height,
              }));
              showToast(`Applied responsive viewport preset: ${width}×${height}px`);
            }}
            slices={slices}
            onAddSlice={handleAddSlice}
            onDeleteSlice={handleDeleteSlice}
            onExportSlicesZip={handleExportSlicesZip}
            onExportReactTailwindAppZip={handleExportFullReactTailwindAppZip}
            onSelectComponentState={handleSelectComponentState}
            onAutoGenerateComponentStates={handleAutoGenerateComponentStates}
            onAutoPolishCanvas={handleAutoPolishCanvas}
            onOpenDeepResearchWithQuery={handleOpenDeepResearchWithQuery}
            onInstantSpawnResearchedWebsite={handleInstantSpawnResearchedWebsite}
            onInstantSpawnStrategyBoard={handleInstantSpawnStrategyBoard}
            canUndo={historyPast.length > 0}
            canRedo={historyFuture.length > 0}
            historyCount={historyPast.length}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />
        )}
      </div>

      {/* Bottom Context-Sensitive Property Inspector */}
      {!isPublishedSiteView && (
        <PropertyInspector
          activeTool={activeTool}
          selectedObjects={selectedObjects}
          selectedNodeIds={selectedNodeIds}
          autoShapes={allAutoShapes}
          pixelSelection={pixelSelection}
          toolOptions={toolOptions}
          gridSettings={gridSettings}
          slices={slices}
          selectedSliceId={selectedSliceId}
          onSelectSlice={setSelectedSliceId}
          onUpdateSlice={handleUpdateSlice}
          onDeleteSlice={handleDeleteSlice}
          onExportSlicesZip={handleExportSlicesZip}
          onAddSliceFromSelection={handleAddSliceFromSelection}
          onSmartRemoveBackground={handleSmartRemoveBackground}
          onVectorizeSelectionToBezier={handleVectorizeSelectionToBezier}
          onSelectComponentState={handleSelectComponentState}
          onAutoGenerateComponentStates={handleAutoGenerateComponentStates}
          onBranchConnectedNode={handleBranchConnectedNode}
          onDuplicateSelected={handleDuplicateSelectedOffset}
          onFlipSelected={handleFlipSelected}
          onCenterSelectedOnCanvas={handleCenterSelectedOnCanvas}
          onShowToast={showToast}
          onUpdateObject={(id, patch, recordHistory = true) =>
            handleUpdateObject(id, patch, recordHistory)
          }
          onRecordHistorySnapshot={recordHistorySnapshot}
          onUpdateToolOptions={(patch) => setToolOptions((prev) => ({ ...prev, ...patch }))}
          onUpdateGridSettings={(patch) => setGridSettings((prev) => ({ ...prev, ...patch }))}
          onOpenAutoShapeStudio={() => setIsCodeStudioOpen(true)}
          onConvertAutoShapeToPaths={handleConvertAutoShapeToPaths}
          onRasterizeObject={handleRasterizeObject}
          onClearPixelSelection={() => setPixelSelection(createEmptyPixelSelection())}
          onInvertPixelSelection={() =>
            setPixelSelection(
              invertPixelSelection(
                pixelSelection,
                gridSettings.canvasWidth,
                gridSettings.canvasHeight
              )
            )
          }
          onDeleteSelectedPixels={handleDeleteSelectedPixels}
          onFloatSelectedPixels={handleFloatSelectedPixels}
          onCutSelectedPixels={handleCutSelection}
          onCopySelectedPixels={handleCopySelection}
          onPasteSelectedPixels={() => handlePasteSelection('in-place')}
          onApplyPixelEffect={handleApplyPixelEffect}
          onChangeSelectedNodesType={handleChangeSelectedNodesType}
        />
      )}

      {/* Osito Creative Generators Studio Modal (Deep Research, Logo Generator, Website Layout Generator, Color Theme Maker) */}
      <CreationStudioModal
        isOpen={isCreationStudioOpen}
        initialTab={creationStudioTab}
        onClose={() => setIsCreationStudioOpen(false)}
        onGenerateLogo={handleGenerateLogo}
        onLivePreviewLogoOnCanvas={handleLivePreviewLogoOnCanvas}
        onGenerateWebsiteLayout={handleGenerateWebsiteLayout}
        onApplyColorThemeToCanvas={handleApplyColorTheme}
        onSpawnThemeSwatchCard={handleSpawnThemeSwatchCard}
        objects={objects}
        slices={slices}
        onSpawnStrategyBoard={handleSpawnStrategyBoard}
        onAutoPolishCanvas={handleAutoPolishCanvas}
        initialResearchQuery={initialResearchQuery}
      />

      {/* Universal Ctrl+K / ⌘+K Omnibar Command Palette & Instant Deep Research Launcher */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenDeepResearchWithQuery={handleOpenDeepResearchWithQuery}
        onInstantSpawnResearchedWebsite={handleInstantSpawnResearchedWebsite}
        onInstantSpawnStrategyBoard={handleInstantSpawnStrategyBoard}
        onOpenCreationStudioTab={(tab) => openCreationStudioTab(tab)}
        onGenerateWebsiteLayout={(templateId) =>
          handleGenerateWebsiteLayout(
            templateId,
            COLOR_THEME_PRESETS[0],
            true,
            true
          )
        }
        onApplyColorTheme={handleApplyColorTheme}
        onAutoPolishCanvas={() => handleAutoPolishCanvas()}
        onSelectTool={(tool) => {
          if (tool === 'slice') {
            setGridSettings((prev) => ({
              ...prev,
              showSlices: true,
              canvasViewMode: 'slice',
            }));
          } else if (gridSettings.canvasViewMode === 'preview') {
            setGridSettings((prev) => ({ ...prev, canvasViewMode: 'design' }));
          }
          handleSelectTool(tool);
        }}
        onTogglePreviewMode={() =>
          setGridSettings((prev) => {
            const nextMode = prev.canvasViewMode === 'preview' ? 'design' : 'preview';
            showToast(
              nextMode === 'preview'
                ? 'Live Preview Mode: Click navbars & interactive AutoShapes on canvas!'
                : 'Returned to Design View Mode'
            );
            return { ...prev, canvasViewMode: nextMode, showSlices: false };
          })
        }
        onExportSlicesZip={handleExportSlicesZip}
        onExportReactTailwindAppZip={handleExportFullReactTailwindAppZip}
        onExportSvg={handleExportSvg}
        onExportPng={handleExportPng}
        onOpenCodeStudio={() => setIsCodeStudioOpen(true)}
        onResetStarterShowcase={handleResetStarterShowcase}
        canvasScoreSummary={{
          score: canvasAuditReport.overallScore,
          grade: canvasAuditReport.grade,
          fixesCount: canvasAuditReport.checks.filter(
            (c: { status: string }) => c.status !== 'pass'
          ).length,
        }}
      />

      {/* Programmable JS AutoShape Code Studio Modal */}
      <AutoShapeCodeStudio
        isOpen={isCodeStudioOpen}
        onClose={() => setIsCodeStudioOpen(false)}
        allDefinitions={allAutoShapes}
        selectedObject={selectedAutoShapeObject}
        onUpdateInstanceCode={(objectId, customCode, updatedParams) => {
          handleUpdateObject(
            objectId,
            {
              customCode,
              ...(updatedParams ? { params: updatedParams } : {}),
            } as Partial<AutoShapeObject>,
            true
          );
          showToast('Applied live JavaScript AutoShape code to canvas instance!');
        }}
        onSaveNewDefinition={(newDef, insertToCanvas) => {
          const updatedCustom = [
            ...customAutoShapes.filter((c) => c.id !== newDef.id),
            newDef,
          ];
          setCustomAutoShapes(updatedCustom);
          saveCustomAutoShapes(updatedCustom);
          if (insertToCanvas) {
            recordHistorySnapshot();
            const newShape: AutoShapeObject = {
              id: `autoshape-${Date.now()}`,
              name: `${newDef.name} (JS)`,
              type: 'autoshape',
              shapeDefId: newDef.id,
              visible: true,
              locked: false,
              x: Math.round(gridSettings.canvasWidth / 2 - 90),
              y: Math.round(gridSettings.canvasHeight / 2 - 70),
              width: 180,
              height: 140,
              rotation: 0,
              opacity: 1,
              blendMode: 'source-over',
              fill: toolOptions.primaryColor,
              fillType: 'linear-gradient',
              fillGradientEnd: '#f59e0b',
              stroke: toolOptions.secondaryColor,
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
              params: { ...newDef.defaultParams },
            };
            setObjects((prev) => [...prev, newShape]);
            setSelectedIds([newShape.id]);
          }
          showToast(`Saved custom JS AutoShape "${newDef.name}" to library!`);
        }}
        onUpdateDefinition={(updatedDef) => {
          if (updatedDef.isBuiltIn) {
            if (selectedAutoShapeObject) {
              handleUpdateObject(
                selectedAutoShapeObject.id,
                { customCode: updatedDef.jsSourceCode } as Partial<AutoShapeObject>,
                true
              );
            }
          } else {
            const next = customAutoShapes.map((d) =>
              d.id === updatedDef.id ? updatedDef : d
            );
            setCustomAutoShapes(next);
            saveCustomAutoShapes(next);
          }
          showToast(`Updated AutoShape "${updatedDef.name}"`);
        }}
      />

      {/* Share, Showcase & Google AI Studio Publish Modal */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onExportPng={handleExportPng}
        onExportSvg={handleExportSvg}
        onExportProjectJson={handleExportProjectJson}
        onExportInteractiveHtml={handleExportInteractiveHtmlShowcase}
        onExportCleanWebsiteHtml={handleExportCleanProductionHtml}
        onExportReactTailwindAppZip={handleExportFullReactTailwindAppZip}
        onLaunchPublishedSiteView={handleLaunchPublishedSiteView}
        onLoadShowcasePreset={handleLoadShowcasePreset}
        onTogglePreviewMode={() =>
          setGridSettings((prev) => {
            const nextMode = prev.canvasViewMode === 'preview' ? 'design' : 'preview';
            showToast(
              nextMode === 'preview'
                ? 'Live Preview Mode: Click navbars & interactive AutoShapes on canvas!'
                : 'Returned to Design View Mode'
            );
            return { ...prev, canvasViewMode: nextMode, showSlices: false };
          })
        }
        activeShowcaseIndex={activeShowcaseIndex}
        objectCount={objects.filter((o) => o.visible).length}
        autoShapeCount={allAutoShapes.length}
        uxScore={canvasAuditReport.overallScore}
        uxGrade={canvasAuditReport.grade}
      />

      {/* Macromedia Fireworks MX Keyboard Shortcuts Reference Modal (Windows & macOS) */}
      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        shortcuts={fireworksShortcutsList}
      />

      {/* Interactive Self-Running Demo Tour HUD Banner */}
      {isDemoTourPlaying && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 w-[640px] max-w-[92vw] bg-[#111111]/95 backdrop-blur-md border-2 border-amber-400 shadow-[0_12px_40px_rgba(0,0,0,0.85)] p-3 rounded-none font-mono">
          <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-[#2e2e2e]">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-amber-400 text-[#0a0a0a] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#0a0a0a] inline-block animate-ping" />
                <span>LIVE DEMO TOUR</span>
              </span>
              <span className="text-[10px] text-amber-300 font-bold">
                {demoTourSteps[activeShowcaseIndex]?.badge}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {demoTourSteps.map((step) => (
                <button
                  key={step.idx}
                  type="button"
                  onClick={() => handleLoadShowcasePreset(step.idx)}
                  className={`w-5 h-4 text-[9px] border transition ${
                    activeShowcaseIndex === step.idx
                      ? 'bg-amber-400 text-[#0a0a0a] border-white font-bold'
                      : 'bg-[#1c1c1c] text-[#a3a3a3] border-[#383838] hover:text-white'
                  }`}
                  title={`Jump to Scene ${step.idx + 1}: ${step.title}`}
                >
                  {step.idx + 1}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleLoadShowcasePreset(activeShowcaseIndex - 1)}
                className="px-1.5 py-0.5 bg-[#1c1c1c] hover:bg-[#2e2e2e] border border-[#484848] text-[10px] text-white ml-1"
                title="Previous Showcase Scene"
              >
                ◀
              </button>
              <button
                type="button"
                onClick={() => handleLoadShowcasePreset(activeShowcaseIndex + 1)}
                className="px-1.5 py-0.5 bg-[#1c1c1c] hover:bg-[#2e2e2e] border border-[#484848] text-[10px] text-white"
                title="Next Showcase Scene"
              >
                ▶
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDemoTourPlaying(false);
                  showToast('■ Stopped Demo Tour — canvas ready for live editing!');
                }}
                className="px-2 py-0.5 bg-amber-400 hover:bg-amber-300 text-[#0a0a0a] font-bold text-[10px] ml-1"
              >
                ■ Stop
              </button>
            </div>
          </div>
          <div className="text-xs font-bold text-white mb-0.5">
            {demoTourSteps[activeShowcaseIndex]?.title}
          </div>
          <div className="text-[11px] text-[#d4d4d4] leading-snug">
            {demoTourSteps[activeShowcaseIndex]?.detail}
          </div>
        </div>
      )}

      {/* Floating Monochrome Status Toast (Sharp 0px corners) */}
      {statusToast && (
        <div className="fixed bottom-32 right-6 z-50 flex items-center gap-2 bg-[#141414] border border-[#ffffff] text-[#ffffff] px-3.5 py-2 shadow-2xl text-xs font-mono rounded-none">
          <CheckCircle2 className="w-4 h-4 text-[#ffffff] shrink-0" />
          <span>{statusToast}</span>
        </div>
      )}
    </div>
  );
};

export default App;

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Sparkles,
  Compass,
  Wand2,
  Layout,
  Hexagon,
  Palette,
  Wrench,
  Download,
  Eye,
  Code2,
  RotateCcw,
  CornerDownLeft,
  X,
  ShieldCheck,
  Target,
  Zap,
  Layers,
} from 'lucide-react';
import {
  COLOR_THEME_PRESETS,
  ColorThemePalette,
  WebsiteLayoutTemplateId,
} from '../engine/creationEngine';
import { CreationStudioTab } from './CreationStudioModal';
import { ToolId } from '../types/editor';

export interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeepResearchWithQuery: (query: string) => void;
  onInstantSpawnResearchedWebsite: (query: string) => void;
  onInstantSpawnStrategyBoard: (query: string) => void;
  onOpenCreationStudioTab: (tab: CreationStudioTab) => void;
  onGenerateWebsiteLayout: (templateId: WebsiteLayoutTemplateId) => void;
  onApplyColorTheme: (theme: ColorThemePalette) => void;
  onAutoPolishCanvas: () => void;
  onSelectTool: (tool: ToolId) => void;
  onTogglePreviewMode: () => void;
  onExportSlicesZip: () => void;
  onExportReactTailwindAppZip?: () => void;
  onExportSvg: () => void;
  onExportPng: () => void;
  onOpenCodeStudio: () => void;
  onResetStarterShowcase: () => void;
  canvasScoreSummary?: { score: number; grade: string; fixesCount: number };
}

type CommandCategoryFilter =
  | 'All'
  | 'Deep Research'
  | 'Generate'
  | 'Canvas Audit'
  | 'Tools'
  | 'Themes'
  | 'Export';

interface PaletteCommandItem {
  id: string;
  category: Exclude<CommandCategoryFilter, 'All'>;
  sectionTitle: string;
  label: string;
  subtitle: string;
  keywords: string;
  shortcut?: string;
  badge?: string;
  badgeTone?: 'cyan' | 'emerald' | 'amber' | 'violet' | 'mono';
  swatchColors?: [string, string, string];
  isDynamicQueryAction?: boolean;
  onExecute: () => void;
}

const CATEGORY_PILLS: CommandCategoryFilter[] = [
  'All',
  'Deep Research',
  'Generate',
  'Canvas Audit',
  'Tools',
  'Themes',
  'Export',
];

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onOpenDeepResearchWithQuery,
  onInstantSpawnResearchedWebsite,
  onInstantSpawnStrategyBoard,
  onOpenCreationStudioTab,
  onGenerateWebsiteLayout,
  onApplyColorTheme,
  onAutoPolishCanvas,
  onSelectTool,
  onTogglePreviewMode,
  onExportSlicesZip,
  onExportReactTailwindAppZip,
  onExportSvg,
  onExportPng,
  onOpenCodeStudio,
  onResetStarterShowcase,
  canvasScoreSummary,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CommandCategoryFilter>('All');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      window.setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 15);
    }
  }, [isOpen]);

  const trimmedQuery = query.trim();
  const hasCustomQuery = trimmedQuery.length >= 2;

  const scoreLabel = canvasScoreSummary
    ? `UX ${canvasScoreSummary.score}% (${canvasScoreSummary.grade}) • ${canvasScoreSummary.fixesCount} fix${
        canvasScoreSummary.fixesCount === 1 ? '' : 'es'
      }`
    : 'UX Audit Ready';

  // Build curated static commands
  const staticCommands: PaletteCommandItem[] = useMemo(() => {
    const runAndClose = (fn: () => void) => () => {
      fn();
      onClose();
    };

    const items: PaletteCommandItem[] = [
      // 1. Deep Research & Strategy
      {
        id: 'cmd-open-deep-research-studio',
        category: 'Deep Research',
        sectionTitle: 'Deep Research & Strategy',
        label: 'Open Deep Research & Market Intelligence Studio',
        subtitle:
          'Synthesize ICP personas, competitor teardowns, value propositions, conversion architecture & canvas UX readiness',
        keywords: 'deep research market intelligence competitor teardown strategy icp brief',
        shortcut: 'Ctrl+K → R',
        badge: 'NEW • AI CO-PILOT',
        badgeTone: 'cyan',
        onExecute: runAndClose(() =>
          onOpenCreationStudioTab('deep-research' as CreationStudioTab)
        ),
      },
      {
        id: 'cmd-spawn-strategy-board',
        category: 'Deep Research',
        sectionTitle: 'Deep Research & Strategy',
        label: 'Spawn Executive Competitive Teardown & Strategy Board',
        subtitle:
          'Generate a multi-card executive strategy war-room on canvas with competitor benchmarks, ICP pains & conversion funnel',
        keywords: 'strategy board executive competitor teardown benchmark war room canvas',
        badge: '1-CLICK BOARD',
        badgeTone: 'violet',
        onExecute: runAndClose(() =>
          onInstantSpawnStrategyBoard(
            trimmedQuery || 'Osito Autonomous Security Drones & Fleet AI'
          )
        ),
      },
      {
        id: 'cmd-auto-polish-canvas',
        category: 'Canvas Audit',
        sectionTitle: 'Deep Research & Strategy',
        label:
          '1-Click Auto-Polish Current Canvas (WCAG Contrast + Hover States + Pixel Snap)',
        subtitle:
          'Automatically repair low-contrast typography, attach interactive :hover/:active variants, align 1px pixel-snap & generate Retina slices',
        keywords: 'auto polish audit wcag contrast hover states pixel snap fix readiness score',
        badge: scoreLabel,
        badgeTone: 'emerald',
        onExecute: runAndClose(() => onAutoPolishCanvas()),
      },
      {
        id: 'cmd-research-preset-drones',
        category: 'Deep Research',
        sectionTitle: 'Deep Research & Strategy',
        label: 'Research Preset: Autonomous Security Drones & Fleet AI',
        subtitle:
          'Instant market dossier + 1-click website & strategy board for autonomous perimeter drones and B2B telemetry',
        keywords: 'autonomous security drones fleet ai robotics perimeter osito preset',
        badge: 'PRESET BRIEF',
        badgeTone: 'cyan',
        onExecute: runAndClose(() =>
          onOpenDeepResearchWithQuery(
            'Autonomous Perimeter Security Drones & Real-Time Fleet Telemetry AI'
          )
        ),
      },
      {
        id: 'cmd-research-preset-stem',
        category: 'Deep Research',
        sectionTitle: 'Deep Research & Strategy',
        label: 'Research Preset: STEM Flight Academy & Youth Robotics',
        subtitle:
          'Instant market dossier for K-12 STEM drone curriculum, classroom kits, and gamified flight simulators',
        keywords: 'stem flight academy youth robotics education school camp simulator preset',
        badge: 'PRESET BRIEF',
        badgeTone: 'amber',
        onExecute: runAndClose(() =>
          onOpenDeepResearchWithQuery(
            'Hands-On STEM Drone Flight Academy & Gamified Youth Robotics Curriculum'
          )
        ),
      },
      {
        id: 'cmd-research-preset-fintech',
        category: 'Deep Research',
        sectionTitle: 'Deep Research & Strategy',
        label: 'Research Preset: Institutional FinTech & AI Treasury',
        subtitle:
          'Instant market dossier for autonomous liquidity routing, real-time risk telemetry, and enterprise CFO control',
        keywords: 'institutional fintech ai treasury banking liquidity saas preset',
        badge: 'PRESET BRIEF',
        badgeTone: 'emerald',
        onExecute: runAndClose(() =>
          onOpenDeepResearchWithQuery(
            'Institutional AI Treasury & Autonomous Multi-Bank Liquidity Platform'
          )
        ),
      },

      // 2. Generate (100% Vector Layouts & Logos)
      {
        id: 'cmd-open-logo-studio',
        category: 'Generate',
        sectionTitle: 'Generate (100% Vector Layouts & Logos)',
        label: 'Creative 6-Variation Logo Studio',
        subtitle:
          'Generate 6 distinct geometric vector logo lockups with custom emblems, monograms, and color harmonies',
        keywords: 'logo generator emblem crest vector brand identity studio',
        shortcut: 'F10',
        badge: '6 VARIATIONS',
        badgeTone: 'cyan',
        onExecute: runAndClose(() => onOpenCreationStudioTab('logo')),
      },
      {
        id: 'cmd-gen-saas-mega-menu',
        category: 'Generate',
        sectionTitle: 'Generate (100% Vector Layouts & Logos)',
        label: 'Generate SaaS Product Launch & Mega-Menu Website',
        subtitle:
          'High-fidelity split hero, live app window mockup, 3 feature cards & interactive nested navbar',
        keywords: 'generate saas product launch mega menu website landing page hero',
        badge: 'HI-FI VECTOR',
        badgeTone: 'cyan',
        onExecute: runAndClose(() => onGenerateWebsiteLayout('saas-mega-menu')),
      },
      {
        id: 'cmd-gen-bento-product',
        category: 'Generate',
        sectionTitle: 'Generate (100% Vector Layouts & Logos)',
        label: 'Generate Apple-Style Bento Product Showcase',
        subtitle:
          'Asymmetric 4-cell modular Bento grid with benchmark bars, W3C color tokens & codegen terminal',
        keywords: 'generate apple linear bento grid product showcase layout',
        badge: 'HI-FI VECTOR',
        badgeTone: 'violet',
        onExecute: runAndClose(() => onGenerateWebsiteLayout('bento-product')),
      },
      {
        id: 'cmd-gen-ecommerce-store',
        category: 'Generate',
        sectionTitle: 'Generate (100% Vector Layouts & Logos)',
        label: 'Generate E-Commerce Storefront & Cart Flow',
        subtitle:
          'Luxury D2C hardware storefront with vector product cards, ratings & express checkout bag drawer',
        keywords: 'generate ecommerce storefront cart checkout shop d2c store',
        badge: 'HI-FI VECTOR',
        badgeTone: 'amber',
        onExecute: runAndClose(() => onGenerateWebsiteLayout('ecommerce-store')),
      },
      {
        id: 'cmd-gen-analytics-dashboard',
        category: 'Generate',
        sectionTitle: 'Generate (100% Vector Layouts & Logos)',
        label: 'Generate AI Analytics & Telemetry Dashboard',
        subtitle:
          'Executive SaaS telemetry workspace with collapsible sidebar, 3 KPI sparkline cards & 12-month bar chart',
        keywords: 'generate ai analytics telemetry dashboard kpi chart executive',
        badge: 'HI-FI VECTOR',
        badgeTone: 'emerald',
        onExecute: runAndClose(() => onGenerateWebsiteLayout('analytics-dashboard')),
      },
      {
        id: 'cmd-gen-pricing-faq',
        category: 'Generate',
        sectionTitle: 'Generate (100% Vector Layouts & Logos)',
        label: 'Generate Pricing Tiers & Interactive FAQ',
        subtitle:
          'High-conversion Starter, Pro Studio & Enterprise pricing matrix with feature checklists and FAQ cards',
        keywords: 'generate pricing tiers matrix faq saas conversion',
        badge: 'HI-FI VECTOR',
        badgeTone: 'cyan',
        onExecute: runAndClose(() => onGenerateWebsiteLayout('pricing-faq')),
      },
      {
        id: 'cmd-gen-sitemap-architecture',
        category: 'Generate',
        sectionTitle: 'Generate (100% Vector Layouts & Logos)',
        label: 'Generate Interactive System Architecture & Flow',
        subtitle:
          'Visual information architecture & conversion funnel blueprint with magnetic orthogonal connectors',
        keywords: 'generate interactive system architecture sitemap flow funnel connectors',
        badge: 'AUTO-ROUTING',
        badgeTone: 'violet',
        onExecute: runAndClose(() => onGenerateWebsiteLayout('sitemap-architecture')),
      },

      // 3. Color Themes (1-Click Recolor)
      ...COLOR_THEME_PRESETS.map((theme): PaletteCommandItem => ({
        id: `cmd-theme-${theme.id}`,
        category: 'Themes',
        sectionTitle: 'Color Themes (1-Click Recolor)',
        label: `Apply Theme: ${theme.name}`,
        subtitle: `Recolor all canvas vectors, gradients, buttons & typography (${theme.primary} • ${theme.secondary} • ${theme.accent})`,
        keywords: `color theme recolor palette ${theme.name.toLowerCase()} ${theme.id}`,
        swatchColors: [theme.primary, theme.secondary, theme.accent],
        onExecute: runAndClose(() => onApplyColorTheme(theme)),
      })),

      // 4. Tools & Modes
      {
        id: 'cmd-toggle-preview-mode',
        category: 'Tools',
        sectionTitle: 'Tools & Modes',
        label: 'Toggle Live Interactive Preview Mode (Preview vs Design)',
        subtitle:
          'Test interactive :hover/:active component states and click nested navbar dropdowns live on canvas',
        keywords: 'toggle live interactive preview mode design f12 hover active menu',
        shortcut: 'F12 / 3',
        badge: 'INTERACTIVE',
        badgeTone: 'emerald',
        onExecute: runAndClose(() => onTogglePreviewMode()),
      },
      {
        id: 'cmd-open-code-studio',
        category: 'Tools',
        sectionTitle: 'Tools & Modes',
        label: 'Open Programmable JS AutoShape Code Studio',
        subtitle:
          'Inspect, edit, or author custom parametric JavaScript AutoShapes with live diamond control handles',
        keywords: 'open programmable js autoshape code studio script parametric f9',
        shortcut: 'F9',
        badge: 'JS ENGINE',
        badgeTone: 'amber',
        onExecute: runAndClose(() => onOpenCodeStudio()),
      },
      {
        id: 'cmd-tool-pointer',
        category: 'Tools',
        sectionTitle: 'Tools & Modes',
        label: 'Switch to Pointer Tool',
        subtitle: 'Select, move, scale & manipulate yellow AutoShape parameter handles',
        keywords: 'switch tool pointer select arrow v',
        shortcut: 'V',
        onExecute: runAndClose(() => onSelectTool('pointer')),
      },
      {
        id: 'cmd-tool-subselect',
        category: 'Tools',
        sectionTitle: 'Tools & Modes',
        label: 'Switch to Subselect Tool (Cubic Bezier Nodes)',
        subtitle: 'Direct anchor node and tangent handle editor for vector paths',
        keywords: 'switch tool subselect bezier node anchor handle a',
        shortcut: 'A',
        onExecute: runAndClose(() => onSelectTool('subselect')),
      },
      {
        id: 'cmd-tool-pen',
        category: 'Tools',
        sectionTitle: 'Tools & Modes',
        label: 'Switch to Cubic Bezier Pen Tool',
        subtitle: 'Plot precision vector anchor nodes and smooth cubic curves',
        keywords: 'switch tool pen vector bezier curve draw p',
        shortcut: 'P',
        onExecute: runAndClose(() => onSelectTool('pen')),
      },
      {
        id: 'cmd-tool-marquee',
        category: 'Tools',
        sectionTitle: 'Tools & Modes',
        label: 'Switch to Pixel Marquee Selection Tool',
        subtitle: 'Select rectangular bitmap pixel regions with live Marching Ants',
        keywords: 'switch tool marquee pixel bitmap selection m',
        shortcut: 'M',
        onExecute: runAndClose(() => onSelectTool('marquee-rect')),
      },
      {
        id: 'cmd-tool-wand',
        category: 'Tools',
        sectionTitle: 'Tools & Modes',
        label: 'Switch to Magic Wand Pixel Tool',
        subtitle: 'Flood-select contiguous or global bitmap pixels by color tolerance',
        keywords: 'switch tool magic wand flood select tolerance w',
        shortcut: 'W',
        onExecute: runAndClose(() => onSelectTool('magic-wand')),
      },
      {
        id: 'cmd-tool-connector',
        category: 'Tools',
        sectionTitle: 'Tools & Modes',
        label: 'Switch to Smart Connector Tool',
        subtitle: 'Draw auto-routing orthogonal elbow connectors between N/E/S/W object ports',
        keywords: 'switch tool smart connector lucidchart flow line x',
        shortcut: 'X',
        onExecute: runAndClose(() => onSelectTool('connector')),
      },
      {
        id: 'cmd-tool-slice',
        category: 'Tools',
        sectionTitle: 'Tools & Modes',
        label: 'Switch to Web Slice Tool',
        subtitle: 'Draw and configure multi-scale Retina export slices (@1x/@2x/@3x)',
        keywords: 'switch tool web slice export retina k',
        shortcut: 'K',
        onExecute: runAndClose(() => onSelectTool('slice')),
      },

      // 5. Export & Reset
      ...(onExportReactTailwindAppZip
        ? ([
            {
              id: 'cmd-export-react-tailwind-zip',
              category: 'Export',
              sectionTitle: 'Export & Reset',
              label: 'Export Full React + Tailwind App Repository (.ZIP)',
              subtitle:
                'Download a complete runnable Vite + React 19 + TypeScript + Tailwind CSS project with interactive nested menus & W3C tokens',
              keywords:
                'export full react tailwind app repo zip vite typescript code project deploy',
              badge: 'FULL REPO .ZIP',
              badgeTone: 'emerald',
              onExecute: runAndClose(() => onExportReactTailwindAppZip()),
            },
          ] as PaletteCommandItem[])
        : []),
      {
        id: 'cmd-export-slices-zip',
        category: 'Export',
        sectionTitle: 'Export & Reset',
        label: 'Export Multi-Scale Retina .ZIP Bundle (@1x/@2x/@3x WebP + AVIF + SVG)',
        subtitle:
          'Batch render all active Web Slices into a production-ready multi-scale asset archive with manifest',
        keywords: 'export multi scale retina zip bundle webp avif svg slices batch',
        badge: '@1x/@2x/@3x .ZIP',
        badgeTone: 'cyan',
        onExecute: runAndClose(() => onExportSlicesZip()),
      },
      {
        id: 'cmd-export-svg',
        category: 'Export',
        sectionTitle: 'Export & Reset',
        label: 'Export Crisp Vector .SVG',
        subtitle: 'Download clean standalone SVG code of all visible vector, AutoShape & text layers',
        keywords: 'export crisp vector svg download code',
        badge: '.SVG',
        badgeTone: 'mono',
        onExecute: runAndClose(() => onExportSvg()),
      },
      {
        id: 'cmd-export-png',
        category: 'Export',
        sectionTitle: 'Export & Reset',
        label: 'Export Flattened .PNG',
        subtitle: 'Render and download pixel-perfect flattened PNG @1x of the canvas',
        keywords: 'export flattened png raster image download',
        shortcut: 'Ctrl+Shift+E',
        badge: '.PNG',
        badgeTone: 'mono',
        onExecute: runAndClose(() => onExportPng()),
      },
      {
        id: 'cmd-reset-starter-showcase',
        category: 'Export',
        sectionTitle: 'Export & Reset',
        label: 'Reset Flagship Osito Showcase Scene',
        subtitle: 'Restore the default hybrid bitmap + vector + AutoShape starter showcase canvas',
        keywords: 'reset flagship osito showcase scene demo starter restore',
        onExecute: runAndClose(() => onResetStarterShowcase()),
      },
    ];

    return items;
  }, [
    onClose,
    onOpenCreationStudioTab,
    onInstantSpawnStrategyBoard,
    trimmedQuery,
    scoreLabel,
    onAutoPolishCanvas,
    onOpenDeepResearchWithQuery,
    onGenerateWebsiteLayout,
    onApplyColorTheme,
    onTogglePreviewMode,
    onOpenCodeStudio,
    onSelectTool,
    onExportSlicesZip,
    onExportReactTailwindAppZip,
    onExportSvg,
    onExportPng,
    onResetStarterShowcase,
  ]);

  // Dynamic Instant Deep Research actions when user types >= 2 characters
  const dynamicQueryActions: PaletteCommandItem[] = useMemo(() => {
    if (!hasCustomQuery) return [];
    const runAndClose = (fn: () => void) => () => {
      fn();
      onClose();
    };
    return [
      {
        id: 'dyn-deep-research-dossier',
        category: 'Deep Research',
        sectionTitle: 'Instant Deep Research & Strategy Actions',
        label: `Run Deep Research Dossier for "${trimmedQuery}"`,
        subtitle:
          'Open Deep Research Co-Pilot with synthesized ICP personas, competitor matrix, UVP & color psychology',
        keywords: trimmedQuery,
        shortcut: 'Enter',
        badge: 'DEEP RESEARCH',
        badgeTone: 'cyan',
        isDynamicQueryAction: true,
        onExecute: runAndClose(() => onOpenDeepResearchWithQuery(trimmedQuery)),
      },
      {
        id: 'dyn-instant-spawn-website',
        category: 'Deep Research',
        sectionTitle: 'Instant Deep Research & Strategy Actions',
        label: `Instant 1-Click: Spawn Researched Hi-Fi Website for "${trimmedQuery}"`,
        subtitle:
          'Synthesize domain strategy + auto-generate tailored 100% vector website layout & nested menu in Live Preview',
        keywords: trimmedQuery,
        badge: '1-CLICK WEBSITE',
        badgeTone: 'emerald',
        isDynamicQueryAction: true,
        onExecute: runAndClose(() => onInstantSpawnResearchedWebsite(trimmedQuery)),
      },
      {
        id: 'dyn-instant-spawn-strategy-board',
        category: 'Deep Research',
        sectionTitle: 'Instant Deep Research & Strategy Actions',
        label: `Instant 1-Click: Spawn Executive Competitor & Strategy Board for "${trimmedQuery}"`,
        subtitle:
          'Populate canvas with a 25+ layer executive war-room: competitor teardown, ICP pain points & funnel blueprint',
        keywords: trimmedQuery,
        badge: '1-CLICK WAR ROOM',
        badgeTone: 'violet',
        isDynamicQueryAction: true,
        onExecute: runAndClose(() => onInstantSpawnStrategyBoard(trimmedQuery)),
      },
    ];
  }, [
    hasCustomQuery,
    trimmedQuery,
    onClose,
    onOpenDeepResearchWithQuery,
    onInstantSpawnResearchedWebsite,
    onInstantSpawnStrategyBoard,
  ]);

  const filteredStaticCommands = useMemo(() => {
    const q = trimmedQuery.toLowerCase();
    return staticCommands.filter((item) => {
      if (activeCategory !== 'All' && item.category !== activeCategory) {
        return false;
      }
      if (!q) return true;
      const haystack = `${item.label} ${item.subtitle} ${item.keywords} ${item.category}`.toLowerCase();
      // Match all space-separated tokens or substring
      const tokens = q.split(/\s+/).filter(Boolean);
      return tokens.every((tok) => haystack.includes(tok));
    });
  }, [staticCommands, activeCategory, trimmedQuery]);

  // Combined navigable items list (dynamic query actions first, then filtered static commands)
  const navigableItems: PaletteCommandItem[] = useMemo(() => {
    return [...dynamicQueryActions, ...filteredStaticCommands];
  }, [dynamicQueryActions, filteredStaticCommands]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [trimmedQuery, activeCategory]);

  useEffect(() => {
    const activeEl = itemRefs.current[selectedIndex];
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (navigableItems.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % navigableItems.length);
      }
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (navigableItems.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + navigableItems.length) % navigableItems.length);
      }
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const target = navigableItems[selectedIndex] || navigableItems[0];
      if (target) {
        target.onExecute();
      }
      return;
    }
  };

  const renderBadgeToneClass = (tone?: PaletteCommandItem['badgeTone']) => {
    switch (tone) {
      case 'cyan':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40';
      case 'emerald':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
      case 'amber':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
      case 'violet':
        return 'bg-violet-500/15 text-violet-300 border-violet-500/40';
      default:
        return 'bg-[#222222] text-[#d4d4d4] border-[#404040]';
    }
  };

  const renderCategoryIcon = (item: PaletteCommandItem) => {
    if (item.isDynamicQueryAction) {
      if (item.id === 'dyn-deep-research-dossier') {
        return <Compass className="w-4 h-4 text-cyan-400 shrink-0" />;
      }
      if (item.id === 'dyn-instant-spawn-website') {
        return <Layout className="w-4 h-4 text-emerald-400 shrink-0" />;
      }
      return <Target className="w-4 h-4 text-violet-400 shrink-0" />;
    }
    switch (item.category) {
      case 'Deep Research':
        return <Compass className="w-4 h-4 text-cyan-400 shrink-0" />;
      case 'Canvas Audit':
        return <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'Generate':
        return item.id.includes('logo') ? (
          <Hexagon className="w-4 h-4 text-amber-400 shrink-0" />
        ) : (
          <Layout className="w-4 h-4 text-cyan-400 shrink-0" />
        );
      case 'Themes':
        return <Palette className="w-4 h-4 text-violet-400 shrink-0" />;
      case 'Tools':
        return item.id.includes('preview') ? (
          <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
        ) : item.id.includes('code') ? (
          <Code2 className="w-4 h-4 text-amber-400 shrink-0" />
        ) : (
          <Wrench className="w-4 h-4 text-[#a3a3a3] shrink-0" />
        );
      case 'Export':
        return item.id.includes('reset') ? (
          <RotateCcw className="w-4 h-4 text-[#a3a3a3] shrink-0" />
        ) : (
          <Download className="w-4 h-4 text-[#e5e5e5] shrink-0" />
        );
      default:
        return <Sparkles className="w-4 h-4 text-[#d4d4d4] shrink-0" />;
    }
  };

  // Group static items by sectionTitle while preserving global index in `navigableItems`
  const staticStartIndex = dynamicQueryActions.length;

  return (
    <div
      style={{ zIndex: 9999 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-[2px] flex items-start justify-center pt-[8vh] px-4 z-[9999] select-none rounded-none"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-3xl max-h-[82vh] bg-[#111111] border border-[#525252] shadow-2xl flex flex-col rounded-none font-mono text-xs text-[#e5e5e5] overflow-hidden">
        {/* Top Omnibar Search Header */}
        <div className="px-3.5 py-3 bg-[#161616] border-b border-[#2e2e2e] flex items-center gap-3">
          <div className="w-7 h-7 bg-[#222222] border border-[#484848] flex items-center justify-center shrink-0">
            <Search className="w-4 h-4 text-cyan-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Type a command or any brand/industry to research (e.g. "Solaris Autonomous Drones", "Aether FinTech", "Auto-Polish")...'
            className="flex-1 bg-transparent text-sm text-white placeholder-[#737373] focus:outline-none font-mono"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="px-1.5 py-0.5 bg-[#222222] hover:bg-[#333333] border border-[#404040] text-[10px] text-[#a3a3a3] hover:text-white"
            >
              Clear
            </button>
          )}
          {canvasScoreSummary && (
            <button
              type="button"
              onClick={() => {
                onAutoPolishCanvas();
                onClose();
              }}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold transition shrink-0"
              title="Click to 1-Click Auto-Polish Canvas (WCAG Contrast + Hover States + 1px Pixel Snap)"
            >
              <Wand2 className="w-3 h-3" />
              <span>
                UX {canvasScoreSummary.score}% ({canvasScoreSummary.grade})
              </span>
              {canvasScoreSummary.fixesCount > 0 && (
                <span className="px-1 bg-emerald-400 text-[#0a0a0a] font-extrabold">
                  Fix {canvasScoreSummary.fixesCount}
                </span>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-[#1c1c1c] hover:bg-[#2e2e2e] border border-[#383838] text-[#a3a3a3] hover:text-white transition"
            title="Close Omnibar (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category Filter Pills Bar */}
        <div className="px-3.5 py-2 bg-[#141414] border-b border-[#262626] flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1 flex-wrap">
            {CATEGORY_PILLS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  inputRef.current?.focus();
                }}
                className={`px-2 py-1 text-[10px] uppercase tracking-wider border transition ${
                  activeCategory === cat
                    ? 'bg-[#e5e5e5] text-[#0a0a0a] border-white font-bold'
                    : 'bg-[#1b1b1b] text-[#a3a3a3] border-[#303030] hover:text-white hover:border-[#525252]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-[10px] text-[#737373] hidden md:flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>•</span>
            <span>↵ Execute</span>
            <span>•</span>
            <span>Esc Close</span>
          </div>
        </div>

        {/* Scrollable Omnibar Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#222222]">
          {/* Highlighted Instant Deep Research & Strategy Banner when query >= 2 chars */}
          {hasCustomQuery && (
            <div className="p-2.5 bg-[#151c24] border-b border-cyan-500/30">
              <div className="px-2 pb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Instant Deep Research &amp; Strategy Actions for &ldquo;{trimmedQuery}&rdquo;</span>
                </span>
                <span className="text-[9px] text-cyan-300/80 uppercase">
                  Press Enter to Launch
                </span>
              </div>
              <div className="space-y-1">
                {dynamicQueryActions.map((item, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <button
                      key={item.id}
                      ref={(el) => {
                        itemRefs.current[idx] = el;
                      }}
                      type="button"
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={item.onExecute}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between gap-3 border transition ${
                        isSelected
                          ? 'bg-[#1e293b] border-cyan-400 text-white shadow-md'
                          : 'bg-[#111822] border-[#263244] text-[#d4d4d4] hover:bg-[#192231]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {renderCategoryIcon(item)}
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-white truncate">{item.label}</div>
                          <div className="text-[10px] text-[#94a3b8] truncate mt-0.5">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-bold uppercase border ${renderBadgeToneClass(
                              item.badgeTone
                            )}`}
                          >
                            {item.badge}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 bg-[#0c0c0c] border border-[#404040] text-[10px] text-[#e5e5e5] flex items-center gap-1">
                          <CornerDownLeft className="w-3 h-3" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Static Commands List */}
          <div className="p-2 space-y-1">
            {filteredStaticCommands.length === 0 ? (
              <div className="py-8 px-4 text-center text-[#8c8c8c]">
                <div className="text-xs font-semibold text-white mb-1">
                  {hasCustomQuery
                    ? `Press Enter above to run Deep Research or spawn a tailored layout for "${trimmedQuery}"`
                    : 'No matching studio commands found'}
                </div>
                <div className="text-[11px] text-[#737373]">
                  Type any company name, industry vertical, or tool shortcut (e.g. &ldquo;Solaris Drones&rdquo;, &ldquo;Bento&rdquo;, &ldquo;Auto-Polish&rdquo;, &ldquo;Cyber Cyan&rdquo;).
                </div>
              </div>
            ) : (
              filteredStaticCommands.map((item, localIdx) => {
                const globalIdx = staticStartIndex + localIdx;
                const isSelected = selectedIndex === globalIdx;
                const prevItem = localIdx > 0 ? filteredStaticCommands[localIdx - 1] : null;
                const showSectionHeader =
                  !prevItem || prevItem.sectionTitle !== item.sectionTitle;

                return (
                  <React.Fragment key={item.id}>
                    {showSectionHeader && (
                      <div className="px-2 pt-2 pb-1 text-[9px] font-bold uppercase tracking-wider text-[#737373] flex items-center justify-between">
                        <span>{item.sectionTitle}</span>
                        <span>{item.category}</span>
                      </div>
                    )}
                    <button
                      ref={(el) => {
                        itemRefs.current[globalIdx] = el;
                      }}
                      type="button"
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      onClick={item.onExecute}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between gap-3 border transition ${
                        isSelected
                          ? 'bg-[#222222] border-[#ffffff] text-white'
                          : 'bg-[#151515] border-[#242424] text-[#d4d4d4] hover:bg-[#1c1c1c]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {renderCategoryIcon(item)}
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-white truncate">{item.label}</div>
                          <div className="text-[10px] text-[#8c8c8c] truncate mt-0.5">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.swatchColors && (
                          <span className="flex items-center gap-1 px-1.5 py-1 bg-[#0c0c0c] border border-[#333333]">
                            {item.swatchColors.map((hex, i) => (
                              <span
                                key={`${item.id}-swatch-${i}`}
                                className="w-3 h-3 inline-block border border-[#484848]"
                                style={{ backgroundColor: hex }}
                              />
                            ))}
                          </span>
                        )}
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-bold uppercase border ${renderBadgeToneClass(
                              item.badgeTone
                            )}`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {item.shortcut && (
                          <kbd className="px-1.5 py-0.5 bg-[#0c0c0c] border border-[#404040] text-[10px] text-[#d4d4d4] font-bold">
                            {item.shortcut}
                          </kbd>
                        )}
                      </div>
                    </button>
                  </React.Fragment>
                );
              })
            )}
          </div>
        </div>

        {/* Omnibar Footer */}
        <div className="px-3.5 py-2 bg-[#161616] border-t border-[#2e2e2e] flex items-center justify-between text-[10px] text-[#8c8c8c] flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              Pro Tip: Type any brand or product brief above and press{' '}
              <strong className="text-white">Enter</strong> to launch Deep Research or 1-Click Vector Generation.
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-[#737373]" />
            <span>Ctrl+K / ⌘+K Omnibar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

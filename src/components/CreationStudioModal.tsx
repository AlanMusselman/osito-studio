import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Layout,
  Palette,
  Hexagon,
  Check,
  Wand2,
  Eye,
  Layers,
  Upload,
  Image as ImageIcon,
  Zap,
  RefreshCw,
  Shuffle,
} from 'lucide-react';
import {
  COLOR_THEME_PRESETS,
  ColorThemePalette,
  HarmonyMode,
  LOGO_EMBLEM_STYLES,
  LogoGeneratorConfig,
  LogoOuterFrameShape,
  WEBSITE_LAYOUT_TEMPLATES,
  WebsiteLayoutTemplateId,
  generateColorThemeFromSeed,
  generateLogoVariationsFromPrompt,
} from '../engine/creationEngine';
import {
  DEEP_RESEARCH_PRESETS,
  DeepResearchDossier,
  auditCanvasDesignReadiness,
  runDeepMarketResearch,
} from '../engine/deepResearchEngine';
import { DEFAULT_AUTOSHAPES, evaluateAutoShape } from '../engine/autoshapes';
import { BezierNode, CanvasObject, CanvasSlice } from '../types/editor';
import { LiveColorPicker, shiftHexBrightness } from './LiveColorPicker';

export type CreationStudioTab = 'deep-research' | 'logo' | 'web-layout' | 'color-theme';

export interface CreationStudioModalProps {
  isOpen: boolean;
  initialTab: CreationStudioTab;
  onClose: () => void;
  onGenerateLogo: (config: LogoGeneratorConfig) => void;
  onLivePreviewLogoOnCanvas?: (config: LogoGeneratorConfig) => void;
  onGenerateWebsiteLayout: (
    templateId: WebsiteLayoutTemplateId,
    theme: ColorThemePalette,
    replaceCanvas: boolean,
    switchToPreview: boolean,
    customBrief?: string
  ) => void;
  onApplyColorThemeToCanvas: (theme: ColorThemePalette) => void;
  onSpawnThemeSwatchCard: (theme: ColorThemePalette) => void;
  objects?: CanvasObject[];
  slices?: CanvasSlice[];
  onSpawnStrategyBoard?: (dossier: DeepResearchDossier, replaceCanvas: boolean) => void;
  onAutoPolishCanvas?: (theme?: ColorThemePalette) => void;
  initialResearchQuery?: string;
}

function bezierNodesToSvgPathD(
  nodes: BezierNode[],
  closed: boolean,
  offsetX = 0,
  offsetY = 0
): string {
  if (!nodes || nodes.length === 0) return '';
  const cmds: string[] = [
    `M ${(nodes[0].x + offsetX).toFixed(1)} ${(nodes[0].y + offsetY).toFixed(1)}`,
  ];
  for (let i = 0; i < nodes.length - 1; i++) {
    const curr = nodes[i];
    const next = nodes[i + 1];
    cmds.push(
      `C ${(curr.cp2x + offsetX).toFixed(1)} ${(curr.cp2y + offsetY).toFixed(1)}, ${(next.cp1x + offsetX).toFixed(1)} ${(next.cp1y + offsetY).toFixed(1)}, ${(next.x + offsetX).toFixed(1)} ${(next.y + offsetY).toFixed(1)}`
    );
  }
  if (closed && nodes.length > 1) {
    const last = nodes[nodes.length - 1];
    const first = nodes[0];
    cmds.push(
      `C ${(last.cp2x + offsetX).toFixed(1)} ${(last.cp2y + offsetY).toFixed(1)}, ${(first.cp1x + offsetX).toFixed(1)} ${(first.cp1y + offsetY).toFixed(1)}, ${(first.x + offsetX).toFixed(1)} ${(first.y + offsetY).toFixed(1)} Z`
    );
  }
  return cmds.join(' ');
}

interface LiveVectorLogoSvgPreviewProps {
  config: LogoGeneratorConfig;
  backdropMode?: 'dark' | 'grid' | 'light';
  compact?: boolean;
  uid?: string;
}

const LiveVectorLogoSvgPreview: React.FC<LiveVectorLogoSvgPreviewProps> = ({
  config,
  backdropMode = 'dark',
  compact = false,
  uid = 'main',
}) => {
  const styleMeta =
    LOGO_EMBLEM_STYLES.find((s) => s.id === config.emblemStyle) || LOGO_EMBLEM_STYLES[0];
  const secondaryMeta =
    LOGO_EMBLEM_STYLES.find((s) => s.id === (config.secondaryEmblemStyle || 'hexagon-core')) ||
    LOGO_EMBLEM_STYLES[0];
  const compMode = config.compositionMode || 'layered-crest';
  const frameMode: LogoOuterFrameShape = config.outerFrameShape || 'rounded-rect';
  const layout = config.layout || 'horizontal';
  const wordmarkFont = config.fontFamily || 'Inter';
  const mono = (config.monogramText || '').trim().slice(0, 4);
  const badgePill = (config.badgeText || '').trim();
  const primaryRot = config.markRotation ?? 0;
  const secondaryRot = config.secondaryRotation ?? 30;
  const isTwin = compMode === 'twin-prism';

  const outerShapePaths = useMemo(() => {
    if (frameMode === 'none') return [];
    const size = 96;
    let shapeDefId = 'rounded-rect';
    let params: Record<string, any> = { radius: 22, chamfer: false };
    if (frameMode === 'hexagon') {
      shapeDefId = 'polygon';
      params = { sides: 6, angleDeg: 0 };
    } else if (frameMode === 'circle') {
      shapeDefId = 'rounded-rect';
      params = { radius: 48, chamfer: false };
    } else if (frameMode === 'chamfer') {
      shapeDefId = 'rounded-rect';
      params = { radius: 22, chamfer: true };
    }
    const def = DEFAULT_AUTOSHAPES.find((d) => d.id === shapeDefId) || DEFAULT_AUTOSHAPES[0];
    const evaluated = evaluateAutoShape(def, size, size, params);
    return evaluated.paths.map((p) => ({
      d: bezierNodesToSvgPathD(p.nodes, p.closed, 0, 0),
      closed: p.closed,
    }));
  }, [frameMode]);

  const secondaryMarkPaths = useMemo(() => {
    const size = 76;
    const def =
      DEFAULT_AUTOSHAPES.find((d) => d.id === secondaryMeta.shapeDefId) || DEFAULT_AUTOSHAPES[0];
    const mergedParams = {
      ...secondaryMeta.defaultParams,
      ...(config.secondaryEmblemParams || {}),
    };
    const evaluated = evaluateAutoShape(def, size, size, mergedParams);
    const ox = isTwin ? 20 : 10;
    const oy = isTwin ? 18 : 10;
    return evaluated.paths.map((p) => ({
      d: bezierNodesToSvgPathD(p.nodes, p.closed, ox, oy),
      closed: p.closed,
    }));
  }, [secondaryMeta, config.secondaryEmblemParams, isTwin]);

  const innerMarkPaths = useMemo(() => {
    const size = 64;
    const def =
      DEFAULT_AUTOSHAPES.find((d) => d.id === styleMeta.shapeDefId) || DEFAULT_AUTOSHAPES[0];
    const mergedParams = { ...styleMeta.defaultParams, ...(config.emblemParams || {}) };
    const evaluated = evaluateAutoShape(def, size, size, mergedParams);
    const ox = isTwin ? 10 : 16;
    const oy = isTwin ? 12 : 16;
    return evaluated.paths.map((p) => ({
      d: bezierNodesToSvgPathD(p.nodes, p.closed, ox, oy),
      closed: p.closed,
    }));
  }, [styleMeta, config.emblemParams, isTwin]);

  const gradId = `logo-grad-${uid}`;
  const secGradId = `logo-sec-grad-${uid}`;
  const frameGradId = `logo-frame-grad-${uid}`;
  const shadowId = `logo-shadow-${uid}`;

  const textPrimaryColor = backdropMode === 'light' ? '#0f172a' : '#ffffff';

  return (
    <div
      className={`w-full h-full flex items-center justify-center relative overflow-hidden ${
        compact ? 'p-2.5' : 'p-5'
      }`}
      style={{
        backgroundColor:
          backdropMode === 'light'
            ? '#f8fafc'
            : backdropMode === 'grid'
            ? '#0d1117'
            : '#0c0c0c',
        backgroundImage:
          backdropMode === 'grid'
            ? 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)'
            : 'none',
        backgroundSize: backdropMode === 'grid' ? '16px 16px' : 'auto',
      }}
    >
      <div
        className={`flex ${
          layout === 'stacked'
            ? 'flex-col items-center text-center gap-2'
            : 'items-center gap-3.5'
        } ${compact ? 'scale-[0.84]' : 'scale-100'} transition-transform duration-150`}
      >
        {/* Multi-Layered Procedural Vector Emblem SVG */}
        <svg
          width={96}
          height={96}
          viewBox="0 0 96 96"
          className="shrink-0 overflow-visible"
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.primaryColor} />
              <stop offset="100%" stopColor={config.secondaryColor} />
            </linearGradient>
            <linearGradient id={secGradId} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={config.secondaryColor} />
              <stop offset="100%" stopColor={config.accentColor} />
            </linearGradient>
            <linearGradient id={frameGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#111827" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <filter id={shadowId} x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="rgba(0,0,0,0.55)" />
            </filter>
          </defs>

          {/* 1. Outer Frame Paths */}
          {outerShapePaths.map((p, idx) => (
            <path
              key={`outer-${idx}`}
              d={p.d}
              fill={p.closed ? `url(#${frameGradId})` : 'none'}
              stroke={config.accentColor}
              strokeWidth={2}
              filter={`url(#${shadowId})`}
            />
          ))}

          {/* 2. Secondary Counter-Rotated Harmonic / Twin Prism Layer */}
          {!config.customGraphicDataUrl && (
            <g transform={`rotate(${secondaryRot} 48 48)`}>
              {secondaryMarkPaths.map((p, idx) => (
                <path
                  key={`sec-${idx}`}
                  d={p.d}
                  fill={isTwin && p.closed ? `url(#${secGradId})` : 'none'}
                  fillOpacity={isTwin ? 0.82 : 0}
                  stroke={config.accentColor}
                  strokeWidth={isTwin ? 1.5 : 1.75}
                  strokeOpacity={isTwin ? 0.95 : 0.55}
                  strokeDasharray={compMode === 'orbital-seal' ? '4 3' : undefined}
                />
              ))}
            </g>
          )}

          {/* 3. Primary Vector Emblem or Custom Graphic */}
          {config.customGraphicDataUrl ? (
            <image
              href={config.customGraphicDataUrl}
              x={16}
              y={16}
              width={64}
              height={64}
              preserveAspectRatio="xMidYMid meet"
            />
          ) : (
            <g transform={`rotate(${primaryRot} 48 48)`}>
              {innerMarkPaths.map((p, idx) => (
                <path
                  key={`inner-${idx}`}
                  d={p.d}
                  fill={
                    p.closed
                      ? idx === 0
                        ? `url(#${gradId})`
                        : shiftHexBrightness(config.primaryColor, idx % 2 === 1 ? 18 : -16)
                      : 'none'
                  }
                  fillOpacity={idx === 0 ? 0.96 : 0.78}
                  stroke="#ffffff"
                  strokeWidth={idx === 0 ? 2 : 1.35}
                  strokeLinejoin="miter"
                  filter={idx === 0 ? `url(#${shadowId})` : undefined}
                />
              ))}
            </g>
          )}

          {/* 4. Optional Center Monogram */}
          {mono && (
            <text
              x="48"
              y="54"
              textAnchor="middle"
              fill="#ffffff"
              style={{
                fontFamily: wordmarkFont,
                fontSize: '18px',
                fontWeight: 800,
                letterSpacing: '1.5px',
                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.75))',
              }}
            >
              {mono}
            </text>
          )}
        </svg>

        {/* Wordmark, Accent Bar, Badge Pill & Tagline */}
        {layout !== 'badge-only' && (
          <div className="min-w-0 max-w-[260px]">
            {badgePill && (
              <div
                className="text-[8px] font-mono font-bold tracking-[0.18em] uppercase mb-0.5 truncate"
                style={{ color: config.primaryColor }}
              >
                {badgePill}
              </div>
            )}
            <div
              className="text-xl font-extrabold tracking-wider leading-tight truncate"
              style={{
                fontFamily: wordmarkFont,
                color: textPrimaryColor,
                textShadow:
                  backdropMode === 'light' ? 'none' : '0 2px 8px rgba(0,0,0,0.55)',
              }}
            >
              {config.brandName || 'OSITO STUDIO'}
            </div>
            {config.showAccentRule !== false && (
              <div
                className={`h-1 w-16 my-1 ${layout === 'stacked' ? 'mx-auto' : ''}`}
                style={{
                  background: `linear-gradient(90deg, ${config.primaryColor}, ${config.accentColor})`,
                }}
              />
            )}
            <div
              className="text-[9px] font-mono font-semibold tracking-[0.18em] uppercase mt-0.5 truncate"
              style={{ color: config.accentColor }}
            >
              {config.tagline || 'NEXT-GEN HYBRID DESIGN SYSTEM'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const LIVE_PROMPT_STARTERS = [
  {
    label: 'Security Drone',
    prompt:
      'Osito Sentinel — Autonomous AI Thermal Security Drones in cyan and solar amber',
  },
  {
    label: 'Agentic AI Cloud',
    prompt:
      'NeuralFlow AI — Enterprise Agentic Workflow Engine in neon violet and electric cyan',
  },
  {
    label: 'Artisan Coffee & Roastery',
    prompt:
      'Solis Roasters — Small-Batch Specialty Coffee & Espresso Atelier in warm gold and emerald',
  },
  {
    label: 'Wellness & Sleep',
    prompt:
      'Dabnaps — Restorative Sleep & Recovery Systems in emerald green and gold',
  },
  {
    label: 'FPV Racing League',
    prompt:
      'Velocity FPV — Smart Arena Drone Racing League in crimson red and solar amber',
  },
  {
    label: 'Swiss Architecture',
    prompt:
      'Atelier Vexel — Minimalist Swiss Architectural & Craft Studio in monochrome silver',
  },
];

const CREATIVE_VIBE_CHIPS = [
  { label: '+ Cyber Tech', snippet: ', futuristic cyber tech gear emblem in cyan and indigo' },
  { label: '+ Minimalist Luxury', snippet: ', minimalist editorial serif luxury seal in monochrome silver' },
  { label: '+ Twin Prism', snippet: ', modern overlapping geometric prism in violet and pink' },
  { label: '+ Security Shield', snippet: ', tactical hexagonal security shield crest in cyan and amber' },
  { label: '+ Solar Gold & Emerald', snippet: ', golden ratio ring in emerald and gold' },
  { label: '+ Bold Esports', snippet: ', bold impact display emblem in crimson and gold' },
];

export const CreationStudioModal: React.FC<CreationStudioModalProps> = ({
  isOpen,
  initialTab,
  onClose,
  onGenerateLogo,
  onLivePreviewLogoOnCanvas,
  onGenerateWebsiteLayout,
  onApplyColorThemeToCanvas,
  onSpawnThemeSwatchCard,
  objects,
  slices,
  onSpawnStrategyBoard,
  onAutoPolishCanvas,
  initialResearchQuery,
}) => {
  const [activeTab, setActiveTab] = useState<CreationStudioTab>(initialTab);

  // --- 0. Deep Research & Market Strategy Co-Pilot State ---
  const [researchQuery, setResearchQuery] = useState<string>(
    initialResearchQuery || DEEP_RESEARCH_PRESETS[0].prompt
  );
  const [activeNavPreviewIdx, setActiveNavPreviewIdx] = useState<number>(0);
  const [activeSubNavPreviewIdx, setActiveSubNavPreviewIdx] = useState<number>(0);
  const researchBriefFileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialResearchQuery && initialResearchQuery.trim()) {
      setResearchQuery(initialResearchQuery.trim());
    }
  }, [initialResearchQuery]);

  const dossier: DeepResearchDossier = useMemo(
    () => runDeepMarketResearch(researchQuery),
    [researchQuery]
  );

  const [selectedResearchTemplateId, setSelectedResearchTemplateId] =
    useState<WebsiteLayoutTemplateId>(dossier.recommendedTemplateId);

  useEffect(() => {
    setSelectedResearchTemplateId(dossier.recommendedTemplateId);
  }, [dossier.recommendedTemplateId]);

  const canvasAudit = useMemo(
    () => auditCanvasDesignReadiness(objects || [], slices || []),
    [objects, slices]
  );

  const handleUploadResearchBriefFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      if (content.trim()) {
        setResearchQuery(content.trim());
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // --- 1. Color Theme Maker State ---
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    COLOR_THEME_PRESETS[0].id
  );
  const [useCustomSeed, setUseCustomSeed] = useState<boolean>(false);
  const [seedColor, setSeedColor] = useState<string>('#06b6d4');
  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>('analogous');

  const activeTheme: ColorThemePalette = useMemo(() => {
    if (useCustomSeed) {
      return generateColorThemeFromSeed(
        seedColor,
        harmonyMode,
        `Harmony (${harmonyMode})`
      );
    }
    return (
      COLOR_THEME_PRESETS.find((p) => p.id === selectedPresetId) ||
      COLOR_THEME_PRESETS[0]
    );
  }, [useCustomSeed, seedColor, harmonyMode, selectedPresetId]);

  // --- 2. Open-Ended Prompt-to-Variations Logo Studio State ---
  const initialPrompt =
    'Osito Sentinel — Autonomous AI Thermal Security Drones in cyan and solar amber';
  const [logoPrompt, setLogoPrompt] = useState<string>(initialPrompt);
  const [variationSeed, setVariationSeed] = useState<number>(0);
  const [activeVariationIdx, setActiveVariationIdx] = useState<number>(0);
  const [colorOverride, setColorOverride] = useState<{
    primary: string;
    secondary: string;
    accent: string;
  } | null>(null);
  const [previewBackdrop, setPreviewBackdrop] = useState<'dark' | 'grid' | 'light'>('grid');
  const [syncLiveToCanvas, setSyncLiveToCanvas] = useState<boolean>(false);
  const [customGraphicDataUrl, setCustomGraphicDataUrl] = useState<string | null>(null);
  const [customGraphicName, setCustomGraphicName] = useState<string>('');

  const briefFileInputRef = useRef<HTMLInputElement | null>(null);
  const graphicFileInputRef = useRef<HTMLInputElement | null>(null);

  // Generate 6 distinct creative variations directly from the prompt + variationSeed!
  const logoVariations = useMemo(
    () =>
      generateLogoVariationsFromPrompt(logoPrompt, variationSeed, colorOverride, {
        dataUrl: customGraphicDataUrl,
        name: customGraphicName,
      }),
    [logoPrompt, variationSeed, colorOverride, customGraphicDataUrl, customGraphicName]
  );

  const selectedVariation =
    logoVariations[activeVariationIdx] || logoVariations[0];
  const currentLogoConfig = selectedVariation.config;

  // Reset Live Canvas Sync when the modal closes so re-opening never overwrites the canvas unexpectedly
  useEffect(() => {
    if (!isOpen) {
      setSyncLiveToCanvas(false);
    }
  }, [isOpen]);

  // Stream the selected variation live to the main Osito Canvas when Live Sync is enabled
  useEffect(() => {
    if (isOpen && activeTab === 'logo' && syncLiveToCanvas && onLivePreviewLogoOnCanvas) {
      onLivePreviewLogoOnCanvas(currentLogoConfig);
    }
  }, [isOpen, activeTab, syncLiveToCanvas, currentLogoConfig, onLivePreviewLogoOnCanvas]);

  const applyPromptInRealTime = (nextPromptText: string) => {
    setLogoPrompt(nextPromptText);
    setColorOverride(null);
  };

  const handleUploadBriefFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      applyPromptInRealTime(content);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleUploadCustomGraphic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCustomGraphicDataUrl(String(reader.result || ''));
      setCustomGraphicName(file.name.replace(/\.[^.]+$/, ''));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // --- 3. Website Layout Generator State ---
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<WebsiteLayoutTemplateId>('saas-mega-menu');
  const [websiteBrief, setWebsiteBrief] = useState<string>('');
  const [replaceExistingCanvas, setReplaceExistingCanvas] = useState<boolean>(true);
  const [openInPreviewMode, setOpenInPreviewMode] = useState<boolean>(true);

  if (!isOpen) return null;

  return (
    <div
      style={{ zIndex: 9999 }}
      className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 select-none"
    >
      <div className="w-full max-w-5xl bg-[#111111] border border-[#484848] shadow-2xl rounded-none flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Modal Header */}
        <div className="px-4 py-2.5 bg-[#161616] border-b border-[#2e2e2e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Wand2 className="w-4 h-4 text-[#ffffff]" />
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#ffffff]">
                Osito Deep Research &amp; Creative Generators Studio
              </h2>
              <p className="text-[10px] font-mono text-[#a3a3a3]">
                Deep Market &amp; Competitor Intelligence • 6-Variation Logo Studio • Interactive Nested-Menu Websites • WCAG Themes
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 bg-[#1c1c1c] hover:bg-[#2e2e2e] text-[#a3a3a3] hover:text-[#ffffff] border border-[#383838] rounded-none"
            title="Close Generator Studio"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4-Tab Switcher Bar */}
        <div className="px-4 bg-[#0d0d0d] border-b border-[#2e2e2e] flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('deep-research')}
            className={`px-3.5 py-2 text-xs font-mono flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'deep-research'
                ? 'border-[#ffffff] text-[#ffffff] bg-[#161616] font-bold'
                : 'border-transparent text-[#d4d4d4] hover:text-[#ffffff]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Deep Research &amp; Strategy</span>
            <span className="px-1.5 py-0.2 bg-[#e5e5e5] text-[#0a0a0a] text-[8px] font-mono font-extrabold uppercase">
              CO-PILOT
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logo')}
            className={`px-3.5 py-2 text-xs font-mono flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'logo'
                ? 'border-[#ffffff] text-[#ffffff] bg-[#161616] font-bold'
                : 'border-transparent text-[#a3a3a3] hover:text-[#ffffff]'
            }`}
          >
            <Hexagon className="w-3.5 h-3.5" />
            <span>1. Logo Variations Studio</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('web-layout')}
            className={`px-3.5 py-2 text-xs font-mono flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'web-layout'
                ? 'border-[#ffffff] text-[#ffffff] bg-[#161616] font-bold'
                : 'border-transparent text-[#a3a3a3] hover:text-[#ffffff]'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>2. Website &amp; Nested Menu Generator</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('color-theme')}
            className={`px-3.5 py-2 text-xs font-mono flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'color-theme'
                ? 'border-[#ffffff] text-[#ffffff] bg-[#161616] font-bold'
                : 'border-transparent text-[#a3a3a3] hover:text-[#ffffff]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>3. Color Theme Maker</span>
          </button>
        </div>

        {/* Active Generator Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#111111]">
          {activeTab === 'deep-research' && (
            <div className="space-y-3.5">
              {/* TOP PROMPT & 8 ONE-CLICK INDUSTRY DOSSIER BAR */}
              <div className="p-3.5 bg-[#161616] border border-[#484848] space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#e5e5e5] text-[#0a0a0a] text-[10px] font-mono font-bold uppercase">
                      <Sparkles className="w-3 h-3" />
                      <span>DEEP RESEARCH ENGINE</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-[#ffffff]">
                      Synthesize Competitor Blind Spots, Conversion Copy, Nested IA Menus &amp; WCAG Tokens in 0ms
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      ref={researchBriefFileRef}
                      type="file"
                      accept=".txt,.md,.json,.csv"
                      onChange={handleUploadResearchBriefFile}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => researchBriefFileRef.current?.click()}
                      className="px-2.5 py-1 bg-[#222222] hover:bg-[#333333] border border-[#484848] text-[10px] font-mono text-[#e5e5e5] flex items-center gap-1 transition"
                      title="Upload a .txt, .md, or .json product brief to run Deep Research"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload Brief (.txt/.md)</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={researchQuery}
                    onChange={(e) => setResearchQuery(e.target.value)}
                    placeholder="Type any company, product, or positioning brief (e.g., 'Osito Autonomous — AI Thermal Perimeter Security Drones')..."
                    className="flex-1 min-w-[280px] bg-[#080808] border-2 border-[#737373] focus:border-[#ffffff] px-3 py-2 text-xs font-mono text-[#ffffff] placeholder-[#666666] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setResearchQuery((q) => q.trim() || DEEP_RESEARCH_PRESETS[0].prompt)}
                    className="px-3.5 py-2 bg-[#e5e5e5] hover:bg-[#ffffff] text-[#0a0a0a] border border-[#ffffff] text-xs font-mono font-bold flex items-center gap-1.5 transition"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Run Deep Research</span>
                  </button>
                </div>

                {/* 8 One-Click Industry Dossier Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[9px] font-mono uppercase text-[#a3a3a3] mr-0.5">
                    1-Click Industry Dossiers:
                  </span>
                  {DEEP_RESEARCH_PRESETS.map((preset) => {
                    const isCurrent = dossier.industryId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setResearchQuery(preset.prompt);
                          setActiveNavPreviewIdx(0);
                          setActiveSubNavPreviewIdx(0);
                        }}
                        className={`px-2 py-0.5 text-[9px] font-mono border transition flex items-center gap-1 ${
                          isCurrent
                            ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-bold'
                            : 'bg-[#0c0c0c] hover:bg-[#222222] text-[#d4d4d4] border-[#333333]'
                        }`}
                        title={`${preset.category}: ${preset.prompt}`}
                      >
                        <span>{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5-STEP RESEARCH PIPELINE TRACE BAR */}
              <div className="px-3 py-2 bg-[#0d0d0d] border border-[#2e2e2e] flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {dossier.pipelineSteps.map((st) => (
                    <div
                      key={st.step}
                      className="px-2 py-1 bg-[#151515] border border-[#2e2e2e] flex items-center gap-1.5 text-[9px] font-mono"
                      title={st.detail}
                    >
                      <Check className="w-3 h-3 text-[#ffffff] shrink-0" />
                      <span className="text-[#ffffff] font-bold">
                        {st.step}. {st.title}
                      </span>
                      <span className="text-[#737373]">({st.durationMs}ms)</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-[#1c1c1c] border border-[#484848] text-[9px] font-mono font-bold text-[#ffffff]">
                    VERTICAL: {dossier.industryName.toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 bg-[#e5e5e5] text-[#0a0a0a] text-[9px] font-mono font-bold">
                    CONFIDENCE: {dossier.confidenceScore}%
                  </span>
                </div>
              </div>

              {/* INTERACTIVE 3-COLUMN DEEP RESEARCH DOSSIER VIEW */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
                {/* COLUMN A (4 cols): Competitive Teardown & Unfair Advantage */}
                <div className="lg:col-span-4 bg-[#141414] border border-[#2e2e2e] p-3 flex flex-col justify-between space-y-2.5">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between border-b border-[#262626] pb-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#ffffff]">
                        01 • Competitor UX Teardown
                      </span>
                      <span className="text-[9px] font-mono text-[#a3a3a3]">
                        3 Archetypes Analyzed
                      </span>
                    </div>

                    {dossier.competitors.map((comp, idx) => (
                      <div
                        key={comp.name}
                        className="p-2.5 bg-[#0e0e0e] border border-[#2c2c2c] space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-mono font-bold text-[#ffffff]">
                            {idx + 1}. {comp.name}
                          </span>
                          <span className="px-1.5 py-0.2 bg-[#1f1f1f] border border-[#484848] text-[8px] font-mono uppercase text-[#d4d4d4]">
                            {comp.threatLevel} Threat
                          </span>
                        </div>
                        <div className="text-[9px] font-mono text-[#8a8a8a]">
                          {comp.archetype} • {comp.strength}
                        </div>
                        <div className="text-[10px] font-mono text-[#a3a3a3] pt-0.5">
                          <span className="text-[#737373] font-bold">BLIND SPOT: </span>
                          {comp.uxBlindSpot}
                        </div>
                        <div
                          className="text-[10px] font-mono font-semibold pt-0.5"
                          style={{ color: dossier.recommendedTheme.accent }}
                        >
                          <span className="underline">YOUR UNFAIR EDGE:</span> {comp.unfairAdvantage}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 bg-[#0a0a0a] border border-[#262626] space-y-1">
                    <div className="text-[9px] font-mono font-bold uppercase text-[#ffffff]">
                      Market Opportunity &amp; ICP Pain Point
                    </div>
                    <p className="text-[10px] font-mono text-[#d4d4d4] leading-relaxed">
                      {dossier.marketOpportunitySummary}
                    </p>
                    <div className="text-[9px] font-mono text-[#a3a3a3] pt-1 border-t border-[#1e1e1e]">
                      <span className="text-[#ffffff] font-bold">Target ICP:</span> {dossier.targetAudience}
                    </div>
                  </div>
                </div>

                {/* COLUMN B (4 cols): Conversion Copywriting, Proof Metrics & Nested IA Tree */}
                <div className="lg:col-span-4 bg-[#141414] border border-[#2e2e2e] p-3 flex flex-col justify-between space-y-2.5">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between border-b border-[#262626] pb-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#ffffff]">
                        02 • Conversion Copy &amp; Nested IA
                      </span>
                      <span
                        className="px-1.5 py-0.2 text-[8px] font-mono font-bold uppercase border"
                        style={{
                          backgroundColor: dossier.recommendedTheme.surfaceAlt,
                          color: dossier.recommendedTheme.accent,
                          borderColor: dossier.recommendedTheme.primary,
                        }}
                      >
                        3-SEC HOOK VERIFIED
                      </span>
                    </div>

                    {/* Researched Hero Copy Card */}
                    <div
                      className="p-2.5 border space-y-1"
                      style={{
                        backgroundColor: dossier.recommendedTheme.surface,
                        borderColor: dossier.recommendedTheme.border,
                      }}
                    >
                      <div
                        className="text-[9px] font-mono font-bold uppercase truncate"
                        style={{ color: dossier.recommendedTheme.accent }}
                      >
                        {dossier.eyebrow}
                      </div>
                      <div
                        className="text-sm font-mono font-extrabold leading-tight"
                        style={{ color: dossier.recommendedTheme.textPrimary }}
                      >
                        {dossier.headlineLine1}
                      </div>
                      <div
                        className="text-sm font-mono font-extrabold leading-tight"
                        style={{ color: dossier.recommendedTheme.accent }}
                      >
                        {dossier.headlineLine2}
                      </div>
                      <div
                        className="text-[10px] font-mono leading-snug pt-0.5"
                        style={{ color: dossier.recommendedTheme.textMuted }}
                      >
                        {dossier.subcopyLine1} {dossier.subcopyLine2}
                      </div>
                      <div className="flex items-center gap-2 pt-1.5">
                        <span
                          className="px-2.5 py-1 text-[9px] font-mono font-bold"
                          style={{
                            backgroundColor: dossier.recommendedTheme.primary,
                            color: '#090d16',
                          }}
                        >
                          {dossier.primaryCta}
                        </span>
                        <span
                          className="px-2 py-1 text-[9px] font-mono border"
                          style={{
                            backgroundColor: dossier.recommendedTheme.surfaceAlt,
                            color: dossier.recommendedTheme.textPrimary,
                            borderColor: dossier.recommendedTheme.border,
                          }}
                        >
                          {dossier.secondaryCta}
                        </span>
                      </div>
                    </div>

                    {/* 4 Quantified Proof Metrics */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {dossier.proofMetrics.map((metric) => (
                        <div
                          key={metric}
                          className="px-2 py-1.5 bg-[#0c0c0c] border border-[#2c2c2c] text-[9px] font-mono font-bold text-[#e5e5e5] truncate"
                        >
                          ✦ {metric}
                        </div>
                      ))}
                    </div>

                    {/* Interactive Preview of Researched Nested Navbar IA Tree */}
                    <div className="p-2.5 bg-[#0c0c0c] border border-[#2c2c2c] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold uppercase text-[#ffffff]">
                          Interactive Researched Navbar IA Tree
                        </span>
                        <span className="text-[8px] font-mono text-[#a3a3a3]">
                          Click tabs to inspect L1 &amp; L2
                        </span>
                      </div>

                      {/* Top-Level Nav Pills */}
                      <div className="grid grid-cols-4 gap-1">
                        {dossier.topNavMenus.map((menuLabel, idx) => (
                          <button
                            key={menuLabel}
                            type="button"
                            onClick={() => {
                              setActiveNavPreviewIdx(idx);
                              setActiveSubNavPreviewIdx(0);
                            }}
                            className={`px-1.5 py-1 text-[9px] font-mono truncate border transition ${
                              activeNavPreviewIdx === idx
                                ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-bold'
                                : 'bg-[#161616] text-[#d4d4d4] border-[#333333] hover:border-[#666666]'
                            }`}
                          >
                            {menuLabel}
                          </button>
                        ))}
                      </div>

                      {/* Cascading Level-1 & Level-2 Columns */}
                      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        <div className="space-y-1">
                          <div className="text-[8px] font-mono uppercase text-[#737373]">
                            Level-1 Dropdown
                          </div>
                          {(dossier.level1Menus[activeNavPreviewIdx] || dossier.level1Menus[0]).map(
                            (l1, rIdx) => (
                              <button
                                key={l1}
                                type="button"
                                onClick={() => setActiveSubNavPreviewIdx(rIdx)}
                                className={`w-full text-left px-1.5 py-1 text-[9px] font-mono truncate border ${
                                  activeSubNavPreviewIdx === rIdx
                                    ? 'bg-[#222222] text-[#ffffff] border-[#888888] font-bold'
                                    : 'bg-[#121212] text-[#a3a3a3] border-[#242424]'
                                }`}
                              >
                                {l1}
                              </button>
                            )
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="text-[8px] font-mono uppercase text-[#737373]">
                            Level-2 Submenu
                          </div>
                          {(
                            dossier.level2Submenus[activeSubNavPreviewIdx] ||
                            dossier.level2Submenus[0]
                          ).map((l2) => (
                            <div
                              key={l2}
                              className="px-1.5 py-1 bg-[#141414] border border-[#242424] text-[9px] font-mono text-[#d4d4d4] truncate"
                            >
                              {l2}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Target Website Architecture Selector */}
                  <div className="p-2.5 bg-[#0a0a0a] border border-[#262626] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold uppercase text-[#ffffff]">
                        Target Website Layout Architecture
                      </span>
                      <span className="text-[8px] font-mono text-[#a3a3a3]">
                        Recommended: {dossier.recommendedTemplateId}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {WEBSITE_LAYOUT_TEMPLATES.map((tpl) => {
                        const isSel = selectedResearchTemplateId === tpl.id;
                        return (
                          <button
                            key={tpl.id}
                            type="button"
                            onClick={() => setSelectedResearchTemplateId(tpl.id)}
                            className={`px-1.5 py-1 text-[8.5px] font-mono truncate border transition ${
                              isSel
                                ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-bold'
                                : 'bg-[#141414] text-[#a3a3a3] border-[#2e2e2e] hover:text-white'
                            }`}
                            title={tpl.name}
                          >
                            {tpl.id.replace('-architecture', '').replace('-mega-menu', '-hero')}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* COLUMN C (4 cols): Color Psychology, Brand Crest & Live Canvas UX Audit */}
                <div className="lg:col-span-4 bg-[#141414] border border-[#2e2e2e] p-3 flex flex-col justify-between space-y-2.5">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between border-b border-[#262626] pb-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#ffffff]">
                        03 • Chromatic &amp; Live UX Audit
                      </span>
                      <span className="px-1.5 py-0.2 bg-[#e5e5e5] text-[#0a0a0a] text-[8px] font-mono font-bold">
                        WCAG {dossier.wcagContrastRatio}
                      </span>
                    </div>

                    {/* Researched Brand Crest Preview */}
                    <div className="h-28 w-full border border-[#2c2c2c] relative overflow-hidden">
                      <LiveVectorLogoSvgPreview
                        config={dossier.recommendedLogoConfig}
                        backdropMode="grid"
                        compact
                        uid="dossier-crest-preview"
                      />
                    </div>

                    {/* Researched Color Swatches + Psychology Rationale */}
                    <div className="p-2.5 bg-[#0c0c0c] border border-[#2c2c2c] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold text-[#ffffff]">
                          {dossier.recommendedTheme.name}
                        </span>
                        <div className="flex items-center gap-1">
                          {[
                            dossier.recommendedTheme.primary,
                            dossier.recommendedTheme.secondary,
                            dossier.recommendedTheme.accent,
                            dossier.recommendedTheme.surface,
                            dossier.recommendedTheme.surfaceAlt,
                          ].map((hex, i) => (
                            <span
                              key={i}
                              className="w-3.5 h-3.5 border border-white/40"
                              style={{ backgroundColor: hex }}
                              title={hex}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[9.5px] font-mono text-[#a3a3a3] leading-snug">
                        {dossier.colorPsychologyRationale}
                      </p>
                    </div>

                    {/* LIVE CANVAS UX & CONVERSION AUDIT CARD */}
                    <div className="p-2.5 bg-[#0a0a0a] border border-[#383838] space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[9px] font-mono font-bold uppercase text-[#ffffff]">
                            Live Canvas UX &amp; Conversion Audit
                          </div>
                          <div className="text-[8.5px] font-mono text-[#a3a3a3]">
                            Auditing {(objects || []).length} layers &amp; {(slices || []).length} Retina slices
                          </div>
                        </div>
                        <div className="px-2 py-1 bg-[#e5e5e5] text-[#0a0a0a] font-mono text-xs font-extrabold">
                          {canvasAudit.overallScore}/100 ({canvasAudit.grade})
                        </div>
                      </div>

                      <div className="space-y-1">
                        {canvasAudit.categories.map((cat) => {
                          const pct = Math.round((cat.score / cat.maxScore) * 100);
                          return (
                            <div key={cat.id} className="space-y-0.5" title={cat.summary}>
                              <div className="flex items-center justify-between text-[8.5px] font-mono">
                                <span className="text-[#d4d4d4] truncate">{cat.label}</span>
                                <span className="text-[#ffffff] font-bold">
                                  {cat.score}/{cat.maxScore}
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-[#1c1c1c] overflow-hidden">
                                <div
                                  className="h-full transition-all duration-300"
                                  style={{
                                    width: `${pct}%`,
                                    backgroundColor:
                                      pct >= 90
                                        ? '#10b981'
                                        : pct >= 70
                                        ? dossier.recommendedTheme.accent
                                        : '#f59e0b',
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
                          onClick={() => onAutoPolishCanvas(dossier.recommendedTheme)}
                          className="w-full py-1.5 px-2.5 bg-[#222222] hover:bg-[#e5e5e5] text-[#ffffff] hover:text-[#0a0a0a] border border-[#525252] font-mono text-[10px] font-bold flex items-center justify-center gap-1.5 transition"
                          title="Snap all layers to 1px grid, inject :hover/:active states, apply researched WCAG tokens & ensure Retina slices"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>1-Click Auto-Boost Canvas Score + Apply Theme</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* STICKY FOOTER WITH 4 POWER ACTIONS */}
              <div className="p-3 bg-[#161616] border border-[#484848] flex flex-wrap items-center justify-between gap-2.5">
                <label className="flex items-center gap-2 text-[11px] font-mono text-[#d4d4d4] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={replaceExistingCanvas}
                    onChange={(e) => setReplaceExistingCanvas(e.target.checked)}
                    className="accent-[#ffffff]"
                  />
                  <span>Replace current canvas objects</span>
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const mdLines = [
                        `# ${dossier.brandName} — Executive Deep Research & Strategy Dossier`,
                        `> **Tagline**: ${dossier.tagline} | **Industry**: ${dossier.industryName} | **Confidence**: ${dossier.confidenceScore}%`,
                        ``,
                        `## 1. Market Opportunity & Buyer Psychology`,
                        `- **Target Audience**: ${dossier.targetAudience}`,
                        `- **Primary Buyer Pain Point**: ${dossier.primaryPainPoint}`,
                        `- **3-Second Conversion Hook**: "${dossier.threeSecondHook}"`,
                        `- **Market Opportunity**: ${dossier.marketOpportunitySummary}`,
                        ``,
                        `## 2. High-Converting Copy & Quantified Proof Matrix`,
                        `- **Eyebrow Badge**: \`${dossier.eyebrow}\``,
                        `- **Display H1**: **${dossier.headlineLine1} ${dossier.headlineLine2}**`,
                        `- **Hero Subcopy**: ${dossier.subcopyLine1} ${dossier.subcopyLine2}`,
                        `- **Primary / Secondary CTA**: \`${dossier.primaryCta}\` / \`${dossier.secondaryCta}\``,
                        `- **Proof Metrics**: ${dossier.proofMetrics.map((m) => `\`${m}\``).join(' • ')}`,
                        ``,
                        `## 3. Competitive Teardown & Unfair Visual Advantage`,
                        ...dossier.competitors.map(
                          (c, i) =>
                            `### ${i + 1}. ${c.name} (${c.archetype} — Threat: ${c.threatLevel})\n- **Core Strength**: ${c.strength}\n- **UX Blind Spot**: ${c.uxBlindSpot}\n- **Your Unfair Advantage**: ${c.unfairAdvantage}`
                        ),
                        ``,
                        `## 4. Researched Information Architecture (Level-1 & Level-2 Nested Menus)`,
                        ...dossier.topNavMenus.map(
                          (topMenu, idx) =>
                            `- **${topMenu}**: ${(dossier.level1Menus[idx] || []).join(', ')}`
                        ),
                        ``,
                        `## 5. Chromatic Psychology & WCAG Token System (${dossier.recommendedTheme.name})`,
                        `- **Primary**: \`${dossier.recommendedTheme.primary}\` | **Secondary**: \`${dossier.recommendedTheme.secondary}\` | **Accent**: \`${dossier.recommendedTheme.accent}\``,
                        `- **Surface**: \`${dossier.recommendedTheme.surface}\` | **Surface Alt**: \`${dossier.recommendedTheme.surfaceAlt}\` | **WCAG Contrast**: \`${dossier.wcagContrastRatio}\``,
                        `- **Psychological Rationale**: ${dossier.colorPsychologyRationale}`,
                        `- **Typography Stack**: Display \`${dossier.typographyPairing.display}\` / UI \`${dossier.typographyPairing.ui}\` / Mono \`${dossier.typographyPairing.mono}\``,
                      ].join('\n');
                      const blob = new Blob([mdLines], { type: 'text/markdown;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      const slug =
                        dossier.brandName
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-|-$/g, '') || 'osito-research';
                      a.href = url;
                      a.download = `${slug}-deep-research-dossier.md`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-3 py-2 bg-[#161616] hover:bg-[#282828] text-[#d4d4d4] hover:text-[#ffffff] border border-[#404040] font-mono text-[11px] flex items-center gap-1.5 transition"
                    title="Download the complete Executive Deep Research & Competitive Teardown Dossier as a Markdown (.md) brief"
                  >
                    <span>Export Brief (.MD)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onApplyColorThemeToCanvas(dossier.recommendedTheme);
                    }}
                    className="px-3 py-2 bg-[#1c1c1c] hover:bg-[#2e2e2e] text-[#e5e5e5] border border-[#484848] font-mono text-[11px] flex items-center gap-1.5 transition"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>Apply Researched Theme</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLogoPrompt(researchQuery);
                      setColorOverride({
                        primary: dossier.recommendedTheme.primary,
                        secondary: dossier.recommendedTheme.secondary,
                        accent: dossier.recommendedTheme.accent,
                      });
                      setActiveTab('logo');
                    }}
                    className="px-3 py-2 bg-[#1c1c1c] hover:bg-[#2e2e2e] text-[#e5e5e5] border border-[#484848] font-mono text-[11px] flex items-center gap-1.5 transition"
                  >
                    <Hexagon className="w-3.5 h-3.5" />
                    <span>Open in 6-Variation Logo Studio →</span>
                  </button>

                  {onSpawnStrategyBoard && (
                    <button
                      type="button"
                      onClick={() => {
                        onSpawnStrategyBoard(dossier, replaceExistingCanvas);
                        onClose();
                      }}
                      className="px-3.5 py-2 bg-[#262626] hover:bg-[#383838] text-[#ffffff] border border-[#888888] font-mono text-[11px] font-bold flex items-center gap-1.5 transition"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Spawn Executive Strategy &amp; Teardown Board</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onGenerateWebsiteLayout(
                        selectedResearchTemplateId,
                        dossier.recommendedTheme,
                        replaceExistingCanvas,
                        true,
                        researchQuery
                      );
                      onClose();
                    }}
                    className="px-4 py-2 bg-[#e5e5e5] hover:bg-[#ffffff] text-[#0a0a0a] border border-[#ffffff] font-mono text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Spawn Researched Hi-Fi Website + Live Preview</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logo' && (
            <div className="space-y-4">
              {/* STEP 1: OPEN-ENDED CREATIVE PROMPT BAR */}
              <div className="p-3.5 bg-[#161616] border border-[#484848] space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#e5e5e5] text-[#0a0a0a] text-[10px] font-mono font-bold uppercase">
                      <Zap className="w-3 h-3 fill-current" />
                      <span>CREATIVE PROMPT</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-[#ffffff]">
                      Type what you want — instantly explore 6 creative vector variations below
                    </span>
                  </div>

                  {/* Quick Actions: Remix Variations, Upload Brief, Upload Custom Icon */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setVariationSeed((prev) => prev + 1)}
                      className="px-2.5 py-1 bg-[#e5e5e5] hover:bg-[#ffffff] text-[#0a0a0a] border border-[#ffffff] text-[10px] font-mono font-bold flex items-center gap-1.5 transition"
                      title="Generate 6 fresh creative variations with new geometry & color harmonies"
                    >
                      <Shuffle className="w-3 h-3" />
                      <span>Remix 6 New Variations</span>
                    </button>

                    <input
                      ref={briefFileInputRef}
                      type="file"
                      accept=".txt,.md,.json,.csv"
                      onChange={handleUploadBriefFile}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => briefFileInputRef.current?.click()}
                      className="px-2 py-1 bg-[#222222] hover:bg-[#333333] border border-[#484848] text-[10px] font-mono text-[#e5e5e5] flex items-center gap-1 transition"
                      title="Load a .txt or .md brand brief into the prompt"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Load Brief</span>
                    </button>

                    <input
                      ref={graphicFileInputRef}
                      type="file"
                      accept=".svg,.png,.webp,.jpg,.jpeg,.gif"
                      onChange={handleUploadCustomGraphic}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => graphicFileInputRef.current?.click()}
                      className="px-2 py-1 bg-[#222222] hover:bg-[#333333] border border-[#484848] text-[10px] font-mono text-[#e5e5e5] flex items-center gap-1 transition"
                      title="Upload your own custom SVG/PNG icon into all variations"
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>{customGraphicName ? customGraphicName : 'Upload Icon'}</span>
                    </button>
                    {customGraphicDataUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomGraphicDataUrl(null);
                          setCustomGraphicName('');
                        }}
                        className="px-1.5 py-1 bg-[#262626] hover:bg-[#383838] border border-[#484848] text-[10px] text-white"
                        title="Clear custom uploaded icon"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Open-Ended Prompt Input */}
                <textarea
                  rows={2}
                  value={logoPrompt}
                  onChange={(e) => applyPromptInRealTime(e.target.value)}
                  placeholder="Describe your brand name, tagline, style, or colors (e.g., 'NovaPulse — Quantum Audio Synthesizer in neon violet and cyan' or 'Solis Coffee Roasters — warm gold and emerald')..."
                  className="w-full bg-[#080808] border-2 border-[#737373] focus:border-[#ffffff] rounded-none px-3 py-2 text-xs font-mono text-[#ffffff] placeholder-[#666666] outline-none resize-y leading-relaxed"
                  autoFocus
                />

                {/* Starter Ideas & Creative Vibe Chips */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[9px] font-mono uppercase text-[#737373] mr-0.5">
                      Try Idea:
                    </span>
                    {LIVE_PROMPT_STARTERS.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => applyPromptInRealTime(item.prompt)}
                        className="px-1.5 py-0.5 bg-[#0c0c0c] hover:bg-[#e5e5e5] text-[#a3a3a3] hover:text-[#0a0a0a] border border-[#333333] text-[9px] font-mono transition"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[9px] font-mono uppercase text-[#737373] mr-0.5">
                      Add Vibe:
                    </span>
                    {CREATIVE_VIBE_CHIPS.map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => applyPromptInRealTime(`${logoPrompt.trim()}${chip.snippet}`)}
                        className="px-1.5 py-0.5 bg-[#111111] hover:bg-[#2a2a2a] border border-[#2e2e2e] hover:border-[#737373] text-[9px] font-mono text-[#d4d4d4] hover:text-[#ffffff] transition"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* STEP 2: COMPACT STUDIO TOOLBAR (Live Color Scrubbers + Backdrop + Canvas Sync) */}
              <div className="px-3 py-2 bg-[#141414] border border-[#2e2e2e] flex flex-wrap items-center justify-between gap-3">
                {/* Live Color Scrubbers (Press-and-hold drag to scrub all variations in real time!) */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-mono uppercase text-[#a3a3a3]">
                    Live Colors (Hold &amp; Drag):
                  </span>
                  <div className="flex items-center gap-1.5">
                    <LiveColorPicker
                      value={currentLogoConfig.primaryColor}
                      onChange={(hex) =>
                        setColorOverride({
                          primary: hex,
                          secondary: currentLogoConfig.secondaryColor,
                          accent: currentLogoConfig.accentColor,
                        })
                      }
                      className="w-5 h-5"
                      title="Primary Color — Click or Hold & Drag to scrub live"
                    />
                    <span className="text-[10px] font-mono text-[#d4d4d4] uppercase">
                      {currentLogoConfig.primaryColor}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <LiveColorPicker
                      value={currentLogoConfig.secondaryColor}
                      onChange={(hex) =>
                        setColorOverride({
                          primary: currentLogoConfig.primaryColor,
                          secondary: hex,
                          accent: currentLogoConfig.accentColor,
                        })
                      }
                      className="w-5 h-5"
                      title="Secondary Color — Click or Hold & Drag to scrub live"
                    />
                    <span className="text-[10px] font-mono text-[#d4d4d4] uppercase">
                      {currentLogoConfig.secondaryColor}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <LiveColorPicker
                      value={currentLogoConfig.accentColor}
                      onChange={(hex) =>
                        setColorOverride({
                          primary: currentLogoConfig.primaryColor,
                          secondary: currentLogoConfig.secondaryColor,
                          accent: hex,
                        })
                      }
                      className="w-5 h-5"
                      title="Accent Color — Click or Hold & Drag to scrub live"
                    />
                    <span className="text-[10px] font-mono text-[#d4d4d4] uppercase">
                      {currentLogoConfig.accentColor}
                    </span>
                  </div>
                  {colorOverride && (
                    <button
                      type="button"
                      onClick={() => setColorOverride(null)}
                      className="px-1.5 py-0.5 text-[9px] font-mono bg-[#1f1f1f] hover:bg-[#2e2e2e] border border-[#383838] text-[#a3a3a3] hover:text-white"
                      title="Restore automatic harmony colors across variations"
                    >
                      Auto Harmonies
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setColorOverride({
                        primary: activeTheme.primary,
                        secondary: activeTheme.secondary,
                        accent: activeTheme.accent,
                      })
                    }
                    className="px-1.5 py-0.5 text-[9px] font-mono bg-[#161616] hover:bg-[#282828] border border-[#383838] text-[#d4d4d4] hover:text-white flex items-center gap-1"
                    title={`Sync Logo colors with active Color Theme (${activeTheme.name})`}
                  >
                    <Palette className="w-2.5 h-2.5" />
                    <span>Sync Theme ({activeTheme.name.split(' ')[0]})</span>
                  </button>
                </div>

                {/* Backdrop Mode & Live Canvas Stream */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-[#333333]">
                    {(
                      [
                        { id: 'grid', label: 'Grid' },
                        { id: 'dark', label: 'Dark' },
                        { id: 'light', label: 'Light' },
                      ] as const
                    ).map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => setPreviewBackdrop(bg.id)}
                        className={`px-2 py-0.5 text-[9px] font-mono uppercase ${
                          previewBackdrop === bg.id
                            ? 'bg-[#e5e5e5] text-[#0a0a0a] font-bold'
                            : 'bg-[#0a0a0a] text-[#a3a3a3] hover:text-white'
                        }`}
                      >
                        {bg.label}
                      </button>
                    ))}
                  </div>

                  {onLivePreviewLogoOnCanvas && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextSync = !syncLiveToCanvas;
                        setSyncLiveToCanvas(nextSync);
                        if (nextSync) {
                          onLivePreviewLogoOnCanvas(currentLogoConfig);
                        }
                      }}
                      className={`px-2 py-0.5 text-[9px] font-mono uppercase border flex items-center gap-1 transition ${
                        syncLiveToCanvas
                          ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-bold'
                          : 'bg-[#161616] text-[#d4d4d4] border-[#383838] hover:border-[#888888]'
                      }`}
                      title="Stream your selected variation directly onto the main Osito Canvas in real time"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>Canvas Live Sync: {syncLiveToCanvas ? 'ON' : 'OFF'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* STEP 3: 6 CREATIVE VARIATIONS GALLERY TO CHOOSE FROM */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {logoVariations.map((variation, idx) => {
                  const isSelected = activeVariationIdx === idx;
                  return (
                    <div
                      key={variation.id}
                      onClick={() => setActiveVariationIdx(idx)}
                      onDoubleClick={() => {
                        setSyncLiveToCanvas(false);
                        onGenerateLogo(variation.config);
                        onClose();
                      }}
                      className={`border flex flex-col justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-2 border-[#ffffff] bg-[#1c1c1c] shadow-lg'
                          : 'border border-[#2e2e2e] bg-[#121212] hover:border-[#666666]'
                      }`}
                    >
                      {/* Variation Preview Stage */}
                      <div className="h-44 w-full border-b border-[#242424] relative overflow-hidden">
                        <LiveVectorLogoSvgPreview
                          config={variation.config}
                          backdropMode={previewBackdrop}
                          compact
                          uid={`gallery-var-${idx}`}
                        />
                        <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/75 border border-[#383838] text-[8px] font-mono uppercase text-[#d4d4d4]">
                          {variation.badgeLabel}
                        </span>
                        {isSelected && (
                          <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#e5e5e5] text-[#0a0a0a] text-[8px] font-mono font-bold uppercase flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" />
                            <span>SELECTED</span>
                          </span>
                        )}
                      </div>

                      {/* Card Footer + Direct Use Button */}
                      <div className="p-2.5 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[11px] font-mono font-bold text-[#ffffff] truncate">
                            {variation.title}
                          </div>
                          <div className="text-[9px] font-mono text-[#a3a3a3] truncate">
                            {variation.subtitle}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSyncLiveToCanvas(false);
                            onGenerateLogo(variation.config);
                            onClose();
                          }}
                          className={`px-2.5 py-1 text-[10px] font-mono font-bold shrink-0 border transition ${
                            isSelected
                              ? 'bg-[#e5e5e5] hover:bg-[#ffffff] text-[#0a0a0a] border-[#ffffff]'
                              : 'bg-[#1f1f1f] hover:bg-[#e5e5e5] text-[#e5e5e5] hover:text-[#0a0a0a] border-[#484848]'
                          }`}
                        >
                          Use This
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Action Bar */}
              <div className="p-3 bg-[#161616] border border-[#2e2e2e] flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] font-mono text-[#a3a3a3]">
                  Selected:{' '}
                  <span className="text-[#ffffff] font-bold">{selectedVariation.title}</span> — inserts 100% editable vector paths &amp; text layers on canvas (double-click any card for instant insert).
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVariationSeed((prev) => prev + 1)}
                    className="px-3 py-2 bg-[#222222] hover:bg-[#333333] text-[#ffffff] border border-[#484848] font-mono text-xs flex items-center gap-1.5 transition"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>More Variations</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSyncLiveToCanvas(false);
                      onGenerateLogo(currentLogoConfig);
                      onClose();
                    }}
                    className="px-5 py-2 bg-[#e5e5e5] hover:bg-[#ffffff] text-[#0a0a0a] border border-[#ffffff] font-mono text-xs font-bold flex items-center gap-2 transition"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Insert Selected Design onto Canvas</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'web-layout' && (
            <div className="space-y-4">
              {/* Custom Brand / Website Prompt Bar + Theme Selector */}
              <div className="p-3.5 bg-[#161616] border border-[#2e2e2e] space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#ffffff]" />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#ffffff]">
                      High-Fidelity Website Brand &amp; Copy Brief (100% Vector &amp; Typography — Zero Wireframes)
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] font-mono text-[#a3a3a3]">Theme:</span>
                    {COLOR_THEME_PRESETS.map((preset) => {
                      const active = !useCustomSeed && selectedPresetId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setUseCustomSeed(false);
                            setSelectedPresetId(preset.id);
                          }}
                          className={`px-2 py-0.5 text-[9px] font-mono border flex items-center gap-1 transition ${
                            active
                              ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-bold'
                              : 'bg-[#0e0e0e] text-[#d4d4d4] border-[#333333] hover:border-[#777777]'
                          }`}
                        >
                          <span
                            className="w-2 h-2 border border-white/40"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <span>{preset.name.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                    {useCustomSeed && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('color-theme')}
                        className="px-2 py-0.5 text-[9px] font-mono border bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-bold flex items-center gap-1"
                        title="Custom Harmony Theme active — click to edit in Color Theme Maker"
                      >
                        <span
                          className="w-2 h-2 border border-black/40"
                          style={{ backgroundColor: activeTheme.primary }}
                        />
                        <span>Custom ({activeTheme.primary.toUpperCase()})</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveTab('color-theme')}
                      className="px-1.5 py-0.5 text-[9px] font-mono bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#a3a3a3] hover:text-white border border-[#383838]"
                      title="Open Color Theme Maker to customize seed color or harmony"
                    >
                      Customize →
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={websiteBrief}
                    onChange={(e) => setWebsiteBrief(e.target.value)}
                    placeholder="Optional: Type your brand & product (e.g. 'Osito Sentinel — Autonomous AI Thermal Drones') to customize headlines & copy..."
                    className="flex-1 min-w-[260px] px-3 py-2 bg-[#0a0a0a] border border-[#3a3a3a] focus:border-[#ffffff] text-xs font-mono text-[#ffffff] placeholder-[#737373] outline-none"
                  />
                  {websiteBrief && (
                    <button
                      type="button"
                      onClick={() => setWebsiteBrief('')}
                      className="px-2.5 py-2 bg-[#1c1c1c] hover:bg-[#2a2a2a] text-[#d4d4d4] border border-[#383838] text-[10px] font-mono"
                    >
                      Reset Default Copy
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-mono uppercase text-[#8a8a8a]">
                    Quick Brand Briefs:
                  </span>
                  {LIVE_PROMPT_STARTERS.map((st) => (
                    <button
                      key={st.label}
                      type="button"
                      onClick={() => setWebsiteBrief(st.prompt)}
                      className="px-2 py-0.5 bg-[#0e0e0e] hover:bg-[#242424] text-[#d4d4d4] border border-[#2e2e2e] text-[9px] font-mono transition"
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6 High-Fidelity Website Layout Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {WEBSITE_LAYOUT_TEMPLATES.map((tpl) => {
                  const selected = selectedTemplateId === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      onDoubleClick={() => {
                        onGenerateWebsiteLayout(
                          tpl.id,
                          activeTheme,
                          replaceExistingCanvas,
                          openInPreviewMode,
                          websiteBrief
                        );
                        onClose();
                      }}
                      className={`p-3.5 text-left border rounded-none transition-all flex flex-col justify-between cursor-pointer ${
                        selected
                          ? 'bg-[#1e1e1e] border-2 border-[#ffffff] text-[#ffffff]'
                          : 'bg-[#141414] border border-[#2e2e2e] text-[#d4d4d4] hover:border-[#666666]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono font-bold text-[#ffffff]">
                            {tpl.name}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <span
                              className="px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase border"
                              style={{
                                backgroundColor: activeTheme.surfaceAlt,
                                color: activeTheme.accent,
                                borderColor: activeTheme.primary,
                              }}
                            >
                              HI-FI VECTOR + TEXT
                            </span>
                            {tpl.hasNestedMenu && (
                              <span className="px-1.5 py-0.5 text-[8px] font-mono bg-[#e5e5e5] text-[#0a0a0a] font-bold">
                                NESTED MENU
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-[10px] font-mono text-[#d4d4d4] mt-1">
                          {tpl.subtitle}
                        </div>
                        <p className="text-[11px] text-[#a3a3a3] mt-1.5 leading-relaxed">
                          {tpl.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#262626] flex items-center justify-between">
                        <span className="text-[9px] font-mono text-[#a3a3a3]">
                          Real cards, gradient pills, telemetry charts &amp; editable text
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onGenerateWebsiteLayout(
                              tpl.id,
                              activeTheme,
                              replaceExistingCanvas,
                              openInPreviewMode,
                              websiteBrief
                            );
                            onClose();
                          }}
                          className={`px-2.5 py-1 text-[10px] font-mono font-bold border transition ${
                            selected
                              ? 'bg-[#e5e5e5] hover:bg-[#ffffff] text-[#0a0a0a] border-[#ffffff]'
                              : 'bg-[#1f1f1f] hover:bg-[#e5e5e5] text-[#e5e5e5] hover:text-[#0a0a0a] border-[#484848]'
                          }`}
                        >
                          Use Layout
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Options & Generate Action Bar */}
              <div className="p-3.5 bg-[#161616] border border-[#2e2e2e] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#d4d4d4]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={replaceExistingCanvas}
                      onChange={(e) => setReplaceExistingCanvas(e.target.checked)}
                      className="accent-[#ffffff]"
                    />
                    <span>Replace current canvas objects</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={openInPreviewMode}
                      onChange={(e) => setOpenInPreviewMode(e.target.checked)}
                      className="accent-[#ffffff]"
                    />
                    <span className="text-[#ffffff] font-semibold">
                      Switch to Preview Mode immediately (test Hover States &amp; Nested Dropdown Menus!)
                    </span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onGenerateWebsiteLayout(
                      selectedTemplateId,
                      activeTheme,
                      replaceExistingCanvas,
                      openInPreviewMode,
                      websiteBrief
                    );
                    onClose();
                  }}
                  className="px-5 py-2.5 bg-[#e5e5e5] hover:bg-[#ffffff] text-[#0a0a0a] border border-[#ffffff] font-mono text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <Eye className="w-4 h-4" />
                  <span>Generate High-Fidelity Layout on Canvas</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'color-theme' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Left: Curated Themes + Custom Harmony Generator */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#a3a3a3] mb-1.5">
                    Curated Studio Color Palettes
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {COLOR_THEME_PRESETS.map((preset) => {
                      const isSelected = !useCustomSeed && selectedPresetId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setUseCustomSeed(false);
                            setSelectedPresetId(preset.id);
                          }}
                          className={`p-2.5 border text-left flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-[#262626] border-[#ffffff] text-white'
                              : 'bg-[#161616] border-[#2e2e2e] text-[#d4d4d4] hover:border-[#525252]'
                          }`}
                        >
                          <span className="text-xs font-mono font-semibold truncate pr-2">
                            {preset.name}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            {[preset.primary, preset.secondary, preset.accent, preset.surface].map(
                              (hex, i) => (
                                <span
                                  key={i}
                                  className="w-3.5 h-3.5 border border-white/30"
                                  style={{ backgroundColor: hex }}
                                />
                              )
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Seed Color + Color Harmony Rule */}
                <div className="p-3.5 bg-[#161616] border border-[#2e2e2e] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#e5e5e5] font-semibold">
                      Custom Brand Seed &amp; Algorithmic Harmony
                    </span>
                    <label className="flex items-center gap-1.5 text-[11px] font-mono text-[#d4d4d4] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useCustomSeed}
                        onChange={(e) => setUseCustomSeed(e.target.checked)}
                        className="accent-[#ffffff]"
                      />
                      <span>Use Custom Seed</span>
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#d4d4d4]">
                      <span>Seed Hex:</span>
                      <LiveColorPicker
                        value={seedColor}
                        onChange={(hex) => {
                          setSeedColor(hex);
                          setUseCustomSeed(true);
                        }}
                        className="w-7 h-7"
                        title="Seed Color — Click or Hold & Drag to scrub harmony live"
                      />
                      <span className="uppercase text-white">{seedColor}</span>
                    </div>

                    <div className="flex items-center gap-1 flex-wrap">
                      {(
                        [
                          'analogous',
                          'complementary',
                          'triadic',
                          'split-complementary',
                          'monochromatic',
                        ] as HarmonyMode[]
                      ).map((hm) => (
                        <button
                          key={hm}
                          type="button"
                          onClick={() => {
                            setHarmonyMode(hm);
                            setUseCustomSeed(true);
                          }}
                          className={`px-2 py-1 text-[10px] font-mono border uppercase ${
                            useCustomSeed && harmonyMode === hm
                              ? 'bg-[#e5e5e5] text-[#0a0a0a] border-[#ffffff] font-bold'
                              : 'bg-[#0a0a0a] text-[#a3a3a3] border-[#2e2e2e] hover:text-white'
                          }`}
                        >
                          {hm}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Active Theme Swatches & One-Click Apply Actions */}
              <div className="md:col-span-5 bg-[#0a0a0a] border border-[#2e2e2e] p-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="text-xs font-mono font-bold text-white uppercase">
                    Active Theme: {activeTheme.name}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { role: 'Primary Brand', hex: activeTheme.primary },
                      { role: 'Secondary Accent', hex: activeTheme.secondary },
                      { role: 'Highlight Glow', hex: activeTheme.accent },
                      { role: 'Surface Dark', hex: activeTheme.surface },
                      { role: 'Card Elevated', hex: activeTheme.surfaceAlt },
                      { role: 'Typography Light', hex: activeTheme.textPrimary },
                    ].map((sw) => (
                      <div
                        key={sw.role}
                        className="p-2 bg-[#141414] border border-[#262626] flex items-center gap-2.5"
                      >
                        <span
                          className="w-7 h-7 border border-white/40 shrink-0"
                          style={{ backgroundColor: sw.hex }}
                        />
                        <div className="min-w-0">
                          <div className="text-[10px] font-mono text-[#a3a3a3] truncate">
                            {sw.role}
                          </div>
                          <div className="text-xs font-mono font-bold text-white uppercase">
                            {sw.hex}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      onApplyColorThemeToCanvas(activeTheme);
                      onClose();
                    }}
                    className="w-full py-2.5 px-4 bg-[#e5e5e5] hover:bg-[#ffffff] text-[#0a0a0a] border border-[#ffffff] font-mono text-xs font-bold flex items-center justify-center gap-2 transition"
                  >
                    <Palette className="w-4 h-4" />
                    <span>Apply Color Theme to Entire Canvas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSpawnThemeSwatchCard(activeTheme);
                      onClose();
                    }}
                    className="w-full py-2 px-4 bg-[#1c1c1c] hover:bg-[#2a2a2a] text-[#ffffff] border border-[#484848] font-mono text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Insert Color Theme Swatch Card on Canvas</span>
                  </button>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('web-layout')}
                      className="py-1.5 px-2 bg-[#141414] hover:bg-[#242424] text-[#d4d4d4] hover:text-white border border-[#383838] font-mono text-[10px] flex items-center justify-center gap-1.5 transition"
                    >
                      <Layout className="w-3 h-3" />
                      <span>Use in Website Layout →</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setColorOverride({
                          primary: activeTheme.primary,
                          secondary: activeTheme.secondary,
                          accent: activeTheme.accent,
                        });
                        setActiveTab('logo');
                      }}
                      className="py-1.5 px-2 bg-[#141414] hover:bg-[#242424] text-[#d4d4d4] hover:text-white border border-[#383838] font-mono text-[10px] flex items-center justify-center gap-1.5 transition"
                    >
                      <Hexagon className="w-3 h-3" />
                      <span>Use in Logo Studio →</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

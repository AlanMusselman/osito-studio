import {
  AutoShapeObject,
  BezierNode,
  BitmapObject,
  CanvasObject,
  ConnectionPortId,
  TextObject,
  VectorPathObject,
} from '../types/editor';
import { createSmartConnectorObject } from './connectorEngine';
import { runDeepMarketResearch } from './deepResearchEngine';

// ============================================================================
// 1. COLOR THEME MAKER ENGINE (HSL Harmony + Curated Presets + WCAG Contrast)
// ============================================================================

export type HarmonyMode =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'split-complementary'
  | 'monochromatic';

export interface ColorThemePalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  surfaceAlt: string;
  textPrimary: string;
  textMuted: string;
  border: string;
}

export const COLOR_THEME_PRESETS: ColorThemePalette[] = [
  {
    id: 'cyber-cyan',
    name: 'Cyber Cyan & Indigo',
    primary: '#06b6d4',
    secondary: '#6366f1',
    accent: '#38bdf8',
    surface: '#111827',
    surfaceAlt: '#1e293b',
    textPrimary: '#f8fafc',
    textMuted: '#94a3b8',
    border: '#38bdf8',
  },
  {
    id: 'emerald-fintech',
    name: 'Emerald FinTech Pro',
    primary: '#10b981',
    secondary: '#059669',
    accent: '#34d399',
    surface: '#0f172a',
    surfaceAlt: '#1e293b',
    textPrimary: '#f0fdf4',
    textMuted: '#94a3b8',
    border: '#34d399',
  },
  {
    id: 'solar-amber',
    name: 'Solar Amber & Violet',
    primary: '#f59e0b',
    secondary: '#8b5cf6',
    accent: '#fbbf24',
    surface: '#18181b',
    surfaceAlt: '#27272a',
    textPrimary: '#fffbeb',
    textMuted: '#a1a1aa',
    border: '#fbbf24',
  },
  {
    id: 'crimson-neon',
    name: 'Crimson Neon Studio',
    primary: '#f43f5e',
    secondary: '#ec4899',
    accent: '#fb7185',
    surface: '#141418',
    surfaceAlt: '#231f29',
    textPrimary: '#fff1f2',
    textMuted: '#a1a1aa',
    border: '#fb7185',
  },
  {
    id: 'royal-violet',
    name: 'Royal Violet SaaS',
    primary: '#8b5cf6',
    secondary: '#ec4899',
    accent: '#a78bfa',
    surface: '#0f1021',
    surfaceAlt: '#1e1b4b',
    textPrimary: '#f5f3ff',
    textMuted: '#94a3b8',
    border: '#a78bfa',
  },
  {
    id: 'oceanic-coral',
    name: 'Oceanic Teal & Coral',
    primary: '#14b8a6',
    secondary: '#f97316',
    accent: '#2dd4bf',
    surface: '#0f172a',
    surfaceAlt: '#132a38',
    textPrimary: '#f0fdfa',
    textMuted: '#94a3b8',
    border: '#2dd4bf',
  },
  {
    id: 'swiss-monochrome',
    name: 'Monochrome Swiss Architect',
    primary: '#e5e5e5',
    secondary: '#737373',
    accent: '#ffffff',
    surface: '#141414',
    surfaceAlt: '#242424',
    textPrimary: '#ffffff',
    textMuted: '#a3a3a3',
    border: '#a3a3a3',
  },
];

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  if (!hex || typeof hex !== 'string') {
    return { h: 190, s: 85, l: 50 };
  }
  const trimmed = hex.trim();
  if (
    !trimmed ||
    trimmed === 'none' ||
    trimmed === 'transparent' ||
    trimmed.startsWith('rgb') ||
    trimmed.startsWith('hsl')
  ) {
    return { h: 190, s: 85, l: 50 };
  }
  const clean = trimmed.replace(/^#+/, '');
  if (!/^[0-9a-fA-F]{3,8}$/.test(clean)) {
    return { h: 190, s: 85, l: 50 };
  }
  const full =
    clean.length === 3 || clean.length === 4
      ? clean
          .slice(0, 3)
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.slice(0, 6).padEnd(6, '0');
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
    return { h: 190, s: 85, l: 50 };
  }

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  const safeH = Number.isFinite(h) ? h : 190;
  const safeS = Number.isFinite(s) ? s : 85;
  const safeL = Number.isFinite(l) ? l : 50;
  const hNorm = ((safeH % 360) + 360) % 360;
  const sNorm = Math.max(0, Math.min(100, safeS)) / 100;
  const lNorm = Math.max(0, Math.min(100, safeL)) / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((hNorm / 60) % 2) - 1));
  const m = lNorm - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (hNorm < 60) {
    r = c;
    g = x;
  } else if (hNorm < 120) {
    r = x;
    g = c;
  } else if (hNorm < 180) {
    g = c;
    b = x;
  } else if (hNorm < 240) {
    g = x;
    b = c;
  } else if (hNorm < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  const toHex = (v: number) =>
    Math.max(0, Math.min(255, Math.round((v + m) * 255)))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function shiftHexBrightness(hex: string, delta: number): string {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, s, Math.max(4, Math.min(96, l + delta)));
}

/**
 * Returns a high-contrast foreground text color ('#090d16' dark ink or '#ffffff' crisp white)
 * based on the perceived luminance of a background hex color (e.g., for Swiss Monochrome '#e5e5e5').
 */
export function getReadableTextColorForBg(bgHex: string): string {
  const clean = (bgHex || '').replace('#', '').trim();
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.padEnd(6, '0').slice(0, 6);
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return '#ffffff';
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 165 ? '#090d16' : '#ffffff';
}

export function generateColorThemeFromSeed(
  seedHex: string,
  harmony: HarmonyMode,
  name = 'Custom Harmony Theme'
): ColorThemePalette {
  const { h, s, l } = hexToHsl(seedHex);
  const sat = Math.max(35, s);
  const light = Math.max(42, Math.min(65, l));

  let h2 = (h + 180) % 360;
  let h3 = (h + 30) % 360;

  if (harmony === 'analogous') {
    h2 = (h + 32) % 360;
    h3 = (h + 328) % 360;
  } else if (harmony === 'triadic') {
    h2 = (h + 120) % 360;
    h3 = (h + 240) % 360;
  } else if (harmony === 'split-complementary') {
    h2 = (h + 150) % 360;
    h3 = (h + 210) % 360;
  } else if (harmony === 'monochromatic') {
    h2 = h;
    h3 = h;
  }

  const primary = hslToHex(h, s, light);
  const secondary =
    harmony === 'monochromatic'
      ? hslToHex(h, Math.max(15, s - 20), Math.max(25, light - 18))
      : hslToHex(h2, sat, light);
  const accent =
    harmony === 'monochromatic'
      ? hslToHex(h, Math.min(100, s + 10), Math.min(82, light + 18))
      : hslToHex(h3, Math.min(95, sat + 10), Math.min(72, light + 12));
  const surface = hslToHex(h, Math.min(35, s), 10);
  const surfaceAlt = hslToHex(h2, Math.min(32, s), 16);
  const textPrimary = hslToHex(h, 25, 96);
  const textMuted = hslToHex(h, 16, 68);
  const border = accent;

  return {
    id: `theme-${Date.now()}`,
    name,
    primary,
    secondary,
    accent,
    surface,
    surfaceAlt,
    textPrimary,
    textMuted,
    border,
  };
}

/**
 * Recolors existing canvas objects harmoniously using the active ColorThemePalette.
 */
export function applyColorThemeToCanvasObjects(
  objects: CanvasObject[],
  theme: ColorThemePalette
): CanvasObject[] {
  const primaryBtnTextColor = getReadableTextColorForBg(theme.primary);
  const isBrightPrimary = primaryBtnTextColor === '#090d16';
  const primaryGradEnd = isBrightPrimary
    ? shiftHexBrightness(theme.primary, -12)
    : theme.secondary;

  return objects.map((obj, idx) => {
    if (obj.type === 'bitmap') return obj;
    const lowerName = obj.name.toLowerCase();

    if (obj.type === 'text') {
      if (lowerName.includes('cta') || lowerName.includes('primary btn')) {
        return { ...obj, fill: primaryBtnTextColor };
      }
      if (
        lowerName.includes('badge') ||
        lowerName.includes('eyebrow') ||
        lowerName.includes('accent') ||
        lowerName.includes('metric') ||
        lowerName.includes('price')
      ) {
        return { ...obj, fill: theme.accent };
      }
      if (
        lowerName.includes('sub') ||
        lowerName.includes('muted') ||
        lowerName.includes('desc') ||
        lowerName.includes('meta') ||
        (obj.fontSize <= 11 && obj.fontWeight === '400')
      ) {
        return { ...obj, fill: theme.textMuted };
      }
      return {
        ...obj,
        fill: theme.textPrimary,
      };
    }

    if (obj.type === 'vector-path' && (obj as VectorPathObject).connectorMeta) {
      return {
        ...obj,
        stroke: theme.accent,
      };
    }

    if (lowerName.includes('token swatch')) {
      const tokenSwatches = [
        theme.primary,
        theme.secondary,
        theme.accent,
        theme.surfaceAlt,
        theme.textPrimary,
      ];
      const swColor = tokenSwatches[idx % tokenSwatches.length];
      return {
        ...obj,
        fill: swColor,
        fillGradientEnd: swColor,
        stroke: theme.border,
      };
    }

    const isPrimaryCta =
      lowerName.includes('primary') ||
      lowerName.includes('cta') ||
      lowerName.includes('accent bar') ||
      lowerName.includes('chart bar') ||
      lowerName.includes('progress fill');
    const isBadgeOrPill =
      lowerName.includes('badge') ||
      lowerName.includes('pill') ||
      lowerName.includes('nav btn') ||
      lowerName.includes('navbar menu') ||
      lowerName.includes('studio button') ||
      lowerName.includes('filter') ||
      lowerName.includes('tab');
    const isSurfaceBlock =
      !isPrimaryCta &&
      !isBadgeOrPill &&
      (lowerName.includes('card') ||
        lowerName.includes('surface') ||
        lowerName.includes('stage') ||
        lowerName.includes('strip') ||
        lowerName.includes('flow node') ||
        lowerName.includes('panel') ||
        lowerName.includes('track') ||
        lowerName.includes('navbar') ||
        lowerName.includes('sidebar') ||
        lowerName.includes('window') ||
        lowerName.includes('drawer') ||
        lowerName.includes('row') ||
        (obj.width >= 180 && obj.height >= 44));

    const nextFill = isPrimaryCta
      ? theme.primary
      : isBadgeOrPill
      ? theme.surfaceAlt
      : isSurfaceBlock
      ? idx % 2 === 0
        ? theme.surface
        : theme.surfaceAlt
      : idx % 2 === 0
      ? theme.primary
      : theme.secondary;
    const nextGrad = isPrimaryCta
      ? primaryGradEnd
      : isSurfaceBlock || isBadgeOrPill
      ? theme.surfaceAlt
      : theme.secondary;
    const nextStroke = isPrimaryCta
      ? theme.accent
      : isBadgeOrPill
      ? theme.accent
      : isSurfaceBlock
      ? theme.border
      : theme.accent;

    return {
      ...obj,
      fill: obj.fill === 'none' ? 'none' : nextFill,
      fillGradientEnd: nextGrad,
      stroke: obj.stroke === 'none' ? 'none' : nextStroke,
      stateVariants: {
        default: {
          fill: obj.fill === 'none' ? 'none' : nextFill,
          fillGradientEnd: nextGrad,
          stroke: obj.stroke === 'none' ? 'none' : nextStroke,
          strokeWidth: obj.strokeWidth,
          opacity: obj.opacity,
        },
        hover: {
          fill: isSurfaceBlock ? theme.surfaceAlt : theme.accent,
          fillGradientEnd: theme.primary,
          stroke: '#ffffff',
          strokeWidth: Math.max(1.5, obj.strokeWidth),
          opacity: 1,
          offsetY: -2,
          scale: 1.01,
        },
        active: {
          fill: theme.secondary,
          fillGradientEnd: theme.surface,
          stroke: theme.accent,
          strokeWidth: Math.max(2, obj.strokeWidth),
          opacity: 0.96,
          offsetY: 1,
          scale: 0.99,
        },
        dark: {
          fill: theme.surface,
          fillGradientEnd: theme.surfaceAlt,
          stroke: theme.border,
          strokeWidth: obj.strokeWidth,
          opacity: 1,
        },
      },
    };
  });
}

/**
 * Spawns a High-Fidelity Color Theme Swatch Palette Card directly onto the canvas (100% Vector + Text, zero wireframe AutoShapes).
 */
export function createColorThemeSwatchCardObjects(
  theme: ColorThemePalette,
  canvasWidth: number,
  canvasHeight: number
): CanvasObject[] {
  const stamp = Date.now();
  const baseX = Math.max(24, Math.round(canvasWidth / 2 - 220));
  const baseY = Math.max(24, Math.round(canvasHeight / 2 - 90));
  const swatches = [
    { label: 'PRIMARY', color: theme.primary },
    { label: 'SECONDARY', color: theme.secondary },
    { label: 'ACCENT', color: theme.accent },
    { label: 'SURFACE', color: theme.surface },
    { label: 'CARD ALT', color: theme.surfaceAlt },
  ];

  const cardBg: VectorPathObject = {
    id: `theme-card-bg-${stamp}`,
    name: `Theme Card Surface: ${theme.name}`,
    type: 'vector-path',
    visible: true,
    locked: false,
    x: baseX,
    y: baseY,
    width: 440,
    height: 168,
    rotation: 0,
    opacity: 1,
    blendMode: 'source-over',
    fill: theme.surface,
    fillType: 'linear-gradient',
    fillGradientEnd: theme.surfaceAlt,
    stroke: theme.border,
    strokeWidth: 1.5,
    strokeAlign: 'inside',
    pixelSnap: true,
    shadow: { enabled: true, color: 'rgba(0,0,0,0.55)', blur: 18, offsetX: 0, offsetY: 6 },
    closed: true,
    nodes: [
      { id: 'n0', x: 0, y: 0, cp1x: 0, cp1y: 0, cp2x: 0, cp2y: 0, pointType: 'corner' },
      { id: 'n1', x: 440, y: 0, cp1x: 440, cp1y: 0, cp2x: 440, cp2y: 0, pointType: 'corner' },
      { id: 'n2', x: 440, y: 168, cp1x: 440, cp1y: 168, cp2x: 440, cp2y: 168, pointType: 'corner' },
      { id: 'n3', x: 0, y: 168, cp1x: 0, cp1y: 168, cp2x: 0, cp2y: 168, pointType: 'corner' },
    ],
  };

  const titleTxt: TextObject = {
    id: `theme-card-title-${stamp}`,
    name: `${theme.name} Title`,
    type: 'text',
    visible: true,
    locked: false,
    x: baseX + 18,
    y: baseY + 14,
    width: 400,
    height: 24,
    rotation: 0,
    opacity: 1,
    blendMode: 'source-over',
    fill: theme.textPrimary,
    fillType: 'solid',
    fillGradientEnd: theme.accent,
    stroke: 'none',
    strokeWidth: 0,
    strokeAlign: 'center',
    pixelSnap: true,
    shadow: { enabled: false, color: 'rgba(0,0,0,0.4)', blur: 4, offsetX: 0, offsetY: 2 },
    text: `${theme.name.toUpperCase()} — DOCUMENT COLOR TOKENS`,
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'left',
    letterSpacing: 0.8,
  };

  const swatchObjects: CanvasObject[] = [];
  swatches.forEach((sw, i) => {
    const sx = baseX + 18 + i * 82;
    const sy = baseY + 52;
    const chip: VectorPathObject = {
      id: `theme-swatch-${stamp}-${i}`,
      name: `${sw.label} (${sw.color})`,
      type: 'vector-path',
      visible: true,
      locked: false,
      x: sx,
      y: sy,
      width: 74,
      height: 74,
      rotation: 0,
      opacity: 1,
      blendMode: 'source-over',
      fill: sw.color,
      fillType: 'solid',
      fillGradientEnd: sw.color,
      stroke: '#ffffff',
      strokeWidth: 1.5,
      strokeAlign: 'inside',
      pixelSnap: true,
      shadow: { enabled: true, color: 'rgba(0,0,0,0.4)', blur: 8, offsetX: 0, offsetY: 3 },
      closed: true,
      nodes: [
        { id: 'c0', x: 0, y: 0, cp1x: 0, cp1y: 0, cp2x: 0, cp2y: 0, pointType: 'corner' },
        { id: 'c1', x: 74, y: 0, cp1x: 74, cp1y: 0, cp2x: 74, cp2y: 0, pointType: 'corner' },
        { id: 'c2', x: 74, y: 74, cp1x: 74, cp1y: 74, cp2x: 74, cp2y: 74, pointType: 'corner' },
        { id: 'c3', x: 0, y: 74, cp1x: 0, cp1y: 74, cp2x: 0, cp2y: 74, pointType: 'corner' },
      ],
    };
    const hexLabel: TextObject = {
      id: `theme-hex-${stamp}-${i}`,
      name: `${sw.label} Hex`,
      type: 'text',
      visible: true,
      locked: false,
      x: sx,
      y: sy + 80,
      width: 74,
      height: 20,
      rotation: 0,
      opacity: 1,
      blendMode: 'source-over',
      fill: theme.textPrimary,
      fillType: 'solid',
      fillGradientEnd: theme.textPrimary,
      stroke: 'none',
      strokeWidth: 0,
      strokeAlign: 'center',
      pixelSnap: true,
      shadow: { enabled: false, color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
      text: sw.color.toUpperCase(),
      fontFamily: 'JetBrains Mono',
      fontSize: 10,
      fontWeight: '600',
      textAlign: 'center',
      letterSpacing: 0,
    };
    swatchObjects.push(chip, hexLabel);
  });

  return [cardBg, titleTxt, ...swatchObjects];
}

// ============================================================================
// 2. LOGO & BRAND MARK GENERATOR ENGINE
// ============================================================================

export type LogoEmblemStyleId =
  | 'hexagon-core'
  | 'shield-crest'
  | 'orbit-atom'
  | 'isometric-cube'
  | 'golden-rings'
  | 'lightning-badge'
  | 'star-compass'
  | 'swiss-grid';

export type LogoLayoutMode = 'horizontal' | 'stacked' | 'badge-only';

export type LogoOuterFrameShape = 'rounded-rect' | 'hexagon' | 'circle' | 'chamfer' | 'none';

export type LogoCompositionMode =
  | 'layered-crest'
  | 'twin-prism'
  | 'orbital-seal'
  | 'minimal-iconic'
  | 'cyber-emblem'
  | 'badge-medallion';

export interface LogoGeneratorConfig {
  brandName: string;
  tagline: string;
  emblemStyle: LogoEmblemStyleId;
  emblemParams?: Record<string, any>;
  layout: LogoLayoutMode;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  // Creative Multi-Layer Composition Fields
  compositionMode?: LogoCompositionMode;
  secondaryEmblemStyle?: LogoEmblemStyleId;
  secondaryEmblemParams?: Record<string, any>;
  markRotation?: number;
  secondaryRotation?: number;
  showAccentRule?: boolean;
  variationTitle?: string;
  variationSubtitle?: string;
  // User-Provided Custom Content Extensions
  userBriefContent?: string;
  monogramText?: string;
  badgeText?: string;
  fontFamily?: string;
  outerFrameShape?: LogoOuterFrameShape;
  customGraphicDataUrl?: string | null;
  customGraphicName?: string;
}

export interface LogoVariationItem {
  id: string;
  title: string;
  subtitle: string;
  badgeLabel: string;
  config: LogoGeneratorConfig;
}

export interface AnalyzedBrandContentResult {
  brandName: string;
  tagline: string;
  monogramText: string;
  badgeText: string;
  emblemStyle: LogoEmblemStyleId;
  emblemParams?: Record<string, any>;
  outerFrameShape: LogoOuterFrameShape;
  layout: LogoLayoutMode;
  fontFamily: string;
  suggestedPresetId: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  extractedHexColor?: string;
  summaryReason: string;
  detectedTokens: string[];
}

const PROMPT_NAMED_COLOR_MAP: Array<{ regex: RegExp; name: string; hex: string }> = [
  { regex: /\b(cyan|aqua|electric blue)\b/i, name: 'Cyan', hex: '#06b6d4' },
  { regex: /\b(sky|azure|ice blue)\b/i, name: 'Sky Blue', hex: '#38bdf8' },
  { regex: /\b(blue|cobalt|sapphire|navy)\b/i, name: 'Cobalt Blue', hex: '#3b82f6' },
  { regex: /\b(indigo|ultramarine)\b/i, name: 'Indigo', hex: '#6366f1' },
  { regex: /\b(violet|purple|amethyst|neon purple)\b/i, name: 'Neon Violet', hex: '#8b5cf6' },
  { regex: /\b(magenta|fuchsia|neon pink)\b/i, name: 'Magenta', hex: '#d946ef' },
  { regex: /\b(pink|rose|flamingo)\b/i, name: 'Rose Pink', hex: '#ec4899' },
  { regex: /\b(crimson|red|scarlet|ruby)\b/i, name: 'Crimson', hex: '#ef4444' },
  { regex: /\b(coral|orange|tangerine|rust)\b/i, name: 'Solar Orange', hex: '#f97316' },
  { regex: /\b(amber|gold|golden|yellow|honey|sun)\b/i, name: 'Solar Amber', hex: '#f59e0b' },
  { regex: /\b(emerald|green|mint|forest|jade|lime)\b/i, name: 'Emerald', hex: '#10b981' },
  { regex: /\b(teal|turquoise)\b/i, name: 'Teal', hex: '#14b8a6' },
  { regex: /\b(mono|monochrome|white|silver|platinum|chrome)\b/i, name: 'Monochrome', hex: '#e5e5e5' },
  { regex: /\b(slate|graphite|steel|charcoal|dark)\b/i, name: 'Graphite', hex: '#94a3b8' },
];

/**
 * Deterministic Tier-1 ($0.00) Real-Time Natural-Language Logo Prompt & Brief Synthesizer.
 * Runs at 0ms on every keystroke as the user types what they want in the prompt box.
 */
export function analyzeUserContentForLogo(rawText: string): AnalyzedBrandContentResult {
  const clean = (rawText || '').trim();
  const lines = clean
    .split(/\r?\n/)
    .map((l) => l.replace(/^[#*\->\s]+/, '').trim())
    .filter(Boolean);
  const lower = clean.toLowerCase();
  const detectedTokens: string[] = [];

  // 1. Extract Brand Name (supports natural language "logo for X", "called X", "Brand: X", or direct title)
  let brandName = 'OSITO STUDIO';
  const explicitBrandMatch = clean.match(
    /(?:brand|company|name|project|title|app)\s*[:=-]\s*([^\n,;|—–]+)/i
  );
  const conversationalForMatch = clean.match(
    /\b(?:logo\s+for|brand\s+for|badge\s+for|icon\s+for|mark\s+for|crest\s+for|emblem\s+for|called|named|titled)\s+["']?([A-Za-z0-9][A-Za-z0-9\s.&'-]{0,24}?)(?=\s+(?:with|in|using|featuring|that|having|—|–|-|\||,|\.)|\s*$)/i
  );
  const quotedMatch = clean.match(/"([^"]{2,28})"/);

  if (explicitBrandMatch && explicitBrandMatch[1] && /[A-Za-z0-9]/.test(explicitBrandMatch[1])) {
    brandName = explicitBrandMatch[1].trim().slice(0, 26).toUpperCase();
  } else if (conversationalForMatch && conversationalForMatch[1] && /[A-Za-z0-9]/.test(conversationalForMatch[1])) {
    brandName = conversationalForMatch[1].trim().slice(0, 26).toUpperCase();
  } else if (quotedMatch && quotedMatch[1] && /[A-Za-z0-9]/.test(quotedMatch[1])) {
    brandName = quotedMatch[1].trim().slice(0, 26).toUpperCase();
  } else if (lines.length > 0) {
    // Strip conversational verbs or leading "logo for" phrases at the start of the prompt if present
    const strippedFirst = lines[0]
      .replace(
        /^(?:please\s+)?(?:(?:create|make|design|generate|build|draw)\s+)?(?:a|an|the)?\s*(?:modern|minimalist|futuristic|bold|clean|luxury|tech|cyber|geometric|custom|vector)?\s*(?:logo|badge|emblem|icon|mark|crest)\s+(?:for|of)\s+/i,
        ''
      )
      .replace(
        /^(?:please\s+)?(?:create|make|design|generate|build|draw)\s+(?:a|an|the)?\s*(?:modern|minimalist|futuristic|bold|clean|luxury|tech|cyber|geometric|custom|vector)?\s*(?:logo|badge|emblem|icon|mark|crest)?\s*(?:for|of)?\s*/i,
        ''
      )
      .trim();
    // Split on colon, em-dash, en-dash, pipe, bullet, comma, or spaced hyphen (" - "), preserving intra-word hyphens like "X-Wing" or "Co-Pilot"
    const firstSegment = (strippedFirst || lines[0])
      .split(/\s+[-—–]\s+|[:—–|•,]/)
      [0].trim();
    const stopWordsCleaned = firstSegment
      .replace(/\s+(?:with|in|featuring|using|stacked|horizontal|badge).*$/i, '')
      .trim();
    const words = stopWordsCleaned.split(/\s+/).slice(0, 3).join(' ');
    if (words.length >= 1 && /[A-Za-z0-9]/.test(words)) {
      brandName = words.slice(0, 24).toUpperCase();
    }
  }
  detectedTokens.push(`Brand: ${brandName}`);

  // 2. Extract Tagline / Subtitle (or synthesize an industry-matched tagline in real time)
  let tagline = '';
  const explicitTaglineMatch = clean.match(
    /(?:tagline|slogan|subtitle|mission|value|pitch)\s*[:=-]?\s*["']?([^\n,|—–"']+)/i
  );
  if (explicitTaglineMatch && explicitTaglineMatch[1]) {
    tagline = explicitTaglineMatch[1].trim().slice(0, 44).toUpperCase();
  } else if (lines.length > 1 && !/^(?:industry|style|color|layout|frame)/i.test(lines[1])) {
    tagline = lines[1].slice(0, 44).toUpperCase();
  } else if (lines.length >= 1 && /(?:\s+[-—–]\s+|[:—–|•])/.test(lines[0])) {
    const segments = lines[0]
      .split(/\s+[-—–]\s+|[:—–|•]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (segments.length >= 2) {
      const candidate = segments[1]
        .replace(/\b(?:in\s+[a-z]+\s+and\s+[a-z]+|stacked|horizontal|badge\s*only).*$/i, '')
        .trim();
      if (candidate.length >= 3) {
        tagline = candidate.slice(0, 44).toUpperCase();
      }
    }
  }

  // 3. Match Industry / Vibe Keywords + Parametric Geometry Overrides
  let emblemStyle: LogoEmblemStyleId = 'hexagon-core';
  let emblemParams: Record<string, any> | undefined = undefined;
  let outerFrameShape: LogoOuterFrameShape = 'rounded-rect';
  let layout: LogoLayoutMode = 'horizontal';
  let fontFamily = 'Inter';
  let suggestedPresetId = COLOR_THEME_PRESETS[0].id;
  let summaryReason = 'Balanced tech-forward geometric mark';
  let fallbackTagline = 'NEXT-GEN HYBRID DESIGN SYSTEM';

  if (/(drone|flight|aerial|uav|fpv|avionics|robotics|hardware|gear|motor|auto|mech|industrial)/.test(lower)) {
    emblemStyle = /(shield|defense|security|guard|sentinel)/.test(lower)
      ? 'shield-crest'
      : 'lightning-badge';
    outerFrameShape = 'hexagon';
    fontFamily = 'JetBrains Mono';
    suggestedPresetId = 'solar-amber';
    fallbackTagline = 'AUTONOMOUS AERIAL ROBOTICS & FLIGHT SYSTEMS';
    summaryReason = 'Robotics & Flight keywords → Hexagon Crest + Precision Tech Typography';
  } else if (/(security|shield|defense|cyber|guard|trust|safe|protect|auth|sentinel|vault|armor)/.test(lower)) {
    emblemStyle = 'shield-crest';
    outerFrameShape = 'rounded-rect';
    fontFamily = 'Inter';
    suggestedPresetId = 'cyber-cyan';
    fallbackTagline = 'ENTERPRISE CYBERSECURITY & PERIMETER DEFENSE';
    summaryReason = 'Security & Defense keywords → Security Shield Emblem + Cyber Cyan';
  } else if (/(ai|neural|intelligence|agent|agentic|llm|spark|quantum|brain|model|synapse|cognitive)/.test(lower)) {
    emblemStyle = 'orbit-atom';
    outerFrameShape = 'circle';
    fontFamily = 'Inter';
    suggestedPresetId = 'royal-violet';
    fallbackTagline = 'AGENTIC NEURAL INTELLIGENCE PLATFORM';
    summaryReason = 'AI & Neural keywords → Radiant Starburst + Circle Medallion';
  } else if (/(cloud|data|database|server|storage|infra|pipeline|sql|analytics|compute|cluster|cube)/.test(lower)) {
    emblemStyle = 'isometric-cube';
    outerFrameShape = 'chamfer';
    fontFamily = 'JetBrains Mono';
    suggestedPresetId = 'cyber-cyan';
    fallbackTagline = 'CLOUD DATA INFRASTRUCTURE & ANALYTICS';
    summaryReason = 'Cloud & Data keywords → 3D Isometric Core + Chamfer Tech Plate';
  } else if (/(compass|travel|map|outdoor|explore|adventure|global|nav|route|atlas|wayfinder|north)/.test(lower)) {
    emblemStyle = 'star-compass';
    outerFrameShape = 'circle';
    fontFamily = 'Georgia';
    suggestedPresetId = 'emerald-fintech';
    fallbackTagline = 'GLOBAL NAVIGATION & EXPEDITION SYSTEMS';
    summaryReason = 'Navigation & Exploration keywords → North Star Compass + Circle Frame';
  } else if (/(finance|bank|capital|wealth|crypto|gold|ring|loop|metric|eco|wellness|sleep|calm|cycle|orbit)/.test(lower)) {
    emblemStyle = 'golden-rings';
    outerFrameShape = 'circle';
    fontFamily = 'Inter';
    suggestedPresetId = 'emerald-fintech';
    fallbackTagline = 'SUSTAINABLE SYSTEMS & HARMONIC BALANCE';
    summaryReason = 'Ring / Loop / Wellness / Finance keywords → Golden Ratio Ring + Circle';
  } else if (/(studio|arch|design|minimal|luxury|swiss|fashion|editorial|coffee|artisan|atelier|craft)/.test(lower)) {
    emblemStyle = 'swiss-grid';
    outerFrameShape = 'chamfer';
    fontFamily = 'Georgia';
    suggestedPresetId = 'swiss-monochrome';
    fallbackTagline = 'ARCHITECTURAL DESIGN & CRAFT ATELIER';
    summaryReason = 'Studio / Artisan / Swiss keywords → Chamfer Frame + Editorial Serif';
  }

  // Explicit shape keywords in the prompt override the industry default!
  if (/\b(gear|cog|sprocket|wheel|mech)\b/.test(lower)) {
    emblemStyle = 'lightning-badge';
    const teethMatch = lower.match(/(\d{1,2})\s*(?:-|\s)?(?:teeth|tooth|cog)/);
    if (teethMatch) {
      emblemParams = {
        teeth: Math.max(5, Math.min(20, parseInt(teethMatch[1], 10))),
        toothDepth: 0.24,
        holeRadiusRatio: 0.38,
        holeRatio: 0.38,
      };
    }
    detectedTokens.push('Mark: Velocity Gear');
  } else if (/\b(shield|crest|coat of arms|aegis)\b/.test(lower)) {
    emblemStyle = 'shield-crest';
    detectedTokens.push('Mark: Security Shield');
  } else if (/\b(starburst|atom|spark|burst|nova|sunburst)\b/.test(lower)) {
    emblemStyle = 'orbit-atom';
    const ptMatch = lower.match(/(\d{1,2})\s*(?:-|\s)?(?:point|pt|ray)/);
    if (ptMatch) {
      emblemParams = {
        points: Math.max(5, Math.min(20, parseInt(ptMatch[1], 10))),
        innerRadiusRatio: 0.44,
        innerRatio: 0.44,
      };
    }
    detectedTokens.push('Mark: Neural Starburst');
  } else if (/\b(compass|north star|4-point|four point)\b/.test(lower)) {
    emblemStyle = 'star-compass';
    detectedTokens.push('Mark: Star Compass');
  } else if (/\b(ring|donut|torus|crescent|circle mark|halo|loop)\b/.test(lower)) {
    emblemStyle = 'golden-rings';
    detectedTokens.push('Mark: Golden Donut Ring');
  } else if (/\b(cylinder|database|stack|3d|cube|isometric)\b/.test(lower)) {
    emblemStyle = 'isometric-cube';
    detectedTokens.push('Mark: 3D Isometric Core');
  } else if (/\b(triangle|delta|pyramid)\b/.test(lower)) {
    emblemStyle = 'hexagon-core';
    emblemParams = { sides: 3, angleDeg: -90 };
    detectedTokens.push('Mark: Delta Triangle');
  } else if (/\b(diamond|rhombus)\b/.test(lower)) {
    emblemStyle = 'hexagon-core';
    emblemParams = { sides: 4, angleDeg: 0 };
    detectedTokens.push('Mark: Diamond Core');
  } else if (/\b(octagon|8-sided|eight sided)\b/.test(lower)) {
    emblemStyle = 'hexagon-core';
    emblemParams = { sides: 8, angleDeg: 22.5 };
    detectedTokens.push('Mark: Octagon Core');
  } else if (/\b(pentagon|5-sided)\b/.test(lower)) {
    emblemStyle = 'hexagon-core';
    emblemParams = { sides: 5, angleDeg: -90 };
    detectedTokens.push('Mark: Pentagon Core');
  } else if (/\b(hexagon|hex)\b/.test(lower)) {
    emblemStyle = 'hexagon-core';
    emblemParams = { sides: 6, angleDeg: 0 };
    detectedTokens.push('Mark: Hexagon Core');
  }

  // Explicit Outer Frame overrides from prompt
  if (/\b(no frame|frameless|without frame|unframed)\b/.test(lower)) {
    outerFrameShape = 'none';
    detectedTokens.push('Frame: None');
  } else if (/\b(hex frame|hexagon frame|hexagon crest|hexagonal)\b/.test(lower)) {
    outerFrameShape = 'hexagon';
    detectedTokens.push('Frame: Hexagon');
  } else if (/\b(circle frame|circle medallion|round badge|circular|medallion)\b/.test(lower)) {
    outerFrameShape = 'circle';
    detectedTokens.push('Frame: Circle');
  } else if (/\b(chamfer|bevel|cut corner|tech plate)\b/.test(lower)) {
    outerFrameShape = 'chamfer';
    detectedTokens.push('Frame: Chamfer');
  } else if (/\b(rounded shield|squircle|app icon frame|rounded rect)\b/.test(lower)) {
    outerFrameShape = 'rounded-rect';
    detectedTokens.push('Frame: Rounded Shield');
  }

  // Explicit Layout Mode overrides from prompt
  if (/\b(badge only|icon only|app icon|emblem only|mark only|symbol only)\b/.test(lower)) {
    layout = 'badge-only';
    detectedTokens.push('Layout: Badge Only');
  } else if (/\b(stacked|vertical|centered|crest layout)\b/.test(lower)) {
    layout = 'stacked';
    detectedTokens.push('Layout: Stacked');
  } else if (/\b(horizontal|wide|side-by-side|banner)\b/.test(lower)) {
    layout = 'horizontal';
    detectedTokens.push('Layout: Horizontal');
  }

  // Explicit Typography overrides from prompt
  if (/\b(mono|monospace|code|terminal|tech font|jetbrains)\b/.test(lower)) {
    fontFamily = 'JetBrains Mono';
    detectedTokens.push('Font: JetBrains Mono');
  } else if (/\b(serif|editorial|luxury|classic|georgia)\b/.test(lower)) {
    fontFamily = 'Georgia';
    detectedTokens.push('Font: Georgia Serif');
  } else if (/\b(bold|heavy|impact|display|esports|sport)\b/.test(lower)) {
    fontFamily = 'Impact';
    detectedTokens.push('Font: Impact Display');
  } else if (/\b(sans|modern|clean|inter|geometric)\b/.test(lower)) {
    fontFamily = 'Inter';
    detectedTokens.push('Font: Inter Sans');
  }

  if (!tagline) {
    tagline = fallbackTagline;
  }

  // 4. Compute Monogram (or suppress if user typed "no monogram")
  let monogramText = '';
  const customMonoMatch = clean.match(/\bmonogram\s*[:=-]\s*([A-Za-z0-9]{1,4})\b/i);
  if (/\b(no monogram|without monogram|hide monogram|no initials)\b/.test(lower)) {
    monogramText = '';
  } else if (customMonoMatch && customMonoMatch[1]) {
    monogramText = customMonoMatch[1].toUpperCase();
  } else {
    const brandWords = brandName
      .replace(/[^A-Z0-9\s-]/g, '')
      .trim()
      .split(/[\s-]+/)
      .filter(Boolean);
    monogramText =
      brandWords.length >= 2
        ? `${brandWords[0][0]}${brandWords[1][0]}`
        : brandName.replace(/[^A-Z0-9]/g, '').slice(0, 2) || 'OS';
  }

  // 5. Extract Year / Domain for Badge Pill Text
  const yearMatch = clean.match(/\b(19\d{2}|20\d{2})\b/);
  const estYear = yearMatch ? `EST. ${yearMatch[1]}` : 'EST. 2026';
  const domainMatch = clean.match(/\b([a-z0-9-]+\.(?:com|io|ai|dev|org|co|net|app))\b/i);
  const badgeText = /\b(no badge|hide badge)\b/.test(lower)
    ? ''
    : domainMatch
    ? `${estYear} • ${domainMatch[1].toUpperCase()}`
    : `${estYear} • VERIFIED MARK`;

  // 6. Extract Colors (Hex codes or Named Colors in the prompt)
  const hexMatches = clean.match(/#[0-9a-fA-F]{6}\b/g) || [];
  const matchedNamedColors: Array<{ name: string; hex: string }> = [];
  for (const item of PROMPT_NAMED_COLOR_MAP) {
    if (item.regex.test(lower)) {
      matchedNamedColors.push({ name: item.name, hex: item.hex });
    }
  }

  if (/(red|crimson|rose|coral|fire)/.test(lower)) suggestedPresetId = 'crimson-neon';
  else if (/(green|emerald|forest|mint|nature|eco)/.test(lower)) suggestedPresetId = 'emerald-fintech';
  else if (/(gold|amber|yellow|orange|sun|warm)/.test(lower)) suggestedPresetId = 'solar-amber';
  else if (/(purple|violet|indigo|magenta)/.test(lower)) suggestedPresetId = 'royal-violet';
  else if (/(mono|black|white|grey|gray|minimal)/.test(lower)) suggestedPresetId = 'swiss-monochrome';

  const presetTheme =
    COLOR_THEME_PRESETS.find((p) => p.id === suggestedPresetId) || COLOR_THEME_PRESETS[0];

  let primaryColor = presetTheme.primary;
  let secondaryColor = presetTheme.secondary;
  let accentColor = presetTheme.accent;

  if (hexMatches.length >= 1) {
    primaryColor = hexMatches[0] || presetTheme.primary;
    secondaryColor = hexMatches[1] || presetTheme.secondary;
    accentColor = hexMatches[2] || hexMatches[1] || presetTheme.accent;
    detectedTokens.push(`Color: ${hexMatches.join(' + ')}`);
  } else if (matchedNamedColors.length >= 1) {
    primaryColor = matchedNamedColors[0].hex;
    if (matchedNamedColors.length >= 2) {
      secondaryColor = matchedNamedColors[1].hex;
      accentColor = matchedNamedColors[2]?.hex || matchedNamedColors[1].hex;
      detectedTokens.push(
        `Colors: ${matchedNamedColors.map((c) => c.name).slice(0, 3).join(' + ')}`
      );
    } else {
      const seeded = generateColorThemeFromSeed(primaryColor, 'analogous');
      secondaryColor = seeded.secondary;
      accentColor = seeded.accent;
      detectedTokens.push(`Color: ${matchedNamedColors[0].name}`);
    }
  } else {
    detectedTokens.push(`Theme: ${presetTheme.name}`);
  }

  return {
    brandName,
    tagline,
    monogramText,
    badgeText,
    emblemStyle,
    emblemParams,
    outerFrameShape,
    layout,
    fontFamily,
    suggestedPresetId,
    primaryColor,
    secondaryColor,
    accentColor,
    extractedHexColor: hexMatches[0] || matchedNamedColors[0]?.hex,
    summaryReason,
    detectedTokens,
  };
}

export const LOGO_EMBLEM_STYLES: Array<{
  id: LogoEmblemStyleId;
  name: string;
  description: string;
  shapeDefId: string;
  defaultParams: Record<string, any>;
}> = [
  {
    id: 'hexagon-core',
    name: 'Hexagon Cyber Core',
    description: 'Precision 6-sided geometric emblem with inner core ring',
    shapeDefId: 'polygon',
    defaultParams: { sides: 6, angleDeg: 0, cutoutRatio: 0.34 },
  },
  {
    id: 'shield-crest',
    name: 'Security Shield Emblem',
    description: 'Enterprise trust crest with balanced shoulders & badge frame',
    shapeDefId: 'badge-shield',
    defaultParams: { shoulderRatio: 0.45, tipCurve: 0.55 },
  },
  {
    id: 'orbit-atom',
    name: 'AI Neural Starburst',
    description: 'Multi-point radiant vector mark for AI & deep-tech brands',
    shapeDefId: 'star',
    defaultParams: { points: 8, innerRadiusRatio: 0.46, innerRatio: 0.46 },
  },
  {
    id: 'isometric-cube',
    name: 'Isometric 3D Cylinder / Core',
    description: '3D infrastructural mark for cloud, data, and dev platforms',
    shapeDefId: 'database-cylinder',
    defaultParams: { capRatio: 0.28, tiers: 3 },
  },
  {
    id: 'golden-rings',
    name: 'Precision Donut Ring',
    description: 'Clean concentric geometric ring with golden-ratio cutout',
    shapeDefId: 'pie-donut',
    defaultParams: { startAngle: 0, endAngle: 310, sweepAngle: 310, innerRadiusRatio: 0.56, innerRadius: 0.56 },
  },
  {
    id: 'lightning-badge',
    name: 'Velocity Gear Crest',
    description: 'High-precision mechanical/automation cog emblem',
    shapeDefId: 'gear',
    defaultParams: { teeth: 10, toothDepth: 0.22, holeRadiusRatio: 0.38, holeRatio: 0.38 },
  },
  {
    id: 'star-compass',
    name: 'North Star Compass',
    description: '4-point directional compass star with sharp vector facets',
    shapeDefId: 'star',
    defaultParams: { points: 4, innerRadiusRatio: 0.32, innerRatio: 0.32 },
  },
  {
    id: 'swiss-grid',
    name: 'Minimalist Chamfer Frame',
    description: 'Architectural 45-degree chamfered badge mark',
    shapeDefId: 'rounded-rect',
    defaultParams: { radius: 22, chamfer: true },
  },
];

export function generateLogoVariationsFromPrompt(
  rawPrompt: string,
  variationSeed = 0,
  colorOverride?: { primary: string; secondary: string; accent: string } | null,
  customGraphic?: { dataUrl: string | null; name: string }
): LogoVariationItem[] {
  const parsed = analyzeUserContentForLogo(rawPrompt);
  const allEmblemIds = LOGO_EMBLEM_STYLES.map((s) => s.id);
  const baseIdx = Math.max(0, allEmblemIds.indexOf(parsed.emblemStyle));
  const pickEmblem = (offset: number): LogoEmblemStyleId =>
    allEmblemIds[(baseIdx + offset + variationSeed * 2) % allEmblemIds.length];

  const basePrimary = colorOverride?.primary || parsed.primaryColor;
  const baseSecondary = colorOverride?.secondary || parsed.secondaryColor;
  const baseAccent = colorOverride?.accent || parsed.accentColor;

  // Compute creative color harmonies for variations when no hard override is locked
  const compTheme = generateColorThemeFromSeed(basePrimary, 'complementary');
  const triadTheme = generateColorThemeFromSeed(basePrimary, 'triadic');
  const splitTheme = generateColorThemeFromSeed(basePrimary, 'split-complementary');

  const rotStep = (variationSeed % 4) * 15;

  const baseCommon = {
    brandName: parsed.brandName,
    tagline: parsed.tagline,
    userBriefContent: rawPrompt,
    customGraphicDataUrl: customGraphic?.dataUrl ?? null,
    customGraphicName: customGraphic?.name ?? '',
  };

  return [
    {
      id: `var-1-${variationSeed}`,
      title: '01 • Signature Layered Crest',
      subtitle: 'Multi-layer counter-rotated geometry + precision wordmark',
      badgeLabel: 'LAYERED CREST',
      config: {
        ...baseCommon,
        compositionMode: 'layered-crest',
        emblemStyle: variationSeed === 0 ? parsed.emblemStyle : pickEmblem(0),
        emblemParams: variationSeed === 0 ? parsed.emblemParams : undefined,
        secondaryEmblemStyle: pickEmblem(3),
        markRotation: rotStep,
        secondaryRotation: 30 + rotStep,
        outerFrameShape: parsed.outerFrameShape === 'none' ? 'hexagon' : parsed.outerFrameShape,
        layout: 'horizontal',
        fontFamily: parsed.fontFamily,
        monogramText: parsed.monogramText,
        badgeText: parsed.badgeText,
        showAccentRule: true,
        primaryColor: basePrimary,
        secondaryColor: baseSecondary,
        accentColor: baseAccent,
      },
    },
    {
      id: `var-2-${variationSeed}`,
      title: '02 • Twin Overlapping Prism',
      subtitle: 'Frameless dual-prism intersection + modern kinetic type',
      badgeLabel: 'TWIN PRISM',
      config: {
        ...baseCommon,
        compositionMode: 'twin-prism',
        emblemStyle: pickEmblem(1),
        secondaryEmblemStyle: pickEmblem(4),
        markRotation: -12 + rotStep,
        secondaryRotation: 18 + rotStep,
        outerFrameShape: 'none',
        layout: 'horizontal',
        fontFamily: 'Inter',
        monogramText: '',
        badgeText: parsed.badgeText,
        showAccentRule: true,
        primaryColor: basePrimary,
        secondaryColor: colorOverride ? baseSecondary : triadTheme.primary,
        accentColor: colorOverride ? baseAccent : triadTheme.accent,
      },
    },
    {
      id: `var-3-${variationSeed}`,
      title: '03 • Concentric Orbital Seal',
      subtitle: 'Stacked double-ring medallion + emblem & center monogram',
      badgeLabel: 'STACKED SEAL',
      config: {
        ...baseCommon,
        compositionMode: 'orbital-seal',
        emblemStyle: pickEmblem(2),
        secondaryEmblemStyle: 'golden-rings',
        markRotation: rotStep,
        secondaryRotation: 45 + rotStep,
        outerFrameShape: 'circle',
        layout: 'stacked',
        fontFamily: parsed.fontFamily === 'JetBrains Mono' ? 'Inter' : parsed.fontFamily,
        monogramText: parsed.monogramText,
        badgeText: parsed.badgeText,
        showAccentRule: false,
        primaryColor: colorOverride ? basePrimary : splitTheme.primary,
        secondaryColor: colorOverride ? baseSecondary : splitTheme.secondary,
        accentColor: colorOverride ? baseAccent : splitTheme.accent,
      },
    },
    {
      id: `var-4-${variationSeed}`,
      title: '04 • Minimalist Iconic Lockup',
      subtitle: 'Pure unframed vector symbol + architectural horizon rule',
      badgeLabel: 'MINIMAL ICONIC',
      config: {
        ...baseCommon,
        compositionMode: 'minimal-iconic',
        emblemStyle: pickEmblem(5),
        secondaryEmblemStyle: pickEmblem(0),
        markRotation: rotStep,
        secondaryRotation: 22 + rotStep,
        outerFrameShape: 'none',
        layout: 'horizontal',
        fontFamily: variationSeed % 2 === 0 ? 'Georgia' : 'Inter',
        monogramText: '',
        badgeText: '',
        showAccentRule: true,
        primaryColor: baseAccent,
        secondaryColor: basePrimary,
        accentColor: baseSecondary,
      },
    },
    {
      id: `var-5-${variationSeed}`,
      title: '05 • Tactical Cyber Emblem',
      subtitle: 'Chamfered armor plate + high-contrast display lockup',
      badgeLabel: 'CYBER PLATE',
      config: {
        ...baseCommon,
        compositionMode: 'cyber-emblem',
        emblemStyle: pickEmblem(6),
        secondaryEmblemStyle: 'hexagon-core',
        markRotation: 15 + rotStep,
        secondaryRotation: 0,
        outerFrameShape: 'chamfer',
        layout: 'stacked',
        fontFamily: 'JetBrains Mono',
        monogramText: parsed.monogramText,
        badgeText: parsed.badgeText,
        showAccentRule: true,
        primaryColor: colorOverride ? basePrimary : compTheme.primary,
        secondaryColor: colorOverride ? baseSecondary : compTheme.secondary,
        accentColor: colorOverride ? baseAccent : compTheme.accent,
      },
    },
    {
      id: `var-6-${variationSeed}`,
      title: '06 • Standalone App Medallion',
      subtitle: 'Rich multi-layer icon mark for app icons, avatars & badges',
      badgeLabel: 'APP ICON MARK',
      config: {
        ...baseCommon,
        compositionMode: 'badge-medallion',
        emblemStyle: variationSeed === 0 ? parsed.emblemStyle : pickEmblem(7),
        secondaryEmblemStyle: pickEmblem(2),
        markRotation: rotStep,
        secondaryRotation: 30 + rotStep,
        outerFrameShape: 'rounded-rect',
        layout: 'badge-only',
        fontFamily: parsed.fontFamily,
        monogramText: parsed.monogramText,
        badgeText: '',
        showAccentRule: false,
        primaryColor: basePrimary,
        secondaryColor: baseSecondary,
        accentColor: baseAccent,
      },
    },
  ];
}

export function generateLogoCanvasObjects(
  config: LogoGeneratorConfig,
  canvasWidth: number,
  canvasHeight: number
): CanvasObject[] {
  const stamp = Date.now();
  const safeBrandName = (config.brandName || 'OSITO STUDIO').trim().slice(0, 28) || 'OSITO STUDIO';
  const safeTagline = (config.tagline || 'NEXT-GEN HYBRID DESIGN SYSTEM')
    .trim()
    .slice(0, 48)
    .toUpperCase();
  const styleMeta =
    LOGO_EMBLEM_STYLES.find((s) => s.id === config.emblemStyle) || LOGO_EMBLEM_STYLES[0];
  const secondaryMeta =
    LOGO_EMBLEM_STYLES.find((s) => s.id === (config.secondaryEmblemStyle || 'hexagon-core')) ||
    LOGO_EMBLEM_STYLES[0];
  const compMode: LogoCompositionMode = config.compositionMode || 'layered-crest';
  const cx = Math.round(Math.max(320, canvasWidth) / 2);
  const cy = Math.round(Math.max(240, canvasHeight) / 2);
  const wordmarkFont = config.fontFamily || 'Inter';
  const frameMode: LogoOuterFrameShape = config.outerFrameShape || 'rounded-rect';
  const mono = (config.monogramText || '').trim().slice(0, 4);
  const badgePill = (config.badgeText || '').trim().slice(0, 38);
  const primaryRot = config.markRotation ?? 0;
  const secondaryRot = config.secondaryRotation ?? 30;

  const resolveOuterFrameDef = (size: number): { shapeDefId: string; params: Record<string, any> } => {
    if (frameMode === 'hexagon') {
      return { shapeDefId: 'polygon', params: { sides: 6, angleDeg: 0, cutoutRatio: 0 } };
    }
    if (frameMode === 'circle') {
      return { shapeDefId: 'rounded-rect', params: { radius: Math.round(size / 2) } };
    }
    if (frameMode === 'chamfer') {
      return { shapeDefId: 'rounded-rect', params: { radius: Math.round(size * 0.22), chamfer: true } };
    }
    return { shapeDefId: 'rounded-rect', params: { radius: Math.round(size * 0.23), chamfer: false } };
  };

  const buildSecondaryHarmonicLayer = (
    bx: number,
    by: number,
    bw: number,
    bh: number
  ): AutoShapeObject => {
    const isTwin = compMode === 'twin-prism';
    const isOrbital = compMode === 'orbital-seal';
    const offsetX = isTwin ? Math.round(bw * 0.16) : 0;
    const offsetY = isTwin ? Math.round(bh * 0.12) : 0;
    return {
      id: `logo-secondary-harmony-${stamp}`,
      name: `${safeBrandName} Secondary Prism Layer`,
      type: 'autoshape',
      shapeDefId: secondaryMeta.shapeDefId,
      visible: true,
      locked: false,
      x: Math.round(bx + offsetX),
      y: Math.round(by + offsetY),
      width: Math.max(12, Math.round(bw)),
      height: Math.max(12, Math.round(bh)),
      rotation: secondaryRot,
      opacity: isTwin ? 0.85 : isOrbital ? 0.65 : 0.45,
      blendMode: 'source-over',
      fill: isTwin ? config.secondaryColor : 'none',
      fillType: isTwin ? 'linear-gradient' : 'none',
      fillGradientEnd: config.accentColor,
      stroke: config.accentColor,
      strokeWidth: isTwin ? 1.5 : 2,
      strokeAlign: 'center',
      pixelSnap: true,
      shadow: { enabled: false, color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
      params: { ...secondaryMeta.defaultParams, ...(config.secondaryEmblemParams || {}) },
    };
  };

  const buildInnerGraphicOrVectorMark = (
    bx: number,
    by: number,
    bw: number,
    bh: number
  ): CanvasObject => {
    if (config.customGraphicDataUrl) {
      const customBmp: BitmapObject = {
        id: `logo-custom-graphic-${stamp}`,
        name: config.customGraphicName
          ? `${safeBrandName} (${config.customGraphicName})`
          : `${safeBrandName} Custom Graphic`,
        type: 'bitmap',
        visible: true,
        locked: false,
        x: Math.round(bx),
        y: Math.round(by),
        width: Math.max(12, Math.round(bw)),
        height: Math.max(12, Math.round(bh)),
        pixelWidth: Math.max(12, Math.round(bw)),
        pixelHeight: Math.max(12, Math.round(bh)),
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
        shadow: { enabled: true, color: 'rgba(0,0,0,0.45)', blur: 10, offsetX: 0, offsetY: 4 },
        imageDataUrl: config.customGraphicDataUrl,
        filters: {
          brightness: 0,
          contrast: 0,
          blur: 0,
          hueRotate: 0,
          invert: false,
          pixelate: 1,
        },
      };
      return customBmp;
    }

    const isTwin = compMode === 'twin-prism';
    const innerMark: AutoShapeObject = {
      id: `logo-mark-${stamp}`,
      name: `${safeBrandName} Vector Mark`,
      type: 'autoshape',
      shapeDefId: styleMeta.shapeDefId,
      visible: true,
      locked: false,
      x: Math.round(isTwin ? bx - Math.round(bw * 0.1) : bx),
      y: Math.round(isTwin ? by - Math.round(bh * 0.08) : by),
      width: Math.max(12, Math.round(bw)),
      height: Math.max(12, Math.round(bh)),
      rotation: primaryRot,
      opacity: 1,
      blendMode: 'source-over',
      fill: config.primaryColor,
      fillType: 'linear-gradient',
      fillGradientEnd: config.secondaryColor,
      stroke: '#ffffff',
      strokeWidth: 2,
      strokeAlign: 'center',
      pixelSnap: true,
      shadow: { enabled: true, color: 'rgba(0,0,0,0.45)', blur: 10, offsetX: 0, offsetY: 4 },
      params: { ...styleMeta.defaultParams, ...(config.emblemParams || {}) },
    };
    return innerMark;
  };

  const buildCenterMonogramLayer = (
    bx: number,
    by: number,
    bw: number,
    bh: number,
    fontSize: number
  ): TextObject | null => {
    if (!mono) return null;
    return {
      id: `logo-monogram-${stamp}`,
      name: `${safeBrandName} Monogram (${mono})`,
      type: 'text',
      visible: true,
      locked: false,
      x: Math.round(bx),
      y: Math.round(by + (bh - fontSize * 1.2) / 2),
      width: Math.max(12, Math.round(bw)),
      height: Math.round(fontSize * 1.3),
      rotation: 0,
      opacity: 1,
      blendMode: 'source-over',
      fill: '#ffffff',
      fillType: 'solid',
      fillGradientEnd: config.accentColor,
      stroke: 'none',
      strokeWidth: 0,
      strokeAlign: 'center',
      pixelSnap: true,
      shadow: { enabled: true, color: 'rgba(0,0,0,0.65)', blur: 6, offsetX: 0, offsetY: 2 },
      text: mono,
      fontFamily: wordmarkFont,
      fontSize,
      fontWeight: '700',
      textAlign: 'center',
      letterSpacing: 1.5,
    };
  };

  const created: CanvasObject[] = [];

  if (config.layout === 'horizontal') {
    const startX = Math.max(24, cx - 210);
    const startY = Math.max(24, cy - 55);
    const frameDef = resolveOuterFrameDef(96);

    if (frameMode !== 'none') {
      const outerBadge: AutoShapeObject = {
        id: `logo-outer-${stamp}`,
        name: `${safeBrandName} Outer Emblem`,
        type: 'autoshape',
        shapeDefId: frameDef.shapeDefId,
        visible: true,
        locked: false,
        x: startX,
        y: startY,
        width: 96,
        height: 96,
        rotation: 0,
        opacity: 1,
        blendMode: 'source-over',
        fill: '#111827',
        fillType: 'linear-gradient',
        fillGradientEnd: '#1e293b',
        stroke: config.accentColor,
        strokeWidth: 2,
        strokeAlign: 'inside',
        pixelSnap: true,
        shadow: { enabled: true, color: 'rgba(0,0,0,0.55)', blur: 18, offsetX: 0, offsetY: 6 },
        params: frameDef.params,
      };
      created.push(outerBadge);
    }

    if (!config.customGraphicDataUrl) {
      created.push(buildSecondaryHarmonicLayer(startX + 10, startY + 10, 76, 76));
    }

    const innerMark = buildInnerGraphicOrVectorMark(startX + 16, startY + 16, 64, 64);
    created.push(innerMark);

    const monoLayer = buildCenterMonogramLayer(startX + 16, startY + 16, 64, 64, 18);
    if (monoLayer) created.push(monoLayer);

    if (badgePill) {
      const badgeLabel: TextObject = {
        id: `logo-badge-${stamp}`,
        name: `${safeBrandName} Badge Pill`,
        type: 'text',
        visible: true,
        locked: false,
        x: startX + 118,
        y: startY + 2,
        width: 280,
        height: 16,
        rotation: 0,
        opacity: 0.95,
        blendMode: 'source-over',
        fill: config.primaryColor,
        fillType: 'solid',
        fillGradientEnd: config.accentColor,
        stroke: 'none',
        strokeWidth: 0,
        strokeAlign: 'center',
        pixelSnap: true,
        shadow: { enabled: false, color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
        text: badgePill.toUpperCase(),
        fontFamily: 'JetBrains Mono',
        fontSize: 9,
        fontWeight: '700',
        textAlign: 'left',
        letterSpacing: 2,
      };
      created.push(badgeLabel);
    }

    const horizFontSize = safeBrandName.length > 20 ? 22 : safeBrandName.length > 14 ? 26 : 32;
    const brandTitle: TextObject = {
      id: `logo-title-${stamp}`,
      name: `${safeBrandName} Wordmark`,
      type: 'text',
      visible: true,
      locked: false,
      x: startX + 116,
      y: startY + (badgePill ? 20 : 14),
      width: 310,
      height: 42,
      rotation: 0,
      opacity: 1,
      blendMode: 'source-over',
      fill: '#ffffff',
      fillType: 'solid',
      fillGradientEnd: config.accentColor,
      stroke: 'none',
      strokeWidth: 0,
      strokeAlign: 'center',
      pixelSnap: true,
      shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', blur: 8, offsetX: 0, offsetY: 3 },
      text: safeBrandName,
      fontFamily: wordmarkFont,
      fontSize: horizFontSize,
      fontWeight: '700',
      textAlign: 'left',
      letterSpacing: 1.5,
    };

    if (config.showAccentRule !== false) {
      const accentBar: AutoShapeObject = {
        id: `logo-accent-rule-${stamp}`,
        name: `${safeBrandName} Accent Bar`,
        type: 'autoshape',
        shapeDefId: 'rounded-rect',
        visible: true,
        locked: false,
        x: startX + 118,
        y: startY + (badgePill ? 60 : 54),
        width: 84,
        height: 4,
        rotation: 0,
        opacity: 1,
        blendMode: 'source-over',
        fill: config.primaryColor,
        fillType: 'linear-gradient',
        fillGradientEnd: config.accentColor,
        stroke: 'none',
        strokeWidth: 0,
        strokeAlign: 'inside',
        pixelSnap: true,
        shadow: { enabled: false, color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
        params: { radius: 2, chamfer: false },
      };
      created.push(accentBar);
    }

    const taglineText: TextObject = {
      id: `logo-tagline-${stamp}`,
      name: `${safeBrandName} Tagline`,
      type: 'text',
      visible: true,
      locked: false,
      x: startX + 118,
      y: startY + (badgePill ? 68 : 62),
      width: 310,
      height: 22,
      rotation: 0,
      opacity: 0.9,
      blendMode: 'source-over',
      fill: config.accentColor,
      fillType: 'solid',
      fillGradientEnd: config.primaryColor,
      stroke: 'none',
      strokeWidth: 0,
      strokeAlign: 'center',
      pixelSnap: true,
      shadow: { enabled: false, color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
      text: safeTagline,
      fontFamily: 'JetBrains Mono',
      fontSize: 11,
      fontWeight: '600',
      textAlign: 'left',
      letterSpacing: 2.2,
    };

    created.push(brandTitle, taglineText);
  } else if (config.layout === 'stacked') {
    const badgeTopY = Math.max(20, cy - 104);
    const frameDef = resolveOuterFrameDef(116);
    if (frameMode !== 'none') {
      const outerBadge: AutoShapeObject = {
        id: `logo-outer-${stamp}`,
        name: `${safeBrandName} Outer Shield`,
        type: 'autoshape',
        shapeDefId: frameDef.shapeDefId,
        visible: true,
        locked: false,
        x: Math.max(16, cx - 58),
        y: badgeTopY,
        width: 116,
        height: 116,
        rotation: 0,
        opacity: 1,
        blendMode: 'source-over',
        fill: '#111827',
        fillType: 'linear-gradient',
        fillGradientEnd: '#1e293b',
        stroke: config.accentColor,
        strokeWidth: 2,
        strokeAlign: 'inside',
        pixelSnap: true,
        shadow: { enabled: true, color: 'rgba(0,0,0,0.55)', blur: 18, offsetX: 0, offsetY: 6 },
        params: frameDef.params,
      };
      created.push(outerBadge);
    }

    if (!config.customGraphicDataUrl) {
      created.push(buildSecondaryHarmonicLayer(Math.max(16, cx - 46), badgeTopY + 12, 92, 92));
    }

    const innerMark = buildInnerGraphicOrVectorMark(Math.max(16, cx - 38), badgeTopY + 20, 76, 76);
    created.push(innerMark);

    const monoLayer = buildCenterMonogramLayer(Math.max(16, cx - 38), badgeTopY + 20, 76, 76, 20);
    if (monoLayer) created.push(monoLayer);

    const stackedFontSize = safeBrandName.length > 20 ? 20 : safeBrandName.length > 14 ? 24 : 28;
    const titleY = badgeTopY + 130;
    const brandTitle: TextObject = {
      id: `logo-title-${stamp}`,
      name: `${safeBrandName} Wordmark`,
      type: 'text',
      visible: true,
      locked: false,
      x: Math.max(16, cx - 170),
      y: titleY,
      width: 340,
      height: 36,
      rotation: 0,
      opacity: 1,
      blendMode: 'source-over',
      fill: '#ffffff',
      fillType: 'solid',
      fillGradientEnd: config.accentColor,
      stroke: 'none',
      strokeWidth: 0,
      strokeAlign: 'center',
      pixelSnap: true,
      shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', blur: 8, offsetX: 0, offsetY: 3 },
      text: safeBrandName,
      fontFamily: wordmarkFont,
      fontSize: stackedFontSize,
      fontWeight: '700',
      textAlign: 'center',
      letterSpacing: 2,
    };

    const hasRule = config.showAccentRule === true;
    if (hasRule) {
      const accentBar: AutoShapeObject = {
        id: `logo-accent-rule-${stamp}`,
        name: `${safeBrandName} Accent Bar`,
        type: 'autoshape',
        shapeDefId: 'rounded-rect',
        visible: true,
        locked: false,
        x: Math.max(16, cx - 42),
        y: titleY + 38,
        width: 84,
        height: 4,
        rotation: 0,
        opacity: 1,
        blendMode: 'source-over',
        fill: config.primaryColor,
        fillType: 'linear-gradient',
        fillGradientEnd: config.accentColor,
        stroke: 'none',
        strokeWidth: 0,
        strokeAlign: 'inside',
        pixelSnap: true,
        shadow: { enabled: false, color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
        params: { radius: 2, chamfer: false },
      };
      created.push(accentBar);
    }

    const taglineY = titleY + (hasRule ? 48 : 38);
    const taglineText: TextObject = {
      id: `logo-tagline-${stamp}`,
      name: `${safeBrandName} Tagline`,
      type: 'text',
      visible: true,
      locked: false,
      x: Math.max(16, cx - 170),
      y: taglineY,
      width: 340,
      height: 20,
      rotation: 0,
      opacity: 0.9,
      blendMode: 'source-over',
      fill: config.accentColor,
      fillType: 'solid',
      fillGradientEnd: config.primaryColor,
      stroke: 'none',
      strokeWidth: 0,
      strokeAlign: 'center',
      pixelSnap: true,
      shadow: { enabled: false, color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
      text: safeTagline,
      fontFamily: 'JetBrains Mono',
      fontSize: 10,
      fontWeight: '600',
      textAlign: 'center',
      letterSpacing: 2.5,
    };

    created.push(brandTitle, taglineText);

    if (badgePill) {
      const badgeLabel: TextObject = {
        id: `logo-badge-${stamp}`,
        name: `${safeBrandName} Badge Pill`,
        type: 'text',
        visible: true,
        locked: false,
        x: Math.max(16, cx - 170),
        y: taglineY + 24,
        width: 340,
        height: 16,
        rotation: 0,
        opacity: 0.9,
        blendMode: 'source-over',
        fill: config.primaryColor,
        fillType: 'solid',
        fillGradientEnd: config.accentColor,
        stroke: 'none',
        strokeWidth: 0,
        strokeAlign: 'center',
        pixelSnap: true,
        shadow: { enabled: false, color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
        text: badgePill.toUpperCase(),
        fontFamily: 'JetBrains Mono',
        fontSize: 9,
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: 2,
      };
      created.push(badgeLabel);
    }
  } else {
    // Badge-Only App Icon Mark
    const frameDef = resolveOuterFrameDef(144);
    const bx = Math.max(16, cx - 72);
    const by = Math.max(16, cy - 72);
    if (frameMode !== 'none') {
      const outerBadge: AutoShapeObject = {
        id: `logo-outer-${stamp}`,
        name: `${safeBrandName} App Icon Frame`,
        type: 'autoshape',
        shapeDefId: frameDef.shapeDefId,
        visible: true,
        locked: false,
        x: bx,
        y: by,
        width: 144,
        height: 144,
        rotation: 0,
        opacity: 1,
        blendMode: 'source-over',
        fill: '#111827',
        fillType: 'linear-gradient',
        fillGradientEnd: '#1e293b',
        stroke: config.accentColor,
        strokeWidth: 2.5,
        strokeAlign: 'inside',
        pixelSnap: true,
        shadow: { enabled: true, color: 'rgba(0,0,0,0.6)', blur: 22, offsetX: 0, offsetY: 8 },
        params: frameDef.params,
      };
      created.push(outerBadge);
    }

    if (!config.customGraphicDataUrl) {
      created.push(buildSecondaryHarmonicLayer(bx + 16, by + 16, 112, 112));
    }

    const innerMark = buildInnerGraphicOrVectorMark(bx + 26, by + 26, 92, 92);
    created.push(innerMark);

    const monoLayer = buildCenterMonogramLayer(bx + 26, by + 26, 92, 92, 24);
    if (monoLayer) created.push(monoLayer);
  }

  return created;
}

// ============================================================================
// 3. WEBSITE LAYOUT & INTERACTIVE NESTED MENU GENERATOR ENGINE
// ============================================================================

export type WebsiteLayoutTemplateId =
  | 'saas-mega-menu'
  | 'bento-product'
  | 'ecommerce-store'
  | 'analytics-dashboard'
  | 'pricing-faq'
  | 'sitemap-architecture';

export interface WebsiteLayoutTemplateMeta {
  id: WebsiteLayoutTemplateId;
  name: string;
  subtitle: string;
  description: string;
  hasNestedMenu: boolean;
}

export const WEBSITE_LAYOUT_TEMPLATES: WebsiteLayoutTemplateMeta[] = [
  {
    id: 'saas-mega-menu',
    name: 'SaaS Product Launch & Hero Landing Page',
    subtitle: 'High-Fidelity Split Hero, Live App Window Mockup, 3 Feature Cards & Nested Navbar',
    description:
      'Complete production-grade SaaS landing page built from real vector surfaces, gradient buttons, live telemetry charts, and editable typography layers.',
    hasNestedMenu: true,
  },
  {
    id: 'bento-product',
    name: 'Apple / Linear-Style Bento Feature Grid',
    subtitle: 'Asymmetric 4-Cell High-Fidelity Bento Showcase, Benchmark Bars & Code Output',
    description:
      'High-fidelity modular Bento grid featuring a flagship vector canvas preview, sub-millisecond benchmark bars, W3C color tokens, and codegen terminal.',
    hasNestedMenu: true,
  },
  {
    id: 'ecommerce-store',
    name: 'Luxury D2C Storefront & Express Bag Drawer',
    subtitle: 'High-Fidelity Product Cards, Vector Hardware Art, Ratings & Live Checkout Summary',
    description:
      'Direct-to-consumer storefront with multi-layered vector product illustrations, badge pills, pricing typography, and an express checkout bag drawer.',
    hasNestedMenu: true,
  },
  {
    id: 'analytics-dashboard',
    name: 'Enterprise AI Telemetry & Executive Dashboard',
    subtitle: 'High-Fidelity Collapsible Sidebar, 3 KPI Sparkline Cards, Bar Chart & Data Table',
    description:
      'Executive SaaS analytics workspace with tactile sidebar navigation, real-time KPI sparkline cards, 12-month vector bar chart, and deployment table.',
    hasNestedMenu: true,
  },
  {
    id: 'pricing-faq',
    name: 'Multi-Tier SaaS Pricing Matrix & FAQ',
    subtitle: '3 High-Fidelity Pricing Cards, Feature Checklists, Billing Switcher & Q&A Cards',
    description:
      'High-conversion pricing page with Starter, Pro Studio (Most Popular), and Enterprise tier cards, full feature checklists, and answered FAQ cards.',
    hasNestedMenu: true,
  },
  {
    id: 'sitemap-architecture',
    name: 'Visual Information Architecture & Funnel Blueprint',
    subtitle: 'High-Fidelity Route Cards, Conversion Metrics & Magnetic Orthogonal Connectors',
    description:
      'Multi-tier website architecture and conversion funnel where every page card displays route badges, latency/conversion metrics, and live magnetic connectors.',
    hasNestedMenu: true,
  },
];

function buildRoundedOrSharpRectNodes(w: number, h: number, radius = 0): BezierNode[] {
  const rw = Math.max(2, Math.round(w));
  const rh = Math.max(2, Math.round(h));
  const r = Math.max(0, Math.min(radius, rw / 2, rh / 2));
  if (r <= 0.5) {
    return [
      { id: 'n0', x: 0, y: 0, cp1x: 0, cp1y: 0, cp2x: 0, cp2y: 0, pointType: 'corner' },
      { id: 'n1', x: rw, y: 0, cp1x: rw, cp1y: 0, cp2x: rw, cp2y: 0, pointType: 'corner' },
      { id: 'n2', x: rw, y: rh, cp1x: rw, cp1y: rh, cp2x: rw, cp2y: rh, pointType: 'corner' },
      { id: 'n3', x: 0, y: rh, cp1x: 0, cp1y: rh, cp2x: 0, cp2y: rh, pointType: 'corner' },
    ];
  }
  const k = r * 0.55228475;
  return [
    { id: 'r0', x: r, y: 0, cp1x: r - k, cp1y: 0, cp2x: r, cp2y: 0, pointType: 'smooth' },
    { id: 'r1', x: rw - r, y: 0, cp1x: rw - r, cp1y: 0, cp2x: rw - r + k, cp2y: 0, pointType: 'smooth' },
    { id: 'r2', x: rw, y: r, cp1x: rw, cp1y: r - k, cp2x: rw, cp2y: r, pointType: 'smooth' },
    { id: 'r3', x: rw, y: rh - r, cp1x: rw, cp1y: rh - r, cp2x: rw, cp2y: rh - r + k, pointType: 'smooth' },
    { id: 'r4', x: rw - r, y: rh, cp1x: rw - r + k, cp1y: rh, cp2x: rw - r, cp2y: rh, pointType: 'smooth' },
    { id: 'r5', x: r, y: rh, cp1x: r, cp1y: rh, cp2x: r - k, cp2y: rh, pointType: 'smooth' },
    { id: 'r6', x: 0, y: rh - r, cp1x: 0, cp1y: rh - r + k, cp2x: 0, cp2y: rh - r, pointType: 'smooth' },
    { id: 'r7', x: 0, y: r, cp1x: 0, cp1y: r, cp2x: 0, cp2y: r - k, pointType: 'smooth' },
  ];
}

interface HiFiRectOptions {
  radius?: number;
  fillType?: 'solid' | 'linear-gradient' | 'radial-gradient' | 'none';
  fillGradientEnd?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  shadow?: boolean;
  interactiveHover?: boolean;
  hoverFill?: string;
  hoverStroke?: string;
  params?: Record<string, number | boolean | string>;
}

function makeHiFiRect(
  id: string,
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  opts: HiFiRectOptions = {}
): VectorPathObject {
  const w = Math.max(2, Math.round(width));
  const h = Math.max(2, Math.round(height));
  const fillType = opts.fillType ?? (opts.fillGradientEnd ? 'linear-gradient' : 'solid');
  const gradEnd = opts.fillGradientEnd ?? fill;
  const stroke = opts.stroke ?? 'none';
  const strokeWidth = opts.strokeWidth ?? (stroke === 'none' ? 0 : 1);

  return {
    id,
    name,
    type: 'vector-path',
    visible: true,
    locked: false,
    x: Math.round(x),
    y: Math.round(y),
    width: w,
    height: h,
    rotation: 0,
    opacity: opts.opacity ?? 1,
    blendMode: 'source-over',
    fill,
    fillType,
    fillGradientEnd: gradEnd,
    stroke,
    strokeWidth,
    strokeAlign: 'inside',
    pixelSnap: true,
    shadow: opts.shadow
      ? { enabled: true, color: 'rgba(0,0,0,0.48)', blur: 16, offsetX: 0, offsetY: 6 }
      : { enabled: false, color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
    closed: true,
    nodes: buildRoundedOrSharpRectNodes(w, h, opts.radius ?? 0),
    ...(opts.params ? { params: opts.params } : {}),
    ...(opts.interactiveHover
      ? {
          stateVariants: {
            default: {
              fill,
              fillGradientEnd: gradEnd,
              stroke,
              strokeWidth,
              opacity: opts.opacity ?? 1,
            },
            hover: {
              fill: opts.hoverFill ?? shiftHexBrightness(fill, 16),
              fillGradientEnd: shiftHexBrightness(gradEnd, 14),
              stroke: opts.hoverStroke ?? '#ffffff',
              strokeWidth: Math.max(1.5, strokeWidth),
              opacity: 1,
              offsetY: -1,
              scale: 1.01,
            },
            active: {
              fill: shiftHexBrightness(fill, -10),
              fillGradientEnd: gradEnd,
              stroke: opts.hoverStroke ?? '#ffffff',
              strokeWidth: Math.max(1.5, strokeWidth),
              opacity: 0.96,
              offsetY: 1,
              scale: 0.99,
            },
          },
        }
      : {}),
  };
}

function makeHiFiPolyline(
  id: string,
  name: string,
  x: number,
  y: number,
  points: Array<{ x: number; y: number }>,
  stroke: string,
  strokeWidth = 2.5,
  closed = false,
  fill = 'none'
): VectorPathObject {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const maxW = Math.max(4, Math.max(...xs));
  const maxH = Math.max(4, Math.max(...ys));
  return {
    id,
    name,
    type: 'vector-path',
    visible: true,
    locked: false,
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(maxW),
    height: Math.round(maxH),
    rotation: 0,
    opacity: 1,
    blendMode: 'source-over',
    fill,
    fillType: fill === 'none' ? 'none' : 'solid',
    fillGradientEnd: fill,
    stroke,
    strokeWidth,
    strokeAlign: 'center',
    pixelSnap: true,
    shadow: { enabled: false, color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
    closed,
    nodes: points.map((pt, idx) => ({
      id: `pt-${idx}`,
      x: Math.round(pt.x),
      y: Math.round(pt.y),
      cp1x: Math.round(pt.x),
      cp1y: Math.round(pt.y),
      cp2x: Math.round(pt.x),
      cp2y: Math.round(pt.y),
      pointType: 'corner',
    })),
  };
}

function makeHiFiText(
  id: string,
  name: string,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fontSize: number,
  fill = '#f8fafc',
  align: 'left' | 'center' | 'right' = 'left',
  fontFamily: 'Inter' | 'Space Grotesk' | 'JetBrains Mono' = 'Inter',
  fontWeight: '400' | '500' | '600' | '700' = '700',
  letterSpacing = 0.2
): TextObject {
  return {
    id,
    name,
    type: 'text',
    visible: true,
    locked: false,
    x: Math.round(x),
    y: Math.round(y),
    width: Math.max(12, Math.round(width)),
    height: Math.max(12, Math.round(height)),
    rotation: 0,
    opacity: 1,
    blendMode: 'source-over',
    fill,
    fillType: 'solid',
    fillGradientEnd: fill,
    stroke: 'none',
    strokeWidth: 0,
    strokeAlign: 'center',
    pixelSnap: true,
    shadow: { enabled: false, color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
    text,
    fontFamily,
    fontSize,
    fontWeight,
    textAlign: align,
    letterSpacing,
  };
}

function makeHiFiButton(
  idPrefix: string,
  namePrefix: string,
  label: string,
  x: number,
  y: number,
  width: number,
  height: number,
  variant: 'primary' | 'secondary' | 'pill-active' | 'pill-idle',
  theme: ColorThemePalette
): CanvasObject[] {
  const isPrimary = variant === 'primary';
  const isActivePill = variant === 'pill-active';
  const fill = isPrimary
    ? theme.primary
    : isActivePill
    ? shiftHexBrightness(theme.surfaceAlt, 14)
    : theme.surfaceAlt;
  const primaryTextColor = getReadableTextColorForBg(fill);
  const isBrightPrimary = isPrimary && primaryTextColor === '#090d16';
  const gradEnd = isPrimary
    ? isBrightPrimary
      ? shiftHexBrightness(theme.primary, -12)
      : theme.secondary
    : fill;
  const stroke = isPrimary
    ? theme.accent
    : isActivePill
    ? theme.accent
    : theme.border;
  const radius = isPrimary ? Math.min(height / 2, 999) : 8;

  const bg = makeHiFiRect(
    `${idPrefix}-bg`,
    `${namePrefix} (${isPrimary ? 'Primary CTA' : 'Nav Btn'})`,
    x,
    y,
    width,
    height,
    fill,
    {
      radius,
      fillType: isPrimary ? 'linear-gradient' : 'solid',
      fillGradientEnd: gradEnd,
      stroke,
      strokeWidth: isPrimary || isActivePill ? 1.5 : 1,
      shadow: isPrimary,
      interactiveHover: true,
      hoverFill: isPrimary ? theme.accent : shiftHexBrightness(theme.surfaceAlt, 20),
      hoverStroke: '#ffffff',
    }
  );

  const fontSize = height <= 28 ? 10 : height <= 36 ? 11 : 12;
  const textY = Math.round(y + (height - fontSize) / 2 - 1);
  const txt = makeHiFiText(
    `${idPrefix}-txt`,
    `${namePrefix} Label (${isPrimary ? 'Primary Btn' : 'Btn'})`,
    label,
    x + 6,
    textY,
    width - 12,
    fontSize + 4,
    fontSize,
    isPrimary ? primaryTextColor : theme.textPrimary,
    'center',
    'Inter',
    isPrimary || isActivePill ? '700' : '600',
    0.2
  );

  return [bg, txt];
}

function makeHiFiBadge(
  idPrefix: string,
  namePrefix: string,
  label: string,
  x: number,
  y: number,
  width: number,
  height: number,
  theme: ColorThemePalette
): CanvasObject[] {
  const bg = makeHiFiRect(
    `${idPrefix}-bg`,
    `${namePrefix} Badge Pill`,
    x,
    y,
    width,
    height,
    theme.surfaceAlt,
    {
      radius: Math.round(height / 2),
      stroke: theme.accent,
      strokeWidth: 1,
    }
  );
  const txt = makeHiFiText(
    `${idPrefix}-txt`,
    `${namePrefix} Badge Text`,
    label,
    x + 8,
    Math.round(y + (height - 9) / 2 - 1),
    width - 16,
    12,
    9,
    theme.accent,
    'center',
    'JetBrains Mono',
    '700',
    0.8
  );
  return [bg, txt];
}

/**
 * Builds a complete High-Fidelity Top Navigation Bar with real vector logo mark,
 * brand wordmark, 4 tactile button pills (Products ▾, Solutions ▾, Developers ▾, Pricing ▾),
 * and a right-hand Primary CTA button—while supporting interactive nested flyout menus in Preview Mode!
 */
function makeHiFiNavbar(
  s: number,
  pad: number,
  innerW: number,
  theme: ColorThemePalette,
  brandTitle = 'OSITO STUDIO',
  customNavMenus?: {
    topNavMenus?: string[];
    level1Menus?: Record<number, string[]>;
    level2Submenus?: Record<number, string[]>;
    primaryCta?: string;
  }
): CanvasObject[] {
  const navX = pad;
  const navY = 16;
  const navW = innerW;
  const navH = 54;
  const navLabels =
    customNavMenus?.topNavMenus && customNavMenus.topNavMenus.length >= 4
      ? customNavMenus.topNavMenus.slice(0, 4)
      : ['Products ▾', 'Solutions ▾', 'Developers ▾', 'Pricing ▾'];

  const navBarSurface = makeHiFiRect(
    `web-navbar-surface-${s}`,
    'Top Navigation Bar (Interactive Nested Navbar)',
    navX,
    navY,
    navW,
    navH,
    theme.surface,
    {
      radius: 0,
      fillType: 'linear-gradient',
      fillGradientEnd: theme.surfaceAlt,
      stroke: theme.border,
      strokeWidth: 1.5,
      shadow: true,
      params: {
        hasNestedMenu: true,
        activeTab: 1,
        activeLink: 1,
        openMenuIndex: 0,
        openSubMenuIndex: 1,
        customTopMenus: navLabels.join('|'),
        ...(customNavMenus?.level1Menus
          ? { customLevel1Menus: JSON.stringify(customNavMenus.level1Menus) }
          : {}),
        ...(customNavMenus?.level2Submenus
          ? { customLevel2Menus: JSON.stringify(customNavMenus.level2Submenus) }
          : {}),
      },
    }
  );

  // Geometric Brand Logo Mark (Outer Octagon + Inner Diamond Core)
  const logoBadge = makeHiFiRect(
    `web-navbar-logo-bg-${s}`,
    'Navbar Brand Emblem Primary',
    navX + 14,
    navY + 13,
    28,
    28,
    theme.primary,
    {
      radius: 7,
      fillType: 'linear-gradient',
      fillGradientEnd: theme.secondary,
      stroke: '#ffffff',
      strokeWidth: 1.25,
    }
  );
  const logoCore = makeHiFiPolyline(
    `web-navbar-logo-core-${s}`,
    'Navbar Brand Core Diamond',
    navX + 21,
    navY + 20,
    [
      { x: 7, y: 0 },
      { x: 14, y: 7 },
      { x: 7, y: 14 },
      { x: 0, y: 7 },
    ],
    '#ffffff',
    1.25,
    true,
    theme.accent
  );

  const brandWordmark = makeHiFiText(
    `web-navbar-brand-${s}`,
    'Navbar Brand Wordmark',
    brandTitle.toUpperCase(),
    navX + 50,
    navY + 20,
    145,
    16,
    12,
    theme.textPrimary,
    'left',
    'Space Grotesk',
    '700',
    0.8
  );

  // 4 Tactile Top-Level Navigation Button Pills aligned with Preview Mode hit-testing
  const navStartX = navX + Math.round(navW * 0.22);
  const navSpanW = Math.round(navW * 0.54);
  const itemW = Math.max(52, Math.floor(navSpanW / 4));
  const btnH = 30;
  const btnY = navY + Math.round((navH - btnH) / 2);

  const navButtonLayers: CanvasObject[] = [];
  navLabels.forEach((label, idx) => {
    const btnX = navStartX + idx * itemW + 4;
    const btnW = Math.max(44, itemW - 8);
    navButtonLayers.push(
      ...makeHiFiButton(
        `web-navbar-item-${s}-${idx}`,
        `Navbar Menu Button: ${label}`,
        label,
        btnX,
        btnY,
        btnW,
        btnH,
        idx === 0 ? 'pill-active' : 'pill-idle',
        theme
      )
    );
  });

  // Right-Hand Primary CTA Pill Button
  const ctaW = Math.max(96, Math.min(124, Math.round(navW * 0.14)));
  const ctaX = navX + navW - ctaW - 14;
  const ctaLayers = makeHiFiButton(
    `web-navbar-cta-${s}`,
    'Navbar Get Started CTA',
    customNavMenus?.primaryCta || 'Get Started ▸',
    ctaX,
    btnY,
    ctaW,
    btnH,
    'primary',
    theme
  );

  return [
    navBarSurface,
    logoBadge,
    logoCore,
    brandWordmark,
    ...navButtonLayers,
    ...ctaLayers,
  ];
}

function parseWebsiteBrief(customBrief?: string): {
  brandName: string;
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  subcopyLine1: string;
  subcopyLine2: string;
  primaryCta: string;
  secondaryCta: string;
  proofMetrics: string[];
  topNavMenus?: string[];
  level1Menus?: Record<number, string[]>;
  level2Submenus?: Record<number, string[]>;
} {
  const raw = (customBrief || '').trim();
  if (!raw) {
    return {
      brandName: 'OSITO STUDIO',
      eyebrow: '✦ NEW RELEASE • OSITO HYBRID ENGINE 4.0',
      headlineLine1: 'Design Vector & Pixel UI',
      headlineLine2: 'At The Speed of Thought.',
      subcopyLine1:
        'Combine precision cubic Bezier vectors, 1px pixel retouching, and live interactive',
      subcopyLine2:
        'web layout prototyping inside one unified desktop creative engine.',
      primaryCta: 'Start Free Trial ▸',
      secondaryCta: '▶ Watch 2-Min Demo',
      proofMetrics: ['★ 4.9/5 G2 Crowd', '18,400+ Product Teams', 'SOC2 Type II Certified'],
    };
  }

  const dossier = runDeepMarketResearch(raw);

  return {
    brandName: dossier.brandName,
    eyebrow: dossier.eyebrow,
    headlineLine1: dossier.headlineLine1,
    headlineLine2: dossier.headlineLine2,
    subcopyLine1: dossier.subcopyLine1,
    subcopyLine2: dossier.subcopyLine2,
    primaryCta: dossier.primaryCta,
    secondaryCta: dossier.secondaryCta,
    proofMetrics: dossier.proofMetrics,
    topNavMenus: dossier.topNavMenus,
    level1Menus: dossier.level1Menus,
    level2Submenus: dossier.level2Submenus,
  };
}

export function generateWebsiteLayoutObjects(
  templateId: WebsiteLayoutTemplateId,
  theme: ColorThemePalette,
  canvasWidth = 960,
  _canvasHeight = 600,
  customBrief?: string
): CanvasObject[] {
  const s = Date.now();
  const pad = 24;
  const innerW = Math.max(520, canvasWidth - pad * 2);
  const brief = parseWebsiteBrief(customBrief);

  const navbarLayers = makeHiFiNavbar(s, pad, innerW, theme, brief.brandName, {
    topNavMenus: brief.topNavMenus,
    level1Menus: brief.level1Menus,
    level2Submenus: brief.level2Submenus,
    primaryCta: brief.primaryCta,
  });

  // ==========================================================================
  // TEMPLATE 1: SaaS Product Launch & Hero Landing Page ('saas-mega-menu')
  // ==========================================================================
  if (templateId === 'saas-mega-menu') {
    const heroY = 82;
    const heroH = 290;
    const heroCard = makeHiFiRect(
      `saas-hero-surface-${s}`,
      'Hero Section Surface Card',
      pad,
      heroY,
      innerW,
      heroH,
      theme.surface,
      {
        fillType: 'linear-gradient',
        fillGradientEnd: theme.surfaceAlt,
        stroke: theme.border,
        strokeWidth: 1.5,
        shadow: true,
      }
    );

    const heroAccentBar = makeHiFiRect(
      `saas-hero-accent-bar-${s}`,
      'Hero Top Accent Bar',
      pad,
      heroY,
      innerW,
      3,
      theme.primary,
      {
        fillType: 'linear-gradient',
        fillGradientEnd: theme.accent,
      }
    );

    const leftX = pad + 26;
    const leftW = Math.round(innerW * 0.51);

    const eyebrowBadge = makeHiFiBadge(
      `saas-hero-badge-${s}`,
      'Hero Release',
      brief.eyebrow,
      leftX,
      heroY + 22,
      Math.min(310, leftW - 10),
      24,
      theme
    );

    const h1Line1 = makeHiFiText(
      `saas-hero-h1a-${s}`,
      'Hero Display Headline 1',
      brief.headlineLine1,
      leftX,
      heroY + 58,
      leftW,
      34,
      27,
      theme.textPrimary,
      'left',
      'Space Grotesk',
      '700',
      -0.4
    );

    const h1Line2 = makeHiFiText(
      `saas-hero-h1b-${s}`,
      'Hero Display Headline 2 Accent',
      brief.headlineLine2,
      leftX,
      heroY + 91,
      leftW,
      34,
      27,
      theme.accent,
      'left',
      'Space Grotesk',
      '700',
      -0.4
    );

    const sub1 = makeHiFiText(
      `saas-hero-sub1-${s}`,
      'Hero Subheadline Line 1',
      brief.subcopyLine1,
      leftX,
      heroY + 136,
      leftW,
      18,
      12,
      theme.textMuted,
      'left',
      'Inter',
      '400',
      0.1
    );

    const sub2 = makeHiFiText(
      `saas-hero-sub2-${s}`,
      'Hero Subheadline Line 2',
      brief.subcopyLine2,
      leftX,
      heroY + 154,
      leftW,
      18,
      12,
      theme.textMuted,
      'left',
      'Inter',
      '400',
      0.1
    );

    const primaryCta = makeHiFiButton(
      `saas-hero-cta1-${s}`,
      'Hero Start Free Trial CTA',
      brief.primaryCta || 'Start Free Trial ▸',
      leftX,
      heroY + 188,
      168,
      40,
      'primary',
      theme
    );

    const secondaryCta = makeHiFiButton(
      `saas-hero-cta2-${s}`,
      'Hero Watch Demo Button',
      brief.secondaryCta || '▶ Watch 2-Min Demo',
      leftX + 180,
      heroY + 188,
      158,
      40,
      'pill-idle',
      theme
    );

    const trustMeta = makeHiFiText(
      `saas-hero-trust-${s}`,
      'Hero Social Proof Meta',
      brief.proofMetrics && brief.proofMetrics.length >= 3
        ? brief.proofMetrics.slice(0, 3).join('   •   ')
        : '★ 4.9/5 G2 Crowd   •   18,400+ Product Teams   •   SOC2 Type II Certified',
      leftX,
      heroY + 246,
      leftW,
      16,
      10,
      theme.textMuted,
      'left',
      'JetBrains Mono',
      '500',
      0.3
    );

    // Right Column: High-Fidelity Interactive Application Window Preview
    const winW = Math.round(innerW * 0.42);
    const winX = pad + innerW - winW - 22;
    const winY = heroY + 20;
    const winH = heroH - 40;

    const appWindowFrame = makeHiFiRect(
      `saas-app-window-${s}`,
      'Hero Interactive App Window Card',
      winX,
      winY,
      winW,
      winH,
      '#0b1120',
      {
        radius: 8,
        stroke: theme.primary,
        strokeWidth: 1.5,
        shadow: true,
      }
    );

    const appWindowHeader = makeHiFiRect(
      `saas-app-header-${s}`,
      'App Window Header Strip',
      winX + 1,
      winY + 1,
      winW - 2,
      28,
      theme.surfaceAlt,
      {
        stroke: theme.border,
        strokeWidth: 1,
      }
    );

    const winDots = [
      { c: '#ef4444', dx: 12, label: 'Close' },
      { c: '#f59e0b', dx: 24, label: 'Minimize' },
      { c: '#10b981', dx: 36, label: 'Expand' },
    ].map((d, idx) =>
      makeHiFiRect(
        `saas-win-dot-${s}-${idx}`,
        `Window ${d.label} Dot`,
        winX + d.dx,
        winY + 10,
        8,
        8,
        d.c,
        { radius: 4 }
      )
    );

    const urlBar = makeHiFiText(
      `saas-win-url-${s}`,
      'App Window URL Text',
      'app.ositostudio.ai / live-telemetry',
      winX + 56,
      winY + 9,
      winW - 70,
      14,
      9,
      theme.textMuted,
      'left',
      'JetBrains Mono',
      '500'
    );

    // Mini KPI Cards inside the App Window
    const miniCardW = Math.floor((winW - 36) / 2);
    const miniKpi1 = makeHiFiRect(
      `saas-mini-kpi1-${s}`,
      'App Window KPI 1 Card',
      winX + 12,
      winY + 38,
      miniCardW,
      54,
      theme.surface,
      { radius: 6, stroke: theme.border, strokeWidth: 1 }
    );
    const miniKpi1Label = makeHiFiText(
      `saas-mini-kpi1-lbl-${s}`,
      'App KPI 1 Sub Label',
      'THROUGHPUT VELOCITY',
      winX + 20,
      winY + 45,
      miniCardW - 16,
      12,
      8,
      theme.textMuted,
      'left',
      'JetBrains Mono',
      '600'
    );
    const miniKpi1Val = makeHiFiText(
      `saas-mini-kpi1-val-${s}`,
      'App KPI 1 Metric Value',
      '+142.8% ↑',
      winX + 20,
      winY + 61,
      miniCardW - 16,
      20,
      16,
      theme.accent,
      'left',
      'Space Grotesk',
      '700'
    );

    const miniKpi2 = makeHiFiRect(
      `saas-mini-kpi2-${s}`,
      'App Window KPI 2 Card',
      winX + 24 + miniCardW,
      winY + 38,
      miniCardW,
      54,
      theme.surface,
      { radius: 6, stroke: theme.border, strokeWidth: 1 }
    );
    const miniKpi2Label = makeHiFiText(
      `saas-mini-kpi2-lbl-${s}`,
      'App KPI 2 Sub Label',
      'GLOBAL EDGE SLA',
      winX + 32 + miniCardW,
      winY + 45,
      miniCardW - 16,
      12,
      8,
      theme.textMuted,
      'left',
      'JetBrains Mono',
      '600'
    );
    const miniKpi2Val = makeHiFiText(
      `saas-mini-kpi2-val-${s}`,
      'App KPI 2 Metric Value',
      '99.99% OK',
      winX + 32 + miniCardW,
      winY + 61,
      miniCardW - 16,
      20,
      16,
      theme.textPrimary,
      'left',
      'Space Grotesk',
      '700'
    );

    // Multi-Bar Vector Telemetry Chart inside App Window
    const chartBox = makeHiFiRect(
      `saas-chart-surface-${s}`,
      'App Window Telemetry Chart Surface',
      winX + 12,
      winY + 102,
      winW - 24,
      winH - 114,
      theme.surface,
      { radius: 6, stroke: theme.border, strokeWidth: 1 }
    );

    const barHeights = [0.38, 0.54, 0.48, 0.72, 0.66, 0.88, 0.95];
    const chartAreaW = winW - 52;
    const barGap = 10;
    const barW = Math.max(14, Math.floor((chartAreaW - barGap * (barHeights.length - 1)) / barHeights.length));
    const chartMaxH = winH - 148;
    const chartBottomY = winY + winH - 22;

    const chartBars = barHeights.map((ratio, idx) => {
      const bh = Math.max(12, Math.round(chartMaxH * ratio));
      const bx = winX + 26 + idx * (barW + barGap);
      const by = chartBottomY - bh;
      return makeHiFiRect(
        `saas-chart-bar-${s}-${idx}`,
        `Telemetry Chart Bar ${idx + 1}`,
        bx,
        by,
        barW,
        bh,
        idx === barHeights.length - 1 ? theme.accent : theme.primary,
        {
          radius: 3,
          fillType: 'linear-gradient',
          fillGradientEnd: theme.secondary,
        }
      );
    });

    const chartHeaderTxt = makeHiFiText(
      `saas-chart-title-${s}`,
      'App Chart Header Label',
      'LIVE REALTIME VECTOR & AI PIPELINE   •   120 FPS',
      winX + 24,
      winY + 110,
      winW - 48,
      14,
      8.5,
      theme.accent,
      'left',
      'JetBrains Mono',
      '700'
    );

    // Bottom 3-Column High-Fidelity Feature Cards Grid
    const featY = 386;
    const featH = 194;
    const colW = Math.floor((innerW - 32) / 3);
    const featureSpecs = [
      {
        tag: '01 / HYBRID ENGINE',
        title: 'Cubic Bezier & 1px Pixel Studio',
        line1: 'Edit infinite mathematical vector paths and',
        line2: 'alpha-channel bitmaps on a single unified canvas.',
        cta: 'Explore Vector Engine →',
        accent: theme.primary,
      },
      {
        tag: '02 / LIVE PROTOTYPING',
        title: 'Interactive States & Nested Menus',
        line1: 'Test hover states, multi-level dropdown flyouts,',
        line2: 'and auto-reflowing containers in Live Preview Mode.',
        cta: 'Test Interactive States →',
        accent: theme.secondary,
      },
      {
        tag: '03 / ZERO-HANDOFF SHIP',
        title: 'Retina @3x Slices & Clean Code',
        line1: 'Export multi-scale WebP/AVIF/SVG asset bundles',
        line2: 'and production W3C Document Tokens in one click.',
        cta: 'Inspect Export Pipeline →',
        accent: theme.accent,
      },
    ];

    const featureLayers: CanvasObject[] = [];
    featureSpecs.forEach((spec, i) => {
      const cx = pad + i * (colW + 16);
      const cardSurface = makeHiFiRect(
        `saas-feat-card-${s}-${i}`,
        `Feature Card ${i + 1}: ${spec.title}`,
        cx,
        featY,
        colW,
        featH,
        theme.surface,
        {
          fillType: 'linear-gradient',
          fillGradientEnd: theme.surfaceAlt,
          stroke: i === 0 ? theme.accent : theme.border,
          strokeWidth: 1.5,
          shadow: true,
          interactiveHover: true,
        }
      );
      const topBar = makeHiFiRect(
        `saas-feat-bar-${s}-${i}`,
        `Feature Card ${i + 1} Accent Bar`,
        cx,
        featY,
        colW,
        3,
        spec.accent
      );
      const iconBox = makeHiFiRect(
        `saas-feat-icon-bg-${s}-${i}`,
        `Feature ${i + 1} Icon Badge`,
        cx + 20,
        featY + 18,
        34,
        34,
        theme.surfaceAlt,
        {
          radius: 8,
          stroke: spec.accent,
          strokeWidth: 1.5,
        }
      );
      const iconGlyph = makeHiFiPolyline(
        `saas-feat-icon-glyph-${s}-${i}`,
        `Feature ${i + 1} Vector Glyph`,
        cx + 29,
        featY + 27,
        i === 0
          ? [
              { x: 8, y: 0 },
              { x: 16, y: 8 },
              { x: 8, y: 16 },
              { x: 0, y: 8 },
            ]
          : i === 1
          ? [
              { x: 10, y: 0 },
              { x: 2, y: 9 },
              { x: 8, y: 9 },
              { x: 6, y: 16 },
              { x: 14, y: 7 },
              { x: 8, y: 7 },
            ]
          : [
              { x: 8, y: 0 },
              { x: 16, y: 4 },
              { x: 16, y: 11 },
              { x: 8, y: 16 },
              { x: 0, y: 11 },
              { x: 0, y: 4 },
            ],
        '#ffffff',
        1.5,
        true,
        spec.accent
      );
      const tagTxt = makeHiFiText(
        `saas-feat-tag-${s}-${i}`,
        `Feature ${i + 1} Eyebrow Tag`,
        spec.tag,
        cx + 64,
        featY + 29,
        colW - 80,
        14,
        9.5,
        spec.accent,
        'left',
        'JetBrains Mono',
        '700',
        0.8
      );
      const titleTxt = makeHiFiText(
        `saas-feat-title-${s}-${i}`,
        `Feature ${i + 1} Heading`,
        spec.title,
        cx + 20,
        featY + 66,
        colW - 40,
        22,
        15,
        theme.textPrimary,
        'left',
        'Space Grotesk',
        '700'
      );
      const desc1 = makeHiFiText(
        `saas-feat-desc1-${s}-${i}`,
        `Feature ${i + 1} Description Line 1`,
        spec.line1,
        cx + 20,
        featY + 96,
        colW - 40,
        16,
        11,
        theme.textMuted,
        'left',
        'Inter',
        '400'
      );
      const desc2 = makeHiFiText(
        `saas-feat-desc2-${s}-${i}`,
        `Feature ${i + 1} Description Line 2`,
        spec.line2,
        cx + 20,
        featY + 114,
        colW - 40,
        16,
        11,
        theme.textMuted,
        'left',
        'Inter',
        '400'
      );
      const linkTxt = makeHiFiText(
        `saas-feat-link-${s}-${i}`,
        `Feature ${i + 1} Action Link Accent`,
        spec.cta,
        cx + 20,
        featY + 154,
        colW - 40,
        16,
        11,
        theme.accent,
        'left',
        'Inter',
        '700'
      );

      featureLayers.push(
        cardSurface,
        topBar,
        iconBox,
        iconGlyph,
        tagTxt,
        titleTxt,
        desc1,
        desc2,
        linkTxt
      );
    });

    return [
      heroCard,
      heroAccentBar,
      ...eyebrowBadge,
      h1Line1,
      h1Line2,
      sub1,
      sub2,
      ...primaryCta,
      ...secondaryCta,
      trustMeta,
      appWindowFrame,
      appWindowHeader,
      ...winDots,
      urlBar,
      miniKpi1,
      miniKpi1Label,
      miniKpi1Val,
      miniKpi2,
      miniKpi2Label,
      miniKpi2Val,
      chartBox,
      ...chartBars,
      chartHeaderTxt,
      ...featureLayers,
      ...navbarLayers,
    ];
  }

  // ==========================================================================
  // TEMPLATE 2: Apple / Linear-Style Bento Feature Showcase ('bento-product')
  // ==========================================================================
  if (templateId === 'bento-product') {
    const headerY = 82;
    const eyebrow = makeHiFiText(
      `bento-eyebrow-${s}`,
      'Bento Section Eyebrow',
      'MODULAR PRODUCT ARCHITECTURE',
      pad,
      headerY,
      260,
      14,
      9.5,
      theme.accent,
      'left',
      'JetBrains Mono',
      '700',
      0.9
    );
    const mainTitle = makeHiFiText(
      `bento-title-${s}`,
      'Bento Section Headline',
      `${brief.brandName.slice(0, 16)} — Modular Architecture & Velocity`,
      pad,
      headerY + 16,
      Math.round(innerW * 0.62),
      24,
      18,
      theme.textPrimary,
      'left',
      'Space Grotesk',
      '700'
    );

    // Right-aligned Segmented Filter Buttons
    const filterLabels = ['All Capabilities', 'Vector & AI', 'Developer SDK'];
    const filterButtons: CanvasObject[] = [];
    filterLabels.forEach((lbl, idx) => {
      const bw = 108;
      const bx = pad + innerW - (3 - idx) * (bw + 8) + 8;
      filterButtons.push(
        ...makeHiFiButton(
          `bento-filter-${s}-${idx}`,
          `Bento Filter Tab: ${lbl}`,
          lbl,
          bx,
          headerY + 8,
          bw,
          30,
          idx === 0 ? 'pill-active' : 'pill-idle',
          theme
        )
      );
    });

    // Cell 1 (Top-Left, 58% width): Flagship Spotlight Card
    const gridTopY = 132;
    const row1H = 252;
    const cell1W = Math.round(innerW * 0.58);
    const cell2X = pad + cell1W + 16;
    const cell2W = innerW - cell1W - 16;

    const cell1Card = makeHiFiRect(
      `bento-cell1-card-${s}`,
      'Bento Spotlight Card Surface',
      pad,
      gridTopY,
      cell1W,
      row1H,
      theme.surface,
      {
        fillType: 'linear-gradient',
        fillGradientEnd: theme.surfaceAlt,
        stroke: theme.primary,
        strokeWidth: 1.5,
        shadow: true,
        interactiveHover: true,
      }
    );
    const cell1Badge = makeHiFiBadge(
      `bento-cell1-badge-${s}`,
      'Bento Cell 1 Flagship',
      '✦ CORE COMPOSITOR ENGINE',
      pad + 20,
      gridTopY + 18,
      196,
      22,
      theme
    );
    const cell1Title = makeHiFiText(
      `bento-cell1-title-${s}`,
      'Bento Cell 1 Headline',
      'Real-Time Hybrid Vector & Pixel Studio',
      pad + 20,
      gridTopY + 50,
      cell1W - 40,
      26,
      19,
      theme.textPrimary,
      'left',
      'Space Grotesk',
      '700'
    );
    const cell1Sub = makeHiFiText(
      `bento-cell1-sub-${s}`,
      'Bento Cell 1 Subheadline',
      'Non-destructive cubic Bezier nodes, live boolean geometry, and 400% pixel retouching.',
      pad + 20,
      gridTopY + 78,
      cell1W - 40,
      18,
      11,
      theme.textMuted,
      'left',
      'Inter',
      '400'
    );

    // Interactive Vector Preview Stage inside Cell 1
    const stageX = pad + 20;
    const stageY = gridTopY + 106;
    const stageW = cell1W - 40;
    const stageH = 128;
    const cell1Stage = makeHiFiRect(
      `bento-cell1-stage-${s}`,
      'Bento Vector Stage Preview Card',
      stageX,
      stageY,
      stageW,
      stageH,
      '#090d16',
      { radius: 6, stroke: theme.border, strokeWidth: 1 }
    );
    const bezierWave = makeHiFiPolyline(
      `bento-cell1-curve-${s}`,
      'Bento Bezier Curve Illustration',
      stageX + 24,
      stageY + 26,
      [
        { x: 0, y: 74 },
        { x: Math.round(stageW * 0.22), y: 18 },
        { x: Math.round(stageW * 0.46), y: 64 },
        { x: Math.round(stageW * 0.72), y: 10 },
        { x: stageW - 56, y: 42 },
      ],
      theme.accent,
      3,
      false
    );
    const cell1Cta = makeHiFiButton(
      `bento-cell1-cta-${s}`,
      'Bento Launch Compositor Button',
      'Launch Studio ▸',
      stageX + stageW - 142,
      stageY + stageH - 42,
      128,
      30,
      'primary',
      theme
    );
    const cell1FpsTxt = makeHiFiText(
      `bento-cell1-fps-${s}`,
      'Bento GPU Telemetry Label',
      '● GPU ACCELERATED  •  60/120 FPS LOCKED  •  ZERO DOM LAG',
      stageX + 16,
      stageY + stageH - 26,
      stageW - 170,
      14,
      9,
      theme.accent,
      'left',
      'JetBrains Mono',
      '700'
    );

    // Cell 2 (Top-Right, 42% width): Telemetry Speed Benchmark Card
    const cell2Card = makeHiFiRect(
      `bento-cell2-card-${s}`,
      'Bento Telemetry Benchmark Card',
      cell2X,
      gridTopY,
      cell2W,
      row1H,
      theme.surface,
      {
        fillType: 'linear-gradient',
        fillGradientEnd: theme.surfaceAlt,
        stroke: theme.border,
        strokeWidth: 1.5,
        shadow: true,
        interactiveHover: true,
      }
    );
    const cell2Tag = makeHiFiText(
      `bento-cell2-tag-${s}`,
      'Bento Cell 2 Eyebrow',
      'BENCHMARK TELEMETRY',
      cell2X + 20,
      gridTopY + 20,
      cell2W - 40,
      14,
      9.5,
      theme.accent,
      'left',
      'JetBrains Mono',
      '700'
    );
    const cell2Metric = makeHiFiText(
      `bento-cell2-metric-${s}`,
      'Bento Cell 2 Hero Metric',
      '0.4 ms',
      cell2X + 20,
      gridTopY + 40,
      160,
      38,
      32,
      theme.textPrimary,
      'left',
      'Space Grotesk',
      '700'
    );
    const cell2MetricSub = makeHiFiText(
      `bento-cell2-metricsub-${s}`,
      'Bento Cell 2 Subcopy',
      'Sub-millisecond canvas frame render latency',
      cell2X + 20,
      gridTopY + 80,
      cell2W - 40,
      16,
      11,
      theme.textMuted,
      'left',
      'Inter',
      '400'
    );

    const benchSpecs = [
      { label: 'Osito Hybrid Engine', pct: 0.94, val: '120 FPS', color: theme.primary },
      { label: 'Cloud DOM Vector Tool', pct: 0.56, val: '58 FPS', color: theme.secondary },
      { label: 'Legacy Raster Suite', pct: 0.36, val: '34 FPS', color: theme.border },
    ];
    const benchLayers: CanvasObject[] = [];
    benchSpecs.forEach((b, idx) => {
      const by = gridTopY + 114 + idx * 42;
      const trackW = cell2W - 40;
      benchLayers.push(
        makeHiFiText(
          `bento-bench-lbl-${s}-${idx}`,
          `Benchmark ${idx + 1} Label`,
          `${b.label} (${b.val})`,
          cell2X + 20,
          by,
          trackW,
          14,
          10,
          idx === 0 ? theme.textPrimary : theme.textMuted,
          'left',
          'JetBrains Mono',
          idx === 0 ? '700' : '500'
        ),
        makeHiFiRect(
          `bento-bench-track-${s}-${idx}`,
          `Benchmark ${idx + 1} Track`,
          cell2X + 20,
          by + 16,
          trackW,
          12,
          '#090d16',
          { radius: 6, stroke: theme.border, strokeWidth: 1 }
        ),
        makeHiFiRect(
          `bento-bench-fill-${s}-${idx}`,
          `Benchmark ${idx + 1} Progress Fill`,
          cell2X + 20,
          by + 16,
          Math.round(trackW * b.pct),
          12,
          b.color,
          { radius: 6 }
        )
      );
    });

    // Row 2 (y = 398, h = 182): Cell 3 (Left 40%) + Cell 4 (Right 60%)
    const row2Y = 398;
    const row2H = 182;
    const cell3W = Math.round(innerW * 0.4);
    const cell4X = pad + cell3W + 16;
    const cell4W = innerW - cell3W - 16;

    const cell3Card = makeHiFiRect(
      `bento-cell3-card-${s}`,
      'Bento Document Tokens Card',
      pad,
      row2Y,
      cell3W,
      row2H,
      theme.surface,
      {
        fillType: 'linear-gradient',
        fillGradientEnd: theme.surfaceAlt,
        stroke: theme.border,
        strokeWidth: 1.5,
        shadow: true,
        interactiveHover: true,
      }
    );
    const cell3Tag = makeHiFiText(
      `bento-cell3-tag-${s}`,
      'Bento Cell 3 Eyebrow',
      'DOCUMENT COLOR TOKENS',
      pad + 20,
      row2Y + 18,
      cell3W - 40,
      14,
      9.5,
      theme.accent,
      'left',
      'JetBrains Mono',
      '700'
    );
    const cell3Title = makeHiFiText(
      `bento-cell3-title-${s}`,
      'Bento Cell 3 Title',
      'WCAG 2.2 AA/AAA Harmony',
      pad + 20,
      row2Y + 38,
      cell3W - 40,
      22,
      16,
      theme.textPrimary,
      'left',
      'Space Grotesk',
      '700'
    );
    const cell3Sub = makeHiFiText(
      `bento-cell3-sub-${s}`,
      'Bento Cell 3 Subcopy',
      'One-click algorithmic recoloring across canvas layers.',
      pad + 20,
      row2Y + 64,
      cell3W - 40,
      16,
      10.5,
      theme.textMuted,
      'left',
      'Inter',
      '400'
    );

    const tokenColors = [
      { c: theme.primary, n: 'PRI' },
      { c: theme.secondary, n: 'SEC' },
      { c: theme.accent, n: 'ACC' },
      { c: theme.surfaceAlt, n: 'SRF' },
      { c: theme.textPrimary, n: 'TXT' },
    ];
    const swW = Math.floor((cell3W - 40 - 32) / 5);
    const tokenSwatches: CanvasObject[] = [];
    tokenColors.forEach((tk, idx) => {
      const sx = pad + 20 + idx * (swW + 8);
      tokenSwatches.push(
        makeHiFiRect(
          `bento-token-sw-${s}-${idx}`,
          `Bento Token Swatch ${tk.n}`,
          sx,
          row2Y + 96,
          swW,
          44,
          tk.c,
          { radius: 6, stroke: '#ffffff', strokeWidth: 1 }
        ),
        makeHiFiText(
          `bento-token-lbl-${s}-${idx}`,
          `Bento Token Label ${tk.n}`,
          tk.n,
          sx,
          row2Y + 146,
          swW,
          14,
          9,
          theme.textMuted,
          'center',
          'JetBrains Mono',
          '700'
        )
      );
    });

    // Cell 4 (Bottom-Right, 60% width): Zero-Handoff Codegen & Export Card
    const cell4Card = makeHiFiRect(
      `bento-cell4-card-${s}`,
      'Bento Codegen Pipeline Card',
      cell4X,
      row2Y,
      cell4W,
      row2H,
      theme.surface,
      {
        fillType: 'linear-gradient',
        fillGradientEnd: theme.surfaceAlt,
        stroke: theme.accent,
        strokeWidth: 1.5,
        shadow: true,
        interactiveHover: true,
      }
    );
    const cell4LeftW = Math.round(cell4W * 0.48);
    const cell4Tag = makeHiFiText(
      `bento-cell4-tag-${s}`,
      'Bento Cell 4 Eyebrow',
      'PRODUCTION CODEGEN',
      cell4X + 20,
      row2Y + 18,
      cell4LeftW,
      14,
      9.5,
      theme.accent,
      'left',
      'JetBrains Mono',
      '700'
    );
    const cell4Title = makeHiFiText(
      `bento-cell4-title-${s}`,
      'Bento Cell 4 Title',
      'React, Tailwind & Retina ZIP',
      cell4X + 20,
      row2Y + 38,
      cell4LeftW,
      22,
      16,
      theme.textPrimary,
      'left',
      'Space Grotesk',
      '700'
    );
    const cell4Sub1 = makeHiFiText(
      `bento-cell4-sub1-${s}`,
      'Bento Cell 4 Subcopy 1',
      'Ship clean TypeScript components, inline',
      cell4X + 20,
      row2Y + 66,
      cell4LeftW,
      16,
      11,
      theme.textMuted,
      'left',
      'Inter',
      '400'
    );
    const cell4Sub2 = makeHiFiText(
      `bento-cell4-sub2-${s}`,
      'Bento Cell 4 Subcopy 2',
      'SVG paths, and @1x/@2x/@3x slices instantly.',
      cell4X + 20,
      row2Y + 83,
      cell4LeftW,
      16,
      11,
      theme.textMuted,
      'left',
      'Inter',
      '400'
    );
    const cell4Cta = makeHiFiButton(
      `bento-cell4-cta-${s}`,
      'Bento Export Code Bundle CTA',
      'Export Code Bundle ▸',
      cell4X + 20,
      row2Y + 122,
      166,
      36,
      'primary',
      theme
    );

    const codeX = cell4X + cell4LeftW + 24;
    const codeW = cell4W - cell4LeftW - 40;
    const codeBox = makeHiFiRect(
      `bento-cell4-codebox-${s}`,
      'Bento Code Terminal Surface',
      codeX,
      row2Y + 18,
      codeW,
      row2H - 36,
      '#090d16',
      { radius: 6, stroke: theme.border, strokeWidth: 1 }
    );
    const codeLines = [
      '// osito-export.config.ts',
      'export const DesignSystem = {',
      `  brand: "${brief.brandName}",`,
      `  primary: "${theme.primary}",`,
      '  slices: ["@1x", "@2x", "@3x"],',
      '  formats: ["webp", "svg"]',
      '};',
    ].map((line, idx) =>
      makeHiFiText(
        `bento-code-ln-${s}-${idx}`,
        `Code Snippet Line ${idx + 1}`,
        line,
        codeX + 12,
        row2Y + 28 + idx * 18,
        codeW - 24,
        14,
        9.5,
        idx === 0 ? theme.textMuted : idx % 2 === 1 ? theme.accent : theme.textPrimary,
        'left',
        'JetBrains Mono',
        '500'
      )
    );

    return [
      eyebrow,
      mainTitle,
      ...filterButtons,
      cell1Card,
      ...cell1Badge,
      cell1Title,
      cell1Sub,
      cell1Stage,
      bezierWave,
      ...cell1Cta,
      cell1FpsTxt,
      cell2Card,
      cell2Tag,
      cell2Metric,
      cell2MetricSub,
      ...benchLayers,
      cell3Card,
      cell3Tag,
      cell3Title,
      cell3Sub,
      ...tokenSwatches,
      cell4Card,
      cell4Tag,
      cell4Title,
      cell4Sub1,
      cell4Sub2,
      ...cell4Cta,
      codeBox,
      ...codeLines,
      ...navbarLayers,
    ];
  }

  // ==========================================================================
  // TEMPLATE 3: Luxury D2C E-Commerce Storefront ('ecommerce-store')
  // ==========================================================================
  if (templateId === 'ecommerce-store') {
    const promoY = 80;
    const promoH = 42;
    const promoBar = makeHiFiRect(
      `ecom-promo-bar-${s}`,
      'Storefront Promo Banner Surface',
      pad,
      promoY,
      innerW,
      promoH,
      theme.surfaceAlt,
      { stroke: theme.border, strokeWidth: 1 }
    );
    const promoBadge = makeHiFiBadge(
      `ecom-promo-badge-${s}`,
      'Promo Drop',
      'LIMITED EDITION DROP',
      pad + 12,
      promoY + 10,
      148,
      22,
      theme
    );
    const promoTxt = makeHiFiText(
      `ecom-promo-txt-${s}`,
      'Promo Headline Copy',
      'Complimentary Express Air Shipping & 2-Year Warranty on All Flagship Hardware',
      pad + 172,
      promoY + 14,
      innerW - 360,
      16,
      11,
      theme.textPrimary,
      'left',
      'Inter',
      '600'
    );
    const filterTag = makeHiFiText(
      `ecom-promo-meta-${s}`,
      'Storefront Filter Status Accent',
      'SHOWING: AUTONOMOUS SERIES (2)',
      pad + innerW - 190,
      promoY + 15,
      176,
      14,
      9,
      theme.accent,
      'right',
      'JetBrains Mono',
      '700'
    );

    const bodyY = 134;
    const bodyH = 446;
    const leftAreaW = Math.round(innerW * 0.66);
    const prodW = Math.floor((leftAreaW - 16) / 2);

    const products = [
      {
        badge: '★ BESTSELLER',
        rating: '★ 4.9 (418)',
        category: 'AUTONOMOUS AERIAL SERIES',
        title: `${brief.brandName.split(/\s+/)[0].slice(0, 10)} Sentinel X1 Pro`,
        specs: '4K Thermal Gimbal • 48-Min Flight • LiDAR AI',
        price: '$1,290',
        compare: '$1,490',
        accent: theme.primary,
      },
      {
        badge: '✦ NEW RELEASE',
        rating: '★ 5.0 (194)',
        category: 'LOW-LATENCY TELEMETRY',
        title: 'Vexel Carbon Ground Station',
        specs: '120Hz OLED Display • Hall Gimbals • 15km Link',
        price: '$640',
        compare: '$750',
        accent: theme.secondary,
      },
    ];

    const productLayers: CanvasObject[] = [];
    products.forEach((p, idx) => {
      const px = pad + idx * (prodW + 16);
      const card = makeHiFiRect(
        `ecom-prod-card-${s}-${idx}`,
        `Product Card ${idx + 1}: ${p.title}`,
        px,
        bodyY,
        prodW,
        bodyH,
        theme.surface,
        {
          fillType: 'linear-gradient',
          fillGradientEnd: theme.surfaceAlt,
          stroke: idx === 0 ? theme.primary : theme.border,
          strokeWidth: 1.5,
          shadow: true,
          interactiveHover: true,
        }
      );

      // High-Fidelity Product Image Stage with Vector Hardware Illustration
      const imgH = 212;
      const imgStage = makeHiFiRect(
        `ecom-prod-stage-${s}-${idx}`,
        `Product ${idx + 1} Media Stage`,
        px + 12,
        bodyY + 12,
        prodW - 24,
        imgH,
        '#090d16',
        {
          radius: 6,
          fillType: 'linear-gradient',
          fillGradientEnd: theme.surfaceAlt,
          stroke: theme.border,
          strokeWidth: 1,
        }
      );

      const badge = makeHiFiBadge(
        `ecom-prod-badge-${s}-${idx}`,
        `Product ${idx + 1} Status`,
        p.badge,
        px + 22,
        bodyY + 22,
        108,
        22,
        theme
      );

      const ratingTxt = makeHiFiText(
        `ecom-prod-rating-${s}-${idx}`,
        `Product ${idx + 1} Rating`,
        p.rating,
        px + prodW - 104,
        bodyY + 26,
        82,
        14,
        10,
        theme.accent,
        'right',
        'JetBrains Mono',
        '700'
      );

      // Vector Hardware Silhouette inside Image Stage
      const cx = px + Math.round(prodW / 2);
      const cy = bodyY + 12 + Math.round(imgH / 2) + 8;
      const outerHalo = makeHiFiRect(
        `ecom-prod-halo-${s}-${idx}`,
        `Product ${idx + 1} Halo Ring`,
        cx - 46,
        cy - 46,
        92,
        92,
        p.accent,
        {
          radius: 46,
          fillType: 'linear-gradient',
          fillGradientEnd: theme.accent,
          stroke: '#ffffff',
          strokeWidth: 1.5,
          opacity: 0.88,
        }
      );
      const innerChass = makeHiFiPolyline(
        `ecom-prod-chassis-${s}-${idx}`,
        `Product ${idx + 1} Vector Emblem`,
        cx - 28,
        cy - 28,
        [
          { x: 28, y: 0 },
          { x: 56, y: 28 },
          { x: 28, y: 56 },
          { x: 0, y: 28 },
        ],
        '#ffffff',
        2,
        true,
        '#090d16'
      );

      const catTxt = makeHiFiText(
        `ecom-prod-cat-${s}-${idx}`,
        `Product ${idx + 1} Category Eyebrow`,
        p.category,
        px + 18,
        bodyY + imgH + 28,
        prodW - 36,
        14,
        9,
        theme.accent,
        'left',
        'JetBrains Mono',
        '700',
        0.8
      );
      const titleTxt = makeHiFiText(
        `ecom-prod-title-${s}-${idx}`,
        `Product ${idx + 1} Title`,
        p.title,
        px + 18,
        bodyY + imgH + 46,
        prodW - 36,
        24,
        16,
        theme.textPrimary,
        'left',
        'Space Grotesk',
        '700'
      );
      const specTxt = makeHiFiText(
        `ecom-prod-spec-${s}-${idx}`,
        `Product ${idx + 1} Specs Muted`,
        p.specs,
        px + 18,
        bodyY + imgH + 74,
        prodW - 36,
        16,
        11,
        theme.textMuted,
        'left',
        'Inter',
        '400'
      );

      // Color Finish Swatches
      const finishLbl = makeHiFiText(
        `ecom-prod-fin-${s}-${idx}`,
        `Product ${idx + 1} Finish Meta`,
        'FINISH: MATTE OBSIDIAN  •  IN STOCK',
        px + 18,
        bodyY + imgH + 102,
        prodW - 36,
        14,
        9,
        theme.textMuted,
        'left',
        'JetBrains Mono',
        '600'
      );

      const priceTxt = makeHiFiText(
        `ecom-prod-price-${s}-${idx}`,
        `Product ${idx + 1} Price Value`,
        p.price,
        px + 18,
        bodyY + bodyH - 52,
        90,
        26,
        22,
        theme.textPrimary,
        'left',
        'Space Grotesk',
        '700'
      );
      const compareTxt = makeHiFiText(
        `ecom-prod-comp-${s}-${idx}`,
        `Product ${idx + 1} Compare Muted`,
        `MSRP ${p.compare}`,
        px + 18,
        bodyY + bodyH - 26,
        90,
        14,
        9.5,
        theme.textMuted,
        'left',
        'JetBrains Mono',
        '500'
      );

      const addBtn = makeHiFiButton(
        `ecom-prod-btn-${s}-${idx}`,
        `Product ${idx + 1} Add to Bag`,
        'Add to Bag +',
        px + prodW - 134,
        bodyY + bodyH - 52,
        116,
        38,
        idx === 0 ? 'primary' : 'pill-active',
        theme
      );

      productLayers.push(
        card,
        imgStage,
        ...badge,
        ratingTxt,
        outerHalo,
        innerChass,
        catTxt,
        titleTxt,
        specTxt,
        finishLbl,
        priceTxt,
        compareTxt,
        ...addBtn
      );
    });

    // Right Column: Live Shopping Bag & Express Checkout Summary Drawer
    const cartX = pad + leftAreaW + 16;
    const cartW = innerW - leftAreaW - 16;
    const cartCard = makeHiFiRect(
      `ecom-cart-drawer-${s}`,
      'Express Shopping Bag Drawer Card',
      cartX,
      bodyY,
      cartW,
      bodyH,
      theme.surface,
      {
        fillType: 'linear-gradient',
        fillGradientEnd: theme.surfaceAlt,
        stroke: theme.accent,
        strokeWidth: 1.5,
        shadow: true,
      }
    );
    const cartTitle = makeHiFiText(
      `ecom-cart-title-${s}`,
      'Shopping Bag Header Title',
      'YOUR SHOPPING BAG (2)',
      cartX + 18,
      bodyY + 18,
      cartW - 36,
      18,
      12,
      theme.textPrimary,
      'left',
      'JetBrains Mono',
      '700',
      0.6
    );

    // Free Shipping Unlocked Bar
    const shipTrack = makeHiFiRect(
      `ecom-cart-ship-bar-${s}`,
      'Free Shipping Progress Fill',
      cartX + 18,
      bodyY + 44,
      cartW - 36,
      6,
      theme.accent,
      { radius: 3 }
    );
    const shipTxt = makeHiFiText(
      `ecom-cart-ship-txt-${s}`,
      'Free Shipping Status Accent',
      '✓ UNLOCKED FREE PRIORITY AIR SHIPPING',
      cartX + 18,
      bodyY + 56,
      cartW - 36,
      14,
      8.5,
      theme.accent,
      'left',
      'JetBrains Mono',
      '700'
    );

    // 2 Line Items in Cart
    const cartItems = [
      { name: 'Sentinel X1 Thermal Pro', meta: 'Qty: 1  •  Matte Obsidian', price: '$1,290.00' },
      { name: 'Smart LiHV Flight Battery', meta: 'Qty: 2  •  6800mAh High-Discharge', price: '$298.00' },
    ];
    const cartItemLayers: CanvasObject[] = [];
    cartItems.forEach((item, idx) => {
      const iy = bodyY + 82 + idx * 78;
      cartItemLayers.push(
        makeHiFiRect(
          `ecom-cart-item-${s}-${idx}`,
          `Cart Line Item ${idx + 1} Row`,
          cartX + 16,
          iy,
          cartW - 32,
          68,
          '#090d16',
          { radius: 6, stroke: theme.border, strokeWidth: 1 }
        ),
        makeHiFiText(
          `ecom-cart-item-title-${s}-${idx}`,
          `Cart Item ${idx + 1} Name`,
          item.name,
          cartX + 28,
          iy + 12,
          cartW - 120,
          16,
          11.5,
          theme.textPrimary,
          'left',
          'Inter',
          '700'
        ),
        makeHiFiText(
          `ecom-cart-item-meta-${s}-${idx}`,
          `Cart Item ${idx + 1} Meta Muted`,
          item.meta,
          cartX + 28,
          iy + 32,
          cartW - 56,
          14,
          9.5,
          theme.textMuted,
          'left',
          'JetBrains Mono',
          '500'
        ),
        makeHiFiText(
          `ecom-cart-item-price-${s}-${idx}`,
          `Cart Item ${idx + 1} Price Accent`,
          item.price,
          cartX + cartW - 102,
          iy + 12,
          74,
          16,
          11,
          theme.accent,
          'right',
          'JetBrains Mono',
          '700'
        )
      );
    });

    // Order Summary Totals
    const sumY = bodyY + 252;
    const sumRows = [
      { l: 'Subtotal (2 items)', v: '$1,588.00', bold: false },
      { l: 'Express Air Shipping', v: 'FREE', bold: false },
      { l: 'Estimated Tax', v: '$112.00', bold: false },
      { l: 'Order Total (USD)', v: '$1,700.00', bold: true },
    ];
    const sumLayers: CanvasObject[] = [];
    sumRows.forEach((r, idx) => {
      const ry = sumY + idx * 24 + (r.bold ? 6 : 0);
      sumLayers.push(
        makeHiFiText(
          `ecom-sum-lbl-${s}-${idx}`,
          `Order Summary ${r.l}`,
          r.l,
          cartX + 18,
          ry,
          cartW - 120,
          16,
          r.bold ? 12 : 10.5,
          r.bold ? theme.textPrimary : theme.textMuted,
          'left',
          'Inter',
          r.bold ? '700' : '500'
        ),
        makeHiFiText(
          `ecom-sum-val-${s}-${idx}`,
          `Order Value ${r.l}`,
          r.v,
          cartX + cartW - 110,
          ry,
          92,
          16,
          r.bold ? 14 : 10.5,
          r.bold ? theme.accent : theme.textPrimary,
          'right',
          'JetBrains Mono',
          '700'
        )
      );
    });

    const checkoutBtn = makeHiFiButton(
      `ecom-checkout-cta-${s}`,
      'Express Checkout Primary Button',
      'Instant Checkout ▸',
      cartX + 16,
      bodyY + bodyH - 76,
      cartW - 32,
      42,
      'primary',
      theme
    );

    const secureFooter = makeHiFiText(
      `ecom-secure-txt-${s}`,
      'Checkout Encryption Footer Muted',
      '🔒 256-BIT TLS ENCRYPTED • APPLE PAY & STRIPE',
      cartX + 16,
      bodyY + bodyH - 24,
      cartW - 32,
      14,
      8.5,
      theme.textMuted,
      'center',
      'JetBrains Mono',
      '600'
    );

    return [
      promoBar,
      ...promoBadge,
      promoTxt,
      filterTag,
      ...productLayers,
      cartCard,
      cartTitle,
      shipTrack,
      shipTxt,
      ...cartItemLayers,
      ...sumLayers,
      ...checkoutBtn,
      secureFooter,
      ...navbarLayers,
    ];
  }

  // ==========================================================================
  // TEMPLATE 4: Enterprise AI Telemetry & Analytics Dashboard ('analytics-dashboard')
  // ==========================================================================
  if (templateId === 'analytics-dashboard') {
    const dashY = 82;
    const dashH = 498;
    const sideW = 206;

    // Left High-Fidelity Collapsible Sidebar (supports Preview Mode nested submenu flyout!)
    const sidebarCard = makeHiFiRect(
      `dash-sidebar-surface-${s}`,
      'Dashboard Sidebar Navigation Card',
      pad,
      dashY,
      sideW,
      dashH,
      theme.surface,
      {
        fillType: 'linear-gradient',
        fillGradientEnd: theme.surfaceAlt,
        stroke: theme.border,
        strokeWidth: 1.5,
        shadow: true,
        params: {
          hasNestedMenu: true,
          activeItem: 1,
          openMenuIndex: 0,
        },
      }
    );

    const wsHeader = makeHiFiText(
      `dash-ws-title-${s}`,
      'Sidebar Workspace Title',
      `${brief.brandName} CLOUD`,
      pad + 16,
      dashY + 16,
      sideW - 32,
      16,
      11,
      theme.textPrimary,
      'left',
      'Space Grotesk',
      '700',
      0.5
    );
    const wsStatus = makeHiFiText(
      `dash-ws-status-${s}`,
      'Sidebar Operational Status Accent',
      '● US-WEST PROD • 99.99%',
      pad + 16,
      dashY + 34,
      sideW - 32,
      14,
      8.5,
      theme.accent,
      'left',
      'JetBrains Mono',
      '700'
    );

    const sideMenuItems = [
      '▸ Executive Overview',
      '  Realtime Telemetry ▸',
      '  Agentic Workflows ▸',
      '  Unit Economics & ROI',
      '  Security & SOC2 Logs',
      '  API Keys & Webhooks',
    ];
    const sideBtnLayers: CanvasObject[] = [];
    sideMenuItems.forEach((lbl, idx) => {
      const by = dashY + 62 + idx * 38;
      sideBtnLayers.push(
        ...makeHiFiButton(
          `dash-side-btn-${s}-${idx}`,
          `Sidebar Nav Item ${idx + 1}`,
          lbl,
          pad + 12,
          by,
          sideW - 24,
          32,
          idx === 0 ? 'pill-active' : 'pill-idle',
          theme
        )
      );
    });

    // Bottom Monthly Cloud Spend Guardrail Card inside Sidebar
    const quotaBox = makeHiFiRect(
      `dash-quota-card-${s}`,
      'Sidebar Spend Guardrail Card',
      pad + 12,
      dashY + dashH - 96,
      sideW - 24,
      82,
      '#090d16',
      { radius: 6, stroke: theme.border, strokeWidth: 1 }
    );
    const quotaLbl = makeHiFiText(
      `dash-quota-lbl-${s}`,
      'Spend Guardrail Header',
      'MONTHLY SPEND GUARDRAIL',
      pad + 22,
      dashY + dashH - 84,
      sideW - 44,
      12,
      8.5,
      theme.accent,
      'left',
      'JetBrains Mono',
      '700'
    );
    const quotaTrack = makeHiFiRect(
      `dash-quota-track-${s}`,
      'Spend Progress Track',
      pad + 22,
      dashY + dashH - 62,
      sideW - 44,
      8,
      theme.surfaceAlt,
      { radius: 4 }
    );
    const quotaFill = makeHiFiRect(
      `dash-quota-fill-${s}`,
      'Spend Progress Fill',
      pad + 22,
      dashY + dashH - 62,
      Math.round((sideW - 44) * 0.34),
      8,
      theme.primary,
      { radius: 4 }
    );
    const quotaVal = makeHiFiText(
      `dash-quota-val-${s}`,
      'Spend Cap Value Muted',
      '$3.40 / $10.00 Hard Cap (34%)',
      pad + 22,
      dashY + dashH - 44,
      sideW - 44,
      14,
      9.5,
      theme.textMuted,
      'left',
      'JetBrains Mono',
      '600'
    );

    // Main Content Area (Right of Sidebar)
    const mainX = pad + sideW + 16;
    const mainW = innerW - sideW - 16;

    // Row 1: 3 High-Fidelity KPI Metric Cards with Vector Sparklines
    const kpiW = Math.floor((mainW - 24) / 3);
    const kpiH = 122;
    const kpiSpecs = [
      {
        label: 'MONTHLY RECURRING ARR',
        value: '$148,920',
        delta: '+24.8% vs last mo',
        color: theme.primary,
        pts: [
          { x: 0, y: 24 },
          { x: 35, y: 18 },
          { x: 70, y: 21 },
          { x: 105, y: 11 },
          { x: 140, y: 14 },
          { x: 175, y: 3 },
        ],
      },
      {
        label: 'ACTIVE AUTONOMOUS AGENTS',
        value: '12,840',
        delta: '+18.2% • 99.99% SLA',
        color: theme.secondary,
        pts: [
          { x: 0, y: 26 },
          { x: 35, y: 20 },
          { x: 70, y: 15 },
          { x: 105, y: 17 },
          { x: 140, y: 8 },
          { x: 175, y: 4 },
        ],
      },
      {
        label: 'P95 INFERENCE LATENCY',
        value: '42.6 ms',
        delta: '-14.5% faster edge',
        color: theme.accent,
        pts: [
          { x: 0, y: 6 },
          { x: 35, y: 12 },
          { x: 70, y: 10 },
          { x: 105, y: 18 },
          { x: 140, y: 22 },
          { x: 175, y: 25 },
        ],
      },
    ];

    const kpiLayers: CanvasObject[] = [];
    kpiSpecs.forEach((k, idx) => {
      const kx = mainX + idx * (kpiW + 12);
      kpiLayers.push(
        makeHiFiRect(
          `dash-kpi-card-${s}-${idx}`,
          `KPI Metric Card: ${k.label}`,
          kx,
          dashY,
          kpiW,
          kpiH,
          theme.surface,
          {
            fillType: 'linear-gradient',
            fillGradientEnd: theme.surfaceAlt,
            stroke: idx === 0 ? theme.primary : theme.border,
            strokeWidth: 1.5,
            shadow: true,
            interactiveHover: true,
          }
        ),
        makeHiFiRect(
          `dash-kpi-bar-${s}-${idx}`,
          `KPI ${idx + 1} Accent Bar`,
          kx,
          dashY,
          kpiW,
          3,
          k.color
        ),
        makeHiFiText(
          `dash-kpi-lbl-${s}-${idx}`,
          `KPI ${idx + 1} Eyebrow`,
          k.label,
          kx + 16,
          dashY + 14,
          kpiW - 32,
          14,
          8.5,
          theme.textMuted,
          'left',
          'JetBrains Mono',
          '700'
        ),
        makeHiFiText(
          `dash-kpi-val-${s}-${idx}`,
          `KPI ${idx + 1} Primary Value`,
          k.value,
          kx + 16,
          dashY + 34,
          kpiW - 32,
          28,
          23,
          theme.textPrimary,
          'left',
          'Space Grotesk',
          '700'
        ),
        makeHiFiText(
          `dash-kpi-delta-${s}-${idx}`,
          `KPI ${idx + 1} Delta Accent`,
          k.delta,
          kx + 16,
          dashY + 64,
          kpiW - 32,
          14,
          9.5,
          theme.accent,
          'left',
          'JetBrains Mono',
          '700'
        ),
        makeHiFiPolyline(
          `dash-kpi-spark-${s}-${idx}`,
          `KPI ${idx + 1} Sparkline Vector`,
          kx + 16,
          dashY + 86,
          k.pts,
          k.color,
          2.25,
          false
        )
      );
    });

    // Row 2: 12-Month Revenue & Inference Volume Bar Chart Card
    const chartY = dashY + kpiH + 14;
    const chartH = 166;
    const chartCard = makeHiFiRect(
      `dash-chart-card-${s}`,
      'Dashboard Telemetry Chart Card',
      mainX,
      chartY,
      mainW,
      chartH,
      theme.surface,
      {
        fillType: 'linear-gradient',
        fillGradientEnd: theme.surfaceAlt,
        stroke: theme.border,
        strokeWidth: 1.5,
        shadow: true,
      }
    );
    const chartTitle = makeHiFiText(
      `dash-chart-title-${s}`,
      'Dashboard Chart Header',
      'REVENUE & AUTONOMOUS AGENT THROUGHPUT (LAST 12 MONTHS)',
      mainX + 18,
      chartY + 14,
      mainW - 220,
      16,
      10,
      theme.textPrimary,
      'left',
      'JetBrains Mono',
      '700'
    );
    const chartMeta = makeHiFiText(
      `dash-chart-meta-${s}`,
      'Dashboard Chart Filter Badge',
      '● LIVE STREAM  •  12M VIEW',
      mainX + mainW - 180,
      chartY + 14,
      162,
      14,
      9,
      theme.accent,
      'right',
      'JetBrains Mono',
      '700'
    );

    const monthVals = [0.32, 0.38, 0.44, 0.41, 0.52, 0.59, 0.64, 0.61, 0.74, 0.82, 0.89, 0.96];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const cPlotW = mainW - 44;
    const cGap = 12;
    const cBarW = Math.max(18, Math.floor((cPlotW - cGap * 11) / 12));
    const cMaxH = 92;
    const cBaseY = chartY + chartH - 26;

    const dashBars: CanvasObject[] = [];
    monthVals.forEach((v, idx) => {
      const bh = Math.max(12, Math.round(cMaxH * v));
      const bx = mainX + 22 + idx * (cBarW + cGap);
      dashBars.push(
        makeHiFiRect(
          `dash-bar-${s}-${idx}`,
          `Month Bar ${months[idx]}`,
          bx,
          cBaseY - bh,
          cBarW,
          bh,
          idx >= 10 ? theme.accent : theme.primary,
          {
            radius: 3,
            fillType: 'linear-gradient',
            fillGradientEnd: theme.secondary,
          }
        ),
        makeHiFiText(
          `dash-bar-lbl-${s}-${idx}`,
          `Month Label ${months[idx]}`,
          months[idx],
          bx - 2,
          cBaseY + 6,
          cBarW + 4,
          12,
          8,
          theme.textMuted,
          'center',
          'JetBrains Mono',
          '600'
        )
      );
    });

    // Row 3: Enterprise Deployment Table Card
    const tableY = chartY + chartH + 14;
    const tableH = dashH - kpiH - chartH - 28;
    const tableCard = makeHiFiRect(
      `dash-table-card-${s}`,
      'Enterprise Deployments Table Card',
      mainX,
      tableY,
      mainW,
      tableH,
      theme.surface,
      {
        fillType: 'linear-gradient',
        fillGradientEnd: theme.surfaceAlt,
        stroke: theme.border,
        strokeWidth: 1.5,
        shadow: true,
      }
    );
    const colDefs = [
      { key: 'cluster', label: 'CLUSTER / TENANT', xOff: 22, w: 170, align: 'left' as const },
      { key: 'workflow', label: 'PIPELINE WORKFLOW', xOff: 202, w: 175, align: 'left' as const },
      { key: 'status', label: 'STATUS', xOff: 386, w: 94, align: 'left' as const },
      { key: 'latency', label: 'P95 LATENCY', xOff: 488, w: 92, align: 'left' as const },
      { key: 'arr', label: 'MONTHLY ARR', xOff: mainW - 134, w: 112, align: 'right' as const },
    ];

    const tableHeaderLayers: CanvasObject[] = colDefs.map((col, cIdx) =>
      makeHiFiText(
        `dash-table-hdr-${s}-${cIdx}`,
        `Table Header: ${col.label}`,
        col.label,
        mainX + col.xOff,
        tableY + 14,
        col.w,
        14,
        9,
        theme.accent,
        col.align,
        'JetBrains Mono',
        '700',
        0.4
      )
    );

    const tableRows = [
      {
        cluster: 'Osito Sentinel North',
        workflow: 'Thermal Autonomy v4.2',
        status: '● HEALTHY',
        latency: '18.4 ms',
        arr: '$42,800 / mo',
      },
      {
        cluster: 'Apex Robotics Global',
        workflow: 'Fleet Telemetry Mesh',
        status: '● SCALING',
        latency: '31.2 ms',
        arr: '$38,400 / mo',
      },
      {
        cluster: 'Vexel Cloud Enterprise',
        workflow: 'Zero-Trust Vector CDN',
        status: '● HEALTHY',
        latency: '14.9 ms',
        arr: '$67,720 / mo',
      },
    ];
    const tableRowLayers: CanvasObject[] = [];
    tableRows.forEach((rowObj, idx) => {
      const ry = tableY + 38 + idx * 42;
      tableRowLayers.push(
        makeHiFiRect(
          `dash-table-row-${s}-${idx}`,
          `Deployment Table Row ${idx + 1}`,
          mainX + 14,
          ry,
          mainW - 28,
          34,
          idx % 2 === 0 ? '#090d16' : theme.surfaceAlt,
          { radius: 4, stroke: theme.border, strokeWidth: 1, interactiveHover: true }
        )
      );
      colDefs.forEach((col, cIdx) => {
        const val = rowObj[col.key as keyof typeof rowObj];
        const isStatus = col.key === 'status';
        const isArr = col.key === 'arr';
        tableRowLayers.push(
          makeHiFiText(
            `dash-table-row-txt-${s}-${idx}-${cIdx}`,
            `Deployment Row ${idx + 1} ${col.label}${isStatus || isArr ? ' Accent' : ''}`,
            val,
            mainX + col.xOff,
            ry + 11,
            col.w,
            14,
            9.5,
            isStatus || isArr ? theme.accent : theme.textPrimary,
            col.align,
            'JetBrains Mono',
            isStatus || isArr ? '700' : '500'
          )
        );
      });
    });

    return [
      sidebarCard,
      wsHeader,
      wsStatus,
      ...sideBtnLayers,
      quotaBox,
      quotaLbl,
      quotaTrack,
      quotaFill,
      quotaVal,
      ...kpiLayers,
      chartCard,
      chartTitle,
      chartMeta,
      ...dashBars,
      tableCard,
      ...tableHeaderLayers,
      ...tableRowLayers,
      ...navbarLayers,
    ];
  }

  // ==========================================================================
  // TEMPLATE 5: Multi-Tier Pricing Matrix & Interactive FAQ ('pricing-faq')
  // ==========================================================================
  if (templateId === 'pricing-faq') {
    const hdrY = 80;
    const hdrTitle = makeHiFiText(
      `price-hdr-title-${s}`,
      'Pricing Page Headline',
      'Transparent, Predictable Pricing for Every Team',
      pad,
      hdrY,
      Math.round(innerW * 0.64),
      26,
      21,
      theme.textPrimary,
      'left',
      'Space Grotesk',
      '700'
    );
    const hdrSub = makeHiFiText(
      `price-hdr-sub-${s}`,
      'Pricing Page Subheadline Muted',
      'Start free in seconds. Upgrade anytime with instant W3C Token & Retina export.',
      pad,
      hdrY + 26,
      Math.round(innerW * 0.64),
      16,
      11.5,
      theme.textMuted,
      'left',
      'Inter',
      '400'
    );

    const billMonthlyBtn = makeHiFiButton(
      `price-bill-mo-${s}`,
      'Billing Switch Monthly',
      'Monthly Billing',
      pad + innerW - 268,
      hdrY + 6,
      118,
      32,
      'pill-idle',
      theme
    );
    const billAnnualBtn = makeHiFiButton(
      `price-bill-yr-${s}`,
      'Billing Switch Annual Save 20%',
      'Annual (Save 20%)',
      pad + innerW - 142,
      hdrY + 6,
      142,
      32,
      'primary',
      theme
    );

    // 3 High-Fidelity Pricing Tier Cards
    const tierY = 136;
    const tierH = 286;
    const tierW = Math.floor((innerW - 32) / 3);
    const tierSpecs = [
      {
        name: 'STARTER STUDIO',
        price: '$19',
        period: '/ month • billed annually',
        desc: 'For solo designers & indie makers building vector & pixel UI.',
        features: [
          '✓ Unlimited Vector & Bitmap Layers',
          '✓ 125+ Smart UI Components',
          '✓ @1x / @2x PNG & SVG Export',
          '✓ Community Discord Support',
        ],
        cta: 'Start 14-Day Free Trial',
        popular: false,
      },
      {
        name: 'PRO TEAM STUDIO',
        price: '$49',
        period: '/ seat / mo • billed annually',
        desc: 'Full creative studio with AI generators & nested menu prototyping.',
        features: [
          '✓ Everything in Starter + AI Studio',
          '✓ Interactive Nested Menu Previews',
          '✓ React, Tailwind & @3x Retina ZIP',
          '✓ Priority 24/7 Engineering SLA',
        ],
        cta: 'Upgrade to Pro Studio ▸',
        popular: true,
      },
      {
        name: 'ENTERPRISE CLOUD',
        price: '$149',
        period: '/ seat / mo • custom SLA',
        desc: 'Dedicated security, custom JSF plugins & organization governance.',
        features: [
          '✓ Custom .JSF Plugin Registry',
          '✓ SAML SSO & SOC2 Audit Logs',
          '✓ Dedicated Solutions Architect',
          '✓ 99.99% Uptime SLA Guarantee',
        ],
        cta: 'Contact Enterprise Sales',
        popular: false,
      },
    ];

    const tierLayers: CanvasObject[] = [];
    tierSpecs.forEach((t, idx) => {
      const tx = pad + idx * (tierW + 16);
      const card = makeHiFiRect(
        `price-tier-card-${s}-${idx}`,
        `Pricing Tier Card: ${t.name}`,
        tx,
        tierY,
        tierW,
        tierH,
        t.popular ? theme.surfaceAlt : theme.surface,
        {
          fillType: 'linear-gradient',
          fillGradientEnd: t.popular ? theme.surface : theme.surfaceAlt,
          stroke: t.popular ? theme.accent : theme.border,
          strokeWidth: t.popular ? 2 : 1.5,
          shadow: true,
          interactiveHover: true,
        }
      );
      const topBar = makeHiFiRect(
        `price-tier-bar-${s}-${idx}`,
        `Pricing Tier ${idx + 1} Accent Bar`,
        tx,
        tierY,
        tierW,
        4,
        t.popular ? theme.accent : idx === 0 ? theme.primary : theme.secondary
      );

      tierLayers.push(card, topBar);

      if (t.popular) {
        tierLayers.push(
          ...makeHiFiBadge(
            `price-tier-pop-${s}`,
            'Most Popular Tier',
            '★ MOST POPULAR',
            tx + tierW - 134,
            tierY + 14,
            118,
            20,
            theme
          )
        );
      }

      tierLayers.push(
        makeHiFiText(
          `price-tier-name-${s}-${idx}`,
          `Tier ${idx + 1} Eyebrow`,
          t.name,
          tx + 20,
          tierY + 18,
          134,
          14,
          10,
          t.popular ? theme.accent : theme.textMuted,
          'left',
          'JetBrains Mono',
          '700',
          0.7
        ),
        makeHiFiText(
          `price-tier-val-${s}-${idx}`,
          `Tier ${idx + 1} Price Heading`,
          t.price,
          tx + 20,
          tierY + 38,
          90,
          34,
          30,
          theme.textPrimary,
          'left',
          'Space Grotesk',
          '700'
        ),
        makeHiFiText(
          `price-tier-per-${s}-${idx}`,
          `Tier ${idx + 1} Billing Period Muted`,
          t.period,
          tx + 102,
          tierY + 52,
          tierW - 118,
          14,
          9.5,
          theme.textMuted,
          'left',
          'JetBrains Mono',
          '500'
        ),
        makeHiFiText(
          `price-tier-desc-${s}-${idx}`,
          `Tier ${idx + 1} Summary Muted`,
          t.desc,
          tx + 20,
          tierY + 78,
          tierW - 40,
          16,
          10.5,
          theme.textMuted,
          'left',
          'Inter',
          '400'
        )
      );

      t.features.forEach((feat, fIdx) => {
        tierLayers.push(
          makeHiFiText(
            `price-tier-feat-${s}-${idx}-${fIdx}`,
            `Tier ${idx + 1} Feature ${fIdx + 1}`,
            feat,
            tx + 20,
            tierY + 110 + fIdx * 26,
            tierW - 40,
            16,
            11,
            theme.textPrimary,
            'left',
            'Inter',
            '500'
          )
        );
      });

      tierLayers.push(
        ...makeHiFiButton(
          `price-tier-cta-${s}-${idx}`,
          `Tier ${idx + 1} CTA Button`,
          t.cta,
          tx + 20,
          tierY + tierH - 52,
          tierW - 40,
          36,
          t.popular ? 'primary' : 'pill-active',
          theme
        )
      );
    });

    // Bottom 2-Column High-Fidelity Answered FAQ Section
    const faqY = 436;
    const faqH = 144;
    const faqCardW = Math.floor((innerW - 16) / 2);
    const faqs = [
      {
        q: 'Q: Are generated website layouts 100% editable vector & text layers?',
        a1: 'Yes! Every card surface, button pill, chart bar, badge, and headline is a native',
        a2: 'Bezier vector path or typography layer—zero locked wireframe autoshapes.',
      },
      {
        q: 'Q: How do I test the interactive nested dropdown menus?',
        a1: 'Switch to Preview Mode and click any top navbar button (Products, Solutions,',
        a2: 'Developers, Pricing) to expand Level-1 & Level-2 menus with live layout reflow.',
      },
    ];

    const faqLayers: CanvasObject[] = [];
    faqs.forEach((item, idx) => {
      const fx = pad + idx * (faqCardW + 16);
      const faqBadge = makeHiFiBadge(
        `price-faq-badge-${s}-${idx}`,
        `FAQ ${idx + 1} Tag`,
        `FAQ 0${idx + 1} • ARCHITECTURE & BILLING`,
        fx + 18,
        faqY + 16,
        198,
        20,
        theme
      );
      faqLayers.push(
        makeHiFiRect(
          `price-faq-card-${s}-${idx}`,
          `FAQ Item ${idx + 1} Card`,
          fx,
          faqY,
          faqCardW,
          faqH,
          theme.surface,
          {
            fillType: 'linear-gradient',
            fillGradientEnd: theme.surfaceAlt,
            stroke: theme.border,
            strokeWidth: 1.5,
            shadow: true,
            interactiveHover: true,
          }
        ),
        ...faqBadge,
        makeHiFiText(
          `price-faq-q-${s}-${idx}`,
          `FAQ ${idx + 1} Question Title`,
          item.q,
          fx + 18,
          faqY + 46,
          faqCardW - 36,
          20,
          13,
          theme.textPrimary,
          'left',
          'Space Grotesk',
          '700'
        ),
        makeHiFiText(
          `price-faq-a1-${s}-${idx}`,
          `FAQ ${idx + 1} Answer Line 1`,
          item.a1,
          fx + 18,
          faqY + 76,
          faqCardW - 36,
          16,
          11,
          theme.textMuted,
          'left',
          'Inter',
          '400'
        ),
        makeHiFiText(
          `price-faq-a2-${s}-${idx}`,
          `FAQ ${idx + 1} Answer Line 2`,
          item.a2,
          fx + 18,
          faqY + 95,
          faqCardW - 36,
          16,
          11,
          theme.textMuted,
          'left',
          'Inter',
          '400'
        )
      );
    });

    return [
      hdrTitle,
      hdrSub,
      ...billMonthlyBtn,
      ...billAnnualBtn,
      ...tierLayers,
      ...faqLayers,
      ...navbarLayers,
    ];
  }

  // ==========================================================================
  // TEMPLATE 6: Visual Information Architecture & Funnel ('sitemap-architecture')
  // ==========================================================================
  const archHdrY = 82;
  const archTitle = makeHiFiText(
    `arch-hdr-title-${s}`,
    'Sitemap Funnel Headline',
    `${brief.brandName} Information Architecture & Conversion Flow`,
    pad,
    archHdrY,
    Math.round(innerW * 0.68),
    22,
    18,
    theme.textPrimary,
    'left',
    'Space Grotesk',
    '700'
  );
  const archSub = makeHiFiText(
    `arch-hdr-sub-${s}`,
    'Sitemap Funnel Subtitle Muted',
    'High-fidelity route cards wired with magnetic orthogonal connectors — drag any card to auto-reroute.',
    pad,
    archHdrY + 23,
    Math.round(innerW * 0.72),
    16,
    11,
    theme.textMuted,
    'left',
    'Inter',
    '400'
  );
  const archBadge = makeHiFiBadge(
    `arch-hdr-badge-${s}`,
    'Architecture Blueprint',
    '● LIVE MAGNETIC FLOW',
    pad + innerW - 168,
    archHdrY + 6,
    168,
    24,
    theme
  );

  // Helper to build a High-Fidelity Sitemap Route Card (returns [cardSurface, ...childLabels])
  const buildRouteCard = (
    id: string,
    route: string,
    title: string,
    metric: string,
    x: number,
    y: number,
    w: number,
    h: number,
    accentHex: string
  ): { card: VectorPathObject; children: CanvasObject[] } => {
    const card = makeHiFiRect(id, `Route Card: ${title} (${route})`, x, y, w, h, theme.surface, {
      fillType: 'linear-gradient',
      fillGradientEnd: theme.surfaceAlt,
      stroke: accentHex,
      strokeWidth: 1.5,
      shadow: true,
      interactiveHover: true,
    });
    const topStrip = makeHiFiRect(
      `${id}-bar`,
      `${title} Accent Bar`,
      x,
      y,
      w,
      3,
      accentHex
    );
    const routeTxt = makeHiFiText(
      `${id}-route`,
      `${title} Route Badge`,
      route,
      x + 12,
      y + 11,
      w - 24,
      12,
      9,
      theme.accent,
      'left',
      'JetBrains Mono',
      '700'
    );
    const titleTxt = makeHiFiText(
      `${id}-title`,
      `${title} Heading`,
      title,
      x + 12,
      y + 28,
      w - 24,
      18,
      13,
      theme.textPrimary,
      'left',
      'Space Grotesk',
      '700'
    );
    const metricTxt = makeHiFiText(
      `${id}-metric`,
      `${title} Telemetry Muted`,
      metric,
      x + 12,
      y + 50,
      w - 24,
      14,
      9.5,
      theme.textMuted,
      'left',
      'JetBrains Mono',
      '500'
    );
    return { card, children: [topStrip, routeTxt, titleTxt, metricTxt] };
  };

  // Root Landing Page Card
  const rootW = 228;
  const rootH = 74;
  const rootBuilt = buildRouteCard(
    `sm-root-${s}`,
    'GET /home  •  200 OK',
    `${brief.brandName} Global Home`,
    'SSR Edge • 142k visits/mo • CR 68%',
    Math.round(canvasWidth / 2 - rootW / 2),
    132,
    rootW,
    rootH,
    theme.primary
  );

  // Level 2 Route Cards
  const l2W = Math.floor((innerW - 48) / 4);
  const l2Y = 264;
  const l2H = 76;
  const l2Specs = [
    { id: `sm-prod-${s}`, route: '/products', title: 'Product Suite', metric: 'CTR: 44.2% • Interactive', accent: theme.primary },
    { id: `sm-sol-${s}`, route: '/solutions', title: 'Enterprise Use Cases', metric: 'CTR: 31.8% • Case Studies', accent: theme.secondary },
    { id: `sm-price-${s}`, route: '/pricing', title: 'Pricing & ROI Matrix', metric: 'CTR: 52.4% • Calculator', accent: theme.accent },
    { id: `sm-auth-${s}`, route: '/auth/sso', title: 'Zero-Trust SSO Portal', metric: 'SAML 2.0 • OAuth2 Passkey', accent: theme.primary },
  ];
  const l2Built = l2Specs.map((sp, idx) =>
    buildRouteCard(
      sp.id,
      sp.route,
      sp.title,
      sp.metric,
      pad + idx * (l2W + 16),
      l2Y,
      l2W,
      l2H,
      sp.accent
    )
  );

  // Level 3 Conversion Destination Cards
  const l3Y = 408;
  const l3H = 78;
  const l3Specs = [
    { id: `sm-studio-${s}`, route: '/app/studio', title: 'Hybrid Vector Workspace', metric: '120 FPS WebGL • Live Sync', accent: theme.accent },
    { id: `sm-docs-${s}`, route: '/developers/sdk', title: 'API & .JSF Plugin Docs', metric: 'OpenAPI 3.1 • TypeScript', accent: theme.secondary },
    { id: `sm-chk-${s}`, route: '/checkout/stripe', title: 'Express Stripe Checkout', metric: 'Apple Pay • 94.6% Auth', accent: theme.primary },
    { id: `sm-dash-${s}`, route: '/app/telemetry', title: 'Executive Admin Console', metric: 'SOC2 Audit • Spend Cap', accent: theme.accent },
  ];
  const l3Built = l3Specs.map((sp, idx) =>
    buildRouteCard(
      sp.id,
      sp.route,
      sp.title,
      sp.metric,
      pad + idx * (l2W + 16),
      l3Y,
      l2W,
      l3H,
      sp.accent
    )
  );

  // Bottom Summary Status Strip
  const footerStrip = makeHiFiRect(
    `sm-footer-strip-${s}`,
    'Architecture Telemetry Footer Card',
    pad,
    514,
    innerW,
    64,
    theme.surface,
    { stroke: theme.border, strokeWidth: 1.5 }
  );
  const footerTxt1 = makeHiFiText(
    `sm-footer-txt1-${s}`,
    'Architecture Summary Title',
    'END-TO-END CONVERSION FUNNEL TELEMETRY   •   9 ACTIVE ROUTES   •   8 ORTHOGONAL CONNECTORS',
    pad + 18,
    528,
    innerW - 36,
    14,
    9.5,
    theme.accent,
    'left',
    'JetBrains Mono',
    '700'
  );
  const footerTxt2 = makeHiFiText(
    `sm-footer-txt2-${s}`,
    'Architecture Summary Subcopy Muted',
    'Tip: Use the Pointer Tool (V) to drag any route card — magnetic orthogonal connectors automatically recalculate their paths.',
    pad + 18,
    548,
    innerW - 36,
    16,
    11,
    theme.textMuted,
    'left',
    'Inter',
    '400'
  );

  const connectors: VectorPathObject[] = [];
  l2Built.forEach((child, idx) => {
    const conn = createSmartConnectorObject(rootBuilt.card, 's', child.card, 'n', {
      stroke: theme.accent,
      routing: 'elbow',
      label: idx === 3 ? 'SSO' : `Flow ${idx + 1}`,
    });
    conn.id = `sm-conn-l2-${s}-${idx}`;
    connectors.push(conn);
  });
  l3Built.forEach((child, idx) => {
    const conn = createSmartConnectorObject(l2Built[idx].card, 's', child.card, 'n', {
      stroke: theme.primary,
      routing: 'elbow',
      label: 'Convert',
    });
    conn.id = `sm-conn-l3-${s}-${idx}`;
    connectors.push(conn);
  });

  return [
    archTitle,
    archSub,
    ...archBadge,
    ...connectors,
    rootBuilt.card,
    ...rootBuilt.children,
    ...l2Built.flatMap((b) => [b.card, ...b.children]),
    ...l3Built.flatMap((b) => [b.card, ...b.children]),
    footerStrip,
    footerTxt1,
    footerTxt2,
    ...navbarLayers,
  ];
}

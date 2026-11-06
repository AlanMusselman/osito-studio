import {
  AutoShapeObject,
  BezierNode,
  BitmapObject,
  CanvasObject,
  TextObject,
  VectorPathObject,
} from '../types/editor';
import { createSmartConnectorObject } from './connectorEngine';

/**
 * Generates a high-detail, multi-region full-color raster PNG data URL for the
 * Flagship Bitmap & Pixel Retouching Lab Card on startup.
 * Designed so users can immediately test:
 * - Rectangular / Oval Marquee (M) + Ctrl+X / Ctrl+V Cut & Paste (with tight contour nodes)
 * - Magic Wand (W) contiguous / global color tolerance selection
 * - 1-Click Smart Background Removal & Bezier Vectorization
 * - 1px Pixel Pencil (Y), Soft Brush (B), Flood Bucket (G) & Eyedropper (I)
 */
export function generateStarterBitmapDataUrl(width = 350, height = 176): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.imageSmoothingEnabled = false;

  // 1. Deep night sky backdrop (flat color zone for easy 1-click Magic Wand / BG removal testing)
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, width, height);

  // 2. Top 6-Swatch Calibration Bar (distinct flat color zones ideal for Magic Wand & Eyedropper)
  const palette = ['#06b6d4', '#38bdf8', '#6366f1', '#ec4899', '#f59e0b', '#10b981'];
  const barWidth = Math.floor(width / palette.length);
  palette.forEach((col, idx) => {
    ctx.fillStyle = col;
    ctx.fillRect(idx * barWidth, 0, idx === palette.length - 1 ? width - idx * barWidth : barWidth, 20);
  });

  // 3. Inner Horizon Stage
  ctx.fillStyle = '#111827';
  ctx.fillRect(10, 28, width - 20, 112);

  // Stepped Synthwave Solar Disc (concentric flat-color rings for Magic Wand tolerance testing)
  const sunRings = [
    { r: 36, color: '#f43f5e' },
    { r: 28, color: '#fb7185' },
    { r: 20, color: '#f59e0b' },
    { r: 12, color: '#fde047' },
  ];
  sunRings.forEach((ring) => {
    ctx.fillStyle = ring.color;
    ctx.beginPath();
    ctx.arc(92, 84, ring.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Layered Pixel Mountain Peaks
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath();
  ctx.moveTo(10, 140);
  ctx.lineTo(54, 88);
  ctx.lineTo(98, 118);
  ctx.lineTo(154, 70);
  ctx.lineTo(212, 114);
  ctx.lineTo(256, 86);
  ctx.lineTo(width - 10, 140);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(10, 140);
  ctx.lineTo(76, 104);
  ctx.lineTo(126, 128);
  ctx.lineTo(184, 92);
  ctx.lineTo(238, 126);
  ctx.lineTo(width - 10, 140);
  ctx.closePath();
  ctx.fill();

  // Crisp 8x8 Pixel-Art Autonomous Drone / Emblem Sprite on the right (scaled 5x = 40x40)
  const sprite = [
    '11....11',
    '.122221.',
    '..2332..',
    '.234432.',
    '.234432.',
    '..2332..',
    '.122221.',
    '11....11',
  ];
  const spriteColors: Record<string, string> = {
    '1': '#38bdf8',
    '2': '#6366f1',
    '3': '#f8fafc',
    '4': '#f59e0b',
  };
  const scale = 6;
  const startX = width - 78;
  const startY = 46;
  sprite.forEach((row, ry) => {
    row.split('').forEach((cell, rx) => {
      if (spriteColors[cell]) {
        ctx.fillStyle = spriteColors[cell];
        ctx.fillRect(startX + rx * scale, startY + ry * scale, scale, scale);
      }
    });
  });

  // 4. Bottom HUD Telemetry Strip inside Bitmap
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(10, 144, width - 20, 24);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
  ctx.fillText('MARQUEE (M): CTRL+X CUT / CTRL+V PASTE • WAND (W)', 18, 159);

  return canvas.toDataURL('image/png');
}

function buildRectBezierNodes(w: number, h: number, radius = 0): BezierNode[] {
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

function makeVectorCard(
  id: string,
  name: string,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  opts: {
    radius?: number;
    gradEnd?: string;
    stroke?: string;
    strokeWidth?: number;
    shadow?: boolean;
    hoverFill?: string;
    hoverStroke?: string;
    params?: Record<string, number | boolean | string>;
  } = {}
): VectorPathObject {
  const fillType = opts.gradEnd ? 'linear-gradient' : 'solid';
  const gradEnd = opts.gradEnd || fill;
  const stroke = opts.stroke || 'none';
  const strokeWidth = opts.strokeWidth ?? (stroke === 'none' ? 0 : 1.5);
  return {
    id,
    name,
    type: 'vector-path',
    visible: true,
    locked: false,
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(w),
    height: Math.round(h),
    rotation: 0,
    opacity: 1,
    blendMode: 'source-over',
    fill,
    fillType,
    fillGradientEnd: gradEnd,
    stroke,
    strokeWidth,
    strokeAlign: 'inside',
    pixelSnap: true,
    shadow: opts.shadow
      ? { enabled: true, color: 'rgba(0, 0, 0, 0.52)', blur: 18, offsetX: 0, offsetY: 6 }
      : { enabled: false, color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
    closed: true,
    nodes: buildRectBezierNodes(w, h, opts.radius ?? 0),
    ...(opts.params ? { params: opts.params } : {}),
    stateVariants: {
      default: {
        fill,
        fillGradientEnd: gradEnd,
        stroke,
        strokeWidth,
        opacity: 1,
      },
      hover: {
        fill: opts.hoverFill || '#1e293b',
        fillGradientEnd: gradEnd,
        stroke: opts.hoverStroke || '#ffffff',
        strokeWidth: Math.max(1.5, strokeWidth),
        opacity: 1,
        offsetY: -1,
        scale: 1.008,
      },
      active: {
        fill,
        fillGradientEnd: gradEnd,
        stroke: '#38bdf8',
        strokeWidth: Math.max(2, strokeWidth),
        opacity: 0.96,
        offsetY: 1,
        scale: 0.995,
      },
    },
  };
}

function makePolygonPath(
  id: string,
  name: string,
  x: number,
  y: number,
  points: Array<{ x: number; y: number }>,
  fill: string,
  gradEnd: string,
  stroke = '#ffffff',
  strokeWidth = 1.5
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
    fillType: fill === 'none' ? 'none' : 'linear-gradient',
    fillGradientEnd: gradEnd,
    stroke,
    strokeWidth,
    strokeAlign: 'center',
    pixelSnap: true,
    shadow: { enabled: true, color: 'rgba(6, 182, 212, 0.32)', blur: 10, offsetX: 0, offsetY: 3 },
    closed: true,
    nodes: points.map((pt, i) => ({
      id: `p-${i}`,
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

function makeLabel(
  id: string,
  name: string,
  text: string,
  x: number,
  y: number,
  w: number,
  h: number,
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
    width: Math.max(12, Math.round(w)),
    height: Math.max(12, Math.round(h)),
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

function makePillButton(
  idPrefix: string,
  namePrefix: string,
  label: string,
  x: number,
  y: number,
  w: number,
  h: number,
  variant: 'primary' | 'secondary' | 'active-tab' | 'idle-tab'
): CanvasObject[] {
  const isPrimary = variant === 'primary';
  const isActive = variant === 'active-tab';
  const isNavTab = variant === 'active-tab' || variant === 'idle-tab';
  const fill = isPrimary ? '#06b6d4' : isActive ? '#1e293b' : '#151e2e';
  const gradEnd = isPrimary ? '#6366f1' : isActive ? '#334155' : '#1e293b';
  const stroke = isPrimary ? '#ffffff' : isActive ? '#38bdf8' : '#334155';
  const radius = isNavTab ? 8 : Math.round(h / 2);

  const bg = makeVectorCard(
    `${idPrefix}-bg`,
    `${namePrefix} (${isPrimary ? 'Primary CTA' : 'Nav Btn'})`,
    x,
    y,
    w,
    h,
    fill,
    {
      radius,
      gradEnd,
      stroke,
      strokeWidth: isPrimary || isActive ? 1.5 : 1,
      shadow: isPrimary,
      hoverFill: isPrimary ? '#38bdf8' : '#334155',
      hoverStroke: '#ffffff',
    }
  );

  const fontSize = h <= 28 ? 10 : h <= 34 ? 10.5 : 11.5;
  const txt = makeLabel(
    `${idPrefix}-txt`,
    `${namePrefix} Label (${isPrimary ? 'Primary Btn' : 'Btn'})`,
    label,
    x + 6,
    Math.round(y + (h - fontSize) / 2 - 1),
    w - 12,
    fontSize + 4,
    fontSize,
    '#ffffff',
    'center',
    'Inter',
    isPrimary || isActive ? '700' : '600',
    0.2
  );
  return [bg, txt];
}

/**
 * Creates the Flagship High-Fidelity "WOW" Showcase Layout on startup,
 * bringing together every core capability of Osito (Pixel + Vector Editor) in one unified canvas:
 * 1. Interactive Top Navbar with Level-1 & Level-2 Nested Flyout Menus in Preview Mode
 * 2. High-Fidelity Hero Section with Multi-Layer Vector Logo Crest & Interactive CTA Buttons
 * 3. Live Bitmap & Pixel Retouching Lab (`obj-bitmap-hero`) for Marquee Ctrl+X/Ctrl+V & Magic Wand
 * 4. Cubic Bezier Vector Path (`obj-vector-bezier-wave`) + Document Color Token Swatch Bar
 * 5. Programmable JS AutoShapes Lab (`obj-autoshape-star`, Toggle Switch & Telemetry Bar) with ◆ Handles
 * 6. Connected Architecture Route Cards wired with Live Magnetic Orthogonal Connectors (`connectorMeta`)
 */
export function createStarterSceneObjects(): CanvasObject[] {
  const pad = 20;
  const canvasW = 960;
  const innerW = canvasW - pad * 2; // 920

  // ==========================================================================
  // 1. TOP HIGH-FIDELITY INTERACTIVE NAVBAR (y = 14, h = 52)
  // ==========================================================================
  const navX = pad;
  const navY = 14;
  const navW = innerW;
  const navH = 52;

  const navSurface = makeVectorCard(
    'web-navbar-surface-starter',
    'Top Navigation Bar (Interactive Nested Navbar)',
    navX,
    navY,
    navW,
    navH,
    '#0f172a',
    {
      gradEnd: '#1e293b',
      stroke: '#38bdf8',
      strokeWidth: 1.5,
      shadow: true,
      params: {
        hasNestedMenu: true,
        activeTab: 1,
        activeLink: 1,
        openMenuIndex: 0,
        openSubMenuIndex: 1,
      },
    }
  );

  const navLogoOuter = makeVectorCard(
    'starter-nav-logo-bg',
    'Navbar Brand Emblem Badge',
    navX + 14,
    navY + 12,
    28,
    28,
    '#06b6d4',
    {
      radius: 7,
      gradEnd: '#6366f1',
      stroke: '#ffffff',
      strokeWidth: 1.25,
    }
  );
  const navLogoCore = makePolygonPath(
    'starter-nav-logo-core',
    'Navbar Brand Core Diamond',
    navX + 21,
    navY + 19,
    [
      { x: 7, y: 0 },
      { x: 14, y: 7 },
      { x: 7, y: 14 },
      { x: 0, y: 7 },
    ],
    '#38bdf8',
    '#f59e0b',
    '#ffffff',
    1.25
  );
  const navBrandTitle = makeLabel(
    'starter-nav-brand-txt',
    'Navbar Brand Wordmark',
    'OSITO STUDIO 4.0',
    navX + 50,
    navY + 19,
    142,
    16,
    12,
    '#ffffff',
    'left',
    'Space Grotesk',
    '700',
    0.8
  );

  const navStartX = navX + Math.round(navW * 0.22);
  const navSpanW = Math.round(navW * 0.54);
  const navItemW = Math.floor(navSpanW / 4);
  const navBtnH = 30;
  const navBtnY = navY + Math.round((navH - navBtnH) / 2);
  const navMenuLabels = ['Products ▾', 'Solutions ▾', 'Developers ▾', 'Pricing ▾'];
  const navButtons: CanvasObject[] = [];
  navMenuLabels.forEach((lbl, idx) => {
    const bx = navStartX + idx * navItemW + 4;
    const bw = navItemW - 8;
    navButtons.push(
      ...makePillButton(
        `starter-nav-btn-${idx}`,
        `Navbar Menu: ${lbl}`,
        lbl,
        bx,
        navBtnY,
        bw,
        navBtnH,
        idx === 0 ? 'active-tab' : 'idle-tab'
      )
    );
  });

  const navCta = makePillButton(
    'starter-nav-cta',
    'Navbar Primary CTA',
    'Get Started ▸',
    navX + navW - 122,
    navBtnY,
    108,
    navBtnH,
    'primary'
  );

  const navbarLayers: CanvasObject[] = [
    navSurface,
    navLogoOuter,
    navLogoCore,
    navBrandTitle,
    ...navButtons,
    ...navCta,
  ];

  // ==========================================================================
  // 2. ROW 1 LEFT: FLAGSHIP HERO & MULTI-LAYER LOGO SHOWCASE (x = 20, y = 78, w = 532, h = 252)
  // ==========================================================================
  const heroX = pad;
  const heroY = 78;
  const heroW = 532;
  const heroH = 252;

  const heroCard = makeVectorCard(
    'starter-hero-card',
    'Hero Flagship Showcase Card',
    heroX,
    heroY,
    heroW,
    heroH,
    '#0f172a',
    {
      gradEnd: '#1e293b',
      stroke: '#334155',
      strokeWidth: 1.5,
      shadow: true,
    }
  );
  const heroTopAccent = makeVectorCard(
    'starter-hero-accent-bar',
    'Hero Top Gradient Accent Bar',
    heroX,
    heroY,
    heroW,
    3,
    '#06b6d4',
    { gradEnd: '#6366f1' }
  );

  const heroBadgeBg = makeVectorCard(
    'starter-hero-badge-bg',
    'Hero Release Badge Pill',
    heroX + 20,
    heroY + 18,
    256,
    22,
    '#1e293b',
    { radius: 11, stroke: '#38bdf8', strokeWidth: 1 }
  );
  const heroBadgeTxt = makeLabel(
    'starter-hero-badge-txt',
    'Hero Release Badge Label',
    '✦ HYBRID VECTOR + PIXEL + AI STUDIO',
    heroX + 28,
    heroY + 24,
    240,
    12,
    8.5,
    '#38bdf8',
    'center',
    'JetBrains Mono',
    '700',
    0.7
  );

  const heroH1a = makeLabel(
    'starter-hero-h1a',
    'Hero Headline Line 1',
    'Precision Vector, 1px Pixel',
    heroX + 20,
    heroY + 50,
    346,
    30,
    24,
    '#f8fafc',
    'left',
    'Space Grotesk',
    '700',
    -0.3
  );
  const heroH1b = makeLabel(
    'starter-hero-h1b',
    'Hero Headline Line 2 Accent',
    '& Interactive Web Engine.',
    heroX + 20,
    heroY + 79,
    346,
    30,
    24,
    '#38bdf8',
    'left',
    'Space Grotesk',
    '700',
    -0.3
  );

  const heroSub1 = makeLabel(
    'starter-hero-sub1',
    'Hero Subcopy Line 1',
    'Edit cubic Bezier nodes (A), cut/paste marquee bitmaps (M), generate',
    heroX + 20,
    heroY + 116,
    350,
    16,
    11,
    '#94a3b8',
    'left',
    'Inter',
    '400'
  );
  const heroSub2 = makeLabel(
    'starter-hero-sub2',
    'Hero Subcopy Line 2',
    '6-variation vector logos, and test live nested menus in Preview Mode.',
    heroX + 20,
    heroY + 133,
    350,
    16,
    11,
    '#94a3b8',
    'left',
    'Inter',
    '400'
  );

  const heroCta1 = makePillButton(
    'starter-hero-cta1',
    'Hero Primary CTA',
    'Explore Studio ▸',
    heroX + 20,
    heroY + 162,
    144,
    36,
    'primary'
  );
  const heroCta2 = makePillButton(
    'starter-hero-cta2',
    'Hero Logo Studio Button',
    '✦ 6-Logo Variations',
    heroX + 174,
    heroY + 162,
    148,
    36,
    'active-tab'
  );

  // Embedded Multi-Layer Vector Logo Crest Showcase Box inside Top-Right of Hero Card
  const crestBoxX = heroX + 378;
  const crestBoxY = heroY + 18;
  const crestBoxW = 136;
  const crestBoxH = 180;
  const crestStage = makeVectorCard(
    'starter-logo-showcase-card',
    'Vector Logo Crest Showcase Stage',
    crestBoxX,
    crestBoxY,
    crestBoxW,
    crestBoxH,
    '#090d16',
    { radius: 8, stroke: '#334155', strokeWidth: 1 }
  );
  const crestOuterShield = makePolygonPath(
    'starter-logo-crest-outer',
    'Vector Crest Outer Hexagon',
    crestBoxX + 34,
    crestBoxY + 18,
    [
      { x: 34, y: 0 },
      { x: 68, y: 17 },
      { x: 68, y: 51 },
      { x: 34, y: 68 },
      { x: 0, y: 51 },
      { x: 0, y: 17 },
    ],
    '#06b6d4',
    '#6366f1',
    '#ffffff',
    1.75
  );
  const crestInnerStar = makePolygonPath(
    'starter-logo-crest-inner',
    'Vector Crest Inner Prism',
    crestBoxX + 48,
    crestBoxY + 32,
    [
      { x: 20, y: 0 },
      { x: 40, y: 20 },
      { x: 20, y: 40 },
      { x: 0, y: 20 },
    ],
    '#f59e0b',
    '#ec4899',
    '#ffffff',
    1.5
  );
  const crestTitle = makeLabel(
    'starter-logo-crest-title',
    'Vector Crest Brand Title',
    'OSITO SENTINEL',
    crestBoxX + 8,
    crestBoxY + 100,
    crestBoxW - 16,
    16,
    10.5,
    '#ffffff',
    'center',
    'Space Grotesk',
    '700',
    0.8
  );
  const crestSub = makeLabel(
    'starter-logo-crest-sub',
    'Vector Crest Tagline',
    'MULTI-LAYER VECTOR',
    crestBoxX + 8,
    crestBoxY + 118,
    crestBoxW - 16,
    12,
    8,
    '#38bdf8',
    'center',
    'JetBrains Mono',
    '700',
    0.6
  );
  const crestBadge = makeLabel(
    'starter-logo-crest-meta',
    'Vector Crest Meta',
    '✓ 100% Bezier Paths',
    crestBoxX + 8,
    crestBoxY + 148,
    crestBoxW - 16,
    14,
    8.5,
    '#10b981',
    'center',
    'JetBrains Mono',
    '600'
  );

  const heroFooterStrip = makeVectorCard(
    'starter-hero-footer-strip',
    'Hero Capabilities Telemetry Strip',
    heroX + 20,
    heroY + 210,
    heroW - 40,
    28,
    '#090d16',
    { radius: 6, stroke: '#1e293b', strokeWidth: 1 }
  );
  const heroFooterTxt = makeLabel(
    'starter-hero-footer-txt',
    'Hero Capabilities Summary',
    '● 125+ JS AutoShapes • ● WCAG Document Tokens • ● @1x/@2x/@3x Retina .ZIP • ● 120 FPS',
    heroX + 24,
    heroY + 219,
    heroW - 48,
    14,
    9,
    '#38bdf8',
    'center',
    'JetBrains Mono',
    '600'
  );

  // ==========================================================================
  // 3. ROW 1 RIGHT: BITMAP & PIXEL RETOUCHING LAB (x = 566, y = 78, w = 374, h = 252)
  // ==========================================================================
  const bmpCardX = 566;
  const bmpCardY = 78;
  const bmpCardW = 374;
  const bmpCardH = 252;

  const bmpLabCard = makeVectorCard(
    'starter-bitmap-lab-card',
    'Bitmap & Pixel Retouching Lab Card',
    bmpCardX,
    bmpCardY,
    bmpCardW,
    bmpCardH,
    '#0f172a',
    {
      gradEnd: '#1e293b',
      stroke: '#38bdf8',
      strokeWidth: 1.5,
      shadow: true,
    }
  );
  const bmpLabAccent = makeVectorCard(
    'starter-bitmap-lab-bar',
    'Bitmap Lab Top Accent Bar',
    bmpCardX,
    bmpCardY,
    bmpCardW,
    3,
    '#f59e0b',
    { gradEnd: '#ec4899' }
  );
  const bmpLabTitle = makeLabel(
    'starter-bitmap-lab-title',
    'Bitmap Lab Header Title',
    'PIXEL RETOUCHING & ALPHA CUTOUT LAB',
    bmpCardX + 14,
    bmpCardY + 14,
    210,
    14,
    9.5,
    '#f8fafc',
    'left',
    'JetBrains Mono',
    '700',
    0.5
  );
  const bmpLabHint = makeLabel(
    'starter-bitmap-lab-hint',
    'Bitmap Lab Tool Shortcut Badge',
    'TRY MARQUEE (M) + CTRL+X',
    bmpCardX + bmpCardW - 148,
    bmpCardY + 14,
    134,
    14,
    8.5,
    '#fbbf24',
    'right',
    'JetBrains Mono',
    '700'
  );

  const bitmapUrl = generateStarterBitmapDataUrl(346, 176);
  const bitmapHeroObj: BitmapObject = {
    id: 'obj-bitmap-hero',
    name: 'Raster Pixel Canvas (Bitmap)',
    type: 'bitmap',
    visible: true,
    locked: false,
    x: bmpCardX + 14,
    y: bmpCardY + 36,
    width: 346,
    height: 176,
    pixelWidth: 346,
    pixelHeight: 176,
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
    shadow: {
      enabled: false,
      color: 'rgba(0,0,0,0.4)',
      blur: 8,
      offsetX: 0,
      offsetY: 4,
    },
    imageDataUrl: bitmapUrl,
    filters: {
      brightness: 0,
      contrast: 0,
      blur: 0,
      hueRotate: 0,
      invert: false,
      pixelate: 1,
    },
  };

  const bmpFooterTxt = makeLabel(
    'starter-bitmap-lab-footer',
    'Bitmap Lab Action Instructions',
    '✓ Tight Contour Nodes on Cut   •   ✓ 1-Click BG Remove   •   ✓ Vectorize to Bezier',
    bmpCardX + 14,
    bmpCardY + 222,
    bmpCardW - 28,
    14,
    9,
    '#94a3b8',
    'left',
    'JetBrains Mono',
    '500'
  );

  // ==========================================================================
  // 4. ROW 2 LEFT: CUBIC BEZIER VECTOR & DOCUMENT TOKENS (x = 20, y = 344, w = 294, h = 242)
  // ==========================================================================
  const row2Y = 344;
  const row2H = 242;
  const col1X = pad;
  const col1W = 294;

  const col1Card = makeVectorCard(
    'starter-bento-bezier-card',
    'Cubic Bezier & Document Tokens Card',
    col1X,
    row2Y,
    col1W,
    row2H,
    '#0f172a',
    {
      gradEnd: '#1e293b',
      stroke: '#334155',
      strokeWidth: 1.5,
      shadow: true,
    }
  );
  const col1Bar = makeVectorCard(
    'starter-bento-bezier-bar',
    'Bezier Card Accent Bar',
    col1X,
    row2Y,
    col1W,
    3,
    '#06b6d4'
  );
  const col1Tag = makeLabel(
    'starter-bento-bezier-tag',
    'Bezier Card Eyebrow',
    '01 / CUBIC BEZIER & DOCUMENT TOKENS',
    col1X + 16,
    row2Y + 14,
    col1W - 32,
    14,
    9,
    '#38bdf8',
    'left',
    'JetBrains Mono',
    '700'
  );
  const col1Title = makeLabel(
    'starter-bento-bezier-title',
    'Bezier Card Title',
    'Subselection (A) & Live Colors',
    col1X + 16,
    row2Y + 32,
    col1W - 32,
    20,
    15,
    '#f8fafc',
    'left',
    'Space Grotesk',
    '700'
  );
  const col1Sub = makeLabel(
    'starter-bento-bezier-sub',
    'Bezier Card Subtitle',
    'Select wave with Subselect (A) to drag tangent handles.',
    col1X + 16,
    row2Y + 54,
    col1W - 32,
    14,
    10.5,
    '#94a3b8',
    'left',
    'Inter',
    '400'
  );

  // Editable Cubic Bezier Vector Wave (`obj-vector-bezier-wave`)
  const bezierWaveObj: VectorPathObject = {
    id: 'obj-vector-bezier-wave',
    name: 'Bezier Vector Wave (Try Subselect Tool A)',
    type: 'vector-path',
    visible: true,
    locked: false,
    x: col1X + 16,
    y: row2Y + 78,
    width: col1W - 32,
    height: 88,
    rotation: 0,
    opacity: 0.96,
    blendMode: 'source-over',
    fill: '#06b6d4',
    fillType: 'linear-gradient',
    fillGradientEnd: '#6366f1',
    stroke: '#38bdf8',
    strokeWidth: 2,
    strokeAlign: 'center',
    pixelSnap: true,
    shadow: {
      enabled: true,
      color: 'rgba(6, 182, 212, 0.28)',
      blur: 12,
      offsetX: 0,
      offsetY: 4,
    },
    closed: true,
    nodes: [
      {
        id: 'n-1',
        x: 0,
        y: 28,
        cp1x: 0,
        cp1y: 28,
        cp2x: 52,
        cp2y: -10,
        pointType: 'smooth',
      },
      {
        id: 'n-2',
        x: 131,
        y: 32,
        cp1x: 84,
        cp1y: 68,
        cp2x: 178,
        cp2y: -6,
        pointType: 'smooth',
      },
      {
        id: 'n-3',
        x: 262,
        y: 20,
        cp1x: 218,
        cp1y: 58,
        cp2x: 262,
        cp2y: 20,
        pointType: 'corner',
      },
      {
        id: 'n-4',
        x: 262,
        y: 88,
        cp1x: 262,
        cp1y: 88,
        cp2x: 262,
        cp2y: 88,
        pointType: 'corner',
      },
      {
        id: 'n-5',
        x: 0,
        y: 88,
        cp1x: 0,
        cp1y: 88,
        cp2x: 0,
        cp2y: 88,
        pointType: 'corner',
      },
    ],
  };

  // 5 Document Color Token Swatches along the bottom of Card 1
  const docSwatches = [
    { hex: '#06b6d4', lbl: 'PRI' },
    { hex: '#6366f1', lbl: 'SEC' },
    { hex: '#38bdf8', lbl: 'ACC' },
    { hex: '#f59e0b', lbl: 'WAR' },
    { hex: '#10b981', lbl: 'OK' },
  ];
  const swW = 46;
  const swLayers: CanvasObject[] = [];
  docSwatches.forEach((sw, idx) => {
    const sx = col1X + 16 + idx * (swW + 8);
    swLayers.push(
      makeVectorCard(
        `starter-doc-swatch-${idx}`,
        `Document Token Swatch ${sw.lbl} (${sw.hex})`,
        sx,
        row2Y + 180,
        swW,
        30,
        sw.hex,
        { radius: 6, stroke: '#ffffff', strokeWidth: 1 }
      ),
      makeLabel(
        `starter-doc-swatch-lbl-${idx}`,
        `Document Token Label ${sw.lbl}`,
        sw.lbl,
        sx,
        row2Y + 216,
        swW,
        12,
        8.5,
        '#94a3b8',
        'center',
        'JetBrains Mono',
        '700'
      )
    );
  });

  // ==========================================================================
  // 5. ROW 2 CENTER: PROGRAMMABLE JS AUTOSHAPES & WIDGETS (x = 328, y = 344, w = 294, h = 242)
  // ==========================================================================
  const col2X = 328;
  const col2W = 294;

  const col2Card = makeVectorCard(
    'starter-bento-autoshape-card',
    'Programmable JS AutoShapes Lab Card',
    col2X,
    row2Y,
    col2W,
    row2H,
    '#0f172a',
    {
      gradEnd: '#1e293b',
      stroke: '#334155',
      strokeWidth: 1.5,
      shadow: true,
    }
  );
  const col2Bar = makeVectorCard(
    'starter-bento-autoshape-bar',
    'AutoShape Card Accent Bar',
    col2X,
    row2Y,
    col2W,
    3,
    '#f59e0b'
  );
  const col2Tag = makeLabel(
    'starter-bento-autoshape-tag',
    'AutoShape Card Eyebrow',
    '02 / SMART JS AUTOSHAPES & WIDGETS',
    col2X + 16,
    row2Y + 14,
    col2W - 32,
    14,
    9,
    '#fbbf24',
    'left',
    'JetBrains Mono',
    '700'
  );
  const col2Title = makeLabel(
    'starter-bento-autoshape-title',
    'AutoShape Card Title',
    'Diamond Handles (◆) & Preview',
    col2X + 16,
    row2Y + 32,
    col2W - 32,
    20,
    15,
    '#f8fafc',
    'left',
    'Space Grotesk',
    '700'
  );
  const col2Sub = makeLabel(
    'starter-bento-autoshape-sub',
    'AutoShape Card Subtitle',
    'Drag yellow ◆ points or click widgets in Preview Mode.',
    col2X + 16,
    row2Y + 54,
    col2W - 32,
    14,
    10.5,
    '#94a3b8',
    'left',
    'Inter',
    '400'
  );

  // Smart Star AutoShape (`obj-autoshape-star`)
  const starAutoShapeObj: AutoShapeObject = {
    id: 'obj-autoshape-star',
    name: 'Smart Star Badge (Drag ◆ Handles)',
    type: 'autoshape',
    shapeDefId: 'star',
    visible: true,
    locked: false,
    x: col2X + 20,
    y: row2Y + 82,
    width: 108,
    height: 108,
    rotation: 0,
    opacity: 1,
    blendMode: 'source-over',
    fill: '#f59e0b',
    fillType: 'linear-gradient',
    fillGradientEnd: '#ef4444',
    stroke: '#fde68a',
    strokeWidth: 2,
    strokeAlign: 'center',
    pixelSnap: true,
    shadow: {
      enabled: true,
      color: 'rgba(245, 158, 11, 0.35)',
      blur: 12,
      offsetX: 0,
      offsetY: 4,
    },
    params: {
      points: 8,
      innerRadiusRatio: 0.52,
      twistAngle: 0,
    },
  };

  // Interactive Toggle Switch AutoShape (Click in Preview Mode!)
  const toggleWidgetObj: AutoShapeObject = {
    id: 'obj-autoshape-toggle',
    name: 'Interactive Toggle Switch (Click in Preview Mode)',
    type: 'autoshape',
    shapeDefId: 'toggle-switch',
    visible: true,
    locked: false,
    x: col2X + 148,
    y: row2Y + 86,
    width: 76,
    height: 36,
    rotation: 0,
    opacity: 1,
    blendMode: 'source-over',
    fill: '#10b981',
    fillType: 'linear-gradient',
    fillGradientEnd: '#06b6d4',
    stroke: '#ffffff',
    strokeWidth: 1.5,
    strokeAlign: 'inside',
    pixelSnap: true,
    shadow: { enabled: true, color: 'rgba(0,0,0,0.4)', blur: 8, offsetX: 0, offsetY: 3 },
    params: { stateRatio: 0.85, state: 1, padding: 4 },
  };
  const toggleLbl = makeLabel(
    'starter-toggle-lbl',
    'Toggle Widget Label',
    'LIVE STATE',
    col2X + 230,
    row2Y + 98,
    52,
    12,
    8.5,
    '#10b981',
    'left',
    'JetBrains Mono',
    '700'
  );

  // Interactive Progress Scrubber AutoShape (Drag in Preview Mode!)
  const progressWidgetObj: AutoShapeObject = {
    id: 'obj-autoshape-progress',
    name: 'Interactive Progress Scrubber (Scrub in Preview Mode)',
    type: 'autoshape',
    shapeDefId: 'progress-bar',
    visible: true,
    locked: false,
    x: col2X + 148,
    y: row2Y + 142,
    width: 130,
    height: 26,
    rotation: 0,
    opacity: 1,
    blendMode: 'source-over',
    fill: '#06b6d4',
    fillType: 'linear-gradient',
    fillGradientEnd: '#6366f1',
    stroke: '#38bdf8',
    strokeWidth: 1.5,
    strokeAlign: 'inside',
    pixelSnap: true,
    shadow: { enabled: false, color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
    params: { progress: 0.78, radius: 13 },
  };
  const progressLbl = makeLabel(
    'starter-progress-lbl',
    'Progress Scrubber Label',
    'GPU LOAD: 78% • SCRUB LIVE',
    col2X + 148,
    row2Y + 174,
    134,
    12,
    8,
    '#94a3b8',
    'left',
    'JetBrains Mono',
    '600'
  );

  const col2Footer = makeLabel(
    'starter-col2-footer',
    'AutoShape Studio Footer Hint',
    '✦ Open JSF Code Studio to write custom JS shapes',
    col2X + 16,
    row2Y + 214,
    col2W - 32,
    14,
    9,
    '#fbbf24',
    'left',
    'JetBrains Mono',
    '600'
  );

  // ==========================================================================
  // 6. ROW 2 RIGHT: MAGNETIC FLOW & RETINA SLICE PIPELINE (x = 636, y = 344, w = 304, h = 242)
  // ==========================================================================
  const col3X = 636;
  const col3W = 304;

  const col3Card = makeVectorCard(
    'starter-bento-flow-card',
    'Magnetic Flow & Retina Export Card',
    col3X,
    row2Y,
    col3W,
    row2H,
    '#0f172a',
    {
      gradEnd: '#1e293b',
      stroke: '#334155',
      strokeWidth: 1.5,
      shadow: true,
    }
  );
  const col3Bar = makeVectorCard(
    'starter-bento-flow-bar',
    'Magnetic Flow Accent Bar',
    col3X,
    row2Y,
    col3W,
    3,
    '#10b981'
  );
  const col3Tag = makeLabel(
    'starter-bento-flow-tag',
    'Magnetic Flow Eyebrow',
    '03 / MAGNETIC FLOW & RETINA .ZIP',
    col3X + 16,
    row2Y + 14,
    col3W - 32,
    14,
    9,
    '#34d399',
    'left',
    'JetBrains Mono',
    '700'
  );
  const col3Title = makeLabel(
    'starter-bento-flow-title',
    'Magnetic Flow Title',
    'Auto-Routing Connectors (X)',
    col3X + 16,
    row2Y + 32,
    col3W - 32,
    20,
    15,
    '#f8fafc',
    'left',
    'Space Grotesk',
    '700'
  );
  const col3Sub = makeLabel(
    'starter-bento-flow-sub',
    'Magnetic Flow Subtitle',
    'Drag any node card below — elbow arrows reroute live!',
    col3X + 16,
    row2Y + 54,
    col3W - 32,
    14,
    10.5,
    '#94a3b8',
    'left',
    'Inter',
    '400'
  );

  // 3 Connected Architecture Nodes inside Card 3
  const node1 = makeVectorCard(
    'sm-demo-design',
    'Flow Node 1: Hybrid Design',
    col3X + 16,
    row2Y + 80,
    122,
    52,
    '#090d16',
    { radius: 6, stroke: '#06b6d4', strokeWidth: 1.5 }
  );
  const node1Title = makeLabel(
    'sm-demo-design-title',
    'Flow Node 1 Title',
    '1. Design UI',
    col3X + 26,
    row2Y + 90,
    102,
    16,
    11,
    '#ffffff',
    'left',
    'Space Grotesk',
    '700'
  );
  const node1Sub = makeLabel(
    'sm-demo-design-sub',
    'Flow Node 1 Route',
    '/studio • Vector+Bmp',
    col3X + 26,
    row2Y + 109,
    102,
    12,
    8.5,
    '#38bdf8',
    'left',
    'JetBrains Mono',
    '600'
  );

  const node2 = makeVectorCard(
    'sm-demo-proto',
    'Flow Node 2: Interactive Preview',
    col3X + 166,
    row2Y + 80,
    122,
    52,
    '#090d16',
    { radius: 6, stroke: '#6366f1', strokeWidth: 1.5 }
  );
  const node2Title = makeLabel(
    'sm-demo-proto-title',
    'Flow Node 2 Title',
    '2. Live States',
    col3X + 176,
    row2Y + 90,
    102,
    16,
    11,
    '#ffffff',
    'left',
    'Space Grotesk',
    '700'
  );
  const node2Sub = makeLabel(
    'sm-demo-proto-sub',
    'Flow Node 2 Route',
    '/preview • Menus',
    col3X + 176,
    row2Y + 109,
    102,
    12,
    8.5,
    '#a78bfa',
    'left',
    'JetBrains Mono',
    '600'
  );

  const node3 = makeVectorCard(
    'sm-demo-export',
    'Flow Node 3: Retina Export',
    col3X + 90,
    row2Y + 152,
    144,
    50,
    '#090d16',
    { radius: 6, stroke: '#10b981', strokeWidth: 1.5 }
  );
  const node3Title = makeLabel(
    'sm-demo-export-title',
    'Flow Node 3 Title',
    '3. Ship @3x .ZIP',
    col3X + 102,
    row2Y + 161,
    120,
    16,
    11,
    '#ffffff',
    'left',
    'Space Grotesk',
    '700'
  );
  const node3Sub = makeLabel(
    'sm-demo-export-sub',
    'Flow Node 3 Route',
    'WebP • AVIF • SVG',
    col3X + 102,
    row2Y + 179,
    120,
    12,
    8.5,
    '#34d399',
    'left',
    'JetBrains Mono',
    '600'
  );

  const conn1 = createSmartConnectorObject(node1, 'e', node2, 'w', {
    routing: 'elbow',
    stroke: '#38bdf8',
    strokeWidth: 2,
  });
  conn1.id = 'starter-conn-design-proto';
  const conn2 = createSmartConnectorObject(node2, 's', node3, 'e', {
    routing: 'elbow',
    stroke: '#10b981',
    strokeWidth: 2,
  });
  conn2.id = 'starter-conn-proto-export';

  const col3Footer = makeLabel(
    'starter-col3-footer',
    'Slice Export Footer Hint',
    '✓ Press (K) for Web Slices or click Export → .ZIP',
    col3X + 16,
    row2Y + 214,
    col3W - 32,
    14,
    9,
    '#34d399',
    'left',
    'JetBrains Mono',
    '600'
  );

  // Place `navbarLayers` at the end of the array (top of Z-order) so its nested flyout menu renders cleanly over the layout in Preview Mode!
  return [
    // Row 1 Left: Hero & Multi-Layer Logo Showcase
    heroCard,
    heroTopAccent,
    heroBadgeBg,
    heroBadgeTxt,
    heroH1a,
    heroH1b,
    heroSub1,
    heroSub2,
    ...heroCta1,
    ...heroCta2,
    crestStage,
    crestOuterShield,
    crestInnerStar,
    crestTitle,
    crestSub,
    crestBadge,
    heroFooterStrip,
    heroFooterTxt,

    // Row 1 Right: Bitmap & Pixel Retouching Lab
    bmpLabCard,
    bmpLabAccent,
    bmpLabTitle,
    bmpLabHint,
    bitmapHeroObj,
    bmpFooterTxt,

    // Row 2 Left: Cubic Bezier Vector & Document Tokens
    col1Card,
    col1Bar,
    col1Tag,
    col1Title,
    col1Sub,
    bezierWaveObj,
    ...swLayers,

    // Row 2 Center: Programmable JS AutoShapes & Interactive Widgets
    col2Card,
    col2Bar,
    col2Tag,
    col2Title,
    col2Sub,
    starAutoShapeObj,
    toggleWidgetObj,
    toggleLbl,
    progressWidgetObj,
    progressLbl,
    col2Footer,

    // Row 2 Right: Magnetic Flow & Retina Slice Pipeline
    col3Card,
    col3Bar,
    col3Tag,
    col3Title,
    col3Sub,
    conn1,
    conn2,
    node1,
    node1Title,
    node1Sub,
    node2,
    node2Title,
    node2Sub,
    node3,
    node3Title,
    node3Sub,
    col3Footer,

    // Top Navigation Bar (with Nested Flyout Menus in Preview Mode)
    ...navbarLayers,
  ];
}

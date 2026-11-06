import type {
  BezierNode,
  BitmapObject,
  CanvasObject,
  LiveBitmapFilters,
  PixelSelection,
  ToolOptions,
  VectorPathObject,
} from '../types/editor';

// ============================================================================
// 1. IMAGE & BUFFER HELPERS (WITH SYNCHRONOUS MEMORY CACHE)
// ============================================================================

const imageCache = new Map<string, HTMLImageElement>();
const pendingLoads = new Map<string, Promise<HTMLImageElement>>();

/**
 * Registers a synthetic HTMLImageElement in the internal memory cache
 * so immediate canvas redraws and synchronous cut/copy operations can run without waiting an async tick.
 */
export function primeImageCache(dataUrl: string): void {
  if (!dataUrl || imageCache.has(dataUrl)) return;
  const img = new Image();
  img.src = dataUrl;
  imageCache.set(dataUrl, img);
}

/**
 * Asynchronously loads a dataUrl into an HTMLImageElement and stores it in the
 * memory cache for instant synchronous lookup by the canvas render loop.
 */
export function loadImageElement(dataUrl: string): Promise<HTMLImageElement> {
  const existing = imageCache.get(dataUrl);
  if (existing && existing.complete && existing.naturalWidth > 0) {
    return Promise.resolve(existing);
  }

  const inflight = pendingLoads.get(dataUrl);
  if (inflight) {
    return inflight;
  }

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = existing ?? new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(dataUrl, img);
      pendingLoads.delete(dataUrl);
      resolve(img);
    };
    img.onerror = (err) => {
      pendingLoads.delete(dataUrl);
      reject(err);
    };
    if (!existing) {
      img.src = dataUrl;
      imageCache.set(dataUrl, img);
    } else if (existing.complete && existing.naturalWidth > 0) {
      pendingLoads.delete(dataUrl);
      resolve(existing);
    }
  });

  pendingLoads.set(dataUrl, promise);
  return promise;
}

/**
 * Synchronously retrieves a cached HTMLImageElement if loaded and ready.
 * If not yet in cache, triggers background loading and invokes `onLoadCallback`
 * once ready so the caller can schedule a canvas repaint.
 */
export function getCachedImage(
  dataUrl: string,
  onLoadCallback?: () => void
): HTMLImageElement | null {
  if (!dataUrl) return null;
  const cached = imageCache.get(dataUrl);
  if (cached && cached.complete && cached.naturalWidth > 0) {
    return cached;
  }

  loadImageElement(dataUrl)
    .then(() => {
      if (onLoadCallback) onLoadCallback();
    })
    .catch(() => {
      // Ignore broken data URLs in render loop
    });

  return null;
}

/**
 * Creates a blank PNG bitmap data URL of `(width, height)` with optional fill color.
 */
export function createBlankBitmapDataUrl(
  width: number,
  height: number,
  fillColor?: string
): string {
  const safeW = Math.max(1, Math.round(width));
  const safeH = Math.max(1, Math.round(height));
  const canvas = document.createElement('canvas');
  canvas.width = safeW;
  canvas.height = safeH;
  const ctx = canvas.getContext('2d');
  if (ctx && fillColor && fillColor !== 'transparent' && fillColor !== 'none') {
    ctx.fillStyle = fillColor;
    ctx.fillRect(0, 0, safeW, safeH);
  }
  const dataUrl = canvas.toDataURL('image/png');
  primeImageCache(dataUrl);
  return dataUrl;
}

/**
 * Generates a crisp, colorful Osito Studio pixel-art &
 * color-zone test card so the user can immediately test Magic Wand (W),
 * Marquee (M), Lasso (L), Eraser (E), Paint Bucket (G), and Floating Pixel drag!
 */
export function createDemoBitmapCardDataUrl(width: number, height: number): string {
  const w = Math.max(64, Math.round(width));
  const h = Math.max(64, Math.round(height));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return createBlankBitmapDataUrl(w, h);

  ctx.imageSmoothingEnabled = false;

  // 1. Crisp dark slate base card with solid border zones
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, w, h);

  // Outer frame in solid electric indigo (great for single-click Magic Wand test)
  const pad = 8;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(pad, pad, w - pad * 2, h - pad * 2);

  // 2. Top Color Swatch Bar (6 distinct flat-color zones for instant Magic Wand testing)
  const swatches = [
    '#06b6d4', // Cyan
    '#3b82f6', // Royal Blue
    '#8b5cf6', // Violet
    '#ec4899', // Magenta Pink
    '#f59e0b', // Amber Gold
    '#10b981', // Emerald
  ];
  const barX = pad + 8;
  const barY = pad + 8;
  const barW = w - (pad + 8) * 2;
  const barH = Math.max(24, Math.floor(h * 0.18));
  const swatchW = Math.floor(barW / swatches.length);

  for (let i = 0; i < swatches.length; i++) {
    ctx.fillStyle = swatches[i];
    const sx = barX + i * swatchW;
    const sw = i === swatches.length - 1 ? barX + barW - sx : swatchW - 2;
    ctx.fillRect(sx, barY, sw, barH);
  }

  // 3. Left Zone: Concentric Geometric Pixel Targets (for Contiguous vs Global Wand test)
  const leftZoneX = barX;
  const leftZoneY = barY + barH + 10;
  const leftZoneW = Math.floor(barW * 0.46);
  const leftZoneH = h - leftZoneY - pad - 10;

  ctx.fillStyle = '#111827';
  ctx.fillRect(leftZoneX, leftZoneY, leftZoneW, leftZoneH);

  // Concentric stepped pixel rings inside Left Zone
  const cx = Math.floor(leftZoneX + leftZoneW / 2);
  const cy = Math.floor(leftZoneY + leftZoneH / 2);
  const maxR = Math.max(12, Math.floor(Math.min(leftZoneW, leftZoneH) * 0.42));

  const ringColors = ['#06b6d4', '#0f172a', '#f43f5e', '#0f172a', '#facc15'];
  for (let i = 0; i < ringColors.length; i++) {
    const r = Math.max(4, Math.floor(maxR * (1 - i * 0.2)));
    ctx.fillStyle = ringColors[i];
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Right Zone: Crisp 8-Bit Pixel Art Spaceship / Gem Icon + Color Blocks
  const rightZoneX = leftZoneX + leftZoneW + 10;
  const rightZoneW = barX + barW - rightZoneX;
  const rightZoneY = leftZoneY;
  const rightZoneH = leftZoneH;

  ctx.fillStyle = '#172554';
  ctx.fillRect(rightZoneX, rightZoneY, rightZoneW, rightZoneH);

  // Stepped diagonal horizon stripes inside Right Zone
  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(
    rightZoneX + 6,
    rightZoneY + Math.floor(rightZoneH * 0.62),
    rightZoneW - 12,
    Math.floor(rightZoneH * 0.16)
  );
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(
    rightZoneX + 6,
    rightZoneY + Math.floor(rightZoneH * 0.78),
    rightZoneW - 12,
    Math.floor(rightZoneH * 0.14)
  );

  // 11x11 Pixel-Art Crystal / Star Sprite in the center of Right Zone
  const spritePattern = [
    '.....1.....',
    '....121....',
    '...12321...',
    '..1234321..',
    '.123454321.',
    '12345554321',
    '.123454321.',
    '..1234321..',
    '...12321...',
    '....121....',
    '.....1.....',
  ];
  const palette: Record<string, string> = {
    '1': '#f43f5e',
    '2': '#fb7185',
    '3': '#f59e0b',
    '4': '#fde047',
    '5': '#ffffff',
  };
  const cell = Math.max(2, Math.floor(Math.min(rightZoneW, rightZoneH * 0.58) / 13));
  const spriteOriginX = Math.floor(rightZoneX + (rightZoneW - 11 * cell) / 2);
  const spriteOriginY = Math.floor(rightZoneY + 8);

  for (let row = 0; row < spritePattern.length; row++) {
    for (let col = 0; col < spritePattern[row].length; col++) {
      const ch = spritePattern[row][col];
      if (palette[ch]) {
        ctx.fillStyle = palette[ch];
        ctx.fillRect(spriteOriginX + col * cell, spriteOriginY + row * cell, cell, cell);
      }
    }
  }

  // 5. Crisp 1px White & Cyan Corner Registration Ticks
  ctx.fillStyle = '#22d3ee';
  // Top-left tick
  ctx.fillRect(4, 4, 10, 2);
  ctx.fillRect(4, 4, 2, 10);
  // Top-right tick
  ctx.fillRect(w - 14, 4, 10, 2);
  ctx.fillRect(w - 6, 4, 2, 10);
  // Bottom-left tick
  ctx.fillRect(4, h - 6, 10, 2);
  ctx.fillRect(4, h - 14, 2, 10);
  // Bottom-right tick
  ctx.fillRect(w - 14, h - 6, 10, 2);
  ctx.fillRect(w - 6, h - 14, 2, 10);

  const dataUrl = canvas.toDataURL('image/png');
  primeImageCache(dataUrl);
  return dataUrl;
}

/**
 * Helper: Loads a BitmapObject's image into an offscreen canvas and returns
 * `{ canvas, ctx, imageData }` at 1:1 canvas dimensions `(bitmap.width, bitmap.height)`.
 */
async function getBitmapImageData(bitmap: BitmapObject): Promise<{
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  imageData: ImageData;
}> {
  const w = Math.max(1, Math.round(bitmap.width || bitmap.pixelWidth));
  const h = Math.max(1, Math.round(bitmap.height || bitmap.pixelHeight));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  if (bitmap.imageDataUrl) {
    try {
      const img = await loadImageElement(bitmap.imageDataUrl);
      ctx.drawImage(img, 0, 0, w, h);
    } catch {
      // Leave blank if image fails to decode
    }
  }

  const imageData = ctx.getImageData(0, 0, w, h);
  return { canvas, ctx, imageData };
}

/**
 * Helper: Parses a CSS hex color (`#rgb`, `#rrggbb`, `#rrggbbaa`) into `[r, g, b, a]` (0..255).
 */
export function hexToRgba(hex: string, alphaMultiplier = 1): [number, number, number, number] {
  const clean = (hex || '#000000').trim().replace(/^#/, '');
  let r = 0;
  let g = 0;
  let b = 0;
  let a = 255;

  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16) || 0;
    g = parseInt(clean[1] + clean[1], 16) || 0;
    b = parseInt(clean[2] + clean[2], 16) || 0;
  } else if (clean.length === 6) {
    r = parseInt(clean.slice(0, 2), 16) || 0;
    g = parseInt(clean.slice(2, 4), 16) || 0;
    b = parseInt(clean.slice(4, 6), 16) || 0;
  } else if (clean.length === 8) {
    r = parseInt(clean.slice(0, 2), 16) || 0;
    g = parseInt(clean.slice(2, 4), 16) || 0;
    b = parseInt(clean.slice(4, 6), 16) || 0;
    a = parseInt(clean.slice(6, 8), 16) || 255;
  }

  return [r, g, b, Math.max(0, Math.min(255, Math.round(a * alphaMultiplier)))];
}

export function rgbaToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Synchronously samples a pixel color from a cached BitmapObject at `(canvasX, canvasY)`
 * for the Eyedropper (`I`) tool. Returns null if outside bounds or transparent.
 */
export function samplePixelColorSync(
  bitmap: BitmapObject,
  canvasX: number,
  canvasY: number
): string | null {
  const img = getCachedImage(bitmap.imageDataUrl);
  if (!img) return null;

  const w = Math.max(1, Math.round(bitmap.pixelWidth || bitmap.width));
  const h = Math.max(1, Math.round(bitmap.pixelHeight || bitmap.height));
  const bx = Math.floor(((canvasX - bitmap.x) / Math.max(1, bitmap.width)) * w);
  const by = Math.floor(((canvasY - bitmap.y) / Math.max(1, bitmap.height)) * h);
  if (bx < 0 || bx >= w || by < 0 || by >= h) return null;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);
  const pixel = ctx.getImageData(bx, by, 1, 1).data;
  if (pixel[3] === 0) return null;
  return rgbaToHex(pixel[0], pixel[1], pixel[2]);
}

/**
 * Builds a CSS filter string for `LiveBitmapFilters` on an HTML5 Canvas 2D context.
 */
export function buildCssFilterString(filters: LiveBitmapFilters): string {
  const parts: string[] = [];
  if (filters.brightness !== 0) {
    parts.push(`brightness(${Math.max(0, 100 + filters.brightness)}%)`);
  }
  if (filters.contrast !== 0) {
    parts.push(`contrast(${Math.max(0, 100 + filters.contrast)}%)`);
  }
  if (filters.blur > 0) {
    parts.push(`blur(${filters.blur}px)`);
  }
  if (filters.hueRotate !== 0) {
    parts.push(`hue-rotate(${filters.hueRotate}deg)`);
  }
  if (filters.invert) {
    parts.push('invert(100%)');
  }
  return parts.length > 0 ? parts.join(' ') : 'none';
}

// ============================================================================
// 2. OSITO PIXEL SELECTION CONSTRUCTORS & BOOLEAN MASK ENGINE
// ============================================================================

/**
 * Creates an inactive, empty `PixelSelection` state.
 */
export function createEmptyPixelSelection(): PixelSelection {
  return {
    active: false,
    targetBitmapId: null,
    bounds: { x: 0, y: 0, width: 0, height: 0 },
    mask: null,
    maskWidth: 0,
    maskHeight: 0,
    outlinePolygons: [],
    floatingPixels: null,
  };
}

/**
 * Fast separable 2-pass box blur to feather a selection mask (`0..30px`).
 */
function applyFeatherToMask(
  mask: Uint8Array,
  width: number,
  height: number,
  featherPx: number
): Uint8Array {
  const radius = Math.max(0, Math.min(30, Math.round(featherPx)));
  if (radius <= 0) return mask;

  const temp = new Uint8Array(width * height);
  const out = new Uint8Array(width * height);
  const windowSize = radius * 2 + 1;

  // Horizontal pass
  for (let y = 0; y < height; y++) {
    let sum = 0;
    const rowOffset = y * width;
    for (let k = -radius; k <= radius; k++) {
      const cx = Math.max(0, Math.min(width - 1, k));
      sum += mask[rowOffset + cx];
    }
    for (let x = 0; x < width; x++) {
      temp[rowOffset + x] = Math.round(sum / windowSize);
      const removeX = Math.max(0, Math.min(width - 1, x - radius));
      const addX = Math.max(0, Math.min(width - 1, x + radius + 1));
      sum += mask[rowOffset + addX] - mask[rowOffset + removeX];
    }
  }

  // Vertical pass
  for (let x = 0; x < width; x++) {
    let sum = 0;
    for (let k = -radius; k <= radius; k++) {
      const cy = Math.max(0, Math.min(height - 1, k));
      sum += temp[cy * width + x];
    }
    for (let y = 0; y < height; y++) {
      out[y * width + x] = Math.round(sum / windowSize);
      const removeY = Math.max(0, Math.min(height - 1, y - radius));
      const addY = Math.max(0, Math.min(height - 1, y + radius + 1));
      sum += temp[addY * width + x] - temp[removeY * width + x];
    }
  }

  return out;
}

/**
 * Computes the tight axis-aligned bounding box of all selected pixels (`mask[i] > 0`).
 * Returns `null` if the mask is completely empty.
 */
function computeMaskBounds(
  mask: Uint8Array,
  width: number,
  height: number
): { x: number; y: number; width: number; height: number } | null {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      if (mask[rowOffset + x] > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return null;
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

/**
 * Combines an existing `PixelSelection` with a newly rasterized `newMask`
 * using boolean operations (`'new' | 'add' | 'subtract' | 'intersect'`),
 * applies optional feathering (`0..30px`), and extracts Marching Ants contours.
 */
export function combineSelectionMasks(
  existing: PixelSelection,
  newMask: Uint8Array,
  canvasWidth: number,
  canvasHeight: number,
  op: 'new' | 'add' | 'subtract' | 'intersect',
  featherPx = 0,
  targetBitmapId?: string | null
): PixelSelection {
  const w = Math.max(1, Math.round(canvasWidth));
  const h = Math.max(1, Math.round(canvasHeight));
  const total = w * h;

  const featheredNew =
    featherPx && featherPx > 0
      ? applyFeatherToMask(newMask, w, h, featherPx)
      : newMask;

  const hasValidExisting =
    existing.active &&
    existing.mask !== null &&
    existing.maskWidth === w &&
    existing.maskHeight === h;

  const combined = new Uint8Array(total);

  if (!hasValidExisting || op === 'new') {
    if (op === 'subtract' && !hasValidExisting) {
      return createEmptyPixelSelection();
    }
    combined.set(featheredNew);
  } else {
    const prev = existing.mask!;
    switch (op) {
      case 'add':
        for (let i = 0; i < total; i++) {
          const sum = prev[i] + featheredNew[i];
          combined[i] = sum > 255 ? 255 : sum;
        }
        break;
      case 'subtract':
        for (let i = 0; i < total; i++) {
          const diff = prev[i] - featheredNew[i];
          combined[i] = diff < 0 ? 0 : diff;
        }
        break;
      case 'intersect':
        for (let i = 0; i < total; i++) {
          combined[i] = prev[i] < featheredNew[i] ? prev[i] : featheredNew[i];
        }
        break;
    }
  }

  const bounds = computeMaskBounds(combined, w, h);
  if (!bounds) {
    return createEmptyPixelSelection();
  }

  const outlinePolygons = extractSelectionOutlines(combined, w, h);

  return {
    active: true,
    targetBitmapId:
      targetBitmapId !== undefined ? targetBitmapId : existing.targetBitmapId,
    bounds,
    mask: combined,
    maskWidth: w,
    maskHeight: h,
    outlinePolygons,
    floatingPixels: null,
  };
}

/**
 * Builds a Rectangular Marquee (`M`) pixel selection with boolean operations and feathering.
 */
export function buildRectSelection(
  x: number,
  y: number,
  w: number,
  h: number,
  canvasWidth: number,
  canvasHeight: number,
  existing: PixelSelection,
  op: 'new' | 'add' | 'subtract' | 'intersect' = 'new',
  featherPx = 0,
  targetBitmapId?: string | null
): PixelSelection {
  const cw = Math.max(1, Math.round(canvasWidth));
  const ch = Math.max(1, Math.round(canvasHeight));

  const rx = w < 0 ? x + w : x;
  const ry = h < 0 ? y + h : y;
  const rw = Math.abs(w);
  const rh = Math.abs(h);

  const startX = Math.max(0, Math.floor(rx));
  const startY = Math.max(0, Math.floor(ry));
  const endX = Math.min(cw, Math.ceil(rx + rw));
  const endY = Math.min(ch, Math.ceil(ry + rh));

  if (endX <= startX || endY <= startY) {
    return op === 'new' ? createEmptyPixelSelection() : existing;
  }

  const newMask = new Uint8Array(cw * ch);
  for (let py = startY; py < endY; py++) {
    const rowOffset = py * cw;
    newMask.fill(255, rowOffset + startX, rowOffset + endX);
  }

  return combineSelectionMasks(
    existing,
    newMask,
    cw,
    ch,
    op,
    featherPx,
    targetBitmapId
  );
}

/**
 * Builds an Elliptical / Oval Marquee (`M`) pixel selection with boolean operations and feathering.
 */
export function buildOvalSelection(
  x: number,
  y: number,
  w: number,
  h: number,
  canvasWidth: number,
  canvasHeight: number,
  existing: PixelSelection,
  op: 'new' | 'add' | 'subtract' | 'intersect' = 'new',
  featherPx = 0,
  targetBitmapId?: string | null
): PixelSelection {
  const cw = Math.max(1, Math.round(canvasWidth));
  const ch = Math.max(1, Math.round(canvasHeight));

  const rx = w < 0 ? x + w : x;
  const ry = h < 0 ? y + h : y;
  const rw = Math.abs(w);
  const rh = Math.abs(h);

  if (rw < 1 || rh < 1) {
    return op === 'new' ? createEmptyPixelSelection() : existing;
  }

  const centerX = rx + rw / 2;
  const centerY = ry + rh / 2;
  const radiusX = rw / 2;
  const radiusY = rh / 2;

  const startX = Math.max(0, Math.floor(rx));
  const startY = Math.max(0, Math.floor(ry));
  const endX = Math.min(cw, Math.ceil(rx + rw));
  const endY = Math.min(ch, Math.ceil(ry + rh));

  const newMask = new Uint8Array(cw * ch);
  for (let py = startY; py < endY; py++) {
    const dy = (py + 0.5 - centerY) / radiusY;
    const dy2 = dy * dy;
    const rowOffset = py * cw;
    for (let px = startX; px < endX; px++) {
      const dx = (px + 0.5 - centerX) / radiusX;
      if (dx * dx + dy2 <= 1.0) {
        newMask[rowOffset + px] = 255;
      }
    }
  }

  return combineSelectionMasks(
    existing,
    newMask,
    cw,
    ch,
    op,
    featherPx,
    targetBitmapId
  );
}

/**
 * Builds a Freehand Lasso (`L`) polygon pixel selection with boolean operations and feathering.
 */
export function buildLassoSelection(
  points: Array<{ x: number; y: number }>,
  canvasWidth: number,
  canvasHeight: number,
  existing: PixelSelection,
  op: 'new' | 'add' | 'subtract' | 'intersect' = 'new',
  featherPx = 0,
  targetBitmapId?: string | null
): PixelSelection {
  const cw = Math.max(1, Math.round(canvasWidth));
  const ch = Math.max(1, Math.round(canvasHeight));

  if (!points || points.length < 3) {
    return op === 'new' ? createEmptyPixelSelection() : existing;
  }

  const offscreen = document.createElement('canvas');
  offscreen.width = cw;
  offscreen.height = ch;
  const ctx = offscreen.getContext('2d');
  if (!ctx) {
    return op === 'new' ? createEmptyPixelSelection() : existing;
  }

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.fill();

  const imgData = ctx.getImageData(0, 0, cw, ch).data;
  const newMask = new Uint8Array(cw * ch);
  for (let i = 0, p = 3; i < newMask.length; i++, p += 4) {
    newMask[i] = imgData[p] >= 128 ? 255 : 0;
  }

  return combineSelectionMasks(
    existing,
    newMask,
    cw,
    ch,
    op,
    featherPx,
    targetBitmapId
  );
}

/**
 * Helper: Tests whether pixel `(r, g, b, a)` is within `tolerance` (`0..255`)
 * of target `(tr, tg, tb, ta)`.
 */
function colorMatchesTolerance(
  r: number,
  g: number,
  b: number,
  a: number,
  tr: number,
  tg: number,
  tb: number,
  ta: number,
  tolerance: number
): boolean {
  // If both pixels are completely transparent, treat them as matching
  if (a === 0 && ta === 0) return true;
  const dr = Math.abs(r - tr);
  const dg = Math.abs(g - tg);
  const db = Math.abs(b - tb);
  const da = Math.abs(a - ta);
  return Math.max(dr, dg, db, da) <= tolerance;
}

/**
 * Builds a Magic Wand (`W`) pixel selection using either:
 * - Fast typed-array 4-neighbor BFS flood-fill (`contiguous === true`)
 * - Global color-range matching across the entire bitmap (`contiguous === false`)
 */
export async function buildMagicWandSelection(
  bitmap: BitmapObject,
  clickCanvasX: number,
  clickCanvasY: number,
  canvasWidth: number,
  canvasHeight: number,
  tolerance: number,
  contiguous: boolean,
  existing: PixelSelection,
  op: 'new' | 'add' | 'subtract' | 'intersect' = 'new',
  featherPx = 0
): Promise<PixelSelection> {
  const cw = Math.max(1, Math.round(canvasWidth));
  const ch = Math.max(1, Math.round(canvasHeight));
  const safeBmpW = Number.isFinite(bitmap.width) && bitmap.width > 0 ? bitmap.width : 1;
  const safeBmpH = Number.isFinite(bitmap.height) && bitmap.height > 0 ? bitmap.height : 1;
  const { imageData } = await getBitmapImageData(bitmap);
  const bw = imageData.width;
  const bh = imageData.height;

  const scaleX = bw / safeBmpW;
  const scaleY = bh / safeBmpH;

  const startBx = Math.floor((clickCanvasX - bitmap.x) * scaleX);
  const startBy = Math.floor((clickCanvasY - bitmap.y) * scaleY);

  if (startBx < 0 || startBx >= bw || startBy < 0 || startBy >= bh) {
    return op === 'new' ? createEmptyPixelSelection() : existing;
  }

  const data = imageData.data;
  const startIdx = (startBy * bw + startBx) * 4;
  const tr = data[startIdx];
  const tg = data[startIdx + 1];
  const tb = data[startIdx + 2];
  const ta = data[startIdx + 3];

  const tol = Math.max(0, Math.min(255, Math.round(tolerance)));
  const bitmapMask = new Uint8Array(bw * bh);

  if (contiguous) {
    // Fast typed-array 4-connected BFS flood fill
    const visited = new Uint8Array(bw * bh);
    const queue = new Int32Array(bw * bh);
    let head = 0;
    let tail = 0;

    const seedPos = startBy * bw + startBx;
    visited[seedPos] = 1;
    queue[tail++] = seedPos;

    while (head < tail) {
      const pos = queue[head++];
      bitmapMask[pos] = 255;

      const py = Math.floor(pos / bw);
      const px = pos - py * bw;

      // Left
      if (px > 0) {
        const nPos = pos - 1;
        if (!visited[nPos]) {
          visited[nPos] = 1;
          const p4 = nPos * 4;
          if (
            colorMatchesTolerance(
              data[p4],
              data[p4 + 1],
              data[p4 + 2],
              data[p4 + 3],
              tr,
              tg,
              tb,
              ta,
              tol
            )
          ) {
            queue[tail++] = nPos;
          }
        }
      }
      // Right
      if (px + 1 < bw) {
        const nPos = pos + 1;
        if (!visited[nPos]) {
          visited[nPos] = 1;
          const p4 = nPos * 4;
          if (
            colorMatchesTolerance(
              data[p4],
              data[p4 + 1],
              data[p4 + 2],
              data[p4 + 3],
              tr,
              tg,
              tb,
              ta,
              tol
            )
          ) {
            queue[tail++] = nPos;
          }
        }
      }
      // Up
      if (py > 0) {
        const nPos = pos - bw;
        if (!visited[nPos]) {
          visited[nPos] = 1;
          const p4 = nPos * 4;
          if (
            colorMatchesTolerance(
              data[p4],
              data[p4 + 1],
              data[p4 + 2],
              data[p4 + 3],
              tr,
              tg,
              tb,
              ta,
              tol
            )
          ) {
            queue[tail++] = nPos;
          }
        }
      }
      // Down
      if (py + 1 < bh) {
        const nPos = pos + bw;
        if (!visited[nPos]) {
          visited[nPos] = 1;
          const p4 = nPos * 4;
          if (
            colorMatchesTolerance(
              data[p4],
              data[p4 + 1],
              data[p4 + 2],
              data[p4 + 3],
              tr,
              tg,
              tb,
              ta,
              tol
            )
          ) {
            queue[tail++] = nPos;
          }
        }
      }
    }
  } else {
    // Global color tolerance match across entire bitmap
    const totalPixels = bw * bh;
    for (let i = 0; i < totalPixels; i++) {
      const p4 = i * 4;
      if (
        colorMatchesTolerance(
          data[p4],
          data[p4 + 1],
          data[p4 + 2],
          data[p4 + 3],
          tr,
          tg,
          tb,
          ta,
          tol
        )
      ) {
        bitmapMask[i] = 255;
      }
    }
  }

  // Map bitmap-space mask back to canvas-space mask
  const canvasMask = new Uint8Array(cw * ch);
  const startCx = Math.max(0, Math.floor(bitmap.x));
  const startCy = Math.max(0, Math.floor(bitmap.y));
  const endCx = Math.min(cw, Math.ceil(bitmap.x + bitmap.width));
  const endCy = Math.min(ch, Math.ceil(bitmap.y + bitmap.height));

  for (let cy = startCy; cy < endCy; cy++) {
    const by = Math.min(bh - 1, Math.max(0, Math.floor((cy - bitmap.y) * scaleY)));
    const bRow = by * bw;
    const cRow = cy * cw;
    for (let cx = startCx; cx < endCx; cx++) {
      const bx = Math.min(bw - 1, Math.max(0, Math.floor((cx - bitmap.x) * scaleX)));
      canvasMask[cRow + cx] = bitmapMask[bRow + bx];
    }
  }

  return combineSelectionMasks(
    existing,
    canvasMask,
    cw,
    ch,
    op,
    featherPx,
    bitmap.id
  );
}

/**
 * Selects all pixels on the canvas.
 */
export function selectAllPixels(
  canvasWidth: number,
  canvasHeight: number,
  targetBitmapId: string | null = null
): PixelSelection {
  const cw = Math.max(1, Math.round(canvasWidth));
  const ch = Math.max(1, Math.round(canvasHeight));
  const mask = new Uint8Array(cw * ch);
  mask.fill(255);

  return {
    active: true,
    targetBitmapId,
    bounds: { x: 0, y: 0, width: cw, height: ch },
    mask,
    maskWidth: cw,
    maskHeight: ch,
    outlinePolygons: [
      [
        { x: 0, y: 0 },
        { x: cw, y: 0 },
        { x: cw, y: ch },
        { x: 0, y: ch },
        { x: 0, y: 0 },
      ],
    ],
    floatingPixels: null,
  };
}

/**
 * Inverts an active `PixelSelection` across `(canvasWidth, canvasHeight)`.
 */
export function invertPixelSelection(
  selection: PixelSelection,
  canvasWidth: number,
  canvasHeight: number
): PixelSelection {
  const cw = Math.max(1, Math.round(canvasWidth));
  const ch = Math.max(1, Math.round(canvasHeight));

  if (!selection.active || !selection.mask || selection.maskWidth !== cw || selection.maskHeight !== ch) {
    return selectAllPixels(cw, ch, selection.targetBitmapId);
  }

  const inverted = new Uint8Array(cw * ch);
  for (let i = 0; i < inverted.length; i++) {
    inverted[i] = 255 - selection.mask[i];
  }

  const bounds = computeMaskBounds(inverted, cw, ch);
  if (!bounds) {
    return createEmptyPixelSelection();
  }

  return {
    active: true,
    targetBitmapId: selection.targetBitmapId,
    bounds,
    mask: inverted,
    maskWidth: cw,
    maskHeight: ch,
    outlinePolygons: extractSelectionOutlines(inverted, cw, ch),
    floatingPixels: null,
  };
}

/**
 * Returns true if `(canvasX, canvasY)` falls inside the active pixel selection
 * (or inside its floating pixel layer if currently floating).
 */
export function isPointInPixelSelection(
  selection: PixelSelection,
  canvasX: number,
  canvasY: number
): boolean {
  if (!selection.active) return false;

  if (selection.floatingPixels) {
    const fp = selection.floatingPixels;
    if (
      canvasX >= fp.x &&
      canvasX <= fp.x + fp.width &&
      canvasY >= fp.y &&
      canvasY <= fp.y + fp.height
    ) {
      return true;
    }
  }

  const ix = Math.floor(canvasX);
  const iy = Math.floor(canvasY);

  if (selection.mask && selection.maskWidth > 0 && selection.maskHeight > 0) {
    if (ix < 0 || ix >= selection.maskWidth || iy < 0 || iy >= selection.maskHeight) {
      return false;
    }
    return selection.mask[iy * selection.maskWidth + ix] >= 128;
  }

  const b = selection.bounds;
  return ix >= b.x && ix < b.x + b.width && iy >= b.y && iy < b.y + b.height;
}

// ============================================================================
// 3. MARCHING ANTS CONTOUR EXTRACTOR (`extractSelectionOutlines`)
// ============================================================================

/**
 * Extracts clean, connected boundary polylines/polygons where `mask >= 128`
 * borders `mask < 128` so `HybridCanvas` can stroke crisp black-and-white
 * dashed **Marching Ants** around any Magic Wand, Oval, Lasso, or boolean mask!
 */
export function extractSelectionOutlines(
  mask: Uint8Array,
  width: number,
  height: number
): Array<Array<{ x: number; y: number }>> {
  const bounds = computeMaskBounds(mask, width, height);
  if (!bounds) return [];

  // Use 1px step for crisp selections, or 2px step if very large and dense
  const step = bounds.width * bounds.height > 640000 ? 2 : 1;
  const minX = Math.max(0, bounds.x);
  const minY = Math.max(0, bounds.y);
  const maxX = Math.min(width, bounds.x + bounds.width);
  const maxY = Math.min(height, bounds.y + bounds.height);

  const stride = width + 1 + step;
  const encodeVertex = (vx: number, vy: number) => vy * stride + vx;
  const decodeVertex = (key: number): { x: number; y: number } => {
    const vy = Math.floor(key / stride);
    const vx = key - vy * stride;
    return { x: vx, y: vy };
  };

  const isSelected = (px: number, py: number): boolean => {
    if (px < 0 || px >= width || py < 0 || py >= height) return false;
    return mask[py * width + px] >= 128;
  };

  // Directed boundary edges mapped from startVertexKey -> list of endVertexKeys
  const outgoingEdges = new Map<number, number[]>();
  const addEdge = (x1: number, y1: number, x2: number, y2: number) => {
    const u = encodeVertex(x1, y1);
    const v = encodeVertex(x2, y2);
    const list = outgoingEdges.get(u);
    if (list) {
      list.push(v);
    } else {
      outgoingEdges.set(u, [v]);
    }
  };

  for (let y = minY; y < maxY; y += step) {
    for (let x = minX; x < maxX; x += step) {
      if (!isSelected(x, y)) continue;
      const xNext = Math.min(width, x + step);
      const yNext = Math.min(height, y + step);

      // Top boundary edge: left -> right
      if (!isSelected(x, y - step)) {
        addEdge(x, y, xNext, y);
      }
      // Right boundary edge: top -> bottom
      if (!isSelected(x + step, y)) {
        addEdge(xNext, y, xNext, yNext);
      }
      // Bottom boundary edge: right -> left
      if (!isSelected(x, y + step)) {
        addEdge(xNext, yNext, x, yNext);
      }
      // Left boundary edge: bottom -> top
      if (!isSelected(x - step, y)) {
        addEdge(x, yNext, x, y);
      }
    }
  }

  const polygons: Array<Array<{ x: number; y: number }>> = [];
  const maxPolygons = 350;

  for (const [startKey, neighbors] of outgoingEdges.entries()) {
    while (neighbors.length > 0) {
      if (polygons.length >= maxPolygons) break;

      const rawLoop: Array<{ x: number; y: number }> = [decodeVertex(startKey)];
      let currentKey = neighbors.pop()!;

      let guard = 0;
      const maxSteps = 20000;
      while (guard++ < maxSteps) {
        const pt = decodeVertex(currentKey);
        rawLoop.push(pt);
        if (currentKey === startKey) break;

        const nextList = outgoingEdges.get(currentKey);
        if (!nextList || nextList.length === 0) break;
        currentKey = nextList.pop()!;
      }

      // Simplify collinear horizontal/vertical intermediate points for fast canvas stroking
      if (rawLoop.length >= 2) {
        const simplified: Array<{ x: number; y: number }> = [rawLoop[0]];
        for (let i = 1; i < rawLoop.length - 1; i++) {
          const prev = simplified[simplified.length - 1];
          const curr = rawLoop[i];
          const next = rawLoop[i + 1];
          const collinearX = prev.x === curr.x && curr.x === next.x;
          const collinearY = prev.y === curr.y && curr.y === next.y;
          if (!collinearX && !collinearY) {
            simplified.push(curr);
          }
        }
        simplified.push(rawLoop[rawLoop.length - 1]);
        polygons.push(simplified);
      }
    }
  }

  return polygons;
}

// ============================================================================
// 4. PIXEL EDITING & FLOATING SELECTION OPERATIONS (OSITO WORKFLOW)
// ============================================================================

/**
 * Helper: Returns the selection mask value (`0..255`) at canvas coordinate `(cx, cy)`.
 * If `!selection.active`, returns `255` (unmasked).
 */
function getSelectionAlphaAtCanvas(
  selection: PixelSelection,
  cx: number,
  cy: number
): number {
  if (!selection.active) return 255;
  const ix = Math.floor(cx);
  const iy = Math.floor(cy);

  if (selection.mask && selection.maskWidth > 0 && selection.maskHeight > 0) {
    if (ix < 0 || ix >= selection.maskWidth || iy < 0 || iy >= selection.maskHeight) {
      return 0;
    }
    return selection.mask[iy * selection.maskWidth + ix];
  }

  const b = selection.bounds;
  return ix >= b.x && ix < b.x + b.width && iy >= b.y && iy < b.y + b.height ? 255 : 0;
}

/**
 * Helper: Crops a modified `imageData` buffer (`bmpW × bmpH` at canvas origin `(bmpX, bmpY)`)
 * to the tight axis-aligned bounding box of its remaining non-transparent pixels (`alpha > 0`),
 * so cutting or deleting a side of a bitmap immediately shrinks the original bitmap's
 * `(x, y, width, height)` and handle nodes to wrap only the remaining uncut pixels.
 */
function trimBitmapImageDataToOpaqueBounds(
  bitmap: BitmapObject,
  bmpX: number,
  bmpY: number,
  bmpW: number,
  bmpH: number,
  imageData: ImageData
): BitmapObject {
  const data = imageData.data;
  let remMinBx = bmpW;
  let remMinBy = bmpH;
  let remMaxBx = -1;
  let remMaxBy = -1;

  for (let by = 0; by < bmpH; by++) {
    const rowOffset = by * bmpW;
    for (let bx = 0; bx < bmpW; bx++) {
      if (data[(rowOffset + bx) * 4 + 3] > 0) {
        if (bx < remMinBx) remMinBx = bx;
        if (bx > remMaxBx) remMaxBx = bx;
        if (by < remMinBy) remMinBy = by;
        if (by > remMaxBy) remMaxBy = by;
      }
    }
  }

  // If all pixels were erased, keep a blank bitmap of the current dimensions
  if (remMaxBx < remMinBx || remMaxBy < remMinBy) {
    const blankUrl = createBlankBitmapDataUrl(bmpW, bmpH);
    return {
      ...bitmap,
      x: bmpX,
      y: bmpY,
      width: bmpW,
      height: bmpH,
      pixelWidth: bmpW,
      pixelHeight: bmpH,
      imageDataUrl: blankUrl,
    };
  }

  const remW = Math.max(1, remMaxBx - remMinBx + 1);
  const remH = Math.max(1, remMaxBy - remMinBy + 1);

  const remCanvas = document.createElement('canvas');
  remCanvas.width = remW;
  remCanvas.height = remH;
  const remCtx = remCanvas.getContext('2d')!;
  const remImgData = remCtx.createImageData(remW, remH);
  const remData = remImgData.data;

  for (let y = 0; y < remH; y++) {
    const srcStart = ((remMinBy + y) * bmpW + remMinBx) * 4;
    const srcEnd = srcStart + remW * 4;
    remData.set(data.subarray(srcStart, srcEnd), y * remW * 4);
  }

  remCtx.putImageData(remImgData, 0, 0);
  const updatedUrl = remCanvas.toDataURL('image/png');
  primeImageCache(updatedUrl);

  return {
    ...bitmap,
    x: bmpX + remMinBx,
    y: bmpY + remMinBy,
    width: remW,
    height: remH,
    pixelWidth: remW,
    pixelHeight: remH,
    imageDataUrl: updatedUrl,
  };
}

export type BitmapHandleId = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export interface BitmapSelectionGeometry {
  hasCutout: boolean;
  /** Polygons in local bitmap coordinates (0..width, 0..height) tracing the exact uncut pixel boundary */
  outlinePolygons: Array<Array<{ x: number; y: number }>>;
  /** Interactive handle nodes in local bitmap coordinates (0..width, 0..height) mapped to resize HandleType */
  handles: Array<{ id: BitmapHandleId; lx: number; ly: number }>;
  /** Corner vertices of the uncut bitmap contour in local bitmap coordinates */
  contourVertices: Array<{ lx: number; ly: number; mappedHandle: BitmapHandleId }>;
  /** Exact alpha mask (0 or 255) for hit-testing so clicking in a cut-out hole doesn't hit the bitmap */
  alphaMask: Uint8Array;
  maskW: number;
  maskH: number;
}

const bitmapGeometryCache = new Map<string, BitmapSelectionGeometry>();

function mapLocalPointToNearestHandleId(
  lx: number,
  ly: number,
  w: number,
  h: number
): BitmapHandleId {
  const candidates: Array<{ id: BitmapHandleId; tx: number; ty: number }> = [
    { id: 'nw', tx: 0, ty: 0 },
    { id: 'n', tx: w / 2, ty: 0 },
    { id: 'ne', tx: w, ty: 0 },
    { id: 'e', tx: w, ty: h / 2 },
    { id: 'se', tx: w, ty: h },
    { id: 's', tx: w / 2, ty: h },
    { id: 'sw', tx: 0, ty: h },
    { id: 'w', tx: 0, ty: h / 2 },
  ];
  let bestId: BitmapHandleId = 'se';
  let bestDist = Infinity;
  for (const c of candidates) {
    const d = Math.hypot(lx - c.tx, ly - c.ty);
    if (d < bestDist) {
      bestDist = d;
      bestId = c.id;
    }
  }
  return bestId;
}

function closestPointOnPolygons(
  tx: number,
  ty: number,
  polygons: Array<Array<{ x: number; y: number }>>
): { x: number; y: number } {
  let bestX = tx;
  let bestY = ty;
  let bestDistSq = Infinity;

  for (const poly of polygons) {
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % poly.length];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const lenSq = dx * dx + dy * dy;
      let px = a.x;
      let py = a.y;
      if (lenSq > 0.0001) {
        const t = Math.max(0, Math.min(1, ((tx - a.x) * dx + (ty - a.y) * dy) / lenSq));
        px = a.x + t * dx;
        py = a.y + t * dy;
      }
      const distSq = (tx - px) * (tx - px) + (ty - py) * (ty - py);
      if (distSq < bestDistSq) {
        bestDistSq = distSq;
        bestX = px;
        bestY = py;
      }
    }
  }

  return { x: Math.round(bestX), y: Math.round(bestY) };
}

/**
 * Synchronously computes (and memoizes) the true opaque contour boundary and
 * handle node positions for a `BitmapObject`. When a part has been cut out of a
 * bitmap (such as a corner, notch, or irregular marquee), its selection boundary
 * and handle nodes hug only the remaining uncut bitmap rather than the cut-out space.
 */
export function getBitmapSelectionGeometrySync(
  bitmap: BitmapObject,
  onLoadCallback?: () => void
): BitmapSelectionGeometry | null {
  const safeBmpW = Number.isFinite(bitmap.width) && bitmap.width > 0 ? bitmap.width : bitmap.pixelWidth || 1;
  const safeBmpH = Number.isFinite(bitmap.height) && bitmap.height > 0 ? bitmap.height : bitmap.pixelHeight || 1;
  const w = Math.max(1, Math.round(safeBmpW));
  const h = Math.max(1, Math.round(safeBmpH));
  const cacheKey = `${bitmap.imageDataUrl}::${w}x${h}`;
  const cached = bitmapGeometryCache.get(cacheKey);
  if (cached) return cached;

  const img = getCachedImage(bitmap.imageDataUrl, onLoadCallback);
  if (!img || img.naturalWidth <= 0 || img.naturalHeight <= 0) return null;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = false;

  let imgData: Uint8ClampedArray;
  try {
    ctx.drawImage(img, 0, 0, w, h);
    imgData = ctx.getImageData(0, 0, w, h).data;
  } catch {
    return null;
  }
  const alphaMask = new Uint8Array(w * h);
  let opaqueCount = 0;

  for (let i = 0, p = 3; i < alphaMask.length; i++, p += 4) {
    if (imgData[p] >= 16) {
      alphaMask[i] = 255;
      opaqueCount++;
    }
  }

  const totalPixels = w * h;
  const hasCutout = opaqueCount > 0 && opaqueCount < totalPixels * 0.985;

  const isLocalPointNearOpaque = (lx: number, ly: number): boolean => {
    const ix = Math.max(0, Math.min(w - 1, Math.round(lx)));
    const iy = Math.max(0, Math.min(h - 1, Math.round(ly)));
    for (let dy = -2; dy <= 2; dy++) {
      const cy = iy + dy;
      if (cy < 0 || cy >= h) continue;
      for (let dx = -2; dx <= 2; dx++) {
        const cx = ix + dx;
        if (cx < 0 || cx >= w) continue;
        if (alphaMask[cy * w + cx] > 0) return true;
      }
    }
    return false;
  };

  const nominalHandles: Array<{ id: BitmapHandleId; lx: number; ly: number }> = [
    { id: 'nw', lx: 0, ly: 0 },
    { id: 'n', lx: w / 2, ly: 0 },
    { id: 'ne', lx: w, ly: 0 },
    { id: 'e', lx: w, ly: h / 2 },
    { id: 'se', lx: w, ly: h },
    { id: 's', lx: w / 2, ly: h },
    { id: 'sw', lx: 0, ly: h },
    { id: 'w', lx: 0, ly: h / 2 },
  ];

  let outlinePolygons: Array<Array<{ x: number; y: number }>> = [
    [
      { x: 0, y: 0 },
      { x: w, y: 0 },
      { x: w, y: h },
      { x: 0, y: h },
      { x: 0, y: 0 },
    ],
  ];
  let handles = nominalHandles;
  const contourVertices: Array<{ lx: number; ly: number; mappedHandle: BitmapHandleId }> = [];

  if (hasCutout) {
    const extracted = extractSelectionOutlines(alphaMask, w, h);
    if (extracted.length > 0) {
      outlinePolygons = extracted;
      handles = nominalHandles.map((hItem) => {
        if (isLocalPointNearOpaque(hItem.lx, hItem.ly)) {
          return hItem;
        }
        const snapped = closestPointOnPolygons(hItem.lx, hItem.ly, outlinePolygons);
        return { id: hItem.id, lx: snapped.x, ly: snapped.y };
      });

      // Collect distinct corner vertices along the contour polygons so cut corners have visible nodes
      for (const poly of outlinePolygons) {
        for (let i = 0; i < poly.length - 1; i++) {
          const pt = poly[i];
          const tooClose =
            handles.some((hNode) => Math.hypot(hNode.lx - pt.x, hNode.ly - pt.y) < 6) ||
            contourVertices.some((vNode) => Math.hypot(vNode.lx - pt.x, vNode.ly - pt.y) < 8);
          if (!tooClose) {
            contourVertices.push({
              lx: pt.x,
              ly: pt.y,
              mappedHandle: mapLocalPointToNearestHandleId(pt.x, pt.y, w, h),
            });
          }
        }
      }
    }
  }

  const geom: BitmapSelectionGeometry = {
    hasCutout,
    outlinePolygons,
    handles,
    contourVertices: contourVertices.slice(0, 24),
    alphaMask,
    maskW: w,
    maskH: h,
  };

  if (bitmapGeometryCache.size > 64) {
    const firstKey = bitmapGeometryCache.keys().next().value;
    if (firstKey) bitmapGeometryCache.delete(firstKey);
  }
  bitmapGeometryCache.set(cacheKey, geom);
  return geom;
}

/**
 * Returns `true` if the bitmap has non-transparent pixels at `(canvasX, canvasY)`
 * (so clicking inside a cut-out hole does not hit the original bitmap).
 */
export function isBitmapOpaqueAtCanvasPointSync(
  bitmap: BitmapObject,
  canvasX: number,
  canvasY: number
): boolean {
  const safeW = Math.max(1, bitmap.width || 1);
  const safeH = Math.max(1, bitmap.height || 1);
  if (
    canvasX < bitmap.x ||
    canvasX > bitmap.x + safeW ||
    canvasY < bitmap.y ||
    canvasY > bitmap.y + safeH
  ) {
    return false;
  }
  const geom = getBitmapSelectionGeometrySync(bitmap);
  if (!geom || !geom.hasCutout || geom.maskW <= 0 || geom.maskH <= 0) return true;

  const lx = Math.max(
    0,
    Math.min(geom.maskW - 1, Math.floor(((canvasX - bitmap.x) / safeW) * geom.maskW))
  );
  const ly = Math.max(
    0,
    Math.min(geom.maskH - 1, Math.floor(((canvasY - bitmap.y) / safeH) * geom.maskH))
  );
  return geom.alphaMask[ly * geom.maskW + lx] > 0;
}

/**
 * Clears pixels inside `selection` on `bitmap` (scaling pixel alpha by `1 - maskVal/255`),
 * and trims the bitmap bounds to its remaining non-transparent pixels.
 * If no selection is active, clears the entire bitmap.
 */
export async function deleteSelectedPixels(
  bitmap: BitmapObject,
  selection: PixelSelection
): Promise<BitmapObject> {
  // If floating pixels are currently active, deleting simply discards the floating pixels
  if (selection.active && selection.floatingPixels) {
    return bitmap;
  }

  const bw = Math.max(1, Math.round(bitmap.width || bitmap.pixelWidth));
  const bh = Math.max(1, Math.round(bitmap.height || bitmap.pixelHeight));

  if (!selection.active) {
    return {
      ...bitmap,
      width: bw,
      height: bh,
      pixelWidth: bw,
      pixelHeight: bh,
      imageDataUrl: createBlankBitmapDataUrl(bw, bh),
    };
  }

  const { imageData } = await getBitmapImageData(bitmap);
  const data = imageData.data;

  const bmpX = Math.round(bitmap.x);
  const bmpY = Math.round(bitmap.y);

  for (let by = 0; by < bh; by++) {
    const cy = bmpY + by + 0.5;
    const rowOffset = by * bw;
    for (let bx = 0; bx < bw; bx++) {
      const cx = bmpX + bx + 0.5;
      const maskVal = getSelectionAlphaAtCanvas(selection, cx, cy);
      if (maskVal > 0) {
        const p4 = (rowOffset + bx) * 4;
        const remainingAlpha = Math.round(data[p4 + 3] * (1 - maskVal / 255));
        data[p4 + 3] = remainingAlpha;
        if (remainingAlpha === 0) {
          data[p4] = 0;
          data[p4 + 1] = 0;
          data[p4 + 2] = 0;
        }
      }
    }
  }

  return trimBitmapImageDataToOpaqueBounds(bitmap, bmpX, bmpY, bw, bh, imageData);
}

/**
 * Core implementation for cutting (`Ctrl+X`) or copying (`Ctrl+C`) the active
 * marquee / lasso / magic-wand pixel selection from a `BitmapObject`.
 * - Extracts ONLY the selected pixels into a new standalone `BitmapObject` cropped
 *   tightly to the selected area on the canvas.
 * - When `mode === 'cut'`, erases ONLY the selected pixels from `bitmap` while
 *   leaving all unselected pixels 100% untouched.
 */
function runExtractOrCutSelectedBitmapPixels(
  bitmap: BitmapObject,
  selection: PixelSelection,
  mode: 'cut' | 'copy',
  img: HTMLImageElement | null
): {
  extractedBitmap: BitmapObject | null;
  updatedSourceBitmap: BitmapObject;
  extractedPixelCount: number;
} {
  if (
    !selection.active ||
    (!selection.floatingPixels &&
      (selection.bounds.width <= 0 || selection.bounds.height <= 0))
  ) {
    return {
      extractedBitmap: null,
      updatedSourceBitmap: bitmap,
      extractedPixelCount: 0,
    };
  }

  // If pixels are already floated, package the floating buffer as a standalone BitmapObject
  if (selection.floatingPixels) {
    const fp = selection.floatingPixels;
    const fw = Math.max(1, Math.round(fp.width));
    const fh = Math.max(1, Math.round(fp.height));
    primeImageCache(fp.imageDataUrl);
    const extractedBitmap: BitmapObject = {
      ...JSON.parse(JSON.stringify(bitmap)),
      id: `bmp-${mode}-${Date.now()}`,
      name: `${bitmap.name} (${mode === 'cut' ? 'Cut' : 'Copied'} Selection)`,
      x: Math.round(fp.x),
      y: Math.round(fp.y),
      width: fw,
      height: fh,
      pixelWidth: fw,
      pixelHeight: fh,
      rotation: 0,
      imageDataUrl: fp.imageDataUrl,
    };
    return {
      extractedBitmap,
      updatedSourceBitmap: bitmap,
      extractedPixelCount: fw * fh,
    };
  }

  const bmpX = Math.round(bitmap.x);
  const bmpY = Math.round(bitmap.y);
  const bmpW = Math.max(1, Math.round(bitmap.width || bitmap.pixelWidth));
  const bmpH = Math.max(1, Math.round(bitmap.height || bitmap.pixelHeight));

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = bmpW;
  srcCanvas.height = bmpH;
  const srcCtx = srcCanvas.getContext('2d')!;
  srcCtx.imageSmoothingEnabled = false;

  if (img) {
    srcCtx.drawImage(img, 0, 0, bmpW, bmpH);
  }

  const srcImageData = srcCtx.getImageData(0, 0, bmpW, bmpH);
  const srcData = srcImageData.data;
  const extractBuffer = new Uint8ClampedArray(bmpW * bmpH * 4);

  let selMinBx = bmpW;
  let selMinBy = bmpH;
  let selMaxBx = -1;
  let selMaxBy = -1;

  let visMinBx = bmpW;
  let visMinBy = bmpH;
  let visMaxBx = -1;
  let visMaxBy = -1;
  let extractedPixelCount = 0;

  for (let by = 0; by < bmpH; by++) {
    const cy = bmpY + by + 0.5;
    const rowOffset = by * bmpW;
    for (let bx = 0; bx < bmpW; bx++) {
      const cx = bmpX + bx + 0.5;
      const maskVal = getSelectionAlphaAtCanvas(selection, cx, cy);
      if (maskVal === 0) continue; // Unselected pixel: leave srcData 100% untouched!

      if (bx < selMinBx) selMinBx = bx;
      if (bx > selMaxBx) selMaxBx = bx;
      if (by < selMinBy) selMinBy = by;
      if (by > selMaxBy) selMaxBy = by;

      const p4 = (rowOffset + bx) * 4;
      const r = srcData[p4];
      const g = srcData[p4 + 1];
      const b = srcData[p4 + 2];
      const a = srcData[p4 + 3];

      const extractedAlpha = Math.round(a * (maskVal / 255));
      if (extractedAlpha > 0) {
        extractBuffer[p4] = r;
        extractBuffer[p4 + 1] = g;
        extractBuffer[p4 + 2] = b;
        extractBuffer[p4 + 3] = extractedAlpha;
        if (bx < visMinBx) visMinBx = bx;
        if (bx > visMaxBx) visMaxBx = bx;
        if (by < visMinBy) visMinBy = by;
        if (by > visMaxBy) visMaxBy = by;
        extractedPixelCount++;
      }

      if (mode === 'cut' && a > 0) {
        const remainingAlpha = Math.max(0, a - extractedAlpha);
        srcData[p4 + 3] = remainingAlpha;
        if (remainingAlpha === 0) {
          srcData[p4] = 0;
          srcData[p4 + 1] = 0;
          srcData[p4 + 2] = 0;
        }
      }
    }
  }

  const hasVisibleCrop = visMaxBx >= visMinBx && visMaxBy >= visMinBy;
  const hasSelectionOverlap = selMaxBx >= selMinBx && selMaxBy >= selMinBy;

  if (!hasVisibleCrop && !hasSelectionOverlap) {
    return {
      extractedBitmap: null,
      updatedSourceBitmap: bitmap,
      extractedPixelCount: 0,
    };
  }

  const cropMinBx = Math.max(0, Math.min(bmpW - 1, hasVisibleCrop ? visMinBx : selMinBx));
  const cropMinBy = Math.max(0, Math.min(bmpH - 1, hasVisibleCrop ? visMinBy : selMinBy));
  const cropMaxBx = Math.max(cropMinBx, Math.min(bmpW - 1, hasVisibleCrop ? visMaxBx : selMaxBx));
  const cropMaxBy = Math.max(cropMinBy, Math.min(bmpH - 1, hasVisibleCrop ? visMaxBy : selMaxBy));

  const cropW = Math.max(1, cropMaxBx - cropMinBx + 1);
  const cropH = Math.max(1, cropMaxBy - cropMinBy + 1);

  const extractCanvas = document.createElement('canvas');
  extractCanvas.width = cropW;
  extractCanvas.height = cropH;
  const extractCtx = extractCanvas.getContext('2d')!;
  const cropImageData = extractCtx.createImageData(cropW, cropH);
  const cropData = cropImageData.data;

  for (let y = 0; y < cropH; y++) {
    const srcRowStart = ((cropMinBy + y) * bmpW + cropMinBx) * 4;
    const srcRowEnd = srcRowStart + cropW * 4;
    const dstRowStart = y * cropW * 4;
    cropData.set(extractBuffer.subarray(srcRowStart, srcRowEnd), dstRowStart);
  }

  extractCtx.putImageData(cropImageData, 0, 0);
  const extractedDataUrl = extractCanvas.toDataURL('image/png');
  primeImageCache(extractedDataUrl);

  const extractedBitmap: BitmapObject = {
    ...JSON.parse(JSON.stringify(bitmap)),
    id: `bmp-${mode}-${Date.now()}`,
    name: `${bitmap.name} (${mode === 'cut' ? 'Cut' : 'Copied'} Selection)`,
    x: bmpX + cropMinBx,
    y: bmpY + cropMinBy,
    width: cropW,
    height: cropH,
    pixelWidth: cropW,
    pixelHeight: cropH,
    rotation: 0,
    imageDataUrl: extractedDataUrl,
  };

  let updatedSourceBitmap = bitmap;
  if (mode === 'cut') {
    updatedSourceBitmap = trimBitmapImageDataToOpaqueBounds(
      bitmap,
      bmpX,
      bmpY,
      bmpW,
      bmpH,
      srcImageData
    );
  }

  return {
    extractedBitmap,
    updatedSourceBitmap,
    extractedPixelCount,
  };
}

/**
 * Synchronous fast-path for cutting (`Ctrl+X`) or copying (`Ctrl+C`) marquee-selected
 * bitmap pixels when the bitmap's image is already cached in memory.
 * Returns `null` only if the bitmap image hasn't finished decoding into `imageCache` yet.
 */
export function extractOrCutSelectedBitmapPixelsSync(
  bitmap: BitmapObject,
  selection: PixelSelection,
  mode: 'cut' | 'copy'
): {
  extractedBitmap: BitmapObject | null;
  updatedSourceBitmap: BitmapObject;
  extractedPixelCount: number;
} | null {
  if (!selection.active) return null;
  if (selection.floatingPixels) {
    return runExtractOrCutSelectedBitmapPixels(bitmap, selection, mode, null);
  }
  const cachedImg = getCachedImage(bitmap.imageDataUrl);
  if (!cachedImg) return null;
  return runExtractOrCutSelectedBitmapPixels(bitmap, selection, mode, cachedImg);
}

/**
 * Asynchronous fallback for cutting (`Ctrl+X`) or copying (`Ctrl+C`) marquee-selected
 * bitmap pixels.
 */
export async function extractOrCutSelectedBitmapPixels(
  bitmap: BitmapObject,
  selection: PixelSelection,
  mode: 'cut' | 'copy'
): Promise<{
  extractedBitmap: BitmapObject | null;
  updatedSourceBitmap: BitmapObject;
  extractedPixelCount: number;
}> {
  if (
    !selection.active ||
    (!selection.floatingPixels &&
      (selection.bounds.width <= 0 || selection.bounds.height <= 0))
  ) {
    return {
      extractedBitmap: null,
      updatedSourceBitmap: bitmap,
      extractedPixelCount: 0,
    };
  }
  if (selection.floatingPixels) {
    return runExtractOrCutSelectedBitmapPixels(bitmap, selection, mode, null);
  }
  let img: HTMLImageElement | null = null;
  if (bitmap.imageDataUrl) {
    try {
      img = await loadImageElement(bitmap.imageDataUrl);
    } catch {
      img = null;
    }
  }
  return runExtractOrCutSelectedBitmapPixels(bitmap, selection, mode, img);
}

/**
 * Classic Osito Studio behavior when dragging inside an active Marquee/Magic Wand
 * selection with the Pointer (`V`) or Marquee (`M`) tool:
 * Extracts the selected pixels into `selection.floatingPixels` and (unless
 * `cloneOnly` is true for Alt+Drag cloning) erases those pixels from `bitmap`!
 */
export async function floatSelectedPixels(
  bitmap: BitmapObject,
  selection: PixelSelection,
  cloneOnly = false
): Promise<{ updatedBitmap: BitmapObject; updatedSelection: PixelSelection }> {
  if (
    !selection.active ||
    (!selection.floatingPixels &&
      (selection.bounds.width <= 0 || selection.bounds.height <= 0))
  ) {
    return { updatedBitmap: bitmap, updatedSelection: selection };
  }

  // If already floating, keep or clone the existing floating buffer
  if (selection.floatingPixels) {
    return { updatedBitmap: bitmap, updatedSelection: selection };
  }

  const bounds = selection.bounds;
  const fw = Math.max(1, Math.round(bounds.width));
  const fh = Math.max(1, Math.round(bounds.height));

  const bmpX = Math.round(bitmap.x);
  const bmpY = Math.round(bitmap.y);
  const bw = Math.max(1, Math.round(bitmap.width || bitmap.pixelWidth));
  const bh = Math.max(1, Math.round(bitmap.height || bitmap.pixelHeight));

  const { imageData: bmpData } = await getBitmapImageData(bitmap);
  const srcPixels = bmpData.data;

  const floatCanvas = document.createElement('canvas');
  floatCanvas.width = fw;
  floatCanvas.height = fh;
  const floatCtx = floatCanvas.getContext('2d')!;
  const floatImgData = floatCtx.createImageData(fw, fh);
  const dstPixels = floatImgData.data;

  for (let fy = 0; fy < fh; fy++) {
    const cy = bounds.y + fy;
    const by = Math.floor(cy - bmpY);
    if (by < 0 || by >= bh) continue;

    for (let fx = 0; fx < fw; fx++) {
      const cx = bounds.x + fx;
      const bx = Math.floor(cx - bmpX);
      if (bx < 0 || bx >= bw) continue;

      const maskVal = getSelectionAlphaAtCanvas(selection, cx + 0.5, cy + 0.5);
      if (maskVal === 0) continue;

      const srcIdx = (by * bw + bx) * 4;
      const dstIdx = (fy * fw + fx) * 4;

      const r = srcPixels[srcIdx];
      const g = srcPixels[srcIdx + 1];
      const b = srcPixels[srcIdx + 2];
      const a = srcPixels[srcIdx + 3];

      const extractedAlpha = Math.round(a * (maskVal / 255));
      dstPixels[dstIdx] = r;
      dstPixels[dstIdx + 1] = g;
      dstPixels[dstIdx + 2] = b;
      dstPixels[dstIdx + 3] = extractedAlpha;

      if (!cloneOnly) {
        const remainingAlpha = Math.max(0, a - extractedAlpha);
        srcPixels[srcIdx + 3] = remainingAlpha;
        if (remainingAlpha === 0) {
          srcPixels[srcIdx] = 0;
          srcPixels[srcIdx + 1] = 0;
          srcPixels[srcIdx + 2] = 0;
        }
      }
    }
  }

  floatCtx.putImageData(floatImgData, 0, 0);
  const floatDataUrl = floatCanvas.toDataURL('image/png');
  primeImageCache(floatDataUrl);

  let updatedBitmap = bitmap;
  if (!cloneOnly) {
    updatedBitmap = trimBitmapImageDataToOpaqueBounds(bitmap, bmpX, bmpY, bw, bh, bmpData);
  }

  const updatedSelection: PixelSelection = {
    ...selection,
    targetBitmapId: bitmap.id,
    floatingPixels: {
      imageDataUrl: floatDataUrl,
      x: bounds.x,
      y: bounds.y,
      width: fw,
      height: fh,
    },
  };

  return { updatedBitmap, updatedSelection };
}

/**
 * Moves an active pixel selection (and its `floatingPixels` if floating) by `(dx, dy)`
 * in canvas space, updating both `bounds` and `outlinePolygons`.
 */
export function translatePixelSelection(
  selection: PixelSelection,
  dx: number,
  dy: number
): PixelSelection {
  if (!selection.active) return selection;
  const idx = Math.round(dx);
  const idy = Math.round(dy);
  if (idx === 0 && idy === 0) return selection;

  let shiftedMask = selection.mask;
  if (selection.mask && selection.maskWidth > 0 && selection.maskHeight > 0) {
    const w = selection.maskWidth;
    const h = selection.maskHeight;
    const nextMask = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      const srcY = y - idy;
      if (srcY < 0 || srcY >= h) continue;
      const dstRow = y * w;
      const srcRow = srcY * w;
      for (let x = 0; x < w; x++) {
        const srcX = x - idx;
        if (srcX >= 0 && srcX < w) {
          nextMask[dstRow + x] = selection.mask[srcRow + srcX];
        }
      }
    }
    shiftedMask = nextMask;
  }

  return {
    ...selection,
    bounds: {
      ...selection.bounds,
      x: selection.bounds.x + idx,
      y: selection.bounds.y + idy,
    },
    mask: shiftedMask,
    outlinePolygons: selection.outlinePolygons.map((poly) =>
      poly.map((pt) => ({ x: pt.x + idx, y: pt.y + idy }))
    ),
    floatingPixels: selection.floatingPixels
      ? {
          ...selection.floatingPixels,
          x: selection.floatingPixels.x + idx,
          y: selection.floatingPixels.y + idy,
        }
      : null,
  };
}

/**
 * Composites `selection.floatingPixels` onto `bitmap` at its new `(x, y)` canvas
 * position, clears `floatingPixels`, and updates `selection.bounds` & `mask` to the new location.
 */
export async function commitFloatingPixels(
  bitmap: BitmapObject,
  selection: PixelSelection
): Promise<{ updatedBitmap: BitmapObject; updatedSelection: PixelSelection }> {
  if (!selection.active || !selection.floatingPixels) {
    return { updatedBitmap: bitmap, updatedSelection: selection };
  }

  const fp = selection.floatingPixels;
  const floatImg = await loadImageElement(fp.imageDataUrl);

  // Compute union bounds in canvas coordinates if floating pixels extend beyond bitmap
  const minX = Math.min(bitmap.x, fp.x);
  const minY = Math.min(bitmap.y, fp.y);
  const maxX = Math.max(bitmap.x + bitmap.width, fp.x + fp.width);
  const maxY = Math.max(bitmap.y + bitmap.height, fp.y + fp.height);

  const newW = Math.max(1, Math.round(maxX - minX));
  const newH = Math.max(1, Math.round(maxY - minY));

  const canvas = document.createElement('canvas');
  canvas.width = newW;
  canvas.height = newH;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  if (bitmap.imageDataUrl) {
    try {
      const baseImg = await loadImageElement(bitmap.imageDataUrl);
      ctx.drawImage(
        baseImg,
        Math.round(bitmap.x - minX),
        Math.round(bitmap.y - minY),
        Math.round(bitmap.width),
        Math.round(bitmap.height)
      );
    } catch {
      // Ignore empty base
    }
  }

  ctx.drawImage(
    floatImg,
    Math.round(fp.x - minX),
    Math.round(fp.y - minY),
    Math.round(fp.width),
    Math.round(fp.height)
  );

  const mergedDataUrl = canvas.toDataURL('image/png');
  primeImageCache(mergedDataUrl);

  const updatedBitmap: BitmapObject = {
    ...bitmap,
    x: minX,
    y: minY,
    width: newW,
    height: newH,
    pixelWidth: newW,
    pixelHeight: newH,
    imageDataUrl: mergedDataUrl,
  };

  // Shift selection mask if floatingPixels was moved relative to selection.bounds
  const dx = Math.round(fp.x - selection.bounds.x);
  const dy = Math.round(fp.y - selection.bounds.y);
  const shifted = translatePixelSelection(selection, dx, dy);

  const updatedSelection: PixelSelection = {
    ...shifted,
    floatingPixels: null,
  };

  return { updatedBitmap, updatedSelection };
}

/**
 * Paints a stroke segment onto `bitmap` from `fromCanvas` to `toCanvas` using:
 * - `'pencil'`: Integer Bresenham pixel plotting (`Math.floor`) with exact pixel size (`options.brushSize`)
 *   and zero subpixel blur!
 * - `'brush'` / `'eraser'`: Interpolated stamps with hardness/feather and opacity.
 * Strictly clips all modifications to `selection.mask` when `selection.active` is true!
 */
export async function paintBitmapStroke(
  bitmap: BitmapObject,
  fromCanvas: { x: number; y: number },
  toCanvas: { x: number; y: number },
  tool: 'brush' | 'pencil' | 'eraser',
  options: ToolOptions,
  selection: PixelSelection
): Promise<BitmapObject> {
  const { canvas, ctx, imageData } = await getBitmapImageData(bitmap);
  const bw = imageData.width;
  const bh = imageData.height;
  const scaleX = bw / Math.max(1, bitmap.width);
  const scaleY = bh / Math.max(1, bitmap.height);
  const invScaleX = Math.max(1, bitmap.width) / bw;
  const invScaleY = Math.max(1, bitmap.height) / bh;

  const data = imageData.data;

  const x0 = Math.floor((fromCanvas.x - bitmap.x) * scaleX);
  const y0 = Math.floor((fromCanvas.y - bitmap.y) * scaleY);
  const x1 = Math.floor((toCanvas.x - bitmap.x) * scaleX);
  const y1 = Math.floor((toCanvas.y - bitmap.y) * scaleY);

  const opacityFraction = Math.max(0.01, Math.min(1, (options.brushOpacity ?? 100) / 100));
  const [cr, cg, cb] = hexToRgba(options.primaryColor || '#06b6d4');

  if (tool === 'pencil') {
    // 100% aliased integer Bresenham line algorithm
    const size = Math.max(1, Math.round(options.brushSize || 1));
    const half = Math.floor(size / 2);

    const plotAliasedSquare = (px: number, py: number) => {
      for (let oy = 0; oy < size; oy++) {
        const by = py - half + oy;
        if (by < 0 || by >= bh) continue;
        const cy = bitmap.y + (by + 0.5) * invScaleY;
        for (let ox = 0; ox < size; ox++) {
          const bx = px - half + ox;
          if (bx < 0 || bx >= bw) continue;
          const cx = bitmap.x + (bx + 0.5) * invScaleX;

          const selAlpha = getSelectionAlphaAtCanvas(selection, cx, cy);
          if (selAlpha === 0) continue;

          const idx = (by * bw + bx) * 4;
          const effAlpha = opacityFraction * (selAlpha / 255);
          if (effAlpha >= 0.999) {
            data[idx] = cr;
            data[idx + 1] = cg;
            data[idx + 2] = cb;
            data[idx + 3] = 255;
          } else {
            const dstA = data[idx + 3] / 255;
            const outA = effAlpha + dstA * (1 - effAlpha);
            if (outA > 0) {
              data[idx] = Math.round((cr * effAlpha + data[idx] * dstA * (1 - effAlpha)) / outA);
              data[idx + 1] = Math.round(
                (cg * effAlpha + data[idx + 1] * dstA * (1 - effAlpha)) / outA
              );
              data[idx + 2] = Math.round(
                (cb * effAlpha + data[idx + 2] * dstA * (1 - effAlpha)) / outA
              );
              data[idx + 3] = Math.round(outA * 255);
            }
          }
        }
      }
    };

    let cx = x0;
    let cy = y0;
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;

    while (true) {
      plotAliasedSquare(cx, cy);
      if (cx === x1 && cy === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        cx += sx;
      }
      if (e2 <= dx) {
        err += dx;
        cy += sy;
      }
    }
  } else {
    // 'brush' or 'eraser': Interpolated circular stamp with hardness falloff
    const diameter = Math.max(1, options.brushSize || 12);
    const radius = diameter / 2;
    const hardness = Math.max(0, Math.min(1, (options.brushHardness ?? 80) / 100));
    const innerRadius = radius * hardness;

    const dist = Math.hypot(x1 - x0, y1 - y0);
    const stepSize = Math.max(1, radius * 0.25);
    const steps = Math.max(1, Math.ceil(dist / stepSize));

    // Track max stamp influence per pixel across the stroke segment to prevent over-accumulation
    const minBx = Math.max(0, Math.floor(Math.min(x0, x1) - radius - 1));
    const maxBx = Math.min(bw - 1, Math.ceil(Math.max(x0, x1) + radius + 1));
    const minBy = Math.max(0, Math.floor(Math.min(y0, y1) - radius - 1));
    const maxBy = Math.min(bh - 1, Math.ceil(Math.max(y0, y1) + radius + 1));

    const roiW = Math.max(0, maxBx - minBx + 1);
    const roiH = Math.max(0, maxBy - minBy + 1);
    const strokeMask = new Float32Array(roiW * roiH);

    for (let s = 0; s <= steps; s++) {
      const t = steps === 0 ? 0 : s / steps;
      const sx = x0 + (x1 - x0) * t;
      const sy = y0 + (y1 - y0) * t;

      const sMinX = Math.max(minBx, Math.floor(sx - radius));
      const sMaxX = Math.min(maxBx, Math.ceil(sx + radius));
      const sMinY = Math.max(minBy, Math.floor(sy - radius));
      const sMaxY = Math.min(maxBy, Math.ceil(sy + radius));

      for (let by = sMinY; by <= sMaxY; by++) {
        const dy = by + 0.5 - sy;
        for (let bx = sMinX; bx <= sMaxX; bx++) {
          const dx = bx + 0.5 - sx;
          const d = Math.hypot(dx, dy);
          if (d > radius) continue;

          let falloff = 1;
          if (d > innerRadius && radius > innerRadius) {
            falloff = 1 - (d - innerRadius) / (radius - innerRadius);
          }
          const roiIdx = (by - minBy) * roiW + (bx - minBx);
          if (falloff > strokeMask[roiIdx]) {
            strokeMask[roiIdx] = falloff;
          }
        }
      }
    }

    for (let by = minBy; by <= maxBy; by++) {
      const cy = bitmap.y + (by + 0.5) * invScaleY;
      for (let bx = minBx; bx <= maxBx; bx++) {
        const stampAlpha = strokeMask[(by - minBy) * roiW + (bx - minBx)];
        if (stampAlpha <= 0) continue;

        const cx = bitmap.x + (bx + 0.5) * invScaleX;
        const selAlpha = getSelectionAlphaAtCanvas(selection, cx, cy);
        if (selAlpha === 0) continue;

        const effAlpha = stampAlpha * opacityFraction * (selAlpha / 255);
        const idx = (by * bw + bx) * 4;

        if (tool === 'eraser') {
          const nextA = Math.round(data[idx + 3] * (1 - effAlpha));
          data[idx + 3] = nextA;
          if (nextA === 0) {
            data[idx] = 0;
            data[idx + 1] = 0;
            data[idx + 2] = 0;
          }
        } else {
          const dstA = data[idx + 3] / 255;
          const outA = effAlpha + dstA * (1 - effAlpha);
          if (outA > 0) {
            data[idx] = Math.round((cr * effAlpha + data[idx] * dstA * (1 - effAlpha)) / outA);
            data[idx + 1] = Math.round(
              (cg * effAlpha + data[idx + 1] * dstA * (1 - effAlpha)) / outA
            );
            data[idx + 2] = Math.round(
              (cb * effAlpha + data[idx + 2] * dstA * (1 - effAlpha)) / outA
            );
            data[idx + 3] = Math.round(outA * 255);
          }
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const updatedUrl = canvas.toDataURL('image/png');
  primeImageCache(updatedUrl);

  return {
    ...bitmap,
    pixelWidth: bw,
    pixelHeight: bh,
    imageDataUrl: updatedUrl,
  };
}

/**
 * Paint Bucket (`G`) contiguous flood fill on `bitmap`, strictly respecting
 * active `selection.mask`.
 */
export async function floodFillOnBitmap(
  bitmap: BitmapObject,
  canvasX: number,
  canvasY: number,
  fillColorHex: string,
  tolerance: number,
  selection: PixelSelection
): Promise<BitmapObject> {
  const safeBmpW = Number.isFinite(bitmap.width) && bitmap.width > 0 ? bitmap.width : 1;
  const safeBmpH = Number.isFinite(bitmap.height) && bitmap.height > 0 ? bitmap.height : 1;
  const { canvas, ctx, imageData } = await getBitmapImageData(bitmap);
  const bw = imageData.width;
  const bh = imageData.height;
  const scaleX = bw / safeBmpW;
  const scaleY = bh / safeBmpH;
  const invScaleX = safeBmpW / bw;
  const invScaleY = safeBmpH / bh;

  const startBx = Math.floor((canvasX - bitmap.x) * scaleX);
  const startBy = Math.floor((canvasY - bitmap.y) * scaleY);
  if (startBx < 0 || startBx >= bw || startBy < 0 || startBy >= bh) {
    return bitmap;
  }

  if (
    selection.active &&
    (selection.bounds.width <= 0 ||
      selection.bounds.height <= 0 ||
      getSelectionAlphaAtCanvas(
        selection,
        bitmap.x + (startBx + 0.5) * invScaleX,
        bitmap.y + (startBy + 0.5) * invScaleY
      ) === 0)
  ) {
    return bitmap;
  }

  const data = imageData.data;

  const seedIdx = (startBy * bw + startBx) * 4;
  const tr = data[seedIdx];
  const tg = data[seedIdx + 1];
  const tb = data[seedIdx + 2];
  const ta = data[seedIdx + 3];

  const [fr, fg, fb, fa] = hexToRgba(fillColorHex);
  if (tr === fr && tg === fg && tb === fb && ta === fa) {
    return bitmap;
  }

  const tol = Math.max(0, Math.min(255, Math.round(tolerance)));
  const visited = new Uint8Array(bw * bh);
  const queue = new Int32Array(bw * bh);
  let head = 0;
  let tail = 0;

  const seedPos = startBy * bw + startBx;
  visited[seedPos] = 1;
  queue[tail++] = seedPos;

  const canFillPixel = (pos: number): boolean => {
    const py = Math.floor(pos / bw);
    const px = pos - py * bw;
    if (selection.active) {
      const cx = bitmap.x + (px + 0.5) * invScaleX;
      const cy = bitmap.y + (py + 0.5) * invScaleY;
      if (getSelectionAlphaAtCanvas(selection, cx, cy) === 0) {
        return false;
      }
    }
    const p4 = pos * 4;
    return colorMatchesTolerance(
      data[p4],
      data[p4 + 1],
      data[p4 + 2],
      data[p4 + 3],
      tr,
      tg,
      tb,
      ta,
      tol
    );
  };

  while (head < tail) {
    const pos = queue[head++];
    const py = Math.floor(pos / bw);
    const px = pos - py * bw;

    const p4 = pos * 4;
    data[p4] = fr;
    data[p4 + 1] = fg;
    data[p4 + 2] = fb;
    data[p4 + 3] = fa;

    if (px > 0) {
      const nPos = pos - 1;
      if (!visited[nPos] && canFillPixel(nPos)) {
        visited[nPos] = 1;
        queue[tail++] = nPos;
      }
    }
    if (px + 1 < bw) {
      const nPos = pos + 1;
      if (!visited[nPos] && canFillPixel(nPos)) {
        visited[nPos] = 1;
        queue[tail++] = nPos;
      }
    }
    if (py > 0) {
      const nPos = pos - bw;
      if (!visited[nPos] && canFillPixel(nPos)) {
        visited[nPos] = 1;
        queue[tail++] = nPos;
      }
    }
    if (py + 1 < bh) {
      const nPos = pos + bw;
      if (!visited[nPos] && canFillPixel(nPos)) {
        visited[nPos] = 1;
        queue[tail++] = nPos;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const updatedUrl = canvas.toDataURL('image/png');
  primeImageCache(updatedUrl);

  return {
    ...bitmap,
    pixelWidth: bw,
    pixelHeight: bh,
    imageDataUrl: updatedUrl,
  };
}

/**
 * Applies a destructive pixel filter/transform strictly inside the active
 * `selection.mask` (or across the entire `bitmap` if `selection.active === false`).
 */
export async function applyDestructivePixelEffect(
  bitmap: BitmapObject,
  effect:
    | 'invert'
    | 'grayscale'
    | 'sepia'
    | 'brighten'
    | 'contrast'
    | 'pixelate-4px'
    | 'flip-h'
    | 'flip-v',
  selection: PixelSelection
): Promise<BitmapObject> {
  const { canvas, ctx, imageData } = await getBitmapImageData(bitmap);
  const bw = imageData.width;
  const bh = imageData.height;
  const invScaleX = Math.max(1, bitmap.width) / bw;
  const invScaleY = Math.max(1, bitmap.height) / bh;

  const data = imageData.data;
  const srcCopy = new Uint8ClampedArray(data);

  // Determine the region of interest in bitmap coordinates
  let minBx = 0;
  let minBy = 0;
  let maxBx = bw - 1;
  let maxBy = bh - 1;
  let useSelection = selection.active;

  if (useSelection) {
    const scaleX = bw / Math.max(1, bitmap.width);
    const scaleY = bh / Math.max(1, bitmap.height);
    const candMinBx = Math.max(0, Math.floor((selection.bounds.x - bitmap.x) * scaleX));
    const candMinBy = Math.max(0, Math.floor((selection.bounds.y - bitmap.y) * scaleY));
    const candMaxBx = Math.min(
      bw - 1,
      Math.ceil((selection.bounds.x + selection.bounds.width - bitmap.x) * scaleX)
    );
    const candMaxBy = Math.min(
      bh - 1,
      Math.ceil((selection.bounds.y + selection.bounds.height - bitmap.y) * scaleY)
    );
    if (candMaxBx >= candMinBx && candMaxBy >= candMinBy) {
      minBx = candMinBx;
      minBy = candMinBy;
      maxBx = candMaxBx;
      maxBy = candMaxBy;
    } else {
      // Selection is outside bitmap bounds — apply to full bitmap
      useSelection = false;
    }
  }

  if (effect === 'flip-h' || effect === 'flip-v') {
    for (let by = minBy; by <= maxBy; by++) {
      const cy = bitmap.y + (by + 0.5) * invScaleY;
      for (let bx = minBx; bx <= maxBx; bx++) {
        const cx = bitmap.x + (bx + 0.5) * invScaleX;
        if (useSelection && getSelectionAlphaAtCanvas(selection, cx, cy) === 0) {
          continue;
        }
        const srcBx = effect === 'flip-h' ? maxBx - (bx - minBx) : bx;
        const srcBy = effect === 'flip-v' ? maxBy - (by - minBy) : by;
        const dstIdx = (by * bw + bx) * 4;
        const srcIdx = (srcBy * bw + srcBx) * 4;
        data[dstIdx] = srcCopy[srcIdx];
        data[dstIdx + 1] = srcCopy[srcIdx + 1];
        data[dstIdx + 2] = srcCopy[srcIdx + 2];
        data[dstIdx + 3] = srcCopy[srcIdx + 3];
      }
    }
  } else {
    for (let by = minBy; by <= maxBy; by++) {
      const cy = bitmap.y + (by + 0.5) * invScaleY;
      for (let bx = minBx; bx <= maxBx; bx++) {
        const cx = bitmap.x + (bx + 0.5) * invScaleX;
        const selAlpha = useSelection ? getSelectionAlphaAtCanvas(selection, cx, cy) : 255;
        if (selAlpha === 0) continue;

        const idx = (by * bw + bx) * 4;
        const r = srcCopy[idx];
        const g = srcCopy[idx + 1];
        const b = srcCopy[idx + 2];
        const a = srcCopy[idx + 3];
        if (a === 0 && effect !== 'pixelate-4px') continue;

        let nr = r;
        let ng = g;
        let nb = b;
        let na = a;

        switch (effect) {
          case 'invert':
            nr = 255 - r;
            ng = 255 - g;
            nb = 255 - b;
            break;
          case 'grayscale': {
            const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            nr = lum;
            ng = lum;
            nb = lum;
            break;
          }
          case 'sepia':
            nr = Math.min(255, Math.round(r * 0.393 + g * 0.769 + b * 0.189));
            ng = Math.min(255, Math.round(r * 0.349 + g * 0.686 + b * 0.168));
            nb = Math.min(255, Math.round(r * 0.272 + g * 0.534 + b * 0.131));
            break;
          case 'brighten':
            nr = Math.min(255, r + 28);
            ng = Math.min(255, g + 28);
            nb = Math.min(255, b + 28);
            break;
          case 'contrast': {
            const factor = 1.35;
            nr = Math.max(0, Math.min(255, Math.round((r - 128) * factor + 128)));
            ng = Math.max(0, Math.min(255, Math.round((g - 128) * factor + 128)));
            nb = Math.max(0, Math.min(255, Math.round((b - 128) * factor + 128)));
            break;
          }
          case 'pixelate-4px': {
            const cell = 8;
            const blockX = Math.min(bw - 1, Math.floor(bx / cell) * cell + Math.floor(cell / 2));
            const blockY = Math.min(bh - 1, Math.floor(by / cell) * cell + Math.floor(cell / 2));
            const bIdx = (blockY * bw + blockX) * 4;
            nr = srcCopy[bIdx];
            ng = srcCopy[bIdx + 1];
            nb = srcCopy[bIdx + 2];
            na = srcCopy[bIdx + 3];
            break;
          }
        }

        const weight = selAlpha / 255;
        data[idx] = Math.round(r + (nr - r) * weight);
        data[idx + 1] = Math.round(g + (ng - g) * weight);
        data[idx + 2] = Math.round(b + (nb - b) * weight);
        data[idx + 3] = Math.round(a + (na - a) * weight);
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const updatedUrl = canvas.toDataURL('image/png');
  primeImageCache(updatedUrl);

  return {
    ...bitmap,
    pixelWidth: bw,
    pixelHeight: bh,
    imageDataUrl: updatedUrl,
  };
}

/**
 * Converts any Vector Path, AutoShape, or Text object into a crisp `BitmapObject`
 * right on the same canvas ("Flatten Selection to Bitmap").
 */
export function rasterizeObjectToBitmap(
  obj: CanvasObject,
  renderObjectToContext: (ctx: CanvasRenderingContext2D, obj: CanvasObject) => void
): BitmapObject {
  if (obj.type === 'bitmap') {
    return obj;
  }

  const pad = Math.ceil((obj.strokeWidth || 0) + (obj.shadow?.enabled ? obj.shadow.blur + 8 : 4));
  const rx = Math.floor(obj.x - pad);
  const ry = Math.floor(obj.y - pad);
  const rw = Math.max(1, Math.ceil(obj.width + pad * 2));
  const rh = Math.max(1, Math.ceil(obj.height + pad * 2));

  const canvas = document.createElement('canvas');
  canvas.width = rw;
  canvas.height = rh;
  const ctx = canvas.getContext('2d')!;

  ctx.save();
  ctx.translate(-rx, -ry);
  renderObjectToContext(ctx, obj);
  ctx.restore();

  const dataUrl = canvas.toDataURL('image/png');
  primeImageCache(dataUrl);

  return {
    id: obj.id,
    name: `${obj.name} (Bitmap)`,
    type: 'bitmap',
    visible: obj.visible,
    locked: obj.locked,
    x: rx,
    y: ry,
    width: rw,
    height: rh,
    rotation: 0,
    opacity: obj.opacity,
    blendMode: obj.blendMode,
    fill: obj.fill,
    fillType: 'solid',
    fillGradientEnd: obj.fillGradientEnd,
    stroke: 'none',
    strokeWidth: 0,
    strokeAlign: 'center',
    pixelSnap: true,
    shadow: {
      enabled: false,
      color: '#00000088',
      blur: 8,
      offsetX: 0,
      offsetY: 4,
    },
    imageDataUrl: dataUrl,
    pixelWidth: rw,
    pixelHeight: rh,
    filters: {
      brightness: 0,
      contrast: 0,
      blur: 0,
      hueRotate: 0,
      invert: false,
      pixelate: 1,
    },
  };
}

// ============================================================================
// 5. SMART AI-STYLE BACKGROUND REMOVAL & BITMAP-TO-BEZIER VECTORIZER
// ============================================================================

/**
 * Removes background pixels from a `BitmapObject` using an edge-seeded BFS flood fill
 * from sampled corner and border reference colors, followed by a 1px boundary
 * anti-aliasing feather pass (plus a global dominant-corner fallback if framed).
 */
export async function smartRemoveBitmapBackground(
  bmp: BitmapObject,
  tolerance = 38
): Promise<{ imageDataUrl: string; removedPixels: number; pixelWidth: number; pixelHeight: number }> {
  const safeTolerance = Number.isFinite(tolerance) ? Math.max(1, Math.min(255, tolerance)) : 38;
  const { canvas, ctx, imageData } = await getBitmapImageData(bmp);
  const bw = imageData.width;
  const bh = imageData.height;
  const w = bw;
  const h = bh;
  const data = imageData.data;
  const totalPixels = w * h;

  // Sample 4 corners, 4 border midpoints, and 4 2px-inset corners (in case of a 1px stroke frame)
  const sampleCoords: Array<[number, number]> = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
    [w >> 1, 0],
    [w >> 1, h - 1],
    [0, h >> 1],
    [w - 1, h >> 1],
    [Math.min(w - 1, 2), Math.min(h - 1, 2)],
    [Math.max(0, w - 3), Math.min(h - 1, 2)],
    [Math.min(w - 1, 2), Math.max(0, h - 3)],
    [Math.max(0, w - 3), Math.max(0, h - 3)],
  ];

  const bgSamples: Array<[number, number, number]> = [];
  for (const [sx, sy] of sampleCoords) {
    const cx = Math.max(0, Math.min(w - 1, sx));
    const cy = Math.max(0, Math.min(h - 1, sy));
    const idx = (cy * w + cx) * 4;
    if (data[idx + 3] > 16) {
      bgSamples.push([data[idx], data[idx + 1], data[idx + 2]]);
    }
  }

  if (bgSamples.length === 0) {
    bgSamples.push([data[0] || 0, data[1] || 0, data[2] || 0]);
  }

  const minColorDist = (r: number, g: number, b: number): number => {
    let best = 1e9;
    for (let i = 0; i < bgSamples.length; i++) {
      const s = bgSamples[i];
      const d = Math.hypot(r - s[0], g - s[1], b - s[2]);
      if (d < best) best = d;
    }
    return best;
  };

  const threshold = Math.max(4, safeTolerance * 1.35);
  const bgMask = new Uint8Array(totalPixels);
  const visited = new Uint8Array(totalPixels);
  const queue = new Int32Array(totalPixels);
  let head = 0;
  let tail = 0;

  const trySeed = (x: number, y: number) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const pos = y * w + x;
    if (visited[pos]) return;
    const p4 = pos * 4;
    const a = data[p4 + 3];
    if (a === 0 || minColorDist(data[p4], data[p4 + 1], data[p4 + 2]) <= threshold) {
      visited[pos] = 1;
      bgMask[pos] = 1;
      queue[tail++] = pos;
    }
  };

  // Seed outer perimeter and 1px/2px inset perimeter
  for (let x = 0; x < w; x++) {
    trySeed(x, 0);
    trySeed(x, h - 1);
    if (h > 4) {
      trySeed(x, 1);
      trySeed(x, h - 2);
    }
  }
  for (let y = 0; y < h; y++) {
    trySeed(0, y);
    trySeed(w - 1, y);
    if (w > 4) {
      trySeed(1, y);
      trySeed(w - 2, y);
    }
  }

  // Edge-seeded 4-connected BFS flood fill
  while (head < tail) {
    const pos = queue[head++];
    const py = Math.floor(pos / w);
    const px = pos - py * w;

    if (px > 0) {
      const nPos = pos - 1;
      if (!visited[nPos]) {
        visited[nPos] = 1;
        const p4 = nPos * 4;
        if (data[p4 + 3] === 0 || minColorDist(data[p4], data[p4 + 1], data[p4 + 2]) <= threshold) {
          bgMask[nPos] = 1;
          queue[tail++] = nPos;
        }
      }
    }
    if (px + 1 < w) {
      const nPos = pos + 1;
      if (!visited[nPos]) {
        visited[nPos] = 1;
        const p4 = nPos * 4;
        if (data[p4 + 3] === 0 || minColorDist(data[p4], data[p4 + 1], data[p4 + 2]) <= threshold) {
          bgMask[nPos] = 1;
          queue[tail++] = nPos;
        }
      }
    }
    if (py > 0) {
      const nPos = pos - w;
      if (!visited[nPos]) {
        visited[nPos] = 1;
        const p4 = nPos * 4;
        if (data[p4 + 3] === 0 || minColorDist(data[p4], data[p4 + 1], data[p4 + 2]) <= threshold) {
          bgMask[nPos] = 1;
          queue[tail++] = nPos;
        }
      }
    }
    if (py + 1 < h) {
      const nPos = pos + w;
      if (!visited[nPos]) {
        visited[nPos] = 1;
        const p4 = nPos * 4;
        if (data[p4 + 3] === 0 || minColorDist(data[p4], data[p4 + 1], data[p4 + 2]) <= threshold) {
          bgMask[nPos] = 1;
          queue[tail++] = nPos;
        }
      }
    }
  }

  let removedPixels = 0;
  for (let i = 0; i < totalPixels; i++) {
    if (bgMask[i] === 1 && data[i * 4 + 3] > 0) {
      removedPixels++;
    }
  }

  // Fallback: if perimeter flood fill removes < 2% of pixels (e.g., solid inner frame),
  // key out the most frequent corner/border reference color globally within tolerance
  if (removedPixels < totalPixels * 0.02) {
    let bestSample = bgSamples[0];
    let bestCount = -1;
    for (const s of bgSamples) {
      let count = 0;
      const step = Math.max(1, Math.floor(totalPixels / 2500));
      for (let i = 0; i < totalPixels; i += step) {
        const p4 = i * 4;
        if (
          data[p4 + 3] > 0 &&
          Math.hypot(data[p4] - s[0], data[p4 + 1] - s[1], data[p4 + 2] - s[2]) <= tolerance
        ) {
          count++;
        }
      }
      if (count > bestCount) {
        bestCount = count;
        bestSample = s;
      }
    }

    removedPixels = 0;
    for (let i = 0; i < totalPixels; i++) {
      const p4 = i * 4;
      if (
        data[p4 + 3] > 0 &&
        Math.hypot(
          data[p4] - bestSample[0],
          data[p4 + 1] - bestSample[1],
          data[p4 + 2] - bestSample[2]
        ) <= tolerance
      ) {
        bgMask[i] = 1;
        removedPixels++;
      }
    }
  }

  // Apply background removal and 1px boundary feathering for clean anti-aliased edges
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      const pos = row + x;
      const p4 = pos * 4;
      if (bgMask[pos] === 1) {
        data[p4] = 0;
        data[p4 + 1] = 0;
        data[p4 + 2] = 0;
        data[p4 + 3] = 0;
      } else if (data[p4 + 3] > 0) {
        // Check if this foreground pixel borders a removed background pixel
        const touchesBg =
          (x > 0 && bgMask[pos - 1] === 1) ||
          (x + 1 < w && bgMask[pos + 1] === 1) ||
          (y > 0 && bgMask[pos - w] === 1) ||
          (y + 1 < h && bgMask[pos + w] === 1);
        if (touchesBg) {
          const dist = minColorDist(data[p4], data[p4 + 1], data[p4 + 2]);
          const ratio = Math.max(0.25, Math.min(0.88, dist / (threshold * 1.65)));
          data[p4 + 3] = Math.round(data[p4 + 3] * ratio);
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const imageDataUrl = canvas.toDataURL('image/png');
  primeImageCache(imageDataUrl);

  return { imageDataUrl, removedPixels, pixelWidth: bw, pixelHeight: bh };
}

/**
 * Perpendicular distance from point `p` to line segment `a -> b` for Ramer-Douglas-Peucker.
 */
function pointToSegmentDistance(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/**
 * Ramer-Douglas-Peucker polyline simplification.
 */
function rdpSimplifyPolyline(
  points: Array<{ x: number; y: number }>,
  epsilon: number
): Array<{ x: number; y: number }> {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let splitIndex = 0;
  const first = points[0];
  const last = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const d = pointToSegmentDistance(points[i], first, last);
    if (d > maxDist) {
      maxDist = d;
      splitIndex = i;
    }
  }

  if (maxDist > epsilon && splitIndex > 0) {
    const left = rdpSimplifyPolyline(points.slice(0, splitIndex + 1), epsilon);
    const right = rdpSimplifyPolyline(points.slice(splitIndex), epsilon);
    return left.slice(0, left.length - 1).concat(right);
  }

  return [first, last];
}

/**
 * Traces a bitmap selection (or foreground silhouette) using 8-connected Moore-Neighbor
 * contour tracing, simplifies via Ramer-Douglas-Peucker, and fits Catmull-Rom cubic Bezier
 * handles to create a live editable `VectorPathObject`.
 */
export async function vectorizeBitmapSelectionToBezier(
  bmp: BitmapObject,
  pixelSelection: PixelSelection,
  simplifyEpsilon = 2.2
): Promise<VectorPathObject> {
  const safeBmpW = Number.isFinite(bmp.width) && bmp.width > 0 ? bmp.width : 1;
  const safeBmpH = Number.isFinite(bmp.height) && bmp.height > 0 ? bmp.height : 1;
  const { imageData } = await getBitmapImageData(bmp);
  const bw = imageData.width;
  const bh = imageData.height;
  const w = bw;
  const h = bh;
  const data = imageData.data;
  const total = w * h;

  const fgMask = new Uint8Array(total);
  let fgCount = 0;

  // 1. Map active canvas-space pixelSelection.mask into local bitmap coordinates if available
  if (
    pixelSelection.active &&
    pixelSelection.bounds.width > 0 &&
    pixelSelection.bounds.height > 0
  ) {
    const invScaleX = safeBmpW / w;
    const invScaleY = safeBmpH / h;

    for (let by = 0; by < h; by++) {
      const cy = Math.floor(bmp.y + (by + 0.5) * invScaleY);
      const rowOffset = by * w;
      for (let bx = 0; bx < w; bx++) {
        const cx = Math.floor(bmp.x + (bx + 0.5) * invScaleX);
        if (getSelectionAlphaAtCanvas(pixelSelection, cx, cy) >= 128) {
          fgMask[rowOffset + bx] = 1;
          fgCount++;
        }
      }
    }
  }

  // 2. Fallback: if no active selection covers the bitmap, extract foreground silhouette automatically
  if (fgCount === 0) {
    const bgR = data[0];
    const bgG = data[1];
    const bgB = data[2];
    const bgA = data[3];

    for (let i = 0; i < total; i++) {
      const p4 = i * 4;
      const a = data[p4 + 3];
      if (a > 40) {
        if (bgA <= 40) {
          fgMask[i] = 1;
          fgCount++;
        } else {
          const dist = Math.hypot(data[p4] - bgR, data[p4 + 1] - bgG, data[p4 + 2] - bgB);
          if (dist > 28) {
            fgMask[i] = 1;
            fgCount++;
          }
        }
      }
    }

    // Ultimate fallback if image is completely uniform
    if (fgCount === 0) {
      const padX = Math.floor(w * 0.15);
      const padY = Math.floor(h * 0.15);
      for (let y = padY; y < h - padY; y++) {
        for (let x = padX; x < w - padX; x++) {
          fgMask[y * w + x] = 1;
          fgCount++;
        }
      }
    }
  }

  // 3. Isolate the largest 8-connected component in fgMask so stray 1px specks don't hijack tracing
  const compVisited = new Uint8Array(total);
  const queue = new Int32Array(total);
  let bestComp: number[] = [];

  for (let i = 0; i < total; i++) {
    if (fgMask[i] === 1 && !compVisited[i]) {
      const currentComp: number[] = [];
      let head = 0;
      let tail = 0;
      compVisited[i] = 1;
      queue[tail++] = i;

      while (head < tail) {
        const pos = queue[head++];
        currentComp.push(pos);
        const py = Math.floor(pos / w);
        const px = pos - py * w;

        for (let dy = -1; dy <= 1; dy++) {
          const ny = py + dy;
          if (ny < 0 || ny >= h) continue;
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = px + dx;
            if (nx < 0 || nx >= w) continue;
            const nPos = ny * w + nx;
            if (fgMask[nPos] === 1 && !compVisited[nPos]) {
              compVisited[nPos] = 1;
              queue[tail++] = nPos;
            }
          }
        }
      }

      if (currentComp.length > bestComp.length) {
        bestComp = currentComp;
      }
    }
  }

  const compMask = new Uint8Array(total);
  let minX = w - 1;
  let minY = h - 1;
  let maxX = 0;
  let maxY = 0;
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let colorSamples = 0;

  const activeIndices = bestComp.length > 0 ? bestComp : [];
  for (let i = 0; i < activeIndices.length; i++) {
    const pos = activeIndices[i];
    compMask[pos] = 1;
    const py = Math.floor(pos / w);
    const px = pos - py * w;
    if (px < minX) minX = px;
    if (px > maxX) maxX = px;
    if (py < minY) minY = py;
    if (py > maxY) maxY = py;

    const p4 = pos * 4;
    if (data[p4 + 3] > 20) {
      sumR += data[p4];
      sumG += data[p4 + 1];
      sumB += data[p4 + 2];
      colorSamples++;
    }
  }

  if (maxX < minX || maxY < minY) {
    minX = 0;
    minY = 0;
    maxX = w - 1;
    maxY = h - 1;
  }

  const avgHex =
    colorSamples > 0
      ? rgbaToHex(sumR / colorSamples, sumG / colorSamples, sumB / colorSamples)
      : '#06b6d4';

  // 4. 8-connected Moore-Neighbor boundary contour tracing with loop guard
  const mooreDx = [-1, -1, 0, 1, 1, 1, 0, -1];
  const mooreDy = [0, -1, -1, -1, 0, 1, 1, 1];
  const isInside = (x: number, y: number): boolean =>
    x >= 0 && x < w && y >= 0 && y < h && compMask[y * w + x] === 1;

  let startX = minX;
  let startY = minY;
  outerSearch: for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (isInside(x, y)) {
        startX = x;
        startY = y;
        break outerSearch;
      }
    }
  }

  const rawContour: Array<{ x: number; y: number }> = [{ x: startX, y: startY }];
  let currX = startX;
  let currY = startY;
  let backDir = 0; // Entered from West (-1, 0)
  const maxSteps = Math.max(4000, (maxX - minX + maxY - minY) * 16);
  let stepGuard = 0;

  while (stepGuard++ < maxSteps) {
    let foundNext = false;
    for (let k = 1; k <= 8; k++) {
      const dir = (backDir + k) % 8;
      const nx = currX + mooreDx[dir];
      const ny = currY + mooreDy[dir];
      if (isInside(nx, ny)) {
        const prevEmptyDir = (dir + 7) % 8;
        const emptyX = currX + mooreDx[prevEmptyDir];
        const emptyY = currY + mooreDy[prevEmptyDir];
        const offsetDx = emptyX - nx;
        const offsetDy = emptyY - ny;

        // Map (offsetDx, offsetDy) to Moore direction 0..7
        let nextBackDir = (dir + 4) % 8;
        for (let m = 0; m < 8; m++) {
          if (mooreDx[m] === offsetDx && mooreDy[m] === offsetDy) {
            nextBackDir = m;
            break;
          }
        }

        currX = nx;
        currY = ny;
        backDir = nextBackDir;
        foundNext = true;
        break;
      }
    }

    if (!foundNext) break;
    if (currX === startX && currY === startY && rawContour.length >= 4) {
      break;
    }
    rawContour.push({ x: currX, y: currY });
  }

  // Fallback to 16-angle radial hull if Moore contour is degenerate
  if (rawContour.length < 4) {
    rawContour.length = 0;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const rx = Math.max(4, (maxX - minX) / 2);
    const ry = Math.max(4, (maxY - minY) / 2);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      rawContour.push({
        x: cx + Math.cos(a) * rx,
        y: cy + Math.sin(a) * ry,
      });
    }
  }

  // 5. Simplify closed contour with Ramer-Douglas-Peucker (target 4..48 vertices)
  const simplifyClosedLoop = (
    loop: Array<{ x: number; y: number }>,
    eps: number
  ): Array<{ x: number; y: number }> => {
    if (loop.length <= 4) return loop;
    let farIdx = Math.floor(loop.length / 2);
    let maxD = -1;
    for (let i = 1; i < loop.length; i++) {
      const d = Math.hypot(loop[i].x - loop[0].x, loop[i].y - loop[0].y);
      if (d > maxD) {
        maxD = d;
        farIdx = i;
      }
    }
    const half1 = rdpSimplifyPolyline(loop.slice(0, farIdx + 1), eps);
    const half2 = rdpSimplifyPolyline(loop.slice(farIdx).concat([loop[0]]), eps);
    return half1.slice(0, half1.length - 1).concat(half2.slice(0, half2.length - 1));
  };

  let eps = Math.max(0.8, simplifyEpsilon);
  let simplified = simplifyClosedLoop(rawContour, eps);
  let iter = 0;
  while (simplified.length > 48 && iter++ < 10) {
    eps *= 1.3;
    simplified = simplifyClosedLoop(rawContour, eps);
  }
  if (simplified.length > 48) {
    const stride = simplified.length / 48;
    const capped: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < 48; i++) {
      capped.push(simplified[Math.floor(i * stride)]);
    }
    simplified = capped;
  }
  if (simplified.length < 4) {
    simplified = [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY },
    ];
  }

  // 6. Convert simplified points into normalized local BezierNode[] (0..outW, 0..outH)
  const boxPixelW = Math.max(1, maxX - minX + 1);
  const boxPixelH = Math.max(1, maxY - minY + 1);
  const outW = Math.max(16, Math.round(boxPixelW * (safeBmpW / w)));
  const outH = Math.max(16, Math.round(boxPixelH * (safeBmpH / h)));

  const localPts = simplified.map((pt) => ({
    x: Number((((pt.x - minX) / boxPixelW) * outW).toFixed(2)),
    y: Number((((pt.y - minY) / boxPixelH) * outH).toFixed(2)),
  }));

  const n = localPts.length;
  const nodes: BezierNode[] = localPts.map((curr, i) => {
    const prev = localPts[(i - 1 + n) % n];
    const next = localPts[(i + 1) % n];

    const v1x = prev.x - curr.x;
    const v1y = prev.y - curr.y;
    const v2x = next.x - curr.x;
    const v2y = next.y - curr.y;
    const len1 = Math.hypot(v1x, v1y) || 1;
    const len2 = Math.hypot(v2x, v2y) || 1;
    const cosAngle = Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / (len1 * len2)));
    const interiorDeg = (Math.acos(cosAngle) * 180) / Math.PI;

    if (interiorDeg < 120) {
      return {
        id: `trace_n_${i}`,
        x: curr.x,
        y: curr.y,
        cp1x: curr.x,
        cp1y: curr.y,
        cp2x: curr.x,
        cp2y: curr.y,
        pointType: 'corner',
      };
    }

    const tx = (next.x - prev.x) * 0.22;
    const ty = (next.y - prev.y) * 0.22;
    return {
      id: `trace_n_${i}`,
      x: curr.x,
      y: curr.y,
      cp1x: Number((curr.x - tx).toFixed(2)),
      cp1y: Number((curr.y - ty).toFixed(2)),
      cp2x: Number((curr.x + tx).toFixed(2)),
      cp2y: Number((curr.y + ty).toFixed(2)),
      pointType: 'smooth',
    };
  });

  return {
    id: 'vec-trace-' + Date.now(),
    name: bmp.name + ' (Bezier Trace)',
    type: 'vector-path',
    visible: true,
    locked: false,
    x: Math.round(bmp.x + minX * (safeBmpW / w)),
    y: Math.round(bmp.y + minY * (safeBmpH / h)),
    width: outW,
    height: outH,
    rotation: 0,
    opacity: 1,
    blendMode: 'source-over',
    fill: avgHex,
    fillType: 'solid',
    fillGradientEnd: '#ffffff',
    stroke: '#ffffff',
    strokeWidth: 2,
    strokeAlign: 'center',
    pixelSnap: true,
    shadow: {
      enabled: true,
      color: 'rgba(0,0,0,0.35)',
      blur: 10,
      offsetX: 0,
      offsetY: 4,
    },
    nodes,
    closed: true,
  };
}

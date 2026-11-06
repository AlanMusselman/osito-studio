import type {
  AutoShapeDefinition,
  BezierNode,
  CanvasObject,
  CanvasSlice,
  ComponentStateId,
  ComponentStateOverride,
} from '../types/editor';
import { DEFAULT_AUTOSHAPES, evaluateAutoShape } from './autoshapes';
import { hexToRgba, loadImageElement, rgbaToHex } from './bitmapEngine';

// ============================================================================
// 1. DEFAULT STARTER WEB SLICES
// ============================================================================

/**
 * Returns the default starter `CanvasSlice` regions aligned to the Flagship Startup Showcase Layout.
 */
export function createDefaultStarterSlices(): CanvasSlice[] {
  return [
    {
      id: 'slice-hero-card',
      name: 'hero-flagship-card',
      x: 20,
      y: 78,
      width: 532,
      height: 252,
      formats: ['webp', 'avif', 'svg'],
      scales: [1, 2, 3],
      targetObjectId: 'starter-hero-card',
    },
    {
      id: 'slice-bitmap-lab',
      name: 'bitmap-pixel-lab',
      x: 566,
      y: 78,
      width: 374,
      height: 252,
      formats: ['webp', 'avif', 'png'],
      scales: [1, 2, 3],
      targetObjectId: 'obj-bitmap-hero',
    },
    {
      id: 'slice-bento-widgets',
      name: 'autoshape-widgets-card',
      x: 328,
      y: 344,
      width: 294,
      height: 242,
      formats: ['webp', 'svg'],
      scales: [1, 2, 3],
      targetObjectId: 'obj-autoshape-star',
    },
  ];
}

// ============================================================================
// 2. INTERACTIVE COMPONENT STATE VARIANTS & LIVE CSS GENERATOR
// ============================================================================

/**
 * Brightens (`delta > 0`) or darkens (`delta < 0`) a hex color while preserving `'none'`.
 */
function adjustHexColorLuminance(color: string | undefined, delta: number): string {
  if (!color || color === 'none' || color === 'transparent') {
    return color || 'none';
  }
  if (!color.startsWith('#')) {
    return color;
  }
  const [r, g, b] = hexToRgba(color);
  if (delta >= 0) {
    return rgbaToHex(
      r + (255 - r) * delta,
      g + (255 - g) * delta,
      b + (255 - b) * delta
    );
  }
  const factor = Math.max(0, 1 + delta);
  return rgbaToHex(r * factor, g * factor, b * factor);
}

/**
 * Generates 4 smart interactive state variants (`default`, `hover`, `active`, `dark`)
 * from a `CanvasObject`'s current appearance and AutoShape parameters.
 */
export function generateSmartStateVariants(
  obj: CanvasObject
): Record<ComponentStateId, ComponentStateOverride> {
  const baseShadow = obj.shadow || {
    enabled: false,
    color: 'rgba(0, 0, 0, 0.35)',
    blur: 8,
    offsetX: 0,
    offsetY: 4,
  };

  const baseParams = obj.type === 'autoshape' ? { ...obj.params } : undefined;
  const hoverParams =
    obj.type === 'autoshape'
      ? obj.shapeDefId === 'toggle-switch'
        ? { ...obj.params, stateRatio: 0.65 }
        : { ...obj.params }
      : undefined;
  const activeParams =
    obj.type === 'autoshape'
      ? obj.shapeDefId === 'toggle-switch'
        ? { ...obj.params, stateRatio: 1.0 }
        : { ...obj.params }
      : undefined;

  return {
    default: {
      fill: obj.fill,
      fillGradientEnd: obj.fillGradientEnd,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
      opacity: obj.opacity,
      offsetY: 0,
      scale: 1,
      shadow: { ...baseShadow },
      params: baseParams,
    },
    hover: {
      fill: adjustHexColorLuminance(obj.fill, 0.14),
      fillGradientEnd: adjustHexColorLuminance(obj.fillGradientEnd, 0.14),
      stroke: obj.stroke !== 'none' ? adjustHexColorLuminance(obj.stroke, 0.18) : obj.stroke,
      strokeWidth: obj.strokeWidth,
      opacity: Math.min(1, (obj.opacity ?? 1) * 1.02),
      offsetY: 0,
      scale: 1,
      shadow: {
        enabled: true,
        color: baseShadow.color || 'rgba(6, 182, 212, 0.35)',
        blur: (baseShadow.blur ?? 8) + 6,
        offsetX: baseShadow.offsetX ?? 0,
        offsetY: baseShadow.offsetY ?? 4,
      },
      params: hoverParams,
    },
    active: {
      fill: adjustHexColorLuminance(obj.fill, -0.12),
      fillGradientEnd: adjustHexColorLuminance(obj.fillGradientEnd, -0.12),
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
      opacity: obj.opacity,
      offsetY: 0,
      scale: 1,
      shadow: {
        enabled: baseShadow.enabled,
        color: baseShadow.color || 'rgba(0, 0, 0, 0.45)',
        blur: Math.max(2, (baseShadow.blur ?? 8) - 4),
        offsetX: baseShadow.offsetX ?? 0,
        offsetY: baseShadow.offsetY ?? 4,
      },
      params: activeParams,
    },
    dark: {
      fill: '#18181b',
      fillGradientEnd: '#09090b',
      stroke: obj.fill && obj.fill !== 'none' ? obj.fill : '#38bdf8',
      strokeWidth: Math.max(1.5, obj.strokeWidth || 1.5),
      opacity: obj.opacity,
      offsetY: 0,
      scale: 1,
      shadow: {
        enabled: true,
        color: 'rgba(56, 189, 248, 0.28)',
        blur: 14,
        offsetX: 0,
        offsetY: 4,
      },
      params: baseParams,
    },
  };
}

/**
 * Returns a copy-ready CSS stylesheet block containing `.osito-${slug}`, `:hover`,
 * `:active`, and `@media (prefers-color-scheme: dark)` rules for `obj`.
 */
export function generateInteractiveStatesCssBlock(obj: CanvasObject): string {
  const slug =
    (obj.name || obj.id)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'component';

  const generated = generateSmartStateVariants(obj);
  const variants: Record<ComponentStateId, ComponentStateOverride> = {
    default: { ...generated.default, ...(obj.stateVariants?.default || {}) },
    hover: { ...generated.hover, ...(obj.stateVariants?.hover || {}) },
    active: { ...generated.active, ...(obj.stateVariants?.active || {}) },
    dark: { ...generated.dark, ...(obj.stateVariants?.dark || {}) },
  };

  const formatBg = (v: ComponentStateOverride): string => {
    const fill = v.fill ?? obj.fill;
    const gradEnd = v.fillGradientEnd ?? obj.fillGradientEnd;
    if (!fill || fill === 'none') return 'transparent';
    if (obj.fillType === 'linear-gradient' && gradEnd && gradEnd !== 'none') {
      return `linear-gradient(135deg, ${fill} 0%, ${gradEnd} 100%)`;
    }
    if (obj.fillType === 'radial-gradient' && gradEnd && gradEnd !== 'none') {
      return `radial-gradient(circle at 50% 50%, ${fill} 0%, ${gradEnd} 100%)`;
    }
    return fill;
  };

  const formatShadow = (v: ComponentStateOverride): string => {
    const sh = v.shadow ?? obj.shadow;
    if (!sh || !sh.enabled) return 'none';
    return `${Math.round(sh.offsetX || 0)}px ${Math.round(sh.offsetY || 0)}px ${Math.round(sh.blur || 0)}px ${sh.color || 'rgba(0,0,0,0.35)'}`;
  };

  const formatBorder = (v: ComponentStateOverride): string => {
    const sw = v.strokeWidth ?? obj.strokeWidth ?? 0;
    const sc = v.stroke ?? obj.stroke ?? 'none';
    if (!sw || sw <= 0 || sc === 'none') return 'none';
    return `${sw}px solid ${sc}`;
  };

  const formatTransform = (v: ComponentStateOverride): string => {
    const dy = v.offsetY ?? 0;
    const sc = v.scale ?? 1;
    return `translateY(${dy}px) scale(${sc})`;
  };

  const d = variants.default;
  const h = variants.hover;
  const a = variants.active;
  const dk = variants.dark;

  return [
    `/* Osito Interactive Component States — ${obj.name} */`,
    `.osito-${slug} {`,
    `  width: ${Math.round(obj.width)}px;`,
    `  height: ${Math.round(obj.height)}px;`,
    `  background: ${formatBg(d)};`,
    `  border: ${formatBorder(d)};`,
    `  box-shadow: ${formatShadow(d)};`,
    `  opacity: ${(d.opacity ?? obj.opacity ?? 1).toFixed(2)};`,
    `  transform: ${formatTransform(d)};`,
    `  transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1), background 180ms ease, border-color 180ms ease, box-shadow 180ms ease;`,
    `  cursor: pointer;`,
    `}`,
    ``,
    `.osito-${slug}:hover {`,
    `  background: ${formatBg(h)};`,
    `  border-color: ${h.stroke && h.stroke !== 'none' ? h.stroke : 'transparent'};`,
    `  box-shadow: ${formatShadow(h)};`,
    `  transform: ${formatTransform(h)};`,
    `}`,
    ``,
    `.osito-${slug}:active {`,
    `  background: ${formatBg(a)};`,
    `  box-shadow: ${formatShadow(a)};`,
    `  transform: ${formatTransform(a)};`,
    `}`,
    ``,
    `@media (prefers-color-scheme: dark) {`,
    `  .osito-${slug} {`,
    `    background: ${formatBg(dk)};`,
    `    border: ${formatBorder(dk)};`,
    `    box-shadow: ${formatShadow(dk)};`,
    `  }`,
    `}`,
  ].join('\n');
}

// ============================================================================
// 3. PURE-TYPESCRIPT BINARY PKZIP BUILDER (IEEE 802.3 CRC-32 + STORE METHOD 0)
// ============================================================================

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function computeCrc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Packs an array of `{ path, data }` entries into a standard PKZIP binary `Blob`
 * (`application/zip`) using Store Method `0` and IEEE 802.3 CRC-32 checksums.
 */
export function buildZipArchive(files: Array<{ path: string; data: Uint8Array }>): Blob {
  const encoder = new TextEncoder();
  const now = new Date();
  const dosTime =
    ((now.getHours() & 0x1f) << 11) |
    ((now.getMinutes() & 0x3f) << 5) |
    ((now.getSeconds() >> 1) & 0x1f);
  const dosDate =
    (((Math.max(1980, now.getFullYear()) - 1980) & 0x7f) << 9) |
    (((now.getMonth() + 1) & 0x0f) << 5) |
    (now.getDate() & 0x1f);

  interface PreparedEntry {
    nameBytes: Uint8Array;
    data: Uint8Array;
    crc: number;
    localHeaderOffset: number;
  }

  const entries: PreparedEntry[] = [];
  let localSectionSize = 0;
  let centralDirSize = 0;

  for (const file of files) {
    const cleanPath = file.path.replace(/^\/+/, '').replace(/\\/g, '/');
    const nameBytes = encoder.encode(cleanPath);
    const data = file.data;
    const crc = computeCrc32(data);

    entries.push({
      nameBytes,
      data,
      crc,
      localHeaderOffset: localSectionSize,
    });

    localSectionSize += 30 + nameBytes.length + data.byteLength;
    centralDirSize += 46 + nameBytes.length;
  }

  const totalZipSize = localSectionSize + centralDirSize + 22;
  const zipBytes = new Uint8Array(totalZipSize);
  const view = new DataView(zipBytes.buffer);
  let offset = 0;

  // 1. Write Local File Headers + File Payloads
  for (const entry of entries) {
    const { nameBytes, data, crc } = entry;
    view.setUint32(offset + 0, 0x04034b50, true); // Local file header signature
    view.setUint16(offset + 4, 20, true);         // Version needed to extract (2.0)
    view.setUint16(offset + 6, 0x0800, true);     // General purpose bit flag (UTF-8)
    view.setUint16(offset + 8, 0, true);          // Compression method (0 = Store)
    view.setUint16(offset + 10, dosTime, true);   // Last mod file time
    view.setUint16(offset + 12, dosDate, true);   // Last mod file date
    view.setUint32(offset + 14, crc, true);       // CRC-32
    view.setUint32(offset + 18, data.byteLength, true); // Compressed size
    view.setUint32(offset + 22, data.byteLength, true); // Uncompressed size
    view.setUint16(offset + 26, nameBytes.length, true); // File name length
    view.setUint16(offset + 28, 0, true);         // Extra field length
    offset += 30;

    zipBytes.set(nameBytes, offset);
    offset += nameBytes.length;

    zipBytes.set(data, offset);
    offset += data.byteLength;
  }

  const centralDirOffset = offset;

  // 2. Write Central Directory Headers
  for (const entry of entries) {
    const { nameBytes, data, crc, localHeaderOffset } = entry;
    view.setUint32(offset + 0, 0x02014b50, true); // Central directory signature
    view.setUint16(offset + 4, 20, true);         // Version made by
    view.setUint16(offset + 6, 20, true);         // Version needed to extract
    view.setUint16(offset + 8, 0x0800, true);     // General purpose bit flag (UTF-8)
    view.setUint16(offset + 10, 0, true);         // Compression method (0 = Store)
    view.setUint16(offset + 12, dosTime, true);   // Last mod file time
    view.setUint16(offset + 14, dosDate, true);   // Last mod file date
    view.setUint32(offset + 16, crc, true);       // CRC-32
    view.setUint32(offset + 20, data.byteLength, true); // Compressed size
    view.setUint32(offset + 24, data.byteLength, true); // Uncompressed size
    view.setUint16(offset + 28, nameBytes.length, true); // File name length
    view.setUint16(offset + 30, 0, true);         // Extra field length
    view.setUint16(offset + 32, 0, true);         // File comment length
    view.setUint16(offset + 34, 0, true);         // Disk number start
    view.setUint16(offset + 36, 0, true);         // Internal file attributes
    view.setUint32(offset + 38, 0, true);         // External file attributes
    view.setUint32(offset + 42, localHeaderOffset, true); // Relative offset of local header
    offset += 46;

    zipBytes.set(nameBytes, offset);
    offset += nameBytes.length;
  }

  // 3. Write End of Central Directory Record (EOCD)
  view.setUint32(offset + 0, 0x06054b50, true);   // EOCD signature
  view.setUint16(offset + 4, 0, true);            // Number of this disk
  view.setUint16(offset + 6, 0, true);            // Disk where central directory starts
  view.setUint16(offset + 8, entries.length, true);  // Entries on this disk
  view.setUint16(offset + 10, entries.length, true); // Total entries in central directory
  view.setUint32(offset + 12, centralDirSize, true); // Size of central directory
  view.setUint32(offset + 16, centralDirOffset, true); // Offset of central directory
  view.setUint16(offset + 20, 0, true);           // ZIP file comment length

  return new Blob([zipBytes.buffer as ArrayBuffer], { type: 'application/zip' });
}

// ============================================================================
// 4. MULTI-SCALE RETINA SLICE EXPORTER (.WEBP / .AVIF / .SVG / .PNG -> .ZIP)
// ============================================================================

function bezierNodesToSvgPathD(
  nodes: BezierNode[],
  closed: boolean,
  offsetX = 0,
  offsetY = 0
): string {
  if (!nodes || nodes.length === 0) return '';
  const parts: string[] = [];
  const first = nodes[0];
  parts.push(`M ${(first.x + offsetX).toFixed(2)} ${(first.y + offsetY).toFixed(2)}`);

  for (let i = 0; i < nodes.length; i++) {
    const curr = nodes[i];
    const next = nodes[(i + 1) % nodes.length];
    if (!closed && i === nodes.length - 1) break;

    const c1x = (curr.cp2x + offsetX).toFixed(2);
    const c1y = (curr.cp2y + offsetY).toFixed(2);
    const c2x = (next.cp1x + offsetX).toFixed(2);
    const c2y = (next.cp1y + offsetY).toFixed(2);
    const nx = (next.x + offsetX).toFixed(2);
    const ny = (next.y + offsetY).toFixed(2);

    parts.push(`C ${c1x} ${c1y}, ${c2x} ${c2y}, ${nx} ${ny}`);
  }

  if (closed) {
    parts.push('Z');
  }
  return parts.join(' ');
}

function escapeXml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Generates clean vector SVG markup for a single `CanvasSlice` region.
 */
export function buildSliceSvgMarkup(
  slice: CanvasSlice,
  objects: CanvasObject[],
  autoShapes: AutoShapeDefinition[]
): string {
  const defs: string[] = [];
  const body: string[] = [];
  const sx = Math.round(Number.isFinite(slice.x) ? slice.x : 0);
  const sy = Math.round(Number.isFinite(slice.y) ? slice.y : 0);
  const sw = Math.max(1, Math.round(Number.isFinite(slice.width) ? slice.width : 1));
  const sh = Math.max(1, Math.round(Number.isFinite(slice.height) ? slice.height : 1));

  const intersectsSlice = (obj: CanvasObject): boolean => {
    const pad = (obj.strokeWidth || 0) + 16;
    return !(
      obj.x + obj.width + pad < sx ||
      obj.x - pad > sx + sw ||
      obj.y + obj.height + pad < sy ||
      obj.y - pad > sy + sh
    );
  };

  for (const obj of objects) {
    if (!obj.visible || !intersectsSlice(obj)) continue;

    const hasFill =
      Boolean(obj.fill) &&
      obj.fill !== 'none' &&
      obj.fill !== 'transparent' &&
      obj.fillType !== 'none';
    let fillAttr = hasFill ? escapeXml(obj.fill) : 'none';
    if (
      hasFill &&
      (obj.fillType === 'linear-gradient' || obj.fillType === 'radial-gradient') &&
      obj.fillGradientEnd &&
      obj.fillGradientEnd !== 'none'
    ) {
      const gradId = `grad_${obj.id.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      if (obj.fillType === 'linear-gradient') {
        defs.push(
          `    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">` +
            `<stop offset="0%" stop-color="${escapeXml(obj.fill)}" />` +
            `<stop offset="100%" stop-color="${escapeXml(obj.fillGradientEnd)}" />` +
            `</linearGradient>`
        );
      } else {
        defs.push(
          `    <radialGradient id="${gradId}" cx="50%" cy="50%" r="50%">` +
            `<stop offset="0%" stop-color="${escapeXml(obj.fill)}" />` +
            `<stop offset="100%" stop-color="${escapeXml(obj.fillGradientEnd)}" />` +
            `</radialGradient>`
        );
      }
      fillAttr = `url(#${gradId})`;
    }

    const strokeAttr =
      obj.stroke && obj.stroke !== 'none' && obj.strokeWidth > 0
        ? ` stroke="${escapeXml(obj.stroke)}" stroke-width="${obj.strokeWidth}"`
        : '';
    const opacityAttr =
      obj.opacity !== undefined && obj.opacity < 1 ? ` opacity="${obj.opacity.toFixed(2)}"` : '';
    const rotCx = (obj.x + (obj.width || 0) / 2).toFixed(1);
    const rotCy = (obj.y + (obj.height || 0) / 2).toFixed(1);
    const transformAttr =
      obj.rotation && Number.isFinite(obj.rotation)
        ? ` transform="rotate(${obj.rotation} ${rotCx} ${rotCy})"`
        : '';

    if (obj.type === 'vector-path') {
      const d = bezierNodesToSvgPathD(obj.nodes, obj.closed, obj.x, obj.y);
      if (d) {
        body.push(
          `  <path d="${d}" fill="${fillAttr}"${strokeAttr}${opacityAttr}${transformAttr} />`
        );
      }
      if (obj.connectorMeta && obj.nodes.length >= 2) {
        const arrowColor = escapeXml(
          obj.stroke && obj.stroke !== 'none' ? obj.stroke : '#38bdf8'
        );
        const headLen = Math.max(9, (obj.strokeWidth || 2) * 4.2);
        const buildArrowPolygon = (
          tipX: number,
          tipY: number,
          refX: number,
          refY: number
        ): string | null => {
          const dx = tipX - refX;
          const dy = tipY - refY;
          if (Math.hypot(dx, dy) < 0.01) return null;
          const angle = Math.atan2(dy, dx);
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const rotPt = (lx: number, ly: number) => ({
            x: (tipX + lx * cos - ly * sin).toFixed(2),
            y: (tipY + lx * sin + ly * cos).toFixed(2),
          });
          const p0 = rotPt(0, 0);
          const p1 = rotPt(-headLen, -headLen * 0.54);
          const p2 = rotPt(-headLen * 0.8, 0);
          const p3 = rotPt(-headLen, headLen * 0.54);
          return `  <polygon points="${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}" fill="${arrowColor}"${opacityAttr} />`;
        };

        if (obj.connectorMeta.endArrow !== false) {
          const last = obj.nodes[obj.nodes.length - 1];
          const prev = obj.nodes[obj.nodes.length - 2];
          const hasTan = Math.hypot(last.x - last.cp1x, last.y - last.cp1y) > 1;
          const refX = (hasTan ? last.cp1x : prev.x) + obj.x;
          const refY = (hasTan ? last.cp1y : prev.y) + obj.y;
          const poly = buildArrowPolygon(last.x + obj.x, last.y + obj.y, refX, refY);
          if (poly) body.push(poly);
        }
        if (obj.connectorMeta.startArrow) {
          const first = obj.nodes[0];
          const second = obj.nodes[1];
          const hasTan = Math.hypot(first.x - first.cp2x, first.y - first.cp2y) > 1;
          const refX = (hasTan ? first.cp2x : second.x) + obj.x;
          const refY = (hasTan ? first.cp2y : second.y) + obj.y;
          const poly = buildArrowPolygon(first.x + obj.x, first.y + obj.y, refX, refY);
          if (poly) body.push(poly);
        }
        if (obj.connectorMeta.label && obj.connectorMeta.label.trim().length > 0) {
          const midIdx = Math.floor(obj.nodes.length / 2);
          const nA = obj.nodes[Math.max(0, midIdx - 1)];
          const nB = obj.nodes[midIdx];
          const midX = obj.x + (nA.x + nB.x) / 2;
          const midY = obj.y + (nA.y + nB.y) / 2;
          const lbl = obj.connectorMeta.label.trim();
          const tw = Math.max(28, lbl.length * 6.2 + 12);
          const th = 18;
          body.push(
            `  <rect x="${Math.round(midX - tw / 2)}" y="${Math.round(midY - th / 2)}" width="${Math.round(tw)}" height="${th}" fill="#111111" stroke="${arrowColor}" stroke-width="1.25" />`,
            `  <text x="${Math.round(midX)}" y="${Math.round(midY + 3.5)}" fill="#ffffff" font-family="JetBrains Mono, monospace" font-size="10" font-weight="600" text-anchor="middle">${escapeXml(lbl)}</text>`
          );
        }
      }
    } else if (obj.type === 'autoshape') {
      const shapeDef =
        autoShapes.find((d) => d.id === obj.shapeDefId) ||
        DEFAULT_AUTOSHAPES.find((d) => d.id === obj.shapeDefId) ||
        DEFAULT_AUTOSHAPES[0];
      const evaluated = evaluateAutoShape(
        shapeDef,
        Math.max(1, obj.width || 1),
        Math.max(1, obj.height || 1),
        obj.params,
        obj.customCode
      );
      const subDs = evaluated.paths
        .map((p) => bezierNodesToSvgPathD(p.nodes, p.closed, obj.x, obj.y))
        .filter(Boolean);
      if (subDs.length > 0) {
        body.push(
          `  <path d="${subDs.join(' ')}" fill="${fillAttr}" fill-rule="evenodd"${strokeAttr}${opacityAttr}${transformAttr} />`
        );
      }
    } else if (obj.type === 'text') {
      const fontSize = obj.fontSize || 16;
      const lineHeight = Math.round(fontSize * 1.3);
      const align = obj.textAlign || 'left';
      const tx =
        align === 'center'
          ? Math.round(obj.x + (obj.width || 0) / 2)
          : align === 'right'
          ? Math.round(obj.x + (obj.width || 0))
          : Math.round(obj.x);
      const anchorAttr =
        align === 'center'
          ? ' text-anchor="middle"'
          : align === 'right'
          ? ' text-anchor="end"'
          : '';
      const letterSpacingAttr =
        typeof obj.letterSpacing === 'number' && obj.letterSpacing !== 0
          ? ` letter-spacing="${obj.letterSpacing}px"`
          : '';
      const textFill =
        fillAttr !== 'none' ? fillAttr : escapeXml(obj.fill || '#f8fafc');
      const rawLines = (obj.text || '').split('\n');
      const totalTextH = rawLines.length * lineHeight;
      const topOffset =
        align === 'center' && (obj.height || 0) > totalTextH
          ? Math.round(((obj.height || 0) - totalTextH) / 2)
          : 0;
      const baseTy = Math.round(obj.y + topOffset + fontSize * 0.85);

      if (rawLines.length <= 1) {
        body.push(
          `  <text x="${tx}" y="${baseTy}" fill="${textFill}" font-family="${escapeXml(obj.fontFamily || 'Inter')}, sans-serif" font-size="${fontSize}" font-weight="${obj.fontWeight || '600'}"${anchorAttr}${letterSpacingAttr}${strokeAttr}${opacityAttr}${transformAttr}>${escapeXml(obj.text || '')}</text>`
        );
      } else {
        const tspans = rawLines
          .map(
            (line, idx) =>
              `<tspan x="${tx}" y="${baseTy + idx * lineHeight}">${escapeXml(line)}</tspan>`
          )
          .join('');
        body.push(
          `  <text x="${tx}" y="${baseTy}" fill="${textFill}" font-family="${escapeXml(obj.fontFamily || 'Inter')}, sans-serif" font-size="${fontSize}" font-weight="${obj.fontWeight || '600'}"${anchorAttr}${letterSpacingAttr}${strokeAttr}${opacityAttr}${transformAttr}>${tspans}</text>`
        );
      }
    } else if (obj.type === 'bitmap' && obj.imageDataUrl) {
      body.push(
        `  <image x="${Math.round(obj.x)}" y="${Math.round(obj.y)}" width="${Math.max(1, Math.round(obj.width || 1))}" height="${Math.max(1, Math.round(obj.height || 1))}" href="${obj.imageDataUrl}" preserveAspectRatio="none"${opacityAttr}${transformAttr} />`
      );
    }
  }

  const defsBlock = defs.length > 0 ? `  <defs>\n${defs.join('\n')}\n  </defs>\n` : '';
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${sw}" height="${sh}" viewBox="${sx} ${sy} ${sw} ${sh}">`,
    defsBlock + body.join('\n'),
    `</svg>`,
  ].join('\n');
}

async function encodeCanvasToBytes(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number
): Promise<Uint8Array | null> {
  return new Promise<Uint8Array | null>((resolve) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          blob
            .arrayBuffer()
            .then((buf) => resolve(new Uint8Array(buf)))
            .catch(() => resolve(null));
        },
        mimeType,
        quality
      );
    } catch {
      resolve(null);
    }
  });
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  if (!dataUrl || typeof dataUrl !== 'string') return new Uint8Array(0);
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx < 0) return new Uint8Array(0);
  const base64 = dataUrl.slice(commaIdx + 1);
  try {
    const binStr = atob(base64);
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      bytes[i] = binStr.charCodeAt(i);
    }
    return bytes;
  } catch {
    return new Uint8Array(0);
  }
}

/**
 * Renders every `CanvasSlice` at `@1x`, `@2x`, and `@3x` Retina scales across
 * `.webp`, `.avif`, `.svg`, and `.png` formats and bundles them with a `slices-manifest.json`
 * into a downloadable binary `.zip` archive (`osito-retina-slices-bundle.zip`).
 */
export async function exportSlicesToMultiScaleZip(params: {
  slices: CanvasSlice[];
  objects: CanvasObject[];
  autoShapes: AutoShapeDefinition[];
  renderObjectToCtx: (
    ctx: CanvasRenderingContext2D,
    obj: CanvasObject,
    autoShapes: AutoShapeDefinition[]
  ) => void;
}): Promise<{ blob: Blob; filename: string; fileCount: number }> {
  const { slices, objects, autoShapes, renderObjectToCtx } = params;
  const encoder = new TextEncoder();
  const files: Array<{ path: string; data: Uint8Array }> = [];

  // Preload all bitmap images so offscreen synchronous canvas rendering never misses a frame
  for (const obj of objects) {
    if (obj.type === 'bitmap' && obj.visible && obj.imageDataUrl) {
      try {
        await loadImageElement(obj.imageDataUrl);
      } catch {
        // Ignore broken data URLs
      }
    }
  }

  const activeSlices = slices.length > 0 ? slices : createDefaultStarterSlices();
  const manifestEntries: Array<{
    id: string;
    name: string;
    bounds: { x: number; y: number; width: number; height: number };
    assets: Array<{ path: string; format: string; scale: number; width: number; height: number; bytes: number }>;
  }> = [];

  for (const slice of activeSlices) {
    const folder =
      (slice.name || slice.id)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'slice';

    const sliceAssets: Array<{
      path: string;
      format: string;
      scale: number;
      width: number;
      height: number;
      bytes: number;
    }> = [];

    const safeSliceX = Math.round(Number.isFinite(slice.x) ? slice.x : 0);
    const safeSliceY = Math.round(Number.isFinite(slice.y) ? slice.y : 0);
    const safeSliceW = Math.max(1, Math.round(Number.isFinite(slice.width) ? slice.width : 1));
    const safeSliceH = Math.max(1, Math.round(Number.isFinite(slice.height) ? slice.height : 1));

    const scales: Array<1 | 2 | 3> =
      slice.scales && slice.scales.length > 0 ? slice.scales : [1, 2, 3];
    const formats =
      slice.formats && slice.formats.length > 0
        ? slice.formats
        : (['webp', 'avif', 'svg'] as Array<'webp' | 'avif' | 'svg' | 'png'>);

    const rasterFormats = formats.filter((f) => f === 'webp' || f === 'avif' || f === 'png');

    if (rasterFormats.length > 0) {
      for (const scale of scales) {
        const outW = Math.max(1, Math.round(safeSliceW * scale));
        const outH = Math.max(1, Math.round(safeSliceH * scale));
        const canvas = document.createElement('canvas');
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext('2d')!;

        ctx.save();
        ctx.scale(scale, scale);
        ctx.translate(-safeSliceX, -safeSliceY);

        for (const obj of objects) {
          if (!obj.visible) continue;
          ctx.save();
          renderObjectToCtx(ctx, obj, autoShapes);
          ctx.restore();
        }
        ctx.restore();

        const webpBytes =
          (await encodeCanvasToBytes(canvas, 'image/webp', 0.92)) ??
          dataUrlToUint8Array(canvas.toDataURL('image/png'));

        for (const fmt of rasterFormats) {
          let payload: Uint8Array = webpBytes;
          if (fmt === 'avif') {
            const avifBytes = await encodeCanvasToBytes(canvas, 'image/avif', 0.9);
            payload = avifBytes && avifBytes.byteLength > 0 ? avifBytes : webpBytes;
          } else if (fmt === 'png') {
            payload =
              (await encodeCanvasToBytes(canvas, 'image/png')) ??
              dataUrlToUint8Array(canvas.toDataURL('image/png'));
          }

          const assetPath = `${folder}/${folder}@${scale}x.${fmt}`;
          files.push({ path: assetPath, data: payload });
          sliceAssets.push({
            path: assetPath,
            format: fmt,
            scale,
            width: outW,
            height: outH,
            bytes: payload.byteLength,
          });
        }
      }
    }

    if (formats.includes('svg')) {
      const svgMarkup = buildSliceSvgMarkup(
        { ...slice, x: safeSliceX, y: safeSliceY, width: safeSliceW, height: safeSliceH },
        objects,
        autoShapes
      );
      const svgBytes = encoder.encode(svgMarkup);
      const svgPath = `${folder}/${folder}.svg`;
      files.push({ path: svgPath, data: svgBytes });
      sliceAssets.push({
        path: svgPath,
        format: 'svg',
        scale: 1,
        width: safeSliceW,
        height: safeSliceH,
        bytes: svgBytes.byteLength,
      });
    }

    manifestEntries.push({
      id: slice.id,
      name: folder,
      bounds: {
        x: safeSliceX,
        y: safeSliceY,
        width: safeSliceW,
        height: safeSliceH,
      },
      assets: sliceAssets,
    });
  }

  const manifestJson = JSON.stringify(
    {
      generator: 'Osito Multi-Scale Retina Slice Engine',
      generatedAt: new Date().toISOString(),
      sliceCount: manifestEntries.length,
      totalFiles: files.length + 1,
      slices: manifestEntries,
    },
    null,
    2
  );
  files.push({
    path: 'slices-manifest.json',
    data: encoder.encode(manifestJson),
  });

  const blob = buildZipArchive(files);
  return {
    blob,
    filename: 'osito-retina-slices-bundle.zip',
    fileCount: files.length,
  };
}

// ============================================================================
// 5. FULL VITE + REACT + TAILWIND APP REPOSITORY EXPORTER (.ZIP)
// ============================================================================

export interface ExportReactTailwindAppParams {
  objects: CanvasObject[];
  slices: CanvasSlice[];
  autoShapes: AutoShapeDefinition[];
  canvasWidth: number;
  canvasHeight: number;
  canvasBgColor?: string;
}

/**
 * Exports any Osito canvas layout into a complete, runnable Vite + React 19 + TypeScript + Tailwind CSS
 * application repository (`.zip`), complete with:
 * - Interactive `<InteractiveNavbar />` with non-overlapping Level-1 & Level-2 cascading menus
 * - Interactive `<CanvasStage />` with live React state for buttons, AutoShape widgets, and hover/active variants
 * - Extracted W3C Design Tokens (`src/data/designTokens.json`) & Tailwind theme configuration
 * - Master vector SVG & Retina slice SVG assets (`public/assets/...`)
 * - Zero-server `preview-standalone.html` for instant double-click browser preview
 */
export async function exportFullReactTailwindAppZip(
  params: ExportReactTailwindAppParams
): Promise<{ blob: Blob; filename: string; fileCount: number }> {
  const {
    objects,
    slices,
    autoShapes,
    canvasWidth = 960,
    canvasHeight = 600,
    canvasBgColor = '#0b0f19',
  } = params;

  const encoder = new TextEncoder();
  const files: Array<{ path: string; data: Uint8Array }> = [];
  const addTextFile = (path: string, content: string) => {
    files.push({ path, data: encoder.encode(content) });
  };

  const visibleObjects = objects.filter((o) => o.visible);

  // 1. Detect Navbar & Extract Brand Name + Nested Menu Trees
  const navbarObj = visibleObjects.find(
    (o) =>
      Boolean(o.params?.hasNestedMenu) ||
      o.id.startsWith('starter-navbar-surface') ||
      o.id.startsWith('web-navbar-surface-') ||
      o.id.startsWith('dr-navbar-surface-') ||
      (o.type === 'autoshape' && o.shapeDefId === 'layout-sticky-navbar')
  );

  const brandTextObj = visibleObjects.find(
    (o) =>
      o.type === 'text' &&
      (o.id.includes('brand') ||
        o.name.toLowerCase().includes('brand') ||
        o.name.toLowerCase().includes('wordmark'))
  );
  const brandName =
    (brandTextObj && brandTextObj.type === 'text' ? brandTextObj.text.trim() : '') ||
    'OSITO STUDIO';
  const projectSlug =
    brandName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'osito-web-app';

  const defaultTopMenus = ['Products ▾', 'Solutions ▾', 'Developers ▾', 'Pricing ▾'];
  const defaultLevel1: Record<number, string[]> = {
    0: [
      'AI Vector & Pixel Studio ▸',
      'Programmable JS AutoShapes ▸',
      'Lucid Sitemap & Flow Engine ▸',
      'Multi-Scale Retina .ZIP',
    ],
    1: [
      'Design Systems & Tokens ▸',
      'Interactive Web Prototyping ▸',
      'SaaS Landing Page Builder ▸',
      'Enterprise Team Workflows',
    ],
    2: [
      'JSF Plugin SDK & API ▸',
      'React + Tailwind Codegen ▸',
      'SVG & Bezier Path Engine ▸',
      'W3C Design Token JSON',
    ],
    3: [
      'Starter Free Tier ▸',
      'Pro Studio ($19/mo) ▸',
      'Team Cloud Bundle ▸',
      'Enterprise Custom SLA',
    ],
  };
  const defaultLevel2: Record<number, string[]> = {
    0: [
      '• Cubic Bezier Pen (P)',
      '• Magic Wand & Alpha Cut',
      '• One-Click Vectorizer',
      '• 400% 1px Pixel Loupe',
    ],
    1: [
      '• 125+ Smart AutoShapes',
      '• Diamond Control Handles',
      '• Live Preview Widgets',
      '• Custom .JSF Code Studio',
    ],
    2: [
      '• N/E/S/W Magnetic Ports',
      '• Orthogonal Elbow Routing',
      '• CSV / Markdown Import',
      '• Auto-Branching Sitemaps',
    ],
    3: [
      '• @1x / @2x / @3x Export',
      '• WebP + AVIF + Inline SVG',
      '• WCAG 2.2 Contrast Audit',
      '• One-Click AI Studio Ship',
    ],
  };

  let topMenus = defaultTopMenus;
  let level1Menus = defaultLevel1;
  let level2Submenus = defaultLevel2;

  if (navbarObj?.params) {
    if (
      typeof navbarObj.params.customTopMenus === 'string' &&
      navbarObj.params.customTopMenus.trim()
    ) {
      const parsed = navbarObj.params.customTopMenus
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean);
      if (parsed.length > 0) topMenus = parsed.slice(0, 4);
    }
    if (typeof navbarObj.params.customLevel1Menus === 'string') {
      try {
        const parsedL1 = JSON.parse(navbarObj.params.customLevel1Menus);
        if (parsedL1 && typeof parsedL1 === 'object') level1Menus = parsedL1;
      } catch {
        // Keep default Level-1 menus
      }
    }
    if (typeof navbarObj.params.customLevel2Menus === 'string') {
      try {
        const parsedL2 = JSON.parse(navbarObj.params.customLevel2Menus);
        if (parsedL2 && typeof parsedL2 === 'object') level2Submenus = parsedL2;
      } catch {
        // Keep default Level-2 menus
      }
    }
  }

  // 2. Extract Document Color Palette & Design Tokens
  const colorCounts = new Map<string, number>();
  for (const obj of visibleObjects) {
    if (obj.type !== 'bitmap' && obj.fill && obj.fill.startsWith('#')) {
      const k = obj.fill.toLowerCase();
      colorCounts.set(k, (colorCounts.get(k) || 0) + 2);
    }
    if (obj.fillGradientEnd && obj.fillGradientEnd.startsWith('#')) {
      const k = obj.fillGradientEnd.toLowerCase();
      colorCounts.set(k, (colorCounts.get(k) || 0) + 1);
    }
    if (obj.stroke && obj.stroke.startsWith('#') && obj.strokeWidth > 0) {
      const k = obj.stroke.toLowerCase();
      colorCounts.set(k, (colorCounts.get(k) || 0) + 1);
    }
  }
  const sortedColors = Array.from(colorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([hex]) => hex);

  const primaryColor = navbarObj?.stroke?.startsWith('#')
    ? navbarObj.stroke
    : sortedColors[0] || '#06b6d4';
  const secondaryColor = sortedColors[1] || '#6366f1';
  const accentColor = sortedColors[2] || '#38bdf8';
  const surfaceColor = navbarObj?.fill?.startsWith('#') ? navbarObj.fill : '#111827';

  // 3. Build Master Vector SVG & Slice SVGs
  const fullCanvasSlice: CanvasSlice = {
    id: 'canvas-master',
    name: 'canvas-master',
    x: 0,
    y: 0,
    width: canvasWidth,
    height: canvasHeight,
    formats: ['svg'],
    scales: [1],
  };
  const masterSvgMarkup = buildSliceSvgMarkup(fullCanvasSlice, visibleObjects, autoShapes);
  addTextFile('public/assets/canvas-master.svg', masterSvgMarkup);

  const activeSlices = slices.length > 0 ? slices : createDefaultStarterSlices();
  for (const s of activeSlices) {
    const slug =
      (s.name || s.id)
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'slice';
    const sliceSvg = buildSliceSvgMarkup(s, visibleObjects, autoShapes);
    addTextFile(`public/assets/slices/${slug}.svg`, sliceSvg);
  }

  // 4. Prepare Serialized Layer Data (with pre-computed SVG path `d` for vector/autoshape layers)
  const navbarMaxY = navbarObj ? navbarObj.y + navbarObj.height + 6 : 68;
  const serializedLayers = visibleObjects.map((obj) => {
    let svgPathD = '';
    if (obj.type === 'vector-path') {
      svgPathD = bezierNodesToSvgPathD(obj.nodes, obj.closed, 0, 0);
    } else if (obj.type === 'autoshape') {
      const shapeDef =
        autoShapes.find((d) => d.id === obj.shapeDefId) ||
        DEFAULT_AUTOSHAPES.find((d) => d.id === obj.shapeDefId) ||
        DEFAULT_AUTOSHAPES[0];
      const evaluated = evaluateAutoShape(
        shapeDef,
        Math.max(1, obj.width || 1),
        Math.max(1, obj.height || 1),
        obj.params,
        obj.customCode
      );
      svgPathD = evaluated.paths
        .map((p) => bezierNodesToSvgPathD(p.nodes, p.closed, 0, 0))
        .filter(Boolean)
        .join(' ');
    }
    return {
      id: obj.id,
      name: obj.name,
      type: obj.type,
      x: Math.round(obj.x),
      y: Math.round(obj.y),
      width: Math.max(1, Math.round(obj.width)),
      height: Math.max(1, Math.round(obj.height)),
      rotation: obj.rotation || 0,
      opacity: obj.opacity ?? 1,
      fill: obj.fill,
      fillType: obj.fillType,
      fillGradientEnd: obj.fillGradientEnd,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
      shadow: obj.shadow,
      stateVariants: obj.stateVariants,
      params: obj.params,
      text: obj.type === 'text' ? obj.text : undefined,
      fontFamily: obj.type === 'text' ? obj.fontFamily : undefined,
      fontSize: obj.type === 'text' ? obj.fontSize : undefined,
      fontWeight: obj.type === 'text' ? obj.fontWeight : undefined,
      textAlign: obj.type === 'text' ? obj.textAlign : undefined,
      letterSpacing: obj.type === 'text' ? obj.letterSpacing : undefined,
      imageDataUrl: obj.type === 'bitmap' ? obj.imageDataUrl : undefined,
      shapeDefId: obj.type === 'autoshape' ? obj.shapeDefId : undefined,
      svgPathD,
      isBelowNavbar: obj.y >= navbarMaxY - 4,
      isStaticNavbarChild:
        Boolean(navbarObj) &&
        (obj.id.startsWith('starter-nav-btn-') || obj.id.startsWith('web-navbar-item-')),
    };
  });

  // 5. Write `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`
  addTextFile(
    'package.json',
    JSON.stringify(
      {
        name: projectSlug,
        private: true,
        version: '1.0.0',
        type: 'module',
        description: `${brandName} — Exported from Osito Hybrid Vector, Pixel & Web Studio`,
        scripts: {
          dev: 'vite',
          build: 'tsc -b && vite build',
          preview: 'vite preview',
        },
        dependencies: {
          'lucide-react': '^0.468.0',
          react: '^19.0.0',
          'react-dom': '^19.0.0',
        },
        devDependencies: {
          '@types/react': '^19.0.0',
          '@types/react-dom': '^19.0.0',
          '@vitejs/plugin-react': '^4.3.4',
          autoprefixer: '^10.4.20',
          postcss: '^8.4.49',
          tailwindcss: '^3.4.17',
          typescript: '~5.6.2',
          vite: '^6.0.5',
        },
      },
      null,
      2
    )
  );

  addTextFile(
    'vite.config.ts',
    [
      `import { defineConfig } from 'vite';`,
      `import react from '@vitejs/plugin-react';`,
      ``,
      `export default defineConfig({`,
      `  plugins: [react()],`,
      `  server: { port: 3000, open: true },`,
      `});`,
      ``,
    ].join('\n')
  );

  addTextFile(
    'tsconfig.json',
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          isolatedModules: true,
          moduleDetection: 'force',
          noEmit: true,
          jsx: 'react-jsx',
          strict: true,
        },
        include: ['src'],
      },
      null,
      2
    )
  );

  addTextFile(
    'postcss.config.js',
    `export default {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n};\n`
  );

  addTextFile(
    'tailwind.config.js',
    [
      `/** @type {import('tailwindcss').Config} */`,
      `export default {`,
      `  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],`,
      `  theme: {`,
      `    extend: {`,
      `      colors: {`,
      `        brand: {`,
      `          primary: '${primaryColor}',`,
      `          secondary: '${secondaryColor}',`,
      `          accent: '${accentColor}',`,
      `          surface: '${surfaceColor}',`,
      `          canvas: '${canvasBgColor}',`,
      `        },`,
      `      },`,
      `      fontFamily: {`,
      `        sans: ['Inter', 'system-ui', 'sans-serif'],`,
      `        display: ['Space Grotesk', 'Inter', 'sans-serif'],`,
      `        mono: ['JetBrains Mono', 'monospace'],`,
      `      },`,
      `    },`,
      `  },`,
      `  plugins: [],`,
      `};`,
      ``,
    ].join('\n')
  );

  addTextFile(
    'index.html',
    [
      `<!DOCTYPE html>`,
      `<html lang="en" class="dark">`,
      `  <head>`,
      `    <meta charset="UTF-8" />`,
      `    <meta name="viewport" content="width=device-width, initial-scale=1.0" />`,
      `    <title>${escapeXml(brandName)} — Interactive Web Experience</title>`,
      `    <link rel="preconnect" href="https://fonts.googleapis.com" />`,
      `    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />`,
      `    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />`,
      `  </head>`,
      `  <body class="bg-[#070a12] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-white">`,
      `    <div id="root"></div>`,
      `    <script type="module" src="/src/main.tsx"></script>`,
      `  </body>`,
      `</html>`,
      ``,
    ].join('\n')
  );

  // 6. Write `src/data/designTokens.json` and `src/data/canvasScene.json`
  addTextFile(
    'src/data/designTokens.json',
    JSON.stringify(
      {
        $schema: 'https://tr.designtokens.org/format/',
        meta: {
          brandName,
          exportedFrom: 'Osito Hybrid Vector, Pixel & Web Studio',
          exportedAt: new Date().toISOString(),
          canvasDimensions: { width: canvasWidth, height: canvasHeight },
        },
        color: {
          primary: { $value: primaryColor, $type: 'color' },
          secondary: { $value: secondaryColor, $type: 'color' },
          accent: { $value: accentColor, $type: 'color' },
          surface: { $value: surfaceColor, $type: 'color' },
          canvasBackground: { $value: canvasBgColor, $type: 'color' },
          documentPalette: sortedColors,
        },
        navigation: {
          topMenus,
          level1Menus,
          level2Submenus,
        },
      },
      null,
      2
    )
  );

  addTextFile(
    'src/data/canvasScene.json',
    JSON.stringify(
      {
        brandName,
        canvasWidth,
        canvasHeight,
        canvasBgColor,
        hasNavbar: Boolean(navbarObj),
        navbarBounds: navbarObj
          ? {
              x: Math.round(navbarObj.x),
              y: Math.round(navbarObj.y),
              width: Math.round(navbarObj.width),
              height: Math.round(navbarObj.height),
            }
          : { x: 20, y: 14, width: canvasWidth - 40, height: 52 },
        topMenus,
        level1Menus,
        level2Submenus,
        layers: serializedLayers,
      },
      null,
      2
    )
  );

  // 7. Write `src/index.css` & `src/main.tsx`
  addTextFile(
    'src/index.css',
    [
      `@tailwind base;`,
      `@tailwind components;`,
      `@tailwind utilities;`,
      ``,
      `:root {`,
      `  --osito-primary: ${primaryColor};`,
      `  --osito-secondary: ${secondaryColor};`,
      `  --osito-accent: ${accentColor};`,
      `  --osito-surface: ${surfaceColor};`,
      `  --osito-canvas-bg: ${canvasBgColor};`,
      `}`,
      ``,
      `body {`,
      `  margin: 0;`,
      `  font-family: 'Inter', system-ui, -apple-system, sans-serif;`,
      `  background-color: #070a12;`,
      `  color: #f8fafc;`,
      `}`,
      ``,
    ].join('\n')
  );

  addTextFile(
    'src/main.tsx',
    [
      `import React from 'react';`,
      `import ReactDOM from 'react-dom/client';`,
      `import App from './App';`,
      `import './index.css';`,
      ``,
      `ReactDOM.createRoot(document.getElementById('root')!).render(`,
      `  <React.StrictMode>`,
      `    <App />`,
      `  </React.StrictMode>`,
      `);`,
      ``,
    ].join('\n')
  );

  // 8. Write `src/components/InteractiveNavbar.tsx`
  addTextFile(
    'src/components/InteractiveNavbar.tsx',
    [
      `import React, { useState } from 'react';`,
      ``,
      `export interface InteractiveNavbarProps {`,
      `  topMenus: string[];`,
      `  level1Menus: Record<number, string[]>;`,
      `  level2Submenus: Record<number, string[]>;`,
      `  accentColor: string;`,
      `  bounds: { x: number; y: number; width: number; height: number };`,
      `  onMenuToggle?: (isOpen: boolean, selectedPath?: string) => void;`,
      `}`,
      ``,
      `export const InteractiveNavbar: React.FC<InteractiveNavbarProps> = ({`,
      `  topMenus,`,
      `  level1Menus,`,
      `  level2Submenus,`,
      `  accentColor,`,
      `  bounds,`,
      `  onMenuToggle,`,
      `}) => {`,
      `  const [openTabIdx, setOpenTabIdx] = useState<number | null>(null);`,
      `  const [activeSubIdx, setActiveSubIdx] = useState<number>(0);`,
      `  const [selectedLeafIdx, setSelectedLeafIdx] = useState<number>(0);`,
      ``,
      `  const navStartX = bounds.x + Math.round(bounds.width * 0.22);`,
      `  const navSpanW = Math.round(bounds.width * 0.54);`,
      `  const itemW = Math.max(52, Math.floor(navSpanW / 4));`,
      `  const btnH = Math.max(20, Math.min(30, bounds.height - 14));`,
      `  const btnY = bounds.y + Math.round((bounds.height - btnH) / 2);`,
      ``,
      `  const handleToggleTab = (idx: number) => {`,
      `    const next = openTabIdx === idx ? null : idx;`,
      `    setOpenTabIdx(next);`,
      `    setActiveSubIdx(0);`,
      `    onMenuToggle?.(next !== null);`,
      `  };`,
      ``,
      `  const level1Rows = openTabIdx !== null ? level1Menus[openTabIdx] || level1Menus[0] || [] : [];`,
      `  const level2Rows = level2Submenus[activeSubIdx] || level2Submenus[0] || [];`,
      `  const menuX = openTabIdx !== null ? Math.min(bounds.width - 410, Math.max(12, navStartX + openTabIdx * itemW)) : 0;`,
      `  const menuY = bounds.y + bounds.height + 4;`,
      ``,
      `  return (`,
      `    <>`,
      `      {/* Top-Level Interactive Pill Buttons */}`,
      `      {topMenus.slice(0, 4).map((label, idx) => {`,
      `        const btnX = navStartX + idx * itemW + 4;`,
      `        const btnW = Math.max(36, itemW - 8);`,
      `        const isOpen = openTabIdx === idx;`,
      `        return (`,
      `          <button`,
      `            key={label + idx}`,
      `            type="button"`,
      `            onClick={() => handleToggleTab(idx)}`,
      `            style={{`,
      `              position: 'absolute',`,
      `              left: btnX,`,
      `              top: btnY,`,
      `              width: btnW,`,
      `              height: btnH,`,
      `              borderRadius: 8,`,
      `              backgroundColor: isOpen ? 'rgba(56, 189, 248, 0.24)' : '#1e293b',`,
      `              border: \`\${isOpen ? 1.5 : 1}px solid \${isOpen ? accentColor : '#475569'}\`,`,
      `              color: isOpen ? '#ffffff' : '#e2e8f0',`,
      `              zIndex: 40,`,
      `            }}`,
      `            className="text-[11px] font-medium hover:text-white hover:border-sky-400 transition-all flex items-center justify-center cursor-pointer select-none"`,
      `          >`,
      `            {label}`,
      `          </button>`,
      `        );`,
      `      })}`,
      ``,
      `      {/* Non-Overlapping Level-1 & Level-2 Cascading Flyout Menus */}`,
      `      {openTabIdx !== null && (`,
      `        <div`,
      `          style={{ position: 'absolute', left: menuX, top: menuY, zIndex: 50 }}`,
      `          className="flex items-start gap-1 select-none"`,
      `        >`,
      `          {/* Level-1 Dropdown */}`,
      `          <div`,
      `            style={{ width: 216, height: 152, borderColor: accentColor }}`,
      `            className="bg-[#0f172a] border-[1.5px] shadow-2xl overflow-hidden"`,
      `          >`,
      `            <div`,
      `              style={{ color: accentColor }}`,
      `              className="h-[22px] px-2.5 bg-[#1e293b] font-mono text-[9px] font-bold flex items-center uppercase"`,
      `            >`,
      `              NESTED MENU: {(topMenus[openTabIdx] || '').replace(' ▾', '')}`,
      `            </div>`,
      `            <div className="p-1.5 space-y-1">`,
      `              {level1Rows.map((rowLabel, rIdx) => {`,
      `                const isRowActive = rIdx === activeSubIdx;`,
      `                return (`,
      `                  <button`,
      `                    key={rowLabel + rIdx}`,
      `                    type="button"`,
      `                    onMouseEnter={() => setActiveSubIdx(rIdx)}`,
      `                    onClick={() => setActiveSubIdx(rIdx)}`,
      `                    style={{`,
      `                      backgroundColor: isRowActive ? 'rgba(56, 189, 248, 0.24)' : '#172236',`,
      `                      borderColor: isRowActive ? accentColor : '#334155',`,
      `                    }}`,
      `                    className="w-full h-[25px] px-2.5 rounded-[6px] border text-left text-[10.5px] text-white flex items-center justify-between transition-colors cursor-pointer"`,
      `                  >`,
      `                    <span className="truncate">{rowLabel}</span>`,
      `                  </button>`,
      `                );`,
      `              })}`,
      `            </div>`,
      `          </div>`,
      ``,
      `          {/* Level-2 Submenu */}`,
      `          <div`,
      `            style={{ width: 208, height: 152 }}`,
      `            className="bg-[#111827] border border-white shadow-2xl overflow-hidden"`,
      `          >`,
      `            <div className="h-[22px] px-2.5 bg-[#1e293b] font-mono text-[9px] font-bold text-white flex items-center uppercase">`,
      `              SUBMENU ITEMS (LEVEL 2)`,
      `            </div>`,
      `            <div className="p-1.5 space-y-1">`,
      `              {level2Rows.map((leafLabel, lIdx) => {`,
      `                const isLeafSelected = lIdx === selectedLeafIdx;`,
      `                return (`,
      `                  <button`,
      `                    key={leafLabel + lIdx}`,
      `                    type="button"`,
      `                    onClick={() => {`,
      `                      setSelectedLeafIdx(lIdx);`,
      `                      const cleanPath = \`\${(topMenus[openTabIdx] || '').replace(' ▾', '')} → \${(level1Rows[activeSubIdx] || '').replace(' ▸', '')} → \${leafLabel.replace(/^•\\s*/, '')}\`;`,
      `                      onMenuToggle?.(false, cleanPath);`,
      `                      setOpenTabIdx(null);`,
      `                    }}`,
      `                    style={{`,
      `                      backgroundColor: isLeafSelected ? 'rgba(56, 189, 248, 0.22)' : '#1a2436',`,
      `                      borderColor: isLeafSelected ? accentColor : '#334155',`,
      `                    }}`,
      `                    className="w-full h-[23px] px-2 rounded-[5px] border text-left text-[10px] text-slate-100 hover:text-white hover:border-sky-400 flex items-center transition-colors cursor-pointer"`,
      `                  >`,
      `                    <span className="truncate">{leafLabel.replace(/^•\\s*/, '')}</span>`,
      `                  </button>`,
      `                );`,
      `              })}`,
      `            </div>`,
      `          </div>`,
      `        </div>`,
      `      )}`,
      `    </>`,
      `  );`,
      `};`,
      ``,
    ].join('\n')
  );

  // 9. Write `src/components/CanvasStage.tsx`
  addTextFile(
    'src/components/CanvasStage.tsx',
    [
      `import React, { useState } from 'react';`,
      `import sceneData from '../data/canvasScene.json';`,
      `import { InteractiveNavbar } from './InteractiveNavbar';`,
      ``,
      `export interface CanvasStageProps {`,
      `  onActionFeedback?: (message: string) => void;`,
      `}`,
      ``,
      `export const CanvasStage: React.FC<CanvasStageProps> = ({ onActionFeedback }) => {`,
      `  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);`,
      `  const [hoveredId, setHoveredId] = useState<string | null>(null);`,
      `  const [activeId, setActiveId] = useState<string | null>(null);`,
      `  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({});`,
      ``,
      `  const reflowOffsetY = isNavDropdownOpen ? 160 : 0;`,
      `  const stageHeight = sceneData.canvasHeight + reflowOffsetY;`,
      ``,
      `  return (`,
      `    <div`,
      `      style={{`,
      `        width: sceneData.canvasWidth,`,
      `        height: stageHeight,`,
      `        backgroundColor: sceneData.canvasBgColor || '#0b0f19',`,
      `      }}`,
      `      className="relative mx-auto overflow-hidden rounded-xl border border-slate-800 shadow-2xl transition-all duration-200"`,
      `    >`,
      `      {sceneData.layers.map((layer) => {`,
      `        if (layer.isStaticNavbarChild) return null;`,
      `        const isHovered = hoveredId === layer.id;`,
      `        const isActive = activeId === layer.id;`,
      `        const stateOverride = isActive`,
      `          ? layer.stateVariants?.active`,
      `          : isHovered`,
      `          ? layer.stateVariants?.hover`,
      `          : undefined;`,
      ``,
      `        const dy = (layer.isBelowNavbar ? reflowOffsetY : 0) + (stateOverride?.offsetY || 0);`,
      `        const fill = stateOverride?.fill || layer.fill;`,
      `        const fillEnd = stateOverride?.fillGradientEnd || layer.fillGradientEnd;`,
      `        const stroke = stateOverride?.stroke || layer.stroke;`,
      `        const strokeWidth = stateOverride?.strokeWidth ?? layer.strokeWidth;`,
      `        const opacity = stateOverride?.opacity ?? layer.opacity;`,
      `        const isInteractive =`,
      `          Boolean(layer.stateVariants?.hover) ||`,
      `          layer.name.toLowerCase().includes('button') ||`,
      `          layer.name.toLowerCase().includes('cta') ||`,
      `          layer.name.toLowerCase().includes('toggle');`,
      ``,
      `        if (layer.type === 'text') {`,
      `          return (`,
      `            <div`,
      `              key={layer.id}`,
      `              style={{`,
      `                position: 'absolute',`,
      `                left: layer.x,`,
      `                top: layer.y + dy,`,
      `                width: layer.width,`,
      `                minHeight: layer.height,`,
      `                color: fill && fill !== 'none' ? fill : '#f8fafc',`,
      `                fontFamily: \`"\${layer.fontFamily || 'Inter'}", sans-serif\`,`,
      `                fontSize: layer.fontSize || 14,`,
      `                fontWeight: layer.fontWeight || '600',`,
      `                textAlign: (layer.textAlign as 'left' | 'center' | 'right') || 'left',`,
      `                letterSpacing: layer.letterSpacing ? \`\${layer.letterSpacing}px\` : undefined,`,
      `                lineHeight: 1.28,`,
      `                opacity,`,
      `                pointerEvents: 'none',`,
      `                whiteSpace: 'pre-line',`,
      `              }}`,
      `              className="transition-all duration-150 select-none"`,
      `            >`,
      `              {layer.text}`,
      `            </div>`,
      `          );`,
      `        }`,
      ``,
      `        if (layer.type === 'bitmap' && layer.imageDataUrl) {`,
      `          return (`,
      `            <img`,
      `              key={layer.id}`,
      `              src={layer.imageDataUrl}`,
      `              alt={layer.name}`,
      `              style={{`,
      `                position: 'absolute',`,
      `                left: layer.x,`,
      `                top: layer.y + dy,`,
      `                width: layer.width,`,
      `                height: layer.height,`,
      `                opacity,`,
      `              }}`,
      `              className="transition-all duration-150 select-none pointer-events-none"`,
      `            />`,
      `          );`,
      `        }`,
      ``,
      `        if (layer.svgPathD) {`,
      `          const gradId = \`grad_\${layer.id.replace(/[^a-zA-Z0-9_-]/g, '_')}\`;`,
      `          const hasGrad =`,
      `            (layer.fillType === 'linear-gradient' || layer.fillType === 'radial-gradient') &&`,
      `            fill &&`,
      `            fill !== 'none' &&`,
      `            fillEnd &&`,
      `            fillEnd !== 'none';`,
      `          const svgFill =`,
      `            layer.fillType === 'none' || !fill || fill === 'none'`,
      `              ? 'none'`,
      `              : hasGrad`,
      `              ? \`url(#\${gradId})\``,
      `              : fill;`,
      `          const toggled = toggleStates[layer.id];`,
      ``,
      `          return (`,
      `            <svg`,
      `              key={layer.id}`,
      `              width={layer.width}`,
      `              height={layer.height}`,
      `              viewBox={\`0 0 \${layer.width} \${layer.height}\`}`,
      `              onMouseEnter={() => setHoveredId(layer.id)}`,
      `              onMouseLeave={() => {`,
      `                setHoveredId(null);`,
      `                setActiveId(null);`,
      `              }}`,
      `              onMouseDown={() => isInteractive && setActiveId(layer.id)}`,
      `              onMouseUp={() => setActiveId(null)}`,
      `              onClick={() => {`,
      `                if (!isInteractive) return;`,
      `                setToggleStates((prev) => ({ ...prev, [layer.id]: !prev[layer.id] }));`,
      `                onActionFeedback?.(\`Interacted with "\${layer.name}"\`);`,
      `              }}`,
      `              style={{`,
      `                position: 'absolute',`,
      `                left: layer.x,`,
      `                top: layer.y + dy,`,
      `                overflow: 'visible',`,
      `                opacity,`,
      `                transform: layer.rotation ? \`rotate(\${layer.rotation}deg)\` : undefined,`,
      `                filter: layer.shadow?.enabled`,
      `                  ? \`drop-shadow(\${layer.shadow.offsetX || 0}px \${layer.shadow.offsetY || 4}px \${Math.round((layer.shadow.blur || 12) / 2)}px \${layer.shadow.color || 'rgba(0,0,0,0.45)'})\``,
      `                  : undefined,`,
      `                cursor: isInteractive ? 'pointer' : 'default',`,
      `              }}`,
      `              className="transition-all duration-150"`,
      `            >`,
      `              {hasGrad && (`,
      `                <defs>`,
      `                  <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">`,
      `                    <stop offset="0%" stopColor={toggled ? fillEnd : fill} />`,
      `                    <stop offset="100%" stopColor={toggled ? fill : fillEnd} />`,
      `                  </linearGradient>`,
      `                </defs>`,
      `              )}`,
      `              <path`,
      `                d={layer.svgPathD}`,
      `                fill={svgFill}`,
      `                fillRule="evenodd"`,
      `                stroke={stroke && stroke !== 'none' ? stroke : 'none'}`,
      `                strokeWidth={strokeWidth || 0}`,
      `              />`,
      `            </svg>`,
      `          );`,
      `        }`,
      `        return null;`,
      `      })}`,
      ``,
      `      {/* Live Interactive Navbar with Level-1 & Level-2 Cascading Menus */}`,
      `      {sceneData.hasNavbar && (`,
      `        <InteractiveNavbar`,
      `          topMenus={sceneData.topMenus}`,
      `          level1Menus={sceneData.level1Menus as Record<number, string[]>}`,
      `          level2Submenus={sceneData.level2Submenus as Record<number, string[]>}`,
      `          accentColor="${accentColor}"`,
      `          bounds={sceneData.navbarBounds}`,
      `          onMenuToggle={(isOpen, path) => {`,
      `            setIsNavDropdownOpen(isOpen);`,
      `            if (path) onActionFeedback?.(\`Selected Menu: \${path}\`);`,
      `          }}`,
      `        />`,
      `      )}`,
      `    </div>`,
      `  );`,
      `};`,
      ``,
    ].join('\n')
  );

  // 10. Write `src/App.tsx`
  addTextFile(
    'src/App.tsx',
    [
      `import React, { useState } from 'react';`,
      `import { CanvasStage } from './components/CanvasStage';`,
      `import sceneData from './data/canvasScene.json';`,
      `import designTokens from './data/designTokens.json';`,
      ``,
      `export default function App() {`,
      `  const [viewMode, setViewMode] = useState<'interactive' | 'svg' | 'tokens'>('interactive');`,
      `  const [toast, setToast] = useState<string>('Click any navbar tab or CTA button to test interactive states!');`,
      ``,
      `  return (`,
      `    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col">`,
      `      {/* Top Developer & Preview Control Bar */}`,
      `      <header className="border-b border-slate-800 bg-[#0d121f]/90 backdrop-blur px-6 py-3 flex flex-wrap items-center justify-between gap-4">`,
      `        <div className="flex items-center gap-3">`,
      `          <span className="w-3 h-3 rounded-full bg-brand-primary shadow-[0_0_12px_var(--osito-primary)]" />`,
      `          <span className="font-display font-bold text-sm tracking-wide text-white">`,
      `            {sceneData.brandName}`,
      `          </span>`,
      `          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">`,
      `            {sceneData.layers.length} Vector &amp; UI Layers • React 19 + Tailwind`,
      `          </span>`,
      `        </div>`,
      ``,
      `        <div className="flex items-center gap-2">`,
      `          {(`,
      `            [`,
      `              { id: 'interactive', label: 'Interactive React Stage' },`,
      `              { id: 'svg', label: 'Master Vector SVG' },`,
      `              { id: 'tokens', label: 'W3C Design Tokens' },`,
      `            ] as const`,
      `          ).map((tab) => (`,
      `            <button`,
      `              key={tab.id}`,
      `              type="button"`,
      `              onClick={() => setViewMode(tab.id)}`,
      `              className={\`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition \${`,
      `                viewMode === tab.id`,
      `                  ? 'bg-white text-slate-950 border-white'`,
      `                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'`,
      `              }\`}`,
      `            >`,
      `              {tab.label}`,
      `            </button>`,
      `          ))}`,
      `        </div>`,
      `      </header>`,
      ``,
      `      {/* Main Stage */}`,
      `      <main className="flex-1 flex flex-col items-center justify-center p-6 overflow-x-auto">`,
      `        {viewMode === 'interactive' && (`,
      `          <CanvasStage onActionFeedback={(msg) => setToast(msg)} />`,
      `        )}`,
      `        {viewMode === 'svg' && (`,
      `          <div className="rounded-xl border border-slate-800 shadow-2xl overflow-hidden bg-[#0b0f19]">`,
      `            <img`,
      `              src="/assets/canvas-master.svg"`,
      `              alt="Master Vector SVG"`,
      `              width={sceneData.canvasWidth}`,
      `              height={sceneData.canvasHeight}`,
      `            />`,
      `          </div>`,
      `        )}`,
      `        {viewMode === 'tokens' && (`,
      `          <pre className="w-full max-w-4xl p-6 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-auto max-h-[600px]">`,
      `            {JSON.stringify(designTokens, null, 2)}`,
      `          </pre>`,
      `        )}`,
      `      </main>`,
      ``,
      `      {/* Status Footer */}`,
      `      <footer className="border-t border-slate-800/80 bg-[#0a0e19] px-6 py-2.5 flex items-center justify-between text-xs font-mono text-slate-400">`,
      `        <span>Status: {toast}</span>`,
      `        <span>Exported by Osito Hybrid Vector, Pixel &amp; Web Studio</span>`,
      `      </footer>`,
      `    </div>`,
      `  );`,
      `}`,
      ``,
    ].join('\n')
  );

  // 11. Write Zero-Server `preview-standalone.html` so users can double-click to preview immediately!
  addTextFile(
    'preview-standalone.html',
    [
      `<!DOCTYPE html>`,
      `<html lang="en">`,
      `<head>`,
      `  <meta charset="UTF-8" />`,
      `  <meta name="viewport" content="width=device-width, initial-scale=1.0" />`,
      `  <title>${escapeXml(brandName)} — Standalone Interactive Preview</title>`,
      `  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />`,
      `  <style>`,
      `    * { box-sizing: border-box; }`,
      `    body { margin: 0; background: #070a12; color: #f8fafc; font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; min-height: 100vh; }`,
      `    header { padding: 12px 24px; background: #0d121f; border-bottom: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; font-family: 'JetBrains Mono', monospace; font-size: 12px; }`,
      `    main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px; overflow: auto; }`,
      `    .stage-wrap { border: 1px solid #334155; border-radius: 12px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.75); background: ${canvasBgColor}; }`,
      `  </style>`,
      `</head>`,
      `<body>`,
      `  <header>`,
      `    <div><strong>${escapeXml(brandName)}</strong> • Zero-Server Standalone SVG Preview</div>`,
      `    <div>Run <code>npm install &amp;&amp; npm run dev</code> for Full Interactive React + Tailwind App</div>`,
      `  </header>`,
      `  <main>`,
      `    <div class="stage-wrap">`,
      masterSvgMarkup,
      `    </div>`,
      `  </main>`,
      `</body>`,
      `</html>`,
      ``,
    ].join('\n')
  );

  // 12. Write `README.md`
  addTextFile(
    'README.md',
    [
      `# ${brandName} — Vite + React 19 + TypeScript + Tailwind CSS App`,
      ``,
      `Exported directly from **Osito (Pixel + Vector + Web + Deep Research Studio)**.`,
      ``,
      `## Quickstart (Local Development)`,
      ``,
      `\`\`\`bash`,
      `npm install`,
      `npm run dev`,
      `\`\`\``,
      ``,
      `Then open \`http://localhost:3000\` in your browser.`,
      ``,
      `## Instant Zero-Install Preview`,
      `Double-click \`preview-standalone.html\` in this folder to view the high-precision vector layout in any browser without running a server.`,
      ``,
      `## Project Architecture`,
      `- \`src/components/InteractiveNavbar.tsx\`: Interactive top navigation bar with non-overlapping Level-1 & Level-2 cascading submenus and automatic container reflow.`,
      `- \`src/components/CanvasStage.tsx\`: Interactive React + SVG stage with hover/active state transitions.`,
      `- \`src/data/designTokens.json\`: W3C Design Token JSON manifest extracted from your document palette.`,
      `- \`public/assets/canvas-master.svg\` & \`public/assets/slices/*.svg\`: Crisp vector assets.`,
      ``,
    ].join('\n')
  );

  const blob = buildZipArchive(files);
  return {
    blob,
    filename: `${projectSlug}-react-tailwind-app.zip`,
    fileCount: files.length,
  };
}

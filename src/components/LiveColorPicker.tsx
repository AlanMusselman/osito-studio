import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Normalizes any CSS color string (#rgb, #rgba, #rrggbb, #rrggbbaa, rgb(...), rgba(...)) into a 7-char #rrggbb hex string.
 */
export function toHexColor(input: string | undefined | null, fallback = '#3b82f6'): string {
  const safeFallback = /^#[0-9a-fA-F]{6}$/.test(fallback)
    ? fallback.toLowerCase()
    : /^#[0-9a-fA-F]{3}$/.test(fallback)
    ? `#${fallback[1]}${fallback[1]}${fallback[2]}${fallback[2]}${fallback[3]}${fallback[3]}`.toLowerCase()
    : '#3b82f6';

  if (!input) return safeFallback;
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();
  if (!lower || lower === 'none' || lower === 'transparent' || lower === 'currentcolor') {
    return safeFallback;
  }

  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed) || /^#[0-9a-fA-F]{4}$/.test(trimmed)) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  if (/^#[0-9a-fA-F]{8}$/.test(trimmed)) {
    return trimmed.slice(0, 7).toLowerCase();
  }

  const rgbMatch = trimmed.match(
    /rgba?\(\s*(\d+(?:\.\d+)?)\s*[\s,]\s*(\d+(?:\.\d+)?)\s*[\s,]\s*(\d+(?:\.\d+)?)/i
  );
  if (rgbMatch) {
    const r = Math.max(0, Math.min(255, Math.round(parseFloat(rgbMatch[1]))));
    const g = Math.max(0, Math.min(255, Math.round(parseFloat(rgbMatch[2]))));
    const b = Math.max(0, Math.min(255, Math.round(parseFloat(rgbMatch[3]))));
    return (
      '#' +
      [r, g, b]
        .map((n) => n.toString(16).padStart(2, '0'))
        .join('')
        .toLowerCase()
    );
  }

  return safeFallback;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = toHexColor(hex).slice(1);
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((n) => n.toString(16).padStart(2, '0'))
      .join('')
      .toLowerCase()
  );
}

/**
 * Shifts the perceived brightness of a hex color by `delta` (-100 to +100).
 * Useful for computing companion gradient stops and inner AutoShape contrast surfaces.
 */
export function shiftHexBrightness(hex: string, delta: number): string {
  const { h, s, l } = hexToHsl(hex);
  const nextL = Math.max(4, Math.min(96, l + delta));
  return hslToHex(h, s, nextL);
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r: r255, g: g255, b: b255 } = hexToRgb(hex);
  const r = r255 / 255;
  const g = g255 / 255;
  const b = b255 / 255;

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

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  const hNorm = (((h % 360) + 360) % 360) / 360;
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const lNorm = Math.max(0, Math.min(100, l)) / 100;

  if (sNorm === 0) {
    const v = Math.round(lNorm * 255);
    return rgbToHex(v, v, v);
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;
  const r = hue2rgb(p, q, hNorm + 1 / 3);
  const g = hue2rgb(p, q, hNorm);
  const b = hue2rgb(p, q, hNorm - 1 / 3);

  return rgbToHex(r * 255, g * 255, b * 255);
}

export function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const { r: r255, g: g255, b: b255 } = hexToRgb(hex);
  const r = r255 / 255;
  const g = g255 / 255;
  const b = b255 / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
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

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

export function hsvToHex(h: number, s: number, v: number): string {
  const hNorm = (((h % 360) + 360) % 360) / 60;
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const vNorm = Math.max(0, Math.min(100, v)) / 100;

  const c = vNorm * sNorm;
  const x = c * (1 - Math.abs((hNorm % 2) - 1));
  const m = vNorm - c;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (hNorm >= 0 && hNorm < 1) {
    rPrime = c;
    gPrime = x;
  } else if (hNorm >= 1 && hNorm < 2) {
    rPrime = x;
    gPrime = c;
  } else if (hNorm >= 2 && hNorm < 3) {
    gPrime = c;
    bPrime = x;
  } else if (hNorm >= 3 && hNorm < 4) {
    gPrime = x;
    bPrime = c;
  } else if (hNorm >= 4 && hNorm < 5) {
    rPrime = x;
    bPrime = c;
  } else {
    rPrime = c;
    bPrime = x;
  }

  return rgbToHex((rPrime + m) * 255, (gPrime + m) * 255, (bPrime + m) * 255);
}

const QUICK_PALETTE_SWATCHES = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#22c55e',
  '#10b981',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
  '#ffffff',
  '#d4d4d4',
  '#94a3b8',
  '#64748b',
  '#334155',
  '#1e293b',
  '#0f172a',
  '#0a0a0a',
];

export interface LiveColorPickerProps {
  value: string;
  onChange: (hex: string, recordHistory?: boolean) => void;
  onDragStart?: () => void;
  disabled?: boolean;
  title?: string;
  className?: string;
  label?: string;
}

export const LiveColorPicker: React.FC<LiveColorPickerProps> = ({
  value,
  onChange,
  onDragStart,
  disabled = false,
  title,
  className = 'w-5 h-5',
  label,
}) => {
  const safeHex = toHexColor(value, '#3b82f6');
  const [isOpen, setIsOpen] = useState(false);
  const [isDirectScrubbing, setIsDirectScrubbing] = useState(false);
  const [scrubOverlayPos, setScrubOverlayPos] = useState<{ x: number; y: number } | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [hsv, setHsv] = useState<{ h: number; s: number; v: number }>(() => hexToHsv(safeHex));
  const [hexInput, setHexInput] = useState(safeHex);

  const swatchRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const svPadRef = useRef<HTMLDivElement | null>(null);
  const hueBarRef = useRef<HTMLDivElement | null>(null);
  const spectrumPadRef = useRef<HTMLDivElement | null>(null);
  const activeDragCleanupRef = useRef<(() => void) | null>(null);

  // Guarantee window drag listeners are always cleaned up on unmount
  useEffect(() => {
    return () => {
      activeDragCleanupRef.current?.();
      activeDragCleanupRef.current = null;
    };
  }, []);

  // Sync internal HSV state when external `value` changes
  useEffect(() => {
    const normalized = toHexColor(value, '#3b82f6');
    setHexInput(normalized);
    setHsv((prev) => {
      const currentHex = hsvToHex(prev.h, prev.s, prev.v);
      if (currentHex.toLowerCase() === normalized.toLowerCase()) {
        return prev;
      }
      return hexToHsv(normalized);
    });
  }, [value]);

  const computePopoverPosition = useCallback(() => {
    if (!swatchRef.current) return { top: 100, left: 100 };
    const rect = swatchRef.current.getBoundingClientRect();
    const popW = 248;
    const popH = 310;
    const margin = 8;

    let left = rect.left;
    if (left + popW > window.innerWidth - margin) {
      left = Math.max(margin, window.innerWidth - popW - margin);
    }

    // Prefer opening above if swatch is in the bottom half of the viewport (like PropertyInspector)
    let top = rect.bottom + 6;
    if (rect.bottom + popH > window.innerHeight - margin) {
      top = Math.max(margin, rect.top - popH - 6);
    }

    return { top, left };
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDownOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        swatchRef.current &&
        !swatchRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('mousedown', handlePointerDownOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handlePointerDownOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  /**
   * Direct Press-Hold-and-Drag Scrubbing on the Swatch Button itself:
   * - Clicking and holding on the swatch and dragging horizontally scrubs Hue (0°..360°)
   * - Dragging vertically scrubs Lightness/Brightness (95%..8%)
   * - Clicking and releasing without dragging toggles the full interactive popover!
   */
  const handleSwatchMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    activeDragCleanupRef.current?.();

    const startX = e.clientX;
    const startY = e.clientY;
    const startHsl = hexToHsl(safeHex);
    const initialHue = startHsl.h;
    const initialLightness = startHsl.l;
    let hasDragged = false;
    let historyRecorded = false;

    const pos = computePopoverPosition();
    setPopoverPos(pos);

    const handleWindowMouseMove = (moveEvt: MouseEvent) => {
      const dx = moveEvt.clientX - startX;
      const dy = moveEvt.clientY - startY;

      if (!hasDragged && Math.hypot(dx, dy) >= 3) {
        hasDragged = true;
        setIsDirectScrubbing(true);
        setIsOpen(false);
        if (!historyRecorded) {
          historyRecorded = true;
          onDragStart?.();
        }
      }

      if (hasDragged) {
        setScrubOverlayPos({ x: moveEvt.clientX, y: moveEvt.clientY });

        // Smooth 2D relative scrub from the swatch press point:
        // Horizontal drag (dx): 1.6 deg per pixel across full 360° hue wheel
        // Vertical drag (dy): -0.45% lightness per pixel (up = brighter, down = darker)
        // Ensure vibrant saturation (at least 78%) when scrubbing from a grey/black/white color
        const nextHue = (((initialHue + dx * 1.6) % 360) + 360) % 360;
        const nextLight = Math.max(8, Math.min(94, initialLightness - dy * 0.45));
        const nextSat = startHsl.s < 25 ? 85 : Math.max(65, startHsl.s);
        const nextHex = hslToHex(nextHue, nextSat, nextLight);

        setHsv(hexToHsv(nextHex));
        setHexInput(nextHex);
        onChange(nextHex, false);
      }
    };

    const cleanup = () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      if (activeDragCleanupRef.current === cleanup) {
        activeDragCleanupRef.current = null;
      }
    };

    const handleWindowMouseUp = () => {
      cleanup();
      setIsDirectScrubbing(false);
      setScrubOverlayPos(null);

      if (!hasDragged) {
        // Simple click (< 3px movement): toggle popover open/closed
        setIsOpen((prev) => !prev);
      } else {
        // Drag scrub (>= 3px movement): ensure popover never stays stuck open after scrubbing
        setIsOpen(false);
      }
    };

    activeDragCleanupRef.current = cleanup;
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  };

  /**
   * 2D Saturation / Brightness (Value) Pad Drag Handler inside Popover
   */
  const handleSvPadMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    activeDragCleanupRef.current?.();
    onDragStart?.();

    const updateFromClientXY = (clientX: number, clientY: number) => {
      if (!svPadRef.current) return;
      const rect = svPadRef.current.getBoundingClientRect();
      const s = Math.round(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * 100);
      const v = Math.round(
        (1 - Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))) * 100
      );
      setHsv((prev) => {
        const nextHex = hsvToHex(prev.h, s, v);
        setHexInput(nextHex);
        onChange(nextHex, false);
        return { ...prev, s, v };
      });
    };

    updateFromClientXY(e.clientX, e.clientY);

    const onMove = (moveEvt: MouseEvent) => {
      updateFromClientXY(moveEvt.clientX, moveEvt.clientY);
    };
    const cleanup = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', cleanup);
      if (activeDragCleanupRef.current === cleanup) {
        activeDragCleanupRef.current = null;
      }
    };
    activeDragCleanupRef.current = cleanup;
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', cleanup);
  };

  /**
   * Hue Bar (0°..360°) Drag Handler inside Popover
   */
  const handleHueBarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    activeDragCleanupRef.current?.();
    onDragStart?.();

    const updateFromClientX = (clientX: number) => {
      if (!hueBarRef.current) return;
      const rect = hueBarRef.current.getBoundingClientRect();
      const h = Math.round(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * 360);
      setHsv((prev) => {
        const nextS = prev.s < 10 ? 85 : prev.s;
        const nextV = prev.v < 15 ? 85 : prev.v;
        const nextHex = hsvToHex(h, nextS, nextV);
        setHexInput(nextHex);
        onChange(nextHex, false);
        return { h, s: nextS, v: nextV };
      });
    };

    updateFromClientX(e.clientX);

    const onMove = (moveEvt: MouseEvent) => {
      updateFromClientX(moveEvt.clientX);
    };
    const cleanup = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', cleanup);
      if (activeDragCleanupRef.current === cleanup) {
        activeDragCleanupRef.current = null;
      }
    };
    activeDragCleanupRef.current = cleanup;
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', cleanup);
  };

  /**
   * 2D All-in-One Hue × Lightness Spectrum Strip Drag Handler
   */
  const handleSpectrumPadMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    activeDragCleanupRef.current?.();
    onDragStart?.();

    const updateFromClientXY = (clientX: number, clientY: number) => {
      if (!spectrumPadRef.current) return;
      const rect = spectrumPadRef.current.getBoundingClientRect();
      const relX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const relY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      const h = Math.round(relX * 360);
      const l = Math.round(92 - relY * 80);
      const s = relX < 0.04 ? 0 : 90;
      const nextHex = hslToHex(h, s, l);
      setHsv(hexToHsv(nextHex));
      setHexInput(nextHex);
      onChange(nextHex, false);
    };

    updateFromClientXY(e.clientX, e.clientY);

    const onMove = (moveEvt: MouseEvent) => {
      updateFromClientXY(moveEvt.clientX, moveEvt.clientY);
    };
    const cleanup = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', cleanup);
      if (activeDragCleanupRef.current === cleanup) {
        activeDragCleanupRef.current = null;
      }
    };
    activeDragCleanupRef.current = cleanup;
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', cleanup);
  };

  const pureHueHex = hsvToHex(hsv.h, 100, 100);

  return (
    <>
      <button
        ref={swatchRef}
        type="button"
        disabled={disabled}
        onMouseDown={handleSwatchMouseDown}
        title={
          title ||
          'Click to open Color Picker, or Press-and-Hold & Drag anywhere to scrub color live on object'
        }
        style={{ backgroundColor: safeHex }}
        className={`${className} rounded-none border border-[#737373] hover:border-[#ffffff] focus:outline-none focus:border-[#ffffff] transition-colors relative shrink-0 ${
          disabled ? 'opacity-35 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
        }`}
      >
        {label && <span className="sr-only">{label}</span>}
      </button>

      {/* Floating Cursor HUD Pill during Direct Press-and-Hold Drag Scrubbing */}
      {isDirectScrubbing &&
        scrubOverlayPos &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              left: Math.min(window.innerWidth - 150, scrubOverlayPos.x + 16),
              top: Math.max(12, scrubOverlayPos.y - 44),
              zIndex: 10000,
              pointerEvents: 'none',
            }}
            className="bg-[#0a0a0a] border border-[#ffffff] px-2 py-1 rounded-none shadow-2xl flex items-center gap-2"
          >
            <span
              className="w-4 h-4 border border-[#ffffff] shrink-0"
              style={{ backgroundColor: safeHex }}
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-bold text-[#ffffff] uppercase leading-none">
                {safeHex}
              </span>
              <span className="text-[8px] font-mono text-[#a3a3a3] leading-tight">
                LIVE SCRUB (←Hue→ ↑Lum↓)
              </span>
            </div>
          </div>,
          document.body
        )}

      {/* Interactive Live Color Picker Popover */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: 'fixed',
              top: popoverPos.top,
              left: popoverPos.left,
              width: 248,
              zIndex: 9999,
            }}
            className="bg-[#111111] border border-[#737373] shadow-2xl p-2.5 flex flex-col gap-2 select-none rounded-none"
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between border-b border-[#262626] pb-1">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3.5 h-3.5 border border-[#ffffff] inline-block"
                  style={{ backgroundColor: safeHex }}
                />
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#e5e5e5] font-semibold">
                  Live Color Scrub
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-mono text-[#a3a3a3] hover:text-[#ffffff] px-1"
              >
                ✕
              </button>
            </div>

            {/* 2D Saturation / Value Drag Field */}
            <div
              ref={svPadRef}
              onMouseDown={handleSvPadMouseDown}
              style={{
                backgroundColor: pureHueHex,
                backgroundImage:
                  'linear-gradient(to top, #000000, transparent), linear-gradient(to right, #ffffff, transparent)',
              }}
              className="w-full h-28 border border-[#383838] relative cursor-crosshair"
              title="Press and drag anywhere to scrub Saturation & Brightness live on object"
            >
              <div
                style={{
                  left: `${hsv.s}%`,
                  top: `${100 - hsv.v}%`,
                  backgroundColor: safeHex,
                }}
                className="w-3.5 h-3.5 -translate-x-1/2 -translate-y-1/2 border-2 border-[#ffffff] shadow pointer-events-none absolute"
              />
            </div>

            {/* 360° Hue Spectrum Slider Bar */}
            <div
              ref={hueBarRef}
              onMouseDown={handleHueBarMouseDown}
              style={{
                background:
                  'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
              }}
              className="w-full h-3.5 border border-[#383838] relative cursor-ew-resize"
              title="Press and drag to scrub Hue (0°–360°) live on object"
            >
              <div
                style={{
                  left: `${(hsv.h / 360) * 100}%`,
                }}
                className="w-2 h-full -translate-x-1/2 bg-[#ffffff] border border-[#0a0a0a] pointer-events-none absolute top-0"
              />
            </div>

            {/* 2D All-in-One Spectrum Scrub Pad (Hue × Lightness) */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-mono text-[#a3a3a3] uppercase">
                Full-Spectrum Quick Scrub Pad (Drag Around):
              </span>
              <div
                ref={spectrumPadRef}
                onMouseDown={handleSpectrumPadMouseDown}
                style={{
                  backgroundImage:
                    'linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.88) 100%), linear-gradient(to right, #808080 0%, #ff0000 6%, #ff8800 18%, #ffff00 32%, #00cc44 48%, #00cccc 64%, #2266ff 78%, #9922ff 90%, #ff0088 100%)',
                }}
                className="w-full h-8 border border-[#383838] cursor-crosshair relative"
                title="Press and hold & drag around across all hues and brightnesses"
              />
            </div>

            {/* Quick Palette Swatches (Supports Click OR Press-and-Drag across swatches) */}
            <div className="grid grid-cols-11 gap-1 pt-0.5">
              {QUICK_PALETTE_SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onDragStart?.();
                    setHsv(hexToHsv(swatch));
                    setHexInput(swatch);
                    onChange(swatch, false);
                  }}
                  onMouseEnter={(e) => {
                    if (e.buttons === 1) {
                      setHsv(hexToHsv(swatch));
                      setHexInput(swatch);
                      onChange(swatch, false);
                    }
                  }}
                  style={{ backgroundColor: swatch }}
                  title={swatch}
                  className={`h-3.5 w-full border ${
                    safeHex.toLowerCase() === swatch.toLowerCase()
                      ? 'border-[#ffffff] scale-110 z-10'
                      : 'border-[#383838] hover:border-[#d4d4d4]'
                  }`}
                />
              ))}
            </div>

            {/* Hex Input & Hint */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#262626]">
              <label className="flex items-center gap-1 text-[10px] font-mono text-[#a3a3a3]">
                <span>HEX</span>
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHexInput(val);
                    if (/^#[0-9a-fA-F]{6}$/.test(val.trim())) {
                      const clean = val.trim().toLowerCase();
                      setHsv(hexToHsv(clean));
                      onChange(clean, true);
                    }
                  }}
                  onBlur={() => {
                    const normalized = toHexColor(hexInput, safeHex);
                    setHexInput(normalized);
                    setHsv(hexToHsv(normalized));
                    if (normalized.toLowerCase() !== safeHex.toLowerCase()) {
                      onChange(normalized, true);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const normalized = toHexColor(hexInput, safeHex);
                      setHexInput(normalized);
                      setHsv(hexToHsv(normalized));
                      onChange(normalized, true);
                    }
                  }}
                  className="w-20 bg-[#0a0a0a] border border-[#383838] focus:border-[#ffffff] px-1.5 py-0.5 text-[10px] font-mono text-[#ffffff] uppercase outline-none rounded-none"
                />
              </label>
              <span className="text-[9px] font-mono text-[#737373]">
                Hold &amp; drag swatch
              </span>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

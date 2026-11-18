import type { AutoShapeDefinition } from '../types/editor';

/**
 * OSITO STUDIO — PCB LAYOUT AUTOSHAPES LIBRARY (.jsf)
 * Comprehensive IPC-7351B Parametric Footprint & PCB Routing Suite
 *
 * Covers:
 * - IC Packages: DIP, SOIC, QFP, QFN, SOT-23/223, TO-220
 * - Passive Components: SMT Chips (0402-2512), Axial Leaded, Radial Electrolytic, Shielded Inductor, Trimmer
 * - Connectors & Pin Headers: 0.1" (2.54mm) 1xN/2xN, JST-SH/GH/XH, USB-C, Micro-USB, Screw Terminal, Battery Solder Pads
 * - Solder Pads, Vias & Test Points: SMD Rect, SMD Circle, Through-Hole Annular Ring, Plated Vias & Thermal Grid, Test Points
 * - Conductive Traces & Routing: Straight Trace, IPC-2221 45° Mitered Corner, Multi-Track Bus Route
 * - Board Features & Outlines: Fiducials, Chassis Mounting Holes (M2-M4), Board Outline with Corner Radius, Creepage Slot, Mousebites
 *
 * Multi-Subpath Conventions:
 * - Subpath 0: Outer container / component body / substrate outline (closed: true)
 * - Subpaths 1..N: Copper pads, through-hole annular rings, drill holes, silkscreen indicators, and conductive routing
 */

export const PCB_LAYOUT_AUTOSHAPES: AutoShapeDefinition[] = [
  // =========================================================================
  // 1. IC PACKAGES
  // =========================================================================

  // 1.1 Dual In-Line Package (DIP-8, 14, 16, 20, 24, 28, 40)
  {
    id: 'pcb-ic-dip',
    name: 'PCB: DIP IC Package',
    category: 'PCB Layout',
    description:
      'Dual In-Line Through-Hole IC footprint (4-40 pins) with 0.1" (2.54mm) pin pitch, configurable row spacing (0.3" narrow vs 0.6" wide), square Pin 1 DRC pad, round Pins 2..N, drill holes, and Pin 1 orientation notch.',
    iconName: 'Cpu',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle Pin 1 orientation notch',
    paramSchema: [
      { key: 'label', label: 'IC Part Number', type: 'string', defaultValue: 'ATmega328P' },
      { key: 'pinCount', label: 'Pin Count (Dual Row)', type: 'number', min: 4, max: 40, step: 2, defaultValue: 14 },
      { key: 'rowSpacingRatio', label: 'Row Spacing (0.3" vs 0.6")', type: 'number', min: 0.45, max: 0.9, step: 0.05, defaultValue: 0.7 },
      { key: 'showNotch', label: 'Orientation Notch', type: 'boolean', defaultValue: true },
    ],
    defaultParams: {
      label: 'ATmega328P',
      pinCount: 14,
      rowSpacingRatio: 0.7,
      showNotch: true,
    },
    jsSourceCode: `// PCB: DIP IC Package (.jsf)
function getControlPoints(width, height, params, helpers) {
  const pins = Math.round(helpers.clamp(Number(params.pinCount) || 14, 4, 40));
  const row = helpers.clamp(Number(params.rowSpacingRatio) || 0.7, 0.45, 0.9);
  return [
    { id: 'pinCount', label: \`\${pins} Pins\`, x: helpers.lerp(width * 0.2, width * 0.8, (pins - 4) / 36), y: height - 8, cursor: 'ew-resize' },
    { id: 'rowSpacing', label: \`Row: \${Math.round(row * 100)}%\`, x: width * (0.5 + row * 0.5), y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'pinCount') {
    const t = helpers.clamp((localX - width * 0.2) / (width * 0.6), 0, 1);
    let p = Math.round(4 + t * 36);
    if (p % 2 !== 0) p += 1;
    return { ...params, pinCount: helpers.clamp(p, 4, 40) };
  }
  if (id === 'rowSpacing') {
    const r = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.45, 0.9);
    return { ...params, rowSpacingRatio: Number(r.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, showNotch: !params.showNotch };
}

function buildPaths(width, height, params, helpers) {
  const pins = Math.round(helpers.clamp(Number(params.pinCount) || 14, 4, 40));
  const rowRatio = helpers.clamp(Number(params.rowSpacingRatio) || 0.7, 0.45, 0.9);
  const showNotch = params.showNotch !== false;
  const pinsPerSide = Math.max(2, Math.floor(pins / 2));

  const cx = width / 2;
  const cy = height / 2;
  const bodyW = width * (rowRatio * 0.75);
  const bodyH = height - 16;
  const padR = Math.min(10, Math.max(4, (bodyH / pinsPerSide) * 0.35));
  const drillR = padR * 0.45;
  const leftX = cx - (width * rowRatio) / 2;
  const rightX = cx + (width * rowRatio) / 2;

  const paths = [];

  // Subpath 0: Plastic Epoxy IC Body with optional orientation notch
  if (showNotch) {
    const notchR = Math.min(12, bodyW * 0.2);
    const bodyLeft = cx - bodyW / 2;
    const bodyRight = cx + bodyW / 2;
    const bodyTop = cy - bodyH / 2;
    const bodyBottom = cy + bodyH / 2;
    const notchNodes = [
      helpers.cornerNode(bodyLeft + 4, bodyTop),
      helpers.cornerNode(cx - notchR, bodyTop),
      helpers.smoothNode(cx, bodyTop + notchR, cx - notchR * 0.55, bodyTop + notchR, cx + notchR * 0.55, bodyTop + notchR),
      helpers.cornerNode(bodyRight - 4, bodyTop),
      helpers.cornerNode(bodyRight, bodyTop + 4),
      helpers.cornerNode(bodyRight, bodyBottom - 4),
      helpers.cornerNode(bodyRight - 4, bodyBottom),
      helpers.cornerNode(bodyLeft + 4, bodyBottom),
      helpers.cornerNode(bodyLeft, bodyBottom - 4),
      helpers.cornerNode(bodyLeft, bodyTop + 4)
    ];
    paths.push({ nodes: notchNodes, closed: true });
  } else {
    paths.push({ nodes: helpers.rectPath(cx - bodyW / 2, cy - bodyH / 2, bodyW, bodyH, 4), closed: true });
  }

  // Subpaths 1..N: Left and Right Through-Hole Solder Pads
  const yStart = cy - bodyH / 2 + padR * 1.5;
  const yStep = (bodyH - padR * 3) / Math.max(1, pinsPerSide - 1);

  for (let i = 0; i < pinsPerSide; i++) {
    const py = yStart + i * yStep;
    // Left pin row: Pin 1 at top-left is square DRC pad; Pins 2..N/2 are circular
    if (i === 0) {
      paths.push({ nodes: helpers.rectPath(leftX - padR, py - padR, padR * 2, padR * 2, 1), closed: true });
    } else {
      paths.push({ nodes: helpers.circle(leftX, py, padR), closed: true });
    }
    // Drill hole
    paths.push({ nodes: helpers.circle(leftX, py, drillR), closed: true });
  }

  // Right pin row: Pins (N/2+1)..N running upward from bottom-right to top-right
  for (let i = 0; i < pinsPerSide; i++) {
    const py = yStart + (pinsPerSide - 1 - i) * yStep;
    paths.push({ nodes: helpers.circle(rightX, py, padR), closed: true });
    paths.push({ nodes: helpers.circle(rightX, py, drillR), closed: true });
  }

  // Pin 1 silkscreen index dot
  paths.push({ nodes: helpers.circle(leftX - padR - 6, yStart, 2.5), closed: true });

  return paths;
}`,
  },

  // 1.2 Small Outline IC (SOIC-8, 14, 16, 20, 28)
  {
    id: 'pcb-ic-soic',
    name: 'PCB: SOIC IC Package',
    category: 'PCB Layout',
    description:
      'Small Outline Surface-Mount IC package (8-28 pins) with 1.27mm (50-mil) pitch, gull-wing SMT solder pads, chamfered Pin 1 bevel, and silkscreen index dot.',
    iconName: 'Cpu',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to step through standard pin counts (8, 14, 16, 20, 28)',
    paramSchema: [
      { key: 'label', label: 'IC Part Number', type: 'string', defaultValue: 'NE555DR' },
      { key: 'pins', label: 'Total Pins', type: 'number', min: 8, max: 28, step: 2, defaultValue: 8 },
      { key: 'bodyWidthRatio', label: 'Body Width Ratio', type: 'number', min: 0.4, max: 0.75, step: 0.01, defaultValue: 0.58 },
      { key: 'padLengthRatio', label: 'SMD Pad Length', type: 'number', min: 0.12, max: 0.32, step: 0.01, defaultValue: 0.22 },
    ],
    defaultParams: {
      label: 'NE555DR',
      pins: 8,
      bodyWidthRatio: 0.58,
      padLengthRatio: 0.22,
    },
    jsSourceCode: `// PCB: SOIC IC Package (.jsf)
function getControlPoints(width, height, params, helpers) {
  const pins = Math.round(helpers.clamp(Number(params.pins) || 8, 8, 28));
  const bw = helpers.clamp(Number(params.bodyWidthRatio) || 0.58, 0.4, 0.75);
  return [
    { id: 'pins', label: \`\${pins} Pins\`, x: helpers.lerp(width * 0.2, width * 0.8, (pins - 8) / 20), y: height - 8, cursor: 'ew-resize' },
    { id: 'bodyWidth', label: \`Body: \${Math.round(bw * 100)}%\`, x: width * (0.5 + bw * 0.5), y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'pins') {
    const t = helpers.clamp((localX - width * 0.2) / (width * 0.6), 0, 1);
    let p = Math.round(8 + t * 20);
    if (p % 2 !== 0) p += 1;
    return { ...params, pins: helpers.clamp(p, 8, 28) };
  }
  if (id === 'bodyWidth') {
    const bw = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.4, 0.75);
    return { ...params, bodyWidthRatio: Number(bw.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cycle = [8, 14, 16, 20, 28];
  const idx = cycle.indexOf(params.pins);
  const next = cycle[(idx + 1) % cycle.length];
  return { ...params, pins: next };
}

function buildPaths(width, height, params, helpers) {
  const pins = Math.round(helpers.clamp(Number(params.pins) || 8, 8, 28));
  const bwRatio = helpers.clamp(Number(params.bodyWidthRatio) || 0.58, 0.4, 0.75);
  const padLenRatio = helpers.clamp(Number(params.padLengthRatio) || 0.22, 0.12, 0.32);
  const pinsPerSide = Math.max(4, Math.floor(pins / 2));

  const cx = width / 2;
  const cy = height / 2;
  const bodyW = width * bwRatio;
  const bodyH = height - 12;
  const padW = width * padLenRatio;
  const padH = Math.min(12, Math.max(3, (bodyH / pinsPerSide) * 0.65));

  const paths = [];

  // Subpath 0: Plastic Body with chamfered top-left bevel for Pin 1 indicator
  const bL = cx - bodyW / 2;
  const bR = cx + bodyW / 2;
  const bT = cy - bodyH / 2;
  const bB = cy + bodyH / 2;
  const chamf = Math.min(10, bodyW * 0.15);

  const bodyNodes = [
    helpers.cornerNode(bL + chamf, bT),
    helpers.cornerNode(bR - 2, bT),
    helpers.cornerNode(bR, bT + 2),
    helpers.cornerNode(bR, bB - 2),
    helpers.cornerNode(bR - 2, bB),
    helpers.cornerNode(bL + 2, bB),
    helpers.cornerNode(bL, bB - 2),
    helpers.cornerNode(bL, bT + chamf)
  ];
  paths.push({ nodes: bodyNodes, closed: true });

  // Subpaths 1..N: Gull-Wing SMT Solder Pads extending outwards
  const yStart = cy - bodyH / 2 + (bodyH / pinsPerSide) * 0.5;
  const yStep = bodyH / pinsPerSide;

  for (let i = 0; i < pinsPerSide; i++) {
    const py = yStart + i * yStep;
    // Left pads
    paths.push({ nodes: helpers.rectPath(bL - padW, py - padH / 2, padW, padH, 1), closed: true });
    // Right pads
    paths.push({ nodes: helpers.rectPath(bR, py - padH / 2, padW, padH, 1), closed: true });
  }

  // Pin 1 silkscreen index dot inside body near top-left
  paths.push({ nodes: helpers.circle(bL + chamf + 4, bT + chamf + 4, 2.5), closed: true });

  return paths;
}`,
  },

  // 1.3 Quad Flat Package (TQFP/LQFP 32, 44, 48, 64, 100)
  {
    id: 'pcb-ic-qfp',
    name: 'PCB: QFP IC Package',
    category: 'PCB Layout',
    description:
      'Quad Flat Package (TQFP/LQFP 32-100 pins) with 4-sided gull-wing SMT solder pads, 45-degree corner chamfers, and Pin 1 silkscreen triangle orientation index.',
    iconName: 'Cpu',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to step through QFP-32, 48, 64, 100 pin configurations',
    paramSchema: [
      { key: 'label', label: 'MCU Part Number', type: 'string', defaultValue: 'STM32F405' },
      { key: 'pinsPerSide', label: 'Pins Per Side', type: 'number', min: 8, max: 25, step: 1, defaultValue: 12 },
      { key: 'bodyRatio', label: 'Body Square Ratio', type: 'number', min: 0.55, max: 0.82, step: 0.01, defaultValue: 0.68 },
      { key: 'padReach', label: 'Pad Reach Ratio', type: 'number', min: 0.08, max: 0.22, step: 0.01, defaultValue: 0.14 },
    ],
    defaultParams: {
      label: 'STM32F405',
      pinsPerSide: 12,
      bodyRatio: 0.68,
      padReach: 0.14,
    },
    jsSourceCode: `// PCB: QFP IC Package (.jsf)
function getControlPoints(width, height, params, helpers) {
  const pps = Math.round(helpers.clamp(Number(params.pinsPerSide) || 12, 8, 25));
  const br = helpers.clamp(Number(params.bodyRatio) || 0.68, 0.55, 0.82);
  return [
    { id: 'pinsPerSide', label: \`\${pps * 4} Pins\`, x: helpers.lerp(width * 0.2, width * 0.8, (pps - 8) / 17), y: 8, cursor: 'ew-resize' },
    { id: 'bodyRatio', label: \`Body: \${Math.round(br * 100)}%\`, x: width * (0.5 + br * 0.5), y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'pinsPerSide') {
    const t = helpers.clamp((localX - width * 0.2) / (width * 0.6), 0, 1);
    return { ...params, pinsPerSide: Math.round(8 + t * 17) };
  }
  if (id === 'bodyRatio') {
    const br = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.55, 0.82);
    return { ...params, bodyRatio: Number(br.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cycle = [8, 12, 16, 25]; // 32, 48, 64, 100 pins
  const idx = cycle.indexOf(params.pinsPerSide);
  const next = cycle[(idx + 1) % cycle.length];
  return { ...params, pinsPerSide: next };
}

function buildPaths(width, height, params, helpers) {
  const pps = Math.round(helpers.clamp(Number(params.pinsPerSide) || 12, 8, 25));
  const br = helpers.clamp(Number(params.bodyRatio) || 0.68, 0.55, 0.82);
  const reach = helpers.clamp(Number(params.padReach) || 0.14, 0.08, 0.22);

  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height);
  const bodySize = size * br;
  const padLen = size * reach;
  const bHalf = bodySize / 2;
  const chamf = Math.min(12, bodySize * 0.12);

  const paths = [];

  // Subpath 0: 4-Corner Chamfered Square IC Body
  const bodyNodes = [
    helpers.cornerNode(cx - bHalf + chamf, cy - bHalf),
    helpers.cornerNode(cx + bHalf - chamf, cy - bHalf),
    helpers.cornerNode(cx + bHalf, cy - bHalf + chamf),
    helpers.cornerNode(cx + bHalf, cy + bHalf - chamf),
    helpers.cornerNode(cx + bHalf - chamf, cy + bHalf),
    helpers.cornerNode(cx - bHalf + chamf, cy + bHalf),
    helpers.cornerNode(cx - bHalf, cy + bHalf - chamf),
    helpers.cornerNode(cx - bHalf, cy - bHalf + chamf)
  ];
  paths.push({ nodes: bodyNodes, closed: true });

  // 4-Sided Gull-Wing Solder Pads
  const padSpan = bodySize - chamf * 2;
  const padStep = padSpan / Math.max(1, pps - 1);
  const padThick = Math.min(8, Math.max(2, (padSpan / pps) * 0.6));

  for (let i = 0; i < pps; i++) {
    const offset = -padSpan / 2 + i * padStep;
    // Top pads (reach upwards)
    paths.push({ nodes: helpers.rectPath(cx + offset - padThick / 2, cy - bHalf - padLen, padThick, padLen, 1), closed: true });
    // Bottom pads (reach downwards)
    paths.push({ nodes: helpers.rectPath(cx + offset - padThick / 2, cy + bHalf, padThick, padLen, 1), closed: true });
    // Left pads (reach leftwards)
    paths.push({ nodes: helpers.rectPath(cx - bHalf - padLen, cy + offset - padThick / 2, padLen, padThick, 1), closed: true });
    // Right pads (reach rightwards)
    paths.push({ nodes: helpers.rectPath(cx + bHalf, cy + offset - padThick / 2, padLen, padThick, 1), closed: true });
  }

  // Pin 1 silkscreen index triangle inside top-left corner
  const triX = cx - bHalf + chamf + 2;
  const triY = cy - bHalf + chamf + 2;
  paths.push({
    nodes: [
      helpers.cornerNode(triX, triY),
      helpers.cornerNode(triX + 8, triY),
      helpers.cornerNode(triX, triY + 8)
    ],
    closed: true
  });

  return paths;
}`,
  },

  // 1.4 Quad Flat No-Leads (QFN / DFN 16, 24, 32, 48)
  {
    id: 'pcb-ic-qfn',
    name: 'PCB: QFN Leadless IC Package',
    category: 'PCB Layout',
    description:
      'Quad Flat No-Leads surface-mount package (16-48 pins) with flush perimeter solder pads, large central thermal ground pad, and thermal via grid.',
    iconName: 'Cpu',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle central thermal via grid',
    paramSchema: [
      { key: 'label', label: 'IC Part Number', type: 'string', defaultValue: 'MPU-6000' },
      { key: 'pinsPerSide', label: 'Pins Per Side', type: 'number', min: 4, max: 16, step: 1, defaultValue: 6 },
      { key: 'thermalPadRatio', label: 'Thermal Pad Size Ratio', type: 'number', min: 0.3, max: 0.65, step: 0.01, defaultValue: 0.48 },
      { key: 'showThermalVias', label: 'Thermal Stitched Vias', type: 'boolean', defaultValue: true },
    ],
    defaultParams: {
      label: 'MPU-6000',
      pinsPerSide: 6,
      thermalPadRatio: 0.48,
      showThermalVias: true,
    },
    jsSourceCode: `// PCB: QFN Leadless IC Package (.jsf)
function getControlPoints(width, height, params, helpers) {
  const pps = Math.round(helpers.clamp(Number(params.pinsPerSide) || 6, 4, 16));
  const tr = helpers.clamp(Number(params.thermalPadRatio) || 0.48, 0.3, 0.65);
  return [
    { id: 'pinsPerSide', label: \`\${pps * 4} Pins\`, x: helpers.lerp(width * 0.2, width * 0.8, (pps - 4) / 12), y: 8, cursor: 'ew-resize' },
    { id: 'thermalPad', label: \`Thermal: \${Math.round(tr * 100)}%\`, x: width * (0.5 + tr * 0.5), y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'pinsPerSide') {
    const t = helpers.clamp((localX - width * 0.2) / (width * 0.6), 0, 1);
    return { ...params, pinsPerSide: Math.round(4 + t * 12) };
  }
  if (id === 'thermalPad') {
    const tr = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.3, 0.65);
    return { ...params, thermalPadRatio: Number(tr.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, showThermalVias: !params.showThermalVias };
}

function buildPaths(width, height, params, helpers) {
  const pps = Math.round(helpers.clamp(Number(params.pinsPerSide) || 6, 4, 16));
  const tr = helpers.clamp(Number(params.thermalPadRatio) || 0.48, 0.3, 0.65);
  const showVias = params.showThermalVias !== false;

  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height);
  const bodySize = size - 8;
  const bHalf = bodySize / 2;
  const padLen = size * 0.12;
  const padThick = Math.min(10, Math.max(3, (bodySize / pps) * 0.55));
  const thermW = bodySize * tr;
  const thermH = bodySize * tr;

  const paths = [];

  // Subpath 0: Square Plastic Package Body with Pin 1 chamfer
  const chamf = 8;
  const bodyNodes = [
    helpers.cornerNode(cx - bHalf + chamf, cy - bHalf),
    helpers.cornerNode(cx + bHalf - 2, cy - bHalf),
    helpers.cornerNode(cx + bHalf, cy - bHalf + 2),
    helpers.cornerNode(cx + bHalf, cy + bHalf - 2),
    helpers.cornerNode(cx + bHalf - 2, cy + bHalf),
    helpers.cornerNode(cx - bHalf + 2, cy + bHalf),
    helpers.cornerNode(cx - bHalf, cy + bHalf - 2),
    helpers.cornerNode(cx - bHalf, cy - bHalf + chamf)
  ];
  paths.push({ nodes: bodyNodes, closed: true });

  // Subpath 1: Large Central Thermal Ground Pad
  paths.push({ nodes: helpers.rectPath(cx - thermW / 2, cy - thermH / 2, thermW, thermH, 2), closed: true });

  // Subpath 2..M: Thermal Stitched Vias Grid inside Ground Pad
  if (showVias && thermW > 24) {
    const viaGrid = thermW > 45 ? 3 : 2;
    const viaR = 2.5;
    const vStep = thermW / (viaGrid + 1);
    for (let r = 1; r <= viaGrid; r++) {
      for (let c = 1; c <= viaGrid; c++) {
        const vx = cx - thermW / 2 + c * vStep;
        const vy = cy - thermH / 2 + r * vStep;
        paths.push({ nodes: helpers.circle(vx, vy, viaR), closed: true });
      }
    }
  }

  // Subpaths for Flush Perimeter SMT Pads
  const padSpan = bodySize - padLen * 2;
  const padStep = padSpan / Math.max(1, pps - 1);

  for (let i = 0; i < pps; i++) {
    const offset = -padSpan / 2 + i * padStep;
    // Top pads (flush to top edge)
    paths.push({ nodes: helpers.rectPath(cx + offset - padThick / 2, cy - bHalf, padThick, padLen, 1), closed: true });
    // Bottom pads
    paths.push({ nodes: helpers.rectPath(cx + offset - padThick / 2, cy + bHalf - padLen, padThick, padLen, 1), closed: true });
    // Left pads
    paths.push({ nodes: helpers.rectPath(cx - bHalf, cy + offset - padThick / 2, padLen, padThick, 1), closed: true });
    // Right pads
    paths.push({ nodes: helpers.rectPath(cx + bHalf - padLen, cy + offset - padThick / 2, padLen, padThick, 1), closed: true });
  }

  return paths;
}`,
  },

  // 1.5 SOT-23 / SOT-223 Discrete Transistor & Voltage Regulator
  {
    id: 'pcb-discrete-sot',
    name: 'PCB: SOT-23 / SOT-223 Package',
    category: 'PCB Layout',
    description:
      'Discrete Small Outline Transistor / Voltage Regulator footprint supporting SOT-23 (3/5/6-pin) and SOT-223 with large high-dissipation copper heatsink tab.',
    iconName: 'Zap',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle between SOT-23 (3-pin), SOT-223 (4-pin tab), and SOT-23-5',
    paramSchema: [
      { key: 'label', label: 'Part Reference', type: 'string', defaultValue: 'AMS1117-3.3' },
      { key: 'packageType', label: 'Type (1=SOT-23, 2=SOT-223, 3=SOT-23-5)', type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
      { key: 'bodyWidthRatio', label: 'Body Width Ratio', type: 'number', min: 0.35, max: 0.7, step: 0.02, defaultValue: 0.52 },
    ],
    defaultParams: {
      label: 'AMS1117-3.3',
      packageType: 2,
      bodyWidthRatio: 0.52,
    },
    jsSourceCode: `// PCB: SOT-23 / SOT-223 Package (.jsf)
function getControlPoints(width, height, params, helpers) {
  const bw = helpers.clamp(Number(params.bodyWidthRatio) || 0.52, 0.35, 0.7);
  const pkg = Math.round(helpers.clamp(Number(params.packageType) || 2, 1, 3));
  const names = ['SOT-23', 'SOT-223', 'SOT-23-5'];
  return [
    { id: 'bodyWidth', label: \`Body: \${Math.round(bw * 100)}%\`, x: width * (0.5 + bw * 0.5), y: height * 0.5, cursor: 'ew-resize' },
    { id: 'packageType', label: names[pkg - 1], x: width * 0.5, y: height - 8, cursor: 'pointer' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'bodyWidth') {
    const bw = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.35, 0.7);
    return { ...params, bodyWidthRatio: Number(bw.toFixed(2)) };
  }
  if (id === 'packageType') {
    const t = helpers.clamp(localX / Math.max(1, width), 0, 1);
    return { ...params, packageType: Math.round(1 + t * 2) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = (params.packageType % 3) + 1;
  return { ...params, packageType: next };
}

function buildPaths(width, height, params, helpers) {
  const pkg = Math.round(helpers.clamp(Number(params.packageType) || 2, 1, 3));
  const bw = helpers.clamp(Number(params.bodyWidthRatio) || 0.52, 0.35, 0.7);

  const cx = width / 2;
  const cy = height / 2;
  const bodyW = width * bw;
  const bodyH = height * 0.5;

  const paths = [];

  // Subpath 0: Epoxy Package Body
  paths.push({ nodes: helpers.rectPath(cx - bodyW / 2, cy - bodyH / 2, bodyW, bodyH, 2), closed: true });

  if (pkg === 2) {
    // SOT-223: 3 signal pads on bottom, 1 large wide copper heatsink tab on top
    const tabW = bodyW * 0.85;
    const tabH = height * 0.22;
    paths.push({ nodes: helpers.rectPath(cx - tabW / 2, cy - bodyH / 2 - tabH, tabW, tabH, 1), closed: true });

    const sigW = bodyW * 0.22;
    const sigH = height * 0.22;
    const sigStep = bodyW * 0.32;
    for (let i = -1; i <= 1; i++) {
      paths.push({ nodes: helpers.rectPath(cx + i * sigStep - sigW / 2, cy + bodyH / 2, sigW, sigH, 1), closed: true });
    }
  } else if (pkg === 1) {
    // SOT-23: 2 pads on bottom, 1 pad on top
    const padW = bodyW * 0.26;
    const padH = height * 0.22;
    // Top center pad
    paths.push({ nodes: helpers.rectPath(cx - padW / 2, cy - bodyH / 2 - padH, padW, padH, 1), closed: true });
    // Bottom 2 pads
    paths.push({ nodes: helpers.rectPath(cx - bodyW * 0.32 - padW / 2, cy + bodyH / 2, padW, padH, 1), closed: true });
    paths.push({ nodes: helpers.rectPath(cx + bodyW * 0.32 - padW / 2, cy + bodyH / 2, padW, padH, 1), closed: true });
  } else {
    // SOT-23-5: 2 pads on top, 3 pads on bottom
    const padW = bodyW * 0.2;
    const padH = height * 0.22;
    // Top 2 pads
    paths.push({ nodes: helpers.rectPath(cx - bodyW * 0.25 - padW / 2, cy - bodyH / 2 - padH, padW, padH, 1), closed: true });
    paths.push({ nodes: helpers.rectPath(cx + bodyW * 0.25 - padW / 2, cy - bodyH / 2 - padH, padW, padH, 1), closed: true });
    // Bottom 3 pads
    for (let i = -1; i <= 1; i++) {
      paths.push({ nodes: helpers.rectPath(cx + i * bodyW * 0.3 - padW / 2, cy + bodyH / 2, padW, padH, 1), closed: true });
    }
  }

  // Silkscreen Pin 1 index dot
  paths.push({ nodes: helpers.circle(cx - bodyW / 2 + 5, cy + bodyH / 2 - 5, 2), closed: true });

  return paths;
}`,
  },

  // 1.6 TO-220 Power Package (Voltage Regulator / Power MOSFET)
  {
    id: 'pcb-power-to220',
    name: 'PCB: TO-220 Power Package',
    category: 'PCB Layout',
    description:
      'High-power through-hole TO-220 footprint with metal tab heatsink, mounting screw hole, and 3 through-hole lead pads with annular rings.',
    iconName: 'Zap',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle central mounting screw hole',
    paramSchema: [
      { key: 'label', label: 'Device Part Number', type: 'string', defaultValue: 'LM7805' },
      { key: 'leadCount', label: 'Lead Count (2, 3, or 5)', type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
      { key: 'tabHeightRatio', label: 'Metal Tab Height Ratio', type: 'number', min: 0.22, max: 0.48, step: 0.02, defaultValue: 0.35 },
      { key: 'showHole', label: 'Mounting Screw Hole', type: 'boolean', defaultValue: true },
    ],
    defaultParams: {
      label: 'LM7805',
      leadCount: 3,
      tabHeightRatio: 0.35,
      showHole: true,
    },
    jsSourceCode: `// PCB: TO-220 Power Package (.jsf)
function getControlPoints(width, height, params, helpers) {
  const tab = helpers.clamp(Number(params.tabHeightRatio) || 0.35, 0.22, 0.48);
  const leads = Math.round(helpers.clamp(Number(params.leadCount) || 3, 2, 5));
  return [
    { id: 'tabHeight', label: \`Tab: \${Math.round(tab * 100)}%\`, x: width * 0.5, y: height * tab, cursor: 'ns-resize' },
    { id: 'leadCount', label: \`\${leads} Leads\`, x: helpers.lerp(width * 0.25, width * 0.75, (leads - 2) / 3), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'tabHeight') {
    const tab = helpers.clamp(localY / Math.max(1, height), 0.22, 0.48);
    return { ...params, tabHeightRatio: Number(tab.toFixed(2)) };
  }
  if (id === 'leadCount') {
    const t = helpers.clamp((localX - width * 0.25) / (width * 0.5), 0, 1);
    return { ...params, leadCount: Math.round(2 + t * 3) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, showHole: !params.showHole };
}

function buildPaths(width, height, params, helpers) {
  const tabRatio = helpers.clamp(Number(params.tabHeightRatio) || 0.35, 0.22, 0.48);
  const leads = Math.round(helpers.clamp(Number(params.leadCount) || 3, 2, 5));
  const showHole = params.showHole !== false;

  const cx = width / 2;
  const tabH = height * tabRatio;
  const bodyW = width * 0.88;
  const bodyH = height * 0.42;
  const bodyY = tabH;

  const paths = [];

  // Subpath 0: Metal Heat Sink Tab Outline at Top
  paths.push({ nodes: helpers.rectPath(cx - bodyW / 2, 4, bodyW, tabH, 3), closed: true });

  // Subpath 1: Molded Plastic Epoxy Lower Body
  paths.push({ nodes: helpers.rectPath(cx - bodyW / 2, bodyY, bodyW, bodyH, 2), closed: true });

  // Subpath 2: Mounting Screw Hole in Tab
  if (showHole) {
    const holeR = Math.min(14, tabH * 0.38);
    paths.push({ nodes: helpers.circle(cx, tabH * 0.55, holeR), closed: true });
  }

  // Subpaths 3..N: Through-Hole Annular Solder Pads for Leads at Bottom
  const padR = Math.min(10, Math.max(4, (bodyW / leads) * 0.28));
  const drillR = padR * 0.45;
  const leadY = height - padR - 6;
  const leadSpan = bodyW * 0.65;
  const leadStep = leadSpan / Math.max(1, leads - 1);

  for (let i = 0; i < leads; i++) {
    const lx = cx - leadSpan / 2 + i * leadStep;
    // Pin 1 is square pad
    if (i === 0) {
      paths.push({ nodes: helpers.rectPath(lx - padR, leadY - padR, padR * 2, padR * 2, 1), closed: true });
    } else {
      paths.push({ nodes: helpers.circle(lx, leadY, padR), closed: true });
    }
    // Drill hole
    paths.push({ nodes: helpers.circle(lx, leadY, drillR), closed: true });
  }

  return paths;
}`,
  },

  // =========================================================================
  // 2. PASSIVE COMPONENTS
  // =========================================================================

  // 2.1 SMT Chip Resistor / Capacitor (0402, 0603, 0805, 1206, 2512)
  {
    id: 'pcb-passive-smd-chip',
    name: 'PCB: SMT Chip Passive (0402-2512)',
    category: 'PCB Layout',
    description:
      'Surface-mount 2-terminal chip passive footprint (resistor/capacitor/inductor) with rectangular solder pads, component body, and silkscreen corner brackets.',
    iconName: 'Zap',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle component symbol (Resistor -> Capacitor -> Inductor)',
    paramSchema: [
      { key: 'label', label: 'Value / Reference', type: 'string', defaultValue: '10k 0805' },
      { key: 'padWidthRatio', label: 'Pad Length Ratio', type: 'number', min: 0.18, max: 0.42, step: 0.01, defaultValue: 0.28 },
      { key: 'componentType', label: 'Symbol (1=R, 2=C, 3=L)', type: 'number', min: 1, max: 3, step: 1, defaultValue: 1 },
      { key: 'showBrackets', label: 'Silkscreen Brackets', type: 'boolean', defaultValue: true },
    ],
    defaultParams: {
      label: '10k 0805',
      padWidthRatio: 0.28,
      componentType: 1,
      showBrackets: true,
    },
    jsSourceCode: `// PCB: SMT Chip Passive (.jsf)
function getControlPoints(width, height, params, helpers) {
  const pw = helpers.clamp(Number(params.padWidthRatio) || 0.28, 0.18, 0.42);
  const type = Math.round(helpers.clamp(Number(params.componentType) || 1, 1, 3));
  const typeNames = ['Resistor (R)', 'Capacitor (C)', 'Inductor (L)'];
  return [
    { id: 'padWidth', label: \`Pad: \${Math.round(pw * 100)}%\`, x: width * pw, y: height * 0.5, cursor: 'ew-resize' },
    { id: 'type', label: typeNames[type - 1], x: helpers.lerp(width * 0.25, width * 0.75, (type - 1) / 2), y: height - 6, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'padWidth') {
    const pw = helpers.clamp(localX / Math.max(1, width), 0.18, 0.42);
    return { ...params, padWidthRatio: Number(pw.toFixed(2)) };
  }
  if (id === 'type') {
    const t = helpers.clamp(localX / Math.max(1, width), 0, 1);
    const nextType = helpers.clamp(Math.round(1 + t * 2), 1, 3);
    return { ...params, componentType: nextType };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = (params.componentType % 3) + 1;
  return { ...params, componentType: next };
}

function buildPaths(width, height, params, helpers) {
  const pwRatio = helpers.clamp(Number(params.padWidthRatio) || 0.28, 0.18, 0.42);
  const showBrackets = params.showBrackets !== false;

  const cx = width / 2;
  const cy = height / 2;
  const padW = width * pwRatio;
  const padH = height * 0.76;
  const bodyW = width - padW * 2 + 4;
  const bodyH = height * 0.62;

  const paths = [];

  // Subpath 0: Component Body (Ceramic / Epoxy)
  paths.push({ nodes: helpers.rectPath(cx - bodyW / 2, cy - bodyH / 2, bodyW, bodyH, 2), closed: true });

  // Subpaths 1, 2: Left and Right SMT Solder Pads
  paths.push({ nodes: helpers.rectPath(4, cy - padH / 2, padW, padH, 1), closed: true });
  paths.push({ nodes: helpers.rectPath(width - 4 - padW, cy - padH / 2, padW, padH, 1), closed: true });

  // Subpaths 3..6: Silkscreen Corner Brackets
  if (showBrackets) {
    const bArm = 6;
    // Top-Left bracket
    paths.push({
      nodes: [
        helpers.cornerNode(2, bArm),
        helpers.cornerNode(2, 2),
        helpers.cornerNode(2 + bArm, 2)
      ],
      closed: false
    });
    // Top-Right bracket
    paths.push({
      nodes: [
        helpers.cornerNode(width - 2 - bArm, 2),
        helpers.cornerNode(width - 2, 2),
        helpers.cornerNode(width - 2, bArm)
      ],
      closed: false
    });
    // Bottom-Left bracket
    paths.push({
      nodes: [
        helpers.cornerNode(2, height - bArm),
        helpers.cornerNode(2, height - 2),
        helpers.cornerNode(2 + bArm, height - 2)
      ],
      closed: false
    });
    // Bottom-Right bracket
    paths.push({
      nodes: [
        helpers.cornerNode(width - 2 - bArm, height - 2),
        helpers.cornerNode(width - 2, height - 2),
        helpers.cornerNode(width - 2, height - bArm)
      ],
      closed: false
    });
  }

  return paths;
}`,
  },

  // 2.2 Leaded Axial Resistor / Diode
  {
    id: 'pcb-passive-axial',
    name: 'PCB: Axial Leaded Passive',
    category: 'PCB Layout',
    description:
      'Axial through-hole resistor or diode footprint with adjustable lead span, cylindrical body, polarity cathode stripe / color bands, and annular through-hole pads.',
    iconName: 'Zap',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle between Diode and Resistor package marking',
    paramSchema: [
      { key: 'label', label: 'Part Reference', type: 'string', defaultValue: '1N4007' },
      { key: 'bodyLengthRatio', label: 'Body Length Ratio', type: 'number', min: 0.25, max: 0.65, step: 0.02, defaultValue: 0.45 },
      { key: 'leadSpanRatio', label: 'Lead Span Ratio', type: 'number', min: 0.6, max: 0.95, step: 0.02, defaultValue: 0.85 },
      { key: 'isDiode', label: 'Diode Polarity Band', type: 'boolean', defaultValue: true },
    ],
    defaultParams: {
      label: '1N4007',
      bodyLengthRatio: 0.45,
      leadSpanRatio: 0.85,
      isDiode: true,
    },
    jsSourceCode: `// PCB: Axial Leaded Passive (.jsf)
function getControlPoints(width, height, params, helpers) {
  const bl = helpers.clamp(Number(params.bodyLengthRatio) || 0.45, 0.25, 0.65);
  const ls = helpers.clamp(Number(params.leadSpanRatio) || 0.85, 0.6, 0.95);
  return [
    { id: 'bodyLength', label: \`Body: \${Math.round(bl * 100)}%\`, x: width * (0.5 + bl * 0.5), y: height * 0.5, cursor: 'ew-resize' },
    { id: 'leadSpan', label: \`Span: \${Math.round(ls * 100)}%\`, x: width * (0.5 + ls * 0.5), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'bodyLength') {
    const bl = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.25, 0.65);
    return { ...params, bodyLengthRatio: Number(bl.toFixed(2)) };
  }
  if (id === 'leadSpan') {
    const ls = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.6, 0.95);
    return { ...params, leadSpanRatio: Number(ls.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, isDiode: !params.isDiode };
}

function buildPaths(width, height, params, helpers) {
  const blRatio = helpers.clamp(Number(params.bodyLengthRatio) || 0.45, 0.25, 0.65);
  const lsRatio = helpers.clamp(Number(params.leadSpanRatio) || 0.85, 0.6, 0.95);
  const isDiode = params.isDiode !== false;

  const cx = width / 2;
  const cy = height / 2;
  const bodyW = width * blRatio;
  const bodyH = height * 0.45;
  const padSpan = width * lsRatio;
  const padR = Math.min(10, Math.max(4, height * 0.22));
  const drillR = padR * 0.45;
  const leftPadX = cx - padSpan / 2;
  const rightPadX = cx + padSpan / 2;

  const paths = [];

  // Subpath 0: Cylindrical Axial Body
  paths.push({ nodes: helpers.rectPath(cx - bodyW / 2, cy - bodyH / 2, bodyW, bodyH, 4), closed: true });

  // Subpath 1, 2: Wire Leads from body ends to pads (open lines)
  paths.push({
    nodes: [helpers.cornerNode(leftPadX, cy), helpers.cornerNode(cx - bodyW / 2, cy)],
    closed: false
  });
  paths.push({
    nodes: [helpers.cornerNode(cx + bodyW / 2, cy), helpers.cornerNode(rightPadX, cy)],
    closed: false
  });

  // Subpath 3, 4: Annular Rings & Drill Holes
  // Left pad: square if diode cathode
  if (isDiode) {
    paths.push({ nodes: helpers.rectPath(leftPadX - padR, cy - padR, padR * 2, padR * 2, 1), closed: true });
  } else {
    paths.push({ nodes: helpers.circle(leftPadX, cy, padR), closed: true });
  }
  paths.push({ nodes: helpers.circle(leftPadX, cy, drillR), closed: true });

  paths.push({ nodes: helpers.circle(rightPadX, cy, padR), closed: true });
  paths.push({ nodes: helpers.circle(rightPadX, cy, drillR), closed: true });

  // Cathode stripe / diode band if diode
  if (isDiode) {
    const bandW = bodyW * 0.16;
    paths.push({ nodes: helpers.rectPath(cx - bodyW / 2 + 4, cy - bodyH / 2, bandW, bodyH, 0), closed: true });
  }

  return paths;
}`,
  },

  // 2.3 Radial Electrolytic Capacitor Can
  {
    id: 'pcb-passive-radial-cap',
    name: 'PCB: Radial Electrolytic Can',
    category: 'PCB Layout',
    description:
      'Radial electrolytic / tantalum aluminum capacitor can with negative polarity band, square positive pad (+), round negative pad (-), and drill holes.',
    iconName: 'Circle',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle polarity markings',
    paramSchema: [
      { key: 'label', label: 'Capacitance / Voltage', type: 'string', defaultValue: '470uF 25V' },
      { key: 'diameterRatio', label: 'Can Diameter Ratio', type: 'number', min: 0.55, max: 0.92, step: 0.02, defaultValue: 0.78 },
      { key: 'pinPitchRatio', label: 'Lead Pitch Ratio', type: 'number', min: 0.22, max: 0.52, step: 0.02, defaultValue: 0.36 },
      { key: 'polarityStripe', label: 'Show Polarity Stripe', type: 'boolean', defaultValue: true },
    ],
    defaultParams: {
      label: '470uF 25V',
      diameterRatio: 0.78,
      pinPitchRatio: 0.36,
      polarityStripe: true,
    },
    jsSourceCode: `// PCB: Radial Electrolytic Can (.jsf)
function getControlPoints(width, height, params, helpers) {
  const d = helpers.clamp(Number(params.diameterRatio) || 0.78, 0.55, 0.92);
  const p = helpers.clamp(Number(params.pinPitchRatio) || 0.36, 0.22, 0.52);
  return [
    { id: 'diameter', label: \`Can: \${Math.round(d * 100)}%\`, x: width * (0.5 + d * 0.5), y: height * 0.5, cursor: 'ew-resize' },
    { id: 'pinPitch', label: \`Pitch: \${Math.round(p * 100)}%\`, x: width * (0.5 + p * 0.5), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'diameter') {
    const d = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.55, 0.92);
    return { ...params, diameterRatio: Number(d.toFixed(2)) };
  }
  if (id === 'pinPitch') {
    const p = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.22, 0.52);
    return { ...params, pinPitchRatio: Number(p.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, polarityStripe: !params.polarityStripe };
}

function buildPaths(width, height, params, helpers) {
  const dRatio = helpers.clamp(Number(params.diameterRatio) || 0.78, 0.55, 0.92);
  const pRatio = helpers.clamp(Number(params.pinPitchRatio) || 0.36, 0.22, 0.52);
  const stripe = params.polarityStripe !== false;

  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height);
  const r = (size * dRatio) / 2;
  const padDist = r * pRatio * 1.5;
  const padR = Math.min(8, Math.max(3, r * 0.22));
  const drillR = padR * 0.45;

  const paths = [];

  // Subpath 0: Circular Can Outline
  paths.push({ nodes: helpers.circle(cx, cy, r), closed: true });

  // Subpath 1: Negative Polarity Band (crescent segment or rectangle on right)
  if (stripe) {
    const bandW = r * 0.45;
    paths.push({ nodes: helpers.rectPath(cx + r - bandW, cy - r * 0.8, bandW, r * 1.6, 2), closed: true });
  }

  // Subpaths 2..5: Through-Hole Pads & Drill Holes
  // Positive (+) pad on left: Square DRC pad
  const pX = cx - padDist;
  const nX = cx + padDist;

  paths.push({ nodes: helpers.rectPath(pX - padR, cy - padR, padR * 2, padR * 2, 1), closed: true });
  paths.push({ nodes: helpers.circle(pX, cy, drillR), closed: true });

  // Negative (-) pad on right: Circular pad
  paths.push({ nodes: helpers.circle(nX, cy, padR), closed: true });
  paths.push({ nodes: helpers.circle(nX, cy, drillR), closed: true });

  return paths;
}`,
  },

  // 2.4 Shielded SMT Power Inductor / Choke
  {
    id: 'pcb-passive-inductor-smd',
    name: 'PCB: Shielded Power Inductor',
    category: 'PCB Layout',
    description:
      'High-current shielded SMT power inductor / ferrite choke footprint with dual heavy solder pads and octagonal/square core body.',
    iconName: 'Radio',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle internal magnetic core silkscreen circle',
    paramSchema: [
      { key: 'label', label: 'Inductance / Current', type: 'string', defaultValue: '10uH 5A' },
      { key: 'padWidthRatio', label: 'Pad Width Ratio', type: 'number', min: 0.15, max: 0.35, step: 0.01, defaultValue: 0.22 },
      { key: 'showCoreMark', label: 'Show Core Marking', type: 'boolean', defaultValue: true },
    ],
    defaultParams: {
      label: '10uH 5A',
      padWidthRatio: 0.22,
      showCoreMark: true,
    },
    jsSourceCode: `// PCB: Shielded Power Inductor (.jsf)
function getControlPoints(width, height, params, helpers) {
  const pw = helpers.clamp(Number(params.padWidthRatio) || 0.22, 0.15, 0.35);
  return [
    { id: 'padWidth', label: \`Pad: \${Math.round(pw * 100)}%\`, x: width * pw, y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'padWidth') {
    const pw = helpers.clamp(localX / Math.max(1, width), 0.15, 0.35);
    return { ...params, padWidthRatio: Number(pw.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, showCoreMark: !params.showCoreMark };
}

function buildPaths(width, height, params, helpers) {
  const pwRatio = helpers.clamp(Number(params.padWidthRatio) || 0.22, 0.15, 0.35);
  const showCore = params.showCoreMark !== false;

  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height);
  const bodySize = size * 0.88;
  const bHalf = bodySize / 2;
  const chamf = bodySize * 0.15;
  const padW = width * pwRatio;
  const padH = bodySize * 0.85;

  const paths = [];

  // Subpath 0: Octagonal Shielded Ferrite Body
  const bodyNodes = [
    helpers.cornerNode(cx - bHalf + chamf, cy - bHalf),
    helpers.cornerNode(cx + bHalf - chamf, cy - bHalf),
    helpers.cornerNode(cx + bHalf, cy - bHalf + chamf),
    helpers.cornerNode(cx + bHalf, cy + bHalf - chamf),
    helpers.cornerNode(cx + bHalf - chamf, cy + bHalf),
    helpers.cornerNode(cx - bHalf + chamf, cy + bHalf),
    helpers.cornerNode(cx - bHalf, cy + bHalf - chamf),
    helpers.cornerNode(cx - bHalf, cy - bHalf + chamf)
  ];
  paths.push({ nodes: bodyNodes, closed: true });

  // Subpaths 1, 2: Dual Heavy High-Current SMT Solder Pads
  paths.push({ nodes: helpers.rectPath(cx - bHalf - padW * 0.5, cy - padH / 2, padW, padH, 2), closed: true });
  paths.push({ nodes: helpers.rectPath(cx + bHalf - padW * 0.5, cy - padH / 2, padW, padH, 2), closed: true });

  // Subpath 3: Core Winding Circle Silkscreen
  if (showCore) {
    paths.push({ nodes: helpers.circle(cx, cy, bodySize * 0.32), closed: true });
  }

  return paths;
}`,
  },

  // 2.5 Multi-Turn Trimmer Potentiometer
  {
    id: 'pcb-passive-trimmer',
    name: 'PCB: Trimmer Potentiometer',
    category: 'PCB Layout',
    description:
      '3-lead multi-turn precision cermet trimmer potentiometer footprint with slotted brass adjustment screw and through-hole solder pins.',
    iconName: 'Sliders',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to step screw slot rotation angle',
    paramSchema: [
      { key: 'label', label: 'Resistance Value', type: 'string', defaultValue: '10k Trimmer' },
      { key: 'screwOffsetRatio', label: 'Screw Position', type: 'number', min: 0.25, max: 0.75, step: 0.05, defaultValue: 0.5 },
      { key: 'slotAngleDeg', label: 'Screw Slot Angle (°)', type: 'number', min: 0, max: 180, step: 15, defaultValue: 45 },
    ],
    defaultParams: {
      label: '10k Trimmer',
      screwOffsetRatio: 0.5,
      slotAngleDeg: 45,
    },
    jsSourceCode: `// PCB: Trimmer Potentiometer (.jsf)
function getControlPoints(width, height, params, helpers) {
  const so = helpers.clamp(Number(params.screwOffsetRatio) || 0.5, 0.25, 0.75);
  return [
    { id: 'screw', label: \`Screw: \${Math.round(so * 100)}%\`, x: width * so, y: height * 0.35, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'screw') {
    const so = helpers.clamp(localX / Math.max(1, width), 0.25, 0.75);
    return { ...params, screwOffsetRatio: Number(so.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = (params.slotAngleDeg + 30) % 180;
  return { ...params, slotAngleDeg: next };
}

function buildPaths(width, height, params, helpers) {
  const so = helpers.clamp(Number(params.screwOffsetRatio) || 0.5, 0.25, 0.75);
  const ang = (Number(params.slotAngleDeg) || 45) * (Math.PI / 180);

  const cx = width / 2;
  const bodyW = width * 0.88;
  const bodyH = height * 0.65;
  const padR = Math.min(8, Math.max(3, height * 0.12));
  const drillR = padR * 0.45;

  const paths = [];

  // Subpath 0: Rectangular Casing Body
  paths.push({ nodes: helpers.rectPath(cx - bodyW / 2, 4, bodyW, bodyH, 3), closed: true });

  // Subpath 1: Brass Adjustment Screw Dial
  const screwX = width * so;
  const screwY = 4 + bodyH * 0.5;
  const screwR = Math.min(14, bodyH * 0.32);
  paths.push({ nodes: helpers.circle(screwX, screwY, screwR), closed: true });

  // Subpath 2: Slotted Screwdriver Groove (open line)
  const dx = Math.cos(ang) * (screwR * 0.75);
  const dy = Math.sin(ang) * (screwR * 0.75);
  paths.push({
    nodes: [helpers.cornerNode(screwX - dx, screwY - dy), helpers.cornerNode(screwX + dx, screwY + dy)],
    closed: false
  });

  // Subpaths 3..8: 3 Terminal Pins at Bottom (Pin 1, Wiper 2, Pin 3)
  const pinY = height - padR - 4;
  const pinSpan = bodyW * 0.7;
  for (let i = 0; i < 3; i++) {
    const px = cx - pinSpan / 2 + i * (pinSpan / 2);
    if (i === 0) {
      paths.push({ nodes: helpers.rectPath(px - padR, pinY - padR, padR * 2, padR * 2, 1), closed: true });
    } else {
      paths.push({ nodes: helpers.circle(px, pinY, padR), closed: true });
    }
    paths.push({ nodes: helpers.circle(px, pinY, drillR), closed: true });
  }

  return paths;
}`,
  },

  // =========================================================================
  // 3. CONNECTORS & PIN HEADERS
  // =========================================================================

  // 3.1 0.1" (2.54mm) Pin Header 1xN / 2xN
  {
    id: 'pcb-conn-header-0100',
    name: 'PCB: 0.1" (2.54mm) Pin Header',
    category: 'PCB Layout',
    description:
      'Standard 0.1-inch (2.54mm) pitch pin header footprint (1xN or 2xN) with square Pin 1 DRC pad, circular Pins 2..N, annular through-hole rings, and shroud box.',
    iconName: 'Sliders',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle between Single-Row (1xN) and Dual-Row (2xN)',
    paramSchema: [
      { key: 'label', label: 'Header Function', type: 'string', defaultValue: 'SWD / UART' },
      { key: 'pins', label: 'Pins Per Row', type: 'number', min: 2, max: 20, step: 1, defaultValue: 6 },
      { key: 'isDualRow', label: 'Dual Row (2xN)', type: 'boolean', defaultValue: false },
    ],
    defaultParams: {
      label: 'SWD / UART',
      pins: 6,
      isDualRow: false,
    },
    jsSourceCode: `// PCB: 0.1" Pin Header (.jsf)
function getControlPoints(width, height, params, helpers) {
  const pins = Math.round(helpers.clamp(Number(params.pins) || 6, 2, 20));
  const dual = params.isDualRow === true;
  return [
    { id: 'pins', label: \`\${dual ? pins * 2 : pins} Pins\`, x: helpers.lerp(width * 0.2, width * 0.8, (pins - 2) / 18), y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'pins') {
    const t = helpers.clamp((localX - width * 0.2) / (width * 0.6), 0, 1);
    return { ...params, pins: Math.round(2 + t * 18) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, isDualRow: !params.isDualRow };
}

function buildPaths(width, height, params, helpers) {
  const pins = Math.round(helpers.clamp(Number(params.pins) || 6, 2, 20));
  const dual = params.isDualRow === true;

  const cx = width / 2;
  const cy = height / 2;
  const padSpan = width - 16;
  const step = padSpan / Math.max(1, pins - 1);
  const padR = Math.min(10, Math.max(4, step * 0.35));
  const drillR = padR * 0.45;
  const rowOffset = dual ? Math.min(16, height * 0.25) : 0;

  const paths = [];

  // Subpath 0: Plastic Header Shroud Outline
  const shroudH = dual ? rowOffset * 2 + padR * 3 : padR * 3.6;
  paths.push({ nodes: helpers.rectPath(4, cy - shroudH / 2, width - 8, shroudH, 2), closed: true });

  // Row 1 (Top or Single)
  const y1 = cy - rowOffset;
  for (let i = 0; i < pins; i++) {
    const px = 8 + padR + i * step;
    if (i === 0) {
      paths.push({ nodes: helpers.rectPath(px - padR, y1 - padR, padR * 2, padR * 2, 1), closed: true });
    } else {
      paths.push({ nodes: helpers.circle(px, y1, padR), closed: true });
    }
    paths.push({ nodes: helpers.circle(px, y1, drillR), closed: true });
  }

  // Row 2 (Bottom if Dual Row)
  if (dual) {
    const y2 = cy + rowOffset;
    for (let i = 0; i < pins; i++) {
      const px = 8 + padR + i * step;
      paths.push({ nodes: helpers.circle(px, y2, padR), closed: true });
      paths.push({ nodes: helpers.circle(px, y2, drillR), closed: true });
    }
  }

  return paths;
}`,
  },

  // 3.2 JST Keyed Wire Connector (SH 1.0mm, GH 1.25mm, XH 2.5mm)
  {
    id: 'pcb-conn-jst',
    name: 'PCB: JST Wire Connector',
    category: 'PCB Layout',
    description:
      'Keyed wire-to-board JST connector footprint supporting JST-SH (1.0mm), JST-GH (1.25mm), and JST-XH (2.5mm) with locking notch and solder tabs.',
    iconName: 'Maximize2',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle series: JST-SH (1.0mm) -> JST-GH (1.25mm) -> JST-XH (2.5mm)',
    paramSchema: [
      { key: 'label', label: 'Connector Name', type: 'string', defaultValue: 'JST-SH 4P' },
      { key: 'pins', label: 'Pin Count', type: 'number', min: 2, max: 12, step: 1, defaultValue: 4 },
      { key: 'series', label: 'Series (1=SH, 2=GH, 3=XH)', type: 'number', min: 1, max: 3, step: 1, defaultValue: 1 },
    ],
    defaultParams: {
      label: 'JST-SH 4P',
      pins: 4,
      series: 1,
    },
    jsSourceCode: `// PCB: JST Wire Connector (.jsf)
function getControlPoints(width, height, params, helpers) {
  const pins = Math.round(helpers.clamp(Number(params.pins) || 4, 2, 12));
  const series = Math.round(helpers.clamp(Number(params.series) || 1, 1, 3));
  const seriesNames = ['JST-SH (1.0mm)', 'JST-GH (1.25mm)', 'JST-XH (2.5mm)'];
  return [
    { id: 'pins', label: \`\${pins} Pins\`, x: helpers.lerp(width * 0.25, width * 0.75, (pins - 2) / 10), y: height - 6, cursor: 'ew-resize' },
    { id: 'series', label: seriesNames[series - 1], x: helpers.lerp(width * 0.25, width * 0.75, (series - 1) / 2), y: 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'pins') {
    const t = helpers.clamp((localX - width * 0.25) / (width * 0.5), 0, 1);
    return { ...params, pins: Math.round(2 + t * 10) };
  }
  if (id === 'series') {
    const t = helpers.clamp(localX / Math.max(1, width), 0, 1);
    const nextSeries = helpers.clamp(Math.round(1 + t * 2), 1, 3);
    return { ...params, series: nextSeries };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = (params.series % 3) + 1;
  return { ...params, series: next };
}

function buildPaths(width, height, params, helpers) {
  const pins = Math.round(helpers.clamp(Number(params.pins) || 4, 2, 12));

  const cx = width / 2;
  const cy = height / 2;
  const bodyW = width * 0.88;
  const bodyH = height * 0.65;
  const bL = cx - bodyW / 2;
  const bT = cy - bodyH / 2;

  const paths = [];

  // Subpath 0: Keyed Molded Plastic Housing with Top Latch Cutout
  const latchW = bodyW * 0.35;
  const latchH = bodyH * 0.22;
  const housingNodes = [
    helpers.cornerNode(bL + 2, bT),
    helpers.cornerNode(cx - latchW / 2, bT),
    helpers.cornerNode(cx - latchW / 2, bT + latchH),
    helpers.cornerNode(cx + latchW / 2, bT + latchH),
    helpers.cornerNode(cx + latchW / 2, bT),
    helpers.cornerNode(bL + bodyW - 2, bT),
    helpers.cornerNode(bL + bodyW, bT + 2),
    helpers.cornerNode(bL + bodyW, bT + bodyH - 2),
    helpers.cornerNode(bL + bodyW - 2, bT + bodyH),
    helpers.cornerNode(bL + 2, bT + bodyH),
    helpers.cornerNode(bL, bT + bodyH - 2),
    helpers.cornerNode(bL, bT + 2)
  ];
  paths.push({ nodes: housingNodes, closed: true });

  // Subpaths 1, 2: Mechanical SMT Retention Tabs on Flanks
  const tabW = Math.min(10, width * 0.08);
  const tabH = bodyH * 0.45;
  paths.push({ nodes: helpers.rectPath(bL - tabW, cy - tabH / 2, tabW, tabH, 1), closed: true });
  paths.push({ nodes: helpers.rectPath(bL + bodyW, cy - tabH / 2, tabW, tabH, 1), closed: true });

  // Subpaths 3..N: Contact SMT Solder Pads inside
  const padSpan = bodyW * 0.72;
  const step = padSpan / Math.max(1, pins - 1);
  const padW = Math.min(8, Math.max(2.5, step * 0.55));
  const padH = bodyH * 0.35;
  const padY = bT + bodyH - padH - 4;

  for (let i = 0; i < pins; i++) {
    const px = cx - padSpan / 2 + i * step;
    paths.push({ nodes: helpers.rectPath(px - padW / 2, padY, padW, padH, 1), closed: true });
  }

  return paths;
}`,
  },

  // 3.3 USB Type-C Receptacle
  {
    id: 'pcb-conn-usbc',
    name: 'PCB: USB Type-C Receptacle',
    category: 'PCB Layout',
    description:
      'Reversible USB Type-C Receptacle footprint with 4 heavy through-hole shield ground anchor tabs and dual-row surface-mount signal contacts.',
    iconName: 'Cpu',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle internal signal pin visibility',
    paramSchema: [
      { key: 'label', label: 'Connector Label', type: 'string', defaultValue: 'USB-C' },
      { key: 'tabLengthRatio', label: 'Shield Tab Length', type: 'number', min: 0.08, max: 0.22, step: 0.01, defaultValue: 0.14 },
      { key: 'overhangRatio', label: 'Board Overhang', type: 'number', min: 0.05, max: 0.35, step: 0.01, defaultValue: 0.18 },
      { key: 'showPins', label: 'Show Signal Pads', type: 'boolean', defaultValue: true },
    ],
    defaultParams: {
      label: 'USB-C',
      tabLengthRatio: 0.14,
      overhangRatio: 0.18,
      showPins: true,
    },
    jsSourceCode: `// PCB: USB Type-C Receptacle (.jsf)
function getControlPoints(width, height, params, helpers) {
  const tl = helpers.clamp(Number(params.tabLengthRatio) || 0.14, 0.08, 0.22);
  const oh = helpers.clamp(Number(params.overhangRatio) || 0.18, 0.05, 0.35);
  return [
    { id: 'tabLength', label: \`Tab: \${Math.round(tl * 100)}%\`, x: width * (0.5 + tl * 0.5), y: 12, cursor: 'ew-resize' },
    { id: 'overhang', label: \`Overhang: \${Math.round(oh * 100)}%\`, x: width * 0.5, y: height * oh, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'tabLength') {
    const tl = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.08, 0.22);
    return { ...params, tabLengthRatio: Number(tl.toFixed(2)) };
  }
  if (id === 'overhang') {
    const oh = helpers.clamp(localY / Math.max(1, height), 0.05, 0.35);
    return { ...params, overhangRatio: Number(oh.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, showPins: !params.showPins };
}

function buildPaths(width, height, params, helpers) {
  const tlRatio = helpers.clamp(Number(params.tabLengthRatio) || 0.14, 0.08, 0.22);
  const ohRatio = helpers.clamp(Number(params.overhangRatio) || 0.18, 0.05, 0.35);
  const showPins = params.showPins !== false;

  const cx = width / 2;
  const cy = height / 2;
  const shellW = width * 0.82;
  const shellH = height * 0.68;
  const sL = cx - shellW / 2;
  const sT = cy - shellH / 2;
  const tabW = width * tlRatio;
  const tabH = height * 0.16;

  const paths = [];

  // Subpath 0: Metal Outer Shell
  paths.push({ nodes: helpers.rectPath(sL, sT, shellW, shellH, 4), closed: true });

  // Subpath 1: Inner Reversible Tongue Opening
  const tongueW = shellW * 0.65;
  const tongueH = shellH * 0.35;
  paths.push({ nodes: helpers.rectPath(cx - tongueW / 2, sT + 6, tongueW, tongueH, 3), closed: true });

  // Subpaths 2..5: 4 Heavy Shield Through-Hole Anchor Tabs
  // Top-left and Top-right tabs
  paths.push({ nodes: helpers.rectPath(sL - tabW * 0.6, sT + 4, tabW, tabH, 1), closed: true });
  paths.push({ nodes: helpers.rectPath(sL + shellW - tabW * 0.4, sT + 4, tabW, tabH, 1), closed: true });
  // Bottom-left and Bottom-right tabs
  paths.push({ nodes: helpers.rectPath(sL - tabW * 0.6, sT + shellH - tabH - 4, tabW, tabH, 1), closed: true });
  paths.push({ nodes: helpers.rectPath(sL + shellW - tabW * 0.4, sT + shellH - tabH - 4, tabW, tabH, 1), closed: true });

  // Subpaths 6..N: SMT Signal Pads Row at Rear
  if (showPins) {
    const pinCount = 12;
    const pinSpan = shellW * 0.62;
    const pStep = pinSpan / (pinCount - 1);
    const pW = pStep * 0.55;
    const pH = shellH * 0.2;
    const pY = sT + shellH - pH - 4;

    for (let i = 0; i < pinCount; i++) {
      const px = cx - pinSpan / 2 + i * pStep;
      paths.push({ nodes: helpers.rectPath(px - pW / 2, pY, pW, pH, 1), closed: true });
    }
  }

  return paths;
}`,
  },

  // 3.4 Micro-USB Type-B Receptacle
  {
    id: 'pcb-conn-microusb',
    name: 'PCB: Micro-USB Type-B',
    category: 'PCB Layout',
    description:
      'Micro-USB Type-B receptacle footprint with trapezoidal tongue aperture, 4 shield retention solder tabs, and 5 SMT signal pads (VBUS, D-, D+, ID, GND).',
    iconName: 'Cpu',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle retention tab styles (1=THT Lugs, 2=SMT Tabs)',
    paramSchema: [
      { key: 'label', label: 'Connector Label', type: 'string', defaultValue: 'Micro-USB' },
      { key: 'tabLengthRatio', label: 'Retention Tab Length', type: 'number', min: 0.1, max: 0.25, step: 0.01, defaultValue: 0.16 },
      { key: 'tabStyle', label: 'Retention Tab Style (1=THT Lugs, 2=SMT Tabs)', type: 'number', min: 1, max: 2, step: 1, defaultValue: 1 },
    ],
    defaultParams: {
      label: 'Micro-USB',
      tabLengthRatio: 0.16,
      tabStyle: 1,
    },
    jsSourceCode: `// PCB: Micro-USB Type-B (.jsf)
function getControlPoints(width, height, params, helpers) {
  const tl = helpers.clamp(Number(params.tabLengthRatio) || 0.16, 0.1, 0.25);
  return [
    { id: 'tabLength', label: \`Tab: \${Math.round(tl * 100)}%\`, x: width * (0.5 + tl * 0.5), y: 12, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'tabLength') {
    const tl = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.1, 0.25);
    return { ...params, tabLengthRatio: Number(tl.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, tabStyle: Number(params.tabStyle) === 1 ? 2 : 1 };
}

function buildPaths(width, height, params, helpers) {
  const tlRatio = helpers.clamp(Number(params.tabLengthRatio) || 0.16, 0.1, 0.25);
  const tabStyle = Math.round(helpers.clamp(Number(params.tabStyle) || 1, 1, 2));

  const cx = width / 2;
  const cy = height / 2;
  const shellW = width * 0.82;
  const shellH = height * 0.65;
  const sL = cx - shellW / 2;
  const sT = cy - shellH / 2;
  const tabW = width * tlRatio;
  const tabH = height * 0.15;

  const paths = [];

  // Subpath 0: Trapezoidal Shell
  const trapCut = 6;
  const shellNodes = [
    helpers.cornerNode(sL + trapCut, sT),
    helpers.cornerNode(sL + shellW - trapCut, sT),
    helpers.cornerNode(sL + shellW, sT + trapCut),
    helpers.cornerNode(sL + shellW, sT + shellH - 2),
    helpers.cornerNode(sL + shellW - 2, sT + shellH),
    helpers.cornerNode(sL + 2, sT + shellH),
    helpers.cornerNode(sL, sT + shellH - 2),
    helpers.cornerNode(sL, sT + trapCut)
  ];
  paths.push({ nodes: shellNodes, closed: true });

  // 4 Corner Retention Shield Tabs
  const tabPositions = [
    { x: sL - tabW * 0.5, y: sT + 2 },
    { x: sL + shellW - tabW * 0.5, y: sT + 2 },
    { x: sL - tabW * 0.5, y: sT + shellH - tabH - 2 },
    { x: sL + shellW - tabW * 0.5, y: sT + shellH - tabH - 2 }
  ];

  if (tabStyle === 2) {
    // SMT Flat Shield Tabs (4 surface-mount solder pads) -> total 10 subpaths
    for (const pos of tabPositions) {
      paths.push({ nodes: helpers.rectPath(pos.x, pos.y, tabW, tabH, 1), closed: true });
    }
  } else {
    // Through-hole Shield Lugs: outer copper pad + central drill hole -> total 14 subpaths
    const drillR = Math.min(tabW, tabH) * 0.32;
    for (const pos of tabPositions) {
      const tcx = pos.x + tabW * 0.5;
      const tcy = pos.y + tabH * 0.5;
      paths.push({ nodes: helpers.rectPath(pos.x, pos.y, tabW, tabH, 2), closed: true });
      paths.push({ nodes: helpers.circle(tcx, tcy, drillR), closed: true });
    }
  }

  // Subpaths: 5 SMT Signal Solder Pads at Rear
  const pinSpan = shellW * 0.52;
  const pStep = pinSpan / 4;
  const pW = pStep * 0.55;
  const pH = shellH * 0.22;
  const pY = sT + shellH - pH - 3;

  for (let i = 0; i < 5; i++) {
    const px = cx - pinSpan / 2 + i * pStep;
    paths.push({ nodes: helpers.rectPath(px - pW / 2, pY, pW, pH, 1), closed: true });
  }

  return paths;
}`,
  },

  // 3.5 Screw Terminal Block (2 to 6 Pole)
  {
    id: 'pcb-conn-terminal-block',
    name: 'PCB: Screw Terminal Block',
    category: 'PCB Layout',
    description:
      'High-current modular screw terminal block footprint (2-6 pole, 3.5mm/5.08mm pitch) with wire entry apertures, screw caps with slots, and through-hole posts.',
    iconName: 'Grid',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to step pole count (2 -> 3 -> 4 -> 6)',
    paramSchema: [
      { key: 'label', label: 'Net Label', type: 'string', defaultValue: 'VIN / MOTOR' },
      { key: 'poles', label: 'Pole Count', type: 'number', min: 2, max: 6, step: 1, defaultValue: 2 },
      { key: 'screwSlotDeg', label: 'Screw Slot Angle (°)', type: 'number', min: 0, max: 180, step: 15, defaultValue: 45 },
    ],
    defaultParams: {
      label: 'VIN / MOTOR',
      poles: 2,
      screwSlotDeg: 45,
    },
    jsSourceCode: `// PCB: Screw Terminal Block (.jsf)
function getControlPoints(width, height, params, helpers) {
  const poles = Math.round(helpers.clamp(Number(params.poles) || 2, 2, 6));
  return [
    { id: 'poles', label: \`\${poles} Poles\`, x: helpers.lerp(width * 0.25, width * 0.75, (poles - 2) / 4), y: height - 6, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'poles') {
    const t = helpers.clamp((localX - width * 0.25) / (width * 0.5), 0, 1);
    return { ...params, poles: Math.round(2 + t * 4) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cycle = [2, 3, 4, 6];
  const idx = cycle.indexOf(params.poles);
  const next = cycle[(idx + 1) % cycle.length];
  return { ...params, poles: next };
}

function buildPaths(width, height, params, helpers) {
  const poles = Math.round(helpers.clamp(Number(params.poles) || 2, 2, 6));
  const ang = (Number(params.screwSlotDeg) || 45) * (Math.PI / 180);

  const cx = width / 2;
  const cy = height / 2;
  const blockW = width * 0.92;
  const blockH = height * 0.78;
  const bL = cx - blockW / 2;
  const bT = cy - blockH / 2;
  const poleW = blockW / poles;

  const paths = [];

  // Subpath 0: Outer Terminal Housing
  paths.push({ nodes: helpers.rectPath(bL, bT, blockW, blockH, 3), closed: true });

  // Subpaths for each pole: Divider line, Screw circle, Slot, and Wire Entry Box
  for (let i = 0; i < poles; i++) {
    const px = bL + (i + 0.5) * poleW;

    // Wire entry aperture at bottom
    const apW = poleW * 0.65;
    const apH = blockH * 0.28;
    paths.push({ nodes: helpers.rectPath(px - apW / 2, bT + blockH - apH - 4, apW, apH, 1), closed: true });

    // Screw cap circle at top
    const screwR = Math.min(12, poleW * 0.28);
    const screwY = bT + blockH * 0.32;
    paths.push({ nodes: helpers.circle(px, screwY, screwR), closed: true });

    // Slotted groove (open line)
    const dx = Math.cos(ang) * (screwR * 0.75);
    const dy = Math.sin(ang) * (screwR * 0.75);
    paths.push({
      nodes: [helpers.cornerNode(px - dx, screwY - dy), helpers.cornerNode(px + dx, screwY + dy)],
      closed: false
    });
  }

  return paths;
}`,
  },

  // 3.6 Battery Solder Pads (XT30 / XT60 Pad Pair)
  {
    id: 'pcb-conn-power-pads',
    name: 'PCB: Battery Solder Pads (XT30/60)',
    category: 'PCB Layout',
    description:
      'High-current battery power solder pad pair (for direct silicone wire or XT30/XT60 connector soldering) with (+) and (-) polarity indicators and solder paste mask relief.',
    iconName: 'Zap',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle polarity indicators',
    paramSchema: [
      { key: 'label', label: 'Power Rail', type: 'string', defaultValue: 'VBAT / GND' },
      { key: 'padGapRatio', label: 'Pad Separation Gap', type: 'number', min: 0.18, max: 0.5, step: 0.02, defaultValue: 0.32 },
      { key: 'showPolarity', label: 'Show Polarity (+/-)', type: 'boolean', defaultValue: true },
    ],
    defaultParams: {
      label: 'VBAT / GND',
      padGapRatio: 0.32,
      showPolarity: true,
    },
    jsSourceCode: `// PCB: Battery Solder Pads (.jsf)
function getControlPoints(width, height, params, helpers) {
  const gap = helpers.clamp(Number(params.padGapRatio) || 0.32, 0.18, 0.5);
  return [
    { id: 'gap', label: \`Gap: \${Math.round(gap * 100)}%\`, x: width * (0.5 + gap * 0.5), y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'gap') {
    const gap = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.18, 0.5);
    return { ...params, padGapRatio: Number(gap.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, showPolarity: !params.showPolarity };
}

function buildPaths(width, height, params, helpers) {
  const gapRatio = helpers.clamp(Number(params.padGapRatio) || 0.32, 0.18, 0.5);
  const showPol = params.showPolarity !== false;

  const cx = width / 2;
  const cy = height / 2;
  const envW = width * 0.94;
  const envH = height * 0.88;
  const gap = width * gapRatio;
  const padW = (envW - gap) / 2;
  const padH = envH * 0.82;

  const paths = [];

  // Subpath 0: Silkscreen Keepout Boundary
  paths.push({ nodes: helpers.rectPath(cx - envW / 2, cy - envH / 2, envW, envH, 4), closed: true });

  // Subpaths 1, 2: Positive (+) and Negative (-) Heavy Copper Solder Pads
  const leftPadX = cx - gap / 2 - padW;
  const rightPadX = cx + gap / 2;
  paths.push({ nodes: helpers.rectPath(leftPadX, cy - padH / 2, padW, padH, 3), closed: true });
  paths.push({ nodes: helpers.rectPath(rightPadX, cy - padH / 2, padW, padH, 3), closed: true });

  // Polarity (+ and -) crosshair markers
  if (showPol) {
    const crossSize = Math.min(8, padW * 0.25);
    const polLeftCX = leftPadX + padW / 2;
    const polRightCX = rightPadX + padW / 2;

    // Plus (+) symbol over left pad (2 crossed lines)
    paths.push({
      nodes: [helpers.cornerNode(polLeftCX - crossSize, cy), helpers.cornerNode(polLeftCX + crossSize, cy)],
      closed: false
    });
    paths.push({
      nodes: [helpers.cornerNode(polLeftCX, cy - crossSize), helpers.cornerNode(polLeftCX, cy + crossSize)],
      closed: false
    });

    // Minus (-) symbol over right pad (horizontal line)
    paths.push({
      nodes: [helpers.cornerNode(polRightCX - crossSize, cy), helpers.cornerNode(polRightCX + crossSize, cy)],
      closed: false
    });
  }

  return paths;
}`,
  },

  // =========================================================================
  // 4. SOLDER PADS, VIAS & TEST POINTS
  // =========================================================================

  // 4.1 SMD Rectangular Solder Pad
  {
    id: 'pcb-feature-smd-pad',
    name: 'PCB: SMD Rectangular Pad',
    category: 'PCB Layout',
    description:
      'Parametric rectangular surface-mount solder pad with corner rounding, solder mask expansion relief outline, and customizable track connection fillet.',
    iconName: 'Square',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle solder mask expansion border',
    paramSchema: [
      { key: 'label', label: 'Pad Number / Net', type: 'string', defaultValue: 'PAD 1' },
      { key: 'cornerRadius', label: 'Corner Radius (px)', type: 'number', min: 0, max: 20, step: 1, defaultValue: 4 },
      { key: 'showMaskExpansion', label: 'Solder Mask Expansion', type: 'boolean', defaultValue: true },
    ],
    defaultParams: {
      label: 'PAD 1',
      cornerRadius: 4,
      showMaskExpansion: true,
    },
    jsSourceCode: `// PCB: SMD Rectangular Pad (.jsf)
function getControlPoints(width, height, params, helpers) {
  const r = helpers.clamp(Number(params.cornerRadius) || 4, 0, 20);
  return [
    { id: 'radius', label: \`Radius: \${r}px\`, x: r + 4, y: 4, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'radius') {
    const r = helpers.clamp(localX - 4, 0, Math.min(20, Math.min(width, height) / 2));
    return { ...params, cornerRadius: Math.round(r) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, showMaskExpansion: !params.showMaskExpansion };
}

function buildPaths(width, height, params, helpers) {
  const r = helpers.clamp(Number(params.cornerRadius) || 4, 0, Math.min(20, Math.min(width, height) / 2));
  const showMask = params.showMaskExpansion !== false;

  const paths = [];

  // Subpath 0: Solder Mask Expansion Relief Outer Boundary
  if (showMask) {
    paths.push({ nodes: helpers.rectPath(2, 2, width - 4, height - 4, r + 2), closed: true });
    // Subpath 1: Inner Exposed Copper Solder Pad
    paths.push({ nodes: helpers.rectPath(8, 8, width - 16, height - 16, r), closed: true });
  } else {
    paths.push({ nodes: helpers.rectPath(4, 4, width - 8, height - 8, r), closed: true });
  }

  return paths;
}`,
  },

  // 4.2 SMD Circular / BGA Pad
  {
    id: 'pcb-feature-circular-pad',
    name: 'PCB: SMD Circular Pad',
    category: 'PCB Layout',
    description:
      'Circular surface-mount / BGA solder pad with concentric solder mask expansion relief and central copper pad.',
    iconName: 'Circle',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle solder mask expansion ring',
    paramSchema: [
      { key: 'label', label: 'Pad Net', type: 'string', defaultValue: 'BGA PAD' },
      { key: 'diameterRatio', label: 'Copper Pad Ratio', type: 'number', min: 0.4, max: 0.95, step: 0.02, defaultValue: 0.75 },
      { key: 'showMaskExpansion', label: 'Solder Mask Expansion', type: 'boolean', defaultValue: true },
    ],
    defaultParams: {
      label: 'BGA PAD',
      diameterRatio: 0.75,
      showMaskExpansion: true,
    },
    jsSourceCode: `// PCB: SMD Circular Pad (.jsf)
function getControlPoints(width, height, params, helpers) {
  const dr = helpers.clamp(Number(params.diameterRatio) || 0.75, 0.4, 0.95);
  return [
    { id: 'diameter', label: \`Pad: \${Math.round(dr * 100)}%\`, x: width * (0.5 + dr * 0.5), y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'diameter') {
    const dr = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.4, 0.95);
    return { ...params, diameterRatio: Number(dr.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, showMaskExpansion: !params.showMaskExpansion };
}

function buildPaths(width, height, params, helpers) {
  const dr = helpers.clamp(Number(params.diameterRatio) || 0.75, 0.4, 0.95);
  const showMask = params.showMaskExpansion !== false;

  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height);
  const outerR = (size - 6) / 2;
  const innerR = outerR * dr;

  const paths = [];

  // Subpath 0: Outer Mask Expansion Ring
  if (showMask) {
    paths.push({ nodes: helpers.circle(cx, cy, outerR), closed: true });
    // Subpath 1: Inner Copper Pad
    paths.push({ nodes: helpers.circle(cx, cy, innerR), closed: true });
  } else {
    paths.push({ nodes: helpers.circle(cx, cy, innerR), closed: true });
  }

  return paths;
}`,
  },

  // 4.3 Through-Hole Annular Ring Pad
  {
    id: 'pcb-feature-th-pad',
    name: 'PCB: Through-Hole Pad',
    category: 'PCB Layout',
    description:
      'Plated through-hole pad with annular copper ring (circular or octagonal) and inner drill hole.',
    iconName: 'Circle',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle between Circular and Octagonal annular ring',
    paramSchema: [
      { key: 'label', label: 'Pin Net', type: 'string', defaultValue: 'TH PAD' },
      { key: 'drillRatio', label: 'Drill Hole Ratio', type: 'number', min: 0.25, max: 0.65, step: 0.02, defaultValue: 0.45 },
      { key: 'isOctagonal', label: 'Octagonal Annular Ring', type: 'boolean', defaultValue: false },
    ],
    defaultParams: {
      label: 'TH PAD',
      drillRatio: 0.45,
      isOctagonal: false,
    },
    jsSourceCode: `// PCB: Through-Hole Pad (.jsf)
function getControlPoints(width, height, params, helpers) {
  const dr = helpers.clamp(Number(params.drillRatio) || 0.45, 0.25, 0.65);
  return [
    { id: 'drill', label: \`Drill: \${Math.round(dr * 100)}%\`, x: width * (0.5 + dr * 0.5), y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'drill') {
    const dr = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.25, 0.65);
    return { ...params, drillRatio: Number(dr.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, isOctagonal: !params.isOctagonal };
}

function buildPaths(width, height, params, helpers) {
  const dr = helpers.clamp(Number(params.drillRatio) || 0.45, 0.25, 0.65);
  const oct = params.isOctagonal === true;

  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height);
  const outerR = (size - 6) / 2;
  const drillR = outerR * dr;

  const paths = [];

  // Subpath 0: Annular Copper Ring
  if (oct) {
    const chamf = outerR * 0.414;
    const octNodes = [
      helpers.cornerNode(cx - outerR + chamf, cy - outerR),
      helpers.cornerNode(cx + outerR - chamf, cy - outerR),
      helpers.cornerNode(cx + outerR, cy - outerR + chamf),
      helpers.cornerNode(cx + outerR, cy + outerR - chamf),
      helpers.cornerNode(cx + outerR - chamf, cy + outerR),
      helpers.cornerNode(cx - outerR + chamf, cy + outerR),
      helpers.cornerNode(cx - outerR, cy + outerR - chamf),
      helpers.cornerNode(cx - outerR, cy - outerR + chamf)
    ];
    paths.push({ nodes: octNodes, closed: true });
  } else {
    paths.push({ nodes: helpers.circle(cx, cy, outerR), closed: true });
  }

  // Subpath 1: Inner Drill Hole
  paths.push({ nodes: helpers.circle(cx, cy, drillR), closed: true });

  return paths;
}`,
  },

  // 4.4 Plated Via & Thermal Stitching Grid
  {
    id: 'pcb-feature-via',
    name: 'PCB: Plated Via & Via Grid',
    category: 'PCB Layout',
    description:
      'Plated through-hole conductive via or multi-via thermal stitching grid (up to 4x4 array) with annular copper rings and drill holes.',
    iconName: 'Crosshair',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to step via grid array (1x1 -> 2x2 -> 3x3 -> 4x4)',
    paramSchema: [
      { key: 'label', label: 'Via Net', type: 'string', defaultValue: 'GND VIA' },
      { key: 'gridSize', label: 'Via Grid Size (NxN)', type: 'number', min: 1, max: 4, step: 1, defaultValue: 1 },
      { key: 'drillRatio', label: 'Drill Hole Ratio', type: 'number', min: 0.3, max: 0.65, step: 0.02, defaultValue: 0.45 },
    ],
    defaultParams: {
      label: 'GND VIA',
      gridSize: 1,
      drillRatio: 0.45,
    },
    jsSourceCode: `// PCB: Plated Via & Via Grid (.jsf)
function getControlPoints(width, height, params, helpers) {
  const g = Math.round(helpers.clamp(Number(params.gridSize) || 1, 1, 4));
  return [
    { id: 'grid', label: \`Grid: \${g}x\${g}\`, x: helpers.lerp(width * 0.25, width * 0.75, (g - 1) / 3), y: height - 6, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'grid') {
    const t = helpers.clamp((localX - width * 0.25) / (width * 0.5), 0, 1);
    return { ...params, gridSize: Math.round(1 + t * 3) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = (params.gridSize % 4) + 1;
  return { ...params, gridSize: next };
}

function buildPaths(width, height, params, helpers) {
  const g = Math.round(helpers.clamp(Number(params.gridSize) || 1, 1, 4));
  const dr = helpers.clamp(Number(params.drillRatio) || 0.45, 0.3, 0.65);

  const cx = width / 2;
  const cy = height / 2;
  const paths = [];

  if (g === 1) {
    // Single Via
    const outerR = Math.min(width, height) * 0.42;
    const drillR = outerR * dr;
    paths.push({ nodes: helpers.circle(cx, cy, outerR), closed: true });
    paths.push({ nodes: helpers.circle(cx, cy, drillR), closed: true });
  } else {
    // NxN Stitching Grid
    const outerBounding = helpers.rectPath(4, 4, width - 8, height - 8, 4);
    paths.push({ nodes: outerBounding, closed: true });

    const stepX = (width - 24) / (g - 1);
    const stepY = (height - 24) / (g - 1);
    const viaR = Math.min(stepX, stepY) * 0.35;
    const drillR = viaR * dr;

    for (let r = 0; r < g; r++) {
      for (let c = 0; c < g; c++) {
        const vx = 12 + c * stepX;
        const vy = 12 + r * stepY;
        paths.push({ nodes: helpers.circle(vx, vy, viaR), closed: true });
        paths.push({ nodes: helpers.circle(vx, vy, drillR), closed: true });
      }
    }
  }

  return paths;
}`,
  },

  // 4.5 Surface Test Point
  {
    id: 'pcb-feature-test-point',
    name: 'PCB: Test Point',
    category: 'PCB Layout',
    description:
      'Surface probe test point footprint (circular SMD pad, square SMD pad, or through-hole probe hook loop) with silkscreen collar.',
    iconName: 'Crosshair',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle test point styles (Circle -> Square -> Probe Hook Loop)',
    paramSchema: [
      { key: 'label', label: 'Signal Net', type: 'string', defaultValue: 'TP_CLK' },
      { key: 'pointType', label: 'Type (1=Circle, 2=Square, 3=Loop)', type: 'number', min: 1, max: 3, step: 1, defaultValue: 1 },
      { key: 'padRadiusRatio', label: 'Pad Size Ratio', type: 'number', min: 0.3, max: 0.85, step: 0.02, defaultValue: 0.55 },
    ],
    defaultParams: {
      label: 'TP_CLK',
      pointType: 1,
      padRadiusRatio: 0.55,
    },
    jsSourceCode: `// PCB: Test Point (.jsf)
function getControlPoints(width, height, params, helpers) {
  const pr = helpers.clamp(Number(params.padRadiusRatio) || 0.55, 0.3, 0.85);
  const type = Math.round(helpers.clamp(Number(params.pointType) || 1, 1, 3));
  const typeNames = ['Circle', 'Square', 'Probe Loop'];
  return [
    { id: 'padSize', label: \`Size: \${Math.round(pr * 100)}%\`, x: width * (0.5 + pr * 0.5), y: height * 0.5, cursor: 'ew-resize' },
    { id: 'type', label: typeNames[type - 1], x: helpers.lerp(width * 0.25, width * 0.75, (type - 1) / 2), y: height - 6, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'padSize') {
    const pr = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.3, 0.85);
    return { ...params, padRadiusRatio: Number(pr.toFixed(2)) };
  }
  if (id === 'type') {
    const t = helpers.clamp(localX / Math.max(1, width), 0, 1);
    const nextType = helpers.clamp(Math.round(1 + t * 2), 1, 3);
    return { ...params, pointType: nextType, padType: nextType };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Number(params.pointType ?? params.padType) || 1;
  const next = (cur % 3) + 1;
  return { ...params, pointType: next, padType: next };
}

function buildPaths(width, height, params, helpers) {
  const pr = helpers.clamp(Number(params.padRadiusRatio) || 0.55, 0.3, 0.85);
  const type = Math.round(helpers.clamp(Number(params.pointType) || 1, 1, 3));

  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height);
  const padR = (size * pr) / 2;

  const paths = [];

  // Subpath 0: Outer Silkscreen Collar Ring
  paths.push({ nodes: helpers.circle(cx, cy, (size - 6) / 2), closed: true });

  if (type === 1) {
    // Circular SMT Test Point
    paths.push({ nodes: helpers.circle(cx, cy, padR), closed: true });
  } else if (type === 2) {
    // Square SMT Test Point
    paths.push({ nodes: helpers.rectPath(cx - padR, cy - padR, padR * 2, padR * 2, 1), closed: true });
  } else {
    // Through-Hole Probe Hook Loop: Annular ring + drill hole
    paths.push({ nodes: helpers.circle(cx, cy, padR), closed: true });
    paths.push({ nodes: helpers.circle(cx, cy, padR * 0.45), closed: true });
  }

  return paths;
}`,
  },

  // =========================================================================
  // 5. CONDUCTIVE TRACES & ROUTING
  // =========================================================================

  // 5.1 Straight Conductive Copper Trace
  {
    id: 'pcb-route-trace-straight',
    name: 'PCB: Straight Copper Trace',
    category: 'PCB Layout',
    description:
      'Straight conductive PCB copper track with parametric track width (e.g. 6-mil signal vs 40-mil power rail) and terminal solder fillet / via pads.',
    iconName: 'Layers',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle terminal solder pads',
    paramSchema: [
      { key: 'label', label: 'Net Name', type: 'string', defaultValue: '+3V3' },
      { key: 'traceWidth', label: 'Track Width (px)', type: 'number', min: 2, max: 40, step: 1, defaultValue: 8 },
      { key: 'terminalPads', label: 'Show Terminal Pads', type: 'boolean', defaultValue: true },
    ],
    defaultParams: {
      label: '+3V3',
      traceWidth: 8,
      terminalPads: true,
    },
    jsSourceCode: `// PCB: Straight Copper Trace (.jsf)
function getControlPoints(width, height, params, helpers) {
  const tw = helpers.clamp(Number(params.traceWidth) || 8, 2, 40);
  return [
    { id: 'width', label: \`Width: \${tw}px\`, x: 24, y: height * 0.5 - tw / 2, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'width') {
    const tw = helpers.clamp(Math.abs(height * 0.5 - localY) * 2, 2, Math.min(40, height * 0.8));
    return { ...params, traceWidth: Math.round(tw) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, terminalPads: !params.terminalPads };
}

function buildPaths(width, height, params, helpers) {
  const tw = helpers.clamp(Number(params.traceWidth) || 8, 2, Math.min(40, height * 0.8));
  const pads = params.terminalPads !== false;

  const cy = height / 2;
  const padR = Math.max(tw * 0.9, 6);

  const paths = [];

  // Subpath 0: Main Conductive Copper Strip
  paths.push({ nodes: helpers.rectPath(0, cy - tw / 2, width, tw, 1), closed: true });

  // Subpaths 1, 2: Terminal Via / Solder Pads at Ends
  if (pads) {
    paths.push({ nodes: helpers.circle(padR + 2, cy, padR), closed: true });
    paths.push({ nodes: helpers.circle(padR + 2, cy, padR * 0.45), closed: true });
    paths.push({ nodes: helpers.circle(width - padR - 2, cy, padR), closed: true });
    paths.push({ nodes: helpers.circle(width - padR - 2, cy, padR * 0.45), closed: true });
  }

  return paths;
}`,
  },

  // 5.2 IPC-2221 45-Degree Mitered Trace Corner Bend
  {
    id: 'pcb-route-trace-45',
    name: 'PCB: 45° Mitered Trace Corner',
    category: 'PCB Layout',
    description:
      'IPC-2221 standard 45-degree mitered trace corner bend (acid-trap defect prevention) with interactive corner miter offset and track width.',
    iconName: 'GitCommitHorizontal',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle terminal pads',
    paramSchema: [
      { key: 'label', label: 'Net Name', type: 'string', defaultValue: 'SDA' },
      { key: 'traceWidth', label: 'Track Width (px)', type: 'number', min: 2, max: 30, step: 1, defaultValue: 8 },
      { key: 'cornerOffsetRatio', label: 'Miter Offset Ratio', type: 'number', min: 0.2, max: 0.8, step: 0.02, defaultValue: 0.5 },
      { key: 'terminalPads', label: 'Show Terminal Pads', type: 'boolean', defaultValue: true },
    ],
    defaultParams: {
      label: 'SDA',
      traceWidth: 8,
      cornerOffsetRatio: 0.5,
      terminalPads: true,
    },
    jsSourceCode: `// PCB: 45° Mitered Trace Corner (.jsf)
function getControlPoints(width, height, params, helpers) {
  const tw = helpers.clamp(Number(params.traceWidth) || 8, 2, 30);
  const co = helpers.clamp(Number(params.cornerOffsetRatio) || 0.5, 0.2, 0.8);
  return [
    { id: 'width', label: \`Width: \${tw}px\`, x: 16, y: height * 0.5 - tw / 2, cursor: 'ns-resize' },
    { id: 'corner', label: \`Miter: \${Math.round(co * 100)}%\`, x: width * co, y: height * co, cursor: 'move' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'width') {
    const tw = helpers.clamp(Math.abs(height * 0.5 - localY) * 2, 2, 30);
    return { ...params, traceWidth: Math.round(tw) };
  }
  if (id === 'corner') {
    const co = helpers.clamp(localX / Math.max(1, width), 0.2, 0.8);
    return { ...params, cornerOffsetRatio: Number(co.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, terminalPads: !params.terminalPads };
}

function buildPaths(width, height, params, helpers) {
  const tw = helpers.clamp(Number(params.traceWidth) || 8, 2, 30);
  const co = helpers.clamp(Number(params.cornerOffsetRatio) || 0.5, 0.2, 0.8);
  const pads = params.terminalPads !== false;

  const miterSpan = Math.min(width, height) * 0.25;
  const cx1 = width * co - miterSpan / 2;
  const cy1 = height * 0.25;
  const cx2 = width * co + miterSpan / 2;
  const cy2 = cy1 + miterSpan;

  const half = tw / 2;
  const paths = [];

  // Subpath 0: 45-degree Mitered Polygon Strip (closed polygon track)
  const traceNodes = [
    helpers.cornerNode(0, cy1 - half),
    helpers.cornerNode(cx1, cy1 - half),
    helpers.cornerNode(cx2 + half, cy2 - half * 0.414),
    helpers.cornerNode(cx2 + half, height),
    helpers.cornerNode(cx2 - half, height),
    helpers.cornerNode(cx2 - half, cy2 + half * 0.414),
    helpers.cornerNode(cx1 - half * 0.414, cy1 + half),
    helpers.cornerNode(0, cy1 + half)
  ];
  paths.push({ nodes: traceNodes, closed: true });

  // Terminal pads
  if (pads) {
    const padR = Math.max(tw * 0.85, 6);
    paths.push({ nodes: helpers.circle(padR + 2, cy1, padR), closed: true });
    paths.push({ nodes: helpers.circle(padR + 2, cy1, padR * 0.45), closed: true });
    paths.push({ nodes: helpers.circle(cx2, height - padR - 2, padR), closed: true });
    paths.push({ nodes: helpers.circle(cx2, height - padR - 2, padR * 0.45), closed: true });
  }

  return paths;
}`,
  },

  // 5.3 Multi-Track Bus Route (2 to 8 Parallel Tracks)
  {
    id: 'pcb-route-bus',
    name: 'PCB: Multi-Track Bus Route',
    category: 'PCB Layout',
    description:
      'Parallel multi-track data / differential bus route (2-8 copper tracks) with uniform track width and clearance gap (SPI, I2C, UART, or differential pairs).',
    iconName: 'Layers',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to step track count (2 -> 4 -> 6 -> 8)',
    paramSchema: [
      { key: 'label', label: 'Bus Label', type: 'string', defaultValue: 'SPI BUS' },
      { key: 'tracks', label: 'Track Count', type: 'number', min: 2, max: 8, step: 1, defaultValue: 4 },
      { key: 'trackWidth', label: 'Track Width (px)', type: 'number', min: 2, max: 16, step: 1, defaultValue: 4 },
      { key: 'clearanceGap', label: 'Clearance Gap (px)', type: 'number', min: 2, max: 20, step: 1, defaultValue: 4 },
    ],
    defaultParams: {
      label: 'SPI BUS',
      tracks: 4,
      trackWidth: 4,
      clearanceGap: 4,
    },
    jsSourceCode: `// PCB: Multi-Track Bus Route (.jsf)
function getControlPoints(width, height, params, helpers) {
  const tr = Math.round(helpers.clamp(Number(params.tracks) || 4, 2, 8));
  const tw = helpers.clamp(Number(params.trackWidth) || 4, 2, 16);
  return [
    { id: 'tracks', label: \`\${tr} Tracks\`, x: helpers.lerp(width * 0.25, width * 0.75, (tr - 2) / 6), y: height - 6, cursor: 'ew-resize' },
    { id: 'width', label: \`Width: \${tw}px\`, x: 16, y: 12, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'tracks') {
    const t = helpers.clamp((localX - width * 0.25) / (width * 0.5), 0, 1);
    return { ...params, tracks: Math.round(2 + t * 6) };
  }
  if (id === 'width') {
    const tw = helpers.clamp(localY, 2, 16);
    return { ...params, trackWidth: Math.round(tw) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cycle = [2, 4, 6, 8];
  const idx = cycle.indexOf(params.tracks);
  const next = cycle[(idx + 1) % cycle.length];
  return { ...params, tracks: next };
}

function buildPaths(width, height, params, helpers) {
  const tr = Math.round(helpers.clamp(Number(params.tracks) || 4, 2, 8));
  const tw = helpers.clamp(Number(params.trackWidth) || 4, 2, 16);
  const gap = helpers.clamp(Number(params.clearanceGap) || 4, 2, 20);

  const totalH = tr * tw + (tr - 1) * gap;
  const startY = (height - totalH) / 2;

  const paths = [];

  // Subpath 0: Outer Envelope Boundary Box
  paths.push({ nodes: helpers.rectPath(0, startY - 4, width, totalH + 8, 2), closed: true });

  // Subpaths 1..N: Parallel Copper Traces
  for (let i = 0; i < tr; i++) {
    const ty = startY + i * (tw + gap);
    paths.push({ nodes: helpers.rectPath(4, ty, width - 8, tw, 1), closed: true });
    // Terminal dots at ends
    paths.push({ nodes: helpers.circle(8, ty + tw / 2, tw * 0.8), closed: true });
    paths.push({ nodes: helpers.circle(width - 8, ty + tw / 2, tw * 0.8), closed: true });
  }

  return paths;
}`,
  },

  // =========================================================================
  // 6. BOARD FEATURES, OUTLINES & MECHANICAL
  // =========================================================================

  // 6.1 Optical Pick-and-Place Fiducial Marker
  {
    id: 'pcb-feature-fiducial',
    name: 'PCB: Fiducial Marker',
    category: 'PCB Layout',
    description:
      'Optical SMT pick-and-place fiducial target marker with solid circular copper dot, solder mask keepout zone, and ground ring.',
    iconName: 'Crosshair',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle outer copper ground ring',
    paramSchema: [
      { key: 'label', label: 'Marker ID', type: 'string', defaultValue: 'FID1' },
      { key: 'dotDiameterRatio', label: 'Dot Diameter Ratio', type: 'number', min: 0.2, max: 0.6, step: 0.02, defaultValue: 0.35 },
      { key: 'showGroundRing', label: 'Outer Ground Ring', type: 'boolean', defaultValue: true },
    ],
    defaultParams: {
      label: 'FID1',
      dotDiameterRatio: 0.35,
      showGroundRing: true,
    },
    jsSourceCode: `// PCB: Fiducial Marker (.jsf)
function getControlPoints(width, height, params, helpers) {
  const dr = helpers.clamp(Number(params.dotDiameterRatio) || 0.35, 0.2, 0.6);
  return [
    { id: 'dot', label: \`Dot: \${Math.round(dr * 100)}%\`, x: width * (0.5 + dr * 0.5), y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'dot') {
    const dr = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.2, 0.6);
    return { ...params, dotDiameterRatio: Number(dr.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, showGroundRing: !params.showGroundRing };
}

function buildPaths(width, height, params, helpers) {
  const dr = helpers.clamp(Number(params.dotDiameterRatio) || 0.35, 0.2, 0.6);
  const ring = params.showGroundRing !== false;

  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height);
  const outerR = (size - 6) / 2;
  const dotR = outerR * dr;

  const paths = [];

  // Subpath 0: Solder Mask Keepout Outer Circle
  paths.push({ nodes: helpers.circle(cx, cy, outerR), closed: true });

  // Subpath 1: Outer Copper Ground Shield Ring
  if (ring) {
    paths.push({ nodes: helpers.circle(cx, cy, outerR * 0.78), closed: true });
  }

  // Subpath 2: Solid Optical Copper Dot Target
  paths.push({ nodes: helpers.circle(cx, cy, dotR), closed: true });

  return paths;
}`,
  },

  // 6.2 Chassis Mounting Hole (M2, M2.5, M3, M4)
  {
    id: 'pcb-feature-mounting-hole',
    name: 'PCB: Mounting Hole (M2-M4)',
    category: 'PCB Layout',
    description:
      'Chassis mechanical mounting hole footprint (M2, M2.5, M3, M4) with plated annular washer ring, screw head keepout zone, and drill hole.',
    iconName: 'Maximize2',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to step screw size: M2 -> M2.5 -> M3 -> M4',
    paramSchema: [
      { key: 'label', label: 'Hole Label', type: 'string', defaultValue: 'M3 HOLE' },
      { key: 'holeSize', label: 'Hole Size (1=M2, 2=M2.5, 3=M3, 4=M4)', type: 'number', min: 1, max: 4, step: 1, defaultValue: 3 },
      { key: 'plated', label: 'Plated Annular Ring', type: 'boolean', defaultValue: true },
    ],
    defaultParams: {
      label: 'M3 HOLE',
      holeSize: 3,
      plated: true,
    },
    jsSourceCode: `// PCB: Mounting Hole (.jsf)
function getControlPoints(width, height, params, helpers) {
  const hs = Math.round(helpers.clamp(Number(params.holeSize) || 3, 1, 4));
  const names = ['M2 (2.2mm)', 'M2.5 (2.7mm)', 'M3 (3.2mm)', 'M4 (4.3mm)'];
  return [
    { id: 'size', label: names[hs - 1], x: width * 0.5, y: height - 6, cursor: 'pointer' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'size') {
    const t = helpers.clamp(localX / Math.max(1, width), 0, 1);
    return { ...params, holeSize: Math.round(1 + t * 3) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = (params.holeSize % 4) + 1;
  return { ...params, holeSize: next };
}

function buildPaths(width, height, params, helpers) {
  const hs = Math.round(helpers.clamp(Number(params.holeSize) || 3, 1, 4));
  const plated = params.plated !== false;

  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height);
  const keepoutR = (size - 6) / 2;
  const ringR = keepoutR * 0.78;
  const drillRatios = [0.35, 0.42, 0.5, 0.6];
  const drillR = keepoutR * drillRatios[hs - 1];

  const paths = [];

  // Subpath 0: Screw Head Keepout Outer Circle
  paths.push({ nodes: helpers.circle(cx, cy, keepoutR), closed: true });

  // Subpath 1: Plated Annular Copper Washer Ring
  if (plated) {
    paths.push({ nodes: helpers.circle(cx, cy, ringR), closed: true });
  }

  // Subpath 2: Inner Drill Hole
  paths.push({ nodes: helpers.circle(cx, cy, drillR), closed: true });

  return paths;
}`,
  },

  // 6.3 PCB Board Outline with Live Corner Radius
  {
    id: 'pcb-outline-board',
    name: 'PCB: Board Outline (FR4)',
    category: 'PCB Layout',
    description:
      'FR4 PCB substrate board outline with interactive corner rounding (0-40px), inner silkscreen dimension border, and optional 4-corner mounting holes.',
    iconName: 'Square',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle 4-corner mounting holes on/off',
    paramSchema: [
      { key: 'label', label: 'Board Name / Revision', type: 'string', defaultValue: 'OSITO-FC-REV1' },
      { key: 'cornerRadius', label: 'Corner Radius (px)', type: 'number', min: 0, max: 40, step: 1, defaultValue: 12 },
      { key: 'showMountingHoles', label: '4 Corner Mounting Holes', type: 'boolean', defaultValue: true },
      { key: 'holeInsetRatio', label: 'Hole Inset Ratio', type: 'number', min: 0.05, max: 0.2, step: 0.01, defaultValue: 0.09 },
    ],
    defaultParams: {
      label: 'OSITO-FC-REV1',
      cornerRadius: 12,
      showMountingHoles: true,
      holeInsetRatio: 0.09,
    },
    jsSourceCode: `// PCB: Board Outline (.jsf)
function getControlPoints(width, height, params, helpers) {
  const r = helpers.clamp(Number(params.cornerRadius) || 12, 0, 40);
  const inset = helpers.clamp(Number(params.holeInsetRatio) || 0.09, 0.05, 0.2);
  return [
    { id: 'radius', label: \`Radius: \${r}px\`, x: r + 6, y: 6, cursor: 'ew-resize' },
    { id: 'inset', label: \`Inset: \${Math.round(inset * 100)}%\`, x: width * inset, y: height * inset, cursor: 'move' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'radius') {
    const r = helpers.clamp(localX - 6, 0, Math.min(40, Math.min(width, height) / 4));
    return { ...params, cornerRadius: Math.round(r) };
  }
  if (id === 'inset') {
    const inset = helpers.clamp(localX / Math.max(1, width), 0.05, 0.2);
    return { ...params, holeInsetRatio: Number(inset.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, showMountingHoles: !params.showMountingHoles };
}

function buildPaths(width, height, params, helpers) {
  const r = helpers.clamp(Number(params.cornerRadius) || 12, 0, Math.min(40, Math.min(width, height) / 4));
  const insetRatio = helpers.clamp(Number(params.holeInsetRatio) || 0.09, 0.05, 0.2);
  const showHoles = params.showMountingHoles !== false;

  const paths = [];

  // Subpath 0: FR4 PCB Substrate Outline with Rounded Corners
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, r), closed: true });

  // Subpath 1: Inner Silkscreen Inset Border
  paths.push({ nodes: helpers.rectPath(6, 6, width - 12, height - 12, Math.max(0, r - 4)), closed: true });

  // Subpaths 2..9: 4 Corner Mounting Holes (washer rings & drill holes)
  if (showHoles) {
    const holeX = Math.min(width, height) * insetRatio;
    const holeY = Math.min(width, height) * insetRatio;
    const ringR = Math.min(14, Math.max(5, Math.min(width, height) * 0.05));
    const drillR = ringR * 0.45;

    const corners = [
      { x: holeX, y: holeY },
      { x: width - holeX, y: holeY },
      { x: width - holeX, y: height - holeY },
      { x: holeX, y: height - holeY }
    ];

    for (const c of corners) {
      paths.push({ nodes: helpers.circle(c.x, c.y, ringR), closed: true });
      paths.push({ nodes: helpers.circle(c.x, c.y, drillR), closed: true });
    }
  }

  return paths;
}`,
  },

  // 6.4 High-Voltage Creepage / Isolation Milling Slot
  {
    id: 'pcb-outline-slot',
    name: 'PCB: Isolation Milling Slot',
    category: 'PCB Layout',
    description:
      'High-voltage safety creepage / clearance router isolation milling slot cutout through PCB substrate with rounded router bit ends.',
    iconName: 'Minus',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle slot orientation (1=Horizontal <-> 2=Vertical)',
    paramSchema: [
      { key: 'label', label: 'Slot Purpose', type: 'string', defaultValue: 'ISOLATION' },
      { key: 'slotWidth', label: 'Slot Width (px)', type: 'number', min: 4, max: 30, step: 1, defaultValue: 12 },
      { key: 'orientation', label: 'Slot Orientation (1=Horizontal, 2=Vertical)', type: 'number', min: 1, max: 2, step: 1, defaultValue: 1 },
    ],
    defaultParams: {
      label: 'ISOLATION',
      slotWidth: 12,
      orientation: 1,
    },
    jsSourceCode: `// PCB: Isolation Milling Slot (.jsf)
function getControlPoints(width, height, params, helpers) {
  const sw = helpers.clamp(Number(params.slotWidth) || 12, 4, 30);
  const orient = Math.round(Number(params.orientation) || 1);
  if (orient === 2) {
    return [
      { id: 'width', label: \`Width: \${sw}px\`, x: width * 0.5 - sw / 2, y: height * 0.5, cursor: 'ew-resize' }
    ];
  }
  return [
    { id: 'width', label: \`Width: \${sw}px\`, x: width * 0.5, y: height * 0.5 - sw / 2, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'width') {
    const orient = Math.round(Number(params.orientation) || 1);
    if (orient === 2) {
      const sw = helpers.clamp(Math.abs(width * 0.5 - localX) * 2, 4, Math.min(30, width * 0.8));
      return { ...params, slotWidth: Math.round(sw) };
    } else {
      const sw = helpers.clamp(Math.abs(height * 0.5 - localY) * 2, 4, Math.min(30, height * 0.8));
      return { ...params, slotWidth: Math.round(sw) };
    }
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, orientation: Number(params.orientation) === 1 ? 2 : 1 };
}

function buildPaths(width, height, params, helpers) {
  const orient = Math.round(helpers.clamp(Number(params.orientation) || 1, 1, 2));
  const maxDim = orient === 2 ? width * 0.8 : height * 0.8;
  const sw = helpers.clamp(Number(params.slotWidth) || 12, 4, Math.min(30, maxDim));

  const cx = width / 2;
  const cy = height / 2;
  const paths = [];

  if (orient === 2) {
    // Vertical router slot with rounded semicircular ends
    const slotH = Math.max(sw + 4, height - 8);
    const topY = cy - slotH / 2;
    paths.push({ nodes: helpers.rectPath(cx - sw / 2, topY, sw, slotH, sw / 2), closed: true });
    paths.push({
      nodes: [helpers.cornerNode(cx, topY + sw / 2), helpers.cornerNode(cx, topY + slotH - sw / 2)],
      closed: false
    });
  } else {
    // Horizontal router slot with rounded semicircular ends
    const slotW = Math.max(sw + 4, width - 8);
    const leftX = cx - slotW / 2;
    paths.push({ nodes: helpers.rectPath(leftX, cy - sw / 2, slotW, sw, sw / 2), closed: true });
    paths.push({
      nodes: [helpers.cornerNode(leftX + sw / 2, cy), helpers.cornerNode(leftX + slotW - sw / 2, cy)],
      closed: false
    });
  }

  return paths;
}`,
  },

  // 6.5 Breakaway Panel Tab with Mousebites
  {
    id: 'pcb-outline-mousebites',
    name: 'PCB: Breakaway Mousebites Tab',
    category: 'PCB Layout',
    description:
      'Panel breakaway separation tab with a perforation row of unplated drill holes ("mousebites") for clean manual panel breakout after SMT assembly.',
    iconName: 'MoreHorizontal',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to step hole count (3 -> 5 -> 7 -> 9)',
    paramSchema: [
      { key: 'label', label: 'Panel Tab', type: 'string', defaultValue: 'BREAKAWAY' },
      { key: 'holes', label: 'Perforation Holes', type: 'number', min: 3, max: 9, step: 1, defaultValue: 5 },
      { key: 'holeRadius', label: 'Hole Radius (px)', type: 'number', min: 2, max: 6, step: 0.5, defaultValue: 3 },
    ],
    defaultParams: {
      label: 'BREAKAWAY',
      holes: 5,
      holeRadius: 3,
    },
    jsSourceCode: `// PCB: Breakaway Mousebites Tab (.jsf)
function getControlPoints(width, height, params, helpers) {
  const h = Math.round(helpers.clamp(Number(params.holes) || 5, 3, 9));
  return [
    { id: 'holes', label: \`\${h} Holes\`, x: helpers.lerp(width * 0.25, width * 0.75, (h - 3) / 6), y: height - 6, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'holes') {
    const t = helpers.clamp((localX - width * 0.25) / (width * 0.5), 0, 1);
    return { ...params, holes: Math.round(3 + t * 6) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cycle = [3, 5, 7, 9];
  const idx = cycle.indexOf(params.holes);
  const next = cycle[(idx + 1) % cycle.length];
  return { ...params, holes: next };
}

function buildPaths(width, height, params, helpers) {
  const h = Math.round(helpers.clamp(Number(params.holes) || 5, 3, 9));
  const hr = helpers.clamp(Number(params.holeRadius) || 3, 2, 6);

  const cx = width / 2;
  const cy = height / 2;
  const tabW = width * 0.88;
  const tabH = height * 0.65;

  const paths = [];

  // Subpath 0: Breakaway Tab Bridge Rectangle
  paths.push({ nodes: helpers.rectPath(cx - tabW / 2, cy - tabH / 2, tabW, tabH, 2), closed: true });

  // Subpaths 1..N: Row of Perforation Drill Holes ("Mousebites")
  const step = tabW / (h + 1);
  for (let i = 1; i <= h; i++) {
    const hx = cx - tabW / 2 + i * step;
    paths.push({ nodes: helpers.circle(hx, cy, hr), closed: true });
  }

  return paths;
}`,
  },
];

import type { AutoShapeDefinition } from '../types/editor';

/**
 * OSITO STUDIO — DRONE PARTS & FRAMES AUTOSHAPES LIBRARY (.jsf)
 * 226 Parametric UAV Airframes, Carbon Chassis, Propulsion, Avionics, RF/Telemetry,
 * Optics/LiDAR/Payloads, Batteries/GCS & Test Bench AutoShapes
 * with live yellow diamond control handles, Preview Mode interactivity, and centered textblock labels.
 */
export const DRONE_PARTS_AND_FRAMES_AUTOSHAPES: AutoShapeDefinition[] = [
  // 1. 5" Freestyle / Racing Quadcopter X-Frame
  {
    id: 'drone-quad-x-frame',
    name: 'Drone: 5" Quadcopter X-Frame',
    category: 'Drone Parts & Frames',
    description:
      'Carbon-fiber 5-inch freestyle/racing quadcopter X-frame with adjustable arm width, central stack plate, and 4 motor mount pads.',
    iconName: 'Crosshair',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle prop guard rings on/off',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '5" Quad X-Frame' },
      { key: 'armWidthRatio', label: 'Carbon Arm Width', type: 'number', min: 0.06, max: 0.22, step: 0.01, defaultValue: 0.11 },
      { key: 'bodyRatio', label: 'Center Plate Size', type: 'number', min: 0.2, max: 0.48, step: 0.01, defaultValue: 0.3 },
      { key: 'showGuards', label: 'Show Prop Disc Rings', type: 'boolean', defaultValue: false },
    ],
    defaultParams: {
      label: '5" Quad X-Frame',
      armWidthRatio: 0.11,
      bodyRatio: 0.3,
      showGuards: false,
    },
    jsSourceCode: `// Drone: 5" Quadcopter X-Frame (.jsf)
function getControlPoints(width, height, params, helpers) {
  const aw = helpers.clamp(Number(params.armWidthRatio) || 0.11, 0.06, 0.22);
  const br = helpers.clamp(Number(params.bodyRatio) || 0.3, 0.2, 0.48);
  return [
    { id: 'bodyRatio', label: \`Center Plate: \${Math.round(br * 100)}%\`, x: width * (0.5 + br * 0.5), y: height * 0.5, cursor: 'ew-resize' },
    { id: 'armWidthRatio', label: \`Arm Width: \${Math.round(aw * 100)}%\`, x: width * 0.25, y: height * (0.25 - aw * 0.5), cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'bodyRatio') {
    const br = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.2, 0.48);
    return { ...params, bodyRatio: Number(br.toFixed(2)) };
  }
  if (id === 'armWidthRatio') {
    const aw = helpers.clamp(Math.abs(height * 0.25 - localY) * 2 / Math.max(1, height), 0.06, 0.22);
    return { ...params, armWidthRatio: Number(aw.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, showGuards: !params.showGuards };
}

function buildPaths(width, height, params, helpers) {
  const aw = helpers.clamp(Number(params.armWidthRatio) || 0.11, 0.06, 0.22) * Math.min(width, height) * 0.5;
  const br = helpers.clamp(Number(params.bodyRatio) || 0.3, 0.2, 0.48);
  const showGuards = Boolean(params.showGuards);
  const cx = width / 2;
  const cy = height / 2;
  const bw = width * br * 0.85;
  const bh = height * br * 1.15;
  const padR = Math.min(width, height) * 0.11;
  const inset = padR + 4;

  const motors = [
    { x: inset, y: inset },
    { x: width - inset, y: inset },
    { x: width - inset, y: height - inset },
    { x: inset, y: height - inset }
  ];

  const paths = [];
  // 4 diagonal arms
  for (let i = 0; i < 4; i++) {
    const m = motors[i];
    const angle = Math.atan2(m.y - cy, m.x - cx);
    const nx = -Math.sin(angle) * aw;
    const ny = Math.cos(angle) * aw;
    paths.push({
      nodes: helpers.polygonPath([
        { x: cx + nx, y: cy + ny },
        { x: m.x + nx * 0.75, y: m.y + ny * 0.75 },
        { x: m.x - nx * 0.75, y: m.y - ny * 0.75 },
        { x: cx - nx, y: cy - ny }
      ]),
      closed: true
    });
  }

  // Central carbon top/bottom plate + FC stack mount
  paths.push({ nodes: helpers.rectPath(cx - bw / 2, cy - bh / 2, bw, bh, Math.min(12, bw * 0.22)), closed: true });
  const stackW = bw * 0.56;
  const stackH = bh * 0.48;
  paths.push({ nodes: helpers.rectPath(cx - stackW / 2, cy - stackH / 2, stackW, stackH, 3), closed: true });

  // 4 Motor pads + optional prop discs
  for (let i = 0; i < 4; i++) {
    const m = motors[i];
    paths.push({ nodes: helpers.ellipsePath(m.x, m.y, padR, padR), closed: true });
    paths.push({ nodes: helpers.ellipsePath(m.x, m.y, padR * 0.38, padR * 0.38), closed: true });
    if (showGuards) {
      paths.push({ nodes: helpers.ellipsePath(m.x, m.y, padR * 1.75, padR * 1.75), closed: true });
    }
  }
  return paths;
}`,
  },

  // 2. Cinewhoop Ducted 4-Prop Indoor Frame
  {
    id: 'drone-cinewhoop-ducted',
    name: 'Drone: Cinewhoop Ducted Frame',
    category: 'Drone Parts & Frames',
    description:
      'Indoor/proximity Cinewhoop quadcopter frame with 4 overlapping aerodynamic prop ducts, central electronics bay, and front camera cage.',
    iconName: 'Disc',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle prop blade count inside ducts (3, 4, or 5 blades)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Cinewhoop Frame' },
      { key: 'ductWallRatio', label: 'Duct Ring Thickness', type: 'number', min: 0.08, max: 0.28, step: 0.01, defaultValue: 0.16 },
      { key: 'blades', label: 'Prop Blades', type: 'number', min: 3, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: {
      label: 'Cinewhoop Frame',
      ductWallRatio: 0.16,
      blades: 3,
    },
    jsSourceCode: `// Drone: Cinewhoop Ducted Frame (.jsf)
function getControlPoints(width, height, params, helpers) {
  const dw = helpers.clamp(Number(params.ductWallRatio) || 0.16, 0.08, 0.28);
  return [
    { id: 'ductWallRatio', label: \`Duct Wall: \${Math.round(dw * 100)}%\`, x: width * 0.24, y: height * (0.04 + dw * 0.22), cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'ductWallRatio') {
    const dw = helpers.clamp((localY / Math.max(1, height) - 0.04) / 0.22, 0.08, 0.28);
    return { ...params, ductWallRatio: Number(dw.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = ((Math.round(Number(params.blades) || 3) - 2) % 3) + 3;
  return { ...params, blades: next };
}

function buildPaths(width, height, params, helpers) {
  const dw = helpers.clamp(Number(params.ductWallRatio) || 0.16, 0.08, 0.28);
  const blades = Math.round(helpers.clamp(Number(params.blades) || 3, 3, 5));
  const cx = width / 2;
  const cy = height / 2;
  const outerR = Math.min(width, height) * 0.235;
  const innerR = outerR * (1 - dw);
  const centers = [
    { x: width * 0.255, y: height * 0.265 },
    { x: width * 0.745, y: height * 0.265 },
    { x: width * 0.745, y: height * 0.735 },
    { x: width * 0.255, y: height * 0.735 }
  ];

  const paths = [];
  for (let i = 0; i < 4; i++) {
    const c = centers[i];
    paths.push({ nodes: helpers.ellipsePath(c.x, c.y, outerR, outerR), closed: true });
    paths.push({ nodes: helpers.ellipsePath(c.x, c.y, innerR, innerR), closed: true });
    paths.push({ nodes: helpers.ellipsePath(c.x, c.y, innerR * 0.22, innerR * 0.22), closed: true });
    for (let b = 0; b < blades; b++) {
      const a = (b * Math.PI * 2) / blades - Math.PI / 4;
      paths.push({
        nodes: helpers.polygonPath([
          { x: c.x, y: c.y },
          { x: c.x + Math.cos(a) * innerR * 0.9, y: c.y + Math.sin(a) * innerR * 0.9 }
        ], false),
        closed: false
      });
    }
  }
  // Center fuselage + front FPV camera bumper
  const fw = width * 0.28;
  const fh = height * 0.56;
  paths.push({ nodes: helpers.rectPath(cx - fw / 2, cy - fh / 2, fw, fh, 8), closed: true });
  paths.push({ nodes: helpers.rectPath(cx - fw * 0.36, cy - fh / 2 - height * 0.06, fw * 0.72, height * 0.08, 3), closed: true });
  return paths;
}`,
  },

  // 3. Deadcat Long-Range FPV Frame
  {
    id: 'drone-deadcat-frame',
    name: 'Drone: Deadcat Long-Range Frame',
    category: 'Drone Parts & Frames',
    description:
      'Long-range Deadcat geometry drone chassis with wide-swept front arms (zero props in camera view), Li-Ion bay, and GPS tail mount.',
    iconName: 'Compass',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle front arm sweep angle',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Deadcat LR Frame' },
      { key: 'frontSweep', label: 'Front Arm Sweep Y', type: 'number', min: 0.14, max: 0.42, step: 0.01, defaultValue: 0.3 },
      { key: 'fuselageWidth', label: 'Fuselage Width Ratio', type: 'number', min: 0.16, max: 0.34, step: 0.01, defaultValue: 0.22 },
    ],
    defaultParams: {
      label: 'Deadcat LR Frame',
      frontSweep: 0.3,
      fuselageWidth: 0.22,
    },
    jsSourceCode: `// Drone: Deadcat Long-Range Frame (.jsf)
function getControlPoints(width, height, params, helpers) {
  const fs = helpers.clamp(Number(params.frontSweep) || 0.3, 0.14, 0.42);
  const fw = helpers.clamp(Number(params.fuselageWidth) || 0.22, 0.16, 0.34);
  return [
    { id: 'frontSweep', label: \`Front Sweep: \${Math.round(fs * 100)}%\`, x: width * 0.88, y: height * fs, cursor: 'ns-resize' },
    { id: 'fuselageWidth', label: \`Body: \${Math.round(fw * 100)}%\`, x: width * (0.5 + fw * 0.5), y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'frontSweep') {
    return { ...params, frontSweep: Number(helpers.clamp(localY / Math.max(1, height), 0.14, 0.42).toFixed(2)) };
  }
  if (id === 'fuselageWidth') {
    const fw = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.16, 0.34);
    return { ...params, fuselageWidth: Number(fw.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Number(params.frontSweep) || 0.3;
  return { ...params, frontSweep: cur > 0.26 ? 0.18 : 0.34 };
}

function buildPaths(width, height, params, helpers) {
  const fs = helpers.clamp(Number(params.frontSweep) || 0.3, 0.14, 0.42);
  const fw = helpers.clamp(Number(params.fuselageWidth) || 0.22, 0.16, 0.34) * width;
  const cx = width / 2;
  const fh = height * 0.68;
  const fy = (height - fh) / 2;
  const padR = Math.min(width, height) * 0.1;
  const armT = Math.max(5, Math.min(width, height) * 0.045);

  const fl = { x: padR + 4, y: height * fs };
  const fr = { x: width - padR - 4, y: height * fs };
  const rl = { x: width * 0.2, y: height - padR - 4 };
  const rr = { x: width * 0.8, y: height - padR - 4 };

  const armQuad = (x1, y1, x2, y2) => {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const nx = -Math.sin(a) * armT;
    const ny = Math.cos(a) * armT;
    return {
      nodes: helpers.polygonPath([
        { x: x1 + nx, y: y1 + ny },
        { x: x2 + nx * 0.7, y: y2 + ny * 0.7 },
        { x: x2 - nx * 0.7, y: y2 - ny * 0.7 },
        { x: x1 - nx, y: y1 - ny }
      ]),
      closed: true
    };
  };

  const paths = [
    armQuad(cx, fy + fh * 0.26, fl.x, fl.y),
    armQuad(cx, fy + fh * 0.26, fr.x, fr.y),
    armQuad(cx, fy + fh * 0.72, rl.x, rl.y),
    armQuad(cx, fy + fh * 0.72, rr.x, rr.y),
    { nodes: helpers.rectPath(cx - fw / 2, fy, fw, fh, 8), closed: true },
    { nodes: helpers.rectPath(cx - fw * 0.35, fy - height * 0.06, fw * 0.7, height * 0.08, 3), closed: true }
  ];
  [fl, fr, rl, rr].forEach((m) => {
    paths.push({ nodes: helpers.ellipsePath(m.x, m.y, padR, padR), closed: true });
    paths.push({ nodes: helpers.ellipsePath(m.x, m.y, padR * 0.35, padR * 0.35), closed: true });
  });
  return paths;
}`,
  },

  // 4. Hexacopter 6-Arm Heavy-Lift Frame
  {
    id: 'drone-hexacopter-frame',
    name: 'Drone: Hexacopter 6-Arm Frame',
    category: 'Drone Parts & Frames',
    description:
      'Industrial 6-rotor Hexacopter airframe with hexagonal avionics hub, 6 radial carbon booms, and coaxial motor mounts.',
    iconName: 'Hexagon',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle outer rotor safety ring',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Hexacopter 6-Rotor' },
      { key: 'hubRatio', label: 'Central Hub Radius', type: 'number', min: 0.16, max: 0.38, step: 0.01, defaultValue: 0.24 },
      { key: 'rotorRatio', label: 'Rotor Disc Radius', type: 'number', min: 0.08, max: 0.2, step: 0.01, defaultValue: 0.13 },
      { key: 'safetyRing', label: 'Outer Perimeter Ring', type: 'boolean', defaultValue: false },
    ],
    defaultParams: {
      label: 'Hexacopter 6-Rotor',
      hubRatio: 0.24,
      rotorRatio: 0.13,
      safetyRing: false,
    },
    jsSourceCode: `// Drone: Hexacopter 6-Arm Frame (.jsf)
function getControlPoints(width, height, params, helpers) {
  const hr = helpers.clamp(Number(params.hubRatio) || 0.24, 0.16, 0.38);
  const rr = helpers.clamp(Number(params.rotorRatio) || 0.13, 0.08, 0.2);
  return [
    { id: 'hubRatio', label: \`Hub: \${Math.round(hr * 100)}%\`, x: width * (0.5 + hr * 0.5), y: height * 0.5, cursor: 'ew-resize' },
    { id: 'rotorRatio', label: \`Rotor: \${Math.round(rr * 100)}%\`, x: width * 0.5, y: height * (0.12 + rr), cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'hubRatio') {
    const hr = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.16, 0.38);
    return { ...params, hubRatio: Number(hr.toFixed(2)) };
  }
  if (id === 'rotorRatio') {
    const rr = helpers.clamp(localY / Math.max(1, height) - 0.12, 0.08, 0.2);
    return { ...params, rotorRatio: Number(rr.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, safetyRing: !params.safetyRing };
}

function buildPaths(width, height, params, helpers) {
  const hr = helpers.clamp(Number(params.hubRatio) || 0.24, 0.16, 0.38);
  const rr = helpers.clamp(Number(params.rotorRatio) || 0.13, 0.08, 0.2) * Math.min(width, height);
  const ring = Boolean(params.safetyRing);
  const cx = width / 2;
  const cy = height / 2;
  const armR = Math.min(width, height) * 0.5 - rr - 2;
  const hubRx = width * hr * 0.5;
  const hubRy = height * hr * 0.5;
  const paths = [];

  if (ring) {
    paths.push({ nodes: helpers.ellipsePath(cx, cy, armR + rr * 0.5, armR + rr * 0.5), closed: true });
  }

  const hexPts = [];
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 3;
    hexPts.push({ x: cx + Math.cos(a) * hubRx, y: cy + Math.sin(a) * hubRy });
    const mx = cx + Math.cos(a) * armR;
    const my = cy + Math.sin(a) * armR;
    paths.push({ nodes: helpers.polygonPath([{ x: cx, y: cy }, { x: mx, y: my }], false), closed: false });
    paths.push({ nodes: helpers.ellipsePath(mx, my, rr, rr), closed: true });
    paths.push({ nodes: helpers.ellipsePath(mx, my, rr * 0.32, rr * 0.32), closed: true });
  }
  paths.push({ nodes: helpers.polygonPath(hexPts), closed: true });
  return paths;
}`,
  },

  // 5. Octocopter 8-Arm Heavy Payload Frame
  {
    id: 'drone-octocopter-frame',
    name: 'Drone: Octocopter 8-Arm Frame',
    category: 'Drone Parts & Frames',
    description:
      'Heavy-lift 8-rotor Octocopter star airframe with central gimbal payload ring and 8 radial propulsion arms.',
    iconName: 'Sun',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle between 8-Arm Star and 6-Arm Heavy configuration',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Octocopter 8-Arm' },
      { key: 'arms', label: 'Rotor Arms', type: 'number', min: 6, max: 8, step: 2, defaultValue: 8 },
      { key: 'payloadRatio', label: 'Payload Bay Radius', type: 'number', min: 0.16, max: 0.36, step: 0.01, defaultValue: 0.25 },
    ],
    defaultParams: {
      label: 'Octocopter 8-Arm',
      arms: 8,
      payloadRatio: 0.25,
    },
    jsSourceCode: `// Drone: Octocopter 8-Arm Frame (.jsf)
function getControlPoints(width, height, params, helpers) {
  const pr = helpers.clamp(Number(params.payloadRatio) || 0.25, 0.16, 0.36);
  return [
    { id: 'payloadRatio', label: \`Payload Bay: \${Math.round(pr * 100)}%\`, x: width * (0.5 + pr * 0.5), y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'payloadRatio') {
    const pr = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.16, 0.36);
    return { ...params, payloadRatio: Number(pr.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.arms) || 8);
  return { ...params, arms: cur === 8 ? 6 : 8 };
}

function buildPaths(width, height, params, helpers) {
  const arms = Math.round(helpers.clamp(Number(params.arms) || 8, 6, 8));
  const pr = helpers.clamp(Number(params.payloadRatio) || 0.25, 0.16, 0.36);
  const cx = width / 2;
  const cy = height / 2;
  const minDim = Math.min(width, height);
  const rr = minDim * 0.095;
  const armR = minDim * 0.5 - rr - 3;
  const hubR = minDim * pr * 0.5;

  const paths = [
    { nodes: helpers.ellipsePath(cx, cy, hubR, hubR), closed: true },
    { nodes: helpers.ellipsePath(cx, cy, hubR * 0.6, hubR * 0.6), closed: true }
  ];

  for (let i = 0; i < arms; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / arms + Math.PI / arms;
    const mx = cx + Math.cos(a) * armR;
    const my = cy + Math.sin(a) * armR;
    paths.push({ nodes: helpers.polygonPath([{ x: cx + Math.cos(a) * hubR, y: cy + Math.sin(a) * hubR }, { x: mx, y: my }], false), closed: false });
    paths.push({ nodes: helpers.ellipsePath(mx, my, rr, rr), closed: true });
    paths.push({ nodes: helpers.ellipsePath(mx, my, rr * 0.34, rr * 0.34), closed: true });
  }
  return paths;
}`,
  },

  // 6. Fixed-Wing VTOL Hybrid Airframe
  {
    id: 'drone-vtol-fixed-wing',
    name: 'Drone: Fixed-Wing VTOL Airframe',
    category: 'Drone Parts & Frames',
    description:
      'Long-endurance hybrid VTOL fixed-wing UAV with swept main wing, twin vertical-lift boom pods, central fuselage pod, and H-tail.',
    iconName: 'Send',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle pusher prop & VTOL rotor discs',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'VTOL Fixed-Wing' },
      { key: 'wingChordRatio', label: 'Wing Chord Depth', type: 'number', min: 0.16, max: 0.38, step: 0.01, defaultValue: 0.25 },
      { key: 'boomSpanRatio', label: 'VTOL Boom Span', type: 'number', min: 0.36, max: 0.72, step: 0.01, defaultValue: 0.54 },
      { key: 'showRotors', label: 'Show VTOL Rotor Discs', type: 'boolean', defaultValue: true },
    ],
    defaultParams: {
      label: 'VTOL Fixed-Wing',
      wingChordRatio: 0.25,
      boomSpanRatio: 0.54,
      showRotors: true,
    },
    jsSourceCode: `// Drone: Fixed-Wing VTOL Airframe (.jsf)
function getControlPoints(width, height, params, helpers) {
  const wc = helpers.clamp(Number(params.wingChordRatio) || 0.25, 0.16, 0.38);
  const bs = helpers.clamp(Number(params.boomSpanRatio) || 0.54, 0.36, 0.72);
  return [
    { id: 'wingChordRatio', label: \`Wing Chord: \${Math.round(wc * 100)}%\`, x: width * 0.5, y: height * (0.28 + wc), cursor: 'ns-resize' },
    { id: 'boomSpanRatio', label: \`Boom Span: \${Math.round(bs * 100)}%\`, x: width * (0.5 + bs * 0.5), y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'wingChordRatio') {
    const wc = helpers.clamp(localY / Math.max(1, height) - 0.28, 0.16, 0.38);
    return { ...params, wingChordRatio: Number(wc.toFixed(2)) };
  }
  if (id === 'boomSpanRatio') {
    const bs = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.36, 0.72);
    return { ...params, boomSpanRatio: Number(bs.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, showRotors: !params.showRotors };
}

function buildPaths(width, height, params, helpers) {
  const wc = helpers.clamp(Number(params.wingChordRatio) || 0.25, 0.16, 0.38) * height;
  const bs = helpers.clamp(Number(params.boomSpanRatio) || 0.54, 0.36, 0.72);
  const showRotors = params.showRotors !== false;
  const cx = width / 2;
  const wingY = height * 0.28;
  const boomL = width * (0.5 - bs * 0.5);
  const boomR = width * (0.5 + bs * 0.5);
  const fuseW = width * 0.16;

  const paths = [
    // Swept main wing
    {
      nodes: helpers.polygonPath([
        { x: cx, y: wingY },
        { x: width, y: wingY + wc * 0.35 },
        { x: width, y: wingY + wc },
        { x: cx, y: wingY + wc * 0.85 },
        { x: 0, y: wingY + wc },
        { x: 0, y: wingY + wc * 0.35 }
      ]),
      closed: true
    },
    // Central fuselage pod
    { nodes: helpers.rectPath(cx - fuseW / 2, height * 0.06, fuseW, height * 0.62, fuseW / 2), closed: true },
    // Twin VTOL booms + horizontal tailplane
    { nodes: helpers.rectPath(boomL - 3, height * 0.16, 6, height * 0.76, 3), closed: true },
    { nodes: helpers.rectPath(boomR - 3, height * 0.16, 6, height * 0.76, 3), closed: true },
    { nodes: helpers.rectPath(boomL, height * 0.84, boomR - boomL, height * 0.1, 3), closed: true }
  ];

  if (showRotors) {
    const rr = Math.min(width, height) * 0.085;
    const pts = [
      { x: boomL, y: height * 0.18 },
      { x: boomR, y: height * 0.18 },
      { x: boomL, y: height * 0.72 },
      { x: boomR, y: height * 0.72 }
    ];
    for (let i = 0; i < pts.length; i++) {
      paths.push({ nodes: helpers.ellipsePath(pts[i].x, pts[i].y, rr, rr), closed: true });
    }
  }
  return paths;
}`,
  },

  // 7. Foldable Reconnaissance Drone Airframe
  {
    id: 'drone-foldable-recon',
    name: 'Drone: Foldable Recon Airframe',
    category: 'Drone Parts & Frames',
    description:
      'Compact foldable reconnaissance quadcopter with articulating arm hinge angle, nose gimbal camera, and top LiPo battery bay.',
    iconName: 'Camera',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to fold/unfold the 4 reconnaissance arms for transport vs flight',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Recon Quad UAV' },
      { key: 'unfoldRatio', label: 'Arm Unfold Extension', type: 'number', min: 0.25, max: 1, step: 0.05, defaultValue: 0.95 },
      { key: 'bodyWidthRatio', label: 'Fuselage Width Ratio', type: 'number', min: 0.2, max: 0.4, step: 0.01, defaultValue: 0.28 },
    ],
    defaultParams: {
      label: 'Recon Quad UAV',
      unfoldRatio: 0.95,
      bodyWidthRatio: 0.28,
    },
    jsSourceCode: `// Drone: Foldable Recon Airframe (.jsf)
function getControlPoints(width, height, params, helpers) {
  const uf = helpers.clamp(Number(params.unfoldRatio) || 0.95, 0.25, 1);
  return [
    { id: 'unfoldRatio', label: \`Unfold: \${Math.round(uf * 100)}%\`, x: helpers.lerp(width * 0.62, width * 0.92, (uf - 0.25) / 0.75), y: height * 0.22, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'unfoldRatio') {
    const t = helpers.clamp((localX - width * 0.62) / (width * 0.3), 0, 1);
    return { ...params, unfoldRatio: Number((0.25 + t * 0.75).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Number(params.unfoldRatio) || 0.95;
  return { ...params, unfoldRatio: cur > 0.6 ? 0.3 : 0.95 };
}

function buildPaths(width, height, params, helpers) {
  const uf = helpers.clamp(Number(params.unfoldRatio) || 0.95, 0.25, 1);
  const bw = helpers.clamp(Number(params.bodyWidthRatio) || 0.28, 0.2, 0.4) * width;
  const cx = width / 2;
  const bh = height * 0.64;
  const by = (height - bh) / 2;
  const spanX = helpers.lerp(bw * 0.65, width * 0.4, (uf - 0.25) / 0.75);
  const rr = Math.min(width, height) * 0.095;

  const joints = [
    { jx: cx - bw / 2, jy: by + bh * 0.22, mx: cx - spanX, my: by + bh * (0.45 - uf * 0.35) },
    { jx: cx + bw / 2, jy: by + bh * 0.22, mx: cx + spanX, my: by + bh * (0.45 - uf * 0.35) },
    { jx: cx - bw / 2, jy: by + bh * 0.78, mx: cx - spanX, my: by + bh * (0.55 + uf * 0.35) },
    { jx: cx + bw / 2, jy: by + bh * 0.78, mx: cx + spanX, my: by + bh * (0.55 + uf * 0.35) }
  ];

  const paths = [
    { nodes: helpers.rectPath(cx - bw / 2, by, bw, bh, 10), closed: true },
    { nodes: helpers.rectPath(cx - bw * 0.32, by - height * 0.05, bw * 0.64, height * 0.07, 4), closed: true },
    { nodes: helpers.rectPath(cx - bw * 0.34, by + bh * 0.2, bw * 0.68, bh * 0.56, 4), closed: true }
  ];
  for (let i = 0; i < 4; i++) {
    const j = joints[i];
    paths.push({ nodes: helpers.polygonPath([{ x: j.jx, y: j.jy }, { x: j.mx, y: j.my }], false), closed: false });
    paths.push({ nodes: helpers.ellipsePath(j.mx, j.my, rr, rr), closed: true });
    paths.push({ nodes: helpers.ellipsePath(j.mx, j.my, rr * 0.35, rr * 0.35), closed: true });
  }
  return paths;
}`,
  },

  // 8. Carbon Fiber Replacement Drone Arm
  {
    id: 'drone-carbon-arm',
    name: 'Drone Part: Carbon Fiber Arm',
    category: 'Drone Parts & Frames',
    description:
      'CNC-machined 5mm 3K carbon fiber replacement drone arm with motor mounting bolt pattern, weight-relief pocket, and root stack holes.',
    iconName: 'Wrench',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle weight-relief CNC cutout pocket',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '5mm Carbon Arm' },
      { key: 'padRadiusRatio', label: 'Motor Pad Radius', type: 'number', min: 0.2, max: 0.44, step: 0.01, defaultValue: 0.32 },
      { key: 'beamRatio', label: 'Arm Beam Thickness', type: 'number', min: 0.22, max: 0.58, step: 0.01, defaultValue: 0.38 },
      { key: 'weightCutout', label: 'CNC Weight Relief Pocket', type: 'boolean', defaultValue: true },
    ],
    defaultParams: {
      label: '5mm Carbon Arm',
      padRadiusRatio: 0.32,
      beamRatio: 0.38,
      weightCutout: true,
    },
    jsSourceCode: `// Drone Part: Carbon Fiber Arm (.jsf)
function getControlPoints(width, height, params, helpers) {
  const pr = helpers.clamp(Number(params.padRadiusRatio) || 0.32, 0.2, 0.44);
  const br = helpers.clamp(Number(params.beamRatio) || 0.38, 0.22, 0.58);
  return [
    { id: 'beamRatio', label: \`Beam: \${Math.round(br * 100)}%\`, x: width * 0.45, y: height * (0.5 - br * 0.5), cursor: 'ns-resize' },
    { id: 'padRadiusRatio', label: \`Motor Pad: \${Math.round(pr * 100)}%\`, x: width * (1 - pr * 0.5), y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'beamRatio') {
    const br = helpers.clamp((Math.abs(localY - height * 0.5) * 2) / Math.max(1, height), 0.22, 0.58);
    return { ...params, beamRatio: Number(br.toFixed(2)) };
  }
  if (id === 'padRadiusRatio') {
    const pr = helpers.clamp(((width - localX) * 2) / Math.max(1, width), 0.2, 0.44);
    return { ...params, padRadiusRatio: Number(pr.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, weightCutout: !params.weightCutout };
}

function buildPaths(width, height, params, helpers) {
  const pr = helpers.clamp(Number(params.padRadiusRatio) || 0.32, 0.2, 0.44) * Math.min(width, height);
  const bh = helpers.clamp(Number(params.beamRatio) || 0.38, 0.22, 0.58) * height;
  const cutout = params.weightCutout !== false;
  const cy = height / 2;
  const mx = width - pr - 4;
  const paths = [
    { nodes: helpers.rectPath(4, cy - bh / 2, mx - 4, bh, bh * 0.3), closed: true },
    { nodes: helpers.ellipsePath(mx, cy, pr, pr), closed: true },
    { nodes: helpers.ellipsePath(mx, cy, pr * 0.3, pr * 0.3), closed: true },
    // Root mounting bolt holes
    { nodes: helpers.ellipsePath(width * 0.1, cy, 4, 4), closed: true },
    { nodes: helpers.ellipsePath(width * 0.2, cy, 4, 4), closed: true }
  ];
  // 4 M3 motor bolt pattern holes
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    paths.push({
      nodes: helpers.ellipsePath(mx + Math.cos(a) * pr * 0.62, cy + Math.sin(a) * pr * 0.62, 3.2, 3.2),
      closed: true
    });
  }
  if (cutout) {
    paths.push({
      nodes: helpers.rectPath(width * 0.28, cy - bh * 0.22, Math.max(12, mx - pr - width * 0.32), bh * 0.44, bh * 0.2),
      closed: true
    });
  }
  return paths;
}`,
  },

  // 9. Brushless Stator Motor (2207 / 2806.5)
  {
    id: 'drone-brushless-motor',
    name: 'Drone Part: Brushless Motor (2207)',
    category: 'Drone Parts & Frames',
    description:
      'High-KV FPV brushless outrunner motor showing stator bell, radial copper electromagnetic poles, M5 Titanium shaft, and 3-phase motor wires.',
    iconName: 'Cog',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle stator pole count (9, 12, or 14 poles)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '2207 Brushless' },
      { key: 'poles', label: 'Stator Winding Poles', type: 'number', min: 6, max: 14, step: 2, defaultValue: 12 },
      { key: 'shaftRatio', label: 'Center Hub Ratio', type: 'number', min: 0.16, max: 0.4, step: 0.01, defaultValue: 0.26 },
    ],
    defaultParams: {
      label: '2207 Brushless',
      poles: 12,
      shaftRatio: 0.26,
    },
    jsSourceCode: `// Drone Part: Brushless Motor (2207) (.jsf)
function getControlPoints(width, height, params, helpers) {
  const sr = helpers.clamp(Number(params.shaftRatio) || 0.26, 0.16, 0.4);
  const poles = Math.round(helpers.clamp(Number(params.poles) || 12, 6, 14));
  return [
    { id: 'shaftRatio', label: \`Hub: \${Math.round(sr * 100)}%\`, x: width * (0.5 + sr * 0.4), y: height * 0.46, cursor: 'ew-resize' },
    { id: 'poles', label: \`Poles: \${poles}\`, x: helpers.lerp(width * 0.2, width * 0.8, (poles - 6) / 8), y: 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'shaftRatio') {
    const sr = helpers.clamp((Math.abs(localX - width * 0.5) * 2.5) / Math.max(1, width), 0.16, 0.4);
    return { ...params, shaftRatio: Number(sr.toFixed(2)) };
  }
  if (id === 'poles') {
    const t = helpers.clamp((localX - width * 0.2) / (width * 0.6), 0, 1);
    return { ...params, poles: Math.round(3 + t * 4) * 2 };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.poles) || 12);
  const next = cur === 12 ? 14 : cur === 14 ? 8 : 12;
  return { ...params, poles: next };
}

function buildPaths(width, height, params, helpers) {
  const poles = Math.round(helpers.clamp(Number(params.poles) || 12, 6, 14));
  const sr = helpers.clamp(Number(params.shaftRatio) || 0.26, 0.16, 0.4);
  const cx = width / 2;
  const cy = height * 0.45;
  const r = Math.min(width, height * 0.86) * 0.46;
  const innerR = r * 0.82;
  const hubR = r * sr;

  const paths = [
    { nodes: helpers.ellipsePath(cx, cy, r, r), closed: true },
    { nodes: helpers.ellipsePath(cx, cy, innerR, innerR), closed: true },
    { nodes: helpers.ellipsePath(cx, cy, hubR, hubR), closed: true },
    { nodes: helpers.ellipsePath(cx, cy, hubR * 0.42, hubR * 0.42), closed: true }
  ];

  for (let i = 0; i < poles; i++) {
    const a = (i * Math.PI * 2) / poles;
    paths.push({
      nodes: helpers.polygonPath([
        { x: cx + Math.cos(a) * hubR, y: cy + Math.sin(a) * hubR },
        { x: cx + Math.cos(a) * innerR, y: cy + Math.sin(a) * innerR }
      ], false),
      closed: false
    });
  }

  // 3-phase silicone motor leads exiting bottom
  for (let w = -1; w <= 1; w++) {
    const wx = cx + w * r * 0.24;
    paths.push({
      nodes: helpers.rectPath(wx - 3, cy + r * 0.92, 6, Math.max(8, height - (cy + r * 0.92)), 2),
      closed: true
    });
  }
  return paths;
}`,
  },

  // 10. Tri-Blade / Bi-Blade / 5-Blade Propeller
  {
    id: 'drone-propeller-blade',
    name: 'Drone Part: Multi-Blade Propeller',
    category: 'Drone Parts & Frames',
    description:
      'Parametric polycarbonate FPV / UAV propeller with configurable blade count (2 to 6 blades), pitch chord width, and M5 hub bore.',
    iconName: 'Fan',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle propeller blade count (2, 3, 4, 5, 6 blades)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '51466 Tri-Prop' },
      { key: 'blades', label: 'Propeller Blades', type: 'number', min: 2, max: 6, step: 1, defaultValue: 3 },
      { key: 'chordRatio', label: 'Blade Chord Width', type: 'number', min: 0.1, max: 0.32, step: 0.01, defaultValue: 0.18 },
    ],
    defaultParams: {
      label: '51466 Tri-Prop',
      blades: 3,
      chordRatio: 0.18,
    },
    jsSourceCode: `// Drone Part: Multi-Blade Propeller (.jsf)
function getControlPoints(width, height, params, helpers) {
  const blades = Math.round(helpers.clamp(Number(params.blades) || 3, 2, 6));
  const cr = helpers.clamp(Number(params.chordRatio) || 0.18, 0.1, 0.32);
  return [
    { id: 'blades', label: \`Blades: \${blades}\`, x: helpers.lerp(width * 0.2, width * 0.8, (blades - 2) / 4), y: 8, cursor: 'ew-resize' },
    { id: 'chordRatio', label: \`Chord: \${Math.round(cr * 100)}%\`, x: width * (0.5 + cr), y: height * 0.26, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'blades') {
    const t = helpers.clamp((localX - width * 0.2) / (width * 0.6), 0, 1);
    return { ...params, blades: Math.round(2 + t * 4) };
  }
  if (id === 'chordRatio') {
    const cr = helpers.clamp(Math.abs(localX - width * 0.5) / Math.max(1, width), 0.1, 0.32);
    return { ...params, chordRatio: Number(cr.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.blades) || 3);
  const next = cur >= 6 ? 2 : cur + 1;
  return { ...params, blades: next };
}

function buildPaths(width, height, params, helpers) {
  const blades = Math.round(helpers.clamp(Number(params.blades) || 3, 2, 6));
  const cr = helpers.clamp(Number(params.chordRatio) || 0.18, 0.1, 0.32);
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) * 0.47;
  const hubR = maxR * 0.22;
  const chord = maxR * cr;
  const paths = [];

  for (let i = 0; i < blades; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / blades;
    const nx = -Math.sin(a) * chord;
    const ny = Math.cos(a) * chord;
    const midX = cx + Math.cos(a) * maxR * 0.62;
    const midY = cy + Math.sin(a) * maxR * 0.62;
    const tipX = cx + Math.cos(a) * maxR;
    const tipY = cy + Math.sin(a) * maxR;
    const rootX = cx + Math.cos(a) * hubR * 0.85;
    const rootY = cy + Math.sin(a) * hubR * 0.85;

    paths.push({
      nodes: helpers.polygonPath([
        { x: rootX - nx * 0.35, y: rootY - ny * 0.35 },
        { x: midX - nx * 0.55, y: midY - ny * 0.55 },
        { x: tipX + nx * 0.15, y: tipY + ny * 0.15 },
        { x: midX + nx * 1.15, y: midY + ny * 1.15 },
        { x: rootX + nx * 0.45, y: rootY + ny * 0.45 }
      ]),
      closed: true
    });
  }

  paths.push({ nodes: helpers.ellipsePath(cx, cy, hubR, hubR), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, cy, hubR * 0.4, hubR * 0.4), closed: true });
  return paths;
}`,
  },

  // 11. Flight Controller PCB (30.5×30.5mm / 20×20mm)
  {
    id: 'drone-flight-controller',
    name: 'Drone Part: Flight Controller PCB',
    category: 'Drone Parts & Frames',
    description:
      'STM32 H743 / F722 Flight Controller PCB with corner M3 anti-vibration grommets, dual IMU gyro chips, OSD/Blackbox flash, USB-C port, and UART solder pads.',
    iconName: 'Cpu',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle between Single-Gyro and Dual-Gyro redundant layout',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'H7 Flight Ctrl' },
      { key: 'mcuRatio', label: 'STM32 MCU Chip Size', type: 'number', min: 0.22, max: 0.46, step: 0.01, defaultValue: 0.32 },
      { key: 'padsPerSide', label: 'UART Solder Pads / Side', type: 'number', min: 4, max: 9, step: 1, defaultValue: 6 },
      { key: 'dualGyro', label: 'Dual Redundant IMU Gyros', type: 'boolean', defaultValue: true },
    ],
    defaultParams: {
      label: 'H7 Flight Ctrl',
      mcuRatio: 0.32,
      padsPerSide: 6,
      dualGyro: true,
    },
    jsSourceCode: `// Drone Part: Flight Controller PCB (.jsf)
function getControlPoints(width, height, params, helpers) {
  const mr = helpers.clamp(Number(params.mcuRatio) || 0.32, 0.22, 0.46);
  const pads = Math.round(helpers.clamp(Number(params.padsPerSide) || 6, 4, 9));
  return [
    { id: 'mcuRatio', label: \`MCU: \${Math.round(mr * 100)}%\`, x: width * (0.5 + mr * 0.5), y: height * 0.5, cursor: 'ew-resize' },
    { id: 'padsPerSide', label: \`Pads: \${pads}\`, x: helpers.lerp(width * 0.22, width * 0.78, (pads - 4) / 5), y: 10, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'mcuRatio') {
    const mr = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.22, 0.46);
    return { ...params, mcuRatio: Number(mr.toFixed(2)) };
  }
  if (id === 'padsPerSide') {
    const t = helpers.clamp((localX - width * 0.22) / (width * 0.56), 0, 1);
    return { ...params, padsPerSide: Math.round(4 + t * 5) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, dualGyro: !params.dualGyro };
}

function buildPaths(width, height, params, helpers) {
  const mr = helpers.clamp(Number(params.mcuRatio) || 0.32, 0.22, 0.46);
  const pads = Math.round(helpers.clamp(Number(params.padsPerSide) || 6, 4, 9));
  const dual = params.dualGyro !== false;
  const cx = width / 2;
  const cy = height / 2;
  const holeInset = Math.min(width, height) * 0.12;
  const holeR = Math.min(width, height) * 0.055;
  const mcuW = width * mr;
  const mcuH = height * mr;

  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 10), closed: true },
    // 4 M3 mounting grommets
    { nodes: helpers.ellipsePath(holeInset, holeInset, holeR, holeR), closed: true },
    { nodes: helpers.ellipsePath(width - holeInset, holeInset, holeR, holeR), closed: true },
    { nodes: helpers.ellipsePath(width - holeInset, height - holeInset, holeR, holeR), closed: true },
    { nodes: helpers.ellipsePath(holeInset, height - holeInset, holeR, holeR), closed: true },
    // Central STM32 MCU
    { nodes: helpers.rectPath(cx - mcuW / 2, cy - mcuH / 2, mcuW, mcuH, 3), closed: true },
    // USB-C port on bottom edge
    { nodes: helpers.rectPath(cx - width * 0.14, height - height * 0.1, width * 0.28, height * 0.1, 2), closed: true }
  ];

  // IMU Gyro chip(s)
  const gw = width * 0.12;
  const gh = height * 0.12;
  paths.push({ nodes: helpers.rectPath(cx - mcuW / 2 - gw - 6, cy - gh / 2, gw, gh, 2), closed: true });
  if (dual) {
    paths.push({ nodes: helpers.rectPath(cx + mcuW / 2 + 6, cy - gh / 2, gw, gh, 2), closed: true });
  }

  // Top & bottom UART solder pad rows
  const padSpan = width * 0.54;
  const pw = (padSpan / pads) * 0.65;
  for (let i = 0; i < pads; i++) {
    const px = cx - padSpan / 2 + (i + 0.15) * (padSpan / pads);
    paths.push({ nodes: helpers.rectPath(px, 5, pw, height * 0.06, 1), closed: true });
  }
  return paths;
}`,
  },

  // 12. 4-in-1 ESC Power Distribution Board
  {
    id: 'drone-esc-4in1',
    name: 'Drone Part: 4-in-1 ESC Power Board',
    category: 'Drone Parts & Frames',
    description:
      '60A BLHeli_32 / AM32 4-in-1 Electronic Speed Controller PCB with 12 high-current motor solder pads, MOSFET banks, and XT60 Low-ESR capacitor.',
    iconName: 'Zap',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle external Low-ESR filter capacitor & XT60 pigtail',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '60A 4-in-1 ESC' },
      { key: 'padSizeRatio', label: 'Motor Solder Pad Size', type: 'number', min: 0.08, max: 0.18, step: 0.01, defaultValue: 0.12 },
      { key: 'showCapacitor', label: 'Show Low-ESR Capacitor', type: 'boolean', defaultValue: true },
    ],
    defaultParams: {
      label: '60A 4-in-1 ESC',
      padSizeRatio: 0.12,
      showCapacitor: true,
    },
    jsSourceCode: `// Drone Part: 4-in-1 ESC Power Board (.jsf)
function getControlPoints(width, height, params, helpers) {
  const ps = helpers.clamp(Number(params.padSizeRatio) || 0.12, 0.08, 0.18);
  return [
    { id: 'padSizeRatio', label: \`Solder Pads: \${Math.round(ps * 100)}%\`, x: width * ps, y: height * 0.35, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'padSizeRatio') {
    return { ...params, padSizeRatio: Number(helpers.clamp(localX / Math.max(1, width), 0.08, 0.18).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, showCapacitor: !params.showCapacitor };
}

function buildPaths(width, height, params, helpers) {
  const ps = helpers.clamp(Number(params.padSizeRatio) || 0.12, 0.08, 0.18);
  const showCap = params.showCapacitor !== false;
  const boardH = showCap ? height * 0.8 : height;
  const holeInset = Math.min(width, boardH) * 0.12;
  const holeR = Math.min(width, boardH) * 0.05;
  const pw = width * ps;
  const ph = boardH * 0.08;

  const paths = [
    { nodes: helpers.rectPath(0, 0, width, boardH, 8), closed: true },
    { nodes: helpers.ellipsePath(holeInset, holeInset, holeR, holeR), closed: true },
    { nodes: helpers.ellipsePath(width - holeInset, holeInset, holeR, holeR), closed: true },
    { nodes: helpers.ellipsePath(width - holeInset, boardH - holeInset, holeR, holeR), closed: true },
    { nodes: helpers.ellipsePath(holeInset, boardH - holeInset, holeR, holeR), closed: true },
    // 2 MOSFET gate banks
    { nodes: helpers.rectPath(width * 0.22, boardH * 0.16, width * 0.56, boardH * 0.28, 3), closed: true },
    { nodes: helpers.rectPath(width * 0.22, boardH * 0.54, width * 0.56, boardH * 0.28, 3), closed: true }
  ];

  // 6 motor phase solder pads on Left and 6 on Right
  for (let i = 0; i < 6; i++) {
    const py = boardH * 0.22 + i * (boardH * 0.1);
    paths.push({ nodes: helpers.rectPath(3, py, pw, ph, 1.5), closed: true });
    paths.push({ nodes: helpers.rectPath(width - pw - 3, py, pw, ph, 1.5), closed: true });
  }

  if (showCap) {
    const capR = Math.min(width * 0.14, (height - boardH) * 0.45);
    paths.push({ nodes: helpers.ellipsePath(width * 0.5, boardH + capR + 3, capR * 1.4, capR), closed: true });
  }
  return paths;
}`,
  },

  // 13. LiPo / Li-Ion Battery Pack (4S/6S XT60)
  {
    id: 'drone-lipo-battery',
    name: 'Drone Part: 6S LiPo Battery Pack',
    category: 'Drone Parts & Frames',
    description:
      'High-discharge 4S/6S LiPo or 21700 Li-Ion battery pack with cell stack partitions, velcro strap band, balance lead, and XT60 power plug.',
    iconName: 'BatteryCharging',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle cell count (3S, 4S, 6S LiPo)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '6S 1300mAh LiPo' },
      { key: 'cells', label: 'LiPo Series Cells (S)', type: 'number', min: 2, max: 6, step: 1, defaultValue: 6 },
      { key: 'leadRatio', label: 'XT60 Pigtail Length', type: 'number', min: 0.14, max: 0.34, step: 0.01, defaultValue: 0.22 },
    ],
    defaultParams: {
      label: '6S 1300mAh LiPo',
      cells: 6,
      leadRatio: 0.22,
    },
    jsSourceCode: `// Drone Part: 6S LiPo Battery Pack (.jsf)
function getControlPoints(width, height, params, helpers) {
  const cells = Math.round(helpers.clamp(Number(params.cells) || 6, 2, 6));
  const lr = helpers.clamp(Number(params.leadRatio) || 0.22, 0.14, 0.34);
  return [
    { id: 'leadRatio', label: \`XT60 Lead: \${Math.round(lr * 100)}%\`, x: width * (1 - lr), y: height * 0.38, cursor: 'ew-resize' },
    { id: 'cells', label: \`\${cells}S Pack\`, x: helpers.lerp(width * 0.15, width * 0.65, (cells - 2) / 4), y: height - 6, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'leadRatio') {
    const lr = helpers.clamp(1 - localX / Math.max(1, width), 0.14, 0.34);
    return { ...params, leadRatio: Number(lr.toFixed(2)) };
  }
  if (id === 'cells') {
    const t = helpers.clamp((localX - width * 0.15) / (width * 0.5), 0, 1);
    return { ...params, cells: Math.round(2 + t * 4) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.cells) || 6);
  const next = cur === 6 ? 4 : cur === 4 ? 3 : 6;
  return { ...params, cells: next, label: \`\${next}S 1300mAh LiPo\` };
}

function buildPaths(width, height, params, helpers) {
  const cells = Math.round(helpers.clamp(Number(params.cells) || 6, 2, 6));
  const lr = helpers.clamp(Number(params.leadRatio) || 0.22, 0.14, 0.34);
  const packW = width * (1 - lr);
  const pad = height * 0.08;
  const packH = height - pad * 2;

  const paths = [
    { nodes: helpers.rectPath(0, pad, packW, packH, 6), closed: true },
    // Center Kevlar battery strap
    { nodes: helpers.rectPath(packW * 0.38, 0, packW * 0.18, height, 2), closed: true }
  ];

  // Cell partition lines
  for (let i = 1; i < cells; i++) {
    const cy = pad + (packH * i) / cells;
    paths.push({ nodes: helpers.polygonPath([{ x: 4, y: cy }, { x: packW - 4, y: cy }], false), closed: false });
  }

  // XT60 Power Lead + Connector Housing
  const plugW = width * lr * 0.55;
  const plugX = width - plugW;
  const plugY = height * 0.22;
  const plugH = height * 0.34;
  paths.push({ nodes: helpers.polygonPath([{ x: packW, y: plugY + plugH * 0.3 }, { x: plugX, y: plugY + plugH * 0.3 }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: packW, y: plugY + plugH * 0.7 }, { x: plugX, y: plugY + plugH * 0.7 }], false), closed: false });
  paths.push({ nodes: helpers.rectPath(plugX, plugY, plugW, plugH, 3), closed: true });

  // JST-XH Balance Plug
  const balY = height * 0.66;
  const balH = height * 0.2;
  paths.push({ nodes: helpers.polygonPath([{ x: packW, y: balY + balH / 2 }, { x: plugX, y: balY + balH / 2 }], false), closed: false });
  paths.push({ nodes: helpers.rectPath(plugX, balY, plugW * 0.9, balH, 2), closed: true });
  return paths;
}`,
  },

  // 14. FPV Camera & 3-Axis Gimbal Pod
  {
    id: 'drone-fpv-camera-gimbal',
    name: 'Drone Part: FPV Camera & Gimbal Pod',
    category: 'Drone Parts & Frames',
    description:
      'Micro 19mm / O3 Digital HD FPV camera and 3-axis stabilized gimbal yoke with multi-element wide-angle glass lens and M2 tilt brackets.',
    iconName: 'Video',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle outer gimbal yoke arms',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'HD FPV Camera' },
      { key: 'lensRatio', label: 'Lens Barrel Radius', type: 'number', min: 0.2, max: 0.44, step: 0.01, defaultValue: 0.32 },
      { key: 'showGimbalYoke', label: 'Show Gimbal Yoke Bracket', type: 'boolean', defaultValue: true },
    ],
    defaultParams: {
      label: 'HD FPV Camera',
      lensRatio: 0.32,
      showGimbalYoke: true,
    },
    jsSourceCode: `// Drone Part: FPV Camera & Gimbal Pod (.jsf)
function getControlPoints(width, height, params, helpers) {
  const lr = helpers.clamp(Number(params.lensRatio) || 0.32, 0.2, 0.44);
  return [
    { id: 'lensRatio', label: \`Lens: \${Math.round(lr * 100)}%\`, x: width * (0.5 + lr * 0.5), y: height * 0.54, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'lensRatio') {
    const lr = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.2, 0.44);
    return { ...params, lensRatio: Number(lr.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, showGimbalYoke: !params.showGimbalYoke };
}

function buildPaths(width, height, params, helpers) {
  const lr = helpers.clamp(Number(params.lensRatio) || 0.32, 0.2, 0.44);
  const yoke = params.showGimbalYoke !== false;
  const cx = width / 2;
  const cy = height * 0.54;
  const bodyW = width * 0.64;
  const bodyH = height * 0.64;
  const lensR = Math.min(width, height) * lr * 0.68;

  const paths = [
    { nodes: helpers.rectPath(cx - bodyW / 2, cy - bodyH / 2, bodyW, bodyH, 8), closed: true },
    { nodes: helpers.ellipsePath(cx, cy, lensR, lensR), closed: true },
    { nodes: helpers.ellipsePath(cx, cy, lensR * 0.62, lensR * 0.62), closed: true },
    { nodes: helpers.ellipsePath(cx - lensR * 0.22, cy - lensR * 0.22, lensR * 0.16, lensR * 0.16), closed: true }
  ];

  if (yoke) {
    // Top vibration plate + U-shaped gimbal bracket arms
    paths.push({ nodes: helpers.rectPath(width * 0.18, 0, width * 0.64, height * 0.1, 3), closed: true });
    paths.push({
      nodes: helpers.polygonPath([
        { x: width * 0.1, y: height * 0.1 },
        { x: width * 0.1, y: cy },
        { x: cx - bodyW / 2, y: cy }
      ], false),
      closed: false
    });
    paths.push({
      nodes: helpers.polygonPath([
        { x: width * 0.9, y: height * 0.1 },
        { x: width * 0.9, y: cy },
        { x: cx + bodyW / 2, y: cy }
      ], false),
      closed: false
    });
  }
  return paths;
}`,
  },

  // 15. Digital HD VTX & Pagoda / Lollipop Antenna
  {
    id: 'drone-vtx-antenna',
    name: 'Drone Part: HD VTX & Antenna',
    category: 'Drone Parts & Frames',
    description:
      '5.8GHz Digital HD / Analog Video Transmitter module with CNC aluminum heatsink fins, U.FL/MMCX connector, and circularly polarized Pagoda antenna.',
    iconName: 'Radio',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle heatsink fin count (3-7 fins)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '5.8GHz HD VTX' },
      { key: 'stalkRatio', label: 'Antenna Coax Stalk Ratio', type: 'number', min: 0.2, max: 0.48, step: 0.01, defaultValue: 0.34 },
      { key: 'fins', label: 'CNC Heatsink Fins', type: 'number', min: 3, max: 7, step: 1, defaultValue: 5 },
    ],
    defaultParams: {
      label: '5.8GHz HD VTX',
      stalkRatio: 0.34,
      fins: 5,
    },
    jsSourceCode: `// Drone Part: HD VTX & Antenna (.jsf)
function getControlPoints(width, height, params, helpers) {
  const sr = helpers.clamp(Number(params.stalkRatio) || 0.34, 0.2, 0.48);
  const fins = Math.round(helpers.clamp(Number(params.fins) || 5, 3, 7));
  return [
    { id: 'stalkRatio', label: \`Antenna: \${Math.round(sr * 100)}%\`, x: width * 0.5, y: height * sr, cursor: 'ns-resize' },
    { id: 'fins', label: \`Fins: \${fins}\`, x: helpers.lerp(width * 0.25, width * 0.75, (fins - 3) / 4), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'stalkRatio') {
    return { ...params, stalkRatio: Number(helpers.clamp(localY / Math.max(1, height), 0.2, 0.48).toFixed(2)) };
  }
  if (id === 'fins') {
    const t = helpers.clamp((localX - width * 0.25) / (width * 0.5), 0, 1);
    return { ...params, fins: Math.round(3 + t * 4) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.fins) || 5);
  return { ...params, fins: cur >= 7 ? 3 : cur + 1 };
}

function buildPaths(width, height, params, helpers) {
  const sr = helpers.clamp(Number(params.stalkRatio) || 0.34, 0.2, 0.48);
  const fins = Math.round(helpers.clamp(Number(params.fins) || 5, 3, 7));
  const cx = width / 2;
  const bodyY = height * sr;
  const bodyH = height - bodyY;
  const bodyW = width * 0.76;
  const lobeR = Math.min(width * 0.2, bodyY * 0.36);

  const paths = [
    // Antenna radome lobe + coax stalk
    { nodes: helpers.ellipsePath(cx, lobeR + 2, lobeR * 1.25, lobeR), closed: true },
    { nodes: helpers.rectPath(cx - 3, lobeR * 2, 6, Math.max(4, bodyY - lobeR * 2), 2), closed: true },
    // VTX CNC Heatsink Case
    { nodes: helpers.rectPath(cx - bodyW / 2, bodyY, bodyW, bodyH, 6), closed: true }
  ];

  const pad = bodyW * 0.12;
  const finSpan = bodyW - pad * 2;
  for (let i = 0; i < fins; i++) {
    const fx = cx - finSpan / 2 + (i * finSpan) / Math.max(1, fins - 1);
    paths.push({
      nodes: helpers.polygonPath([
        { x: fx, y: bodyY + bodyH * 0.14 },
        { x: fx, y: bodyY + bodyH * 0.86 }
      ], false),
      closed: false
    });
  }
  return paths;
}`,
  },

  // 16. M10 GPS + Magnetometer Compass Puck Module
  {
    id: 'drone-gps-compass-puck',
    name: 'Drone Part: M10 GPS + Compass Module',
    category: 'Drone Parts & Frames',
    description:
      'M10 GNSS / GPS & QMC5883L Magnetometer module with ceramic patch antenna, heading arrow indicator, and folding mast pedestal.',
    iconName: 'Navigation',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle between Octagonal Puck and Square Ceramic Patch housing',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'M10 GPS + Mag' },
      { key: 'patchRatio', label: 'Ceramic Patch Size', type: 'number', min: 0.36, max: 0.68, step: 0.01, defaultValue: 0.52 },
      { key: 'puckHousing', label: 'Octagonal Mast Puck', type: 'boolean', defaultValue: true },
    ],
    defaultParams: {
      label: 'M10 GPS + Mag',
      patchRatio: 0.52,
      puckHousing: true,
    },
    jsSourceCode: `// Drone Part: M10 GPS + Compass Module (.jsf)
function getControlPoints(width, height, params, helpers) {
  const pr = helpers.clamp(Number(params.patchRatio) || 0.52, 0.36, 0.68);
  return [
    { id: 'patchRatio', label: \`Patch: \${Math.round(pr * 100)}%\`, x: width * (0.5 + pr * 0.5), y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'patchRatio') {
    const pr = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.36, 0.68);
    return { ...params, patchRatio: Number(pr.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, puckHousing: !params.puckHousing };
}

function buildPaths(width, height, params, helpers) {
  const pr = helpers.clamp(Number(params.patchRatio) || 0.52, 0.36, 0.68);
  const puck = params.puckHousing !== false;
  const cx = width / 2;
  const cy = height / 2;
  const pw = width * pr;
  const ph = height * pr;
  const paths = [];

  if (puck) {
    const octPts = [];
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + Math.PI / 8;
      octPts.push({ x: cx + Math.cos(a) * width * 0.48, y: cy + Math.sin(a) * height * 0.48 });
    }
    paths.push({ nodes: helpers.polygonPath(octPts), closed: true });
  } else {
    paths.push({ nodes: helpers.rectPath(4, 4, width - 8, height - 8, 8), closed: true });
  }

  // Ceramic patch antenna + center tuning feed pin + forward heading arrow
  paths.push({ nodes: helpers.rectPath(cx - pw / 2, cy - ph / 2, pw, ph, 4), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, cy, Math.min(pw, ph) * 0.12, Math.min(pw, ph) * 0.12), closed: true });
  const ah = height * 0.12;
  paths.push({
    nodes: helpers.polygonPath([
      { x: cx, y: height * 0.08 },
      { x: cx + ah * 0.7, y: height * 0.08 + ah },
      { x: cx - ah * 0.7, y: height * 0.08 + ah }
    ]),
    closed: true
  });
  return paths;
}`,
  },

  // 17. ELRS / Crossfire RC Receiver & Immortal-T Antenna
  {
    id: 'drone-rc-receiver-elrs',
    name: 'Drone Part: ELRS Receiver & T-Antenna',
    category: 'Drone Parts & Frames',
    description:
      'ExpressLRS 2.4GHz / 900MHz nano RC receiver PCB coupled via U.FL coaxial feed to a wide-span Immortal-T dipole antenna.',
    iconName: 'Wifi',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle T-antenna dipole span width',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'ELRS 2.4GHz RX' },
      { key: 'dipoleSpanRatio', label: 'Immortal-T Dipole Span', type: 'number', min: 0.5, max: 1, step: 0.02, defaultValue: 0.92 },
      { key: 'rxBoxRatio', label: 'Nano RX PCB Size', type: 'number', min: 0.24, max: 0.52, step: 0.01, defaultValue: 0.36 },
    ],
    defaultParams: {
      label: 'ELRS 2.4GHz RX',
      dipoleSpanRatio: 0.92,
      rxBoxRatio: 0.36,
    },
    jsSourceCode: `// Drone Part: ELRS Receiver & T-Antenna (.jsf)
function getControlPoints(width, height, params, helpers) {
  const ds = helpers.clamp(Number(params.dipoleSpanRatio) || 0.92, 0.5, 1);
  const rb = helpers.clamp(Number(params.rxBoxRatio) || 0.36, 0.24, 0.52);
  return [
    { id: 'dipoleSpanRatio', label: \`T-Span: \${Math.round(ds * 100)}%\`, x: width * (0.5 + ds * 0.5), y: height * 0.12, cursor: 'ew-resize' },
    { id: 'rxBoxRatio', label: \`RX PCB: \${Math.round(rb * 100)}%\`, x: width * (0.5 + rb * 0.5), y: height * 0.72, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'dipoleSpanRatio') {
    const ds = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.5, 1);
    return { ...params, dipoleSpanRatio: Number(ds.toFixed(2)) };
  }
  if (id === 'rxBoxRatio') {
    const rb = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.24, 0.52);
    return { ...params, rxBoxRatio: Number(rb.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Number(params.dipoleSpanRatio) || 0.92;
  return { ...params, dipoleSpanRatio: cur > 0.75 ? 0.58 : 0.94 };
}

function buildPaths(width, height, params, helpers) {
  const ds = helpers.clamp(Number(params.dipoleSpanRatio) || 0.92, 0.5, 1) * width;
  const rb = helpers.clamp(Number(params.rxBoxRatio) || 0.36, 0.24, 0.52);
  const cx = width / 2;
  const barH = Math.max(8, height * 0.1);
  const barY = height * 0.08;
  const rxW = width * rb;
  const rxH = height * 0.42;
  const rxY = height - rxH - 4;

  return [
    // Immortal-T horizontal dipole bar + end caps
    { nodes: helpers.rectPath(cx - ds / 2, barY, ds, barH, barH / 2), closed: true },
    // Center T-junction hub + coax cable to U.FL
    { nodes: helpers.rectPath(cx - 7, barY - 2, 14, barH + 8, 3), closed: true },
    { nodes: helpers.polygonPath([{ x: cx, y: barY + barH + 6 }, { x: cx, y: rxY }], false), closed: false },
    // Nano Receiver PCB + SX1280 RF chip + 4 CRSF solder pads (RX/TX/5V/GND)
    { nodes: helpers.rectPath(cx - rxW / 2, rxY, rxW, rxH, 4), closed: true },
    { nodes: helpers.rectPath(cx - rxW * 0.26, rxY + rxH * 0.22, rxW * 0.52, rxH * 0.4, 2), closed: true }
  ];
}`,
  },

  // 18. Optical Flow + LiDAR Rangefinder Sensor
  {
    id: 'drone-lidar-optical-flow',
    name: 'Drone Part: Optical Flow + LiDAR Sensor',
    category: 'Drone Parts & Frames',
    description:
      'Downward-facing GPS-denied Optical Flow camera + Time-of-Flight (ToF) LiDAR laser altimeter dual-lens module.',
    iconName: 'Eye',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle mounting flange ears',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'OptFlow + LiDAR' },
      { key: 'lensSpacing', label: 'Dual Lens Spacing', type: 'number', min: 0.22, max: 0.52, step: 0.01, defaultValue: 0.36 },
      { key: 'mountingEars', label: 'Show M2 Mounting Ears', type: 'boolean', defaultValue: true },
    ],
    defaultParams: {
      label: 'OptFlow + LiDAR',
      lensSpacing: 0.36,
      mountingEars: true,
    },
    jsSourceCode: `// Drone Part: Optical Flow + LiDAR Sensor (.jsf)
function getControlPoints(width, height, params, helpers) {
  const ls = helpers.clamp(Number(params.lensSpacing) || 0.36, 0.22, 0.52);
  return [
    { id: 'lensSpacing', label: \`Lens Gap: \${Math.round(ls * 100)}%\`, x: width * (0.5 + ls * 0.5), y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'lensSpacing') {
    const ls = helpers.clamp((Math.abs(localX - width * 0.5) * 2) / Math.max(1, width), 0.22, 0.52);
    return { ...params, lensSpacing: Number(ls.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, mountingEars: !params.mountingEars };
}

function buildPaths(width, height, params, helpers) {
  const ls = helpers.clamp(Number(params.lensSpacing) || 0.36, 0.22, 0.52);
  const ears = params.mountingEars !== false;
  const cx = width / 2;
  const cy = height / 2;
  const earW = ears ? width * 0.1 : 0;
  const bodyX = earW;
  const bodyW = width - earW * 2;
  const bodyH = height * 0.72;
  const bodyY = (height - bodyH) / 2;
  const r1 = Math.min(bodyW * 0.2, bodyH * 0.32);
  const r2 = r1 * 0.78;
  const lx1 = cx - (bodyW * ls) / 2;
  const lx2 = cx + (bodyW * ls) / 2;

  const paths = [
    { nodes: helpers.rectPath(bodyX, bodyY, bodyW, bodyH, 8), closed: true },
    // LiDAR Emitter/Receiver Lens
    { nodes: helpers.ellipsePath(lx1, cy, r1, r1), closed: true },
    { nodes: helpers.ellipsePath(lx1, cy, r1 * 0.45, r1 * 0.45), closed: true },
    // Optical Flow Camera Aperture
    { nodes: helpers.ellipsePath(lx2, cy, r2, r2), closed: true },
    { nodes: helpers.rectPath(lx2 - r2 * 0.45, cy - r2 * 0.45, r2 * 0.9, r2 * 0.9, 2), closed: true }
  ];

  if (ears) {
    const eh = bodyH * 0.42;
    paths.push({ nodes: helpers.rectPath(0, cy - eh / 2, earW, eh, 4), closed: true });
    paths.push({ nodes: helpers.rectPath(width - earW, cy - eh / 2, earW, eh, 4), closed: true });
    paths.push({ nodes: helpers.ellipsePath(earW * 0.5, cy, 3, 3), closed: true });
    paths.push({ nodes: helpers.ellipsePath(width - earW * 0.5, cy, 3, 3), closed: true });
  }
  return paths;
}`,
  },

  // ─── 208 EXPANDED DRONE PARTS & FRAMES AUTOSHAPES (#19–#226) ───
  {
    id: 'drone-stretch-x-racing',
    name: 'Drone Frame: Stretch-X Racing Quad',
    category: 'Drone Parts & Frames',
    description: 'Forward-elongated Stretch-X carbon racing quadcopter frame with narrow central pod and 4 motor pads.',
    iconName: 'Crosshair',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust longitudinal stretch or center pod width (%); click in Preview Mode to cycle center pod width (%).',
    defaultParams: {
      label: 'Stretch-X Frame',
      stretchRatio: 0.78,
      podWidth: 0.24,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Stretch-X Frame' },
      { key: 'stretchRatio', label: 'Longitudinal Stretch', type: 'number', min: 0.55, max: 0.92, step: 0.01, defaultValue: 0.78 },
      { key: 'podWidth', label: 'Center Pod Width (%)', type: 'number', min: 0.16, max: 0.34, step: 0.01, defaultValue: 0.24 },
    ],
    jsSourceCode: `// Drone Frame: Stretch-X Racing Quad (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2;
      const stretch = clamp(Number(params.stretchRatio) || 0.78, 0.55, 0.92);
      const propR = clamp(Number(params.podWidth) || 0.24, 0.16, 0.34) * r;
      const bodyW = width * 0.18, bodyH = height * 0.42;
      const paths = [];
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx, sy]) => {
        const mx = cx + sx * (width * 0.31), my = cy + sy * (height * 0.48 * stretch);
        paths.push({ d: line(cx + sx * bodyW * 0.3, cy + sy * bodyH * 0.22, mx, my), strokeWidth: 4.2 });
        paths.push({ d: circle(mx, my, propR), closed: true });
        paths.push({ d: circle(mx, my, propR * 0.25), closed: true });
        paths.push({ d: line(mx - propR * 0.72, my - propR * 0.35, mx + propR * 0.72, my + propR * 0.35), strokeWidth: 1.5 });
      });
      paths.push({ d: roundRect(cx - bodyW / 2, cy - bodyH / 2, bodyW, bodyH, 8), closed: true, fill: true });
      paths.push({ d: rect(cx - bodyW * 0.32, cy - bodyW * 0.32, bodyW * 0.64, bodyW * 0.64), closed: true });
      paths.push({ d: polygon([[cx, cy - bodyH / 2 - 7], [cx - 6, cy - bodyH / 2 + 2], [cx + 6, cy - bodyH / 2 + 2]]), closed: true });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.stretchRatio !== undefined ? Number(params.stretchRatio) : 0.78;
  const v2 = params.podWidth !== undefined ? Number(params.podWidth) : 0.24;
  const p1Norm = (clamp(v1, 0.55, 0.92) - 0.55) / Math.max(0.0001, 0.37);
  const p2Norm = (clamp(v2, 0.16, 0.34) - 0.16) / Math.max(0.0001, 0.18);
  return [
    { id: 'stretchRatio', label: 'Longitudinal Stretch', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'podWidth', label: 'Center Pod Width (%)', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'stretchRatio') {
    return { ...params, stretchRatio: Number(clamp(0.55 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.37, 0.55, 0.92).toFixed(2)) };
  }
  if (controlId === 'podWidth') {
    return { ...params, podWidth: Number(clamp(0.16 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.18, 0.16, 0.34).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.podWidth !== undefined ? Number(params.podWidth) : 0.24;
  const next = cur + 0.06 > 0.34 + 0.001 ? 0.16 : Number((cur + 0.06).toFixed(2));
  return { ...params, podWidth: next };
}`,
  },

  {
    id: 'drone-wide-x-freestyle',
    name: 'Drone Frame: Wide-X Freestyle Quad',
    category: 'Drone Parts & Frames',
    description: 'Lateral wide-stance freestyle quadcopter frame with elongated top battery deck and 4 motor mounts.',
    iconName: 'Crosshair',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust lateral arm span or top deck strap slots; click in Preview Mode to cycle top deck strap slots.',
    defaultParams: {
      label: 'Wide-X Freestyle',
      spanRatio: 0.82,
      slots: 0.48,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Wide-X Freestyle' },
      { key: 'spanRatio', label: 'Lateral Arm Span', type: 'number', min: 0.6, max: 0.94, step: 0.01, defaultValue: 0.82 },
      { key: 'slots', label: 'Top Deck Strap Slots', type: 'number', min: 0.32, max: 0.68, step: 0.01, defaultValue: 0.48 },
    ],
    jsSourceCode: `// Drone Frame: Wide-X Freestyle Quad (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2;
      const wide = clamp(Number(params.spanRatio) || 0.82, 0.6, 0.94);
      const busL = clamp(Number(params.slots) || 0.48, 0.32, 0.68) * height;
      const propR = r * 0.23, bodyW = width * 0.22;
      const paths = [];
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx, sy]) => {
        const mx = cx + sx * (width * 0.48 * wide), my = cy + sy * (height * 0.27);
        paths.push({ d: line(cx + sx * bodyW * 0.35, cy + sy * busL * 0.24, mx, my), strokeWidth: 4 });
        paths.push({ d: circle(mx, my, propR), closed: true });
        paths.push({ d: circle(mx, my, 4.5), closed: true, fill: true });
      });
      paths.push({ d: roundRect(cx - bodyW / 2, cy - busL / 2, bodyW, busL, 7), closed: true, fill: true });
      paths.push({ d: rect(cx - bodyW * 0.34, cy - busL * 0.38, bodyW * 0.68, busL * 0.28), closed: true });
      paths.push({ d: rect(cx - bodyW * 0.28, cy + busL * 0.06, bodyW * 0.56, busL * 0.3), closed: true });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.spanRatio !== undefined ? Number(params.spanRatio) : 0.82;
  const v2 = params.slots !== undefined ? Number(params.slots) : 0.48;
  const p1Norm = (clamp(v1, 0.6, 0.94) - 0.6) / Math.max(0.0001, 0.34);
  const p2Norm = (clamp(v2, 0.32, 0.68) - 0.32) / Math.max(0.0001, 0.36);
  return [
    { id: 'spanRatio', label: 'Lateral Arm Span', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'slots', label: 'Top Deck Strap Slots', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'spanRatio') {
    return { ...params, spanRatio: Number(clamp(0.6 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.34, 0.6, 0.94).toFixed(2)) };
  }
  if (controlId === 'slots') {
    return { ...params, slots: Number(clamp(0.32 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.36, 0.32, 0.68).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.slots !== undefined ? Number(params.slots) : 0.48;
  const next = cur + 0.12 > 0.68 + 0.001 ? 0.32 : Number((cur + 0.12).toFixed(2));
  return { ...params, slots: next };
}`,
  },

  {
    id: 'drone-true-x-symmetrical',
    name: 'Drone Frame: True-X 90° Symmetrical',
    category: 'Drone Parts & Frames',
    description: 'Exact 90-degree diagonal True-X quadcopter chassis with octagonal center hub and dual FC stack patterns.',
    iconName: 'Crosshair',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust octagon hub size or arm width (px); click in Preview Mode to cycle arm width (px).',
    defaultParams: {
      label: 'True-X 90° Frame',
      hubScale: 0.36,
      armThick: 0.24,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'True-X 90° Frame' },
      { key: 'hubScale', label: 'Octagon Hub Size', type: 'number', min: 0.25, max: 0.45, step: 0.01, defaultValue: 0.36 },
      { key: 'armThick', label: 'Arm Width (px)', type: 'number', min: 0.16, max: 0.34, step: 0.01, defaultValue: 0.24 },
    ],
    jsSourceCode: `// Drone Frame: True-X 90° Symmetrical (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2;
      const span = clamp(Number(params.hubScale) || 0.36, 0.25, 0.45) * r * 2;
      const deckW = clamp(Number(params.armThick) || 0.24, 0.16, 0.34) * r * 2;
      const propR = r * 0.24;
      const paths = [
        { d: line(cx - span, cy - span, cx + span, cy + span), strokeWidth: 4.5 },
        { d: line(cx + span, cy - span, cx - span, cy + span), strokeWidth: 4.5 },
        { d: roundRect(cx - deckW / 2, cy - deckW * 0.65, deckW, deckW * 1.3, 6), closed: true, fill: true },
        { d: rect(cx - deckW * 0.3, cy - deckW * 0.3, deckW * 0.6, deckW * 0.6), closed: true },
      ];
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx, sy]) => {
        const mx = cx + sx * span, my = cy + sy * span;
        paths.push({ d: circle(mx, my, propR), closed: true });
        paths.push({ d: circle(mx, my, 4.5), closed: true });
      });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.hubScale !== undefined ? Number(params.hubScale) : 0.36;
  const v2 = params.armThick !== undefined ? Number(params.armThick) : 0.24;
  const p1Norm = (clamp(v1, 0.25, 0.45) - 0.25) / Math.max(0.0001, 0.2);
  const p2Norm = (clamp(v2, 0.16, 0.34) - 0.16) / Math.max(0.0001, 0.18);
  return [
    { id: 'hubScale', label: 'Octagon Hub Size', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'armThick', label: 'Arm Width (px)', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'hubScale') {
    return { ...params, hubScale: Number(clamp(0.25 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.2, 0.25, 0.45).toFixed(2)) };
  }
  if (controlId === 'armThick') {
    return { ...params, armThick: Number(clamp(0.16 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.18, 0.16, 0.34).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.armThick !== undefined ? Number(params.armThick) : 0.24;
  const next = cur + 0.06 > 0.34 + 0.001 ? 0.16 : Number((cur + 0.06).toFixed(2));
  return { ...params, armThick: next };
}`,
  },

  {
    id: 'drone-squished-x-cinema',
    name: 'Drone Frame: Squished-X Cinema Frame',
    category: 'Drone Parts & Frames',
    description: 'Compressed arm-angle cinema quad frame with forward clean-plate vibration-isolated camera tongue.',
    iconName: 'Video',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust front camera tongue or isolation balls; click in Preview Mode to cycle isolation balls.',
    defaultParams: {
      label: 'Squished-X Cine',
      tongueLen: 0.76,
      dampers: 0.18,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Squished-X Cine' },
      { key: 'tongueLen', label: 'Front Camera Tongue', type: 'number', min: 0.55, max: 0.9, step: 0.01, defaultValue: 0.76 },
      { key: 'dampers', label: 'Isolation Balls', type: 'number', min: 0.12, max: 0.28, step: 0.01, defaultValue: 0.18 },
    ],
    jsSourceCode: `// Drone Frame: Squished-X Cinema Frame (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2;
      const swept = clamp(Number(params.tongueLen) || 0.76, 0.55, 0.9);
      const cageW = clamp(Number(params.dampers) || 0.18, 0.12, 0.28) * width;
      const propR = r * 0.22;
      const paths = [];
      const coords = [
        [cx - width * 0.44 * swept, cy - height * 0.18],
        [cx + width * 0.44 * swept, cy - height * 0.18],
        [cx + width * 0.33, cy + height * 0.33],
        [cx - width * 0.33, cy + height * 0.33],
      ];
      coords.forEach(([mx, my], idx) => {
        paths.push({ d: line(cx, idx < 2 ? cy - height * 0.08 : cy + height * 0.1, mx, my), strokeWidth: 4 });
        paths.push({ d: circle(mx, my, propR), closed: true });
        paths.push({ d: circle(mx, my, 4), closed: true, fill: true });
      });
      paths.push({ d: roundRect(cx - cageW * 0.65, cy - height * 0.26, cageW * 1.3, height * 0.52, 7), closed: true, fill: true });
      paths.push({ d: polygon([[cx - cageW * 0.5, cy - height * 0.26], [cx - cageW * 0.75, cy - height * 0.38], [cx + cageW * 0.75, cy - height * 0.38], [cx + cageW * 0.5, cy - height * 0.26]]), closed: true });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.tongueLen !== undefined ? Number(params.tongueLen) : 0.76;
  const v2 = params.dampers !== undefined ? Number(params.dampers) : 0.18;
  const p1Norm = (clamp(v1, 0.55, 0.9) - 0.55) / Math.max(0.0001, 0.35);
  const p2Norm = (clamp(v2, 0.12, 0.28) - 0.12) / Math.max(0.0001, 0.16);
  return [
    { id: 'tongueLen', label: 'Front Camera Tongue', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'dampers', label: 'Isolation Balls', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'tongueLen') {
    return { ...params, tongueLen: Number(clamp(0.55 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.35, 0.55, 0.9).toFixed(2)) };
  }
  if (controlId === 'dampers') {
    return { ...params, dampers: Number(clamp(0.12 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.16, 0.12, 0.28).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.dampers !== undefined ? Number(params.dampers) : 0.18;
  const next = cur + 0.05 > 0.28 + 0.001 ? 0.12 : Number((cur + 0.05).toFixed(2));
  return { ...params, dampers: next };
}`,
  },

  {
    id: 'drone-h-frame-classic',
    name: 'Drone Frame: H-Frame Heavy Utility',
    category: 'Drone Parts & Frames',
    description: 'Classic H-configuration utility drone frame with long central spine and perpendicular front/rear crossbeams.',
    iconName: 'Columns',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust crossbeam y spread or center spine width; click in Preview Mode to cycle center spine width.',
    defaultParams: {
      label: 'H-Frame Utility',
      beamSpread: 0.72,
      spineWidth: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'H-Frame Utility' },
      { key: 'beamSpread', label: 'Crossbeam Y Spread', type: 'number', min: 0.5, max: 0.88, step: 0.01, defaultValue: 0.72 },
      { key: 'spineWidth', label: 'Center Spine Width', type: 'number', min: 2, max: 5, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Frame: H-Frame Heavy Utility (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2;
      const beamSpan = clamp(Number(params.beamSpread) || 0.72, 0.5, 0.88) * height;
      const bays = clamp(Math.round(Number(params.spineWidth) || 4), 2, 5);
      const busW = width * 0.2, beamW = width * 0.72, propR = r * 0.21;
      const paths = [
        { d: roundRect(cx - beamW / 2, cy - beamSpan / 2 - 5, beamW, 10, 4), closed: true, fill: true },
        { d: roundRect(cx - beamW / 2, cy + beamSpan / 2 - 5, beamW, 10, 4), closed: true, fill: true },
        { d: roundRect(cx - busW / 2, cy - beamSpan * 0.56, busW, beamSpan * 1.12, 6), closed: true, fill: true },
      ];
      for (let i = 0; i < bays; i++) {
        const by = cy - beamSpan * 0.42 + (i * beamSpan * 0.84) / Math.max(1, bays - 1) - 5;
        paths.push({ d: rect(cx - busW * 0.34, by, busW * 0.68, 10), closed: true });
      }
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx, sy]) => {
        const mx = cx + sx * (beamW / 2), my = cy + sy * (beamSpan / 2);
        paths.push({ d: circle(mx, my, propR), closed: true });
        paths.push({ d: circle(mx, my, 4), closed: true });
      });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.beamSpread !== undefined ? Number(params.beamSpread) : 0.72;
  const v2 = params.spineWidth !== undefined ? Number(params.spineWidth) : 4;
  const p1Norm = (clamp(v1, 0.5, 0.88) - 0.5) / Math.max(0.0001, 0.38);
  const p2Norm = (clamp(v2, 2, 5) - 2) / Math.max(0.0001, 3);
  return [
    { id: 'beamSpread', label: 'Crossbeam Y Spread', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'spineWidth', label: 'Center Spine Width', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'beamSpread') {
    return { ...params, beamSpread: Number(clamp(0.5 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.38, 0.5, 0.88).toFixed(2)) };
  }
  if (controlId === 'spineWidth') {
    return { ...params, spineWidth: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 2, 5)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.spineWidth !== undefined ? Math.round(Number(params.spineWidth)) : 4;
  return { ...params, spineWidth: ((cur - 2 + 1) % 4) + 2 };
}`,
  },

  {
    id: 'drone-plus-quad-configuration',
    name: 'Drone Frame: Plus (+) Quad Configuration',
    category: 'Drone Parts & Frames',
    description: 'Cardinal North/East/South/West orthogonal 4-arm cross airframe with diamond central avionics bay.',
    iconName: 'Plus',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust center diamond bay or show prop discs; click in Preview Mode to cycle show prop discs.',
    defaultParams: {
      label: 'Plus (+) Quad',
      bayScale: 0.37,
      propRings: 0.22,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Plus (+) Quad' },
      { key: 'bayScale', label: 'Center Diamond Bay', type: 'number', min: 0.26, max: 0.44, step: 0.01, defaultValue: 0.37 },
      { key: 'propRings', label: 'Show Prop Discs', type: 'number', min: 0.14, max: 0.32, step: 0.01, defaultValue: 0.22 },
    ],
    jsSourceCode: `// Drone Frame: Plus (+) Quad Configuration (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2;
      const reach = clamp(Number(params.bayScale) || 0.37, 0.26, 0.44) * r * 2;
      const hubS = clamp(Number(params.propRings) || 0.22, 0.14, 0.32) * r * 2;
      const propR = r * 0.22;
      const paths = [
        { d: line(cx, cy - reach, cx, cy + reach), strokeWidth: 4.5 },
        { d: line(cx - reach, cy, cx + reach, cy), strokeWidth: 4.5 },
        { d: polygon([[cx, cy - hubS * 0.7], [cx + hubS * 0.7, cy], [cx, cy + hubS * 0.7], [cx - hubS * 0.7, cy]]), closed: true, fill: true },
      ];
      [[0,-1],[1,0],[0,1],[-1,0]].forEach(([sx, sy]) => {
        const mx = cx + sx * reach, my = cy + sy * reach;
        paths.push({ d: circle(mx, my, propR), closed: true });
        paths.push({ d: circle(mx, my, 4.5), closed: true, fill: true });
      });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.bayScale !== undefined ? Number(params.bayScale) : 0.37;
  const v2 = params.propRings !== undefined ? Number(params.propRings) : 0.22;
  const p1Norm = (clamp(v1, 0.26, 0.44) - 0.26) / Math.max(0.0001, 0.18);
  const p2Norm = (clamp(v2, 0.14, 0.32) - 0.14) / Math.max(0.0001, 0.18);
  return [
    { id: 'bayScale', label: 'Center Diamond Bay', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'propRings', label: 'Show Prop Discs', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'bayScale') {
    return { ...params, bayScale: Number(clamp(0.26 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.18, 0.26, 0.44).toFixed(2)) };
  }
  if (controlId === 'propRings') {
    return { ...params, propRings: Number(clamp(0.14 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.18, 0.14, 0.32).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.propRings !== undefined ? Number(params.propRings) : 0.22;
  const next = cur + 0.06 > 0.32 + 0.001 ? 0.14 : Number((cur + 0.06).toFixed(2));
  return { ...params, propRings: next };
}`,
  },

  {
    id: 'drone-tricopter-y3-tail',
    name: 'Drone Frame: Y3 Tricopter with Servo Tail',
    category: 'Drone Parts & Frames',
    description: '3-rotor Y3 airframe with swept front arms and tilting rear tail yaw servo mechanism.',
    iconName: 'Navigation',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust front arm y sweep or tail tilt offset; click in Preview Mode to cycle tail tilt offset.',
    defaultParams: {
      label: 'Y3 Tricopter',
      frontSweep: 0.74,
      tailTilt: 0.18,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Y3 Tricopter' },
      { key: 'frontSweep', label: 'Front Arm Y Sweep', type: 'number', min: 0.5, max: 0.88, step: 0.01, defaultValue: 0.74 },
      { key: 'tailTilt', label: 'Tail Tilt Offset', type: 'number', min: 0.05, max: 0.35, step: 0.01, defaultValue: 0.18 },
    ],
    jsSourceCode: `// Drone Frame: Y3 Tricopter with Servo Tail (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height * 0.48, r = Math.min(width, height) / 2;
      const spread = clamp(Number(params.frontSweep) || 0.74, 0.5, 0.88) * (width / 2);
      const yawTilt = clamp(Number(params.tailTilt) || 0.18, 0.05, 0.35);
      const fY = height * 0.26, tailY = height * 0.82, propR = r * 0.23;
      const paths = [
        { d: line(cx, cy, cx - spread, fY), strokeWidth: 4.2 },
        { d: line(cx, cy, cx + spread, fY), strokeWidth: 4.2 },
        { d: line(cx, cy, cx, tailY), strokeWidth: 4.2 },
        { d: polygon([[cx, cy - 18], [cx + 16, cy + 8], [cx - 16, cy + 8]]), closed: true, fill: true },
        { d: circle(cx - spread, fY, propR), closed: true },
        { d: circle(cx + spread, fY, propR), closed: true },
        { d: ellipse(cx + yawTilt * 14, tailY, propR * (1 - yawTilt * 0.35), propR), closed: true },
        { d: rect(cx - 10, tailY - 18, 20, 12), closed: true },
      ];
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.frontSweep !== undefined ? Number(params.frontSweep) : 0.74;
  const v2 = params.tailTilt !== undefined ? Number(params.tailTilt) : 0.18;
  const p1Norm = (clamp(v1, 0.5, 0.88) - 0.5) / Math.max(0.0001, 0.38);
  const p2Norm = (clamp(v2, 0.05, 0.35) - 0.05) / Math.max(0.0001, 0.3);
  return [
    { id: 'frontSweep', label: 'Front Arm Y Sweep', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'tailTilt', label: 'Tail Tilt Offset', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'frontSweep') {
    return { ...params, frontSweep: Number(clamp(0.5 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.38, 0.5, 0.88).toFixed(2)) };
  }
  if (controlId === 'tailTilt') {
    return { ...params, tailTilt: Number(clamp(0.05 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.3, 0.05, 0.35).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.tailTilt !== undefined ? Number(params.tailTilt) : 0.18;
  const next = cur + 0.1 > 0.35 + 0.001 ? 0.05 : Number((cur + 0.1).toFixed(2));
  return { ...params, tailTilt: next };
}`,
  },

  {
    id: 'drone-y6-coaxial-frame',
    name: 'Drone Frame: Y6 Coaxial 6-Motor Airframe',
    category: 'Drone Parts & Frames',
    description: 'Heavy-wind Y6 3-boom airframe with counter-rotating upper and lower coaxial motor mounts per boom tip.',
    iconName: 'Navigation',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust center triangle hub or coaxial ring offset; click in Preview Mode to cycle coaxial ring offset.',
    defaultParams: {
      label: 'Y6 Coaxial Frame',
      hubRadius: 0.36,
      coaxOffset: 7,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Y6 Coaxial Frame' },
      { key: 'hubRadius', label: 'Center Triangle Hub', type: 'number', min: 0.25, max: 0.43, step: 0.01, defaultValue: 0.36 },
      { key: 'coaxOffset', label: 'Coaxial Ring Offset', type: 'number', min: 3, max: 14, step: 1, defaultValue: 7 },
    ],
    jsSourceCode: `// Drone Frame: Y6 Coaxial 6-Motor Airframe (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height * 0.48, r = Math.min(width, height) / 2;
      const armR = clamp(Number(params.hubRadius) || 0.36, 0.25, 0.43) * r * 2;
      const coaxOff = clamp(Number(params.coaxOffset) || 7, 3, 14);
      const propR = r * 0.22;
      const angles = [-Math.PI * 0.78, -Math.PI * 0.22, Math.PI * 0.5];
      const paths = [{ d: polygon([[cx, cy - 20], [cx + 18, cy + 10], [cx - 18, cy + 10]]), closed: true, fill: true }];
      angles.forEach((a) => {
        const mx = cx + Math.cos(a) * armR, my = cy + Math.sin(a) * armR;
        paths.push({ d: line(cx, cy, mx, my), strokeWidth: 4.5 });
        paths.push({ d: circle(mx, my, propR), closed: true });
        paths.push({ d: circle(mx + coaxOff * 0.5, my + coaxOff * 0.5, propR * 0.86), closed: true, strokeDasharray: '4 3' });
        paths.push({ d: circle(mx, my, 4.5), closed: true, fill: true });
      });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.hubRadius !== undefined ? Number(params.hubRadius) : 0.36;
  const v2 = params.coaxOffset !== undefined ? Number(params.coaxOffset) : 7;
  const p1Norm = (clamp(v1, 0.25, 0.43) - 0.25) / Math.max(0.0001, 0.18);
  const p2Norm = (clamp(v2, 3, 14) - 3) / Math.max(0.0001, 11);
  return [
    { id: 'hubRadius', label: 'Center Triangle Hub', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'coaxOffset', label: 'Coaxial Ring Offset', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'hubRadius') {
    return { ...params, hubRadius: Number(clamp(0.25 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.18, 0.25, 0.43).toFixed(2)) };
  }
  if (controlId === 'coaxOffset') {
    return { ...params, coaxOffset: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 11, 3, 14)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.coaxOffset !== undefined ? Math.round(Number(params.coaxOffset)) : 7;
  return { ...params, coaxOffset: ((cur - 3 + 1) % 12) + 3 };
}`,
  },

  {
    id: 'drone-x8-coaxial-heavy',
    name: 'Drone Frame: X8 Coaxial Heavy-Lift',
    category: 'Drone Parts & Frames',
    description: '4-arm heavy-lift X8 coaxial cinema airframe with 8 counter-rotating motor/propeller discs.',
    iconName: 'Disc',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust coaxial prop radius or upper/lower shift; click in Preview Mode to cycle upper/lower shift.',
    defaultParams: {
      label: 'X8 Heavy-Lift',
      discScale: 0.35,
      coaxShift: 0.78,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'X8 Heavy-Lift' },
      { key: 'discScale', label: 'Coaxial Prop Radius', type: 'number', min: 0.24, max: 0.42, step: 0.01, defaultValue: 0.35 },
      { key: 'coaxShift', label: 'Upper/Lower Shift', type: 'number', min: 0.62, max: 0.92, step: 0.01, defaultValue: 0.78 },
    ],
    jsSourceCode: `// Drone Frame: X8 Coaxial Heavy-Lift (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2;
      const span = clamp(Number(params.discScale) || 0.35, 0.24, 0.42) * r * 2;
      const lowerScale = clamp(Number(params.coaxShift) || 0.78, 0.62, 0.92);
      const propR = r * 0.23;
      const paths = [
        { d: line(cx - span, cy - span, cx + span, cy + span), strokeWidth: 5 },
        { d: line(cx + span, cy - span, cx - span, cy + span), strokeWidth: 5 },
        { d: polygon(Array.from({length:8}, (_,i) => {
          const a = (i * Math.PI) / 4 + Math.PI / 8;
          return [cx + Math.cos(a) * r * 0.28, cy + Math.sin(a) * r * 0.28];
        })), closed: true, fill: true },
      ];
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx, sy]) => {
        const mx = cx + sx * span, my = cy + sy * span;
        paths.push({ d: circle(mx, my, propR), closed: true });
        paths.push({ d: circle(mx, my, propR * lowerScale), closed: true, strokeDasharray: '4 3' });
        paths.push({ d: circle(mx, my, 5), closed: true, fill: true });
      });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.discScale !== undefined ? Number(params.discScale) : 0.35;
  const v2 = params.coaxShift !== undefined ? Number(params.coaxShift) : 0.78;
  const p1Norm = (clamp(v1, 0.24, 0.42) - 0.24) / Math.max(0.0001, 0.18);
  const p2Norm = (clamp(v2, 0.62, 0.92) - 0.62) / Math.max(0.0001, 0.3);
  return [
    { id: 'discScale', label: 'Coaxial Prop Radius', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'coaxShift', label: 'Upper/Lower Shift', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'discScale') {
    return { ...params, discScale: Number(clamp(0.24 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.18, 0.24, 0.42).toFixed(2)) };
  }
  if (controlId === 'coaxShift') {
    return { ...params, coaxShift: Number(clamp(0.62 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.3, 0.62, 0.92).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.coaxShift !== undefined ? Number(params.coaxShift) : 0.78;
  const next = cur + 0.1 > 0.92 + 0.001 ? 0.62 : Number((cur + 0.1).toFixed(2));
  return { ...params, coaxShift: next };
}`,
  },

  {
    id: 'drone-dodecacopter-12-motor',
    name: 'Drone Frame: Dodecacopter 12-Rotor Ring',
    category: 'Drone Parts & Frames',
    description: '12-motor radial heavy-lift airframe with outer structural containment hoop and central payload bay.',
    iconName: 'Orbit',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust outer ring radius or active rotor mounts; click in Preview Mode to cycle active rotor mounts.',
    defaultParams: {
      label: '12-Rotor Dodeca',
      ringScale: 0.37,
      rotors: 12,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '12-Rotor Dodeca' },
      { key: 'ringScale', label: 'Outer Ring Radius', type: 'number', min: 0.26, max: 0.44, step: 0.01, defaultValue: 0.37 },
      { key: 'rotors', label: 'Active Rotor Mounts', type: 'number', min: 8, max: 12, step: 1, defaultValue: 12 },
    ],
    jsSourceCode: `// Drone Frame: Dodecacopter 12-Rotor Ring (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2;
      const armR = clamp(Number(params.ringScale) || 0.37, 0.26, 0.44) * r * 2;
      const count = clamp(Math.round(Number(params.rotors) || 12), 8, 12);
      const propR = r * 0.14;
      const paths = [{ d: circle(cx, cy, r * 0.26), closed: true, fill: true }, { d: circle(cx, cy, r * 0.16), closed: true }];
      for (let i = 0; i < count; i++) {
        const a = (i * Math.PI * 2) / count - Math.PI / 2;
        const mx = cx + Math.cos(a) * armR, my = cy + Math.sin(a) * armR;
        paths.push({ d: line(cx + Math.cos(a) * r * 0.26, cy + Math.sin(a) * r * 0.26, mx, my), strokeWidth: 2.5 });
        paths.push({ d: circle(mx, my, propR), closed: true });
        paths.push({ d: circle(mx, my, 2.5), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.ringScale !== undefined ? Number(params.ringScale) : 0.37;
  const v2 = params.rotors !== undefined ? Number(params.rotors) : 12;
  const p1Norm = (clamp(v1, 0.26, 0.44) - 0.26) / Math.max(0.0001, 0.18);
  const p2Norm = (clamp(v2, 8, 12) - 8) / Math.max(0.0001, 4);
  return [
    { id: 'ringScale', label: 'Outer Ring Radius', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'rotors', label: 'Active Rotor Mounts', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'ringScale') {
    return { ...params, ringScale: Number(clamp(0.26 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.18, 0.26, 0.44).toFixed(2)) };
  }
  if (controlId === 'rotors') {
    return { ...params, rotors: Math.round(clamp(8 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 8, 12)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.rotors !== undefined ? Math.round(Number(params.rotors)) : 12;
  return { ...params, rotors: ((cur - 8 + 1) % 5) + 8 };
}`,
  },

  {
    id: 'drone-tinywhoop-65mm',
    name: 'Drone Frame: 65mm Brushed/Brushless Whoop',
    category: 'Drone Parts & Frames',
    description: 'Ultra-lightweight 65mm 4-ducted micro indoor whoop frame with 1S battery slot and 4-post canopy arch.',
    iconName: 'Disc',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust canopy dome scale or duct strut spokes; click in Preview Mode to cycle duct strut spokes.',
    defaultParams: {
      label: '65mm TinyWhoop',
      canopyScale: 0.23,
      struts: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '65mm TinyWhoop' },
      { key: 'canopyScale', label: 'Canopy Dome Scale', type: 'number', min: 0.18, max: 0.28, step: 0.01, defaultValue: 0.23 },
      { key: 'struts', label: 'Duct Strut Spokes', type: 'number', min: 3, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Frame: 65mm Brushed/Brushless Whoop (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2;
      const ductR = clamp(Number(params.canopyScale) || 0.23, 0.18, 0.28) * r * 2;
      const struts = clamp(Math.round(Number(params.struts) || 3), 3, 4);
      const off = ductR * 0.88;
      const paths = [];
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx, sy]) => {
        const dx = cx + sx * off, dy = cy + sy * off;
        paths.push({ d: circle(dx, dy, ductR), closed: true, fill: true });
        paths.push({ d: circle(dx, dy, ductR * 0.82), closed: true });
        for (let s = 0; s < struts; s++) {
          const a = (s * Math.PI * 2) / struts;
          paths.push({ d: line(dx, dy, dx + Math.cos(a) * ductR * 0.82, dy + Math.sin(a) * ductR * 0.82) });
        }
      });
      paths.push({ d: polygon([[cx, cy - r * 0.34], [cx + r * 0.34, cy], [cx, cy + r * 0.34], [cx - r * 0.34, cy]]), closed: true, fill: true });
      paths.push({ d: circle(cx, cy - r * 0.1, r * 0.12), closed: true });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.canopyScale !== undefined ? Number(params.canopyScale) : 0.23;
  const v2 = params.struts !== undefined ? Number(params.struts) : 3;
  const p1Norm = (clamp(v1, 0.18, 0.28) - 0.18) / Math.max(0.0001, 0.1);
  const p2Norm = (clamp(v2, 3, 4) - 3) / Math.max(0.0001, 1);
  return [
    { id: 'canopyScale', label: 'Canopy Dome Scale', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'struts', label: 'Duct Strut Spokes', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'canopyScale') {
    return { ...params, canopyScale: Number(clamp(0.18 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.1, 0.18, 0.28).toFixed(2)) };
  }
  if (controlId === 'struts') {
    return { ...params, struts: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 1, 3, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.struts !== undefined ? Math.round(Number(params.struts)) : 3;
  return { ...params, struts: ((cur - 3 + 1) % 2) + 3 };
}`,
  },

  {
    id: 'drone-tinywhoop-75mm-hd',
    name: 'Drone Frame: 75mm HD Whoop Chassis',
    category: 'Drone Parts & Frames',
    description: '75mm brushless HD micro whoop frame with corner triangular brace gussets and 25.5×25.5 diamond AIO bay.',
    iconName: 'Disc',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust diamond aio scale or corner brace gussets; click in Preview Mode to cycle corner brace gussets.',
    defaultParams: {
      label: '75mm HD Whoop',
      boardScale: 0.16,
      gussets: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '75mm HD Whoop' },
      { key: 'boardScale', label: 'Diamond AIO Scale', type: 'number', min: 0.1, max: 0.24, step: 0.01, defaultValue: 0.16 },
      { key: 'gussets', label: 'Corner Brace Gussets', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Frame: 75mm HD Whoop Chassis (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2;
      const wall = clamp(Number(params.boardScale) || 0.16, 0.1, 0.24);
      const blades = clamp(Math.round(Number(params.gussets) || 3), 2, 4);
      const ductR = r * 0.44, off = r * 0.42;
      const paths = [];
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx, sy]) => {
        const dx = cx + sx * off, dy = cy + sy * off;
        paths.push({ d: circle(dx, dy, ductR), closed: true, fill: true });
        paths.push({ d: circle(dx, dy, ductR * (1 - wall)), closed: true });
        for (let b = 0; b < blades; b++) {
          const a = (b * Math.PI * 2) / blades + 0.4;
          paths.push({ d: line(dx, dy, dx + Math.cos(a) * ductR * (1 - wall - 0.05), dy + Math.sin(a) * ductR * (1 - wall - 0.05)), strokeWidth: 2 });
        }
      });
      paths.push({ d: roundRect(cx - r * 0.28, cy - r * 0.32, r * 0.56, r * 0.64, 6), closed: true, fill: true });
      paths.push({ d: rect(cx - r * 0.16, cy - r * 0.48, r * 0.32, r * 0.2), closed: true });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.boardScale !== undefined ? Number(params.boardScale) : 0.16;
  const v2 = params.gussets !== undefined ? Number(params.gussets) : 3;
  const p1Norm = (clamp(v1, 0.1, 0.24) - 0.1) / Math.max(0.0001, 0.14);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'boardScale', label: 'Diamond AIO Scale', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'gussets', label: 'Corner Brace Gussets', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'boardScale') {
    return { ...params, boardScale: Number(clamp(0.1 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.14, 0.1, 0.24).toFixed(2)) };
  }
  if (controlId === 'gussets') {
    return { ...params, gussets: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.gussets !== undefined ? Math.round(Number(params.gussets)) : 3;
  return { ...params, gussets: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-pusher-cinewhoop',
    name: 'Drone Frame: Pusher Inverted Cinewhoop',
    category: 'Drone Parts & Frames',
    description: 'Unibody carbon/TPU perimeter guard frame with 4 inverted pusher ducts and raised top camera wedge.',
    iconName: 'Video',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust guard corner radius or top camera mount (%); click in Preview Mode to cycle top camera mount (%).',
    defaultParams: {
      label: 'Pusher Cinewhoop',
      cornerRad: 0.22,
      camWidth: 0.84,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Pusher Cinewhoop' },
      { key: 'cornerRad', label: 'Guard Corner Radius', type: 'number', min: 0.12, max: 0.34, step: 0.01, defaultValue: 0.22 },
      { key: 'camWidth', label: 'Top Camera Mount (%)', type: 'number', min: 0.68, max: 0.94, step: 0.01, defaultValue: 0.84 },
    ],
    jsSourceCode: `// Drone Frame: Pusher Inverted Cinewhoop (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height * 0.54, r = Math.min(width, height) / 2;
      const camL = clamp(Number(params.cornerRad) || 0.22, 0.12, 0.34) * height;
      const guardG = clamp(Number(params.camWidth) || 0.84, 0.68, 0.94);
      const dR = r * 0.38 * guardG, offX = width * 0.24, offY = height * 0.2;
      const paths = [
        { d: roundRect(cx - width * 0.42, cy - height * 0.36, width * 0.84, height * 0.72, dR), closed: true, fill: true },
        { d: roundRect(cx - 18, cy - height * 0.36 - camL, 36, camL + 10, 5), closed: true, fill: true },
        { d: circle(cx + 6, cy - height * 0.36 - camL * 0.5, 6), closed: true },
      ];
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx, sy]) => {
        const dx = cx + sx * offX, dy = cy + sy * offY;
        paths.push({ d: circle(dx, dy, dR), closed: true });
        paths.push({ d: circle(dx, dy, dR * 0.82), closed: true, strokeDasharray: '4 3' });
        paths.push({ d: circle(dx, dy, 5), closed: true });
      });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.cornerRad !== undefined ? Number(params.cornerRad) : 0.22;
  const v2 = params.camWidth !== undefined ? Number(params.camWidth) : 0.84;
  const p1Norm = (clamp(v1, 0.12, 0.34) - 0.12) / Math.max(0.0001, 0.22);
  const p2Norm = (clamp(v2, 0.68, 0.94) - 0.68) / Math.max(0.0001, 0.26);
  return [
    { id: 'cornerRad', label: 'Guard Corner Radius', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'camWidth', label: 'Top Camera Mount (%)', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'cornerRad') {
    return { ...params, cornerRad: Number(clamp(0.12 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.22, 0.12, 0.34).toFixed(2)) };
  }
  if (controlId === 'camWidth') {
    return { ...params, camWidth: Number(clamp(0.68 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.26, 0.68, 0.94).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.camWidth !== undefined ? Number(params.camWidth) : 0.84;
  const next = cur + 0.09 > 0.94 + 0.001 ? 0.68 : Number((cur + 0.09).toFixed(2));
  return { ...params, camWidth: next };
}`,
  },

  {
    id: 'drone-toothpick-ultralight',
    name: 'Drone Frame: 3" Ultralight Toothpick',
    category: 'Drone Parts & Frames',
    description: 'Minimalist 2.5mm carbon cross-plate toothpick frame with 3-hole triangular micro motor pads.',
    iconName: 'Minimize2',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust arm thickness ratio or 3-bolt pad radius; click in Preview Mode to cycle 3-bolt pad radius.',
    defaultParams: {
      label: '3" Toothpick',
      armSlim: 4,
      padSize: 0.18,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '3" Toothpick' },
      { key: 'armSlim', label: 'Arm Thickness Ratio', type: 'number', min: 2, max: 7, step: 1, defaultValue: 4 },
      { key: 'padSize', label: '3-Bolt Pad Radius', type: 'number', min: 0.12, max: 0.26, step: 0.01, defaultValue: 0.18 },
    ],
    jsSourceCode: `// Drone Frame: 3" Ultralight Toothpick (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2;
      const strutW = clamp(Number(params.armSlim) || 4, 2, 7);
      const podR = clamp(Number(params.padSize) || 0.18, 0.12, 0.26) * r * 2;
      const span = r * 0.68, propR = r * 0.28;
      const paths = [
        { d: polygon([[cx - span - strutW * 0.4, cy - span + strutW * 0.4], [cx - span + strutW * 0.4, cy - span - strutW * 0.4], [cx + span + strutW * 0.4, cy + span - strutW * 0.4], [cx + span - strutW * 0.4, cy + span + strutW * 0.4]]), closed: true },
        { d: polygon([[cx + span - strutW * 0.4, cy - span - strutW * 0.4], [cx + span + strutW * 0.4, cy - span + strutW * 0.4], [cx - span + strutW * 0.4, cy + span + strutW * 0.4], [cx - span - strutW * 0.4, cy + span - strutW * 0.4]]), closed: true },
        { d: polygon([[cx, cy - podR], [cx + podR, cy], [cx, cy + podR], [cx - podR, cy]]), closed: true, fill: true },
        { d: circle(cx, cy, podR * 0.45), closed: true },
      ];
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx, sy]) => {
        const mx = cx + sx * span, my = cy + sy * span;
        paths.push({ d: circle(mx, my, propR), closed: true });
        paths.push({ d: line(mx - propR * 0.85, my, mx + propR * 0.85, my), strokeWidth: 1.8 });
      });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.armSlim !== undefined ? Number(params.armSlim) : 4;
  const v2 = params.padSize !== undefined ? Number(params.padSize) : 0.18;
  const p1Norm = (clamp(v1, 2, 7) - 2) / Math.max(0.0001, 5);
  const p2Norm = (clamp(v2, 0.12, 0.26) - 0.12) / Math.max(0.0001, 0.14);
  return [
    { id: 'armSlim', label: 'Arm Thickness Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'padSize', label: '3-Bolt Pad Radius', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'armSlim') {
    return { ...params, armSlim: Math.round(clamp(2 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 5, 2, 7)) };
  }
  if (controlId === 'padSize') {
    return { ...params, padSize: Number(clamp(0.12 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.14, 0.12, 0.26).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.padSize !== undefined ? Number(params.padSize) : 0.18;
  const next = cur + 0.05 > 0.26 + 0.001 ? 0.12 : Number((cur + 0.05).toFixed(2));
  return { ...params, padSize: next };
}`,
  },

  {
    id: 'drone-micro-long-range-4in',
    name: 'Drone Frame: 4" Micro Long-Range',
    category: 'Drone Parts & Frames',
    description: 'Sub-250g 4-inch long-range explorer frame with 18650 Li-Ion battery tray and rear GPS/Immortal-T tail.',
    iconName: 'Compass',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust li-ion tray length or rear gps tail length; click in Preview Mode to cycle rear gps tail length.',
    defaultParams: {
      label: '4" Micro LR',
      cellLen: 0.24,
      tailLen: 2,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '4" Micro LR' },
      { key: 'cellLen', label: 'Li-Ion Tray Length', type: 'number', min: 0.12, max: 0.36, step: 0.01, defaultValue: 0.24 },
      { key: 'tailLen', label: 'Rear GPS Tail Length', type: 'number', min: 2, max: 4, step: 1, defaultValue: 2 },
    ],
    jsSourceCode: `// Drone Frame: 4" Micro Long-Range (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2;
      const gpsMast = clamp(Number(params.cellLen) || 0.24, 0.12, 0.36) * height;
      const cells = clamp(Math.round(Number(params.tailLen) || 2), 2, 4);
      const spanX = width * 0.34, spanY = height * 0.26, propR = r * 0.23;
      const paths = [
        { d: line(cx - spanX, cy - spanY * 0.7, cx + spanX, cy + spanY), strokeWidth: 3.5 },
        { d: line(cx + spanX, cy - spanY * 0.7, cx - spanX, cy + spanY), strokeWidth: 3.5 },
        { d: roundRect(cx - 18, cy - height * 0.24, 36, height * 0.48, 6), closed: true, fill: true },
        { d: line(cx, cy + height * 0.24, cx, cy + height * 0.24 + gpsMast) },
        { d: rect(cx - 10, cy + height * 0.24 + gpsMast - 8, 20, 12), closed: true, fill: true },
      ];
      for (let c = 0; c < cells; c++) {
        const bx = cx - 12 + (c * 24) / Math.max(1, cells);
        paths.push({ d: roundRect(bx, cy - height * 0.16, 22 / cells, height * 0.3, 3), closed: true });
      }
      [[-1,-0.7],[1,-0.7],[1,1],[-1,1]].forEach(([sx, sy]) => {
        paths.push({ d: circle(cx + sx * spanX, cy + sy * spanY, propR), closed: true });
      });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.cellLen !== undefined ? Number(params.cellLen) : 0.24;
  const v2 = params.tailLen !== undefined ? Number(params.tailLen) : 2;
  const p1Norm = (clamp(v1, 0.12, 0.36) - 0.12) / Math.max(0.0001, 0.24);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'cellLen', label: 'Li-Ion Tray Length', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'tailLen', label: 'Rear GPS Tail Length', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'cellLen') {
    return { ...params, cellLen: Number(clamp(0.12 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.24, 0.12, 0.36).toFixed(2)) };
  }
  if (controlId === 'tailLen') {
    return { ...params, tailLen: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.tailLen !== undefined ? Math.round(Number(params.tailLen)) : 2;
  return { ...params, tailLen: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-7inch-mountain-cruiser',
    name: 'Drone Frame: 7" Mountain Cruiser',
    category: 'Drone Parts & Frames',
    description: 'Long-range 7-inch FPV frame with anti-resonance carbon side braces connecting front and rear arms.',
    iconName: 'Mountain',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust side brace offset or fuselage length (%); click in Preview Mode to cycle fuselage length (%).',
    defaultParams: {
      label: '7" LR Cruiser',
      braceX: 0.62,
      bodyLen: 0.26,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '7" LR Cruiser' },
      { key: 'braceX', label: 'Side Brace Offset', type: 'number', min: 0.4, max: 0.82, step: 0.01, defaultValue: 0.62 },
      { key: 'bodyLen', label: 'Fuselage Length (%)', type: 'number', min: 0.14, max: 0.38, step: 0.01, defaultValue: 0.26 },
    ],
    jsSourceCode: `// Drone Frame: 7" Mountain Cruiser (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2;
      const braceY = clamp(Number(params.braceX) || 0.62, 0.4, 0.82);
      const mastL = clamp(Number(params.bodyLen) || 0.26, 0.14, 0.38) * height;
      const fX = width * 0.38, fY = height * 0.18, rX = width * 0.32, rY = height * 0.32, propR = r * 0.24;
      const paths = [
        { d: line(cx, cy - 12, cx - fX, cy - fY), strokeWidth: 4.2 },
        { d: line(cx, cy - 12, cx + fX, cy - fY), strokeWidth: 4.2 },
        { d: line(cx, cy + 12, cx - rX, cy + rY), strokeWidth: 4.2 },
        { d: line(cx, cy + 12, cx + rX, cy + rY), strokeWidth: 4.2 },
        { d: line(cx - fX * braceY, cy - fY * braceY, cx - rX * braceY, cy + rY * braceY), strokeWidth: 2 },
        { d: line(cx + fX * braceY, cy - fY * braceY, cx + rX * braceY, cy + rY * braceY), strokeWidth: 2 },
        { d: roundRect(cx - 18, cy - height * 0.26, 36, height * 0.52, 6), closed: true, fill: true },
        { d: line(cx - 6, cy + height * 0.26, cx - 18, cy + height * 0.26 + mastL) },
        { d: line(cx + 6, cy + height * 0.26, cx + 18, cy + height * 0.26 + mastL) },
      ];
      [[-fX,-fY],[fX,-fY],[rX,rY],[-rX,rY]].forEach(([dx, dy]) => {
        paths.push({ d: circle(cx + dx, cy + dy, propR), closed: true });
      });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.braceX !== undefined ? Number(params.braceX) : 0.62;
  const v2 = params.bodyLen !== undefined ? Number(params.bodyLen) : 0.26;
  const p1Norm = (clamp(v1, 0.4, 0.82) - 0.4) / Math.max(0.0001, 0.42);
  const p2Norm = (clamp(v2, 0.14, 0.38) - 0.14) / Math.max(0.0001, 0.24);
  return [
    { id: 'braceX', label: 'Side Brace Offset', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'bodyLen', label: 'Fuselage Length (%)', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'braceX') {
    return { ...params, braceX: Number(clamp(0.4 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.42, 0.4, 0.82).toFixed(2)) };
  }
  if (controlId === 'bodyLen') {
    return { ...params, bodyLen: Number(clamp(0.14 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.24, 0.14, 0.38).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.bodyLen !== undefined ? Number(params.bodyLen) : 0.26;
  const next = cur + 0.08 > 0.38 + 0.001 ? 0.14 : Number((cur + 0.08).toFixed(2));
  return { ...params, bodyLen: next };
}`,
  },

  {
    id: 'drone-10inch-heavy-payload',
    name: 'Drone Frame: 10" Heavy Payload Quad',
    category: 'Drone Parts & Frames',
    description: '10-inch heavy-payload quadcopter frame with dual-spar truss arms and oversized cargo center deck.',
    iconName: 'Package',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust cargo deck scale or arm truss crossbars; click in Preview Mode to cycle arm truss crossbars.',
    defaultParams: {
      label: '10" Payload Quad',
      deckScale: 0.65,
      trussBars: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '10" Payload Quad' },
      { key: 'deckScale', label: 'Cargo Deck Scale', type: 'number', min: 0.45, max: 0.82, step: 0.01, defaultValue: 0.65 },
      { key: 'trussBars', label: 'Arm Truss Crossbars', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Frame: 10" Heavy Payload Quad (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2;
      const trussR = clamp(Number(params.deckScale) || 0.65, 0.45, 0.82);
      const bays = clamp(Math.round(Number(params.trussBars) || 3), 2, 4);
      const span = r * 0.72, propR = r * 0.24;
      const pts = [[cx - span, cy - span],[cx + span, cy - span],[cx + span, cy + span],[cx - span, cy + span]];
      const paths = [];
      pts.forEach(([mx, my], idx) => {
        const [nx, ny] = pts[(idx + 1) % 4];
        paths.push({ d: line(cx, cy, mx, my), strokeWidth: 4.5 });
        paths.push({ d: line(cx + (mx - cx) * trussR, cy + (my - cy) * trussR, cx + (nx - cx) * trussR, cy + (ny - cy) * trussR), strokeWidth: 2 });
        paths.push({ d: circle(mx, my, propR), closed: true });
      });
      paths.push({ d: roundRect(cx - 22, cy - 28, 44, 56, 6), closed: true, fill: true });
      for (let b = 0; b < bays; b++) {
        paths.push({ d: rect(cx - 15, cy - 20 + b * (36 / bays), 30, 30 / bays), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.deckScale !== undefined ? Number(params.deckScale) : 0.65;
  const v2 = params.trussBars !== undefined ? Number(params.trussBars) : 3;
  const p1Norm = (clamp(v1, 0.45, 0.82) - 0.45) / Math.max(0.0001, 0.37);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'deckScale', label: 'Cargo Deck Scale', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'trussBars', label: 'Arm Truss Crossbars', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'deckScale') {
    return { ...params, deckScale: Number(clamp(0.45 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.37, 0.45, 0.82).toFixed(2)) };
  }
  if (controlId === 'trussBars') {
    return { ...params, trussBars: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.trussBars !== undefined ? Math.round(Number(params.trussBars)) : 3;
  return { ...params, trussBars: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-xclass-800mm-giant',
    name: 'Drone Frame: 800mm X-Class Racing Frame',
    category: 'Drone Parts & Frames',
    description: 'Giant 800mm X-Class racing airframe with gusseted tubular arms and dual-battery center cage.',
    iconName: 'Maximize2',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust center gusset web or giant prop disc (%); click in Preview Mode to cycle giant prop disc (%).',
    defaultParams: {
      label: '800mm X-Class',
      gussetSize: 0.28,
      propSize: 0.45,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '800mm X-Class' },
      { key: 'gussetSize', label: 'Center Gusset Web', type: 'number', min: 0.18, max: 0.38, step: 0.01, defaultValue: 0.28 },
      { key: 'propSize', label: 'Giant Prop Disc (%)', type: 'number', min: 0.28, max: 0.62, step: 0.01, defaultValue: 0.45 },
    ],
    jsSourceCode: `// Drone Frame: 800mm X-Class Racing Frame (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2;
      const boxS = clamp(Number(params.gussetSize) || 0.28, 0.18, 0.38) * r * 2;
      const gusset = clamp(Number(params.propSize) || 0.45, 0.28, 0.62);
      const span = r * 0.72, propR = r * 0.25;
      const paths = [
        { d: polygon([[cx, cy - span * gusset], [cx + span * gusset, cy], [cx, cy + span * gusset], [cx - span * gusset, cy]]), closed: true },
        { d: line(cx - span, cy - span, cx + span, cy + span), strokeWidth: 6 },
        { d: line(cx + span, cy - span, cx - span, cy + span), strokeWidth: 6 },
        { d: rect(cx - boxS / 2, cy - boxS / 2, boxS, boxS), closed: true, fill: true },
        { d: rect(cx - boxS * 0.32, cy - boxS * 0.32, boxS * 0.64, boxS * 0.64), closed: true },
      ];
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx, sy]) => {
        paths.push({ d: circle(cx + sx * span, cy + sy * span, propR), closed: true });
        paths.push({ d: circle(cx + sx * span, cy + sy * span, 6), closed: true, fill: true });
      });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.gussetSize !== undefined ? Number(params.gussetSize) : 0.28;
  const v2 = params.propSize !== undefined ? Number(params.propSize) : 0.45;
  const p1Norm = (clamp(v1, 0.18, 0.38) - 0.18) / Math.max(0.0001, 0.2);
  const p2Norm = (clamp(v2, 0.28, 0.62) - 0.28) / Math.max(0.0001, 0.34);
  return [
    { id: 'gussetSize', label: 'Center Gusset Web', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'propSize', label: 'Giant Prop Disc (%)', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'gussetSize') {
    return { ...params, gussetSize: Number(clamp(0.18 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.2, 0.18, 0.38).toFixed(2)) };
  }
  if (controlId === 'propSize') {
    return { ...params, propSize: Number(clamp(0.28 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.34, 0.28, 0.62).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.propSize !== undefined ? Number(params.propSize) : 0.45;
  const next = cur + 0.11 > 0.62 + 0.001 ? 0.28 : Number((cur + 0.11).toFixed(2));
  return { ...params, propSize: next };
}`,
  },

  {
    id: 'drone-cinelifter-8prop-box',
    name: 'Drone Frame: 8-Prop Cinema Cinelifter',
    category: 'Drone Parts & Frames',
    description: 'Box-truss heavy cinema lifter carrying a central cinema camera cage surrounded by 8 ducted prop rings.',
    iconName: 'Film',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust cinema cam box scale or perimeter duct size; click in Preview Mode to cycle perimeter duct size.',
    defaultParams: {
      label: '8-Prop Cinelifter',
      cageScale: 0.34,
      ductR: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '8-Prop Cinelifter' },
      { key: 'cageScale', label: 'Cinema Cam Box Scale', type: 'number', min: 0.22, max: 0.46, step: 0.01, defaultValue: 0.34 },
      { key: 'ductR', label: 'Perimeter Duct Size', type: 'number', min: 4, max: 8, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Frame: 8-Prop Cinema Cinelifter (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2;
      const cageW = clamp(Number(params.cageScale) || 0.34, 0.22, 0.46) * width;
      const damp = clamp(Math.round(Number(params.ductR) || 6), 4, 8);
      const spanX = width * 0.36, spanY = height * 0.32, propR = r * 0.22;
      const paths = [];
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx, sy]) => {
        const mx = cx + sx * spanX, my = cy + sy * spanY;
        paths.push({ d: line(cx, cy, mx, my), strokeWidth: 5 });
        paths.push({ d: circle(mx, my, propR), closed: true });
        paths.push({ d: circle(mx, my, propR * 0.84), closed: true, strokeDasharray: '4 3' });
      });
      paths.push({ d: roundRect(cx - cageW / 2, cy - height * 0.24, cageW, height * 0.48, 8), closed: true, fill: true });
      paths.push({ d: rect(cx - cageW * 0.28, cy - height * 0.32, cageW * 0.56, height * 0.14), closed: true, fill: true });
      for (let d = 0; d < damp; d++) {
        const a = (d * Math.PI * 2) / damp;
        paths.push({ d: circle(cx + Math.cos(a) * (cageW * 0.38), cy + Math.sin(a) * (height * 0.16), 3.5), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.cageScale !== undefined ? Number(params.cageScale) : 0.34;
  const v2 = params.ductR !== undefined ? Number(params.ductR) : 6;
  const p1Norm = (clamp(v1, 0.22, 0.46) - 0.22) / Math.max(0.0001, 0.24);
  const p2Norm = (clamp(v2, 4, 8) - 4) / Math.max(0.0001, 4);
  return [
    { id: 'cageScale', label: 'Cinema Cam Box Scale', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'ductR', label: 'Perimeter Duct Size', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'cageScale') {
    return { ...params, cageScale: Number(clamp(0.22 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.24, 0.22, 0.46).toFixed(2)) };
  }
  if (controlId === 'ductR') {
    return { ...params, ductR: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 4, 8)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.ductR !== undefined ? Math.round(Number(params.ductR)) : 6;
  return { ...params, ductR: ((cur - 4 + 1) % 5) + 4 };
}`,
  },

  {
    id: 'drone-spherical-collision-cage',
    name: 'Drone Frame: Geodesic Inspection Cage',
    category: 'Drone Parts & Frames',
    description: '360-degree geodesic carbon protective sphere surrounding an inner gimbaled quadcopter for confined spaces.',
    iconName: 'Globe',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust inner quad scale or geodesic cage ribs; click in Preview Mode to cycle geodesic cage ribs.',
    defaultParams: {
      label: 'Collision Cage UAV',
      innerQuad: 0.88,
      meridians: 5,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Collision Cage UAV' },
      { key: 'innerQuad', label: 'Inner Quad Scale', type: 'number', min: 0.72, max: 0.96, step: 0.01, defaultValue: 0.88 },
      { key: 'meridians', label: 'Geodesic Cage Ribs', type: 'number', min: 3, max: 7, step: 1, defaultValue: 5 },
    ],
    jsSourceCode: `// Drone Frame: Geodesic Inspection Cage (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2 * 0.86;
      const cageR = clamp(Number(params.innerQuad) || 0.88, 0.72, 0.96) * r;
      const merid = clamp(Math.round(Number(params.meridians) || 5), 3, 7);
      const paths = [{ d: circle(cx, cy, cageR), closed: true, fill: true }];
      for (let i = 1; i <= merid; i++) {
        const rx = cageR * (i / (merid + 1));
        paths.push({ d: ellipse(cx, cy, rx, cageR), closed: true });
        paths.push({ d: ellipse(cx, cy, cageR, rx), closed: true });
      }
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx, sy]) => {
        paths.push({ d: circle(cx + sx * cageR * 0.38, cy + sy * cageR * 0.38, cageR * 0.2), closed: true });
      });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.innerQuad !== undefined ? Number(params.innerQuad) : 0.88;
  const v2 = params.meridians !== undefined ? Number(params.meridians) : 5;
  const p1Norm = (clamp(v1, 0.72, 0.96) - 0.72) / Math.max(0.0001, 0.24);
  const p2Norm = (clamp(v2, 3, 7) - 3) / Math.max(0.0001, 4);
  return [
    { id: 'innerQuad', label: 'Inner Quad Scale', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'meridians', label: 'Geodesic Cage Ribs', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'innerQuad') {
    return { ...params, innerQuad: Number(clamp(0.72 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.24, 0.72, 0.96).toFixed(2)) };
  }
  if (controlId === 'meridians') {
    return { ...params, meridians: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 3, 7)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.meridians !== undefined ? Math.round(Number(params.meridians)) : 5;
  return { ...params, meridians: ((cur - 3 + 1) % 5) + 3 };
}`,
  },

  {
    id: 'drone-bicopter-tilt-rotor',
    name: 'Drone Frame: Dual-Rotor Tilt Bicopter',
    category: 'Drone Parts & Frames',
    description: 'Avatar-style dual-rotor bicopter with central vertical fuselage pod and 2 servo-tilting ducted nacelles.',
    iconName: 'Cpu',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust outrigger spar span or tilt nacelle radius; click in Preview Mode to cycle tilt nacelle radius.',
    defaultParams: {
      label: 'Tilt-Rotor Bicopter',
      wingSpan: 0.24,
      ductScale: 0.74,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Tilt-Rotor Bicopter' },
      { key: 'wingSpan', label: 'Outrigger Spar Span', type: 'number', min: 0.05, max: 0.45, step: 0.01, defaultValue: 0.24 },
      { key: 'ductScale', label: 'Tilt Nacelle Radius', type: 'number', min: 0.52, max: 0.88, step: 0.01, defaultValue: 0.74 },
    ],
    jsSourceCode: `// Drone Frame: Dual-Rotor Tilt Bicopter (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height * 0.54, r = Math.min(width, height) / 2;
      const tilt = clamp(Number(params.wingSpan) || 0.24, 0.05, 0.45);
      const span = clamp(Number(params.ductScale) || 0.74, 0.52, 0.88) * (width / 2);
      const propR = r * 0.28;
      const paths = [
        { d: line(cx - span, cy - 10, cx + span, cy - 10), strokeWidth: 5 },
        { d: roundRect(cx - 24, cy - 26, 48, 56, 10), closed: true, fill: true },
        { d: ellipse(cx - span, cy - 22, propR, propR * (1 - tilt)), closed: true },
        { d: ellipse(cx + span, cy - 22, propR, propR * (1 - tilt)), closed: true },
        { d: rect(cx - span - 8, cy - 16, 16, 18), closed: true, fill: true },
        { d: rect(cx + span - 8, cy - 16, 16, 18), closed: true, fill: true },
        { d: line(cx - 16, cy + 30, cx - 26, cy + 48), strokeWidth: 3 },
        { d: line(cx + 16, cy + 30, cx + 26, cy + 48), strokeWidth: 3 },
      ];
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.wingSpan !== undefined ? Number(params.wingSpan) : 0.24;
  const v2 = params.ductScale !== undefined ? Number(params.ductScale) : 0.74;
  const p1Norm = (clamp(v1, 0.05, 0.45) - 0.05) / Math.max(0.0001, 0.4);
  const p2Norm = (clamp(v2, 0.52, 0.88) - 0.52) / Math.max(0.0001, 0.36);
  return [
    { id: 'wingSpan', label: 'Outrigger Spar Span', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'ductScale', label: 'Tilt Nacelle Radius', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'wingSpan') {
    return { ...params, wingSpan: Number(clamp(0.05 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.4, 0.05, 0.45).toFixed(2)) };
  }
  if (controlId === 'ductScale') {
    return { ...params, ductScale: Number(clamp(0.52 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.36, 0.52, 0.88).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.ductScale !== undefined ? Number(params.ductScale) : 0.74;
  const next = cur + 0.12 > 0.88 + 0.001 ? 0.52 : Number((cur + 0.12).toFixed(2));
  return { ...params, ductScale: next };
}`,
  },

  {
    id: 'drone-single-rotor-ducted-fan',
    name: 'Drone Frame: Coaxial Ducted Fan UAV',
    category: 'Drone Parts & Frames',
    description: 'Hovering cylindrical ducted-fan tactical UAV with annular shroud, stator struts, and bottom control vanes.',
    iconName: 'Disc',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust annular shroud wall or radial stator struts; click in Preview Mode to cycle radial stator struts.',
    defaultParams: {
      label: 'Ducted Fan UAV',
      shroudThick: 0.64,
      stators: 5,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Ducted Fan UAV' },
      { key: 'shroudThick', label: 'Annular Shroud Wall', type: 'number', min: 0.45, max: 0.82, step: 0.01, defaultValue: 0.64 },
      { key: 'stators', label: 'Radial Stator Struts', type: 'number', min: 3, max: 7, step: 1, defaultValue: 5 },
    ],
    jsSourceCode: `// Drone Frame: Coaxial Ducted Fan UAV (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height * 0.48;
      const shroudW = clamp(Number(params.shroudThick) || 0.64, 0.45, 0.82) * width;
      const vanes = clamp(Math.round(Number(params.stators) || 5), 3, 7);
      const sH = height * 0.52, topY = height * 0.16;
      const paths = [
        { d: polygon([[cx - shroudW * 0.46, topY], [cx + shroudW * 0.46, topY], [cx + shroudW * 0.52, topY + sH], [cx - shroudW * 0.52, topY + sH]]), closed: true, fill: true },
        { d: ellipse(cx, topY, shroudW * 0.46, 12), closed: true },
        { d: roundRect(cx - 12, topY - 12, 24, sH + 20, 8), closed: true, fill: true },
      ];
      for (let v = 0; v < vanes; v++) {
        const vx = cx - shroudW * 0.38 + (v * shroudW * 0.76) / Math.max(1, vanes - 1);
        paths.push({ d: line(vx, topY + sH, vx + 4, topY + sH + 18), strokeWidth: 2.5 });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.shroudThick !== undefined ? Number(params.shroudThick) : 0.64;
  const v2 = params.stators !== undefined ? Number(params.stators) : 5;
  const p1Norm = (clamp(v1, 0.45, 0.82) - 0.45) / Math.max(0.0001, 0.37);
  const p2Norm = (clamp(v2, 3, 7) - 3) / Math.max(0.0001, 4);
  return [
    { id: 'shroudThick', label: 'Annular Shroud Wall', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'stators', label: 'Radial Stator Struts', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'shroudThick') {
    return { ...params, shroudThick: Number(clamp(0.45 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.37, 0.45, 0.82).toFixed(2)) };
  }
  if (controlId === 'stators') {
    return { ...params, stators: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 3, 7)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.stators !== undefined ? Math.round(Number(params.stators)) : 5;
  return { ...params, stators: ((cur - 3 + 1) % 5) + 3 };
}`,
  },

  {
    id: 'drone-tailsitter-vtol-wing',
    name: 'Drone Frame: Tailsitter VTOL Flying Wing',
    category: 'Drone Parts & Frames',
    description: 'Vertical takeoff and transition tailsitter delta wing with 4 leading-edge tractor motors and twin tail fins.',
    iconName: 'Navigation',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust leading edge sweep or tractor motor pods; click in Preview Mode to cycle tractor motor pods.',
    defaultParams: {
      label: 'Tailsitter VTOL',
      sweepRatio: 0.36,
      motors: 2,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Tailsitter VTOL' },
      { key: 'sweepRatio', label: 'Leading Edge Sweep', type: 'number', min: 0.18, max: 0.54, step: 0.01, defaultValue: 0.36 },
      { key: 'motors', label: 'Tractor Motor Pods', type: 'number', min: 2, max: 4, step: 1, defaultValue: 2 },
    ],
    jsSourceCode: `// Drone Frame: Tailsitter VTOL Flying Wing (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const sweep = clamp(Number(params.sweepRatio) || 0.36, 0.18, 0.54) * height;
      const pods = clamp(Math.round(Number(params.motors) || 2), 2, 4);
      const span = width * 0.44, noseY = height * 0.16, tailY = height * 0.78;
      const paths = [
        { d: polygon([[cx, noseY], [cx + span, noseY + sweep], [cx + span, tailY], [cx + 18, tailY - 14], [cx, tailY + 6], [cx - 18, tailY - 14], [cx - span, tailY], [cx - span, noseY + sweep]]), closed: true, fill: true },
        { d: line(cx - span, tailY - 10, cx + span, tailY - 10), strokeDasharray: '4 3' },
      ];
      for (let p = 0; p < pods; p++) {
        const px = cx - span * 0.65 + (p * span * 1.3) / Math.max(1, pods - 1);
        const py = noseY + sweep * (Math.abs(px - cx) / span);
        paths.push({ d: roundRect(px - 5, py - 8, 10, 26, 3), closed: true, fill: true });
        paths.push({ d: ellipse(px, py - 10, 14, 4), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.sweepRatio !== undefined ? Number(params.sweepRatio) : 0.36;
  const v2 = params.motors !== undefined ? Number(params.motors) : 2;
  const p1Norm = (clamp(v1, 0.18, 0.54) - 0.18) / Math.max(0.0001, 0.36);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'sweepRatio', label: 'Leading Edge Sweep', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'motors', label: 'Tractor Motor Pods', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'sweepRatio') {
    return { ...params, sweepRatio: Number(clamp(0.18 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.36, 0.18, 0.54).toFixed(2)) };
  }
  if (controlId === 'motors') {
    return { ...params, motors: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.motors !== undefined ? Math.round(Number(params.motors)) : 2;
  return { ...params, motors: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-quadplane-hybrid-vtol',
    name: 'Drone Frame: QuadPlane Hybrid VTOL',
    category: 'Drone Parts & Frames',
    description: 'Fixed-wing fuselage and main wing equipped with twin longitudinal VTOL booms (4 lift rotors) and pusher prop.',
    iconName: 'Plane',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust vtol boom span or main wing chord (%); click in Preview Mode to cycle main wing chord (%).',
    defaultParams: {
      label: 'QuadPlane VTOL',
      boomSpread: 0.28,
      wingChord: 0.38,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'QuadPlane VTOL' },
      { key: 'boomSpread', label: 'VTOL Boom Span', type: 'number', min: 0.18, max: 0.38, step: 0.01, defaultValue: 0.28 },
      { key: 'wingChord', label: 'Main Wing Chord (%)', type: 'number', min: 0.26, max: 0.52, step: 0.01, defaultValue: 0.38 },
    ],
    jsSourceCode: `// Drone Frame: QuadPlane Hybrid VTOL (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const boomX = clamp(Number(params.boomSpread) || 0.28, 0.18, 0.38) * width;
      const wingY = clamp(Number(params.wingChord) || 0.38, 0.26, 0.52) * height;
      const span = width * 0.45, propR = Math.min(width, height) * 0.09;
      const paths = [
        { d: roundRect(cx - span, wingY - 10, span * 2, 20, 4), closed: true, fill: true },
        { d: roundRect(cx - 10, height * 0.12, 20, height * 0.66, 8), closed: true, fill: true },
        { d: line(cx - boomX, height * 0.22, cx - boomX, height * 0.82), strokeWidth: 3 },
        { d: line(cx + boomX, height * 0.22, cx + boomX, height * 0.82), strokeWidth: 3 },
        { d: line(cx - boomX, height * 0.82, cx + boomX, height * 0.82), strokeWidth: 4 },
        { d: ellipse(cx, height * 0.82, 16, 4), closed: true },
      ];
      [[-boomX, height * 0.22],[boomX, height * 0.22],[-boomX, height * 0.62],[boomX, height * 0.62]].forEach(([dx, py]) => {
        paths.push({ d: circle(cx + dx, py, propR), closed: true });
      });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.boomSpread !== undefined ? Number(params.boomSpread) : 0.28;
  const v2 = params.wingChord !== undefined ? Number(params.wingChord) : 0.38;
  const p1Norm = (clamp(v1, 0.18, 0.38) - 0.18) / Math.max(0.0001, 0.2);
  const p2Norm = (clamp(v2, 0.26, 0.52) - 0.26) / Math.max(0.0001, 0.26);
  return [
    { id: 'boomSpread', label: 'VTOL Boom Span', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'wingChord', label: 'Main Wing Chord (%)', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'boomSpread') {
    return { ...params, boomSpread: Number(clamp(0.18 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.2, 0.18, 0.38).toFixed(2)) };
  }
  if (controlId === 'wingChord') {
    return { ...params, wingChord: Number(clamp(0.26 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.26, 0.26, 0.52).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.wingChord !== undefined ? Number(params.wingChord) : 0.38;
  const next = cur + 0.09 > 0.52 + 0.001 ? 0.26 : Number((cur + 0.09).toFixed(2));
  return { ...params, wingChord: next };
}`,
  },

  {
    id: 'drone-tilt-wing-vtol',
    name: 'Drone Frame: Tilt-Wing 4-Motor VTOL',
    category: 'Drone Parts & Frames',
    description: 'Rotating main wing spar carrying 4 tractor motor nacelles paired with a rear V-tail empennage.',
    iconName: 'Plane',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust main wing position y or wing motor nacelles; click in Preview Mode to cycle wing motor nacelles.',
    defaultParams: {
      label: 'Tilt-Wing VTOL',
      wingY: 0.32,
      nacelles: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Tilt-Wing VTOL' },
      { key: 'wingY', label: 'Main Wing Position Y', type: 'number', min: 0.1, max: 0.6, step: 0.01, defaultValue: 0.32 },
      { key: 'nacelles', label: 'Wing Motor Nacelles', type: 'number', min: 2, max: 4, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Frame: Tilt-Wing 4-Motor VTOL (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const tilt = clamp(Number(params.wingY) || 0.32, 0.1, 0.6);
      const motors = clamp(Math.round(Number(params.nacelles) || 4), 2, 4);
      const span = width * 0.44, wH = 14 + tilt * 18;
      const paths = [
        { d: roundRect(cx - 12, height * 0.14, 24, height * 0.72, 10), closed: true, fill: true },
        { d: roundRect(cx - span, cy - wH / 2, span * 2, wH, 4), closed: true, fill: true },
        { d: polygon([[cx - 28, height * 0.82], [cx + 28, height * 0.82], [cx + 22, height * 0.88], [cx - 22, height * 0.88]]), closed: true, fill: true },
      ];
      for (let i = 0; i < motors; i++) {
        const mx = cx - span * 0.78 + (i * span * 1.56) / Math.max(1, motors - 1);
        if (Math.abs(mx - cx) < 12) continue;
        paths.push({ d: roundRect(mx - 6, cy - wH / 2 - 8, 12, wH + 12, 3), closed: true });
        paths.push({ d: ellipse(mx, cy - wH / 2 - 10, 14, 4 + tilt * 8), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.wingY !== undefined ? Number(params.wingY) : 0.32;
  const v2 = params.nacelles !== undefined ? Number(params.nacelles) : 4;
  const p1Norm = (clamp(v1, 0.1, 0.6) - 0.1) / Math.max(0.0001, 0.5);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'wingY', label: 'Main Wing Position Y', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'nacelles', label: 'Wing Motor Nacelles', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'wingY') {
    return { ...params, wingY: Number(clamp(0.1 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.5, 0.1, 0.6).toFixed(2)) };
  }
  if (controlId === 'nacelles') {
    return { ...params, nacelles: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.nacelles !== undefined ? Math.round(Number(params.nacelles)) : 4;
  return { ...params, nacelles: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-flying-wing-fpv',
    name: 'Drone Frame: Swept Delta FPV Wing',
    category: 'Drone Parts & Frames',
    description: 'Aerodynamic swept-back FPV flying wing with center avionics bay, elevon flaps, winglets, and rear pusher prop.',
    iconName: 'Send',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust wing sweep depth or wing equipment bays; click in Preview Mode to cycle wing equipment bays.',
    defaultParams: {
      label: 'Swept FPV Wing',
      sweep: 0.46,
      bays: 0.22,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Swept FPV Wing' },
      { key: 'sweep', label: 'Wing Sweep Depth', type: 'number', min: 0.26, max: 0.66, step: 0.01, defaultValue: 0.46 },
      { key: 'bays', label: 'Wing Equipment Bays', type: 'number', min: 0.12, max: 0.34, step: 0.01, defaultValue: 0.22 },
    ],
    jsSourceCode: `// Drone Frame: Swept Delta FPV Wing (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, noseY = height * 0.18;
      const sweep = clamp(Number(params.sweep) || 0.46, 0.26, 0.66) * height;
      const chord = clamp(Number(params.bays) || 0.22, 0.12, 0.34) * height;
      const span = width * 0.45;
      return [
        { d: polygon([[cx, noseY], [cx + span, noseY + sweep], [cx + span, noseY + sweep + chord], [cx + 16, noseY + chord * 1.45], [cx - 16, noseY + chord * 1.45], [cx - span, noseY + sweep + chord], [cx - span, noseY + sweep]]), closed: true, fill: true },
        { d: roundRect(cx - 12, noseY + 8, 24, chord * 1.15, 6), closed: true },
        { d: ellipse(cx, noseY + chord * 1.52, 18, 4), closed: true },
        { d: line(cx - span, noseY + sweep, cx - span, noseY + sweep + chord + 8), strokeWidth: 3 },
        { d: line(cx + span, noseY + sweep, cx + span, noseY + sweep + chord + 8), strokeWidth: 3 },
      ];
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.sweep !== undefined ? Number(params.sweep) : 0.46;
  const v2 = params.bays !== undefined ? Number(params.bays) : 0.22;
  const p1Norm = (clamp(v1, 0.26, 0.66) - 0.26) / Math.max(0.0001, 0.4);
  const p2Norm = (clamp(v2, 0.12, 0.34) - 0.12) / Math.max(0.0001, 0.22);
  return [
    { id: 'sweep', label: 'Wing Sweep Depth', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'bays', label: 'Wing Equipment Bays', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'sweep') {
    return { ...params, sweep: Number(clamp(0.26 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.4, 0.26, 0.66).toFixed(2)) };
  }
  if (controlId === 'bays') {
    return { ...params, bays: Number(clamp(0.12 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.22, 0.12, 0.34).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.bays !== undefined ? Number(params.bays) : 0.22;
  const next = cur + 0.07 > 0.34 + 0.001 ? 0.12 : Number((cur + 0.07).toFixed(2));
  return { ...params, bays: next };
}`,
  },

  {
    id: 'drone-twin-tractor-fixed-wing',
    name: 'Drone Frame: Twin-Tractor Mapping Plane',
    category: 'Drone Parts & Frames',
    description: 'Long-endurance photogrammetry mapping plane with high-aspect wing, twin tractor pods, and belly nadir camera.',
    iconName: 'Plane',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust twin engine spacing or belly camera port; click in Preview Mode to cycle belly camera port.',
    defaultParams: {
      label: 'Twin-Tractor UAV',
      nacelleSpan: 0.88,
      camPort: 0.44,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Twin-Tractor UAV' },
      { key: 'nacelleSpan', label: 'Twin Engine Spacing', type: 'number', min: 0.68, max: 0.96, step: 0.01, defaultValue: 0.88 },
      { key: 'camPort', label: 'Belly Camera Port', type: 'number', min: 0.26, max: 0.64, step: 0.01, defaultValue: 0.44 },
    ],
    jsSourceCode: `// Drone Frame: Twin-Tractor Mapping Plane (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height * 0.44;
      const span = clamp(Number(params.nacelleSpan) || 0.88, 0.68, 0.96) * (width / 2);
      const podX = clamp(Number(params.camPort) || 0.44, 0.26, 0.64) * span;
      return [
        { d: roundRect(cx - span, cy - 10, span * 2, 20, 4), closed: true, fill: true },
        { d: roundRect(cx - 12, height * 0.14, 24, height * 0.72, 10), closed: true, fill: true },
        { d: roundRect(cx - podX - 7, cy - 18, 14, 28, 4), closed: true, fill: true },
        { d: roundRect(cx + podX - 7, cy - 18, 14, 28, 4), closed: true, fill: true },
        { d: ellipse(cx - podX, cy - 20, 16, 4), closed: true },
        { d: ellipse(cx + podX, cy - 20, 16, 4), closed: true },
        { d: polygon([[cx, height * 0.76], [cx + 32, height * 0.86], [cx, height * 0.84], [cx - 32, height * 0.86]]), closed: true, fill: true },
      ];
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.nacelleSpan !== undefined ? Number(params.nacelleSpan) : 0.88;
  const v2 = params.camPort !== undefined ? Number(params.camPort) : 0.44;
  const p1Norm = (clamp(v1, 0.68, 0.96) - 0.68) / Math.max(0.0001, 0.28);
  const p2Norm = (clamp(v2, 0.26, 0.64) - 0.26) / Math.max(0.0001, 0.38);
  return [
    { id: 'nacelleSpan', label: 'Twin Engine Spacing', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'camPort', label: 'Belly Camera Port', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'nacelleSpan') {
    return { ...params, nacelleSpan: Number(clamp(0.68 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.28, 0.68, 0.96).toFixed(2)) };
  }
  if (controlId === 'camPort') {
    return { ...params, camPort: Number(clamp(0.26 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.38, 0.26, 0.64).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.camPort !== undefined ? Number(params.camPort) : 0.44;
  const next = cur + 0.13 > 0.64 + 0.001 ? 0.26 : Number((cur + 0.13).toFixed(2));
  return { ...params, camPort: next };
}`,
  },

  {
    id: 'drone-canard-pusher-uav',
    name: 'Drone Frame: Canard Long-Endurance UAV',
    category: 'Drone Parts & Frames',
    description: 'Forward canard foreplane configuration with aft swept main wing, winglets, and tail pusher propeller.',
    iconName: 'Plane',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust forward canard span or main wing sweep; click in Preview Mode to cycle main wing sweep.',
    defaultParams: {
      label: 'Canard Pusher UAV',
      canardSpan: 0.42,
      wingSweep: 0.68,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Canard Pusher UAV' },
      { key: 'canardSpan', label: 'Forward Canard Span', type: 'number', min: 0.26, max: 0.62, step: 0.01, defaultValue: 0.42 },
      { key: 'wingSweep', label: 'Main Wing Sweep', type: 'number', min: 0.54, max: 0.8, step: 0.01, defaultValue: 0.68 },
    ],
    jsSourceCode: `// Drone Frame: Canard Long-Endurance UAV (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2;
      const canardW = clamp(Number(params.canardSpan) || 0.42, 0.26, 0.62) * (width / 2);
      const mainY = clamp(Number(params.wingSweep) || 0.68, 0.54, 0.8) * height;
      const span = width * 0.44;
      return [
        { d: roundRect(cx - 10, height * 0.12, 20, height * 0.74, 9), closed: true, fill: true },
        { d: polygon([[cx, height * 0.24], [cx + canardW, height * 0.3], [cx + canardW, height * 0.35], [cx - canardW, height * 0.35], [cx - canardW, height * 0.3]]), closed: true, fill: true },
        { d: polygon([[cx, mainY - 22], [cx + span, mainY + 8], [cx + span, mainY + 20], [cx - span, mainY + 20], [cx - span, mainY + 8]]), closed: true, fill: true },
        { d: ellipse(cx, height * 0.88, 16, 4), closed: true },
      ];
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.canardSpan !== undefined ? Number(params.canardSpan) : 0.42;
  const v2 = params.wingSweep !== undefined ? Number(params.wingSweep) : 0.68;
  const p1Norm = (clamp(v1, 0.26, 0.62) - 0.26) / Math.max(0.0001, 0.36);
  const p2Norm = (clamp(v2, 0.54, 0.8) - 0.54) / Math.max(0.0001, 0.26);
  return [
    { id: 'canardSpan', label: 'Forward Canard Span', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'wingSweep', label: 'Main Wing Sweep', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'canardSpan') {
    return { ...params, canardSpan: Number(clamp(0.26 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.36, 0.26, 0.62).toFixed(2)) };
  }
  if (controlId === 'wingSweep') {
    return { ...params, wingSweep: Number(clamp(0.54 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.26, 0.54, 0.8).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.wingSweep !== undefined ? Number(params.wingSweep) : 0.68;
  const next = cur + 0.09 > 0.8 + 0.001 ? 0.54 : Number((cur + 0.09).toFixed(2));
  return { ...params, wingSweep: next };
}`,
  },

  {
    id: 'drone-box-wing-joined-uav',
    name: 'Drone Frame: Prandtl Joined Box-Wing UAV',
    category: 'Drone Parts & Frames',
    description: 'Closed-loop Prandtl box-wing airframe with tandem forward and aft wings joined at wingtip fins.',
    iconName: 'Layers',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust tandem wing gap or propulsor units; click in Preview Mode to cycle propulsor units.',
    defaultParams: {
      label: 'Box-Wing UAV',
      wingGap: 0.46,
      props: 0.84,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Box-Wing UAV' },
      { key: 'wingGap', label: 'Tandem Wing Gap', type: 'number', min: 0.3, max: 0.64, step: 0.01, defaultValue: 0.46 },
      { key: 'props', label: 'Propulsor Units', type: 'number', min: 0.64, max: 0.94, step: 0.01, defaultValue: 0.84 },
    ],
    jsSourceCode: `// Drone Frame: Prandtl Joined Box-Wing UAV (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const gap = clamp(Number(params.wingGap) || 0.46, 0.3, 0.64) * height;
      const span = clamp(Number(params.props) || 0.84, 0.64, 0.94) * (width / 2);
      const y1 = cy - gap / 2, y2 = cy + gap / 2;
      return [
        { d: roundRect(cx - 10, height * 0.12, 20, height * 0.76, 8), closed: true, fill: true },
        { d: polygon([[cx, y1 - 10], [cx + span, y1 + 8], [cx + span, y1 + 18], [cx - span, y1 + 18], [cx - span, y1 + 8]]), closed: true, fill: true },
        { d: polygon([[cx, y2 + 12], [cx + span, y2 - 6], [cx + span, y2 + 4], [cx - span, y2 + 4], [cx - span, y2 - 6]]), closed: true, fill: true },
        { d: roundRect(cx - span - 3, y1 + 8, 6, (y2 - y1) - 4, 2), closed: true, fill: true },
        { d: roundRect(cx + span - 3, y1 + 8, 6, (y2 - y1) - 4, 2), closed: true, fill: true },
      ];
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.wingGap !== undefined ? Number(params.wingGap) : 0.46;
  const v2 = params.props !== undefined ? Number(params.props) : 0.84;
  const p1Norm = (clamp(v1, 0.3, 0.64) - 0.3) / Math.max(0.0001, 0.34);
  const p2Norm = (clamp(v2, 0.64, 0.94) - 0.64) / Math.max(0.0001, 0.3);
  return [
    { id: 'wingGap', label: 'Tandem Wing Gap', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'props', label: 'Propulsor Units', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'wingGap') {
    return { ...params, wingGap: Number(clamp(0.3 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.34, 0.3, 0.64).toFixed(2)) };
  }
  if (controlId === 'props') {
    return { ...params, props: Number(clamp(0.64 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.3, 0.64, 0.94).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.props !== undefined ? Number(params.props) : 0.84;
  const next = cur + 0.1 > 0.94 + 0.001 ? 0.64 : Number((cur + 0.1).toFixed(2));
  return { ...params, props: next };
}`,
  },

  {
    id: 'drone-amphibious-float-quad',
    name: 'Drone Frame: Amphibious Pontoon Quad',
    category: 'Drone Parts & Frames',
    description: 'Waterproof sealed boat hull quadcopter with 4 outrigger arms and twin longitudinal buoyancy pontoons.',
    iconName: 'Anchor',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust pontoon float span or pontoon width (px); click in Preview Mode to cycle pontoon width (px).',
    defaultParams: {
      label: 'Amphibious Quad',
      floatSpan: 0.32,
      floatW: 0.36,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Amphibious Quad' },
      { key: 'floatSpan', label: 'Pontoon Float Span', type: 'number', min: 0.22, max: 0.44, step: 0.01, defaultValue: 0.32 },
      { key: 'floatW', label: 'Pontoon Width (px)', type: 'number', min: 0.24, max: 0.44, step: 0.01, defaultValue: 0.36 },
    ],
    jsSourceCode: `// Drone Frame: Amphibious Pontoon Quad (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2;
      const hullW = clamp(Number(params.floatSpan) || 0.32, 0.22, 0.44) * width;
      const floatX = clamp(Number(params.floatW) || 0.36, 0.24, 0.44) * width;
      const propR = r * 0.22;
      const paths = [
        { d: polygon([[cx, height * 0.14], [cx + hullW / 2, height * 0.32], [cx + hullW * 0.42, height * 0.84], [cx - hullW * 0.42, height * 0.84], [cx - hullW / 2, height * 0.32]]), closed: true, fill: true },
        { d: roundRect(cx - floatX - 7, height * 0.28, 14, height * 0.46, 7), closed: true, fill: true },
        { d: roundRect(cx + floatX - 7, height * 0.28, 14, height * 0.46, 7), closed: true, fill: true },
      ];
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx, sy]) => {
        const mx = cx + sx * floatX, my = cy + sy * height * 0.26;
        paths.push({ d: line(cx, cy, mx, my), strokeWidth: 3.5 });
        paths.push({ d: circle(mx, my, propR), closed: true });
      });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.floatSpan !== undefined ? Number(params.floatSpan) : 0.32;
  const v2 = params.floatW !== undefined ? Number(params.floatW) : 0.36;
  const p1Norm = (clamp(v1, 0.22, 0.44) - 0.22) / Math.max(0.0001, 0.22);
  const p2Norm = (clamp(v2, 0.24, 0.44) - 0.24) / Math.max(0.0001, 0.2);
  return [
    { id: 'floatSpan', label: 'Pontoon Float Span', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'floatW', label: 'Pontoon Width (px)', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'floatSpan') {
    return { ...params, floatSpan: Number(clamp(0.22 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.22, 0.22, 0.44).toFixed(2)) };
  }
  if (controlId === 'floatW') {
    return { ...params, floatW: Number(clamp(0.24 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.2, 0.24, 0.44).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.floatW !== undefined ? Number(params.floatW) : 0.36;
  const next = cur + 0.07 > 0.44 + 0.001 ? 0.24 : Number((cur + 0.07).toFixed(2));
  return { ...params, floatW: next };
}`,
  },

  {
    id: 'drone-coaxial-heli-uav',
    name: 'Drone Frame: Coaxial Counter-Rotating Heli',
    category: 'Drone Parts & Frames',
    description: 'Unmanned coaxial helicopter with streamlined nose pod, tail boom, and counter-rotating 2-blade rotor crosses.',
    iconName: 'Compass',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust main rotor diameter or rotor blade separation; click in Preview Mode to cycle rotor blade separation.',
    defaultParams: {
      label: 'Coaxial Heli UAV',
      rotorSpan: 0.18,
      phaseDeg: 0.34,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Coaxial Heli UAV' },
      { key: 'rotorSpan', label: 'Main Rotor Diameter', type: 'number', min: 0.1, max: 0.28, step: 0.01, defaultValue: 0.18 },
      { key: 'phaseDeg', label: 'Rotor Blade Separation', type: 'number', min: 0.22, max: 0.48, step: 0.01, defaultValue: 0.34 },
    ],
    jsSourceCode: `// Drone Frame: Coaxial Counter-Rotating Heli (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const mastGap = clamp(Number(params.rotorSpan) || 0.18, 0.1, 0.28) * height;
      const bodyW = clamp(Number(params.phaseDeg) || 0.34, 0.22, 0.48) * width;
      const rSpan = width * 0.42, topY = height * 0.16;
      return [
        { d: line(cx, topY, cx, height * 0.82), strokeWidth: 4 },
        { d: ellipse(cx, topY + 4, rSpan, 8), closed: true },
        { d: ellipse(cx, topY + 4 + mastGap, rSpan, 8), closed: true },
        { d: roundRect(cx - bodyW / 2, topY + mastGap + 14, bodyW, height * 0.42, 12), closed: true, fill: true },
        { d: line(cx - bodyW * 0.7, height * 0.84, cx + bodyW * 0.7, height * 0.84), strokeWidth: 3.5 },
        { d: line(cx - bodyW * 0.35, height * 0.74, cx - bodyW * 0.5, height * 0.84), strokeWidth: 2.5 },
        { d: line(cx + bodyW * 0.35, height * 0.74, cx + bodyW * 0.5, height * 0.84), strokeWidth: 2.5 },
      ];
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.rotorSpan !== undefined ? Number(params.rotorSpan) : 0.18;
  const v2 = params.phaseDeg !== undefined ? Number(params.phaseDeg) : 0.34;
  const p1Norm = (clamp(v1, 0.1, 0.28) - 0.1) / Math.max(0.0001, 0.18);
  const p2Norm = (clamp(v2, 0.22, 0.48) - 0.22) / Math.max(0.0001, 0.26);
  return [
    { id: 'rotorSpan', label: 'Main Rotor Diameter', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'phaseDeg', label: 'Rotor Blade Separation', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'rotorSpan') {
    return { ...params, rotorSpan: Number(clamp(0.1 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.18, 0.1, 0.28).toFixed(2)) };
  }
  if (controlId === 'phaseDeg') {
    return { ...params, phaseDeg: Number(clamp(0.22 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.26, 0.22, 0.48).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.phaseDeg !== undefined ? Number(params.phaseDeg) : 0.34;
  const next = cur + 0.09 > 0.48 + 0.001 ? 0.22 : Number((cur + 0.09).toFixed(2));
  return { ...params, phaseDeg: next };
}`,
  },

  {
    id: 'drone-ornithopter-flapping-wing',
    name: 'Drone Frame: Bio-Inspired Flapping Wing',
    category: 'Drone Parts & Frames',
    description: 'Biomimetic flapping-wing micro air vehicle with ribbed membrane wings, crank gearbox nose, and V-tail.',
    iconName: 'Feather',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust wing dihedral sweep or wing rib battens; click in Preview Mode to cycle wing rib battens.',
    defaultParams: {
      label: 'Flapping Ornithopter',
      flapAngle: 0.26,
      battens: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Flapping Ornithopter' },
      { key: 'flapAngle', label: 'Wing Dihedral Sweep', type: 'number', min: -0.35, max: 0.35, step: 0.01, defaultValue: 0.26 },
      { key: 'battens', label: 'Wing Rib Battens', type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Frame: Bio-Inspired Flapping Wing (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height * 0.46;
      const dihedral = clamp((params.flapAngle !== undefined ? Number(params.flapAngle) : 0.26), -0.35, 0.35) * height;
      const ribs = clamp(Math.round(Number(params.battens) || 4), 3, 6);
      const span = width * 0.44, tipY = cy - dihedral;
      const paths = [
        { d: polygon([[cx, cy - 16], [cx + span, tipY], [cx + span * 0.78, cy + 22], [cx, cy + 14], [cx - span * 0.78, cy + 22], [cx - span, tipY]]), closed: true, fill: true },
        { d: roundRect(cx - 7, height * 0.16, 14, height * 0.56, 7), closed: true, fill: true },
        { d: polygon([[cx, height * 0.68], [cx + 22, height * 0.86], [cx - 22, height * 0.86]]), closed: true, fill: true },
      ];
      for (let i = 1; i <= ribs; i++) {
        const rx = (span * i) / (ribs + 1);
        paths.push({ d: line(cx, cy - 8, cx - rx, cy + (tipY - cy) * (i / (ribs + 1)) + 16) });
        paths.push({ d: line(cx, cy - 8, cx + rx, cy + (tipY - cy) * (i / (ribs + 1)) + 16) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.flapAngle !== undefined ? Number(params.flapAngle) : 0.26;
  const v2 = params.battens !== undefined ? Number(params.battens) : 4;
  const p1Norm = (clamp(v1, -0.35, 0.35) - -0.35) / Math.max(0.0001, 0.7);
  const p2Norm = (clamp(v2, 3, 6) - 3) / Math.max(0.0001, 3);
  return [
    { id: 'flapAngle', label: 'Wing Dihedral Sweep', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'battens', label: 'Wing Rib Battens', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'flapAngle') {
    return { ...params, flapAngle: Number(clamp(-0.35 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.7, -0.35, 0.35).toFixed(2)) };
  }
  if (controlId === 'battens') {
    return { ...params, battens: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 3, 6)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.battens !== undefined ? Math.round(Number(params.battens)) : 4;
  return { ...params, battens: ((cur - 3 + 1) % 4) + 3 };
}`,
  },

  {
    id: 'drone-top-plate-slotted',
    name: 'Drone Part: Carbon Top Deck Plate',
    category: 'Drone Parts & Frames',
    description: 'CNC-milled 2mm 3K carbon-fiber top deck plate with LiPo strap slots, weight cutouts, and M3 standoff holes.',
    iconName: 'RectangleHorizontal',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust top plate width ratio or strap slot pairs; click in Preview Mode to cycle strap slot pairs.',
    defaultParams: {
      label: 'Carbon Top Plate',
      plateWidth: 3,
      slots: 8,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Carbon Top Plate' },
      { key: 'plateWidth', label: 'Top Plate Width Ratio', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
      { key: 'slots', label: 'Strap Slot Pairs', type: 'number', min: 6, max: 10, step: 1, defaultValue: 8 },
    ],
    jsSourceCode: `// Drone Part: Carbon Top Deck Plate (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const slots = clamp(Math.round(Number(params.plateWidth) || 3), 2, 4);
      const holes = clamp(Math.round(Number(params.slots) || 8), 6, 10);
      const pW = width * 0.36, pH = height * 0.78;
      const paths = [
        { d: roundRect(cx - pW / 2, cy - pH / 2, pW, pH, 10), closed: true, fill: true },
      ];
      for (let s = 0; s < slots; s++) {
        const sy = cy - pH * 0.34 + (s * pH * 0.68) / Math.max(1, slots - 1);
        paths.push({ d: roundRect(cx - pW * 0.28, sy - 4, pW * 0.56, 8, 3), closed: true });
      }
      const pairs = holes - 4;
      for (let h = 0; h < pairs; h++) {
        const hy = cy - pH * 0.42 + (h * pH * 0.84) / Math.max(1, pairs - 1);
        paths.push({ d: circle(cx - pW * 0.36, hy, 3), closed: true });
        paths.push({ d: circle(cx + pW * 0.36, hy, 3), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.plateWidth !== undefined ? Number(params.plateWidth) : 3;
  const v2 = params.slots !== undefined ? Number(params.slots) : 8;
  const p1Norm = (clamp(v1, 2, 4) - 2) / Math.max(0.0001, 2);
  const p2Norm = (clamp(v2, 6, 10) - 6) / Math.max(0.0001, 4);
  return [
    { id: 'plateWidth', label: 'Top Plate Width Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'slots', label: 'Strap Slot Pairs', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'plateWidth') {
    return { ...params, plateWidth: Math.round(clamp(2 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 2, 2, 4)) };
  }
  if (controlId === 'slots') {
    return { ...params, slots: Math.round(clamp(6 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 6, 10)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.slots !== undefined ? Math.round(Number(params.slots)) : 8;
  return { ...params, slots: ((cur - 6 + 1) % 5) + 6 };
}`,
  },

  {
    id: 'drone-bottom-main-plate',
    name: 'Drone Part: Main Bottom Chassis Plate',
    category: 'Drone Parts & Frames',
    description: '3mm carbon-fiber bottom chassis plate with X-arm root shoulders, press-nut holes, and 30×30 stack grid.',
    iconName: 'Layers',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust arm shoulder span or weight relief pockets; click in Preview Mode to cycle weight relief pockets.',
    defaultParams: {
      label: 'Main Bottom Plate',
      shoulderW: 8,
      pockets: 0.28,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Main Bottom Plate' },
      { key: 'shoulderW', label: 'Arm Shoulder Span', type: 'number', min: 4, max: 8, step: 1, defaultValue: 8 },
      { key: 'pockets', label: 'Weight Relief Pockets', type: 'number', min: 0.18, max: 0.38, step: 0.01, defaultValue: 0.28 },
    ],
    jsSourceCode: `// Drone Part: Main Bottom Chassis Plate (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const pressNuts = clamp(Math.round(Number(params.shoulderW) || 8), 4, 8);
      const stackS = clamp(Number(params.pockets) || 0.28, 0.18, 0.38) * Math.min(width, height);
      const pW = width * 0.44, pH = height * 0.78;
      const paths = [
        { d: polygon([[cx - pW * 0.38, cy - pH / 2], [cx + pW * 0.38, cy - pH / 2], [cx + pW * 0.55, cy - pH * 0.22], [cx + pW * 0.36, cy], [cx + pW * 0.55, cy + pH * 0.22], [cx + pW * 0.38, cy + pH / 2], [cx - pW * 0.38, cy + pH / 2], [cx - pW * 0.55, cy + pH * 0.22], [cx - pW * 0.36, cy], [cx - pW * 0.55, cy - pH * 0.22]]), closed: true, fill: true },
        { d: rect(cx - stackS / 2, cy - stackS / 2, stackS, stackS), closed: true, strokeDasharray: '3 2' },
      ];
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx, sy]) => {
        paths.push({ d: circle(cx + sx * stackS / 2, cy + sy * stackS / 2, 3), closed: true });
      });
      for (let i = 0; i < pressNuts; i++) {
        const a = (i * Math.PI * 2) / pressNuts;
        paths.push({ d: circle(cx + Math.cos(a) * pW * 0.36, cy + Math.sin(a) * pH * 0.34, 3.5), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.shoulderW !== undefined ? Number(params.shoulderW) : 8;
  const v2 = params.pockets !== undefined ? Number(params.pockets) : 0.28;
  const p1Norm = (clamp(v1, 4, 8) - 4) / Math.max(0.0001, 4);
  const p2Norm = (clamp(v2, 0.18, 0.38) - 0.18) / Math.max(0.0001, 0.2);
  return [
    { id: 'shoulderW', label: 'Arm Shoulder Span', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'pockets', label: 'Weight Relief Pockets', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'shoulderW') {
    return { ...params, shoulderW: Math.round(clamp(4 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 4, 4, 8)) };
  }
  if (controlId === 'pockets') {
    return { ...params, pockets: Number(clamp(0.18 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.2, 0.18, 0.38).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.pockets !== undefined ? Number(params.pockets) : 0.28;
  const next = cur + 0.07 > 0.38 + 0.001 ? 0.18 : Number((cur + 0.07).toFixed(2));
  return { ...params, pockets: next };
}`,
  },

  {
    id: 'drone-x-brace-reinforcement',
    name: 'Drone Part: Carbon X-Brace Stiffener',
    category: 'Drone Parts & Frames',
    description: '4-arm central cross reinforcement plate bolted across arm roots to eliminate frame resonance.',
    iconName: 'X',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust stiffener arm width or center lightening bore; click in Preview Mode to cycle center lightening bore.',
    defaultParams: {
      label: 'Carbon X-Brace',
      armWidth: 0.22,
      boreSize: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Carbon X-Brace' },
      { key: 'armWidth', label: 'Stiffener Arm Width', type: 'number', min: 0.14, max: 0.34, step: 0.01, defaultValue: 0.22 },
      { key: 'boreSize', label: 'Center Lightening Bore', type: 'number', min: 4, max: 8, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: Carbon X-Brace Stiffener (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.42;
      const thick = clamp(Number(params.armWidth) || 0.22, 0.14, 0.34) * r;
      const holes = clamp(Math.round(Number(params.boreSize) || 4), 4, 8);
      const paths = [
        { d: polygon([[cx - r, cy - r + thick], [cx - r + thick, cy - r], [cx, cy - thick], [cx + r - thick, cy - r], [cx + r, cy - r + thick], [cx + thick, cy], [cx + r, cy + r - thick], [cx + r - thick, cy + r], [cx, cy + thick], [cx - r + thick, cy + r], [cx - r, cy + r - thick], [cx - thick, cy]]), closed: true, fill: true },
        { d: circle(cx, cy, thick * 0.7), closed: true },
      ];
      for (let i = 0; i < holes; i++) {
        const a = (i * Math.PI * 2) / holes + Math.PI / 4;
        paths.push({ d: circle(cx + Math.cos(a) * r * 0.76, cy + Math.sin(a) * r * 0.76, 3.5), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.armWidth !== undefined ? Number(params.armWidth) : 0.22;
  const v2 = params.boreSize !== undefined ? Number(params.boreSize) : 4;
  const p1Norm = (clamp(v1, 0.14, 0.34) - 0.14) / Math.max(0.0001, 0.2);
  const p2Norm = (clamp(v2, 4, 8) - 4) / Math.max(0.0001, 4);
  return [
    { id: 'armWidth', label: 'Stiffener Arm Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'boreSize', label: 'Center Lightening Bore', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'armWidth') {
    return { ...params, armWidth: Number(clamp(0.14 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.2, 0.14, 0.34).toFixed(2)) };
  }
  if (controlId === 'boreSize') {
    return { ...params, boreSize: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 4, 8)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.boreSize !== undefined ? Math.round(Number(params.boreSize)) : 4;
  return { ...params, boreSize: ((cur - 4 + 1) % 5) + 4 };
}`,
  },

  {
    id: 'drone-side-camera-plates',
    name: 'Drone Part: CNC Side Camera Cage Plates',
    category: 'Drone Parts & Frames',
    description: 'Pair of vertical carbon camera side plates with curved camera-tilt adjustment slot and standoff holes.',
    iconName: 'Columns',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust left/right plate gap or ventilation cutouts; click in Preview Mode to cycle ventilation cutouts.',
    defaultParams: {
      label: 'Side Cam Plates',
      plateGap: 0.34,
      vents: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Side Cam Plates' },
      { key: 'plateGap', label: 'Left/Right Plate Gap', type: 'number', min: 0.2, max: 0.5, step: 0.01, defaultValue: 0.34 },
      { key: 'vents', label: 'Ventilation Cutouts', type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: CNC Side Camera Cage Plates (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const arcR = clamp(Number(params.plateGap) || 0.34, 0.2, 0.5) * height;
      const vents = clamp(Math.round(Number(params.vents) || 3), 2, 5);
      const pW = width * 0.32, pH = height * 0.64;
      const paths = [];
      [-1, 1].forEach((side) => {
        const ox = cx + side * (width * 0.22) - pW / 2;
        paths.push({ d: roundRect(ox, cy - pH / 2, pW, pH, 8), closed: true, fill: true });
        paths.push({ d: \`M \${ox + pW * 0.22} \${cy - arcR * 0.45} A \${arcR} \${arcR} 0 0 1 \${ox + pW * 0.22} \${cy + arcR * 0.45}\`, strokeWidth: 2.5 });
        for (let v = 0; v < vents; v++) {
          const vy = cy - pH * 0.28 + (v * pH * 0.56) / Math.max(1, vents - 1);
          paths.push({ d: roundRect(ox + pW * 0.52, vy - 3, pW * 0.3, 6, 2), closed: true });
        }
      });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.plateGap !== undefined ? Number(params.plateGap) : 0.34;
  const v2 = params.vents !== undefined ? Number(params.vents) : 3;
  const p1Norm = (clamp(v1, 0.2, 0.5) - 0.2) / Math.max(0.0001, 0.3);
  const p2Norm = (clamp(v2, 2, 5) - 2) / Math.max(0.0001, 3);
  return [
    { id: 'plateGap', label: 'Left/Right Plate Gap', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'vents', label: 'Ventilation Cutouts', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'plateGap') {
    return { ...params, plateGap: Number(clamp(0.2 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.3, 0.2, 0.5).toFixed(2)) };
  }
  if (controlId === 'vents') {
    return { ...params, vents: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 2, 5)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.vents !== undefined ? Math.round(Number(params.vents)) : 3;
  return { ...params, vents: ((cur - 2 + 1) % 4) + 2 };
}`,
  },

  {
    id: 'drone-cnc-aluminum-cam-cage',
    name: 'Drone Part: 7075 Aluminum Camera Cage',
    category: 'Drone Parts & Frames',
    description: 'Machined 7075-T6 billet aluminum protective FPV camera cage with lens guard bars and M2 pivot bosses.',
    iconName: 'Box',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust cage wall thickness or top heatsink ribs; click in Preview Mode to cycle top heatsink ribs.',
    defaultParams: {
      label: '7075 Al Cam Cage',
      wallThick: 0.54,
      ribs: 2,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '7075 Al Cam Cage' },
      { key: 'wallThick', label: 'Cage Wall Thickness', type: 'number', min: 0.36, max: 0.74, step: 0.01, defaultValue: 0.54 },
      { key: 'ribs', label: 'Top Heatsink Ribs', type: 'number', min: 2, max: 4, step: 1, defaultValue: 2 },
    ],
    jsSourceCode: `// Drone Part: 7075 Aluminum Camera Cage (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const cageW = clamp(Number(params.wallThick) || 0.54, 0.36, 0.74) * width;
      const bars = clamp(Math.round(Number(params.ribs) || 2), 2, 4);
      const cH = height * 0.64, wall = 12;
      const paths = [
        { d: roundRect(cx - cageW / 2, cy - cH / 2, wall, cH, 4), closed: true, fill: true },
        { d: roundRect(cx + cageW / 2 - wall, cy - cH / 2, wall, cH, 4), closed: true, fill: true },
        { d: circle(cx, cy, Math.min(cageW, cH) * 0.24), closed: true, strokeDasharray: '4 3' },
      ];
      for (let b = 0; b < bars; b++) {
        const by = cy - cH * 0.38 + (b * cH * 0.76) / Math.max(1, bars - 1);
        paths.push({ d: line(cx - cageW / 2 + wall, by, cx + cageW / 2 - wall, by), strokeWidth: 4 });
        paths.push({ d: circle(cx - cageW / 2 + wall / 2, by, 2.5), closed: true });
        paths.push({ d: circle(cx + cageW / 2 - wall / 2, by, 2.5), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.wallThick !== undefined ? Number(params.wallThick) : 0.54;
  const v2 = params.ribs !== undefined ? Number(params.ribs) : 2;
  const p1Norm = (clamp(v1, 0.36, 0.74) - 0.36) / Math.max(0.0001, 0.38);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'wallThick', label: 'Cage Wall Thickness', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'ribs', label: 'Top Heatsink Ribs', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'wallThick') {
    return { ...params, wallThick: Number(clamp(0.36 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.38, 0.36, 0.74).toFixed(2)) };
  }
  if (controlId === 'ribs') {
    return { ...params, ribs: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.ribs !== undefined ? Math.round(Number(params.ribs)) : 2;
  return { ...params, ribs: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-knurled-standoff-spacer',
    name: 'Drone Part: Knurled Aluminum Standoff',
    category: 'Drone Parts & Frames',
    description: 'Textured diamond-knurled M3 cylindrical aluminum standoff spacer with chamfered ends and internal threads.',
    iconName: 'AlignCenterVertical',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust standoff diameter or knurl crosshatch bands; click in Preview Mode to cycle knurl crosshatch bands.',
    defaultParams: {
      label: 'M3 Knurled Standoff',
      diamRatio: 0.26,
      knurls: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'M3 Knurled Standoff' },
      { key: 'diamRatio', label: 'Standoff Diameter', type: 'number', min: 0.16, max: 0.42, step: 0.01, defaultValue: 0.26 },
      { key: 'knurls', label: 'Knurl Crosshatch Bands', type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: Knurled Aluminum Standoff (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const sW = clamp(Number(params.diamRatio) || 0.26, 0.16, 0.42) * width;
      const bands = clamp(Math.round(Number(params.knurls) || 3), 2, 5);
      const sH = height * 0.74;
      const paths = [
        { d: roundRect(cx - sW / 2, cy - sH / 2, sW, sH, 4), closed: true, fill: true },
        { d: ellipse(cx, cy - sH / 2, sW * 0.28, 4), closed: true },
      ];
      for (let b = 0; b < bands; b++) {
        const by = cy - sH * 0.34 + (b * sH * 0.68) / Math.max(1, bands - 1) - 6;
        paths.push({ d: rect(cx - sW / 2, by, sW, 12), closed: true });
        paths.push({ d: line(cx - sW * 0.3, by, cx + sW * 0.3, by + 12) });
        paths.push({ d: line(cx + sW * 0.3, by, cx - sW * 0.3, by + 12) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.diamRatio !== undefined ? Number(params.diamRatio) : 0.26;
  const v2 = params.knurls !== undefined ? Number(params.knurls) : 3;
  const p1Norm = (clamp(v1, 0.16, 0.42) - 0.16) / Math.max(0.0001, 0.26);
  const p2Norm = (clamp(v2, 2, 5) - 2) / Math.max(0.0001, 3);
  return [
    { id: 'diamRatio', label: 'Standoff Diameter', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'knurls', label: 'Knurl Crosshatch Bands', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'diamRatio') {
    return { ...params, diamRatio: Number(clamp(0.16 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.26, 0.16, 0.42).toFixed(2)) };
  }
  if (controlId === 'knurls') {
    return { ...params, knurls: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 2, 5)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.knurls !== undefined ? Math.round(Number(params.knurls)) : 3;
  return { ...params, knurls: ((cur - 2 + 1) % 4) + 2 };
}`,
  },

  {
    id: 'drone-silicone-grommet-damper',
    name: 'Drone Part: Soft-Mount Silicone Grommet',
    category: 'Drone Parts & Frames',
    description: 'Hourglass-waisted silicone vibration-damping flight controller gummy with central M3 through-bore.',
    iconName: 'CircleDot',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust hourglass waist ratio or center bore radius; click in Preview Mode to cycle center bore radius.',
    defaultParams: {
      label: 'Silicone FC Grommet',
      waistRatio: 0.64,
      boreR: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Silicone FC Grommet' },
      { key: 'waistRatio', label: 'Hourglass Waist Ratio', type: 'number', min: 0.45, max: 0.84, step: 0.01, defaultValue: 0.64 },
      { key: 'boreR', label: 'Center Bore Radius', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: Soft-Mount Silicone Grommet (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const waist = clamp(Number(params.waistRatio) || 0.64, 0.45, 0.84);
      const ribs = clamp(Math.round(Number(params.boreR) || 3), 2, 4);
      const gW = width * 0.56, gH = height * 0.66, wW = gW * waist;
      const paths = [
        { d: polygon([[cx - gW / 2, cy - gH / 2], [cx + gW / 2, cy - gH / 2], [cx + gW / 2, cy - gH * 0.18], [cx + wW / 2, cy - gH * 0.08], [cx + wW / 2, cy + gH * 0.08], [cx + gW / 2, cy + gH * 0.18], [cx + gW / 2, cy + gH / 2], [cx - gW / 2, cy + gH / 2], [cx - gW / 2, cy + gH * 0.18], [cx - wW / 2, cy + gH * 0.08], [cx - wW / 2, cy - gH * 0.08], [cx - gW / 2, cy - gH * 0.18]]), closed: true, fill: true },
        { d: rect(cx - gW * 0.14, cy - gH / 2, gW * 0.28, gH), closed: true },
      ];
      for (let i = 1; i <= ribs; i++) {
        const ry = (gH * 0.42 * i) / (ribs + 1);
        paths.push({ d: line(cx - gW * 0.44, cy - ry, cx + gW * 0.44, cy - ry) });
        paths.push({ d: line(cx - gW * 0.44, cy + ry, cx + gW * 0.44, cy + ry) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.waistRatio !== undefined ? Number(params.waistRatio) : 0.64;
  const v2 = params.boreR !== undefined ? Number(params.boreR) : 3;
  const p1Norm = (clamp(v1, 0.45, 0.84) - 0.45) / Math.max(0.0001, 0.39);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'waistRatio', label: 'Hourglass Waist Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'boreR', label: 'Center Bore Radius', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'waistRatio') {
    return { ...params, waistRatio: Number(clamp(0.45 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.39, 0.45, 0.84).toFixed(2)) };
  }
  if (controlId === 'boreR') {
    return { ...params, boreR: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.boreR !== undefined ? Math.round(Number(params.boreR)) : 3;
  return { ...params, boreR: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-press-nut-plate-insert',
    name: 'Drone Part: Steel Press-Nut Flange',
    category: 'Drone Parts & Frames',
    description: 'Flush captive steel press-nut with serrated knurled outer grip ring and internal M3 thread.',
    iconName: 'Disc',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust thread bore ratio or knurl serrations; click in Preview Mode to cycle knurl serrations.',
    defaultParams: {
      label: 'M3 Press-Nut',
      innerRatio: 0.8,
      teeth: 12,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'M3 Press-Nut' },
      { key: 'innerRatio', label: 'Thread Bore Ratio', type: 'number', min: 0.62, max: 0.92, step: 0.01, defaultValue: 0.8 },
      { key: 'teeth', label: 'Knurl Serrations', type: 'number', min: 8, max: 16, step: 1, defaultValue: 12 },
    ],
    jsSourceCode: `// Drone Part: Steel Press-Nut Flange (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.42;
      const flangeR = clamp(Number(params.innerRatio) || 0.8, 0.62, 0.92) * r;
      const teeth = clamp(Math.round(Number(params.teeth) || 12), 8, 16);
      const knurlR = flangeR * 0.72;
      const pts = [];
      for (let i = 0; i < teeth * 2; i++) {
        const a = (i * Math.PI) / teeth;
        const rad = i % 2 === 0 ? knurlR : knurlR * 0.88;
        pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
      }
      return [
        { d: circle(cx, cy, flangeR), closed: true, fill: true },
        { d: polygon(pts), closed: true },
        { d: circle(cx, cy, flangeR * 0.38), closed: true },
        { d: circle(cx, cy, flangeR * 0.28), closed: true, strokeDasharray: '3 2' },
      ];
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.innerRatio !== undefined ? Number(params.innerRatio) : 0.8;
  const v2 = params.teeth !== undefined ? Number(params.teeth) : 12;
  const p1Norm = (clamp(v1, 0.62, 0.92) - 0.62) / Math.max(0.0001, 0.3);
  const p2Norm = (clamp(v2, 8, 16) - 8) / Math.max(0.0001, 8);
  return [
    { id: 'innerRatio', label: 'Thread Bore Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'teeth', label: 'Knurl Serrations', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'innerRatio') {
    return { ...params, innerRatio: Number(clamp(0.62 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.3, 0.62, 0.92).toFixed(2)) };
  }
  if (controlId === 'teeth') {
    return { ...params, teeth: Math.round(clamp(8 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 8, 8, 16)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.teeth !== undefined ? Math.round(Number(params.teeth)) : 12;
  return { ...params, teeth: ((cur - 8 + 1) % 9) + 8 };
}`,
  },

  {
    id: 'drone-folding-arm-hinge',
    name: 'Drone Part: CNC Folding Arm Hinge Joint',
    category: 'Drone Parts & Frames',
    description: 'Anodized CNC aluminum folding boom joint with central pivot pin and spring-loaded locking collar.',
    iconName: 'GitCommit',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust locking collar width or clamp bolts per side; click in Preview Mode to cycle clamp bolts per side.',
    defaultParams: {
      label: 'Folding Arm Hinge',
      collarW: 0.42,
      bolts: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Folding Arm Hinge' },
      { key: 'collarW', label: 'Locking Collar Width', type: 'number', min: 0.28, max: 0.56, step: 0.01, defaultValue: 0.42 },
      { key: 'bolts', label: 'Clamp Bolts per Side', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: CNC Folding Arm Hinge Joint (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const collarL = clamp(Number(params.collarW) || 0.42, 0.28, 0.56) * width;
      const bolts = clamp(Math.round(Number(params.bolts) || 3), 2, 4);
      const hH = height * 0.46;
      const paths = [
        { d: roundRect(width * 0.08, cy - hH * 0.36, width * 0.84, hH * 0.72, 6), closed: true, fill: true },
        { d: roundRect(cx - collarL / 2, cy - hH / 2, collarL, hH, 8), closed: true, fill: true },
        { d: circle(cx, cy - hH * 0.28, 5), closed: true },
        { d: circle(cx, cy + hH * 0.28, 6), closed: true },
      ];
      for (let b = 0; b < bolts; b++) {
        const bx = cx - collarL * 0.36 + (b * collarL * 0.72) / Math.max(1, bolts - 1);
        paths.push({ d: line(bx, cy - hH / 2, bx, cy - hH / 2 - 8), strokeWidth: 2 });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.collarW !== undefined ? Number(params.collarW) : 0.42;
  const v2 = params.bolts !== undefined ? Number(params.bolts) : 3;
  const p1Norm = (clamp(v1, 0.28, 0.56) - 0.28) / Math.max(0.0001, 0.28);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'collarW', label: 'Locking Collar Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'bolts', label: 'Clamp Bolts per Side', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'collarW') {
    return { ...params, collarW: Number(clamp(0.28 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.28, 0.28, 0.56).toFixed(2)) };
  }
  if (controlId === 'bolts') {
    return { ...params, bolts: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.bolts !== undefined ? Math.round(Number(params.bolts)) : 3;
  return { ...params, bolts: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-carbon-boom-clamp',
    name: 'Drone Part: Split Carbon Tube Clamp',
    category: 'Drone Parts & Frames',
    description: 'Two-piece split saddle block clamp for 16mm/25mm round carbon-fiber booms with M3 pinch bolts.',
    iconName: 'Circle',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust tube bore diameter or bolt flange width; click in Preview Mode to cycle bolt flange width.',
    defaultParams: {
      label: 'Tube Boom Clamp',
      boreRatio: 0.48,
      ears: 2,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Tube Boom Clamp' },
      { key: 'boreRatio', label: 'Tube Bore Diameter', type: 'number', min: 0.3, max: 0.65, step: 0.01, defaultValue: 0.48 },
      { key: 'ears', label: 'Bolt Flange Width', type: 'number', min: 1, max: 2, step: 1, defaultValue: 2 },
    ],
    jsSourceCode: `// Drone Part: Split Carbon Tube Clamp (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.38;
      const boreR = clamp(Number(params.boreRatio) || 0.48, 0.3, 0.65) * r;
      const ears = clamp(Math.round(Number(params.ears) || 2), 1, 2);
      const paths = [
        { d: roundRect(cx - r * 1.25, cy - r * 0.85, r * 2.5, r * 1.7, 10), closed: true, fill: true },
        { d: line(cx - r * 1.25, cy, cx + r * 1.25, cy), strokeWidth: 2 },
        { d: circle(cx, cy, boreR), closed: true },
        { d: circle(cx, cy, boreR * 0.82), closed: true, strokeDasharray: '4 2' },
        { d: circle(cx + r * 0.92, cy - r * 0.42, 4), closed: true },
        { d: circle(cx + r * 0.92, cy + r * 0.42, 4), closed: true },
      ];
      if (ears === 2) {
        paths.push({ d: circle(cx - r * 0.92, cy - r * 0.42, 4), closed: true });
        paths.push({ d: circle(cx - r * 0.92, cy + r * 0.42, 4), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.boreRatio !== undefined ? Number(params.boreRatio) : 0.48;
  const v2 = params.ears !== undefined ? Number(params.ears) : 2;
  const p1Norm = (clamp(v1, 0.3, 0.65) - 0.3) / Math.max(0.0001, 0.35);
  const p2Norm = (clamp(v2, 1, 2) - 1) / Math.max(0.0001, 1);
  return [
    { id: 'boreRatio', label: 'Tube Bore Diameter', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'ears', label: 'Bolt Flange Width', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'boreRatio') {
    return { ...params, boreRatio: Number(clamp(0.3 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.35, 0.3, 0.65).toFixed(2)) };
  }
  if (controlId === 'ears') {
    return { ...params, ears: Math.round(clamp(1 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 1, 1, 2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.ears !== undefined ? Math.round(Number(params.ears)) : 2;
  return { ...params, ears: ((cur - 1 + 1) % 2) + 1 };
}`,
  },

  {
    id: 'drone-motor-mount-pod-tube',
    name: 'Drone Part: Tube-Arm Motor Mount Pod',
    category: 'Drone Parts & Frames',
    description: 'Clamp-on teardrop composite motor mount pod for tubular hex/octo booms with multi-slot motor bolt pattern.',
    iconName: 'Cpu',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust tube clamp collar or motor bolt slots; click in Preview Mode to cycle motor bolt slots.',
    defaultParams: {
      label: 'Tube Motor Mount',
      collarLen: 0.9,
      slots: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Tube Motor Mount' },
      { key: 'collarLen', label: 'Tube Clamp Collar', type: 'number', min: 0.68, max: 1.05, step: 0.01, defaultValue: 0.9 },
      { key: 'slots', label: 'Motor Bolt Slots', type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: Tube-Arm Motor Mount Pod (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width * 0.56, cy = height / 2, r = Math.min(width, height) * 0.36;
      const podR = clamp(Number(params.collarLen) || 0.9, 0.68, 1.05) * r;
      const slots = clamp(Math.round(Number(params.slots) || 4), 3, 6);
      const paths = [
        { d: roundRect(width * 0.08, cy - podR * 0.42, cx - width * 0.08, podR * 0.84, 6), closed: true, fill: true },
        { d: circle(cx, cy, podR), closed: true, fill: true },
        { d: circle(cx, cy, podR * 0.24), closed: true },
      ];
      for (let s = 0; s < slots; s++) {
        const a = (s * Math.PI * 2) / slots;
        paths.push({ d: line(cx + Math.cos(a) * podR * 0.42, cy + Math.sin(a) * podR * 0.42, cx + Math.cos(a) * podR * 0.78, cy + Math.sin(a) * podR * 0.78), strokeWidth: 3 });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.collarLen !== undefined ? Number(params.collarLen) : 0.9;
  const v2 = params.slots !== undefined ? Number(params.slots) : 4;
  const p1Norm = (clamp(v1, 0.68, 1.05) - 0.68) / Math.max(0.0001, 0.37);
  const p2Norm = (clamp(v2, 3, 6) - 3) / Math.max(0.0001, 3);
  return [
    { id: 'collarLen', label: 'Tube Clamp Collar', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'slots', label: 'Motor Bolt Slots', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'collarLen') {
    return { ...params, collarLen: Number(clamp(0.68 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.37, 0.68, 1.05).toFixed(2)) };
  }
  if (controlId === 'slots') {
    return { ...params, slots: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 3, 6)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.slots !== undefined ? Math.round(Number(params.slots)) : 4;
  return { ...params, slots: ((cur - 3 + 1) % 4) + 3 };
}`,
  },

  {
    id: 'drone-tpu-arm-bumper-shoe',
    name: 'Drone Part: 3D-Printed TPU Arm Guard',
    category: 'Drone Parts & Frames',
    description: 'Flexible 95A TPU wraparound motor arm tip guard with external impact absorber ribs and bottom vent.',
    iconName: 'Shield',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust bumper cushion wall or outer impact ribs; click in Preview Mode to cycle outer impact ribs.',
    defaultParams: {
      label: 'TPU Arm Bumper',
      wallThick: 0.36,
      ribs: 5,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'TPU Arm Bumper' },
      { key: 'wallThick', label: 'Bumper Cushion Wall', type: 'number', min: 0.22, max: 0.52, step: 0.01, defaultValue: 0.36 },
      { key: 'ribs', label: 'Outer Impact Ribs', type: 'number', min: 3, max: 7, step: 1, defaultValue: 5 },
    ],
    jsSourceCode: `// Drone Part: 3D-Printed TPU Arm Guard (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.4;
      const lipW = clamp(Number(params.wallThick) || 0.36, 0.22, 0.52) * r;
      const cells = clamp(Math.round(Number(params.ribs) || 5), 3, 7);
      const paths = [
        { d: \`M \${cx - r} \${cy + r * 0.3} A \${r} \${r} 0 0 1 \${cx + r} \${cy + r * 0.3} L \${cx + (r - lipW)} \${cy + r * 0.3} A \${r - lipW} \${r - lipW} 0 0 0 \${cx - (r - lipW)} \${cy + r * 0.3} Z\`, closed: true, fill: true },
        { d: circle(cx, cy + r * 0.2, r - lipW), closed: true, strokeDasharray: '4 3' },
      ];
      for (let c = 0; c < cells; c++) {
        const a = Math.PI + ((c + 0.5) * Math.PI) / cells;
        const hx = cx + Math.cos(a) * (r - lipW * 0.5), hy = cy + r * 0.3 + Math.sin(a) * (r - lipW * 0.5);
        paths.push({ d: circle(hx, hy, lipW * 0.24), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.wallThick !== undefined ? Number(params.wallThick) : 0.36;
  const v2 = params.ribs !== undefined ? Number(params.ribs) : 5;
  const p1Norm = (clamp(v1, 0.22, 0.52) - 0.22) / Math.max(0.0001, 0.3);
  const p2Norm = (clamp(v2, 3, 7) - 3) / Math.max(0.0001, 4);
  return [
    { id: 'wallThick', label: 'Bumper Cushion Wall', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'ribs', label: 'Outer Impact Ribs', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'wallThick') {
    return { ...params, wallThick: Number(clamp(0.22 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.3, 0.22, 0.52).toFixed(2)) };
  }
  if (controlId === 'ribs') {
    return { ...params, ribs: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 3, 7)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.ribs !== undefined ? Math.round(Number(params.ribs)) : 5;
  return { ...params, ribs: ((cur - 3 + 1) % 5) + 3 };
}`,
  },

  {
    id: 'drone-tpu-gopro-wedge-mount',
    name: 'Drone Part: TPU Action Cam Tilt Mount',
    category: 'Drone Parts & Frames',
    description: 'Angled TPU action-camera wedge mount (15°–45°) with 3-prong interlocking mounting fingers and bolt bore.',
    iconName: 'Camera',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust camera wedge tilt or mounting prongs; click in Preview Mode to cycle mounting prongs.',
    defaultParams: {
      label: 'TPU GoPro Mount',
      tiltHeight: 0.28,
      prongs: 2,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'TPU GoPro Mount' },
      { key: 'tiltHeight', label: 'Camera Wedge Tilt', type: 'number', min: 0.08, max: 0.48, step: 0.01, defaultValue: 0.28 },
      { key: 'prongs', label: 'Mounting Prongs', type: 'number', min: 2, max: 3, step: 1, defaultValue: 2 },
    ],
    jsSourceCode: `// Drone Part: TPU Action Cam Tilt Mount (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height * 0.48;
      const tilt = clamp(Number(params.tiltHeight) || 0.28, 0.08, 0.48) * 35;
      const slots = clamp(Math.round(Number(params.prongs) || 2), 2, 3);
      const cW = width * 0.64, cH = height * 0.48;
      const paths = [
        { d: roundRect(width * 0.14, height * 0.72, width * 0.72, 12, 4), closed: true, fill: true },
        { d: polygon([[cx - cW / 2, cy - cH / 2 + tilt * 0.4], [cx + cW / 2, cy - cH / 2 - tilt * 0.4], [cx + cW / 2, cy + cH / 2], [cx - cW / 2, cy + cH / 2]]), closed: true, fill: true },
        { d: roundRect(cx + cW * 0.04, cy - cH * 0.34, cW * 0.36, cH * 0.54, 6), closed: true },
        { d: circle(cx - cW * 0.24, cy - cH * 0.08, 7), closed: true },
      ];
      for (let s = 0; s < slots; s++) {
        const sx = width * 0.24 + (s * width * 0.52) / Math.max(1, slots);
        paths.push({ d: rect(sx, height * 0.75, 16, 6), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.tiltHeight !== undefined ? Number(params.tiltHeight) : 0.28;
  const v2 = params.prongs !== undefined ? Number(params.prongs) : 2;
  const p1Norm = (clamp(v1, 0.08, 0.48) - 0.08) / Math.max(0.0001, 0.4);
  const p2Norm = (clamp(v2, 2, 3) - 2) / Math.max(0.0001, 1);
  return [
    { id: 'tiltHeight', label: 'Camera Wedge Tilt', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'prongs', label: 'Mounting Prongs', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'tiltHeight') {
    return { ...params, tiltHeight: Number(clamp(0.08 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.4, 0.08, 0.48).toFixed(2)) };
  }
  if (controlId === 'prongs') {
    return { ...params, prongs: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 1, 2, 3)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.prongs !== undefined ? Math.round(Number(params.prongs)) : 2;
  return { ...params, prongs: ((cur - 2 + 1) % 2) + 2 };
}`,
  },

  {
    id: 'drone-tpu-immortal-t-holder',
    name: 'Drone Part: TPU Rear Antenna & GPS Mount',
    category: 'Drone Parts & Frames',
    description: 'Rear standoff-mounted TPU tail piece holding an angled GPS puck bay and horizontal Immortal-T tube.',
    iconName: 'Radio',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust gps bay width ratio or antenna guide tubes; click in Preview Mode to cycle antenna guide tubes.',
    defaultParams: {
      label: 'TPU GPS/Ant Mount',
      hoodScale: 0.62,
      tubes: 2,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'TPU GPS/Ant Mount' },
      { key: 'hoodScale', label: 'GPS Bay Width Ratio', type: 'number', min: 0.35, max: 0.85, step: 0.01, defaultValue: 0.62 },
      { key: 'tubes', label: 'Antenna Guide Tubes', type: 'number', min: 1, max: 2, step: 1, defaultValue: 2 },
    ],
    jsSourceCode: `// Drone Part: TPU Rear Antenna & GPS Mount (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height * 0.58;
      const vee = clamp(Number(params.hoodScale) || 0.62, 0.35, 0.85) * (width * 0.42);
      const tubes = clamp(Math.round(Number(params.tubes) || 2), 1, 2);
      const paths = [
        { d: roundRect(cx - width * 0.28, cy, width * 0.56, height * 0.26, 8), closed: true, fill: true },
        { d: circle(cx - width * 0.18, cy + height * 0.13, 5), closed: true },
        { d: circle(cx + width * 0.18, cy + height * 0.13, 5), closed: true },
        { d: line(cx, cy, cx, height * 0.16), strokeWidth: 5 },
        { d: circle(cx, height * 0.16, 9), closed: true, fill: true },
        { d: line(cx, cy + 8, cx - vee, height * 0.26), strokeWidth: 3.5 },
      ];
      if (tubes === 2) {
        paths.push({ d: line(cx, cy + 8, cx + vee, height * 0.26), strokeWidth: 3.5 });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.hoodScale !== undefined ? Number(params.hoodScale) : 0.62;
  const v2 = params.tubes !== undefined ? Number(params.tubes) : 2;
  const p1Norm = (clamp(v1, 0.35, 0.85) - 0.35) / Math.max(0.0001, 0.5);
  const p2Norm = (clamp(v2, 1, 2) - 1) / Math.max(0.0001, 1);
  return [
    { id: 'hoodScale', label: 'GPS Bay Width Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'tubes', label: 'Antenna Guide Tubes', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'hoodScale') {
    return { ...params, hoodScale: Number(clamp(0.35 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.5, 0.35, 0.85).toFixed(2)) };
  }
  if (controlId === 'tubes') {
    return { ...params, tubes: Math.round(clamp(1 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 1, 1, 2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.tubes !== undefined ? Math.round(Number(params.tubes)) : 2;
  return { ...params, tubes: ((cur - 1 + 1) % 2) + 1 };
}`,
  },

  {
    id: 'drone-tpu-capacitor-cradle',
    name: 'Drone Part: TPU XT60 & Capacitor Holder',
    category: 'Drone Parts & Frames',
    description: 'Dual-pocket TPU frame mount securing a low-ESR electrolytic capacitor beside a fixed XT60 power socket.',
    iconName: 'BatteryCharging',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust capacitor ring size or xt60 bullet pins; click in Preview Mode to cycle xt60 bullet pins.',
    defaultParams: {
      label: 'TPU Cap/XT60 Cradle',
      capR: 0.22,
      pins: 0.44,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'TPU Cap/XT60 Cradle' },
      { key: 'capR', label: 'Capacitor Ring Size', type: 'number', min: 0.14, max: 0.32, step: 0.01, defaultValue: 0.22 },
      { key: 'pins', label: 'XT60 Bullet Pins', type: 'number', min: 0.28, max: 0.62, step: 0.01, defaultValue: 0.44 },
    ],
    jsSourceCode: `// Drone Part: TPU XT60 & Capacitor Holder (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const capR = clamp(Number(params.capR) || 0.22, 0.14, 0.32) * Math.min(width, height);
      const xtOff = clamp(Number(params.pins) || 0.44, 0.28, 0.62) * (width / 2);
      return [
        { d: roundRect(cx - width * 0.38, cy - height * 0.28, width * 0.76, height * 0.56, 12), closed: true, fill: true },
        { d: circle(cx - width * 0.16, cy, capR), closed: true },
        { d: line(cx - width * 0.16 - capR * 0.5, cy, cx - width * 0.16 + capR * 0.5, cy) },
        { d: polygon([[cx + xtOff - 14, cy - 16], [cx + xtOff + 10, cy - 16], [cx + xtOff + 16, cy - 10], [cx + xtOff + 16, cy + 10], [cx + xtOff + 10, cy + 16], [cx + xtOff - 14, cy + 16]]), closed: true },
        { d: circle(cx + xtOff, cy - 6, 3.5), closed: true },
        { d: circle(cx + xtOff, cy + 6, 3.5), closed: true },
      ];
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.capR !== undefined ? Number(params.capR) : 0.22;
  const v2 = params.pins !== undefined ? Number(params.pins) : 0.44;
  const p1Norm = (clamp(v1, 0.14, 0.32) - 0.14) / Math.max(0.0001, 0.18);
  const p2Norm = (clamp(v2, 0.28, 0.62) - 0.28) / Math.max(0.0001, 0.34);
  return [
    { id: 'capR', label: 'Capacitor Ring Size', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'pins', label: 'XT60 Bullet Pins', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'capR') {
    return { ...params, capR: Number(clamp(0.14 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.18, 0.14, 0.32).toFixed(2)) };
  }
  if (controlId === 'pins') {
    return { ...params, pins: Number(clamp(0.28 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.34, 0.28, 0.62).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.pins !== undefined ? Number(params.pins) : 0.44;
  const next = cur + 0.11 > 0.62 + 0.001 ? 0.28 : Number((cur + 0.11).toFixed(2));
  return { ...params, pins: next };
}`,
  },

  {
    id: 'drone-prop-guard-bumper-sector',
    name: 'Drone Part: Modular Prop Guard Sector',
    category: 'Drone Parts & Frames',
    description: 'Spoke-reinforced modular prop guard bumper arc protecting rotor tips during indoor inspection.',
    iconName: 'Disc',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust guard sweep ratio or radial support struts; click in Preview Mode to cycle radial support struts.',
    defaultParams: {
      label: 'Prop Guard Sector',
      arcSpan: 0.78,
      spokes: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Prop Guard Sector' },
      { key: 'arcSpan', label: 'Guard Sweep Ratio', type: 'number', min: 0.58, max: 0.92, step: 0.01, defaultValue: 0.78 },
      { key: 'spokes', label: 'Radial Support Struts', type: 'number', min: 3, max: 5, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: Modular Prop Guard Sector (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.42;
      const span = clamp(Number(params.arcSpan) || 0.78, 0.58, 0.92) * Math.PI;
      const spokes = clamp(Math.round(Number(params.spokes) || 4), 3, 5);
      const a0 = -Math.PI / 2 - span, a1 = -Math.PI / 2 + span;
      const x0 = cx + Math.cos(a0) * r, y0 = cy + Math.sin(a0) * r;
      const x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
      const paths = [
        { d: \`M \${x0} \${y0} A \${r} \${r} 0 1 1 \${x1} \${y1}\`, strokeWidth: 7 },
        { d: circle(cx, cy, r * 0.26), closed: true, fill: true },
        { d: circle(cx, cy, r * 0.12), closed: true },
      ];
      for (let s = 0; s < spokes; s++) {
        const a = a0 + (s * (a1 - a0)) / Math.max(1, spokes - 1);
        paths.push({ d: line(cx + Math.cos(a) * r * 0.26, cy + Math.sin(a) * r * 0.26, cx + Math.cos(a) * r, cy + Math.sin(a) * r), strokeWidth: 3 });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.arcSpan !== undefined ? Number(params.arcSpan) : 0.78;
  const v2 = params.spokes !== undefined ? Number(params.spokes) : 4;
  const p1Norm = (clamp(v1, 0.58, 0.92) - 0.58) / Math.max(0.0001, 0.34);
  const p2Norm = (clamp(v2, 3, 5) - 3) / Math.max(0.0001, 2);
  return [
    { id: 'arcSpan', label: 'Guard Sweep Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'spokes', label: 'Radial Support Struts', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'arcSpan') {
    return { ...params, arcSpan: Number(clamp(0.58 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.34, 0.58, 0.92).toFixed(2)) };
  }
  if (controlId === 'spokes') {
    return { ...params, spokes: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 3, 5)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.spokes !== undefined ? Math.round(Number(params.spokes)) : 4;
  return { ...params, spokes: ((cur - 3 + 1) % 3) + 3 };
}`,
  },

  {
    id: 'drone-battery-anti-slip-pad',
    name: 'Drone Part: Silicone Battery Grip Pad',
    category: 'Drone Parts & Frames',
    description: 'High-friction waffle-textured silicone battery pad with dual strap pass-through slots.',
    iconName: 'Grid',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust border margin ratio or waffle grip columns; click in Preview Mode to cycle waffle grip columns.',
    defaultParams: {
      label: 'Silicone Grip Pad',
      padInset: 0.78,
      cols: 5,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Silicone Grip Pad' },
      { key: 'padInset', label: 'Border Margin Ratio', type: 'number', min: 0.56, max: 0.92, step: 0.01, defaultValue: 0.78 },
      { key: 'cols', label: 'Waffle Grip Columns', type: 'number', min: 3, max: 7, step: 1, defaultValue: 5 },
    ],
    jsSourceCode: `// Drone Part: Silicone Battery Grip Pad (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const padW = clamp(Number(params.padInset) || 0.78, 0.56, 0.92) * width;
      const rows = clamp(Math.round(Number(params.cols) || 5), 3, 7);
      const padH = height * 0.56, ox = cx - padW / 2, oy = cy - padH / 2;
      const paths = [
        { d: roundRect(ox, oy, padW, padH, 8), closed: true, fill: true },
        { d: roundRect(cx - padW * 0.36, oy + 6, padW * 0.24, 8, 3), closed: true },
        { d: roundRect(cx + padW * 0.12, oy + 6, padW * 0.24, 8, 3), closed: true },
        { d: roundRect(cx - padW * 0.36, oy + padH - 14, padW * 0.24, 8, 3), closed: true },
        { d: roundRect(cx + padW * 0.12, oy + padH - 14, padW * 0.24, 8, 3), closed: true },
      ];
      for (let i = 1; i <= rows; i++) {
        const t = i / (rows + 1);
        paths.push({ d: line(ox + 10, oy + padH * t, ox + padW - 10, oy + padH * (1 - t) * 0.3 + padH * t * 0.7) });
        paths.push({ d: line(ox + padW - 10, oy + padH * t, ox + 10, oy + padH * (1 - t) * 0.3 + padH * t * 0.7) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.padInset !== undefined ? Number(params.padInset) : 0.78;
  const v2 = params.cols !== undefined ? Number(params.cols) : 5;
  const p1Norm = (clamp(v1, 0.56, 0.92) - 0.56) / Math.max(0.0001, 0.36);
  const p2Norm = (clamp(v2, 3, 7) - 3) / Math.max(0.0001, 4);
  return [
    { id: 'padInset', label: 'Border Margin Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'cols', label: 'Waffle Grip Columns', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'padInset') {
    return { ...params, padInset: Number(clamp(0.56 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.36, 0.56, 0.92).toFixed(2)) };
  }
  if (controlId === 'cols') {
    return { ...params, cols: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 3, 7)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.cols !== undefined ? Math.round(Number(params.cols)) : 5;
  return { ...params, cols: ((cur - 3 + 1) % 5) + 3 };
}`,
  },

  {
    id: 'drone-kevlar-lipo-strap',
    name: 'Drone Part: Kevlar Rubberized LiPo Strap',
    category: 'Drone Parts & Frames',
    description: 'Kevlar-stitched rubberized battery strap loop with welded metal cinch buckle and hook-and-loop patch.',
    iconName: 'Link',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust metal buckle position or box-x stitch lines; click in Preview Mode to cycle box-x stitch lines.',
    defaultParams: {
      label: 'Kevlar LiPo Strap',
      buckleX: 0.26,
      stitches: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Kevlar LiPo Strap' },
      { key: 'buckleX', label: 'Metal Buckle Position', type: 'number', min: 0.16, max: 0.42, step: 0.01, defaultValue: 0.26 },
      { key: 'stitches', label: 'Box-X Stitch Lines', type: 'number', min: 2, max: 6, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: Kevlar Rubberized LiPo Strap (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const buckleX = clamp(Number(params.buckleX) || 0.26, 0.16, 0.42) * width;
      const stitches = clamp(Math.round(Number(params.stitches) || 4), 2, 6);
      const sH = height * 0.28;
      const paths = [
        { d: roundRect(buckleX, cy - sH / 2, width * 0.88 - buckleX, sH, 4), closed: true, fill: true },
        { d: roundRect(buckleX - 18, cy - sH * 0.68, 24, sH * 1.36, 4), closed: true, fill: true },
        { d: rect(buckleX - 12, cy - sH * 0.44, 12, sH * 0.88), closed: true },
        { d: rect(buckleX + 6, cy - sH * 0.4, 28, sH * 0.8), closed: true },
      ];
      for (let i = 0; i < stitches; i++) {
        const sx = buckleX + 44 + i * ((width * 0.78 - buckleX - 44) / Math.max(1, stitches));
        paths.push({ d: line(sx, cy - sH * 0.35, sx + 10, cy + sH * 0.35) });
        paths.push({ d: line(sx + 10, cy - sH * 0.35, sx, cy + sH * 0.35) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.buckleX !== undefined ? Number(params.buckleX) : 0.26;
  const v2 = params.stitches !== undefined ? Number(params.stitches) : 4;
  const p1Norm = (clamp(v1, 0.16, 0.42) - 0.16) / Math.max(0.0001, 0.26);
  const p2Norm = (clamp(v2, 2, 6) - 2) / Math.max(0.0001, 4);
  return [
    { id: 'buckleX', label: 'Metal Buckle Position', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'stitches', label: 'Box-X Stitch Lines', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'buckleX') {
    return { ...params, buckleX: Number(clamp(0.16 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.26, 0.16, 0.42).toFixed(2)) };
  }
  if (controlId === 'stitches') {
    return { ...params, stitches: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 2, 6)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.stitches !== undefined ? Math.round(Number(params.stitches)) : 4;
  return { ...params, stitches: ((cur - 2 + 1) % 5) + 2 };
}`,
  },

  {
    id: 'drone-quick-release-payload-plate',
    name: 'Drone Part: Dovetail Quick-Release Mount',
    category: 'Drone Parts & Frames',
    description: 'CNC dovetail slide-and-lock payload release receiver with 45-degree rails and cam-lock lever.',
    iconName: 'Lock',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust inner dovetail width or cam-lock lever pos; click in Preview Mode to cycle cam-lock lever pos.',
    defaultParams: {
      label: 'Quick-Release Plate',
      railWidth: 0.46,
      leverAngle: 8,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Quick-Release Plate' },
      { key: 'railWidth', label: 'Inner Dovetail Width', type: 'number', min: 0.3, max: 0.64, step: 0.01, defaultValue: 0.46 },
      { key: 'leverAngle', label: 'Cam-Lock Lever Pos', type: 'number', min: 4, max: 10, step: 1, defaultValue: 8 },
    ],
    jsSourceCode: `// Drone Part: Dovetail Quick-Release Mount (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const doveW = clamp(Number(params.railWidth) || 0.46, 0.3, 0.64) * width;
      const pins = clamp(Math.round(Number(params.leverAngle) || 8), 4, 10);
      const pW = width * 0.76, pH = height * 0.68;
      const paths = [
        { d: roundRect(cx - pW / 2, cy - pH / 2, pW, pH, 8), closed: true, fill: true },
        { d: polygon([[cx - doveW * 0.42, cy - pH / 2 + 8], [cx + doveW * 0.42, cy - pH / 2 + 8], [cx + doveW * 0.54, cy + pH / 2 - 8], [cx - doveW * 0.54, cy + pH / 2 - 8]]), closed: true },
        { d: roundRect(cx + pW / 2 - 6, cy - 16, 14, 32, 3), closed: true, fill: true },
      ];
      for (let p = 0; p < pins; p++) {
        const px = cx - doveW * 0.32 + (p * doveW * 0.64) / Math.max(1, pins - 1);
        paths.push({ d: circle(px, cy, 2.2), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.railWidth !== undefined ? Number(params.railWidth) : 0.46;
  const v2 = params.leverAngle !== undefined ? Number(params.leverAngle) : 8;
  const p1Norm = (clamp(v1, 0.3, 0.64) - 0.3) / Math.max(0.0001, 0.34);
  const p2Norm = (clamp(v2, 4, 10) - 4) / Math.max(0.0001, 6);
  return [
    { id: 'railWidth', label: 'Inner Dovetail Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'leverAngle', label: 'Cam-Lock Lever Pos', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'railWidth') {
    return { ...params, railWidth: Number(clamp(0.3 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.34, 0.3, 0.64).toFixed(2)) };
  }
  if (controlId === 'leverAngle') {
    return { ...params, leverAngle: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 6, 4, 10)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.leverAngle !== undefined ? Math.round(Number(params.leverAngle)) : 8;
  return { ...params, leverAngle: ((cur - 4 + 1) % 7) + 4 };
}`,
  },

  {
    id: 'drone-vibration-isolator-wire-rope',
    name: 'Drone Part: Wire-Rope Vibration Isolator',
    category: 'Drone Parts & Frames',
    description: 'Heavy-payload helical stainless-steel wire-rope vibration isolator linking upper and lower mounting rails.',
    iconName: 'Activity',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust isolator height ratio or helical wire loops; click in Preview Mode to cycle helical wire loops.',
    defaultParams: {
      label: 'Wire-Rope Isolator',
      railGap: 0.52,
      coils: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Wire-Rope Isolator' },
      { key: 'railGap', label: 'Isolator Height Ratio', type: 'number', min: 0.32, max: 0.72, step: 0.01, defaultValue: 0.52 },
      { key: 'coils', label: 'Helical Wire Loops', type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: Wire-Rope Vibration Isolator (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const loopH = clamp(Number(params.railGap) || 0.52, 0.32, 0.72) * height;
      const coils = clamp(Math.round(Number(params.coils) || 4), 3, 6);
      const rW = width * 0.72;
      const paths = [
        { d: roundRect(cx - rW / 2, cy - loopH / 2 - 10, rW, 10, 3), closed: true, fill: true },
        { d: roundRect(cx - rW / 2, cy + loopH / 2, rW, 10, 3), closed: true, fill: true },
      ];
      for (let c = 0; c < coils; c++) {
        const ex = cx - rW * 0.34 + (c * rW * 0.68) / Math.max(1, coils - 1);
        paths.push({ d: ellipse(ex, cy, rW / (coils * 1.4), loopH / 2), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.railGap !== undefined ? Number(params.railGap) : 0.52;
  const v2 = params.coils !== undefined ? Number(params.coils) : 4;
  const p1Norm = (clamp(v1, 0.32, 0.72) - 0.32) / Math.max(0.0001, 0.4);
  const p2Norm = (clamp(v2, 3, 6) - 3) / Math.max(0.0001, 3);
  return [
    { id: 'railGap', label: 'Isolator Height Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'coils', label: 'Helical Wire Loops', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'railGap') {
    return { ...params, railGap: Number(clamp(0.32 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.4, 0.32, 0.72).toFixed(2)) };
  }
  if (controlId === 'coils') {
    return { ...params, coils: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 3, 6)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.coils !== undefined ? Math.round(Number(params.coils)) : 4;
  return { ...params, coils: ((cur - 3 + 1) % 4) + 3 };
}`,
  },

  {
    id: 'drone-rubber-ball-gimbal-plate',
    name: 'Drone Part: 4-Ball Anti-Vibration Plate',
    category: 'Drone Parts & Frames',
    description: 'Dirty-to-clean dual carbon gimbal isolation plates separated by 4 corner silicone damping balls.',
    iconName: 'Layers',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust plate separation or damping balls; click in Preview Mode to cycle damping balls.',
    defaultParams: {
      label: '4-Ball Gimbal Plate',
      plateGap: 0.34,
      balls: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '4-Ball Gimbal Plate' },
      { key: 'plateGap', label: 'Plate Separation', type: 'number', min: 0.2, max: 0.5, step: 0.01, defaultValue: 0.34 },
      { key: 'balls', label: 'Damping Balls', type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: 4-Ball Anti-Vibration Plate (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const gap = clamp(Number(params.plateGap) || 0.34, 0.2, 0.5) * height;
      const balls = clamp(Math.round(Number(params.balls) || 4), 3, 6);
      const pW = width * 0.78, y1 = cy - gap / 2, y2 = cy + gap / 2, bR = gap * 0.42;
      const paths = [
        { d: roundRect(cx - pW / 2, y1 - 10, pW, 10, 3), closed: true, fill: true },
        { d: roundRect(cx - pW / 2, y2, pW, 10, 3), closed: true, fill: true },
      ];
      for (let b = 0; b < balls; b++) {
        const bx = cx - pW * 0.38 + (b * pW * 0.76) / Math.max(1, balls - 1);
        paths.push({ d: ellipse(bx, cy, bR * 0.85, bR), closed: true, fill: true });
        paths.push({ d: line(bx - bR * 0.85, cy, bx + bR * 0.85, cy) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.plateGap !== undefined ? Number(params.plateGap) : 0.34;
  const v2 = params.balls !== undefined ? Number(params.balls) : 4;
  const p1Norm = (clamp(v1, 0.2, 0.5) - 0.2) / Math.max(0.0001, 0.3);
  const p2Norm = (clamp(v2, 3, 6) - 3) / Math.max(0.0001, 3);
  return [
    { id: 'plateGap', label: 'Plate Separation', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'balls', label: 'Damping Balls', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'plateGap') {
    return { ...params, plateGap: Number(clamp(0.2 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.3, 0.2, 0.5).toFixed(2)) };
  }
  if (controlId === 'balls') {
    return { ...params, balls: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 3, 6)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.balls !== undefined ? Math.round(Number(params.balls)) : 4;
  return { ...params, balls: ((cur - 3 + 1) % 4) + 3 };
}`,
  },

  {
    id: 'drone-retractable-landing-skid',
    name: 'Drone Part: Electric Retract Landing Gear',
    category: 'Drone Parts & Frames',
    description: 'Worm-gear motorized folding landing gear actuator with vertical carbon strut and horizontal T-skid foot.',
    iconName: 'ArrowDownToLine',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust bottom t-skid width or carbon strut width; click in Preview Mode to cycle carbon strut width.',
    defaultParams: {
      label: 'Retract Landing Gear',
      skidSpan: 0.74,
      strutW: 0.3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Retract Landing Gear' },
      { key: 'skidSpan', label: 'Bottom T-Skid Width', type: 'number', min: 0.42, max: 0.9, step: 0.01, defaultValue: 0.74 },
      { key: 'strutW', label: 'Carbon Strut Width', type: 'number', min: 0.18, max: 0.42, step: 0.01, defaultValue: 0.3 },
    ],
    jsSourceCode: `// Drone Part: Electric Retract Landing Gear (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, topY = height * 0.2;
      const spread = clamp(Number(params.skidSpan) || 0.74, 0.42, 0.9) * (width * 0.42);
      const skidW = clamp(Number(params.strutW) || 0.3, 0.18, 0.42) * width;
      const footY = height * 0.82;
      return [
        { d: roundRect(cx - 28, topY - 10, 56, 20, 4), closed: true, fill: true },
        { d: circle(cx - 16, topY, 4), closed: true },
        { d: circle(cx + 16, topY, 4), closed: true },
        { d: line(cx - 16, topY + 6, cx - spread, footY), strokeWidth: 4.5 },
        { d: line(cx + 16, topY + 6, cx + spread, footY), strokeWidth: 4.5 },
        { d: line(cx - 6, topY + 10, cx - spread * 0.55, topY + (footY - topY) * 0.45), strokeWidth: 2.5 },
        { d: line(cx + 6, topY + 10, cx + spread * 0.55, topY + (footY - topY) * 0.45), strokeWidth: 2.5 },
        { d: roundRect(cx - spread - skidW / 2, footY - 4, skidW, 8, 4), closed: true, fill: true },
        { d: roundRect(cx + spread - skidW / 2, footY - 4, skidW, 8, 4), closed: true, fill: true },
      ];
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.skidSpan !== undefined ? Number(params.skidSpan) : 0.74;
  const v2 = params.strutW !== undefined ? Number(params.strutW) : 0.3;
  const p1Norm = (clamp(v1, 0.42, 0.9) - 0.42) / Math.max(0.0001, 0.48);
  const p2Norm = (clamp(v2, 0.18, 0.42) - 0.18) / Math.max(0.0001, 0.24);
  return [
    { id: 'skidSpan', label: 'Bottom T-Skid Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'strutW', label: 'Carbon Strut Width', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'skidSpan') {
    return { ...params, skidSpan: Number(clamp(0.42 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.48, 0.42, 0.9).toFixed(2)) };
  }
  if (controlId === 'strutW') {
    return { ...params, strutW: Number(clamp(0.18 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.24, 0.18, 0.42).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.strutW !== undefined ? Number(params.strutW) : 0.3;
  const next = cur + 0.08 > 0.42 + 0.001 ? 0.18 : Number((cur + 0.08).toFixed(2));
  return { ...params, strutW: next };
}`,
  },

  {
    id: 'drone-fixed-arch-landing-gear',
    name: 'Drone Part: Arched Carbon Landing Skid',
    category: 'Drone Parts & Frames',
    description: 'Spring-carbon C-arch landing gear legs with horizontal skid tubes and shock-absorbing foam feet.',
    iconName: 'Minimize2',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust arch stance width or mounting bridge (%); click in Preview Mode to cycle mounting bridge (%).',
    defaultParams: {
      label: 'Arched Landing Skid',
      archSpread: 0.78,
      topBridge: 0.62,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Arched Landing Skid' },
      { key: 'archSpread', label: 'Arch Stance Width', type: 'number', min: 0.52, max: 0.92, step: 0.01, defaultValue: 0.78 },
      { key: 'topBridge', label: 'Mounting Bridge (%)', type: 'number', min: 0.42, max: 0.76, step: 0.01, defaultValue: 0.62 },
    ],
    jsSourceCode: `// Drone Part: Arched Carbon Landing Skid (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, topY = height * 0.22;
      const archW = clamp(Number(params.archSpread) || 0.78, 0.52, 0.92) * width;
      const archH = clamp(Number(params.topBridge) || 0.62, 0.42, 0.76) * height;
      const footY = topY + archH;
      return [
        { d: roundRect(cx - 26, topY - 8, 52, 12, 3), closed: true, fill: true },
        { d: \`M \${cx - archW / 2} \${footY} Q \${cx - archW * 0.36} \${topY} \${cx - 20} \${topY} L \${cx + 20} \${topY} Q \${cx + archW * 0.36} \${topY} \${cx + archW / 2} \${footY}\`, strokeWidth: 5 },
        { d: circle(cx - archW / 2, footY, 6), closed: true, fill: true },
        { d: circle(cx + archW / 2, footY, 6), closed: true, fill: true },
      ];
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.archSpread !== undefined ? Number(params.archSpread) : 0.78;
  const v2 = params.topBridge !== undefined ? Number(params.topBridge) : 0.62;
  const p1Norm = (clamp(v1, 0.52, 0.92) - 0.52) / Math.max(0.0001, 0.4);
  const p2Norm = (clamp(v2, 0.42, 0.76) - 0.42) / Math.max(0.0001, 0.34);
  return [
    { id: 'archSpread', label: 'Arch Stance Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'topBridge', label: 'Mounting Bridge (%)', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'archSpread') {
    return { ...params, archSpread: Number(clamp(0.52 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.4, 0.52, 0.92).toFixed(2)) };
  }
  if (controlId === 'topBridge') {
    return { ...params, topBridge: Number(clamp(0.42 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.34, 0.42, 0.76).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.topBridge !== undefined ? Number(params.topBridge) : 0.62;
  const next = cur + 0.11 > 0.76 + 0.001 ? 0.42 : Number((cur + 0.11).toFixed(2));
  return { ...params, topBridge: next };
}`,
  },

  {
    id: 'drone-spider-leg-extensions',
    name: 'Drone Part: Fold-Out Spider Landing Legs',
    category: 'Drone Parts & Frames',
    description: '4 ratcheting angled spider leg extensions clamping onto multi-rotor arms for tall payload clearance.',
    iconName: 'Compass',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust spider leg reach or articulated knees; click in Preview Mode to cycle articulated knees.',
    defaultParams: {
      label: 'Spider Landing Legs',
      legSpread: 0.38,
      joints: 0.48,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Spider Landing Legs' },
      { key: 'legSpread', label: 'Spider Leg Reach', type: 'number', min: 0.24, max: 0.46, step: 0.01, defaultValue: 0.38 },
      { key: 'joints', label: 'Articulated Knees', type: 'number', min: 0.24, max: 0.72, step: 0.01, defaultValue: 0.48 },
    ],
    jsSourceCode: `// Drone Part: Fold-Out Spider Landing Legs (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height * 0.52;
      const legL = clamp(Number(params.legSpread) || 0.38, 0.24, 0.46) * Math.min(width, height);
      const bend = clamp(Number(params.joints) || 0.48, 0.24, 0.72);
      const paths = [{ d: roundRect(cx - 20, cy - 20, 40, 40, 6), closed: true, fill: true }];
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx, sy]) => {
        const kx = cx + sx * (20 + legL * 0.55), ky = cy + sy * (20 + legL * 0.25);
        const fx = kx + sx * legL * 0.45, fy = ky + legL * bend;
        paths.push({ d: line(cx + sx * 16, cy + sy * 16, kx, ky), strokeWidth: 4 });
        paths.push({ d: line(kx, ky, fx, fy), strokeWidth: 3.5 });
        paths.push({ d: circle(fx, fy, 6), closed: true, fill: true });
      });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.legSpread !== undefined ? Number(params.legSpread) : 0.38;
  const v2 = params.joints !== undefined ? Number(params.joints) : 0.48;
  const p1Norm = (clamp(v1, 0.24, 0.46) - 0.24) / Math.max(0.0001, 0.22);
  const p2Norm = (clamp(v2, 0.24, 0.72) - 0.24) / Math.max(0.0001, 0.48);
  return [
    { id: 'legSpread', label: 'Spider Leg Reach', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'joints', label: 'Articulated Knees', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'legSpread') {
    return { ...params, legSpread: Number(clamp(0.24 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.22, 0.24, 0.46).toFixed(2)) };
  }
  if (controlId === 'joints') {
    return { ...params, joints: Number(clamp(0.24 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.48, 0.24, 0.72).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.joints !== undefined ? Number(params.joints) : 0.48;
  const next = cur + 0.16 > 0.72 + 0.001 ? 0.24 : Number((cur + 0.16).toFixed(2));
  return { ...params, joints: next };
}`,
  },

  {
    id: 'drone-parachute-recovery-canister',
    name: 'Drone Part: Ballistic Parachute Canister',
    category: 'Drone Parts & Frames',
    description: 'Spring/pyro parachute recovery canister with deployed hemispherical canopy and suspension risers.',
    iconName: 'Umbrella',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust deployed canopy span or suspension risers; click in Preview Mode to cycle suspension risers.',
    defaultParams: {
      label: 'Parachute Canister',
      canopySpan: 0.76,
      risers: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Parachute Canister' },
      { key: 'canopySpan', label: 'Deployed Canopy Span', type: 'number', min: 0.52, max: 0.92, step: 0.01, defaultValue: 0.76 },
      { key: 'risers', label: 'Suspension Risers', type: 'number', min: 4, max: 8, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Part: Ballistic Parachute Canister (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2;
      const span = clamp(Number(params.canopySpan) || 0.76, 0.52, 0.92) * width;
      const cords = clamp(Math.round(Number(params.risers) || 6), 4, 8);
      const domeY = height * 0.42, domeR = span / 2, canY = height * 0.72;
      const paths = [
        { d: \`M \${cx - domeR} \${domeY} A \${domeR} \${domeY - height * 0.1} 0 0 1 \${cx + domeR} \${domeY} Z\`, closed: true, fill: true },
        { d: roundRect(cx - 16, canY, 32, height * 0.2, 4), closed: true, fill: true },
      ];
      for (let c = 0; c < cords; c++) {
        const sx = cx - domeR + (c * span) / Math.max(1, cords - 1);
        paths.push({ d: line(sx, domeY, cx + (c - (cords - 1) / 2) * 3, canY) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.canopySpan !== undefined ? Number(params.canopySpan) : 0.76;
  const v2 = params.risers !== undefined ? Number(params.risers) : 6;
  const p1Norm = (clamp(v1, 0.52, 0.92) - 0.52) / Math.max(0.0001, 0.4);
  const p2Norm = (clamp(v2, 4, 8) - 4) / Math.max(0.0001, 4);
  return [
    { id: 'canopySpan', label: 'Deployed Canopy Span', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'risers', label: 'Suspension Risers', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'canopySpan') {
    return { ...params, canopySpan: Number(clamp(0.52 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.4, 0.52, 0.92).toFixed(2)) };
  }
  if (controlId === 'risers') {
    return { ...params, risers: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 4, 8)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.risers !== undefined ? Math.round(Number(params.risers)) : 6;
  return { ...params, risers: ((cur - 4 + 1) % 5) + 4 };
}`,
  },

  {
    id: 'drone-water-flotation-noodles',
    name: 'Drone Part: Twin Buoyancy Float Skids',
    category: 'Drone Parts & Frames',
    description: 'Dual cylindrical closed-cell foam buoyancy pontoons with nose cones and cross-bar mounting struts.',
    iconName: 'Waves',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust pontoon spacing or retention straps; click in Preview Mode to cycle retention straps.',
    defaultParams: {
      label: 'Buoyancy Float Skids',
      floatGap: 0.13,
      ribs: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Buoyancy Float Skids' },
      { key: 'floatGap', label: 'Pontoon Spacing', type: 'number', min: 0.08, max: 0.2, step: 0.01, defaultValue: 0.13 },
      { key: 'ribs', label: 'Retention Straps', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: Twin Buoyancy Float Skids (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height * 0.62;
      const pR = clamp(Number(params.floatGap) || 0.13, 0.08, 0.2) * height;
      const straps = clamp(Math.round(Number(params.ribs) || 3), 2, 4);
      const pL = width * 0.78;
      const paths = [
        { d: line(cx - pL * 0.26, height * 0.2, cx - pL * 0.34, cy - pR), strokeWidth: 3.5 },
        { d: line(cx + pL * 0.26, height * 0.2, cx + pL * 0.34, cy - pR), strokeWidth: 3.5 },
        { d: roundRect(cx - pL / 2, cy - pR * 2, pL, pR * 2, pR), closed: true, fill: true },
        { d: roundRect(cx - pL / 2 + 8, cy + 4, pL - 16, pR * 1.8, pR * 0.9), closed: true, fill: true },
      ];
      for (let s = 0; s < straps; s++) {
        const sx = cx - pL * 0.34 + (s * pL * 0.68) / Math.max(1, straps - 1);
        paths.push({ d: rect(sx - 3, cy - pR * 2, 6, pR * 2), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.floatGap !== undefined ? Number(params.floatGap) : 0.13;
  const v2 = params.ribs !== undefined ? Number(params.ribs) : 3;
  const p1Norm = (clamp(v1, 0.08, 0.2) - 0.08) / Math.max(0.0001, 0.12);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'floatGap', label: 'Pontoon Spacing', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'ribs', label: 'Retention Straps', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'floatGap') {
    return { ...params, floatGap: Number(clamp(0.08 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.12, 0.08, 0.2).toFixed(2)) };
  }
  if (controlId === 'ribs') {
    return { ...params, ribs: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.ribs !== undefined ? Math.round(Number(params.ribs)) : 3;
  return { ...params, ribs: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-motor-micro-0802',
    name: 'Drone Part: 0802 Micro Whoop Motor',
    category: 'Drone Parts & Frames',
    description: 'Ultra-light 0802 brushless whoop motor with 3-screw triangular base, 9 stator coils, and 1mm shaft.',
    iconName: 'Disc',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust rotor bell ratio or stator coils; click in Preview Mode to cycle stator coils.',
    defaultParams: {
      label: '0802 Whoop Motor',
      bellScale: 0.78,
      coils: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '0802 Whoop Motor' },
      { key: 'bellScale', label: 'Rotor Bell Ratio', type: 'number', min: 0.58, max: 0.92, step: 0.01, defaultValue: 0.78 },
      { key: 'coils', label: 'Stator Coils', type: 'number', min: 4, max: 8, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Part: 0802 Micro Whoop Motor (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.42;
      const bellR = clamp(Number(params.bellScale) || 0.78, 0.58, 0.92) * r;
      const spokes = clamp(Math.round(Number(params.coils) || 6), 4, 8);
      const paths = [
        { d: polygon([[cx, cy - r * 0.96], [cx + r * 0.85, cy + r * 0.5], [cx - r * 0.85, cy + r * 0.5]]), closed: true },
        { d: circle(cx, cy, bellR), closed: true, fill: true },
        { d: circle(cx, cy, bellR * 0.32), closed: true },
        { d: circle(cx, cy, bellR * 0.14), closed: true, fill: true },
      ];
      for (let s = 0; s < spokes; s++) {
        const a = (s * Math.PI * 2) / spokes;
        paths.push({ d: line(cx + Math.cos(a) * bellR * 0.32, cy + Math.sin(a) * bellR * 0.32, cx + Math.cos(a) * bellR * 0.88, cy + Math.sin(a) * bellR * 0.88), strokeWidth: 2.5 });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.bellScale !== undefined ? Number(params.bellScale) : 0.78;
  const v2 = params.coils !== undefined ? Number(params.coils) : 6;
  const p1Norm = (clamp(v1, 0.58, 0.92) - 0.58) / Math.max(0.0001, 0.34);
  const p2Norm = (clamp(v2, 4, 8) - 4) / Math.max(0.0001, 4);
  return [
    { id: 'bellScale', label: 'Rotor Bell Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'coils', label: 'Stator Coils', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'bellScale') {
    return { ...params, bellScale: Number(clamp(0.58 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.34, 0.58, 0.92).toFixed(2)) };
  }
  if (controlId === 'coils') {
    return { ...params, coils: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 4, 8)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.coils !== undefined ? Math.round(Number(params.coils)) : 6;
  return { ...params, coils: ((cur - 4 + 1) % 5) + 4 };
}`,
  },

  {
    id: 'drone-motor-pancake-4006',
    name: 'Drone Part: 4006 Low-KV Pancake Motor',
    category: 'Drone Parts & Frames',
    description: 'High-pole-count 4006 pancake endurance/gimbal motor with wide hollow center bore and 18–24 stator slots.',
    iconName: 'Disc',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust hollow center bore or stator slot spokes; click in Preview Mode to cycle stator slot spokes.',
    defaultParams: {
      label: '4006 Pancake Motor',
      boreRatio: 0.36,
      poles: 14,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '4006 Pancake Motor' },
      { key: 'boreRatio', label: 'Hollow Center Bore', type: 'number', min: 0.22, max: 0.52, step: 0.01, defaultValue: 0.36 },
      { key: 'poles', label: 'Stator Slot Spokes', type: 'number', min: 10, max: 18, step: 1, defaultValue: 14 },
    ],
    jsSourceCode: `// Drone Part: 4006 Low-KV Pancake Motor (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.44;
      const hubR = clamp(Number(params.boreRatio) || 0.36, 0.22, 0.52) * r;
      const poles = clamp(Math.round(Number(params.poles) || 14), 10, 18);
      const paths = [
        { d: circle(cx, cy, r), closed: true, fill: true },
        { d: circle(cx, cy, r * 0.84), closed: true },
        { d: circle(cx, cy, hubR), closed: true },
        { d: circle(cx, cy, hubR * 0.38), closed: true, fill: true },
      ];
      for (let p = 0; p < poles; p++) {
        const a = (p * Math.PI * 2) / poles;
        paths.push({ d: line(cx + Math.cos(a) * hubR, cy + Math.sin(a) * hubR, cx + Math.cos(a) * r * 0.82, cy + Math.sin(a) * r * 0.82), strokeWidth: 2 });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.boreRatio !== undefined ? Number(params.boreRatio) : 0.36;
  const v2 = params.poles !== undefined ? Number(params.poles) : 14;
  const p1Norm = (clamp(v1, 0.22, 0.52) - 0.22) / Math.max(0.0001, 0.3);
  const p2Norm = (clamp(v2, 10, 18) - 10) / Math.max(0.0001, 8);
  return [
    { id: 'boreRatio', label: 'Hollow Center Bore', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'poles', label: 'Stator Slot Spokes', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'boreRatio') {
    return { ...params, boreRatio: Number(clamp(0.22 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.3, 0.22, 0.52).toFixed(2)) };
  }
  if (controlId === 'poles') {
    return { ...params, poles: Math.round(clamp(10 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 8, 10, 18)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.poles !== undefined ? Math.round(Number(params.poles)) : 14;
  return { ...params, poles: ((cur - 10 + 1) % 9) + 10 };
}`,
  },

  {
    id: 'drone-motor-heavy-8120',
    name: 'Drone Part: 8120 Heavy-Lift Industrial Motor',
    category: 'Drone Parts & Frames',
    description: 'Industrial 8120 heavy-lift brushless motor with centrifugal cooling slots and 4-bolt M4 prop adapter.',
    iconName: 'Cpu',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust 4-bolt hub scale or centrifugal vents; click in Preview Mode to cycle centrifugal vents.',
    defaultParams: {
      label: '8120 Heavy Motor',
      hubScale: 0.38,
      vents: 10,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '8120 Heavy Motor' },
      { key: 'hubScale', label: '4-Bolt Hub Scale', type: 'number', min: 0.24, max: 0.54, step: 0.01, defaultValue: 0.38 },
      { key: 'vents', label: 'Centrifugal Vents', type: 'number', min: 6, max: 12, step: 1, defaultValue: 10 },
    ],
    jsSourceCode: `// Drone Part: 8120 Heavy-Lift Industrial Motor (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.44;
      const boltR = clamp(Number(params.hubScale) || 0.38, 0.24, 0.54) * r;
      const vanes = clamp(Math.round(Number(params.vents) || 10), 6, 12);
      const paths = [
        { d: circle(cx, cy, r), closed: true, fill: true },
        { d: circle(cx, cy, boltR), closed: true, strokeDasharray: '4 3' },
        { d: circle(cx, cy, boltR * 0.42), closed: true },
      ];
      for (let v = 0; v < vanes; v++) {
        const a0 = (v * Math.PI * 2) / vanes, a1 = a0 + 0.32;
        paths.push({ d: line(cx + Math.cos(a0) * boltR * 1.1, cy + Math.sin(a0) * boltR * 1.1, cx + Math.cos(a1) * r * 0.9, cy + Math.sin(a1) * r * 0.9), strokeWidth: 3 });
      }
      for (let b = 0; b < 4; b++) {
        const a = (b * Math.PI) / 2 + Math.PI / 4;
        paths.push({ d: circle(cx + Math.cos(a) * boltR, cy + Math.sin(a) * boltR, 3.5), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.hubScale !== undefined ? Number(params.hubScale) : 0.38;
  const v2 = params.vents !== undefined ? Number(params.vents) : 10;
  const p1Norm = (clamp(v1, 0.24, 0.54) - 0.24) / Math.max(0.0001, 0.3);
  const p2Norm = (clamp(v2, 6, 12) - 6) / Math.max(0.0001, 6);
  return [
    { id: 'hubScale', label: '4-Bolt Hub Scale', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'vents', label: 'Centrifugal Vents', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'hubScale') {
    return { ...params, hubScale: Number(clamp(0.24 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.3, 0.24, 0.54).toFixed(2)) };
  }
  if (controlId === 'vents') {
    return { ...params, vents: Math.round(clamp(6 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 6, 6, 12)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.vents !== undefined ? Math.round(Number(params.vents)) : 10;
  return { ...params, vents: ((cur - 6 + 1) % 7) + 6 };
}`,
  },

  {
    id: 'drone-motor-stator-laminations',
    name: 'Drone Part: 12N14P Stator Core',
    category: 'Drone Parts & Frames',
    description: 'Exposed 0.2mm silicon-steel 12-tooth hammerhead stator core with multi-strand copper phase windings.',
    iconName: 'Sun',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust inner mounting ring or stator hammerheads; click in Preview Mode to cycle stator hammerheads.',
    defaultParams: {
      label: '12N14P Stator Core',
      coreRatio: 0.34,
      teeth: 12,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '12N14P Stator Core' },
      { key: 'coreRatio', label: 'Inner Mounting Ring', type: 'number', min: 0.22, max: 0.48, step: 0.01, defaultValue: 0.34 },
      { key: 'teeth', label: 'Stator Hammerheads', type: 'number', min: 9, max: 12, step: 1, defaultValue: 12 },
    ],
    jsSourceCode: `// Drone Part: 12N14P Stator Core (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.42;
      const boreR = clamp(Number(params.coreRatio) || 0.34, 0.22, 0.48) * r;
      const arms = clamp(Math.round(Number(params.teeth) || 12), 9, 12);
      const paths = [
        { d: circle(cx, cy, boreR), closed: true, fill: true },
        { d: circle(cx, cy, boreR * 0.55), closed: true },
      ];
      for (let i = 0; i < arms; i++) {
        const a = (i * Math.PI * 2) / arms;
        const x1 = cx + Math.cos(a) * boreR, y1 = cy + Math.sin(a) * boreR;
        const x2 = cx + Math.cos(a) * r * 0.88, y2 = cy + Math.sin(a) * r * 0.88;
        const px = -Math.sin(a) * 6, py = Math.cos(a) * 6;
        paths.push({ d: line(x1, y1, x2, y2), strokeWidth: 4.5 });
        paths.push({ d: line(x2 - px, y2 - py, x2 + px, y2 + py), strokeWidth: 3.5 });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.coreRatio !== undefined ? Number(params.coreRatio) : 0.34;
  const v2 = params.teeth !== undefined ? Number(params.teeth) : 12;
  const p1Norm = (clamp(v1, 0.22, 0.48) - 0.22) / Math.max(0.0001, 0.26);
  const p2Norm = (clamp(v2, 9, 12) - 9) / Math.max(0.0001, 3);
  return [
    { id: 'coreRatio', label: 'Inner Mounting Ring', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'teeth', label: 'Stator Hammerheads', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'coreRatio') {
    return { ...params, coreRatio: Number(clamp(0.22 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.26, 0.22, 0.48).toFixed(2)) };
  }
  if (controlId === 'teeth') {
    return { ...params, teeth: Math.round(clamp(9 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 9, 12)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.teeth !== undefined ? Math.round(Number(params.teeth)) : 12;
  return { ...params, teeth: ((cur - 9 + 1) % 4) + 9 };
}`,
  },

  {
    id: 'drone-motor-bell-magnets',
    name: 'Drone Part: Flux-Ring N52H Rotor Bell',
    category: 'Drone Parts & Frames',
    description: 'Inverted cross-section of a titanium-shaft rotor bell lined with curved arc N52H neodymium magnets.',
    iconName: 'CircleDot',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust flux ring thickness or arc magnet poles; click in Preview Mode to cycle arc magnet poles.',
    defaultParams: {
      label: 'N52H Rotor Bell',
      fluxWall: 0.18,
      magnets: 14,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'N52H Rotor Bell' },
      { key: 'fluxWall', label: 'Flux Ring Thickness', type: 'number', min: 0.1, max: 0.28, step: 0.01, defaultValue: 0.18 },
      { key: 'magnets', label: 'Arc Magnet Poles', type: 'number', min: 10, max: 16, step: 1, defaultValue: 14 },
    ],
    jsSourceCode: `// Drone Part: Flux-Ring N52H Rotor Bell (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.44;
      const magT = clamp(Number(params.fluxWall) || 0.18, 0.1, 0.28) * r;
      const poles = clamp(Math.round(Number(params.magnets) || 14), 10, 16);
      const innerR = r * 0.84 - magT;
      const paths = [
        { d: circle(cx, cy, r), closed: true, fill: true },
        { d: circle(cx, cy, r * 0.84), closed: true },
        { d: circle(cx, cy, innerR), closed: true, strokeDasharray: '4 2' },
        { d: circle(cx, cy, r * 0.2), closed: true },
      ];
      for (let p = 0; p < poles; p++) {
        const a = (p * Math.PI * 2) / poles;
        paths.push({ d: line(cx + Math.cos(a) * innerR, cy + Math.sin(a) * innerR, cx + Math.cos(a) * r * 0.84, cy + Math.sin(a) * r * 0.84), strokeWidth: 2 });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.fluxWall !== undefined ? Number(params.fluxWall) : 0.18;
  const v2 = params.magnets !== undefined ? Number(params.magnets) : 14;
  const p1Norm = (clamp(v1, 0.1, 0.28) - 0.1) / Math.max(0.0001, 0.18);
  const p2Norm = (clamp(v2, 10, 16) - 10) / Math.max(0.0001, 6);
  return [
    { id: 'fluxWall', label: 'Flux Ring Thickness', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'magnets', label: 'Arc Magnet Poles', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'fluxWall') {
    return { ...params, fluxWall: Number(clamp(0.1 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.18, 0.1, 0.28).toFixed(2)) };
  }
  if (controlId === 'magnets') {
    return { ...params, magnets: Math.round(clamp(10 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 6, 10, 16)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.magnets !== undefined ? Math.round(Number(params.magnets)) : 14;
  return { ...params, magnets: ((cur - 10 + 1) % 7) + 10 };
}`,
  },

  {
    id: 'drone-prop-2blade-efficient',
    name: 'Drone Part: 2-Blade Long-Range Propeller',
    category: 'Drone Parts & Frames',
    description: 'High-efficiency 2-blade scimitar long-range propeller with tapered airfoil tips and dual M2 mount holes.',
    iconName: 'Wind',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust blade chord width or rotation step; click in Preview Mode to cycle rotation step.',
    defaultParams: {
      label: '2-Blade LR Prop',
      chordRatio: 0.22,
      angleStep: 0.14,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '2-Blade LR Prop' },
      { key: 'chordRatio', label: 'Blade Chord Width', type: 'number', min: 0.12, max: 0.34, step: 0.01, defaultValue: 0.22 },
      { key: 'angleStep', label: 'Rotation Step', type: 'number', min: 0.09, max: 0.22, step: 0.01, defaultValue: 0.14 },
    ],
    jsSourceCode: `// Drone Part: 2-Blade Long-Range Propeller (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.45;
      const chord = clamp(Number(params.chordRatio) || 0.22, 0.12, 0.34) * r;
      const hubR = clamp(Number(params.angleStep) || 0.14, 0.09, 0.22) * r;
      return [
        { d: \`M \${cx} \${cy - hubR} Q \${cx + r * 0.55} \${cy - chord * 1.4} \${cx + r} \${cy - 3} Q \${cx + r * 0.55} \${cy + chord * 0.7} \${cx} \${cy + hubR} Q \${cx - r * 0.55} \${cy + chord * 1.4} \${cx - r} \${cy + 3} Q \${cx - r * 0.55} \${cy - chord * 0.7} \${cx} \${cy - hubR} Z\`, closed: true, fill: true },
        { d: circle(cx, cy, hubR), closed: true, fill: true },
        { d: circle(cx, cy, hubR * 0.42), closed: true },
      ];
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.chordRatio !== undefined ? Number(params.chordRatio) : 0.22;
  const v2 = params.angleStep !== undefined ? Number(params.angleStep) : 0.14;
  const p1Norm = (clamp(v1, 0.12, 0.34) - 0.12) / Math.max(0.0001, 0.22);
  const p2Norm = (clamp(v2, 0.09, 0.22) - 0.09) / Math.max(0.0001, 0.13);
  return [
    { id: 'chordRatio', label: 'Blade Chord Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'angleStep', label: 'Rotation Step', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'chordRatio') {
    return { ...params, chordRatio: Number(clamp(0.12 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.22, 0.12, 0.34).toFixed(2)) };
  }
  if (controlId === 'angleStep') {
    return { ...params, angleStep: Number(clamp(0.09 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.13, 0.09, 0.22).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.angleStep !== undefined ? Number(params.angleStep) : 0.14;
  const next = cur + 0.04 > 0.22 + 0.001 ? 0.09 : Number((cur + 0.04).toFixed(2));
  return { ...params, angleStep: next };
}`,
  },

  {
    id: 'drone-prop-4blade-cine',
    name: 'Drone Part: 4-Blade Bullnose Cine Prop',
    category: 'Drone Parts & Frames',
    description: 'Square-tipped 4-blade bullnose cinewhoop propeller engineered for maximum static thrust inside ducts.',
    iconName: 'Wind',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust bullnose tip width or center hub size; click in Preview Mode to cycle center hub size.',
    defaultParams: {
      label: '4-Blade Bullnose',
      tipWidth: 0.24,
      hubScale: 0.24,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '4-Blade Bullnose' },
      { key: 'tipWidth', label: 'Bullnose Tip Width', type: 'number', min: 0.14, max: 0.38, step: 0.01, defaultValue: 0.24 },
      { key: 'hubScale', label: 'Center Hub Size', type: 'number', min: 0.14, max: 0.36, step: 0.01, defaultValue: 0.24 },
    ],
    jsSourceCode: `// Drone Part: 4-Blade Bullnose Cine Prop (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.44;
      const p1Val = clamp(Number(params.tipWidth) || 0.24, 0.14, 0.38);
      const blades = 4;
      const chord = (clamp(Number(params.hubScale) || 0.24, 0.14, 0.36)) * r;
      const sweep = p1Val * 0.45;
      const paths = [];
      for (let b = 0; b < blades; b++) {
        const a = (b * Math.PI * 2) / blades - Math.PI / 2;
        const tipX = cx + Math.cos(a + sweep) * r, tipY = cy + Math.sin(a + sweep) * r;
        const c1x = cx + Math.cos(a - 0.28) * (r * 0.62), c1y = cy + Math.sin(a - 0.28) * (r * 0.62);
        const c2x = cx + Math.cos(a + 0.36) * (r * 0.55), c2y = cy + Math.sin(a + 0.36) * (r * 0.55);
        paths.push({ d: \`M \${cx} \${cy} Q \${c1x} \${c1y} \${tipX} \${tipY} Q \${c2x} \${c2y} \${cx} \${cy} Z\`, closed: true, fill: true });
      }
      paths.push({ d: circle(cx, cy, chord), closed: true, fill: true });
      paths.push({ d: circle(cx, cy, r * 0.08), closed: true });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.tipWidth !== undefined ? Number(params.tipWidth) : 0.24;
  const v2 = params.hubScale !== undefined ? Number(params.hubScale) : 0.24;
  const p1Norm = (clamp(v1, 0.14, 0.38) - 0.14) / Math.max(0.0001, 0.24);
  const p2Norm = (clamp(v2, 0.14, 0.36) - 0.14) / Math.max(0.0001, 0.22);
  return [
    { id: 'tipWidth', label: 'Bullnose Tip Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'hubScale', label: 'Center Hub Size', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'tipWidth') {
    return { ...params, tipWidth: Number(clamp(0.14 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.24, 0.14, 0.38).toFixed(2)) };
  }
  if (controlId === 'hubScale') {
    return { ...params, hubScale: Number(clamp(0.14 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.22, 0.14, 0.36).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.hubScale !== undefined ? Number(params.hubScale) : 0.24;
  const next = cur + 0.07 > 0.36 + 0.001 ? 0.14 : Number((cur + 0.07).toFixed(2));
  return { ...params, hubScale: next };
}`,
  },

  {
    id: 'drone-prop-5blade-whisper',
    name: 'Drone Part: 5-Blade Low-Noise Propeller',
    category: 'Drone Parts & Frames',
    description: 'Swept 5-blade acoustic-optimized propeller spreading blade-passage frequency for quiet operation.',
    iconName: 'Wind',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust blade sweep curvature or blade count; click in Preview Mode to cycle blade count.',
    defaultParams: {
      label: '5-Blade Whisper Prop',
      sweep: 0.24,
      blades: 5,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '5-Blade Whisper Prop' },
      { key: 'sweep', label: 'Blade Sweep Curvature', type: 'number', min: 0.14, max: 0.38, step: 0.01, defaultValue: 0.24 },
      { key: 'blades', label: 'Blade Count', type: 'number', min: 4, max: 8, step: 1, defaultValue: 5 },
    ],
    jsSourceCode: `// Drone Part: 5-Blade Low-Noise Propeller (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.44;
      const p1Val = clamp(Number(params.sweep) || 0.24, 0.14, 0.38);
      const blades = clamp(Math.round(Number(params.blades) || 5), 4, 8);
      const chord = (p1Val) * r;
      const sweep = p1Val * 0.45;
      const paths = [];
      for (let b = 0; b < blades; b++) {
        const a = (b * Math.PI * 2) / blades - Math.PI / 2;
        const tipX = cx + Math.cos(a + sweep) * r, tipY = cy + Math.sin(a + sweep) * r;
        const c1x = cx + Math.cos(a - 0.28) * (r * 0.62), c1y = cy + Math.sin(a - 0.28) * (r * 0.62);
        const c2x = cx + Math.cos(a + 0.36) * (r * 0.55), c2y = cy + Math.sin(a + 0.36) * (r * 0.55);
        paths.push({ d: \`M \${cx} \${cy} Q \${c1x} \${c1y} \${tipX} \${tipY} Q \${c2x} \${c2y} \${cx} \${cy} Z\`, closed: true, fill: true });
      }
      paths.push({ d: circle(cx, cy, r * 0.19), closed: true, fill: true });
      paths.push({ d: circle(cx, cy, r * 0.08), closed: true });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.sweep !== undefined ? Number(params.sweep) : 0.24;
  const v2 = params.blades !== undefined ? Number(params.blades) : 5;
  const p1Norm = (clamp(v1, 0.14, 0.38) - 0.14) / Math.max(0.0001, 0.24);
  const p2Norm = (clamp(v2, 4, 8) - 4) / Math.max(0.0001, 4);
  return [
    { id: 'sweep', label: 'Blade Sweep Curvature', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'blades', label: 'Blade Count', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'sweep') {
    return { ...params, sweep: Number(clamp(0.14 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.24, 0.14, 0.38).toFixed(2)) };
  }
  if (controlId === 'blades') {
    return { ...params, blades: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 4, 8)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.blades !== undefined ? Math.round(Number(params.blades)) : 5;
  return { ...params, blades: ((cur - 4 + 1) % 5) + 4 };
}`,
  },

  {
    id: 'drone-prop-6blade-ducted',
    name: 'Drone Part: 6-Blade Ducted Fan Impeller',
    category: 'Drone Parts & Frames',
    description: 'High-solidity 6-blade ducted fan rotor inside close-tolerance outer clearance shroud ring.',
    iconName: 'Fan',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust spinner cone ratio or impeller blades; click in Preview Mode to cycle impeller blades.',
    defaultParams: {
      label: '6-Blade Impeller',
      hubRatio: 0.24,
      blades: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '6-Blade Impeller' },
      { key: 'hubRatio', label: 'Spinner Cone Ratio', type: 'number', min: 0.14, max: 0.38, step: 0.01, defaultValue: 0.24 },
      { key: 'blades', label: 'Impeller Blades', type: 'number', min: 4, max: 8, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Part: 6-Blade Ducted Fan Impeller (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.44;
      const p1Val = clamp(Number(params.hubRatio) || 0.24, 0.14, 0.38);
      const blades = clamp(Math.round(Number(params.blades) || 6), 4, 8);
      const chord = (p1Val) * r;
      const sweep = p1Val * 0.45;
      const paths = [];
      for (let b = 0; b < blades; b++) {
        const a = (b * Math.PI * 2) / blades - Math.PI / 2;
        const tipX = cx + Math.cos(a + sweep) * r, tipY = cy + Math.sin(a + sweep) * r;
        const c1x = cx + Math.cos(a - 0.28) * (r * 0.62), c1y = cy + Math.sin(a - 0.28) * (r * 0.62);
        const c2x = cx + Math.cos(a + 0.36) * (r * 0.55), c2y = cy + Math.sin(a + 0.36) * (r * 0.55);
        paths.push({ d: \`M \${cx} \${cy} Q \${c1x} \${c1y} \${tipX} \${tipY} Q \${c2x} \${c2y} \${cx} \${cy} Z\`, closed: true, fill: true });
      }
      paths.push({ d: circle(cx, cy, r * 0.19), closed: true, fill: true });
      paths.push({ d: circle(cx, cy, r * 0.08), closed: true });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.hubRatio !== undefined ? Number(params.hubRatio) : 0.24;
  const v2 = params.blades !== undefined ? Number(params.blades) : 6;
  const p1Norm = (clamp(v1, 0.14, 0.38) - 0.14) / Math.max(0.0001, 0.24);
  const p2Norm = (clamp(v2, 4, 8) - 4) / Math.max(0.0001, 4);
  return [
    { id: 'hubRatio', label: 'Spinner Cone Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'blades', label: 'Impeller Blades', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'hubRatio') {
    return { ...params, hubRatio: Number(clamp(0.14 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.24, 0.14, 0.38).toFixed(2)) };
  }
  if (controlId === 'blades') {
    return { ...params, blades: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 4, 8)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.blades !== undefined ? Math.round(Number(params.blades)) : 6;
  return { ...params, blades: ((cur - 4 + 1) % 5) + 4 };
}`,
  },

  {
    id: 'drone-prop-folding-carbon',
    name: 'Drone Part: Folding Carbon Propeller Assembly',
    category: 'Drone Parts & Frames',
    description: 'CNC aluminum double-pivot hub yoke with 2 hinged swing-out carbon-fiber blades.',
    iconName: 'Minimize2',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust cnc hub yoke width or blade swing angle; click in Preview Mode to cycle blade swing angle.',
    defaultParams: {
      label: 'Folding Carbon Prop',
      yokeSpan: 0.24,
      foldDeg: 0.28,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Folding Carbon Prop' },
      { key: 'yokeSpan', label: 'CNC Hub Yoke Width', type: 'number', min: 0.05, max: 0.68, step: 0.01, defaultValue: 0.24 },
      { key: 'foldDeg', label: 'Blade Swing Angle', type: 'number', min: 0.18, max: 0.4, step: 0.01, defaultValue: 0.28 },
    ],
    jsSourceCode: `// Drone Part: Folding Carbon Propeller Assembly (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.44;
      const fold = clamp(Number(params.yokeSpan) || 0.24, 0.05, 0.68) * (Math.PI * 0.45);
      const yokeW = clamp(Number(params.foldDeg) || 0.28, 0.18, 0.4) * width;
      const pL = cx - yokeW / 2, pR = cx + yokeW / 2;
      const tipLX = pL - Math.cos(fold) * (r * 0.85), tipLY = cy + Math.sin(fold) * (r * 0.85);
      const tipRX = pR + Math.cos(fold) * (r * 0.85), tipRY = cy + Math.sin(fold) * (r * 0.85);
      return [
        { d: roundRect(pL - 6, cy - 10, yokeW + 12, 20, 6), closed: true, fill: true },
        { d: polygon([[pL, cy - 7], [tipLX, tipLY - 5], [tipLX, tipLY + 5], [pL, cy + 7]]), closed: true, fill: true },
        { d: polygon([[pR, cy - 7], [tipRX, tipRY - 5], [tipRX, tipRY + 5], [pR, cy + 7]]), closed: true, fill: true },
        { d: circle(cx, cy, 5), closed: true },
        { d: circle(pL, cy, 3.5), closed: true },
        { d: circle(pR, cy, 3.5), closed: true },
      ];
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.yokeSpan !== undefined ? Number(params.yokeSpan) : 0.24;
  const v2 = params.foldDeg !== undefined ? Number(params.foldDeg) : 0.28;
  const p1Norm = (clamp(v1, 0.05, 0.68) - 0.05) / Math.max(0.0001, 0.63);
  const p2Norm = (clamp(v2, 0.18, 0.4) - 0.18) / Math.max(0.0001, 0.22);
  return [
    { id: 'yokeSpan', label: 'CNC Hub Yoke Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'foldDeg', label: 'Blade Swing Angle', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'yokeSpan') {
    return { ...params, yokeSpan: Number(clamp(0.05 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.63, 0.05, 0.68).toFixed(2)) };
  }
  if (controlId === 'foldDeg') {
    return { ...params, foldDeg: Number(clamp(0.18 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.22, 0.18, 0.4).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.foldDeg !== undefined ? Number(params.foldDeg) : 0.28;
  const next = cur + 0.07 > 0.4 + 0.001 ? 0.18 : Number((cur + 0.07).toFixed(2));
  return { ...params, foldDeg: next };
}`,
  },

  {
    id: 'drone-prop-toroidal-loop',
    name: 'Drone Part: Toroidal Quiet Loop Propeller',
    category: 'Drone Parts & Frames',
    description: 'Closed-loop 3-ring toroidal propeller eliminating tip vortices and high-frequency acoustic whine.',
    iconName: 'Infinity',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust toroidal loop width or closed blade loops; click in Preview Mode to cycle closed blade loops.',
    defaultParams: {
      label: 'Toroidal Loop Prop',
      loopWidth: 0.36,
      loops: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Toroidal Loop Prop' },
      { key: 'loopWidth', label: 'Toroidal Loop Width', type: 'number', min: 0.22, max: 0.52, step: 0.01, defaultValue: 0.36 },
      { key: 'loops', label: 'Closed Blade Loops', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: Toroidal Quiet Loop Propeller (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.42;
      const loopW = clamp(Number(params.loopWidth) || 0.36, 0.22, 0.52) * r;
      const loops = clamp(Math.round(Number(params.loops) || 3), 2, 4);
      const paths = [];
      for (let i = 0; i < loops; i++) {
        const a = (i * Math.PI * 2) / loops - Math.PI / 2;
        const lx = cx + Math.cos(a) * (r * 0.52), ly = cy + Math.sin(a) * (r * 0.52);
        paths.push({ d: circle(lx, ly, loopW), closed: true, fill: true });
        paths.push({ d: circle(lx, ly, loopW * 0.62), closed: true });
      }
      paths.push({ d: circle(cx, cy, r * 0.2), closed: true, fill: true });
      paths.push({ d: circle(cx, cy, r * 0.08), closed: true });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.loopWidth !== undefined ? Number(params.loopWidth) : 0.36;
  const v2 = params.loops !== undefined ? Number(params.loops) : 3;
  const p1Norm = (clamp(v1, 0.22, 0.52) - 0.22) / Math.max(0.0001, 0.3);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'loopWidth', label: 'Toroidal Loop Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'loops', label: 'Closed Blade Loops', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'loopWidth') {
    return { ...params, loopWidth: Number(clamp(0.22 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.3, 0.22, 0.52).toFixed(2)) };
  }
  if (controlId === 'loops') {
    return { ...params, loops: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.loops !== undefined ? Math.round(Number(params.loops)) : 3;
  return { ...params, loops: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-prop-coaxial-counter',
    name: 'Drone Part: Counter-Rotating Coaxial Prop Pair',
    category: 'Drone Parts & Frames',
    description: 'Overlapping upper CW and lower CCW counter-rotating propellers mounted on concentric shafts.',
    iconName: 'RefreshCw',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust angular separation or blades per rotor; click in Preview Mode to cycle blades per rotor.',
    defaultParams: {
      label: 'Coaxial Prop Pair',
      sepAngle: 0.46,
      bladesPer: 0.86,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Coaxial Prop Pair' },
      { key: 'sepAngle', label: 'Angular Separation', type: 'number', min: 0.15, max: 0.85, step: 0.01, defaultValue: 0.46 },
      { key: 'bladesPer', label: 'Blades per Rotor', type: 'number', min: 0.68, max: 0.96, step: 0.01, defaultValue: 0.86 },
    ],
    jsSourceCode: `// Drone Part: Counter-Rotating Coaxial Prop Pair (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.44;
      const phase = clamp(Number(params.sepAngle) || 0.46, 0.15, 0.85) * Math.PI * 0.5;
      const scale2 = clamp(Number(params.bladesPer) || 0.86, 0.68, 0.96);
      const x1 = Math.cos(0.2) * r, y1 = Math.sin(0.2) * r;
      const x2 = Math.cos(0.2 + phase) * r * scale2, y2 = Math.sin(0.2 + phase) * r * scale2;
      return [
        { d: polygon([[cx - x1, cy - y1 - 7], [cx + x1, cy + y1 - 7], [cx + x1, cy + y1 + 7], [cx - x1, cy - y1 + 7]]), closed: true, fill: true },
        { d: polygon([[cx - x2, cy - y2 - 6], [cx + x2, cy + y2 - 6], [cx + x2, cy + y2 + 6], [cx - x2, cy - y2 + 6]]), closed: true, strokeDasharray: '4 3' },
        { d: circle(cx, cy, r * 0.2), closed: true, fill: true },
        { d: circle(cx, cy, r * 0.08), closed: true },
      ];
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.sepAngle !== undefined ? Number(params.sepAngle) : 0.46;
  const v2 = params.bladesPer !== undefined ? Number(params.bladesPer) : 0.86;
  const p1Norm = (clamp(v1, 0.15, 0.85) - 0.15) / Math.max(0.0001, 0.7);
  const p2Norm = (clamp(v2, 0.68, 0.96) - 0.68) / Math.max(0.0001, 0.28);
  return [
    { id: 'sepAngle', label: 'Angular Separation', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'bladesPer', label: 'Blades per Rotor', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'sepAngle') {
    return { ...params, sepAngle: Number(clamp(0.15 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.7, 0.15, 0.85).toFixed(2)) };
  }
  if (controlId === 'bladesPer') {
    return { ...params, bladesPer: Number(clamp(0.68 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.28, 0.68, 0.96).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.bladesPer !== undefined ? Number(params.bladesPer) : 0.86;
  const next = cur + 0.09 > 0.96 + 0.001 ? 0.68 : Number((cur + 0.09).toFixed(2));
  return { ...params, bladesPer: next };
}`,
  },

  {
    id: 'drone-prop-variable-pitch-hub',
    name: 'Drone Part: Collective Variable-Pitch Hub',
    category: 'Drone Parts & Frames',
    description: 'Collective-pitch rotor head with lower swashplate ring, pitch-link pushrods, and pivoting blade grips.',
    iconName: 'Sliders',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust swashplate position y or collective pitch angle; click in Preview Mode to cycle collective pitch angle.',
    defaultParams: {
      label: 'Variable-Pitch Hub',
      swashY: 0.58,
      pitchTilt: 0.22,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Variable-Pitch Hub' },
      { key: 'swashY', label: 'Swashplate Position Y', type: 'number', min: 0.38, max: 0.76, step: 0.01, defaultValue: 0.58 },
      { key: 'pitchTilt', label: 'Collective Pitch Angle', type: 'number', min: -0.35, max: 0.35, step: 0.01, defaultValue: 0.22 },
    ],
    jsSourceCode: `// Drone Part: Collective Variable-Pitch Hub (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const swashY = clamp(Number(params.swashY) || 0.58, 0.38, 0.76) * height;
      const pitch = clamp((params.pitchTilt !== undefined ? Number(params.pitchTilt) : 0.22), -0.35, 0.35) * 28;
      const headY = height * 0.26, span = width * 0.42;
      return [
        { d: line(cx, height * 0.14, cx, height * 0.86), strokeWidth: 5 },
        { d: roundRect(cx - 18, headY - 8, 36, 16, 4), closed: true, fill: true },
        { d: polygon([[cx - 18, headY - 5], [cx - span, headY - 6 - pitch], [cx - span, headY + 6 - pitch], [cx - 18, headY + 5]]), closed: true, fill: true },
        { d: polygon([[cx + 18, headY - 5], [cx + span, headY - 6 + pitch], [cx + span, headY + 6 + pitch], [cx + 18, headY + 5]]), closed: true, fill: true },
        { d: roundRect(cx - 26, swashY - 7, 52, 14, 4), closed: true, fill: true },
        { d: line(cx - 20, swashY - 7, cx - 20, headY + 6), strokeWidth: 2 },
        { d: line(cx + 20, swashY - 7, cx + 20, headY + 6), strokeWidth: 2 },
      ];
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.swashY !== undefined ? Number(params.swashY) : 0.58;
  const v2 = params.pitchTilt !== undefined ? Number(params.pitchTilt) : 0.22;
  const p1Norm = (clamp(v1, 0.38, 0.76) - 0.38) / Math.max(0.0001, 0.38);
  const p2Norm = (clamp(v2, -0.35, 0.35) - -0.35) / Math.max(0.0001, 0.7);
  return [
    { id: 'swashY', label: 'Swashplate Position Y', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'pitchTilt', label: 'Collective Pitch Angle', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'swashY') {
    return { ...params, swashY: Number(clamp(0.38 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.38, 0.38, 0.76).toFixed(2)) };
  }
  if (controlId === 'pitchTilt') {
    return { ...params, pitchTilt: Number(clamp(-0.35 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.7, -0.35, 0.35).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.pitchTilt !== undefined ? Number(params.pitchTilt) : 0.22;
  const next = cur + 0.23 > 0.35 + 0.001 ? -0.35 : Number((cur + 0.23).toFixed(2));
  return { ...params, pitchTilt: next };
}`,
  },

  {
    id: 'drone-prop-quick-release-adapter',
    name: 'Drone Part: Twist-Lock Quick-Release Hub',
    category: 'Drone Parts & Frames',
    description: 'Spring-loaded bayonet twist-lock propeller mount with 3 radial locking lugs and center plunger.',
    iconName: 'Lock',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust bayonet lug reach or locking lugs; click in Preview Mode to cycle locking lugs.',
    defaultParams: {
      label: 'QR Prop Adapter',
      lugReach: 0.72,
      lugs: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'QR Prop Adapter' },
      { key: 'lugReach', label: 'Bayonet Lug Reach', type: 'number', min: 0.5, max: 0.88, step: 0.01, defaultValue: 0.72 },
      { key: 'lugs', label: 'Locking Lugs', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: Twist-Lock Quick-Release Hub (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.42;
      const capR = clamp(Number(params.lugReach) || 0.72, 0.5, 0.88) * r;
      const lugs = clamp(Math.round(Number(params.lugs) || 3), 2, 4);
      const paths = [
        { d: circle(cx, cy, r), closed: true, fill: true },
        { d: circle(cx, cy, capR), closed: true },
        { d: circle(cx, cy, capR * 0.42), closed: true },
      ];
      for (let l = 0; l < lugs; l++) {
        const a = (l * Math.PI * 2) / lugs;
        const lx = cx + Math.cos(a) * (capR * 0.78), ly = cy + Math.sin(a) * (capR * 0.78);
        paths.push({ d: circle(lx, ly, 6), closed: true, fill: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.lugReach !== undefined ? Number(params.lugReach) : 0.72;
  const v2 = params.lugs !== undefined ? Number(params.lugs) : 3;
  const p1Norm = (clamp(v1, 0.5, 0.88) - 0.5) / Math.max(0.0001, 0.38);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'lugReach', label: 'Bayonet Lug Reach', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'lugs', label: 'Locking Lugs', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'lugReach') {
    return { ...params, lugReach: Number(clamp(0.5 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.38, 0.5, 0.88).toFixed(2)) };
  }
  if (controlId === 'lugs') {
    return { ...params, lugs: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.lugs !== undefined ? Math.round(Number(params.lugs)) : 3;
  return { ...params, lugs: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-prop-nut-nylock-cone',
    name: 'Drone Part: Low-Profile M5 Prop Nut',
    category: 'Drone Parts & Frames',
    description: 'Aerodynamic anodized aluminum M5 bullet spinner nut with hex wrench base and nylon lock insert.',
    iconName: 'Triangle',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust hex flange width or spinner cone height (%); click in Preview Mode to cycle spinner cone height (%).',
    defaultParams: {
      label: 'M5 Bullet Prop Nut',
      baseWidth: 0.74,
      coneHeight: 8,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'M5 Bullet Prop Nut' },
      { key: 'baseWidth', label: 'Hex Flange Width', type: 'number', min: 0.54, max: 0.88, step: 0.01, defaultValue: 0.74 },
      { key: 'coneHeight', label: 'Spinner Cone Height (%)', type: 'number', min: 6, max: 12, step: 1, defaultValue: 8 },
    ],
    jsSourceCode: `// Drone Part: Low-Profile M5 Prop Nut (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.42;
      const hexR = clamp(Number(params.baseWidth) || 0.74, 0.54, 0.88) * r;
      const teeth = clamp(Math.round(Number(params.coneHeight) || 8), 6, 12);
      const hexPts = Array.from({length:6}, (_,i) => {
        const a = (i * Math.PI) / 3 - Math.PI / 2;
        return [cx + Math.cos(a) * hexR, cy + Math.sin(a) * hexR];
      });
      const paths = [
        { d: circle(cx, cy, r), closed: true, fill: true },
        { d: polygon(hexPts), closed: true },
        { d: circle(cx, cy, hexR * 0.54), closed: true },
        { d: circle(cx, cy, hexR * 0.36), closed: true, strokeDasharray: '3 2' },
      ];
      for (let t = 0; t < teeth; t++) {
        const a = (t * Math.PI * 2) / teeth;
        paths.push({ d: line(cx + Math.cos(a) * hexR, cy + Math.sin(a) * hexR, cx + Math.cos(a) * r, cy + Math.sin(a) * r) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.baseWidth !== undefined ? Number(params.baseWidth) : 0.74;
  const v2 = params.coneHeight !== undefined ? Number(params.coneHeight) : 8;
  const p1Norm = (clamp(v1, 0.54, 0.88) - 0.54) / Math.max(0.0001, 0.34);
  const p2Norm = (clamp(v2, 6, 12) - 6) / Math.max(0.0001, 6);
  return [
    { id: 'baseWidth', label: 'Hex Flange Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'coneHeight', label: 'Spinner Cone Height (%)', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'baseWidth') {
    return { ...params, baseWidth: Number(clamp(0.54 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.34, 0.54, 0.88).toFixed(2)) };
  }
  if (controlId === 'coneHeight') {
    return { ...params, coneHeight: Math.round(clamp(6 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 6, 6, 12)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.coneHeight !== undefined ? Math.round(Number(params.coneHeight)) : 8;
  return { ...params, coneHeight: ((cur - 6 + 1) % 7) + 6 };
}`,
  },

  {
    id: 'drone-edf-electric-ducted-fan',
    name: 'Drone Part: 70mm/90mm EDF Jet Unit',
    category: 'Drone Parts & Frames',
    description: 'High-velocity Electric Ducted Fan unit with aerodynamic intake lip, multi-blade rotor, and stator tailcone.',
    iconName: 'Fan',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust intake lip wall or edf rotor blades; click in Preview Mode to cycle edf rotor blades.',
    defaultParams: {
      label: '90mm EDF Jet Unit',
      lipThick: 0.24,
      blades: 9,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '90mm EDF Jet Unit' },
      { key: 'lipThick', label: 'Intake Lip Wall', type: 'number', min: 0.14, max: 0.36, step: 0.01, defaultValue: 0.24 },
      { key: 'blades', label: 'EDF Rotor Blades', type: 'number', min: 7, max: 12, step: 1, defaultValue: 9 },
    ],
    jsSourceCode: `// Drone Part: 70mm/90mm EDF Jet Unit (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.44;
      const coneR = clamp(Number(params.lipThick) || 0.24, 0.14, 0.36) * r;
      const blades = clamp(Math.round(Number(params.blades) || 9), 7, 12);
      const paths = [
        { d: circle(cx, cy, r), closed: true, fill: true },
        { d: circle(cx, cy, r * 0.82), closed: true },
      ];
      for (let b = 0; b < blades; b++) {
        const a0 = (b * Math.PI * 2) / blades, a1 = a0 + 0.35;
        paths.push({ d: line(cx + Math.cos(a0) * coneR, cy + Math.sin(a0) * coneR, cx + Math.cos(a1) * r * 0.82, cy + Math.sin(a1) * r * 0.82), strokeWidth: 2.5 });
      }
      paths.push({ d: circle(cx, cy, coneR), closed: true, fill: true });
      paths.push({ d: circle(cx, cy, coneR * 0.35), closed: true });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.lipThick !== undefined ? Number(params.lipThick) : 0.24;
  const v2 = params.blades !== undefined ? Number(params.blades) : 9;
  const p1Norm = (clamp(v1, 0.14, 0.36) - 0.14) / Math.max(0.0001, 0.22);
  const p2Norm = (clamp(v2, 7, 12) - 7) / Math.max(0.0001, 5);
  return [
    { id: 'lipThick', label: 'Intake Lip Wall', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'blades', label: 'EDF Rotor Blades', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'lipThick') {
    return { ...params, lipThick: Number(clamp(0.14 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.22, 0.14, 0.36).toFixed(2)) };
  }
  if (controlId === 'blades') {
    return { ...params, blades: Math.round(clamp(7 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 5, 7, 12)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.blades !== undefined ? Math.round(Number(params.blades)) : 9;
  return { ...params, blades: ((cur - 7 + 1) % 6) + 7 };
}`,
  },

  {
    id: 'drone-micro-turbojet-turbine',
    name: 'Drone Part: Micro Gas Turbine Engine',
    category: 'Drone Parts & Frames',
    description: 'JetCat-class micro turbojet engine with starter nose cone, compressor casing, fuel ring, and exhaust nozzle.',
    iconName: 'Flame',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust compressor diameter or exhaust nozzle taper; click in Preview Mode to cycle exhaust nozzle taper.',
    defaultParams: {
      label: 'Micro Turbojet',
      bodyThick: 0.62,
      nozzleTap: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Micro Turbojet' },
      { key: 'bodyThick', label: 'Compressor Diameter', type: 'number', min: 0.42, max: 0.82, step: 0.01, defaultValue: 0.62 },
      { key: 'nozzleTap', label: 'Exhaust Nozzle Taper', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: Micro Gas Turbine Engine (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cy = height / 2;
      const throat = clamp(Number(params.bodyThick) || 0.62, 0.42, 0.82) * (height * 0.34);
      const stages = clamp(Math.round(Number(params.nozzleTap) || 3), 2, 4);
      const bH = height * 0.34, x0 = width * 0.1, x1 = width * 0.66, x2 = width * 0.9;
      const paths = [
        { d: polygon([[x0, cy - bH], [x1, cy - bH], [x2, cy - throat], [x2, cy + throat], [x1, cy + bH], [x0, cy + bH]]), closed: true, fill: true },
        { d: polygon([[x0 - 10, cy], [x0 + 14, cy - bH * 0.55], [x0 + 14, cy + bH * 0.55]]), closed: true, fill: true },
      ];
      for (let s = 0; s < stages; s++) {
        const sx = x0 + 24 + (s * (x1 - x0 - 32)) / Math.max(1, stages - 1);
        paths.push({ d: line(sx, cy - bH, sx, cy + bH), strokeWidth: 2 });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.bodyThick !== undefined ? Number(params.bodyThick) : 0.62;
  const v2 = params.nozzleTap !== undefined ? Number(params.nozzleTap) : 3;
  const p1Norm = (clamp(v1, 0.42, 0.82) - 0.42) / Math.max(0.0001, 0.4);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'bodyThick', label: 'Compressor Diameter', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'nozzleTap', label: 'Exhaust Nozzle Taper', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'bodyThick') {
    return { ...params, bodyThick: Number(clamp(0.42 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.4, 0.42, 0.82).toFixed(2)) };
  }
  if (controlId === 'nozzleTap') {
    return { ...params, nozzleTap: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.nozzleTap !== undefined ? Math.round(Number(params.nozzleTap)) : 3;
  return { ...params, nozzleTap: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-hybrid-gas-generator',
    name: 'Drone Part: 2-Stroke Hybrid Range Extender',
    category: 'Drone Parts & Frames',
    description: 'Airborne 2-stroke gasoline engine directly coupled to a high-output brushless DC starter/generator.',
    iconName: 'Zap',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust cooling head width or cylinder cooling fins; click in Preview Mode to cycle cylinder cooling fins.',
    defaultParams: {
      label: 'Hybrid Gas Generator',
      headWidth: 0.38,
      fins: 5,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Hybrid Gas Generator' },
      { key: 'headWidth', label: 'Cooling Head Width', type: 'number', min: 0.24, max: 0.52, step: 0.01, defaultValue: 0.38 },
      { key: 'fins', label: 'Cylinder Cooling Fins', type: 'number', min: 3, max: 7, step: 1, defaultValue: 5 },
    ],
    jsSourceCode: `// Drone Part: 2-Stroke Hybrid Range Extender (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const cylH = clamp(Number(params.headWidth) || 0.38, 0.24, 0.52) * height;
      const fins = clamp(Math.round(Number(params.fins) || 5), 3, 7);
      const cW = width * 0.36;
      const paths = [
        { d: roundRect(cx - cW / 2, cy, cW, height * 0.34, 8), closed: true, fill: true },
        { d: circle(cx, cy + height * 0.17, cW * 0.32), closed: true },
        { d: rect(cx - cW * 0.34, cy - cylH, cW * 0.68, cylH), closed: true, fill: true },
        { d: roundRect(cx + cW / 2, cy + 4, 24, 18, 4), closed: true, fill: true },
      ];
      for (let f = 0; f < fins; f++) {
        const fy = cy - cylH + (f * (cylH - 6)) / Math.max(1, fins - 1);
        paths.push({ d: line(cx - cW * 0.48, fy, cx + cW * 0.48, fy), strokeWidth: 2.5 });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.headWidth !== undefined ? Number(params.headWidth) : 0.38;
  const v2 = params.fins !== undefined ? Number(params.fins) : 5;
  const p1Norm = (clamp(v1, 0.24, 0.52) - 0.24) / Math.max(0.0001, 0.28);
  const p2Norm = (clamp(v2, 3, 7) - 3) / Math.max(0.0001, 4);
  return [
    { id: 'headWidth', label: 'Cooling Head Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'fins', label: 'Cylinder Cooling Fins', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'headWidth') {
    return { ...params, headWidth: Number(clamp(0.24 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.28, 0.24, 0.52).toFixed(2)) };
  }
  if (controlId === 'fins') {
    return { ...params, fins: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 3, 7)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.fins !== undefined ? Math.round(Number(params.fins)) : 5;
  return { ...params, fins: ((cur - 3 + 1) % 5) + 3 };
}`,
  },

  {
    id: 'drone-fuel-cell-hydrogen-stack',
    name: 'Drone Part: PEM Hydrogen Fuel Cell Stack',
    category: 'Drone Parts & Frames',
    description: 'Proton-exchange membrane (PEM) fuel cell stack paired with a carbon-wrapped composite H2 tank.',
    iconName: 'BatteryCharging',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust pem stack width or bipolar cell plates; click in Preview Mode to cycle bipolar cell plates.',
    defaultParams: {
      label: 'H2 Fuel Cell Stack',
      stackWidth: 0.52,
      plates: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'H2 Fuel Cell Stack' },
      { key: 'stackWidth', label: 'PEM Stack Width', type: 'number', min: 0.34, max: 0.68, step: 0.01, defaultValue: 0.52 },
      { key: 'plates', label: 'Bipolar Cell Plates', type: 'number', min: 4, max: 9, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Part: PEM Hydrogen Fuel Cell Stack (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cy = height / 2;
      const tankW = clamp(Number(params.stackWidth) || 0.52, 0.34, 0.68) * width;
      const plates = clamp(Math.round(Number(params.plates) || 6), 4, 9);
      const tX = width * 0.08, tH = height * 0.54, sX = tX + tankW + 12, sW = width * 0.88 - sX;
      const paths = [
        { d: roundRect(tX, cy - tH / 2, tankW, tH, tH / 2), closed: true, fill: true },
        { d: rect(tX + tankW, cy - 8, 12, 16), closed: true },
        { d: roundRect(sX, cy - tH * 0.46, sW, tH * 0.92, 4), closed: true, fill: true },
      ];
      for (let p = 1; p <= plates; p++) {
        const px = sX + (p * sW) / (plates + 1);
        paths.push({ d: line(px, cy - tH * 0.46, px, cy + tH * 0.46) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.stackWidth !== undefined ? Number(params.stackWidth) : 0.52;
  const v2 = params.plates !== undefined ? Number(params.plates) : 6;
  const p1Norm = (clamp(v1, 0.34, 0.68) - 0.34) / Math.max(0.0001, 0.34);
  const p2Norm = (clamp(v2, 4, 9) - 4) / Math.max(0.0001, 5);
  return [
    { id: 'stackWidth', label: 'PEM Stack Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'plates', label: 'Bipolar Cell Plates', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'stackWidth') {
    return { ...params, stackWidth: Number(clamp(0.34 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.34, 0.34, 0.68).toFixed(2)) };
  }
  if (controlId === 'plates') {
    return { ...params, plates: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 5, 4, 9)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.plates !== undefined ? Math.round(Number(params.plates)) : 6;
  return { ...params, plates: ((cur - 4 + 1) % 6) + 4 };
}`,
  },

  {
    id: 'drone-solar-wing-array-panel',
    name: 'Drone Part: High-Efficiency Solar Wing Cell',
    category: 'Drone Parts & Frames',
    description: 'Encapsulated flexible SunPower monocrystalline solar cell array with silver interconnect busbars.',
    iconName: 'Sun',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust busbar margin ratio or solar cell columns; click in Preview Mode to cycle solar cell columns.',
    defaultParams: {
      label: 'Solar Wing Array',
      busInset: 6,
      cells: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Solar Wing Array' },
      { key: 'busInset', label: 'Busbar Margin Ratio', type: 'number', min: 4, max: 8, step: 1, defaultValue: 6 },
      { key: 'cells', label: 'Solar Cell Columns', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: High-Efficiency Solar Wing Cell (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const cols = clamp(Math.round(Number(params.busInset) || 6), 4, 8);
      const rows = clamp(Math.round(Number(params.cells) || 3), 2, 4);
      const wW = width * 0.84, wH = height * 0.62, ox = cx - wW / 2, oy = cy - wH / 2;
      const paths = [{ d: roundRect(ox, oy, wW, wH, 8), closed: true, fill: true }];
      const cW = (wW - 16) / cols, cH = (wH - 16) / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          paths.push({ d: rect(ox + 8 + c * cW + 1.5, oy + 8 + r * cH + 1.5, cW - 3, cH - 3), closed: true });
        }
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.busInset !== undefined ? Number(params.busInset) : 6;
  const v2 = params.cells !== undefined ? Number(params.cells) : 3;
  const p1Norm = (clamp(v1, 4, 8) - 4) / Math.max(0.0001, 4);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'busInset', label: 'Busbar Margin Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'cells', label: 'Solar Cell Columns', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'busInset') {
    return { ...params, busInset: Math.round(clamp(4 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 4, 4, 8)) };
  }
  if (controlId === 'cells') {
    return { ...params, cells: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.cells !== undefined ? Math.round(Number(params.cells)) : 3;
  return { ...params, cells: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-thrust-vectoring-nozzle',
    name: 'Drone Part: 2-Axis Thrust Vectoring Gimbal',
    category: 'Drone Parts & Frames',
    description: 'Dual-ring gimbaled nozzle with 4 internal aerodynamic deflection vanes for VTOL hover control.',
    iconName: 'Compass',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust vector deflection or deflection vanes; click in Preview Mode to cycle deflection vanes.',
    defaultParams: {
      label: 'Thrust Vector Nozzle',
      vaneShift: 0.16,
      vanes: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Thrust Vector Nozzle' },
      { key: 'vaneShift', label: 'Vector Deflection', type: 'number', min: -0.35, max: 0.35, step: 0.01, defaultValue: 0.16 },
      { key: 'vanes', label: 'Deflection Vanes', type: 'number', min: 4, max: 8, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Part: 2-Axis Thrust Vectoring Gimbal (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const defl = clamp((params.vaneShift !== undefined ? Number(params.vaneShift) : 0.16), -0.35, 0.35) * width * 0.4;
      const petals = clamp(Math.round(Number(params.vanes) || 6), 4, 8);
      const topY = height * 0.18, midY = height * 0.46, botY = height * 0.84, w1 = width * 0.32, w2 = width * 0.24;
      const paths = [
        { d: roundRect(cx - w1, topY, w1 * 2, midY - topY, 4), closed: true, fill: true },
        { d: polygon([[cx - w1, midY], [cx + w1, midY], [cx + defl + w2, botY], [cx + defl - w2, botY]]), closed: true, fill: true },
      ];
      for (let p = 1; p < petals; p++) {
        const t = p / petals;
        paths.push({ d: line(cx - w1 + t * w1 * 2, midY, cx + defl - w2 + t * w2 * 2, botY) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.vaneShift !== undefined ? Number(params.vaneShift) : 0.16;
  const v2 = params.vanes !== undefined ? Number(params.vanes) : 6;
  const p1Norm = (clamp(v1, -0.35, 0.35) - -0.35) / Math.max(0.0001, 0.7);
  const p2Norm = (clamp(v2, 4, 8) - 4) / Math.max(0.0001, 4);
  return [
    { id: 'vaneShift', label: 'Vector Deflection', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'vanes', label: 'Deflection Vanes', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'vaneShift') {
    return { ...params, vaneShift: Number(clamp(-0.35 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.7, -0.35, 0.35).toFixed(2)) };
  }
  if (controlId === 'vanes') {
    return { ...params, vanes: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 4, 8)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.vanes !== undefined ? Math.round(Number(params.vanes)) : 6;
  return { ...params, vanes: ((cur - 4 + 1) % 5) + 4 };
}`,
  },

  {
    id: 'drone-magnetic-prop-balancer',
    name: 'Drone Part: Magnetic Levitation Prop Balancer',
    category: 'Drone Parts & Frames',
    description: 'Zero-friction magnetic suspension propeller balancer stand with pointed carbon shaft and mounted prop.',
    iconName: 'Scale',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust tower spacing ratio or prop balance tilt; click in Preview Mode to cycle prop balance tilt.',
    defaultParams: {
      label: 'Mag Prop Balancer',
      standSpan: 0.48,
      propTilt: 0.18,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Mag Prop Balancer' },
      { key: 'standSpan', label: 'Tower Spacing Ratio', type: 'number', min: 0.32, max: 0.68, step: 0.01, defaultValue: 0.48 },
      { key: 'propTilt', label: 'Prop Balance Tilt', type: 'number', min: -0.3, max: 0.3, step: 0.01, defaultValue: 0.18 },
    ],
    jsSourceCode: `// Drone Part: Magnetic Levitation Prop Balancer (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const uW = clamp(Number(params.standSpan) || 0.48, 0.32, 0.68) * width;
      const tilt = clamp((params.propTilt !== undefined ? Number(params.propTilt) : 0.18), -0.3, 0.3) * 28;
      const bY = height * 0.82, topY = height * 0.22;
      return [
        { d: roundRect(cx - uW * 0.62, bY - 8, uW * 1.24, 12, 3), closed: true, fill: true },
        { d: line(cx - uW / 2, bY - 8, cx - uW / 2, topY), strokeWidth: 4 },
        { d: line(cx + uW / 2, bY - 8, cx + uW / 2, topY), strokeWidth: 4 },
        { d: line(cx - uW / 2 - 6, cy - 8, cx + uW / 2 + 6, cy - 8), strokeWidth: 2.5 },
        { d: polygon([[cx, cy - 8], [cx - width * 0.42, cy - 14 - tilt], [cx - width * 0.42, cy - 2 - tilt]]), closed: true, fill: true },
        { d: polygon([[cx, cy - 8], [cx + width * 0.42, cy - 14 + tilt], [cx + width * 0.42, cy - 2 + tilt]]), closed: true, fill: true },
        { d: circle(cx, cy - 8, 7), closed: true, fill: true },
      ];
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.standSpan !== undefined ? Number(params.standSpan) : 0.48;
  const v2 = params.propTilt !== undefined ? Number(params.propTilt) : 0.18;
  const p1Norm = (clamp(v1, 0.32, 0.68) - 0.32) / Math.max(0.0001, 0.36);
  const p2Norm = (clamp(v2, -0.3, 0.3) - -0.3) / Math.max(0.0001, 0.6);
  return [
    { id: 'standSpan', label: 'Tower Spacing Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'propTilt', label: 'Prop Balance Tilt', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'standSpan') {
    return { ...params, standSpan: Number(clamp(0.32 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.36, 0.32, 0.68).toFixed(2)) };
  }
  if (controlId === 'propTilt') {
    return { ...params, propTilt: Number(clamp(-0.3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.6, -0.3, 0.3).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.propTilt !== undefined ? Number(params.propTilt) : 0.18;
  const next = cur + 0.2 > 0.3 + 0.001 ? -0.3 : Number((cur + 0.2).toFixed(2));
  return { ...params, propTilt: next };
}`,
  },

  {
    id: 'drone-motor-wire-raceway',
    name: 'Drone Part: Arm LED & Motor Wire Shield',
    category: 'Drone Parts & Frames',
    description: '3-phase motor wire solder raceway PCB with integrated addressable RGB LEDs protecting arm leads.',
    iconName: 'Zap',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust raceway strip height or addressable leds; click in Preview Mode to cycle addressable leds.',
    defaultParams: {
      label: 'Arm Wire Raceway',
      stripHeight: 0.36,
      leds: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Arm Wire Raceway' },
      { key: 'stripHeight', label: 'Raceway Strip Height', type: 'number', min: 0.22, max: 0.52, step: 0.01, defaultValue: 0.36 },
      { key: 'leds', label: 'Addressable LEDs', type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: Arm LED & Motor Wire Shield (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const shieldH = clamp(Number(params.stripHeight) || 0.36, 0.22, 0.52) * height;
      const clips = clamp(Math.round(Number(params.leds) || 3), 2, 5);
      const rW = width * 0.82, ox = cx - rW / 2;
      const paths = [
        { d: roundRect(ox, cy - shieldH / 2, rW, shieldH, 6), closed: true, fill: true },
        { d: line(ox - 10, cy - shieldH * 0.24, ox + rW + 10, cy - shieldH * 0.24), strokeWidth: 2 },
        { d: line(ox - 10, cy, ox + rW + 10, cy), strokeWidth: 2 },
        { d: line(ox - 10, cy + shieldH * 0.24, ox + rW + 10, cy + shieldH * 0.24), strokeWidth: 2 },
      ];
      for (let c = 0; c < clips; c++) {
        const cxp = ox + 16 + (c * (rW - 32)) / Math.max(1, clips - 1);
        paths.push({ d: rect(cxp - 5, cy - shieldH / 2 - 4, 10, shieldH + 8), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.stripHeight !== undefined ? Number(params.stripHeight) : 0.36;
  const v2 = params.leds !== undefined ? Number(params.leds) : 3;
  const p1Norm = (clamp(v1, 0.22, 0.52) - 0.22) / Math.max(0.0001, 0.3);
  const p2Norm = (clamp(v2, 2, 5) - 2) / Math.max(0.0001, 3);
  return [
    { id: 'stripHeight', label: 'Raceway Strip Height', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'leds', label: 'Addressable LEDs', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'stripHeight') {
    return { ...params, stripHeight: Number(clamp(0.22 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.3, 0.22, 0.52).toFixed(2)) };
  }
  if (controlId === 'leds') {
    return { ...params, leds: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 2, 5)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.leds !== undefined ? Math.round(Number(params.leds)) : 3;
  return { ...params, leds: ((cur - 2 + 1) % 4) + 2 };
}`,
  },

  {
    id: 'drone-ceramic-ball-bearing',
    name: 'Drone Part: EZO/Hybrid Ceramic Motor Bearing',
    category: 'Drone Parts & Frames',
    description: 'High-RPM ABEC-7 hybrid ceramic motor bearing with inner/outer steel races and Si3N4 ceramic balls.',
    iconName: 'Circle',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust shaft bore ratio or ceramic bearing balls; click in Preview Mode to cycle ceramic bearing balls.',
    defaultParams: {
      label: 'Ceramic Bearing',
      innerRatio: 0.36,
      balls: 8,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Ceramic Bearing' },
      { key: 'innerRatio', label: 'Shaft Bore Ratio', type: 'number', min: 0.22, max: 0.52, step: 0.01, defaultValue: 0.36 },
      { key: 'balls', label: 'Ceramic Bearing Balls', type: 'number', min: 6, max: 12, step: 1, defaultValue: 8 },
    ],
    jsSourceCode: `// Drone Part: EZO/Hybrid Ceramic Motor Bearing (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.44;
      const boreR = clamp(Number(params.innerRatio) || 0.36, 0.22, 0.52) * r;
      const balls = clamp(Math.round(Number(params.balls) || 8), 6, 12);
      const pitchR = (r * 0.82 + boreR * 1.18) / 2, bR = (r * 0.82 - boreR * 1.18) * 0.42;
      const paths = [
        { d: circle(cx, cy, r), closed: true, fill: true },
        { d: circle(cx, cy, r * 0.82), closed: true },
        { d: circle(cx, cy, boreR * 1.18), closed: true },
        { d: circle(cx, cy, boreR), closed: true, fill: true },
      ];
      for (let b = 0; b < balls; b++) {
        const a = (b * Math.PI * 2) / balls;
        paths.push({ d: circle(cx + Math.cos(a) * pitchR, cy + Math.sin(a) * pitchR, bR), closed: true, fill: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.innerRatio !== undefined ? Number(params.innerRatio) : 0.36;
  const v2 = params.balls !== undefined ? Number(params.balls) : 8;
  const p1Norm = (clamp(v1, 0.22, 0.52) - 0.22) / Math.max(0.0001, 0.3);
  const p2Norm = (clamp(v2, 6, 12) - 6) / Math.max(0.0001, 6);
  return [
    { id: 'innerRatio', label: 'Shaft Bore Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'balls', label: 'Ceramic Bearing Balls', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'innerRatio') {
    return { ...params, innerRatio: Number(clamp(0.22 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.3, 0.22, 0.52).toFixed(2)) };
  }
  if (controlId === 'balls') {
    return { ...params, balls: Math.round(clamp(6 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 6, 6, 12)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.balls !== undefined ? Math.round(Number(params.balls)) : 8;
  return { ...params, balls: ((cur - 6 + 1) % 7) + 6 };
}`,
  },

  {
    id: 'drone-c-clip-shaft-retainer',
    name: 'Drone Part: Titanium Shaft E-Clip & Shim',
    category: 'Drone Parts & Frames',
    description: ' hardened spring-steel 3-prong E-clip shaft retainer paired with a precision brass thrust shim.',
    iconName: 'Disc',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust e-clip outer scale or retainer opening; click in Preview Mode to cycle retainer opening.',
    defaultParams: {
      label: 'Shaft E-Clip & Shim',
      clipRadius: 0.36,
      gapSize: 0.22,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Shaft E-Clip & Shim' },
      { key: 'clipRadius', label: 'E-Clip Outer Scale', type: 'number', min: 0.2, max: 0.52, step: 0.01, defaultValue: 0.36 },
      { key: 'gapSize', label: 'Retainer Opening', type: 'number', min: 0.12, max: 0.34, step: 0.01, defaultValue: 0.22 },
    ],
    jsSourceCode: `// Drone Part: Titanium Shaft E-Clip & Shim (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.42;
      const gap = clamp(Number(params.clipRadius) || 0.36, 0.2, 0.52) * Math.PI;
      const lug = clamp(Number(params.gapSize) || 0.22, 0.12, 0.34) * r;
      const a0 = Math.PI / 2 + gap, a1 = Math.PI / 2 - gap + Math.PI * 2;
      const x0 = cx + Math.cos(a0) * r, y0 = cy + Math.sin(a0) * r;
      const x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
      const inR = r * 0.62;
      return [
        { d: \`M \${x0} \${y0} A \${r} \${r} 0 1 1 \${x1} \${y1}\`, strokeWidth: 8 },
        { d: circle(cx, cy, inR), closed: true, strokeDasharray: '4 3' },
        { d: roundRect(cx - 5, cy - inR - 2, 10, lug + 4, 2), closed: true, fill: true },
        { d: roundRect(cx - inR - 2, cy - 5, lug + 4, 10, 2), closed: true, fill: true },
        { d: roundRect(cx + inR - lug - 2, cy - 5, lug + 4, 10, 2), closed: true, fill: true },
      ];
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.clipRadius !== undefined ? Number(params.clipRadius) : 0.36;
  const v2 = params.gapSize !== undefined ? Number(params.gapSize) : 0.22;
  const p1Norm = (clamp(v1, 0.2, 0.52) - 0.2) / Math.max(0.0001, 0.32);
  const p2Norm = (clamp(v2, 0.12, 0.34) - 0.12) / Math.max(0.0001, 0.22);
  return [
    { id: 'clipRadius', label: 'E-Clip Outer Scale', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'gapSize', label: 'Retainer Opening', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'clipRadius') {
    return { ...params, clipRadius: Number(clamp(0.2 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.32, 0.2, 0.52).toFixed(2)) };
  }
  if (controlId === 'gapSize') {
    return { ...params, gapSize: Number(clamp(0.12 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.22, 0.12, 0.34).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.gapSize !== undefined ? Number(params.gapSize) : 0.22;
  const next = cur + 0.07 > 0.34 + 0.001 ? 0.12 : Number((cur + 0.07).toFixed(2));
  return { ...params, gapSize: next };
}`,
  },

  {
    id: 'drone-prop-strike-cage-ring',
    name: 'Drone Part: Bump-Ring Prop Guard Hoop',
    category: 'Drone Parts & Frames',
    description: 'Lightweight circular carbon bump-ring supported by Y-forked struts bolting under the motor base.',
    iconName: 'Shield',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust motor base scale or y-fork struts; click in Preview Mode to cycle y-fork struts.',
    defaultParams: {
      label: 'Bump-Ring Cage',
      hubScale: 6,
      struts: 0.22,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Bump-Ring Cage' },
      { key: 'hubScale', label: 'Motor Base Scale', type: 'number', min: 4, max: 8, step: 1, defaultValue: 6 },
      { key: 'struts', label: 'Y-Fork Struts', type: 'number', min: 0.12, max: 0.34, step: 0.01, defaultValue: 0.22 },
    ],
    jsSourceCode: `// Drone Part: Bump-Ring Prop Guard Hoop (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.4;
      const lobes = clamp(Math.round(Number(params.hubScale) || 6), 4, 8);
      const bulge = clamp(Number(params.struts) || 0.22, 0.12, 0.34) * r;
      const paths = [
        { d: circle(cx, cy, r), closed: true, fill: true },
        { d: circle(cx, cy, r * 0.72), closed: true },
      ];
      for (let l = 0; l < lobes; l++) {
        const a = (l * Math.PI * 2) / lobes;
        paths.push({ d: circle(cx + Math.cos(a) * r, cy + Math.sin(a) * r, bulge), closed: true, fill: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.hubScale !== undefined ? Number(params.hubScale) : 6;
  const v2 = params.struts !== undefined ? Number(params.struts) : 0.22;
  const p1Norm = (clamp(v1, 4, 8) - 4) / Math.max(0.0001, 4);
  const p2Norm = (clamp(v2, 0.12, 0.34) - 0.12) / Math.max(0.0001, 0.22);
  return [
    { id: 'hubScale', label: 'Motor Base Scale', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'struts', label: 'Y-Fork Struts', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'hubScale') {
    return { ...params, hubScale: Math.round(clamp(4 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 4, 4, 8)) };
  }
  if (controlId === 'struts') {
    return { ...params, struts: Number(clamp(0.12 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.22, 0.12, 0.34).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.struts !== undefined ? Number(params.struts) : 0.22;
  const next = cur + 0.07 > 0.34 + 0.001 ? 0.12 : Number((cur + 0.07).toFixed(2));
  return { ...params, struts: next };
}`,
  },

  {
    id: 'drone-fc-aio-25x25',
    name: 'Drone Part: 25.5×25.5 Whoop AIO Board',
    category: 'Drone Parts & Frames',
    description: '45-degree rotated diamond Toothpick/Whoop All-In-One flight controller with F4/H7 MCU, 4-in-1 ESC, and ELRS.',
    iconName: 'Cpu',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust center mcu size or corner solder pads; click in Preview Mode to cycle corner solder pads.',
    defaultParams: {
      label: '25.5×25.5 Whoop AIO',
      mcuScale: 0.28,
      pads: 12,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '25.5×25.5 Whoop AIO' },
      { key: 'mcuScale', label: 'Center MCU Size', type: 'number', min: 0.18, max: 0.38, step: 0.01, defaultValue: 0.28 },
      { key: 'pads', label: 'Corner Solder Pads', type: 'number', min: 8, max: 12, step: 1, defaultValue: 12 },
    ],
    jsSourceCode: `// Drone Part: 25.5×25.5 Whoop AIO Board (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.44;
      const mcuS = clamp(Number(params.mcuScale) || 0.28, 0.18, 0.38) * r * 2;
      const pads = clamp(Math.round(Number(params.pads) || 12), 8, 12);
      const paths = [
        { d: polygon([[cx, cy - r], [cx + r, cy], [cx, cy + r], [cx - r, cy]]), closed: true, fill: true },
        { d: rect(cx - mcuS / 2, cy - mcuS / 2, mcuS, mcuS), closed: true, fill: true },
      ];
      [[0,-r * 0.8],[r * 0.8,0],[0,r * 0.8],[-r * 0.8,0]].forEach(([dx, dy]) => {
        paths.push({ d: circle(cx + dx, cy + dy, 3.5), closed: true });
      });
      for (let p = 0; p < pads; p++) {
        const a = (p * Math.PI * 2) / pads + 0.25;
        paths.push({ d: rect(cx + Math.cos(a) * r * 0.58 - 3, cy + Math.sin(a) * r * 0.58 - 3, 6, 6), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.mcuScale !== undefined ? Number(params.mcuScale) : 0.28;
  const v2 = params.pads !== undefined ? Number(params.pads) : 12;
  const p1Norm = (clamp(v1, 0.18, 0.38) - 0.18) / Math.max(0.0001, 0.2);
  const p2Norm = (clamp(v2, 8, 12) - 8) / Math.max(0.0001, 4);
  return [
    { id: 'mcuScale', label: 'Center MCU Size', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'pads', label: 'Corner Solder Pads', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'mcuScale') {
    return { ...params, mcuScale: Number(clamp(0.18 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.2, 0.18, 0.38).toFixed(2)) };
  }
  if (controlId === 'pads') {
    return { ...params, pads: Math.round(clamp(8 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 8, 12)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.pads !== undefined ? Math.round(Number(params.pads)) : 12;
  return { ...params, pads: ((cur - 8 + 1) % 5) + 8 };
}`,
  },

  {
    id: 'drone-fc-20x20-mini',
    name: 'Drone Part: 20×20 Mini Flight Controller',
    category: 'Drone Parts & Frames',
    description: 'Compact 20×20mm flight controller PCB with corner silicone grommets, dual redundant IMUs, and USB-C.',
    iconName: 'Cpu',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust dual gyro separation or jst-sh ports; click in Preview Mode to cycle jst-sh ports.',
    defaultParams: {
      label: '20×20 Mini FC',
      imuSpread: 0.14,
      connectors: 5,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '20×20 Mini FC' },
      { key: 'imuSpread', label: 'Dual Gyro Separation', type: 'number', min: 0.08, max: 0.22, step: 0.01, defaultValue: 0.14 },
      { key: 'connectors', label: 'JST-SH Ports', type: 'number', min: 4, max: 7, step: 1, defaultValue: 5 },
    ],
    jsSourceCode: `// Drone Part: 20×20 Mini Flight Controller (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, s = Math.min(width, height) * 0.76;
      const earR = clamp(Number(params.imuSpread) || 0.14, 0.08, 0.22) * s;
      const pads = clamp(Math.round(Number(params.connectors) || 5), 4, 7);
      const ox = cx - s / 2, oy = cy - s / 2;
      const paths = [
        { d: roundRect(ox, oy, s, s, 8), closed: true, fill: true },
        { d: rect(cx - s * 0.22, cy - s * 0.22, s * 0.44, s * 0.44), closed: true, fill: true },
        { d: rect(cx - 10, oy - 4, 20, 8), closed: true },
      ];
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx, sy]) => {
        paths.push({ d: circle(cx + sx * (s / 2 - 4), cy + sy * (s / 2 - 4), earR), closed: true, fill: true });
        paths.push({ d: circle(cx + sx * (s / 2 - 4), cy + sy * (s / 2 - 4), earR * 0.45), closed: true });
      });
      for (let p = 0; p < pads; p++) {
        const py = oy + 14 + (p * (s - 28)) / Math.max(1, pads - 1);
        paths.push({ d: rect(ox + 4, py - 2.5, 6, 5), closed: true });
        paths.push({ d: rect(ox + s - 10, py - 2.5, 6, 5), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.imuSpread !== undefined ? Number(params.imuSpread) : 0.14;
  const v2 = params.connectors !== undefined ? Number(params.connectors) : 5;
  const p1Norm = (clamp(v1, 0.08, 0.22) - 0.08) / Math.max(0.0001, 0.14);
  const p2Norm = (clamp(v2, 4, 7) - 4) / Math.max(0.0001, 3);
  return [
    { id: 'imuSpread', label: 'Dual Gyro Separation', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'connectors', label: 'JST-SH Ports', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'imuSpread') {
    return { ...params, imuSpread: Number(clamp(0.08 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.14, 0.08, 0.22).toFixed(2)) };
  }
  if (controlId === 'connectors') {
    return { ...params, connectors: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 4, 7)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.connectors !== undefined ? Math.round(Number(params.connectors)) : 5;
  return { ...params, connectors: ((cur - 4 + 1) % 4) + 4 };
}`,
  },

  {
    id: 'drone-fc-pixhawk-cube',
    name: 'Drone Part: Autopilot Cube & Carrier Board',
    category: 'Drone Parts & Frames',
    description: 'Vibration-isolated heated IMU Cube module mounted on a multi-port winged autopilot carrier board.',
    iconName: 'Box',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust center cube scale or side carrier ports; click in Preview Mode to cycle side carrier ports.',
    defaultParams: {
      label: 'Autopilot Cube FC',
      cubeScale: 0.36,
      ports: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Autopilot Cube FC' },
      { key: 'cubeScale', label: 'Center Cube Scale', type: 'number', min: 0.24, max: 0.48, step: 0.01, defaultValue: 0.36 },
      { key: 'ports', label: 'Side Carrier Ports', type: 'number', min: 4, max: 8, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Part: Autopilot Cube & Carrier Board (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const cubeW = clamp(Number(params.cubeScale) || 0.36, 0.24, 0.48) * width;
      const ports = clamp(Math.round(Number(params.ports) || 6), 4, 8);
      const bW = width * 0.84, bH = height * 0.72, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 8), closed: true, fill: true },
        { d: roundRect(cx - cubeW / 2, cy - bH * 0.34, cubeW, bH * 0.68, 6), closed: true, fill: true },
        { d: polygon([[cx, cy - 12], [cx + 8, cy + 6], [cx - 8, cy + 6]]), closed: true },
      ];
      const half = Math.ceil(ports / 2);
      for (let i = 0; i < half; i++) {
        const py = oy + 12 + (i * (bH - 24)) / Math.max(1, half - 1);
        paths.push({ d: rect(ox + 6, py - 4, 14, 8), closed: true });
        paths.push({ d: rect(ox + bW - 20, py - 4, 14, 8), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.cubeScale !== undefined ? Number(params.cubeScale) : 0.36;
  const v2 = params.ports !== undefined ? Number(params.ports) : 6;
  const p1Norm = (clamp(v1, 0.24, 0.48) - 0.24) / Math.max(0.0001, 0.24);
  const p2Norm = (clamp(v2, 4, 8) - 4) / Math.max(0.0001, 4);
  return [
    { id: 'cubeScale', label: 'Center Cube Scale', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'ports', label: 'Side Carrier Ports', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'cubeScale') {
    return { ...params, cubeScale: Number(clamp(0.24 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.24, 0.24, 0.48).toFixed(2)) };
  }
  if (controlId === 'ports') {
    return { ...params, ports: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 4, 8)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.ports !== undefined ? Math.round(Number(params.ports)) : 6;
  return { ...params, ports: ((cur - 4 + 1) % 5) + 4 };
}`,
  },

  {
    id: 'drone-fc-redundant-triple-imu',
    name: 'Drone Part: Triple-Redundant Industrial Autopilot',
    category: 'Drone Parts & Frames',
    description: 'CNC-enclosed industrial flight controller housing 3 independent isolated IMU/baro sensor cores.',
    iconName: 'ShieldCheck',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust enclosure height ratio or redundant imu cores; click in Preview Mode to cycle redundant imu cores.',
    defaultParams: {
      label: 'Triple-IMU Autopilot',
      caseHeight: 0.68,
      imus: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Triple-IMU Autopilot' },
      { key: 'caseHeight', label: 'Enclosure Height Ratio', type: 'number', min: 0.48, max: 0.84, step: 0.01, defaultValue: 0.68 },
      { key: 'imus', label: 'Redundant IMU Cores', type: 'number', min: 2, max: 3, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: Triple-Redundant Industrial Autopilot (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const foamW = clamp(Number(params.caseHeight) || 0.68, 0.48, 0.84) * width;
      const imus = clamp(Math.round(Number(params.imus) || 3), 2, 3);
      const fH = height * 0.58;
      const paths = [
        { d: roundRect(width * 0.08, height * 0.14, width * 0.84, height * 0.72, 8), closed: true, fill: true },
        { d: roundRect(cx - foamW / 2, cy - fH / 2, foamW, fH, 6), closed: true, strokeDasharray: '4 3' },
      ];
      for (let i = 0; i < imus; i++) {
        const ix = cx - foamW * 0.32 + (i * foamW * 0.64) / Math.max(1, imus - 1) - 10;
        paths.push({ d: rect(ix, cy - 10, 20, 20), closed: true, fill: true });
        paths.push({ d: circle(ix + 5, cy - 5, 2), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.caseHeight !== undefined ? Number(params.caseHeight) : 0.68;
  const v2 = params.imus !== undefined ? Number(params.imus) : 3;
  const p1Norm = (clamp(v1, 0.48, 0.84) - 0.48) / Math.max(0.0001, 0.36);
  const p2Norm = (clamp(v2, 2, 3) - 2) / Math.max(0.0001, 1);
  return [
    { id: 'caseHeight', label: 'Enclosure Height Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'imus', label: 'Redundant IMU Cores', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'caseHeight') {
    return { ...params, caseHeight: Number(clamp(0.48 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.36, 0.48, 0.84).toFixed(2)) };
  }
  if (controlId === 'imus') {
    return { ...params, imus: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 1, 2, 3)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.imus !== undefined ? Math.round(Number(params.imus)) : 3;
  return { ...params, imus: ((cur - 2 + 1) % 2) + 2 };
}`,
  },

  {
    id: 'drone-esc-single-arm-slim',
    name: 'Drone Part: Individual Slim Arm ESC (80A)',
    category: 'Drone Parts & Frames',
    description: 'Narrow individual arm-mounted BLHeli_32 / AM32 ESC with 2 input pads, MOSFET bank, and 3 motor phase pads.',
    iconName: 'Zap',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust slim pcb width ratio or power mosfets; click in Preview Mode to cycle power mosfets.',
    defaultParams: {
      label: '80A Slim Arm ESC',
      pcbHeight: 0.56,
      fets: 5,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '80A Slim Arm ESC' },
      { key: 'pcbHeight', label: 'Slim PCB Width Ratio', type: 'number', min: 0.36, max: 0.76, step: 0.01, defaultValue: 0.56 },
      { key: 'fets', label: 'Power MOSFETs', type: 'number', min: 3, max: 7, step: 1, defaultValue: 5 },
    ],
    jsSourceCode: `// Drone Part: Individual Slim Arm ESC (80A) (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const sinkW = clamp(Number(params.pcbHeight) || 0.56, 0.36, 0.76) * width;
      const fins = clamp(Math.round(Number(params.fets) || 5), 3, 7);
      const bW = width * 0.82, bH = height * 0.48, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 6), closed: true, fill: true },
        { d: rect(cx - sinkW / 2, oy + 6, sinkW, bH - 12), closed: true, fill: true },
      ];
      [-bH * 0.28, 0, bH * 0.28].forEach((dy) => {
        paths.push({ d: rect(ox + bW - 14, cy + dy - 4, 10, 8), closed: true });
      });
      paths.push({ d: rect(ox + 4, cy - 12, 10, 8), closed: true });
      paths.push({ d: rect(ox + 4, cy + 4, 10, 8), closed: true });
      for (let f = 1; f <= fins; f++) {
        const fx = cx - sinkW / 2 + (f * sinkW) / (fins + 1);
        paths.push({ d: line(fx, oy + 6, fx, oy + bH - 6) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.pcbHeight !== undefined ? Number(params.pcbHeight) : 0.56;
  const v2 = params.fets !== undefined ? Number(params.fets) : 5;
  const p1Norm = (clamp(v1, 0.36, 0.76) - 0.36) / Math.max(0.0001, 0.4);
  const p2Norm = (clamp(v2, 3, 7) - 3) / Math.max(0.0001, 4);
  return [
    { id: 'pcbHeight', label: 'Slim PCB Width Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'fets', label: 'Power MOSFETs', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'pcbHeight') {
    return { ...params, pcbHeight: Number(clamp(0.36 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.4, 0.36, 0.76).toFixed(2)) };
  }
  if (controlId === 'fets') {
    return { ...params, fets: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 3, 7)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.fets !== undefined ? Math.round(Number(params.fets)) : 5;
  return { ...params, fets: ((cur - 3 + 1) % 5) + 3 };
}`,
  },

  {
    id: 'drone-esc-8in1-octo',
    name: 'Drone Part: 8-in-1 Heavy Octo ESC Board',
    category: 'Drone Parts & Frames',
    description: 'High-current 8-in-1 octocopter ESC power board with 24 perimeter motor solder pads and dual XT60 tabs.',
    iconName: 'Cpu',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust mosfet matrix width or motor pad banks; click in Preview Mode to cycle motor pad banks.',
    defaultParams: {
      label: '8-in-1 Octo ESC',
      coreWidth: 0.32,
      banks: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '8-in-1 Octo ESC' },
      { key: 'coreWidth', label: 'MOSFET Matrix Width', type: 'number', min: 0.2, max: 0.46, step: 0.01, defaultValue: 0.32 },
      { key: 'banks', label: 'Motor Pad Banks', type: 'number', min: 4, max: 8, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Part: 8-in-1 Heavy Octo ESC Board (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const busW = clamp(Number(params.coreWidth) || 0.32, 0.2, 0.46) * width;
      const fets = clamp(Math.round(Number(params.banks) || 6), 4, 8);
      const bW = width * 0.82, bH = height * 0.76, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 8), closed: true, fill: true },
        { d: rect(cx - busW / 2, oy + 8, busW, bH - 16), closed: true, fill: true },
      ];
      for (let i = 0; i < 4; i++) {
        const py = oy + 14 + (i * (bH - 28)) / 3;
        paths.push({ d: rect(ox + 4, py - 4, 12, 8), closed: true });
        paths.push({ d: rect(ox + bW - 16, py - 4, 12, 8), closed: true });
      }
      for (let f = 0; f < fets; f++) {
        const fy = oy + 12 + (f * (bH - 24)) / Math.max(1, fets - 1);
        paths.push({ d: rect(cx - busW / 2 - 14, fy - 3, 10, 6), closed: true });
        paths.push({ d: rect(cx + busW / 2 + 4, fy - 3, 10, 6), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.coreWidth !== undefined ? Number(params.coreWidth) : 0.32;
  const v2 = params.banks !== undefined ? Number(params.banks) : 6;
  const p1Norm = (clamp(v1, 0.2, 0.46) - 0.2) / Math.max(0.0001, 0.26);
  const p2Norm = (clamp(v2, 4, 8) - 4) / Math.max(0.0001, 4);
  return [
    { id: 'coreWidth', label: 'MOSFET Matrix Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'banks', label: 'Motor Pad Banks', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'coreWidth') {
    return { ...params, coreWidth: Number(clamp(0.2 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.26, 0.2, 0.46).toFixed(2)) };
  }
  if (controlId === 'banks') {
    return { ...params, banks: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 4, 8)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.banks !== undefined ? Math.round(Number(params.banks)) : 6;
  return { ...params, banks: ((cur - 4 + 1) % 5) + 4 };
}`,
  },

  {
    id: 'drone-esc-canbus-smart',
    name: 'Drone Part: DroneCAN / UAVCAN Smart ESC',
    category: 'Drone Parts & Frames',
    description: 'Finned aluminum industrial CAN-bus ESC with 3 integrated gold bullet sockets and telemetry ports.',
    iconName: 'Cpu',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust heatsink case width or cooling heatsink fins; click in Preview Mode to cycle cooling heatsink fins.',
    defaultParams: {
      label: 'DroneCAN Smart ESC',
      bodyRatio: 0.48,
      fins: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'DroneCAN Smart ESC' },
      { key: 'bodyRatio', label: 'Heatsink Case Width', type: 'number', min: 0.3, max: 0.68, step: 0.01, defaultValue: 0.48 },
      { key: 'fins', label: 'Cooling Heatsink Fins', type: 'number', min: 4, max: 9, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Part: DroneCAN / UAVCAN Smart ESC (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const finH = clamp(Number(params.bodyRatio) || 0.48, 0.3, 0.68) * height;
      const fins = clamp(Math.round(Number(params.fins) || 6), 4, 9);
      const bW = width * 0.76, bH = height * 0.64, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 8), closed: true, fill: true },
        { d: rect(ox + 16, cy - finH / 2, bW - 36, finH), closed: true, fill: true },
        { d: rect(ox + 4, cy - 18, 10, 12), closed: true },
        { d: rect(ox + 4, cy + 6, 10, 12), closed: true },
      ];
      for (let f = 1; f <= fins; f++) {
        const fx = ox + 16 + (f * (bW - 36)) / (fins + 1);
        paths.push({ d: line(fx, cy - finH / 2, fx, cy + finH / 2) });
      }
      [-18, 0, 18].forEach((dy) => {
        paths.push({ d: circle(ox + bW - 10, cy + dy, 5), closed: true });
      });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.bodyRatio !== undefined ? Number(params.bodyRatio) : 0.48;
  const v2 = params.fins !== undefined ? Number(params.fins) : 6;
  const p1Norm = (clamp(v1, 0.3, 0.68) - 0.3) / Math.max(0.0001, 0.38);
  const p2Norm = (clamp(v2, 4, 9) - 4) / Math.max(0.0001, 5);
  return [
    { id: 'bodyRatio', label: 'Heatsink Case Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'fins', label: 'Cooling Heatsink Fins', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'bodyRatio') {
    return { ...params, bodyRatio: Number(clamp(0.3 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.38, 0.3, 0.68).toFixed(2)) };
  }
  if (controlId === 'fins') {
    return { ...params, fins: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 5, 4, 9)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.fins !== undefined ? Math.round(Number(params.fins)) : 6;
  return { ...params, fins: ((cur - 4 + 1) % 6) + 4 };
}`,
  },

  {
    id: 'drone-companion-jetson-orin',
    name: 'Drone Part: Edge AI Companion Module (Orin)',
    category: 'Drone Parts & Frames',
    description: '100-TOPS airborne AI companion computer with 260-pin SO-DIMM edge, finned heatsink, and dual MIPI CSI ports.',
    iconName: 'Brain',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust heatsink coverage or heatsink channels; click in Preview Mode to cycle heatsink channels.',
    defaultParams: {
      label: 'Jetson Orin Nano',
      sinkRatio: 0.24,
      fins: 7,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Jetson Orin Nano' },
      { key: 'sinkRatio', label: 'Heatsink Coverage', type: 'number', min: 0.16, max: 0.34, step: 0.01, defaultValue: 0.24 },
      { key: 'fins', label: 'Heatsink Channels', type: 'number', min: 4, max: 9, step: 1, defaultValue: 7 },
    ],
    jsSourceCode: `// Drone Part: Edge AI Companion Module (Orin) (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const fanR = clamp(Number(params.sinkRatio) || 0.24, 0.16, 0.34) * Math.min(width, height);
      const fins = clamp(Math.round(Number(params.fins) || 7), 4, 9);
      const bW = width * 0.84, bH = height * 0.7, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 6), closed: true, fill: true },
      ];
      for (let f = 1; f <= fins; f++) {
        const fx = ox + 10 + (f * (bW - 20)) / (fins + 1);
        paths.push({ d: line(fx, oy + 8, fx, oy + bH - 8) });
      }
      paths.push({ d: circle(cx, cy, fanR), closed: true, fill: true });
      paths.push({ d: circle(cx, cy, fanR * 0.35), closed: true });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.sinkRatio !== undefined ? Number(params.sinkRatio) : 0.24;
  const v2 = params.fins !== undefined ? Number(params.fins) : 7;
  const p1Norm = (clamp(v1, 0.16, 0.34) - 0.16) / Math.max(0.0001, 0.18);
  const p2Norm = (clamp(v2, 4, 9) - 4) / Math.max(0.0001, 5);
  return [
    { id: 'sinkRatio', label: 'Heatsink Coverage', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'fins', label: 'Heatsink Channels', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'sinkRatio') {
    return { ...params, sinkRatio: Number(clamp(0.16 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.18, 0.16, 0.34).toFixed(2)) };
  }
  if (controlId === 'fins') {
    return { ...params, fins: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 5, 4, 9)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.fins !== undefined ? Math.round(Number(params.fins)) : 7;
  return { ...params, fins: ((cur - 4 + 1) % 6) + 4 };
}`,
  },

  {
    id: 'drone-companion-raspberry-cm4',
    name: 'Drone Part: Compute Module IO Carrier',
    category: 'Drone Parts & Frames',
    description: 'Raspberry Pi Compute Module 4 airborne board with dual 100-pin high-density B2B headers and Broadcom SoC.',
    iconName: 'Cpu',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust b2b connector span or onboard ic blocks; click in Preview Mode to cycle onboard ic blocks.',
    defaultParams: {
      label: 'CM4 Companion Board',
      headerLen: 0.28,
      chips: 2,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'CM4 Companion Board' },
      { key: 'headerLen', label: 'B2B Connector Span', type: 'number', min: 0.18, max: 0.38, step: 0.01, defaultValue: 0.28 },
      { key: 'chips', label: 'Onboard IC Blocks', type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
    ],
    jsSourceCode: `// Drone Part: Compute Module IO Carrier (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const socS = clamp(Number(params.headerLen) || 0.28, 0.18, 0.38) * Math.min(width, height);
      const csi = clamp(Math.round(Number(params.chips) || 2), 1, 3);
      const bW = width * 0.84, bH = height * 0.68, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 6), closed: true, fill: true },
        { d: rect(cx - socS / 2, cy - socS / 2, socS, socS), closed: true, fill: true },
        { d: rect(ox + 12, oy + 10, 26, 20), closed: true, fill: true },
      ];
      for (let i = 0; i < csi; i++) {
        paths.push({ d: rect(ox + bW - 14, oy + 12 + i * 22, 8, 16), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.headerLen !== undefined ? Number(params.headerLen) : 0.28;
  const v2 = params.chips !== undefined ? Number(params.chips) : 2;
  const p1Norm = (clamp(v1, 0.18, 0.38) - 0.18) / Math.max(0.0001, 0.2);
  const p2Norm = (clamp(v2, 1, 3) - 1) / Math.max(0.0001, 2);
  return [
    { id: 'headerLen', label: 'B2B Connector Span', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'chips', label: 'Onboard IC Blocks', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'headerLen') {
    return { ...params, headerLen: Number(clamp(0.18 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.2, 0.18, 0.38).toFixed(2)) };
  }
  if (controlId === 'chips') {
    return { ...params, chips: Math.round(clamp(1 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 1, 3)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.chips !== undefined ? Math.round(Number(params.chips)) : 2;
  return { ...params, chips: ((cur - 1 + 1) % 3) + 1 };
}`,
  },

  {
    id: 'drone-companion-coral-tpu',
    name: 'Drone Part: M.2 Dual Edge TPU Accelerator',
    category: 'Drone Parts & Frames',
    description: 'M.2 2230 neural accelerator card with notched gold edge fingers and twin Edge TPU inference ASICs.',
    iconName: 'Zap',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust m.2 card width ratio or edge tpu asics; click in Preview Mode to cycle edge tpu asics.',
    defaultParams: {
      label: 'Dual Edge TPU M.2',
      cardWidth: 0.32,
      tpus: 8,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Dual Edge TPU M.2' },
      { key: 'cardWidth', label: 'M.2 Card Width Ratio', type: 'number', min: 0.2, max: 0.44, step: 0.01, defaultValue: 0.32 },
      { key: 'tpus', label: 'Edge TPU ASICs', type: 'number', min: 5, max: 10, step: 1, defaultValue: 8 },
    ],
    jsSourceCode: `// Drone Part: M.2 Dual Edge TPU Accelerator (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const tpuS = clamp(Number(params.cardWidth) || 0.32, 0.2, 0.44) * Math.min(width, height);
      const pins = clamp(Math.round(Number(params.tpus) || 8), 5, 10);
      const bW = width * 0.48, bH = height * 0.78, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 6), closed: true, fill: true },
        { d: circle(cx, oy + 10, 5), closed: true },
        { d: rect(cx - tpuS / 2, cy - tpuS / 2, tpuS, tpuS), closed: true, fill: true },
      ];
      for (let p = 0; p < pins; p++) {
        const px = ox + 8 + (p * (bW - 16)) / Math.max(1, pins - 1);
        paths.push({ d: line(px, oy + bH - 10, px, oy + bH), strokeWidth: 2 });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.cardWidth !== undefined ? Number(params.cardWidth) : 0.32;
  const v2 = params.tpus !== undefined ? Number(params.tpus) : 8;
  const p1Norm = (clamp(v1, 0.2, 0.44) - 0.2) / Math.max(0.0001, 0.24);
  const p2Norm = (clamp(v2, 5, 10) - 5) / Math.max(0.0001, 5);
  return [
    { id: 'cardWidth', label: 'M.2 Card Width Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'tpus', label: 'Edge TPU ASICs', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'cardWidth') {
    return { ...params, cardWidth: Number(clamp(0.2 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.24, 0.2, 0.44).toFixed(2)) };
  }
  if (controlId === 'tpus') {
    return { ...params, tpus: Math.round(clamp(5 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 5, 5, 10)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.tpus !== undefined ? Math.round(Number(params.tpus)) : 8;
  return { ...params, tpus: ((cur - 5 + 1) % 6) + 5 };
}`,
  },

  {
    id: 'drone-pdb-high-current',
    name: 'Drone Part: 200A Power Distribution Board',
    category: 'Drone Parts & Frames',
    description: 'Heavy-copper octo/hex Power Distribution Board with concentric positive/negative bus rings and BEC outputs.',
    iconName: 'Zap',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust copper bus ring size or esc power pairs; click in Preview Mode to cycle esc power pairs.',
    defaultParams: {
      label: '200A Heavy PDB',
      ringScale: 0.34,
      outputs: 2,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '200A Heavy PDB' },
      { key: 'ringScale', label: 'Copper Bus Ring Size', type: 'number', min: 0.2, max: 0.48, step: 0.01, defaultValue: 0.34 },
      { key: 'outputs', label: 'ESC Power Pairs', type: 'number', min: 2, max: 4, step: 1, defaultValue: 2 },
    ],
    jsSourceCode: `// Drone Part: 200A Power Distribution Board (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, s = Math.min(width, height) * 0.78;
      const shuntW = clamp(Number(params.ringScale) || 0.34, 0.2, 0.48) * s;
      const rails = clamp(Math.round(Number(params.outputs) || 2), 2, 4);
      const ox = cx - s / 2, oy = cy - s / 2;
      const paths = [
        { d: roundRect(ox, oy, s, s, 8), closed: true, fill: true },
        { d: rect(cx - shuntW / 2, oy + 10, shuntW, 14), closed: true, fill: true },
      ];
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx, sy]) => {
        paths.push({ d: rect(cx + sx * (s * 0.36) - 6, cy + sy * (s * 0.36) - 4, 12, 8), closed: true });
      });
      for (let r = 0; r < rails; r++) {
        const rx = cx - 22 + r * 24;
        paths.push({ d: rect(rx - 8, cy + 4, 16, 16), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.ringScale !== undefined ? Number(params.ringScale) : 0.34;
  const v2 = params.outputs !== undefined ? Number(params.outputs) : 2;
  const p1Norm = (clamp(v1, 0.2, 0.48) - 0.2) / Math.max(0.0001, 0.28);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'ringScale', label: 'Copper Bus Ring Size', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'outputs', label: 'ESC Power Pairs', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'ringScale') {
    return { ...params, ringScale: Number(clamp(0.2 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.28, 0.2, 0.48).toFixed(2)) };
  }
  if (controlId === 'outputs') {
    return { ...params, outputs: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.outputs !== undefined ? Math.round(Number(params.outputs)) : 2;
  return { ...params, outputs: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-bec-voltage-regulator',
    name: 'Drone Part: Dual 5V/12V Synchronous BEC',
    category: 'Drone Parts & Frames',
    description: 'Step-down DC-DC buck regulator module with shielded power inductor and 5V/9V/12V solder-bridge jumper.',
    iconName: 'Sliders',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust shielded inductor size or voltage select pads; click in Preview Mode to cycle voltage select pads.',
    defaultParams: {
      label: '5V/12V Sync BEC',
      inductorSize: 0.24,
      jumpers: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '5V/12V Sync BEC' },
      { key: 'inductorSize', label: 'Shielded Inductor Size', type: 'number', min: 0.16, max: 0.34, step: 0.01, defaultValue: 0.24 },
      { key: 'jumpers', label: 'Voltage Select Pads', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: Dual 5V/12V Synchronous BEC (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const coilR = clamp(Number(params.inductorSize) || 0.24, 0.16, 0.34) * Math.min(width, height);
      const caps = clamp(Math.round(Number(params.jumpers) || 3), 2, 4);
      const bW = width * 0.78, bH = height * 0.56, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 6), closed: true, fill: true },
        { d: roundRect(cx - coilR - 10, cy - coilR, coilR * 2, coilR * 2, 6), closed: true, fill: true },
        { d: circle(cx - 10, cy, coilR * 0.55), closed: true },
      ];
      for (let c = 0; c < caps; c++) {
        const cyP = oy + 14 + (c * (bH - 28)) / Math.max(1, caps - 1);
        paths.push({ d: rect(ox + bW - 26, cyP - 5, 16, 10), closed: true, fill: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.inductorSize !== undefined ? Number(params.inductorSize) : 0.24;
  const v2 = params.jumpers !== undefined ? Number(params.jumpers) : 3;
  const p1Norm = (clamp(v1, 0.16, 0.34) - 0.16) / Math.max(0.0001, 0.18);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'inductorSize', label: 'Shielded Inductor Size', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'jumpers', label: 'Voltage Select Pads', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'inductorSize') {
    return { ...params, inductorSize: Number(clamp(0.16 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.18, 0.16, 0.34).toFixed(2)) };
  }
  if (controlId === 'jumpers') {
    return { ...params, jumpers: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.jumpers !== undefined ? Math.round(Number(params.jumpers)) : 3;
  return { ...params, jumpers: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-current-hall-sensor',
    name: 'Drone Part: 150A Hall-Effect Current Sensor',
    category: 'Drone Parts & Frames',
    description: 'Non-invasive ferrite toroid Hall-effect current and voltage sensor module with heavy pass-through wire.',
    iconName: 'Activity',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust ferrite toroid radius or sense windings; click in Preview Mode to cycle sense windings.',
    defaultParams: {
      label: '150A Hall Sensor',
      toroidR: 0.38,
      turns: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '150A Hall Sensor' },
      { key: 'toroidR', label: 'Ferrite Toroid Radius', type: 'number', min: 0.24, max: 0.54, step: 0.01, defaultValue: 0.38 },
      { key: 'turns', label: 'Sense Windings', type: 'number', min: 4, max: 6, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Part: 150A Hall-Effect Current Sensor (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const shuntH = clamp(Number(params.toroidR) || 0.38, 0.24, 0.54) * height;
      const pins = clamp(Math.round(Number(params.turns) || 6), 4, 6);
      const bW = width * 0.72, bH = height * 0.64, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 8), closed: true, fill: true },
        { d: roundRect(ox - 12, cy - 14, 16, 28, 3), closed: true, fill: true },
        { d: roundRect(ox + bW - 4, cy - 14, 16, 28, 3), closed: true, fill: true },
        { d: rect(cx - 18, cy - shuntH / 2, 36, shuntH), closed: true, fill: true },
      ];
      for (let p = 0; p < pins; p++) {
        const px = cx - 20 + (p * 40) / Math.max(1, pins - 1);
        paths.push({ d: line(px, oy + bH - 8, px, oy + bH + 4), strokeWidth: 2 });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.toroidR !== undefined ? Number(params.toroidR) : 0.38;
  const v2 = params.turns !== undefined ? Number(params.turns) : 6;
  const p1Norm = (clamp(v1, 0.24, 0.54) - 0.24) / Math.max(0.0001, 0.3);
  const p2Norm = (clamp(v2, 4, 6) - 4) / Math.max(0.0001, 2);
  return [
    { id: 'toroidR', label: 'Ferrite Toroid Radius', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'turns', label: 'Sense Windings', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'toroidR') {
    return { ...params, toroidR: Number(clamp(0.24 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.3, 0.24, 0.54).toFixed(2)) };
  }
  if (controlId === 'turns') {
    return { ...params, turns: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 4, 6)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.turns !== undefined ? Math.round(Number(params.turns)) : 6;
  return { ...params, turns: ((cur - 4 + 1) % 3) + 4 };
}`,
  },

  {
    id: 'drone-can-bus-splitter-hub',
    name: 'Drone Part: 6-Port DroneCAN Bus Hub',
    category: 'Drone Parts & Frames',
    description: 'UAVCAN / DroneCAN distribution splitter board with 2 rows of 4-pin JST-GH sockets and 120Ω termination switch.',
    iconName: 'Network',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust connector height ratio or port columns; click in Preview Mode to cycle port columns.',
    defaultParams: {
      label: 'DroneCAN 6-Port Hub',
      portHeight: 0.24,
      cols: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'DroneCAN 6-Port Hub' },
      { key: 'portHeight', label: 'Connector Height Ratio', type: 'number', min: 0.16, max: 0.34, step: 0.01, defaultValue: 0.24 },
      { key: 'cols', label: 'Port Columns', type: 'number', min: 4, max: 6, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Part: 6-Port DroneCAN Bus Hub (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const portH = clamp(Number(params.portHeight) || 0.24, 0.16, 0.34) * height;
      const ports = clamp(Math.round(Number(params.cols) || 6), 4, 6);
      const bW = width * 0.78, bH = height * 0.68, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 8), closed: true, fill: true },
        { d: rect(cx - 10, cy - 8, 20, 16), closed: true, fill: true },
      ];
      const topN = Math.ceil(ports / 2), botN = Math.floor(ports / 2);
      for (let i = 0; i < topN; i++) {
        const px = ox + 18 + (i * (bW - 56)) / Math.max(1, topN - 1);
        paths.push({ d: rect(px, oy + 6, 20, portH), closed: true });
      }
      for (let i = 0; i < botN; i++) {
        const px = ox + 18 + (i * (bW - 56)) / Math.max(1, botN - 1);
        paths.push({ d: rect(px, oy + bH - portH - 6, 20, portH), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.portHeight !== undefined ? Number(params.portHeight) : 0.24;
  const v2 = params.cols !== undefined ? Number(params.cols) : 6;
  const p1Norm = (clamp(v1, 0.16, 0.34) - 0.16) / Math.max(0.0001, 0.18);
  const p2Norm = (clamp(v2, 4, 6) - 4) / Math.max(0.0001, 2);
  return [
    { id: 'portHeight', label: 'Connector Height Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'cols', label: 'Port Columns', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'portHeight') {
    return { ...params, portHeight: Number(clamp(0.16 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.18, 0.16, 0.34).toFixed(2)) };
  }
  if (controlId === 'cols') {
    return { ...params, cols: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 4, 6)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.cols !== undefined ? Math.round(Number(params.cols)) : 6;
  return { ...params, cols: ((cur - 4 + 1) % 3) + 4 };
}`,
  },

  {
    id: 'drone-uart-sbus-inverter',
    name: 'Drone Part: UART / SBUS Signal Inverter',
    category: 'Drone Parts & Frames',
    description: 'Inline micro signal inverter PCB with SOT-23 transistor and 3-pin servo headers on both ends.',
    iconName: 'ArrowLeftRight',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust center pcb length or header pins per side; click in Preview Mode to cycle header pins per side.',
    defaultParams: {
      label: 'SBUS Inverter PCB',
      pcbRatio: 0.42,
      pins: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'SBUS Inverter PCB' },
      { key: 'pcbRatio', label: 'Center PCB Length', type: 'number', min: 0.28, max: 0.56, step: 0.01, defaultValue: 0.42 },
      { key: 'pins', label: 'Header Pins per Side', type: 'number', min: 3, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: UART / SBUS Signal Inverter (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const icW = clamp(Number(params.pcbRatio) || 0.42, 0.28, 0.56) * width;
      const pins = clamp(Math.round(Number(params.pins) || 3), 3, 4);
      const bW = width * 0.72, bH = height * 0.52, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 6), closed: true, fill: true },
        { d: rect(cx - icW / 2, cy - 12, icW, 24), closed: true, fill: true },
      ];
      for (let p = 0; p < pins; p++) {
        const py = oy + 12 + (p * (bH - 24)) / Math.max(1, pins - 1);
        paths.push({ d: rect(ox + 4, py - 3, 10, 6), closed: true });
        paths.push({ d: rect(ox + bW - 14, py - 3, 10, 6), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.pcbRatio !== undefined ? Number(params.pcbRatio) : 0.42;
  const v2 = params.pins !== undefined ? Number(params.pins) : 3;
  const p1Norm = (clamp(v1, 0.28, 0.56) - 0.28) / Math.max(0.0001, 0.28);
  const p2Norm = (clamp(v2, 3, 4) - 3) / Math.max(0.0001, 1);
  return [
    { id: 'pcbRatio', label: 'Center PCB Length', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'pins', label: 'Header Pins per Side', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'pcbRatio') {
    return { ...params, pcbRatio: Number(clamp(0.28 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.28, 0.28, 0.56).toFixed(2)) };
  }
  if (controlId === 'pins') {
    return { ...params, pins: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 1, 3, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.pins !== undefined ? Math.round(Number(params.pins)) : 3;
  return { ...params, pins: ((cur - 3 + 1) % 2) + 3 };
}`,
  },

  {
    id: 'drone-pwm-servo-breakout',
    name: 'Drone Part: 16-Channel PWM Servo Rail',
    category: 'Drone Parts & Frames',
    description: 'I2C/CAN-to-PWM servo distribution rail with 3-row (Signal/V+/GND) pin header matrix and smoothing caps.',
    iconName: 'Grid',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust pin matrix height or visible pwm columns; click in Preview Mode to cycle visible pwm columns.',
    defaultParams: {
      label: '16ch PWM Servo Rail',
      railHeight: 0.46,
      channels: 8,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '16ch PWM Servo Rail' },
      { key: 'railHeight', label: 'Pin Matrix Height', type: 'number', min: 0.3, max: 0.64, step: 0.01, defaultValue: 0.46 },
      { key: 'channels', label: 'Visible PWM Columns', type: 'number', min: 4, max: 8, step: 1, defaultValue: 8 },
    ],
    jsSourceCode: `// Drone Part: 16-Channel PWM Servo Rail (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const railH = clamp(Number(params.railHeight) || 0.46, 0.3, 0.64) * height;
      const ch = clamp(Math.round(Number(params.channels) || 8), 4, 8);
      const bW = width * 0.84, bH = height * 0.64, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [{ d: roundRect(ox, oy, bW, bH, 6), closed: true, fill: true }];
      for (let c = 0; c < ch; c++) {
        const px = ox + 18 + (c * (bW - 36)) / Math.max(1, ch - 1);
        [-railH * 0.35, 0, railH * 0.35].forEach((dy) => {
          paths.push({ d: circle(px, cy + dy, 3), closed: true });
        });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.railHeight !== undefined ? Number(params.railHeight) : 0.46;
  const v2 = params.channels !== undefined ? Number(params.channels) : 8;
  const p1Norm = (clamp(v1, 0.3, 0.64) - 0.3) / Math.max(0.0001, 0.34);
  const p2Norm = (clamp(v2, 4, 8) - 4) / Math.max(0.0001, 4);
  return [
    { id: 'railHeight', label: 'Pin Matrix Height', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'channels', label: 'Visible PWM Columns', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'railHeight') {
    return { ...params, railHeight: Number(clamp(0.3 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.34, 0.3, 0.64).toFixed(2)) };
  }
  if (controlId === 'channels') {
    return { ...params, channels: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 4, 8)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.channels !== undefined ? Math.round(Number(params.channels)) : 8;
  return { ...params, channels: ((cur - 4 + 1) % 5) + 4 };
}`,
  },

  {
    id: 'drone-blackbox-sd-logger',
    name: 'Drone Part: High-Speed MicroSD Blackbox',
    category: 'Drone Parts & Frames',
    description: 'External high-rate gyro Blackbox flight data recorder with hinged stainless MicroSD card socket.',
    iconName: 'HardDrive',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust microsd cage width or card protrusion (px); click in Preview Mode to cycle card protrusion (px).',
    defaultParams: {
      label: 'MicroSD Blackbox',
      cageWidth: 0.22,
      cardOut: 2,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'MicroSD Blackbox' },
      { key: 'cageWidth', label: 'MicroSD Cage Width', type: 'number', min: 0.08, max: 0.36, step: 0.01, defaultValue: 0.22 },
      { key: 'cardOut', label: 'Card Protrusion (px)', type: 'number', min: 2, max: 4, step: 1, defaultValue: 2 },
    ],
    jsSourceCode: `// Drone Part: High-Speed MicroSD Blackbox (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const cardOut = clamp(Number(params.cageWidth) || 0.22, 0.08, 0.36) * width;
      const leds = clamp(Math.round(Number(params.cardOut) || 2), 2, 4);
      const bW = width * 0.64, bH = height * 0.58, ox = cx - bW / 2 - cardOut * 0.3, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 6), closed: true, fill: true },
        { d: rect(ox + 16, oy + 10, bW - 24, bH - 20), closed: true, fill: true },
        { d: roundRect(ox + bW - 10, oy + 14, cardOut + 10, bH - 28, 3), closed: true },
      ];
      for (let l = 0; l < leds; l++) {
        paths.push({ d: circle(ox + 8, oy + 14 + l * 14, 3), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.cageWidth !== undefined ? Number(params.cageWidth) : 0.22;
  const v2 = params.cardOut !== undefined ? Number(params.cardOut) : 2;
  const p1Norm = (clamp(v1, 0.08, 0.36) - 0.08) / Math.max(0.0001, 0.28);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'cageWidth', label: 'MicroSD Cage Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'cardOut', label: 'Card Protrusion (px)', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'cageWidth') {
    return { ...params, cageWidth: Number(clamp(0.08 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.28, 0.08, 0.36).toFixed(2)) };
  }
  if (controlId === 'cardOut') {
    return { ...params, cardOut: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.cardOut !== undefined ? Math.round(Number(params.cardOut)) : 2;
  return { ...params, cardOut: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-usb-c-extension-dongle',
    name: 'Drone Part: Right-Angle USB-C Extension',
    category: 'Drone Parts & Frames',
    description: '90-degree male USB-C plug linked by flexible flat ribbon cable to a frame-mounted female USB-C socket.',
    iconName: 'Plug',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust fpc ribbon curvature or mounting ears; click in Preview Mode to cycle mounting ears.',
    defaultParams: {
      label: 'USB-C Extension FPC',
      ribbonDip: 0.42,
      ears: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'USB-C Extension FPC' },
      { key: 'ribbonDip', label: 'FPC Ribbon Curvature', type: 'number', min: 0.24, max: 0.62, step: 0.01, defaultValue: 0.42 },
      { key: 'ears', label: 'Mounting Ears', type: 'number', min: 2, max: 6, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: Right-Angle USB-C Extension (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const loopW = clamp(Number(params.ribbonDip) || 0.42, 0.24, 0.62) * width;
      const wires = clamp(Math.round(Number(params.ears) || 4), 2, 6);
      const lx = width * 0.18, rx = lx + loopW + 16;
      const paths = [
        { d: roundRect(lx - 18, cy - 22, 36, 44, 6), closed: true, fill: true },
        { d: roundRect(lx - 10, cy - 6, 20, 12, 6), closed: true },
        { d: roundRect(rx - 14, cy - 18, 28, 36, 5), closed: true, fill: true },
      ];
      for (let w = 0; w < wires; w++) {
        const wy = cy - 10 + (w * 20) / Math.max(1, wires - 1);
        paths.push({ d: line(lx + 18, wy, rx - 14, wy) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.ribbonDip !== undefined ? Number(params.ribbonDip) : 0.42;
  const v2 = params.ears !== undefined ? Number(params.ears) : 4;
  const p1Norm = (clamp(v1, 0.24, 0.62) - 0.24) / Math.max(0.0001, 0.38);
  const p2Norm = (clamp(v2, 2, 6) - 2) / Math.max(0.0001, 4);
  return [
    { id: 'ribbonDip', label: 'FPC Ribbon Curvature', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'ears', label: 'Mounting Ears', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'ribbonDip') {
    return { ...params, ribbonDip: Number(clamp(0.24 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.38, 0.24, 0.62).toFixed(2)) };
  }
  if (controlId === 'ears') {
    return { ...params, ears: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 2, 6)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.ears !== undefined ? Math.round(Number(params.ears)) : 4;
  return { ...params, ears: ((cur - 2 + 1) % 5) + 2 };
}`,
  },

  {
    id: 'drone-led-strip-controller',
    name: 'Drone Part: WS2812B Addressable LED Bar',
    category: 'Drone Parts & Frames',
    description: 'Slim race-arm WS2812B addressable RGB LED strip with 5050 emitter packages and DIN/5V/GND pads.',
    iconName: 'Sparkles',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust led strip width or 5050 rgb pixels; click in Preview Mode to cycle 5050 rgb pixels.',
    defaultParams: {
      label: 'RGB Addressable LED',
      barHeight: 0.34,
      pixels: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'RGB Addressable LED' },
      { key: 'barHeight', label: 'LED Strip Width', type: 'number', min: 0.22, max: 0.5, step: 0.01, defaultValue: 0.34 },
      { key: 'pixels', label: '5050 RGB Pixels', type: 'number', min: 4, max: 8, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Part: WS2812B Addressable LED Bar (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const barH = clamp(Number(params.barHeight) || 0.34, 0.22, 0.5) * height;
      const leds = clamp(Math.round(Number(params.pixels) || 6), 4, 8);
      const bW = width * 0.86, ox = cx - bW / 2, oy = cy - barH / 2;
      const paths = [{ d: roundRect(ox, oy, bW, barH, 6), closed: true, fill: true }];
      for (let l = 0; l < leds; l++) {
        const lx = ox + 18 + (l * (bW - 36)) / Math.max(1, leds - 1) - 7;
        paths.push({ d: rect(lx, cy - 7, 14, 14), closed: true, fill: true });
        paths.push({ d: circle(lx + 7, cy, 4), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.barHeight !== undefined ? Number(params.barHeight) : 0.34;
  const v2 = params.pixels !== undefined ? Number(params.pixels) : 6;
  const p1Norm = (clamp(v1, 0.22, 0.5) - 0.22) / Math.max(0.0001, 0.28);
  const p2Norm = (clamp(v2, 4, 8) - 4) / Math.max(0.0001, 4);
  return [
    { id: 'barHeight', label: 'LED Strip Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'pixels', label: '5050 RGB Pixels', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'barHeight') {
    return { ...params, barHeight: Number(clamp(0.22 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.28, 0.22, 0.5).toFixed(2)) };
  }
  if (controlId === 'pixels') {
    return { ...params, pixels: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 4, 8)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.pixels !== undefined ? Math.round(Number(params.pixels)) : 6;
  return { ...params, pixels: ((cur - 4 + 1) % 5) + 4 };
}`,
  },

  {
    id: 'drone-piezo-lost-model-buzzer',
    name: 'Drone Part: Autonomous Battery Backed Finder',
    category: 'Drone Parts & Frames',
    description: '110dB self-powered lost-drone finder with cylindrical magnetic piezo buzzer, backup LiPo, and disarm button.',
    iconName: 'Bell',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust piezo drum radius or backup lipo width (%); click in Preview Mode to cycle backup lipo width (%).',
    defaultParams: {
      label: 'Lost-Model Buzzer',
      buzzerR: 0.28,
      batWidth: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Lost-Model Buzzer' },
      { key: 'buzzerR', label: 'Piezo Drum Radius', type: 'number', min: 0.18, max: 0.38, step: 0.01, defaultValue: 0.28 },
      { key: 'batWidth', label: 'Backup LiPo Width (%)', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: Autonomous Battery Backed Finder (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const drumR = clamp(Number(params.buzzerR) || 0.28, 0.18, 0.38) * Math.min(width, height);
      const waves = clamp(Math.round(Number(params.batWidth) || 3), 2, 4);
      const bW = width * 0.78, bH = height * 0.62, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 8), closed: true, fill: true },
        { d: roundRect(ox + 10, oy + 10, bW * 0.36, bH - 20, 4), closed: true, fill: true },
        { d: circle(cx + bW * 0.18, cy, drumR), closed: true, fill: true },
        { d: circle(cx + bW * 0.18, cy, drumR * 0.3), closed: true },
      ];
      for (let w = 1; w <= waves; w++) {
        const wr = drumR + w * 5;
        paths.push({ d: \`M \${cx + bW * 0.18 + wr * 0.6} \${cy - wr * 0.5} A \${wr} \${wr} 0 0 1 \${cx + bW * 0.18 + wr * 0.6} \${cy + wr * 0.5}\` });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.buzzerR !== undefined ? Number(params.buzzerR) : 0.28;
  const v2 = params.batWidth !== undefined ? Number(params.batWidth) : 3;
  const p1Norm = (clamp(v1, 0.18, 0.38) - 0.18) / Math.max(0.0001, 0.2);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'buzzerR', label: 'Piezo Drum Radius', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'batWidth', label: 'Backup LiPo Width (%)', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'buzzerR') {
    return { ...params, buzzerR: Number(clamp(0.18 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.2, 0.18, 0.38).toFixed(2)) };
  }
  if (controlId === 'batWidth') {
    return { ...params, batWidth: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.batWidth !== undefined ? Math.round(Number(params.batWidth)) : 3;
  return { ...params, batWidth: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-anti-spark-power-switch',
    name: 'Drone Part: Solid-State Anti-Spark Switch',
    category: 'Drone Parts & Frames',
    description: '200A solid-state MOSFET power switch with pre-charge circuit and remote illuminated push-button dome.',
    iconName: 'Power',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust main switch pcb width or parallel mosfets; click in Preview Mode to cycle parallel mosfets.',
    defaultParams: {
      label: 'Anti-Spark Switch',
      boardWidth: 0.2,
      fets: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Anti-Spark Switch' },
      { key: 'boardWidth', label: 'Main Switch PCB Width', type: 'number', min: 0.12, max: 0.3, step: 0.01, defaultValue: 0.2 },
      { key: 'fets', label: 'Parallel MOSFETs', type: 'number', min: 2, max: 6, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: Solid-State Anti-Spark Switch (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const tabW = clamp(Number(params.boardWidth) || 0.2, 0.12, 0.3) * width;
      const fets = clamp(Math.round(Number(params.fets) || 4), 2, 6);
      const bW = width * 0.6, bH = height * 0.58, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 6), closed: true, fill: true },
        { d: roundRect(ox - tabW + 4, cy - 14, tabW, 28, 3), closed: true, fill: true },
        { d: roundRect(ox + bW - 4, cy - 14, tabW, 28, 3), closed: true, fill: true },
      ];
      for (let f = 0; f < fets; f++) {
        const fx = ox + 12 + (f * (bW - 34)) / Math.max(1, fets - 1);
        paths.push({ d: rect(fx, cy - 10, 12, 20), closed: true, fill: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.boardWidth !== undefined ? Number(params.boardWidth) : 0.2;
  const v2 = params.fets !== undefined ? Number(params.fets) : 4;
  const p1Norm = (clamp(v1, 0.12, 0.3) - 0.12) / Math.max(0.0001, 0.18);
  const p2Norm = (clamp(v2, 2, 6) - 2) / Math.max(0.0001, 4);
  return [
    { id: 'boardWidth', label: 'Main Switch PCB Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'fets', label: 'Parallel MOSFETs', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'boardWidth') {
    return { ...params, boardWidth: Number(clamp(0.12 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.18, 0.12, 0.3).toFixed(2)) };
  }
  if (controlId === 'fets') {
    return { ...params, fets: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 2, 6)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.fets !== undefined ? Math.round(Number(params.fets)) : 4;
  return { ...params, fets: ((cur - 2 + 1) % 5) + 2 };
}`,
  },

  {
    id: 'drone-low-esr-capacitor-bank',
    name: 'Drone Part: 4× Low-ESR Capacitor Bank PCB',
    category: 'Drone Parts & Frames',
    description: 'Voltage-spike suppression bank carrying multiple radial Panasonic FM low-ESR electrolytic capacitors.',
    iconName: 'Zap',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust capacitor can radius or capacitor count; click in Preview Mode to cycle capacitor count.',
    defaultParams: {
      label: 'Low-ESR Cap Bank',
      capR: 0.18,
      caps: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Low-ESR Cap Bank' },
      { key: 'capR', label: 'Capacitor Can Radius', type: 'number', min: 0.12, max: 0.24, step: 0.01, defaultValue: 0.18 },
      { key: 'caps', label: 'Capacitor Count', type: 'number', min: 2, max: 4, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: 4× Low-ESR Capacitor Bank PCB (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const capR = clamp(Number(params.capR) || 0.18, 0.12, 0.24) * Math.min(width, height);
      const caps = clamp(Math.round(Number(params.caps) || 4), 2, 4);
      const bW = width * 0.82, bH = height * 0.58, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [{ d: roundRect(ox, oy, bW, bH, 8), closed: true, fill: true }];
      for (let c = 0; c < caps; c++) {
        const cxP = ox + 26 + (c * (bW - 52)) / Math.max(1, caps - 1);
        paths.push({ d: circle(cxP, cy, capR), closed: true, fill: true });
        paths.push({ d: line(cxP - capR * 0.6, cy, cxP + capR * 0.6, cy) });
        paths.push({ d: line(cxP, cy - capR * 0.6, cxP, cy + capR * 0.6) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.capR !== undefined ? Number(params.capR) : 0.18;
  const v2 = params.caps !== undefined ? Number(params.caps) : 4;
  const p1Norm = (clamp(v1, 0.12, 0.24) - 0.12) / Math.max(0.0001, 0.12);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'capR', label: 'Capacitor Can Radius', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'caps', label: 'Capacitor Count', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'capR') {
    return { ...params, capR: Number(clamp(0.12 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.12, 0.12, 0.24).toFixed(2)) };
  }
  if (controlId === 'caps') {
    return { ...params, caps: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.caps !== undefined ? Math.round(Number(params.caps)) : 4;
  return { ...params, caps: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-tvs-spike-absorber',
    name: 'Drone Part: TVS Voltage Spike Suppressor',
    category: 'Drone Parts & Frames',
    description: 'Compact Transient Voltage Suppressor (TVS) diode board clamping regenerative braking ESC voltage spikes.',
    iconName: 'ShieldAlert',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust smc diode package size or solder pad pairs; click in Preview Mode to cycle solder pad pairs.',
    defaultParams: {
      label: 'TVS Spike Diode',
      diodeW: 0.44,
      pads: 1,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'TVS Spike Diode' },
      { key: 'diodeW', label: 'SMC Diode Package Size', type: 'number', min: 0.3, max: 0.62, step: 0.01, defaultValue: 0.44 },
      { key: 'pads', label: 'Solder Pad Pairs', type: 'number', min: 1, max: 2, step: 1, defaultValue: 1 },
    ],
    jsSourceCode: `// Drone Part: TVS Voltage Spike Suppressor (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const bodyW = clamp(Number(params.diodeW) || 0.44, 0.3, 0.62) * width;
      const diodes = clamp(Math.round(Number(params.pads) || 1), 1, 2);
      const bW = width * 0.78, bH = height * 0.56, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [{ d: roundRect(ox, oy, bW, bH, 6), closed: true, fill: true }];
      for (let d = 0; d < diodes; d++) {
        const dy = diodes === 1 ? cy : cy - 12 + d * 24;
        paths.push({ d: rect(cx - bodyW / 2, dy - 9, bodyW, 18), closed: true, fill: true });
        paths.push({ d: rect(cx - bodyW / 2 + 6, dy - 9, 8, 18), closed: true });
        paths.push({ d: rect(cx - bodyW / 2 - 10, dy - 5, 10, 10), closed: true });
        paths.push({ d: rect(cx + bodyW / 2, dy - 5, 10, 10), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.diodeW !== undefined ? Number(params.diodeW) : 0.44;
  const v2 = params.pads !== undefined ? Number(params.pads) : 1;
  const p1Norm = (clamp(v1, 0.3, 0.62) - 0.3) / Math.max(0.0001, 0.32);
  const p2Norm = (clamp(v2, 1, 2) - 1) / Math.max(0.0001, 1);
  return [
    { id: 'diodeW', label: 'SMC Diode Package Size', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'pads', label: 'Solder Pad Pairs', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'diodeW') {
    return { ...params, diodeW: Number(clamp(0.3 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.32, 0.3, 0.62).toFixed(2)) };
  }
  if (controlId === 'pads') {
    return { ...params, pads: Math.round(clamp(1 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 1, 1, 2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.pads !== undefined ? Math.round(Number(params.pads)) : 1;
  return { ...params, pads: ((cur - 1 + 1) % 2) + 1 };
}`,
  },

  {
    id: 'drone-smoke-stopper-fuse',
    name: 'Drone Part: Inline Resettable Smoke Stopper',
    category: 'Drone Parts & Frames',
    description: 'Inline XT60 current-limiting electronic fuse protecting new drone builds from short-circuit magic smoke.',
    iconName: 'AlertOctagon',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust center housing length or status/fault indicators; click in Preview Mode to cycle status/fault indicators.',
    defaultParams: {
      label: 'XT60 Smoke Stopper',
      bodyLen: 0.56,
      leds: 2,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'XT60 Smoke Stopper' },
      { key: 'bodyLen', label: 'Center Housing Length', type: 'number', min: 0.4, max: 0.72, step: 0.01, defaultValue: 0.56 },
      { key: 'leds', label: 'Status/Fault Indicators', type: 'number', min: 2, max: 3, step: 1, defaultValue: 2 },
    ],
    jsSourceCode: `// Drone Part: Inline Resettable Smoke Stopper (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const boxW = clamp(Number(params.bodyLen) || 0.56, 0.4, 0.72) * width;
      const leds = clamp(Math.round(Number(params.leds) || 2), 2, 3);
      const bH = height * 0.52;
      const paths = [
        { d: roundRect(cx - boxW / 2 - 20, cy - 14, 24, 28, 4), closed: true, fill: true },
        { d: roundRect(cx + boxW / 2 - 4, cy - 14, 24, 28, 4), closed: true, fill: true },
        { d: roundRect(cx - boxW / 2, cy - bH / 2, boxW, bH, 8), closed: true, fill: true },
        { d: circle(cx + boxW * 0.18, cy, 10), closed: true, fill: true },
      ];
      for (let l = 0; l < leds; l++) {
        paths.push({ d: circle(cx - boxW * 0.24, cy - 10 + l * 12, 4), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.bodyLen !== undefined ? Number(params.bodyLen) : 0.56;
  const v2 = params.leds !== undefined ? Number(params.leds) : 2;
  const p1Norm = (clamp(v1, 0.4, 0.72) - 0.4) / Math.max(0.0001, 0.32);
  const p2Norm = (clamp(v2, 2, 3) - 2) / Math.max(0.0001, 1);
  return [
    { id: 'bodyLen', label: 'Center Housing Length', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'leds', label: 'Status/Fault Indicators', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'bodyLen') {
    return { ...params, bodyLen: Number(clamp(0.4 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.32, 0.4, 0.72).toFixed(2)) };
  }
  if (controlId === 'leds') {
    return { ...params, leds: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 1, 2, 3)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.leds !== undefined ? Math.round(Number(params.leds)) : 2;
  return { ...params, leds: ((cur - 2 + 1) % 2) + 2 };
}`,
  },

  {
    id: 'drone-osd-graphic-chip',
    name: 'Drone Part: Analog MAX7456 OSD Overlay Module',
    category: 'Drone Parts & Frames',
    description: '28-pin SOIC analog On-Screen Display character generator IC with gull-wing leads and video filter caps.',
    iconName: 'Monitor',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust soic-28 body length or gull-wing pins/side; click in Preview Mode to cycle gull-wing pins/side.',
    defaultParams: {
      label: 'AT7456E OSD Chip',
      icLen: 0.34,
      pinsPerSide: 14,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'AT7456E OSD Chip' },
      { key: 'icLen', label: 'SOIC-28 Body Length', type: 'number', min: 0.22, max: 0.48, step: 0.01, defaultValue: 0.34 },
      { key: 'pinsPerSide', label: 'Gull-Wing Pins/Side', type: 'number', min: 8, max: 14, step: 1, defaultValue: 14 },
    ],
    jsSourceCode: `// Drone Part: Analog MAX7456 OSD Overlay Module (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const bodyW = clamp(Number(params.icLen) || 0.34, 0.22, 0.48) * width;
      const pins = clamp(Math.round(Number(params.pinsPerSide) || 14), 8, 14);
      const bH = height * 0.72, ox = cx - bodyW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bodyW, bH, 4), closed: true, fill: true },
        { d: circle(ox + 10, oy + 10, 4), closed: true },
      ];
      for (let p = 0; p < pins; p++) {
        const py = oy + 8 + (p * (bH - 16)) / Math.max(1, pins - 1);
        paths.push({ d: rect(ox - 10, py - 2, 10, 4), closed: true });
        paths.push({ d: rect(ox + bodyW, py - 2, 10, 4), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.icLen !== undefined ? Number(params.icLen) : 0.34;
  const v2 = params.pinsPerSide !== undefined ? Number(params.pinsPerSide) : 14;
  const p1Norm = (clamp(v1, 0.22, 0.48) - 0.22) / Math.max(0.0001, 0.26);
  const p2Norm = (clamp(v2, 8, 14) - 8) / Math.max(0.0001, 6);
  return [
    { id: 'icLen', label: 'SOIC-28 Body Length', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'pinsPerSide', label: 'Gull-Wing Pins/Side', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'icLen') {
    return { ...params, icLen: Number(clamp(0.22 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.26, 0.22, 0.48).toFixed(2)) };
  }
  if (controlId === 'pinsPerSide') {
    return { ...params, pinsPerSide: Math.round(clamp(8 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 6, 8, 14)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.pinsPerSide !== undefined ? Math.round(Number(params.pinsPerSide)) : 14;
  return { ...params, pinsPerSide: ((cur - 8 + 1) % 7) + 8 };
}`,
  },

  {
    id: 'drone-remote-id-broadcast',
    name: 'Drone Part: FAA Standard Remote ID Module',
    category: 'Drone Parts & Frames',
    description: 'Sub-10g FAA/EASA Standard Remote ID broadcast beacon with integrated GPS and 2.4GHz meandered antenna.',
    iconName: 'Radio',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust pcb antenna zone or antenna trace folds; click in Preview Mode to cycle antenna trace folds.',
    defaultParams: {
      label: 'FAA Remote ID Beacon',
      antZone: 0.38,
      meanders: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'FAA Remote ID Beacon' },
      { key: 'antZone', label: 'PCB Antenna Zone', type: 'number', min: 0.24, max: 0.52, step: 0.01, defaultValue: 0.38 },
      { key: 'meanders', label: 'Antenna Trace Folds', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: FAA Standard Remote ID Module (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const patchS = clamp(Number(params.antZone) || 0.38, 0.24, 0.52) * Math.min(width, height);
      const waves = clamp(Math.round(Number(params.meanders) || 3), 2, 4);
      const bW = width * 0.72, bH = height * 0.64, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 8), closed: true, fill: true },
        { d: roundRect(ox + 14, cy - patchS / 2, patchS, patchS, 4), closed: true, fill: true },
        { d: circle(ox + 14 + patchS / 2, cy, 4), closed: true },
      ];
      for (let w = 1; w <= waves; w++) {
        const wr = 10 + w * 7;
        paths.push({ d: \`M \${cx + 12} \${cy - wr * 0.6} A \${wr} \${wr} 0 0 1 \${cx + 12} \${cy + wr * 0.6}\` });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.antZone !== undefined ? Number(params.antZone) : 0.38;
  const v2 = params.meanders !== undefined ? Number(params.meanders) : 3;
  const p1Norm = (clamp(v1, 0.24, 0.52) - 0.24) / Math.max(0.0001, 0.28);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'antZone', label: 'PCB Antenna Zone', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'meanders', label: 'Antenna Trace Folds', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'antZone') {
    return { ...params, antZone: Number(clamp(0.24 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.28, 0.24, 0.52).toFixed(2)) };
  }
  if (controlId === 'meanders') {
    return { ...params, meanders: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.meanders !== undefined ? Math.round(Number(params.meanders)) : 3;
  return { ...params, meanders: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-flight-termination-fts',
    name: 'Drone Part: Independent Flight Termination System',
    category: 'Drone Parts & Frames',
    description: 'Range-safety independent Flight Termination System with guarded arm switch and dual pyro/motor cut outputs.',
    iconName: 'Octagon',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust safety switch guard or cut output channels; click in Preview Mode to cycle cut output channels.',
    defaultParams: {
      label: 'Independent FTS',
      guardW: 0.44,
      channels: 2,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Independent FTS' },
      { key: 'guardW', label: 'Safety Switch Guard', type: 'number', min: 0.3, max: 0.6, step: 0.01, defaultValue: 0.44 },
      { key: 'channels', label: 'Cut Output Channels', type: 'number', min: 2, max: 4, step: 1, defaultValue: 2 },
    ],
    jsSourceCode: `// Drone Part: Independent Flight Termination System (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const guardW = clamp(Number(params.guardW) || 0.44, 0.3, 0.6) * width;
      const channels = clamp(Math.round(Number(params.channels) || 2), 2, 4);
      const bW = width * 0.78, bH = height * 0.64, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 8), closed: true, fill: true },
        { d: roundRect(cx - guardW / 2, cy - 18, guardW, 36, 4), closed: true, strokeDasharray: '4 2' },
        { d: circle(cx, cy, 10), closed: true, fill: true },
      ];
      for (let c = 0; c < channels; c++) {
        const py = oy + 14 + (c * (bH - 28)) / Math.max(1, channels - 1);
        paths.push({ d: rect(ox + 6, py - 4, 14, 8), closed: true });
        paths.push({ d: rect(ox + bW - 20, py - 4, 14, 8), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.guardW !== undefined ? Number(params.guardW) : 0.44;
  const v2 = params.channels !== undefined ? Number(params.channels) : 2;
  const p1Norm = (clamp(v1, 0.3, 0.6) - 0.3) / Math.max(0.0001, 0.3);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'guardW', label: 'Safety Switch Guard', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'channels', label: 'Cut Output Channels', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'guardW') {
    return { ...params, guardW: Number(clamp(0.3 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.3, 0.3, 0.6).toFixed(2)) };
  }
  if (controlId === 'channels') {
    return { ...params, channels: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.channels !== undefined ? Math.round(Number(params.channels)) : 2;
  return { ...params, channels: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-ethernet-switch-onboard',
    name: 'Drone Part: 4-Port Onboard Ethernet Switch',
    category: 'Drone Parts & Frames',
    description: 'Miniature airborne 4-port 100/1000BASE-T Ethernet switch with isolation magnetics and JST-GH LAN ports.',
    iconName: 'Network',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust switch asic size or ethernet lan ports; click in Preview Mode to cycle ethernet lan ports.',
    defaultParams: {
      label: 'Onboard LAN Switch',
      chipScale: 0.36,
      ports: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Onboard LAN Switch' },
      { key: 'chipScale', label: 'Switch ASIC Size', type: 'number', min: 0.22, max: 0.5, step: 0.01, defaultValue: 0.36 },
      { key: 'ports', label: 'Ethernet LAN Ports', type: 'number', min: 3, max: 5, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: 4-Port Onboard Ethernet Switch (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const magH = clamp(Number(params.chipScale) || 0.36, 0.22, 0.5) * height;
      const ports = clamp(Math.round(Number(params.ports) || 4), 3, 5);
      const bW = width * 0.82, bH = height * 0.66, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 6), closed: true, fill: true },
        { d: rect(ox + 16, oy + 10, bW - 32, magH), closed: true, fill: true },
      ];
      for (let p = 0; p < ports; p++) {
        const px = ox + 16 + (p * (bW - 50)) / Math.max(1, ports - 1);
        paths.push({ d: rect(px, oy + bH - 20, 18, 14), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.chipScale !== undefined ? Number(params.chipScale) : 0.36;
  const v2 = params.ports !== undefined ? Number(params.ports) : 4;
  const p1Norm = (clamp(v1, 0.22, 0.5) - 0.22) / Math.max(0.0001, 0.28);
  const p2Norm = (clamp(v2, 3, 5) - 3) / Math.max(0.0001, 2);
  return [
    { id: 'chipScale', label: 'Switch ASIC Size', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'ports', label: 'Ethernet LAN Ports', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'chipScale') {
    return { ...params, chipScale: Number(clamp(0.22 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.28, 0.22, 0.5).toFixed(2)) };
  }
  if (controlId === 'ports') {
    return { ...params, ports: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 3, 5)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.ports !== undefined ? Math.round(Number(params.ports)) : 4;
  return { ...params, ports: ((cur - 3 + 1) % 3) + 3 };
}`,
  },

  {
    id: 'drone-vtx-hd-dual-antenna',
    name: 'Drone Part: Dual-Antenna Digital HD Air Unit',
    category: 'Drone Parts & Frames',
    description: '1080p/120fps digital HD video transmitter with CNC finned shell, dual U.FL antenna jacks, and MIPI cable.',
    iconName: 'Video',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust air unit height ratio or cnc cooling fins; click in Preview Mode to cycle cnc cooling fins.',
    defaultParams: {
      label: 'Digital HD Air Unit',
      bodyH: 0.72,
      fins: 7,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Digital HD Air Unit' },
      { key: 'bodyH', label: 'Air Unit Height Ratio', type: 'number', min: 0.5, max: 0.86, step: 0.01, defaultValue: 0.72 },
      { key: 'fins', label: 'CNC Cooling Fins', type: 'number', min: 4, max: 9, step: 1, defaultValue: 7 },
    ],
    jsSourceCode: `// Drone Part: Dual-Antenna Digital HD Air Unit (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const bodyW = clamp(Number(params.bodyH) || 0.72, 0.5, 0.86) * width;
      const fins = clamp(Math.round(Number(params.fins) || 7), 4, 9);
      const bH = height * 0.64, ox = cx - bodyW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bodyW, bH, 6), closed: true, fill: true },
        { d: circle(ox + bodyW - 14, oy + 12, 4), closed: true },
        { d: circle(ox + bodyW - 14, oy + bH - 12, 4), closed: true },
        { d: line(ox - 16, cy - 8, ox, cy - 8), strokeWidth: 3 },
        { d: line(ox - 16, cy + 8, ox, cy + 8), strokeWidth: 3 },
      ];
      for (let f = 1; f <= fins; f++) {
        const fy = oy + 8 + (f * (bH - 16)) / (fins + 1);
        paths.push({ d: line(ox + 10, fy, ox + bodyW - 24, fy) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.bodyH !== undefined ? Number(params.bodyH) : 0.72;
  const v2 = params.fins !== undefined ? Number(params.fins) : 7;
  const p1Norm = (clamp(v1, 0.5, 0.86) - 0.5) / Math.max(0.0001, 0.36);
  const p2Norm = (clamp(v2, 4, 9) - 4) / Math.max(0.0001, 5);
  return [
    { id: 'bodyH', label: 'Air Unit Height Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'fins', label: 'CNC Cooling Fins', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'bodyH') {
    return { ...params, bodyH: Number(clamp(0.5 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.36, 0.5, 0.86).toFixed(2)) };
  }
  if (controlId === 'fins') {
    return { ...params, fins: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 5, 4, 9)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.fins !== undefined ? Math.round(Number(params.fins)) : 7;
  return { ...params, fins: ((cur - 4 + 1) % 6) + 4 };
}`,
  },

  {
    id: 'drone-vtx-analog-2w-monster',
    name: 'Drone Part: 2.5W High-Power Long-Range VTX',
    category: 'Drone Parts & Frames',
    description: 'High-output 2.5W 5.8GHz analog VTX in milled aluminum heatsink with MMCX jack and 7-segment display.',
    iconName: 'Radio',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust led display window or heatsink ribs; click in Preview Mode to cycle heatsink ribs.',
    defaultParams: {
      label: '2.5W Long-Range VTX',
      winSize: 0.44,
      ribs: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '2.5W Long-Range VTX' },
      { key: 'winSize', label: 'LED Display Window', type: 'number', min: 0.28, max: 0.6, step: 0.01, defaultValue: 0.44 },
      { key: 'ribs', label: 'Heatsink Ribs', type: 'number', min: 2, max: 5, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: 2.5W High-Power Long-Range VTX (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const shieldW = clamp(Number(params.winSize) || 0.44, 0.28, 0.6) * width;
      const pwr = clamp(Math.round(Number(params.ribs) || 4), 2, 5);
      const bW = width * 0.76, bH = height * 0.64, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 6), closed: true, fill: true },
        { d: rect(cx - shieldW / 2, oy + 10, shieldW, bH - 20), closed: true, fill: true },
        { d: rect(ox + bW - 8, cy - 8, 16, 16), closed: true, fill: true },
        { d: circle(ox + 12, oy + 14, 4), closed: true },
      ];
      for (let i = 0; i < pwr; i++) {
        paths.push({ d: circle(ox + 12, oy + 28 + i * 9, 2.5), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.winSize !== undefined ? Number(params.winSize) : 0.44;
  const v2 = params.ribs !== undefined ? Number(params.ribs) : 4;
  const p1Norm = (clamp(v1, 0.28, 0.6) - 0.28) / Math.max(0.0001, 0.32);
  const p2Norm = (clamp(v2, 2, 5) - 2) / Math.max(0.0001, 3);
  return [
    { id: 'winSize', label: 'LED Display Window', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'ribs', label: 'Heatsink Ribs', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'winSize') {
    return { ...params, winSize: Number(clamp(0.28 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.32, 0.28, 0.6).toFixed(2)) };
  }
  if (controlId === 'ribs') {
    return { ...params, ribs: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 2, 5)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.ribs !== undefined ? Math.round(Number(params.ribs)) : 4;
  return { ...params, ribs: ((cur - 2 + 1) % 4) + 2 };
}`,
  },

  {
    id: 'drone-rx-diversity-dual-tcxo',
    name: 'Drone Part: True Diversity Dual-Antenna RX',
    category: 'Drone Parts & Frames',
    description: 'Dual-chain Gemini/True-Diversity receiver PCB with twin RF transceivers, TCXOs, and dual IPEX1 ports.',
    iconName: 'Wifi',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust dual rf chain spacing or ipex antenna ports; click in Preview Mode to cycle ipex antenna ports.',
    defaultParams: {
      label: 'True Diversity RX',
      chipGap: 0.78,
      antennas: 2,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'True Diversity RX' },
      { key: 'chipGap', label: 'Dual RF Chain Spacing', type: 'number', min: 0.5, max: 0.92, step: 0.01, defaultValue: 0.78 },
      { key: 'antennas', label: 'IPEX Antenna Ports', type: 'number', min: 1, max: 2, step: 1, defaultValue: 2 },
    ],
    jsSourceCode: `// Drone Part: True Diversity Dual-Antenna RX (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const span = clamp(Number(params.chipGap) || 0.78, 0.5, 0.92) * (width / 2);
      const tcxos = clamp(Math.round(Number(params.antennas) || 2), 1, 2);
      const bW = width * 0.34, bH = height * 0.42;
      const paths = [
        { d: roundRect(cx - bW / 2, cy - bH / 2, bW, bH, 5), closed: true, fill: true },
        { d: line(cx, cy - bH / 2, cx, height * 0.16), strokeWidth: 2 },
        { d: line(cx - span * 0.65, height * 0.16, cx + span * 0.65, height * 0.16), strokeWidth: 4 },
        { d: line(cx, cy + bH / 2, cx, height * 0.84), strokeWidth: 2 },
        { d: line(cx - span, height * 0.84, cx + span, height * 0.84), strokeWidth: 4 },
      ];
      for (let t = 0; t < tcxos; t++) {
        paths.push({ d: rect(cx - 12 + t * 14, cy - 6, 10, 12), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.chipGap !== undefined ? Number(params.chipGap) : 0.78;
  const v2 = params.antennas !== undefined ? Number(params.antennas) : 2;
  const p1Norm = (clamp(v1, 0.5, 0.92) - 0.5) / Math.max(0.0001, 0.42);
  const p2Norm = (clamp(v2, 1, 2) - 1) / Math.max(0.0001, 1);
  return [
    { id: 'chipGap', label: 'Dual RF Chain Spacing', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'antennas', label: 'IPEX Antenna Ports', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'chipGap') {
    return { ...params, chipGap: Number(clamp(0.5 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.42, 0.5, 0.92).toFixed(2)) };
  }
  if (controlId === 'antennas') {
    return { ...params, antennas: Math.round(clamp(1 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 1, 1, 2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.antennas !== undefined ? Math.round(Number(params.antennas)) : 2;
  return { ...params, antennas: ((cur - 1 + 1) % 2) + 1 };
}`,
  },

  {
    id: 'drone-telemetry-sik-900mhz',
    name: 'Drone Part: 915MHz / 433MHz SiK Telemetry Radio',
    category: 'Drone Parts & Frames',
    description: 'Bidirectional MAVLink SiK telemetry transceiver with perforated RF shield can, SMA jack, and 6-pin UART.',
    iconName: 'Radio',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust rf shield can size or shield vent holes; click in Preview Mode to cycle shield vent holes.',
    defaultParams: {
      label: '915MHz SiK Telemetry',
      canScale: 0.34,
      holes: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '915MHz SiK Telemetry' },
      { key: 'canScale', label: 'RF Shield Can Size', type: 'number', min: 0.18, max: 0.48, step: 0.01, defaultValue: 0.34 },
      { key: 'holes', label: 'Shield Vent Holes', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: 915MHz / 433MHz SiK Telemetry Radio (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height * 0.56;
      const whipH = clamp(Number(params.canScale) || 0.34, 0.18, 0.48) * height;
      const leds = clamp(Math.round(Number(params.holes) || 3), 2, 4);
      const bW = width * 0.68, bH = height * 0.42, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 6), closed: true, fill: true },
        { d: rect(cx - 8, oy - 10, 16, 10), closed: true, fill: true },
        { d: roundRect(cx - 5, oy - 10 - whipH, 10, whipH, 5), closed: true, fill: true },
        { d: rect(ox - 10, cy - 8, 10, 16), closed: true },
      ];
      for (let l = 0; l < leds; l++) {
        paths.push({ d: circle(ox + 16 + l * 14, cy, 3), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.canScale !== undefined ? Number(params.canScale) : 0.34;
  const v2 = params.holes !== undefined ? Number(params.holes) : 3;
  const p1Norm = (clamp(v1, 0.18, 0.48) - 0.18) / Math.max(0.0001, 0.3);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'canScale', label: 'RF Shield Can Size', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'holes', label: 'Shield Vent Holes', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'canScale') {
    return { ...params, canScale: Number(clamp(0.18 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.3, 0.18, 0.48).toFixed(2)) };
  }
  if (controlId === 'holes') {
    return { ...params, holes: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.holes !== undefined ? Math.round(Number(params.holes)) : 3;
  return { ...params, holes: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-4g-5g-lte-cellular-modem',
    name: 'Drone Part: 4G/5G BVLOS Cellular Modem',
    category: 'Drone Parts & Frames',
    description: 'Unlimited-range BVLOS 4G/5G cellular airborne modem with nano-SIM tray and 4 corner MIMO antenna jacks.',
    iconName: 'Smartphone',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust nano-sim tray size or mimo antenna jacks; click in Preview Mode to cycle mimo antenna jacks.',
    defaultParams: {
      label: '4G/5G BVLOS Modem',
      simWidth: 0.3,
      mimoPorts: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '4G/5G BVLOS Modem' },
      { key: 'simWidth', label: 'Nano-SIM Tray Size', type: 'number', min: 0.18, max: 0.44, step: 0.01, defaultValue: 0.3 },
      { key: 'mimoPorts', label: 'MIMO Antenna Jacks', type: 'number', min: 2, max: 4, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: 4G/5G BVLOS Cellular Modem (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const simW = clamp(Number(params.simWidth) || 0.3, 0.18, 0.44) * width;
      const ports = clamp(Math.round(Number(params.mimoPorts) || 4), 2, 4);
      const bW = width * 0.72, bH = height * 0.64, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 6), closed: true, fill: true },
        { d: rect(ox + 14, cy - 18, bW * 0.42, 36), closed: true, fill: true },
        { d: roundRect(ox + bW - simW - 10, cy - 12, simW, 24, 3), closed: true },
      ];
      for (let p = 0; p < ports; p++) {
        const px = ox + 16 + (p * (bW - 32)) / Math.max(1, ports - 1);
        paths.push({ d: circle(px, oy + 8, 3.5), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.simWidth !== undefined ? Number(params.simWidth) : 0.3;
  const v2 = params.mimoPorts !== undefined ? Number(params.mimoPorts) : 4;
  const p1Norm = (clamp(v1, 0.18, 0.44) - 0.18) / Math.max(0.0001, 0.26);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'simWidth', label: 'Nano-SIM Tray Size', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'mimoPorts', label: 'MIMO Antenna Jacks', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'simWidth') {
    return { ...params, simWidth: Number(clamp(0.18 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.26, 0.18, 0.44).toFixed(2)) };
  }
  if (controlId === 'mimoPorts') {
    return { ...params, mimoPorts: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.mimoPorts !== undefined ? Math.round(Number(params.mimoPorts)) : 4;
  return { ...params, mimoPorts: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-iridium-satcom-transceiver',
    name: 'Drone Part: Iridium SatCom BVLOS Module',
    category: 'Drone Parts & Frames',
    description: 'Global satellite Short Burst Data (SBD) transceiver in gold-chromate milled RF shield with L-band patch.',
    iconName: 'Globe',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust l-band ceramic patch or perimeter shield screws; click in Preview Mode to cycle perimeter shield screws.',
    defaultParams: {
      label: 'Iridium SatCom SBD',
      patchScale: 0.68,
      screws: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Iridium SatCom SBD' },
      { key: 'patchScale', label: 'L-Band Ceramic Patch', type: 'number', min: 0.46, max: 0.86, step: 0.01, defaultValue: 0.68 },
      { key: 'screws', label: 'Perimeter Shield Screws', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: Iridium SatCom BVLOS Module (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height * 0.46;
      const domeW = clamp(Number(params.patchScale) || 0.68, 0.46, 0.86) * width;
      const rings = clamp(Math.round(Number(params.screws) || 3), 2, 4);
      const dR = domeW / 2;
      const paths = [
        { d: roundRect(cx - dR * 0.85, cy, dR * 1.7, height * 0.34, 6), closed: true, fill: true },
        { d: \`M \${cx - dR} \${cy} A \${dR} \${height * 0.32} 0 0 1 \${cx + dR} \${cy} Z\`, closed: true, fill: true },
        { d: rect(cx - dR * 0.6, cy + 8, dR * 1.2, height * 0.2), closed: true },
      ];
      for (let r = 1; r <= rings; r++) {
        const rx = dR * (r / (rings + 1));
        paths.push({ d: ellipse(cx, cy - 10, rx, rx * 0.35), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.patchScale !== undefined ? Number(params.patchScale) : 0.68;
  const v2 = params.screws !== undefined ? Number(params.screws) : 3;
  const p1Norm = (clamp(v1, 0.46, 0.86) - 0.46) / Math.max(0.0001, 0.4);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'patchScale', label: 'L-Band Ceramic Patch', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'screws', label: 'Perimeter Shield Screws', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'patchScale') {
    return { ...params, patchScale: Number(clamp(0.46 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.4, 0.46, 0.86).toFixed(2)) };
  }
  if (controlId === 'screws') {
    return { ...params, screws: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.screws !== undefined ? Math.round(Number(params.screws)) : 3;
  return { ...params, screws: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-antenna-pagoda-rhcp',
    name: 'Drone Part: Pagoda-2 Circular Polarized Antenna',
    category: 'Drone Parts & Frames',
    description: 'Open-hardware Pagoda-2 omnidirectional 5.8GHz antenna composed of 3 stacked FR4 PCB discs on rigid coax.',
    iconName: 'Disc',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust pagoda disc diameter or stacked pcb discs; click in Preview Mode to cycle stacked pcb discs.',
    defaultParams: {
      label: 'Pagoda-2 RHCP Ant',
      discWidth: 0.34,
      discs: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Pagoda-2 RHCP Ant' },
      { key: 'discWidth', label: 'Pagoda Disc Diameter', type: 'number', min: 0.22, max: 0.46, step: 0.01, defaultValue: 0.34 },
      { key: 'discs', label: 'Stacked PCB Discs', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: Pagoda-2 Circular Polarized Antenna (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2;
      const dR = clamp(Number(params.discWidth) || 0.34, 0.22, 0.46) * width;
      const discs = clamp(Math.round(Number(params.discs) || 3), 2, 4);
      const topY = height * 0.16, botY = height * 0.84;
      const paths = [
        { d: line(cx, topY, cx, botY), strokeWidth: 5 },
        { d: rect(cx - 10, botY - 12, 20, 12), closed: true, fill: true },
      ];
      for (let d = 0; d < discs; d++) {
        const dy = topY + 6 + d * 14;
        paths.push({ d: ellipse(cx, dy, dR, 7), closed: true, fill: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.discWidth !== undefined ? Number(params.discWidth) : 0.34;
  const v2 = params.discs !== undefined ? Number(params.discs) : 3;
  const p1Norm = (clamp(v1, 0.22, 0.46) - 0.22) / Math.max(0.0001, 0.24);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'discWidth', label: 'Pagoda Disc Diameter', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'discs', label: 'Stacked PCB Discs', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'discWidth') {
    return { ...params, discWidth: Number(clamp(0.22 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.24, 0.22, 0.46).toFixed(2)) };
  }
  if (controlId === 'discs') {
    return { ...params, discs: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.discs !== undefined ? Math.round(Number(params.discs)) : 3;
  return { ...params, discs: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-antenna-cloverleaf-skew',
    name: 'Drone Part: 4-Lobe Cloverleaf Skew-Planar',
    category: 'Drone Parts & Frames',
    description: 'Circularly polarized 4-lobe skew-planar wheel wire antenna with exposed copper petals and coax stem.',
    iconName: 'Flower2',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust wire lobe radius or radiating wire lobes; click in Preview Mode to cycle radiating wire lobes.',
    defaultParams: {
      label: 'Cloverleaf Antenna',
      lobeR: 0.24,
      lobes: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Cloverleaf Antenna' },
      { key: 'lobeR', label: 'Wire Lobe Radius', type: 'number', min: 0.14, max: 0.34, step: 0.01, defaultValue: 0.24 },
      { key: 'lobes', label: 'Radiating Wire Lobes', type: 'number', min: 3, max: 4, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: 4-Lobe Cloverleaf Skew-Planar (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, topY = height * 0.34;
      const lobeR = clamp(Number(params.lobeR) || 0.24, 0.14, 0.34) * Math.min(width, height);
      const petals = clamp(Math.round(Number(params.lobes) || 4), 3, 4);
      const paths = [
        { d: line(cx, topY, cx, height * 0.84), strokeWidth: 5 },
        { d: rect(cx - 10, height * 0.74, 20, 12), closed: true, fill: true },
      ];
      for (let p = 0; p < petals; p++) {
        const a = (p * Math.PI * 2) / petals - Math.PI / 2;
        const lx = cx + Math.cos(a) * lobeR, ly = topY + Math.sin(a) * lobeR * 0.65;
        paths.push({ d: ellipse(lx, ly, lobeR * 0.72, lobeR * 0.48), closed: true });
      }
      paths.push({ d: circle(cx, topY, 5), closed: true, fill: true });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.lobeR !== undefined ? Number(params.lobeR) : 0.24;
  const v2 = params.lobes !== undefined ? Number(params.lobes) : 4;
  const p1Norm = (clamp(v1, 0.14, 0.34) - 0.14) / Math.max(0.0001, 0.2);
  const p2Norm = (clamp(v2, 3, 4) - 3) / Math.max(0.0001, 1);
  return [
    { id: 'lobeR', label: 'Wire Lobe Radius', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'lobes', label: 'Radiating Wire Lobes', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'lobeR') {
    return { ...params, lobeR: Number(clamp(0.14 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.2, 0.14, 0.34).toFixed(2)) };
  }
  if (controlId === 'lobes') {
    return { ...params, lobes: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 1, 3, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.lobes !== undefined ? Math.round(Number(params.lobes)) : 4;
  return { ...params, lobes: ((cur - 3 + 1) % 2) + 3 };
}`,
  },

  {
    id: 'drone-antenna-helical-directional',
    name: 'Drone Part: 7-Turn Helical Directional Antenna',
    category: 'Drone Parts & Frames',
    description: 'High-gain axial-mode helical directional antenna with circular reflector plate and copper coil turns.',
    iconName: 'FastForward',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust helix coil diameter or helical coil turns; click in Preview Mode to cycle helical coil turns.',
    defaultParams: {
      label: '7-Turn Helical Ant',
      coilHeight: 0.64,
      turns: 5,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '7-Turn Helical Ant' },
      { key: 'coilHeight', label: 'Helix Coil Diameter', type: 'number', min: 0.42, max: 0.82, step: 0.01, defaultValue: 0.64 },
      { key: 'turns', label: 'Helical Coil Turns', type: 'number', min: 3, max: 7, step: 1, defaultValue: 5 },
    ],
    jsSourceCode: `// Drone Part: 7-Turn Helical Directional Antenna (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cy = height / 2;
      const coilW = clamp(Number(params.coilHeight) || 0.64, 0.42, 0.82) * width;
      const turns = clamp(Math.round(Number(params.turns) || 5), 3, 7);
      const x0 = width * 0.16, cH = height * 0.42;
      const paths = [
        { d: roundRect(x0 - 8, cy - cH * 0.72, 10, cH * 1.44, 3), closed: true, fill: true },
        { d: line(x0, cy, x0 + coilW, cy), strokeWidth: 3 },
      ];
      for (let t = 0; t < turns; t++) {
        const tx = x0 + 14 + (t * (coilW - 24)) / Math.max(1, turns - 1);
        paths.push({ d: ellipse(tx, cy, 10, cH / 2), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.coilHeight !== undefined ? Number(params.coilHeight) : 0.64;
  const v2 = params.turns !== undefined ? Number(params.turns) : 5;
  const p1Norm = (clamp(v1, 0.42, 0.82) - 0.42) / Math.max(0.0001, 0.4);
  const p2Norm = (clamp(v2, 3, 7) - 3) / Math.max(0.0001, 4);
  return [
    { id: 'coilHeight', label: 'Helix Coil Diameter', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'turns', label: 'Helical Coil Turns', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'coilHeight') {
    return { ...params, coilHeight: Number(clamp(0.42 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.4, 0.42, 0.82).toFixed(2)) };
  }
  if (controlId === 'turns') {
    return { ...params, turns: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 3, 7)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.turns !== undefined ? Math.round(Number(params.turns)) : 5;
  return { ...params, turns: ((cur - 3 + 1) % 5) + 3 };
}`,
  },

  {
    id: 'drone-antenna-crosshair-xtreme',
    name: 'Drone Part: Crosshair Xtreme Patch Antenna',
    category: 'Drone Parts & Frames',
    description: 'High-gain circularly polarized Crosshair patch antenna with driven cross-dipole and 4 parasitic directors.',
    iconName: 'Crosshair',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust driven cross span or corner director pads; click in Preview Mode to cycle corner director pads.',
    defaultParams: {
      label: 'Crosshair Patch Ant',
      crossSpan: 0.64,
      directors: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Crosshair Patch Ant' },
      { key: 'crossSpan', label: 'Driven Cross Span', type: 'number', min: 0.42, max: 0.82, step: 0.01, defaultValue: 0.64 },
      { key: 'directors', label: 'Corner Director Pads', type: 'number', min: 2, max: 4, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: Crosshair Xtreme Patch Antenna (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, s = Math.min(width, height) * 0.76;
      const crossS = clamp(Number(params.crossSpan) || 0.64, 0.42, 0.82) * s;
      const paras = clamp(Math.round(Number(params.directors) || 4), 2, 4);
      const paths = [
        { d: roundRect(cx - s / 2, cy - s / 2, s, s, 8), closed: true, fill: true },
        { d: line(cx - crossS / 2, cy, cx + crossS / 2, cy), strokeWidth: 4 },
        { d: line(cx, cy - crossS / 2, cx, cy + crossS / 2), strokeWidth: 4 },
        { d: circle(cx, cy, 6), closed: true, fill: true },
      ];
      for (let p = 0; p < paras; p++) {
        const a = (p * Math.PI) / 2 + Math.PI / 4;
        const px = cx + Math.cos(a) * crossS * 0.42, py = cy + Math.sin(a) * crossS * 0.42;
        paths.push({ d: rect(px - 6, py - 6, 12, 12), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.crossSpan !== undefined ? Number(params.crossSpan) : 0.64;
  const v2 = params.directors !== undefined ? Number(params.directors) : 4;
  const p1Norm = (clamp(v1, 0.42, 0.82) - 0.42) / Math.max(0.0001, 0.4);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'crossSpan', label: 'Driven Cross Span', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'directors', label: 'Corner Director Pads', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'crossSpan') {
    return { ...params, crossSpan: Number(clamp(0.42 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.4, 0.42, 0.82).toFixed(2)) };
  }
  if (controlId === 'directors') {
    return { ...params, directors: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.directors !== undefined ? Math.round(Number(params.directors)) : 4;
  return { ...params, directors: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-antenna-moxon-directional',
    name: 'Drone Part: Moxon Rectangular TX Antenna',
    category: 'Drone Parts & Frames',
    description: 'Directional 915MHz/2.4GHz Moxon rectangle antenna with folded driven element and coupled reflector bar.',
    iconName: 'RectangleHorizontal',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust element span width or tip insulator gap; click in Preview Mode to cycle tip insulator gap.',
    defaultParams: {
      label: '900MHz Moxon Ant',
      boxWidth: 0.42,
      gapSize: 0.78,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '900MHz Moxon Ant' },
      { key: 'boxWidth', label: 'Element Span Width', type: 'number', min: 0.24, max: 0.62, step: 0.01, defaultValue: 0.42 },
      { key: 'gapSize', label: 'Tip Insulator Gap', type: 'number', min: 0.56, max: 0.9, step: 0.01, defaultValue: 0.78 },
    ],
    jsSourceCode: `// Drone Part: Moxon Rectangular TX Antenna (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const gap = clamp(Number(params.boxWidth) || 0.42, 0.24, 0.62) * height;
      const span = clamp(Number(params.gapSize) || 0.78, 0.56, 0.9) * width;
      const ox = cx - span / 2, y1 = cy - gap / 2, y2 = cy + gap / 2;
      return [
        { d: roundRect(ox - 8, y1 - 8, span + 16, gap + 16, 6), closed: true, fill: true },
        { d: \`M \${ox} \${y1 + 14} L \${ox} \${y1} L \${cx - 6} \${y1}\`, strokeWidth: 3.5 },
        { d: \`M \${ox + span} \${y1 + 14} L \${ox + span} \${y1} L \${cx + 6} \${y1}\`, strokeWidth: 3.5 },
        { d: \`M \${ox} \${y2 - 14} L \${ox} \${y2} L \${ox + span} \${y2} L \${ox + span} \${y2 - 14}\`, strokeWidth: 3.5 },
        { d: line(cx, y1, cx, height * 0.88), strokeWidth: 3 },
      ];
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.boxWidth !== undefined ? Number(params.boxWidth) : 0.42;
  const v2 = params.gapSize !== undefined ? Number(params.gapSize) : 0.78;
  const p1Norm = (clamp(v1, 0.24, 0.62) - 0.24) / Math.max(0.0001, 0.38);
  const p2Norm = (clamp(v2, 0.56, 0.9) - 0.56) / Math.max(0.0001, 0.34);
  return [
    { id: 'boxWidth', label: 'Element Span Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'gapSize', label: 'Tip Insulator Gap', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'boxWidth') {
    return { ...params, boxWidth: Number(clamp(0.24 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.38, 0.24, 0.62).toFixed(2)) };
  }
  if (controlId === 'gapSize') {
    return { ...params, gapSize: Number(clamp(0.56 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.34, 0.56, 0.9).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.gapSize !== undefined ? Number(params.gapSize) : 0.78;
  const next = cur + 0.11 > 0.9 + 0.001 ? 0.56 : Number((cur + 0.11).toFixed(2));
  return { ...params, gapSize: next };
}`,
  },

  {
    id: 'drone-antenna-yagi-uda-array',
    name: 'Drone Part: 5-Element Yagi-Uda Boom Antenna',
    category: 'Drone Parts & Frames',
    description: 'Directional Yagi-Uda beam antenna with rear reflector, folded driven dipole, and tapered director elements.',
    iconName: 'AlignCenterHorizontal',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust director taper ratio or director elements; click in Preview Mode to cycle director elements.',
    defaultParams: {
      label: 'Yagi-Uda Array',
      taper: 0.78,
      directors: 5,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Yagi-Uda Array' },
      { key: 'taper', label: 'Director Taper Ratio', type: 'number', min: 0.56, max: 0.9, step: 0.01, defaultValue: 0.78 },
      { key: 'directors', label: 'Director Elements', type: 'number', min: 3, max: 7, step: 1, defaultValue: 5 },
    ],
    jsSourceCode: `// Drone Part: 5-Element Yagi-Uda Boom Antenna (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cy = height / 2;
      const boomW = clamp(Number(params.taper) || 0.78, 0.56, 0.9) * width;
      const dirs = clamp(Math.round(Number(params.directors) || 5), 3, 7);
      const x0 = (width - boomW) / 2;
      const paths = [
        { d: line(x0, cy, x0 + boomW, cy), strokeWidth: 4 },
        { d: line(x0 + 8, cy - height * 0.38, x0 + 8, cy + height * 0.38), strokeWidth: 4 },
        { d: roundRect(x0 + 24, cy - height * 0.32, 10, height * 0.64, 5), closed: true },
      ];
      for (let d = 0; d < dirs; d++) {
        const dx = x0 + 46 + (d * (boomW - 52)) / Math.max(1, dirs - 1);
        const h = height * (0.28 - d * 0.02);
        paths.push({ d: line(dx, cy - h, dx, cy + h), strokeWidth: 3 });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.taper !== undefined ? Number(params.taper) : 0.78;
  const v2 = params.directors !== undefined ? Number(params.directors) : 5;
  const p1Norm = (clamp(v1, 0.56, 0.9) - 0.56) / Math.max(0.0001, 0.34);
  const p2Norm = (clamp(v2, 3, 7) - 3) / Math.max(0.0001, 4);
  return [
    { id: 'taper', label: 'Director Taper Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'directors', label: 'Director Elements', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'taper') {
    return { ...params, taper: Number(clamp(0.56 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.34, 0.56, 0.9).toFixed(2)) };
  }
  if (controlId === 'directors') {
    return { ...params, directors: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 3, 7)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.directors !== undefined ? Math.round(Number(params.directors)) : 5;
  return { ...params, directors: ((cur - 3 + 1) % 5) + 3 };
}`,
  },

  {
    id: 'drone-antenna-biquad-patch',
    name: 'Drone Part: Double-Diamond BiQuad Antenna',
    category: 'Drone Parts & Frames',
    description: 'Directional 11dBi BiQuad antenna featuring a figure-8 double-diamond copper wire loop over a reflector.',
    iconName: 'Diamond',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust double-diamond span or reflector side lips; click in Preview Mode to cycle reflector side lips.',
    defaultParams: {
      label: 'BiQuad Patch Ant',
      quadScale: 0.28,
      lips: 2,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'BiQuad Patch Ant' },
      { key: 'quadScale', label: 'Double-Diamond Span', type: 'number', min: 0.18, max: 0.38, step: 0.01, defaultValue: 0.28 },
      { key: 'lips', label: 'Reflector Side Lips', type: 'number', min: 2, max: 4, step: 1, defaultValue: 2 },
    ],
    jsSourceCode: `// Drone Part: Double-Diamond BiQuad Antenna (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const dS = clamp(Number(params.quadScale) || 0.28, 0.18, 0.38) * Math.min(width, height);
      const quads = clamp(Math.round(Number(params.lips) || 2), 2, 4);
      const pW = width * 0.8, pH = height * 0.64;
      const paths = [
        { d: roundRect(cx - pW / 2, cy - pH / 2, pW, pH, 8), closed: true, fill: true },
        { d: polygon([[cx, cy], [cx - dS, cy - dS], [cx - dS * 2, cy], [cx - dS, cy + dS]]), closed: true },
        { d: polygon([[cx, cy], [cx + dS, cy - dS], [cx + dS * 2, cy], [cx + dS, cy + dS]]), closed: true },
        { d: circle(cx, cy, 5), closed: true, fill: true },
      ];
      if (quads > 2) {
        paths.push({ d: polygon([[cx, cy], [cx - dS * 0.7, cy - dS * 1.15], [cx, cy - dS * 1.8], [cx + dS * 0.7, cy - dS * 1.15]]), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.quadScale !== undefined ? Number(params.quadScale) : 0.28;
  const v2 = params.lips !== undefined ? Number(params.lips) : 2;
  const p1Norm = (clamp(v1, 0.18, 0.38) - 0.18) / Math.max(0.0001, 0.2);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'quadScale', label: 'Double-Diamond Span', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'lips', label: 'Reflector Side Lips', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'quadScale') {
    return { ...params, quadScale: Number(clamp(0.18 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.2, 0.18, 0.38).toFixed(2)) };
  }
  if (controlId === 'lips') {
    return { ...params, lips: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.lips !== undefined ? Math.round(Number(params.lips)) : 2;
  return { ...params, lips: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-antenna-ceramic-patch',
    name: 'Drone Part: 25×25mm Ceramic GNSS Patch',
    category: 'Drone Parts & Frames',
    description: 'Sintered dielectric ceramic GPS/Galileo patch antenna with opposite corner chamfers and off-center feed pin.',
    iconName: 'Square',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust ceramic block ratio or polarization chamfer; click in Preview Mode to cycle polarization chamfer.',
    defaultParams: {
      label: 'Ceramic GNSS Patch',
      patchScale: 0.64,
      chamfer: 0.18,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Ceramic GNSS Patch' },
      { key: 'patchScale', label: 'Ceramic Block Ratio', type: 'number', min: 0.42, max: 0.82, step: 0.01, defaultValue: 0.64 },
      { key: 'chamfer', label: 'Polarization Chamfer', type: 'number', min: 0.08, max: 0.28, step: 0.01, defaultValue: 0.18 },
    ],
    jsSourceCode: `// Drone Part: 25×25mm Ceramic GNSS Patch (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, s = Math.min(width, height) * 0.78;
      const pS = clamp(Number(params.patchScale) || 0.64, 0.42, 0.82) * s;
      const cham = clamp(Number(params.chamfer) || 0.18, 0.08, 0.28) * pS;
      const ox = cx - pS / 2, oy = cy - pS / 2;
      return [
        { d: roundRect(cx - s / 2, cy - s / 2, s, s, 8), closed: true, fill: true },
        { d: polygon([[ox + cham, oy], [ox + pS, oy], [ox + pS, oy + pS - cham], [ox + pS - cham, oy + pS], [ox, oy + pS], [ox, oy + cham]]), closed: true, fill: true },
        { d: circle(cx, cy + pS * 0.2, 4.5), closed: true },
        { d: circle(cx, cy, 2), closed: true },
      ];
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.patchScale !== undefined ? Number(params.patchScale) : 0.64;
  const v2 = params.chamfer !== undefined ? Number(params.chamfer) : 0.18;
  const p1Norm = (clamp(v1, 0.42, 0.82) - 0.42) / Math.max(0.0001, 0.4);
  const p2Norm = (clamp(v2, 0.08, 0.28) - 0.08) / Math.max(0.0001, 0.2);
  return [
    { id: 'patchScale', label: 'Ceramic Block Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'chamfer', label: 'Polarization Chamfer', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'patchScale') {
    return { ...params, patchScale: Number(clamp(0.42 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.4, 0.42, 0.82).toFixed(2)) };
  }
  if (controlId === 'chamfer') {
    return { ...params, chamfer: Number(clamp(0.08 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.2, 0.08, 0.28).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.chamfer !== undefined ? Number(params.chamfer) : 0.18;
  const next = cur + 0.07 > 0.28 + 0.001 ? 0.08 : Number((cur + 0.07).toFixed(2));
  return { ...params, chamfer: next };
}`,
  },

  {
    id: 'drone-antenna-helix-active-rtk',
    name: 'Drone Part: Multi-Band RTK Helix Antenna',
    category: 'Drone Parts & Frames',
    description: 'Zero-phase-center multi-frequency L1/L2/L5 RTK quadrifilar helix antenna inside cylindrical radome.',
    iconName: 'Radio',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust radome cylinder width or quadrifilar windings; click in Preview Mode to cycle quadrifilar windings.',
    defaultParams: {
      label: 'RTK Helix Antenna',
      domeWidth: 0.38,
      spirals: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'RTK Helix Antenna' },
      { key: 'domeWidth', label: 'Radome Cylinder Width', type: 'number', min: 0.24, max: 0.54, step: 0.01, defaultValue: 0.38 },
      { key: 'spirals', label: 'Quadrifilar Windings', type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: Multi-Band RTK Helix Antenna (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2;
      const cylW = clamp(Number(params.domeWidth) || 0.38, 0.24, 0.54) * width;
      const fils = clamp(Math.round(Number(params.spirals) || 4), 3, 6);
      const topY = height * 0.16, bY = height * 0.76, cH = bY - topY;
      const paths = [
        { d: roundRect(cx - cylW / 2, topY, cylW, cH, cylW / 2), closed: true, fill: true },
        { d: rect(cx - cylW * 0.34, bY, cylW * 0.68, 12), closed: true, fill: true },
      ];
      for (let f = 0; f < fils; f++) {
        const y0 = topY + 14 + (f * (cH - 28)) / Math.max(1, fils - 1);
        paths.push({ d: line(cx - cylW * 0.44, y0 - 8, cx + cylW * 0.44, y0 + 8) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.domeWidth !== undefined ? Number(params.domeWidth) : 0.38;
  const v2 = params.spirals !== undefined ? Number(params.spirals) : 4;
  const p1Norm = (clamp(v1, 0.24, 0.54) - 0.24) / Math.max(0.0001, 0.3);
  const p2Norm = (clamp(v2, 3, 6) - 3) / Math.max(0.0001, 3);
  return [
    { id: 'domeWidth', label: 'Radome Cylinder Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'spirals', label: 'Quadrifilar Windings', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'domeWidth') {
    return { ...params, domeWidth: Number(clamp(0.24 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.3, 0.24, 0.54).toFixed(2)) };
  }
  if (controlId === 'spirals') {
    return { ...params, spirals: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 3, 6)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.spirals !== undefined ? Math.round(Number(params.spirals)) : 4;
  return { ...params, spirals: ((cur - 3 + 1) % 4) + 3 };
}`,
  },

  {
    id: 'drone-antenna-rubber-duck-whip',
    name: 'Drone Part: Hinged 90° Monopole Whip Antenna',
    category: 'Drone Parts & Frames',
    description: 'Articulated 90-degree hinged monopole whip antenna with knurled SMA connector nut.',
    iconName: 'Navigation',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust whip tip tilt x or knuckle segments; click in Preview Mode to cycle knuckle segments.',
    defaultParams: {
      label: '90° Whip Antenna',
      tiltX: 0.34,
      segments: 0.28,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '90° Whip Antenna' },
      { key: 'tiltX', label: 'Whip Tip Tilt X', type: 'number', min: 0.18, max: 0.5, step: 0.01, defaultValue: 0.34 },
      { key: 'segments', label: 'Knuckle Segments', type: 'number', min: 0.08, max: 0.5, step: 0.01, defaultValue: 0.28 },
    ],
    jsSourceCode: `// Drone Part: Hinged 90° Monopole Whip Antenna (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2;
      const activeH = clamp(Number(params.tiltX) || 0.34, 0.18, 0.5) * height;
      const bend = clamp(Number(params.segments) || 0.28, 0.08, 0.5) * width;
      return [
        { d: rect(cx - 8, height * 0.78, 16, 10), closed: true, fill: true },
        { d: \`M \${cx} \${height * 0.78} Q \${cx + bend} \${height * 0.5} \${cx + bend * 0.6} \${height * 0.14 + activeH}\`, strokeWidth: 5 },
        { d: line(cx + bend * 0.6, height * 0.14 + activeH, cx + bend * 0.6, height * 0.14), strokeWidth: 2 },
        { d: circle(cx + bend * 0.6, height * 0.14, 3), closed: true, fill: true },
      ];
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.tiltX !== undefined ? Number(params.tiltX) : 0.34;
  const v2 = params.segments !== undefined ? Number(params.segments) : 0.28;
  const p1Norm = (clamp(v1, 0.18, 0.5) - 0.18) / Math.max(0.0001, 0.32);
  const p2Norm = (clamp(v2, 0.08, 0.5) - 0.08) / Math.max(0.0001, 0.42);
  return [
    { id: 'tiltX', label: 'Whip Tip Tilt X', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'segments', label: 'Knuckle Segments', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'tiltX') {
    return { ...params, tiltX: Number(clamp(0.18 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.32, 0.18, 0.5).toFixed(2)) };
  }
  if (controlId === 'segments') {
    return { ...params, segments: Number(clamp(0.08 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.42, 0.08, 0.5).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.segments !== undefined ? Number(params.segments) : 0.28;
  const next = cur + 0.14 > 0.5 + 0.001 ? 0.08 : Number((cur + 0.14).toFixed(2));
  return { ...params, segments: next };
}`,
  },

  {
    id: 'drone-coax-sma-to-ufl-pigtail',
    name: 'Drone Part: SMA Bulkhead to U.FL Coax Pigtail',
    category: 'Drone Parts & Frames',
    description: 'Threaded brass SMA bulkhead jack with locknut connected via S-curved RG178 coax to micro U.FL plug.',
    iconName: 'GitCommit',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust coax s-curve arch or sma bulkhead threads; click in Preview Mode to cycle sma bulkhead threads.',
    defaultParams: {
      label: 'SMA-to-U.FL Pigtail',
      curveAmp: 0.42,
      threads: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'SMA-to-U.FL Pigtail' },
      { key: 'curveAmp', label: 'Coax S-Curve Arch', type: 'number', min: 0.2, max: 0.65, step: 0.01, defaultValue: 0.42 },
      { key: 'threads', label: 'SMA Bulkhead Threads', type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: SMA Bulkhead to U.FL Coax Pigtail (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const loopH = clamp(Number(params.curveAmp) || 0.42, 0.2, 0.65) * height;
      const flats = clamp(Math.round(Number(params.threads) || 4), 3, 6);
      const lx = width * 0.2, rx = width * 0.78;
      const paths = [
        { d: circle(lx, cy + 10, 9), closed: true, fill: true },
        { d: circle(lx, cy + 10, 3.5), closed: true },
        { d: \`M \${lx + 9} \${cy + 10} C \${cx - 20} \${cy - loopH} \${cx + 20} \${cy + loopH} \${rx - 14} \${cy}\`, strokeWidth: 4.5 },
        { d: rect(rx - 14, cy - 12, 12, 24), closed: true, fill: true },
        { d: rect(rx - 2, cy - 8, 14, 16), closed: true },
      ];
      for (let t = 1; t <= flats; t++) {
        const tx = rx - 2 + (t * 14) / (flats + 1);
        paths.push({ d: line(tx, cy - 8, tx, cy + 8) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.curveAmp !== undefined ? Number(params.curveAmp) : 0.42;
  const v2 = params.threads !== undefined ? Number(params.threads) : 4;
  const p1Norm = (clamp(v1, 0.2, 0.65) - 0.2) / Math.max(0.0001, 0.45);
  const p2Norm = (clamp(v2, 3, 6) - 3) / Math.max(0.0001, 3);
  return [
    { id: 'curveAmp', label: 'Coax S-Curve Arch', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'threads', label: 'SMA Bulkhead Threads', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'curveAmp') {
    return { ...params, curveAmp: Number(clamp(0.2 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.45, 0.2, 0.65).toFixed(2)) };
  }
  if (controlId === 'threads') {
    return { ...params, threads: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 3, 6)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.threads !== undefined ? Math.round(Number(params.threads)) : 4;
  return { ...params, threads: ((cur - 3 + 1) % 4) + 3 };
}`,
  },

  {
    id: 'drone-rf-bandpass-saw-filter',
    name: 'Drone Part: Inline RF Bandpass Filter',
    category: 'Drone Parts & Frames',
    description: 'Shielded inline SMA bandpass filter barrel rejecting out-of-band harmonics between Crossfire and VTX.',
    iconName: 'Filter',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust filter barrel width or filter passband poles; click in Preview Mode to cycle filter passband poles.',
    defaultParams: {
      label: 'RF Bandpass Filter',
      barrelW: 0.54,
      order: 5,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'RF Bandpass Filter' },
      { key: 'barrelW', label: 'Filter Barrel Width', type: 'number', min: 0.36, max: 0.72, step: 0.01, defaultValue: 0.54 },
      { key: 'order', label: 'Filter Passband Poles', type: 'number', min: 3, max: 7, step: 1, defaultValue: 5 },
    ],
    jsSourceCode: `// Drone Part: Inline RF Bandpass Filter (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const canW = clamp(Number(params.barrelW) || 0.54, 0.36, 0.72) * width;
      const poles = clamp(Math.round(Number(params.order) || 5), 3, 7);
      const cH = height * 0.54, ox = cx - canW / 2, oy = cy - cH / 2;
      const paths = [
        { d: rect(ox - 16, cy - 8, 16, 16), closed: true, fill: true },
        { d: rect(ox + canW, cy - 8, 16, 16), closed: true, fill: true },
        { d: roundRect(ox, oy, canW, cH, 6), closed: true, fill: true },
        { d: line(ox + 10, cy, ox + canW - 10, cy) },
      ];
      for (let p = 0; p < poles; p++) {
        const px = ox + 16 + (p * (canW - 32)) / Math.max(1, poles - 1);
        paths.push({ d: line(px, cy - 12, px, cy + 12), strokeWidth: 2 });
        paths.push({ d: rect(px - 4, cy + 12, 8, 6), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.barrelW !== undefined ? Number(params.barrelW) : 0.54;
  const v2 = params.order !== undefined ? Number(params.order) : 5;
  const p1Norm = (clamp(v1, 0.36, 0.72) - 0.36) / Math.max(0.0001, 0.36);
  const p2Norm = (clamp(v2, 3, 7) - 3) / Math.max(0.0001, 4);
  return [
    { id: 'barrelW', label: 'Filter Barrel Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'order', label: 'Filter Passband Poles', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'barrelW') {
    return { ...params, barrelW: Number(clamp(0.36 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.36, 0.36, 0.72).toFixed(2)) };
  }
  if (controlId === 'order') {
    return { ...params, order: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 3, 7)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.order !== undefined ? Math.round(Number(params.order)) : 5;
  return { ...params, order: ((cur - 3 + 1) % 5) + 3 };
}`,
  },

  {
    id: 'drone-rf-power-meter-attenuator',
    name: 'Drone Part: Digital RF Power Meter',
    category: 'Drone Parts & Frames',
    description: 'Inline 5.8GHz/2.4GHz digital RF power meter with 30dB internal attenuator, SMA port, and mW/dBm OLED.',
    iconName: 'Gauge',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust oled readout height or control buttons; click in Preview Mode to cycle control buttons.',
    defaultParams: {
      label: 'RF Power Meter',
      screenH: 0.48,
      buttons: 5,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'RF Power Meter' },
      { key: 'screenH', label: 'OLED Readout Height', type: 'number', min: 0.32, max: 0.64, step: 0.01, defaultValue: 0.48 },
      { key: 'buttons', label: 'Control Buttons', type: 'number', min: 3, max: 6, step: 1, defaultValue: 5 },
    ],
    jsSourceCode: `// Drone Part: Digital RF Power Meter (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const scrW = clamp(Number(params.screenH) || 0.48, 0.32, 0.64) * width;
      const bars = clamp(Math.round(Number(params.buttons) || 5), 3, 6);
      const bW = width * 0.78, bH = height * 0.62, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 8), closed: true, fill: true },
        { d: rect(ox - 12, cy - 8, 12, 16), closed: true, fill: true },
        { d: rect(ox + 14, oy + 12, scrW, bH - 24), closed: true },
        { d: circle(ox + bW - 18, cy, 8), closed: true },
      ];
      for (let b = 0; b < bars; b++) {
        const bx = ox + 20 + b * ((scrW - 16) / bars);
        const bh = 6 + (b + 1) * ((bH - 36) / (bars + 1));
        paths.push({ d: rect(bx, oy + bH - 16 - bh, (scrW - 24) / bars, bh), closed: true, fill: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.screenH !== undefined ? Number(params.screenH) : 0.48;
  const v2 = params.buttons !== undefined ? Number(params.buttons) : 5;
  const p1Norm = (clamp(v1, 0.32, 0.64) - 0.32) / Math.max(0.0001, 0.32);
  const p2Norm = (clamp(v2, 3, 6) - 3) / Math.max(0.0001, 3);
  return [
    { id: 'screenH', label: 'OLED Readout Height', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'buttons', label: 'Control Buttons', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'screenH') {
    return { ...params, screenH: Number(clamp(0.32 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.32, 0.32, 0.64).toFixed(2)) };
  }
  if (controlId === 'buttons') {
    return { ...params, buttons: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 3, 6)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.buttons !== undefined ? Math.round(Number(params.buttons)) : 5;
  return { ...params, buttons: ((cur - 3 + 1) % 4) + 3 };
}`,
  },

  {
    id: 'drone-adsb-1090mhz-receiver',
    name: 'Drone Part: Dual-Band ADS-B In Transponder',
    category: 'Drone Parts & Frames',
    description: 'Micro 1090MHz/978MHz UAT aviation ADS-B traffic receiver module for manned aircraft detect-and-avoid.',
    iconName: 'Plane',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust receiver pcb height or rf filter shield cans; click in Preview Mode to cycle rf filter shield cans.',
    defaultParams: {
      label: '1090MHz ADS-B RX',
      boardH: 0.3,
      cans: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '1090MHz ADS-B RX' },
      { key: 'boardH', label: 'Receiver PCB Height', type: 'number', min: 0.16, max: 0.44, step: 0.01, defaultValue: 0.3 },
      { key: 'cans', label: 'RF Filter Shield Cans', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: Dual-Band ADS-B In Transponder (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const antH = clamp(Number(params.boardH) || 0.3, 0.16, 0.44) * height;
      const rings = clamp(Math.round(Number(params.cans) || 3), 2, 4);
      const bW = width * 0.68, bH = height * 0.48, ox = cx - bW / 2, oy = height * 0.4;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 6), closed: true, fill: true },
        { d: line(cx - 18, oy, cx - 18, oy - antH), strokeWidth: 3 },
        { d: line(cx + 18, oy, cx + 18, oy - antH * 0.85), strokeWidth: 3 },
      ];
      for (let r = 1; r <= rings; r++) {
        paths.push({ d: circle(cx, oy + bH / 2, r * 7), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.boardH !== undefined ? Number(params.boardH) : 0.3;
  const v2 = params.cans !== undefined ? Number(params.cans) : 3;
  const p1Norm = (clamp(v1, 0.16, 0.44) - 0.16) / Math.max(0.0001, 0.28);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'boardH', label: 'Receiver PCB Height', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'cans', label: 'RF Filter Shield Cans', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'boardH') {
    return { ...params, boardH: Number(clamp(0.16 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.28, 0.16, 0.44).toFixed(2)) };
  }
  if (controlId === 'cans') {
    return { ...params, cans: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.cans !== undefined ? Math.round(Number(params.cans)) : 3;
  return { ...params, cans: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-flarm-collision-beacon',
    name: 'Drone Part: Air-to-Air Collision Avoidance Radio',
    category: 'Drone Parts & Frames',
    description: 'Cooperative air-to-air collision avoidance transceiver with circular 8-sector directional LED display.',
    iconName: 'Radar',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust threat ring radius or directional threat leds; click in Preview Mode to cycle directional threat leds.',
    defaultParams: {
      label: 'Air-to-Air FLARM',
      radarR: 0.72,
      sectors: 8,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Air-to-Air FLARM' },
      { key: 'radarR', label: 'Threat Ring Radius', type: 'number', min: 0.5, max: 0.88, step: 0.01, defaultValue: 0.72 },
      { key: 'sectors', label: 'Directional Threat LEDs', type: 'number', min: 4, max: 8, step: 1, defaultValue: 8 },
    ],
    jsSourceCode: `// Drone Part: Air-to-Air Collision Avoidance Radio (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.42;
      const sectorR = clamp(Number(params.radarR) || 0.72, 0.5, 0.88) * r;
      const sectors = clamp(Math.round(Number(params.sectors) || 8), 4, 8);
      const paths = [
        { d: circle(cx, cy, r), closed: true, fill: true },
        { d: circle(cx, cy, sectorR), closed: true },
        { d: polygon([[cx, cy - 8], [cx + 7, cy + 6], [cx, cy + 3], [cx - 7, cy + 6]]), closed: true, fill: true },
      ];
      for (let s = 0; s < sectors; s++) {
        const a = (s * Math.PI * 2) / sectors;
        paths.push({ d: line(cx + Math.cos(a) * (sectorR * 0.45), cy + Math.sin(a) * (sectorR * 0.45), cx + Math.cos(a) * r, cy + Math.sin(a) * r) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.radarR !== undefined ? Number(params.radarR) : 0.72;
  const v2 = params.sectors !== undefined ? Number(params.sectors) : 8;
  const p1Norm = (clamp(v1, 0.5, 0.88) - 0.5) / Math.max(0.0001, 0.38);
  const p2Norm = (clamp(v2, 4, 8) - 4) / Math.max(0.0001, 4);
  return [
    { id: 'radarR', label: 'Threat Ring Radius', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'sectors', label: 'Directional Threat LEDs', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'radarR') {
    return { ...params, radarR: Number(clamp(0.5 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.38, 0.5, 0.88).toFixed(2)) };
  }
  if (controlId === 'sectors') {
    return { ...params, sectors: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 4, 8)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.sectors !== undefined ? Math.round(Number(params.sectors)) : 8;
  return { ...params, sectors: ((cur - 4 + 1) % 5) + 4 };
}`,
  },

  {
    id: 'drone-optical-fiber-tether-spool',
    name: 'Drone Part: Fiber-Optic Jam-Proof Spool',
    category: 'Drone Parts & Frames',
    description: 'Ultra-light airborne optical fiber payout bobbin with media converter for EW-immune non-RF control.',
    iconName: 'Disc',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust bobbin core width or fiber spool layers; click in Preview Mode to cycle fiber spool layers.',
    defaultParams: {
      label: 'Fiber-Optic Spool',
      spoolW: 0.56,
      windings: 7,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Fiber-Optic Spool' },
      { key: 'spoolW', label: 'Bobbin Core Width', type: 'number', min: 0.36, max: 0.74, step: 0.01, defaultValue: 0.56 },
      { key: 'windings', label: 'Fiber Spool Layers', type: 'number', min: 4, max: 10, step: 1, defaultValue: 7 },
    ],
    jsSourceCode: `// Drone Part: Fiber-Optic Jam-Proof Spool (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const drumW = clamp(Number(params.spoolW) || 0.56, 0.36, 0.74) * width;
      const wraps = clamp(Math.round(Number(params.windings) || 7), 4, 10);
      const dH = height * 0.62, ox = cx - drumW / 2, oy = cy - dH / 2;
      const paths = [
        { d: roundRect(ox - 10, oy - 6, 10, dH + 12, 3), closed: true, fill: true },
        { d: roundRect(ox + drumW, oy - 6, 10, dH + 12, 3), closed: true, fill: true },
        { d: rect(ox, oy, drumW, dH), closed: true, fill: true },
        { d: line(ox + drumW, cy + dH * 0.3, width * 0.92, cy + dH * 0.45), strokeDasharray: '4 2' },
      ];
      for (let w = 1; w <= wraps; w++) {
        const wx = ox + (w * drumW) / (wraps + 1);
        paths.push({ d: line(wx, oy, wx, oy + dH) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.spoolW !== undefined ? Number(params.spoolW) : 0.56;
  const v2 = params.windings !== undefined ? Number(params.windings) : 7;
  const p1Norm = (clamp(v1, 0.36, 0.74) - 0.36) / Math.max(0.0001, 0.38);
  const p2Norm = (clamp(v2, 4, 10) - 4) / Math.max(0.0001, 6);
  return [
    { id: 'spoolW', label: 'Bobbin Core Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'windings', label: 'Fiber Spool Layers', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'spoolW') {
    return { ...params, spoolW: Number(clamp(0.36 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.38, 0.36, 0.74).toFixed(2)) };
  }
  if (controlId === 'windings') {
    return { ...params, windings: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 6, 4, 10)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.windings !== undefined ? Math.round(Number(params.windings)) : 7;
  return { ...params, windings: ((cur - 4 + 1) % 7) + 4 };
}`,
  },

  {
    id: 'drone-rf-spectrum-analyzer-node',
    name: 'Drone Part: Onboard RF Spectrum Sensor',
    category: 'Drone Parts & Frames',
    description: 'Wideband software-defined radio (SDR) spectrum sensor displaying live FFT signal peak bars.',
    iconName: 'BarChart2',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust max signal peak ratio or fft frequency bins; click in Preview Mode to cycle fft frequency bins.',
    defaultParams: {
      label: 'RF Spectrum Sensor',
      peakH: 0.68,
      bins: 8,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'RF Spectrum Sensor' },
      { key: 'peakH', label: 'Max Signal Peak Ratio', type: 'number', min: 0.35, max: 0.85, step: 0.01, defaultValue: 0.68 },
      { key: 'bins', label: 'FFT Frequency Bins', type: 'number', min: 5, max: 10, step: 1, defaultValue: 8 },
    ],
    jsSourceCode: `// Drone Part: Onboard RF Spectrum Sensor (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const peakH = clamp(Number(params.peakH) || 0.68, 0.35, 0.85) * (height * 0.54);
      const chans = clamp(Math.round(Number(params.bins) || 8), 5, 10);
      const bW = width * 0.86, bH = height * 0.72, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 6), closed: true, fill: true },
        { d: line(ox + 12, oy + bH - 14, ox + bW - 12, oy + bH - 14) },
      ];
      const pts = [];
      for (let c = 0; c <= chans * 2; c++) {
        const px = ox + 14 + (c * (bW - 28)) / (chans * 2);
        const isPeak = c % 2 === 1;
        const py = oy + bH - 16 - (isPeak ? peakH * (0.45 + ((c * 3) % 5) * 0.11) : 6);
        pts.push([px, py]);
      }
      paths.push({ d: polygon([[ox + 14, oy + bH - 16], ...pts, [ox + bW - 14, oy + bH - 16]]), closed: true });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.peakH !== undefined ? Number(params.peakH) : 0.68;
  const v2 = params.bins !== undefined ? Number(params.bins) : 8;
  const p1Norm = (clamp(v1, 0.35, 0.85) - 0.35) / Math.max(0.0001, 0.5);
  const p2Norm = (clamp(v2, 5, 10) - 5) / Math.max(0.0001, 5);
  return [
    { id: 'peakH', label: 'Max Signal Peak Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'bins', label: 'FFT Frequency Bins', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'peakH') {
    return { ...params, peakH: Number(clamp(0.35 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.5, 0.35, 0.85).toFixed(2)) };
  }
  if (controlId === 'bins') {
    return { ...params, bins: Math.round(clamp(5 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 5, 5, 10)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.bins !== undefined ? Math.round(Number(params.bins)) : 8;
  return { ...params, bins: ((cur - 5 + 1) % 6) + 5 };
}`,
  },

  {
    id: 'drone-wifi-halow-mesh-node',
    name: 'Drone Part: 802.11ah HaLow Mesh Transceiver',
    category: 'Drone Parts & Frames',
    description: 'Sub-1GHz 802.11ah Wi-Fi HaLow long-range mesh networking node with dual angled diversity dipoles.',
    iconName: 'Wifi',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust dipole v-spread or mesh link leds; click in Preview Mode to cycle mesh link leds.',
    defaultParams: {
      label: 'Wi-Fi HaLow Mesh',
      earSpan: 0.38,
      leds: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Wi-Fi HaLow Mesh' },
      { key: 'earSpan', label: 'Dipole V-Spread', type: 'number', min: 0.22, max: 0.52, step: 0.01, defaultValue: 0.38 },
      { key: 'leds', label: 'Mesh Link LEDs', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: 802.11ah HaLow Mesh Transceiver (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height * 0.58;
      const antH = clamp(Number(params.earSpan) || 0.38, 0.22, 0.52) * height;
      const links = clamp(Math.round(Number(params.leds) || 3), 2, 4);
      const bW = width * 0.68, bH = height * 0.42, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 6), closed: true, fill: true },
        { d: roundRect(ox + 14, oy - antH, 8, antH, 4), closed: true, fill: true },
        { d: roundRect(ox + bW - 22, oy - antH, 8, antH, 4), closed: true, fill: true },
      ];
      for (let l = 0; l < links; l++) {
        const ly = oy - antH * 0.3 - l * 8;
        paths.push({ d: line(ox + 26, ly, ox + bW - 26, ly), strokeDasharray: '4 3' });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.earSpan !== undefined ? Number(params.earSpan) : 0.38;
  const v2 = params.leds !== undefined ? Number(params.leds) : 3;
  const p1Norm = (clamp(v1, 0.22, 0.52) - 0.22) / Math.max(0.0001, 0.3);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'earSpan', label: 'Dipole V-Spread', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'leds', label: 'Mesh Link LEDs', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'earSpan') {
    return { ...params, earSpan: Number(clamp(0.22 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.3, 0.22, 0.52).toFixed(2)) };
  }
  if (controlId === 'leds') {
    return { ...params, leds: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.leds !== undefined ? Math.round(Number(params.leds)) : 3;
  return { ...params, leds: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-uwb-ranging-anchor-tag',
    name: 'Drone Part: Ultra-Wideband (UWB) Ranging Tag',
    category: 'Drone Parts & Frames',
    description: 'Decawave DW3000 Ultra-Wideband time-of-flight indoor localization tag with planar butterfly antenna.',
    iconName: 'Target',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust butterfly radiator span or spi header pins; click in Preview Mode to cycle spi header pins.',
    defaultParams: {
      label: 'UWB Ranging Tag',
      wingW: 0.24,
      pins: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'UWB Ranging Tag' },
      { key: 'wingW', label: 'Butterfly Radiator Span', type: 'number', min: 0.14, max: 0.36, step: 0.01, defaultValue: 0.24 },
      { key: 'pins', label: 'SPI Header Pins', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: Ultra-Wideband (UWB) Ranging Tag (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const antR = clamp(Number(params.wingW) || 0.24, 0.14, 0.36) * Math.min(width, height);
      const rings = clamp(Math.round(Number(params.pins) || 3), 2, 4);
      const bW = width * 0.54, bH = height * 0.74, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 8), closed: true, fill: true },
        { d: circle(cx, oy + antR + 10, antR), closed: true, fill: true },
        { d: rect(cx - 12, cy + 8, 24, 18), closed: true, fill: true },
      ];
      for (let r = 1; r <= rings; r++) {
        const wr = antR + r * 6;
        paths.push({ d: \`M \${cx - wr * 0.7} \${oy + 12} A \${wr} \${wr} 0 0 1 \${cx + wr * 0.7} \${oy + 12}\` });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.wingW !== undefined ? Number(params.wingW) : 0.24;
  const v2 = params.pins !== undefined ? Number(params.pins) : 3;
  const p1Norm = (clamp(v1, 0.14, 0.36) - 0.14) / Math.max(0.0001, 0.22);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'wingW', label: 'Butterfly Radiator Span', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'pins', label: 'SPI Header Pins', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'wingW') {
    return { ...params, wingW: Number(clamp(0.14 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.22, 0.14, 0.36).toFixed(2)) };
  }
  if (controlId === 'pins') {
    return { ...params, pins: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.pins !== undefined ? Math.round(Number(params.pins)) : 3;
  return { ...params, pins: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-acoustic-modem-beacon',
    name: 'Drone Part: Ultrasonic / Underwater Acoustic Beacon',
    category: 'Drone Parts & Frames',
    description: 'Piezoelectric hemispherical acoustic beacon and sonar transponder with radiated pressure wave arcs.',
    iconName: 'Volume2',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust transducer dome scale or acoustic wave arcs; click in Preview Mode to cycle acoustic wave arcs.',
    defaultParams: {
      label: 'Acoustic Transducer',
      domeR: 0.38,
      waves: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Acoustic Transducer' },
      { key: 'domeR', label: 'Transducer Dome Scale', type: 'number', min: 0.24, max: 0.52, step: 0.01, defaultValue: 0.38 },
      { key: 'waves', label: 'Acoustic Wave Arcs', type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: Ultrasonic / Underwater Acoustic Beacon (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2;
      const domeH = clamp(Number(params.domeR) || 0.38, 0.24, 0.52) * height;
      const rings = clamp(Math.round(Number(params.waves) || 3), 2, 5);
      const cW = width * 0.44, topY = height * 0.14;
      const paths = [
        { d: roundRect(cx - cW / 2, topY, cW, height * 0.42, 6), closed: true, fill: true },
        { d: \`M \${cx - cW / 2} \${topY + height * 0.4} A \${cW / 2} \${domeH * 0.6} 0 0 0 \${cx + cW / 2} \${topY + height * 0.4} Z\`, closed: true, fill: true },
      ];
      for (let r = 1; r <= rings; r++) {
        const wy = topY + height * 0.46 + r * 9;
        paths.push({ d: \`M \${cx - 12 - r * 7} \${wy - 4} Q \${cx} \${wy + 6} \${cx + 12 + r * 7} \${wy - 4}\` });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.domeR !== undefined ? Number(params.domeR) : 0.38;
  const v2 = params.waves !== undefined ? Number(params.waves) : 3;
  const p1Norm = (clamp(v1, 0.24, 0.52) - 0.24) / Math.max(0.0001, 0.28);
  const p2Norm = (clamp(v2, 2, 5) - 2) / Math.max(0.0001, 3);
  return [
    { id: 'domeR', label: 'Transducer Dome Scale', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'waves', label: 'Acoustic Wave Arcs', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'domeR') {
    return { ...params, domeR: Number(clamp(0.24 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.28, 0.24, 0.52).toFixed(2)) };
  }
  if (controlId === 'waves') {
    return { ...params, waves: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 2, 5)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.waves !== undefined ? Math.round(Number(params.waves)) : 3;
  return { ...params, waves: ((cur - 2 + 1) % 4) + 2 };
}`,
  },

  {
    id: 'drone-cam-micro-19mm-fpv',
    name: 'Drone Part: 19×19mm Micro FPV Starlight Cam',
    category: 'Drone Parts & Frames',
    description: '19×19mm micro low-light FPV camera housing with multi-coated M12 wide-angle lens and side M2 bosses.',
    iconName: 'Camera',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust m12 lens aperture or optical element rings; click in Preview Mode to cycle optical element rings.',
    defaultParams: {
      label: '19mm Micro FPV Cam',
      lensR: 0.36,
      rings: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '19mm Micro FPV Cam' },
      { key: 'lensR', label: 'M12 Lens Aperture', type: 'number', min: 0.22, max: 0.48, step: 0.01, defaultValue: 0.36 },
      { key: 'rings', label: 'Optical Element Rings', type: 'number', min: 2, max: 6, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: 19×19mm Micro FPV Starlight Cam (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, s = Math.min(width, height) * (0.74);
      const lensR = clamp(Number(params.lensR) || 0.36, 0.22, 0.48) * s;
      const param2 = clamp(Math.round(Number(params.rings) || 4), 2, 6);
      const paths = [
        { d: roundRect(cx - s / 2, cy - s / 2, s, s, 8), closed: true, fill: true },
        { d: rect(cx - s / 2 - 6, cy - 8, 6, 16), closed: true, fill: true },
        { d: rect(cx + s / 2, cy - 8, 6, 16), closed: true, fill: true },
        { d: circle(cx, cy, lensR), closed: true, fill: true },
        { d: circle(cx, cy, lensR * 0.62), closed: true },
        { d: circle(cx - lensR * 0.22, cy - lensR * 0.22, lensR * 0.16), closed: true },
      ];
      for (let i = 0; i < param2; i++) {
        const a = (i * Math.PI * 2) / param2 + Math.PI / 4;
        paths.push({ d: circle(cx + Math.cos(a) * (s * 0.38), cy + Math.sin(a) * (s * 0.38), 2.5), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.lensR !== undefined ? Number(params.lensR) : 0.36;
  const v2 = params.rings !== undefined ? Number(params.rings) : 4;
  const p1Norm = (clamp(v1, 0.22, 0.48) - 0.22) / Math.max(0.0001, 0.26);
  const p2Norm = (clamp(v2, 2, 6) - 2) / Math.max(0.0001, 4);
  return [
    { id: 'lensR', label: 'M12 Lens Aperture', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'rings', label: 'Optical Element Rings', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'lensR') {
    return { ...params, lensR: Number(clamp(0.22 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.26, 0.22, 0.48).toFixed(2)) };
  }
  if (controlId === 'rings') {
    return { ...params, rings: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 2, 6)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.rings !== undefined ? Math.round(Number(params.rings)) : 4;
  return { ...params, rings: ((cur - 2 + 1) % 5) + 2 };
}`,
  },

  {
    id: 'drone-cam-nano-14mm-whoop',
    name: 'Drone Part: 14×14mm Ultra-Light Nano Cam',
    category: 'Drone Parts & Frames',
    description: 'Sub-2g 14×14mm nano whoop camera with exposed sensor PCB, M8 micro lens barrel, and 3-pin JST plug.',
    iconName: 'Camera',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust m8 micro lens scale or corner sensor pads; click in Preview Mode to cycle corner sensor pads.',
    defaultParams: {
      label: '14mm Nano Whoop Cam',
      lensR: 0.36,
      pads: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '14mm Nano Whoop Cam' },
      { key: 'lensR', label: 'M8 Micro Lens Scale', type: 'number', min: 0.22, max: 0.48, step: 0.01, defaultValue: 0.36 },
      { key: 'pads', label: 'Corner Sensor Pads', type: 'number', min: 2, max: 6, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: 14×14mm Ultra-Light Nano Cam (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, s = Math.min(width, height) * (0.64);
      const lensR = clamp(Number(params.lensR) || 0.36, 0.22, 0.48) * s;
      const param2 = clamp(Math.round(Number(params.pads) || 4), 2, 6);
      const paths = [
        { d: roundRect(cx - s / 2, cy - s / 2, s, s, 6), closed: true, fill: true },
        { d: rect(cx - s / 2 - 6, cy - 8, 6, 16), closed: true, fill: true },
        { d: rect(cx + s / 2, cy - 8, 6, 16), closed: true, fill: true },
        { d: circle(cx, cy, lensR), closed: true, fill: true },
        { d: circle(cx, cy, lensR * 0.62), closed: true },
        { d: circle(cx - lensR * 0.22, cy - lensR * 0.22, lensR * 0.16), closed: true },
      ];
      for (let i = 0; i < param2; i++) {
        const a = (i * Math.PI * 2) / param2 + Math.PI / 4;
        paths.push({ d: circle(cx + Math.cos(a) * (s * 0.38), cy + Math.sin(a) * (s * 0.38), 2.5), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.lensR !== undefined ? Number(params.lensR) : 0.36;
  const v2 = params.pads !== undefined ? Number(params.pads) : 4;
  const p1Norm = (clamp(v1, 0.22, 0.48) - 0.22) / Math.max(0.0001, 0.26);
  const p2Norm = (clamp(v2, 2, 6) - 2) / Math.max(0.0001, 4);
  return [
    { id: 'lensR', label: 'M8 Micro Lens Scale', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'pads', label: 'Corner Sensor Pads', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'lensR') {
    return { ...params, lensR: Number(clamp(0.22 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.26, 0.22, 0.48).toFixed(2)) };
  }
  if (controlId === 'pads') {
    return { ...params, pads: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 2, 6)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.pads !== undefined ? Math.round(Number(params.pads)) : 4;
  return { ...params, pads: ((cur - 2 + 1) % 5) + 2 };
}`,
  },

  {
    id: 'drone-cam-action-naked-gopro',
    name: 'Drone Part: Naked Decased Action Camera',
    category: 'Drone Parts & Frames',
    description: 'Decased lightweight 5.3K action camera in vented CNC magnesium shell with ND lens mount and BEC plug.',
    iconName: 'Video',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust lens bezel scale or front cooling slots; click in Preview Mode to cycle front cooling slots.',
    defaultParams: {
      label: 'Naked Action Cam',
      lensScale: 0.24,
      vents: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Naked Action Cam' },
      { key: 'lensScale', label: 'Lens Bezel Scale', type: 'number', min: 0.16, max: 0.34, step: 0.01, defaultValue: 0.24 },
      { key: 'vents', label: 'Front Cooling Slots', type: 'number', min: 4, max: 8, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Part: Naked Decased Action Camera (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const lensR = clamp(Number(params.lensScale) || 0.24, 0.16, 0.34) * height;
      const fins = clamp(Math.round(Number(params.vents) || 6), 4, 8);
      const bW = width * 0.78, bH = height * 0.62, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 6), closed: true, fill: true },
        { d: circle(ox + bW - lensR - 12, cy, lensR), closed: true, fill: true },
        { d: circle(ox + bW - lensR - 12, cy, lensR * 0.58), closed: true },
        { d: rect(ox + 12, oy + 12, 24, 14), closed: true },
      ];
      for (let f = 0; f < fins; f++) {
        const fy = oy + 32 + (f * (bH - 42)) / Math.max(1, fins - 1);
        paths.push({ d: line(ox + 10, fy, ox + bW * 0.45, fy) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.lensScale !== undefined ? Number(params.lensScale) : 0.24;
  const v2 = params.vents !== undefined ? Number(params.vents) : 6;
  const p1Norm = (clamp(v1, 0.16, 0.34) - 0.16) / Math.max(0.0001, 0.18);
  const p2Norm = (clamp(v2, 4, 8) - 4) / Math.max(0.0001, 4);
  return [
    { id: 'lensScale', label: 'Lens Bezel Scale', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'vents', label: 'Front Cooling Slots', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'lensScale') {
    return { ...params, lensScale: Number(clamp(0.16 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.18, 0.16, 0.34).toFixed(2)) };
  }
  if (controlId === 'vents') {
    return { ...params, vents: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 4, 8)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.vents !== undefined ? Math.round(Number(params.vents)) : 6;
  return { ...params, vents: ((cur - 4 + 1) % 5) + 4 };
}`,
  },

  {
    id: 'drone-cam-thermal-lwir-boson',
    name: 'Drone Part: LWIR Thermal Radiometric Core',
    category: 'Drone Parts & Frames',
    description: 'Uncooled vanadium-oxide (VOx) long-wave infrared thermal camera core with stepped germanium lens barrel.',
    iconName: 'Flame',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust germanium barrel len or barrel focus rings; click in Preview Mode to cycle barrel focus rings.',
    defaultParams: {
      label: 'LWIR Thermal Core',
      barrelLen: 0.44,
      steps: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'LWIR Thermal Core' },
      { key: 'barrelLen', label: 'Germanium Barrel Len', type: 'number', min: 0.28, max: 0.62, step: 0.01, defaultValue: 0.44 },
      { key: 'steps', label: 'Barrel Focus Rings', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: LWIR Thermal Radiometric Core (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const gap = clamp(Number(params.barrelLen) || 0.44, 0.28, 0.62) * width;
      const rings = clamp(Math.round(Number(params.steps) || 3), 2, 4);
      const bW = width * 0.82, bH = height * 0.58, lx = cx - gap / 2, rx = cx + gap / 2;
      const paths = [
        { d: roundRect(cx - bW / 2, cy - bH / 2, bW, bH, 10), closed: true, fill: true },
        { d: circle(rx, cy, bH * 0.32), closed: true, fill: true },
        { d: circle(rx, cy, bH * 0.18), closed: true },
      ];
      for (let r = 1; r <= rings; r++) {
        paths.push({ d: circle(lx, cy, (bH * 0.36 * r) / rings), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.barrelLen !== undefined ? Number(params.barrelLen) : 0.44;
  const v2 = params.steps !== undefined ? Number(params.steps) : 3;
  const p1Norm = (clamp(v1, 0.28, 0.62) - 0.28) / Math.max(0.0001, 0.34);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'barrelLen', label: 'Germanium Barrel Len', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'steps', label: 'Barrel Focus Rings', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'barrelLen') {
    return { ...params, barrelLen: Number(clamp(0.28 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.34, 0.28, 0.62).toFixed(2)) };
  }
  if (controlId === 'steps') {
    return { ...params, steps: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.steps !== undefined ? Math.round(Number(params.steps)) : 3;
  return { ...params, steps: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-cam-dual-eo-ir-gimbal',
    name: 'Drone Part: Dual EO/IR Zoom + Thermal Pod',
    category: 'Drone Parts & Frames',
    description: '3-axis gyro-stabilized ISR turret housing a 30× optical zoom lens, LWIR thermal core, and laser rangefinder.',
    iconName: 'Eye',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust turret sphere radius or optical windows; click in Preview Mode to cycle optical windows.',
    defaultParams: {
      label: 'EO/IR Gimbal Ball',
      ballR: 0.88,
      optics: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'EO/IR Gimbal Ball' },
      { key: 'ballR', label: 'Turret Sphere Radius', type: 'number', min: 0.65, max: 1, step: 0.01, defaultValue: 0.88 },
      { key: 'optics', label: 'Optical Windows', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: Dual EO/IR Zoom + Thermal Pod (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height * 0.54, r = Math.min(width, height) * 0.36;
      const ballR = clamp(Number(params.ballR) || 0.88, 0.65, 1.0) * r;
      const windows = clamp(Math.round(Number(params.optics) || 3), 2, 4);
      const paths = [
        { d: rect(cx - 22, height * 0.1, 44, 12), closed: true, fill: true },
        { d: \`M \${cx - ballR - 10} \${cy} L \${cx - ballR - 10} \${height * 0.22} L \${cx + ballR + 10} \${height * 0.22} L \${cx + ballR + 10} \${cy}\`, strokeWidth: 5 },
        { d: circle(cx, cy, ballR), closed: true, fill: true },
      ];
      for (let w = 0; w < windows; w++) {
        const wx = cx - ballR * 0.42 + (w * ballR * 0.84) / Math.max(1, windows - 1);
        paths.push({ d: circle(wx, cy, ballR * 0.18), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.ballR !== undefined ? Number(params.ballR) : 0.88;
  const v2 = params.optics !== undefined ? Number(params.optics) : 3;
  const p1Norm = (clamp(v1, 0.65, 1) - 0.65) / Math.max(0.0001, 0.35);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'ballR', label: 'Turret Sphere Radius', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'optics', label: 'Optical Windows', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'ballR') {
    return { ...params, ballR: Number(clamp(0.65 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.35, 0.65, 1).toFixed(2)) };
  }
  if (controlId === 'optics') {
    return { ...params, optics: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.optics !== undefined ? Math.round(Number(params.optics)) : 3;
  return { ...params, optics: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-cam-multispectral-5band',
    name: 'Drone Part: 5-Band Multispectral Ag Camera',
    category: 'Drone Parts & Frames',
    description: 'Precision agriculture 5-lens multispectral array (Blue, Green, Red, RedEdge, NIR) for NDVI crop vigor mapping.',
    iconName: 'Grid',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust band lens radius or spectral lenses; click in Preview Mode to cycle spectral lenses.',
    defaultParams: {
      label: '5-Band Multispectral',
      lensR: 0.12,
      bands: 5,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '5-Band Multispectral' },
      { key: 'lensR', label: 'Band Lens Radius', type: 'number', min: 0.08, max: 0.16, step: 0.01, defaultValue: 0.12 },
      { key: 'bands', label: 'Spectral Lenses', type: 'number', min: 4, max: 6, step: 1, defaultValue: 5 },
    ],
    jsSourceCode: `// Drone Part: 5-Band Multispectral Ag Camera (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const lensR = clamp(Number(params.lensR) || 0.12, 0.08, 0.16) * Math.min(width, height);
      const bands = clamp(Math.round(Number(params.bands) || 5), 4, 6);
      const bW = width * 0.8, bH = height * 0.66, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 8), closed: true, fill: true },
        { d: circle(cx, cy, lensR * 1.15), closed: true, fill: true },
      ];
      for (let b = 0; b < bands - 1; b++) {
        const a = (b * Math.PI * 2) / (bands - 1) + Math.PI / 4;
        const lx = cx + Math.cos(a) * (bW * 0.28), ly = cy + Math.sin(a) * (bH * 0.26);
        paths.push({ d: circle(lx, ly, lensR), closed: true, fill: true });
        paths.push({ d: circle(lx, ly, lensR * 0.55), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.lensR !== undefined ? Number(params.lensR) : 0.12;
  const v2 = params.bands !== undefined ? Number(params.bands) : 5;
  const p1Norm = (clamp(v1, 0.08, 0.16) - 0.08) / Math.max(0.0001, 0.08);
  const p2Norm = (clamp(v2, 4, 6) - 4) / Math.max(0.0001, 2);
  return [
    { id: 'lensR', label: 'Band Lens Radius', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'bands', label: 'Spectral Lenses', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'lensR') {
    return { ...params, lensR: Number(clamp(0.08 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.08, 0.08, 0.16).toFixed(2)) };
  }
  if (controlId === 'bands') {
    return { ...params, bands: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 4, 6)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.bands !== undefined ? Math.round(Number(params.bands)) : 5;
  return { ...params, bands: ((cur - 4 + 1) % 3) + 4 };
}`,
  },

  {
    id: 'drone-cam-photogrammetry-fullframe',
    name: 'Drone Part: Full-Frame Oblique Mapping Rig',
    category: 'Drone Parts & Frames',
    description: '5-camera 3D city photogrammetry payload with 1 central nadir lens and 4 angled perimeter oblique cameras.',
    iconName: 'Camera',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust oblique lens spread or total mapping lenses; click in Preview Mode to cycle total mapping lenses.',
    defaultParams: {
      label: '5-Cam Oblique Rig',
      spread: 0.72,
      cams: 0.72,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '5-Cam Oblique Rig' },
      { key: 'spread', label: 'Oblique Lens Spread', type: 'number', min: 0.48, max: 0.9, step: 0.01, defaultValue: 0.72 },
      { key: 'cams', label: 'Total Mapping Lenses', type: 'number', min: 0.55, max: 0.88, step: 0.01, defaultValue: 0.72 },
    ],
    jsSourceCode: `// Drone Part: Full-Frame Oblique Mapping Rig (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.38;
      const off = clamp(Number(params.spread) || 0.72, 0.48, 0.9) * r;
      const tilt = clamp(Number(params.cams) || 0.72, 0.55, 0.88);
      const paths = [
        { d: roundRect(cx - r * 1.15, cy - r * 1.15, r * 2.3, r * 2.3, 12), closed: true, fill: true },
        { d: circle(cx, cy, r * 0.28), closed: true, fill: true },
      ];
      [[0,-off],[off,0],[0,off],[-off,0]].forEach(([dx, dy]) => {
        const rx = dx === 0 ? r * 0.26 : r * 0.26 * tilt;
        const ry = dy === 0 ? r * 0.26 : r * 0.26 * tilt;
        paths.push({ d: ellipse(cx + dx, cy + dy, rx, ry), closed: true, fill: true });
      });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.spread !== undefined ? Number(params.spread) : 0.72;
  const v2 = params.cams !== undefined ? Number(params.cams) : 0.72;
  const p1Norm = (clamp(v1, 0.48, 0.9) - 0.48) / Math.max(0.0001, 0.42);
  const p2Norm = (clamp(v2, 0.55, 0.88) - 0.55) / Math.max(0.0001, 0.33);
  return [
    { id: 'spread', label: 'Oblique Lens Spread', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'cams', label: 'Total Mapping Lenses', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'spread') {
    return { ...params, spread: Number(clamp(0.48 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.42, 0.48, 0.9).toFixed(2)) };
  }
  if (controlId === 'cams') {
    return { ...params, cams: Number(clamp(0.55 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.33, 0.55, 0.88).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.cams !== undefined ? Number(params.cams) : 0.72;
  const next = cur + 0.11 > 0.88 + 0.001 ? 0.55 : Number((cur + 0.11).toFixed(2));
  return { ...params, cams: next };
}`,
  },

  {
    id: 'drone-cam-stereo-depth-oakd',
    name: 'Drone Part: Stereo Depth + RGB AI Camera',
    category: 'Drone Parts & Frames',
    description: 'Visual-Inertial Odometry (VIO) stereo depth bar with left/right global-shutter cameras and center RGB lens.',
    iconName: 'Eye',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust stereo baseline span or aluminum bar height (%); click in Preview Mode to cycle aluminum bar height (%).',
    defaultParams: {
      label: 'Stereo VIO Depth Cam',
      baseline: 0.68,
      barH: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Stereo VIO Depth Cam' },
      { key: 'baseline', label: 'Stereo Baseline Span', type: 'number', min: 0.42, max: 0.84, step: 0.01, defaultValue: 0.68 },
      { key: 'barH', label: 'Aluminum Bar Height (%)', type: 'number', min: 4, max: 8, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Part: Stereo Depth + RGB AI Camera (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const base = clamp(Number(params.baseline) || 0.68, 0.42, 0.84) * width;
      const fins = clamp(Math.round(Number(params.barH) || 6), 4, 8);
      const bW = width * 0.88, bH = height * 0.46, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 8), closed: true, fill: true },
        { d: circle(cx - base / 2, cy, 11), closed: true, fill: true },
        { d: circle(cx + base / 2, cy, 11), closed: true, fill: true },
        { d: circle(cx, cy, 13), closed: true, fill: true },
        { d: circle(cx, cy, 7), closed: true },
      ];
      for (let f = 0; f < fins; f++) {
        const fx = cx - base * 0.28 + (f * base * 0.56) / Math.max(1, fins - 1);
        paths.push({ d: line(fx, oy + 4, fx, oy + 12) });
        paths.push({ d: line(fx, oy + bH - 12, fx, oy + bH - 4) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.baseline !== undefined ? Number(params.baseline) : 0.68;
  const v2 = params.barH !== undefined ? Number(params.barH) : 6;
  const p1Norm = (clamp(v1, 0.42, 0.84) - 0.42) / Math.max(0.0001, 0.42);
  const p2Norm = (clamp(v2, 4, 8) - 4) / Math.max(0.0001, 4);
  return [
    { id: 'baseline', label: 'Stereo Baseline Span', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'barH', label: 'Aluminum Bar Height (%)', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'baseline') {
    return { ...params, baseline: Number(clamp(0.42 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.42, 0.42, 0.84).toFixed(2)) };
  }
  if (controlId === 'barH') {
    return { ...params, barH: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 4, 8)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.barH !== undefined ? Math.round(Number(params.barH)) : 6;
  return { ...params, barH: ((cur - 4 + 1) % 5) + 4 };
}`,
  },

  {
    id: 'drone-cam-nd-filter-magnetic',
    name: 'Drone Part: Snap-On ND8/ND16/ND32 Filter',
    category: 'Drone Parts & Frames',
    description: 'Anodized snap-on Neutral Density (ND16) optical glass filter bezel for 180-degree shutter motion blur.',
    iconName: 'Square',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust filter frame thickness or optical glint lines; click in Preview Mode to cycle optical glint lines.',
    defaultParams: {
      label: 'ND16 Cinema Filter',
      bezelW: 0.72,
      streaks: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'ND16 Cinema Filter' },
      { key: 'bezelW', label: 'Filter Frame Thickness', type: 'number', min: 0.5, max: 0.86, step: 0.01, defaultValue: 0.72 },
      { key: 'streaks', label: 'Optical Glint Lines', type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: Snap-On ND8/ND16/ND32 Filter (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const winW = clamp(Number(params.bezelW) || 0.72, 0.5, 0.86) * width;
      const streaks = clamp(Math.round(Number(params.streaks) || 3), 2, 5);
      const fW = width * 0.8, fH = height * 0.68, wH = fH * 0.74;
      const paths = [
        { d: roundRect(cx - fW / 2, cy - fH / 2, fW, fH, 10), closed: true, fill: true },
        { d: roundRect(cx - winW / 2, cy - wH / 2, winW, wH, 6), closed: true },
      ];
      for (let s = 0; s < streaks; s++) {
        const off = -16 + s * 14;
        paths.push({ d: line(cx - 18 + off, cy + wH * 0.34, cx + 18 + off, cy - wH * 0.34) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.bezelW !== undefined ? Number(params.bezelW) : 0.72;
  const v2 = params.streaks !== undefined ? Number(params.streaks) : 3;
  const p1Norm = (clamp(v1, 0.5, 0.86) - 0.5) / Math.max(0.0001, 0.36);
  const p2Norm = (clamp(v2, 2, 5) - 2) / Math.max(0.0001, 3);
  return [
    { id: 'bezelW', label: 'Filter Frame Thickness', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'streaks', label: 'Optical Glint Lines', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'bezelW') {
    return { ...params, bezelW: Number(clamp(0.5 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.36, 0.5, 0.86).toFixed(2)) };
  }
  if (controlId === 'streaks') {
    return { ...params, streaks: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 2, 5)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.streaks !== undefined ? Math.round(Number(params.streaks)) : 3;
  return { ...params, streaks: ((cur - 2 + 1) % 4) + 2 };
}`,
  },

  {
    id: 'drone-sensor-360-spinning-lidar',
    name: 'Drone Part: 360° Multi-Beam 3D LiDAR Puck',
    category: 'Drone Parts & Frames',
    description: '16/32-channel spinning 360-degree SLAM LiDAR puck with optical ring window and radiated laser scan beams.',
    iconName: 'Radar',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust optical window height or radiated laser beams; click in Preview Mode to cycle radiated laser beams.',
    defaultParams: {
      label: '360° 3D LiDAR Puck',
      winRatio: 0.56,
      beams: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '360° 3D LiDAR Puck' },
      { key: 'winRatio', label: 'Optical Window Height', type: 'number', min: 0.38, max: 0.74, step: 0.01, defaultValue: 0.56 },
      { key: 'beams', label: 'Radiated Laser Beams', type: 'number', min: 4, max: 8, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Part: 360° Multi-Beam 3D LiDAR Puck (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const puckW = clamp(Number(params.winRatio) || 0.56, 0.38, 0.74) * width;
      const rays = clamp(Math.round(Number(params.beams) || 6), 4, 8);
      const pH = height * 0.56, oy = cy - pH / 2;
      const paths = [
        { d: roundRect(cx - puckW / 2, oy, puckW, pH, 6), closed: true, fill: true },
        { d: rect(cx - puckW / 2, oy + pH * 0.25, puckW, pH * 0.45), closed: true },
      ];
      for (let r = 0; r < rays; r++) {
        const dy = -18 + (r * 36) / Math.max(1, rays - 1);
        paths.push({ d: line(cx - puckW / 2, cy, width * 0.06, cy + dy), strokeDasharray: '3 2' });
        paths.push({ d: line(cx + puckW / 2, cy, width * 0.94, cy + dy), strokeDasharray: '3 2' });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.winRatio !== undefined ? Number(params.winRatio) : 0.56;
  const v2 = params.beams !== undefined ? Number(params.beams) : 6;
  const p1Norm = (clamp(v1, 0.38, 0.74) - 0.38) / Math.max(0.0001, 0.36);
  const p2Norm = (clamp(v2, 4, 8) - 4) / Math.max(0.0001, 4);
  return [
    { id: 'winRatio', label: 'Optical Window Height', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'beams', label: 'Radiated Laser Beams', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'winRatio') {
    return { ...params, winRatio: Number(clamp(0.38 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.36, 0.38, 0.74).toFixed(2)) };
  }
  if (controlId === 'beams') {
    return { ...params, beams: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 4, 8)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.beams !== undefined ? Math.round(Number(params.beams)) : 6;
  return { ...params, beams: ((cur - 4 + 1) % 5) + 4 };
}`,
  },

  {
    id: 'drone-sensor-solid-state-livox',
    name: 'Drone Part: Solid-State Non-Repetitive LiDAR',
    category: 'Drone Parts & Frames',
    description: 'Risley-prism solid-state LiDAR sensor generating a non-repetitive rosette flower laser scan pattern.',
    iconName: 'Sparkles',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust optical aperture size or rosette scan petals; click in Preview Mode to cycle rosette scan petals.',
    defaultParams: {
      label: 'Solid-State LiDAR',
      faceR: 0.78,
      petals: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Solid-State LiDAR' },
      { key: 'faceR', label: 'Optical Aperture Size', type: 'number', min: 0.5, max: 0.92, step: 0.01, defaultValue: 0.78 },
      { key: 'petals', label: 'Rosette Scan Petals', type: 'number', min: 4, max: 8, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Part: Solid-State Non-Repetitive LiDAR (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.42;
      const petalR = clamp(Number(params.faceR) || 0.78, 0.5, 0.92) * r;
      const lobes = clamp(Math.round(Number(params.petals) || 6), 4, 8);
      const paths = [
        { d: roundRect(cx - r, cy - r, r * 2, r * 2, 10), closed: true, fill: true },
        { d: circle(cx, cy, r * 0.85), closed: true },
      ];
      for (let l = 0; l < lobes; l++) {
        const a = (l * Math.PI) / (lobes / 2);
        const rx = Math.cos(a) * petalR * 0.45, ry = Math.sin(a) * petalR * 0.45;
        paths.push({ d: ellipse(cx + rx * 0.5, cy + ry * 0.5, petalR * 0.48, petalR * 0.18), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.faceR !== undefined ? Number(params.faceR) : 0.78;
  const v2 = params.petals !== undefined ? Number(params.petals) : 6;
  const p1Norm = (clamp(v1, 0.5, 0.92) - 0.5) / Math.max(0.0001, 0.42);
  const p2Norm = (clamp(v2, 4, 8) - 4) / Math.max(0.0001, 4);
  return [
    { id: 'faceR', label: 'Optical Aperture Size', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'petals', label: 'Rosette Scan Petals', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'faceR') {
    return { ...params, faceR: Number(clamp(0.5 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.42, 0.5, 0.92).toFixed(2)) };
  }
  if (controlId === 'petals') {
    return { ...params, petals: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 4, 8)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.petals !== undefined ? Math.round(Number(params.petals)) : 6;
  return { ...params, petals: ((cur - 4 + 1) % 5) + 4 };
}`,
  },

  {
    id: 'drone-sensor-mmwave-radar',
    name: 'Drone Part: 77GHz mmWave Obstacle Radar',
    category: 'Drone Parts & Frames',
    description: 'All-weather dust/fog-penetrating 77GHz MIMO microstrip patch array radar sensor for wire/branch detection.',
    iconName: 'Radio',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust mimo patch array span or antenna patch columns; click in Preview Mode to cycle antenna patch columns.',
    defaultParams: {
      label: '77GHz mmWave Radar',
      arrayW: 0.64,
      cols: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '77GHz mmWave Radar' },
      { key: 'arrayW', label: 'MIMO Patch Array Span', type: 'number', min: 0.42, max: 0.82, step: 0.01, defaultValue: 0.64 },
      { key: 'cols', label: 'Antenna Patch Columns', type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: 77GHz mmWave Obstacle Radar (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const pSpace = clamp(Number(params.arrayW) || 0.64, 0.42, 0.82) * width;
      const cols = clamp(Math.round(Number(params.cols) || 4), 3, 6);
      const bW = width * 0.82, bH = height * 0.64, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 6), closed: true, fill: true },
        { d: rect(cx - 12, oy + bH - 22, 24, 14), closed: true, fill: true },
      ];
      for (let c = 0; c < cols; c++) {
        const px = cx - pSpace / 2 + (c * pSpace) / Math.max(1, cols - 1);
        for (let r = 0; r < 3; r++) {
          const py = oy + 12 + r * 14;
          paths.push({ d: rect(px - 4, py - 3, 8, 6), closed: true, fill: true });
        }
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.arrayW !== undefined ? Number(params.arrayW) : 0.64;
  const v2 = params.cols !== undefined ? Number(params.cols) : 4;
  const p1Norm = (clamp(v1, 0.42, 0.82) - 0.42) / Math.max(0.0001, 0.4);
  const p2Norm = (clamp(v2, 3, 6) - 3) / Math.max(0.0001, 3);
  return [
    { id: 'arrayW', label: 'MIMO Patch Array Span', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'cols', label: 'Antenna Patch Columns', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'arrayW') {
    return { ...params, arrayW: Number(clamp(0.42 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.4, 0.42, 0.82).toFixed(2)) };
  }
  if (controlId === 'cols') {
    return { ...params, cols: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 3, 6)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.cols !== undefined ? Math.round(Number(params.cols)) : 4;
  return { ...params, cols: ((cur - 3 + 1) % 4) + 3 };
}`,
  },

  {
    id: 'drone-sensor-ultrasonic-sonar',
    name: 'Drone Part: Dual-Transducer Ultrasonic Sonar',
    category: 'Drone Parts & Frames',
    description: 'Dual-can 40kHz ultrasonic acoustic rangefinder PCB with transmit (TX) and receive (RX) mesh transducers.',
    iconName: 'Volume2',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust transducer spacing or transducer radius; click in Preview Mode to cycle transducer radius.',
    defaultParams: {
      label: 'Ultrasonic Sonar',
      canGap: 0.24,
      canR: 0.44,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Ultrasonic Sonar' },
      { key: 'canGap', label: 'Transducer Spacing', type: 'number', min: 0.16, max: 0.32, step: 0.01, defaultValue: 0.24 },
      { key: 'canR', label: 'Transducer Radius', type: 'number', min: 0.28, max: 0.62, step: 0.01, defaultValue: 0.44 },
    ],
    jsSourceCode: `// Drone Part: Dual-Transducer Ultrasonic Sonar (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const eyeR = clamp(Number(params.canGap) || 0.24, 0.16, 0.32) * Math.min(width, height);
      const sep = clamp(Number(params.canR) || 0.44, 0.28, 0.62) * width;
      const bW = width * 0.82, bH = height * 0.56;
      const paths = [
        { d: roundRect(cx - bW / 2, cy - bH / 2, bW, bH, 8), closed: true, fill: true },
      ];
      [-sep / 2, sep / 2].forEach((dx) => {
        paths.push({ d: circle(cx + dx, cy, eyeR), closed: true, fill: true });
        paths.push({ d: circle(cx + dx, cy, eyeR * 0.65), closed: true, strokeDasharray: '2 2' });
      });
      paths.push({ d: rect(cx - 8, cy - 10, 16, 20), closed: true, fill: true });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.canGap !== undefined ? Number(params.canGap) : 0.24;
  const v2 = params.canR !== undefined ? Number(params.canR) : 0.44;
  const p1Norm = (clamp(v1, 0.16, 0.32) - 0.16) / Math.max(0.0001, 0.16);
  const p2Norm = (clamp(v2, 0.28, 0.62) - 0.28) / Math.max(0.0001, 0.34);
  return [
    { id: 'canGap', label: 'Transducer Spacing', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'canR', label: 'Transducer Radius', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'canGap') {
    return { ...params, canGap: Number(clamp(0.16 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.16, 0.16, 0.32).toFixed(2)) };
  }
  if (controlId === 'canR') {
    return { ...params, canR: Number(clamp(0.28 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 0.34, 0.28, 0.62).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.canR !== undefined ? Number(params.canR) : 0.44;
  const next = cur + 0.11 > 0.62 + 0.001 ? 0.28 : Number((cur + 0.11).toFixed(2));
  return { ...params, canR: next };
}`,
  },

  {
    id: 'drone-sensor-pitot-airspeed',
    name: 'Drone Part: Differential Pitot-Static Tube',
    category: 'Drone Parts & Frames',
    description: 'Concentric metal Pitot-static dynamic/static pressure probe tube connected to differential MS4525DO sensor.',
    iconName: 'Wind',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust metal probe length or static pressure ports; click in Preview Mode to cycle static pressure ports.',
    defaultParams: {
      label: 'Pitot Airspeed Probe',
      probeLen: 0.72,
      ports: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Pitot Airspeed Probe' },
      { key: 'probeLen', label: 'Metal Probe Length', type: 'number', min: 0.48, max: 0.88, step: 0.01, defaultValue: 0.72 },
      { key: 'ports', label: 'Static Pressure Ports', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: Differential Pitot-Static Tube (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cy = height * 0.44;
      const probeL = clamp(Number(params.probeLen) || 0.72, 0.48, 0.88) * width;
      const ports = clamp(Math.round(Number(params.ports) || 3), 2, 4);
      const x0 = width * 0.12, x1 = x0 + probeL;
      const paths = [
        { d: roundRect(x0, cy - 6, probeL - 14, 12, 3), closed: true, fill: true },
        { d: polygon([[x1 - 14, cy - 6], [x1 + 6, cy], [x1 - 14, cy + 6]]), closed: true, fill: true },
        { d: roundRect(x0 + 8, cy + 6, 14, 28, 3), closed: true, fill: true },
        { d: line(x0, cy - 3, x0 - 12, cy - 3), strokeWidth: 2.5 },
        { d: line(x0, cy + 3, x0 - 12, cy + 3), strokeWidth: 2.5 },
      ];
      for (let p = 0; p < ports; p++) {
        paths.push({ d: circle(x0 + probeL * 0.45 + p * 12, cy, 2), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.probeLen !== undefined ? Number(params.probeLen) : 0.72;
  const v2 = params.ports !== undefined ? Number(params.ports) : 3;
  const p1Norm = (clamp(v1, 0.48, 0.88) - 0.48) / Math.max(0.0001, 0.4);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'probeLen', label: 'Metal Probe Length', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'ports', label: 'Static Pressure Ports', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'probeLen') {
    return { ...params, probeLen: Number(clamp(0.48 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.4, 0.48, 0.88).toFixed(2)) };
  }
  if (controlId === 'ports') {
    return { ...params, ports: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.ports !== undefined ? Math.round(Number(params.ports)) : 3;
  return { ...params, ports: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-sensor-barometer-ms5611',
    name: 'Drone Part: Precision Barometric Altimeter',
    category: 'Drone Parts & Frames',
    description: 'High-resolution MEMS barometric pressure sensor IC with 2-hole stainless cap and open-cell wind baffle.',
    iconName: 'Gauge',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust wind baffle cover or i2c/spi solder pads; click in Preview Mode to cycle i2c/spi solder pads.',
    defaultParams: {
      label: 'MS5611 Barometer',
      foamScale: 0.44,
      pads: 2,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'MS5611 Barometer' },
      { key: 'foamScale', label: 'Wind Baffle Cover', type: 'number', min: 0.28, max: 0.62, step: 0.01, defaultValue: 0.44 },
      { key: 'pads', label: 'I2C/SPI Solder Pads', type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
    ],
    jsSourceCode: `// Drone Part: Precision Barometric Altimeter (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const canW = clamp(Number(params.foamScale) || 0.44, 0.28, 0.62) * width;
      const holes = clamp(Math.round(Number(params.pads) || 2), 1, 3);
      const bW = width * 0.68, bH = height * 0.64, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 6), closed: true, fill: true },
        { d: roundRect(cx - canW / 2, cy - canW * 0.38, canW, canW * 0.76, 4), closed: true, fill: true },
      ];
      for (let h = 0; h < holes; h++) {
        const hx = cx - (holes - 1) * 6 + h * 12;
        paths.push({ d: circle(hx, cy, 2.5), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.foamScale !== undefined ? Number(params.foamScale) : 0.44;
  const v2 = params.pads !== undefined ? Number(params.pads) : 2;
  const p1Norm = (clamp(v1, 0.28, 0.62) - 0.28) / Math.max(0.0001, 0.34);
  const p2Norm = (clamp(v2, 1, 3) - 1) / Math.max(0.0001, 2);
  return [
    { id: 'foamScale', label: 'Wind Baffle Cover', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'pads', label: 'I2C/SPI Solder Pads', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'foamScale') {
    return { ...params, foamScale: Number(clamp(0.28 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.34, 0.28, 0.62).toFixed(2)) };
  }
  if (controlId === 'pads') {
    return { ...params, pads: Math.round(clamp(1 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 1, 3)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.pads !== undefined ? Math.round(Number(params.pads)) : 2;
  return { ...params, pads: ((cur - 1 + 1) % 3) + 1 };
}`,
  },

  {
    id: 'drone-sensor-magnetometer-rm3100',
    name: 'Drone Part: PNI RM3100 Geomagnetic Compass',
    category: 'Drone Parts & Frames',
    description: 'Military-grade PNI RM3100 3-axis magneto-inductive compass with orthogonal X, Y, and Z wire-wound coils.',
    iconName: 'Compass',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust solenoid coil size or visible coil turns; click in Preview Mode to cycle visible coil turns.',
    defaultParams: {
      label: 'RM3100 Magnetometer',
      coilLen: 0.28,
      windings: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'RM3100 Magnetometer' },
      { key: 'coilLen', label: 'Solenoid Coil Size', type: 'number', min: 0.18, max: 0.4, step: 0.01, defaultValue: 0.28 },
      { key: 'windings', label: 'Visible Coil Turns', type: 'number', min: 2, max: 3, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: PNI RM3100 Geomagnetic Compass (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const cLen = clamp(Number(params.coilLen) || 0.28, 0.18, 0.4) * Math.min(width, height);
      const coils = clamp(Math.round(Number(params.windings) || 3), 2, 3);
      const bW = width * 0.74, bH = height * 0.68, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 8), closed: true, fill: true },
        { d: rect(cx - 10, cy - 10, 20, 20), closed: true, fill: true },
        { d: rect(ox + 12, cy - cLen / 2, 12, cLen), closed: true, fill: true },
        { d: rect(cx - cLen / 2, oy + 10, cLen, 12), closed: true, fill: true },
      ];
      if (coils === 3) {
        paths.push({ d: circle(ox + bW - 18, cy, 9), closed: true, fill: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.coilLen !== undefined ? Number(params.coilLen) : 0.28;
  const v2 = params.windings !== undefined ? Number(params.windings) : 3;
  const p1Norm = (clamp(v1, 0.18, 0.4) - 0.18) / Math.max(0.0001, 0.22);
  const p2Norm = (clamp(v2, 2, 3) - 2) / Math.max(0.0001, 1);
  return [
    { id: 'coilLen', label: 'Solenoid Coil Size', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'windings', label: 'Visible Coil Turns', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'coilLen') {
    return { ...params, coilLen: Number(clamp(0.18 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.22, 0.18, 0.4).toFixed(2)) };
  }
  if (controlId === 'windings') {
    return { ...params, windings: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 1, 2, 3)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.windings !== undefined ? Math.round(Number(params.windings)) : 3;
  return { ...params, windings: ((cur - 2 + 1) % 2) + 2 };
}`,
  },

  {
    id: 'drone-sensor-rtk-f9p-dual-antenna',
    name: 'Drone Part: Dual-Antenna RTK Moving-Base GNSS',
    category: 'Drone Parts & Frames',
    description: 'Centimeter-accurate u-blox ZED-F9P RTK GNSS board with dual SMA ports for non-magnetic GPS heading.',
    iconName: 'Compass',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust dual sma spacing or rtk fix status leds; click in Preview Mode to cycle rtk fix status leds.',
    defaultParams: {
      label: 'Dual-Ant RTK F9P',
      jackSpan: 0.46,
      leds: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Dual-Ant RTK F9P' },
      { key: 'jackSpan', label: 'Dual SMA Spacing', type: 'number', min: 0.3, max: 0.62, step: 0.01, defaultValue: 0.46 },
      { key: 'leds', label: 'RTK Fix Status LEDs', type: 'number', min: 2, max: 6, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: Dual-Antenna RTK Moving-Base GNSS (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.42;
      const pS = clamp(Number(params.jackSpan) || 0.46, 0.3, 0.62) * r * 2;
      const leds = clamp(Math.round(Number(params.leds) || 4), 2, 6);
      const paths = [
        { d: circle(cx, cy, r), closed: true, fill: true },
        { d: roundRect(cx - pS / 2, cy - pS / 2, pS, pS, 4), closed: true, fill: true },
        { d: circle(cx, cy, 4), closed: true },
      ];
      for (let l = 0; l < leds; l++) {
        const a = (l * Math.PI * 2) / leds - Math.PI / 2;
        paths.push({ d: circle(cx + Math.cos(a) * (r * 0.82), cy + Math.sin(a) * (r * 0.82), 3), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.jackSpan !== undefined ? Number(params.jackSpan) : 0.46;
  const v2 = params.leds !== undefined ? Number(params.leds) : 4;
  const p1Norm = (clamp(v1, 0.3, 0.62) - 0.3) / Math.max(0.0001, 0.32);
  const p2Norm = (clamp(v2, 2, 6) - 2) / Math.max(0.0001, 4);
  return [
    { id: 'jackSpan', label: 'Dual SMA Spacing', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'leds', label: 'RTK Fix Status LEDs', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'jackSpan') {
    return { ...params, jackSpan: Number(clamp(0.3 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.32, 0.3, 0.62).toFixed(2)) };
  }
  if (controlId === 'leds') {
    return { ...params, leds: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 2, 6)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.leds !== undefined ? Math.round(Number(params.leds)) : 4;
  return { ...params, leds: ((cur - 2 + 1) % 5) + 2 };
}`,
  },

  {
    id: 'drone-payload-servo-drop-hook',
    name: 'Drone Part: Servo Payload Release Hook',
    category: 'Drone Parts & Frames',
    description: 'PWM servo-actuated mechanical cargo release mechanism with sliding lock pin and pivoted drop hook.',
    iconName: 'Anchor',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust hook open angle ratio or mounting tabs; click in Preview Mode to cycle mounting tabs.',
    defaultParams: {
      label: 'Servo Drop Release',
      hookOpen: 0.24,
      ears: 1,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Servo Drop Release' },
      { key: 'hookOpen', label: 'Hook Open Angle Ratio', type: 'number', min: 0.08, max: 0.48, step: 0.01, defaultValue: 0.24 },
      { key: 'ears', label: 'Mounting Tabs', type: 'number', min: 1, max: 2, step: 1, defaultValue: 1 },
    ],
    jsSourceCode: `// Drone Part: Servo Payload Release Hook (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height * 0.38;
      const open = clamp(Number(params.hookOpen) || 0.24, 0.08, 0.48) * width;
      const hooks = clamp(Math.round(Number(params.ears) || 1), 1, 2);
      const bW = width * 0.56, bH = height * 0.36;
      const paths = [
        { d: roundRect(cx - bW / 2, cy - bH / 2, bW, bH, 6), closed: true, fill: true },
        { d: circle(cx + bW * 0.24, cy, 8), closed: true },
        { d: line(cx + bW * 0.24, cy, cx - 8 + open * 0.35, cy + bH / 2 + 12), strokeWidth: 3 },
      ];
      for (let h = 0; h < hooks; h++) {
        const hx = hooks === 1 ? cx : cx - 14 + h * 28;
        paths.push({ d: \`M \${hx - 10} \${cy + bH / 2} L \${hx - 10} \${height * 0.78} Q \${hx} \${height * 0.88} \${hx + open * 0.4} \${height * 0.74}\`, strokeWidth: 4 });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.hookOpen !== undefined ? Number(params.hookOpen) : 0.24;
  const v2 = params.ears !== undefined ? Number(params.ears) : 1;
  const p1Norm = (clamp(v1, 0.08, 0.48) - 0.08) / Math.max(0.0001, 0.4);
  const p2Norm = (clamp(v2, 1, 2) - 1) / Math.max(0.0001, 1);
  return [
    { id: 'hookOpen', label: 'Hook Open Angle Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'ears', label: 'Mounting Tabs', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'hookOpen') {
    return { ...params, hookOpen: Number(clamp(0.08 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.4, 0.08, 0.48).toFixed(2)) };
  }
  if (controlId === 'ears') {
    return { ...params, ears: Math.round(clamp(1 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 1, 1, 2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.ears !== undefined ? Math.round(Number(params.ears)) : 1;
  return { ...params, ears: ((cur - 1 + 1) % 2) + 1 };
}`,
  },

  {
    id: 'drone-payload-motorized-winch',
    name: 'Drone Part: Motorized Tethered Delivery Winch',
    category: 'Drone Parts & Frames',
    description: 'Hover-delivery motorized winch drum paying out a braided Kevlar line with auto-detaching cargo hook.',
    iconName: 'ArrowDown',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust payout line length or drum cable grooves; click in Preview Mode to cycle drum cable grooves.',
    defaultParams: {
      label: 'Motorized Cargo Winch',
      lineLen: 0.42,
      wraps: 5,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Motorized Cargo Winch' },
      { key: 'lineLen', label: 'Payout Line Length', type: 'number', min: 0.2, max: 0.56, step: 0.01, defaultValue: 0.42 },
      { key: 'wraps', label: 'Drum Cable Grooves', type: 'number', min: 3, max: 7, step: 1, defaultValue: 5 },
    ],
    jsSourceCode: `// Drone Part: Motorized Tethered Delivery Winch (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, topY = height * 0.28;
      const drop = clamp(Number(params.lineLen) || 0.42, 0.2, 0.56) * height;
      const wraps = clamp(Math.round(Number(params.wraps) || 5), 3, 7);
      const dW = width * 0.48, dH = height * 0.26, hY = topY + dH / 2 + drop;
      const paths = [
        { d: roundRect(cx - dW / 2 - 8, topY - dH / 2 - 4, dW + 16, dH + 8, 6), closed: true, fill: true },
        { d: rect(cx - dW / 2, topY - dH / 2, dW, dH), closed: true },
        { d: line(cx, topY + dH / 2, cx, hY - 8), strokeWidth: 2.5 },
        { d: \`M \${cx} \${hY - 8} C \${cx + 12} \${hY - 6} \${cx + 12} \${hY + 8} \${cx} \${hY + 8} C \${cx - 8} \${hY + 8} \${cx - 8} \${hY + 2} \${cx - 4} \${hY}\`, strokeWidth: 3.5 },
      ];
      for (let w = 1; w <= wraps; w++) {
        const wx = cx - dW / 2 + (w * dW) / (wraps + 1);
        paths.push({ d: line(wx, topY - dH / 2, wx, topY + dH / 2) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.lineLen !== undefined ? Number(params.lineLen) : 0.42;
  const v2 = params.wraps !== undefined ? Number(params.wraps) : 5;
  const p1Norm = (clamp(v1, 0.2, 0.56) - 0.2) / Math.max(0.0001, 0.36);
  const p2Norm = (clamp(v2, 3, 7) - 3) / Math.max(0.0001, 4);
  return [
    { id: 'lineLen', label: 'Payout Line Length', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'wraps', label: 'Drum Cable Grooves', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'lineLen') {
    return { ...params, lineLen: Number(clamp(0.2 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.36, 0.2, 0.56).toFixed(2)) };
  }
  if (controlId === 'wraps') {
    return { ...params, wraps: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 3, 7)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.wraps !== undefined ? Math.round(Number(params.wraps)) : 5;
  return { ...params, wraps: ((cur - 3 + 1) % 5) + 3 };
}`,
  },

  {
    id: 'drone-payload-robotic-claw',
    name: 'Drone Part: 3-Finger Compliant Perching Claw',
    category: 'Drone Parts & Frames',
    description: 'Servo-driven 3-talon robotic gripper claw enabling branch perching and object retrieval.',
    iconName: 'Hand',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust talon grip aperture or phalange segments; click in Preview Mode to cycle phalange segments.',
    defaultParams: {
      label: 'Robotic Perching Claw',
      clawSpread: 0.42,
      joints: 2,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Robotic Perching Claw' },
      { key: 'clawSpread', label: 'Talon Grip Aperture', type: 'number', min: 0.2, max: 0.62, step: 0.01, defaultValue: 0.42 },
      { key: 'joints', label: 'Phalange Segments', type: 'number', min: 2, max: 3, step: 1, defaultValue: 2 },
    ],
    jsSourceCode: `// Drone Part: 3-Finger Compliant Perching Claw (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, topY = height * 0.26;
      const spread = clamp(Number(params.clawSpread) || 0.42, 0.2, 0.62) * (width / 2);
      const joints = clamp(Math.round(Number(params.joints) || 2), 2, 3);
      const kY = height * 0.54, tipY = height * 0.84;
      const paths = [
        { d: roundRect(cx - 22, topY - 12, 44, 24, 5), closed: true, fill: true },
        { d: line(cx - 14, topY + 12, cx - spread, kY), strokeWidth: 4.5 },
        { d: line(cx - spread, kY, cx - spread * 0.35, tipY), strokeWidth: 4 },
        { d: line(cx + 14, topY + 12, cx + spread, kY), strokeWidth: 4.5 },
        { d: line(cx + spread, kY, cx + spread * 0.35, tipY), strokeWidth: 4 },
        { d: line(cx, topY + 12, cx, tipY - 6), strokeWidth: 3.5 },
        { d: circle(cx - spread, kY, 4), closed: true, fill: true },
        { d: circle(cx + spread, kY, 4), closed: true, fill: true },
      ];
      if (joints === 3) {
        paths.push({ d: circle(cx - spread * 0.68, (kY + tipY) / 2, 3.5), closed: true });
        paths.push({ d: circle(cx + spread * 0.68, (kY + tipY) / 2, 3.5), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.clawSpread !== undefined ? Number(params.clawSpread) : 0.42;
  const v2 = params.joints !== undefined ? Number(params.joints) : 2;
  const p1Norm = (clamp(v1, 0.2, 0.62) - 0.2) / Math.max(0.0001, 0.42);
  const p2Norm = (clamp(v2, 2, 3) - 2) / Math.max(0.0001, 1);
  return [
    { id: 'clawSpread', label: 'Talon Grip Aperture', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'joints', label: 'Phalange Segments', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'clawSpread') {
    return { ...params, clawSpread: Number(clamp(0.2 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.42, 0.2, 0.62).toFixed(2)) };
  }
  if (controlId === 'joints') {
    return { ...params, joints: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 1, 2, 3)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.joints !== undefined ? Math.round(Number(params.joints)) : 2;
  return { ...params, joints: ((cur - 2 + 1) % 2) + 2 };
}`,
  },

  {
    id: 'drone-payload-spotlight-strobe',
    name: 'Drone Part: 10,000-Lumen Searchlight Array',
    category: 'Drone Parts & Frames',
    description: 'Airborne SAR high-intensity 4-LED TIR optical searchlight pod with active rear heatsink fan.',
    iconName: 'Sun',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust light cone spread or tir optic lenses; click in Preview Mode to cycle tir optic lenses.',
    defaultParams: {
      label: '10k-Lm Searchlight',
      beamSpread: 0.38,
      lenses: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '10k-Lm Searchlight' },
      { key: 'beamSpread', label: 'Light Cone Spread', type: 'number', min: 0.24, max: 0.56, step: 0.01, defaultValue: 0.38 },
      { key: 'lenses', label: 'TIR Optic Lenses', type: 'number', min: 2, max: 4, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: 10,000-Lumen Searchlight Array (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height * 0.42, r = Math.min(width, height) * 0.28;
      const beam = clamp(Number(params.beamSpread) || 0.38, 0.24, 0.56) * width;
      const lenses = clamp(Math.round(Number(params.lenses) || 4), 2, 4);
      const paths = [
        { d: polygon([[cx - r * 0.8, cy + r * 0.5], [cx + r * 0.8, cy + r * 0.5], [cx + beam, height * 0.88], [cx - beam, height * 0.88]]), closed: true, strokeDasharray: '4 3' },
        { d: circle(cx, cy, r), closed: true, fill: true },
      ];
      for (let l = 0; l < lenses; l++) {
        const a = (l * Math.PI * 2) / lenses + Math.PI / 4;
        paths.push({ d: circle(cx + Math.cos(a) * (r * 0.46), cy + Math.sin(a) * (r * 0.46), r * 0.28), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.beamSpread !== undefined ? Number(params.beamSpread) : 0.38;
  const v2 = params.lenses !== undefined ? Number(params.lenses) : 4;
  const p1Norm = (clamp(v1, 0.24, 0.56) - 0.24) / Math.max(0.0001, 0.32);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'beamSpread', label: 'Light Cone Spread', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'lenses', label: 'TIR Optic Lenses', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'beamSpread') {
    return { ...params, beamSpread: Number(clamp(0.24 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.32, 0.24, 0.56).toFixed(2)) };
  }
  if (controlId === 'lenses') {
    return { ...params, lenses: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.lenses !== undefined ? Math.round(Number(params.lenses)) : 4;
  return { ...params, lenses: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-payload-loudspeaker-siren',
    name: 'Drone Part: Airborne Public Address Horn',
    category: 'Drone Parts & Frames',
    description: '120dB neodymium compression driver and flared acoustic horn for first-responder crowd communication.',
    iconName: 'Volume2',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust acoustic horn flare or sound pressure arcs; click in Preview Mode to cycle sound pressure arcs.',
    defaultParams: {
      label: 'Airborne PA Horn',
      flareH: 0.72,
      waves: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Airborne PA Horn' },
      { key: 'flareH', label: 'Acoustic Horn Flare', type: 'number', min: 0.48, max: 0.88, step: 0.01, defaultValue: 0.72 },
      { key: 'waves', label: 'Sound Pressure Arcs', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: Airborne Public Address Horn (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cy = height / 2;
      const flare = clamp(Number(params.flareH) || 0.72, 0.48, 0.88) * (height * 0.44);
      const waves = clamp(Math.round(Number(params.waves) || 3), 2, 4);
      const x0 = width * 0.14, x1 = width * 0.34, x2 = width * 0.68;
      const paths = [
        { d: roundRect(x0, cy - 18, x1 - x0, 36, 6), closed: true, fill: true },
        { d: polygon([[x1, cy - 14], [x2, cy - flare], [x2, cy + flare], [x1, cy + 14]]), closed: true, fill: true },
        { d: roundRect(x1 + 10, cy - 7, x2 - x1 - 8, 14, 4), closed: true },
      ];
      for (let w = 1; w <= waves; w++) {
        const wr = 14 + w * 9;
        paths.push({ d: \`M \${x2 + 4} \${cy - wr * 0.6} A \${wr} \${wr} 0 0 1 \${x2 + 4} \${cy + wr * 0.6}\`, strokeWidth: 2 });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.flareH !== undefined ? Number(params.flareH) : 0.72;
  const v2 = params.waves !== undefined ? Number(params.waves) : 3;
  const p1Norm = (clamp(v1, 0.48, 0.88) - 0.48) / Math.max(0.0001, 0.4);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'flareH', label: 'Acoustic Horn Flare', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'waves', label: 'Sound Pressure Arcs', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'flareH') {
    return { ...params, flareH: Number(clamp(0.48 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.4, 0.48, 0.88).toFixed(2)) };
  }
  if (controlId === 'waves') {
    return { ...params, waves: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.waves !== undefined ? Math.round(Number(params.waves)) : 3;
  return { ...params, waves: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-payload-ag-spray-nozzle',
    name: 'Drone Part: Centrifugal Atomizing Spray Nozzle',
    category: 'Drone Parts & Frames',
    description: 'Agricultural boom-mounted centrifugal spinning disc atomizer producing uniform micron-sized spray droplets.',
    iconName: 'Droplet',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust spray mist cone span or mist droplet streams; click in Preview Mode to cycle mist droplet streams.',
    defaultParams: {
      label: 'Centrifugal Sprayer',
      coneSpan: 0.66,
      droplets: 5,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Centrifugal Sprayer' },
      { key: 'coneSpan', label: 'Spray Mist Cone Span', type: 'number', min: 0.42, max: 0.86, step: 0.01, defaultValue: 0.66 },
      { key: 'droplets', label: 'Mist Droplet Streams', type: 'number', min: 3, max: 6, step: 1, defaultValue: 5 },
    ],
    jsSourceCode: `// Drone Part: Centrifugal Atomizing Spray Nozzle (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2;
      const span = clamp(Number(params.coneSpan) || 0.66, 0.42, 0.86) * (width * 0.48);
      const drops = clamp(Math.round(Number(params.droplets) || 5), 3, 6);
      const discY = height * 0.48;
      const paths = [
        { d: line(width * 0.16, height * 0.16, width * 0.84, height * 0.16), strokeWidth: 5 },
        { d: roundRect(cx - 14, height * 0.16, 28, discY - height * 0.16 - 4, 4), closed: true, fill: true },
        { d: ellipse(cx, discY, 22, 6), closed: true, fill: true },
      ];
      for (let d = 0; d < drops; d++) {
        const tx = cx - span + (d * span * 2) / Math.max(1, drops - 1);
        paths.push({ d: line(cx, discY + 4, tx, height * 0.86), strokeDasharray: '3 3' });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.coneSpan !== undefined ? Number(params.coneSpan) : 0.66;
  const v2 = params.droplets !== undefined ? Number(params.droplets) : 5;
  const p1Norm = (clamp(v1, 0.42, 0.86) - 0.42) / Math.max(0.0001, 0.44);
  const p2Norm = (clamp(v2, 3, 6) - 3) / Math.max(0.0001, 3);
  return [
    { id: 'coneSpan', label: 'Spray Mist Cone Span', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'droplets', label: 'Mist Droplet Streams', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'coneSpan') {
    return { ...params, coneSpan: Number(clamp(0.42 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.44, 0.42, 0.86).toFixed(2)) };
  }
  if (controlId === 'droplets') {
    return { ...params, droplets: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 3, 6)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.droplets !== undefined ? Math.round(Number(params.droplets)) : 5;
  return { ...params, droplets: ((cur - 3 + 1) % 4) + 3 };
}`,
  },

  {
    id: 'drone-payload-gas-sniffer-nose',
    name: 'Drone Part: Multi-Gas Plume Sniffer Pod',
    category: 'Drone Parts & Frames',
    description: 'Pumped atmospheric sampling pod housing CH4, CO, H2S, and VOC electrochemical sensor cells.',
    iconName: 'Wind',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust sensor chamber width or electrochemical cells; click in Preview Mode to cycle electrochemical cells.',
    defaultParams: {
      label: 'Gas Sniffer Payload',
      chamberW: 0.64,
      cells: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Gas Sniffer Payload' },
      { key: 'chamberW', label: 'Sensor Chamber Width', type: 'number', min: 0.48, max: 0.78, step: 0.01, defaultValue: 0.64 },
      { key: 'cells', label: 'Electrochemical Cells', type: 'number', min: 2, max: 5, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: Multi-Gas Plume Sniffer Pod (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const chW = clamp(Number(params.chamberW) || 0.64, 0.48, 0.78) * width;
      const cells = clamp(Math.round(Number(params.cells) || 4), 2, 5);
      const cH = height * 0.56, ox = cx - chW / 2, oy = cy - cH / 2;
      const paths = [
        { d: polygon([[ox - 16, cy - 12], [ox, cy - 6], [ox, cy + 6], [ox - 16, cy + 12]]), closed: true, fill: true },
        { d: roundRect(ox, oy, chW, cH, 8), closed: true, fill: true },
        { d: circle(ox + chW - 16, cy, 10), closed: true },
      ];
      for (let c = 0; c < cells; c++) {
        const cxP = ox + 18 + (c * (chW - 56)) / Math.max(1, cells - 1);
        paths.push({ d: circle(cxP, cy, 8), closed: true, fill: true });
        paths.push({ d: circle(cxP, cy, 3), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.chamberW !== undefined ? Number(params.chamberW) : 0.64;
  const v2 = params.cells !== undefined ? Number(params.cells) : 4;
  const p1Norm = (clamp(v1, 0.48, 0.78) - 0.48) / Math.max(0.0001, 0.3);
  const p2Norm = (clamp(v2, 2, 5) - 2) / Math.max(0.0001, 3);
  return [
    { id: 'chamberW', label: 'Sensor Chamber Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'cells', label: 'Electrochemical Cells', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'chamberW') {
    return { ...params, chamberW: Number(clamp(0.48 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.3, 0.48, 0.78).toFixed(2)) };
  }
  if (controlId === 'cells') {
    return { ...params, cells: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 2, 5)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.cells !== undefined ? Math.round(Number(params.cells)) : 4;
  return { ...params, cells: ((cur - 2 + 1) % 4) + 2 };
}`,
  },

  {
    id: 'drone-payload-magnetometer-bird',
    name: 'Drone Part: Towed Aeromagnetic Survey Bird',
    category: 'Drone Parts & Frames',
    description: 'Streamlined torpedo-shaped cesium-vapor magnetometer tow bird with cruciform rear stabilizing tail fins.',
    iconName: 'Navigation',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust torpedo diameter ratio or stabilizer tail fins; click in Preview Mode to cycle stabilizer tail fins.',
    defaultParams: {
      label: 'Aeromagnetic Bird',
      bodySlim: 0.32,
      fins: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Aeromagnetic Bird' },
      { key: 'bodySlim', label: 'Torpedo Diameter Ratio', type: 'number', min: 0.22, max: 0.44, step: 0.01, defaultValue: 0.32 },
      { key: 'fins', label: 'Stabilizer Tail Fins', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: Towed Aeromagnetic Survey Bird (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cy = height * 0.56;
      const bH = clamp(Number(params.bodySlim) || 0.32, 0.22, 0.44) * height;
      const fins = clamp(Math.round(Number(params.fins) || 3), 2, 4);
      const x0 = width * 0.14, x1 = width * 0.84;
      const paths = [
        { d: line(width * 0.48, height * 0.12, width * 0.42, cy - bH / 2), strokeDasharray: '4 2' },
        { d: roundRect(x0, cy - bH / 2, x1 - x0, bH, bH / 2), closed: true, fill: true },
        { d: polygon([[x1 - 18, cy - bH / 2], [x1 + 8, cy - bH * 0.95], [x1 + 4, cy + bH * 0.95], [x1 - 18, cy + bH / 2]]), closed: true, fill: true },
      ];
      if (fins >= 3) {
        paths.push({ d: line(x1 - 24, cy, x1 + 8, cy), strokeWidth: 3 });
      }
      if (fins >= 4) {
        paths.push({ d: line(x1 - 20, cy - bH * 0.35, x1 + 6, cy - bH * 0.65) });
        paths.push({ d: line(x1 - 20, cy + bH * 0.35, x1 + 6, cy + bH * 0.65) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.bodySlim !== undefined ? Number(params.bodySlim) : 0.32;
  const v2 = params.fins !== undefined ? Number(params.fins) : 3;
  const p1Norm = (clamp(v1, 0.22, 0.44) - 0.22) / Math.max(0.0001, 0.22);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'bodySlim', label: 'Torpedo Diameter Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'fins', label: 'Stabilizer Tail Fins', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'bodySlim') {
    return { ...params, bodySlim: Number(clamp(0.22 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.22, 0.22, 0.44).toFixed(2)) };
  }
  if (controlId === 'fins') {
    return { ...params, fins: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.fins !== undefined ? Math.round(Number(params.fins)) : 3;
  return { ...params, fins: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-payload-net-launcher',
    name: 'Drone Part: Counter-UAS Net Catcher Pod',
    category: 'Drone Parts & Frames',
    description: 'Counter-drone kinetic entanglement pod with 4 corner tractor-weight barrels and woven Kevlar capture net.',
    iconName: 'Grid',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust deployed net span or concentric net webs; click in Preview Mode to cycle concentric net webs.',
    defaultParams: {
      label: 'C-UAS Net Launcher',
      netSpan: 0.76,
      rings: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'C-UAS Net Launcher' },
      { key: 'netSpan', label: 'Deployed Net Span', type: 'number', min: 0.55, max: 0.9, step: 0.01, defaultValue: 0.76 },
      { key: 'rings', label: 'Concentric Net Webs', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: Counter-UAS Net Catcher Pod (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const span = clamp(Number(params.netSpan) || 0.76, 0.55, 0.9) * Math.min(width, height) * 0.5;
      const rings = clamp(Math.round(Number(params.rings) || 3), 2, 4);
      const paths = [];
      for (let r = 1; r <= rings; r++) {
        const s = (span * r) / rings;
        paths.push({ d: polygon([[cx, cy - s], [cx + s, cy], [cx, cy + s], [cx - s, cy]]), closed: true });
      }
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx, sy]) => {
        const bx = cx + sx * span * 0.72, by = cy + sy * span * 0.72;
        paths.push({ d: line(cx, cy, bx, by) });
        paths.push({ d: circle(bx, by, 5), closed: true, fill: true });
      });
      paths.push({ d: roundRect(cx - 12, cy - 12, 24, 24, 4), closed: true, fill: true });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.netSpan !== undefined ? Number(params.netSpan) : 0.76;
  const v2 = params.rings !== undefined ? Number(params.rings) : 3;
  const p1Norm = (clamp(v1, 0.55, 0.9) - 0.55) / Math.max(0.0001, 0.35);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'netSpan', label: 'Deployed Net Span', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'rings', label: 'Concentric Net Webs', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'netSpan') {
    return { ...params, netSpan: Number(clamp(0.55 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.35, 0.55, 0.9).toFixed(2)) };
  }
  if (controlId === 'rings') {
    return { ...params, rings: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.rings !== undefined ? Math.round(Number(params.rings)) : 3;
  return { ...params, rings: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-power-liion-21700-pack',
    name: 'Drone Part: 6S1P / 6S2P 21700 Li-Ion Pack',
    category: 'Drone Parts & Frames',
    description: 'Long-endurance cylindrical 21700 Lithium-Ion battery pack with spot-welded nickel strips and XT60/XH leads.',
    iconName: 'Battery',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust cell height ratio or cylindrical cells; click in Preview Mode to cycle cylindrical cells.',
    defaultParams: {
      label: '6S 21700 Li-Ion Pack',
      packHeight: 0.72,
      cells: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '6S 21700 Li-Ion Pack' },
      { key: 'packHeight', label: 'Cell Height Ratio', type: 'number', min: 0.55, max: 0.84, step: 0.01, defaultValue: 0.72 },
      { key: 'cells', label: 'Cylindrical Cells', type: 'number', min: 3, max: 6, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Part: 6S1P / 6S2P 21700 Li-Ion Pack (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const pH = clamp(Number(params.packHeight) || 0.72, 0.55, 0.84) * height;
      const cells = clamp(Math.round(Number(params.cells) || 6), 3, 6);
      const pW = width * 0.78, ox = cx - pW / 2, oy = cy - pH / 2, cW = pW / cells;
      const paths = [
        { d: roundRect(ox - 4, oy - 4, pW + 8, pH + 8, 8), closed: true, fill: true },
        { d: rect(ox + 6, oy + 4, pW - 12, 8), closed: true },
        { d: rect(ox + 6, oy + pH - 12, pW - 12, 8), closed: true },
      ];
      for (let c = 0; c < cells; c++) {
        paths.push({ d: roundRect(ox + c * cW + 2, oy + 12, cW - 4, pH - 24, 4), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.packHeight !== undefined ? Number(params.packHeight) : 0.72;
  const v2 = params.cells !== undefined ? Number(params.cells) : 6;
  const p1Norm = (clamp(v1, 0.55, 0.84) - 0.55) / Math.max(0.0001, 0.29);
  const p2Norm = (clamp(v2, 3, 6) - 3) / Math.max(0.0001, 3);
  return [
    { id: 'packHeight', label: 'Cell Height Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'cells', label: 'Cylindrical Cells', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'packHeight') {
    return { ...params, packHeight: Number(clamp(0.55 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.29, 0.55, 0.84).toFixed(2)) };
  }
  if (controlId === 'cells') {
    return { ...params, cells: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 3, 6)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.cells !== undefined ? Math.round(Number(params.cells)) : 6;
  return { ...params, cells: ((cur - 3 + 1) % 4) + 3 };
}`,
  },

  {
    id: 'drone-power-1s-bt2-whoop-cell',
    name: 'Drone Part: 1S 300mAh Folded-Edge Whoop Cell',
    category: 'Drone Parts & Frames',
    description: 'High-discharge 1S HV folded-edge micro whoop LiPo stick battery with integrated 2-pin BT2.0 connector cap.',
    iconName: 'Battery',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust stick cell width or bt2.0 cap height (px); click in Preview Mode to cycle bt2.0 cap height (px).',
    defaultParams: {
      label: '1S 300mAh BT2.0 Cell',
      stickW: 0.36,
      capH: 16,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '1S 300mAh BT2.0 Cell' },
      { key: 'stickW', label: 'Stick Cell Width', type: 'number', min: 0.26, max: 0.52, step: 0.01, defaultValue: 0.36 },
      { key: 'capH', label: 'BT2.0 Cap Height (px)', type: 'number', min: 12, max: 24, step: 1, defaultValue: 16 },
    ],
    jsSourceCode: `// Drone Part: 1S 300mAh Folded-Edge Whoop Cell (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const sW = clamp(Number(params.stickW) || 0.36, 0.26, 0.52) * width;
      const capH = clamp(Number(params.capH) || 16, 12, 24);
      const sH = height * 0.76, oy = cy - sH / 2;
      return [
        { d: roundRect(cx - sW / 2, oy + capH, sW, sH - capH, 6), closed: true, fill: true },
        { d: roundRect(cx - sW * 0.42, oy, sW * 0.84, capH + 2, 4), closed: true, fill: true },
        { d: circle(cx - sW * 0.16, oy + capH / 2, 3), closed: true },
        { d: circle(cx + sW * 0.16, oy + capH / 2, 3), closed: true },
        { d: rect(cx - sW * 0.36, cy, sW * 0.72, sH * 0.28), closed: true },
      ];
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.stickW !== undefined ? Number(params.stickW) : 0.36;
  const v2 = params.capH !== undefined ? Number(params.capH) : 16;
  const p1Norm = (clamp(v1, 0.26, 0.52) - 0.26) / Math.max(0.0001, 0.26);
  const p2Norm = (clamp(v2, 12, 24) - 12) / Math.max(0.0001, 12);
  return [
    { id: 'stickW', label: 'Stick Cell Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'capH', label: 'BT2.0 Cap Height (px)', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'stickW') {
    return { ...params, stickW: Number(clamp(0.26 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.26, 0.26, 0.52).toFixed(2)) };
  }
  if (controlId === 'capH') {
    return { ...params, capH: Math.round(clamp(12 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 12, 12, 24)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.capH !== undefined ? Math.round(Number(params.capH)) : 16;
  return { ...params, capH: ((cur - 12 + 1) % 13) + 12 };
}`,
  },

  {
    id: 'drone-power-smart-battery-bms',
    name: 'Drone Part: Smart Industrial BMS Battery',
    category: 'Drone Parts & Frames',
    description: 'Slide-in hardcase industrial smart drone battery with CAN-bus BMS, push-to-test button, and 4-LED fuel gauge.',
    iconName: 'BatteryCharging',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust cartridge width ratio or illuminated soc leds; click in Preview Mode to cycle illuminated soc leds.',
    defaultParams: {
      label: 'Smart BMS Battery',
      caseW: 0.74,
      leds: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Smart BMS Battery' },
      { key: 'caseW', label: 'Cartridge Width Ratio', type: 'number', min: 0.58, max: 0.88, step: 0.01, defaultValue: 0.74 },
      { key: 'leds', label: 'Illuminated SOC LEDs', type: 'number', min: 1, max: 4, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: Smart Industrial BMS Battery (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const cW = clamp(Number(params.caseW) || 0.74, 0.58, 0.88) * width;
      const leds = clamp(Math.round(Number(params.leds) || 4), 1, 4);
      const cH = height * 0.68, ox = cx - cW / 2, oy = cy - cH / 2;
      const paths = [
        { d: roundRect(ox, oy, cW, cH, 10), closed: true, fill: true },
        { d: roundRect(ox + 12, oy + 10, cW - 24, 24, 6), closed: true },
        { d: circle(cx, oy + 22, 7), closed: true, fill: true },
      ];
      for (let i = 0; i < 4; i++) {
        const lx = cx - 27 + i * 16;
        paths.push({ d: rect(lx, oy + 42, 10, 8), closed: true, fill: i < leds });
        if (i < leds) paths.push({ d: rect(lx + 2, oy + 44, 6, 4), closed: true });
      }
      paths.push({ d: rect(cx - 24, oy + cH - 16, 48, 10), closed: true });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.caseW !== undefined ? Number(params.caseW) : 0.74;
  const v2 = params.leds !== undefined ? Number(params.leds) : 4;
  const p1Norm = (clamp(v1, 0.58, 0.88) - 0.58) / Math.max(0.0001, 0.3);
  const p2Norm = (clamp(v2, 1, 4) - 1) / Math.max(0.0001, 3);
  return [
    { id: 'caseW', label: 'Cartridge Width Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'leds', label: 'Illuminated SOC LEDs', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'caseW') {
    return { ...params, caseW: Number(clamp(0.58 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.3, 0.58, 0.88).toFixed(2)) };
  }
  if (controlId === 'leds') {
    return { ...params, leds: Math.round(clamp(1 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 1, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.leds !== undefined ? Math.round(Number(params.leds)) : 4;
  return { ...params, leds: ((cur - 1 + 1) % 4) + 1 };
}`,
  },

  {
    id: 'drone-power-tether-dc-converter',
    name: 'Drone Part: 400V-to-48V Airborne Tether Brick',
    category: 'Drone Parts & Frames',
    description: 'High-voltage isolated DC-DC converter brick stepping 400V ground tether power down to 48V onboard bus.',
    iconName: 'Zap',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust converter brick width or bus terminal lugs; click in Preview Mode to cycle bus terminal lugs.',
    defaultParams: {
      label: '400V Tether Converter',
      brickW: 0.64,
      pins: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '400V Tether Converter' },
      { key: 'brickW', label: 'Converter Brick Width', type: 'number', min: 0.48, max: 0.78, step: 0.01, defaultValue: 0.64 },
      { key: 'pins', label: 'Bus Terminal Lugs', type: 'number', min: 4, max: 8, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Part: 400V-to-48V Airborne Tether Brick (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const bW = clamp(Number(params.brickW) || 0.64, 0.48, 0.78) * width;
      const pins = clamp(Math.round(Number(params.pins) || 6), 4, 8);
      const bH = height * 0.62, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 6), closed: true, fill: true },
        { d: polygon([[cx + 4, cy - 16], [cx - 8, cy + 2], [cx + 2, cy + 2], [cx - 4, cy + 16], [cx + 8, cy - 2], [cx - 2, cy - 2]]), closed: true, fill: true },
      ];
      const half = Math.ceil(pins / 2);
      for (let i = 0; i < half; i++) {
        const py = oy + 12 + (i * (bH - 24)) / Math.max(1, half - 1);
        paths.push({ d: rect(ox - 10, py - 4, 10, 8), closed: true, fill: true });
        paths.push({ d: rect(ox + bW, py - 4, 10, 8), closed: true, fill: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.brickW !== undefined ? Number(params.brickW) : 0.64;
  const v2 = params.pins !== undefined ? Number(params.pins) : 6;
  const p1Norm = (clamp(v1, 0.48, 0.78) - 0.48) / Math.max(0.0001, 0.3);
  const p2Norm = (clamp(v2, 4, 8) - 4) / Math.max(0.0001, 4);
  return [
    { id: 'brickW', label: 'Converter Brick Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'pins', label: 'Bus Terminal Lugs', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'brickW') {
    return { ...params, brickW: Number(clamp(0.48 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.3, 0.48, 0.78).toFixed(2)) };
  }
  if (controlId === 'pins') {
    return { ...params, pins: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 4, 8)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.pins !== undefined ? Math.round(Number(params.pins)) : 6;
  return { ...params, pins: ((cur - 4 + 1) % 5) + 4 };
}`,
  },

  {
    id: 'drone-conn-xt60-pair',
    name: 'Drone Part: Amass XT60 / XT90 Connector Pair',
    category: 'Drone Parts & Frames',
    description: 'Polarized yellow nylon XT60 connector housing with D-chamfered positive side and twin 3.5mm gold bullets.',
    iconName: 'Plug',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust polarizing d-chamfer or gold bullet sockets; click in Preview Mode to cycle gold bullet sockets.',
    defaultParams: {
      label: 'XT60 Power Plug',
      chamfer: 0.22,
      pins: 2,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'XT60 Power Plug' },
      { key: 'chamfer', label: 'Polarizing D-Chamfer', type: 'number', min: 0.14, max: 0.34, step: 0.01, defaultValue: 0.22 },
      { key: 'pins', label: 'Gold Bullet Sockets', type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
    ],
    jsSourceCode: `// Drone Part: Amass XT60 / XT90 Connector Pair (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const ch = clamp(Number(params.chamfer) || 0.22, 0.14, 0.34) * height;
      const pins = clamp(Math.round(Number(params.pins) || 2), 1, 3);
      const bW = width * 0.62, bH = height * 0.56, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: polygon([[ox, oy], [ox + bW - ch, oy], [ox + bW, oy + ch], [ox + bW, oy + bH - ch], [ox + bW - ch, oy + bH], [ox, oy + bH]]), closed: true, fill: true },
        { d: line(cx, oy, cx, oy + bH), strokeWidth: 2 },
        { d: circle(ox + bW * 0.72, cy - bH * 0.24, 8), closed: true },
        { d: circle(ox + bW * 0.72, cy + bH * 0.24, 8), closed: true },
        { d: line(ox - 18, cy - bH * 0.24, ox, cy - bH * 0.24), strokeWidth: 6 },
        { d: line(ox - 18, cy + bH * 0.24, ox, cy + bH * 0.24), strokeWidth: 6 },
      ];
      for (let p = 1; p <= pins; p++) {
        paths.push({ d: circle(ox + bW * 0.72, cy - bH * 0.24, p * 2.2), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.chamfer !== undefined ? Number(params.chamfer) : 0.22;
  const v2 = params.pins !== undefined ? Number(params.pins) : 2;
  const p1Norm = (clamp(v1, 0.14, 0.34) - 0.14) / Math.max(0.0001, 0.2);
  const p2Norm = (clamp(v2, 1, 3) - 1) / Math.max(0.0001, 2);
  return [
    { id: 'chamfer', label: 'Polarizing D-Chamfer', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'pins', label: 'Gold Bullet Sockets', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'chamfer') {
    return { ...params, chamfer: Number(clamp(0.14 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.2, 0.14, 0.34).toFixed(2)) };
  }
  if (controlId === 'pins') {
    return { ...params, pins: Math.round(clamp(1 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 1, 3)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.pins !== undefined ? Math.round(Number(params.pins)) : 2;
  return { ...params, pins: ((cur - 1 + 1) % 3) + 1 };
}`,
  },

  {
    id: 'drone-conn-xt30-micro',
    name: 'Drone Part: XT30 Micro Power Connector',
    category: 'Drone Parts & Frames',
    description: 'Compact 30A XT30 power plug with snap-on rear wire strain-relief boot cap and 2mm gold bullet pins.',
    iconName: 'Plug',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust rear boot cap ratio or silicone leads; click in Preview Mode to cycle silicone leads.',
    defaultParams: {
      label: 'XT30 Micro Plug',
      bootRatio: 0.32,
      wires: 2,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'XT30 Micro Plug' },
      { key: 'bootRatio', label: 'Rear Boot Cap Ratio', type: 'number', min: 0.22, max: 0.44, step: 0.01, defaultValue: 0.32 },
      { key: 'wires', label: 'Silicone Leads', type: 'number', min: 2, max: 4, step: 1, defaultValue: 2 },
    ],
    jsSourceCode: `// Drone Part: XT30 Micro Power Connector (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const bootW = clamp(Number(params.bootRatio) || 0.32, 0.22, 0.44) * width;
      const wires = clamp(Math.round(Number(params.wires) || 2), 2, 4);
      const bW = width * 0.44, bH = height * 0.48, ox = cx - (bW + bootW) / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy + 4, bootW, bH - 8, 4), closed: true, fill: true },
        { d: roundRect(ox + bootW, oy, bW, bH, 5), closed: true, fill: true },
        { d: circle(ox + bootW + bW * 0.65, cy - bH * 0.24, 6), closed: true },
        { d: circle(ox + bootW + bW * 0.65, cy + bH * 0.24, 6), closed: true },
        { d: line(ox - 16, cy - 10, ox, cy - 10), strokeWidth: 4.5 },
        { d: line(ox - 16, cy + 10, ox, cy + 10), strokeWidth: 4.5 },
      ];
      for (let w = 1; w <= wires; w++) {
        const wx = ox + (w * bootW) / (wires + 1);
        paths.push({ d: line(wx, oy + 4, wx, oy + bH - 4) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.bootRatio !== undefined ? Number(params.bootRatio) : 0.32;
  const v2 = params.wires !== undefined ? Number(params.wires) : 2;
  const p1Norm = (clamp(v1, 0.22, 0.44) - 0.22) / Math.max(0.0001, 0.22);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'bootRatio', label: 'Rear Boot Cap Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'wires', label: 'Silicone Leads', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'bootRatio') {
    return { ...params, bootRatio: Number(clamp(0.22 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.22, 0.22, 0.44).toFixed(2)) };
  }
  if (controlId === 'wires') {
    return { ...params, wires: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.wires !== undefined ? Math.round(Number(params.wires)) : 2;
  return { ...params, wires: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-conn-as150-antispark',
    name: 'Drone Part: AS150 7mm Anti-Spark Bullet Plug',
    category: 'Drone Parts & Frames',
    description: 'Heavy-duty 150A 7mm bullet connector pair featuring a carbon-resistor anti-spark pre-charge tip ring.',
    iconName: 'Zap',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust red/black separation or grip grooves; click in Preview Mode to cycle grip grooves.',
    defaultParams: {
      label: 'AS150 Anti-Spark Plug',
      plugGap: 0.34,
      rings: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'AS150 Anti-Spark Plug' },
      { key: 'plugGap', label: 'Red/Black Separation', type: 'number', min: 0.22, max: 0.48, step: 0.01, defaultValue: 0.34 },
      { key: 'rings', label: 'Grip Grooves', type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: AS150 7mm Anti-Spark Bullet Plug (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const gap = clamp(Number(params.plugGap) || 0.34, 0.22, 0.48) * height;
      const rings = clamp(Math.round(Number(params.rings) || 3), 2, 5);
      const bW = width * 0.56, bH = 22, ox = width * 0.16;
      const paths = [];
      [-gap / 2, gap / 2].forEach((dy, idx) => {
        const y = cy + dy;
        paths.push({ d: roundRect(ox, y - bH / 2, bW, bH, 6), closed: true, fill: true });
        paths.push({ d: roundRect(ox + bW, y - 6, 20, 12, 5), closed: true, fill: idx === 0 });
        for (let r = 0; r < rings; r++) {
          const rx = ox + 12 + r * 12;
          paths.push({ d: line(rx, y - bH / 2 + 2, rx, y + bH / 2 - 2) });
        }
      });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.plugGap !== undefined ? Number(params.plugGap) : 0.34;
  const v2 = params.rings !== undefined ? Number(params.rings) : 3;
  const p1Norm = (clamp(v1, 0.22, 0.48) - 0.22) / Math.max(0.0001, 0.26);
  const p2Norm = (clamp(v2, 2, 5) - 2) / Math.max(0.0001, 3);
  return [
    { id: 'plugGap', label: 'Red/Black Separation', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'rings', label: 'Grip Grooves', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'plugGap') {
    return { ...params, plugGap: Number(clamp(0.22 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.26, 0.22, 0.48).toFixed(2)) };
  }
  if (controlId === 'rings') {
    return { ...params, rings: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 2, 5)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.rings !== undefined ? Math.round(Number(params.rings)) : 3;
  return { ...params, rings: ((cur - 2 + 1) % 4) + 2 };
}`,
  },

  {
    id: 'drone-conn-jst-xh-balance',
    name: 'Drone Part: 6S JST-XH Balance Plug',
    category: 'Drone Parts & Frames',
    description: 'Keyed white nylon JST-XH battery balance connector with individual cell sense pins and wire fan.',
    iconName: 'Plug',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust connector body height or balance sense pins; click in Preview Mode to cycle balance sense pins.',
    defaultParams: {
      label: '6S JST-XH Balance',
      housingH: 0.48,
      pins: 7,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '6S JST-XH Balance' },
      { key: 'housingH', label: 'Connector Body Height', type: 'number', min: 0.36, max: 0.62, step: 0.01, defaultValue: 0.48 },
      { key: 'pins', label: 'Balance Sense Pins', type: 'number', min: 4, max: 7, step: 1, defaultValue: 7 },
    ],
    jsSourceCode: `// Drone Part: 6S JST-XH Balance Plug (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height * 0.4;
      const hH = clamp(Number(params.housingH) || 0.48, 0.36, 0.62) * height;
      const pins = clamp(Math.round(Number(params.pins) || 7), 4, 7);
      const hW = width * 0.76, ox = cx - hW / 2, oy = cy - hH / 2;
      const paths = [
        { d: roundRect(ox, oy, hW, hH, 4), closed: true, fill: true },
        { d: rect(ox + 12, oy - 5, 16, 5), closed: true, fill: true },
        { d: rect(ox + hW - 28, oy - 5, 16, 5), closed: true, fill: true },
      ];
      for (let p = 0; p < pins; p++) {
        const px = ox + 14 + (p * (hW - 28)) / Math.max(1, pins - 1);
        paths.push({ d: rect(px - 3, cy - 6, 6, 12), closed: true });
        paths.push({ d: line(px, oy + hH, px + (p - (pins - 1) / 2) * 3, height * 0.88), strokeWidth: 2 });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.housingH !== undefined ? Number(params.housingH) : 0.48;
  const v2 = params.pins !== undefined ? Number(params.pins) : 7;
  const p1Norm = (clamp(v1, 0.36, 0.62) - 0.36) / Math.max(0.0001, 0.26);
  const p2Norm = (clamp(v2, 4, 7) - 4) / Math.max(0.0001, 3);
  return [
    { id: 'housingH', label: 'Connector Body Height', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'pins', label: 'Balance Sense Pins', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'housingH') {
    return { ...params, housingH: Number(clamp(0.36 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.26, 0.36, 0.62).toFixed(2)) };
  }
  if (controlId === 'pins') {
    return { ...params, pins: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 4, 7)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.pins !== undefined ? Math.round(Number(params.pins)) : 7;
  return { ...params, pins: ((cur - 4 + 1) % 4) + 4 };
}`,
  },

  {
    id: 'drone-conn-mr30-3phase',
    name: 'Drone Part: MR30 3-Pin Motor Connector',
    category: 'Drone Parts & Frames',
    description: 'Triangular-polarized 3-pin MR30 gold bullet connector for quick-disconnect removable motor arms.',
    iconName: 'Plug',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust 3-pin housing scale or motor phase pins; click in Preview Mode to cycle motor phase pins.',
    defaultParams: {
      label: 'MR30 3-Phase Plug',
      lobeScale: 0.64,
      pins: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'MR30 3-Phase Plug' },
      { key: 'lobeScale', label: '3-Pin Housing Scale', type: 'number', min: 0.48, max: 0.78, step: 0.01, defaultValue: 0.64 },
      { key: 'pins', label: 'Motor Phase Pins', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: MR30 3-Pin Motor Connector (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.42;
      const s = clamp(Number(params.lobeScale) || 0.64, 0.48, 0.78) * r * 1.4;
      const pins = clamp(Math.round(Number(params.pins) || 3), 2, 4);
      const paths = [
        { d: roundRect(cx - s, cy - s * 0.75, s * 2, s * 1.5, 14), closed: true, fill: true },
        { d: circle(cx - s * 0.48, cy - s * 0.22, 8), closed: true },
        { d: circle(cx + s * 0.48, cy - s * 0.22, 8), closed: true },
        { d: circle(cx, cy + s * 0.3, 8), closed: true },
        { d: circle(cx - s * 0.48, cy - s * 0.22, 3), closed: true, fill: true },
        { d: circle(cx + s * 0.48, cy - s * 0.22, 3), closed: true, fill: true },
        { d: circle(cx, cy + s * 0.3, 3), closed: true, fill: true },
      ];
      if (pins >= 3) paths.push({ d: line(cx, cy - s * 0.75, cx, cy - 2) });
      if (pins >= 4) paths.push({ d: circle(cx, cy - s * 0.22, 2.5), closed: true });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.lobeScale !== undefined ? Number(params.lobeScale) : 0.64;
  const v2 = params.pins !== undefined ? Number(params.pins) : 3;
  const p1Norm = (clamp(v1, 0.48, 0.78) - 0.48) / Math.max(0.0001, 0.3);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'lobeScale', label: '3-Pin Housing Scale', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'pins', label: 'Motor Phase Pins', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'lobeScale') {
    return { ...params, lobeScale: Number(clamp(0.48 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.3, 0.48, 0.78).toFixed(2)) };
  }
  if (controlId === 'pins') {
    return { ...params, pins: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.pins !== undefined ? Math.round(Number(params.pins)) : 3;
  return { ...params, pins: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-charger-dual-smart',
    name: 'Drone Part: Dual-Channel 1000W Smart Charger',
    category: 'Drone Parts & Frames',
    description: 'Dual-port LiPo/LiHV smart balance charger with split CH1/CH2 IPS screen, scroll roller, and XT60 ports.',
    iconName: 'BatteryCharging',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust split display height or charge output channels; click in Preview Mode to cycle charge output channels.',
    defaultParams: {
      label: 'Dual 1000W Charger',
      screenH: 0.44,
      channels: 2,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Dual 1000W Charger' },
      { key: 'screenH', label: 'Split Display Height', type: 'number', min: 0.32, max: 0.56, step: 0.01, defaultValue: 0.44 },
      { key: 'channels', label: 'Charge Output Channels', type: 'number', min: 1, max: 4, step: 1, defaultValue: 2 },
    ],
    jsSourceCode: `// Drone Part: Dual-Channel 1000W Smart Charger (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const scrH = clamp(Number(params.screenH) || 0.44, 0.32, 0.56) * height;
      const channels = clamp(Math.round(Number(params.channels) || 2), 1, 4);
      const bW = width * 0.82, bH = height * 0.74, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 10), closed: true, fill: true },
        { d: roundRect(ox + 12, oy + 12, bW - 24, scrH, 4), closed: true },
        { d: line(cx, oy + 12, cx, oy + 12 + scrH) },
        { d: circle(cx, oy + 24 + scrH, 8), closed: true, fill: true },
      ];
      for (let c = 0; c < channels; c++) {
        const px = ox + 16 + (c * (bW - 50)) / Math.max(1, channels - 1);
        paths.push({ d: rect(px, oy + bH - 20, 18, 12), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.screenH !== undefined ? Number(params.screenH) : 0.44;
  const v2 = params.channels !== undefined ? Number(params.channels) : 2;
  const p1Norm = (clamp(v1, 0.32, 0.56) - 0.32) / Math.max(0.0001, 0.24);
  const p2Norm = (clamp(v2, 1, 4) - 1) / Math.max(0.0001, 3);
  return [
    { id: 'screenH', label: 'Split Display Height', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'channels', label: 'Charge Output Channels', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'screenH') {
    return { ...params, screenH: Number(clamp(0.32 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.24, 0.32, 0.56).toFixed(2)) };
  }
  if (controlId === 'channels') {
    return { ...params, channels: Math.round(clamp(1 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 1, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.channels !== undefined ? Math.round(Number(params.channels)) : 2;
  return { ...params, channels: ((cur - 1 + 1) % 4) + 1 };
}`,
  },

  {
    id: 'drone-charger-parallel-board',
    name: 'Drone Part: Fused 6-Port Parallel Charge Board',
    category: 'Drone Parts & Frames',
    description: 'Fused 6-pack parallel charging board with 6 XT60 plugs, 6 balance sockets, and automotive blade fuses.',
    iconName: 'Grid',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust board width ratio or parallel battery bays; click in Preview Mode to cycle parallel battery bays.',
    defaultParams: {
      label: 'Parallel Charge Board',
      boardW: 0.86,
      bays: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Parallel Charge Board' },
      { key: 'boardW', label: 'Board Width Ratio', type: 'number', min: 0.7, max: 0.94, step: 0.01, defaultValue: 0.86 },
      { key: 'bays', label: 'Parallel Battery Bays', type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: Fused 6-Port Parallel Charge Board (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const bW = clamp(Number(params.boardW) || 0.86, 0.7, 0.94) * width;
      const bays = clamp(Math.round(Number(params.bays) || 4), 3, 6);
      const bH = height * 0.64, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 8), closed: true, fill: true },
        { d: line(ox - 14, cy, ox, cy), strokeWidth: 5 },
      ];
      for (let b = 0; b < bays; b++) {
        const bx = ox + 16 + (b * (bW - 48)) / Math.max(1, bays - 1);
        paths.push({ d: rect(bx, oy + 10, 16, 12), closed: true });
        paths.push({ d: rect(bx + 2, cy - 4, 12, 8), closed: true, fill: true });
        paths.push({ d: rect(bx - 2, oy + bH - 22, 20, 12), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.boardW !== undefined ? Number(params.boardW) : 0.86;
  const v2 = params.bays !== undefined ? Number(params.bays) : 4;
  const p1Norm = (clamp(v1, 0.7, 0.94) - 0.7) / Math.max(0.0001, 0.24);
  const p2Norm = (clamp(v2, 3, 6) - 3) / Math.max(0.0001, 3);
  return [
    { id: 'boardW', label: 'Board Width Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'bays', label: 'Parallel Battery Bays', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'boardW') {
    return { ...params, boardW: Number(clamp(0.7 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.24, 0.7, 0.94).toFixed(2)) };
  }
  if (controlId === 'bays') {
    return { ...params, bays: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 3, 6)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.bays !== undefined ? Math.round(Number(params.bays)) : 4;
  return { ...params, bays: ((cur - 3 + 1) % 4) + 3 };
}`,
  },

  {
    id: 'drone-charger-1s-6port-whoop',
    name: 'Drone Part: 6-Channel 1S Whoop USB-C Charger',
    category: 'Drone Parts & Frames',
    description: '6-channel independent 1S BT2.0/PH2.0 whoop charger with per-port digital voltage displays and USB-C PD.',
    iconName: 'Zap',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust led readout height or 1s charge slots; click in Preview Mode to cycle 1s charge slots.',
    defaultParams: {
      label: '1S 6-Port Charger',
      dispH: 0.24,
      ports: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '1S 6-Port Charger' },
      { key: 'dispH', label: 'LED Readout Height', type: 'number', min: 0.18, max: 0.34, step: 0.01, defaultValue: 0.24 },
      { key: 'ports', label: '1S Charge Slots', type: 'number', min: 4, max: 6, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Part: 6-Channel 1S Whoop USB-C Charger (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const dispH = clamp(Number(params.dispH) || 0.24, 0.18, 0.34) * height;
      const ports = clamp(Math.round(Number(params.ports) || 6), 4, 6);
      const bW = width * 0.84, bH = height * 0.62, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [{ d: roundRect(ox, oy, bW, bH, 8), closed: true, fill: true }];
      for (let p = 0; p < ports; p++) {
        const px = ox + 14 + (p * (bW - 44)) / Math.max(1, ports - 1);
        paths.push({ d: rect(px, oy + 10, 16, dispH), closed: true });
        paths.push({ d: roundRect(px + 2, oy + bH - 22, 12, 12, 3), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.dispH !== undefined ? Number(params.dispH) : 0.24;
  const v2 = params.ports !== undefined ? Number(params.ports) : 6;
  const p1Norm = (clamp(v1, 0.18, 0.34) - 0.18) / Math.max(0.0001, 0.16);
  const p2Norm = (clamp(v2, 4, 6) - 4) / Math.max(0.0001, 2);
  return [
    { id: 'dispH', label: 'LED Readout Height', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'ports', label: '1S Charge Slots', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'dispH') {
    return { ...params, dispH: Number(clamp(0.18 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.16, 0.18, 0.34).toFixed(2)) };
  }
  if (controlId === 'ports') {
    return { ...params, ports: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 4, 6)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.ports !== undefined ? Math.round(Number(params.ports)) : 6;
  return { ...params, ports: ((cur - 4 + 1) % 3) + 4 };
}`,
  },

  {
    id: 'drone-lipo-fireproof-bunker',
    name: 'Drone Part: Vented Steel LiPo Charging Safe',
    category: 'Drone Parts & Frames',
    description: 'Double-walled steel LiPo charging safe with labyrinth flame-arrestor vent louvers and over-center latch.',
    iconName: 'Shield',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust hinged lid height or flame arrestor louvers; click in Preview Mode to cycle flame arrestor louvers.',
    defaultParams: {
      label: 'LiPo Fire Bunker',
      lidRatio: 0.24,
      vents: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'LiPo Fire Bunker' },
      { key: 'lidRatio', label: 'Hinged Lid Height', type: 'number', min: 0.16, max: 0.34, step: 0.01, defaultValue: 0.24 },
      { key: 'vents', label: 'Flame Arrestor Louvers', type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: Vented Steel LiPo Charging Safe (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const lidH = clamp(Number(params.lidRatio) || 0.24, 0.16, 0.34) * height;
      const vents = clamp(Math.round(Number(params.vents) || 4), 3, 6);
      const bW = width * 0.78, bH = height * 0.7, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 6), closed: true, fill: true },
        { d: line(ox, oy + lidH, ox + bW, oy + lidH), strokeWidth: 2.5 },
        { d: rect(cx - 10, oy + lidH - 6, 20, 16), closed: true, fill: true },
        { d: roundRect(cx - 22, oy - 8, 44, 8, 3), closed: true },
      ];
      for (let v = 0; v < vents; v++) {
        const vx = ox + 16 + (v * (bW - 32)) / Math.max(1, vents - 1);
        paths.push({ d: line(vx - 6, oy + lidH * 0.5, vx + 6, oy + lidH * 0.5), strokeWidth: 2 });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.lidRatio !== undefined ? Number(params.lidRatio) : 0.24;
  const v2 = params.vents !== undefined ? Number(params.vents) : 4;
  const p1Norm = (clamp(v1, 0.16, 0.34) - 0.16) / Math.max(0.0001, 0.18);
  const p2Norm = (clamp(v2, 3, 6) - 3) / Math.max(0.0001, 3);
  return [
    { id: 'lidRatio', label: 'Hinged Lid Height', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'vents', label: 'Flame Arrestor Louvers', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'lidRatio') {
    return { ...params, lidRatio: Number(clamp(0.16 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.18, 0.16, 0.34).toFixed(2)) };
  }
  if (controlId === 'vents') {
    return { ...params, vents: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 3, 6)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.vents !== undefined ? Math.round(Number(params.vents)) : 4;
  return { ...params, vents: ((cur - 3 + 1) % 4) + 3 };
}`,
  },

  {
    id: 'drone-cell-checker-balancer',
    name: 'Drone Part: Digital LiPo Cell Voltage Checker',
    category: 'Drone Parts & Frames',
    description: 'Pocket 1S–8S battery cell checker displaying individual cell voltage bar graphs and mV delta.',
    iconName: 'BarChart2',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust lcd screen width or displayed cell bars; click in Preview Mode to cycle displayed cell bars.',
    defaultParams: {
      label: 'LiPo Cell Checker',
      screenW: 0.64,
      cells: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'LiPo Cell Checker' },
      { key: 'screenW', label: 'LCD Screen Width', type: 'number', min: 0.5, max: 0.78, step: 0.01, defaultValue: 0.64 },
      { key: 'cells', label: 'Displayed Cell Bars', type: 'number', min: 3, max: 6, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Part: Digital LiPo Cell Voltage Checker (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const scrW = clamp(Number(params.screenW) || 0.64, 0.5, 0.78) * width;
      const cells = clamp(Math.round(Number(params.cells) || 6), 3, 6);
      const bW = width * 0.82, bH = height * 0.64, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 8), closed: true, fill: true },
        { d: rect(ox + 12, oy + 12, scrW, bH - 24), closed: true },
      ];
      for (let c = 0; c < cells; c++) {
        const bx = ox + 18 + c * ((scrW - 12) / cells);
        paths.push({ d: rect(bx, oy + 22, (scrW - 24) / cells, bH - 42), closed: true, fill: true });
        paths.push({ d: circle(ox + bW - 12, oy + 14 + c * 10, 2.5), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.screenW !== undefined ? Number(params.screenW) : 0.64;
  const v2 = params.cells !== undefined ? Number(params.cells) : 6;
  const p1Norm = (clamp(v1, 0.5, 0.78) - 0.5) / Math.max(0.0001, 0.28);
  const p2Norm = (clamp(v2, 3, 6) - 3) / Math.max(0.0001, 3);
  return [
    { id: 'screenW', label: 'LCD Screen Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'cells', label: 'Displayed Cell Bars', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'screenW') {
    return { ...params, screenW: Number(clamp(0.5 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.28, 0.5, 0.78).toFixed(2)) };
  }
  if (controlId === 'cells') {
    return { ...params, cells: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 3, 6)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.cells !== undefined ? Math.round(Number(params.cells)) : 6;
  return { ...params, cells: ((cur - 3 + 1) % 4) + 3 };
}`,
  },

  {
    id: 'drone-gcs-rc-transmitter',
    name: 'Drone Part: Dual-Gimbal Hall-Sensor Radio TX',
    category: 'Drone Parts & Frames',
    description: 'Dual CNC Hall-gimbal RC transmitter with top switches, folding antenna, and color EdgeTX screen.',
    iconName: 'Gamepad2',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust hall gimbal radius or top shoulder switches; click in Preview Mode to cycle top shoulder switches.',
    defaultParams: {
      label: 'ELRS Radio Transmitter',
      gimbalR: 0.19,
      switches: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'ELRS Radio Transmitter' },
      { key: 'gimbalR', label: 'Hall Gimbal Radius', type: 'number', min: 0.14, max: 0.25, step: 0.01, defaultValue: 0.19 },
      { key: 'switches', label: 'Top Shoulder Switches', type: 'number', min: 2, max: 4, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: Dual-Gimbal Hall-Sensor Radio TX (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height * 0.54;
      const gR = clamp(Number(params.gimbalR) || 0.19, 0.14, 0.25) * Math.min(width, height);
      const sw = clamp(Math.round(Number(params.switches) || 4), 2, 4);
      const bW = width * 0.8, bH = height * 0.66, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 14), closed: true, fill: true },
        { d: roundRect(cx - 24, oy - 14, 48, 14, 4), closed: true, fill: true },
        { d: circle(cx - bW * 0.26, cy - 6, gR), closed: true },
        { d: circle(cx + bW * 0.26, cy - 6, gR), closed: true },
        { d: circle(cx - bW * 0.26, cy - 6, 4), closed: true, fill: true },
        { d: circle(cx + bW * 0.26, cy - 6, 4), closed: true, fill: true },
        { d: rect(cx - 22, cy + gR + 2, 44, 18), closed: true },
      ];
      for (let s = 0; s < sw; s++) {
        const sx = ox + 16 + (s * (bW - 32)) / Math.max(1, sw - 1);
        paths.push({ d: line(sx, oy, sx, oy - 8), strokeWidth: 3 });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.gimbalR !== undefined ? Number(params.gimbalR) : 0.19;
  const v2 = params.switches !== undefined ? Number(params.switches) : 4;
  const p1Norm = (clamp(v1, 0.14, 0.25) - 0.14) / Math.max(0.0001, 0.11);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'gimbalR', label: 'Hall Gimbal Radius', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'switches', label: 'Top Shoulder Switches', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'gimbalR') {
    return { ...params, gimbalR: Number(clamp(0.14 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.11, 0.14, 0.25).toFixed(2)) };
  }
  if (controlId === 'switches') {
    return { ...params, switches: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.switches !== undefined ? Math.round(Number(params.switches)) : 4;
  return { ...params, switches: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-gcs-tx-jr-bay-module',
    name: 'Drone Part: External JR-Bay ExpressLRS TX Module',
    category: 'Drone Parts & Frames',
    description: '1W/2W external JR-bay transmitter module with CNC heatsink, active cooling fan, OLED, and Moxon/T antenna.',
    iconName: 'Cpu',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust cooling fan radius or fan impeller blades; click in Preview Mode to cycle fan impeller blades.',
    defaultParams: {
      label: '1W JR-Bay TX Module',
      fanR: 0.22,
      blades: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '1W JR-Bay TX Module' },
      { key: 'fanR', label: 'Cooling Fan Radius', type: 'number', min: 0.16, max: 0.3, step: 0.01, defaultValue: 0.22 },
      { key: 'blades', label: 'Fan Impeller Blades', type: 'number', min: 5, max: 8, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Part: External JR-Bay ExpressLRS TX Module (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height * 0.56;
      const fanR = clamp(Number(params.fanR) || 0.22, 0.16, 0.3) * Math.min(width, height);
      const blades = clamp(Math.round(Number(params.blades) || 6), 5, 8);
      const bW = width * 0.58, bH = height * 0.64, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 6), closed: true, fill: true },
        { d: line(cx, oy, cx, height * 0.12), strokeWidth: 3 },
        { d: line(cx - 24, height * 0.12, cx + 24, height * 0.12), strokeWidth: 4 },
        { d: circle(cx, cy - 4, fanR), closed: true },
        { d: rect(cx - 18, oy + bH - 18, 36, 10), closed: true },
      ];
      for (let b = 0; b < blades; b++) {
        const a = (b * Math.PI * 2) / blades;
        paths.push({ d: line(cx, cy - 4, cx + Math.cos(a) * fanR * 0.85, cy - 4 + Math.sin(a) * fanR * 0.85) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.fanR !== undefined ? Number(params.fanR) : 0.22;
  const v2 = params.blades !== undefined ? Number(params.blades) : 6;
  const p1Norm = (clamp(v1, 0.16, 0.3) - 0.16) / Math.max(0.0001, 0.14);
  const p2Norm = (clamp(v2, 5, 8) - 5) / Math.max(0.0001, 3);
  return [
    { id: 'fanR', label: 'Cooling Fan Radius', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'blades', label: 'Fan Impeller Blades', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'fanR') {
    return { ...params, fanR: Number(clamp(0.16 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.14, 0.16, 0.3).toFixed(2)) };
  }
  if (controlId === 'blades') {
    return { ...params, blades: Math.round(clamp(5 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 5, 8)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.blades !== undefined ? Math.round(Number(params.blades)) : 6;
  return { ...params, blades: ((cur - 5 + 1) % 4) + 5 };
}`,
  },

  {
    id: 'drone-gcs-fpv-oled-goggles',
    name: 'Drone Part: Binocular OLED FPV Goggles',
    category: 'Drone Parts & Frames',
    description: 'Low-latency binocular micro-OLED FPV goggles with dual side receiver bays, 4 antennas, and IPD sliders.',
    iconName: 'Eye',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust faceplate curvature or top patch/stubby ants; click in Preview Mode to cycle top patch/stubby ants.',
    defaultParams: {
      label: 'OLED FPV Goggles',
      visorCurve: 0.2,
      antennas: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'OLED FPV Goggles' },
      { key: 'visorCurve', label: 'Faceplate Curvature', type: 'number', min: 0.12, max: 0.32, step: 0.01, defaultValue: 0.2 },
      { key: 'antennas', label: 'Top Patch/Stubby Ants', type: 'number', min: 2, max: 4, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: Binocular OLED FPV Goggles (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height * 0.58;
      const curve = clamp(Number(params.visorCurve) || 0.2, 0.12, 0.32) * height;
      const ants = clamp(Math.round(Number(params.antennas) || 4), 2, 4);
      const gW = width * 0.82, gH = height * 0.44, ox = cx - gW / 2, oy = cy - gH / 2;
      const paths = [
        { d: \`M \${ox} \${oy} L \${ox + gW} \${oy} L \${ox + gW - 6} \${oy + gH} Q \${cx} \${oy + gH - curve} \${ox + 6} \${oy + gH} Z\`, closed: true, fill: true },
        { d: ellipse(cx - gW * 0.22, cy - 4, 18, 12), closed: true },
        { d: ellipse(cx + gW * 0.22, cy - 4, 18, 12), closed: true },
      ];
      for (let a = 0; a < ants; a++) {
        const ax = ox + 18 + (a * (gW - 36)) / Math.max(1, ants - 1);
        paths.push({ d: line(ax, oy, ax, oy - 18), strokeWidth: 3 });
        paths.push({ d: circle(ax, oy - 20, 5), closed: true, fill: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.visorCurve !== undefined ? Number(params.visorCurve) : 0.2;
  const v2 = params.antennas !== undefined ? Number(params.antennas) : 4;
  const p1Norm = (clamp(v1, 0.12, 0.32) - 0.12) / Math.max(0.0001, 0.2);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'visorCurve', label: 'Faceplate Curvature', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'antennas', label: 'Top Patch/Stubby Ants', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'visorCurve') {
    return { ...params, visorCurve: Number(clamp(0.12 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.2, 0.12, 0.32).toFixed(2)) };
  }
  if (controlId === 'antennas') {
    return { ...params, antennas: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.antennas !== undefined ? Math.round(Number(params.antennas)) : 4;
  return { ...params, antennas: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-gcs-vrx-rapidfire-module',
    name: 'Drone Part: Dual-Receiver Analog VRX Module',
    category: 'Drone Parts & Frames',
    description: 'Phase-combining goggle VRX receiver module with dual SMA ports, spectrum OLED, and 5-way joystick.',
    iconName: 'Wifi',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust oled window height or signal rssi bars; click in Preview Mode to cycle signal rssi bars.',
    defaultParams: {
      label: 'Diversity VRX Module',
      screenRatio: 0.36,
      bars: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Diversity VRX Module' },
      { key: 'screenRatio', label: 'OLED Window Height', type: 'number', min: 0.26, max: 0.5, step: 0.01, defaultValue: 0.36 },
      { key: 'bars', label: 'Signal RSSI Bars', type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: Dual-Receiver Analog VRX Module (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height * 0.56;
      const scrH = clamp(Number(params.screenRatio) || 0.36, 0.26, 0.5) * height;
      const bars = clamp(Math.round(Number(params.bars) || 4), 3, 6);
      const bW = width * 0.56, bH = height * 0.66, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 8), closed: true, fill: true },
        { d: rect(ox + 12, oy - 12, 12, 12), closed: true, fill: true },
        { d: rect(ox + bW - 24, oy - 12, 12, 12), closed: true, fill: true },
        { d: rect(ox + 12, oy + 12, bW - 24, scrH), closed: true },
        { d: circle(cx, oy + bH - 18, 8), closed: true, fill: true },
      ];
      for (let b = 0; b < bars; b++) {
        const bx = ox + 18 + b * ((bW - 36) / bars);
        paths.push({ d: rect(bx, oy + 10 + scrH - (b + 1) * 5, 6, (b + 1) * 5), closed: true, fill: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.screenRatio !== undefined ? Number(params.screenRatio) : 0.36;
  const v2 = params.bars !== undefined ? Number(params.bars) : 4;
  const p1Norm = (clamp(v1, 0.26, 0.5) - 0.26) / Math.max(0.0001, 0.24);
  const p2Norm = (clamp(v2, 3, 6) - 3) / Math.max(0.0001, 3);
  return [
    { id: 'screenRatio', label: 'OLED Window Height', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'bars', label: 'Signal RSSI Bars', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'screenRatio') {
    return { ...params, screenRatio: Number(clamp(0.26 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.24, 0.26, 0.5).toFixed(2)) };
  }
  if (controlId === 'bars') {
    return { ...params, bars: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 3, 6)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.bars !== undefined ? Math.round(Number(params.bars)) : 4;
  return { ...params, bars: ((cur - 3 + 1) % 4) + 3 };
}`,
  },

  {
    id: 'drone-gcs-rugged-tablet-controller',
    name: 'Drone Part: Rugged Ground Control Station',
    category: 'Drone Parts & Frames',
    description: '1000-nit daylight-readable rugged Ground Control Station with dual Hall joysticks and guarded E-stop.',
    iconName: 'Monitor',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust central display width or side bezel hotkeys; click in Preview Mode to cycle side bezel hotkeys.',
    defaultParams: {
      label: 'Rugged Tablet GCS',
      screenW: 0.58,
      buttons: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Rugged Tablet GCS' },
      { key: 'screenW', label: 'Central Display Width', type: 'number', min: 0.45, max: 0.72, step: 0.01, defaultValue: 0.58 },
      { key: 'buttons', label: 'Side Bezel Hotkeys', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: Rugged Ground Control Station (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const sW = clamp(Number(params.screenW) || 0.58, 0.45, 0.72) * width;
      const btns = clamp(Math.round(Number(params.buttons) || 3), 2, 4);
      const bW = width * 0.88, bH = height * 0.68, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 10), closed: true, fill: true },
        { d: rect(cx - sW / 2, oy + 12, sW, bH - 24), closed: true },
        { d: circle(ox + 20, oy + 26, 11), closed: true },
        { d: circle(ox + bW - 20, oy + 26, 11), closed: true },
      ];
      for (let b = 0; b < btns; b++) {
        const by = oy + 48 + b * 12;
        paths.push({ d: rect(ox + 12, by, 14, 7), closed: true });
        paths.push({ d: rect(ox + bW - 26, by, 14, 7), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.screenW !== undefined ? Number(params.screenW) : 0.58;
  const v2 = params.buttons !== undefined ? Number(params.buttons) : 3;
  const p1Norm = (clamp(v1, 0.45, 0.72) - 0.45) / Math.max(0.0001, 0.27);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'screenW', label: 'Central Display Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'buttons', label: 'Side Bezel Hotkeys', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'screenW') {
    return { ...params, screenW: Number(clamp(0.45 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.27, 0.45, 0.72).toFixed(2)) };
  }
  if (controlId === 'buttons') {
    return { ...params, buttons: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.buttons !== undefined ? Math.round(Number(params.buttons)) : 3;
  return { ...params, buttons: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-gcs-pan-tilt-antenna-tracker',
    name: 'Drone Part: Auto-Tracking Ground Antenna Tripod',
    category: 'Drone Parts & Frames',
    description: 'GPS-slaved 360-degree pan/tilt ground antenna tracker aiming a high-gain helical and crosshair array.',
    iconName: 'Compass',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust tilt yoke height y or helical array turns; click in Preview Mode to cycle helical array turns.',
    defaultParams: {
      label: 'Pan/Tilt Ant Tracker',
      headY: 0.36,
      turns: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Pan/Tilt Ant Tracker' },
      { key: 'headY', label: 'Tilt Yoke Height Y', type: 'number', min: 0.26, max: 0.5, step: 0.01, defaultValue: 0.36 },
      { key: 'turns', label: 'Helical Array Turns', type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: Auto-Tracking Ground Antenna Tripod (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2;
      const headY = clamp(Number(params.headY) || 0.36, 0.26, 0.5) * height;
      const turns = clamp(Math.round(Number(params.turns) || 4), 3, 6);
      const paths = [
        { d: line(cx, headY + 18, cx - 34, height * 0.88), strokeWidth: 4 },
        { d: line(cx, headY + 18, cx + 34, height * 0.88), strokeWidth: 4 },
        { d: line(cx, headY + 18, cx, height * 0.88), strokeWidth: 3 },
        { d: roundRect(cx - 18, headY - 6, 36, 24, 5), closed: true, fill: true },
        { d: rect(cx - 28, headY - 22, 12, 26), closed: true, fill: true },
      ];
      for (let t = 0; t < turns; t++) {
        paths.push({ d: ellipse(cx - 10 + t * 10, headY - 10, 6, 12), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.headY !== undefined ? Number(params.headY) : 0.36;
  const v2 = params.turns !== undefined ? Number(params.turns) : 4;
  const p1Norm = (clamp(v1, 0.26, 0.5) - 0.26) / Math.max(0.0001, 0.24);
  const p2Norm = (clamp(v2, 3, 6) - 3) / Math.max(0.0001, 3);
  return [
    { id: 'headY', label: 'Tilt Yoke Height Y', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'turns', label: 'Helical Array Turns', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'headY') {
    return { ...params, headY: Number(clamp(0.26 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.24, 0.26, 0.5).toFixed(2)) };
  }
  if (controlId === 'turns') {
    return { ...params, turns: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 3, 6)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.turns !== undefined ? Math.round(Number(params.turns)) : 4;
  return { ...params, turns: ((cur - 3 + 1) % 4) + 3 };
}`,
  },

  {
    id: 'drone-gcs-rtk-base-tripod',
    name: 'Drone Part: Surveying RTK Base Station Tripod',
    category: 'Drone Parts & Frames',
    description: 'Survey-grade GNSS RTK base station on leveling tripod broadcasting RTCM3 corrections over UHF radio.',
    iconName: 'MapPin',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust gnss saucer width or tripod stance (%); click in Preview Mode to cycle tripod stance (%).',
    defaultParams: {
      label: 'RTK Base Station',
      domeW: 0.38,
      legSpread: 68,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'RTK Base Station' },
      { key: 'domeW', label: 'GNSS Saucer Width', type: 'number', min: 0.28, max: 0.52, step: 0.01, defaultValue: 0.38 },
      { key: 'legSpread', label: 'Tripod Stance (%)', type: 'number', min: 45, max: 85, step: 1, defaultValue: 68 },
    ],
    jsSourceCode: `// Drone Part: Surveying RTK Base Station Tripod (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2;
      const dW = clamp(Number(params.domeW) || 0.38, 0.28, 0.52) * width;
      const legS = (clamp(Number(params.legSpread) || 68, 45, 85) / 100) * (width / 2);
      const topY = height * 0.24, hubY = height * 0.44, botY = height * 0.88;
      return [
        { d: ellipse(cx, topY, dW / 2, 12), closed: true, fill: true },
        { d: line(cx + dW * 0.25, topY - 8, cx + dW * 0.25, topY - 24), strokeWidth: 2.5 },
        { d: line(cx, topY + 12, cx, botY), strokeWidth: 3.5 },
        { d: rect(cx - 12, hubY - 6, 24, 12), closed: true, fill: true },
        { d: line(cx - 8, hubY + 6, cx - legS, botY), strokeWidth: 3.5 },
        { d: line(cx + 8, hubY + 6, cx + legS, botY), strokeWidth: 3.5 },
      ];
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.domeW !== undefined ? Number(params.domeW) : 0.38;
  const v2 = params.legSpread !== undefined ? Number(params.legSpread) : 68;
  const p1Norm = (clamp(v1, 0.28, 0.52) - 0.28) / Math.max(0.0001, 0.24);
  const p2Norm = (clamp(v2, 45, 85) - 45) / Math.max(0.0001, 40);
  return [
    { id: 'domeW', label: 'GNSS Saucer Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'legSpread', label: 'Tripod Stance (%)', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'domeW') {
    return { ...params, domeW: Number(clamp(0.28 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.24, 0.28, 0.52).toFixed(2)) };
  }
  if (controlId === 'legSpread') {
    return { ...params, legSpread: Math.round(clamp(45 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 40, 45, 85)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.legSpread !== undefined ? Math.round(Number(params.legSpread)) : 68;
  return { ...params, legSpread: ((cur - 45 + 1) % 41) + 45 };
}`,
  },

  {
    id: 'drone-gcs-drone-in-a-box-nest',
    name: 'Drone Part: Autonomous Drone-in-a-Box Hangar',
    category: 'Drone Parts & Frames',
    description: 'Weatherproof autonomous drone hangar with motorized clamshell roof doors and contact charging pad.',
    iconName: 'Home',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust clamshell door spread or centering v-rails; click in Preview Mode to cycle centering v-rails.',
    defaultParams: {
      label: 'Drone-in-a-Box Nest',
      doorOpen: 0.28,
      rails: 2,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Drone-in-a-Box Nest' },
      { key: 'doorOpen', label: 'Clamshell Door Spread', type: 'number', min: 0.14, max: 0.44, step: 0.01, defaultValue: 0.28 },
      { key: 'rails', label: 'Centering V-Rails', type: 'number', min: 2, max: 4, step: 1, defaultValue: 2 },
    ],
    jsSourceCode: `// Drone Part: Autonomous Drone-in-a-Box Hangar (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height * 0.58;
      const open = clamp(Number(params.doorOpen) || 0.28, 0.14, 0.44) * width;
      const rails = clamp(Math.round(Number(params.rails) || 2), 2, 4);
      const bW = width * 0.64, bH = height * 0.44, ox = cx - bW / 2, oy = cy - bH / 2;
      const paths = [
        { d: roundRect(ox, oy, bW, bH, 6), closed: true, fill: true },
        { d: polygon([[ox, oy], [ox - open, oy - 22], [cx - open * 0.3, oy - 22], [cx - 4, oy]]), closed: true, fill: true },
        { d: polygon([[ox + bW, oy], [ox + bW + open, oy - 22], [cx + open * 0.3, oy - 22], [cx + 4, oy]]), closed: true, fill: true },
      ];
      for (let r = 0; r < rails; r++) {
        const rx = ox + 16 + (r * (bW - 32)) / Math.max(1, rails - 1);
        paths.push({ d: line(rx, oy + 10, rx, oy + bH - 10), strokeWidth: 2.5 });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.doorOpen !== undefined ? Number(params.doorOpen) : 0.28;
  const v2 = params.rails !== undefined ? Number(params.rails) : 2;
  const p1Norm = (clamp(v1, 0.14, 0.44) - 0.14) / Math.max(0.0001, 0.3);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'doorOpen', label: 'Clamshell Door Spread', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'rails', label: 'Centering V-Rails', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'doorOpen') {
    return { ...params, doorOpen: Number(clamp(0.14 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.3, 0.14, 0.44).toFixed(2)) };
  }
  if (controlId === 'rails') {
    return { ...params, rails: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.rails !== undefined ? Math.round(Number(params.rails)) : 2;
  return { ...params, rails: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-gcs-wireless-charging-pad',
    name: 'Drone Part: Inductive / Contact Landing Pad',
    category: 'Drone Parts & Frames',
    description: 'Octagonal autonomous landing pad with concentric copper charging rings and illuminated H marker.',
    iconName: 'Target',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust inner charging ring or perimeter strobe leds; click in Preview Mode to cycle perimeter strobe leds.',
    defaultParams: {
      label: 'Inductive Landing Pad',
      ringScale: 0.54,
      lights: 8,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Inductive Landing Pad' },
      { key: 'ringScale', label: 'Inner Charging Ring', type: 'number', min: 0.38, max: 0.72, step: 0.01, defaultValue: 0.54 },
      { key: 'lights', label: 'Perimeter Strobe LEDs', type: 'number', min: 4, max: 8, step: 1, defaultValue: 8 },
    ],
    jsSourceCode: `// Drone Part: Inductive / Contact Landing Pad (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.44;
      const inR = clamp(Number(params.ringScale) || 0.54, 0.38, 0.72) * r;
      const lights = clamp(Math.round(Number(params.lights) || 8), 4, 8);
      const oct = Array.from({length:8}, (_,i) => {
        const a = (i * Math.PI) / 4 + Math.PI / 8;
        return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
      });
      const paths = [
        { d: polygon(oct), closed: true, fill: true },
        { d: circle(cx, cy, inR), closed: true },
        { d: circle(cx, cy, inR * 0.68), closed: true, strokeDasharray: '4 3' },
        { d: line(cx - 10, cy - 12, cx - 10, cy + 12), strokeWidth: 3 },
        { d: line(cx + 10, cy - 12, cx + 10, cy + 12), strokeWidth: 3 },
        { d: line(cx - 10, cy, cx + 10, cy), strokeWidth: 3 },
      ];
      for (let l = 0; l < lights; l++) {
        const a = (l * Math.PI * 2) / lights;
        paths.push({ d: circle(cx + Math.cos(a) * (r * 0.82), cy + Math.sin(a) * (r * 0.82), 3), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.ringScale !== undefined ? Number(params.ringScale) : 0.54;
  const v2 = params.lights !== undefined ? Number(params.lights) : 8;
  const p1Norm = (clamp(v1, 0.38, 0.72) - 0.38) / Math.max(0.0001, 0.34);
  const p2Norm = (clamp(v2, 4, 8) - 4) / Math.max(0.0001, 4);
  return [
    { id: 'ringScale', label: 'Inner Charging Ring', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'lights', label: 'Perimeter Strobe LEDs', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'ringScale') {
    return { ...params, ringScale: Number(clamp(0.38 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.34, 0.38, 0.72).toFixed(2)) };
  }
  if (controlId === 'lights') {
    return { ...params, lights: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 4, 8)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.lights !== undefined ? Math.round(Number(params.lights)) : 8;
  return { ...params, lights: ((cur - 4 + 1) % 5) + 4 };
}`,
  },

  {
    id: 'drone-gcs-apriltag-landing-target',
    name: 'Drone Part: AprilTag / ArUco Precision Fiducial',
    category: 'Drone Parts & Frames',
    description: 'High-contrast optical AprilTag fiducial marker grid used for downward vision precision auto-landing.',
    iconName: 'QrCode',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust black frame inset or bit matrix grid (n×n); click in Preview Mode to cycle bit matrix grid (n×n).',
    defaultParams: {
      label: 'AprilTag Landing Fiducial',
      borderW: 0.18,
      gridN: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'AprilTag Landing Fiducial' },
      { key: 'borderW', label: 'Black Frame Inset', type: 'number', min: 0.12, max: 0.26, step: 0.01, defaultValue: 0.18 },
      { key: 'gridN', label: 'Bit Matrix Grid (N×N)', type: 'number', min: 3, max: 5, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: AprilTag / ArUco Precision Fiducial (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, s = Math.min(width, height) * 0.8;
      const bW = clamp(Number(params.borderW) || 0.18, 0.12, 0.26) * s;
      const gridN = clamp(Math.round(Number(params.gridN) || 4), 3, 5);
      const ox = cx - s / 2, oy = cy - s / 2, inS = s - bW * 2, cell = inS / gridN;
      const paths = [
        { d: rect(ox, oy, s, s), closed: true, fill: true },
        { d: rect(ox + bW, oy + bW, inS, inS), closed: true },
      ];
      for (let r = 0; r < gridN; r++) {
        for (let c = 0; c < gridN; c++) {
          if ((r + c) % 2 === 0 || (r === 0 && c === gridN - 1)) {
            paths.push({ d: rect(ox + bW + c * cell + 1, oy + bW + r * cell + 1, cell - 2, cell - 2), closed: true, fill: true });
          }
        }
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.borderW !== undefined ? Number(params.borderW) : 0.18;
  const v2 = params.gridN !== undefined ? Number(params.gridN) : 4;
  const p1Norm = (clamp(v1, 0.12, 0.26) - 0.12) / Math.max(0.0001, 0.14);
  const p2Norm = (clamp(v2, 3, 5) - 3) / Math.max(0.0001, 2);
  return [
    { id: 'borderW', label: 'Black Frame Inset', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'gridN', label: 'Bit Matrix Grid (N×N)', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'borderW') {
    return { ...params, borderW: Number(clamp(0.12 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.14, 0.12, 0.26).toFixed(2)) };
  }
  if (controlId === 'gridN') {
    return { ...params, gridN: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 3, 5)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.gridN !== undefined ? Math.round(Number(params.gridN)) : 4;
  return { ...params, gridN: ((cur - 3 + 1) % 3) + 3 };
}`,
  },

  {
    id: 'drone-gcs-race-gate-arch',
    name: 'Drone Part: Illuminated FPV Air-Gate Arch',
    category: 'Drone Parts & Frames',
    description: 'Regulation FPV drone racing air-gate arch with neon LED perimeter segments and base ballast bags.',
    iconName: 'Maximize2',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust gate pillar thickness or perimeter led blocks; click in Preview Mode to cycle perimeter led blocks.',
    defaultParams: {
      label: 'FPV Race Gate Arch',
      archThick: 0.18,
      leds: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'FPV Race Gate Arch' },
      { key: 'archThick', label: 'Gate Pillar Thickness', type: 'number', min: 0.12, max: 0.26, step: 0.01, defaultValue: 0.18 },
      { key: 'leds', label: 'Perimeter LED Blocks', type: 'number', min: 4, max: 8, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Part: Illuminated FPV Air-Gate Arch (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2;
      const thick = clamp(Number(params.archThick) || 0.18, 0.12, 0.26) * (width * 0.42);
      const leds = clamp(Math.round(Number(params.leds) || 6), 4, 8);
      const rOut = width * 0.42, rIn = rOut - thick, baseY = height * 0.86;
      const paths = [
        { d: \`M \${cx - rOut} \${baseY} A \${rOut} \${height * 0.72} 0 0 1 \${cx + rOut} \${baseY} L \${cx + rIn} \${baseY} A \${rIn} \${height * 0.72 - thick} 0 0 0 \${cx - rIn} \${baseY} Z\`, closed: true, fill: true },
        { d: roundRect(cx - rOut - 6, baseY - 8, thick + 12, 10, 3), closed: true, fill: true },
        { d: roundRect(cx + rIn - 6, baseY - 8, thick + 12, 10, 3), closed: true, fill: true },
      ];
      for (let l = 0; l < leds; l++) {
        const a = Math.PI + ((l + 0.5) * Math.PI) / leds;
        const rMid = (rOut + rIn) / 2;
        paths.push({ d: circle(cx + Math.cos(a) * rMid, baseY + Math.sin(a) * (height * 0.65), 3), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.archThick !== undefined ? Number(params.archThick) : 0.18;
  const v2 = params.leds !== undefined ? Number(params.leds) : 6;
  const p1Norm = (clamp(v1, 0.12, 0.26) - 0.12) / Math.max(0.0001, 0.14);
  const p2Norm = (clamp(v2, 4, 8) - 4) / Math.max(0.0001, 4);
  return [
    { id: 'archThick', label: 'Gate Pillar Thickness', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'leds', label: 'Perimeter LED Blocks', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'archThick') {
    return { ...params, archThick: Number(clamp(0.12 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.14, 0.12, 0.26).toFixed(2)) };
  }
  if (controlId === 'leds') {
    return { ...params, leds: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 4, 8)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.leds !== undefined ? Math.round(Number(params.leds)) : 6;
  return { ...params, leds: ((cur - 4 + 1) % 5) + 4 };
}`,
  },

  {
    id: 'drone-gcs-dive-tower-obstacle',
    name: 'Drone Part: Multi-Ring FPV Dive Tower',
    category: 'Drone Parts & Frames',
    description: 'Vertical truss tower supporting stacked horizontal circular dive-gate hoops for 3D race tracks.',
    iconName: 'Layers',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust dive hoop width ratio or stacked dive hoops; click in Preview Mode to cycle stacked dive hoops.',
    defaultParams: {
      label: 'FPV Dive Tower',
      ringW: 0.72,
      rings: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'FPV Dive Tower' },
      { key: 'ringW', label: 'Dive Hoop Width Ratio', type: 'number', min: 0.52, max: 0.88, step: 0.01, defaultValue: 0.72 },
      { key: 'rings', label: 'Stacked Dive Hoops', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: Multi-Ring FPV Dive Tower (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2;
      const rW = clamp(Number(params.ringW) || 0.72, 0.52, 0.88) * (width / 2);
      const rings = clamp(Math.round(Number(params.rings) || 3), 2, 4);
      const paths = [
        { d: line(cx - 10, height * 0.12, cx - 14, height * 0.88), strokeWidth: 3 },
        { d: line(cx + 10, height * 0.12, cx + 14, height * 0.88), strokeWidth: 3 },
      ];
      for (let i = 0; i < rings; i++) {
        const ry = height * 0.2 + (i * height * 0.56) / Math.max(1, rings - 1);
        paths.push({ d: ellipse(cx, ry, rW, 12), closed: true, strokeWidth: 3 });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.ringW !== undefined ? Number(params.ringW) : 0.72;
  const v2 = params.rings !== undefined ? Number(params.rings) : 3;
  const p1Norm = (clamp(v1, 0.52, 0.88) - 0.52) / Math.max(0.0001, 0.36);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'ringW', label: 'Dive Hoop Width Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'rings', label: 'Stacked Dive Hoops', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'ringW') {
    return { ...params, ringW: Number(clamp(0.52 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.36, 0.52, 0.88).toFixed(2)) };
  }
  if (controlId === 'rings') {
    return { ...params, rings: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.rings !== undefined ? Math.round(Number(params.rings)) : 3;
  return { ...params, rings: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-hw-titanium-m3-bolt',
    name: 'Drone Part: Titanium Button-Head M3 Screw',
    category: 'Drone Parts & Frames',
    description: 'Grade-5 Ti-6Al-4V titanium button-head M3 screw with 2.0mm hex socket and precision rolled threads.',
    iconName: 'Wrench',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust button head width or thread pitch ridges; click in Preview Mode to cycle thread pitch ridges.',
    defaultParams: {
      label: 'Ti Grade-5 M3 Bolt',
      headW: 0.64,
      threads: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Ti Grade-5 M3 Bolt' },
      { key: 'headW', label: 'Button Head Width', type: 'number', min: 0.45, max: 0.82, step: 0.01, defaultValue: 0.64 },
      { key: 'threads', label: 'Thread Pitch Ridges', type: 'number', min: 4, max: 9, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Part: Titanium Button-Head M3 Screw (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2;
      const hW = clamp(Number(params.headW) || 0.64, 0.45, 0.82) * width;
      const threads = clamp(Math.round(Number(params.threads) || 6), 4, 9);
      const headY = height * 0.3, sW = hW * 0.44, botY = height * 0.88;
      const paths = [
        { d: \`M \${cx - hW / 2} \${headY} A \${hW / 2} \${height * 0.18} 0 0 1 \${cx + hW / 2} \${headY} Z\`, closed: true, fill: true },
        { d: rect(cx - 8, headY - 12, 16, 6), closed: true },
        { d: roundRect(cx - sW / 2, headY, sW, botY - headY, 4), closed: true, fill: true },
      ];
      for (let t = 0; t < threads; t++) {
        const ty = headY + 10 + (t * (botY - headY - 18)) / Math.max(1, threads - 1);
        paths.push({ d: line(cx - sW / 2 - 3, ty - 2, cx + sW / 2 + 3, ty + 2), strokeWidth: 2 });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.headW !== undefined ? Number(params.headW) : 0.64;
  const v2 = params.threads !== undefined ? Number(params.threads) : 6;
  const p1Norm = (clamp(v1, 0.45, 0.82) - 0.45) / Math.max(0.0001, 0.37);
  const p2Norm = (clamp(v2, 4, 9) - 4) / Math.max(0.0001, 5);
  return [
    { id: 'headW', label: 'Button Head Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'threads', label: 'Thread Pitch Ridges', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'headW') {
    return { ...params, headW: Number(clamp(0.45 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.37, 0.45, 0.82).toFixed(2)) };
  }
  if (controlId === 'threads') {
    return { ...params, threads: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 5, 4, 9)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.threads !== undefined ? Math.round(Number(params.threads)) : 6;
  return { ...params, threads: ((cur - 4 + 1) % 6) + 4 };
}`,
  },

  {
    id: 'drone-hw-aluminum-locknut',
    name: 'Drone Part: Flanged Serrated M3 Locknut',
    category: 'Drone Parts & Frames',
    description: '7075 aluminum nylon-insert locknut with wide serrated anti-vibration bottom flange.',
    iconName: 'Hexagon',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust serrated flange width or flange grip teeth; click in Preview Mode to cycle flange grip teeth.',
    defaultParams: {
      label: 'Flanged M3 Locknut',
      flangeW: 0.78,
      serrations: 7,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Flanged M3 Locknut' },
      { key: 'flangeW', label: 'Serrated Flange Width', type: 'number', min: 0.58, max: 0.92, step: 0.01, defaultValue: 0.78 },
      { key: 'serrations', label: 'Flange Grip Teeth', type: 'number', min: 5, max: 10, step: 1, defaultValue: 7 },
    ],
    jsSourceCode: `// Drone Part: Flanged Serrated M3 Locknut (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const fW = clamp(Number(params.flangeW) || 0.78, 0.58, 0.92) * width;
      const serr = clamp(Math.round(Number(params.serrations) || 7), 5, 10);
      const bW = fW * 0.72, fY = height * 0.68;
      const paths = [
        { d: \`M \${cx - bW * 0.42} \${height * 0.34} A \${bW * 0.42} \${height * 0.18} 0 0 1 \${cx + bW * 0.42} \${height * 0.34} Z\`, closed: true, fill: true },
        { d: rect(cx - bW / 2, height * 0.34, bW, fY - height * 0.34), closed: true, fill: true },
        { d: line(cx - bW * 0.18, height * 0.34, cx - bW * 0.18, fY) },
        { d: line(cx + bW * 0.18, height * 0.34, cx + bW * 0.18, fY) },
        { d: roundRect(cx - fW / 2, fY, fW, 12, 3), closed: true, fill: true },
      ];
      for (let s = 0; s < serr; s++) {
        const sx = cx - fW * 0.44 + (s * fW * 0.88) / Math.max(1, serr - 1);
        paths.push({ d: line(sx, fY + 12, sx - 3, fY + 16), strokeWidth: 2 });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.flangeW !== undefined ? Number(params.flangeW) : 0.78;
  const v2 = params.serrations !== undefined ? Number(params.serrations) : 7;
  const p1Norm = (clamp(v1, 0.58, 0.92) - 0.58) / Math.max(0.0001, 0.34);
  const p2Norm = (clamp(v2, 5, 10) - 5) / Math.max(0.0001, 5);
  return [
    { id: 'flangeW', label: 'Serrated Flange Width', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'serrations', label: 'Flange Grip Teeth', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'flangeW') {
    return { ...params, flangeW: Number(clamp(0.58 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.34, 0.58, 0.92).toFixed(2)) };
  }
  if (controlId === 'serrations') {
    return { ...params, serrations: Math.round(clamp(5 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 5, 5, 10)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.serrations !== undefined ? Math.round(Number(params.serrations)) : 7;
  return { ...params, serrations: ((cur - 5 + 1) % 6) + 5 };
}`,
  },

  {
    id: 'drone-hw-solder-braid-shield',
    name: 'Drone Part: Braided PET Expandable Wire Sleeve',
    category: 'Drone Parts & Frames',
    description: 'Expandable woven PET braided arm wire mesh sleeve terminated with adhesive-lined heat-shrink tubing.',
    iconName: 'Link',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust sleeve diameter ratio or diamond weave crosses; click in Preview Mode to cycle diamond weave crosses.',
    defaultParams: {
      label: 'Braided Wire Sleeve',
      sleeveH: 0.42,
      weaves: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Braided Wire Sleeve' },
      { key: 'sleeveH', label: 'Sleeve Diameter Ratio', type: 'number', min: 0.28, max: 0.58, step: 0.01, defaultValue: 0.42 },
      { key: 'weaves', label: 'Diamond Weave Crosses', type: 'number', min: 4, max: 8, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Part: Braided PET Expandable Wire Sleeve (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const sH = clamp(Number(params.sleeveH) || 0.42, 0.28, 0.58) * height;
      const weaves = clamp(Math.round(Number(params.weaves) || 6), 4, 8);
      const x0 = width * 0.18, x1 = width * 0.82, w = x1 - x0;
      const paths = [
        { d: roundRect(width * 0.08, cy - sH * 0.42, x0 - width * 0.08, sH * 0.84, 3), closed: true, fill: true },
        { d: roundRect(x1, cy - sH * 0.42, width * 0.92 - x1, sH * 0.84, 3), closed: true, fill: true },
        { d: rect(x0, cy - sH / 2, w, sH), closed: true, fill: true },
      ];
      for (let i = 0; i < weaves; i++) {
        const wx = x0 + (i * w) / weaves, nw = w / weaves;
        paths.push({ d: line(wx, cy - sH / 2, wx + nw, cy + sH / 2) });
        paths.push({ d: line(wx, cy + sH / 2, wx + nw, cy - sH / 2) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.sleeveH !== undefined ? Number(params.sleeveH) : 0.42;
  const v2 = params.weaves !== undefined ? Number(params.weaves) : 6;
  const p1Norm = (clamp(v1, 0.28, 0.58) - 0.28) / Math.max(0.0001, 0.3);
  const p2Norm = (clamp(v2, 4, 8) - 4) / Math.max(0.0001, 4);
  return [
    { id: 'sleeveH', label: 'Sleeve Diameter Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'weaves', label: 'Diamond Weave Crosses', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'sleeveH') {
    return { ...params, sleeveH: Number(clamp(0.28 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.3, 0.28, 0.58).toFixed(2)) };
  }
  if (controlId === 'weaves') {
    return { ...params, weaves: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 4, 8)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.weaves !== undefined ? Math.round(Number(params.weaves)) : 6;
  return { ...params, weaves: ((cur - 4 + 1) % 5) + 4 };
}`,
  },

  {
    id: 'drone-hw-ferrite-emi-ring',
    name: 'Drone Part: Toroidal Ferrite EMI Choke Ring',
    category: 'Drone Parts & Frames',
    description: 'Toroidal MnZn ferrite EMI suppression core with multi-turn wrapped VTX/ESC power leads.',
    iconName: 'CircleDot',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust inner toroid bore or wrapped wire turns; click in Preview Mode to cycle wrapped wire turns.',
    defaultParams: {
      label: 'Ferrite EMI Ring',
      coreRatio: 0.48,
      turns: 5,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Ferrite EMI Ring' },
      { key: 'coreRatio', label: 'Inner Toroid Bore', type: 'number', min: 0.34, max: 0.62, step: 0.01, defaultValue: 0.48 },
      { key: 'turns', label: 'Wrapped Wire Turns', type: 'number', min: 3, max: 7, step: 1, defaultValue: 5 },
    ],
    jsSourceCode: `// Drone Part: Toroidal Ferrite EMI Choke Ring (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.42;
      const inR = clamp(Number(params.coreRatio) || 0.48, 0.34, 0.62) * r;
      const turns = clamp(Math.round(Number(params.turns) || 5), 3, 7);
      const paths = [
        { d: circle(cx, cy, r), closed: true, fill: true },
        { d: circle(cx, cy, inR), closed: true },
      ];
      for (let t = 0; t < turns; t++) {
        const a = (t * Math.PI * 2) / turns;
        paths.push({ d: line(cx + Math.cos(a) * (inR * 0.88), cy + Math.sin(a) * (inR * 0.88), cx + Math.cos(a + 0.15) * (r * 1.06), cy + Math.sin(a + 0.15) * (r * 1.06)), strokeWidth: 3.5 });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.coreRatio !== undefined ? Number(params.coreRatio) : 0.48;
  const v2 = params.turns !== undefined ? Number(params.turns) : 5;
  const p1Norm = (clamp(v1, 0.34, 0.62) - 0.34) / Math.max(0.0001, 0.28);
  const p2Norm = (clamp(v2, 3, 7) - 3) / Math.max(0.0001, 4);
  return [
    { id: 'coreRatio', label: 'Inner Toroid Bore', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'turns', label: 'Wrapped Wire Turns', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'coreRatio') {
    return { ...params, coreRatio: Number(clamp(0.34 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.28, 0.34, 0.62).toFixed(2)) };
  }
  if (controlId === 'turns') {
    return { ...params, turns: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 3, 7)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.turns !== undefined ? Math.round(Number(params.turns)) : 5;
  return { ...params, turns: ((cur - 3 + 1) % 5) + 3 };
}`,
  },

  {
    id: 'drone-hw-jst-sh-harness',
    name: 'Drone Part: 8-Pin JST-SH 1.0mm FC-to-ESC Harness',
    category: 'Drone Parts & Frames',
    description: 'Plug-and-play 8-pin JST-SH 1.0mm silicone ribbon harness linking 4-in-1 ESC (M1..M4/VBAT/CURR) to FC.',
    iconName: 'GitCommit',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust jst plug width ratio or silicone signal wires; click in Preview Mode to cycle silicone signal wires.',
    defaultParams: {
      label: '8-Pin FC/ESC Harness',
      plugW: 0.22,
      wires: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '8-Pin FC/ESC Harness' },
      { key: 'plugW', label: 'JST Plug Width Ratio', type: 'number', min: 0.16, max: 0.3, step: 0.01, defaultValue: 0.22 },
      { key: 'wires', label: 'Silicone Signal Wires', type: 'number', min: 4, max: 8, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Part: 8-Pin JST-SH 1.0mm FC-to-ESC Harness (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cy = height / 2;
      const pW = clamp(Number(params.plugW) || 0.22, 0.16, 0.3) * width;
      const wires = clamp(Math.round(Number(params.wires) || 6), 4, 8);
      const pH = height * 0.62, lx = width * 0.08, rx = width * 0.92 - pW;
      const paths = [
        { d: roundRect(lx, cy - pH / 2, pW, pH, 4), closed: true, fill: true },
        { d: roundRect(rx, cy - pH / 2, pW, pH, 4), closed: true, fill: true },
      ];
      for (let w = 0; w < wires; w++) {
        const wy = cy - pH * 0.38 + (w * pH * 0.76) / Math.max(1, wires - 1);
        paths.push({ d: line(lx + pW, wy, rx, wy), strokeWidth: 2 });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.plugW !== undefined ? Number(params.plugW) : 0.22;
  const v2 = params.wires !== undefined ? Number(params.wires) : 6;
  const p1Norm = (clamp(v1, 0.16, 0.3) - 0.16) / Math.max(0.0001, 0.14);
  const p2Norm = (clamp(v2, 4, 8) - 4) / Math.max(0.0001, 4);
  return [
    { id: 'plugW', label: 'JST Plug Width Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'wires', label: 'Silicone Signal Wires', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'plugW') {
    return { ...params, plugW: Number(clamp(0.16 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.14, 0.16, 0.3).toFixed(2)) };
  }
  if (controlId === 'wires') {
    return { ...params, wires: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 4, 4, 8)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.wires !== undefined ? Math.round(Number(params.wires)) : 6;
  return { ...params, wires: ((cur - 4 + 1) % 5) + 4 };
}`,
  },

  {
    id: 'drone-hw-u-fl-retainer-clip',
    name: 'Drone Part: Metal U.FL Antenna Locking Clip',
    category: 'Drone Parts & Frames',
    description: 'Stamped spring-steel U.FL / IPEX antenna locking bridge clip preventing coax ejection in crashes.',
    iconName: 'Lock',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust bridge arch height or hold-down prongs; click in Preview Mode to cycle hold-down prongs.',
    defaultParams: {
      label: 'U.FL Retainer Clip',
      archH: 0.54,
      tabs: 2,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'U.FL Retainer Clip' },
      { key: 'archH', label: 'Bridge Arch Height', type: 'number', min: 0.36, max: 0.72, step: 0.01, defaultValue: 0.54 },
      { key: 'tabs', label: 'Hold-Down Prongs', type: 'number', min: 2, max: 4, step: 1, defaultValue: 2 },
    ],
    jsSourceCode: `// Drone Part: Metal U.FL Antenna Locking Clip (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const aH = clamp(Number(params.archH) || 0.54, 0.36, 0.72) * height;
      const tabs = clamp(Math.round(Number(params.tabs) || 2), 2, 4);
      const bW = width * 0.76, footY = cy + aH / 2, topY = cy - aH / 2;
      const paths = [
        { d: circle(cx, cy + 4, 14), closed: true, fill: true },
        { d: \`M \${cx - bW / 2} \${footY} L \${cx - bW * 0.28} \${footY} L \${cx - bW * 0.22} \${topY} L \${cx + bW * 0.22} \${topY} L \${cx + bW * 0.28} \${footY} L \${cx + bW / 2} \${footY}\`, strokeWidth: 4 },
      ];
      for (let t = 0; t < tabs; t++) {
        const tx = cx - bW * 0.16 + (t * bW * 0.32) / Math.max(1, tabs - 1);
        paths.push({ d: rect(tx - 3, topY, 6, 10), closed: true, fill: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.archH !== undefined ? Number(params.archH) : 0.54;
  const v2 = params.tabs !== undefined ? Number(params.tabs) : 2;
  const p1Norm = (clamp(v1, 0.36, 0.72) - 0.36) / Math.max(0.0001, 0.36);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'archH', label: 'Bridge Arch Height', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'tabs', label: 'Hold-Down Prongs', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'archH') {
    return { ...params, archH: Number(clamp(0.36 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.36, 0.36, 0.72).toFixed(2)) };
  }
  if (controlId === 'tabs') {
    return { ...params, tabs: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.tabs !== undefined ? Math.round(Number(params.tabs)) : 2;
  return { ...params, tabs: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-hw-conformal-coat-bottle',
    name: 'Drone Part: Silicone Conformal Coating & UV Light',
    category: 'Drone Parts & Frames',
    description: 'MG Chemicals 422C silicone waterproofing bottle with applicator brush and UV cure inspection beam.',
    iconName: 'Droplet',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust bottle width ratio or uv inspection rays; click in Preview Mode to cycle uv inspection rays.',
    defaultParams: {
      label: 'Conformal Coat + UV',
      bottleW: 0.36,
      rays: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Conformal Coat + UV' },
      { key: 'bottleW', label: 'Bottle Width Ratio', type: 'number', min: 0.28, max: 0.48, step: 0.01, defaultValue: 0.36 },
      { key: 'rays', label: 'UV Inspection Rays', type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: Silicone Conformal Coating & UV Light (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const bW = clamp(Number(params.bottleW) || 0.36, 0.28, 0.48) * width;
      const rays = clamp(Math.round(Number(params.rays) || 4), 3, 6);
      const bx = width * 0.12, by = height * 0.34, bH = height * 0.52;
      const paths = [
        { d: roundRect(bx, by, bW, bH, 6), closed: true, fill: true },
        { d: rect(bx + bW * 0.28, by - 16, bW * 0.44, 16), closed: true, fill: true },
        { d: rect(bx + 6, by + 12, bW - 12, bH * 0.45), closed: true },
        { d: roundRect(width * 0.64, height * 0.16, 20, 32, 4), closed: true, fill: true },
      ];
      for (let r = 0; r < rays; r++) {
        const tx = width * 0.54 + r * 12;
        paths.push({ d: line(width * 0.74, height * 0.48, tx, height * 0.84), strokeDasharray: '4 2' });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.bottleW !== undefined ? Number(params.bottleW) : 0.36;
  const v2 = params.rays !== undefined ? Number(params.rays) : 4;
  const p1Norm = (clamp(v1, 0.28, 0.48) - 0.28) / Math.max(0.0001, 0.2);
  const p2Norm = (clamp(v2, 3, 6) - 3) / Math.max(0.0001, 3);
  return [
    { id: 'bottleW', label: 'Bottle Width Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'rays', label: 'UV Inspection Rays', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'bottleW') {
    return { ...params, bottleW: Number(clamp(0.28 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.2, 0.28, 0.48).toFixed(2)) };
  }
  if (controlId === 'rays') {
    return { ...params, rays: Math.round(clamp(3 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 3, 6)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.rays !== undefined ? Math.round(Number(params.rays)) : 4;
  return { ...params, rays: ((cur - 3 + 1) % 4) + 3 };
}`,
  },

  {
    id: 'drone-hw-hex-driver-tool',
    name: 'Drone Part: Machined 1.5mm / 2.0mm Hex Driver',
    category: 'Drone Parts & Frames',
    description: 'Hollow-lightened anodized aluminum handle with gold Titanium-Nitride (TiN) ground 2.0mm hex shaft.',
    iconName: 'Wrench',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust handle length ratio or handle grip slots; click in Preview Mode to cycle handle grip slots.',
    defaultParams: {
      label: '2.0mm TiN Hex Driver',
      handleLen: 0.48,
      slots: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '2.0mm TiN Hex Driver' },
      { key: 'handleLen', label: 'Handle Length Ratio', type: 'number', min: 0.38, max: 0.62, step: 0.01, defaultValue: 0.48 },
      { key: 'slots', label: 'Handle Grip Slots', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: Machined 1.5mm / 2.0mm Hex Driver (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cy = height / 2;
      const hL = clamp(Number(params.handleLen) || 0.48, 0.38, 0.62) * width;
      const slots = clamp(Math.round(Number(params.slots) || 3), 2, 4);
      const x0 = width * 0.08, hH = height * 0.42;
      const paths = [
        { d: roundRect(x0, cy - hH / 2, hL, hH, 8), closed: true, fill: true },
        { d: line(x0 + hL, cy, width * 0.92, cy), strokeWidth: 4.5 },
      ];
      for (let s = 0; s < slots; s++) {
        const sy = cy - hH * 0.26 + (s * hH * 0.52) / Math.max(1, slots - 1);
        paths.push({ d: roundRect(x0 + 12, sy - 2.5, hL - 24, 5, 2), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.handleLen !== undefined ? Number(params.handleLen) : 0.48;
  const v2 = params.slots !== undefined ? Number(params.slots) : 3;
  const p1Norm = (clamp(v1, 0.38, 0.62) - 0.38) / Math.max(0.0001, 0.24);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'handleLen', label: 'Handle Length Ratio', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'slots', label: 'Handle Grip Slots', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'handleLen') {
    return { ...params, handleLen: Number(clamp(0.38 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.24, 0.38, 0.62).toFixed(2)) };
  }
  if (controlId === 'slots') {
    return { ...params, slots: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.slots !== undefined ? Math.round(Number(params.slots)) : 3;
  return { ...params, slots: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-hw-prop-wrench-ratchet',
    name: 'Drone Part: Ratcheting M5 Prop Nut Wrench',
    category: 'Drone Parts & Frames',
    description: 'Double-ended 8mm/10mm ratcheting box wrench for rapid trackside M5 nylon prop nut changes.',
    iconName: 'Wrench',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust shank waist thickness or ratchet ring teeth; click in Preview Mode to cycle ratchet ring teeth.',
    defaultParams: {
      label: '8mm Ratchet Prop Wrench',
      waistH: 0.34,
      points: 8,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '8mm Ratchet Prop Wrench' },
      { key: 'waistH', label: 'Shank Waist Thickness', type: 'number', min: 0.24, max: 0.48, step: 0.01, defaultValue: 0.34 },
      { key: 'points', label: 'Ratchet Ring Teeth', type: 'number', min: 6, max: 12, step: 1, defaultValue: 8 },
    ],
    jsSourceCode: `// Drone Part: Ratcheting M5 Prop Nut Wrench (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2;
      const wH = clamp(Number(params.waistH) || 0.34, 0.24, 0.48) * height;
      const pts = clamp(Math.round(Number(params.points) || 8), 6, 12);
      const lx = width * 0.24, rx = width * 0.76, r = height * 0.32;
      const paths = [
        { d: roundRect(lx, cy - wH / 2, rx - lx, wH, 4), closed: true, fill: true },
        { d: circle(lx, cy, r), closed: true, fill: true },
        { d: circle(rx, cy, r * 0.88), closed: true, fill: true },
        { d: circle(lx, cy, r * 0.52), closed: true },
        { d: circle(rx, cy, r * 0.45), closed: true },
      ];
      for (let p = 0; p < pts; p++) {
        const a = (p * Math.PI * 2) / pts;
        paths.push({ d: line(lx + Math.cos(a) * r * 0.52, cy + Math.sin(a) * r * 0.52, lx + Math.cos(a) * r * 0.68, cy + Math.sin(a) * r * 0.68) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.waistH !== undefined ? Number(params.waistH) : 0.34;
  const v2 = params.points !== undefined ? Number(params.points) : 8;
  const p1Norm = (clamp(v1, 0.24, 0.48) - 0.24) / Math.max(0.0001, 0.24);
  const p2Norm = (clamp(v2, 6, 12) - 6) / Math.max(0.0001, 6);
  return [
    { id: 'waistH', label: 'Shank Waist Thickness', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'points', label: 'Ratchet Ring Teeth', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'waistH') {
    return { ...params, waistH: Number(clamp(0.24 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.24, 0.24, 0.48).toFixed(2)) };
  }
  if (controlId === 'points') {
    return { ...params, points: Math.round(clamp(6 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 6, 6, 12)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.points !== undefined ? Math.round(Number(params.points)) : 8;
  return { ...params, points: ((cur - 6 + 1) % 7) + 6 };
}`,
  },

  {
    id: 'drone-hw-portable-soldering-iron',
    name: 'Drone Part: TS101 / Pinecil USB-C Soldering Iron',
    category: 'Drone Parts & Frames',
    description: 'Field-ready 65W USB-C PD digital soldering iron with OLED temperature display and conical chisel tip.',
    iconName: 'Zap',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust handle body length or temp adjust buttons; click in Preview Mode to cycle temp adjust buttons.',
    defaultParams: {
      label: 'USB-C Field Iron',
      bodyLen: 0.56,
      buttons: 2,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'USB-C Field Iron' },
      { key: 'bodyLen', label: 'Handle Body Length', type: 'number', min: 0.45, max: 0.68, step: 0.01, defaultValue: 0.56 },
      { key: 'buttons', label: 'Temp Adjust Buttons', type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
    ],
    jsSourceCode: `// Drone Part: TS101 / Pinecil USB-C Soldering Iron (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cy = height / 2;
      const bL = clamp(Number(params.bodyLen) || 0.56, 0.45, 0.68) * width;
      const buttons = clamp(Math.round(Number(params.buttons) || 2), 1, 3);
      const x0 = width * 0.08, bH = height * 0.32, tipX = width * 0.92;
      const paths = [
        { d: roundRect(x0, cy - bH / 2, bL, bH, 6), closed: true, fill: true },
        { d: rect(x0 + 14, cy - bH * 0.28, bL * 0.44, bH * 0.56), closed: true },
        { d: polygon([[x0 + bL, cy - 6], [tipX - 12, cy - 4], [tipX, cy], [tipX - 12, cy + 4], [x0 + bL, cy + 6]]), closed: true, fill: true },
      ];
      for (let b = 0; b < buttons; b++) {
        paths.push({ d: circle(x0 + bL * (0.64 + b * 0.1), cy, 3), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.bodyLen !== undefined ? Number(params.bodyLen) : 0.56;
  const v2 = params.buttons !== undefined ? Number(params.buttons) : 2;
  const p1Norm = (clamp(v1, 0.45, 0.68) - 0.45) / Math.max(0.0001, 0.23);
  const p2Norm = (clamp(v2, 1, 3) - 1) / Math.max(0.0001, 2);
  return [
    { id: 'bodyLen', label: 'Handle Body Length', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'buttons', label: 'Temp Adjust Buttons', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'bodyLen') {
    return { ...params, bodyLen: Number(clamp(0.45 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.23, 0.45, 0.68).toFixed(2)) };
  }
  if (controlId === 'buttons') {
    return { ...params, buttons: Math.round(clamp(1 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 1, 3)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.buttons !== undefined ? Math.round(Number(params.buttons)) : 2;
  return { ...params, buttons: ((cur - 1 + 1) % 3) + 1 };
}`,
  },

  {
    id: 'drone-hw-thrust-test-stand',
    name: 'Drone Part: Load-Cell Motor Thrust Dynamometer',
    category: 'Drone Parts & Frames',
    description: 'Precision strain-gauge load-cell motor/propeller thrust stand measuring grams of thrust, RPM, and W/g.',
    iconName: 'Gauge',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust load-cell beam span or sensor readout channels; click in Preview Mode to cycle sensor readout channels.',
    defaultParams: {
      label: 'Thrust Dynamometer',
      armLen: 0.62,
      gauges: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Thrust Dynamometer' },
      { key: 'armLen', label: 'Load-Cell Beam Span', type: 'number', min: 0.45, max: 0.78, step: 0.01, defaultValue: 0.62 },
      { key: 'gauges', label: 'Sensor Readout Channels', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: Load-Cell Motor Thrust Dynamometer (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const armL = clamp(Number(params.armLen) || 0.62, 0.45, 0.78) * width;
      const gauges = clamp(Math.round(Number(params.gauges) || 3), 2, 4);
      const x0 = width * 0.14, baseY = height * 0.82, armY = height * 0.42;
      const paths = [
        { d: roundRect(x0, baseY - 12, width * 0.72, 12, 3), closed: true, fill: true },
        { d: roundRect(x0 + 8, armY - 8, 18, baseY - armY + 8, 3), closed: true, fill: true },
        { d: roundRect(x0 + 26, armY - 6, armL - 26, 12, 3), closed: true, fill: true },
        { d: rect(x0 + armL - 8, armY - 16, 12, 32), closed: true, fill: true },
        { d: ellipse(x0 + armL + 8, armY, 6, 26), closed: true },
      ];
      for (let g = 0; g < gauges; g++) {
        paths.push({ d: circle(x0 + 42 + g * 18, armY, 3.5), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.armLen !== undefined ? Number(params.armLen) : 0.62;
  const v2 = params.gauges !== undefined ? Number(params.gauges) : 3;
  const p1Norm = (clamp(v1, 0.45, 0.78) - 0.45) / Math.max(0.0001, 0.33);
  const p2Norm = (clamp(v2, 2, 4) - 2) / Math.max(0.0001, 2);
  return [
    { id: 'armLen', label: 'Load-Cell Beam Span', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'gauges', label: 'Sensor Readout Channels', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'armLen') {
    return { ...params, armLen: Number(clamp(0.45 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.33, 0.45, 0.78).toFixed(2)) };
  }
  if (controlId === 'gauges') {
    return { ...params, gauges: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 2, 4)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.gauges !== undefined ? Math.round(Number(params.gauges)) : 3;
  return { ...params, gauges: ((cur - 2 + 1) % 3) + 2 };
}`,
  },

  {
    id: 'drone-hw-pid-step-response-chart',
    name: 'Drone Part: Blackbox PID Step Response Curve',
    category: 'Drone Parts & Frames',
    description: 'Betaflight Blackbox step-response plot comparing setpoint step input against damped P/I/D gyro trace.',
    iconName: 'Activity',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust pid overshoot peak or damped oscillations; click in Preview Mode to cycle damped oscillations.',
    defaultParams: {
      label: 'PID Step Response',
      overshoot: 0.18,
      rings: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'PID Step Response' },
      { key: 'overshoot', label: 'PID Overshoot Peak', type: 'number', min: 0.05, max: 0.38, step: 0.01, defaultValue: 0.18 },
      { key: 'rings', label: 'Damped Oscillations', type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: Blackbox PID Step Response Curve (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const ox = width * 0.12, oy = height * 0.14, gW = width * 0.76, gH = height * 0.72;
      const over = clamp(Number(params.overshoot) || 0.18, 0.05, 0.38) * gH;
      const rings = clamp(Math.round(Number(params.rings) || 3), 2, 5);
      const spY = oy + gH * 0.42, bY = oy + gH - 10;
      const pts = [[ox + 6, bY], [ox + gW * 0.18, bY]];
      for (let i = 0; i <= rings * 2; i++) {
        const px = ox + gW * 0.24 + (i * gW * 0.7) / (rings * 2);
        const amp = over * Math.pow(0.55, i);
        const py = spY + (i % 2 === 0 ? -amp : amp);
        pts.push([px, py]);
      }
      return [
        { d: roundRect(ox, oy, gW, gH, 6), closed: true, fill: true },
        { d: \`M \${ox + 6} \${bY} L \${ox + gW * 0.16} \${bY} L \${ox + gW * 0.16} \${spY} L \${ox + gW - 8} \${spY}\`, strokeDasharray: '4 3' },
        { d: \`M \${pts.map(p => p[0] + " " + p[1]).join(" L ")}\`, strokeWidth: 2.5 },
      ];
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.overshoot !== undefined ? Number(params.overshoot) : 0.18;
  const v2 = params.rings !== undefined ? Number(params.rings) : 3;
  const p1Norm = (clamp(v1, 0.05, 0.38) - 0.05) / Math.max(0.0001, 0.33);
  const p2Norm = (clamp(v2, 2, 5) - 2) / Math.max(0.0001, 3);
  return [
    { id: 'overshoot', label: 'PID Overshoot Peak', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'rings', label: 'Damped Oscillations', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'overshoot') {
    return { ...params, overshoot: Number(clamp(0.05 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.33, 0.05, 0.38).toFixed(2)) };
  }
  if (controlId === 'rings') {
    return { ...params, rings: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 2, 5)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.rings !== undefined ? Math.round(Number(params.rings)) : 3;
  return { ...params, rings: ((cur - 2 + 1) % 4) + 2 };
}`,
  },

  {
    id: 'drone-hw-betaflight-mixer-quadx',
    name: 'Drone Part: Quad-X Motor Spin & Mixer Diagram',
    category: 'Drone Parts & Frames',
    description: 'Props-In / Props-Out Quad-X motor numbering (M1..M4) and CW/CCW rotation direction reference diagram.',
    iconName: 'RefreshCw',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust motor corner spread or dir (1=in, 2=propsout); click in Preview Mode to cycle dir (1=in, 2=propsout).',
    defaultParams: {
      label: 'Quad-X Spin Diagram',
      armSpan: 0.33,
      propsOut: 2,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Quad-X Spin Diagram' },
      { key: 'armSpan', label: 'Motor Corner Spread', type: 'number', min: 0.26, max: 0.4, step: 0.01, defaultValue: 0.33 },
      { key: 'propsOut', label: 'Dir (1=In, 2=PropsOut)', type: 'number', min: 1, max: 2, step: 1, defaultValue: 2 },
    ],
    jsSourceCode: `// Drone Part: Quad-X Motor Spin & Mixer Diagram (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2;
      const span = clamp(Number(params.armSpan) || 0.33, 0.26, 0.4) * r * 2;
      const dir = clamp(Math.round(Number(params.propsOut) || 2), 1, 2);
      const propR = r * 0.24;
      const paths = [
        { d: line(cx - span, cy - span, cx + span, cy + span), strokeWidth: 3.5 },
        { d: line(cx + span, cy - span, cx - span, cy + span), strokeWidth: 3.5 },
        { d: polygon([[cx, cy - 16], [cx + 10, cy + 8], [cx - 10, cy + 8]]), closed: true, fill: true },
      ];
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx, sy], idx) => {
        const mx = cx + sx * span, my = cy + sy * span;
        paths.push({ d: circle(mx, my, propR), closed: true });
        const sign = (idx % 2 === 0 ? 1 : -1) * (dir === 2 ? 1 : -1);
        paths.push({ d: line(mx, my - propR, mx + sign * 8, my - propR - 4), strokeWidth: 2 });
      });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.armSpan !== undefined ? Number(params.armSpan) : 0.33;
  const v2 = params.propsOut !== undefined ? Number(params.propsOut) : 2;
  const p1Norm = (clamp(v1, 0.26, 0.4) - 0.26) / Math.max(0.0001, 0.14);
  const p2Norm = (clamp(v2, 1, 2) - 1) / Math.max(0.0001, 1);
  return [
    { id: 'armSpan', label: 'Motor Corner Spread', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'propsOut', label: 'Dir (1=In, 2=PropsOut)', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'armSpan') {
    return { ...params, armSpan: Number(clamp(0.26 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.14, 0.26, 0.4).toFixed(2)) };
  }
  if (controlId === 'propsOut') {
    return { ...params, propsOut: Math.round(clamp(1 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 1, 1, 2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.propsOut !== undefined ? Math.round(Number(params.propsOut)) : 2;
  return { ...params, propsOut: ((cur - 1 + 1) % 2) + 1 };
}`,
  },

  {
    id: 'drone-hw-octo-mixer-diagram',
    name: 'Drone Part: Octo-X8 Motor Spin & Mixer Diagram',
    category: 'Drone Parts & Frames',
    description: '8-motor Octocopter motor order and alternating CW/CCW torque-balanced rotation arc diagram.',
    iconName: 'Orbit',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust motor ring radius or plotted rotor nodes; click in Preview Mode to cycle plotted rotor nodes.',
    defaultParams: {
      label: 'Octo Spin Diagram',
      ringR: 0.36,
      motors: 8,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Octo Spin Diagram' },
      { key: 'ringR', label: 'Motor Ring Radius', type: 'number', min: 0.28, max: 0.42, step: 0.01, defaultValue: 0.36 },
      { key: 'motors', label: 'Plotted Rotor Nodes', type: 'number', min: 6, max: 8, step: 1, defaultValue: 8 },
    ],
    jsSourceCode: `// Drone Part: Octo-X8 Motor Spin & Mixer Diagram (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2;
      const ringR = clamp(Number(params.ringR) || 0.36, 0.28, 0.42) * r * 2;
      const motors = clamp(Math.round(Number(params.motors) || 8), 6, 8);
      const propR = r * 0.16;
      const paths = [{ d: polygon([[cx, cy - 14], [cx + 10, cy + 8], [cx - 10, cy + 8]]), closed: true, fill: true }];
      for (let i = 0; i < motors; i++) {
        const a = (i * Math.PI * 2) / motors - Math.PI / 2 + Math.PI / motors;
        const mx = cx + Math.cos(a) * ringR, my = cy + Math.sin(a) * ringR;
        paths.push({ d: line(cx, cy, mx, my), strokeWidth: 2 });
        paths.push({ d: circle(mx, my, propR), closed: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.ringR !== undefined ? Number(params.ringR) : 0.36;
  const v2 = params.motors !== undefined ? Number(params.motors) : 8;
  const p1Norm = (clamp(v1, 0.28, 0.42) - 0.28) / Math.max(0.0001, 0.14);
  const p2Norm = (clamp(v2, 6, 8) - 6) / Math.max(0.0001, 2);
  return [
    { id: 'ringR', label: 'Motor Ring Radius', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'motors', label: 'Plotted Rotor Nodes', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'ringR') {
    return { ...params, ringR: Number(clamp(0.28 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.14, 0.28, 0.42).toFixed(2)) };
  }
  if (controlId === 'motors') {
    return { ...params, motors: Math.round(clamp(6 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 2, 6, 8)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.motors !== undefined ? Math.round(Number(params.motors)) : 8;
  return { ...params, motors: ((cur - 6 + 1) % 3) + 6 };
}`,
  },

  {
    id: 'drone-hw-vtx-smartaudio-table',
    name: 'Drone Part: 5.8GHz VTX Band/Channel Matrix',
    category: 'Drone Parts & Frames',
    description: '5.8GHz VTX SmartAudio frequency table (Bands A, B, E, F, Raceband × Ch 1..8) with active channel selector.',
    iconName: 'Table',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust active band row (0-4) or active channel (1-8); click in Preview Mode to cycle active channel (1-8).',
    defaultParams: {
      label: 'VTX 40ch Band Table',
      bandRow: 4,
      chanCol: 4,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'VTX 40ch Band Table' },
      { key: 'bandRow', label: 'Active Band Row (0-4)', type: 'number', min: 0, max: 4, step: 1, defaultValue: 4 },
      { key: 'chanCol', label: 'Active Channel (1-8)', type: 'number', min: 1, max: 8, step: 1, defaultValue: 4 },
    ],
    jsSourceCode: `// Drone Part: 5.8GHz VTX Band/Channel Matrix (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const ox = width * 0.1, oy = height * 0.14, tW = width * 0.8, tH = height * 0.72;
      const bRow = clamp(Math.round((params.bandRow !== undefined ? Number(params.bandRow) : 4)), 0, 4);
      const cCol = clamp(Math.round(Number(params.chanCol) || 4), 1, 8) - 1;
      const cW = tW / 8, rH = tH / 5;
      const paths = [{ d: roundRect(ox, oy, tW, tH, 6), closed: true, fill: true }];
      for (let r = 1; r < 5; r++) paths.push({ d: line(ox, oy + r * rH, ox + tW, oy + r * rH) });
      for (let c = 1; c < 8; c++) paths.push({ d: line(ox + c * cW, oy, ox + c * cW, oy + tH) });
      paths.push({ d: rect(ox + cCol * cW + 2, oy + bRow * rH + 2, cW - 4, rH - 4), closed: true, fill: true });
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.bandRow !== undefined ? Number(params.bandRow) : 4;
  const v2 = params.chanCol !== undefined ? Number(params.chanCol) : 4;
  const p1Norm = (clamp(v1, 0, 4) - 0) / Math.max(0.0001, 4);
  const p2Norm = (clamp(v2, 1, 8) - 1) / Math.max(0.0001, 7);
  return [
    { id: 'bandRow', label: 'Active Band Row (0-4)', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'chanCol', label: 'Active Channel (1-8)', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'bandRow') {
    return { ...params, bandRow: Math.round(clamp(0 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 4, 0, 4)) };
  }
  if (controlId === 'chanCol') {
    return { ...params, chanCol: Math.round(clamp(1 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 7, 1, 8)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.chanCol !== undefined ? Math.round(Number(params.chanCol)) : 4;
  return { ...params, chanCol: ((cur - 1 + 1) % 8) + 1 };
}`,
  },

  {
    id: 'drone-hw-crsf-packet-frame',
    name: 'Drone Part: CRSF / MAVLink Telemetry Packet',
    category: 'Drone Parts & Frames',
    description: '420kbaud Crossfire (CRSF) serial protocol packet diagram: Sync | Len | Type | 16ch Payload | CRC8.',
    iconName: 'FileCode',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust payload field share or bit clock ticks; click in Preview Mode to cycle bit clock ticks.',
    defaultParams: {
      label: 'CRSF Packet Frame',
      payloadW: 0.5,
      ticks: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'CRSF Packet Frame' },
      { key: 'payloadW', label: 'Payload Field Share', type: 'number', min: 0.36, max: 0.66, step: 0.01, defaultValue: 0.5 },
      { key: 'ticks', label: 'Bit Clock Ticks', type: 'number', min: 4, max: 10, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Part: CRSF / MAVLink Telemetry Packet (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const ox = width * 0.08, cy = height / 2, fW = width * 0.84, fH = height * 0.44;
      const pShare = clamp(Number(params.payloadW) || 0.5, 0.36, 0.66);
      const ticks = clamp(Math.round(Number(params.ticks) || 6), 4, 10);
      const x1 = ox + fW * 0.12, x2 = ox + fW * 0.24, x3 = ox + fW * 0.36, x4 = x3 + fW * pShare;
      const paths = [
        { d: roundRect(ox, cy - fH / 2, fW, fH, 5), closed: true, fill: true },
        { d: line(x1, cy - fH / 2, x1, cy + fH / 2) },
        { d: line(x2, cy - fH / 2, x2, cy + fH / 2) },
        { d: line(x3, cy - fH / 2, x3, cy + fH / 2) },
        { d: line(x4, cy - fH / 2, x4, cy + fH / 2) },
      ];
      for (let t = 0; t < ticks; t++) {
        const tx = x3 + 8 + (t * (x4 - x3 - 16)) / Math.max(1, ticks - 1);
        paths.push({ d: line(tx, cy - 8, tx, cy + 8) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.payloadW !== undefined ? Number(params.payloadW) : 0.5;
  const v2 = params.ticks !== undefined ? Number(params.ticks) : 6;
  const p1Norm = (clamp(v1, 0.36, 0.66) - 0.36) / Math.max(0.0001, 0.3);
  const p2Norm = (clamp(v2, 4, 10) - 4) / Math.max(0.0001, 6);
  return [
    { id: 'payloadW', label: 'Payload Field Share', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'ticks', label: 'Bit Clock Ticks', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'payloadW') {
    return { ...params, payloadW: Number(clamp(0.36 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.3, 0.36, 0.66).toFixed(2)) };
  }
  if (controlId === 'ticks') {
    return { ...params, ticks: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 6, 4, 10)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.ticks !== undefined ? Math.round(Number(params.ticks)) : 6;
  return { ...params, ticks: ((cur - 4 + 1) % 7) + 4 };
}`,
  },

  {
    id: 'drone-hw-gnss-skyplot-radar',
    name: 'Drone Part: GNSS Satellite Skyplot Horizon',
    category: 'Drone Parts & Frames',
    description: 'Azimuth/elevation polar GNSS skyplot radar with 30°/60° rings and tracked GPS/Galileo/BeiDou satellites.',
    iconName: 'Radar',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust 60° elevation ring or tracked satellites; click in Preview Mode to cycle tracked satellites.',
    defaultParams: {
      label: 'GNSS Skyplot Radar',
      innerR: 0.4,
      sats: 6,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'GNSS Skyplot Radar' },
      { key: 'innerR', label: '60° Elevation Ring', type: 'number', min: 0.26, max: 0.56, step: 0.01, defaultValue: 0.4 },
      { key: 'sats', label: 'Tracked Satellites', type: 'number', min: 4, max: 9, step: 1, defaultValue: 6 },
    ],
    jsSourceCode: `// Drone Part: GNSS Satellite Skyplot Horizon (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.44;
      const inR = clamp(Number(params.innerR) || 0.4, 0.26, 0.56) * r;
      const sats = clamp(Math.round(Number(params.sats) || 6), 4, 9);
      const paths = [
        { d: circle(cx, cy, r), closed: true, fill: true },
        { d: circle(cx, cy, (r + inR) / 2), closed: true, strokeDasharray: '4 3' },
        { d: circle(cx, cy, inR), closed: true, strokeDasharray: '3 2' },
        { d: line(cx - r, cy, cx + r, cy) },
        { d: line(cx, cy - r, cx, cy + r) },
      ];
      for (let s = 0; s < sats; s++) {
        const a = (s * 2.15) - 0.8;
        const sr = inR * 0.5 + ((s * 17) % 10) * (r * 0.045);
        paths.push({ d: rect(cx + Math.cos(a) * sr - 3.5, cy + Math.sin(a) * sr - 3.5, 7, 7), closed: true, fill: true });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.innerR !== undefined ? Number(params.innerR) : 0.4;
  const v2 = params.sats !== undefined ? Number(params.sats) : 6;
  const p1Norm = (clamp(v1, 0.26, 0.56) - 0.26) / Math.max(0.0001, 0.3);
  const p2Norm = (clamp(v2, 4, 9) - 4) / Math.max(0.0001, 5);
  return [
    { id: 'innerR', label: '60° Elevation Ring', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'sats', label: 'Tracked Satellites', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'innerR') {
    return { ...params, innerR: Number(clamp(0.26 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.3, 0.26, 0.56).toFixed(2)) };
  }
  if (controlId === 'sats') {
    return { ...params, sats: Math.round(clamp(4 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 5, 4, 9)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.sats !== undefined ? Math.round(Number(params.sats)) : 6;
  return { ...params, sats: ((cur - 4 + 1) % 6) + 4 };
}`,
  },

  {
    id: 'drone-hw-battery-discharge-curve',
    name: 'Drone Part: LiPo vs Li-Ion Discharge Curve',
    category: 'Drone Parts & Frames',
    description: 'Cell voltage (4.2V to 3.0V) vs capacity discharge comparison showing LiPo plateau and Li-Ion deep tail.',
    iconName: 'TrendingUp',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Drag yellow handles to adjust discharge knee x or voltage reference lines; click in Preview Mode to cycle voltage reference lines.',
    defaultParams: {
      label: 'LiPo/Li-Ion Discharge',
      kneeX: 0.76,
      gridLines: 3,
    },
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'LiPo/Li-Ion Discharge' },
      { key: 'kneeX', label: 'Discharge Knee X', type: 'number', min: 0.58, max: 0.88, step: 0.01, defaultValue: 0.76 },
      { key: 'gridLines', label: 'Voltage Reference Lines', type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    jsSourceCode: `// Drone Part: LiPo vs Li-Ion Discharge Curve (.jsf)
function buildPaths(width, height, params, helpers) {
  const { rect, roundRect, circle, ellipse, line, polygon, clamp } = helpers;
      const ox = width * 0.12, oy = height * 0.14, gW = width * 0.76, gH = height * 0.72;
      const kneeX = ox + clamp(Number(params.kneeX) || 0.76, 0.58, 0.88) * gW;
      const lines = clamp(Math.round(Number(params.gridLines) || 3), 2, 5);
      const paths = [
        { d: roundRect(ox, oy, gW, gH, 6), closed: true, fill: true },
        { d: \`M \${ox + 8} \${oy + 12} Q \${ox + gW * 0.35} \${oy + gH * 0.36} \${kneeX} \${oy + gH * 0.42} Q \${ox + gW * 0.9} \${oy + gH * 0.5} \${ox + gW - 8} \${oy + gH - 10}\`, strokeWidth: 2.5 },
        { d: \`M \${ox + 8} \${oy + 12} L \${ox + gW - 8} \${oy + gH - 12}\`, strokeDasharray: '4 3' },
      ];
      for (let l = 1; l <= lines; l++) {
        const ly = oy + (l * gH) / (lines + 1);
        paths.push({ d: line(ox + 6, ly, ox + gW - 6, ly) });
      }
      return paths;
}

function getControlPoints(width, height, params, helpers) {
  const { clamp } = helpers;
  const v1 = params.kneeX !== undefined ? Number(params.kneeX) : 0.76;
  const v2 = params.gridLines !== undefined ? Number(params.gridLines) : 3;
  const p1Norm = (clamp(v1, 0.58, 0.88) - 0.58) / Math.max(0.0001, 0.3);
  const p2Norm = (clamp(v2, 2, 5) - 2) / Math.max(0.0001, 3);
  return [
    { id: 'kneeX', label: 'Discharge Knee X', x: width * 0.14 + p1Norm * width * 0.72, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'gridLines', label: 'Voltage Reference Lines', x: width * 0.88, y: height * 0.16 + p2Norm * height * 0.68, cursor: 'ns-resize' },
  ];
}

function onDragControlPoint(controlId, localX, localY, width, height, params, helpers) {
  const { clamp } = helpers;
  if (controlId === 'kneeX') {
    return { ...params, kneeX: Number(clamp(0.58 + ((localX - width * 0.14) / Math.max(1, width * 0.72)) * 0.3, 0.58, 0.88).toFixed(2)) };
  }
  if (controlId === 'gridLines') {
    return { ...params, gridLines: Math.round(clamp(2 + ((localY - height * 0.16) / Math.max(1, height * 0.68)) * 3, 2, 5)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = params.gridLines !== undefined ? Math.round(Number(params.gridLines)) : 3;
  return { ...params, gridLines: ((cur - 2 + 1) % 4) + 2 };
}`,
  },
];

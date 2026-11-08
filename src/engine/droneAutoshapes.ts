import { AutoShapeDefinition } from '../types/editor';

/**
 * OSITO STUDIO — DRONE PARTS & FRAMES AUTOSHAPES LIBRARY (.jsf)
 * 18 Parametric UAV Airframes, Carbon Chassis, Propulsion, Avionics & Sensor AutoShapes
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
];

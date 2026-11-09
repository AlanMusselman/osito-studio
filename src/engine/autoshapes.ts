import type {
  AutoShapeControlPoint,
  AutoShapeDefinition,
  AutoShapeObject,
  BezierNode,
  VectorPathObject,
} from '../types/editor';
import { WEB_LAYOUT_AND_UI_AUTOSHAPES } from './webLayoutAutoshapes';
import { SITEMAP_AND_FLOW_AUTOSHAPES } from './sitemapAndFlowAutoshapes';
import { DRONE_PARTS_AND_FRAMES_AUTOSHAPES } from './droneAutoshapes';

export const CUSTOM_AUTOSHAPES_STORAGE_KEY = 'evolve_mx_custom_autoshapes_v1';

const KAPPA = 0.5522847498;

export interface AutoShapeHelpers {
  cornerNode: (x: number, y: number, id?: string) => BezierNode;
  smoothNode: (
    x: number,
    y: number,
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    id?: string
  ) => BezierNode;
  symmetricNode: (
    x: number,
    y: number,
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    id?: string
  ) => BezierNode;
  rectPath: (x: number, y: number, w: number, h: number, r?: number) => BezierNode[];
  ellipsePath: (cx: number, cy: number, rx: number, ry: number) => BezierNode[];
  polygonPath: (points: Array<{ x: number; y: number }>, closed?: boolean) => BezierNode[];
  rect: (x: number, y: number, w: number, h: number) => BezierNode[];
  roundRect: (x: number, y: number, w: number, h: number, r?: number) => BezierNode[];
  circle: (cx: number, cy: number, r: number) => BezierNode[];
  ellipse: (cx: number, cy: number, rx: number, ry: number) => BezierNode[];
  line: (x1: number, y1: number, x2: number, y2: number) => BezierNode[];
  polygon: (points: Array<[number, number] | { x: number; y: number }>) => BezierNode[];
  arcNodes: (
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    startDeg: number,
    sweepDeg: number
  ) => BezierNode[];
  clamp: (val: number, min: number, max: number) => number;
  degToRad: (deg: number) => number;
  radToDeg: (rad: number) => number;
  lerp: (a: number, b: number, t: number) => number;
  dist: (x1: number, y1: number, x2: number, y2: number) => number;
}

/**
 * Creates a deterministic helper toolkit injected into every AutoShape JS evaluation.
 */
export function createAutoShapeHelpers(): AutoShapeHelpers {
  let nodeCounter = 0;
  const nextId = (prefix = 'n') => `${prefix}_${++nodeCounter}`;

  const clamp = (val: number, min: number, max: number): number =>
    Math.max(min, Math.min(max, Number.isFinite(val) ? val : min));

  const degToRad = (deg: number): number => (deg * Math.PI) / 180;
  const radToDeg = (rad: number): number => (rad * 180) / Math.PI;
  const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
  const dist = (x1: number, y1: number, x2: number, y2: number): number =>
    Math.hypot(x2 - x1, y2 - y1);

  const cornerNode = (x: number, y: number, id?: string): BezierNode => ({
    id: id || nextId('corner'),
    x,
    y,
    cp1x: x,
    cp1y: y,
    cp2x: x,
    cp2y: y,
    pointType: 'corner',
  });

  const smoothNode = (
    x: number,
    y: number,
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    id?: string
  ): BezierNode => ({
    id: id || nextId('smooth'),
    x,
    y,
    cp1x,
    cp1y,
    cp2x,
    cp2y,
    pointType: 'smooth',
  });

  const symmetricNode = (
    x: number,
    y: number,
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    id?: string
  ): BezierNode => ({
    id: id || nextId('sym'),
    x,
    y,
    cp1x,
    cp1y,
    cp2x,
    cp2y,
    pointType: 'symmetric',
  });

  const rectPath = (x: number, y: number, w: number, h: number, r = 0): BezierNode[] => {
    const maxR = Math.max(0, Math.min(Math.abs(w) / 2, Math.abs(h) / 2));
    const cr = clamp(r || 0, 0, maxR);
    if (cr <= 0.5) {
      return [
        cornerNode(x, y, nextId('rect_tl')),
        cornerNode(x + w, y, nextId('rect_tr')),
        cornerNode(x + w, y + h, nextId('rect_br')),
        cornerNode(x, y + h, nextId('rect_bl')),
      ];
    }
    const k = cr * KAPPA;
    return [
      smoothNode(x + cr, y, x + cr - k, y, x + cr, y, nextId('rrect_t1')),
      smoothNode(x + w - cr, y, x + w - cr, y, x + w - cr + k, y, nextId('rrect_t2')),
      smoothNode(x + w, y + cr, x + w, y + cr - k, x + w, y + cr, nextId('rrect_r1')),
      smoothNode(
        x + w,
        y + h - cr,
        x + w,
        y + h - cr,
        x + w,
        y + h - cr + k,
        nextId('rrect_r2')
      ),
      smoothNode(
        x + w - cr,
        y + h,
        x + w - cr + k,
        y + h,
        x + w - cr,
        y + h,
        nextId('rrect_b1')
      ),
      smoothNode(x + cr, y + h, x + cr, y + h, x + cr - k, y + h, nextId('rrect_b2')),
      smoothNode(x, y + h - cr, x, y + h - cr + k, x, y + h - cr, nextId('rrect_l1')),
      smoothNode(x, y + cr, x, y + cr, x, y + cr - k, nextId('rrect_l2')),
    ];
  };

  const ellipsePath = (cx: number, cy: number, rx: number, ry: number): BezierNode[] => {
    const ox = rx * KAPPA;
    const oy = ry * KAPPA;
    return [
      smoothNode(cx, cy - ry, cx - ox, cy - ry, cx + ox, cy - ry, nextId('el_top')),
      smoothNode(cx + rx, cy, cx + rx, cy - oy, cx + rx, cy + oy, nextId('el_right')),
      smoothNode(cx, cy + ry, cx + ox, cy + ry, cx - ox, cy + ry, nextId('el_bottom')),
      smoothNode(cx - rx, cy, cx - rx, cy + oy, cx - rx, cy - oy, nextId('el_left')),
    ];
  };

  const polygonPath = (
    points: Array<{ x: number; y: number }>,
    _closed = true
  ): BezierNode[] => {
    return points.map((pt, idx) => cornerNode(pt.x, pt.y, nextId(`poly_${idx}`)));
  };

  const rect = (x: number, y: number, w: number, h: number): BezierNode[] =>
    rectPath(x, y, w, h, 0);

  const roundRect = (x: number, y: number, w: number, h: number, r = 0): BezierNode[] =>
    rectPath(x, y, w, h, r);

  const circle = (cx: number, cy: number, r: number): BezierNode[] =>
    ellipsePath(cx, cy, r, r);

  const ellipse = (cx: number, cy: number, rx: number, ry: number): BezierNode[] =>
    ellipsePath(cx, cy, rx, ry);

  const line = (x1: number, y1: number, x2: number, y2: number): BezierNode[] => [
    cornerNode(x1, y1, nextId('ln_a')),
    cornerNode(x2, y2, nextId('ln_b')),
  ];

  const polygon = (
    points: Array<[number, number] | { x: number; y: number }>
  ): BezierNode[] =>
    points.map((pt, idx) =>
      Array.isArray(pt)
        ? cornerNode(pt[0], pt[1], nextId(`poly_${idx}`))
        : cornerNode(pt.x, pt.y, nextId(`poly_${idx}`))
    );

  /**
   * Approximates an elliptical arc of arbitrary sweep angle using cubic Bezier segments
   * (max 90 deg per segment).
   */
  const arcNodes = (
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    startDeg: number,
    sweepDeg: number
  ): BezierNode[] => {
    const totalRad = degToRad(sweepDeg);
    const startRad = degToRad(startDeg);
    const segments = Math.max(1, Math.ceil(Math.abs(totalRad) / (Math.PI / 2)));
    const delta = totalRad / segments;
    const nodes: BezierNode[] = [];

    for (let i = 0; i <= segments; i++) {
      const theta = startRad + i * delta;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      const x = cx + rx * cosT;
      const y = cy + ry * sinT;

      // Tangent factor for cubic Bezier arc segment
      const alpha = (4 / 3) * Math.tan(delta / 4);
      const tx = -rx * sinT * alpha;
      const ty = ry * cosT * alpha;

      const cp1x = i === 0 ? x : x - tx;
      const cp1y = i === 0 ? y : y - ty;
      const cp2x = i === segments ? x : x + tx;
      const cp2y = i === segments ? y : y + ty;

      nodes.push(smoothNode(x, y, cp1x, cp1y, cp2x, cp2y, nextId(`arc_${i}`)));
    }
    return nodes;
  };

  return {
    cornerNode,
    smoothNode,
    symmetricNode,
    rectPath,
    ellipsePath,
    polygonPath,
    rect,
    roundRect,
    circle,
    ellipse,
    line,
    polygon,
    arcNodes,
    clamp,
    degToRad,
    radToDeg,
    lerp,
    dist,
  };
}

/**
 * 16 Built-In Osito Programmable Smart AutoShapes (.jsf style)
 */
const RAW_DEFAULT_AUTOSHAPES: AutoShapeDefinition[] = [
  // 1. Smart Rounded / Chamfered Rectangle
  {
    id: 'rounded-rect',
    name: 'Smart Rounded Rectangle',
    category: 'Creative & Vector',
    description:
      'Osito signature Smart Rectangle with live yellow diamond corner radius handle and chamfer toggle.',
    iconName: 'RectangleHorizontal',
    isBuiltIn: true,
    paramSchema: [
      {
        key: 'radius',
        label: 'Corner Radius (px)',
        type: 'number',
        min: 0,
        max: 200,
        step: 1,
        defaultValue: 24,
      },
      {
        key: 'chamfer',
        label: 'Chamfer Corners',
        type: 'boolean',
        defaultValue: false,
      },
    ],
    defaultParams: {
      radius: 24,
      chamfer: false,
    },
    jsSourceCode: `// Osito Smart Rounded / Chamfered Rectangle (.jsf)
function getControlPoints(width, height, params, helpers) {
  const maxR = Math.min(width, height) / 2;
  const r = helpers.clamp(Number(params.radius) || 0, 0, maxR);
  return [
    {
      id: 'radius',
      label: params.chamfer ? \`Chamfer: \${Math.round(r)}px\` : \`Radius: \${Math.round(r)}px\`,
      x: r,
      y: 0,
      cursor: 'ew-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'radius') {
    const maxR = Math.min(width, height) / 2;
    const raw = Math.max(localX, localY * 0.5);
    return {
      ...params,
      radius: Math.round(helpers.clamp(raw, 0, maxR))
    };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const maxR = Math.min(width, height) / 2;
  const r = helpers.clamp(Number(params.radius) || 0, 0, maxR);

  if (params.chamfer && r > 0.5) {
    const pts = [
      { x: r, y: 0 },
      { x: width - r, y: 0 },
      { x: width, y: r },
      { x: width, y: height - r },
      { x: width - r, y: height },
      { x: r, y: height },
      { x: 0, y: height - r },
      { x: 0, y: r }
    ];
    return [{ nodes: helpers.polygonPath(pts), closed: true }];
  }

  return [
    {
      nodes: helpers.rectPath(0, 0, width, height, r),
      closed: true
    }
  ];
}`,
  },

  // 2. Smart Star / Burst
  {
    id: 'star',
    name: 'Smart Star / Burst',
    category: 'Creative & Vector',
    description:
      'Parametric star & badge burst with dual yellow diamond handles for inner valley depth, point count, and twist.',
    iconName: 'Star',
    isBuiltIn: true,
    paramSchema: [
      {
        key: 'points',
        label: 'Star Points',
        type: 'number',
        min: 3,
        max: 24,
        step: 1,
        defaultValue: 5,
      },
      {
        key: 'innerRadiusRatio',
        label: 'Inner Radius Ratio',
        type: 'number',
        min: 0.1,
        max: 0.95,
        step: 0.01,
        defaultValue: 0.42,
      },
      {
        key: 'twistAngle',
        label: 'Valley Twist (deg)',
        type: 'number',
        min: -60,
        max: 60,
        step: 1,
        defaultValue: 0,
      },
    ],
    defaultParams: {
      points: 5,
      innerRadiusRatio: 0.42,
      twistAngle: 0,
    },
    jsSourceCode: `// Osito Smart Star / Burst (.jsf)
function getControlPoints(width, height, params, helpers) {
  const cx = width / 2;
  const cy = height / 2;
  const rx = width / 2;
  const ry = height / 2;
  const pts = Math.round(helpers.clamp(Number(params.points) || 5, 3, 24));
  const rawInner = params.innerRadiusRatio ?? params.innerRatio ?? 0.42;
  const innerRatio = helpers.clamp(Number(rawInner) || 0.42, 0.1, 0.95);
  const twistRad = helpers.degToRad(Number(params.twistAngle) || 0);

  // First valley angle
  const valleyAngle = -Math.PI / 2 + Math.PI / pts + twistRad;
  const vx = cx + Math.cos(valleyAngle) * rx * innerRatio;
  const vy = cy + Math.sin(valleyAngle) * ry * innerRatio;

  // Point-count slider handle along top edge
  const pointSliderX = helpers.lerp(width * 0.15, width * 0.85, (pts - 3) / 21);

  return [
    {
      id: 'innerRadius',
      label: \`Depth: \${Math.round(innerRatio * 100)}%\`,
      x: vx,
      y: vy,
      cursor: 'crosshair'
    },
    {
      id: 'points',
      label: \`Points: \${pts}\`,
      x: pointSliderX,
      y: 8,
      cursor: 'ew-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.max(10, Math.min(width, height) / 2);

  if (id === 'innerRadius') {
    const d = helpers.dist(cx, cy, localX, localY);
    const ratio = helpers.clamp(d / maxR, 0.1, 0.95);
    return {
      ...params,
      innerRadiusRatio: Number(ratio.toFixed(2)),
      innerRatio: Number(ratio.toFixed(2))
    };
  }

  if (id === 'points') {
    const t = helpers.clamp((localX - width * 0.15) / (width * 0.7), 0, 1);
    const pts = Math.round(3 + t * 21);
    return {
      ...params,
      points: helpers.clamp(pts, 3, 24)
    };
  }

  return params;
}

function buildPaths(width, height, params, helpers) {
  const cx = width / 2;
  const cy = height / 2;
  const rx = width / 2;
  const ry = height / 2;
  const pts = Math.round(helpers.clamp(Number(params.points) || 5, 3, 24));
  const rawInner = params.innerRadiusRatio ?? params.innerRatio ?? 0.42;
  const innerRatio = helpers.clamp(Number(rawInner) || 0.42, 0.1, 0.95);
  const twistRad = helpers.degToRad(Number(params.twistAngle) || 0);

  const vertices = [];
  const step = Math.PI / pts;
  for (let i = 0; i < pts * 2; i++) {
    const isOuter = i % 2 === 0;
    const angle = -Math.PI / 2 + i * step + (isOuter ? 0 : twistRad);
    const rFactor = isOuter ? 1 : innerRatio;
    vertices.push({
      x: cx + Math.cos(angle) * rx * rFactor,
      y: cy + Math.sin(angle) * ry * rFactor
    });
  }

  return [{ nodes: helpers.polygonPath(vertices), closed: true }];
}`,
  },

  // 3. Smart Block Arrow
  {
    id: 'smart-arrow',
    name: 'Smart Block Arrow',
    category: 'Flow & Diagrams',
    description:
      'Directional block arrow with independent yellow diamond handles for arrowhead length, shaft thickness, and double-headed mode.',
    iconName: 'ArrowRight',
    isBuiltIn: true,
    paramSchema: [
      {
        key: 'headLengthRatio',
        label: 'Head Length Ratio',
        type: 'number',
        min: 0.15,
        max: 0.85,
        step: 0.01,
        defaultValue: 0.36,
      },
      {
        key: 'shaftWidthRatio',
        label: 'Shaft Width Ratio',
        type: 'number',
        min: 0.15,
        max: 0.85,
        step: 0.01,
        defaultValue: 0.44,
      },
      {
        key: 'doubleHeaded',
        label: 'Double-Headed Arrow',
        type: 'boolean',
        defaultValue: false,
      },
    ],
    defaultParams: {
      headLengthRatio: 0.36,
      shaftWidthRatio: 0.44,
      doubleHeaded: false,
    },
    jsSourceCode: `// Osito Smart Block Arrow (.jsf)
function getControlPoints(width, height, params, helpers) {
  const headRatio = helpers.clamp(Number(params.headLengthRatio) || 0.36, 0.15, 0.85);
  const shaftRatio = helpers.clamp(Number(params.shaftWidthRatio) || 0.44, 0.15, 0.85);

  const headX = width * (1 - headRatio);
  const shaftTopY = height * (0.5 - shaftRatio / 2);

  return [
    {
      id: 'headLength',
      label: \`Head: \${Math.round(headRatio * 100)}%\`,
      x: headX,
      y: 0,
      cursor: 'ew-resize'
    },
    {
      id: 'shaftWidth',
      label: \`Shaft: \${Math.round(shaftRatio * 100)}%\`,
      x: headX * 0.5,
      y: shaftTopY,
      cursor: 'ns-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'headLength') {
    const maxRatio = params.doubleHeaded ? 0.45 : 0.85;
    const ratio = helpers.clamp(1 - localX / Math.max(1, width), 0.15, maxRatio);
    return {
      ...params,
      headLengthRatio: Number(ratio.toFixed(2))
    };
  }
  if (id === 'shaftWidth') {
    const distFromCenter = Math.abs(localY - height / 2);
    const ratio = helpers.clamp((distFromCenter * 2) / Math.max(1, height), 0.15, 0.85);
    return {
      ...params,
      shaftWidthRatio: Number(ratio.toFixed(2))
    };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const doubleHead = Boolean(params.doubleHeaded);
  const maxHead = doubleHead ? 0.45 : 0.85;
  const headRatio = helpers.clamp(Number(params.headLengthRatio) || 0.36, 0.15, maxHead);
  const shaftRatio = helpers.clamp(Number(params.shaftWidthRatio) || 0.44, 0.15, 0.85);

  const rightHeadX = width * (1 - headRatio);
  const leftHeadX = doubleHead ? width * headRatio : 0;
  const topShaftY = height * (0.5 - shaftRatio / 2);
  const botShaftY = height * (0.5 + shaftRatio / 2);
  const midY = height / 2;

  const pts = doubleHead
    ? [
        { x: 0, y: midY },
        { x: leftHeadX, y: 0 },
        { x: leftHeadX, y: topShaftY },
        { x: rightHeadX, y: topShaftY },
        { x: rightHeadX, y: 0 },
        { x: width, y: midY },
        { x: rightHeadX, y: height },
        { x: rightHeadX, y: botShaftY },
        { x: leftHeadX, y: botShaftY },
        { x: leftHeadX, y: height }
      ]
    : [
        { x: 0, y: topShaftY },
        { x: rightHeadX, y: topShaftY },
        { x: rightHeadX, y: 0 },
        { x: width, y: midY },
        { x: rightHeadX, y: height },
        { x: rightHeadX, y: botShaftY },
        { x: 0, y: botShaftY }
      ];

  return [{ nodes: helpers.polygonPath(pts), closed: true }];
}`,
  },

  // 4. Smart Speech Callout
  {
    id: 'speech-callout',
    name: 'Smart Speech Callout',
    category: 'Flow & Diagrams',
    description:
      'Comic & UI annotation bubble with free-roaming yellow diamond tail tip handle, adjustable tail base width, and corner radius.',
    iconName: 'MessageSquare',
    isBuiltIn: true,
    paramSchema: [
      {
        key: 'tailXRatio',
        label: 'Tail Tip X Ratio',
        type: 'number',
        min: -0.5,
        max: 1.5,
        step: 0.01,
        defaultValue: 0.22,
      },
      {
        key: 'tailYRatio',
        label: 'Tail Tip Y Ratio',
        type: 'number',
        min: 0.85,
        max: 1.6,
        step: 0.01,
        defaultValue: 1.24,
      },
      {
        key: 'tailWidth',
        label: 'Tail Base Width (px)',
        type: 'number',
        min: 10,
        max: 80,
        step: 1,
        defaultValue: 32,
      },
      {
        key: 'cornerRadius',
        label: 'Corner Radius (px)',
        type: 'number',
        min: 0,
        max: 80,
        step: 1,
        defaultValue: 18,
      },
    ],
    defaultParams: {
      tailXRatio: 0.22,
      tailYRatio: 1.24,
      tailWidth: 32,
      cornerRadius: 18,
    },
    jsSourceCode: `// Osito Smart Speech Callout (.jsf)
function getControlPoints(width, height, params, helpers) {
  const maxR = Math.min(width, height) * 0.4;
  const r = helpers.clamp(Number(params.cornerRadius) ?? 18, 0, maxR);
  const tailX = (Number(params.tailXRatio) ?? 0.22) * width;
  const tailY = (Number(params.tailYRatio) ?? 1.24) * height;
  const tailW = helpers.clamp(Number(params.tailWidth) || 32, 10, Math.max(12, width * 0.5));
  const baseCenterX = helpers.clamp(tailX, r + tailW / 2 + 4, width - r - tailW / 2 - 4);

  return [
    {
      id: 'tailTip',
      label: 'Drag Tail Tip',
      x: tailX,
      y: tailY,
      cursor: 'move'
    },
    {
      id: 'tailWidth',
      label: \`Tail Width: \${Math.round(tailW)}px\`,
      x: baseCenterX + tailW / 2,
      y: height,
      cursor: 'ew-resize'
    },
    {
      id: 'cornerRadius',
      label: \`Radius: \${Math.round(r)}px\`,
      x: r,
      y: 0,
      cursor: 'ew-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'tailTip') {
    return {
      ...params,
      tailXRatio: Number(helpers.clamp(localX / Math.max(1, width), -0.5, 1.5).toFixed(2)),
      tailYRatio: Number(helpers.clamp(localY / Math.max(1, height), 0.85, 1.6).toFixed(2))
    };
  }
  if (id === 'tailWidth') {
    const tailX = (Number(params.tailXRatio) ?? 0.22) * width;
    const r = Number(params.cornerRadius) || 18;
    const baseCenterX = helpers.clamp(tailX, r + 16, width - r - 16);
    const newW = helpers.clamp(Math.abs(localX - baseCenterX) * 2, 10, 80);
    return {
      ...params,
      tailWidth: Math.round(newW)
    };
  }
  if (id === 'cornerRadius') {
    const maxR = Math.min(width, height) * 0.4;
    return {
      ...params,
      cornerRadius: Math.round(helpers.clamp(localX, 0, maxR))
    };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const maxR = Math.min(width, height) * 0.4;
  const r = helpers.clamp(Number(params.cornerRadius) ?? 18, 0, maxR);
  const k = r * 0.5522847498;
  const tailX = (Number(params.tailXRatio) ?? 0.22) * width;
  const tailY = (Number(params.tailYRatio) ?? 1.24) * height;
  const tailW = helpers.clamp(Number(params.tailWidth) || 32, 10, Math.max(12, width - r * 2 - 8));

  const baseCenter = helpers.clamp(tailX, r + tailW / 2 + 4, width - r - tailW / 2 - 4);
  const tailRightX = baseCenter + tailW / 2;
  const tailLeftX = baseCenter - tailW / 2;

  const nodes = [
    helpers.smoothNode(r, 0, r - k, 0, r, 0),
    helpers.smoothNode(width - r, 0, width - r, 0, width - r + k, 0),
    helpers.smoothNode(width, r, width, r - k, width, r),
    helpers.smoothNode(width, height - r, width, height - r, width, height - r + k),
    helpers.smoothNode(width - r, height, width - r + k, height, width - r, height),
    // Tail geometry along bottom edge
    helpers.cornerNode(tailRightX, height),
    helpers.cornerNode(tailX, tailY),
    helpers.cornerNode(tailLeftX, height),
    // Continue bottom-left corner
    helpers.smoothNode(r, height, r, height, r - k, height),
    helpers.smoothNode(0, height - r, 0, height - r + k, 0, height - r),
    helpers.smoothNode(0, r, 0, r, 0, r - k)
  ];

  return [{ nodes, closed: true }];
}`,
  },

  // 5. Smart Precision Gear
  {
    id: 'gear',
    name: 'Smart Precision Gear',
    category: 'Badges & Icons',
    description:
      'Involute-inspired mechanical cogwheel with yellow diamond handles for tooth count, tooth depth, and center bore shaft.',
    iconName: 'Cog',
    isBuiltIn: true,
    paramSchema: [
      {
        key: 'teeth',
        label: 'Tooth Count',
        type: 'number',
        min: 4,
        max: 24,
        step: 1,
        defaultValue: 10,
      },
      {
        key: 'toothDepth',
        label: 'Tooth Depth Ratio',
        type: 'number',
        min: 0.08,
        max: 0.35,
        step: 0.01,
        defaultValue: 0.18,
      },
      {
        key: 'holeRadiusRatio',
        label: 'Bore Hole Ratio',
        type: 'number',
        min: 0.1,
        max: 0.5,
        step: 0.01,
        defaultValue: 0.28,
      },
    ],
    defaultParams: {
      teeth: 10,
      toothDepth: 0.18,
      holeRadiusRatio: 0.28,
    },
    jsSourceCode: `// Osito Smart Precision Gear (.jsf)
function getControlPoints(width, height, params, helpers) {
  const cx = width / 2;
  const cy = height / 2;
  const rx = width / 2;
  const ry = height / 2;
  const teeth = Math.round(helpers.clamp(Number(params.teeth) || 10, 4, 24));
  const depth = helpers.clamp(Number(params.toothDepth) || 0.18, 0.08, 0.35);
  const rawHole = params.holeRadiusRatio ?? params.holeRatio ?? 0.28;
  const holeRatio = helpers.clamp(Number(rawHole) || 0.28, 0.1, 0.5);

  const rootRatio = 1 - depth;
  const sliderX = helpers.lerp(width * 0.15, width * 0.85, (teeth - 4) / 20);

  return [
    {
      id: 'toothDepth',
      label: \`Depth: \${Math.round(depth * 100)}%\`,
      x: cx,
      y: cy - ry * rootRatio,
      cursor: 'ns-resize'
    },
    {
      id: 'teeth',
      label: \`Teeth: \${teeth}\`,
      x: sliderX,
      y: 8,
      cursor: 'ew-resize'
    },
    {
      id: 'holeRadius',
      label: \`Bore: \${Math.round(holeRatio * 100)}%\`,
      x: cx + rx * holeRatio,
      y: cy,
      cursor: 'ew-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  const cx = width / 2;
  const cy = height / 2;
  const rx = Math.max(10, width / 2);
  const ry = Math.max(10, height / 2);

  if (id === 'toothDepth') {
    const dy = Math.abs(cy - localY);
    const rootRatio = helpers.clamp(dy / ry, 0.65, 0.92);
    return {
      ...params,
      toothDepth: Number((1 - rootRatio).toFixed(2))
    };
  }
  if (id === 'teeth') {
    const t = helpers.clamp((localX - width * 0.15) / (width * 0.7), 0, 1);
    return {
      ...params,
      teeth: Math.round(4 + t * 20)
    };
  }
  if (id === 'holeRadius') {
    const dx = Math.abs(localX - cx);
    const ratio = Number(helpers.clamp(dx / rx, 0.1, 0.5).toFixed(2));
    return {
      ...params,
      holeRadiusRatio: ratio,
      holeRatio: ratio
    };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const cx = width / 2;
  const cy = height / 2;
  const rx = width / 2;
  const ry = height / 2;
  const teeth = Math.round(helpers.clamp(Number(params.teeth) || 10, 4, 24));
  const depth = helpers.clamp(Number(params.toothDepth) || 0.18, 0.08, 0.35);
  const rawHole = params.holeRadiusRatio ?? params.holeRatio ?? 0.28;
  const holeRatio = helpers.clamp(Number(rawHole) || 0.28, 0.1, 0.5);

  const rootRatio = 1 - depth;
  const pitchAngle = (Math.PI * 2) / teeth;
  const pts = [];

  for (let i = 0; i < teeth; i++) {
    const baseA = -Math.PI / 2 + i * pitchAngle;
    const a1 = baseA;
    const a2 = baseA + pitchAngle * 0.16;
    const a3 = baseA + pitchAngle * 0.44;
    const a4 = baseA + pitchAngle * 0.60;

    pts.push({ x: cx + Math.cos(a1) * rx * rootRatio, y: cy + Math.sin(a1) * ry * rootRatio });
    pts.push({ x: cx + Math.cos(a2) * rx, y: cy + Math.sin(a2) * ry });
    pts.push({ x: cx + Math.cos(a3) * rx, y: cy + Math.sin(a3) * ry });
    pts.push({ x: cx + Math.cos(a4) * rx * rootRatio, y: cy + Math.sin(a4) * ry * rootRatio });
  }

  return [
    { nodes: helpers.polygonPath(pts), closed: true },
    { nodes: helpers.ellipsePath(cx, cy, rx * holeRatio, ry * holeRatio), closed: true }
  ];
}`,
  },

  // 6. Smart Pie / Donut Wedge
  {
    id: 'pie-donut',
    name: 'Smart Pie / Donut Wedge',
    category: 'Data & Charts',
    description:
      'Radial chart & gauge ring segment with 3 yellow diamond handles for start angle, end angle, and donut hole radius.',
    iconName: 'PieChart',
    isBuiltIn: true,
    paramSchema: [
      {
        key: 'startAngle',
        label: 'Start Angle (deg)',
        type: 'number',
        min: 0,
        max: 360,
        step: 1,
        defaultValue: -45,
      },
      {
        key: 'endAngle',
        label: 'End Angle (deg)',
        type: 'number',
        min: 0,
        max: 360,
        step: 1,
        defaultValue: 215,
      },
      {
        key: 'innerRadiusRatio',
        label: 'Donut Inner Ratio',
        type: 'number',
        min: 0,
        max: 0.85,
        step: 0.01,
        defaultValue: 0.48,
      },
    ],
    defaultParams: {
      startAngle: 0,
      endAngle: 260,
      innerRadiusRatio: 0.48,
    },
    jsSourceCode: `// Osito Smart Pie / Donut Wedge (.jsf)
function getControlPoints(width, height, params, helpers) {
  const cx = width / 2;
  const cy = height / 2;
  const rx = width / 2;
  const ry = height / 2;
  const startDeg = Number(params.startAngle) || 0;
  const rawEnd = params.endAngle ?? (params.sweepAngle !== undefined ? startDeg + Number(params.sweepAngle) : 260);
  const endDeg = Number(rawEnd) || 260;
  const rawInner = params.innerRadiusRatio ?? params.innerRadius ?? 0.48;
  const innerRatio = helpers.clamp(Number(rawInner) ?? 0.48, 0, 0.85);

  const startRad = helpers.degToRad(startDeg - 90);
  const endRad = helpers.degToRad(endDeg - 90);
  const midRad = (startRad + endRad) / 2;

  return [
    {
      id: 'startAngle',
      label: \`Start: \${Math.round(startDeg)}°\`,
      x: cx + Math.cos(startRad) * rx * 0.88,
      y: cy + Math.sin(startRad) * ry * 0.88,
      cursor: 'crosshair'
    },
    {
      id: 'endAngle',
      label: \`End: \${Math.round(endDeg)}°\`,
      x: cx + Math.cos(endRad) * rx * 0.88,
      y: cy + Math.sin(endRad) * ry * 0.88,
      cursor: 'crosshair'
    },
    {
      id: 'innerRadius',
      label: \`Inner: \${Math.round(innerRatio * 100)}%\`,
      x: cx + Math.cos(midRad) * rx * innerRatio,
      y: cy + Math.sin(midRad) * ry * innerRatio,
      cursor: 'move'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.max(10, Math.min(width, height) / 2);

  if (id === 'startAngle' || id === 'endAngle') {
    const rawRad = Math.atan2(localY - cy, localX - cx);
    let deg = Math.round(helpers.radToDeg(rawRad) + 90);
    if (deg < 0) deg += 360;
    return {
      ...params,
      [id]: helpers.clamp(deg, 0, 360)
    };
  }

  if (id === 'innerRadius') {
    const d = helpers.dist(cx, cy, localX, localY);
    const ratio = Number(helpers.clamp(d / maxR, 0, 0.85).toFixed(2));
    return {
      ...params,
      innerRadiusRatio: ratio,
      innerRadius: ratio
    };
  }

  return params;
}

function buildPaths(width, height, params, helpers) {
  const cx = width / 2;
  const cy = height / 2;
  const rx = width / 2;
  const ry = height / 2;
  const startDeg = Number(params.startAngle) || 0;
  const rawEnd = params.endAngle ?? (params.sweepAngle !== undefined ? startDeg + Number(params.sweepAngle) : 260);
  const endDeg = Number(rawEnd) || 260;
  const rawInner = params.innerRadiusRatio ?? params.innerRadius ?? 0.48;
  const innerRatio = helpers.clamp(Number(rawInner) ?? 0.48, 0, 0.85);

  let sweep = endDeg - startDeg;
  if (sweep <= 0) sweep += 360;
  if (sweep >= 359.5) {
    const paths = [{ nodes: helpers.ellipsePath(cx, cy, rx, ry), closed: true }];
    if (innerRatio > 0.02) {
      paths.push({
        nodes: helpers.ellipsePath(cx, cy, rx * innerRatio, ry * innerRatio),
        closed: true
      });
    }
    return paths;
  }

  const outerArc = helpers.arcNodes(cx, cy, rx, ry, startDeg - 90, sweep);
  // Make endpoints sharp corners where radial cuts join the arcs
  const firstOuter = outerArc[0];
  const lastOuter = outerArc[outerArc.length - 1];
  firstOuter.cp1x = firstOuter.x;
  firstOuter.cp1y = firstOuter.y;
  lastOuter.cp2x = lastOuter.x;
  lastOuter.cp2y = lastOuter.y;

  if (innerRatio <= 0.02) {
    return [
      {
        nodes: [...outerArc, helpers.cornerNode(cx, cy)],
        closed: true
      }
    ];
  }

  const innerArc = helpers.arcNodes(
    cx,
    cy,
    rx * innerRatio,
    ry * innerRatio,
    startDeg - 90 + sweep,
    -sweep
  );
  const firstInner = innerArc[0];
  const lastInner = innerArc[innerArc.length - 1];
  firstInner.cp1x = firstInner.x;
  firstInner.cp1y = firstInner.y;
  lastInner.cp2x = lastInner.x;
  lastInner.cp2y = lastInner.y;

  return [
    {
      nodes: [...outerArc, ...innerArc],
      closed: true
    }
  ];
}`,
  },

  // 7. Smart App Window Frame
  {
    id: 'ui-window',
    name: 'Smart App Window',
    category: 'Web & Layouts',
    description:
      'Multi-path UI wireframe container with adjustable titlebar height, window controls, and collapsible sidebar divider.',
    iconName: 'AppWindow',
    isBuiltIn: true,
    paramSchema: [
      {
        key: 'headerHeight',
        label: 'Header Bar Height (px)',
        type: 'number',
        min: 20,
        max: 64,
        step: 1,
        defaultValue: 36,
      },
      {
        key: 'sidebarWidth',
        label: 'Sidebar Width (px)',
        type: 'number',
        min: 0,
        max: 300,
        step: 1,
        defaultValue: 76,
      },
      {
        key: 'cornerRadius',
        label: 'Window Corner Radius',
        type: 'number',
        min: 0,
        max: 32,
        step: 1,
        defaultValue: 0,
      },
    ],
    defaultParams: {
      headerHeight: 36,
      sidebarWidth: 76,
      cornerRadius: 0,
    },
    jsSourceCode: `// Osito Smart Evolve UI Window Frame (.jsf)
function getControlPoints(width, height, params, helpers) {
  const headerH = helpers.clamp(Number(params.headerHeight) || 36, 20, Math.min(64, height * 0.5));
  const sidebarW = helpers.clamp(Number(params.sidebarWidth) ?? 76, 0, Math.min(300, width * 0.7));

  return [
    {
      id: 'headerHeight',
      label: \`Header: \${Math.round(headerH)}px\`,
      x: width / 2,
      y: headerH,
      cursor: 'ns-resize'
    },
    {
      id: 'sidebarWidth',
      label: sidebarW > 4 ? \`Sidebar: \${Math.round(sidebarW)}px\` : 'Sidebar: Off',
      x: sidebarW,
      y: headerH + (height - headerH) / 2,
      cursor: 'ew-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'headerHeight') {
    return {
      ...params,
      headerHeight: Math.round(helpers.clamp(localY, 20, Math.min(64, height * 0.6)))
    };
  }
  if (id === 'sidebarWidth') {
    const snapped = localX < 12 ? 0 : localX;
    return {
      ...params,
      sidebarWidth: Math.round(helpers.clamp(snapped, 0, Math.min(300, width * 0.75)))
    };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const headerH = helpers.clamp(Number(params.headerHeight) || 36, 20, Math.min(64, height * 0.6));
  const sidebarW = helpers.clamp(Number(params.sidebarWidth) ?? 76, 0, Math.min(300, width * 0.75));
  const r = helpers.clamp(Number(params.cornerRadius) ?? 0, 0, 32);

  const paths = [
    // Outer window frame
    {
      nodes: helpers.rectPath(0, 0, width, height, r),
      closed: true
    },
    // Header divider line
    {
      nodes: [helpers.cornerNode(0, headerH), helpers.cornerNode(width, headerH)],
      closed: false
    }
  ];

  // 3 traffic-light window controls
  const dotY = headerH / 2;
  const dotR = Math.min(5, headerH * 0.16);
  [16, 30, 44].forEach((dotX) => {
    if (dotX + dotR < width - 8) {
      paths.push({
        nodes: helpers.ellipsePath(dotX, dotY, dotR, dotR),
        closed: true
      });
    }
  });

  // Optional sidebar divider line
  if (sidebarW > 8) {
    paths.push({
      nodes: [helpers.cornerNode(sidebarW, headerH), helpers.cornerNode(sidebarW, height)],
      closed: false
    });
  }

  return paths;
}`,
  },

  // 8. Smart Isometric 3D Box
  {
    id: 'iso-cube',
    name: 'Smart Isometric 3D Box',
    category: 'Creative & Vector',
    description:
      'Extruded 3-face oblique/isometric 3D box with yellow diamond extrusion vector handle for live perspective control.',
    iconName: 'Box',
    isBuiltIn: true,
    paramSchema: [
      {
        key: 'depthX',
        label: 'Extrude X Ratio',
        type: 'number',
        min: 0.1,
        max: 0.65,
        step: 0.01,
        defaultValue: 0.32,
      },
      {
        key: 'depthY',
        label: 'Extrude Y Ratio',
        type: 'number',
        min: 0.1,
        max: 0.65,
        step: 0.01,
        defaultValue: 0.28,
      },
    ],
    defaultParams: {
      depthX: 0.32,
      depthY: 0.28,
    },
    jsSourceCode: `// Osito Smart Isometric 3D Box (.jsf)
function getControlPoints(width, height, params, helpers) {
  const dx = helpers.clamp(Number(params.depthX) || 0.32, 0.1, 0.65) * width;
  const dy = helpers.clamp(Number(params.depthY) || 0.28, 0.1, 0.65) * height;

  return [
    {
      id: 'extrude',
      label: \`Depth: \${Math.round(dx)}×\${Math.round(dy)}px\`,
      x: width - dx,
      y: dy,
      cursor: 'move'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'extrude') {
    const dxRatio = helpers.clamp((width - localX) / Math.max(1, width), 0.1, 0.65);
    const dyRatio = helpers.clamp(localY / Math.max(1, height), 0.1, 0.65);
    return {
      ...params,
      depthX: Number(dxRatio.toFixed(2)),
      depthY: Number(dyRatio.toFixed(2))
    };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const dx = helpers.clamp(Number(params.depthX) || 0.32, 0.1, 0.65) * width;
  const dy = helpers.clamp(Number(params.depthY) || 0.28, 0.1, 0.65) * height;

  const frontW = width - dx;
  const frontH = height - dy;

  // Front face
  const frontFace = helpers.polygonPath([
    { x: 0, y: dy },
    { x: frontW, y: dy },
    { x: frontW, y: height },
    { x: 0, y: height }
  ]);

  // Top face
  const topFace = helpers.polygonPath([
    { x: 0, y: dy },
    { x: dx, y: 0 },
    { x: width, y: 0 },
    { x: frontW, y: dy }
  ]);

  // Right face
  const rightFace = helpers.polygonPath([
    { x: frontW, y: dy },
    { x: width, y: 0 },
    { x: width, y: frontH },
    { x: frontW, y: height }
  ]);

  return [
    { nodes: frontFace, closed: true },
    { nodes: topFace, closed: true },
    { nodes: rightFace, closed: true }
  ];
}`,
  },

  // 9. Smart Bento Grid
  {
    id: 'bento-grid',
    name: 'Smart Bento Grid',
    category: 'Web & Layouts',
    description:
      'Modern multi-card Bento Box layout (hero left card + stacked right cards) with yellow diamond handles for column split, row split, cell gap, and corner radius.',
    iconName: 'LayoutGrid',
    isBuiltIn: true,
    paramSchema: [
      {
        key: 'splitX',
        label: 'Column Split Ratio',
        type: 'number',
        min: 0.25,
        max: 0.75,
        step: 0.01,
        defaultValue: 0.58,
      },
      {
        key: 'splitY',
        label: 'Right Row Split Ratio',
        type: 'number',
        min: 0.25,
        max: 0.75,
        step: 0.01,
        defaultValue: 0.48,
      },
      {
        key: 'gap',
        label: 'Cell Gap (px)',
        type: 'number',
        min: 4,
        max: 28,
        step: 1,
        defaultValue: 12,
      },
      {
        key: 'radius',
        label: 'Cell Corner Radius (px)',
        type: 'number',
        min: 0,
        max: 32,
        step: 1,
        defaultValue: 0,
      },
    ],
    defaultParams: {
      splitX: 0.58,
      splitY: 0.48,
      gap: 12,
      radius: 0,
    },
    jsSourceCode: `// Osito Smart Bento Grid (.jsf)
function getControlPoints(width, height, params, helpers) {
  const splitX = helpers.clamp(Number(params.splitX) || 0.58, 0.25, 0.75);
  const splitY = helpers.clamp(Number(params.splitY) || 0.48, 0.25, 0.75);
  const gap = helpers.clamp(Number(params.gap) ?? 12, 4, 28);
  const r = helpers.clamp(Number(params.radius) ?? 0, 0, 32);

  const colX = width * splitX;
  const rightX = colX + gap / 2;
  const rightW = Math.max(8, width - rightX);

  return [
    {
      id: 'splitX',
      label: \`Col Split: \${Math.round(splitX * 100)}%\`,
      x: colX,
      y: height * 0.5,
      cursor: 'ew-resize'
    },
    {
      id: 'splitY',
      label: \`Row Split: \${Math.round(splitY * 100)}%\`,
      x: rightX + rightW * 0.5,
      y: height * splitY,
      cursor: 'ns-resize'
    },
    {
      id: 'gap',
      label: \`Gap: \${Math.round(gap)}px\`,
      x: colX + gap / 2,
      y: height * 0.2,
      cursor: 'ew-resize'
    },
    {
      id: 'radius',
      label: \`Radius: \${Math.round(r)}px\`,
      x: r,
      y: 0,
      cursor: 'ew-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'splitX') {
    return {
      ...params,
      splitX: Number(helpers.clamp(localX / Math.max(1, width), 0.25, 0.75).toFixed(2))
    };
  }
  if (id === 'splitY') {
    return {
      ...params,
      splitY: Number(helpers.clamp(localY / Math.max(1, height), 0.25, 0.75).toFixed(2))
    };
  }
  if (id === 'gap') {
    const colX = helpers.clamp(Number(params.splitX) || 0.58, 0.25, 0.75) * width;
    const rawGap = Math.abs(localX - colX) * 2;
    return {
      ...params,
      gap: Math.round(helpers.clamp(rawGap, 4, 28))
    };
  }
  if (id === 'radius') {
    return {
      ...params,
      radius: Math.round(helpers.clamp(localX, 0, 32))
    };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const splitX = helpers.clamp(Number(params.splitX) || 0.58, 0.25, 0.75);
  const splitY = helpers.clamp(Number(params.splitY) || 0.48, 0.25, 0.75);
  const gap = helpers.clamp(Number(params.gap) ?? 12, 4, Math.min(28, Math.min(width, height) * 0.22));
  const r = helpers.clamp(Number(params.radius) ?? 0, 0, 32);

  const leftW = Math.max(8, width * splitX - gap / 2);
  const rightX = width * splitX + gap / 2;
  const rightW = Math.max(8, width - rightX);
  const topRightH = Math.max(8, height * splitY - gap / 2);
  const botRightY = height * splitY + gap / 2;
  const botRightH = Math.max(8, height - botRightY);

  return [
    { nodes: helpers.rectPath(0, 0, leftW, height, r), closed: true },
    { nodes: helpers.rectPath(rightX, 0, rightW, topRightH, r), closed: true },
    { nodes: helpers.rectPath(rightX, botRightY, rightW, botRightH, r), closed: true }
  ];
}`,
  },

  // 10. Smart Mobile Device Frame
  {
    id: 'mobile-frame',
    name: 'Smart Mobile Device Frame',
    category: 'Web & Layouts',
    description:
      'Modern iOS/Android phone wireframe with outer bezel, inner viewport, top Dynamic Island pill, and bottom Home Indicator bar.',
    iconName: 'Smartphone',
    isBuiltIn: true,
    paramSchema: [
      {
        key: 'cornerRadius',
        label: 'Chassis Corner Radius (px)',
        type: 'number',
        min: 0,
        max: 56,
        step: 1,
        defaultValue: 36,
      },
      {
        key: 'islandWidthRatio',
        label: 'Dynamic Island Width Ratio',
        type: 'number',
        min: 0.18,
        max: 0.55,
        step: 0.01,
        defaultValue: 0.32,
      },
      {
        key: 'bezelWidth',
        label: 'Bezel Thickness (px)',
        type: 'number',
        min: 4,
        max: 24,
        step: 1,
        defaultValue: 10,
      },
    ],
    defaultParams: {
      cornerRadius: 36,
      islandWidthRatio: 0.32,
      bezelWidth: 10,
    },
    jsSourceCode: `// Osito Smart Mobile Device Frame (.jsf)
function getControlPoints(width, height, params, helpers) {
  const outerR = helpers.clamp(Number(params.cornerRadius) ?? 36, 0, 56);
  const islandRatio = helpers.clamp(Number(params.islandWidthRatio) || 0.32, 0.18, 0.55);
  const bezel = helpers.clamp(Number(params.bezelWidth) ?? 10, 4, 24);

  const islandW = width * islandRatio;
  const islandH = Math.max(8, Math.min(20, height * 0.042));
  const islandY = bezel + Math.max(6, height * 0.022);

  return [
    {
      id: 'cornerRadius',
      label: \`Radius: \${Math.round(outerR)}px\`,
      x: outerR,
      y: 0,
      cursor: 'ew-resize'
    },
    {
      id: 'islandWidthRatio',
      label: \`Island: \${Math.round(islandRatio * 100)}%\`,
      x: (width + islandW) / 2,
      y: islandY + islandH / 2,
      cursor: 'ew-resize'
    },
    {
      id: 'bezelWidth',
      label: \`Bezel: \${Math.round(bezel)}px\`,
      x: bezel,
      y: height / 2,
      cursor: 'ew-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'cornerRadius') {
    return {
      ...params,
      cornerRadius: Math.round(helpers.clamp(localX, 0, 56))
    };
  }
  if (id === 'islandWidthRatio') {
    const ratio = helpers.clamp((Math.abs(localX - width / 2) * 2) / Math.max(1, width), 0.18, 0.55);
    return {
      ...params,
      islandWidthRatio: Number(ratio.toFixed(2))
    };
  }
  if (id === 'bezelWidth') {
    return {
      ...params,
      bezelWidth: Math.round(helpers.clamp(localX, 4, 24))
    };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const outerR = helpers.clamp(Number(params.cornerRadius) ?? 36, 0, 56);
  const islandRatio = helpers.clamp(Number(params.islandWidthRatio) || 0.32, 0.18, 0.55);
  const bezel = helpers.clamp(Number(params.bezelWidth) ?? 10, 4, Math.min(24, Math.min(width, height) * 0.18));

  const innerW = Math.max(12, width - bezel * 2);
  const innerH = Math.max(12, height - bezel * 2);
  const innerR = Math.max(0, outerR - bezel * 0.65);

  const islandW = width * islandRatio;
  const islandH = Math.max(8, Math.min(20, height * 0.042));
  const islandX = (width - islandW) / 2;
  const islandY = bezel + Math.max(6, height * 0.022);

  const homeW = width * 0.36;
  const homeH = Math.max(4, Math.min(8, height * 0.015));
  const homeX = (width - homeW) / 2;
  const homeY = height - bezel - homeH - Math.max(6, height * 0.018);

  return [
    { nodes: helpers.rectPath(0, 0, width, height, outerR), closed: true },
    { nodes: helpers.rectPath(bezel, bezel, innerW, innerH, innerR), closed: true },
    { nodes: helpers.rectPath(islandX, islandY, islandW, islandH, islandH / 2), closed: true },
    { nodes: helpers.rectPath(homeX, homeY, homeW, homeH, homeH / 2), closed: true }
  ];
}`,
  },

  // 11. Smart UI Toggle Switch
  {
    id: 'toggle-switch',
    name: 'Smart UI Toggle Switch',
    category: 'User Interface',
    description:
      'Interactive iOS/SaaS pill toggle switch with a draggable yellow diamond thumb state handle that slides smoothly between OFF (0) and ON (1).',
    iconName: 'ToggleRight',
    isBuiltIn: true,
    paramSchema: [
      {
        key: 'stateRatio',
        label: 'Toggle State (0 = Off, 1 = On)',
        type: 'number',
        min: 0,
        max: 1,
        step: 0.01,
        defaultValue: 0.85,
      },
      {
        key: 'padding',
        label: 'Track Inset Padding (px)',
        type: 'number',
        min: 2,
        max: 16,
        step: 1,
        defaultValue: 6,
      },
    ],
    defaultParams: {
      stateRatio: 0.85,
      padding: 6,
    },
    jsSourceCode: `// Osito Smart UI Toggle Switch (.jsf)
function getControlPoints(width, height, params, helpers) {
  const state = helpers.clamp(Number(params.stateRatio) ?? 0.85, 0, 1);
  const pad = helpers.clamp(Number(params.padding) ?? 6, 2, Math.min(16, height * 0.35));

  const knobD = Math.max(8, height - pad * 2);
  const minX = pad + knobD / 2;
  const maxX = Math.max(minX, width - pad - knobD / 2);
  const knobCx = helpers.lerp(minX, maxX, state);

  return [
    {
      id: 'stateRatio',
      label: state >= 0.5 ? \`ON (\${Math.round(state * 100)}%)\` : \`OFF (\${Math.round(state * 100)}%)\`,
      x: knobCx,
      y: height / 2,
      cursor: 'ew-resize'
    },
    {
      id: 'padding',
      label: \`Padding: \${Math.round(pad)}px\`,
      x: knobCx,
      y: pad,
      cursor: 'ns-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'stateRatio') {
    const pad = helpers.clamp(Number(params.padding) ?? 6, 2, Math.min(16, height * 0.35));
    const knobD = Math.max(8, height - pad * 2);
    const minX = pad + knobD / 2;
    const maxX = Math.max(minX + 1, width - pad - knobD / 2);
    const ratio = helpers.clamp((localX - minX) / (maxX - minX), 0, 1);
    return {
      ...params,
      stateRatio: Number(ratio.toFixed(2))
    };
  }
  if (id === 'padding') {
    const rawPad = helpers.clamp(localY, 2, 16);
    return {
      ...params,
      padding: Math.round(rawPad)
    };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const state = helpers.clamp(Number(params.stateRatio) ?? 0.85, 0, 1);
  const pad = helpers.clamp(Number(params.padding) ?? 6, 2, Math.min(16, height * 0.35));

  const knobD = Math.max(8, height - pad * 2);
  const knobR = knobD / 2;
  const minX = pad + knobR;
  const maxX = Math.max(minX, width - pad - knobR);
  const knobCx = helpers.lerp(minX, maxX, state);

  return [
    { nodes: helpers.rectPath(0, 0, width, height, height / 2), closed: true },
    { nodes: helpers.ellipsePath(knobCx, height / 2, knobR, knobR), closed: true }
  ];
}`,
  },

  // 12. Smart Slider / Progress Bar
  {
    id: 'progress-bar',
    name: 'Smart Slider / Progress Bar',
    category: 'User Interface',
    description:
      'UI slider & progress bar with outer rail, active fill bar, and circular scrubber thumb controlled by yellow diamond handles.',
    iconName: 'Sliders',
    isBuiltIn: true,
    paramSchema: [
      {
        key: 'progress',
        label: 'Progress Ratio',
        type: 'number',
        min: 0.05,
        max: 1,
        step: 0.01,
        defaultValue: 0.68,
      },
      {
        key: 'trackHeightRatio',
        label: 'Track Thickness Ratio',
        type: 'number',
        min: 0.15,
        max: 0.65,
        step: 0.01,
        defaultValue: 0.32,
      },
    ],
    defaultParams: {
      progress: 0.68,
      trackHeightRatio: 0.32,
    },
    jsSourceCode: `// Osito Smart Slider / Progress Bar (.jsf)
function getControlPoints(width, height, params, helpers) {
  const prog = helpers.clamp(Number(params.progress) ?? 0.68, 0.05, 1);
  const trackRatio = helpers.clamp(Number(params.trackHeightRatio) || 0.32, 0.15, 0.65);
  const trackH = Math.max(4, height * trackRatio);
  const trackY = (height - trackH) / 2;

  return [
    {
      id: 'progress',
      label: \`Progress: \${Math.round(prog * 100)}%\`,
      x: width * prog,
      y: height / 2,
      cursor: 'ew-resize'
    },
    {
      id: 'trackHeightRatio',
      label: \`Track: \${Math.round(trackRatio * 100)}%\`,
      x: width * 0.2,
      y: trackY,
      cursor: 'ns-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'progress') {
    const prog = helpers.clamp(localX / Math.max(1, width), 0.05, 1);
    return {
      ...params,
      progress: Number(prog.toFixed(2))
    };
  }
  if (id === 'trackHeightRatio') {
    const ratio = helpers.clamp((Math.abs(localY - height / 2) * 2) / Math.max(1, height), 0.15, 0.65);
    return {
      ...params,
      trackHeightRatio: Number(ratio.toFixed(2))
    };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const prog = helpers.clamp(Number(params.progress) ?? 0.68, 0.05, 1);
  const trackRatio = helpers.clamp(Number(params.trackHeightRatio) || 0.32, 0.15, 0.65);

  const trackH = Math.max(4, height * trackRatio);
  const trackY = (height - trackH) / 2;
  const fillW = Math.max(trackH, width * prog);
  const thumbR = Math.min(height * 0.46, Math.max(trackH * 0.85, 7));
  const thumbCx = helpers.clamp(width * prog, thumbR, Math.max(thumbR, width - thumbR));

  return [
    { nodes: helpers.rectPath(0, trackY, width, trackH, trackH / 2), closed: true },
    { nodes: helpers.rectPath(0, trackY, fillW, trackH, trackH / 2), closed: true },
    { nodes: helpers.ellipsePath(thumbCx, height / 2, thumbR, thumbR), closed: true }
  ];
}`,
  },

  // 13. Smart SaaS Card / Skeleton
  {
    id: 'skeleton-card',
    name: 'Smart SaaS Card / Skeleton',
    category: 'Web & Layouts',
    description:
      'Wireframe SaaS content card with hero media thumbnail and 3 text skeleton rows controlled by live yellow diamond handles.',
    iconName: 'CreditCard',
    isBuiltIn: true,
    paramSchema: [
      {
        key: 'mediaHeightRatio',
        label: 'Hero Media Height Ratio',
        type: 'number',
        min: 0.25,
        max: 0.65,
        step: 0.01,
        defaultValue: 0.46,
      },
      {
        key: 'lastLineRatio',
        label: 'Last Text Line Width Ratio',
        type: 'number',
        min: 0.25,
        max: 0.95,
        step: 0.01,
        defaultValue: 0.55,
      },
      {
        key: 'cornerRadius',
        label: 'Card Corner Radius (px)',
        type: 'number',
        min: 0,
        max: 24,
        step: 1,
        defaultValue: 0,
      },
    ],
    defaultParams: {
      mediaHeightRatio: 0.46,
      lastLineRatio: 0.55,
      cornerRadius: 0,
    },
    jsSourceCode: `// Osito Smart SaaS Card / Skeleton (.jsf)
function getControlPoints(width, height, params, helpers) {
  const mediaRatio = helpers.clamp(Number(params.mediaHeightRatio) || 0.46, 0.25, 0.65);
  const lastRatio = helpers.clamp(Number(params.lastLineRatio) || 0.55, 0.25, 0.95);
  const r = helpers.clamp(Number(params.cornerRadius) ?? 0, 0, 24);

  const pad = Math.max(8, Math.min(width, height) * 0.065);
  const innerW = Math.max(16, width - pad * 2);
  const mediaH = Math.max(14, (height - pad * 2) * mediaRatio);
  const bodyTop = pad + mediaH + pad * 0.85;
  const bodyAvailH = Math.max(18, height - bodyTop - pad);
  const barH = Math.max(4, Math.min(12, bodyAvailH * 0.22));
  const barGap = Math.max(4, (bodyAvailH - barH * 3) / 2);
  const line3Y = bodyTop + (barH + barGap) * 2 + barH / 2;

  return [
    {
      id: 'mediaHeightRatio',
      label: \`Media: \${Math.round(mediaRatio * 100)}%\`,
      x: width / 2,
      y: pad + mediaH,
      cursor: 'ns-resize'
    },
    {
      id: 'lastLineRatio',
      label: \`Line 3: \${Math.round(lastRatio * 100)}%\`,
      x: pad + innerW * lastRatio,
      y: line3Y,
      cursor: 'ew-resize'
    },
    {
      id: 'cornerRadius',
      label: \`Radius: \${Math.round(r)}px\`,
      x: r,
      y: 0,
      cursor: 'ew-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  const pad = Math.max(8, Math.min(width, height) * 0.065);
  const innerW = Math.max(16, width - pad * 2);
  const innerH = Math.max(16, height - pad * 2);

  if (id === 'mediaHeightRatio') {
    const ratio = helpers.clamp((localY - pad) / innerH, 0.25, 0.65);
    return {
      ...params,
      mediaHeightRatio: Number(ratio.toFixed(2))
    };
  }
  if (id === 'lastLineRatio') {
    const ratio = helpers.clamp((localX - pad) / innerW, 0.25, 0.95);
    return {
      ...params,
      lastLineRatio: Number(ratio.toFixed(2))
    };
  }
  if (id === 'cornerRadius') {
    return {
      ...params,
      cornerRadius: Math.round(helpers.clamp(localX, 0, 24))
    };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const mediaRatio = helpers.clamp(Number(params.mediaHeightRatio) || 0.46, 0.25, 0.65);
  const lastRatio = helpers.clamp(Number(params.lastLineRatio) || 0.55, 0.25, 0.95);
  const r = helpers.clamp(Number(params.cornerRadius) ?? 0, 0, 24);

  const pad = Math.max(8, Math.min(width, height) * 0.065);
  const innerW = Math.max(16, width - pad * 2);
  const mediaH = Math.max(14, (height - pad * 2) * mediaRatio);
  const bodyTop = pad + mediaH + pad * 0.85;
  const bodyAvailH = Math.max(18, height - bodyTop - pad);
  const barH = Math.max(4, Math.min(12, bodyAvailH * 0.22));
  const barGap = Math.max(4, (bodyAvailH - barH * 3) / 2);

  return [
    { nodes: helpers.rectPath(0, 0, width, height, r), closed: true },
    { nodes: helpers.rectPath(pad, pad, innerW, mediaH, 0), closed: true },
    { nodes: helpers.rectPath(pad, bodyTop, innerW * 0.88, barH, 0), closed: true },
    { nodes: helpers.rectPath(pad, bodyTop + barH + barGap, innerW, barH, 0), closed: true },
    { nodes: helpers.rectPath(pad, bodyTop + (barH + barGap) * 2, innerW * lastRatio, barH, 0), closed: true }
  ];
}`,
  },

  // 14. Smart Analytics Area Chart
  {
    id: 'sparkline-card',
    name: 'Smart Analytics Area Chart',
    category: 'Data & Charts',
    description:
      'Smooth cubic Bezier SaaS analytics trendline & area chart polygon with draggable yellow diamond peak and valley handles.',
    iconName: 'Activity',
    isBuiltIn: true,
    paramSchema: [
      {
        key: 'peakRatio',
        label: 'Primary Peak Y Ratio',
        type: 'number',
        min: 0.1,
        max: 0.85,
        step: 0.01,
        defaultValue: 0.22,
      },
      {
        key: 'dipRatio',
        label: 'Mid Valley Dip Y Ratio',
        type: 'number',
        min: 0.2,
        max: 0.9,
        step: 0.01,
        defaultValue: 0.68,
      },
    ],
    defaultParams: {
      peakRatio: 0.22,
      dipRatio: 0.68,
    },
    jsSourceCode: `// Osito Smart Analytics Area Chart (.jsf)
function getControlPoints(width, height, params, helpers) {
  const peakRatio = helpers.clamp(Number(params.peakRatio) || 0.22, 0.1, 0.85);
  const dipRatio = helpers.clamp(Number(params.dipRatio) || 0.68, 0.2, 0.9);

  return [
    {
      id: 'peakRatio',
      label: \`Peak: \${Math.round((1 - peakRatio) * 100)}%\`,
      x: width * 0.34,
      y: height * peakRatio,
      cursor: 'ns-resize'
    },
    {
      id: 'dipRatio',
      label: \`Dip: \${Math.round((1 - dipRatio) * 100)}%\`,
      x: width * 0.66,
      y: height * dipRatio,
      cursor: 'ns-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'peakRatio') {
    const ratio = helpers.clamp(localY / Math.max(1, height), 0.1, 0.85);
    return {
      ...params,
      peakRatio: Number(ratio.toFixed(2))
    };
  }
  if (id === 'dipRatio') {
    const ratio = helpers.clamp(localY / Math.max(1, height), 0.2, 0.9);
    return {
      ...params,
      dipRatio: Number(ratio.toFixed(2))
    };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const peakY = helpers.clamp(Number(params.peakRatio) || 0.22, 0.1, 0.85) * height;
  const dipY = helpers.clamp(Number(params.dipRatio) || 0.68, 0.2, 0.9) * height;

  const startY = height * 0.74;
  const endY = Math.max(height * 0.08, peakY * 0.72);
  const x1 = width * 0.34;
  const x2 = width * 0.66;
  const t = width * 0.12;

  const nodes = [
    helpers.cornerNode(0, height),
    helpers.smoothNode(0, startY, 0, startY, t, startY),
    helpers.smoothNode(x1, peakY, x1 - t, peakY, x1 + t, peakY),
    helpers.smoothNode(x2, dipY, x2 - t, dipY, x2 + t, dipY),
    helpers.smoothNode(width, endY, width - t, endY, width, endY),
    helpers.cornerNode(width, height)
  ];

  return [{ nodes, closed: true }];
}`,
  },

  // 15. Smart Avatar + Status Ring
  {
    id: 'avatar-badge',
    name: 'Smart Avatar + Status Ring',
    category: 'User Interface',
    description:
      'Circular user avatar with inner profile silhouette and an orbital presence indicator badge that orbits around the rim via yellow diamond handles.',
    iconName: 'UserCheck',
    isBuiltIn: true,
    paramSchema: [
      {
        key: 'badgeAngle',
        label: 'Status Badge Angle (deg)',
        type: 'number',
        min: 0,
        max: 360,
        step: 1,
        defaultValue: 45,
      },
      {
        key: 'badgeSizeRatio',
        label: 'Status Badge Size Ratio',
        type: 'number',
        min: 0.12,
        max: 0.36,
        step: 0.01,
        defaultValue: 0.24,
      },
    ],
    defaultParams: {
      badgeAngle: 45,
      badgeSizeRatio: 0.24,
    },
    jsSourceCode: `// Osito Smart Avatar + Status Ring (.jsf)
function getControlPoints(width, height, params, helpers) {
  const angleDeg = helpers.clamp(Number(params.badgeAngle) ?? 45, 0, 360);
  const badgeSize = helpers.clamp(Number(params.badgeSizeRatio) || 0.24, 0.12, 0.36);

  const cx = width / 2;
  const cy = height / 2;
  const rx = width * 0.42;
  const ry = height * 0.42;
  const rad = helpers.degToRad(angleDeg);
  const bx = cx + Math.cos(rad) * rx;
  const by = cy + Math.sin(rad) * ry;
  const br = Math.min(width, height) * 0.5 * badgeSize;

  return [
    {
      id: 'badgeAngle',
      label: \`Orbit: \${Math.round(angleDeg)}°\`,
      x: bx,
      y: by,
      cursor: 'move'
    },
    {
      id: 'badgeSizeRatio',
      label: \`Badge: \${Math.round(badgeSize * 100)}%\`,
      x: bx + br,
      y: by,
      cursor: 'ew-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  const cx = width / 2;
  const cy = height / 2;

  if (id === 'badgeAngle') {
    let deg = Math.round(helpers.radToDeg(Math.atan2(localY - cy, localX - cx)));
    if (deg < 0) deg += 360;
    return {
      ...params,
      badgeAngle: helpers.clamp(deg, 0, 360)
    };
  }
  if (id === 'badgeSizeRatio') {
    const angleDeg = helpers.clamp(Number(params.badgeAngle) ?? 45, 0, 360);
    const rad = helpers.degToRad(angleDeg);
    const bx = cx + Math.cos(rad) * (width * 0.42);
    const by = cy + Math.sin(rad) * (height * 0.42);
    const d = helpers.dist(bx, by, localX, localY);
    const ratio = helpers.clamp(d / (Math.min(width, height) * 0.5), 0.12, 0.36);
    return {
      ...params,
      badgeSizeRatio: Number(ratio.toFixed(2))
    };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const angleDeg = helpers.clamp(Number(params.badgeAngle) ?? 45, 0, 360);
  const badgeSize = helpers.clamp(Number(params.badgeSizeRatio) || 0.24, 0.12, 0.36);

  const cx = width / 2;
  const cy = height / 2;
  const rx = width * 0.42;
  const ry = height * 0.42;
  const rad = helpers.degToRad(angleDeg);
  const bx = cx + Math.cos(rad) * rx;
  const by = cy + Math.sin(rad) * ry;
  const br = Math.min(width, height) * 0.5 * badgeSize;

  // Inner user shoulders dome
  const shoulderW = rx * 0.58;
  const shoulderBaseY = cy + ry * 0.68;
  const shoulderTopY = cy + ry * 0.18;
  const shoulders = [
    helpers.cornerNode(cx - shoulderW, shoulderBaseY),
    helpers.smoothNode(cx, shoulderTopY, cx - shoulderW * 0.7, shoulderTopY, cx + shoulderW * 0.7, shoulderTopY),
    helpers.cornerNode(cx + shoulderW, shoulderBaseY)
  ];

  return [
    { nodes: helpers.ellipsePath(cx, cy, rx, ry), closed: true },
    { nodes: helpers.ellipsePath(cx, cy - ry * 0.2, rx * 0.26, ry * 0.26), closed: true },
    { nodes: shoulders, closed: true },
    { nodes: helpers.ellipsePath(bx, by, br, br), closed: true }
  ];
}`,
  },

  // 16. Smart AI Sparkle Badge
  {
    id: 'ai-sparkle',
    name: 'Smart AI Sparkle Badge',
    category: 'Badges & Icons',
    description:
      '4-point concave cubic Bezier AI / Gemini sparkle star with a secondary top-right mini-sparkle and yellow diamond waist pinch handle.',
    iconName: 'Sparkles',
    isBuiltIn: true,
    paramSchema: [
      {
        key: 'pinchRatio',
        label: 'Star Waist Pinch Ratio',
        type: 'number',
        min: 0.08,
        max: 0.48,
        step: 0.01,
        defaultValue: 0.22,
      },
      {
        key: 'satelliteScale',
        label: 'Mini Sparkle Scale',
        type: 'number',
        min: 0,
        max: 0.45,
        step: 0.01,
        defaultValue: 0.26,
      },
    ],
    defaultParams: {
      pinchRatio: 0.22,
      satelliteScale: 0.26,
    },
    jsSourceCode: `// Osito Smart AI Sparkle Badge (.jsf)
function getControlPoints(width, height, params, helpers) {
  const pinch = helpers.clamp(Number(params.pinchRatio) || 0.22, 0.08, 0.48);
  const satScale = helpers.clamp(Number(params.satelliteScale) ?? 0.26, 0, 0.45);

  const hasSat = satScale > 0.02;
  const cx = width * (hasSat ? 0.44 : 0.5);
  const cy = height * (hasSat ? 0.56 : 0.5);
  const rx = width * (hasSat ? 0.42 : 0.48);
  const ry = height * (hasSat ? 0.42 : 0.48);

  const satCx = width * 0.8;
  const satCy = height * 0.2;
  const satRx = width * satScale * 0.5;

  return [
    {
      id: 'pinchRatio',
      label: \`Pinch: \${Math.round(pinch * 100)}%\`,
      x: cx + rx * pinch,
      y: cy - ry * pinch,
      cursor: 'move'
    },
    {
      id: 'satelliteScale',
      label: hasSat ? \`Mini Star: \${Math.round(satScale * 100)}%\` : 'Mini Star: Off',
      x: satCx + satRx,
      y: satCy,
      cursor: 'ew-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  const satScale = helpers.clamp(Number(params.satelliteScale) ?? 0.26, 0, 0.45);
  const hasSat = satScale > 0.02;
  const cx = width * (hasSat ? 0.44 : 0.5);
  const cy = height * (hasSat ? 0.56 : 0.5);
  const rx = Math.max(10, width * (hasSat ? 0.42 : 0.48));
  const ry = Math.max(10, height * (hasSat ? 0.42 : 0.48));

  if (id === 'pinchRatio') {
    const dx = Math.abs(localX - cx) / rx;
    const dy = Math.abs(localY - cy) / ry;
    const ratio = helpers.clamp((dx + dy) / 2, 0.08, 0.48);
    return {
      ...params,
      pinchRatio: Number(ratio.toFixed(2))
    };
  }
  if (id === 'satelliteScale') {
    const satCx = width * 0.8;
    const rawScale = (Math.abs(localX - satCx) * 2) / Math.max(1, width);
    const snapped = rawScale < 0.04 ? 0 : helpers.clamp(rawScale, 0, 0.45);
    return {
      ...params,
      satelliteScale: Number(snapped.toFixed(2))
    };
  }
  return params;
}

function buildSparkleStar(cx, cy, rx, ry, pinch, helpers) {
  const px = rx * pinch;
  const py = ry * pinch;
  return [
    helpers.smoothNode(cx, cy - ry, cx - px, cy - py, cx + px, cy - py),
    helpers.smoothNode(cx + rx, cy, cx + px, cy - py, cx + px, cy + py),
    helpers.smoothNode(cx, cy + ry, cx + px, cy + py, cx - px, cy + py),
    helpers.smoothNode(cx - rx, cy, cx - px, cy + py, cx - px, cy - py)
  ];
}

function buildPaths(width, height, params, helpers) {
  const pinch = helpers.clamp(Number(params.pinchRatio) || 0.22, 0.08, 0.48);
  const satScale = helpers.clamp(Number(params.satelliteScale) ?? 0.26, 0, 0.45);

  const hasSat = satScale > 0.02;
  const cx = width * (hasSat ? 0.44 : 0.5);
  const cy = height * (hasSat ? 0.56 : 0.5);
  const rx = width * (hasSat ? 0.42 : 0.48);
  const ry = height * (hasSat ? 0.42 : 0.48);

  const paths = [
    { nodes: buildSparkleStar(cx, cy, rx, ry, pinch, helpers), closed: true }
  ];

  if (hasSat) {
    const satCx = width * 0.8;
    const satCy = height * 0.2;
    const satRx = width * satScale * 0.5;
    const satRy = height * satScale * 0.5;
    paths.push({
      nodes: buildSparkleStar(satCx, satCy, satRx, satRy, pinch, helpers),
      closed: true
    });
  }

  return paths;
}`,
  },

  // 17. Smart Sitemap Page Node (Lucidchart Sitemap Card)
  {
    id: 'sitemap-node',
    name: 'Smart Sitemap Page Node',
    category: 'Flow & Diagrams',
    description:
      'Lucidchart-style Sitemap page card with browser URL header bar, wireframe layout blocks, and yellow diamond handles for header height & corner radius. Drag its N/E/S/W ports to auto-connect!',
    iconName: 'Layout',
    isBuiltIn: true,
    paramSchema: [
      {
        key: 'headerRatio',
        label: 'Header Height Ratio',
        type: 'number',
        min: 0.18,
        max: 0.45,
        step: 0.01,
        defaultValue: 0.28,
      },
      {
        key: 'cornerRadius',
        label: 'Card Corner Radius (px)',
        type: 'number',
        min: 0,
        max: 24,
        step: 1,
        defaultValue: 0,
      },
    ],
    defaultParams: {
      headerRatio: 0.28,
      cornerRadius: 0,
    },
    jsSourceCode: `// Osito Smart Sitemap Page Node (.jsf)
function getControlPoints(width, height, params, helpers) {
  const headerRatio = helpers.clamp(Number(params.headerRatio) || 0.28, 0.18, 0.45);
  const r = helpers.clamp(Number(params.cornerRadius) ?? 0, 0, 24);
  return [
    {
      id: 'headerRatio',
      label: \`Header: \${Math.round(headerRatio * 100)}%\`,
      x: width / 2,
      y: height * headerRatio,
      cursor: 'ns-resize'
    },
    {
      id: 'cornerRadius',
      label: \`Radius: \${Math.round(r)}px\`,
      x: r,
      y: 0,
      cursor: 'ew-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'headerRatio') {
    return {
      ...params,
      headerRatio: Number(helpers.clamp(localY / Math.max(1, height), 0.18, 0.45).toFixed(2))
    };
  }
  if (id === 'cornerRadius') {
    return {
      ...params,
      cornerRadius: Math.round(helpers.clamp(localX, 0, 24))
    };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const headerRatio = helpers.clamp(Number(params.headerRatio) || 0.28, 0.18, 0.45);
  const r = helpers.clamp(Number(params.cornerRadius) ?? 0, 0, 24);
  const headerH = Math.max(16, height * headerRatio);
  const pad = Math.max(8, Math.min(width, height) * 0.08);
  const bodyY = headerH + pad * 0.8;
  const bodyH = Math.max(12, height - bodyY - pad);
  const colW = Math.max(8, (width - pad * 2.6) * 0.36);
  const mainX = pad + colW + pad * 0.6;
  const mainW = Math.max(10, width - mainX - pad);

  return [
    { nodes: helpers.rectPath(0, 0, width, height, r), closed: true },
    { nodes: [helpers.cornerNode(0, headerH), helpers.cornerNode(width, headerH)], closed: false },
    { nodes: helpers.rectPath(pad, headerH * 0.3, Math.max(14, width * 0.45), Math.max(4, headerH * 0.38), 0), closed: true },
    { nodes: helpers.rectPath(pad, bodyY, colW, bodyH, 0), closed: true },
    { nodes: helpers.rectPath(mainX, bodyY, mainW, bodyH * 0.44, 0), closed: true },
    { nodes: helpers.rectPath(mainX, bodyY + bodyH * 0.56, mainW, bodyH * 0.44, 0), closed: true }
  ];
}`,
  },

  // 18. Smart Flowchart Decision / Step (Lucidchart Workflow Node)
  {
    id: 'workflow-decision',
    name: 'Smart Workflow Decision / Step',
    category: 'Flow & Diagrams',
    description:
      'Lucidchart workflow shape with yellow diamond bevel handle that morphs smoothly between a Process Step (0%), Hexagon Preparation Node (25%), and Decision Diamond (50%).',
    iconName: 'GitFork',
    isBuiltIn: true,
    paramSchema: [
      {
        key: 'bevelRatio',
        label: 'Diamond Taper Ratio (0 = Step, 0.5 = Diamond)',
        type: 'number',
        min: 0,
        max: 0.5,
        step: 0.01,
        defaultValue: 0.5,
      },
    ],
    defaultParams: {
      bevelRatio: 0.5,
    },
    jsSourceCode: `// Osito Smart Workflow Decision / Step (.jsf)
function getControlPoints(width, height, params, helpers) {
  const bevel = helpers.clamp(Number(params.bevelRatio) ?? 0.5, 0, 0.5);
  return [
    {
      id: 'bevelRatio',
      label: bevel >= 0.46 ? 'Decision Diamond' : bevel <= 0.05 ? 'Process Rect' : \`Hexagon (\${Math.round(bevel * 200)}%)\`,
      x: width * bevel,
      y: 0,
      cursor: 'ew-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'bevelRatio') {
    const ratio = helpers.clamp(localX / Math.max(1, width), 0, 0.5);
    return {
      ...params,
      bevelRatio: Number(ratio.toFixed(2))
    };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const bevel = helpers.clamp(Number(params.bevelRatio) ?? 0.5, 0, 0.5);
  const bx = width * bevel;
  const midY = height / 2;

  if (bevel >= 0.48) {
    return [
      {
        nodes: helpers.polygonPath([
          { x: width / 2, y: 0 },
          { x: width, y: midY },
          { x: width / 2, y: height },
          { x: 0, y: midY }
        ]),
        closed: true
      }
    ];
  }

  if (bevel <= 0.03) {
    return [{ nodes: helpers.rectPath(0, 0, width, height, 0), closed: true }];
  }

  return [
    {
      nodes: helpers.polygonPath([
        { x: bx, y: 0 },
        { x: width - bx, y: 0 },
        { x: width, y: midY },
        { x: width - bx, y: height },
        { x: bx, y: height },
        { x: 0, y: midY }
      ]),
      closed: true
    }
  ];
}`,
  },

  // 19. Smart Database Cylinder (System Architecture & Cloud Store)
  {
    id: 'database-cylinder',
    name: 'Smart Database Cylinder',
    category: 'Flow & Diagrams',
    description:
      'System architecture SQL / Cloud Database drum with adjustable top ellipse cap depth and internal storage tier bands.',
    iconName: 'Database',
    isBuiltIn: true,
    paramSchema: [
      {
        key: 'capRatio',
        label: 'Cylinder Cap Depth Ratio',
        type: 'number',
        min: 0.1,
        max: 0.35,
        step: 0.01,
        defaultValue: 0.18,
      },
    ],
    defaultParams: {
      capRatio: 0.18,
    },
    jsSourceCode: `// Osito Smart Database Cylinder (.jsf)
function getControlPoints(width, height, params, helpers) {
  const capRatio = helpers.clamp(Number(params.capRatio) || 0.18, 0.1, 0.35);
  return [
    {
      id: 'capRatio',
      label: \`Cap Depth: \${Math.round(capRatio * 100)}%\`,
      x: width / 2,
      y: height * capRatio * 2,
      cursor: 'ns-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'capRatio') {
    const ratio = helpers.clamp(localY / Math.max(1, height * 2), 0.1, 0.35);
    return {
      ...params,
      capRatio: Number(ratio.toFixed(2))
    };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const ry = helpers.clamp(Number(params.capRatio) || 0.18, 0.1, 0.35) * height;
  const rx = width / 2;
  const cx = width / 2;
  const botCy = height - ry;
  const k = 0.5522847498;
  const kx = rx * k;
  const ky = ry * k;

  const bodyNodes = [
    helpers.cornerNode(0, ry),
    helpers.smoothNode(0, botCy, 0, botCy, 0, botCy + ky),
    helpers.smoothNode(cx, height, cx - kx, height, cx + kx, height),
    helpers.smoothNode(width, botCy, width, botCy + ky, width, botCy),
    helpers.cornerNode(width, ry)
  ];

  return [
    { nodes: bodyNodes, closed: true },
    { nodes: helpers.ellipsePath(cx, ry, rx, ry), closed: true }
  ];
}`,
  },

  // 20. Smart Sitemap Tree Diagram (Parent + 3 Connected Child Pages)
  {
    id: 'sitemap-tree',
    name: 'Smart Sitemap Tree Diagram',
    category: 'Flow & Diagrams',
    description:
      'Instant multi-node hierarchical Sitemap tree with top parent node, orthogonal bus connector lines, and 3 child page cards controlled by yellow diamond handles.',
    iconName: 'Network',
    isBuiltIn: true,
    paramSchema: [
      {
        key: 'busYRatio',
        label: 'Connector Bus Y Ratio',
        type: 'number',
        min: 0.35,
        max: 0.65,
        step: 0.01,
        defaultValue: 0.48,
      },
      {
        key: 'nodeHeightRatio',
        label: 'Card Height Ratio',
        type: 'number',
        min: 0.22,
        max: 0.38,
        step: 0.01,
        defaultValue: 0.3,
      },
    ],
    defaultParams: {
      busYRatio: 0.48,
      nodeHeightRatio: 0.3,
    },
    jsSourceCode: `// Osito Smart Sitemap Tree Diagram (.jsf)
function getControlPoints(width, height, params, helpers) {
  const busY = helpers.clamp(Number(params.busYRatio) || 0.48, 0.35, 0.65);
  const nodeH = helpers.clamp(Number(params.nodeHeightRatio) || 0.3, 0.22, 0.38);
  return [
    {
      id: 'busYRatio',
      label: \`Branch Bus: \${Math.round(busY * 100)}%\`,
      x: width / 2,
      y: height * busY,
      cursor: 'ns-resize'
    },
    {
      id: 'nodeHeightRatio',
      label: \`Card Size: \${Math.round(nodeH * 100)}%\`,
      x: width * 0.68,
      y: height * nodeH,
      cursor: 'ns-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'busYRatio') {
    return {
      ...params,
      busYRatio: Number(helpers.clamp(localY / Math.max(1, height), 0.35, 0.65).toFixed(2))
    };
  }
  if (id === 'nodeHeightRatio') {
    return {
      ...params,
      nodeHeightRatio: Number(helpers.clamp(localY / Math.max(1, height), 0.22, 0.38).toFixed(2))
    };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const busY = helpers.clamp(Number(params.busYRatio) || 0.48, 0.35, 0.65) * height;
  const cardH = helpers.clamp(Number(params.nodeHeightRatio) || 0.3, 0.22, 0.38) * height;
  const rootW = width * 0.36;
  const rootX = (width - rootW) / 2;
  const childW = width * 0.28;
  const gap = (width - childW * 3) / 2;
  const childY = height - cardH;

  const c1x = childW / 2;
  const c2x = width / 2;
  const c3x = width - childW / 2;

  return [
    // Root Page Card
    { nodes: helpers.rectPath(rootX, 0, rootW, cardH, 0), closed: true },
    // 3 Child Page Cards
    { nodes: helpers.rectPath(0, childY, childW, cardH, 0), closed: true },
    { nodes: helpers.rectPath(childW + gap, childY, childW, cardH, 0), closed: true },
    { nodes: helpers.rectPath((childW + gap) * 2, childY, childW, cardH, 0), closed: true },
    // Orthogonal Connector Stem & Horizontal Bus
    { nodes: [helpers.cornerNode(c2x, cardH), helpers.cornerNode(c2x, childY)], closed: false },
    {
      nodes: [
        helpers.cornerNode(c1x, childY),
        helpers.cornerNode(c1x, busY),
        helpers.cornerNode(c3x, busY),
        helpers.cornerNode(c3x, childY)
      ],
      closed: false
    }
  ];
}`,
  },
  ...WEB_LAYOUT_AND_UI_AUTOSHAPES,
  ...SITEMAP_AND_FLOW_AUTOSHAPES,
  ...DRONE_PARTS_AND_FRAMES_AUTOSHAPES,
  // 17. Smart Regular Polygon & Hexagon Core
  {
    id: 'polygon',
    name: 'Smart Regular Polygon',
    category: 'Creative & Vector',
    description:
      'Regular geometric polygon (triangle, diamond, pentagon, hexagon, octagon) with side count, rotation angle, and optional inner core cutout.',
    iconName: 'Hexagon',
    isBuiltIn: true,
    paramSchema: [
      {
        key: 'sides',
        label: 'Polygon Sides',
        type: 'number',
        min: 3,
        max: 16,
        step: 1,
        defaultValue: 6,
      },
      {
        key: 'angleDeg',
        label: 'Rotation Offset (deg)',
        type: 'number',
        min: -180,
        max: 180,
        step: 5,
        defaultValue: 0,
      },
      {
        key: 'cutoutRatio',
        label: 'Inner Core Cutout',
        type: 'number',
        min: 0,
        max: 0.8,
        step: 0.02,
        defaultValue: 0,
      },
    ],
    defaultParams: {
      sides: 6,
      angleDeg: 0,
      cutoutRatio: 0,
    },
    jsSourceCode: `// Osito Smart Regular Polygon (.jsf)
function getControlPoints(width, height, params, helpers) {
  const sides = Math.round(helpers.clamp(Number(params.sides) || 6, 3, 16));
  const cutout = helpers.clamp(Number(params.cutoutRatio) ?? 0, 0, 0.8);
  const cx = width / 2;
  const cy = height / 2;
  const ry = height / 2;

  return [
    {
      id: 'sides',
      label: \`Sides: \${sides}\`,
      x: helpers.lerp(width * 0.2, width * 0.8, (sides - 3) / 13),
      y: 8,
      cursor: 'ew-resize'
    },
    {
      id: 'cutoutRatio',
      label: \`Cutout: \${Math.round(cutout * 100)}%\`,
      x: cx,
      y: cy - ry * cutout,
      cursor: 'ns-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'sides') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, sides: Math.round(3 + t * 13) };
  }
  if (id === 'cutoutRatio') {
    const cy = height / 2;
    const ry = Math.max(10, height / 2);
    const ratio = helpers.clamp(Math.abs(cy - localY) / ry, 0, 0.8);
    return { ...params, cutoutRatio: Number(ratio.toFixed(2)) };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const sides = Math.round(helpers.clamp(Number(params.sides) || 6, 3, 16));
  const angleOffset = helpers.degToRad(Number(params.angleDeg) || 0);
  const cutout = helpers.clamp(Number(params.cutoutRatio) ?? 0, 0, 0.8);
  const cx = width / 2;
  const cy = height / 2;
  const rx = width / 2;
  const ry = height / 2;

  const outerPts = [];
  const innerPts = [];
  for (let i = 0; i < sides; i++) {
    const a = -Math.PI / 2 + angleOffset + (i * Math.PI * 2) / sides;
    outerPts.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry });
    if (cutout > 0.04) {
      innerPts.push({
        x: cx + Math.cos(a) * rx * cutout,
        y: cy + Math.sin(a) * ry * cutout
      });
    }
  }

  const paths = [{ nodes: helpers.polygonPath(outerPts), closed: true }];
  if (innerPts.length > 0) {
    paths.push({ nodes: helpers.polygonPath(innerPts), closed: true });
  }
  return paths;
}`,
  },
  // 18. Smart Security Shield Crest
  {
    id: 'badge-shield',
    name: 'Smart Security Shield Crest',
    category: 'Badges & Icons',
    description:
      'Heraldic & cybersecurity shield crest with adjustable shoulder height and lower tip curvature.',
    iconName: 'Shield',
    isBuiltIn: true,
    paramSchema: [
      {
        key: 'shoulderRatio',
        label: 'Shoulder Height Ratio',
        type: 'number',
        min: 0.15,
        max: 0.65,
        step: 0.01,
        defaultValue: 0.42,
      },
      {
        key: 'tipCurve',
        label: 'Bottom Tip Curve',
        type: 'number',
        min: 0.15,
        max: 0.9,
        step: 0.01,
        defaultValue: 0.55,
      },
    ],
    defaultParams: {
      shoulderRatio: 0.42,
      tipCurve: 0.55,
    },
    jsSourceCode: `// Osito Smart Security Shield Crest (.jsf)
function getControlPoints(width, height, params, helpers) {
  const shoulder = helpers.clamp(Number(params.shoulderRatio) || 0.42, 0.15, 0.65);
  const curve = helpers.clamp(Number(params.tipCurve ?? params.curveTension) || 0.55, 0.15, 0.9);
  return [
    {
      id: 'shoulderRatio',
      label: \`Shoulder: \${Math.round(shoulder * 100)}%\`,
      x: width,
      y: height * shoulder,
      cursor: 'ns-resize'
    },
    {
      id: 'tipCurve',
      label: \`Curve: \${Math.round(curve * 100)}%\`,
      x: width * 0.5,
      y: height * (0.55 + curve * 0.35),
      cursor: 'ns-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'shoulderRatio') {
    return {
      ...params,
      shoulderRatio: Number(helpers.clamp(localY / Math.max(1, height), 0.15, 0.65).toFixed(2))
    };
  }
  if (id === 'tipCurve') {
    const c = helpers.clamp((localY / Math.max(1, height) - 0.55) / 0.35, 0.15, 0.9);
    return {
      ...params,
      tipCurve: Number(c.toFixed(2)),
      curveTension: Number(c.toFixed(2))
    };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const shoulderY = helpers.clamp(Number(params.shoulderRatio) || 0.42, 0.15, 0.65) * height;
  const curve = helpers.clamp(Number(params.tipCurve ?? params.curveTension) || 0.55, 0.15, 0.9);
  const cx = width / 2;

  const nodes = [
    helpers.cornerNode(cx, 0, 'sh_top'),
    helpers.cornerNode(width, height * 0.1, 'sh_tr'),
    helpers.smoothNode(
      width,
      shoulderY,
      width,
      shoulderY * 0.7,
      width,
      shoulderY + (height - shoulderY) * curve,
      'sh_r'
    ),
    helpers.smoothNode(
      cx,
      height,
      cx + width * 0.28 * curve,
      height * 0.94,
      cx - width * 0.28 * curve,
      height * 0.94,
      'sh_tip'
    ),
    helpers.smoothNode(
      0,
      shoulderY,
      0,
      shoulderY + (height - shoulderY) * curve,
      0,
      shoulderY * 0.7,
      'sh_l'
    ),
    helpers.cornerNode(0, height * 0.1, 'sh_tl')
  ];
  return [{ nodes, closed: true }];
}`,
  },
];

export const DEFAULT_AUTOSHAPES: AutoShapeDefinition[] =
  RAW_DEFAULT_AUTOSHAPES.map((shape): AutoShapeDefinition => {
    const isFlowOrSitemapOrDrone =
      shape.category === 'Flow & Diagrams' ||
      shape.category === 'Drone Parts & Frames' ||
      shape.id.startsWith('sitemap-') ||
      shape.id.startsWith('flow-') ||
      shape.id === 'workflow-decision' ||
      shape.id === 'database-cylinder';

    if (!isFlowOrSitemapOrDrone) {
      return shape;
    }

    const hasLabelSchema = shape.paramSchema.some((p) => p.key === 'label');
    const conciseDefault =
      typeof shape.defaultParams.label === 'string'
        ? shape.defaultParams.label
        : shape.name
            .replace(/^(Smart|Sitemap|Flowchart|Flow|Drone|Drone Part):\s*/i, '')
            .replace(/^Smart\s+/i, '')
            .replace(/\s+Node$/i, '')
            .slice(0, 22);

    return {
      ...shape,
      paramSchema: hasLabelSchema
        ? shape.paramSchema
        : [
            {
              key: 'label',
              label: 'Centered Node Text',
              type: 'string',
              defaultValue: conciseDefault,
            },
            ...shape.paramSchema,
          ],
      defaultParams: {
        label: conciseDefault,
        ...shape.defaultParams,
      },
    };
  });

/**
 * Starter template when clicking "+ New Custom JS AutoShape" in the AutoShape Code Studio
 */
export const AUTOSHAPE_STARTER_TEMPLATE = `// Custom Osito Smart Shape (.jsf)
// Available helpers:
//   helpers.cornerNode(x, y), helpers.smoothNode(x, y, cp1x, cp1y, cp2x, cp2y)
//   helpers.rectPath(x, y, w, h, r), helpers.ellipsePath(cx, cy, rx, ry)
//   helpers.polygonPath(points), helpers.arcNodes(cx, cy, rx, ry, startDeg, sweepDeg)
//   helpers.clamp(val, min, max), helpers.degToRad(deg), helpers.radToDeg(rad)

function getControlPoints(width, height, params, helpers) {
  const insetRatio = helpers.clamp(Number(params.insetRatio) || 0.22, 0.05, 0.45);
  return [
    {
      id: 'inset',
      label: \`Notch: \${Math.round(insetRatio * 100)}%\`,
      x: width * insetRatio,
      y: height / 2,
      cursor: 'ew-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'inset') {
    const ratio = helpers.clamp(localX / Math.max(1, width), 0.05, 0.45);
    return {
      ...params,
      insetRatio: Number(ratio.toFixed(2))
    };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const inset = helpers.clamp(Number(params.insetRatio) || 0.22, 0.05, 0.45) * width;
  const pts = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width - inset, y: height / 2 },
    { x: width, y: height },
    { x: 0, y: height },
    { x: inset, y: height / 2 }
  ];
  return [{ nodes: helpers.polygonPath(pts), closed: true }];
}`;

/**
 * Load user-created custom AutoShape definitions from localStorage.
 */
export function loadCustomAutoShapes(): AutoShapeDefinition[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(CUSTOM_AUTOSHAPES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is AutoShapeDefinition =>
        Boolean(item && typeof item.id === 'string' && typeof item.jsSourceCode === 'string')
    );
  } catch {
    return [];
  }
}

/**
 * Persist user-created custom AutoShape definitions to localStorage.
 */
export function saveCustomAutoShapes(defs: AutoShapeDefinition[]): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    const customOnly = defs.filter((d) => !d.isBuiltIn);
    window.localStorage.setItem(CUSTOM_AUTOSHAPES_STORAGE_KEY, JSON.stringify(customOnly));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Parses an SVG path string (supporting M, L, Q, C, A, Z commands) into BezierNode[]
 * so AutoShape `.jsf` scripts can return either `{ nodes, closed }` or `{ d, closed }`.
 */
function parseSvgPathStringToNodes(
  dStr: string,
  defaultClosed: boolean,
  helpers: AutoShapeHelpers
): { nodes: BezierNode[]; closed: boolean } {
  const tokens = dStr.match(/[MLQCAZmlqcaz]|[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g);
  if (!tokens || tokens.length === 0) {
    return { nodes: [], closed: defaultClosed };
  }

  const nodes: BezierNode[] = [];
  let closed = defaultClosed;
  let i = 0;
  let cmd = 'M';

  const readNum = (): number => {
    const val = Number(tokens[i++]);
    return Number.isFinite(val) ? val : 0;
  };

  while (i < tokens.length) {
    const tok = tokens[i];
    if (/^[MLQCAZmlqcaz]$/.test(tok)) {
      cmd = tok.toUpperCase();
      i++;
      if (cmd === 'Z') {
        closed = true;
        continue;
      }
    }

    if (cmd === 'M' || cmd === 'L') {
      const x = readNum();
      const y = readNum();
      nodes.push(helpers.cornerNode(x, y));
      if (cmd === 'M') cmd = 'L';
    } else if (cmd === 'Q') {
      const cx = readNum();
      const cy = readNum();
      const x = readNum();
      const y = readNum();
      const prev = nodes[nodes.length - 1] || helpers.cornerNode(cx, cy);
      prev.cp2x = prev.x + (2 / 3) * (cx - prev.x);
      prev.cp2y = prev.y + (2 / 3) * (cy - prev.y);
      prev.pointType = 'smooth';
      nodes.push(
        helpers.smoothNode(
          x,
          y,
          x + (2 / 3) * (cx - x),
          y + (2 / 3) * (cy - y),
          x,
          y
        )
      );
    } else if (cmd === 'C') {
      const c1x = readNum();
      const c1y = readNum();
      const c2x = readNum();
      const c2y = readNum();
      const x = readNum();
      const y = readNum();
      const prev = nodes[nodes.length - 1] || helpers.cornerNode(c1x, c1y);
      prev.cp2x = c1x;
      prev.cp2y = c1y;
      prev.pointType = 'smooth';
      nodes.push(helpers.smoothNode(x, y, c2x, c2y, x, y));
    } else if (cmd === 'A') {
      let rx = Math.max(0.5, Math.abs(readNum()));
      let ry = Math.max(0.5, Math.abs(readNum()));
      readNum(); // xAxisRotation
      const largeArc = readNum() !== 0;
      const sweep = readNum() !== 0;
      const x2 = readNum();
      const y2 = readNum();
      const prev = nodes[nodes.length - 1] || helpers.cornerNode(x2, y2);
      const x1 = prev.x;
      const y1 = prev.y;
      const dx2 = (x1 - x2) / 2;
      const dy2 = (y1 - y2) / 2;
      const lambda = (dx2 * dx2) / (rx * rx) + (dy2 * dy2) / (ry * ry);
      if (lambda > 1) {
        const s = Math.sqrt(lambda);
        rx *= s;
        ry *= s;
      }
      const rx2 = rx * rx;
      const ry2 = ry * ry;
      const num = Math.max(0, rx2 * ry2 - rx2 * dy2 * dy2 - ry2 * dx2 * dx2);
      const den = Math.max(0.0001, rx2 * dy2 * dy2 + ry2 * dx2 * dx2);
      const sign = largeArc === sweep ? -1 : 1;
      const coef = sign * Math.sqrt(num / den);
      const cxp = coef * ((rx * dy2) / ry);
      const cyp = coef * (-(ry * dx2) / rx);
      const cx = cxp + (x1 + x2) / 2;
      const cy = cyp + (y1 + y2) / 2;
      const theta1 = Math.atan2((y1 - cy) / ry, (x1 - cx) / rx);
      const theta2 = Math.atan2((y2 - cy) / ry, (x2 - cx) / rx);
      let dTheta = theta2 - theta1;
      if (!sweep && dTheta > 0) dTheta -= Math.PI * 2;
      if (sweep && dTheta < 0) dTheta += Math.PI * 2;
      const arcPts = helpers.arcNodes(
        cx,
        cy,
        rx,
        ry,
        helpers.radToDeg(theta1),
        helpers.radToDeg(dTheta)
      );
      if (arcPts.length > 0) {
        prev.cp2x = arcPts[0].cp2x;
        prev.cp2y = arcPts[0].cp2y;
        prev.pointType = 'smooth';
        for (let k = 1; k < arcPts.length; k++) {
          nodes.push(arcPts[k]);
        }
      } else {
        nodes.push(helpers.cornerNode(x2, y2));
      }
    } else {
      i++;
    }
  }

  if (closed && nodes.length > 2) {
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (Math.hypot(first.x - last.x, first.y - last.y) < 0.5) {
      first.cp1x = last.cp1x;
      first.cp1y = last.cp1y;
      nodes.pop();
    }
  }

  return { nodes, closed };
}

/**
 * Normalizes any user-returned node or path structure into strict BezierNode paths.
 */
function normalizeEvaluatedPaths(
  rawPaths: unknown,
  helpers: AutoShapeHelpers
): Array<{ nodes: BezierNode[]; closed: boolean }> {
  if (!rawPaths) {
    return [];
  }

  // Support single path object `{ nodes, closed }` or direct `BezierNode[]` array returned by `buildNodes()`
  let candidateList: unknown[];
  if (Array.isArray(rawPaths)) {
    if (
      rawPaths.length > 0 &&
      typeof rawPaths[0] === 'object' &&
      rawPaths[0] !== null &&
      !('nodes' in (rawPaths[0] as Record<string, unknown>)) &&
      !('d' in (rawPaths[0] as Record<string, unknown>)) &&
      'x' in (rawPaths[0] as Record<string, unknown>)
    ) {
      candidateList = [{ nodes: rawPaths, closed: true }];
    } else {
      candidateList = rawPaths;
    }
  } else if (
    typeof rawPaths === 'object' &&
    ('nodes' in (rawPaths as Record<string, unknown>) ||
      'd' in (rawPaths as Record<string, unknown>))
  ) {
    candidateList = [rawPaths];
  } else {
    return [];
  }

  return candidateList
    .map((item, pathIndex) => {
      if (!item || typeof item !== 'object') return null;
      const itemObj = item as { nodes?: unknown; d?: unknown; closed?: boolean };
      let rawNodes = itemObj.nodes;
      let closed = itemObj.closed !== false;

      if (!rawNodes && 'd' in itemObj) {
        closed = Boolean(itemObj.closed);
        if (Array.isArray(itemObj.d)) {
          rawNodes = itemObj.d;
        } else if (typeof itemObj.d === 'string') {
          const parsed = parseSvgPathStringToNodes(itemObj.d, closed, helpers);
          rawNodes = parsed.nodes;
          closed = parsed.closed;
        }
      }

      if (!Array.isArray(rawNodes) || rawNodes.length === 0) return null;

      const nodes: BezierNode[] = rawNodes.map((n, nodeIndex) => {
        const nodeObj = (n || {}) as Partial<BezierNode>;
        const x = Number.isFinite(nodeObj.x) ? Number(nodeObj.x) : 0;
        const y = Number.isFinite(nodeObj.y) ? Number(nodeObj.y) : 0;
        const cp1x = Number.isFinite(nodeObj.cp1x) ? Number(nodeObj.cp1x) : x;
        const cp1y = Number.isFinite(nodeObj.cp1y) ? Number(nodeObj.cp1y) : y;
        const cp2x = Number.isFinite(nodeObj.cp2x) ? Number(nodeObj.cp2x) : x;
        const cp2y = Number.isFinite(nodeObj.cp2y) ? Number(nodeObj.cp2y) : y;
        const pointType =
          nodeObj.pointType === 'smooth' || nodeObj.pointType === 'symmetric'
            ? nodeObj.pointType
            : 'corner';

        return {
          id:
            typeof nodeObj.id === 'string' && nodeObj.id
              ? nodeObj.id
              : `as_p${pathIndex}_n${nodeIndex}`,
          x,
          y,
          cp1x,
          cp1y,
          cp2x,
          cp2y,
          pointType,
        };
      });

      return { nodes, closed };
    })
    .filter((p): p is { nodes: BezierNode[]; closed: boolean } => p !== null);
}

const evalRunnerCache = new Map<string, Function>();
const dragRunnerCache = new Map<string, Function>();
const previewRunnerCache = new Map<string, Function>();

/**
 * Evaluates a Programmable JS AutoShape definition in a sandboxed function scope,
 * returning yellow diamond control handles and cubic Bezier vector sub-paths.
 */
export function evaluateAutoShape(
  def: AutoShapeDefinition,
  width: number,
  height: number,
  params: Record<string, any>,
  customCodeOverride?: string
): {
  controlPoints: AutoShapeControlPoint[];
  paths: Array<{ nodes: BezierNode[]; closed: boolean }>;
  error?: string;
} {
  const safeDef = def || DEFAULT_AUTOSHAPES[0];
  const safeW = Math.max(4, Number.isFinite(width) ? width : 100);
  const safeH = Math.max(4, Number.isFinite(height) ? height : 100);
  const mergedParams: Record<string, any> = {
    ...(safeDef?.defaultParams || {}),
    ...(params || {}),
  };
  const code =
    customCodeOverride && customCodeOverride.trim().length > 0
      ? customCodeOverride
      : safeDef?.jsSourceCode || DEFAULT_AUTOSHAPES[0].jsSourceCode;
  const helpers = createAutoShapeHelpers();

  try {
    let runner = evalRunnerCache.get(code);
    if (!runner) {
      runner = new Function(
        'width',
        'height',
        'params',
        'helpers',
        `"use strict";
${code}
const _cp = typeof getControlPoints === 'function'
  ? getControlPoints(width, height, params, helpers)
  : [];
const _paths = typeof buildPaths === 'function'
  ? buildPaths(width, height, params, helpers)
  : (typeof buildNodes === 'function' ? buildNodes(width, height, params, helpers) : []);
return { controlPoints: _cp, paths: _paths };`
      );
      evalRunnerCache.set(code, runner);
    }

    const result = runner(safeW, safeH, mergedParams, helpers);
    const rawControlPoints = Array.isArray(result?.controlPoints) ? result.controlPoints : [];
    const controlPoints: AutoShapeControlPoint[] = rawControlPoints
      .filter((cp: any) => cp && typeof cp.id === 'string')
      .map((cp: any) => ({
        id: String(cp.id),
        label: typeof cp.label === 'string' ? cp.label : String(cp.id),
        x: Number.isFinite(cp.x) ? Number(cp.x) : 0,
        y: Number.isFinite(cp.y) ? Number(cp.y) : 0,
        cursor: typeof cp.cursor === 'string' ? cp.cursor : 'pointer',
      }));

    const paths = normalizeEvaluatedPaths(result?.paths, helpers);
    return { controlPoints, paths };
  } catch (err: any) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      controlPoints: [],
      paths: [{ nodes: helpers.rectPath(0, 0, safeW, safeH, 0), closed: true }],
      error: message,
    };
  }
}

/**
 * Invokes `onDragControlPoint` inside the AutoShape's JS script when a yellow diamond handle is dragged.
 */
export function dragAutoShapeControlPoint(
  def: AutoShapeDefinition,
  controlId: string,
  localX: number,
  localY: number,
  width: number,
  height: number,
  params: Record<string, any>,
  customCodeOverride?: string
): Record<string, any> {
  const safeDef = def || DEFAULT_AUTOSHAPES[0];
  const safeW = Math.max(4, Number.isFinite(width) ? width : 100);
  const safeH = Math.max(4, Number.isFinite(height) ? height : 100);
  const mergedParams: Record<string, any> = {
    ...(safeDef?.defaultParams || {}),
    ...(params || {}),
  };
  const code =
    customCodeOverride && customCodeOverride.trim().length > 0
      ? customCodeOverride
      : safeDef?.jsSourceCode || DEFAULT_AUTOSHAPES[0].jsSourceCode;
  const helpers = createAutoShapeHelpers();

  try {
    let runner = dragRunnerCache.get(code);
    if (!runner) {
      runner = new Function(
        'id',
        'localX',
        'localY',
        'width',
        'height',
        'params',
        'helpers',
        `"use strict";
${code}
if (typeof onDragControlPoint === 'function') {
  return onDragControlPoint(id, localX, localY, width, height, params, helpers);
}
return params;`
      );
      dragRunnerCache.set(code, runner);
    }

    const updated = runner(controlId, localX, localY, safeW, safeH, mergedParams, helpers);
    if (updated && typeof updated === 'object') {
      return { ...mergedParams, ...updated };
    }
    return mergedParams;
  } catch {
    return mergedParams;
  }
}

/**
 * Executes live interactive widget behavior when a user clicks or drags an AutoShape in Live Preview Mode.
 * Supports both explicit `onPreviewClick(localX, localY, width, height, params, helpers)` functions in `.jsf`
 * scripts AND intelligent universal fallback interactions (toggling switches/checkboxes/modals, switching
 * tabs/steps/pages, scrubbing sliders/progress bars/gauges, or cycling wireframe layouts).
 */
export function interactAutoShapeInPreview(
  def: AutoShapeDefinition,
  localX: number,
  localY: number,
  width: number,
  height: number,
  params: Record<string, any>,
  customCodeOverride?: string,
  isDragMove = false
): { params: Record<string, any>; changed: boolean } {
  const safeDef = def || DEFAULT_AUTOSHAPES[0];
  const safeW = Math.max(4, Number.isFinite(width) ? width : 100);
  const safeH = Math.max(4, Number.isFinite(height) ? height : 100);
  const mergedParams: Record<string, any> = {
    ...(safeDef?.defaultParams || {}),
    ...(params || {}),
  };
  const code =
    customCodeOverride && customCodeOverride.trim().length > 0
      ? customCodeOverride
      : safeDef?.jsSourceCode || DEFAULT_AUTOSHAPES[0].jsSourceCode;
  const helpers = createAutoShapeHelpers();

  try {
    let runner = previewRunnerCache.get(code);
    if (!runner) {
      runner = new Function(
        'localX',
        'localY',
        'width',
        'height',
        'params',
        'helpers',
        'isDragMove',
        `"use strict";
${code}
if (typeof onPreviewClick === 'function') {
  return { handled: true, next: onPreviewClick(localX, localY, width, height, params, helpers, isDragMove) };
}
return { handled: false, next: null };`
      );
      previewRunnerCache.set(code, runner);
    }

    const res = runner(localX, localY, safeW, safeH, mergedParams, helpers, isDragMove);
    if (res && res.handled && res.next && typeof res.next === 'object') {
      return { params: { ...mergedParams, ...res.next }, changed: true };
    }
  } catch {
    // Fall through to universal parameter interaction
  }

  // Universal fallback interaction for built-in or custom AutoShapes without explicit `onPreviewClick`:
  const nextParams = { ...mergedParams };
  const rx = helpers.clamp(localX / safeW, 0, 1);

  // 1. Toggle switch knob (`knobRatio` or `stateRatio`)
  if ('knobRatio' in nextParams) {
    if (isDragMove) {
      nextParams.knobRatio = Number(helpers.clamp(rx, 0.05, 0.95).toFixed(2));
    } else {
      nextParams.knobRatio = Number(nextParams.knobRatio) >= 0.5 ? 0.05 : 0.95;
    }
    return { params: nextParams, changed: true };
  }
  if ('stateRatio' in nextParams) {
    if (isDragMove) {
      nextParams.stateRatio = Number(helpers.clamp(rx, 0, 1).toFixed(2));
    } else {
      nextParams.stateRatio = Number(nextParams.stateRatio) >= 0.5 ? 0.12 : 0.88;
    }
    return { params: nextParams, changed: true };
  }

  // 2. Continuous progress / slider / gauge / bar parameters
  for (const ratioKey of ['fillRatio', 'progress', 'valueRatio', 'sliderRatio', 'cutoutRatio']) {
    if (ratioKey in nextParams) {
      const schemaMeta = def?.paramSchema?.find((p) => p.key === ratioKey);
      const minV = schemaMeta?.min ?? 0.05;
      const maxV = schemaMeta?.max ?? 0.98;
      nextParams[ratioKey] = Number(helpers.lerp(minV, maxV, rx).toFixed(2));
      return { params: nextParams, changed: true };
    }
  }

  // 3. Pie / Donut sweep angle
  if ('sweepDeg' in nextParams) {
    nextParams.sweepDeg = Math.round(helpers.lerp(45, 345, rx));
    return { params: nextParams, changed: true };
  }

  // 4. Boolean toggle parameters (only on click, not continuous drag)
  if (!isDragMove) {
    const boolMeta = def?.paramSchema?.find((p) => p.type === 'boolean');
    if (boolMeta && boolMeta.key in nextParams) {
      nextParams[boolMeta.key] = !nextParams[boolMeta.key];
      return { params: nextParams, changed: true };
    }
  }

  // 5. Discrete count / tab / step / column parameters (cycle on click or scrub across width)
  const intMeta = def?.paramSchema?.find(
    (p) => p.type === 'number' && (p.step === 1 || Number.isInteger(p.defaultValue))
  );
  if (intMeta) {
    const minV = intMeta.min ?? 1;
    const maxV = intMeta.max ?? 8;
    if (isDragMove) {
      nextParams[intMeta.key] = Math.round(helpers.lerp(minV, maxV, rx));
    } else {
      const cur = Math.round(Number(nextParams[intMeta.key]) || minV);
      nextParams[intMeta.key] = cur >= maxV ? minV : cur + 1;
    }
    return { params: nextParams, changed: true };
  }

  // 6. Fallback: if shape has at least one control point, delegate to `dragAutoShapeControlPoint`
  const evaluated = evaluateAutoShape(def, safeW, safeH, mergedParams, customCodeOverride);
  if (evaluated.controlPoints.length > 0) {
    const cp0 = evaluated.controlPoints[0];
    const dragged = dragAutoShapeControlPoint(
      def,
      cp0.id,
      localX,
      localY,
      safeW,
      safeH,
      mergedParams,
      customCodeOverride
    );
    return { params: dragged, changed: true };
  }

  return { params: mergedParams, changed: false };
}

/**
 * Flattens a live AutoShapeObject into an editable VectorPathObject so the Subselection Tool (A)
 * can directly manipulate individual cubic Bezier anchor nodes and control handles.
 */
export function convertAutoShapeToVectorPath(
  obj: AutoShapeObject,
  def: AutoShapeDefinition
): VectorPathObject {
  const evaluated = evaluateAutoShape(def, obj.width, obj.height, obj.params, obj.customCode);
  const flattenedNodes: BezierNode[] = [];
  let isClosed = true;

  if (evaluated.paths.length > 0) {
    isClosed = evaluated.paths[0].closed;
    evaluated.paths.forEach((subPath, pIdx) => {
      subPath.nodes.forEach((node, nIdx) => {
        flattenedNodes.push({
          ...node,
          id: `${obj.id}_p${pIdx}_n${nIdx}`,
        });
      });
    });
  }

  return {
    id: obj.id,
    name: `${obj.name} (Vector Path)`,
    type: 'vector-path',
    visible: obj.visible,
    locked: obj.locked,
    x: obj.x,
    y: obj.y,
    width: obj.width,
    height: obj.height,
    rotation: obj.rotation,
    opacity: obj.opacity,
    blendMode: obj.blendMode,
    fill: obj.fill,
    fillType: obj.fillType,
    fillGradientEnd: obj.fillGradientEnd,
    stroke: obj.stroke,
    strokeWidth: obj.strokeWidth,
    strokeAlign: obj.strokeAlign,
    pixelSnap: obj.pixelSnap,
    shadow: { ...obj.shadow },
    activeState: obj.activeState,
    stateVariants: obj.stateVariants ? { ...obj.stateVariants } : undefined,
    params: obj.params ? { ...obj.params } : undefined,
    nodes: flattenedNodes,
    closed: isClosed,
  };
}

/**
 * Tier-1 Deterministic Procedural JS AutoShape Generator ($0.00 offline fallback)
 * Matches natural-language prompts (shield, badge, lightning, bolt, cross, plus, heart,
 * diamond, chevron, cylinder, resistor, circuit, bracket, ribbon, banner, polygon, hexagon)
 * and synthesizes complete, runnable Osito `.jsf` AutoShape definitions with yellow diamond handles.
 */
export function generateProceduralAutoShapeFromPrompt(prompt: string): AutoShapeDefinition {
  const q = prompt.trim().toLowerCase();
  const stamp = Date.now().toString(36);

  // 1. Lightning Bolt / Energy Badge
  if (q.includes('lightning') || q.includes('bolt') || q.includes('flash') || q.includes('zap')) {
    return {
      id: `custom-lightning-${stamp}`,
      name: 'Smart Lightning Bolt',
      category: 'Custom JS',
      description: `Generated from "${prompt}" — Parametric lightning bolt with waist thickness handle.`,
      iconName: 'Zap',
      isBuiltIn: false,
      paramSchema: [
        {
          key: 'waistRatio',
          label: 'Bolt Waist Width',
          type: 'number',
          min: 0.12,
          max: 0.65,
          step: 0.01,
          defaultValue: 0.32,
        },
        {
          key: 'slantRatio',
          label: 'Midbar Vertical Shift',
          type: 'number',
          min: 0.3,
          max: 0.7,
          step: 0.01,
          defaultValue: 0.48,
        },
      ],
      defaultParams: { waistRatio: 0.32, slantRatio: 0.48 },
      jsSourceCode: `// Smart Lightning Bolt (.jsf)
function getControlPoints(width, height, params, helpers) {
  const waist = helpers.clamp(Number(params.waistRatio) || 0.32, 0.12, 0.65);
  const slant = helpers.clamp(Number(params.slantRatio) || 0.48, 0.3, 0.7);
  return [
    {
      id: 'waist',
      label: \`Waist: \${Math.round(waist * 100)}%\`,
      x: width * (0.5 + waist / 2),
      y: height * slant,
      cursor: 'move'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'waist') {
    const wRatio = helpers.clamp(Math.abs(localX - width * 0.5) * 2 / Math.max(1, width), 0.12, 0.65);
    const sRatio = helpers.clamp(localY / Math.max(1, height), 0.3, 0.7);
    return {
      ...params,
      waistRatio: Number(wRatio.toFixed(2)),
      slantRatio: Number(sRatio.toFixed(2))
    };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const waist = helpers.clamp(Number(params.waistRatio) || 0.32, 0.12, 0.65);
  const slant = helpers.clamp(Number(params.slantRatio) || 0.48, 0.3, 0.7);
  const midY = height * slant;
  const halfW = (width * waist) / 2;

  const pts = [
    { x: width * 0.62, y: 0 },
    { x: width * 0.12, y: midY + height * 0.05 },
    { x: width * 0.5 - halfW * 0.25, y: midY + height * 0.05 },
    { x: width * 0.34, y: height },
    { x: width * 0.88, y: midY - height * 0.05 },
    { x: width * 0.5 + halfW * 0.25, y: midY - height * 0.05 }
  ];
  return [{ nodes: helpers.polygonPath(pts), closed: true }];
}`,
    };
  }

  // 2. Circuit Resistor / Electronic Symbol
  if (q.includes('resistor') || q.includes('circuit') || q.includes('schematic') || q.includes('coil')) {
    return {
      id: `custom-resistor-${stamp}`,
      name: 'Smart Circuit Resistor',
      category: 'Flow & Diagrams',
      description: `Generated from "${prompt}" — IEEE zig-zag schematic resistor with adjustable lead length and zig-zag count.`,
      iconName: 'Cpu',
      isBuiltIn: false,
      paramSchema: [
        {
          key: 'leadRatio',
          label: 'Lead Length Ratio',
          type: 'number',
          min: 0.08,
          max: 0.38,
          step: 0.01,
          defaultValue: 0.2,
        },
        {
          key: 'peaks',
          label: 'Zig-Zag Peaks',
          type: 'number',
          min: 3,
          max: 12,
          step: 1,
          defaultValue: 6,
        },
      ],
      defaultParams: { leadRatio: 0.2, peaks: 6 },
      jsSourceCode: `// Smart IEEE Circuit Resistor (.jsf)
function getControlPoints(width, height, params, helpers) {
  const lead = helpers.clamp(Number(params.leadRatio) || 0.2, 0.08, 0.38);
  const peaks = Math.round(helpers.clamp(Number(params.peaks) || 6, 3, 12));
  return [
    {
      id: 'lead',
      label: \`Lead: \${Math.round(lead * 100)}%\`,
      x: width * lead,
      y: height / 2,
      cursor: 'ew-resize'
    },
    {
      id: 'peaks',
      label: \`Peaks: \${peaks}\`,
      x: helpers.lerp(width * 0.25, width * 0.75, (peaks - 3) / 9),
      y: 6,
      cursor: 'ew-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'lead') {
    const ratio = helpers.clamp(localX / Math.max(1, width), 0.08, 0.38);
    return { ...params, leadRatio: Number(ratio.toFixed(2)) };
  }
  if (id === 'peaks') {
    const t = helpers.clamp((localX - width * 0.25) / (width * 0.5), 0, 1);
    return { ...params, peaks: Math.round(3 + t * 9) };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const lead = helpers.clamp(Number(params.leadRatio) || 0.2, 0.08, 0.38) * width;
  const peaks = Math.round(helpers.clamp(Number(params.peaks) || 6, 3, 12));
  const bodyW = width - lead * 2;
  const midY = height / 2;
  const amp = height * 0.42;

  const pts = [
    { x: 0, y: midY },
    { x: lead, y: midY }
  ];
  for (let i = 0; i < peaks; i++) {
    const t = (i + 0.5) / peaks;
    const dir = i % 2 === 0 ? -1 : 1;
    pts.push({ x: lead + bodyW * t, y: midY + dir * amp });
  }
  pts.push({ x: width - lead, y: midY });
  pts.push({ x: width, y: midY });

  return [{ nodes: helpers.polygonPath(pts, false), closed: false }];
}`,
    };
  }

  // 3. Shield / Security Crest Badge
  if (q.includes('shield') || q.includes('badge') || q.includes('crest') || q.includes('emblem')) {
    return {
      id: `custom-shield-${stamp}`,
      name: 'Smart Security Shield',
      category: 'Custom JS',
      description: `Generated from "${prompt}" — Heraldic & UI security shield with adjustable shoulder height and curve tension.`,
      iconName: 'Shield',
      isBuiltIn: false,
      paramSchema: [
        {
          key: 'shoulderRatio',
          label: 'Shoulder Height Ratio',
          type: 'number',
          min: 0.15,
          max: 0.7,
          step: 0.01,
          defaultValue: 0.38,
        },
        {
          key: 'curveTension',
          label: 'Belly Curve Tension',
          type: 'number',
          min: 0.1,
          max: 0.85,
          step: 0.01,
          defaultValue: 0.45,
        },
      ],
      defaultParams: { shoulderRatio: 0.38, curveTension: 0.45 },
      jsSourceCode: `// Smart Security Shield Crest (.jsf)
function getControlPoints(width, height, params, helpers) {
  const shoulder = helpers.clamp(Number(params.shoulderRatio) || 0.38, 0.15, 0.7);
  const tension = helpers.clamp(Number(params.curveTension) || 0.45, 0.1, 0.85);
  return [
    {
      id: 'shoulder',
      label: \`Shoulder: \${Math.round(shoulder * 100)}%\`,
      x: width,
      y: height * shoulder,
      cursor: 'ns-resize'
    },
    {
      id: 'tension',
      label: \`Curve: \${Math.round(tension * 100)}%\`,
      x: width * (0.5 + tension * 0.45),
      y: height * 0.78,
      cursor: 'ew-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'shoulder') {
    return {
      ...params,
      shoulderRatio: Number(helpers.clamp(localY / Math.max(1, height), 0.15, 0.7).toFixed(2))
    };
  }
  if (id === 'tension') {
    const t = helpers.clamp((localX - width * 0.5) / (width * 0.45), 0.1, 0.85);
    return { ...params, curveTension: Number(t.toFixed(2)) };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const sy = helpers.clamp(Number(params.shoulderRatio) || 0.38, 0.15, 0.7) * height;
  const tension = helpers.clamp(Number(params.curveTension) || 0.45, 0.1, 0.85);
  const cx = width / 2;

  const nodes = [
    helpers.cornerNode(cx, 0),
    helpers.cornerNode(width, sy * 0.25),
    helpers.smoothNode(width, sy, width, sy * 0.6, width, sy + (height - sy) * tension),
    helpers.smoothNode(cx, height, cx + width * tension * 0.5, height * 0.92, cx - width * tension * 0.5, height * 0.92),
    helpers.smoothNode(0, sy, 0, sy + (height - sy) * tension, 0, sy * 0.6),
    helpers.cornerNode(0, sy * 0.25)
  ];
  return [{ nodes, closed: true }];
}`,
    };
  }

  // 4. Cross / Plus Medical & UI Symbol
  if (q.includes('cross') || q.includes('plus') || q.includes('medical') || q.includes('add')) {
    return {
      id: `custom-cross-${stamp}`,
      name: 'Smart Swiss Cross',
      category: 'Custom JS',
      description: `Generated from "${prompt}" — Symmetric cross / plus icon with adjustable arm thickness handle.`,
      iconName: 'Plus',
      isBuiltIn: false,
      paramSchema: [
        {
          key: 'thicknessRatio',
          label: 'Arm Thickness Ratio',
          type: 'number',
          min: 0.1,
          max: 0.8,
          step: 0.01,
          defaultValue: 0.34,
        },
      ],
      defaultParams: { thicknessRatio: 0.34 },
      jsSourceCode: `// Smart Swiss Cross (.jsf)
function getControlPoints(width, height, params, helpers) {
  const ratio = helpers.clamp(Number(params.thicknessRatio) || 0.34, 0.1, 0.8);
  const insetX = width * (0.5 - ratio / 2);
  const insetY = height * (0.5 - ratio / 2);
  return [
    {
      id: 'thickness',
      label: \`Arm Width: \${Math.round(ratio * 100)}%\`,
      x: insetX,
      y: insetY,
      cursor: 'nwse-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'thickness') {
    const dx = Math.abs(localX - width / 2) * 2 / Math.max(1, width);
    const dy = Math.abs(localY - height / 2) * 2 / Math.max(1, height);
    const ratio = helpers.clamp((dx + dy) / 2, 0.1, 0.8);
    return { ...params, thicknessRatio: Number(ratio.toFixed(2)) };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const ratio = helpers.clamp(Number(params.thicknessRatio) || 0.34, 0.1, 0.8);
  const x1 = width * (0.5 - ratio / 2);
  const x2 = width * (0.5 + ratio / 2);
  const y1 = height * (0.5 - ratio / 2);
  const y2 = height * (0.5 + ratio / 2);

  const pts = [
    { x: x1, y: 0 },
    { x: x2, y: 0 },
    { x: x2, y: y1 },
    { x: width, y: y1 },
    { x: width, y: y2 },
    { x: x2, y: y2 },
    { x: x2, y: height },
    { x: x1, y: height },
    { x: x1, y: y2 },
    { x: 0, y: y2 },
    { x: 0, y: y1 },
    { x: x1, y: y1 }
  ];
  return [{ nodes: helpers.polygonPath(pts), closed: true }];
}`,
    };
  }

  // 5. Heart Shape
  if (q.includes('heart') || q.includes('love') || q.includes('card')) {
    return {
      id: `custom-heart-${stamp}`,
      name: 'Smart Bezier Heart',
      category: 'Custom JS',
      description: `Generated from "${prompt}" — Smooth cubic Bezier heart with cleft depth and lobe fullness handles.`,
      iconName: 'Heart',
      isBuiltIn: false,
      paramSchema: [
        {
          key: 'cleftRatio',
          label: 'Top Cleft Depth',
          type: 'number',
          min: 0.08,
          max: 0.45,
          step: 0.01,
          defaultValue: 0.22,
        },
        {
          key: 'lobeSpread',
          label: 'Lobe Spread',
          type: 'number',
          min: 0.3,
          max: 0.9,
          step: 0.01,
          defaultValue: 0.58,
        },
      ],
      defaultParams: { cleftRatio: 0.22, lobeSpread: 0.58 },
      jsSourceCode: `// Smart Cubic Bezier Heart (.jsf)
function getControlPoints(width, height, params, helpers) {
  const cleft = helpers.clamp(Number(params.cleftRatio) || 0.22, 0.08, 0.45);
  const spread = helpers.clamp(Number(params.lobeSpread) || 0.58, 0.3, 0.9);
  return [
    {
      id: 'cleft',
      label: \`Cleft: \${Math.round(cleft * 100)}%\`,
      x: width / 2,
      y: height * cleft,
      cursor: 'ns-resize'
    },
    {
      id: 'spread',
      label: \`Spread: \${Math.round(spread * 100)}%\`,
      x: width,
      y: height * 0.32,
      cursor: 'ew-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'cleft') {
    return { ...params, cleftRatio: Number(helpers.clamp(localY / Math.max(1, height), 0.08, 0.45).toFixed(2)) };
  }
  if (id === 'spread') {
    return { ...params, lobeSpread: Number(helpers.clamp(localX / Math.max(1, width), 0.3, 0.9).toFixed(2)) };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const cleftY = helpers.clamp(Number(params.cleftRatio) || 0.22, 0.08, 0.45) * height;
  const spread = helpers.clamp(Number(params.lobeSpread) || 0.58, 0.3, 0.9);
  const cx = width / 2;

  const nodes = [
    helpers.smoothNode(cx, cleftY, cx - width * 0.12, 0, cx + width * 0.12, 0),
    helpers.smoothNode(width, height * 0.3, width * (0.5 + spread * 0.45), 0, width, height * 0.62),
    helpers.smoothNode(cx, height, cx + width * 0.18, height * 0.86, cx - width * 0.18, height * 0.86),
    helpers.smoothNode(0, height * 0.3, 0, height * 0.62, width * (0.5 - spread * 0.45), 0)
  ];
  return [{ nodes, closed: true }];
}`,
    };
  }

  // 6. Ribbon Banner / Chevron / Database Cylinder / Default Smart Polygon
  if (q.includes('ribbon') || q.includes('banner') || q.includes('chevron')) {
    return {
      id: `custom-ribbon-${stamp}`,
      name: 'Smart Ribbon Banner',
      category: 'Badges & Icons',
      description: `Generated from "${prompt}" — Ribbon banner with adjustable swallowtail notch depth and vertical wave.`,
      iconName: 'Bookmark',
      isBuiltIn: false,
      paramSchema: [
        {
          key: 'notchRatio',
          label: 'Tail Notch Depth',
          type: 'number',
          min: 0.05,
          max: 0.35,
          step: 0.01,
          defaultValue: 0.16,
        },
        {
          key: 'bandRatio',
          label: 'Ribbon Thickness',
          type: 'number',
          min: 0.4,
          max: 0.95,
          step: 0.01,
          defaultValue: 0.74,
        },
      ],
      defaultParams: { notchRatio: 0.16, bandRatio: 0.74 },
      jsSourceCode: `// Smart Swallowtail Ribbon Banner (.jsf)
function getControlPoints(width, height, params, helpers) {
  const notch = helpers.clamp(Number(params.notchRatio) || 0.16, 0.05, 0.35);
  const band = helpers.clamp(Number(params.bandRatio) || 0.74, 0.4, 0.95);
  const topY = height * (0.5 - band / 2);
  return [
    {
      id: 'notch',
      label: \`Notch: \${Math.round(notch * 100)}%\`,
      x: width * notch,
      y: height / 2,
      cursor: 'ew-resize'
    },
    {
      id: 'band',
      label: \`Height: \${Math.round(band * 100)}%\`,
      x: width / 2,
      y: topY,
      cursor: 'ns-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'notch') {
    return { ...params, notchRatio: Number(helpers.clamp(localX / Math.max(1, width), 0.05, 0.35).toFixed(2)) };
  }
  if (id === 'band') {
    const ratio = helpers.clamp(Math.abs(localY - height / 2) * 2 / Math.max(1, height), 0.4, 0.95);
    return { ...params, bandRatio: Number(ratio.toFixed(2)) };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const notchW = helpers.clamp(Number(params.notchRatio) || 0.16, 0.05, 0.35) * width;
  const band = helpers.clamp(Number(params.bandRatio) || 0.74, 0.4, 0.95);
  const topY = height * (0.5 - band / 2);
  const botY = height * (0.5 + band / 2);
  const midY = height / 2;

  const pts = [
    { x: 0, y: topY },
    { x: width, y: topY },
    { x: width - notchW, y: midY },
    { x: width, y: botY },
    { x: 0, y: botY },
    { x: notchW, y: midY }
  ];
  return [{ nodes: helpers.polygonPath(pts), closed: true }];
}`,
    };
  }

  // Default: Smart Parametric Polygon / Tech Frame
  return {
    id: `custom-polygon-${stamp}`,
    name: prompt.trim() ? `Smart ${prompt.trim().slice(0, 24)}` : 'Smart Parametric Polygon',
    category: 'Custom JS',
    description: `Generated from "${prompt || 'Custom Polygon'}" — Regular polygon with live side-count and inner ring cutout handles.`,
    iconName: 'Hexagon',
    isBuiltIn: false,
    paramSchema: [
      {
        key: 'sides',
        label: 'Polygon Sides',
        type: 'number',
        min: 3,
        max: 16,
        step: 1,
        defaultValue: 6,
      },
      {
        key: 'cutoutRatio',
        label: 'Inner Cutout Ratio',
        type: 'number',
        min: 0,
        max: 0.8,
        step: 0.01,
        defaultValue: 0.45,
      },
    ],
    defaultParams: { sides: 6, cutoutRatio: 0.45 },
    jsSourceCode: `// Smart Parametric Polygon Frame (.jsf)
function getControlPoints(width, height, params, helpers) {
  const sides = Math.round(helpers.clamp(Number(params.sides) || 6, 3, 16));
  const cutout = helpers.clamp(Number(params.cutoutRatio) ?? 0.45, 0, 0.8);
  const cx = width / 2;
  const cy = height / 2;
  const ry = height / 2;

  return [
    {
      id: 'sides',
      label: \`Sides: \${sides}\`,
      x: helpers.lerp(width * 0.2, width * 0.8, (sides - 3) / 13),
      y: 8,
      cursor: 'ew-resize'
    },
    {
      id: 'cutout',
      label: \`Cutout: \${Math.round(cutout * 100)}%\`,
      x: cx,
      y: cy - ry * cutout,
      cursor: 'ns-resize'
    }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'sides') {
    const t = helpers.clamp((localX - width * 0.2) / (width * 0.6), 0, 1);
    return { ...params, sides: Math.round(3 + t * 13) };
  }
  if (id === 'cutout') {
    const cy = height / 2;
    const ry = Math.max(10, height / 2);
    const ratio = helpers.clamp(Math.abs(cy - localY) / ry, 0, 0.8);
    return { ...params, cutoutRatio: Number(ratio.toFixed(2)) };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const sides = Math.round(helpers.clamp(Number(params.sides) || 6, 3, 16));
  const cutout = helpers.clamp(Number(params.cutoutRatio) ?? 0.45, 0, 0.8);
  const cx = width / 2;
  const cy = height / 2;
  const rx = width / 2;
  const ry = height / 2;

  const outerPts = [];
  const innerPts = [];
  for (let i = 0; i < sides; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / sides;
    outerPts.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry });
    if (cutout > 0.04) {
      innerPts.push({
        x: cx + Math.cos(a) * rx * cutout,
        y: cy + Math.sin(a) * ry * cutout
      });
    }
  }

  const paths = [{ nodes: helpers.polygonPath(outerPts), closed: true }];
  if (innerPts.length > 0) {
    paths.push({ nodes: helpers.polygonPath(innerPts), closed: true });
  }
  return paths;
}`,
  };
}

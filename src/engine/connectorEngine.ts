import {
  BezierNode,
  CanvasObject,
  ConnectionPortId,
  ConnectorMetadata,
  ConnectorRoutingStyle,
  VectorPathObject,
} from '../types/editor';

export interface PortPoint {
  port: ConnectionPortId;
  x: number;
  y: number;
  nx: number;
  ny: number;
}

export function getPortNormal(port: ConnectionPortId): { nx: number; ny: number } {
  switch (port) {
    case 'n':
      return { nx: 0, ny: -1 };
    case 'e':
      return { nx: 1, ny: 0 };
    case 's':
      return { nx: 0, ny: 1 };
    case 'w':
      return { nx: -1, ny: 0 };
  }
}

export function getObjectPortCoords(
  obj: Pick<CanvasObject, 'x' | 'y' | 'width' | 'height'> &
    Partial<Pick<CanvasObject, 'rotation'>>,
  port: ConnectionPortId
): PortPoint {
  const { nx, ny } = getPortNormal(port);
  const ox = Number.isFinite(obj.x) ? obj.x : 0;
  const oy = Number.isFinite(obj.y) ? obj.y : 0;
  const ow = Number.isFinite(obj.width) ? Math.max(0, obj.width) : 0;
  const oh = Number.isFinite(obj.height) ? Math.max(0, obj.height) : 0;

  let px = ox;
  let py = oy;
  switch (port) {
    case 'n':
      px = ox + ow / 2;
      py = oy;
      break;
    case 'e':
      px = ox + ow;
      py = oy + oh / 2;
      break;
    case 's':
      px = ox + ow / 2;
      py = oy + oh;
      break;
    case 'w':
      px = ox;
      py = oy + oh / 2;
      break;
  }

  const rotDeg = Number.isFinite(obj.rotation) ? (obj.rotation as number) : 0;
  if (Math.abs(rotDeg % 360) > 0.01) {
    const rad = (rotDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const cx = ox + ow / 2;
    const cy = oy + oh / 2;
    const dx = px - cx;
    const dy = py - cy;
    const rx = cx + dx * cos - dy * sin;
    const ry = cy + dx * sin + dy * cos;
    const rnx = nx * cos - ny * sin;
    const rny = nx * sin + ny * cos;
    return {
      port,
      x: Math.round(rx),
      y: Math.round(ry),
      nx: Number(rnx.toFixed(4)),
      ny: Number(rny.toFixed(4)),
    };
  }

  return { port, x: Math.round(px), y: Math.round(py), nx, ny };
}

export function getAllObjectPorts(
  obj: Pick<CanvasObject, 'x' | 'y' | 'width' | 'height'> &
    Partial<Pick<CanvasObject, 'rotation'>>
): PortPoint[] {
  return [
    getObjectPortCoords(obj, 'n'),
    getObjectPortCoords(obj, 'e'),
    getObjectPortCoords(obj, 's'),
    getObjectPortCoords(obj, 'w'),
  ];
}

export function computeBestPortPair(
  fromObj: Pick<CanvasObject, 'x' | 'y' | 'width' | 'height'>,
  toObj: Pick<CanvasObject, 'x' | 'y' | 'width' | 'height'>
): { fromPort: ConnectionPortId; toPort: ConnectionPortId } {
  const fromCx = (Number.isFinite(fromObj.x) ? fromObj.x : 0) + (Number.isFinite(fromObj.width) ? fromObj.width : 0) / 2;
  const fromCy = (Number.isFinite(fromObj.y) ? fromObj.y : 0) + (Number.isFinite(fromObj.height) ? fromObj.height : 0) / 2;
  const toCx = (Number.isFinite(toObj.x) ? toObj.x : 0) + (Number.isFinite(toObj.width) ? toObj.width : 0) / 2;
  const toCy = (Number.isFinite(toObj.y) ? toObj.y : 0) + (Number.isFinite(toObj.height) ? toObj.height : 0) / 2;
  const dx = toCx - fromCx;
  const dy = toCy - fromCy;

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? { fromPort: 'e', toPort: 'w' } : { fromPort: 'w', toPort: 'e' };
  }
  return dy >= 0 ? { fromPort: 's', toPort: 'n' } : { fromPort: 'n', toPort: 's' };
}

/**
 * Computes world-space waypoints for an orthogonal 90-degree Lucidchart-style elbow connector,
 * or smooth cubic Bezier nodes for a curved S-connector, and normalizes them into a VectorPathObject's local box.
 */
export function buildConnectorNodesAndBounds(
  fromPt: { x: number; y: number; nx?: number; ny?: number },
  fromPort: ConnectionPortId,
  toPt: { x: number; y: number; nx?: number; ny?: number },
  toPort: ConnectionPortId,
  routing: ConnectorRoutingStyle = 'elbow'
): {
  x: number;
  y: number;
  width: number;
  height: number;
  nodes: BezierNode[];
} {
  const baseN1 = getPortNormal(fromPort);
  const baseN2 = getPortNormal(toPort);
  const rawN1 = {
    nx: typeof fromPt.nx === 'number' && Number.isFinite(fromPt.nx) ? fromPt.nx : baseN1.nx,
    ny: typeof fromPt.ny === 'number' && Number.isFinite(fromPt.ny) ? fromPt.ny : baseN1.ny,
  };
  const rawN2 = {
    nx: typeof toPt.nx === 'number' && Number.isFinite(toPt.nx) ? toPt.nx : baseN2.nx,
    ny: typeof toPt.ny === 'number' && Number.isFinite(toPt.ny) ? toPt.ny : baseN2.ny,
  };
  // For orthogonal elbow routing, snap rotated normals to dominant cardinal axis
  const n1 =
    routing === 'elbow'
      ? Math.abs(rawN1.nx) >= Math.abs(rawN1.ny)
        ? { nx: rawN1.nx >= 0 ? 1 : -1, ny: 0 }
        : { nx: 0, ny: rawN1.ny >= 0 ? 1 : -1 }
      : rawN1;
  const n2 =
    routing === 'elbow'
      ? Math.abs(rawN2.nx) >= Math.abs(rawN2.ny)
        ? { nx: rawN2.nx >= 0 ? 1 : -1, ny: 0 }
        : { nx: 0, ny: rawN2.ny >= 0 ? 1 : -1 }
      : rawN2;
  const fx = Number.isFinite(fromPt.x) ? fromPt.x : 0;
  const fy = Number.isFinite(fromPt.y) ? fromPt.y : 0;
  const tx = Number.isFinite(toPt.x) ? toPt.x : fx;
  const ty = Number.isFinite(toPt.y) ? toPt.y : fy;
  const rawDist = Math.hypot(tx - fx, ty - fy);
  const dist = Number.isFinite(rawDist) ? rawDist : 0;

  let worldNodes: BezierNode[] = [];

  if (routing === 'straight') {
    const endX = dist < 0.5 ? fx + (n1.nx || 1) * 8 : tx;
    const endY = dist < 0.5 ? fy + n1.ny * 8 : ty;
    worldNodes = [
      {
        id: 'cn_0',
        x: fx,
        y: fy,
        cp1x: fx,
        cp1y: fy,
        cp2x: fx,
        cp2y: fy,
        pointType: 'corner',
      },
      {
        id: 'cn_1',
        x: endX,
        y: endY,
        cp1x: endX,
        cp1y: endY,
        cp2x: endX,
        cp2y: endY,
        pointType: 'corner',
      },
    ];
  } else if (routing === 'curved') {
    const pull = Math.max(36, Math.min(180, dist * 0.48));
    const cp1x = fx + n1.nx * pull;
    const cp1y = fy + n1.ny * pull;
    const cp2x = tx + n2.nx * pull;
    const cp2y = ty + n2.ny * pull;

    worldNodes = [
      {
        id: 'cn_0',
        x: fx,
        y: fy,
        cp1x: fx,
        cp1y: fy,
        cp2x: cp1x,
        cp2y: cp1y,
        pointType: 'smooth',
      },
      {
        id: 'cn_1',
        x: tx,
        y: ty,
        cp1x: cp2x,
        cp1y: cp2y,
        cp2x: tx,
        cp2y: ty,
        pointType: 'smooth',
      },
    ];
  } else {
    // Orthogonal 90-degree Elbow Routing (Lucidchart style)
    const stub = 20;
    const pStart = { x: fx, y: fy };
    const pStub1 = { x: fx + n1.nx * stub, y: fy + n1.ny * stub };
    const pStub2 = { x: tx + n2.nx * stub, y: ty + n2.ny * stub };
    const pEnd = { x: tx, y: ty };

    const pts: Array<{ x: number; y: number }> = [pStart];

    const isHorizontal1 = Math.abs(n1.nx) >= Math.abs(n1.ny);
    const isHorizontal2 = Math.abs(n2.nx) >= Math.abs(n2.ny);

    if (isHorizontal1 && isHorizontal2) {
      const midX = Math.round((pStub1.x + pStub2.x) / 2);
      const leavesStartCleanly = (midX - pStart.x) * n1.nx >= 6;
      const entersEndCleanly = (midX - pEnd.x) * n2.nx >= 6;

      if (n1.nx !== n2.nx && leavesStartCleanly && entersEndCleanly) {
        pts.push({ x: midX, y: pStart.y });
        pts.push({ x: midX, y: pEnd.y });
      } else if (n1.nx === n2.nx) {
        const outerX =
          n1.nx > 0
            ? Math.max(pStub1.x, pStub2.x)
            : Math.min(pStub1.x, pStub2.x);
        pts.push({ x: outerX, y: pStart.y });
        pts.push({ x: outerX, y: pEnd.y });
      } else {
        const midY =
          Math.abs(pEnd.y - pStart.y) < 24
            ? Math.round(Math.min(pStart.y, pEnd.y) - 36)
            : Math.round((pStart.y + pEnd.y) / 2);
        pts.push(pStub1);
        pts.push({ x: pStub1.x, y: midY });
        pts.push({ x: pStub2.x, y: midY });
        pts.push(pStub2);
      }
    } else if (!isHorizontal1 && !isHorizontal2) {
      const midY = Math.round((pStub1.y + pStub2.y) / 2);
      const leavesStartCleanly = (midY - pStart.y) * n1.ny >= 6;
      const entersEndCleanly = (midY - pEnd.y) * n2.ny >= 6;

      if (n1.ny !== n2.ny && leavesStartCleanly && entersEndCleanly) {
        pts.push({ x: pStart.x, y: midY });
        pts.push({ x: pEnd.x, y: midY });
      } else if (n1.ny === n2.ny) {
        const outerY =
          n1.ny > 0
            ? Math.max(pStub1.y, pStub2.y)
            : Math.min(pStub1.y, pStub2.y);
        pts.push({ x: pStart.x, y: outerY });
        pts.push({ x: pEnd.x, y: outerY });
      } else {
        const midX =
          Math.abs(pEnd.x - pStart.x) < 24
            ? Math.round(Math.max(pStart.x, pEnd.x) + 36)
            : Math.round((pStart.x + pEnd.x) / 2);
        pts.push(pStub1);
        pts.push({ x: midX, y: pStub1.y });
        pts.push({ x: midX, y: pStub2.y });
        pts.push(pStub2);
      }
    } else if (isHorizontal1 && !isHorizontal2) {
      const cornerX =
        (pEnd.x - pStart.x) * n1.nx >= stub
          ? pEnd.x
          : pStub1.x;
      if (cornerX === pEnd.x && (pStart.y - pEnd.y) * n2.ny >= stub) {
        pts.push({ x: pEnd.x, y: pStart.y });
      } else {
        pts.push(pStub1);
        pts.push({ x: pStub1.x, y: pStub2.y });
        pts.push(pStub2);
      }
    } else {
      const cornerY =
        (pEnd.y - pStart.y) * n1.ny >= stub
          ? pEnd.y
          : pStub1.y;
      if (cornerY === pEnd.y && (pStart.x - pEnd.x) * n2.nx >= stub) {
        pts.push({ x: pStart.x, y: pEnd.y });
      } else {
        pts.push(pStub1);
        pts.push({ x: pStub2.x, y: pStub1.y });
        pts.push(pStub2);
      }
    }

    pts.push(pEnd);

    // Deduplicate consecutive identical points
    const cleanPts: Array<{ x: number; y: number }> = [];
    for (const pt of pts) {
      const prev = cleanPts[cleanPts.length - 1];
      if (!prev || Math.hypot(pt.x - prev.x, pt.y - prev.y) > 0.5) {
        cleanPts.push(pt);
      }
    }

    // Guarantee at least 2 distinct finite points even if both ports share the exact same X and Y
    if (cleanPts.length < 2) {
      cleanPts.push({
        x: pStart.x + (n1.nx || 1) * 12,
        y: pStart.y + n1.ny * 12,
      });
    }

    worldNodes = cleanPts.map((pt, idx) => ({
      id: `cn_${idx}`,
      x: pt.x,
      y: pt.y,
      cp1x: pt.x,
      cp1y: pt.y,
      cp2x: pt.x,
      cp2y: pt.y,
      pointType: 'corner',
    }));
  }

  const allX = worldNodes
    .flatMap((n) => [n.x, n.cp1x, n.cp2x])
    .filter((v) => Number.isFinite(v));
  const allY = worldNodes
    .flatMap((n) => [n.y, n.cp1y, n.cp2y])
    .filter((v) => Number.isFinite(v));
  const minX = allX.length > 0 ? Math.floor(Math.min(...allX)) : 0;
  const minY = allY.length > 0 ? Math.floor(Math.min(...allY)) : 0;
  const maxX = allX.length > 0 ? Math.ceil(Math.max(...allX)) : 8;
  const maxY = allY.length > 0 ? Math.ceil(Math.max(...allY)) : 8;

  const localNodes: BezierNode[] = worldNodes.map((n) => ({
    ...n,
    x: (Number.isFinite(n.x) ? n.x : minX) - minX,
    y: (Number.isFinite(n.y) ? n.y : minY) - minY,
    cp1x: (Number.isFinite(n.cp1x) ? n.cp1x : minX) - minX,
    cp1y: (Number.isFinite(n.cp1y) ? n.cp1y : minY) - minY,
    cp2x: (Number.isFinite(n.cp2x) ? n.cp2x : minX) - minX,
    cp2y: (Number.isFinite(n.cp2y) ? n.cp2y : minY) - minY,
  }));

  return {
    x: minX,
    y: minY,
    width: Math.max(8, maxX - minX),
    height: Math.max(8, maxY - minY),
    nodes: localNodes,
  };
}

/**
 * Creates a brand-new Smart Connector VectorPathObject linking `fromObj` and `toObj`.
 */
export function createSmartConnectorObject(
  fromObj: CanvasObject,
  fromPort: ConnectionPortId,
  toObj: CanvasObject,
  toPort: ConnectionPortId,
  options?: {
    routing?: ConnectorRoutingStyle;
    stroke?: string;
    strokeWidth?: number;
    label?: string;
  }
): VectorPathObject {
  const routing = options?.routing || 'elbow';
  const fromPt = getObjectPortCoords(fromObj, fromPort);
  const toPt = getObjectPortCoords(toObj, toPort);
  const geom = buildConnectorNodesAndBounds(fromPt, fromPort, toPt, toPort, routing);

  const connectorMeta: ConnectorMetadata = {
    fromObjectId: fromObj.id,
    fromPort,
    toObjectId: toObj.id,
    toPort,
    routing,
    startArrow: false,
    endArrow: true,
    label: options?.label || '',
  };

  return {
    id: `conn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: `Flow Connector (${fromObj.name.slice(0, 12)} → ${toObj.name.slice(0, 12)})`,
    type: 'vector-path',
    visible: true,
    locked: false,
    x: geom.x,
    y: geom.y,
    width: geom.width,
    height: geom.height,
    rotation: 0,
    opacity: 1,
    blendMode: 'source-over',
    fill: 'none',
    fillType: 'none',
    fillGradientEnd: '#ffffff',
    stroke: options?.stroke || '#38bdf8',
    strokeWidth: options?.strokeWidth || 2,
    strokeAlign: 'center',
    pixelSnap: true,
    shadow: {
      enabled: false,
      color: 'rgba(0,0,0,0.4)',
      blur: 6,
      offsetX: 0,
      offsetY: 2,
    },
    nodes: geom.nodes,
    closed: false,
    connectorMeta,
  };
}

/**
 * Recalculates all live auto-connecting lines (`connectorMeta`) whenever any connected node moves or resizes.
 */
export function syncAllConnectors(objects: CanvasObject[]): CanvasObject[] {
  const objectMap = new Map<string, CanvasObject>();
  objects.forEach((o) => objectMap.set(o.id, o));

  let changed = false;
  const nextObjects = objects.map((obj) => {
    if (obj.type !== 'vector-path' || !obj.connectorMeta) return obj;
    const meta = obj.connectorMeta;
    const fromObj = objectMap.get(meta.fromObjectId);
    const toObj = objectMap.get(meta.toObjectId);
    if (!fromObj || !toObj) return obj;

    const fromPt = getObjectPortCoords(fromObj, meta.fromPort);
    const toPt = getObjectPortCoords(toObj, meta.toPort);
    const geom = buildConnectorNodesAndBounds(
      fromPt,
      meta.fromPort,
      toPt,
      meta.toPort,
      meta.routing
    );

    if (
      obj.x === geom.x &&
      obj.y === geom.y &&
      obj.width === geom.width &&
      obj.height === geom.height &&
      obj.nodes.length === geom.nodes.length &&
      obj.nodes.every(
        (n, idx) =>
          Math.abs(n.x - geom.nodes[idx].x) < 0.1 &&
          Math.abs(n.y - geom.nodes[idx].y) < 0.1 &&
          Math.abs(n.cp1x - geom.nodes[idx].cp1x) < 0.1 &&
          Math.abs(n.cp1y - geom.nodes[idx].cp1y) < 0.1 &&
          Math.abs(n.cp2x - geom.nodes[idx].cp2x) < 0.1 &&
          Math.abs(n.cp2y - geom.nodes[idx].cp2y) < 0.1
      )
    ) {
      return obj;
    }

    changed = true;
    return {
      ...obj,
      x: geom.x,
      y: geom.y,
      width: geom.width,
      height: geom.height,
      nodes: geom.nodes,
    };
  });

  return changed ? nextObjects : objects;
}

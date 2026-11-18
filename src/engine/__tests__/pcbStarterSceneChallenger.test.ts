// @ts-ignore
import { describe, it, expect } from 'vitest';
import { createPcbStarterSceneObjects } from '../pcbStarterScene';
import { DEFAULT_AUTOSHAPES, evaluateAutoShape, dragAutoShapeControlPoint } from '../autoshapes';
import type {
  CanvasObject,
  AutoShapeObject,
  VectorPathObject,
  TextObject,
  AutoShapeDefinition,
} from '../../types/editor';

describe('Empirical Challenger Suite: PCB Starter Scene Graph & Invariants', () => {
  const objects: CanvasObject[] = createPcbStarterSceneObjects();

  // =========================================================================
  // 1. OBJECT COUNT INVARIANT (>= 50)
  // =========================================================================
  it('CHALLENGE-01: Starter Scene Object Count Invariant (>= 50 objects)', () => {
    expect(Array.isArray(objects), 'createPcbStarterSceneObjects must return an array').toBe(true);
    expect(
      objects.length,
      `Expected at least 50 objects in PCB starter scene, received ${objects.length}`
    ).toBeGreaterThanOrEqual(50);

    // Verify presence of all expected object types
    const countsByType = objects.reduce<Record<string, number>>((acc, obj) => {
      acc[obj.type] = (acc[obj.type] || 0) + 1;
      return acc;
    }, {});

    expect(countsByType['autoshape'], 'Must have AutoShape objects').toBeGreaterThanOrEqual(15);
    expect(countsByType['vector-path'], 'Must have VectorPath objects').toBeGreaterThanOrEqual(10);
    expect(countsByType['text'], 'Must have Text objects').toBeGreaterThanOrEqual(8);
  });

  // =========================================================================
  // 2. ID UNIQUENESS & METADATA HYGIENE
  // =========================================================================
  it('CHALLENGE-02: Global Object ID Uniqueness and Well-Formedness', () => {
    const seenIds = new Set<string>();

    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i];

      // ID checks
      expect(typeof obj.id, `Object at index ${i} must have string id`).toBe('string');
      expect(obj.id.trim().length, `Object at index ${i} id cannot be empty`).toBeGreaterThan(0);
      expect(seenIds.has(obj.id), `Duplicate object ID detected: '${obj.id}' at index ${i}`).toBe(false);
      seenIds.add(obj.id);

      // Name checks
      expect(typeof obj.name, `Object ${obj.id} must have string name`).toBe('string');
      expect(obj.name.trim().length, `Object ${obj.id} name cannot be empty`).toBeGreaterThan(0);

      // Coordinate sanity
      expect(Number.isFinite(obj.x), `Object ${obj.id} x must be finite`).toBe(true);
      expect(Number.isFinite(obj.y), `Object ${obj.id} y must be finite`).toBe(true);
      expect(Number.isFinite(obj.width), `Object ${obj.id} width must be finite`).toBe(true);
      expect(Number.isFinite(obj.height), `Object ${obj.id} height must be finite`).toBe(true);
      expect(obj.width, `Object ${obj.id} width must be positive`).toBeGreaterThan(0);
      expect(obj.height, `Object ${obj.id} height must be positive`).toBeGreaterThan(0);
    }
  });

  // =========================================================================
  // 3. AUTOSHAPE DEFINITION LOOKUP, EVALUATION, AND BOUNDS
  // =========================================================================
  it('CHALLENGE-03: AutoShape Object Evaluation, Zero Errors, Finite Coordinates, Non-Empty Bounds', () => {
    const autoShapes = objects.filter((o): o is AutoShapeObject => o.type === 'autoshape');
    expect(autoShapes.length, 'Must have AutoShapes in the starter scene').toBeGreaterThanOrEqual(15);

    const defaultMap = new Map<string, AutoShapeDefinition>();
    for (const shape of DEFAULT_AUTOSHAPES) {
      defaultMap.set(shape.id, shape);
    }

    for (const asObj of autoShapes) {
      // 1. Check shapeDefId lookup in DEFAULT_AUTOSHAPES
      expect(typeof asObj.shapeDefId, `AutoShape ${asObj.id} must define shapeDefId`).toBe('string');
      const shapeDef = defaultMap.get(asObj.shapeDefId);
      expect(
        shapeDef,
        `AutoShape ${asObj.id} references unregistered shapeDefId: '${asObj.shapeDefId}'`
      ).toBeDefined();

      // 2. Evaluate AutoShape via evaluateAutoShape
      const res = evaluateAutoShape(
        shapeDef!,
        asObj.width,
        asObj.height,
        asObj.params,
        asObj.customCode
      );

      expect(
        res.error,
        `AutoShape ${asObj.id} (${asObj.shapeDefId}) threw evaluation error: ${res.error}`
      ).toBeUndefined();

      expect(
        Array.isArray(res.paths),
        `AutoShape ${asObj.id} (${asObj.shapeDefId}) paths must be an array`
      ).toBe(true);
      expect(
        res.paths.length,
        `AutoShape ${asObj.id} (${asObj.shapeDefId}) produced 0 paths`
      ).toBeGreaterThanOrEqual(1);

      // 3. Verify node coordinates are finite and compute bounding box
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      let totalNodes = 0;

      for (let pIdx = 0; pIdx < res.paths.length; pIdx++) {
        const path = res.paths[pIdx];
        expect(Array.isArray(path.nodes), `AutoShape ${asObj.id} path ${pIdx} nodes must be array`).toBe(true);
        expect(path.nodes.length, `AutoShape ${asObj.id} path ${pIdx} has 0 nodes`).toBeGreaterThan(0);

        for (let nIdx = 0; nIdx < path.nodes.length; nIdx++) {
          const n = path.nodes[nIdx];
          totalNodes++;
          expect(Number.isFinite(n.x), `AutoShape ${asObj.id} path ${pIdx} node ${nIdx} x is non-finite: ${n.x}`).toBe(true);
          expect(Number.isFinite(n.y), `AutoShape ${asObj.id} path ${pIdx} node ${nIdx} y is non-finite: ${n.y}`).toBe(true);
          expect(Number.isFinite(n.cp1x), `AutoShape ${asObj.id} path ${pIdx} node ${nIdx} cp1x is non-finite: ${n.cp1x}`).toBe(true);
          expect(Number.isFinite(n.cp1y), `AutoShape ${asObj.id} path ${pIdx} node ${nIdx} cp1y is non-finite: ${n.cp1y}`).toBe(true);
          expect(Number.isFinite(n.cp2x), `AutoShape ${asObj.id} path ${pIdx} node ${nIdx} cp2x is non-finite: ${n.cp2x}`).toBe(true);
          expect(Number.isFinite(n.cp2y), `AutoShape ${asObj.id} path ${pIdx} node ${nIdx} cp2y is non-finite: ${n.cp2y}`).toBe(true);

          minX = Math.min(minX, n.x);
          maxX = Math.max(maxX, n.x);
          minY = Math.min(minY, n.y);
          maxY = Math.max(maxY, n.y);
        }
      }

      // 4. Verify non-empty bounds
      expect(totalNodes, `AutoShape ${asObj.id} must have >= 2 total nodes`).toBeGreaterThanOrEqual(2);
      const bboxW = maxX - minX;
      const bboxH = maxY - minY;
      expect(bboxW, `AutoShape ${asObj.id} bounding box width must be > 0 (got ${bboxW})`).toBeGreaterThan(0);
      expect(bboxH, `AutoShape ${asObj.id} bounding box height must be > 0 (got ${bboxH})`).toBeGreaterThan(0);

      // 5. Verify control points if present
      if (res.controlPoints && res.controlPoints.length > 0) {
        for (const cp of res.controlPoints) {
          expect(Number.isFinite(cp.x), `AutoShape ${asObj.id} CP ${cp.id} x non-finite: ${cp.x}`).toBe(true);
          expect(Number.isFinite(cp.y), `AutoShape ${asObj.id} CP ${cp.id} y non-finite: ${cp.y}`).toBe(true);

          // Drag stress test: Drag handle by +10px
          const draggedParams = dragAutoShapeControlPoint(
            shapeDef!,
            cp.id,
            cp.x + 10,
            cp.y + 10,
            asObj.width,
            asObj.height,
            asObj.params
          );
          expect(draggedParams).toBeDefined();

          // Re-evaluation after drag must remain error-free
          const draggedRes = evaluateAutoShape(
            shapeDef!,
            asObj.width,
            asObj.height,
            draggedParams
          );
          expect(
            draggedRes.error,
            `AutoShape ${asObj.id} threw error after dragging CP ${cp.id}: ${draggedRes.error}`
          ).toBeUndefined();
        }
      }
    }
  });

  // =========================================================================
  // 4. VECTORPATH BEZIER NODES & CANVAS BOUNDS
  // =========================================================================
  it('CHALLENGE-04: VectorPath Bezier Node Integrity and Canvas Bounds', () => {
    const vectorPaths = objects.filter((o): o is VectorPathObject => o.type === 'vector-path');
    expect(vectorPaths.length, 'Must have VectorPath objects in scene').toBeGreaterThanOrEqual(10);

    const CANVAS_WIDTH = 960;
    const CANVAS_HEIGHT = 600;
    const BLEED = 40; // Allow edge connectors or margins to span slightly outside

    for (const vp of vectorPaths) {
      expect(Array.isArray(vp.nodes), `VectorPath ${vp.id} nodes must be an array`).toBe(true);
      expect(vp.nodes.length, `VectorPath ${vp.id} must have >= 2 nodes`).toBeGreaterThanOrEqual(2);

      // Check object bounding box fits on canvas
      expect(
        vp.x,
        `VectorPath ${vp.id} x (${vp.x}) cannot be negative beyond bleed`
      ).toBeGreaterThanOrEqual(-BLEED);
      expect(
        vp.y,
        `VectorPath ${vp.id} y (${vp.y}) cannot be negative beyond bleed`
      ).toBeGreaterThanOrEqual(-BLEED);
      expect(
        vp.x + vp.width,
        `VectorPath ${vp.id} right edge (${vp.x + vp.width}) must fit within canvas (${CANVAS_WIDTH} + bleed)`
      ).toBeLessThanOrEqual(CANVAS_WIDTH + BLEED);
      expect(
        vp.y + vp.height,
        `VectorPath ${vp.id} bottom edge (${vp.y + vp.height}) must fit within canvas (${CANVAS_HEIGHT} + bleed)`
      ).toBeLessThanOrEqual(CANVAS_HEIGHT + BLEED);

      // Check individual Bezier nodes
      for (let nIdx = 0; nIdx < vp.nodes.length; nIdx++) {
        const node = vp.nodes[nIdx];
        expect(Number.isFinite(node.x), `VectorPath ${vp.id} node ${nIdx} x non-finite`).toBe(true);
        expect(Number.isFinite(node.y), `VectorPath ${vp.id} node ${nIdx} y non-finite`).toBe(true);
        expect(Number.isFinite(node.cp1x), `VectorPath ${vp.id} node ${nIdx} cp1x non-finite`).toBe(true);
        expect(Number.isFinite(node.cp1y), `VectorPath ${vp.id} node ${nIdx} cp1y non-finite`).toBe(true);
        expect(Number.isFinite(node.cp2x), `VectorPath ${vp.id} node ${nIdx} cp2x non-finite`).toBe(true);
        expect(Number.isFinite(node.cp2y), `VectorPath ${vp.id} node ${nIdx} cp2y non-finite`).toBe(true);

        // Global node coordinates
        const globalX = vp.x + node.x;
        const globalY = vp.y + node.y;
        expect(
          globalX,
          `VectorPath ${vp.id} node ${nIdx} globalX (${globalX}) outside canvas`
        ).toBeGreaterThanOrEqual(-BLEED);
        expect(
          globalX,
          `VectorPath ${vp.id} node ${nIdx} globalX (${globalX}) outside canvas`
        ).toBeLessThanOrEqual(CANVAS_WIDTH + BLEED);
        expect(
          globalY,
          `VectorPath ${vp.id} node ${nIdx} globalY (${globalY}) outside canvas`
        ).toBeGreaterThanOrEqual(-BLEED);
        expect(
          globalY,
          `VectorPath ${vp.id} node ${nIdx} globalY (${globalY}) outside canvas`
        ).toBeLessThanOrEqual(CANVAS_HEIGHT + BLEED);
      }

      // If it's a conductive trace (id starts with 'pcb-trace-')
      if (vp.id.startsWith('pcb-trace-')) {
        expect(vp.closed, `Trace ${vp.id} must be an open path`).toBe(false);
        expect(vp.strokeWidth, `Trace ${vp.id} strokeWidth must be >= 1.5`).toBeGreaterThanOrEqual(1.5);

        // Verify 45° IPC-2221 miters: non-orthogonal deltas must have |dx| === |dy|
        for (let i = 0; i < vp.nodes.length - 1; i++) {
          const dx = Math.abs(vp.nodes[i + 1].x - vp.nodes[i].x);
          const dy = Math.abs(vp.nodes[i + 1].y - vp.nodes[i].y);
          if (dx !== 0 && dy !== 0) {
            expect(
              dx,
              `Trace ${vp.id} segment ${i}->${i + 1} must be a 45° miter (|dx| === |dy|, got dx=${dx}, dy=${dy})`
            ).toBe(dy);
          }
        }
      }
    }
  });

  // =========================================================================
  // 5. STRICT Z-ORDERING & LAYER PROGRESSION
  // =========================================================================
  it('CHALLENGE-05: Strict Z-Ordering, Ascending Progression, and Layer Hierarchy', () => {
    // 1. If explicit zIndex property exists on any object, check it
    const explicitZIndices = objects
      .map((o) => (o as any).zIndex)
      .filter((z) => typeof z === 'number');

    if (explicitZIndices.length > 0) {
      expect(
        explicitZIndices.length,
        'If zIndex is used, every object must have zIndex'
      ).toBe(objects.length);

      const zSet = new Set<number>();
      for (let i = 0; i < explicitZIndices.length; i++) {
        const z = explicitZIndices[i];
        expect(zSet.has(z), `Duplicate zIndex detected: ${z} at index ${i}`).toBe(false);
        zSet.add(z);
        if (i > 0) {
          expect(z, `zIndex must be strictly ascending: ${z} <= ${explicitZIndices[i - 1]}`).toBeGreaterThan(
            explicitZIndices[i - 1]
          );
        }
      }
    }

    // 2. Natural array z-ordering invariant:
    // In Canvas/DOM graphics, the array index is the rendering z-order (index 0 is at bottom, index N-1 is on top).
    // Verify that semantic layers follow strict non-decreasing progression:
    // Layer 0: Backdrops (workmat, hud-backdrop)
    // Layer 1: HUD Cards & HUD Text
    // Layer 2: Board Substrate (FR4 outline)
    // Layer 3: Copper Ground Pour & Corner M3 Mounting Holes
    // Layer 4: Conductive Traces
    // Layer 5: Ground Stitching Vias
    // Layer 6: Silicon IC Packages (STM32, IMU, LDO, Crystal, USB-C)
    // Layer 7: Passives & Pin Headers (C1-C7, R1-R2, J2-J4)
    // Layer 8: Test Points (TP1-TP5)
    // Layer 9: Silkscreen Text / Branding

    function getObjectLayer(id: string): number {
      if (id === 'pcb-workmat-backdrop' || id === 'pcb-hud-backdrop') return 0;
      if (id.startsWith('pcb-hud-')) return 1;
      if (id === 'pcb-board-substrate') return 2;
      if (id === 'pcb-copper-ground-pour' || id.startsWith('pcb-mount-')) return 3;
      if (id.startsWith('pcb-trace-')) return 4;
      if (id.startsWith('pcb-via-')) return 5;
      if (
        id.startsWith('pcb-u1-') ||
        id.startsWith('pcb-u2-') ||
        id.startsWith('pcb-u3-') ||
        id.startsWith('pcb-y1-') ||
        id.startsWith('pcb-j1-')
      )
        return 6;
      if (
        id.startsWith('pcb-j2-') ||
        id.startsWith('pcb-j3-') ||
        id.startsWith('pcb-j4-') ||
        id.startsWith('pcb-c') ||
        id.startsWith('pcb-r')
      )
        return 7;
      if (id.startsWith('pcb-tp-')) return 8;
      if (id.startsWith('pcb-silk-')) return 9;
      return -1; // Uncategorized
    }

    let lastLayer = 0;
    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i];
      const layer = getObjectLayer(obj.id);
      expect(
        layer,
        `Object '${obj.id}' at index ${i} must belong to a recognized Z-layer (0-9)`
      ).toBeGreaterThanOrEqual(0);

      expect(
        layer,
        `Z-order inversion detected: object '${obj.id}' (layer ${layer}) placed after layer ${lastLayer} at index ${i}`
      ).toBeGreaterThanOrEqual(lastLayer);

      lastLayer = layer;
    }

    // 3. Verify key physical layering constraints:
    const idxSubstrate = objects.findIndex((o) => o.id === 'pcb-board-substrate');
    const idxPour = objects.findIndex((o) => o.id === 'pcb-copper-ground-pour');
    const idxMcu = objects.findIndex((o) => o.id === 'pcb-u1-mcu');
    const idxTrace = objects.findIndex((o) => o.id.startsWith('pcb-trace-'));
    const idxSilk = objects.findIndex((o) => o.id.startsWith('pcb-silk-'));

    expect(idxSubstrate, 'Substrate must exist').toBeGreaterThan(-1);
    expect(idxPour, 'Ground pour must exist').toBeGreaterThan(-1);
    expect(idxMcu, 'MCU must exist').toBeGreaterThan(-1);
    expect(idxTrace, 'Traces must exist').toBeGreaterThan(-1);
    expect(idxSilk, 'Silkscreen must exist').toBeGreaterThan(-1);

    expect(idxSubstrate, 'Board substrate must sit underneath copper ground pour').toBeLessThan(idxPour);
    expect(idxPour, 'Copper ground pour must sit underneath conductive traces').toBeLessThan(idxTrace);
    expect(idxTrace, 'Traces must sit underneath IC components').toBeLessThan(idxMcu);
    expect(idxMcu, 'IC components must sit underneath silkscreen labels').toBeLessThan(idxSilk);
  });

  // =========================================================================
  // 6. DETERMINISM & PURITY STRESS TEST
  // =========================================================================
  it('CHALLENGE-06: Deterministic Scene Instantiation & State Purity', () => {
    const run1 = createPcbStarterSceneObjects();
    const run2 = createPcbStarterSceneObjects();

    expect(run1.length).toBe(run2.length);

    for (let i = 0; i < run1.length; i++) {
      const o1 = run1[i];
      const o2 = run2[i];
      expect(o1.id, `Mismatch at index ${i} id`).toBe(o2.id);
      expect(o1.type, `Mismatch at index ${i} type`).toBe(o2.type);
      expect(o1.x, `Mismatch at index ${i} x`).toBe(o2.x);
      expect(o1.y, `Mismatch at index ${i} y`).toBe(o2.y);
      expect(o1.width, `Mismatch at index ${i} width`).toBe(o2.width);
      expect(o1.height, `Mismatch at index ${i} height`).toBe(o2.height);
    }
  });
});

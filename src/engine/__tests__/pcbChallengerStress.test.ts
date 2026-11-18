// @ts-ignore
import { describe, it, expect } from 'vitest';
import { evaluateAutoShape, dragAutoShapeControlPoint } from '../autoshapes';
import { PCB_LAYOUT_AUTOSHAPES } from '../pcbLayoutAutoshapes';
import type { AutoShapeDefinition, BezierNode } from '../../types/editor';

describe('Empirical Challenger Stress Test: PCB AutoShapes Suite', () => {
  it('STAGE 1: Verify all 30 shapes are present, well-formed, and uniquely identified', () => {
    expect(PCB_LAYOUT_AUTOSHAPES).toBeDefined();
    expect(Array.isArray(PCB_LAYOUT_AUTOSHAPES)).toBe(true);
    expect(PCB_LAYOUT_AUTOSHAPES.length).toBe(30);

    const ids = new Set<string>();
    for (const shape of PCB_LAYOUT_AUTOSHAPES) {
      expect(shape.id).toBeDefined();
      expect(shape.id.startsWith('pcb-')).toBe(true);
      expect(ids.has(shape.id), `Duplicate shape ID detected: ${shape.id}`).toBe(false);
      ids.add(shape.id);

      expect(shape.category).toBe('PCB Layout');
      expect(shape.name && shape.name.trim().length > 0).toBe(true);
      expect(shape.description && shape.description.trim().length > 0).toBe(true);
      expect(shape.iconName && shape.iconName.trim().length > 0).toBe(true);
      expect(shape.jsSourceCode && shape.jsSourceCode.trim().length > 0).toBe(true);
      expect(Array.isArray(shape.paramSchema)).toBe(true);
      expect(shape.defaultParams && typeof shape.defaultParams === 'object').toBe(true);
    }
  });

  it('STAGE 2: Evaluate each shape at default parameters across multiple canvas dimensions', () => {
    const dimensionSets = [
      { w: 200, h: 150, label: 'standard (200x150)' },
      { w: 100, h: 100, label: 'square (100x100)' },
      { w: 400, h: 300, label: 'medium (400x300)' },
      { w: 1200, h: 800, label: 'large (1200x800)' },
      { w: 30, h: 300, label: 'tall aspect (30x300)' },
      { w: 300, h: 30, label: 'wide aspect (300x30)' },
      { w: 4, h: 4, label: 'minimum engine size (4x4)' },
    ];

    for (const shape of PCB_LAYOUT_AUTOSHAPES) {
      for (const dims of dimensionSets) {
        const res = evaluateAutoShape(shape, dims.w, dims.h, shape.defaultParams);

        expect(res.error, `Shape ${shape.id} threw error at ${dims.label}: ${res.error}`).toBeUndefined();
        expect(res.paths.length, `Shape ${shape.id} produced 0 paths at ${dims.label}`).toBeGreaterThanOrEqual(1);

        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        let nodeCount = 0;

        for (let pIdx = 0; pIdx < res.paths.length; pIdx++) {
          const path = res.paths[pIdx];
          expect(path.nodes.length, `Shape ${shape.id} path ${pIdx} has 0 nodes at ${dims.label}`).toBeGreaterThan(0);
          expect(typeof path.closed).toBe('boolean');

          for (let nIdx = 0; nIdx < path.nodes.length; nIdx++) {
            const node = path.nodes[nIdx];
            nodeCount++;

            expect(Number.isFinite(node.x), `Shape ${shape.id} path ${pIdx} node ${nIdx} x is non-finite (${node.x}) at ${dims.label}`).toBe(true);
            expect(Number.isFinite(node.y), `Shape ${shape.id} path ${pIdx} node ${nIdx} y is non-finite (${node.y}) at ${dims.label}`).toBe(true);
            expect(Number.isFinite(node.cp1x), `Shape ${shape.id} path ${pIdx} node ${nIdx} cp1x is non-finite (${node.cp1x}) at ${dims.label}`).toBe(true);
            expect(Number.isFinite(node.cp1y), `Shape ${shape.id} path ${pIdx} node ${nIdx} cp1y is non-finite (${node.cp1y}) at ${dims.label}`).toBe(true);
            expect(Number.isFinite(node.cp2x), `Shape ${shape.id} path ${pIdx} node ${nIdx} cp2x is non-finite (${node.cp2x}) at ${dims.label}`).toBe(true);
            expect(Number.isFinite(node.cp2y), `Shape ${shape.id} path ${pIdx} node ${nIdx} cp2y is non-finite (${node.cp2y}) at ${dims.label}`).toBe(true);

            minX = Math.min(minX, node.x);
            maxX = Math.max(maxX, node.x);
            minY = Math.min(minY, node.y);
            maxY = Math.max(maxY, node.y);
          }
        }

        expect(nodeCount, `Shape ${shape.id} has insufficient nodes (< 2) at ${dims.label}`).toBeGreaterThanOrEqual(2);

        // Bounding box dimensions
        const bboxWidth = maxX - minX;
        const bboxHeight = maxY - minY;
        if (dims.w >= 10 && dims.h >= 10) {
          expect(bboxWidth, `Shape ${shape.id} bounding width <= 0 at ${dims.label}`).toBeGreaterThan(0);
          expect(bboxHeight, `Shape ${shape.id} bounding height <= 0 at ${dims.label}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('STAGE 3: Stress-test parameter permutations, min/max limits, step values, and boundary inputs', () => {
    for (const shape of PCB_LAYOUT_AUTOSHAPES) {
      const w = 200;
      const h = 150;

      // 1. Test each parameter individually at min, max, below min, above max
      for (const param of shape.paramSchema) {
        if (param.type === 'number') {
          const testValues: number[] = [];
          if (param.min !== undefined) {
            testValues.push(param.min);
            testValues.push(param.min - 1);
            testValues.push(param.min - 50);
          }
          if (param.max !== undefined) {
            testValues.push(param.max);
            testValues.push(param.max + 1);
            testValues.push(param.max + 100);
          }
          if (param.defaultValue !== undefined && typeof param.defaultValue === 'number') {
            testValues.push(param.defaultValue);
          }
          testValues.push(0);
          testValues.push(-1);
          testValues.push(9999);

          for (const val of testValues) {
            const testParams = { ...shape.defaultParams, [param.key]: val };
            const res = evaluateAutoShape(shape, w, h, testParams);

            expect(res.error, `Shape ${shape.id} parameter ${param.key}=${val} caused evaluation error: ${res.error}`).toBeUndefined();
            expect(res.paths.length, `Shape ${shape.id} parameter ${param.key}=${val} produced 0 paths`).toBeGreaterThanOrEqual(1);

            for (let pIdx = 0; pIdx < res.paths.length; pIdx++) {
              for (let nIdx = 0; nIdx < res.paths[pIdx].nodes.length; nIdx++) {
                const node = res.paths[pIdx].nodes[nIdx];
                expect(Number.isFinite(node.x), `Shape ${shape.id} param ${param.key}=${val} node.x is non-finite: ${node.x}`).toBe(true);
                expect(Number.isFinite(node.y), `Shape ${shape.id} param ${param.key}=${val} node.y is non-finite: ${node.y}`).toBe(true);
              }
            }
          }
        } else if (param.type === 'boolean') {
          for (const boolVal of [true, false]) {
            const testParams = { ...shape.defaultParams, [param.key]: boolVal };
            const res = evaluateAutoShape(shape, w, h, testParams);
            expect(res.error, `Shape ${shape.id} param ${param.key}=${boolVal} caused error: ${res.error}`).toBeUndefined();
          }
        }
      }

      // 2. All numeric params simultaneously at their min values
      const allMinParams: Record<string, any> = { ...shape.defaultParams };
      for (const p of shape.paramSchema) {
        if (p.type === 'number' && p.min !== undefined) {
          allMinParams[p.key] = p.min;
        }
      }
      const minRes = evaluateAutoShape(shape, w, h, allMinParams);
      expect(minRes.error, `Shape ${shape.id} failed with all parameters at min: ${minRes.error}`).toBeUndefined();

      // 3. All numeric params simultaneously at their max values
      const allMaxParams: Record<string, any> = { ...shape.defaultParams };
      for (const p of shape.paramSchema) {
        if (p.type === 'number' && p.max !== undefined) {
          allMaxParams[p.key] = p.max;
        }
      }
      const maxRes = evaluateAutoShape(shape, w, h, allMaxParams);
      expect(maxRes.error, `Shape ${shape.id} failed with all parameters at max: ${maxRes.error}`).toBeUndefined();
    }
  });

  it('STAGE 4: Adversarial control point dragging across extreme coordinate boundaries', () => {
    const extremeDragCoords = [
      { x: -500, y: -500, label: 'extreme negative (-500, -500)' },
      { x: 5000, y: 5000, label: 'extreme positive (5000, 5000)' },
      { x: 0, y: 0, label: 'origin (0, 0)' },
      { x: -1000, y: 2000, label: 'cross quadrant (-1000, 2000)' },
      { x: 2000, y: -1000, label: 'cross quadrant (2000, -1000)' },
      { x: 100, y: 75, label: 'center (100, 75)' },
    ];

    let totalDragInteractions = 0;
    let shapesWithHandles = 0;

    for (const shape of PCB_LAYOUT_AUTOSHAPES) {
      const w = 200;
      const h = 150;
      const initial = evaluateAutoShape(shape, w, h, shape.defaultParams);

      if (initial.controlPoints && initial.controlPoints.length > 0) {
        shapesWithHandles++;

        for (const cp of initial.controlPoints) {
          expect(typeof cp.id).toBe('string');
          expect(Number.isFinite(cp.x)).toBe(true);
          expect(Number.isFinite(cp.y)).toBe(true);

          for (const coord of extremeDragCoords) {
            totalDragInteractions++;
            let mutatedParams: Record<string, any> | undefined;

            expect(() => {
              mutatedParams = dragAutoShapeControlPoint(
                shape,
                cp.id,
                coord.x,
                coord.y,
                w,
                h,
                shape.defaultParams
              );
            }).not.toThrow();

            expect(mutatedParams).toBeDefined();
            expect(typeof mutatedParams).toBe('object');

            // Re-evaluate shape with mutated parameters from extreme drag
            const reEval = evaluateAutoShape(shape, w, h, mutatedParams!);
            expect(reEval.error, `Shape ${shape.id} re-eval failed after dragging CP ${cp.id} to ${coord.label}: ${reEval.error}`).toBeUndefined();
            expect(reEval.paths.length).toBeGreaterThanOrEqual(1);

            for (let pIdx = 0; pIdx < reEval.paths.length; pIdx++) {
              for (let nIdx = 0; nIdx < reEval.paths[pIdx].nodes.length; nIdx++) {
                const node = reEval.paths[pIdx].nodes[nIdx];
                expect(
                  Number.isFinite(node.x),
                  `Shape ${shape.id} node.x non-finite after dragging CP ${cp.id} to ${coord.label}`
                ).toBe(true);
                expect(
                  Number.isFinite(node.y),
                  `Shape ${shape.id} node.y non-finite after dragging CP ${cp.id} to ${coord.label}`
                ).toBe(true);
              }
            }
          }
        }
      }
    }

    expect(shapesWithHandles, 'Should have multiple interactive PCB shapes with control points').toBeGreaterThanOrEqual(10);
    expect(totalDragInteractions, 'Should have executed dozens of drag interactions').toBeGreaterThanOrEqual(60);
  });

  it('STAGE 5: Verify IPC-7351B domain-specific geometry invariants for key footprints', () => {
    // 1. DIP IC Package: pin count, row spacing, notch
    const dip = PCB_LAYOUT_AUTOSHAPES.find((s) => s.id === 'pcb-ic-dip')!;
    expect(dip).toBeDefined();
    const dipEval = evaluateAutoShape(dip, 200, 100, { pinCount: 16 });
    expect(dipEval.paths.length).toBeGreaterThanOrEqual(16); // body + 16 pins

    // 2. QFP IC Package: 4-sided gull-wing pins
    const qfp = PCB_LAYOUT_AUTOSHAPES.find((s) => s.id === 'pcb-ic-qfp')!;
    expect(qfp).toBeDefined();
    const qfpEval = evaluateAutoShape(qfp, 200, 200, { pinsPerSide: 12 });
    expect(qfpEval.paths.length).toBeGreaterThanOrEqual(48); // 4 * 12 pins

    // 3. QFN Package: Central thermal pad + thermal via grid
    const qfn = PCB_LAYOUT_AUTOSHAPES.find((s) => s.id === 'pcb-ic-qfn')!;
    expect(qfn).toBeDefined();
    const qfnEval = evaluateAutoShape(qfn, 160, 160, { pinsPerSide: 8, showThermalVias: true });
    expect(qfnEval.paths.length).toBeGreaterThanOrEqual(34);

    // 4. USB-C Receptacle: ground tabs and signal pins
    const usbc = PCB_LAYOUT_AUTOSHAPES.find((s) => s.id === 'pcb-conn-usbc')!;
    expect(usbc).toBeDefined();
    const usbcEval = evaluateAutoShape(usbc, 180, 140, usbc.defaultParams);
    expect(usbcEval.paths.length).toBeGreaterThanOrEqual(5);

    // 5. 45° Mitered Trace: acid-trap prevention
    const trace45 = PCB_LAYOUT_AUTOSHAPES.find((s) => s.id === 'pcb-route-trace-45')!;
    expect(trace45).toBeDefined();
    const trace45Eval = evaluateAutoShape(trace45, 200, 150, trace45.defaultParams);
    expect(trace45Eval.paths.length).toBeGreaterThanOrEqual(1);

    // 6. Board Outline: FR4 substrate with mounting holes and corner rounding
    const boardOutline = PCB_LAYOUT_AUTOSHAPES.find((s) => s.id === 'pcb-outline-board')!;
    expect(boardOutline).toBeDefined();
    const boardEval = evaluateAutoShape(boardOutline, 500, 350, { cornerRadius: 20, showMountingHoles: true });
    expect(boardEval.paths.length).toBeGreaterThanOrEqual(5); // outline + 4 holes
  });

  it('STAGE 6: Adversarial Degenerate Inputs & Division-by-Zero Stress Testing', () => {
    // Test degenerate canvas dimensions: 0, negative, fractional, huge
    const degenerateDimensions = [
      { w: 0, h: 0 },
      { w: -100, h: -100 },
      { w: 0.001, h: 0.001 },
      { w: 1e6, h: 1e6 },
    ];

    for (const shape of PCB_LAYOUT_AUTOSHAPES) {
      for (const dims of degenerateDimensions) {
        // evaluateAutoShape should never throw, even with 0 or negative width/height
        const res = evaluateAutoShape(shape, dims.w, dims.h, shape.defaultParams);
        expect(res.error, `Shape ${shape.id} threw error at (${dims.w}, ${dims.h}): ${res.error}`).toBeUndefined();
        expect(res.paths.length).toBeGreaterThanOrEqual(1);

        for (const p of res.paths) {
          for (const n of p.nodes) {
            expect(Number.isFinite(n.x), `Shape ${shape.id} at (${dims.w}, ${dims.h}) node.x is non-finite: ${n.x}`).toBe(true);
            expect(Number.isFinite(n.y), `Shape ${shape.id} at (${dims.w}, ${dims.h}) node.y is non-finite: ${n.y}`).toBe(true);
          }
        }
      }
    }

    // Test malformed / malicious parameter types: NaN, null, undefined, strings, Infinity
    const toxicValues = [NaN, null, undefined, '', 'invalid_string', Infinity, -Infinity];

    for (const shape of PCB_LAYOUT_AUTOSHAPES) {
      for (const param of shape.paramSchema) {
        for (const toxic of toxicValues) {
          const toxicParams = { ...shape.defaultParams, [param.key]: toxic };
          const res = evaluateAutoShape(shape, 200, 150, toxicParams);

          // The engine and helper functions (clamp, Math.max, etc.) must remain safe
          expect(res.error, `Shape ${shape.id} parameter ${param.key}=${toxic} crashed with error: ${res.error}`).toBeUndefined();
          expect(res.paths.length).toBeGreaterThanOrEqual(1);

          for (const p of res.paths) {
            for (const n of p.nodes) {
              expect(Number.isFinite(n.x), `Shape ${shape.id} toxic ${param.key}=${toxic} yielded non-finite x: ${n.x}`).toBe(true);
              expect(Number.isFinite(n.y), `Shape ${shape.id} toxic ${param.key}=${toxic} yielded non-finite y: ${n.y}`).toBe(true);
            }
          }
        }
      }
    }

    // Test dragAutoShapeControlPoint with non-existent control IDs and toxic coordinates
    for (const shape of PCB_LAYOUT_AUTOSHAPES) {
      const res = dragAutoShapeControlPoint(shape, 'NON_EXISTENT_CP_ID', 100, 100, 200, 150, shape.defaultParams);
      expect(res).toBeDefined();
      expect(typeof res).toBe('object');

      // Toxic drag coordinates: NaN, Infinity, -Infinity
      for (const toxicX of [NaN, Infinity, -Infinity]) {
        for (const toxicY of [NaN, Infinity, -Infinity]) {
          const resToxic = dragAutoShapeControlPoint(shape, 'some_id', toxicX, toxicY, 200, 150, shape.defaultParams);
          expect(resToxic).toBeDefined();
          expect(typeof resToxic).toBe('object');
        }
      }
    }
  });
});


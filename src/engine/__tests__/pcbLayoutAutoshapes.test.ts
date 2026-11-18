// @ts-ignore
import { describe, it, expect, beforeAll } from 'vitest';
import { evaluateAutoShape, dragAutoShapeControlPoint, interactAutoShapeInPreview, DEFAULT_AUTOSHAPES } from '../autoshapes';
import type { AutoShapeDefinition, BezierNode, AutoShapeControlPoint } from '../../types/editor';

let pcbModule: any = null;

describe('PCB Layout AutoShapes Suite (Tiers 1, 2, and 3)', () => {
  let pcbShapes: AutoShapeDefinition[] = [];

  beforeAll(async () => {
    // Progressive testability: Attempt dynamic import of pcbLayoutAutoshapes or check DEFAULT_AUTOSHAPES
    try {
      const pcbPath = '../pcbLayoutAutoshapes';
      pcbModule = await import(/* @vite-ignore */ pcbPath);
    } catch {
      pcbModule = null;
    }

    if (pcbModule && Array.isArray(pcbModule.PCB_LAYOUT_AUTOSHAPES)) {
      pcbShapes = pcbModule.PCB_LAYOUT_AUTOSHAPES;
    } else {
      pcbShapes = DEFAULT_AUTOSHAPES.filter((s) => s.category === 'PCB Layout');
    }
  });

  // Helper to ensure shapes are populated
  function getPcbShapes(): AutoShapeDefinition[] {
    if (pcbShapes.length > 0) return pcbShapes;
    return DEFAULT_AUTOSHAPES.filter((s) => s.category === 'PCB Layout');
  }

  function findShape(predicate: (s: AutoShapeDefinition) => boolean): AutoShapeDefinition | undefined {
    return getPcbShapes().find(predicate);
  }

  // =========================================================================
  // TIER 1: FEATURE COVERAGE & DEFAULT STATE VERIFICATION
  // =========================================================================
  describe('Tier 1: Feature Coverage & Default State Verification', () => {
    it('TC-T1-01: Suite Presence & Category Invariant', () => {
      const shapes = getPcbShapes();
      expect(shapes.length, 'PCB Layout suite should contain at least 10 parametric shapes').toBeGreaterThanOrEqual(10);
      for (const shape of shapes) {
        expect(shape.category, `Shape ${shape.id} must be in category 'PCB Layout'`).toBe('PCB Layout');
        expect(shape.id, `Shape ID ${shape.id} must begin with 'pcb-' prefix`).toMatch(/^pcb-/);
        expect(shape.name.trim().length, `Shape ${shape.id} must have non-empty name`).toBeGreaterThan(0);
        expect(shape.description.trim().length, `Shape ${shape.id} must have non-empty description`).toBeGreaterThan(0);
        expect(shape.iconName.trim().length, `Shape ${shape.id} must specify a valid Lucide icon`).toBeGreaterThan(0);
        expect(shape.jsSourceCode.trim().length, `Shape ${shape.id} must have valid jsSourceCode`).toBeGreaterThan(0);
      }
    });

    it('TC-T1-02: Parameter Schema & Default Values Synchronization', () => {
      const shapes = getPcbShapes();
      for (const shape of shapes) {
        expect(Array.isArray(shape.paramSchema), `Shape ${shape.id} paramSchema must be an array`).toBe(true);
        expect(shape.defaultParams, `Shape ${shape.id} must define defaultParams`).toBeDefined();

        for (const meta of shape.paramSchema) {
          expect(typeof meta.key, `Meta key in ${shape.id} must be string`).toBe('string');
          expect(typeof meta.label, `Meta label in ${shape.id} must be string`).toBe('string');
          expect(['number', 'boolean', 'string'], `Meta type in ${shape.id} must be number, boolean, or string`).toContain(meta.type);

          if (meta.type === 'number') {
            const defVal = Number(shape.defaultParams[meta.key] ?? meta.defaultValue);
            if (meta.min !== undefined) {
              expect(defVal, `Default for ${shape.id}.${meta.key} (${defVal}) should be >= min (${meta.min})`).toBeGreaterThanOrEqual(meta.min);
            }
            if (meta.max !== undefined) {
              expect(defVal, `Default for ${shape.id}.${meta.key} (${defVal}) should be <= max (${meta.max})`).toBeLessThanOrEqual(meta.max);
            }
          }
        }
      }
    });

    it('TC-T1-03: Default Instantiation & Geometry Invariants', () => {
      const shapes = getPcbShapes();
      for (const shape of shapes) {
        const width = 200;
        const height = 150;
        const result = evaluateAutoShape(shape, width, height, shape.defaultParams);

        expect(result.error, `Shape ${shape.id} failed evaluation: ${result.error}`).toBeUndefined();
        expect(result.paths.length, `Shape ${shape.id} must produce at least 1 path`).toBeGreaterThanOrEqual(1);

        let totalNodes = 0;
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        for (let pIdx = 0; pIdx < result.paths.length; pIdx++) {
          const path = result.paths[pIdx];
          expect(path.nodes.length, `Path ${pIdx} in ${shape.id} must contain at least 1 node`).toBeGreaterThanOrEqual(1);
          totalNodes += path.nodes.length;

          for (let nIdx = 0; nIdx < path.nodes.length; nIdx++) {
            const node = path.nodes[nIdx];
            expect(Number.isFinite(node.x), `Node ${nIdx} in ${shape.id} path ${pIdx} x coordinate must be finite`).toBe(true);
            expect(Number.isFinite(node.y), `Node ${nIdx} in ${shape.id} path ${pIdx} y coordinate must be finite`).toBe(true);
            expect(Number.isFinite(node.cp1x), `Node ${nIdx} in ${shape.id} path ${pIdx} cp1x must be finite`).toBe(true);
            expect(Number.isFinite(node.cp1y), `Node ${nIdx} in ${shape.id} path ${pIdx} cp1y must be finite`).toBe(true);
            expect(Number.isFinite(node.cp2x), `Node ${nIdx} in ${shape.id} path ${pIdx} cp2x must be finite`).toBe(true);
            expect(Number.isFinite(node.cp2y), `Node ${nIdx} in ${shape.id} path ${pIdx} cp2y must be finite`).toBe(true);

            minX = Math.min(minX, node.x);
            maxX = Math.max(maxX, node.x);
            minY = Math.min(minY, node.y);
            maxY = Math.max(maxY, node.y);
          }
        }

        expect(totalNodes, `Shape ${shape.id} must generate nodes`).toBeGreaterThanOrEqual(2);
        const boundW = maxX - minX;
        const boundH = maxY - minY;
        expect(boundW, `Shape ${shape.id} bounding width must be > 0`).toBeGreaterThan(0);
        expect(boundH, `Shape ${shape.id} bounding height must be > 0`).toBeGreaterThan(0);
      }
    });
  });

  // =========================================================================
  // TIER 2: BOUNDARY & CORNER CASES
  // =========================================================================
  describe('Tier 2: Boundary & Corner Cases', () => {
    it('TC-T2-01: DIP IC Package Pin Count & Row Spacing Extremes', () => {
      const dipShape = findShape((s) => s.id.includes('dip'));
      if (!dipShape) return;

      // Minimum pin count boundary (4 pins)
      const minRes = evaluateAutoShape(dipShape, 120, 80, { pinCount: 4, pins: 4, rowSpacingRatio: 0.45 });
      expect(minRes.error).toBeUndefined();
      expect(minRes.paths.length).toBeGreaterThanOrEqual(1);

      // Maximum pin count boundary (40 pins)
      const maxRes = evaluateAutoShape(dipShape, 200, 400, { pinCount: 40, pins: 40, rowSpacingRatio: 0.9 });
      expect(maxRes.error).toBeUndefined();
      expect(maxRes.paths.length).toBeGreaterThan(minRes.paths.length);

      // Check all coordinates are finite
      for (const path of maxRes.paths) {
        for (const n of path.nodes) {
          expect(Number.isFinite(n.x)).toBe(true);
          expect(Number.isFinite(n.y)).toBe(true);
        }
      }
    });

    it('TC-T2-02: QFP IC Package Pin Count & Body Ratio Extremes', () => {
      const qfpShape = findShape((s) => s.id.includes('qfp'));
      if (!qfpShape) return;

      // Minimum pins per side (8 pins/side -> 32 pins)
      const minRes = evaluateAutoShape(qfpShape, 120, 120, { pinsPerSide: 8, bodyRatio: 0.55 });
      expect(minRes.error).toBeUndefined();

      // Maximum pins per side (25 pins/side -> 100 pins)
      const maxRes = evaluateAutoShape(qfpShape, 240, 240, { pinsPerSide: 25, bodyRatio: 0.82 });
      expect(maxRes.error).toBeUndefined();
      expect(maxRes.paths.length).toBeGreaterThan(minRes.paths.length);

      for (const path of maxRes.paths) {
        for (const n of path.nodes) {
          expect(Number.isFinite(n.x)).toBe(true);
          expect(Number.isFinite(n.y)).toBe(true);
        }
      }
    });

    it('TC-T2-03: QFN IC Package Thermal Pad & Via Array Toggles', () => {
      const qfnShape = findShape((s) => s.id.includes('qfn'));
      if (!qfnShape) return;

      // Thermal vias enabled with large pad
      const withVias = evaluateAutoShape(qfnShape, 100, 100, {
        pinsPerSide: 6,
        thermalPadRatio: 0.65,
        thermalPadSize: 0.65,
        showThermalVias: true,
      });
      expect(withVias.error).toBeUndefined();

      // Thermal vias disabled with small pad
      const withoutVias = evaluateAutoShape(qfnShape, 100, 100, {
        pinsPerSide: 4,
        thermalPadRatio: 0.3,
        thermalPadSize: 0.3,
        showThermalVias: false,
      });
      expect(withoutVias.error).toBeUndefined();
      expect(withoutVias.paths.length).toBeLessThanOrEqual(withVias.paths.length);
    });

    it('TC-T2-04: Board Outline Corner Radius & Inset Boundaries', () => {
      const outlineShape = findShape((s) => s.id.includes('board') || s.id.includes('outline'));
      if (!outlineShape) return;

      // Zero radius (sharp square corners)
      const sharpRes = evaluateAutoShape(outlineShape, 400, 300, {
        cornerRadius: 0,
        showMountingHoles: false,
      });
      expect(sharpRes.error).toBeUndefined();
      expect(sharpRes.paths[0].nodes.length).toBeGreaterThanOrEqual(4);

      // Maximum radius (40px) with mounting holes enabled
      const roundedRes = evaluateAutoShape(outlineShape, 400, 300, {
        cornerRadius: 40,
        showMountingHoles: true,
        holeInsetRatio: 0.15,
      });
      expect(roundedRes.error).toBeUndefined();
      expect(roundedRes.paths.length).toBeGreaterThan(sharpRes.paths.length);

      for (const path of roundedRes.paths) {
        for (const n of path.nodes) {
          expect(Number.isFinite(n.x)).toBe(true);
          expect(Number.isFinite(n.y)).toBe(true);
        }
      }
    });

    it('TC-T2-05: Conductive Trace Track Width Boundaries (1px to 24px)', () => {
      const traceShape = findShape((s) => s.id.includes('trace'));
      if (!traceShape) return;

      // Thin trace (1px)
      const thinRes = evaluateAutoShape(traceShape, 150, 100, { traceWidth: 1, cornerOffsetRatio: 0.2 });
      expect(thinRes.error).toBeUndefined();

      // Thick power rail (24px)
      const thickRes = evaluateAutoShape(traceShape, 150, 100, { traceWidth: 24, cornerOffsetRatio: 0.8 });
      expect(thickRes.error).toBeUndefined();

      for (const path of thickRes.paths) {
        for (const n of path.nodes) {
          expect(Number.isFinite(n.x)).toBe(true);
          expect(Number.isFinite(n.y)).toBe(true);
        }
      }
    });

    it('TC-T2-06: SMT Passive Resizing Across Standard Presets', () => {
      const smdShape = findShape((s) => s.id.includes('passive') || s.id.includes('smd'));
      if (!smdShape) return;

      const eval0402 = evaluateAutoShape(smdShape, 40, 20, { padWidthRatio: 0.2, gapRatio: 0.5 });
      expect(eval0402.error).toBeUndefined();

      const eval1206 = evaluateAutoShape(smdShape, 80, 40, { padWidthRatio: 0.4, gapRatio: 0.3 });
      expect(eval1206.error).toBeUndefined();

      expect(eval0402.paths.length).toBeGreaterThanOrEqual(1);
      expect(eval1206.paths.length).toBeGreaterThanOrEqual(1);
    });

    it('TC-T2-07: Pin Header Pin Count & Dual Row Configurations', () => {
      const headerShape = findShape((s) => s.id.includes('header'));
      if (!headerShape) return;

      // Single row 2 pins
      const single2 = evaluateAutoShape(headerShape, 60, 30, { pins: 2, isDualRow: false, rows: 1 });
      expect(single2.error).toBeUndefined();

      // Dual row 16 pins (2x8)
      const dual16 = evaluateAutoShape(headerShape, 200, 60, { pins: 8, isDualRow: true, rows: 2 });
      expect(dual16.error).toBeUndefined();
      expect(dual16.paths.length).toBeGreaterThan(single2.paths.length);
    });
  });

  // =========================================================================
  // TIER 3: CROSS-FEATURE COMBINATIONS & INTERACTIVITY
  // =========================================================================
  describe('Tier 3: Cross-Feature Combinations & Interactivity', () => {
    it('TC-T3-01: Control Point Existence & Finite Local Handles', () => {
      const shapes = getPcbShapes();
      let interactiveShapeCount = 0;

      for (const shape of shapes) {
        const width = 200;
        const height = 150;
        const evalRes = evaluateAutoShape(shape, width, height, shape.defaultParams);

        if (evalRes.controlPoints && evalRes.controlPoints.length > 0) {
          interactiveShapeCount++;
          const seenIds = new Set<string>();

          for (const cp of evalRes.controlPoints) {
            expect(typeof cp.id, `Control point in ${shape.id} must have string id`).toBe('string');
            expect(seenIds.has(cp.id), `Control point ID ${cp.id} in ${shape.id} must be unique`).toBe(false);
            seenIds.add(cp.id);

            expect(Number.isFinite(cp.x), `CP ${cp.id} in ${shape.id} x must be finite`).toBe(true);
            expect(Number.isFinite(cp.y), `CP ${cp.id} in ${shape.id} y must be finite`).toBe(true);
            expect(typeof cp.label, `CP ${cp.id} in ${shape.id} label must be string`).toBe('string');
            expect(typeof cp.cursor, `CP ${cp.id} in ${shape.id} cursor must be string`).toBe('string');
          }
        }
      }

      expect(interactiveShapeCount, 'At least 5 PCB AutoShapes must expose interactive control points').toBeGreaterThanOrEqual(5);
    });

    it('TC-T3-02: Control Point Drag Mutation & Parameter Clamping', () => {
      const shapes = getPcbShapes();

      for (const shape of shapes) {
        const width = 200;
        const height = 150;
        const initial = evaluateAutoShape(shape, width, height, shape.defaultParams);

        if (initial.controlPoints.length > 0) {
          for (const cp of initial.controlPoints) {
            // Test handle across 4 boundary coordinates to ensure movement in any direction triggers mutation
            const testPositions: [number, number][] = [
              [0, 0],
              [width, height],
              [width * 0.95, height * 0.95],
              [width * 0.05, height * 0.05],
            ];

            const mutatedKeys = new Set<string>();
            let lastDraggedParams: Record<string, any> = shape.defaultParams;

            for (const [tx, ty] of testPositions) {
              const nextParams = dragAutoShapeControlPoint(
                shape,
                cp.id,
                tx,
                ty,
                width,
                height,
                shape.defaultParams
              );
              expect(nextParams, `Drag on ${shape.id}.${cp.id} must return params object`).toBeDefined();

              for (const key of Object.keys(shape.defaultParams)) {
                if (nextParams[key] !== shape.defaultParams[key]) {
                  mutatedKeys.add(key);
                  lastDraggedParams = nextParams;
                }
              }
            }

            // Stricter assertion: dragging MUST mutate at least one parameter (prevents dead handles)
            expect(
              mutatedKeys.size,
              `Control point '${cp.id}' on shape '${shape.id}' (label: "${cp.label}") must mutate at least one parameter when dragged, but remained stagnant across all test coordinates (dead handle detected).`
            ).toBeGreaterThan(0);

            // Re-evaluate with verified mutated parameters
            const reEval = evaluateAutoShape(shape, width, height, lastDraggedParams);
            expect(reEval.error, `Re-evaluation of ${shape.id} after dragging ${cp.id} failed: ${reEval.error}`).toBeUndefined();
            expect(reEval.paths.length).toBeGreaterThanOrEqual(1);

            for (const path of reEval.paths) {
              for (const n of path.nodes) {
                expect(Number.isFinite(n.x), `Node x after drag on ${shape.id} must be finite`).toBe(true);
                expect(Number.isFinite(n.y), `Node y after drag on ${shape.id} must be finite`).toBe(true);
              }
            }
          }
        }
      }
    });

    it('TC-T3-03: Path Closure Semantics & Explicit Flags', () => {
      const shapes = getPcbShapes();
      let openPathFeatureCount = 0;

      for (const shape of shapes) {
        const evalRes = evaluateAutoShape(shape, 200, 150, shape.defaultParams);

        // Every subpath must explicitly set closed as a boolean
        for (const p of evalRes.paths) {
          expect(typeof p.closed, `Path in ${shape.id} must explicitly declare boolean closed flag`).toBe('boolean');
          if (p.closed === false) {
            openPathFeatureCount++;
          }
        }

        // IC packages, passives, pads, mounting holes, and board outlines must have closed main body (Subpath 0)
        if (
          shape.id.includes('ic') ||
          shape.id.includes('passive') ||
          shape.id.includes('pad') ||
          shape.id.includes('board') ||
          shape.id.includes('mount') ||
          shape.id.includes('qfp') ||
          shape.id.includes('qfn') ||
          shape.id.includes('dip')
        ) {
          expect(evalRes.paths[0].closed, `Subpath 0 in package ${shape.id} must be closed`).toBe(true);
        }
      }

      // Verify that open-path detail features (e.g. screw slots, polarity markings) exist in the suite
      expect(openPathFeatureCount, 'Suite should include detail features with open paths (closed: false)').toBeGreaterThanOrEqual(1);
    });

    it('TC-T3-04: Multi-Subpath Rendering Invariant (Body vs Pads/Features)', () => {
      const shapes = getPcbShapes();
      const multiSubpathShapes = shapes.filter((s) => {
        const evalRes = evaluateAutoShape(s, 200, 150, s.defaultParams);
        return evalRes.paths.length > 1;
      });

      expect(multiSubpathShapes.length, 'Suite must include multi-subpath footprints (ICs, headers, passives)').toBeGreaterThanOrEqual(5);

      for (const shape of multiSubpathShapes) {
        const evalRes = evaluateAutoShape(shape, 200, 150, shape.defaultParams);
        // Subpath 0 is component body/container
        expect(evalRes.paths[0].nodes.length, `Subpath 0 in ${shape.id} must contain bounding nodes`).toBeGreaterThanOrEqual(3);

        // Subpaths 1..N must represent valid copper pads or inner features
        for (let i = 1; i < evalRes.paths.length; i++) {
          expect(evalRes.paths[i].nodes.length, `Subpath ${i} in ${shape.id} must have nodes`).toBeGreaterThan(0);
        }
      }
    });

    it('TC-T3-05: Live Preview Mode Click Interactivity & Zero-Facade Mutation', () => {
      const shapes = getPcbShapes();
      const interactiveShapes = shapes.filter((s) => s.previewInteractive);

      // Suite-wide invariant: At least 25 PCB shapes must offer live preview interactivity
      expect(
        interactiveShapes.length,
        'PCB Layout suite must offer live preview interactivity on at least 25 shapes'
      ).toBeGreaterThanOrEqual(25);

      for (const shape of interactiveShapes) {
        expect(
          typeof shape.previewHint,
          `Interactive shape '${shape.id}' must declare a descriptive previewHint string`
        ).toBe('string');
        expect(
          shape.previewHint!.trim().length,
          `Shape '${shape.id}' previewHint must not be empty`
        ).toBeGreaterThan(0);

        const width = 200;
        const height = 150;
        const clickResult = interactAutoShapeInPreview(
          shape,
          width * 0.5,
          height * 0.5,
          width,
          height,
          shape.defaultParams
        );

        expect(
          clickResult.changed,
          `interactAutoShapeInPreview for '${shape.id}' must report changed: true`
        ).toBe(true);

        // Genuine parameter mutation check (detects no-op facades)
        const mutatedKeys = Object.keys(shape.defaultParams).filter(
          (k) => clickResult.params[k] !== shape.defaultParams[k]
        );

        expect(
          mutatedKeys.length,
          `Shape '${shape.id}' has previewInteractive: true and hint "${shape.previewHint}", but onPreviewClick returned parameters identical to defaultParams without mutating any property (facade detected).`
        ).toBeGreaterThan(0);

        // Re-evaluate geometry with preview-mutated parameters
        const reEval = evaluateAutoShape(shape, width, height, clickResult.params);
        expect(
          reEval.error,
          `Re-evaluation of '${shape.id}' after preview click failed: ${reEval.error}`
        ).toBeUndefined();
        expect(reEval.paths.length).toBeGreaterThanOrEqual(1);

        for (const path of reEval.paths) {
          for (const node of path.nodes) {
            expect(Number.isFinite(node.x), `Node x non-finite in '${shape.id}' after preview click`).toBe(true);
            expect(Number.isFinite(node.y), `Node y non-finite in '${shape.id}' after preview click`).toBe(true);
          }
        }

        // Verify multi-turn toggle/cycling: clicking again must also return valid state
        const secondClick = interactAutoShapeInPreview(
          shape,
          width * 0.5,
          height * 0.5,
          width,
          height,
          clickResult.params
        );
        const secondEval = evaluateAutoShape(shape, width, height, secondClick.params);
        expect(secondEval.error).toBeUndefined();
      }
    });
  });
});

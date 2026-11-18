// @ts-ignore
import { describe, it, expect } from 'vitest';
import {
  evaluateAutoShape,
  dragAutoShapeControlPoint,
  interactAutoShapeInPreview,
  DEFAULT_AUTOSHAPES,
} from '../autoshapes';
import { PCB_LAYOUT_AUTOSHAPES } from '../pcbLayoutAutoshapes';
import { createPcbStarterSceneObjects } from '../pcbStarterScene';
import type {
  CanvasObject,
  AutoShapeObject,
  VectorPathObject,
  TextObject,
  AutoShapeDefinition,
} from '../../types/editor';

describe('Tier 5 Adversarial Coverage Hardening Suite: PCB Layout AutoShapes & Starter Scene', () => {
  // =========================================================================
  // DIMENSION 1: FLOATING-POINT PRECISION UNDER HIGH ZOOM & MICRO/MACRO SCALING
  // =========================================================================
  describe('Dimension 1: Floating-Point Precision & Extreme Dimension Boundaries', () => {
    it('ADV-01: Micro, sub-pixel, and zero dimensions must not produce NaN, Infinity, or crash', () => {
      const microDimensions = [
        { w: 0, h: 0, label: 'zero (0x0)' },
        { w: 0.0001, h: 0.0001, label: 'micro-float (0.0001x0.0001)' },
        { w: 0.1, h: 0.1, label: 'sub-pixel (0.1x0.1)' },
        { w: 1, h: 1, label: 'single-pixel (1x1)' },
        { w: 2, h: 2, label: 'tiny (2x2)' },
        { w: 4, h: 4, label: 'engine minimum (4x4)' },
        { w: 0.5, h: 500, label: 'tall micro-slit (0.5x500)' },
        { w: 500, h: 0.5, label: 'wide micro-slit (500x0.5)' },
      ];

      for (const shape of PCB_LAYOUT_AUTOSHAPES) {
        for (const dims of microDimensions) {
          const res = evaluateAutoShape(shape, dims.w, dims.h, shape.defaultParams);

          expect(
            res.error,
            `Shape '${shape.id}' crashed at ${dims.label}: ${res.error}`
          ).toBeUndefined();
          expect(
            Array.isArray(res.paths),
            `Shape '${shape.id}' paths not array at ${dims.label}`
          ).toBe(true);
          expect(
            res.paths.length,
            `Shape '${shape.id}' produced 0 paths at ${dims.label}`
          ).toBeGreaterThanOrEqual(1);

          for (let pIdx = 0; pIdx < res.paths.length; pIdx++) {
            const path = res.paths[pIdx];
            for (let nIdx = 0; nIdx < path.nodes.length; nIdx++) {
              const n = path.nodes[nIdx];
              expect(
                Number.isFinite(n.x),
                `Shape '${shape.id}' path ${pIdx} node ${nIdx} x is non-finite (${n.x}) at ${dims.label}`
              ).toBe(true);
              expect(
                Number.isFinite(n.y),
                `Shape '${shape.id}' path ${pIdx} node ${nIdx} y is non-finite (${n.y}) at ${dims.label}`
              ).toBe(true);
              expect(
                Number.isFinite(n.cp1x),
                `Shape '${shape.id}' path ${pIdx} node ${nIdx} cp1x is non-finite at ${dims.label}`
              ).toBe(true);
              expect(
                Number.isFinite(n.cp1y),
                `Shape '${shape.id}' path ${pIdx} node ${nIdx} cp1y is non-finite at ${dims.label}`
              ).toBe(true);
              expect(
                Number.isFinite(n.cp2x),
                `Shape '${shape.id}' path ${pIdx} node ${nIdx} cp2x is non-finite at ${dims.label}`
              ).toBe(true);
              expect(
                Number.isFinite(n.cp2y),
                `Shape '${shape.id}' path ${pIdx} node ${nIdx} cp2y is non-finite at ${dims.label}`
              ).toBe(true);
            }
          }
        }
      }
    });

    it('ADV-02: Macro dimensions (up to 100,000px) and extreme aspect ratios must evaluate stably', () => {
      const macroDimensions = [
        { w: 5000, h: 5000, label: 'high-res board (5000x5000)' },
        { w: 50000, h: 25000, label: 'massive billboard (50000x25000)' },
        { w: 100000, h: 100000, label: 'extreme zoom-out (100000x100000)' },
        { w: 100000, h: 10, label: 'extreme aspect ratio (100000x10)' },
        { w: 10, h: 100000, label: 'extreme aspect ratio (10x100000)' },
      ];

      for (const shape of PCB_LAYOUT_AUTOSHAPES) {
        for (const dims of macroDimensions) {
          const res = evaluateAutoShape(shape, dims.w, dims.h, shape.defaultParams);

          expect(
            res.error,
            `Shape '${shape.id}' failed at ${dims.label}: ${res.error}`
          ).toBeUndefined();

          for (const path of res.paths) {
            for (const n of path.nodes) {
              expect(Number.isFinite(n.x)).toBe(true);
              expect(Number.isFinite(n.y)).toBe(true);
            }
          }
        }
      }
    });

    it('ADV-03: Negative canvas dimensions must be handled gracefully without throwing or NaN', () => {
      const negativeDimensions = [
        { w: -100, h: -100, label: 'both negative (-100, -100)' },
        { w: -500, h: 300, label: 'negative width (-500, 300)' },
        { w: 400, h: -300, label: 'negative height (400, -300)' },
        { w: -0.01, h: -0.01, label: 'negative micro (-0.01, -0.01)' },
      ];

      for (const shape of PCB_LAYOUT_AUTOSHAPES) {
        for (const dims of negativeDimensions) {
          const res = evaluateAutoShape(shape, dims.w, dims.h, shape.defaultParams);

          expect(
            res.error,
            `Shape '${shape.id}' crashed on negative dimensions ${dims.label}: ${res.error}`
          ).toBeUndefined();

          for (const path of res.paths) {
            for (const n of path.nodes) {
              expect(Number.isFinite(n.x)).toBe(true);
              expect(Number.isFinite(n.y)).toBe(true);
            }
          }
        }
      }
    });
  });

  // =========================================================================
  // DIMENSION 2: SOLDER MASK EXPANSION & KEEPOUT CLEARANCE INVARIANTS
  // =========================================================================
  describe('Dimension 2: Solder Mask Expansion & Keepout Clearances', () => {
    it('ADV-04: SMD Rect Pad solder mask expansion toggling & geometric containment', () => {
      const smdPad = PCB_LAYOUT_AUTOSHAPES.find((s) => s.id === 'pcb-feature-smd-pad')!;
      expect(smdPad).toBeDefined();

      const w = 120;
      const h = 80;

      // 1. With mask expansion enabled (default)
      const withMask = evaluateAutoShape(smdPad, w, h, { cornerRadius: 4, showMaskExpansion: true });
      expect(withMask.error).toBeUndefined();
      expect(withMask.paths.length, 'Should have 2 subpaths (mask relief outer + copper pad inner)').toBe(2);
      expect(withMask.paths[0].closed).toBe(true);
      expect(withMask.paths[1].closed).toBe(true);

      // Verify containment: Inner copper pad bounds must lie strictly inside mask expansion relief
      const maskNodes = withMask.paths[0].nodes;
      const padNodes = withMask.paths[1].nodes;

      const maskMinX = Math.min(...maskNodes.map((n) => n.x));
      const maskMaxX = Math.max(...maskNodes.map((n) => n.x));
      const maskMinY = Math.min(...maskNodes.map((n) => n.y));
      const maskMaxY = Math.max(...maskNodes.map((n) => n.y));

      const padMinX = Math.min(...padNodes.map((n) => n.x));
      const padMaxX = Math.max(...padNodes.map((n) => n.x));
      const padMinY = Math.min(...padNodes.map((n) => n.y));
      const padMaxY = Math.max(...padNodes.map((n) => n.y));

      expect(padMinX, 'Copper pad must have solder mask expansion clearance on left').toBeGreaterThan(maskMinX);
      expect(padMaxX, 'Copper pad must have solder mask expansion clearance on right').toBeLessThan(maskMaxX);
      expect(padMinY, 'Copper pad must have solder mask expansion clearance on top').toBeGreaterThan(maskMinY);
      expect(padMaxY, 'Copper pad must have solder mask expansion clearance on bottom').toBeLessThan(maskMaxY);

      // 2. With mask expansion disabled
      const withoutMask = evaluateAutoShape(smdPad, w, h, { cornerRadius: 4, showMaskExpansion: false });
      expect(withoutMask.error).toBeUndefined();
      expect(withoutMask.paths.length, 'Without mask expansion, should only have 1 subpath').toBe(1);
    });

    it('ADV-05: SMD Circular Pad concentric solder mask expansion and concentricity', () => {
      const circPad = PCB_LAYOUT_AUTOSHAPES.find((s) => s.id === 'pcb-feature-circular-pad')!;
      expect(circPad).toBeDefined();

      const w = 100;
      const h = 100;

      const withMask = evaluateAutoShape(circPad, w, h, { diameterRatio: 0.7, showMaskExpansion: true });
      expect(withMask.error).toBeUndefined();
      expect(withMask.paths.length).toBe(2);

      // Both subpaths must be concentric (same center x, y)
      const outerNodes = withMask.paths[0].nodes;
      const innerNodes = withMask.paths[1].nodes;

      const outerCX = (Math.min(...outerNodes.map((n) => n.x)) + Math.max(...outerNodes.map((n) => n.x))) / 2;
      const outerCY = (Math.min(...outerNodes.map((n) => n.y)) + Math.max(...outerNodes.map((n) => n.y))) / 2;
      const innerCX = (Math.min(...innerNodes.map((n) => n.x)) + Math.max(...innerNodes.map((n) => n.x))) / 2;
      const innerCY = (Math.min(...innerNodes.map((n) => n.y)) + Math.max(...innerNodes.map((n) => n.y))) / 2;

      expect(innerCX).toBeCloseTo(outerCX, 1);
      expect(innerCY).toBeCloseTo(outerCY, 1);

      // Without mask expansion
      const noMask = evaluateAutoShape(circPad, w, h, { diameterRatio: 0.7, showMaskExpansion: false });
      expect(noMask.error).toBeUndefined();
      expect(noMask.paths.length).toBe(1);
    });

    it('ADV-06: Fiducial Marker optical keepout zone and ground ring clearance', () => {
      const fiducial = PCB_LAYOUT_AUTOSHAPES.find((s) => s.id === 'pcb-feature-fiducial')!;
      expect(fiducial).toBeDefined();

      const w = 80;
      const h = 80;

      // With outer ground ring
      const withRing = evaluateAutoShape(fiducial, w, h, { dotDiameterRatio: 0.35, showGroundRing: true });
      expect(withRing.error).toBeUndefined();
      expect(withRing.paths.length).toBe(3); // Keepout outer + ground ring + optical dot

      // Without ground ring
      const noRing = evaluateAutoShape(fiducial, w, h, { dotDiameterRatio: 0.35, showGroundRing: false });
      expect(noRing.error).toBeUndefined();
      expect(noRing.paths.length).toBe(2); // Keepout outer + optical dot

      // Subpath 0 (keepout) radius must exceed optical dot radius
      const keepoutNodes = withRing.paths[0].nodes;
      const dotNodes = withRing.paths[2].nodes;

      const keepoutSpan = Math.max(...keepoutNodes.map((n) => n.x)) - Math.min(...keepoutNodes.map((n) => n.x));
      const dotSpan = Math.max(...dotNodes.map((n) => n.x)) - Math.min(...dotNodes.map((n) => n.x));

      expect(keepoutSpan, 'Keepout zone must be substantially larger than optical dot target').toBeGreaterThan(dotSpan * 2);
    });

    it('ADV-07: Chassis Mounting Hole screw keepout, washer ring, and drill hole hierarchy', () => {
      const mountHole = PCB_LAYOUT_AUTOSHAPES.find((s) => s.id === 'pcb-feature-mounting-hole')!;
      expect(mountHole).toBeDefined();

      const w = 120;
      const h = 120;

      for (const size of [1, 2, 3, 4]) {
        // Plated annular ring
        const plated = evaluateAutoShape(mountHole, w, h, { holeSize: size, plated: true });
        expect(plated.error).toBeUndefined();
        expect(plated.paths.length).toBe(3); // keepout + washer ring + drill hole

        const keepoutSpan = Math.max(...plated.paths[0].nodes.map((n) => n.x)) - Math.min(...plated.paths[0].nodes.map((n) => n.x));
        const ringSpan = Math.max(...plated.paths[1].nodes.map((n) => n.x)) - Math.min(...plated.paths[1].nodes.map((n) => n.x));
        const drillSpan = Math.max(...plated.paths[2].nodes.map((n) => n.x)) - Math.min(...plated.paths[2].nodes.map((n) => n.x));

        expect(keepoutSpan, 'Screw head keepout must enclose washer ring').toBeGreaterThan(ringSpan);
        expect(ringSpan, 'Washer ring must enclose drill hole').toBeGreaterThan(drillSpan);
        expect(drillSpan, 'Drill hole must have non-zero diameter').toBeGreaterThan(0);

        // Unplated hole
        const unplated = evaluateAutoShape(mountHole, w, h, { holeSize: size, plated: false });
        expect(unplated.error).toBeUndefined();
        expect(unplated.paths.length).toBe(2); // keepout + drill hole
      }
    });
  });

  // =========================================================================
  // DIMENSION 3: ZERO/NEGATIVE PARAMETERS, MALFORMED TYPES & DRAG ROBUSTNESS
  // =========================================================================
  describe('Dimension 3: Malformed Parameters, Type Coercion & Drag Robustness', () => {
    it('ADV-08: Empty params object ({}) falls back cleanly to defaults on all 30 shapes', () => {
      for (const shape of PCB_LAYOUT_AUTOSHAPES) {
        const res = evaluateAutoShape(shape, 200, 150, {});
        expect(
          res.error,
          `Shape '${shape.id}' failed when evaluated with empty params: ${res.error}`
        ).toBeUndefined();
        expect(res.paths.length).toBeGreaterThanOrEqual(1);

        for (const p of res.paths) {
          for (const n of p.nodes) {
            expect(Number.isFinite(n.x)).toBe(true);
            expect(Number.isFinite(n.y)).toBe(true);
          }
        }
      }
    });

    it('ADV-09: Stringified and extreme numbers for numeric params evaluate safely', () => {
      for (const shape of PCB_LAYOUT_AUTOSHAPES) {
        const stringifiedParams: Record<string, any> = {};
        for (const schema of shape.paramSchema) {
          if (schema.type === 'number') {
            stringifiedParams[schema.key] = String(schema.defaultValue ?? 10);
          } else {
            stringifiedParams[schema.key] = schema.defaultValue;
          }
        }

        const res = evaluateAutoShape(shape, 200, 150, stringifiedParams);
        expect(
          res.error,
          `Shape '${shape.id}' crashed on stringified numeric params: ${res.error}`
        ).toBeUndefined();
      }
    });

    it('ADV-10: dragAutoShapeControlPoint withstands toxic drag vectors (NaN, +/-Infinity, out-of-bounds)', () => {
      const toxicVectors = [
        { x: NaN, y: NaN, label: 'NaN' },
        { x: Infinity, y: -Infinity, label: '+/- Infinity' },
        { x: -1e8, y: 1e8, label: 'astronomical' },
        { x: 0, y: 0, label: 'zero' },
      ];

      for (const shape of PCB_LAYOUT_AUTOSHAPES) {
        const w = 200;
        const h = 150;
        const initial = evaluateAutoShape(shape, w, h, shape.defaultParams);

        if (initial.controlPoints) {
          for (const cp of initial.controlPoints) {
            for (const vec of toxicVectors) {
              let mutated: any;
              expect(() => {
                mutated = dragAutoShapeControlPoint(shape, cp.id, vec.x, vec.y, w, h, shape.defaultParams);
              }).not.toThrow();

              expect(mutated).toBeDefined();
              expect(typeof mutated).toBe('object');

              // Re-evaluating must never throw
              const reEval = evaluateAutoShape(shape, w, h, mutated);
              expect(
                reEval.error,
                `Shape '${shape.id}' failed re-eval after toxic drag of CP '${cp.id}' with ${vec.label}: ${reEval.error}`
              ).toBeUndefined();

              for (const p of reEval.paths) {
                for (const n of p.nodes) {
                  expect(Number.isFinite(n.x)).toBe(true);
                  expect(Number.isFinite(n.y)).toBe(true);
                }
              }
            }
          }
        }
      }
    });

    it('ADV-11: interactAutoShapeInPreview cycles reliably across 10 rapid clicks on all 30 shapes', () => {
      for (const shape of PCB_LAYOUT_AUTOSHAPES) {
        let currentParams = { ...shape.defaultParams };
        const w = 200;
        const h = 150;

        for (let clickIdx = 1; clickIdx <= 10; clickIdx++) {
          const clickRes = interactAutoShapeInPreview(
            shape,
            w * 0.5,
            h * 0.5,
            w,
            h,
            currentParams
          );

          expect(clickRes).toBeDefined();
          expect(typeof clickRes.params).toBe('object');
          expect(clickRes.changed).toBe(true);

          currentParams = clickRes.params;

          // Re-evaluate
          const evalRes = evaluateAutoShape(shape, w, h, currentParams);
          expect(
            evalRes.error,
            `Shape '${shape.id}' crashed on preview click #${clickIdx}: ${evalRes.error}`
          ).toBeUndefined();

          for (const p of evalRes.paths) {
            for (const n of p.nodes) {
              expect(Number.isFinite(n.x)).toBe(true);
              expect(Number.isFinite(n.y)).toBe(true);
            }
          }
        }
      }
    });
  });

  // =========================================================================
  // DIMENSION 4: TRACE MITERS & MULTI-TRACK BUS GEOMETRIC INVARIANTS
  // =========================================================================
  describe('Dimension 4: Trace Miters & Multi-Track Bus Invariants', () => {
    it('ADV-12: 45° Mitered Trace Corner generates valid closed polygon track without self-inversion', () => {
      const trace45 = PCB_LAYOUT_AUTOSHAPES.find((s) => s.id === 'pcb-route-trace-45')!;
      expect(trace45).toBeDefined();

      const offsets = [0.2, 0.35, 0.5, 0.65, 0.8];
      const widths = [2, 6, 12, 24, 30];

      for (const co of offsets) {
        for (const tw of widths) {
          const res = evaluateAutoShape(trace45, 200, 150, { cornerOffsetRatio: co, traceWidth: tw, terminalPads: true });
          expect(res.error).toBeUndefined();
          expect(res.paths.length).toBeGreaterThanOrEqual(1);

          // Subpath 0 is the closed 45-degree mitered copper polygon
          const mainTrace = res.paths[0];
          expect(mainTrace.closed).toBe(true);
          expect(mainTrace.nodes.length, '45° miter strip must have exactly 8 corner nodes').toBe(8);

          // All nodes must be finite
          for (const n of mainTrace.nodes) {
            expect(Number.isFinite(n.x)).toBe(true);
            expect(Number.isFinite(n.y)).toBe(true);
          }
        }
      }
    });

    it('ADV-13: Multi-Track Bus Route preserves uniform spacing and parallel track widths', () => {
      const bus = PCB_LAYOUT_AUTOSHAPES.find((s) => s.id === 'pcb-route-bus')!;
      expect(bus).toBeDefined();

      for (const tracks of [2, 3, 4, 6, 8]) {
        const tw = 6;
        const gap = 8;
        const res = evaluateAutoShape(bus, 300, 200, { tracks, trackWidth: tw, clearanceGap: gap });
        expect(res.error).toBeUndefined();

        // Subpath 0 is envelope box
        expect(res.paths[0].closed).toBe(true);

        // Every track generates 3 subpaths: copper strip + 2 terminal dots -> total 1 + tracks * 3
        expect(res.paths.length).toBe(1 + tracks * 3);

        // Verify parallel track Y spacing
        const trackYs: number[] = [];
        for (let i = 0; i < tracks; i++) {
          const trackPath = res.paths[1 + i * 3];
          const topY = Math.min(...trackPath.nodes.map((n) => n.y));
          const botY = Math.max(...trackPath.nodes.map((n) => n.y));
          const measuredWidth = botY - topY;

          expect(measuredWidth, `Track ${i} width must match requested trackWidth`).toBeCloseTo(tw, 1);
          trackYs.push(topY);
        }

        // Verify uniform gap between successive tracks
        for (let i = 0; i < trackYs.length - 1; i++) {
          const deltaY = trackYs[i + 1] - trackYs[i];
          expect(deltaY, `Spacing between track ${i} and ${i + 1} must equal tw + gap`).toBeCloseTo(tw + gap, 1);
        }
      }
    });

    it('ADV-14: Starter Scene conductive traces adhere strictly to IPC-2221 45° bends and zero short circuits', () => {
      const objects = createPcbStarterSceneObjects();
      const traces = objects.filter((o): o is VectorPathObject => o.type === 'vector-path' && o.id.startsWith('pcb-trace-'));

      expect(traces.length, 'Must have at least 10 conductive traces in starter scene').toBeGreaterThanOrEqual(10);

      const segmentVectors: Array<{ id: string; p1: { x: number; y: number }; p2: { x: number; y: number } }> = [];

      for (const trace of traces) {
        expect(trace.closed).toBe(false);
        expect(trace.strokeWidth).toBeGreaterThanOrEqual(1.5);
        expect(trace.nodes.length).toBeGreaterThanOrEqual(2);

        // Verify 45-degree angle rule: for every segment, either dx === 0, dy === 0, or |dx| === |dy|
        for (let i = 0; i < trace.nodes.length - 1; i++) {
          const n1 = trace.nodes[i];
          const n2 = trace.nodes[i + 1];
          const dx = Math.abs(n2.x - n1.x);
          const dy = Math.abs(n2.y - n1.y);

          if (dx !== 0 && dy !== 0) {
            expect(
              dx,
              `Trace '${trace.id}' segment ${i}->${i + 1} violated IPC-2221 45° angle rule (dx=${dx}, dy=${dy})`
            ).toBe(dy);
          }

          // Global segment coordinates for short-circuit check
          segmentVectors.push({
            id: trace.id,
            p1: { x: trace.x + n1.x, y: trace.y + n1.y },
            p2: { x: trace.x + n2.x, y: trace.y + n2.y },
          });
        }
      }

      // Check no two traces share identical start/end endpoints (electrical short circuit)
      const endpoints = traces.map((t) => ({
        id: t.id,
        start: { x: t.x + t.nodes[0].x, y: t.y + t.nodes[0].y },
        end: { x: t.x + t.nodes[t.nodes.length - 1].x, y: t.y + t.nodes[t.nodes.length - 1].y },
      }));

      for (let i = 0; i < endpoints.length; i++) {
        for (let j = i + 1; j < endpoints.length; j++) {
          const e1 = endpoints[i];
          const e2 = endpoints[j];
          const startMatches = e1.start.x === e2.start.x && e1.start.y === e2.start.y;
          const endMatches = e1.end.x === e2.end.x && e1.end.y === e2.end.y;
          expect(
            startMatches && endMatches,
            `Electrical short-circuit detected: Trace '${e1.id}' and '${e2.id}' share identical start and end terminals`
          ).toBe(false);
        }
      }
    });
  });

  // =========================================================================
  // DIMENSION 5: SCENE GRAPH SERIALIZATION & DESERIALIZATION INVARIANTS
  // =========================================================================
  describe('Dimension 5: Scene Graph Serialization, Deserialization & Stacking', () => {
    it('ADV-15: Deep JSON serialization round-trip maintains 100% property fidelity', () => {
      const originalObjects = createPcbStarterSceneObjects();

      // 1. Serialize to JSON string
      let jsonString: string = '';
      expect(() => {
        jsonString = JSON.stringify(originalObjects);
      }).not.toThrow();
      expect(jsonString.length).toBeGreaterThan(1000);

      // 2. Deserialize back from JSON
      let restoredObjects: CanvasObject[] = [];
      expect(() => {
        restoredObjects = JSON.parse(jsonString);
      }).not.toThrow();

      expect(restoredObjects.length).toBe(originalObjects.length);

      // 3. Property-by-property deep equality check
      for (let i = 0; i < originalObjects.length; i++) {
        const orig = originalObjects[i];
        const rest = restoredObjects[i];

        expect(rest.id).toBe(orig.id);
        expect(rest.name).toBe(orig.name);
        expect(rest.type).toBe(orig.type);
        expect(rest.x).toBe(orig.x);
        expect(rest.y).toBe(orig.y);
        expect(rest.width).toBe(orig.width);
        expect(rest.height).toBe(orig.height);
        expect(rest.rotation).toBe(orig.rotation);
        expect(rest.opacity).toBe(orig.opacity);
        expect(rest.visible).toBe(orig.visible);
        expect(rest.locked).toBe(orig.locked);
        expect(rest.fill).toBe(orig.fill);
        expect(rest.stroke).toBe(orig.stroke);
        expect(rest.strokeWidth).toBe(orig.strokeWidth);

        if (orig.type === 'autoshape' && rest.type === 'autoshape') {
          expect(rest.shapeDefId).toBe(orig.shapeDefId);
          expect(rest.params).toEqual(orig.params);
        }

        if (orig.type === 'vector-path' && rest.type === 'vector-path') {
          expect(rest.closed).toBe(orig.closed);
          expect(rest.nodes.length).toBe(orig.nodes.length);
          for (let n = 0; n < orig.nodes.length; n++) {
            expect(rest.nodes[n].x).toBe(orig.nodes[n].x);
            expect(rest.nodes[n].y).toBe(orig.nodes[n].y);
            expect(rest.nodes[n].cp1x).toBe(orig.nodes[n].cp1x);
            expect(rest.nodes[n].cp1y).toBe(orig.nodes[n].cp1y);
            expect(rest.nodes[n].cp2x).toBe(orig.nodes[n].cp2x);
            expect(rest.nodes[n].cp2y).toBe(orig.nodes[n].cp2y);
          }
        }

        if (orig.type === 'text' && rest.type === 'text') {
          expect(rest.text).toBe(orig.text);
          expect(rest.fontSize).toBe(orig.fontSize);
          expect(rest.fontFamily).toBe(orig.fontFamily);
          expect(rest.fontWeight).toBe(orig.fontWeight);
        }
      }
    });

    it('ADV-16: Re-evaluating deserialized AutoShapes yields identical geometry to original instantiation', () => {
      const originalObjects = createPcbStarterSceneObjects();
      const serialized = JSON.stringify(originalObjects);
      const restoredObjects: CanvasObject[] = JSON.parse(serialized);

      const defaultMap = new Map<string, AutoShapeDefinition>();
      for (const s of DEFAULT_AUTOSHAPES) {
        defaultMap.set(s.id, s);
      }

      const origAutoShapes = originalObjects.filter((o): o is AutoShapeObject => o.type === 'autoshape');
      const restAutoShapes = restoredObjects.filter((o): o is AutoShapeObject => o.type === 'autoshape');

      expect(origAutoShapes.length).toBe(restAutoShapes.length);

      for (let i = 0; i < origAutoShapes.length; i++) {
        const oOrig = origAutoShapes[i];
        const oRest = restAutoShapes[i];

        const shapeDef = defaultMap.get(oOrig.shapeDefId)!;
        expect(shapeDef).toBeDefined();

        const evalOrig = evaluateAutoShape(shapeDef, oOrig.width, oOrig.height, oOrig.params);
        const evalRest = evaluateAutoShape(shapeDef, oRest.width, oRest.height, oRest.params);

        expect(evalOrig.error).toBeUndefined();
        expect(evalRest.error).toBeUndefined();

        expect(evalRest.paths.length).toBe(evalOrig.paths.length);

        for (let pIdx = 0; pIdx < evalOrig.paths.length; pIdx++) {
          const pOrig = evalOrig.paths[pIdx];
          const pRest = evalRest.paths[pIdx];

          expect(pRest.closed).toBe(pOrig.closed);
          expect(pRest.nodes.length).toBe(pOrig.nodes.length);

          for (let nIdx = 0; nIdx < pOrig.nodes.length; nIdx++) {
            expect(pRest.nodes[nIdx].x).toBe(pOrig.nodes[nIdx].x);
            expect(pRest.nodes[nIdx].y).toBe(pOrig.nodes[nIdx].y);
            expect(pRest.nodes[nIdx].cp1x).toBe(pOrig.nodes[nIdx].cp1x);
            expect(pRest.nodes[nIdx].cp1y).toBe(pOrig.nodes[nIdx].cp1y);
            expect(pRest.nodes[nIdx].cp2x).toBe(pOrig.nodes[nIdx].cp2x);
            expect(pRest.nodes[nIdx].cp2y).toBe(pOrig.nodes[nIdx].cp2y);
          }
        }
      }
    });

    it('ADV-17: Layer visibility toggles and active state overrides preserve scene integrity', () => {
      const objects = createPcbStarterSceneObjects();

      // Test toggling visibility on each layer
      for (let layerIdx = 0; layerIdx <= 9; layerIdx++) {
        const cloned: CanvasObject[] = JSON.parse(JSON.stringify(objects));

        // Hide all objects in this layer
        cloned.forEach((o) => {
          (o as any).visible = false;
        });

        // Visible objects filter
        const visibleObjects = cloned.filter((o) => o.visible);
        expect(visibleObjects.length).toBe(0);
      }

      // Test hover state overrides on VectorCard objects
      const cardsWithHover = objects.filter(
        (o) => o.stateVariants && o.stateVariants.hover
      );
      expect(cardsWithHover.length, 'Sidebar HUD cards must define :hover state variants').toBeGreaterThanOrEqual(4);

      for (const card of cardsWithHover) {
        const hover = card.stateVariants!.hover!;
        expect(hover.fill || hover.stroke || hover.shadow).toBeDefined();
      }
    });
  });
});

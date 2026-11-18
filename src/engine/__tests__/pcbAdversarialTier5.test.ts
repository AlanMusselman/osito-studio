// @ts-ignore
import { describe, it, expect, vi } from 'vitest';
import { PCB_LAYOUT_AUTOSHAPES } from '../pcbLayoutAutoshapes';
import { createPcbStarterSceneObjects } from '../pcbStarterScene';
import {
  evaluateAutoShape,
  dragAutoShapeControlPoint,
  interactAutoShapeInPreview,
  DEFAULT_AUTOSHAPES,
} from '../autoshapes';
import {
  renderCanvasObjectToContext,
  traceBezierNodesOnContext,
} from '../../components/HybridCanvas';
import type {
  CanvasObject,
  AutoShapeObject,
  VectorPathObject,
  TextObject,
  BezierNode,
} from '../../types/editor';
import { shiftHexBrightness, toHexColor } from '../../components/LiveColorPicker';

/**
 * Creates a comprehensive spy mock for CanvasRenderingContext2D
 * tracking all draw operations, coordinate arguments, and path states.
 */
function createMockContext2D() {
  const operations: Array<{ method: string; args: any[] }> = [];

  const ctx: any = {
    operations,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    font: '10px sans-serif',
    textAlign: 'left',
    textBaseline: 'top',
    shadowColor: 'transparent',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,

    save: vi.fn(() => operations.push({ method: 'save', args: [] })),
    restore: vi.fn(() => operations.push({ method: 'restore', args: [] })),
    translate: vi.fn((x: number, y: number) => {
      operations.push({ method: 'translate', args: [x, y] });
    }),
    rotate: vi.fn((angle: number) => {
      operations.push({ method: 'rotate', args: [angle] });
    }),
    beginPath: vi.fn(() => operations.push({ method: 'beginPath', args: [] })),
    closePath: vi.fn(() => operations.push({ method: 'closePath', args: [] })),
    moveTo: vi.fn((x: number, y: number) => {
      operations.push({ method: 'moveTo', args: [x, y] });
    }),
    lineTo: vi.fn((x: number, y: number) => {
      operations.push({ method: 'lineTo', args: [x, y] });
    }),
    bezierCurveTo: vi.fn(
      (cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) => {
        operations.push({ method: 'bezierCurveTo', args: [cp1x, cp1y, cp2x, cp2y, x, y] });
      }
    ),
    rect: vi.fn((x: number, y: number, w: number, h: number) => {
      operations.push({ method: 'rect', args: [x, y, w, h] });
    }),
    roundRect: vi.fn((x: number, y: number, w: number, h: number, r: number) => {
      operations.push({ method: 'roundRect', args: [x, y, w, h, r] });
    }),
    arc: vi.fn((x: number, y: number, r: number, sa: number, ea: number) => {
      operations.push({ method: 'arc', args: [x, y, r, sa, ea] });
    }),
    fill: vi.fn(() => operations.push({ method: 'fill', args: [] })),
    stroke: vi.fn(() => operations.push({ method: 'stroke', args: [] })),
    clip: vi.fn(() => operations.push({ method: 'clip', args: [] })),
    measureText: vi.fn((text: string) => ({
      width: text.length * 6.5,
    })),
    fillText: vi.fn((text: string, x: number, y: number) => {
      operations.push({ method: 'fillText', args: [text, x, y] });
    }),
    strokeRect: vi.fn((x: number, y: number, w: number, h: number) => {
      operations.push({ method: 'strokeRect', args: [x, y, w, h] });
    }),
    fillRect: vi.fn((x: number, y: number, w: number, h: number) => {
      operations.push({ method: 'fillRect', args: [x, y, w, h] });
    }),
    createLinearGradient: vi.fn((x0: number, y0: number, x1: number, y1: number) => ({
      addColorStop: vi.fn(),
    })),
    createRadialGradient: vi.fn(
      (x0: number, y0: number, r0: number, x1: number, y1: number, r1: number) => ({
        addColorStop: vi.fn(),
      })
    ),
  };

  return ctx as CanvasRenderingContext2D & { operations: typeof operations };
}

describe('Tier 5 Adversarial Coverage Hardening: PCB AutoShapes & Multi-Subpath Engine', () => {
  // =========================================================================
  // SUITE 1: SUBPATH 0 ENCLOSING & ANCHORING INVARIANTS
  // =========================================================================
  describe('SUITE 1: Subpath 0 Enclosing & Anchoring Invariants', () => {
    it('Invariant 1.1: Every PCB AutoShape defines Subpath 0 as a strictly closed primary body / boundary', () => {
      for (const shape of PCB_LAYOUT_AUTOSHAPES) {
        const evalRes = evaluateAutoShape(shape, 200, 150, shape.defaultParams);
        expect(evalRes.error, `Shape ${shape.id} evaluation error: ${evalRes.error}`).toBeUndefined();
        expect(evalRes.paths.length, `Shape ${shape.id} must have >= 1 subpath`).toBeGreaterThanOrEqual(1);

        const subpath0 = evalRes.paths[0];
        expect(
          subpath0.closed,
          `Shape ${shape.id} Subpath 0 MUST be strictly closed (closed === true)`
        ).toBe(true);

        expect(
          subpath0.nodes.length,
          `Shape ${shape.id} Subpath 0 must contain >= 3 nodes to form a 2D boundary`
        ).toBeGreaterThanOrEqual(3);

        // Verify finite coordinates on Subpath 0
        for (let i = 0; i < subpath0.nodes.length; i++) {
          const n = subpath0.nodes[i];
          expect(Number.isFinite(n.x), `Shape ${shape.id} Subpath 0 node ${i}.x non-finite`).toBe(true);
          expect(Number.isFinite(n.y), `Shape ${shape.id} Subpath 0 node ${i}.y non-finite`).toBe(true);
        }
      }
    });

    it('Invariant 1.2: Subpath 0 geometric bounding box is non-empty and anchors the component footprint', () => {
      for (const shape of PCB_LAYOUT_AUTOSHAPES) {
        const w = 240;
        const h = 180;
        const evalRes = evaluateAutoShape(shape, w, h, shape.defaultParams);
        const subpath0 = evalRes.paths[0];

        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        for (const n of subpath0.nodes) {
          minX = Math.min(minX, n.x);
          maxX = Math.max(maxX, n.x);
          minY = Math.min(minY, n.y);
          maxY = Math.max(maxY, n.y);
        }

        const bW = maxX - minX;
        const bH = maxY - minY;

        expect(bW, `Shape ${shape.id} Subpath 0 width must be > 0 (got ${bW})`).toBeGreaterThan(0);
        expect(bH, `Shape ${shape.id} Subpath 0 height must be > 0 (got ${bH})`).toBeGreaterThan(0);

        // Subpath 0 center must be reasonably centered within object bounds
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        expect(centerX, `Shape ${shape.id} center X (${centerX}) outside footprint width (${w})`).toBeGreaterThanOrEqual(-20);
        expect(centerX, `Shape ${shape.id} center X (${centerX}) outside footprint width (${w})`).toBeLessThanOrEqual(w + 20);
        expect(centerY, `Shape ${shape.id} center Y (${centerY}) outside footprint height (${h})`).toBeGreaterThanOrEqual(-20);
        expect(centerY, `Shape ${shape.id} center Y (${centerY}) outside footprint height (${h})`).toBeLessThanOrEqual(h + 20);
      }
    });

    it('Invariant 1.3: For board outline & keepout features, Subpath 0 defines the outermost substrate / keepout envelope', () => {
      const boardShape = PCB_LAYOUT_AUTOSHAPES.find((s) => s.id === 'pcb-outline-board')!;
      expect(boardShape).toBeDefined();

      const evalRes = evaluateAutoShape(boardShape, 400, 300, {
        cornerRadius: 15,
        showMountingHoles: true,
      });

      // Subpath 0 is the board outer substrate
      const subpath0 = evalRes.paths[0];
      let s0MinX = Infinity;
      let s0MaxX = -Infinity;
      let s0MinY = Infinity;
      let s0MaxY = -Infinity;
      for (const n of subpath0.nodes) {
        s0MinX = Math.min(s0MinX, n.x);
        s0MaxX = Math.max(s0MaxX, n.x);
        s0MinY = Math.min(s0MinY, n.y);
        s0MaxY = Math.max(s0MaxY, n.y);
      }

      // Verify mounting holes (Subpaths 2..N) are strictly contained inside Subpath 0 bounds
      for (let pIdx = 2; pIdx < evalRes.paths.length; pIdx++) {
        for (const n of evalRes.paths[pIdx].nodes) {
          expect(n.x, `Mounting hole node.x (${n.x}) outside Subpath 0 bounds [${s0MinX}, ${s0MaxX}]`).toBeGreaterThanOrEqual(s0MinX - 1);
          expect(n.x, `Mounting hole node.x (${n.x}) outside Subpath 0 bounds [${s0MinX}, ${s0MaxX}]`).toBeLessThanOrEqual(s0MaxX + 1);
          expect(n.y, `Mounting hole node.y (${n.y}) outside Subpath 0 bounds [${s0MinY}, ${s0MaxY}]`).toBeGreaterThanOrEqual(s0MinY - 1);
          expect(n.y, `Mounting hole node.y (${n.y}) outside Subpath 0 bounds [${s0MinY}, ${s0MaxY}]`).toBeLessThanOrEqual(s0MaxY + 1);
        }
      }
    });
  });

  // =========================================================================
  // SUITE 2: MULTI-SUBPATH RENDERING, CONTRAST & STROKE WEIGHTS
  // =========================================================================
  describe('SUITE 2: Multi-Subpath Rendering, Contrast & Stroke Weights', () => {
    it('Invariant 2.1: Subpaths 1..N stroke weights are clamped to [1.0, 2.5] preventing detail blowout', () => {
      // Test shapes with excessive stroke widths (e.g. 15px, 30px)
      const qfpDef = PCB_LAYOUT_AUTOSHAPES.find((s) => s.id === 'pcb-ic-qfp')!;
      expect(qfpDef).toBeDefined();

      const asObj: AutoShapeObject = {
        id: 'test-qfp-blowout',
        name: 'Test QFP Blowout',
        type: 'autoshape',
        shapeDefId: 'pcb-ic-qfp',
        x: 100,
        y: 100,
        width: 200,
        height: 200,
        rotation: 0,
        opacity: 1,
        blendMode: 'source-over',
        fill: '#1e293b',
        fillType: 'solid',
        fillGradientEnd: '#1e293b',
        stroke: '#f59e0b',
        strokeWidth: 20, // Intentionally massive stroke width!
        strokeAlign: 'center',
        pixelSnap: true,
        shadow: { enabled: false, color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
        visible: true,
        locked: false,
        params: { pinsPerSide: 12 },
      };

      const mockCtx = createMockContext2D();
      renderCanvasObjectToContext(mockCtx, asObj, PCB_LAYOUT_AUTOSHAPES);

      // Inspect stroke width operations for Subpaths 1..N
      // Subpath 0 gets strokeWidth (or inside clip), but subpaths 1..N get innerStrokeW:
      // innerStrokeW = Math.max(1, Math.min(asObj.strokeWidth, 2.5))
      // Therefore, inner strokes MUST NOT exceed 2.5!
      const strokeCalls = mockCtx.operations.filter((op) => op.method === 'stroke');
      expect(strokeCalls.length, 'Must have executed multiple stroke calls').toBeGreaterThanOrEqual(10);

      // Verify that lineWidth never blew up to 20 on inner pads
      // Check the final recorded lineWidth or inner line widths
      expect(mockCtx.lineWidth).toBeLessThanOrEqual(2.5);
      expect(mockCtx.lineWidth).toBeGreaterThanOrEqual(1.0);
    });

    it('Invariant 2.2: Subpaths 1..N render with sharp luminescence contrast against Subpath 0 fill', () => {
      // Test various base fills: dark, light, saturated
      const testFills = ['#0f172a', '#1e293b', '#3b82f6', '#f8fafc', '#000000', '#ffffff'];

      for (const fillHex of testFills) {
        const baseHex = toHexColor(fillHex, '#3b82f6');
        const lighter = shiftHexBrightness(baseHex, 18);
        const darker = shiftHexBrightness(baseHex, -14);
        const strokeColor = shiftHexBrightness(baseHex, 36);

        expect(lighter).toBeDefined();
        expect(lighter.startsWith('#')).toBe(true);
        expect(darker).toBeDefined();
        expect(darker.startsWith('#')).toBe(true);
        expect(strokeColor).toBeDefined();
        expect(strokeColor.startsWith('#')).toBe(true);

        // Verify that contrast shift produces different hex color strings unless saturated at extremes
        if (fillHex !== '#000000' && fillHex !== '#ffffff') {
          expect(lighter).not.toBe(baseHex);
          expect(darker).not.toBe(baseHex);
        }
      }
    });

    it('Invariant 2.3: Multi-subpath AutoShapes render Subpath 0 followed by 1..N without node dropping', () => {
      const qfnDef = PCB_LAYOUT_AUTOSHAPES.find((s) => s.id === 'pcb-ic-qfn')!;
      const asObj: AutoShapeObject = {
        id: 'test-qfn-render',
        name: 'Test QFN',
        type: 'autoshape',
        shapeDefId: 'pcb-ic-qfn',
        x: 50,
        y: 50,
        width: 160,
        height: 160,
        rotation: 0,
        opacity: 1,
        blendMode: 'source-over',
        fill: '#1e293b',
        fillType: 'solid',
        fillGradientEnd: '#1e293b',
        stroke: '#e2e8f0',
        strokeWidth: 2,
        strokeAlign: 'center',
        pixelSnap: true,
        shadow: { enabled: false, color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
        visible: true,
        locked: false,
        params: { pinsPerSide: 6, showThermalVias: true },
      };

      const mockCtx = createMockContext2D();
      renderCanvasObjectToContext(mockCtx, asObj, PCB_LAYOUT_AUTOSHAPES);

      const beginPathCalls = mockCtx.operations.filter((op) => op.method === 'beginPath');
      const strokeCalls = mockCtx.operations.filter((op) => op.method === 'stroke');
      const fillCalls = mockCtx.operations.filter((op) => op.method === 'fill');

      // Evaluated paths count
      const evaluated = evaluateAutoShape(qfnDef, 160, 160, asObj.params);
      expect(evaluated.paths.length).toBeGreaterThan(10);

      // Each subpath gets its own beginPath
      expect(beginPathCalls.length).toBeGreaterThanOrEqual(evaluated.paths.length);
      // Each subpath gets stroked
      expect(strokeCalls.length).toBeGreaterThanOrEqual(evaluated.paths.length);
      // Subpath 0 + closed inner subpaths get filled
      expect(fillCalls.length).toBeGreaterThanOrEqual(evaluated.paths.length);
    });
  });

  // =========================================================================
  // SUITE 3: OPEN TRACES & SILKSCREEN LEADERS — FILL ARTIFACT IMMUNITY
  // =========================================================================
  describe('SUITE 3: Open Traces & Silkscreen Leaders — Accidental Fill Artifact Immunity', () => {
    it('Invariant 3.1: Open subpaths (closed: false) in AutoShapes are NEVER filled, preventing chord/fan artifacts', () => {
      // Test pcb-outline-slot which has an open centerline router trace (Subpath 1)
      const slotDef = PCB_LAYOUT_AUTOSHAPES.find((s) => s.id === 'pcb-outline-slot')!;
      expect(slotDef).toBeDefined();

      const asObj: AutoShapeObject = {
        id: 'test-slot-fill',
        name: 'Test Slot',
        type: 'autoshape',
        shapeDefId: 'pcb-outline-slot',
        x: 100,
        y: 100,
        width: 140,
        height: 40,
        rotation: 0,
        opacity: 1,
        blendMode: 'source-over',
        fill: '#06b6d4',
        fillType: 'solid', // User assigns solid fill to the slot object
        fillGradientEnd: '#06b6d4',
        stroke: '#ffffff',
        strokeWidth: 2,
        strokeAlign: 'center',
        pixelSnap: true,
        shadow: { enabled: false, color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
        visible: true,
        locked: false,
        params: { orientation: 1, slotWidth: 12, label: '' }, // label: '' to isolate path rendering from text pill
      };

      const evalRes = evaluateAutoShape(slotDef, 140, 40, asObj.params);
      expect(evalRes.paths.length).toBe(2);
      expect(evalRes.paths[0].closed, 'Subpath 0 (slot cutout) must be closed').toBe(true);
      expect(evalRes.paths[1].closed, 'Subpath 1 (router centerline) must be OPEN (closed: false)').toBe(false);

      const mockCtx = createMockContext2D();
      renderCanvasObjectToContext(mockCtx, asObj, PCB_LAYOUT_AUTOSHAPES);

      // Track fills vs strokes:
      // Subpath 0 (closed) gets 1 fill.
      // Subpath 1 is open (closed: false), so HybridCanvas line 631 `if (subPath.closed && hasVisibleFill)`
      // MUST NOT execute ctx.fill() for Subpath 1!
      const fillCalls = mockCtx.operations.filter((op) => op.method === 'fill');
      expect(fillCalls.length, 'Only Subpath 0 should be filled, Subpath 1 must NOT be filled').toBe(1);

      // Both subpaths must be stroked
      const strokeCalls = mockCtx.operations.filter((op) => op.method === 'stroke');
      expect(strokeCalls.length, 'Both subpaths must be stroked').toBe(2);
    });

    it('Invariant 3.2: Battery pad polarity crosshair markings (closed: false) are stroked only', () => {
      const battDef = PCB_LAYOUT_AUTOSHAPES.find((s) => s.id === 'pcb-conn-power-pads')!;
      expect(battDef).toBeDefined();

      const asObj: AutoShapeObject = {
        id: 'test-batt-fill',
        name: 'Test Battery Pads',
        type: 'autoshape',
        shapeDefId: 'pcb-conn-power-pads',
        x: 50,
        y: 50,
        width: 160,
        height: 80,
        rotation: 0,
        opacity: 1,
        blendMode: 'source-over',
        fill: '#dc2626', // Bright red fill
        fillType: 'solid',
        fillGradientEnd: '#dc2626',
        stroke: '#fef08a',
        strokeWidth: 2,
        strokeAlign: 'center',
        pixelSnap: true,
        shadow: { enabled: false, color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
        visible: true,
        locked: false,
        params: { showPolarity: true, label: '' },
      };

      const evalRes = evaluateAutoShape(battDef, 160, 80, asObj.params);
      const openPaths = evalRes.paths.filter((p) => !p.closed);
      expect(openPaths.length, 'Must have open paths for polarity crosshairs').toBeGreaterThanOrEqual(2);

      const mockCtx = createMockContext2D();
      renderCanvasObjectToContext(mockCtx, asObj, PCB_LAYOUT_AUTOSHAPES);

      // Verify that the number of fill calls matches ONLY the closed paths count (Subpath 0 + 2 pads)
      const closedPaths = evalRes.paths.filter((p) => p.closed);
      const fillCalls = mockCtx.operations.filter((op) => op.method === 'fill');
      expect(fillCalls.length, 'Number of fill calls must exactly match closed paths count').toBe(closedPaths.length);
    });

    it('Invariant 3.3: Open VectorPath conductive traces in starter scene are never closed or filled', () => {
      const sceneObjects = createPcbStarterSceneObjects();
      const traces = sceneObjects.filter((o): o is VectorPathObject => o.type === 'vector-path' && o.id.startsWith('pcb-trace-'));
      expect(traces.length).toBeGreaterThanOrEqual(6);

      for (const trace of traces) {
        expect(trace.closed, `Trace ${trace.id} must have closed === false`).toBe(false);
        expect(trace.fill, `Trace ${trace.id} must have fill === 'none'`).toBe('none');

        const mockCtx = createMockContext2D();
        renderCanvasObjectToContext(mockCtx, trace, PCB_LAYOUT_AUTOSHAPES);

        // For an open trace with fill: 'none', ctx.fill() MUST NEVER be called
        const fillCalls = mockCtx.operations.filter((op) => op.method === 'fill');
        expect(fillCalls.length, `Trace ${trace.id} must execute zero fills`).toBe(0);

        // It must execute exactly 1 stroke
        const strokeCalls = mockCtx.operations.filter((op) => op.method === 'stroke');
        expect(strokeCalls.length, `Trace ${trace.id} must execute 1 stroke`).toBe(1);
      }
    });
  });

  // =========================================================================
  // SUITE 4: UNUSUAL INPUTS, RAPID CYCLING & STRESS HARNESS
  // =========================================================================
  describe('SUITE 4: Unusual Inputs, Rapid Cycling & Stress Harness', () => {
    it('Input Test 4.1: Non-standard / Odd Pin Counts on Dual-Row & Multi-Side Packages', () => {
      // 1. DIP with odd pin counts (3, 5, 7, 13, 27, 39, 41)
      const dipDef = PCB_LAYOUT_AUTOSHAPES.find((s) => s.id === 'pcb-ic-dip')!;
      for (const oddPins of [3, 5, 7, 13, 27, 39, 41]) {
        const evalRes = evaluateAutoShape(dipDef, 200, 150, { pinCount: oddPins });
        expect(evalRes.error).toBeUndefined();
        expect(evalRes.paths.length).toBeGreaterThanOrEqual(4);
        for (const p of evalRes.paths) {
          for (const n of p.nodes) {
            expect(Number.isFinite(n.x)).toBe(true);
            expect(Number.isFinite(n.y)).toBe(true);
          }
        }
      }

      // 2. SOIC with odd pin counts (7, 9, 13, 29)
      const soicDef = PCB_LAYOUT_AUTOSHAPES.find((s) => s.id === 'pcb-ic-soic')!;
      for (const oddPins of [7, 9, 13, 29]) {
        const evalRes = evaluateAutoShape(soicDef, 200, 150, { pins: oddPins });
        expect(evalRes.error).toBeUndefined();
        expect(evalRes.paths.length).toBeGreaterThanOrEqual(4);
      }

      // 3. QFP with odd pins per side (5, 7, 9, 11, 27)
      const qfpDef = PCB_LAYOUT_AUTOSHAPES.find((s) => s.id === 'pcb-ic-qfp')!;
      for (const pps of [5, 7, 9, 11, 27]) {
        const evalRes = evaluateAutoShape(qfpDef, 200, 200, { pinsPerSide: pps });
        expect(evalRes.error).toBeUndefined();
        expect(evalRes.paths.length).toBeGreaterThanOrEqual(20);
      }

      // 4. Pin Headers with 1-pin and odd pin counts (1, 3, 5, 11, 23)
      const hdr1Def = PCB_LAYOUT_AUTOSHAPES.find((s) => s.id === 'pcb-conn-header-1x')!;
      if (hdr1Def) {
        for (const p of [1, 3, 5, 11, 23]) {
          const evalRes = evaluateAutoShape(hdr1Def, 60, 200, { pins: p });
          expect(evalRes.error).toBeUndefined();
          expect(evalRes.paths.length).toBeGreaterThanOrEqual(2);
        }
      }
    });

    it('Input Test 4.2: Reverse and Extreme Aspect Ratios (Needle vs Flat vs Micro)', () => {
      const extremeAspects = [
        { w: 5, h: 600, label: 'ultra-tall needle (5x600)' },
        { w: 600, h: 5, label: 'ultra-wide strip (600x5)' },
        { w: 0.5, h: 0.5, label: 'sub-pixel micro (0.5x0.5)' },
        { w: 5000, h: 5000, label: 'massive billboard (5000x5000)' },
        { w: 1, h: 1000, label: '1px wide line (1x1000)' },
        { w: 1000, h: 1, label: '1px tall line (1000x1)' },
      ];

      for (const shape of PCB_LAYOUT_AUTOSHAPES) {
        for (const asp of extremeAspects) {
          const evalRes = evaluateAutoShape(shape, asp.w, asp.h, shape.defaultParams);
          expect(evalRes.error, `Shape ${shape.id} failed at ${asp.label}: ${evalRes.error}`).toBeUndefined();
          expect(evalRes.paths.length).toBeGreaterThanOrEqual(1);

          for (let pIdx = 0; pIdx < evalRes.paths.length; pIdx++) {
            for (let nIdx = 0; nIdx < evalRes.paths[pIdx].nodes.length; nIdx++) {
              const node = evalRes.paths[pIdx].nodes[nIdx];
              expect(
                Number.isFinite(node.x),
                `Shape ${shape.id} at ${asp.label} path ${pIdx} node ${nIdx} x non-finite: ${node.x}`
              ).toBe(true);
              expect(
                Number.isFinite(node.y),
                `Shape ${shape.id} at ${asp.label} path ${pIdx} node ${nIdx} y non-finite: ${node.y}`
              ).toBe(true);
            }
          }
        }
      }
    });

    it('Input Test 4.3: Rapid Preview Click Cycling (100 Cycles per Interactive Shape)', () => {
      const interactiveShapes = PCB_LAYOUT_AUTOSHAPES.filter((s) => s.previewInteractive);
      expect(interactiveShapes.length, 'Must have interactive PCB shapes').toBeGreaterThanOrEqual(15);

      for (const shape of interactiveShapes) {
        let currentParams = { ...shape.defaultParams };

        for (let cycle = 0; cycle < 100; cycle++) {
          const updated = interactAutoShapeInPreview(shape, 100, 100, 200, 150, currentParams);
          expect(updated).toBeDefined();
          expect(typeof updated.params).toBe('object');

          // Evaluate with updated params after each click
          const evalRes = evaluateAutoShape(shape, 200, 150, updated.params);
          expect(evalRes.error, `Shape ${shape.id} crashed on preview click cycle ${cycle}: ${evalRes.error}`).toBeUndefined();
          expect(evalRes.paths.length).toBeGreaterThanOrEqual(1);

          currentParams = updated.params;
        }
      }
    });

    it('Input Test 4.4: High-Frequency Drag Events Stress Harness (500 Random & Extreme Jitter Drags)', () => {
      const shapesWithHandles = PCB_LAYOUT_AUTOSHAPES.filter((s) => {
        const res = evaluateAutoShape(s, 200, 150, s.defaultParams);
        return res.controlPoints && res.controlPoints.length > 0;
      });

      expect(shapesWithHandles.length).toBeGreaterThanOrEqual(10);

      // Perform 500 rapid pseudo-random drag operations
      let totalDrags = 0;
      for (let i = 0; i < 500; i++) {
        const shape = shapesWithHandles[i % shapesWithHandles.length];
        const initial = evaluateAutoShape(shape, 200, 150, shape.defaultParams);
        const cp = initial.controlPoints![i % initial.controlPoints!.length];

        // Generate erratic drag coordinates: negative, large, fractional, zero
        const dragX = (Math.sin(i * 13.7) * 1500) + (i % 2 === 0 ? -300 : 300);
        const dragY = (Math.cos(i * 17.3) * 1500) + (i % 3 === 0 ? -200 : 400);

        let mutatedParams: Record<string, any> = shape.defaultParams;
        expect(() => {
          mutatedParams = dragAutoShapeControlPoint(
            shape,
            cp.id,
            dragX,
            dragY,
            200,
            150,
            shape.defaultParams
          );
        }).not.toThrow();

        totalDrags++;

        // Geometry re-evaluation must remain completely stable
        const reEval = evaluateAutoShape(shape, 200, 150, mutatedParams);
        expect(reEval.error).toBeUndefined();
        expect(reEval.paths.length).toBeGreaterThanOrEqual(1);

        for (const p of reEval.paths) {
          for (const n of p.nodes) {
            expect(Number.isFinite(n.x)).toBe(true);
            expect(Number.isFinite(n.y)).toBe(true);
          }
        }
      }

      expect(totalDrags).toBe(500);
    });
  });

  // =========================================================================
  // SUITE 5: FULL SCENE GRAPH WHITE-BOX VALIDATION
  // =========================================================================
  describe('SUITE 5: Full Scene Graph White-Box Validation', () => {
    it('Validation 5.1: Every starter scene object renders cleanly via renderCanvasObjectToContext with 0 errors', () => {
      const sceneObjects = createPcbStarterSceneObjects();
      expect(sceneObjects.length).toBeGreaterThanOrEqual(50);

      const allDefs = [...DEFAULT_AUTOSHAPES, ...PCB_LAYOUT_AUTOSHAPES];

      for (let i = 0; i < sceneObjects.length; i++) {
        const obj = sceneObjects[i];
        const mockCtx = createMockContext2D();

        expect(() => {
          renderCanvasObjectToContext(mockCtx, obj, allDefs);
        }, `Object '${obj.id}' at index ${i} threw during renderCanvasObjectToContext`).not.toThrow();

        // Verify that operations were recorded
        expect(
          mockCtx.operations.length,
          `Object '${obj.id}' generated 0 canvas context operations`
        ).toBeGreaterThanOrEqual(1);

        // Verify that all coordinate arguments in operations are strictly finite (no NaN / Infinity)
        for (const op of mockCtx.operations) {
          for (let aIdx = 0; aIdx < op.args.length; aIdx++) {
            const arg = op.args[aIdx];
            if (typeof arg === 'number') {
              expect(
                Number.isFinite(arg),
                `Object '${obj.id}' operation ${op.method} arg[${aIdx}] is non-finite: ${arg}`
              ).toBe(true);
            }
          }
        }
      }
    });

    it('Validation 5.2: State variants (hover & active) of all starter scene cards render without degradation', () => {
      const sceneObjects = createPcbStarterSceneObjects();
      const allDefs = [...DEFAULT_AUTOSHAPES, ...PCB_LAYOUT_AUTOSHAPES];

      for (const obj of sceneObjects) {
        if (obj.stateVariants?.hover) {
          const hoverObj = { ...obj, activeState: 'hover' } as CanvasObject;
          const mockCtx = createMockContext2D();
          expect(() => {
            renderCanvasObjectToContext(mockCtx, hoverObj, allDefs);
          }).not.toThrow();
        }

        if (obj.stateVariants?.active) {
          const activeObj = { ...obj, activeState: 'active' } as CanvasObject;
          const mockCtx = createMockContext2D();
          expect(() => {
            renderCanvasObjectToContext(mockCtx, activeObj, allDefs);
          }).not.toThrow();
        }
      }
    });
  });
});

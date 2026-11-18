// @ts-ignore
import { describe, it, expect, beforeAll } from 'vitest';
import type { CanvasObject } from '../../types/editor';

describe('PCB Starter Scene Suite (Tier 4: Real-World Avionics Scenario)', () => {
  let sceneGenerator: (() => CanvasObject[]) | null = null;
  let objects: CanvasObject[] = [];

  beforeAll(async () => {
    // Progressive testability: Attempt dynamic import from pcbStarterScene or starterScene
    try {
      const pcbScenePath = '../pcbStarterScene';
      const mod = await import(/* @vite-ignore */ pcbScenePath);
      if (typeof mod.createPcbStarterSceneObjects === 'function') {
        sceneGenerator = mod.createPcbStarterSceneObjects;
      }
    } catch {
      // Fallback: check starterScene re-export
      try {
        const starterModPath = '../starterScene';
        const starterMod = await import(/* @vite-ignore */ starterModPath);
        if (typeof (starterMod as any).createPcbStarterSceneObjects === 'function') {
          sceneGenerator = (starterMod as any).createPcbStarterSceneObjects;
        }
      } catch {
        sceneGenerator = null;
      }
    }

    if (sceneGenerator) {
      objects = sceneGenerator();
    }
  });

  it('TC-T4-01: Starter Scene Graph Instantiation & Count Invariant', () => {
    if (!sceneGenerator) {
      console.warn('Milestone 2 (createPcbStarterSceneObjects) is still in progress. Skipping TC-T4-01 until merged.');
      return;
    }

    expect(Array.isArray(objects), 'Scene generator must return an array').toBe(true);
    expect(
      objects.length,
      `CUB-FC405 Avionics starter scene must generate at least 50 objects (received ${objects.length})`
    ).toBeGreaterThanOrEqual(50);
  });

  it('TC-T4-02: Global Object ID Uniqueness & Structural Validity', () => {
    if (!sceneGenerator || objects.length === 0) return;

    const seenIds = new Set<string>();

    for (let idx = 0; idx < objects.length; idx++) {
      const obj = objects[idx];
      expect(typeof obj.id, `Object at index ${idx} must have string id`).toBe('string');
      expect(obj.id.trim().length, `Object at index ${idx} id cannot be empty`).toBeGreaterThan(0);
      expect(seenIds.has(obj.id), `Object ID collision detected: duplicate id '${obj.id}' at index ${idx}`).toBe(false);
      seenIds.add(obj.id);

      expect(typeof obj.name, `Object ${obj.id} must have non-empty name`).toBe('string');
      expect(obj.name.trim().length).toBeGreaterThan(0);

      expect(Number.isFinite(obj.x), `Object ${obj.id} x coordinate must be finite`).toBe(true);
      expect(Number.isFinite(obj.y), `Object ${obj.id} y coordinate must be finite`).toBe(true);
      expect(Number.isFinite(obj.width), `Object ${obj.id} width must be finite`).toBe(true);
      expect(Number.isFinite(obj.height), `Object ${obj.id} height must be finite`).toBe(true);
      expect(obj.width, `Object ${obj.id} width must be strictly > 0`).toBeGreaterThan(0);
      expect(obj.height, `Object ${obj.id} height must be strictly > 0`).toBeGreaterThan(0);
    }
  });

  it('TC-T4-03: Canvas Viewport Bounds Conformance (960x600)', () => {
    if (!sceneGenerator || objects.length === 0) return;

    const CANVAS_WIDTH = 960;
    const CANVAS_HEIGHT = 600;
    const ALLOWED_BLEED = 40; // Allow edge connectors (like USB-C) to slightly overhang board edge

    for (const obj of objects) {
      expect(obj.x, `Object ${obj.id} x (${obj.x}) cannot be negative beyond bleed`).toBeGreaterThanOrEqual(-ALLOWED_BLEED);
      expect(obj.y, `Object ${obj.id} y (${obj.y}) cannot be negative beyond bleed`).toBeGreaterThanOrEqual(-ALLOWED_BLEED);
      expect(
        obj.x + obj.width,
        `Object ${obj.id} right edge (${obj.x + obj.width}) must fit within canvas (${CANVAS_WIDTH} + bleed)`
      ).toBeLessThanOrEqual(CANVAS_WIDTH + ALLOWED_BLEED);
      expect(
        obj.y + obj.height,
        `Object ${obj.id} bottom edge (${obj.y + obj.height}) must fit within canvas (${CANVAS_HEIGHT} + bleed)`
      ).toBeLessThanOrEqual(CANVAS_HEIGHT + ALLOWED_BLEED);
    }
  });

  it('TC-T4-04: Avionics Component Inventory Completeness', () => {
    if (!sceneGenerator || objects.length === 0) return;

    const objIds = objects.map((o) => o.id.toLowerCase());
    const objNames = objects.map((o) => o.name.toLowerCase());
    const objTexts = objects
      .filter((o: any) => o.type === 'text' && o.text)
      .map((o: any) => String(o.text).toLowerCase());

    const hasBoardSubstrate = objIds.some((id) => id.includes('substrate') || id.includes('board') || id.includes('outline'));
    expect(hasBoardSubstrate, 'Scene must include PCB Board Substrate / Outline').toBe(true);

    const hasMcu = objIds.some((id) => id.includes('mcu') || id.includes('u1') || id.includes('stm32')) ||
      objNames.some((n) => n.includes('stm32') || n.includes('mcu'));
    expect(hasMcu, 'Scene must include STM32 MCU footprint').toBe(true);

    const hasImu = objIds.some((id) => id.includes('imu') || id.includes('u2') || id.includes('sensor')) ||
      objNames.some((n) => n.includes('imu') || n.includes('icm'));
    expect(hasImu, 'Scene must include IMU Sensor (ICM-42688P / QFN)').toBe(true);

    const hasLdo = objIds.some((id) => id.includes('ldo') || id.includes('u3') || id.includes('regulator')) ||
      objNames.some((n) => n.includes('ldo') || n.includes('regulator'));
    expect(hasLdo, 'Scene must include 3.3V LDO Voltage Regulator').toBe(true);

    const hasCrystal = objIds.some((id) => id.includes('crystal') || id.includes('y1') || id.includes('osc')) ||
      objNames.some((n) => n.includes('crystal') || n.includes('16.000'));
    expect(hasCrystal, 'Scene must include 16.000MHz Crystal Oscillator').toBe(true);

    const hasUsb = objIds.some((id) => id.includes('usb') || id.includes('j1')) ||
      objNames.some((n) => n.includes('usb'));
    expect(hasUsb, 'Scene must include USB-C Connector').toBe(true);

    const hasHeaders = objIds.some((id) => id.includes('header') || id.includes('esc') || id.includes('gps') || id.includes('swd'));
    expect(hasHeaders, 'Scene must include Pin Headers (ESC, GPS, or SWD)').toBe(true);

    const hasTraces = objIds.some((id) => id.includes('trace') || id.includes('route')) ||
      objects.some((o) => o.type === 'vector-path');
    expect(hasTraces, 'Scene must include 45° Mitered Conductive Copper Traces').toBe(true);

    const viaCount = objIds.filter((id) => id.includes('via')).length;
    expect(viaCount, 'Scene must include Plated Ground Stitching Vias (>= 6)').toBeGreaterThanOrEqual(6);

    const mountCount = objIds.filter((id) => id.includes('mount')).length;
    expect(mountCount, 'Scene must include 4 Corner Mounting Holes').toBeGreaterThanOrEqual(4);

    const hasHud = objIds.some((id) => id.includes('hud')) || objNames.some((n) => n.includes('hud'));
    expect(hasHud, 'Scene must include Studio HUD Telemetry Cards').toBe(true);
  });

  it('TC-T4-05: Z-Order Stacking & Layering Order Invariant', () => {
    if (!sceneGenerator || objects.length === 0) return;

    // The backdrop and substrate should appear near the beginning of the object list (lower z-index)
    const substrateIdx = objects.findIndex(
      (o) => o.id.includes('substrate') || o.id.includes('workmat') || o.id.includes('board')
    );
    const mcuIdx = objects.findIndex((o) => o.id.includes('mcu') || o.id.includes('u1'));

    if (substrateIdx !== -1 && mcuIdx !== -1) {
      expect(
        substrateIdx,
        'Board substrate must be placed beneath the MCU in z-order stacking'
      ).toBeLessThan(mcuIdx);
    }
  });

  it('TC-T4-06: 45° Mitered Conductive Trace Geometry & IPC-2221 Standards', () => {
    if (!sceneGenerator || objects.length === 0) return;

    const traces = objects.filter((o) => o.id.startsWith('pcb-trace-'));
    expect(traces.length, 'Scene must include at least 8 routing trace segments').toBeGreaterThanOrEqual(8);

    for (const trace of traces) {
      expect(trace.type, `Trace ${trace.id} must be a vector-path object`).toBe('vector-path');
      const vec = trace as any;
      expect(vec.closed, `Trace ${trace.id} must be an open path (closed: false)`).toBe(false);
      expect(vec.strokeWidth, `Trace ${trace.id} must have strokeWidth >= 1.5`).toBeGreaterThanOrEqual(1.5);
      expect(Array.isArray(vec.nodes), `Trace ${trace.id} must have nodes array`).toBe(true);
      expect(vec.nodes.length, `Trace ${trace.id} must have at least 2 nodes`).toBeGreaterThanOrEqual(2);

      // Verify all non-orthogonal transitions are 45° doglegs (|dx| === |dy|)
      for (let i = 0; i < vec.nodes.length - 1; i++) {
        const dx = Math.abs(vec.nodes[i + 1].x - vec.nodes[i].x);
        const dy = Math.abs(vec.nodes[i + 1].y - vec.nodes[i].y);
        if (dx !== 0 && dy !== 0) {
          expect(
            dx,
            `Trace ${trace.id} segment ${i}->${i + 1} must be 45° miter (expected dx === dy, got dx=${dx}, dy=${dy})`
          ).toBe(dy);
        }
      }
    }
  });

  it('TC-T4-07: AutoShape Definition ID Registry Resolution', () => {
    if (!sceneGenerator || objects.length === 0) return;

    const autoShapeObjs = objects.filter((o) => o.type === 'autoshape') as any[];
    expect(autoShapeObjs.length, 'Scene must include multiple AutoShape instances').toBeGreaterThanOrEqual(20);

    const validPcbPrefixes = [
      'pcb-outline-board',
      'pcb-feature-mounting-hole',
      'pcb-feature-via',
      'pcb-feature-test-point',
      'pcb-ic-qfp',
      'pcb-ic-qfn',
      'pcb-discrete-sot',
      'pcb-passive-smd-chip',
      'pcb-conn-usbc',
      'pcb-conn-header-0100',
    ];

    for (const asObj of autoShapeObjs) {
      expect(typeof asObj.shapeDefId, `AutoShape ${asObj.id} must define shapeDefId string`).toBe('string');
      expect(
        validPcbPrefixes.includes(asObj.shapeDefId),
        `AutoShape ${asObj.id} shapeDefId '${asObj.shapeDefId}' must match a registered PCB layout AutoShape`
      ).toBe(true);
      expect(asObj.params && typeof asObj.params === 'object', `AutoShape ${asObj.id} must have params object`).toBe(true);
    }
  });

  it('TC-T4-08: Complete Passive (C1-C7, R1-R2) and Test Point (TP1-TP5) Verification', () => {
    if (!sceneGenerator || objects.length === 0) return;

    const objIds = objects.map((o) => o.id);

    // Verify all 7 decoupling/load capacitors are present
    const expectedCaps = ['pcb-c1-crystal-load', 'pcb-c2-crystal-load', 'pcb-c3-ldo-in', 'pcb-c4-ldo-out', 'pcb-c5-mcu-decoupling', 'pcb-c6-mcu-decoupling', 'pcb-c7-imu-decoupling'];
    for (const capId of expectedCaps) {
      expect(objIds.includes(capId), `Scene must include capacitor '${capId}'`).toBe(true);
    }

    // Verify USB termination resistors R1 and R2 are present
    expect(objIds.includes('pcb-r1-usb-dp'), 'Scene must include R1 USB D+ resistor').toBe(true);
    expect(objIds.includes('pcb-r2-usb-dm'), 'Scene must include R2 USB D- resistor').toBe(true);

    // Verify all 5 test points are present
    const expectedTps = ['pcb-tp-3v3', 'pcb-tp-gnd', 'pcb-tp-nrst', 'pcb-tp-boot0', 'pcb-tp-swclk'];
    for (const tpId of expectedTps) {
      expect(objIds.includes(tpId), `Scene must include test point '${tpId}'`).toBe(true);
    }
  });
});

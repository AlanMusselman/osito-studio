/**
 * OSITO STUDIO — EMPIRICAL CHALLENGER 2 HARNESS
 * Milestone 1: PCB AutoShapes Geometry & Multi-Subpath Rendering Invariants
 *
 * Focus Areas:
 * 1. Path Closure Invariants (Outer bodies closed vs routing traces / open lines)
 * 2. Multi-Subpath Luminescence & Contrast Rendering (Subpaths 1..N copper pads, pins, drill holes)
 * 3. Extreme Dimension Stress Testing (5x5 px, 2000x2000 px, 0x0 px, extreme aspect ratios)
 * 4. Numerical Stability & Singularity Oracles (NaN, Infinity, Divide-by-Zero checks)
 * 5. Parametric Limits, Control Point Dragging & Preview Toggles
 */

import { PCB_LAYOUT_AUTOSHAPES } from '../src/engine/pcbLayoutAutoshapes.ts';
import {
  evaluateAutoShape,
  dragAutoShapeControlPoint,
  createAutoShapeHelpers,
  DEFAULT_AUTOSHAPES
} from '../src/engine/autoshapes.ts';
import type { AutoShapeDefinition, BezierNode } from '../src/types/editor.ts';

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
  category: 'closure' | 'subpaths' | 'dimensions' | 'params' | 'control_points';
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, category: TestResult['category'], details: string) {
  results.push({
    name,
    passed: condition,
    details,
    category
  });
}

function checkFiniteNodes(nodes: BezierNode[], context: string): { ok: boolean; badField?: string; val?: number } {
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (!Number.isFinite(n.x)) return { ok: false, badField: `nodes[${i}].x`, val: n.x };
    if (!Number.isFinite(n.y)) return { ok: false, badField: `nodes[${i}].y`, val: n.y };
    if (!Number.isFinite(n.cp1x)) return { ok: false, badField: `nodes[${i}].cp1x`, val: n.cp1x };
    if (!Number.isFinite(n.cp1y)) return { ok: false, badField: `nodes[${i}].cp1y`, val: n.cp1y };
    if (!Number.isFinite(n.cp2x)) return { ok: false, badField: `nodes[${i}].cp2x`, val: n.cp2x };
    if (!Number.isFinite(n.cp2y)) return { ok: false, badField: `nodes[${i}].cp2y`, val: n.cp2y };
  }
  return { ok: true };
}

console.log('='.repeat(80));
console.log('  STARTING EMPIRICAL CHALLENGE 2: PCB AUTOSHAPES INVARIANTS HARNESS');
console.log('='.repeat(80));

// ============================================================================
// PART 1: PATH CLOSURE INVARIANTS
// ============================================================================
console.log('\n--- PART 1: PATH CLOSURE INVARIANTS ---');

// 1.1 Outer bodies must have closed: true for Subpath 0
const outerBodyShapes = [
  'pcb-ic-dip', 'pcb-ic-soic', 'pcb-ic-qfp', 'pcb-ic-qfn', 'pcb-discrete-sot', 'pcb-power-to220',
  'pcb-passive-smd-chip', 'pcb-passive-axial', 'pcb-passive-radial-cap', 'pcb-passive-inductor-smd', 'pcb-passive-trimmer',
  'pcb-conn-header-0100', 'pcb-conn-jst', 'pcb-conn-usbc', 'pcb-conn-microusb', 'pcb-conn-terminal-block', 'pcb-conn-power-pads',
  'pcb-feature-smd-pad', 'pcb-feature-circular-pad', 'pcb-feature-th-pad', 'pcb-feature-via', 'pcb-feature-test-point',
  'pcb-feature-fiducial', 'pcb-feature-mounting-hole',
  'pcb-outline-board', 'pcb-outline-slot', 'pcb-outline-mousebites'
];

for (const id of outerBodyShapes) {
  const shape = PCB_LAYOUT_AUTOSHAPES.find(s => s.id === id);
  if (!shape) {
    assert(false, `Outer Body Presence: ${id}`, 'closure', `Shape ${id} not found in PCB_LAYOUT_AUTOSHAPES`);
    continue;
  }
  const evalRes = evaluateAutoShape(shape, 200, 150, shape.defaultParams);
  const sub0 = evalRes.paths[0];
  const isClosed = sub0 && sub0.closed === true;
  assert(
    isClosed,
    `Outer Body Subpath 0 Closure: ${id}`,
    'closure',
    `Expected subpath 0 to have closed: true, got ${sub0 ? sub0.closed : 'no subpath'}`
  );
}

// 1.2 Routing Traces: Examination of path closure
const routingTraceIds = ['pcb-route-trace-straight', 'pcb-route-trace-45', 'pcb-route-bus'];
const routingClosures: Record<string, { totalPaths: number; closedPaths: number; openPaths: number; subpaths: Array<{ index: number; closed: boolean; nodeCount: number }> }> = {};

for (const id of routingTraceIds) {
  const shape = PCB_LAYOUT_AUTOSHAPES.find(s => s.id === id);
  if (!shape) {
    assert(false, `Routing Trace Presence: ${id}`, 'closure', `Shape ${id} not found`);
    continue;
  }
  const evalRes = evaluateAutoShape(shape, 200, 150, shape.defaultParams);
  const subInfo = evalRes.paths.map((p, idx) => ({ index: idx, closed: p.closed, nodeCount: p.nodes.length }));
  const openCount = evalRes.paths.filter(p => !p.closed).length;
  const closedCount = evalRes.paths.filter(p => p.closed).length;
  routingClosures[id] = {
    totalPaths: evalRes.paths.length,
    closedPaths: closedCount,
    openPaths: openCount,
    subpaths: subInfo
  };

  // We empirically record whether they have closed: true or closed: false
  console.log(`[Closure Audit] ${id}: total=${evalRes.paths.length}, closed=${closedCount}, open=${openCount}`);
}

// 1.3 Identification of shapes with intentionally open subpaths (closed: false)
const shapesWithOpenSubpaths: Array<{ id: string; openSubpathIndices: number[]; descriptions: string[] }> = [];

for (const shape of PCB_LAYOUT_AUTOSHAPES) {
  const evalRes = evaluateAutoShape(shape, 200, 150, shape.defaultParams);
  const openIndices = evalRes.paths
    .map((p, idx) => (!p.closed ? idx : -1))
    .filter(idx => idx !== -1);
  if (openIndices.length > 0) {
    shapesWithOpenSubpaths.push({
      id: shape.id,
      openSubpathIndices: openIndices,
      descriptions: openIndices.map(i => `subpath ${i} (nodes=${evalRes.paths[i].nodes.length})`)
    });
  }
}
console.log(`[Open Subpaths Audit] Found ${shapesWithOpenSubpaths.length} shapes with open subpaths:`);
for (const item of shapesWithOpenSubpaths) {
  console.log(`   - ${item.id}: indices [${item.openSubpathIndices.join(', ')}] (${item.descriptions.join(', ')})`);
}

// ============================================================================
// PART 2: MULTI-SUBPATH LUMINESCENCE & CONTRAST RENDERING
// ============================================================================
console.log('\n--- PART 2: MULTI-SUBPATH LUMINESCENCE & CONTRAST RENDERING ---');

for (const shape of PCB_LAYOUT_AUTOSHAPES) {
  const evalRes = evaluateAutoShape(shape, 200, 150, shape.defaultParams);

  // Requirement: Multi-subpath AutoShapes must have at least 2 subpaths for compound components
  const isMultiPathExpected = !['pcb-feature-smd-pad', 'pcb-feature-circular-pad', 'pcb-outline-board'].includes(shape.id);
  if (isMultiPathExpected) {
    assert(
      evalRes.paths.length >= 2,
      `Multi-Subpath Decomposition: ${shape.id}`,
      'subpaths',
      `Expected >= 2 subpaths for compound shape, got ${evalRes.paths.length}`
    );
  }

  // Check subpaths 1..N properties
  let subpathsValid = true;
  let failReason = '';
  for (let i = 1; i < evalRes.paths.length; i++) {
    const sp = evalRes.paths[i];
    if (!sp.nodes || sp.nodes.length === 0) {
      subpathsValid = false;
      failReason = `Subpath ${i} has empty nodes`;
      break;
    }
    const finCheck = checkFiniteNodes(sp.nodes, `${shape.id} subpath ${i}`);
    if (!finCheck.ok) {
      subpathsValid = false;
      failReason = `Subpath ${i} has non-finite coordinate in ${finCheck.badField}: ${finCheck.val}`;
      break;
    }
  }

  assert(
    subpathsValid,
    `Subpaths 1..N Geometry Validity: ${shape.id}`,
    'subpaths',
    failReason || `All ${evalRes.paths.length - 1} inner subpaths verified with finite coordinates`
  );
}

// ============================================================================
// PART 3: STRESS TESTING EDGE CASE DIMENSIONS
// ============================================================================
console.log('\n--- PART 3: STRESS TESTING EDGE CASE DIMENSIONS ---');

const stressDimensions = [
  { w: 5, h: 5, label: 'tiny 5x5' },
  { w: 2000, h: 2000, label: 'large 2000x2000' },
  { w: 0, h: 0, label: 'zero 0x0' },
  { w: 4, h: 4, label: 'min clamped 4x4' },
  { w: 1, h: 1000, label: 'tall slit 1x1000' },
  { w: 1000, h: 1, label: 'wide slit 1000x1' },
  { w: -50, h: -50, label: 'negative -50x-50' },
  { w: 10000, h: 10000, label: 'ultra-large 10000x10000' },
];

let dimensionSingularities = 0;
let dimensionErrors = 0;

for (const shape of PCB_LAYOUT_AUTOSHAPES) {
  for (const dim of stressDimensions) {
    try {
      const res = evaluateAutoShape(shape, dim.w, dim.h, shape.defaultParams);
      if (res.error) {
        dimensionErrors++;
        assert(false, `Dimension Error: ${shape.id} @ ${dim.label}`, 'dimensions', `Threw error: ${res.error}`);
        continue;
      }

      // Check all nodes for NaN or Infinity
      for (let pIdx = 0; pIdx < res.paths.length; pIdx++) {
        const path = res.paths[pIdx];
        const finCheck = checkFiniteNodes(path.nodes, `${shape.id} path ${pIdx} @ ${dim.label}`);
        if (!finCheck.ok) {
          dimensionSingularities++;
          assert(
            false,
            `Singularity: ${shape.id} @ ${dim.label}`,
            'dimensions',
            `Found non-finite node in path ${pIdx} (${finCheck.badField} = ${finCheck.val})`
          );
        }
      }

      // Check control points for NaN or Infinity
      for (const cp of res.controlPoints) {
        if (!Number.isFinite(cp.x) || !Number.isFinite(cp.y)) {
          dimensionSingularities++;
          assert(
            false,
            `CP Singularity: ${shape.id} @ ${dim.label}`,
            'dimensions',
            `Control point ${cp.id} has non-finite coords (${cp.x}, ${cp.y})`
          );
        }
      }
    } catch (err: any) {
      dimensionErrors++;
      assert(false, `Uncaught Exception: ${shape.id} @ ${dim.label}`, 'dimensions', err.message || String(err));
    }
  }
}

assert(
  dimensionSingularities === 0,
  `Dimension Singularity Oracle (NaN/Infinity)`,
  'dimensions',
  `Detected ${dimensionSingularities} non-finite coordinate anomalies across all 30 shapes and 8 stress dimension sets`
);

assert(
  dimensionErrors === 0,
  `Dimension Exception Oracle`,
  'dimensions',
  `Detected ${dimensionErrors} unhandled exceptions across all 30 shapes and 8 stress dimension sets`
);

// ============================================================================
// PART 4: PARAMETRIC BOUNDARY & TYPE CORRUPTION STRESS TESTING
// ============================================================================
console.log('\n--- PART 4: PARAMETRIC BOUNDARY & TYPE CORRUPTION ---');

let paramAnomalies = 0;

for (const shape of PCB_LAYOUT_AUTOSHAPES) {
  // Test each parameter with extreme values
  for (const meta of shape.paramSchema) {
    let testValues: any[] = [];
    if (meta.type === 'number') {
      testValues = [
        meta.min !== undefined ? meta.min : 0,
        meta.max !== undefined ? meta.max : 100,
        (meta.min !== undefined ? meta.min : 0) - 1000,
        (meta.max !== undefined ? meta.max : 100) + 10000,
        0,
        -1,
        0.0001,
        1e6,
        NaN,
        Infinity,
        -Infinity,
        "not_a_number",
        null,
        undefined
      ];
    } else if (meta.type === 'boolean') {
      testValues = [true, false, null, undefined, "true", 1, 0];
    } else if (meta.type === 'string') {
      testValues = ['', '   ', 'X'.repeat(500), null, undefined, 12345];
    }

    for (const val of testValues) {
      const testParams = { ...shape.defaultParams, [meta.key]: val };
      try {
        const res = evaluateAutoShape(shape, 200, 150, testParams);
        if (res.error) {
          paramAnomalies++;
          continue;
        }
        for (const p of res.paths) {
          const fin = checkFiniteNodes(p.nodes, `${shape.id} param ${meta.key}=${val}`);
          if (!fin.ok) {
            paramAnomalies++;
            assert(false, `Param Singularity: ${shape.id} [${meta.key}=${val}]`, 'params', `Non-finite in ${fin.badField}`);
          }
        }
      } catch (err: any) {
        paramAnomalies++;
        assert(false, `Param Crash: ${shape.id} [${meta.key}=${val}]`, 'params', err.message || String(err));
      }
    }
  }
}

assert(
  paramAnomalies === 0,
  `Parametric Robustness Oracle`,
  'params',
  `Evaluated all parameter extreme inputs across 30 shapes (${paramAnomalies} anomalies)`
);

// ============================================================================
// PART 5: CONTROL POINT DRAGGING ORACLE
// ============================================================================
console.log('\n--- PART 5: CONTROL POINT DRAGGING ORACLE ---');

let dragAnomalies = 0;
const dragTestCoordinates = [
  { x: 0, y: 0 },
  { x: 100, y: 75 },
  { x: 200, y: 150 },
  { x: -50, y: -50 },
  { x: 500, y: 500 },
  { x: NaN, y: NaN },
  { x: Infinity, y: -Infinity }
];

for (const shape of PCB_LAYOUT_AUTOSHAPES) {
  const initialRes = evaluateAutoShape(shape, 200, 150, shape.defaultParams);
  for (const cp of initialRes.controlPoints) {
    for (const pt of dragTestCoordinates) {
      try {
        const updatedParams = dragAutoShapeControlPoint(shape, cp.id, pt.x, pt.y, 200, 150, shape.defaultParams);
        if (!updatedParams || typeof updatedParams !== 'object') {
          dragAnomalies++;
          continue;
        }
        // Re-evaluate with dragged params
        const reEval = evaluateAutoShape(shape, 200, 150, updatedParams);
        if (reEval.error) {
          dragAnomalies++;
          continue;
        }
        for (const p of reEval.paths) {
          const fin = checkFiniteNodes(p.nodes, `${shape.id} dragged CP ${cp.id}`);
          if (!fin.ok) {
            dragAnomalies++;
          }
        }
      } catch {
        dragAnomalies++;
      }
    }
  }
}

assert(
  dragAnomalies === 0,
  `Control Point Dragging Oracle`,
  'control_points',
  `Tested all control points across 30 shapes with extreme drag coordinates (${dragAnomalies} anomalies)`
);

// ============================================================================
// SUMMARY & STATISTICS
// ============================================================================
console.log('\n' + '='.repeat(80));
const total = results.length;
const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;
console.log(`  EMPIRICAL CHALLENGE 2 AUDIT COMPLETE: ${passed} / ${total} CHECKS PASSED (${failed} FAILED)`);
console.log('='.repeat(80));

// Output detailed report JSON for verification report
const reportData = {
  totalChecks: total,
  passedChecks: passed,
  failedChecks: failed,
  routingClosures,
  shapesWithOpenSubpaths,
  categories: {
    closure: results.filter(r => r.category === 'closure'),
    subpaths: results.filter(r => r.category === 'subpaths'),
    dimensions: results.filter(r => r.category === 'dimensions'),
    params: results.filter(r => r.category === 'params'),
    control_points: results.filter(r => r.category === 'control_points'),
  }
};

import fs from 'node:fs';
fs.writeFileSync('scripts/empirical_challenge_m1_2_report.json', JSON.stringify(reportData, null, 2));
console.log('Detailed test data written to scripts/empirical_challenge_m1_2_report.json');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

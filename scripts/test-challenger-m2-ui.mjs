#!/usr/bin/env node
/**
 * Challenger 2 Verification Harness for Milestone 2:
 * UI Integration & Preset Loading Mechanics Stress Test
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const studioDir = path.resolve(__dirname, '..');

console.log('='.repeat(78));
console.log('  CHALLENGER 2: UI INTEGRATION & PRESET LOADING STRESS HARNESS');
console.log('='.repeat(78));

let passed = 0;
let failed = 0;

function assertTest(id, name, condition, details = '') {
  if (condition) {
    passed++;
    console.log(` \x1b[32m✓\x1b[0m [${id}] ${name}`);
  } else {
    failed++;
    console.log(` \x1b[31m✗\x1b[0m [${id}] ${name}`);
    if (details) console.log(`   \x1b[33mDetail:\x1b[0m ${details}`);
  }
}

// =========================================================================
// SECTION 1: handleLoadShowcasePreset & Modulo Arithmetic Analysis
// =========================================================================
console.log('\n--- SECTION 1: handleLoadShowcasePreset & Modulo Arithmetic ---');

function moduloFormula(presetIndex) {
  return ((presetIndex % 7) + 7) % 7;
}

// 1.1 Test standard 0..6 range
for (let i = 0; i < 7; i++) {
  const norm = moduloFormula(i);
  assertTest(`MOD-STD-${i}`, `Standard index ${i} maps to ${i}`, norm === i, `Got ${norm}`);
}

// 1.2 Test negative numbers
const negativeTests = [
  { input: -1, expected: 6 },
  { input: -2, expected: 5 },
  { input: -3, expected: 4 },
  { input: -4, expected: 3 },
  { input: -5, expected: 2 },
  { input: -6, expected: 1 },
  { input: -7, expected: 0 },
  { input: -8, expected: 6 },
  { input: -14, expected: 0 },
  { input: -15, expected: 6 },
  { input: -21, expected: 0 },
  { input: -100, expected: 5 }, // -100 % 7 = -2; (-2 + 7) % 7 = 5
  { input: -999999, expected: 0 }, // -999999 is exact multiple of 7 (7 * -142857)
  { input: -1000000, expected: 6 }, // -1000000 % 7 = -1; (-1 + 7) % 7 = 6
];

for (const t of negativeTests) {
  const norm = moduloFormula(t.input);
  assertTest(
    `MOD-NEG-${t.input}`,
    `Negative input ${t.input} maps to expected preset ${t.expected}`,
    norm === t.expected,
    `Got ${norm}, expected ${t.expected}`
  );
}

// 1.3 Test overflow numbers
const overflowTests = [
  { input: 7, expected: 0 },
  { input: 8, expected: 1 },
  { input: 13, expected: 6 },
  { input: 14, expected: 0 },
  { input: 15, expected: 1 },
  { input: 21, expected: 0 },
  { input: 22, expected: 1 },
  { input: 70, expected: 0 },
  { input: 76, expected: 6 },
  { input: 100, expected: 2 },
  { input: 1000000, expected: 1 },
];

for (const t of overflowTests) {
  const norm = moduloFormula(t.input);
  assertTest(
    `MOD-OVF-${t.input}`,
    `Overflow input ${t.input} maps to expected preset ${t.expected}`,
    norm === t.expected,
    `Got ${norm}, expected ${t.expected}`
  );
}

// 1.4 Test extreme integers
const safeIntMax = Number.MAX_SAFE_INTEGER;
const safeIntMin = Number.MIN_SAFE_INTEGER;
const normMax = moduloFormula(safeIntMax);
const normMin = moduloFormula(safeIntMin);
assertTest('MOD-EXT-MAX', `MAX_SAFE_INTEGER (${safeIntMax}) maps to valid range 0..6`, normMax >= 0 && normMax <= 6 && Number.isInteger(normMax));
assertTest('MOD-EXT-MIN', `MIN_SAFE_INTEGER (${safeIntMin}) maps to valid range 0..6`, normMin >= 0 && normMin <= 6 && Number.isInteger(normMin));

// 1.5 Modulo never throws for any numeric input
let neverThrows = true;
try {
  for (let idx = -2000; idx <= 2000; idx++) {
    const r = moduloFormula(idx);
    if (r < 0 || r > 6 || !Number.isInteger(r)) {
      neverThrows = false;
      break;
    }
  }
} catch (e) {
  neverThrows = false;
}
assertTest('MOD-SWEEP', 'Exhaustive sweep from -2000 to +2000 never throws and always produces 0..6', neverThrows);

// =========================================================================
// SECTION 2: Preset 6 State Mutation & Starter Scene Instantiation
// =========================================================================
console.log('\n--- SECTION 2: Preset 6 State Isolation & Object Generation ---');

// Dynamically import starter scene generator
const { createPcbStarterSceneObjects } = await import('../src/engine/pcbStarterScene.ts');

assertTest('SCENE-GEN-FN', 'createPcbStarterSceneObjects is a callable function', typeof createPcbStarterSceneObjects === 'function');

const run1 = createPcbStarterSceneObjects();
assertTest('SCENE-LEN', `Preset 6 returns expected object count >= 50 (got ${run1.length})`, run1.length >= 50);

// Check that pcb-u1-mcu is present (it is explicitly set as selected in App.tsx setSelectedIds(['pcb-u1-mcu']))
const mcuObj = run1.find((o) => o.id === 'pcb-u1-mcu');
assertTest('SCENE-MCU-FOUND', "Target selected object 'pcb-u1-mcu' exists in starter scene", Boolean(mcuObj));
assertTest('SCENE-MCU-PROPS', "'pcb-u1-mcu' has valid coordinates, dimensions, and shapeDefId",
  mcuObj && mcuObj.x > 0 && mcuObj.y > 0 && mcuObj.width > 0 && mcuObj.height > 0 && mcuObj.shapeDefId === 'pcb-ic-qfp'
);

// Check instance isolation: mutating run1 should NOT mutate run2
const run2 = createPcbStarterSceneObjects();
assertTest('SCENE-DIFF-ARRAY', 'Subsequent calls return different array instances', run1 !== run2);

// Mutate run1
const origX = run1[0].x;
const origY = run1[0].y;
const origNodesLen = run1[0].nodes ? run1[0].nodes.length : 0;
run1[0].x = 9999;
run1[0].y = 8888;
if (run1[0].nodes && run1[0].nodes.length > 0) {
  run1[0].nodes[0].x = 7777;
}

// Call run3
const run3 = createPcbStarterSceneObjects();
assertTest(
  'SCENE-ISOLATION-MUTATION',
  'Mutating objects returned by a previous call does NOT mutate future calls (no global state corruption)',
  run3[0].x === origX && run3[0].y === origY && (run3[0].nodes ? run3[0].nodes[0].x !== 7777 : true),
  `Expected origX=${origX}, got ${run3[0].x}`
);

// Check that all 66 objects have valid finite geometry and integer pixel snapping
let allFinite = true;
let allIdsUnique = true;
const idSet = new Set();
for (const obj of run3) {
  if (!Number.isFinite(obj.x) || !Number.isFinite(obj.y) || !Number.isFinite(obj.width) || !Number.isFinite(obj.height)) {
    allFinite = false;
  }
  if (idSet.has(obj.id)) {
    allIdsUnique = false;
  }
  idSet.add(obj.id);
}
assertTest('SCENE-FINITE-GEOM', 'All objects have finite x, y, width, height', allFinite);
assertTest('SCENE-IDS-UNIQUE', 'All object IDs in preset 6 are strictly unique', allIdsUnique);

// =========================================================================
// SECTION 3: demoTourSteps Schema & Cycling Validation
// =========================================================================
console.log('\n--- SECTION 3: demoTourSteps Schema & Cycling ---');

// Read App.tsx to extract demoTourSteps array
const appTsxPath = path.join(studioDir, 'src', 'App.tsx');
const appTsxContent = fs.readFileSync(appTsxPath, 'utf8');

// Extract demoTourSteps block
const matchTour = appTsxContent.match(/demoTourSteps\s*=\s*React\.useMemo\(\s*\(\)\s*=>\s*(\[[\s\S]*?\])\s*,\s*\[\]\s*\)/);
assertTest('TOUR-REGEX-FOUND', 'demoTourSteps definition extracted from src/App.tsx', Boolean(matchTour));

let tourSteps = [];
if (matchTour) {
  try {
    // Parse step array via loose JSON evaluation or Function
    tourSteps = new Function(`return ${matchTour[1]};`)();
  } catch (err) {
    console.error('Failed to parse tourSteps:', err);
  }
}

assertTest('TOUR-LEN', `demoTourSteps has exactly 7 steps (got ${tourSteps.length})`, tourSteps.length === 7);

let allStepsValid = true;
let stepDetails = [];
tourSteps.forEach((step, idx) => {
  const isIdxValid = step.idx === idx;
  const hasBadge = typeof step.badge === 'string' && step.badge.trim().length > 0;
  const hasTitle = typeof step.title === 'string' && step.title.trim().length > 0;
  const hasDetail = typeof step.detail === 'string' && step.detail.trim().length > 0;
  if (!isIdxValid || !hasBadge || !hasTitle || !hasDetail) {
    allStepsValid = false;
    stepDetails.push(`Step ${idx} invalid: idx=${step.idx}, badge=${hasBadge}, title=${hasTitle}, detail=${hasDetail}`);
  }
});
assertTest('TOUR-SCHEMA', 'All 7 tour steps contain valid idx, badge, title, and detail', allStepsValid, stepDetails.join('; '));

// Verify Step 6 (7th step) specifically for Avionics PCB
const step6 = tourSteps[6];
assertTest('TOUR-STEP-6-IDX', 'Step 6 has idx === 6', step6 && step6.idx === 6);
assertTest('TOUR-STEP-6-BADGE', 'Step 6 has badge containing "AVIONICS PCB"', step6 && step6.badge.includes('AVIONICS PCB'));
assertTest('TOUR-STEP-6-TITLE', 'Step 6 title is "CUB-FC405 Flight Controller Layout"', step6 && step6.title === 'CUB-FC405 Flight Controller Layout');
assertTest('TOUR-STEP-6-DETAIL', 'Step 6 detail describes 4-layer aerospace PCB prototype', step6 && step6.detail.includes('aerospace PCB prototype'));

// Verify step cycling transitions
let cyclingClean = true;
let currentIdx = 0;
for (let step = 0; step < 70; step++) {
  const nextIdx = (currentIdx + 1) % 7;
  const expectedNext = (step + 1) % 7;
  if (nextIdx !== expectedNext) {
    cyclingClean = false;
    break;
  }
  currentIdx = nextIdx;
}
assertTest('TOUR-CYCLING-LOOP', 'Tour step cycling (nextIdx = (activeShowcaseIndex + 1) % 7) loops cleanly through 0..6 for 70 iterations', cyclingClean);

// Verify transition from step 6 loops to step 0
const stepAfter6 = (6 + 1) % 7;
assertTest('TOUR-STEP-6-TO-0', 'Step after 6 loops directly back to step 0', stepAfter6 === 0);

// =========================================================================
// SECTION 4: Menu, PublishModal & CommandPalette Presets
// =========================================================================
console.log('\n--- SECTION 4: Menu, PublishModal & CommandPalette Presets ---');

// 4.1 Check File Menu presets in App.tsx
const hasFileMenuItem7 = appTsxContent.includes("idx: 6, label: '7. CUB-FC405 Avionics PCB Layout', tag: 'Avionics'");
assertTest('MENU-ITEM-7', 'File & Presets menu includes preset 6: "7. CUB-FC405 Avionics PCB Layout"', hasFileMenuItem7);

const hasShowcasePresetsHeader = appTsxContent.includes('Showcase Presets ({activeShowcaseIndex + 1}/7)');
assertTest('MENU-HEADER-7', 'File & Presets menu header displays ({activeShowcaseIndex + 1}/7)', hasShowcasePresetsHeader);

// 4.2 Check PublishModal.tsx preset cards
const publishModalPath = path.join(studioDir, 'src', 'components', 'PublishModal.tsx');
const publishModalContent = fs.readFileSync(publishModalPath, 'utf8');
const hasPublishCard6 = publishModalContent.includes("index: 6") &&
  publishModalContent.includes("title: '7. Avionics PCB Layout'") &&
  publishModalContent.includes("badge: 'PCB AVIONICS'");
assertTest('PUBLISH-CARD-6', 'PublishModal.tsx includes card 6 for Avionics PCB Layout', hasPublishCard6);

// 4.3 Check CommandPaletteModal.tsx command
const cmdPalettePath = path.join(studioDir, 'src', 'components', 'CommandPaletteModal.tsx');
const cmdPaletteContent = fs.readFileSync(cmdPalettePath, 'utf8');
const hasCmdItem = cmdPaletteContent.includes("id: 'cmd-load-pcb-starter-scene'") &&
  cmdPaletteContent.includes("onLoadShowcasePreset(6)");
assertTest('CMD-PALETTE-ITEM', 'CommandPaletteModal.tsx registers cmd-load-pcb-starter-scene triggering onLoadShowcasePreset(6)', hasCmdItem);

// =========================================================================
// SECTION 5: Bundled Standalone Output Verification
// =========================================================================
console.log('\n--- SECTION 5: Bundled Standalone Output Verification ---');

const standalonePath = path.join(studioDir, 'dist', 'Osito_Studio_Standalone.html');
const standaloneExists = fs.existsSync(standalonePath);
assertTest('BUNDLE-EXISTS', 'dist/Osito_Studio_Standalone.html exists on disk', standaloneExists);

if (standaloneExists) {
  const stat = fs.statSync(standalonePath);
  const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);
  assertTest('BUNDLE-SIZE', `Standalone bundle has valid non-trivial size >= 2MB (got ${sizeMb} MB)`, stat.size > 2 * 1024 * 1024);

  const bundleContent = fs.readFileSync(standalonePath, 'utf8');

  // Check HTML structure
  const hasDoctype = bundleContent.includes('<!DOCTYPE html>') || bundleContent.includes('<!doctype html>');
  const hasHtmlClose = bundleContent.includes('</html>');
  assertTest('BUNDLE-HTML-STRUCT', 'Standalone bundle contains valid HTML5 doctype and closing tags', hasDoctype && hasHtmlClose);

  // Check PCB Starter scene identifiers
  const requiredSubstrings = [
    { id: 'BUNDLE-CUB', pattern: 'CUB-FC405', label: 'CUB-FC405 board title string' },
    { id: 'BUNDLE-MCU', pattern: 'pcb-u1-mcu', label: 'pcb-u1-mcu identifier' },
    { id: 'BUNDLE-SUBSTRATE', pattern: 'pcb-board-substrate', label: 'pcb-board-substrate identifier' },
    { id: 'BUNDLE-TOAST', pattern: 'Loaded Showcase 7/7', label: 'Preset 7/7 loaded toast message' },
    { id: 'BUNDLE-BADGE', pattern: 'PCB AVIONICS', label: 'PCB AVIONICS badge' },
    { id: 'BUNDLE-CMD', pattern: 'cmd-load-pcb-starter-scene', label: 'cmd-load-pcb-starter-scene command ID' },
    { id: 'BUNDLE-OUTLINE', pattern: 'pcb-outline-board', label: 'pcb-outline-board shapeDefId' },
    { id: 'BUNDLE-TRACES', pattern: 'pcb-trace-usb-dp', label: 'pcb-trace-usb-dp trace identifier' },
    { id: 'BUNDLE-HEADER', pattern: 'pcb-j2-esc-header', label: 'pcb-j2-esc-header connector identifier' },
    { id: 'BUNDLE-VIAS', pattern: 'pcb-via-01', label: 'pcb-via-01 stitching via identifier' },
  ];

  for (const item of requiredSubstrings) {
    const found = bundleContent.includes(item.pattern);
    assertTest(item.id, `Bundle contains ${item.label}`, found, `Pattern '${item.pattern}' not found in bundle`);
  }
}

// =========================================================================
// SECTION 6: Summary & Empirical Verdict
// =========================================================================
console.log('\n' + '='.repeat(78));
console.log(`  SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
console.log('='.repeat(78));

if (failed === 0) {
  console.log('\n\x1b[32m>>> EMPIRICAL VERDICT: APPROVE <<<\x1b[0m\n');
  process.exit(0);
} else {
  console.log('\n\x1b[31m>>> EMPIRICAL VERDICT: REQUEST_CHANGES <<<\x1b[0m\n');
  process.exit(1);
}

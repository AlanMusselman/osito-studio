#!/usr/bin/env node
/**
 * Standalone PCB AutoShapes & Starter Scene Verification Runner
 * Validates Tiers 1-4: Geometry invariants, parameter schemas, control points, and starter scene graph.
 *
 * Usage:
 *   node scripts/test-pcb-autoshapes.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const pcbShapesPath = path.join(rootDir, 'src', 'engine', 'pcbLayoutAutoshapes.ts');
const pcbStarterScenePath = path.join(rootDir, 'src', 'engine', 'pcbStarterScene.ts');

console.log('='.repeat(72));
console.log('  OSITO STUDIO — PCB AUTOSHAPES & SCENE VERIFICATION RUNNER');
console.log('='.repeat(72));

let totalPassed = 0;
let totalFailed = 0;

function report(tier, testId, description, passed, detail = '') {
  if (passed) {
    totalPassed++;
    console.log(` \x1b[32m✓\x1b[0m [${tier}] ${testId}: ${description}`);
  } else {
    totalFailed++;
    console.log(` \x1b[31m✗\x1b[0m [${tier}] ${testId}: ${description}`);
    if (detail) console.log(`   \x1b[33mError detail:\x1b[0m ${detail}`);
  }
}

// 1. Check Source Files
console.log('\n[Phase 1: File Presence & Structural Integrity]');
const hasPcbShapes = fs.existsSync(pcbShapesPath);
report('Files', 'FILE-01', 'src/engine/pcbLayoutAutoshapes.ts exists', hasPcbShapes);

const hasPcbStarterScene = fs.existsSync(pcbStarterScenePath);
report(
  'Files',
  'FILE-02',
  'src/engine/pcbStarterScene.ts exists (or starterScene.ts export)',
  hasPcbStarterScene || fs.existsSync(path.join(rootDir, 'src', 'engine', 'starterScene.ts'))
);

// 2. Execute Automated Vitest Suite
console.log('\n[Phase 2: Automated Vitest Test Suite Execution (Tiers 1-4)]');
try {
  const vitestOutput = execSync('npx vitest run', {
    cwd: rootDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });

  // Strip ANSI color/formatting escape codes for reliable regex matching
  const cleanOutput = vitestOutput.replace(/\x1b\[[0-9;]*m/g, '');
  const lines = cleanOutput.split('\n');
  const summaryLine = lines.find((l) => l.includes('Test Files') || l.includes('Tests')) || '';
  report('Vitest', 'VITEST-01', 'Vitest suite executed with code 0', true, summaryLine.trim());

  const passedTestsMatch = cleanOutput.match(/Tests\s+(\d+)\s+passed/);
  const passedCount = passedTestsMatch ? parseInt(passedTestsMatch[1], 10) : 0;
  report('Vitest', 'VITEST-02', `All Vitest unit & geometry tests passing (${passedCount} tests)`, passedCount >= 10);
} catch (err) {
  report('Vitest', 'VITEST-01', 'Vitest suite execution', false, err.message || String(err));
}

// 3. Static TypeScript Compilation Check
console.log('\n[Phase 3: Static Type Hygiene & Diagnostics (tsc --noEmit)]');
try {
  execSync('npx tsc --noEmit', {
    cwd: rootDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });
  report('TypeScript', 'TSC-01', 'TypeScript compilation check (0 errors)', true);
} catch (err) {
  report('TypeScript', 'TSC-01', 'TypeScript compilation check (0 errors)', false, err.stdout || err.message);
}

// 4. Summary & Exit Code
console.log('\n' + '='.repeat(72));
console.log(`  VERIFICATION COMPLETE: ${totalPassed} PASSED, ${totalFailed} FAILED`);
console.log('='.repeat(72));

if (totalFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

# Test Infrastructure & Verification Architecture: Osito Studio PCB Layout Suite

## 1. Test Philosophy & Architecture Principles

The testing infrastructure for Osito Studio's PCB Layout AutoShapes Suite and CUB-FC405 Avionics Starter Scene is built on an **opaque-box, contract-driven verification model**. Tests interact strictly with public interfaces, procedural geometry outputs, and scene graph data structures rather than internal implementation details.

### Core Testing Invariants
1. **Geometric Integrity & Finite Coordinates**:
   - Every evaluated Bezier node must have finite coordinates (`Number.isFinite(x) && !Number.isNaN(x)`).
   - Control points (`cp1x, cp1y, cp2x, cp2y`) must be strictly finite numbers; `NaN`, `null`, and `undefined` are instant test failures.
   - Bounding geometry must be strictly positive (`width > 0 && height > 0`). Zero-area or degenerate shapes are forbidden.
2. **Subpath & Path Closure Semantics**:
   - Closed contours (IC bodies, SMD pads, through-hole annular rings, drill holes, board outlines) must explicitly set `closed: true`.
   - Open routes (conductive trace centerlines, 45° doglegs, bus routes) must explicitly set `closed: false` and declare a visible stroke width (`strokeWidth >= 1`).
   - In multi-subpath AutoShapes, Subpath 0 is the primary container/body, and Subpaths 1..N represent copper pads, drill holes, and internal keepout features.
3. **Interactive Determinism**:
   - Interactive control points (`getControlPoints`) must return non-empty handle arrays with unique IDs and finite local coordinates.
   - Dragging a control handle (`dragAutoShapeControlPoint`) must return clamped, valid parameter values within defined schema boundaries.
   - Re-evaluating the shape with mutated parameters must produce updated geometry without throwing runtime exceptions.
4. **Scene Graph Soundness**:
   - The starter scene graph must contain >= 50 valid `CanvasObject` instances representing a realistic, uncorrupted flight controller PCB.
   - Every object in the scene must have a globally unique `id`, valid bounding box (`w > 0, h > 0`), valid z-index, and valid type.
   - No object coordinates may escape the active canvas layout bounds (`960x600`).
5. **Zero Facade Policy**:
   - No mock assertions that trivially return true.
   - All tests exercise live mathematical geometry calculations in the sandboxed AutoShapes evaluation engine.
6. **Progressive Testability**:
   - Tests are structured to allow independent execution even when milestones complete asynchronously, dynamically loading shape definitions or utilizing contract fallbacks while verifying full compliance once modules are integrated.

---

## 2. Feature Inventory Coverage Matrix

| Feature ID | Feature Name | Description | Test Tier | Test Case ID | Target File | Verification Invariant |
|---|---|---|---|---|---|---|
| F-01 | DIP IC Package | Dual In-line Through-Hole IC (4–40 pins, row spacing, Pin 1 notch) | Tier 1, 2, 3 | `TC-PCB-DIP` | `pcbLayoutAutoshapes.test.ts` | Pins 4..40, Pin 1 square pad, drill holes, notch |
| F-02 | SOIC IC Package | Small Outline IC (8–28 pins, gull-wing SMT pads, 1.27mm pitch) | Tier 1, 2, 3 | `TC-PCB-SOIC` | `pcbLayoutAutoshapes.test.ts` | Pins 8..28, gull-wing pads, body bevel |
| F-03 | QFP IC Package | Quad Flat Package (32–100 pins, 4-sided gull-wing SMT, Pin 1 index) | Tier 1, 2, 3 | `TC-PCB-QFP` | `pcbLayoutAutoshapes.test.ts` | Pins 32..100, 4-sided pads, Pin 1 dot/triangle |
| F-04 | QFN IC Package | Quad Flat No-leads (16–64 pins, exposed ground pad, thermal vias) | Tier 1, 2, 3 | `TC-PCB-QFN` | `pcbLayoutAutoshapes.test.ts` | Central EPAD, thermal via array, edge pads |
| F-05 | SOT / TO Packages | SOT-23 / SOT-223 regulator & TO-220 power package with tab heatsink | Tier 1, 2, 3 | `TC-PCB-SOT` | `pcbLayoutAutoshapes.test.ts` | Thermal tab ratio, lead spacing, heat sink |
| F-06 | SMT Chip Passives | 0402/0603/0805/1206/2512 Resistors/Capacitors with solder pads | Tier 1, 2, 3 | `TC-PCB-SMD-PASSIVE` | `pcbLayoutAutoshapes.test.ts` | Dual end-cap pads, terminal gap, silk brackets |
| F-07 | Leaded Axial Passive | Axial leaded resistor/diode with adjustable lead span & body length | Tier 1, 2, 3 | `TC-PCB-AXIAL` | `pcbLayoutAutoshapes.test.ts` | Lead span, annular pads, drill holes |
| F-08 | Radial Electrolytic Can | Radial electrolytic capacitor with polarity stripe and leads | Tier 1, 2, 3 | `TC-PCB-RADIAL` | `pcbLayoutAutoshapes.test.ts` | Polarity stripe, annular leads, can circle |
| F-09 | Shielded Inductor | Power inductor / choke footprint with dual high-current pads | Tier 1, 2, 3 | `TC-PCB-INDUCTOR` | `pcbLayoutAutoshapes.test.ts` | High-current solder pads, ferrite body |
| F-10 | 0.1" Pin Headers | 2.54mm pitch 1xN & 2xN pin headers with square Pin 1 DRC pad | Tier 1, 2, 3 | `TC-PCB-HEADER` | `pcbLayoutAutoshapes.test.ts` | Square Pin 1 pad, round Pins 2..N, 1xN/2xN |
| F-11 | JST Wire Connectors | JST SH (1.0mm), GH (1.25mm), and XH (2.5mm) keyed wire-to-board | Tier 1, 2, 3 | `TC-PCB-JST` | `pcbLayoutAutoshapes.test.ts` | Shroud outline, keyed notch, SMT/THT pads |
| F-12 | USB Connectors | USB Type-C (16/24-pin SMT with 4 ground tabs) & Micro-USB | Tier 1, 2, 3 | `TC-PCB-USB` | `pcbLayoutAutoshapes.test.ts` | Shield anchor tabs, signal pins, tongue |
| F-13 | Terminal & Battery Pads | Screw terminal blocks & high-current XT30/XT60 battery pads | Tier 1, 2, 3 | `TC-PCB-TERMINAL` | `pcbLayoutAutoshapes.test.ts` | Heavy copper pads, polarity +/- markings |
| F-14 | Solder Pads | SMD rectangular, SMD circular, and through-hole annular ring pads | Tier 1, 2, 3 | `TC-PCB-PADS` | `pcbLayoutAutoshapes.test.ts` | Annular copper ring, drill hole, mask clearance |
| F-15 | Plated Vias | Plated through-hole vias & multi-via thermal stitching grid | Tier 1, 2, 3 | `TC-PCB-VIAS` | `pcbLayoutAutoshapes.test.ts` | Drill diameter, pad diameter, stitching array |
| F-16 | Test Points | Surface probe test points (circular, square, probe hook loop) | Tier 1, 2, 3 | `TC-PCB-TP` | `pcbLayoutAutoshapes.test.ts` | Probe ring, silkscreen crosshair, label |
| F-17 | Conductive Traces | Straight conductive copper traces with parametric track width | Tier 1, 2, 3 | `TC-PCB-TRACE` | `pcbLayoutAutoshapes.test.ts` | Track width 1..24px, terminal fillets |
| F-18 | 45° Mitered Traces | IPC-2221 45-degree mitered trace corner bends (acid-trap prevention) | Tier 1, 2, 3 | `TC-PCB-TRACE-45` | `pcbLayoutAutoshapes.test.ts` | 45-degree chamfer dogleg, open path |
| F-19 | Multi-Track Bus | Parallel differential / data bus routes with uniform clearance | Tier 1, 2, 3 | `TC-PCB-BUS` | `pcbLayoutAutoshapes.test.ts` | Multi-track count 2..8, track gap clearance |
| F-20 | Fiducial Markers | Optical pick-and-place alignment targets with keepout copper ring | Tier 1, 2, 3 | `TC-PCB-FIDUCIAL` | `pcbLayoutAutoshapes.test.ts` | Solid copper dot, annular mask keepout ring |
| F-21 | Mounting Holes | M2, M2.5, M3, M4 chassis mounting holes with plated annular washer | Tier 1, 2, 3 | `TC-PCB-MOUNT` | `pcbLayoutAutoshapes.test.ts` | Inner drill hole, outer plated grounding ring |
| F-22 | Board Outlines | FR4 PCB substrate outline with interactive corner radius & tags | Tier 1, 2, 3 | `TC-PCB-OUTLINE` | `pcbLayoutAutoshapes.test.ts` | Rounded corners 0..40px, keepout border |
| F-23 | Isolation Slots & Tabs | High-voltage creepage milling slots & breakaway panel mouse-bites | Tier 1, 2, 3 | `TC-PCB-SLOTS` | `pcbLayoutAutoshapes.test.ts` | Milling slot path, perforation drill holes |
| F-24 | Category Registration | Add 'PCB Layout' to `AutoShapeCategory` & `AUTOSHAPE_GROUP_ORDER` | Tier 1 | `TC-REG-CATEGORY` | `pcbLayoutAutoshapes.test.ts` | Category union membership and display order |
| F-25 | UI Panel Registration | Add 'PCB Layout' in `LayersAndHistoryPanel.tsx` `SHORT_GROUP_LABELS` | Tier 1 | `TC-REG-PANEL` | `pcbLayoutAutoshapes.test.ts` | Label mapping in UI group panels |
| F-26 | Engine Plumbing | Import and spread `PCB_LAYOUT_AUTOSHAPES` in `autoshapes.ts` | Tier 1 | `TC-REG-ENGINE` | `pcbLayoutAutoshapes.test.ts` | Presence in `DEFAULT_AUTOSHAPES` |
| F-27 | CUB-FC405 Prototype | `createPcbStarterSceneObjects()` generates >= 50 objects | Tier 4 | `TC-SCN-INSTANTIATE` | `pcbStarterScene.test.ts` | >= 50 objects, valid IDs, zero NaN coordinates |
| F-28 | Starter Re-export | Re-export `createPcbStarterSceneObjects` in `starterScene.ts` | Tier 4 | `TC-SCN-EXPORT` | `pcbStarterScene.test.ts` | Clean export from starterScene module |
| F-29 | UI Preset Integration | Preset 6 in `App.tsx`, Demo Tour Step 7, File & Presets menu | Tier 4 | `TC-SCN-PRESET` | `pcbStarterScene.test.ts` | Preset metadata, title, and key bindings |
| F-30 | Automated Test Suite | Vitest runner validating all 4 tiers | Infrastructure | All | `vitest` / `test-pcb-autoshapes.mjs` | Exit code 0 across all suites |
| F-31 | Build & Bundle Hygiene | Clean `tsc --noEmit` and `npm run build` | Infrastructure | Build | `tsc` / `bundle-standalone` | 0 TypeScript errors, standalone HTML generated |

---

## 3. The 4-Tier Test Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Tier 4: Real-World Scenarios                      │
│             (CUB-FC405 Flight Controller Prototype Scene)             │
│   - Scene Graph Structure (>=50 CanvasObjects)                         │
│   - Unique IDs, Strict Z-Order, No Coordinate Escapes                  │
│   - Component Verification: STM32, IMU, LDO, Crystal, USB-C, Traces   │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │
┌───────────────────────────────────┴────────────────────────────────────┐
│         Tier 3: Cross-Feature Combinations & Interactivity             │
│   - Control Point Dragging via `dragAutoShapeControlPoint()`           │
│   - Parameter Mutation & Re-evaluation Invariants                      │
│   - Closed vs. Open Path Flags & Multi-Subpath Rendering               │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │
┌───────────────────────────────────┴────────────────────────────────────┐
│                  Tier 2: Boundary & Corner Cases                       │
│   - Min / Max Pin Counts (e.g. DIP 4..40, QFP 32..100)                 │
│   - Zero and Extreme Corner Radii (0..40px)                            │
│   - Pitch Ratios, Trace Widths (1..24px), Thermal Via Toggles          │
│   - Zero Runtime Exceptions or Geometry Corruption                     │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │
┌───────────────────────────────────┴────────────────────────────────────┐
│                 Tier 1: Feature Coverage & Default State               │
│   - Enumerate all PCB AutoShapes in `PCB_LAYOUT_AUTOSHAPES`            │
│   - Instantiation with Default Parameters                              │
│   - Finite Bezier Coordinates, Non-Empty Bounds (w > 0, h > 0)         │
│   - Category & Schema Synchronization                                  │
└────────────────────────────────────────────────────────────────────────┘
```

### Tier 1: Feature Coverage & Default Instantiation
- **Objective**: Verify that every PCB AutoShape definition compiles, registers, and instantiates cleanly under standard default conditions.
- **Assertions**:
  - `evaluateAutoShape(def, 200, 150, def.defaultParams)` produces `error === undefined`.
  - `paths.length >= 1` for all shapes (multi-subpath shapes produce body + pads).
  - Every node in every path has finite `x, y, cp1x, cp1y, cp2x, cp2y`.
  - Bounding dimensions `maxX - minX > 0` and `maxY - minY > 0`.
  - Every parameter in `defaultParams` has a corresponding metadata entry in `paramSchema`.

### Tier 2: Boundary & Corner Cases
- **Objective**: Stress-test parametric bounds across all shapes to ensure resilience against extreme user inputs.
- **Boundary Conditions Tested**:
  - **Pin Count Boundaries**: DIP (4 to 40 pins), SOIC (8 to 28 pins), QFP (32 to 100 pins), QFN (16 to 64 pins), Pin Headers (1 to 24 pins).
  - **Corner Radii**: 0px (sharp square corners) to 40px (maximum chamfer/fillet) on board outlines and pads.
  - **Trace & Track Widths**: Minimum 1px (fine line) to 24px (heavy power rail).
  - **Thermal Via Array Grid**: Toggling thermal vias `true` / `false` and scaling central EPAD ratio from 0.2 to 0.8.
  - **Extreme Pitch Ratios**: Narrow (1.0mm) to wide (5.08mm) lead spacing.
- **Assertions**:
  - Zero runtime exceptions thrown during evaluation.
  - Geometry never collapses to zero width/height or generates `NaN`/`Infinity`.

### Tier 3: Cross-Feature Combinations & Interactivity
- **Objective**: Validate interactive yellow diamond control points, drag mechanics, and multi-subpath rendering rules.
- **Assertions**:
  - `getControlPoints()` returns at least one control point for interactive footprints.
  - `dragAutoShapeControlPoint(def, id, localX, localY, width, height, params)` returns valid clamped parameters.
  - Re-evaluating the shape with mutated parameters yields transformed Bezier geometry matching the drag direction.
  - Path closure flags are preserved: closed pads remain `closed === true`, open traces remain `closed === false`.
  - Multi-subpath rendering invariant: Subpath 0 is the enclosing component body; subpaths 1..N represent solder pads and keepout details.

### Tier 4: Real-World Application Scenarios (CUB-FC405 Flight Controller Prototype)
- **Objective**: Validate the full scene graph of the Osito CUB-FC405 Autonomous Flight Controller prototype scene.
- **Assertions**:
  - `createPcbStarterSceneObjects()` returns `>= 50` `CanvasObject` instances.
  - Every object has a unique `id` (zero duplicate keys).
  - Coordinates fit within the 960x600 canvas viewport (`x >= 0`, `y >= 0`, `x + width <= 960`, `y + height <= 600`).
  - Essential avionics components are present:
    1. FR4 Board Substrate (`pcb-board-substrate` / `pcb-board-outline`)
    2. STM32 MCU Footprint (`pcb-u1-mcu` / QFP package)
    3. ICM-42688-P 6-Axis IMU (`pcb-u2-imu` / QFN package)
    4. 3.3V LDO Voltage Regulator (`pcb-u3-ldo` / SOT package)
    5. 16.000MHz HSE Crystal Oscillator (`pcb-y1-crystal`)
    6. USB-C Edge Connector (`pcb-j1-usb`)
    7. Pin Headers for ESC, GPS/I2C, and SWD Debug (`pcb-j2-esc-header`, `pcb-j3-gps-header`, `pcb-j4-swd-header`)
    8. 45° Mitered Copper Traces (USB D+/D-, SPI bus, 3.3V power, motor signals)
    9. Plated Ground Stitching Vias (perimeter via array)
    10. M3 Mounting Holes (4 corner grounded holes)
    11. HUD Telemetry & DRC Specification Cards (sidebar telemetry)
  - Z-ordering invariant: Ground plane < Traces < Vias < Pads < IC Bodies < Silkscreen < HUD.

---

## 4. Test Runner Invocation & Verification Commands

### Automated Test Execution via Vitest
To run the automated test suite within the workspace:

```bash
# Run all tests in evolve-fireworks-studio
cmd /c "cd /d evolve-fireworks-studio && npx vitest run"

# Run specific PCB AutoShapes test suite
cmd /c "cd /d evolve-fireworks-studio && npx vitest run src/engine/__tests__/pcbLayoutAutoshapes.test.ts"

# Run specific Starter Scene test suite
cmd /c "cd /d evolve-fireworks-studio && npx vitest run src/engine/__tests__/pcbStarterScene.test.ts"
```

### Standalone Node.js Verification Script
For zero-dependency verification without invoking the full test runner framework:

```bash
cmd /c "cd /d evolve-fireworks-studio && node scripts/test-pcb-autoshapes.mjs"
```

### TypeScript Compilation & Build Hygiene Verification
To verify zero diagnostic errors across all source and test files:

```bash
# TypeScript compiler check
cmd /c "cd /d evolve-fireworks-studio && npx tsc --noEmit"

# Production Vite bundling and standalone single-file packaging
cmd /c "cd /d evolve-fireworks-studio && npm run build"
```

---

## 5. Defect Escalation Protocol

If an implementation bug is uncovered during test execution:
1. **Never edit implementation code directly**. The test writer's ownership is strictly bounded to test suites, scripts, and documentation (`TEST_INFRA.md`, `TEST_READY.md`).
2. **Log the defect** with:
   - Reproduction step and input parameters.
   - Expected output derived from IPC-7351B standards or `PROJECT.md` contracts.
   - Actual output, stack trace, or geometric coordinate corruption observed.
3. **Escalate to the orchestrator** via `send_message` with the exact file path and offending line number.

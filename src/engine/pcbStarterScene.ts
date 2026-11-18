import type {
  CanvasObject,
  VectorPathObject,
  AutoShapeObject,
  TextObject,
  BezierNode,
} from '../types/editor';

/**
 * OSITO STUDIO — CUB-FC405 AUTONOMOUS FLIGHT CONTROLLER PCB STARTER SCENE
 * Production-ready 4-layer FR4 avionics prototype layout template (Rev 2.4).
 *
 * Stacking Order (9 Strict Z-Layers):
 * Layer 0: ESD Workmat & Sidebar HUD Backdrops
 * Layer 1: Studio Sidebar HUD Cards & DRC Telemetry
 * Layer 2: PCB Board Outline (FR4 Substrate)
 * Layer 3: Copper Ground Pour & Corner M3 Mounting Holes
 * Layer 4: 45° Mitered Conductive Copper Traces (IPC-2221)
 * Layer 5: Plated Ground Stitching Vias (12x)
 * Layer 6: Integrated Circuits & Silicon Packages (STM32, IMU, LDO, Crystal, USB-C)
 * Layer 7: SMT Passives & Pin Headers (ESC, GPS, SWD, 0603/0402 Passives)
 * Layer 8: Gold Surface Diagnostic Test Points (TP1-TP5)
 * Layer 9: Silkscreen Legend & Board Branding
 */

function buildRectBezierNodes(w: number, h: number, radius = 0): BezierNode[] {
  const rw = Math.max(2, Math.round(w));
  const rh = Math.max(2, Math.round(h));
  const r = Math.max(0, Math.min(radius, rw / 2, rh / 2));
  if (r <= 0.5) {
    return [
      { id: 'n0', x: 0, y: 0, cp1x: 0, cp1y: 0, cp2x: 0, cp2y: 0, pointType: 'corner' },
      { id: 'n1', x: rw, y: 0, cp1x: rw, cp1y: 0, cp2x: rw, cp2y: 0, pointType: 'corner' },
      { id: 'n2', x: rw, y: rh, cp1x: rw, cp1y: rh, cp2x: rw, cp2y: rh, pointType: 'corner' },
      { id: 'n3', x: 0, y: rh, cp1x: 0, cp1y: rh, cp2x: 0, cp2y: rh, pointType: 'corner' },
    ];
  }
  const k = r * 0.55228475;
  return [
    { id: 'r0', x: r, y: 0, cp1x: r - k, cp1y: 0, cp2x: r, cp2y: 0, pointType: 'smooth' },
    { id: 'r1', x: rw - r, y: 0, cp1x: rw - r, cp1y: 0, cp2x: rw - r + k, cp2y: 0, pointType: 'smooth' },
    { id: 'r2', x: rw, y: r, cp1x: rw, cp1y: r - k, cp2x: rw, cp2y: r, pointType: 'smooth' },
    { id: 'r3', x: rw, y: rh - r, cp1x: rw, cp1y: rh - r, cp2x: rw, cp2y: rh - r + k, pointType: 'smooth' },
    { id: 'r4', x: rw - r, y: rh, cp1x: rw - r + k, cp1y: rh, cp2x: rw - r, cp2y: rh, pointType: 'smooth' },
    { id: 'r5', x: r, y: rh, cp1x: r, cp1y: rh, cp2x: r - k, cp2y: rh, pointType: 'smooth' },
    { id: 'r6', x: 0, y: rh - r, cp1x: 0, cp1y: rh - r + k, cp2x: 0, cp2y: rh - r, pointType: 'smooth' },
    { id: 'r7', x: 0, y: r, cp1x: 0, cp1y: r, cp2x: 0, cp2y: r - k, pointType: 'smooth' },
  ];
}

function makeVectorCard(
  id: string,
  name: string,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  opts: {
    radius?: number;
    gradEnd?: string;
    stroke?: string;
    strokeWidth?: number;
    shadow?: boolean;
    hoverFill?: string;
    hoverStroke?: string;
    params?: Record<string, number | boolean | string>;
  } = {}
): VectorPathObject {
  const fillType = opts.gradEnd ? 'linear-gradient' : 'solid';
  const gradEnd = opts.gradEnd || fill;
  const stroke = opts.stroke || 'none';
  const strokeWidth = opts.strokeWidth ?? (stroke === 'none' ? 0 : 1.5);
  return {
    id,
    name,
    type: 'vector-path',
    visible: true,
    locked: false,
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(w),
    height: Math.round(h),
    rotation: 0,
    opacity: 1,
    blendMode: 'source-over',
    fill,
    fillType,
    fillGradientEnd: gradEnd,
    stroke,
    strokeWidth,
    strokeAlign: 'inside',
    pixelSnap: true,
    shadow: opts.shadow
      ? { enabled: true, color: 'rgba(0, 0, 0, 0.52)', blur: 18, offsetX: 0, offsetY: 6 }
      : { enabled: false, color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
    closed: true,
    nodes: buildRectBezierNodes(w, h, opts.radius ?? 0),
    ...(opts.params ? { params: opts.params } : {}),
    stateVariants: {
      default: {
        fill,
        fillGradientEnd: gradEnd,
        stroke,
        strokeWidth,
        opacity: 1,
      },
      hover: {
        fill: opts.hoverFill || '#1e293b',
        fillGradientEnd: gradEnd,
        stroke: opts.hoverStroke || '#ffffff',
        strokeWidth: Math.max(1.5, strokeWidth),
        opacity: 1,
        offsetY: -1,
        scale: 1.008,
      },
      active: {
        fill,
        fillGradientEnd: gradEnd,
        stroke: '#38bdf8',
        strokeWidth: Math.max(2, strokeWidth),
        opacity: 0.96,
        offsetY: 1,
        scale: 0.995,
      },
    },
  };
}

function makeLabel(
  id: string,
  name: string,
  text: string,
  x: number,
  y: number,
  w: number,
  h: number,
  fontSize: number,
  fill = '#f8fafc',
  align: 'left' | 'center' | 'right' = 'left',
  fontFamily: 'Inter' | 'Space Grotesk' | 'JetBrains Mono' = 'Inter',
  fontWeight: '400' | '500' | '600' | '700' = '700',
  letterSpacing = 0.2
): TextObject {
  return {
    id,
    name,
    type: 'text',
    visible: true,
    locked: false,
    x: Math.round(x),
    y: Math.round(y),
    width: Math.max(12, Math.round(w)),
    height: Math.max(12, Math.round(h)),
    rotation: 0,
    opacity: 1,
    blendMode: 'source-over',
    fill,
    fillType: 'solid',
    fillGradientEnd: fill,
    stroke: 'none',
    strokeWidth: 0,
    strokeAlign: 'center',
    pixelSnap: true,
    shadow: { enabled: false, color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
    text,
    fontFamily,
    fontSize,
    fontWeight,
    textAlign: align,
    letterSpacing,
  };
}

function makeTracePath(
  id: string,
  name: string,
  points: Array<{ x: number; y: number }>,
  stroke: string,
  strokeWidth = 2
): VectorPathObject {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  const w = Math.max(4, Math.round(maxX - minX));
  const h = Math.max(4, Math.round(maxY - minY));

  const nodes: BezierNode[] = points.map((p, idx) => {
    const lx = Math.round(p.x - minX);
    const ly = Math.round(p.y - minY);
    return {
      id: `${id}-n${idx}`,
      x: lx,
      y: ly,
      cp1x: lx,
      cp1y: ly,
      cp2x: lx,
      cp2y: ly,
      pointType: 'corner',
    };
  });

  return {
    id,
    name,
    type: 'vector-path',
    visible: true,
    locked: false,
    x: Math.round(minX),
    y: Math.round(minY),
    width: w,
    height: h,
    rotation: 0,
    opacity: 1,
    blendMode: 'source-over',
    fill: 'none',
    fillType: 'solid',
    fillGradientEnd: 'none',
    stroke,
    strokeWidth,
    strokeAlign: 'center',
    pixelSnap: true,
    shadow: { enabled: false, color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
    closed: false,
    nodes,
  };
}

function makePcbAutoShape(
  id: string,
  name: string,
  shapeDefId: string,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  stroke: string,
  strokeWidth = 1.5,
  params: Record<string, number | boolean | string> = {},
  opts: {
    fillType?: 'solid' | 'linear-gradient';
    fillGradientEnd?: string;
  } = {}
): AutoShapeObject {
  return {
    id,
    name,
    type: 'autoshape',
    shapeDefId,
    visible: true,
    locked: false,
    x: Math.round(x),
    y: Math.round(y),
    width: Math.max(4, Math.round(w)),
    height: Math.max(4, Math.round(h)),
    rotation: 0,
    opacity: 1,
    blendMode: 'source-over',
    fill,
    fillType: opts.fillType || (opts.fillGradientEnd ? 'linear-gradient' : 'solid'),
    fillGradientEnd: opts.fillGradientEnd || fill,
    stroke,
    strokeWidth,
    strokeAlign: 'inside',
    pixelSnap: true,
    shadow: { enabled: false, color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
    params,
  };
}

/**
 * Generates the complete Osito CUB-FC405 Avionics PCB starter scene objects.
 * Returns an array of CanvasObjects structured across 9 strict Z-layers.
 */
export function createPcbStarterSceneObjects(): CanvasObject[] {
  const objects: CanvasObject[] = [];

  // =========================================================================
  // LAYER 0: CANVAS BACKDROP & ESD WORKMAT
  // =========================================================================
  // Dark emerald/slate ESD anti-static bench workmat backing the flight controller board
  objects.push(
    makeVectorCard(
      'pcb-workmat-backdrop',
      'ESD Anti-Static Workmat Backdrop',
      276,
      14,
      664,
      572,
      '#08140f',
      {
        gradEnd: '#040d0a',
        stroke: '#064e3b',
        strokeWidth: 1.5,
        radius: 16,
        shadow: true,
      }
    )
  );

  // Left studio telemetry HUD sidebar backdrop
  objects.push(
    makeVectorCard(
      'pcb-hud-backdrop',
      'Studio Telemetry Sidebar HUD Backdrop',
      20,
      14,
      240,
      572,
      '#09130e',
      {
        gradEnd: '#060f0b',
        stroke: '#064e3b',
        strokeWidth: 1.5,
        radius: 16,
        shadow: true,
      }
    )
  );

  // =========================================================================
  // LAYER 1: STUDIO SIDEBAR HUD CARDS & TELEMETRY
  // =========================================================================
  // Top green accent bar
  objects.push(
    makeVectorCard('pcb-hud-accent-bar', 'HUD Accent Bar', 20, 14, 240, 4, '#10b981', {
      stroke: 'none',
      radius: 2,
    })
  );

  // Badge callout
  objects.push(
    makeLabel(
      'pcb-hud-badge',
      'HUD Stage Badge',
      '07 / AVIONICS PCB STUDIO',
      34,
      28,
      212,
      16,
      10,
      '#34d399',
      'left',
      'JetBrains Mono',
      '700',
      0.8
    )
  );

  // Board Model Title
  objects.push(
    makeLabel(
      'pcb-hud-title',
      'HUD Model Title',
      'Osito CUB-FC405',
      34,
      48,
      212,
      20,
      16,
      '#f8fafc',
      'left',
      'Space Grotesk',
      '700',
      0.2
    )
  );

  // Subtitle / Architecture summary
  objects.push(
    makeLabel(
      'pcb-hud-subtitle',
      'HUD Model Subtitle',
      'Autonomous Quadcopter Flight Controller',
      34,
      70,
      212,
      14,
      9.5,
      '#94a3b8',
      'left',
      'Inter',
      '500'
    )
  );

  // 1. 4-Layer FR4 Stackup Card & Text
  objects.push(
    makeVectorCard('pcb-hud-stackup-card', 'HUD Stackup Specification Card', 34, 92, 212, 94, '#06120b', {
      stroke: '#064e3b',
      strokeWidth: 1,
      radius: 8,
    })
  );
  objects.push(
    makeLabel(
      'pcb-hud-stackup-text',
      'HUD Stackup Text',
      'STACKUP: 4-LAYER FR4 (1.6mm)\nL1 (Top): 1oz Cu Signals / ENIG\nL2 (In1): 1oz Cu Solid GND Plane\nL3 (In2): 1oz Cu +3V3 / +5V Power\nL4 (Bot): 1oz Cu Motor PWM & Signals',
      44,
      100,
      192,
      78,
      9,
      '#a7f3d0',
      'left',
      'JetBrains Mono',
      '500'
    )
  );

  // 2. DRC Design Rules Card & Text
  objects.push(
    makeVectorCard('pcb-hud-drc-card', 'HUD DRC Constraints Card', 34, 196, 212, 98, '#06120b', {
      stroke: '#064e3b',
      strokeWidth: 1,
      radius: 8,
    })
  );
  objects.push(
    makeLabel(
      'pcb-hud-drc-text',
      'HUD DRC Constraints Text',
      'DRC SPECIFICATIONS (IPC-2221)\nMin Trace / Space: 6mil / 6mil\nMin Via Drill: 0.3mm (0.6mm Pad)\nAnnular Ring: >= 0.15mm (6mil)\nFinish: Electroless Ni Immersion Gold',
      44,
      204,
      192,
      82,
      9,
      '#6ee7b7',
      'left',
      'JetBrains Mono',
      '500'
    )
  );

  // 3. Active Flight Netlist Card & Text
  objects.push(
    makeVectorCard('pcb-hud-netlist-card', 'HUD Netlist Status Card', 34, 304, 212, 138, '#06120b', {
      stroke: '#064e3b',
      strokeWidth: 1,
      radius: 8,
    })
  );
  objects.push(
    makeLabel(
      'pcb-hud-netlist-text',
      'HUD Netlist Status Text',
      'ACTIVE FLIGHT NETLIST\n• +3V3_SYS: 3.3V Low-Noise Bus (500mA)\n• +5V_RAW: 5V Battery BEC Rail\n• SPI1: 42MHz IMU Sensor Bus (DMA)\n• USART1: 921600 Baud GNSS / GPS\n• TIM1: DShot600 Quad Motor ESCs\n• GND: Continuous Polygonal Ground Plane',
      44,
      312,
      192,
      122,
      8.5,
      '#cbd5e1',
      'left',
      'JetBrains Mono',
      '400'
    )
  );

  // 4. Inspection Tips & Legend Card & Text
  objects.push(
    makeVectorCard('pcb-hud-legend-card', 'HUD Inspection Tips Card', 34, 452, 212, 114, '#06120b', {
      stroke: '#064e3b',
      strokeWidth: 1,
      radius: 8,
    })
  );
  objects.push(
    makeLabel(
      'pcb-hud-legend-text',
      'HUD Inspection Tips Text',
      'PCB DESIGN INSPECTION TIPS\n• Drag control points on MCU/IMU\n• Click USB-C / SOT in Preview to cycle\n• Trace lines conform to 45° IPC miters\n• Vias provide low-impedance RF ground\n• Presets: Press 1-7 or Ctrl+K to jump',
      44,
      460,
      192,
      98,
      8.5,
      '#94a3b8',
      'left',
      'Inter',
      '400'
    )
  );

  // =========================================================================
  // LAYER 2: PCB BOARD OUTLINE (FR4 SOLDER MASK SUBSTRATE)
  // =========================================================================
  objects.push(
    makePcbAutoShape(
      'pcb-board-substrate',
      'FR4 Substrate Board Outline (560x480)',
      'pcb-outline-board',
      328,
      60,
      560,
      480,
      '#071a12',
      '#10b981',
      2,
      {
        label: 'OSITO CUB-FC405 REV 2.4',
        cornerRadius: 24,
        showMountingHoles: false,
        holeInsetRatio: 0.08,
      },
      {
        fillType: 'linear-gradient',
        fillGradientEnd: '#04110b',
      }
    )
  );

  // =========================================================================
  // LAYER 3: COPPER GROUND POUR & 4 CORNER M3 MOUNTING HOLES
  // =========================================================================
  // Solid inner ground pour plane with 12px keepout inset
  objects.push(
    makeVectorCard(
      'pcb-copper-ground-pour',
      'Top-Layer Copper Ground Pour Plane',
      340,
      72,
      536,
      456,
      '#0a2419',
      {
        stroke: '#059669',
        strokeWidth: 1,
        radius: 18,
      }
    )
  );

  // 4 Corner M3 Heavy Chassis Mounting Holes with Gold Annular Rings
  objects.push(
    makePcbAutoShape(
      'pcb-mount-tl',
      'M3 Mounting Hole (Top-Left)',
      'pcb-feature-mounting-hole',
      348,
      80,
      32,
      32,
      '#d97706',
      '#fbbf24',
      1.5,
      { label: 'M3_TL', holeSize: 3, plated: true }
    )
  );
  objects.push(
    makePcbAutoShape(
      'pcb-mount-tr',
      'M3 Mounting Hole (Top-Right)',
      'pcb-feature-mounting-hole',
      836,
      80,
      32,
      32,
      '#d97706',
      '#fbbf24',
      1.5,
      { label: 'M3_TR', holeSize: 3, plated: true }
    )
  );
  objects.push(
    makePcbAutoShape(
      'pcb-mount-br',
      'M3 Mounting Hole (Bottom-Right)',
      'pcb-feature-mounting-hole',
      836,
      488,
      32,
      32,
      '#d97706',
      '#fbbf24',
      1.5,
      { label: 'M3_BR', holeSize: 3, plated: true }
    )
  );
  objects.push(
    makePcbAutoShape(
      'pcb-mount-bl',
      'M3 Mounting Hole (Bottom-Left)',
      'pcb-feature-mounting-hole',
      348,
      488,
      32,
      32,
      '#d97706',
      '#fbbf24',
      1.5,
      { label: 'M3_BL', holeSize: 3, plated: true }
    )
  );

  // =========================================================================
  // LAYER 4: 45° MITERED CONDUCTIVE COPPER TRACES (IPC-2221)
  // =========================================================================
  // 1. USB D+ 90-Ohm Differential Trace with 45° dogleg bends
  objects.push(
    makeTracePath(
      'pcb-trace-usb-dp',
      'USB D+ 90Ω Differential Trace (45° Mitered)',
      [
        { x: 370, y: 280 },
        { x: 384, y: 280 },
        { x: 420, y: 280 },
        { x: 450, y: 250 },
        { x: 558, y: 250 },
      ],
      '#f59e0b',
      2
    )
  );

  // 2. USB D- 90-Ohm Differential Trace with parallel 45° dogleg bends
  objects.push(
    makeTracePath(
      'pcb-trace-usb-dm',
      'USB D- 90Ω Differential Trace (45° Mitered)',
      [
        { x: 370, y: 304 },
        { x: 384, y: 304 },
        { x: 424, y: 304 },
        { x: 454, y: 274 },
        { x: 558, y: 274 },
      ],
      '#f59e0b',
      2
    )
  );

  // 3. SPI SCK Clock Trace (MCU PA5 -> IMU SCLK)
  objects.push(
    makeTracePath(
      'pcb-trace-spi-sck',
      'SPI1 SCK Clock Trace (42MHz DMA Bus)',
      [
        { x: 668, y: 280 },
        { x: 690, y: 280 },
        { x: 704, y: 266 },
        { x: 716, y: 266 },
      ],
      '#fbbf24',
      2
    )
  );

  // 4. SPI MOSI Master-Out-Slave-In Trace (MCU PA7 -> IMU SDI)
  objects.push(
    makeTracePath(
      'pcb-trace-spi-mosi',
      'SPI1 MOSI Data Trace (MCU -> IMU)',
      [
        { x: 668, y: 294 },
        { x: 690, y: 294 },
        { x: 704, y: 280 },
        { x: 716, y: 280 },
      ],
      '#fbbf24',
      2
    )
  );

  // 5. SPI MISO Master-In-Slave-Out Trace (IMU SDO -> MCU PA6)
  objects.push(
    makeTracePath(
      'pcb-trace-spi-miso',
      'SPI1 MISO Telemetry Trace (IMU -> MCU)',
      [
        { x: 716, y: 294 },
        { x: 704, y: 294 },
        { x: 690, y: 308 },
        { x: 668, y: 308 },
      ],
      '#fbbf24',
      2
    )
  );

  // 6. +3.3V Low-Noise Power Supply Bus (LDO -> MCU & IMU)
  objects.push(
    makeTracePath(
      'pcb-trace-pwr-3v3',
      '+3.3V Low-Noise Regulated Power Bus',
      [
        { x: 618, y: 164 },
        { x: 618, y: 210 },
        { x: 648, y: 240 },
        { x: 678, y: 240 },
        { x: 690, y: 252 },
        { x: 716, y: 252 },
      ],
      '#fde047',
      3.5
    )
  );

  // 7. Motor 1 PWM DShot600 Trace (MCU TIM1_CH1 -> ESC Header Pin 1)
  objects.push(
    makeTracePath(
      'pcb-trace-motor-m1',
      'Motor 1 PWM Output Trace (TIM1_CH1)',
      [
        { x: 668, y: 330 },
        { x: 720, y: 330 },
        { x: 815, y: 235 },
        { x: 838, y: 235 },
      ],
      '#38bdf8',
      2
    )
  );

  // 8. Motor 2 PWM DShot600 Trace (MCU TIM1_CH2 -> ESC Header Pin 2)
  objects.push(
    makeTracePath(
      'pcb-trace-motor-m2',
      'Motor 2 PWM Output Trace (TIM1_CH2)',
      [
        { x: 668, y: 340 },
        { x: 730, y: 340 },
        { x: 815, y: 255 },
        { x: 838, y: 255 },
      ],
      '#38bdf8',
      2
    )
  );

  // 9. Motor 3 PWM DShot600 Trace (MCU TIM3_CH1 -> ESC Header Pin 3)
  objects.push(
    makeTracePath(
      'pcb-trace-motor-m3',
      'Motor 3 PWM Output Trace (TIM3_CH1)',
      [
        { x: 650, y: 350 },
        { x: 665, y: 365 },
        { x: 755, y: 365 },
        { x: 825, y: 295 },
        { x: 838, y: 295 },
      ],
      '#38bdf8',
      2
    )
  );

  // 10. Motor 4 PWM DShot600 Trace (MCU TIM3_CH2 -> ESC Header Pin 4)
  objects.push(
    makeTracePath(
      'pcb-trace-motor-m4',
      'Motor 4 PWM Output Trace (TIM3_CH2)',
      [
        { x: 638, y: 350 },
        { x: 653, y: 365 },
        { x: 745, y: 365 },
        { x: 795, y: 315 },
        { x: 838, y: 315 },
      ],
      '#38bdf8',
      2
    )
  );

  // =========================================================================
  // LAYER 5: PLATED GROUND STITCHING VIAS (12x)
  // =========================================================================
  const viaPositions = [
    { id: 'pcb-via-01', x: 400, y: 86, name: 'Ground Stitching Via 01 (Top Edge)' },
    { id: 'pcb-via-02', x: 480, y: 86, name: 'Ground Stitching Via 02 (Top Edge)' },
    { id: 'pcb-via-03', x: 700, y: 86, name: 'Ground Stitching Via 03 (Top Edge)' },
    { id: 'pcb-via-04', x: 780, y: 86, name: 'Ground Stitching Via 04 (Top Edge)' },
    { id: 'pcb-via-05', x: 854, y: 140, name: 'Ground Stitching Via 05 (Right Edge)' },
    { id: 'pcb-via-06', x: 854, y: 410, name: 'Ground Stitching Via 06 (Right Edge)' },
    { id: 'pcb-via-07', x: 780, y: 504, name: 'Ground Stitching Via 07 (Bottom Edge)' },
    { id: 'pcb-via-08', x: 700, y: 504, name: 'Ground Stitching Via 08 (Bottom Edge)' },
    { id: 'pcb-via-09', x: 480, y: 504, name: 'Ground Stitching Via 09 (Bottom Edge)' },
    { id: 'pcb-via-10', x: 400, y: 504, name: 'Ground Stitching Via 10 (Bottom Edge)' },
    { id: 'pcb-via-11', x: 348, y: 410, name: 'Ground Stitching Via 11 (Left Edge)' },
    { id: 'pcb-via-12', x: 348, y: 140, name: 'Ground Stitching Via 12 (Left Edge)' },
  ];

  for (const v of viaPositions) {
    objects.push(
      makePcbAutoShape(
        v.id,
        v.name,
        'pcb-feature-via',
        v.x,
        v.y,
        14,
        14,
        '#d97706',
        '#fbbf24',
        1.5,
        { label: 'GND', gridSize: 1, drillRatio: 0.45 }
      )
    );
  }

  // =========================================================================
  // LAYER 6: INTEGRATED CIRCUITS & PRIMARY SILICON PACKAGES
  // =========================================================================
  // Primary MCU: STM32F405RGT6 (LQFP-48, 168MHz ARM Cortex-M4F)
  objects.push(
    makePcbAutoShape(
      'pcb-u1-mcu',
      'U1: STM32F405 MCU (LQFP-48, 168MHz Cortex-M4F)',
      'pcb-ic-qfp',
      558,
      240,
      110,
      110,
      '#1e293b',
      '#fbbf24',
      1.5,
      {
        label: 'STM32F405',
        pinsPerSide: 12,
        bodyRatio: 0.68,
        padReach: 0.14,
      }
    )
  );

  // High-Precision 6-Axis IMU: ICM-42688-P (QFN-16, Ultra-Low Noise)
  objects.push(
    makePcbAutoShape(
      'pcb-u2-imu',
      'U2: ICM-42688-P 6-Axis IMU (QFN-16)',
      'pcb-ic-qfn',
      716,
      265,
      56,
      56,
      '#0f172a',
      '#38bdf8',
      1.5,
      {
        label: 'ICM-42688P',
        pinsPerSide: 4,
        thermalPadRatio: 0.44,
        showThermalVias: true,
      }
    )
  );

  // 3.3V Low-Dropout Linear Voltage Regulator: AMS1117-3.3 (SOT-223 Heatsink Tab)
  objects.push(
    makePcbAutoShape(
      'pcb-u3-ldo',
      'U3: 3.3V Low-Noise LDO Regulator (SOT-223 Heatsink Tab)',
      'pcb-discrete-sot',
      585,
      118,
      66,
      46,
      '#1e293b',
      '#fbbf24',
      1.5,
      {
        label: '3.3V LDO',
        packageType: 2,
        bodyWidthRatio: 0.52,
      }
    )
  );

  // Primary High-Speed External HSE Crystal: 16.000MHz (SMD Seam-Weld Can)
  objects.push(
    makePcbAutoShape(
      'pcb-y1-crystal',
      'Y1: 16.000MHz Crystal Oscillator (SMD Seam-Weld)',
      'pcb-passive-smd-chip',
      460,
      188,
      52,
      34,
      '#334155',
      '#94a3b8',
      1.5,
      {
        label: '16.000MHz',
        componentType: 1,
        padWidthRatio: 0.28,
        showBrackets: true,
      }
    )
  );

  // Edge Reversible USB-C Receptacle with 4 Heavy Ground Tabs
  objects.push(
    makePcbAutoShape(
      'pcb-j1-usb',
      'J1: USB Type-C Flight Telemetry & Flashing Receptacle',
      'pcb-conn-usbc',
      328,
      265,
      42,
      54,
      '#1e293b',
      '#94a3b8',
      1.5,
      {
        label: 'USB-C',
        tabLengthRatio: 0.14,
        overhangRatio: 0.18,
        showPins: true,
      }
    )
  );

  // =========================================================================
  // LAYER 7: SMT PASSIVES & PIN HEADERS
  // =========================================================================
  // J2: 1x8 ESC Quad Motor Header (2.54mm / 0.1" pitch)
  objects.push(
    makePcbAutoShape(
      'pcb-j2-esc-header',
      'J2: 1x8 ESC Quad Motor Signal Header',
      'pcb-conn-header-0100',
      838,
      205,
      32,
      180,
      '#0f172a',
      '#fbbf24',
      1.5,
      { label: 'ESC 1-8', pins: 8, isDualRow: false }
    )
  );

  // J3: 1x6 GPS & Compass I2C Header (2.54mm / 0.1" pitch)
  objects.push(
    makePcbAutoShape(
      'pcb-j3-gps-header',
      'J3: 1x6 GPS & Compass I2C Header',
      'pcb-conn-header-0100',
      520,
      476,
      150,
      32,
      '#0f172a',
      '#fbbf24',
      1.5,
      { label: 'GPS / I2C', pins: 6, isDualRow: false }
    )
  );

  // J4: 1x4 SWD Cortex Debug Header (2.54mm / 0.1" pitch)
  objects.push(
    makePcbAutoShape(
      'pcb-j4-swd-header',
      'J4: 1x4 SWD ARM Debug Header',
      'pcb-conn-header-0100',
      420,
      430,
      96,
      28,
      '#0f172a',
      '#fbbf24',
      1.5,
      { label: 'SWD DEBUG', pins: 4, isDualRow: false }
    )
  );

  // C1, C2: Crystal Load Capacitors (12pF 0402)
  objects.push(
    makePcbAutoShape(
      'pcb-c1-crystal-load',
      'C1: 12pF HSE Crystal Load Capacitor (0402)',
      'pcb-passive-smd-chip',
      436,
      230,
      26,
      16,
      '#1e293b',
      '#38bdf8',
      1,
      { label: '12pF', componentType: 2, padWidthRatio: 0.28, showBrackets: true }
    )
  );
  objects.push(
    makePcbAutoShape(
      'pcb-c2-crystal-load',
      'C2: 12pF HSE Crystal Load Capacitor (0402)',
      'pcb-passive-smd-chip',
      472,
      230,
      26,
      16,
      '#1e293b',
      '#38bdf8',
      1,
      { label: '12pF', componentType: 2, padWidthRatio: 0.28, showBrackets: true }
    )
  );

  // C3, C4: LDO Input/Output Tantalum Bulk Capacitors (10µF 0805)
  objects.push(
    makePcbAutoShape(
      'pcb-c3-ldo-in',
      'C3: 10µF LDO Input Filter Capacitor (0805)',
      'pcb-passive-smd-chip',
      544,
      132,
      32,
      18,
      '#1e293b',
      '#38bdf8',
      1,
      { label: '10µF', componentType: 2, padWidthRatio: 0.28, showBrackets: true }
    )
  );
  objects.push(
    makePcbAutoShape(
      'pcb-c4-ldo-out',
      'C4: 10µF LDO Output Filter Capacitor (0805)',
      'pcb-passive-smd-chip',
      662,
      132,
      32,
      18,
      '#1e293b',
      '#38bdf8',
      1,
      { label: '10µF', componentType: 2, padWidthRatio: 0.28, showBrackets: true }
    )
  );

  // C5, C6: MCU VDD Decoupling Capacitors (100nF 0603)
  objects.push(
    makePcbAutoShape(
      'pcb-c5-mcu-decoupling',
      'C5: 100nF MCU VDD High-Frequency Decoupling Capacitor',
      'pcb-passive-smd-chip',
      526,
      270,
      24,
      14,
      '#1e293b',
      '#38bdf8',
      1,
      { label: '100nF', componentType: 2, padWidthRatio: 0.28, showBrackets: true }
    )
  );
  objects.push(
    makePcbAutoShape(
      'pcb-c6-mcu-decoupling',
      'C6: 100nF MCU VDD High-Frequency Decoupling Capacitor',
      'pcb-passive-smd-chip',
      598,
      360,
      24,
      14,
      '#1e293b',
      '#38bdf8',
      1,
      { label: '100nF', componentType: 2, padWidthRatio: 0.28, showBrackets: true }
    )
  );

  // C7: IMU VDD Low-Noise Decoupling Capacitor (100nF 0603)
  objects.push(
    makePcbAutoShape(
      'pcb-c7-imu-decoupling',
      'C7: 100nF IMU Analog VDD Decoupling Capacitor',
      'pcb-passive-smd-chip',
      700,
      330,
      24,
      14,
      '#1e293b',
      '#38bdf8',
      1,
      { label: '100nF', componentType: 2, padWidthRatio: 0.28, showBrackets: true }
    )
  );

  // R1, R2: USB D+/D- Termination Resistors (22Ω 0402)
  objects.push(
    makePcbAutoShape(
      'pcb-r1-usb-dp',
      'R1: 22Ω USB D+ Termination Resistor (0402)',
      'pcb-passive-smd-chip',
      384,
      276,
      24,
      14,
      '#1e293b',
      '#f59e0b',
      1,
      { label: '22Ω', componentType: 1, padWidthRatio: 0.28, showBrackets: true }
    )
  );
  objects.push(
    makePcbAutoShape(
      'pcb-r2-usb-dm',
      'R2: 22Ω USB D- Termination Resistor (0402)',
      'pcb-passive-smd-chip',
      384,
      298,
      24,
      14,
      '#1e293b',
      '#f59e0b',
      1,
      { label: '22Ω', componentType: 1, padWidthRatio: 0.28, showBrackets: true }
    )
  );

  // =========================================================================
  // LAYER 8: GOLD SURFACE DIAGNOSTIC TEST POINTS (TP1-TP5)
  // =========================================================================
  objects.push(
    makePcbAutoShape(
      'pcb-tp-3v3',
      'TP1: +3.3V Power Rail Diagnostic Test Point',
      'pcb-feature-test-point',
      650,
      186,
      18,
      18,
      '#d97706',
      '#fbbf24',
      1.5,
      { label: '+3V3', pointType: 1, padRadiusRatio: 0.55 }
    )
  );
  objects.push(
    makePcbAutoShape(
      'pcb-tp-gnd',
      'TP2: RF Ground Reference Test Point',
      'pcb-feature-test-point',
      794,
      186,
      18,
      18,
      '#d97706',
      '#fbbf24',
      1.5,
      { label: 'GND', pointType: 1, padRadiusRatio: 0.55 }
    )
  );
  objects.push(
    makePcbAutoShape(
      'pcb-tp-nrst',
      'TP3: MCU Active-Low Reset Test Point (NRST)',
      'pcb-feature-test-point',
      470,
      376,
      18,
      18,
      '#d97706',
      '#fbbf24',
      1.5,
      { label: 'NRST', pointType: 1, padRadiusRatio: 0.55 }
    )
  );
  objects.push(
    makePcbAutoShape(
      'pcb-tp-boot0',
      'TP4: DFU Bootloader Pin Test Point (BOOT0)',
      'pcb-feature-test-point',
      696,
      416,
      18,
      18,
      '#d97706',
      '#fbbf24',
      1.5,
      { label: 'BOOT', pointType: 1, padRadiusRatio: 0.55 }
    )
  );
  objects.push(
    makePcbAutoShape(
      'pcb-tp-swclk',
      'TP5: SWD Clock Probe Test Point (SWCLK)',
      'pcb-feature-test-point',
      420,
      390,
      18,
      18,
      '#d97706',
      '#fbbf24',
      1.5,
      { label: 'CLK', pointType: 1, padRadiusRatio: 0.55 }
    )
  );

  // =========================================================================
  // LAYER 9: SILKSCREEN LEGEND & BOARD BRANDING
  // =========================================================================
  objects.push(
    makeLabel(
      'pcb-silk-board-title',
      'Silkscreen Board Model & Project Title',
      'OSITO CUB-FC405 AUTONOMOUS FLIGHT CONTROLLER',
      390,
      92,
      360,
      16,
      10,
      '#f8fafc',
      'left',
      'Space Grotesk',
      '700',
      0.4
    )
  );

  objects.push(
    makeLabel(
      'pcb-silk-board-sub',
      'Silkscreen Revision & Specifications',
      'REV 2.4 • 168MHz ARM-M4F • DUAL GYRO TELEMETRY',
      390,
      108,
      360,
      14,
      8.5,
      '#94a3b8',
      'left',
      'JetBrains Mono',
      '500',
      0.3
    )
  );

  return objects;
}

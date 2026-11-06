export type ToolId =
  // Osito Select Section
  | 'pointer'        // V / 0: Black Arrow - Object select, move, bounding transform, float pixels
  | 'subselect'      // A / 1: White Hollow Arrow - Vector Bezier node & handle editor, AutoShape diamond control
  | 'select-behind'  // V (variant): Click through overlapping Z-order layers
  | 'scale'          // Q: Free Transform / 8-handle scale & rotate
  | 'crop'           // C: Canvas crop & export slice
  // Osito Bitmap Section
  | 'marquee-rect'   // M: Rectangular pixel selection (marching ants)
  | 'marquee-oval'   // M (oval): Elliptical pixel selection
  | 'lasso'          // L: Freehand pixel lasso selection
  | 'magic-wand'     // W: Flood-fill contiguous/global color tolerance pixel selection
  | 'brush'          // B: Soft/hard raster paint brush
  | 'pencil'         // Y: 1px pixel-perfect aliased raster pencil
  | 'eraser'         // E: Raster pixel eraser
  | 'bucket'         // G: Raster flood-fill paint bucket
  | 'eyedropper'     // I: Pixel color picker
  // Osito Vector Section
  | 'line'           // N: Pixel-snapped vector line
  | 'connector'      // X / J: Lucidchart-style Smart Auto-Connecting Line (Elbow / Curved / Straight)
  | 'pen'            // P: Cubic Bezier vector path pen tool
  | 'rect'           // U: Vector rectangle
  | 'ellipse'        // O: Vector ellipse
  | 'text'           // T: Crisp UI typography tool
  | 'autoshape'      // JS Programmable AutoShape placement tool
  // Osito Web Section
  | 'slice'          // K: Web Slice Tool - Draw, select, move & resize Retina export slices
  // View Section
  | 'hand'           // H / Space: Pan canvas
  | 'zoom';          // Z: Zoom loupe

export interface BezierNode {
  id: string;
  /** X coordinate relative to the object's (x, y) origin */
  x: number;
  /** Y coordinate relative to the object's (x, y) origin */
  y: number;
  /** Incoming control handle X (relative to object origin) */
  cp1x: number;
  /** Incoming control handle Y (relative to object origin) */
  cp1y: number;
  /** Outgoing control handle X (relative to object origin) */
  cp2x: number;
  /** Outgoing control handle Y (relative to object origin) */
  cp2y: number;
  pointType: 'corner' | 'smooth' | 'symmetric';
}

export interface LiveShadowFilter {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export type ComponentStateId = 'default' | 'hover' | 'active' | 'dark';

export interface ComponentStateOverride {
  fill?: string;
  fillGradientEnd?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  offsetY?: number;
  scale?: number;
  shadow?: LiveShadowFilter;
  /** Optional AutoShape parameter overrides per state (e.g. Toggle Switch ON vs OFF) */
  params?: Record<string, number | boolean | string>;
}

export interface CanvasSlice {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  formats: Array<'webp' | 'avif' | 'svg' | 'png'>;
  scales: Array<1 | 2 | 3>;
  targetObjectId?: string;
}

export interface LiveBitmapFilters {
  brightness: number; // -100 to 100, default 0
  contrast: number;   // -100 to 100, default 0
  blur: number;       // 0 to 20, default 0
  hueRotate: number;  // 0 to 360, default 0
  invert: boolean;
  pixelate: number;   // 1 to 32, default 1 (off)
}

export interface BaseCanvasObject {
  id: string;
  name: string;
  type: 'vector-path' | 'autoshape' | 'bitmap' | 'text';
  visible: boolean;
  locked: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  blendMode: GlobalCompositeOperation;
  fill: string;
  fillType: 'solid' | 'linear-gradient' | 'radial-gradient' | 'none';
  fillGradientEnd: string;
  stroke: string;
  strokeWidth: number;
  strokeAlign: 'center' | 'inside' | 'outside';
  /** Osito signature pixel-snap alignment (rounds coordinates & offsets odd strokes by +0.5px) */
  pixelSnap: boolean;
  shadow: LiveShadowFilter;
  /** Interactive Component State variants (Default / :hover / :active / Dark Mode) */
  activeState?: ComponentStateId;
  stateVariants?: Partial<Record<ComponentStateId, ComponentStateOverride>>;
  /** Optional interactive parameters (e.g. nested navbar/sidebar menu state in Preview Mode) */
  params?: Record<string, number | boolean | string>;
}

export type ConnectionPortId = 'n' | 'e' | 's' | 'w';

export type ConnectorRoutingStyle = 'elbow' | 'curved' | 'straight';

export interface ConnectorMetadata {
  fromObjectId: string;
  fromPort: ConnectionPortId;
  toObjectId: string;
  toPort: ConnectionPortId;
  routing: ConnectorRoutingStyle;
  startArrow?: boolean;
  endArrow?: boolean;
  label?: string;
}

export interface VectorPathObject extends BaseCanvasObject {
  type: 'vector-path';
  nodes: BezierNode[];
  closed: boolean;
  /** Optional Lucidchart-style live auto-connecting line metadata */
  connectorMeta?: ConnectorMetadata;
}

export interface AutoShapeObject extends BaseCanvasObject {
  type: 'autoshape';
  shapeDefId: string;
  params: Record<string, number | boolean | string>;
  /** Optional instance-level JS override */
  customCode?: string;
}

export interface BitmapObject extends BaseCanvasObject {
  type: 'bitmap';
  /** Base64 PNG data URL of the bitmap layer buffer */
  imageDataUrl: string;
  pixelWidth: number;
  pixelHeight: number;
  filters: LiveBitmapFilters;
}

export interface TextObject extends BaseCanvasObject {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: '400' | '500' | '600' | '700';
  textAlign: 'left' | 'center' | 'right';
  letterSpacing: number;
}

export type CanvasObject =
  | VectorPathObject
  | AutoShapeObject
  | BitmapObject
  | TextObject;

/**
 * Yellow Diamond Control Point on an Osito AutoShape
 */
export interface AutoShapeControlPoint {
  id: string;
  label: string;
  /** X position in local object space (0..width) */
  x: number;
  /** Y position in local object space (0..height) */
  y: number;
  cursor?: string;
}

export interface AutoShapeParamMeta {
  key: string;
  label: string;
  type: 'number' | 'boolean' | 'string';
  min?: number;
  max?: number;
  step?: number;
  defaultValue: number | boolean | string;
}

export type AutoShapeCategory =
  | 'User Interface'
  | 'Web & Layouts'
  | 'Data & Charts'
  | 'Badges & Icons'
  | 'Flow & Diagrams'
  | 'Creative & Vector'
  | 'Custom JS'
  | 'Basic'
  | 'Callouts & UI'
  | 'Mechanical & Technical';

export const AUTOSHAPE_GROUP_ORDER: AutoShapeCategory[] = [
  'User Interface',
  'Web & Layouts',
  'Data & Charts',
  'Badges & Icons',
  'Flow & Diagrams',
  'Creative & Vector',
  'Custom JS',
];

/**
 * Programmable JavaScript AutoShape Definition (.jsf style)
 */
export interface AutoShapeDefinition {
  id: string;
  name: string;
  category: AutoShapeCategory;
  description: string;
  iconName: string;
  isBuiltIn?: boolean;
  /** Whether clicking/dragging this AutoShape in Live Preview Mode mutates its live state */
  previewInteractive?: boolean;
  /** Short hint shown in Live Preview Mode when hovering over this AutoShape */
  previewHint?: string;
  paramSchema: AutoShapeParamMeta[];
  defaultParams: Record<string, number | boolean | string>;
  /**
   * Executable JavaScript source code defining:
   * - getControlPoints(width, height, params) => AutoShapeControlPoint[]
   * - onDragControlPoint(id, localX, localY, width, height, params) => Record<string, any>
   * - buildNodes(width, height, params) => { nodes: BezierNode[], closed: boolean }[]
   *   OR drawCustom(ctx, width, height, params, style)
   */
  jsSourceCode: string;
}

export interface PixelSelection {
  active: boolean;
  /** Target bitmap object ID (or null for canvas-space marquee) */
  targetBitmapId: string | null;
  bounds: { x: number; y: number; width: number; height: number };
  /** Canvas-sized or bounds-sized alpha mask (0..255) for arbitrary selections (Magic Wand, Oval, Lasso, Feather) */
  mask: Uint8Array | null;
  maskWidth: number;
  maskHeight: number;
  /** Polygon points for active lasso or outline rendering */
  outlinePolygons: Array<Array<{ x: number; y: number }>>;
  /** Floating pixel layer when dragging selected pixels with Pointer/Marquee tool */
  floatingPixels: {
    imageDataUrl: string;
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

export interface ToolOptions {
  // Bitmap Selection options
  selectionOperation: 'new' | 'add' | 'subtract' | 'intersect';
  wandTolerance: number;      // 0..255 (default 32)
  wandContiguous: boolean;    // default true
  selectionFeather: number;   // 0..30 px
  selectionAntiAlias: boolean;
  // Brush / Pencil / Eraser options
  brushSize: number;          // 1..100 px
  brushHardness: number;      // 0..100 %
  brushOpacity: number;       // 1..100 %
  // Default vector/bitmap colors
  primaryColor: string;       // Fill / Brush color
  secondaryColor: string;     // Stroke color
  defaultStrokeWidth: number;
  defaultPixelSnap: boolean;
  // Active AutoShape ID
  activeAutoShapeId: string;
}

export interface GridAndSnapSettings {
  canvasWidth: number;
  canvasHeight: number;
  canvasBackground: 'dark-checker' | 'light-checker' | 'transparent' | 'white' | 'slate';
  zoom: number;               // e.g. 0.5, 1, 2, 4, 8
  panX: number;
  panY: number;
  showPixelGrid: boolean;     // Automatically shows 1px grid at zoom >= 4
  showMajorGrid: boolean;     // Shows layout grid (e.g. 8px or 16px)
  gridSize: number;           // Default 8 or 16
  snapToGrid: boolean;        // Snap coordinates to gridSize
  snapToPixel: boolean;       // Strict 1px integer coordinate snapping (Osito mode)
  snapToObjects: boolean;     // Smart alignment guides against other objects
  showRulers: boolean;
  showSlices?: boolean;       // Show Web Slice overlays on canvas
  showToolHints?: boolean;    // Show or hide the middle-top contextual tool tips bar
  canvasViewMode?: 'design' | 'slice' | 'preview'; // Top-left Canvas View Mode Switcher
  sliceToolMode?: 'slice' | 'crop'; // Whether 'crop' (C) draws web export slices or crops document
  guides: Array<{ id: string; orientation: 'horizontal' | 'vertical'; position: number }>;
}

export interface SmartGuideLine {
  orientation: 'horizontal' | 'vertical';
  position: number;
  start: number;
  end: number;
  label?: string;
}

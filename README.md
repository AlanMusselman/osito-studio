# Osito Studio 4.0 (Evolve MX Studio) — Macromedia Fireworks MX Hybrid Pixel + Vector + JS AutoShape Engine

A pixel-perfect hybrid bitmap, cubic Bezier vector, and programmable JavaScript AutoShape design application inspired by **Macromedia Fireworks MX**, engineered for instant zero-install sharing (`dist/Osito_Fireworks_Studio_Standalone.html`), local studio execution, and **Google AI Studio (Cloud Run)** deployment.

---

## What Makes Osito Studio 4.0 Stand Out

1. **Unified Hybrid Bitmap + Cubic Bezier Vector + JS AutoShape Canvas (`src/components/HybridCanvas.tsx`)**
   - Edit **Raster Bitmaps**, **Cubic Bezier Vector Paths**, **125+ Programmable JavaScript AutoShapes**, **Lucidchart-Style Magnetic Flow Connectors**, and **UI Typography** on the exact same canvas and within the same Z-ordered layer hierarchy.
   - **1px Pixel-Perfect Rendering**: Automatic integer coordinate rounding (`Math.round`) and `+0.5px` pixel-center stroke offset for odd stroke widths (`1px`, `3px`, `5px`) so UI wireframes, icons, and borders never blur across half-pixels.
   - **Stroke Alignment & Component States**: Supports Fireworks MX `Inside`, `Center`, and `Outside` stroke alignment plus interactive `:default`, `:hover`, and `:active` state overrides testable live in **Preview Mode (`F12`)**.
   - **400%+ Pixel Loupe & Auto-Snap Grids**: Automatic `1px` pixel grid at `>= 400%` zoom, customizable layout grids (`8px`, `10px`, `16px`, `32px`), top/left pixel rulers, and dynamic Smart Alignment Guides.

2. **Authentic Macromedia Fireworks MX Selection & Bitmap Retouching Suite (`src/engine/bitmapEngine.ts`)**
   - **Pointer Tool (`V` / `0`)**: Black arrow — selects whole objects, scales via 8-point transform handles, drags yellow `◆` AutoShape handles, or floats and moves pixels inside an active Marching Ants marquee.
   - **Subselection Tool (`A` / `1`)**: White hollow arrow — selects and manipulates individual cubic Bezier anchor nodes (`Corner`, `Smooth`, `Symmetric`) and tangent handles (`cp1`, `cp2`).
   - **Rectangular Marquee (`M`), Oval Marquee, Freehand Lasso (`L`), Magic Wand (`W`)**: Pixel selection with boolean modes (`New`, `+Add (Shift)`, `-Subtract (Alt)`, `Intersect`), feathering (`0–30px`), adjustable color tolerance (`0–255`), and animated **Marching Ants**.
   - **1-Click Smart Background Removal & Bezier Vectorization**: Knock out contiguous background pixels or trace any bitmap selection directly into editable cubic Bezier vector nodes.
   - **1px Aliased Pixel Pencil (`Y`), Soft Brush (`B`), Eraser (`E`), Paint Bucket (`G`), Eyedropper (`I`)**: Raster painting clipped automatically to active Marching Ants selections.

3. **125+ Programmable JavaScript AutoShapes (`.JSF` Smart Shapes Engine — `src/engine/autoshapes.ts` & `src/components/AutoShapeCodeStudio.tsx`)**
   - Drag live on-canvas **Yellow Diamond Control Handles (`◆`)** to morph stars, precision gears, chamfered HUD frames, rotary gauges, isometric 3D cubes, sticky navbars, mega-menus, and architecture nodes.
   - **Live JS AutoShape Code Studio (`F9`)**: Inspect or modify any AutoShape's JavaScript (`getControlPoints`, `onDragControlPoint`, `buildPaths`), or generate brand-new custom AutoShapes in JavaScript using Gemini AI (`@google/genai`).

4. **AI Strategy Co-Pilot, Creative Generators & 6 Flagship Showcase Presets (`src/engine/creationEngine.ts` & `src/engine/deepResearchEngine.ts`)**
   - **Top-Bar `✦ Presets (1/6) ▾` + `▸` Switcher**: Cycle through 6 complete, multi-layer showcase scenes in 1 click:
     1. *Flagship Fireworks MX Hybrid Lab* (Default)
     2. *Autonomous Security Drone & Fleet AI Website* (with live nested flyout menus in Preview mode)
     3. *Apple-Style Bento Hardware & Telemetry Grid*
     4. *Executive AI & Drone Competitive Strategy War-Room* (25+ layers)
     5. *AI Telemetry & Executive KPI Dashboard*
     6. *System Architecture & Magnetic Flow Blueprint*
   - **Universal `Ctrl+K` / `⌘+K` Command Palette**: Type any brand or industry to synthesize an ICP & competitor dossier, spawn a tailored 100% vector website layout, or run a **1-Click WCAG 2.2 Auto-Polish** across the canvas.

5. **Multi-Scale Retina `.ZIP` Slice Exporter & Interactive `.HTML` Presentation (`src/engine/sliceZipExporter.ts`)**
   - Draw Web Slices (`K`) and batch-export `@1x`, `@2x`, and `@3x` Retina assets (`WebP`, `AVIF`, `PNG`, `SVG`) into a single `.ZIP` bundle.
   - Export any canvas as a standalone **Interactive HTML Showcase (`.html`)** with `@2x` Retina PNG + live SVG vector toggle, 1px pixel grid loupe, layer manifest, and click-to-copy CSS color tokens.

---

## Effortless Sharing (Zero-Install Single HTML File)

Every `npm run build` automatically compiles **both** the standard Vite `dist/` folder **and** a 100% self-contained single-file application:

- **Single-File Full Studio (`file://` Ready)**:
  `dist/Osito_Fireworks_Studio_Standalone.html`
  *(Double-click directly in Windows Explorer / macOS Finder, or send via email, Slack, Teams, or OneDrive — zero server or installation required!)*

---

## Running & Building Locally

```powershell
cd evolve-fireworks-studio
npm.cmd install
npm.cmd run dev
# Or build dist/ + dist/Osito_Fireworks_Studio_Standalone.html:
npm.cmd run build
```

---

## Publishing via Google AI Studio (Cloud Run)

1. Click the **"Share & Publish"** button in the top-right header of the app.
2. Open the **Publish to Google AI Studio (Cloud Run)** tab and either upload the project folder to [Google AI Studio Apps](https://aistudio.google.com/apps) or copy the **Master Google AI Studio Build Specification**.
3. Click **Publish** in Google AI Studio to deploy a live, shareable URL backed by **Google Cloud Run**.

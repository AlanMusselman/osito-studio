import React, { useState } from 'react';
import {
  X,
  Rocket,
  Download,
  Copy,
  Check,
  ExternalLink,
  FileImage,
  FileCode,
  FileJson,
  Sparkles,
  Cloud,
  FolderGit2,
  Share2,
  Eye,
  Layers,
  Globe,
  CheckCircle2,
} from 'lucide-react';

export interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportPng: () => void;
  onExportSvg: () => void;
  onExportProjectJson: () => void;
  onExportInteractiveHtml?: () => void;
  onExportCleanWebsiteHtml?: () => void;
  onExportReactTailwindAppZip?: () => void;
  onLaunchPublishedSiteView?: () => void;
  onLoadShowcasePreset?: (presetIndex: number) => void;
  onTogglePreviewMode?: () => void;
  activeShowcaseIndex?: number;
  objectCount?: number;
  autoShapeCount?: number;
  uxScore?: number;
  uxGrade?: string;
}

const EXECUTIVE_SHARE_SUMMARY = `✦ Osito Studio 4.0 (Macromedia Fireworks MX × AI Design Engine)
A pixel-perfect hybrid bitmap, cubic Bezier vector, and programmable JavaScript AutoShape studio:
• Hybrid Canvas Engine: Edit raster bitmaps (Marquee, Magic Wand, 1px Pixel Pencil), Cubic Bezier vector nodes (Subselect tool), and UI typography in one unified Z-ordered layer stack with automatic 1px pixel-center stroke snapping.
• 125+ Programmable JS AutoShapes (.JSF Engine): Drag yellow diamond (◆) on-canvas control handles to morph stars, gears, rotary gauges, isometric cubes, and interactive UI components—or edit their live JS code in the built-in Code Studio.
• Live Interactive Preview Mode (F12): Test multi-level nested navbar dropdowns and :hover/:active component states directly on the canvas.
• AI Strategy & Creative Generators: 1-Click Deep Research & Competitive Strategy War-Room, 6-Variation Vector Logo Studio, Full Website Layout Generator, and WCAG 2.2 Auto-Polish Engine.
• Multi-Scale Retina Exporter: Batch-export @1x/@2x/@3x WebP, AVIF, PNG & SVG slices into a production .ZIP archive or standalone interactive HTML showcase.`;

const MASTER_AI_STUDIO_BUILD_PROMPT = `Build "Osito Studio 4.0 (Pixel + Vector Editor)", a professional web-based hybrid bitmap & vector graphic design application inspired by Macromedia Fireworks MX with programmable JavaScript Smart Shapes.

Core Architecture & Features Required:
1. Unified Hybrid Canvas Engine (HTML5 Canvas + SVG Overlay):
   - Seamless coexistence of Raster Bitmap layers, Cubic Bezier Vector Paths, Crisp UI Typography, and Programmable JavaScript AutoShapes in a single Z-ordered layer stack.
   - Osito 1px Pixel-Snap Engine: Integer coordinate rounding and +0.5px odd-stroke alignment so 1px borders and UI chrome render razor-sharp without blurry anti-aliasing.
   - Interactive Zoom Loupe (up to 800%+) with automatic 1px pixel grid overlay at >=400% zoom, rulers, and smart alignment guides.

2. Osito Hybrid Tool Dock (Left):
   - SELECT: Pointer (V - black arrow for object transform & floating pixel marquees), Subselection (A - white arrow for cubic Bezier node/handle editing & AutoShape diamond control handles), Select Behind, Scale (Q), Crop (C).
   - BITMAP: Rectangular Marquee (M), Oval Marquee, Freehand Lasso (L), Magic Wand (W with 0-255 color tolerance & contiguous flood-fill), Paint Brush (B), 1px Aliased Pixel Pencil (Y), Eraser (E), Paint Bucket (G), Eyedropper (I).
   - VECTOR & JS AUTOSHAPES: Smart Connector (X), Line (N), Cubic Bezier Pen (P), Rectangle (U), Ellipse (O), Text (T), and Programmable JS AutoShapes flyout.

3. Programmable JavaScript AutoShape Studio (.JSF Architecture):
   - Live JS Code Editor + Gemini AI AutoShape Generator (@google/genai) allowing users to write or prompt custom procedural shapes with interactive diamond control points (getControlPoints, onDragControlPoint, buildNodes).
   - Built-in JS AutoShapes: Chamfered HUD Frame, Smart Rounded Rectangle, Star/Cog Gear, Speech Callout, Pie/Donut Gauge, Isometric 3D Cube, Technical Dimension Arrow, and Interactive Web Components.

4. Osito Bottom Property Inspector & Right Hybrid Layers Dock:
   - Context-sensitive bottom inspector switching automatically between Document Grid settings, Bitmap Marquee & Live Filters, Vector Node converters, and dynamic JS AutoShape parameter sliders.
   - 1-click export to Multi-Scale Retina .ZIP (@1x/@2x/@3x), Interactive HTML Showcase, Pixel-Perfect PNG, Clean SVG, and .osito.json project files.`;

const SHOWCASE_PRESET_CARDS = [
  {
    index: 0,
    title: '1. Flagship Fireworks MX Hybrid Lab',
    badge: 'DEFAULT LAB',
    desc: 'Bitmap Marquee/Magic Wand card + Cubic Bezier wave + ◆ JS AutoShapes + Magnetic Connectors + Nested Navbar.',
  },
  {
    index: 1,
    title: '2. Autonomous Security Drone & Fleet AI',
    badge: 'LIVE PREVIEW',
    desc: 'High-fidelity vector SaaS launch page with interactive multi-level nested flyout menus in Preview mode.',
  },
  {
    index: 2,
    title: '3. Apple-Style Bento Hardware Grid',
    badge: 'BENTO UI',
    desc: 'Asymmetric 4-cell modular Bento showcase with benchmark bars, W3C color tokens & codegen terminal.',
  },
  {
    index: 3,
    title: '4. Executive AI & Drone Strategy War-Room',
    badge: '25+ LAYERS',
    desc: 'Deep Research competitive teardown board with ICP personas, competitor matrix & conversion funnel.',
  },
  {
    index: 4,
    title: '5. AI Telemetry & Executive KPI Dashboard',
    badge: 'ANALYTICS',
    desc: 'Collapsible sidebar, 3 KPI sparkline cards, and 12-month vector bar chart with hover states.',
  },
  {
    index: 5,
    title: '6. System Architecture & Flow Blueprint',
    badge: 'AUTO-ROUTING',
    desc: 'Visual information architecture & funnel diagram wired with live magnetic orthogonal elbow connectors.',
  },
];

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  onExportPng,
  onExportSvg,
  onExportProjectJson,
  onExportInteractiveHtml,
  onExportCleanWebsiteHtml,
  onExportReactTailwindAppZip,
  onLaunchPublishedSiteView,
  onLoadShowcasePreset,
  onTogglePreviewMode,
  activeShowcaseIndex = 0,
  objectCount = 46,
  autoShapeCount = 125,
  uxScore = 98,
  uxGrade = 'A+',
}) => {
  const [activeTab, setActiveTab] = useState<'share' | 'publish' | 'export'>('share');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);
  const [copiedRepo, setCopiedRepo] = useState(false);

  if (!isOpen) return null;

  const standaloneFilePath =
    'C:\\Users\\Alan Musselman\\OneDrive\\Documents\\personalai\\evolve-fireworks-studio\\dist\\Osito_Fireworks_Studio_Standalone.html';
  const githubRepoUrl = 'https://github.com/AlanMusselman/osito-fireworks-studio';

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(MASTER_AI_STUDIO_BUILD_PROMPT);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyPitch = async () => {
    try {
      await navigator.clipboard.writeText(EXECUTIVE_SHARE_SUMMARY);
      setCopiedPitch(true);
      setTimeout(() => setCopiedPitch(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyStandalonePath = async () => {
    try {
      await navigator.clipboard.writeText(standaloneFilePath);
      setCopiedPath(true);
      setTimeout(() => setCopiedPath(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      style={{ zIndex: 9999 }}
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none rounded-none"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl bg-[#111111] border border-[#484848] rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#0a0a0a] border-b border-[#2e2e2e] flex items-center justify-between rounded-none">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-[#16222f] border border-cyan-500/60 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#f5f5f5] flex items-center gap-2">
                <span>Share, Live Showcase &amp; Cloud Publish Studio</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-none bg-cyan-500/15 text-cyan-300 border border-cyan-500/40">
                  Single-File HTML + Cloud Run Ready
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-none bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                  UX {uxScore}% ({uxGrade})
                </span>
              </h2>
              <p className="text-[11px] text-[#a3a3a3]">
                Share Osito Studio 4.0 as a zero-install single HTML file, export an interactive presentation, or deploy to Google Cloud Run
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-none text-[#a3a3a3] hover:text-[#ffffff] hover:bg-[#242424] border border-transparent hover:border-[#484848] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-2.5 bg-[#161616] border-b border-[#2e2e2e] flex items-center gap-2 rounded-none flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('share')}
            className={`px-4 py-2 text-xs font-semibold rounded-none border-t border-x flex items-center gap-2 transition-colors ${
              activeTab === 'share'
                ? 'bg-[#e5e5e5] border-[#ffffff] text-[#0a0a0a]'
                : 'bg-transparent border-transparent text-[#a3a3a3] hover:text-[#e5e5e5]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. Instant Share &amp; 6 Showcase Presets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('publish')}
            className={`px-4 py-2 text-xs font-semibold rounded-none border-t border-x flex items-center gap-2 transition-colors ${
              activeTab === 'publish'
                ? 'bg-[#e5e5e5] border-[#ffffff] text-[#0a0a0a]'
                : 'bg-transparent border-transparent text-[#a3a3a3] hover:text-[#e5e5e5]'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>2. Publish to Google AI Studio (Cloud Run)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 text-xs font-semibold rounded-none border-t border-x flex items-center gap-2 transition-colors ${
              activeTab === 'export'
                ? 'bg-[#e5e5e5] border-[#ffffff] text-[#0a0a0a]'
                : 'bg-transparent border-transparent text-[#a3a3a3] hover:text-[#e5e5e5]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>3. Export Artwork &amp; Interactive HTML (.HTML / .PNG / .SVG)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#d4d4d4]">
          {activeTab === 'share' ? (
            <>
              {/* Clean Live Website Mode Banner: Explicitly Hides 'Share & Publish' Button & All Studio UI */}
              <div className="p-3.5 rounded-none bg-[#161f16] border border-emerald-400/60 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-none bg-emerald-400 text-[#0a0a0a] font-bold">
                      Clean Visitor View · Zero Studio UI
                    </span>
                    <span className="text-xs font-bold text-[#ffffff]">
                      Hide the &ldquo;Share &amp; Publish&rdquo; Button &amp; All Editor Toolbars for Live Visitors
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300">
                    URL Param: <code className="bg-[#0a0a0a] px-1.5 py-0.5 border border-emerald-500/40">?published=1</code>
                  </span>
                </div>
                <p className="text-[11px] text-[#d4d4d4] leading-relaxed">
                  In the Studio editor, clicking <strong>Share &amp; Publish</strong> opens this deployment hub. When you launch <strong>Clean Published View</strong>, export a <strong>Clean Production <code className="font-mono text-emerald-300">index.html</code></strong>, or share a hosted link ending in <code className="font-mono text-emerald-300">?published=1</code>, the <strong>Share &amp; Publish button, Top Bar, Left Tool Dock, Right Layers Panel, and Bottom Inspector completely disappear</strong> so visitors only see your live website.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  {onLaunchPublishedSiteView && (
                    <button
                      type="button"
                      onClick={onLaunchPublishedSiteView}
                      className="px-3 py-1.5 rounded-none bg-emerald-400 hover:bg-emerald-300 text-[#0a0a0a] font-bold text-[11px] flex items-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Launch Clean Published View (Hide All Studio Buttons)</span>
                    </button>
                  )}
                  {onExportCleanWebsiteHtml && (
                    <button
                      type="button"
                      onClick={onExportCleanWebsiteHtml}
                      className="px-3 py-1.5 rounded-none bg-[#e5e5e5] hover:bg-[#ffffff] text-[#0a0a0a] font-semibold text-[11px] flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Clean Production index.html (No Studio UI)</span>
                    </button>
                  )}
                  {onExportReactTailwindAppZip && (
                    <button
                      type="button"
                      onClick={onExportReactTailwindAppZip}
                      className="px-2.5 py-1.5 rounded-none bg-[#1c1c1c] hover:bg-[#2e2e2e] text-[#e5e5e5] border border-[#484848] font-mono text-[11px] flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Download Full React + Tailwind .ZIP</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Hero Shareability Banner: Zero-Server Single-File App + Interactive HTML Export */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-none bg-[#141d26] border border-cyan-500/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-none bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                      Zero-Install Single-File Full Studio
                    </span>
                    <Globe className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h3 className="text-xs font-bold text-[#ffffff]">
                    Share the Entire App as 1 Double-Clickable HTML File
                  </h3>
                  <p className="text-[11px] text-[#d4d4d4] leading-relaxed">
                    Every production build compiles a 100% self-contained single-file bundle with all CSS &amp; engines inlined. Anyone can double-click it directly from email, Slack, Teams, or OneDrive (<code className="font-mono text-cyan-300">file://</code>) with zero server required:
                  </p>
                  <div className="p-2 bg-[#0a0a0a] border border-[#2e2e2e] font-mono text-[10px] text-cyan-200 break-all select-all">
                    {standaloneFilePath}
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={handleCopyStandalonePath}
                      className="px-3 py-1.5 rounded-none bg-[#e5e5e5] hover:bg-[#ffffff] text-[#0a0a0a] font-semibold text-[11px] flex items-center gap-1.5 transition"
                    >
                      {copiedPath ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied File Path!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Standalone .HTML Path</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyPitch}
                      className="px-2.5 py-1.5 rounded-none bg-[#1c1c1c] hover:bg-[#2e2e2e] text-[#e5e5e5] border border-[#484848] font-mono text-[11px] flex items-center gap-1.5 transition"
                    >
                      {copiedPitch ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied Pitch!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Feature Summary</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-none bg-[#14221c] border border-emerald-500/40 space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-none bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                        1-Click Client &amp; Team Showcase File
                      </span>
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h3 className="text-xs font-bold text-[#ffffff]">
                      Download Interactive HTML Presentation of Current Canvas
                    </h3>
                    <p className="text-[11px] text-[#d4d4d4] leading-relaxed">
                      Exports your current {objectCount}-layer design into a sleek, standalone dark-mode <code className="font-mono text-emerald-300">.html</code> showcase page with high-DPI PNG + live inline SVG toggle, interactive 2x/4x pixel loupe, layer manifest, and click-to-copy CSS color tokens.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    {onExportInteractiveHtml && (
                      <button
                        type="button"
                        onClick={onExportInteractiveHtml}
                        className="px-3 py-1.5 rounded-none bg-emerald-400 hover:bg-emerald-300 text-[#0a0a0a] font-bold text-[11px] flex items-center gap-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Interactive Showcase (.HTML)</span>
                      </button>
                    )}
                    {onTogglePreviewMode && (
                      <button
                        type="button"
                        onClick={() => {
                          onTogglePreviewMode();
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-none bg-[#1c1c1c] hover:bg-[#2e2e2e] text-[#e5e5e5] border border-[#484848] font-mono text-[11px] flex items-center gap-1.5 transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Live Preview (F12)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 6 Instant Live Showcase Presets Grid */}
              <div className="rounded-none bg-[#0d0d0d] border border-[#2e2e2e] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-[#ffffff]">
                      6 Instant "WOW" Showcase Scenes (Click Any Scene to Load Live on Canvas)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#a3a3a3]">
                    {autoShapeCount} Programmable JS AutoShapes • {objectCount} Active Layers
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {SHOWCASE_PRESET_CARDS.map((card) => {
                    const isCurrent = activeShowcaseIndex === card.index;
                    return (
                      <button
                        key={card.index}
                        type="button"
                        onClick={() => {
                          onLoadShowcasePreset?.(card.index);
                          onClose();
                        }}
                        className={`p-3 rounded-none border text-left transition flex flex-col justify-between ${
                          isCurrent
                            ? 'bg-[#1a2634] border-cyan-400 text-white'
                            : 'bg-[#161616] hover:bg-[#222222] border-[#2e2e2e] hover:border-[#666666] text-[#d4d4d4]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-[#242424] text-cyan-300 border border-[#404040]">
                              {card.badge}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-mono text-emerald-300 flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Active
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-[#ffffff] mb-1">
                            {card.title}
                          </div>
                          <p className="text-[10px] text-[#a3a3a3] leading-relaxed">
                            {card.desc}
                          </p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-[#262626] text-[10px] font-mono text-cyan-300 flex items-center justify-between">
                          <span>Load Live Scene</span>
                          <span>&rarr;</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : activeTab === 'publish' ? (
            <>
              {/* Fast Track: Put Your Clean Website Online in 60 Seconds (Zero Studio UI) */}
              <div className="p-3.5 rounded-none bg-[#14221c] border border-emerald-500/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-none bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                    Fastest Path · Put Your Designed Website Online (No Studio UI / No Share Button)
                  </span>
                  <Globe className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-xs font-bold text-[#ffffff]">
                  Next Steps to Get Your Clean Website Online in 60 Seconds
                </h3>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#d4d4d4] leading-relaxed">
                  <li>
                    Click <strong>Download Clean Production index.html</strong> below (or <strong>Download Full React + Tailwind .ZIP</strong> for a full multi-file Vite codebase). Neither export includes the Studio toolbars or the <em>Share &amp; Publish</em> button.
                  </li>
                  <li>
                    <strong>Option 1 (Netlify Drop — 30 sec, Free):</strong> Open{' '}
                    <a
                      href="https://app.netlify.com/drop"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-300 underline hover:text-white inline-flex items-center gap-0.5"
                    >
                      app.netlify.com/drop
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>{' '}
                    and drag-and-drop your downloaded <code className="font-mono text-white">index.html</code> (placed inside any folder) for an instant <code className="font-mono text-emerald-300">https://...netlify.app</code> live URL.
                  </li>
                  <li>
                    <strong>Option 2 (Vercel / Cloudflare Pages / Firebase Hosting):</strong> Unzip the <strong>React + Tailwind .ZIP</strong>, push to GitHub, or run <code className="font-mono text-white">npx vercel</code> / <code className="font-mono text-white">firebase deploy --only hosting</code>.
                  </li>
                  <li>
                    <strong>Option 3 (Live Interactive Canvas via ?published=1):</strong> If you deploy the full Osito Studio app (via Cloud Run or <code className="font-mono text-white">dist/</code>), share the link with <code className="font-mono text-emerald-300">?published=1</code> at the end—it automatically boots into Clean Published Site Mode with all Studio buttons hidden!
                  </li>
                </ol>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {onExportCleanWebsiteHtml && (
                    <button
                      type="button"
                      onClick={onExportCleanWebsiteHtml}
                      className="px-3 py-1.5 rounded-none bg-emerald-400 hover:bg-emerald-300 text-[#0a0a0a] font-bold text-[11px] flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Clean Production index.html</span>
                    </button>
                  )}
                  {onExportReactTailwindAppZip && (
                    <button
                      type="button"
                      onClick={onExportReactTailwindAppZip}
                      className="px-3 py-1.5 rounded-none bg-[#e5e5e5] hover:bg-[#ffffff] text-[#0a0a0a] font-semibold text-[11px] flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Full React + Tailwind .ZIP</span>
                    </button>
                  )}
                  {onLaunchPublishedSiteView && (
                    <button
                      type="button"
                      onClick={onLaunchPublishedSiteView}
                      className="px-2.5 py-1.5 rounded-none bg-[#1c1c1c] hover:bg-[#2e2e2e] text-[#e5e5e5] border border-[#484848] font-mono text-[11px] flex items-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Preview Clean Site Now (Hide Studio UI)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Step-by-Step Deployment Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-none bg-[#161616] border border-[#2e2e2e] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-none bg-[#242424] text-[#e5e5e5] border border-[#484848]">
                      Method A · Direct GitHub Link to Google AI Studio
                    </span>
                    <FolderGit2 className="w-4 h-4 text-[#d4d4d4]" />
                  </div>
                  <h3 className="text-xs font-bold text-[#ffffff]">
                    Link GitHub Repo Directly in Google AI Studio
                  </h3>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#d4d4d4] leading-relaxed">
                    <li>
                      Open{' '}
                      <a
                        href="https://aistudio.google.com/apps"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#ffffff] underline hover:text-[#d4d4d4] inline-flex items-center gap-0.5"
                      >
                        aistudio.google.com/apps
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>{' '}
                      and select <strong>Import from GitHub / Connect GitHub</strong>.
                    </li>
                    <li>
                      Select or paste your dedicated root-level repository:{' '}
                      <a
                        href={githubRepoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-300 font-mono underline hover:text-white"
                      >
                        AlanMusselman/osito-fireworks-studio
                      </a>{' '}
                      (contains <code className="font-mono">metadata.json</code>,{' '}
                      <code className="font-mono">package.json</code>, and{' '}
                      <code className="font-mono">src/</code> at the repo root).
                    </li>
                    <li>
                      Click <strong>Publish / Deploy to Cloud Run</strong> in the top-right
                      bar of Google AI Studio for an instant live shareable URL!
                    </li>
                  </ol>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(githubRepoUrl);
                          setCopiedRepo(true);
                          setTimeout(() => setCopiedRepo(false), 2500);
                        } catch {
                          // Fallback
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-none bg-[#e5e5e5] hover:bg-[#ffffff] text-[#0a0a0a] font-semibold text-[11px] flex items-center gap-1.5 transition"
                    >
                      {copiedRepo ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied GitHub Repo URL!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy GitHub Repo URL</span>
                        </>
                      )}
                    </button>
                    <a
                      href={githubRepoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 rounded-none bg-[#1c1c1c] hover:bg-[#2e2e2e] text-[#e5e5e5] border border-[#484848] font-mono text-[11px] inline-flex items-center gap-1.5 transition"
                    >
                      <span>Open on GitHub</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="p-3.5 rounded-none bg-[#161616] border border-[#2e2e2e] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-none bg-[#242424] text-[#e5e5e5] border border-[#484848]">
                      Method B · 1-Click Build Mode Prompt
                    </span>
                    <Sparkles className="w-4 h-4 text-[#d4d4d4]" />
                  </div>
                  <h3 className="text-xs font-bold text-[#ffffff]">
                    Generate or Fork Directly in AI Studio Build Mode
                  </h3>
                  <p className="text-[11px] text-[#d4d4d4] leading-relaxed">
                    You can also copy the complete architectural specification below and
                    paste it straight into{' '}
                    <strong>Google AI Studio &rarr; Build an App</strong>. AI Studio
                    automatically injects <code className="font-mono">GEMINI_API_KEY</code>{' '}
                    for the AI JS AutoShape Generator.
                  </p>
                  <a
                    href="https://aistudio.google.com/apps"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-[#e5e5e5] hover:bg-[#ffffff] text-[#0a0a0a] border border-[#ffffff] text-[11px] font-semibold transition-colors"
                  >
                    <span>Open Google AI Studio Apps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Copyable Master Build Prompt */}
              <div className="rounded-none bg-[#0a0a0a] border border-[#2e2e2e] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-semibold text-[#e5e5e5]">
                    Master Google AI Studio Build Specification
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="px-3 py-1 rounded-none bg-[#242424] hover:bg-[#e5e5e5] text-[#ffffff] hover:text-[#0a0a0a] border border-[#737373] text-[11px] font-mono flex items-center gap-1.5 transition-all"
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Master Google AI Studio Build Prompt</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-[10px] font-mono text-[#a3a3a3] bg-[#111111] p-2.5 rounded-none border border-[#242424] max-h-40 overflow-y-auto whitespace-pre-wrap select-all">
                  {MASTER_AI_STUDIO_BUILD_PROMPT}
                </pre>
              </div>
            </>
          ) : (
            /* Tab 3: Export Artwork & Project */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 py-2">
              {onExportInteractiveHtml && (
                <button
                  type="button"
                  onClick={onExportInteractiveHtml}
                  className="p-4 rounded-none bg-[#14221c] hover:bg-[#1b2f26] border border-emerald-500/50 flex flex-col items-start justify-between text-left transition-all group"
                >
                  <div className="w-9 h-9 rounded-none bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mb-3">
                    <Globe className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#ffffff] mb-1">
                      Interactive HTML Showcase
                    </div>
                    <p className="text-[11px] text-[#a3a3a3]">
                      Self-contained single-file HTML presentation with PNG + SVG toggle, 4x pixel loupe, layer manifest &amp; color tokens.
                    </p>
                  </div>
                  <span className="mt-3 text-[10px] font-mono text-emerald-300 font-semibold">
                    Download .HTML &rarr;
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={onExportPng}
                className="p-4 rounded-none bg-[#161616] hover:bg-[#242424] border border-[#2e2e2e] hover:border-[#888888] flex flex-col items-start justify-between text-left transition-all group"
              >
                <div className="w-9 h-9 rounded-none bg-[#242424] border border-[#484848] flex items-center justify-center mb-3">
                  <FileImage className="w-5 h-5 text-[#ffffff]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#ffffff] mb-1">
                    Crisp PNG (1x Pixel-Perfect)
                  </div>
                  <p className="text-[11px] text-[#a3a3a3]">
                    Renders all bitmaps, pixel-snapped vectors, and JS AutoShapes into a
                    lossless 32-bit PNG image.
                  </p>
                </div>
                <span className="mt-3 text-[10px] font-mono text-[#e5e5e5]">
                  Download .PNG &rarr;
                </span>
              </button>

              <button
                type="button"
                onClick={onExportSvg}
                className="p-4 rounded-none bg-[#161616] hover:bg-[#242424] border border-[#2e2e2e] hover:border-[#888888] flex flex-col items-start justify-between text-left transition-all group"
              >
                <div className="w-9 h-9 rounded-none bg-[#242424] border border-[#484848] flex items-center justify-center mb-3">
                  <FileCode className="w-5 h-5 text-[#ffffff]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#ffffff] mb-1">
                    Clean Vector / Hybrid SVG
                  </div>
                  <p className="text-[11px] text-[#a3a3a3]">
                    Exports cubic Bezier paths, procedural AutoShape geometry, and embedded
                    bitmap layers as standards-compliant SVG.
                  </p>
                </div>
                <span className="mt-3 text-[10px] font-mono text-[#e5e5e5]">
                  Download .SVG &rarr;
                </span>
              </button>

              <button
                type="button"
                onClick={onExportProjectJson}
                className="p-4 rounded-none bg-[#161616] hover:bg-[#242424] border border-[#2e2e2e] hover:border-[#888888] flex flex-col items-start justify-between text-left transition-all group"
              >
                <div className="w-9 h-9 rounded-none bg-[#242424] border border-[#484848] flex items-center justify-center mb-3">
                  <FileJson className="w-5 h-5 text-[#ffffff]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#ffffff] mb-1">
                    Osito Project (.osito.json)
                  </div>
                  <p className="text-[11px] text-[#a3a3a3]">
                    Saves all editable layers, Bezier nodes, custom JS AutoShape definitions,
                    and bitmap buffers.
                  </p>
                </div>
                <span className="mt-3 text-[10px] font-mono text-[#e5e5e5]">
                  Download .Osito.JSON &rarr;
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#0a0a0a] border-t border-[#2e2e2e] flex items-center justify-between text-[11px] text-[#a3a3a3] rounded-none">
          <span>Osito Studio 4.0 · Macromedia Fireworks MX Hybrid Vector + Pixel + JS AutoShape Engine</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-none bg-[#e5e5e5] hover:bg-[#ffffff] text-[#0a0a0a] font-semibold border border-[#ffffff] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

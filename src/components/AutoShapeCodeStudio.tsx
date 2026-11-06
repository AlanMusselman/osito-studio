import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import {
  X,
  Play,
  Plus,
  Trash2,
  Sparkles,
  Code2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Save,
  CopyPlus,
  Diamond,
  Eye,
  RotateCcw,
  KeyRound,
  Cpu,
} from 'lucide-react';
import {
  AUTOSHAPE_GROUP_ORDER,
  type AutoShapeDefinition,
  type AutoShapeObject,
  type AutoShapeParamMeta,
  type BezierNode,
} from '../types/editor';
import {
  AUTOSHAPE_STARTER_TEMPLATE,
  evaluateAutoShape,
  dragAutoShapeControlPoint,
  generateProceduralAutoShapeFromPrompt,
} from '../engine/autoshapes';
import { AutoShapeThumbnail } from './AutoShapeThumbnail';

export interface AutoShapeCodeStudioProps {
  isOpen: boolean;
  onClose: () => void;
  allDefinitions: AutoShapeDefinition[];
  selectedObject: AutoShapeObject | null;
  onUpdateInstanceCode: (
    objectId: string,
    customCode: string,
    updatedParams?: Record<string, any>
  ) => void;
  onSaveNewDefinition: (newDef: AutoShapeDefinition, insertToCanvas?: boolean) => void;
  onUpdateDefinition: (updatedDef: AutoShapeDefinition) => void;
}

const QUICK_AI_PROMPTS = [
  'A lightning bolt badge with waist thickness handle',
  'A circuit resistor symbol with adjustable leads',
  'A security shield crest with shoulder & curve handles',
  'A rounded swallowtail ribbon banner',
  'A Swiss cross icon with adjustable arm width',
  'A smooth Bezier heart with cleft depth handle',
];

export const AutoShapeCodeStudio: React.FC<AutoShapeCodeStudioProps> = ({
  isOpen,
  onClose,
  allDefinitions,
  selectedObject,
  onUpdateInstanceCode,
  onSaveNewDefinition,
  onUpdateDefinition,
}) => {
  const [activeDefId, setActiveDefId] = useState<string>('rounded-rect');
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  // Editable definition fields
  const [shapeName, setShapeName] = useState<string>('Smart Rounded Rectangle');
  const [shapeCategory, setShapeCategory] =
    useState<AutoShapeDefinition['category']>('Custom JS');
  const [shapeDescription, setShapeDescription] = useState<string>('');
  const [paramSchema, setParamSchema] = useState<AutoShapeParamMeta[]>([]);
  const [liveParams, setLiveParams] = useState<Record<string, any>>({});
  const [code, setCode] = useState<string>(AUTOSHAPE_STARTER_TEMPLATE);

  // Interactive preview state
  const [previewWidth, setPreviewWidth] = useState<number>(220);
  const [previewHeight, setPreviewHeight] = useState<number>(160);
  const [showBezierNodes, setShowBezierNodes] = useState<boolean>(true);
  const [draggingHandleId, setDraggingHandleId] = useState<string | null>(null);
  const [hoveredHandleId, setHoveredHandleId] = useState<string | null>(null);

  // AI prompt & status
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [userApiKey, setUserApiKey] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [aiGenerating, setAiGenerating] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'info' | 'warning';
    message: string;
  } | null>(null);

  const previewSvgRef = useRef<SVGSVGElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);

  // Sync studio state when opened or when selectedObject changes
  useEffect(() => {
    if (!isOpen) return;

    if (selectedObject) {
      const def =
        allDefinitions.find((d) => d.id === selectedObject.shapeDefId) || allDefinitions[0];
      if (def) {
        setIsCreatingNew(false);
        setActiveDefId(def.id);
        setShapeName(def.name);
        setShapeCategory(def.category);
        setShapeDescription(def.description);
        setParamSchema(def.paramSchema.map((p) => ({ ...p })));
        setLiveParams({ ...def.defaultParams, ...selectedObject.params });
        setCode(selectedObject.customCode || def.jsSourceCode);
        setPreviewWidth(Math.max(80, Math.min(280, Math.round(selectedObject.width))));
        setPreviewHeight(Math.max(80, Math.min(220, Math.round(selectedObject.height))));
        return;
      }
    }

    const initialDef =
      allDefinitions.find((d) => d.id === activeDefId) || allDefinitions[0];
    if (initialDef) {
      loadDefinitionIntoEditor(initialDef);
    }
  }, [isOpen, selectedObject?.id]);

  const loadDefinitionIntoEditor = (def: AutoShapeDefinition) => {
    setIsCreatingNew(false);
    setActiveDefId(def.id);
    setShapeName(def.name);
    setShapeCategory(def.category);
    setShapeDescription(def.description);
    setParamSchema(def.paramSchema.map((p) => ({ ...p })));
    setLiveParams({ ...def.defaultParams });
    setCode(def.jsSourceCode);
    setStatusBanner(null);
  };

  const handleStartNewCustom = () => {
    setIsCreatingNew(true);
    setActiveDefId('__new__');
    setShapeName('Custom Smart Notch Frame');
    setShapeCategory('Custom JS');
    setShapeDescription('Custom programmable Osito Smart Shape with diamond control handle.');
    const initialSchema: AutoShapeParamMeta[] = [
      {
        key: 'insetRatio',
        label: 'Notch Inset Ratio',
        type: 'number',
        min: 0.05,
        max: 0.45,
        step: 0.01,
        defaultValue: 0.22,
      },
    ];
    setParamSchema(initialSchema);
    setLiveParams({ insetRatio: 0.22 });
    setCode(AUTOSHAPE_STARTER_TEMPLATE);
    setStatusBanner({
      type: 'info',
      message: 'Started new Custom JS AutoShape template. Drag the diamond handle in the preview!',
    });
  };

  // Build transient definition for live preview evaluation
  const transientDef: AutoShapeDefinition = useMemo(() => {
    const defaults: Record<string, number | boolean | string> = {};
    paramSchema.forEach((p) => {
      defaults[p.key] = p.defaultValue;
    });
    return {
      id: isCreatingNew ? `custom-${Date.now()}` : activeDefId,
      name: shapeName || 'Untitled AutoShape',
      category: shapeCategory,
      description: shapeDescription,
      iconName: 'Sparkles',
      paramSchema,
      defaultParams: defaults,
      jsSourceCode: code,
    };
  }, [isCreatingNew, activeDefId, shapeName, shapeCategory, shapeDescription, paramSchema, code]);

  // Evaluate AutoShape in real time
  const evaluated = useMemo(() => {
    return evaluateAutoShape(transientDef, previewWidth, previewHeight, liveParams, code);
  }, [transientDef, previewWidth, previewHeight, liveParams, code]);

  // Convert BezierNode[] subpaths to individual SVG path `d` strings so multi-container
  // menus, dropdowns, and layouts render without evenodd hole cancellation.
  const svgSubPaths = useMemo(() => {
    return evaluated.paths.map((subPath, idx) => {
      const { nodes, closed } = subPath;
      if (!nodes || nodes.length === 0) return { d: '', closed: false, isOuter: false };
      const parts: string[] = [`M ${nodes[0].x.toFixed(2)} ${nodes[0].y.toFixed(2)}`];
      for (let i = 0; i < nodes.length - 1; i++) {
        const curr = nodes[i];
        const next = nodes[i + 1];
        parts.push(
          `C ${curr.cp2x.toFixed(2)} ${curr.cp2y.toFixed(2)}, ${next.cp1x.toFixed(2)} ${next.cp1y.toFixed(2)}, ${next.x.toFixed(2)} ${next.y.toFixed(2)}`
        );
      }
      if (closed && nodes.length > 1) {
        const last = nodes[nodes.length - 1];
        const first = nodes[0];
        parts.push(
          `C ${last.cp2x.toFixed(2)} ${last.cp2y.toFixed(2)}, ${first.cp1x.toFixed(2)} ${first.cp1y.toFixed(2)}, ${first.x.toFixed(2)} ${first.y.toFixed(2)} Z`
        );
      }
      return {
        d: parts.join(' '),
        closed,
        isOuter: idx === 0 && evaluated.paths.length > 1,
      };
    });
  }, [evaluated.paths]);

  // Coordinate origin inside the 360x260 preview viewport (dynamically centered around full geometry bounds
  // so protruding handles like speech-callout tails never clip at the bottom edge)
  const viewportW = 360;
  const viewportH = 260;
  const { originX, originY } = useMemo(() => {
    let minX = 0;
    let minY = 0;
    let maxX = previewWidth;
    let maxY = previewHeight;
    evaluated.paths.forEach((p) => {
      p.nodes.forEach((n) => {
        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x);
        maxY = Math.max(maxY, n.y);
      });
    });
    evaluated.controlPoints.forEach((cp) => {
      minX = Math.min(minX, cp.x - 8);
      minY = Math.min(minY, cp.y - 8);
      maxX = Math.max(maxX, cp.x + 8);
      maxY = Math.max(maxY, cp.y + 8);
    });
    const spanW = maxX - minX;
    const spanH = maxY - minY;
    return {
      originX: Math.round((viewportW - spanW) / 2 - minX),
      originY: Math.round((viewportH - spanH) / 2 - minY),
    };
  }, [evaluated.paths, evaluated.controlPoints, previewWidth, previewHeight]);

  // Compute non-overlapping, viewport-clamped tooltip positions for diamond control points
  const handleBadgePositions = useMemo(() => {
    const placed: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    const minLocalX = -originX + 6;
    const maxLocalX = viewportW - originX - 6;
    const minLocalY = -originY + 6;
    const maxLocalY = viewportH - originY - 6;

    return evaluated.controlPoints.map((cp) => {
      const boxW = Math.max(58, Math.round(cp.label.length * 6.2 + 10));
      const boxH = 18;
      // Flip to the left of the diamond handle when close to the right edge
      const preferLeft = cp.x + 10 + boxW > maxLocalX;
      let bx = preferLeft ? cp.x - 10 - boxW : cp.x + 10;
      bx = Math.max(minLocalX, Math.min(maxLocalX - boxW, bx));
      let by = Math.max(minLocalY, Math.min(maxLocalY - boxH, cp.y - 18));

      // Resolve vertical/horizontal overlap against previously placed handle badges
      for (let attempt = 0; attempt < 6; attempt++) {
        const overlaps = placed.some(
          (p) => !(bx + boxW + 3 < p.x1 || bx - 3 > p.x2 || by + boxH + 3 < p.y1 || by - 3 > p.y2)
        );
        if (!overlaps) break;
        const candidateDown = by + boxH + 4;
        const candidateUp = by - (boxH + 4);
        if (candidateDown + boxH <= maxLocalY) {
          by = candidateDown;
        } else if (candidateUp >= minLocalY) {
          by = candidateUp;
        } else {
          break;
        }
      }

      placed.push({ x1: bx, y1: by, x2: bx + boxW, y2: by + boxH });
      return { id: cp.id, bx: bx - cp.x, by: by - cp.y, boxW, boxH };
    });
  }, [evaluated.controlPoints, originX, originY, viewportW, viewportH]);

  // Handle dragging diamond control points inside the live preview
  const handlePreviewPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!draggingHandleId || !previewSvgRef.current) return;
      const rect = previewSvgRef.current.getBoundingClientRect();
      const scaleX = viewportW / rect.width;
      const scaleY = viewportH / rect.height;
      const svgX = (e.clientX - rect.left) * scaleX;
      const svgY = (e.clientY - rect.top) * scaleY;
      const localX = svgX - originX;
      const localY = svgY - originY;

      const nextParams = dragAutoShapeControlPoint(
        transientDef,
        draggingHandleId,
        localX,
        localY,
        previewWidth,
        previewHeight,
        liveParams,
        code
      );
      setLiveParams(nextParams);
    },
    [draggingHandleId, originX, originY, transientDef, previewWidth, previewHeight, liveParams, code]
  );

  const handlePreviewPointerUp = useCallback(() => {
    setDraggingHandleId(null);
  }, []);

  // Apply code to selected canvas instance or update definition
  const handleRunAndApply = useCallback(() => {
    if (evaluated.error) {
      setStatusBanner({
        type: 'warning',
        message: `Fix JS syntax/runtime error before applying: ${evaluated.error}`,
      });
      return;
    }

    if (selectedObject && selectedObject.shapeDefId === activeDefId && !isCreatingNew) {
      onUpdateInstanceCode(selectedObject.id, code, liveParams);
      setStatusBanner({
        type: 'success',
        message: `Applied live JS code & parameters to "${selectedObject.name}" on canvas!`,
      });
      return;
    }

    const existing = allDefinitions.find((d) => d.id === activeDefId);
    if (existing && !isCreatingNew) {
      onUpdateDefinition({
        ...existing,
        name: shapeName,
        category: shapeCategory,
        description: shapeDescription,
        paramSchema,
        defaultParams: { ...existing.defaultParams, ...liveParams },
        jsSourceCode: code,
      });
      setStatusBanner({
        type: 'success',
        message: `Updated "${shapeName}" AutoShape definition in library!`,
      });
    } else {
      const newDef: AutoShapeDefinition = {
        ...transientDef,
        id: `custom-${Date.now().toString(36)}`,
        isBuiltIn: false,
        defaultParams: { ...transientDef.defaultParams, ...liveParams },
      };
      onSaveNewDefinition(newDef, true);
      setIsCreatingNew(false);
      setActiveDefId(newDef.id);
      setStatusBanner({
        type: 'success',
        message: `Saved "${newDef.name}" & inserted onto canvas!`,
      });
    }
  }, [
    evaluated.error,
    selectedObject,
    activeDefId,
    isCreatingNew,
    onUpdateInstanceCode,
    code,
    liveParams,
    allDefinitions,
    onUpdateDefinition,
    shapeName,
    shapeDescription,
    paramSchema,
    transientDef,
    onSaveNewDefinition,
  ]);

  const handleSaveAsNewTool = (insertToCanvas: boolean) => {
    if (evaluated.error) {
      setStatusBanner({
        type: 'warning',
        message: `Cannot save AutoShape with runtime error: ${evaluated.error}`,
      });
      return;
    }
    const newId = `custom-${shapeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')}-${Date.now().toString(36).slice(-4)}`;

    const defaults: Record<string, number | boolean | string> = {};
    paramSchema.forEach((p) => {
      defaults[p.key] = liveParams[p.key] !== undefined ? liveParams[p.key] : p.defaultValue;
    });

    const newDef: AutoShapeDefinition = {
      id: newId,
      name: shapeName.trim() || 'Custom JS AutoShape',
      category: 'Custom JS',
      description:
        shapeDescription.trim() || 'User-created programmable Osito Smart Shape.',
      iconName: 'Sparkles',
      isBuiltIn: false,
      paramSchema,
      defaultParams: defaults,
      jsSourceCode: code,
    };

    onSaveNewDefinition(newDef, insertToCanvas);
    setIsCreatingNew(false);
    setActiveDefId(newDef.id);
    setStatusBanner({
      type: 'success',
      message: insertToCanvas
        ? `Saved "${newDef.name}" to library and placed instance on canvas!`
        : `Saved "${newDef.name}" to Custom AutoShapes library!`,
    });
  };

  // Keyboard shortcut Ctrl+Enter to Run & Apply
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunAndApply();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, handleRunAndApply]);

  // AI AutoShape Generator: Gemini API (if key configured) + Instant Offline Deterministic Fallback
  const handleGenerateWithAI = async (promptOverride?: string) => {
    const targetPrompt = (promptOverride ?? aiPrompt).trim();
    if (!targetPrompt) return;
    if (promptOverride) setAiPrompt(promptOverride);

    setAiGenerating(true);
    setStatusBanner(null);

    const envKey =
      (typeof process !== 'undefined' &&
        (process as any).env &&
        (process as any).env.GEMINI_API_KEY) ||
      '';
    const activeApiKey = userApiKey.trim() || envKey;

    if (activeApiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: activeApiKey });
        const sysPrompt = `You are a Osito JavaScript AutoShape (.jsf) compiler.
Return ONLY valid JSON (no markdown fences) with this exact structure:
{
  "name": "Smart ...",
  "description": "Short description",
  "paramSchema": [
    { "key": "paramName", "label": "Readable Label", "type": "number", "min": 0.1, "max": 0.9, "step": 0.01, "defaultValue": 0.35 }
  ],
  "defaultParams": { "paramName": 0.35 },
  "jsSourceCode": "function getControlPoints(width, height, params, helpers) { ... }\\nfunction onDragControlPoint(id, localX, localY, width, height, params, helpers) { ... }\\nfunction buildPaths(width, height, params, helpers) { ... }"
}
Rules for jsSourceCode:
- Use helpers.cornerNode(x,y), helpers.smoothNode(x,y,cp1x,cp1y,cp2x,cp2y), helpers.rectPath(x,y,w,h,r), helpers.ellipsePath(cx,cy,rx,ry), helpers.polygonPath(points), helpers.arcNodes(cx,cy,rx,ry,startDeg,sweepDeg), helpers.clamp(val,min,max).
- getControlPoints returns [{ id, label, x, y, cursor }].
- onDragControlPoint returns updated params object.
- buildPaths returns [{ nodes: BezierNode[], closed: boolean }].`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${sysPrompt}\n\nUser request: ${targetPrompt}`,
        });

        const rawText = (response.text || '').trim().replace(/^```json\s*|\s*```$/g, '');
        const parsed = JSON.parse(rawText);

        if (parsed && typeof parsed.jsSourceCode === 'string') {
          setIsCreatingNew(true);
          setActiveDefId('__new__');
          setShapeName(parsed.name || `Smart ${targetPrompt.slice(0, 24)}`);
          setShapeCategory('Custom JS');
          setShapeDescription(parsed.description || `AI generated from "${targetPrompt}"`);
          const schema: AutoShapeParamMeta[] = Array.isArray(parsed.paramSchema)
            ? parsed.paramSchema
            : [];
          setParamSchema(schema);
          setLiveParams(parsed.defaultParams || {});
          setCode(parsed.jsSourceCode);
          setAiGenerating(false);
          setStatusBanner({
            type: 'success',
            message: 'Generated programmable JS AutoShape with Gemini 2.5 Flash!',
          });
          return;
        }
      } catch {
        // Gracefully fall back to Tier-1 deterministic procedural generator
      }
    }

    // Tier-1 ($0.00) Instant Offline Deterministic Procedural Generator
    const generated = generateProceduralAutoShapeFromPrompt(targetPrompt);
    setIsCreatingNew(true);
    setActiveDefId('__new__');
    setShapeName(generated.name);
    setShapeCategory('Custom JS');
    setShapeDescription(generated.description);
    setParamSchema(generated.paramSchema);
    setLiveParams({ ...generated.defaultParams });
    setCode(generated.jsSourceCode);
    setAiGenerating(false);
    setStatusBanner({
      type: 'info',
      message: activeApiKey
        ? 'Used Tier-1 Offline Procedural Engine fallback ($0.00) — drag the diamond handles!'
        : 'Synthesized via Tier-1 Offline Procedural JS Engine ($0.00, instant, zero API spend)!',
    });
  };

  // Parameter Schema Editor handlers
  const handleAddParam = () => {
    const idx = paramSchema.length + 1;
    const key = `param${idx}`;
    const newParam: AutoShapeParamMeta = {
      key,
      label: `Parameter ${idx}`,
      type: 'number',
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.5,
    };
    setParamSchema([...paramSchema, newParam]);
    setLiveParams({ ...liveParams, [key]: 0.5 });
  };

  const handleRemoveParam = (key: string) => {
    setParamSchema(paramSchema.filter((p) => p.key !== key));
    const next = { ...liveParams };
    delete next[key];
    setLiveParams(next);
  };

  const handleUpdateParamMeta = (index: number, patch: Partial<AutoShapeParamMeta>) => {
    const next = [...paramSchema];
    const oldKey = next[index].key;
    const updated = { ...next[index], ...patch };
    next[index] = updated;
    setParamSchema(next);

    if (patch.key && patch.key !== oldKey) {
      const copy = { ...liveParams };
      copy[patch.key] = copy[oldKey];
      delete copy[oldKey];
      setLiveParams(copy);
    }
  };

  const lineCount = useMemo(() => Math.max(1, code.split('\n').length), [code]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none rounded-none">
      <div className="w-full max-w-6xl h-[88vh] bg-[#161616] border border-[#484848] rounded-none shadow-2xl flex flex-col overflow-hidden text-[#f5f5f5]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b border-[#2e2e2e] rounded-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-none bg-[#1c1c1c] border border-[#484848] flex items-center justify-center text-[#ffffff]">
              <Diamond className="w-4 h-4 fill-[#d4d4d4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-wide text-[#ffffff]">
                  Osito Programmable AutoShape Studio (.jsf)
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-none bg-[#242424] text-[#e5e5e5] border border-[#484848]">
                  Live JS Vector Runtime
                </span>
              </div>
              <p className="text-xs text-[#a3a3a3]">
                Write JavaScript control handles &amp; cubic Bezier paths with real-time diamond handle interaction
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRunAndApply}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-semibold bg-[#e5e5e5] hover:bg-[#ffffff] text-[#0a0a0a] border border-[#ffffff] transition"
              title="Run & Apply to Canvas (Ctrl+Enter)"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run &amp; Apply (Ctrl+Enter)</span>
            </button>
            <button
              type="button"
              onClick={() => handleSaveAsNewTool(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-medium bg-[#242424] hover:bg-[#383838] text-[#ffffff] border border-[#737373] transition"
              title="Save as reusable AutoShape and insert on canvas"
            >
              <CopyPlus className="w-3.5 h-3.5" />
              <span>Save &amp; Insert Shape</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-none text-[#a3a3a3] hover:text-[#ffffff] hover:bg-[#242424] border border-transparent hover:border-[#484848] transition"
              title="Close AutoShape Studio"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI AutoShape Generator Bar */}
        <div className="px-4 py-2.5 bg-[#111111] border-b border-[#2e2e2e] flex flex-col gap-2 rounded-none">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#e5e5e5] shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI / Procedural Shape Synthesizer:</span>
            </div>
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerateWithAI();
              }}
              placeholder="Describe a Smart Shape (e.g. 'A lightning bolt badge with thickness handle', 'A circuit resistor symbol with adjustable leads')..."
              className="flex-1 bg-[#0a0a0a] border border-[#383838] rounded-none px-3 py-1.5 text-xs text-[#f5f5f5] placeholder-[#737373] focus:outline-none focus:border-[#ffffff]"
            />
            <button
              type="button"
              onClick={() => handleGenerateWithAI()}
              disabled={aiGenerating || !aiPrompt.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs bg-[#e5e5e5] hover:bg-[#ffffff] disabled:opacity-40 text-[#0a0a0a] border border-[#ffffff] font-semibold transition shrink-0"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{aiGenerating ? 'Synthesizing...' : 'Generate JS Shape'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowKeyInput(!showKeyInput)}
              className={`p-1.5 rounded-none border text-xs transition ${
                showKeyInput || userApiKey
                  ? 'border-[#ffffff] bg-[#262626] text-[#ffffff]'
                  : 'border-[#383838] bg-[#161616] text-[#a3a3a3] hover:text-[#e5e5e5]'
              }`}
              title="Optional Gemini API Key (Uses free Tier-1 Offline Procedural Synthesizer when blank)"
            >
              <KeyRound className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] uppercase tracking-wider text-[#737373] font-semibold">
                Instant Presets:
              </span>
              {QUICK_AI_PROMPTS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleGenerateWithAI(preset)}
                  className="px-2 py-0.5 rounded-none text-[11px] bg-[#1c1c1c] hover:bg-[#2e2e2e] text-[#d4d4d4] border border-[#383838] transition"
                >
                  {preset}
                </button>
              ))}
            </div>

            {showKeyInput && (
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={userApiKey}
                  onChange={(e) => setUserApiKey(e.target.value)}
                  placeholder="Optional Gemini API Key (in-memory only)"
                  className="w-64 bg-[#0a0a0a] border border-[#383838] rounded-none px-2 py-1 text-xs text-[#e5e5e5]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Status / Error Banner */}
        {(evaluated.error || statusBanner) && (
          <div
            className={`px-4 py-2 text-xs flex items-center justify-between border-b rounded-none ${
              evaluated.error
                ? 'bg-[#1c1c1c] border-[#737373] text-[#ffffff]'
                : statusBanner?.type === 'warning'
                ? 'bg-[#1c1c1c] border-[#737373] text-[#e5e5e5]'
                : 'bg-[#161616] border-[#484848] text-[#e5e5e5]'
            }`}
          >
            <div className="flex items-center gap-2">
              {evaluated.error ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-[#ffffff] shrink-0" />
                  <span className="font-mono">JS Runtime Error: {evaluated.error}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#d4d4d4] shrink-0" />
                  <span>{statusBanner?.message}</span>
                </>
              )}
            </div>
            {statusBanner && !evaluated.error && (
              <button
                type="button"
                onClick={() => setStatusBanner(null)}
                className="text-[#a3a3a3] hover:text-[#ffffff] text-[11px] rounded-none"
              >
                Dismiss
              </button>
            )}
          </div>
        )}

        {/* Main 3-Column Studio Body */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Column: AutoShape Template Library */}
          <div className="w-60 bg-[#111111] border-r border-[#2e2e2e] flex flex-col min-h-0">
            <div className="p-3 border-b border-[#2e2e2e]">
              <button
                type="button"
                onClick={handleStartNewCustom}
                className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-none text-xs font-semibold border transition ${
                  isCreatingNew
                    ? 'bg-[#e5e5e5] border-[#ffffff] text-[#0a0a0a]'
                    : 'bg-[#1c1c1c] hover:bg-[#2e2e2e] border-[#383838] text-[#e5e5e5]'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New Custom JS AutoShape</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2.5">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#737373]">
                Grouped Shape Library ({allDefinitions.length})
              </div>
              {AUTOSHAPE_GROUP_ORDER.map((groupName) => ({
                groupName,
                items: allDefinitions.filter((d) => d.category === groupName),
              }))
                .filter((g) => g.items.length > 0)
                .map(({ groupName, items }) => (
                  <div key={groupName} className="space-y-1">
                    <div className="px-2 py-0.5 bg-[#161616] border-l-2 border-[#d4d4d4] flex items-center justify-between">
                      <span className="text-[9px] font-mono uppercase tracking-wider font-semibold text-[#d4d4d4]">
                        {groupName}
                      </span>
                      <span className="text-[9px] font-mono text-[#737373]">{items.length}</span>
                    </div>
                    {items.map((def) => {
                      const isSelected = !isCreatingNew && activeDefId === def.id;
                      return (
                        <button
                          key={def.id}
                          type="button"
                          onClick={() => loadDefinitionIntoEditor(def)}
                          className={`w-full text-left px-2 py-1.5 rounded-none transition flex items-center gap-2 border ${
                            isSelected
                              ? 'bg-[#262626] border-[#888888] text-[#ffffff]'
                              : 'border-transparent hover:bg-[#1c1c1c] text-[#d4d4d4]'
                          }`}
                        >
                          <AutoShapeThumbnail shape={def} width={42} height={28} />
                          <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-medium truncate">{def.name}</span>
                              <span
                                className={`text-[9px] px-1 py-0.2 rounded-none font-mono shrink-0 ${
                                  def.isBuiltIn
                                    ? 'bg-[#1c1c1c] text-[#a3a3a3]'
                                    : 'bg-[#e5e5e5] text-[#0a0a0a] font-semibold'
                                }`}
                              >
                                {def.isBuiltIn ? '.jsf' : 'USER'}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#737373] truncate">
                              {def.category}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
            </div>
          </div>

          {/* Center Column: Live Interactive Canvas Preview + Parameter Schema Builder */}
          <div className="w-[410px] bg-[#161616] border-r border-[#2e2e2e] flex flex-col min-h-0 overflow-y-auto">
            {/* Shape Metadata Bar */}
            <div className="p-3 border-b border-[#2e2e2e] space-y-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] uppercase tracking-wider text-[#a3a3a3] mb-1">
                    Shape Name
                  </label>
                  <input
                    type="text"
                    value={shapeName}
                    onChange={(e) => setShapeName(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#383838] rounded-none px-2.5 py-1 text-xs text-[#ffffff]"
                  />
                </div>
                <div className="w-40">
                  <label className="block text-[10px] uppercase tracking-wider text-[#a3a3a3] mb-1">
                    Group
                  </label>
                  <select
                    value={shapeCategory}
                    onChange={(e) =>
                      setShapeCategory(e.target.value as AutoShapeDefinition['category'])
                    }
                    className="w-full bg-[#0a0a0a] border border-[#383838] rounded-none px-2 py-1 text-xs text-[#ffffff]"
                  >
                    {AUTOSHAPE_GROUP_ORDER.map((grp) => (
                      <option key={grp} value={grp}>
                        {grp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Interactive SVG Preview Viewport */}
            <div className="p-3 border-b border-[#2e2e2e]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#e5e5e5]">
                  <Eye className="w-3.5 h-3.5 text-[#d4d4d4]" />
                  <span>Interactive Handle Sandbox</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBezierNodes(!showBezierNodes)}
                    className={`px-2 py-0.5 rounded-none text-[10px] border transition ${
                      showBezierNodes
                        ? 'bg-[#e5e5e5] border-[#ffffff] text-[#0a0a0a] font-semibold'
                        : 'bg-[#1c1c1c] border-[#383838] text-[#a3a3a3]'
                    }`}
                  >
                    {showBezierNodes ? 'Nodes: ON' : 'Nodes: OFF'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const defaults: Record<string, any> = {};
                      paramSchema.forEach((p) => {
                        defaults[p.key] = p.defaultValue;
                      });
                      setLiveParams(defaults);
                    }}
                    className="p-1 rounded-none bg-[#1c1c1c] hover:bg-[#2e2e2e] text-[#d4d4d4] border border-[#383838]"
                    title="Reset Parameters to Default"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div
                className="relative rounded-none border border-[#383838] overflow-hidden bg-[#0a0a0a]"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, rgba(212, 212, 212, 0.14) 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
              >
                <svg
                  ref={previewSvgRef}
                  viewBox={`0 0 ${viewportW} ${viewportH}`}
                  className="w-full h-[230px] block cursor-default"
                  onPointerMove={handlePreviewPointerMove}
                  onPointerUp={handlePreviewPointerUp}
                  onPointerLeave={handlePreviewPointerUp}
                >
                  <defs>
                    <linearGradient id="autoshapePreviewGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>

                  <g transform={`translate(${originX}, ${originY})`}>
                    {/* Bounding Box Guide */}
                    <rect
                      x={0}
                      y={0}
                      width={previewWidth}
                      height={previewHeight}
                      fill="none"
                      stroke="#383838"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                    />

                    {/* Evaluated Vector Subpaths (Outer container vs inner sub-containers) */}
                    {svgSubPaths.map((sub, idx) => (
                      <path
                        key={idx}
                        d={sub.d}
                        fill={
                          sub.closed
                            ? sub.isOuter
                              ? 'rgba(6, 182, 212, 0.14)'
                              : 'url(#autoshapePreviewGrad)'
                            : 'none'
                        }
                        stroke="#38bdf8"
                        strokeWidth={sub.isOuter ? 2 : 1.5}
                        strokeLinejoin="miter"
                      />
                    ))}

                    {/* Subselection Cubic Bezier Nodes & Handles Overlay */}
                    {showBezierNodes &&
                      evaluated.paths.map((subPath, pIdx) =>
                        subPath.nodes.map((node: BezierNode, nIdx: number) => (
                          <g key={`node_${pIdx}_${nIdx}`}>
                            {(Math.abs(node.cp1x - node.x) > 0.5 ||
                              Math.abs(node.cp1y - node.y) > 0.5) && (
                              <>
                                <line
                                  x1={node.x}
                                  y1={node.y}
                                  x2={node.cp1x}
                                  y2={node.cp1y}
                                  stroke="#38bdf8"
                                  strokeWidth={1}
                                  strokeOpacity={0.75}
                                />
                                <circle
                                  cx={node.cp1x}
                                  cy={node.cp1y}
                                  r={2.3}
                                  fill="#38bdf8"
                                />
                              </>
                            )}
                            {(Math.abs(node.cp2x - node.x) > 0.5 ||
                              Math.abs(node.cp2y - node.y) > 0.5) && (
                              <>
                                <line
                                  x1={node.x}
                                  y1={node.y}
                                  x2={node.cp2x}
                                  y2={node.cp2y}
                                  stroke="#38bdf8"
                                  strokeWidth={1}
                                  strokeOpacity={0.75}
                                />
                                <circle
                                  cx={node.cp2x}
                                  cy={node.cp2y}
                                  r={2.3}
                                  fill="#38bdf8"
                                />
                              </>
                            )}
                            <rect
                              x={node.x - 3}
                              y={node.y - 3}
                              width={6}
                              height={6}
                              fill="#ffffff"
                              stroke="#0284c7"
                              strokeWidth={1.2}
                            />
                          </g>
                        ))
                      )}

                    {/* Osito Yellow Diamond Control Points */}
                    {evaluated.controlPoints.map((cp, cpIdx) => {
                      const isActive =
                        draggingHandleId === cp.id || hoveredHandleId === cp.id;
                      const badge = handleBadgePositions[cpIdx] || {
                        bx: 10,
                        by: -18,
                        boxW: Math.max(58, Math.round(cp.label.length * 6.2 + 10)),
                        boxH: 18,
                      };
                      return (
                        <g
                          key={cp.id}
                          transform={`translate(${cp.x}, ${cp.y})`}
                          style={{ cursor: cp.cursor || 'pointer' }}
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            (e.currentTarget as Element).setPointerCapture(e.pointerId);
                            setDraggingHandleId(cp.id);
                          }}
                          onPointerEnter={() => setHoveredHandleId(cp.id)}
                          onPointerLeave={() => setHoveredHandleId(null)}
                        >
                          {/* Outer glow when active */}
                          {isActive && (
                            <polygon
                              points="0,-10 10,0 0,10 -10,0"
                              fill="rgba(250, 204, 21, 0.35)"
                            />
                          )}
                          {/* Yellow Diamond Handle */}
                          <polygon
                            points="0,-6.5 6.5,0 0,6.5 -6.5,0"
                            fill="#facc15"
                            stroke="#0a0a0a"
                            strokeWidth={1.5}
                          />
                          {/* Non-Overlapping Handle Tooltip Label */}
                          <g transform={`translate(${badge.bx}, ${badge.by})`}>
                            <rect
                              x={0}
                              y={0}
                              width={badge.boxW}
                              height={badge.boxH}
                              rx={0}
                              fill="rgba(17, 17, 17, 0.94)"
                              stroke="#facc15"
                              strokeWidth={0.8}
                            />
                            <text
                              x={5}
                              y={12}
                              fill="#fef08a"
                              fontSize="10"
                              fontFamily="monospace"
                            >
                              {cp.label}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                  </g>
                </svg>

                <div className="px-2.5 py-1 bg-[#111111] border-t border-[#2e2e2e] flex items-center justify-between text-[11px] text-[#a3a3a3]">
                  <span>
                    Drag <strong className="text-[#ffffff]">Diamond Handles</strong> to test{' '}
                    <code className="text-[#e5e5e5]">onDragControlPoint()</code>
                  </span>
                  <span className="font-mono">
                    {evaluated.paths.length} path(s) ·{' '}
                    {evaluated.paths.reduce((acc, p) => acc + p.nodes.length, 0)} Bezier nodes
                  </span>
                </div>
              </div>
            </div>

            {/* Live Parameter Controls & Schema Builder */}
            <div className="p-3 flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#e5e5e5]">
                  <Sliders className="w-3.5 h-3.5 text-[#d4d4d4]" />
                  <span>Parameters &amp; Schema ({paramSchema.length})</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddParam}
                  className="flex items-center gap-1 px-2 py-1 rounded-none text-[11px] bg-[#1c1c1c] hover:bg-[#2e2e2e] text-[#e5e5e5] border border-[#383838]"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Param</span>
                </button>
              </div>

              <div className="space-y-2">
                {paramSchema.map((param, idx) => {
                  const val =
                    liveParams[param.key] !== undefined
                      ? liveParams[param.key]
                      : param.defaultValue;

                  return (
                    <div
                      key={`${param.key}_${idx}`}
                      className="p-2.5 rounded-none bg-[#111111] border border-[#2e2e2e] space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={param.key}
                          onChange={(e) =>
                            handleUpdateParamMeta(idx, { key: e.target.value.trim() })
                          }
                          className="w-28 bg-[#0a0a0a] border border-[#383838] rounded-none px-2 py-0.5 text-xs font-mono text-[#ffffff]"
                          title="Parameter key in params.<key>"
                        />
                        <input
                          type="text"
                          value={param.label}
                          onChange={(e) =>
                            handleUpdateParamMeta(idx, { label: e.target.value })
                          }
                          className="flex-1 bg-[#0a0a0a] border border-[#383838] rounded-none px-2 py-0.5 text-xs text-[#e5e5e5]"
                          title="Display label"
                        />
                        <select
                          value={param.type}
                          onChange={(e) => {
                            const nextType = e.target.value as 'number' | 'boolean';
                            const nextDefault = nextType === 'boolean' ? false : 0.5;
                            handleUpdateParamMeta(idx, {
                              type: nextType,
                              defaultValue: nextDefault,
                            });
                            setLiveParams({ ...liveParams, [param.key]: nextDefault });
                          }}
                          className="bg-[#0a0a0a] border border-[#383838] rounded-none px-1.5 py-0.5 text-[11px] text-[#d4d4d4]"
                        >
                          <option value="number">number</option>
                          <option value="boolean">boolean</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveParam(param.key)}
                          className="p-1 text-[#737373] hover:text-[#ffffff] rounded-none"
                          title="Remove parameter"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {param.type === 'number' ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min={param.min ?? 0}
                              max={param.max ?? 100}
                              step={param.step ?? 1}
                              value={Number(val) || 0}
                              onChange={(e) =>
                                setLiveParams({
                                  ...liveParams,
                                  [param.key]: Number(e.target.value),
                                })
                              }
                              className="flex-1 accent-[#e5e5e5]"
                            />
                            <span className="w-14 text-right font-mono text-xs text-[#ffffff]">
                              {Number(val).toFixed(
                                (param.step ?? 1) < 1 ? 2 : 0
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-[#a3a3a3]">
                            <span>Min:</span>
                            <input
                              type="number"
                              value={param.min ?? 0}
                              onChange={(e) =>
                                handleUpdateParamMeta(idx, { min: Number(e.target.value) })
                              }
                              className="w-14 bg-[#0a0a0a] border border-[#2e2e2e] rounded-none px-1.5 py-0.5 text-[#d4d4d4] font-mono"
                            />
                            <span>Max:</span>
                            <input
                              type="number"
                              value={param.max ?? 100}
                              onChange={(e) =>
                                handleUpdateParamMeta(idx, { max: Number(e.target.value) })
                              }
                              className="w-14 bg-[#0a0a0a] border border-[#2e2e2e] rounded-none px-1.5 py-0.5 text-[#d4d4d4] font-mono"
                            />
                            <span>Step:</span>
                            <input
                              type="number"
                              step="0.01"
                              value={param.step ?? 1}
                              onChange={(e) =>
                                handleUpdateParamMeta(idx, { step: Number(e.target.value) })
                              }
                              className="w-14 bg-[#0a0a0a] border border-[#2e2e2e] rounded-none px-1.5 py-0.5 text-[#d4d4d4] font-mono"
                            />
                          </div>
                        </div>
                      ) : (
                        <label className="flex items-center gap-2 text-xs text-[#d4d4d4] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(val)}
                            onChange={(e) =>
                              setLiveParams({
                                ...liveParams,
                                [param.key]: e.target.checked,
                              })
                            }
                            className="rounded-none accent-[#e5e5e5]"
                          />
                          <span>Enabled ({String(Boolean(val))})</span>
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Live JavaScript Source Code Editor */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
            <div className="px-4 py-2 bg-[#111111] border-b border-[#2e2e2e] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#d4d4d4]" />
                <span className="text-xs font-mono font-medium text-[#e5e5e5]">
                  {activeDefId === '__new__' ? 'custom-shape.jsf' : `${activeDefId}.jsf`}
                </span>
                <span className="text-[11px] text-[#737373]">
                  (getControlPoints · onDragControlPoint · buildPaths)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveAsNewTool(false)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-none text-xs bg-[#1c1c1c] hover:bg-[#2e2e2e] text-[#e5e5e5] border border-[#383838] transition"
                >
                  <Save className="w-3.5 h-3.5 text-[#d4d4d4]" />
                  <span>Save to Shape Library</span>
                </button>
              </div>
            </div>

            {/* Code Editor with Synchronized Line Numbers */}
            <div className="flex-1 relative flex overflow-hidden font-mono text-xs">
              <div
                ref={gutterRef}
                className="w-12 py-3 bg-[#0a0a0a] border-r border-[#242424] text-right pr-3 text-[#737373] select-none overflow-hidden"
              >
                {Array.from({ length: lineCount }).map((_, idx) => (
                  <div key={idx} className="leading-5">
                    {idx + 1}
                  </div>
                ))}
              </div>

              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onScroll={(e) => {
                  if (gutterRef.current) {
                    gutterRef.current.scrollTop = e.currentTarget.scrollTop;
                  }
                }}
                spellCheck={false}
                className="flex-1 p-3 bg-[#0a0a0a] text-[#e5e5e5] leading-5 focus:outline-none resize-none overflow-y-auto selection:bg-[#383838] rounded-none"
              />
            </div>

            {/* Bottom Helper Reference Footer */}
            <div className="px-4 py-2 bg-[#111111] border-t border-[#2e2e2e] flex items-center justify-between text-[11px] text-[#a3a3a3] font-mono">
              <div className="truncate">
                <span className="text-[#ffffff]">helpers:</span> cornerNode(x,y) · smoothNode(x,y,cp1x,cp1y,cp2x,cp2y) · rectPath(x,y,w,h,r) · ellipsePath(cx,cy,rx,ry) · polygonPath(pts) · arcNodes(cx,cy,rx,ry,start,sweep)
              </div>
              <div className="shrink-0 text-[#737373] ml-3">
                {lineCount} lines
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoShapeCodeStudio;

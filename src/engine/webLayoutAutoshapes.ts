import type { AutoShapeDefinition } from '../types/editor';

/**
 * 50 Built-In Parametric Web Layout, Interactive UI & Dashboard Widget AutoShapes (.jsf style)
 * Each AutoShape supports yellow diamond control handles (`getControlPoints` / `onDragControlPoint`),
 * Live Preview Mode click/drag interactivity (`onPreviewClick`), and multi-subpath vector wireframe geometry (`buildPaths`).
 */
export const WEB_LAYOUT_AND_UI_AUTOSHAPES: AutoShapeDefinition[] = [
  // 1. Segmented Tabs
  {
    id: 'ui-segmented-tabs',
    name: 'Segmented Tab Control',
    category: 'User Interface',
    description: 'Interactive segmented pill tab bar with active pill indicator and content panel.',
    iconName: 'Columns',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click any tab segment in Preview Mode to switch active tab view',
    paramSchema: [
      { key: 'tabCount', label: 'Tab Count', type: 'number', min: 2, max: 6, step: 1, defaultValue: 4 },
      { key: 'activeTab', label: 'Active Tab (1-N)', type: 'number', min: 1, max: 6, step: 1, defaultValue: 2 },
      { key: 'barRatio', label: 'Header Height Ratio', type: 'number', min: 0.15, max: 0.45, step: 0.01, defaultValue: 0.24 },
    ],
    defaultParams: { tabCount: 4, activeTab: 2, barRatio: 0.24 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.tabCount) || 4, 2, 6));
  const active = Math.round(helpers.clamp(Number(params.activeTab) || 2, 1, count));
  const barH = helpers.clamp(Number(params.barRatio) || 0.24, 0.15, 0.45) * height;
  const segW = width / count;
  return [
    { id: 'activeTab', label: \`Active Tab: \${active}/\${count}\`, x: (active - 0.5) * segW, y: barH * 0.5, cursor: 'ew-resize' },
    { id: 'barRatio', label: \`Bar Height: \${Math.round((barH / height) * 100)}%\`, x: width * 0.5, y: barH, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.tabCount) || 4, 2, 6));
  if (id === 'activeTab') {
    const idx = helpers.clamp(Math.floor((localX / Math.max(1, width)) * count) + 1, 1, count);
    return { ...params, activeTab: idx };
  }
  if (id === 'barRatio') {
    return { ...params, barRatio: Number(helpers.clamp(localY / Math.max(1, height), 0.15, 0.45).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.tabCount) || 4, 2, 6));
  const idx = helpers.clamp(Math.floor((localX / Math.max(1, width)) * count) + 1, 1, count);
  return { ...params, activeTab: idx };
}

function buildPaths(width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.tabCount) || 4, 2, 6));
  const active = Math.round(helpers.clamp(Number(params.activeTab) || 2, 1, count));
  const barH = helpers.clamp(Number(params.barRatio) || 0.24, 0.15, 0.45) * height;
  const pad = Math.min(width, height) * 0.04;
  const segW = Math.max(4, (width - pad * 2) / count);
  const barInnerH = Math.max(4, barH - pad);
  const pillInsetX = Math.min(4, segW * 0.1);
  const pillInsetY = Math.min(3, barInnerH * 0.16);
  const pillH = Math.max(4, barInnerH - pillInsetY * 2);
  const btnR = Math.min(10, pillH * 0.45);
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.rectPath(pad, pad, Math.max(4, width - pad * 2), barInnerH, 0), closed: true }
  ];
  for (let i = 0; i < count; i++) {
    const bx = pad + i * segW + pillInsetX;
    const bw = Math.max(4, segW - pillInsetX * 2);
    const by = pad + pillInsetY;
    paths.push({ nodes: helpers.rectPath(bx, by, bw, pillH, btnR), closed: true });
    if (i + 1 === active) {
      paths.push({ nodes: helpers.rectPath(bx + 2.5, by + 2.5, Math.max(2, bw - 5), Math.max(2, pillH - 5), Math.max(2, btnR - 2)), closed: true });
    }
  }
  const bodyTop = barH + pad;
  const bodyH = Math.max(4, height - bodyTop - pad);
  const colGap = Math.max(2, pad);
  const rowGap = Math.max(2, bodyH * 0.08);
  const availW = Math.max(6, width - pad * 2 - colGap);
  const offset = ((active - 1) % 3) * 0.08;
  const leftW = availW * (0.45 + offset);
  const rightW = availW - leftW;
  const halfH = Math.max(2, (bodyH - rowGap) * 0.5);
  paths.push({ nodes: helpers.rectPath(pad, bodyTop, leftW, bodyH, 0), closed: true });
  paths.push({ nodes: helpers.rectPath(pad + leftW + colGap, bodyTop, rightW, halfH, 0), closed: true });
  paths.push({ nodes: helpers.rectPath(pad + leftW + colGap, bodyTop + halfH + rowGap, rightW, halfH, 0), closed: true });
  return paths;
}`,
  },

  // 2. Accordion Stack
  {
    id: 'ui-accordion-stack',
    name: 'Accordion Disclosure Stack',
    category: 'User Interface',
    description: 'Expandable vertical FAQ / collapsible disclosure stack with chevron indicators.',
    iconName: 'ListCollapse',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click any row in Preview Mode to expand that accordion panel',
    paramSchema: [
      { key: 'itemCount', label: 'Row Count', type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
      { key: 'openIndex', label: 'Expanded Row (1-N)', type: 'number', min: 1, max: 5, step: 1, defaultValue: 1 },
      { key: 'radius', label: 'Card Corner Radius', type: 'number', min: 0, max: 20, step: 1, defaultValue: 0 },
    ],
    defaultParams: { itemCount: 3, openIndex: 1, radius: 0 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.itemCount) || 3, 2, 5));
  const openIdx = Math.round(helpers.clamp(Number(params.openIndex) || 1, 1, count));
  const r = helpers.clamp(Number(params.radius) ?? 0, 0, 20);
  return [
    { id: 'openIndex', label: \`Expanded: Row \${openIdx}\`, x: width - 16, y: ((openIdx - 0.5) / count) * height, cursor: 'ns-resize' },
    { id: 'radius', label: \`Radius: \${Math.round(r)}px\`, x: r, y: 0, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.itemCount) || 3, 2, 5));
  if (id === 'openIndex') {
    const idx = helpers.clamp(Math.floor((localY / Math.max(1, height)) * count) + 1, 1, count);
    return { ...params, openIndex: idx };
  }
  if (id === 'radius') {
    return { ...params, radius: Math.round(helpers.clamp(localX, 0, 20)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.itemCount) || 3, 2, 5));
  const idx = helpers.clamp(Math.floor((localY / Math.max(1, height)) * count) + 1, 1, count);
  return { ...params, openIndex: idx };
}

function buildPaths(width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.itemCount) || 3, 2, 5));
  const openIdx = Math.round(helpers.clamp(Number(params.openIndex) || 1, 1, count));
  const r = helpers.clamp(Number(params.radius) ?? 0, 0, 20);
  const gap = Math.min(6, height * 0.04);
  const closedH = Math.max(6, (height - gap * (count - 1)) / (count + 0.9));
  const openH = closedH * 1.9;
  const padX = Math.min(14, width * 0.07);
  const chevR = Math.min(5, width * 0.03, closedH * 0.22);
  const paths = [];
  let curY = 0;
  for (let i = 1; i <= count; i++) {
    const isOpen = i === openIdx;
    const h = isOpen ? openH : closedH;
    paths.push({ nodes: helpers.rectPath(0, curY, width, h, r), closed: true });
    const headerH = closedH;
    const titleH = Math.max(2, headerH * 0.24);
    paths.push({ nodes: helpers.rectPath(padX, curY + (headerH - titleH) * 0.5, width * 0.48, titleH, 0), closed: true });
    const cx = width - padX - chevR;
    const cy = curY + headerH * 0.5;
    if (isOpen) {
      paths.push({ nodes: helpers.polygonPath([{ x: cx - chevR, y: cy + chevR * 0.4 }, { x: cx, y: cy - chevR * 0.6 }, { x: cx + chevR, y: cy + chevR * 0.4 }], false), closed: false });
      const bodyAvail = Math.max(4, h - headerH);
      const line1H = Math.max(2, bodyAvail * 0.24);
      const line2H = Math.max(2, bodyAvail * 0.22);
      paths.push({ nodes: helpers.rectPath(padX, curY + headerH + bodyAvail * 0.12, Math.max(8, width - padX * 2), line1H, 0), closed: true });
      paths.push({ nodes: helpers.rectPath(padX, curY + headerH + bodyAvail * 0.5, Math.max(8, (width - padX * 2) * 0.68), line2H, 0), closed: true });
    } else {
      paths.push({ nodes: helpers.polygonPath([{ x: cx - chevR, y: cy - chevR * 0.4 }, { x: cx, y: cy + chevR * 0.6 }, { x: cx + chevR, y: cy - chevR * 0.4 }], false), closed: false });
    }
    curY += h + gap;
  }
  return paths;
}`,
  },

  // 3. Range Slider
  {
    id: 'ui-range-slider',
    name: 'Interactive Range Slider',
    category: 'User Interface',
    description: 'Parametric slider track with active fill bar, draggable thumb handle, and tick marks.',
    iconName: 'SlidersHorizontal',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click or drag anywhere along the track in Preview Mode to set slider value',
    paramSchema: [
      { key: 'valueRatio', label: 'Value Ratio', type: 'number', min: 0, max: 1, step: 0.01, defaultValue: 0.65 },
      { key: 'tickCount', label: 'Tick Marks', type: 'number', min: 0, max: 10, step: 1, defaultValue: 5 },
      { key: 'thumbRadius', label: 'Thumb Radius (px)', type: 'number', min: 6, max: 20, step: 1, defaultValue: 11 },
    ],
    defaultParams: { valueRatio: 0.65, tickCount: 5, thumbRadius: 11 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const val = helpers.clamp(Number(params.valueRatio) ?? 0.65, 0, 1);
  const tr = helpers.clamp(Number(params.thumbRadius) || 11, 6, 20);
  const padX = tr + 6;
  const trackW = Math.max(10, width - padX * 2);
  return [
    { id: 'valueRatio', label: \`Value: \${Math.round(val * 100)}%\`, x: padX + trackW * val, y: height * 0.45, cursor: 'ew-resize' },
    { id: 'thumbRadius', label: \`Thumb: \${Math.round(tr)}px\`, x: padX + trackW * val, y: height * 0.45 - tr, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  const tr = helpers.clamp(Number(params.thumbRadius) || 11, 6, 20);
  const padX = tr + 6;
  const trackW = Math.max(10, width - padX * 2);
  if (id === 'valueRatio') {
    const v = helpers.clamp((localX - padX) / trackW, 0, 1);
    return { ...params, valueRatio: Number(v.toFixed(2)) };
  }
  if (id === 'thumbRadius') {
    const r = helpers.clamp(Math.abs(height * 0.45 - localY), 6, 20);
    return { ...params, thumbRadius: Math.round(r) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const tr = helpers.clamp(Number(params.thumbRadius) || 11, 6, 20);
  const padX = tr + 6;
  const trackW = Math.max(10, width - padX * 2);
  const v = helpers.clamp((localX - padX) / trackW, 0, 1);
  return { ...params, valueRatio: Number(v.toFixed(2)) };
}

function buildPaths(width, height, params, helpers) {
  const val = helpers.clamp(Number(params.valueRatio) ?? 0.65, 0, 1);
  const ticks = Math.round(helpers.clamp(Number(params.tickCount) ?? 5, 0, 10));
  const tr = helpers.clamp(Number(params.thumbRadius) || 11, 6, 20);
  const padX = tr + 6;
  const trackW = Math.max(10, width - padX * 2);
  const cy = height * 0.45;
  const trackH = Math.max(6, height * 0.14);
  const thumbX = padX + trackW * val;

  const paths = [
    { nodes: helpers.rectPath(padX, cy - trackH / 2, trackW, trackH, trackH / 2), closed: true },
    { nodes: helpers.rectPath(padX, cy - trackH / 2, Math.max(trackH, trackW * val), trackH, trackH / 2), closed: true },
    { nodes: helpers.ellipsePath(thumbX, cy, tr, tr), closed: true },
    { nodes: helpers.ellipsePath(thumbX, cy, tr * 0.42, tr * 0.42), closed: true }
  ];
  for (let i = 0; i < ticks; i++) {
    const tx = padX + (i / Math.max(1, ticks - 1)) * trackW;
    paths.push({ nodes: helpers.rectPath(tx - 1, cy + tr + 4, 2, 6, 1), closed: true });
  }
  return paths;
}`,
  },

  // 4. Checkbox Group
  {
    id: 'ui-checkbox-group',
    name: 'Checkbox Filter List',
    category: 'User Interface',
    description: 'Vertical stack of interactive checkboxes with checkmarks and label bars.',
    iconName: 'CheckSquare',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click any row in Preview Mode to toggle its checked state',
    paramSchema: [
      { key: 'rowCount', label: 'Row Count', type: 'number', min: 2, max: 6, step: 1, defaultValue: 4 },
      { key: 'checkedMask', label: 'Checked Bitmask', type: 'number', min: 0, max: 63, step: 1, defaultValue: 5 },
      { key: 'boxSize', label: 'Checkbox Size (px)', type: 'number', min: 12, max: 28, step: 1, defaultValue: 18 },
    ],
    defaultParams: { rowCount: 4, checkedMask: 5, boxSize: 18 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const rows = Math.round(helpers.clamp(Number(params.rowCount) || 4, 2, 6));
  const boxSize = helpers.clamp(Number(params.boxSize) || 18, 12, 28);
  return [
    { id: 'boxSize', label: \`Box: \${Math.round(boxSize)}px\`, x: 12 + boxSize, y: height / (rows * 2), cursor: 'ew-resize' },
    { id: 'rowCount', label: \`Rows: \${rows}\`, x: width * 0.5, y: height - 6, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'boxSize') {
    return { ...params, boxSize: Math.round(helpers.clamp(localX - 12, 12, 28)) };
  }
  if (id === 'rowCount') {
    const r = Math.round(helpers.clamp(2 + (localY / Math.max(1, height)) * 4, 2, 6));
    return { ...params, rowCount: r };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const rows = Math.round(helpers.clamp(Number(params.rowCount) || 4, 2, 6));
  const mask = Math.round(helpers.clamp(Number(params.checkedMask) ?? 5, 0, 63));
  const idx = helpers.clamp(Math.floor((localY / Math.max(1, height)) * rows), 0, rows - 1);
  const nextMask = mask ^ (1 << idx);
  return { ...params, checkedMask: nextMask };
}

function buildPaths(width, height, params, helpers) {
  const rows = Math.round(helpers.clamp(Number(params.rowCount) || 4, 2, 6));
  const mask = Math.round(helpers.clamp(Number(params.checkedMask) ?? 5, 0, 63));
  const box = helpers.clamp(Number(params.boxSize) || 18, 12, 28);
  const paths = [{ nodes: helpers.rectPath(0, 0, width, height, 0), closed: true }];
  const rowH = height / rows;
  for (let i = 0; i < rows; i++) {
    const cy = (i + 0.5) * rowH;
    const bx = 12;
    const by = cy - box / 2;
    paths.push({ nodes: helpers.rectPath(bx, by, box, box, 0), closed: true });
    if ((mask & (1 << i)) !== 0) {
      paths.push({
        nodes: helpers.polygonPath([
          { x: bx + box * 0.22, y: cy },
          { x: bx + box * 0.44, y: by + box * 0.72 },
          { x: bx + box * 0.78, y: by + box * 0.26 }
        ], false),
        closed: false
      });
    }
    const labelW = (width - (bx + box + 24)) * (0.65 + ((i * 17) % 30) / 100);
    paths.push({ nodes: helpers.rectPath(bx + box + 12, cy - 4, Math.max(20, labelW), 8, 0), closed: true });
  }
  return paths;
}`,
  },

  // 5. Radio Plan Cards
  {
    id: 'ui-radio-cards',
    name: 'Radio Selection Cards',
    category: 'User Interface',
    description: 'Horizontal or grid radio option cards with active radio dot and selection indicator.',
    iconName: 'CircleDot',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click any option card in Preview Mode to select it',
    paramSchema: [
      { key: 'cardCount', label: 'Card Count', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
      { key: 'selectedCard', label: 'Selected Card (1-N)', type: 'number', min: 1, max: 4, step: 1, defaultValue: 1 },
      { key: 'gap', label: 'Card Gap (px)', type: 'number', min: 4, max: 20, step: 1, defaultValue: 10 },
    ],
    defaultParams: { cardCount: 3, selectedCard: 1, gap: 10 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.cardCount) || 3, 2, 4));
  const sel = Math.round(helpers.clamp(Number(params.selectedCard) || 1, 1, count));
  const cardW = width / count;
  return [
    { id: 'selectedCard', label: \`Selected: #\${sel}\`, x: (sel - 0.5) * cardW, y: height * 0.25, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.cardCount) || 3, 2, 4));
  if (id === 'selectedCard') {
    const idx = helpers.clamp(Math.floor((localX / Math.max(1, width)) * count) + 1, 1, count);
    return { ...params, selectedCard: idx };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.cardCount) || 3, 2, 4));
  const idx = helpers.clamp(Math.floor((localX / Math.max(1, width)) * count) + 1, 1, count);
  return { ...params, selectedCard: idx };
}

function buildPaths(width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.cardCount) || 3, 2, 4));
  const sel = Math.round(helpers.clamp(Number(params.selectedCard) || 1, 1, count));
  const gap = helpers.clamp(Number(params.gap) || 10, 4, 20);
  const cardW = (width - gap * (count - 1)) / count;
  const paths = [];
  for (let i = 0; i < count; i++) {
    const x = i * (cardW + gap);
    const isSel = i + 1 === sel;
    paths.push({ nodes: helpers.rectPath(x, 0, cardW, height, 0), closed: true });
    if (isSel) {
      paths.push({ nodes: helpers.rectPath(x + 3, 3, cardW - 6, height - 6, 0), closed: true });
    }
    const r = Math.min(8, cardW * 0.12);
    const rcx = x + cardW - r - 10;
    const rcy = 10 + r;
    paths.push({ nodes: helpers.ellipsePath(rcx, rcy, r, r), closed: true });
    if (isSel) {
      paths.push({ nodes: helpers.ellipsePath(rcx, rcy, r * 0.5, r * 0.5), closed: true });
    }
    paths.push({ nodes: helpers.rectPath(x + 10, height * 0.48, cardW * 0.65, 8, 0), closed: true });
    paths.push({ nodes: helpers.rectPath(x + 10, height * 0.68, cardW * 0.45, 6, 0), closed: true });
  }
  return paths;
}`,
  },

  // 6. Dropdown Select Menu
  {
    id: 'ui-dropdown-select',
    name: 'Dropdown Select Popover',
    category: 'User Interface',
    description: 'Select trigger input with expandable popover menu list and active option highlight.',
    iconName: 'ChevronDown',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click header to toggle menu or click an option row in Preview Mode to select',
    paramSchema: [
      { key: 'isOpen', label: 'Menu Open', type: 'boolean', defaultValue: true },
      { key: 'selectedIdx', label: 'Selected Option (1-4)', type: 'number', min: 1, max: 4, step: 1, defaultValue: 2 },
      { key: 'triggerRatio', label: 'Trigger Height Ratio', type: 'number', min: 0.18, max: 0.4, step: 0.01, defaultValue: 0.24 },
    ],
    defaultParams: { isOpen: true, selectedIdx: 2, triggerRatio: 0.24 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const trigH = helpers.clamp(Number(params.triggerRatio) || 0.24, 0.18, 0.4) * height;
  const sel = Math.round(helpers.clamp(Number(params.selectedIdx) || 2, 1, 4));
  return [
    { id: 'triggerRatio', label: \`Trigger: \${Math.round((trigH / height) * 100)}%\`, x: width * 0.5, y: trigH, cursor: 'ns-resize' },
    { id: 'selectedIdx', label: \`Option #\${sel}\`, x: width - 16, y: trigH + ((sel - 0.5) / 4) * (height - trigH), cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'triggerRatio') {
    return { ...params, triggerRatio: Number(helpers.clamp(localY / Math.max(1, height), 0.18, 0.4).toFixed(2)) };
  }
  if (id === 'selectedIdx') {
    const trigH = helpers.clamp(Number(params.triggerRatio) || 0.24, 0.18, 0.4) * height;
    const idx = helpers.clamp(Math.floor(((localY - trigH) / Math.max(1, height - trigH)) * 4) + 1, 1, 4);
    return { ...params, selectedIdx: idx };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const trigH = helpers.clamp(Number(params.triggerRatio) || 0.24, 0.18, 0.4) * height;
  if (localY <= trigH) {
    return { ...params, isOpen: !params.isOpen };
  }
  const idx = helpers.clamp(Math.floor(((localY - trigH) / Math.max(1, height - trigH)) * 4) + 1, 1, 4);
  return { ...params, isOpen: true, selectedIdx: idx };
}

function buildPaths(width, height, params, helpers) {
  const isOpen = params.isOpen !== false;
  const sel = Math.round(helpers.clamp(Number(params.selectedIdx) || 2, 1, 4));
  const trigH = helpers.clamp(Number(params.triggerRatio) || 0.24, 0.18, 0.4) * height;
  const padX = Math.min(12, width * 0.06);
  const chevR = Math.min(5, width * 0.04, trigH * 0.22);
  const chevCx = width - padX - chevR;
  const trigR = Math.min(8, trigH * 0.35);
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, trigH, trigR), closed: true },
    { nodes: helpers.rectPath(padX, trigH * 0.32, Math.max(8, (chevCx - chevR - padX) * 0.68), Math.max(3, trigH * 0.36), Math.min(4, trigH * 0.18)), closed: true },
    { nodes: helpers.polygonPath([{ x: chevCx - chevR, y: trigH * 0.42 }, { x: chevCx, y: trigH * 0.58 }, { x: chevCx + chevR, y: trigH * 0.42 }], false), closed: false }
  ];
  if (isOpen) {
    const gap = Math.min(6, height * 0.04);
    const menuY = trigH + gap;
    const menuH = Math.max(8, height - menuY);
    const padY = Math.min(4, menuH * 0.05);
    paths.push({ nodes: helpers.rectPath(0, menuY, width, menuH, 0), closed: true });
    const rowH = Math.max(2, (menuH - padY * 2) / 4);
    const rowInsetX = Math.min(6, width * 0.03);
    const rowInsetY = Math.min(2, rowH * 0.14);
    const btnH = Math.max(4, rowH - rowInsetY * 2);
    const btnR = Math.min(7, btnH * 0.4);
    for (let i = 0; i < 4; i++) {
      const ry = menuY + padY + i * rowH;
      const bx = rowInsetX;
      const by = ry + rowInsetY;
      const bw = Math.max(6, width - rowInsetX * 2);
      paths.push({ nodes: helpers.rectPath(bx, by, bw, btnH, btnR), closed: true });
      if (i + 1 === sel) {
        paths.push({ nodes: helpers.rectPath(bx + 2.5, by + 2.5, Math.max(4, bw - 5), Math.max(2, btnH - 5), Math.max(2, btnR - 2)), closed: true });
      }
    }
  }
  return paths;
}`,
  },

  // 7. Pagination Bar
  {
    id: 'ui-pagination-bar',
    name: 'Pagination Bar',
    category: 'User Interface',
    description: 'Horizontal page number buttons with prev/next arrows and active page highlight.',
    iconName: 'MoreHorizontal',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click any page button in Preview Mode to change the active page',
    paramSchema: [
      { key: 'pageCount', label: 'Visible Pages', type: 'number', min: 3, max: 7, step: 1, defaultValue: 5 },
      { key: 'activePage', label: 'Active Page', type: 'number', min: 1, max: 7, step: 1, defaultValue: 2 },
      { key: 'radius', label: 'Button Corner Radius', type: 'number', min: 2, max: 20, step: 1, defaultValue: 6 },
    ],
    defaultParams: { pageCount: 5, activePage: 2, radius: 6 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.pageCount) || 5, 3, 7));
  const active = Math.round(helpers.clamp(Number(params.activePage) || 2, 1, count));
  const totalSlots = count + 2;
  const slotW = width / totalSlots;
  return [
    { id: 'activePage', label: \`Page \${active}\`, x: (active + 0.5) * slotW, y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.pageCount) || 5, 3, 7));
  const totalSlots = count + 2;
  if (id === 'activePage') {
    const slot = Math.floor((localX / Math.max(1, width)) * totalSlots);
    const page = helpers.clamp(slot, 1, count);
    return { ...params, activePage: page };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.pageCount) || 5, 3, 7));
  const active = Math.round(helpers.clamp(Number(params.activePage) || 2, 1, count));
  const totalSlots = count + 2;
  const slot = Math.floor((localX / Math.max(1, width)) * totalSlots);
  if (slot <= 0) return { ...params, activePage: Math.max(1, active - 1) };
  if (slot >= totalSlots - 1) return { ...params, activePage: Math.min(count, active + 1) };
  return { ...params, activePage: helpers.clamp(slot, 1, count) };
}

function buildPaths(width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.pageCount) || 5, 3, 7));
  const active = Math.round(helpers.clamp(Number(params.activePage) || 2, 1, count));
  const r = helpers.clamp(Number(params.radius) ?? 6, 2, 20);
  const totalSlots = count + 2;
  const gap = 6;
  const btnW = (width - gap * (totalSlots - 1)) / totalSlots;
  const paths = [];
  for (let i = 0; i < totalSlots; i++) {
    const bx = i * (btnW + gap);
    paths.push({ nodes: helpers.rectPath(bx, 0, btnW, height, r), closed: true });
    const cx = bx + btnW * 0.5;
    const cy = height * 0.5;
    if (i === 0) {
      paths.push({ nodes: helpers.polygonPath([{ x: cx + 3, y: cy - 5 }, { x: cx - 3, y: cy }, { x: cx + 3, y: cy + 5 }], false), closed: false });
    } else if (i === totalSlots - 1) {
      paths.push({ nodes: helpers.polygonPath([{ x: cx - 3, y: cy - 5 }, { x: cx + 3, y: cy }, { x: cx - 3, y: cy + 5 }], false), closed: false });
    } else {
      const pageIdx = i;
      if (pageIdx === active) {
        paths.push({ nodes: helpers.rectPath(bx + 4, 4, btnW - 8, height - 8, Math.max(2, r - 2)), closed: true });
      }
      paths.push({ nodes: helpers.ellipsePath(cx, cy, Math.min(4, btnW * 0.16), Math.min(4, height * 0.16)), closed: true });
    }
  }
  return paths;
}`,
  },

  // 8. Stepper Wizard
  {
    id: 'ui-stepper-wizard',
    name: 'Multi-Step Progress Wizard',
    category: 'User Interface',
    description: 'Connected multi-step checkout/onboarding progress nodes with completed checkmarks.',
    iconName: 'GitCommitHorizontal',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click any step node in Preview Mode to advance or rewind the wizard',
    paramSchema: [
      { key: 'stepCount', label: 'Total Steps', type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
      { key: 'currentStep', label: 'Current Step', type: 'number', min: 1, max: 6, step: 1, defaultValue: 3 },
      { key: 'nodeRadius', label: 'Node Radius (px)', type: 'number', min: 10, max: 26, step: 1, defaultValue: 16 },
    ],
    defaultParams: { stepCount: 4, currentStep: 3, nodeRadius: 16 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.stepCount) || 4, 3, 6));
  const cur = Math.round(helpers.clamp(Number(params.currentStep) || 3, 1, count));
  const nr = helpers.clamp(Number(params.nodeRadius) || 16, 10, 26);
  const padX = nr + 10;
  const span = Math.max(20, width - padX * 2);
  const cx = padX + ((cur - 1) / (count - 1)) * span;
  return [
    { id: 'currentStep', label: \`Step \${cur}/\${count}\`, x: cx, y: height * 0.4, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.stepCount) || 4, 3, 6));
  if (id === 'currentStep') {
    const idx = helpers.clamp(Math.round((localX / Math.max(1, width)) * (count - 1)) + 1, 1, count);
    return { ...params, currentStep: idx };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.stepCount) || 4, 3, 6));
  const idx = helpers.clamp(Math.floor((localX / Math.max(1, width)) * count) + 1, 1, count);
  return { ...params, currentStep: idx };
}

function buildPaths(width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.stepCount) || 4, 3, 6));
  const cur = Math.round(helpers.clamp(Number(params.currentStep) || 3, 1, count));
  const nr = helpers.clamp(Number(params.nodeRadius) || 16, 10, 26);
  const padX = nr + 12;
  const span = Math.max(20, width - padX * 2);
  const cy = height * 0.4;
  const paths = [];

  for (let i = 0; i < count; i++) {
    const cx = padX + (i / (count - 1)) * span;
    if (i < count - 1) {
      const nextX = padX + ((i + 1) / (count - 1)) * span;
      paths.push({ nodes: helpers.rectPath(cx + nr, cy - 2, nextX - cx - nr * 2, 4, 2), closed: true });
    }
    paths.push({ nodes: helpers.ellipsePath(cx, cy, nr, nr), closed: true });
    if (i + 1 < cur) {
      paths.push({
        nodes: helpers.polygonPath([
          { x: cx - nr * 0.35, y: cy },
          { x: cx - nr * 0.08, y: cy + nr * 0.3 },
          { x: cx + nr * 0.38, y: cy - nr * 0.28 }
        ], false),
        closed: false
      });
    } else if (i + 1 === cur) {
      paths.push({ nodes: helpers.ellipsePath(cx, cy, nr * 0.45, nr * 0.45), closed: true });
    }
    paths.push({ nodes: helpers.rectPath(cx - nr * 1.1, cy + nr + 8, nr * 2.2, 6, 3), closed: true });
  }
  return paths;
}`,
  },

  // 9. Star Rating Bar
  {
    id: 'ui-star-rating',
    name: 'Interactive Star Rating',
    category: 'User Interface',
    description: 'Row of 5-pointed rating stars with interactive rating selection and inner fill rings.',
    iconName: 'Star',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click any star in Preview Mode to set the rating (1 to 5 stars)',
    paramSchema: [
      { key: 'maxStars', label: 'Total Stars', type: 'number', min: 3, max: 7, step: 1, defaultValue: 5 },
      { key: 'rating', label: 'Active Rating', type: 'number', min: 1, max: 7, step: 1, defaultValue: 4 },
      { key: 'innerRatio', label: 'Star Point Sharpness', type: 'number', min: 0.3, max: 0.65, step: 0.01, defaultValue: 0.44 },
    ],
    defaultParams: { maxStars: 5, rating: 4, innerRatio: 0.44 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const maxS = Math.round(helpers.clamp(Number(params.maxStars) || 5, 3, 7));
  const rating = Math.round(helpers.clamp(Number(params.rating) || 4, 1, maxS));
  const slotW = width / maxS;
  return [
    { id: 'rating', label: \`Rating: \${rating}/\${maxS}\`, x: (rating - 0.5) * slotW, y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  const maxS = Math.round(helpers.clamp(Number(params.maxStars) || 5, 3, 7));
  if (id === 'rating') {
    const r = helpers.clamp(Math.floor((localX / Math.max(1, width)) * maxS) + 1, 1, maxS);
    return { ...params, rating: r };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const maxS = Math.round(helpers.clamp(Number(params.maxStars) || 5, 3, 7));
  const r = helpers.clamp(Math.floor((localX / Math.max(1, width)) * maxS) + 1, 1, maxS);
  return { ...params, rating: r };
}

function buildPaths(width, height, params, helpers) {
  const maxS = Math.round(helpers.clamp(Number(params.maxStars) || 5, 3, 7));
  const rating = Math.round(helpers.clamp(Number(params.rating) || 4, 1, maxS));
  const innerRatio = helpers.clamp(Number(params.innerRatio) || 0.44, 0.3, 0.65);
  const slotW = width / maxS;
  const outerR = Math.min(slotW, height) * 0.42;
  const innerR = outerR * innerRatio;
  const cy = height * 0.5;
  const paths = [];

  for (let s = 0; s < maxS; s++) {
    const cx = (s + 0.5) * slotW;
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rad = i % 2 === 0 ? outerR : innerR;
      pts.push({ x: cx + Math.cos(a) * rad, y: cy + Math.sin(a) * rad });
    }
    paths.push({ nodes: helpers.polygonPath(pts), closed: true });
    if (s < rating) {
      paths.push({ nodes: helpers.ellipsePath(cx, cy, innerR * 0.55, innerR * 0.55), closed: true });
    }
  }
  return paths;
}`,
  },

  // 10. Number Stepper Counter
  {
    id: 'ui-number-counter',
    name: 'Numeric Quantity Stepper',
    category: 'User Interface',
    description: 'Minus / Plus stepper control with central quantity indicator bars.',
    iconName: 'PlusCircle',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click left (-) or right (+) button in Preview Mode to decrement or increment',
    paramSchema: [
      { key: 'count', label: 'Quantity Count', type: 'number', min: 1, max: 10, step: 1, defaultValue: 3 },
      { key: 'btnRatio', label: 'Button Width Ratio', type: 'number', min: 0.2, max: 0.35, step: 0.01, defaultValue: 0.28 },
      { key: 'radius', label: 'Corner Radius', type: 'number', min: 4, max: 24, step: 1, defaultValue: 10 },
    ],
    defaultParams: { count: 3, btnRatio: 0.28, radius: 10 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const btnW = helpers.clamp(Number(params.btnRatio) || 0.28, 0.2, 0.35) * width;
  const count = Math.round(helpers.clamp(Number(params.count) || 3, 1, 10));
  return [
    { id: 'btnRatio', label: \`Btn Width: \${Math.round((btnW / width) * 100)}%\`, x: btnW, y: height * 0.5, cursor: 'ew-resize' },
    { id: 'count', label: \`Value: \${count}\`, x: width * 0.5, y: height * 0.25, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'btnRatio') {
    return { ...params, btnRatio: Number(helpers.clamp(localX / Math.max(1, width), 0.2, 0.35).toFixed(2)) };
  }
  if (id === 'count') {
    const c = Math.round(helpers.clamp((localX / Math.max(1, width)) * 10, 1, 10));
    return { ...params, count: c };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.count) || 3, 1, 10));
  if (localX < width * 0.4) {
    return { ...params, count: Math.max(1, count - 1) };
  }
  if (localX > width * 0.6) {
    return { ...params, count: Math.min(10, count + 1) };
  }
  return params;
}

function buildPaths(width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.count) || 3, 1, 10));
  const btnW = helpers.clamp(Number(params.btnRatio) || 0.28, 0.2, 0.35) * width;
  const r = helpers.clamp(Number(params.radius) ?? 10, 4, 24);
  const cy = height * 0.5;
  const iconR = Math.min(btnW, height) * 0.22;

  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, r), closed: true },
    { nodes: helpers.polygonPath([{ x: btnW, y: 0 }, { x: btnW, y: height }], false), closed: false },
    { nodes: helpers.polygonPath([{ x: width - btnW, y: 0 }, { x: width - btnW, y: height }], false), closed: false },
    // Minus sign
    { nodes: helpers.rectPath(btnW * 0.5 - iconR, cy - 2, iconR * 2, 4, 2), closed: true },
    // Plus sign
    { nodes: helpers.rectPath(width - btnW * 0.5 - iconR, cy - 2, iconR * 2, 4, 2), closed: true },
    { nodes: helpers.rectPath(width - btnW * 0.5 - 2, cy - iconR, 4, iconR * 2, 2), closed: true }
  ];

  const midW = width - btnW * 2 - 16;
  const pipW = Math.max(3, (midW - (count - 1) * 3) / count);
  for (let i = 0; i < count; i++) {
    paths.push({
      nodes: helpers.rectPath(btnW + 8 + i * (pipW + 3), height * 0.32, pipW, height * 0.36, 2),
      closed: true
    });
  }
  return paths;
}`,
  },

  // 11. Search & Filter Bar
  {
    id: 'ui-search-filter-bar',
    name: 'Search & Filter Omnibar',
    category: 'User Interface',
    description: 'Search input with magnifying glass icon, query bar, and clickable filter pills.',
    iconName: 'Search',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click filter chips on the right in Preview Mode to cycle active filter',
    paramSchema: [
      { key: 'filterCount', label: 'Filter Chips', type: 'number', min: 1, max: 4, step: 1, defaultValue: 3 },
      { key: 'activeFilter', label: 'Active Filter', type: 'number', min: 1, max: 4, step: 1, defaultValue: 1 },
      { key: 'searchRatio', label: 'Search Input Ratio', type: 'number', min: 0.35, max: 0.7, step: 0.01, defaultValue: 0.52 },
    ],
    defaultParams: { filterCount: 3, activeFilter: 1, searchRatio: 0.52 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const sRatio = helpers.clamp(Number(params.searchRatio) || 0.52, 0.35, 0.7);
  return [
    { id: 'searchRatio', label: \`Input: \${Math.round(sRatio * 100)}%\`, x: width * sRatio, y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'searchRatio') {
    return { ...params, searchRatio: Number(helpers.clamp(localX / Math.max(1, width), 0.35, 0.7).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.filterCount) || 3, 1, 4));
  const cur = Math.round(helpers.clamp(Number(params.activeFilter) || 1, 1, count));
  return { ...params, activeFilter: (cur % count) + 1 };
}

function buildPaths(width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.filterCount) || 3, 1, 4));
  const active = Math.round(helpers.clamp(Number(params.activeFilter) || 1, 1, count));
  const sRatio = helpers.clamp(Number(params.searchRatio) || 0.52, 0.35, 0.7);
  const cy = height * 0.5;
  const r = Math.min(12, height * 0.28);
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.ellipsePath(18, cy - 1, 6, 6), closed: true },
    { nodes: helpers.polygonPath([{ x: 22, y: cy + 3 }, { x: 27, y: cy + 8 }], false), closed: false },
    { nodes: helpers.rectPath(36, cy - 4, width * sRatio - 44, 8, 0), closed: true }
  ];

  const chipsStart = width * sRatio + 6;
  const chipsW = width - chipsStart - 8;
  const chipW = (chipsW - (count - 1) * 6) / count;
  for (let i = 0; i < count; i++) {
    const cx = chipsStart + i * (chipW + 6);
    paths.push({ nodes: helpers.rectPath(cx, height * 0.2, chipW, height * 0.6, height * 0.3), closed: true });
    if (i + 1 === active) {
      paths.push({ nodes: helpers.rectPath(cx + 4, height * 0.2 + 4, chipW - 8, height * 0.6 - 8, height * 0.2), closed: true });
    }
  }
  return paths;
}`,
  },

  // 12. Tag Chips Input
  {
    id: 'ui-tag-chips',
    name: 'Dismissible Tag Chips',
    category: 'User Interface',
    description: 'Multi-tag pill bar with close X icons and interactive active chip highlight.',
    iconName: 'Tags',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click any tag chip in Preview Mode to highlight or toggle it',
    paramSchema: [
      { key: 'chipCount', label: 'Tag Count', type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
      { key: 'activeChip', label: 'Selected Tag', type: 'number', min: 1, max: 5, step: 1, defaultValue: 2 },
      { key: 'pillRoundness', label: 'Pill Roundness', type: 'number', min: 4, max: 24, step: 1, defaultValue: 16 },
    ],
    defaultParams: { chipCount: 3, activeChip: 2, pillRoundness: 16 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.chipCount) || 3, 2, 5));
  const active = Math.round(helpers.clamp(Number(params.activeChip) || 2, 1, count));
  const slotW = width / count;
  return [
    { id: 'activeChip', label: \`Tag #\${active}\`, x: (active - 0.5) * slotW, y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.chipCount) || 3, 2, 5));
  if (id === 'activeChip') {
    const idx = helpers.clamp(Math.floor((localX / Math.max(1, width)) * count) + 1, 1, count);
    return { ...params, activeChip: idx };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.chipCount) || 3, 2, 5));
  const idx = helpers.clamp(Math.floor((localX / Math.max(1, width)) * count) + 1, 1, count);
  return { ...params, activeChip: idx };
}

function buildPaths(width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.chipCount) || 3, 2, 5));
  const active = Math.round(helpers.clamp(Number(params.activeChip) || 2, 1, count));
  const r = helpers.clamp(Number(params.pillRoundness) || 16, 4, 24);
  const gap = 8;
  const chipW = (width - gap * (count - 1)) / count;
  const cy = height * 0.5;
  const paths = [];
  for (let i = 0; i < count; i++) {
    const x = i * (chipW + gap);
    paths.push({ nodes: helpers.rectPath(x, height * 0.12, chipW, height * 0.76, r), closed: true });
    if (i + 1 === active) {
      paths.push({ nodes: helpers.rectPath(x + 3, height * 0.12 + 3, chipW - 6, height * 0.76 - 6, Math.max(2, r - 3)), closed: true });
    }
    paths.push({ nodes: helpers.rectPath(x + 10, cy - 3, Math.max(10, chipW - 30), 6, 3), closed: true });
    const xx = x + chipW - 12;
    paths.push({ nodes: helpers.polygonPath([{ x: xx - 3, y: cy - 3 }, { x: xx + 3, y: cy + 3 }], false), closed: false });
    paths.push({ nodes: helpers.polygonPath([{ x: xx + 3, y: cy - 3 }, { x: xx - 3, y: cy + 3 }], false), closed: false });
  }
  return paths;
}`,
  },

  // 13. Toast Notification Banner
  {
    id: 'ui-toast-banner',
    name: 'Toast Alert Notification',
    category: 'User Interface',
    description: 'Floating status toast notification with status icon, message bars, and countdown progress bar.',
    iconName: 'Bell',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to scrub the toast auto-dismiss progress bar',
    paramSchema: [
      { key: 'progress', label: 'Timer Progress', type: 'number', min: 0.05, max: 1, step: 0.05, defaultValue: 0.72 },
      { key: 'radius', label: 'Corner Radius', type: 'number', min: 0, max: 20, step: 1, defaultValue: 0 },
      { key: 'showAction', label: 'Show Action Button', type: 'boolean', defaultValue: true },
    ],
    defaultParams: { progress: 0.72, radius: 0, showAction: true },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const prog = helpers.clamp(Number(params.progress) || 0.72, 0.05, 1);
  return [
    { id: 'progress', label: \`Timer: \${Math.round(prog * 100)}%\`, x: width * prog, y: height - 4, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'progress') {
    return { ...params, progress: Number(helpers.clamp(localX / Math.max(1, width), 0.05, 1).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const next = Number(helpers.clamp(localX / Math.max(1, width), 0.1, 1).toFixed(2));
  return { ...params, progress: next, showAction: !params.showAction };
}

function buildPaths(width, height, params, helpers) {
  const prog = helpers.clamp(Number(params.progress) || 0.72, 0.05, 1);
  const r = helpers.clamp(Number(params.radius) ?? 0, 0, 20);
  const showAction = params.showAction !== false;
  const cy = height * 0.46;
  const iconR = Math.min(14, height * 0.24);
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, r), closed: true },
    { nodes: helpers.ellipsePath(16 + iconR, cy, iconR, iconR), closed: true },
    { nodes: helpers.polygonPath([
      { x: 16 + iconR * 0.65, y: cy },
      { x: 16 + iconR * 0.95, y: cy + iconR * 0.32 },
      { x: 16 + iconR * 1.4, y: cy - iconR * 0.3 }
    ], false), closed: false },
    { nodes: helpers.rectPath(26 + iconR * 2, height * 0.26, width * 0.42, 7, 0), closed: true },
    { nodes: helpers.rectPath(26 + iconR * 2, height * 0.52, width * 0.3, 6, 0), closed: true },
    { nodes: helpers.rectPath(6, height - 6, (width - 12) * prog, 4, 0), closed: true }
  ];
  if (showAction) {
    paths.push({ nodes: helpers.rectPath(width - 62, height * 0.26, 48, height * 0.44, height * 0.22), closed: true });
  }
  return paths;
}`,
  },

  // 14. Modal Dialog Window
  {
    id: 'ui-modal-dialog',
    name: 'Modal Dialog Box',
    category: 'User Interface',
    description: 'Centered modal window with header bar, close button, content body, and footer CTA buttons.',
    iconName: 'AppWindow',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click footer buttons in Preview Mode to toggle active primary CTA button',
    paramSchema: [
      { key: 'headerRatio', label: 'Header Ratio', type: 'number', min: 0.14, max: 0.3, step: 0.01, defaultValue: 0.2 },
      { key: 'footerRatio', label: 'Footer Ratio', type: 'number', min: 0.16, max: 0.32, step: 0.01, defaultValue: 0.22 },
      { key: 'activeBtn', label: 'Active Footer CTA (1-2)', type: 'number', min: 1, max: 2, step: 1, defaultValue: 2 },
    ],
    defaultParams: { headerRatio: 0.2, footerRatio: 0.22, activeBtn: 2 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const hRatio = helpers.clamp(Number(params.headerRatio) || 0.2, 0.14, 0.3);
  const fRatio = helpers.clamp(Number(params.footerRatio) || 0.22, 0.16, 0.32);
  return [
    { id: 'headerRatio', label: \`Header: \${Math.round(hRatio * 100)}%\`, x: width * 0.5, y: height * hRatio, cursor: 'ns-resize' },
    { id: 'footerRatio', label: \`Footer: \${Math.round(fRatio * 100)}%\`, x: width * 0.5, y: height * (1 - fRatio), cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'headerRatio') {
    return { ...params, headerRatio: Number(helpers.clamp(localY / Math.max(1, height), 0.14, 0.3).toFixed(2)) };
  }
  if (id === 'footerRatio') {
    return { ...params, footerRatio: Number(helpers.clamp((height - localY) / Math.max(1, height), 0.16, 0.32).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const cur = Math.round(helpers.clamp(Number(params.activeBtn) || 2, 1, 2));
  return { ...params, activeBtn: cur === 1 ? 2 : 1 };
}

function buildPaths(width, height, params, helpers) {
  const hh = helpers.clamp(Number(params.headerRatio) || 0.2, 0.14, 0.3) * height;
  const fh = helpers.clamp(Number(params.footerRatio) || 0.22, 0.16, 0.32) * height;
  const activeBtn = Math.round(helpers.clamp(Number(params.activeBtn) || 2, 1, 2));
  const fy = height - fh;
  const btnW = Math.min(76, width * 0.26);
  const btnH = fh * 0.58;
  const by = fy + (fh - btnH) * 0.5;

  const btnR = Math.min(14, btnH * 0.5);
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.polygonPath([{ x: 0, y: hh }, { x: width, y: hh }], false), closed: false },
    { nodes: helpers.polygonPath([{ x: 0, y: fy }, { x: width, y: fy }], false), closed: false },
    { nodes: helpers.rectPath(16, hh * 0.35, width * 0.45, hh * 0.3, 0), closed: true },
    { nodes: helpers.ellipsePath(width - 20, hh * 0.5, 7, 7), closed: true },
    { nodes: helpers.rectPath(16, hh + 14, width - 32, (fy - hh - 28) * 0.45, 0), closed: true },
    { nodes: helpers.rectPath(16, hh + 20 + (fy - hh - 28) * 0.45, (width - 32) * 0.72, (fy - hh - 28) * 0.35, 0), closed: true },
    { nodes: helpers.rectPath(width - btnW * 2 - 24, by, btnW, btnH, btnR), closed: true },
    { nodes: helpers.rectPath(width - btnW - 14, by, btnW, btnH, btnR), closed: true }
  ];
  const selX = activeBtn === 1 ? width - btnW * 2 - 24 : width - btnW - 14;
  paths.push({ nodes: helpers.rectPath(selX + 3, by + 3, btnW - 6, btnH - 6, Math.max(4, btnR - 3)), closed: true });
  return paths;
}`,
  },

  // 15. Command Palette (Cmd+K)
  {
    id: 'ui-command-palette',
    name: 'Command Palette (Cmd+K)',
    category: 'User Interface',
    description: 'Spotlight / Cmd+K quick-command modal with search bar, shortcut badges, and selectable results.',
    iconName: 'Terminal',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click any command result row in Preview Mode to move the active selection highlight',
    paramSchema: [
      { key: 'resultCount', label: 'Command Rows', type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
      { key: 'selectedRow', label: 'Highlighted Row', type: 'number', min: 1, max: 6, step: 1, defaultValue: 2 },
      { key: 'inputRatio', label: 'Search Bar Ratio', type: 'number', min: 0.16, max: 0.3, step: 0.01, defaultValue: 0.22 },
    ],
    defaultParams: { resultCount: 4, selectedRow: 2, inputRatio: 0.22 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const rows = Math.round(helpers.clamp(Number(params.resultCount) || 4, 3, 6));
  const sel = Math.round(helpers.clamp(Number(params.selectedRow) || 2, 1, rows));
  const ih = helpers.clamp(Number(params.inputRatio) || 0.22, 0.16, 0.3) * height;
  const rowH = (height - ih) / rows;
  return [
    { id: 'selectedRow', label: \`Command #\${sel}\`, x: width * 0.5, y: ih + (sel - 0.5) * rowH, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  const rows = Math.round(helpers.clamp(Number(params.resultCount) || 4, 3, 6));
  const ih = helpers.clamp(Number(params.inputRatio) || 0.22, 0.16, 0.3) * height;
  if (id === 'selectedRow') {
    const idx = helpers.clamp(Math.floor(((localY - ih) / Math.max(1, height - ih)) * rows) + 1, 1, rows);
    return { ...params, selectedRow: idx };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const rows = Math.round(helpers.clamp(Number(params.resultCount) || 4, 3, 6));
  const ih = helpers.clamp(Number(params.inputRatio) || 0.22, 0.16, 0.3) * height;
  const idx = helpers.clamp(Math.floor(((localY - ih) / Math.max(1, height - ih)) * rows) + 1, 1, rows);
  return { ...params, selectedRow: idx };
}

function buildPaths(width, height, params, helpers) {
  const rows = Math.round(helpers.clamp(Number(params.resultCount) || 4, 3, 6));
  const sel = Math.round(helpers.clamp(Number(params.selectedRow) || 2, 1, rows));
  const ih = helpers.clamp(Number(params.inputRatio) || 0.22, 0.16, 0.3) * height;
  const padX = Math.min(14, width * 0.05);
  const iconR = Math.min(6, ih * 0.24, width * 0.04);
  const kbdW = Math.min(28, width * 0.14);
  const searchX = padX + iconR * 2 + 6;
  const searchW = Math.max(10, (width - padX - kbdW - 8 - searchX) * 0.72);
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.polygonPath([{ x: 0, y: ih }, { x: width, y: ih }], false), closed: false },
    { nodes: helpers.ellipsePath(padX + iconR, ih * 0.5, iconR, iconR), closed: true },
    { nodes: helpers.rectPath(searchX, ih * 0.36, searchW, Math.max(2, ih * 0.28), 0), closed: true },
    { nodes: helpers.rectPath(width - padX - kbdW, ih * 0.28, kbdW, Math.max(2, ih * 0.44), 0), closed: true }
  ];
  const padY = Math.min(4, (height - ih) * 0.04);
  const listH = Math.max(6, height - ih - padY * 2);
  const rowH = listH / rows;
  const rowInsetX = Math.min(8, width * 0.03);
  const rowInsetY = Math.min(2, rowH * 0.14);
  for (let i = 0; i < rows; i++) {
    const ry = ih + padY + i * rowH;
    if (i + 1 === sel) {
      paths.push({ nodes: helpers.rectPath(rowInsetX, ry + rowInsetY, Math.max(8, width - rowInsetX * 2), Math.max(2, rowH - rowInsetY * 2), 0), closed: true });
    }
    const rIconW = Math.min(10, rowH * 0.42, width * 0.05);
    const rBadgeW = Math.min(20, width * 0.1);
    const rTextX = padX + rIconW + 6;
    const rTextW = Math.max(8, (width - padX - rBadgeW - 8 - rTextX) * 0.68);
    paths.push({ nodes: helpers.rectPath(padX, ry + rowH * 0.32, rIconW, Math.max(2, rowH * 0.36), 0), closed: true });
    paths.push({ nodes: helpers.rectPath(rTextX, ry + rowH * 0.35, rTextW, Math.max(2, rowH * 0.3), 0), closed: true });
    paths.push({ nodes: helpers.rectPath(width - padX - rBadgeW, ry + rowH * 0.3, rBadgeW, Math.max(2, rowH * 0.4), 0), closed: true });
  }
  return paths;
}`,
  },

  // 16. Cookie Consent Banner
  {
    id: 'ui-cookie-banner',
    name: 'Cookie Consent Banner',
    category: 'User Interface',
    description: 'GDPR / privacy consent card with cookie icon, text lines, and Accept / Manage buttons.',
    iconName: 'ShieldCheck',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle between Accept All and Customize Preferences',
    paramSchema: [
      { key: 'accepted', label: 'Accept Highlighted', type: 'boolean', defaultValue: true },
      { key: 'btnWidthRatio', label: 'Button Area Ratio', type: 'number', min: 0.25, max: 0.48, step: 0.01, defaultValue: 0.34 },
      { key: 'radius', label: 'Corner Radius', type: 'number', min: 0, max: 20, step: 1, defaultValue: 0 },
    ],
    defaultParams: { accepted: true, btnWidthRatio: 0.34, radius: 0 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const bw = helpers.clamp(Number(params.btnWidthRatio) || 0.34, 0.25, 0.48);
  return [
    { id: 'btnWidthRatio', label: \`CTA Area: \${Math.round(bw * 100)}%\`, x: width * (1 - bw), y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'btnWidthRatio') {
    const ratio = helpers.clamp((width - localX) / Math.max(1, width), 0.25, 0.48);
    return { ...params, btnWidthRatio: Number(ratio.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  return { ...params, accepted: !params.accepted };
}

function buildPaths(width, height, params, helpers) {
  const accepted = params.accepted !== false;
  const bw = helpers.clamp(Number(params.btnWidthRatio) || 0.34, 0.25, 0.48) * width;
  const r = helpers.clamp(Number(params.radius) ?? 0, 0, 20);
  const iconR = Math.min(16, height * 0.28);
  const cy = height * 0.5;
  const textX = 24 + iconR * 2;
  const textW = Math.max(30, width - textX - bw - 16);
  const btnW = (bw - 20) / 2;
  const btnH = height * 0.48;
  const btnR = Math.min(14, btnH * 0.5);
  const by = (height - btnH) * 0.5;
  const b1x = width - bw + 4;
  const b2x = b1x + btnW + 6;

  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, r), closed: true },
    { nodes: helpers.ellipsePath(14 + iconR, cy, iconR, iconR), closed: true },
    { nodes: helpers.ellipsePath(14 + iconR * 0.7, cy - iconR * 0.25, 2, 2), closed: true },
    { nodes: helpers.ellipsePath(14 + iconR * 1.25, cy + iconR * 0.2, 2, 2), closed: true },
    { nodes: helpers.rectPath(textX, height * 0.3, textW, 7, 0), closed: true },
    { nodes: helpers.rectPath(textX, height * 0.56, textW * 0.75, 6, 0), closed: true },
    { nodes: helpers.rectPath(b1x, by, btnW, btnH, btnR), closed: true },
    { nodes: helpers.rectPath(b2x, by, btnW, btnH, btnR), closed: true }
  ];
  const hx = accepted ? b2x : b1x;
  paths.push({ nodes: helpers.rectPath(hx + 3, by + 3, btnW - 6, btnH - 6, Math.max(4, btnR - 3)), closed: true });
  return paths;
}`,
  },

  // 17. Live Support Chat Widget
  {
    id: 'ui-chat-widget',
    name: 'Support Chat Popover',
    category: 'User Interface',
    description: 'Customer support / AI assistant chat window with header, alternating message bubbles, and composer.',
    iconName: 'MessageSquare',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle the conversation message count',
    paramSchema: [
      { key: 'msgCount', label: 'Message Bubbles', type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
      { key: 'headerRatio', label: 'Header Height Ratio', type: 'number', min: 0.14, max: 0.26, step: 0.01, defaultValue: 0.18 },
      { key: 'bubbleWidth', label: 'Bubble Width Ratio', type: 'number', min: 0.45, max: 0.8, step: 0.01, defaultValue: 0.65 },
    ],
    defaultParams: { msgCount: 3, headerRatio: 0.18, bubbleWidth: 0.65 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const hh = helpers.clamp(Number(params.headerRatio) || 0.18, 0.14, 0.26) * height;
  const bw = helpers.clamp(Number(params.bubbleWidth) || 0.65, 0.45, 0.8) * width;
  return [
    { id: 'headerRatio', label: \`Header: \${Math.round((hh / height) * 100)}%\`, x: width * 0.5, y: hh, cursor: 'ns-resize' },
    { id: 'bubbleWidth', label: \`Bubble: \${Math.round((bw / width) * 100)}%\`, x: bw, y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'headerRatio') {
    return { ...params, headerRatio: Number(helpers.clamp(localY / Math.max(1, height), 0.14, 0.26).toFixed(2)) };
  }
  if (id === 'bubbleWidth') {
    return { ...params, bubbleWidth: Number(helpers.clamp(localX / Math.max(1, width), 0.45, 0.8).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.msgCount) || 3, 2, 5));
  return { ...params, msgCount: count >= 5 ? 2 : count + 1 };
}

function buildPaths(width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.msgCount) || 3, 2, 5));
  const hh = helpers.clamp(Number(params.headerRatio) || 0.18, 0.14, 0.26) * height;
  const bw = helpers.clamp(Number(params.bubbleWidth) || 0.65, 0.45, 0.8) * (width - 24);
  const inputH = height * 0.16;
  const bodyH = height - hh - inputH - 16;
  const slotH = bodyH / count;

  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.polygonPath([{ x: 0, y: hh }, { x: width, y: hh }], false), closed: false },
    { nodes: helpers.ellipsePath(18, hh * 0.5, 8, 8), closed: true },
    { nodes: helpers.rectPath(32, hh * 0.36, width * 0.45, hh * 0.28, 0), closed: true },
    { nodes: helpers.rectPath(10, height - inputH - 6, width - 20, inputH, 0), closed: true },
    { nodes: helpers.ellipsePath(width - 10 - inputH * 0.5, height - 6 - inputH * 0.5, inputH * 0.34, inputH * 0.34), closed: true }
  ];

  for (let i = 0; i < count; i++) {
    const isAgent = i % 2 === 0;
    const bx = isAgent ? 12 : width - 12 - bw;
    const by = hh + 8 + i * slotH;
    paths.push({ nodes: helpers.rectPath(bx, by, bw, Math.max(12, slotH - 6), 0), closed: true });
  }
  return paths;
}`,
  },

  // 18. Theme Switcher Pill
  {
    id: 'ui-theme-switcher',
    name: 'Light / Dark Theme Switcher',
    category: 'User Interface',
    description: 'Sun & Moon mode toggle pill with sliding thumb indicator.',
    iconName: 'SunMoon',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle between Light (Sun) and Dark (Moon) modes',
    paramSchema: [
      { key: 'isDark', label: 'Dark Mode Active', type: 'boolean', defaultValue: false },
      { key: 'padding', label: 'Inner Padding (px)', type: 'number', min: 3, max: 12, step: 1, defaultValue: 5 },
    ],
    defaultParams: { isDark: false, padding: 5 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const isDark = Boolean(params.isDark);
  return [
    { id: 'isDark', label: isDark ? 'Dark Mode' : 'Light Mode', x: isDark ? width * 0.75 : width * 0.25, y: height * 0.5, cursor: 'pointer' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'isDark') {
    return { ...params, isDark: localX > width * 0.5 };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  return { ...params, isDark: !params.isDark };
}

function buildPaths(width, height, params, helpers) {
  const isDark = Boolean(params.isDark);
  const pad = helpers.clamp(Number(params.padding) || 5, 3, 12);
  const r = height * 0.5;
  const thumbW = (width - pad * 2) * 0.5;
  const thumbH = height - pad * 2;
  const thumbX = isDark ? width - pad - thumbW : pad;
  const leftCx = pad + thumbW * 0.5;
  const rightCx = width - pad - thumbW * 0.5;
  const cy = height * 0.5;
  const iconR = Math.min(thumbW, thumbH) * 0.26;

  return [
    { nodes: helpers.rectPath(0, 0, width, height, r), closed: true },
    { nodes: helpers.rectPath(thumbX, pad, thumbW, thumbH, thumbH * 0.5), closed: true },
    // Sun icon on left
    { nodes: helpers.ellipsePath(leftCx, cy, iconR, iconR), closed: true },
    // Moon crescent on right
    { nodes: helpers.ellipsePath(rightCx, cy, iconR, iconR), closed: true },
    { nodes: helpers.ellipsePath(rightCx + iconR * 0.35, cy - iconR * 0.2, iconR * 0.7, iconR * 0.7), closed: true }
  ];
}`,
  },

  // 19. Overlapping Avatar Group
  {
    id: 'ui-avatar-group',
    name: 'Overlapping Avatar Stack',
    category: 'User Interface',
    description: 'Overlapping team member avatar circles with user silhouettes and +N overflow badge.',
    iconName: 'Users',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle avatar overlap spacing',
    paramSchema: [
      { key: 'avatarCount', label: 'Avatar Count', type: 'number', min: 3, max: 7, step: 1, defaultValue: 4 },
      { key: 'overlapRatio', label: 'Overlap Ratio', type: 'number', min: 0.1, max: 0.45, step: 0.02, defaultValue: 0.24 },
      { key: 'activeAvatar', label: 'Focused Avatar', type: 'number', min: 1, max: 7, step: 1, defaultValue: 2 },
    ],
    defaultParams: { avatarCount: 4, overlapRatio: 0.24, activeAvatar: 2 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const overlap = helpers.clamp(Number(params.overlapRatio) || 0.24, 0.1, 0.45);
  return [
    { id: 'overlapRatio', label: \`Overlap: \${Math.round(overlap * 100)}%\`, x: width * (1 - overlap), y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'overlapRatio') {
    const o = helpers.clamp(1 - localX / Math.max(1, width), 0.1, 0.45);
    return { ...params, overlapRatio: Number(o.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.avatarCount) || 4, 3, 7));
  const idx = helpers.clamp(Math.floor((localX / Math.max(1, width)) * count) + 1, 1, count);
  return { ...params, activeAvatar: idx };
}

function buildPaths(width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.avatarCount) || 4, 3, 7));
  const overlap = helpers.clamp(Number(params.overlapRatio) || 0.24, 0.1, 0.45);
  const active = Math.round(helpers.clamp(Number(params.activeAvatar) || 2, 1, count));
  const r = Math.min(height * 0.44, width / (count * (1 - overlap) + overlap) * 0.5);
  const step = r * 2 * (1 - overlap);
  const totalW = r * 2 + (count - 1) * step;
  const startX = (width - totalW) * 0.5 + r;
  const cy = height * 0.5;
  const paths = [];

  for (let i = 0; i < count; i++) {
    const cx = startX + i * step;
    const yOff = i + 1 === active ? -4 : 0;
    paths.push({ nodes: helpers.ellipsePath(cx, cy + yOff, r, r), closed: true });
    if (i < count - 1) {
      paths.push({ nodes: helpers.ellipsePath(cx, cy + yOff - r * 0.2, r * 0.28, r * 0.28), closed: true });
      paths.push({ nodes: helpers.arcNodes(cx, cy + yOff + r * 0.65, r * 0.52, r * 0.42, 200, 140), closed: false });
    } else {
      paths.push({ nodes: helpers.rectPath(cx - r * 0.35, cy + yOff - 2, r * 0.7, 4, 2), closed: true });
      paths.push({ nodes: helpers.rectPath(cx - 2, cy + yOff - r * 0.35, 4, r * 0.7, 2), closed: true });
    }
  }
  return paths;
}`,
  },

  // 20. Datepicker Calendar Card
  {
    id: 'ui-Datepicker-card',
    name: 'Calendar Datepicker Card',
    category: 'User Interface',
    description: 'Monthly calendar grid card with navigation arrows and interactive selected day cell.',
    iconName: 'Calendar',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click any day cell in Preview Mode to select that calendar date',
    paramSchema: [
      { key: 'selectedDay', label: 'Selected Cell (1-20)', type: 'number', min: 1, max: 20, step: 1, defaultValue: 11 },
      { key: 'headerRatio', label: 'Header Ratio', type: 'number', min: 0.16, max: 0.3, step: 0.01, defaultValue: 0.22 },
      { key: 'radius', label: 'Card Radius', type: 'number', min: 0, max: 20, step: 1, defaultValue: 0 },
    ],
    defaultParams: { selectedDay: 11, headerRatio: 0.22, radius: 0 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const hh = helpers.clamp(Number(params.headerRatio) || 0.22, 0.16, 0.3) * height;
  return [
    { id: 'headerRatio', label: \`Header: \${Math.round((hh / height) * 100)}%\`, x: width * 0.5, y: hh, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'headerRatio') {
    return { ...params, headerRatio: Number(helpers.clamp(localY / Math.max(1, height), 0.16, 0.3).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const hh = helpers.clamp(Number(params.headerRatio) || 0.22, 0.16, 0.3) * height;
  const cols = 5;
  const rows = 4;
  const col = helpers.clamp(Math.floor((localX / Math.max(1, width)) * cols), 0, cols - 1);
  const row = helpers.clamp(Math.floor(((localY - hh) / Math.max(1, height - hh)) * rows), 0, rows - 1);
  return { ...params, selectedDay: row * cols + col + 1 };
}

function buildPaths(width, height, params, helpers) {
  const sel = Math.round(helpers.clamp(Number(params.selectedDay) || 11, 1, 20));
  const hh = helpers.clamp(Number(params.headerRatio) || 0.22, 0.16, 0.3) * height;
  const r = helpers.clamp(Number(params.radius) ?? 0, 0, 20);
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, r), closed: true },
    { nodes: helpers.polygonPath([{ x: 0, y: hh }, { x: width, y: hh }], false), closed: false },
    { nodes: helpers.rectPath(14, hh * 0.35, width * 0.42, hh * 0.3, 0), closed: true },
    { nodes: helpers.ellipsePath(width - 34, hh * 0.5, 6, 6), closed: true },
    { nodes: helpers.ellipsePath(width - 16, hh * 0.5, 6, 6), closed: true }
  ];
  const cols = 5;
  const rows = 4;
  const pad = 10;
  const cellW = (width - pad * 2) / cols;
  const cellH = (height - hh - pad * 2) / rows;
  for (let rIdx = 0; rIdx < rows; rIdx++) {
    for (let cIdx = 0; cIdx < cols; cIdx++) {
      const idx = rIdx * cols + cIdx + 1;
      const cx = pad + cIdx * cellW;
      const cy = hh + pad + rIdx * cellH;
      paths.push({ nodes: helpers.rectPath(cx + 3, cy + 3, cellW - 6, cellH - 6, 0), closed: true });
      if (idx === sel) {
        paths.push({ nodes: helpers.ellipsePath(cx + cellW * 0.5, cy + cellH * 0.5, Math.min(cellW, cellH) * 0.28, Math.min(cellW, cellH) * 0.28), closed: true });
      }
    }
  }
  return paths;
}`,
  },

  // 21. Split Hero Section
  {
    id: 'layout-hero-split',
    name: 'Split Hero Banner',
    category: 'Web & Layouts',
    description: '2-column landing page hero with headline stack, dual CTA buttons, and media preview frame.',
    iconName: 'LayoutTemplate',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to swap left/right media and copy columns',
    paramSchema: [
      { key: 'splitRatio', label: 'Column Split Ratio', type: 'number', min: 0.35, max: 0.65, step: 0.01, defaultValue: 0.5 },
      { key: 'mediaRight', label: 'Media on Right', type: 'boolean', defaultValue: true },
      { key: 'padding', label: 'Outer Padding', type: 'number', min: 8, max: 28, step: 1, defaultValue: 16 },
    ],
    defaultParams: { splitRatio: 0.5, mediaRight: true, padding: 16 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const split = helpers.clamp(Number(params.splitRatio) || 0.5, 0.35, 0.65);
  return [
    { id: 'splitRatio', label: \`Split: \${Math.round(split * 100)}%\`, x: width * split, y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'splitRatio') {
    return { ...params, splitRatio: Number(helpers.clamp(localX / Math.max(1, width), 0.35, 0.65).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  return { ...params, mediaRight: !params.mediaRight };
}

function buildPaths(width, height, params, helpers) {
  const split = helpers.clamp(Number(params.splitRatio) || 0.5, 0.35, 0.65);
  const mediaRight = params.mediaRight !== false;
  const pad = helpers.clamp(Number(params.padding) || 16, 8, 28);
  const gap = 14;
  const innerW = width - pad * 2 - gap;
  const leftW = innerW * split;
  const rightW = innerW * (1 - split);
  const copyX = mediaRight ? pad : pad + leftW + gap;
  const copyW = mediaRight ? leftW : rightW;
  const mediaX = mediaRight ? pad + leftW + gap : pad;
  const mediaW = mediaRight ? rightW : leftW;
  const innerH = height - pad * 2;

  const ctaR = Math.min(16, innerH * 0.08);
  return [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    // Badge (pill) + Headline/Subtext (sharp content bars) + Dual CTAs (rounded pill buttons)
    { nodes: helpers.rectPath(copyX, pad + innerH * 0.08, copyW * 0.42, innerH * 0.1, innerH * 0.05), closed: true },
    { nodes: helpers.rectPath(copyX, pad + innerH * 0.25, copyW * 0.92, innerH * 0.14, 0), closed: true },
    { nodes: helpers.rectPath(copyX, pad + innerH * 0.44, copyW * 0.76, innerH * 0.12, 0), closed: true },
    { nodes: helpers.rectPath(copyX, pad + innerH * 0.62, copyW * 0.85, innerH * 0.08, 0), closed: true },
    { nodes: helpers.rectPath(copyX, pad + innerH * 0.78, copyW * 0.44, innerH * 0.16, ctaR), closed: true },
    { nodes: helpers.rectPath(copyX + copyW * 0.48, pad + innerH * 0.78, copyW * 0.42, innerH * 0.16, ctaR), closed: true },
    // Media Box (sharp content block) + Play/Image Graphic
    { nodes: helpers.rectPath(mediaX, pad, mediaW, innerH, 0), closed: true },
    { nodes: helpers.ellipsePath(mediaX + mediaW * 0.5, pad + innerH * 0.5, Math.min(mediaW, innerH) * 0.18, Math.min(mediaW, innerH) * 0.18), closed: true }
  ];
}`,
  },

  // 22. Centered SaaS Hero
  {
    id: 'layout-hero-centered',
    name: 'Centered SaaS Hero',
    category: 'Web & Layouts',
    description: 'Centered announcement pill, hero headline, dual CTA buttons, and bottom app preview mockup.',
    iconName: 'Monitor',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle the bottom dashboard preview height',
    paramSchema: [
      { key: 'previewRatio', label: 'Preview Mockup Ratio', type: 'number', min: 0.25, max: 0.55, step: 0.01, defaultValue: 0.4 },
      { key: 'headlineWidth', label: 'Headline Width Ratio', type: 'number', min: 0.45, max: 0.85, step: 0.01, defaultValue: 0.68 },
    ],
    defaultParams: { previewRatio: 0.4, headlineWidth: 0.68 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const pRatio = helpers.clamp(Number(params.previewRatio) || 0.4, 0.25, 0.55);
  return [
    { id: 'previewRatio', label: \`Preview: \${Math.round(pRatio * 100)}%\`, x: width * 0.5, y: height * (1 - pRatio), cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'previewRatio') {
    const r = helpers.clamp((height - localY) / Math.max(1, height), 0.25, 0.55);
    return { ...params, previewRatio: Number(r.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const cur = helpers.clamp(Number(params.previewRatio) || 0.4, 0.25, 0.55);
  return { ...params, previewRatio: cur > 0.42 ? 0.32 : 0.48 };
}

function buildPaths(width, height, params, helpers) {
  const pRatio = helpers.clamp(Number(params.previewRatio) || 0.4, 0.25, 0.55);
  const hw = helpers.clamp(Number(params.headlineWidth) || 0.68, 0.45, 0.85) * width;
  const cx = width * 0.5;
  const topH = height * (1 - pRatio);
  const mockY = topH;
  const mockH = height - mockY - 10;

  const ctaR = Math.min(16, topH * 0.09);
  return [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.rectPath(cx - width * 0.16, topH * 0.12, width * 0.32, topH * 0.12, topH * 0.06), closed: true },
    { nodes: helpers.rectPath(cx - hw * 0.5, topH * 0.3, hw, topH * 0.16, 0), closed: true },
    { nodes: helpers.rectPath(cx - hw * 0.36, topH * 0.5, hw * 0.72, topH * 0.1, 0), closed: true },
    { nodes: helpers.rectPath(cx - width * 0.22, topH * 0.68, width * 0.2, topH * 0.18, ctaR), closed: true },
    { nodes: helpers.rectPath(cx + width * 0.02, topH * 0.68, width * 0.2, topH * 0.18, ctaR), closed: true },
    { nodes: helpers.rectPath(width * 0.1, mockY, width * 0.8, mockH, 0), closed: true },
    { nodes: helpers.polygonPath([{ x: width * 0.1, y: mockY + 14 }, { x: width * 0.9, y: mockY + 14 }], false), closed: false }
  ];
}`,
  },

  // 23. 4-Card Bento Grid
  {
    id: 'layout-bento-4',
    name: '4-Cell Bento Feature Grid',
    category: 'Web & Layouts',
    description: 'Modern 4-card Apple/Linear style Bento grid with adjustable horizontal and vertical splits.',
    iconName: 'LayoutGrid',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click any Bento card in Preview Mode to focus/expand its proportion',
    paramSchema: [
      { key: 'topSplit', label: 'Top Row Split', type: 'number', min: 0.3, max: 0.7, step: 0.01, defaultValue: 0.6 },
      { key: 'bottomSplit', label: 'Bottom Row Split', type: 'number', min: 0.3, max: 0.7, step: 0.01, defaultValue: 0.4 },
      { key: 'rowSplit', label: 'Vertical Split', type: 'number', min: 0.35, max: 0.65, step: 0.01, defaultValue: 0.5 },
    ],
    defaultParams: { topSplit: 0.6, bottomSplit: 0.4, rowSplit: 0.5 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const tSplit = helpers.clamp(Number(params.topSplit) || 0.6, 0.3, 0.7);
  const bSplit = helpers.clamp(Number(params.bottomSplit) || 0.4, 0.3, 0.7);
  const rSplit = helpers.clamp(Number(params.rowSplit) || 0.5, 0.35, 0.65);
  return [
    { id: 'topSplit', label: \`Top: \${Math.round(tSplit * 100)}%\`, x: width * tSplit, y: height * rSplit * 0.5, cursor: 'ew-resize' },
    { id: 'bottomSplit', label: \`Bottom: \${Math.round(bSplit * 100)}%\`, x: width * bSplit, y: height * (rSplit + (1 - rSplit) * 0.5), cursor: 'ew-resize' },
    { id: 'rowSplit', label: \`Row: \${Math.round(rSplit * 100)}%\`, x: width * 0.5, y: height * rSplit, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'topSplit') {
    return { ...params, topSplit: Number(helpers.clamp(localX / Math.max(1, width), 0.3, 0.7).toFixed(2)) };
  }
  if (id === 'bottomSplit') {
    return { ...params, bottomSplit: Number(helpers.clamp(localX / Math.max(1, width), 0.3, 0.7).toFixed(2)) };
  }
  if (id === 'rowSplit') {
    return { ...params, rowSplit: Number(helpers.clamp(localY / Math.max(1, height), 0.35, 0.65).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const isTop = localY < height * 0.5;
  const isLeft = localX < width * 0.5;
  return {
    ...params,
    topSplit: isTop ? (isLeft ? 0.65 : 0.35) : params.topSplit,
    bottomSplit: !isTop ? (isLeft ? 0.65 : 0.35) : params.bottomSplit,
    rowSplit: isTop ? 0.58 : 0.42
  };
}

function buildPaths(width, height, params, helpers) {
  const tSplit = helpers.clamp(Number(params.topSplit) || 0.6, 0.3, 0.7);
  const bSplit = helpers.clamp(Number(params.bottomSplit) || 0.4, 0.3, 0.7);
  const rSplit = helpers.clamp(Number(params.rowSplit) || 0.5, 0.35, 0.65);
  const gap = 10;
  const topH = (height - gap) * rSplit;
  const botH = height - gap - topH;
  const tlW = (width - gap) * tSplit;
  const trW = width - gap - tlW;
  const blW = (width - gap) * bSplit;
  const brW = width - gap - blW;

  const cells = [
    { x: 0, y: 0, w: tlW, h: topH },
    { x: tlW + gap, y: 0, w: trW, h: topH },
    { x: 0, y: topH + gap, w: blW, h: botH },
    { x: blW + gap, y: topH + gap, w: brW, h: botH }
  ];
  const paths = [];
  for (const c of cells) {
    paths.push({ nodes: helpers.rectPath(c.x, c.y, c.w, c.h, 0), closed: true });
    paths.push({ nodes: helpers.ellipsePath(c.x + 18, c.y + 18, 7, 7), closed: true });
    paths.push({ nodes: helpers.rectPath(c.x + 12, c.y + c.h - 24, c.w * 0.6, 7, 0), closed: true });
  }
  return paths;
}`,
  },

  // 24. Asymmetric 3-Panel Bento
  {
    id: 'layout-bento-asymmetric',
    name: 'Asymmetric Tall Bento Grid',
    category: 'Web & Layouts',
    description: '1 tall feature pillar card paired with 2 stacked secondary cards.',
    iconName: 'PanelLeft',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to flip the tall pillar between left and right sides',
    paramSchema: [
      { key: 'pillarRatio', label: 'Tall Pillar Width Ratio', type: 'number', min: 0.32, max: 0.65, step: 0.01, defaultValue: 0.45 },
      { key: 'pillarLeft', label: 'Pillar on Left', type: 'boolean', defaultValue: true },
      { key: 'rightSplit', label: 'Stacked Vertical Split', type: 'number', min: 0.3, max: 0.7, step: 0.01, defaultValue: 0.5 },
    ],
    defaultParams: { pillarRatio: 0.45, pillarLeft: true, rightSplit: 0.5 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const pRatio = helpers.clamp(Number(params.pillarRatio) || 0.45, 0.32, 0.65);
  const rSplit = helpers.clamp(Number(params.rightSplit) || 0.5, 0.3, 0.7);
  return [
    { id: 'pillarRatio', label: \`Pillar: \${Math.round(pRatio * 100)}%\`, x: width * pRatio, y: height * 0.5, cursor: 'ew-resize' },
    { id: 'rightSplit', label: \`Stack: \${Math.round(rSplit * 100)}%\`, x: width * 0.8, y: height * rSplit, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'pillarRatio') {
    return { ...params, pillarRatio: Number(helpers.clamp(localX / Math.max(1, width), 0.32, 0.65).toFixed(2)) };
  }
  if (id === 'rightSplit') {
    return { ...params, rightSplit: Number(helpers.clamp(localY / Math.max(1, height), 0.3, 0.7).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  return { ...params, pillarLeft: !params.pillarLeft };
}

function buildPaths(width, height, params, helpers) {
  const pRatio = helpers.clamp(Number(params.pillarRatio) || 0.45, 0.32, 0.65);
  const pillarLeft = params.pillarLeft !== false;
  const rSplit = helpers.clamp(Number(params.rightSplit) || 0.5, 0.3, 0.7);
  const gap = 10;
  const pW = (width - gap) * pRatio;
  const sW = width - gap - pW;
  const pX = pillarLeft ? 0 : sW + gap;
  const sX = pillarLeft ? pW + gap : 0;
  const topH = (height - gap) * rSplit;
  const botH = height - gap - topH;

  return [
    { nodes: helpers.rectPath(pX, 0, pW, height, 0), closed: true },
    { nodes: helpers.rectPath(pX + 14, 16, pW - 28, height * 0.45, 0), closed: true },
    { nodes: helpers.rectPath(pX + 14, height * 0.66, pW * 0.7, 10, 0), closed: true },
    { nodes: helpers.rectPath(sX, 0, sW, topH, 0), closed: true },
    { nodes: helpers.rectPath(sX + 14, topH * 0.35, sW * 0.65, 8, 0), closed: true },
    { nodes: helpers.rectPath(sX, topH + gap, sW, botH, 0), closed: true },
    { nodes: helpers.rectPath(sX + 14, topH + gap + botH * 0.35, sW * 0.55, 8, 0), closed: true }
  ];
}`,
  },

  // 25. Pricing Tier Card
  {
    id: 'layout-pricing-tier',
    name: 'SaaS Pricing Tier Card',
    category: 'Web & Layouts',
    description: 'Subscription plan card with popular badge, price header, feature checklist, and CTA button.',
    iconName: 'CreditCard',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle the Most Popular badge and annual billing state',
    paramSchema: [
      { key: 'featureCount', label: 'Feature Rows', type: 'number', min: 2, max: 6, step: 1, defaultValue: 4 },
      { key: 'isPopular', label: 'Popular Badge', type: 'boolean', defaultValue: true },
      { key: 'radius', label: 'Corner Radius', type: 'number', min: 0, max: 24, step: 1, defaultValue: 0 },
    ],
    defaultParams: { featureCount: 4, isPopular: true, radius: 0 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.featureCount) || 4, 2, 6));
  return [
    { id: 'featureCount', label: \`Features: \${count}\`, x: width * 0.5, y: height * 0.6, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'featureCount') {
    const c = Math.round(helpers.clamp(2 + (localY / Math.max(1, height)) * 4, 2, 6));
    return { ...params, featureCount: c };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  return { ...params, isPopular: !params.isPopular };
}

function buildPaths(width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.featureCount) || 4, 2, 6));
  const isPop = params.isPopular !== false;
  const r = helpers.clamp(Number(params.radius) ?? 0, 0, 24);
  const ctaH = height * 0.12;
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, r), closed: true },
    { nodes: helpers.rectPath(16, height * 0.1, width * 0.42, 8, 0), closed: true },
    { nodes: helpers.rectPath(16, height * 0.2, width * 0.55, 18, 0), closed: true },
    { nodes: helpers.polygonPath([{ x: 16, y: height * 0.34 }, { x: width - 16, y: height * 0.34 }], false), closed: false },
    { nodes: helpers.rectPath(16, height * 0.82, width - 32, ctaH, Math.min(16, ctaH * 0.5)), closed: true }
  ];
  if (isPop) {
    paths.push({ nodes: helpers.rectPath(width - 74, 12, 58, 16, 8), closed: true });
  }
  const listTop = height * 0.4;
  const listH = height * 0.38;
  const rowH = listH / count;
  for (let i = 0; i < count; i++) {
    const ry = listTop + i * rowH;
    paths.push({ nodes: helpers.ellipsePath(22, ry + rowH * 0.4, 5, 5), closed: true });
    paths.push({ nodes: helpers.rectPath(34, ry + rowH * 0.28, (width - 54) * (0.7 + (i % 2) * 0.2), 6, 0), closed: true });
  }
  return paths;
}`,
  },

  // 26. 3-Tier Pricing Matrix
  {
    id: 'layout-pricing-matrix',
    name: '3-Tier Pricing Comparison',
    category: 'Web & Layouts',
    description: 'Side-by-side 3-column pricing table with elevated featured tier.',
    iconName: 'Columns3',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click any pricing column in Preview Mode to make it the featured plan',
    paramSchema: [
      { key: 'featuredCol', label: 'Featured Column (1-3)', type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
      { key: 'gap', label: 'Column Gap (px)', type: 'number', min: 6, max: 24, step: 1, defaultValue: 12 },
    ],
    defaultParams: { featuredCol: 2, gap: 12 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const feat = Math.round(helpers.clamp(Number(params.featuredCol) || 2, 1, 3));
  return [
    { id: 'featuredCol', label: \`Featured: Tier \${feat}\`, x: ((feat - 0.5) / 3) * width, y: 12, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'featuredCol') {
    const idx = helpers.clamp(Math.floor((localX / Math.max(1, width)) * 3) + 1, 1, 3);
    return { ...params, featuredCol: idx };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const idx = helpers.clamp(Math.floor((localX / Math.max(1, width)) * 3) + 1, 1, 3);
  return { ...params, featuredCol: idx };
}

function buildPaths(width, height, params, helpers) {
  const feat = Math.round(helpers.clamp(Number(params.featuredCol) || 2, 1, 3));
  const gap = helpers.clamp(Number(params.gap) || 12, 6, 24);
  const colW = (width - gap * 2) / 3;
  const paths = [];
  for (let i = 0; i < 3; i++) {
    const isFeat = i + 1 === feat;
    const x = i * (colW + gap);
    const y = isFeat ? 0 : 12;
    const h = isFeat ? height : height - 16;
    paths.push({ nodes: helpers.rectPath(x, y, colW, h, 0), closed: true });
    if (isFeat) {
      paths.push({ nodes: helpers.rectPath(x + 4, y + 4, colW - 8, h - 8, 0), closed: true });
    }
    paths.push({ nodes: helpers.rectPath(x + 12, y + 16, colW * 0.5, 8, 0), closed: true });
    paths.push({ nodes: helpers.rectPath(x + 12, y + 32, colW * 0.65, 14, 0), closed: true });
    paths.push({ nodes: helpers.rectPath(x + 12, y + h - 30, colW - 24, 18, 9), closed: true });
  }
  return paths;
}`,
  },

  // 27. Sticky Glass Navbar
  {
    id: 'layout-sticky-navbar',
    name: 'Sticky Top Navigation Bar',
    category: 'Web & Layouts',
    description: 'Website header navbar with brand mark, nav links, active link underline, and CTA button.',
    iconName: 'PanelTop',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click any navigation link slot in Preview Mode to move the active indicator',
    paramSchema: [
      { key: 'linkCount', label: 'Nav Links', type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
      { key: 'activeLink', label: 'Active Link (1-N)', type: 'number', min: 1, max: 6, step: 1, defaultValue: 1 },
      { key: 'pillMode', label: 'Floating Pill Navbar', type: 'boolean', defaultValue: false },
    ],
    defaultParams: { linkCount: 4, activeLink: 1, pillMode: false },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.linkCount) || 4, 3, 6));
  const active = Math.round(helpers.clamp(Number(params.activeLink) || 1, 1, count));
  const navStart = width * 0.25;
  const navW = width * 0.48;
  return [
    { id: 'activeLink', label: \`Nav #\${active}\`, x: navStart + ((active - 0.5) / count) * navW, y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.linkCount) || 4, 3, 6));
  if (id === 'activeLink') {
    const t = (localX - width * 0.25) / Math.max(1, width * 0.48);
    const idx = helpers.clamp(Math.floor(t * count) + 1, 1, count);
    return { ...params, activeLink: idx };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.linkCount) || 4, 3, 6));
  const cur = Math.round(helpers.clamp(Number(params.activeLink) || 1, 1, count));
  return { ...params, activeLink: (cur % count) + 1 };
}

function buildPaths(width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.linkCount) || 4, 3, 6));
  const active = Math.round(helpers.clamp(Number(params.activeLink) || 1, 1, count));
  const pill = Boolean(params.pillMode);
  const r = pill ? height * 0.5 : 0;
  const cy = height * 0.5;
  const padX = Math.min(14, width * 0.035);
  const logoR = Math.min(9, height * 0.24, width * 0.035);
  const logoCx = padX + logoR;
  const ctaW = Math.max(12, Math.min(72, width * 0.16));
  const ctaH = Math.max(10, height * 0.56);
  const ctaX = width - padX - ctaW;
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, r), closed: true },
    { nodes: helpers.ellipsePath(logoCx, cy, logoR, logoR), closed: true },
    { nodes: helpers.rectPath(ctaX, cy - ctaH * 0.5, ctaW, ctaH, ctaH * 0.5), closed: true }
  ];
  const navStart = width * 0.22;
  const navSpanW = Math.min(width * 0.54, Math.max(40, ctaX - navStart - 10));
  const slotW = navSpanW / count;
  const slotPad = Math.min(5, slotW * 0.08);
  const btnH = Math.max(10, height * 0.56);
  const btnR = Math.min(9, btnH * 0.45);
  for (let i = 0; i < count; i++) {
    const lx = navStart + i * slotW + slotPad;
    const lw = Math.max(8, slotW - slotPad * 2);
    const ly = cy - btnH * 0.5;
    paths.push({ nodes: helpers.rectPath(lx, ly, lw, btnH, btnR), closed: true });
    if (i + 1 === active) {
      paths.push({ nodes: helpers.rectPath(lx + 2.5, ly + 2.5, Math.max(4, lw - 5), Math.max(4, btnH - 5), Math.max(2, btnR - 2)), closed: true });
    }
  }
  return paths;
}`,
  },

  // 28. Mega Menu Popover
  {
    id: 'layout-mega-menu',
    name: 'Mega Menu Flyout',
    category: 'Web & Layouts',
    description: 'Top navbar with expanded multi-column mega menu popover and promo spotlight card.',
    iconName: 'LayoutList',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle the active mega-menu category column',
    paramSchema: [
      { key: 'navRatio', label: 'Navbar Height Ratio', type: 'number', min: 0.15, max: 0.3, step: 0.01, defaultValue: 0.2 },
      { key: 'promoRatio', label: 'Promo Card Width Ratio', type: 'number', min: 0.25, max: 0.45, step: 0.01, defaultValue: 0.34 },
      { key: 'activeCol', label: 'Active Column (1-3)', type: 'number', min: 1, max: 3, step: 1, defaultValue: 1 },
    ],
    defaultParams: { navRatio: 0.2, promoRatio: 0.34, activeCol: 1 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const navH = helpers.clamp(Number(params.navRatio) || 0.2, 0.15, 0.3) * height;
  const pRatio = helpers.clamp(Number(params.promoRatio) || 0.34, 0.25, 0.45);
  return [
    { id: 'navRatio', label: \`Navbar: \${Math.round((navH / height) * 100)}%\`, x: width * 0.5, y: navH, cursor: 'ns-resize' },
    { id: 'promoRatio', label: \`Promo: \${Math.round(pRatio * 100)}%\`, x: width * (1 - pRatio), y: height * 0.6, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'navRatio') {
    return { ...params, navRatio: Number(helpers.clamp(localY / Math.max(1, height), 0.15, 0.3).toFixed(2)) };
  }
  if (id === 'promoRatio') {
    return { ...params, promoRatio: Number(helpers.clamp((width - localX) / Math.max(1, width), 0.25, 0.45).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const cur = Math.round(helpers.clamp(Number(params.activeCol) || 1, 1, 3));
  return { ...params, activeCol: (cur % 3) + 1 };
}

function buildPaths(width, height, params, helpers) {
  const navH = helpers.clamp(Number(params.navRatio) || 0.2, 0.15, 0.3) * height;
  const pRatio = helpers.clamp(Number(params.promoRatio) || 0.34, 0.25, 0.45);
  const activeCol = Math.round(helpers.clamp(Number(params.activeCol) || 1, 1, 3));
  const gapY = Math.min(6, height * 0.04);
  const bodyY = navH + gapY;
  const bodyH = Math.max(12, height - bodyY);
  const padX = Math.min(12, width * 0.04);
  const padY = Math.min(10, bodyH * 0.08);
  const colGap = Math.min(10, width * 0.03);
  const innerW = Math.max(20, width - padX * 2);
  const promoW = Math.max(12, (innerW - colGap * 2) * pRatio);
  const colW = Math.max(10, (innerW - promoW - colGap * 2) / 2);
  const promoX = width - padX - promoW;
  const innerH = Math.max(8, bodyH - padY * 2);

  const paths = [
    { nodes: helpers.rectPath(0, 0, width, navH, 0), closed: true },
    { nodes: helpers.rectPath(0, bodyY, width, bodyH, 0), closed: true },
    { nodes: helpers.rectPath(promoX, bodyY + padY, promoW, innerH, 0), closed: true }
  ];
  // Top navbar button pills (non-overlapping)
  const navSlotW = (width - padX * 2) / 4;
  const navBtnH = Math.max(4, navH * 0.56);
  const navBtnR = Math.min(8, navBtnH * 0.45);
  for (let n = 0; n < 4; n++) {
    const nx = padX + n * navSlotW + Math.min(4, navSlotW * 0.08);
    const nw = Math.max(6, navSlotW * 0.84);
    paths.push({ nodes: helpers.rectPath(nx, (navH - navBtnH) * 0.5, nw, navBtnH, navBtnR), closed: true });
  }
  // Mega-menu columns (strictly inside [padX .. promoX - colGap] and [bodyY + padY .. bodyY + bodyH - padY])
  for (let c = 0; c < 2; c++) {
    const cx = padX + c * (colW + colGap);
    if (c + 1 === activeCol) {
      paths.push({ nodes: helpers.rectPath(cx, bodyY + padY, colW, innerH, 0), closed: true });
    }
    const rowH = innerH / 3;
    const rowInset = Math.min(4, rowH * 0.14, colW * 0.08);
    const btnH = Math.max(4, rowH - rowInset * 2);
    const btnR = Math.min(6, btnH * 0.4);
    for (let r = 0; r < 3; r++) {
      const ry = bodyY + padY + r * rowH;
      paths.push({ nodes: helpers.rectPath(cx + rowInset, ry + rowInset, Math.max(6, colW - rowInset * 2), btnH, btnR), closed: true });
    }
  }
  return paths;
}`,
  },

  // 29. App Sidebar Shell
  {
    id: 'layout-sidebar-shell',
    name: 'Dashboard Sidebar App Shell',
    category: 'Web & Layouts',
    description: 'Collapsible left sidebar navigation, top header bar, and multi-card workspace canvas.',
    iconName: 'PanelLeftClose',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click the sidebar in Preview Mode to toggle collapsed icon-rail vs expanded drawer',
    paramSchema: [
      { key: 'sidebarRatio', label: 'Sidebar Width Ratio', type: 'number', min: 0.12, max: 0.35, step: 0.01, defaultValue: 0.24 },
      { key: 'headerRatio', label: 'Topbar Height Ratio', type: 'number', min: 0.12, max: 0.25, step: 0.01, defaultValue: 0.16 },
      { key: 'activeNav', label: 'Active Nav Row (1-4)', type: 'number', min: 1, max: 4, step: 1, defaultValue: 1 },
    ],
    defaultParams: { sidebarRatio: 0.24, headerRatio: 0.16, activeNav: 1 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const sw = helpers.clamp(Number(params.sidebarRatio) || 0.24, 0.12, 0.35) * width;
  const hh = helpers.clamp(Number(params.headerRatio) || 0.16, 0.12, 0.25) * height;
  return [
    { id: 'sidebarRatio', label: \`Sidebar: \${Math.round((sw / width) * 100)}%\`, x: sw, y: height * 0.5, cursor: 'ew-resize' },
    { id: 'headerRatio', label: \`Header: \${Math.round((hh / height) * 100)}%\`, x: sw + (width - sw) * 0.5, y: hh, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'sidebarRatio') {
    return { ...params, sidebarRatio: Number(helpers.clamp(localX / Math.max(1, width), 0.12, 0.35).toFixed(2)) };
  }
  if (id === 'headerRatio') {
    return { ...params, headerRatio: Number(helpers.clamp(localY / Math.max(1, height), 0.12, 0.25).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const sw = helpers.clamp(Number(params.sidebarRatio) || 0.24, 0.12, 0.35);
  if (localX <= width * sw) {
    return { ...params, sidebarRatio: sw > 0.18 ? 0.13 : 0.25 };
  }
  const cur = Math.round(helpers.clamp(Number(params.activeNav) || 1, 1, 4));
  return { ...params, activeNav: (cur % 4) + 1 };
}

function buildPaths(width, height, params, helpers) {
  const sw = helpers.clamp(Number(params.sidebarRatio) || 0.24, 0.12, 0.35) * width;
  const hh = helpers.clamp(Number(params.headerRatio) || 0.16, 0.12, 0.25) * height;
  const activeNav = Math.round(helpers.clamp(Number(params.activeNav) || 1, 1, 4));
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.polygonPath([{ x: sw, y: 0 }, { x: sw, y: height }], false), closed: false },
    { nodes: helpers.polygonPath([{ x: sw, y: hh }, { x: width, y: hh }], false), closed: false }
  ];
  const sbPadX = Math.min(6, sw * 0.14);
  const sbPadY = Math.min(12, height * 0.08);
  const sbAvailH = Math.max(16, Math.min(height - sbPadY * 2, height * 0.65));
  const navSlotH = sbAvailH / 4;
  const pillH = Math.max(4, Math.min(18, navSlotH * 0.72));
  const btnR = Math.min(8, pillH * 0.45);
  for (let i = 0; i < 4; i++) {
    const slotTop = sbPadY + i * navSlotH;
    const by = slotTop + (navSlotH - pillH) * 0.5;
    const bw = Math.max(4, sw - sbPadX * 2);
    paths.push({ nodes: helpers.rectPath(sbPadX, by, bw, pillH, btnR), closed: true });
    if (i + 1 === activeNav) {
      paths.push({ nodes: helpers.rectPath(sbPadX + 2.5, by + 2.5, Math.max(2, bw - 5), Math.max(2, pillH - 5), Math.max(2, btnR - 2)), closed: true });
    }
  }
  const mainAvailW = Math.max(10, width - sw);
  const mainAvailH = Math.max(10, height - hh);
  const mPadX = Math.min(10, mainAvailW * 0.06);
  const mPadY = Math.min(10, mainAvailH * 0.06);
  const mGap = Math.min(8, mainAvailW * 0.04, mainAvailH * 0.05);
  const mainW = Math.max(6, mainAvailW - mPadX * 2);
  const mainH = Math.max(6, mainAvailH - mPadY * 2);
  const topCardH = (mainH - mGap) * 0.44;
  const botCardH = mainH - mGap - topCardH;
  const halfCardW = (mainW - mGap) * 0.5;
  paths.push({ nodes: helpers.rectPath(sw + mPadX, hh + mPadY, mainW, topCardH, 0), closed: true });
  paths.push({ nodes: helpers.rectPath(sw + mPadX, hh + mPadY + topCardH + mGap, halfCardW, botCardH, 0), closed: true });
  paths.push({ nodes: helpers.rectPath(sw + mPadX + halfCardW + mGap, hh + mPadY + topCardH + mGap, halfCardW, botCardH, 0), closed: true });
  return paths;
}`,
  },

  // 30. Multi-Column Footer
  {
    id: 'layout-multi-footer',
    name: 'Multi-Column Site Footer',
    category: 'Web & Layouts',
    description: 'Website footer with brand & newsletter column, sitemap link columns, and bottom legal bar.',
    iconName: 'PanelBottom',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle the number of sitemap link columns (2 to 4)',
    paramSchema: [
      { key: 'colCount', label: 'Link Columns', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
      { key: 'brandRatio', label: 'Brand Area Ratio', type: 'number', min: 0.25, max: 0.45, step: 0.01, defaultValue: 0.34 },
    ],
    defaultParams: { colCount: 3, brandRatio: 0.34 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const bRatio = helpers.clamp(Number(params.brandRatio) || 0.34, 0.25, 0.45);
  return [
    { id: 'brandRatio', label: \`Brand: \${Math.round(bRatio * 100)}%\`, x: width * bRatio, y: height * 0.4, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'brandRatio') {
    return { ...params, brandRatio: Number(helpers.clamp(localX / Math.max(1, width), 0.25, 0.45).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const cols = Math.round(helpers.clamp(Number(params.colCount) || 3, 2, 4));
  return { ...params, colCount: cols >= 4 ? 2 : cols + 1 };
}

function buildPaths(width, height, params, helpers) {
  const cols = Math.round(helpers.clamp(Number(params.colCount) || 3, 2, 4));
  const bRatio = helpers.clamp(Number(params.brandRatio) || 0.34, 0.25, 0.45);
  const padX = Math.min(14, width * 0.04);
  const padY = Math.min(14, height * 0.1);
  const bw = width * bRatio;
  const botY = height * 0.78;
  const topAvailH = Math.max(12, botY - padY * 1.5);
  const logoR = Math.min(8, topAvailH * 0.18, bw * 0.12);
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.ellipsePath(padX + logoR, padY + logoR, logoR, logoR), closed: true },
    { nodes: helpers.rectPath(padX + logoR * 2 + 6, padY + logoR * 0.4, Math.max(8, (bw - padX * 2 - logoR * 2 - 6) * 0.7), Math.max(2, logoR * 1.1), 0), closed: true },
    { nodes: helpers.rectPath(padX, padY + topAvailH * 0.48, Math.max(10, bw - padX * 2), Math.max(4, topAvailH * 0.32), 0), closed: true },
    { nodes: helpers.polygonPath([{ x: padX, y: botY }, { x: width - padX, y: botY }], false), closed: false },
    { nodes: helpers.rectPath(padX, botY + (height - botY) * 0.32, width * 0.3, Math.max(2, (height - botY) * 0.34), 0), closed: true }
  ];
  const linksW = Math.max(12, width - bw - padX);
  const colW = linksW / cols;
  const rowSlotH = topAvailH / 4;
  for (let c = 0; c < cols; c++) {
    const cx = bw + c * colW;
    paths.push({ nodes: helpers.rectPath(cx, padY, colW * 0.65, Math.max(2, rowSlotH * 0.48), 0), closed: true });
    for (let r = 0; r < 3; r++) {
      paths.push({ nodes: helpers.rectPath(cx, padY + (r + 1) * rowSlotH, colW * 0.55, Math.max(2, rowSlotH * 0.38), 0), closed: true });
    }
  }
  return paths;
}`,
  },

  // 31. 3-Column Feature Row
  {
    id: 'layout-feature-3col',
    name: '3-Column Feature Cards',
    category: 'Web & Layouts',
    description: 'Row of feature cards with circular icon badges, title bars, and description lines.',
    iconName: 'Columns',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click any feature card in Preview Mode to highlight it',
    paramSchema: [
      { key: 'cols', label: 'Column Count', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
      { key: 'activeCol', label: 'Highlighted Card', type: 'number', min: 1, max: 4, step: 1, defaultValue: 2 },
      { key: 'iconSize', label: 'Icon Badge Radius', type: 'number', min: 8, max: 22, step: 1, defaultValue: 14 },
    ],
    defaultParams: { cols: 3, activeCol: 2, iconSize: 14 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const cols = Math.round(helpers.clamp(Number(params.cols) || 3, 2, 4));
  const active = Math.round(helpers.clamp(Number(params.activeCol) || 2, 1, cols));
  return [
    { id: 'activeCol', label: \`Feature #\${active}\`, x: ((active - 0.5) / cols) * width, y: height * 0.3, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  const cols = Math.round(helpers.clamp(Number(params.cols) || 3, 2, 4));
  if (id === 'activeCol') {
    const idx = helpers.clamp(Math.floor((localX / Math.max(1, width)) * cols) + 1, 1, cols);
    return { ...params, activeCol: idx };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const cols = Math.round(helpers.clamp(Number(params.cols) || 3, 2, 4));
  const idx = helpers.clamp(Math.floor((localX / Math.max(1, width)) * cols) + 1, 1, cols);
  return { ...params, activeCol: idx };
}

function buildPaths(width, height, params, helpers) {
  const cols = Math.round(helpers.clamp(Number(params.cols) || 3, 2, 4));
  const active = Math.round(helpers.clamp(Number(params.activeCol) || 2, 1, cols));
  const ir = helpers.clamp(Number(params.iconSize) || 14, 8, 22);
  const gap = 12;
  const colW = (width - gap * (cols - 1)) / cols;
  const paths = [];
  for (let i = 0; i < cols; i++) {
    const x = i * (colW + gap);
    paths.push({ nodes: helpers.rectPath(x, 0, colW, height, 0), closed: true });
    if (i + 1 === active) {
      paths.push({ nodes: helpers.rectPath(x + 3, 3, colW - 6, height - 6, 0), closed: true });
    }
    paths.push({ nodes: helpers.ellipsePath(x + 14 + ir, 16 + ir, ir, ir), closed: true });
    paths.push({ nodes: helpers.rectPath(x + 14, 24 + ir * 2, colW * 0.68, 9, 0), closed: true });
    paths.push({ nodes: helpers.rectPath(x + 14, 40 + ir * 2, colW - 28, 6, 0), closed: true });
    paths.push({ nodes: helpers.rectPath(x + 14, 52 + ir * 2, (colW - 28) * 0.75, 6, 0), closed: true });
  }
  return paths;
}`,
  },

  // 32. Customer Testimonial Card
  {
    id: 'layout-testimonial-card',
    name: 'Customer Testimonial Card',
    category: 'Web & Layouts',
    description: 'Social proof quote card with star rating, quote body lines, and author avatar footer.',
    iconName: 'Quote',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle the star rating on the testimonial',
    paramSchema: [
      { key: 'stars', label: 'Star Count', type: 'number', min: 3, max: 5, step: 1, defaultValue: 5 },
      { key: 'avatarRadius', label: 'Avatar Radius', type: 'number', min: 10, max: 24, step: 1, defaultValue: 16 },
    ],
    defaultParams: { stars: 5, avatarRadius: 16 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const ar = helpers.clamp(Number(params.avatarRadius) || 16, 10, 24);
  return [
    { id: 'avatarRadius', label: \`Avatar: \${Math.round(ar)}px\`, x: 16 + ar * 2, y: height - 16 - ar, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'avatarRadius') {
    return { ...params, avatarRadius: Math.round(helpers.clamp((localX - 16) * 0.5, 10, 24)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const s = Math.round(helpers.clamp(Number(params.stars) || 5, 3, 5));
  return { ...params, stars: s >= 5 ? 3 : s + 1 };
}

function buildPaths(width, height, params, helpers) {
  const stars = Math.round(helpers.clamp(Number(params.stars) || 5, 3, 5));
  const ar = helpers.clamp(Number(params.avatarRadius) || 16, 10, 24);
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.rectPath(16, height * 0.34, width - 32, 8, 0), closed: true },
    { nodes: helpers.rectPath(16, height * 0.48, (width - 32) * 0.82, 8, 0), closed: true },
    { nodes: helpers.ellipsePath(16 + ar, height - 16 - ar, ar, ar), closed: true },
    { nodes: helpers.rectPath(26 + ar * 2, height - 16 - ar - 7, width * 0.36, 7, 0), closed: true },
    { nodes: helpers.rectPath(26 + ar * 2, height - 16 - ar + 4, width * 0.24, 5, 0), closed: true }
  ];
  for (let i = 0; i < stars; i++) {
    paths.push({ nodes: helpers.ellipsePath(22 + i * 16, 20, 5, 5), closed: true });
  }
  return paths;
}`,
  },

  // 33. E-Commerce Product Card
  {
    id: 'layout-ecommerce-product',
    name: 'E-Commerce Product Card',
    category: 'Web & Layouts',
    description: 'Product card with image frame, wishlist heart toggle, title, price tag, and Add to Cart button.',
    iconName: 'ShoppingBag',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle Wishlist favorite state',
    paramSchema: [
      { key: 'imgRatio', label: 'Image Height Ratio', type: 'number', min: 0.4, max: 0.7, step: 0.01, defaultValue: 0.56 },
      { key: 'favorited', label: 'Wishlisted', type: 'boolean', defaultValue: true },
    ],
    defaultParams: { imgRatio: 0.56, favorited: true },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const ir = helpers.clamp(Number(params.imgRatio) || 0.56, 0.4, 0.7);
  return [
    { id: 'imgRatio', label: \`Image: \${Math.round(ir * 100)}%\`, x: width * 0.5, y: height * ir, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'imgRatio') {
    return { ...params, imgRatio: Number(helpers.clamp(localY / Math.max(1, height), 0.4, 0.7).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  return { ...params, favorited: !params.favorited };
}

function buildPaths(width, height, params, helpers) {
  const imgH = helpers.clamp(Number(params.imgRatio) || 0.56, 0.4, 0.7) * height;
  const fav = Boolean(params.favorited);
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.rectPath(10, 10, width - 20, imgH - 10, 0), closed: true },
    { nodes: helpers.ellipsePath(width - 26, 26, 10, 10), closed: true },
    { nodes: helpers.rectPath(12, imgH + 10, width * 0.65, 9, 0), closed: true },
    { nodes: helpers.rectPath(12, imgH + 26, width * 0.35, 10, 0), closed: true },
    { nodes: helpers.rectPath(12, height - 34, width - 24, 22, 11), closed: true }
  ];
  if (fav) {
    paths.push({ nodes: helpers.ellipsePath(width - 26, 26, 4, 4), closed: true });
  }
  return paths;
}`,
  },

  // 34. Checkout Order Summary
  {
    id: 'layout-checkout-summary',
    name: 'Checkout Order Summary',
    category: 'Web & Layouts',
    description: 'Order receipt breakdown with line items, promo code input, total bar, and Pay CTA.',
    iconName: 'Receipt',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle the number of cart line items',
    paramSchema: [
      { key: 'lineItems', label: 'Line Items', type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
      { key: 'showPromo', label: 'Promo Code Field', type: 'boolean', defaultValue: true },
    ],
    defaultParams: { lineItems: 3, showPromo: true },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const items = Math.round(helpers.clamp(Number(params.lineItems) || 3, 2, 5));
  return [
    { id: 'lineItems', label: \`Items: \${items}\`, x: width * 0.5, y: height * 0.45, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'lineItems') {
    const c = Math.round(helpers.clamp(2 + (localY / Math.max(1, height)) * 3, 2, 5));
    return { ...params, lineItems: c };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const items = Math.round(helpers.clamp(Number(params.lineItems) || 3, 2, 5));
  return { ...params, lineItems: items >= 5 ? 2 : items + 1 };
}

function buildPaths(width, height, params, helpers) {
  const items = Math.round(helpers.clamp(Number(params.lineItems) || 3, 2, 5));
  const showPromo = params.showPromo !== false;
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.rectPath(14, 14, width * 0.48, 10, 0), closed: true },
    { nodes: helpers.rectPath(14, height - 34, width - 28, 22, 11), closed: true }
  ];
  const listH = height * 0.44;
  const rowH = listH / items;
  for (let i = 0; i < items; i++) {
    const ry = 34 + i * rowH;
    paths.push({ nodes: helpers.rectPath(14, ry, width * 0.46, 6, 0), closed: true });
    paths.push({ nodes: helpers.rectPath(width - 48, ry, 34, 6, 0), closed: true });
  }
  if (showPromo) {
    paths.push({ nodes: helpers.rectPath(14, height - 64, width - 28, 20, 0), closed: true });
  }
  return paths;
}`,
  },

  // 35. Slide-Over Cart Drawer
  {
    id: 'layout-cart-drawer',
    name: 'Slide-Over Cart Drawer',
    category: 'Web & Layouts',
    description: 'Backdrop + right slide-over shopping cart drawer with product rows and checkout footer.',
    iconName: 'ShoppingCart',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle wide vs compact drawer width',
    paramSchema: [
      { key: 'drawerRatio', label: 'Drawer Width Ratio', type: 'number', min: 0.4, max: 0.85, step: 0.01, defaultValue: 0.64 },
      { key: 'itemCount', label: 'Cart Rows', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { drawerRatio: 0.64, itemCount: 3 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const dr = helpers.clamp(Number(params.drawerRatio) || 0.64, 0.4, 0.85);
  return [
    { id: 'drawerRatio', label: \`Drawer: \${Math.round(dr * 100)}%\`, x: width * (1 - dr), y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'drawerRatio') {
    const r = helpers.clamp((width - localX) / Math.max(1, width), 0.4, 0.85);
    return { ...params, drawerRatio: Number(r.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const dr = helpers.clamp(Number(params.drawerRatio) || 0.64, 0.4, 0.85);
  return { ...params, drawerRatio: dr > 0.65 ? 0.52 : 0.74 };
}

function buildPaths(width, height, params, helpers) {
  const dr = helpers.clamp(Number(params.drawerRatio) || 0.64, 0.4, 0.85);
  const count = Math.round(helpers.clamp(Number(params.itemCount) || 3, 2, 4));
  const dx = width * (1 - dr);
  const dw = width - dx;
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.rectPath(dx, 0, dw, height, 0), closed: true },
    { nodes: helpers.rectPath(dx + 12, 14, dw * 0.45, 9, 0), closed: true },
    { nodes: helpers.rectPath(dx + 12, height - 34, dw - 24, 22, 11), closed: true }
  ];
  const rowH = (height - 76) / count;
  for (let i = 0; i < count; i++) {
    const ry = 34 + i * rowH;
    paths.push({ nodes: helpers.rectPath(dx + 12, ry, 24, rowH - 8, 0), closed: true });
    paths.push({ nodes: helpers.rectPath(dx + 42, ry + 4, dw - 56, 7, 0), closed: true });
  }
  return paths;
}`,
  },

  // 36. Video Media Player
  {
    id: 'layout-video-player',
    name: 'Video Player Frame',
    category: 'Web & Layouts',
    description: '16:9 media player with central play button badge and bottom timeline scrubber.',
    iconName: 'PlayCircle',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click timeline to scrub playback or click center in Preview Mode to toggle Play/Pause',
    paramSchema: [
      { key: 'progress', label: 'Playback Progress', type: 'number', min: 0.05, max: 0.95, step: 0.01, defaultValue: 0.42 },
      { key: 'isPlaying', label: 'Playing State', type: 'boolean', defaultValue: false },
    ],
    defaultParams: { progress: 0.42, isPlaying: false },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const prog = helpers.clamp(Number(params.progress) || 0.42, 0.05, 0.95);
  return [
    { id: 'progress', label: \`Time: \${Math.round(prog * 100)}%\`, x: 14 + (width - 28) * prog, y: height - 16, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'progress') {
    const p = helpers.clamp((localX - 14) / Math.max(1, width - 28), 0.05, 0.95);
    return { ...params, progress: Number(p.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  if (localY > height * 0.72) {
    const p = helpers.clamp((localX - 14) / Math.max(1, width - 28), 0.05, 0.95);
    return { ...params, progress: Number(p.toFixed(2)) };
  }
  return { ...params, isPlaying: !params.isPlaying };
}

function buildPaths(width, height, params, helpers) {
  const prog = helpers.clamp(Number(params.progress) || 0.42, 0.05, 0.95);
  const playing = Boolean(params.isPlaying);
  const cx = width * 0.5;
  const cy = height * 0.44;
  const br = Math.min(width, height) * 0.16;
  const trackW = width - 28;
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.ellipsePath(cx, cy, br, br), closed: true },
    { nodes: helpers.rectPath(14, height - 20, trackW, 6, 3), closed: true },
    { nodes: helpers.ellipsePath(14 + trackW * prog, height - 17, 6, 6), closed: true }
  ];
  if (playing) {
    paths.push({ nodes: helpers.rectPath(cx - br * 0.32, cy - br * 0.36, br * 0.22, br * 0.72, 2), closed: true });
    paths.push({ nodes: helpers.rectPath(cx + br * 0.1, cy - br * 0.36, br * 0.22, br * 0.72, 2), closed: true });
  } else {
    paths.push({
      nodes: helpers.polygonPath([
        { x: cx - br * 0.24, y: cy - br * 0.38 },
        { x: cx + br * 0.42, y: cy },
        { x: cx - br * 0.24, y: cy + br * 0.38 }
      ]),
      closed: true
    });
  }
  return paths;
}`,
  },

  // 37. Audio Waveform Scrubber
  {
    id: 'layout-audio-waveform',
    name: 'Audio Waveform Scrubber',
    category: 'Web & Layouts',
    description: 'Podcast / voice-note player with play button and vertical frequency spectrum bars.',
    iconName: 'AudioWaveform',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click anywhere along the waveform in Preview Mode to scrub playhead position',
    paramSchema: [
      { key: 'barCount', label: 'Waveform Bars', type: 'number', min: 8, max: 24, step: 2, defaultValue: 14 },
      { key: 'playhead', label: 'Playhead Ratio', type: 'number', min: 0.1, max: 0.95, step: 0.05, defaultValue: 0.55 },
    ],
    defaultParams: { barCount: 14, playhead: 0.55 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const ph = helpers.clamp(Number(params.playhead) || 0.55, 0.1, 0.95);
  return [
    { id: 'playhead', label: \`Playhead: \${Math.round(ph * 100)}%\`, x: 46 + (width - 58) * ph, y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'playhead') {
    const p = helpers.clamp((localX - 46) / Math.max(1, width - 58), 0.1, 0.95);
    return { ...params, playhead: Number(p.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const p = helpers.clamp((localX - 46) / Math.max(1, width - 58), 0.1, 0.95);
  return { ...params, playhead: Number(p.toFixed(2)) };
}

function buildPaths(width, height, params, helpers) {
  const bars = Math.round(helpers.clamp(Number(params.barCount) || 14, 8, 24));
  const ph = helpers.clamp(Number(params.playhead) || 0.55, 0.1, 0.95);
  const cy = height * 0.5;
  const r = Math.min(16, height * 0.34);
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.ellipsePath(14 + r, cy, r, r), closed: true },
    { nodes: helpers.polygonPath([{ x: 14 + r * 0.8, y: cy - r * 0.35 }, { x: 14 + r * 1.35, y: cy }, { x: 14 + r * 0.8, y: cy + r * 0.35 }]), closed: true }
  ];
  const waveX = 24 + r * 2;
  const waveW = width - waveX - 14;
  const slotW = waveW / bars;
  for (let i = 0; i < bars; i++) {
    const amp = 0.25 + 0.65 * Math.abs(Math.sin((i + 1) * 0.85));
    const bh = height * 0.62 * amp;
    paths.push({ nodes: helpers.rectPath(waveX + i * slotW, cy - bh * 0.5, Math.max(3, slotW * 0.58), bh, 2), closed: true });
  }
  const px = waveX + waveW * ph;
  paths.push({ nodes: helpers.polygonPath([{ x: px, y: 6 }, { x: px, y: height - 6 }], false), closed: false });
  return paths;
}`,
  },

  // 38. Login & SSO Auth Card
  {
    id: 'layout-login-sso',
    name: 'Auth Login & SSO Card',
    category: 'Web & Layouts',
    description: 'Authentication card with brand icon, SSO provider buttons, email/password fields, and submit CTA.',
    iconName: 'Lock',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle the number of SSO provider buttons',
    paramSchema: [
      { key: 'ssoCount', label: 'SSO Buttons', type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
      { key: 'fieldHeight', label: 'Input Field Height', type: 'number', min: 14, max: 32, step: 1, defaultValue: 20 },
    ],
    defaultParams: { ssoCount: 2, fieldHeight: 20 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const fh = helpers.clamp(Number(params.fieldHeight) || 20, 14, 32);
  return [
    { id: 'fieldHeight', label: \`Field: \${Math.round(fh)}px\`, x: width * 0.5, y: height * 0.5 + fh, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'fieldHeight') {
    return { ...params, fieldHeight: Math.round(helpers.clamp(localY - height * 0.5, 14, 32)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const c = Math.round(helpers.clamp(Number(params.ssoCount) || 2, 1, 3));
  return { ...params, ssoCount: (c % 3) + 1 };
}

function buildPaths(width, height, params, helpers) {
  const sso = Math.round(helpers.clamp(Number(params.ssoCount) || 2, 1, 3));
  const fh = helpers.clamp(Number(params.fieldHeight) || 20, 14, 32);
  const pad = 16;
  const innerW = width - pad * 2;
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.ellipsePath(width * 0.5, 24, 10, 10), closed: true },
    { nodes: helpers.rectPath(pad, height * 0.46, innerW, fh, 0), closed: true },
    { nodes: helpers.rectPath(pad, height * 0.46 + fh + 8, innerW, fh, 0), closed: true },
    { nodes: helpers.rectPath(pad, height - pad - fh - 2, innerW, fh + 2, (fh + 2) * 0.5), closed: true }
  ];
  const ssoW = (innerW - (sso - 1) * 8) / sso;
  for (let i = 0; i < sso; i++) {
    paths.push({ nodes: helpers.rectPath(pad + i * (ssoW + 8), 44, ssoW, 20, 10), closed: true });
  }
  return paths;
}`,
  },

  // 39. Kanban Task Column
  {
    id: 'layout-kanban-column',
    name: 'Kanban Board Column',
    category: 'Web & Layouts',
    description: 'Sprint board column with status header, task count badge, and stacked task cards.',
    iconName: 'Kanban',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to add or cycle task cards in the column',
    paramSchema: [
      { key: 'cardCount', label: 'Task Cards', type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
      { key: 'activeCard', label: 'Focused Card', type: 'number', min: 1, max: 5, step: 1, defaultValue: 1 },
    ],
    defaultParams: { cardCount: 3, activeCard: 1 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.cardCount) || 3, 2, 5));
  return [
    { id: 'cardCount', label: \`Tasks: \${count}\`, x: width * 0.5, y: height - 10, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'cardCount') {
    const c = Math.round(helpers.clamp(2 + (localY / Math.max(1, height)) * 3, 2, 5));
    return { ...params, cardCount: c };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.cardCount) || 3, 2, 5));
  const idx = helpers.clamp(Math.floor(((localY - 32) / Math.max(1, height - 40)) * count) + 1, 1, count);
  return { ...params, activeCard: idx };
}

function buildPaths(width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.cardCount) || 3, 2, 5));
  const active = Math.round(helpers.clamp(Number(params.activeCard) || 1, 1, count));
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.rectPath(12, 12, width * 0.45, 10, 0), closed: true },
    { nodes: helpers.ellipsePath(width - 20, 17, 7, 7), closed: true }
  ];
  const gap = 8;
  const listTop = 32;
  const cardH = (height - listTop - 12 - gap * (count - 1)) / count;
  for (let i = 0; i < count; i++) {
    const cy = listTop + i * (cardH + gap);
    paths.push({ nodes: helpers.rectPath(10, cy, width - 20, cardH, 0), closed: true });
    if (i + 1 === active) {
      paths.push({ nodes: helpers.rectPath(13, cy + 3, width - 26, cardH - 6, 0), closed: true });
    }
    paths.push({ nodes: helpers.rectPath(18, cy + 8, (width - 36) * 0.35, 6, 0), closed: true });
    paths.push({ nodes: helpers.rectPath(18, cy + 18, (width - 36) * 0.78, 7, 0), closed: true });
  }
  return paths;
}`,
  },

  // 40. Editorial Blog Article Card
  {
    id: 'layout-blog-card',
    name: 'Blog Article Card',
    category: 'Web & Layouts',
    description: 'Content article card with cover thumbnail, category pill, headline, and author footer.',
    iconName: 'FileText',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle cover thumbnail ratio',
    paramSchema: [
      { key: 'coverRatio', label: 'Cover Height Ratio', type: 'number', min: 0.32, max: 0.62, step: 0.01, defaultValue: 0.46 },
      { key: 'radius', label: 'Corner Radius', type: 'number', min: 0, max: 20, step: 1, defaultValue: 0 },
    ],
    defaultParams: { coverRatio: 0.46, radius: 0 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const cr = helpers.clamp(Number(params.coverRatio) || 0.46, 0.32, 0.62);
  return [
    { id: 'coverRatio', label: \`Cover: \${Math.round(cr * 100)}%\`, x: width * 0.5, y: height * cr, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'coverRatio') {
    return { ...params, coverRatio: Number(helpers.clamp(localY / Math.max(1, height), 0.32, 0.62).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const cr = helpers.clamp(Number(params.coverRatio) || 0.46, 0.32, 0.62);
  return { ...params, coverRatio: cr > 0.48 ? 0.38 : 0.54 };
}

function buildPaths(width, height, params, helpers) {
  const ch = helpers.clamp(Number(params.coverRatio) || 0.46, 0.32, 0.62) * height;
  const r = helpers.clamp(Number(params.radius) ?? 0, 0, 20);
  return [
    { nodes: helpers.rectPath(0, 0, width, height, r), closed: true },
    { nodes: helpers.rectPath(8, 8, width - 16, ch - 8, 0), closed: true },
    { nodes: helpers.rectPath(14, ch + 10, width * 0.28, 12, 6), closed: true },
    { nodes: helpers.rectPath(14, ch + 28, width - 28, 9, 0), closed: true },
    { nodes: helpers.rectPath(14, ch + 42, (width - 28) * 0.72, 8, 0), closed: true },
    { nodes: helpers.ellipsePath(22, height - 18, 8, 8), closed: true },
    { nodes: helpers.rectPath(36, height - 21, width * 0.35, 6, 0), closed: true }
  ];
}`,
  },

  // 41. Social Profile Header Banner
  {
    id: 'layout-profile-banner',
    name: 'User Profile Cover Card',
    category: 'Web & Layouts',
    description: 'Social / SaaS user profile card with cover banner, overlapping avatar, bio, and Follow CTA.',
    iconName: 'UserCircle',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle Following state and avatar alignment',
    paramSchema: [
      { key: 'bannerRatio', label: 'Banner Height Ratio', type: 'number', min: 0.25, max: 0.5, step: 0.01, defaultValue: 0.36 },
      { key: 'centeredAvatar', label: 'Center Avatar', type: 'boolean', defaultValue: false },
    ],
    defaultParams: { bannerRatio: 0.36, centeredAvatar: false },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const br = helpers.clamp(Number(params.bannerRatio) || 0.36, 0.25, 0.5);
  return [
    { id: 'bannerRatio', label: \`Banner: \${Math.round(br * 100)}%\`, x: width * 0.5, y: height * br, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'bannerRatio') {
    return { ...params, bannerRatio: Number(helpers.clamp(localY / Math.max(1, height), 0.25, 0.5).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  return { ...params, centeredAvatar: !params.centeredAvatar };
}

function buildPaths(width, height, params, helpers) {
  const bh = helpers.clamp(Number(params.bannerRatio) || 0.36, 0.25, 0.5) * height;
  const centered = Boolean(params.centeredAvatar);
  const ar = Math.min(24, height * 0.16);
  const ax = centered ? width * 0.5 : 20 + ar;
  return [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.rectPath(6, 6, width - 12, bh - 6, 0), closed: true },
    { nodes: helpers.ellipsePath(ax, bh, ar, ar), closed: true },
    { nodes: helpers.rectPath(width - 78, bh + 8, 64, 20, 10), closed: true },
    { nodes: helpers.rectPath(16, bh + ar + 10, width * 0.45, 9, 0), closed: true },
    { nodes: helpers.rectPath(16, bh + ar + 24, width - 32, 6, 0), closed: true }
  ];
}`,
  },

  // 42. Settings Form Panel
  {
    id: 'layout-settings-form',
    name: 'Settings Form Panel',
    category: 'Web & Layouts',
    description: 'Account preferences form with labeled text inputs, toggle switch row, and Save button.',
    iconName: 'Sliders',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle the preference switch and row count',
    paramSchema: [
      { key: 'fieldRows', label: 'Input Rows', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
      { key: 'toggleOn', label: 'Toggle Active', type: 'boolean', defaultValue: true },
    ],
    defaultParams: { fieldRows: 3, toggleOn: true },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const rows = Math.round(helpers.clamp(Number(params.fieldRows) || 3, 2, 4));
  return [
    { id: 'fieldRows', label: \`Fields: \${rows}\`, x: width * 0.5, y: height * 0.5, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'fieldRows') {
    const r = Math.round(helpers.clamp(2 + (localY / Math.max(1, height)) * 2, 2, 4));
    return { ...params, fieldRows: r };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  return { ...params, toggleOn: !params.toggleOn };
}

function buildPaths(width, height, params, helpers) {
  const rows = Math.round(helpers.clamp(Number(params.fieldRows) || 3, 2, 4));
  const toggleOn = params.toggleOn !== false;
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.rectPath(width - 82, height - 30, 68, 20, 10), closed: true }
  ];
  const bodyH = height - 46;
  const rowH = bodyH / rows;
  for (let i = 0; i < rows; i++) {
    const ry = 12 + i * rowH;
    paths.push({ nodes: helpers.rectPath(14, ry, width * 0.35, 6, 0), closed: true });
    paths.push({ nodes: helpers.rectPath(14, ry + 10, width - 28, Math.max(12, rowH - 18), 0), closed: true });
  }
  const tx = 14;
  const ty = height - 28;
  paths.push({ nodes: helpers.rectPath(tx, ty, 32, 16, 8), closed: true });
  paths.push({ nodes: helpers.ellipsePath(toggleOn ? tx + 24 : tx + 8, ty + 8, 5, 5), closed: true });
  return paths;
}`,
  },

  // 43. Drag & Drop Upload Zone
  {
    id: 'layout-upload-dropzone',
    name: 'File Upload Dropzone',
    category: 'Web & Layouts',
    description: 'Cloud upload dropzone with upload arrow badge, instructions, and live upload progress bar.',
    iconName: 'UploadCloud',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to scrub the file upload progress bar',
    paramSchema: [
      { key: 'progress', label: 'Upload Progress', type: 'number', min: 0.1, max: 1, step: 0.05, defaultValue: 0.68 },
      { key: 'iconScale', label: 'Icon Scale', type: 'number', min: 0.12, max: 0.28, step: 0.01, defaultValue: 0.18 },
    ],
    defaultParams: { progress: 0.68, iconScale: 0.18 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const prog = helpers.clamp(Number(params.progress) || 0.68, 0.1, 1);
  return [
    { id: 'progress', label: \`Uploaded: \${Math.round(prog * 100)}%\`, x: 20 + (width - 40) * prog, y: height - 22, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'progress') {
    const p = helpers.clamp((localX - 20) / Math.max(1, width - 40), 0.1, 1);
    return { ...params, progress: Number(p.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const p = helpers.clamp((localX - 20) / Math.max(1, width - 40), 0.15, 1);
  return { ...params, progress: Number(p.toFixed(2)) };
}

function buildPaths(width, height, params, helpers) {
  const prog = helpers.clamp(Number(params.progress) || 0.68, 0.1, 1);
  const ir = Math.min(width, height) * helpers.clamp(Number(params.iconScale) || 0.18, 0.12, 0.28);
  const cx = width * 0.5;
  const cy = height * 0.36;
  const barW = width - 40;
  return [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.rectPath(8, 8, width - 16, height - 16, 0), closed: true },
    { nodes: helpers.ellipsePath(cx, cy, ir, ir), closed: true },
    { nodes: helpers.polygonPath([{ x: cx, y: cy + ir * 0.45 }, { x: cx, y: cy - ir * 0.45 }], false), closed: false },
    { nodes: helpers.polygonPath([{ x: cx - ir * 0.35, y: cy - ir * 0.1 }, { x: cx, y: cy - ir * 0.45 }, { x: cx + ir * 0.35, y: cy - ir * 0.1 }], false), closed: false },
    { nodes: helpers.rectPath(cx - width * 0.24, cy + ir + 10, width * 0.48, 7, 0), closed: true },
    { nodes: helpers.rectPath(20, height - 26, barW, 8, 4), closed: true },
    { nodes: helpers.rectPath(20, height - 26, barW * prog, 8, 4), closed: true }
  ];
}`,
  },

  // 44. Code Editor / CLI Terminal
  {
    id: 'layout-code-terminal',
    name: 'Code Terminal Window',
    category: 'Web & Layouts',
    description: 'macOS traffic-light terminal window with indented syntax code bars.',
    iconName: 'Code2',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle the number of terminal code lines',
    paramSchema: [
      { key: 'lineCount', label: 'Code Lines', type: 'number', min: 3, max: 7, step: 1, defaultValue: 5 },
      { key: 'headerHeight', label: 'Titlebar Height', type: 'number', min: 20, max: 40, step: 1, defaultValue: 28 },
    ],
    defaultParams: { lineCount: 5, headerHeight: 28 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const hh = helpers.clamp(Number(params.headerHeight) || 28, 20, 40);
  return [
    { id: 'headerHeight', label: \`Header: \${Math.round(hh)}px\`, x: width * 0.5, y: hh, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'headerHeight') {
    return { ...params, headerHeight: Math.round(helpers.clamp(localY, 20, 40)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const lines = Math.round(helpers.clamp(Number(params.lineCount) || 5, 3, 7));
  return { ...params, lineCount: lines >= 7 ? 3 : lines + 1 };
}

function buildPaths(width, height, params, helpers) {
  const lines = Math.round(helpers.clamp(Number(params.lineCount) || 5, 3, 7));
  const hh = helpers.clamp(Number(params.headerHeight) || 28, 20, 40);
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.polygonPath([{ x: 0, y: hh }, { x: width, y: hh }], false), closed: false },
    { nodes: helpers.ellipsePath(16, hh * 0.5, 4, 4), closed: true },
    { nodes: helpers.ellipsePath(28, hh * 0.5, 4, 4), closed: true },
    { nodes: helpers.ellipsePath(40, hh * 0.5, 4, 4), closed: true }
  ];
  const rowH = (height - hh - 16) / lines;
  for (let i = 0; i < lines; i++) {
    const indent = (i % 3) * 14;
    const lw = (width - 40 - indent) * (0.45 + ((i * 19) % 45) / 100);
    paths.push({ nodes: helpers.rectPath(16 + indent, hh + 10 + i * rowH, Math.max(20, lw), Math.min(8, rowH * 0.55), 0), closed: true });
  }
  return paths;
}`,
  },

  // 45. Data Table Grid
  {
    id: 'layout-table-grid',
    name: 'Interactive Data Table',
    category: 'Web & Layouts',
    description: 'Structured CRUD data table with column headers, row dividers, and selectable active row.',
    iconName: 'Table',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click any table row in Preview Mode to highlight that record',
    paramSchema: [
      { key: 'rows', label: 'Data Rows', type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
      { key: 'cols', label: 'Columns', type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
      { key: 'selectedRow', label: 'Selected Row', type: 'number', min: 1, max: 6, step: 1, defaultValue: 2 },
    ],
    defaultParams: { rows: 4, cols: 3, selectedRow: 2 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const rows = Math.round(helpers.clamp(Number(params.rows) || 4, 3, 6));
  const sel = Math.round(helpers.clamp(Number(params.selectedRow) || 2, 1, rows));
  const rowH = height / (rows + 1);
  return [
    { id: 'selectedRow', label: \`Row #\${sel}\`, x: width * 0.5, y: (sel + 0.5) * rowH, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  const rows = Math.round(helpers.clamp(Number(params.rows) || 4, 3, 6));
  const rowH = height / (rows + 1);
  if (id === 'selectedRow') {
    const idx = helpers.clamp(Math.floor((localY - rowH) / rowH) + 1, 1, rows);
    return { ...params, selectedRow: idx };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const rows = Math.round(helpers.clamp(Number(params.rows) || 4, 3, 6));
  const rowH = height / (rows + 1);
  const idx = helpers.clamp(Math.floor((localY - rowH) / rowH) + 1, 1, rows);
  return { ...params, selectedRow: idx };
}

function buildPaths(width, height, params, helpers) {
  const rows = Math.round(helpers.clamp(Number(params.rows) || 4, 3, 6));
  const cols = Math.round(helpers.clamp(Number(params.cols) || 3, 2, 5));
  const sel = Math.round(helpers.clamp(Number(params.selectedRow) || 2, 1, rows));
  const rowH = height / (rows + 1);
  const colW = width / cols;
  const paths = [{ nodes: helpers.rectPath(0, 0, width, height, 0), closed: true }];

  for (let r = 1; r <= rows; r++) {
    const ry = r * rowH;
    paths.push({ nodes: helpers.polygonPath([{ x: 0, y: ry }, { x: width, y: ry }], false), closed: false });
    if (r === sel) {
      paths.push({ nodes: helpers.rectPath(4, ry + 3, width - 8, rowH - 6, 0), closed: true });
    }
  }
  for (let c = 1; c < cols; c++) {
    paths.push({ nodes: helpers.polygonPath([{ x: c * colW, y: 0 }, { x: c * colW, y: height }], false), closed: false });
  }
  return paths;
}`,
  },

  // 46. Activity Timeline Feed
  {
    id: 'layout-timeline-feed',
    name: 'Vertical Activity Timeline',
    category: 'Web & Layouts',
    description: 'Changelog / activity feed with vertical spine, milestone nodes, and event cards.',
    iconName: 'GitBranch',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click any event card in Preview Mode to focus that timeline milestone',
    paramSchema: [
      { key: 'events', label: 'Event Nodes', type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
      { key: 'activeEvent', label: 'Focused Event', type: 'number', min: 1, max: 5, step: 1, defaultValue: 2 },
    ],
    defaultParams: { events: 3, activeEvent: 2 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.events) || 3, 2, 5));
  const active = Math.round(helpers.clamp(Number(params.activeEvent) || 2, 1, count));
  return [
    { id: 'activeEvent', label: \`Event #\${active}\`, x: 24, y: ((active - 0.5) / count) * height, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.events) || 3, 2, 5));
  if (id === 'activeEvent') {
    const idx = helpers.clamp(Math.floor((localY / Math.max(1, height)) * count) + 1, 1, count);
    return { ...params, activeEvent: idx };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.events) || 3, 2, 5));
  const idx = helpers.clamp(Math.floor((localY / Math.max(1, height)) * count) + 1, 1, count);
  return { ...params, activeEvent: idx };
}

function buildPaths(width, height, params, helpers) {
  const count = Math.round(helpers.clamp(Number(params.events) || 3, 2, 5));
  const active = Math.round(helpers.clamp(Number(params.activeEvent) || 2, 1, count));
  const spineX = 22;
  const slotH = height / count;
  const paths = [
    { nodes: helpers.polygonPath([{ x: spineX, y: 12 }, { x: spineX, y: height - 12 }], false), closed: false }
  ];
  for (let i = 0; i < count; i++) {
    const cy = (i + 0.5) * slotH;
    const isAct = i + 1 === active;
    paths.push({ nodes: helpers.ellipsePath(spineX, cy, isAct ? 9 : 6, isAct ? 9 : 6), closed: true });
    paths.push({ nodes: helpers.rectPath(40, cy - slotH * 0.36, width - 48, slotH * 0.72, 0), closed: true });
    paths.push({ nodes: helpers.rectPath(50, cy - 4, (width - 68) * 0.65, 8, 0), closed: true });
  }
  return paths;
}`,
  },

  // 47. Empty State Placeholder
  {
    id: 'layout-Empty-state',
    name: 'Empty State Card',
    category: 'Web & Layouts',
    description: 'Zero-data placeholder card with central illustration badge, title, subtext, and primary CTA.',
    iconName: 'Inbox',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle illustration ring size',
    paramSchema: [
      { key: 'badgeScale', label: 'Illustration Scale', type: 'number', min: 0.14, max: 0.32, step: 0.01, defaultValue: 0.22 },
      { key: 'btnWidthRatio', label: 'CTA Width Ratio', type: 'number', min: 0.28, max: 0.6, step: 0.01, defaultValue: 0.42 },
    ],
    defaultParams: { badgeScale: 0.22, btnWidthRatio: 0.42 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const bs = helpers.clamp(Number(params.badgeScale) || 0.22, 0.14, 0.32);
  const r = Math.min(width, height) * bs;
  return [
    { id: 'badgeScale', label: \`Icon: \${Math.round(bs * 100)}%\`, x: width * 0.5 + r, y: height * 0.34, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'badgeScale') {
    const s = helpers.clamp(Math.abs(localX - width * 0.5) / Math.max(1, Math.min(width, height)), 0.14, 0.32);
    return { ...params, badgeScale: Number(s.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const bs = helpers.clamp(Number(params.badgeScale) || 0.22, 0.14, 0.32);
  return { ...params, badgeScale: bs > 0.23 ? 0.17 : 0.27 };
}

function buildPaths(width, height, params, helpers) {
  const bs = helpers.clamp(Number(params.badgeScale) || 0.22, 0.14, 0.32);
  const bw = helpers.clamp(Number(params.btnWidthRatio) || 0.42, 0.28, 0.6) * width;
  const cx = width * 0.5;
  const cy = height * 0.34;
  const r = Math.min(width, height) * bs;
  return [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.ellipsePath(cx, cy, r, r), closed: true },
    { nodes: helpers.rectPath(cx - r * 0.45, cy - r * 0.35, r * 0.9, r * 0.7, 0), closed: true },
    { nodes: helpers.rectPath(cx - width * 0.28, cy + r + 12, width * 0.56, 9, 0), closed: true },
    { nodes: helpers.rectPath(cx - width * 0.2, cy + r + 26, width * 0.4, 6, 0), closed: true },
    { nodes: helpers.rectPath(cx - bw * 0.5, height - 34, bw, 22, 11), closed: true }
  ];
}`,
  },

  // 48. Shimmer Skeleton Loader Card
  {
    id: 'layout-skeleton-card',
    name: 'Skeleton Loading Card',
    category: 'Web & Layouts',
    description: 'Loading placeholder card with avatar circle, header bars, media block, and text lines.',
    iconName: 'Loader',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle the number of skeleton text placeholder lines',
    paramSchema: [
      { key: 'textLines', label: 'Text Lines', type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
      { key: 'mediaRatio', label: 'Media Block Ratio', type: 'number', min: 0.25, max: 0.52, step: 0.01, defaultValue: 0.38 },
    ],
    defaultParams: { textLines: 3, mediaRatio: 0.38 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const mr = helpers.clamp(Number(params.mediaRatio) || 0.38, 0.25, 0.52);
  return [
    { id: 'mediaRatio', label: \`Media: \${Math.round(mr * 100)}%\`, x: width * 0.5, y: 44 + height * mr, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'mediaRatio') {
    const r = helpers.clamp((localY - 44) / Math.max(1, height), 0.25, 0.52);
    return { ...params, mediaRatio: Number(r.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const lines = Math.round(helpers.clamp(Number(params.textLines) || 3, 2, 5));
  return { ...params, textLines: lines >= 5 ? 2 : lines + 1 };
}

function buildPaths(width, height, params, helpers) {
  const lines = Math.round(helpers.clamp(Number(params.textLines) || 3, 2, 5));
  const mh = helpers.clamp(Number(params.mediaRatio) || 0.38, 0.25, 0.52) * height;
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.ellipsePath(24, 24, 12, 12), closed: true },
    { nodes: helpers.rectPath(44, 16, width * 0.42, 7, 0), closed: true },
    { nodes: helpers.rectPath(44, 27, width * 0.26, 5, 0), closed: true },
    { nodes: helpers.rectPath(12, 44, width - 24, mh, 0), closed: true }
  ];
  const startY = 52 + mh;
  const rowH = Math.max(8, (height - startY - 10) / lines);
  for (let i = 0; i < lines; i++) {
    const wRatio = i === lines - 1 ? 0.62 : 0.92;
    paths.push({ nodes: helpers.rectPath(12, startY + i * rowH, (width - 24) * wRatio, Math.min(8, rowH * 0.6), 0), closed: true });
  }
  return paths;
}`,
  },

  // 49. KPI Metric Sparkline Card
  {
    id: 'chart-kpi-sparkline',
    name: 'KPI Metric Sparkline Card',
    category: 'Data & Charts',
    description: 'Executive dashboard KPI card with metric title, trend pill badge, and interactive sparkline curve.',
    iconName: 'TrendingUp',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to adjust sparkline peak amplitude',
    paramSchema: [
      { key: 'peakRatio', label: 'Trend Peak Ratio', type: 'number', min: 0.2, max: 0.9, step: 0.02, defaultValue: 0.72 },
      { key: 'points', label: 'Sparkline Points', type: 'number', min: 4, max: 9, step: 1, defaultValue: 6 },
    ],
    defaultParams: { peakRatio: 0.72, points: 6 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const peak = helpers.clamp(Number(params.peakRatio) || 0.72, 0.2, 0.9);
  return [
    { id: 'peakRatio', label: \`Peak: \${Math.round(peak * 100)}%\`, x: width - 20, y: height - 16 - (height * 0.45) * peak, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'peakRatio') {
    const p = helpers.clamp((height - 16 - localY) / Math.max(1, height * 0.45), 0.2, 0.9);
    return { ...params, peakRatio: Number(p.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const p = helpers.clamp(1 - localY / Math.max(1, height), 0.25, 0.9);
  return { ...params, peakRatio: Number(p.toFixed(2)) };
}

function buildPaths(width, height, params, helpers) {
  const peak = helpers.clamp(Number(params.peakRatio) || 0.72, 0.2, 0.9);
  const count = Math.round(helpers.clamp(Number(params.points) || 6, 4, 9));
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.rectPath(14, 14, width * 0.42, 7, 0), closed: true },
    { nodes: helpers.rectPath(14, 28, width * 0.5, 14, 0), closed: true },
    { nodes: helpers.rectPath(width - 54, 14, 40, 14, 7), closed: true }
  ];
  const chartTop = height * 0.5;
  const chartH = height * 0.38;
  const pts = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const wave = 0.25 + 0.75 * t * peak + Math.sin(i * 1.4) * 0.12;
    const x = 14 + t * (width - 28);
    const y = chartTop + chartH * (1 - helpers.clamp(wave, 0.1, 0.98));
    pts.push({ x, y });
  }
  paths.push({ nodes: helpers.polygonPath(pts, false), closed: false });
  return paths;
}`,
  },

  // 50. Circular Gauge Meter
  {
    id: 'chart-circular-gauge',
    name: 'Circular Radial Gauge',
    category: 'Data & Charts',
    description: '270-degree radial speedometer gauge with active value arc, needle pointer, and center hub.',
    iconName: 'Gauge',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click or drag horizontally in Preview Mode to set the radial gauge percentage',
    paramSchema: [
      { key: 'valueRatio', label: 'Gauge Value Ratio', type: 'number', min: 0.05, max: 1, step: 0.01, defaultValue: 0.74 },
      { key: 'ringRatio', label: 'Inner Ring Ratio', type: 'number', min: 0.55, max: 0.85, step: 0.01, defaultValue: 0.72 },
    ],
    defaultParams: { valueRatio: 0.74, ringRatio: 0.72 },
    jsSourceCode: `function getControlPoints(width, height, params, helpers) {
  const val = helpers.clamp(Number(params.valueRatio) || 0.74, 0.05, 1);
  const cx = width * 0.5;
  const cy = height * 0.54;
  const r = Math.min(width, height) * 0.4;
  const deg = 135 + val * 270;
  const rad = helpers.degToRad(deg);
  return [
    { id: 'valueRatio', label: \`Gauge: \${Math.round(val * 100)}%\`, x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r, cursor: 'pointer' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'valueRatio') {
    const v = helpers.clamp(localX / Math.max(1, width), 0.05, 1);
    return { ...params, valueRatio: Number(v.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const v = helpers.clamp(localX / Math.max(1, width), 0.05, 1);
  return { ...params, valueRatio: Number(v.toFixed(2)) };
}

function buildPaths(width, height, params, helpers) {
  const val = helpers.clamp(Number(params.valueRatio) || 0.74, 0.05, 1);
  const ringRatio = helpers.clamp(Number(params.ringRatio) || 0.72, 0.55, 0.85);
  const cx = width * 0.5;
  const cy = height * 0.54;
  const outerR = Math.min(width, height) * 0.42;
  const innerR = outerR * ringRatio;
  const deg = 135 + val * 270;
  const rad = helpers.degToRad(deg);

  return [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.arcNodes(cx, cy, outerR, outerR, 135, 270), closed: false },
    { nodes: helpers.arcNodes(cx, cy, innerR, innerR, 135, Math.max(10, val * 270)), closed: false },
    { nodes: helpers.ellipsePath(cx, cy, outerR * 0.14, outerR * 0.14), closed: true },
    {
      nodes: helpers.polygonPath([
        { x: cx, y: cy },
        { x: cx + Math.cos(rad) * (innerR * 0.92), y: cy + Math.sin(rad) * (innerR * 0.92) }
      ], false),
      closed: false
    },
    { nodes: helpers.rectPath(cx - outerR * 0.45, height - 18, outerR * 0.9, 8, 0), closed: true }
  ];
}`,
  },
];


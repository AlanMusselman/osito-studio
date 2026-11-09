import type { AutoShapeDefinition } from '../types/editor';

/**
 * 280 Built-In Sitemap, Information Architecture, ISO-5807 Flowchart, BPMN 2.0, UML 2.5,
 * Cloud/DevOps, AI/Agentic Workflow & Executive Strategy AutoShapes (.jsf).
 * Every AutoShape is parametric (1-3 yellow diamond handles), Preview-Mode interactive (`onPreviewClick`),
 * and includes a centered editable `label` textblock.
 */
const RAW_SITEMAP_AND_FLOW_AUTOSHAPES: AutoShapeDefinition[] = [
  // 1. Sitemap Root / Home Page Wireframe Node
  {
    id: 'sitemap-root-home',
    name: 'Sitemap: Root Home Page',
    category: 'Web & Layouts',
    description: 'Primary root domain wireframe card with browser top bar, hero banner, feature columns, and expandable child tree badge.',
    iconName: 'Home',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle feature columns (1-4) and toggle child branch badge',
    paramSchema: [
      { key: 'headerRatio', label: 'Hero Banner Height', type: 'number', min: 0.18, max: 0.52, step: 0.01, defaultValue: 0.34 },
      { key: 'columns', label: 'Feature Columns', type: 'number', min: 1, max: 4, step: 1, defaultValue: 3 },
      { key: 'expanded', label: 'Show Child Branch Badge', type: 'boolean', defaultValue: true },
    ],
    defaultParams: { headerRatio: 0.34, columns: 3, expanded: true },
    jsSourceCode: `// Sitemap: Root Home Page (.jsf)
function getControlPoints(width, height, params, helpers) {
  const hr = helpers.clamp(Number(params.headerRatio) || 0.34, 0.18, 0.52);
  const cols = Math.round(helpers.clamp(Number(params.columns) || 3, 1, 4));
  return [
    { id: 'headerRatio', label: \`Hero: \${Math.round(hr * 100)}%\`, x: width * 0.5, y: height * (0.14 + hr), cursor: 'ns-resize' },
    { id: 'columns', label: \`Cols: \${cols}\`, x: helpers.lerp(width * 0.2, width * 0.8, (cols - 1) / 3), y: height - 10, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'headerRatio') {
    const hr = helpers.clamp(localY / Math.max(1, height) - 0.14, 0.18, 0.52);
    return { ...params, headerRatio: Number(hr.toFixed(2)) };
  }
  if (id === 'columns') {
    const t = helpers.clamp((localX - width * 0.2) / (width * 0.6), 0, 1);
    return { ...params, columns: Math.round(1 + t * 3) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  if (localY > height * 0.82) {
    return { ...params, expanded: !params.expanded };
  }
  const nextCols = (Math.round(Number(params.columns) || 3) % 4) + 1;
  return { ...params, columns: nextCols };
}

function buildPaths(width, height, params, helpers) {
  const hr = helpers.clamp(Number(params.headerRatio) || 0.34, 0.18, 0.52);
  const cols = Math.round(helpers.clamp(Number(params.columns) || 3, 1, 4));
  const expanded = params.expanded !== false;
  const chromeH = Math.max(14, height * 0.14);
  const pad = Math.max(6, width * 0.06);
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height * 0.9, 0), closed: true },
    { nodes: helpers.polygonPath([{ x: 0, y: chromeH }, { x: width, y: chromeH }], false), closed: false }
  ];
  // Browser dots + home roof glyph in top bar
  const dotR = Math.max(2, chromeH * 0.16);
  for (let i = 0; i < 3; i++) {
    paths.push({ nodes: helpers.ellipsePath(pad + i * (dotR * 2.8), chromeH * 0.5, dotR, dotR), closed: true });
  }
  // Hero block
  const heroY = chromeH + pad * 0.7;
  const heroH = Math.max(12, height * hr);
  paths.push({ nodes: helpers.rectPath(pad, heroY, width - pad * 2, heroH, 0), closed: true });
  // Feature columns
  const gridY = heroY + heroH + pad * 0.7;
  const gridH = Math.max(10, height * 0.86 - gridY - pad * 0.5);
  const gap = pad * 0.6;
  const colW = (width - pad * 2 - gap * (cols - 1)) / cols;
  for (let c = 0; c < cols; c++) {
    paths.push({ nodes: helpers.rectPath(pad + c * (colW + gap), gridY, colW, gridH, 0), closed: true });
  }
  // Child connector badge at bottom center
  const badgeR = Math.max(5, Math.min(width, height) * 0.055);
  const badgeCy = height * 0.9;
  paths.push({ nodes: helpers.ellipsePath(width / 2, badgeCy, badgeR, badgeR), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: width / 2 - badgeR * 0.5, y: badgeCy }, { x: width / 2 + badgeR * 0.5, y: badgeCy }], false), closed: false });
  if (!expanded) {
    paths.push({ nodes: helpers.polygonPath([{ x: width / 2, y: badgeCy - badgeR * 0.5 }, { x: width / 2, y: badgeCy + badgeR * 0.5 }], false), closed: false });
  }
  return paths;
}`,
  },

  // 2. Sitemap Category Hub / Section Pillar Node
  {
    id: 'sitemap-category-hub',
    name: 'Sitemap: Category Hub Node',
    category: 'Web & Layouts',
    description: 'Information architecture section pillar with folder tab header, sub-page cards, and interactive branch counter.',
    iconName: 'FolderTree',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle sub-category card count (2-6)',
    paramSchema: [
      { key: 'tabWidthRatio', label: 'Folder Tab Width', type: 'number', min: 0.25, max: 0.7, step: 0.01, defaultValue: 0.42 },
      { key: 'subCards', label: 'Sub-Category Cards', type: 'number', min: 2, max: 6, step: 1, defaultValue: 4 },
      { key: 'viewStyle', label: 'Layout Style (0=Grid, 1=Rows)', type: 'number', min: 0, max: 1, step: 1, defaultValue: 0 },
    ],
    defaultParams: { tabWidthRatio: 0.42, subCards: 4, viewStyle: 0 },
    jsSourceCode: `// Sitemap: Category Hub Node (.jsf)
function getControlPoints(width, height, params, helpers) {
  const tw = helpers.clamp(Number(params.tabWidthRatio) || 0.42, 0.25, 0.7);
  const cards = Math.round(helpers.clamp(Number(params.subCards) || 4, 2, 6));
  return [
    { id: 'tabWidthRatio', label: \`Tab: \${Math.round(tw * 100)}%\`, x: width * tw, y: height * 0.12, cursor: 'ew-resize' },
    { id: 'subCards', label: \`Items: \${cards}\`, x: helpers.lerp(width * 0.2, width * 0.8, (cards - 2) / 4), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'tabWidthRatio') {
    return { ...params, tabWidthRatio: Number(helpers.clamp(localX / Math.max(1, width), 0.25, 0.7).toFixed(2)) };
  }
  if (id === 'subCards') {
    const t = helpers.clamp((localX - width * 0.2) / (width * 0.6), 0, 1);
    return { ...params, subCards: Math.round(2 + t * 4) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const nextStyle = (Math.round(Number(params.viewStyle) || 0) + 1) % 2;
  const nextCards = ((Math.round(Number(params.subCards) || 4) - 1) % 5) + 2;
  return { ...params, viewStyle: nextStyle, subCards: nextCards };
}

function buildPaths(width, height, params, helpers) {
  const tw = helpers.clamp(Number(params.tabWidthRatio) || 0.42, 0.25, 0.7);
  const cards = Math.round(helpers.clamp(Number(params.subCards) || 4, 2, 6));
  const style = Math.round(Number(params.viewStyle) || 0);
  const tabH = Math.max(12, height * 0.15);
  const slope = Math.max(8, width * 0.06);
  const pad = Math.max(6, width * 0.06);

  const outerPts = [
    { x: 0, y: 0 },
    { x: width * tw, y: 0 },
    { x: width * tw + slope, y: tabH },
    { x: width, y: tabH },
    { x: width, y: height },
    { x: 0, y: height }
  ];
  const paths = [{ nodes: helpers.polygonPath(outerPts), closed: true }];
  const bodyTop = tabH + pad;
  const bodyH = Math.max(16, height - bodyTop - pad);

  if (style === 0) {
    const cols = 2;
    const rows = Math.ceil(cards / cols);
    const gap = pad * 0.55;
    const cw = (width - pad * 2 - gap) / 2;
    const ch = (bodyH - gap * (rows - 1)) / rows;
    for (let i = 0; i < cards; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      paths.push({ nodes: helpers.rectPath(pad + c * (cw + gap), bodyTop + r * (ch + gap), cw, ch, 0), closed: true });
    }
  } else {
    const gap = pad * 0.45;
    const rh = (bodyH - gap * (cards - 1)) / cards;
    for (let i = 0; i < cards; i++) {
      paths.push({ nodes: helpers.rectPath(pad, bodyTop + i * (rh + gap), width - pad * 2, rh, 0), closed: true });
    }
  }
  return paths;
}`,
  },

  // 3. Sitemap Marketing Landing Page Wireframe
  {
    id: 'sitemap-landing-page',
    name: 'Sitemap: Marketing Landing Page',
    category: 'Web & Layouts',
    description: 'Conversion landing page card with split hero CTA, social proof bar, and testimonial grid.',
    iconName: 'LayoutTemplate',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle hero alignment (Left Split, Centered, Full Media)',
    paramSchema: [
      { key: 'heroSplit', label: 'Hero Split Ratio', type: 'number', min: 0.3, max: 0.75, step: 0.01, defaultValue: 0.55 },
      { key: 'ctaHeight', label: 'CTA Band Ratio', type: 'number', min: 0.12, max: 0.32, step: 0.01, defaultValue: 0.2 },
      { key: 'heroVariant', label: 'Hero Layout (0-2)', type: 'number', min: 0, max: 2, step: 1, defaultValue: 0 },
    ],
    defaultParams: { heroSplit: 0.55, ctaHeight: 0.2, heroVariant: 0 },
    jsSourceCode: `// Sitemap: Marketing Landing Page (.jsf)
function getControlPoints(width, height, params, helpers) {
  const split = helpers.clamp(Number(params.heroSplit) || 0.55, 0.3, 0.75);
  const cta = helpers.clamp(Number(params.ctaHeight) || 0.2, 0.12, 0.32);
  return [
    { id: 'heroSplit', label: \`Split: \${Math.round(split * 100)}%\`, x: width * split, y: height * 0.32, cursor: 'ew-resize' },
    { id: 'ctaHeight', label: \`CTA Band: \${Math.round(cta * 100)}%\`, x: width * 0.5, y: height * (1 - cta), cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'heroSplit') {
    return { ...params, heroSplit: Number(helpers.clamp(localX / Math.max(1, width), 0.3, 0.75).toFixed(2)) };
  }
  if (id === 'ctaHeight') {
    return { ...params, ctaHeight: Number(helpers.clamp(1 - localY / Math.max(1, height), 0.12, 0.32).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const nextVar = (Math.round(Number(params.heroVariant) || 0) + 1) % 3;
  return { ...params, heroVariant: nextVar };
}

function buildPaths(width, height, params, helpers) {
  const split = helpers.clamp(Number(params.heroSplit) || 0.55, 0.3, 0.75);
  const ctaRatio = helpers.clamp(Number(params.ctaHeight) || 0.2, 0.12, 0.32);
  const variant = Math.round(Number(params.heroVariant) || 0);
  const pad = Math.max(6, width * 0.06);
  const navH = Math.max(12, height * 0.13);
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.polygonPath([{ x: 0, y: navH }, { x: width, y: navH }], false), closed: false }
  ];
  const heroY = navH + pad;
  const heroH = height * (0.58 - ctaRatio * 0.4);
  const heroBtnR = Math.min(12, heroH * 0.16);
  if (variant === 0) {
    const leftW = (width - pad * 3) * split;
    const rightW = width - pad * 3 - leftW;
    paths.push({ nodes: helpers.rectPath(pad, heroY, leftW, heroH * 0.52, 0), closed: true });
    paths.push({ nodes: helpers.rectPath(pad, heroY + heroH * 0.64, leftW * 0.55, heroH * 0.32, heroBtnR), closed: true });
    paths.push({ nodes: helpers.rectPath(pad * 2 + leftW, heroY, rightW, heroH, 0), closed: true });
  } else if (variant === 1) {
    paths.push({ nodes: helpers.rectPath(width * 0.18, heroY, width * 0.64, heroH * 0.5, 0), closed: true });
    paths.push({ nodes: helpers.rectPath(width * 0.32, heroY + heroH * 0.62, width * 0.36, heroH * 0.32, heroBtnR), closed: true });
  } else {
    paths.push({ nodes: helpers.rectPath(pad, heroY, width - pad * 2, heroH, 0), closed: true });
  }
  const ctaY = height * (1 - ctaRatio);
  const botBtnH = (height - ctaY) * 0.5;
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: ctaY }, { x: width, y: ctaY }], false), closed: false });
  paths.push({ nodes: helpers.rectPath(width * 0.28, ctaY + (height - ctaY) * 0.25, width * 0.44, botBtnH, Math.min(12, botBtnH * 0.5)), closed: true });
  return paths;
}`,
  },

  // 4. Sitemap Auth / Login Gate Page Node
  {
    id: 'sitemap-auth-gate',
    name: 'Sitemap: Auth / Login Gate',
    category: 'Web & Layouts',
    description: 'Authentication screen card with centered login box, padlock security emblem, and SSO provider buttons.',
    iconName: 'Lock',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle Locked vs Unlocked state and cycle SSO buttons',
    paramSchema: [
      { key: 'cardWidthRatio', label: 'Auth Card Width', type: 'number', min: 0.45, max: 0.88, step: 0.01, defaultValue: 0.68 },
      { key: 'ssoCount', label: 'SSO Provider Buttons', type: 'number', min: 1, max: 4, step: 1, defaultValue: 3 },
      { key: 'unlocked', label: 'Unlocked State', type: 'boolean', defaultValue: false },
    ],
    defaultParams: { cardWidthRatio: 0.68, ssoCount: 3, unlocked: false },
    jsSourceCode: `// Sitemap: Auth / Login Gate (.jsf)
function getControlPoints(width, height, params, helpers) {
  const cw = helpers.clamp(Number(params.cardWidthRatio) || 0.68, 0.45, 0.88);
  const sso = Math.round(helpers.clamp(Number(params.ssoCount) || 3, 1, 4));
  return [
    { id: 'cardWidthRatio', label: \`Card: \${Math.round(cw * 100)}%\`, x: width * (0.5 + cw / 2), y: height * 0.5, cursor: 'ew-resize' },
    { id: 'ssoCount', label: \`SSO: \${sso}\`, x: helpers.lerp(width * 0.25, width * 0.75, (sso - 1) / 3), y: height - 10, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'cardWidthRatio') {
    const cw = helpers.clamp(Math.abs(localX - width * 0.5) * 2 / Math.max(1, width), 0.45, 0.88);
    return { ...params, cardWidthRatio: Number(cw.toFixed(2)) };
  }
  if (id === 'ssoCount') {
    const t = helpers.clamp((localX - width * 0.25) / (width * 0.5), 0, 1);
    return { ...params, ssoCount: Math.round(1 + t * 3) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, unlocked: !params.unlocked };
}

function buildPaths(width, height, params, helpers) {
  const cw = helpers.clamp(Number(params.cardWidthRatio) || 0.68, 0.45, 0.88) * width;
  const sso = Math.round(helpers.clamp(Number(params.ssoCount) || 3, 1, 4));
  const unlocked = Boolean(params.unlocked);
  const cx = width / 2;
  const cardX = (width - cw) / 2;
  const cardY = height * 0.14;
  const cardH = height * 0.76;

  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.rectPath(cardX, cardY, cw, cardH, 0), closed: true }
  ];
  // Padlock icon at top of auth card
  const lockW = Math.max(12, cw * 0.22);
  const lockH = Math.max(10, cardH * 0.16);
  const lockY = cardY + cardH * 0.14;
  paths.push({ nodes: helpers.rectPath(cx - lockW / 2, lockY, lockW, lockH, 0), closed: true });
  const shackleShift = unlocked ? lockW * 0.35 : 0;
  paths.push({
    nodes: helpers.arcNodes(cx + shackleShift, lockY, lockW * 0.32, lockH * 0.55, 180, 180),
    closed: false
  });
  // Input fields (sharp 0px rectangles)
  const inW = cw * 0.8;
  const inH = cardH * 0.12;
  paths.push({ nodes: helpers.rectPath(cx - inW / 2, lockY + lockH + cardH * 0.08, inW, inH, 0), closed: true });
  paths.push({ nodes: helpers.rectPath(cx - inW / 2, lockY + lockH + cardH * 0.24, inW, inH, 0), closed: true });
  // SSO buttons (pill rounded)
  const ssoY = cardY + cardH * 0.78;
  const gap = cw * 0.04;
  const btnW = (inW - gap * (sso - 1)) / sso;
  for (let i = 0; i < sso; i++) {
    paths.push({ nodes: helpers.rectPath(cx - inW / 2 + i * (btnW + gap), ssoY, btnW, inH, Math.min(10, inH * 0.5)), closed: true });
  }
  return paths;
}`,
  },

  // 5. Sitemap CMS Collection Index / Grid Page
  {
    id: 'sitemap-cms-collection',
    name: 'Sitemap: CMS Collection Grid',
    category: 'Web & Layouts',
    description: 'Database-backed CMS collection wireframe showing filter bar, repeating card matrix, and pagination.',
    iconName: 'Database',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle grid density (2x2, 3x2, 3x3)',
    paramSchema: [
      { key: 'cols', label: 'Collection Columns', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
      { key: 'rows', label: 'Collection Rows', type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
      { key: 'filterBarRatio', label: 'Filter Bar Height', type: 'number', min: 0.1, max: 0.25, step: 0.01, defaultValue: 0.15 },
    ],
    defaultParams: { cols: 3, rows: 2, filterBarRatio: 0.15 },
    jsSourceCode: `// Sitemap: CMS Collection Grid (.jsf)
function getControlPoints(width, height, params, helpers) {
  const cols = Math.round(helpers.clamp(Number(params.cols) || 3, 2, 4));
  const fb = helpers.clamp(Number(params.filterBarRatio) || 0.15, 0.1, 0.25);
  return [
    { id: 'filterBarRatio', label: \`Filter: \${Math.round(fb * 100)}%\`, x: width * 0.5, y: height * (0.12 + fb), cursor: 'ns-resize' },
    { id: 'cols', label: \`Cols: \${cols}\`, x: helpers.lerp(width * 0.25, width * 0.75, (cols - 2) / 2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'filterBarRatio') {
    const fb = helpers.clamp(localY / Math.max(1, height) - 0.12, 0.1, 0.25);
    return { ...params, filterBarRatio: Number(fb.toFixed(2)) };
  }
  if (id === 'cols') {
    const t = helpers.clamp((localX - width * 0.25) / (width * 0.5), 0, 1);
    return { ...params, cols: Math.round(2 + t * 2) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cols = Math.round(Number(params.cols) || 3);
  const rows = Math.round(Number(params.rows) || 2);
  if (cols === 2 && rows === 2) return { ...params, cols: 3, rows: 2 };
  if (cols === 3 && rows === 2) return { ...params, cols: 3, rows: 3 };
  return { ...params, cols: 2, rows: 2 };
}

function buildPaths(width, height, params, helpers) {
  const cols = Math.round(helpers.clamp(Number(params.cols) || 3, 2, 4));
  const rows = Math.round(helpers.clamp(Number(params.rows) || 2, 1, 3));
  const fb = helpers.clamp(Number(params.filterBarRatio) || 0.15, 0.1, 0.25);
  const pad = Math.max(6, width * 0.06);
  const topH = height * 0.12;
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.polygonPath([{ x: 0, y: topH }, { x: width, y: topH }], false), closed: false },
    { nodes: helpers.rectPath(pad, topH + pad * 0.6, width - pad * 2, height * fb, 0), closed: true }
  ];
  const gridY = topH + pad * 1.3 + height * fb;
  const gridH = Math.max(16, height - gridY - pad);
  const gap = pad * 0.5;
  const cw = (width - pad * 2 - gap * (cols - 1)) / cols;
  const ch = (gridH - gap * (rows - 1)) / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      paths.push({ nodes: helpers.rectPath(pad + c * (cw + gap), gridY + r * (ch + gap), cw, ch, 0), closed: true });
    }
  }
  return paths;
}`,
  },

  // 6. Sitemap Dynamic Slug Template [slug] Page
  {
    id: 'sitemap-dynamic-slug',
    name: 'Sitemap: Dynamic [slug] Template',
    category: 'Web & Layouts',
    description: 'Dynamic route template node with stacked cascade shadow, URL bracket glyph, and parametric sidebar.',
    iconName: 'Code2',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle dynamic template stack depth (1-3 layers)',
    paramSchema: [
      { key: 'stackOffset', label: 'Cascade Stack Offset (px)', type: 'number', min: 4, max: 16, step: 1, defaultValue: 8 },
      { key: 'sidebarRatio', label: 'Sidebar Width Ratio', type: 'number', min: 0.2, max: 0.45, step: 0.01, defaultValue: 0.3 },
      { key: 'layers', label: 'Template Layers', type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
    ],
    defaultParams: { stackOffset: 8, sidebarRatio: 0.3, layers: 2 },
    jsSourceCode: `// Sitemap: Dynamic [slug] Template (.jsf)
function getControlPoints(width, height, params, helpers) {
  const sb = helpers.clamp(Number(params.sidebarRatio) || 0.3, 0.2, 0.45);
  const off = helpers.clamp(Number(params.stackOffset) || 8, 4, 16);
  return [
    { id: 'sidebarRatio', label: \`Sidebar: \${Math.round(sb * 100)}%\`, x: width * (1 - sb), y: height * 0.55, cursor: 'ew-resize' },
    { id: 'stackOffset', label: \`Stack: \${Math.round(off)}px\`, x: width - off, y: off, cursor: 'nwse-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'sidebarRatio') {
    return { ...params, sidebarRatio: Number(helpers.clamp(1 - localX / Math.max(1, width), 0.2, 0.45).toFixed(2)) };
  }
  if (id === 'stackOffset') {
    return { ...params, stackOffset: Math.round(helpers.clamp(localY, 4, 16)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const nextLayers = (Math.round(Number(params.layers) || 2) % 3) + 1;
  return { ...params, layers: nextLayers };
}

function buildPaths(width, height, params, helpers) {
  const off = helpers.clamp(Number(params.stackOffset) || 8, 4, 16);
  const sb = helpers.clamp(Number(params.sidebarRatio) || 0.3, 0.2, 0.45);
  const layers = Math.round(helpers.clamp(Number(params.layers) || 2, 1, 3));
  const totalOff = off * (layers - 1);
  const cardW = width - totalOff;
  const cardH = height - totalOff;
  const paths = [];

  for (let i = layers - 1; i >= 0; i--) {
    paths.push({ nodes: helpers.rectPath(i * off, (layers - 1 - i) * off, cardW, cardH, 0), closed: true });
  }
  const topY = (layers - 1) * off;
  const pad = Math.max(6, cardW * 0.06);
  const headH = cardH * 0.2;
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: topY + headH }, { x: cardW, y: topY + headH }], false), closed: false });
  // [slug] brackets inside header
  const bx1 = pad * 1.5;
  const bx2 = cardW * 0.45;
  const by1 = topY + headH * 0.26;
  const by2 = topY + headH * 0.74;
  paths.push({ nodes: helpers.polygonPath([{ x: bx1 + 5, y: by1 }, { x: bx1, y: by1 }, { x: bx1, y: by2 }, { x: bx1 + 5, y: by2 }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: bx2 - 5, y: by1 }, { x: bx2, y: by1 }, { x: bx2, y: by2 }, { x: bx2 - 5, y: by2 }], false), closed: false });
  // Main content & sidebar
  const bodyY = topY + headH + pad;
  const bodyH = cardH - headH - pad * 2;
  const mainW = (cardW - pad * 3) * (1 - sb);
  const sideW = cardW - pad * 3 - mainW;
  paths.push({ nodes: helpers.rectPath(pad, bodyY, mainW, bodyH, 0), closed: true });
  paths.push({ nodes: helpers.rectPath(pad * 2 + mainW, bodyY, sideW, bodyH, 0), closed: true });
  return paths;
}`,
  },

  // 7. Sitemap E-Commerce Product Detail Page (PDP)
  {
    id: 'sitemap-ecommerce-pdp',
    name: 'Sitemap: E-Commerce PDP',
    category: 'Web & Layouts',
    description: 'Product Detail Page wireframe with gallery media frame, thumbnail strip, buy box, and add-to-cart CTA.',
    iconName: 'ShoppingBag',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle gallery thumbnail count (2-5)',
    paramSchema: [
      { key: 'galleryRatio', label: 'Gallery Width Ratio', type: 'number', min: 0.35, max: 0.68, step: 0.01, defaultValue: 0.52 },
      { key: 'thumbs', label: 'Gallery Thumbnails', type: 'number', min: 2, max: 5, step: 1, defaultValue: 4 },
      { key: 'showSpecs', label: 'Show Bottom Specs Tab', type: 'boolean', defaultValue: true },
    ],
    defaultParams: { galleryRatio: 0.52, thumbs: 4, showSpecs: true },
    jsSourceCode: `// Sitemap: E-Commerce PDP (.jsf)
function getControlPoints(width, height, params, helpers) {
  const gr = helpers.clamp(Number(params.galleryRatio) || 0.52, 0.35, 0.68);
  const thumbs = Math.round(helpers.clamp(Number(params.thumbs) || 4, 2, 5));
  return [
    { id: 'galleryRatio', label: \`Gallery: \${Math.round(gr * 100)}%\`, x: width * gr, y: height * 0.42, cursor: 'ew-resize' },
    { id: 'thumbs', label: \`Thumbs: \${thumbs}\`, x: helpers.lerp(width * 0.12, width * 0.5, (thumbs - 2) / 3), y: height * 0.72, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'galleryRatio') {
    return { ...params, galleryRatio: Number(helpers.clamp(localX / Math.max(1, width), 0.35, 0.68).toFixed(2)) };
  }
  if (id === 'thumbs') {
    const t = helpers.clamp((localX - width * 0.12) / (width * 0.38), 0, 1);
    return { ...params, thumbs: Math.round(2 + t * 3) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const nextThumbs = ((Math.round(Number(params.thumbs) || 4) - 1) % 4) + 2;
  return { ...params, thumbs: nextThumbs, showSpecs: !params.showSpecs };
}

function buildPaths(width, height, params, helpers) {
  const gr = helpers.clamp(Number(params.galleryRatio) || 0.52, 0.35, 0.68);
  const thumbs = Math.round(helpers.clamp(Number(params.thumbs) || 4, 2, 5));
  const showSpecs = params.showSpecs !== false;
  const pad = Math.max(6, width * 0.055);
  const topH = height * 0.12;
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.polygonPath([{ x: 0, y: topH }, { x: width, y: topH }], false), closed: false }
  ];
  const bodyY = topH + pad;
  const mainH = showSpecs ? height * 0.56 : height * 0.74;
  const galW = (width - pad * 3) * gr;
  const buyW = width - pad * 3 - galW;
  const imgH = mainH * 0.76;
  paths.push({ nodes: helpers.rectPath(pad, bodyY, galW, imgH, 0), closed: true });
  // Thumbnails
  const tGap = pad * 0.4;
  const tw = (galW - tGap * (thumbs - 1)) / thumbs;
  const th = mainH * 0.18;
  for (let i = 0; i < thumbs; i++) {
    paths.push({ nodes: helpers.rectPath(pad + i * (tw + tGap), bodyY + imgH + mainH * 0.06, tw, th, 0), closed: true });
  }
  // Buy box details (sharp content bars) + Add-to-Cart CTA button (pill rounded)
  const bx = pad * 2 + galW;
  const ctaH = mainH * 0.28;
  paths.push({ nodes: helpers.rectPath(bx, bodyY, buyW, mainH * 0.22, 0), closed: true });
  paths.push({ nodes: helpers.rectPath(bx, bodyY + mainH * 0.3, buyW * 0.7, mainH * 0.16, 0), closed: true });
  paths.push({ nodes: helpers.rectPath(bx, bodyY + mainH * 0.58, buyW, ctaH, Math.min(12, ctaH * 0.5)), closed: true });
  if (showSpecs) {
    paths.push({ nodes: helpers.rectPath(pad, bodyY + mainH + pad, width - pad * 2, height - bodyY - mainH - pad * 2, 0), closed: true });
  }
  return paths;
}`,
  },

  // 8. Sitemap Multi-Step Checkout Funnel Page
  {
    id: 'sitemap-checkout-funnel',
    name: 'Sitemap: Checkout Funnel Page',
    category: 'Web & Layouts',
    description: 'Checkout flow wireframe with step progress stepper, shipping/payment form, and order summary sidebar.',
    iconName: 'CreditCard',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to advance the active checkout step indicator',
    paramSchema: [
      { key: 'steps', label: 'Checkout Steps', type: 'number', min: 2, max: 5, step: 1, defaultValue: 4 },
      { key: 'activeStep', label: 'Active Step Index', type: 'number', min: 1, max: 5, step: 1, defaultValue: 2 },
      { key: 'summaryRatio', label: 'Order Summary Width', type: 'number', min: 0.25, max: 0.48, step: 0.01, defaultValue: 0.36 },
    ],
    defaultParams: { steps: 4, activeStep: 2, summaryRatio: 0.36 },
    jsSourceCode: `// Sitemap: Checkout Funnel Page (.jsf)
function getControlPoints(width, height, params, helpers) {
  const sum = helpers.clamp(Number(params.summaryRatio) || 0.36, 0.25, 0.48);
  const steps = Math.round(helpers.clamp(Number(params.steps) || 4, 2, 5));
  return [
    { id: 'summaryRatio', label: \`Summary: \${Math.round(sum * 100)}%\`, x: width * (1 - sum), y: height * 0.6, cursor: 'ew-resize' },
    { id: 'steps', label: \`Steps: \${steps}\`, x: helpers.lerp(width * 0.2, width * 0.8, (steps - 2) / 3), y: height * 0.16, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'summaryRatio') {
    return { ...params, summaryRatio: Number(helpers.clamp(1 - localX / Math.max(1, width), 0.25, 0.48).toFixed(2)) };
  }
  if (id === 'steps') {
    const t = helpers.clamp((localX - width * 0.2) / (width * 0.6), 0, 1);
    return { ...params, steps: Math.round(2 + t * 3) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const steps = Math.round(helpers.clamp(Number(params.steps) || 4, 2, 5));
  const cur = Math.round(Number(params.activeStep) || 2);
  return { ...params, activeStep: (cur % steps) + 1 };
}

function buildPaths(width, height, params, helpers) {
  const steps = Math.round(helpers.clamp(Number(params.steps) || 4, 2, 5));
  const active = helpers.clamp(Math.round(Number(params.activeStep) || 2), 1, steps);
  const sumRatio = helpers.clamp(Number(params.summaryRatio) || 0.36, 0.25, 0.48);
  const pad = Math.max(6, width * 0.06);
  const paths = [{ nodes: helpers.rectPath(0, 0, width, height, 0), closed: true }];
  // Stepper bar
  const stepY = height * 0.16;
  const r = Math.max(4, Math.min(width, height) * 0.045);
  paths.push({ nodes: helpers.polygonPath([{ x: pad * 2, y: stepY }, { x: width - pad * 2, y: stepY }], false), closed: false });
  for (let i = 0; i < steps; i++) {
    const sx = helpers.lerp(pad * 2, width - pad * 2, i / Math.max(1, steps - 1));
    paths.push({ nodes: helpers.ellipsePath(sx, stepY, r, r), closed: true });
    if (i + 1 <= active) {
      paths.push({ nodes: helpers.ellipsePath(sx, stepY, r * 0.45, r * 0.45), closed: true });
    }
  }
  const bodyY = height * 0.28;
  const bodyH = height - bodyY - pad;
  const formW = (width - pad * 3) * (1 - sumRatio);
  const sumW = width - pad * 3 - formW;
  paths.push({ nodes: helpers.rectPath(pad, bodyY, formW, bodyH, 0), closed: true });
  paths.push({ nodes: helpers.rectPath(pad * 2 + formW, bodyY, sumW, bodyH, 0), closed: true });
  return paths;
}`,
  },

  // 9. Sitemap SaaS Dashboard Portal Page
  {
    id: 'sitemap-dashboard-portal',
    name: 'Sitemap: SaaS Dashboard Portal',
    category: 'Web & Layouts',
    description: 'Authenticated SaaS app wireframe with left navigation rail, KPI metric cards, and analytics chart.',
    iconName: 'LayoutDashboard',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to collapse/expand sidebar and cycle KPI card count',
    paramSchema: [
      { key: 'navWidthRatio', label: 'Left Nav Width Ratio', type: 'number', min: 0.1, max: 0.35, step: 0.01, defaultValue: 0.22 },
      { key: 'kpiCards', label: 'KPI Metric Cards', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
      { key: 'collapsed', label: 'Collapsed Sidebar', type: 'boolean', defaultValue: false },
    ],
    defaultParams: { navWidthRatio: 0.22, kpiCards: 3, collapsed: false },
    jsSourceCode: `// Sitemap: SaaS Dashboard Portal (.jsf)
function getControlPoints(width, height, params, helpers) {
  const nw = helpers.clamp(Number(params.navWidthRatio) || 0.22, 0.1, 0.35);
  const kpi = Math.round(helpers.clamp(Number(params.kpiCards) || 3, 2, 4));
  return [
    { id: 'navWidthRatio', label: \`Nav: \${Math.round(nw * 100)}%\`, x: width * nw, y: height * 0.5, cursor: 'ew-resize' },
    { id: 'kpiCards', label: \`KPIs: \${kpi}\`, x: helpers.lerp(width * 0.35, width * 0.85, (kpi - 2) / 2), y: height * 0.24, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'navWidthRatio') {
    return { ...params, navWidthRatio: Number(helpers.clamp(localX / Math.max(1, width), 0.1, 0.35).toFixed(2)) };
  }
  if (id === 'kpiCards') {
    const t = helpers.clamp((localX - width * 0.35) / (width * 0.5), 0, 1);
    return { ...params, kpiCards: Math.round(2 + t * 2) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  if (localX < width * 0.3) {
    return { ...params, collapsed: !params.collapsed };
  }
  const nextKpi = ((Math.round(Number(params.kpiCards) || 3) - 1) % 3) + 2;
  return { ...params, kpiCards: nextKpi };
}

function buildPaths(width, height, params, helpers) {
  const collapsed = Boolean(params.collapsed);
  const nw = collapsed ? width * 0.1 : helpers.clamp(Number(params.navWidthRatio) || 0.22, 0.1, 0.35) * width;
  const kpi = Math.round(helpers.clamp(Number(params.kpiCards) || 3, 2, 4));
  const pad = Math.max(6, width * 0.05);
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.polygonPath([{ x: nw, y: 0 }, { x: nw, y: height }], false), closed: false }
  ];
  const contentX = nw + pad;
  const contentW = width - nw - pad * 2;
  const kpiY = pad * 1.2;
  const kpiH = height * 0.24;
  const gap = pad * 0.5;
  const kw = (contentW - gap * (kpi - 1)) / kpi;
  for (let i = 0; i < kpi; i++) {
    paths.push({ nodes: helpers.rectPath(contentX + i * (kw + gap), kpiY, kw, kpiH, 0), closed: true });
  }
  const chartY = kpiY + kpiH + pad;
  const chartH = height - chartY - pad;
  paths.push({ nodes: helpers.rectPath(contentX, chartY, contentW, chartH, 0), closed: true });
  return paths;
}`,
  },

  // 10. Sitemap Account Settings & Preferences Node
  {
    id: 'sitemap-settings-node',
    name: 'Sitemap: Settings & Preferences',
    category: 'Web & Layouts',
    description: 'Account configuration wireframe with settings tab rail and interactive toggle switch rows.',
    iconName: 'Sliders',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to flip preference toggle switches',
    paramSchema: [
      { key: 'rows', label: 'Preference Toggle Rows', type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
      { key: 'tabRatio', label: 'Settings Rail Width', type: 'number', min: 0.2, max: 0.42, step: 0.01, defaultValue: 0.28 },
      { key: 'activeMask', label: 'Toggle Pattern (1-3)', type: 'number', min: 1, max: 3, step: 1, defaultValue: 1 },
    ],
    defaultParams: { rows: 3, tabRatio: 0.28, activeMask: 1 },
    jsSourceCode: `// Sitemap: Settings & Preferences (.jsf)
function getControlPoints(width, height, params, helpers) {
  const tr = helpers.clamp(Number(params.tabRatio) || 0.28, 0.2, 0.42);
  const rows = Math.round(helpers.clamp(Number(params.rows) || 3, 2, 5));
  return [
    { id: 'tabRatio', label: \`Rail: \${Math.round(tr * 100)}%\`, x: width * tr, y: height * 0.5, cursor: 'ew-resize' },
    { id: 'rows', label: \`Rows: \${rows}\`, x: width * 0.65, y: helpers.lerp(height * 0.28, height * 0.85, (rows - 2) / 3), cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'tabRatio') {
    return { ...params, tabRatio: Number(helpers.clamp(localX / Math.max(1, width), 0.2, 0.42).toFixed(2)) };
  }
  if (id === 'rows') {
    const t = helpers.clamp((localY - height * 0.28) / (height * 0.57), 0, 1);
    return { ...params, rows: Math.round(2 + t * 3) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const nextMask = (Math.round(Number(params.activeMask) || 1) % 3) + 1;
  return { ...params, activeMask: nextMask };
}

function buildPaths(width, height, params, helpers) {
  const tr = helpers.clamp(Number(params.tabRatio) || 0.28, 0.2, 0.42) * width;
  const rows = Math.round(helpers.clamp(Number(params.rows) || 3, 2, 5));
  const mask = Math.round(Number(params.activeMask) || 1);
  const pad = Math.max(6, width * 0.055);
  const topH = height * 0.14;
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.polygonPath([{ x: 0, y: topH }, { x: width, y: topH }], false), closed: false },
    { nodes: helpers.polygonPath([{ x: tr, y: topH }, { x: tr, y: height }], false), closed: false }
  ];
  const bodyY = topH + pad;
  const bodyH = height - bodyY - pad;
  const rowH = bodyH / rows;
  const rx = tr + pad;
  const rw = width - tr - pad * 2;
  for (let i = 0; i < rows; i++) {
    const ry = bodyY + i * rowH + rowH * 0.2;
    const h = rowH * 0.6;
    paths.push({ nodes: helpers.rectPath(rx, ry, rw * 0.58, h, 0), closed: true });
    // Pill toggle (rounded pill control)
    const pillW = rw * 0.26;
    const pillX = rx + rw - pillW;
    paths.push({ nodes: helpers.rectPath(pillX, ry, pillW, h, h / 2), closed: true });
    const isOn = (i + mask) % 2 === 0;
    const knobR = h * 0.36;
    const knobX = isOn ? pillX + pillW - h * 0.5 : pillX + h * 0.5;
    paths.push({ nodes: helpers.ellipsePath(knobX, ry + h / 2, knobR, knobR), closed: true });
  }
  return paths;
}`,
  },

  // 11. Sitemap Modal Dialog Overlay Node
  {
    id: 'sitemap-modal-overlay',
    name: 'Sitemap: Modal Dialog Overlay',
    category: 'Web & Layouts',
    description: 'Page wireframe with backdrop frame and centered modal dialog popup with confirm/cancel action buttons.',
    iconName: 'AppWindow',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle modal size preset and button layout',
    paramSchema: [
      { key: 'modalW', label: 'Modal Width Ratio', type: 'number', min: 0.4, max: 0.85, step: 0.01, defaultValue: 0.64 },
      { key: 'modalH', label: 'Modal Height Ratio', type: 'number', min: 0.35, max: 0.78, step: 0.01, defaultValue: 0.54 },
      { key: 'twoButtons', label: 'Dual Action Buttons', type: 'boolean', defaultValue: true },
    ],
    defaultParams: { modalW: 0.64, modalH: 0.54, twoButtons: true },
    jsSourceCode: `// Sitemap: Modal Dialog Overlay (.jsf)
function getControlPoints(width, height, params, helpers) {
  const mw = helpers.clamp(Number(params.modalW) || 0.64, 0.4, 0.85);
  const mh = helpers.clamp(Number(params.modalH) || 0.54, 0.35, 0.78);
  return [
    { id: 'modalW', label: \`Width: \${Math.round(mw * 100)}%\`, x: width * (0.5 + mw / 2), y: height * 0.5, cursor: 'ew-resize' },
    { id: 'modalH', label: \`Height: \${Math.round(mh * 100)}%\`, x: width * 0.5, y: height * (0.5 + mh / 2), cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'modalW') {
    const mw = helpers.clamp(Math.abs(localX - width * 0.5) * 2 / Math.max(1, width), 0.4, 0.85);
    return { ...params, modalW: Number(mw.toFixed(2)) };
  }
  if (id === 'modalH') {
    const mh = helpers.clamp(Math.abs(localY - height * 0.5) * 2 / Math.max(1, height), 0.35, 0.78);
    return { ...params, modalH: Number(mh.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, twoButtons: !params.twoButtons };
}

function buildPaths(width, height, params, helpers) {
  const mw = helpers.clamp(Number(params.modalW) || 0.64, 0.4, 0.85) * width;
  const mh = helpers.clamp(Number(params.modalH) || 0.54, 0.35, 0.78) * height;
  const mx = (width - mw) / 2;
  const my = (height - mh) / 2;
  const twoBtns = params.twoButtons !== false;
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.rectPath(mx, my, mw, mh, 0), closed: true }
  ];
  const headY = my + mh * 0.25;
  paths.push({ nodes: helpers.polygonPath([{ x: mx, y: headY }, { x: mx + mw, y: headY }], false), closed: false });
  const btnY = my + mh * 0.68;
  const btnH = mh * 0.2;
  const btnR = Math.min(12, btnH * 0.5);
  if (twoBtns) {
    paths.push({ nodes: helpers.rectPath(mx + mw * 0.12, btnY, mw * 0.34, btnH, btnR), closed: true });
    paths.push({ nodes: helpers.rectPath(mx + mw * 0.54, btnY, mw * 0.34, btnH, btnR), closed: true });
  } else {
    paths.push({ nodes: helpers.rectPath(mx + mw * 0.2, btnY, mw * 0.6, btnH, btnR), closed: true });
  }
  return paths;
}`,
  },

  // 12. Sitemap Slide-Over Drawer Panel Node
  {
    id: 'sitemap-drawer-panel',
    name: 'Sitemap: Slide-Over Drawer',
    category: 'Web & Layouts',
    description: 'Viewport wireframe with slide-over side sheet / inspection drawer docked Left or Right.',
    iconName: 'PanelRight',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle Left vs Right drawer dock side',
    paramSchema: [
      { key: 'drawerRatio', label: 'Drawer Width Ratio', type: 'number', min: 0.25, max: 0.65, step: 0.01, defaultValue: 0.42 },
      { key: 'dockLeft', label: 'Dock Drawer on Left', type: 'boolean', defaultValue: false },
      { key: 'sections', label: 'Drawer Sections', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { drawerRatio: 0.42, dockLeft: false, sections: 3 },
    jsSourceCode: `// Sitemap: Slide-Over Drawer (.jsf)
function getControlPoints(width, height, params, helpers) {
  const dr = helpers.clamp(Number(params.drawerRatio) || 0.42, 0.25, 0.65);
  const dockLeft = Boolean(params.dockLeft);
  const edgeX = dockLeft ? width * dr : width * (1 - dr);
  return [
    { id: 'drawerRatio', label: \`Drawer: \${Math.round(dr * 100)}%\`, x: edgeX, y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'drawerRatio') {
    const dockLeft = Boolean(params.dockLeft);
    const raw = dockLeft ? localX / Math.max(1, width) : 1 - localX / Math.max(1, width);
    return { ...params, drawerRatio: Number(helpers.clamp(raw, 0.25, 0.65).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, dockLeft: !params.dockLeft };
}

function buildPaths(width, height, params, helpers) {
  const dr = helpers.clamp(Number(params.drawerRatio) || 0.42, 0.25, 0.65) * width;
  const dockLeft = Boolean(params.dockLeft);
  const secs = Math.round(helpers.clamp(Number(params.sections) || 3, 2, 4));
  const dx = dockLeft ? 0 : width - dr;
  const pad = Math.max(5, dr * 0.1);
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.rectPath(dx, 0, dr, height, 0), closed: true }
  ];
  const sh = (height - pad * (secs + 1)) / secs;
  for (let i = 0; i < secs; i++) {
    paths.push({ nodes: helpers.rectPath(dx + pad, pad + i * (sh + pad), dr - pad * 2, sh, 0), closed: true });
  }
  return paths;
}`,
  },

  // 13. Sitemap External Link / 301 Redirect Node
  {
    id: 'sitemap-external-redirect',
    name: 'Sitemap: External / 301 Redirect',
    category: 'Flow & Diagrams',
    description: 'Outbound domain or HTTP 301/302 redirect node with diagonal launch arrow and corner badge.',
    iconName: 'ExternalLink',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle arrow scale and redirect badge style',
    paramSchema: [
      { key: 'arrowScale', label: 'Launch Arrow Scale', type: 'number', min: 0.28, max: 0.65, step: 0.01, defaultValue: 0.46 },
      { key: 'cornerCut', label: 'Corner Notch Ratio', type: 'number', min: 0.1, max: 0.32, step: 0.01, defaultValue: 0.2 },
      { key: 'doubleRing', label: 'Show 301 Status Ring', type: 'boolean', defaultValue: true },
    ],
    defaultParams: { arrowScale: 0.46, cornerCut: 0.2, doubleRing: true },
    jsSourceCode: `// Sitemap: External / 301 Redirect (.jsf)
function getControlPoints(width, height, params, helpers) {
  const sc = helpers.clamp(Number(params.arrowScale) || 0.46, 0.28, 0.65);
  return [
    { id: 'arrowScale', label: \`Arrow: \${Math.round(sc * 100)}%\`, x: width * (0.5 + sc * 0.4), y: height * (0.5 - sc * 0.4), cursor: 'nesw-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'arrowScale') {
    const sc = helpers.clamp((localX / Math.max(1, width) - 0.3) * 1.4, 0.28, 0.65);
    return { ...params, arrowScale: Number(sc.toFixed(2)) };
  }
  if (id === 'cornerCut') {
    const cc = helpers.clamp(1 - localX / Math.max(1, width), 0.1, 0.32);
    return { ...params, cornerCut: Number(cc.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, doubleRing: !params.doubleRing };
}

function buildPaths(width, height, params, helpers) {
  const sc = helpers.clamp(Number(params.arrowScale) || 0.46, 0.28, 0.65);
  const cc = helpers.clamp(Number(params.cornerCut) || 0.2, 0.1, 0.32);
  const doubleRing = params.doubleRing !== false;
  const cx = width / 2;
  const cy = height / 2;
  const cut = Math.min(width, height) * cc;
  const len = Math.min(width, height) * sc * 0.55;
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.polygonPath([{ x: width - cut, y: 0 }, { x: width, y: cut }, { x: width - cut, y: cut }]), closed: true }
  ];
  if (doubleRing) {
    paths.push({ nodes: helpers.rectPath(width * 0.08, height * 0.08, width * 0.84, height * 0.84, 0), closed: true });
  }
  // Diagonal external arrow (bottom-left to top-right)
  const x1 = cx - len;
  const y1 = cy + len;
  const x2 = cx + len;
  const y2 = cy - len;
  const head = len * 0.75;
  paths.push({ nodes: helpers.polygonPath([{ x: x1, y: y1 }, { x: x2, y: y2 }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: x2 - head, y: y2 }, { x: x2, y: y2 }, { x: x2, y: y2 + head }], false), closed: false });
  return paths;
}`,
  },

  // 14. Sitemap 404 / Fallback Error State Node
  {
    id: 'sitemap-error-404',
    name: 'Sitemap: 404 / Fallback Error Node',
    category: 'Web & Layouts',
    description: 'Error boundary or 404 Not Found wireframe node with warning triangle emblem and recovery CTA.',
    iconName: 'AlertTriangle',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle between Warning Triangle and Octagon Stop emblem',
    paramSchema: [
      { key: 'iconRatio', label: 'Alert Emblem Scale', type: 'number', min: 0.24, max: 0.58, step: 0.01, defaultValue: 0.4 },
      { key: 'octagonMode', label: 'Octagon 500 Error Mode', type: 'boolean', defaultValue: false },
    ],
    defaultParams: { iconRatio: 0.4, octagonMode: false },
    jsSourceCode: `// Sitemap: 404 / Fallback Error Node (.jsf)
function getControlPoints(width, height, params, helpers) {
  const ir = helpers.clamp(Number(params.iconRatio) || 0.4, 0.24, 0.58);
  return [
    { id: 'iconRatio', label: \`Emblem: \${Math.round(ir * 100)}%\`, x: width * 0.5, y: height * (0.45 - ir * 0.4), cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'iconRatio') {
    const ir = helpers.clamp((0.55 - localY / Math.max(1, height)) * 1.6, 0.24, 0.58);
    return { ...params, iconRatio: Number(ir.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, octagonMode: !params.octagonMode };
}

function buildPaths(width, height, params, helpers) {
  const ir = helpers.clamp(Number(params.iconRatio) || 0.4, 0.24, 0.58);
  const oct = Boolean(params.octagonMode);
  const cx = width / 2;
  const cy = height * 0.44;
  const r = Math.min(width, height) * ir * 0.55;
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.polygonPath([{ x: 0, y: height * 0.14 }, { x: width, y: height * 0.14 }], false), closed: false }
  ];
  if (oct) {
    const pts = [];
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + Math.PI / 8;
      pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
    }
    paths.push({ nodes: helpers.polygonPath(pts), closed: true });
  } else {
    paths.push({
      nodes: helpers.polygonPath([
        { x: cx, y: cy - r },
        { x: cx + r, y: cy + r * 0.85 },
        { x: cx - r, y: cy + r * 0.85 }
      ]),
      closed: true
    });
  }
  // Exclamation bar + dot + recovery button (pill rounded)
  const btnH = height * 0.13;
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: cy - r * 0.35 }, { x: cx, y: cy + r * 0.25 }], false), closed: false });
  paths.push({ nodes: helpers.ellipsePath(cx, cy + r * 0.52, Math.max(2, r * 0.1), Math.max(2, r * 0.1)), closed: true });
  paths.push({ nodes: helpers.rectPath(width * 0.26, height * 0.76, width * 0.48, btnH, Math.min(12, btnH * 0.5)), closed: true });
  return paths;
}`,
  },

  // 15. Sitemap A/B Split Variant Page Node
  {
    id: 'sitemap-ab-split-test',
    name: 'Sitemap: A/B Split Variant Node',
    category: 'Flow & Diagrams',
    description: 'Experimentation split node displaying Variant A vs Variant B page panes and traffic allocation divider.',
    iconName: 'Split',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle traffic split (50/50, 70/30, 30/70)',
    paramSchema: [
      { key: 'splitRatio', label: 'Traffic Split A vs B', type: 'number', min: 0.2, max: 0.8, step: 0.05, defaultValue: 0.5 },
      { key: 'headerH', label: 'Experiment Header Ratio', type: 'number', min: 0.14, max: 0.32, step: 0.01, defaultValue: 0.2 },
    ],
    defaultParams: { splitRatio: 0.5, headerH: 0.2 },
    jsSourceCode: `// Sitemap: A/B Split Variant Node (.jsf)
function getControlPoints(width, height, params, helpers) {
  const sp = helpers.clamp(Number(params.splitRatio) || 0.5, 0.2, 0.8);
  return [
    { id: 'splitRatio', label: \`A/B: \${Math.round(sp * 100)}/\${Math.round((1 - sp) * 100)}\`, x: width * sp, y: height * 0.6, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'splitRatio') {
    return { ...params, splitRatio: Number(helpers.clamp(localX / Math.max(1, width), 0.2, 0.8).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Number(params.splitRatio) || 0.5;
  const next = Math.abs(cur - 0.5) < 0.05 ? 0.7 : cur > 0.55 ? 0.3 : 0.5;
  return { ...params, splitRatio: next };
}

function buildPaths(width, height, params, helpers) {
  const sp = helpers.clamp(Number(params.splitRatio) || 0.5, 0.2, 0.8);
  const hh = helpers.clamp(Number(params.headerH) || 0.2, 0.14, 0.32) * height;
  const pad = Math.max(6, width * 0.055);
  const midX = width * sp;
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.polygonPath([{ x: 0, y: hh }, { x: width, y: hh }], false), closed: false },
    { nodes: helpers.polygonPath([{ x: midX, y: hh }, { x: midX, y: height }], false), closed: false }
  ];
  const paneY = hh + pad;
  const paneH = height - hh - pad * 2;
  paths.push({ nodes: helpers.rectPath(pad, paneY, Math.max(8, midX - pad * 1.6), paneH, 0), closed: true });
  paths.push({ nodes: helpers.rectPath(midX + pad * 0.6, paneY, Math.max(8, width - midX - pad * 1.6), paneH, 0), closed: true });
  return paths;
}`,
  },

  // 16. Sitemap Multi-Page Template Stack
  {
    id: 'sitemap-page-stack',
    name: 'Sitemap: Multi-Page Stack',
    category: 'Web & Layouts',
    description: 'Layered stack of pages representing paginated archives, localized versions, or content series.',
    iconName: 'Layers',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle stack depth (2, 3, or 4 sheets)',
    paramSchema: [
      { key: 'sheets', label: 'Stacked Sheets', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
      { key: 'spread', label: 'Cascade Spread (px)', type: 'number', min: 5, max: 18, step: 1, defaultValue: 9 },
    ],
    defaultParams: { sheets: 3, spread: 9 },
    jsSourceCode: `// Sitemap: Multi-Page Stack (.jsf)
function getControlPoints(width, height, params, helpers) {
  const sheets = Math.round(helpers.clamp(Number(params.sheets) || 3, 2, 4));
  const sp = helpers.clamp(Number(params.spread) || 9, 5, 18);
  return [
    { id: 'spread', label: \`Spread: \${Math.round(sp)}px\`, x: width - sp, y: sp, cursor: 'nwse-resize' },
    { id: 'sheets', label: \`Sheets: \${sheets}\`, x: helpers.lerp(width * 0.25, width * 0.75, (sheets - 2) / 2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'spread') {
    return { ...params, spread: Math.round(helpers.clamp(localY, 5, 18)) };
  }
  if (id === 'sheets') {
    const t = helpers.clamp((localX - width * 0.25) / (width * 0.5), 0, 1);
    return { ...params, sheets: Math.round(2 + t * 2) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = ((Math.round(Number(params.sheets) || 3) - 1) % 3) + 2;
  return { ...params, sheets: next };
}

function buildPaths(width, height, params, helpers) {
  const sheets = Math.round(helpers.clamp(Number(params.sheets) || 3, 2, 4));
  const sp = helpers.clamp(Number(params.spread) || 9, 5, 18);
  const total = sp * (sheets - 1);
  const cw = Math.max(24, width - total);
  const ch = Math.max(24, height - total);
  const paths = [];
  for (let i = sheets - 1; i >= 0; i--) {
    paths.push({ nodes: helpers.rectPath(i * sp, (sheets - 1 - i) * sp, cw, ch, 0), closed: true });
  }
  const fy = (sheets - 1) * sp;
  const pad = cw * 0.08;
  paths.push({ nodes: helpers.rectPath(pad, fy + ch * 0.16, cw - pad * 2, ch * 0.26, 0), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, fy + ch * 0.5, cw - pad * 2, ch * 0.36, 0), closed: true });
  return paths;
}`,
  },

  // 17. Sitemap Blog & Editorial Feed Page
  {
    id: 'sitemap-blog-index',
    name: 'Sitemap: Blog & Editorial Feed',
    category: 'Web & Layouts',
    description: 'Editorial feed wireframe with featured hero article and chronological story list rows.',
    iconName: 'Newspaper',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle article feed rows (2-5)',
    paramSchema: [
      { key: 'featuredRatio', label: 'Featured Story Height', type: 'number', min: 0.2, max: 0.48, step: 0.01, defaultValue: 0.3 },
      { key: 'articles', label: 'Feed Article Rows', type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { featuredRatio: 0.3, articles: 3 },
    jsSourceCode: `// Sitemap: Blog & Editorial Feed (.jsf)
function getControlPoints(width, height, params, helpers) {
  const fr = helpers.clamp(Number(params.featuredRatio) || 0.3, 0.2, 0.48);
  const arts = Math.round(helpers.clamp(Number(params.articles) || 3, 2, 5));
  return [
    { id: 'featuredRatio', label: \`Featured: \${Math.round(fr * 100)}%\`, x: width * 0.5, y: height * (0.14 + fr), cursor: 'ns-resize' },
    { id: 'articles', label: \`Posts: \${arts}\`, x: helpers.lerp(width * 0.25, width * 0.75, (arts - 2) / 3), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'featuredRatio') {
    const fr = helpers.clamp(localY / Math.max(1, height) - 0.14, 0.2, 0.48);
    return { ...params, featuredRatio: Number(fr.toFixed(2)) };
  }
  if (id === 'articles') {
    const t = helpers.clamp((localX - width * 0.25) / (width * 0.5), 0, 1);
    return { ...params, articles: Math.round(2 + t * 3) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = ((Math.round(Number(params.articles) || 3) - 1) % 4) + 2;
  return { ...params, articles: next };
}

function buildPaths(width, height, params, helpers) {
  const fr = helpers.clamp(Number(params.featuredRatio) || 0.3, 0.2, 0.48);
  const arts = Math.round(helpers.clamp(Number(params.articles) || 3, 2, 5));
  const pad = Math.max(6, width * 0.06);
  const topH = height * 0.12;
  const featH = height * fr;
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.polygonPath([{ x: 0, y: topH }, { x: width, y: topH }], false), closed: false },
    { nodes: helpers.rectPath(pad, topH + pad * 0.7, width - pad * 2, featH, 0), closed: true }
  ];
  const feedY = topH + pad * 1.4 + featH;
  const feedH = Math.max(16, height - feedY - pad);
  const gap = pad * 0.45;
  const rh = (feedH - gap * (arts - 1)) / arts;
  for (let i = 0; i < arts; i++) {
    const ry = feedY + i * (rh + gap);
    const thumbW = (width - pad * 2) * 0.26;
    paths.push({ nodes: helpers.rectPath(pad, ry, thumbW, rh, 0), closed: true });
    paths.push({ nodes: helpers.rectPath(pad + thumbW + gap, ry, width - pad * 2 - thumbW - gap, rh, 0), closed: true });
  }
  return paths;
}`,
  },

  // 18. Sitemap Documentation / Knowledge Base Wiki
  {
    id: 'sitemap-docs-wiki',
    name: 'Sitemap: Docs & Knowledge Wiki',
    category: 'Web & Layouts',
    description: '3-column developer documentation wireframe with left sidebar tree, central prose, and right TOC rail.',
    iconName: 'BookOpen',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle Right Table-of-Contents (TOC) rail',
    paramSchema: [
      { key: 'leftTreeRatio', label: 'Left Sidebar Ratio', type: 'number', min: 0.15, max: 0.34, step: 0.01, defaultValue: 0.22 },
      { key: 'showRightToc', label: 'Show Right TOC Rail', type: 'boolean', defaultValue: true },
    ],
    defaultParams: { leftTreeRatio: 0.22, showRightToc: true },
    jsSourceCode: `// Sitemap: Docs & Knowledge Wiki (.jsf)
function getControlPoints(width, height, params, helpers) {
  const lt = helpers.clamp(Number(params.leftTreeRatio) || 0.22, 0.15, 0.34);
  return [
    { id: 'leftTreeRatio', label: \`Tree: \${Math.round(lt * 100)}%\`, x: width * lt, y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'leftTreeRatio') {
    return { ...params, leftTreeRatio: Number(helpers.clamp(localX / Math.max(1, width), 0.15, 0.34).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, showRightToc: !params.showRightToc };
}

function buildPaths(width, height, params, helpers) {
  const lt = helpers.clamp(Number(params.leftTreeRatio) || 0.22, 0.15, 0.34) * width;
  const showToc = params.showRightToc !== false;
  const rt = showToc ? width * 0.18 : 0;
  const topH = height * 0.13;
  const pad = Math.max(5, width * 0.045);
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.polygonPath([{ x: 0, y: topH }, { x: width, y: topH }], false), closed: false },
    { nodes: helpers.polygonPath([{ x: lt, y: topH }, { x: lt, y: height }], false), closed: false }
  ];
  if (showToc) {
    paths.push({ nodes: helpers.polygonPath([{ x: width - rt, y: topH }, { x: width - rt, y: height }], false), closed: false });
  }
  const mainX = lt + pad;
  const mainW = width - lt - rt - pad * 2;
  const bodyY = topH + pad;
  const bodyH = height - bodyY - pad;
  paths.push({ nodes: helpers.rectPath(mainX, bodyY, mainW, bodyH * 0.25, 0), closed: true });
  paths.push({ nodes: helpers.rectPath(mainX, bodyY + bodyH * 0.33, mainW, bodyH * 0.32, 0), closed: true });
  paths.push({ nodes: helpers.rectPath(mainX, bodyY + bodyH * 0.72, mainW, bodyH * 0.26, 0), closed: true });
  return paths;
}`,
  },

  // 19. Sitemap Pricing Tiers & Plan Matrix Page
  {
    id: 'sitemap-pricing-page',
    name: 'Sitemap: Pricing Tiers Page',
    category: 'Web & Layouts',
    description: 'Pricing comparison wireframe with 2-4 tier columns and an elevated featured "Most Popular" plan.',
    iconName: 'DollarSign',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle the highlighted featured pricing tier',
    paramSchema: [
      { key: 'tiers', label: 'Pricing Tiers', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
      { key: 'featuredTier', label: 'Highlighted Tier Index', type: 'number', min: 1, max: 4, step: 1, defaultValue: 2 },
    ],
    defaultParams: { tiers: 3, featuredTier: 2 },
    jsSourceCode: `// Sitemap: Pricing Tiers Page (.jsf)
function getControlPoints(width, height, params, helpers) {
  const tiers = Math.round(helpers.clamp(Number(params.tiers) || 3, 2, 4));
  return [
    { id: 'tiers', label: \`Tiers: \${tiers}\`, x: helpers.lerp(width * 0.25, width * 0.75, (tiers - 2) / 2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'tiers') {
    const t = helpers.clamp((localX - width * 0.25) / (width * 0.5), 0, 1);
    return { ...params, tiers: Math.round(2 + t * 2) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params, helpers) {
  const tiers = Math.round(helpers.clamp(Number(params.tiers) || 3, 2, 4));
  const cur = Math.round(Number(params.featuredTier) || 2);
  return { ...params, featuredTier: (cur % tiers) + 1 };
}

function buildPaths(width, height, params, helpers) {
  const tiers = Math.round(helpers.clamp(Number(params.tiers) || 3, 2, 4));
  const feat = helpers.clamp(Math.round(Number(params.featuredTier) || 2), 1, tiers);
  const pad = Math.max(6, width * 0.055);
  const topH = height * 0.16;
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.polygonPath([{ x: 0, y: topH }, { x: width, y: topH }], false), closed: false }
  ];
  const gap = pad * 0.55;
  const tw = (width - pad * 2 - gap * (tiers - 1)) / tiers;
  for (let i = 0; i < tiers; i++) {
    const isFeat = i + 1 === feat;
    const ty = isFeat ? topH + pad * 0.5 : topH + pad * 1.3;
    const th = isFeat ? height - ty - pad * 0.7 : height - ty - pad * 1.2;
    const tx = pad + i * (tw + gap);
    const btnH = th * 0.16;
    paths.push({ nodes: helpers.rectPath(tx, ty, tw, th, 0), closed: true });
    paths.push({ nodes: helpers.rectPath(tx + tw * 0.15, ty + th * 0.72, tw * 0.7, btnH, Math.min(12, btnH * 0.5)), closed: true });
  }
  return paths;
}`,
  },

  // 20. Sitemap Contact Form & Support Ticket Page
  {
    id: 'sitemap-contact-support',
    name: 'Sitemap: Contact & Support Form',
    category: 'Web & Layouts',
    description: 'Customer inquiry wireframe with input field stack, message textarea, and support info sidebar.',
    iconName: 'Mail',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle form input field count (2-5)',
    paramSchema: [
      { key: 'fields', label: 'Form Input Fields', type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
      { key: 'formRatio', label: 'Form Width Ratio', type: 'number', min: 0.45, max: 0.78, step: 0.01, defaultValue: 0.62 },
    ],
    defaultParams: { fields: 3, formRatio: 0.62 },
    jsSourceCode: `// Sitemap: Contact & Support Form (.jsf)
function getControlPoints(width, height, params, helpers) {
  const fr = helpers.clamp(Number(params.formRatio) || 0.62, 0.45, 0.78);
  const fields = Math.round(helpers.clamp(Number(params.fields) || 3, 2, 5));
  return [
    { id: 'formRatio', label: \`Form: \${Math.round(fr * 100)}%\`, x: width * fr, y: height * 0.5, cursor: 'ew-resize' },
    { id: 'fields', label: \`Fields: \${fields}\`, x: width * 0.3, y: helpers.lerp(height * 0.25, height * 0.85, (fields - 2) / 3), cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'formRatio') {
    return { ...params, formRatio: Number(helpers.clamp(localX / Math.max(1, width), 0.45, 0.78).toFixed(2)) };
  }
  if (id === 'fields') {
    const t = helpers.clamp((localY - height * 0.25) / (height * 0.6), 0, 1);
    return { ...params, fields: Math.round(2 + t * 3) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = ((Math.round(Number(params.fields) || 3) - 1) % 4) + 2;
  return { ...params, fields: next };
}

function buildPaths(width, height, params, helpers) {
  const fr = helpers.clamp(Number(params.formRatio) || 0.62, 0.45, 0.78);
  const fields = Math.round(helpers.clamp(Number(params.fields) || 3, 2, 5));
  const pad = Math.max(6, width * 0.055);
  const topH = height * 0.13;
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.polygonPath([{ x: 0, y: topH }, { x: width, y: topH }], false), closed: false }
  ];
  const bodyY = topH + pad;
  const bodyH = height - bodyY - pad;
  const formW = (width - pad * 3) * fr;
  const sideW = width - pad * 3 - formW;
  const gap = pad * 0.45;
  const fh = (bodyH - gap * (fields - 1)) / fields;
  for (let i = 0; i < fields; i++) {
    paths.push({ nodes: helpers.rectPath(pad, bodyY + i * (fh + gap), formW, fh, 0), closed: true });
  }
  paths.push({ nodes: helpers.rectPath(pad * 2 + formW, bodyY, sideW, bodyH, 0), closed: true });
  return paths;
}`,
  },

  // 21. Sitemap Search Results & Faceted Filter Page
  {
    id: 'sitemap-search-results',
    name: 'Sitemap: Search Results & Facets',
    category: 'Web & Layouts',
    description: 'Search engine results page (SERP) wireframe with prominent search input, facet sidebar, and result snippets.',
    iconName: 'Search',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle facet sidebar and cycle result count',
    paramSchema: [
      { key: 'results', label: 'Result Rows', type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
      { key: 'facetRatio', label: 'Facet Sidebar Width', type: 'number', min: 0.18, max: 0.38, step: 0.01, defaultValue: 0.26 },
      { key: 'showFacets', label: 'Show Facet Sidebar', type: 'boolean', defaultValue: true },
    ],
    defaultParams: { results: 3, facetRatio: 0.26, showFacets: true },
    jsSourceCode: `// Sitemap: Search Results & Facets (.jsf)
function getControlPoints(width, height, params, helpers) {
  const fr = helpers.clamp(Number(params.facetRatio) || 0.26, 0.18, 0.38);
  const res = Math.round(helpers.clamp(Number(params.results) || 3, 2, 5));
  return [
    { id: 'facetRatio', label: \`Facets: \${Math.round(fr * 100)}%\`, x: width * fr, y: height * 0.58, cursor: 'ew-resize' },
    { id: 'results', label: \`Hits: \${res}\`, x: helpers.lerp(width * 0.35, width * 0.85, (res - 2) / 3), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'facetRatio') {
    return { ...params, facetRatio: Number(helpers.clamp(localX / Math.max(1, width), 0.18, 0.38).toFixed(2)) };
  }
  if (id === 'results') {
    const t = helpers.clamp((localX - width * 0.35) / (width * 0.5), 0, 1);
    return { ...params, results: Math.round(2 + t * 3) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const nextRes = ((Math.round(Number(params.results) || 3) - 1) % 4) + 2;
  return { ...params, showFacets: !params.showFacets, results: nextRes };
}

function buildPaths(width, height, params, helpers) {
  const res = Math.round(helpers.clamp(Number(params.results) || 3, 2, 5));
  const fr = helpers.clamp(Number(params.facetRatio) || 0.26, 0.18, 0.38);
  const showFacets = params.showFacets !== false;
  const pad = Math.max(6, width * 0.055);
  const searchH = height * 0.15;
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.rectPath(pad, pad, width - pad * 2, searchH, searchH / 2), closed: true }
  ];
  const bodyY = pad * 1.8 + searchH;
  const bodyH = height - bodyY - pad;
  const facetW = showFacets ? (width - pad * 3) * fr : 0;
  if (showFacets) {
    paths.push({ nodes: helpers.rectPath(pad, bodyY, facetW, bodyH, 0), closed: true });
  }
  const rx = showFacets ? pad * 2 + facetW : pad;
  const rw = showFacets ? width - pad * 3 - facetW : width - pad * 2;
  const gap = pad * 0.45;
  const rh = (bodyH - gap * (res - 1)) / res;
  for (let i = 0; i < res; i++) {
    paths.push({ nodes: helpers.rectPath(rx, bodyY + i * (rh + gap), rw, rh, 0), closed: true });
  }
  return paths;
}`,
  },

  // 22. Sitemap User Profile & Activity Feed Page
  {
    id: 'sitemap-user-profile',
    name: 'Sitemap: User Profile Page',
    category: 'Web & Layouts',
    description: 'Social or account profile wireframe with cover banner, overlapping avatar circle, and activity tabs.',
    iconName: 'UserCircle',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle avatar alignment (Left vs Center)',
    paramSchema: [
      { key: 'bannerRatio', label: 'Cover Banner Height', type: 'number', min: 0.18, max: 0.42, step: 0.01, defaultValue: 0.28 },
      { key: 'avatarSize', label: 'Avatar Radius Ratio', type: 'number', min: 0.08, max: 0.18, step: 0.01, defaultValue: 0.12 },
      { key: 'centerAvatar', label: 'Centered Profile Header', type: 'boolean', defaultValue: false },
    ],
    defaultParams: { bannerRatio: 0.28, avatarSize: 0.12, centerAvatar: false },
    jsSourceCode: `// Sitemap: User Profile Page (.jsf)
function getControlPoints(width, height, params, helpers) {
  const br = helpers.clamp(Number(params.bannerRatio) || 0.28, 0.18, 0.42);
  return [
    { id: 'bannerRatio', label: \`Cover: \${Math.round(br * 100)}%\`, x: width * 0.5, y: height * br, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'bannerRatio') {
    return { ...params, bannerRatio: Number(helpers.clamp(localY / Math.max(1, height), 0.18, 0.42).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, centerAvatar: !params.centerAvatar };
}

function buildPaths(width, height, params, helpers) {
  const br = helpers.clamp(Number(params.bannerRatio) || 0.28, 0.18, 0.42) * height;
  const ar = helpers.clamp(Number(params.avatarSize) || 0.12, 0.08, 0.18) * Math.min(width, height);
  const center = Boolean(params.centerAvatar);
  const pad = Math.max(6, width * 0.06);
  const avX = center ? width / 2 : pad + ar * 1.2;
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.polygonPath([{ x: 0, y: br }, { x: width, y: br }], false), closed: false },
    { nodes: helpers.ellipsePath(avX, br, ar, ar), closed: true }
  ];
  const feedY = br + ar + pad;
  const feedH = Math.max(12, height - feedY - pad);
  paths.push({ nodes: helpers.rectPath(pad, feedY, width - pad * 2, feedH * 0.44, 0), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, feedY + feedH * 0.54, width - pad * 2, feedH * 0.44, 0), closed: true });
  return paths;
}`,
  },

  // 23. Sitemap Onboarding Wizard Step Card
  {
    id: 'sitemap-onboarding-step',
    name: 'Sitemap: Onboarding Wizard Step',
    category: 'Web & Layouts',
    description: 'Guided user onboarding step card with progress bar, central illustration frame, and Next/Skip footer.',
    iconName: 'Sparkles',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to advance onboarding progress (25%, 50%, 75%, 100%)',
    paramSchema: [
      { key: 'progress', label: 'Step Progress Ratio', type: 'number', min: 0.15, max: 1, step: 0.05, defaultValue: 0.5 },
      { key: 'cardInset', label: 'Wizard Card Inset', type: 'number', min: 0.08, max: 0.24, step: 0.01, defaultValue: 0.14 },
    ],
    defaultParams: { progress: 0.5, cardInset: 0.14 },
    jsSourceCode: `// Sitemap: Onboarding Wizard Step (.jsf)
function getControlPoints(width, height, params, helpers) {
  const prog = helpers.clamp(Number(params.progress) || 0.5, 0.15, 1);
  const inset = helpers.clamp(Number(params.cardInset) || 0.14, 0.08, 0.24);
  return [
    { id: 'progress', label: \`Step: \${Math.round(prog * 100)}%\`, x: helpers.lerp(width * inset, width * (1 - inset), prog), y: height * 0.22, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'progress') {
    const inset = helpers.clamp(Number(params.cardInset) || 0.14, 0.08, 0.24);
    const t = (localX - width * inset) / Math.max(1, width * (1 - inset * 2));
    return { ...params, progress: Number(helpers.clamp(t, 0.15, 1).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Number(params.progress) || 0.5;
  const next = cur >= 0.95 ? 0.25 : Number((cur + 0.25).toFixed(2));
  return { ...params, progress: Math.min(1, next) };
}

function buildPaths(width, height, params, helpers) {
  const prog = helpers.clamp(Number(params.progress) || 0.5, 0.15, 1);
  const inset = helpers.clamp(Number(params.cardInset) || 0.14, 0.08, 0.24);
  const cx = width * inset;
  const cy = height * inset;
  const cw = width * (1 - inset * 2);
  const ch = height * (1 - inset * 2);
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.rectPath(cx, cy, cw, ch, 0), closed: true },
    { nodes: helpers.rectPath(cx + cw * 0.1, cy + ch * 0.1, cw * 0.8 * prog, ch * 0.08, 0), closed: true },
    { nodes: helpers.rectPath(cx + cw * 0.1, cy + ch * 0.26, cw * 0.8, ch * 0.44, 0), closed: true },
    { nodes: helpers.rectPath(cx + cw * 0.55, cy + ch * 0.78, cw * 0.35, ch * 0.14, Math.min(10, (ch * 0.14) * 0.5)), closed: true }
  ];
  return paths;
}`,
  },

  // 24. Sitemap Legal / Privacy / Terms Document Node
  {
    id: 'sitemap-legal-policy',
    name: 'Sitemap: Legal & Privacy Policy',
    category: 'Web & Layouts',
    description: 'Compliance document node with folded page corner and clause paragraph blocks.',
    iconName: 'FileText',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle document clause paragraphs (3-6)',
    paramSchema: [
      { key: 'foldRatio', label: 'Corner Fold Ratio', type: 'number', min: 0.12, max: 0.32, step: 0.01, defaultValue: 0.2 },
      { key: 'clauses', label: 'Clause Blocks', type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { foldRatio: 0.2, clauses: 4 },
    jsSourceCode: `// Sitemap: Legal & Privacy Policy (.jsf)
function getControlPoints(width, height, params, helpers) {
  const fold = helpers.clamp(Number(params.foldRatio) || 0.2, 0.12, 0.32);
  return [
    { id: 'foldRatio', label: \`Fold: \${Math.round(fold * 100)}%\`, x: width * (1 - fold), y: height * fold, cursor: 'nesw-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'foldRatio') {
    const f = helpers.clamp(1 - localX / Math.max(1, width), 0.12, 0.32);
    return { ...params, foldRatio: Number(f.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = ((Math.round(Number(params.clauses) || 4) - 2) % 4) + 3;
  return { ...params, clauses: next };
}

function buildPaths(width, height, params, helpers) {
  const fold = helpers.clamp(Number(params.foldRatio) || 0.2, 0.12, 0.32);
  const clauses = Math.round(helpers.clamp(Number(params.clauses) || 4, 3, 6));
  const fx = width * (1 - fold);
  const fy = height * fold;
  const paths = [
    {
      nodes: helpers.polygonPath([
        { x: 0, y: 0 },
        { x: fx, y: 0 },
        { x: width, y: fy },
        { x: width, y: height },
        { x: 0, y: height }
      ]),
      closed: true
    },
    {
      nodes: helpers.polygonPath([
        { x: fx, y: 0 },
        { x: fx, y: fy },
        { x: width, y: fy }
      ]),
      closed: true
    }
  ];
  const pad = width * 0.12;
  const startY = fy + height * 0.08;
  const availH = height - startY - pad;
  const gap = availH * 0.1;
  const ch = (availH - gap * (clauses - 1)) / clauses;
  for (let i = 0; i < clauses; i++) {
    paths.push({ nodes: helpers.rectPath(pad, startY + i * (ch + gap), width - pad * 2, ch, 0), closed: true });
  }
  return paths;
}`,
  },

  // 25. Sitemap Mobile App Viewport Sitemap Node
  {
    id: 'sitemap-mobile-screen',
    name: 'Sitemap: Mobile Screen Node',
    category: 'Web & Layouts',
    description: 'Mobile app viewport node with top dynamic island notch, scrollable card stack, and bottom tab bar.',
    iconName: 'Smartphone',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle mobile screen content layout',
    paramSchema: [
      { key: 'notchWidth', label: 'Top Notch Width Ratio', type: 'number', min: 0.2, max: 0.55, step: 0.01, defaultValue: 0.34 },
      { key: 'cards', label: 'Feed Cards', type: 'number', min: 1, max: 4, step: 1, defaultValue: 2 },
    ],
    defaultParams: { notchWidth: 0.34, cards: 2 },
    jsSourceCode: `// Sitemap: Mobile Screen Node (.jsf)
function getControlPoints(width, height, params, helpers) {
  const nw = helpers.clamp(Number(params.notchWidth) || 0.34, 0.2, 0.55);
  const cards = Math.round(helpers.clamp(Number(params.cards) || 2, 1, 4));
  return [
    { id: 'notchWidth', label: \`Notch: \${Math.round(nw * 100)}%\`, x: width * (0.5 + nw / 2), y: height * 0.08, cursor: 'ew-resize' },
    { id: 'cards', label: \`Cards: \${cards}\`, x: width * 0.5, y: helpers.lerp(height * 0.35, height * 0.78, (cards - 1) / 3), cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'notchWidth') {
    const nw = helpers.clamp(Math.abs(localX - width * 0.5) * 2 / Math.max(1, width), 0.2, 0.55);
    return { ...params, notchWidth: Number(nw.toFixed(2)) };
  }
  if (id === 'cards') {
    const t = helpers.clamp((localY - height * 0.35) / (height * 0.43), 0, 1);
    return { ...params, cards: Math.round(1 + t * 3) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = (Math.round(Number(params.cards) || 2) % 4) + 1;
  return { ...params, cards: next };
}

function buildPaths(width, height, params, helpers) {
  const nw = helpers.clamp(Number(params.notchWidth) || 0.34, 0.2, 0.55) * width;
  const cards = Math.round(helpers.clamp(Number(params.cards) || 2, 1, 4));
  const r = Math.min(16, width * 0.14);
  const pad = Math.max(6, width * 0.08);
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, r), closed: true },
    { nodes: helpers.rectPath((width - nw) / 2, height * 0.05, nw, height * 0.05, 4), closed: true }
  ];
  const bodyY = height * 0.14;
  const bodyH = height * 0.7;
  const gap = pad * 0.5;
  const ch = (bodyH - gap * (cards - 1)) / cards;
  for (let i = 0; i < cards; i++) {
    paths.push({ nodes: helpers.rectPath(pad, bodyY + i * (ch + gap), width - pad * 2, ch, 0), closed: true });
  }
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: height * 0.88 }, { x: width, y: height * 0.88 }], false), closed: false });
  return paths;
}`,
  },

  // 26. Sitemap Tablet Split-View Sitemap Node
  {
    id: 'sitemap-tablet-view',
    name: 'Sitemap: Tablet Split-View Node',
    category: 'Web & Layouts',
    description: 'Tablet master-detail split-view wireframe with left list pane and right detail canvas.',
    iconName: 'Tablet',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle master list item count and split ratio',
    paramSchema: [
      { key: 'masterRatio', label: 'Master Pane Width', type: 'number', min: 0.24, max: 0.5, step: 0.01, defaultValue: 0.34 },
      { key: 'items', label: 'Master List Rows', type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { masterRatio: 0.34, items: 3 },
    jsSourceCode: `// Sitemap: Tablet Split-View Node (.jsf)
function getControlPoints(width, height, params, helpers) {
  const mr = helpers.clamp(Number(params.masterRatio) || 0.34, 0.24, 0.5);
  return [
    { id: 'masterRatio', label: \`Master: \${Math.round(mr * 100)}%\`, x: width * mr, y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'masterRatio') {
    return { ...params, masterRatio: Number(helpers.clamp(localX / Math.max(1, width), 0.24, 0.5).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = ((Math.round(Number(params.items) || 3) - 1) % 4) + 2;
  return { ...params, items: next };
}

function buildPaths(width, height, params, helpers) {
  const mr = helpers.clamp(Number(params.masterRatio) || 0.34, 0.24, 0.5) * width;
  const items = Math.round(helpers.clamp(Number(params.items) || 3, 2, 5));
  const pad = Math.max(6, width * 0.05);
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.polygonPath([{ x: mr, y: 0 }, { x: mr, y: height }], false), closed: false }
  ];
  const gap = pad * 0.45;
  const rh = (height - pad * 2 - gap * (items - 1)) / items;
  for (let i = 0; i < items; i++) {
    paths.push({ nodes: helpers.rectPath(pad, pad + i * (rh + gap), mr - pad * 1.6, rh, 0), closed: true });
  }
  paths.push({ nodes: helpers.rectPath(mr + pad * 0.8, pad, width - mr - pad * 1.8, height - pad * 2, 0), closed: true });
  return paths;
}`,
  },

  // 27. Sitemap Global Header & Footer IA Map
  {
    id: 'sitemap-header-footer-map',
    name: 'Sitemap: Header & Footer IA Map',
    category: 'Web & Layouts',
    description: 'Global navigation & footer link column architecture card for mapping sitewide links.',
    iconName: 'PanelTopBottom',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle footer sitemap column count (2-5)',
    paramSchema: [
      { key: 'footerRatio', label: 'Footer Zone Height', type: 'number', min: 0.28, max: 0.62, step: 0.01, defaultValue: 0.44 },
      { key: 'footerCols', label: 'Footer Link Columns', type: 'number', min: 2, max: 5, step: 1, defaultValue: 4 },
    ],
    defaultParams: { footerRatio: 0.44, footerCols: 4 },
    jsSourceCode: `// Sitemap: Header & Footer IA Map (.jsf)
function getControlPoints(width, height, params, helpers) {
  const fr = helpers.clamp(Number(params.footerRatio) || 0.44, 0.28, 0.62);
  const cols = Math.round(helpers.clamp(Number(params.footerCols) || 4, 2, 5));
  return [
    { id: 'footerRatio', label: \`Footer: \${Math.round(fr * 100)}%\`, x: width * 0.5, y: height * (1 - fr), cursor: 'ns-resize' },
    { id: 'footerCols', label: \`Cols: \${cols}\`, x: helpers.lerp(width * 0.25, width * 0.75, (cols - 2) / 3), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'footerRatio') {
    return { ...params, footerRatio: Number(helpers.clamp(1 - localY / Math.max(1, height), 0.28, 0.62).toFixed(2)) };
  }
  if (id === 'footerCols') {
    const t = helpers.clamp((localX - width * 0.25) / (width * 0.5), 0, 1);
    return { ...params, footerCols: Math.round(2 + t * 3) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = ((Math.round(Number(params.footerCols) || 4) - 1) % 4) + 2;
  return { ...params, footerCols: next };
}

function buildPaths(width, height, params, helpers) {
  const fr = helpers.clamp(Number(params.footerRatio) || 0.44, 0.28, 0.62);
  const cols = Math.round(helpers.clamp(Number(params.footerCols) || 4, 2, 5));
  const pad = Math.max(6, width * 0.055);
  const headH = height * 0.18;
  const footY = height * (1 - fr);
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.polygonPath([{ x: 0, y: headH }, { x: width, y: headH }], false), closed: false },
    { nodes: helpers.polygonPath([{ x: 0, y: footY }, { x: width, y: footY }], false), closed: false }
  ];
  const gap = pad * 0.5;
  const cw = (width - pad * 2 - gap * (cols - 1)) / cols;
  const ch = height - footY - pad * 1.5;
  for (let i = 0; i < cols; i++) {
    paths.push({ nodes: helpers.rectPath(pad + i * (cw + gap), footY + pad * 0.75, cw, ch, 0), closed: true });
  }
  return paths;
}`,
  },

  // 28. Sitemap Hierarchical IA Tree Branch Node
  {
    id: 'sitemap-navigation-tree',
    name: 'Sitemap: IA Tree Branch Group',
    category: 'Flow & Diagrams',
    description: 'Self-contained hierarchical parent-to-children org/sitemap tree block with orthogonal branch lines.',
    iconName: 'GitFork',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle child branch node count (2-5)',
    paramSchema: [
      { key: 'children', label: 'Child Branch Nodes', type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
      { key: 'parentRatio', label: 'Parent Card Height', type: 'number', min: 0.2, max: 0.42, step: 0.01, defaultValue: 0.28 },
    ],
    defaultParams: { children: 3, parentRatio: 0.28 },
    jsSourceCode: `// Sitemap: IA Tree Branch Group (.jsf)
function getControlPoints(width, height, params, helpers) {
  const ch = Math.round(helpers.clamp(Number(params.children) || 3, 2, 5));
  const pr = helpers.clamp(Number(params.parentRatio) || 0.28, 0.2, 0.42);
  return [
    { id: 'parentRatio', label: \`Parent: \${Math.round(pr * 100)}%\`, x: width * 0.5, y: height * pr, cursor: 'ns-resize' },
    { id: 'children', label: \`Children: \${ch}\`, x: helpers.lerp(width * 0.2, width * 0.8, (ch - 2) / 3), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'parentRatio') {
    return { ...params, parentRatio: Number(helpers.clamp(localY / Math.max(1, height), 0.2, 0.42).toFixed(2)) };
  }
  if (id === 'children') {
    const t = helpers.clamp((localX - width * 0.2) / (width * 0.6), 0, 1);
    return { ...params, children: Math.round(2 + t * 3) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = ((Math.round(Number(params.children) || 3) - 1) % 4) + 2;
  return { ...params, children: next };
}

function buildPaths(width, height, params, helpers) {
  const ch = Math.round(helpers.clamp(Number(params.children) || 3, 2, 5));
  const pr = helpers.clamp(Number(params.parentRatio) || 0.28, 0.2, 0.42);
  const pw = width * 0.46;
  const ph = height * pr;
  const midY = ph + (height - ph) * 0.26;
  const childY = ph + (height - ph) * 0.48;
  const childH = height - childY;
  const gap = width * 0.04;
  const cw = (width - gap * (ch - 1)) / ch;

  const paths = [
    { nodes: helpers.rectPath((width - pw) / 2, 0, pw, ph, 0), closed: true },
    { nodes: helpers.polygonPath([{ x: width / 2, y: ph }, { x: width / 2, y: midY }], false), closed: false }
  ];
  const firstCx = cw / 2;
  const lastCx = width - cw / 2;
  paths.push({ nodes: helpers.polygonPath([{ x: firstCx, y: midY }, { x: lastCx, y: midY }], false), closed: false });
  for (let i = 0; i < ch; i++) {
    const cx = i * (cw + gap) + cw / 2;
    paths.push({ nodes: helpers.polygonPath([{ x: cx, y: midY }, { x: cx, y: childY }], false), closed: false });
    paths.push({ nodes: helpers.rectPath(i * (cw + gap), childY, cw, childH, 0), closed: true });
  }
  return paths;
}`,
  },

  // 29. Sitemap Breadcrumb Trail & Path Strip
  {
    id: 'sitemap-breadcrumb-flow',
    name: 'Sitemap: Breadcrumb Trail Strip',
    category: 'Web & Layouts',
    description: 'Interlocking chevron breadcrumb path strip for documenting URL hierarchy depth.',
    iconName: 'ChevronsRight',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle breadcrumb path segments (2-5)',
    paramSchema: [
      { key: 'segments', label: 'Breadcrumb Levels', type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
      { key: 'tipDepth', label: 'Chevron Point Depth', type: 'number', min: 0.08, max: 0.28, step: 0.01, defaultValue: 0.16 },
    ],
    defaultParams: { segments: 3, tipDepth: 0.16 },
    jsSourceCode: `// Sitemap: Breadcrumb Trail Strip (.jsf)
function getControlPoints(width, height, params, helpers) {
  const segs = Math.round(helpers.clamp(Number(params.segments) || 3, 2, 5));
  const tip = helpers.clamp(Number(params.tipDepth) || 0.16, 0.08, 0.28);
  return [
    { id: 'segments', label: \`Levels: \${segs}\`, x: helpers.lerp(width * 0.25, width * 0.75, (segs - 2) / 3), y: 8, cursor: 'ew-resize' },
    { id: 'tipDepth', label: \`Chevron: \${Math.round(tip * 100)}%\`, x: width / segs + width * tip * 0.3, y: height / 2, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'segments') {
    const t = helpers.clamp((localX - width * 0.25) / (width * 0.5), 0, 1);
    return { ...params, segments: Math.round(2 + t * 3) };
  }
  if (id === 'tipDepth') {
    return { ...params, tipDepth: Number(helpers.clamp(localX / Math.max(1, width) * 0.5, 0.08, 0.28).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = ((Math.round(Number(params.segments) || 3) - 1) % 4) + 2;
  return { ...params, segments: next };
}

function buildPaths(width, height, params, helpers) {
  const segs = Math.round(helpers.clamp(Number(params.segments) || 3, 2, 5));
  const tip = helpers.clamp(Number(params.tipDepth) || 0.16, 0.08, 0.28) * (width / segs);
  const gap = Math.max(3, width * 0.018);
  const sw = (width - gap * (segs - 1)) / segs;
  const midY = height / 2;
  const paths = [];
  for (let i = 0; i < segs; i++) {
    const x0 = i * (sw + gap);
    const x1 = x0 + sw;
    const pts = i === 0
      ? [{ x: x0, y: 0 }, { x: x1 - tip, y: 0 }, { x: x1, y: midY }, { x: x1 - tip, y: height }, { x: x0, y: height }]
      : [{ x: x0, y: 0 }, { x: x1 - tip, y: 0 }, { x: x1, y: midY }, { x: x1 - tip, y: height }, { x: x0, y: height }, { x: x0 + tip, y: midY }];
    paths.push({ nodes: helpers.polygonPath(pts), closed: true });
  }
  return paths;
}`,
  },

  // 30. Sitemap IA Sticky Note & Spec Callout
  {
    id: 'sitemap-sticky-annotation',
    name: 'Sitemap: IA Sticky Spec Note',
    category: 'Flow & Diagrams',
    description: 'Architect sticky note with top tape strip, dog-ear bottom corner, and spec checklist rows.',
    iconName: 'StickyNote',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle annotation checklist lines (2-5)',
    paramSchema: [
      { key: 'dogEar', label: 'Bottom Dog-Ear Size', type: 'number', min: 0.12, max: 0.32, step: 0.01, defaultValue: 0.2 },
      { key: 'lines', label: 'Spec Note Lines', type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { dogEar: 0.2, lines: 3 },
    jsSourceCode: `// Sitemap: IA Sticky Spec Note (.jsf)
function getControlPoints(width, height, params, helpers) {
  const de = helpers.clamp(Number(params.dogEar) || 0.2, 0.12, 0.32);
  return [
    { id: 'dogEar', label: \`Fold: \${Math.round(de * 100)}%\`, x: width * (1 - de), y: height * (1 - de), cursor: 'nwse-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'dogEar') {
    const de = helpers.clamp(1 - localX / Math.max(1, width), 0.12, 0.32);
    return { ...params, dogEar: Number(de.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = ((Math.round(Number(params.lines) || 3) - 1) % 4) + 2;
  return { ...params, lines: next };
}

function buildPaths(width, height, params, helpers) {
  const de = helpers.clamp(Number(params.dogEar) || 0.2, 0.12, 0.32);
  const lines = Math.round(helpers.clamp(Number(params.lines) || 3, 2, 5));
  const fx = width * (1 - de);
  const fy = height * (1 - de);
  const paths = [
    {
      nodes: helpers.polygonPath([
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: width, y: fy },
        { x: fx, y: height },
        { x: 0, y: height }
      ]),
      closed: true
    },
    {
      nodes: helpers.polygonPath([
        { x: width, y: fy },
        { x: fx, y: fy },
        { x: fx, y: height }
      ]),
      closed: true
    }
  ];
  const pad = width * 0.12;
  for (let i = 0; i < lines; i++) {
    const ly = height * (0.26 + i * 0.14);
    paths.push({ nodes: helpers.polygonPath([{ x: pad, y: ly }, { x: width - pad * 1.4, y: ly }], false), closed: false });
  }
  return paths;
}`,
  },

  // 31. Flow User Persona & Actor Entry Node
  {
    id: 'flow-user-persona',
    name: 'Flow: User Persona / Actor Card',
    category: 'Flow & Diagrams',
    description: 'User journey entry node displaying persona head-and-shoulders silhouette and role badge.',
    iconName: 'UserCheck',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle circular badge frame vs full persona card',
    paramSchema: [
      { key: 'headScale', label: 'Head Radius Ratio', type: 'number', min: 0.14, max: 0.3, step: 0.01, defaultValue: 0.2 },
      { key: 'cardMode', label: 'Full Persona Card Frame', type: 'boolean', defaultValue: true },
    ],
    defaultParams: { headScale: 0.2, cardMode: true },
    jsSourceCode: `// Flow: User Persona / Actor Card (.jsf)
function getControlPoints(width, height, params, helpers) {
  const hs = helpers.clamp(Number(params.headScale) || 0.2, 0.14, 0.3);
  return [
    { id: 'headScale', label: \`Head: \${Math.round(hs * 100)}%\`, x: width * 0.5, y: height * (0.34 - hs), cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'headScale') {
    const hs = helpers.clamp(0.38 - localY / Math.max(1, height), 0.14, 0.3);
    return { ...params, headScale: Number(hs.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, cardMode: !params.cardMode };
}

function buildPaths(width, height, params, helpers) {
  const hs = helpers.clamp(Number(params.headScale) || 0.2, 0.14, 0.3);
  const cardMode = params.cardMode !== false;
  const cx = width / 2;
  const hr = Math.min(width, height) * hs;
  const paths = [];
  if (cardMode) {
    paths.push({ nodes: helpers.rectPath(0, 0, width, height, 0), closed: true });
  } else {
    paths.push({ nodes: helpers.ellipsePath(cx, height / 2, width / 2, height / 2), closed: true });
  }
  paths.push({ nodes: helpers.ellipsePath(cx, height * 0.34, hr, hr), closed: true });
  paths.push({
    nodes: helpers.arcNodes(cx, height * 0.82, width * 0.32, height * 0.28, 180, 180),
    closed: true
  });
  return paths;
}`,
  },

  // 32. Flow Conversion Funnel Stage Trapezoid
  {
    id: 'flow-funnel-stage',
    name: 'Flow: Conversion Funnel Stage',
    category: 'Flow & Diagrams',
    description: 'Segmented conversion funnel stage with adjustable bottom taper and stage divider bands.',
    iconName: 'Filter',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle funnel stages (1-4)',
    paramSchema: [
      { key: 'taperRatio', label: 'Bottom Width Ratio', type: 'number', min: 0.25, max: 0.9, step: 0.01, defaultValue: 0.48 },
      { key: 'bands', label: 'Funnel Stages', type: 'number', min: 1, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { taperRatio: 0.48, bands: 3 },
    jsSourceCode: `// Flow: Conversion Funnel Stage (.jsf)
function getControlPoints(width, height, params, helpers) {
  const tr = helpers.clamp(Number(params.taperRatio) || 0.48, 0.25, 0.9);
  const bands = Math.round(helpers.clamp(Number(params.bands) || 3, 1, 4));
  return [
    { id: 'taperRatio', label: \`Taper: \${Math.round(tr * 100)}%\`, x: width * (0.5 + tr / 2), y: height, cursor: 'ew-resize' },
    { id: 'bands', label: \`Stages: \${bands}\`, x: width * 0.5, y: helpers.lerp(height * 0.2, height * 0.8, (bands - 1) / 3), cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'taperRatio') {
    const tr = helpers.clamp(Math.abs(localX - width * 0.5) * 2 / Math.max(1, width), 0.25, 0.9);
    return { ...params, taperRatio: Number(tr.toFixed(2)) };
  }
  if (id === 'bands') {
    const t = helpers.clamp((localY - height * 0.2) / (height * 0.6), 0, 1);
    return { ...params, bands: Math.round(1 + t * 3) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = (Math.round(Number(params.bands) || 3) % 4) + 1;
  return { ...params, bands: next };
}

function buildPaths(width, height, params, helpers) {
  const tr = helpers.clamp(Number(params.taperRatio) || 0.48, 0.25, 0.9);
  const bands = Math.round(helpers.clamp(Number(params.bands) || 3, 1, 4));
  const paths = [];
  for (let i = 0; i < bands; i++) {
    const t0 = i / bands;
    const t1 = (i + 1) / bands;
    const w0 = helpers.lerp(width, width * tr, t0);
    const w1 = helpers.lerp(width, width * tr, t1);
    const y0 = height * t0;
    const y1 = height * t1;
    paths.push({
      nodes: helpers.polygonPath([
        { x: (width - w0) / 2, y: y0 },
        { x: (width + w0) / 2, y: y0 },
        { x: (width + w1) / 2, y: y1 },
        { x: (width - w1) / 2, y: y1 }
      ]),
      closed: true
    });
  }
  return paths;
}`,
  },

  // 33. Flow Cross-Functional Swimlane Container
  {
    id: 'flow-swimlane-header',
    name: 'Flow: Swimlane Container',
    category: 'Flow & Diagrams',
    description: 'BPMN / system workflow swimlane container with header banner and parallel lane dividers.',
    iconName: 'Columns',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle swimlane count (2-4 lanes)',
    paramSchema: [
      { key: 'headerRatio', label: 'Swimlane Header Ratio', type: 'number', min: 0.1, max: 0.28, step: 0.01, defaultValue: 0.16 },
      { key: 'lanes', label: 'Swimlanes', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { headerRatio: 0.16, lanes: 3 },
    jsSourceCode: `// Flow: Swimlane Container (.jsf)
function getControlPoints(width, height, params, helpers) {
  const hr = helpers.clamp(Number(params.headerRatio) || 0.16, 0.1, 0.28);
  const lanes = Math.round(helpers.clamp(Number(params.lanes) || 3, 2, 4));
  return [
    { id: 'headerRatio', label: \`Header: \${Math.round(hr * 100)}%\`, x: width * 0.5, y: height * hr, cursor: 'ns-resize' },
    { id: 'lanes', label: \`Lanes: \${lanes}\`, x: helpers.lerp(width * 0.25, width * 0.75, (lanes - 2) / 2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'headerRatio') {
    return { ...params, headerRatio: Number(helpers.clamp(localY / Math.max(1, height), 0.1, 0.28).toFixed(2)) };
  }
  if (id === 'lanes') {
    const t = helpers.clamp((localX - width * 0.25) / (width * 0.5), 0, 1);
    return { ...params, lanes: Math.round(2 + t * 2) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = ((Math.round(Number(params.lanes) || 3) - 1) % 3) + 2;
  return { ...params, lanes: next };
}

function buildPaths(width, height, params, helpers) {
  const hr = helpers.clamp(Number(params.headerRatio) || 0.16, 0.1, 0.28) * height;
  const lanes = Math.round(helpers.clamp(Number(params.lanes) || 3, 2, 4));
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.polygonPath([{ x: 0, y: hr }, { x: width, y: hr }], false), closed: false }
  ];
  for (let i = 1; i < lanes; i++) {
    const lx = (width * i) / lanes;
    paths.push({ nodes: helpers.polygonPath([{ x: lx, y: 0 }, { x: lx, y: height }], false), closed: false });
  }
  return paths;
}`,
  },

  // 34. Flow Conditional Decision Gateway (XOR/OR/AND)
  {
    id: 'flow-decision-gateway',
    name: 'Flow: Decision Gateway (XOR/AND)',
    category: 'Flow & Diagrams',
    description: 'BPMN conditional routing diamond with interactive inner marker (XOR Cross, AND Plus, or OR Ring).',
    iconName: 'GitBranch',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle gateway logic (XOR Cross -> AND Plus -> OR Circle)',
    paramSchema: [
      { key: 'glyphScale', label: 'Inner Glyph Scale', type: 'number', min: 0.18, max: 0.45, step: 0.01, defaultValue: 0.28 },
      { key: 'gateType', label: 'Gate Mode (0=XOR, 1=AND, 2=OR)', type: 'number', min: 0, max: 2, step: 1, defaultValue: 0 },
    ],
    defaultParams: { glyphScale: 0.28, gateType: 0 },
    jsSourceCode: `// Flow: Decision Gateway (.jsf)
function getControlPoints(width, height, params, helpers) {
  const gs = helpers.clamp(Number(params.glyphScale) || 0.28, 0.18, 0.45);
  return [
    { id: 'glyphScale', label: \`Glyph: \${Math.round(gs * 100)}%\`, x: width * (0.5 + gs * 0.5), y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'glyphScale') {
    const gs = helpers.clamp(Math.abs(localX - width * 0.5) * 2 / Math.max(1, width), 0.18, 0.45);
    return { ...params, glyphScale: Number(gs.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = (Math.round(Number(params.gateType) || 0) + 1) % 3;
  return { ...params, gateType: next };
}

function buildPaths(width, height, params, helpers) {
  const gs = helpers.clamp(Number(params.glyphScale) || 0.28, 0.18, 0.45);
  const mode = Math.round(Number(params.gateType) || 0);
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) * gs * 0.6;
  const paths = [
    {
      nodes: helpers.polygonPath([
        { x: cx, y: 0 },
        { x: width, y: cy },
        { x: cx, y: height },
        { x: 0, y: cy }
      ]),
      closed: true
    }
  ];
  if (mode === 0) {
    paths.push({ nodes: helpers.polygonPath([{ x: cx - r, y: cy - r }, { x: cx + r, y: cy + r }], false), closed: false });
    paths.push({ nodes: helpers.polygonPath([{ x: cx + r, y: cy - r }, { x: cx - r, y: cy + r }], false), closed: false });
  } else if (mode === 1) {
    paths.push({ nodes: helpers.polygonPath([{ x: cx - r, y: cy }, { x: cx + r, y: cy }], false), closed: false });
    paths.push({ nodes: helpers.polygonPath([{ x: cx, y: cy - r }, { x: cx, y: cy + r }], false), closed: false });
  } else {
    paths.push({ nodes: helpers.ellipsePath(cx, cy, r, r), closed: true });
  }
  return paths;
}`,
  },

  // 35. Flow Parallel Concurrency Fork / Join Bar
  {
    id: 'flow-parallel-fork',
    name: 'Flow: Parallel Fork / Join Bar',
    category: 'Flow & Diagrams',
    description: 'UML / system architecture synchronization bar with incoming trunk and N parallel outgoing branch ports.',
    iconName: 'GitMerge',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle parallel thread branches (2-5)',
    paramSchema: [
      { key: 'branches', label: 'Parallel Branches', type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
      { key: 'barThickness', label: 'Sync Bar Thickness Ratio', type: 'number', min: 0.12, max: 0.32, step: 0.01, defaultValue: 0.2 },
    ],
    defaultParams: { branches: 3, barThickness: 0.2 },
    jsSourceCode: `// Flow: Parallel Fork / Join Bar (.jsf)
function getControlPoints(width, height, params, helpers) {
  const br = Math.round(helpers.clamp(Number(params.branches) || 3, 2, 5));
  return [
    { id: 'branches', label: \`Threads: \${br}\`, x: helpers.lerp(width * 0.2, width * 0.8, (br - 2) / 3), y: height - 6, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'branches') {
    const t = helpers.clamp((localX - width * 0.2) / (width * 0.6), 0, 1);
    return { ...params, branches: Math.round(2 + t * 3) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = ((Math.round(Number(params.branches) || 3) - 1) % 4) + 2;
  return { ...params, branches: next };
}

function buildPaths(width, height, params, helpers) {
  const br = Math.round(helpers.clamp(Number(params.branches) || 3, 2, 5));
  const bt = helpers.clamp(Number(params.barThickness) || 0.2, 0.12, 0.32) * height;
  const barY = (height - bt) / 2;
  const paths = [
    { nodes: helpers.rectPath(0, barY, width, bt, bt / 2), closed: true },
    { nodes: helpers.polygonPath([{ x: width / 2, y: 0 }, { x: width / 2, y: barY }], false), closed: false }
  ];
  for (let i = 0; i < br; i++) {
    const bx = helpers.lerp(width * 0.18, width * 0.82, i / Math.max(1, br - 1));
    paths.push({ nodes: helpers.polygonPath([{ x: bx, y: barY + bt }, { x: bx, y: height }], false), closed: false });
    paths.push({ nodes: helpers.ellipsePath(bx, height - 4, 3.5, 3.5), closed: true });
  }
  return paths;
}`,
  },

  // 36. Flow Incoming Webhook Event Trigger
  {
    id: 'flow-webhook-trigger',
    name: 'Flow: Webhook Event Trigger',
    category: 'Flow & Diagrams',
    description: 'Event-driven webhook ingress node with lightning trigger bolt and concentric pulse rings.',
    iconName: 'Zap',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle webhook pulse rings (1-3)',
    paramSchema: [
      { key: 'boltScale', label: 'Lightning Bolt Scale', type: 'number', min: 0.25, max: 0.6, step: 0.01, defaultValue: 0.42 },
      { key: 'rings', label: 'Pulse Rings', type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
    ],
    defaultParams: { boltScale: 0.42, rings: 2 },
    jsSourceCode: `// Flow: Webhook Event Trigger (.jsf)
function getControlPoints(width, height, params, helpers) {
  const bs = helpers.clamp(Number(params.boltScale) || 0.42, 0.25, 0.6);
  return [
    { id: 'boltScale', label: \`Bolt: \${Math.round(bs * 100)}%\`, x: width * (0.5 + bs * 0.4), y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'boltScale') {
    const bs = helpers.clamp(Math.abs(localX - width * 0.5) * 2 / Math.max(1, width), 0.25, 0.6);
    return { ...params, boltScale: Number(bs.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = (Math.round(Number(params.rings) || 2) % 3) + 1;
  return { ...params, rings: next };
}

function buildPaths(width, height, params, helpers) {
  const bs = helpers.clamp(Number(params.boltScale) || 0.42, 0.25, 0.6);
  const rings = Math.round(helpers.clamp(Number(params.rings) || 2, 1, 3));
  const cx = width / 2;
  const cy = height / 2;
  const rx = width / 2;
  const ry = height / 2;
  const paths = [];
  for (let i = 0; i < rings; i++) {
    const f = 1 - i * 0.16;
    paths.push({ nodes: helpers.ellipsePath(cx, cy, rx * f, ry * f), closed: true });
  }
  const bw = width * bs * 0.55;
  const bh = height * bs * 0.75;
  paths.push({
    nodes: helpers.polygonPath([
      { x: cx + bw * 0.2, y: cy - bh },
      { x: cx - bw * 0.7, y: cy + bh * 0.08 },
      { x: cx - bw * 0.05, y: cy + bh * 0.08 },
      { x: cx - bw * 0.2, y: cy + bh },
      { x: cx + bw * 0.7, y: cy - bh * 0.08 },
      { x: cx + bw * 0.05, y: cy - bh * 0.08 }
    ]),
    closed: true
  });
  return paths;
}`,
  },

  // 37. Flow REST API Endpoint Route Card
  {
    id: 'flow-rest-endpoint',
    name: 'Flow: REST API Endpoint Card',
    category: 'Flow & Diagrams',
    description: 'REST API microservice route node with HTTP method pill, URL path slot, and JSON payload block.',
    iconName: 'Server',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle HTTP verb badge width and response schema rows',
    paramSchema: [
      { key: 'badgeWidthRatio', label: 'Method Pill Width', type: 'number', min: 0.18, max: 0.42, step: 0.01, defaultValue: 0.26 },
      { key: 'schemaRows', label: 'JSON Schema Fields', type: 'number', min: 1, max: 4, step: 1, defaultValue: 2 },
    ],
    defaultParams: { badgeWidthRatio: 0.26, schemaRows: 2 },
    jsSourceCode: `// Flow: REST API Endpoint Card (.jsf)
function getControlPoints(width, height, params, helpers) {
  const bw = helpers.clamp(Number(params.badgeWidthRatio) || 0.26, 0.18, 0.42);
  return [
    { id: 'badgeWidthRatio', label: \`Verb Pill: \${Math.round(bw * 100)}%\`, x: width * bw, y: height * 0.22, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'badgeWidthRatio') {
    return { ...params, badgeWidthRatio: Number(helpers.clamp(localX / Math.max(1, width), 0.18, 0.42).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = (Math.round(Number(params.schemaRows) || 2) % 4) + 1;
  return { ...params, schemaRows: next };
}

function buildPaths(width, height, params, helpers) {
  const bw = helpers.clamp(Number(params.badgeWidthRatio) || 0.26, 0.18, 0.42);
  const rows = Math.round(helpers.clamp(Number(params.schemaRows) || 2, 1, 4));
  const pad = Math.max(6, width * 0.06);
  const topH = height * 0.34;
  const pillW = (width - pad * 2) * bw;
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.rectPath(pad, pad, pillW, topH - pad, Math.min(10, (topH - pad) * 0.5)), closed: true },
    { nodes: helpers.rectPath(pad * 1.6 + pillW, pad, width - pad * 2.6 - pillW, topH - pad, 0), closed: true }
  ];
  const bodyY = topH + pad * 0.6;
  const bodyH = height - bodyY - pad;
  const gap = pad * 0.4;
  const rh = (bodyH - gap * (rows - 1)) / rows;
  for (let i = 0; i < rows; i++) {
    paths.push({ nodes: helpers.rectPath(pad, bodyY + i * (rh + gap), width - pad * 2, rh, 0), closed: true });
  }
  return paths;
}`,
  },

  // 38. Flow GraphQL Query / Resolver Hexagon
  {
    id: 'flow-graphql-node',
    name: 'Flow: GraphQL Federation Node',
    category: 'Flow & Diagrams',
    description: 'GraphQL schema & resolver node with hexagonal outer frame, inscribed triangle, and vertex nodes.',
    iconName: 'Hexagon',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle inner GraphQL triangle mesh',
    paramSchema: [
      { key: 'nodeRadius', label: 'Vertex Dot Size Ratio', type: 'number', min: 0.04, max: 0.14, step: 0.01, defaultValue: 0.08 },
      { key: 'showMesh', label: 'Show Inner Mesh Triangle', type: 'boolean', defaultValue: true },
    ],
    defaultParams: { nodeRadius: 0.08, showMesh: true },
    jsSourceCode: `// Flow: GraphQL Federation Node (.jsf)
function getControlPoints(width, height, params, helpers) {
  const nr = helpers.clamp(Number(params.nodeRadius) || 0.08, 0.04, 0.14);
  return [
    { id: 'nodeRadius', label: \`Nodes: \${Math.round(nr * 100)}%\`, x: width * 0.5, y: height * nr, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'nodeRadius') {
    return { ...params, nodeRadius: Number(helpers.clamp(localY / Math.max(1, height), 0.04, 0.14).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, showMesh: !params.showMesh };
}

function buildPaths(width, height, params, helpers) {
  const nr = helpers.clamp(Number(params.nodeRadius) || 0.08, 0.04, 0.14) * Math.min(width, height);
  const showMesh = params.showMesh !== false;
  const cx = width / 2;
  const cy = height / 2;
  const rx = width * 0.44;
  const ry = height * 0.44;
  const hexPts = [];
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 3;
    hexPts.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry });
  }
  const paths = [{ nodes: helpers.polygonPath(hexPts), closed: true }];
  if (showMesh) {
    paths.push({ nodes: helpers.polygonPath([hexPts[0], hexPts[2], hexPts[4]]), closed: true });
    paths.push({ nodes: helpers.polygonPath([hexPts[1], hexPts[3], hexPts[5]]), closed: true });
  }
  for (let i = 0; i < 6; i++) {
    paths.push({ nodes: helpers.ellipsePath(hexPts[i].x, hexPts[i].y, nr, nr), closed: true });
  }
  return paths;
}`,
  },

  // 39. Flow Containerized Microservice Pod
  {
    id: 'flow-microservice-pod',
    name: 'Flow: Microservice Pod / K8s Node',
    category: 'Flow & Diagrams',
    description: 'Kubernetes / Docker container pod card with replica instance blocks and health check indicator.',
    iconName: 'Boxes',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to scale container replicas (1-4 pods)',
    paramSchema: [
      { key: 'replicas', label: 'Pod Replicas', type: 'number', min: 1, max: 4, step: 1, defaultValue: 3 },
      { key: 'headerRatio', label: 'Pod Header Height', type: 'number', min: 0.18, max: 0.36, step: 0.01, defaultValue: 0.24 },
    ],
    defaultParams: { replicas: 3, headerRatio: 0.24 },
    jsSourceCode: `// Flow: Microservice Pod / K8s Node (.jsf)
function getControlPoints(width, height, params, helpers) {
  const rep = Math.round(helpers.clamp(Number(params.replicas) || 3, 1, 4));
  return [
    { id: 'replicas', label: \`Replicas: \${rep}\`, x: helpers.lerp(width * 0.25, width * 0.75, (rep - 1) / 3), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'replicas') {
    const t = helpers.clamp((localX - width * 0.25) / (width * 0.5), 0, 1);
    return { ...params, replicas: Math.round(1 + t * 3) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = (Math.round(Number(params.replicas) || 3) % 4) + 1;
  return { ...params, replicas: next };
}

function buildPaths(width, height, params, helpers) {
  const rep = Math.round(helpers.clamp(Number(params.replicas) || 3, 1, 4));
  const hr = helpers.clamp(Number(params.headerRatio) || 0.24, 0.18, 0.36) * height;
  const pad = Math.max(6, width * 0.06);
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.polygonPath([{ x: 0, y: hr }, { x: width, y: hr }], false), closed: false }
  ];
  const gap = pad * 0.6;
  const cw = (width - pad * 2 - gap * (rep - 1)) / rep;
  const ch = height - hr - pad * 2;
  for (let i = 0; i < rep; i++) {
    paths.push({ nodes: helpers.rectPath(pad + i * (cw + gap), hr + pad, cw, ch, 0), closed: true });
  }
  return paths;
}`,
  },

  // 40. Flow Traffic Load Balancer & Reverse Proxy
  {
    id: 'flow-load-balancer',
    name: 'Flow: Load Balancer & Proxy',
    category: 'Flow & Diagrams',
    description: 'Reverse proxy / ingress load balancer node distributing incoming traffic across N target nodes.',
    iconName: 'Network',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle backend target count (2-4)',
    paramSchema: [
      { key: 'targets', label: 'Backend Targets', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
      { key: 'hubSize', label: 'Proxy Hub Size Ratio', type: 'number', min: 0.16, max: 0.36, step: 0.01, defaultValue: 0.24 },
    ],
    defaultParams: { targets: 3, hubSize: 0.24 },
    jsSourceCode: `// Flow: Load Balancer & Proxy (.jsf)
function getControlPoints(width, height, params, helpers) {
  const tg = Math.round(helpers.clamp(Number(params.targets) || 3, 2, 4));
  return [
    { id: 'targets', label: \`Targets: \${tg}\`, x: width - 8, y: helpers.lerp(height * 0.25, height * 0.75, (tg - 2) / 2), cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'targets') {
    const t = helpers.clamp((localY - height * 0.25) / (height * 0.5), 0, 1);
    return { ...params, targets: Math.round(2 + t * 2) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = ((Math.round(Number(params.targets) || 3) - 1) % 3) + 2;
  return { ...params, targets: next };
}

function buildPaths(width, height, params, helpers) {
  const tg = Math.round(helpers.clamp(Number(params.targets) || 3, 2, 4));
  const hs = helpers.clamp(Number(params.hubSize) || 0.24, 0.16, 0.36);
  const pad = Math.max(6, width * 0.06);
  const hubR = Math.min(width, height) * hs;
  const hubX = pad + hubR;
  const hubY = height / 2;
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.ellipsePath(hubX, hubY, hubR, hubR), closed: true }
  ];
  const tx = width - pad - hubR * 0.9;
  const tr = hubR * 0.55;
  for (let i = 0; i < tg; i++) {
    const ty = helpers.lerp(height * 0.22, height * 0.78, i / Math.max(1, tg - 1));
    paths.push({ nodes: helpers.polygonPath([{ x: hubX + hubR, y: hubY }, { x: tx - tr, y: ty }], false), closed: false });
    paths.push({ nodes: helpers.ellipsePath(tx, ty, tr, tr), closed: true });
  }
  return paths;
}`,
  },

  // 41. Flow OAuth 2.0 / JWT Security Guard
  {
    id: 'flow-oauth-guard',
    name: 'Flow: OAuth / JWT Security Shield',
    category: 'Badges & Icons',
    description: 'Zero-trust security middleware shield with keyhole / checkmark verification emblem.',
    iconName: 'ShieldCheck',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle Verified Checkmark vs Keyhole emblem',
    paramSchema: [
      { key: 'shoulderRatio', label: 'Shield Shoulder Drop', type: 'number', min: 0.25, max: 0.6, step: 0.01, defaultValue: 0.44 },
      { key: 'verified', label: 'Verified Checkmark Mode', type: 'boolean', defaultValue: true },
    ],
    defaultParams: { shoulderRatio: 0.44, verified: true },
    jsSourceCode: `// Flow: OAuth / JWT Security Shield (.jsf)
function getControlPoints(width, height, params, helpers) {
  const sr = helpers.clamp(Number(params.shoulderRatio) || 0.44, 0.25, 0.6);
  return [
    { id: 'shoulderRatio', label: \`Curve: \${Math.round(sr * 100)}%\`, x: width, y: height * sr, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'shoulderRatio') {
    return { ...params, shoulderRatio: Number(helpers.clamp(localY / Math.max(1, height), 0.25, 0.6).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, verified: !params.verified };
}

function buildPaths(width, height, params, helpers) {
  const sr = helpers.clamp(Number(params.shoulderRatio) || 0.44, 0.25, 0.6) * height;
  const verified = params.verified !== false;
  const cx = width / 2;
  const cy = height * 0.48;
  const shieldNodes = [
    helpers.cornerNode(cx, 0),
    helpers.cornerNode(width, height * 0.12),
    helpers.smoothNode(width, sr, width, sr * 0.6, width, height * 0.78),
    helpers.smoothNode(cx, height, width * 0.7, height * 0.92, width * 0.3, height * 0.92),
    helpers.smoothNode(0, sr, 0, height * 0.78, 0, sr * 0.6),
    helpers.cornerNode(0, height * 0.12)
  ];
  const paths = [{ nodes: shieldNodes, closed: true }];
  if (verified) {
    paths.push({
      nodes: helpers.polygonPath([
        { x: cx - width * 0.18, y: cy },
        { x: cx - width * 0.04, y: cy + height * 0.14 },
        { x: cx + width * 0.22, y: cy - height * 0.14 }
      ], false),
      closed: false
    });
  } else {
    const r = Math.min(width, height) * 0.12;
    paths.push({ nodes: helpers.ellipsePath(cx, cy - r * 0.4, r, r), closed: true });
  }
  return paths;
}`,
  },

  // 42. Flow Cron Timer & Scheduled Job Node
  {
    id: 'flow-cron-scheduler',
    name: 'Flow: Cron Timer / Scheduler',
    category: 'Flow & Diagrams',
    description: 'Scheduled background worker node with clock face, tick marks, and interactive hour/minute hands.',
    iconName: 'Clock',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to advance the scheduled cron clock hand angle',
    paramSchema: [
      { key: 'handAngle', label: 'Minute Hand Angle (deg)', type: 'number', min: 0, max: 330, step: 30, defaultValue: 60 },
      { key: 'ringInset', label: 'Inner Dial Inset', type: 'number', min: 0.1, max: 0.28, step: 0.01, defaultValue: 0.16 },
    ],
    defaultParams: { handAngle: 60, ringInset: 0.16 },
    jsSourceCode: `// Flow: Cron Timer / Scheduler (.jsf)
function getControlPoints(width, height, params, helpers) {
  const ang = helpers.degToRad((Number(params.handAngle) || 60) - 90);
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) * 0.34;
  return [
    { id: 'handAngle', label: \`Angle: \${Math.round(Number(params.handAngle) || 60)}deg\`, x: cx + Math.cos(ang) * r, y: cy + Math.sin(ang) * r, cursor: 'crosshair' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'handAngle') {
    const deg = (helpers.radToDeg(Math.atan2(localY - height / 2, localX - width / 2)) + 450) % 360;
    return { ...params, handAngle: Math.round(deg / 15) * 15 };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = ((Math.round(Number(params.handAngle) || 60) + 60) % 360);
  return { ...params, handAngle: next };
}

function buildPaths(width, height, params, helpers) {
  const ang = helpers.degToRad((Number(params.handAngle) || 60) - 90);
  const inset = helpers.clamp(Number(params.ringInset) || 0.16, 0.1, 0.28);
  const cx = width / 2;
  const cy = height / 2;
  const rx = width / 2;
  const ry = height / 2;
  const paths = [
    { nodes: helpers.ellipsePath(cx, cy, rx, ry), closed: true },
    { nodes: helpers.ellipsePath(cx, cy, rx * (1 - inset), ry * (1 - inset)), closed: true },
    {
      nodes: helpers.polygonPath([
        { x: cx, y: cy - ry * 0.45 },
        { x: cx, y: cy },
        { x: cx + Math.cos(ang) * rx * 0.55, y: cy + Math.sin(ang) * ry * 0.55 }
      ], false),
      closed: false
    }
  ];
  return paths;
}`,
  },

  // 43. Flow Async Message Queue / Event Bus (Kafka / SQS)
  {
    id: 'flow-message-queue',
    name: 'Flow: Async Message Queue / Bus',
    category: 'Flow & Diagrams',
    description: 'FIFO message broker pipe with internal queued payload slots and directional flow chevrons.',
    iconName: 'ArrowRightLeft',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle queued message slot count (2-6)',
    paramSchema: [
      { key: 'slots', label: 'Queued Message Slots', type: 'number', min: 2, max: 6, step: 1, defaultValue: 4 },
      { key: 'capRatio', label: 'Cylinder End Cap Ratio', type: 'number', min: 0.08, max: 0.24, step: 0.01, defaultValue: 0.14 },
    ],
    defaultParams: { slots: 4, capRatio: 0.14 },
    jsSourceCode: `// Flow: Async Message Queue / Bus (.jsf)
function getControlPoints(width, height, params, helpers) {
  const slots = Math.round(helpers.clamp(Number(params.slots) || 4, 2, 6));
  return [
    { id: 'slots', label: \`Messages: \${slots}\`, x: helpers.lerp(width * 0.25, width * 0.75, (slots - 2) / 4), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'slots') {
    const t = helpers.clamp((localX - width * 0.25) / (width * 0.5), 0, 1);
    return { ...params, slots: Math.round(2 + t * 4) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = ((Math.round(Number(params.slots) || 4) - 1) % 5) + 2;
  return { ...params, slots: next };
}

function buildPaths(width, height, params, helpers) {
  const slots = Math.round(helpers.clamp(Number(params.slots) || 4, 2, 6));
  const cap = helpers.clamp(Number(params.capRatio) || 0.14, 0.08, 0.24) * width;
  const pad = Math.max(6, height * 0.18);
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, height * 0.35), closed: true },
    { nodes: helpers.ellipsePath(width - cap, height / 2, cap, height / 2), closed: true }
  ];
  const availW = width - cap * 2 - pad * 2;
  const gap = availW * 0.08;
  const sw = (availW - gap * (slots - 1)) / slots;
  for (let i = 0; i < slots; i++) {
    paths.push({ nodes: helpers.rectPath(pad + i * (sw + gap), pad, sw, height - pad * 2, 0), closed: true });
  }
  return paths;
}`,
  },

  // 44. Flow In-Memory Cache Layer (Redis / CDN Edge)
  {
    id: 'flow-cache-redis',
    name: 'Flow: In-Memory Cache / CDN Layer',
    category: 'Flow & Diagrams',
    description: 'Stacked isometric diamond wafers representing high-speed Redis cache or CDN edge tiers.',
    iconName: 'DatabaseZap',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle stacked cache wafer layers (2-4)',
    paramSchema: [
      { key: 'wafers', label: 'Cache Wafer Layers', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
      { key: 'waferHeight', label: 'Wafer Depth Ratio', type: 'number', min: 0.35, max: 0.68, step: 0.01, defaultValue: 0.5 },
    ],
    defaultParams: { wafers: 3, waferHeight: 0.5 },
    jsSourceCode: `// Flow: In-Memory Cache / CDN Layer (.jsf)
function getControlPoints(width, height, params, helpers) {
  const wf = Math.round(helpers.clamp(Number(params.wafers) || 3, 2, 4));
  return [
    { id: 'wafers', label: \`Tiers: \${wf}\`, x: width * 0.5, y: helpers.lerp(height * 0.3, height * 0.85, (wf - 2) / 2), cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'wafers') {
    const t = helpers.clamp((localY - height * 0.3) / (height * 0.55), 0, 1);
    return { ...params, wafers: Math.round(2 + t * 2) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = ((Math.round(Number(params.wafers) || 3) - 1) % 3) + 2;
  return { ...params, wafers: next };
}

function buildPaths(width, height, params, helpers) {
  const wf = Math.round(helpers.clamp(Number(params.wafers) || 3, 2, 4));
  const wh = helpers.clamp(Number(params.waferHeight) || 0.5, 0.35, 0.68) * height;
  const stepY = (height - wh) / Math.max(1, wf - 1);
  const cx = width / 2;
  const paths = [];
  for (let i = wf - 1; i >= 0; i--) {
    const topY = i * stepY;
    const midY = topY + wh / 2;
    const botY = topY + wh;
    paths.push({
      nodes: helpers.polygonPath([
        { x: cx, y: topY },
        { x: width, y: midY },
        { x: cx, y: botY },
        { x: 0, y: midY }
      ]),
      closed: true
    });
  }
  return paths;
}`,
  },

  // 45. Flow Cloud Object Storage Bucket (S3 / GCS)
  {
    id: 'flow-storage-bucket',
    name: 'Flow: Cloud Object Storage Bucket',
    category: 'Flow & Diagrams',
    description: 'Cloud blob storage bucket with elliptical rim, tapered walls, and capacity level rings.',
    iconName: 'HardDrive',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle storage fill bands (1-3)',
    paramSchema: [
      { key: 'baseTaper', label: 'Bucket Base Width Ratio', type: 'number', min: 0.55, max: 0.92, step: 0.01, defaultValue: 0.74 },
      { key: 'fillBands', label: 'Storage Fill Rings', type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
    ],
    defaultParams: { baseTaper: 0.74, fillBands: 2 },
    jsSourceCode: `// Flow: Cloud Object Storage Bucket (.jsf)
function getControlPoints(width, height, params, helpers) {
  const bt = helpers.clamp(Number(params.baseTaper) || 0.74, 0.55, 0.92);
  return [
    { id: 'baseTaper', label: \`Base: \${Math.round(bt * 100)}%\`, x: width * (0.5 + bt / 2), y: height * 0.85, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'baseTaper') {
    const bt = helpers.clamp(Math.abs(localX - width * 0.5) * 2 / Math.max(1, width), 0.55, 0.92);
    return { ...params, baseTaper: Number(bt.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = (Math.round(Number(params.fillBands) || 2) % 3) + 1;
  return { ...params, fillBands: next };
}

function buildPaths(width, height, params, helpers) {
  const bt = helpers.clamp(Number(params.baseTaper) || 0.74, 0.55, 0.92);
  const bands = Math.round(helpers.clamp(Number(params.fillBands) || 2, 1, 3));
  const rimRy = height * 0.14;
  const botW = width * bt;
  const botX = (width - botW) / 2;
  const paths = [
    {
      nodes: helpers.polygonPath([
        { x: 0, y: rimRy },
        { x: width, y: rimRy },
        { x: botX + botW, y: height - rimRy * 0.6 },
        { x: botX, y: height - rimRy * 0.6 }
      ]),
      closed: true
    },
    { nodes: helpers.ellipsePath(width / 2, rimRy, width / 2, rimRy), closed: true }
  ];
  for (let i = 1; i <= bands; i++) {
    const t = i / (bands + 1);
    const y = helpers.lerp(rimRy * 1.8, height - rimRy, t);
    const w = helpers.lerp(width, botW, t);
    paths.push({ nodes: helpers.polygonPath([{ x: (width - w) / 2, y }, { x: (width + w) / 2, y }], false), closed: false });
  }
  return paths;
}`,
  },

  // 46. Flow Autonomous AI Agent & Tool Loop Node
  {
    id: 'flow-ai-agent-node',
    name: 'Flow: Autonomous AI Agent Node',
    category: 'Flow & Diagrams',
    description: 'Agentic AI workflow node with central reasoning spark core and orbiting tool-call satellites.',
    iconName: 'Bot',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle orbiting tool satellites (2-6)',
    paramSchema: [
      { key: 'satellites', label: 'Tool-Call Satellites', type: 'number', min: 2, max: 6, step: 1, defaultValue: 4 },
      { key: 'coreRatio', label: 'Spark Core Scale', type: 'number', min: 0.16, max: 0.42, step: 0.01, defaultValue: 0.28 },
    ],
    defaultParams: { satellites: 4, coreRatio: 0.28 },
    jsSourceCode: `// Flow: Autonomous AI Agent Node (.jsf)
function getControlPoints(width, height, params, helpers) {
  const sats = Math.round(helpers.clamp(Number(params.satellites) || 4, 2, 6));
  const cr = helpers.clamp(Number(params.coreRatio) || 0.28, 0.16, 0.42);
  return [
    { id: 'coreRatio', label: \`Core: \${Math.round(cr * 100)}%\`, x: width * (0.5 + cr * 0.5), y: height * 0.5, cursor: 'ew-resize' },
    { id: 'satellites', label: \`Tools: \${sats}\`, x: helpers.lerp(width * 0.25, width * 0.75, (sats - 2) / 4), y: height - 6, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'coreRatio') {
    const cr = helpers.clamp(Math.abs(localX - width * 0.5) * 2 / Math.max(1, width), 0.16, 0.42);
    return { ...params, coreRatio: Number(cr.toFixed(2)) };
  }
  if (id === 'satellites') {
    const t = helpers.clamp((localX - width * 0.25) / (width * 0.5), 0, 1);
    return { ...params, satellites: Math.round(2 + t * 4) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = ((Math.round(Number(params.satellites) || 4) - 1) % 5) + 2;
  return { ...params, satellites: next };
}

function buildPaths(width, height, params, helpers) {
  const sats = Math.round(helpers.clamp(Number(params.satellites) || 4, 2, 6));
  const cr = helpers.clamp(Number(params.coreRatio) || 0.28, 0.16, 0.42);
  const cx = width / 2;
  const cy = height / 2;
  const orbitRx = width * 0.38;
  const orbitRy = height * 0.38;
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.ellipsePath(cx, cy, orbitRx, orbitRy), closed: true }
  ];
  // 4-point AI spark star in center
  const sr = Math.min(width, height) * cr;
  const ir = sr * 0.32;
  const sparkPts = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const r = i % 2 === 0 ? sr : ir;
    sparkPts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  paths.push({ nodes: helpers.polygonPath(sparkPts), closed: true });
  const dotR = Math.max(4, Math.min(width, height) * 0.06);
  for (let i = 0; i < sats; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / sats;
    paths.push({ nodes: helpers.ellipsePath(cx + Math.cos(a) * orbitRx, cy + Math.sin(a) * orbitRy, dotR, dotR), closed: true });
  }
  return paths;
}`,
  },

  // 47. Flow LLM Prompt Template & Chain Step
  {
    id: 'flow-llm-prompt-chain',
    name: 'Flow: LLM Prompt Chain Card',
    category: 'Flow & Diagrams',
    description: 'Prompt engineering pipeline card with System/User/Assistant message blocks and token variable slots.',
    iconName: 'MessageSquareCode',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle prompt chain message turns (2-4)',
    paramSchema: [
      { key: 'turns', label: 'Prompt Message Turns', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
      { key: 'indentRatio', label: 'Assistant Bubble Indent', type: 'number', min: 0.08, max: 0.28, step: 0.01, defaultValue: 0.16 },
    ],
    defaultParams: { turns: 3, indentRatio: 0.16 },
    jsSourceCode: `// Flow: LLM Prompt Chain Card (.jsf)
function getControlPoints(width, height, params, helpers) {
  const turns = Math.round(helpers.clamp(Number(params.turns) || 3, 2, 4));
  return [
    { id: 'turns', label: \`Turns: \${turns}\`, x: width * 0.5, y: helpers.lerp(height * 0.25, height * 0.85, (turns - 2) / 2), cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'turns') {
    const t = helpers.clamp((localY - height * 0.25) / (height * 0.6), 0, 1);
    return { ...params, turns: Math.round(2 + t * 2) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = ((Math.round(Number(params.turns) || 3) - 1) % 3) + 2;
  return { ...params, turns: next };
}

function buildPaths(width, height, params, helpers) {
  const turns = Math.round(helpers.clamp(Number(params.turns) || 3, 2, 4));
  const ind = helpers.clamp(Number(params.indentRatio) || 0.16, 0.08, 0.28) * width;
  const pad = Math.max(6, width * 0.06);
  const paths = [{ nodes: helpers.rectPath(0, 0, width, height, 0), closed: true }];
  const gap = pad * 0.55;
  const bh = (height - pad * 2 - gap * (turns - 1)) / turns;
  for (let i = 0; i < turns; i++) {
    const isRight = i % 2 === 1;
    const bx = isRight ? pad + ind : pad;
    const bw = width - pad * 2 - ind;
    paths.push({ nodes: helpers.rectPath(bx, pad + i * (bh + gap), bw, bh, 0), closed: true });
  }
  return paths;
}`,
  },

  // 48. Flow Vector Embeddings Index / RAG Store
  {
    id: 'flow-vector-db-index',
    name: 'Flow: Vector DB / RAG Index',
    category: 'Flow & Diagrams',
    description: 'High-dimensional vector database cube with semantic similarity graph nodes and nearest-neighbor edges.',
    iconName: 'Compass',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle nearest-neighbor cluster nodes (3-6)',
    paramSchema: [
      { key: 'clusters', label: 'Embedding Cluster Nodes', type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
      { key: 'spread', label: 'Cluster Radius Ratio', type: 'number', min: 0.2, max: 0.42, step: 0.01, defaultValue: 0.3 },
    ],
    defaultParams: { clusters: 4, spread: 0.3 },
    jsSourceCode: `// Flow: Vector DB / RAG Index (.jsf)
function getControlPoints(width, height, params, helpers) {
  const cl = Math.round(helpers.clamp(Number(params.clusters) || 4, 3, 6));
  return [
    { id: 'clusters', label: \`Vectors: \${cl}\`, x: helpers.lerp(width * 0.25, width * 0.75, (cl - 3) / 3), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'clusters') {
    const t = helpers.clamp((localX - width * 0.25) / (width * 0.5), 0, 1);
    return { ...params, clusters: Math.round(3 + t * 3) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = ((Math.round(Number(params.clusters) || 4) - 2) % 4) + 3;
  return { ...params, clusters: next };
}

function buildPaths(width, height, params, helpers) {
  const cl = Math.round(helpers.clamp(Number(params.clusters) || 4, 3, 6));
  const sp = helpers.clamp(Number(params.spread) || 0.3, 0.2, 0.42);
  const cx = width / 2;
  const cy = height / 2;
  const paths = [
    { nodes: helpers.rectPath(0, 0, width, height, 0), closed: true },
    { nodes: helpers.ellipsePath(cx, cy, 5, 5), closed: true }
  ];
  const r = Math.min(width, height) * sp;
  for (let i = 0; i < cl; i++) {
    const a = -Math.PI / 3 + (i * Math.PI * 2) / cl;
    const vx = cx + Math.cos(a) * r;
    const vy = cy + Math.sin(a) * r;
    paths.push({ nodes: helpers.polygonPath([{ x: cx, y: cy }, { x: vx, y: vy }], false), closed: false });
    paths.push({ nodes: helpers.ellipsePath(vx, vy, 4, 4), closed: true });
  }
  return paths;
}`,
  },

  // 49. Flow Transactional Email / Push Dispatch
  {
    id: 'flow-email-notification',
    name: 'Flow: Email / Push Notification',
    category: 'Badges & Icons',
    description: 'Outbound transactional email envelope node with adjustable flap depth and unread notification badge.',
    iconName: 'Send',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle notification badge dot and flap angle',
    paramSchema: [
      { key: 'flapRatio', label: 'Envelope Flap Depth', type: 'number', min: 0.28, max: 0.72, step: 0.01, defaultValue: 0.52 },
      { key: 'showBadge', label: 'Show Unread Push Badge', type: 'boolean', defaultValue: true },
    ],
    defaultParams: { flapRatio: 0.52, showBadge: true },
    jsSourceCode: `// Flow: Email / Push Notification (.jsf)
function getControlPoints(width, height, params, helpers) {
  const fr = helpers.clamp(Number(params.flapRatio) || 0.52, 0.28, 0.72);
  return [
    { id: 'flapRatio', label: \`Flap: \${Math.round(fr * 100)}%\`, x: width * 0.5, y: height * fr, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'flapRatio') {
    return { ...params, flapRatio: Number(helpers.clamp(localY / Math.max(1, height), 0.28, 0.72).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, showBadge: !params.showBadge };
}

function buildPaths(width, height, params, helpers) {
  const fr = helpers.clamp(Number(params.flapRatio) || 0.52, 0.28, 0.72);
  const badge = params.showBadge !== false;
  const pad = badge ? Math.min(width, height) * 0.08 : 0;
  const ew = width - pad;
  const eh = height - pad;
  const ey = pad;
  const paths = [
    { nodes: helpers.rectPath(0, ey, ew, eh, 0), closed: true },
    {
      nodes: helpers.polygonPath([
        { x: 0, y: ey + 2 },
        { x: ew / 2, y: ey + eh * fr },
        { x: ew, y: ey + 2 }
      ], false),
      closed: false
    }
  ];
  if (badge) {
    const br = Math.max(6, Math.min(width, height) * 0.14);
    paths.push({ nodes: helpers.ellipsePath(width - br, br, br, br), closed: true });
  }
  return paths;
}`,
  },

  // 50. Flow Telemetry & Conversion Event Beacon
  {
    id: 'flow-analytics-event',
    name: 'Flow: Analytics & Telemetry Beacon',
    category: 'Badges & Icons',
    description: 'Conversion pixel / telemetry event node with rising KPI bars and radar broadcast arcs.',
    iconName: 'Activity',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle telemetry bar count (3-5)',
    paramSchema: [
      { key: 'bars', label: 'Telemetry Metric Bars', type: 'number', min: 3, max: 5, step: 1, defaultValue: 4 },
      { key: 'pulse', label: 'Show Broadcast Arc', type: 'boolean', defaultValue: true },
    ],
    defaultParams: { bars: 4, pulse: true },
    jsSourceCode: `// Flow: Analytics & Telemetry Beacon (.jsf)
function getControlPoints(width, height, params, helpers) {
  const bars = Math.round(helpers.clamp(Number(params.bars) || 4, 3, 5));
  return [
    { id: 'bars', label: \`Bars: \${bars}\`, x: helpers.lerp(width * 0.25, width * 0.75, (bars - 3) / 2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'bars') {
    const t = helpers.clamp((localX - width * 0.25) / (width * 0.5), 0, 1);
    return { ...params, bars: Math.round(3 + t * 2) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = ((Math.round(Number(params.bars) || 4) - 2) % 3) + 3;
  return { ...params, bars: next, pulse: !params.pulse };
}

function buildPaths(width, height, params, helpers) {
  const bars = Math.round(helpers.clamp(Number(params.bars) || 4, 3, 5));
  const pulse = params.pulse !== false;
  const pad = Math.max(6, width * 0.12);
  const paths = [{ nodes: helpers.rectPath(0, 0, width, height, 0), closed: true }];
  const gap = pad * 0.4;
  const bw = (width - pad * 2 - gap * (bars - 1)) / bars;
  const maxH = height * 0.62;
  const botY = height - pad;
  for (let i = 0; i < bars; i++) {
    const bh = maxH * (0.35 + ((i + 1) / bars) * 0.65);
    paths.push({ nodes: helpers.rectPath(pad + i * (bw + gap), botY - bh, bw, bh, 0), closed: true });
  }
  if (pulse) {
    paths.push({ nodes: helpers.arcNodes(pad + bw, pad * 1.4, width * 0.22, height * 0.18, -20, 110), closed: false });
  }
  return paths;
}`,
  },

  // 51. Flowchart: Start / End Terminator Pill (ISO-5807)
  {
    id: 'flow-terminator-pill',
    name: 'Flowchart: Start / End Terminator',
    category: 'Flow & Diagrams',
    description: 'Standard ISO-5807 rounded stadium/pill terminator node for marking Start, End, Trigger, or Return points in a flowchart.',
    iconName: 'PlayCircle',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle double-border End State ring',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Start / End' },
      { key: 'capRatio', label: 'Capsule Roundness', type: 'number', min: 0.2, max: 0.5, step: 0.01, defaultValue: 0.5 },
      { key: 'doubleBorder', label: 'Double End-State Ring', type: 'boolean', defaultValue: false },
    ],
    defaultParams: { label: 'Start / End', capRatio: 0.5, doubleBorder: false },
    jsSourceCode: `// Flowchart: Start / End Terminator (.jsf)
function getControlPoints(width, height, params, helpers) {
  const cr = helpers.clamp(Number(params.capRatio) || 0.5, 0.2, 0.5);
  return [
    { id: 'capRatio', label: \`Round: \${Math.round(cr * 200)}%\`, x: Math.min(width, height) * cr, y: 0, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'capRatio') {
    const cr = helpers.clamp(localX / Math.max(1, Math.min(width, height)), 0.2, 0.5);
    return { ...params, capRatio: Number(cr.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, doubleBorder: !params.doubleBorder };
}

function buildPaths(width, height, params, helpers) {
  const cr = helpers.clamp(Number(params.capRatio) || 0.5, 0.2, 0.5);
  const r = Math.min(width, height) * cr;
  const paths = [{ nodes: helpers.rectPath(0, 0, width, height, r), closed: true }];
  if (params.doubleBorder) {
    const inset = Math.max(4, Math.min(width, height) * 0.08);
    paths.push({
      nodes: helpers.rectPath(inset, inset, width - inset * 2, height - inset * 2, Math.max(2, r - inset)),
      closed: true
    });
  }
  return paths;
}`,
  },

  // 52. Flowchart: Process / Action Step Box (ISO-5807)
  {
    id: 'flow-process-step',
    name: 'Flowchart: Process / Action Box',
    category: 'Flow & Diagrams',
    description: 'Standard flowchart process step rectangle with adjustable corner radius and optional top accent header strip.',
    iconName: 'Square',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle top status accent band',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Process Step' },
      { key: 'cornerRadius', label: 'Corner Radius (px)', type: 'number', min: 0, max: 28, step: 1, defaultValue: 6 },
      { key: 'showHeaderBand', label: 'Show Top Accent Strip', type: 'boolean', defaultValue: false },
    ],
    defaultParams: { label: 'Process Step', cornerRadius: 6, showHeaderBand: false },
    jsSourceCode: `// Flowchart: Process / Action Box (.jsf)
function getControlPoints(width, height, params, helpers) {
  const r = helpers.clamp(Number(params.cornerRadius) ?? 6, 0, 28);
  return [
    { id: 'cornerRadius', label: \`Radius: \${Math.round(r)}px\`, x: r, y: 0, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'cornerRadius') {
    return { ...params, cornerRadius: Math.round(helpers.clamp(localX, 0, 28)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, showHeaderBand: !params.showHeaderBand };
}

function buildPaths(width, height, params, helpers) {
  const r = helpers.clamp(Number(params.cornerRadius) ?? 6, 0, 28);
  const paths = [{ nodes: helpers.rectPath(0, 0, width, height, r), closed: true }];
  if (params.showHeaderBand) {
    const hy = Math.max(12, height * 0.22);
    paths.push({ nodes: helpers.polygonPath([{ x: 0, y: hy }, { x: width, y: hy }], false), closed: false });
  }
  return paths;
}`,
  },

  // 53. Flowchart: Decision Diamond (Yes / No Branch)
  {
    id: 'flow-decision-diamond',
    name: 'Flowchart: Decision Diamond',
    category: 'Flow & Diagrams',
    description: 'Classic ISO-5807 4-way conditional branching diamond for Yes/No or True/False decisions.',
    iconName: 'Diamond',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle inner double-diamond highlight',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Decision?' },
      { key: 'innerInset', label: 'Inner Frame Ratio', type: 'number', min: 0, max: 0.22, step: 0.01, defaultValue: 0.08 },
    ],
    defaultParams: { label: 'Decision?', innerInset: 0.08 },
    jsSourceCode: `// Flowchart: Decision Diamond (.jsf)
function getControlPoints(width, height, params, helpers) {
  const ins = helpers.clamp(Number(params.innerInset) || 0, 0, 0.22);
  return [
    { id: 'innerInset', label: ins > 0.02 ? \`Inner: \${Math.round(ins * 100)}%\` : 'Single Diamond', x: width * 0.5, y: height * ins, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'innerInset') {
    return { ...params, innerInset: Number(helpers.clamp(localY / Math.max(1, height), 0, 0.22).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Number(params.innerInset) || 0;
  return { ...params, innerInset: cur > 0.04 ? 0 : 0.1 };
}

function buildPaths(width, height, params, helpers) {
  const ins = helpers.clamp(Number(params.innerInset) || 0, 0, 0.22);
  const cx = width / 2;
  const cy = height / 2;
  const paths = [
    {
      nodes: helpers.polygonPath([
        { x: cx, y: 0 },
        { x: width, y: cy },
        { x: cx, y: height },
        { x: 0, y: cy }
      ]),
      closed: true
    }
  ];
  if (ins > 0.02) {
    const ix = width * ins;
    const iy = height * ins;
    paths.push({
      nodes: helpers.polygonPath([
        { x: cx, y: iy },
        { x: width - ix, y: cy },
        { x: cx, y: height - iy },
        { x: ix, y: cy }
      ]),
      closed: true
    });
  }
  return paths;
}`,
  },

  // 54. Flowchart: Data Input / Output Parallelogram
  {
    id: 'flow-data-io',
    name: 'Flowchart: Data Input / Output (I/O)',
    category: 'Flow & Diagrams',
    description: 'Slanted ISO-5807 parallelogram representing Data Input, Output, Payload Read, or API Response.',
    iconName: 'Sliders',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to flip slant direction',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Input / Output' },
      { key: 'slantRatio', label: 'Parallelogram Skew', type: 'number', min: 0.08, max: 0.32, step: 0.01, defaultValue: 0.18 },
      { key: 'flipSlant', label: 'Reverse Skew Direction', type: 'boolean', defaultValue: false },
    ],
    defaultParams: { label: 'Input / Output', slantRatio: 0.18, flipSlant: false },
    jsSourceCode: `// Flowchart: Data Input / Output Parallelogram (.jsf)
function getControlPoints(width, height, params, helpers) {
  const sr = helpers.clamp(Number(params.slantRatio) || 0.18, 0.08, 0.32);
  return [
    { id: 'slantRatio', label: \`Skew: \${Math.round(sr * 100)}%\`, x: width * sr, y: 0, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'slantRatio') {
    return { ...params, slantRatio: Number(helpers.clamp(localX / Math.max(1, width), 0.08, 0.32).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, flipSlant: !params.flipSlant };
}

function buildPaths(width, height, params, helpers) {
  const sx = helpers.clamp(Number(params.slantRatio) || 0.18, 0.08, 0.32) * width;
  const flip = Boolean(params.flipSlant);
  const pts = flip
    ? [{ x: 0, y: 0 }, { x: width - sx, y: 0 }, { x: width, y: height }, { x: sx, y: height }]
    : [{ x: sx, y: 0 }, { x: width, y: 0 }, { x: width - sx, y: height }, { x: 0, y: height }];
  return [{ nodes: helpers.polygonPath(pts), closed: true }];
}`,
  },

  // 55. Flowchart: Predefined Process / Subroutine
  {
    id: 'flow-subroutine-predefined',
    name: 'Flowchart: Predefined Subroutine',
    category: 'Flow & Diagrams',
    description: 'ISO-5807 Predefined Process / Subroutine block with adjustable left and right vertical inner margin bars.',
    iconName: 'Columns',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle side bar inset width',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Subroutine()' },
      { key: 'sideBarRatio', label: 'Side Bar Inset Ratio', type: 'number', min: 0.08, max: 0.25, step: 0.01, defaultValue: 0.14 },
    ],
    defaultParams: { label: 'Subroutine()', sideBarRatio: 0.14 },
    jsSourceCode: `// Flowchart: Predefined Subroutine (.jsf)
function getControlPoints(width, height, params, helpers) {
  const sb = helpers.clamp(Number(params.sideBarRatio) || 0.14, 0.08, 0.25);
  return [
    { id: 'sideBarRatio', label: \`Inset: \${Math.round(sb * 100)}%\`, x: width * sb, y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'sideBarRatio') {
    return { ...params, sideBarRatio: Number(helpers.clamp(localX / Math.max(1, width), 0.08, 0.25).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Number(params.sideBarRatio) || 0.14;
  return { ...params, sideBarRatio: cur > 0.16 ? 0.1 : 0.2 };
}

function buildPaths(width, height, params, helpers) {
  const sb = helpers.clamp(Number(params.sideBarRatio) || 0.14, 0.08, 0.25) * width;
  return [
    { nodes: helpers.rectPath(0, 0, width, height, 4), closed: true },
    { nodes: helpers.polygonPath([{ x: sb, y: 0 }, { x: sb, y: height }], false), closed: false },
    { nodes: helpers.polygonPath([{ x: width - sb, y: 0 }, { x: width - sb, y: height }], false), closed: false }
  ];
}`,
  },

  // 56. Flowchart: Document / Multi-Document Wave Symbol
  {
    id: 'flow-document-wave',
    name: 'Flowchart: Document / Multi-Doc',
    category: 'Flow & Diagrams',
    description: 'Standard flowchart Document / Report output node with cubic Bezier S-wave bottom edge and 1-3 stacked document sheets.',
    iconName: 'FileText',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle between Single Document and Multi-Document (1-3 sheets)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Document / Report' },
      { key: 'waveDepth', label: 'Bottom Wave Amplitude', type: 'number', min: 0.06, max: 0.24, step: 0.01, defaultValue: 0.13 },
      { key: 'sheets', label: 'Document Sheets', type: 'number', min: 1, max: 3, step: 1, defaultValue: 1 },
    ],
    defaultParams: { label: 'Document / Report', waveDepth: 0.13, sheets: 1 },
    jsSourceCode: `// Flowchart: Document / Multi-Doc (.jsf)
function getControlPoints(width, height, params, helpers) {
  const wd = helpers.clamp(Number(params.waveDepth) || 0.13, 0.06, 0.24);
  const sh = Math.round(helpers.clamp(Number(params.sheets) || 1, 1, 3));
  return [
    { id: 'waveDepth', label: \`Wave: \${Math.round(wd * 100)}%\`, x: width * 0.25, y: height * (1 - wd), cursor: 'ns-resize' },
    { id: 'sheets', label: \`Sheets: \${sh}\`, x: helpers.lerp(width * 0.3, width * 0.7, (sh - 1) / 2), y: 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'waveDepth') {
    const wd = helpers.clamp(1 - localY / Math.max(1, height), 0.06, 0.24);
    return { ...params, waveDepth: Number(wd.toFixed(2)) };
  }
  if (id === 'sheets') {
    const t = helpers.clamp((localX - width * 0.3) / (width * 0.4), 0, 1);
    return { ...params, sheets: Math.round(1 + t * 2) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = (Math.round(Number(params.sheets) || 1) % 3) + 1;
  return { ...params, sheets: next };
}

function buildPaths(width, height, params, helpers) {
  const wd = helpers.clamp(Number(params.waveDepth) || 0.13, 0.06, 0.24) * height;
  const sh = Math.round(helpers.clamp(Number(params.sheets) || 1, 1, 3));
  const off = sh > 1 ? 7 : 0;
  const cw = width - off * (sh - 1);
  const ch = height - off * (sh - 1);
  const paths = [];

  for (let i = sh - 1; i >= 0; i--) {
    const ox = i * off;
    const oy = (sh - 1 - i) * off;
    const baseY = oy + ch - wd;
    paths.push({
      nodes: [
        helpers.cornerNode(ox, oy),
        helpers.cornerNode(ox + cw, oy),
        helpers.cornerNode(ox + cw, baseY),
        helpers.smoothNode(ox + cw * 0.5, baseY, ox + cw * 0.75, baseY - wd * 1.35, ox + cw * 0.25, baseY + wd * 1.35),
        helpers.cornerNode(ox, baseY)
      ],
      closed: true
    });
  }
  return paths;
}`,
  },

  // 57. Flowchart: Manual Input (Slanted Top Quadrilateral)
  {
    id: 'flow-manual-input',
    name: 'Flowchart: Manual User Input',
    category: 'Flow & Diagrams',
    description: 'ISO-5807 Manual Input node with sloped top edge representing user form entry, CLI prompt, or manual parameter input.',
    iconName: 'Keyboard',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to adjust top slope depth',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Manual Input' },
      { key: 'slopeRatio', label: 'Top Slope Drop Ratio', type: 'number', min: 0.12, max: 0.42, step: 0.01, defaultValue: 0.26 },
    ],
    defaultParams: { label: 'Manual Input', slopeRatio: 0.26 },
    jsSourceCode: `// Flowchart: Manual User Input (.jsf)
function getControlPoints(width, height, params, helpers) {
  const sr = helpers.clamp(Number(params.slopeRatio) || 0.26, 0.12, 0.42);
  return [
    { id: 'slopeRatio', label: \`Slope: \${Math.round(sr * 100)}%\`, x: 0, y: height * sr, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'slopeRatio') {
    return { ...params, slopeRatio: Number(helpers.clamp(localY / Math.max(1, height), 0.12, 0.42).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Number(params.slopeRatio) || 0.26;
  return { ...params, slopeRatio: cur > 0.28 ? 0.18 : 0.34 };
}

function buildPaths(width, height, params, helpers) {
  const sy = helpers.clamp(Number(params.slopeRatio) || 0.26, 0.12, 0.42) * height;
  return [
    {
      nodes: helpers.polygonPath([
        { x: 0, y: sy },
        { x: width, y: 0 },
        { x: width, y: height },
        { x: 0, y: height }
      ]),
      closed: true
    }
  ];
}`,
  },

  // 58. Flowchart: Manual Operation (Inverted Trapezoid)
  {
    id: 'flow-manual-operation',
    name: 'Flowchart: Manual Operation',
    category: 'Flow & Diagrams',
    description: 'ISO-5807 Manual Operation trapezoid representing a human-in-the-loop review, manual approval, or physical step.',
    iconName: 'Hand',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to invert trapezoid orientation',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Manual Review' },
      { key: 'taperRatio', label: 'Bottom Taper Inset', type: 'number', min: 0.08, max: 0.32, step: 0.01, defaultValue: 0.18 },
      { key: 'invert', label: 'Invert Trapezoid', type: 'boolean', defaultValue: false },
    ],
    defaultParams: { label: 'Manual Review', taperRatio: 0.18, invert: false },
    jsSourceCode: `// Flowchart: Manual Operation (.jsf)
function getControlPoints(width, height, params, helpers) {
  const tr = helpers.clamp(Number(params.taperRatio) || 0.18, 0.08, 0.32);
  return [
    { id: 'taperRatio', label: \`Taper: \${Math.round(tr * 100)}%\`, x: width * tr, y: height, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'taperRatio') {
    return { ...params, taperRatio: Number(helpers.clamp(localX / Math.max(1, width), 0.08, 0.32).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, invert: !params.invert };
}

function buildPaths(width, height, params, helpers) {
  const tx = helpers.clamp(Number(params.taperRatio) || 0.18, 0.08, 0.32) * width;
  const inv = Boolean(params.invert);
  const pts = inv
    ? [{ x: tx, y: 0 }, { x: width - tx, y: 0 }, { x: width, y: height }, { x: 0, y: height }]
    : [{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width - tx, y: height }, { x: tx, y: height }];
  return [{ nodes: helpers.polygonPath(pts), closed: true }];
}`,
  },

  // 59. Flowchart: Preparation / Initialization Hexagon
  {
    id: 'flow-preparation-hex',
    name: 'Flowchart: Preparation Hexagon',
    category: 'Flow & Diagrams',
    description: 'ISO-5807 6-sided Preparation / Setup node for initializing variables, configuring state, or setting up loop counters.',
    iconName: 'Hexagon',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle side point depth',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Initialize / Setup' },
      { key: 'pointRatio', label: 'Side Point Depth', type: 'number', min: 0.1, max: 0.36, step: 0.01, defaultValue: 0.2 },
    ],
    defaultParams: { label: 'Initialize / Setup', pointRatio: 0.2 },
    jsSourceCode: `// Flowchart: Preparation Hexagon (.jsf)
function getControlPoints(width, height, params, helpers) {
  const pr = helpers.clamp(Number(params.pointRatio) || 0.2, 0.1, 0.36);
  return [
    { id: 'pointRatio', label: \`Tip: \${Math.round(pr * 100)}%\`, x: width * pr, y: 0, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'pointRatio') {
    return { ...params, pointRatio: Number(helpers.clamp(localX / Math.max(1, width), 0.1, 0.36).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Number(params.pointRatio) || 0.2;
  return { ...params, pointRatio: cur > 0.22 ? 0.14 : 0.28 };
}

function buildPaths(width, height, params, helpers) {
  const px = helpers.clamp(Number(params.pointRatio) || 0.2, 0.1, 0.36) * width;
  const cy = height / 2;
  return [
    {
      nodes: helpers.polygonPath([
        { x: px, y: 0 },
        { x: width - px, y: 0 },
        { x: width, y: cy },
        { x: width - px, y: height },
        { x: px, y: height },
        { x: 0, y: cy }
      ]),
      closed: true
    }
  ];
}`,
  },

  // 60. Flowchart: Delay / Wait Gate (D-Shape Bullet)
  {
    id: 'flow-delay-wait',
    name: 'Flowchart: Delay / Wait Gate',
    category: 'Flow & Diagrams',
    description: 'ISO-5807 D-shaped Delay node representing a timer wait, rate limit backoff, or scheduled hold.',
    iconName: 'Clock',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle inner clock hands indicator',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Delay / Wait' },
      { key: 'curveRatio', label: 'Right Nose Curve Ratio', type: 'number', min: 0.25, max: 0.65, step: 0.01, defaultValue: 0.44 },
      { key: 'showClock', label: 'Show Timer Emblem', type: 'boolean', defaultValue: false },
    ],
    defaultParams: { label: 'Delay / Wait', curveRatio: 0.44, showClock: false },
    jsSourceCode: `// Flowchart: Delay / Wait Gate (.jsf)
function getControlPoints(width, height, params, helpers) {
  const cr = helpers.clamp(Number(params.curveRatio) || 0.44, 0.25, 0.65);
  return [
    { id: 'curveRatio', label: \`Arch: \${Math.round(cr * 100)}%\`, x: width * (1 - cr), y: 0, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'curveRatio') {
    const cr = helpers.clamp(1 - localX / Math.max(1, width), 0.25, 0.65);
    return { ...params, curveRatio: Number(cr.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, showClock: !params.showClock };
}

function buildPaths(width, height, params, helpers) {
  const cr = helpers.clamp(Number(params.curveRatio) || 0.44, 0.25, 0.65);
  const splitX = width * (1 - cr);
  const rx = width - splitX;
  const ry = height / 2;
  const k = 0.5522847498;
  const paths = [
    {
      nodes: [
        helpers.cornerNode(0, 0),
        helpers.smoothNode(splitX, 0, splitX, 0, splitX + rx * k, 0),
        helpers.smoothNode(width, ry, width, ry - ry * k, width, ry + ry * k),
        helpers.smoothNode(splitX, height, splitX + rx * k, height, splitX, height),
        helpers.cornerNode(0, height)
      ],
      closed: true
    }
  ];
  if (params.showClock) {
    const r = Math.min(width, height) * 0.16;
    const cx = width * 0.22;
    const cy = height * 0.5;
    paths.push({ nodes: helpers.ellipsePath(cx, cy, r, r), closed: true });
    paths.push({ nodes: helpers.polygonPath([{ x: cx, y: cy - r * 0.6 }, { x: cx, y: cy }, { x: cx + r * 0.5, y: cy }], false), closed: false });
  }
  return paths;
}`,
  },

  // 61. Flowchart: Internal Storage / RAM Memory Block
  {
    id: 'flow-internal-storage',
    name: 'Flowchart: Internal Storage (RAM)',
    category: 'Flow & Diagrams',
    description: 'ISO-5807 Internal Storage symbol with intersecting top and left memory address header lines.',
    iconName: 'HardDrive',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle memory partition offset',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Internal Storage' },
      { key: 'offsetRatio', label: 'Header Grid Offset', type: 'number', min: 0.12, max: 0.34, step: 0.01, defaultValue: 0.2 },
    ],
    defaultParams: { label: 'Internal Storage', offsetRatio: 0.2 },
    jsSourceCode: `// Flowchart: Internal Storage (.jsf)
function getControlPoints(width, height, params, helpers) {
  const or = helpers.clamp(Number(params.offsetRatio) || 0.2, 0.12, 0.34);
  return [
    { id: 'offsetRatio', label: \`Grid: \${Math.round(or * 100)}%\`, x: width * or, y: height * or, cursor: 'nwse-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'offsetRatio') {
    const or = helpers.clamp(((localX / Math.max(1, width)) + (localY / Math.max(1, height))) / 2, 0.12, 0.34);
    return { ...params, offsetRatio: Number(or.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Number(params.offsetRatio) || 0.2;
  return { ...params, offsetRatio: cur > 0.22 ? 0.15 : 0.26 };
}

function buildPaths(width, height, params, helpers) {
  const or = helpers.clamp(Number(params.offsetRatio) || 0.2, 0.12, 0.34);
  const ox = width * or;
  const oy = height * or;
  return [
    { nodes: helpers.rectPath(0, 0, width, height, 3), closed: true },
    { nodes: helpers.polygonPath([{ x: ox, y: 0 }, { x: ox, y: height }], false), closed: false },
    { nodes: helpers.polygonPath([{ x: 0, y: oy }, { x: width, y: oy }], false), closed: false }
  ];
}`,
  },

  // 62. Flowchart: Sequential Access / Audit Log Tape
  {
    id: 'flow-sequential-tape',
    name: 'Flowchart: Sequential Log / Tape',
    category: 'Flow & Diagrams',
    description: 'ISO-5807 Sequential Access Storage symbol (circle with bottom horizontal tangent tail) for event logs and streams.',
    iconName: 'Disc',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle inner spool core ring',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Sequential Log' },
      { key: 'innerSpool', label: 'Inner Spool Ratio', type: 'number', min: 0, max: 0.45, step: 0.02, defaultValue: 0.24 },
    ],
    defaultParams: { label: 'Sequential Log', innerSpool: 0.24 },
    jsSourceCode: `// Flowchart: Sequential Log / Tape (.jsf)
function getControlPoints(width, height, params, helpers) {
  const sp = helpers.clamp(Number(params.innerSpool) ?? 0.24, 0, 0.45);
  return [
    { id: 'innerSpool', label: \`Spool: \${Math.round(sp * 100)}%\`, x: width * (0.5 + sp * 0.4), y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'innerSpool') {
    const sp = helpers.clamp((Math.abs(localX - width * 0.5) * 2.2) / Math.max(1, width), 0, 0.45);
    return { ...params, innerSpool: Number(sp.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Number(params.innerSpool) ?? 0.24;
  return { ...params, innerSpool: cur > 0.1 ? 0 : 0.26 };
}

function buildPaths(width, height, params, helpers) {
  const sp = helpers.clamp(Number(params.innerSpool) ?? 0.24, 0, 0.45);
  const r = Math.min(width, height) * 0.46;
  const cx = width * 0.48;
  const cy = height * 0.5;
  const paths = [
    { nodes: helpers.ellipsePath(cx, cy, r, r), closed: true },
    { nodes: helpers.polygonPath([{ x: cx, y: cy + r }, { x: width, y: cy + r }], false), closed: false }
  ];
  if (sp > 0.04) {
    paths.push({ nodes: helpers.ellipsePath(cx, cy, r * sp, r * sp), closed: true });
  }
  return paths;
}`,
  },

  // 63. Flowchart: Direct Access Disk Drum (Horizontal Cylinder)
  {
    id: 'flow-direct-storage-drum',
    name: 'Flowchart: Direct Access Disk Drum',
    category: 'Flow & Diagrams',
    description: 'ISO-5807 horizontal magnetic disk drum symbol for high-speed direct-access data storage.',
    iconName: 'Database',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle drum end-cap depth',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Direct Disk' },
      { key: 'capRatio', label: 'Right Cap Depth Ratio', type: 'number', min: 0.12, max: 0.34, step: 0.01, defaultValue: 0.2 },
    ],
    defaultParams: { label: 'Direct Disk', capRatio: 0.2 },
    jsSourceCode: `// Flowchart: Direct Access Disk Drum (.jsf)
function getControlPoints(width, height, params, helpers) {
  const cr = helpers.clamp(Number(params.capRatio) || 0.2, 0.12, 0.34);
  return [
    { id: 'capRatio', label: \`Cap: \${Math.round(cr * 100)}%\`, x: width * (1 - cr * 2), y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'capRatio') {
    const cr = helpers.clamp((1 - localX / Math.max(1, width)) / 2, 0.12, 0.34);
    return { ...params, capRatio: Number(cr.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Number(params.capRatio) || 0.2;
  return { ...params, capRatio: cur > 0.22 ? 0.15 : 0.28 };
}

function buildPaths(width, height, params, helpers) {
  const rx = helpers.clamp(Number(params.capRatio) || 0.2, 0.12, 0.34) * width;
  const ry = height / 2;
  const cy = height / 2;
  const leftCx = rx;
  const rightCx = width - rx;
  return [
    { nodes: helpers.rectPath(leftCx, 0, rightCx - leftCx, height, 0), closed: true },
    { nodes: helpers.ellipsePath(leftCx, cy, rx, ry), closed: true },
    { nodes: helpers.ellipsePath(rightCx, cy, rx, ry), closed: true }
  ];
}`,
  },

  // 64. Flowchart: Display / UI Screen Output Node
  {
    id: 'flow-display-output',
    name: 'Flowchart: Display / UI Output',
    category: 'Flow & Diagrams',
    description: 'ISO-5807 Display symbol with pointed left nose and curved right screen edge for UI output and dashboards.',
    iconName: 'Monitor',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to adjust nose taper angle',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Display Output' },
      { key: 'noseRatio', label: 'Left Point Ratio', type: 'number', min: 0.14, max: 0.38, step: 0.01, defaultValue: 0.24 },
    ],
    defaultParams: { label: 'Display Output', noseRatio: 0.24 },
    jsSourceCode: `// Flowchart: Display / UI Output (.jsf)
function getControlPoints(width, height, params, helpers) {
  const nr = helpers.clamp(Number(params.noseRatio) || 0.24, 0.14, 0.38);
  return [
    { id: 'noseRatio', label: \`Nose: \${Math.round(nr * 100)}%\`, x: width * nr, y: 0, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'noseRatio') {
    return { ...params, noseRatio: Number(helpers.clamp(localX / Math.max(1, width), 0.14, 0.38).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Number(params.noseRatio) || 0.24;
  return { ...params, noseRatio: cur > 0.26 ? 0.18 : 0.32 };
}

function buildPaths(width, height, params, helpers) {
  const nx = helpers.clamp(Number(params.noseRatio) || 0.24, 0.14, 0.38) * width;
  const rx = width * 0.22;
  const rightX = width - rx;
  const cy = height / 2;
  const k = 0.5522847498;
  return [
    {
      nodes: [
        helpers.cornerNode(0, cy),
        helpers.cornerNode(nx, 0),
        helpers.smoothNode(rightX, 0, rightX, 0, rightX + rx * k, 0),
        helpers.smoothNode(width, cy, width, cy - cy * k, width, cy + cy * k),
        helpers.smoothNode(rightX, height, rightX + rx * k, height, rightX, height),
        helpers.cornerNode(nx, height)
      ],
      closed: true
    }
  ];
}`,
  },

  // 65. Flowchart: Loop Limit (For / While Boundary)
  {
    id: 'flow-loop-limit',
    name: 'Flowchart: Loop Limit (For / While)',
    category: 'Flow & Diagrams',
    description: 'ISO-5807 Loop Limit chamfered block — toggle between top-chamfered (Loop Start) and bottom-chamfered (Loop End).',
    iconName: 'Repeat',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle between Loop Start (Top Chamfer) and Loop End (Bottom Chamfer)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Loop: For Each' },
      { key: 'chamferRatio', label: 'Corner Chamfer Size', type: 'number', min: 0.12, max: 0.36, step: 0.01, defaultValue: 0.22 },
      { key: 'loopEndMode', label: 'Loop End (Bottom Chamfer)', type: 'boolean', defaultValue: false },
    ],
    defaultParams: { label: 'Loop: For Each', chamferRatio: 0.22, loopEndMode: false },
    jsSourceCode: `// Flowchart: Loop Limit (.jsf)
function getControlPoints(width, height, params, helpers) {
  const cr = helpers.clamp(Number(params.chamferRatio) || 0.22, 0.12, 0.36);
  return [
    { id: 'chamferRatio', label: \`Chamfer: \${Math.round(cr * 100)}%\`, x: width * cr, y: 0, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'chamferRatio') {
    return { ...params, chamferRatio: Number(helpers.clamp(localX / Math.max(1, width), 0.12, 0.36).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const nextEnd = !params.loopEndMode;
  return { ...params, loopEndMode: nextEnd, label: nextEnd ? 'End Loop' : 'Loop: For Each' };
}

function buildPaths(width, height, params, helpers) {
  const cr = helpers.clamp(Number(params.chamferRatio) || 0.22, 0.12, 0.36);
  const cx = width * cr;
  const cy = height * cr * 1.2;
  const endMode = Boolean(params.loopEndMode);
  const pts = endMode
    ? [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: width, y: height - cy },
        { x: width - cx, y: height },
        { x: cx, y: height },
        { x: 0, y: height - cy }
      ]
    : [
        { x: cx, y: 0 },
        { x: width - cx, y: 0 },
        { x: width, y: cy },
        { x: width, y: height },
        { x: 0, y: height },
        { x: 0, y: cy }
      ];
  return [{ nodes: helpers.polygonPath(pts), closed: true }];
}`,
  },

  // 66. Flowchart: Collate / Merge / Extract Symbol
  {
    id: 'flow-collate-merge',
    name: 'Flowchart: Merge / Extract / Collate',
    category: 'Flow & Diagrams',
    description: 'ISO-5807 data combination symbol — morphs between Merge Triangle (down), Extract Triangle (up), and Collate Hourglass.',
    iconName: 'Triangle',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle mode: Merge (Down) -> Extract (Up) -> Collate (Hourglass)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Merge' },
      { key: 'shapeMode', label: 'Mode (0=Merge, 1=Extract, 2=Collate)', type: 'number', min: 0, max: 2, step: 1, defaultValue: 0 },
    ],
    defaultParams: { label: 'Merge', shapeMode: 0 },
    jsSourceCode: `// Flowchart: Merge / Extract / Collate (.jsf)
function getControlPoints(width, height, params, helpers) {
  const mode = Math.round(helpers.clamp(Number(params.shapeMode) || 0, 0, 2));
  const labels = ['Merge (Down)', 'Extract (Up)', 'Collate (Bowtie)'];
  return [
    { id: 'shapeMode', label: labels[mode] || 'Merge', x: helpers.lerp(width * 0.25, width * 0.75, mode / 2), y: 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'shapeMode') {
    const t = helpers.clamp((localX - width * 0.25) / (width * 0.5), 0, 1);
    return { ...params, shapeMode: Math.round(t * 2) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = (Math.round(Number(params.shapeMode) || 0) + 1) % 3;
  const names = ['Merge', 'Extract', 'Collate'];
  return { ...params, shapeMode: next, label: names[next] };
}

function buildPaths(width, height, params, helpers) {
  const mode = Math.round(helpers.clamp(Number(params.shapeMode) || 0, 0, 2));
  const cx = width / 2;
  const cy = height / 2;
  if (mode === 1) {
    return [{ nodes: helpers.polygonPath([{ x: cx, y: 0 }, { x: width, y: height }, { x: 0, y: height }]), closed: true }];
  }
  if (mode === 2) {
    return [
      { nodes: helpers.polygonPath([{ x: 0, y: 0 }, { x: width, y: 0 }, { x: cx, y: cy }]), closed: true },
      { nodes: helpers.polygonPath([{ x: cx, y: cy }, { x: width, y: height }, { x: 0, y: height }]), closed: true }
    ];
  }
  return [{ nodes: helpers.polygonPath([{ x: 0, y: 0 }, { x: width, y: 0 }, { x: cx, y: height }]), closed: true }];
}`,
  },

  // 67. Flowchart: Summing / Logical OR Junction Circle
  {
    id: 'flow-summing-or-junction',
    name: 'Flowchart: Summing / OR Junction',
    category: 'Flow & Diagrams',
    description: 'ISO-5807 Circular Junction node — toggle between Summing Junction (X cross), Logical OR (+ cross), and Inspection Circle.',
    iconName: 'PlusCircle',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle: Summing (X) -> Logical OR (+) -> On-Page Connector (O)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Junction' },
      { key: 'junctionType', label: 'Mode (0=Sum X, 1=OR +, 2=Circle)', type: 'number', min: 0, max: 2, step: 1, defaultValue: 0 },
    ],
    defaultParams: { label: 'Junction', junctionType: 0 },
    jsSourceCode: `// Flowchart: Summing / OR Junction (.jsf)
function getControlPoints(width, height, params, helpers) {
  const jt = Math.round(helpers.clamp(Number(params.junctionType) || 0, 0, 2));
  return [
    { id: 'junctionType', label: jt === 0 ? 'Summing (X)' : jt === 1 ? 'Logical OR (+)' : 'Connector (O)', x: helpers.lerp(width * 0.25, width * 0.75, jt / 2), y: 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'junctionType') {
    const t = helpers.clamp((localX - width * 0.25) / (width * 0.5), 0, 1);
    return { ...params, junctionType: Math.round(t * 2) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = (Math.round(Number(params.junctionType) || 0) + 1) % 3;
  return { ...params, junctionType: next };
}

function buildPaths(width, height, params, helpers) {
  const jt = Math.round(helpers.clamp(Number(params.junctionType) || 0, 0, 2));
  const cx = width / 2;
  const cy = height / 2;
  const rx = width / 2;
  const ry = height / 2;
  const paths = [{ nodes: helpers.ellipsePath(cx, cy, rx, ry), closed: true }];
  if (jt === 0) {
    const dx = rx * 0.7071;
    const dy = ry * 0.7071;
    paths.push({ nodes: helpers.polygonPath([{ x: cx - dx, y: cy - dy }, { x: cx + dx, y: cy + dy }], false), closed: false });
    paths.push({ nodes: helpers.polygonPath([{ x: cx + dx, y: cy - dy }, { x: cx - dx, y: cy + dy }], false), closed: false });
  } else if (jt === 1) {
    paths.push({ nodes: helpers.polygonPath([{ x: 0, y: cy }, { x: width, y: cy }], false), closed: false });
    paths.push({ nodes: helpers.polygonPath([{ x: cx, y: 0 }, { x: cx, y: height }], false), closed: false });
  }
  return paths;
}`,
  },

  // 68. Flowchart: Off-Page Reference Connector (Home-Plate Pentagon)
  {
    id: 'flow-offpage-connector',
    name: 'Flowchart: Off-Page Connector',
    category: 'Flow & Diagrams',
    description: 'ISO-5807 Off-Page Reference pentagon for linking flowchart branches across multiple pages or sheets.',
    iconName: 'ArrowDownCircle',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to adjust bottom chevron point depth',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Page 2A' },
      { key: 'shoulderRatio', label: 'Shoulder Height Ratio', type: 'number', min: 0.45, max: 0.85, step: 0.01, defaultValue: 0.66 },
    ],
    defaultParams: { label: 'Page 2A', shoulderRatio: 0.66 },
    jsSourceCode: `// Flowchart: Off-Page Connector (.jsf)
function getControlPoints(width, height, params, helpers) {
  const sr = helpers.clamp(Number(params.shoulderRatio) || 0.66, 0.45, 0.85);
  return [
    { id: 'shoulderRatio', label: \`Point: \${Math.round(sr * 100)}%\`, x: width, y: height * sr, cursor: 'ns-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'shoulderRatio') {
    return { ...params, shoulderRatio: Number(helpers.clamp(localY / Math.max(1, height), 0.45, 0.85).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Number(params.shoulderRatio) || 0.66;
  return { ...params, shoulderRatio: cur > 0.68 ? 0.56 : 0.74 };
}

function buildPaths(width, height, params, helpers) {
  const sy = helpers.clamp(Number(params.shoulderRatio) || 0.66, 0.45, 0.85) * height;
  return [
    {
      nodes: helpers.polygonPath([
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: width, y: sy },
        { x: width / 2, y: height },
        { x: 0, y: sy }
      ]),
      closed: true
    }
  ];
}`,
  },

  // 69. Flowchart: Annotation / Spec Comment Callout Bracket
  {
    id: 'flow-annotation-callout',
    name: 'Flowchart: Annotation Bracket',
    category: 'Flow & Diagrams',
    description: 'ISO-5807 open annotation bracket with leader stem for attaching technical notes or business rules to flowchart steps.',
    iconName: 'MessageSquare',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle full card enclosure vs open ISO bracket',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '// Spec Note' },
      { key: 'leadRatio', label: 'Left Leader Stem Ratio', type: 'number', min: 0.1, max: 0.35, step: 0.01, defaultValue: 0.2 },
      { key: 'closedBox', label: 'Show Dashed Note Box', type: 'boolean', defaultValue: true },
    ],
    defaultParams: { label: '// Spec Note', leadRatio: 0.2, closedBox: true },
    jsSourceCode: `// Flowchart: Annotation Bracket (.jsf)
function getControlPoints(width, height, params, helpers) {
  const lr = helpers.clamp(Number(params.leadRatio) || 0.2, 0.1, 0.35);
  return [
    { id: 'leadRatio', label: \`Stem: \${Math.round(lr * 100)}%\`, x: width * lr, y: height * 0.5, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'leadRatio') {
    return { ...params, leadRatio: Number(helpers.clamp(localX / Math.max(1, width), 0.1, 0.35).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, closedBox: !params.closedBox };
}

function buildPaths(width, height, params, helpers) {
  const lx = helpers.clamp(Number(params.leadRatio) || 0.2, 0.1, 0.35) * width;
  const cy = height / 2;
  const paths = [
    { nodes: helpers.polygonPath([{ x: 0, y: cy }, { x: lx, y: cy }], false), closed: false }
  ];
  if (params.closedBox) {
    paths.push({ nodes: helpers.rectPath(lx, 0, width - lx, height, 4), closed: true });
  } else {
    paths.push({
      nodes: helpers.polygonPath([
        { x: width, y: 0 },
        { x: lx, y: 0 },
        { x: lx, y: height },
        { x: width, y: height }
      ], false),
      closed: false
    });
  }
  return paths;
}`,
  },

  // 70. Sitemap: Directory / Route Folder Group
  {
    id: 'sitemap-folder-group',
    name: 'Sitemap: Directory / Route Folder',
    category: 'Flow & Diagrams',
    description: 'Information architecture folder container with top directory tab for grouping route subtrees (e.g. /app/*, /api/v1/*).',
    iconName: 'Folder',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle inner route file cards',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '/app/routes/*' },
      { key: 'tabWidthRatio', label: 'Folder Tab Width Ratio', type: 'number', min: 0.25, max: 0.65, step: 0.01, defaultValue: 0.42 },
      { key: 'showFiles', label: 'Show Inner Route Cards', type: 'boolean', defaultValue: true },
    ],
    defaultParams: { label: '/app/routes/*', tabWidthRatio: 0.42, showFiles: true },
    jsSourceCode: `// Sitemap: Directory / Route Folder (.jsf)
function getControlPoints(width, height, params, helpers) {
  const tw = helpers.clamp(Number(params.tabWidthRatio) || 0.42, 0.25, 0.65);
  return [
    { id: 'tabWidthRatio', label: \`Tab: \${Math.round(tw * 100)}%\`, x: width * tw, y: height * 0.16, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'tabWidthRatio') {
    return { ...params, tabWidthRatio: Number(helpers.clamp(localX / Math.max(1, width), 0.25, 0.65).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, showFiles: !params.showFiles };
}

function buildPaths(width, height, params, helpers) {
  const tw = helpers.clamp(Number(params.tabWidthRatio) || 0.42, 0.25, 0.65) * width;
  const tabH = height * 0.16;
  const paths = [
    {
      nodes: helpers.polygonPath([
        { x: 0, y: 0 },
        { x: tw - tabH * 0.6, y: 0 },
        { x: tw, y: tabH },
        { x: width, y: tabH },
        { x: width, y: height },
        { x: 0, y: height }
      ]),
      closed: true
    }
  ];
  if (params.showFiles) {
    const pad = Math.max(8, width * 0.08);
    const cardW = (width - pad * 3) / 2;
    const cardH = height - tabH - pad * 2;
    paths.push({ nodes: helpers.rectPath(pad, tabH + pad, cardW, cardH, 3), closed: true });
    paths.push({ nodes: helpers.rectPath(pad * 2 + cardW, tabH + pad, cardW, cardH, 3), closed: true });
  }
  return paths;
}`,
  },

  // 71. Sitemap: File / PDF / Asset Download Node
  {
    id: 'sitemap-file-download',
    name: 'Sitemap: File / PDF Download Node',
    category: 'Flow & Diagrams',
    description: 'Downloadable static asset node (PDF brochure, ZIP SDK, CSV export) with folded corner and download arrow emblem.',
    iconName: 'Download',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to toggle download arrow scale',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: 'Download PDF' },
      { key: 'foldRatio', label: 'Corner Fold Size', type: 'number', min: 0.14, max: 0.34, step: 0.01, defaultValue: 0.22 },
    ],
    defaultParams: { label: 'Download PDF', foldRatio: 0.22 },
    jsSourceCode: `// Sitemap: File / PDF Download Node (.jsf)
function getControlPoints(width, height, params, helpers) {
  const fr = helpers.clamp(Number(params.foldRatio) || 0.22, 0.14, 0.34);
  return [
    { id: 'foldRatio', label: \`Fold: \${Math.round(fr * 100)}%\`, x: width * (1 - fr), y: height * fr, cursor: 'nesw-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'foldRatio') {
    const fr = helpers.clamp(1 - localX / Math.max(1, width), 0.14, 0.34);
    return { ...params, foldRatio: Number(fr.toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Number(params.foldRatio) || 0.22;
  return { ...params, foldRatio: cur > 0.24 ? 0.16 : 0.28 };
}

function buildPaths(width, height, params, helpers) {
  const fr = helpers.clamp(Number(params.foldRatio) || 0.22, 0.14, 0.34);
  const fx = width * (1 - fr);
  const fy = height * fr;
  const cx = width / 2;
  const cy = height * 0.56;
  const aw = Math.min(width, height) * 0.18;
  return [
    {
      nodes: helpers.polygonPath([
        { x: 0, y: 0 },
        { x: fx, y: 0 },
        { x: width, y: fy },
        { x: width, y: height },
        { x: 0, y: height }
      ]),
      closed: true
    },
    {
      nodes: helpers.polygonPath([
        { x: fx, y: 0 },
        { x: fx, y: fy },
        { x: width, y: fy }
      ]),
      closed: true
    },
    // Downward download arrow + tray
    { nodes: helpers.polygonPath([{ x: cx, y: cy - aw }, { x: cx, y: cy + aw * 0.6 }], false), closed: false },
    { nodes: helpers.polygonPath([{ x: cx - aw * 0.7, y: cy }, { x: cx, y: cy + aw * 0.7 }, { x: cx + aw * 0.7, y: cy }], false), closed: false },
    { nodes: helpers.polygonPath([{ x: cx - aw, y: cy + aw }, { x: cx + aw, y: cy + aw }], false), closed: false }
  ];
}`,
  },

  // 72. Sitemap: Dynamic CMS Collection Template (`[slug]`)
  {
    id: 'sitemap-dynamic-slug-route',
    name: 'Sitemap: Dynamic Route ([slug])',
    category: 'Flow & Diagrams',
    description: 'Database-driven repeating CMS template route (e.g. /products/[slug] or /posts/[id]) with cascaded collection cards.',
    iconName: 'Database',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle cascaded template instances (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: '/blog/[slug]' },
      { key: 'instances', label: 'Collection Cards', type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: '/blog/[slug]', instances: 3 },
    jsSourceCode: `// Sitemap: Dynamic CMS Route ([slug]) (.jsf)
function getControlPoints(width, height, params, helpers) {
  const inst = Math.round(helpers.clamp(Number(params.instances) || 3, 2, 4));
  return [
    { id: 'instances', label: \`Items: \${inst}\`, x: helpers.lerp(width * 0.25, width * 0.75, (inst - 2) / 2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'instances') {
    const t = helpers.clamp((localX - width * 0.25) / (width * 0.5), 0, 1);
    return { ...params, instances: Math.round(2 + t * 2) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const next = ((Math.round(Number(params.instances) || 3) - 1) % 3) + 2;
  return { ...params, instances: next };
}

function buildPaths(width, height, params, helpers) {
  const inst = Math.round(helpers.clamp(Number(params.instances) || 3, 2, 4));
  const step = 8;
  const cw = width - step * (inst - 1);
  const ch = height - step * (inst - 1);
  const paths = [];
  for (let i = inst - 1; i >= 0; i--) {
    paths.push({ nodes: helpers.rectPath(i * step, (inst - 1 - i) * step, cw, ch, 4), closed: true });
  }
  const fy = (inst - 1) * step;
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: fy + ch * 0.24 }, { x: cw, y: fy + ch * 0.24 }], false), closed: false });
  return paths;
}`,
  },

  // 73. Sitemap: Mega-Menu Navigation Hub
  {
    id: 'sitemap-mega-menu-hub',
    name: "Sitemap: Mega-Menu Navigation Hub",
    category: 'Flow & Diagrams',
    description: "Top navigation bar with expanded multi-column mega-menu flyout and featured promo card.",
    iconName: 'LayoutGrid',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle menu columns (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Mega-Menu Hub" },
      { key: 'menuRatio', label: "Flyout Height", type: 'number', min: 0.25, max: 0.72, step: 0.01, defaultValue: 0.48 },
      { key: 'columns', label: "Menu Columns", type: 'number', min: 2, max: 5, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Mega-Menu Hub", menuRatio: 0.48, columns: 4 },
    jsSourceCode: `// Sitemap: Mega-Menu Navigation Hub (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.menuRatio) || 0.48, 0.25, 0.72);
  const v2 = Math.round(helpers.clamp(Number(params.columns) || 4, 2, 5));
  const t1 = (v1 - 0.25) / Math.max(0.001, 0.47);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'menuRatio', label: \`Flyout: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'columns', label: \`Menu: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'menuRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.25, 0.72, t);
    return { ...params, menuRatio: Number(val.toFixed(2)) };
  }
  if (id === 'columns') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, columns: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.columns) || 4);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, columns: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.menuRatio) || 0.48, 0.25, 0.72);
  const v2 = Math.round(helpers.clamp(Number(params.columns) || 4, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const navH = Math.max(14, height * 0.14);
  const flyH = (height - navH - pad) * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: navH }, { x: width, y: navH }], false), closed: false });
  paths.push({ nodes: helpers.rectPath(pad, navH, width - pad * 2, flyH, 3), closed: true });
  const colW = (width - pad * 4) / (v2 + 1);
  for (let i = 0; i < v2; i++) {
    const x = pad * 1.5 + i * colW;
    paths.push({ nodes: helpers.rectPath(x, navH + pad * 0.6, colW * 0.82, flyH * 0.22, 2), closed: true });
    paths.push({ nodes: helpers.polygonPath([{ x, y: navH + flyH * 0.45 }, { x: x + colW * 0.75, y: navH + flyH * 0.45 }], false), closed: false });
    paths.push({ nodes: helpers.polygonPath([{ x, y: navH + flyH * 0.68 }, { x: x + colW * 0.65, y: navH + flyH * 0.68 }], false), closed: false });
  }
  const promoX = pad * 1.5 + v2 * colW;
  paths.push({ nodes: helpers.rectPath(promoX, navH + pad * 0.6, colW * 0.9, flyH - pad * 1.2, 3), closed: true });
  return paths;
}`,
  },

  // 74. Sitemap: Global Footer Directory
  {
    id: 'sitemap-footer-directory',
    name: "Sitemap: Global Footer Directory",
    category: 'Flow & Diagrams',
    description: "Full-width multi-column sitemap footer with newsletter signup pill and legal links strip.",
    iconName: 'PanelBottom',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle link columns (2-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Footer Directory" },
      { key: 'footerRatio', label: "Footer Height", type: 'number', min: 0.28, max: 0.7, step: 0.01, defaultValue: 0.46 },
      { key: 'columns', label: "Link Columns", type: 'number', min: 2, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Footer Directory", footerRatio: 0.46, columns: 4 },
    jsSourceCode: `// Sitemap: Global Footer Directory (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.footerRatio) || 0.46, 0.28, 0.7);
  const v2 = Math.round(helpers.clamp(Number(params.columns) || 4, 2, 6));
  const t1 = (v1 - 0.28) / Math.max(0.001, 0.41999999999999993);
  const t2 = (v2 - 2) / Math.max(1, 4);
  return [
    { id: 'footerRatio', label: \`Footer: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'columns', label: \`Link: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'footerRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.28, 0.7, t);
    return { ...params, footerRatio: Number(val.toFixed(2)) };
  }
  if (id === 'columns') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, columns: Math.round(helpers.lerp(2, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.columns) || 4);
  const next = cur >= 6 ? 2 : cur + 1;
  return { ...params, columns: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.footerRatio) || 0.46, 0.28, 0.7);
  const v2 = Math.round(helpers.clamp(Number(params.columns) || 4, 2, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const footY = height * (1 - v1);
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: footY }, { x: width, y: footY }], false), closed: false });
  paths.push({ nodes: helpers.rectPath(pad, pad, width * 0.55, (footY - pad * 2) * 0.55, 3), closed: true });
  const colW = (width - pad * 2) / v2;
  for (let i = 0; i < v2; i++) {
    const cxCol = pad + i * colW;
    paths.push({ nodes: helpers.rectPath(cxCol + 2, footY + pad * 0.6, colW * 0.72, height * 0.07, 1), closed: true });
    paths.push({ nodes: helpers.polygonPath([{ x: cxCol + 2, y: footY + height * 0.18 }, { x: cxCol + colW * 0.65, y: footY + height * 0.18 }], false), closed: false });
    paths.push({ nodes: helpers.polygonPath([{ x: cxCol + 2, y: footY + height * 0.26 }, { x: cxCol + colW * 0.55, y: footY + height * 0.26 }], false), closed: false });
  }
  paths.push({ nodes: helpers.rectPath(pad, height - pad * 1.8, width - pad * 2, pad * 1.1, 4), closed: true });
  return paths;
}`,
  },

  // 75. Sitemap: E-Commerce Catalog Grid
  {
    id: 'sitemap-product-catalog',
    name: "Sitemap: E-Commerce Catalog Grid",
    category: 'Flow & Diagrams',
    description: "Faceted filter sidebar, sort bar, and responsive e-commerce product card matrix.",
    iconName: 'ShoppingBag',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle product columns (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Product Catalog" },
      { key: 'sidebarRatio', label: "Filter Sidebar Width", type: 'number', min: 0.18, max: 0.42, step: 0.01, defaultValue: 0.26 },
      { key: 'cols', label: "Product Columns", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Product Catalog", sidebarRatio: 0.26, cols: 3 },
    jsSourceCode: `// Sitemap: E-Commerce Catalog Grid (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.sidebarRatio) || 0.26, 0.18, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.cols) || 3, 2, 4));
  const t1 = (v1 - 0.18) / Math.max(0.001, 0.24);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'sidebarRatio', label: \`Filter: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'cols', label: \`Product: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'sidebarRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.18, 0.42, t);
    return { ...params, sidebarRatio: Number(val.toFixed(2)) };
  }
  if (id === 'cols') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, cols: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.cols) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, cols: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.sidebarRatio) || 0.26, 0.18, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.cols) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const navH = height * 0.14;
  const sideW = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: navH }, { x: width, y: navH }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: sideW, y: navH }, { x: sideW, y: height }], false), closed: false });
  for (let f = 0; f < 3; f++) {
    paths.push({ nodes: helpers.rectPath(pad * 0.6, navH + pad + f * height * 0.22, sideW - pad * 1.2, height * 0.14, 2), closed: true });
  }
  const gridX = sideW + pad * 0.8;
  const gridW = width - gridX - pad * 0.8;
  const cw = (gridW - (v2 - 1) * 5) / v2;
  const ch = (height - navH - pad * 2.2) / 2;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < v2; c++) {
      paths.push({ nodes: helpers.rectPath(gridX + c * (cw + 5), navH + pad * 0.7 + r * (ch + 5), cw, ch, 2), closed: true });
    }
  }
  return paths;
}`,
  },

  // 76. Sitemap: Shopping Cart Slide-Over
  {
    id: 'sitemap-cart-drawer',
    name: "Sitemap: Shopping Cart Slide-Over",
    category: 'Flow & Diagrams',
    description: "Page backdrop with right slide-over shopping cart drawer, line items, and sticky checkout CTA.",
    iconName: 'ShoppingCart',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle cart line items (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Cart Drawer" },
      { key: 'drawerWidth', label: "Cart Drawer Width", type: 'number', min: 0.3, max: 0.65, step: 0.01, defaultValue: 0.44 },
      { key: 'items', label: "Cart Line Items", type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Cart Drawer", drawerWidth: 0.44, items: 3 },
    jsSourceCode: `// Sitemap: Shopping Cart Slide-Over (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.drawerWidth) || 0.44, 0.3, 0.65);
  const v2 = Math.round(helpers.clamp(Number(params.items) || 3, 2, 5));
  const t1 = (v1 - 0.3) / Math.max(0.001, 0.35000000000000003);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'drawerWidth', label: \`Cart: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'items', label: \`Cart: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'drawerWidth') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.3, 0.65, t);
    return { ...params, drawerWidth: Number(val.toFixed(2)) };
  }
  if (id === 'items') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, items: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.items) || 3);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, items: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.drawerWidth) || 0.44, 0.3, 0.65);
  const v2 = Math.round(helpers.clamp(Number(params.items) || 3, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const drawW = width * v1;
  const drawX = width - drawW;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: drawX, y: 0 }, { x: drawX, y: height }], false), closed: false });
  paths.push({ nodes: helpers.rectPath(pad, pad, drawX - pad * 2, height * 0.35, 3), closed: true });
  const rowH = (height * 0.68) / v2;
  for (let i = 0; i < v2; i++) {
    const ry = pad + i * rowH;
    paths.push({ nodes: helpers.rectPath(drawX + pad * 0.6, ry, drawW - pad * 1.2, rowH * 0.78, 2), closed: true });
  }
  paths.push({ nodes: helpers.rectPath(drawX + pad * 0.6, height - pad * 2.2, drawW - pad * 1.2, pad * 1.5, 4), closed: true });
  return paths;
}`,
  },

  // 77. Sitemap: Order Confirmation Receipt
  {
    id: 'sitemap-order-confirmation',
    name: "Sitemap: Order Confirmation Receipt",
    category: 'Flow & Diagrams',
    description: "Post-checkout confirmation page with verified checkmark badge, receipt rows, and tracking map.",
    iconName: 'CheckCircle2',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle receipt items (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Order Confirmed" },
      { key: 'badgeRatio', label: "Badge Header Ratio", type: 'number', min: 0.18, max: 0.42, step: 0.01, defaultValue: 0.28 },
      { key: 'rows', label: "Receipt Items", type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Order Confirmed", badgeRatio: 0.28, rows: 3 },
    jsSourceCode: `// Sitemap: Order Confirmation Receipt (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.badgeRatio) || 0.28, 0.18, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.rows) || 3, 2, 5));
  const t1 = (v1 - 0.18) / Math.max(0.001, 0.24);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'badgeRatio', label: \`Badge: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'rows', label: \`Receipt: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'badgeRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.18, 0.42, t);
    return { ...params, badgeRatio: Number(val.toFixed(2)) };
  }
  if (id === 'rows') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, rows: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.rows) || 3);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, rows: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.badgeRatio) || 0.28, 0.18, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.rows) || 3, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const r = Math.min(width, height) * v1 * 0.45;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, pad + r, r, r), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx - r * 0.45, y: pad + r }, { x: cx - r * 0.1, y: pad + r * 1.35 }, { x: cx + r * 0.5, y: pad + r * 0.65 }], false), closed: false });
  const listTop = pad * 1.8 + r * 2;
  const rowH = (height - listTop - pad * 2.5) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(pad * 1.5, listTop + i * rowH, width - pad * 3, rowH * 0.72, 2), closed: true });
  }
  paths.push({ nodes: helpers.rectPath(width * 0.28, height - pad * 2, width * 0.44, pad * 1.3, 4), closed: true });
  return paths;
}`,
  },

  // 78. Sitemap: Account Settings Vertical Tabs
  {
    id: 'sitemap-user-settings-tabs',
    name: "Sitemap: Account Settings Vertical Tabs",
    category: 'Flow & Diagrams',
    description: "Left vertical navigation pill rail with right account settings form fields and save bar.",
    iconName: 'Sliders',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle vertical tabs (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Account Settings" },
      { key: 'railRatio', label: "Tab Rail Width", type: 'number', min: 0.2, max: 0.45, step: 0.01, defaultValue: 0.3 },
      { key: 'tabs', label: "Vertical Tabs", type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Account Settings", railRatio: 0.3, tabs: 4 },
    jsSourceCode: `// Sitemap: Account Settings Vertical Tabs (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.railRatio) || 0.3, 0.2, 0.45);
  const v2 = Math.round(helpers.clamp(Number(params.tabs) || 4, 3, 6));
  const t1 = (v1 - 0.2) / Math.max(0.001, 0.25);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'railRatio', label: \`Tab: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'tabs', label: \`Vertical: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'railRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.2, 0.45, t);
    return { ...params, railRatio: Number(val.toFixed(2)) };
  }
  if (id === 'tabs') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, tabs: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.tabs) || 4);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, tabs: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.railRatio) || 0.3, 0.2, 0.45);
  const v2 = Math.round(helpers.clamp(Number(params.tabs) || 4, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const railW = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: railW, y: 0 }, { x: railW, y: height }], false), closed: false });
  const tabH = (height - pad * 2) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(pad * 0.6, pad + i * tabH, railW - pad * 1.2, tabH * 0.72, 3), closed: true });
  }
  const fx = railW + pad;
  const fw = width - fx - pad;
  paths.push({ nodes: helpers.rectPath(fx, pad, fw, height * 0.22, 2), closed: true });
  paths.push({ nodes: helpers.rectPath(fx, pad + height * 0.28, fw, height * 0.22, 2), closed: true });
  paths.push({ nodes: helpers.rectPath(width - pad - fw * 0.42, height - pad * 2.2, fw * 0.42, pad * 1.4, 4), closed: true });
  return paths;
}`,
  },

  // 79. Sitemap: Billing & Invoice Portal
  {
    id: 'sitemap-billing-subscription',
    name: "Sitemap: Billing & Invoice Portal",
    category: 'Flow & Diagrams',
    description: "Subscription usage meter bar, payment method card with EMV chip, and downloadable invoice table.",
    iconName: 'CreditCard',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle invoice rows (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Billing & Plan" },
      { key: 'usageRatio', label: "Quota Fill Ratio", type: 'number', min: 0.15, max: 0.92, step: 0.01, defaultValue: 0.68 },
      { key: 'invoices', label: "Invoice Rows", type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Billing & Plan", usageRatio: 0.68, invoices: 3 },
    jsSourceCode: `// Sitemap: Billing & Invoice Portal (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.usageRatio) || 0.68, 0.15, 0.92);
  const v2 = Math.round(helpers.clamp(Number(params.invoices) || 3, 2, 5));
  const t1 = (v1 - 0.15) / Math.max(0.001, 0.77);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'usageRatio', label: \`Quota: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'invoices', label: \`Invoice: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'usageRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.15, 0.92, t);
    return { ...params, usageRatio: Number(val.toFixed(2)) };
  }
  if (id === 'invoices') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, invoices: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.invoices) || 3);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, invoices: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.usageRatio) || 0.68, 0.15, 0.92);
  const v2 = Math.round(helpers.clamp(Number(params.invoices) || 3, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  const barY = pad * 1.2;
  const barH = height * 0.12;
  paths.push({ nodes: helpers.rectPath(pad, barY, width - pad * 2, barH, barH / 2), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, barY, (width - pad * 2) * v1, barH, barH / 2), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, barY + barH + pad * 0.7, width * 0.44, height * 0.26, 4), closed: true });
  const tblTop = barY + barH + height * 0.34;
  const rh = (height - tblTop - pad) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(pad, tblTop + i * rh, width - pad * 2, rh * 0.74, 2), closed: true });
  }
  return paths;
}`,
  },

  // 80. Sitemap: Team & Role Management
  {
    id: 'sitemap-team-org-members',
    name: "Sitemap: Team & Role Management",
    category: 'Flow & Diagrams',
    description: "Organization directory with invite bar, member avatar rows, and RBAC role badge pills.",
    iconName: 'Users',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle member rows (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Team Members" },
      { key: 'avatarCol', label: "Member Column Split", type: 'number', min: 0.45, max: 0.78, step: 0.01, defaultValue: 0.62 },
      { key: 'members', label: "Member Rows", type: 'number', min: 2, max: 5, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Team Members", avatarCol: 0.62, members: 4 },
    jsSourceCode: `// Sitemap: Team & Role Management (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.avatarCol) || 0.62, 0.45, 0.78);
  const v2 = Math.round(helpers.clamp(Number(params.members) || 4, 2, 5));
  const t1 = (v1 - 0.45) / Math.max(0.001, 0.33);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'avatarCol', label: \`Member: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'members', label: \`Member: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'avatarCol') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.45, 0.78, t);
    return { ...params, avatarCol: Number(val.toFixed(2)) };
  }
  if (id === 'members') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, members: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.members) || 4);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, members: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.avatarCol) || 0.62, 0.45, 0.78);
  const v2 = Math.round(helpers.clamp(Number(params.members) || 4, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  const topH = height * 0.16;
  paths.push({ nodes: helpers.rectPath(pad, pad * 0.7, width - pad * 2, topH, 3), closed: true });
  const startY = topH + pad * 1.5;
  const rowH = (height - startY - pad * 0.8) / v2;
  const splitX = width * v1;
  for (let i = 0; i < v2; i++) {
    const y = startY + i * rowH;
    const r = Math.min(rowH * 0.34, 9);
    paths.push({ nodes: helpers.ellipsePath(pad + r + 2, y + rowH * 0.4, r, r), closed: true });
    paths.push({ nodes: helpers.polygonPath([{ x: pad + r * 2.6, y: y + rowH * 0.4 }, { x: splitX, y: y + rowH * 0.4 }], false), closed: false });
    paths.push({ nodes: helpers.rectPath(splitX + 6, y + rowH * 0.16, width - splitX - pad - 6, rowH * 0.5, 4), closed: true });
  }
  return paths;
}`,
  },

  // 81. Sitemap: Developer API Keys Page
  {
    id: 'sitemap-api-keys-portal',
    name: "Sitemap: Developer API Keys Page",
    category: 'Flow & Diagrams',
    description: "Secret token generator bar, scope permission checkboxes, and API request volume sparkline.",
    iconName: 'KeyRound',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle scope checkboxes (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "API Keys Portal" },
      { key: 'chartHeight', label: "Sparkline Height", type: 'number', min: 0.18, max: 0.42, step: 0.01, defaultValue: 0.26 },
      { key: 'scopes', label: "Scope Checkboxes", type: 'number', min: 2, max: 5, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "API Keys Portal", chartHeight: 0.26, scopes: 4 },
    jsSourceCode: `// Sitemap: Developer API Keys Page (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.chartHeight) || 0.26, 0.18, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.scopes) || 4, 2, 5));
  const t1 = (v1 - 0.18) / Math.max(0.001, 0.24);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'chartHeight', label: \`Sparkline: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'scopes', label: \`Scope: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'chartHeight') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.18, 0.42, t);
    return { ...params, chartHeight: Number(val.toFixed(2)) };
  }
  if (id === 'scopes') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, scopes: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.scopes) || 4);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, scopes: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.chartHeight) || 0.26, 0.18, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.scopes) || 4, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, pad, width - pad * 2, height * 0.18, 3), closed: true });
  const cbY = pad * 1.8 + height * 0.18;
  const cbW = (width - pad * 2) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(pad + i * cbW + 2, cbY, Math.min(14, cbW * 0.35), height * 0.12, 2), closed: true });
  }
  const chH = height * v1;
  const chY = height - chH - pad;
  paths.push({ nodes: helpers.rectPath(pad, chY, width - pad * 2, chH, 2), closed: true });
  const wave = [];
  for (let s = 0; s <= 6; s++) {
    wave.push({ x: pad + ((width - pad * 2) * s) / 6, y: chY + chH * (s % 2 === 0 ? 0.75 : 0.25) });
  }
  paths.push({ nodes: helpers.polygonPath(wave, false), closed: false });
  return paths;
}`,
  },

  // 82. Sitemap: Security Audit Log Stream
  {
    id: 'sitemap-audit-log-viewer',
    name: "Sitemap: Security Audit Log Stream",
    category: 'Flow & Diagrams',
    description: "Chronological security event stream with filter header, timeline spine, and JSON payload inspector.",
    iconName: 'ShieldAlert',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle audit event rows (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Security Audit Log" },
      { key: 'inspectorRatio', label: "JSON Pane Width", type: 'number', min: 0.22, max: 0.5, step: 0.01, defaultValue: 0.34 },
      { key: 'events', label: "Audit Event Rows", type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Security Audit Log", inspectorRatio: 0.34, events: 4 },
    jsSourceCode: `// Sitemap: Security Audit Log Stream (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.inspectorRatio) || 0.34, 0.22, 0.5);
  const v2 = Math.round(helpers.clamp(Number(params.events) || 4, 3, 6));
  const t1 = (v1 - 0.22) / Math.max(0.001, 0.28);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'inspectorRatio', label: \`JSON: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'events', label: \`Audit: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'inspectorRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.22, 0.5, t);
    return { ...params, inspectorRatio: Number(val.toFixed(2)) };
  }
  if (id === 'events') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, events: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.events) || 4);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, events: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.inspectorRatio) || 0.34, 0.22, 0.5);
  const v2 = Math.round(helpers.clamp(Number(params.events) || 4, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const paneX = width * (1 - v1);
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: paneX, y: 0 }, { x: paneX, y: height }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: pad * 1.4, y: pad }, { x: pad * 1.4, y: height - pad }], false), closed: false });
  const rh = (height - pad * 2) / v2;
  for (let i = 0; i < v2; i++) {
    const cyRow = pad + (i + 0.5) * rh;
    paths.push({ nodes: helpers.ellipsePath(pad * 1.4, cyRow, 3.5, 3.5), closed: true });
    paths.push({ nodes: helpers.rectPath(pad * 2.3, cyRow - rh * 0.3, paneX - pad * 3, rh * 0.6, 2), closed: true });
  }
  paths.push({ nodes: helpers.rectPath(paneX + 5, pad, width - paneX - 10, height - pad * 2, 2), closed: true });
  return paths;
}`,
  },

  // 83. Sitemap: Notification Inbox Page
  {
    id: 'sitemap-notification-center',
    name: "Sitemap: Notification Inbox Page",
    category: 'Flow & Diagrams',
    description: "Unread/All segmented filter bar with status-dot notification cards and action buttons.",
    iconName: 'Bell',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle notification cards (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Notifications" },
      { key: 'cardPad', label: "Content Inset Ratio", type: 'number', min: 0.06, max: 0.22, step: 0.01, defaultValue: 0.1 },
      { key: 'cards', label: "Notification Cards", type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Notifications", cardPad: 0.1, cards: 3 },
    jsSourceCode: `// Sitemap: Notification Inbox Page (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.cardPad) || 0.1, 0.06, 0.22);
  const v2 = Math.round(helpers.clamp(Number(params.cards) || 3, 2, 5));
  const t1 = (v1 - 0.06) / Math.max(0.001, 0.16);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'cardPad', label: \`Content: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'cards', label: \`Notification: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'cardPad') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.06, 0.22, t);
    return { ...params, cardPad: Number(val.toFixed(2)) };
  }
  if (id === 'cards') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, cards: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.cards) || 3);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, cards: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.cardPad) || 0.1, 0.06, 0.22);
  const v2 = Math.round(helpers.clamp(Number(params.cards) || 3, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const inPad = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.rectPath(inPad, pad * 0.8, width - inPad * 2, height * 0.14, 4), closed: true });
  const topY = height * 0.26;
  const ch = (height - topY - pad) / v2;
  for (let i = 0; i < v2; i++) {
    const y = topY + i * ch;
    paths.push({ nodes: helpers.rectPath(inPad, y, width - inPad * 2, ch * 0.78, 3), closed: true });
    paths.push({ nodes: helpers.ellipsePath(inPad + 9, y + ch * 0.39, 3.5, 3.5), closed: true });
  }
  return paths;
}`,
  },

  // 84. Sitemap: Kanban Board View
  {
    id: 'sitemap-kanban-workspace',
    name: "Sitemap: Kanban Board View",
    category: 'Flow & Diagrams',
    description: "Multi-column agile project board with swimlane headers and stacked draggable task cards.",
    iconName: 'Columns',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle kanban swimlanes (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Kanban Workspace" },
      { key: 'headerRatio', label: "Toolbar Height", type: 'number', min: 0.12, max: 0.28, step: 0.01, defaultValue: 0.18 },
      { key: 'lanes', label: "Kanban Swimlanes", type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Kanban Workspace", headerRatio: 0.18, lanes: 3 },
    jsSourceCode: `// Sitemap: Kanban Board View (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.headerRatio) || 0.18, 0.12, 0.28);
  const v2 = Math.round(helpers.clamp(Number(params.lanes) || 3, 2, 5));
  const t1 = (v1 - 0.12) / Math.max(0.001, 0.16000000000000003);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'headerRatio', label: \`Toolbar: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'lanes', label: \`Kanban: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'headerRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.12, 0.28, t);
    return { ...params, headerRatio: Number(val.toFixed(2)) };
  }
  if (id === 'lanes') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, lanes: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.lanes) || 3);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, lanes: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.headerRatio) || 0.18, 0.12, 0.28);
  const v2 = Math.round(helpers.clamp(Number(params.lanes) || 3, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const topH = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: topH }, { x: width, y: topH }], false), closed: false });
  const gap = 5;
  const lw = (width - pad * 2 - (v2 - 1) * gap) / v2;
  const lh = height - topH - pad * 1.4;
  for (let i = 0; i < v2; i++) {
    const lx = pad + i * (lw + gap);
    const ly = topH + pad * 0.7;
    paths.push({ nodes: helpers.rectPath(lx, ly, lw, lh, 3), closed: true });
    const cards = (i % 2) + 2;
    for (let k = 0; k < cards; k++) {
      paths.push({ nodes: helpers.rectPath(lx + 3, ly + 6 + k * (lh * 0.28), lw - 6, lh * 0.22, 2), closed: true });
    }
  }
  return paths;
}`,
  },

  // 85. Sitemap: Calendar & Booking Page
  {
    id: 'sitemap-calendar-scheduler',
    name: "Sitemap: Calendar & Booking Page",
    category: 'Flow & Diagrams',
    description: "Monthly date grid matrix paired with right-hand available time-slot booking column.",
    iconName: 'Calendar',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle calendar weeks (3-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Booking Calendar" },
      { key: 'slotPane', label: "Time Slot Sidebar", type: 'number', min: 0.22, max: 0.46, step: 0.01, defaultValue: 0.32 },
      { key: 'weeks', label: "Calendar Weeks", type: 'number', min: 3, max: 5, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Booking Calendar", slotPane: 0.32, weeks: 4 },
    jsSourceCode: `// Sitemap: Calendar & Booking Page (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.slotPane) || 0.32, 0.22, 0.46);
  const v2 = Math.round(helpers.clamp(Number(params.weeks) || 4, 3, 5));
  const t1 = (v1 - 0.22) / Math.max(0.001, 0.24000000000000002);
  const t2 = (v2 - 3) / Math.max(1, 2);
  return [
    { id: 'slotPane', label: \`Time: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'weeks', label: \`Calendar: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'slotPane') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.22, 0.46, t);
    return { ...params, slotPane: Number(val.toFixed(2)) };
  }
  if (id === 'weeks') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, weeks: Math.round(helpers.lerp(3, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.weeks) || 4);
  const next = cur >= 5 ? 3 : cur + 1;
  return { ...params, weeks: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.slotPane) || 0.32, 0.22, 0.46);
  const v2 = Math.round(helpers.clamp(Number(params.weeks) || 4, 3, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const sideX = width * (1 - v1);
  const headH = height * 0.16;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: headH }, { x: width, y: headH }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: sideX, y: headH }, { x: sideX, y: height }], false), closed: false });
  for (let c = 1; c < 5; c++) {
    const gx = (sideX * c) / 5;
    paths.push({ nodes: helpers.polygonPath([{ x: gx, y: headH }, { x: gx, y: height }], false), closed: false });
  }
  for (let r = 1; r <= v2; r++) {
    const gy = headH + ((height - headH) * r) / (v2 + 1);
    paths.push({ nodes: helpers.polygonPath([{ x: 0, y: gy }, { x: sideX, y: gy }], false), closed: false });
  }
  for (let s = 0; s < 3; s++) {
    paths.push({ nodes: helpers.rectPath(sideX + 5, headH + 6 + s * ((height - headH - 12) / 3), width - sideX - 10, (height - headH) * 0.22, 2), closed: true });
  }
  return paths;
}`,
  },

  // 86. Sitemap: Gantt Roadmap Timeline
  {
    id: 'sitemap-gantt-roadmap',
    name: "Sitemap: Gantt Roadmap Timeline",
    category: 'Flow & Diagrams',
    description: "Left workstream list paired with staggered horizontal timeline bars and milestone diamond.",
    iconName: 'GanttChart',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle timeline bars (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Gantt Roadmap" },
      { key: 'listWidth', label: "Task Column Width", type: 'number', min: 0.2, max: 0.42, step: 0.01, defaultValue: 0.28 },
      { key: 'bars', label: "Timeline Bars", type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Gantt Roadmap", listWidth: 0.28, bars: 4 },
    jsSourceCode: `// Sitemap: Gantt Roadmap Timeline (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.listWidth) || 0.28, 0.2, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.bars) || 4, 3, 6));
  const t1 = (v1 - 0.2) / Math.max(0.001, 0.21999999999999997);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'listWidth', label: \`Task: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'bars', label: \`Timeline: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'listWidth') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.2, 0.42, t);
    return { ...params, listWidth: Number(val.toFixed(2)) };
  }
  if (id === 'bars') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, bars: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.bars) || 4);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, bars: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.listWidth) || 0.28, 0.2, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.bars) || 4, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const listW = width * v1;
  const headH = height * 0.15;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: headH }, { x: width, y: headH }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: listW, y: headH }, { x: listW, y: height }], false), closed: false });
  const rh = (height - headH - pad) / v2;
  const spanW = width - listW - pad * 1.5;
  for (let i = 0; i < v2; i++) {
    const y = headH + pad * 0.5 + i * rh;
    const bx = listW + 6 + (i * spanW * 0.16);
    const bw = Math.max(18, spanW * (0.48 - i * 0.04));
    paths.push({ nodes: helpers.rectPath(bx, y + rh * 0.18, bw, rh * 0.56, 3), closed: true });
  }
  return paths;
}`,
  },

  // 87. Sitemap: Cloud File Manager Grid
  {
    id: 'sitemap-file-manager-drive',
    name: "Sitemap: Cloud File Manager Grid",
    category: 'Flow & Diagrams',
    description: "Breadcrumb path header, tabbed folder tiles, and bottom cloud storage quota bar.",
    iconName: 'FolderKanban',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle folder tiles (2-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Cloud Drive" },
      { key: 'quotaRatio', label: "Storage Used Ratio", type: 'number', min: 0.15, max: 0.95, step: 0.01, defaultValue: 0.64 },
      { key: 'folders', label: "Folder Tiles", type: 'number', min: 2, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Cloud Drive", quotaRatio: 0.64, folders: 4 },
    jsSourceCode: `// Sitemap: Cloud File Manager Grid (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.quotaRatio) || 0.64, 0.15, 0.95);
  const v2 = Math.round(helpers.clamp(Number(params.folders) || 4, 2, 6));
  const t1 = (v1 - 0.15) / Math.max(0.001, 0.7999999999999999);
  const t2 = (v2 - 2) / Math.max(1, 4);
  return [
    { id: 'quotaRatio', label: \`Storage: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'folders', label: \`Folder: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'quotaRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.15, 0.95, t);
    return { ...params, quotaRatio: Number(val.toFixed(2)) };
  }
  if (id === 'folders') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, folders: Math.round(helpers.lerp(2, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.folders) || 4);
  const next = cur >= 6 ? 2 : cur + 1;
  return { ...params, folders: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.quotaRatio) || 0.64, 0.15, 0.95);
  const v2 = Math.round(helpers.clamp(Number(params.folders) || 4, 2, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const topH = height * 0.15;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: topH }, { x: width, y: topH }], false), closed: false });
  const cols = Math.min(3, v2);
  const rows = Math.ceil(v2 / cols);
  const fw = (width - pad * 2 - (cols - 1) * 6) / cols;
  const fh = (height * 0.62 - (rows - 1) * 6) / rows;
  for (let i = 0; i < v2; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const fx = pad + c * (fw + 6);
    const fy = topH + pad * 0.7 + r * (fh + 6);
    paths.push({ nodes: helpers.polygonPath([{ x: fx, y: fy }, { x: fx + fw * 0.4, y: fy }, { x: fx + fw * 0.48, y: fy + 5 }, { x: fx + fw, y: fy + 5 }, { x: fx + fw, y: fy + fh }, { x: fx, y: fy + fh }]), closed: true });
  }
  const qy = height - pad * 1.8;
  paths.push({ nodes: helpers.rectPath(pad, qy, width - pad * 2, 7, 3), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, qy, (width - pad * 2) * v1, 7, 3), closed: true });
  return paths;
}`,
  },

  // 88. Sitemap: Media Gallery & Lightbox
  {
    id: 'sitemap-media-gallery-lightbox',
    name: "Sitemap: Media Gallery & Lightbox",
    category: 'Flow & Diagrams',
    description: "Background thumbnail grid with central elevated lightbox modal and prev/next carousel arrows.",
    iconName: 'Image',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle backdrop grid cols (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Media Lightbox" },
      { key: 'modalScale', label: "Lightbox Scale", type: 'number', min: 0.45, max: 0.82, step: 0.01, defaultValue: 0.64 },
      { key: 'cols', label: "Backdrop Grid Cols", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Media Lightbox", modalScale: 0.64, cols: 3 },
    jsSourceCode: `// Sitemap: Media Gallery & Lightbox (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.modalScale) || 0.64, 0.45, 0.82);
  const v2 = Math.round(helpers.clamp(Number(params.cols) || 3, 2, 4));
  const t1 = (v1 - 0.45) / Math.max(0.001, 0.36999999999999994);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'modalScale', label: \`Lightbox: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'cols', label: \`Backdrop: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'modalScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.45, 0.82, t);
    return { ...params, modalScale: Number(val.toFixed(2)) };
  }
  if (id === 'cols') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, cols: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.cols) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, cols: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.modalScale) || 0.64, 0.45, 0.82);
  const v2 = Math.round(helpers.clamp(Number(params.cols) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  const tw = (width - pad * 2 - (v2 - 1) * 5) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(pad + i * (tw + 5), pad, tw, height * 0.25, 2), closed: true });
  }
  const mw = width * v1;
  const mh = height * v1;
  const mx = (width - mw) / 2;
  const my = (height - mh) / 2;
  paths.push({ nodes: helpers.rectPath(mx, my, mw, mh, 4), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: mx - 8, y: cy }, { x: mx - 2, y: cy - 5 }, { x: mx - 2, y: cy + 5 }]), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: mx + mw + 8, y: cy }, { x: mx + mw + 2, y: cy - 5 }, { x: mx + mw + 2, y: cy + 5 }]), closed: true });
  return paths;
}`,
  },

  // 89. Sitemap: LMS Video Course Player
  {
    id: 'sitemap-video-course-player',
    name: "Sitemap: LMS Video Course Player",
    category: 'Flow & Diagrams',
    description: "16:9 video player stage with play button, progress scrubber, and right chapter curriculum list.",
    iconName: 'PlaySquare',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle chapter lessons (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Video Course LMS" },
      { key: 'stageWidth', label: "Video Stage Width", type: 'number', min: 0.5, max: 0.78, step: 0.01, defaultValue: 0.65 },
      { key: 'chapters', label: "Chapter Lessons", type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Video Course LMS", stageWidth: 0.65, chapters: 4 },
    jsSourceCode: `// Sitemap: LMS Video Course Player (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.stageWidth) || 0.65, 0.5, 0.78);
  const v2 = Math.round(helpers.clamp(Number(params.chapters) || 4, 3, 6));
  const t1 = (v1 - 0.5) / Math.max(0.001, 0.28);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'stageWidth', label: \`Video: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'chapters', label: \`Chapter: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'stageWidth') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.5, 0.78, t);
    return { ...params, stageWidth: Number(val.toFixed(2)) };
  }
  if (id === 'chapters') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, chapters: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.chapters) || 4);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, chapters: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.stageWidth) || 0.65, 0.5, 0.78);
  const v2 = Math.round(helpers.clamp(Number(params.chapters) || 4, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const stageW = (width - pad * 2.5) * v1;
  const stageH = height * 0.64;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, pad, stageW, stageH, 3), closed: true });
  const scx = pad + stageW / 2;
  const scy = pad + stageH / 2;
  paths.push({ nodes: helpers.polygonPath([{ x: scx - 7, y: scy - 9 }, { x: scx + 10, y: scy }, { x: scx - 7, y: scy + 9 }]), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, pad + stageH + 6, stageW, height - stageH - pad * 2 - 6, 2), closed: true });
  const lx = pad * 1.6 + stageW;
  const lw = width - lx - pad;
  const chH = (height - pad * 2) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(lx, pad + i * chH, lw, chH * 0.76, 2), closed: true });
  }
  return paths;
}`,
  },

  // 90. Sitemap: Podcast & Audio Feed
  {
    id: 'sitemap-podcast-audio-hub',
    name: "Sitemap: Podcast & Audio Feed",
    category: 'Flow & Diagrams',
    description: "Show cover art, multi-bar acoustic waveform scrubber, and playable episode feed rows.",
    iconName: 'Mic',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle episode rows (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Podcast Hub" },
      { key: 'playerHeight', label: "Audio Player Ratio", type: 'number', min: 0.26, max: 0.5, step: 0.01, defaultValue: 0.36 },
      { key: 'episodes', label: "Episode Rows", type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Podcast Hub", playerHeight: 0.36, episodes: 3 },
    jsSourceCode: `// Sitemap: Podcast & Audio Feed (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.playerHeight) || 0.36, 0.26, 0.5);
  const v2 = Math.round(helpers.clamp(Number(params.episodes) || 3, 2, 5));
  const t1 = (v1 - 0.26) / Math.max(0.001, 0.24);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'playerHeight', label: \`Audio: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'episodes', label: \`Episode: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'playerHeight') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.26, 0.5, t);
    return { ...params, playerHeight: Number(val.toFixed(2)) };
  }
  if (id === 'episodes') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, episodes: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.episodes) || 3);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, episodes: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.playerHeight) || 0.36, 0.26, 0.5);
  const v2 = Math.round(helpers.clamp(Number(params.episodes) || 3, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const ph = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, pad, ph, ph, 3), closed: true });
  const wx = pad * 1.8 + ph;
  const ww = width - wx - pad;
  for (let b = 0; b < 7; b++) {
    const bx = wx + (b * ww) / 7;
    const bh = ph * (b % 2 === 0 ? 0.72 : 0.38);
    paths.push({ nodes: helpers.rectPath(bx, pad + (ph - bh) / 2, Math.max(3, ww / 11), bh, 1), closed: true });
  }
  const listY = pad * 1.8 + ph;
  const rh = (height - listY - pad) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(pad, listY + i * rh, width - pad * 2, rh * 0.74, 2), closed: true });
  }
  return paths;
}`,
  },

  // 91. Sitemap: Community Forum Thread
  {
    id: 'sitemap-forum-thread-page',
    name: "Sitemap: Community Forum Thread",
    category: 'Flow & Diagrams',
    description: "Original discussion post followed by progressively indented nested reply tree and composer.",
    iconName: 'MessageSquare',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle nested replies (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Forum Thread" },
      { key: 'indentStep', label: "Tree Indent Ratio", type: 'number', min: 0.05, max: 0.16, step: 0.01, defaultValue: 0.09 },
      { key: 'replies', label: "Nested Replies", type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Forum Thread", indentStep: 0.09, replies: 3 },
    jsSourceCode: `// Sitemap: Community Forum Thread (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.indentStep) || 0.09, 0.05, 0.16);
  const v2 = Math.round(helpers.clamp(Number(params.replies) || 3, 2, 5));
  const t1 = (v1 - 0.05) / Math.max(0.001, 0.11);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'indentStep', label: \`Tree: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'replies', label: \`Nested: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'indentStep') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.05, 0.16, t);
    return { ...params, indentStep: Number(val.toFixed(2)) };
  }
  if (id === 'replies') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, replies: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.replies) || 3);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, replies: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.indentStep) || 0.09, 0.05, 0.16);
  const v2 = Math.round(helpers.clamp(Number(params.replies) || 3, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const step = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, pad, width - pad * 2, height * 0.24, 3), closed: true });
  const startY = pad * 1.6 + height * 0.24;
  const rh = (height - startY - pad) / v2;
  for (let i = 0; i < v2; i++) {
    const inX = pad + (i + 1) * step;
    const y = startY + i * rh;
    paths.push({ nodes: helpers.polygonPath([{ x: inX - step * 0.5, y: y - rh * 0.2 }, { x: inX - step * 0.5, y: y + rh * 0.38 }, { x: inX, y: y + rh * 0.38 }], false), closed: false });
    paths.push({ nodes: helpers.rectPath(inX, y, Math.max(24, width - inX - pad), rh * 0.74, 2), closed: true });
  }
  return paths;
}`,
  },

  // 92. Sitemap: Support Ticket Conversation
  {
    id: 'sitemap-help-ticket-desk',
    name: "Sitemap: Support Ticket Conversation",
    category: 'Flow & Diagrams',
    description: "Alternating customer/agent chat bubbles with reply composer and right SLA metadata sidebar.",
    iconName: 'LifeBuoy',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle chat bubbles (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Support Ticket" },
      { key: 'metaWidth', label: "Metadata Sidebar", type: 'number', min: 0.22, max: 0.44, step: 0.01, defaultValue: 0.3 },
      { key: 'messages', label: "Chat Bubbles", type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Support Ticket", metaWidth: 0.3, messages: 3 },
    jsSourceCode: `// Sitemap: Support Ticket Conversation (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.metaWidth) || 0.3, 0.22, 0.44);
  const v2 = Math.round(helpers.clamp(Number(params.messages) || 3, 2, 5));
  const t1 = (v1 - 0.22) / Math.max(0.001, 0.22);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'metaWidth', label: \`Metadata: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'messages', label: \`Chat: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'metaWidth') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.22, 0.44, t);
    return { ...params, metaWidth: Number(val.toFixed(2)) };
  }
  if (id === 'messages') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, messages: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.messages) || 3);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, messages: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.metaWidth) || 0.3, 0.22, 0.44);
  const v2 = Math.round(helpers.clamp(Number(params.messages) || 3, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const sideX = width * (1 - v1);
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: sideX, y: 0 }, { x: sideX, y: height }], false), closed: false });
  const bh = (height * 0.72) / v2;
  for (let i = 0; i < v2; i++) {
    const isAgent = i % 2 === 1;
    const bw = (sideX - pad * 2) * 0.74;
    const bx = isAgent ? sideX - pad - bw : pad;
    paths.push({ nodes: helpers.rectPath(bx, pad + i * bh, bw, bh * 0.74, 5), closed: true });
  }
  paths.push({ nodes: helpers.rectPath(pad, height - pad * 2, sideX - pad * 2, pad * 1.3, 3), closed: true });
  paths.push({ nodes: helpers.rectPath(sideX + 5, pad, width - sideX - 10, height * 0.45, 2), closed: true });
  return paths;
}`,
  },

  // 93. Sitemap: System Uptime Status Page
  {
    id: 'sitemap-status-uptime-page',
    name: "Sitemap: System Uptime Status Page",
    category: 'Flow & Diagrams',
    description: "All-systems-operational banner with multi-service 90-day vertical uptime tick strips.",
    iconName: 'Activity',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle monitored services (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "System Status" },
      { key: 'bannerHeight', label: "Status Banner Ratio", type: 'number', min: 0.16, max: 0.34, step: 0.01, defaultValue: 0.22 },
      { key: 'services', label: "Monitored Services", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "System Status", bannerHeight: 0.22, services: 3 },
    jsSourceCode: `// Sitemap: System Uptime Status Page (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.bannerHeight) || 0.22, 0.16, 0.34);
  const v2 = Math.round(helpers.clamp(Number(params.services) || 3, 2, 4));
  const t1 = (v1 - 0.16) / Math.max(0.001, 0.18000000000000002);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'bannerHeight', label: \`Status: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'services', label: \`Monitored: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'bannerHeight') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.16, 0.34, t);
    return { ...params, bannerHeight: Number(val.toFixed(2)) };
  }
  if (id === 'services') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, services: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.services) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, services: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.bannerHeight) || 0.22, 0.16, 0.34);
  const v2 = Math.round(helpers.clamp(Number(params.services) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const banH = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, pad, width - pad * 2, banH, 4), closed: true });
  const sy = pad * 1.8 + banH;
  const sh = (height - sy - pad) / v2;
  for (let i = 0; i < v2; i++) {
    const y = sy + i * sh;
    paths.push({ nodes: helpers.rectPath(pad, y, width - pad * 2, sh * 0.75, 2), closed: true });
    for (let t = 0; t < 8; t++) {
      const tx = pad * 1.8 + (t * (width - pad * 3.6)) / 8;
      paths.push({ nodes: helpers.polygonPath([{ x: tx, y: y + sh * 0.16 }, { x: tx, y: y + sh * 0.58 }], false), closed: false });
    }
  }
  return paths;
}`,
  },

  // 94. Sitemap: Product Changelog Timeline
  {
    id: 'sitemap-changelog-release',
    name: "Sitemap: Product Changelog Timeline",
    category: 'Flow & Diagrams',
    description: "Vertical release timeline spine with version tag nodes and feature announcement cards.",
    iconName: 'GitCommit',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle release entries (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Changelog Feed" },
      { key: 'spineX', label: "Timeline Spine X", type: 'number', min: 0.18, max: 0.4, step: 0.01, defaultValue: 0.26 },
      { key: 'releases', label: "Release Entries", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Changelog Feed", spineX: 0.26, releases: 3 },
    jsSourceCode: `// Sitemap: Product Changelog Timeline (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.spineX) || 0.26, 0.18, 0.4);
  const v2 = Math.round(helpers.clamp(Number(params.releases) || 3, 2, 4));
  const t1 = (v1 - 0.18) / Math.max(0.001, 0.22000000000000003);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'spineX', label: \`Timeline: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'releases', label: \`Release: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'spineX') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.18, 0.4, t);
    return { ...params, spineX: Number(val.toFixed(2)) };
  }
  if (id === 'releases') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, releases: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.releases) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, releases: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.spineX) || 0.26, 0.18, 0.4);
  const v2 = Math.round(helpers.clamp(Number(params.releases) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const sx = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: sx, y: pad }, { x: sx, y: height - pad }], false), closed: false });
  const rh = (height - pad * 2) / v2;
  for (let i = 0; i < v2; i++) {
    const ny = pad + (i + 0.5) * rh;
    paths.push({ nodes: helpers.ellipsePath(sx, ny, 4.5, 4.5), closed: true });
    paths.push({ nodes: helpers.rectPath(pad * 0.7, ny - 5, sx - pad * 1.4, 10, 3), closed: true });
    paths.push({ nodes: helpers.rectPath(sx + 8, ny - rh * 0.36, width - sx - pad - 8, rh * 0.72, 2), closed: true });
  }
  return paths;
}`,
  },

  // 95. Sitemap: Careers & Job Board
  {
    id: 'sitemap-careers-job-board',
    name: "Sitemap: Careers & Job Board",
    category: 'Flow & Diagrams',
    description: "Company culture banner, department filter pills, and open role listings with Apply buttons.",
    iconName: 'Briefcase',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle job openings (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Careers Board" },
      { key: 'heroRatio', label: "Culture Hero Ratio", type: 'number', min: 0.18, max: 0.38, step: 0.01, defaultValue: 0.25 },
      { key: 'jobs', label: "Job Openings", type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Careers Board", heroRatio: 0.25, jobs: 3 },
    jsSourceCode: `// Sitemap: Careers & Job Board (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.heroRatio) || 0.25, 0.18, 0.38);
  const v2 = Math.round(helpers.clamp(Number(params.jobs) || 3, 2, 5));
  const t1 = (v1 - 0.18) / Math.max(0.001, 0.2);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'heroRatio', label: \`Culture: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'jobs', label: \`Job: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'heroRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.18, 0.38, t);
    return { ...params, heroRatio: Number(val.toFixed(2)) };
  }
  if (id === 'jobs') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, jobs: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.jobs) || 3);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, jobs: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.heroRatio) || 0.25, 0.18, 0.38);
  const v2 = Math.round(helpers.clamp(Number(params.jobs) || 3, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const hh = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, pad, width - pad * 2, hh, 3), closed: true });
  const listY = pad * 1.8 + hh;
  const rh = (height - listY - pad) / v2;
  for (let i = 0; i < v2; i++) {
    const y = listY + i * rh;
    paths.push({ nodes: helpers.rectPath(pad, y, width - pad * 2, rh * 0.76, 2), closed: true });
    paths.push({ nodes: helpers.rectPath(width - pad * 1.6 - 24, y + rh * 0.16, 24, rh * 0.44, 3), closed: true });
  }
  return paths;
}`,
  },

  // 96. Sitemap: Job Application Resume Drop
  {
    id: 'sitemap-job-application-form',
    name: "Sitemap: Job Application Resume Drop",
    category: 'Flow & Diagrams',
    description: "Candidate form fields with central bracketed drag-and-drop resume upload zone.",
    iconName: 'FileUp',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle input fields (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Job Application" },
      { key: 'dropHeight', label: "Upload Zone Height", type: 'number', min: 0.22, max: 0.48, step: 0.01, defaultValue: 0.34 },
      { key: 'fields', label: "Input Fields", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Job Application", dropHeight: 0.34, fields: 3 },
    jsSourceCode: `// Sitemap: Job Application Resume Drop (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.dropHeight) || 0.34, 0.22, 0.48);
  const v2 = Math.round(helpers.clamp(Number(params.fields) || 3, 2, 4));
  const t1 = (v1 - 0.22) / Math.max(0.001, 0.26);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'dropHeight', label: \`Upload: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'fields', label: \`Input: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'dropHeight') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.22, 0.48, t);
    return { ...params, dropHeight: Number(val.toFixed(2)) };
  }
  if (id === 'fields') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, fields: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.fields) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, fields: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.dropHeight) || 0.34, 0.22, 0.48);
  const v2 = Math.round(helpers.clamp(Number(params.fields) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const dh = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  const dy = pad * 1.2;
  paths.push({ nodes: helpers.rectPath(pad, dy, width - pad * 2, dh, 4), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: dy + dh * 0.75 }, { x: cx, y: dy + dh * 0.25 }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: cx - 6, y: dy + dh * 0.45 }, { x: cx, y: dy + dh * 0.22 }, { x: cx + 6, y: dy + dh * 0.45 }], false), closed: false });
  const fy = dy + dh + pad * 0.8;
  const fh = (height - fy - pad) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(pad, fy + i * fh, width - pad * 2, fh * 0.7, 2), closed: true });
  }
  return paths;
}`,
  },

  // 97. Sitemap: Press & Brand Asset Kit
  {
    id: 'sitemap-press-media-kit',
    name: "Sitemap: Press & Brand Asset Kit",
    category: 'Flow & Diagrams',
    description: "Press release headlines paired with downloadable brand logo and color swatch cards.",
    iconName: 'Newspaper',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle asset swatch cards (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Press & Media Kit" },
      { key: 'splitY', label: "Section Split Y", type: 'number', min: 0.35, max: 0.65, step: 0.01, defaultValue: 0.48 },
      { key: 'swatches', label: "Asset Swatch Cards", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Press & Media Kit", splitY: 0.48, swatches: 3 },
    jsSourceCode: `// Sitemap: Press & Brand Asset Kit (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.splitY) || 0.48, 0.35, 0.65);
  const v2 = Math.round(helpers.clamp(Number(params.swatches) || 3, 2, 4));
  const t1 = (v1 - 0.35) / Math.max(0.001, 0.30000000000000004);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'splitY', label: \`Section: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'swatches', label: \`Asset: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'splitY') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.35, 0.65, t);
    return { ...params, splitY: Number(val.toFixed(2)) };
  }
  if (id === 'swatches') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, swatches: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.swatches) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, swatches: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.splitY) || 0.48, 0.35, 0.65);
  const v2 = Math.round(helpers.clamp(Number(params.swatches) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const sy = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, pad, width - pad * 2, sy - pad * 1.5, 2), closed: true });
  const cw = (width - pad * 2 - (v2 - 1) * 6) / v2;
  const ch = height - sy - pad * 1.2;
  for (let i = 0; i < v2; i++) {
    const x = pad + i * (cw + 6);
    paths.push({ nodes: helpers.rectPath(x, sy, cw, ch, 3), closed: true });
    paths.push({ nodes: helpers.ellipsePath(x + cw / 2, sy + ch * 0.42, Math.min(cw, ch) * 0.22, Math.min(cw, ch) * 0.22), closed: true });
  }
  return paths;
}`,
  },

  // 98. Sitemap: Investor Relations Portal
  {
    id: 'sitemap-investor-relations',
    name: "Sitemap: Investor Relations Portal",
    category: 'Flow & Diagrams',
    description: "Ticker header bar, financial performance bar chart, and quarterly SEC/PDF report cards.",
    iconName: 'TrendingUp',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle quarterly reports (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Investor Portal" },
      { key: 'chartWidth', label: "Chart Area Width", type: 'number', min: 0.4, max: 0.7, step: 0.01, defaultValue: 0.55 },
      { key: 'reports', label: "Quarterly Reports", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Investor Portal", chartWidth: 0.55, reports: 3 },
    jsSourceCode: `// Sitemap: Investor Relations Portal (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.chartWidth) || 0.55, 0.4, 0.7);
  const v2 = Math.round(helpers.clamp(Number(params.reports) || 3, 2, 4));
  const t1 = (v1 - 0.4) / Math.max(0.001, 0.29999999999999993);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'chartWidth', label: \`Chart: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'reports', label: \`Quarterly: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'chartWidth') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.4, 0.7, t);
    return { ...params, chartWidth: Number(val.toFixed(2)) };
  }
  if (id === 'reports') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, reports: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.reports) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, reports: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.chartWidth) || 0.55, 0.4, 0.7);
  const v2 = Math.round(helpers.clamp(Number(params.reports) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const cw = (width - pad * 2.5) * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, pad, width - pad * 2, height * 0.14, 2), closed: true });
  const bodyY = pad * 1.6 + height * 0.14;
  const bodyH = height - bodyY - pad;
  paths.push({ nodes: helpers.rectPath(pad, bodyY, cw, bodyH, 2), closed: true });
  for (let b = 0; b < 4; b++) {
    const bh = bodyH * (0.3 + b * 0.15);
    paths.push({ nodes: helpers.rectPath(pad + 6 + b * (cw * 0.22), bodyY + bodyH - bh - 4, cw * 0.15, bh, 1), closed: true });
  }
  const rx = pad * 1.6 + cw;
  const rw = width - rx - pad;
  const rh = bodyH / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(rx, bodyY + i * rh, rw, rh * 0.76, 2), closed: true });
  }
  return paths;
}`,
  },

  // 99. Sitemap: Store Locator Split Map
  {
    id: 'sitemap-store-locator-map',
    name: "Sitemap: Store Locator Split Map",
    category: 'Flow & Diagrams',
    description: "Left scrollable branch directory paired with interactive map viewport and location pin markers.",
    iconName: 'MapPin',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle map pin markers (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Store Locator" },
      { key: 'listWidth', label: "Directory Width", type: 'number', min: 0.28, max: 0.52, step: 0.01, defaultValue: 0.38 },
      { key: 'pins', label: "Map Pin Markers", type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Store Locator", listWidth: 0.38, pins: 3 },
    jsSourceCode: `// Sitemap: Store Locator Split Map (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.listWidth) || 0.38, 0.28, 0.52);
  const v2 = Math.round(helpers.clamp(Number(params.pins) || 3, 2, 5));
  const t1 = (v1 - 0.28) / Math.max(0.001, 0.24);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'listWidth', label: \`Directory: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'pins', label: \`Map: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'listWidth') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.28, 0.52, t);
    return { ...params, listWidth: Number(val.toFixed(2)) };
  }
  if (id === 'pins') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, pins: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.pins) || 3);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, pins: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.listWidth) || 0.38, 0.28, 0.52);
  const v2 = Math.round(helpers.clamp(Number(params.pins) || 3, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const lw = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: lw, y: 0 }, { x: lw, y: height }], false), closed: false });
  paths.push({ nodes: helpers.rectPath(pad * 0.6, pad, lw - pad * 1.2, height * 0.36, 2), closed: true });
  paths.push({ nodes: helpers.rectPath(pad * 0.6, pad + height * 0.42, lw - pad * 1.2, height * 0.36, 2), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: lw, y: height * 0.45 }, { x: width, y: height * 0.62 }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: lw + (width - lw) * 0.45, y: 0 }, { x: lw + (width - lw) * 0.6, y: height }], false), closed: false });
  for (let p = 0; p < v2; p++) {
    const px = lw + ((width - lw) * (p + 1)) / (v2 + 1);
    const py = height * (0.28 + (p % 2) * 0.36);
    paths.push({ nodes: helpers.ellipsePath(px, py, 5, 5), closed: true });
  }
  return paths;
}`,
  },

  // 100. Sitemap: Competitor Comparison Table
  {
    id: 'sitemap-comparison-matrix',
    name: "Sitemap: Competitor Comparison Table",
    category: 'Flow & Diagrams',
    description: "Feature comparison grid with sticky competitor headers and checkmark/cross cells.",
    iconName: 'Table',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle competitor columns (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Comparison Matrix" },
      { key: 'labelCol', label: "Feature Column Width", type: 'number', min: 0.25, max: 0.48, step: 0.01, defaultValue: 0.34 },
      { key: 'tiers', label: "Competitor Columns", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Comparison Matrix", labelCol: 0.34, tiers: 3 },
    jsSourceCode: `// Sitemap: Competitor Comparison Table (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.labelCol) || 0.34, 0.25, 0.48);
  const v2 = Math.round(helpers.clamp(Number(params.tiers) || 3, 2, 4));
  const t1 = (v1 - 0.25) / Math.max(0.001, 0.22999999999999998);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'labelCol', label: \`Feature: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'tiers', label: \`Competitor: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'labelCol') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.25, 0.48, t);
    return { ...params, labelCol: Number(val.toFixed(2)) };
  }
  if (id === 'tiers') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, tiers: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.tiers) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, tiers: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.labelCol) || 0.34, 0.25, 0.48);
  const v2 = Math.round(helpers.clamp(Number(params.tiers) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const lw = width * v1;
  const hh = height * 0.18;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: hh }, { x: width, y: hh }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: lw, y: 0 }, { x: lw, y: height }], false), closed: false });
  const colW = (width - lw) / v2;
  for (let c = 1; c <= v2; c++) {
    const x = lw + (c - 0.5) * colW;
    if (c < v2) paths.push({ nodes: helpers.polygonPath([{ x: lw + c * colW, y: 0 }, { x: lw + c * colW, y: height }], false), closed: false });
    paths.push({ nodes: helpers.ellipsePath(x, hh + (height - hh) * 0.32, 4, 4), closed: true });
    paths.push({ nodes: helpers.ellipsePath(x, hh + (height - hh) * 0.7, 4, 4), closed: true });
  }
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: hh + (height - hh) * 0.5 }, { x: width, y: hh + (height - hh) * 0.5 }], false), closed: false });
  return paths;
}`,
  },

  // 101. Sitemap: Interactive ROI Calculator
  {
    id: 'sitemap-roi-calculator-page',
    name: "Sitemap: Interactive ROI Calculator",
    category: 'Flow & Diagrams',
    description: "Left interactive parameter sliders with thumb knobs and right dynamic savings bar chart.",
    iconName: 'Calculator',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle input sliders (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "ROI Calculator" },
      { key: 'splitX', label: "Calculator Split X", type: 'number', min: 0.38, max: 0.64, step: 0.01, defaultValue: 0.5 },
      { key: 'sliders', label: "Input Sliders", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "ROI Calculator", splitX: 0.5, sliders: 3 },
    jsSourceCode: `// Sitemap: Interactive ROI Calculator (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.splitX) || 0.5, 0.38, 0.64);
  const v2 = Math.round(helpers.clamp(Number(params.sliders) || 3, 2, 4));
  const t1 = (v1 - 0.38) / Math.max(0.001, 0.26);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'splitX', label: \`Calculator: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'sliders', label: \`Input: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'splitX') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.38, 0.64, t);
    return { ...params, splitX: Number(val.toFixed(2)) };
  }
  if (id === 'sliders') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, sliders: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.sliders) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, sliders: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.splitX) || 0.5, 0.38, 0.64);
  const v2 = Math.round(helpers.clamp(Number(params.sliders) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const sx = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: sx, y: pad }, { x: sx, y: height - pad }], false), closed: false });
  const sh = (height - pad * 2) / v2;
  for (let i = 0; i < v2; i++) {
    const sy = pad + (i + 0.5) * sh;
    paths.push({ nodes: helpers.polygonPath([{ x: pad, y: sy }, { x: sx - pad, y: sy }], false), closed: false });
    const kx = pad + (sx - pad * 2) * (0.35 + (i % 2) * 0.35);
    paths.push({ nodes: helpers.ellipsePath(kx, sy, 5, 5), closed: true });
  }
  const bw = (width - sx - pad * 2) / 3.5;
  for (let b = 0; b < 3; b++) {
    const bh = (height - pad * 3) * (0.35 + b * 0.28);
    paths.push({ nodes: helpers.rectPath(sx + pad + b * (bw * 1.2), height - pad - bh, bw, bh, 2), closed: true });
  }
  return paths;
}`,
  },

  // 102. Sitemap: Viral Waitlist Launch Page
  {
    id: 'sitemap-waitlist-launch-page',
    name: "Sitemap: Viral Waitlist Launch Page",
    category: 'Flow & Diagrams',
    description: "4-box countdown timer, email capture bar, and stepped referral reward milestone track.",
    iconName: 'Rocket',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle reward milestones (3-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Waitlist Launch" },
      { key: 'timerY', label: "Countdown Height", type: 'number', min: 0.16, max: 0.36, step: 0.01, defaultValue: 0.24 },
      { key: 'steps', label: "Reward Milestones", type: 'number', min: 3, max: 5, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Waitlist Launch", timerY: 0.24, steps: 4 },
    jsSourceCode: `// Sitemap: Viral Waitlist Launch Page (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.timerY) || 0.24, 0.16, 0.36);
  const v2 = Math.round(helpers.clamp(Number(params.steps) || 4, 3, 5));
  const t1 = (v1 - 0.16) / Math.max(0.001, 0.19999999999999998);
  const t2 = (v2 - 3) / Math.max(1, 2);
  return [
    { id: 'timerY', label: \`Countdown: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'steps', label: \`Reward: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'timerY') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.16, 0.36, t);
    return { ...params, timerY: Number(val.toFixed(2)) };
  }
  if (id === 'steps') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, steps: Math.round(helpers.lerp(3, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.steps) || 4);
  const next = cur >= 5 ? 3 : cur + 1;
  return { ...params, steps: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.timerY) || 0.24, 0.16, 0.36);
  const v2 = Math.round(helpers.clamp(Number(params.steps) || 4, 3, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const ty = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  const bw = (width - pad * 4) / 4;
  for (let d = 0; d < 4; d++) {
    paths.push({ nodes: helpers.rectPath(pad * 1.5 + d * (bw + pad * 0.3), pad, bw * 0.88, ty, 3), closed: true });
  }
  const ey = pad * 1.6 + ty;
  paths.push({ nodes: helpers.rectPath(pad * 1.5, ey, width - pad * 3, height * 0.18, 8), closed: true });
  const ry = height - pad * 1.8;
  paths.push({ nodes: helpers.polygonPath([{ x: pad * 1.5, y: ry }, { x: width - pad * 1.5, y: ry }], false), closed: false });
  for (let s = 0; s < v2; s++) {
    const sx = helpers.lerp(pad * 1.8, width - pad * 1.8, s / Math.max(1, v2 - 1));
    paths.push({ nodes: helpers.ellipsePath(sx, ry, 5, 5), closed: true });
  }
  return paths;
}`,
  },

  // 103. Sitemap: Mobile PWA Install Sheet
  {
    id: 'sitemap-pwa-install-sheet',
    name: "Sitemap: Mobile PWA Install Sheet",
    category: 'Flow & Diagrams',
    description: "Mobile viewport with speaker notch and bottom slide-up Add-to-Home-Screen install drawer.",
    iconName: 'Smartphone',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle feature bullets (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "PWA Install Sheet" },
      { key: 'sheetHeight', label: "Bottom Sheet Ratio", type: 'number', min: 0.28, max: 0.62, step: 0.01, defaultValue: 0.42 },
      { key: 'features', label: "Feature Bullets", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "PWA Install Sheet", sheetHeight: 0.42, features: 3 },
    jsSourceCode: `// Sitemap: Mobile PWA Install Sheet (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.sheetHeight) || 0.42, 0.28, 0.62);
  const v2 = Math.round(helpers.clamp(Number(params.features) || 3, 2, 4));
  const t1 = (v1 - 0.28) / Math.max(0.001, 0.33999999999999997);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'sheetHeight', label: \`Bottom: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'features', label: \`Feature: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'sheetHeight') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.28, 0.62, t);
    return { ...params, sheetHeight: Number(val.toFixed(2)) };
  }
  if (id === 'features') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, features: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.features) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, features: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.sheetHeight) || 0.42, 0.28, 0.62);
  const v2 = Math.round(helpers.clamp(Number(params.features) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const sh = height * v1;
  const sy = height - sh;
  paths.push({ nodes: helpers.rectPath(width * 0.12, 0, width * 0.76, height, 12), closed: true });
  paths.push({ nodes: helpers.rectPath(width * 0.38, 5, width * 0.24, 5, 2), closed: true });
  paths.push({ nodes: helpers.rectPath(width * 0.12, sy, width * 0.76, sh, 10), closed: true });
  paths.push({ nodes: helpers.rectPath(width * 0.2, sy + 8, 18, 18, 4), closed: true });
  for (let i = 0; i < v2; i++) {
    const ly = sy + 32 + i * ((sh - 38) / Math.max(1, v2));
    paths.push({ nodes: helpers.polygonPath([{ x: width * 0.2, y: ly }, { x: width * 0.8, y: ly }], false), closed: false });
  }
  return paths;
}`,
  },

  // 104. Sitemap: Mobile Bottom Tab Navigation
  {
    id: 'sitemap-mobile-tab-bar-nav',
    name: "Sitemap: Mobile Bottom Tab Navigation",
    category: 'Flow & Diagrams',
    description: "Mobile phone frame with scrollable card feed and persistent bottom icon tab bar.",
    iconName: 'Smartphone',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle tab bar icons (3-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Mobile Tab Nav" },
      { key: 'dockRatio', label: "Bottom Dock Height", type: 'number', min: 0.12, max: 0.24, step: 0.01, defaultValue: 0.16 },
      { key: 'tabs', label: "Tab Bar Icons", type: 'number', min: 3, max: 5, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Mobile Tab Nav", dockRatio: 0.16, tabs: 4 },
    jsSourceCode: `// Sitemap: Mobile Bottom Tab Navigation (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.dockRatio) || 0.16, 0.12, 0.24);
  const v2 = Math.round(helpers.clamp(Number(params.tabs) || 4, 3, 5));
  const t1 = (v1 - 0.12) / Math.max(0.001, 0.12);
  const t2 = (v2 - 3) / Math.max(1, 2);
  return [
    { id: 'dockRatio', label: \`Bottom: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'tabs', label: \`Tab: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'dockRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.12, 0.24, t);
    return { ...params, dockRatio: Number(val.toFixed(2)) };
  }
  if (id === 'tabs') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, tabs: Math.round(helpers.lerp(3, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.tabs) || 4);
  const next = cur >= 5 ? 3 : cur + 1;
  return { ...params, tabs: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.dockRatio) || 0.16, 0.12, 0.24);
  const v2 = Math.round(helpers.clamp(Number(params.tabs) || 4, 3, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const dh = height * v1;
  const mx = width * 0.12;
  const mw = width * 0.76;
  paths.push({ nodes: helpers.rectPath(mx, 0, mw, height, 12), closed: true });
  paths.push({ nodes: helpers.rectPath(mx + 8, 14, mw - 16, (height - dh - 26) * 0.48, 4), closed: true });
  paths.push({ nodes: helpers.rectPath(mx + 8, 18 + (height - dh - 26) * 0.5, mw - 16, (height - dh - 26) * 0.42, 4), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: mx, y: height - dh }, { x: mx + mw, y: height - dh }], false), closed: false });
  const tw = mw / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.ellipsePath(mx + (i + 0.5) * tw, height - dh * 0.5, 4.5, 4.5), closed: true });
  }
  return paths;
}`,
  },

  // 105. Sitemap: Mobile Fullscreen Story Flow
  {
    id: 'sitemap-mobile-story-carousel',
    name: "Sitemap: Mobile Fullscreen Story Flow",
    category: 'Flow & Diagrams',
    description: "Full-screen vertical story frame with segmented top progress bars, media stage, and reply pill.",
    iconName: 'Film',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle story segments (2-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Story Carousel" },
      { key: 'mediaRatio', label: "Media Stage Height", type: 'number', min: 0.55, max: 0.82, step: 0.01, defaultValue: 0.7 },
      { key: 'segments', label: "Story Segments", type: 'number', min: 2, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Story Carousel", mediaRatio: 0.7, segments: 4 },
    jsSourceCode: `// Sitemap: Mobile Fullscreen Story Flow (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.mediaRatio) || 0.7, 0.55, 0.82);
  const v2 = Math.round(helpers.clamp(Number(params.segments) || 4, 2, 6));
  const t1 = (v1 - 0.55) / Math.max(0.001, 0.2699999999999999);
  const t2 = (v2 - 2) / Math.max(1, 4);
  return [
    { id: 'mediaRatio', label: \`Media: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'segments', label: \`Story: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'mediaRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.55, 0.82, t);
    return { ...params, mediaRatio: Number(val.toFixed(2)) };
  }
  if (id === 'segments') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, segments: Math.round(helpers.lerp(2, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.segments) || 4);
  const next = cur >= 6 ? 2 : cur + 1;
  return { ...params, segments: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.mediaRatio) || 0.7, 0.55, 0.82);
  const v2 = Math.round(helpers.clamp(Number(params.segments) || 4, 2, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const mx = width * 0.14;
  const mw = width * 0.72;
  paths.push({ nodes: helpers.rectPath(mx, 0, mw, height, 12), closed: true });
  const segW = (mw - 16 - (v2 - 1) * 4) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(mx + 8 + i * (segW + 4), 8, segW, 3, 1), closed: true });
  }
  const mh = height * v1;
  paths.push({ nodes: helpers.rectPath(mx + 6, 16, mw - 12, mh, 4), closed: true });
  paths.push({ nodes: helpers.rectPath(mx + 8, height - 18, mw - 32, 11, 5), closed: true });
  paths.push({ nodes: helpers.ellipsePath(mx + mw - 14, height - 12.5, 5, 5), closed: true });
  return paths;
}`,
  },

  // 106. Sitemap: Desktop-to-Mobile QR Bridge
  {
    id: 'sitemap-qr-handoff-bridge',
    name: "Sitemap: Desktop-to-Mobile QR Bridge",
    category: 'Flow & Diagrams',
    description: "Desktop card linked via central QR code finder matrix to companion mobile handset frame.",
    iconName: 'QrCode',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle finder detail (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "QR Handoff" },
      { key: 'qrScale', label: "QR Matrix Scale", type: 'number', min: 0.22, max: 0.44, step: 0.01, defaultValue: 0.32 },
      { key: 'modules', label: "Finder Detail", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "QR Handoff", qrScale: 0.32, modules: 3 },
    jsSourceCode: `// Sitemap: Desktop-to-Mobile QR Bridge (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.qrScale) || 0.32, 0.22, 0.44);
  const v2 = Math.round(helpers.clamp(Number(params.modules) || 3, 2, 4));
  const t1 = (v1 - 0.22) / Math.max(0.001, 0.22);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'qrScale', label: \`QR: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'modules', label: \`Finder: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'qrScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.22, 0.44, t);
    return { ...params, qrScale: Number(val.toFixed(2)) };
  }
  if (id === 'modules') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, modules: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.modules) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, modules: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.qrScale) || 0.32, 0.22, 0.44);
  const v2 = Math.round(helpers.clamp(Number(params.modules) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const qr = Math.min(width, height) * v1;
  paths.push({ nodes: helpers.rectPath(0, height * 0.14, width * 0.28, height * 0.72, 4), closed: true });
  paths.push({ nodes: helpers.rectPath(cx - qr / 2, cy - qr / 2, qr, qr, 3), closed: true });
  const f = qr * 0.26;
  paths.push({ nodes: helpers.rectPath(cx - qr / 2 + 4, cy - qr / 2 + 4, f, f, 1), closed: true });
  paths.push({ nodes: helpers.rectPath(cx + qr / 2 - f - 4, cy - qr / 2 + 4, f, f, 1), closed: true });
  paths.push({ nodes: helpers.rectPath(cx - qr / 2 + 4, cy + qr / 2 - f - 4, f, f, 1), closed: true });
  for (let m = 0; m < v2; m++) {
    const ms = (qr * 0.34) / v2;
    paths.push({ nodes: helpers.rectPath(cx - qr * 0.04 + m * ms, cy - qr * 0.04 + m * ms, ms * 0.75, ms * 0.75, 0.5), closed: true });
  }
  paths.push({ nodes: helpers.rectPath(width * 0.74, height * 0.1, width * 0.26, height * 0.8, 8), closed: true });
  return paths;
}`,
  },

  // 107. Sitemap: Enterprise SSO / SAML Login
  {
    id: 'sitemap-sso-saml-enterprise',
    name: "Sitemap: Enterprise SSO / SAML Login",
    category: 'Flow & Diagrams',
    description: "Corporate single-sign-on gate with shield emblem, work domain input, and IdP federation buttons.",
    iconName: 'ShieldCheck',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle idp buttons (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Enterprise SSO" },
      { key: 'shieldSize', label: "Shield Crest Size", type: 'number', min: 0.14, max: 0.32, step: 0.01, defaultValue: 0.22 },
      { key: 'providers', label: "IdP Buttons", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Enterprise SSO", shieldSize: 0.22, providers: 3 },
    jsSourceCode: `// Sitemap: Enterprise SSO / SAML Login (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.shieldSize) || 0.22, 0.14, 0.32);
  const v2 = Math.round(helpers.clamp(Number(params.providers) || 3, 2, 4));
  const t1 = (v1 - 0.14) / Math.max(0.001, 0.18);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'shieldSize', label: \`Shield: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'providers', label: \`IdP: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'shieldSize') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.14, 0.32, t);
    return { ...params, shieldSize: Number(val.toFixed(2)) };
  }
  if (id === 'providers') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, providers: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.providers) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, providers: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.shieldSize) || 0.22, 0.14, 0.32);
  const v2 = Math.round(helpers.clamp(Number(params.providers) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const sr = Math.min(width, height) * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: pad }, { x: cx + sr, y: pad + sr * 0.35 }, { x: cx + sr * 0.8, y: pad + sr * 1.2 }, { x: cx, y: pad + sr * 1.6 }, { x: cx - sr * 0.8, y: pad + sr * 1.2 }, { x: cx - sr, y: pad + sr * 0.35 }]), closed: true });
  const startY = pad * 1.6 + sr * 1.6;
  const bh = (height - startY - pad) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(width * 0.14, startY + i * bh, width * 0.72, bh * 0.72, 4), closed: true });
  }
  return paths;
}`,
  },

  // 108. Sitemap: 2FA / TOTP 6-Digit Verification
  {
    id: 'sitemap-mfa-totp-verify',
    name: "Sitemap: 2FA / TOTP 6-Digit Verification",
    category: 'Flow & Diagrams',
    description: "Multi-factor authentication step with padlock header and segmented one-time passcode digit boxes.",
    iconName: 'Lock',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle otp digit count (4-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "2FA Verification" },
      { key: 'boxHeight', label: "OTP Digit Height", type: 'number', min: 0.16, max: 0.32, step: 0.01, defaultValue: 0.22 },
      { key: 'digits', label: "OTP Digit Count", type: 'number', min: 4, max: 6, step: 1, defaultValue: 6 },
    ],
    defaultParams: { label: "2FA Verification", boxHeight: 0.22, digits: 6 },
    jsSourceCode: `// Sitemap: 2FA / TOTP 6-Digit Verification (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.boxHeight) || 0.22, 0.16, 0.32);
  const v2 = Math.round(helpers.clamp(Number(params.digits) || 6, 4, 6));
  const t1 = (v1 - 0.16) / Math.max(0.001, 0.16);
  const t2 = (v2 - 4) / Math.max(1, 2);
  return [
    { id: 'boxHeight', label: \`OTP: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'digits', label: \`OTP: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'boxHeight') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.16, 0.32, t);
    return { ...params, boxHeight: Number(val.toFixed(2)) };
  }
  if (id === 'digits') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, digits: Math.round(helpers.lerp(4, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.digits) || 6);
  const next = cur >= 6 ? 4 : cur + 1;
  return { ...params, digits: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.boxHeight) || 0.22, 0.16, 0.32);
  const v2 = Math.round(helpers.clamp(Number(params.digits) || 6, 4, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const bh = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, pad + 9, 7, 7), closed: true });
  const bw = (width - pad * 3 - (v2 - 1) * 5) / v2;
  const by = cy - bh * 0.3;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(pad * 1.5 + i * (bw + 5), by, bw, bh, 3), closed: true });
  }
  paths.push({ nodes: helpers.rectPath(width * 0.24, height - pad * 2.2, width * 0.52, pad * 1.4, 5), closed: true });
  return paths;
}`,
  },

  // 109. Sitemap: WebAuthn Passkey Prompt
  {
    id: 'sitemap-passkey-biometric',
    name: "Sitemap: WebAuthn Passkey Prompt",
    category: 'Flow & Diagrams',
    description: "Passwordless biometric prompt with concentric fingerprint scan rings and passkey key glyph.",
    iconName: 'Fingerprint',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle scan ridge rings (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Passkey Biometric" },
      { key: 'ringScale', label: "Biometric Ring Size", type: 'number', min: 0.22, max: 0.48, step: 0.01, defaultValue: 0.34 },
      { key: 'rings', label: "Scan Ridge Rings", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Passkey Biometric", ringScale: 0.34, rings: 3 },
    jsSourceCode: `// Sitemap: WebAuthn Passkey Prompt (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.ringScale) || 0.34, 0.22, 0.48);
  const v2 = Math.round(helpers.clamp(Number(params.rings) || 3, 2, 4));
  const t1 = (v1 - 0.22) / Math.max(0.001, 0.26);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'ringScale', label: \`Biometric: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'rings', label: \`Scan: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'ringScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.22, 0.48, t);
    return { ...params, ringScale: Number(val.toFixed(2)) };
  }
  if (id === 'rings') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, rings: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.rings) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, rings: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.ringScale) || 0.34, 0.22, 0.48);
  const v2 = Math.round(helpers.clamp(Number(params.rings) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const rMax = Math.min(width, height) * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  for (let i = 1; i <= v2; i++) {
    const r = (rMax * i) / v2;
    paths.push({ nodes: helpers.ellipsePath(cx, cy - 6, r, r), closed: true });
  }
  paths.push({ nodes: helpers.rectPath(width * 0.25, height - pad * 2.2, width * 0.5, pad * 1.4, 5), closed: true });
  return paths;
}`,
  },

  // 110. Sitemap: Passwordless Magic Link Sent
  {
    id: 'sitemap-magic-link-sent',
    name: "Sitemap: Passwordless Magic Link Sent",
    category: 'Flow & Diagrams',
    description: "Check-your-inbox confirmation card with radiated spark envelope and email client launch button.",
    iconName: 'MailCheck',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle spark rays (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Magic Link Sent" },
      { key: 'envScale', label: "Envelope Scale", type: 'number', min: 0.24, max: 0.48, step: 0.01, defaultValue: 0.34 },
      { key: 'rays', label: "Spark Rays", type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Magic Link Sent", envScale: 0.34, rays: 4 },
    jsSourceCode: `// Sitemap: Passwordless Magic Link Sent (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.envScale) || 0.34, 0.24, 0.48);
  const v2 = Math.round(helpers.clamp(Number(params.rays) || 4, 3, 6));
  const t1 = (v1 - 0.24) / Math.max(0.001, 0.24);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'envScale', label: \`Envelope: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'rays', label: \`Spark: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'envScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.24, 0.48, t);
    return { ...params, envScale: Number(val.toFixed(2)) };
  }
  if (id === 'rays') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, rays: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.rays) || 4);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, rays: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.envScale) || 0.34, 0.24, 0.48);
  const v2 = Math.round(helpers.clamp(Number(params.rays) || 4, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const ew = width * v1 * 1.3;
  const eh = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.rectPath(cx - ew / 2, cy - eh / 2, ew, eh, 3), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx - ew / 2, y: cy - eh / 2 }, { x: cx, y: cy + eh * 0.08 }, { x: cx + ew / 2, y: cy - eh / 2 }], false), closed: false });
  for (let i = 0; i < v2; i++) {
    const a = -Math.PI * 0.85 + (i * Math.PI * 0.7) / Math.max(1, v2 - 1);
    paths.push({ nodes: helpers.polygonPath([{ x: cx + Math.cos(a) * (ew * 0.62), y: cy + Math.sin(a) * (eh * 0.75) }, { x: cx + Math.cos(a) * (ew * 0.82), y: cy + Math.sin(a) * (eh * 0.98) }], false), closed: false });
  }
  return paths;
}`,
  },

  // 111. Sitemap: Password Reset & Strength
  {
    id: 'sitemap-password-reset-flow',
    name: "Sitemap: Password Reset & Strength",
    category: 'Flow & Diagrams',
    description: "New/confirm password inputs with 4-segment entropy strength meter and submit button.",
    iconName: 'Key',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle entropy bars (1-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Password Reset" },
      { key: 'inputWidth', label: "Field Width Ratio", type: 'number', min: 0.65, max: 0.9, step: 0.01, defaultValue: 0.8 },
      { key: 'strength', label: "Entropy Bars", type: 'number', min: 1, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Password Reset", inputWidth: 0.8, strength: 3 },
    jsSourceCode: `// Sitemap: Password Reset & Strength (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.inputWidth) || 0.8, 0.65, 0.9);
  const v2 = Math.round(helpers.clamp(Number(params.strength) || 3, 1, 4));
  const t1 = (v1 - 0.65) / Math.max(0.001, 0.25);
  const t2 = (v2 - 1) / Math.max(1, 3);
  return [
    { id: 'inputWidth', label: \`Field: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'strength', label: \`Entropy: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'inputWidth') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.65, 0.9, t);
    return { ...params, inputWidth: Number(val.toFixed(2)) };
  }
  if (id === 'strength') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, strength: Math.round(helpers.lerp(1, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.strength) || 3);
  const next = cur >= 4 ? 1 : cur + 1;
  return { ...params, strength: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.inputWidth) || 0.8, 0.65, 0.9);
  const v2 = Math.round(helpers.clamp(Number(params.strength) || 3, 1, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const iw = width * v1;
  const ix = (width - iw) / 2;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.rectPath(ix, height * 0.16, iw, height * 0.16, 3), closed: true });
  paths.push({ nodes: helpers.rectPath(ix, height * 0.38, iw, height * 0.16, 3), closed: true });
  const sw = (iw - 9) / 4;
  for (let i = 0; i < 4; i++) {
    const hBar = i < v2 ? 6 : 2;
    paths.push({ nodes: helpers.rectPath(ix + i * (sw + 3), height * 0.62, sw, hBar, 1), closed: true });
  }
  paths.push({ nodes: helpers.rectPath(ix, height * 0.74, iw, height * 0.15, 4), closed: true });
  return paths;
}`,
  },

  // 112. Sitemap: OAuth Scope Consent Screen
  {
    id: 'sitemap-oauth-consent-screen',
    name: "Sitemap: OAuth Scope Consent Screen",
    category: 'Flow & Diagrams',
    description: "Third-party app authorization card with linked avatar circles, requested scopes, and Allow/Deny CTAs.",
    iconName: 'Handshake',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle permission scopes (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "OAuth Consent" },
      { key: 'headerY', label: "Avatar Link Y", type: 'number', min: 0.2, max: 0.38, step: 0.01, defaultValue: 0.28 },
      { key: 'scopes', label: "Permission Scopes", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "OAuth Consent", headerY: 0.28, scopes: 3 },
    jsSourceCode: `// Sitemap: OAuth Scope Consent Screen (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.headerY) || 0.28, 0.2, 0.38);
  const v2 = Math.round(helpers.clamp(Number(params.scopes) || 3, 2, 4));
  const t1 = (v1 - 0.2) / Math.max(0.001, 0.18);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'headerY', label: \`Avatar: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'scopes', label: \`Permission: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'headerY') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.2, 0.38, t);
    return { ...params, headerY: Number(val.toFixed(2)) };
  }
  if (id === 'scopes') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, scopes: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.scopes) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, scopes: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.headerY) || 0.28, 0.2, 0.38);
  const v2 = Math.round(helpers.clamp(Number(params.scopes) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const hy = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.ellipsePath(width * 0.32, hy, 11, 11), closed: true });
  paths.push({ nodes: helpers.ellipsePath(width * 0.68, hy, 11, 11), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: width * 0.4, y: hy }, { x: width * 0.6, y: hy }], false), closed: false });
  const sy = hy + 16;
  const sh = (height * 0.74 - sy) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(width * 0.16, sy + i * sh, width * 0.68, sh * 0.68, 2), closed: true });
  }
  paths.push({ nodes: helpers.rectPath(width * 0.16, height * 0.78, width * 0.31, height * 0.13, 3), closed: true });
  paths.push({ nodes: helpers.rectPath(width * 0.53, height * 0.78, width * 0.31, height * 0.13, 3), closed: true });
  return paths;
}`,
  },

  // 113. Sitemap: KYC Identity Document Scan
  {
    id: 'sitemap-kyc-id-verification',
    name: "Sitemap: KYC Identity Document Scan",
    category: 'Flow & Diagrams',
    description: "Camera viewfinder corner brackets framing a government ID card with portrait oval and MRZ lines.",
    iconName: 'ScanFace',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle corner bracket size (8-22)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "KYC ID Scan" },
      { key: 'cardScale', label: "ID Card Scale", type: 'number', min: 0.5, max: 0.82, step: 0.01, defaultValue: 0.68 },
      { key: 'bracketLen', label: "Corner Bracket Size", type: 'number', min: 8, max: 22, step: 1, defaultValue: 14 },
    ],
    defaultParams: { label: "KYC ID Scan", cardScale: 0.68, bracketLen: 14 },
    jsSourceCode: `// Sitemap: KYC Identity Document Scan (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.cardScale) || 0.68, 0.5, 0.82);
  const v2 = Math.round(helpers.clamp(Number(params.bracketLen) || 14, 8, 22));
  const t1 = (v1 - 0.5) / Math.max(0.001, 0.31999999999999995);
  const t2 = (v2 - 8) / Math.max(1, 14);
  return [
    { id: 'cardScale', label: \`ID: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'bracketLen', label: \`Corner: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'cardScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.5, 0.82, t);
    return { ...params, cardScale: Number(val.toFixed(2)) };
  }
  if (id === 'bracketLen') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, bracketLen: Math.round(helpers.lerp(8, 22, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.bracketLen) || 14);
  const next = cur >= 22 ? 8 : cur + 1;
  return { ...params, bracketLen: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.cardScale) || 0.68, 0.5, 0.82);
  const v2 = Math.round(helpers.clamp(Number(params.bracketLen) || 14, 8, 22));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const cw = width * v1;
  const ch = height * v1;
  const x0 = (width - cw) / 2;
  const y0 = (height - ch) / 2;
  const bl = v2;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.rectPath(x0, y0, cw, ch, 5), closed: true });
  paths.push({ nodes: helpers.ellipsePath(x0 + cw * 0.26, y0 + ch * 0.45, cw * 0.14, ch * 0.22), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: x0 - 5, y: y0 + bl }, { x: x0 - 5, y: y0 - 5 }, { x: x0 + bl, y: y0 - 5 }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: x0 + cw - bl, y: y0 - 5 }, { x: x0 + cw + 5, y: y0 - 5 }, { x: x0 + cw + 5, y: y0 + bl }], false), closed: false });
  return paths;
}`,
  },

  // 114. Sitemap: GDPR Cookie Consent Matrix
  {
    id: 'sitemap-cookie-gdpr-banner',
    name: "Sitemap: GDPR Cookie Consent Matrix",
    category: 'Flow & Diagrams',
    description: "Viewport frame with bottom compliance consent bar, category toggle switches, and Accept CTA.",
    iconName: 'Cookie',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle category toggles (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "GDPR Consent" },
      { key: 'bannerRatio', label: "Consent Bar Height", type: 'number', min: 0.25, max: 0.52, step: 0.01, defaultValue: 0.36 },
      { key: 'toggles', label: "Category Toggles", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "GDPR Consent", bannerRatio: 0.36, toggles: 3 },
    jsSourceCode: `// Sitemap: GDPR Cookie Consent Matrix (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.bannerRatio) || 0.36, 0.25, 0.52);
  const v2 = Math.round(helpers.clamp(Number(params.toggles) || 3, 2, 4));
  const t1 = (v1 - 0.25) / Math.max(0.001, 0.27);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'bannerRatio', label: \`Consent: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'toggles', label: \`Category: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'bannerRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.25, 0.52, t);
    return { ...params, bannerRatio: Number(val.toFixed(2)) };
  }
  if (id === 'toggles') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, toggles: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.toggles) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, toggles: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.bannerRatio) || 0.36, 0.25, 0.52);
  const v2 = Math.round(helpers.clamp(Number(params.toggles) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const bh = height * v1;
  const by = height - bh;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.rectPath(0, by, width, bh, 4), closed: true });
  const tw = (width - pad * 2 - (v2 - 1) * 6) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(pad + i * (tw + 6), by + 8, tw, bh * 0.36, 6), closed: true });
  }
  paths.push({ nodes: helpers.rectPath(width - pad - width * 0.32, height - pad * 1.6, width * 0.32, pad * 1.1, 3), closed: true });
  return paths;
}`,
  },

  // 115. Sitemap: Age / Geo-Compliance Gate
  {
    id: 'sitemap-age-region-gate',
    name: "Sitemap: Age / Geo-Compliance Gate",
    category: 'Flow & Diagrams',
    description: "Compliance entry barrier with meridian globe emblem, DD/MM/YYYY selectors, and verify button.",
    iconName: 'Globe',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle date/region boxes (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Age & Geo Gate" },
      { key: 'globeRadius', label: "Globe Icon Scale", type: 'number', min: 0.12, max: 0.26, step: 0.01, defaultValue: 0.18 },
      { key: 'selectors', label: "Date/Region Boxes", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Age & Geo Gate", globeRadius: 0.18, selectors: 3 },
    jsSourceCode: `// Sitemap: Age / Geo-Compliance Gate (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.globeRadius) || 0.18, 0.12, 0.26);
  const v2 = Math.round(helpers.clamp(Number(params.selectors) || 3, 2, 4));
  const t1 = (v1 - 0.12) / Math.max(0.001, 0.14);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'globeRadius', label: \`Globe: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'selectors', label: \`Date/Region: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'globeRadius') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.12, 0.26, t);
    return { ...params, globeRadius: Number(val.toFixed(2)) };
  }
  if (id === 'selectors') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, selectors: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.selectors) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, selectors: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.globeRadius) || 0.18, 0.12, 0.26);
  const v2 = Math.round(helpers.clamp(Number(params.selectors) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const gr = Math.min(width, height) * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, pad + gr, gr, gr), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, pad + gr, gr * 0.48, gr), closed: true });
  const sw = (width - pad * 3 - (v2 - 1) * 6) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(pad * 1.5 + i * (sw + 6), cy + 4, sw, height * 0.18, 3), closed: true });
  }
  paths.push({ nodes: helpers.rectPath(width * 0.25, height - pad * 2.1, width * 0.5, pad * 1.3, 4), closed: true });
  return paths;
}`,
  },

  // 116. Sitemap: Content Paywall Blur Gate
  {
    id: 'sitemap-paywall-upgrade-gate',
    name: "Sitemap: Content Paywall Blur Gate",
    category: 'Flow & Diagrams',
    description: "Visible article preview lines transitioning across a锯/wave fade boundary into a subscription card.",
    iconName: 'Lock',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle preview text lines (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Paywall Gate" },
      { key: 'gateYRatio', label: "Paywall Cutoff Y", type: 'number', min: 0.28, max: 0.58, step: 0.01, defaultValue: 0.4 },
      { key: 'lines', label: "Preview Text Lines", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Paywall Gate", gateYRatio: 0.4, lines: 3 },
    jsSourceCode: `// Sitemap: Content Paywall Blur Gate (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.gateYRatio) || 0.4, 0.28, 0.58);
  const v2 = Math.round(helpers.clamp(Number(params.lines) || 3, 2, 4));
  const t1 = (v1 - 0.28) / Math.max(0.001, 0.29999999999999993);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'gateYRatio', label: \`Paywall: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'lines', label: \`Preview: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'gateYRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.28, 0.58, t);
    return { ...params, gateYRatio: Number(val.toFixed(2)) };
  }
  if (id === 'lines') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, lines: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.lines) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, lines: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.gateYRatio) || 0.4, 0.28, 0.58);
  const v2 = Math.round(helpers.clamp(Number(params.lines) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const gy = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  for (let i = 0; i < v2; i++) {
    const ly = pad + (i * (gy - pad * 1.5)) / Math.max(1, v2);
    paths.push({ nodes: helpers.polygonPath([{ x: pad, y: ly }, { x: width - pad * (1 + (i % 2)), y: ly }], false), closed: false });
  }
  paths.push({ nodes: helpers.rectPath(pad * 1.2, gy, width - pad * 2.4, height - gy - pad, 5), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, gy + (height - gy) * 0.32, 7, 7), closed: true });
  return paths;
}`,
  },

  // 117. Sitemap: Post-Purchase One-Click Upsell
  {
    id: 'sitemap-upsell-cross-sell',
    name: "Sitemap: Post-Purchase One-Click Upsell",
    category: 'Flow & Diagrams',
    description: "Funnel step bar, spotlight bonus offer box with star badge, and one-click Add/Skip buttons.",
    iconName: 'Sparkles',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle badge points (4-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "1-Click Upsell" },
      { key: 'offerRatio', label: "Spotlight Box Height", type: 'number', min: 0.34, max: 0.62, step: 0.01, defaultValue: 0.48 },
      { key: 'stars', label: "Badge Points", type: 'number', min: 4, max: 6, step: 1, defaultValue: 5 },
    ],
    defaultParams: { label: "1-Click Upsell", offerRatio: 0.48, stars: 5 },
    jsSourceCode: `// Sitemap: Post-Purchase One-Click Upsell (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.offerRatio) || 0.48, 0.34, 0.62);
  const v2 = Math.round(helpers.clamp(Number(params.stars) || 5, 4, 6));
  const t1 = (v1 - 0.34) / Math.max(0.001, 0.27999999999999997);
  const t2 = (v2 - 4) / Math.max(1, 2);
  return [
    { id: 'offerRatio', label: \`Spotlight: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'stars', label: \`Badge: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'offerRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.34, 0.62, t);
    return { ...params, offerRatio: Number(val.toFixed(2)) };
  }
  if (id === 'stars') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, stars: Math.round(helpers.lerp(4, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.stars) || 5);
  const next = cur >= 6 ? 4 : cur + 1;
  return { ...params, stars: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.offerRatio) || 0.48, 0.34, 0.62);
  const v2 = Math.round(helpers.clamp(Number(params.stars) || 5, 4, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const oh = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.rectPath(pad * 1.4, height * 0.18, width - pad * 2.8, oh, 5), closed: true });
  const sr = 9;
  const starPts = [];
  for (let i = 0; i < v2 * 2; i++) {
    const r = i % 2 === 0 ? sr : sr * 0.45;
    const a = (i * Math.PI) / v2 - Math.PI / 2;
    starPts.push({ x: width - pad * 1.6 + Math.cos(a) * r, y: height * 0.18 + Math.sin(a) * r });
  }
  paths.push({ nodes: helpers.polygonPath(starPts), closed: true });
  paths.push({ nodes: helpers.rectPath(pad * 1.4, height - pad * 2.2, width * 0.42, pad * 1.4, 4), closed: true });
  paths.push({ nodes: helpers.rectPath(width * 0.56, height - pad * 2.2, width * 0.3, pad * 1.4, 4), closed: true });
  return paths;
}`,
  },

  // 118. Sitemap: Abandoned Cart Recovery Node
  {
    id: 'sitemap-abandoned-cart-recovery',
    name: "Sitemap: Abandoned Cart Recovery Node",
    category: 'Flow & Diagrams',
    description: "Circular return recovery arrow wrapping a shopping basket trapezoid and discount coupon tag.",
    iconName: 'RotateCcw',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle recovered items (1-3)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Cart Recovery" },
      { key: 'basketScale', label: "Basket Width Ratio", type: 'number', min: 0.36, max: 0.64, step: 0.01, defaultValue: 0.48 },
      { key: 'items', label: "Recovered Items", type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "Cart Recovery", basketScale: 0.48, items: 2 },
    jsSourceCode: `// Sitemap: Abandoned Cart Recovery Node (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.basketScale) || 0.48, 0.36, 0.64);
  const v2 = Math.round(helpers.clamp(Number(params.items) || 2, 1, 3));
  const t1 = (v1 - 0.36) / Math.max(0.001, 0.28);
  const t2 = (v2 - 1) / Math.max(1, 2);
  return [
    { id: 'basketScale', label: \`Basket: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'items', label: \`Recovered: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'basketScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.36, 0.64, t);
    return { ...params, basketScale: Number(val.toFixed(2)) };
  }
  if (id === 'items') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, items: Math.round(helpers.lerp(1, 3, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.items) || 2);
  const next = cur >= 3 ? 1 : cur + 1;
  return { ...params, items: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.basketScale) || 0.48, 0.36, 0.64);
  const v2 = Math.round(helpers.clamp(Number(params.items) || 2, 1, 3));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const bw = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.arcNodes(cx, cy - 4, bw * 0.58, height * 0.34, -210, 250), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: cx - bw * 0.4, y: cy - 8 }, { x: cx + bw * 0.4, y: cy - 8 }, { x: cx + bw * 0.28, y: cy + height * 0.22 }, { x: cx - bw * 0.28, y: cy + height * 0.22 }]), closed: true });
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(cx - bw * 0.2 + i * 12, cy - 18, 9, 9, 1), closed: true });
  }
  return paths;
}`,
  },

  // 119. Sitemap: Viral Referral Loop Page
  {
    id: 'sitemap-referral-invite-loop',
    name: "Sitemap: Viral Referral Loop Page",
    category: 'Flow & Diagrams',
    description: "Share link bar connected via radial invite branches to friend avatar nodes and reward badge.",
    iconName: 'Share2',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle invited friends (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Referral Loop" },
      { key: 'hubY', label: "Central Hub Y", type: 'number', min: 0.35, max: 0.6, step: 0.01, defaultValue: 0.46 },
      { key: 'friends', label: "Invited Friends", type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Referral Loop", hubY: 0.46, friends: 3 },
    jsSourceCode: `// Sitemap: Viral Referral Loop Page (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.hubY) || 0.46, 0.35, 0.6);
  const v2 = Math.round(helpers.clamp(Number(params.friends) || 3, 2, 5));
  const t1 = (v1 - 0.35) / Math.max(0.001, 0.25);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'hubY', label: \`Central: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'friends', label: \`Invited: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'hubY') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.35, 0.6, t);
    return { ...params, hubY: Number(val.toFixed(2)) };
  }
  if (id === 'friends') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, friends: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.friends) || 3);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, friends: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.hubY) || 0.46, 0.35, 0.6);
  const v2 = Math.round(helpers.clamp(Number(params.friends) || 3, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const hy = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, hy, 11, 11), closed: true });
  for (let i = 0; i < v2; i++) {
    const fx = helpers.lerp(width * 0.2, width * 0.8, i / Math.max(1, v2 - 1));
    const fy = height * 0.82;
    paths.push({ nodes: helpers.polygonPath([{ x: cx, y: hy + 11 }, { x: fx, y: fy - 9 }], false), closed: false });
    paths.push({ nodes: helpers.ellipsePath(fx, fy, 8, 8), closed: true });
  }
  return paths;
}`,
  },

  // 120. Sitemap: NPS 0-10 Score Survey
  {
    id: 'sitemap-nps-feedback-survey',
    name: "Sitemap: NPS 0-10 Score Survey",
    category: 'Flow & Diagrams',
    description: "Net Promoter Score horizontal rating scale boxes, open feedback textarea, and submit button.",
    iconName: 'Smile',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle score scale boxes (5-10)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "NPS Survey" },
      { key: 'scaleY', label: "Rating Bar Y", type: 'number', min: 0.25, max: 0.48, step: 0.01, defaultValue: 0.34 },
      { key: 'boxes', label: "Score Scale Boxes", type: 'number', min: 5, max: 10, step: 1, defaultValue: 7 },
    ],
    defaultParams: { label: "NPS Survey", scaleY: 0.34, boxes: 7 },
    jsSourceCode: `// Sitemap: NPS 0-10 Score Survey (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.scaleY) || 0.34, 0.25, 0.48);
  const v2 = Math.round(helpers.clamp(Number(params.boxes) || 7, 5, 10));
  const t1 = (v1 - 0.25) / Math.max(0.001, 0.22999999999999998);
  const t2 = (v2 - 5) / Math.max(1, 5);
  return [
    { id: 'scaleY', label: \`Rating: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'boxes', label: \`Score: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'scaleY') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.25, 0.48, t);
    return { ...params, scaleY: Number(val.toFixed(2)) };
  }
  if (id === 'boxes') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, boxes: Math.round(helpers.lerp(5, 10, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.boxes) || 7);
  const next = cur >= 10 ? 5 : cur + 1;
  return { ...params, boxes: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.scaleY) || 0.34, 0.25, 0.48);
  const v2 = Math.round(helpers.clamp(Number(params.boxes) || 7, 5, 10));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const sy = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  const bw = (width - pad * 2 - (v2 - 1) * 3) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(pad + i * (bw + 3), sy, bw, height * 0.16, 2), closed: true });
  }
  paths.push({ nodes: helpers.rectPath(pad, sy + height * 0.24, width - pad * 2, height * 0.28, 3), closed: true });
  return paths;
}`,
  },

  // 121. Sitemap: Activation Checklist Widget
  {
    id: 'sitemap-onboarding-checklist',
    name: "Sitemap: Activation Checklist Widget",
    category: 'Flow & Diagrams',
    description: "Left circular completion progress gauge paired with checkable activation milestone rows.",
    iconName: 'ListChecks',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle checklist tasks (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Onboarding Tasks" },
      { key: 'ringScale', label: "Progress Ring Size", type: 'number', min: 0.16, max: 0.32, step: 0.01, defaultValue: 0.24 },
      { key: 'tasks', label: "Checklist Tasks", type: 'number', min: 2, max: 5, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Onboarding Tasks", ringScale: 0.24, tasks: 4 },
    jsSourceCode: `// Sitemap: Activation Checklist Widget (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.ringScale) || 0.24, 0.16, 0.32);
  const v2 = Math.round(helpers.clamp(Number(params.tasks) || 4, 2, 5));
  const t1 = (v1 - 0.16) / Math.max(0.001, 0.16);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'ringScale', label: \`Progress: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'tasks', label: \`Checklist: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'ringScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.16, 0.32, t);
    return { ...params, ringScale: Number(val.toFixed(2)) };
  }
  if (id === 'tasks') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, tasks: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.tasks) || 4);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, tasks: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.ringScale) || 0.24, 0.16, 0.32);
  const v2 = Math.round(helpers.clamp(Number(params.tasks) || 4, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const r = Math.min(width, height) * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.ellipsePath(pad + r + 4, cy, r, r), closed: true });
  paths.push({ nodes: helpers.arcNodes(pad + r + 4, cy, r * 0.7, r * 0.7, -90, 240), closed: false });
  const lx = pad * 2 + r * 2 + 6;
  const rh = (height - pad * 2) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(lx, pad + i * rh, width - lx - pad, rh * 0.7, 2), closed: true });
  }
  return paths;
}`,
  },

  // 122. Sitemap: Guided Product Tour Coachmark
  {
    id: 'sitemap-product-tour-tooltip',
    name: "Sitemap: Guided Product Tour Coachmark",
    category: 'Flow & Diagrams',
    description: "Highlighted UI target element tethered by pointer arrow to floating step-by-step coachmark card.",
    iconName: 'Compass',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle tour step dots (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Product Tour" },
      { key: 'tipWidth', label: "Popover Width Ratio", type: 'number', min: 0.42, max: 0.74, step: 0.01, defaultValue: 0.56 },
      { key: 'steps', label: "Tour Step Dots", type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Product Tour", tipWidth: 0.56, steps: 4 },
    jsSourceCode: `// Sitemap: Guided Product Tour Coachmark (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.tipWidth) || 0.56, 0.42, 0.74);
  const v2 = Math.round(helpers.clamp(Number(params.steps) || 4, 3, 6));
  const t1 = (v1 - 0.42) / Math.max(0.001, 0.32);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'tipWidth', label: \`Popover: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'steps', label: \`Tour: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'tipWidth') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.42, 0.74, t);
    return { ...params, tipWidth: Number(val.toFixed(2)) };
  }
  if (id === 'steps') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, steps: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.steps) || 4);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, steps: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.tipWidth) || 0.56, 0.42, 0.74);
  const v2 = Math.round(helpers.clamp(Number(params.steps) || 4, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const tw = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, pad, width * 0.34, height * 0.22, 3), closed: true });
  const tx = (width - tw) / 2;
  const ty = height * 0.42;
  const th = height * 0.46;
  paths.push({ nodes: helpers.polygonPath([{ x: width * 0.28, y: height * 0.32 }, { x: tx + tw * 0.3, y: ty }, { x: tx + tw * 0.44, y: ty }]), closed: true });
  paths.push({ nodes: helpers.rectPath(tx, ty, tw, th, 5), closed: true });
  for (let s = 0; s < v2; s++) {
    paths.push({ nodes: helpers.ellipsePath(tx + 12 + s * 10, ty + th - 9, 2.5, 2.5), closed: true });
  }
  return paths;
}`,
  },

  // 123. Sitemap: Zero-Data Empty State Card
  {
    id: 'sitemap-empty-state-onboarding',
    name: "Sitemap: Zero-Data Empty State Card",
    category: 'Flow & Diagrams',
    description: "Zero-data placeholder frame with corner ticks, central plus-circle emblem, and primary create CTA.",
    iconName: 'FolderPlus',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle frame corner ticks (1-2)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Empty State" },
      { key: 'emblemSize', label: "Center Emblem Size", type: 'number', min: 0.14, max: 0.3, step: 0.01, defaultValue: 0.2 },
      { key: 'ticks', label: "Frame Corner Ticks", type: 'number', min: 1, max: 2, step: 1, defaultValue: 1 },
    ],
    defaultParams: { label: "Empty State", emblemSize: 0.2, ticks: 1 },
    jsSourceCode: `// Sitemap: Zero-Data Empty State Card (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.emblemSize) || 0.2, 0.14, 0.3);
  const v2 = Math.round(helpers.clamp(Number(params.ticks) || 1, 1, 2));
  const t1 = (v1 - 0.14) / Math.max(0.001, 0.15999999999999998);
  const t2 = (v2 - 1) / Math.max(1, 1);
  return [
    { id: 'emblemSize', label: \`Center: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'ticks', label: \`Frame: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'emblemSize') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.14, 0.3, t);
    return { ...params, emblemSize: Number(val.toFixed(2)) };
  }
  if (id === 'ticks') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, ticks: Math.round(helpers.lerp(1, 2, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.ticks) || 1);
  const next = cur >= 2 ? 1 : cur + 1;
  return { ...params, ticks: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.emblemSize) || 0.2, 0.14, 0.3);
  const v2 = Math.round(helpers.clamp(Number(params.ticks) || 1, 1, 2));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const r = Math.min(width, height) * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.rectPath(pad * 1.4, pad * 1.2, width - pad * 2.8, height - pad * 2.4, 4), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, cy - 8, r, r), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx - r * 0.45, y: cy - 8 }, { x: cx + r * 0.45, y: cy - 8 }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: cy - 8 - r * 0.45 }, { x: cx, y: cy - 8 + r * 0.45 }], false), closed: false });
  for (let t = 0; t < v2; t++) {
    const ty = cy + r + 5 + t * 5;
    paths.push({ nodes: helpers.polygonPath([{ x: cx - width * 0.18, y: ty }, { x: cx + width * 0.18, y: ty }], false), closed: false });
  }
  paths.push({ nodes: helpers.rectPath(width * 0.3, height - pad * 2.6, width * 0.4, pad * 1.2, 4), closed: true });
  return paths;
}`,
  },

  // 124. Sitemap: Scheduled Maintenance Page
  {
    id: 'sitemap-maintenance-downtime',
    name: "Sitemap: Scheduled Maintenance Page",
    category: 'Flow & Diagrams',
    description: "Scheduled maintenance notice with hazard diamond/gear emblem, progress bar, and notify input.",
    iconName: 'Wrench',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle hazard stripes (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Maintenance Page" },
      { key: 'progress', label: "Maintenance Progress", type: 'number', min: 0.2, max: 0.88, step: 0.01, defaultValue: 0.6 },
      { key: 'stripes', label: "Hazard Stripes", type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Maintenance Page", progress: 0.6, stripes: 4 },
    jsSourceCode: `// Sitemap: Scheduled Maintenance Page (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.progress) || 0.6, 0.2, 0.88);
  const v2 = Math.round(helpers.clamp(Number(params.stripes) || 4, 3, 6));
  const t1 = (v1 - 0.2) / Math.max(0.001, 0.6799999999999999);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'progress', label: \`Maintenance: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'stripes', label: \`Hazard: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'progress') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.2, 0.88, t);
    return { ...params, progress: Number(val.toFixed(2)) };
  }
  if (id === 'stripes') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, stripes: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.stripes) || 4);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, stripes: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.progress) || 0.6, 0.2, 0.88);
  const v2 = Math.round(helpers.clamp(Number(params.stripes) || 4, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: pad * 1.2 }, { x: cx + 20, y: cy }, { x: cx - 20, y: cy }]), closed: true });
  const py = cy + 12;
  paths.push({ nodes: helpers.rectPath(pad * 1.5, py, width - pad * 3, 10, 5), closed: true });
  paths.push({ nodes: helpers.rectPath(pad * 1.5, py, (width - pad * 3) * v1, 10, 5), closed: true });
  for (let s = 0; s < v2; s++) {
    const sx = pad * 2 + (s * (width - pad * 4)) / Math.max(1, v2);
    paths.push({ nodes: helpers.polygonPath([{ x: sx, y: height - pad * 1.8 }, { x: sx + 8, y: height - pad * 0.8 }], false), closed: false });
  }
  return paths;
}`,
  },

  // 125. Sitemap: 500 Server Error & Retry
  {
    id: 'sitemap-error-500-retry',
    name: "Sitemap: 500 Server Error & Retry",
    category: 'Flow & Diagrams',
    description: "Server fault screen with warning triangle exclamation, diagnostic trace box, and retry button.",
    iconName: 'AlertTriangle',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle stack trace lines (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "500 Error Retry" },
      { key: 'triSize', label: "Warning Triangle Size", type: 'number', min: 0.16, max: 0.34, step: 0.01, defaultValue: 0.24 },
      { key: 'traceLines', label: "Stack Trace Lines", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "500 Error Retry", triSize: 0.24, traceLines: 3 },
    jsSourceCode: `// Sitemap: 500 Server Error & Retry (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.triSize) || 0.24, 0.16, 0.34);
  const v2 = Math.round(helpers.clamp(Number(params.traceLines) || 3, 2, 4));
  const t1 = (v1 - 0.16) / Math.max(0.001, 0.18000000000000002);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'triSize', label: \`Warning: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'traceLines', label: \`Stack: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'triSize') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.16, 0.34, t);
    return { ...params, triSize: Number(val.toFixed(2)) };
  }
  if (id === 'traceLines') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, traceLines: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.traceLines) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, traceLines: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.triSize) || 0.24, 0.16, 0.34);
  const v2 = Math.round(helpers.clamp(Number(params.traceLines) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const ts = Math.min(width, height) * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: pad }, { x: cx + ts, y: pad + ts * 1.5 }, { x: cx - ts, y: pad + ts * 1.5 }]), closed: true });
  const ty = pad * 1.5 + ts * 1.5;
  paths.push({ nodes: helpers.rectPath(pad * 1.4, ty, width - pad * 2.8, height - ty - pad * 1.4, 3), closed: true });
  for (let i = 0; i < v2; i++) {
    const ly = ty + 8 + i * 9;
    paths.push({ nodes: helpers.polygonPath([{ x: pad * 2, y: ly }, { x: width - pad * 2.4, y: ly }], false), closed: false });
  }
  return paths;
}`,
  },

  // 126. Sitemap: Offline Service Worker Cache
  {
    id: 'sitemap-offline-fallback-pwa',
    name: "Sitemap: Offline Service Worker Cache",
    category: 'Flow & Diagrams',
    description: "Offline PWA screen with slashed signal wave arc, cached route list, and reconnect CTA.",
    iconName: 'WifiOff',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle cached page rows (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Offline Fallback" },
      { key: 'arcScale', label: "Signal Arc Size", type: 'number', min: 0.16, max: 0.32, step: 0.01, defaultValue: 0.22 },
      { key: 'cached', label: "Cached Page Rows", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Offline Fallback", arcScale: 0.22, cached: 3 },
    jsSourceCode: `// Sitemap: Offline Service Worker Cache (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.arcScale) || 0.22, 0.16, 0.32);
  const v2 = Math.round(helpers.clamp(Number(params.cached) || 3, 2, 4));
  const t1 = (v1 - 0.16) / Math.max(0.001, 0.16);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'arcScale', label: \`Signal: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'cached', label: \`Cached: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'arcScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.16, 0.32, t);
    return { ...params, arcScale: Number(val.toFixed(2)) };
  }
  if (id === 'cached') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, cached: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.cached) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, cached: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.arcScale) || 0.22, 0.16, 0.32);
  const v2 = Math.round(helpers.clamp(Number(params.cached) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const ar = Math.min(width, height) * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.arcNodes(cx, pad + ar * 1.3, ar, ar, -145, 110), closed: false });
  paths.push({ nodes: helpers.arcNodes(cx, pad + ar * 1.3, ar * 0.62, ar * 0.62, -145, 110), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: cx - ar, y: pad + 4 }, { x: cx + ar, y: pad + ar * 1.5 }], false), closed: false });
  const cy0 = cy + 4;
  const rh = (height - cy0 - pad) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(pad * 1.5, cy0 + i * rh, width - pad * 3, rh * 0.72, 2), closed: true });
  }
  return paths;
}`,
  },

  // 127. Sitemap: Multi-Region i18n Route Switcher
  {
    id: 'sitemap-localization-i18n-hub',
    name: "Sitemap: Multi-Region i18n Route Switcher",
    category: 'Flow & Diagrams',
    description: "Top meridian globe root branching via orthogonal bus into localized `/en`, `/es`, `/de` sub-routes.",
    iconName: 'Languages',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle locale branches (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "i18n Route Hub" },
      { key: 'busY', label: "Route Bus Y Ratio", type: 'number', min: 0.42, max: 0.65, step: 0.01, defaultValue: 0.52 },
      { key: 'locales', label: "Locale Branches", type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "i18n Route Hub", busY: 0.52, locales: 3 },
    jsSourceCode: `// Sitemap: Multi-Region i18n Route Switcher (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.busY) || 0.52, 0.42, 0.65);
  const v2 = Math.round(helpers.clamp(Number(params.locales) || 3, 2, 5));
  const t1 = (v1 - 0.42) / Math.max(0.001, 0.23000000000000004);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'busY', label: \`Route: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'locales', label: \`Locale: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'busY') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.42, 0.65, t);
    return { ...params, busY: Number(val.toFixed(2)) };
  }
  if (id === 'locales') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, locales: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.locales) || 3);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, locales: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.busY) || 0.52, 0.42, 0.65);
  const v2 = Math.round(helpers.clamp(Number(params.locales) || 3, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const by = height * v1;
  const gr = Math.min(width, height) * 0.16;
  paths.push({ nodes: helpers.ellipsePath(cx, gr + 4, gr, gr), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, gr + 4, gr * 0.45, gr), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: gr * 2 + 4 }, { x: cx, y: by }], false), closed: false });
  const lw = (width - (v2 - 1) * 8) / v2;
  const lh = height - by - 14;
  paths.push({ nodes: helpers.polygonPath([{ x: lw / 2, y: by }, { x: width - lw / 2, y: by }], false), closed: false });
  for (let i = 0; i < v2; i++) {
    const lx = i * (lw + 8);
    paths.push({ nodes: helpers.polygonPath([{ x: lx + lw / 2, y: by }, { x: lx + lw / 2, y: by + 12 }], false), closed: false });
    paths.push({ nodes: helpers.rectPath(lx, by + 12, lw, lh, 3), closed: true });
  }
  return paths;
}`,
  },

  // 128. Sitemap: Instant Mobile Article View
  {
    id: 'sitemap-amp-instant-article',
    name: "Sitemap: Instant Mobile Article View",
    category: 'Flow & Diagrams',
    description: "Fast mobile reader card with top lightning bolt badge, hero image block, and typography rows.",
    iconName: 'Zap',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle paragraph blocks (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Instant Article" },
      { key: 'heroHeight', label: "Article Hero Height", type: 'number', min: 0.2, max: 0.42, step: 0.01, defaultValue: 0.28 },
      { key: 'paras', label: "Paragraph Blocks", type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Instant Article", heroHeight: 0.28, paras: 3 },
    jsSourceCode: `// Sitemap: Instant Mobile Article View (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.heroHeight) || 0.28, 0.2, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.paras) || 3, 2, 5));
  const t1 = (v1 - 0.2) / Math.max(0.001, 0.21999999999999997);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'heroHeight', label: \`Article: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'paras', label: \`Paragraph: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'heroHeight') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.2, 0.42, t);
    return { ...params, heroHeight: Number(val.toFixed(2)) };
  }
  if (id === 'paras') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, paras: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.paras) || 3);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, paras: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.heroHeight) || 0.28, 0.2, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.paras) || 3, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const hh = height * v1;
  paths.push({ nodes: helpers.rectPath(width * 0.1, 0, width * 0.8, height, 8), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx + 3, y: 6 }, { x: cx - 5, y: 15 }, { x: cx + 1, y: 15 }, { x: cx - 3, y: 24 }, { x: cx + 6, y: 13 }, { x: cx, y: 13 }]), closed: true });
  paths.push({ nodes: helpers.rectPath(width * 0.16, 28, width * 0.68, hh, 3), closed: true });
  const py = 34 + hh;
  const ph = (height - py - 8) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(width * 0.16, py + i * ph, width * 0.68, ph * 0.68, 2), closed: true });
  }
  return paths;
}`,
  },

  // 129. Flowchart: ISO Punched Card
  {
    id: 'flow-iso-card-punched',
    name: "Flowchart: ISO Punched Card",
    category: 'Flow & Diagrams',
    description: "ISO 5807 punched card input/output symbol with top-left diagonal clipped chamfer and punch track.",
    iconName: 'CreditCard',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle punch track holes (3-7)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Punched Card" },
      { key: 'clipRatio', label: "Corner Clip Size", type: 'number', min: 0.12, max: 0.36, step: 0.01, defaultValue: 0.22 },
      { key: 'holes', label: "Punch Track Holes", type: 'number', min: 3, max: 7, step: 1, defaultValue: 5 },
    ],
    defaultParams: { label: "Punched Card", clipRatio: 0.22, holes: 5 },
    jsSourceCode: `// Flowchart: ISO Punched Card (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.clipRatio) || 0.22, 0.12, 0.36);
  const v2 = Math.round(helpers.clamp(Number(params.holes) || 5, 3, 7));
  const t1 = (v1 - 0.12) / Math.max(0.001, 0.24);
  const t2 = (v2 - 3) / Math.max(1, 4);
  return [
    { id: 'clipRatio', label: \`Corner: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'holes', label: \`Punch: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'clipRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.12, 0.36, t);
    return { ...params, clipRatio: Number(val.toFixed(2)) };
  }
  if (id === 'holes') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, holes: Math.round(helpers.lerp(3, 7, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.holes) || 5);
  const next = cur >= 7 ? 3 : cur + 1;
  return { ...params, holes: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.clipRatio) || 0.22, 0.12, 0.36);
  const v2 = Math.round(helpers.clamp(Number(params.holes) || 5, 3, 7));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const cw = width * v1;
  const ch = height * v1;
  paths.push({ nodes: helpers.polygonPath([{ x: cw, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height }, { x: 0, y: ch }]), closed: true });
  for (let i = 0; i < v2; i++) {
    const hx = cw + 8 + (i * (width - cw - 20)) / Math.max(1, v2 - 1);
    paths.push({ nodes: helpers.rectPath(hx - 3, 10, 6, 9, 1), closed: true });
  }
  return paths;
}`,
  },

  // 130. Flowchart: ISO Punched Tape
  {
    id: 'flow-iso-paper-tape',
    name: "Flowchart: ISO Punched Tape",
    category: 'Flow & Diagrams',
    description: "ISO 5807 sequential punched paper tape banner with sinusoidal top and bottom wave edges.",
    iconName: 'Waves',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle feed sprocket dots (3-7)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Paper Tape" },
      { key: 'waveAmp', label: "Wave Amplitude", type: 'number', min: 0.06, max: 0.2, step: 0.01, defaultValue: 0.12 },
      { key: 'sprockets', label: "Feed Sprocket Dots", type: 'number', min: 3, max: 7, step: 1, defaultValue: 5 },
    ],
    defaultParams: { label: "Paper Tape", waveAmp: 0.12, sprockets: 5 },
    jsSourceCode: `// Flowchart: ISO Punched Tape (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.waveAmp) || 0.12, 0.06, 0.2);
  const v2 = Math.round(helpers.clamp(Number(params.sprockets) || 5, 3, 7));
  const t1 = (v1 - 0.06) / Math.max(0.001, 0.14);
  const t2 = (v2 - 3) / Math.max(1, 4);
  return [
    { id: 'waveAmp', label: \`Wave: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'sprockets', label: \`Feed: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'waveAmp') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.06, 0.2, t);
    return { ...params, waveAmp: Number(val.toFixed(2)) };
  }
  if (id === 'sprockets') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, sprockets: Math.round(helpers.lerp(3, 7, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.sprockets) || 5);
  const next = cur >= 7 ? 3 : cur + 1;
  return { ...params, sprockets: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.waveAmp) || 0.12, 0.06, 0.2);
  const v2 = Math.round(helpers.clamp(Number(params.sprockets) || 5, 3, 7));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const amp = height * v1;
  const topY = amp;
  const botY = height - amp;
  paths.push({ nodes: [
    helpers.cornerNode(0, topY),
    helpers.smoothNode(cx, topY, width * 0.25, topY - amp * 1.4, width * 0.75, topY + amp * 1.4),
    helpers.cornerNode(width, topY),
    helpers.cornerNode(width, botY),
    helpers.smoothNode(cx, botY, width * 0.75, botY + amp * 1.4, width * 0.25, botY - amp * 1.4),
    helpers.cornerNode(0, botY)
  ], closed: true });
  for (let i = 0; i < v2; i++) {
    const sx = helpers.lerp(width * 0.16, width * 0.84, i / Math.max(1, v2 - 1));
    paths.push({ nodes: helpers.ellipsePath(sx, cy, 3.5, 3.5), closed: true });
  }
  return paths;
}`,
  },

  // 131. Flowchart: Transmittal Tape
  {
    id: 'flow-iso-transmittal-tape',
    name: "Flowchart: Transmittal Tape",
    category: 'Flow & Diagrams',
    description: "Batch control total / transmittal tape symbol with flat top and angled bottom-right tear-off point.",
    iconName: 'Receipt',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle batch total lines (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Transmittal Tape" },
      { key: 'tailDepth', label: "Tear-Off Tail Depth", type: 'number', min: 0.14, max: 0.36, step: 0.01, defaultValue: 0.24 },
      { key: 'lines', label: "Batch Total Lines", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Transmittal Tape", tailDepth: 0.24, lines: 3 },
    jsSourceCode: `// Flowchart: Transmittal Tape (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.tailDepth) || 0.24, 0.14, 0.36);
  const v2 = Math.round(helpers.clamp(Number(params.lines) || 3, 2, 4));
  const t1 = (v1 - 0.14) / Math.max(0.001, 0.21999999999999997);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'tailDepth', label: \`Tear-Off: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'lines', label: \`Batch: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'tailDepth') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.14, 0.36, t);
    return { ...params, tailDepth: Number(val.toFixed(2)) };
  }
  if (id === 'lines') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, lines: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.lines) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, lines: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.tailDepth) || 0.24, 0.14, 0.36);
  const v2 = Math.round(helpers.clamp(Number(params.lines) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const td = height * v1;
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: width * 0.72, y: height - td }, { x: 0, y: height - td }]), closed: true });
  for (let i = 0; i < v2; i++) {
    const ly = 14 + i * ((height - td - 24) / Math.max(1, v2));
    paths.push({ nodes: helpers.polygonPath([{ x: pad * 1.5, y: ly }, { x: width - pad * 1.5, y: ly }], false), closed: false });
  }
  return paths;
}`,
  },

  // 132. Flowchart: Online Storage (Curved Side)
  {
    id: 'flow-iso-online-storage',
    name: "Flowchart: Online Storage (Curved Side)",
    category: 'Flow & Diagrams',
    description: "ISO 5807 online storage symbol with convex left nose and concave right crescent boundary.",
    iconName: 'Database',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle storage track lines (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Online Storage" },
      { key: 'curveDepth', label: "Crescent Curve Depth", type: 'number', min: 0.12, max: 0.32, step: 0.01, defaultValue: 0.2 },
      { key: 'tracks', label: "Storage Track Lines", type: 'number', min: 2, max: 4, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "Online Storage", curveDepth: 0.2, tracks: 2 },
    jsSourceCode: `// Flowchart: Online Storage (Curved Side) (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.curveDepth) || 0.2, 0.12, 0.32);
  const v2 = Math.round(helpers.clamp(Number(params.tracks) || 2, 2, 4));
  const t1 = (v1 - 0.12) / Math.max(0.001, 0.2);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'curveDepth', label: \`Crescent: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'tracks', label: \`Storage: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'curveDepth') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.12, 0.32, t);
    return { ...params, curveDepth: Number(val.toFixed(2)) };
  }
  if (id === 'tracks') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, tracks: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.tracks) || 2);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, tracks: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.curveDepth) || 0.2, 0.12, 0.32);
  const v2 = Math.round(helpers.clamp(Number(params.tracks) || 2, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const cd = width * v1;
  paths.push({ nodes: [
    helpers.cornerNode(cd, 0),
    helpers.cornerNode(width, 0),
    helpers.smoothNode(width - cd, cy, width - cd * 0.3, height * 0.2, width - cd * 0.3, height * 0.8),
    helpers.cornerNode(width, height),
    helpers.cornerNode(cd, height),
    helpers.smoothNode(0, cy, cd * 0.2, height * 0.8, cd * 0.2, height * 0.2)
  ], closed: true });
  for (let i = 1; i <= v2; i++) {
    const x = cd + (i * (width - cd * 2.2)) / (v2 + 1);
    paths.push({ nodes: helpers.polygonPath([{ x, y: 8 }, { x: x - cd * 0.35, y: cy }, { x, y: height - 8 }], false), closed: false });
  }
  return paths;
}`,
  },

  // 133. Flowchart: Magnetic Disk Array
  {
    id: 'flow-iso-magnetic-disk',
    name: "Flowchart: Magnetic Disk Array",
    category: 'Flow & Diagrams',
    description: "Multi-platter magnetic disk cylinder with stacked elliptical platter rings and read/write actuator.",
    iconName: 'HardDrive',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle disk platters (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Magnetic Disk" },
      { key: 'capRatio', label: "Platter Ellipse Ratio", type: 'number', min: 0.12, max: 0.26, step: 0.01, defaultValue: 0.18 },
      { key: 'platters', label: "Disk Platters", type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Magnetic Disk", capRatio: 0.18, platters: 3 },
    jsSourceCode: `// Flowchart: Magnetic Disk Array (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.capRatio) || 0.18, 0.12, 0.26);
  const v2 = Math.round(helpers.clamp(Number(params.platters) || 3, 2, 5));
  const t1 = (v1 - 0.12) / Math.max(0.001, 0.14);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'capRatio', label: \`Platter: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'platters', label: \`Disk: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'capRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.12, 0.26, t);
    return { ...params, capRatio: Number(val.toFixed(2)) };
  }
  if (id === 'platters') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, platters: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.platters) || 3);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, platters: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.capRatio) || 0.18, 0.12, 0.26);
  const v2 = Math.round(helpers.clamp(Number(params.platters) || 3, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const ry = height * v1;
  const rx = width * 0.44;
  paths.push({ nodes: helpers.rectPath(cx - rx, ry, rx * 2, height - ry * 2, 4), closed: true });
  for (let i = 0; i < v2; i++) {
    const py = helpers.lerp(ry, height - ry, i / Math.max(1, v2 - 1));
    paths.push({ nodes: helpers.ellipsePath(cx, py, rx, ry * 0.72), closed: true });
  }
  paths.push({ nodes: helpers.polygonPath([{ x: width - 2, y: cy }, { x: cx + rx * 0.3, y: cy - 6 }], false), closed: false });
  return paths;
}`,
  },

  // 134. Flowchart: Core Memory Matrix
  {
    id: 'flow-iso-core-memory',
    name: "Flowchart: Core Memory Matrix",
    category: 'Flow & Diagrams',
    description: "ISO magnetic core RAM symbol with perpendicular X/Y sense lines and central ferrite core ring.",
    iconName: 'Cpu',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle ferrite core rings (1-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Core Memory" },
      { key: 'marginRatio', label: "Bus Line Inset", type: 'number', min: 0.14, max: 0.32, step: 0.01, defaultValue: 0.2 },
      { key: 'cores', label: "Ferrite Core Rings", type: 'number', min: 1, max: 4, step: 1, defaultValue: 1 },
    ],
    defaultParams: { label: "Core Memory", marginRatio: 0.2, cores: 1 },
    jsSourceCode: `// Flowchart: Core Memory Matrix (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.marginRatio) || 0.2, 0.14, 0.32);
  const v2 = Math.round(helpers.clamp(Number(params.cores) || 1, 1, 4));
  const t1 = (v1 - 0.14) / Math.max(0.001, 0.18);
  const t2 = (v2 - 1) / Math.max(1, 3);
  return [
    { id: 'marginRatio', label: \`Bus: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'cores', label: \`Ferrite: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'marginRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.14, 0.32, t);
    return { ...params, marginRatio: Number(val.toFixed(2)) };
  }
  if (id === 'cores') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, cores: Math.round(helpers.lerp(1, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.cores) || 1);
  const next = cur >= 4 ? 1 : cur + 1;
  return { ...params, cores: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.marginRatio) || 0.2, 0.14, 0.32);
  const v2 = Math.round(helpers.clamp(Number(params.cores) || 1, 1, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const m = Math.min(width, height) * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 3), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: m, y: 0 }, { x: m, y: height }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: m }, { x: width, y: m }], false), closed: false });
  for (let i = 0; i < v2; i++) {
    const r = Math.min(width, height) * (0.14 + i * 0.06);
    paths.push({ nodes: helpers.ellipsePath(cx + m * 0.25, cy + m * 0.25, r, r), closed: true });
  }
  return paths;
}`,
  },

  // 135. Flowchart: Extract / Split Triangle
  {
    id: 'flow-iso-extract-triangle',
    name: "Flowchart: Extract / Split Triangle",
    category: 'Flow & Diagrams',
    description: "Upward-pointing ISO extract triangle splitting a single set into filtered subset streams.",
    iconName: 'Triangle',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle internal split lines (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Extract Split" },
      { key: 'apexX', label: "Apex Horizontal Shift", type: 'number', min: 0.3, max: 0.7, step: 0.01, defaultValue: 0.5 },
      { key: 'branches', label: "Internal Split Lines", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Extract Split", apexX: 0.5, branches: 3 },
    jsSourceCode: `// Flowchart: Extract / Split Triangle (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.apexX) || 0.5, 0.3, 0.7);
  const v2 = Math.round(helpers.clamp(Number(params.branches) || 3, 2, 4));
  const t1 = (v1 - 0.3) / Math.max(0.001, 0.39999999999999997);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'apexX', label: \`Apex: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'branches', label: \`Internal: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'apexX') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.3, 0.7, t);
    return { ...params, apexX: Number(val.toFixed(2)) };
  }
  if (id === 'branches') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, branches: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.branches) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, branches: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.apexX) || 0.5, 0.3, 0.7);
  const v2 = Math.round(helpers.clamp(Number(params.branches) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const ax = width * v1;
  paths.push({ nodes: helpers.polygonPath([{ x: ax, y: 0 }, { x: width, y: height }, { x: 0, y: height }]), closed: true });
  for (let i = 1; i <= v2; i++) {
    const bx = helpers.lerp(width * 0.2, width * 0.8, i / (v2 + 1));
    paths.push({ nodes: helpers.polygonPath([{ x: ax, y: height * 0.22 }, { x: bx, y: height - 6 }], false), closed: false });
  }
  return paths;
}`,
  },

  // 136. Flowchart: Sort Operation Diamond
  {
    id: 'flow-iso-sort-diamond',
    name: "Flowchart: Sort Operation Diamond",
    category: 'Flow & Diagrams',
    description: "ISO 5807 sort diamond divided by a horizontal equator with upper and lower ordering chevrons.",
    iconName: 'ArrowUpDown',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle sort arrows (1-2)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Sort Operation" },
      { key: 'midRatio', label: "Equator Y Ratio", type: 'number', min: 0.35, max: 0.65, step: 0.01, defaultValue: 0.5 },
      { key: 'chevrons', label: "Sort Arrows", type: 'number', min: 1, max: 2, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "Sort Operation", midRatio: 0.5, chevrons: 2 },
    jsSourceCode: `// Flowchart: Sort Operation Diamond (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.midRatio) || 0.5, 0.35, 0.65);
  const v2 = Math.round(helpers.clamp(Number(params.chevrons) || 2, 1, 2));
  const t1 = (v1 - 0.35) / Math.max(0.001, 0.30000000000000004);
  const t2 = (v2 - 1) / Math.max(1, 1);
  return [
    { id: 'midRatio', label: \`Equator: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'chevrons', label: \`Sort: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'midRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.35, 0.65, t);
    return { ...params, midRatio: Number(val.toFixed(2)) };
  }
  if (id === 'chevrons') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, chevrons: Math.round(helpers.lerp(1, 2, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.chevrons) || 2);
  const next = cur >= 2 ? 1 : cur + 1;
  return { ...params, chevrons: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.midRatio) || 0.5, 0.35, 0.65);
  const v2 = Math.round(helpers.clamp(Number(params.chevrons) || 2, 1, 2));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const my = height * v1;
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: 0 }, { x: width, y: my }, { x: cx, y: height }, { x: 0, y: my }]), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: my }, { x: width, y: my }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: cx - 10, y: my * 0.65 }, { x: cx, y: my * 0.35 }, { x: cx + 10, y: my * 0.65 }], false), closed: false });
  if (v2 > 1) {
    paths.push({ nodes: helpers.polygonPath([{ x: cx - 10, y: my + (height - my) * 0.35 }, { x: cx, y: my + (height - my) * 0.65 }, { x: cx + 10, y: my + (height - my) * 0.35 }], false), closed: false });
  }
  return paths;
}`,
  },

  // 137. Flowchart: Collate Bowtie / Hourglass
  {
    id: 'flow-iso-collate-hourglass',
    name: "Flowchart: Collate Bowtie / Hourglass",
    category: 'Flow & Diagrams',
    description: "Opposing upper and lower triangles meeting at a central pinch waist for merge-extract collation.",
    iconName: 'Minimize2',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle cross collar lines (1-3)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Collate Merge" },
      { key: 'waistWidth', label: "Center Waist Width", type: 'number', min: 0.02, max: 0.28, step: 0.01, defaultValue: 0.08 },
      { key: 'bars', label: "Cross Collar Lines", type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "Collate Merge", waistWidth: 0.08, bars: 2 },
    jsSourceCode: `// Flowchart: Collate Bowtie / Hourglass (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.waistWidth) || 0.08, 0.02, 0.28);
  const v2 = Math.round(helpers.clamp(Number(params.bars) || 2, 1, 3));
  const t1 = (v1 - 0.02) / Math.max(0.001, 0.26);
  const t2 = (v2 - 1) / Math.max(1, 2);
  return [
    { id: 'waistWidth', label: \`Center: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'bars', label: \`Cross: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'waistWidth') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.02, 0.28, t);
    return { ...params, waistWidth: Number(val.toFixed(2)) };
  }
  if (id === 'bars') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, bars: Math.round(helpers.lerp(1, 3, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.bars) || 2);
  const next = cur >= 3 ? 1 : cur + 1;
  return { ...params, bars: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.waistWidth) || 0.08, 0.02, 0.28);
  const v2 = Math.round(helpers.clamp(Number(params.bars) || 2, 1, 3));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const ww = width * v1;
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: 0 }, { x: width, y: 0 }, { x: cx + ww, y: cy }, { x: width, y: height }, { x: 0, y: height }, { x: cx - ww, y: cy }]), closed: true });
  for (let i = 1; i <= v2; i++) {
    const dy = (height * 0.22 * i) / v2;
    paths.push({ nodes: helpers.polygonPath([{ x: width * 0.26, y: cy - dy }, { x: width * 0.74, y: cy - dy }], false), closed: false });
    paths.push({ nodes: helpers.polygonPath([{ x: width * 0.26, y: cy + dy }, { x: width * 0.74, y: cy + dy }], false), closed: false });
  }
  return paths;
}`,
  },

  // 138. Flowchart: Summing Junction (Cross)
  {
    id: 'flow-iso-summing-junction',
    name: "Flowchart: Summing Junction (Cross)",
    category: 'Flow & Diagrams',
    description: "Circular control-loop summing junction with inscribed 45-degree diagonal X cross and +/- ticks.",
    iconName: 'PlusCircle',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle quadrant signs (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Summing Node" },
      { key: 'innerScale', label: "Cross Span Ratio", type: 'number', min: 0.55, max: 0.85, step: 0.01, defaultValue: 0.7 },
      { key: 'ticks', label: "Quadrant Signs", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Summing Node", innerScale: 0.7, ticks: 3 },
    jsSourceCode: `// Flowchart: Summing Junction (Cross) (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.innerScale) || 0.7, 0.55, 0.85);
  const v2 = Math.round(helpers.clamp(Number(params.ticks) || 3, 2, 4));
  const t1 = (v1 - 0.55) / Math.max(0.001, 0.29999999999999993);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'innerScale', label: \`Cross: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'ticks', label: \`Quadrant: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'innerScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.55, 0.85, t);
    return { ...params, innerScale: Number(val.toFixed(2)) };
  }
  if (id === 'ticks') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, ticks: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.ticks) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, ticks: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.innerScale) || 0.7, 0.55, 0.85);
  const v2 = Math.round(helpers.clamp(Number(params.ticks) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const rx = width / 2;
  const ry = height / 2;
  const d = v1 * 0.707;
  paths.push({ nodes: helpers.ellipsePath(cx, cy, rx, ry), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx - rx * d, y: cy - ry * d }, { x: cx + rx * d, y: cy + ry * d }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: cx + rx * d, y: cy - ry * d }, { x: cx - rx * d, y: cy + ry * d }], false), closed: false });
  for (let i = 0; i < v2; i++) {
    const a = (i * Math.PI) / 2;
    paths.push({ nodes: helpers.ellipsePath(cx + Math.cos(a) * rx * 0.58, cy + Math.sin(a) * ry * 0.58, 3, 3), closed: true });
  }
  return paths;
}`,
  },

  // 139. Flowchart: Logical OR Junction (Plus)
  {
    id: 'flow-iso-or-junction',
    name: "Flowchart: Logical OR Junction (Plus)",
    category: 'Flow & Diagrams',
    description: "Circular logical OR junction with orthogonal + crosshairs and concentric center hub.",
    iconName: 'CircleDot',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle outer ring mode (1-2)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "OR Junction" },
      { key: 'hubRatio', label: "Center Hub Ratio", type: 'number', min: 0.15, max: 0.4, step: 0.01, defaultValue: 0.25 },
      { key: 'rings', label: "Outer Ring Mode", type: 'number', min: 1, max: 2, step: 1, defaultValue: 1 },
    ],
    defaultParams: { label: "OR Junction", hubRatio: 0.25, rings: 1 },
    jsSourceCode: `// Flowchart: Logical OR Junction (Plus) (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.hubRatio) || 0.25, 0.15, 0.4);
  const v2 = Math.round(helpers.clamp(Number(params.rings) || 1, 1, 2));
  const t1 = (v1 - 0.15) / Math.max(0.001, 0.25);
  const t2 = (v2 - 1) / Math.max(1, 1);
  return [
    { id: 'hubRatio', label: \`Center: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'rings', label: \`Outer: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'hubRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.15, 0.4, t);
    return { ...params, hubRatio: Number(val.toFixed(2)) };
  }
  if (id === 'rings') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, rings: Math.round(helpers.lerp(1, 2, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.rings) || 1);
  const next = cur >= 2 ? 1 : cur + 1;
  return { ...params, rings: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.hubRatio) || 0.25, 0.15, 0.4);
  const v2 = Math.round(helpers.clamp(Number(params.rings) || 1, 1, 2));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const rx = width / 2;
  const ry = height / 2;
  paths.push({ nodes: helpers.ellipsePath(cx, cy, rx, ry), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: 4, y: cy }, { x: width - 4, y: cy }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: 4 }, { x: cx, y: height - 4 }], false), closed: false });
  paths.push({ nodes: helpers.ellipsePath(cx, cy, rx * v1, ry * v1), closed: true });
  if (v2 > 1) paths.push({ nodes: helpers.ellipsePath(cx, cy, rx * v1 * 0.55, ry * v1 * 0.55), closed: true });
  return paths;
}`,
  },

  // 140. Flowchart: Digital AND Logic Gate
  {
    id: 'flow-iso-and-gate',
    name: "Flowchart: Digital AND Logic Gate",
    category: 'Flow & Diagrams',
    description: "IEEE/IEC digital AND logic gate with flat input edge, semicircular D-nose, and input/output leads.",
    iconName: 'Cpu',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle input pins (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "AND Gate" },
      { key: 'leadRatio', label: "Pin Lead Length", type: 'number', min: 0.1, max: 0.28, step: 0.01, defaultValue: 0.18 },
      { key: 'inputs', label: "Input Pins", type: 'number', min: 2, max: 4, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "AND Gate", leadRatio: 0.18, inputs: 2 },
    jsSourceCode: `// Flowchart: Digital AND Logic Gate (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.leadRatio) || 0.18, 0.1, 0.28);
  const v2 = Math.round(helpers.clamp(Number(params.inputs) || 2, 2, 4));
  const t1 = (v1 - 0.1) / Math.max(0.001, 0.18000000000000002);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'leadRatio', label: \`Pin: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'inputs', label: \`Input: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'leadRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.1, 0.28, t);
    return { ...params, leadRatio: Number(val.toFixed(2)) };
  }
  if (id === 'inputs') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, inputs: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.inputs) || 2);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, inputs: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.leadRatio) || 0.18, 0.1, 0.28);
  const v2 = Math.round(helpers.clamp(Number(params.inputs) || 2, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const lw = width * v1;
  const gx = lw;
  const gw = width - lw * 2;
  paths.push({ nodes: [
    helpers.cornerNode(gx, 4),
    helpers.cornerNode(gx + gw * 0.5, 4),
    helpers.smoothNode(gx + gw, cy, gx + gw * 0.85, 4, gx + gw, cy - height * 0.28),
    helpers.smoothNode(gx + gw * 0.5, height - 4, gx + gw, cy + height * 0.28, gx + gw * 0.85, height - 4),
    helpers.cornerNode(gx, height - 4)
  ], closed: true });
  for (let i = 0; i < v2; i++) {
    const py = helpers.lerp(height * 0.24, height * 0.76, i / Math.max(1, v2 - 1));
    paths.push({ nodes: helpers.polygonPath([{ x: 0, y: py }, { x: gx, y: py }], false), closed: false });
  }
  paths.push({ nodes: helpers.polygonPath([{ x: gx + gw, y: cy }, { x: width, y: cy }], false), closed: false });
  return paths;
}`,
  },

  // 141. Flowchart: Digital OR Logic Gate
  {
    id: 'flow-iso-or-gate',
    name: "Flowchart: Digital OR Logic Gate",
    category: 'Flow & Diagrams',
    description: "IEEE/IEC digital OR logic gate with concave input arc, ogive pointed nose, and pin leads.",
    iconName: 'Cpu',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle input pins (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "OR Gate" },
      { key: 'curveBack', label: "Back Concavity", type: 'number', min: 0.1, max: 0.28, step: 0.01, defaultValue: 0.18 },
      { key: 'inputs', label: "Input Pins", type: 'number', min: 2, max: 4, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "OR Gate", curveBack: 0.18, inputs: 2 },
    jsSourceCode: `// Flowchart: Digital OR Logic Gate (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.curveBack) || 0.18, 0.1, 0.28);
  const v2 = Math.round(helpers.clamp(Number(params.inputs) || 2, 2, 4));
  const t1 = (v1 - 0.1) / Math.max(0.001, 0.18000000000000002);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'curveBack', label: \`Back: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'inputs', label: \`Input: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'curveBack') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.1, 0.28, t);
    return { ...params, curveBack: Number(val.toFixed(2)) };
  }
  if (id === 'inputs') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, inputs: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.inputs) || 2);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, inputs: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.curveBack) || 0.18, 0.1, 0.28);
  const v2 = Math.round(helpers.clamp(Number(params.inputs) || 2, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const cb = width * v1;
  const lx = width * 0.14;
  const rx = width * 0.86;
  paths.push({ nodes: [
    helpers.cornerNode(lx, 4),
    helpers.smoothNode(rx, cy, width * 0.55, 4, rx - 8, cy - 12),
    helpers.cornerNode(lx, height - 4),
    helpers.smoothNode(lx + cb, cy, lx + cb, height * 0.72, lx + cb, height * 0.28)
  ], closed: true });
  for (let i = 0; i < v2; i++) {
    const py = helpers.lerp(height * 0.26, height * 0.74, i / Math.max(1, v2 - 1));
    paths.push({ nodes: helpers.polygonPath([{ x: 0, y: py }, { x: lx + cb * 0.7, y: py }], false), closed: false });
  }
  paths.push({ nodes: helpers.polygonPath([{ x: rx, y: cy }, { x: width, y: cy }], false), closed: false });
  return paths;
}`,
  },

  // 142. Flowchart: Digital XOR Logic Gate
  {
    id: 'flow-iso-xor-gate',
    name: "Flowchart: Digital XOR Logic Gate",
    category: 'Flow & Diagrams',
    description: "Exclusive-OR logic gate with dual parallel concave input arcs and pointed ogive output.",
    iconName: 'Cpu',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle input pins (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "XOR Gate" },
      { key: 'arcGap', label: "Dual Arc Spacing", type: 'number', min: 0.06, max: 0.16, step: 0.01, defaultValue: 0.1 },
      { key: 'inputs', label: "Input Pins", type: 'number', min: 2, max: 4, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "XOR Gate", arcGap: 0.1, inputs: 2 },
    jsSourceCode: `// Flowchart: Digital XOR Logic Gate (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.arcGap) || 0.1, 0.06, 0.16);
  const v2 = Math.round(helpers.clamp(Number(params.inputs) || 2, 2, 4));
  const t1 = (v1 - 0.06) / Math.max(0.001, 0.1);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'arcGap', label: \`Dual: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'inputs', label: \`Input: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'arcGap') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.06, 0.16, t);
    return { ...params, arcGap: Number(val.toFixed(2)) };
  }
  if (id === 'inputs') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, inputs: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.inputs) || 2);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, inputs: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.arcGap) || 0.1, 0.06, 0.16);
  const v2 = Math.round(helpers.clamp(Number(params.inputs) || 2, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const gap = width * v1;
  const lx = width * 0.18;
  const rx = width * 0.86;
  paths.push({ nodes: [
    helpers.cornerNode(lx, 4),
    helpers.smoothNode(rx, cy, width * 0.56, 4, rx - 8, cy - 12),
    helpers.cornerNode(lx, height - 4),
    helpers.smoothNode(lx + gap * 1.1, cy, lx + gap * 1.1, height * 0.72, lx + gap * 1.1, height * 0.28)
  ], closed: true });
  paths.push({ nodes: [
    helpers.cornerNode(lx - gap, 6),
    helpers.smoothNode(lx, cy, lx, height * 0.3, lx, height * 0.7),
    helpers.cornerNode(lx - gap, height - 6)
  ], closed: false });
  for (let i = 0; i < v2; i++) {
    const py = helpers.lerp(height * 0.28, height * 0.72, i / Math.max(1, v2 - 1));
    paths.push({ nodes: helpers.polygonPath([{ x: 0, y: py }, { x: lx - gap * 0.2, y: py }], false), closed: false });
  }
  paths.push({ nodes: helpers.polygonPath([{ x: rx, y: cy }, { x: width, y: cy }], false), closed: false });
  return paths;
}`,
  },

  // 143. Flowchart: NAND / Inverter Bubble Gate
  {
    id: 'flow-iso-nand-inverter',
    name: "Flowchart: NAND / Inverter Bubble Gate",
    category: 'Flow & Diagrams',
    description: "Inverting logic gate with output negation bubble ring and adjustable pin leads.",
    iconName: 'Cpu',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle input pins (1-3)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "NAND / NOT Gate" },
      { key: 'bubbleR', label: "Inverter Bubble Size", type: 'number', min: 0.05, max: 0.14, step: 0.01, defaultValue: 0.08 },
      { key: 'inputs', label: "Input Pins", type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "NAND / NOT Gate", bubbleR: 0.08, inputs: 2 },
    jsSourceCode: `// Flowchart: NAND / Inverter Bubble Gate (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.bubbleR) || 0.08, 0.05, 0.14);
  const v2 = Math.round(helpers.clamp(Number(params.inputs) || 2, 1, 3));
  const t1 = (v1 - 0.05) / Math.max(0.001, 0.09000000000000001);
  const t2 = (v2 - 1) / Math.max(1, 2);
  return [
    { id: 'bubbleR', label: \`Inverter: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'inputs', label: \`Input: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'bubbleR') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.05, 0.14, t);
    return { ...params, bubbleR: Number(val.toFixed(2)) };
  }
  if (id === 'inputs') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, inputs: Math.round(helpers.lerp(1, 3, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.inputs) || 2);
  const next = cur >= 3 ? 1 : cur + 1;
  return { ...params, inputs: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.bubbleR) || 0.08, 0.05, 0.14);
  const v2 = Math.round(helpers.clamp(Number(params.inputs) || 2, 1, 3));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const br = Math.min(width, height) * v1;
  const gx = width * 0.14;
  const noseX = width * 0.78 - br * 2;
  paths.push({ nodes: helpers.polygonPath([{ x: gx, y: 8 }, { x: noseX, y: cy }, { x: gx, y: height - 8 }]), closed: true });
  paths.push({ nodes: helpers.ellipsePath(noseX + br, cy, br, br), closed: true });
  for (let i = 0; i < v2; i++) {
    const py = v2 === 1 ? cy : helpers.lerp(height * 0.28, height * 0.72, i / (v2 - 1));
    paths.push({ nodes: helpers.polygonPath([{ x: 0, y: py }, { x: gx, y: py }], false), closed: false });
  }
  paths.push({ nodes: helpers.polygonPath([{ x: noseX + br * 2, y: cy }, { x: width, y: cy }], false), closed: false });
  return paths;
}`,
  },

  // 144. Flowchart: Multiplexer (MUX) Trapezoid
  {
    id: 'flow-iso-multiplexer-mux',
    name: "Flowchart: Multiplexer (MUX) Trapezoid",
    category: 'Flow & Diagrams',
    description: "Right-tapering multiplexer trapezoid with N left data inputs, bottom select lines, and 1 output.",
    iconName: 'GitMerge',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle mux data inputs (2-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "MUX N:1" },
      { key: 'taperRatio', label: "Right Edge Taper", type: 'number', min: 0.15, max: 0.36, step: 0.01, defaultValue: 0.24 },
      { key: 'inputs', label: "MUX Data Inputs", type: 'number', min: 2, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "MUX N:1", taperRatio: 0.24, inputs: 4 },
    jsSourceCode: `// Flowchart: Multiplexer (MUX) Trapezoid (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.taperRatio) || 0.24, 0.15, 0.36);
  const v2 = Math.round(helpers.clamp(Number(params.inputs) || 4, 2, 6));
  const t1 = (v1 - 0.15) / Math.max(0.001, 0.21);
  const t2 = (v2 - 2) / Math.max(1, 4);
  return [
    { id: 'taperRatio', label: \`Right: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'inputs', label: \`MUX: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'taperRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.15, 0.36, t);
    return { ...params, taperRatio: Number(val.toFixed(2)) };
  }
  if (id === 'inputs') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, inputs: Math.round(helpers.lerp(2, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.inputs) || 4);
  const next = cur >= 6 ? 2 : cur + 1;
  return { ...params, inputs: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.taperRatio) || 0.24, 0.15, 0.36);
  const v2 = Math.round(helpers.clamp(Number(params.inputs) || 4, 2, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const tp = height * v1;
  const lx = width * 0.18;
  const rx = width * 0.82;
  paths.push({ nodes: helpers.polygonPath([{ x: lx, y: 0 }, { x: rx, y: tp }, { x: rx, y: height - tp }, { x: lx, y: height }]), closed: true });
  for (let i = 0; i < v2; i++) {
    const py = helpers.lerp(height * 0.18, height * 0.82, i / Math.max(1, v2 - 1));
    paths.push({ nodes: helpers.polygonPath([{ x: 0, y: py }, { x: lx, y: py }], false), closed: false });
  }
  paths.push({ nodes: helpers.polygonPath([{ x: rx, y: cy }, { x: width, y: cy }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: height - tp * 0.5 }, { x: cx, y: height }], false), closed: false });
  return paths;
}`,
  },

  // 145. Flowchart: Demultiplexer (DEMUX)
  {
    id: 'flow-iso-demultiplexer-demux',
    name: "Flowchart: Demultiplexer (DEMUX)",
    category: 'Flow & Diagrams',
    description: "Left-tapering demultiplexer trapezoid with 1 data input, bottom select pin, and N right outputs.",
    iconName: 'GitBranch',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle demux outputs (2-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "DEMUX 1:N" },
      { key: 'taperRatio', label: "Left Edge Taper", type: 'number', min: 0.15, max: 0.36, step: 0.01, defaultValue: 0.24 },
      { key: 'outputs', label: "DEMUX Outputs", type: 'number', min: 2, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "DEMUX 1:N", taperRatio: 0.24, outputs: 4 },
    jsSourceCode: `// Flowchart: Demultiplexer (DEMUX) (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.taperRatio) || 0.24, 0.15, 0.36);
  const v2 = Math.round(helpers.clamp(Number(params.outputs) || 4, 2, 6));
  const t1 = (v1 - 0.15) / Math.max(0.001, 0.21);
  const t2 = (v2 - 2) / Math.max(1, 4);
  return [
    { id: 'taperRatio', label: \`Left: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'outputs', label: \`DEMUX: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'taperRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.15, 0.36, t);
    return { ...params, taperRatio: Number(val.toFixed(2)) };
  }
  if (id === 'outputs') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, outputs: Math.round(helpers.lerp(2, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.outputs) || 4);
  const next = cur >= 6 ? 2 : cur + 1;
  return { ...params, outputs: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.taperRatio) || 0.24, 0.15, 0.36);
  const v2 = Math.round(helpers.clamp(Number(params.outputs) || 4, 2, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const tp = height * v1;
  const lx = width * 0.18;
  const rx = width * 0.82;
  paths.push({ nodes: helpers.polygonPath([{ x: lx, y: tp }, { x: rx, y: 0 }, { x: rx, y: height }, { x: lx, y: height - tp }]), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: cy }, { x: lx, y: cy }], false), closed: false });
  for (let i = 0; i < v2; i++) {
    const py = helpers.lerp(height * 0.18, height * 0.82, i / Math.max(1, v2 - 1));
    paths.push({ nodes: helpers.polygonPath([{ x: rx, y: py }, { x: width, y: py }], false), closed: false });
  }
  return paths;
}`,
  },

  // 146. Flowchart: Communications Link / Lightning
  {
    id: 'flow-iso-transfer-interrupt',
    name: "Flowchart: Communications Link / Lightning",
    category: 'Flow & Diagrams',
    description: "ISO 5807 telecommunication link & interrupt zigzag lightning bolt arrow.",
    iconName: 'Zap',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle arrowhead scale (10-24)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Comm Link Interrupt" },
      { key: 'jogSpread', label: "Zigzag Jog Width", type: 'number', min: 0.15, max: 0.42, step: 0.01, defaultValue: 0.28 },
      { key: 'headSize', label: "Arrowhead Scale", type: 'number', min: 10, max: 24, step: 1, defaultValue: 16 },
    ],
    defaultParams: { label: "Comm Link Interrupt", jogSpread: 0.28, headSize: 16 },
    jsSourceCode: `// Flowchart: Communications Link / Lightning (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.jogSpread) || 0.28, 0.15, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.headSize) || 16, 10, 24));
  const t1 = (v1 - 0.15) / Math.max(0.001, 0.27);
  const t2 = (v2 - 10) / Math.max(1, 14);
  return [
    { id: 'jogSpread', label: \`Zigzag: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'headSize', label: \`Arrowhead: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'jogSpread') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.15, 0.42, t);
    return { ...params, jogSpread: Number(val.toFixed(2)) };
  }
  if (id === 'headSize') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, headSize: Math.round(helpers.lerp(10, 24, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.headSize) || 16);
  const next = cur >= 24 ? 10 : cur + 1;
  return { ...params, headSize: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.jogSpread) || 0.28, 0.15, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.headSize) || 16, 10, 24));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const jw = width * v1;
  const hs = v2;
  paths.push({ nodes: helpers.polygonPath([
    { x: width * 0.15, y: height * 0.1 },
    { x: cx + jw, y: cy - 6 },
    { x: cx - jw * 0.4, y: cy + 4 },
    { x: width * 0.85, y: height * 0.9 }
  ], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([
    { x: width * 0.85, y: height * 0.9 },
    { x: width * 0.85 - hs, y: height * 0.9 - hs * 0.25 },
    { x: width * 0.85 - hs * 0.25, y: height * 0.9 - hs }
  ]), closed: true });
  return paths;
}`,
  },

  // 147. Flowchart: On-Page Reference Circle
  {
    id: 'flow-iso-page-connector-circle',
    name: "Flowchart: On-Page Reference Circle",
    category: 'Flow & Diagrams',
    description: "Indexed on-page flowchart connector circle with concentric inner ring and cardinal port ticks.",
    iconName: 'Circle',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle cardinal port ticks (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Ref Node (A)" },
      { key: 'innerRatio', label: "Inner Ring Ratio", type: 'number', min: 0.55, max: 0.85, step: 0.01, defaultValue: 0.72 },
      { key: 'ports', label: "Cardinal Port Ticks", type: 'number', min: 2, max: 4, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Ref Node (A)", innerRatio: 0.72, ports: 4 },
    jsSourceCode: `// Flowchart: On-Page Reference Circle (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.innerRatio) || 0.72, 0.55, 0.85);
  const v2 = Math.round(helpers.clamp(Number(params.ports) || 4, 2, 4));
  const t1 = (v1 - 0.55) / Math.max(0.001, 0.29999999999999993);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'innerRatio', label: \`Inner: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'ports', label: \`Cardinal: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'innerRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.55, 0.85, t);
    return { ...params, innerRatio: Number(val.toFixed(2)) };
  }
  if (id === 'ports') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, ports: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.ports) || 4);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, ports: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.innerRatio) || 0.72, 0.55, 0.85);
  const v2 = Math.round(helpers.clamp(Number(params.ports) || 4, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const r = Math.min(width, height) * 0.46;
  paths.push({ nodes: helpers.ellipsePath(cx, cy, r, r), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, cy, r * v1, r * v1), closed: true });
  for (let i = 0; i < v2; i++) {
    const a = (i * Math.PI * 2) / v2;
    paths.push({ nodes: helpers.polygonPath([{ x: cx + Math.cos(a) * r * v1, y: cy + Math.sin(a) * r * v1 }, { x: cx + Math.cos(a) * (r + 5), y: cy + Math.sin(a) * (r + 5) }], false), closed: false });
  }
  return paths;
}`,
  },

  // 148. Flowchart: Off-Page Home Plate Pentagon
  {
    id: 'flow-iso-offpage-pentagon',
    name: "Flowchart: Off-Page Home Plate Pentagon",
    category: 'Flow & Diagrams',
    description: "Downward-pointing home-plate off-page reference pentagon with top sheet header bar.",
    iconName: 'Pentagon',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle header stripe ratio (0.16-0.32)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Off-Page Ref" },
      { key: 'pointY', label: "Shoulder Y Ratio", type: 'number', min: 0.52, max: 0.82, step: 0.01, defaultValue: 0.68 },
      { key: 'headerRatio', label: "Header Stripe Ratio", type: 'number', min: 0.16, max: 0.32, step: 0.01, defaultValue: 0.22 },
    ],
    defaultParams: { label: "Off-Page Ref", pointY: 0.68, headerRatio: 0.22 },
    jsSourceCode: `// Flowchart: Off-Page Home Plate Pentagon (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.pointY) || 0.68, 0.52, 0.82);
  const v2 = helpers.clamp(Number(params.headerRatio) || 0.22, 0.16, 0.32);
  const t1 = (v1 - 0.52) / Math.max(0.001, 0.29999999999999993);
  const t2 = (v2 - 0.16) / Math.max(0.001, 0.16);
  return [
    { id: 'pointY', label: \`Shoulder: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'headerRatio', label: \`Header: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'pointY') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.52, 0.82, t);
    return { ...params, pointY: Number(val.toFixed(2)) };
  }
  if (id === 'headerRatio') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, headerRatio: Number(helpers.lerp(0.16, 0.32, t).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Number(params.headerRatio) || 0.22;
  const next = cur + 0.05 > 0.32 + 0.001 ? 0.16 : Number((cur + 0.05).toFixed(2));
  return { ...params, headerRatio: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.pointY) || 0.68, 0.52, 0.82);
  const v2 = helpers.clamp(Number(params.headerRatio) || 0.22, 0.16, 0.32);
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const py = height * v1;
  const hh = height * v2;
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: py }, { x: cx, y: height }, { x: 0, y: py }]), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: hh }, { x: width, y: hh }], false), closed: false });
  return paths;
}`,
  },

  // 149. Flowchart: Loop Begin Trapezoid
  {
    id: 'flow-iso-loop-start-trap',
    name: "Flowchart: Loop Begin Trapezoid",
    category: 'Flow & Diagrams',
    description: "Top-beveled hexagonal loop initialization block (FOR / WHILE entry condition).",
    iconName: 'Repeat',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle condition lines (1-3)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Loop Start" },
      { key: 'bevelRatio', label: "Top Corner Bevel", type: 'number', min: 0.14, max: 0.36, step: 0.01, defaultValue: 0.24 },
      { key: 'bars', label: "Condition Lines", type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "Loop Start", bevelRatio: 0.24, bars: 2 },
    jsSourceCode: `// Flowchart: Loop Begin Trapezoid (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.bevelRatio) || 0.24, 0.14, 0.36);
  const v2 = Math.round(helpers.clamp(Number(params.bars) || 2, 1, 3));
  const t1 = (v1 - 0.14) / Math.max(0.001, 0.21999999999999997);
  const t2 = (v2 - 1) / Math.max(1, 2);
  return [
    { id: 'bevelRatio', label: \`Top: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'bars', label: \`Condition: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'bevelRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.14, 0.36, t);
    return { ...params, bevelRatio: Number(val.toFixed(2)) };
  }
  if (id === 'bars') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, bars: Math.round(helpers.lerp(1, 3, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.bars) || 2);
  const next = cur >= 3 ? 1 : cur + 1;
  return { ...params, bars: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.bevelRatio) || 0.24, 0.14, 0.36);
  const v2 = Math.round(helpers.clamp(Number(params.bars) || 2, 1, 3));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const bv = Math.min(width, height) * v1;
  paths.push({ nodes: helpers.polygonPath([{ x: bv, y: 0 }, { x: width - bv, y: 0 }, { x: width, y: bv }, { x: width, y: height }, { x: 0, y: height }, { x: 0, y: bv }]), closed: true });
  for (let i = 1; i <= v2; i++) {
    const ly = bv + (i * (height - bv - 8)) / (v2 + 1);
    paths.push({ nodes: helpers.polygonPath([{ x: 12, y: ly }, { x: width - 12, y: ly }], false), closed: false });
  }
  return paths;
}`,
  },

  // 150. Flowchart: Loop End Trapezoid
  {
    id: 'flow-iso-loop-end-trap',
    name: "Flowchart: Loop End Trapezoid",
    category: 'Flow & Diagrams',
    description: "Bottom-beveled hexagonal loop foot block (NEXT / UNTIL return boundary).",
    iconName: 'CornerUpLeft',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle footer lines (1-3)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Loop End" },
      { key: 'bevelRatio', label: "Bottom Corner Bevel", type: 'number', min: 0.14, max: 0.36, step: 0.01, defaultValue: 0.24 },
      { key: 'bars', label: "Footer Lines", type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "Loop End", bevelRatio: 0.24, bars: 2 },
    jsSourceCode: `// Flowchart: Loop End Trapezoid (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.bevelRatio) || 0.24, 0.14, 0.36);
  const v2 = Math.round(helpers.clamp(Number(params.bars) || 2, 1, 3));
  const t1 = (v1 - 0.14) / Math.max(0.001, 0.21999999999999997);
  const t2 = (v2 - 1) / Math.max(1, 2);
  return [
    { id: 'bevelRatio', label: \`Bottom: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'bars', label: \`Footer: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'bevelRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.14, 0.36, t);
    return { ...params, bevelRatio: Number(val.toFixed(2)) };
  }
  if (id === 'bars') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, bars: Math.round(helpers.lerp(1, 3, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.bars) || 2);
  const next = cur >= 3 ? 1 : cur + 1;
  return { ...params, bars: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.bevelRatio) || 0.24, 0.14, 0.36);
  const v2 = Math.round(helpers.clamp(Number(params.bars) || 2, 1, 3));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const bv = Math.min(width, height) * v1;
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height - bv }, { x: width - bv, y: height }, { x: bv, y: height }, { x: 0, y: height - bv }]), closed: true });
  for (let i = 1; i <= v2; i++) {
    const ly = (i * (height - bv - 8)) / (v2 + 1);
    paths.push({ nodes: helpers.polygonPath([{ x: 12, y: ly }, { x: width - 12, y: ly }], false), closed: false });
  }
  return paths;
}`,
  },

  // 151. Flowchart: Alternate Process Box
  {
    id: 'flow-iso-alternate-process',
    name: "Flowchart: Alternate Process Box",
    category: 'Flow & Diagrams',
    description: "Rounded alternate-flow process box with inset secondary frame and corner tick marks.",
    iconName: 'SquareStack',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle corner radius (px) (8-28)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Alternate Process" },
      { key: 'insetRatio', label: "Inner Frame Inset", type: 'number', min: 0.06, max: 0.18, step: 0.01, defaultValue: 0.1 },
      { key: 'radius', label: "Corner Radius (px)", type: 'number', min: 8, max: 28, step: 1, defaultValue: 16 },
    ],
    defaultParams: { label: "Alternate Process", insetRatio: 0.1, radius: 16 },
    jsSourceCode: `// Flowchart: Alternate Process Box (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.insetRatio) || 0.1, 0.06, 0.18);
  const v2 = Math.round(helpers.clamp(Number(params.radius) || 16, 8, 28));
  const t1 = (v1 - 0.06) / Math.max(0.001, 0.12);
  const t2 = (v2 - 8) / Math.max(1, 20);
  return [
    { id: 'insetRatio', label: \`Inner: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'radius', label: \`Corner: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'insetRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.06, 0.18, t);
    return { ...params, insetRatio: Number(val.toFixed(2)) };
  }
  if (id === 'radius') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, radius: Math.round(helpers.lerp(8, 28, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.radius) || 16);
  const next = cur >= 28 ? 8 : cur + 1;
  return { ...params, radius: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.insetRatio) || 0.1, 0.06, 0.18);
  const v2 = Math.round(helpers.clamp(Number(params.radius) || 16, 8, 28));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const ins = Math.min(width, height) * v1;
  const rad = v2;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, rad), closed: true });
  paths.push({ nodes: helpers.rectPath(ins, ins, width - ins * 2, height - ins * 2, Math.max(4, rad - 4)), closed: true });
  return paths;
}`,
  },

  // 152. Flowchart: Critical Path Process
  {
    id: 'flow-iso-critical-path-step',
    name: "Flowchart: Critical Path Process",
    category: 'Flow & Diagrams',
    description: "Double-walled critical path process node with 4 triangular corner reinforcement gussets.",
    iconName: 'Flame',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle double wall mode (1-2)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Critical Path" },
      { key: 'cornerSize', label: "Corner Gusset Size", type: 'number', min: 0.12, max: 0.28, step: 0.01, defaultValue: 0.18 },
      { key: 'doubleWall', label: "Double Wall Mode", type: 'number', min: 1, max: 2, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "Critical Path", cornerSize: 0.18, doubleWall: 2 },
    jsSourceCode: `// Flowchart: Critical Path Process (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.cornerSize) || 0.18, 0.12, 0.28);
  const v2 = Math.round(helpers.clamp(Number(params.doubleWall) || 2, 1, 2));
  const t1 = (v1 - 0.12) / Math.max(0.001, 0.16000000000000003);
  const t2 = (v2 - 1) / Math.max(1, 1);
  return [
    { id: 'cornerSize', label: \`Corner: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'doubleWall', label: \`Double: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'cornerSize') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.12, 0.28, t);
    return { ...params, cornerSize: Number(val.toFixed(2)) };
  }
  if (id === 'doubleWall') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, doubleWall: Math.round(helpers.lerp(1, 2, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.doubleWall) || 2);
  const next = cur >= 2 ? 1 : cur + 1;
  return { ...params, doubleWall: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.cornerSize) || 0.18, 0.12, 0.28);
  const v2 = Math.round(helpers.clamp(Number(params.doubleWall) || 2, 1, 2));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const cs = Math.min(width, height) * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 2), closed: true });
  if (v2 > 1) paths.push({ nodes: helpers.rectPath(pad * 0.8, pad * 0.8, width - pad * 1.6, height - pad * 1.6, 2), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: 0 }, { x: cs, y: 0 }, { x: 0, y: cs }]), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: width - cs, y: 0 }, { x: width, y: 0 }, { x: width, y: cs }]), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: height - cs }, { x: cs, y: height }, { x: 0, y: height }]), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: width - cs, y: height }, { x: width, y: height - cs }, { x: width, y: height }]), closed: true });
  return paths;
}`,
  },

  // 153. Flowchart: Manual Offline File
  {
    id: 'flow-iso-manual-file-triangle',
    name: "Flowchart: Manual Offline File",
    category: 'Flow & Diagrams',
    description: "Inverted equilateral triangle representing physical/offline archival filing storage.",
    iconName: 'Archive',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle internal file tabs (1-3)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Offline File" },
      { key: 'lipRatio', label: "Top Filing Lip Height", type: 'number', min: 0.1, max: 0.26, step: 0.01, defaultValue: 0.16 },
      { key: 'dividers', label: "Internal File Tabs", type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "Offline File", lipRatio: 0.16, dividers: 2 },
    jsSourceCode: `// Flowchart: Manual Offline File (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.lipRatio) || 0.16, 0.1, 0.26);
  const v2 = Math.round(helpers.clamp(Number(params.dividers) || 2, 1, 3));
  const t1 = (v1 - 0.1) / Math.max(0.001, 0.16);
  const t2 = (v2 - 1) / Math.max(1, 2);
  return [
    { id: 'lipRatio', label: \`Top: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'dividers', label: \`Internal: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'lipRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.1, 0.26, t);
    return { ...params, lipRatio: Number(val.toFixed(2)) };
  }
  if (id === 'dividers') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, dividers: Math.round(helpers.lerp(1, 3, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.dividers) || 2);
  const next = cur >= 3 ? 1 : cur + 1;
  return { ...params, dividers: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.lipRatio) || 0.16, 0.1, 0.26);
  const v2 = Math.round(helpers.clamp(Number(params.dividers) || 2, 1, 3));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const lip = height * v1;
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: 0 }, { x: width, y: 0 }, { x: cx, y: height }]), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: width * 0.08, y: lip }, { x: width * 0.92, y: lip }], false), closed: false });
  for (let i = 1; i <= v2; i++) {
    const ty = lip + (i * (height - lip) * 0.55) / (v2 + 1);
    const span = (1 - ty / height) * width * 0.42;
    paths.push({ nodes: helpers.polygonPath([{ x: cx - span, y: ty }, { x: cx + span, y: ty }], false), closed: false });
  }
  return paths;
}`,
  },

  // 154. Flowchart: Telecontrol Wave Signal
  {
    id: 'flow-iso-telecontrol-signal',
    name: "Flowchart: Telecontrol Wave Signal",
    category: 'Flow & Diagrams',
    description: "Remote telecontrol process block topped by concentric radiating RF wave arcs.",
    iconName: 'Radio',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle radiated rf arcs (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Telecontrol Node" },
      { key: 'bodyRatio', label: "Process Box Height", type: 'number', min: 0.5, max: 0.78, step: 0.01, defaultValue: 0.64 },
      { key: 'waves', label: "Radiated RF Arcs", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Telecontrol Node", bodyRatio: 0.64, waves: 3 },
    jsSourceCode: `// Flowchart: Telecontrol Wave Signal (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.bodyRatio) || 0.64, 0.5, 0.78);
  const v2 = Math.round(helpers.clamp(Number(params.waves) || 3, 2, 4));
  const t1 = (v1 - 0.5) / Math.max(0.001, 0.28);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'bodyRatio', label: \`Process: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'waves', label: \`Radiated: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'bodyRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.5, 0.78, t);
    return { ...params, bodyRatio: Number(val.toFixed(2)) };
  }
  if (id === 'waves') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, waves: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.waves) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, waves: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.bodyRatio) || 0.64, 0.5, 0.78);
  const v2 = Math.round(helpers.clamp(Number(params.waves) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const bh = height * v1;
  const by = height - bh;
  paths.push({ nodes: helpers.rectPath(0, by, width, bh, 4), closed: true });
  for (let i = 1; i <= v2; i++) {
    const r = (by * 0.85 * i) / v2;
    paths.push({ nodes: helpers.arcNodes(cx, by - 2, r * 1.3, r, -155, 130), closed: false });
  }
  return paths;
}`,
  },

  // 155. BPMN: Message Start Event
  {
    id: 'flow-bpmn-start-message',
    name: "BPMN: Message Start Event",
    category: 'Flow & Diagrams',
    description: "BPMN 2.0 single-ring Message Start Event with centered envelope trigger icon.",
    iconName: 'Mail',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle envelope flap ratio (0.3-0.6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Msg Start" },
      { key: 'iconScale', label: "Envelope Icon Scale", type: 'number', min: 0.32, max: 0.62, step: 0.01, defaultValue: 0.46 },
      { key: 'flapDepth', label: "Envelope Flap Ratio", type: 'number', min: 0.3, max: 0.6, step: 0.01, defaultValue: 0.45 },
    ],
    defaultParams: { label: "Msg Start", iconScale: 0.46, flapDepth: 0.45 },
    jsSourceCode: `// BPMN: Message Start Event (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.iconScale) || 0.46, 0.32, 0.62);
  const v2 = helpers.clamp(Number(params.flapDepth) || 0.45, 0.3, 0.6);
  const t1 = (v1 - 0.32) / Math.max(0.001, 0.3);
  const t2 = (v2 - 0.3) / Math.max(0.001, 0.3);
  return [
    { id: 'iconScale', label: \`Envelope: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'flapDepth', label: \`Envelope: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'iconScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.32, 0.62, t);
    return { ...params, iconScale: Number(val.toFixed(2)) };
  }
  if (id === 'flapDepth') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, flapDepth: Number(helpers.lerp(0.3, 0.6, t).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Number(params.flapDepth) || 0.45;
  const next = cur + 0.1 > 0.6 + 0.001 ? 0.3 : Number((cur + 0.1).toFixed(2));
  return { ...params, flapDepth: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.iconScale) || 0.46, 0.32, 0.62);
  const v2 = helpers.clamp(Number(params.flapDepth) || 0.45, 0.3, 0.6);
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const r = Math.min(width, height) * 0.46;
  const ew = r * v1 * 1.35;
  const eh = r * v1 * 0.95;
  paths.push({ nodes: helpers.ellipsePath(cx, cy, r, r), closed: true });
  paths.push({ nodes: helpers.rectPath(cx - ew / 2, cy - eh / 2, ew, eh, 2), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx - ew / 2, y: cy - eh / 2 }, { x: cx, y: cy - eh / 2 + eh * v2 }, { x: cx + ew / 2, y: cy - eh / 2 }], false), closed: false });
  return paths;
}`,
  },

  // 156. BPMN: Timer Start Event
  {
    id: 'flow-bpmn-start-timer',
    name: "BPMN: Timer Start Event",
    category: 'Flow & Diagrams',
    description: "BPMN 2.0 Timer Start Event with circular clock dial, 12 tick marks, and adjustable hands.",
    iconName: 'Clock',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle minute hand step (1-12)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Timer Start" },
      { key: 'dialScale', label: "Clock Dial Ratio", type: 'number', min: 0.55, max: 0.84, step: 0.01, defaultValue: 0.72 },
      { key: 'handAngle', label: "Minute Hand Step", type: 'number', min: 1, max: 12, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Timer Start", dialScale: 0.72, handAngle: 4 },
    jsSourceCode: `// BPMN: Timer Start Event (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.dialScale) || 0.72, 0.55, 0.84);
  const v2 = Math.round(helpers.clamp(Number(params.handAngle) || 4, 1, 12));
  const t1 = (v1 - 0.55) / Math.max(0.001, 0.2899999999999999);
  const t2 = (v2 - 1) / Math.max(1, 11);
  return [
    { id: 'dialScale', label: \`Clock: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'handAngle', label: \`Minute: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'dialScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.55, 0.84, t);
    return { ...params, dialScale: Number(val.toFixed(2)) };
  }
  if (id === 'handAngle') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, handAngle: Math.round(helpers.lerp(1, 12, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.handAngle) || 4);
  const next = cur >= 12 ? 1 : cur + 1;
  return { ...params, handAngle: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.dialScale) || 0.72, 0.55, 0.84);
  const v2 = Math.round(helpers.clamp(Number(params.handAngle) || 4, 1, 12));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const r = Math.min(width, height) * 0.46;
  const dr = r * v1;
  paths.push({ nodes: helpers.ellipsePath(cx, cy, r, r), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, cy, dr, dr), closed: true });
  const a = (v2 * Math.PI) / 6 - Math.PI / 2;
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: cy - dr * 0.55 }, { x: cx, y: cy }, { x: cx + Math.cos(a) * dr * 0.78, y: cy + Math.sin(a) * dr * 0.78 }], false), closed: false });
  return paths;
}`,
  },

  // 157. BPMN: Signal Start Event
  {
    id: 'flow-bpmn-start-signal',
    name: "BPMN: Signal Start Event",
    category: 'Flow & Diagrams',
    description: "BPMN 2.0 broadcast Signal Start Event with inscribed equilateral triangle marker.",
    iconName: 'Triangle',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle double triangle mode (1-2)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Signal Start" },
      { key: 'triScale', label: "Signal Triangle Scale", type: 'number', min: 0.36, max: 0.68, step: 0.01, defaultValue: 0.52 },
      { key: 'innerRing', label: "Double Triangle Mode", type: 'number', min: 1, max: 2, step: 1, defaultValue: 1 },
    ],
    defaultParams: { label: "Signal Start", triScale: 0.52, innerRing: 1 },
    jsSourceCode: `// BPMN: Signal Start Event (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.triScale) || 0.52, 0.36, 0.68);
  const v2 = Math.round(helpers.clamp(Number(params.innerRing) || 1, 1, 2));
  const t1 = (v1 - 0.36) / Math.max(0.001, 0.32000000000000006);
  const t2 = (v2 - 1) / Math.max(1, 1);
  return [
    { id: 'triScale', label: \`Signal: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'innerRing', label: \`Double: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'triScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.36, 0.68, t);
    return { ...params, triScale: Number(val.toFixed(2)) };
  }
  if (id === 'innerRing') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, innerRing: Math.round(helpers.lerp(1, 2, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.innerRing) || 1);
  const next = cur >= 2 ? 1 : cur + 1;
  return { ...params, innerRing: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.triScale) || 0.52, 0.36, 0.68);
  const v2 = Math.round(helpers.clamp(Number(params.innerRing) || 1, 1, 2));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const r = Math.min(width, height) * 0.46;
  const ts = r * v1;
  paths.push({ nodes: helpers.ellipsePath(cx, cy, r, r), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: cy - ts }, { x: cx + ts * 0.9, y: cy + ts * 0.7 }, { x: cx - ts * 0.9, y: cy + ts * 0.7 }]), closed: true });
  if (v2 > 1) paths.push({ nodes: helpers.polygonPath([{ x: cx, y: cy - ts * 0.58 }, { x: cx + ts * 0.52, y: cy + ts * 0.42 }, { x: cx - ts * 0.52, y: cy + ts * 0.42 }]), closed: true });
  return paths;
}`,
  },

  // 158. BPMN: Intermediate Catch Event
  {
    id: 'flow-bpmn-intermediate-catch',
    name: "BPMN: Intermediate Catch Event",
    category: 'Flow & Diagrams',
    description: "BPMN 2.0 double-ring Intermediate Catch Event with inward message arrow marker.",
    iconName: 'Download',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle catch marker scale (0.3-0.55)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Catch Event" },
      { key: 'ringGap', label: "Double Ring Gap", type: 'number', min: 0.08, max: 0.2, step: 0.01, defaultValue: 0.12 },
      { key: 'arrowScale', label: "Catch Marker Scale", type: 'number', min: 0.3, max: 0.55, step: 0.01, defaultValue: 0.42 },
    ],
    defaultParams: { label: "Catch Event", ringGap: 0.12, arrowScale: 0.42 },
    jsSourceCode: `// BPMN: Intermediate Catch Event (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.ringGap) || 0.12, 0.08, 0.2);
  const v2 = helpers.clamp(Number(params.arrowScale) || 0.42, 0.3, 0.55);
  const t1 = (v1 - 0.08) / Math.max(0.001, 0.12000000000000001);
  const t2 = (v2 - 0.3) / Math.max(0.001, 0.25);
  return [
    { id: 'ringGap', label: \`Double: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'arrowScale', label: \`Catch: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'ringGap') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.08, 0.2, t);
    return { ...params, ringGap: Number(val.toFixed(2)) };
  }
  if (id === 'arrowScale') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, arrowScale: Number(helpers.lerp(0.3, 0.55, t).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Number(params.arrowScale) || 0.42;
  const next = cur + 0.08 > 0.55 + 0.001 ? 0.3 : Number((cur + 0.08).toFixed(2));
  return { ...params, arrowScale: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.ringGap) || 0.12, 0.08, 0.2);
  const v2 = helpers.clamp(Number(params.arrowScale) || 0.42, 0.3, 0.55);
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const r = Math.min(width, height) * 0.46;
  const ri = r * (1 - v1);
  paths.push({ nodes: helpers.ellipsePath(cx, cy, r, r), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, cy, ri, ri), closed: true });
  const aw = ri * v2;
  paths.push({ nodes: helpers.polygonPath([{ x: cx - aw, y: cy - aw * 0.5 }, { x: cx + aw * 0.2, y: cy - aw * 0.5 }, { x: cx + aw * 0.2, y: cy - aw }, { x: cx + aw, y: cy }, { x: cx + aw * 0.2, y: cy + aw }, { x: cx + aw * 0.2, y: cy + aw * 0.5 }, { x: cx - aw, y: cy + aw * 0.5 }]), closed: true });
  return paths;
}`,
  },

  // 159. BPMN: Escalation Event
  {
    id: 'flow-bpmn-intermediate-escalation',
    name: "BPMN: Escalation Event",
    category: 'Flow & Diagrams',
    description: "BPMN 2.0 double-ring Escalation Event with upward delta dart chevron.",
    iconName: 'ChevronUp',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle chevron notch depth (0.2-0.5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Escalation" },
      { key: 'ringGap', label: "Double Ring Gap", type: 'number', min: 0.08, max: 0.2, step: 0.01, defaultValue: 0.12 },
      { key: 'dartNotch', label: "Chevron Notch Depth", type: 'number', min: 0.2, max: 0.5, step: 0.01, defaultValue: 0.32 },
    ],
    defaultParams: { label: "Escalation", ringGap: 0.12, dartNotch: 0.32 },
    jsSourceCode: `// BPMN: Escalation Event (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.ringGap) || 0.12, 0.08, 0.2);
  const v2 = helpers.clamp(Number(params.dartNotch) || 0.32, 0.2, 0.5);
  const t1 = (v1 - 0.08) / Math.max(0.001, 0.12000000000000001);
  const t2 = (v2 - 0.2) / Math.max(0.001, 0.3);
  return [
    { id: 'ringGap', label: \`Double: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'dartNotch', label: \`Chevron: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'ringGap') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.08, 0.2, t);
    return { ...params, ringGap: Number(val.toFixed(2)) };
  }
  if (id === 'dartNotch') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, dartNotch: Number(helpers.lerp(0.2, 0.5, t).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Number(params.dartNotch) || 0.32;
  const next = cur + 0.1 > 0.5 + 0.001 ? 0.2 : Number((cur + 0.1).toFixed(2));
  return { ...params, dartNotch: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.ringGap) || 0.12, 0.08, 0.2);
  const v2 = helpers.clamp(Number(params.dartNotch) || 0.32, 0.2, 0.5);
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const r = Math.min(width, height) * 0.46;
  const ri = r * (1 - v1);
  const ds = ri * 0.62;
  paths.push({ nodes: helpers.ellipsePath(cx, cy, r, r), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, cy, ri, ri), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: cy - ds }, { x: cx + ds * 0.75, y: cy + ds * 0.75 }, { x: cx, y: cy + ds * (0.75 - v2) }, { x: cx - ds * 0.75, y: cy + ds * 0.75 }]), closed: true });
  return paths;
}`,
  },

  // 160. BPMN: Compensation Rewind Event
  {
    id: 'flow-bpmn-intermediate-compensation',
    name: "BPMN: Compensation Rewind Event",
    category: 'Flow & Diagrams',
    description: "BPMN 2.0 double-ring Compensation Event with twin left-pointing rewind triangles.",
    iconName: 'Rewind',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle rewind icon scale (0.32-0.58)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Compensate" },
      { key: 'ringGap', label: "Double Ring Gap", type: 'number', min: 0.08, max: 0.2, step: 0.01, defaultValue: 0.12 },
      { key: 'triScale', label: "Rewind Icon Scale", type: 'number', min: 0.32, max: 0.58, step: 0.01, defaultValue: 0.44 },
    ],
    defaultParams: { label: "Compensate", ringGap: 0.12, triScale: 0.44 },
    jsSourceCode: `// BPMN: Compensation Rewind Event (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.ringGap) || 0.12, 0.08, 0.2);
  const v2 = helpers.clamp(Number(params.triScale) || 0.44, 0.32, 0.58);
  const t1 = (v1 - 0.08) / Math.max(0.001, 0.12000000000000001);
  const t2 = (v2 - 0.32) / Math.max(0.001, 0.26);
  return [
    { id: 'ringGap', label: \`Double: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'triScale', label: \`Rewind: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'ringGap') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.08, 0.2, t);
    return { ...params, ringGap: Number(val.toFixed(2)) };
  }
  if (id === 'triScale') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, triScale: Number(helpers.lerp(0.32, 0.58, t).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Number(params.triScale) || 0.44;
  const next = cur + 0.09 > 0.58 + 0.001 ? 0.32 : Number((cur + 0.09).toFixed(2));
  return { ...params, triScale: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.ringGap) || 0.12, 0.08, 0.2);
  const v2 = helpers.clamp(Number(params.triScale) || 0.44, 0.32, 0.58);
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const r = Math.min(width, height) * 0.46;
  const ri = r * (1 - v1);
  const ts = ri * v2;
  paths.push({ nodes: helpers.ellipsePath(cx, cy, r, r), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, cy, ri, ri), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx - ts * 1.1, y: cy }, { x: cx, y: cy - ts * 0.75 }, { x: cx, y: cy + ts * 0.75 }]), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: cy }, { x: cx + ts * 1.1, y: cy - ts * 0.75 }, { x: cx + ts * 1.1, y: cy + ts * 0.75 }]), closed: true });
  return paths;
}`,
  },

  // 161. BPMN: Terminate End Event
  {
    id: 'flow-bpmn-end-terminate',
    name: "BPMN: Terminate End Event",
    category: 'Flow & Diagrams',
    description: "BPMN 2.0 heavy-bordered Terminate End Event with solid inner bullseye core.",
    iconName: 'Disc',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle outer rim inset (0.06-0.16)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Terminate End" },
      { key: 'coreRatio', label: "Bullseye Core Ratio", type: 'number', min: 0.35, max: 0.72, step: 0.01, defaultValue: 0.54 },
      { key: 'rimThick', label: "Outer Rim Inset", type: 'number', min: 0.06, max: 0.16, step: 0.01, defaultValue: 0.1 },
    ],
    defaultParams: { label: "Terminate End", coreRatio: 0.54, rimThick: 0.1 },
    jsSourceCode: `// BPMN: Terminate End Event (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.coreRatio) || 0.54, 0.35, 0.72);
  const v2 = helpers.clamp(Number(params.rimThick) || 0.1, 0.06, 0.16);
  const t1 = (v1 - 0.35) / Math.max(0.001, 0.37);
  const t2 = (v2 - 0.06) / Math.max(0.001, 0.1);
  return [
    { id: 'coreRatio', label: \`Bullseye: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'rimThick', label: \`Outer: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'coreRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.35, 0.72, t);
    return { ...params, coreRatio: Number(val.toFixed(2)) };
  }
  if (id === 'rimThick') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, rimThick: Number(helpers.lerp(0.06, 0.16, t).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Number(params.rimThick) || 0.1;
  const next = cur + 0.03 > 0.16 + 0.001 ? 0.06 : Number((cur + 0.03).toFixed(2));
  return { ...params, rimThick: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.coreRatio) || 0.54, 0.35, 0.72);
  const v2 = helpers.clamp(Number(params.rimThick) || 0.1, 0.06, 0.16);
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const r = Math.min(width, height) * 0.46;
  paths.push({ nodes: helpers.ellipsePath(cx, cy, r, r), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, cy, r * (1 - v2), r * (1 - v2)), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, cy, r * v1, r * v1), closed: true });
  return paths;
}`,
  },

  // 162. BPMN: Error End Event
  {
    id: 'flow-bpmn-end-error',
    name: "BPMN: Error End Event",
    category: 'Flow & Diagrams',
    description: "BPMN 2.0 heavy-bordered Error End Event with jagged N-shaped lightning fault bolt.",
    iconName: 'ZapOff',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle bolt slant angle (1-3)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Error End" },
      { key: 'boltScale', label: "Error Bolt Scale", type: 'number', min: 0.38, max: 0.68, step: 0.01, defaultValue: 0.54 },
      { key: 'slant', label: "Bolt Slant Angle", type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "Error End", boltScale: 0.54, slant: 2 },
    jsSourceCode: `// BPMN: Error End Event (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.boltScale) || 0.54, 0.38, 0.68);
  const v2 = Math.round(helpers.clamp(Number(params.slant) || 2, 1, 3));
  const t1 = (v1 - 0.38) / Math.max(0.001, 0.30000000000000004);
  const t2 = (v2 - 1) / Math.max(1, 2);
  return [
    { id: 'boltScale', label: \`Error: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'slant', label: \`Bolt: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'boltScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.38, 0.68, t);
    return { ...params, boltScale: Number(val.toFixed(2)) };
  }
  if (id === 'slant') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, slant: Math.round(helpers.lerp(1, 3, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.slant) || 2);
  const next = cur >= 3 ? 1 : cur + 1;
  return { ...params, slant: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.boltScale) || 0.54, 0.38, 0.68);
  const v2 = Math.round(helpers.clamp(Number(params.slant) || 2, 1, 3));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const r = Math.min(width, height) * 0.46;
  const bs = r * v1;
  paths.push({ nodes: helpers.ellipsePath(cx, cy, r, r), closed: true });
  paths.push({ nodes: helpers.polygonPath([
    { x: cx - bs * (0.65 + v2 * 0.12), y: cy + bs * 0.7 },
    { x: cx - bs * 0.2, y: cy - bs * 0.8 },
    { x: cx + bs * 0.25, y: cy + bs * 0.1 },
    { x: cx + bs, y: cy - bs * 0.75 },
    { x: cx + bs * 0.2, y: cy + bs * 0.8 },
    { x: cx - bs * 0.25, y: cy - bs * 0.1 }
  ]), closed: true });
  return paths;
}`,
  },

  // 163. BPMN: Cancel Transaction Event
  {
    id: 'flow-bpmn-end-cancel',
    name: "BPMN: Cancel Transaction Event",
    category: 'Flow & Diagrams',
    description: "BPMN 2.0 Transaction Cancel End Event with bold diagonal X cross marker.",
    iconName: 'XCircle',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle x arm thickness (4-12)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Cancel End" },
      { key: 'crossScale', label: "Cancel X Scale", type: 'number', min: 0.36, max: 0.66, step: 0.01, defaultValue: 0.5 },
      { key: 'armThick', label: "X Arm Thickness", type: 'number', min: 4, max: 12, step: 1, defaultValue: 7 },
    ],
    defaultParams: { label: "Cancel End", crossScale: 0.5, armThick: 7 },
    jsSourceCode: `// BPMN: Cancel Transaction Event (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.crossScale) || 0.5, 0.36, 0.66);
  const v2 = Math.round(helpers.clamp(Number(params.armThick) || 7, 4, 12));
  const t1 = (v1 - 0.36) / Math.max(0.001, 0.30000000000000004);
  const t2 = (v2 - 4) / Math.max(1, 8);
  return [
    { id: 'crossScale', label: \`Cancel: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'armThick', label: \`X: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'crossScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.36, 0.66, t);
    return { ...params, crossScale: Number(val.toFixed(2)) };
  }
  if (id === 'armThick') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, armThick: Math.round(helpers.lerp(4, 12, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.armThick) || 7);
  const next = cur >= 12 ? 4 : cur + 1;
  return { ...params, armThick: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.crossScale) || 0.5, 0.36, 0.66);
  const v2 = Math.round(helpers.clamp(Number(params.armThick) || 7, 4, 12));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const r = Math.min(width, height) * 0.46;
  const cs = r * v1;
  const t = v2 * 0.6;
  paths.push({ nodes: helpers.ellipsePath(cx, cy, r, r), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx - cs, y: cy - cs + t }, { x: cx - cs + t, y: cy - cs }, { x: cx + cs, y: cy + cs - t }, { x: cx + cs - t, y: cy + cs }]), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx + cs - t, y: cy - cs }, { x: cx + cs, y: cy - cs + t }, { x: cx - cs + t, y: cy + cs }, { x: cx - cs, y: cy + cs - t }]), closed: true });
  return paths;
}`,
  },

  // 164. BPMN: Exclusive Gateway (XOR)
  {
    id: 'flow-bpmn-gateway-exclusive',
    name: "BPMN: Exclusive Gateway (XOR)",
    category: 'Flow & Diagrams',
    description: "BPMN 2.0 data-based Exclusive Gateway diamond with internal X decision marker.",
    iconName: 'Diamond',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle x bar width (4-12)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "XOR Gateway" },
      { key: 'markerScale', label: "Inner X Scale", type: 'number', min: 0.24, max: 0.52, step: 0.01, defaultValue: 0.36 },
      { key: 'barThick', label: "X Bar Width", type: 'number', min: 4, max: 12, step: 1, defaultValue: 7 },
    ],
    defaultParams: { label: "XOR Gateway", markerScale: 0.36, barThick: 7 },
    jsSourceCode: `// BPMN: Exclusive Gateway (XOR) (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.markerScale) || 0.36, 0.24, 0.52);
  const v2 = Math.round(helpers.clamp(Number(params.barThick) || 7, 4, 12));
  const t1 = (v1 - 0.24) / Math.max(0.001, 0.28);
  const t2 = (v2 - 4) / Math.max(1, 8);
  return [
    { id: 'markerScale', label: \`Inner: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'barThick', label: \`X: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'markerScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.24, 0.52, t);
    return { ...params, markerScale: Number(val.toFixed(2)) };
  }
  if (id === 'barThick') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, barThick: Math.round(helpers.lerp(4, 12, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.barThick) || 7);
  const next = cur >= 12 ? 4 : cur + 1;
  return { ...params, barThick: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.markerScale) || 0.36, 0.24, 0.52);
  const v2 = Math.round(helpers.clamp(Number(params.barThick) || 7, 4, 12));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const ms = Math.min(width, height) * v1 * 0.5;
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: 0 }, { x: width, y: cy }, { x: cx, y: height }, { x: 0, y: cy }]), closed: true });
  const bw = v2 * 0.35;
  paths.push({ nodes: helpers.polygonPath([{ x: cx - ms - bw, y: cy - ms + bw }, { x: cx - ms + bw, y: cy - ms - bw }, { x: cx + ms + bw, y: cy + ms - bw }, { x: cx + ms - bw, y: cy + ms + bw }]), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx + ms - bw, y: cy - ms - bw }, { x: cx + ms + bw, y: cy - ms + bw }, { x: cx - ms + bw, y: cy + ms + bw }, { x: cx - ms - bw, y: cy + ms - bw }]), closed: true });
  return paths;
}`,
  },

  // 165. BPMN: Parallel Gateway (AND)
  {
    id: 'flow-bpmn-gateway-parallel',
    name: "BPMN: Parallel Gateway (AND)",
    category: 'Flow & Diagrams',
    description: "BPMN 2.0 Parallel Fork/Join Gateway diamond with internal orthogonal + cross.",
    iconName: 'Plus',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle plus bar width (4-12)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "AND Gateway" },
      { key: 'markerScale', label: "Inner Plus Scale", type: 'number', min: 0.24, max: 0.54, step: 0.01, defaultValue: 0.38 },
      { key: 'barThick', label: "Plus Bar Width", type: 'number', min: 4, max: 12, step: 1, defaultValue: 7 },
    ],
    defaultParams: { label: "AND Gateway", markerScale: 0.38, barThick: 7 },
    jsSourceCode: `// BPMN: Parallel Gateway (AND) (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.markerScale) || 0.38, 0.24, 0.54);
  const v2 = Math.round(helpers.clamp(Number(params.barThick) || 7, 4, 12));
  const t1 = (v1 - 0.24) / Math.max(0.001, 0.30000000000000004);
  const t2 = (v2 - 4) / Math.max(1, 8);
  return [
    { id: 'markerScale', label: \`Inner: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'barThick', label: \`Plus: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'markerScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.24, 0.54, t);
    return { ...params, markerScale: Number(val.toFixed(2)) };
  }
  if (id === 'barThick') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, barThick: Math.round(helpers.lerp(4, 12, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.barThick) || 7);
  const next = cur >= 12 ? 4 : cur + 1;
  return { ...params, barThick: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.markerScale) || 0.38, 0.24, 0.54);
  const v2 = Math.round(helpers.clamp(Number(params.barThick) || 7, 4, 12));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const ms = Math.min(width, height) * v1 * 0.6;
  const t = v2 * 0.5;
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: 0 }, { x: width, y: cy }, { x: cx, y: height }, { x: 0, y: cy }]), closed: true });
  paths.push({ nodes: helpers.polygonPath([
    { x: cx - t, y: cy - ms }, { x: cx + t, y: cy - ms }, { x: cx + t, y: cy - t },
    { x: cx + ms, y: cy - t }, { x: cx + ms, y: cy + t }, { x: cx + t, y: cy + t },
    { x: cx + t, y: cy + ms }, { x: cx - t, y: cy + ms }, { x: cx - t, y: cy + t },
    { x: cx - ms, y: cy + t }, { x: cx - ms, y: cy - t }, { x: cx - t, y: cy - t }
  ]), closed: true });
  return paths;
}`,
  },

  // 166. BPMN: Inclusive Gateway (OR)
  {
    id: 'flow-bpmn-gateway-inclusive',
    name: "BPMN: Inclusive Gateway (OR)",
    category: 'Flow & Diagrams',
    description: "BPMN 2.0 Inclusive Gateway diamond with bold concentric O ring marker.",
    iconName: 'Circle',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle ring thickness (4-12)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "OR Gateway" },
      { key: 'ringScale', label: "Inner O Ring Scale", type: 'number', min: 0.22, max: 0.48, step: 0.01, defaultValue: 0.34 },
      { key: 'ringWidth', label: "Ring Thickness", type: 'number', min: 4, max: 12, step: 1, defaultValue: 6 },
    ],
    defaultParams: { label: "OR Gateway", ringScale: 0.34, ringWidth: 6 },
    jsSourceCode: `// BPMN: Inclusive Gateway (OR) (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.ringScale) || 0.34, 0.22, 0.48);
  const v2 = Math.round(helpers.clamp(Number(params.ringWidth) || 6, 4, 12));
  const t1 = (v1 - 0.22) / Math.max(0.001, 0.26);
  const t2 = (v2 - 4) / Math.max(1, 8);
  return [
    { id: 'ringScale', label: \`Inner: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'ringWidth', label: \`Ring: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'ringScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.22, 0.48, t);
    return { ...params, ringScale: Number(val.toFixed(2)) };
  }
  if (id === 'ringWidth') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, ringWidth: Math.round(helpers.lerp(4, 12, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.ringWidth) || 6);
  const next = cur >= 12 ? 4 : cur + 1;
  return { ...params, ringWidth: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.ringScale) || 0.34, 0.22, 0.48);
  const v2 = Math.round(helpers.clamp(Number(params.ringWidth) || 6, 4, 12));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const mr = Math.min(width, height) * v1 * 0.55;
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: 0 }, { x: width, y: cy }, { x: cx, y: height }, { x: 0, y: cy }]), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, cy, mr, mr), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, cy, Math.max(3, mr - v2), Math.max(3, mr - v2)), closed: true });
  return paths;
}`,
  },

  // 167. BPMN: Event-Based Gateway
  {
    id: 'flow-bpmn-gateway-event-based',
    name: "BPMN: Event-Based Gateway",
    category: 'Flow & Diagrams',
    description: "BPMN 2.0 Event-Based Gateway diamond containing double circle and inscribed pentagon.",
    iconName: 'Pentagon',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle inner polygon sides (5-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Event Gateway" },
      { key: 'markerScale', label: "Event Marker Scale", type: 'number', min: 0.26, max: 0.5, step: 0.01, defaultValue: 0.38 },
      { key: 'sides', label: "Inner Polygon Sides", type: 'number', min: 5, max: 6, step: 1, defaultValue: 5 },
    ],
    defaultParams: { label: "Event Gateway", markerScale: 0.38, sides: 5 },
    jsSourceCode: `// BPMN: Event-Based Gateway (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.markerScale) || 0.38, 0.26, 0.5);
  const v2 = Math.round(helpers.clamp(Number(params.sides) || 5, 5, 6));
  const t1 = (v1 - 0.26) / Math.max(0.001, 0.24);
  const t2 = (v2 - 5) / Math.max(1, 1);
  return [
    { id: 'markerScale', label: \`Event: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'sides', label: \`Inner: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'markerScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.26, 0.5, t);
    return { ...params, markerScale: Number(val.toFixed(2)) };
  }
  if (id === 'sides') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, sides: Math.round(helpers.lerp(5, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.sides) || 5);
  const next = cur >= 6 ? 5 : cur + 1;
  return { ...params, sides: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.markerScale) || 0.38, 0.26, 0.5);
  const v2 = Math.round(helpers.clamp(Number(params.sides) || 5, 5, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const mr = Math.min(width, height) * v1 * 0.62;
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: 0 }, { x: width, y: cy }, { x: cx, y: height }, { x: 0, y: cy }]), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, cy, mr, mr), closed: true });
  const pts = [];
  for (let i = 0; i < v2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / v2;
    pts.push({ x: cx + Math.cos(a) * mr * 0.65, y: cy + Math.sin(a) * mr * 0.65 });
  }
  paths.push({ nodes: helpers.polygonPath(pts), closed: true });
  return paths;
}`,
  },

  // 168. BPMN: Complex Gateway
  {
    id: 'flow-bpmn-gateway-complex',
    name: "BPMN: Complex Gateway",
    category: 'Flow & Diagrams',
    description: "BPMN 2.0 Complex Gateway diamond with 8-spoke asterisk synchronization star.",
    iconName: 'Asterisk',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle star spoke pairs (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Complex Gateway" },
      { key: 'starScale', label: "Asterisk Span Scale", type: 'number', min: 0.24, max: 0.52, step: 0.01, defaultValue: 0.38 },
      { key: 'spokes', label: "Star Spoke Pairs", type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Complex Gateway", starScale: 0.38, spokes: 4 },
    jsSourceCode: `// BPMN: Complex Gateway (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.starScale) || 0.38, 0.24, 0.52);
  const v2 = Math.round(helpers.clamp(Number(params.spokes) || 4, 3, 6));
  const t1 = (v1 - 0.24) / Math.max(0.001, 0.28);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'starScale', label: \`Asterisk: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'spokes', label: \`Star: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'starScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.24, 0.52, t);
    return { ...params, starScale: Number(val.toFixed(2)) };
  }
  if (id === 'spokes') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, spokes: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.spokes) || 4);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, spokes: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.starScale) || 0.38, 0.24, 0.52);
  const v2 = Math.round(helpers.clamp(Number(params.spokes) || 4, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const sr = Math.min(width, height) * v1 * 0.62;
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: 0 }, { x: width, y: cy }, { x: cx, y: height }, { x: 0, y: cy }]), closed: true });
  for (let i = 0; i < v2; i++) {
    const a = (i * Math.PI) / v2;
    paths.push({ nodes: helpers.polygonPath([{ x: cx - Math.cos(a) * sr, y: cy - Math.sin(a) * sr }, { x: cx + Math.cos(a) * sr, y: cy + Math.sin(a) * sr }], false), closed: false });
  }
  return paths;
}`,
  },

  // 169. BPMN: User Task Activity
  {
    id: 'flow-bpmn-task-user',
    name: "BPMN: User Task Activity",
    category: 'Flow & Diagrams',
    description: "BPMN 2.0 rounded User Task activity with top-left human operator icon and bottom marker.",
    iconName: 'UserCheck',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle bottom task marker (0-2)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "User Task" },
      { key: 'iconScale', label: "User Badge Size", type: 'number', min: 0.16, max: 0.32, step: 0.01, defaultValue: 0.22 },
      { key: 'marker', label: "Bottom Task Marker", type: 'number', min: 0, max: 2, step: 1, defaultValue: 1 },
    ],
    defaultParams: { label: "User Task", iconScale: 0.22, marker: 1 },
    jsSourceCode: `// BPMN: User Task Activity (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.iconScale) || 0.22, 0.16, 0.32);
  const v2 = Math.round(helpers.clamp((params.marker !== undefined ? Number(params.marker) : 1), 0, 2));
  const t1 = (v1 - 0.16) / Math.max(0.001, 0.16);
  const t2 = (v2 - 0) / Math.max(1, 2);
  return [
    { id: 'iconScale', label: \`User: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'marker', label: \`Bottom: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'iconScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.16, 0.32, t);
    return { ...params, iconScale: Number(val.toFixed(2)) };
  }
  if (id === 'marker') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, marker: Math.round(helpers.lerp(0, 2, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round((params.marker !== undefined ? Number(params.marker) : 1));
  const next = cur >= 2 ? 0 : cur + 1;
  return { ...params, marker: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.iconScale) || 0.22, 0.16, 0.32);
  const v2 = Math.round(helpers.clamp((params.marker !== undefined ? Number(params.marker) : 1), 0, 2));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const is = Math.min(width, height) * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 10), closed: true });
  paths.push({ nodes: helpers.ellipsePath(pad + is * 0.5, pad + is * 0.35, is * 0.28, is * 0.28), closed: true });
  paths.push({ nodes: helpers.arcNodes(pad + is * 0.5, pad + is * 0.95, is * 0.48, is * 0.36, -180, 180), closed: true });
  if (v2 > 0) paths.push({ nodes: helpers.rectPath(cx - 7, height - 14, 14, 10, 1), closed: true });
  if (v2 > 1) {
    paths.push({ nodes: helpers.polygonPath([{ x: cx, y: height - 12 }, { x: cx, y: height - 6 }], false), closed: false });
    paths.push({ nodes: helpers.polygonPath([{ x: cx - 3, y: height - 9 }, { x: cx + 3, y: height - 9 }], false), closed: false });
  }
  return paths;
}`,
  },

  // 170. BPMN: Automated Service Task
  {
    id: 'flow-bpmn-task-service',
    name: "BPMN: Automated Service Task",
    category: 'Flow & Diagrams',
    description: "BPMN 2.0 Automated Service Task card with top-left interlocking dual gear wheels.",
    iconName: 'Cog',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle gear tooth count (6-10)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Service Task" },
      { key: 'gearScale', label: "Gear Emblem Size", type: 'number', min: 0.16, max: 0.32, step: 0.01, defaultValue: 0.22 },
      { key: 'teeth', label: "Gear Tooth Count", type: 'number', min: 6, max: 10, step: 1, defaultValue: 8 },
    ],
    defaultParams: { label: "Service Task", gearScale: 0.22, teeth: 8 },
    jsSourceCode: `// BPMN: Automated Service Task (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.gearScale) || 0.22, 0.16, 0.32);
  const v2 = Math.round(helpers.clamp(Number(params.teeth) || 8, 6, 10));
  const t1 = (v1 - 0.16) / Math.max(0.001, 0.16);
  const t2 = (v2 - 6) / Math.max(1, 4);
  return [
    { id: 'gearScale', label: \`Gear: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'teeth', label: \`Gear: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'gearScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.16, 0.32, t);
    return { ...params, gearScale: Number(val.toFixed(2)) };
  }
  if (id === 'teeth') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, teeth: Math.round(helpers.lerp(6, 10, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.teeth) || 8);
  const next = cur >= 10 ? 6 : cur + 1;
  return { ...params, teeth: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.gearScale) || 0.22, 0.16, 0.32);
  const v2 = Math.round(helpers.clamp(Number(params.teeth) || 8, 6, 10));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const gr = Math.min(width, height) * v1 * 0.45;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 10), closed: true });
  const gx = pad + gr + 2;
  const gy = pad + gr + 2;
  paths.push({ nodes: helpers.ellipsePath(gx, gy, gr, gr), closed: true });
  paths.push({ nodes: helpers.ellipsePath(gx + gr * 1.3, gy + gr * 0.7, gr * 0.75, gr * 0.75), closed: true });
  for (let i = 0; i < v2; i++) {
    const a = (i * Math.PI * 2) / v2;
    paths.push({ nodes: helpers.polygonPath([{ x: gx + Math.cos(a) * gr, y: gy + Math.sin(a) * gr }, { x: gx + Math.cos(a) * gr * 1.28, y: gy + Math.sin(a) * gr * 1.28 }], false), closed: false });
  }
  return paths;
}`,
  },

  // 171. BPMN: Script Execution Task
  {
    id: 'flow-bpmn-task-script',
    name: "BPMN: Script Execution Task",
    category: 'Flow & Diagrams',
    description: "BPMN 2.0 Script Task activity with S-curved script scroll ribbon and code lines.",
    iconName: 'FileCode',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle code script lines (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Script Task" },
      { key: 'scrollScale', label: "Scroll Icon Size", type: 'number', min: 0.16, max: 0.34, step: 0.01, defaultValue: 0.24 },
      { key: 'lines', label: "Code Script Lines", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Script Task", scrollScale: 0.24, lines: 3 },
    jsSourceCode: `// BPMN: Script Execution Task (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.scrollScale) || 0.24, 0.16, 0.34);
  const v2 = Math.round(helpers.clamp(Number(params.lines) || 3, 2, 4));
  const t1 = (v1 - 0.16) / Math.max(0.001, 0.18000000000000002);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'scrollScale', label: \`Scroll: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'lines', label: \`Code: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'scrollScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.16, 0.34, t);
    return { ...params, scrollScale: Number(val.toFixed(2)) };
  }
  if (id === 'lines') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, lines: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.lines) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, lines: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.scrollScale) || 0.24, 0.16, 0.34);
  const v2 = Math.round(helpers.clamp(Number(params.lines) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const sw = Math.min(width, height) * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 10), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, pad, sw, sw * 1.15, 2), closed: true });
  for (let i = 1; i <= v2; i++) {
    const ly = pad + (i * sw * 1.15) / (v2 + 1);
    paths.push({ nodes: helpers.polygonPath([{ x: pad + 3, y: ly }, { x: pad + sw - 3, y: ly }], false), closed: false });
  }
  return paths;
}`,
  },

  // 172. BPMN: Business Rule Decision Table
  {
    id: 'flow-bpmn-task-business-rule',
    name: "BPMN: Business Rule Decision Table",
    category: 'Flow & Diagrams',
    description: "BPMN 2.0 Business Rule Task with DMN decision table icon in top-left corner.",
    iconName: 'Table2',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle rule table rows (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Business Rule" },
      { key: 'tableScale', label: "Rule Table Size", type: 'number', min: 0.2, max: 0.38, step: 0.01, defaultValue: 0.28 },
      { key: 'rows', label: "Rule Table Rows", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Business Rule", tableScale: 0.28, rows: 3 },
    jsSourceCode: `// BPMN: Business Rule Decision Table (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.tableScale) || 0.28, 0.2, 0.38);
  const v2 = Math.round(helpers.clamp(Number(params.rows) || 3, 2, 4));
  const t1 = (v1 - 0.2) / Math.max(0.001, 0.18);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'tableScale', label: \`Rule: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'rows', label: \`Rule: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'tableScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.2, 0.38, t);
    return { ...params, tableScale: Number(val.toFixed(2)) };
  }
  if (id === 'rows') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, rows: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.rows) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, rows: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.tableScale) || 0.28, 0.2, 0.38);
  const v2 = Math.round(helpers.clamp(Number(params.rows) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const tw = width * v1;
  const th = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 10), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, pad, tw, th, 2), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: pad + tw * 0.35, y: pad }, { x: pad + tw * 0.35, y: pad + th }], false), closed: false });
  for (let r = 1; r <= v2; r++) {
    const ry = pad + (r * th) / (v2 + 1);
    paths.push({ nodes: helpers.polygonPath([{ x: pad, y: ry }, { x: pad + tw, y: ry }], false), closed: false });
  }
  return paths;
}`,
  },

  // 173. BPMN: Send / Receive Message Task
  {
    id: 'flow-bpmn-task-send-receive',
    name: "BPMN: Send / Receive Message Task",
    category: 'Flow & Diagrams',
    description: "BPMN 2.0 Message Task activity with top-left winged envelope and motion lines.",
    iconName: 'Send',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle mode (1=send, 2=recv) (1-2)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Send / Receive" },
      { key: 'envScale', label: "Envelope Badge Size", type: 'number', min: 0.18, max: 0.36, step: 0.01, defaultValue: 0.25 },
      { key: 'isSend', label: "Mode (1=Send, 2=Recv)", type: 'number', min: 1, max: 2, step: 1, defaultValue: 1 },
    ],
    defaultParams: { label: "Send / Receive", envScale: 0.25, isSend: 1 },
    jsSourceCode: `// BPMN: Send / Receive Message Task (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.envScale) || 0.25, 0.18, 0.36);
  const v2 = Math.round(helpers.clamp(Number(params.isSend) || 1, 1, 2));
  const t1 = (v1 - 0.18) / Math.max(0.001, 0.18);
  const t2 = (v2 - 1) / Math.max(1, 1);
  return [
    { id: 'envScale', label: \`Envelope: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'isSend', label: \`Mode: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'envScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.18, 0.36, t);
    return { ...params, envScale: Number(val.toFixed(2)) };
  }
  if (id === 'isSend') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, isSend: Math.round(helpers.lerp(1, 2, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.isSend) || 1);
  const next = cur >= 2 ? 1 : cur + 1;
  return { ...params, isSend: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.envScale) || 0.25, 0.18, 0.36);
  const v2 = Math.round(helpers.clamp(Number(params.isSend) || 1, 1, 2));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const ew = width * v1;
  const eh = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 10), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, pad, ew, eh, 2), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: pad, y: pad }, { x: pad + ew / 2, y: pad + eh * 0.55 }, { x: pad + ew, y: pad }], false), closed: false });
  if (v2 > 1) paths.push({ nodes: helpers.rectPath(pad + 3, pad + eh * 0.62, Math.max(4, ew - 6), Math.max(2, eh * 0.22), 1), closed: true });
  return paths;
}`,
  },

  // 174. BPMN: Collapsed Sub-Process (+)
  {
    id: 'flow-bpmn-subprocess-collapsed',
    name: "BPMN: Collapsed Sub-Process (+)",
    category: 'Flow & Diagrams',
    description: "BPMN 2.0 Collapsed Sub-Process box with bottom-center square [+] expansion badge.",
    iconName: 'PlusSquare',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle box corner radius (8-24)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Sub-Process [+]" },
      { key: 'badgeSize', label: "Plus Badge Size", type: 'number', min: 0.14, max: 0.28, step: 0.01, defaultValue: 0.18 },
      { key: 'radius', label: "Box Corner Radius", type: 'number', min: 8, max: 24, step: 1, defaultValue: 12 },
    ],
    defaultParams: { label: "Sub-Process [+]", badgeSize: 0.18, radius: 12 },
    jsSourceCode: `// BPMN: Collapsed Sub-Process (+) (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.badgeSize) || 0.18, 0.14, 0.28);
  const v2 = Math.round(helpers.clamp(Number(params.radius) || 12, 8, 24));
  const t1 = (v1 - 0.14) / Math.max(0.001, 0.14);
  const t2 = (v2 - 8) / Math.max(1, 16);
  return [
    { id: 'badgeSize', label: \`Plus: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'radius', label: \`Box: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'badgeSize') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.14, 0.28, t);
    return { ...params, badgeSize: Number(val.toFixed(2)) };
  }
  if (id === 'radius') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, radius: Math.round(helpers.lerp(8, 24, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.radius) || 12);
  const next = cur >= 24 ? 8 : cur + 1;
  return { ...params, radius: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.badgeSize) || 0.18, 0.14, 0.28);
  const v2 = Math.round(helpers.clamp(Number(params.radius) || 12, 8, 24));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const bs = Math.min(width, height) * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, v2), closed: true });
  const bx = cx - bs / 2;
  const by = height - bs - 4;
  paths.push({ nodes: helpers.rectPath(bx, by, bs, bs, 2), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx - bs * 0.3, y: by + bs / 2 }, { x: cx + bs * 0.3, y: by + bs / 2 }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: by + bs * 0.2 }, { x: cx, y: by + bs * 0.8 }], false), closed: false });
  return paths;
}`,
  },

  // 175. BPMN: Event Sub-Process Frame
  {
    id: 'flow-bpmn-subprocess-event',
    name: "BPMN: Event Sub-Process Frame",
    category: 'Flow & Diagrams',
    description: "BPMN 2.0 Event Sub-Process container with corner dash ticks and top-left start event circle.",
    iconName: 'Sparkles',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle perimeter dash density (4-8)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Event Sub-Process" },
      { key: 'eventSize', label: "Corner Event Size", type: 'number', min: 0.14, max: 0.28, step: 0.01, defaultValue: 0.2 },
      { key: 'dashes', label: "Perimeter Dash Density", type: 'number', min: 4, max: 8, step: 1, defaultValue: 6 },
    ],
    defaultParams: { label: "Event Sub-Process", eventSize: 0.2, dashes: 6 },
    jsSourceCode: `// BPMN: Event Sub-Process Frame (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.eventSize) || 0.2, 0.14, 0.28);
  const v2 = Math.round(helpers.clamp(Number(params.dashes) || 6, 4, 8));
  const t1 = (v1 - 0.14) / Math.max(0.001, 0.14);
  const t2 = (v2 - 4) / Math.max(1, 4);
  return [
    { id: 'eventSize', label: \`Corner: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'dashes', label: \`Perimeter: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'eventSize') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.14, 0.28, t);
    return { ...params, eventSize: Number(val.toFixed(2)) };
  }
  if (id === 'dashes') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, dashes: Math.round(helpers.lerp(4, 8, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.dashes) || 6);
  const next = cur >= 8 ? 4 : cur + 1;
  return { ...params, dashes: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.eventSize) || 0.2, 0.14, 0.28);
  const v2 = Math.round(helpers.clamp(Number(params.dashes) || 6, 4, 8));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const er = Math.min(width, height) * v1 * 0.5;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 10), closed: true });
  paths.push({ nodes: helpers.ellipsePath(pad + er, pad + er, er, er), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: pad + er, y: pad + er * 0.55 }, { x: pad + er * 1.4, y: pad + er * 1.3 }, { x: pad + er * 0.6, y: pad + er * 1.3 }]), closed: true });
  for (let d = 0; d < v2; d++) {
    const dx = pad * 2 + (d * (width - pad * 4)) / Math.max(1, v2);
    paths.push({ nodes: helpers.polygonPath([{ x: dx, y: 4 }, { x: dx + 6, y: 4 }], false), closed: false });
  }
  return paths;
}`,
  },

  // 176. BPMN: Transaction Boundary Box
  {
    id: 'flow-bpmn-transaction-frame',
    name: "BPMN: Transaction Boundary Box",
    category: 'Flow & Diagrams',
    description: "BPMN 2.0 double-bordered Transaction Sub-Process with boundary cancel/hazard port.",
    iconName: 'Shield',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle boundary event x (2-8)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Transaction Scope" },
      { key: 'borderGap', label: "Double Border Inset", type: 'number', min: 0.05, max: 0.14, step: 0.01, defaultValue: 0.08 },
      { key: 'portPos', label: "Boundary Event X", type: 'number', min: 2, max: 8, step: 1, defaultValue: 7 },
    ],
    defaultParams: { label: "Transaction Scope", borderGap: 0.08, portPos: 7 },
    jsSourceCode: `// BPMN: Transaction Boundary Box (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.borderGap) || 0.08, 0.05, 0.14);
  const v2 = Math.round(helpers.clamp(Number(params.portPos) || 7, 2, 8));
  const t1 = (v1 - 0.05) / Math.max(0.001, 0.09000000000000001);
  const t2 = (v2 - 2) / Math.max(1, 6);
  return [
    { id: 'borderGap', label: \`Double: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'portPos', label: \`Boundary: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'borderGap') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.05, 0.14, t);
    return { ...params, borderGap: Number(val.toFixed(2)) };
  }
  if (id === 'portPos') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, portPos: Math.round(helpers.lerp(2, 8, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.portPos) || 7);
  const next = cur >= 8 ? 2 : cur + 1;
  return { ...params, portPos: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.borderGap) || 0.08, 0.05, 0.14);
  const v2 = Math.round(helpers.clamp(Number(params.portPos) || 7, 2, 8));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const gap = Math.min(width, height) * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 10), closed: true });
  paths.push({ nodes: helpers.rectPath(gap, gap, width - gap * 2, height - gap * 2, 7), closed: true });
  const px = (width * v2) / 10;
  paths.push({ nodes: helpers.ellipsePath(px, height - gap / 2, 8, 8), closed: true });
  return paths;
}`,
  },

  // 177. BPMN: Global Call Activity
  {
    id: 'flow-bpmn-call-activity',
    name: "BPMN: Global Call Activity",
    category: 'Flow & Diagrams',
    description: "BPMN 2.0 thick-walled reusable Global Call Activity with multi-instance parallel bars.",
    iconName: 'ExternalLink',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle parallel instance bars (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Call Activity" },
      { key: 'wallThick', label: "Heavy Border Inset", type: 'number', min: 0.04, max: 0.12, step: 0.01, defaultValue: 0.07 },
      { key: 'instances', label: "Parallel Instance Bars", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Call Activity", wallThick: 0.07, instances: 3 },
    jsSourceCode: `// BPMN: Global Call Activity (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.wallThick) || 0.07, 0.04, 0.12);
  const v2 = Math.round(helpers.clamp(Number(params.instances) || 3, 2, 4));
  const t1 = (v1 - 0.04) / Math.max(0.001, 0.07999999999999999);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'wallThick', label: \`Heavy: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'instances', label: \`Parallel: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'wallThick') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.04, 0.12, t);
    return { ...params, wallThick: Number(val.toFixed(2)) };
  }
  if (id === 'instances') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, instances: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.instances) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, instances: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.wallThick) || 0.07, 0.04, 0.12);
  const v2 = Math.round(helpers.clamp(Number(params.instances) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const wt = Math.min(width, height) * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 10), closed: true });
  paths.push({ nodes: helpers.rectPath(wt, wt, width - wt * 2, height - wt * 2, 8), closed: true });
  for (let i = 0; i < v2; i++) {
    const ix = cx - ((v2 - 1) * 5) / 2 + i * 5;
    paths.push({ nodes: helpers.polygonPath([{ x: ix, y: height - wt - 12 }, { x: ix, y: height - wt - 4 }], false), closed: false });
  }
  return paths;
}`,
  },

  // 178. BPMN: Data Object Input/Output
  {
    id: 'flow-bpmn-data-object',
    name: "BPMN: Data Object Input/Output",
    category: 'Flow & Diagrams',
    description: "BPMN 2.0 dog-eared Data Object document with top-left directional input/output arrow.",
    iconName: 'FileText',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle arrow (1=in, 2=out) (1-2)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Data Object [I/O]" },
      { key: 'foldSize', label: "Corner Fold Ratio", type: 'number', min: 0.16, max: 0.34, step: 0.01, defaultValue: 0.24 },
      { key: 'arrowDir', label: "Arrow (1=In, 2=Out)", type: 'number', min: 1, max: 2, step: 1, defaultValue: 1 },
    ],
    defaultParams: { label: "Data Object [I/O]", foldSize: 0.24, arrowDir: 1 },
    jsSourceCode: `// BPMN: Data Object Input/Output (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.foldSize) || 0.24, 0.16, 0.34);
  const v2 = Math.round(helpers.clamp(Number(params.arrowDir) || 1, 1, 2));
  const t1 = (v1 - 0.16) / Math.max(0.001, 0.18000000000000002);
  const t2 = (v2 - 1) / Math.max(1, 1);
  return [
    { id: 'foldSize', label: \`Corner: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'arrowDir', label: \`Arrow: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'foldSize') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.16, 0.34, t);
    return { ...params, foldSize: Number(val.toFixed(2)) };
  }
  if (id === 'arrowDir') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, arrowDir: Math.round(helpers.lerp(1, 2, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.arrowDir) || 1);
  const next = cur >= 2 ? 1 : cur + 1;
  return { ...params, arrowDir: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.foldSize) || 0.24, 0.16, 0.34);
  const v2 = Math.round(helpers.clamp(Number(params.arrowDir) || 1, 1, 2));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const fs = Math.min(width, height) * v1;
  const fx = width - fs;
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: 0 }, { x: fx, y: 0 }, { x: width, y: fs }, { x: width, y: height }, { x: 0, y: height }]), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: fx, y: 0 }, { x: fx, y: fs }, { x: width, y: fs }]), closed: true });
  const aw = v2 > 1 ? 18 : 12;
  paths.push({ nodes: helpers.polygonPath([{ x: pad, y: pad + 4 }, { x: pad + aw, y: pad + 4 }, { x: pad + aw, y: pad }, { x: pad + aw + 6, y: pad + 6 }, { x: pad + aw, y: pad + 12 }, { x: pad + aw, y: pad + 8 }, { x: pad, y: pad + 8 }]), closed: true });
  return paths;
}`,
  },

  // 179. BPMN: Persistent Data Store
  {
    id: 'flow-bpmn-data-store',
    name: "BPMN: Persistent Data Store",
    category: 'Flow & Diagrams',
    description: "BPMN 2.0 3-band tiered drum cylinder representing persistent enterprise data storage.",
    iconName: 'Database',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle storage tier bands (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "BPMN Data Store" },
      { key: 'capRatio', label: "Drum Cap Curvature", type: 'number', min: 0.12, max: 0.26, step: 0.01, defaultValue: 0.18 },
      { key: 'bands', label: "Storage Tier Bands", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "BPMN Data Store", capRatio: 0.18, bands: 3 },
    jsSourceCode: `// BPMN: Persistent Data Store (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.capRatio) || 0.18, 0.12, 0.26);
  const v2 = Math.round(helpers.clamp(Number(params.bands) || 3, 2, 4));
  const t1 = (v1 - 0.12) / Math.max(0.001, 0.14);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'capRatio', label: \`Drum: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'bands', label: \`Storage: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'capRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.12, 0.26, t);
    return { ...params, capRatio: Number(val.toFixed(2)) };
  }
  if (id === 'bands') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, bands: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.bands) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, bands: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.capRatio) || 0.18, 0.12, 0.26);
  const v2 = Math.round(helpers.clamp(Number(params.bands) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const ry = height * v1;
  const rx = width * 0.46;
  paths.push({ nodes: helpers.rectPath(cx - rx, ry, rx * 2, height - ry * 2, 2), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, ry, rx, ry), closed: true });
  for (let i = 1; i <= v2; i++) {
    const by = ry + (i * (height - ry * 2)) / (v2 + 1);
    paths.push({ nodes: helpers.arcNodes(cx, by, rx, ry * 0.65, 0, 180), closed: false });
  }
  return paths;
}`,
  },

  // 180. BPMN: Multi-Lane Pool Container
  {
    id: 'flow-bpmn-pool-multi-lane',
    name: "BPMN: Multi-Lane Pool Container",
    category: 'Flow & Diagrams',
    description: "Horizontal BPMN Pool with left vertical participant header and N internal role swimlanes.",
    iconName: 'Rows',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle internal swimlanes (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "BPMN Pool & Lanes" },
      { key: 'headWidth', label: "Pool Header Width", type: 'number', min: 0.1, max: 0.26, step: 0.01, defaultValue: 0.15 },
      { key: 'lanes', label: "Internal Swimlanes", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "BPMN Pool & Lanes", headWidth: 0.15, lanes: 3 },
    jsSourceCode: `// BPMN: Multi-Lane Pool Container (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.headWidth) || 0.15, 0.1, 0.26);
  const v2 = Math.round(helpers.clamp(Number(params.lanes) || 3, 2, 4));
  const t1 = (v1 - 0.1) / Math.max(0.001, 0.16);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'headWidth', label: \`Pool: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'lanes', label: \`Internal: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'headWidth') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.1, 0.26, t);
    return { ...params, headWidth: Number(val.toFixed(2)) };
  }
  if (id === 'lanes') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, lanes: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.lanes) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, lanes: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.headWidth) || 0.15, 0.1, 0.26);
  const v2 = Math.round(helpers.clamp(Number(params.lanes) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const hw = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 2), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: hw, y: 0 }, { x: hw, y: height }], false), closed: false });
  for (let i = 1; i < v2; i++) {
    const ly = (height * i) / v2;
    paths.push({ nodes: helpers.polygonPath([{ x: hw, y: ly }, { x: width, y: ly }], false), closed: false });
  }
  return paths;
}`,
  },

  // 181. UML: 3-Compartment Class Box
  {
    id: 'flow-uml-class-box',
    name: "UML: 3-Compartment Class Box",
    category: 'Flow & Diagrams',
    description: "Standard UML 2.5 Class diagram box with stereotype header, attributes compartment, and methods compartment.",
    iconName: 'Box',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle attr/method split y (0.48-0.76)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Class: OrderService" },
      { key: 'headerRatio', label: "Class Header Height", type: 'number', min: 0.18, max: 0.36, step: 0.01, defaultValue: 0.25 },
      { key: 'splitRatio', label: "Attr/Method Split Y", type: 'number', min: 0.48, max: 0.76, step: 0.01, defaultValue: 0.6 },
    ],
    defaultParams: { label: "Class: OrderService", headerRatio: 0.25, splitRatio: 0.6 },
    jsSourceCode: `// UML: 3-Compartment Class Box (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.headerRatio) || 0.25, 0.18, 0.36);
  const v2 = helpers.clamp(Number(params.splitRatio) || 0.6, 0.48, 0.76);
  const t1 = (v1 - 0.18) / Math.max(0.001, 0.18);
  const t2 = (v2 - 0.48) / Math.max(0.001, 0.28);
  return [
    { id: 'headerRatio', label: \`Class: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'splitRatio', label: \`Attr/Method: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'headerRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.18, 0.36, t);
    return { ...params, headerRatio: Number(val.toFixed(2)) };
  }
  if (id === 'splitRatio') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, splitRatio: Number(helpers.lerp(0.48, 0.76, t).toFixed(2)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Number(params.splitRatio) || 0.6;
  const next = cur + 0.09 > 0.76 + 0.001 ? 0.48 : Number((cur + 0.09).toFixed(2));
  return { ...params, splitRatio: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.headerRatio) || 0.25, 0.18, 0.36);
  const v2 = helpers.clamp(Number(params.splitRatio) || 0.6, 0.48, 0.76);
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const hy = height * v1;
  const sy = height * v2;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 2), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: hy }, { x: width, y: hy }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: Math.max(hy + 12, sy) }, { x: width, y: Math.max(hy + 12, sy) }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: pad, y: hy + 8 }, { x: width * 0.72, y: hy + 8 }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: pad, y: Math.max(hy + 20, sy + 8) }, { x: width * 0.65, y: Math.max(hy + 20, sy + 8) }], false), closed: false });
  return paths;
}`,
  },

  // 182. UML: Component with Lollipop Interface
  {
    id: 'flow-uml-interface-lollipop',
    name: "UML: Component with Lollipop Interface",
    category: 'Flow & Diagrams',
    description: "UML Component block exposing a provided lollipop circle interface and required socket arc.",
    iconName: 'Plug',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle interface lollipop size (8-18)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "IAuthProvider" },
      { key: 'boxWidth', label: "Component Width Ratio", type: 'number', min: 0.5, max: 0.78, step: 0.01, defaultValue: 0.64 },
      { key: 'socketRadius', label: "Interface Lollipop Size", type: 'number', min: 8, max: 18, step: 1, defaultValue: 12 },
    ],
    defaultParams: { label: "IAuthProvider", boxWidth: 0.64, socketRadius: 12 },
    jsSourceCode: `// UML: Component with Lollipop Interface (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.boxWidth) || 0.64, 0.5, 0.78);
  const v2 = Math.round(helpers.clamp(Number(params.socketRadius) || 12, 8, 18));
  const t1 = (v1 - 0.5) / Math.max(0.001, 0.28);
  const t2 = (v2 - 8) / Math.max(1, 10);
  return [
    { id: 'boxWidth', label: \`Component: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'socketRadius', label: \`Interface: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'boxWidth') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.5, 0.78, t);
    return { ...params, boxWidth: Number(val.toFixed(2)) };
  }
  if (id === 'socketRadius') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, socketRadius: Math.round(helpers.lerp(8, 18, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.socketRadius) || 12);
  const next = cur >= 18 ? 8 : cur + 1;
  return { ...params, socketRadius: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.boxWidth) || 0.64, 0.5, 0.78);
  const v2 = Math.round(helpers.clamp(Number(params.socketRadius) || 12, 8, 18));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const bw = width * v1;
  const sr = v2;
  paths.push({ nodes: helpers.rectPath(0, 8, bw, height - 16, 3), closed: true });
  const lx = bw + (width - bw) * 0.52;
  paths.push({ nodes: helpers.polygonPath([{ x: bw, y: cy }, { x: lx - sr, y: cy }], false), closed: false });
  paths.push({ nodes: helpers.ellipsePath(lx, cy, sr, sr), closed: true });
  paths.push({ nodes: helpers.arcNodes(lx + 4, cy, sr * 1.45, sr * 1.45, -80, 160), closed: false });
  return paths;
}`,
  },

  // 183. UML: Package Namespace Folder
  {
    id: 'flow-uml-package-folder',
    name: "UML: Package Namespace Folder",
    category: 'Flow & Diagrams',
    description: "UML Package container with top-left namespace tab and nested module sub-cards.",
    iconName: 'Folder',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle inner module cards (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "pkg::core.engine" },
      { key: 'tabWidth', label: "Package Tab Width", type: 'number', min: 0.28, max: 0.58, step: 0.01, defaultValue: 0.4 },
      { key: 'modules', label: "Inner Module Cards", type: 'number', min: 2, max: 4, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "pkg::core.engine", tabWidth: 0.4, modules: 2 },
    jsSourceCode: `// UML: Package Namespace Folder (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.tabWidth) || 0.4, 0.28, 0.58);
  const v2 = Math.round(helpers.clamp(Number(params.modules) || 2, 2, 4));
  const t1 = (v1 - 0.28) / Math.max(0.001, 0.29999999999999993);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'tabWidth', label: \`Package: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'modules', label: \`Inner: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'tabWidth') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.28, 0.58, t);
    return { ...params, tabWidth: Number(val.toFixed(2)) };
  }
  if (id === 'modules') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, modules: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.modules) || 2);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, modules: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.tabWidth) || 0.4, 0.28, 0.58);
  const v2 = Math.round(helpers.clamp(Number(params.modules) || 2, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const tw = width * v1;
  const th = height * 0.18;
  paths.push({ nodes: helpers.rectPath(0, 0, tw, th, 2), closed: true });
  paths.push({ nodes: helpers.rectPath(0, th, width, height - th, 2), closed: true });
  const mw = (width - pad * 2 - (v2 - 1) * 6) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(pad + i * (mw + 6), th + pad, mw, height - th - pad * 2, 2), closed: true });
  }
  return paths;
}`,
  },

  // 184. UML: Component with Port Tabs
  {
    id: 'flow-uml-component-artifact',
    name: "UML: Component with Port Tabs",
    category: 'Flow & Diagrams',
    description: "UML Component rectangle with two protruding left pin tabs and top-right component glyph.",
    iconName: 'Cpu',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle right boundary ports (1-3)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "«component» Core" },
      { key: 'tabSize', label: "Left Pin Tab Width", type: 'number', min: 0.08, max: 0.2, step: 0.01, defaultValue: 0.13 },
      { key: 'ports', label: "Right Boundary Ports", type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "«component» Core", tabSize: 0.13, ports: 2 },
    jsSourceCode: `// UML: Component with Port Tabs (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.tabSize) || 0.13, 0.08, 0.2);
  const v2 = Math.round(helpers.clamp(Number(params.ports) || 2, 1, 3));
  const t1 = (v1 - 0.08) / Math.max(0.001, 0.12000000000000001);
  const t2 = (v2 - 1) / Math.max(1, 2);
  return [
    { id: 'tabSize', label: \`Left: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'ports', label: \`Right: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'tabSize') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.08, 0.2, t);
    return { ...params, tabSize: Number(val.toFixed(2)) };
  }
  if (id === 'ports') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, ports: Math.round(helpers.lerp(1, 3, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.ports) || 2);
  const next = cur >= 3 ? 1 : cur + 1;
  return { ...params, ports: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.tabSize) || 0.13, 0.08, 0.2);
  const v2 = Math.round(helpers.clamp(Number(params.ports) || 2, 1, 3));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const tw = width * v1;
  const bx = tw * 0.55;
  paths.push({ nodes: helpers.rectPath(bx, 0, width - bx - 6, height, 3), closed: true });
  paths.push({ nodes: helpers.rectPath(0, height * 0.22, tw, height * 0.16, 2), closed: true });
  paths.push({ nodes: helpers.rectPath(0, height * 0.56, tw, height * 0.16, 2), closed: true });
  for (let i = 0; i < v2; i++) {
    const py = helpers.lerp(height * 0.28, height * 0.72, i / Math.max(1, v2 - 1));
    paths.push({ nodes: helpers.rectPath(width - 11, py - 5, 11, 10, 1), closed: true });
  }
  return paths;
}`,
  },

  // 185. UML: 3D Deployment Node Cube
  {
    id: 'flow-uml-deployment-cube',
    name: "UML: 3D Deployment Node Cube",
    category: 'Flow & Diagrams',
    description: "3D isometric UML Deployment Node box with adjustable top/side perspective extrusion depth.",
    iconName: 'Box',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle deployed artifacts (1-3)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "«device» K8sNode" },
      { key: 'depthRatio', label: "3D Extrusion Depth", type: 'number', min: 0.12, max: 0.32, step: 0.01, defaultValue: 0.2 },
      { key: 'artifacts', label: "Deployed Artifacts", type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "«device» K8sNode", depthRatio: 0.2, artifacts: 2 },
    jsSourceCode: `// UML: 3D Deployment Node Cube (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.depthRatio) || 0.2, 0.12, 0.32);
  const v2 = Math.round(helpers.clamp(Number(params.artifacts) || 2, 1, 3));
  const t1 = (v1 - 0.12) / Math.max(0.001, 0.2);
  const t2 = (v2 - 1) / Math.max(1, 2);
  return [
    { id: 'depthRatio', label: \`3D: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'artifacts', label: \`Deployed: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'depthRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.12, 0.32, t);
    return { ...params, depthRatio: Number(val.toFixed(2)) };
  }
  if (id === 'artifacts') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, artifacts: Math.round(helpers.lerp(1, 3, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.artifacts) || 2);
  const next = cur >= 3 ? 1 : cur + 1;
  return { ...params, artifacts: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.depthRatio) || 0.2, 0.12, 0.32);
  const v2 = Math.round(helpers.clamp(Number(params.artifacts) || 2, 1, 3));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const d = Math.min(width, height) * v1;
  const fw = width - d;
  const fh = height - d;
  paths.push({ nodes: helpers.rectPath(0, d, fw, fh, 0), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: d }, { x: d, y: 0 }, { x: width, y: 0 }, { x: fw, y: d }]), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: fw, y: d }, { x: width, y: 0 }, { x: width, y: fh }, { x: fw, y: height }]), closed: true });
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(pad, d + pad + i * 16, fw * 0.45, 11, 2), closed: true });
  }
  return paths;
}`,
  },

  // 186. UML: Use Case Oval & Extension Points
  {
    id: 'flow-uml-usecase-oval',
    name: "UML: Use Case Oval & Extension Points",
    category: 'Flow & Diagrams',
    description: "Elliptical UML Use Case node with internal horizontal divider for named Extension Points.",
    iconName: 'Circle',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle extension point rows (1-3)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Checkout Order" },
      { key: 'splitY', label: "Extension Divider Y", type: 'number', min: 0.45, max: 0.72, step: 0.01, defaultValue: 0.58 },
      { key: 'points', label: "Extension Point Rows", type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "Checkout Order", splitY: 0.58, points: 2 },
    jsSourceCode: `// UML: Use Case Oval & Extension Points (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.splitY) || 0.58, 0.45, 0.72);
  const v2 = Math.round(helpers.clamp(Number(params.points) || 2, 1, 3));
  const t1 = (v1 - 0.45) / Math.max(0.001, 0.26999999999999996);
  const t2 = (v2 - 1) / Math.max(1, 2);
  return [
    { id: 'splitY', label: \`Extension: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'points', label: \`Extension: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'splitY') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.45, 0.72, t);
    return { ...params, splitY: Number(val.toFixed(2)) };
  }
  if (id === 'points') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, points: Math.round(helpers.lerp(1, 3, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.points) || 2);
  const next = cur >= 3 ? 1 : cur + 1;
  return { ...params, points: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.splitY) || 0.58, 0.45, 0.72);
  const v2 = Math.round(helpers.clamp(Number(params.points) || 2, 1, 3));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const rx = width / 2;
  const ry = height / 2;
  const sy = height * v1;
  paths.push({ nodes: helpers.ellipsePath(cx, cy, rx, ry), closed: true });
  const dy = (sy - cy) / Math.max(1, ry);
  const dx = Math.sqrt(Math.max(0.05, 1 - dy * dy)) * rx;
  paths.push({ nodes: helpers.polygonPath([{ x: cx - dx, y: sy }, { x: cx + dx, y: sy }], false), closed: false });
  for (let i = 0; i < v2; i++) {
    const ly = sy + 8 + i * 9;
    paths.push({ nodes: helpers.polygonPath([{ x: cx - dx * 0.55, y: ly }, { x: cx + dx * 0.55, y: ly }], false), closed: false });
  }
  return paths;
}`,
  },

  // 187. UML: Stick-Figure System Actor
  {
    id: 'flow-uml-actor-stickman',
    name: "UML: Stick-Figure System Actor",
    category: 'Flow & Diagrams',
    description: "Classic UML Use-Case stick-figure Actor with proportional head circle, arms, torso, and legs.",
    iconName: 'User',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle head circle scale (10-22)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Primary Actor" },
      { key: 'armSpan', label: "Actor Arm Span", type: 'number', min: 0.28, max: 0.68, step: 0.01, defaultValue: 0.46 },
      { key: 'headScale', label: "Head Circle Scale", type: 'number', min: 10, max: 22, step: 1, defaultValue: 15 },
    ],
    defaultParams: { label: "Primary Actor", armSpan: 0.46, headScale: 15 },
    jsSourceCode: `// UML: Stick-Figure System Actor (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.armSpan) || 0.46, 0.28, 0.68);
  const v2 = Math.round(helpers.clamp(Number(params.headScale) || 15, 10, 22));
  const t1 = (v1 - 0.28) / Math.max(0.001, 0.4);
  const t2 = (v2 - 10) / Math.max(1, 12);
  return [
    { id: 'armSpan', label: \`Actor: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'headScale', label: \`Head: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'armSpan') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.28, 0.68, t);
    return { ...params, armSpan: Number(val.toFixed(2)) };
  }
  if (id === 'headScale') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, headScale: Math.round(helpers.lerp(10, 22, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.headScale) || 15);
  const next = cur >= 22 ? 10 : cur + 1;
  return { ...params, headScale: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.armSpan) || 0.46, 0.28, 0.68);
  const v2 = Math.round(helpers.clamp(Number(params.headScale) || 15, 10, 22));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const as = width * v1 * 0.5;
  const hr = v2;
  const hy = pad + hr;
  const neckY = hy + hr;
  const hipY = height * 0.64;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, hy, hr, hr), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: neckY }, { x: cx, y: hipY }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: cx - as, y: neckY + 12 }, { x: cx + as, y: neckY + 12 }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: cx - as * 0.78, y: height - pad }, { x: cx, y: hipY }, { x: cx + as * 0.78, y: height - pad }], false), closed: false });
  return paths;
}`,
  },

  // 188. UML: Sequence Lifeline & Activation
  {
    id: 'flow-uml-lifeline-activation',
    name: "UML: Sequence Lifeline & Activation",
    category: 'Flow & Diagrams',
    description: "UML Sequence Diagram object header with vertical dashed lifeline and execution activation bar.",
    iconName: 'AlignCenterVertical',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle activation bar height (30-75)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: ":PaymentGateway" },
      { key: 'headHeight', label: "Object Box Height", type: 'number', min: 0.16, max: 0.32, step: 0.01, defaultValue: 0.22 },
      { key: 'actSpan', label: "Activation Bar Height", type: 'number', min: 30, max: 75, step: 1, defaultValue: 52 },
    ],
    defaultParams: { label: ":PaymentGateway", headHeight: 0.22, actSpan: 52 },
    jsSourceCode: `// UML: Sequence Lifeline & Activation (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.headHeight) || 0.22, 0.16, 0.32);
  const v2 = Math.round(helpers.clamp(Number(params.actSpan) || 52, 30, 75));
  const t1 = (v1 - 0.16) / Math.max(0.001, 0.16);
  const t2 = (v2 - 30) / Math.max(1, 45);
  return [
    { id: 'headHeight', label: \`Object: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'actSpan', label: \`Activation: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'headHeight') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.16, 0.32, t);
    return { ...params, headHeight: Number(val.toFixed(2)) };
  }
  if (id === 'actSpan') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, actSpan: Math.round(helpers.lerp(30, 75, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.actSpan) || 52);
  const next = cur >= 75 ? 30 : cur + 1;
  return { ...params, actSpan: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.headHeight) || 0.22, 0.16, 0.32);
  const v2 = Math.round(helpers.clamp(Number(params.actSpan) || 52, 30, 75));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const hh = height * v1;
  const actH = ((height - hh - 12) * v2) / 100;
  paths.push({ nodes: helpers.rectPath(width * 0.14, 0, width * 0.72, hh, 3), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: hh }, { x: cx, y: height }], false), closed: false });
  paths.push({ nodes: helpers.rectPath(cx - 7, hh + 10, 14, actH, 1), closed: true });
  return paths;
}`,
  },

  // 189. UML: Combined Fragment (alt / loop)
  {
    id: 'flow-uml-combined-fragment',
    name: "UML: Combined Fragment (alt / loop)",
    category: 'Flow & Diagrams',
    description: "UML Sequence Combined Fragment frame with top-left operator pentagon tag and operand divider.",
    iconName: 'Frame',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle operand compartments (2-3)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "alt [validCard]" },
      { key: 'tagWidth', label: "Operator Tag Width", type: 'number', min: 0.22, max: 0.46, step: 0.01, defaultValue: 0.32 },
      { key: 'operands', label: "Operand Compartments", type: 'number', min: 2, max: 3, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "alt [validCard]", tagWidth: 0.32, operands: 2 },
    jsSourceCode: `// UML: Combined Fragment (alt / loop) (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.tagWidth) || 0.32, 0.22, 0.46);
  const v2 = Math.round(helpers.clamp(Number(params.operands) || 2, 2, 3));
  const t1 = (v1 - 0.22) / Math.max(0.001, 0.24000000000000002);
  const t2 = (v2 - 2) / Math.max(1, 1);
  return [
    { id: 'tagWidth', label: \`Operator: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'operands', label: \`Operand: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'tagWidth') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.22, 0.46, t);
    return { ...params, tagWidth: Number(val.toFixed(2)) };
  }
  if (id === 'operands') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, operands: Math.round(helpers.lerp(2, 3, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.operands) || 2);
  const next = cur >= 3 ? 2 : cur + 1;
  return { ...params, operands: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.tagWidth) || 0.32, 0.22, 0.46);
  const v2 = Math.round(helpers.clamp(Number(params.operands) || 2, 2, 3));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const tw = width * v1;
  const th = height * 0.2;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 2), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: 0 }, { x: tw, y: 0 }, { x: tw, y: th * 0.65 }, { x: tw - 10, y: th }, { x: 0, y: th }]), closed: true });
  for (let i = 1; i < v2; i++) {
    const dy = th + ((height - th) * i) / v2;
    paths.push({ nodes: helpers.polygonPath([{ x: 0, y: dy }, { x: width, y: dy }], false), closed: false });
  }
  return paths;
}`,
  },

  // 190. UML: Composite State Machine Node
  {
    id: 'flow-uml-state-composite',
    name: "UML: Composite State Machine Node",
    category: 'Flow & Diagrams',
    description: "UML Statechart composite state with rounded body, name compartment, and internal sub-states.",
    iconName: 'GitCommit',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle nested sub-states (2-3)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "State: Active" },
      { key: 'headerRatio', label: "State Header Ratio", type: 'number', min: 0.18, max: 0.34, step: 0.01, defaultValue: 0.24 },
      { key: 'substates', label: "Nested Sub-States", type: 'number', min: 2, max: 3, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "State: Active", headerRatio: 0.24, substates: 2 },
    jsSourceCode: `// UML: Composite State Machine Node (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.headerRatio) || 0.24, 0.18, 0.34);
  const v2 = Math.round(helpers.clamp(Number(params.substates) || 2, 2, 3));
  const t1 = (v1 - 0.18) / Math.max(0.001, 0.16000000000000003);
  const t2 = (v2 - 2) / Math.max(1, 1);
  return [
    { id: 'headerRatio', label: \`State: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'substates', label: \`Nested: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'headerRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.18, 0.34, t);
    return { ...params, headerRatio: Number(val.toFixed(2)) };
  }
  if (id === 'substates') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, substates: Math.round(helpers.lerp(2, 3, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.substates) || 2);
  const next = cur >= 3 ? 2 : cur + 1;
  return { ...params, substates: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.headerRatio) || 0.24, 0.18, 0.34);
  const v2 = Math.round(helpers.clamp(Number(params.substates) || 2, 2, 3));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const hy = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 14), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: hy }, { x: width, y: hy }], false), closed: false });
  const sw = (width - pad * 2 - (v2 - 1) * 10) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(pad + i * (sw + 10), hy + pad, sw, height - hy - pad * 2, 8), closed: true });
  }
  return paths;
}`,
  },

  // 191. UML: Initial / Final State Bullseye
  {
    id: 'flow-uml-initial-final-bullseye',
    name: "UML: Initial / Final State Bullseye",
    category: 'Flow & Diagrams',
    description: "UML State Machine Final State bullseye ring with incoming transition arrow stub.",
    iconName: 'Target',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle transition stubs (1-2)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Final State" },
      { key: 'coreRatio', label: "Inner Core Ratio", type: 'number', min: 0.4, max: 0.76, step: 0.01, defaultValue: 0.6 },
      { key: 'stubs', label: "Transition Stubs", type: 'number', min: 1, max: 2, step: 1, defaultValue: 1 },
    ],
    defaultParams: { label: "Final State", coreRatio: 0.6, stubs: 1 },
    jsSourceCode: `// UML: Initial / Final State Bullseye (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.coreRatio) || 0.6, 0.4, 0.76);
  const v2 = Math.round(helpers.clamp(Number(params.stubs) || 1, 1, 2));
  const t1 = (v1 - 0.4) / Math.max(0.001, 0.36);
  const t2 = (v2 - 1) / Math.max(1, 1);
  return [
    { id: 'coreRatio', label: \`Inner: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'stubs', label: \`Transition: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'coreRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.4, 0.76, t);
    return { ...params, coreRatio: Number(val.toFixed(2)) };
  }
  if (id === 'stubs') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, stubs: Math.round(helpers.lerp(1, 2, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.stubs) || 1);
  const next = cur >= 2 ? 1 : cur + 1;
  return { ...params, stubs: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.coreRatio) || 0.6, 0.4, 0.76);
  const v2 = Math.round(helpers.clamp(Number(params.stubs) || 1, 1, 2));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const r = Math.min(width, height) * 0.42;
  paths.push({ nodes: helpers.ellipsePath(cx, cy, r, r), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, cy, r * v1, r * v1), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: cy }, { x: cx - r, y: cy }], false), closed: false });
  if (v2 > 1) paths.push({ nodes: helpers.polygonPath([{ x: cx + r, y: cy }, { x: width, y: cy }], false), closed: false });
  return paths;
}`,
  },

  // 192. UML: Shallow / Deep History (H*)
  {
    id: 'flow-uml-history-pseudostate',
    name: "UML: Shallow / Deep History (H*)",
    category: 'Flow & Diagrams',
    description: "UML Statechart History pseudostate circle with inscribed H and deep-history asterisk star.",
    iconName: 'History',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle deep history (*) mode (0-1)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "History (H*)" },
      { key: 'hScale', label: "Letter H Scale", type: 'number', min: 0.3, max: 0.56, step: 0.01, defaultValue: 0.42 },
      { key: 'isDeep', label: "Deep History (*) Mode", type: 'number', min: 0, max: 1, step: 1, defaultValue: 1 },
    ],
    defaultParams: { label: "History (H*)", hScale: 0.42, isDeep: 1 },
    jsSourceCode: `// UML: Shallow / Deep History (H*) (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.hScale) || 0.42, 0.3, 0.56);
  const v2 = Math.round(helpers.clamp((params.isDeep !== undefined ? Number(params.isDeep) : 1), 0, 1));
  const t1 = (v1 - 0.3) / Math.max(0.001, 0.26000000000000006);
  const t2 = (v2 - 0) / Math.max(1, 1);
  return [
    { id: 'hScale', label: \`Letter: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'isDeep', label: \`Deep: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'hScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.3, 0.56, t);
    return { ...params, hScale: Number(val.toFixed(2)) };
  }
  if (id === 'isDeep') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, isDeep: Math.round(helpers.lerp(0, 1, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round((params.isDeep !== undefined ? Number(params.isDeep) : 1));
  const next = cur >= 1 ? 0 : cur + 1;
  return { ...params, isDeep: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.hScale) || 0.42, 0.3, 0.56);
  const v2 = Math.round(helpers.clamp((params.isDeep !== undefined ? Number(params.isDeep) : 1), 0, 1));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const r = Math.min(width, height) * 0.45;
  const hs = r * v1;
  paths.push({ nodes: helpers.ellipsePath(cx, cy, r, r), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx - hs, y: cy - hs }, { x: cx - hs, y: cy + hs }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: cx + hs, y: cy - hs }, { x: cx + hs, y: cy + hs }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: cx - hs, y: cy }, { x: cx + hs, y: cy }], false), closed: false });
  if (v2 > 0) {
    paths.push({ nodes: helpers.ellipsePath(cx + hs * 1.35, cy - hs * 0.9, 4, 4), closed: true });
  }
  return paths;
}`,
  },

  // 193. UML: Time Trigger Hourglass
  {
    id: 'flow-uml-time-hourglass',
    name: "UML: Time Trigger Hourglass",
    category: 'Flow & Diagrams',
    description: "UML Time Event trigger hourglass with top/bottom caps and adjustable sand level.",
    iconName: 'Hourglass',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle sand level lines (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "after(30s)" },
      { key: 'widthRatio', label: "Hourglass Width Ratio", type: 'number', min: 0.34, max: 0.72, step: 0.01, defaultValue: 0.52 },
      { key: 'sandLines', label: "Sand Level Lines", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "after(30s)", widthRatio: 0.52, sandLines: 3 },
    jsSourceCode: `// UML: Time Trigger Hourglass (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.widthRatio) || 0.52, 0.34, 0.72);
  const v2 = Math.round(helpers.clamp(Number(params.sandLines) || 3, 2, 4));
  const t1 = (v1 - 0.34) / Math.max(0.001, 0.37999999999999995);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'widthRatio', label: \`Hourglass: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'sandLines', label: \`Sand: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'widthRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.34, 0.72, t);
    return { ...params, widthRatio: Number(val.toFixed(2)) };
  }
  if (id === 'sandLines') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, sandLines: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.sandLines) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, sandLines: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.widthRatio) || 0.52, 0.34, 0.72);
  const v2 = Math.round(helpers.clamp(Number(params.sandLines) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const hw = width * v1 * 0.5;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx - hw, y: pad }, { x: cx + hw, y: pad }, { x: cx - hw, y: height - pad }, { x: cx + hw, y: height - pad }]), closed: true });
  for (let i = 1; i <= v2; i++) {
    const sy = height - pad - i * 5;
    paths.push({ nodes: helpers.polygonPath([{ x: cx - hw * 0.55, y: sy }, { x: cx + hw * 0.55, y: sy }], false), closed: false });
  }
  return paths;
}`,
  },

  // 194. UML: Send Signal Convex Pentagon
  {
    id: 'flow-uml-send-signal-pentagon',
    name: "UML: Send Signal Convex Pentagon",
    category: 'Flow & Diagrams',
    description: "UML Activity Diagram right-pointing convex pentagon for asynchronous signal transmission.",
    iconName: 'Send',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle signal chevron lines (1-3)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Send: Dispatch" },
      { key: 'noseRatio', label: "Arrow Nose Depth", type: 'number', min: 0.16, max: 0.38, step: 0.01, defaultValue: 0.26 },
      { key: 'stripes', label: "Signal Chevron Lines", type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "Send: Dispatch", noseRatio: 0.26, stripes: 2 },
    jsSourceCode: `// UML: Send Signal Convex Pentagon (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.noseRatio) || 0.26, 0.16, 0.38);
  const v2 = Math.round(helpers.clamp(Number(params.stripes) || 2, 1, 3));
  const t1 = (v1 - 0.16) / Math.max(0.001, 0.22);
  const t2 = (v2 - 1) / Math.max(1, 2);
  return [
    { id: 'noseRatio', label: \`Arrow: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'stripes', label: \`Signal: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'noseRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.16, 0.38, t);
    return { ...params, noseRatio: Number(val.toFixed(2)) };
  }
  if (id === 'stripes') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, stripes: Math.round(helpers.lerp(1, 3, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.stripes) || 2);
  const next = cur >= 3 ? 1 : cur + 1;
  return { ...params, stripes: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.noseRatio) || 0.26, 0.16, 0.38);
  const v2 = Math.round(helpers.clamp(Number(params.stripes) || 2, 1, 3));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const nw = width * v1;
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: 0 }, { x: width - nw, y: 0 }, { x: width, y: cy }, { x: width - nw, y: height }, { x: 0, y: height }]), closed: true });
  for (let i = 1; i <= v2; i++) {
    const sx = width - nw - i * 12;
    paths.push({ nodes: helpers.polygonPath([{ x: sx, y: height * 0.24 }, { x: sx + 7, y: cy }, { x: sx, y: height * 0.76 }], false), closed: false });
  }
  return paths;
}`,
  },

  // 195. UML: Accept Event Concave Pentagon
  {
    id: 'flow-uml-accept-event-concave',
    name: "UML: Accept Event Concave Pentagon",
    category: 'Flow & Diagrams',
    description: "UML Activity Diagram left-notched concave flag pentagon waiting for an external event.",
    iconName: 'Inbox',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle inner event lines (1-3)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Accept: Webhook" },
      { key: 'notchRatio', label: "Left Notch Depth", type: 'number', min: 0.14, max: 0.36, step: 0.01, defaultValue: 0.22 },
      { key: 'badges', label: "Inner Event Lines", type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "Accept: Webhook", notchRatio: 0.22, badges: 2 },
    jsSourceCode: `// UML: Accept Event Concave Pentagon (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.notchRatio) || 0.22, 0.14, 0.36);
  const v2 = Math.round(helpers.clamp(Number(params.badges) || 2, 1, 3));
  const t1 = (v1 - 0.14) / Math.max(0.001, 0.21999999999999997);
  const t2 = (v2 - 1) / Math.max(1, 2);
  return [
    { id: 'notchRatio', label: \`Left: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'badges', label: \`Inner: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'notchRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.14, 0.36, t);
    return { ...params, notchRatio: Number(val.toFixed(2)) };
  }
  if (id === 'badges') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, badges: Math.round(helpers.lerp(1, 3, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.badges) || 2);
  const next = cur >= 3 ? 1 : cur + 1;
  return { ...params, badges: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.notchRatio) || 0.22, 0.14, 0.36);
  const v2 = Math.round(helpers.clamp(Number(params.badges) || 2, 1, 3));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const nw = width * v1;
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height }, { x: nw, y: cy }]), closed: true });
  for (let i = 0; i < v2; i++) {
    const ly = height * 0.32 + i * 14;
    paths.push({ nodes: helpers.polygonPath([{ x: nw + 10, y: ly }, { x: width - 12, y: ly }], false), closed: false });
  }
  return paths;
}`,
  },

  // 196. ER Diagram: Database Table Schema
  {
    id: 'flow-er-entity-table',
    name: "ER Diagram: Database Table Schema",
    category: 'Flow & Diagrams',
    description: "Entity-Relationship SQL table box with PK/FK key column divider, typed rows, and crow-foot prongs.",
    iconName: 'Table',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle schema columns (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "users_table (PK)" },
      { key: 'keyCol', label: "PK Column Width", type: 'number', min: 0.18, max: 0.36, step: 0.01, defaultValue: 0.25 },
      { key: 'rows', label: "Schema Columns", type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "users_table (PK)", keyCol: 0.25, rows: 4 },
    jsSourceCode: `// ER Diagram: Database Table Schema (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.keyCol) || 0.25, 0.18, 0.36);
  const v2 = Math.round(helpers.clamp(Number(params.rows) || 4, 3, 6));
  const t1 = (v1 - 0.18) / Math.max(0.001, 0.18);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'keyCol', label: \`PK: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'rows', label: \`Schema: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'keyCol') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.18, 0.36, t);
    return { ...params, keyCol: Number(val.toFixed(2)) };
  }
  if (id === 'rows') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, rows: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.rows) || 4);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, rows: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.keyCol) || 0.25, 0.18, 0.36);
  const v2 = Math.round(helpers.clamp(Number(params.rows) || 4, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const kw = width * v1;
  const hh = height * 0.22;
  paths.push({ nodes: helpers.rectPath(0, 0, width - 10, height, 2), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: hh }, { x: width - 10, y: hh }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: kw, y: hh }, { x: kw, y: height }], false), closed: false });
  const rh = (height - hh) / v2;
  for (let i = 1; i < v2; i++) {
    paths.push({ nodes: helpers.polygonPath([{ x: 0, y: hh + i * rh }, { x: width - 10, y: hh + i * rh }], false), closed: false });
  }
  paths.push({ nodes: helpers.polygonPath([{ x: width - 10, y: cy }, { x: width, y: cy - 8 }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: width - 10, y: cy }, { x: width, y: cy }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: width - 10, y: cy }, { x: width, y: cy + 8 }], false), closed: false });
  return paths;
}`,
  },

  // 197. ER Diagram: Weak Entity Double Box
  {
    id: 'flow-er-weak-entity',
    name: "ER Diagram: Weak Entity Double Box",
    category: 'Flow & Diagrams',
    description: "Chen ER Notation double-walled rectangular Weak Entity with corner tie struts.",
    iconName: 'SquareStack',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle corner tie struts (0-1)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Weak Entity" },
      { key: 'insetRatio', label: "Inner Box Inset", type: 'number', min: 0.07, max: 0.18, step: 0.01, defaultValue: 0.11 },
      { key: 'struts', label: "Corner Tie Struts", type: 'number', min: 0, max: 1, step: 1, defaultValue: 1 },
    ],
    defaultParams: { label: "Weak Entity", insetRatio: 0.11, struts: 1 },
    jsSourceCode: `// ER Diagram: Weak Entity Double Box (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.insetRatio) || 0.11, 0.07, 0.18);
  const v2 = Math.round(helpers.clamp((params.struts !== undefined ? Number(params.struts) : 1), 0, 1));
  const t1 = (v1 - 0.07) / Math.max(0.001, 0.10999999999999999);
  const t2 = (v2 - 0) / Math.max(1, 1);
  return [
    { id: 'insetRatio', label: \`Inner: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'struts', label: \`Corner: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'insetRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.07, 0.18, t);
    return { ...params, insetRatio: Number(val.toFixed(2)) };
  }
  if (id === 'struts') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, struts: Math.round(helpers.lerp(0, 1, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round((params.struts !== undefined ? Number(params.struts) : 1));
  const next = cur >= 1 ? 0 : cur + 1;
  return { ...params, struts: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.insetRatio) || 0.11, 0.07, 0.18);
  const v2 = Math.round(helpers.clamp((params.struts !== undefined ? Number(params.struts) : 1), 0, 1));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const ins = Math.min(width, height) * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 2), closed: true });
  paths.push({ nodes: helpers.rectPath(ins, ins, width - ins * 2, height - ins * 2, 1), closed: true });
  if (v2 > 0) {
    paths.push({ nodes: helpers.polygonPath([{ x: 0, y: 0 }, { x: ins, y: ins }], false), closed: false });
    paths.push({ nodes: helpers.polygonPath([{ x: width, y: 0 }, { x: width - ins, y: ins }], false), closed: false });
    paths.push({ nodes: helpers.polygonPath([{ x: 0, y: height }, { x: ins, y: height - ins }], false), closed: false });
    paths.push({ nodes: helpers.polygonPath([{ x: width, y: height }, { x: width - ins, y: height - ins }], false), closed: false });
  }
  return paths;
}`,
  },

  // 198. ER Diagram: Identifying Relationship
  {
    id: 'flow-er-identifying-diamond',
    name: "ER Diagram: Identifying Relationship",
    category: 'Flow & Diagrams',
    description: "Chen ER Notation concentric double-diamond Identifying Relationship node.",
    iconName: 'Diamond',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle cardinality ticks (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "BelongsTo" },
      { key: 'insetRatio', label: "Inner Diamond Inset", type: 'number', min: 0.12, max: 0.28, step: 0.01, defaultValue: 0.18 },
      { key: 'stubs', label: "Cardinality Ticks", type: 'number', min: 2, max: 4, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "BelongsTo", insetRatio: 0.18, stubs: 2 },
    jsSourceCode: `// ER Diagram: Identifying Relationship (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.insetRatio) || 0.18, 0.12, 0.28);
  const v2 = Math.round(helpers.clamp(Number(params.stubs) || 2, 2, 4));
  const t1 = (v1 - 0.12) / Math.max(0.001, 0.16000000000000003);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'insetRatio', label: \`Inner: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'stubs', label: \`Cardinality: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'insetRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.12, 0.28, t);
    return { ...params, insetRatio: Number(val.toFixed(2)) };
  }
  if (id === 'stubs') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, stubs: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.stubs) || 2);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, stubs: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.insetRatio) || 0.18, 0.12, 0.28);
  const v2 = Math.round(helpers.clamp(Number(params.stubs) || 2, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const ins = v1;
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: 0 }, { x: width, y: cy }, { x: cx, y: height }, { x: 0, y: cy }]), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: height * ins }, { x: width * (1 - ins), y: cy }, { x: cx, y: height * (1 - ins) }, { x: width * ins, y: cy }]), closed: true });
  const stubPts = [[[0, cy], [width * ins, cy]], [[width * (1 - ins), cy], [width, cy]], [[cx, 0], [cx, height * ins]], [[cx, height * (1 - ins)], [cx, height]]];
  for (let s = 0; s < v2; s++) {
    paths.push({ nodes: helpers.polygonPath([{ x: stubPts[s][0][0], y: stubPts[s][0][1] }, { x: stubPts[s][1][0], y: stubPts[s][1][1] }], false), closed: false });
  }
  return paths;
}`,
  },

  // 199. ER Diagram: Multivalued Attribute Oval
  {
    id: 'flow-er-multivalued-attr',
    name: "ER Diagram: Multivalued Attribute Oval",
    category: 'Flow & Diagrams',
    description: "Chen ER Notation concentric double-ellipse Multivalued Attribute symbol.",
    iconName: 'Circle',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle key underline bar (0-1)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "{phone_numbers}" },
      { key: 'insetRatio', label: "Inner Oval Inset", type: 'number', min: 0.1, max: 0.24, step: 0.01, defaultValue: 0.15 },
      { key: 'underlined', label: "Key Underline Bar", type: 'number', min: 0, max: 1, step: 1, defaultValue: 1 },
    ],
    defaultParams: { label: "{phone_numbers}", insetRatio: 0.15, underlined: 1 },
    jsSourceCode: `// ER Diagram: Multivalued Attribute Oval (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.insetRatio) || 0.15, 0.1, 0.24);
  const v2 = Math.round(helpers.clamp((params.underlined !== undefined ? Number(params.underlined) : 1), 0, 1));
  const t1 = (v1 - 0.1) / Math.max(0.001, 0.13999999999999999);
  const t2 = (v2 - 0) / Math.max(1, 1);
  return [
    { id: 'insetRatio', label: \`Inner: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'underlined', label: \`Key: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'insetRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.1, 0.24, t);
    return { ...params, insetRatio: Number(val.toFixed(2)) };
  }
  if (id === 'underlined') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, underlined: Math.round(helpers.lerp(0, 1, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round((params.underlined !== undefined ? Number(params.underlined) : 1));
  const next = cur >= 1 ? 0 : cur + 1;
  return { ...params, underlined: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.insetRatio) || 0.15, 0.1, 0.24);
  const v2 = Math.round(helpers.clamp((params.underlined !== undefined ? Number(params.underlined) : 1), 0, 1));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const rx = width / 2;
  const ry = height / 2;
  const f = 1 - v1;
  paths.push({ nodes: helpers.ellipsePath(cx, cy, rx, ry), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, cy, rx * f, ry * f), closed: true });
  if (v2 > 0) {
    paths.push({ nodes: helpers.polygonPath([{ x: width * 0.26, y: cy + 9 }, { x: width * 0.74, y: cy + 9 }], false), closed: false });
  }
  return paths;
}`,
  },

  // 200. DFD: Yourdon-DeMarco Process Circle
  {
    id: 'flow-dfd-yourdon-process',
    name: "DFD: Yourdon-DeMarco Process Circle",
    category: 'Flow & Diagrams',
    description: "Data Flow Diagram circular process bubble with top ID chord and bottom processor chord.",
    iconName: 'Circle',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle chord dividers (1-2)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "1.0 Validate" },
      { key: 'chordOffset', label: "Chord Line Offset", type: 'number', min: 0.2, max: 0.38, step: 0.01, defaultValue: 0.28 },
      { key: 'bars', label: "Chord Dividers", type: 'number', min: 1, max: 2, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "1.0 Validate", chordOffset: 0.28, bars: 2 },
    jsSourceCode: `// DFD: Yourdon-DeMarco Process Circle (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.chordOffset) || 0.28, 0.2, 0.38);
  const v2 = Math.round(helpers.clamp(Number(params.bars) || 2, 1, 2));
  const t1 = (v1 - 0.2) / Math.max(0.001, 0.18);
  const t2 = (v2 - 1) / Math.max(1, 1);
  return [
    { id: 'chordOffset', label: \`Chord: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'bars', label: \`Chord: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'chordOffset') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.2, 0.38, t);
    return { ...params, chordOffset: Number(val.toFixed(2)) };
  }
  if (id === 'bars') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, bars: Math.round(helpers.lerp(1, 2, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.bars) || 2);
  const next = cur >= 2 ? 1 : cur + 1;
  return { ...params, bars: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.chordOffset) || 0.28, 0.2, 0.38);
  const v2 = Math.round(helpers.clamp(Number(params.bars) || 2, 1, 2));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const r = Math.min(width, height) * 0.46;
  const dy = r * (1 - v1);
  const dx = Math.sqrt(Math.max(1, r * r - dy * dy));
  paths.push({ nodes: helpers.ellipsePath(cx, cy, r, r), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx - dx, y: cy - dy }, { x: cx + dx, y: cy - dy }], false), closed: false });
  if (v2 > 1) {
    paths.push({ nodes: helpers.polygonPath([{ x: cx - dx, y: cy + dy }, { x: cx + dx, y: cy + dy }], false), closed: false });
  }
  return paths;
}`,
  },

  // 201. DFD: Gane-Sarson Rounded Process
  {
    id: 'flow-dfd-gansarson-process',
    name: "DFD: Gane-Sarson Rounded Process",
    category: 'Flow & Diagrams',
    description: "Gane & Sarson DFD rounded process card with top ID band and left vertical number cell.",
    iconName: 'RectangleHorizontal',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle id cell width (%) (20-40)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "P2: Enrich Data" },
      { key: 'headerRatio', label: "Top ID Band Height", type: 'number', min: 0.16, max: 0.32, step: 0.01, defaultValue: 0.22 },
      { key: 'idWidth', label: "ID Cell Width (%)", type: 'number', min: 20, max: 40, step: 1, defaultValue: 28 },
    ],
    defaultParams: { label: "P2: Enrich Data", headerRatio: 0.22, idWidth: 28 },
    jsSourceCode: `// DFD: Gane-Sarson Rounded Process (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.headerRatio) || 0.22, 0.16, 0.32);
  const v2 = Math.round(helpers.clamp(Number(params.idWidth) || 28, 20, 40));
  const t1 = (v1 - 0.16) / Math.max(0.001, 0.16);
  const t2 = (v2 - 20) / Math.max(1, 20);
  return [
    { id: 'headerRatio', label: \`Top: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'idWidth', label: \`ID: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'headerRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.16, 0.32, t);
    return { ...params, headerRatio: Number(val.toFixed(2)) };
  }
  if (id === 'idWidth') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, idWidth: Math.round(helpers.lerp(20, 40, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.idWidth) || 28);
  const next = cur >= 40 ? 20 : cur + 1;
  return { ...params, idWidth: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.headerRatio) || 0.22, 0.16, 0.32);
  const v2 = Math.round(helpers.clamp(Number(params.idWidth) || 28, 20, 40));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const hh = height * v1;
  const iw = (width * v2) / 100;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 10), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: hh }, { x: width, y: hh }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: iw, y: 0 }, { x: iw, y: hh }], false), closed: false });
  return paths;
}`,
  },

  // 202. DFD: Open-Ended Data Store
  {
    id: 'flow-dfd-open-data-store',
    name: "DFD: Open-Ended Data Store",
    category: 'Flow & Diagrams',
    description: "DFD open-right-edge Data Store rectangle with left D-index compartment.",
    iconName: 'Database',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle double left bar (1-2)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "D1 | Accounts" },
      { key: 'idColRatio', label: "ID Compartment Width", type: 'number', min: 0.16, max: 0.34, step: 0.01, defaultValue: 0.22 },
      { key: 'doubleLeft', label: "Double Left Bar", type: 'number', min: 1, max: 2, step: 1, defaultValue: 1 },
    ],
    defaultParams: { label: "D1 | Accounts", idColRatio: 0.22, doubleLeft: 1 },
    jsSourceCode: `// DFD: Open-Ended Data Store (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.idColRatio) || 0.22, 0.16, 0.34);
  const v2 = Math.round(helpers.clamp(Number(params.doubleLeft) || 1, 1, 2));
  const t1 = (v1 - 0.16) / Math.max(0.001, 0.18000000000000002);
  const t2 = (v2 - 1) / Math.max(1, 1);
  return [
    { id: 'idColRatio', label: \`ID: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'doubleLeft', label: \`Double: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'idColRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.16, 0.34, t);
    return { ...params, idColRatio: Number(val.toFixed(2)) };
  }
  if (id === 'doubleLeft') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, doubleLeft: Math.round(helpers.lerp(1, 2, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.doubleLeft) || 1);
  const next = cur >= 2 ? 1 : cur + 1;
  return { ...params, doubleLeft: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.idColRatio) || 0.22, 0.16, 0.34);
  const v2 = Math.round(helpers.clamp(Number(params.doubleLeft) || 1, 1, 2));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const iw = width * v1;
  paths.push({ nodes: helpers.polygonPath([{ x: width, y: 0 }, { x: 0, y: 0 }, { x: 0, y: height }, { x: width, y: height }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: iw, y: 0 }, { x: iw, y: height }], false), closed: false });
  if (v2 > 1) {
    paths.push({ nodes: helpers.polygonPath([{ x: 5, y: 0 }, { x: 5, y: height }], false), closed: false });
  }
  return paths;
}`,
  },

  // 203. C4 Model: Person / User Node
  {
    id: 'flow-c4-person-card',
    name: "C4 Model: Person / User Node",
    category: 'Flow & Diagrams',
    description: "C4 Architecture Model Person shape with circular head overlapping rounded torso card.",
    iconName: 'User',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle description lines (1-3)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Customer [Person]" },
      { key: 'headRatio', label: "Head Circle Size", type: 'number', min: 0.18, max: 0.34, step: 0.01, defaultValue: 0.25 },
      { key: 'badgeLines', label: "Description Lines", type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "Customer [Person]", headRatio: 0.25, badgeLines: 2 },
    jsSourceCode: `// C4 Model: Person / User Node (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.headRatio) || 0.25, 0.18, 0.34);
  const v2 = Math.round(helpers.clamp(Number(params.badgeLines) || 2, 1, 3));
  const t1 = (v1 - 0.18) / Math.max(0.001, 0.16000000000000003);
  const t2 = (v2 - 1) / Math.max(1, 2);
  return [
    { id: 'headRatio', label: \`Head: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'badgeLines', label: \`Description: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'headRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.18, 0.34, t);
    return { ...params, headRatio: Number(val.toFixed(2)) };
  }
  if (id === 'badgeLines') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, badgeLines: Math.round(helpers.lerp(1, 3, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.badgeLines) || 2);
  const next = cur >= 3 ? 1 : cur + 1;
  return { ...params, badgeLines: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.headRatio) || 0.25, 0.18, 0.34);
  const v2 = Math.round(helpers.clamp(Number(params.badgeLines) || 2, 1, 3));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const hr = Math.min(width, height) * v1;
  const bodyY = hr * 1.55;
  paths.push({ nodes: helpers.rectPath(width * 0.08, bodyY, width * 0.84, height - bodyY, 14), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, hr + 2, hr, hr), closed: true });
  for (let i = 0; i < v2; i++) {
    const ly = bodyY + 14 + i * 10;
    paths.push({ nodes: helpers.polygonPath([{ x: width * 0.24, y: ly }, { x: width * 0.76, y: ly }], false), closed: false });
  }
  return paths;
}`,
  },

  // 204. C4 Model: Software System Container
  {
    id: 'flow-c4-software-system',
    name: "C4 Model: Software System Container",
    category: 'Flow & Diagrams',
    description: "C4 System/Container boundary box with bottom metadata pill and nested microservice cards.",
    iconName: 'Layers',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle inner containers (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Core Platform [C4]" },
      { key: 'padRatio', label: "Boundary Padding", type: 'number', min: 0.08, max: 0.2, step: 0.01, defaultValue: 0.12 },
      { key: 'containers', label: "Inner Containers", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Core Platform [C4]", padRatio: 0.12, containers: 3 },
    jsSourceCode: `// C4 Model: Software System Container (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.padRatio) || 0.12, 0.08, 0.2);
  const v2 = Math.round(helpers.clamp(Number(params.containers) || 3, 2, 4));
  const t1 = (v1 - 0.08) / Math.max(0.001, 0.12000000000000001);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'padRatio', label: \`Boundary: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'containers', label: \`Inner: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'padRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.08, 0.2, t);
    return { ...params, padRatio: Number(val.toFixed(2)) };
  }
  if (id === 'containers') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, containers: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.containers) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, containers: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.padRatio) || 0.12, 0.08, 0.2);
  const v2 = Math.round(helpers.clamp(Number(params.containers) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const p = Math.min(width, height) * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  const cw = (width - p * 2 - (v2 - 1) * 6) / v2;
  const ch = height - p * 2.5 - 12;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(p + i * (cw + 6), p, cw, ch, 4), closed: true });
  }
  paths.push({ nodes: helpers.rectPath(p, height - p - 10, width * 0.36, 10, 2), closed: true });
  return paths;
}`,
  },

  // 205. Architecture: Hexagonal Ports & Adapters
  {
    id: 'flow-c4-hexagonal-port-adapter',
    name: "Architecture: Hexagonal Ports & Adapters",
    category: 'Flow & Diagrams',
    description: "Alistair Cockburn Hexagonal Architecture with inner domain hexagon, outer adapter ring, and 6 ports.",
    iconName: 'Hexagon',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle active edge ports (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Hexagonal Core" },
      { key: 'coreRatio', label: "Domain Core Ratio", type: 'number', min: 0.38, max: 0.72, step: 0.01, defaultValue: 0.54 },
      { key: 'ports', label: "Active Edge Ports", type: 'number', min: 3, max: 6, step: 1, defaultValue: 6 },
    ],
    defaultParams: { label: "Hexagonal Core", coreRatio: 0.54, ports: 6 },
    jsSourceCode: `// Architecture: Hexagonal Ports & Adapters (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.coreRatio) || 0.54, 0.38, 0.72);
  const v2 = Math.round(helpers.clamp(Number(params.ports) || 6, 3, 6));
  const t1 = (v1 - 0.38) / Math.max(0.001, 0.33999999999999997);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'coreRatio', label: \`Domain: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'ports', label: \`Active: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'coreRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.38, 0.72, t);
    return { ...params, coreRatio: Number(val.toFixed(2)) };
  }
  if (id === 'ports') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, ports: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.ports) || 6);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, ports: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.coreRatio) || 0.54, 0.38, 0.72);
  const v2 = Math.round(helpers.clamp(Number(params.ports) || 6, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const rx = width * 0.46;
  const ry = height * 0.46;
  const outer = [];
  const inner = [];
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    outer.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry });
    inner.push({ x: cx + Math.cos(a) * rx * v1, y: cy + Math.sin(a) * ry * v1 });
  }
  paths.push({ nodes: helpers.polygonPath(outer), closed: true });
  paths.push({ nodes: helpers.polygonPath(inner), closed: true });
  for (let i = 0; i < v2; i++) {
    const a = (i * Math.PI) / 3 + Math.PI / 6;
    paths.push({ nodes: helpers.ellipsePath(cx + Math.cos(a) * rx * 0.86, cy + Math.sin(a) * ry * 0.86, 4.5, 4.5), closed: true });
  }
  return paths;
}`,
  },

  // 206. Architecture: CQRS Command / Query Split
  {
    id: 'flow-c4-cqrs-split-bus',
    name: "Architecture: CQRS Command / Query Split",
    category: 'Flow & Diagrams',
    description: "Command Query Responsibility Segregation node with upper Write Command lane and lower Read Query lane.",
    iconName: 'GitFork',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle replica stores (1-3)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "CQRS Split Bus" },
      { key: 'laneGap', label: "Write/Read Separation", type: 'number', min: 0.18, max: 0.42, step: 0.01, defaultValue: 0.28 },
      { key: 'stores', label: "Replica Stores", type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "CQRS Split Bus", laneGap: 0.28, stores: 2 },
    jsSourceCode: `// Architecture: CQRS Command / Query Split (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.laneGap) || 0.28, 0.18, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.stores) || 2, 1, 3));
  const t1 = (v1 - 0.18) / Math.max(0.001, 0.24);
  const t2 = (v2 - 1) / Math.max(1, 2);
  return [
    { id: 'laneGap', label: \`Write/Read: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'stores', label: \`Replica: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'laneGap') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.18, 0.42, t);
    return { ...params, laneGap: Number(val.toFixed(2)) };
  }
  if (id === 'stores') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, stores: Math.round(helpers.lerp(1, 3, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.stores) || 2);
  const next = cur >= 3 ? 1 : cur + 1;
  return { ...params, stores: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.laneGap) || 0.28, 0.18, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.stores) || 2, 1, 3));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const gap = height * v1 * 0.5;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, cy - 14, width * 0.22, 28, 3), closed: true });
  const rx = width * 0.42;
  const rw = width * 0.5;
  const rh = Math.max(14, cy - gap - pad);
  paths.push({ nodes: helpers.rectPath(rx, pad, rw, rh, 3), closed: true });
  paths.push({ nodes: helpers.rectPath(rx, cy + gap, rw, rh, 3), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: pad + width * 0.22, y: cy - 6 }, { x: rx, y: pad + rh / 2 }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: pad + width * 0.22, y: cy + 6 }, { x: rx, y: cy + gap + rh / 2 }], false), closed: false });
  for (let s = 1; s <= v2; s++) {
    const sx = rx + (s * rw) / (v2 + 1);
    paths.push({ nodes: helpers.polygonPath([{ x: sx, y: cy + gap + 3 }, { x: sx, y: cy + gap + rh - 3 }], false), closed: false });
  }
  return paths;
}`,
  },

  // 207. Cloud: VPC Virtual Network Frame
  {
    id: 'flow-cloud-vpc-boundary',
    name: "Cloud: VPC Virtual Network Frame",
    category: 'Flow & Diagrams',
    description: "Virtual Private Cloud boundary frame with corner lock/cloud badge and Availability Zone columns.",
    iconName: 'Cloud',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle availability zones (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "VPC: 10.0.0.0/16" },
      { key: 'headerRatio', label: "VPC Header Height", type: 'number', min: 0.14, max: 0.28, step: 0.01, defaultValue: 0.18 },
      { key: 'zones', label: "Availability Zones", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "VPC: 10.0.0.0/16", headerRatio: 0.18, zones: 3 },
    jsSourceCode: `// Cloud: VPC Virtual Network Frame (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.headerRatio) || 0.18, 0.14, 0.28);
  const v2 = Math.round(helpers.clamp(Number(params.zones) || 3, 2, 4));
  const t1 = (v1 - 0.14) / Math.max(0.001, 0.14);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'headerRatio', label: \`VPC: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'zones', label: \`Availability: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'headerRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.14, 0.28, t);
    return { ...params, headerRatio: Number(val.toFixed(2)) };
  }
  if (id === 'zones') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, zones: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.zones) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, zones: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.headerRatio) || 0.18, 0.14, 0.28);
  const v2 = Math.round(helpers.clamp(Number(params.zones) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const hh = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.rectPath(0, 0, width * 0.34, hh, 2), closed: true });
  const zw = (width - pad * 2 - (v2 - 1) * 6) / v2;
  const zh = height - hh - pad * 1.6;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(pad + i * (zw + 6), hh + pad * 0.6, zw, zh, 3), closed: true });
  }
  return paths;
}`,
  },

  // 208. Cloud: Global CDN Edge PoP
  {
    id: 'flow-cloud-cdn-edge-pop',
    name: "Cloud: Global CDN Edge PoP",
    category: 'Flow & Diagrams',
    description: "Central origin server globe radiating low-latency fiber spokes to perimeter Edge PoP nodes.",
    iconName: 'Globe',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle edge pop satellites (4-8)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "CDN Edge PoPs" },
      { key: 'coreScale', label: "Origin Globe Scale", type: 'number', min: 0.18, max: 0.36, step: 0.01, defaultValue: 0.25 },
      { key: 'pops', label: "Edge PoP Satellites", type: 'number', min: 4, max: 8, step: 1, defaultValue: 6 },
    ],
    defaultParams: { label: "CDN Edge PoPs", coreScale: 0.25, pops: 6 },
    jsSourceCode: `// Cloud: Global CDN Edge PoP (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.coreScale) || 0.25, 0.18, 0.36);
  const v2 = Math.round(helpers.clamp(Number(params.pops) || 6, 4, 8));
  const t1 = (v1 - 0.18) / Math.max(0.001, 0.18);
  const t2 = (v2 - 4) / Math.max(1, 4);
  return [
    { id: 'coreScale', label: \`Origin: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'pops', label: \`Edge: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'coreScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.18, 0.36, t);
    return { ...params, coreScale: Number(val.toFixed(2)) };
  }
  if (id === 'pops') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, pops: Math.round(helpers.lerp(4, 8, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.pops) || 6);
  const next = cur >= 8 ? 4 : cur + 1;
  return { ...params, pops: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.coreScale) || 0.25, 0.18, 0.36);
  const v2 = Math.round(helpers.clamp(Number(params.pops) || 6, 4, 8));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const cr = Math.min(width, height) * v1;
  const orbit = Math.min(width, height) * 0.4;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, cy, cr, cr), closed: true });
  for (let i = 0; i < v2; i++) {
    const a = (i * Math.PI * 2) / v2 - Math.PI / 2;
    const px = cx + Math.cos(a) * orbit * 1.15;
    const py = cy + Math.sin(a) * orbit * 0.92;
    paths.push({ nodes: helpers.polygonPath([{ x: cx + Math.cos(a) * cr, y: cy + Math.sin(a) * cr }, { x: px, y: py }], false), closed: false });
    paths.push({ nodes: helpers.ellipsePath(px, py, 6, 6), closed: true });
  }
  return paths;
}`,
  },

  // 209. Cloud: WAF Brick Firewall Shield
  {
    id: 'flow-cloud-waf-firewall',
    name: "Cloud: WAF Brick Firewall Shield",
    category: 'Flow & Diagrams',
    description: "Staggered running-bond masonry firewall backdrop protected by a central deflection shield.",
    iconName: 'ShieldAlert',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle brick wall courses (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "WAF Firewall" },
      { key: 'shieldScale', label: "Deflection Shield Size", type: 'number', min: 0.28, max: 0.56, step: 0.01, defaultValue: 0.42 },
      { key: 'rows', label: "Brick Wall Courses", type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "WAF Firewall", shieldScale: 0.42, rows: 4 },
    jsSourceCode: `// Cloud: WAF Brick Firewall Shield (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.shieldScale) || 0.42, 0.28, 0.56);
  const v2 = Math.round(helpers.clamp(Number(params.rows) || 4, 3, 6));
  const t1 = (v1 - 0.28) / Math.max(0.001, 0.28);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'shieldScale', label: \`Deflection: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'rows', label: \`Brick: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'shieldScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.28, 0.56, t);
    return { ...params, shieldScale: Number(val.toFixed(2)) };
  }
  if (id === 'rows') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, rows: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.rows) || 4);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, rows: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.shieldScale) || 0.42, 0.28, 0.56);
  const v2 = Math.round(helpers.clamp(Number(params.rows) || 4, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const sr = Math.min(width, height) * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  const rh = height / v2;
  for (let r = 1; r < v2; r++) {
    paths.push({ nodes: helpers.polygonPath([{ x: 0, y: r * rh }, { x: width, y: r * rh }], false), closed: false });
  }
  paths.push({ nodes: helpers.polygonPath([
    { x: cx, y: cy - sr },
    { x: cx + sr * 0.85, y: cy - sr * 0.6 },
    { x: cx + sr * 0.7, y: cy + sr * 0.35 },
    { x: cx, y: cy + sr },
    { x: cx - sr * 0.7, y: cy + sr * 0.35 },
    { x: cx - sr * 0.85, y: cy - sr * 0.6 }
  ]), closed: true });
  return paths;
}`,
  },

  // 210. Cloud: API Gateway Multiplexer
  {
    id: 'flow-cloud-api-gateway-router',
    name: "Cloud: API Gateway Multiplexer",
    category: 'Flow & Diagrams',
    description: "Left client ingress funnel passing through central auth pillar to N fanned-out backend routes.",
    iconName: 'Network',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle downstream routes (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "API Gateway" },
      { key: 'gateX', label: "Gateway Pillar X", type: 'number', min: 0.35, max: 0.62, step: 0.01, defaultValue: 0.46 },
      { key: 'routes', label: "Downstream Routes", type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "API Gateway", gateX: 0.46, routes: 4 },
    jsSourceCode: `// Cloud: API Gateway Multiplexer (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.gateX) || 0.46, 0.35, 0.62);
  const v2 = Math.round(helpers.clamp(Number(params.routes) || 4, 3, 6));
  const t1 = (v1 - 0.35) / Math.max(0.001, 0.27);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'gateX', label: \`Gateway: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'routes', label: \`Downstream: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'gateX') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.35, 0.62, t);
    return { ...params, gateX: Number(val.toFixed(2)) };
  }
  if (id === 'routes') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, routes: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.routes) || 4);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, routes: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.gateX) || 0.46, 0.35, 0.62);
  const v2 = Math.round(helpers.clamp(Number(params.routes) || 4, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const gx = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, cy - 12, width * 0.16, 24, 3), closed: true });
  paths.push({ nodes: helpers.rectPath(gx - 8, pad, 16, height - pad * 2, 3), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: pad + width * 0.16, y: cy }, { x: gx - 8, y: cy }], false), closed: false });
  for (let i = 0; i < v2; i++) {
    const ry = helpers.lerp(pad + 10, height - pad - 10, i / Math.max(1, v2 - 1));
    paths.push({ nodes: helpers.polygonPath([{ x: gx + 8, y: cy }, { x: width - pad - 18, y: ry }], false), closed: false });
    paths.push({ nodes: helpers.rectPath(width - pad - 18, ry - 6, 18, 12, 2), closed: true });
  }
  return paths;
}`,
  },

  // 211. Cloud: Service Mesh Pod + Sidecar
  {
    id: 'flow-cloud-service-mesh-sidecar',
    name: "Cloud: Service Mesh Pod + Sidecar",
    category: 'Flow & Diagrams',
    description: "Kubernetes Pod enclosure housing primary microservice block paired with Envoy mTLS proxy sidecar.",
    iconName: 'Boxes',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle loopback channels (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Pod + Envoy Sidecar" },
      { key: 'appWidth', label: "Primary App Width", type: 'number', min: 0.42, max: 0.68, step: 0.01, defaultValue: 0.54 },
      { key: 'links', label: "Loopback Channels", type: 'number', min: 2, max: 4, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "Pod + Envoy Sidecar", appWidth: 0.54, links: 2 },
    jsSourceCode: `// Cloud: Service Mesh Pod + Sidecar (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.appWidth) || 0.54, 0.42, 0.68);
  const v2 = Math.round(helpers.clamp(Number(params.links) || 2, 2, 4));
  const t1 = (v1 - 0.42) / Math.max(0.001, 0.26000000000000006);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'appWidth', label: \`Primary: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'links', label: \`Loopback: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'appWidth') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.42, 0.68, t);
    return { ...params, appWidth: Number(val.toFixed(2)) };
  }
  if (id === 'links') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, links: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.links) || 2);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, links: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.appWidth) || 0.54, 0.42, 0.68);
  const v2 = Math.round(helpers.clamp(Number(params.links) || 2, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const aw = (width - pad * 3) * v1;
  const sw = width - pad * 3 - aw;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, pad * 1.4, aw, height - pad * 2.8, 4), closed: true });
  paths.push({ nodes: helpers.rectPath(pad * 2 + aw, pad * 2, sw, height - pad * 4, 4), closed: true });
  for (let i = 0; i < v2; i++) {
    const ly = cy - 8 + i * 16;
    paths.push({ nodes: helpers.polygonPath([{ x: pad + aw, y: ly }, { x: pad * 2 + aw, y: ly }], false), closed: false });
  }
  return paths;
}`,
  },

  // 212. Cloud: Kubernetes Heptagon Wheel
  {
    id: 'flow-cloud-k8s-helm-wheel',
    name: "Cloud: Kubernetes Heptagon Wheel",
    category: 'Flow & Diagrams',
    description: "7-sided Kubernetes heptagonal badge with inner ship helm ring, hub, and 7 radiating spokes.",
    iconName: 'Compass',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle helm spokes (5-9)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "K8s Cluster" },
      { key: 'ringRatio', label: "Helm Wheel Radius", type: 'number', min: 0.42, max: 0.72, step: 0.01, defaultValue: 0.58 },
      { key: 'spokes', label: "Helm Spokes", type: 'number', min: 5, max: 9, step: 1, defaultValue: 7 },
    ],
    defaultParams: { label: "K8s Cluster", ringRatio: 0.58, spokes: 7 },
    jsSourceCode: `// Cloud: Kubernetes Heptagon Wheel (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.ringRatio) || 0.58, 0.42, 0.72);
  const v2 = Math.round(helpers.clamp(Number(params.spokes) || 7, 5, 9));
  const t1 = (v1 - 0.42) / Math.max(0.001, 0.3);
  const t2 = (v2 - 5) / Math.max(1, 4);
  return [
    { id: 'ringRatio', label: \`Helm: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'spokes', label: \`Helm: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'ringRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.42, 0.72, t);
    return { ...params, ringRatio: Number(val.toFixed(2)) };
  }
  if (id === 'spokes') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, spokes: Math.round(helpers.lerp(5, 9, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.spokes) || 7);
  const next = cur >= 9 ? 5 : cur + 1;
  return { ...params, spokes: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.ringRatio) || 0.58, 0.42, 0.72);
  const v2 = Math.round(helpers.clamp(Number(params.spokes) || 7, 5, 9));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const r = Math.min(width, height) * 0.46;
  const ri = r * v1;
  const poly = [];
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 7;
    poly.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  paths.push({ nodes: helpers.polygonPath(poly), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, cy, ri, ri), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, cy, ri * 0.32, ri * 0.32), closed: true });
  for (let i = 0; i < v2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / v2;
    paths.push({ nodes: helpers.polygonPath([{ x: cx + Math.cos(a) * ri * 0.32, y: cy + Math.sin(a) * ri * 0.32 }, { x: cx + Math.cos(a) * (ri + 6), y: cy + Math.sin(a) * (ri + 6) }], false), closed: false });
  }
  return paths;
}`,
  },

  // 213. Cloud: Container Shipping Stack
  {
    id: 'flow-cloud-docker-container-stack',
    name: "Cloud: Container Shipping Stack",
    category: 'Flow & Diagrams',
    description: "Corrugated shipping container block with vertical structural ribs and overhead crane spreader.",
    iconName: 'Package',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle corrugation ribs (4-9)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Container Image" },
      { key: 'boxHeight', label: "Container Height Ratio", type: 'number', min: 0.5, max: 0.8, step: 0.01, defaultValue: 0.65 },
      { key: 'ribs', label: "Corrugation Ribs", type: 'number', min: 4, max: 9, step: 1, defaultValue: 6 },
    ],
    defaultParams: { label: "Container Image", boxHeight: 0.65, ribs: 6 },
    jsSourceCode: `// Cloud: Container Shipping Stack (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.boxHeight) || 0.65, 0.5, 0.8);
  const v2 = Math.round(helpers.clamp(Number(params.ribs) || 6, 4, 9));
  const t1 = (v1 - 0.5) / Math.max(0.001, 0.30000000000000004);
  const t2 = (v2 - 4) / Math.max(1, 5);
  return [
    { id: 'boxHeight', label: \`Container: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'ribs', label: \`Corrugation: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'boxHeight') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.5, 0.8, t);
    return { ...params, boxHeight: Number(val.toFixed(2)) };
  }
  if (id === 'ribs') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, ribs: Math.round(helpers.lerp(4, 9, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.ribs) || 6);
  const next = cur >= 9 ? 4 : cur + 1;
  return { ...params, ribs: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.boxHeight) || 0.65, 0.5, 0.8);
  const v2 = Math.round(helpers.clamp(Number(params.ribs) || 6, 4, 9));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const bh = height * v1;
  const by = height - bh - 4;
  paths.push({ nodes: helpers.rectPath(pad, by, width - pad * 2, bh, 3), closed: true });
  for (let i = 1; i <= v2; i++) {
    const rx = pad + (i * (width - pad * 2)) / (v2 + 1);
    paths.push({ nodes: helpers.polygonPath([{ x: rx, y: by + 4 }, { x: rx, y: by + bh - 4 }], false), closed: false });
  }
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: 2 }, { x: cx, y: 12 }, { x: pad * 2, y: by }, { x: width - pad * 2, y: by }, { x: cx, y: 12 }], false), closed: false });
  return paths;
}`,
  },

  // 214. Cloud: Serverless Function (Lambda λ)
  {
    id: 'flow-cloud-serverless-lambda',
    name: "Cloud: Serverless Function (Lambda λ)",
    category: 'Flow & Diagrams',
    description: "Hexagonal serverless compute tile with inscribed geometric Greek Lambda (λ) emblem.",
    iconName: 'Zap',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle double hexagon rim (1-2)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Lambda Function" },
      { key: 'glyphScale', label: "Lambda Emblem Scale", type: 'number', min: 0.32, max: 0.62, step: 0.01, defaultValue: 0.46 },
      { key: 'doubleHex', label: "Double Hexagon Rim", type: 'number', min: 1, max: 2, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "Lambda Function", glyphScale: 0.46, doubleHex: 2 },
    jsSourceCode: `// Cloud: Serverless Function (Lambda λ) (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.glyphScale) || 0.46, 0.32, 0.62);
  const v2 = Math.round(helpers.clamp(Number(params.doubleHex) || 2, 1, 2));
  const t1 = (v1 - 0.32) / Math.max(0.001, 0.3);
  const t2 = (v2 - 1) / Math.max(1, 1);
  return [
    { id: 'glyphScale', label: \`Lambda: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'doubleHex', label: \`Double: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'glyphScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.32, 0.62, t);
    return { ...params, glyphScale: Number(val.toFixed(2)) };
  }
  if (id === 'doubleHex') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, doubleHex: Math.round(helpers.lerp(1, 2, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.doubleHex) || 2);
  const next = cur >= 2 ? 1 : cur + 1;
  return { ...params, doubleHex: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.glyphScale) || 0.46, 0.32, 0.62);
  const v2 = Math.round(helpers.clamp(Number(params.doubleHex) || 2, 1, 2));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const r = Math.min(width, height) * 0.46;
  const hex = [];
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 3;
    hex.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  paths.push({ nodes: helpers.polygonPath(hex), closed: true });
  if (v2 > 1) {
    const hex2 = hex.map(pt => ({ x: cx + (pt.x - cx) * 0.84, y: cy + (pt.y - cy) * 0.84 }));
    paths.push({ nodes: helpers.polygonPath(hex2), closed: true });
  }
  const gs = r * v1;
  paths.push({ nodes: helpers.polygonPath([{ x: cx - gs * 0.45, y: cy - gs * 0.85 }, { x: cx + gs * 0.55, y: cy + gs * 0.85 }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: cy - gs * 0.08 }, { x: cx - gs * 0.55, y: cy + gs * 0.85 }], false), closed: false });
  return paths;
}`,
  },

  // 215. Cloud: Kafka Partition Log Stream
  {
    id: 'flow-cloud-event-stream-kafka',
    name: "Cloud: Kafka Partition Log Stream",
    category: 'Flow & Diagrams',
    description: "Distributed commit log broker with parallel horizontal partitions and offset message cells.",
    iconName: 'FastForward',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle topic partitions (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Kafka Topic Log" },
      { key: 'cellWidth', label: "Offset Cell Width", type: 'number', min: 0.12, max: 0.24, step: 0.01, defaultValue: 0.16 },
      { key: 'partitions', label: "Topic Partitions", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Kafka Topic Log", cellWidth: 0.16, partitions: 3 },
    jsSourceCode: `// Cloud: Kafka Partition Log Stream (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.cellWidth) || 0.16, 0.12, 0.24);
  const v2 = Math.round(helpers.clamp(Number(params.partitions) || 3, 2, 4));
  const t1 = (v1 - 0.12) / Math.max(0.001, 0.12);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'cellWidth', label: \`Offset: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'partitions', label: \`Topic: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'cellWidth') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.12, 0.24, t);
    return { ...params, cellWidth: Number(val.toFixed(2)) };
  }
  if (id === 'partitions') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, partitions: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.partitions) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, partitions: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.cellWidth) || 0.16, 0.12, 0.24);
  const v2 = Math.round(helpers.clamp(Number(params.partitions) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const cw = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  const lh = (height - pad * 2) / v2;
  for (let p = 0; p < v2; p++) {
    const ly = pad + p * lh;
    paths.push({ nodes: helpers.rectPath(pad, ly, width - pad * 2, lh * 0.74, 2), closed: true });
    for (let c = 1; c < 5; c++) {
      const x = pad + c * cw;
      if (x < width - pad * 1.5) {
        paths.push({ nodes: helpers.polygonPath([{ x, y: ly }, { x, y: ly + lh * 0.74 }], false), closed: false });
      }
    }
  }
  return paths;
}`,
  },

  // 216. Cloud: Pub/Sub Topic Fan-Out
  {
    id: 'flow-cloud-pubsub-fanout',
    name: "Cloud: Pub/Sub Topic Fan-Out",
    category: 'Flow & Diagrams',
    description: "Publisher node pushing to central topic ring with asynchronous broadcast fan-out to subscribers.",
    iconName: 'Share2',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle subscriber queues (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Pub/Sub Fan-Out" },
      { key: 'hubX', label: "Topic Hub X Ratio", type: 'number', min: 0.34, max: 0.58, step: 0.01, defaultValue: 0.44 },
      { key: 'subs', label: "Subscriber Queues", type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Pub/Sub Fan-Out", hubX: 0.44, subs: 3 },
    jsSourceCode: `// Cloud: Pub/Sub Topic Fan-Out (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.hubX) || 0.44, 0.34, 0.58);
  const v2 = Math.round(helpers.clamp(Number(params.subs) || 3, 2, 5));
  const t1 = (v1 - 0.34) / Math.max(0.001, 0.23999999999999994);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'hubX', label: \`Topic: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'subs', label: \`Subscriber: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'hubX') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.34, 0.58, t);
    return { ...params, hubX: Number(val.toFixed(2)) };
  }
  if (id === 'subs') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, subs: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.subs) || 3);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, subs: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.hubX) || 0.44, 0.34, 0.58);
  const v2 = Math.round(helpers.clamp(Number(params.subs) || 3, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const hx = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, cy - 11, 22, 22, 3), closed: true });
  paths.push({ nodes: helpers.ellipsePath(hx, cy, 13, 13), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: pad + 22, y: cy }, { x: hx - 13, y: cy }], false), closed: false });
  for (let i = 0; i < v2; i++) {
    const sy = helpers.lerp(pad + 10, height - pad - 10, i / Math.max(1, v2 - 1));
    paths.push({ nodes: helpers.polygonPath([{ x: hx + 13, y: cy }, { x: width - pad - 22, y: sy }], false), closed: false });
    paths.push({ nodes: helpers.rectPath(width - pad - 22, sy - 7, 22, 14, 2), closed: true });
  }
  return paths;
}`,
  },

  // 217. Cloud: Resilience Circuit Breaker
  {
    id: 'flow-cloud-circuit-breaker',
    name: "Cloud: Resilience Circuit Breaker",
    category: 'Flow & Diagrams',
    description: "Fault-tolerance circuit breaker with left/right terminal posts and hinged trip lever switch.",
    iconName: 'Activity',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle trip arc ticks (1-3)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Circuit Breaker" },
      { key: 'openAngle', label: "Breaker Trip Lift", type: 'number', min: 0.08, max: 0.45, step: 0.01, defaultValue: 0.26 },
      { key: 'sparks', label: "Trip Arc Ticks", type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "Circuit Breaker", openAngle: 0.26, sparks: 2 },
    jsSourceCode: `// Cloud: Resilience Circuit Breaker (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.openAngle) || 0.26, 0.08, 0.45);
  const v2 = Math.round(helpers.clamp(Number(params.sparks) || 2, 1, 3));
  const t1 = (v1 - 0.08) / Math.max(0.001, 0.37);
  const t2 = (v2 - 1) / Math.max(1, 2);
  return [
    { id: 'openAngle', label: \`Breaker: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'sparks', label: \`Trip: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'openAngle') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.08, 0.45, t);
    return { ...params, openAngle: Number(val.toFixed(2)) };
  }
  if (id === 'sparks') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, sparks: Math.round(helpers.lerp(1, 3, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.sparks) || 2);
  const next = cur >= 3 ? 1 : cur + 1;
  return { ...params, sparks: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.openAngle) || 0.26, 0.08, 0.45);
  const v2 = Math.round(helpers.clamp(Number(params.sparks) || 2, 1, 3));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const lift = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  const lx = width * 0.25;
  const rx = width * 0.75;
  paths.push({ nodes: helpers.polygonPath([{ x: pad, y: cy }, { x: lx, y: cy }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: rx, y: cy }, { x: width - pad, y: cy }], false), closed: false });
  paths.push({ nodes: helpers.ellipsePath(lx, cy, 5, 5), closed: true });
  paths.push({ nodes: helpers.ellipsePath(rx, cy, 5, 5), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: lx, y: cy }, { x: rx - 4, y: cy - lift }], false), closed: false });
  for (let s = 0; s < v2; s++) {
    const sy = cy - lift * 0.3 - s * 5;
    paths.push({ nodes: helpers.polygonPath([{ x: rx - 2, y: sy }, { x: rx + 6, y: sy - 4 }], false), closed: false });
  }
  return paths;
}`,
  },

  // 218. Cloud: Token Bucket Rate Limiter
  {
    id: 'flow-cloud-rate-limiter-bucket',
    name: "Cloud: Token Bucket Rate Limiter",
    category: 'Flow & Diagrams',
    description: "Tapered token bucket funnel holding stacked request tokens with throttled bottom drip nozzle.",
    iconName: 'Filter',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle buffered tokens (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Rate Limiter" },
      { key: 'taper', label: "Bucket Bottom Taper", type: 'number', min: 0.4, max: 0.78, step: 0.01, defaultValue: 0.58 },
      { key: 'tokens', label: "Buffered Tokens", type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Rate Limiter", taper: 0.58, tokens: 4 },
    jsSourceCode: `// Cloud: Token Bucket Rate Limiter (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.taper) || 0.58, 0.4, 0.78);
  const v2 = Math.round(helpers.clamp(Number(params.tokens) || 4, 3, 6));
  const t1 = (v1 - 0.4) / Math.max(0.001, 0.38);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'taper', label: \`Bucket: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'tokens', label: \`Buffered: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'taper') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.4, 0.78, t);
    return { ...params, taper: Number(val.toFixed(2)) };
  }
  if (id === 'tokens') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, tokens: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.tokens) || 4);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, tokens: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.taper) || 0.58, 0.4, 0.78);
  const v2 = Math.round(helpers.clamp(Number(params.tokens) || 4, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const bw = width * v1 * 0.5;
  const tw = width * 0.38;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx - tw, y: pad }, { x: cx + tw, y: pad }, { x: cx + bw * 0.5, y: height * 0.76 }, { x: cx - bw * 0.5, y: height * 0.76 }]), closed: true });
  for (let i = 0; i < v2; i++) {
    const tx = cx - (v2 - 1) * 6 + i * 12;
    paths.push({ nodes: helpers.ellipsePath(tx, cy, 5, 5), closed: true });
  }
  paths.push({ nodes: helpers.ellipsePath(cx, height - pad * 0.9, 4, 4), closed: true });
  return paths;
}`,
  },

  // 219. Cloud: Dead-Letter Queue (DLQ)
  {
    id: 'flow-cloud-dead-letter-queue',
    name: "Cloud: Dead-Letter Queue (DLQ)",
    category: 'Flow & Diagrams',
    description: "Quarantined message queue tray with warning octagon and poison-message cross indicator.",
    iconName: 'AlertOctagon',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle quarantined slots (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Dead-Letter Queue" },
      { key: 'warnScale', label: "Warning Badge Size", type: 'number', min: 0.22, max: 0.42, step: 0.01, defaultValue: 0.3 },
      { key: 'slots', label: "Quarantined Slots", type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Dead-Letter Queue", warnScale: 0.3, slots: 4 },
    jsSourceCode: `// Cloud: Dead-Letter Queue (DLQ) (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.warnScale) || 0.3, 0.22, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.slots) || 4, 3, 6));
  const t1 = (v1 - 0.22) / Math.max(0.001, 0.19999999999999998);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'warnScale', label: \`Warning: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'slots', label: \`Quarantined: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'warnScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.22, 0.42, t);
    return { ...params, warnScale: Number(val.toFixed(2)) };
  }
  if (id === 'slots') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, slots: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.slots) || 4);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, slots: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.warnScale) || 0.3, 0.22, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.slots) || 4, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const wr = Math.min(width, height) * v1 * 0.5;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  const sw = (width * 0.55) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(pad + i * sw, height * 0.28, sw * 0.8, height * 0.44, 2), closed: true });
  }
  const wx = width * 0.78;
  paths.push({ nodes: helpers.ellipsePath(wx, cy, wr, wr), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: wx - wr * 0.45, y: cy - wr * 0.45 }, { x: wx + wr * 0.45, y: cy + wr * 0.45 }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: wx + wr * 0.45, y: cy - wr * 0.45 }, { x: wx - wr * 0.45, y: cy + wr * 0.45 }], false), closed: false });
  return paths;
}`,
  },

  // 220. Cloud: Time-Series DB (TSDB)
  {
    id: 'flow-cloud-time-series-tsdb',
    name: "Cloud: Time-Series DB (TSDB)",
    category: 'Flow & Diagrams',
    description: "Database cylinder overlaid with high-frequency multi-peak telemetry metric waveform.",
    iconName: 'LineChart',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle waveform peaks (3-7)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Time-Series DB" },
      { key: 'waveAmp', label: "Telemetry Peak Amp", type: 'number', min: 0.12, max: 0.32, step: 0.01, defaultValue: 0.22 },
      { key: 'peaks', label: "Waveform Peaks", type: 'number', min: 3, max: 7, step: 1, defaultValue: 5 },
    ],
    defaultParams: { label: "Time-Series DB", waveAmp: 0.22, peaks: 5 },
    jsSourceCode: `// Cloud: Time-Series DB (TSDB) (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.waveAmp) || 0.22, 0.12, 0.32);
  const v2 = Math.round(helpers.clamp(Number(params.peaks) || 5, 3, 7));
  const t1 = (v1 - 0.12) / Math.max(0.001, 0.2);
  const t2 = (v2 - 3) / Math.max(1, 4);
  return [
    { id: 'waveAmp', label: \`Telemetry: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'peaks', label: \`Waveform: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'waveAmp') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.12, 0.32, t);
    return { ...params, waveAmp: Number(val.toFixed(2)) };
  }
  if (id === 'peaks') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, peaks: Math.round(helpers.lerp(3, 7, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.peaks) || 5);
  const next = cur >= 7 ? 3 : cur + 1;
  return { ...params, peaks: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.waveAmp) || 0.22, 0.12, 0.32);
  const v2 = Math.round(helpers.clamp(Number(params.peaks) || 5, 3, 7));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const amp = height * v1;
  const ry = height * 0.16;
  const rx = width * 0.46;
  paths.push({ nodes: helpers.rectPath(cx - rx, ry, rx * 2, height - ry * 2, 2), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, ry, rx, ry), closed: true });
  const pts = [];
  for (let i = 0; i <= v2 * 2; i++) {
    const px = cx - rx * 0.82 + (i * rx * 1.64) / (v2 * 2);
    const py = cy + 6 + (i % 2 === 0 ? amp * 0.5 : -amp * 0.7);
    pts.push({ x: px, y: py });
  }
  paths.push({ nodes: helpers.polygonPath(pts, false), closed: false });
  return paths;
}`,
  },

  // 221. Cloud: Graph Database Property Net
  {
    id: 'flow-cloud-graph-database',
    name: "Cloud: Graph Database Property Net",
    category: 'Flow & Diagrams',
    description: "Property graph database node with ring-arranged vertices and interconnected relationship edges.",
    iconName: 'GitGraph',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle graph vertices (4-7)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Graph DB" },
      { key: 'orbitR', label: "Vertex Ring Radius", type: 'number', min: 0.26, max: 0.42, step: 0.01, defaultValue: 0.35 },
      { key: 'nodes', label: "Graph Vertices", type: 'number', min: 4, max: 7, step: 1, defaultValue: 5 },
    ],
    defaultParams: { label: "Graph DB", orbitR: 0.35, nodes: 5 },
    jsSourceCode: `// Cloud: Graph Database Property Net (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.orbitR) || 0.35, 0.26, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.nodes) || 5, 4, 7));
  const t1 = (v1 - 0.26) / Math.max(0.001, 0.15999999999999998);
  const t2 = (v2 - 4) / Math.max(1, 3);
  return [
    { id: 'orbitR', label: \`Vertex: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'nodes', label: \`Graph: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'orbitR') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.26, 0.42, t);
    return { ...params, orbitR: Number(val.toFixed(2)) };
  }
  if (id === 'nodes') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, nodes: Math.round(helpers.lerp(4, 7, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.nodes) || 5);
  const next = cur >= 7 ? 4 : cur + 1;
  return { ...params, nodes: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.orbitR) || 0.35, 0.26, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.nodes) || 5, 4, 7));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const r = Math.min(width, height) * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  const pts = [];
  for (let i = 0; i < v2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / v2;
    pts.push({ x: cx + Math.cos(a) * r * 1.2, y: cy + Math.sin(a) * r });
  }
  paths.push({ nodes: helpers.polygonPath(pts), closed: true });
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.polygonPath([{ x: cx, y: cy }, pts[i]], false), closed: false });
    paths.push({ nodes: helpers.ellipsePath(pts[i].x, pts[i].y, 6, 6), closed: true });
  }
  paths.push({ nodes: helpers.ellipsePath(cx, cy, 7, 7), closed: true });
  return paths;
}`,
  },

  // 222. Cloud: Inverted Search Index Shard
  {
    id: 'flow-cloud-search-elastic',
    name: "Cloud: Inverted Search Index Shard",
    category: 'Flow & Diagrams',
    description: "Left magnifying loupe scanning right-hand inverted index shard bars.",
    iconName: 'Search',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle index shard bars (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Search Index" },
      { key: 'loupeScale', label: "Loupe Radius Ratio", type: 'number', min: 0.18, max: 0.34, step: 0.01, defaultValue: 0.25 },
      { key: 'shards', label: "Index Shard Bars", type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Search Index", loupeScale: 0.25, shards: 4 },
    jsSourceCode: `// Cloud: Inverted Search Index Shard (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.loupeScale) || 0.25, 0.18, 0.34);
  const v2 = Math.round(helpers.clamp(Number(params.shards) || 4, 3, 6));
  const t1 = (v1 - 0.18) / Math.max(0.001, 0.16000000000000003);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'loupeScale', label: \`Loupe: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'shards', label: \`Index: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'loupeScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.18, 0.34, t);
    return { ...params, loupeScale: Number(val.toFixed(2)) };
  }
  if (id === 'shards') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, shards: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.shards) || 4);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, shards: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.loupeScale) || 0.25, 0.18, 0.34);
  const v2 = Math.round(helpers.clamp(Number(params.shards) || 4, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const lr = Math.min(width, height) * v1;
  const lx = pad + lr + 4;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  paths.push({ nodes: helpers.ellipsePath(lx, cy - 4, lr, lr), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: lx + lr * 0.7, y: cy - 4 + lr * 0.7 }, { x: lx + lr * 1.45, y: cy - 4 + lr * 1.45 }], false), closed: false });
  const sx = lx + lr * 1.6;
  const sh = (height - pad * 2) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(sx, pad + i * sh, width - sx - pad, sh * 0.7, 2), closed: true });
  }
  return paths;
}`,
  },

  // 223. Cloud: Data Lakehouse Stratified
  {
    id: 'flow-cloud-data-lakehouse',
    name: "Cloud: Data Lakehouse Stratified",
    category: 'Flow & Diagrams',
    description: "Upper structured warehouse columnar blocks resting above sinusoidal raw data-lake wave layers.",
    iconName: 'Waves',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle parquet columns (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Data Lakehouse" },
      { key: 'lakeRatio', label: "Raw Lake Wave Height", type: 'number', min: 0.28, max: 0.56, step: 0.01, defaultValue: 0.4 },
      { key: 'cols', label: "Parquet Columns", type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Data Lakehouse", lakeRatio: 0.4, cols: 4 },
    jsSourceCode: `// Cloud: Data Lakehouse Stratified (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.lakeRatio) || 0.4, 0.28, 0.56);
  const v2 = Math.round(helpers.clamp(Number(params.cols) || 4, 3, 6));
  const t1 = (v1 - 0.28) / Math.max(0.001, 0.28);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'lakeRatio', label: \`Raw: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'cols', label: \`Parquet: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'lakeRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.28, 0.56, t);
    return { ...params, lakeRatio: Number(val.toFixed(2)) };
  }
  if (id === 'cols') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, cols: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.cols) || 4);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, cols: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.lakeRatio) || 0.4, 0.28, 0.56);
  const v2 = Math.round(helpers.clamp(Number(params.cols) || 4, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const ly = height * (1 - v1);
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  const cw = (width - pad * 2 - (v2 - 1) * 6) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(pad + i * (cw + 6), pad, cw, ly - pad * 1.6, 2), closed: true });
  }
  for (let w = 0; w < 2; w++) {
    const wy = ly + w * 14 + 6;
    paths.push({ nodes: [
      helpers.cornerNode(pad, wy),
      helpers.smoothNode(cx, wy, width * 0.3, wy - 10, width * 0.7, wy + 10),
      helpers.cornerNode(width - pad, wy)
    ], closed: false });
  }
  return paths;
}`,
  },

  // 224. Cloud: ETL Extract-Transform-Load
  {
    id: 'flow-cloud-etl-pipeline',
    name: "Cloud: ETL Extract-Transform-Load",
    category: 'Flow & Diagrams',
    description: "3-stage data pipeline: Left Extract funnel -> Center Transform gear -> Right Load cylinder.",
    iconName: 'Workflow',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle gear spokes (4-8)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "ETL Pipeline" },
      { key: 'gearScale', label: "Transform Gear Size", type: 'number', min: 0.16, max: 0.3, step: 0.01, defaultValue: 0.22 },
      { key: 'teeth', label: "Gear Spokes", type: 'number', min: 4, max: 8, step: 1, defaultValue: 6 },
    ],
    defaultParams: { label: "ETL Pipeline", gearScale: 0.22, teeth: 6 },
    jsSourceCode: `// Cloud: ETL Extract-Transform-Load (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.gearScale) || 0.22, 0.16, 0.3);
  const v2 = Math.round(helpers.clamp(Number(params.teeth) || 6, 4, 8));
  const t1 = (v1 - 0.16) / Math.max(0.001, 0.13999999999999999);
  const t2 = (v2 - 4) / Math.max(1, 4);
  return [
    { id: 'gearScale', label: \`Transform: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'teeth', label: \`Gear: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'gearScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.16, 0.3, t);
    return { ...params, gearScale: Number(val.toFixed(2)) };
  }
  if (id === 'teeth') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, teeth: Math.round(helpers.lerp(4, 8, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.teeth) || 6);
  const next = cur >= 8 ? 4 : cur + 1;
  return { ...params, teeth: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.gearScale) || 0.22, 0.16, 0.3);
  const v2 = Math.round(helpers.clamp(Number(params.teeth) || 6, 4, 8));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const gr = Math.min(width, height) * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: pad, y: height * 0.24 }, { x: width * 0.26, y: height * 0.36 }, { x: width * 0.26, y: height * 0.64 }, { x: pad, y: height * 0.76 }]), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, cy, gr, gr), closed: true });
  for (let i = 0; i < v2; i++) {
    const a = (i * Math.PI * 2) / v2;
    paths.push({ nodes: helpers.polygonPath([{ x: cx + Math.cos(a) * gr * 0.6, y: cy + Math.sin(a) * gr * 0.6 }, { x: cx + Math.cos(a) * (gr + 4), y: cy + Math.sin(a) * (gr + 4) }], false), closed: false });
  }
  paths.push({ nodes: helpers.rectPath(width * 0.74, height * 0.24, width * 0.2, height * 0.52, 4), closed: true });
  return paths;
}`,
  },

  // 225. DevOps: CI/CD Infinity Loop
  {
    id: 'flow-cloud-cicd-infinity',
    name: "DevOps: CI/CD Infinity Loop",
    category: 'Flow & Diagrams',
    description: "Continuous Integration / Continuous Delivery figure-8 infinity loop with directional stage ticks.",
    iconName: 'Infinity',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle pipeline stage ticks (4-8)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "CI/CD Pipeline" },
      { key: 'loopR', label: "Infinity Lobe Radius", type: 'number', min: 0.2, max: 0.36, step: 0.01, defaultValue: 0.28 },
      { key: 'ticks', label: "Pipeline Stage Ticks", type: 'number', min: 4, max: 8, step: 1, defaultValue: 6 },
    ],
    defaultParams: { label: "CI/CD Pipeline", loopR: 0.28, ticks: 6 },
    jsSourceCode: `// DevOps: CI/CD Infinity Loop (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.loopR) || 0.28, 0.2, 0.36);
  const v2 = Math.round(helpers.clamp(Number(params.ticks) || 6, 4, 8));
  const t1 = (v1 - 0.2) / Math.max(0.001, 0.15999999999999998);
  const t2 = (v2 - 4) / Math.max(1, 4);
  return [
    { id: 'loopR', label: \`Infinity: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'ticks', label: \`Pipeline: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'loopR') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.2, 0.36, t);
    return { ...params, loopR: Number(val.toFixed(2)) };
  }
  if (id === 'ticks') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, ticks: Math.round(helpers.lerp(4, 8, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.ticks) || 6);
  const next = cur >= 8 ? 4 : cur + 1;
  return { ...params, ticks: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.loopR) || 0.28, 0.2, 0.36);
  const v2 = Math.round(helpers.clamp(Number(params.ticks) || 6, 4, 8));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const lr = Math.min(width, height) * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx - lr * 0.85, cy, lr, lr * 0.78), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx + lr * 0.85, cy, lr, lr * 0.78), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx - lr * 0.85, cy, lr * 0.48, lr * 0.38), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx + lr * 0.85, cy, lr * 0.48, lr * 0.38), closed: true });
  for (let t = 0; t < v2; t++) {
    const a = (t * Math.PI * 2) / v2;
    const ox = t % 2 === 0 ? cx - lr * 0.85 : cx + lr * 0.85;
    paths.push({ nodes: helpers.polygonPath([{ x: ox + Math.cos(a) * lr * 0.55, y: cy + Math.sin(a) * lr * 0.45 }, { x: ox + Math.cos(a) * lr * 0.95, y: cy + Math.sin(a) * lr * 0.75 }], false), closed: false });
  }
  return paths;
}`,
  },

  // 226. DevOps: Git Branch & Pull Request
  {
    id: 'flow-cloud-git-branch-merge',
    name: "DevOps: Git Branch & Pull Request",
    category: 'Flow & Diagrams',
    description: "Main trunk commit timeline with diverging feature branch curve and pull-request merge node.",
    iconName: 'GitPullRequest',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle commit nodes (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Git Branch / PR" },
      { key: 'branchDrop', label: "Feature Branch Offset", type: 'number', min: 0.22, max: 0.5, step: 0.01, defaultValue: 0.36 },
      { key: 'commits', label: "Commit Nodes", type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Git Branch / PR", branchDrop: 0.36, commits: 4 },
    jsSourceCode: `// DevOps: Git Branch & Pull Request (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.branchDrop) || 0.36, 0.22, 0.5);
  const v2 = Math.round(helpers.clamp(Number(params.commits) || 4, 3, 6));
  const t1 = (v1 - 0.22) / Math.max(0.001, 0.28);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'branchDrop', label: \`Feature: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'commits', label: \`Commit: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'branchDrop') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.22, 0.5, t);
    return { ...params, branchDrop: Number(val.toFixed(2)) };
  }
  if (id === 'commits') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, commits: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.commits) || 4);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, commits: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.branchDrop) || 0.36, 0.22, 0.5);
  const v2 = Math.round(helpers.clamp(Number(params.commits) || 4, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const drop = height * v1;
  const ty = height * 0.3;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: pad, y: ty }, { x: width - pad, y: ty }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: width * 0.24, y: ty }, { x: width * 0.36, y: ty + drop }, { x: width * 0.68, y: ty + drop }, { x: width * 0.8, y: ty }], false), closed: false });
  for (let i = 0; i < v2; i++) {
    const kx = helpers.lerp(width * 0.18, width * 0.84, i / Math.max(1, v2 - 1));
    paths.push({ nodes: helpers.ellipsePath(kx, ty, 5, 5), closed: true });
  }
  paths.push({ nodes: helpers.ellipsePath(cx, ty + drop, 5, 5), closed: true });
  return paths;
}`,
  },

  // 227. DevOps: Canary Traffic Split (90/10)
  {
    id: 'flow-cloud-canary-rollout',
    name: "DevOps: Canary Traffic Split (90/10)",
    category: 'Flow & Diagrams',
    description: "Traffic splitter routing primary production volume to v1 Stable and canary slice to v2 Canary.",
    iconName: 'Split',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle health check gates (1-3)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Canary 90/10 Split" },
      { key: 'splitRatio', label: "Stable Traffic Share", type: 'number', min: 0.55, max: 0.88, step: 0.01, defaultValue: 0.76 },
      { key: 'stages', label: "Health Check Gates", type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "Canary 90/10 Split", splitRatio: 0.76, stages: 2 },
    jsSourceCode: `// DevOps: Canary Traffic Split (90/10) (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.splitRatio) || 0.76, 0.55, 0.88);
  const v2 = Math.round(helpers.clamp(Number(params.stages) || 2, 1, 3));
  const t1 = (v1 - 0.55) / Math.max(0.001, 0.32999999999999996);
  const t2 = (v2 - 1) / Math.max(1, 2);
  return [
    { id: 'splitRatio', label: \`Stable: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'stages', label: \`Health: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'splitRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.55, 0.88, t);
    return { ...params, splitRatio: Number(val.toFixed(2)) };
  }
  if (id === 'stages') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, stages: Math.round(helpers.lerp(1, 3, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.stages) || 2);
  const next = cur >= 3 ? 1 : cur + 1;
  return { ...params, stages: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.splitRatio) || 0.76, 0.55, 0.88);
  const v2 = Math.round(helpers.clamp(Number(params.stages) || 2, 1, 3));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const topH = (height - pad * 3) * v1 * 0.55;
  const botH = Math.max(8, (height - pad * 3) * (1 - v1) * 0.55);
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: width * 0.25, y: cy - 12 }, { x: width * 0.35, y: cy }, { x: width * 0.25, y: cy + 12 }, { x: width * 0.15, y: cy }]), closed: true });
  paths.push({ nodes: helpers.rectPath(width * 0.44, pad * 1.2, width * 0.48, topH, 3), closed: true });
  paths.push({ nodes: helpers.rectPath(width * 0.44, height - pad * 1.2 - botH, width * 0.48, botH, 2), closed: true });
  for (let s = 1; s <= v2; s++) {
    const sx = width * 0.44 + (s * width * 0.48) / (v2 + 1);
    paths.push({ nodes: helpers.polygonPath([{ x: sx, y: height - pad * 1.2 - botH }, { x: sx, y: height - pad * 1.2 }], false), closed: false });
  }
  return paths;
}`,
  },

  // 228. DevOps: Blue/Green Deployment Router
  {
    id: 'flow-cloud-blue-green-switch',
    name: "DevOps: Blue/Green Deployment Router",
    category: 'Flow & Diagrams',
    description: "Zero-downtime deployment router toggling live ingress between Blue and Green environments.",
    iconName: 'ArrowLeftRight',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle active env (1=blue,2=grn) (1-2)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Blue / Green Switch" },
      { key: 'routerX', label: "Router Switch X", type: 'number', min: 0.22, max: 0.44, step: 0.01, defaultValue: 0.32 },
      { key: 'activeEnv', label: "Active Env (1=Blue,2=Grn)", type: 'number', min: 1, max: 2, step: 1, defaultValue: 1 },
    ],
    defaultParams: { label: "Blue / Green Switch", routerX: 0.32, activeEnv: 1 },
    jsSourceCode: `// DevOps: Blue/Green Deployment Router (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.routerX) || 0.32, 0.22, 0.44);
  const v2 = Math.round(helpers.clamp(Number(params.activeEnv) || 1, 1, 2));
  const t1 = (v1 - 0.22) / Math.max(0.001, 0.22);
  const t2 = (v2 - 1) / Math.max(1, 1);
  return [
    { id: 'routerX', label: \`Router: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'activeEnv', label: \`Active: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'routerX') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.22, 0.44, t);
    return { ...params, routerX: Number(val.toFixed(2)) };
  }
  if (id === 'activeEnv') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, activeEnv: Math.round(helpers.lerp(1, 2, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.activeEnv) || 1);
  const next = cur >= 2 ? 1 : cur + 1;
  return { ...params, activeEnv: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.routerX) || 0.32, 0.22, 0.44);
  const v2 = Math.round(helpers.clamp(Number(params.activeEnv) || 1, 1, 2));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const rx = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: rx, y: cy - 14 }, { x: rx + 14, y: cy }, { x: rx, y: cy + 14 }, { x: rx - 14, y: cy }]), closed: true });
  const targetY = v2 === 1 ? height * 0.28 : height * 0.72;
  paths.push({ nodes: helpers.polygonPath([{ x: rx + 14, y: cy }, { x: width * 0.54, y: targetY }], false), closed: false });
  paths.push({ nodes: helpers.rectPath(width * 0.54, pad, width * 0.38, height * 0.36, 4), closed: true });
  paths.push({ nodes: helpers.rectPath(width * 0.54, height * 0.54, width * 0.38, height * 0.36, 4), closed: true });
  return paths;
}`,
  },

  // 229. Security: KMS Secret Vault Safe
  {
    id: 'flow-cloud-secret-vault',
    name: "Security: KMS Secret Vault Safe",
    category: 'Flow & Diagrams',
    description: "Armored cryptographic key vault safe with heavy door hinges and multi-spoke combination dial.",
    iconName: 'Lock',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle dial handle spokes (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "KMS Secret Vault" },
      { key: 'dialR', label: "Combination Dial Size", type: 'number', min: 0.16, max: 0.34, step: 0.01, defaultValue: 0.24 },
      { key: 'spokes', label: "Dial Handle Spokes", type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "KMS Secret Vault", dialR: 0.24, spokes: 4 },
    jsSourceCode: `// Security: KMS Secret Vault Safe (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.dialR) || 0.24, 0.16, 0.34);
  const v2 = Math.round(helpers.clamp(Number(params.spokes) || 4, 3, 6));
  const t1 = (v1 - 0.16) / Math.max(0.001, 0.18000000000000002);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'dialR', label: \`Combination: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'spokes', label: \`Dial: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'dialR') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.16, 0.34, t);
    return { ...params, dialR: Number(val.toFixed(2)) };
  }
  if (id === 'spokes') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, spokes: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.spokes) || 4);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, spokes: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.dialR) || 0.24, 0.16, 0.34);
  const v2 = Math.round(helpers.clamp(Number(params.spokes) || 4, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const dr = Math.min(width, height) * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, pad, width - pad * 2, height - pad * 2, 4), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, cy, dr, dr), closed: true });
  for (let i = 0; i < v2; i++) {
    const a = (i * Math.PI * 2) / v2;
    paths.push({ nodes: helpers.polygonPath([{ x: cx, y: cy }, { x: cx + Math.cos(a) * (dr + 5), y: cy + Math.sin(a) * (dr + 5) }], false), closed: false });
  }
  return paths;
}`,
  },

  // 230. Security: mTLS Zero-Trust Tunnel
  {
    id: 'flow-cloud-zero-trust-mtls',
    name: "Security: mTLS Zero-Trust Tunnel",
    category: 'Flow & Diagrams',
    description: "Encrypted cylindrical zero-trust pipe flanked by mutual endpoint padlocks and X.509 certificate.",
    iconName: 'ShieldCheck',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle encryption cipher rings (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "mTLS Tunnel" },
      { key: 'pipeHeight', label: "Tunnel Pipe Thickness", type: 'number', min: 0.28, max: 0.56, step: 0.01, defaultValue: 0.4 },
      { key: 'rings', label: "Encryption Cipher Rings", type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "mTLS Tunnel", pipeHeight: 0.4, rings: 3 },
    jsSourceCode: `// Security: mTLS Zero-Trust Tunnel (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.pipeHeight) || 0.4, 0.28, 0.56);
  const v2 = Math.round(helpers.clamp(Number(params.rings) || 3, 2, 5));
  const t1 = (v1 - 0.28) / Math.max(0.001, 0.28);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'pipeHeight', label: \`Tunnel: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'rings', label: \`Encryption: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'pipeHeight') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.28, 0.56, t);
    return { ...params, pipeHeight: Number(val.toFixed(2)) };
  }
  if (id === 'rings') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, rings: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.rings) || 3);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, rings: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.pipeHeight) || 0.4, 0.28, 0.56);
  const v2 = Math.round(helpers.clamp(Number(params.rings) || 3, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const ph = height * v1;
  const py = (height - ph) / 2;
  paths.push({ nodes: helpers.rectPath(pad * 2, py, width - pad * 4, ph, ph / 2), closed: true });
  paths.push({ nodes: helpers.rectPath(4, cy - 10, 14, 20, 2), closed: true });
  paths.push({ nodes: helpers.rectPath(width - 18, cy - 10, 14, 20, 2), closed: true });
  for (let i = 1; i <= v2; i++) {
    const rx = helpers.lerp(width * 0.28, width * 0.72, i / (v2 + 1));
    paths.push({ nodes: helpers.ellipsePath(rx, cy, 6, ph * 0.45), closed: true });
  }
  return paths;
}`,
  },

  // 231. Network: DNS Hierarchy Resolver
  {
    id: 'flow-cloud-dns-route-tree',
    name: "Network: DNS Hierarchy Resolver",
    category: 'Flow & Diagrams',
    description: "Root dot (.) -> TLD (.com) -> Authoritative Domain -> A/AAAA/CNAME leaf record tree.",
    iconName: 'Network',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle leaf dns records (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "DNS Resolver Tree" },
      { key: 'midY', label: "TLD Tier Y Ratio", type: 'number', min: 0.35, max: 0.58, step: 0.01, defaultValue: 0.45 },
      { key: 'records', label: "Leaf DNS Records", type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "DNS Resolver Tree", midY: 0.45, records: 3 },
    jsSourceCode: `// Network: DNS Hierarchy Resolver (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.midY) || 0.45, 0.35, 0.58);
  const v2 = Math.round(helpers.clamp(Number(params.records) || 3, 2, 5));
  const t1 = (v1 - 0.35) / Math.max(0.001, 0.22999999999999998);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'midY', label: \`TLD: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'records', label: \`Leaf: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'midY') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.35, 0.58, t);
    return { ...params, midY: Number(val.toFixed(2)) };
  }
  if (id === 'records') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, records: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.records) || 3);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, records: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.midY) || 0.45, 0.35, 0.58);
  const v2 = Math.round(helpers.clamp(Number(params.records) || 3, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const my = height * v1;
  paths.push({ nodes: helpers.ellipsePath(cx, 12, 8, 8), closed: true });
  paths.push({ nodes: helpers.rectPath(cx - 28, my - 9, 56, 18, 3), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: 20 }, { x: cx, y: my - 9 }], false), closed: false });
  const lw = (width - (v2 - 1) * 8) / v2;
  for (let i = 0; i < v2; i++) {
    const lx = i * (lw + 8);
    paths.push({ nodes: helpers.polygonPath([{ x: cx, y: my + 9 }, { x: lx + lw / 2, y: height - 22 }], false), closed: false });
    paths.push({ nodes: helpers.rectPath(lx, height - 22, lw, 20, 3), closed: true });
  }
  return paths;
}`,
  },

  // 232. Network: Site-to-Site IPSec VPN Tunnel
  {
    id: 'flow-cloud-vpn-ipsec-bridge',
    name: "Network: Site-to-Site IPSec VPN Tunnel",
    category: 'Flow & Diagrams',
    description: "Left and right site gateway pillars linked by arched concentric encrypted tunnel ribs.",
    iconName: 'Waypoints',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle encrypted tunnel ribs (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "IPSec VPN Bridge" },
      { key: 'archHeight', label: "Tunnel Arch Height", type: 'number', min: 0.24, max: 0.55, step: 0.01, defaultValue: 0.38 },
      { key: 'ribs', label: "Encrypted Tunnel Ribs", type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "IPSec VPN Bridge", archHeight: 0.38, ribs: 4 },
    jsSourceCode: `// Network: Site-to-Site IPSec VPN Tunnel (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.archHeight) || 0.38, 0.24, 0.55);
  const v2 = Math.round(helpers.clamp(Number(params.ribs) || 4, 3, 6));
  const t1 = (v1 - 0.24) / Math.max(0.001, 0.31000000000000005);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'archHeight', label: \`Tunnel: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'ribs', label: \`Encrypted: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'archHeight') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.24, 0.55, t);
    return { ...params, archHeight: Number(val.toFixed(2)) };
  }
  if (id === 'ribs') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, ribs: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.ribs) || 4);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, ribs: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.archHeight) || 0.38, 0.24, 0.55);
  const v2 = Math.round(helpers.clamp(Number(params.ribs) || 4, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const ah = height * v1;
  paths.push({ nodes: helpers.rectPath(0, height * 0.25, width * 0.18, height * 0.75, 3), closed: true });
  paths.push({ nodes: helpers.rectPath(width * 0.82, height * 0.25, width * 0.18, height * 0.75, 3), closed: true });
  for (let i = 0; i < v2; i++) {
    const r = ah * (0.65 + (i * 0.35) / Math.max(1, v2 - 1));
    paths.push({ nodes: helpers.arcNodes(cx, height * 0.65, width * 0.32, r, -180, 180), closed: false });
  }
  return paths;
}`,
  },

  // 233. AI Flow: System Prompt & Few-Shot
  {
    id: 'flow-ai-system-prompt-template',
    name: "AI Flow: System Prompt & Few-Shot",
    category: 'Flow & Diagrams',
    description: "System instruction header, bracketed {variable} injection slots, and few-shot user/assistant pairs.",
    iconName: 'Terminal',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle variable {slots} (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "System Prompt" },
      { key: 'sysRatio', label: "System Block Height", type: 'number', min: 0.2, max: 0.42, step: 0.01, defaultValue: 0.28 },
      { key: 'vars', label: "Variable {Slots}", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "System Prompt", sysRatio: 0.28, vars: 3 },
    jsSourceCode: `// AI Flow: System Prompt & Few-Shot (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.sysRatio) || 0.28, 0.2, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.vars) || 3, 2, 4));
  const t1 = (v1 - 0.2) / Math.max(0.001, 0.21999999999999997);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'sysRatio', label: \`System: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'vars', label: \`Variable: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'sysRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.2, 0.42, t);
    return { ...params, sysRatio: Number(val.toFixed(2)) };
  }
  if (id === 'vars') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, vars: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.vars) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, vars: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.sysRatio) || 0.28, 0.2, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.vars) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const sh = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, pad, width - pad * 2, sh, 3), closed: true });
  const vw = (width - pad * 2 - (v2 - 1) * 5) / v2;
  const vy = pad * 1.6 + sh;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(pad + i * (vw + 5), vy, vw, 14, 7), closed: true });
  }
  paths.push({ nodes: helpers.rectPath(pad, vy + 20, width - pad * 2, height - vy - 20 - pad, 3), closed: true });
  return paths;
}`,
  },

  // 234. AI Flow: Document Semantic Chunker
  {
    id: 'flow-ai-chunker-splitter',
    name: "AI Flow: Document Semantic Chunker",
    category: 'Flow & Diagrams',
    description: "Source document on left sliced across vertical boundary into N overlapping semantic text chunks.",
    iconName: 'Scissors',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle output chunk cards (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Semantic Chunker" },
      { key: 'splitX', label: "Splitter Line X", type: 'number', min: 0.32, max: 0.55, step: 0.01, defaultValue: 0.42 },
      { key: 'chunks', label: "Output Chunk Cards", type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Semantic Chunker", splitX: 0.42, chunks: 3 },
    jsSourceCode: `// AI Flow: Document Semantic Chunker (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.splitX) || 0.42, 0.32, 0.55);
  const v2 = Math.round(helpers.clamp(Number(params.chunks) || 3, 2, 5));
  const t1 = (v1 - 0.32) / Math.max(0.001, 0.23000000000000004);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'splitX', label: \`Splitter: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'chunks', label: \`Output: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'splitX') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.32, 0.55, t);
    return { ...params, splitX: Number(val.toFixed(2)) };
  }
  if (id === 'chunks') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, chunks: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.chunks) || 3);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, chunks: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.splitX) || 0.42, 0.32, 0.55);
  const v2 = Math.round(helpers.clamp(Number(params.chunks) || 3, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const sx = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, pad * 1.2, sx - pad * 1.8, height - pad * 2.4, 2), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: sx, y: pad * 0.6 }, { x: sx, y: height - pad * 0.6 }], false), closed: false });
  const ch = (height - pad * 2) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(sx + pad * 0.8 + (i % 2) * 5, pad + i * ch, width - sx - pad * 1.8 - 5, ch * 0.78, 3), closed: true });
  }
  return paths;
}`,
  },

  // 235. AI Flow: Dense Embedding Vector [float]
  {
    id: 'flow-ai-embedding-matrix',
    name: "AI Flow: Dense Embedding Vector [float]",
    category: 'Flow & Diagrams',
    description: "Tall square tensor brackets enclosing a multi-dimensional floating-point vector cell matrix.",
    iconName: 'Grid',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle vector columns (3-7)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Embedding [1536d]" },
      { key: 'bracketW', label: "Tensor Bracket Lip", type: 'number', min: 0.06, max: 0.16, step: 0.01, defaultValue: 0.1 },
      { key: 'dims', label: "Vector Columns", type: 'number', min: 3, max: 7, step: 1, defaultValue: 5 },
    ],
    defaultParams: { label: "Embedding [1536d]", bracketW: 0.1, dims: 5 },
    jsSourceCode: `// AI Flow: Dense Embedding Vector [float] (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.bracketW) || 0.1, 0.06, 0.16);
  const v2 = Math.round(helpers.clamp(Number(params.dims) || 5, 3, 7));
  const t1 = (v1 - 0.06) / Math.max(0.001, 0.1);
  const t2 = (v2 - 3) / Math.max(1, 4);
  return [
    { id: 'bracketW', label: \`Tensor: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'dims', label: \`Vector: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'bracketW') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.06, 0.16, t);
    return { ...params, bracketW: Number(val.toFixed(2)) };
  }
  if (id === 'dims') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, dims: Math.round(helpers.lerp(3, 7, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.dims) || 5);
  const next = cur >= 7 ? 3 : cur + 1;
  return { ...params, dims: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.bracketW) || 0.1, 0.06, 0.16);
  const v2 = Math.round(helpers.clamp(Number(params.dims) || 5, 3, 7));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const bw = width * v1;
  paths.push({ nodes: helpers.polygonPath([{ x: pad + bw, y: pad }, { x: pad, y: pad }, { x: pad, y: height - pad }, { x: pad + bw, y: height - pad }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: width - pad - bw, y: pad }, { x: width - pad, y: pad }, { x: width - pad, y: height - pad }, { x: width - pad - bw, y: height - pad }], false), closed: false });
  const cw = (width - pad * 4 - (v2 - 1) * 4) / v2;
  const ch = (height - pad * 3 - 8) / 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < v2; c++) {
      paths.push({ nodes: helpers.rectPath(pad * 2 + c * (cw + 4), pad * 1.5 + r * (ch + 4), cw, ch, 2), closed: true });
    }
  }
  return paths;
}`,
  },

  // 236. AI Flow: Hybrid BM25 + Dense Retriever
  {
    id: 'flow-ai-hybrid-retriever',
    name: "AI Flow: Hybrid BM25 + Dense Retriever",
    category: 'Flow & Diagrams',
    description: "Dual parallel retrieval lanes (Lexical BM25 + Dense Cosine) merging into Reciprocal Rank Fusion.",
    iconName: 'GitMerge',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle retrieved candidates (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Hybrid Retriever" },
      { key: 'mergeX', label: "RRF Fusion Node X", type: 'number', min: 0.58, max: 0.82, step: 0.01, defaultValue: 0.7 },
      { key: 'topK', label: "Retrieved Candidates", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Hybrid Retriever", mergeX: 0.7, topK: 3 },
    jsSourceCode: `// AI Flow: Hybrid BM25 + Dense Retriever (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.mergeX) || 0.7, 0.58, 0.82);
  const v2 = Math.round(helpers.clamp(Number(params.topK) || 3, 2, 4));
  const t1 = (v1 - 0.58) / Math.max(0.001, 0.24);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'mergeX', label: \`RRF: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'topK', label: \`Retrieved: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'mergeX') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.58, 0.82, t);
    return { ...params, mergeX: Number(val.toFixed(2)) };
  }
  if (id === 'topK') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, topK: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.topK) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, topK: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.mergeX) || 0.7, 0.58, 0.82);
  const v2 = Math.round(helpers.clamp(Number(params.topK) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const mx = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, pad * 1.2, mx * 0.65, height * 0.3, 3), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, height * 0.58, mx * 0.65, height * 0.3, 3), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: mx, y: cy - 15 }, { x: mx + 15, y: cy }, { x: mx, y: cy + 15 }, { x: mx - 15, y: cy }]), closed: true });
  for (let i = 0; i < v2; i++) {
    const ry = helpers.lerp(height * 0.24, height * 0.76, i / Math.max(1, v2 - 1));
    paths.push({ nodes: helpers.polygonPath([{ x: mx + 15, y: cy }, { x: width - pad, y: ry }], false), closed: false });
  }
  return paths;
}`,
  },

  // 237. AI Flow: Cross-Encoder Reranker
  {
    id: 'flow-ai-cross-encoder-rerank',
    name: "AI Flow: Cross-Encoder Reranker",
    category: 'Flow & Diagrams',
    description: "Scored candidate bars sorted by cross-encoder relevance with adjustable Top-K cutoff threshold.",
    iconName: 'ListOrdered',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle candidate bars (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Cross-Encoder Rerank" },
      { key: 'cutoffX', label: "Relevance Cutoff X", type: 'number', min: 0.4, max: 0.82, step: 0.01, defaultValue: 0.62 },
      { key: 'candidates', label: "Candidate Bars", type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Cross-Encoder Rerank", cutoffX: 0.62, candidates: 4 },
    jsSourceCode: `// AI Flow: Cross-Encoder Reranker (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.cutoffX) || 0.62, 0.4, 0.82);
  const v2 = Math.round(helpers.clamp(Number(params.candidates) || 4, 3, 6));
  const t1 = (v1 - 0.4) / Math.max(0.001, 0.41999999999999993);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'cutoffX', label: \`Relevance: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'candidates', label: \`Candidate: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'cutoffX') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.4, 0.82, t);
    return { ...params, cutoffX: Number(val.toFixed(2)) };
  }
  if (id === 'candidates') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, candidates: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.candidates) || 4);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, candidates: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.cutoffX) || 0.62, 0.4, 0.82);
  const v2 = Math.round(helpers.clamp(Number(params.candidates) || 4, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const kx = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  const bh = (height - pad * 2) / v2;
  for (let i = 0; i < v2; i++) {
    const bw = (width - pad * 2) * (0.92 - i * 0.14);
    paths.push({ nodes: helpers.rectPath(pad, pad + i * bh, bw, bh * 0.72, 2), closed: true });
  }
  paths.push({ nodes: helpers.polygonPath([{ x: kx, y: 4 }, { x: kx, y: height - 4 }], false), closed: false });
  return paths;
}`,
  },

  // 238. AI Flow: Context Window Token Budget
  {
    id: 'flow-ai-context-window-meter',
    name: "AI Flow: Context Window Token Budget",
    category: 'Flow & Diagrams',
    description: "Segmented token window bar showing System Prompt, RAG Context, Chat History, and Output Headroom.",
    iconName: 'Gauge',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle token scale ticks (4-8)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Context Budget" },
      { key: 'sysShare', label: "System + RAG Share", type: 'number', min: 0.3, max: 0.72, step: 0.01, defaultValue: 0.52 },
      { key: 'ticks', label: "Token Scale Ticks", type: 'number', min: 4, max: 8, step: 1, defaultValue: 6 },
    ],
    defaultParams: { label: "Context Budget", sysShare: 0.52, ticks: 6 },
    jsSourceCode: `// AI Flow: Context Window Token Budget (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.sysShare) || 0.52, 0.3, 0.72);
  const v2 = Math.round(helpers.clamp(Number(params.ticks) || 6, 4, 8));
  const t1 = (v1 - 0.3) / Math.max(0.001, 0.42);
  const t2 = (v2 - 4) / Math.max(1, 4);
  return [
    { id: 'sysShare', label: \`System: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'ticks', label: \`Token: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'sysShare') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.3, 0.72, t);
    return { ...params, sysShare: Number(val.toFixed(2)) };
  }
  if (id === 'ticks') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, ticks: Math.round(helpers.lerp(4, 8, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.ticks) || 6);
  const next = cur >= 8 ? 4 : cur + 1;
  return { ...params, ticks: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.sysShare) || 0.52, 0.3, 0.72);
  const v2 = Math.round(helpers.clamp(Number(params.ticks) || 6, 4, 8));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const sx = width * v1;
  const bh = height * 0.38;
  const by = (height - bh) / 2;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, by, width - pad * 2, bh, 4), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: sx * 0.5, y: by }, { x: sx * 0.5, y: by + bh }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: sx, y: by }, { x: sx, y: by + bh }], false), closed: false });
  for (let i = 0; i < v2; i++) {
    const tx = helpers.lerp(pad + 6, width - pad - 6, i / Math.max(1, v2 - 1));
    paths.push({ nodes: helpers.polygonPath([{ x: tx, y: by + bh + 4 }, { x: tx, y: by + bh + 10 }], false), closed: false });
  }
  return paths;
}`,
  },

  // 239. AI Flow: Semantic Intent Router
  {
    id: 'flow-ai-router-classifier',
    name: "AI Flow: Semantic Intent Router",
    category: 'Flow & Diagrams',
    description: "Incoming query classified by central intent diamond and routed to Tier-1, Tier-2, or Tier-3 LLM.",
    iconName: 'Split',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle target model tiers (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Semantic Router" },
      { key: 'routerX', label: "Classifier Diamond X", type: 'number', min: 0.36, max: 0.58, step: 0.01, defaultValue: 0.46 },
      { key: 'tiers', label: "Target Model Tiers", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Semantic Router", routerX: 0.46, tiers: 3 },
    jsSourceCode: `// AI Flow: Semantic Intent Router (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.routerX) || 0.46, 0.36, 0.58);
  const v2 = Math.round(helpers.clamp(Number(params.tiers) || 3, 2, 4));
  const t1 = (v1 - 0.36) / Math.max(0.001, 0.21999999999999997);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'routerX', label: \`Classifier: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'tiers', label: \`Target: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'routerX') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.36, 0.58, t);
    return { ...params, routerX: Number(val.toFixed(2)) };
  }
  if (id === 'tiers') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, tiers: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.tiers) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, tiers: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.routerX) || 0.46, 0.36, 0.58);
  const v2 = Math.round(helpers.clamp(Number(params.tiers) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const rx = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, cy - 11, width * 0.18, 22, 3), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: rx, y: cy - 16 }, { x: rx + 16, y: cy }, { x: rx, y: cy + 16 }, { x: rx - 16, y: cy }]), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: pad + width * 0.18, y: cy }, { x: rx - 16, y: cy }], false), closed: false });
  for (let i = 0; i < v2; i++) {
    const ty = helpers.lerp(pad + 10, height - pad - 10, i / Math.max(1, v2 - 1));
    paths.push({ nodes: helpers.polygonPath([{ x: rx + 16, y: cy }, { x: width - pad - 28, y: ty }], false), closed: false });
    paths.push({ nodes: helpers.rectPath(width - pad - 28, ty - 7, 28, 14, 3), closed: true });
  }
  return paths;
}`,
  },

  // 240. AI Flow: ReAct Thought-Action-Obs Loop
  {
    id: 'flow-ai-react-reason-act-loop',
    name: "AI Flow: ReAct Thought-Action-Obs Loop",
    category: 'Flow & Diagrams',
    description: "Triadic circular agent loop: Thought -> Tool Action -> Environment Observation with cycle arcs.",
    iconName: 'RefreshCw',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle state node size (10-18)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "ReAct Agent Loop" },
      { key: 'orbitR', label: "Triad Orbit Radius", type: 'number', min: 0.22, max: 0.38, step: 0.01, defaultValue: 0.3 },
      { key: 'nodeR', label: "State Node Size", type: 'number', min: 10, max: 18, step: 1, defaultValue: 13 },
    ],
    defaultParams: { label: "ReAct Agent Loop", orbitR: 0.3, nodeR: 13 },
    jsSourceCode: `// AI Flow: ReAct Thought-Action-Obs Loop (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.orbitR) || 0.3, 0.22, 0.38);
  const v2 = Math.round(helpers.clamp(Number(params.nodeR) || 13, 10, 18));
  const t1 = (v1 - 0.22) / Math.max(0.001, 0.16);
  const t2 = (v2 - 10) / Math.max(1, 8);
  return [
    { id: 'orbitR', label: \`Triad: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'nodeR', label: \`State: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'orbitR') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.22, 0.38, t);
    return { ...params, orbitR: Number(val.toFixed(2)) };
  }
  if (id === 'nodeR') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, nodeR: Math.round(helpers.lerp(10, 18, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.nodeR) || 13);
  const next = cur >= 18 ? 10 : cur + 1;
  return { ...params, nodeR: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.orbitR) || 0.3, 0.22, 0.38);
  const v2 = Math.round(helpers.clamp(Number(params.nodeR) || 13, 10, 18));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const r = Math.min(width, height) * v1;
  const nr = v2;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, cy, r * 1.15, r), closed: true });
  for (let i = 0; i < 3; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 3;
    paths.push({ nodes: helpers.ellipsePath(cx + Math.cos(a) * r * 1.15, cy + Math.sin(a) * r, nr, nr), closed: true });
  }
  return paths;
}`,
  },

  // 241. AI Flow: Supervisor & Worker Subagents
  {
    id: 'flow-ai-multi-agent-supervisor',
    name: "AI Flow: Supervisor & Worker Subagents",
    category: 'Flow & Diagrams',
    description: "Top orchestrator supervisor hexagon dispatching tasks across a bus to N specialized worker agents.",
    iconName: 'Network',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle worker subagents (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Supervisor Agent" },
      { key: 'busY', label: "Orchestration Bus Y", type: 'number', min: 0.4, max: 0.62, step: 0.01, defaultValue: 0.5 },
      { key: 'workers', label: "Worker Subagents", type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Supervisor Agent", busY: 0.5, workers: 3 },
    jsSourceCode: `// AI Flow: Supervisor & Worker Subagents (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.busY) || 0.5, 0.4, 0.62);
  const v2 = Math.round(helpers.clamp(Number(params.workers) || 3, 2, 5));
  const t1 = (v1 - 0.4) / Math.max(0.001, 0.21999999999999997);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'busY', label: \`Orchestration: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'workers', label: \`Worker: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'busY') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.4, 0.62, t);
    return { ...params, busY: Number(val.toFixed(2)) };
  }
  if (id === 'workers') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, workers: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.workers) || 3);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, workers: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.busY) || 0.5, 0.4, 0.62);
  const v2 = Math.round(helpers.clamp(Number(params.workers) || 3, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const by = height * v1;
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: 4 }, { x: cx + 26, y: 14 }, { x: cx + 26, y: 30 }, { x: cx, y: 40 }, { x: cx - 26, y: 30 }, { x: cx - 26, y: 14 }]), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: 40 }, { x: cx, y: by }], false), closed: false });
  const ww = (width - (v2 - 1) * 8) / v2;
  paths.push({ nodes: helpers.polygonPath([{ x: ww / 2, y: by }, { x: width - ww / 2, y: by }], false), closed: false });
  for (let i = 0; i < v2; i++) {
    const wx = i * (ww + 8);
    paths.push({ nodes: helpers.polygonPath([{ x: wx + ww / 2, y: by }, { x: wx + ww / 2, y: by + 12 }], false), closed: false });
    paths.push({ nodes: helpers.rectPath(wx, by + 12, ww, height - by - 14, 4), closed: true });
  }
  return paths;
}`,
  },

  // 242. AI Flow: Tool / Function Calling Node
  {
    id: 'flow-ai-tool-function-call',
    name: "AI Flow: Tool / Function Calling Node",
    category: 'Flow & Diagrams',
    description: "Function-calling execution node with gear/wrench emblem and typed JSON input/output port brackets.",
    iconName: 'Wrench',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle schema arguments (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Tool: search_docs()" },
      { key: 'iconZone', label: "Tool Emblem Width", type: 'number', min: 0.24, max: 0.44, step: 0.01, defaultValue: 0.32 },
      { key: 'params', label: "Schema Arguments", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Tool: search_docs()", iconZone: 0.32, params: 3 },
    jsSourceCode: `// AI Flow: Tool / Function Calling Node (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.iconZone) || 0.32, 0.24, 0.44);
  const v2 = Math.round(helpers.clamp(Number(params.params) || 3, 2, 4));
  const t1 = (v1 - 0.24) / Math.max(0.001, 0.2);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'iconZone', label: \`Tool: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'params', label: \`Schema: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'iconZone') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.24, 0.44, t);
    return { ...params, iconZone: Number(val.toFixed(2)) };
  }
  if (id === 'params') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, params: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.params) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, params: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.iconZone) || 0.32, 0.24, 0.44);
  const v2 = Math.round(helpers.clamp(Number(params.params) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const iz = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 8), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: iz, y: 0 }, { x: iz, y: height }], false), closed: false });
  paths.push({ nodes: helpers.ellipsePath(iz / 2, cy, Math.min(iz, height) * 0.28, Math.min(iz, height) * 0.28), closed: true });
  const rh = (height - pad * 2) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(iz + pad, pad + i * rh, width - iz - pad * 2, rh * 0.7, 2), closed: true });
  }
  return paths;
}`,
  },

  // 243. AI Flow: MCP Server & Resource Host
  {
    id: 'flow-ai-mcp-server-bridge',
    name: "AI Flow: MCP Server & Resource Host",
    category: 'Flow & Diagrams',
    description: "Model Context Protocol host connected via 3-pin JSON-RPC bridge to server tools and resources.",
    iconName: 'PlugZap',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle exposed mcp tools (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "MCP Server Bridge" },
      { key: 'bridgeX', label: "JSON-RPC Bridge X", type: 'number', min: 0.36, max: 0.6, step: 0.01, defaultValue: 0.46 },
      { key: 'tools', label: "Exposed MCP Tools", type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "MCP Server Bridge", bridgeX: 0.46, tools: 3 },
    jsSourceCode: `// AI Flow: MCP Server & Resource Host (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.bridgeX) || 0.46, 0.36, 0.6);
  const v2 = Math.round(helpers.clamp(Number(params.tools) || 3, 2, 5));
  const t1 = (v1 - 0.36) / Math.max(0.001, 0.24);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'bridgeX', label: \`JSON-RPC: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'tools', label: \`Exposed: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'bridgeX') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.36, 0.6, t);
    return { ...params, bridgeX: Number(val.toFixed(2)) };
  }
  if (id === 'tools') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, tools: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.tools) || 3);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, tools: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.bridgeX) || 0.46, 0.36, 0.6);
  const v2 = Math.round(helpers.clamp(Number(params.tools) || 3, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const bx = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, bx - 12, height, 4), closed: true });
  paths.push({ nodes: helpers.rectPath(bx + 12, 0, width - bx - 12, height, 4), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: bx - 12, y: cy - 8 }, { x: bx + 12, y: cy - 8 }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: bx - 12, y: cy + 8 }, { x: bx + 12, y: cy + 8 }], false), closed: false });
  const th = (height - pad * 2) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(bx + 18, pad + i * th, width - bx - 24, th * 0.72, 2), closed: true });
  }
  return paths;
}`,
  },

  // 244. AI Flow: Short/Long-Term Agent Memory
  {
    id: 'flow-ai-memory-episodic-store',
    name: "AI Flow: Short/Long-Term Agent Memory",
    category: 'Flow & Diagrams',
    description: "Concentric fast ring-buffer working memory surrounded by persistent long-term vector memory banks.",
    iconName: 'Brain',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle memory buffer slots (4-8)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Episodic Memory" },
      { key: 'ringScale', label: "Working Ring Scale", type: 'number', min: 0.24, max: 0.42, step: 0.01, defaultValue: 0.32 },
      { key: 'sectors', label: "Memory Buffer Slots", type: 'number', min: 4, max: 8, step: 1, defaultValue: 6 },
    ],
    defaultParams: { label: "Episodic Memory", ringScale: 0.32, sectors: 6 },
    jsSourceCode: `// AI Flow: Short/Long-Term Agent Memory (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.ringScale) || 0.32, 0.24, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.sectors) || 6, 4, 8));
  const t1 = (v1 - 0.24) / Math.max(0.001, 0.18);
  const t2 = (v2 - 4) / Math.max(1, 4);
  return [
    { id: 'ringScale', label: \`Working: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'sectors', label: \`Memory: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'ringScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.24, 0.42, t);
    return { ...params, ringScale: Number(val.toFixed(2)) };
  }
  if (id === 'sectors') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, sectors: Math.round(helpers.lerp(4, 8, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.sectors) || 6);
  const next = cur >= 8 ? 4 : cur + 1;
  return { ...params, sectors: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.ringScale) || 0.32, 0.24, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.sectors) || 6, 4, 8));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const r = Math.min(width, height) * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, cy, r, r), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, cy, r * 0.52, r * 0.52), closed: true });
  for (let i = 0; i < v2; i++) {
    const a = (i * Math.PI * 2) / v2;
    paths.push({ nodes: helpers.polygonPath([{ x: cx + Math.cos(a) * r * 0.52, y: cy + Math.sin(a) * r * 0.52 }, { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }], false), closed: false });
  }
  return paths;
}`,
  },

  // 245. AI Flow: Input/Output Safety Guardrail
  {
    id: 'flow-ai-guardrail-safety-filter',
    name: "AI Flow: Input/Output Safety Guardrail",
    category: 'Flow & Diagrams',
    description: "Policy filter grate and shield separating safe pass-through responses from blocked policy violations.",
    iconName: 'ShieldCheck',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle filter grate bars (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Safety Guardrail" },
      { key: 'filterX', label: "Guardrail Gate X", type: 'number', min: 0.38, max: 0.64, step: 0.01, defaultValue: 0.5 },
      { key: 'bars', label: "Filter Grate Bars", type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Safety Guardrail", filterX: 0.5, bars: 4 },
    jsSourceCode: `// AI Flow: Input/Output Safety Guardrail (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.filterX) || 0.5, 0.38, 0.64);
  const v2 = Math.round(helpers.clamp(Number(params.bars) || 4, 3, 6));
  const t1 = (v1 - 0.38) / Math.max(0.001, 0.26);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'filterX', label: \`Guardrail: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'bars', label: \`Filter: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'filterX') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.38, 0.64, t);
    return { ...params, filterX: Number(val.toFixed(2)) };
  }
  if (id === 'bars') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, bars: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.bars) || 4);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, bars: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.filterX) || 0.5, 0.38, 0.64);
  const v2 = Math.round(helpers.clamp(Number(params.bars) || 4, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const fx = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  paths.push({ nodes: helpers.rectPath(fx - 10, pad, 20, height - pad * 2, 3), closed: true });
  for (let i = 1; i <= v2; i++) {
    const by = pad + (i * (height - pad * 2)) / (v2 + 1);
    paths.push({ nodes: helpers.polygonPath([{ x: fx - 10, y: by }, { x: fx + 10, y: by }], false), closed: false });
  }
  paths.push({ nodes: helpers.ellipsePath(width * 0.82, height * 0.3, 9, 9), closed: true });
  paths.push({ nodes: helpers.ellipsePath(width * 0.82, height * 0.7, 9, 9), closed: true });
  return paths;
}`,
  },

  // 246. AI Flow: Human-in-the-Loop Approval
  {
    id: 'flow-ai-human-in-the-loop',
    name: "AI Flow: Human-in-the-Loop Approval",
    category: 'Flow & Diagrams',
    description: "Human reviewer silhouette with execution pause gate and Approve (✓) / Reject (✕) decision ports.",
    iconName: 'UserCheck',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle action ports (2-3)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "HITL Approval Gate" },
      { key: 'avatarX', label: "Reviewer Center X", type: 'number', min: 0.3, max: 0.52, step: 0.01, defaultValue: 0.38 },
      { key: 'buttons', label: "Action Ports", type: 'number', min: 2, max: 3, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "HITL Approval Gate", avatarX: 0.38, buttons: 2 },
    jsSourceCode: `// AI Flow: Human-in-the-Loop Approval (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.avatarX) || 0.38, 0.3, 0.52);
  const v2 = Math.round(helpers.clamp(Number(params.buttons) || 2, 2, 3));
  const t1 = (v1 - 0.3) / Math.max(0.001, 0.22000000000000003);
  const t2 = (v2 - 2) / Math.max(1, 1);
  return [
    { id: 'avatarX', label: \`Reviewer: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'buttons', label: \`Action: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'avatarX') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.3, 0.52, t);
    return { ...params, avatarX: Number(val.toFixed(2)) };
  }
  if (id === 'buttons') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, buttons: Math.round(helpers.lerp(2, 3, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.buttons) || 2);
  const next = cur >= 3 ? 2 : cur + 1;
  return { ...params, buttons: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.avatarX) || 0.38, 0.3, 0.52);
  const v2 = Math.round(helpers.clamp(Number(params.buttons) || 2, 2, 3));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const ax = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.ellipsePath(ax, cy - 12, 12, 12), closed: true });
  paths.push({ nodes: helpers.arcNodes(ax, cy + 20, 20, 16, -180, 180), closed: true });
  const bh = (height - pad * 2) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(width * 0.62, pad + i * bh, width * 0.3, bh * 0.74, 4), closed: true });
  }
  return paths;
}`,
  },

  // 247. AI Flow: Structured Output JSON Schema
  {
    id: 'flow-ai-structured-json-schema',
    name: "AI Flow: Structured Output JSON Schema",
    category: 'Flow & Diagrams',
    description: "Left and right curly braces { } framing a validated hierarchical key-value JSON response tree.",
    iconName: 'Braces',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle json schema keys (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "JSON Schema { }" },
      { key: 'braceW', label: "Curly Brace Width", type: 'number', min: 0.1, max: 0.22, step: 0.01, defaultValue: 0.14 },
      { key: 'fields', label: "JSON Schema Keys", type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "JSON Schema { }", braceW: 0.14, fields: 3 },
    jsSourceCode: `// AI Flow: Structured Output JSON Schema (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.braceW) || 0.14, 0.1, 0.22);
  const v2 = Math.round(helpers.clamp(Number(params.fields) || 3, 2, 5));
  const t1 = (v1 - 0.1) / Math.max(0.001, 0.12);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'braceW', label: \`Curly: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'fields', label: \`JSON: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'braceW') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.1, 0.22, t);
    return { ...params, braceW: Number(val.toFixed(2)) };
  }
  if (id === 'fields') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, fields: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.fields) || 3);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, fields: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.braceW) || 0.14, 0.1, 0.22);
  const v2 = Math.round(helpers.clamp(Number(params.fields) || 3, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const bw = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: pad + bw, y: pad }, { x: pad + bw * 0.4, y: pad }, { x: pad + bw * 0.4, y: cy - 5 }, { x: pad, y: cy }, { x: pad + bw * 0.4, y: cy + 5 }, { x: pad + bw * 0.4, y: height - pad }, { x: pad + bw, y: height - pad }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: width - pad - bw, y: pad }, { x: width - pad - bw * 0.4, y: pad }, { x: width - pad - bw * 0.4, y: cy - 5 }, { x: width - pad, y: cy }, { x: width - pad - bw * 0.4, y: cy + 5 }, { x: width - pad - bw * 0.4, y: height - pad }, { x: width - pad - bw, y: height - pad }], false), closed: false });
  const fh = (height - pad * 2.4) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(pad + bw + 6, pad * 1.2 + i * fh, width - (pad + bw + 6) * 2, fh * 0.68, 2), closed: true });
  }
  return paths;
}`,
  },

  // 248. AI Flow: LLM-as-a-Judge Evaluator
  {
    id: 'flow-ai-eval-benchmark-judge',
    name: "AI Flow: LLM-as-a-Judge Evaluator",
    category: 'Flow & Diagrams',
    description: "Precision balance beam scale weighing candidate model outputs against rubric score bars.",
    iconName: 'Scale',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle rubric criteria (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "LLM Judge Eval" },
      { key: 'tilt', label: "Balance Beam Tilt", type: 'number', min: -0.18, max: 0.18, step: 0.01, defaultValue: 0.08 },
      { key: 'rubrics', label: "Rubric Criteria", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "LLM Judge Eval", tilt: 0.08, rubrics: 3 },
    jsSourceCode: `// AI Flow: LLM-as-a-Judge Evaluator (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.tilt) || 0.08, -0.18, 0.18);
  const v2 = Math.round(helpers.clamp(Number(params.rubrics) || 3, 2, 4));
  const t1 = (v1 - -0.18) / Math.max(0.001, 0.36);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'tilt', label: \`Balance: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'rubrics', label: \`Rubric: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'tilt') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(-0.18, 0.18, t);
    return { ...params, tilt: Number(val.toFixed(2)) };
  }
  if (id === 'rubrics') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, rubrics: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.rubrics) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, rubrics: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.tilt) || 0.08, -0.18, 0.18);
  const v2 = Math.round(helpers.clamp(Number(params.rubrics) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const dy = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: height * 0.36 }, { x: cx + 14, y: height - pad }, { x: cx - 14, y: height - pad }]), closed: true });
  const lx = width * 0.2;
  const rx = width * 0.8;
  const ly = height * 0.36 - dy;
  const ry = height * 0.36 + dy;
  paths.push({ nodes: helpers.polygonPath([{ x: lx, y: ly }, { x: rx, y: ry }], false), closed: false });
  paths.push({ nodes: helpers.rectPath(lx - 14, ly + 12, 28, 10, 2), closed: true });
  paths.push({ nodes: helpers.rectPath(rx - 14, ry + 12, 28, 10, 2), closed: true });
  for (let r = 0; r < v2; r++) {
    const by = height - pad - 5 - r * 5;
    paths.push({ nodes: helpers.polygonPath([{ x: cx - 7, y: by }, { x: cx + 7, y: by }], false), closed: false });
  }
  return paths;
}`,
  },

  // 249. AI Flow: Frozen Base + LoRA Adapter
  {
    id: 'flow-ai-lora-adapter-layer',
    name: "AI Flow: Frozen Base + LoRA Adapter",
    category: 'Flow & Diagrams',
    description: "Large frozen pretrained weight block W0 bypassed by low-rank hourglass A×B matrices summing at output.",
    iconName: 'Layers',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle low-rank r waist (4-16)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "LoRA Rank Adapter" },
      { key: 'baseWidth', label: "Frozen Weight Width", type: 'number', min: 0.34, max: 0.58, step: 0.01, defaultValue: 0.44 },
      { key: 'rankWaist', label: "Low-Rank r Waist", type: 'number', min: 4, max: 16, step: 1, defaultValue: 8 },
    ],
    defaultParams: { label: "LoRA Rank Adapter", baseWidth: 0.44, rankWaist: 8 },
    jsSourceCode: `// AI Flow: Frozen Base + LoRA Adapter (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.baseWidth) || 0.44, 0.34, 0.58);
  const v2 = Math.round(helpers.clamp(Number(params.rankWaist) || 8, 4, 16));
  const t1 = (v1 - 0.34) / Math.max(0.001, 0.23999999999999994);
  const t2 = (v2 - 4) / Math.max(1, 12);
  return [
    { id: 'baseWidth', label: \`Frozen: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'rankWaist', label: \`Low-Rank: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'baseWidth') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.34, 0.58, t);
    return { ...params, baseWidth: Number(val.toFixed(2)) };
  }
  if (id === 'rankWaist') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, rankWaist: Math.round(helpers.lerp(4, 16, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.rankWaist) || 8);
  const next = cur >= 16 ? 4 : cur + 1;
  return { ...params, rankWaist: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.baseWidth) || 0.44, 0.34, 0.58);
  const v2 = Math.round(helpers.clamp(Number(params.rankWaist) || 8, 4, 16));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const bw = (width - pad * 3) * v1;
  const rw = v2;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, pad * 1.4, bw, height - pad * 2.8, 3), closed: true });
  const lx = pad * 2 + bw + 18;
  paths.push({ nodes: helpers.polygonPath([
    { x: lx - 16, y: pad * 1.4 }, { x: lx + 16, y: pad * 1.4 },
    { x: lx + rw * 0.5, y: cy }, { x: lx + 16, y: height - pad * 1.4 },
    { x: lx - 16, y: height - pad * 1.4 }, { x: lx - rw * 0.5, y: cy }
  ]), closed: true });
  return paths;
}`,
  },

  // 250. AI Flow: RLHF / DPO Preference Pair
  {
    id: 'flow-ai-rlhf-reward-loop',
    name: "AI Flow: RLHF / DPO Preference Pair",
    category: 'Flow & Diagrams',
    description: "Prompt forking into Preferred (y+) and Rejected (y-) completions evaluated by reward feedback loop.",
    iconName: 'ThumbsUp',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle policy update arcs (1-2)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "RLHF / DPO Pair" },
      { key: 'splitSpread', label: "Preference Fork Gap", type: 'number', min: 0.2, max: 0.44, step: 0.01, defaultValue: 0.32 },
      { key: 'loops', label: "Policy Update Arcs", type: 'number', min: 1, max: 2, step: 1, defaultValue: 1 },
    ],
    defaultParams: { label: "RLHF / DPO Pair", splitSpread: 0.32, loops: 1 },
    jsSourceCode: `// AI Flow: RLHF / DPO Preference Pair (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.splitSpread) || 0.32, 0.2, 0.44);
  const v2 = Math.round(helpers.clamp(Number(params.loops) || 1, 1, 2));
  const t1 = (v1 - 0.2) / Math.max(0.001, 0.24);
  const t2 = (v2 - 1) / Math.max(1, 1);
  return [
    { id: 'splitSpread', label: \`Preference: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'loops', label: \`Policy: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'splitSpread') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.2, 0.44, t);
    return { ...params, splitSpread: Number(val.toFixed(2)) };
  }
  if (id === 'loops') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, loops: Math.round(helpers.lerp(1, 2, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.loops) || 1);
  const next = cur >= 2 ? 1 : cur + 1;
  return { ...params, loops: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.splitSpread) || 0.32, 0.2, 0.44);
  const v2 = Math.round(helpers.clamp(Number(params.loops) || 1, 1, 2));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const sp = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, cy - 11, 26, 22, 3), closed: true });
  paths.push({ nodes: helpers.rectPath(cx - 22, cy - sp - 10, 44, 20, 3), closed: true });
  paths.push({ nodes: helpers.rectPath(cx - 22, cy + sp - 10, 44, 20, 3), closed: true });
  paths.push({ nodes: helpers.ellipsePath(width - pad - 14, cy, 12, 12), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: pad + 26, y: cy }, { x: cx - 22, y: cy - sp }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: pad + 26, y: cy }, { x: cx - 22, y: cy + sp }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: cx + 22, y: cy - sp }, { x: width - pad - 26, y: cy }], false), closed: false });
  if (v2 > 1) paths.push({ nodes: helpers.polygonPath([{ x: cx + 22, y: cy + sp }, { x: width - pad - 26, y: cy }], false), closed: false });
  return paths;
}`,
  },

  // 251. AI Flow: Vision ViT Patch Encoder
  {
    id: 'flow-ai-vision-multimodal-encoder',
    name: "AI Flow: Vision ViT Patch Encoder",
    category: 'Flow & Diagrams',
    description: "Input image sliced into N×N Vision Transformer patches projecting into multimodal token embeddings.",
    iconName: 'Eye',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle patch grid (n×n) (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "ViT Patch Encoder" },
      { key: 'imgRatio', label: "Image Grid Width", type: 'number', min: 0.32, max: 0.54, step: 0.01, defaultValue: 0.42 },
      { key: 'gridN', label: "Patch Grid (N×N)", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "ViT Patch Encoder", imgRatio: 0.42, gridN: 3 },
    jsSourceCode: `// AI Flow: Vision ViT Patch Encoder (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.imgRatio) || 0.42, 0.32, 0.54);
  const v2 = Math.round(helpers.clamp(Number(params.gridN) || 3, 2, 4));
  const t1 = (v1 - 0.32) / Math.max(0.001, 0.22000000000000003);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'imgRatio', label: \`Image: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'gridN', label: \`Patch: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'imgRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.32, 0.54, t);
    return { ...params, imgRatio: Number(val.toFixed(2)) };
  }
  if (id === 'gridN') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, gridN: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.gridN) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, gridN: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.imgRatio) || 0.42, 0.32, 0.54);
  const v2 = Math.round(helpers.clamp(Number(params.gridN) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const iw = (width - pad * 3) * v1;
  const ih = height - pad * 2;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, pad, iw, ih, 2), closed: true });
  for (let i = 1; i < v2; i++) {
    paths.push({ nodes: helpers.polygonPath([{ x: pad + (iw * i) / v2, y: pad }, { x: pad + (iw * i) / v2, y: pad + ih }], false), closed: false });
    paths.push({ nodes: helpers.polygonPath([{ x: pad, y: pad + (ih * i) / v2 }, { x: pad + iw, y: pad + (ih * i) / v2 }], false), closed: false });
  }
  const tx = pad * 2 + iw + 12;
  for (let t = 0; t < v2; t++) {
    paths.push({ nodes: helpers.rectPath(tx, pad + t * (ih / v2), width - tx - pad, (ih / v2) * 0.74, 2), closed: true });
  }
  return paths;
}`,
  },

  // 252. AI Flow: Live Audio VAD / ASR / TTS
  {
    id: 'flow-ai-speech-asr-tts-wave',
    name: "AI Flow: Live Audio VAD / ASR / TTS",
    category: 'Flow & Diagrams',
    description: "Condenser microphone capsule, real-time symmetric voice activity waveform, and transcript bubble.",
    iconName: 'Mic',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle acoustic spectrum bars (5-9)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Live Audio VAD/ASR" },
      { key: 'waveAmp', label: "Voice Waveform Amp", type: 'number', min: 0.15, max: 0.42, step: 0.01, defaultValue: 0.28 },
      { key: 'bars', label: "Acoustic Spectrum Bars", type: 'number', min: 5, max: 9, step: 1, defaultValue: 7 },
    ],
    defaultParams: { label: "Live Audio VAD/ASR", waveAmp: 0.28, bars: 7 },
    jsSourceCode: `// AI Flow: Live Audio VAD / ASR / TTS (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.waveAmp) || 0.28, 0.15, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.bars) || 7, 5, 9));
  const t1 = (v1 - 0.15) / Math.max(0.001, 0.27);
  const t2 = (v2 - 5) / Math.max(1, 4);
  return [
    { id: 'waveAmp', label: \`Voice: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'bars', label: \`Acoustic: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'waveAmp') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.15, 0.42, t);
    return { ...params, waveAmp: Number(val.toFixed(2)) };
  }
  if (id === 'bars') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, bars: Math.round(helpers.lerp(5, 9, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.bars) || 7);
  const next = cur >= 9 ? 5 : cur + 1;
  return { ...params, bars: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.waveAmp) || 0.28, 0.15, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.bars) || 7, 5, 9));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const amp = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, cy - 14, 14, 24, 7), closed: true });
  const wx = pad + 24;
  const ww = width - wx - pad - 34;
  for (let i = 0; i < v2; i++) {
    const bx = wx + (i * ww) / v2;
    const bh = i % 2 === 0 ? amp * 1.4 : amp * 0.65;
    paths.push({ nodes: helpers.rectPath(bx, cy - bh / 2, Math.max(3, ww / (v2 * 1.8)), bh, 1), closed: true });
  }
  paths.push({ nodes: helpers.rectPath(width - pad - 28, cy - 12, 28, 24, 5), closed: true });
  return paths;
}`,
  },

  // 253. AI Flow: Token Spend Budget Breaker
  {
    id: 'flow-ai-cost-circuit-breaker',
    name: "AI Flow: Token Spend Budget Breaker",
    category: 'Flow & Diagrams',
    description: "Semicircular cloud spend gauge with live needle and hard monthly budget trip ceiling.",
    iconName: 'DollarSign',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle cascade cost tiers (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "$10 Spend Guardrail" },
      { key: 'spendRatio', label: "Budget Needle Ratio", type: 'number', min: 0.15, max: 0.92, step: 0.01, defaultValue: 0.62 },
      { key: 'tiers', label: "Cascade Cost Tiers", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "$10 Spend Guardrail", spendRatio: 0.62, tiers: 3 },
    jsSourceCode: `// AI Flow: Token Spend Budget Breaker (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.spendRatio) || 0.62, 0.15, 0.92);
  const v2 = Math.round(helpers.clamp(Number(params.tiers) || 3, 2, 4));
  const t1 = (v1 - 0.15) / Math.max(0.001, 0.77);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'spendRatio', label: \`Budget: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'tiers', label: \`Cascade: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'spendRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.15, 0.92, t);
    return { ...params, spendRatio: Number(val.toFixed(2)) };
  }
  if (id === 'tiers') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, tiers: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.tiers) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, tiers: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.spendRatio) || 0.62, 0.15, 0.92);
  const v2 = Math.round(helpers.clamp(Number(params.tiers) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const r = Math.min(width, height) * 0.42;
  const gcy = height * 0.72;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  paths.push({ nodes: helpers.arcNodes(cx, gcy, r * 1.15, r, -180, 180), closed: false });
  const ang = -Math.PI + v1 * Math.PI;
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: gcy }, { x: cx + Math.cos(ang) * r, y: gcy + Math.sin(ang) * r * 0.9 }], false), closed: false });
  paths.push({ nodes: helpers.ellipsePath(cx, gcy, 5, 5), closed: true });
  for (let t = 1; t <= v2; t++) {
    const ta = -Math.PI + (t / (v2 + 1)) * Math.PI;
    paths.push({ nodes: helpers.polygonPath([{ x: cx + Math.cos(ta) * r * 0.9, y: gcy + Math.sin(ta) * r * 0.8 }, { x: cx + Math.cos(ta) * r * 1.15, y: gcy + Math.sin(ta) * r }], false), closed: false });
  }
  return paths;
}`,
  },

  // 254. AI Flow: Semantic Embedding Cache
  {
    id: 'flow-ai-semantic-cache-hit',
    name: "AI Flow: Semantic Embedding Cache",
    category: 'Flow & Diagrams',
    description: "Cosine similarity gate with fast upper cache-hit bypass arc over lower full-LLM inference path.",
    iconName: 'Zap',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle cosine rings (1-3)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Semantic Cache" },
      { key: 'arcLift', label: "Fast Bypass Lift", type: 'number', min: 0.16, max: 0.38, step: 0.01, defaultValue: 0.26 },
      { key: 'threshold', label: "Cosine Rings", type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "Semantic Cache", arcLift: 0.26, threshold: 2 },
    jsSourceCode: `// AI Flow: Semantic Embedding Cache (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.arcLift) || 0.26, 0.16, 0.38);
  const v2 = Math.round(helpers.clamp(Number(params.threshold) || 2, 1, 3));
  const t1 = (v1 - 0.16) / Math.max(0.001, 0.22);
  const t2 = (v2 - 1) / Math.max(1, 2);
  return [
    { id: 'arcLift', label: \`Fast: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'threshold', label: \`Cosine: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'arcLift') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.16, 0.38, t);
    return { ...params, arcLift: Number(val.toFixed(2)) };
  }
  if (id === 'threshold') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, threshold: Math.round(helpers.lerp(1, 3, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.threshold) || 2);
  const next = cur >= 3 ? 1 : cur + 1;
  return { ...params, threshold: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.arcLift) || 0.26, 0.16, 0.38);
  const v2 = Math.round(helpers.clamp(Number(params.threshold) || 2, 1, 3));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const lift = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: width * 0.3, y: cy - 14 }, { x: width * 0.42, y: cy }, { x: width * 0.3, y: cy + 14 }, { x: width * 0.18, y: cy }]), closed: true });
  paths.push({ nodes: [
    helpers.cornerNode(width * 0.3, cy - 14),
    helpers.smoothNode(width * 0.6, cy - 14 - lift, width * 0.45, cy - 14 - lift, width * 0.75, cy - 14 - lift),
    helpers.cornerNode(width * 0.85, cy)
  ], closed: false });
  paths.push({ nodes: helpers.rectPath(width * 0.54, cy + 6, width * 0.34, height * 0.28, 3), closed: true });
  for (let t = 1; t <= v2; t++) {
    const tx = width * 0.54 + (t * width * 0.34) / (v2 + 1);
    paths.push({ nodes: helpers.polygonPath([{ x: tx, y: cy + 8 }, { x: tx, y: cy + 6 + height * 0.28 - 2 }], false), closed: false });
  }
  return paths;
}`,
  },

  // 255. AI Flow: Async Batch Inference Job
  {
    id: 'flow-ai-batch-inference-queue',
    name: "AI Flow: Async Batch Inference Job",
    category: 'Flow & Diagrams',
    description: "Stacked JSONL batch input queue feeding parallel GPU worker cores and output storage bucket.",
    iconName: 'Server',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle gpu worker lanes (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Batch Inference" },
      { key: 'gpuWidth', label: "GPU Cluster Width", type: 'number', min: 0.24, max: 0.44, step: 0.01, defaultValue: 0.32 },
      { key: 'workers', label: "GPU Worker Lanes", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Batch Inference", gpuWidth: 0.32, workers: 3 },
    jsSourceCode: `// AI Flow: Async Batch Inference Job (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.gpuWidth) || 0.32, 0.24, 0.44);
  const v2 = Math.round(helpers.clamp(Number(params.workers) || 3, 2, 4));
  const t1 = (v1 - 0.24) / Math.max(0.001, 0.2);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'gpuWidth', label: \`GPU: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'workers', label: \`GPU: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'gpuWidth') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.24, 0.44, t);
    return { ...params, gpuWidth: Number(val.toFixed(2)) };
  }
  if (id === 'workers') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, workers: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.workers) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, workers: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.gpuWidth) || 0.32, 0.24, 0.44);
  const v2 = Math.round(helpers.clamp(Number(params.workers) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const gw = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  const wh = (height - pad * 2) / v2;
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.rectPath(pad, pad + i * wh, width * 0.22, wh * 0.74, 2), closed: true });
    paths.push({ nodes: helpers.rectPath(cx - gw / 2, pad + i * wh, gw, wh * 0.74, 3), closed: true });
  }
  paths.push({ nodes: helpers.rectPath(width - pad - width * 0.18, height * 0.24, width * 0.18, height * 0.52, 4), closed: true });
  return paths;
}`,
  },

  // 256. AI Flow: GraphRAG Entity-Relation Triplet
  {
    id: 'flow-ai-knowledge-graph-rag',
    name: "AI Flow: GraphRAG Entity-Relation Triplet",
    category: 'Flow & Diagrams',
    description: "(Subject) --[Predicate]--> (Object) knowledge-graph triplet node with community subgraph hull.",
    iconName: 'Share2',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle context hop rings (1-3)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "GraphRAG Triplet" },
      { key: 'spread', label: "Triplet Node Spread", type: 'number', min: 0.22, max: 0.42, step: 0.01, defaultValue: 0.32 },
      { key: 'hops', label: "Context Hop Rings", type: 'number', min: 1, max: 3, step: 1, defaultValue: 2 },
    ],
    defaultParams: { label: "GraphRAG Triplet", spread: 0.32, hops: 2 },
    jsSourceCode: `// AI Flow: GraphRAG Entity-Relation Triplet (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.spread) || 0.32, 0.22, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.hops) || 2, 1, 3));
  const t1 = (v1 - 0.22) / Math.max(0.001, 0.19999999999999998);
  const t2 = (v2 - 1) / Math.max(1, 2);
  return [
    { id: 'spread', label: \`Triplet: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'hops', label: \`Context: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'spread') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.22, 0.42, t);
    return { ...params, spread: Number(val.toFixed(2)) };
  }
  if (id === 'hops') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, hops: Math.round(helpers.lerp(1, 3, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.hops) || 2);
  const next = cur >= 3 ? 1 : cur + 1;
  return { ...params, hops: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.spread) || 0.32, 0.22, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.hops) || 2, 1, 3));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const sp = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  const sx = cx - sp;
  const ox = cx + sp;
  const py = height * 0.26;
  const ny = height * 0.68;
  paths.push({ nodes: helpers.polygonPath([{ x: sx, y: ny }, { x: cx, y: py }, { x: ox, y: ny }]), closed: true });
  paths.push({ nodes: helpers.ellipsePath(sx, ny, 12, 12), closed: true });
  paths.push({ nodes: helpers.ellipsePath(ox, ny, 12, 12), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: py - 10 }, { x: cx + 14, y: py }, { x: cx, y: py + 10 }, { x: cx - 14, y: py }]), closed: true });
  for (let h = 1; h <= v2; h++) {
    paths.push({ nodes: helpers.ellipsePath(cx, ny + 4, 4 * h, 3 * h), closed: true });
  }
  return paths;
}`,
  },

  // 257. Strategy: 2×2 SWOT Matrix Grid
  {
    id: 'flow-strat-swot-matrix',
    name: "Strategy: 2×2 SWOT Matrix Grid",
    category: 'Flow & Diagrams',
    description: "4-quadrant Strengths/Weaknesses/Opportunities/Threats grid with central strategic synthesis diamond.",
    iconName: 'Grid',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle center diamond scale (14-34)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "SWOT 2×2 Matrix" },
      { key: 'splitX', label: "Vertical Axis Split", type: 'number', min: 0.35, max: 0.65, step: 0.01, defaultValue: 0.5 },
      { key: 'coreSize', label: "Center Diamond Scale", type: 'number', min: 14, max: 34, step: 1, defaultValue: 22 },
    ],
    defaultParams: { label: "SWOT 2×2 Matrix", splitX: 0.5, coreSize: 22 },
    jsSourceCode: `// Strategy: 2×2 SWOT Matrix Grid (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.splitX) || 0.5, 0.35, 0.65);
  const v2 = Math.round(helpers.clamp(Number(params.coreSize) || 22, 14, 34));
  const t1 = (v1 - 0.35) / Math.max(0.001, 0.30000000000000004);
  const t2 = (v2 - 14) / Math.max(1, 20);
  return [
    { id: 'splitX', label: \`Vertical: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'coreSize', label: \`Center: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'splitX') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.35, 0.65, t);
    return { ...params, splitX: Number(val.toFixed(2)) };
  }
  if (id === 'coreSize') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, coreSize: Math.round(helpers.lerp(14, 34, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.coreSize) || 22);
  const next = cur >= 34 ? 14 : cur + 1;
  return { ...params, coreSize: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.splitX) || 0.5, 0.35, 0.65);
  const v2 = Math.round(helpers.clamp(Number(params.coreSize) || 22, 14, 34));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const sx = width * v1;
  const cs = v2;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: sx, y: 0 }, { x: sx, y: height }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: cy }, { x: width, y: cy }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: sx, y: cy - cs }, { x: sx + cs, y: cy }, { x: sx, y: cy + cs }, { x: sx - cs, y: cy }]), closed: true });
  return paths;
}`,
  },

  // 258. Strategy: Urgent vs Important 2×2
  {
    id: 'flow-strat-eisenhower-quadrant',
    name: "Strategy: Urgent vs Important 2×2",
    category: 'Flow & Diagrams',
    description: "X/Y directional axis arrows framing 4 executive prioritization quadrants with corner badges.",
    iconName: 'Target',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle quadrant split (%) (35-65)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Priority 2×2 Matrix" },
      { key: 'axisMargin', label: "Axis Margin Inset", type: 'number', min: 0.1, max: 0.24, step: 0.01, defaultValue: 0.15 },
      { key: 'SplitRatio', label: "Quadrant Split (%)", type: 'number', min: 35, max: 65, step: 1, defaultValue: 50 },
    ],
    defaultParams: { label: "Priority 2×2 Matrix", axisMargin: 0.15, SplitRatio: 50 },
    jsSourceCode: `// Strategy: Urgent vs Important 2×2 (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.axisMargin) || 0.15, 0.1, 0.24);
  const v2 = Math.round(helpers.clamp(Number(params.SplitRatio) || 50, 35, 65));
  const t1 = (v1 - 0.1) / Math.max(0.001, 0.13999999999999999);
  const t2 = (v2 - 35) / Math.max(1, 30);
  return [
    { id: 'axisMargin', label: \`Axis: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'SplitRatio', label: \`Quadrant: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'axisMargin') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.1, 0.24, t);
    return { ...params, axisMargin: Number(val.toFixed(2)) };
  }
  if (id === 'SplitRatio') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, SplitRatio: Math.round(helpers.lerp(35, 65, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.SplitRatio) || 50);
  const next = cur >= 65 ? 35 : cur + 1;
  return { ...params, SplitRatio: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.axisMargin) || 0.15, 0.1, 0.24);
  const v2 = Math.round(helpers.clamp(Number(params.SplitRatio) || 50, 35, 65));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const m = Math.min(width, height) * v1;
  const sp = v2 / 100;
  const gx = m + (width - m * 1.5) * sp;
  const gy = (height - m) * sp;
  paths.push({ nodes: helpers.rectPath(m, 4, width - m - 4, height - m - 4, 2), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: gx, y: 4 }, { x: gx, y: height - m }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: m, y: gy }, { x: width - 4, y: gy }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: m * 0.45, y: height - m }, { x: m * 0.45, y: 6 }, { x: width - 6, y: height - m * 0.45 }], false), closed: false });
  return paths;
}`,
  },

  // 259. Strategy: Porter's 5 Forces Hub
  {
    id: 'flow-strat-porter-five-forces',
    name: "Strategy: Porter's 5 Forces Hub",
    category: 'Flow & Diagrams',
    description: "Central Competitive Rivalry hub surrounded by 4 inward-pointing market force chevrons.",
    iconName: 'Compass',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle force chevron inset (4-14)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Porter 5 Forces" },
      { key: 'coreRatio', label: "Center Rivalry Size", type: 'number', min: 0.26, max: 0.46, step: 0.01, defaultValue: 0.34 },
      { key: 'arrowGap', label: "Force Chevron Inset", type: 'number', min: 4, max: 14, step: 1, defaultValue: 8 },
    ],
    defaultParams: { label: "Porter 5 Forces", coreRatio: 0.34, arrowGap: 8 },
    jsSourceCode: `// Strategy: Porter's 5 Forces Hub (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.coreRatio) || 0.34, 0.26, 0.46);
  const v2 = Math.round(helpers.clamp(Number(params.arrowGap) || 8, 4, 14));
  const t1 = (v1 - 0.26) / Math.max(0.001, 0.2);
  const t2 = (v2 - 4) / Math.max(1, 10);
  return [
    { id: 'coreRatio', label: \`Center: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'arrowGap', label: \`Force: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'coreRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.26, 0.46, t);
    return { ...params, coreRatio: Number(val.toFixed(2)) };
  }
  if (id === 'arrowGap') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, arrowGap: Math.round(helpers.lerp(4, 14, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.arrowGap) || 8);
  const next = cur >= 14 ? 4 : cur + 1;
  return { ...params, arrowGap: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.coreRatio) || 0.34, 0.26, 0.46);
  const v2 = Math.round(helpers.clamp(Number(params.arrowGap) || 8, 4, 14));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const cw = width * v1;
  const ch = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  paths.push({ nodes: helpers.rectPath(cx - cw / 2, cy - ch / 2, cw, ch, 4), closed: true });
  paths.push({ nodes: helpers.rectPath(cx - cw * 0.45, v2, cw * 0.9, (height - ch) * 0.32, 2), closed: true });
  paths.push({ nodes: helpers.rectPath(cx - cw * 0.45, height - (height - ch) * 0.32 - v2, cw * 0.9, (height - ch) * 0.32, 2), closed: true });
  paths.push({ nodes: helpers.rectPath(v2, cy - ch * 0.4, (width - cw) * 0.32, ch * 0.8, 2), closed: true });
  paths.push({ nodes: helpers.rectPath(width - (width - cw) * 0.32 - v2, cy - ch * 0.4, (width - cw) * 0.32, ch * 0.8, 2), closed: true });
  return paths;
}`,
  },

  // 260. Strategy: Value Chain Primary & Support
  {
    id: 'flow-strat-value-chain-chevrons',
    name: "Strategy: Value Chain Primary & Support",
    category: 'Flow & Diagrams',
    description: "Porter Value Chain with upper horizontal Support Activity bars and lower interlocking Primary chevrons.",
    iconName: 'FastForward',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle primary activity steps (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Value Chain" },
      { key: 'supportRatio', label: "Support Layers Height", type: 'number', min: 0.34, max: 0.58, step: 0.01, defaultValue: 0.46 },
      { key: 'steps', label: "Primary Activity Steps", type: 'number', min: 3, max: 6, step: 1, defaultValue: 5 },
    ],
    defaultParams: { label: "Value Chain", supportRatio: 0.46, steps: 5 },
    jsSourceCode: `// Strategy: Value Chain Primary & Support (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.supportRatio) || 0.46, 0.34, 0.58);
  const v2 = Math.round(helpers.clamp(Number(params.steps) || 5, 3, 6));
  const t1 = (v1 - 0.34) / Math.max(0.001, 0.23999999999999994);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'supportRatio', label: \`Support: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'steps', label: \`Primary: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'supportRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.34, 0.58, t);
    return { ...params, supportRatio: Number(val.toFixed(2)) };
  }
  if (id === 'steps') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, steps: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.steps) || 5);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, steps: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.supportRatio) || 0.46, 0.34, 0.58);
  const v2 = Math.round(helpers.clamp(Number(params.steps) || 5, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const sh = height * v1;
  const tip = 14;
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: 0 }, { x: width - tip, y: 0 }, { x: width, y: cy }, { x: width - tip, y: height }, { x: 0, y: height }]), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: sh }, { x: width - tip * 0.5, y: sh }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: sh * 0.5 }, { x: width - tip * 0.7, y: sh * 0.5 }], false), closed: false });
  const sw = (width - tip) / v2;
  for (let i = 1; i < v2; i++) {
    paths.push({ nodes: helpers.polygonPath([{ x: i * sw, y: sh }, { x: i * sw + 6, y: sh + (height - sh) / 2 }, { x: i * sw, y: height }], false), closed: false });
  }
  return paths;
}`,
  },

  // 261. Strategy: Ishikawa Fishbone Root Cause
  {
    id: 'flow-strat-ishikawa-fishbone',
    name: "Strategy: Ishikawa Fishbone Root Cause",
    category: 'Flow & Diagrams',
    description: "Ishikawa Cause-and-Effect diagram with central spine arrow, defect head, and angled category ribs.",
    iconName: 'GitBranch',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle cause rib pairs (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Fishbone Root Cause" },
      { key: 'headWidth', label: "Effect Head Width", type: 'number', min: 0.16, max: 0.32, step: 0.01, defaultValue: 0.22 },
      { key: 'ribs', label: "Cause Rib Pairs", type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Fishbone Root Cause", headWidth: 0.22, ribs: 3 },
    jsSourceCode: `// Strategy: Ishikawa Fishbone Root Cause (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.headWidth) || 0.22, 0.16, 0.32);
  const v2 = Math.round(helpers.clamp(Number(params.ribs) || 3, 2, 5));
  const t1 = (v1 - 0.16) / Math.max(0.001, 0.16);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'headWidth', label: \`Effect: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'ribs', label: \`Cause: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'headWidth') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.16, 0.32, t);
    return { ...params, headWidth: Number(val.toFixed(2)) };
  }
  if (id === 'ribs') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, ribs: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.ribs) || 3);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, ribs: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.headWidth) || 0.22, 0.16, 0.32);
  const v2 = Math.round(helpers.clamp(Number(params.ribs) || 3, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const hw = width * v1;
  const spineX = width - hw;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: pad, y: cy }, { x: spineX, y: cy }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: spineX, y: height * 0.22 }, { x: width - pad * 0.5, y: cy }, { x: spineX, y: height * 0.78 }]), closed: true });
  for (let i = 0; i < v2; i++) {
    const rx = helpers.lerp(width * 0.22, spineX - 12, i / Math.max(1, v2 - 1));
    paths.push({ nodes: helpers.polygonPath([{ x: rx - 18, y: pad }, { x: rx, y: cy }], false), closed: false });
    paths.push({ nodes: helpers.polygonPath([{ x: rx - 18, y: height - pad }, { x: rx, y: cy }], false), closed: false });
  }
  return paths;
}`,
  },

  // 262. Strategy: Radial Mind Map Hub
  {
    id: 'flow-strat-mindmap-radial',
    name: "Strategy: Radial Mind Map Hub",
    category: 'Flow & Diagrams',
    description: "Central idea ellipse radiating smooth S-curved Bezier organic branches to perimeter topic nodes.",
    iconName: 'Network',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle mind map branches (4-8)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Radial Mind Map" },
      { key: 'coreScale', label: "Center Hub Scale", type: 'number', min: 0.18, max: 0.34, step: 0.01, defaultValue: 0.24 },
      { key: 'branches', label: "Mind Map Branches", type: 'number', min: 4, max: 8, step: 1, defaultValue: 6 },
    ],
    defaultParams: { label: "Radial Mind Map", coreScale: 0.24, branches: 6 },
    jsSourceCode: `// Strategy: Radial Mind Map Hub (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.coreScale) || 0.24, 0.18, 0.34);
  const v2 = Math.round(helpers.clamp(Number(params.branches) || 6, 4, 8));
  const t1 = (v1 - 0.18) / Math.max(0.001, 0.16000000000000003);
  const t2 = (v2 - 4) / Math.max(1, 4);
  return [
    { id: 'coreScale', label: \`Center: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'branches', label: \`Mind: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'coreScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.18, 0.34, t);
    return { ...params, coreScale: Number(val.toFixed(2)) };
  }
  if (id === 'branches') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, branches: Math.round(helpers.lerp(4, 8, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.branches) || 6);
  const next = cur >= 8 ? 4 : cur + 1;
  return { ...params, branches: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.coreScale) || 0.24, 0.18, 0.34);
  const v2 = Math.round(helpers.clamp(Number(params.branches) || 6, 4, 8));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const cr = Math.min(width, height) * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, cy, cr * 1.25, cr * 0.85), closed: true });
  for (let i = 0; i < v2; i++) {
    const a = (i * Math.PI * 2) / v2;
    const bx = cx + Math.cos(a) * width * 0.38;
    const by = cy + Math.sin(a) * height * 0.36;
    paths.push({ nodes: [helpers.cornerNode(cx + Math.cos(a) * cr, cy + Math.sin(a) * cr * 0.8), helpers.smoothNode(bx, by, cx + Math.cos(a) * width * 0.22, cy, bx, by)], closed: false });
    paths.push({ nodes: helpers.rectPath(bx - 12, by - 6, 24, 12, 6), closed: true });
  }
  return paths;
}`,
  },

  // 263. Strategy: 2-Circle Venn Overlap
  {
    id: 'flow-strat-venn-2-circle',
    name: "Strategy: 2-Circle Venn Overlap",
    category: 'Flow & Diagrams',
    description: "Two intersecting strategic circles with adjustable center-to-center overlap distance.",
    iconName: 'Circles',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle circle radius (%) (28-44)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "2-Set Venn Overlap" },
      { key: 'overlap', label: "Circle Separation", type: 'number', min: 0.18, max: 0.52, step: 0.01, defaultValue: 0.32 },
      { key: 'radiusScale', label: "Circle Radius (%)", type: 'number', min: 28, max: 44, step: 1, defaultValue: 36 },
    ],
    defaultParams: { label: "2-Set Venn Overlap", overlap: 0.32, radiusScale: 36 },
    jsSourceCode: `// Strategy: 2-Circle Venn Overlap (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.overlap) || 0.32, 0.18, 0.52);
  const v2 = Math.round(helpers.clamp(Number(params.radiusScale) || 36, 28, 44));
  const t1 = (v1 - 0.18) / Math.max(0.001, 0.34);
  const t2 = (v2 - 28) / Math.max(1, 16);
  return [
    { id: 'overlap', label: \`Circle: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'radiusScale', label: \`Circle: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'overlap') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.18, 0.52, t);
    return { ...params, overlap: Number(val.toFixed(2)) };
  }
  if (id === 'radiusScale') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, radiusScale: Math.round(helpers.lerp(28, 44, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.radiusScale) || 36);
  const next = cur >= 44 ? 28 : cur + 1;
  return { ...params, radiusScale: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.overlap) || 0.32, 0.18, 0.52);
  const v2 = Math.round(helpers.clamp(Number(params.radiusScale) || 36, 28, 44));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const sep = width * v1 * 0.5;
  const r = Math.min(width, height) * (v2 / 100);
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx - sep, cy, r, r), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx + sep, cy, r, r), closed: true });
  return paths;
}`,
  },

  // 264. Strategy: 3-Circle Venn Triad
  {
    id: 'flow-strat-venn-3-circle',
    name: "Strategy: 3-Circle Venn Triad",
    category: 'Flow & Diagrams',
    description: "Three mutually intersecting circles (Desirability, Feasibility, Viability) with central sweet-spot.",
    iconName: 'Orbit',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle circle size (%) (26-38)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "3-Set Venn Triad" },
      { key: 'spread', label: "Triad Spread Radius", type: 'number', min: 0.12, max: 0.28, step: 0.01, defaultValue: 0.19 },
      { key: 'rScale', label: "Circle Size (%)", type: 'number', min: 26, max: 38, step: 1, defaultValue: 32 },
    ],
    defaultParams: { label: "3-Set Venn Triad", spread: 0.19, rScale: 32 },
    jsSourceCode: `// Strategy: 3-Circle Venn Triad (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.spread) || 0.19, 0.12, 0.28);
  const v2 = Math.round(helpers.clamp(Number(params.rScale) || 32, 26, 38));
  const t1 = (v1 - 0.12) / Math.max(0.001, 0.16000000000000003);
  const t2 = (v2 - 26) / Math.max(1, 12);
  return [
    { id: 'spread', label: \`Triad: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'rScale', label: \`Circle: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'spread') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.12, 0.28, t);
    return { ...params, spread: Number(val.toFixed(2)) };
  }
  if (id === 'rScale') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, rScale: Math.round(helpers.lerp(26, 38, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.rScale) || 32);
  const next = cur >= 38 ? 26 : cur + 1;
  return { ...params, rScale: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.spread) || 0.19, 0.12, 0.28);
  const v2 = Math.round(helpers.clamp(Number(params.rScale) || 32, 26, 38));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const sp = Math.min(width, height) * v1;
  const r = Math.min(width, height) * (v2 / 100);
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  for (let i = 0; i < 3; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 3;
    paths.push({ nodes: helpers.ellipsePath(cx + Math.cos(a) * sp, cy + Math.sin(a) * sp, r, r), closed: true });
  }
  return paths;
}`,
  },

  // 265. Strategy: 4-Circle Ikigai Intersection
  {
    id: 'flow-strat-ikigai-4-petal',
    name: "Strategy: 4-Circle Ikigai Intersection",
    category: 'Flow & Diagrams',
    description: "Four cardinal overlapping circles forming a symmetric 4-petal strategic convergence flower.",
    iconName: 'Flower2',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle center bullseye dot (4-12)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "4-Set Ikigai Map" },
      { key: 'spread', label: "Petal Offset Radius", type: 'number', min: 0.12, max: 0.26, step: 0.01, defaultValue: 0.18 },
      { key: 'coreDot', label: "Center Bullseye Dot", type: 'number', min: 4, max: 12, step: 1, defaultValue: 7 },
    ],
    defaultParams: { label: "4-Set Ikigai Map", spread: 0.18, coreDot: 7 },
    jsSourceCode: `// Strategy: 4-Circle Ikigai Intersection (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.spread) || 0.18, 0.12, 0.26);
  const v2 = Math.round(helpers.clamp(Number(params.coreDot) || 7, 4, 12));
  const t1 = (v1 - 0.12) / Math.max(0.001, 0.14);
  const t2 = (v2 - 4) / Math.max(1, 8);
  return [
    { id: 'spread', label: \`Petal: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'coreDot', label: \`Center: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'spread') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.12, 0.26, t);
    return { ...params, spread: Number(val.toFixed(2)) };
  }
  if (id === 'coreDot') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, coreDot: Math.round(helpers.lerp(4, 12, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.coreDot) || 7);
  const next = cur >= 12 ? 4 : cur + 1;
  return { ...params, coreDot: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.spread) || 0.18, 0.12, 0.26);
  const v2 = Math.round(helpers.clamp(Number(params.coreDot) || 7, 4, 12));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const sp = Math.min(width, height) * v1;
  const r = Math.min(width, height) * 0.28;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 6), closed: true });
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    paths.push({ nodes: helpers.ellipsePath(cx + Math.cos(a) * sp, cy + Math.sin(a) * sp, r, r), closed: true });
  }
  paths.push({ nodes: helpers.ellipsePath(cx, cy, v2, v2), closed: true });
  return paths;
}`,
  },

  // 266. Strategy: N-Tier Strategy Pyramid
  {
    id: 'flow-strat-pyramid-hierarchy',
    name: "Strategy: N-Tier Strategy Pyramid",
    category: 'Flow & Diagrams',
    description: "Triangular hierarchy sliced into horizontal strata from foundational base to executive vision apex.",
    iconName: 'Triangle',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle pyramid strata tiers (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Strategy Pyramid" },
      { key: 'topTrunc', label: "Apex Flat Width", type: 'number', min: 0, max: 0.28, step: 0.01, defaultValue: 0.06 },
      { key: 'tiers', label: "Pyramid Strata Tiers", type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Strategy Pyramid", topTrunc: 0.06, tiers: 4 },
    jsSourceCode: `// Strategy: N-Tier Strategy Pyramid (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.topTrunc) || 0.06, 0, 0.28);
  const v2 = Math.round(helpers.clamp(Number(params.tiers) || 4, 3, 6));
  const t1 = (v1 - 0) / Math.max(0.001, 0.28);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'topTrunc', label: \`Apex: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'tiers', label: \`Pyramid: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'topTrunc') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0, 0.28, t);
    return { ...params, topTrunc: Number(val.toFixed(2)) };
  }
  if (id === 'tiers') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, tiers: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.tiers) || 4);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, tiers: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.topTrunc) || 0.06, 0, 0.28);
  const v2 = Math.round(helpers.clamp(Number(params.tiers) || 4, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const topW = width * v1;
  paths.push({ nodes: helpers.polygonPath([{ x: cx - topW / 2, y: 0 }, { x: cx + topW / 2, y: 0 }, { x: width, y: height }, { x: 0, y: height }]), closed: true });
  for (let i = 1; i < v2; i++) {
    const t = i / v2;
    const y = height * t;
    const hw = helpers.lerp(topW / 2, width / 2, t);
    paths.push({ nodes: helpers.polygonPath([{ x: cx - hw, y }, { x: cx + hw, y }], false), closed: false });
  }
  return paths;
}`,
  },

  // 267. Strategy: Growth Flywheel / Inverted Funnel
  {
    id: 'flow-strat-inverted-funnel',
    name: "Strategy: Growth Flywheel / Inverted Funnel",
    category: 'Flow & Diagrams',
    description: "Inverted expanding trapezoidal funnel showing land-and-expand account revenue growth.",
    iconName: 'Filter',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle expansion stages (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Expansion Funnel" },
      { key: 'topRatio', label: "Seed Top Width Ratio", type: 'number', min: 0.26, max: 0.65, step: 0.01, defaultValue: 0.42 },
      { key: 'stages', label: "Expansion Stages", type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Expansion Funnel", topRatio: 0.42, stages: 4 },
    jsSourceCode: `// Strategy: Growth Flywheel / Inverted Funnel (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.topRatio) || 0.42, 0.26, 0.65);
  const v2 = Math.round(helpers.clamp(Number(params.stages) || 4, 3, 6));
  const t1 = (v1 - 0.26) / Math.max(0.001, 0.39);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'topRatio', label: \`Seed: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'stages', label: \`Expansion: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'topRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.26, 0.65, t);
    return { ...params, topRatio: Number(val.toFixed(2)) };
  }
  if (id === 'stages') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, stages: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.stages) || 4);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, stages: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.topRatio) || 0.42, 0.26, 0.65);
  const v2 = Math.round(helpers.clamp(Number(params.stages) || 4, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const tw = width * v1;
  paths.push({ nodes: helpers.polygonPath([{ x: cx - tw / 2, y: 0 }, { x: cx + tw / 2, y: 0 }, { x: width, y: height }, { x: 0, y: height }]), closed: true });
  for (let i = 1; i < v2; i++) {
    const t = i / v2;
    const y = height * t;
    const hw = helpers.lerp(tw / 2, width / 2, t);
    paths.push({ nodes: helpers.polygonPath([{ x: cx - hw, y }, { x: cx + hw, y }], false), closed: false });
  }
  return paths;
}`,
  },

  // 268. Strategy: 4-Stage Momentum Flywheel
  {
    id: 'flow-strat-flywheel-cycle',
    name: "Strategy: 4-Stage Momentum Flywheel",
    category: 'Flow & Diagrams',
    description: "Concentric momentum flywheel ring with 4 directional tangent arrow fins and center hub.",
    iconName: 'RefreshCw',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle directional fins (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Growth Flywheel" },
      { key: 'innerRatio', label: "Inner Ring Ratio", type: 'number', min: 0.42, max: 0.72, step: 0.01, defaultValue: 0.56 },
      { key: 'fins', label: "Directional Fins", type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Growth Flywheel", innerRatio: 0.56, fins: 4 },
    jsSourceCode: `// Strategy: 4-Stage Momentum Flywheel (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.innerRatio) || 0.56, 0.42, 0.72);
  const v2 = Math.round(helpers.clamp(Number(params.fins) || 4, 3, 6));
  const t1 = (v1 - 0.42) / Math.max(0.001, 0.3);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'innerRatio', label: \`Inner: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'fins', label: \`Directional: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'innerRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.42, 0.72, t);
    return { ...params, innerRatio: Number(val.toFixed(2)) };
  }
  if (id === 'fins') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, fins: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.fins) || 4);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, fins: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.innerRatio) || 0.56, 0.42, 0.72);
  const v2 = Math.round(helpers.clamp(Number(params.fins) || 4, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const r = Math.min(width, height) * 0.45;
  const ri = r * v1;
  paths.push({ nodes: helpers.ellipsePath(cx, cy, r, r), closed: true });
  paths.push({ nodes: helpers.ellipsePath(cx, cy, ri, ri), closed: true });
  for (let i = 0; i < v2; i++) {
    const a = (i * Math.PI * 2) / v2;
    paths.push({ nodes: helpers.polygonPath([{ x: cx + Math.cos(a) * ri, y: cy + Math.sin(a) * ri }, { x: cx + Math.cos(a + 0.25) * r, y: cy + Math.sin(a + 0.25) * r }], false), closed: false });
  }
  return paths;
}`,
  },

  // 269. Strategy: Bowtie Acquisition-Expansion Funnel
  {
    id: 'flow-strat-bowtie-funnel',
    name: "Strategy: Bowtie Acquisition-Expansion Funnel",
    category: 'Flow & Diagrams',
    description: "Left acquisition funnel converging to central activation waist and expanding into right LTV cone.",
    iconName: 'Minimize2',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle vertical stage slices (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Bowtie SaaS Funnel" },
      { key: 'waistRatio', label: "Commit Waist Height", type: 'number', min: 0.12, max: 0.44, step: 0.01, defaultValue: 0.24 },
      { key: 'stages', label: "Vertical Stage Slices", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Bowtie SaaS Funnel", waistRatio: 0.24, stages: 3 },
    jsSourceCode: `// Strategy: Bowtie Acquisition-Expansion Funnel (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.waistRatio) || 0.24, 0.12, 0.44);
  const v2 = Math.round(helpers.clamp(Number(params.stages) || 3, 2, 4));
  const t1 = (v1 - 0.12) / Math.max(0.001, 0.32);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'waistRatio', label: \`Commit: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'stages', label: \`Vertical: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'waistRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.12, 0.44, t);
    return { ...params, waistRatio: Number(val.toFixed(2)) };
  }
  if (id === 'stages') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, stages: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.stages) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, stages: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.waistRatio) || 0.24, 0.12, 0.44);
  const v2 = Math.round(helpers.clamp(Number(params.stages) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const wh = height * v1;
  paths.push({ nodes: helpers.polygonPath([
    { x: 0, y: 0 }, { x: cx, y: cy - wh }, { x: width, y: 0 },
    { x: width, y: height }, { x: cx, y: cy + wh }, { x: 0, y: height }
  ]), closed: true });
  for (let i = 1; i <= v2; i++) {
    const dx = (cx * i) / (v2 + 1);
    const hSpan = helpers.lerp(height / 2, wh, i / (v2 + 1));
    paths.push({ nodes: helpers.polygonPath([{ x: dx, y: cy - hSpan }, { x: dx, y: cy + hSpan }], false), closed: false });
    paths.push({ nodes: helpers.polygonPath([{ x: width - dx, y: cy - hSpan }, { x: width - dx, y: cy + hSpan }], false), closed: false });
  }
  return paths;
}`,
  },

  // 270. Strategy: OKR Objective -> Key Results
  {
    id: 'flow-strat-okr-cascade-tree',
    name: "Strategy: OKR Objective -> Key Results",
    category: 'Flow & Diagrams',
    description: "Left strategic Objective pillar branching orthogonally to N measurable Key Result progress bars.",
    iconName: 'Target',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle key result rows (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "OKR Cascade" },
      { key: 'objWidth', label: "Objective Card Width", type: 'number', min: 0.24, max: 0.44, step: 0.01, defaultValue: 0.32 },
      { key: 'krs', label: "Key Result Rows", type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "OKR Cascade", objWidth: 0.32, krs: 3 },
    jsSourceCode: `// Strategy: OKR Objective -> Key Results (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.objWidth) || 0.32, 0.24, 0.44);
  const v2 = Math.round(helpers.clamp(Number(params.krs) || 3, 2, 5));
  const t1 = (v1 - 0.24) / Math.max(0.001, 0.2);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'objWidth', label: \`Objective: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'krs', label: \`Key: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'objWidth') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.24, 0.44, t);
    return { ...params, objWidth: Number(val.toFixed(2)) };
  }
  if (id === 'krs') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, krs: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.krs) || 3);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, krs: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.objWidth) || 0.32, 0.24, 0.44);
  const v2 = Math.round(helpers.clamp(Number(params.krs) || 3, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const ow = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 5), closed: true });
  paths.push({ nodes: helpers.rectPath(pad, pad, ow, height - pad * 2, 4), closed: true });
  const kh = (height - pad * 2) / v2;
  const kx = pad * 2 + ow + 8;
  for (let i = 0; i < v2; i++) {
    const ky = pad + i * kh;
    paths.push({ nodes: helpers.polygonPath([{ x: pad + ow, y: cy }, { x: kx, y: ky + kh * 0.38 }], false), closed: false });
    paths.push({ nodes: helpers.rectPath(kx, ky, width - kx - pad, kh * 0.74, 3), closed: true });
  }
  return paths;
}`,
  },

  // 271. Strategy: North Star Metric Driver Tree
  {
    id: 'flow-strat-north-star-tree',
    name: "Strategy: North Star Metric Driver Tree",
    category: 'Flow & Diagrams',
    description: "Top North Star KPI badge cascading into level-1 input metrics and level-2 operational levers.",
    iconName: 'Star',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle input metric branches (2-4)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "North Star Tree" },
      { key: 'topH', label: "North Star Box Height", type: 'number', min: 0.18, max: 0.32, step: 0.01, defaultValue: 0.24 },
      { key: 'drivers', label: "Input Metric Branches", type: 'number', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "North Star Tree", topH: 0.24, drivers: 3 },
    jsSourceCode: `// Strategy: North Star Metric Driver Tree (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.topH) || 0.24, 0.18, 0.32);
  const v2 = Math.round(helpers.clamp(Number(params.drivers) || 3, 2, 4));
  const t1 = (v1 - 0.18) / Math.max(0.001, 0.14);
  const t2 = (v2 - 2) / Math.max(1, 2);
  return [
    { id: 'topH', label: \`North: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'drivers', label: \`Input: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'topH') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.18, 0.32, t);
    return { ...params, topH: Number(val.toFixed(2)) };
  }
  if (id === 'drivers') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, drivers: Math.round(helpers.lerp(2, 4, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.drivers) || 3);
  const next = cur >= 4 ? 2 : cur + 1;
  return { ...params, drivers: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.topH) || 0.24, 0.18, 0.32);
  const v2 = Math.round(helpers.clamp(Number(params.drivers) || 3, 2, 4));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const th = height * v1;
  paths.push({ nodes: helpers.rectPath(cx - width * 0.22, 0, width * 0.44, th, 4), closed: true });
  const dw = (width - (v2 - 1) * 8) / v2;
  const my = height * 0.56;
  for (let i = 0; i < v2; i++) {
    const dx = i * (dw + 8);
    paths.push({ nodes: helpers.polygonPath([{ x: cx, y: th }, { x: dx + dw / 2, y: my }], false), closed: false });
    paths.push({ nodes: helpers.rectPath(dx, my, dw, height - my, 3), closed: true });
  }
  return paths;
}`,
  },

  // 272. Strategy: RACI Responsibility Matrix
  {
    id: 'flow-strat-raci-matrix-card',
    name: "Strategy: RACI Responsibility Matrix",
    category: 'Flow & Diagrams',
    description: "Governance responsibility grid mapping workstreams against stakeholder roles with R/A/C/I badges.",
    iconName: 'Table',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle role columns (3-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "RACI Matrix" },
      { key: 'taskCol', label: "Task Column Width", type: 'number', min: 0.22, max: 0.42, step: 0.01, defaultValue: 0.3 },
      { key: 'roles', label: "Role Columns", type: 'number', min: 3, max: 5, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "RACI Matrix", taskCol: 0.3, roles: 4 },
    jsSourceCode: `// Strategy: RACI Responsibility Matrix (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.taskCol) || 0.3, 0.22, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.roles) || 4, 3, 5));
  const t1 = (v1 - 0.22) / Math.max(0.001, 0.19999999999999998);
  const t2 = (v2 - 3) / Math.max(1, 2);
  return [
    { id: 'taskCol', label: \`Task: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'roles', label: \`Role: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'taskCol') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.22, 0.42, t);
    return { ...params, taskCol: Number(val.toFixed(2)) };
  }
  if (id === 'roles') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, roles: Math.round(helpers.lerp(3, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.roles) || 4);
  const next = cur >= 5 ? 3 : cur + 1;
  return { ...params, roles: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.taskCol) || 0.3, 0.22, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.roles) || 4, 3, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const tw = width * v1;
  const hh = height * 0.22;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 3), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: hh }, { x: width, y: hh }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: tw, y: 0 }, { x: tw, y: height }], false), closed: false });
  const cw = (width - tw) / v2;
  for (let c = 0; c < v2; c++) {
    const x = tw + (c + 0.5) * cw;
    paths.push({ nodes: helpers.ellipsePath(x, hh + (height - hh) * 0.35, 5, 5), closed: true });
    paths.push({ nodes: helpers.ellipsePath(x, hh + (height - hh) * 0.72, 5, 5), closed: true });
  }
  return paths;
}`,
  },

  // 273. Strategy: 5×5 Risk Likelihood × Impact
  {
    id: 'flow-strat-risk-heatmap-grid',
    name: "Strategy: 5×5 Risk Likelihood × Impact",
    category: 'Flow & Diagrams',
    description: "Likelihood vs Impact risk matrix grid with stepped critical-severity threshold boundary.",
    iconName: 'Flame',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle matrix dimension (n×n) (3-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "5×5 Risk Heatmap" },
      { key: 'critZone', label: "Critical Zone Ratio", type: 'number', min: 0.3, max: 0.65, step: 0.01, defaultValue: 0.45 },
      { key: 'gridN', label: "Matrix Dimension (N×N)", type: 'number', min: 3, max: 5, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "5×5 Risk Heatmap", critZone: 0.45, gridN: 4 },
    jsSourceCode: `// Strategy: 5×5 Risk Likelihood × Impact (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.critZone) || 0.45, 0.3, 0.65);
  const v2 = Math.round(helpers.clamp(Number(params.gridN) || 4, 3, 5));
  const t1 = (v1 - 0.3) / Math.max(0.001, 0.35000000000000003);
  const t2 = (v2 - 3) / Math.max(1, 2);
  return [
    { id: 'critZone', label: \`Critical: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'gridN', label: \`Matrix: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'critZone') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.3, 0.65, t);
    return { ...params, critZone: Number(val.toFixed(2)) };
  }
  if (id === 'gridN') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, gridN: Math.round(helpers.lerp(3, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.gridN) || 4);
  const next = cur >= 5 ? 3 : cur + 1;
  return { ...params, gridN: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.critZone) || 0.45, 0.3, 0.65);
  const v2 = Math.round(helpers.clamp(Number(params.gridN) || 4, 3, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const cz = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 3), closed: true });
  for (let i = 1; i < v2; i++) {
    paths.push({ nodes: helpers.polygonPath([{ x: (width * i) / v2, y: 0 }, { x: (width * i) / v2, y: height }], false), closed: false });
    paths.push({ nodes: helpers.polygonPath([{ x: 0, y: (height * i) / v2 }, { x: width, y: (height * i) / v2 }], false), closed: false });
  }
  paths.push({ nodes: helpers.rectPath(width - cz, 0, cz, height * 0.45, 2), closed: true });
  return paths;
}`,
  },

  // 274. Strategy: Evolution vs Visibility Map
  {
    id: 'flow-strat-wardley-value-map',
    name: "Strategy: Evolution vs Visibility Map",
    category: 'Flow & Diagrams',
    description: "Visibility Y-axis and 4-stage Evolution X-axis (Genesis to Commodity) with linked value-chain nodes.",
    iconName: 'Compass',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle value chain nodes (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Wardley Value Map" },
      { key: 'chainSpread', label: "Value Chain Span", type: 'number', min: 0.4, max: 0.82, step: 0.01, defaultValue: 0.65 },
      { key: 'nodes', label: "Value Chain Nodes", type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Wardley Value Map", chainSpread: 0.65, nodes: 4 },
    jsSourceCode: `// Strategy: Evolution vs Visibility Map (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.chainSpread) || 0.65, 0.4, 0.82);
  const v2 = Math.round(helpers.clamp(Number(params.nodes) || 4, 3, 6));
  const t1 = (v1 - 0.4) / Math.max(0.001, 0.41999999999999993);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'chainSpread', label: \`Value: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'nodes', label: \`Value: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'chainSpread') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.4, 0.82, t);
    return { ...params, chainSpread: Number(val.toFixed(2)) };
  }
  if (id === 'nodes') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, nodes: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.nodes) || 4);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, nodes: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.chainSpread) || 0.65, 0.4, 0.82);
  const v2 = Math.round(helpers.clamp(Number(params.nodes) || 4, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const sp = width * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: pad * 1.4, y: pad }, { x: pad * 1.4, y: height - pad * 1.4 }, { x: width - pad, y: height - pad * 1.4 }], false), closed: false });
  const pts = [];
  for (let i = 0; i < v2; i++) {
    const nx = pad * 2.2 + (i * sp) / Math.max(1, v2 - 1);
    const ny = pad * 1.8 + (i * (height - pad * 3.8)) / Math.max(1, v2 - 1);
    pts.push({ x: nx, y: ny });
    paths.push({ nodes: helpers.ellipsePath(nx, ny, 5.5, 5.5), closed: true });
  }
  paths.push({ nodes: helpers.polygonPath(pts, false), closed: false });
  return paths;
}`,
  },

  // 275. Strategy: 9-Block Business Model Canvas
  {
    id: 'flow-strat-business-model-canvas',
    name: "Strategy: 9-Block Business Model Canvas",
    category: 'Flow & Diagrams',
    description: "Osterwalder 9-block strategic canvas (Partners, Activities, Resources, Value Prop, Segments, Cost, Rev).",
    iconName: 'Layout',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle value prop width (%) (16-28)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Business Model Canvas" },
      { key: 'bottomRatio', label: "Cost/Revenue Height", type: 'number', min: 0.2, max: 0.42, step: 0.01, defaultValue: 0.28 },
      { key: 'midWidth', label: "Value Prop Width (%)", type: 'number', min: 16, max: 28, step: 1, defaultValue: 20 },
    ],
    defaultParams: { label: "Business Model Canvas", bottomRatio: 0.28, midWidth: 20 },
    jsSourceCode: `// Strategy: 9-Block Business Model Canvas (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.bottomRatio) || 0.28, 0.2, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.midWidth) || 20, 16, 28));
  const t1 = (v1 - 0.2) / Math.max(0.001, 0.21999999999999997);
  const t2 = (v2 - 16) / Math.max(1, 12);
  return [
    { id: 'bottomRatio', label: \`Cost/Revenue: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'midWidth', label: \`Value: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'bottomRatio') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.2, 0.42, t);
    return { ...params, bottomRatio: Number(val.toFixed(2)) };
  }
  if (id === 'midWidth') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, midWidth: Math.round(helpers.lerp(16, 28, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.midWidth) || 20);
  const next = cur >= 28 ? 16 : cur + 1;
  return { ...params, midWidth: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.bottomRatio) || 0.28, 0.2, 0.42);
  const v2 = Math.round(helpers.clamp(Number(params.midWidth) || 20, 16, 28));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const by = height * (1 - v1);
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 3), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: by }, { x: width, y: by }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: cx, y: by }, { x: cx, y: height }], false), closed: false });
  const mw = (v2 / 100) * width;
  const sideW = (width - mw) / 4;
  const cols = [sideW, sideW * 2, width - sideW * 2, width - sideW];
  for (const x of cols) {
    paths.push({ nodes: helpers.polygonPath([{ x, y: 0 }, { x, y: by }], false), closed: false });
  }
  paths.push({ nodes: helpers.polygonPath([{ x: cols[0], y: by * 0.5 }, { x: cols[1], y: by * 0.5 }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: cols[2], y: by * 0.5 }, { x: cols[3], y: by * 0.5 }], false), closed: false });
  return paths;
}`,
  },

  // 276. Strategy: Customer Journey Emotion Curve
  {
    id: 'flow-strat-customer-journey-wave',
    name: "Strategy: Customer Journey Emotion Curve",
    category: 'Flow & Diagrams',
    description: "Multi-stage customer journey columns overlaid with sinusoidal emotional peak/valley experience curve.",
    iconName: 'Activity',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle journey stages (3-6)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Journey Sentiment" },
      { key: 'waveAmp', label: "Sentiment Wave Amp", type: 'number', min: 0.14, max: 0.36, step: 0.01, defaultValue: 0.25 },
      { key: 'stages', label: "Journey Stages", type: 'number', min: 3, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParams: { label: "Journey Sentiment", waveAmp: 0.25, stages: 4 },
    jsSourceCode: `// Strategy: Customer Journey Emotion Curve (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.waveAmp) || 0.25, 0.14, 0.36);
  const v2 = Math.round(helpers.clamp(Number(params.stages) || 4, 3, 6));
  const t1 = (v1 - 0.14) / Math.max(0.001, 0.21999999999999997);
  const t2 = (v2 - 3) / Math.max(1, 3);
  return [
    { id: 'waveAmp', label: \`Sentiment: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'stages', label: \`Journey: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'waveAmp') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.14, 0.36, t);
    return { ...params, waveAmp: Number(val.toFixed(2)) };
  }
  if (id === 'stages') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, stages: Math.round(helpers.lerp(3, 6, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.stages) || 4);
  const next = cur >= 6 ? 3 : cur + 1;
  return { ...params, stages: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.waveAmp) || 0.25, 0.14, 0.36);
  const v2 = Math.round(helpers.clamp(Number(params.stages) || 4, 3, 6));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const amp = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  for (let i = 1; i < v2; i++) {
    paths.push({ nodes: helpers.polygonPath([{ x: (width * i) / v2, y: 0 }, { x: (width * i) / v2, y: height }], false), closed: false });
  }
  const pts = [];
  for (let i = 0; i < v2; i++) {
    const px = ((i + 0.5) * width) / v2;
    const py = cy + (i % 2 === 0 ? -amp : amp);
    pts.push({ x: px, y: py });
    paths.push({ nodes: helpers.ellipsePath(px, py, 5, 5), closed: true });
  }
  paths.push({ nodes: helpers.polygonPath(pts, false), closed: false });
  return paths;
}`,
  },

  // 277. Strategy: Service Blueprint (Front/Backstage)
  {
    id: 'flow-strat-service-blueprint',
    name: "Strategy: Service Blueprint (Front/Backstage)",
    category: 'Flow & Diagrams',
    description: "Horizontal Customer, Frontstage, Backstage, and Support lanes separated by Line of Visibility.",
    iconName: 'Layers',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle vertical sync links (2-5)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Service Blueprint" },
      { key: 'visY', label: "Line of Visibility Y", type: 'number', min: 0.38, max: 0.65, step: 0.01, defaultValue: 0.5 },
      { key: 'touchpoints', label: "Vertical Sync Links", type: 'number', min: 2, max: 5, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "Service Blueprint", visY: 0.5, touchpoints: 3 },
    jsSourceCode: `// Strategy: Service Blueprint (Front/Backstage) (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.visY) || 0.5, 0.38, 0.65);
  const v2 = Math.round(helpers.clamp(Number(params.touchpoints) || 3, 2, 5));
  const t1 = (v1 - 0.38) / Math.max(0.001, 0.27);
  const t2 = (v2 - 2) / Math.max(1, 3);
  return [
    { id: 'visY', label: \`Line: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'touchpoints', label: \`Vertical: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'visY') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.38, 0.65, t);
    return { ...params, visY: Number(val.toFixed(2)) };
  }
  if (id === 'touchpoints') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, touchpoints: Math.round(helpers.lerp(2, 5, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.touchpoints) || 3);
  const next = cur >= 5 ? 2 : cur + 1;
  return { ...params, touchpoints: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.visY) || 0.5, 0.38, 0.65);
  const v2 = Math.round(helpers.clamp(Number(params.touchpoints) || 3, 2, 5));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const vy = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: vy * 0.5 }, { x: width, y: vy * 0.5 }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: vy }, { x: width, y: vy }], false), closed: false });
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: vy + (height - vy) * 0.5 }, { x: width, y: vy + (height - vy) * 0.5 }], false), closed: false });
  for (let i = 0; i < v2; i++) {
    const tx = helpers.lerp(width * 0.22, width * 0.78, i / Math.max(1, v2 - 1));
    paths.push({ nodes: helpers.rectPath(tx - 10, vy * 0.58, 20, vy * 0.32, 2), closed: true });
    paths.push({ nodes: helpers.rectPath(tx - 10, vy + 6, 20, (height - vy) * 0.34, 2), closed: true });
  }
  return paths;
}`,
  },

  // 278. Strategy: Design Thinking Double Diamond
  {
    id: 'flow-strat-double-diamond',
    name: "Strategy: Design Thinking Double Diamond",
    category: 'Flow & Diagrams',
    description: "Design Council Double Diamond (Discover -> Define -> Develop -> Deliver) meeting at central brief.",
    iconName: 'Diamond',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle diamond span height (60-95)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Double Diamond" },
      { key: 'midX', label: "Center Convergence X", type: 'number', min: 0.38, max: 0.62, step: 0.01, defaultValue: 0.5 },
      { key: 'heightRatio', label: "Diamond Span Height", type: 'number', min: 60, max: 95, step: 1, defaultValue: 82 },
    ],
    defaultParams: { label: "Double Diamond", midX: 0.5, heightRatio: 82 },
    jsSourceCode: `// Strategy: Design Thinking Double Diamond (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.midX) || 0.5, 0.38, 0.62);
  const v2 = Math.round(helpers.clamp(Number(params.heightRatio) || 82, 60, 95));
  const t1 = (v1 - 0.38) / Math.max(0.001, 0.24);
  const t2 = (v2 - 60) / Math.max(1, 35);
  return [
    { id: 'midX', label: \`Center: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'heightRatio', label: \`Diamond: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'midX') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.38, 0.62, t);
    return { ...params, midX: Number(val.toFixed(2)) };
  }
  if (id === 'heightRatio') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, heightRatio: Math.round(helpers.lerp(60, 95, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.heightRatio) || 82);
  const next = cur >= 95 ? 60 : cur + 1;
  return { ...params, heightRatio: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.midX) || 0.5, 0.38, 0.62);
  const v2 = Math.round(helpers.clamp(Number(params.heightRatio) || 82, 60, 95));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const mx = width * v1;
  const hh = (height * (v2 / 100)) / 2;
  paths.push({ nodes: helpers.polygonPath([{ x: 0, y: cy }, { x: mx * 0.5, y: cy - hh }, { x: mx, y: cy }, { x: mx * 0.5, y: cy + hh }]), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: mx, y: cy }, { x: mx + (width - mx) * 0.5, y: cy - hh }, { x: width, y: cy }, { x: mx + (width - mx) * 0.5, y: cy + hh }]), closed: true });
  paths.push({ nodes: helpers.polygonPath([{ x: mx, y: 4 }, { x: mx, y: height - 4 }], false), closed: false });
  return paths;
}`,
  },

  // 279. Strategy: Three Horizons S-Curves
  {
    id: 'flow-strat-horizon-123-curve',
    name: "Strategy: Three Horizons S-Curves",
    category: 'Flow & Diagrams',
    description: "McKinsey Three Horizons framework plotting H1 Core, H2 Emerging, and H3 Disruptive S-curves.",
    iconName: 'TrendingUp',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle plotted horizons (2-3)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "3 Horizons S-Curves" },
      { key: 'steepness', label: "S-Curve Lift Ratio", type: 'number', min: 0.45, max: 0.88, step: 0.01, defaultValue: 0.68 },
      { key: 'horizons', label: "Plotted Horizons", type: 'number', min: 2, max: 3, step: 1, defaultValue: 3 },
    ],
    defaultParams: { label: "3 Horizons S-Curves", steepness: 0.68, horizons: 3 },
    jsSourceCode: `// Strategy: Three Horizons S-Curves (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.steepness) || 0.68, 0.45, 0.88);
  const v2 = Math.round(helpers.clamp(Number(params.horizons) || 3, 2, 3));
  const t1 = (v1 - 0.45) / Math.max(0.001, 0.43);
  const t2 = (v2 - 2) / Math.max(1, 1);
  return [
    { id: 'steepness', label: \`S-Curve: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'horizons', label: \`Plotted: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'steepness') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.45, 0.88, t);
    return { ...params, steepness: Number(val.toFixed(2)) };
  }
  if (id === 'horizons') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, horizons: Math.round(helpers.lerp(2, 3, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.horizons) || 3);
  const next = cur >= 3 ? 2 : cur + 1;
  return { ...params, horizons: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.steepness) || 0.68, 0.45, 0.88);
  const v2 = Math.round(helpers.clamp(Number(params.horizons) || 3, 2, 3));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const lift = height * v1;
  paths.push({ nodes: helpers.rectPath(0, 0, width, height, 4), closed: true });
  for (let h = 0; h < v2; h++) {
    const startX = pad + h * (width * 0.22);
    const endX = width - pad - (v2 - 1 - h) * (width * 0.12);
    const topY = height - pad - lift * (1 - h * 0.16);
    paths.push({ nodes: [
      helpers.cornerNode(startX, height - pad),
      helpers.smoothNode(endX, topY, (startX + endX) / 2, height - pad, (startX + endX) / 2, topY)
    ], closed: false });
  }
  return paths;
}`,
  },

  // 280. Strategy: Multi-Axis Capability Radar
  {
    id: 'flow-strat-radar-spider-web',
    name: "Strategy: Multi-Axis Capability Radar",
    category: 'Flow & Diagrams',
    description: "Concentric spider-web polygons with radial capability axes and asymmetric plotted score polygon.",
    iconName: 'Radar',
    isBuiltIn: true,
    previewInteractive: true,
    previewHint: 'Click in Preview Mode to cycle radar spokes (5-8)',
    paramSchema: [
      { key: 'label', label: 'Centered Node Text', type: 'string', defaultValue: "Capability Radar" },
      { key: 'scoreScale', label: "Capability Score Span", type: 'number', min: 0.45, max: 0.9, step: 0.01, defaultValue: 0.72 },
      { key: 'axes', label: "Radar Spokes", type: 'number', min: 5, max: 8, step: 1, defaultValue: 6 },
    ],
    defaultParams: { label: "Capability Radar", scoreScale: 0.72, axes: 6 },
    jsSourceCode: `// Strategy: Multi-Axis Capability Radar (.jsf)
function getControlPoints(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.scoreScale) || 0.72, 0.45, 0.9);
  const v2 = Math.round(helpers.clamp(Number(params.axes) || 6, 5, 8));
  const t1 = (v1 - 0.45) / Math.max(0.001, 0.45);
  const t2 = (v2 - 5) / Math.max(1, 3);
  return [
    { id: 'scoreScale', label: \`Capability: \${Math.round(v1 * 100) / 100}\`, x: helpers.lerp(width * 0.18, width * 0.82, t1), y: height * 0.16, cursor: 'ew-resize' },
    { id: 'axes', label: \`Radar: \${v2}\`, x: helpers.lerp(width * 0.2, width * 0.8, t2), y: height - 8, cursor: 'ew-resize' }
  ];
}

function onDragControlPoint(id, localX, localY, width, height, params, helpers) {
  if (id === 'scoreScale') {
    const t = helpers.clamp((localX - width * 0.18) / Math.max(1, width * 0.64), 0, 1);
    const val = helpers.lerp(0.45, 0.9, t);
    return { ...params, scoreScale: Number(val.toFixed(2)) };
  }
  if (id === 'axes') {
    const t = helpers.clamp((localX - width * 0.2) / Math.max(1, width * 0.6), 0, 1);
    return { ...params, axes: Math.round(helpers.lerp(5, 8, t)) };
  }
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  const cur = Math.round(Number(params.axes) || 6);
  const next = cur >= 8 ? 5 : cur + 1;
  return { ...params, axes: next };
}

function buildPaths(width, height, params, helpers) {
  const v1 = helpers.clamp(Number(params.scoreScale) || 0.72, 0.45, 0.9);
  const v2 = Math.round(helpers.clamp(Number(params.axes) || 6, 5, 8));
  const cx = width / 2;
  const cy = height / 2;
  const pad = Math.max(6, Math.min(width, height) * 0.06);
  const paths = [];
  const r = Math.min(width, height) * 0.45;
  const outer = [];
  const score = [];
  for (let i = 0; i < v2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / v2;
    outer.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
    const sf = v1 * (i % 2 === 0 ? 0.95 : 0.68);
    score.push({ x: cx + Math.cos(a) * r * sf, y: cy + Math.sin(a) * r * sf });
  }
  paths.push({ nodes: helpers.polygonPath(outer), closed: true });
  paths.push({ nodes: helpers.polygonPath(score), closed: true });
  for (let i = 0; i < v2; i++) {
    paths.push({ nodes: helpers.polygonPath([{ x: cx, y: cy }, outer[i]], false), closed: false });
  }
  return paths;
}`,
  },
];

export const SITEMAP_AND_FLOW_AUTOSHAPES: AutoShapeDefinition[] =
  RAW_SITEMAP_AND_FLOW_AUTOSHAPES.map((shape): AutoShapeDefinition => {
    const hasLabelSchema = shape.paramSchema.some((p) => p.key === 'label');
    const conciseDefault =
      typeof shape.defaultParams.label === 'string'
        ? shape.defaultParams.label
        : shape.name
            .replace(/^(Sitemap|Flowchart|Flow):\s*/i, '')
            .replace(/\s+Node$/i, '')
            .slice(0, 22);
    return {
      ...shape,
      paramSchema: hasLabelSchema
        ? shape.paramSchema
        : [
            {
              key: 'label',
              label: 'Centered Node Text',
              type: 'string',
              defaultValue: conciseDefault,
            },
            ...shape.paramSchema,
          ],
      defaultParams: {
        label: conciseDefault,
        ...shape.defaultParams,
      },
    };
  });

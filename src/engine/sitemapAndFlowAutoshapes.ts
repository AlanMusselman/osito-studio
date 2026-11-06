import type { AutoShapeDefinition } from '../types/editor';

/**
 * 50 Built-In Sitemap, Information Architecture, Wireframe Page & Cloud/System Flow AutoShapes (.jsf)
 * Every AutoShape is parametric (1-3 yellow diamond handles) and Preview-Mode interactive (`onPreviewClick`).
 */
export const SITEMAP_AND_FLOW_AUTOSHAPES: AutoShapeDefinition[] = [
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
  return params;
}

function onPreviewClick(localX, localY, width, height, params) {
  return { ...params, doubleRing: !params.doubleRing };
}

function buildPaths(width, height, params, helpers) {
  const sc = helpers.clamp(Number(params.arrowScale) || 0.46, 0.28, 0.65);
  const doubleRing = params.doubleRing !== false;
  const cx = width / 2;
  const cy = height / 2;
  const len = Math.min(width, height) * sc * 0.55;
  const paths = [{ nodes: helpers.rectPath(0, 0, width, height, 0), closed: true }];
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
];


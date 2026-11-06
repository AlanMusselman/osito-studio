import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const assetsDir = path.join(distDir, 'assets');
const indexPath = path.join(distDir, 'index.html');
const standaloneOutPath = path.join(distDir, 'Osito_Studio_Standalone.html');

if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html not found. Run vite build first.');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');
const assetFiles = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : [];

const cssFile = assetFiles.find((f) => f.endsWith('.css'));
const jsFile = assetFiles.find((f) => f.endsWith('.js'));

if (cssFile) {
  const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');
  html = html.replace(
    /<link[^>]+rel="stylesheet"[^>]+href="[^"]+\.css"[^>]*>/i,
    () => `<style>\n${cssContent}\n</style>`
  );
}

if (jsFile) {
  const rawJs = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8');
  // Escape any literal </script inside JS strings/regexes so HTML parser never closes <script> early
  const safeJs = rawJs.replace(/<\/script/gi, '<\\/script');
  html = html.replace(
    /<script[^>]+src="[^"]+\.js"[^>]*><\/script>/i,
    () => `<script type="module">\n${safeJs}\n</script>`
  );
}

fs.writeFileSync(standaloneOutPath, html, 'utf8');
const sizeKb = (fs.statSync(standaloneOutPath).size / 1024).toFixed(1);
console.log(`✓ Generated zero-server single-file studio: dist/Osito_Studio_Standalone.html (${sizeKb} kB)`);

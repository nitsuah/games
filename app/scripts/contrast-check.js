const fs = require('fs');
const path = require('path');

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  const int = parseInt(hex, 16);
  return [ (int >> 16) & 255, (int >> 8) & 255, int & 255 ];
}

function rgbaStringToRgb(str) {
  const m = str.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(',').map(p => p.trim());
  const r = parseFloat(parts[0]);
  const g = parseFloat(parts[1]);
  const b = parseFloat(parts[2]);
  const a = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
  return { r, g, b, a };
}

function sRGBtoLinear(v) {
  v = v / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function luminanceRgb({ r, g, b }) {
  return 0.2126 * sRGBtoLinear(r) + 0.7152 * sRGBtoLinear(g) + 0.0722 * sRGBtoLinear(b);
}

function contrastRatio(rgb1, rgb2) {
  const L1 = luminanceRgb(rgb1);
  const L2 = luminanceRgb(rgb2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

function findFiles(dir, exts = ['.css']) {
  const out = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const full = path.join(dir, it.name);
    if (it.isDirectory()) out.push(...findFiles(full, exts));
    else if (exts.includes(path.extname(it.name))) out.push(full);
  }
  return out;
}

function parseColors(text) {
  const colors = [];
  const hexRe = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
  let m;
  while ((m = hexRe.exec(text))) colors.push(m[0]);
  const rgbaRe = /rgba?\([^)]+\)/g;
  while ((m = rgbaRe.exec(text))) colors.push(m[0]);
  return Array.from(new Set(colors));
}

function resolveColor(str) {
  if (!str) return null;
  if (str.startsWith('#')) {
    const [r,g,b] = hexToRgb(str);
    return { r, g, b };
  }
  if (str.startsWith('rgb')) {
    const obj = rgbaStringToRgb(str);
    if (!obj) return null;
    // blend against white background if alpha < 1
    if (obj.a < 1) {
      const bg = { r: 255, g: 255, b: 255 };
      const r = Math.round(obj.r * obj.a + bg.r * (1 - obj.a));
      const g = Math.round(obj.g * obj.a + bg.g * (1 - obj.a));
      const b = Math.round(obj.b * obj.a + bg.b * (1 - obj.a));
      return { r, g, b };
    }
    return { r: obj.r, g: obj.g, b: obj.b };
  }
  return null;
}

function main() {
  const appDir = path.join(__dirname, '..');
  const pagesDir = path.join(appDir, 'pages');
  const globalCss = path.join(appDir, 'globals.css');
  let defaultBg = { r: 255, g: 255, b: 255 };
  if (fs.existsSync(globalCss)) {
    const gtxt = fs.readFileSync(globalCss, 'utf8');
  const m = gtxt.match(/background\s*:\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))/);
    if (m) {
      const c = resolveColor(m[1]);
      if (c) defaultBg = c;
    }
  }

  const files = fs.existsSync(pagesDir) ? findFiles(pagesDir, ['.css']) : [];
  if (files.length === 0) {
    console.log('No CSS module files found under app/pages.');
    process.exit(0);
  }

  const issues = [];
  for (const f of files) {
    const txt = fs.readFileSync(f, 'utf8');
    const colors = parseColors(txt);
    for (const col of colors) {
      const fg = resolveColor(col);
      if (!fg) continue;
      // find nearby background declarations in same file
  const bgMatch = txt.match(/background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))/);
      const bg = bgMatch ? resolveColor(bgMatch[1]) : defaultBg;
      const ratio = contrastRatio(fg, bg);
      if (ratio < 4.5) {
        issues.push({ file: path.relative(appDir, f), color: col, bg: bgMatch ? bgMatch[1] : '#ffffff', ratio: ratio.toFixed(2) });
      }
    }
  }

  if (issues.length === 0) {
    console.log('No obvious low-contrast color pairs found (ratio < 4.5).');
    return;
  }

  console.log('Potential low-contrast findings (ratio < 4.5):');
  for (const it of issues) {
    console.log(`- ${it.file}: fg=${it.color} bg=${it.bg} ratio=${it.ratio}`);
  }
}

main();

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
  // Return color declarations along with their position so we can search for a
  // nearby background within the same CSS block (reduces false positives).
  const out = [];
  const colorDeclRe = /color\s*:\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))/g;
  // Only consider explicit 'color' declarations (foreground text color).
  let m;
  while ((m = colorDeclRe.exec(text))) out.push({ color: m[1], index: m.index });
  // Deduplicate by color+index
  const uniq = [];
  const seen = new Set();
  for (const it of out) {
    const key = `${it.color}@${it.index}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniq.push(it);
    }
  }
  return uniq;
}

function resolveColor(str) {
  if (!str) return null;
  if (str.startsWith('#')) {
    const [r,g,b] = hexToRgb(str);
    return { r, g, b, a: 1 };
  }
  if (str.startsWith('rgb')) {
    const obj = rgbaStringToRgb(str);
    if (!obj) return null;
    return { r: obj.r, g: obj.g, b: obj.b, a: obj.a };
  }
  return null;
}

function blendOver(fg, bg) {
  // fg and bg are objects {r,g,b,a} with a optional (default 1)
  const fa = fg.a !== undefined ? fg.a : 1;
  // result = fg * fa + bg * (1 - fa)
  const r = Math.round(fg.r * fa + bg.r * (1 - fa));
  const g = Math.round(fg.g * fa + bg.g * (1 - fa));
  const b = Math.round(fg.b * fa + bg.b * (1 - fa));
  return { r, g, b };
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
    // collect background declarations with positions
    const bgRe = /background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))/g;
    const bgs = [];
    let bm;
    while ((bm = bgRe.exec(txt))) {
      bgs.push({ bg: bm[1], index: bm.index });
    }
    for (const colEntry of colors) {
      const col = colEntry.color;
      const fg = resolveColor(col);
      if (!fg) continue;
      // pick the nearest background declaration in the file (before or after)
      const idx = colEntry.index;
      let nearest = null;
      let nearestDist = Infinity;
      for (const bi of bgs) {
        const d = Math.abs(bi.index - idx);
        if (d < nearestDist) {
          nearest = bi;
          nearestDist = d;
        }
      }
  const rawBg = nearest ? resolveColor(nearest.bg) : defaultBg;
  // if fg or bg have alpha, blend fg over bg (bg default is opaque white)
  const blendedFg = fg.a !== undefined && fg.a < 1 ? blendOver(fg, rawBg) : { r: fg.r, g: fg.g, b: fg.b };
  const blendedBg = rawBg.a !== undefined && rawBg.a < 1 ? blendOver(rawBg, { r: 255, g: 255, b: 255 }) : { r: rawBg.r, g: rawBg.g, b: rawBg.b };
  const ratio = contrastRatio(blendedFg, blendedBg);
      if (ratio < 4.5) {
        issues.push({ file: path.relative(appDir, f), color: col, bg: nearest ? nearest.bg : '#ffffff', ratio: ratio.toFixed(2) });
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

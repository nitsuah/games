const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PAGES_DIR = path.join(ROOT, 'pages');

const r3fPatterns = [
  "@react-three/fiber",
  "@react-three/drei",
  "@react-three/cannon",
  "three",
];

const errors = [];

function walk(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, cb);
    else cb(full);
  }
}

if (!fs.existsSync(PAGES_DIR)) {
  console.log('No pages directory found — skipping prebuild checks.');
  process.exit(0);
}

walk(PAGES_DIR, (file) => {
  const ext = path.extname(file).toLowerCase();
  if (!['.js', '.jsx', '.ts', '.tsx'].includes(ext)) return;
  const content = fs.readFileSync(file, 'utf8');

  // Check for .test. in filename
  if (file.includes('.test.')) {
    errors.push({ file, reason: 'test file found under pages — move to app/tests or remove from pages' });
  }

  // Check for R3F/drei/three/cannon imports (simple textual check)
  for (const p of r3fPatterns) {
    const re = new RegExp("(^|\\n)\\s*import\\s+.*['\"]" + p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "['\"]", 'm');
    if (re.test(content)) {
      errors.push({ file, reason: `imports \"${p}\" — consider moving implementation to app/lib or use client-only dynamic imports` });
    }
  }
});

if (errors.length) {
  console.error('\nPrebuild checks failed: found files in app/pages that look unsafe for prerender:');
  for (const e of errors) {
    console.error(` - ${path.relative(ROOT, e.file)}: ${e.reason}`);
  }
  console.error('\nFix the listed files (move to app/lib or use next/dynamic with { ssr: false }) and rerun the build.');
  process.exit(1);
}

console.log('Prebuild checks passed: no .test. files or direct R3F/drei/three/cannon imports found in app/pages.');
process.exit(0);

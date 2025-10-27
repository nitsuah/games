#!/usr/bin/env node
/*
  generate-icons.js
  Rasterize available SVG favicons into PNG icons for the manifest.
  Uses the open-source `sharp` library (https://www.npmjs.com/package/sharp).

  Usage:
    # install sharp once in app/ with: npm install sharp
    node ./scripts/generate-icons.js
*/
const fs = require('fs');
const path = require('path');

async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (err) {
    console.error('sharp is not installed. Run `npm install sharp` in the app folder and re-run this script.');
    console.error(err && err.message ? err.message : err);
    process.exit(1);
  }

  const publicDir = path.join(__dirname, '..', 'public');
  const svgs = ['favicon-home.svg', 'favicon-asteroid.svg', 'favicon-fps.svg'];

  const srcSvg = svgs.map((s) => path.join(publicDir, s)).find((p) => fs.existsSync(p));
  if (!srcSvg) {
    console.error('No favicon SVG found in app/public. Expected one of:', svgs.join(', '));
    process.exit(1);
  }

  const out192 = path.join(publicDir, 'icon-192.png');
  const out512 = path.join(publicDir, 'icon-512.png');

  try {
    await sharp(srcSvg).resize(192, 192).png().toFile(out192);
    console.log('Wrote', out192);
    await sharp(srcSvg).resize(512, 512).png().toFile(out512);
    console.log('Wrote', out512);
  } catch (err) {
    console.error('Failed to generate icons:', err);
    process.exit(1);
  }
}

main();

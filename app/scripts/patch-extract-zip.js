#!/usr/bin/env node
// Patches extract-zip 2.0.1 to validate symlink targets during zip extraction.
// extract-zip has no patched release; this postinstall script applies the fix
// locally after each npm install / npm ci so node_modules stays safe.
// See: Dependabot alert #121 — extract-zip symlink path traversal.

'use strict';

const fs = require('fs');
const path = require('path');

const pkgFile = path.join(__dirname, '..', 'node_modules', 'extract-zip', 'index.js');

if (!fs.existsSync(pkgFile)) {
  // extract-zip not installed (e.g. production-only install) — nothing to do.
  process.exit(0);
}

let src = fs.readFileSync(pkgFile, 'utf8');

if (src.includes('symlinkFull')) {
  // Already patched — idempotent.
  process.exit(0);
}

// The vulnerable block creates a symlink from zip data without checking whether
// the target escapes the extraction directory.
const VULNERABLE = `      const link = await getStream(readStream)
      debug('creating symlink', link, dest)
      await fs.symlink(link, dest)`;

const PATCHED = `      const link = await getStream(readStream)
      debug('creating symlink', link, dest)
      // Validate symlink target stays within extraction dir (Dependabot #121).
      const symlinkFull = path.resolve(path.dirname(dest), link)
      if (!symlinkFull.startsWith(this.opts.dir + path.sep) && symlinkFull !== this.opts.dir) {
        throw new Error(\`Symlink target "\${link}" in "\${entry.fileName}" is outside the target directory\`)
      }
      await fs.symlink(link, dest)`;

if (!src.includes(VULNERABLE)) {
  process.stderr.write(
    'extract-zip source has changed unexpectedly; symlink patch was NOT applied.\n' +
    'Please review node_modules/extract-zip/index.js manually.\n'
  );
  // Exit 0 so CI is not blocked — a changed source means a newer version may
  // already have the fix, or the patch needs updating.
  process.exit(0);
}

fs.writeFileSync(pkgFile, src.replace(VULNERABLE, PATCHED));
process.stdout.write('extract-zip patched: symlink traversal fix applied.\n');

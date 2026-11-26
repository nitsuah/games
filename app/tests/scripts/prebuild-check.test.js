const fs = require('fs');
const os = require('os');
const path = require('path');
const { collectErrors } = require('../../scripts/prebuild-check');

describe('prebuild-check collectErrors', () => {
  let dir;

  const write = (rel, content) => {
    const full = path.join(dir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  };

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pages-'));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('a clean file gives no errors', () => {
    write('ok.jsx', "import React from 'react';\n");
    expect(collectErrors(dir)).toEqual([]);
  });

  test('flags a react-three import', () => {
    write('bad.jsx', "import { Canvas } from '@react-three/fiber';\n");
    const errors = collectErrors(dir);
    expect(errors).toHaveLength(1);
    expect(errors[0].file.endsWith('bad.jsx')).toBe(true);
    expect(errors[0].reason).toContain('@react-three/fiber');
  });

  test('scans subdirectories', () => {
    write('sub/deep.js', "import * as THREE from 'three';\n");
    const errors = collectErrors(dir);
    expect(errors).toHaveLength(1);
    expect(errors[0].reason).toContain('"three"');
  });

  test('flags test files under pages', () => {
    write('thing.test.jsx', 'export default 1;\n');
    const errors = collectErrors(dir);
    expect(errors).toHaveLength(1);
    expect(errors[0].reason).toContain('test file');
  });

  test('ignores files with other extensions', () => {
    write('notes.css', "import { Canvas } from '@react-three/fiber';\n");
    expect(collectErrors(dir)).toEqual([]);
  });
});

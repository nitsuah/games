const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

describe('manifest.json', () => {
  test('required fields are non-empty strings', () => {
    expect(typeof manifest.name).toBe('string');
    expect(manifest.name.length).toBeGreaterThan(0);

    expect(typeof manifest.short_name).toBe('string');
    expect(manifest.short_name.length).toBeGreaterThan(0);

    expect(typeof manifest.start_url).toBe('string');
    expect(manifest.start_url.length).toBeGreaterThan(0);

    expect(typeof manifest.display).toBe('string');
    expect(manifest.display.length).toBeGreaterThan(0);

    expect(typeof manifest.theme_color).toBe('string');
    expect(manifest.theme_color.length).toBeGreaterThan(0);

    expect(typeof manifest.background_color).toBe('string');
    expect(manifest.background_color.length).toBeGreaterThan(0);
  });

  test('icons is a non-empty array with required fields', () => {
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThan(0);

    manifest.icons.forEach((icon) => {
      expect(typeof icon.src).toBe('string');
      expect(icon.src.length).toBeGreaterThan(0);

      expect(typeof icon.sizes).toBe('string');
      expect(icon.sizes.length).toBeGreaterThan(0);

      expect(typeof icon.type).toBe('string');
      expect(icon.type.length).toBeGreaterThan(0);

      expect(typeof icon.purpose).toBe('string');
      expect(icon.purpose.length).toBeGreaterThan(0);
    });
  });
});
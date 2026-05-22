/**
 * @jest-environment jsdom
 */

import { applyHighContrastMode } from '../../utils/highContrastMode';

describe('applyHighContrastMode', () => {
  let originalDocument;

  beforeEach(() => {
    // Reset DOM styling and body classes
    document.documentElement.style.cssText = '';
    document.body.className = '';
  });

  test('should do nothing if document is undefined (SSR)', () => {
    // Temporarily mock document as undefined
    const tempDocument = global.document;
    delete global.document;

    expect(() => {
      applyHighContrastMode(true);
    }).not.toThrow();

    // Restore document
    global.document = tempDocument;
  });

  test('should apply high contrast CSS variables and body class when enabled is true', () => {
    applyHighContrastMode(true);

    const style = document.documentElement.style;
    
    // Check specific custom properties
    expect(style.getPropertyValue('--ui-primary')).toBe('#00ffff');
    expect(style.getPropertyValue('--ui-secondary')).toBe('#ffffff');
    expect(style.getPropertyValue('--ui-danger')).toBe('#ff0000');
    expect(style.getPropertyValue('--ui-warning')).toBe('#ffff00');
    expect(style.getPropertyValue('--ui-success')).toBe('#00ff00');
    expect(style.getPropertyValue('--ui-text-primary')).toBe('#ffffff');
    expect(style.getPropertyValue('--ui-bg-dark')).toBe('rgba(0, 0, 0, 1)');
    expect(style.getPropertyValue('--ui-border-primary')).toBe('rgba(255, 255, 255, 0.8)');
    
    // Check body class
    expect(document.body.classList.contains('high-contrast-mode')).toBe(true);
  });

  test('should remove high contrast CSS variables and body class when enabled is false', () => {
    // First enable it
    applyHighContrastMode(true);
    expect(document.body.classList.contains('high-contrast-mode')).toBe(true);

    // Then disable it
    applyHighContrastMode(false);

    const style = document.documentElement.style;

    // Properties should be removed
    expect(style.getPropertyValue('--ui-primary')).toBe('');
    expect(style.getPropertyValue('--ui-secondary')).toBe('');
    expect(style.getPropertyValue('--ui-danger')).toBe('');
    expect(style.getPropertyValue('--ui-warning')).toBe('');
    expect(style.getPropertyValue('--ui-success')).toBe('');
    
    // Body class should be removed
    expect(document.body.classList.contains('high-contrast-mode')).toBe(false);
  });
});

/**
 * @jest-environment jsdom
 */

import { applyHighContrastMode } from '../../utils/highContrastMode';

describe('applyHighContrastMode', () => {
  beforeEach(() => {
    // Reset DOM styling and body classes before each test
    document.documentElement.style.cssText = '';
    document.body.className = '';
  });

  // ─── SSR guard ────────────────────────────────────────────────────────────
  describe('SSR / no-document environment', () => {
    it('does nothing and does not throw when document is undefined', () => {
      const savedDocument = global.document;
      delete global.document;

      expect(() => applyHighContrastMode(true)).not.toThrow();
      expect(() => applyHighContrastMode(false)).not.toThrow();

      global.document = savedDocument;
    });
  });

  // ─── Enabling high-contrast mode ──────────────────────────────────────────
  describe('when enabled is true', () => {
    beforeEach(() => applyHighContrastMode(true));

    it('sets --ui-primary to bright cyan', () => {
      expect(document.documentElement.style.getPropertyValue('--ui-primary')).toBe('#00ffff');
    });

    it('sets --ui-primary-glow to full-opacity cyan', () => {
      expect(document.documentElement.style.getPropertyValue('--ui-primary-glow')).toBe(
        'rgba(0, 255, 255, 1)'
      );
    });

    it('sets --ui-secondary to pure white', () => {
      expect(document.documentElement.style.getPropertyValue('--ui-secondary')).toBe('#ffffff');
    });

    it('sets --ui-danger to pure red', () => {
      expect(document.documentElement.style.getPropertyValue('--ui-danger')).toBe('#ff0000');
    });

    it('sets --ui-warning to pure yellow', () => {
      expect(document.documentElement.style.getPropertyValue('--ui-warning')).toBe('#ffff00');
    });

    it('sets --ui-success to pure green', () => {
      expect(document.documentElement.style.getPropertyValue('--ui-success')).toBe('#00ff00');
    });

    it('sets --ui-text-primary to pure white', () => {
      expect(document.documentElement.style.getPropertyValue('--ui-text-primary')).toBe('#ffffff');
    });

    it('sets --ui-text-secondary to light gray', () => {
      expect(document.documentElement.style.getPropertyValue('--ui-text-secondary')).toBe('#e0e0e0');
    });

    it('sets --ui-text-accent to bright cyan', () => {
      expect(document.documentElement.style.getPropertyValue('--ui-text-accent')).toBe('#00ffff');
    });

    it('sets --ui-bg-dark to pure black', () => {
      expect(document.documentElement.style.getPropertyValue('--ui-bg-dark')).toBe('rgba(0, 0, 0, 1)');
    });

    it('sets --ui-bg-medium to near black', () => {
      expect(document.documentElement.style.getPropertyValue('--ui-bg-medium')).toBe(
        'rgba(0, 0, 0, 0.98)'
      );
    });

    it('sets --ui-bg-overlay to very dark', () => {
      expect(document.documentElement.style.getPropertyValue('--ui-bg-overlay')).toBe(
        'rgba(0, 0, 0, 0.95)'
      );
    });

    it('sets --ui-bg-glass to dark overlay', () => {
      expect(document.documentElement.style.getPropertyValue('--ui-bg-glass')).toBe(
        'rgba(0, 0, 0, 0.9)'
      );
    });

    it('sets --ui-border-primary to bright border', () => {
      expect(document.documentElement.style.getPropertyValue('--ui-border-primary')).toBe(
        'rgba(255, 255, 255, 0.8)'
      );
    });

    it('sets --ui-border-accent to bright cyan', () => {
      expect(document.documentElement.style.getPropertyValue('--ui-border-accent')).toBe('#00ffff');
    });

    it('sets --ui-border-danger to pure red', () => {
      expect(document.documentElement.style.getPropertyValue('--ui-border-danger')).toBe('#ff0000');
    });

    it('sets shadow variables', () => {
      expect(document.documentElement.style.getPropertyValue('--ui-shadow-sm')).toBe(
        '0 0 15px rgba(0, 0, 0, 1)'
      );
      expect(document.documentElement.style.getPropertyValue('--ui-shadow-md')).toBe(
        '0 0 25px rgba(0, 255, 255, 0.8)'
      );
      expect(document.documentElement.style.getPropertyValue('--ui-shadow-lg')).toBe(
        '0 0 50px rgba(0, 255, 255, 1)'
      );
    });

    it('sets text shadow variables', () => {
      expect(document.documentElement.style.getPropertyValue('--ui-text-shadow')).toBe(
        '3px 3px 6px rgba(0, 0, 0, 1)'
      );
      expect(document.documentElement.style.getPropertyValue('--ui-text-shadow-glow')).toBe(
        '0 0 15px rgba(0, 255, 255, 1)'
      );
    });

    it('adds high-contrast-mode class to body', () => {
      expect(document.body.classList.contains('high-contrast-mode')).toBe(true);
    });

    it('is idempotent – calling twice still results in one class', () => {
      applyHighContrastMode(true);
      expect(
        Array.from(document.body.classList).filter((c) => c === 'high-contrast-mode').length
      ).toBe(1);
    });
  });

  // ─── Disabling high-contrast mode ─────────────────────────────────────────
  describe('when enabled is false', () => {
    beforeEach(() => {
      applyHighContrastMode(true); // start enabled
      applyHighContrastMode(false); // then disable
    });

    const removedProperties = [
      '--ui-primary',
      '--ui-primary-glow',
      '--ui-secondary',
      '--ui-danger',
      '--ui-warning',
      '--ui-success',
      '--ui-text-primary',
      '--ui-text-secondary',
      '--ui-text-accent',
      '--ui-bg-dark',
      '--ui-bg-medium',
      '--ui-bg-overlay',
      '--ui-bg-glass',
      '--ui-border-primary',
      '--ui-border-accent',
      '--ui-border-danger',
      '--ui-shadow-sm',
      '--ui-shadow-md',
      '--ui-shadow-lg',
      '--ui-text-shadow',
      '--ui-text-shadow-glow',
    ];

    it.each(removedProperties)('removes %s CSS variable', (prop) => {
      expect(document.documentElement.style.getPropertyValue(prop)).toBe('');
    });

    it('removes high-contrast-mode class from body', () => {
      expect(document.body.classList.contains('high-contrast-mode')).toBe(false);
    });

    it('disabling without prior enable does not throw', () => {
      document.documentElement.style.cssText = '';
      document.body.className = '';
      expect(() => applyHighContrastMode(false)).not.toThrow();
    });
  });

  // ─── Toggle behaviour ─────────────────────────────────────────────────────
  describe('toggling', () => {
    it('can be toggled on and off repeatedly', () => {
      for (let i = 0; i < 3; i++) {
        applyHighContrastMode(true);
        expect(document.body.classList.contains('high-contrast-mode')).toBe(true);

        applyHighContrastMode(false);
        expect(document.body.classList.contains('high-contrast-mode')).toBe(false);
        expect(document.documentElement.style.getPropertyValue('--ui-primary')).toBe('');
      }
    });
  });
});

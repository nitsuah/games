import {
  NORMAL_COLORS,
  DEUTERANOPIA_COLORS,
  PROTANOPIA_COLORS,
  TRITANOPIA_COLORS,
  getColorScheme,
  getTargetColor,
} from '@/lib/asteroid/_comp/Game/colorblindModes';

describe('colorblindModes', () => {
  describe('getColorScheme', () => {
    test('returns deuteranopia scheme', () => {
      expect(getColorScheme('deuteranopia')).toBe(DEUTERANOPIA_COLORS);
    });

    test('returns protanopia scheme', () => {
      expect(getColorScheme('protanopia')).toBe(PROTANOPIA_COLORS);
    });

    test('returns tritanopia scheme', () => {
      expect(getColorScheme('tritanopia')).toBe(TRITANOPIA_COLORS);
    });

    test('returns normal scheme for none', () => {
      expect(getColorScheme('none')).toBe(NORMAL_COLORS);
    });

    test('returns normal scheme for unknown mode', () => {
      expect(getColorScheme('unexpected')).toBe(NORMAL_COLORS);
    });

    test('returns normal scheme when mode is undefined', () => {
      expect(getColorScheme(undefined)).toBe(NORMAL_COLORS);
    });
  });

  describe('getTargetColor', () => {
    test('uses small color for size under 8', () => {
      expect(getTargetColor(7, 'none')).toBe(NORMAL_COLORS.small);
      expect(getTargetColor(7, 'deuteranopia')).toBe(DEUTERANOPIA_COLORS.small);
    });

    test('uses medium color for size 8 through 11', () => {
      expect(getTargetColor(8, 'protanopia')).toBe(PROTANOPIA_COLORS.medium);
      expect(getTargetColor(11, 'tritanopia')).toBe(TRITANOPIA_COLORS.medium);
    });

    test('uses large color for size 12 and above', () => {
      expect(getTargetColor(12, 'none')).toBe(NORMAL_COLORS.large);
      expect(getTargetColor(20, 'deuteranopia')).toBe(DEUTERANOPIA_COLORS.large);
    });

    test('defaults to normal mode when colorblind mode is not provided', () => {
      expect(getTargetColor(10)).toBe(NORMAL_COLORS.medium);
    });

    test('falls back to normal mode for unknown mode', () => {
      expect(getTargetColor(12, 'unknown')).toBe(NORMAL_COLORS.large);
    });
  });
});

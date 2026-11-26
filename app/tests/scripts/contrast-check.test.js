const {
  hexToRgb,
  rgbaStringToRgb,
  sRGBtoLinear,
  luminanceRgb,
  contrastRatio,
  parseColors,
  resolveColor,
  blendOver,
} = require('../../scripts/contrast-check');

describe('contrast-check helpers', () => {
  test('hexToRgb parses 6-digit and 3-digit hex', () => {
    expect(hexToRgb('#ff8000')).toEqual([255, 128, 0]);
    expect(hexToRgb('#fff')).toEqual([255, 255, 255]);
    expect(hexToRgb('#0a0')).toEqual([0, 170, 0]);
  });

  test('rgbaStringToRgb parses rgb and rgba, defaulting alpha to 1', () => {
    expect(rgbaStringToRgb('rgb(10, 20, 30)')).toEqual({ r: 10, g: 20, b: 30, a: 1 });
    expect(rgbaStringToRgb('rgba(10, 20, 30, 0.5)')).toEqual({ r: 10, g: 20, b: 30, a: 0.5 });
    expect(rgbaStringToRgb('not a color')).toBeNull();
  });

  test('sRGBtoLinear and luminanceRgb hit the black and white endpoints', () => {
    expect(sRGBtoLinear(0)).toBe(0);
    expect(sRGBtoLinear(255)).toBeCloseTo(1, 10);
    expect(luminanceRgb({ r: 0, g: 0, b: 0 })).toBe(0);
    expect(luminanceRgb({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 10);
  });

  test('contrastRatio is 21 for black on white and symmetric', () => {
    const black = { r: 0, g: 0, b: 0 };
    const white = { r: 255, g: 255, b: 255 };
    expect(contrastRatio(black, white)).toBeCloseTo(21, 5);
    expect(contrastRatio(white, black)).toBeCloseTo(contrastRatio(black, white), 10);
    expect(contrastRatio(white, white)).toBeCloseTo(1, 10);
  });

  test('resolveColor handles hex, rgba and unknown input', () => {
    expect(resolveColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    expect(resolveColor('rgba(1, 2, 3, 0.25)')).toEqual({ r: 1, g: 2, b: 3, a: 0.25 });
    expect(resolveColor('red')).toBeNull();
    expect(resolveColor('')).toBeNull();
    expect(resolveColor(null)).toBeNull();
  });

  test('blendOver mixes a translucent foreground over a background', () => {
    const bg = { r: 255, g: 255, b: 255 };
    expect(blendOver({ r: 0, g: 0, b: 0, a: 0.5 }, bg)).toEqual({ r: 128, g: 128, b: 128 });
    expect(blendOver({ r: 10, g: 20, b: 30 }, bg)).toEqual({ r: 10, g: 20, b: 30 });
  });

  test('parseColors extracts color declarations with their positions', () => {
    const css = '.a { color: #fff; }\n.b { color: rgba(0, 0, 0, 0.5); }';
    const found = parseColors(css);
    expect(found.map((c) => c.color)).toEqual(['#fff', 'rgba(0, 0, 0, 0.5)']);
    expect(found[0].index).toBe(css.indexOf('color: #fff'));
    expect(found[1].index).toBe(css.indexOf('color: rgba'));
  });
});

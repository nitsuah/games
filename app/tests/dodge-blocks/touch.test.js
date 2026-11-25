const fs = require('fs');
const path = require('path');
const { steerFromPointer } = require('../../public/games/dodge-blocks/touch.js');

describe('DodgeTouch.steerFromPointer', () => {
  it('steps left for a tap on the left half', () => {
    expect(steerFromPointer(20, 0, 100, 100, 40, 320, 24)).toBe(76);
  });

  it('steps right for a tap on the right half', () => {
    expect(steerFromPointer(80, 0, 100, 100, 40, 320, 24)).toBe(124);
  });

  it('clamps at the left edge', () => {
    expect(steerFromPointer(10, 0, 100, 8, 40, 320, 24)).toBe(0);
  });

  it('clamps at the right edge', () => {
    expect(steerFromPointer(90, 0, 100, 290, 40, 320, 24)).toBe(280);
  });

  it('leaves the player unchanged for a zero-width canvas', () => {
    expect(steerFromPointer(20, 0, 0, 100, 40, 320, 24)).toBe(100);
  });

  it('loads the helper before the game script', () => {
    const html = fs.readFileSync(
      path.join(__dirname, '../../public/games/dodge-blocks/index.html'),
      'utf8',
    );
    expect(html.indexOf('touch.js')).toBeLessThan(html.indexOf('script.js'));
  });
});

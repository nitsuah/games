const DodgeTouch = require('../../public/games/dodge-blocks/touch.js');
const fs = require('fs');
const path = require('path');

describe('DodgeTouch.steerFromPointer', () => {
  const steer = (x, playerX = 100) => DodgeTouch.steerFromPointer(x, 10, 200, playerX, 40, 320, 24);

  it('steps left for the left half and right for the right half', () => {
    expect(steer(40)).toBe(76);
    expect(steer(180)).toBe(124);
  });

  it('clamps at both canvas edges', () => {
    expect(steer(10, 8)).toBe(0);
    expect(steer(210, 280)).toBe(280);
  });

  it('leaves the player unchanged for a zero-width rectangle', () => {
    expect(DodgeTouch.steerFromPointer(50, 0, 0, 90, 40, 320, 24)).toBe(90);
  });

  it('loads touch.js before script.js', () => {
    const html = fs.readFileSync(path.join(__dirname, '../../public/games/dodge-blocks/index.html'), 'utf8');
    expect(html.indexOf('touch.js')).toBeLessThan(html.indexOf('script.js'));
  });
});

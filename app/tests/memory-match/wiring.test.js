const fs = require('fs');
const path = require('path');

const gameDir = path.join(__dirname, '../../public/games/memory-match');

describe('Memory Match score wiring', () => {
  it('loads the score helper before the game and provides a live best-score element', () => {
    const html = fs.readFileSync(path.join(gameDir, 'index.html'), 'utf8');
    expect(html.indexOf('score.js')).toBeLessThan(html.indexOf('script.js'));
    expect(html).toContain('id="best"');
  });

  it('loads and saves best scores through MemoryScore', () => {
    const script = fs.readFileSync(path.join(gameDir, 'script.js'), 'utf8');
    expect(script).toContain('MemoryScore.loadBest');
    expect(script).toContain('MemoryScore.saveBest');
  });
});

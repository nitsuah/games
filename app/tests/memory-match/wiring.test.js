const fs = require('fs');
const path = require('path');

describe('Memory Match score wiring', () => {
  const gameDir = path.join(__dirname, '../../public/games/memory-match');

  it('loads score.js before script.js and provides the best-score element', () => {
    const html = fs.readFileSync(path.join(gameDir, 'index.html'), 'utf8');
    expect(html.indexOf('score.js')).toBeGreaterThanOrEqual(0);
    expect(html.indexOf('score.js')).toBeLessThan(html.indexOf('script.js'));
    expect(html).toMatch(/id="best"/);
  });

  it('loads and saves the best score from the game script', () => {
    const script = fs.readFileSync(path.join(gameDir, 'script.js'), 'utf8');
    expect(script).toContain('MemoryScore.loadBest');
    expect(script).toContain('MemoryScore.saveBest');
  });
});

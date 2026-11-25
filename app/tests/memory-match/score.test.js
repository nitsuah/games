const MemoryScore = require('../../public/games/memory-match/score.js');

function memoryStorage(initial) {
  const data = { ...initial };
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
    data,
  };
}

describe('MemoryScore', () => {
  it('saves the first valid score', () => {
    const s = memoryStorage();
    expect(MemoryScore.loadBest(s)).toBeNull();
    expect(MemoryScore.saveBest(s, { moves: 12, ms: 30000 })).toEqual({ moves: 12, ms: 30000 });
    expect(MemoryScore.loadBest(s)).toEqual({ moves: 12, ms: 30000 });
  });

  it('ignores a worse score', () => {
    const s = memoryStorage();
    MemoryScore.saveBest(s, { moves: 12, ms: 30000 });
    expect(MemoryScore.saveBest(s, { moves: 14, ms: 1000 })).toEqual({ moves: 12, ms: 30000 });
    expect(MemoryScore.loadBest(s)).toEqual({ moves: 12, ms: 30000 });
  });

  it('keeps fewer moves even when slower', () => {
    const s = memoryStorage();
    MemoryScore.saveBest(s, { moves: 12, ms: 30000 });
    expect(MemoryScore.saveBest(s, { moves: 10, ms: 90000 })).toEqual({ moves: 10, ms: 90000 });
  });

  it('breaks a move tie on lower time', () => {
    const s = memoryStorage();
    MemoryScore.saveBest(s, { moves: 12, ms: 30000 });
    expect(MemoryScore.saveBest(s, { moves: 12, ms: 25000 })).toEqual({ moves: 12, ms: 25000 });
    expect(MemoryScore.saveBest(s, { moves: 12, ms: 25000 })).toEqual({ moves: 12, ms: 25000 });
  });

  it('treats invalid JSON as no best', () => {
    const s = memoryStorage({ [MemoryScore.KEY]: '{not json' });
    expect(MemoryScore.loadBest(s)).toBeNull();
    expect(MemoryScore.saveBest(s, { moves: 8, ms: 5000 })).toEqual({ moves: 8, ms: 5000 });
  });

  it('treats a wrong shape as no best', () => {
    const s = memoryStorage({ [MemoryScore.KEY]: JSON.stringify({ moves: 'x', ms: -1 }) });
    expect(MemoryScore.loadBest(s)).toBeNull();
  });

  it('rejects invalid candidates', () => {
    const s = memoryStorage();
    expect(MemoryScore.saveBest(s, { moves: -1, ms: 10 })).toBeNull();
    expect(MemoryScore.saveBest(s, { moves: 3, ms: Infinity })).toBeNull();
    expect(MemoryScore.saveBest(s, null)).toBeNull();
  });

  it('does not throw when storage throws', () => {
    const broken = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('quota'); },
    };
    expect(MemoryScore.loadBest(broken)).toBeNull();
    expect(MemoryScore.saveBest(broken, { moves: 9, ms: 4000 })).toEqual({ moves: 9, ms: 4000 });
    expect(MemoryScore.loadBest(undefined)).toBeNull();
  });
});

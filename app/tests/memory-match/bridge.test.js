import { MEMORY_BEST_KEY, loadBest, saveBest } from '@/utils/memoryBestBridge';

describe('memory best bridge', () => {
  beforeEach(() => window.localStorage.clear());

  it('stores a well-formed record and reads it back', () => {
    expect(loadBest()).toBeNull();
    expect(saveBest('{"moves":9,"ms":1200,"extra":1}')).toBe(true);
    expect(window.localStorage.getItem(MEMORY_BEST_KEY)).toBe('{"moves":9,"ms":1200}');
    expect(loadBest()).toBe('{"moves":9,"ms":1200}');
  });

  it('never replaces a better record', () => {
    saveBest('{"moves":12,"ms":5000}');
    expect(saveBest('{"moves":15,"ms":10}')).toBe(false);
    expect(saveBest('{"moves":12,"ms":6000}')).toBe(false);
    expect(saveBest('{"moves":12,"ms":4000}')).toBe(true);
    expect(loadBest()).toBe('{"moves":12,"ms":4000}');
  });

  it.each([42, 'nope', '{}', '{"moves":-1,"ms":2}', '{"moves":"3","ms":2}', 'x'.repeat(201)])(
    'ignores %p',
    (value) => {
      expect(saveBest(value)).toBe(false);
      expect(loadBest()).toBeNull();
    }
  );

  it('survives blocked storage', () => {
    const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(loadBest()).toBeNull();
    spy.mockRestore();
  });
});

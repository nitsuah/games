// Best-score storage for Memory Match: fewer moves wins, then lower time (ms).
// Browser global `MemoryScore`; also exported through CommonJS for tests.
(function (root) {
  const KEY = 'memory-match:best';

  function isValid(score) {
    return !!score && typeof score === 'object'
      && Number.isFinite(score.moves) && score.moves >= 0
      && Number.isFinite(score.ms) && score.ms >= 0;
  }

  function isBetter(candidate, best) {
    if (!isValid(candidate)) return false;
    if (!isValid(best)) return true;
    if (candidate.moves !== best.moves) return candidate.moves < best.moves;
    return candidate.ms < best.ms;
  }

  function loadBest(storage) {
    try {
      const raw = storage && storage.getItem(KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return isValid(parsed) ? { moves: parsed.moves, ms: parsed.ms } : null;
    } catch {
      return null;
    }
  }

  // Saves `score` when it beats the stored best; returns the best score after the call.
  function saveBest(storage, score) {
    const best = loadBest(storage);
    if (!isBetter(score, best)) return best;
    const next = { moves: score.moves, ms: score.ms };
    try {
      storage.setItem(KEY, JSON.stringify(next));
    } catch {
      // storage full or blocked: keep the in-memory result
    }
    return next;
  }

  const MemoryScore = { KEY, isBetter, loadBest, saveBest };
  if (typeof module !== 'undefined' && module.exports) module.exports = MemoryScore;
  else root.MemoryScore = MemoryScore;
})(typeof window !== 'undefined' ? window : this);

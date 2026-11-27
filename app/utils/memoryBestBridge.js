// Best-score storage the arcade page keeps on behalf of the sandboxed Memory Match frame.
export const MEMORY_BEST_KEY = 'memory-match:best';

export function loadBest() {
  try {
    return window.localStorage.getItem(MEMORY_BEST_KEY);
  } catch {
    return null;
  }
}

function readRecord() {
  try {
    const record = JSON.parse(loadBest());
    return Number.isFinite(record?.moves) && Number.isFinite(record?.ms) ? record : null;
  } catch {
    return null;
  }
}

// Fewer moves wins, then the lower time.
function beats(next, best) {
  return !best || next.moves < best.moves || (next.moves === best.moves && next.ms < best.ms);
}

// Stores only a well-formed { moves, ms } record; anything else from the frame is ignored.
export function saveBest(value) {
  try {
    if (typeof value !== 'string' || value.length > 200) return false;
    const { moves, ms } = JSON.parse(value);
    if (!(Number.isFinite(moves) && moves >= 0 && Number.isFinite(ms) && ms >= 0)) return false;
    // The frame's snapshot can be stale (another tab), so never replace a better record.
    if (!beats({ moves, ms }, readRecord())) return false;
    window.localStorage.setItem(MEMORY_BEST_KEY, JSON.stringify({ moves, ms }));
    return true;
  } catch {
    return false;
  }
}

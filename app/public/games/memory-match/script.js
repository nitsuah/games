/* global MemoryScore */
const gameEl = document.getElementById('game');
const restartBtn = document.getElementById('restart');
const symbols = ['🍎','🍌','🍒','🍇','🍉','🍋','🍓','🍍'];
let cards = [], flipped = [], matched = 0, lock = false, moves = 0, startedAt = 0;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// The arcade page can pause the game: no flips, no pair resolution, no clock.
let paused = false, pausedAt = 0, pendingResolve = null;

function setPaused(next) {
  if (next === paused) return;
  paused = next;
  if (paused) {
    pausedAt = Date.now();
    return;
  }
  if (startedAt !== 0) startedAt += Date.now() - pausedAt;
  const resume = pendingResolve;
  pendingResolve = null;
  if (resume) resume();
}

function setup() {
  const deck = [...symbols, ...symbols];
  shuffle(deck);
  cards = deck.map((symbol, i) => ({ id: i, symbol, flipped: false, matched: false }));
  flipped = [];
  matched = 0;
  lock = false;
  moves = 0;
  startedAt = 0;
  document.getElementById('status').textContent = '';
  showBest();
  render();
}

function render() {
  gameEl.innerHTML = '';
  cards.forEach(card => {
    const el = document.createElement('div');
    el.className = 'card' + (card.flipped ? ' flipped' : '') + (card.matched ? ' matched' : '');
    el.textContent = card.flipped || card.matched ? card.symbol : '';
    el.tabIndex = 0;
    el.setAttribute('aria-label', card.flipped || card.matched ? card.symbol : 'Hidden card');
    el.onclick = () => flip(card.id);
    el.onkeydown = e => { if ((e.key === 'Enter' || e.key === ' ') && !card.flipped && !card.matched) flip(card.id); };
    gameEl.appendChild(el);
  });
}

// The arcade page embeds this game in a sandbox without localStorage, so fall back to
// an in-memory copy that the page loads and saves through messages.
const embedded = window.self !== window.top;
const remembered = {};
const bridgeStorage = {
  getItem: key => remembered[key] ?? null,
  setItem: (key, value) => {
    remembered[key] = value;
    window.parent.postMessage({ type: 'memory:best-save', value }, '*');
  },
};

function bestStorage() {
  try {
    window.localStorage.getItem(MemoryScore.KEY);
    return window.localStorage;
  } catch {
    return bridgeStorage;
  }
}

function showBest() {
  const el = document.getElementById('best');
  try {
    const best = MemoryScore.loadBest(bestStorage());
    el.textContent = best ? `Best: ${best.moves} moves in ${Math.round(best.ms / 1000)}s` : '';
  } catch {
    el.textContent = '';
  }
}

function flip(id) {
  if (lock || paused) return;
  const card = cards[id];
  if (card.flipped || card.matched) return;
  card.flipped = true;
  if (startedAt === 0) startedAt = Date.now();
  flipped.push(card);
  render();
  if (flipped.length === 2) {
    moves++;
    lock = true;
    const resolvePair = () => {
      if (paused) {
        pendingResolve = resolvePair;
        return;
      }
      if (flipped[0].symbol === flipped[1].symbol) {
        flipped[0].matched = flipped[1].matched = true;
        matched += 2;
        if (matched === cards.length) {
          MemoryScore.saveBest(bestStorage(), { moves, ms: Date.now() - startedAt });
          showBest();
          // The sandbox blocks alert(), so announce the win in the page.
          document.getElementById('status').textContent = 'You win! ' + moves + ' moves';
        }
      } else {
        flipped[0].flipped = flipped[1].flipped = false;
      }
      flipped = [];
      lock = false;
      render();
    };
    setTimeout(resolvePair, 800);
  }
}

restartBtn.onclick = setup;
setup();

if (embedded) {
  document.documentElement.classList.add('embedded');
  window.addEventListener('message', e => {
    if (e.source !== window.parent) return;
    if (e.data?.type === 'memory:pause') setPaused(!!e.data.paused);
    if (e.data?.type !== 'memory:best-load') return;
    if (typeof e.data.value === 'string') remembered[MemoryScore.KEY] = e.data.value;
    showBest();
  });
  window.parent.postMessage({ type: 'memory:ready' }, '*');
}

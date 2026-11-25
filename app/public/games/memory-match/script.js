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

function showBest() {
  const bestEl = document.getElementById('best');
  try {
    const best = MemoryScore.loadBest(window.localStorage);
    bestEl.textContent = best ? `Best: ${best.moves} moves in ${Math.round(best.ms / 1000)}s` : '';
  } catch {
    bestEl.textContent = '';
  }
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

function flip(id) {
  if (lock) return;
  const card = cards[id];
  if (card.flipped || card.matched) return;
  if (startedAt === 0) startedAt = Date.now();
  card.flipped = true;
  flipped.push(card);
  render();
  if (flipped.length === 2) {
    moves++;
    lock = true;
    setTimeout(() => {
      if (flipped[0].symbol === flipped[1].symbol) {
        flipped[0].matched = flipped[1].matched = true;
        matched += 2;
        if (matched === cards.length) {
          try {
            MemoryScore.saveBest(window.localStorage, { moves, ms: Date.now() - startedAt });
          } catch {
            // Private or blocked storage must not prevent a win.
          }
          showBest();
          setTimeout(() => alert('You win! ' + moves + ' moves'), 200);
        }
      } else {
        flipped[0].flipped = flipped[1].flipped = false;
      }
      flipped = [];
      lock = false;
      render();
    }, 800);
  }
}

restartBtn.onclick = setup;
setup();

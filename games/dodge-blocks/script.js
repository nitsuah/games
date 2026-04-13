const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let player, blocks, score, running, frame;

function reset() {
  player = { x: 140, y: 440, w: 40, h: 20 };
  blocks = [];
  score = 0;
  running = true;
  frame = 0;
}

function spawnBlock() {
  const w = 40 + Math.random() * 40;
  blocks.push({ x: Math.random() * (320 - w), y: -20, w, h: 20, speed: 2 + Math.random() * 3 });
}

function update() {
  if (!running) return;
  frame++;
  if (frame % 30 === 0) spawnBlock();
  blocks.forEach(b => b.y += b.speed);
  blocks = blocks.filter(b => b.y < 480);
  blocks.forEach(b => {
    if (b.x < player.x + player.w && b.x + b.w > player.x && b.y < player.y + player.h && b.y + b.h > player.y) {
      running = false;
    }
  });
  if (running) score++;
}

function draw() {
  ctx.clearRect(0, 0, 320, 480);
  ctx.fillStyle = '#00ffff';
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.fillStyle = '#ff0055';
  blocks.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));
  ctx.fillStyle = '#fff';
  ctx.font = '20px sans-serif';
  ctx.fillText('Score: ' + score, 10, 30);
  if (!running) {
    ctx.fillStyle = '#fff';
    ctx.font = '32px sans-serif';
    ctx.fillText('Game Over', 70, 240);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') player.x -= 24;
  if (e.key === 'ArrowRight') player.x += 24;
  player.x = Math.max(0, Math.min(320 - player.w, player.x));
});

document.getElementById('restart').onclick = () => { reset(); };

reset();
loop();

import { useRef, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';

// ─── World constants ───────────────────────────────────────────────────────────
const WORLD_W = 3200;
const WORLD_H = 3200;
const TANK_W = 38;
const TANK_H = 28;
const TURRET_LEN = 22;
const BULLET_SPEED = 9;
const BULLET_LIFE = 90; // frames
const BULLET_R = 5;

// ─── Tank configs ──────────────────────────────────────────────────────────────
const CONFIGS = {
  player: { hp: 100, speed: 2.8, damage: 30, fireRate: 18, color: '#00ff88', dark: '#00a855', ammo: 30 },
  basic:  { hp: 60,  speed: 1.2, damage: 15, fireRate: 90, color: '#ff4444', dark: '#aa1111', score: 100 },
  fast:   { hp: 35,  speed: 2.4, damage: 10, fireRate: 55, color: '#ffaa00', dark: '#bb6600', score: 150 },
  heavy:  { hp: 160, speed: 0.7, damage: 35, fireRate: 150, color: '#9955ff', dark: '#5522bb', score: 250 },
};

const POWERUP_COLORS = { health: '#ff5577', ammo: '#ffdd00', speed: '#00ccff', shield: '#aa44ff' };
const POWERUP_LABELS = { health: '❤️', ammo: '🔫', speed: '⚡', shield: '🛡️' };

// ─── Procedural wall generation ────────────────────────────────────────────────
function buildWalls() {
  const walls = [];
  // Border
  walls.push({ x: 0, y: 0, w: WORLD_W, h: 18 });
  walls.push({ x: 0, y: WORLD_H - 18, w: WORLD_W, h: 18 });
  walls.push({ x: 0, y: 0, w: 18, h: WORLD_H });
  walls.push({ x: WORLD_W - 18, y: 0, w: 18, h: WORLD_H });

  // Interior clusters — skip a 500px clear zone around center (spawn)
  const cx = WORLD_W / 2, cy = WORLD_H / 2;
  const CELL = 220;
  const cols = Math.floor(WORLD_W / CELL);
  const rows = Math.floor(WORLD_H / CELL);
  for (let c = 1; c < cols - 1; c++) {
    for (let r = 1; r < rows - 1; r++) {
      const wx = c * CELL + 10;
      const wy = r * CELL + 10;
      const dist = Math.hypot(wx - cx, wy - cy);
      if (dist < 520) continue;
      if (Math.random() > 0.22) continue;
      const long = 60 + Math.random() * 100;
      const short = 18 + Math.random() * 28;
      if (Math.random() > 0.5) {
        walls.push({ x: wx, y: wy, w: long, h: short });
      } else {
        walls.push({ x: wx, y: wy, w: short, h: long });
      }
    }
  }
  return walls;
}

function rectOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function circleRectOverlap(cx, cy, r, rx, ry, rw, rh) {
  const nearX = Math.max(rx, Math.min(cx, rx + rw));
  const nearY = Math.max(ry, Math.min(cy, ry + rh));
  return Math.hypot(cx - nearX, cy - nearY) < r;
}

function findSpawn(walls, playerX, playerY, minDist = 500) {
  for (let attempt = 0; attempt < 80; attempt++) {
    const x = 100 + Math.random() * (WORLD_W - 200);
    const y = 100 + Math.random() * (WORLD_H - 200);
    if (Math.hypot(x - playerX, y - playerY) < minDist) continue;
    const blocked = walls.some(w => circleRectOverlap(x, y, 30, w.x, w.y, w.w, w.h));
    if (!blocked) return { x, y };
  }
  return { x: 200, y: 200 };
}

function makeTank(type, x, y, angle = 0) {
  const cfg = CONFIGS[type];
  return {
    id: Math.random(),
    type,
    x, y,
    angle,          // body rotation (radians)
    turretAngle: angle,
    hp: cfg.hp,
    maxHp: cfg.hp,
    speed: cfg.speed,
    damage: cfg.damage,
    fireRate: cfg.fireRate,
    fireCooldown: 0,
    color: cfg.color,
    dark: cfg.dark,
    // AI
    waypointX: x,
    waypointY: y,
    waypointTimer: 0,
    state: 'patrol', // patrol | chase | attack | flee
    // ammo
    ammo: type === 'player' ? cfg.ammo : Infinity,
    maxAmmo: type === 'player' ? cfg.ammo : Infinity,
    ammoTimer: 0,
    // power-up timers
    shieldTimer: 0,
    speedTimer: 0,
    invulnTimer: 0,
  };
}

function makeBullet(x, y, angle, owner, damage) {
  return {
    id: Math.random(),
    x, y,
    vx: Math.cos(angle) * BULLET_SPEED,
    vy: Math.sin(angle) * BULLET_SPEED,
    owner,  // 'player' or 'enemy'
    damage,
    life: BULLET_LIFE,
  };
}

function makePowerUp(x, y, type) {
  return { id: Math.random(), x, y, type, pulse: 0 };
}

function scatterPowerUps(walls, count = 16) {
  const types = ['health', 'ammo', 'speed', 'shield'];
  const items = [];
  for (let i = 0; i < count; i++) {
    let x = 80 + Math.random() * (WORLD_W - 160);
    let y = 80 + Math.random() * (WORLD_H - 160);
    for (let attempt = 0; attempt < 80; attempt++) {
      if (!walls.some(w => circleRectOverlap(x, y, 25, w.x, w.y, w.w, w.h))) break;
      x = 80 + Math.random() * (WORLD_W - 160);
      y = 80 + Math.random() * (WORLD_H - 160);
    }
    items.push(makePowerUp(x, y, types[Math.floor(Math.random() * types.length)]));
  }
  return items;
}

// ─── Collision helpers ─────────────────────────────────────────────────────────
function pushOutOfWalls(entity, walls, radius = 18) {
  for (const w of walls) {
    if (!circleRectOverlap(entity.x, entity.y, radius, w.x, w.y, w.w, w.h)) continue;
    const overlapLeft  = (entity.x + radius) - w.x;
    const overlapRight = (w.x + w.w) - (entity.x - radius);
    const overlapTop   = (entity.y + radius) - w.y;
    const overlapBot   = (w.y + w.h) - (entity.y - radius);
    const min = Math.min(overlapLeft, overlapRight, overlapTop, overlapBot);
    if (min === overlapLeft)  entity.x = w.x - radius;
    else if (min === overlapRight) entity.x = w.x + w.w + radius;
    else if (min === overlapTop)   entity.y = w.y - radius;
    else                           entity.y = w.y + w.h + radius;
  }
  entity.x = Math.max(30, Math.min(WORLD_W - 30, entity.x));
  entity.y = Math.max(30, Math.min(WORLD_H - 30, entity.y));
}

// ─── Pure drawing / particle helpers (module scope — no component closure) ────
function spawnExplosion(state, x, y, color, count = 16) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = 1.5 + Math.random() * 3;
    state.particles.push({
      x, y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      life: 30 + Math.random() * 25,
      maxLife: 55,
      color,
      r: 2 + Math.random() * 4,
    });
  }
}

function drawTank(ctx, tank, shield = false, speedBoost = false, invuln = false) {
  ctx.save();
  ctx.translate(tank.x, tank.y);

  if (speedBoost) {
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#00ccff';
  }
  if (invuln && Math.floor(Date.now() / 60) % 2 === 0) {
    ctx.globalAlpha = 0.4;
  }

  ctx.rotate(tank.angle);
  ctx.fillStyle = tank.dark || '#005533';
  ctx.fillRect(-TANK_W / 2 - 2, -TANK_H / 2 - 2, TANK_W + 4, TANK_H + 4);
  ctx.fillStyle = tank.color;
  ctx.fillRect(-TANK_W / 2, -TANK_H / 2, TANK_W, TANK_H);

  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(-TANK_W / 2, -TANK_H / 2, TANK_W, 6);
  ctx.fillRect(-TANK_W / 2, TANK_H / 2 - 6, TANK_W, 6);

  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = tank.color;
  ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();

  ctx.rotate(-tank.angle);
  ctx.rotate(tank.turretAngle);
  ctx.fillStyle = tank.dark || '#005533';
  ctx.fillRect(-3, -13, 26, 8);
  ctx.fillStyle = tank.type === 'heavy' ? '#cc88ff' : tank.color;
  ctx.fillRect(-2, -11, TURRET_LEN, 6);
  ctx.shadowBlur = 0;
  ctx.restore();

  if (shield) {
    ctx.save();
    ctx.translate(tank.x, tank.y);
    ctx.strokeStyle = '#aa44ff';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#aa44ff';
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawHealthBar(ctx, x, y, hp, maxHp, color) {
  const bw = 36, bh = 5;
  ctx.fillStyle = '#333';
  ctx.fillRect(x - bw / 2, y, bw, bh);
  const ratio = Math.max(0, hp / maxHp);
  const barColor = ratio > 0.5 ? color : ratio > 0.25 ? '#ffaa00' : '#ff4444';
  ctx.fillStyle = barColor;
  ctx.fillRect(x - bw / 2, y, bw * ratio, bh);
}

function drawMiniMap(ctx, s, W, H) {
  const mm = { x: W - 164, y: H - 124, w: 150, h: 110, scale: 150 / WORLD_W };
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(mm.x - 2, mm.y - 2, mm.w + 4, mm.h + 4);
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;
  ctx.strokeRect(mm.x, mm.y, mm.w, mm.h);

  ctx.fillStyle = '#555';
  for (const w of s.walls) {
    ctx.fillRect(mm.x + w.x * mm.scale, mm.y + w.y * (mm.h / WORLD_H), w.w * mm.scale, w.h * (mm.h / WORLD_H));
  }
  for (const e of s.enemies) {
    if (e.hp <= 0) continue;
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.arc(mm.x + e.x * mm.scale, mm.y + e.y * (mm.h / WORLD_H), 3, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const pu of s.powerUps) {
    ctx.fillStyle = POWERUP_COLORS[pu.type];
    ctx.fillRect(mm.x + pu.x * mm.scale - 1, mm.y + pu.y * (mm.h / WORLD_H) - 1, 3, 3);
  }

  ctx.fillStyle = '#00ff88';
  const px = mm.x + s.player.x * mm.scale;
  const py = mm.y + s.player.y * (mm.h / WORLD_H);
  ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
}

function drawFrame(canvas, s, paused) {
  if (!s) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cam = s.camera;
  const offX = W / 2 - cam.x;
  const offY = H / 2 - cam.y;

  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.translate(offX, offY);

  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = 1;
  const gridSize = 80;
  const startGX = Math.floor((cam.x - W / 2) / gridSize) * gridSize;
  const startGY = Math.floor((cam.y - H / 2) / gridSize) * gridSize;
  for (let gx = startGX; gx < cam.x + W / 2; gx += gridSize) {
    ctx.beginPath(); ctx.moveTo(gx, cam.y - H / 2); ctx.lineTo(gx, cam.y + H / 2); ctx.stroke();
  }
  for (let gy = startGY; gy < cam.y + H / 2; gy += gridSize) {
    ctx.beginPath(); ctx.moveTo(cam.x - W / 2, gy); ctx.lineTo(cam.x + W / 2, gy); ctx.stroke();
  }

  for (const w of s.walls) {
    ctx.fillStyle = '#4a4a5a';
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeStyle = '#6a6a7a';
    ctx.lineWidth = 2;
    ctx.strokeRect(w.x, w.y, w.w, w.h);
  }

  for (const pu of s.powerUps) {
    const pulse = Math.sin(pu.pulse) * 3;
    const r = 14 + pulse;
    ctx.save();
    ctx.translate(pu.x, pu.y);
    ctx.shadowBlur = 14;
    ctx.shadowColor = POWERUP_COLORS[pu.type];
    ctx.fillStyle = POWERUP_COLORS[pu.type] + '44';
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = POWERUP_COLORS[pu.type];
    ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(POWERUP_LABELS[pu.type], 0, 0);
    ctx.restore();
  }

  for (const b of s.bullets) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(Math.atan2(b.vy, b.vx));
    ctx.fillStyle = b.owner === 'player' ? '#ffff44' : '#ff6644';
    ctx.shadowBlur = 8;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fillRect(-BULLET_R, -2, BULLET_R * 2, 4);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  for (const pt of s.particles) {
    const a = pt.life / pt.maxLife;
    ctx.globalAlpha = a;
    ctx.fillStyle = pt.color;
    ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r * a, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  for (const e of s.enemies) {
    if (e.hp <= 0) continue;
    drawTank(ctx, e);
    drawHealthBar(ctx, e.x, e.y - 28, e.hp, e.maxHp, e.color);
  }

  const p = s.player;
  drawTank(ctx, p, p.shieldTimer > 0, p.speedTimer > 0, p.invulnTimer > 0);
  drawHealthBar(ctx, p.x, p.y - 28, p.hp, p.maxHp, '#00ff88');

  ctx.restore();

  drawMiniMap(ctx, s, W, H);

  if (s.gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 64px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', W / 2, H / 2 - 20);
    ctx.fillStyle = '#fff';
    ctx.font = '28px Courier New';
    ctx.fillText(`SCORE: ${s.score}`, W / 2, H / 2 + 30);
  }

  if (paused && !s.gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 52px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', W / 2, H / 2 - 10);
    ctx.fillStyle = '#888';
    ctx.font = '20px Courier New';
    ctx.fillText('Press ESC to resume', W / 2, H / 2 + 36);
  }
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function TankGame({ onGameOver, paused: externalPaused = false, onPauseToggle }) {
  const router    = useRouter();
  const canvasRef = useRef(null);
  const stateRef  = useRef(null);   // mutable game state
  const rafRef    = useRef(null);
  const keysRef   = useRef({});
  const mouseRef  = useRef({ x: 0, y: 0, down: false });
  const pausedRef = useRef(false);
  const onGameOverRef      = useRef(onGameOver);
  const onPauseToggleRef   = useRef(onPauseToggle);
  const gameOverTimeoutRef = useRef(null);
  useEffect(() => { onGameOverRef.current    = onGameOver;    }, [onGameOver]);
  useEffect(() => { onPauseToggleRef.current = onPauseToggle; }, [onPauseToggle]);

  // HUD values that trigger re-renders
  const [hud, setHud] = useState({ hp: 100, maxHp: 100, ammo: CONFIGS.player.ammo, maxAmmo: CONFIGS.player.ammo, score: 0, elapsed: 0, shield: false, speed: false, gameOver: false });

  useEffect(() => {
    pausedRef.current = externalPaused;
  }, [externalPaused]);

  // ── Init ───────────────────────────────────────────────────────────────────
  const initGame = useCallback(() => {
    if (gameOverTimeoutRef.current) {
      clearTimeout(gameOverTimeoutRef.current);
      gameOverTimeoutRef.current = null;
    }
    const walls = buildWalls();
    const startX = WORLD_W / 2;
    const startY = WORLD_H / 2;
    const player = makeTank('player', startX, startY, 0);

    stateRef.current = {
      player,
      enemies: [
        makeTank('basic', ...Object.values(findSpawn(walls, startX, startY))),
        makeTank('basic', ...Object.values(findSpawn(walls, startX, startY))),
        makeTank('fast',  ...Object.values(findSpawn(walls, startX, startY))),
      ],
      bullets: [],
      powerUps: scatterPowerUps(walls),
      walls,
      particles: [],
      score: 0,
      elapsed: 0, // seconds
      spawnTimer: 0,
      spawnInterval: 12, // seconds between enemy waves
      camera: { x: startX, y: startY }, // camera tracks world position (center)
      gameOver: false,
    };
    setHud({ hp: 100, maxHp: 100, ammo: CONFIGS.player.ammo, maxAmmo: CONFIGS.player.ammo, score: 0, elapsed: 0, shield: false, speed: false, gameOver: false });
  }, []);

  // ── Game loop ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    initGame();

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onKey = (e) => {
      keysRef.current[e.code] = e.type === 'keydown';
      if (e.code === 'Escape' && e.type === 'keydown') {
        onPauseToggleRef.current?.();
      }
      if (e.code === 'Space') e.preventDefault();
    };
    const onMouse = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      if (e.type === 'mousedown') mouseRef.current.down = true;
      if (e.type === 'mouseup')   mouseRef.current.down = false;
    };
    const onTouch = (e) => {
      if (e.touches.length) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
      }
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup',   onKey);
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('mousedown', onMouse);
    window.addEventListener('mouseup',   onMouse);
    canvas.addEventListener('touchstart', onTouch, { passive: true });
    canvas.addEventListener('touchmove',  onTouch, { passive: true });

    let lastTime = performance.now();
    let hudTimer = 0;

    const loop = (now) => {
      rafRef.current = requestAnimationFrame(loop);
      const dt = Math.min((now - lastTime) / 16.67, 3); // ~1 at 60fps, clamp
      lastTime = now;

      const s = stateRef.current;
      if (!s || pausedRef.current || s.gameOver) {
        drawFrame(canvas, s, pausedRef.current);
        return;
      }

      // ── Elapsed time ──
      s.elapsed += dt / 60;

      // ── Player input ──
      const p = s.player;
      const keys = keysRef.current;

      // Body rotation
      const rotSpeed = 0.045 * dt;
      if (keys['KeyA'] || keys['ArrowLeft'])  p.angle -= rotSpeed;
      if (keys['KeyD'] || keys['ArrowRight']) p.angle += rotSpeed;

      // Forward / back
      const curSpeed = p.speed * (p.speedTimer > 0 ? 1.8 : 1) * dt;
      if (keys['KeyW'] || keys['ArrowUp']) {
        const nx = p.x + Math.cos(p.angle) * curSpeed;
        const ny = p.y + Math.sin(p.angle) * curSpeed;
        p.x = nx; p.y = ny;
      }
      if (keys['KeyS'] || keys['ArrowDown']) {
        const nx = p.x - Math.cos(p.angle) * curSpeed * 0.6;
        const ny = p.y - Math.sin(p.angle) * curSpeed * 0.6;
        p.x = nx; p.y = ny;
      }
      pushOutOfWalls(p, s.walls);

      // Turret aims at mouse (screen → world)
      const cam = s.camera;
      const worldMouseX = mouseRef.current.x + cam.x - canvas.width  / 2;
      const worldMouseY = mouseRef.current.y + cam.y - canvas.height / 2;
      p.turretAngle = Math.atan2(worldMouseY - p.y, worldMouseX - p.x);

      // Shoot
      if (p.fireCooldown > 0) p.fireCooldown -= dt;
      const wantShoot = mouseRef.current.down || keys['Space'];
      if (wantShoot && p.fireCooldown <= 0 && p.ammo > 0) {
        const bx = p.x + Math.cos(p.turretAngle) * (TURRET_LEN + 6);
        const by = p.y + Math.sin(p.turretAngle) * (TURRET_LEN + 6);
        s.bullets.push(makeBullet(bx, by, p.turretAngle, 'player', p.damage));
        p.fireCooldown = p.fireRate;
        p.ammo = Math.max(0, p.ammo - 1);
      }

      // Ammo regen
      p.ammoTimer -= dt;
      if (p.ammoTimer <= 0 && p.ammo < p.maxAmmo) {
        p.ammo = Math.min(p.maxAmmo, p.ammo + 1);
        p.ammoTimer = 60;
      }

      // Power-up timers
      if (p.shieldTimer  > 0) p.shieldTimer  -= dt;
      if (p.speedTimer   > 0) p.speedTimer   -= dt;
      if (p.invulnTimer  > 0) p.invulnTimer  -= dt;

      // ── Enemy AI ──
      for (const e of s.enemies) {
        if (e.hp <= 0) continue;
        const dx = p.x - e.x, dy = p.y - e.y;
        const dist = Math.hypot(dx, dy);
        const detectR = e.type === 'fast' ? 500 : e.type === 'heavy' ? 300 : 420;

        // State transitions
        if (e.hp / e.maxHp < 0.25 && e.type !== 'heavy') {
          e.state = 'flee';
        } else if (dist < detectR) {
          e.state = 'chase';
        } else if (e.state !== 'flee') {
          e.state = 'patrol';
        }

        // Movement
        let targetX = e.waypointX, targetY = e.waypointY;
        if (e.state === 'chase' || e.state === 'attack') {
          targetX = p.x; targetY = p.y;
        } else if (e.state === 'flee') {
          targetX = p.x - dx * 2; targetY = p.y - dy * 2;
        }

        // Patrol: refresh waypoint
        e.waypointTimer -= dt;
        if (e.state === 'patrol' && (e.waypointTimer <= 0 || Math.hypot(e.x - e.waypointX, e.y - e.waypointY) < 20)) {
          e.waypointX = 60 + Math.random() * (WORLD_W - 120);
          e.waypointY = 60 + Math.random() * (WORLD_H - 120);
          e.waypointTimer = 120;
        }

        const toTargetAngle = Math.atan2(targetY - e.y, targetX - e.x);
        // Smoothly rotate body toward target
        let da = toTargetAngle - e.angle;
        while (da >  Math.PI) da -= Math.PI * 2;
        while (da < -Math.PI) da += Math.PI * 2;
        e.angle += Math.sign(da) * Math.min(Math.abs(da), 0.04 * dt);
        e.turretAngle = Math.atan2(p.y - e.y, p.x - e.x);

        const eSpeed = e.speed * dt;
        e.x += Math.cos(e.angle) * eSpeed;
        e.y += Math.sin(e.angle) * eSpeed;
        pushOutOfWalls(e, s.walls);

        // Enemy shoot
        if (e.fireCooldown > 0) e.fireCooldown -= dt;
        if (e.fireCooldown <= 0 && dist < detectR + 100) {
          const bx = e.x + Math.cos(e.turretAngle) * (TURRET_LEN + 6);
          const by = e.y + Math.sin(e.turretAngle) * (TURRET_LEN + 6);
          s.bullets.push(makeBullet(bx, by, e.turretAngle, 'enemy', e.damage));
          e.fireCooldown = e.fireRate;
        }
      }

      // ── Bullets ──
      for (let i = s.bullets.length - 1; i >= 0; i--) {
        const b = s.bullets[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life -= dt;

        // Wall collision
        let hitWall = false;
        for (const w of s.walls) {
          if (circleRectOverlap(b.x, b.y, BULLET_R, w.x, w.y, w.w, w.h)) {
            hitWall = true;
            spawnExplosion(s, b.x, b.y, '#888', 4);
            break;
          }
        }
        if (hitWall || b.life <= 0 || b.x < 0 || b.x > WORLD_W || b.y < 0 || b.y > WORLD_H) {
          s.bullets.splice(i, 1);
          continue;
        }

        // Hit player
        if (b.owner === 'enemy' && p.invulnTimer <= 0) {
          if (Math.hypot(b.x - p.x, b.y - p.y) < 22) {
            if (p.shieldTimer <= 0) {
              p.hp -= b.damage;
              spawnExplosion(s, b.x, b.y, '#ff4444', 8);
            } else {
              spawnExplosion(s, b.x, b.y, '#aa44ff', 6);
            }
            p.invulnTimer = 15; // brief invuln after hit
            s.bullets.splice(i, 1);
            if (p.hp <= 0) {
              s.gameOver = true;
              spawnExplosion(s, p.x, p.y, '#ff8800', 30);
            }
            continue;
          }
        }

        // Hit enemies
        if (b.owner === 'player') {
          for (let j = s.enemies.length - 1; j >= 0; j--) {
            const e = s.enemies[j];
            if (e.hp <= 0) continue;
            if (Math.hypot(b.x - e.x, b.y - e.y) < 22) {
              e.hp -= b.damage;
              spawnExplosion(s, b.x, b.y, e.color, 8);
              s.bullets.splice(i, 1);
              if (e.hp <= 0) {
                spawnExplosion(s, e.x, e.y, e.color, 24);
                s.score += CONFIGS[e.type].score;
                s.enemies.splice(j, 1);
              }
              break;
            }
          }
        }
      }

      // ── Power-ups ──
      for (let i = s.powerUps.length - 1; i >= 0; i--) {
        const pu = s.powerUps[i];
        pu.pulse = (pu.pulse + 0.05 * dt) % (Math.PI * 2);
        if (Math.hypot(p.x - pu.x, p.y - pu.y) < 26) {
          switch (pu.type) {
            case 'health': p.hp = Math.min(p.maxHp, p.hp + 30); break;
            case 'ammo':   p.ammo = Math.min(p.maxAmmo, p.ammo + 15); break;
            case 'speed':  p.speedTimer = 300; break;
            case 'shield': p.shieldTimer = 240; break;
          }
          spawnExplosion(s, pu.x, pu.y, POWERUP_COLORS[pu.type], 10);
          s.powerUps.splice(i, 1);
          // Respawn another power-up elsewhere
          const pos = findSpawn(s.walls, p.x, p.y, 200);
          const types = ['health', 'ammo', 'speed', 'shield'];
          s.powerUps.push(makePowerUp(pos.x, pos.y, types[Math.floor(Math.random() * types.length)]));
        }
      }

      // ── Particles ──
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.vx *= 0.92;
        pt.vy *= 0.92;
        pt.life -= dt;
        if (pt.life <= 0) s.particles.splice(i, 1);
      }

      // ── Spawn more enemies ──
      s.spawnTimer += dt / 60;
      if (s.spawnTimer >= s.spawnInterval) {
        s.spawnTimer = 0;
        s.spawnInterval = Math.max(6, s.spawnInterval - 0.5);
        const difficulty = Math.floor(s.elapsed / 30);
        const typeRoll = Math.random();
        const type = typeRoll < 0.4 + difficulty * 0.05 ? 'fast' :
                     typeRoll < 0.7 + difficulty * 0.03 ? 'basic' : 'heavy';
        const pos = findSpawn(s.walls, p.x, p.y);
        s.enemies.push(makeTank(type, pos.x, pos.y));
      }

      // ── Camera smooth follow ──
      cam.x += (p.x - cam.x) * 0.1 * dt;
      cam.y += (p.y - cam.y) * 0.1 * dt;
      cam.x = Math.max(canvas.width / 2, Math.min(WORLD_W - canvas.width / 2, cam.x));
      cam.y = Math.max(canvas.height / 2, Math.min(WORLD_H - canvas.height / 2, cam.y));

      // ── HUD update (every 6 frames) ──
      hudTimer += dt;
      if (hudTimer >= 6) {
        hudTimer = 0;
        setHud({
          hp: Math.max(0, p.hp),
          maxHp: p.maxHp,
          ammo: p.ammo,
          maxAmmo: CONFIGS.player.ammo,
          score: s.score,
          elapsed: Math.floor(s.elapsed),
          shield: p.shieldTimer > 0,
          speed: p.speedTimer > 0,
          gameOver: s.gameOver,
        });
      }

      if (s.gameOver) {
        setHud(h => ({ ...h, gameOver: true }));
        if (onGameOverRef.current && !gameOverTimeoutRef.current) {
          gameOverTimeoutRef.current = setTimeout(() => {
            onGameOverRef.current?.(s.score);
            gameOverTimeoutRef.current = null;
          }, 1500);
        }
      }

      drawFrame(canvas, s, pausedRef.current);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (gameOverTimeoutRef.current) {
        clearTimeout(gameOverTimeoutRef.current);
        gameOverTimeoutRef.current = null;
      }
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup',   onKey);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('mousedown', onMouse);
      window.removeEventListener('mouseup',   onMouse);
      canvas.removeEventListener('touchstart', onTouch);
      canvas.removeEventListener('touchmove',  onTouch);
    };
  }, [initGame]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60), s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />

      {/* HUD */}
      {!hud.gameOver && (
        <div style={{
          position: 'fixed', top: 60, left: 16, zIndex: 500,
          display: 'flex', flexDirection: 'column', gap: 6,
          fontFamily: 'Courier New, monospace', color: '#fff', fontSize: 13,
          pointerEvents: 'none',
        }}>
          {/* Health bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#ff5577', width: 20 }}>❤️</span>
            <div style={{ width: 120, height: 10, background: '#333', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                width: `${(hud.hp / hud.maxHp) * 100}%`, height: '100%',
                background: hud.hp > 50 ? '#00ff88' : hud.hp > 25 ? '#ffaa00' : '#ff4444',
                transition: 'width 0.15s',
              }} />
            </div>
            <span style={{ color: '#aaa' }}>{Math.max(0, hud.hp)}/{hud.maxHp}</span>
          </div>
          {/* Ammo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 20 }}>🔫</span>
            <div style={{ width: 120, height: 10, background: '#333', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                width: `${(hud.ammo / hud.maxAmmo) * 100}%`, height: '100%',
                background: '#ffdd00',
              }} />
            </div>
            <span style={{ color: '#aaa' }}>{hud.ammo}</span>
          </div>
          {/* Active power-ups */}
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            {hud.shield && <span style={{ background: '#aa44ff44', border: '1px solid #aa44ff', borderRadius: 4, padding: '2px 6px' }}>🛡️ Shield</span>}
            {hud.speed  && <span style={{ background: '#00ccff44', border: '1px solid #00ccff', borderRadius: 4, padding: '2px 6px' }}>⚡ Speed</span>}
          </div>
        </div>
      )}

      {/* Top-right: score + time */}
      {!hud.gameOver && (
        <div style={{
          position: 'fixed', top: 60, right: 16, zIndex: 500,
          fontFamily: 'Courier New, monospace', color: '#fff', fontSize: 14,
          textAlign: 'right', pointerEvents: 'none',
        }}>
          <div style={{ color: '#00ffff', fontSize: 20, fontWeight: 'bold' }}>
            {hud.score.toLocaleString()}
          </div>
          <div style={{ color: '#888' }}>{formatTime(hud.elapsed)}</div>
        </div>
      )}

      {/* Restart button on game over */}
      {hud.gameOver && (
        <div style={{
          position: 'fixed', top: '60%', left: '50%', transform: 'translate(-50%, -50%)',
          zIndex: 1000, display: 'flex', gap: 16,
        }}>
          <button
            onClick={() => { initGame(); }}
            style={{
              padding: '12px 28px', fontSize: 18, fontFamily: 'Courier New',
              background: 'rgba(0,255,136,0.15)', border: '2px solid #00ff88',
              color: '#00ff88', borderRadius: 10, cursor: 'pointer',
            }}
          >
            🔄 PLAY AGAIN
          </button>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '12px 28px', fontSize: 18, fontFamily: 'Courier New',
              background: 'rgba(0,255,255,0.1)', border: '2px solid #00ffff',
              color: '#00ffff', borderRadius: 10, cursor: 'pointer',
            }}
          >
            🏠 HOME
          </button>
        </div>
      )}
    </div>
  );
}

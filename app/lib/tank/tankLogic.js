// Pure Tank Battle game logic: world constants, entity factories, collision
// and spawning. No React or canvas here, so it is unit-tested directly
// (tests/tank/tankLogic.test.js). Extracted unchanged from TankGame.jsx.

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

export {
  WORLD_W,
  WORLD_H,
  TANK_W,
  TANK_H,
  TURRET_LEN,
  BULLET_SPEED,
  BULLET_LIFE,
  BULLET_R,
  CONFIGS,
  POWERUP_COLORS,
  POWERUP_LABELS,
  buildWalls,
  rectOverlap,
  circleRectOverlap,
  findSpawn,
  makeTank,
  makeBullet,
  makePowerUp,
  scatterPowerUps,
  pushOutOfWalls,
  spawnExplosion,
};

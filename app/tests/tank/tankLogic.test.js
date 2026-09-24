import {
  WORLD_W,
  WORLD_H,
  BULLET_SPEED,
  BULLET_LIFE,
  CONFIGS,
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
} from '../../lib/tank/tankLogic';

describe('rectOverlap', () => {
  it('detects overlapping rectangles', () => {
    expect(rectOverlap(0, 0, 10, 10, 5, 5, 10, 10)).toBe(true);
  });
  it('treats touching edges as not overlapping', () => {
    expect(rectOverlap(0, 0, 10, 10, 10, 0, 10, 10)).toBe(false);
  });
  it('rejects separated rectangles on either axis', () => {
    expect(rectOverlap(0, 0, 10, 10, 50, 0, 10, 10)).toBe(false);
    expect(rectOverlap(0, 0, 10, 10, 0, 50, 10, 10)).toBe(false);
  });
});

describe('circleRectOverlap', () => {
  it('is true when the centre is inside the rect', () => {
    expect(circleRectOverlap(5, 5, 1, 0, 0, 10, 10)).toBe(true);
  });
  it('uses the nearest point on the rect, not its centre', () => {
    expect(circleRectOverlap(14, 5, 5, 0, 0, 10, 10)).toBe(true); // 4px from edge
    expect(circleRectOverlap(16, 5, 5, 0, 0, 10, 10)).toBe(false); // 6px from edge
  });
  it('handles corners by true distance', () => {
    expect(circleRectOverlap(13, 13, 4, 0, 0, 10, 10)).toBe(false); // ~4.24px away
    expect(circleRectOverlap(13, 13, 5, 0, 0, 10, 10)).toBe(true);
  });
});

describe('buildWalls', () => {
  afterEach(() => jest.restoreAllMocks());

  it('always creates the 4 world borders first', () => {
    const walls = buildWalls();
    expect(walls.slice(0, 4)).toEqual([
      { x: 0, y: 0, w: WORLD_W, h: 18 },
      { x: 0, y: WORLD_H - 18, w: WORLD_W, h: 18 },
      { x: 0, y: 0, w: 18, h: WORLD_H },
      { x: WORLD_W - 18, y: 0, w: 18, h: WORLD_H },
    ]);
  });

  it('keeps a clear spawn zone around the centre', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0); // place a wall in every allowed cell
    const interior = buildWalls().slice(4);
    expect(interior.length).toBeGreaterThan(0);
    for (const w of interior) {
      expect(Math.hypot(w.x - WORLD_W / 2, w.y - WORLD_H / 2)).toBeGreaterThanOrEqual(520);
    }
  });

  it('builds vertical walls when the orientation roll is low', () => {
    // Per cell: density (0.1 passes <= 0.22), long, short, orientation.
    // Orientation > 0.5 builds a horizontal wall, so 0.1 selects vertical.
    const rolls = [0.1, 0.5, 0.5, 0.1];
    let i = 0;
    jest.spyOn(Math, 'random').mockImplementation(() => rolls[i++ % rolls.length]);
    const interior = buildWalls().slice(4);
    expect(interior.length).toBeGreaterThan(0);
    for (const w of interior) expect(w.h).toBeGreaterThan(w.w);
  });

  it('produces only borders when every cell fails the density roll', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.99);
    expect(buildWalls()).toHaveLength(4);
  });
});

describe('findSpawn', () => {
  afterEach(() => jest.restoreAllMocks());

  it('rejects a candidate inside a wall and returns the next clear one', () => {
    // Candidate coord = 100 + r * (WORLD - 200). The first (x, y) roll lands at
    // (1200, 1200), inside the wall. The second lands at (2800, 2800), clear of it.
    const wall = { x: 1000, y: 1000, w: 400, h: 400 };
    const first = (1200 - 100) / (WORLD_W - 200);
    const rolls = [first, first, 0.9, 0.9];
    let i = 0;
    jest.spyOn(Math, 'random').mockImplementation(() => rolls[i++]);
    const p = findSpawn([wall], 0, 0, 500);
    expect(p.x).toBeCloseTo(2800);
    expect(p.y).toBeCloseTo(2800);
    expect(i).toBe(4); // exactly two attempts: one rejected, one accepted
    expect(circleRectOverlap(p.x, p.y, 30, wall.x, wall.y, wall.w, wall.h)).toBe(false);
  });

  it('falls back to (200, 200) when every attempt is blocked', () => {
    const everything = [{ x: 0, y: 0, w: WORLD_W, h: WORLD_H }];
    expect(findSpawn(everything, 0, 0, 0)).toEqual({ x: 200, y: 200 });
  });

  it('skips candidates too close to the player', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5); // always the map centre
    expect(findSpawn([], WORLD_W / 2, WORLD_H / 2, 500)).toEqual({ x: 200, y: 200 });
  });
});

describe('entity factories', () => {
  it('gives the player finite ammo from its config', () => {
    const t = makeTank('player', 10, 20, 1);
    expect(t).toMatchObject({
      type: 'player', x: 10, y: 20, angle: 1, turretAngle: 1,
      hp: CONFIGS.player.hp, maxHp: CONFIGS.player.hp,
      ammo: CONFIGS.player.ammo, maxAmmo: CONFIGS.player.ammo, state: 'patrol',
    });
  });

  it('gives enemies infinite ammo and a default angle of 0', () => {
    const t = makeTank('heavy', 0, 0);
    expect(t.ammo).toBe(Infinity);
    expect(t.angle).toBe(0);
    expect(t.damage).toBe(CONFIGS.heavy.damage);
  });

  it('fires bullets along the angle at BULLET_SPEED', () => {
    const b = makeBullet(0, 0, 0, 'player', 30);
    expect(b.vx).toBeCloseTo(BULLET_SPEED);
    expect(b.vy).toBeCloseTo(0);
    expect(b).toMatchObject({ owner: 'player', damage: 30, life: BULLET_LIFE });
  });

  it('creates power-ups with a pulse counter', () => {
    expect(makePowerUp(1, 2, 'shield')).toMatchObject({ x: 1, y: 2, type: 'shield', pulse: 0 });
  });
});

describe('scatterPowerUps', () => {
  it('creates the requested count of valid power-ups clear of walls', () => {
    const walls = [{ x: 500, y: 500, w: 400, h: 400 }];
    const items = scatterPowerUps(walls, 25);
    expect(items).toHaveLength(25);
    for (const it of items) {
      expect(['health', 'ammo', 'speed', 'shield']).toContain(it.type);
      expect(circleRectOverlap(it.x, it.y, 25, 500, 500, 400, 400)).toBe(false);
    }
  });

  it('defaults to 16 items', () => {
    expect(scatterPowerUps([])).toHaveLength(16);
  });

  it('re-rolls a position that lands inside a wall', () => {
    // First roll lands in the wall's area (x=y=80+0.2*3040=688); later rolls are clear.
    const rolls = [0.2, 0.2, 0.9, 0.9, 0];
    let i = 0;
    const spy = jest.spyOn(Math, 'random').mockImplementation(() => rolls[Math.min(i++, rolls.length - 1)]);
    const [item] = scatterPowerUps([{ x: 600, y: 600, w: 200, h: 200 }], 1);
    spy.mockRestore();
    expect(circleRectOverlap(item.x, item.y, 25, 600, 600, 200, 200)).toBe(false);
  });
});

describe('pushOutOfWalls', () => {
  const wall = { x: 1000, y: 1000, w: 100, h: 100 };

  it.each([
    ['left', { x: 995, y: 1050 }, { x: 1000 - 18 }],
    ['right', { x: 1105, y: 1050 }, { x: 1100 + 18 }],
    ['top', { x: 1050, y: 995 }, { y: 1000 - 18 }],
    ['bottom', { x: 1050, y: 1105 }, { y: 1100 + 18 }],
  ])('pushes an entity out through the %s edge', (_side, start, expected) => {
    const e = { ...start };
    pushOutOfWalls(e, [wall]);
    expect(e).toMatchObject(expected);
  });

  it('leaves entities that are clear of walls alone', () => {
    const e = { x: 500, y: 500 };
    pushOutOfWalls(e, [wall]);
    expect(e).toEqual({ x: 500, y: 500 });
  });

  it('clamps entities inside the world bounds', () => {
    const e = { x: -50, y: WORLD_H + 50 };
    pushOutOfWalls(e, []);
    expect(e).toEqual({ x: 30, y: WORLD_H - 30 });
  });
});

describe('spawnExplosion', () => {
  it('adds the requested number of particles in the given colour', () => {
    const state = { particles: [] };
    spawnExplosion(state, 5, 6, '#fff', 4);
    expect(state.particles).toHaveLength(4);
    for (const p of state.particles) expect(p).toMatchObject({ x: 5, y: 6, color: '#fff', maxLife: 55 });
  });

  it('defaults to 16 particles', () => {
    const state = { particles: [] };
    spawnExplosion(state, 0, 0, '#000');
    expect(state.particles).toHaveLength(16);
  });
});

import { ObjectPool, ParticlePool, getGlobalParticlePool } from '@/lib/shared/physics/ObjectPool';

describe('ObjectPool', () => {
  it('pre-populates the pool with initialSize objects', () => {
    const create = jest.fn(() => ({}));
    const pool = new ObjectPool(create, 5);
    expect(create).toHaveBeenCalledTimes(5);
    expect(pool.getStats()).toEqual({ available: 5, active: 0, total: 5 });
  });

  it('defaults to 50 pre-created objects', () => {
    const pool = new ObjectPool(() => ({}));
    expect(pool.getStats().available).toBe(50);
  });

  it('reuses pooled objects before creating new ones', () => {
    const create = jest.fn(() => ({}));
    const pool = new ObjectPool(create, 1);
    const a = pool.acquire();
    expect(create).toHaveBeenCalledTimes(1);
    const b = pool.acquire(); // pool empty -> creates
    expect(create).toHaveBeenCalledTimes(2);
    expect(a).not.toBe(b);
    expect(pool.getStats()).toEqual({ available: 0, active: 2, total: 2 });
  });

  it('returns released objects on the next acquire', () => {
    const pool = new ObjectPool(() => ({}), 0);
    const a = pool.acquire();
    pool.release(a);
    expect(pool.acquire()).toBe(a);
  });

  it('ignores releasing an object that is not active (no double-release)', () => {
    const pool = new ObjectPool(() => ({}), 0);
    const a = pool.acquire();
    pool.release(a);
    pool.release(a);
    pool.release({ foreign: true });
    expect(pool.getStats()).toEqual({ available: 1, active: 0, total: 1 });
  });

  it('releaseAll returns every active object', () => {
    const pool = new ObjectPool(() => ({}), 0);
    pool.acquire();
    pool.acquire();
    pool.acquire();
    pool.releaseAll();
    expect(pool.getStats()).toEqual({ available: 3, active: 0, total: 3 });
  });
});

describe('ParticlePool', () => {
  it('creates inactive default particles', () => {
    const pool = new ParticlePool(2);
    const p = pool.pool[0];
    expect(p).toMatchObject({
      position: [0, 0, 0],
      lifetime: 0,
      maxLifetime: 1,
      scale: 1,
      color: '#ffffff',
      active: false,
    });
    expect(typeof p.id).toBe('string');
  });

  it('defaults to 200 particles', () => {
    expect(new ParticlePool().getStats().available).toBe(200);
  });

  it('acquireParticle applies config values', () => {
    const pool = new ParticlePool(1);
    const p = pool.acquireParticle({
      position: [1, 2, 3],
      velocity: [4, 5, 6],
      rotation: [0.1, 0.2, 0.3],
      rotationSpeed: [1, 1, 1],
      maxLifetime: 3,
      scale: 2,
      color: '#ff0000',
    });
    expect(p).toMatchObject({
      position: [1, 2, 3],
      velocity: [4, 5, 6],
      rotation: [0.1, 0.2, 0.3],
      rotationSpeed: [1, 1, 1],
      lifetime: 0,
      maxLifetime: 3,
      scale: 2,
      color: '#ff0000',
      active: true,
    });
  });

  it('acquireParticle resets a recycled particle to defaults', () => {
    const pool = new ParticlePool(0);
    const p = pool.acquireParticle({ scale: 5, color: '#000', maxLifetime: 9 });
    p.lifetime = 4;
    pool.release(p);
    const again = pool.acquireParticle();
    expect(again).toBe(p);
    expect(again).toMatchObject({ lifetime: 0, scale: 1, color: '#ffffff', maxLifetime: 1 });
  });

  it('updateParticles integrates position/rotation and returns live particles', () => {
    const pool = new ParticlePool(0);
    pool.acquireParticle({
      position: [0, 0, 0],
      velocity: [2, -4, 6],
      rotationSpeed: [1, 2, 3],
      maxLifetime: 10,
    });
    const live = pool.updateParticles(0.5);
    expect(live).toHaveLength(1);
    expect(live[0].position).toEqual([1, -2, 3]);
    expect(live[0].rotation).toEqual([0.5, 1, 1.5]);
    expect(live[0].lifetime).toBe(0.5);
  });

  it('updateParticles releases expired particles back to the pool', () => {
    const pool = new ParticlePool(0);
    pool.acquireParticle({ maxLifetime: 1 });
    pool.acquireParticle({ maxLifetime: 5 });
    const live = pool.updateParticles(1); // first reaches lifetime == maxLifetime
    expect(live).toHaveLength(1);
    expect(pool.getStats()).toEqual({ available: 1, active: 1, total: 2 });
  });
});

describe('getGlobalParticlePool', () => {
  it('returns a lazily created singleton', () => {
    const a = getGlobalParticlePool();
    expect(a).toBeInstanceOf(ParticlePool);
    expect(a.getStats().total).toBe(300);
    expect(getGlobalParticlePool()).toBe(a);
  });
});

/**
 * Generic object pool for reusing objects instead of constantly creating/destroying them.
 * Reduces garbage collection pressure and improves performance.
 * 
 * Usage:
 *   const pool = new ObjectPool(() => ({ x: 0, y: 0, active: false }), 100);
 *   const obj = pool.acquire(); // Get object from pool
 *   obj.active = true;
 *   // ... use object
 *   pool.release(obj); // Return to pool
 */
export class ObjectPool {
  constructor(createFn, initialSize = 50) {
    this.createFn = createFn;
    this.pool = [];
    this.active = new Set();
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  /**
   * Get an object from the pool. If pool is empty, creates a new one.
   */
  acquire() {
    let obj;
    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else {
      obj = this.createFn();
    }
    this.active.add(obj);
    return obj;
  }

  /**
   * Return an object to the pool for reuse.
   */
  release(obj) {
    if (!this.active.has(obj)) return;
    
    this.active.delete(obj);
    this.pool.push(obj);
  }

  /**
   * Release all active objects back to pool.
   */
  releaseAll() {
    this.active.forEach((obj) => {
      this.pool.push(obj);
    });
    this.active.clear();
  }

  /**
   * Get current pool stats for debugging.
   */
  getStats() {
    return {
      available: this.pool.length,
      active: this.active.size,
      total: this.pool.length + this.active.size,
    };
  }
}

/**
 * Specialized particle pool that works with React Three Fiber particle systems.
 * Includes common particle properties like position, velocity, lifetime.
 */
export class ParticlePool extends ObjectPool {
  constructor(initialSize = 200) {
    super(
      () => ({
        id: Math.random().toString(36),
        position: [0, 0, 0],
        velocity: [0, 0, 0],
        rotation: [0, 0, 0],
        rotationSpeed: [0, 0, 0],
        lifetime: 0,
        maxLifetime: 1,
        scale: 1,
        color: '#ffffff',
        active: false,
      }),
      initialSize
    );
  }

  /**
   * Acquire a particle with initialized values.
   */
  acquireParticle(config = {}) {
    const particle = this.acquire();
    
    // Reset/initialize particle properties
    particle.position = config.position || [0, 0, 0];
    particle.velocity = config.velocity || [0, 0, 0];
    particle.rotation = config.rotation || [0, 0, 0];
    particle.rotationSpeed = config.rotationSpeed || [0, 0, 0];
    particle.lifetime = 0;
    particle.maxLifetime = config.maxLifetime || 1;
    particle.scale = config.scale || 1;
    particle.color = config.color || '#ffffff';
    particle.active = true;
    
    return particle;
  }

  /**
   * Update all active particles and automatically release expired ones.
   * Returns array of active particles.
   */
  updateParticles(deltaTime) {
    const activeParticles = [];
    const toRelease = [];
    
    this.active.forEach((particle) => {
      particle.lifetime += deltaTime;
      
      if (particle.lifetime >= particle.maxLifetime) {
        toRelease.push(particle);
      } else {
        // Update position based on velocity
        particle.position[0] += particle.velocity[0] * deltaTime;
        particle.position[1] += particle.velocity[1] * deltaTime;
        particle.position[2] += particle.velocity[2] * deltaTime;
        
        // Update rotation
        particle.rotation[0] += particle.rotationSpeed[0] * deltaTime;
        particle.rotation[1] += particle.rotationSpeed[1] * deltaTime;
        particle.rotation[2] += particle.rotationSpeed[2] * deltaTime;
        
        activeParticles.push(particle);
      }
    });
    
    // Release expired particles
    toRelease.forEach((p) => this.release(p));
    
    return activeParticles;
  }
}

// Singleton particle pool instance for global use
let globalParticlePool = null;

export function getGlobalParticlePool() {
  if (!globalParticlePool) {
    globalParticlePool = new ParticlePool(300); // Larger pool for entire game
  }
  return globalParticlePool;
}

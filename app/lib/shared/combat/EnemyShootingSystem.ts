export interface Bullet {
    x: number;
    y: number;
    width: number;
    height: number;
    velocity: number;
    active: boolean;
    isPlayer: boolean;
}

export class EnemyShootingSystem {
    bullets: Bullet[] = [];
    fireTimer: number = 0;
    baseFireRate: number = 2000; // ms

    constructor() { }

    update(dt: number, activeEnemies: number, wave: number) {
        // Update existing bullets
        this.bullets.forEach(bullet => {
            if (!bullet.active) return;
            bullet.y += bullet.velocity * (dt * 60);

            // Deactivate if off screen
            if (bullet.y > 800 || bullet.y < 0) {
                bullet.active = false;
            }
        });

        // Cleanup
        this.bullets = this.bullets.filter(b => b.active);

        // Shooting logic
        this.fireTimer += dt * 1000;

        // Fire rate increases with wave and decreases as enemies die (fewer shooters but more desperate?)
        // Actually, usually fire rate is constant per enemy, or global rate increases.
        // Let's go with global rate increases with wave.
        const currentFireRate = Math.max(500, this.baseFireRate - (wave * 200));

        if (this.fireTimer > currentFireRate && activeEnemies > 0) {
            this.fireTimer = 0;
            return true; // Signal to fire
        }
        return false;
    }

    spawnBullet(x: number, y: number, isPlayer: boolean = false) {
        this.bullets.push({
            x,
            y,
            width: 4,
            height: 10,
            velocity: isPlayer ? -10 : 5,
            active: true,
            isPlayer
        });
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.bullets.forEach(bullet => {
            if (!bullet.active) return;
            ctx.fillStyle = bullet.isPlayer ? '#00ff00' : '#ff0000';
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    }

    reset() {
        this.bullets = [];
        this.fireTimer = 0;
    }
}

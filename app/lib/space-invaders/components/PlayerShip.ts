import { EnemyShootingSystem } from '@/lib/shared/combat/EnemyShootingSystem';

export class PlayerShip {
    x: number;
    y: number;
    width: number = 40;
    height: number = 20;
    speed: number = 300;
    canvasWidth: number;

    constructor(canvasWidth: number) {
        this.canvasWidth = canvasWidth;
        this.x = canvasWidth / 2 - this.width / 2;
        this.y = 550;
    }

    update(dt: number, input: { left: boolean, right: boolean, fire: boolean }, shootingSystem: EnemyShootingSystem) {
        if (input.left) {
            this.x -= this.speed * dt;
        }
        if (input.right) {
            this.x += this.speed * dt;
        }

        // Clamp to screen
        this.x = Math.max(0, Math.min(this.canvasWidth - this.width, this.x));

        // Shooting
        if (input.fire) {
            // Check if player already has a bullet on screen? 
            // Original Space Invaders only allowed one shot at a time.
            const playerBullets = shootingSystem.bullets.filter(b => b.isPlayer && b.active);
            if (playerBullets.length === 0) {
                shootingSystem.spawnBullet(this.x + this.width / 2 - 2, this.y, true);
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = '#00ff00';
        // Simple ship shape
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.fill();
    }

    reset() {
        this.x = this.canvasWidth / 2 - this.width / 2;
    }
}

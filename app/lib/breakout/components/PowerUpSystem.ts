import { Paddle } from './Paddle';

export type PowerUpType = 'multiBall' | 'expandPaddle' | 'slowBall' | 'laserPaddle';

export interface PowerUpDrop {
    x: number;
    y: number;
    width: number;
    height: number;
    type: PowerUpType;
    active: boolean;
    velocity: number;
}

export class PowerUpSystem {
    drops: PowerUpDrop[] = [];

    spawn(x: number, y: number) {
        // 10% chance to drop
        if (Math.random() > 0.1) return;

        const types: PowerUpType[] = ['multiBall', 'expandPaddle', 'slowBall', 'laserPaddle'];
        const type = types[Math.floor(Math.random() * types.length)];

        this.drops.push({
            x,
            y,
            width: 20,
            height: 20,
            type,
            active: true,
            velocity: 2, // Falling speed
        });
    }

    update(dt: number, paddle: Paddle, onCollect: (type: PowerUpType) => void) {
        this.drops.forEach(drop => {
            if (!drop.active) return;

            drop.y += drop.velocity;

            // Check collision with paddle
            if (
                drop.x < paddle.x + paddle.getCurrentWidth() &&
                drop.x + drop.width > paddle.x &&
                drop.y < paddle.y + paddle.height &&
                drop.y + drop.height > paddle.y
            ) {
                drop.active = false;
                onCollect(drop.type);
            }

            // Deactivate if off screen
            if (drop.y > 800) { // Assuming 800 height for now
                drop.active = false;
            }
        });

        // Cleanup inactive drops
        this.drops = this.drops.filter(d => d.active);
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.drops.forEach(drop => {
            if (!drop.active) return;

            ctx.fillStyle = this.getColorForType(drop.type);
            ctx.fillRect(drop.x, drop.y, drop.width, drop.height);

            // Draw icon/text
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(drop.type[0].toUpperCase(), drop.x + 10, drop.y + 15);
        });
    }

    getColorForType(type: PowerUpType): string {
        switch (type) {
            case 'multiBall': return '#3498db';
            case 'expandPaddle': return '#2ecc71';
            case 'slowBall': return '#f1c40f';
            case 'laserPaddle': return '#e74c3c';
            default: return '#ffffff';
        }
    }
}

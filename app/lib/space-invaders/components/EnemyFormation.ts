import { Bullet } from '@/lib/shared/combat/EnemyShootingSystem';

export interface Enemy {
    x: number;
    y: number;
    width: number;
    height: number;
    row: number;
    col: number;
    active: boolean;
    type: number; // 0, 1, 2 for different sprites/scores
}

export class EnemyFormation {
    enemies: Enemy[] = [];
    rows: number = 5;
    cols: number = 11;
    direction: number = 1; // 1 = right, -1 = left
    moveSpeed: number = 50;
    dropDistance: number = 20;
    canvasWidth: number;

    constructor(canvasWidth: number) {
        this.canvasWidth = canvasWidth;
    }

    init(level: number) {
        this.enemies = [];
        const startX = 50;
        const startY = 50;
        const padding = 15;
        const width = 30;
        const height = 20;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.enemies.push({
                    x: startX + c * (width + padding),
                    y: startY + r * (height + padding),
                    width,
                    height,
                    row: r,
                    col: c,
                    active: true,
                    type: Math.floor(r / 2) // 0, 0, 1, 1, 2
                });
            }
        }

        // Speed increases with level
        this.moveSpeed = 50 + (level - 1) * 10;
    }

    update(dt: number) {
        let hitEdge = false;

        // Move enemies
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            enemy.x += this.moveSpeed * this.direction * dt;

            if (this.direction === 1 && enemy.x + enemy.width > this.canvasWidth - 20) {
                hitEdge = true;
            } else if (this.direction === -1 && enemy.x < 20) {
                hitEdge = true;
            }
        });

        if (hitEdge) {
            this.direction *= -1;
            this.enemies.forEach(enemy => {
                enemy.y += this.dropDistance;
            });
            // Increase speed slightly on drop
            this.moveSpeed += 5;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;

            ctx.fillStyle = enemy.type === 0 ? '#ff00ff' : enemy.type === 1 ? '#00ffff' : '#ffff00';
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

            // Simple animation frame logic could go here
        });
    }

    checkCollision(bullet: Bullet): Enemy | null {
        for (let enemy of this.enemies) {
            if (!enemy.active) continue;

            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                enemy.active = false;
                return enemy;
            }
        }
        return null;
    }

    getActiveCount(): number {
        return this.enemies.filter(e => e.active).length;
    }

    getLowestEnemyY(): number {
        let maxY = 0;
        this.enemies.forEach(e => {
            if (e.active && e.y + e.height > maxY) {
                maxY = e.y + e.height;
            }
        });
        return maxY;
    }
}

import { Ball } from './Ball';

export interface Brick {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    value: number;
    active: boolean;
    hitsRequired: number;
}

export class BrickGrid {
    rows: number;
    cols: number;
    bricks: Brick[] = [];
    padding: number = 10;
    offsetTop: number = 60;
    offsetLeft: number = 35;
    brickWidth: number = 75;
    brickHeight: number = 20;

    constructor(rows: number = 8, cols: number = 10) {
        this.rows = rows;
        this.cols = cols;
    }

    init(level: number) {
        this.bricks = [];
        const colors = ['#c0392b', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#8e44ad', '#ecf0f1'];

        for (let c = 0; c < this.cols; c++) {
            for (let r = 0; r < this.rows; r++) {
                const brickX = (c * (this.brickWidth + this.padding)) + this.offsetLeft;
                const brickY = (r * (this.brickHeight + this.padding)) + this.offsetTop;

                // Higher levels have more durable bricks
                const hitsRequired = (level > 1 && r < 2) ? 2 : 1;

                this.bricks.push({
                    x: brickX,
                    y: brickY,
                    width: this.brickWidth,
                    height: this.brickHeight,
                    color: colors[r % colors.length],
                    value: (this.rows - r) * 10,
                    active: true,
                    hitsRequired,
                });
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.bricks.forEach(brick => {
            if (!brick.active) return;

            ctx.beginPath();
            ctx.rect(brick.x, brick.y, brick.width, brick.height);
            ctx.fillStyle = brick.hitsRequired > 1 ? darkenColor(brick.color, 20) : brick.color;
            ctx.fill();
            ctx.closePath();

            // Add shine effect
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height / 2);
        });
    }

    checkCollision(ball: Ball): Brick | null {
        for (let brick of this.bricks) {
            if (!brick.active) continue;

            if (
                ball.x + ball.radius > brick.x &&
                ball.x - ball.radius < brick.x + brick.width &&
                ball.y + ball.radius > brick.y &&
                ball.y - ball.radius < brick.y + brick.height
            ) {
                // Simple AABB collision response
                // Determine which side was hit
                const overlapLeft = (ball.x + ball.radius) - brick.x;
                const overlapRight = (brick.x + brick.width) - (ball.x - ball.radius);
                const overlapTop = (ball.y + ball.radius) - brick.y;
                const overlapBottom = (brick.y + brick.height) - (ball.y - ball.radius);

                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                if (minOverlap === overlapLeft || minOverlap === overlapRight) {
                    ball.bounceX();
                } else {
                    ball.bounceY();
                }

                brick.hitsRequired--;
                if (brick.hitsRequired <= 0) {
                    brick.active = false;
                    return brick;
                }
                return null; // Hit but not destroyed
            }
        }
        return null;
    }

    getActiveBrickCount(): number {
        return this.bricks.filter(b => b.active).length;
    }
}

function darkenColor(color: string, percent: number): string {
    // Simple helper to darken hex color (placeholder logic)
    return color;
}

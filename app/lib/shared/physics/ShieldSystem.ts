export interface ShieldBlock {
    x: number;
    y: number;
    width: number;
    height: number;
    health: number; // 0-100%
    active: boolean;
}

export class ShieldSystem {
    shields: ShieldBlock[] = [];

    constructor() { }

    init(count: number = 4, screenWidth: number = 800) {
        this.shields = [];
        const spacing = screenWidth / (count + 1);

        for (let i = 0; i < count; i++) {
            const x = spacing * (i + 1) - 40; // Center roughly
            const y = 450;

            // Create a grid of blocks for each shield to allow "erosion"
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 4; c++) {
                    this.shields.push({
                        x: x + c * 20,
                        y: y + r * 20,
                        width: 20,
                        height: 20,
                        health: 100,
                        active: true
                    });
                }
            }
        }
    }

    checkCollision(bullet: { x: number, y: number, width: number, height: number, active: boolean }): boolean {
        for (let block of this.shields) {
            if (!block.active) continue;

            if (
                bullet.x < block.x + block.width &&
                bullet.x + bullet.width > block.x &&
                bullet.y < block.y + block.height &&
                bullet.y + bullet.height > block.y
            ) {
                // Hit!
                block.health -= 34; // 3 hits to destroy
                if (block.health <= 0) {
                    block.active = false;
                }
                return true;
            }
        }
        return false;
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.shields.forEach(block => {
            if (!block.active) return;

            ctx.fillStyle = `rgba(0, 255, 255, ${block.health / 100})`;
            ctx.fillRect(block.x, block.y, block.width, block.height);
        });
    }

    reset() {
        this.shields = [];
    }
}

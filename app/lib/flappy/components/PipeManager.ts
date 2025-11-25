import { Bird } from './Bird';

export interface PipePair {
    x: number;
    gapY: number; // Top of the gap
    gapHeight: number;
    width: number;
    passed: boolean;
    active: boolean;
}

export class PipeManager {
    pipes: PipePair[] = [];
    spawnTimer: number = 0;
    spawnInterval: number = 1.5; // seconds
    speed: number = 200;
    canvasHeight: number;
    canvasWidth: number;

    constructor(width: number, height: number) {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }

    update(dt: number, onScore: () => void) {
        // Spawn
        this.spawnTimer += dt;
        if (this.spawnTimer > this.spawnInterval) {
            this.spawn();
            this.spawnTimer = 0;
        }

        // Move
        this.pipes.forEach(pipe => {
            pipe.x -= this.speed * dt;

            // Check passed
            if (!pipe.passed && pipe.x + pipe.width < 100) { // Assuming bird is at x=100
                pipe.passed = true;
                onScore();
            }

            // Deactivate
            if (pipe.x + pipe.width < 0) {
                pipe.active = false;
            }
        });

        // Cleanup
        this.pipes = this.pipes.filter(p => p.active);
    }

    spawn() {
        const gapHeight = 150;
        const minGapY = 50;
        const maxGapY = this.canvasHeight - gapHeight - 50;
        const gapY = Math.random() * (maxGapY - minGapY) + minGapY;

        this.pipes.push({
            x: this.canvasWidth,
            gapY,
            gapHeight,
            width: 60,
            passed: false,
            active: true
        });
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = '#2ecc71';

        this.pipes.forEach(pipe => {
            // Top pipe
            ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapY);

            // Bottom pipe
            ctx.fillRect(pipe.x, pipe.gapY + pipe.gapHeight, pipe.width, this.canvasHeight - (pipe.gapY + pipe.gapHeight));

            // Cap details
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(pipe.x - 2, pipe.gapY - 20, pipe.width + 4, 20); // Top cap
            ctx.fillRect(pipe.x - 2, pipe.gapY + pipe.gapHeight, pipe.width + 4, 20); // Bottom cap
            ctx.fillStyle = '#2ecc71';
        });
    }

    checkCollision(bird: Bird): boolean {
        // Ground collision
        if (bird.y + bird.height > this.canvasHeight) {
            return true;
        }

        // Ceiling collision (optional, but good practice)
        if (bird.y < 0) {
            return true;
        }

        // Pipe collision
        for (let pipe of this.pipes) {
            // Horizontal overlap
            if (bird.x + bird.width > pipe.x && bird.x < pipe.x + pipe.width) {
                // Vertical check (hit top pipe OR hit bottom pipe)
                if (bird.y < pipe.gapY || bird.y + bird.height > pipe.gapY + pipe.gapHeight) {
                    return true;
                }
            }
        }

        return false;
    }

    reset() {
        this.pipes = [];
        this.spawnTimer = 0;
    }
}

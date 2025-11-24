export interface PaddleConfig {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    speed: number;
    canvasWidth: number;
}

export class Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    speed: number;
    canvasWidth: number;
    isLaserActive: boolean = false;
    widthMultiplier: number = 1;

    constructor(config: PaddleConfig) {
        this.x = config.x;
        this.y = config.y;
        this.width = config.width;
        this.height = config.height;
        this.color = config.color;
        this.speed = config.speed;
        this.canvasWidth = config.canvasWidth;
    }

    update(dt: number, input: { left: boolean; right: boolean }) {
        if (input.left) {
            this.x -= this.speed * dt;
        }
        if (input.right) {
            this.x += this.speed * dt;
        }

        // Constrain to canvas
        if (this.x < 0) this.x = 0;
        if (this.x + this.getCurrentWidth() > this.canvasWidth) {
            this.x = this.canvasWidth - this.getCurrentWidth();
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(this.x, this.y, this.getCurrentWidth(), this.height);
        ctx.shadowBlur = 0;

        // Draw laser details if active
        if (this.isLaserActive) {
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x, this.y, 5, this.height);
            ctx.fillRect(this.x + this.getCurrentWidth() - 5, this.y, 5, this.height);
        }
    }

    getCurrentWidth(): number {
        return this.width * this.widthMultiplier;
    }

    reset(x: number) {
        this.x = x;
        this.widthMultiplier = 1;
        this.isLaserActive = false;
    }
}

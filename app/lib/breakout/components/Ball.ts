export interface BallConfig {
    x: number;
    y: number;
    radius: number;
    velocity: { x: number; y: number };
    color: string;
}

export class Ball {
    x: number;
    y: number;
    radius: number;
    velocity: { x: number; y: number };
    color: string;
    active: boolean = true;
    speedMultiplier: number = 1;

    constructor(config: BallConfig) {
        this.x = config.x;
        this.y = config.y;
        this.radius = config.radius;
        this.velocity = config.velocity;
        this.color = config.color;
    }

    update(dt: number) {
        if (!this.active) return;

        this.x += this.velocity.x * this.speedMultiplier * dt;
        this.y += this.velocity.y * this.speedMultiplier * dt;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!this.active) return;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0;
    }

    bounceX() {
        this.velocity.x = -this.velocity.x;
    }

    bounceY() {
        this.velocity.y = -this.velocity.y;
    }

    reset(x: number, y: number, velocity: { x: number; y: number }) {
        this.x = x;
        this.y = y;
        this.velocity = velocity;
        this.active = true;
        this.speedMultiplier = 1;
    }
}

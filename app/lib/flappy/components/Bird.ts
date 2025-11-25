export class Bird {
    x: number;
    y: number;
    width: number = 30;
    height: number = 30;
    velocity: number = 0;
    gravity: number = 1500;
    jumpStrength: number = -500;
    rotation: number = 0;

    constructor(startX: number, startY: number) {
        this.x = startX;
        this.y = startY;
    }

    update(dt: number) {
        this.velocity += this.gravity * dt;
        this.y += this.velocity * dt;

        // Rotation logic
        // If going up, rotate up (-30 deg). If going down, rotate down (up to 90 deg).
        if (this.velocity < 0) {
            this.rotation = Math.max(-0.5, this.rotation - 5 * dt);
        } else {
            this.rotation = Math.min(Math.PI / 2, this.rotation + 3 * dt);
        }
    }

    flap() {
        this.velocity = this.jumpStrength;
        this.rotation = -0.5;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);

        // Body
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Eye
        ctx.fillStyle = '#fff';
        ctx.fillRect(5, -10, 10, 10);
        ctx.fillStyle = '#000';
        ctx.fillRect(10, -5, 4, 4);

        // Beak
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(5, 0, 15, 8);

        ctx.restore();
    }

    reset(startY: number) {
        this.y = startY;
        this.velocity = 0;
        this.rotation = 0;
    }
}

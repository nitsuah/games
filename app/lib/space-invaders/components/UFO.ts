export class UFO {
    x: number;
    y: number = 40;
    width: number = 40;
    height: number = 20;
    active: boolean = false;
    speed: number = 150;
    direction: number = 1;
    timer: number = 0;
    spawnInterval: number = 15000; // 15 seconds
    canvasWidth: number;

    constructor(canvasWidth: number) {
        this.canvasWidth = canvasWidth;
        this.x = -100;
    }

    update(dt: number) {
        if (this.active) {
            this.x += this.speed * this.direction * dt;

            if ((this.direction === 1 && this.x > this.canvasWidth + 50) ||
                (this.direction === -1 && this.x < -50)) {
                this.active = false;
                this.timer = 0;
            }
        } else {
            this.timer += dt * 1000;
            if (this.timer > this.spawnInterval) {
                this.spawn();
            }
        }
    }

    spawn() {
        this.active = true;
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.x = this.direction === 1 ? -50 : this.canvasWidth + 50;
        // Play sound here
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!this.active) return;

        ctx.fillStyle = '#ff0000';
        // Saucer shape
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    checkCollision(bullet: { x: number, y: number, width: number, height: number }): boolean {
        if (!this.active) return false;

        if (
            bullet.x < this.x + this.width &&
            bullet.x + bullet.width > this.x &&
            bullet.y < this.y + this.height &&
            bullet.y + bullet.height > this.y
        ) {
            this.active = false;
            this.timer = 0;
            return true;
        }
        return false;
    }

    reset() {
        this.active = false;
        this.timer = 0;
    }
}

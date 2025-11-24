export class Background {
    canvasWidth: number;
    canvasHeight: number;
    cloudOffset: number = 0;
    groundOffset: number = 0;

    constructor(width: number, height: number) {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }

    update(dt: number, speed: number) {
        this.cloudOffset = (this.cloudOffset + speed * 0.2 * dt) % this.canvasWidth;
        this.groundOffset = (this.groundOffset + speed * dt) % 20; // Ground pattern repeat
    }

    draw(ctx: CanvasRenderingContext2D) {
        // Sky
        ctx.fillStyle = '#3498db';
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 5; i++) {
            const x = ((i * 200) - this.cloudOffset + this.canvasWidth) % (this.canvasWidth + 200) - 100;
            const y = 100 + Math.sin(i) * 50;
            this.drawCloud(ctx, x, y);
        }

        // Cityscape (silhouette)
        ctx.fillStyle = '#2c3e50';
        // ... simplified city

        // Ground (drawn by game loop usually on top, but here is fine too if we handle layers)
        // Actually, ground should be drawn AFTER pipes so pipes appear behind it? 
        // Or pipes go into ground. Let's draw ground in game loop or here if we want.
    }

    drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.arc(x + 25, y - 10, 35, 0, Math.PI * 2);
        ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
        ctx.fill();
    }
}

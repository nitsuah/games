// Simple sound effects system using Web Audio API
declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}

export class SimpleSoundSystem {
    private audioContext: AudioContext | null = null;
    private enabled: boolean = true;

    constructor() {
        if (typeof window !== 'undefined') {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    private ensureContext() {
        if (!this.audioContext) return null;
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        return this.audioContext;
    }

    // Play a simple beep/tone
    playTone(frequency: number, duration: number, volume: number = 0.3) {
        if (!this.enabled) return;
        const ctx = this.ensureContext();
        if (!ctx) return;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    }

    // Paddle/Ball hit sound
    hit() {
        this.playTone(200, 0.1, 0.2);
    }

    // Brick break / Enemy destroy
    destroy() {
        if (!this.enabled) return;
        const ctx = this.ensureContext();
        if (!ctx) return;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
        oscillator.type = 'sawtooth';

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
    }

    // Power-up / Score
    powerUp() {
        if (!this.enabled) return;
        const ctx = this.ensureContext();
        if (!ctx) return;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(300, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
    }

    // Laser / Shoot
    shoot() {
        if (!this.enabled) return;
        const ctx = this.ensureContext();
        if (!ctx) return;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
        oscillator.type = 'sawtooth';

        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
    }

    // Flap / Jump
    flap() {
        this.playTone(350, 0.15, 0.15);
    }

    // Game Over
    gameOver() {
        if (!this.enabled) return;
        const ctx = this.ensureContext();
        if (!ctx) return;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);
        oscillator.type = 'triangle';

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }
}

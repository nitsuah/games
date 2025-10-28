import { generateThrusterSound } from './generateThrusterSound';

class SoundManager {
  constructor() {
    this.thrusterSound = null;
    this.isInitialized = false;
    this.audioCtx = null;
  }

  initialize() {
    if (this.isInitialized) return;

    try {
      this.thrusterSound = generateThrusterSound();
      // lazily create an AudioContext for one-shot sounds
      if (typeof window !== 'undefined' && !this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize sound manager:', error);
    }
  }

  startThruster() {
    if (!this.isInitialized) this.initialize();
    this.thrusterSound?.start();
  }

  stopThruster() {
    if (this.isInitialized) {
      this.thrusterSound?.stop();
    }
  }

  cleanup() {
    if (this.isInitialized) {
      this.thrusterSound?.cleanup();
      this.isInitialized = false;
    }
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch {
        /* ignore */
      }
      this.audioCtx = null;
    }
  }

  // Play a simple explosion-like one-shot. 'size' biases the sound: larger -> deeper, longer decay.
  playExplosion(size = 1) {
    if (typeof window === 'undefined') return;
    if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // Create noise buffer for the explosion body
    const bufferSize = ctx.sampleRate * 1.0; // 1 second buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Fill with decaying white noise shaped by size
    const decay = 0.8 + Math.min(Math.max(size, 0.2), 3) * 0.6;
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.8, now + 0.001);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6 * Math.min(Math.max(size, 0.5), 2));

    // Sine oscillator for the thump
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    // larger size -> lower base frequency
    const baseFreq = 80 / Math.min(Math.max(size, 0.5), 3);
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.6 * Math.min(Math.max(size, 0.5), 2));

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.0001, now);
    oscGain.gain.exponentialRampToValueAtTime(0.9, now + 0.01);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8 * Math.min(Math.max(size, 0.5), 2));

    // routing
    noise.connect(noiseGain).connect(ctx.destination);
    osc.connect(oscGain).connect(ctx.destination);

    // start/stop
    noise.start(now);
    osc.start(now);
    noise.stop(now + 1.0);
    osc.stop(now + 1.0);
  }
}

// Create a singleton instance
const soundManager = new SoundManager();
export default soundManager;

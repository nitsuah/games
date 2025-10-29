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
  // Accepts optional pan parameter (-1 left .. 1 right) for spatialization.
  playExplosion(size = 1, pan = 0) {
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

    // Add a low-pass rumble layer to make big explosions feel weighty
    const rumbleOsc = ctx.createOscillator();
    rumbleOsc.type = 'triangle';
    rumbleOsc.frequency.setValueAtTime(60 / Math.max(0.5, size), now);
    const rumbleGain = ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.0001, now);
    rumbleGain.gain.exponentialRampToValueAtTime(0.7 * Math.min(size, 2), now + 0.02);
    rumbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 * Math.min(Math.max(size, 0.5), 2));
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(300, now);

    // panning node if supported
    let panNode = null;
    if (ctx.createStereoPanner) {
      panNode = ctx.createStereoPanner();
      panNode.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);
    }

    // routing: noise + osc + rumble -> optional pan -> destination
    if (panNode) {
      noise.connect(noiseGain).connect(panNode).connect(ctx.destination);
      osc.connect(oscGain).connect(panNode).connect(ctx.destination);
      rumbleOsc.connect(rumbleGain).connect(lowpass).connect(panNode).connect(ctx.destination);
    } else {
      noise.connect(noiseGain).connect(ctx.destination);
      osc.connect(oscGain).connect(ctx.destination);
      rumbleOsc.connect(rumbleGain).connect(lowpass).connect(ctx.destination);
    }

    // start/stop
    noise.start(now);
    osc.start(now);
    rumbleOsc.start(now);
    noise.stop(now + 1.0);
    osc.stop(now + 1.0);
    rumbleOsc.stop(now + 1.0);
  }
}

// Create a singleton instance
const soundManager = new SoundManager();
export default soundManager;

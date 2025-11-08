/**
 * SoundEffect - Procedural sound generation using Web Audio API
 * Used for generating game sounds on-the-fly without audio files
 */

class SoundEffect {
  constructor() {
    this.audioContext = null;
    this.soundEnabled = true;
  }

  /**
   * Initialize audio context
   */
  initialize() {
    if (this.audioContext) return;
    if (typeof window === 'undefined') return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.error('Failed to initialize SoundEffect audio context:', error);
    }
  }

  /**
   * Enable/disable sound effects
   * @param {boolean} enabled
   */
  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
  }

  /**
   * Play explosion sound with size-based variation
   * @param {number} size - Size multiplier (0.2 to 3.0)
   * @param {number} pan - Stereo panning (-1 left to 1 right)
   */
  playExplosion(size = 1, pan = 0) {
    if (!this.soundEnabled) return;
    if (!this.audioContext) this.initialize();
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Clamp size parameter
    const clampedSize = Math.min(Math.max(size, 0.2), 3);

    // Create noise buffer for explosion body
    const bufferSize = ctx.sampleRate * 1.0;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Fill with decaying white noise
    const decay = 0.8 + clampedSize * 0.6;
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Noise envelope
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.8, now + 0.001);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6 * clampedSize);

    // Sine oscillator for thump
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const baseFreq = 80 / clampedSize;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.6 * clampedSize);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.0001, now);
    oscGain.gain.exponentialRampToValueAtTime(0.9, now + 0.01);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8 * clampedSize);

    // Rumble layer for weightiness
    const rumbleOsc = ctx.createOscillator();
    rumbleOsc.type = 'triangle';
    rumbleOsc.frequency.setValueAtTime(60 / clampedSize, now);
    
    const rumbleGain = ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.0001, now);
    rumbleGain.gain.exponentialRampToValueAtTime(0.7 * Math.min(clampedSize, 2), now + 0.02);
    rumbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 * clampedSize);
    
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(300, now);

    // Stereo panning
    let panNode = null;
    if (ctx.createStereoPanner) {
      panNode = ctx.createStereoPanner();
      panNode.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);
    }

    // Connect audio graph
    if (panNode) {
      noise.connect(noiseGain).connect(panNode).connect(ctx.destination);
      osc.connect(oscGain).connect(panNode).connect(ctx.destination);
      rumbleOsc.connect(rumbleGain).connect(lowpass).connect(panNode).connect(ctx.destination);
    } else {
      noise.connect(noiseGain).connect(ctx.destination);
      osc.connect(oscGain).connect(ctx.destination);
      rumbleOsc.connect(rumbleGain).connect(lowpass).connect(ctx.destination);
    }

    // Start and stop all nodes
    noise.start(now);
    osc.start(now);
    rumbleOsc.start(now);
    noise.stop(now + 1.0);
    osc.stop(now + 1.0);
    rumbleOsc.stop(now + 1.0);
  }

  /**
   * Generate continuous thruster sound
   * @returns {Object} Thruster control object
   */
  generateThruster() {
    if (!this.audioContext) this.initialize();
    if (!this.audioContext) return null;

    const ctx = this.audioContext;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filterNode = ctx.createBiquadFilter();

    // Set up oscillator
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(100, ctx.currentTime);

    // Set up filter
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(1000, ctx.currentTime);
    filterNode.Q.setValueAtTime(10, ctx.currentTime);

    // Set up gain
    gainNode.gain.setValueAtTime(0, ctx.currentTime);

    // Connect nodes
    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Start oscillator
    oscillator.start();

    return {
      start: () => {
        if (!this.soundEnabled) return;
        gainNode.gain.setTargetAtTime(0.3, ctx.currentTime, 0.1);
        filterNode.frequency.setTargetAtTime(2000, ctx.currentTime, 0.1);
      },
      stop: () => {
        gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
        filterNode.frequency.setTargetAtTime(1000, ctx.currentTime, 0.1);
      },
      cleanup: () => {
        oscillator.stop();
        oscillator.disconnect();
        filterNode.disconnect();
        gainNode.disconnect();
      },
    };
  }

  /**
   * Play weapon fire sound
   * @param {string} weaponType - Type of weapon ('laser', 'shotgun', 'explosive')
   */
  playWeaponFire(weaponType = 'laser') {
    if (!this.soundEnabled) return;
    if (!this.audioContext) this.initialize();
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    switch (weaponType) {
      case 'laser':
        this._playLaserSound(ctx, now);
        break;
      case 'shotgun':
        this._playShotgunSound(ctx, now);
        break;
      case 'explosive':
        this._playExplosiveSound(ctx, now);
        break;
      default:
        this._playLaserSound(ctx, now);
    }
  }

  /**
   * Play laser weapon sound
   * @private
   */
  _playLaserSound(ctx, now) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Play shotgun weapon sound
   * @private
   */
  _playShotgunSound(ctx, now) {
    // Create noise burst
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 10);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);

    noise.connect(gain).connect(ctx.destination);
    noise.start(now);
  }

  /**
   * Play explosive weapon sound
   * @private
   */
  _playExplosiveSound(ctx, now) {
    // Low frequency thump
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  /**
   * Clean up audio resources
   */
  cleanup() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Create singleton instance
const soundEffect = new SoundEffect();
export default soundEffect;

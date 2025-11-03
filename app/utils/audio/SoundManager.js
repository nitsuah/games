import { generateThrusterSound } from './generateThrusterSound';

class SoundManager {
  constructor() {
    this.thrusterSound = null;
    this.isInitialized = false;
    this.audioCtx = null;
    this.soundEnabled = true; // Default to enabled
    this.heartbeatInterval = null;
    this.heartbeatGain = null;
    this.masterGain = null; // Master volume control
    this.sfxVolume = 0.8; // Default SFX volume (0-1)
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
  }

  /**
   * Set SFX volume (0-1)
   */
  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      this.masterGain.gain.linearRampToValueAtTime(this.sfxVolume, now + 0.1);
    }
  }

  /**
   * Get output destination (masterGain if available, else ctx.destination)
   */
  getOutputNode(ctx) {
    // Ensure master gain is created if we have a context
    if (ctx && !this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.sfxVolume, ctx.currentTime);
      this.masterGain.connect(ctx.destination);
    }
    return this.masterGain || ctx.destination;
  }

  initialize() {
    if (this.isInitialized) return;

    try {
      this.thrusterSound = generateThrusterSound();
      // lazily create an AudioContext for one-shot sounds
      if (typeof window !== 'undefined' && !this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create master gain for volume control
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(this.sfxVolume, this.audioCtx.currentTime);
        this.masterGain.connect(this.audioCtx.destination);
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
    if (!this.soundEnabled) return; // Don't play if sound disabled
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

    // routing: noise + osc + rumble -> optional pan -> output (masterGain)
    const output = this.getOutputNode(ctx);
    if (panNode) {
      noise.connect(noiseGain).connect(panNode).connect(output);
      osc.connect(oscGain).connect(panNode).connect(output);
      rumbleOsc.connect(rumbleGain).connect(lowpass).connect(panNode).connect(output);
    } else {
      noise.connect(noiseGain).connect(output);
      osc.connect(oscGain).connect(output);
      rumbleOsc.connect(rumbleGain).connect(lowpass).connect(output);
    }

    // start/stop
    noise.start(now);
    osc.start(now);
    rumbleOsc.start(now);
    noise.stop(now + 1.0);
    osc.stop(now + 1.0);
    rumbleOsc.stop(now + 1.0);
  }

  // Play power-up collection sound - bright, ascending tone
  playPowerUpCollect() {
    if (!this.soundEnabled) return;
    if (typeof window === 'undefined') return;
    
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      const duration = 0.3;

      // Create an ascending tone with harmonics
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(400, now);
      osc1.frequency.exponentialRampToValueAtTime(800, now + duration);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(600, now);
      osc2.frequency.exponentialRampToValueAtTime(1200, now + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.getOutputNode(ctx));

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch (error) {
      // Silently fail in test environment
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to play power-up collect sound:', error.message);
      }
    }
  }

  // Play power-up activation sound - energizing whoosh
  playPowerUpActivate(type = 'default') {
    if (!this.soundEnabled) return;
    if (typeof window === 'undefined') return;
    
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const duration = 0.5;

    // Different frequencies for different power-up types
    const freqMap = {
      rapidFire: 600,
      shield: 300,
      health: 400,
      slowMotion: 200,
      damageBoost: 700,
      default: 500,
    };
    const baseFreq = freqMap[type] || freqMap.default;

    // Sweeping filter for whoosh effect
    const noise = ctx.createBufferSource();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(baseFreq, now);
    filter.frequency.exponentialRampToValueAtTime(baseFreq * 3, now + duration);
    filter.Q.setValueAtTime(10, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.exponentialRampToValueAtTime(0.4, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.getOutputNode(ctx));

    noise.start(now);
    noise.stop(now + duration);
    } catch (error) {
      // Silently fail in test environment
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to play power-up activate sound:', error.message);
      }
    }
  }

  // Play power-up deactivation sound - descending tone
  playPowerUpDeactivate() {
    if (!this.soundEnabled) return;
    if (typeof window === 'undefined') return;
    
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      const duration = 0.2;

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));

      osc.start(now);
      osc.stop(now + duration);
    } catch (error) {
      // Silently fail in test environment
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to play power-up deactivate sound:', error.message);
      }
    }
  }

  // Play hit impact sound - short punch with pitch variation
  playHitImpact(intensity = 1, pitch = 1) {
    if (!this.soundEnabled) return;
    if (typeof window === 'undefined') return;
    
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const duration = 0.15;

    // Quick noise burst
    const noise = ctx.createBufferSource();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const decay = 1 - (i / bufferSize);
      data[i] = (Math.random() * 2 - 1) * decay;
    }
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(300 * pitch, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3 * intensity, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.getOutputNode(ctx));

    noise.start(now);
    noise.stop(now + duration);
    } catch (error) {
      // Silently fail in test environment
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to play hit impact sound:', error.message);
      }
    }
  }

  // Play laser weapon sound - sci-fi beam with slight pitch variation
  playLaserShoot(variation = 0) {
    if (!this.soundEnabled) return;
    if (typeof window === 'undefined') return;
    
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      const duration = 0.12;

      // High-frequency sweep for laser sound
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      const baseFreq = 800 + (variation * 100);
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + duration);

      // Add harmonic for richness
      const osc2 = ctx.createOscillator();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(baseFreq * 2, now);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.08, now);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + duration);

      osc.connect(gain);
      osc2.connect(gain2);
      gain.connect(this.getOutputNode(ctx));
      gain2.connect(this.getOutputNode(ctx));

      osc.start(now);
      osc2.start(now);
      osc.stop(now + duration);
      osc2.stop(now + duration);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to play laser sound:', error.message);
      }
    }
  }

  // Play shotgun/spread weapon sound - punchy blast with slight variation
  playShotgunShoot(variation = 0) {
    if (!this.soundEnabled) return;
    if (typeof window === 'undefined') return;
    
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      const duration = 0.2;

      // Noise burst for shotgun blast
      const noise = ctx.createBufferSource();
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const decay = Math.pow(1 - (i / bufferSize), 2);
        data[i] = (Math.random() * 2 - 1) * decay;
      }
      noise.buffer = buffer;

      // Bandpass filter for punch
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(200 + (variation * 50), now);
      filter.Q.setValueAtTime(2, now);

      // Add low thump
      const thump = ctx.createOscillator();
      thump.type = 'sine';
      thump.frequency.setValueAtTime(80, now);
      thump.frequency.exponentialRampToValueAtTime(40, now + duration * 0.5);

      const thumpGain = ctx.createGain();
      thumpGain.gain.setValueAtTime(0.4, now);
      thumpGain.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.6);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      thump.connect(thumpGain);
      gain.connect(this.getOutputNode(ctx));
      thumpGain.connect(this.getOutputNode(ctx));

      noise.start(now);
      thump.start(now);
      noise.stop(now + duration);
      thump.stop(now + duration);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to play shotgun sound:', error.message);
      }
    }
  }

  // Play cannon weapon sound - deep mechanical boom
  playCannonShoot(variation = 0) {
    if (!this.soundEnabled) return;
    if (typeof window === 'undefined') return;
    
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      const duration = 0.3;

      // Deep bass thump
      const bass = ctx.createOscillator();
      bass.type = 'sine';
      bass.frequency.setValueAtTime(60 + (variation * 10), now);
      bass.frequency.exponentialRampToValueAtTime(30, now + duration);

      // Mid-range mechanical sound
      const mid = ctx.createOscillator();
      mid.type = 'triangle';
      mid.frequency.setValueAtTime(150, now);
      mid.frequency.exponentialRampToValueAtTime(80, now + duration * 0.5);

      // Noise for mechanical texture
      const noise = ctx.createBufferSource();
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const decay = Math.pow(1 - (i / bufferSize), 1.5);
        data[i] = (Math.random() * 2 - 1) * decay * 0.3;
      }
      noise.buffer = buffer;

      const bassGain = ctx.createGain();
      bassGain.gain.setValueAtTime(0.5, now);
      bassGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      const midGain = ctx.createGain();
      midGain.gain.setValueAtTime(0.3, now);
      midGain.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.6);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.4);

      bass.connect(bassGain).connect(this.getOutputNode(ctx));
      mid.connect(midGain).connect(this.getOutputNode(ctx));
      noise.connect(noiseGain).connect(this.getOutputNode(ctx));

      bass.start(now);
      mid.start(now);
      noise.start(now);
      bass.stop(now + duration);
      mid.stop(now + duration);
      noise.stop(now + duration);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to play cannon sound:', error.message);
      }
    }
  }

  // Play combo milestone sound - ascending tones that increase in pitch with combo level
  // milestone: 5, 10, 15, 20, etc.
  playComboMilestone(milestone) {
    if (!this.soundEnabled) return;
    if (typeof window === 'undefined') return;
    
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      
      // Higher combo = higher base frequency and more harmonics
      const level = milestone / 5; // 5x=1, 10x=2, 15x=3, etc.
      const baseFreq = 400 + (level * 200); // 600Hz, 800Hz, 1000Hz, etc.
      const duration = 0.25 + (level * 0.05); // Slightly longer for higher combos
      
      // Create 3-note ascending arpeggio
      for (let i = 0; i < 3; i++) {
        const startTime = now + (i * 0.05);
        const freq = baseFreq * Math.pow(1.25, i); // Major 3rd intervals
        
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        osc.connect(gain).connect(this.getOutputNode(ctx));
        osc.start(startTime);
        osc.stop(startTime + duration);
      }
      
      // Add a sparkle layer for higher combos
      if (level >= 3) {
        const sparkle = ctx.createOscillator();
        sparkle.type = 'sine';
        sparkle.frequency.setValueAtTime(2400, now);
        sparkle.frequency.exponentialRampToValueAtTime(3600, now + 0.2);
        
        const sparkleGain = ctx.createGain();
        sparkleGain.gain.setValueAtTime(0.1, now);
        sparkleGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        sparkle.connect(sparkleGain).connect(this.getOutputNode(ctx));
        sparkle.start(now);
        sparkle.stop(now + 0.2);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to play combo sound:', error.message);
      }
    }
  }

  /**
   * Start low health heartbeat audio loop
   * healthPercent: 0-100, controls tempo (lower health = faster heartbeat)
   */
  startHeartbeat(healthPercent) {
    if (!this.soundEnabled) return;
    if (typeof window === 'undefined') return;
    
    // Only start if health is low enough (<30%)
    if (healthPercent >= 30) {
      this.stopHeartbeat();
      return;
    }
    
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Clear existing heartbeat if any
      if (this.heartbeatInterval) {
        this.stopHeartbeat();
      }
      
      // Calculate interval based on health (30% = 1000ms, 10% = 400ms, 0% = 250ms)
      const interval = 1000 - (30 - healthPercent) * 25;
      const clampedInterval = Math.max(250, Math.min(1000, interval));
      
      const playBeat = () => {
        const ctx = this.audioCtx;
        const now = ctx.currentTime;
        const duration = 0.15;
        
        // Two-part heartbeat: "lub-dub"
        // First beat (lub)
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(60, now);
        osc1.frequency.exponentialRampToValueAtTime(40, now + duration);
        
        const gain1 = ctx.createGain();
        gain1.gain.setValueAtTime(0.3, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        // Second beat (dub) - slightly delayed and quieter
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(50, now + 0.1);
        osc2.frequency.exponentialRampToValueAtTime(35, now + 0.1 + duration);
        
        const gain2 = ctx.createGain();
        gain2.gain.setValueAtTime(0.2, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.1 + duration);
        
        // Low-pass filter for muffled heartbeat sound
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, now);
        
        osc1.connect(gain1).connect(filter).connect(this.getOutputNode(ctx));
        osc2.connect(gain2).connect(filter).connect(this.getOutputNode(ctx));
        
        osc1.start(now);
        osc2.start(now + 0.1);
        osc1.stop(now + duration);
        osc2.stop(now + 0.1 + duration);
      };
      
      // Play immediately, then set interval
      playBeat();
      this.heartbeatInterval = setInterval(playBeat, clampedInterval);
      
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to start heartbeat:', error.message);
      }
    }
  }

  /**
   * Stop the heartbeat loop
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Update heartbeat tempo based on current health
   */
  updateHeartbeat(healthPercent) {
    if (healthPercent >= 30) {
      this.stopHeartbeat();
    } else if (this.heartbeatInterval) {
      // Restart with new tempo
      this.startHeartbeat(healthPercent);
    } else {
      // Start if not already playing
      this.startHeartbeat(healthPercent);
    }
  }

  /**
   * Play kill streak announcement sound
   * streak: 10, 20, 30, etc.
   */
  playKillStreak(streak) {
    if (!this.soundEnabled) return;
    if (typeof window === 'undefined') return;
    
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      const duration = 0.4;
      
      // Higher streaks = higher pitch and more harmonics
      const intensity = Math.min(streak / 10, 5); // 1-5x multiplier
      const baseFreq = 300 + (intensity * 100); // 400Hz - 800Hz
      
      // Power chord (root + fifth)
      const root = ctx.createOscillator();
      root.type = 'square';
      root.frequency.setValueAtTime(baseFreq, now);
      
      const fifth = ctx.createOscillator();
      fifth.type = 'square';
      fifth.frequency.setValueAtTime(baseFreq * 1.5, now);
      
      const rootGain = ctx.createGain();
      rootGain.gain.setValueAtTime(0, now);
      rootGain.gain.linearRampToValueAtTime(0.2, now + 0.01);
      rootGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      
      const fifthGain = ctx.createGain();
      fifthGain.gain.setValueAtTime(0, now);
      fifthGain.gain.linearRampToValueAtTime(0.15, now + 0.01);
      fifthGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      
      // Distortion/overdrive for aggressive sound
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, now);
      filter.Q.setValueAtTime(2, now);
      
      root.connect(rootGain).connect(filter).connect(this.getOutputNode(ctx));
      fifth.connect(fifthGain).connect(filter).connect(this.getOutputNode(ctx));
      
      root.start(now);
      fifth.start(now);
      root.stop(now + duration);
      fifth.stop(now + duration);
      
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to play kill streak sound:', error.message);
      }
    }
  }

  /**
   * Play wave clear celebration sound
   * Performance factor (0-1): 0 = poor, 1 = perfect
   */
  playWaveClear(performanceFactor = 1.0) {
    if (!this.soundEnabled) return;
    if (typeof window === 'undefined') return;
    
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      const duration = 0.8;
      
      // Base triumphant fanfare
      const baseFreq = 400 + (performanceFactor * 200); // Higher pitch for better performance
      
      // Create ascending victory arpeggio
      const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2]; // Major triad + octave
      
      notes.forEach((freq, i) => {
        const startTime = now + (i * 0.1);
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        osc.connect(gain).connect(this.getOutputNode(ctx));
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
      
      // Add sparkle layer for high performance (>80%)
      if (performanceFactor > 0.8) {
        for (let i = 0; i < 5; i++) {
          const sparkleTime = now + 0.4 + (i * 0.05);
          const sparkleOsc = ctx.createOscillator();
          sparkleOsc.type = 'sine';
          sparkleOsc.frequency.setValueAtTime(1800 + Math.random() * 1200, sparkleTime);
          
          const sparkleGain = ctx.createGain();
          sparkleGain.gain.setValueAtTime(0.12, sparkleTime);
          sparkleGain.gain.exponentialRampToValueAtTime(0.01, sparkleTime + 0.2);
          
          sparkleOsc.connect(sparkleGain).connect(this.getOutputNode(ctx));
          sparkleOsc.start(sparkleTime);
          sparkleOsc.stop(sparkleTime + 0.2);
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to play wave clear sound:', error.message);
      }
    }
  }
}

// Create a singleton instance
const soundManager = new SoundManager();
export default soundManager;

/**
 * Dynamic procedural music system that generates layered audio
 * Intensity increases with wave progression
 * Uses Web Audio API to create ambient, percussion, and lead layers
 */
class DynamicMusicSystem {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.currentWave = 1;
    this.layers = {
      ambient: null,
      bass: null,
      percussion: null,
      lead: null,
    };
    this.gainNodes = {};
    this.masterGain = null;
  }

  initialize() {
    if (typeof window === 'undefined') return;
    
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create master gain for volume control
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);
      
      // Create gain nodes for each layer
      Object.keys(this.layers).forEach(layer => {
        this.gainNodes[layer] = this.audioCtx.createGain();
        this.gainNodes[layer].gain.setValueAtTime(0, this.audioCtx.currentTime);
        this.gainNodes[layer].connect(this.masterGain);
      });
      
    } catch (error) {
      console.warn('Failed to initialize music system:', error);
    }
  }

  /**
   * Start ambient base layer - continuous drone
   */
  startAmbientLayer() {
    if (!this.audioCtx) return;
    
    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    
    // Low drone oscillator (40Hz)
    const drone = ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.setValueAtTime(40, now);
    
    // Mid ambient pad (80Hz)
    const pad = ctx.createOscillator();
    pad.type = 'triangle';
    pad.frequency.setValueAtTime(80, now);
    
    // Subtle movement with LFO
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.2, now);
    
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(10, now);
    
    lfo.connect(lfoGain);
    lfoGain.connect(pad.frequency);
    
    // Low-pass filter for warmth
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    filter.Q.setValueAtTime(1, now);
    
    drone.connect(filter);
    pad.connect(filter);
    filter.connect(this.gainNodes.ambient);
    
    drone.start(now);
    pad.start(now);
    lfo.start(now);
    
    this.layers.ambient = { drone, pad, lfo, filter };
    
    // Fade in ambient layer
    this.gainNodes.ambient.gain.linearRampToValueAtTime(0.4, now + 2);
  }

  /**
   * Start bass layer - rhythmic pulse
   */
  startBassLayer() {
    if (!this.audioCtx) return;
    
    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const tempo = 120; // BPM
    const beatDuration = 60 / tempo;
    
    const playBeat = () => {
      if (!this.isPlaying) return;
      
      const t = ctx.currentTime;
      
      const bass = ctx.createOscillator();
      bass.type = 'sine';
      bass.frequency.setValueAtTime(55, t); // Low A
      bass.frequency.exponentialRampToValueAtTime(50, t + 0.3);
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      
      bass.connect(gain);
      gain.connect(this.gainNodes.bass);
      
      bass.start(t);
      bass.stop(t + 0.3);
      
      // Schedule next beat
      setTimeout(playBeat, beatDuration * 1000);
    };
    
    playBeat();
    
    // Fade in bass layer
    this.gainNodes.bass.gain.linearRampToValueAtTime(0.3, now + 2);
  }

  /**
   * Start percussion layer - rhythmic accents (wave 3+)
   */
  startPercussionLayer() {
    if (!this.audioCtx) return;
    
    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const tempo = 120; // BPM
    const beatDuration = 60 / tempo;
    
    let beatCount = 0;
    
    const playPercussion = () => {
      if (!this.isPlaying) return;
      
      const t = ctx.currentTime;
      
      // Hi-hat on every beat
      const hihat = ctx.createOscillator();
      hihat.type = 'square';
      hihat.frequency.setValueAtTime(8000, t);
      
      const hihatGain = ctx.createGain();
      hihatGain.gain.setValueAtTime(0.15, t);
      hihatGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
      
      hihat.connect(hihatGain);
      hihatGain.connect(this.gainNodes.percussion);
      hihat.start(t);
      hihat.stop(t + 0.05);
      
      // Kick on beats 1 and 3
      if (beatCount % 2 === 0) {
        const kick = ctx.createOscillator();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(150, t);
        kick.frequency.exponentialRampToValueAtTime(40, t + 0.1);
        
        const kickGain = ctx.createGain();
        kickGain.gain.setValueAtTime(0.3, t);
        kickGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        
        kick.connect(kickGain);
        kickGain.connect(this.gainNodes.percussion);
        kick.start(t);
        kick.stop(t + 0.2);
      }
      
      beatCount++;
      setTimeout(playPercussion, beatDuration * 1000);
    };
    
    playPercussion();
    
    // Fade in percussion layer
    this.gainNodes.percussion.gain.linearRampToValueAtTime(0.25, now + 1);
  }

  /**
   * Start lead synth layer - melodic elements (wave 5+)
   */
  startLeadLayer() {
    if (!this.audioCtx) return;
    
    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    
    // Pentatonic scale notes (A minor pentatonic)
    const notes = [220, 247, 261.63, 329.63, 349.23]; // A3, B3, C4, E4, F4
    let noteIndex = 0;
    
    const playNote = () => {
      if (!this.isPlaying) return;
      
      const t = ctx.currentTime;
      const freq = notes[noteIndex % notes.length];
      
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1500, t);
      filter.Q.setValueAtTime(3, t);
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.05);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.gainNodes.lead);
      
      osc.start(t);
      osc.stop(t + 0.8);
      
      noteIndex++;
      
      // Random timing between 0.5-1.5 seconds for organic feel
      const nextDelay = 500 + Math.random() * 1000;
      setTimeout(playNote, nextDelay);
    };
    
    playNote();
    
    // Fade in lead layer
    this.gainNodes.lead.gain.linearRampToValueAtTime(0.2, now + 1);
  }

  /**
   * Start music system based on current wave
   */
  start(wave = 1) {
    if (!this.audioCtx) this.initialize();
    if (!this.audioCtx || this.isPlaying) return;
    
    this.isPlaying = true;
    this.currentWave = wave;
    
    // Always start with ambient
    this.startAmbientLayer();
    
    // Add bass from wave 1
    if (wave >= 1) {
      setTimeout(() => this.startBassLayer(), 2000);
    }
    
    // Add percussion from wave 3
    if (wave >= 3) {
      setTimeout(() => this.startPercussionLayer(), 4000);
    }
    
    // Add lead from wave 5
    if (wave >= 5) {
      setTimeout(() => this.startLeadLayer(), 6000);
    }
  }

  /**
   * Update intensity based on wave progression
   */
  updateWave(newWave) {
    if (!this.audioCtx || !this.isPlaying) return;
    
    const oldWave = this.currentWave;
    this.currentWave = newWave;
    
    const now = this.audioCtx.currentTime;
    
    // Start percussion if transitioning to wave 3
    if (oldWave < 3 && newWave >= 3) {
      this.startPercussionLayer();
    }
    
    // Start lead if transitioning to wave 5
    if (oldWave < 5 && newWave >= 5) {
      this.startLeadLayer();
    }
    
    // Increase master volume slightly with each wave (subtle)
    const volumeBoost = Math.min(0.1, (newWave - 1) * 0.01);
    this.masterGain.gain.linearRampToValueAtTime(0.3 + volumeBoost, now + 1);
  }

  /**
   * Stop all layers
   */
  stop() {
    if (!this.audioCtx || !this.isPlaying) return;
    
    this.isPlaying = false;
    
    const now = this.audioCtx.currentTime;
    
    // Fade out all layers
    Object.values(this.gainNodes).forEach(gainNode => {
      gainNode.gain.linearRampToValueAtTime(0, now + 2);
    });
    
    // Stop all oscillators after fade
    setTimeout(() => {
      Object.values(this.layers).forEach(layer => {
        if (layer) {
          Object.values(layer).forEach(node => {
            if (node && typeof node.stop === 'function') {
              try { node.stop(); } catch { /* already stopped */ }
            }
          });
        }
      });
      this.layers = { ambient: null, bass: null, percussion: null, lead: null };
    }, 2500);
  }

  /**
   * Set master volume (0-1)
   */
  setVolume(volume) {
    if (!this.masterGain) return;
    const now = this.audioCtx.currentTime;
    this.masterGain.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, volume)), now + 0.1);
  }

  /**
   * Cleanup
   */
  cleanup() {
    this.stop();
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch { /* ignore */ }
      this.audioCtx = null;
    }
  }
}

// Singleton instance
let dynamicMusicSystem = null;

export function getDynamicMusicSystem() {
  if (!dynamicMusicSystem) {
    dynamicMusicSystem = new DynamicMusicSystem();
  }
  return dynamicMusicSystem;
}

export default DynamicMusicSystem;

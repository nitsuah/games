/**
 * AudioManager - Centralized audio system for all games
 * Handles audio context, volume control, mute state, and sound loading
 */

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.sounds = new Map();
    this.soundEnabled = true;
    this.musicEnabled = true;
    this.masterVolume = 1.0;
    this.soundVolume = 1.0;
    this.musicVolume = 1.0;
    this.isInitialized = false;
  }

  /**
   * Initialize the audio context
   * Must be called after user interaction due to browser autoplay policies
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      if (typeof window === 'undefined') return;
      
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.isInitialized = true;

      // Resume context on user interaction
      const resumeAudio = async () => {
        if (this.audioContext && this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
          console.log('✅ Audio context resumed');
        }
      };

      document.addEventListener('click', resumeAudio, { once: true });
      document.addEventListener('keydown', resumeAudio, { once: true });

      console.log('✅ AudioManager initialized');
    } catch (error) {
      console.error('❌ Failed to initialize AudioManager:', error);
    }
  }

  /**
   * Load a sound file
   * @param {string} name - Unique identifier for the sound
   * @param {string} src - Path to audio file
   * @param {Object} options - Sound options (loop, volume, type)
   * @returns {Promise<HTMLAudioElement>}
   */
  async loadSound(name, src, options = {}) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      
      audio.addEventListener('canplaythrough', () => {
        console.log(`✅ Audio loaded: ${name} (${src})`);
        resolve(audio);
      });

      audio.addEventListener('error', (e) => {
        console.error(`❌ Failed to load audio: ${name} (${src})`, e);
        reject(e);
      });

      // Set audio properties
      audio.loop = options.loop || false;
      audio.volume = options.volume !== undefined ? options.volume : 1.0;
      
      // Use absolute path from public directory
      audio.src = process.env.NODE_ENV === 'development' 
        ? `http://localhost:3000${src}` 
        : src;

      audio.load();

      // Store in sounds map with metadata
      this.sounds.set(name, {
        audio,
        type: options.type || 'sound', // 'sound' or 'music'
        baseVolume: options.volume !== undefined ? options.volume : 1.0,
      });
    });
  }

  /**
   * Load multiple sounds at once
   * @param {Object} soundConfig - Map of name -> {src, options}
   * @returns {Promise<void>}
   */
  async loadSounds(soundConfig) {
    const promises = Object.entries(soundConfig).map(([name, config]) => {
      return this.loadSound(name, config.src, config.options);
    });

    try {
      await Promise.all(promises);
      console.log('✅ All sounds loaded');
    } catch (error) {
      console.error('❌ Failed to load some sounds:', error);
    }
  }

  /**
   * Play a sound by name
   * @param {string} name - Sound identifier
   * @param {Object} options - Playback options (volume, loop)
   */
  async playSound(name, options = {}) {
    const soundData = this.sounds.get(name);
    if (!soundData) {
      console.error(`❌ Sound not found: ${name}`);
      return;
    }

    const { audio, type, baseVolume } = soundData;

    // Check if sound/music is enabled
    if (type === 'music' && !this.musicEnabled) return;
    if (type === 'sound' && !this.soundEnabled) return;

    try {
      // Resume audio context if suspended
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Apply volume modifiers
      const volumeMultiplier = type === 'music' ? this.musicVolume : this.soundVolume;
      audio.volume = (options.volume !== undefined ? options.volume : baseVolume) 
        * volumeMultiplier 
        * this.masterVolume;

      // For background music, check if already playing
      if (type === 'music' && !audio.paused) {
        return;
      }

      // Reset to start for non-looping sounds
      if (!audio.loop) {
        audio.currentTime = 0;
      }

      await audio.play();
    } catch (error) {
      console.error(`❌ Failed to play ${name}:`, error);
    }
  }

  /**
   * Pause a sound
   * @param {string} name - Sound identifier
   */
  pauseSound(name) {
    const soundData = this.sounds.get(name);
    if (soundData) {
      soundData.audio.pause();
    }
  }

  /**
   * Stop a sound and reset to beginning
   * @param {string} name - Sound identifier
   */
  stopSound(name) {
    const soundData = this.sounds.get(name);
    if (soundData) {
      soundData.audio.pause();
      soundData.audio.currentTime = 0;
    }
  }

  /**
   * Set volume for a specific sound
   * @param {string} name - Sound identifier
   * @param {number} volume - Volume (0.0 to 1.0)
   */
  setSoundVolume(name, volume) {
    const soundData = this.sounds.get(name);
    if (soundData) {
      const { type } = soundData;
      const volumeMultiplier = type === 'music' ? this.musicVolume : this.soundVolume;
      soundData.audio.volume = Math.max(0, Math.min(1, volume)) * volumeMultiplier * this.masterVolume;
    }
  }

  /**
   * Set master volume
   * @param {number} volume - Volume (0.0 to 1.0)
   */
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  /**
   * Set sound effects volume
   * @param {number} volume - Volume (0.0 to 1.0)
   */
  setSoundEffectsVolume(volume) {
    this.soundVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  /**
   * Set music volume
   * @param {number} volume - Volume (0.0 to 1.0)
   */
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  /**
   * Update volumes for all loaded sounds
   * @private
   */
  updateAllVolumes() {
    this.sounds.forEach((soundData) => {
      const { audio, type, baseVolume } = soundData;
      const volumeMultiplier = type === 'music' ? this.musicVolume : this.soundVolume;
      audio.volume = baseVolume * volumeMultiplier * this.masterVolume;
    });
  }

  /**
   * Enable/disable sound effects
   * @param {boolean} enabled
   */
  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
    if (!enabled) {
      // Pause all sound effects
      this.sounds.forEach((soundData) => {
        if (soundData.type === 'sound') {
          soundData.audio.pause();
        }
      });
    }
  }

  /**
   * Enable/disable music
   * @param {boolean} enabled
   */
  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (!enabled) {
      // Pause all music
      this.sounds.forEach((soundData) => {
        if (soundData.type === 'music') {
          soundData.audio.pause();
        }
      });
    }
  }

  /**
   * Check if a sound is currently playing
   * @param {string} name - Sound identifier
   * @returns {boolean}
   */
  isPlaying(name) {
    const soundData = this.sounds.get(name);
    return soundData ? !soundData.audio.paused : false;
  }

  /**
   * Get current playback time of a sound
   * @param {string} name - Sound identifier
   * @returns {number}
   */
  getCurrentTime(name) {
    const soundData = this.sounds.get(name);
    return soundData ? soundData.audio.currentTime : 0;
  }

  /**
   * Clean up all audio resources
   */
  cleanup() {
    this.sounds.forEach((soundData) => {
      soundData.audio.pause();
      soundData.audio.src = '';
    });
    this.sounds.clear();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.isInitialized = false;
    console.log('✅ AudioManager cleaned up');
  }
}

// Create singleton instance
const audioManager = new AudioManager();
export default audioManager;

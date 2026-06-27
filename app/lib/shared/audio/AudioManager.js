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
    // Return a Promise that resolves immediately with a placeholder if lazy loading
    // The actual audio element will be created/loaded in playSound
    return new Promise((resolve) => {
      // Set audio properties
      const type = options.type || 'sound'; // 'sound' or 'music'
      const baseVolume = options.volume !== undefined ? options.volume : 1.0;

      const soundData = {
        audio: null, // Will be an HTMLAudioElement once loaded
        type,
        baseVolume,
        loop: options.loop || false,
        src: process.env.NODE_ENV === 'development' && typeof window !== 'undefined'
          ? `${window.location.origin}${src}`
          : src,
        _isLoaded: false, // Internal flag to track if the audio element is created and loaded
      };

      this.sounds.set(name, soundData);

      // Eagerly load music, lazy load sound effects
      if (type === 'music') {
        this._createAndLoadAudio(name, soundData.src, soundData.loop, baseVolume).then((audio) => {
          soundData.audio = audio;
          soundData._isLoaded = true;
          resolve(audio);
        });
      } else {
        resolve(null); // Resolve immediately for lazy-loaded sound effects
      }
    });
  }

  /**
   * Internal helper to create and load an HTMLAudioElement
   * @param {string} name - Unique identifier for the sound
   * @param {string} src - Path to audio file
   * @param {boolean} loop - Whether the audio should loop
   * @param {number} volume - Base volume
   * @returns {Promise<HTMLAudioElement>}
   * @private
   */
  _createAndLoadAudio(name, src, loop, volume) {
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

      audio.loop = loop;
      audio.volume = volume;
      audio.src = src; // Already absolute path from loadSound
      audio.load();
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
      console.log('✅ All sounds processed (music loaded, effects set for lazy-load)');
    } catch (error) {
      console.error('❌ Failed to process some sounds:', error);
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

    let { audio, type, baseVolume, loop, src, _isLoaded } = soundData;

    // Lazy load sound effects if not already loaded
    if (type === 'sound' && !_isLoaded) {
      try {
        audio = await this._createAndLoadAudio(name, src, loop, baseVolume);
        soundData.audio = audio;
        soundData._isLoaded = true;
        console.log(`⚡ Lazy loaded sound: ${name}`);
      } catch (error) {
        console.error(`❌ Failed to lazy load sound ${name}:`, error);
        return;
      }
    }

    if (!audio) {
        console.error(`❌ Audio element not available for ${name}`);
        return;
    }

    // Check if sound/music is enabled
    if (type === 'music' && !this.musicEnabled) {
      audio.pause(); // Ensure music doesn't play if disabled
      return;
    }
    if (type === 'sound' && !this.soundEnabled) {
      audio.pause(); // Ensure sound doesn't play if disabled
      return;
    }

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
    if (soundData && soundData.audio) {
      soundData.audio.pause();
    }
  }

  /**
   * Stop a sound and reset to beginning
   * @param {string} name - Sound identifier
   */
  stopSound(name) {
    const soundData = this.sounds.get(name);
    if (soundData && soundData.audio) {
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
    if (soundData && soundData.audio) {
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
      // Only update volume if audio element exists (i.e., it's loaded)
      if (soundData.audio) {
        const { audio, type, baseVolume } = soundData;
        const volumeMultiplier = type === 'music' ? this.musicVolume : this.soundVolume;
        audio.volume = baseVolume * volumeMultiplier * this.masterVolume;
      }
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
        if (soundData.type === 'sound' && soundData.audio) { // Check soundData.audio
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
        if (soundData.type === 'music' && soundData.audio) { // Check soundData.audio
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
    return soundData && soundData.audio ? !soundData.audio.paused : false;
  }

  /**
   * Get current playback time of a sound
   * @param {string} name - Sound identifier
   * @returns {number}
   */
  getCurrentTime(name) {
    const soundData = this.sounds.get(name);
    return soundData && soundData.audio ? soundData.audio.currentTime : 0;
  }

  /**
   * Clean up all audio resources
   */
  cleanup() {
    this.sounds.forEach((soundData) => {
      if (soundData.audio) { // Only clean up if audio element exists
        soundData.audio.pause();
        soundData.audio.src = '';
      }
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

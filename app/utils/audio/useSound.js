import { useEffect, useRef, useState, useCallback } from 'react';
import { useAudio } from '@/contexts/AudioContext';

export const useSound = () => {
  const { soundEnabled, musicEnabled, registerSounds } = useAudio();
  const sounds = useRef({});
  const thruster = useRef(null);
  const audioContext = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let resumeAudio = null;

    const loadAudio = (src) => {
      return new Promise((resolve, reject) => {
        const audio = new Audio();

        const onCanPlay = () => {
          audio.removeEventListener('canplaythrough', onCanPlay);
          audio.removeEventListener('error', onError);
          if (process.env.NODE_ENV === 'development') {
            console.log(`✅ Audio loaded: ${src}`);
          }
          resolve(audio);
        };

        const onError = (e) => {
          audio.removeEventListener('canplaythrough', onCanPlay);
          audio.removeEventListener('error', onError);
          console.error(`❌ Failed to load audio: ${src}`, e);
          reject(e);
        };

        audio.addEventListener('canplaythrough', onCanPlay);
        audio.addEventListener('error', onError);

        // Use absolute path from public directory
        audio.src = process.env.NODE_ENV === 'development' ? `http://localhost:3000${src}` : src;

        console.log('Attempting to load audio from:', audio.src);
        audio.load();
      });
    };

    // Initialize audio context
    const initAudioContext = async () => {
      try {
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        console.log('✅ Audio context initialized');
      } catch (e) {
        console.error('❌ Failed to initialize audio context:', e);
      }
    };

    // Load all sounds
    const loadSounds = async () => {
      try {
        await initAudioContext();
        if (cancelled) return;

        const [shoot, hit, miss, bgm, thrusterSound, empty] = await Promise.all([
          loadAudio('/sounds/shoot.mp3'),
          loadAudio('/sounds/hit.mp3'),
          loadAudio('/sounds/miss.mp3'),
          loadAudio('/sounds/bgm.mp3'),
          loadAudio('/sounds/thruster.mp3'),
          loadAudio('/sounds/empty.mp3'),
        ]);

        if (cancelled) return;

        sounds.current = { shoot, hit, miss, bgm, empty };

        // Register sounds with audio context
        registerSounds(sounds.current);
        setIsReady(true);

        // Set up BGM
        sounds.current.bgm.loop = true;
        sounds.current.bgm.volume = 1;

        // Set up thruster
        thruster.current = thrusterSound;
        thruster.current.loop = true;
        thruster.current.volume = 0.01;

        // Resume audio context on user interaction
        resumeAudio = async () => {
          if (audioContext.current && audioContext.current.state === 'suspended') {
            await audioContext.current.resume();
            console.log('✅ Audio context resumed');
          }
        };

        // Add resume handler to document
        document.addEventListener('click', resumeAudio, { once: true });
        document.addEventListener('keydown', resumeAudio, { once: true });
      } catch (error) {
        console.error('❌ Failed to load sounds:', error);
      }
    };

    loadSounds();

    return () => {
      cancelled = true;
      if (resumeAudio) {
        document.removeEventListener('click', resumeAudio);
        document.removeEventListener('keydown', resumeAudio);
      }
      Object.values(sounds.current).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
      if (thruster.current) {
        thruster.current.pause();
        thruster.current.src = '';
      }
      if (audioContext.current) {
        audioContext.current.close();
      }
      setIsReady(false);
    };
  }, []);

  const playSound = useCallback(async (name) => {
    const sound = sounds.current[name];
    if (!sound) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Sound not ready yet: ${name}`);
      }
      return;
    }

    // Check if sound/music is enabled
    if (name === 'bgm') {
      if (!musicEnabled) return;
    } else {
      if (!soundEnabled) return;
    }

    try {
      // Resume audio context if needed
        if (audioContext.current && audioContext.current.state === 'suspended') {
        await audioContext.current.resume();
        console.log('✅ Audio context resumed before playing');
      }

      // Special handling for background music
      if (name === 'bgm') {
        // Only play if it's not already playing
          if (sound.paused) {
          await sound.play();
          console.log('✅ Started background music');
        }
      } else {
        // For other sounds, reset and play
        sound.currentTime = 0;
  await sound.play();
  console.log(`✅ Played sound: ${name}`);
      }
    } catch (error) {
      console.error(`❌ Failed to play ${name}:`, error);
    }
  }, [musicEnabled, soundEnabled]);

  const setThrusterVolume = useCallback((volume) => {
    if (thruster.current) {
      const prevVolume = thruster.current.volume;
      thruster.current.volume = volume;
      if (volume > 0) {
        // Only play if paused and not already playing
            if (thruster.current.paused && thruster.current.currentTime === 0) {
          thruster.current.play().catch(() => {});
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Thruster sound started');
          }
        }
      } else {
        // Always pause and reset if volume is 0
        if (!thruster.current.paused || thruster.current.currentTime !== 0) {
          thruster.current.pause();
          thruster.current.currentTime = 0;
          if (process.env.NODE_ENV === 'development') {
            console.log('⏸️ Thruster sound paused');
          }
        }
      }
      // Only log volume changes if the value actually changed
      if (process.env.NODE_ENV === 'development' && prevVolume !== volume) {
        console.log(`✅ Set thruster volume to: ${volume}`);
      }
    }
  }, []);

  const pauseSound = useCallback((name) => {
    const sound = sounds.current[name];
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }, []);

  return { playSound, setThrusterVolume, pauseSound, sounds, isReady };
};

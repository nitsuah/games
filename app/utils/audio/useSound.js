import { useEffect, useRef } from 'react';

export const useSound = () => {
  const sounds = useRef({});
  const thruster = useRef(null);
  const audioContext = useRef(null);

  useEffect(() => {
    const loadAudio = (src) => {
      return new Promise((resolve, reject) => {
        const audio = new Audio();
        
        audio.addEventListener('canplaythrough', () => {
          console.log(`✅ Audio loaded: ${src}`);
          resolve(audio);
        });

        audio.addEventListener('error', (e) => {
          console.error(`❌ Failed to load audio: ${src}`, e);
          reject(e);
        });

        // Use absolute path from public directory
        audio.src = process.env.NODE_ENV === 'development' 
          ? `http://localhost:3000${src}`
          : src;
          
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
        
        const [shoot, hit, miss, bgm, thrusterSound] = await Promise.all([
          loadAudio('/sounds/shoot.mp3'),
          loadAudio('/sounds/hit.mp3'),
          loadAudio('/sounds/miss.mp3'),
          loadAudio('/sounds/bgm.mp3'),
          loadAudio('/sounds/thruster.mp3')
        ]);

        sounds.current = { shoot, hit, miss, bgm };
        
        // Set up BGM
        sounds.current.bgm.loop = true;
        sounds.current.bgm.volume = 1;

        // Set up thruster
        thruster.current = thrusterSound;
        thruster.current.loop = true;
        thruster.current.volume = 0.1;

        // Resume audio context on user interaction
        const resumeAudio = async () => {
          if (audioContext.current && audioContext.current.state === 'suspended') {
            await audioContext.current.resume();
            console.log('✅ Audio context resumed');
          }
        };

        // Add resume handler to document
        document.addEventListener('click', resumeAudio, { once: true });
        document.addEventListener('keydown', resumeAudio, { once: true });

        // Start thruster
        try {
          await resumeAudio();
          await thruster.current.play();
          console.log('✅ Thruster started');
        } catch (e) {
          console.error('❌ Failed to start thruster:', e);
        }
      } catch (error) {
        console.error('❌ Failed to load sounds:', error);
      }
    };

    loadSounds();

    return () => {
      Object.values(sounds.current).forEach(audio => {
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
    };
  }, []);

  const playSound = async (name) => {
    const sound = sounds.current[name];
    if (!sound) {
      console.error(`❌ Sound not found: ${name}`);
      return;
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
  };

  const setThrusterVolume = (volume) => {
    if (thruster.current) {
      thruster.current.volume = volume;
      console.log(`✅ Set thruster volume to: ${volume}`);
    }
  };

  return { playSound, setThrusterVolume };
}; 
import { createContext, useContext, useState, useCallback, useRef } from 'react';

const AudioContext = createContext(null);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
};

export const AudioProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const soundsRef = useRef(null);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  const toggleMusic = useCallback(() => {
    setMusicEnabled((prev) => {
      const newValue = !prev;
      // Pause or resume background music based on new state
      if (soundsRef.current?.bgm) {
        if (newValue) {
          soundsRef.current.bgm.play().catch(() => {});
        } else {
          soundsRef.current.bgm.pause();
        }
      }
      return newValue;
    });
  }, []);

  const registerSounds = useCallback((sounds) => {
    soundsRef.current = sounds;
  }, []);

  const value = {
    soundEnabled,
    musicEnabled,
    toggleSound,
    toggleMusic,
    registerSounds,
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

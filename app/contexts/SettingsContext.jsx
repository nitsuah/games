import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const DEFAULT_SETTINGS = {
  mouseSensitivityX: 0.002,
  mouseSensitivityY: 0.002,
  invertY: false,
  mouseSmoothing: true,
  colorblindMode: 'none',
  reduceMotion: false,
  highContrast: false,
  masterVolume: 0.7,
  musicVolume: 0.5,
  sfxVolume: 0.8,
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gameSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (e) {
      console.warn('Failed to load settings:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('gameSettings', JSON.stringify(settings));
      } catch (e) {
        console.warn('Failed to save settings:', e);
      }
    }
  }, [settings, isLoaded]);

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

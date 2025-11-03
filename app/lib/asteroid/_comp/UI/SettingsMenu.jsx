import { useState } from 'react';
import styles from './SettingsMenu.module.css';

/**
 * Comprehensive settings menu for accessibility and player preferences
 * Includes mouse sensitivity, colorblind modes, reduce motion, and audio controls
 */
export default function SettingsMenu({ isOpen, onClose, onSave }) {
  // Load saved settings from localStorage
  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('gameSettings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load settings:', e);
    }
    return {
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
  };

  const [settings, setSettings] = useState(loadSettings);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem('gameSettings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
    if (onSave) onSave(settings);
    onClose();
  };

  const handleReset = () => {
    const defaults = {
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
    setSettings(defaults);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>SETTINGS</h2>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        <div className={styles.content}>
          {/* Mouse Controls Section */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Mouse Controls</h3>
            
            <div className={styles.setting}>
              <label className={styles.label}>
                Horizontal Sensitivity
                <span className={styles.value}>{(settings.mouseSensitivityX * 1000).toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={settings.mouseSensitivityX * 1000}
                onChange={(e) => handleChange('mouseSensitivityX', parseFloat(e.target.value) / 1000)}
                className={styles.slider}
              />
            </div>

            <div className={styles.setting}>
              <label className={styles.label}>
                Vertical Sensitivity
                <span className={styles.value}>{(settings.mouseSensitivityY * 1000).toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={settings.mouseSensitivityY * 1000}
                onChange={(e) => handleChange('mouseSensitivityY', parseFloat(e.target.value) / 1000)}
                className={styles.slider}
              />
            </div>

            <div className={styles.setting}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={settings.invertY}
                  onChange={(e) => handleChange('invertY', e.target.checked)}
                  className={styles.checkbox}
                />
                Invert Y-Axis
              </label>
            </div>

            <div className={styles.setting}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={settings.mouseSmoothing}
                  onChange={(e) => handleChange('mouseSmoothing', e.target.checked)}
                  className={styles.checkbox}
                />
                Mouse Smoothing
              </label>
            </div>
          </section>

          {/* Accessibility Section */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Accessibility</h3>
            
            <div className={styles.setting}>
              <label className={styles.label}>Colorblind Mode</label>
              <select
                value={settings.colorblindMode}
                onChange={(e) => handleChange('colorblindMode', e.target.value)}
                className={styles.select}
              >
                <option value="none">None</option>
                <option value="deuteranopia">Deuteranopia (Red-Green)</option>
                <option value="protanopia">Protanopia (Red-Green)</option>
                <option value="tritanopia">Tritanopia (Blue-Yellow)</option>
              </select>
            </div>

            <div className={styles.setting}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={settings.reduceMotion}
                  onChange={(e) => handleChange('reduceMotion', e.target.checked)}
                  className={styles.checkbox}
                />
                Reduce Motion
                <span className={styles.description}>Disables screen shake and reduces particle effects</span>
              </label>
            </div>

            <div className={styles.setting}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={(e) => handleChange('highContrast', e.target.checked)}
                  className={styles.checkbox}
                />
                High Contrast Mode
                <span className={styles.description}>Increases UI visibility</span>
              </label>
            </div>
          </section>

          {/* Audio Section */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Audio</h3>
            
            <div className={styles.setting}>
              <label className={styles.label}>
                Master Volume
                <span className={styles.value}>{Math.round(settings.masterVolume * 100)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={(e) => handleChange('masterVolume', parseFloat(e.target.value))}
                className={styles.slider}
              />
            </div>

            <div className={styles.setting}>
              <label className={styles.label}>
                Music Volume
                <span className={styles.value}>{Math.round(settings.musicVolume * 100)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => handleChange('musicVolume', parseFloat(e.target.value))}
                className={styles.slider}
              />
            </div>

            <div className={styles.setting}>
              <label className={styles.label}>
                SFX Volume
                <span className={styles.value}>{Math.round(settings.sfxVolume * 100)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => handleChange('sfxVolume', parseFloat(e.target.value))}
                className={styles.slider}
              />
            </div>
          </section>
        </div>

        <div className={styles.footer}>
          <button className={styles.resetButton} onClick={handleReset}>
            Reset to Defaults
          </button>
          <div className={styles.buttonGroup}>
            <button className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button className={styles.saveButton} onClick={handleSave}>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

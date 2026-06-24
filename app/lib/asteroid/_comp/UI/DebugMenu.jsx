import { useState } from 'react';
import styles from './DebugMenu.module.css';

const DebugMenu = ({ trailQuality, setTrailQuality }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleTrailChange = (quality) => {
    setTrailQuality(quality);
    try {
      localStorage.setItem('trailQuality', quality);
    } catch {
      // ignore
    }
  };

  return (
    <div className={styles.container}>
      {/* Toggle button - gear icon */}
      <button
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle debug menu"
        aria-expanded={isOpen}
        title="Trail Quality"
      >
        ⚙️
      </button>

      {/* Expandable menu */}
      {isOpen && (
        <div className={styles.menu}>
          <div className={styles.menuHeader}>Debug Controls</div>
          
          <div className={styles.control}>
            <span className={styles.label}>Trail Quality:</span>
            <div className={styles.buttonGroup}>
              {['off', 'low', 'high'].map((q) => (
                <button
                  key={q}
                  className={`${styles.button} ${trailQuality === q ? styles.active : ''}`}
                  onClick={() => handleTrailChange(q)}
                  aria-pressed={trailQuality === q}
                  aria-label={`Trail quality ${q}`}
                >
                  {q === 'off' ? 'Off' : q === 'low' ? 'Low' : 'High'}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.hint}>
            Press <kbd>T</kbd> to cycle
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugMenu;

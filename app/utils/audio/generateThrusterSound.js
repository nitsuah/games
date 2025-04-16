export function generateThrusterSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const filterNode = audioContext.createBiquadFilter();

  // Set up oscillator
  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(100, audioContext.currentTime);

  // Set up filter
  filterNode.type = 'lowpass';
  filterNode.frequency.setValueAtTime(1000, audioContext.currentTime);
  filterNode.Q.setValueAtTime(10, audioContext.currentTime);

  // Set up gain
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);

  // Connect nodes
  oscillator.connect(filterNode);
  filterNode.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Start oscillator
  oscillator.start();

  return {
    start() {
      gainNode.gain.setTargetAtTime(0.3, audioContext.currentTime, 0.1);
      filterNode.frequency.setTargetAtTime(2000, audioContext.currentTime, 0.1);
    },
    stop() {
      gainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.1);
      filterNode.frequency.setTargetAtTime(1000, audioContext.currentTime, 0.1);
    },
    cleanup() {
      oscillator.stop();
      oscillator.disconnect();
      filterNode.disconnect();
      gainNode.disconnect();
    }
  };
} 
import { installFakeAudioContext } from '../../helpers/fakeAudio';
import { SimpleSoundSystem } from '@/lib/shared/audio/SimpleSoundSystem';

describe('SimpleSoundSystem', () => {
  let audio;

  beforeEach(() => {
    audio = installFakeAudioContext();
  });

  const lastOsc = () => audio.contexts[0].nodesOf('oscillator').at(-1);

  it('creates an audio context on construction', () => {
    new SimpleSoundSystem();
    expect(audio.Ctor).toHaveBeenCalledTimes(1);
  });

  it('playTone sets frequency, envelope and duration', () => {
    const s = new SimpleSoundSystem();
    s.playTone(440, 0.5);
    const osc = lastOsc();
    expect(osc.frequency.value).toBe(440);
    const gain = audio.contexts[0].nodesOf('gain')[0];
    expect(gain.gain.setValueAtTime).toHaveBeenCalledWith(0.3, 0);
    expect(osc.stop).toHaveBeenCalledWith(0.5);
    expect(gain.connect).toHaveBeenCalledWith(audio.contexts[0].destination);
  });

  it.each([
    ['hit', 200, 'sine'],
    ['flap', 350, 'sine'],
  ])('%s plays a %pHz tone', (method, freq, type) => {
    const s = new SimpleSoundSystem();
    s[method]();
    expect(lastOsc().frequency.value).toBe(freq);
    expect(lastOsc().type).toBe(type);
  });

  it.each([
    ['destroy', 400, 'sawtooth', 0.2],
    ['powerUp', 300, 'square', 0.3],
    ['shoot', 800, 'sawtooth', 0.1],
    ['gameOver', 400, 'triangle', 0.5],
  ])('%s sweeps from %pHz (%s) for %ps', (method, startFreq, type, duration) => {
    const s = new SimpleSoundSystem();
    s[method]();
    const osc = lastOsc();
    expect(osc.type).toBe(type);
    expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(startFreq, 0);
    expect(osc.stop).toHaveBeenCalledWith(duration);
  });

  it('resumes a suspended context before playing', () => {
    audio = installFakeAudioContext({ state: 'suspended' });
    const s = new SimpleSoundSystem();
    s.hit();
    expect(audio.contexts[0].resume).toHaveBeenCalled();
  });

  it('plays nothing when disabled via toggle or setEnabled', () => {
    const s = new SimpleSoundSystem();
    expect(s.toggle()).toBe(false);
    ['hit', 'destroy', 'powerUp', 'shoot', 'flap', 'gameOver'].forEach((m) => s[m]());
    expect(audio.contexts[0].createOscillator).not.toHaveBeenCalled();
    expect(s.toggle()).toBe(true);
    s.setEnabled(false);
    s.shoot();
    expect(audio.contexts[0].createOscillator).not.toHaveBeenCalled();
    s.setEnabled(true);
    s.shoot();
    expect(audio.contexts[0].createOscillator).toHaveBeenCalled();
  });
});

import { installFakeAudioContext } from '../../helpers/fakeAudio';
import DynamicMusicSystem, { getDynamicMusicSystem } from '@/utils/audio/DynamicMusicSystem';

describe('DynamicMusicSystem', () => {
  let audio;

  beforeEach(() => {
    jest.useFakeTimers();
    audio = installFakeAudioContext();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const ctxOf = () => audio.contexts[0];

  it('initialize builds a master gain plus a silent gain per layer', () => {
    const m = new DynamicMusicSystem();
    m.initialize();
    expect(m.masterGain.gain.setValueAtTime).toHaveBeenCalledWith(0.3, 0);
    expect(Object.keys(m.gainNodes)).toEqual(['ambient', 'bass', 'percussion', 'lead']);
    Object.values(m.gainNodes).forEach((g) => {
      expect(g.gain.setValueAtTime).toHaveBeenCalledWith(0, 0);
      expect(g.connect).toHaveBeenCalledWith(m.masterGain);
    });
  });

  it('initialize warns instead of throwing when audio is unavailable', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    window.AudioContext = jest.fn(() => {
      throw new Error('nope');
    });
    const m = new DynamicMusicSystem();
    m.initialize();
    expect(warn).toHaveBeenCalled();
    m.start(); // still no context -> no-op
    expect(m.isPlaying).toBe(false);
  });

  it('layer starters are no-ops without a context', () => {
    const m = new DynamicMusicSystem();
    expect(() => {
      m.startAmbientLayer();
      m.startBassLayer();
      m.startPercussionLayer();
      m.startLeadLayer();
      m.updateWave(5);
      m.stop();
      m.setVolume(1);
    }).not.toThrow();
  });

  describe('start', () => {
    it('wave 1 starts ambient immediately and bass after 2s only', () => {
      const m = new DynamicMusicSystem();
      m.start();
      expect(m.isPlaying).toBe(true);
      expect(m.layers.ambient).toMatchObject({ drone: expect.any(Object), pad: expect.any(Object) });
      expect(m.gainNodes.ambient.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.4, 2);

      const bass = jest.spyOn(m, 'startBassLayer');
      const perc = jest.spyOn(m, 'startPercussionLayer');
      const lead = jest.spyOn(m, 'startLeadLayer');
      jest.advanceTimersByTime(6000);
      expect(bass).toHaveBeenCalledTimes(1);
      expect(perc).not.toHaveBeenCalled();
      expect(lead).not.toHaveBeenCalled();
    });

    it('wave 5 schedules every layer', () => {
      const m = new DynamicMusicSystem();
      const perc = jest.spyOn(m, 'startPercussionLayer');
      const lead = jest.spyOn(m, 'startLeadLayer');
      m.start(5);
      jest.advanceTimersByTime(6000);
      expect(perc).toHaveBeenCalledTimes(1);
      expect(lead).toHaveBeenCalledTimes(1);
    });

    it('is ignored while already playing', () => {
      const m = new DynamicMusicSystem();
      m.start(1);
      const ambient = jest.spyOn(m, 'startAmbientLayer');
      m.start(3);
      expect(ambient).not.toHaveBeenCalled();
      expect(m.currentWave).toBe(1);
    });
  });

  describe('rhythmic layers', () => {
    it('bass pulses every 500ms until stopped', () => {
      const m = new DynamicMusicSystem();
      m.initialize();
      m.isPlaying = true;
      m.startBassLayer();
      const count = () => ctxOf().nodesOf('oscillator').length;
      expect(count()).toBe(1);
      jest.advanceTimersByTime(1000);
      expect(count()).toBe(3);
      m.isPlaying = false;
      jest.advanceTimersByTime(2000);
      expect(count()).toBe(3); // the queued beat sees !isPlaying and schedules nothing
    });

    it('percussion adds a kick on every other hi-hat', () => {
      const m = new DynamicMusicSystem();
      m.initialize();
      m.isPlaying = true;
      m.startPercussionLayer();
      jest.advanceTimersByTime(1500); // beats 0..3
      const oscs = ctxOf().nodesOf('oscillator');
      const hihats = oscs.filter((o) => o.type === 'square');
      const kicks = oscs.filter((o) => o.type === 'sine');
      expect(hihats).toHaveLength(4);
      expect(kicks).toHaveLength(2);
    });

    it('lead cycles through the pentatonic scale', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0); // 500ms between notes
      const m = new DynamicMusicSystem();
      m.initialize();
      m.isPlaying = true;
      m.startLeadLayer();
      jest.advanceTimersByTime(2500);
      const freqs = ctxOf()
        .nodesOf('oscillator')
        .map((o) => o.frequency.setValueAtTime.mock.calls[0][0]);
      expect(freqs).toEqual([220, 247, 261.63, 329.63, 349.23, 220]);
    });
  });

  describe('updateWave', () => {
    it('adds percussion at wave 3 and lead at wave 5, and boosts volume (capped)', () => {
      const m = new DynamicMusicSystem();
      m.start(1);
      const perc = jest.spyOn(m, 'startPercussionLayer').mockImplementation(() => {});
      const lead = jest.spyOn(m, 'startLeadLayer').mockImplementation(() => {});
      m.updateWave(2);
      expect(perc).not.toHaveBeenCalled();
      m.updateWave(3);
      expect(perc).toHaveBeenCalledTimes(1);
      m.updateWave(4);
      m.updateWave(5);
      expect(lead).toHaveBeenCalledTimes(1);
      m.updateWave(30);
      expect(m.masterGain.gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(0.4, 1);
      expect(perc).toHaveBeenCalledTimes(1);
    });

    it('is ignored when not playing', () => {
      const m = new DynamicMusicSystem();
      m.initialize();
      m.updateWave(5);
      expect(m.currentWave).toBe(1);
    });
  });

  it('stop fades out, then stops oscillators and clears layers', () => {
    const m = new DynamicMusicSystem();
    m.start(1);
    const { drone, pad, lfo } = m.layers.ambient;
    drone.stop.mockImplementation(() => {
      throw new Error('already stopped');
    });
    m.stop();
    expect(m.isPlaying).toBe(false);
    Object.values(m.gainNodes).forEach((g) => expect(g.gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(0, 2));
    jest.advanceTimersByTime(2500);
    expect(pad.stop).toHaveBeenCalled();
    expect(lfo.stop).toHaveBeenCalled();
    expect(m.layers).toEqual({ ambient: null, bass: null, percussion: null, lead: null });
  });

  it('setVolume clamps to [0, 1]', () => {
    const m = new DynamicMusicSystem();
    m.initialize();
    m.setVolume(4);
    expect(m.masterGain.gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(1, 0.1);
    m.setVolume(-1);
    expect(m.masterGain.gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(0, 0.1);
  });

  it('cleanup stops and closes the context, tolerating close errors', () => {
    const m = new DynamicMusicSystem();
    m.start(1);
    const ctx = ctxOf();
    ctx.close.mockImplementation(() => {
      throw new Error('closed');
    });
    m.cleanup();
    expect(m.audioCtx).toBeNull();
    expect(ctx.close).toHaveBeenCalled();
    expect(() => m.cleanup()).not.toThrow();
  });

  it('getDynamicMusicSystem returns a singleton', () => {
    const a = getDynamicMusicSystem();
    expect(a).toBeInstanceOf(DynamicMusicSystem);
    expect(getDynamicMusicSystem()).toBe(a);
  });
});

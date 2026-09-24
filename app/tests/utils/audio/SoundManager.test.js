import { installFakeAudioContext } from '../../helpers/fakeAudio';

jest.mock('@/utils/audio/generateThrusterSound', () => ({
  generateThrusterSound: jest.fn(() => ({ start: jest.fn(), stop: jest.fn(), cleanup: jest.fn() })),
}));

function freshManager() {
  let mgr;
  jest.isolateModules(() => {
    mgr = require('@/utils/audio/SoundManager').default;
  });
  return mgr;
}

const ONE_SHOTS = [
  ['playExplosion', []],
  ['playPowerUpCollect', []],
  ['playPowerUpActivate', ['shield']],
  ['playPowerUpDeactivate', []],
  ['playHitImpact', [1, 1]],
  ['playLaserShoot', [1]],
  ['playShotgunShoot', [1]],
  ['playCannonShoot', [1]],
  ['playComboMilestone', [5]],
  ['playKillStreak', [10]],
  ['playWaveClear', [0.5]],
];

describe('SoundManager', () => {
  let audio;
  let sm;

  beforeEach(() => {
    audio = installFakeAudioContext();
    sm = freshManager();
  });

  afterEach(() => {
    sm.stopHeartbeat();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const ctx = () => audio.contexts[0];

  describe('initialize / thruster / cleanup', () => {
    it('creates the thruster, one context and a master gain at the SFX volume', () => {
      sm.initialize();
      sm.initialize();
      expect(audio.Ctor).toHaveBeenCalledTimes(1);
      expect(sm.masterGain.gain.setValueAtTime).toHaveBeenCalledWith(0.8, 0);
      expect(sm.masterGain.connect).toHaveBeenCalledWith(ctx().destination);
      expect(sm.thrusterSound).not.toBeNull();
    });

    it('logs if initialization throws', () => {
      const err = jest.spyOn(console, 'error').mockImplementation(() => {});
      window.AudioContext = jest.fn(() => {
        throw new Error('nope');
      });
      sm.initialize();
      expect(sm.isInitialized).toBe(false);
      expect(err).toHaveBeenCalled();
    });

    it('startThruster lazily initializes; stopThruster needs initialization', () => {
      sm.stopThruster(); // not initialized: no-op
      sm.startThruster();
      expect(sm.isInitialized).toBe(true);
      expect(sm.thrusterSound.start).toHaveBeenCalled();
      sm.stopThruster();
      expect(sm.thrusterSound.stop).toHaveBeenCalled();
    });

    it('cleanup tears down the thruster and context, tolerating close errors', () => {
      sm.initialize();
      const thruster = sm.thrusterSound;
      ctx().close.mockImplementation(() => {
        throw new Error('closed');
      });
      sm.cleanup();
      expect(thruster.cleanup).toHaveBeenCalled();
      expect(sm.audioCtx).toBeNull();
      expect(sm.isInitialized).toBe(false);
      expect(() => sm.cleanup()).not.toThrow();
    });
  });

  describe('volume routing', () => {
    it('setSfxVolume clamps and ramps the master gain when present', () => {
      sm.setSfxVolume(2);
      expect(sm.sfxVolume).toBe(1);
      sm.initialize();
      sm.setSfxVolume(-1);
      expect(sm.sfxVolume).toBe(0);
      expect(sm.masterGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, 0.1);
    });

    it('getOutputNode lazily creates a master gain for a context', () => {
      const c = installFakeAudioContext().Ctor();
      const out = sm.getOutputNode(c);
      expect(out.kind).toBe('gain');
      expect(sm.getOutputNode(c)).toBe(out);
    });
  });

  describe.each(ONE_SHOTS)('%s', (method, args) => {
    it('builds and schedules nodes routed to the master gain', () => {
      sm[method](...args);
      const c = ctx();
      const sources = [...c.nodesOf('oscillator'), ...c.nodesOf('bufferSource')];
      expect(sources.length).toBeGreaterThan(0);
      sources.forEach((s) => expect(s.start).toHaveBeenCalled());
      expect(sm.masterGain).not.toBeNull();
      expect(sm.masterGain.connect).toHaveBeenCalledWith(c.destination);
    });

    it('is silent when sound is disabled', () => {
      sm.setSoundEnabled(false);
      sm[method](...args);
      expect(audio.Ctor).not.toHaveBeenCalled();
    });

    it('swallows audio errors (and warns in development)', () => {
      const env = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      window.AudioContext = jest.fn(() => {
        throw new Error('broken');
      });
      expect(() => sm[method](...args)).not.toThrow();
      expect(warn).toHaveBeenCalled();
      process.env.NODE_ENV = env;
    });
  });

  describe('playExplosion', () => {
    it('clamps pan and bypasses the panner when unsupported', () => {
      sm.playExplosion(2, 5);
      expect(ctx().nodesOf('panner')[0].pan.setValueAtTime).toHaveBeenCalledWith(1, 0);

      ctx().createStereoPanner = undefined;
      ctx().nodes.length = 0;
      sm.playExplosion(0.1, 0);
      expect(ctx().nodesOf('filter')[0].connect).toHaveBeenCalledWith(sm.masterGain);
    });
  });

  describe('playPowerUpActivate', () => {
    it.each([
      ['rapidFire', 600],
      ['shield', 300],
      ['health', 400],
      ['slowMotion', 200],
      ['damageBoost', 700],
      ['mystery', 500],
      [undefined, 500],
    ])('%s sweeps a bandpass from %pHz', (type, freq) => {
      sm.playPowerUpActivate(type);
      expect(ctx().nodesOf('filter')[0].frequency.setValueAtTime).toHaveBeenCalledWith(freq, 0);
    });
  });

  describe('playComboMilestone', () => {
    it('plays a 3-note arpeggio, adding sparkle from 15x', () => {
      sm.playComboMilestone(10);
      expect(ctx().nodesOf('oscillator')).toHaveLength(3);
      ctx().nodes.length = 0;
      sm.playComboMilestone(15);
      expect(ctx().nodesOf('oscillator')).toHaveLength(4);
    });
  });

  describe('playWaveClear', () => {
    it('adds 5 sparkles only above 80% performance', () => {
      sm.playWaveClear(0.8);
      expect(ctx().nodesOf('oscillator')).toHaveLength(4);
      ctx().nodes.length = 0;
      sm.playWaveClear();
      expect(ctx().nodesOf('oscillator')).toHaveLength(9);
    });
  });

  describe('playKillStreak', () => {
    it('caps intensity at 5x', () => {
      sm.playKillStreak(1000);
      expect(ctx().nodesOf('oscillator')[0].frequency.setValueAtTime).toHaveBeenCalledWith(800, 0);
    });
  });

  describe('heartbeat', () => {
    beforeEach(() => jest.useFakeTimers());

    const beats = () => ctx().nodesOf('oscillator').length / 2;

    it('does not start at or above 30% health', () => {
      sm.startHeartbeat(30);
      expect(audio.Ctor).not.toHaveBeenCalled();
      expect(sm.heartbeatInterval).toBeNull();
    });

    it('beats immediately then on an interval that speeds up as health drops', () => {
      sm.startHeartbeat(10); // 1000 - 20*25 = 500ms
      expect(beats()).toBe(1);
      jest.advanceTimersByTime(1000);
      expect(beats()).toBe(3);
    });

    it('clamps the interval to 250ms at very low health', () => {
      sm.startHeartbeat(-100);
      jest.advanceTimersByTime(1000);
      expect(beats()).toBe(5);
    });

    it('restarting replaces the previous interval', () => {
      sm.startHeartbeat(10);
      const first = sm.heartbeatInterval;
      sm.startHeartbeat(20);
      expect(sm.heartbeatInterval).not.toBe(first);
      sm.stopHeartbeat();
      expect(sm.heartbeatInterval).toBeNull();
      jest.advanceTimersByTime(5000);
      expect(beats()).toBe(2);
    });

    it('updateHeartbeat starts, retunes and stops based on health', () => {
      const start = jest.spyOn(sm, 'startHeartbeat');
      sm.updateHeartbeat(20);
      expect(start).toHaveBeenCalledTimes(1);
      sm.updateHeartbeat(15);
      expect(start).toHaveBeenCalledTimes(2);
      sm.updateHeartbeat(50);
      expect(sm.heartbeatInterval).toBeNull();
    });

    it('high health stops a running heartbeat', () => {
      sm.startHeartbeat(10);
      sm.startHeartbeat(90);
      expect(sm.heartbeatInterval).toBeNull();
    });

    it('is silent when sound is disabled', () => {
      sm.setSoundEnabled(false);
      sm.startHeartbeat(5);
      expect(sm.heartbeatInterval).toBeNull();
    });

    it('warns in development when the context cannot be created', () => {
      const env = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      window.AudioContext = jest.fn(() => {
        throw new Error('broken');
      });
      sm.startHeartbeat(5);
      expect(warn).toHaveBeenCalled();
      process.env.NODE_ENV = env;
    });
  });
});

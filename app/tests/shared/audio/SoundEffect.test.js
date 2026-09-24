import { installFakeAudioContext } from '../../helpers/fakeAudio';
import { audioManager, soundEffect as indexSoundEffect } from '@/lib/shared/audio';

function freshSoundEffect() {
  let se;
  jest.isolateModules(() => {
    se = require('@/lib/shared/audio/SoundEffect').default;
  });
  return se;
}

describe('shared/audio index', () => {
  it('re-exports the singletons', () => {
    expect(audioManager).toBeDefined();
    expect(typeof indexSoundEffect.playExplosion).toBe('function');
  });
});

describe('SoundEffect', () => {
  let audio;
  let se;

  beforeEach(() => {
    audio = installFakeAudioContext();
    se = freshSoundEffect();
  });

  afterEach(() => jest.restoreAllMocks());

  it('initialize creates the context once', () => {
    se.initialize();
    se.initialize();
    expect(audio.Ctor).toHaveBeenCalledTimes(1);
  });

  it('initialize logs if the context cannot be created', () => {
    const err = jest.spyOn(console, 'error').mockImplementation(() => {});
    window.AudioContext = jest.fn(() => {
      throw new Error('no audio');
    });
    se.initialize();
    expect(se.audioContext).toBeNull();
    expect(err).toHaveBeenCalled();
    // every sound bails out safely without a context
    expect(() => {
      se.playExplosion();
      se.playWeaponFire();
    }).not.toThrow();
    expect(se.generateThruster()).toBeNull();
  });

  describe('playExplosion', () => {
    it('builds noise, thump and rumble layers routed through a stereo panner', () => {
      se.playExplosion(1, 0.5);
      const ctx = audio.contexts[0];
      expect(ctx.nodesOf('bufferSource')).toHaveLength(1);
      expect(ctx.nodesOf('oscillator')).toHaveLength(2);
      const [panner] = ctx.nodesOf('panner');
      expect(panner.pan.setValueAtTime).toHaveBeenCalledWith(0.5, 0);
      expect(panner.connect).toHaveBeenCalledWith(ctx.destination);
      ctx.nodesOf('oscillator').forEach((o) => {
        expect(o.start).toHaveBeenCalled();
        expect(o.stop).toHaveBeenCalledWith(1);
      });
    });

    it('fills the noise buffer with decaying samples in [-1, 1]', () => {
      se.playExplosion();
      const ctx = audio.contexts[0];
      const data = ctx.createBuffer.mock.results[0].value.getChannelData(0);
      expect(data.length).toBe(ctx.sampleRate);
      expect(Array.from(data).every((v) => v >= -1 && v <= 1)).toBe(true);
    });

    it('clamps size to [0.2, 3] and pan to [-1, 1]', () => {
      se.playExplosion(100, -9);
      let ctx = audio.contexts[0];
      const thump = ctx.nodesOf('oscillator')[0];
      expect(thump.frequency.setValueAtTime).toHaveBeenCalledWith(80 / 3, 0);
      expect(ctx.nodesOf('panner')[0].pan.setValueAtTime).toHaveBeenCalledWith(-1, 0);

      ctx.nodes.length = 0;
      se.playExplosion(0);
      expect(ctx.nodesOf('oscillator')[0].frequency.setValueAtTime).toHaveBeenCalledWith(80 / 0.2, 0);
    });

    it('connects straight to the destination when StereoPanner is unsupported', () => {
      se.initialize();
      const ctx = audio.contexts[0];
      ctx.createStereoPanner = undefined;
      se.playExplosion();
      const gains = ctx.nodesOf('gain');
      expect(gains[0].connect).toHaveBeenCalledWith(ctx.destination);
      expect(ctx.nodesOf('filter')[0].connect).toHaveBeenCalledWith(ctx.destination);
    });

    it('is silent when disabled', () => {
      se.setSoundEnabled(false);
      se.playExplosion();
      expect(audio.Ctor).not.toHaveBeenCalled();
    });
  });

  describe('playWeaponFire', () => {
    it.each([
      ['laser', 'oscillator', 800],
      [undefined, 'oscillator', 800],
      ['unknown', 'oscillator', 800],
      ['explosive', 'oscillator', 80],
    ])('%s fires a %s at %pHz', (type, kind, freq) => {
      se.playWeaponFire(type);
      const [osc] = audio.contexts[0].nodesOf(kind);
      expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(freq, 0);
      expect(osc.start).toHaveBeenCalled();
    });

    it('shotgun plays a decaying noise burst', () => {
      se.playWeaponFire('shotgun');
      const ctx = audio.contexts[0];
      const [src] = ctx.nodesOf('bufferSource');
      expect(src.buffer.length).toBe(ctx.sampleRate * 0.1);
      expect(src.start).toHaveBeenCalledWith(0);
    });

    it('is silent when disabled', () => {
      se.setSoundEnabled(false);
      se.playWeaponFire('laser');
      expect(audio.Ctor).not.toHaveBeenCalled();
    });
  });

  describe('generateThruster', () => {
    it('returns start/stop/cleanup controls around a running oscillator', () => {
      const t = se.generateThruster();
      const ctx = audio.contexts[0];
      const [osc] = ctx.nodesOf('oscillator');
      const [gain] = ctx.nodesOf('gain');
      expect(osc.start).toHaveBeenCalled();

      t.start();
      expect(gain.gain.setTargetAtTime).toHaveBeenLastCalledWith(0.3, 0, 0.1);
      t.stop();
      expect(gain.gain.setTargetAtTime).toHaveBeenLastCalledWith(0, 0, 0.1);
      t.cleanup();
      expect(osc.stop).toHaveBeenCalled();
      expect(osc.disconnect).toHaveBeenCalled();
      expect(gain.disconnect).toHaveBeenCalled();
    });

    it('start() is a no-op while sound is disabled', () => {
      const t = se.generateThruster();
      se.setSoundEnabled(false);
      const [gain] = audio.contexts[0].nodesOf('gain');
      t.start();
      expect(gain.gain.setTargetAtTime).not.toHaveBeenCalled();
    });
  });

  it('cleanup closes the context and allows re-initialisation', () => {
    se.initialize();
    const ctx = audio.contexts[0];
    se.cleanup();
    expect(ctx.close).toHaveBeenCalled();
    expect(se.audioContext).toBeNull();
    se.cleanup();
    se.initialize();
    expect(audio.Ctor).toHaveBeenCalledTimes(2);
  });
});

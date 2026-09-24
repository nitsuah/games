import { installFakeAudioContext, installFakeAudioElement, FakeAudio, flushPromises } from '../../helpers/fakeAudio';

function freshManager() {
  let mgr;
  jest.isolateModules(() => {
    mgr = require('@/lib/shared/audio/AudioManager').default;
  });
  return mgr;
}

describe('AudioManager', () => {
  let audioCtx;
  let mgr;

  beforeEach(() => {
    audioCtx = installFakeAudioContext();
    installFakeAudioElement();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mgr = freshManager();
  });

  afterEach(() => jest.restoreAllMocks());

  describe('initialize', () => {
    it('creates one audio context and is idempotent', async () => {
      await mgr.initialize();
      await mgr.initialize();
      expect(audioCtx.Ctor).toHaveBeenCalledTimes(1);
      expect(mgr.isInitialized).toBe(true);
    });

    it('resumes a suspended context on the first click', async () => {
      await mgr.initialize();
      mgr.audioContext.state = 'suspended';
      document.dispatchEvent(new Event('click'));
      await flushPromises();
      expect(mgr.audioContext.resume).toHaveBeenCalled();
    });

    it('does not resume a running context on keydown', async () => {
      await mgr.initialize();
      document.dispatchEvent(new Event('keydown'));
      await flushPromises();
      expect(mgr.audioContext.resume).not.toHaveBeenCalled();
    });

    it('logs and stays uninitialized if AudioContext throws', async () => {
      window.AudioContext = jest.fn(() => {
        throw new Error('unsupported');
      });
      await mgr.initialize();
      expect(mgr.isInitialized).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });

    it('falls back to webkitAudioContext', async () => {
      const webkit = window.AudioContext;
      window.AudioContext = undefined;
      window.webkitAudioContext = webkit;
      await mgr.initialize();
      expect(webkit).toHaveBeenCalled();
      delete window.webkitAudioContext;
    });
  });

  describe('loadSound / loadSounds', () => {
    it('lazy-registers sound effects without creating an element', async () => {
      await expect(mgr.loadSound('shoot', '/s.mp3')).resolves.toBeNull();
      expect(FakeAudio.instances).toHaveLength(0);
      expect(mgr.sounds.get('shoot')).toMatchObject({ type: 'sound', baseVolume: 1, loop: false, _isLoaded: false });
    });

    it('eagerly loads music with loop and volume', async () => {
      const audio = await mgr.loadSound('bgm', '/m.mp3', { type: 'music', loop: true, volume: 0.4 });
      expect(audio).toBe(FakeAudio.instances[0]);
      expect(audio).toMatchObject({ loop: true, volume: 0.4, src: '/m.mp3' });
      expect(mgr.sounds.get('bgm')._isLoaded).toBe(true);
    });

    it('keeps an explicit volume of 0', async () => {
      await mgr.loadSound('quiet', '/q.mp3', { volume: 0 });
      expect(mgr.sounds.get('quiet').baseVolume).toBe(0);
    });

    it('prefixes the origin in development', async () => {
      const env = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      await mgr.loadSound('s', '/s.mp3');
      expect(mgr.sounds.get('s').src).toBe(`${window.location.origin}/s.mp3`);
      process.env.NODE_ENV = env;
    });

    it('loadSounds registers every entry', async () => {
      await mgr.loadSounds({
        a: { src: '/a.mp3' },
        b: { src: '/b.mp3', options: { type: 'music' } },
      });
      expect([...mgr.sounds.keys()]).toEqual(['a', 'b']);
    });

    it('loadSounds logs rather than throws if processing fails', async () => {
      jest.spyOn(mgr, 'loadSound').mockRejectedValueOnce(new Error('boom'));
      await expect(mgr.loadSounds({ a: { src: '/a.mp3' } })).resolves.toBeUndefined();
      expect(console.error).toHaveBeenCalledWith('❌ Failed to process some sounds:', expect.any(Error));
    });
  });

  describe('playSound', () => {
    it('errors for unknown sounds', async () => {
      await mgr.playSound('nope');
      expect(console.error).toHaveBeenCalledWith('❌ Sound not found: nope');
    });

    it('lazy loads a sound effect on first play and applies volume multipliers', async () => {
      await mgr.loadSound('shoot', '/s.mp3', { volume: 0.5 });
      mgr.soundVolume = 0.5;
      mgr.masterVolume = 0.8;
      await mgr.playSound('shoot');
      const audio = FakeAudio.instances[0];
      expect(audio.play).toHaveBeenCalled();
      expect(audio.volume).toBeCloseTo(0.2);
      expect(audio.currentTime).toBe(0);

      await mgr.playSound('shoot', { volume: 1 });
      expect(FakeAudio.instances).toHaveLength(1); // reused
      expect(audio.volume).toBeCloseTo(0.4);
    });

    it('logs and bails when lazy loading fails', async () => {
      FakeAudio.failing.add('/bad.mp3');
      await mgr.loadSound('bad', '/bad.mp3');
      await mgr.playSound('bad');
      expect(console.error).toHaveBeenCalledWith('❌ Failed to lazy load sound bad:', expect.anything());
      expect(mgr.sounds.get('bad')._isLoaded).toBe(false);
    });

    it('errors if a music track has no audio element', async () => {
      mgr.sounds.set('m', { audio: null, type: 'music', baseVolume: 1, loop: true, src: '', _isLoaded: false });
      await mgr.playSound('m');
      expect(console.error).toHaveBeenCalledWith('❌ Audio element not available for m');
    });

    it('pauses instead of playing when the category is disabled', async () => {
      await mgr.loadSound('bgm', '/m.mp3', { type: 'music' });
      await mgr.loadSound('fx', '/f.mp3');
      await mgr.playSound('fx'); // load it
      mgr.musicEnabled = false;
      mgr.soundEnabled = false;
      const [music, fx] = FakeAudio.instances;
      fx.play.mockClear();
      await mgr.playSound('bgm');
      await mgr.playSound('fx');
      expect(music.play).not.toHaveBeenCalled();
      expect(fx.play).not.toHaveBeenCalled();
      expect(music.pause).toHaveBeenCalled();
      expect(fx.pause).toHaveBeenCalled();
    });

    it('does not restart music that is already playing', async () => {
      const music = await mgr.loadSound('bgm', '/m.mp3', { type: 'music', loop: true });
      await mgr.playSound('bgm');
      expect(music.play).toHaveBeenCalledTimes(1);
      music.currentTime = 12;
      await mgr.playSound('bgm');
      expect(music.play).toHaveBeenCalledTimes(1);
      expect(music.currentTime).toBe(12);
    });

    it('does not rewind looping audio', async () => {
      const music = await mgr.loadSound('bgm', '/m.mp3', { type: 'music', loop: true });
      music.currentTime = 7;
      await mgr.playSound('bgm');
      expect(music.currentTime).toBe(7);
    });

    it('resumes a suspended context before playing', async () => {
      await mgr.initialize();
      mgr.audioContext.state = 'suspended';
      await mgr.loadSound('fx', '/f.mp3');
      await mgr.playSound('fx');
      expect(mgr.audioContext.resume).toHaveBeenCalled();
    });

    it('logs when play() rejects (e.g. autoplay policy)', async () => {
      FakeAudio.playRejects = true;
      await mgr.loadSound('fx', '/f.mp3');
      await mgr.playSound('fx');
      expect(console.error).toHaveBeenCalledWith('❌ Failed to play fx:', expect.any(Error));
    });
  });

  describe('transport and state', () => {
    let music;
    beforeEach(async () => {
      music = await mgr.loadSound('bgm', '/m.mp3', { type: 'music', volume: 0.5 });
      await mgr.loadSound('fx', '/f.mp3');
    });

    it('pause/stop affect loaded sounds and ignore unloaded or unknown ones', async () => {
      await mgr.playSound('bgm');
      music.currentTime = 5;
      mgr.pauseSound('bgm');
      expect(music.paused).toBe(true);
      expect(music.currentTime).toBe(5);
      mgr.stopSound('bgm');
      expect(music.currentTime).toBe(0);
      expect(() => {
        mgr.pauseSound('fx');
        mgr.stopSound('fx');
        mgr.pauseSound('missing');
        mgr.stopSound('missing');
      }).not.toThrow();
    });

    it('isPlaying and getCurrentTime reflect the element', async () => {
      expect(mgr.isPlaying('bgm')).toBe(false);
      await mgr.playSound('bgm');
      expect(mgr.isPlaying('bgm')).toBe(true);
      music.currentTime = 3;
      expect(mgr.getCurrentTime('bgm')).toBe(3);
      expect(mgr.isPlaying('fx')).toBe(false);
      expect(mgr.getCurrentTime('missing')).toBe(0);
    });

    it('setSoundVolume clamps and applies category and master multipliers', () => {
      mgr.musicVolume = 0.5;
      mgr.masterVolume = 0.5;
      mgr.setSoundVolume('bgm', 2);
      expect(music.volume).toBeCloseTo(0.25);
      mgr.setSoundVolume('bgm', -1);
      expect(music.volume).toBe(0);
      expect(() => mgr.setSoundVolume('fx', 1)).not.toThrow();
    });

    it('setSoundVolume uses the sound-effects multiplier for effects', async () => {
      await mgr.playSound('fx');
      const fx = FakeAudio.instances[1];
      mgr.soundVolume = 0.25;
      mgr.setSoundVolume('fx', 1);
      expect(fx.volume).toBeCloseTo(0.25);
    });

    it('master/sfx/music volume setters clamp and update loaded sounds', async () => {
      await mgr.playSound('fx');
      const fx = FakeAudio.instances[1];
      mgr.setMasterVolume(1.5);
      expect(mgr.masterVolume).toBe(1);
      mgr.setMusicVolume(0.5);
      expect(music.volume).toBeCloseTo(0.25); // base 0.5 * 0.5
      mgr.setSoundEffectsVolume(-2);
      expect(mgr.soundVolume).toBe(0);
      expect(fx.volume).toBe(0);
    });

    it('disabling a category pauses only that category', async () => {
      await mgr.playSound('bgm');
      await mgr.playSound('fx');
      const fx = FakeAudio.instances[1];
      mgr.setSoundEnabled(false);
      expect(fx.paused).toBe(true);
      expect(music.paused).toBe(false);
      mgr.setMusicEnabled(false);
      expect(music.paused).toBe(true);
      mgr.setSoundEnabled(true);
      mgr.setMusicEnabled(true);
      expect(mgr.soundEnabled && mgr.musicEnabled).toBe(true);
    });

    it('cleanup releases elements and the context', async () => {
      await mgr.initialize();
      const ctx = mgr.audioContext;
      mgr.cleanup();
      expect(music.src).toBe('');
      expect(ctx.close).toHaveBeenCalled();
      expect(mgr.sounds.size).toBe(0);
      expect(mgr.audioContext).toBeNull();
      expect(mgr.isInitialized).toBe(false);
      expect(() => mgr.cleanup()).not.toThrow();
    });
  });
});

import { renderHook, act, waitFor } from '@testing-library/react';
import { installFakeAudioContext, installFakeAudioElement, FakeAudio } from '../../helpers/fakeAudio';

const mockAudioState = { soundEnabled: true, musicEnabled: true, registerSounds: jest.fn() };
jest.mock('@/contexts/AudioContext', () => ({
  useAudio: () => mockAudioState,
}));

import { useSound } from '@/utils/audio/useSound';

const byName = (name) => FakeAudio.instances.find((a) => a.src === `/sounds/${name}.mp3`);

async function renderReady() {
  const hook = renderHook(() => useSound());
  await waitFor(() => expect(hook.result.current.isReady).toBe(true));
  return hook;
}

describe('useSound', () => {
  let audio;

  beforeEach(() => {
    audio = installFakeAudioContext();
    installFakeAudioElement();
    mockAudioState.soundEnabled = true;
    mockAudioState.musicEnabled = true;
    mockAudioState.registerSounds = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it('loads all six sounds, registers them and configures bgm/thruster', async () => {
    const { result } = await renderReady();
    expect(FakeAudio.instances).toHaveLength(6);
    expect(mockAudioState.registerSounds).toHaveBeenCalledWith(
      expect.objectContaining({ shoot: byName('shoot'), bgm: byName('bgm'), empty: byName('empty') })
    );
    expect(result.current.sounds.current.thruster).toBeUndefined();
    expect(byName('bgm')).toMatchObject({ loop: true, volume: 1 });
    expect(byName('thruster')).toMatchObject({ loop: true, volume: 0.01 });
  });

  it('stays not-ready and logs if any sound fails to load', async () => {
    FakeAudio.failing.add('/sounds/hit.mp3');
    const { result } = renderHook(() => useSound());
    await waitFor(() => expect(console.error).toHaveBeenCalledWith('❌ Failed to load sounds:', expect.anything()));
    expect(result.current.isReady).toBe(false);
  });

  it('logs if the audio context cannot be created but still loads sounds', async () => {
    window.AudioContext = jest.fn(() => {
      throw new Error('no ctx');
    });
    await renderReady();
    expect(console.error).toHaveBeenCalledWith('❌ Failed to initialize audio context:', expect.any(Error));
  });

  describe('playSound', () => {
    it('is a no-op (with a dev warning) before sounds load', async () => {
      const env = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      jest.spyOn(console, 'log').mockImplementation(() => {});
      const { result } = renderHook(() => useSound());
      await act(() => result.current.playSound('shoot'));
      expect(warn).toHaveBeenCalledWith('Sound not ready yet: shoot');
      await waitFor(() => expect(result.current.isReady).toBe(true));
      process.env.NODE_ENV = env;
    });

    it('rewinds and plays effects', async () => {
      const { result } = await renderReady();
      const shoot = byName('shoot');
      shoot.currentTime = 4;
      await act(() => result.current.playSound('shoot'));
      expect(shoot.currentTime).toBe(0);
      expect(shoot.play).toHaveBeenCalled();
    });

    it('plays bgm only when paused', async () => {
      const { result } = await renderReady();
      const bgm = byName('bgm');
      await act(() => result.current.playSound('bgm'));
      await act(() => result.current.playSound('bgm'));
      expect(bgm.play).toHaveBeenCalledTimes(1);
    });

    it('respects the sound and music toggles independently', async () => {
      mockAudioState.soundEnabled = false;
      mockAudioState.musicEnabled = false;
      const { result } = await renderReady();
      await act(() => result.current.playSound('shoot'));
      await act(() => result.current.playSound('bgm'));
      expect(byName('shoot').play).not.toHaveBeenCalled();
      expect(byName('bgm').play).not.toHaveBeenCalled();
    });

    it('resumes a suspended context first', async () => {
      const { result } = await renderReady();
      const ctx = audio.contexts[0];
      ctx.state = 'suspended';
      await act(() => result.current.playSound('hit'));
      expect(ctx.resume).toHaveBeenCalled();
    });

    it('logs when play() rejects', async () => {
      const { result } = await renderReady();
      FakeAudio.playRejects = true;
      await act(() => result.current.playSound('miss'));
      expect(console.error).toHaveBeenCalledWith('❌ Failed to play miss:', expect.any(Error));
    });
  });

  it('pauseSound stops and rewinds a sound, ignoring unknown names', async () => {
    const { result } = await renderReady();
    const bgm = byName('bgm');
    bgm.currentTime = 9;
    act(() => result.current.pauseSound('bgm'));
    expect(bgm.pause).toHaveBeenCalled();
    expect(bgm.currentTime).toBe(0);
    expect(() => result.current.pauseSound('nope')).not.toThrow();
  });

  describe('setThrusterVolume', () => {
    it('starts the loop once when volume rises above zero', async () => {
      const { result } = await renderReady();
      const thruster = byName('thruster');
      act(() => result.current.setThrusterVolume(0.5));
      expect(thruster.volume).toBe(0.5);
      expect(thruster.play).toHaveBeenCalledTimes(1);
      thruster.currentTime = 1; // now playing
      act(() => result.current.setThrusterVolume(0.7));
      expect(thruster.play).toHaveBeenCalledTimes(1);
    });

    it('pauses and rewinds at zero volume, but only if it was playing', async () => {
      const { result } = await renderReady();
      const thruster = byName('thruster');
      act(() => result.current.setThrusterVolume(0));
      expect(thruster.pause).not.toHaveBeenCalled();
      act(() => result.current.setThrusterVolume(0.5));
      thruster.currentTime = 2;
      act(() => result.current.setThrusterVolume(0));
      expect(thruster.pause).toHaveBeenCalled();
      expect(thruster.currentTime).toBe(0);
    });

    it('logs transitions in development and swallows play() rejections', async () => {
      const env = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const log = jest.spyOn(console, 'log').mockImplementation(() => {});
      const { result } = await renderReady();
      FakeAudio.playRejects = true;
      act(() => result.current.setThrusterVolume(0.5));
      byName('thruster').paused = false;
      act(() => result.current.setThrusterVolume(0));
      act(() => result.current.setThrusterVolume(0));
      expect(log).toHaveBeenCalledWith('✅ Thruster sound started');
      expect(log).toHaveBeenCalledWith('⏸️ Thruster sound paused');
      expect(log).toHaveBeenCalledWith('✅ Set thruster volume to: 0.5');
      process.env.NODE_ENV = env;
    });

    it('is a no-op before the thruster loads', () => {
      const { result } = renderHook(() => useSound());
      expect(() => result.current.setThrusterVolume(1)).not.toThrow();
    });
  });

  it('cleans up elements, listeners and the context on unmount', async () => {
    const removeSpy = jest.spyOn(document, 'removeEventListener');
    const { unmount } = await renderReady();
    const ctx = audio.contexts[0];
    unmount();
    FakeAudio.instances.forEach((a) => {
      expect(a.pause).toHaveBeenCalled();
      expect(a.src).toBe('');
    });
    expect(ctx.close).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function));
  });

  it('resumes a suspended context on first user interaction', async () => {
    await renderReady();
    const ctx = audio.contexts[0];
    ctx.state = 'suspended';
    await act(async () => {
      document.dispatchEvent(new Event('keydown'));
    });
    expect(ctx.resume).toHaveBeenCalled();
  });

  it('does not register sounds if unmounted mid-load', async () => {
    const { unmount } = renderHook(() => useSound());
    unmount();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(mockAudioState.registerSounds).not.toHaveBeenCalled();
  });
});

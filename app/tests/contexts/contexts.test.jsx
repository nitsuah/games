import { renderHook, act } from '@testing-library/react';
import { AudioProvider, useAudio } from '@/contexts/AudioContext';
import { SettingsProvider, useSettings, DEFAULT_SETTINGS } from '@/contexts/SettingsContext';

describe('AudioContext', () => {
  const wrapper = ({ children }) => <AudioProvider>{children}</AudioProvider>;

  it('throws when used outside the provider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAudio())).toThrow('useAudio must be used within AudioProvider');
    console.error.mockRestore();
  });

  it('starts with sound and music enabled and toggles sound', () => {
    const { result } = renderHook(() => useAudio(), { wrapper });
    expect(result.current.soundEnabled).toBe(true);
    expect(result.current.musicEnabled).toBe(true);
    act(() => result.current.toggleSound());
    expect(result.current.soundEnabled).toBe(false);
  });

  it('toggling music pauses and resumes registered bgm', async () => {
    const bgm = { play: jest.fn(() => Promise.resolve()), pause: jest.fn() };
    const { result } = renderHook(() => useAudio(), { wrapper });
    act(() => result.current.registerSounds({ bgm }));
    act(() => result.current.toggleMusic());
    expect(result.current.musicEnabled).toBe(false);
    expect(bgm.pause).toHaveBeenCalled();
    act(() => result.current.toggleMusic());
    expect(result.current.musicEnabled).toBe(true);
    expect(bgm.play).toHaveBeenCalled();
  });

  it('toggles music safely with no sounds registered', () => {
    const { result } = renderHook(() => useAudio(), { wrapper });
    act(() => result.current.toggleMusic());
    expect(result.current.musicEnabled).toBe(false);
  });

  it('warns in development if resuming bgm is blocked', async () => {
    const env = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const bgm = { play: jest.fn(() => Promise.reject(new Error('autoplay'))), pause: jest.fn() };
    const { result } = renderHook(() => useAudio(), { wrapper });
    act(() => result.current.registerSounds({ bgm }));
    act(() => result.current.toggleMusic()); // off
    await act(async () => {
      result.current.toggleMusic(); // on -> play rejects
    });
    expect(warn).toHaveBeenCalledWith('Failed to play BGM:', expect.any(Error));
    process.env.NODE_ENV = env;
    warn.mockRestore();
  });
});

describe('SettingsContext', () => {
  const wrapper = ({ children }) => <SettingsProvider>{children}</SettingsProvider>;

  beforeEach(() => localStorage.clear());
  afterEach(() => jest.restoreAllMocks());

  it('throws when used outside the provider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useSettings())).toThrow('useSettings must be used within a SettingsProvider');
  });

  it('starts from defaults and persists them once loaded', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
    expect(JSON.parse(localStorage.getItem('gameSettings'))).toEqual(DEFAULT_SETTINGS);
  });

  it('merges saved settings over defaults', () => {
    localStorage.setItem('gameSettings', JSON.stringify({ invertY: true }));
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.settings).toEqual({ ...DEFAULT_SETTINGS, invertY: true });
  });

  it('updates, persists and resets', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => result.current.updateSettings({ masterVolume: 0.1 }));
    expect(result.current.settings.masterVolume).toBe(0.1);
    expect(JSON.parse(localStorage.getItem('gameSettings')).masterVolume).toBe(0.1);
    act(() => result.current.resetSettings());
    expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
  });

  it('falls back to defaults on corrupt storage and survives save failures', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem('gameSettings', '{bad');
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
    expect(warn).toHaveBeenCalledWith('Failed to load settings:', expect.any(Error));
    expect(warn).toHaveBeenCalledWith('Failed to save settings:', expect.any(Error));
  });
});

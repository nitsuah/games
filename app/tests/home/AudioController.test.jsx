import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AudioController } from '@/_components/home/AudioController';

describe('AudioController lazy audio loading', () => {
  const OriginalAudio = global.Audio;

  const createAudioMock = () => {
    const mockAudio = {
      loop: false,
      volume: 1,
      preload: 'auto',
      addEventListener: jest.fn(),
      play: jest.fn(() => Promise.resolve()),
      pause: jest.fn(),
    };

    global.Audio = jest.fn(() => mockAudio);
    return mockAudio;
  };

  afterEach(() => {
    jest.clearAllMocks();
    global.Audio = OriginalAudio;
  });

  it('does not create audio on initial render and creates it only after unmute click', async () => {
    const user = userEvent.setup();
    const mockAudio = createAudioMock();

    render(<AudioController />);

    expect(global.Audio).not.toHaveBeenCalled();

    await user.click(screen.getByTitle('Unmute Music'));

    expect(global.Audio).toHaveBeenCalledTimes(1);
    expect(mockAudio.preload).toBe('none');
    expect(mockAudio.play).toHaveBeenCalledTimes(1);

    await user.click(screen.getByTitle('Mute Music'));

    expect(global.Audio).toHaveBeenCalledTimes(1);
    expect(mockAudio.pause).toHaveBeenCalledTimes(1);
  });

  it('pauses and releases audio on unmount', async () => {
    const user = userEvent.setup();
    const mockAudio = createAudioMock();
    const { unmount } = render(<AudioController />);
    await user.click(screen.getByTitle('Unmute Music'));
    unmount();
    expect(mockAudio.pause).toHaveBeenCalled();
  });

  it('logs load errors from the audio element', async () => {
    const user = userEvent.setup();
    const err = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockAudio = createAudioMock();
    render(<AudioController />);
    await user.click(screen.getByTitle('Unmute Music'));
    const [event, handler] = mockAudio.addEventListener.mock.calls[0];
    expect(event).toBe('error');
    handler({ type: 'error' });
    expect(err).toHaveBeenCalledWith('Failed to load audio file:', { type: 'error' });
    err.mockRestore();
  });

  it('stays muted and logs if Audio cannot be constructed', async () => {
    const user = userEvent.setup();
    const err = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.Audio = jest.fn(() => {
      throw new Error('unsupported');
    });
    render(<AudioController />);
    await user.click(screen.getByTitle('Unmute Music'));
    expect(err).toHaveBeenCalledWith('Failed to create Audio element:', expect.any(Error));
    expect(screen.getByTitle('Unmute Music')).toBeInTheDocument();
    err.mockRestore();
  });

  it.each([
    [Object.assign(new Error('blocked'), { name: 'NotAllowedError' }), 'Audio playback failed: NotAllowedError: blocked.'],
    ['plain string', 'Audio playback failed: plain string.'],
  ])('explains rejected playback (%p)', async (reason, message) => {
    const user = userEvent.setup();
    const err = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockAudio = createAudioMock();
    mockAudio.play = jest.fn(() => Promise.reject(reason));
    render(<AudioController />);
    await user.click(screen.getByTitle('Unmute Music'));
    expect(err).toHaveBeenCalledWith(expect.stringContaining(message));
    err.mockRestore();
  });
});

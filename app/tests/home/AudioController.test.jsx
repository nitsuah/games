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
});

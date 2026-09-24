import { render, screen, fireEvent, within } from '@testing-library/react';

const mockPush = jest.fn();
jest.mock('next/router', () => ({ useRouter: () => ({ push: mockPush }) }));

const mockAudio = { soundEnabled: true, musicEnabled: true, toggleSound: jest.fn(), toggleMusic: jest.fn() };
jest.mock('@/contexts/AudioContext', () => ({ useAudio: () => mockAudio }));

import GameOverOverlay from '@/lib/asteroid/_comp/UI/GameOverOverlay';
import PauseMenu from '@/lib/asteroid/_comp/UI/PauseMenu';
import SettingsMenu from '@/lib/asteroid/_comp/UI/SettingsMenu';
import { DEFAULT_SETTINGS } from '@/contexts/SettingsContext';

beforeEach(() => {
  jest.clearAllMocks();
  mockAudio.soundEnabled = true;
  mockAudio.musicEnabled = true;
  localStorage.clear();
});

describe('GameOverOverlay', () => {
  it('shows final stats and accuracy', () => {
    render(<GameOverOverlay score={12345} hits={3} misses={1} highScore={20000} bestAccuracy={80} wave={4} />);
    expect(screen.getByText('GAME OVER')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText((12345).toLocaleString())).toBeInTheDocument();
    expect(screen.getByText('3 / 1')).toBeInTheDocument();
    expect(screen.getByText('75.0%')).toBeInTheDocument();
    expect(screen.getByText('80.0%')).toBeInTheDocument();
    expect(screen.queryByText('🏆 NEW RECORD!')).not.toBeInTheDocument();
    expect(screen.queryByText('🎯 NEW BEST!')).not.toBeInTheDocument();
  });

  it('celebrates new records', () => {
    render(<GameOverOverlay score={10} isNewHighScore hits={1} misses={0} bestAccuracy={50} />);
    expect(screen.getByText('🏆 NEW RECORD!')).toBeInTheDocument();
    expect(screen.getByText('🎯 NEW BEST!')).toBeInTheDocument();
  });

  it('reports 0.0% with no shots and tolerates a null best accuracy', () => {
    render(<GameOverOverlay bestAccuracy={null} />);
    expect(screen.getAllByText('0.0%')).toHaveLength(2);
    expect(screen.queryByText('🎯 NEW BEST!')).not.toBeInTheDocument();
  });

  it('restarts or returns to the main menu', () => {
    const restartGame = jest.fn();
    render(<GameOverOverlay restartGame={restartGame} />);
    fireEvent.click(screen.getByText('PLAY AGAIN'));
    expect(restartGame).toHaveBeenCalled();
    fireEvent.click(screen.getByText('MAIN MENU'));
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('logs render props in development', () => {
    const env = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    render(<GameOverOverlay />);
    expect(log).toHaveBeenCalledWith('GameOverOverlay rendered with:', expect.any(Object));
    process.env.NODE_ENV = env;
    log.mockRestore();
  });
});

describe('PauseMenu', () => {
  const setup = (props = {}) => {
    const handlers = { onResume: jest.fn(), onQuit: jest.fn(), onRestart: jest.fn() };
    render(<PauseMenu score={4200} {...handlers} {...props} />);
    return handlers;
  };

  it('shows the score and resumes', () => {
    const { onResume } = setup();
    expect(screen.getByText((4200).toLocaleString())).toBeInTheDocument();
    fireEvent.click(screen.getByText('RESUME'));
    expect(onResume).toHaveBeenCalled();
  });

  it('reflects and toggles audio state', () => {
    mockAudio.musicEnabled = false;
    setup();
    const sound = screen.getByText('SOUND').closest('button');
    const music = screen.getByText('MUSIC').closest('button');
    expect(within(sound).getByText('ON')).toBeInTheDocument();
    expect(within(music).getByText('OFF')).toBeInTheDocument();
    expect(sound).toHaveClass('active');
    expect(music).not.toHaveClass('active');
    fireEvent.click(sound);
    fireEvent.click(music);
    expect(mockAudio.toggleSound).toHaveBeenCalled();
    expect(mockAudio.toggleMusic).toHaveBeenCalled();
  });

  it('requires confirmation to quit and can cancel', () => {
    const { onQuit } = setup();
    fireEvent.click(screen.getByText('QUIT'));
    expect(onQuit).not.toHaveBeenCalled();
    expect(screen.getByText('⚠️ CONFIRM QUIT?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('CANCEL'));
    expect(screen.queryByText('⚠️ CONFIRM QUIT?')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('QUIT'));
    fireEvent.click(screen.getByText('YES'));
    expect(onQuit).toHaveBeenCalled();
  });

  it('requires confirmation to restart and can cancel', () => {
    const { onRestart } = setup();
    fireEvent.click(screen.getByText('RESTART'));
    expect(onRestart).not.toHaveBeenCalled();
    expect(screen.queryByText('RESTART')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('CANCEL'));
    fireEvent.click(screen.getByText('RESTART'));
    fireEvent.click(screen.getByText('YES'));
    expect(onRestart).toHaveBeenCalled();
  });

  it('confirm boxes stop click propagation', () => {
    const outer = jest.fn();
    const handlers = { onResume: jest.fn(), onQuit: jest.fn(), onRestart: jest.fn() };
    render(
      <div onClick={outer} onMouseDown={outer}>
        <PauseMenu score={0} {...handlers} />
      </div>
    );
    fireEvent.click(screen.getByText('QUIT'));
    outer.mockClear();
    const box = screen.getByText('⚠️ CONFIRM QUIT?').parentElement;
    fireEvent.mouseDown(box);
    fireEvent.click(box);
    expect(outer).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('RESTART'));
    outer.mockClear();
    const restartBox = screen.getByText('⚠️ CONFIRM RESTART?').parentElement;
    fireEvent.mouseDown(restartBox);
    fireEvent.click(restartBox);
    expect(outer).not.toHaveBeenCalled();
  });

  it('hides restart when no handler is provided', () => {
    setup({ onRestart: undefined });
    expect(screen.queryByText('RESTART')).not.toBeInTheDocument();
  });
});

describe('SettingsMenu', () => {
  const open = (props = {}) => {
    const handlers = { onClose: jest.fn(), onSave: jest.fn() };
    const utils = render(<SettingsMenu isOpen {...handlers} {...props} />);
    return { ...handlers, ...utils };
  };
  const sliders = () => screen.getAllByRole('slider');
  const checkbox = (label) => screen.getByLabelText(label, { exact: false });

  it('renders nothing when closed', () => {
    expect(render(<SettingsMenu isOpen={false} onClose={jest.fn()} />).container).toBeEmptyDOMElement();
  });

  it('shows defaults when nothing is saved', () => {
    open();
    expect(screen.getAllByText('2.0')).toHaveLength(2);
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('none');
  });

  it('loads saved settings', () => {
    localStorage.setItem('gameSettings', JSON.stringify({ ...DEFAULT_SETTINGS, masterVolume: 0.25, invertY: true }));
    open();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(checkbox('Invert Y-Axis')).toBeChecked();
  });

  it('fills in defaults for partially saved settings instead of showing NaN', () => {
    localStorage.setItem('gameSettings', JSON.stringify({ masterVolume: 0.3 }));
    open();
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });

  it('survives a stored "null" or corrupt JSON', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem('gameSettings', 'null');
    const first = open();
    expect(screen.getByText('70%')).toBeInTheDocument();
    first.unmount();
    localStorage.setItem('gameSettings', '{broken');
    open();
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(warn).toHaveBeenCalledWith('Failed to load settings:', expect.any(Error));
    warn.mockRestore();
  });

  it('edits every control and saves the result', () => {
    const { onSave, onClose } = open();
    const [sensX, sensY, master, music, sfx] = sliders();
    fireEvent.change(sensX, { target: { value: '3.5' } });
    fireEvent.change(sensY, { target: { value: '1' } });
    fireEvent.change(master, { target: { value: '0.4' } });
    fireEvent.change(music, { target: { value: '0.1' } });
    fireEvent.change(sfx, { target: { value: '1' } });
    fireEvent.click(checkbox('Invert Y-Axis'));
    fireEvent.click(checkbox('Mouse Smoothing'));
    fireEvent.click(checkbox('Reduce Motion'));
    fireEvent.click(checkbox('High Contrast Mode'));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'tritanopia' } });
    fireEvent.click(screen.getByText('Save Settings'));

    const expected = {
      mouseSensitivityX: 0.0035,
      mouseSensitivityY: 0.001,
      invertY: true,
      mouseSmoothing: false,
      colorblindMode: 'tritanopia',
      reduceMotion: true,
      highContrast: true,
      masterVolume: 0.4,
      musicVolume: 0.1,
      sfxVolume: 1,
    };
    expect(onSave).toHaveBeenCalledWith(expected);
    expect(JSON.parse(localStorage.getItem('gameSettings'))).toEqual(expected);
    expect(onClose).toHaveBeenCalled();
  });

  it('saves and closes even without onSave or storage', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    const { onClose } = open({ onSave: undefined });
    fireEvent.click(screen.getByText('Save Settings'));
    expect(onClose).toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith('Failed to save settings:', expect.any(Error));
    jest.restoreAllMocks();
  });

  it('reset restores defaults without saving', () => {
    const { onSave } = open();
    fireEvent.change(sliders()[2], { target: { value: '0.1' } });
    expect(screen.getByText('10%')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Reset to Defaults'));
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('closes via the X, Cancel, or backdrop but not clicks inside the modal', () => {
    const { onClose, container } = open();
    fireEvent.click(screen.getByText('SETTINGS'));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('✕'));
    fireEvent.click(screen.getByText('Cancel'));
    fireEvent.click(container.querySelector('.overlay'));
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});

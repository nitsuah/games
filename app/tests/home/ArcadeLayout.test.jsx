import { render, screen, fireEvent } from '@testing-library/react';
import { installFakeAudioElement, FakeAudio } from '../helpers/fakeAudio';
import { ArcadeLayout } from '@/_components/home/ArcadeLayout';

describe('ArcadeLayout', () => {
  beforeEach(() => installFakeAudioElement());

  it('renders the cabinet with the default home header', () => {
    render(
      <ArcadeLayout>
        <p>game list</p>
      </ArcadeLayout>
    );
    expect(screen.getByTestId('arcade-cabinet')).toBeInTheDocument();
    expect(screen.getByText('game list')).toBeInTheDocument();
    expect(screen.getByText('PLAY')).toBeInTheDocument();
    expect(screen.getByText('Select Your Game')).toBeInTheDocument();
    expect(screen.getByText('INSERT COIN TO PLAY')).toBeInTheDocument();
  });

  it('shows a custom title and header content instead of the home header', () => {
    render(
      <ArcadeLayout title="SNAKE" headerContent={<nav>header</nav>}>
        <p>board</p>
      </ArcadeLayout>
    );
    expect(screen.getByText('SNAKE')).toBeInTheDocument();
    expect(screen.getByText('header')).toBeInTheDocument();
    expect(screen.queryByText('Select Your Game')).not.toBeInTheDocument();
    expect(screen.queryByText('INSERT COIN TO PLAY')).not.toBeInTheDocument();
  });

  it('renders only the game inside <main> in fullscreen mode', () => {
    render(
      <ArcadeLayout fullscreenGame>
        <canvas data-testid="game" />
      </ArcadeLayout>
    );
    expect(screen.queryByTestId('arcade-cabinet')).not.toBeInTheDocument();
    expect(screen.getByRole('main')).toContainElement(screen.getByTestId('game'));
  });

  it('decorative controls play a quiet click, reusing one audio element', () => {
    render(<ArcadeLayout>{null}</ArcadeLayout>);
    fireEvent.click(screen.getByLabelText('Joystick'));
    fireEvent.click(screen.getByLabelText('Arcade button 1'));
    fireEvent.click(screen.getByLabelText('Arcade button 4'));
    expect(FakeAudio.instances).toHaveLength(1);
    const [click] = FakeAudio.instances;
    expect(click.volume).toBe(0.25);
    expect(click.play).toHaveBeenCalledTimes(3);
    expect(click.currentTime).toBe(0);
  });

  it('ignores blocked playback and missing Audio support', () => {
    FakeAudio.playRejects = true;
    render(<ArcadeLayout>{null}</ArcadeLayout>);
    expect(() => fireEvent.click(screen.getByLabelText('Arcade button 2'))).not.toThrow();

    window.Audio = jest.fn(() => {
      throw new Error('unsupported');
    });
    render(<ArcadeLayout>{null}</ArcadeLayout>);
    expect(() => fireEvent.click(screen.getAllByLabelText('Arcade button 3')[1])).not.toThrow();
  });
});

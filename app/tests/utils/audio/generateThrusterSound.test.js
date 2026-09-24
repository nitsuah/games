import { installFakeAudioContext } from '../../helpers/fakeAudio';
import { generateThrusterSound } from '@/utils/audio/generateThrusterSound';

describe('generateThrusterSound', () => {
  it('wires oscillator -> filter -> gain -> destination and starts silent', () => {
    const audio = installFakeAudioContext();
    generateThrusterSound();
    const ctx = audio.contexts[0];
    const [osc] = ctx.nodesOf('oscillator');
    const [filter] = ctx.nodesOf('filter');
    const [gain] = ctx.nodesOf('gain');
    expect(osc.type).toBe('sawtooth');
    expect(osc.connect).toHaveBeenCalledWith(filter);
    expect(filter.connect).toHaveBeenCalledWith(gain);
    expect(gain.connect).toHaveBeenCalledWith(ctx.destination);
    expect(gain.gain.setValueAtTime).toHaveBeenCalledWith(0, 0);
    expect(osc.start).toHaveBeenCalled();
  });

  it('start/stop ramp gain and filter; cleanup tears down the graph', () => {
    const audio = installFakeAudioContext();
    const t = generateThrusterSound();
    const ctx = audio.contexts[0];
    const [osc] = ctx.nodesOf('oscillator');
    const [filter] = ctx.nodesOf('filter');
    const [gain] = ctx.nodesOf('gain');

    t.start();
    expect(gain.gain.setTargetAtTime).toHaveBeenLastCalledWith(0.3, 0, 0.1);
    expect(filter.frequency.setTargetAtTime).toHaveBeenLastCalledWith(2000, 0, 0.1);
    t.stop();
    expect(gain.gain.setTargetAtTime).toHaveBeenLastCalledWith(0, 0, 0.1);
    expect(filter.frequency.setTargetAtTime).toHaveBeenLastCalledWith(1000, 0, 0.1);
    t.cleanup();
    expect(osc.stop).toHaveBeenCalled();
    [osc, filter, gain].forEach((n) => expect(n.disconnect).toHaveBeenCalled());
  });
});

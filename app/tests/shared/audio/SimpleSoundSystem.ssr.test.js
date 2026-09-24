/**
 * @jest-environment node
 */
import { SimpleSoundSystem } from '@/lib/shared/audio/SimpleSoundSystem';

describe('SimpleSoundSystem during server-side rendering', () => {
  it('constructs without a context and every sound is a safe no-op', () => {
    const s = new SimpleSoundSystem();
    expect(() => ['hit', 'destroy', 'powerUp', 'shoot', 'flap', 'gameOver'].forEach((m) => s[m]())).not.toThrow();
  });
});

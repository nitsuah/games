import { PowerUpSystem } from '@/lib/breakout/components/PowerUpSystem';
import { Paddle } from '@/lib/breakout/components/Paddle';
import { createMockCtx } from '../helpers/mockCtx';

const paddle = () =>
  new Paddle({ x: 100, y: 500, width: 100, height: 10, color: '#0ff', speed: 0, canvasWidth: 800 });

describe('PowerUpSystem', () => {
  afterEach(() => jest.restoreAllMocks());

  describe('spawn', () => {
    it('drops nothing 90% of the time', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.5);
      const s = new PowerUpSystem();
      s.spawn(10, 10);
      expect(s.drops).toHaveLength(0);
    });

    it.each([
      [0.0, 'multiBall'],
      [0.3, 'expandPaddle'],
      [0.6, 'slowBall'],
      [0.9, 'laserPaddle'],
    ])('type roll %p yields %s', (roll, type) => {
      jest.spyOn(Math, 'random').mockReturnValueOnce(0.05).mockReturnValueOnce(roll);
      const s = new PowerUpSystem();
      s.spawn(10, 20);
      expect(s.drops[0]).toEqual({ x: 10, y: 20, width: 20, height: 20, type, active: true, velocity: 2 });
    });

    it('drops exactly at the 10% boundary', () => {
      jest.spyOn(Math, 'random').mockReturnValueOnce(0.1).mockReturnValueOnce(0);
      const s = new PowerUpSystem();
      s.spawn(0, 0);
      expect(s.drops).toHaveLength(1);
    });
  });

  describe('update', () => {
    const drop = (overrides) => ({ x: 120, y: 0, width: 20, height: 20, type: 'slowBall', active: true, velocity: 2, ...overrides });

    it('falls and is collected on paddle contact', () => {
      const s = new PowerUpSystem();
      s.drops = [drop({ y: 479 })]; // -> 481, 481+20 > 500
      const onCollect = jest.fn();
      s.update(0.016, paddle(), onCollect);
      expect(onCollect).toHaveBeenCalledWith('slowBall');
      expect(s.drops).toHaveLength(0);
    });

    it('keeps falling when not touching the paddle', () => {
      const s = new PowerUpSystem();
      s.drops = [drop({ y: 100 }), drop({ x: 500, y: 490 })];
      const onCollect = jest.fn();
      s.update(0.016, paddle(), onCollect);
      expect(onCollect).not.toHaveBeenCalled();
      expect(s.drops.map((d) => d.y)).toEqual([102, 492]);
    });

    it('uses the expanded paddle width for collection', () => {
      const s = new PowerUpSystem();
      s.drops = [drop({ x: 230, y: 490 })];
      const p = paddle();
      const onCollect = jest.fn();
      s.update(0, p, onCollect);
      expect(onCollect).not.toHaveBeenCalled();
      p.widthMultiplier = 1.5;
      s.update(0, p, onCollect);
      expect(onCollect).toHaveBeenCalled();
    });

    it('removes drops that fall off-screen or are already inactive', () => {
      const s = new PowerUpSystem();
      s.drops = [drop({ y: 799 }), drop({ active: false })];
      s.update(0, paddle(), jest.fn());
      expect(s.drops).toHaveLength(0);
    });
  });

  it('getColorForType maps each type and falls back to white', () => {
    const s = new PowerUpSystem();
    expect(s.getColorForType('multiBall')).toBe('#3498db');
    expect(s.getColorForType('expandPaddle')).toBe('#2ecc71');
    expect(s.getColorForType('slowBall')).toBe('#f1c40f');
    expect(s.getColorForType('laserPaddle')).toBe('#e74c3c');
    expect(s.getColorForType('bogus')).toBe('#ffffff');
  });

  it('draws active drops with their initial letter', () => {
    const s = new PowerUpSystem();
    s.drops = [
      { x: 0, y: 0, width: 20, height: 20, type: 'laserPaddle', active: true, velocity: 2 },
      { x: 0, y: 0, width: 20, height: 20, type: 'multiBall', active: false, velocity: 2 },
    ];
    const ctx = createMockCtx();
    s.draw(ctx);
    expect(ctx.fillRect).toHaveBeenCalledTimes(1);
    expect(ctx.fillText).toHaveBeenCalledWith('L', 10, 15);
  });
});

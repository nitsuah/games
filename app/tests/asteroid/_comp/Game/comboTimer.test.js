import { pauseComboTimer, resumeComboTimer } from '@/lib/asteroid/_comp/Game/comboTimer';

describe('combo timer pause and resume', () => {
  let timerRef;
  let deadlineRef;
  let remainingRef;
  let onExpire;

  beforeEach(() => {
    jest.useFakeTimers();
    timerRef = { current: null };
    deadlineRef = { current: null };
    remainingRef = { current: null };
    onExpire = jest.fn();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('preserves only the remaining time while settings are open', () => {
    deadlineRef.current = Date.now() + 3000;
    timerRef.current = setTimeout(onExpire, 3000);

    jest.advanceTimersByTime(1000);
    expect(pauseComboTimer(timerRef, deadlineRef, remainingRef)).toBe(true);
    expect(remainingRef.current).toBe(2000);

    jest.advanceTimersByTime(5000);
    expect(onExpire).not.toHaveBeenCalled();

    expect(resumeComboTimer(timerRef, deadlineRef, remainingRef, onExpire)).toBe(true);
    jest.advanceTimersByTime(1999);
    expect(onExpire).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  test('expires immediately when no time remains at resume', () => {
    remainingRef.current = 0;
    expect(resumeComboTimer(timerRef, deadlineRef, remainingRef, onExpire)).toBe(true);
    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(timerRef.current).toBeNull();
  });

  test('does nothing when no combo timer is active', () => {
    expect(pauseComboTimer(timerRef, deadlineRef, remainingRef)).toBe(false);
    expect(remainingRef.current).toBeNull();
  });
});

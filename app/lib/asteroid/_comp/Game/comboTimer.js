export function pauseComboTimer(timerRef, deadlineRef, remainingRef, now = Date.now) {
  if (timerRef.current == null) return false;

  const deadline = deadlineRef.current ?? now();
  remainingRef.current = Math.max(0, deadline - now());
  clearTimeout(timerRef.current);
  timerRef.current = null;
  deadlineRef.current = null;
  return true;
}

export function resumeComboTimer(
  timerRef,
  deadlineRef,
  remainingRef,
  onExpire,
  now = Date.now,
  schedule = setTimeout,
) {
  const remaining = remainingRef.current;
  if (remaining == null) return false;

  remainingRef.current = null;
  if (remaining <= 0) {
    timerRef.current = null;
    deadlineRef.current = null;
    onExpire();
    return true;
  }

  deadlineRef.current = now() + remaining;
  timerRef.current = schedule(() => {
    timerRef.current = null;
    deadlineRef.current = null;
    onExpire();
  }, remaining);
  return true;
}

// Track only contacts that began on the canvas. A joystick contact starts on
// its own overlay element and must never become the turret's aiming point.
export function createCanvasTouchTracker() {
  let activeIdentifier = null;

  return {
    start(event) {
      const touch = event.changedTouches?.[0];
      if (!touch) return null;
      activeIdentifier = touch.identifier;
      return touch;
    },

    move(event) {
      if (activeIdentifier === null) return null;
      return (
        Array.from(event.touches ?? []).find(
          (touch) => touch.identifier === activeIdentifier,
        ) ?? null
      );
    },

    end(event) {
      if (
        activeIdentifier === null ||
        !Array.from(event.changedTouches ?? []).some(
          (touch) => touch.identifier === activeIdentifier,
        )
      ) {
        return null;
      }

      const next = Array.from(event.targetTouches ?? [])[0] ?? null;
      activeIdentifier = next?.identifier ?? null;
      return next;
    },

    reset() {
      activeIdentifier = null;
    },
  };
}

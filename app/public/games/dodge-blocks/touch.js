(function (root) {
  function steerFromPointer(clientX, rectLeft, rectWidth, playerX, playerW, canvasW, step) {
    if (rectWidth <= 0) return playerX;
    const direction = clientX - rectLeft < rectWidth / 2 ? -1 : 1;
    return Math.max(0, Math.min(canvasW - playerW, playerX + direction * step));
  }

  var api = { steerFromPointer: steerFromPointer };
  root.DodgeTouch = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

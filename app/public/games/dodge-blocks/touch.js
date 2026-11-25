(function (root) {
  function steerFromPointer(clientX, rectLeft, rectWidth, playerX, playerW, canvasW, step) {
    if (rectWidth <= 0) return playerX;
    const next = clientX - rectLeft < rectWidth / 2 ? playerX - step : playerX + step;
    return Math.max(0, Math.min(canvasW - playerW, next));
  }

  var api = { steerFromPointer: steerFromPointer };
  root.DodgeTouch = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

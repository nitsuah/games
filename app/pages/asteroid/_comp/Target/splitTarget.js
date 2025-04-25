export function splitTarget(target, nowFn = Date.now) {
  const newSize = target.size * 0.5;
  const newSpeed = target.speed * 2;
  const offsetRange = target.size + 1; // Use original size + buffer for spread
  const spawnTime = nowFn();
  const newColor =
    newSize > 4 ? '#0000ff' :
    newSize > 3 ? '#800080' :
    newSize > 2 ? '#ff4500' :
    newSize > 1 ? '#00ffff' :
    '#ffff00';
  return [
    {
      id: `${target.id}-1`,
      x: target.x + offsetRange,
      y: target.y + Math.random() * offsetRange - offsetRange / 2,
      z: target.z + Math.random() * offsetRange - offsetRange / 2,
      isHit: false,
      size: newSize,
      speed: newSpeed,
      color: newColor,
      spawnTime,
    },
    {
      id: `${target.id}-2`,
      x: target.x - offsetRange,
      y: target.y + Math.random() * offsetRange - offsetRange / 2,
      z: target.z + Math.random() * offsetRange - offsetRange / 2,
      isHit: false,
      size: newSize,
      speed: newSpeed,
      color: newColor,
      spawnTime,
    },
  ];
}

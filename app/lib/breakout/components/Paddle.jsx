/**
 * Paddle component for Breakout game
 * @param {Object} props - Component props
 * @param {number} props.x - X position in world units (centered on paddle)
 * @param {number} props.y - Y position in world units (vertical position)
 * @param {number} props.width - Paddle width in world units (default: 4)
 */
export default function Paddle({ x, y, width }) {
  return (
    <mesh position={[x, y, 0]}>
      <boxGeometry args={[width, 0.5, 1]} />
      <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
    </mesh>
  );
}

export default function Paddle({ x, y, width }) {
  return (
    <mesh position={[x, y, 0]}>
      <boxGeometry args={[width, 0.5, 1]} />
      <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
    </mesh>
  );
}

export default function Ball({ x, y }) {
  return (
    <mesh position={[x, y, 0]}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
      <pointLight intensity={2} distance={5} color="#ffffff" />
    </mesh>
  );
}

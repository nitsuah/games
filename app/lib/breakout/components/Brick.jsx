export default function Brick({ x, y, width, height, color, hits, maxHits }) {
  // Calculate opacity based on hits remaining
  const opacity = hits / maxHits;
  
  return (
    <mesh position={[x, y, 0]}>
      <boxGeometry args={[width, height, 0.5]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={0.3 * opacity}
        opacity={0.5 + 0.5 * opacity}
        transparent
      />
    </mesh>
  );
}

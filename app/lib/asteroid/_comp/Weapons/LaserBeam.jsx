import React, { useMemo } from 'react';
import * as THREE from 'three';

const LaserBeam = ({ lasers, weaponType, thickness = 1, glowIntensity = 0.8, offset = new THREE.Vector3(0, -5, 0) }) => {
  if (!Array.isArray(lasers) || lasers.length === 0) return null;

  const getLaserColor = () => {
    switch (weaponType) {
      case 'spread':
        return 'red';
      case 'laser':
        return 'cyan';
      case 'explosive':
        return 'orange';
      default:
        return 'white';
    }
  };

  const laserColor = getLaserColor();

  const spriteTexture = useMemo(() => {
    // Create a small radial gradient canvas texture for glow sprites (client-only)
    if (typeof document === 'undefined') return null;
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const grd = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.25, 'rgba(255,200,160,0.95)');
    grd.addColorStop(0.45, 'rgba(255,120,60,0.6)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  return (
    <>
      {lasers.map((laser, index) => {
        const adjustedFrom = laser.from.clone().add(offset);
        const distance = adjustedFrom.distanceTo(laser.to);
        if (distance < 1) return null;

        const direction = new THREE.Vector3().subVectors(laser.to, adjustedFrom).normalize();
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

        // If laser has a 'speed' field, render it as a segmented fading trail to simulate a particle trail
        const segments = laser.speed ? Math.max(3, Math.floor(laser.speed * 6)) : 1;
        if (segments > 1) {
          const segLength = distance / segments;
          return (
            <group key={index} position={adjustedFrom.clone()} quaternion={quaternion}>
              {Array.from({ length: segments }).map((_, sIdx) => {
                const t = sIdx / segments; // 0..1 along the beam
                const segPos = direction.clone().multiplyScalar(segLength * (sIdx + 0.5));
                const segOpacity = Math.max(0.04, 0.95 * (1 - t));
                const segScale = Math.max(0.12, 0.8 * (1 - t));
                // Use sprites so trails always face camera and are cheap to render
                return (
                  <sprite key={sIdx} position={segPos} scale={[segScale, segScale, 1]}>
                    <spriteMaterial
                      map={spriteTexture}
                      color={laserColor}
                      transparent
                      opacity={segOpacity}
                      depthWrite={false}
                      blending={THREE.AdditiveBlending}
                    />
                  </sprite>
                );
              })}
            </group>
          );
        }

        return (
          <mesh key={index} position={adjustedFrom.clone().add(laser.to).multiplyScalar(0.5)} quaternion={quaternion}>
            <cylinderGeometry args={[thickness / 2, thickness / 4, distance, 16]} />
            <meshStandardMaterial color={laserColor} emissive={laserColor} emissiveIntensity={glowIntensity} transparent opacity={0.8} />
          </mesh>
        );
      })}
    </>
  );
};

export default LaserBeam;

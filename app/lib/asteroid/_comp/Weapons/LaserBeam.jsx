import React from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

const LaserBeam = ({ lasers, weaponType, thickness = 1, glowIntensity = 0.8, offset = new THREE.Vector3(0, -5, 0), trailQuality = 'high' }) => {
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

  // Load per-weapon glow sprites
  const spreadTex = useLoader(TextureLoader, '/images/glow_spread.png');
  const laserTex = useLoader(TextureLoader, '/images/glow_laser.png');
  const explosiveTex = useLoader(TextureLoader, '/images/glow_explosive.png');
  const defaultTex = useLoader(TextureLoader, '/images/glow_spread.png');
  const spriteTexture = weaponType === 'laser' ? laserTex : weaponType === 'explosive' ? explosiveTex : spreadTex || defaultTex;

  // Trail tuning constants (easy to tweak)
  const BASE_SEGMENTS = 6; // base number of sprite segments per tracer
  const SIZE_MULT = 0.9; // scale multiplier for sprite size

  return (
    <>
      {lasers.map((laser, index) => {
        const adjustedFrom = laser.from.clone().add(offset);
        const distance = adjustedFrom.distanceTo(laser.to);
        if (distance < 1) return null;

        const direction = new THREE.Vector3().subVectors(laser.to, adjustedFrom).normalize();
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

  // If laser has a 'speed' field, render it as a segmented fading trail to simulate a particle trail
        // respect trailQuality: off => no sprites, low => fewer segments
        const baseSegMult = trailQuality === 'off' ? 0 : trailQuality === 'low' ? 0.6 : 1;
        const segments = laser.speed && baseSegMult > 0 ? Math.max(3, Math.floor(laser.speed * BASE_SEGMENTS * baseSegMult)) : 1;
        if (segments > 1) {
          const segLength = distance / segments;
          return (
            <group key={index} position={adjustedFrom.clone()} quaternion={quaternion}>
              {Array.from({ length: segments }).map((_, sIdx) => {
                const t = sIdx / segments; // 0..1 along the beam
                const segPos = direction.clone().multiplyScalar(segLength * (sIdx + 0.5));
                const segOpacity = Math.max(0.04, 0.95 * (1 - t));
                const segScale = Math.max(0.12, SIZE_MULT * (1 - t));
                // Use sprites so trails always face camera and are cheap to render
                if (trailQuality === 'off') return null;
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

import React, { Suspense, Component } from 'react';
import * as THREE from 'three';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('LaserBeam texture loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Return null to hide the component on error
      return null;
    }
    return this.props.children;
  }
}

const LaserBeamContent = ({ lasers, weaponType, thickness = 1, glowIntensity = 0.8, offset = new THREE.Vector3(0, 0, 0), trailQuality = 'high' }) => {
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

  // Removed texture loading to fix errors - using solid colors instead

  // Trail tuning constants (easy to tweak)
  const BASE_SEGMENTS = 6; // base number of sprite segments per tracer
  const SIZE_MULT = 0.9; // scale multiplier for sprite size
  
  // Weapon-specific size scaling - make spread projectiles even smaller (30% of original size)
  const weaponSizeScale = weaponType === 'spread' ? 0.3 : 1.0;

  // Map trailQuality to numeric multipliers for density and scale
  const qualityMap = {
    off: 0,
    low: 0.5,
    high: 1,
  };
  const qualityMult = qualityMap[trailQuality] ?? 1;

  return (
    <>
      {lasers.map((laser, index) => {
        const adjustedFrom = laser.from.clone().add(offset);
        const distance = adjustedFrom.distanceTo(laser.to);
        if (distance < 1) return null;

        const direction = new THREE.Vector3().subVectors(laser.to, adjustedFrom).normalize();

        // If laser has a 'speed' field, render it as a segmented fading trail to simulate a particle trail
        // respect trailQuality: off => no sprites, low => fewer segments
        const segments =
          laser.speed && qualityMult > 0 ? Math.max(3, Math.floor(laser.speed * BASE_SEGMENTS * qualityMult)) : 1;

        if (segments > 1 && qualityMult > 0) {
          // Render sprites along the beam path
          return (
            <group key={index}>
              {Array.from({ length: segments }).map((_, sIdx) => {
                const t = sIdx / segments; // 0..1 along the beam
                const segPos = new THREE.Vector3().lerpVectors(adjustedFrom, laser.to, t + 0.5 / segments);
                const segOpacity = Math.max(0.04, 0.95 * (1 - t));
                const segScale = Math.max(0.06, SIZE_MULT * qualityMult * weaponSizeScale * (1 - t));

                return (
                  <sprite key={sIdx} position={segPos} scale={[segScale, segScale, 1]}>
                    <spriteMaterial
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

        // Fallback: render a solid cylinder beam when no segmented trail is desired
        const beamMidpoint = new THREE.Vector3().addVectors(adjustedFrom, laser.to).multiplyScalar(0.5);
        const beamQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        return (
          <mesh key={index} position={beamMidpoint} quaternion={beamQuat}>
            <cylinderGeometry args={[thickness / 2, thickness / 4, distance, 16]} />
            <meshStandardMaterial color={laserColor} emissive={laserColor} emissiveIntensity={glowIntensity} transparent opacity={0.8} />
          </mesh>
        );
      })}
    </>
  );
};

const LaserBeam = (props) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <LaserBeamContent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default LaserBeam;

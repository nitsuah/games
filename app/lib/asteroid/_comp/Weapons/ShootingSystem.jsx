import { useEffect, useState, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSound } from '@/utils/audio/useSound';
import CooldownManager from '@/lib/asteroid/_comp/Weapons/CooldownManager';
import Explosion from '@/_components/effects/Explosion';
import MuzzleFlash from '@/_components/effects/MuzzleFlash';
import ImpactEffect from '@/_components/effects/ImpactEffect';
import { WEAPON_CONFIG, WEAPON_TYPES } from '@/lib/asteroid/_comp/config';
import { weaponHandler } from '@/lib/asteroid/_comp/Weapons/weaponHandler';
import soundManager from '@/utils/audio/SoundManager';

const ShootingSystem = ({
  onHit,
  onMiss,
  isGameOver,
  isPaused,
  showWaveTransition,
  weapon,
  ammo,
  setAmmo,
  cooldowns,
  setCooldowns,
  setShowLaser,
  targets,
  setTargets,
  rapidFireActive,
}) => {
  const { camera, scene } = useThree();
  const { playSound } = useSound();
  const [explosions, setExplosions] = useState([]);
  const [muzzleFlashes, setMuzzleFlashes] = useState([]);
  const [impactEffects, setImpactEffects] = useState([]);
  const mouseDownRef = useRef(false);
  const autoFireIntervalRef = useRef(null);
  const effectIdCounterRef = useRef(0);
  const aaShotCounterRef = useRef(0); // Track alternating shots for AA weapon

  // Helper function to generate unique effect IDs
  const generateEffectId = (prefix) => {
    effectIdCounterRef.current += 1;
    return `${prefix}-${Date.now()}-${effectIdCounterRef.current}`;
  };

  const handleShoot = () => {
    if (isGameOver || isPaused || showWaveTransition) return;
    if (cooldowns[weapon] > 0) return;
    if (ammo[weapon] <= 0) {
      playSound('empty');
      return;
    }

    // Create muzzle flash at weapon position
    const forwardDirection = new THREE.Vector3();
    camera.getWorldDirection(forwardDirection);
    let weaponOffset;
    
    if (weapon === 'spread') {
      weaponOffset = forwardDirection.clone().multiplyScalar(2).add(new THREE.Vector3(0, -0.5, 0));
    } else if (weapon === 'laser') {
      weaponOffset = forwardDirection.clone().multiplyScalar(1.5).add(new THREE.Vector3(0, -1.2, 0));
    } else if (weapon === 'aa') {
      // AA weapon has dual cannons that alternate - calculate left/right position
      const right = new THREE.Vector3();
      right.crossVectors(forwardDirection, camera.up).normalize();
      const isLeftCannon = aaShotCounterRef.current % 2 === 0;
      const cannonSide = isLeftCannon ? -1 : 1;
      weaponOffset = forwardDirection.clone().multiplyScalar(2.5)
        .add(new THREE.Vector3(0, -0.3, 0))
        .add(right.multiplyScalar(1.5 * cannonSide));
    } else {
      weaponOffset = forwardDirection.clone().multiplyScalar(2.5).add(new THREE.Vector3(0, -0.3, 0));
    }
    
    const flashPosition = camera.position.clone().add(weaponOffset);
    
    setMuzzleFlashes((prev) => [
      ...prev,
      { id: generateEffectId('muzzle'), position: flashPosition, weaponType: weapon },
    ]);

    // Callback to create impact effects when targets are hit
    const triggerImpact = (targetPosition, damage = 10) => {
      setImpactEffects((prev) => [
        ...prev,
        { 
          id: generateEffectId('impact'), 
          position: new THREE.Vector3(targetPosition.x, targetPosition.y, targetPosition.z),
          damage,
          type: 'hit',
        },
      ]);
    };

    weaponHandler({
      type: weapon,
      camera,
      scene,
      targets,
      setTargets,
      setShowLaser,
      playSound,
      onHit,
      onMiss,
      triggerImpact,
      weaponParams:
        weapon === 'spread'
          ? {
              SPREAD_ANGLE: WEAPON_CONFIG.spread.angle,
              SPREAD_COUNT: WEAPON_CONFIG.spread.count,
              SPREAD_RANGE: WEAPON_CONFIG.spread.range,
            }
          : weapon === 'explosive'
          ? {
                  explosionRadius: WEAPON_CONFIG.explosive.radius,
                  triggerExplosion: (position) => {
                    const radius = WEAPON_CONFIG.explosive.radius;
                    setExplosions((prev) => [
                      ...prev,
                      { id: generateEffectId('explosion'), position, explosionRadius: radius },
                    ]);
                    // Map explosion size to nearby target sizes for more characterful sound
                    try {
                      // Find targets within radius*1.5 and use the largest target size as bias
                      const nearby = targets.filter((t) => {
                        const dx = t.x - position.x;
                        const dy = t.y - position.y;
                        const dz = (t.z || 0) - (position.z || 0);
                        const dist2 = dx * dx + dy * dy + dz * dz;
                        return dist2 <= (radius * 1.5) * (radius * 1.5);
                      });
                      const largest = nearby.reduce((max, t) => Math.max(max, t.size || 1), 0) || 1;
                      const sizeFactor = Math.max(0.5, Math.min(3, largest / 10));
                      // Compute simple pan based on x offset from camera
                      const camPos = camera.position || { x: 0, y: 0, z: 0 };
                      const dx = (position.x || 0) - camPos.x;
                      const pan = Math.max(-1, Math.min(1, dx / 50));
                      soundManager.playExplosion(sizeFactor, pan);
                    } catch {
                      /* ignore */
                    }
                  },
                }
          : weapon === 'aa'
          ? {
              explosionRadius: WEAPON_CONFIG.aa.radius,
              shotCounter: aaShotCounterRef.current,
              triggerExplosion: (position, radius = WEAPON_CONFIG.aa.radius) => {
                setExplosions((prev) => [
                  ...prev,
                  { id: generateEffectId('explosion'), position, explosionRadius: radius },
                ]);
                try {
                  soundManager.playExplosion(Math.max(0.5, radius / 50));
                } catch {
                  /* ignore */
                }
              },
            }
          : {},
      triggerExplosion: (position, radius) => {
        const explosionRadius = radius || WEAPON_CONFIG.explosive.radius;
        setExplosions((prev) => [
          ...prev,
          { id: generateEffectId('explosion'), position, explosionRadius },
        ]);
        try {
          soundManager.playExplosion(Math.max(0.5, explosionRadius / 50));
        } catch {
          /* ignore */
        }
      },
    });

    // Increment AA shot counter for alternating cannons
    if (weapon === 'aa') {
      aaShotCounterRef.current += 1;
    }

    const weaponCooldown = WEAPON_TYPES.find((w) => w.key === weapon).cooldown;
    // Explosive: 0 cooldown with rapid fire for fastest firing mode
    const adjustedCooldown = rapidFireActive 
      ? (weapon === 'explosive' ? 0 : weaponCooldown / 5)
      : weaponCooldown;
    setCooldowns((prev) => ({ ...prev, [weapon]: adjustedCooldown }));

    if (typeof setAmmo === 'function') {
      setAmmo((prev) => ({ ...prev, [weapon]: Math.max(0, prev[weapon] - 1) }));
    }

    playSound('shoot');
  };

  useEffect(() => {
    const handleMouseDown = () => {
      mouseDownRef.current = true;
      
      // Fire immediately on click for all weapons
      handleShoot();
      
      // Full-auto continuous fire behavior:
      // - Laser: ALWAYS continuous (like holding a beam)
      // - With rapid fire active: all weapons fire continuously
      // - Explosive with rapid fire: continuous fast fire
      // - Spread with rapid fire: continuous bursts
      const shouldAutoFire = weapon === 'laser' || rapidFireActive;
      
      if (shouldAutoFire) {
        if (autoFireIntervalRef.current) {
          clearInterval(autoFireIntervalRef.current);
        }
        
        // Fire rates: 
        // - Laser: ultra-fast (50ms = continuous beam feel)
        // - Rapid fire: 300ms (0.3s) for all weapons
        let fireRate = 50; // Default laser rate
        if (rapidFireActive) {
          fireRate = 300; // 0.3 seconds for rapid fire power-up
        }
        
        autoFireIntervalRef.current = setInterval(() => {
          if (mouseDownRef.current) {
            handleShoot();
          }
        }, fireRate);
      }
    };

    const handleMouseUp = () => {
      mouseDownRef.current = false;
      if (autoFireIntervalRef.current) {
        clearInterval(autoFireIntervalRef.current);
        autoFireIntervalRef.current = null;
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (autoFireIntervalRef.current) {
        clearInterval(autoFireIntervalRef.current);
      }
    };
  }, [handleShoot, rapidFireActive, weapon, ammo]);

  return (
    <>
      <CooldownManager cooldowns={cooldowns} setCooldowns={setCooldowns} rapidFireActive={rapidFireActive} />
      {explosions.map((explosion) => (
        <Explosion
          key={explosion.id}
          position={explosion.position}
          explosionRadius={explosion.explosionRadius}
          onComplete={() => setExplosions((prev) => prev.filter((e) => e.id !== explosion.id))}
        />
      ))}
      {muzzleFlashes.map((flash) => (
        <MuzzleFlash
          key={flash.id}
          position={flash.position}
          weaponType={flash.weaponType}
          onComplete={() => setMuzzleFlashes((prev) => prev.filter((f) => f.id !== flash.id))}
        />
      ))}
      {impactEffects.map((effect) => (
        <ImpactEffect
          key={effect.id}
          position={effect.position}
          damage={effect.damage}
          type={effect.type}
          onComplete={() => setImpactEffects((prev) => prev.filter((e) => e.id !== effect.id))}
        />
      ))}
    </>
  );
};

export default ShootingSystem;

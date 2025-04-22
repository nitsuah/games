import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";

const Controls = ({ playerRef, terrainRef, onPauseGame }) => {
  const controlsRef = useRef();
  const isLocked = useRef(false);
  const [movement, setMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  const handleMovement = (velocity, rotationSpeed, keys) => {
    const { forward, backward, left, right } = keys;

    const controlsObject = controlsRef.current.getObject();

    // Forward and backward movement
    if (forward) {
      controlsObject.translateZ(-velocity);
    } else if (backward) {
      controlsObject.translateZ(velocity);
    }

    // Left and right rotation
    if (left) {
      controlsObject.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), rotationSpeed);
    } else if (right) {
      controlsObject.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -rotationSpeed);
    }

    // Adjust Y position based on terrain
    if (terrainRef.current) {
      const raycaster = new THREE.Raycaster();
      const origin = new THREE.Vector3(
        controlsObject.position.x,
        100, // Start ray above the terrain
        controlsObject.position.z
      );
      const direction = new THREE.Vector3(0, -1, 0); // Point ray downward
      raycaster.set(origin, direction);

      console.log("Ray Origin:", origin); // Log ray origin
      console.log("Ray Direction:", direction); // Log ray direction

      const intersects = raycaster.intersectObject(terrainRef.current, true);
      if (intersects.length > 0) {
        const groundHeight = intersects[0].point.y; // Get the Y position of the terrain
        console.log("Raycast Hit:", intersects[0]); // Log the raycast hit details
        console.log("Raycast Y position:", groundHeight); // Log the Y position
        controlsObject.position.y = groundHeight + 1; // Adjust Y position
      } else {
        console.warn("Raycast did not hit the terrain."); // Log if no intersection
      }
    }

    // Log player coordinates to the console
    console.log(
      "Player X:",
      controlsObject.position.x.toFixed(2),
      "Y:",
      controlsObject.position.y.toFixed(2),
      "Z:",
      controlsObject.position.z.toFixed(2)
    );
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          setMovement((prev) => ({ ...prev, forward: true }));
          break;

        case "ArrowDown":
        case "KeyS":
          setMovement((prev) => ({ ...prev, backward: true }));
          break;

        case "ArrowLeft":
        case "KeyA":
          setMovement((prev) => ({ ...prev, left: true }));
          break;

        case "ArrowRight":
        case "KeyD":
          setMovement((prev) => ({ ...prev, right: true }));
          break;

        default:
          return;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          setMovement((prev) => ({ ...prev, forward: false }));
          break;

        case "ArrowDown":
        case "KeyS":
          setMovement((prev) => ({ ...prev, backward: false }));
          break;

        case "ArrowLeft":
        case "KeyA":
          setMovement((prev) => ({ ...prev, left: false }));
          break;

        case "ArrowRight":
        case "KeyD":
          setMovement((prev) => ({ ...prev, right: false }));
          break;

        default:
          return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame(() => {
    const movementSpeed = 0.1; // Player movement speed
    const rotationSpeed = 0.02; // Player rotation speed
    handleMovement(movementSpeed, rotationSpeed, movement);
  });

  return (
    <PointerLockControls
      ref={controlsRef}
      onUpdate={() => {
        if (controlsRef.current) {
          controlsRef.current.addEventListener("lock", () => {
            console.log("lock");
            isLocked.current = true;
          });

          controlsRef.current.addEventListener("unlock", () => {
            console.log("unlock");
            isLocked.current = false;

            // Pausing the game when controls are unlocked
            if (!isLocked.current) {
              onPauseGame();
            }
          });
        }
      }}
    />
  );
};

export default Controls;

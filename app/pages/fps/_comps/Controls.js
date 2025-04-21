import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three"; // Add this import

const Controls = ({ playerRef, onPauseGame }) => {
  const controlsRef = useRef();
  const isLocked = useRef(false);
  const [movement, setMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  const gravity = 0.02; // Increased gravity for tank-like behavior

  const handleMovement = (velocity, rotationSpeed, keys) => {
    const { forward, backward, left, right } = keys;

    const controlsObject = controlsRef.current.getObject();

    // Forward and backward movement
    if (forward) {
      controlsObject.translateZ(-velocity);
    } else if (backward) {
      controlsObject.translateZ(velocity);
    }

    // Left and right rotation (fixed logic)
    if (left) {
      controlsObject.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), rotationSpeed);
    } else if (right) {
      controlsObject.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -rotationSpeed);
    }

    // Lock Y position to 1
    controlsObject.position.y = 1;

    // Log tank coordinates to the console
    console.log(
      "TANK X:",
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
    const movementSpeed = 0.1; // Tank movement speed
    const rotationSpeed = 0.02; // Tank rotation speed
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

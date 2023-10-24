import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";

const Controls = ({ playerRef, onPauseGame }) => {
  const controlsRef = useRef();
  const isLocked = useRef(false);
  const [movement, setMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    down: false,
  });

  const gravity = 0.0008;

  const handleJump = (velocity) => {
    const jumpForce = 0.015;
    const controlsObject = controlsRef.current.getObject();
    if (controlsObject && movement.jump) {
      // Apply a continuous upward force
      velocity = Math.min(velocity + jumpForce, 0.2);
      controlsObject.position.y += velocity;
    }
  };

  const handleDown = (velocity) => {
    const downForce = 0.015;
    const controlsObject = controlsRef.current.getObject();
    if (controlsObject && movement.down) {
      // Apply a continuous downward force
      velocity = Math.max(velocity - downForce, -0.2); // Use Math.max to limit downward speed
      controlsObject.position.y += velocity;
    }
  };

  const handleMovement = (velocity, strafeSpeed, keys) => {
    const { forward, backward, left, right, jump, down } = keys;

    if (forward) {
      velocity = Math.min(velocity + 0.002, 0.1);
    } else if (backward) {
      velocity = Math.min(velocity - 0.002, -0.1);
    } else {
      velocity = 0;
    }

    controlsRef.current.moveForward(velocity);

    if (left) {
      controlsRef.current.moveRight(-strafeSpeed);
    } else if (right) {
      controlsRef.current.moveRight(strafeSpeed);
    }

    const controlsObject = controlsRef.current.getObject();

    if (jump && !down) {
      handleJump(velocity);
    } else if (down && !jump) {
      handleDown(velocity);
    } else if ((jump && down) || (!jump && !down)) {
      if (controlsObject && controlsObject.position.y > 0) {
        controlsObject.position.y -= gravity;
      } else {
        controlsObject.position.y = 0;
      }
    }
    // Log PLayer coordinates to console
    console.log(
      "PLAYER X:",
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
          setMovement((prev) => ({ ...prev, forward: true, backward: false }));
          break;

        case "ArrowLeft":
        case "KeyA":
          setMovement((prev) => ({ ...prev, left: true }));
          break;

        case "ArrowDown":
        case "KeyS":
          setMovement((prev) => ({ ...prev, backward: true, forward: false }));
          break;

        case "ArrowRight":
        case "KeyD":
          setMovement((prev) => ({ ...prev, right: true }));
          break;

        case "Space":
          setMovement((prev) => ({ ...prev, jump: true, down: false }));
          break;

        case "KeyZ":
          setMovement((prev) => ({ ...prev, down: true, jump: false }));
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

        case "ArrowLeft":
        case "KeyA":
          setMovement((prev) => ({ ...prev, left: false }));
          break;

        case "ArrowDown":
        case "KeyS":
          setMovement((prev) => ({ ...prev, backward: false }));
          break;

        case "ArrowRight":
        case "KeyD":
          setMovement((prev) => ({ ...prev, right: false }));
          break;

        case "Space":
          setMovement((prev) => ({ ...prev, jump: false, down: false }));
          break;

        case "KeyZ":
          setMovement((prev) => ({ ...prev, down: false, jump: false }));
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
    const movementSpeed = 0.1;
    const strafeSpeed = 0.1;
    handleMovement(movementSpeed, strafeSpeed, movement);
  });

  return (
    <PointerLockControls
      ref={controlsRef}
      onUpdate={() => {
        if (controlsRef.current) {
          const velocity = 0;
          controlsRef.current.addEventListener("lock", () => {
            console.log("lock");
            isLocked.current = true;
          });

          controlsRef.current.addEventListener("unlock", () => {
            console.log("unlock");
            isLocked.current = false;

            // Pausing the game when controls are unlocked
            if (!isLocked.current) {
              // Call the function to pause the game in Range.js
              onPauseGame();
            }
          });
        }
      }}
    />
  );
};

export default Controls;

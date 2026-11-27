import React from 'react';
import styled from 'styled-components';

const StyledShootButton = styled.button`
  position: absolute;
  bottom: 100px;
  right: 50px;
  width: 80px;
  height: 80px;
  background: rgba(255, 0, 0, 0.6);
  border: 2px solid #ff0000;
  border-radius: 50%;
  color: white;
  font-weight: bold;
  cursor: pointer;
  z-index: 1000;

  touch-action: none;

  @media (hover: hover) and (pointer: fine) {
    display: none;
  }

  &:active {
    background: rgba(255, 0, 0, 0.8);
  }
`;

interface ShootButtonProps {
  onShoot?: () => void;
  /** For hold-to-fire games: called on press and on release. */
  onHold?: (held: boolean) => void;
}

export const ShootButton = ({ onShoot, onHold }: ShootButtonProps) => {
  return (
    <StyledShootButton
      data-touch-control
      // Hold-to-fire wins, so one press never fires through both callbacks.
      onClick={onHold ? undefined : onShoot}
      onPointerDown={() => onHold?.(true)}
      onPointerUp={() => onHold?.(false)}
      onPointerCancel={() => onHold?.(false)}
      onPointerLeave={() => onHold?.(false)}
    >
      FIRE
    </StyledShootButton>
  );
};

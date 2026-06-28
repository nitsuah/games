import React from 'react';
import styled from 'styled-components';

const JoystickContainer = styled.div`
  position: absolute;
  bottom: 50px;
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none;
`;

const JoystickKnob = styled.div`
  width: 50px;
  height: 50px;
  background: rgba(0, 255, 255, 0.8);
  border-radius: 50%;
`;

export const VirtualJoystick = ({ onMove }: { onMove: (x: number, y: number) => void }) => {
  return (
    <JoystickContainer>
      <JoystickKnob />
    </JoystickContainer>
  );
};

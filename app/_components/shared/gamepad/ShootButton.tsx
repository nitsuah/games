import React from 'react';
import styled from 'styled-components';

const ShootButton = styled.button`
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

  &:active {
    background: rgba(255, 0, 0, 0.8);
  }
`;

export const ShootButton = ({ onShoot }: { onShoot: () => void }) => {
  return <ShootButton onClick={onShoot}>FIRE</ShootButton>;
};

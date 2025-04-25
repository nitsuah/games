import React from 'react';
import Target from './Target';
import { DEFAULT_TARGET_COLOR } from '../config';

const TargetList = ({ targets, handleTargetHit, handleRefCallback, setTargets }) => (
  <>
    {targets.map((target) => (
      <Target
        key={target.id}
        position={[target.x, target.y, target.z]}
        targetId={target.id}
        isHit={target.isHit}
        onHit={handleTargetHit}
        size={target.size}
        speed={target.speed}
        color={target.color || DEFAULT_TARGET_COLOR}
        refCallback={handleRefCallback}
        setTargets={setTargets}
      />
    ))}
  </>
);

export default TargetList;

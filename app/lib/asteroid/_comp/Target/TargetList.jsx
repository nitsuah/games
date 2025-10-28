import Target from '@/lib/asteroid/_comp/Target/Target';
import { DEFAULT_TARGET_COLOR } from '@/lib/asteroid/_comp/config';

const TargetList = ({ targets, handleTargetHit, handleRefCallback, setTargets, isGameOver = false, isPaused = false }) => (
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
        isGameOver={isGameOver}
        isPaused={isPaused}
      />
    ))}
  </>
);

export default TargetList;

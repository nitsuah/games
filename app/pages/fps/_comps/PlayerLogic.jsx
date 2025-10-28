import dynamic from 'next/dynamic';

const PlayerLogic = dynamic(() => import('@/lib/fps/_comps/PlayerLogic'), { ssr: false });

export default PlayerLogic;

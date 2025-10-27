import dynamic from 'next/dynamic';

const ShatterCube = dynamic(() => import('@/lib/fps/_comps/ShatterCube'), { ssr: false });

export default ShatterCube;

import dynamic from 'next/dynamic';

const ShootingHandler = dynamic(() => import('@/lib/fps/_comps/ShootingHandler'), { ssr: false });

export default ShootingHandler;

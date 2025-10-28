import dynamic from 'next/dynamic';

const PowerUp = dynamic(() => import('@/lib/fps/_comps/PowerUp'), { ssr: false });

export default PowerUp;

import dynamic from 'next/dynamic';

const Bullet = dynamic(() => import('@/lib/fps/_comps/Bullet'), { ssr: false });

export default Bullet;

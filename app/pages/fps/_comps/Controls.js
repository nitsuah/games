import dynamic from 'next/dynamic';

const Controls = dynamic(() => import('@/lib/fps/_comps/Controls'), { ssr: false });

export default Controls;

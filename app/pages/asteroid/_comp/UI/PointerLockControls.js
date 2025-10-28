import dynamic from 'next/dynamic';

const PointerLockControls = dynamic(() => import('@/lib/asteroid/_comp/UI/PointerLockControls'), { ssr: false });

export default PointerLockControls;

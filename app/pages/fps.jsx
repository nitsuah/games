// fps.jsx
import dynamic from 'next/dynamic';

const FpsCanvas = dynamic(() => import('@/lib/fps/FpsCanvas'), { ssr: false });

export default function Range() {
  return <FpsCanvas />;
}

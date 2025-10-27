// Placeholder kept in pages tree to avoid Next treating r3f-hook components as pages.
// Real implementation moved to `app/lib/fps/_comps/Decal.jsx`.
import dynamic from 'next/dynamic';

const Decal = dynamic(() => import('@/lib/fps/_comps/Decal'), { ssr: false });

export default Decal;

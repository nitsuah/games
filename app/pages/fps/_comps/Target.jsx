// This file used to contain a react-three-fiber component that used hooks
// (useFrame/useThree). Those hooks require a Canvas runtime and cannot be
// executed during Next's server-side prerender. To keep the pages tree clean
// and avoid prerender/runtime failures, the real component was moved to
// `app/lib/fps/_comps/Target.jsx` and consumers import from there.

// Keep a harmless placeholder here so Next's page collector can safely
// import the module without executing react-three-fiber hooks.
import dynamic from 'next/dynamic';

const Target = dynamic(() => import('@/lib/fps/_comps/Target'), { ssr: false });

export default Target;

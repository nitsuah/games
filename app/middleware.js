import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();

  // Basic CSP to pass Lighthouse audit
  const csp = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https:; worker-src 'self' blob:; manifest-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests; block-all-mixed-content;";

  response.headers.set('Content-Security-Policy', csp);

  return response;
}

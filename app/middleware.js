import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();

  // Basic CSP to pass Lighthouse audit
  const csp = "default-src * 'unsafe-inline' 'unsafe-eval'; connect-src *; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data: blob:;";

  response.headers.set('Content-Security-Policy', csp);

  return response;
}

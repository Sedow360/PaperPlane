import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up', '/', '/verify/:path*', '/api/send-message', '/api/sign-up', '/api/verify-user'],
};

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
});

const RATE_LIMITED_ROUTES = ['/api/send-message', '/api/sign-up', '/api/verify-user'];

const allowedOrigins = ['http://localhost:3000/', `${process.env.PUBLIC_URL}`]
 
const corsOptions = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Rate limiting for sensitive routes
    if (RATE_LIMITED_ROUTES.some((route) => pathname.startsWith(route))) {
      const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
      const { success } = await ratelimit.limit(`${pathname}:${ip}`);

      if (!success) {
        return NextResponse.json(
          { message: 'Too many requests. Please slow down.' },
          { status: 429 }
        );
      }
    }

    // Check the origin from the request
    const origin = request.headers.get('origin') ?? ''
    const isAllowedOrigin = allowedOrigins.includes(origin)
 
    // Handle preflighted requests
    const isPreflight = request.method === 'OPTIONS'
 
    if (isPreflight) {
      const preflightHeaders = {
        ...(isAllowedOrigin && { 'Access-Control-Allow-Origin': origin }),
        ...corsOptions,
      }
      return NextResponse.json({}, { headers: preflightHeaders })
    }

    const token = await getToken({ req: request });
    const url = request.nextUrl;

    // Redirect to dashboard if the user is already authenticated
    // and trying to access sign-in, sign-up, or home page
    if (
      token &&
      (url.pathname.startsWith('/sign-in') ||
        url.pathname.startsWith('/sign-up')
      )
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (!token && url.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    // Handle simple requests
    const response = NextResponse.next()
 
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
 
    Object.entries(corsOptions).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
 
    return response
}
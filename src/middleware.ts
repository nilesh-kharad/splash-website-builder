import { clerkMiddleware, ClerkMiddlewareAuth, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(['/agency/sign-in(.*)', '/agency/sign-up(.*)', '/site', '/api/uploadthing','/'])

const afterAuth = async (auth: ClerkMiddlewareAuth, request: any) => {
  // Handle afterAuth logic here
  const url = request.nextUrl
  const searchParams = url.searchParams.toString()
  let hostname = request.headers
  const pathWithSearchParams = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`
  //if subdomain exists
  const customSubDomain = hostname.get('host')?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`).filter(Boolean)[0]
  if (customSubDomain) {
    return NextResponse.rewrite(new URL(`/${customSubDomain}${pathWithSearchParams}`, request.url))
  }
  if (url.pathname == '/sign-in' || url.pathname === '/sign-up') {
    return NextResponse.redirect(new URL(`/agency/sign-in`, request.url))
  }
  if (url.pathname === '/' || url.pathname === "/site" && url.host === process.env.NEXT_PUBLIC_DOMAIN) {
    return NextResponse.rewrite(new URL('/site', request.url))
  }
  if (url.pathname.startsWith('/agency') || url.pathname.startsWith('/subaccount')) {
    return NextResponse.rewrite(new URL(`${pathWithSearchParams}`, request.url))
  }
  console.log('hostname', hostname);

};
export default clerkMiddleware(async (auth, request) => {
  // Handle beforeAuth logic here
  // console.log('request', request);
  if (!isPublicRoute(request)) {
    await auth.protect()
    // Call afterAuth function
    console.log('Hello')
  }
  return afterAuth(auth, request);
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
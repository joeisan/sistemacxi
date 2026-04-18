import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export default async function middleware(request: NextRequest) {
  // Create base response
  const response = NextResponse.next({
    request: { headers: request.headers },
  })
  // Temporarily disabled to debug hang
  // const responseWithSession = await updateSession(request, baseResponse)

  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Support for multiple environments
  const rootDomains = ['localhost:3000', 'sistemacxi.vercel.app']
  
  let currentHost = hostname
  if (currentHost.includes('localhost')) {
    currentHost = currentHost.replace(/:\d+$/, '') // remove port
  }

  // Check if we are on a subdomain
  let isSubdomain = false;
  let subdomain = '';
  
  for (const root of rootDomains) {
      const parsedRoot = root.replace(/:\d+$/, '')
      if (currentHost.endsWith(`.${parsedRoot}`)) {
         isSubdomain = true;
         subdomain = currentHost.replace(`.${parsedRoot}`, '').toLowerCase();
         break;
      }
  }

  // Rewrite to the appropriate folder structure
  if (isSubdomain) {
    // CRITICAL: Prevent infinite rewrite loops. 
    // If the path already has the subdomain prefix, it's already been rewritten.
    if (url.pathname.startsWith(`/${subdomain}`)) {
      return response
    }

    const rewriteUrl = new URL(`/${subdomain}${url.pathname}${url.search}`, request.url)
    return NextResponse.rewrite(rewriteUrl, { 
      headers: response.headers 
    })
  }

  // For the main domain (Super Admin, Landing, etc)
  return response
}

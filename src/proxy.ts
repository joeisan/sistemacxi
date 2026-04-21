import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { getRootDomain, getProtocol } from '@/lib/utils/host'

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Specific file extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export default async function proxy(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // 1. Root and Session Update
  const response = NextResponse.next({
    request: { headers: request.headers },
  })
  
  // Important: Keep the session updated 
  const responseWithSession = await updateSession(request, response)

  // 2. Identify Domain Roots
  const rootDomain = getRootDomain(hostname)
  
  let currentHost = hostname
  if (currentHost.includes('localhost')) {
    currentHost = currentHost.replace(/:\d+$/, '') // normalize localhost
  }

  // 3. Subdomain Logic
  let isSubdomain = false;
  let subdomain = '';
  
  const parsedRoot = rootDomain.replace(/:\d+$/, '')
  const ignoreSubdomains = ['www', 'admin', 'api', 'app']

  if (currentHost.endsWith(`.${parsedRoot}`) && currentHost !== parsedRoot) {
     const potentialSubdomain = currentHost.replace(`.${parsedRoot}`, '').toLowerCase();
     if (!ignoreSubdomains.includes(potentialSubdomain)) {
        isSubdomain = true;
        subdomain = potentialSubdomain;
     }
  }

  // 4. Exclusion List (Global routes that should NOT be rewritten to a tenant)
  const excludedPaths = [
    '/login-super',   // Global Super Admin login
    '/super-admin',   // Global Super Admin panel
    '/register',      // Global Tenant Admin registration
    '/api',           // Global API routes
    '/_next',         // Next.js internal paths
    '/favicon.ico',   // Static assets
    '/test-routing'   // Development testing
  ]

  const isExcluded = excludedPaths.some(path => url.pathname.startsWith(path))

  // 5. Multi-tenant Redirect (Option 1: Strict Path-based)
  if (isSubdomain && !isExcluded) {
    // Force redirect from subdomain to path-based URL on root domain
    const redirectUrl = new URL(`/${subdomain}${url.pathname}${url.search}`, `${getProtocol(hostname)}://${rootDomain}`)
    return NextResponse.redirect(redirectUrl)
  }

  // 6. Handle root domain paths (Normal Next.js Routing)
  return responseWithSession
}

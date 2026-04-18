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

export async function proxy(request: NextRequest) {
  const url = request.nextUrl
  const host = request.headers.get('host') || ''
  
  // Support for multiple environments
  const rootDomains = ['localhost:3000', 'sistemacxi.vercel.app']
  
  // 1. Identify Subdomain
  let isSubdomain = false;
  let subdomain = '';
  
  for (const root of rootDomains) {
      const rootWithoutPort = root.split(':')[0]
      // Check if host matches subdomain pattern (sub.domain.com)
      if (host.endsWith(`.${rootWithoutPort}`) || host.endsWith(`.${root}`)) {
         isSubdomain = true;
         subdomain = host.split(`.${rootWithoutPort}`)[0].toLowerCase();
         break;
      }
  }

  // 2. Handle Multi-Tenant Rewriting
  if (isSubdomain && subdomain) {
    // If the path already includes the subdomain prefix (internal match), just update session
    if (url.pathname.startsWith(`/${subdomain}`)) {
      return await updateSession(request, NextResponse.next())
    }

    // Internal rewrite: slug.domain.com/admin -> /slug/admin
    // This allows the browser URL to remain clean while serving content from [tenant]
    const rewriteUrl = new URL(`/${subdomain}${url.pathname}${url.search}`, request.url)
    const response = NextResponse.rewrite(rewriteUrl)
    return await updateSession(request, response)
  }

  // 3. Main Domain Logic
  // Apply session updates to standard requests
  return await updateSession(request, NextResponse.next())
}

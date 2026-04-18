/**
 * Centralized utility for domain and URL management.
 * Handles detection of root domains (local vs production)
 * and generates consistent tenant URLs.
 */

export function getRootDomain(host: string | null): string {
  // Use environment variable if defined, falling back to dynamic detection
  const envRoot = process.env.NEXT_PUBLIC_ROOT_DOMAIN
  if (envRoot) return envRoot

  if (!host) return 'localhost:3000'
  
  const h = host.toLowerCase()
  
  // Local development normalization
  if (h.includes('localhost') || h.includes('127.0.0.1')) {
    return h 
  }
  
  // Specific internal domains
  if (h.includes('sistemacxi.vercel.app')) {
    return 'sistemacxi.vercel.app'
  }
  
  const parts = h.split('.')
  
  // Ignore 'www' in root domain detection
  if (h.startsWith('www.')) {
    return parts.slice(1).join('.')
  }

  // Extract base domain (e.g., tenant.sistemacxi.app -> sistemacxi.app)
  if (parts.length >= 2) {
    // Basic TLD detection - taking last 2 parts as the "Root"
    return parts.slice(-2).join('.')
  }
  
  return h
}

export function getProtocol(host: string | null): string {
  if (!host || host.includes('localhost') || host.includes('127.0.0.1')) {
    return 'http'
  }
  return 'https'
}

/**
 * Generates a full URL for a tenant using the subdomain style.
 * Example: https://tenant.sistemacxi.app
 */
export function getTenantSubdomainUrl(subdomain: string, rootDomain: string, host: string | null): string {
  const protocol = getProtocol(host)
  return `${protocol}://${subdomain}.${rootDomain}`
}

/**
 * Generates a full URL for a tenant using the slug/path style.
 * Example: https://sistemacxi.app/tenant
 */
export function getTenantPathUrl(subdomain: string, rootDomain: string, host: string | null): string {
  const protocol = getProtocol(host)
  return `${protocol}://${rootDomain}/${subdomain}`
}

/**
 * Checks if a tenant's subscription (trial or paid plan) has expired.
 * @param tenant The tenant object from the database
 * @returns boolean true if expired, false otherwise
 */
export function isTenantExpired(tenant: any): boolean {
  if (!tenant) return false

  // If explicitly suspended, we consider it "blocked" but this helper is for dates
  // (The pages check !is_active separately or in conjunction)

  const now = new Date()
  const expiryDate = getEffectiveExpiryDate(tenant)
  
  if (!expiryDate) return false

  // Normalize now to start of day if comparing against simple dates?
  // Actually, since these are TIMESTAMPTZ, direct comparison is better
  return new Date(expiryDate) < now
}

/**
 * Returns the relevant expiration date for the tenant, regardless of whether it's a trial or paid plan.
 */
export function getEffectiveExpiryDate(tenant: any): string | null {
  if (!tenant) return null

  if (tenant.is_trial) {
    return tenant.trial_ends_at || null
  }

  return tenant.plan_expiry_date || null
}

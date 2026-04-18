/**
 * Checks if a tenant's subscription (trial or paid plan) has expired.
 * @param tenant The tenant object from the database
 * @returns boolean true if expired, false otherwise
 */
export function isTenantExpired(tenant: any): boolean {
  if (!tenant) return false

  const now = new Date()

  if (tenant.is_trial) {
    if (!tenant.trial_ends_at) return false // Should not happen
    return new Date(tenant.trial_ends_at) < now
  }

  // If not trial, check plan expiry
  if (tenant.plan_expiry_date) {
    return new Date(tenant.plan_expiry_date) < now
  }

  // If no trial and no expiry date, assume active (infinite/managed manually)
  return false
}

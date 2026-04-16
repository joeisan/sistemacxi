/**
 * Simulated email helper for Phase 2.
 * This will be replaced by Resend in the future.
 */

interface SendEmailParams {
  to: string[]
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from }: SendEmailParams) {
  // SIMULATION: In production, this would call Resend API.
  console.log('--------------------------------------------')
  console.log(`[EMAIL SIMULATION]`)
  console.log(`FROM: ${from || 'no-reply@casilleros.com'}`)
  console.log(`TO: ${to.join(', ')}`)
  console.log(`SUBJECT: ${subject}`)
  console.log(`BODY: (HTML content omitted for brevity)`)
  // console.log(html)
  console.log('--------------------------------------------')
  
  return { success: true, id: `sim_${Math.random().toString(36).substr(2, 9)}` }
}

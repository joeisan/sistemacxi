import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Using service role to bypass RLS for debugging

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugClientPlan() {
  const email = 'joel@mail.com'
  
  console.log(`Checking profile for: ${email}`)
  const { data: profile, error: pError } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', email)
    .single()

  if (pError || !profile) {
    console.error('Profile not found:', pError)
    return
  }
  console.log('Profile found:', profile)

  console.log('Checking client record...')
  const { data: client, error: cError } = await supabase
    .from('clients')
    .select('id, full_name, plan_id, tenant_id')
    .eq('profile_id', profile.id)
    .single()

  if (cError || !client) {
    console.error('Client record not found:', cError)
    return
  }
  console.log('Client record found:', client)

  if (!client.plan_id) {
    console.error('CRITICAL: plan_id is NULL for this client')
  } else {
    console.log('Checking plan details for ID:', client.plan_id)
    const { data: plan, error: plError } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('id', client.plan_id)
      .single()

    if (plError || !plan) {
      console.error('Plan not found in pricing_plans table:', plError)
    } else {
      console.log('Plan details found:', plan)
    }
  }

  console.log('Checking if there are ANY plans for this tenant...')
  const { data: allPlans } = await supabase
    .from('pricing_plans')
    .select('id, name')
    .eq('tenant_id', client.tenant_id)
  
  console.log('Plans available for this tenant:', allPlans)
}

debugClientPlan()

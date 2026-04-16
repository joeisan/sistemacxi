-- Migration 09: Simplify Pricing Plans RLS
-- This ensures that the client can always read the plan linked to their client record

DROP POLICY IF EXISTS "Clients can view their current pricing plan" ON public.pricing_plans;

CREATE POLICY "Clients can view their current pricing plan" ON public.pricing_plans
FOR SELECT USING (
    id IN (
        SELECT plan_id FROM public.clients 
        WHERE profile_id = auth.uid()
    )
);

-- Also ensure clients can read their own client records (incase it was missing)
DROP POLICY IF EXISTS "Clients can view their own record" ON public.clients;

CREATE POLICY "Clients can view their own record" ON public.clients
FOR SELECT USING (profile_id = auth.uid());

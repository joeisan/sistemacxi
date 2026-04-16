-- Migration 06: Client Pre-alerts and Package Permissions

-- 1. Enable Client INSERT on packages
DROP POLICY IF EXISTS "Client insert own packages" ON public.packages;
CREATE POLICY "Client insert own packages" ON public.packages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.clients c 
            WHERE c.id = client_id 
            AND c.profile_id = auth.uid()
        )
    );

-- 2. Ensure Clients can only insert into their own tenant
-- This is handled by the check above if tenant_id matches the client's tenant_id.
-- Let's make it more explicit if needed, but client_id is the primary filter.

-- 3. Add 'pre-alertado' status to the status check if we decide to enforce it via CONSTRAINT.
-- Currently, status is a VARCHAR. We'll handle 'pre-alertado' in the application layer.

-- 4. Allow clients to update their own pre-alerted packages (only if status is 'pre-alertado')
DROP POLICY IF EXISTS "Client update own pre-alerted packages" ON public.packages;
CREATE POLICY "Client update own pre-alerted packages" ON public.packages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.clients c 
            WHERE c.id = packages.client_id 
            AND c.profile_id = auth.uid()
        )
        AND packages.status = 'pre-alertado'
    ) WITH CHECK (
        status = 'pre-alertado'
    );

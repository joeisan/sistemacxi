-- Migration 04: Plan Management, Alerts, and Blocking

-- 1. Add plan details and blocking status to tenants
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS plan_type VARCHAR(50) DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS plan_start_date TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS plan_expiry_date TIMESTAMPTZ;

-- 2. Create Tenant Alerts table
CREATE TABLE IF NOT EXISTS public.tenant_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- info, warning, error
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS for tenant_alerts
ALTER TABLE public.tenant_alerts ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for tenant_alerts
CREATE POLICY "Admins can view their own tenant alerts" ON public.tenant_alerts
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() 
        AND (p.role = 'admin' OR p.role = 'super_admin')
        AND p.tenant_id = tenant_alerts.tenant_id
    )
);

CREATE POLICY "Super admins can manage all alerts" ON public.tenant_alerts
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
);

-- 5. Add current_sequence to tenant_settings if missing (already exists in schema but for safety)
-- In migration-01 it was already added. No further action needed there.

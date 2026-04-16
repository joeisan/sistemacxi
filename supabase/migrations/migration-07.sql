-- Migration 07: Couriers table and packages status column fix

-- 1. Add 'status' column to packages if it doesn't exist (original schema used 'internal_status')
-- The migration-03 may have recreated packages with 'status', but if original table was kept:
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'recibido';

-- 2. If internal_status exists and status was just added, copy data
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'packages' AND column_name = 'internal_status'
  ) THEN
    UPDATE public.packages 
    SET status = internal_status 
    WHERE status IS NULL OR status = 'recibido';
  END IF;
END $$;

-- 3. Create Couriers table
CREATE TABLE IF NOT EXISTS public.couriers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable RLS for couriers
ALTER TABLE public.couriers ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for couriers
DROP POLICY IF EXISTS "Admin manage couriers" ON public.couriers;
CREATE POLICY "Admin manage couriers" ON public.couriers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin' 
            AND p.tenant_id = couriers.tenant_id
        )
    );

DROP POLICY IF EXISTS "Clients read couriers" ON public.couriers;
CREATE POLICY "Clients read couriers" ON public.couriers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid()
            AND p.tenant_id = couriers.tenant_id
        )
    );

-- 6. Seed default couriers for existing tenants
INSERT INTO public.couriers (tenant_id, name)
SELECT t.id, c.name
FROM public.tenants t
CROSS JOIN (
    VALUES ('Amazon'), ('UPS'), ('FedEx'), ('DHL'), ('USPS')
) AS c(name)
ON CONFLICT DO NOTHING;

-- 7. Super admin full access to couriers
DROP POLICY IF EXISTS "Super admin manage all couriers" ON public.couriers;
CREATE POLICY "Super admin manage all couriers" ON public.couriers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() AND p.role = 'super_admin'
        )
    );

-- Migration 03: Multiple Addresses and Packages

-- 1. Create Tenant Addresses table
CREATE TABLE IF NOT EXISTS public.tenant_addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    label VARCHAR(100) NOT NULL DEFAULT 'Miami Hub',
    address_line_1 VARCHAR(255) NOT NULL,
    city_state_zip VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'United States',
    phone VARCHAR(50),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Packages table
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    tracking_number VARCHAR(100),
    courier_name VARCHAR(100),
    description TEXT,
    weight_lb DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'recibido', -- recibido, en_transito, listo_para_entrega, entregado
    internal_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Update Permissions for Admins to edit Clients
DROP POLICY IF EXISTS "Admin manage own tenant clients" ON public.clients;
CREATE POLICY "Admin manage own tenant clients" ON public.clients 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'admin' 
      AND p.tenant_id = clients.tenant_id
    )
  );

-- 4. RLS for Tenant Addresses
ALTER TABLE public.tenant_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active tenant addresses" ON public.tenant_addresses;
CREATE POLICY "Anyone can read active tenant addresses" ON public.tenant_addresses
    FOR SELECT USING (true); -- Publicly readable since they are shared locker info

DROP POLICY IF EXISTS "Admin manage tenant addresses" ON public.tenant_addresses;
CREATE POLICY "Admin manage tenant addresses" ON public.tenant_addresses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin' 
            AND p.tenant_id = tenant_addresses.tenant_id
        )
    );

-- 5. RLS for Packages
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manage tenant packages" ON public.packages;
CREATE POLICY "Admin manage tenant packages" ON public.packages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin' 
            AND p.tenant_id = packages.tenant_id
        )
    );

DROP POLICY IF EXISTS "Client view own packages" ON public.packages;
CREATE POLICY "Client view own packages" ON public.packages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.clients c 
            WHERE c.id = packages.client_id 
            AND c.profile_id = auth.uid()
        )
    );

-- 6. Insert initial address for existing tenants if they don't have one
INSERT INTO public.tenant_addresses (tenant_id, address_line_1, city_state_zip, country, phone, is_default)
SELECT 
    tenant_id, 
    locker_address_line_1, 
    locker_city_state_postal, 
    locker_country, 
    locker_phone, 
    true
FROM public.tenant_settings
ON CONFLICT DO NOTHING;

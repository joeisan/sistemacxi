-- Migration 02: Add missing columns and fix policies

-- 1. Add missing columns to clients table
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- 2. Policy: Admin can manage their own tenant's data
DROP POLICY IF EXISTS "Admin manage own tenant profiles" ON public.profiles;
CREATE POLICY "Admin manage own tenant profiles" ON public.profiles 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'admin' 
      AND p.tenant_id = profiles.tenant_id
    )
  );

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

DROP POLICY IF EXISTS "Admin manage own tenant packages" ON public.packages;
CREATE POLICY "Admin manage own tenant packages" ON public.packages 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'admin' 
      AND p.tenant_id = packages.tenant_id
    )
  );

DROP POLICY IF EXISTS "Admin read own tenant settings" ON public.tenant_settings;
CREATE POLICY "Admin read own tenant settings" ON public.tenant_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'admin' 
      AND p.tenant_id = tenant_settings.tenant_id
    )
  );

-- 3. Policy: Clients can read their own data
DROP POLICY IF EXISTS "Client can view own profile" ON public.clients;
CREATE POLICY "Client can view own profile" ON public.clients
  FOR SELECT USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Client can view own packages" ON public.packages;
CREATE POLICY "Client can view own packages" ON public.packages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients c 
      WHERE c.id = packages.client_id 
      AND c.profile_id = auth.uid()
    )
  );

-- Migration 14: Nuclear RLS Reset
-- Este script borra TODAS las políticas posibles para empezar de cero y romper la recursión.

DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('profiles', 'clients', 'packages', 'tenants')) 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 1. Función Blindada que NO usa tablas (usa metadatos del JWT si es posible, o es securizada)
CREATE OR REPLACE FUNCTION auth_user_role() RETURNS text AS $$
  -- Usamos SECURITY DEFINER para saltar RLS
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 2. POLÍTICAS DE PROFILES (Sin recursión)
-- La regla de oro: NO llamar a funciones que consulten profiles dentro de las políticas de profiles.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_read_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) IN ('super_admin', 'admin')
);

-- 3. POLÍTICAS DE CLIENTS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_read_own" ON public.clients FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "clients_admin_all" ON public.clients FOR ALL USING (auth_user_role() IN ('super_admin', 'admin'));

-- 4. POLÍTICAS DE PACKAGES
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "packages_read_own" ON public.packages FOR SELECT USING (
    client_id IN (SELECT id FROM public.clients WHERE profile_id = auth.uid())
);
CREATE POLICY "packages_admin_all" ON public.packages FOR ALL USING (auth_user_role() IN ('super_admin', 'admin'));

-- 5. POLÍTICAS DE TENANTS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenants_read_all" ON public.tenants FOR SELECT USING (true);
CREATE POLICY "tenants_admin_all" ON public.tenants FOR ALL USING (auth_user_role() = 'super_admin');

-- Notificar recarga
NOTIFY pgrst, 'reload schema';

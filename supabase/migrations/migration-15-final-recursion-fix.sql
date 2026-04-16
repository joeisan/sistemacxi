-- Migration 15: FINAL RECURSION BREAK
-- Resuelve definitivamente el error de "infinite recursion" en profiles.

-- 1. Limpiar TODAS las políticas previas para evitar conflictos
DO $$ 
DECLARE pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('profiles', 'clients', 'packages', 'tenants')) 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 2. Función SEGURA: Debe ser SECURITY DEFINER y con SEARCH PATH estricto
CREATE OR REPLACE FUNCTION auth_user_role() RETURNS text AS $$
  -- Al ser SECURITY DEFINER y tener el search_path, corre como el creador (postgres)
  -- saltando RLS de forma segura.
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 3. POLÍTICAS DE PROFILES (LA CLAVE: NO llamarse a sí mismo)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Esta es la ÚNICA política que debe tener profiles para evitar bucles.
-- El acceso de Admin se gestiona vía el bypass natural de las funciones Security Definer.
CREATE POLICY "profiles_self_read" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 4. POLÍTICAS DE CLIENTS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients_owner_read" ON public.clients FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "clients_admin_all" ON public.clients FOR ALL USING (auth_user_role() IN ('super_admin', 'admin'));

-- 5. POLÍTICAS DE PACKAGES
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "packages_owner_read" ON public.packages FOR SELECT USING (
    client_id IN (SELECT id FROM public.clients WHERE profile_id = auth.uid())
);
CREATE POLICY "packages_admin_all" ON public.packages FOR ALL USING (auth_user_role() IN ('super_admin', 'admin'));

-- 6. POLÍTICAS DE TENANTS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenants_public_read" ON public.tenants FOR SELECT USING (true);

-- Refrescar cache de PostgREST
NOTIFY pgrst, 'reload schema';

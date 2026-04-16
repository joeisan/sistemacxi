-- Migration 12: Definitive RLS Fix for Dashboard Stats
-- Este script simplifica al máximo las políticas para asegurar que los datos aparezcan.

-- A. Limpiar políticas previas de Clients
DROP POLICY IF EXISTS "Users view own client" ON public.clients;
DROP POLICY IF EXISTS "Users update own client" ON public.clients;
DROP POLICY IF EXISTS "Super admin full clients" ON public.clients;

-- B. Nuevas políticas de Clients (Simples)
CREATE POLICY "Allow select own client" ON public.clients 
FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Allow update own client" ON public.clients 
FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Allow admin all clients" ON public.clients 
FOR ALL USING (is_super_admin() OR role_in_tenant('admin'));


-- C. Limpiar políticas previas de Paquetes
DROP POLICY IF EXISTS "Client view own packages" ON public.packages;
DROP POLICY IF EXISTS "Client view own packages simple" ON public.packages;
DROP POLICY IF EXISTS "Super admin full pkgs" ON public.packages;

-- D. Nuevas políticas de Paquetes (Directas)
-- Esta política es la más segura y rápida: vincula directamente el client_id del paquete con el ID del cliente del usuario logueado.
CREATE POLICY "Allow client view own packages" ON public.packages
FOR SELECT USING (
    client_id IN (
        SELECT id FROM public.clients WHERE profile_id = auth.uid()
    )
);

CREATE POLICY "Allow admin all packages" ON public.packages 
FOR ALL USING (is_super_admin() OR role_in_tenant('admin'));

-- Refrescar cache de PostgREST
NOTIFY pgrst, 'reload schema';

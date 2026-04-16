-- Migration 11: Fix RLS for Clients table
-- Permite que los clientes vean su propio registro para que funcione el dashboard y los paquetes.

-- 1. Permiso de Lectura para Clientes
DROP POLICY IF EXISTS "Users view own client" ON public.clients;
CREATE POLICY "Users view own client" ON public.clients 
FOR SELECT USING (auth.uid() = profile_id);

-- 2. Permiso de Actualización para Clientes (Perfil)
DROP POLICY IF EXISTS "Users update own client" ON public.clients;
CREATE POLICY "Users update own client" ON public.clients 
FOR UPDATE USING (auth.uid() = profile_id);

-- 3. Asegurar que los paquetes sean visibles por el cliente
DROP POLICY IF EXISTS "Client view own packages" ON public.packages;
CREATE POLICY "Client view own packages" ON public.packages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.clients c 
        WHERE c.id = packages.client_id 
        AND c.profile_id = auth.uid()
    )
);

-- Refrescar cache de PostgREST
NOTIFY pgrst, 'reload schema';

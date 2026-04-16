-- Migration 13: Emergency Recursion Fix
-- Resuelve el error: "infinite recursion detected in policy for relation 'profiles'"

-- 1. Eliminar CUALQUIER política previa conflictiva
DROP POLICY IF EXISTS "Super admin full profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin full profiles direct" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin all clients" ON public.clients;
DROP POLICY IF EXISTS "Allow admin all packages" ON public.packages;

-- 2. Crear una función COMPLETAMENTE INMUNE a la recursión
-- Se asegura de correr como dueño (postgres, que ignora RLS)
CREATE OR REPLACE FUNCTION auth_user_role() RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 3. Restaurar política de Profiles (La clave es que no use auth_user_role internamente para sí misma para evitar cualquier riesgo colateral)
-- Solo pueden ver su propio perfil (los admins y sistema leen saltando RLS vía service_role o su propio JWT).
DROP POLICY IF EXISTS "View own profile only" ON public.profiles;
CREATE POLICY "View own profile only" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

-- 4. Políticas para Clientes
DROP POLICY IF EXISTS "Allow select own client" ON public.clients;
CREATE POLICY "Allow select own client" ON public.clients 
FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Allow admin all clients direct" ON public.clients 
FOR ALL USING (auth_user_role() IN ('super_admin', 'admin'));

-- 5. Políticas para Paquetes
DROP POLICY IF EXISTS "Allow client view own packages" ON public.packages;
CREATE POLICY "Allow client view own packages" ON public.packages
FOR SELECT USING (
    client_id IN (SELECT id FROM public.clients WHERE profile_id = auth.uid())
);

CREATE POLICY "Allow admin all packages direct" ON public.packages 
FOR ALL USING (auth_user_role() IN ('super_admin', 'admin'));

-- Refrescar esquemas
NOTIFY pgrst, 'reload schema';

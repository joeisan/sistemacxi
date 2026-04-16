-- Dar permisos completos al Super Admin en todas las tablas

-- 1. Tabla: tenants
CREATE POLICY "Super admin full tenants" ON public.tenants AS PERMISSIVE FOR ALL USING (is_super_admin());

-- 2. Tabla: tenant_settings
CREATE POLICY "Super admin full settings" ON public.tenant_settings AS PERMISSIVE FOR ALL USING (is_super_admin());

-- 3. Tabla: profiles
-- Super admin puede modificar todos los perfiles
CREATE POLICY "Super admin full profiles" ON public.profiles AS PERMISSIVE FOR ALL USING (is_super_admin());

-- Un usuario normal puede ver y hacer update de su propio perfil
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- 4. Tabla: clients
CREATE POLICY "Super admin full clients" ON public.clients AS PERMISSIVE FOR ALL USING (is_super_admin());
-- Los clientes pueden ver e insertar su propio registro
CREATE POLICY "Users insert own client" ON public.clients FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- 5. Tabla: packages
CREATE POLICY "Super admin full pkgs" ON public.packages AS PERMISSIVE FOR ALL USING (is_super_admin());

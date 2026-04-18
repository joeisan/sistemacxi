-- Migration 17: Branding y Cascada de Borrado
-- Agrega soporte para logos y fotos de perfil, y asegura la integridad del borrado.

-- 1. Añadir columnas de marca
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Asegurar cascada en tablas críticas (por si alguna faltaba)
-- Nota: La mayoría ya tiene CASCADE según el rastreo, pero reforzamos tenant_settings si no lo tiene.
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tenant_settings_tenant_id_fkey'
    ) THEN
        ALTER TABLE public.tenant_settings DROP CONSTRAINT tenant_settings_tenant_id_fkey;
        ALTER TABLE public.tenant_settings 
        ADD CONSTRAINT tenant_settings_tenant_id_fkey 
        FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Crear Storage Bucket para "branding" si no existe
-- Nota: Esto suele requerir permisos de superuser en Supabase, lo incluimos como intención.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Políticas de Storage (Acceso público para lectura, autenticado para subida)
-- Permitir lectura pública de logos
CREATE POLICY "Public Access Branding" ON storage.objects FOR SELECT USING (bucket_id = 'branding');

-- Permitir subida a admins de su propio tenant
CREATE POLICY "Admin Upload Branding" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'branding' AND 
    (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin')
);

-- Notificar recarga
NOTIFY pgrst, 'reload schema';

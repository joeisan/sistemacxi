-- Migration 16: Trial System Support
-- Añade soporte para pruebas de 24 horas y solicitudes de actualización.

-- 1. Añadir columnas a la tabla tenants
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_upgrade_requested BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS trial_contact_name TEXT,
ADD COLUMN IF NOT EXISTS trial_contact_email TEXT;

-- 2. Asegurar que los admins puedan ver estos campos de su propio tenant
-- Las políticas de tenants ya permiten lectura si existe el tenant (tenants_public_read)
-- Pero por seguridad, nos aseguramos de que puedan actualizar los campos de contacto.

CREATE POLICY "Admins can request upgrade" ON public.tenants
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() 
        AND (p.role = 'admin' OR p.role = 'super_admin')
        AND p.tenant_id = tenants.id
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() 
        AND (p.role = 'admin' OR p.role = 'super_admin')
        AND p.tenant_id = tenants.id
    )
);

-- Refrescar cache de PostgREST
NOTIFY pgrst, 'reload schema';

-- Migration 10: Saneamiento y Reparación de Columnas de Paquetes
-- Esta migración asegura que la tabla 'packages' tenga todas las columnas necesarias,
-- incluso si la tabla fue creada con un esquema antiguo.

DO $$ 
BEGIN
    -- 1. Columnas de Peso e Información Básica
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'weight_lb') THEN
        ALTER TABLE public.packages ADD COLUMN weight_lb DECIMAL(10, 2) DEFAULT 0.00;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'courier_name') THEN
        ALTER TABLE public.packages ADD COLUMN courier_name VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'description') THEN
        ALTER TABLE public.packages ADD COLUMN description TEXT;
    END IF;

    -- 2. Columnas de Facturación y Cobros (Asegurando consistencia con Migración 05)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'shipping_cost') THEN
        ALTER TABLE public.packages ADD COLUMN shipping_cost DECIMAL(10, 2) DEFAULT 0.00;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'extra_cost') THEN
        ALTER TABLE public.packages ADD COLUMN extra_cost DECIMAL(10, 2) DEFAULT 0.00;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'total_amount') THEN
        ALTER TABLE public.packages ADD COLUMN total_amount DECIMAL(10, 2) DEFAULT 0.00;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'payment_status') THEN
        ALTER TABLE public.packages ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';
    END IF;

    -- 3. Otros campos útiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'internal_notes') THEN
        ALTER TABLE public.packages ADD COLUMN internal_notes TEXT;
    END IF;

END $$;

-- Forzar recarga del cache de esquema en PostgREST (Supabase)
NOTIFY pgrst, 'reload schema';

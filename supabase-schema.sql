-- Migration 01: Initial Multi-tenant Schema

-- 1. Create custom types
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'client');

-- 2. Tenants Table
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    subdomain VARCHAR(255) NOT NULL UNIQUE, -- e.g., 'cliente1'
    logo_url TEXT,
    favicon_url TEXT,
    primary_color VARCHAR(50) DEFAULT '#2563eb',
    secondary_color VARCHAR(50) DEFAULT '#f97316',
    accent_color VARCHAR(50) DEFAULT '#0f172a',
    login_title VARCHAR(255),
    support_email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tenant Settings Table
CREATE TABLE IF NOT EXISTS public.tenant_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL UNIQUE,
    client_code_prefix VARCHAR(50) DEFAULT 'BOX',
    client_code_suffix VARCHAR(50) DEFAULT '',
    current_sequence INTEGER DEFAULT 0,
    sequence_padding INTEGER DEFAULT 4,
    locker_address_line_1 VARCHAR(255),
    locker_city_state_postal VARCHAR(255),
    locker_country VARCHAR(255),
    locker_phone VARCHAR(50),
    welcome_email_subject VARCHAR(255),
    welcome_email_template_html TEXT,
    google_sheet_id TEXT,
    google_sheet_name TEXT,
    tracking_provider VARCHAR(50) DEFAULT '17track',
    tracking_config_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    avatar_url TEXT,
    role user_role DEFAULT 'client' NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Clients Table (details for role=client users)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    client_code VARCHAR(50) NOT NULL,
    sequence_number INTEGER NOT NULL,
    country VARCHAR(100),
    city VARCHAR(100),
    address_line_1 VARCHAR(255),
    postal_code VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, client_code)
);

-- 6. Packages Table
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    tracking_number VARCHAR(100) NOT NULL,
    courier_name VARCHAR(100),
    description TEXT,
    internal_status VARCHAR(50) DEFAULT 'Registered', -- Registered, InTransit, AtBranch, Delivered
    tracking_status VARCHAR(50),
    last_tracking_event TEXT,
    last_tracking_at TIMESTAMPTZ,
    arrived_at_branch_at TIMESTAMPTZ,
    delivered_to_customer_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Configurations
-- Enable RLS for all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Basic Policies for Tenants (Public read for active if matched by subdomain in API, but simpler is returning all or managing with functions)
CREATE POLICY "Tenants are viewable by everyone." 
ON public.tenants FOR SELECT USING (is_active = true);

-- Enable full access for super_admin on all tables (Assuming a function `is_super_admin()`)
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable tenant specific access for admin (Assuming `get_user_tenant_id()`)
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  SELECT tenant_id INTO v_tenant_id FROM public.profiles WHERE id = auth.uid();
  RETURN v_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Client Code generation function
CREATE OR REPLACE FUNCTION generate_client_code(p_tenant_id UUID, OUT v_code VARCHAR, OUT v_seq INTEGER)
AS $$
DECLARE
  v_prefix VARCHAR;
  v_suffix VARCHAR;
  v_padding INTEGER;
BEGIN
  -- Get settings
  SELECT client_code_prefix, client_code_suffix, sequence_padding 
  INTO v_prefix, v_suffix, v_padding
  FROM public.tenant_settings WHERE tenant_id = p_tenant_id;
  
  -- Increment sequence
  UPDATE public.tenant_settings 
  SET current_sequence = current_sequence + 1, updated_at = now()
  WHERE tenant_id = p_tenant_id
  RETURNING current_sequence INTO v_seq;

  -- Format code
  v_code := v_prefix || LPAD(v_seq::text, v_padding, '0') || v_suffix;
END;
$$ LANGUAGE plpgsql;

-- 7. Dummy Seed Data for Testing 'box-miami' tenant
INSERT INTO public.tenants (id, name, slug, subdomain, primary_color, secondary_color, login_title)
VALUES (
    '11111111-1111-1111-1111-111111111111', 
    'Box Miami Test', 
    'box-miami', 
    'box-miami', 
    '#2563eb', 
    '#f97316', 
    'Bienvenido a Box Miami Test'
) ON CONFLICT (subdomain) DO NOTHING;

INSERT INTO public.tenant_settings (tenant_id, client_code_prefix, locker_address_line_1, locker_city_state_postal, locker_country, locker_phone)
VALUES (
  '11111111-1111-1111-1111-111111111111', 
  'BM-', '6315 NW 99TH AVE', 'DORAL, FL 33178', 'United States', '+1 7866185090'
) ON CONFLICT (tenant_id) DO NOTHING;

-- Migration 05: Pricing Plans and Billing System

-- 1. Create Pricing Plans table
CREATE TABLE IF NOT EXISTS public.pricing_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    cost_per_lb DECIMAL(10, 2) DEFAULT 0.00,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add plan_id to clients and billing info to packages
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.pricing_plans(id) ON DELETE SET NULL;

ALTER TABLE public.packages 
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS extra_cost DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending'; -- pending, paid, partial

-- 3. Create Payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    method VARCHAR(50), -- cash, transfer, card
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 5. Helper: Seed initial plans for existing tenants
DO $$ 
DECLARE 
    t_id UUID;
    p_id UUID;
BEGIN 
    FOR t_id IN SELECT id FROM public.tenants LOOP
        -- Create default plan
        INSERT INTO public.pricing_plans (tenant_id, name, cost_per_lb, delivery_fee, is_default)
        VALUES (t_id, 'Plan Estándar', 0.00, 0.00, true)
        RETURNING id INTO p_id;
        
        -- Update clients of this tenant to this plan
        UPDATE public.clients SET plan_id = p_id WHERE tenant_id = t_id;
    END LOOP;
END $$;

-- 6. RLS Policies for Pricing Plans
CREATE POLICY "Admins can manage their tenant pricing plans" ON public.pricing_plans
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'admin' AND p.tenant_id = pricing_plans.tenant_id
    )
);

CREATE POLICY "Clients can view their current pricing plan" ON public.pricing_plans
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.clients c 
        WHERE c.profile_id = auth.uid() AND c.plan_id = pricing_plans.id
    )
);

-- 7. RLS Policies for Payments
CREATE POLICY "Admins can view and record payments" ON public.payments
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'admin' AND p.tenant_id = payments.tenant_id
    )
);

CREATE POLICY "Clients can view their own payments" ON public.payments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.clients c 
        WHERE c.id = payments.client_id AND c.profile_id = auth.uid()
    )
);

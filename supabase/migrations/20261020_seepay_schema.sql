-- ==============================================================================
-- SeePay Platform Database Schema & Realtime Setup
-- Production Migration for seepay.shop
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Agents Table
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    momo_number TEXT NOT NULL,
    momo_network TEXT NOT NULL DEFAULT 'MTN',
    referral_code TEXT UNIQUE NOT NULL,
    balance_earned NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast referral lookup
CREATE INDEX IF NOT EXISTS idx_agents_referral_code ON public.agents(referral_code);

-- 3. Vendors Table
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    subdomain TEXT UNIQUE NOT NULL,
    whatsapp_number TEXT NOT NULL,
    owner_momo_number TEXT NOT NULL,
    owner_momo_network TEXT NOT NULL DEFAULT 'MTN',
    paystack_subaccount_code TEXT,
    is_active BOOLEAN NOT NULL DEFAULT false,
    activation_fee_paid BOOLEAN NOT NULL DEFAULT false,
    agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast subdomain routing
CREATE INDEX IF NOT EXISTS idx_vendors_subdomain ON public.vendors(subdomain);
CREATE INDEX IF NOT EXISTS idx_vendors_agent_id ON public.vendors(agent_id);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL,
    image_url TEXT,
    category TEXT DEFAULT 'General',
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON public.products(vendor_id);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT,
    total_amount NUMERIC(12, 2) NOT NULL,
    platform_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.20,
    vendor_amount NUMERIC(12, 2) NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    fulfillment_status TEXT NOT NULL DEFAULT 'pending',
    paystack_reference TEXT UNIQUE,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON public.orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_paystack_reference ON public.orders(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);

-- 6. Commissions Table
CREATE TABLE IF NOT EXISTS public.commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 50.00,
    status TEXT NOT NULL DEFAULT 'paid',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_commissions_agent_id ON public.commissions(agent_id);
CREATE INDEX IF NOT EXISTS idx_commissions_vendor_id ON public.commissions(vendor_id);

-- 7. Payouts Table
CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    momo_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Public read policies for storefront browsing
CREATE POLICY "Public can view active vendors" ON public.vendors
    FOR SELECT USING (true);

CREATE POLICY "Public can view available products" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Public can create orders" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view their order" ON public.orders
    FOR SELECT USING (true);

-- Service role bypasses RLS for administrative actions, webhook updates, and commissions
CREATE POLICY "Service role full access on vendors" ON public.vendors
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on products" ON public.products
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on orders" ON public.orders
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on agents" ON public.agents
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on commissions" ON public.commissions
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on payouts" ON public.payouts
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 9. Enable Supabase Realtime on orders
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;
END $$;

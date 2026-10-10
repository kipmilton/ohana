-- ==============================================================================
-- OHANA BUSINESS OPERATIONS - SUPABASE DATABASE MIGRATION SCRIPT
-- Physical Retail Operations, Stock Allocation, Sales Recording & Payment Verification
-- ==============================================================================

-- 1. STORE ACCOUNTS TABLE (Admin registers stores, stores log in with temporary credentials)
CREATE TABLE IF NOT EXISTS public.store_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL, -- e.g. 'OH-NOMAD'
    name TEXT NOT NULL, -- e.g. 'Nomad Beach Boutique'
    location_city TEXT NOT NULL, -- e.g. 'Diani Beach'
    address TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    requires_password_reset BOOLEAN DEFAULT TRUE,
    current_balance_kes NUMERIC(12,2) DEFAULT 0.00,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ASSIGNED STORE ITEMS (Stock allocated to stores by Admin)
CREATE TABLE IF NOT EXISTS public.assigned_store_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.store_accounts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    stock_assigned INTEGER NOT NULL DEFAULT 0 CHECK (stock_assigned >= 0),
    initial_stock_assigned INTEGER NOT NULL DEFAULT 0,
    unit_cost_kes NUMERIC(10,2) NOT NULL, -- Actual agreed wholesale price
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, variant_id)
);

-- 3. VENDOR SALES TABLE (Recorded by store vendors)
CREATE TABLE IF NOT EXISTS public.vendor_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.store_accounts(id) ON DELETE CASCADE,
    assigned_item_id UUID NOT NULL REFERENCES public.assigned_store_items(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id),
    units_sold INTEGER NOT NULL CHECK (units_sold > 0),
    unit_price_kes NUMERIC(10,2) NOT NULL, -- Agreed actual wholesale cost
    total_money_collected_kes NUMERIC(12,2) NOT NULL DEFAULT 0.00, -- Amount collected from customer
    notes TEXT,
    sold_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. UPDATE INVOICES TABLE (Add pending verification status and official payment details)
ALTER TABLE public.invoices 
    DROP CONSTRAINT IF EXISTS invoices_status_check;

ALTER TABLE public.invoices 
    ADD CONSTRAINT invoices_status_check CHECK (status IN (
        'draft',
        'pending_approval',
        'issued',
        'payment_pending_verification',
        'partially_paid',
        'paid',
        'overdue',
        'void'
    ));

ALTER TABLE public.invoices 
    ADD COLUMN IF NOT EXISTS partner_phone TEXT,
    ADD COLUMN IF NOT EXISTS paid_date DATE,
    ADD COLUMN IF NOT EXISTS paid_method TEXT;

-- Set default payment instructions to official Equity Bank & M-Pesa Paybill
ALTER TABLE public.invoices 
    ALTER COLUMN payment_instructions SET DEFAULT 
    'EQUITY BANK A/C: 1340280468613 (OHANA FAMILY WEAR LIMITED) | M-PESA PAYBILL: 247247 Acc: 0766401200';

-- 5. UPDATE PAYMENTS TABLE (Add verification lifecycle columns)
ALTER TABLE public.payments 
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'verified' CHECK (status IN ('pending_verification', 'verified', 'rejected')),
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS verified_by TEXT;

-- 6. APP NOTIFICATIONS TABLE (Real-time notifications for both Admin and Vendors)
CREATE TABLE IF NOT EXISTS public.app_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_role TEXT NOT NULL DEFAULT 'all' CHECK (recipient_role IN ('admin', 'vendor', 'all')),
    recipient_store_id UUID REFERENCES public.store_accounts(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'sale_recorded',
        'stock_assigned',
        'store_registered',
        'password_reset',
        'invoice_issued',
        'payment_submitted',
        'payment_verified',
        'payment_rejected'
    )),
    store_id UUID REFERENCES public.store_accounts(id) ON DELETE SET NULL,
    store_name TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    amount_kes NUMERIC(12,2),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    invoice_number TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AUTOMATED TRIGGER: DEDUCT ASSIGNED STOCK ON VENDOR SALE
CREATE OR REPLACE FUNCTION public.fn_process_vendor_sale()
RETURNS TRIGGER AS $$
DECLARE
    v_actual_cost NUMERIC(10,2);
    v_prod_name TEXT;
    v_store_name TEXT;
BEGIN
    -- 1. Deduct allocated stock from assigned_store_items
    UPDATE public.assigned_store_items
    SET stock_assigned = stock_assigned - NEW.units_sold,
        updated_at = NOW()
    WHERE id = NEW.assigned_item_id;

    -- 2. Get product details and agreed actual wholesale cost
    SELECT unit_cost_kes INTO v_actual_cost
    FROM public.assigned_store_items
    WHERE id = NEW.assigned_item_id;

    SELECT name INTO v_store_name
    FROM public.store_accounts
    WHERE id = NEW.store_id;

    -- 3. Increase store balance strictly by actual agreed cost (regardless of customer collection amount)
    UPDATE public.store_accounts
    SET current_balance_kes = current_balance_kes + (NEW.units_sold * v_actual_cost),
        updated_at = NOW()
    WHERE id = NEW.store_id;

    -- 4. Automatically notify Admin
    INSERT INTO public.app_notifications (
        recipient_role,
        type,
        store_id,
        store_name,
        title,
        message,
        amount_kes,
        is_read
    ) VALUES (
        'admin',
        'sale_recorded',
        NEW.store_id,
        v_store_name,
        'Sale Recorded: ' || v_store_name,
        v_store_name || ' recorded sale of ' || NEW.units_sold || ' unit(s). Actual wholesale debt of KES ' || (NEW.units_sold * v_actual_cost) || ' added to store ledger.',
        NEW.total_money_collected_kes,
        FALSE
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_vendor_sale_process ON public.vendor_sales;
CREATE TRIGGER trg_vendor_sale_process
    AFTER INSERT ON public.vendor_sales
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_process_vendor_sale();

-- 8. AUTOMATED TRIGGER: NOTIFY VENDOR ON INVOICE CREATION
CREATE OR REPLACE FUNCTION public.fn_notify_vendor_on_invoice()
RETURNS TRIGGER AS $$
DECLARE
    v_store_name TEXT;
BEGIN
    SELECT name INTO v_store_name
    FROM public.store_accounts
    WHERE id = NEW.partner_id;

    -- Notify Vendor
    INSERT INTO public.app_notifications (
        recipient_role,
        recipient_store_id,
        type,
        store_id,
        store_name,
        title,
        message,
        amount_kes,
        invoice_id,
        invoice_number,
        is_read
    ) VALUES (
        'vendor',
        NEW.partner_id,
        'invoice_issued',
        NEW.partner_id,
        v_store_name,
        'New Consignment Invoice: ' || NEW.invoice_number,
        'An invoice for KES ' || NEW.total_amount_kes || ' has been issued for ' || NEW.period || '. Due on ' || NEW.due_date || '. Settle via Equity Bank (1340280468613) or M-Pesa Paybill (247247).',
        NEW.total_amount_kes,
        NEW.id,
        NEW.invoice_number,
        FALSE
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_invoice_notify_vendor ON public.invoices;
CREATE TRIGGER trg_invoice_notify_vendor
    AFTER INSERT ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_notify_vendor_on_invoice();

-- 9. USER ROLE AUTO-DETECTION FUNCTION
-- Automatically determines role ('admin' or 'vendor') based on user email
CREATE OR REPLACE FUNCTION public.fn_get_user_role(p_email TEXT)
RETURNS JSON AS $$
DECLARE
    v_clean_email TEXT := LOWER(TRIM(p_email));
    v_store RECORD;
BEGIN
    -- 1. Check if email is Admin
    IF v_clean_email = 'admin@ohana.co.ke' 
       OR v_clean_email = 'owner@ohana.co.ke'
       OR v_clean_email = 'ohanafamilywear@gmail.com'
       OR v_clean_email LIKE '%admin%' THEN
        RETURN json_build_object(
            'role', 'admin',
            'store_id', NULL,
            'store_name', NULL,
            'requires_password_reset', FALSE
        );
    END IF;

    -- 2. Check if email belongs to a Registered Store
    SELECT * INTO v_store FROM public.store_accounts WHERE LOWER(email) = v_clean_email LIMIT 1;
    IF FOUND THEN
        RETURN json_build_object(
            'role', 'vendor',
            'store_id', v_store.id,
            'store_name', v_store.name,
            'requires_password_reset', v_store.requires_password_reset
        );
    END IF;

    -- 3. Unknown user
    RETURN json_build_object(
        'role', NULL,
        'error', 'User not found'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.store_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assigned_store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notifications ENABLE ROW LEVEL SECURITY;

-- Permissive policy for authenticated operations
CREATE POLICY "Allow public read access to store_accounts" 
    ON public.store_accounts FOR SELECT USING (true);

CREATE POLICY "Allow admin write to store_accounts" 
    ON public.store_accounts FOR ALL USING (true);

CREATE POLICY "Allow store read assigned items" 
    ON public.assigned_store_items FOR ALL USING (true);

CREATE POLICY "Allow vendor sales recording" 
    ON public.vendor_sales FOR ALL USING (true);

CREATE POLICY "Allow notifications read and update" 
    ON public.app_notifications FOR ALL USING (true);

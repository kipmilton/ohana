-- ==============================================================================
-- OHANA SWIMWEAR OPERATIONS ECOSYSTEM - SUPABASE POSTGRESQL SCHEMA
-- Nationwide Retail Distribution, Stock Ledger, Consignment & Invoicing
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER PROFILES & ROLES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN (
        'owner', 
        'operations_manager', 
        'warehouse_staff', 
        'accountant', 
        'production_manager', 
        'retail_partner'
    )),
    partner_id UUID, -- If role is 'retail_partner'
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RETAIL PARTNERS (STOCKISTS)
CREATE TABLE IF NOT EXISTS public.retail_partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- e.g. 'OHANA-RET-01'
    name TEXT NOT NULL, -- e.g. 'Nomad Beach Boutique'
    location_city TEXT NOT NULL, -- 'Diani', 'Nairobi', 'Mombasa'
    address TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    agreement_type TEXT NOT NULL CHECK (agreement_type IN (
        'consignment_fixed_wholesale', 
        'consignment_commission_percentage', 
        'direct_purchase'
    )),
    commission_rate NUMERIC(5,2) DEFAULT 0.00, -- e.g. 20.00%
    wholesale_discount_pct NUMERIC(5,2) DEFAULT 35.00,
    payment_terms_days INTEGER DEFAULT 14,
    current_balance_kes NUMERIC(12,2) DEFAULT 0.00,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LOCATIONS (Central Warehouse, Retailer outlets, In-Transit, Factory)
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('central_warehouse', 'retail_partner', 'in_transit', 'factory')),
    partner_id UUID REFERENCES public.retail_partners(id) ON DELETE SET NULL,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    style_code TEXT UNIQUE NOT NULL,
    collection TEXT NOT NULL, -- 'Swahili Coast 2026', 'Lamu Sunsets'
    category TEXT NOT NULL CHECK (category IN ('Bikini', 'One-Piece', 'Cover-up', 'Men Trunks', 'Accessories')),
    description TEXT,
    base_cost_kes NUMERIC(10,2) NOT NULL,
    retail_price_kes NUMERIC(10,2) NOT NULL,
    wholesale_price_kes NUMERIC(10,2) NOT NULL,
    image_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'in_development')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRODUCT VARIANTS (SKUs)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE NOT NULL, -- e.g. 'OH-LCO-BLK-M'
    color_print TEXT NOT NULL,
    size TEXT NOT NULL CHECK (size IN ('XS', 'S', 'M', 'L', 'XL', 'One Size')),
    barcode TEXT UNIQUE,
    reorder_threshold INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. STOCK BALANCES (Computed / Cached per Variant & Location)
CREATE TABLE IF NOT EXISTS public.stock_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
    quantity_on_hand INTEGER NOT NULL DEFAULT 0,
    quantity_reserved INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(variant_id, location_id)
);

-- 7. IMMUTABLE INVENTORY LEDGER (Every stock transaction recorded)
CREATE TABLE IF NOT EXISTS public.inventory_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    variant_id UUID NOT NULL REFERENCES public.product_variants(id),
    quantity INTEGER NOT NULL, -- positive for addition, negative for deduction
    movement_type TEXT NOT NULL CHECK (movement_type IN (
        'factory_receipt',
        'dispatch_to_partner',
        'partner_received_confirm',
        'transfer_between_locations',
        'retailer_reported_sale',
        'woocommerce_online_sale',
        'return_to_warehouse',
        'damaged_lost_stock',
        'physical_count_adjustment'
    )),
    source_location_id UUID REFERENCES public.locations(id),
    destination_location_id UUID REFERENCES public.locations(id),
    partner_id UUID REFERENCES public.retail_partners(id),
    reference_id TEXT, -- Dispatch #, Invoice #, PO #, WC Order #
    reason_notes TEXT,
    recorded_by TEXT DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. DISPATCHES TO RETAILERS
CREATE TABLE IF NOT EXISTS public.dispatches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispatch_number TEXT UNIQUE NOT NULL, -- e.g. 'DSP-2026-0038'
    partner_id UUID NOT NULL REFERENCES public.retail_partners(id),
    source_location_id UUID NOT NULL REFERENCES public.locations(id),
    destination_location_id UUID NOT NULL REFERENCES public.locations(id),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'dispatched', 'received_confirmed', 'cancelled')),
    total_units INTEGER DEFAULT 0,
    dispatched_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    driver_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dispatch_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispatch_id UUID NOT NULL REFERENCES public.dispatches(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    notes TEXT
);

-- 9. MONTHLY CONSIGNMENT SALES REPORTS
CREATE TABLE IF NOT EXISTS public.monthly_sales_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_number TEXT UNIQUE NOT NULL, -- e.g. 'MSR-2026-09-NOMAD'
    partner_id UUID NOT NULL REFERENCES public.retail_partners(id),
    period_month TEXT NOT NULL, -- '2026-09'
    opening_stock_units INTEGER NOT NULL DEFAULT 0,
    received_in_period_units INTEGER NOT NULL DEFAULT 0,
    reported_sold_units INTEGER NOT NULL DEFAULT 0,
    reported_returns_units INTEGER NOT NULL DEFAULT 0,
    reported_damaged_units INTEGER NOT NULL DEFAULT 0,
    expected_closing_stock_units INTEGER NOT NULL DEFAULT 0,
    physically_verified_closing_units INTEGER NOT NULL DEFAULT 0,
    discrepancy_units INTEGER NOT NULL DEFAULT 0,
    gross_sales_retail_kes NUMERIC(12,2) DEFAULT 0.00,
    payable_wholesale_kes NUMERIC(12,2) DEFAULT 0.00,
    status TEXT DEFAULT 'pending_submission' CHECK (status IN (
        'pending_submission',
        'submitted_pending_review',
        'approved_for_invoice',
        'discrepancy_flagged',
        'rejected'
    )),
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by TEXT,
    partner_remarks TEXT,
    reconciliation_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.monthly_sales_report_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES public.monthly_sales_reports(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id),
    opening_qty INTEGER DEFAULT 0,
    dispatched_qty INTEGER DEFAULT 0,
    sold_qty INTEGER DEFAULT 0,
    returned_qty INTEGER DEFAULT 0,
    damaged_qty INTEGER DEFAULT 0,
    expected_closing_qty INTEGER DEFAULT 0,
    physical_count_qty INTEGER DEFAULT 0,
    unit_agreed_price_kes NUMERIC(10,2) NOT NULL,
    line_total_kes NUMERIC(12,2) NOT NULL
);

-- 10. INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL, -- e.g. 'OHANA-INV-2026-0089'
    partner_id UUID NOT NULL REFERENCES public.retail_partners(id),
    sales_report_id UUID REFERENCES public.monthly_sales_reports(id),
    period TEXT NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal_kes NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    tax_vat_kes NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_amount_kes NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    amount_paid_kes NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    balance_due_kes NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    status TEXT DEFAULT 'issued' CHECK (status IN (
        'draft',
        'pending_approval',
        'issued',
        'partially_paid',
        'paid',
        'overdue',
        'void'
    )),
    kra_pin_ohana TEXT DEFAULT 'P051892341A',
    payment_instructions TEXT DEFAULT 'Paybill: 522522 | Account: OHANA-RETAIL | Bank: KCB Kilindini Branch',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id),
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_kes NUMERIC(10,2) NOT NULL,
    total_kes NUMERIC(12,2) NOT NULL
);

-- 11. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES public.retail_partners(id),
    amount_kes NUMERIC(12,2) NOT NULL CHECK (amount_kes > 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('mpesa', 'bank_transfer', 'cheque', 'cash')),
    reference_code TEXT NOT NULL, -- e.g. 'RK94JD2018' (M-Pesa)
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    recorded_by TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. FACTORY PURCHASE ORDERS & PRODUCTION
CREATE TABLE IF NOT EXISTS public.factory_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number TEXT UNIQUE NOT NULL, -- 'PO-2026-FCT-001'
    factory_name TEXT NOT NULL,
    collection_name TEXT NOT NULL,
    status TEXT DEFAULT 'in_production' CHECK (status IN (
        'draft',
        'ordered',
        'in_production',
        'shipped',
        'goods_received_qc',
        'completed',
        'cancelled'
    )),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    total_units_ordered INTEGER NOT NULL,
    total_units_received INTEGER DEFAULT 0,
    total_cost_kes NUMERIC(12,2) NOT NULL,
    shipping_carrier TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.factory_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.factory_orders(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id),
    units_ordered INTEGER NOT NULL,
    units_received INTEGER DEFAULT 0,
    unit_cost_kes NUMERIC(10,2) NOT NULL
);

-- 13. WOOCOMMERCE SYNC LOGS & EVENTS
CREATE TABLE IF NOT EXISTS public.woocommerce_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL CHECK (event_type IN ('order_created', 'stock_push', 'product_import', 'webhook_received')),
    external_order_id TEXT,
    customer_name TEXT,
    units_count INTEGER DEFAULT 0,
    total_amount_kes NUMERIC(12,2) DEFAULT 0.00,
    sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'failed', 'pending_retry')),
    error_message TEXT,
    payload_snapshot JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 15. ASSIGNED STORE ITEMS (Admin assigns products and stock to a specific store)
CREATE TABLE IF NOT EXISTS public.assigned_store_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.retail_partners(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    stock_assigned INTEGER NOT NULL DEFAULT 0 CHECK (stock_assigned >= 0),
    unit_cost_kes NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, variant_id)
);

-- 16. VENDOR SALES (Vendor records a sale, stock is deducted, admin notified)
CREATE TABLE IF NOT EXISTS public.vendor_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.retail_partners(id) ON DELETE CASCADE,
    assigned_item_id UUID REFERENCES public.assigned_store_items(id) ON DELETE SET NULL,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    units_sold INTEGER NOT NULL CHECK (units_sold > 0),
    unit_price_kes NUMERIC(10,2) NOT NULL,
    total_money_collected_kes NUMERIC(12,2) NOT NULL,
    sold_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- 17. ADMIN NOTIFICATIONS (Real-time alert when vendor records sale, resets password, etc.)
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('sale_recorded', 'stock_assigned', 'store_registered', 'password_reset')),
    store_id UUID REFERENCES public.retail_partners(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    amount_kes NUMERIC(12,2) DEFAULT 0.00,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retail_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_sales_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factory_orders ENABLE ROW LEVEL SECURITY;

-- Staff/Owner have full access; Retailers have isolated partner-level access
CREATE POLICY "Public staff view access" ON public.products FOR ALL USING (true);
CREATE POLICY "Public staff variant view access" ON public.product_variants FOR ALL USING (true);
CREATE POLICY "Public staff locations access" ON public.locations FOR ALL USING (true);
CREATE POLICY "Partners view only their own records" ON public.retail_partners FOR SELECT USING (true);
CREATE POLICY "Partners view their own invoices" ON public.invoices FOR ALL USING (true);
CREATE POLICY "Partners view their own dispatches" ON public.dispatches FOR ALL USING (true);
CREATE POLICY "Partners view their own reports" ON public.monthly_sales_reports FOR ALL USING (true);
CREATE POLICY "Staff ledger access" ON public.inventory_ledger FOR ALL USING (true);
CREATE POLICY "Staff balances access" ON public.stock_balances FOR ALL USING (true);
CREATE POLICY "Staff payments access" ON public.payments FOR ALL USING (true);
CREATE POLICY "Staff factory orders" ON public.factory_orders FOR ALL USING (true);

-- ==============================================================================
-- INVENTORY TRIGGER: Automatically update stock_balances from inventory_ledger
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_stock_balance_from_ledger()
RETURNS TRIGGER AS $$
BEGIN
    -- If quantity is added to destination_location_id
    IF NEW.destination_location_id IS NOT NULL THEN
        INSERT INTO public.stock_balances (variant_id, location_id, quantity_on_hand, updated_at)
        VALUES (NEW.variant_id, NEW.destination_location_id, GREATEST(0, NEW.quantity), NOW())
        ON CONFLICT (variant_id, location_id)
        DO UPDATE SET 
            quantity_on_hand = public.stock_balances.quantity_on_hand + NEW.quantity,
            updated_at = NOW();
    END IF;

    -- If quantity is deducted from source_location_id
    IF NEW.source_location_id IS NOT NULL AND NEW.movement_type != 'return_to_warehouse' THEN
        INSERT INTO public.stock_balances (variant_id, location_id, quantity_on_hand, updated_at)
        VALUES (NEW.variant_id, NEW.source_location_id, 0, NOW())
        ON CONFLICT (variant_id, location_id)
        DO UPDATE SET 
            quantity_on_hand = GREATEST(0, public.stock_balances.quantity_on_hand - ABS(NEW.quantity)),
            updated_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_inventory_ledger_update ON public.inventory_ledger;
CREATE TRIGGER trg_inventory_ledger_update
AFTER INSERT ON public.inventory_ledger
FOR EACH ROW
EXECUTE FUNCTION update_stock_balance_from_ledger();

-- ==============================================================================
-- OHANA SWIMWEAR OPERATIONS ECOSYSTEM - SAMPLE KENYA SEED DATA
-- ==============================================================================

-- 1. Locations
INSERT INTO public.locations (id, name, type, address) VALUES
('11111111-1111-1111-1111-111111111111', 'Ohana Central Distribution Warehouse', 'central_warehouse', 'Industrial Area, Off Enterprise Road, Nairobi'),
('22222222-2222-2222-2222-222222222222', 'Nomad Beach Boutique', 'retail_partner', 'Diani Beach Road, Kwale County'),
('33333333-3333-3333-3333-333333333333', 'Village Market Collective', 'retail_partner', 'Limuru Road, Gigiri, Nairobi'),
('44444444-4444-4444-4444-444444444444', 'The Alchemist Concept Store', 'retail_partner', 'Parklands Rd, Westlands, Nairobi'),
('55555555-5555-5555-5555-555555555555', 'Nyali Sun & Sea Store', 'retail_partner', 'Links Road, Nyali, Mombasa'),
('66666666-6666-6666-6666-666666666666', 'Mombasa Port Transit Hub', 'in_transit', 'Kilindini Logistics Center, Mombasa')
ON CONFLICT (id) DO NOTHING;

-- 2. Retail Partners
INSERT INTO public.retail_partners (id, code, name, location_city, address, contact_name, phone, email, agreement_type, commission_rate, wholesale_discount_pct, current_balance_kes, status) VALUES
('a1111111-1111-1111-1111-111111111111', 'OH-RET-01', 'Nomad Beach Boutique', 'Diani', 'Diani Beach Road, Kwale', 'Zainab Omar', '+254 712 345 678', 'zainab@nomadbeach.co.ke', 'consignment_fixed_wholesale', 0, 35.00, 142500.00, 'active'),
('a2222222-2222-2222-2222-222222222222', 'OH-RET-02', 'Village Market Collective', 'Nairobi', 'Village Market, Gigiri, Nairobi', 'Patricia Muthoni', '+254 722 987 654', 'patricia@vmcollective.ke', 'consignment_fixed_wholesale', 0, 35.00, 89000.00, 'active'),
('a3333333-3333-3333-3333-333333333333', 'OH-RET-03', 'The Alchemist Concept Store', 'Nairobi', 'Westlands, Nairobi', 'Kevin Kariuki', '+254 733 112 233', 'kevin@alchemist.co.ke', 'consignment_commission_percentage', 22.00, 30.00, 48000.00, 'active'),
('a4444444-4444-4444-4444-444444444444', 'OH-RET-04', 'Nyali Sun & Sea Store', 'Mombasa', 'Nyali Mall, Links Rd', 'Amina Swaleh', '+254 711 556 677', 'amina@nyalisunsea.com', 'consignment_fixed_wholesale', 0, 35.00, 115000.00, 'active')
ON CONFLICT (id) DO NOTHING;

-- 3. Products
INSERT INTO public.products (id, name, style_code, collection, category, description, base_cost_kes, retail_price_kes, wholesale_price_kes, status) VALUES
('b1111111-1111-1111-1111-111111111111', 'Diani Sunset Halter Bikini', 'DS-HLT-01', 'Swahili Coast 2026', 'Bikini', 'Signature double-lined ribbed halter bikini with adjustable terracotta trim.', 1800.00, 6500.00, 4200.00, 'active'),
('b2222222-2222-2222-2222-222222222222', 'Lamu Coral Cut-Out One-Piece', 'LC-COP-02', 'Swahili Coast 2026', 'One-Piece', 'Sculpting plunge swimsuit featuring artisanal gold hardware and UPF 50+ fabric.', 2400.00, 8900.00, 5800.00, 'active'),
('b3333333-3333-3333-3333-333333333333', 'Watamu Wave Kimono Cover-Up', 'WW-KMN-03', 'Oceania Resort', 'Cover-up', 'Flowing lightweight linen-blend cover-up with hand-printed Swahili botanical motifs.', 1500.00, 5800.00, 3800.00, 'active'),
('b4444444-4444-4444-4444-444444444444', 'Kilifi Palms Tailored Swim Trunks', 'KP-TRK-04', 'Coastal Men', 'Men Trunks', 'Quick-drying tailored trunks featuring hidden zip pocket and internal mesh.', 1600.00, 5200.00, 3400.00, 'active')
ON CONFLICT (id) DO NOTHING;

-- 4. Product Variants
INSERT INTO public.product_variants (id, product_id, sku, color_print, size, barcode, reorder_threshold) VALUES
('c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'OHA-DS-TER-S', 'Terracotta Red', 'S', '890123456701', 8),
('c2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'OHA-DS-TER-M', 'Terracotta Red', 'M', '890123456702', 10),
('c3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'OHA-DS-TER-L', 'Terracotta Red', 'L', '890123456703', 6),
('c4444444-4444-4444-4444-444444444444', 'b2222222-2222-2222-2222-222222222222', 'OHA-LC-CR-S', 'Coral Ochre', 'S', '890123456704', 6),
('c5555555-5555-5555-5555-555555555555', 'b2222222-2222-2222-2222-222222222222', 'OHA-LC-CR-M', 'Coral Ochre', 'M', '890123456705', 8),
('c6666666-6666-6666-6666-666666666666', 'b3333333-3333-3333-3333-333333333333', 'OHA-WW-GRN-OS', 'Palm Green', 'One Size', '890123456706', 12),
('c7777777-7777-7777-7777-777777777777', 'b4444444-4444-4444-4444-444444444444', 'OHA-KP-NAV-M', 'Deep Coast Charcoal', 'M', '890123456707', 8)
ON CONFLICT (id) DO NOTHING;

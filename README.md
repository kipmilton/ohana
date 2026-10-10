# Ohana Swimwear — Business Operations & Consignment Reconciliation Ecosystem

A centralized, private business operations platform for **Ohana Swimwear**, managing nationwide retail stockist distribution across Kenya, stock ledgers, monthly consignment sales reconciliation, tax invoicing, and WordPress/WooCommerce website synchronization.

Built with **React**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL)**.

---

## 🌺 Brand & Operational Scope

- **Brand:** Ohana Swimwear (Kenya)
- **Distribution Locations:**
  - Ohana Central Distribution Warehouse (Industrial Area, Nairobi)
  - Nomad Beach Boutique (Diani Beach Road, Kwale)
  - Village Market Collective (Gigiri, Nairobi)
  - The Alchemist Concept Store (Westlands, Nairobi)
  - Nyali Sun & Sea Store (Links Road, Nyali, Mombasa)
- **Online Channel:** WordPress + WooCommerce (Hosted on Truehost Kenya)
- **Currency:** KES (Kenyan Shillings)
- **Commercial Model:** Wholesale Consignment & Sales Commission settlement at month-end

---

## 🛠️ System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   OHANA ECOSYSTEM                      │
├──────────────────────────┬─────────────────────────────┤
│   Central Operations     │     Retail Partner Portal   │
│   (Owner / Managers)     │     (Nomad, Village Market) │
├──────────────────────────┴─────────────────────────────┤
│             React + TypeScript + Tailwind UI           │
├────────────────────────────────────────────────────────┤
│           Supabase Backend (PostgreSQL + RLS)          │
│   ├── Retail Partners & Locations                      │
│   ├── Product Variants & Immutable Stock Ledger        │
│   ├── Monthly Consignment Sales & Reconciliation       │
│   ├── Invoicing, Payments (M-Pesa) & Factory POs       │
│   └── WooCommerce Webhooks & Idempotent Stock Sync     │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### 1. Install & Run Locally
```bash
# Clone or navigate to the repository
cd Ohana

# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase Database Setup

Ohana uses its own independent Supabase database (completely decoupled from MyPlug or WordPress).

1. Log in to [Supabase](https://supabase.com) and create a new project: `ohana-operations`.
2. Go to **SQL Editor** in your Supabase dashboard.
3. Open [`supabase/schema.sql`](./supabase/schema.sql), copy all contents, paste into the editor, and click **Run**.
   - This creates 14 tables, Row Level Security (RLS) policies, and the `trg_inventory_ledger_update` automated trigger.
4. Open [`supabase/seed.sql`](./supabase/seed.sql), copy, paste, and click **Run** to seed initial Kenyan retail stockists, swimwear styles, and variants.
5. In your Supabase Project Settings, copy your **Project URL** and **Anon Key**.
6. In this app, click **Supabase Ready** in the top navigation bar or go to the **Supabase Architecture** tab to paste and test your connection. You can also add them to `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## 📋 The Monthly Consignment Workflow

The engine of the platform is the 4-step monthly sales and stock reconciliation process:

1. **Stock Dispatched:** Stock sent from Central Warehouse to stockists with tracked dispatch notes (`DSP-2026-xxxx`).
2. **Month-End Sales Submitted:** Retailer enters units sold, returns, and damaged fitting room units.
3. **Reconciliation Audit:**
   $$\text{Expected Closing Stock} = \text{Opening} + \text{Dispatched} - \text{Sold} - \text{Returns} - \text{Damaged}$$
   The system compares this against the **physically verified in-store count**. Unresolved discrepancies are flagged with financial impact warnings.
4. **1-Click Invoice Generation:** The owner reviews and approves the report, instantly generating a KRA-compliant Tax Invoice with itemized wholesale variant pricing, M-Pesa Paybill instructions, and payment allocation tracking.

---

## 📦 Core Modules

1. **Executive Dashboard:** Live KES sales KPI cards, active stockist count, stock distribution breakdown, and exception alerts.
2. **Products & Immutable Stock Ledger:** Color/size variant matrix, barcodes, and permanent ledger logging for all stock receipts, dispatches, and adjustments.
3. **Retail Stockist Network:** Boutique profiles, trading agreements (wholesale vs commission %), and account balance statements.
4. **Consignment Reconciliation:** Math verification sheets, discrepancy flagging, and report approvals.
5. **Invoices & Finance:** Official Ohana Tax Invoices (printable/PDF), M-Pesa Paybill payment recording (`RK94JD2018`), and overdue reminders.
6. **Factory & Production:** EPZ manufacture purchase orders with Goods Received Notes (GRN) that automatically restock warehouse inventory.
7. **WooCommerce Sync:** Real-time web order simulation and inventory reservation between the online store and physical stockists.
8. **Barcode & QR Handheld Scanner:** Fast optical lookup and confirmed stock transaction guardrails.

---

## 🎨 Visual Identity

Designed following the private luxury resort aesthetic matching Ohana's logo:
- **Terracotta Red:** `#B93826`
- **Ochre Gold:** `#C99738`
- **Palm Green:** `#45A041`
- **Deep Coast Charcoal:** `#252924`
- **Warm Ivory Sand:** `#FAF7F2`

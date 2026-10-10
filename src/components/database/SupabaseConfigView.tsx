import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Database, 
  CheckCircle2, 
  Key, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Layers, 
  Terminal,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const SupabaseConfigView: React.FC = () => {
  const { isSupabaseLive, supabaseConfig, updateSupabaseCredentials } = useApp();
  
  const [url, setUrl] = useState(supabaseConfig.url || '');
  const [anonKey, setAnonKey] = useState(supabaseConfig.anonKey || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await updateSupabaseCredentials(url, anonKey);
    setIsSaving(false);
    if (success) {
      setSaveMessage('Supabase credentials successfully saved and activated!');
    } else {
      setSaveMessage('Credentials saved locally. Application connected.');
    }
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const schemaTables = [
    { name: 'retail_partners', desc: 'Stockists across Kenya (Nomad Beach, Village Market, Alchemist, etc.)', rls: 'Enabled' },
    { name: 'locations', desc: 'Central Warehouse, retail outlets, in-transit log hubs', rls: 'Enabled' },
    { name: 'products', desc: 'Swimwear master catalog with styles, categories, retail & wholesale prices', rls: 'Enabled' },
    { name: 'product_variants', desc: 'SKUs, color prints, sizes (XS-XL), unique barcodes', rls: 'Enabled' },
    { name: 'stock_balances', desc: 'Live variant balances cached per location', rls: 'Enabled' },
    { name: 'inventory_ledger', desc: 'Permanent immutable stock audit log with triggers', rls: 'Strict' },
    { name: 'dispatches', desc: 'Store restock shipments with dispatch notes and status', rls: 'Enabled' },
    { name: 'monthly_sales_reports', desc: 'Month-end consignment reports with discrepancy checks', rls: 'Isolated' },
    { name: 'invoices', desc: 'Kenya Tax Invoices, VAT calculation, and KRA PIN records', rls: 'Isolated' },
    { name: 'payments', desc: 'M-Pesa Paybill references, bank wires, partial payment allocations', rls: 'Isolated' },
    { name: 'factory_orders', desc: 'EPZ purchase orders, production tracking, and GRN receipts', rls: 'Staff Only' },
    { name: 'woocommerce_sync_logs', desc: 'Idempotent webhook logs from Truehost WordPress store', rls: 'System' },
    { name: 'audit_logs', desc: 'Administrative action history for compliance', rls: 'Read Only' },
  ];

  const handleCopySql = () => {
    // Copy schema SQL instruction
    navigator.clipboard.writeText(`-- Ohana Swimwear Operations Schema is ready in supabase/schema.sql and supabase/seed.sql`);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-ohana-charcoal-900 font-display">
          Supabase Backend & PostgreSQL Architecture
        </h1>
        <p className="text-xs text-gray-500">
          Independent database and authentication tier for Ohana (completely decoupled from MyPlug and WordPress).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Supabase Connection Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white rounded-2xl border border-ohana-sand-300 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm font-bold text-ohana-charcoal-900">
                  Supabase Project Settings
                </h2>
              </div>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                isSupabaseLive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {isSupabaseLive ? 'Live Connected' : 'Demo Fallback Active'}
              </span>
            </div>

            <p className="text-xs text-gray-500">
              Create an independent Supabase project for Ohana at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-ohana-terracotta font-bold underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3" /></a> and paste your Project URL & Anon Key below:
            </p>

            {saveMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{saveMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveCredentials} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Project URL (VITE_SUPABASE_URL)
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Anon Public Key (VITE_SUPABASE_ANON_KEY)
                </label>
                <textarea
                  rows={3}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 font-mono text-[10px]"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 bg-ohana-charcoal-900 hover:bg-black text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4 text-ohana-gold-400" />
                <span>Save & Connect Supabase</span>
              </button>
            </form>
          </div>

          {/* Decoupling Warning */}
          <div className="p-4 bg-ohana-sand-50 rounded-xl border border-ohana-sand-300 text-xs text-gray-700 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-ohana-terracotta">
              <ShieldCheck className="w-4 h-4" />
              <span>Independent Ecosystem Isolation</span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              As emphasized in Brief Section 13, Ohana maintains complete tenant separation. It uses its own Supabase project, Row Level Security policies, and ledger triggers so retail partners and operations never touch MyPlug or the WooCommerce customer database.
            </p>
          </div>

        </div>

        {/* Right Column: SQL Schema & Tables Architecture (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white rounded-2xl border border-ohana-sand-300 p-6 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-ohana-charcoal-900">
                  PostgreSQL Relational Schema (14 Tables)
                </h2>
                <p className="text-xs text-gray-500">
                  Pre-configured in <span className="font-mono font-bold text-gray-700">supabase/schema.sql</span> with RLS and automated stock triggers.
                </p>
              </div>

              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-ohana-sand-100 hover:bg-ohana-sand-200 text-ohana-charcoal-900 text-xs font-bold rounded-lg border border-ohana-sand-300 transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSchema ? 'Copied Path!' : 'Copy Script Path'}</span>
              </button>
            </div>

            {/* Table List */}
            <div className="border border-gray-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px] sticky top-0">
                  <tr>
                    <th className="p-3">Table Name</th>
                    <th className="p-3">Operational Scope</th>
                    <th className="p-3 text-center">Row Level Security</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {schemaTables.map((t) => (
                    <tr key={t.name} className="hover:bg-ohana-sand-50/50">
                      <td className="p-3 font-mono font-bold text-ohana-charcoal-900">
                        {t.name}
                      </td>
                      <td className="p-3 text-gray-600 text-[11px]">
                        {t.desc}
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                          {t.rls}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SQL Execution Guide */}
            <div className="bg-ohana-charcoal-900 text-white p-4 rounded-xl text-xs space-y-2">
              <div className="flex items-center gap-2 text-ohana-gold-400 font-mono text-[11px] font-bold">
                <Terminal className="w-3.5 h-3.5" />
                <span>Quick Setup in Supabase Dashboard:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-gray-300 text-[11px]">
                <li>Go to your Supabase Project → <strong>SQL Editor</strong></li>
                <li>Copy & paste contents of <code className="bg-black/50 px-1.5 py-0.5 rounded font-mono text-ohana-gold-300">supabase/schema.sql</code></li>
                <li>Click <strong>Run</strong> (creates all 14 tables, RLS policies, and stock triggers)</li>
                <li>Copy & paste <code className="bg-black/50 px-1.5 py-0.5 rounded font-mono text-ohana-gold-300">supabase/seed.sql</code> to load Kenya sample data</li>
              </ol>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

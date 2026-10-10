import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  DollarSign, 
  Store, 
  Boxes, 
  Receipt, 
  AlertTriangle, 
  ArrowUpRight, 
  Clock, 
  Truck, 
  ShieldAlert, 
  CheckCircle2, 
  PackagePlus,
  Plus
} from 'lucide-react';

export const ExecutiveDashboard: React.FC = () => {
  const { 
    partners, 
    products, 
    salesReports, 
    selectedPartnerFilter,
    setActiveView
  } = useApp();

  // Filter if partner filter is active
  const filteredPartners = selectedPartnerFilter 
    ? partners.filter(p => p.id === selectedPartnerFilter)
    : partners;

  // Calculate High-Level Metrics
  const verifiedSalesMonthKes = salesReports
    .filter(r => r.status === 'approved_for_invoice')
    .reduce((sum, r) => sum + r.payableWholesaleKes, 0);

  const totalOutstandingBalanceKes = filteredPartners
    .reduce((sum, p) => sum + p.currentBalanceKes, 0);

  // Stock calculations across physical stores & warehouse
  let totalWarehouseStock = 0;
  let totalPartnerStock = 0;
  let totalInTransitStock = 0;

  products.forEach(p => {
    p.variants.forEach(v => {
      Object.entries(v.stockByLocation).forEach(([locId, qty]) => {
        if (locId === 'loc-wh-01') {
          totalWarehouseStock += qty;
        } else if (locId.includes('transit')) {
          totalInTransitStock += qty;
        } else {
          totalPartnerStock += qty;
        }
      });
    });
  });

  const totalUnitsInStock = totalWarehouseStock + totalPartnerStock + totalInTransitStock;

  // Format KES currency
  const formatKes = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      
      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Verified Wholesale Sales */}
        <div className="bg-white p-5 rounded-2xl border border-ohana-sand-300 shadow-sm relative overflow-hidden group hover:border-ohana-terracotta/40 transition-all">
          <div className="flex items-center justify-between text-xs text-gray-700 font-semibold mb-2">
            <span>Verified Sales (Physical Stores)</span>
            <div className="w-8 h-8 rounded-lg bg-ohana-terracotta-50 flex items-center justify-center text-ohana-terracotta">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-ohana-charcoal-900 font-display">
            {formatKes(verifiedSalesMonthKes)}
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-800 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Calculated from retail partner reports</span>
          </div>
        </div>

        {/* Metric 2: Active Stockists */}
        <div className="bg-white p-5 rounded-2xl border border-ohana-sand-300 shadow-sm relative overflow-hidden group hover:border-ohana-gold/40 transition-all">
          <div className="flex items-center justify-between text-xs text-gray-700 font-semibold mb-2">
            <span>Active Retail Partners</span>
            <div className="w-8 h-8 rounded-lg bg-ohana-gold-50 flex items-center justify-center text-ohana-gold-700">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-ohana-charcoal-900 font-display">
            {filteredPartners.length} <span className="text-xs font-normal text-gray-700">Outlets</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-gray-700">
            <span>Nairobi · Mombasa · Diani Beach</span>
          </div>
        </div>

        {/* Metric 3: Units In Stock */}
        <div className="bg-white p-5 rounded-2xl border border-ohana-sand-300 shadow-sm relative overflow-hidden group hover:border-ohana-green/40 transition-all">
          <div className="flex items-center justify-between text-xs text-gray-700 font-semibold mb-2">
            <span>Total Units in Stock</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-ohana-green-700">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-ohana-charcoal-900 font-display">
            {totalUnitsInStock} <span className="text-xs font-normal text-gray-700">units</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-gray-700">
            <span>Warehouse ({totalWarehouseStock}) · Partners ({totalPartnerStock})</span>
          </div>
        </div>

        {/* Metric 4: Outstanding Balances */}
        <div className="bg-white p-5 rounded-2xl border border-ohana-sand-300 shadow-sm relative overflow-hidden group hover:border-red-300 transition-all">
          <div className="flex items-center justify-between text-xs text-gray-700 font-semibold mb-2">
            <span>Outstanding Balances</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-ohana-charcoal-900 font-display">
            {formatKes(totalOutstandingBalanceKes)}
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-amber-800 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Across reconciled partner accounts</span>
          </div>
        </div>

      </div>

      {/* Operational Attention Alerts (Only shown if alerts exist) */}
      {(salesReports.some(r => r.status === 'discrepancy_flagged') || partners.some(p => p.currentBalanceKes > 0)) && (
        <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-900 uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Physical Store Operations & Month-End Action Required</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {salesReports.filter(r => r.status === 'discrepancy_flagged').map(rep => (
              <div key={rep.id} className="bg-white p-3 rounded-xl border border-amber-200 shadow-xs flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-900">Physical Stock Discrepancy ({rep.partnerName})</p>
                  <p className="text-gray-700 text-[11px] mt-0.5">
                    Count sheet discrepancy of {rep.discrepancyUnits} units flagged.
                  </p>
                  <button 
                    onClick={() => setActiveView('reconciliation')} 
                    className="text-ohana-terracotta font-bold text-[11px] mt-1.5 inline-block hover:underline"
                  >
                    Review Reconciliation →
                  </button>
                </div>
              </div>
            ))}

            {partners.filter(p => p.currentBalanceKes > 0).slice(0, 2).map(part => (
              <div key={part.id} className="bg-white p-3 rounded-xl border border-amber-200 shadow-xs flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-900">Outstanding Balance: {part.name}</p>
                  <p className="text-gray-700 text-[11px] mt-0.5">
                    {formatKes(part.currentBalanceKes)} pending settlement.
                  </p>
                  <button 
                    onClick={() => setActiveView('invoices')} 
                    className="text-ohana-terracotta font-bold text-[11px] mt-1.5 inline-block hover:underline"
                  >
                    View Invoices & Statements →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Retail Stockists Performance + Inventory Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Retail Partner Performance Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-ohana-sand-300 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-ohana-sand-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-ohana-charcoal-900">
                Retail Partner Performance & Balances
              </h2>
              <p className="text-xs text-gray-700">
                Nationwide physical stockist accounts, trading terms, and settlement status
              </p>
            </div>
            <button 
              onClick={() => setActiveView('partners')}
              className="text-xs text-ohana-terracotta font-bold hover:underline flex items-center gap-1"
            >
              <span>Manage Outlets</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            {filteredPartners.length === 0 ? (
              <div className="p-10 text-center text-gray-400 space-y-2">
                <Store className="w-10 h-10 mx-auto text-gray-300" />
                <p className="font-bold text-sm text-gray-700">No stores onboarded yet.</p>
                <p className="text-xs text-gray-400">Click below to onboard and register your first retail outlet or boutique.</p>
                <button
                  onClick={() => setActiveView('assign_stock')}
                  className="mt-2 px-4 py-2 bg-ohana-terracotta text-white font-bold rounded-xl text-xs hover:bg-ohana-terracotta-600 transition-all inline-block"
                >
                  + Register First Store
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-ohana-sand-50/70 border-b border-ohana-sand-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Partner & Location</th>
                    <th className="py-3 px-3">Commercial Terms</th>
                    <th className="py-3 px-3 text-center">Stock Held</th>
                    <th className="py-3 px-3">Reporting Status</th>
                    <th className="py-3 px-4 text-right">Balance Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ohana-sand-200 font-medium">
                  {filteredPartners.map(partner => (
                    <tr key={partner.id} className="hover:bg-ohana-sand-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-ohana-charcoal-900">{partner.name}</div>
                        <div className="text-[11px] text-gray-500">{partner.locationCity} · {partner.code}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-block bg-ohana-sand-100 text-gray-700 text-[10px] px-2 py-0.5 rounded font-medium border border-ohana-sand-300">
                          {partner.agreementType === 'consignment_fixed_wholesale' 
                            ? 'Wholesale Consignment' 
                            : `${partner.commissionRate}% Commission`}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-ohana-charcoal-900">{partner.stockOnHandUnits}</span>
                        <span className="text-[10px] text-gray-500 block">units</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-[11px] font-semibold text-gray-800">{partner.lastReportMonth || 'Pending'}</div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{partner.lastSyncAt || 'Awaiting update'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className={`font-bold font-display ${
                          partner.currentBalanceKes > 0 ? 'text-ohana-terracotta' : 'text-emerald-700'
                        }`}>
                          {formatKes(partner.currentBalanceKes)}
                        </div>
                        <div className="text-[10px] text-gray-500">Terms: {partner.paymentTermsDays} days</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="p-3 bg-ohana-sand-50/50 border-t border-ohana-sand-200 text-xs text-gray-500 flex items-center justify-between">
            <span className="text-[11px]">Partner sales reflect verified physical store sales records.</span>
            <span className="text-[11px] font-semibold text-gray-700">Settlement Cycle: End of Month</span>
          </div>
        </div>

        {/* Right 1 Col: Inventory Distribution Breakdown */}
        <div className="space-y-6">
          
          {/* Inventory Breakdown Card */}
          <div className="bg-white rounded-2xl border border-ohana-sand-300 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-ohana-charcoal-900">
                Stock Location Breakdown
              </h2>
              <button 
                onClick={() => setActiveView('inventory')}
                className="text-xs text-ohana-terracotta font-semibold hover:underline"
              >
                View Ledger
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-gray-700">Central Warehouse (Nairobi)</span>
                  <span className="text-ohana-charcoal-900 font-bold">{totalWarehouseStock} units ({Math.round(totalWarehouseStock / totalUnitsInStock * 100)}%)</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-ohana-charcoal-800 h-full rounded-full" 
                    style={{ width: `${(totalWarehouseStock / totalUnitsInStock) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-gray-700">Retail Partners (Boutiques)</span>
                  <span className="text-ohana-charcoal-900 font-bold">{totalPartnerStock} units ({Math.round(totalPartnerStock / totalUnitsInStock * 100)}%)</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-ohana-terracotta h-full rounded-full" 
                    style={{ width: `${(totalPartnerStock / totalUnitsInStock) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-gray-700">In-Transit / Courier</span>
                  <span className="text-ohana-charcoal-900 font-bold">{totalInTransitStock} units ({Math.round(totalInTransitStock / totalUnitsInStock * 100)}%)</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-ohana-gold h-full rounded-full" 
                    style={{ width: `${(totalInTransitStock / totalUnitsInStock) * 100}%` }}
                  />
                </div>
              </div>

            </div>

            <div className="mt-4 pt-3 border-t border-ohana-sand-200 text-xs text-gray-500 flex items-center justify-between">
              <span>Tracked Swimwear SKUs:</span>
              <span className="font-bold text-ohana-charcoal-900">
                {products.reduce((acc, p) => acc + p.variants.length, 0)} Active Variants
              </span>
            </div>
          </div>

          {/* Quick Action: Assign Items to Store */}
          <div className="bg-gradient-to-br from-ohana-sand-50 to-white rounded-2xl border border-ohana-sand-300 shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-ohana-terracotta" />
              <h3 className="font-bold text-sm text-ohana-charcoal-900">Store Stock Allocation</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Assign new products, variants, quantities, and agreed prices to any registered retail store.
            </p>
            <button
              onClick={() => setActiveView('assign_stock')}
              className="w-full py-2.5 px-4 bg-ohana-terracotta hover:bg-ohana-terracotta-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Open Stock Assignment Portal →</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

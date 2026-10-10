import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  PackagePlus, 
  Store, 
  Boxes, 
  DollarSign, 
  CheckCircle2, 
  Plus, 
  Receipt, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  History
} from 'lucide-react';
import { AssignStockModal } from './AssignStockModal';
import { StoreRegistrationModal } from './StoreRegistrationModal';

export const AssignStockManagementView: React.FC = () => {
  const { 
    storeAccounts, 
    assignedStoreItems, 
    vendorSales, 
    generateStoreMonthlyInvoice,
    setActiveView 
  } = useApp();

  const [selectedStoreId, setSelectedStoreId] = useState<string>(storeAccounts[0]?.id || '');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [invoiceSuccess, setInvoiceSuccess] = useState<string | null>(null);

  const formatKes = (amount: number) => `KES ${amount.toLocaleString()}`;

  // Current selected store
  const currentStore = storeAccounts.find(s => s.id === selectedStoreId) || storeAccounts[0];
  
  // Items assigned to this store
  const storeItems = assignedStoreItems.filter(i => i.storeId === selectedStoreId);
  
  // Sales made by this store
  const storeSales = vendorSales.filter(s => s.storeId === selectedStoreId);

  const handleGenerateInvoice = (storeId: string) => {
    const inv = generateStoreMonthlyInvoice(storeId);
    setInvoiceSuccess(`Generated ${inv.invoiceNumber} for ${inv.partnerName} (${formatKes(inv.totalAmountKes)})!`);
    setTimeout(() => setInvoiceSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ohana-charcoal-900 font-display">
            Store Product Assignment & Sales Oversight
          </h1>
          <p className="text-xs text-gray-500">
            Admin tool to register stores, assign swimwear products with stock and cost, and review vendor sales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 text-ohana-charcoal-900 border border-ohana-sand-300 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Store className="w-4 h-4 text-ohana-gold-700" />
            <span>+ Register New Store</span>
          </button>

          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-ohana-terracotta hover:bg-ohana-terracotta-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Assign Items to Store</span>
          </button>
        </div>
      </div>

      {invoiceSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-bold">{invoiceSuccess}</span>
          </div>
          <button
            onClick={() => setActiveView('invoices')}
            className="px-3 py-1 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800"
          >
            View Invoices →
          </button>
        </div>
      )}

      {/* Store Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {storeAccounts.map((store) => {
          const isSelected = selectedStoreId === store.id;
          const assignedCount = assignedStoreItems.filter(i => i.storeId === store.id).length;
          const salesCount = vendorSales.filter(s => s.storeId === store.id).reduce((a, b) => a + b.unitsSold, 0);

          return (
            <div
              key={store.id}
              onClick={() => setSelectedStoreId(store.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer text-xs ${
                isSelected
                  ? 'bg-white border-ohana-terracotta ring-2 ring-ohana-terracotta/20 shadow-md'
                  : 'bg-white border-ohana-sand-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-mono text-[10px] font-bold text-gray-400">{store.code}</span>
                {store.requiresPasswordReset && (
                  <span className="text-[9px] bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.5 rounded">
                    Reset Pending
                  </span>
                )}
              </div>
              <h2 className="font-bold text-sm text-ohana-charcoal-900">{store.name}</h2>
              <p className="text-[11px] text-gray-500">{store.locationCity}</p>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-gray-100 text-[11px]">
                <div>
                  <span className="text-gray-400 block text-[10px]">Assigned Items</span>
                  <span className="font-bold text-gray-900">{assignedCount} styles</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Sales Reported</span>
                  <span className="font-bold text-emerald-700">{salesCount} units</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Store Detail: Assigned Items & Sales */}
      {currentStore && (
        <div className="space-y-6">
          
          {/* Active Store Banner */}
          <div className="bg-white p-5 rounded-3xl border border-ohana-sand-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600">{currentStore.code}</span>
                <h2 className="text-lg font-bold font-display text-ohana-charcoal-900">{currentStore.name}</h2>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Manager: {currentStore.contactName} · Email: <span className="font-mono">{currentStore.email}</span> · {currentStore.locationCity}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAssignModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-ohana-sand-100 hover:bg-ohana-sand-200 text-ohana-charcoal-900 rounded-xl text-xs font-bold transition-all"
              >
                <PackagePlus className="w-4 h-4 text-ohana-terracotta" />
                <span>+ Assign More Items</span>
              </button>

              <button
                onClick={() => handleGenerateInvoice(currentStore.id)}
                className="flex items-center gap-1.5 px-4 py-2 bg-ohana-charcoal-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                <Receipt className="w-4 h-4 text-ohana-gold-400" />
                <span>Generate Monthly Invoice</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Assigned Items (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-ohana-sand-300 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-ohana-charcoal-900">
                    Items Assigned by Admin to {currentStore.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Items appearing in vendor's sales drop-down.
                  </p>
                </div>
                <span className="text-xs font-bold text-ohana-terracotta">
                  {storeItems.reduce((a, b) => a + b.stockAssigned, 0)} Units in Stock
                </span>
              </div>

              {storeItems.length === 0 ? (
                <div className="p-8 text-center text-gray-400 space-y-2 border border-dashed border-gray-200 rounded-2xl">
                  <p className="font-bold text-xs">No products assigned to this store yet.</p>
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="text-xs text-ohana-terracotta font-bold hover:underline"
                  >
                    + Assign product and stock now
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Product Name & SKU</th>
                        <th className="p-3">Color / Size</th>
                        <th className="p-3 text-center">Remaining Stock</th>
                        <th className="p-3 text-right">Agreed Cost</th>
                        <th className="p-3 text-right">Total Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {storeItems.map((item) => (
                        <tr key={item.id} className="hover:bg-ohana-sand-50/50">
                          <td className="p-3">
                            <div className="font-bold text-ohana-charcoal-900">{item.productName}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{item.sku}</div>
                          </td>
                          <td className="p-3 text-gray-700">{item.variantDesc}</td>
                          <td className="p-3 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold font-display ${
                              item.stockAssigned <= 0 ? 'bg-red-100 text-red-800' :
                              item.stockAssigned <= 3 ? 'bg-amber-100 text-amber-800' :
                              'bg-emerald-50 text-emerald-800'
                            }`}>
                              {item.stockAssigned} units
                            </span>
                          </td>
                          <td className="p-3 text-right font-display">{formatKes(item.unitCostKes)}</td>
                          <td className="p-3 text-right font-bold text-ohana-charcoal-900 font-display">
                            {formatKes(item.stockAssigned * item.unitCostKes)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right Column: Sales Recorded by this Store (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-ohana-sand-300 shadow-sm p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-ohana-charcoal-900">
                  Sales Reported by {currentStore.name}
                </h3>
                <p className="text-xs text-gray-500">
                  Units deducted from assigned stock in real time.
                </p>
              </div>

              {storeSales.length === 0 ? (
                <div className="p-8 text-center text-gray-400 space-y-1 border border-dashed border-gray-200 rounded-2xl">
                  <p className="font-bold text-xs">No sales recorded yet by this store.</p>
                  <p className="text-[11px] text-gray-400">When the vendor logs a sale, it will appear here and notify admin.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {storeSales.map(sale => (
                    <div key={sale.id} className="p-3 bg-ohana-sand-50 rounded-2xl border border-ohana-sand-200 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-gray-900 block">{sale.productName}</span>
                        <span className="text-[10px] text-gray-500">{sale.variantDesc} · {sale.soldAt}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-ohana-terracotta text-sm block">-{sale.unitsSold} units</span>
                        <span className="text-[10px] text-emerald-700 font-bold">{formatKes(sale.totalMoneyCollectedKes)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">Total Money Collected:</span>
                <span className="font-bold text-ohana-charcoal-900 font-display text-sm">
                  {formatKes(storeSales.reduce((a, b) => a + b.totalMoneyCollectedKes, 0))}
                </span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* MODALS */}
      <AssignStockModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        defaultStoreId={selectedStoreId}
      />

      <StoreRegistrationModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />

    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Store, 
  Boxes, 
  DollarSign, 
  ShoppingBag, 
  CheckCircle2, 
  Plus, 
  X, 
  Clock, 
  Tag, 
  AlertTriangle,
  History,
  TrendingUp,
  Receipt
} from 'lucide-react';

export const VendorPortalDashboard: React.FC = () => {
  const { 
    authSession, 
    assignedStoreItems, 
    vendorSales, 
    recordVendorSale,
    storeAccounts 
  } = useApp();

  // Find store details for current vendor
  const currentStoreId = authSession.user?.storeId || 'ret-01';
  const currentStore = storeAccounts.find(s => s.id === currentStoreId) || {
    id: currentStoreId,
    name: authSession.user?.storeName || 'Nomad Beach Boutique',
    locationCity: 'Diani Beach',
    currentBalanceKes: 142500,
  };

  // Filter items assigned exclusively to this store
  const myAssignedItems = assignedStoreItems.filter(i => i.storeId === currentStoreId);
  
  // Filter sales recorded by this store
  const mySales = vendorSales.filter(s => s.storeId === currentStoreId);

  // Modal State for Recording a Sale
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(() => {
    return myAssignedItems[0]?.id || '';
  });
  const [unitsSold, setUnitsSold] = useState<number>(1);
  const [moneyCollectedKes, setMoneyCollectedKes] = useState<number>(() => {
    const item = myAssignedItems[0];
    return item ? (item.unitCostKes * 1.5) : 6500;
  });
  const [saleNotes, setSaleNotes] = useState('');
  const [saleError, setSaleError] = useState<string | null>(null);
  const [saleSuccess, setSaleSuccess] = useState<string | null>(null);

  const formatKes = (amount: number) => `KES ${amount.toLocaleString()}`;

  // Current selected item in modal
  const activeModalItem = myAssignedItems.find(i => i.id === selectedItemId) || myAssignedItems[0];

  const handleItemSelectChange = (itemId: string) => {
    setSelectedItemId(itemId);
    const item = myAssignedItems.find(i => i.id === itemId);
    if (item) {
      // Pre-fill suggested retail collection
      const suggestedPrice = Math.round(item.unitCostKes * 1.5);
      setMoneyCollectedKes(suggestedPrice * unitsSold);
    }
  };

  const handleUnitsChange = (units: number) => {
    setUnitsSold(units);
    if (activeModalItem) {
      const suggestedPrice = Math.round(activeModalItem.unitCostKes * 1.5);
      setMoneyCollectedKes(suggestedPrice * units);
    }
  };

  const handleRecordSale = (e: React.FormEvent) => {
    e.preventDefault();
    setSaleError(null);

    if (!selectedItemId || unitsSold <= 0) return;

    const res = recordVendorSale({
      assignedItemId: selectedItemId,
      unitsSold,
      moneyCollectedKes,
      notes: saleNotes,
    });

    if (!res.success) {
      setSaleError(res.error || 'Failed to record sale.');
      return;
    }

    setSaleSuccess(`Sale recorded! Stock for ${activeModalItem?.productName} auto-deducted by ${unitsSold} unit(s). Admin notified.`);
    setTimeout(() => {
      setSaleSuccess(null);
      setShowSaleModal(false);
      setSaleNotes('');
      setUnitsSold(1);
    }, 2000);
  };

  // Quick Sell shortcut
  const handleQuickSell = (item: typeof myAssignedItems[0]) => {
    setSelectedItemId(item.id);
    setUnitsSold(1);
    setMoneyCollectedKes(Math.round(item.unitCostKes * 1.5));
    setShowSaleModal(true);
  };

  // Stats
  const totalStockOnHand = myAssignedItems.reduce((acc, curr) => acc + curr.stockAssigned, 0);
  const totalUnitsSold = mySales.reduce((acc, curr) => acc + curr.unitsSold, 0);
  const totalRevenueCollected = mySales.reduce((acc, curr) => acc + curr.totalMoneyCollectedKes, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Store Profile & Record Sale CTA */}
      <div className="bg-gradient-to-r from-ohana-charcoal-900 to-ohana-charcoal-800 text-white p-6 rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs uppercase font-bold tracking-wider text-ohana-gold-300">
              Retail Partner Store Portal
            </span>
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <span>{currentStore.name}</span>
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            Location: {currentStore.locationCity} · Authorized Vendor Dashboard
          </p>
        </div>

        <button
          onClick={() => {
            if (myAssignedItems.length > 0) {
              setSelectedItemId(myAssignedItems[0].id);
              handleUnitsChange(1);
            }
            setShowSaleModal(true);
          }}
          className="flex items-center gap-2 bg-ohana-terracotta hover:bg-ohana-terracotta-600 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-lg transition-all self-start md:self-auto transform hover:scale-105"
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="text-sm">Record a Sale</span>
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-ohana-sand-300 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
            <span>My Stock on Hand</span>
            <Boxes className="w-4 h-4 text-ohana-gold-700" />
          </div>
          <div className="text-2xl font-bold text-ohana-charcoal-900 font-display">
            {totalStockOnHand} <span className="text-xs font-normal text-gray-500">units remaining</span>
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Across {myAssignedItems.length} assigned styles</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ohana-sand-300 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
            <span>Sales Made</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-display">
            {totalUnitsSold} <span className="text-xs font-normal text-gray-500">units sold</span>
          </div>
          <div className="text-[11px] text-emerald-800 mt-1">Recorded and verified</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ohana-sand-300 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
            <span>Total Money Collected</span>
            <DollarSign className="w-4 h-4 text-ohana-terracotta" />
          </div>
          <div className="text-2xl font-bold text-ohana-charcoal-900 font-display">
            {formatKes(totalRevenueCollected)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Gross store customer receipts</div>
        </div>
      </div>

      {/* MAIN SECTION: Assigned Items Table */}
      <div className="bg-white rounded-3xl border border-ohana-sand-300 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-ohana-sand-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-ohana-charcoal-900">
              Products Assigned to {currentStore.name} by Ohana Admin
            </h2>
            <p className="text-xs text-gray-500">
              Only these items are allocated to your store and available for sale.
            </p>
          </div>
          <span className="text-xs bg-ohana-sand-100 px-3 py-1 rounded-full font-bold text-ohana-charcoal-900 border border-ohana-sand-300">
            {myAssignedItems.length} Assigned Styles
          </span>
        </div>

        {myAssignedItems.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-2">
            <Boxes className="w-12 h-12 mx-auto text-gray-300" />
            <p className="font-bold text-sm text-gray-700">No products assigned yet.</p>
            <p className="text-xs text-gray-400">Ohana Admin has not assigned any inventory items to this store yet.</p>
          </div>
        ) : (
          <div>
            {/* Mobile View: Cards */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {myAssignedItems.map((item) => {
                const isOutOfStock = item.stockAssigned <= 0;
                const isLow = item.stockAssigned <= 3 && item.stockAssigned > 0;

                return (
                  <div key={item.id} className="p-4 rounded-2xl border border-ohana-sand-200 bg-white shadow-xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-ohana-charcoal-900">{item.productName}</h3>
                        <p className="text-xs text-gray-500">{item.variantDesc}</p>
                        <span className="text-[10px] text-gray-400 font-mono">{item.sku}</span>
                      </div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full font-display text-xs font-bold ${
                        isOutOfStock ? 'bg-red-100 text-red-800' :
                        isLow ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-50 text-emerald-800'
                      }`}>
                        {item.stockAssigned} units
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-ohana-sand-50/70 p-2.5 rounded-xl text-xs">
                      <div>
                        <span className="text-[10px] text-gray-500 block">Initial Stock:</span>
                        <span className="font-medium text-gray-700">{item.initialStockAssigned} units</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-500 block">Agreed Wholesale:</span>
                        <span className="font-bold text-ohana-charcoal-900 font-display">{formatKes(item.unitCostKes)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleQuickSell(item)}
                      disabled={isOutOfStock}
                      className="w-full py-2 bg-ohana-terracotta hover:bg-ohana-terracotta-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isOutOfStock ? 'Sold Out' : 'Record Sale'}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-ohana-sand-50/70 border-b border-ohana-sand-200 text-gray-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Assigned Product & SKU</th>
                    <th className="py-3 px-3 font-semibold">Variant (Color / Size)</th>
                    <th className="py-3 px-3 text-center font-semibold">Initial Stock</th>
                    <th className="py-3 px-3 text-center font-semibold">Stock Remaining</th>
                    <th className="py-3 px-3 text-right font-semibold">Agreed Wholesale Cost</th>
                    <th className="py-3 px-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ohana-sand-200 font-medium">
                  {myAssignedItems.map((item) => {
                    const isOutOfStock = item.stockAssigned <= 0;
                    const isLow = item.stockAssigned <= 3 && item.stockAssigned > 0;

                    return (
                      <tr key={item.id} className="hover:bg-ohana-sand-50/50">
                        <td className="py-3 px-4">
                          <div className="font-bold text-ohana-charcoal-900">{item.productName}</div>
                          <div className="text-[10px] text-gray-500 font-mono">{item.sku}</div>
                        </td>
                        <td className="py-3 px-3 text-gray-700">
                          {item.variantDesc}
                        </td>
                        <td className="py-3 px-3 text-center text-gray-500">
                          {item.initialStockAssigned} units
                        </td>
                        <td className="py-3 px-3 text-center font-bold">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full font-display text-xs ${
                            isOutOfStock ? 'bg-red-100 text-red-800' :
                            isLow ? 'bg-amber-100 text-amber-800' :
                            'bg-emerald-50 text-emerald-800'
                          }`}>
                            {item.stockAssigned} units
                          </span>
                          {isOutOfStock && <span className="block text-[9px] text-red-600 font-bold">Sold Out</span>}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-ohana-charcoal-900 font-display">
                          {formatKes(item.unitCostKes)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleQuickSell(item)}
                            disabled={isOutOfStock}
                            className="px-3 py-1.5 bg-ohana-terracotta hover:bg-ohana-terracotta-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-lg transition-all text-[11px]"
                          >
                            Record Sale
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SALES RECORD LOG */}
      <div className="bg-white rounded-3xl border border-ohana-sand-300 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-ohana-terracotta" />
            <h2 className="text-sm font-bold text-ohana-charcoal-900">
              Sales Recorded by {currentStore.name}
            </h2>
          </div>
          <span className="text-xs text-gray-500">
            Real-time stock deduction logged
          </span>
        </div>

        {mySales.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">No sales recorded yet. Click "Record a Sale" to log customer purchases.</p>
        ) : (
          <div className="overflow-x-auto border border-gray-100 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Product Sold</th>
                  <th className="p-3 text-center">Units Sold</th>
                  <th className="p-3 text-right">Money Collected</th>
                  <th className="p-3">Notes</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {mySales.map(sale => (
                  <tr key={sale.id} className="hover:bg-ohana-sand-50/50">
                    <td className="p-3 text-gray-500 font-mono text-[11px]">{sale.soldAt}</td>
                    <td className="p-3">
                      <div className="font-bold text-ohana-charcoal-900">{sale.productName}</div>
                      <div className="text-[10px] text-gray-500">{sale.variantDesc}</div>
                    </td>
                    <td className="p-3 text-center font-bold text-ohana-terracotta font-display text-sm">
                      -{sale.unitsSold}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-700 font-display">
                      {formatKes(sale.totalMoneyCollectedKes)}
                    </td>
                    <td className="p-3 text-gray-500">{sale.notes || '—'}</td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Admin Notified</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECORD SALE MODAL (DROPDOWN OF ASSIGNED ITEMS) */}
      {showSaleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-ohana-sand-300 relative animate-in fade-in zoom-in-95 duration-150">
            
            <button
              onClick={() => setShowSaleModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="w-5 h-5 text-ohana-terracotta" />
              <h2 className="text-base font-bold font-display text-ohana-charcoal-900">
                Record a Sale — {currentStore.name}
              </h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Select from products assigned to your store. Assigned stock will be deducted automatically.
            </p>

            {saleSuccess ? (
              <div className="p-8 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h3 className="text-sm font-bold text-emerald-900">Sale Successfully Recorded!</h3>
                <p className="text-xs text-emerald-700">{saleSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleRecordSale} className="space-y-4 text-xs">
                
                {saleError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>{saleError}</span>
                  </div>
                )}

                {/* DROPDOWN OF ASSIGNED ITEMS ONLY (Prompt Requirement!) */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Select Product Sold (From Items Assigned by Admin)
                  </label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => handleItemSelectChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-bold text-gray-900 focus:border-ohana-terracotta outline-none"
                    required
                  >
                    {myAssignedItems.map(item => (
                      <option key={item.id} value={item.id} disabled={item.stockAssigned <= 0}>
                        {item.productName} — {item.variantDesc} ({item.stockAssigned} in stock)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stock on Hand Indicator */}
                {activeModalItem && (
                  <div className="p-3 bg-ohana-sand-50 rounded-xl border border-ohana-sand-200 flex items-center justify-between">
                    <span className="text-gray-600">Current Stock Remaining:</span>
                    <span className={`font-bold font-display text-sm ${
                      activeModalItem.stockAssigned <= 0 ? 'text-red-600' : 'text-emerald-700'
                    }`}>
                      {activeModalItem.stockAssigned} Units
                    </span>
                  </div>
                )}

                {/* Quantity Sold & Money Collected */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Number of Units Sold</label>
                    <input
                      type="number"
                      min="1"
                      max={activeModalItem?.stockAssigned || 10}
                      value={unitsSold}
                      onChange={(e) => handleUnitsChange(parseInt(e.target.value) || 1)}
                      className="w-full border border-gray-300 rounded-xl p-2.5 font-bold text-base text-ohana-charcoal-900 focus:border-ohana-terracotta outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Amount Collected from Customer (KES)</label>
                    <input
                      type="number"
                      min="100"
                      value={moneyCollectedKes}
                      onChange={(e) => setMoneyCollectedKes(parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-xl p-2.5 font-bold text-base text-emerald-700 focus:border-ohana-terracotta outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Wholesale Cost vs Customer Collection Policy Note */}
                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span>Store Wholesale Obligation:</span>
                    <span className="font-bold font-display text-ohana-charcoal-900">
                      {formatKes((activeModalItem?.unitCostKes || 1800) * unitsSold)}
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-800">
                    You can record whatever retail price was collected from the customer ({formatKes(moneyCollectedKes)}). Ohana invoices your store strictly at the agreed wholesale price ({formatKes(activeModalItem?.unitCostKes || 1800)} / unit).
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Notes / Receipt Ref (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Paid via M-Pesa / Walk-in customer..."
                    value={saleNotes}
                    onChange={(e) => setSaleNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 focus:border-ohana-terracotta outline-none"
                  />
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 space-y-0.5">
                  <div className="flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Real-Time Stock & Notification Sync</span>
                  </div>
                  <p>
                    Stock will be deducted by <span className="font-bold">{unitsSold} unit(s)</span> and a notification will be immediately dispatched to Ohana Admin.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowSaleModal(false)}
                    className="px-4 py-2.5 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-ohana-terracotta hover:bg-ohana-terracotta-600 text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Confirm Sale & Deduct Stock</span>
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

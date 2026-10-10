import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, InventoryMovementType } from '../../types';
import { 
  Boxes, 
  History, 
  Plus, 
  Search, 
  ArrowRight, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertCircle, 
  Filter, 
  QrCode,
  Tag,
  CheckCircle2,
  X
} from 'lucide-react';

export const InventoryLedgerView: React.FC = () => {
  const { 
    products, 
    locations, 
    partners, 
    ledger, 
    recordStockMovement, 
    currentRole 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'catalog' | 'ledger'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Movement Modal State
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementForm, setMovementForm] = useState<{
    variantId: string;
    movementType: InventoryMovementType;
    quantity: number;
    sourceLocationId: string;
    destinationLocationId: string;
    partnerId: string;
    referenceId: string;
    reasonNotes: string;
  }>({
    variantId: products[0]?.variants[0]?.id || '',
    movementType: 'dispatch_to_partner',
    quantity: 5,
    sourceLocationId: 'loc-wh-01',
    destinationLocationId: 'loc-transit-01',
    partnerId: 'ret-01',
    referenceId: '',
    reasonNotes: '',
  });

  const [movementSuccess, setMovementSuccess] = useState(false);

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.collection.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.variants.some(v => v.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const formatKes = (amount: number) => `KES ${amount.toLocaleString()}`;

  // Handle Submit Movement
  const handleRecordMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementForm.variantId || movementForm.quantity <= 0) return;

    recordStockMovement({
      variantId: movementForm.variantId,
      quantity: movementForm.movementType === 'factory_receipt' || movementForm.movementType === 'return_to_warehouse'
        ? movementForm.quantity 
        : -movementForm.quantity,
      movementType: movementForm.movementType,
      sourceLocationId: movementForm.sourceLocationId || undefined,
      destinationLocationId: movementForm.destinationLocationId || undefined,
      partnerId: movementForm.partnerId || undefined,
      referenceId: movementForm.referenceId || `MAN-${Date.now().toString().slice(-4)}`,
      reasonNotes: movementForm.reasonNotes || 'Manual authorized stock ledger entry',
      recordedBy: `${currentRole.toUpperCase()}`,
    });

    setMovementSuccess(true);
    setTimeout(() => {
      setMovementSuccess(false);
      setShowMovementModal(false);
    }, 1200);
  };

  const getMovementBadge = (type: InventoryMovementType) => {
    switch (type) {
      case 'factory_receipt':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">Factory Inflow</span>;
      case 'dispatch_to_partner':
        return <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded font-bold">Partner Dispatch</span>;
      case 'partner_received_confirm':
        return <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded font-bold">Receipt Confirmed</span>;
      case 'retailer_reported_sale':
        return <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-bold">Verified Sale</span>;
      case 'woocommerce_online_sale':
        return <span className="bg-cyan-100 text-cyan-800 text-[10px] px-2 py-0.5 rounded font-bold">WooCommerce Sale</span>;
      case 'damaged_lost_stock':
        return <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded font-bold">Damaged / Loss</span>;
      case 'return_to_warehouse':
        return <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded font-bold">Warehouse Return</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-[10px] px-2 py-0.5 rounded font-bold">Adjustment</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ohana-charcoal-900 font-display">
            Products & Inventory Ledger
          </h1>
          <p className="text-xs text-gray-500">
            Immutable single-source-of-truth for swimwear stock across Central Warehouse and retail stockists.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-ohana-sand-100 p-1 rounded-xl border border-ohana-sand-300">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'catalog'
                  ? 'bg-white text-ohana-charcoal-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Stock Matrix ({products.length} Styles)
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'ledger'
                  ? 'bg-white text-ohana-charcoal-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <History className="w-3.5 h-3.5 text-ohana-terracotta" />
              <span>Immutable Ledger ({ledger.length})</span>
            </button>
          </div>

          <button
            onClick={() => setShowMovementModal(true)}
            className="flex items-center gap-1.5 bg-ohana-terracotta hover:bg-ohana-terracotta-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Movement</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PRODUCT CATALOG & STOCK MATRIX */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-ohana-sand-300 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product name, SKU, or collection..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-ohana-terracotta"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-500 font-medium">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs font-semibold border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="Bikini">Bikinis</option>
                <option value="One-Piece">One-Pieces</option>
                <option value="Cover-up">Cover-Ups</option>
                <option value="Men Trunks">Men's Trunks</option>
              </select>
            </div>
          </div>

          {/* Product Cards with Variant Stock Breakdown */}
          <div className="grid grid-cols-1 gap-6">
            {filteredProducts.map((product) => {
              const totalStock = product.variants.reduce((sum, v) => {
                return sum + Object.values(v.stockByLocation).reduce((a, b) => a + b, 0);
              }, 0);

              return (
                <div 
                  key={product.id}
                  className="bg-white rounded-xl border border-ohana-sand-300 shadow-sm overflow-hidden"
                >
                  {/* Product Header */}
                  <div className="p-4 bg-ohana-sand-50/70 border-b border-ohana-sand-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-14 h-14 rounded-lg object-cover border border-ohana-sand-300 shadow-xs" 
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-bold text-ohana-charcoal-900 text-sm">{product.name}</h2>
                          <span className="bg-ohana-sand-200 text-ohana-charcoal-800 text-[10px] px-2 py-0.5 rounded-full font-medium">
                            {product.collection}
                          </span>
                          <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                            {product.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 max-w-xl">{product.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-xs shrink-0">
                      <div>
                        <span className="text-gray-500 text-[11px] block">Wholesale Price (Agreed)</span>
                        <span className="font-bold text-ohana-charcoal-900 font-display">
                          {formatKes(product.wholesalePriceKes)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 text-[11px] block">Retail Customer Price</span>
                        <span className="font-bold text-ohana-terracotta font-display">
                          {formatKes(product.retailPriceKes)}
                        </span>
                      </div>
                      <div className="border-l border-ohana-sand-300 pl-4">
                        <span className="text-gray-500 text-[11px] block">Total In Stock</span>
                        <span className="font-bold text-emerald-700 text-sm font-display">
                          {totalStock} units
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Variants Stock Matrix Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-2.5 px-4 font-semibold">Variant SKU</th>
                          <th className="py-2.5 px-3 font-semibold">Color / Size</th>
                          <th className="py-2.5 px-3 font-semibold">Barcode</th>
                          <th className="py-2.5 px-3 text-center font-semibold bg-gray-100/50">Central Warehouse</th>
                          <th className="py-2.5 px-3 text-center font-semibold">Nomad Diani</th>
                          <th className="py-2.5 px-3 text-center font-semibold">Village Market</th>
                          <th className="py-2.5 px-3 text-center font-semibold">The Alchemist</th>
                          <th className="py-2.5 px-3 text-center font-semibold">Nyali Store</th>
                          <th className="py-2.5 px-3 text-center font-semibold text-ohana-gold-800">In Transit</th>
                          <th className="py-2.5 px-4 text-right font-semibold">SKU Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {product.variants.map((variant) => {
                          const whQty = variant.stockByLocation['loc-wh-01'] || 0;
                          const nomadQty = variant.stockByLocation['loc-ret-01'] || 0;
                          const vmQty = variant.stockByLocation['loc-ret-02'] || 0;
                          const alchQty = variant.stockByLocation['loc-ret-03'] || 0;
                          const nyaliQty = variant.stockByLocation['loc-ret-04'] || 0;
                          const transitQty = variant.stockByLocation['loc-transit-01'] || 0;
                          const skuTotal = whQty + nomadQty + vmQty + alchQty + nyaliQty + transitQty;

                          const isLowStock = whQty <= variant.reorderThreshold;

                          return (
                            <tr key={variant.id} className="hover:bg-ohana-sand-50/40">
                              <td className="py-2.5 px-4 font-mono font-bold text-ohana-charcoal-800">
                                {variant.sku}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="font-semibold text-gray-800">{variant.colorPrint}</span>
                                <span className="ml-1.5 px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-700">
                                  {variant.size}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-gray-500 text-[11px]">
                                {variant.barcode}
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold bg-gray-50/70">
                                <span className={isLowStock ? 'text-amber-600 font-bold' : 'text-gray-900'}>
                                  {whQty}
                                </span>
                                {isLowStock && (
                                  <span className="text-[9px] block text-amber-600 font-semibold">Low</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center text-gray-700 font-semibold">{nomadQty}</td>
                              <td className="py-2.5 px-3 text-center text-gray-700 font-semibold">{vmQty}</td>
                              <td className="py-2.5 px-3 text-center text-gray-700 font-semibold">{alchQty}</td>
                              <td className="py-2.5 px-3 text-center text-gray-700 font-semibold">{nyaliQty}</td>
                              <td className="py-2.5 px-3 text-center font-bold text-ohana-gold-700">
                                {transitQty > 0 ? `+${transitQty}` : '—'}
                              </td>
                              <td className="py-2.5 px-4 text-right font-bold text-ohana-charcoal-900 font-display">
                                {skuTotal} units
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: IMMUTABLE AUDIT LEDGER */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-xl border border-ohana-sand-300 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-ohana-sand-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-ohana-charcoal-900">
                Permanent Stock Movement Ledger
              </h2>
              <p className="text-xs text-gray-500">
                Every unit in and out is immutably timestamped with user and reference note.
              </p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Audit Trail Secured</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ohana-sand-50/70 border-b border-ohana-sand-200 text-gray-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-3 font-semibold">Item & SKU</th>
                  <th className="py-3 px-3 font-semibold">Movement Type</th>
                  <th className="py-3 px-3 text-center font-semibold">Qty</th>
                  <th className="py-3 px-3 font-semibold">Route (From → To)</th>
                  <th className="py-3 px-3 font-semibold">Reference & Reason</th>
                  <th className="py-3 px-4 text-right font-semibold">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ohana-sand-200 font-medium">
                {ledger.map((entry) => {
                  const isPositive = entry.quantity > 0;
                  return (
                    <tr key={entry.id} className="hover:bg-ohana-sand-50/50">
                      <td className="py-3 px-4 text-gray-500 text-[11px] font-mono">
                        {entry.timestamp}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-ohana-charcoal-900">{entry.productName}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{entry.variantSku} ({entry.variantDesc})</div>
                      </td>
                      <td className="py-3 px-3">
                        {getMovementBadge(entry.movementType)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`font-bold font-display px-2 py-0.5 rounded text-xs ${
                          isPositive 
                            ? 'bg-emerald-50 text-emerald-800' 
                            : 'bg-rose-50 text-rose-800'
                        }`}>
                          {isPositive ? `+${entry.quantity}` : entry.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px]">
                        <span className="text-gray-700 font-medium">
                          {entry.sourceLocationName || 'External / Origin'}
                        </span>
                        {(entry.destinationLocationName || entry.partnerName) && (
                          <>
                            <span className="text-gray-400 mx-1">→</span>
                            <span className="text-ohana-charcoal-900 font-bold">
                              {entry.destinationLocationName || entry.partnerName}
                            </span>
                          </>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-[11px] font-semibold text-gray-800 font-mono">{entry.referenceId || '—'}</div>
                        <div className="text-[10px] text-gray-500 max-w-xs">{entry.reasonNotes}</div>
                      </td>
                      <td className="py-3 px-4 text-right text-[11px] text-gray-600 font-medium">
                        {entry.recordedBy}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: RECORD STOCK MOVEMENT */}
      {showMovementModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-ohana-sand-300 relative animate-in fade-in zoom-in duration-150">
            
            <button
              onClick={() => setShowMovementModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Boxes className="w-5 h-5 text-ohana-terracotta" />
              <h2 className="text-base font-bold text-ohana-charcoal-900 font-display">
                Record Stock Movement
              </h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Permanent inventory movement. This directly adjusts warehouse/partner stock balances.
            </p>

            {movementSuccess ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-sm font-bold text-gray-900">Ledger Entry Created Successfully</h3>
                <p className="text-xs text-gray-500">Balances have been automatically updated.</p>
              </div>
            ) : (
              <form onSubmit={handleRecordMovement} className="space-y-4 text-xs">
                
                {/* Movement Type */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Movement Type</label>
                  <select
                    value={movementForm.movementType}
                    onChange={(e) => setMovementForm({ ...movementForm, movementType: e.target.value as InventoryMovementType })}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-ohana-terracotta"
                  >
                    <option value="dispatch_to_partner">Dispatch to Retail Stockist (Warehouse → Partner)</option>
                    <option value="factory_receipt">Receive Goods from Factory (Factory → Warehouse)</option>
                    <option value="transfer_between_locations">Transfer Between Outlets</option>
                    <option value="damaged_lost_stock">Mark Damaged / Defective Stock</option>
                    <option value="return_to_warehouse">Return from Retailer to Central Warehouse</option>
                    <option value="physical_count_adjustment">Physical Count Audit Adjustment</option>
                  </select>
                </div>

                {/* Variant Selector */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Select Swimwear Variant</label>
                  <select
                    value={movementForm.variantId}
                    onChange={(e) => setMovementForm({ ...movementForm, variantId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-ohana-terracotta font-mono text-[11px]"
                  >
                    {products.flatMap(p => 
                      p.variants.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.sku} — {p.name} ({v.colorPrint} / {v.size})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Quantity */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Quantity (Units)</label>
                    <input
                      type="number"
                      min="1"
                      value={movementForm.quantity}
                      onChange={(e) => setMovementForm({ ...movementForm, quantity: parseInt(e.target.value) || 1 })}
                      className="w-full border border-gray-300 rounded-lg p-2 font-bold focus:ring-1 focus:ring-ohana-terracotta"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Reference # (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. DSP-0042, PO-001"
                      value={movementForm.referenceId}
                      onChange={(e) => setMovementForm({ ...movementForm, referenceId: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 font-mono"
                    />
                  </div>
                </div>

                {/* Locations: Source & Destination */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Source Location</label>
                    <select
                      value={movementForm.sourceLocationId}
                      onChange={(e) => setMovementForm({ ...movementForm, sourceLocationId: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2"
                    >
                      <option value="">None / External</option>
                      {locations.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Destination Location</label>
                    <select
                      value={movementForm.destinationLocationId}
                      onChange={(e) => setMovementForm({ ...movementForm, destinationLocationId: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2"
                    >
                      <option value="">None / Consumed</option>
                      {locations.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Reason Notes */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Reason / Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Explanation for audit compliance..."
                    value={movementForm.reasonNotes}
                    onChange={(e) => setMovementForm({ ...movementForm, reasonNotes: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowMovementModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-ohana-terracotta hover:bg-ohana-terracotta-600 text-white rounded-xl font-bold shadow-xs"
                  >
                    Confirm & Record Entry
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

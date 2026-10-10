import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ScanLine, 
  Search, 
  Boxes, 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  QrCode,
  Tag
} from 'lucide-react';

export const BarcodeScannerView: React.FC = () => {
  const { findVariantBySkuOrBarcode, recordStockMovement, locations, partners, currentRole } = useApp();
  
  const [scanInput, setScanInput] = useState('');
  const [scannedResult, setScannedResult] = useState<ReturnType<typeof findVariantBySkuOrBarcode> | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Action form state
  const [actionType, setActionType] = useState<'dispatch' | 'damage' | 'count_audit'>('dispatch');
  const [quantity, setQuantity] = useState(1);
  const [targetLocationId, setTargetLocationId] = useState('loc-ret-01');
  const [notes, setNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState(false);

  const formatKes = (amount: number) => `KES ${amount.toLocaleString()}`;

  const handleScanOrSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    const res = findVariantBySkuOrBarcode(scanInput);
    setScannedResult(res);
    setHasSearched(true);
  };

  const handleExecuteStockAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedResult || quantity <= 0) return;

    const { variant, product } = scannedResult;

    if (actionType === 'dispatch') {
      recordStockMovement({
        variantId: variant.id,
        quantity: -quantity,
        movementType: 'dispatch_to_partner',
        sourceLocationId: 'loc-wh-01',
        destinationLocationId: targetLocationId,
        referenceId: `SCAN-DSP-${Date.now().toString().slice(-4)}`,
        reasonNotes: notes || `Scanner dispatch to retailer`,
        recordedBy: `${currentRole.toUpperCase()}`,
      });
    } else if (actionType === 'damage') {
      recordStockMovement({
        variantId: variant.id,
        quantity: -quantity,
        movementType: 'damaged_lost_stock',
        sourceLocationId: targetLocationId,
        referenceId: `SCAN-DMG-${Date.now().toString().slice(-4)}`,
        reasonNotes: notes || `Damaged item logged via barcode inspection`,
        recordedBy: `${currentRole.toUpperCase()}`,
      });
    } else {
      recordStockMovement({
        variantId: variant.id,
        quantity: quantity,
        movementType: 'physical_count_adjustment',
        destinationLocationId: targetLocationId,
        referenceId: `SCAN-CNT-${Date.now().toString().slice(-4)}`,
        reasonNotes: notes || `Physical count verified via handheld scan`,
        recordedBy: `${currentRole.toUpperCase()}`,
      });
    }

    setActionSuccess(true);
    setTimeout(() => {
      setActionSuccess(false);
      setScanInput('');
      setScannedResult(null);
      setHasSearched(false);
      setNotes('');
    }, 1500);
  };

  const quickSampleBarcodes = [
    { sku: 'OHA-DS-TER-S', code: '890123456701', label: 'Bikini Terracotta (S)' },
    { sku: 'OHA-DS-TER-M', code: '890123456702', label: 'Bikini Terracotta (M)' },
    { sku: 'OHA-LC-CR-S', code: '890123456704', label: 'One-Piece Coral (S)' },
    { sku: 'OHA-WW-GRN-OS', code: '890123456707', label: 'Kimono Cover-up (OS)' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-ohana-charcoal-900 font-display">
          Barcode & QR Handheld Scanner
        </h1>
        <p className="text-xs text-gray-500">
          Fast optical identification for picking dispatches, physical stock counts, and damaged units.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Scanner Input & Presets (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white rounded-2xl border border-ohana-sand-300 p-6 shadow-xs space-y-4">
            
            <div className="flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-ohana-terracotta" />
              <h2 className="text-sm font-bold text-ohana-charcoal-900">
                Scan or Enter SKU / Barcode
              </h2>
            </div>

            <form onSubmit={handleScanOrSearch} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Scan barcode with camera or type SKU..."
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  className="w-full pl-3 pr-10 py-3 text-sm font-mono font-bold border-2 border-ohana-terracotta/40 rounded-xl focus:border-ohana-terracotta focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-ohana-terracotta hover:bg-ohana-terracotta-600 text-white p-2 rounded-lg transition-all"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Quick Sample Chips */}
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1.5">
                Quick Test Codes (Click to scan):
              </span>
              <div className="grid grid-cols-2 gap-2">
                {quickSampleBarcodes.map(b => (
                  <button
                    key={b.sku}
                    type="button"
                    onClick={() => {
                      setScanInput(b.code);
                      const res = findVariantBySkuOrBarcode(b.code);
                      setScannedResult(res);
                      setHasSearched(true);
                    }}
                    className="p-2 text-left bg-ohana-sand-50 hover:bg-ohana-sand-100 rounded-lg border border-ohana-sand-200 text-xs transition-colors"
                  >
                    <span className="font-mono font-bold text-ohana-charcoal-900 block text-[11px]">{b.sku}</span>
                    <span className="text-[10px] text-gray-500">{b.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <span className="font-bold">Operational Guardrail: </span>
              A barcode scan opens the product context. Stock is never deducted silently without explicit user confirmation of quantity and transaction intent.
            </p>
          </div>

        </div>

        {/* Right Column: Scanned Result & Confirmed Transaction Action (7 cols) */}
        <div className="lg:col-span-7">
          {scannedResult ? (
            <div className="bg-white rounded-2xl border border-ohana-sand-300 shadow-md p-6 space-y-6">
              
              {/* Product Info */}
              <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
                <img
                  src={scannedResult.product.imageUrl}
                  alt={scannedResult.product.name}
                  className="w-16 h-16 rounded-xl object-cover border border-gray-200 shadow-xs"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                      {scannedResult.variant.sku}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      Barcode: {scannedResult.variant.barcode}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-ohana-charcoal-900 mt-1">
                    {scannedResult.product.name}
                  </h2>
                  <p className="text-xs text-gray-600">
                    Color: <span className="font-bold">{scannedResult.variant.colorPrint}</span> · Size: <span className="font-bold">{scannedResult.variant.size}</span>
                  </p>
                </div>
              </div>

              {/* Current Stock Across Locations */}
              <div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Real-Time Stock Locations for Scanned Variant
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {locations.map(loc => {
                    const qty = scannedResult.variant.stockByLocation[loc.id] || 0;
                    return (
                      <div key={loc.id} className="p-2.5 bg-ohana-sand-50 rounded-xl border border-ohana-sand-200">
                        <span className="text-[10px] text-gray-500 block truncate">{loc.name}</span>
                        <span className="text-sm font-bold text-ohana-charcoal-900 font-display">
                          {qty} units
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Form */}
              {actionSuccess ? (
                <div className="p-8 text-center space-y-2 bg-emerald-50 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                  <h3 className="text-sm font-bold text-emerald-900">Transaction Confirmed & Recorded!</h3>
                  <p className="text-xs text-emerald-700">Stock ledger and balances updated.</p>
                </div>
              ) : (
                <form onSubmit={handleExecuteStockAction} className="space-y-4 text-xs pt-2 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-gray-900">Execute Confirmed Stock Movement</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Action</label>
                      <select
                        value={actionType}
                        onChange={(e) => setActionType(e.target.value as any)}
                        className="w-full border border-gray-300 rounded-lg p-2 font-semibold"
                      >
                        <option value="dispatch">Dispatch to Retailer</option>
                        <option value="damage">Mark Damaged</option>
                        <option value="count_audit">Audit Count Verify</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="w-full border border-gray-300 rounded-lg p-2 font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Target Location</label>
                      <select
                        value={targetLocationId}
                        onChange={(e) => setTargetLocationId(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2"
                      >
                        {locations.map(l => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Reference Notes (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Verified by warehouse scanner..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setScannedResult(null)}
                      className="px-4 py-2 border border-gray-300 rounded-xl font-semibold text-gray-700"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-ohana-terracotta hover:bg-ohana-terracotta-600 text-white rounded-xl font-bold shadow-xs"
                    >
                      Confirm Stock Transaction
                    </button>
                  </div>
                </form>
              )}

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-ohana-sand-300 p-12 text-center text-gray-400">
              <ScanLine className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-bold text-gray-700">No Variant Scanned</p>
              <p className="text-xs text-gray-400 mt-1">
                Scan a barcode above or click any sample code to inspect inventory and trigger stock actions.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

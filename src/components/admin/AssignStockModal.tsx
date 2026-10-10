import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Boxes, 
  Store, 
  DollarSign, 
  CheckCircle2, 
  X,
  PackagePlus,
  ArrowRight,
  AlertTriangle,
  Factory
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultStoreId?: string;
}

export const AssignStockModal: React.FC<Props> = ({ isOpen, onClose, defaultStoreId }) => {
  const { storeAccounts, products, locations, assignItemToStore, setActiveView } = useApp();

  const warehouseLoc = locations.find(l => l.type === 'central_warehouse') || locations[0];
  const warehouseId = warehouseLoc ? warehouseLoc.id : 'loc-wh-01';

  // Flat list of manufactured items with available main stock
  const allManufacturedVariants = products.flatMap(p => 
    p.variants.map(v => {
      const availableMainStock = v.stockByLocation[warehouseId] || 0;
      const cost = v.unitCostKes || p.wholesalePriceKes || 1800;
      return {
        product: p,
        variant: v,
        availableMainStock,
        cost,
      };
    })
  );

  const initialVariant = allManufacturedVariants[0];

  const [selectedStoreId, setSelectedStoreId] = useState(defaultStoreId || storeAccounts[0]?.id || '');
  const [selectedVariantId, setSelectedVariantId] = useState(() => {
    return initialVariant?.variant.id || '';
  });
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [costKes, setCostKes] = useState<number>(() => {
    return initialVariant?.cost || 1800;
  });
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Selected item details
  const activeSelection = allManufacturedVariants.find(item => item.variant.id === selectedVariantId) || initialVariant;
  const availableMainStock = activeSelection?.availableMainStock || 0;
  const currentProduct = activeSelection?.product;
  const currentVariant = activeSelection?.variant;

  const handleVariantChange = (varId: string) => {
    setSelectedVariantId(varId);
    setErrorMsg(null);
    const found = allManufacturedVariants.find(item => item.variant.id === varId);
    if (found) {
      setCostKes(found.cost);
      if (stockQuantity > found.availableMainStock) {
        setStockQuantity(Math.max(1, Math.min(10, found.availableMainStock)));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedStoreId || !selectedVariantId || stockQuantity <= 0) {
      setErrorMsg('Please select a valid store, product, and quantity.');
      return;
    }

    if (stockQuantity > availableMainStock) {
      setErrorMsg(`Cannot assign ${stockQuantity} units! Only ${availableMainStock} units remain in Main Factory Stock.`);
      return;
    }

    assignItemToStore({
      storeId: selectedStoreId,
      variantId: selectedVariantId,
      stock: stockQuantity,
      costKes,
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  };

  const selectedStore = storeAccounts.find(s => s.id === selectedStoreId) || storeAccounts[0];
  const formatKes = (amount: number) => `KES ${amount.toLocaleString()}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-ohana-sand-300 relative animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <PackagePlus className="w-5 h-5 text-ohana-terracotta" />
          <h2 className="text-base font-bold font-display text-ohana-charcoal-900">
            Assign Factory Stock to Store
          </h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Select swimwear received from the factory and allocate units to a store. 
          Stock will be deducted sequentially from Main Factory Stock.
        </p>

        {success ? (
          <div className="p-8 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="text-sm font-bold text-emerald-900">Stock Assigned Successfully!</h3>
            <p className="text-xs text-emerald-700">
              {stockQuantity} units of {currentProduct?.name} assigned to {selectedStore?.name}. 
              {availableMainStock - stockQuantity} units now remaining in Main Stock.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Target Store Selection */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Target Retail Store / Boutique</label>
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 font-bold text-gray-900 focus:border-ohana-terracotta outline-none"
              >
                {storeAccounts.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.name} ({store.locationCity})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Select Manufactured Item Dropdown */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-gray-700 font-semibold">
                  Select Item Received from Factory
                </label>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setActiveView('production');
                  }}
                  className="text-[11px] text-ohana-terracotta hover:underline font-bold"
                >
                  + Manufacture New Item
                </button>
              </div>

              <select
                value={selectedVariantId}
                onChange={(e) => handleVariantChange(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 font-medium text-gray-900 focus:border-ohana-terracotta outline-none"
              >
                {allManufacturedVariants.map(({ product, variant, availableMainStock, cost }) => (
                  <option key={variant.id} value={variant.id}>
                    {product.name} — {variant.colorPrint} ({variant.size}) | {availableMainStock} available in Main Stock (Cost: KES {cost.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Live Main Factory Stock Pill */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Factory className="w-4 h-4 text-emerald-700" />
                <span className="font-semibold text-emerald-900">Available in Main Factory Stock:</span>
              </div>
              <span className="font-bold text-sm font-display text-emerald-800">
                {availableMainStock} Units
              </span>
            </div>

            {/* 3. Number of Stock & Agreed Cost */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Quantity to Assign
                </label>
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, availableMainStock)}
                  value={stockQuantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setStockQuantity(val);
                    if (val > availableMainStock) {
                      setErrorMsg(`Max available in Main Stock is ${availableMainStock} units.`);
                    } else {
                      setErrorMsg(null);
                    }
                  }}
                  className={`w-full border rounded-xl p-2.5 font-bold text-base outline-none ${
                    stockQuantity > availableMainStock 
                      ? 'border-red-400 text-red-600 bg-red-50' 
                      : 'border-gray-300 text-ohana-charcoal-900 focus:border-ohana-terracotta'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Agreed Wholesale Cost (KES)
                </label>
                <input
                  type="number"
                  min="100"
                  step="50"
                  value={costKes}
                  onChange={(e) => setCostKes(parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-bold text-base text-ohana-terracotta focus:border-ohana-terracotta outline-none"
                  required
                />
              </div>
            </div>

            {/* Depletion Math Summary */}
            <div className="p-3.5 bg-ohana-sand-50 rounded-2xl border border-ohana-sand-300 space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                Sequential Allocation Math:
              </span>
              <div className="flex items-center justify-between text-gray-700">
                <span>Before Assignment (Main Stock):</span>
                <span className="font-semibold">{availableMainStock} units</span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span>Deduction to {selectedStore?.name}:</span>
                <span className="font-bold text-ohana-terracotta">-{stockQuantity} units</span>
              </div>
              <div className="flex items-center justify-between text-gray-900 font-bold border-t border-gray-200 pt-1.5">
                <span>Remaining Main Factory Stock:</span>
                <span className="font-display text-emerald-700">
                  {Math.max(0, availableMainStock - stockQuantity)} units
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-900 font-bold border-t border-gray-200 pt-1.5">
                <span>Total Value Assigned:</span>
                <span className="font-display text-ohana-terracotta text-sm">
                  {formatKes(stockQuantity * costKes)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={stockQuantity > availableMainStock || availableMainStock <= 0}
                className="px-5 py-2.5 bg-ohana-terracotta hover:bg-ohana-terracotta-600 disabled:opacity-50 text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <PackagePlus className="w-4 h-4" />
                <span>Confirm Assignment</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

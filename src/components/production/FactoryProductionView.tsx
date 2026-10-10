import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { 
  Factory, 
  PackagePlus, 
  Boxes, 
  Plus, 
  CheckCircle2, 
  ArrowRight, 
  Tag, 
  Sparkles,
  X,
  Layers,
  Store
} from 'lucide-react';

export const FactoryProductionView: React.FC = () => {
  const { products, locations, createFactoryProduction, setActiveView } = useApp();

  const [showProductionModal, setShowProductionModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState<Product['category']>('Bikini');
  const [description, setDescription] = useState('');
  const [colorPrint, setColorPrint] = useState('');
  const [size, setSize] = useState<'XS' | 'S' | 'M' | 'L' | 'XL' | 'One Size'>('M');
  const [costKes, setCostKes] = useState<number>(1800);
  const [quantity, setQuantity] = useState<number>(100);
  const [notes, setNotes] = useState('');

  // Quick preset or select existing product
  const [useExistingProduct, setUseExistingProduct] = useState(false);
  const [selectedExistingId, setSelectedExistingId] = useState(products[0]?.id || '');

  const warehouseLoc = locations.find(l => l.type === 'central_warehouse') || locations[0];
  const warehouseId = warehouseLoc ? warehouseLoc.id : 'loc-wh-01';

  const formatKes = (amount: number) => `KES ${amount.toLocaleString()}`;

  const handleSelectExisting = (prodId: string) => {
    setSelectedExistingId(prodId);
    const found = products.find(p => p.id === prodId);
    if (found) {
      setProductName(found.name);
      setCategory(found.category);
      setDescription(found.description);
      setCostKes(found.wholesalePriceKes || found.baseCostKes || 1800);
      if (found.variants.length > 0) {
        setColorPrint(found.variants[0].colorPrint);
        setSize(found.variants[0].size);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !colorPrint.trim() || quantity <= 0 || costKes <= 0) return;

    const res = createFactoryProduction({
      productName: productName.trim(),
      category,
      description,
      colorPrint: colorPrint.trim(),
      size,
      costKes,
      quantity,
      notes,
    });

    setSuccessMessage(`Manufactured ${quantity} units of "${res.product.name}" (${colorPrint} / ${size}) added directly to Main Factory Stock!`);
    setShowProductionModal(false);

    // Reset Form
    setProductName('');
    setColorPrint('');
    setQuantity(100);
    setCostKes(1800);
    setNotes('');

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  // Compute aggregate stats
  const allVariantsList = products.flatMap(p => 
    p.variants.map(v => {
      const mainStockQty = v.stockByLocation[warehouseId] || 0;
      const otherLocationsStock = Object.entries(v.stockByLocation)
        .filter(([locId]) => locId !== warehouseId)
        .reduce((sum, [, q]) => sum + q, 0);

      return {
        product: p,
        variant: v,
        mainStockQty,
        assignedToStoresQty: otherLocationsStock,
        totalProduced: v.totalManufactured || (mainStockQty + otherLocationsStock),
      };
    })
  );

  const totalMainStockUnits = allVariantsList.reduce((acc, curr) => acc + curr.mainStockQty, 0);
  const totalAssignedUnits = allVariantsList.reduce((acc, curr) => acc + curr.assignedToStoresQty, 0);
  const totalManufacturedUnits = allVariantsList.reduce((acc, curr) => acc + curr.totalProduced, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs uppercase font-bold tracking-wider text-ohana-charcoal-700">
              Owned Production Plant & Central Warehouse
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-ohana-charcoal-900 font-display">
            Factory Production & Main Stock
          </h1>
          <p className="text-xs text-gray-500 max-w-2xl">
            As the factory owner, record newly manufactured swimsuits directly into Main Stock. 
            Created items and their cost are immediately ready for sequential allocation across retail outlets.
          </p>
        </div>

        <button
          onClick={() => {
            setShowProductionModal(true);
            if (products.length > 0 && !productName) {
              handleSelectExisting(products[0].id);
            }
          }}
          className="flex items-center gap-2 bg-ohana-terracotta hover:bg-ohana-terracotta-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all self-start sm:self-auto transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>+ Record New Production</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold">{successMessage}</span>
          </div>
          <button
            onClick={() => setActiveView('assign_stock')}
            className="flex items-center gap-1 px-3 py-1 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 text-xs shrink-0"
          >
            <span>Assign to Stores</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-ohana-sand-300 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
            <span>Main Factory Stock (Available)</span>
            <Boxes className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-display text-emerald-700">
            {totalMainStockUnits} <span className="text-xs font-normal text-gray-500">units</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Stock at Central Warehouse ready to assign to stores
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ohana-sand-300 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
            <span>Assigned Out to Stores</span>
            <Store className="w-4 h-4 text-ohana-terracotta" />
          </div>
          <div className="text-2xl font-bold font-display text-ohana-terracotta">
            {totalAssignedUnits} <span className="text-xs font-normal text-gray-500">units</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Distributed to Diani, Watamu, Nairobi, and boutiques
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ohana-sand-300 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
            <span>Total Units Manufactured</span>
            <Factory className="w-4 h-4 text-ohana-charcoal-700" />
          </div>
          <div className="text-2xl font-bold font-display text-ohana-charcoal-900">
            {totalManufacturedUnits} <span className="text-xs font-normal text-gray-500">units</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Lifetime cumulative factory production volume
          </p>
        </div>
      </div>

      {/* Production & Stock Ledger Table */}
      <div className="bg-white rounded-3xl border border-ohana-sand-300 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-ohana-charcoal-900 font-display">
              Main Factory Inventory & Stock Depletion
            </h2>
            <p className="text-xs text-gray-500">
              Manufactured items, unit prices, remaining factory stock, and retail allocations.
            </p>
          </div>
          <span className="text-xs font-bold text-ohana-charcoal-800 bg-ohana-sand-100 px-3 py-1 rounded-full border border-ohana-sand-300 self-start sm:self-auto">
            {allVariantsList.length} Active Product Variants
          </span>
        </div>

        {/* Mobile View: Cards */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {allVariantsList.map(({ product, variant, mainStockQty, assignedToStoresQty, totalProduced }) => (
            <div key={variant.id} className="p-4 rounded-2xl border border-ohana-sand-200 bg-white shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-ohana-terracotta bg-ohana-sand-100 px-2 py-0.5 rounded-full uppercase">
                    {product.category}
                  </span>
                  <h3 className="font-bold text-sm text-ohana-charcoal-900 mt-1">{product.name}</h3>
                  <p className="text-xs text-gray-500">{variant.colorPrint} · Size {variant.size} ({variant.sku})</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 font-display bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                  {formatKes(variant.unitCostKes || product.wholesalePriceKes || 1800)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-ohana-sand-50/70 p-2.5 rounded-xl text-center text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 block">Produced</span>
                  <span className="font-bold text-gray-900">{totalProduced}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">Assigned</span>
                  <span className="font-bold text-ohana-terracotta">{assignedToStoresQty}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">Main Stock</span>
                  <span className="font-bold text-emerald-700 text-sm">{mainStockQty}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveView('assign_stock')}
                className="w-full py-2 bg-ohana-charcoal-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Assign to Stores</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ohana-sand-50/80 border-b border-ohana-sand-200 text-gray-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Product Name & Category</th>
                <th className="py-3 px-3 font-semibold">Color / Print</th>
                <th className="py-3 px-3 text-center font-semibold">Size</th>
                <th className="py-3 px-3 text-right font-semibold">Cost (KES)</th>
                <th className="py-3 px-3 text-center font-semibold">Total Produced</th>
                <th className="py-3 px-3 text-center font-semibold">Assigned Out</th>
                <th className="py-3 px-3 text-center font-semibold">Main Stock Remaining</th>
                <th className="py-3 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ohana-sand-200 font-medium">
              {allVariantsList.map(({ product, variant, mainStockQty, assignedToStoresQty, totalProduced }) => (
                <tr key={variant.id} className="hover:bg-ohana-sand-50/50">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-ohana-charcoal-900">{product.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono flex items-center gap-2">
                      <span>{variant.sku}</span>
                      <span>·</span>
                      <span className="text-ohana-terracotta">{product.category}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-gray-700">
                    {variant.colorPrint}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-bold">
                      {variant.size}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-display font-bold text-ohana-charcoal-900">
                    {formatKes(variant.unitCostKes || product.wholesalePriceKes || 1800)}
                  </td>
                  <td className="py-3.5 px-3 text-center font-bold text-gray-700">
                    {totalProduced} units
                  </td>
                  <td className="py-3.5 px-3 text-center font-bold text-ohana-terracotta">
                    {assignedToStoresQty} units
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full font-bold font-display text-xs ${
                      mainStockQty <= 0 ? 'bg-red-100 text-red-800' :
                      mainStockQty <= 15 ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}>
                      {mainStockQty} units
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setActiveView('assign_stock')}
                      className="px-3 py-1.5 bg-ohana-charcoal-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 shadow-xs"
                    >
                      <span>Assign</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD FACTORY PRODUCTION MODAL */}
      {showProductionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-ohana-sand-300 relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setShowProductionModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Factory className="w-5 h-5 text-ohana-terracotta" />
              <h2 className="text-base font-bold font-display text-ohana-charcoal-900">
                Record New Factory Production
              </h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Enter newly manufactured swimwear batch. Items and agreed costs will be added to Central Warehouse stock and become selectable across all store allocations.
            </p>

            {/* Quick Toggle: Existing Product vs New Creation */}
            <div className="flex items-center gap-2 p-1 bg-ohana-sand-100 rounded-xl mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setUseExistingProduct(false)}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  !useExistingProduct ? 'bg-white shadow-xs text-ohana-charcoal-900' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                + Create Brand New Item
              </button>
              <button
                type="button"
                onClick={() => {
                  setUseExistingProduct(true);
                  if (products[0]) handleSelectExisting(products[0].id);
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  useExistingProduct ? 'bg-white shadow-xs text-ohana-charcoal-900' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Add Batch to Existing Item
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              
              {useExistingProduct ? (
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Select Existing Swimwear Style</label>
                  <select
                    value={selectedExistingId}
                    onChange={(e) => handleSelectExisting(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-bold text-gray-900 focus:border-ohana-terracotta outline-none"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.category}) — Default Cost: KES {p.wholesalePriceKes.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Swimwear Item Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sunset Halter Bikini, Diani Swim Shorts..."
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-2.5 font-bold text-ohana-charcoal-900 focus:border-ohana-terracotta outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as Product['category'])}
                        className="w-full border border-gray-300 rounded-xl p-2.5 font-bold text-gray-900 focus:border-ohana-terracotta outline-none"
                      >
                        <option value="Bikini">Bikini</option>
                        <option value="One-Piece">One-Piece</option>
                        <option value="Cover-up">Cover-up</option>
                        <option value="Men Trunks">Men Trunks</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Short Description</label>
                      <input
                        type="text"
                        placeholder="e.g. UV50+ ribbed fabric"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl p-2.5 font-medium text-gray-900 focus:border-ohana-terracotta outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Variant Details: Color & Size */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Color / Print</label>
                  <input
                    type="text"
                    placeholder="e.g. Terracotta Red, Ocean Blue..."
                    value={colorPrint}
                    onChange={(e) => setColorPrint(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold text-gray-900 focus:border-ohana-terracotta outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Size</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-bold text-gray-900 focus:border-ohana-terracotta outline-none"
                  >
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="One Size">One Size</option>
                  </select>
                </div>
              </div>

              {/* Quantity Produced & Agreed Cost */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Units Manufactured (Qty)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-bold text-base text-emerald-700 focus:border-ohana-terracotta outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Cost Price (KES)
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

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Production Batch Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Batch #4 - Fresh fabric roll from Mombasa"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2 font-medium text-gray-700 focus:border-ohana-terracotta outline-none"
                />
              </div>

              {/* Production Summary Card */}
              <div className="p-4 bg-ohana-sand-50 rounded-2xl border border-ohana-sand-300 space-y-1.5 text-xs">
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                  Production Inflow Summary:
                </span>
                <div className="flex items-center justify-between text-gray-800">
                  <span>Batch Output:</span>
                  <span className="font-bold text-ohana-charcoal-900">
                    +{quantity} Units to Main Factory Stock
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-800">
                  <span>Item Cost per Unit:</span>
                  <span className="font-bold text-ohana-charcoal-900">{formatKes(costKes)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-800">
                  <span>Total Batch Valuation:</span>
                  <span className="font-bold text-ohana-terracotta font-display text-sm">
                    {formatKes(quantity * costKes)}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 pt-1">
                  Once saved, you can immediately assign these units to Diani, Watamu, or any store from the Store Assignment section.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowProductionModal(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-ohana-terracotta hover:bg-ohana-terracotta-600 text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <PackagePlus className="w-4 h-4" />
                  <span>Add to Main Stock</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

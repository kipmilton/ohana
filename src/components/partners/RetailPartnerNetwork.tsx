import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RetailPartner, AgreementType } from '../../types';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Boxes, 
  FileText, 
  Plus, 
  X,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const RetailPartnerNetwork: React.FC = () => {
  const { partners, invoices, dispatches, salesReports, setActiveView } = useApp();
  const [selectedPartner, setSelectedPartner] = useState<RetailPartner | null>(null);
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);

  const formatKes = (amount: number) => `KES ${amount.toLocaleString()}`;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ohana-charcoal-900 font-display">
            Retail Stockist Network
          </h1>
          <p className="text-xs text-gray-500">
            Independent partner boutiques, concept stores, and resort stockists across Kenya.
          </p>
        </div>

        <button
          onClick={() => setShowAddPartnerModal(true)}
          className="flex items-center gap-1.5 bg-ohana-terracotta hover:bg-ohana-terracotta-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Retail Partner</span>
        </button>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {partners.map((partner) => {
          const partnerInvoices = invoices.filter(i => i.partnerId === partner.id);
          const hasOverdue = partnerInvoices.some(i => i.status === 'overdue');

          return (
            <div 
              key={partner.id}
              className="bg-white rounded-2xl border border-ohana-sand-300 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-gray-400 block mb-0.5">
                      {partner.code}
                    </span>
                    <h2 className="font-bold text-sm text-ohana-charcoal-900 group-hover:text-ohana-terracotta transition-colors">
                      {partner.name}
                    </h2>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    partner.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {partner.status}
                  </span>
                </div>

                {/* Location & Contact */}
                <div className="space-y-1.5 text-xs text-gray-600 mb-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-ohana-terracotta shrink-0" />
                    <span className="truncate">{partner.locationCity} ({partner.address})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{partner.phone} ({partner.contactName})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{partner.email}</span>
                  </div>
                </div>

                {/* Commercial Terms Badge */}
                <div className="mb-4">
                  <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Commercial Agreement:</div>
                  <div className="bg-ohana-sand-100 border border-ohana-sand-300 p-2 rounded-lg text-xs font-semibold text-gray-800">
                    {partner.agreementType === 'consignment_fixed_wholesale' ? (
                      <span>Fixed Wholesale ({partner.wholesaleDiscountPct}% Margin)</span>
                    ) : (
                      <span>Sales Commission ({partner.commissionRate}% to Partner)</span>
                    )}
                    <span className="block text-[10px] text-gray-500 font-normal">
                      Settlement window: Net {partner.paymentTermsDays} Days
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">Stock on Hand</span>
                    <span className="font-bold text-ohana-charcoal-900 font-display text-sm">
                      {partner.stockOnHandUnits}
                    </span>
                    <span className="text-[9px] text-gray-400 block">units held</span>
                  </div>

                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">Total Sales</span>
                    <span className="font-bold text-ohana-charcoal-900 font-display text-sm">
                      {formatKes(partner.totalSalesKes)}
                    </span>
                    <span className="text-[9px] text-gray-400 block">gross revenue</span>
                  </div>
                </div>
              </div>

              {/* Balance & Actions */}
              <div>
                <div className="flex items-center justify-between p-2.5 bg-ohana-sand-50 rounded-xl mb-3 border border-ohana-sand-200">
                  <span className="text-xs font-semibold text-gray-600">Balance Due:</span>
                  <span className={`text-xs font-bold font-display ${
                    partner.currentBalanceKes > 0 ? 'text-ohana-terracotta' : 'text-emerald-700'
                  }`}>
                    {formatKes(partner.currentBalanceKes)}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedPartner(partner)}
                  className="w-full text-center py-2 px-3 bg-ohana-charcoal-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all"
                >
                  View Partner Statement & History
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* PARTNER DETAIL MODAL */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-ohana-sand-300 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedPartner(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-ohana-terracotta-50 border border-ohana-terracotta-200 flex items-center justify-center text-ohana-terracotta font-bold text-sm">
                {selectedPartner.code.slice(-2)}
              </div>
              <div>
                <h2 className="text-base font-bold text-ohana-charcoal-900 font-display">
                  {selectedPartner.name}
                </h2>
                <p className="text-xs text-gray-500">
                  {selectedPartner.locationCity} · Contact: {selectedPartner.contactName} ({selectedPartner.phone})
                </p>
              </div>
            </div>

            {/* Invoices for this Partner */}
            <div className="space-y-4 text-xs">
              
              <div className="bg-ohana-sand-50 p-4 rounded-xl border border-ohana-sand-200 grid grid-cols-3 gap-3">
                <div>
                  <span className="text-gray-500 block text-[11px]">Outstanding Owed:</span>
                  <span className="text-base font-bold text-ohana-terracotta font-display">
                    {formatKes(selectedPartner.currentBalanceKes)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Reporting Compliance:</span>
                  <span className="text-base font-bold text-emerald-700 font-display">
                    {selectedPartner.complianceRatePct}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Payment Terms:</span>
                  <span className="text-base font-bold text-gray-900 font-display">
                    Net {selectedPartner.paymentTermsDays} Days
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Invoices Issued to Partner</h3>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Invoice #</th>
                        <th className="p-2.5">Period</th>
                        <th className="p-2.5 text-right">Total</th>
                        <th className="p-2.5 text-right">Balance Due</th>
                        <th className="p-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {invoices
                        .filter(i => i.partnerId === selectedPartner.id)
                        .map(inv => (
                          <tr key={inv.id}>
                            <td className="p-2.5 font-mono font-bold text-ohana-charcoal-900">{inv.invoiceNumber}</td>
                            <td className="p-2.5 text-gray-600">{inv.period}</td>
                            <td className="p-2.5 text-right font-bold">{formatKes(inv.totalAmountKes)}</td>
                            <td className="p-2.5 text-right font-bold text-ohana-terracotta">{formatKes(inv.balanceDueKes)}</td>
                            <td className="p-2.5 text-center">
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                                inv.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  onClick={() => {
                    setSelectedPartner(null);
                    setActiveView('invoices');
                  }}
                  className="px-4 py-2 bg-ohana-terracotta hover:bg-ohana-terracotta-600 text-white font-bold rounded-xl text-xs"
                >
                  Manage Invoices & Payments →
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ONBOARD NEW PARTNER MODAL */}
      {showAddPartnerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-ohana-sand-300 relative">
            <button
              onClick={() => setShowAddPartnerModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-ohana-charcoal-900 mb-1 font-display">
              Onboard Retail Partner
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Register a new stockist in Kenya with agreed consignment wholesale terms.
            </p>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                alert('Partner account created! Supabase schema row registered.');
                setShowAddPartnerModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Store / Boutique Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Watamu Marine Boutique" 
                  className="w-full border border-gray-300 rounded-lg p-2" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">City / Region</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Kilifi / Watamu" 
                    className="w-full border border-gray-300 rounded-lg p-2" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Store Code</label>
                  <input 
                    type="text" 
                    placeholder="e.g. OH-WATAMU" 
                    className="w-full border border-gray-300 rounded-lg p-2 font-mono uppercase" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Agreement Type</label>
                <select className="w-full border border-gray-300 rounded-lg p-2 font-semibold">
                  <option value="consignment_fixed_wholesale">Consignment: Fixed Agreed Wholesale per Sold Unit</option>
                  <option value="consignment_commission_percentage">Consignment: Commission % on Retail Customer Price</option>
                  <option value="direct_purchase">Direct Purchase (Upfront Wholesale Buy)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Contact Person</label>
                  <input type="text" placeholder="Manager Name" className="w-full border border-gray-300 rounded-lg p-2" required />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Phone Number</label>
                  <input type="text" placeholder="+254 7..." className="w-full border border-gray-300 rounded-lg p-2" required />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddPartnerModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-ohana-terracotta text-white rounded-xl font-bold shadow-xs hover:bg-ohana-terracotta-600"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

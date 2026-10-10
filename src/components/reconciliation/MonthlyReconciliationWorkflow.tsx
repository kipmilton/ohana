import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MonthlySalesReport, MonthlySalesReportItem } from '../../types';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  FileText, 
  ShieldCheck, 
  Plus, 
  Clock, 
  Send, 
  Sparkles,
  X,
  Eye,
  Receipt
} from 'lucide-react';

export const MonthlyReconciliationWorkflow: React.FC = () => {
  const { 
    salesReports, 
    partners, 
    products, 
    approveMonthlyReportAndGenerateInvoice, 
    submitMonthlyReport,
    setActiveView,
    currentRole 
  } = useApp();

  const [selectedReport, setSelectedReport] = useState<MonthlySalesReport | null>(salesReports[0] || null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState<string | null>(null);

  const formatKes = (amount: number) => `KES ${amount.toLocaleString()}`;

  // Handle Approve
  const handleApprove = (reportId: string) => {
    try {
      const generatedInvoice = approveMonthlyReportAndGenerateInvoice(
        reportId, 
        'Verified against physically counted closing stock report.'
      );
      setApprovalSuccess(`Invoice ${generatedInvoice.invoiceNumber} successfully generated!`);
      setTimeout(() => {
        setApprovalSuccess(null);
      }, 4000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ohana-charcoal-900 font-display">
            Consignment Sales Reconciliation
          </h1>
          <p className="text-xs text-gray-500">
            Automated month-end stock balancing: Opening Stock + Dispatches - Sold - Returns = Expected vs Physical Count.
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="flex items-center gap-1.5 bg-ohana-terracotta hover:bg-ohana-terracotta-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Partner Month-End Report</span>
        </button>
      </div>

      {/* Visual Workflow Steps (Brief Section 7) */}
      <div className="bg-white p-5 rounded-2xl border border-ohana-sand-300 shadow-xs">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
          The Ohana Monthly Consignment Architecture
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs relative">
          
          <div className="p-3.5 bg-ohana-sand-50 rounded-xl border border-ohana-sand-200">
            <div className="w-6 h-6 rounded-full bg-ohana-charcoal-900 text-white flex items-center justify-center font-bold text-xs mb-2">
              1
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Stock Dispatched</h3>
            <p className="text-gray-500 text-[11px] leading-relaxed">
              Ohana sends products with dispatch notes. Variants & quantities logged into transit.
            </p>
          </div>

          <div className="p-3.5 bg-ohana-sand-50 rounded-xl border border-ohana-sand-200">
            <div className="w-6 h-6 rounded-full bg-ohana-charcoal-900 text-white flex items-center justify-center font-bold text-xs mb-2">
              2
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Month-End Sales</h3>
            <p className="text-gray-500 text-[11px] leading-relaxed">
              Partner reports units sold, customer returns, and damaged fitting room units.
            </p>
          </div>

          <div className="p-3.5 bg-ohana-terracotta-50 rounded-xl border border-ohana-terracotta-200">
            <div className="w-6 h-6 rounded-full bg-ohana-terracotta text-white flex items-center justify-center font-bold text-xs mb-2">
              3
            </div>
            <h3 className="font-bold text-ohana-terracotta mb-1">Reconciliation Check</h3>
            <p className="text-ohana-terracotta-800 text-[11px] leading-relaxed">
              System mathematically verifies expected closing stock vs physical in-store count. Discrepancies flagged.
            </p>
          </div>

          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs mb-2">
              4
            </div>
            <h3 className="font-bold text-emerald-900 mb-1">Invoice Generation</h3>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              Approved report auto-generates official Ohana Tax Invoice for units sold under agreed contract.
            </p>
          </div>

        </div>
      </div>

      {/* Success Notification */}
      {approvalSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-bold">{approvalSuccess}</span>
          </div>
          <button
            onClick={() => setActiveView('invoices')}
            className="px-3 py-1 bg-emerald-700 text-white rounded-lg font-bold hover:bg-emerald-800"
          >
            View Invoices →
          </button>
        </div>
      )}

      {/* Reports List & Active Reconciliation Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: List of Reports */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-ohana-charcoal-900">
            Submitted Monthly Reports
          </h2>

          <div className="space-y-3">
            {salesReports.map((report) => {
              const isSelected = selectedReport?.id === report.id;
              const isFlagged = report.status === 'discrepancy_flagged';
              const isApproved = report.status === 'approved_for_invoice';

              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-white border-ohana-terracotta ring-2 ring-ohana-terracotta/20 shadow-sm'
                      : 'bg-white border-ohana-sand-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono text-gray-500 font-bold block">
                        {report.reportNumber}
                      </span>
                      <h3 className="font-bold text-sm text-ohana-charcoal-900">{report.partnerName}</h3>
                      <span className="text-[11px] text-gray-500 font-medium">{report.periodMonth}</span>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      isApproved ? 'bg-emerald-100 text-emerald-800' :
                      isFlagged ? 'bg-red-100 text-red-800 font-extrabold flex items-center gap-1' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {isFlagged && <AlertTriangle className="w-3 h-3 text-red-600" />}
                      {report.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2 bg-ohana-sand-50 rounded-lg text-[11px] mb-2 font-medium">
                    <div>
                      <span className="text-gray-500 block">Sold Units:</span>
                      <span className="font-bold text-gray-900">{report.reportedSoldUnits} units</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Payable Wholesale:</span>
                      <span className="font-bold text-ohana-terracotta">{formatKes(report.payableWholesaleKes)}</span>
                    </div>
                  </div>

                  {report.discrepancyUnits !== 0 && (
                    <div className="text-[11px] text-red-600 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Discrepancy: {report.discrepancyUnits} units short!</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Detailed Reconciliation Sheet */}
        {selectedReport ? (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-ohana-sand-300 shadow-sm p-6 space-y-6">
            
            {/* Sheet Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-gray-400">{selectedReport.reportNumber}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    selectedReport.status === 'approved_for_invoice' ? 'bg-emerald-100 text-emerald-800' :
                    selectedReport.status === 'discrepancy_flagged' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedReport.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-ohana-charcoal-900 font-display mt-0.5">
                  {selectedReport.partnerName} — {selectedReport.periodMonth} Reconciliation
                </h2>
              </div>

              {selectedReport.status !== 'approved_for_invoice' ? (
                <button
                  onClick={() => handleApprove(selectedReport.id)}
                  className="flex items-center gap-1.5 bg-ohana-terracotta hover:bg-ohana-terracotta-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all self-start sm:self-auto"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Generate Invoice</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    ✓ Invoice Issued
                  </span>
                  <button
                    onClick={() => setActiveView('invoices')}
                    className="text-xs text-ohana-terracotta font-bold hover:underline"
                  >
                    View Invoice →
                  </button>
                </div>
              )}
            </div>

            {/* Reconciliation Mathematics Summary Box (Brief Section 7) */}
            <div className="bg-ohana-sand-50/80 border border-ohana-sand-300 p-4 rounded-xl">
              <h3 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">
                Monthly Stock Movement Formula
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                  <span className="text-[10px] text-gray-500 block">Opening</span>
                  <span className="font-bold text-gray-900 text-sm font-display">{selectedReport.openingStockUnits}</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                  <span className="text-[10px] text-gray-500 block">+ Dispatched</span>
                  <span className="font-bold text-blue-600 text-sm font-display">+{selectedReport.receivedInPeriodUnits}</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                  <span className="text-[10px] text-gray-500 block">- Sold</span>
                  <span className="font-bold text-ohana-terracotta text-sm font-display">-{selectedReport.reportedSoldUnits}</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                  <span className="text-[10px] text-gray-500 block">- Returns</span>
                  <span className="font-bold text-gray-700 text-sm font-display">-{selectedReport.reportedReturnsUnits}</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                  <span className="text-[10px] text-gray-500 block">= Expected</span>
                  <span className="font-bold text-gray-900 text-sm font-display">{selectedReport.expectedClosingStockUnits}</span>
                </div>

                <div className={`p-2.5 rounded-lg border ${
                  selectedReport.discrepancyUnits === 0 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                    : 'bg-red-50 border-red-300 text-red-900'
                }`}>
                  <span className="text-[10px] block font-semibold">Physical Count</span>
                  <span className="font-bold text-sm font-display">
                    {selectedReport.physicallyVerifiedClosingUnits}
                  </span>
                  <span className="text-[9px] block font-bold">
                    ({selectedReport.discrepancyUnits === 0 ? 'Verified Match' : `${selectedReport.discrepancyUnits} Diff`})
                  </span>
                </div>
              </div>

              {selectedReport.discrepancyUnits !== 0 && (
                <div className="mt-3 p-2.5 bg-red-100 border border-red-200 rounded-lg text-xs text-red-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Discrepancy Detected: </span>
                    Partner reported {selectedReport.physicallyVerifiedClosingUnits} units on shelf, but expected {selectedReport.expectedClosingStockUnits}. Missing {Math.abs(selectedReport.discrepancyUnits)} units must be investigated prior to closing book.
                  </div>
                </div>
              )}
            </div>

            {/* Itemized Variant Breakdown */}
            <div>
              <h3 className="text-xs font-bold text-gray-900 mb-2">Itemized Variant Sales & Settlement Lines</h3>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Product & Variant</th>
                      <th className="p-2 text-center">Opening</th>
                      <th className="p-2 text-center">Sold</th>
                      <th className="p-2 text-center">Returns</th>
                      <th className="p-2 text-center">Expected</th>
                      <th className="p-2 text-center font-bold">Physical</th>
                      <th className="p-3 text-right">Wholesale Rate</th>
                      <th className="p-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {selectedReport.items.map((item) => (
                      <tr key={item.id} className="hover:bg-ohana-sand-50/50">
                        <td className="p-3">
                          <div className="font-bold text-ohana-charcoal-900">{item.productName}</div>
                          <div className="text-[10px] text-gray-500 font-mono">{item.sku} ({item.variantDesc})</div>
                        </td>
                        <td className="p-2 text-center text-gray-600">{item.openingQty}</td>
                        <td className="p-2 text-center font-bold text-ohana-terracotta">{item.soldQty}</td>
                        <td className="p-2 text-center text-gray-500">{item.returnedQty}</td>
                        <td className="p-2 text-center text-gray-700">{item.expectedClosingQty}</td>
                        <td className="p-2 text-center font-bold text-gray-900">{item.physicalCountQty}</td>
                        <td className="p-3 text-right font-display">{formatKes(item.unitWholesaleKes)}</td>
                        <td className="p-3 text-right font-bold text-ohana-charcoal-900 font-display">
                          {formatKes(item.lineTotalPayableKes)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-ohana-sand-50 border-t border-gray-200 font-bold text-xs">
                    <tr>
                      <td colSpan={7} className="p-3 text-right text-gray-700">Total Payable Wholesale:</td>
                      <td className="p-3 text-right text-ohana-terracotta font-display text-sm">
                        {formatKes(selectedReport.payableWholesaleKes)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Remarks & Notes */}
            <div className="text-xs space-y-2 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
              <div>
                <span className="font-bold text-gray-700">Partner Remarks: </span>
                <span className="text-gray-600">{selectedReport.partnerRemarks || 'No remarks submitted.'}</span>
              </div>
              {selectedReport.reconciliationNotes && (
                <div>
                  <span className="font-bold text-ohana-terracotta">Internal Reconciliation Notes: </span>
                  <span className="text-gray-600">{selectedReport.reconciliationNotes}</span>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-ohana-sand-300 p-12 text-center text-gray-400">
            Select a report to review reconciliation.
          </div>
        )}

      </div>

      {/* SUBMIT MONTHLY REPORT MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-ohana-sand-300 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-ohana-charcoal-900 mb-1 font-display">
              Submit Retailer Monthly Sales Report
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Enter sales and physical inventory count for month-end reconciliation.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Sales report submitted for owner review and discrepancy validation.');
                setShowSubmitModal(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Select Retail Partner</label>
                <select className="w-full border border-gray-300 rounded-lg p-2 font-semibold">
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.locationCity})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Reporting Period</label>
                <input type="text" defaultValue="October 2026" className="w-full border border-gray-300 rounded-lg p-2" required />
              </div>

              <div className="p-3 bg-ohana-sand-50 rounded-xl border border-ohana-sand-200">
                <span className="font-bold text-gray-800 block mb-1">Quick Count Entry (Aggregated):</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 block">Units Sold</label>
                    <input type="number" defaultValue="28" className="w-full border border-gray-300 rounded-lg p-1.5 font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block">Returns</label>
                    <input type="number" defaultValue="1" className="w-full border border-gray-300 rounded-lg p-1.5" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block">Damaged</label>
                    <input type="number" defaultValue="0" className="w-full border border-gray-300 rounded-lg p-1.5" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Physically Verified Closing Units</label>
                <input type="number" defaultValue="55" className="w-full border border-gray-300 rounded-lg p-2 font-bold" required />
                <span className="text-[10px] text-gray-500 block mt-0.5">Physical count conducted by store supervisor.</span>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Partner Remarks / Explanations</label>
                <textarea rows={2} placeholder="Any customer returns or feedback..." className="w-full border border-gray-300 rounded-lg p-2" />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-ohana-terracotta text-white rounded-xl font-bold shadow-xs hover:bg-ohana-terracotta-600"
                >
                  Submit for Owner Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

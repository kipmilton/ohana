import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';
import { 
  CreditCard, 
  Printer, 
  X,
  CheckCircle2,
  Receipt,
  Search,
  Building2,
  Phone,
  Calendar,
  FileCheck,
  Clock,
  AlertTriangle,
  ArrowLeft,
  FileText
} from 'lucide-react';
import logoImg from '../../assets/logo.png';

export const FinanceInvoicingView: React.FC = () => {
  const { 
    invoices, 
    payments, 
    recordPayment, 
    verifyPayment, 
    rejectPayment, 
    currentRole, 
    authSession 
  } = useApp();
  
  const isVendor = authSession.user?.role === 'vendor';
  const currentStoreId = authSession.user?.storeId;

  // Filter invoices for active user role
  const accessibleInvoices = isVendor
    ? invoices.filter(inv => inv.partnerId === currentStoreId)
    : invoices;

  // Filter payments for active user role
  const accessiblePayments = isVendor
    ? payments.filter(p => p.partnerId === currentStoreId)
    : payments;

  // Pending payments awaiting Admin verification
  const pendingPayments = payments.filter(p => p.status === 'pending_verification');

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(accessibleInvoices[0] || null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [mobileTab, setMobileTab] = useState<'list' | 'document'>('list');

  const [paymentForm, setPaymentForm] = useState<{
    invoiceId: string;
    amountKes: number;
    paymentMethod: 'mpesa' | 'bank_transfer' | 'cheque' | 'cash';
    referenceCode: string;
    notes: string;
  }>({
    invoiceId: accessibleInvoices[0]?.id || '',
    amountKes: accessibleInvoices[0]?.balanceDueKes || 0,
    paymentMethod: isVendor ? 'mpesa' : 'bank_transfer',
    referenceCode: '',
    notes: '',
  });

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const formatKes = (amount: number) => `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Filter invoices
  const filteredInvoices = accessibleInvoices.filter(inv => {
    const matchesFilter = statusFilter === 'all' || inv.status === statusFilter;
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.partnerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Handle Payment Submit
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetInv = accessibleInvoices.find(i => i.id === paymentForm.invoiceId);
    if (!targetInv || paymentForm.amountKes <= 0) return;

    recordPayment({
      invoiceId: targetInv.id,
      invoiceNumber: targetInv.invoiceNumber,
      partnerId: targetInv.partnerId,
      partnerName: targetInv.partnerName,
      amountKes: paymentForm.amountKes,
      paymentMethod: paymentForm.paymentMethod,
      referenceCode: paymentForm.referenceCode || `REF-${Date.now().toString().slice(-6)}`,
      paymentDate: new Date().toISOString().split('T')[0],
      recordedBy: isVendor ? `${targetInv.partnerName} Vendor` : `${currentRole.toUpperCase()}`,
      status: isVendor ? 'pending_verification' : 'verified',
      notes: paymentForm.notes || (isVendor ? 'Vendor submitted remittance' : 'Direct admin payment entry'),
    });

    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      setShowPaymentModal(false);
    }, 1400);
  };

  // Open Payment modal for specific invoice
  const openPayModalFor = (inv: Invoice) => {
    setPaymentForm({
      invoiceId: inv.id,
      amountKes: inv.balanceDueKes,
      paymentMethod: isVendor ? 'mpesa' : 'bank_transfer',
      referenceCode: '',
      notes: '',
    });
    setShowPaymentModal(true);
  };

  // Print invoice helper
  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase">Paid in Full</span>;
      case 'payment_pending_verification':
        return <span className="bg-amber-100 text-amber-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> Awaiting Verification</span>;
      case 'partially_paid':
        return <span className="bg-amber-100 text-amber-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase">Partially Paid</span>;
      case 'overdue':
        return <span className="bg-red-100 text-red-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase">Overdue</span>;
      case 'issued':
        return <span className="bg-blue-100 text-blue-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase">Issued</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase">{status}</span>;
    }
  };

  const totalQty = selectedInvoice?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="space-y-5">
      
      {/* Top Header - Hidden on Print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ohana-charcoal-900 font-display">
            {isVendor ? 'Store Invoices & Statements' : 'Invoicing & Finance Operations'}
          </h1>
          <p className="text-xs text-gray-500">
            {isVendor 
              ? 'View official tax invoices issued to your store and record payment remittances.' 
              : 'Manage partner invoices, verify incoming remittances, and reconcile Equity Bank / M-Pesa statements.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {selectedInvoice && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition-all"
            >
              <Printer className="w-4 h-4 text-gray-600" />
              <span>Print / PDF</span>
            </button>
          )}

          <button
            onClick={() => {
              if (accessibleInvoices.length > 0) openPayModalFor(selectedInvoice || accessibleInvoices[0]);
            }}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>{isVendor ? 'Submit Payment Reference' : 'Record Settlement Payment'}</span>
          </button>
        </div>
      </div>

      {/* ADMIN: Pending Payment Verifications Banner */}
      {!isVendor && pendingPayments.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 shadow-xs print:hidden animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              <h2 className="text-xs sm:text-sm font-bold text-amber-950">
                Pending Payment Remittances ({pendingPayments.length} Awaiting Verification)
              </h2>
            </div>
            <span className="text-[10px] text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded-full font-bold">
              Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingPayments.map(p => (
              <div key={p.id} className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-gray-900 text-xs">{p.partnerName}</span>
                    <span className="font-bold text-emerald-700 font-display text-xs">{formatKes(p.amountKes)}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-1">
                    Invoice: <span className="font-mono font-bold text-gray-800">{p.invoiceNumber}</span> · Method: <span className="font-semibold uppercase">{p.paymentMethod}</span>
                  </p>
                  <p className="text-[11px] text-gray-700 mt-0.5">
                    Ref Code: <span className="font-mono font-bold text-ohana-charcoal-900 bg-gray-100 px-1.5 py-0.5 rounded">{p.referenceCode}</span>
                  </p>
                  {p.notes && <p className="text-[10px] text-gray-400 italic mt-1">Remittance Note: "{p.notes}"</p>}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => rejectPayment(p.id, 'Transaction reference code not found on bank/Paybill statement')}
                    className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Reject Code
                  </button>
                  <button
                    onClick={() => verifyPayment(p.id)}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify & Confirm Paid</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VENDOR: Pending Remittance Notice */}
      {isVendor && accessiblePayments.some(p => p.status === 'pending_verification') && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 text-xs text-blue-900 flex items-start gap-2.5 print:hidden">
          <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Payment Remittance Under Review</p>
            <p className="text-[11px] text-blue-700 mt-0.5">
              Your payment reference code has been recorded. Ohana Finance is verifying against the Equity Bank / M-Pesa statement and will confirm your invoice shortly.
            </p>
          </div>
        </div>
      )}

      {/* Mobile Tab Toggle (Shows on small screens) */}
      <div className="lg:hidden flex bg-white p-1 rounded-2xl border border-ohana-sand-300 shadow-xs text-xs font-bold print:hidden">
        <button
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
            mobileTab === 'list'
              ? 'bg-ohana-charcoal-900 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Invoices List ({accessibleInvoices.length})</span>
        </button>
        <button
          onClick={() => setMobileTab('document')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
            mobileTab === 'document'
              ? 'bg-ohana-terracotta text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Tax Invoice Document</span>
        </button>
      </div>

      {/* Main Grid: Invoices List + Printable Invoice Document */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Invoices List (5 cols) */}
        <div className={`lg:col-span-5 space-y-4 print:hidden ${
          mobileTab === 'document' ? 'hidden lg:block' : 'block'
        }`}>
          
          {/* Search & Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder={isVendor ? "Search invoice #..." : "Search invoice # or partner..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-ohana-sand-300 rounded-xl focus:ring-1 focus:ring-ohana-terracotta"
              />
            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-ohana-sand-300 shadow-xs text-xs overflow-x-auto">
              {['all', 'issued', 'partially_paid', 'payment_pending_verification', 'paid', 'overdue'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg font-semibold capitalize whitespace-nowrap transition-all text-[11px] ${
                    statusFilter === tab
                      ? 'bg-ohana-terracotta text-white shadow-xs'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab === 'payment_pending_verification' ? 'Pending Verify' : tab.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Invoices List Cards */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredInvoices.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-ohana-sand-300 text-gray-400 text-xs">
                No invoices found matching criteria.
              </div>
            ) : (
              filteredInvoices.map((inv) => {
                const isSelected = selectedInvoice?.id === inv.id;

                return (
                  <div
                    key={inv.id}
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setMobileTab('document');
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-white border-[#4880ED] ring-2 ring-[#4880ED]/20 shadow-sm'
                        : 'bg-white border-ohana-sand-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-xs font-mono font-bold text-[#4880ED] block">
                          {inv.invoiceNumber}
                        </span>
                        <h2 className="font-bold text-sm text-ohana-charcoal-900">{inv.partnerName}</h2>
                        <span className="text-[11px] text-gray-500 font-medium">{inv.period}</span>
                      </div>
                      {getStatusBadge(inv.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-ohana-sand-50 p-2.5 rounded-lg mb-2 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-500 block">Total:</span>
                        <span className="font-bold text-gray-900 font-display">{formatKes(inv.totalAmountKes)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block">Balance Due:</span>
                        <span className={`font-bold font-display ${
                          inv.balanceDueKes > 0 ? 'text-ohana-terracotta' : 'text-emerald-700'
                        }`}>
                          {formatKes(inv.balanceDueKes)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                      <span>Due: {inv.dueDate}</span>
                      {inv.balanceDueKes > 0 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openPayModalFor(inv);
                          }}
                          className="text-emerald-700 font-bold hover:underline"
                        >
                          {isVendor ? '+ Submit Payment' : '+ Record Payment'}
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-bold">Settled</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Settlement Receipts History */}
          <div className="bg-white rounded-xl border border-ohana-sand-300 p-4 shadow-xs">
            <h3 className="text-xs font-bold text-ohana-charcoal-900 mb-2 uppercase tracking-wider flex items-center justify-between">
              <span>Settlement Payments Log</span>
              <span className="text-[10px] font-normal text-gray-500">{accessiblePayments.length} recorded</span>
            </h3>
            <div className="space-y-2 text-xs max-h-48 overflow-y-auto">
              {accessiblePayments.length === 0 ? (
                <p className="text-[11px] text-gray-400 py-3 text-center">No payment records yet.</p>
              ) : (
                accessiblePayments.map(p => (
                  <div key={p.id} className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-900 flex items-center gap-1.5">
                        <span>{p.partnerName}</span>
                        {p.status === 'pending_verification' && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                            Pending Verify
                          </span>
                        )}
                        {p.status === 'verified' && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Ref: <span className="font-mono font-semibold">{p.referenceCode}</span> ({p.paymentMethod.toUpperCase()})
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-700 font-display">{formatKes(p.amountKes)}</span>
                      <span className="text-[10px] text-gray-400 block">{p.paymentDate}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Printable Official Invoice Document (7 cols) */}
        <div className={`lg:col-span-7 ${
          mobileTab === 'list' ? 'hidden lg:block' : 'block'
        }`}>
          {/* Back button on mobile */}
          <div className="lg:hidden mb-3 print:hidden">
            <button
              onClick={() => setMobileTab('list')}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-ohana-terracotta"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to Invoices List</span>
            </button>
          </div>

          {selectedInvoice ? (
            <div className="bg-white rounded-2xl border border-ohana-sand-300 shadow-md p-4 sm:p-8 lg:p-10 space-y-6 print:border-none print:shadow-none print:p-0 print:m-0 font-sans">
              
              {/* Top Company Header (Matches Uploaded Document Exactly) */}
              <div className="flex flex-col sm:flex-row items-start justify-between pb-4 border-b-2 border-black gap-3 sm:gap-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <img 
                    src={logoImg} 
                    alt="Ohana Logo" 
                    className="h-12 sm:h-16 w-auto object-contain mt-0.5 shrink-0" 
                  />
                  <div>
                    <h1 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight leading-tight">
                      Ohana Family Wear Limited
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-700 mt-0.5">Fourways Junction</p>
                    <p className="text-xs sm:text-sm text-gray-700">ohanafamilywear@gmail.com</p>
                    <a 
                      href="https://www.ohanafamilywear.com/" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-xs sm:text-sm text-blue-600 hover:underline block truncate max-w-[220px] sm:max-w-none"
                    >
                      https://www.ohanafamilywear.com/
                    </a>
                  </div>
                </div>
              </div>

              {/* Document Title: INVOICE */}
              <div className="text-center py-1 sm:py-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-gray-900 uppercase">
                  INVOICE
                </h2>
              </div>

              {/* Bill To & Invoice Info */}
              <div className="flex items-start justify-between gap-4 text-xs sm:text-sm">
                <div>
                  <span className="font-bold text-gray-900 block mb-0.5">Bill To</span>
                  <p className="font-bold text-gray-900 text-sm sm:text-base">{selectedInvoice.partnerName}</p>
                  <p className="text-gray-700 font-medium">{selectedInvoice.partnerPhone || '0732815197'}</p>
                  {selectedInvoice.partnerAddress && (
                    <p className="text-gray-500 text-xs mt-0.5">{selectedInvoice.partnerAddress}</p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-xl sm:text-2xl font-bold text-[#4880ED] font-mono tracking-tight">
                    {selectedInvoice.invoiceNumber}
                  </p>
                  <p className="text-gray-700 font-medium mt-1">{selectedInvoice.issueDate}</p>
                  <p className="text-gray-700 font-medium">Due Date :: {selectedInvoice.dueDate}</p>
                </div>
              </div>

              {/* Table of Items - Mobile Scrollable */}
              <div className="border border-gray-300 rounded-xs overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[460px]">
                  <thead>
                    <tr className="bg-[#4880ED] text-white font-semibold">
                      <th className="py-2.5 px-3 w-16 text-center border-r border-blue-400">Sr no.</th>
                      <th className="py-2.5 px-3 border-r border-blue-400">Product</th>
                      <th className="py-2.5 px-3 text-right border-r border-blue-400 w-24">Qty</th>
                      <th className="py-2.5 px-3 text-right border-r border-blue-400 w-28">Rate</th>
                      <th className="py-2.5 px-3 text-right w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-gray-50/50">
                        <td className="py-2.5 px-3 text-center text-gray-700 font-medium border-r border-gray-200">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 border-r border-gray-200">
                          <span className="font-bold text-gray-900">{item.description}</span>
                          {item.variantSku && (
                            <span className="block text-[11px] text-gray-500 font-mono">{item.variantSku}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right border-r border-gray-200">
                          <span className="font-medium text-gray-900">{item.quantity.toFixed(2)}</span>
                          {item.weightDesc && (
                            <span className="block text-[11px] text-gray-500 italic">{item.weightDesc}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right text-gray-900 font-medium border-r border-gray-200">
                          {item.unitPriceKes.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                          {item.totalKes.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}

                    {/* Total row at bottom of table */}
                    <tr className="bg-gray-50/90 font-bold border-t border-gray-300">
                      <td className="py-2.5 px-3 border-r border-gray-200"></td>
                      <td className="py-2.5 px-3 text-gray-900 border-r border-gray-200">Total</td>
                      <td className="py-2.5 px-3 text-right text-gray-900 border-r border-gray-200">
                        {totalQty.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-gray-400 border-r border-gray-200">-</td>
                      <td className="py-2.5 px-3 text-right text-gray-900">
                        {selectedInvoice.subtotalKes.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Note and Financial Totals Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-2">
                
                {/* Left Note */}
                <div className="md:col-span-6 space-y-1">
                  <div className="border-b-2 border-[#4880ED] pb-1 w-3/4">
                    <span className="text-xs font-bold text-gray-800">Please Note</span>
                  </div>
                  <p className="text-[11px] text-gray-500 pt-1 leading-relaxed">
                    {selectedInvoice.notes || 'Goods delivered on consignment remain the property of Ohana Family Wear Limited until paid in full.'}
                  </p>
                </div>

                {/* Right Totals Breakdown */}
                <div className="md:col-span-6 space-y-1.5 text-xs sm:text-sm">
                  <div className="flex justify-between py-1 text-gray-800">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold">
                      KES {selectedInvoice.subtotalKes.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="bg-[#4880ED] text-white font-bold py-1.5 px-3 flex justify-between items-center rounded-xs">
                    <span>Grand Total</span>
                    <span>
                      KES {selectedInvoice.totalAmountKes.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {selectedInvoice.amountPaidKes > 0 && (
                    <div className="flex justify-between py-1 text-gray-700">
                      <span>
                        (-) Paid ({selectedInvoice.paidDate || selectedInvoice.issueDate} - {selectedInvoice.paidMethod || 'Bank'})
                      </span>
                      <span className="font-semibold">
                        KES {selectedInvoice.amountPaidKes.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  {selectedInvoice.balanceDueKes > 0 && (
                    <div className="flex justify-between py-1 font-bold text-red-600 border-t border-gray-200 pt-1">
                      <span>Balance Due</span>
                      <span>
                        KES {selectedInvoice.balanceDueKes.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>

              </div>

              {/* Signature Area & Red Rubber Stamp */}
              <div className="flex flex-col items-end pt-4 pb-2 relative">
                <div className="text-right mb-2">
                  <span className="text-xs font-semibold text-gray-700 block mb-6">Signature</span>
                  <div className="w-36 border-b border-gray-400"></div>
                </div>

                {/* Red Rubber Stamp */}
                <div className="inline-block transform -rotate-6 select-none mt-1">
                  <div className="border-[3px] border-red-600 text-red-600 rounded-lg px-6 py-1.5 shadow-xs font-black text-lg sm:text-xl tracking-widest uppercase bg-white/95">
                    {selectedInvoice.status === 'paid' ? '• PAID •' : 
                     selectedInvoice.status === 'payment_pending_verification' ? '• VERIFICATION PENDING •' :
                     selectedInvoice.status === 'overdue' ? '• OVERDUE •' : '• DUE •'}
                  </div>
                </div>
              </div>

              {/* Bottom Dual-Box Container: Banking Details & Other Details */}
              <div className="border border-gray-300 rounded-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 text-xs">
                
                {/* Left Box: Banking Details */}
                <div className="p-4 bg-white space-y-0.5 border-b md:border-b-0 md:border-r border-gray-300">
                  <h3 className="font-bold text-gray-900 text-xs tracking-wide uppercase mb-1.5">
                    Banking Details
                  </h3>
                  <p className="font-bold text-gray-800">EQUITY BANK</p>
                  <p className="text-gray-700"><span className="font-semibold">ACCOUNT NAME:</span> OHANA FAMILY WEAR LIMITED</p>
                  <p className="text-gray-700"><span className="font-semibold">ACCOUNT NUMBER:</span> 1340280468613</p>
                  <p className="text-gray-700"><span className="font-semibold">BANK CODE:</span> 068</p>
                  <p className="text-gray-700"><span className="font-semibold">BRANCH CODE:</span> 134</p>
                  <p className="text-gray-700"><span className="font-semibold">SWIFT CODE:</span> EQBLKENA</p>
                </div>

                {/* Right Box: Other Details (Mpesa Paybill) */}
                <div className="p-4 bg-white space-y-1">
                  <h3 className="font-bold text-gray-900 text-xs tracking-wide uppercase mb-1.5">
                    Other Details
                  </h3>
                  <p className="text-gray-800 font-medium leading-relaxed">
                    mpesa. Paybill. Business no.247247 Account no. 0766401200
                  </p>
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-ohana-sand-300 p-12 text-center text-gray-400">
              Select an invoice to preview the official tax invoice document.
            </div>
          )}
        </div>

      </div>

      {/* RECORD / SUBMIT PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-ohana-sand-300 relative animate-in zoom-in-95 duration-150">
            
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-ohana-charcoal-900 mb-1 font-display">
              {isVendor ? 'Submit Payment Remittance' : 'Record Settlement Payment'}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              {isVendor 
                ? 'Provide your M-Pesa or bank wire reference code. Ohana Finance will verify and clear your balance.'
                : 'Directly confirm received funds and allocate to partner balance.'}
            </p>

            {paymentSuccess ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-sm font-bold text-gray-900">
                  {isVendor ? 'Payment Remittance Submitted' : 'Payment Recorded Successfully'}
                </h3>
                <p className="text-xs text-gray-500">
                  {isVendor 
                    ? 'Awaiting Ohana Finance verification. You will be notified once confirmed.'
                    : 'Invoice and partner balances updated in ledger.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs">
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Target Invoice</label>
                  <select
                    value={paymentForm.invoiceId}
                    onChange={(e) => {
                      const inv = accessibleInvoices.find(i => i.id === e.target.value);
                      setPaymentForm({
                        ...paymentForm,
                        invoiceId: e.target.value,
                        amountKes: inv?.balanceDueKes || 0,
                      });
                    }}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono text-xs focus:ring-1 focus:ring-ohana-terracotta"
                  >
                    {accessibleInvoices.map(inv => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} — {inv.partnerName} ({formatKes(inv.balanceDueKes)} Due)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Payment Method</label>
                    <select
                      value={paymentForm.paymentMethod}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold text-xs"
                    >
                      <option value="mpesa">M-Pesa Paybill (247247)</option>
                      <option value="bank_transfer">Equity Bank Wire</option>
                      {!isVendor && <option value="cheque">Bank Cheque</option>}
                      {!isVendor && <option value="cash">Cash Settlement</option>}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Amount (KES)</label>
                    <input
                      type="number"
                      min="1"
                      value={paymentForm.amountKes}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amountKes: parseInt(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-xl p-2.5 font-bold focus:ring-1 focus:ring-emerald-600 text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Transaction Reference Code (e.g. M-Pesa Code or Bank Ref)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. RK94JD2018 or EQ774102"
                    value={paymentForm.referenceCode}
                    onChange={(e) => setPaymentForm({ ...paymentForm, referenceCode: e.target.value.toUpperCase() })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono uppercase text-xs"
                    required
                  />
                  <span className="text-[10px] text-gray-400 block mt-1">
                    {isVendor ? 'Enter the confirmation code from your M-Pesa SMS or Equity receipt.' : 'Enter bank slip or Paybill reference.'}
                  </span>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Notes / Remarks</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Paid via Paybill 247247 account 0766401200..."
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-xl font-semibold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs"
                  >
                    {isVendor ? 'Submit for Admin Verification' : 'Confirm & Record Payment'}
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

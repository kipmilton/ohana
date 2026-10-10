import React from 'react';
import { useApp, NavView } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Boxes, 
  Store, 
  FileSpreadsheet, 
  ReceiptText, 
  Factory, 
  ScanLine, 
  PackagePlus, 
  ShoppingBag,
  X,
  CreditCard,
  Settings
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    authSession,
    storeAccounts,
    salesReports, 
    invoices, 
    adminNotifications,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = useApp();

  const isVendor = authSession.user?.role === 'vendor';
  const currentStoreId = authSession.user?.storeId;

  // Count relevant unpaid invoices
  const relevantInvoices = isVendor 
    ? invoices.filter(i => i.partnerId === currentStoreId)
    : invoices;

  const unpaidInvoicesCount = relevantInvoices.filter(
    i => i.status === 'issued' || i.status === 'partially_paid' || i.status === 'overdue' || i.status === 'payment_pending_verification'
  ).length;

  const vendorNavItems: {
    id: NavView;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    {
      id: 'vendor_sales',
      label: 'Store Stock & Record Sale',
      icon: ShoppingBag,
      badge: 'Active',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'invoices',
      label: 'Invoices & Statements',
      icon: ReceiptText,
      badge: unpaidInvoicesCount > 0 ? unpaidInvoicesCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 font-bold',
    },
    {
      id: 'scanner',
      label: 'Barcode Stock Count',
      icon: ScanLine,
    },
    {
      id: 'settings',
      label: 'Security & Settings',
      icon: Settings,
    }
  ];

  const adminNavItems: {
    id: NavView;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Executive Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'assign_stock',
      label: 'Assign Stock to Store',
      icon: PackagePlus,
      badge: 'Core',
      badgeColor: 'bg-ohana-terracotta text-white font-bold',
    },
    {
      id: 'inventory',
      label: 'Stock Ledger (Audit)',
      icon: Boxes,
    },
    {
      id: 'partners',
      label: 'Store Accounts & Outlets',
      icon: Store,
      badge: storeAccounts.length,
      badgeColor: 'bg-ohana-sand-300 text-ohana-charcoal-800',
    },
    {
      id: 'reconciliation',
      label: 'Consignment Reconciliation',
      icon: FileSpreadsheet,
      badge: salesReports.filter(r => r.status === 'submitted_pending_review' || r.status === 'discrepancy_flagged').length || undefined,
      badgeColor: 'bg-ohana-terracotta text-white font-bold',
    },
    {
      id: 'invoices',
      label: 'Invoices & Finance',
      icon: ReceiptText,
      badge: unpaidInvoicesCount > 0 ? unpaidInvoicesCount : undefined,
      badgeColor: 'bg-amber-500 text-white font-bold',
    },
    {
      id: 'production',
      label: 'Factory & Production',
      icon: Factory,
    },
    {
      id: 'scanner',
      label: 'Barcode & QR Scanner',
      icon: ScanLine,
    },
    {
      id: 'settings',
      label: 'Security & Settings',
      icon: Settings,
    },
  ];

  const currentNavItems = isVendor ? vendorNavItems : adminNavItems;

  const handleNavClick = (viewId: NavView) => {
    setActiveView(viewId);
    setIsMobileMenuOpen(false);
  };

  // Nav content used in both desktop sidebar & mobile drawer
  const navContent = (
    <div className="flex flex-col justify-between h-full">
      <div className="p-4 space-y-5">
        
        {/* Role context notice */}
        <div className={`p-3 rounded-2xl border text-xs ${
          isVendor 
            ? 'bg-amber-50/80 border-amber-200 text-amber-900' 
            : 'bg-ohana-sand-50 border-ohana-sand-200 text-ohana-charcoal-700'
        }`}>
          <div className="flex items-center gap-1.5 font-bold mb-1">
            <span className={`w-2 h-2 rounded-full ${isVendor ? 'bg-amber-600' : 'bg-ohana-terracotta'}`}></span>
            <span>{isVendor ? 'Retail Partner Portal' : 'Ohana Admin Workspace'}</span>
          </div>
          <p className="text-[11px] text-gray-600 leading-tight">
            {isVendor 
              ? `${authSession.user?.storeName || 'Store'}: Isolated view of assigned products, sales recording & invoices.`
              : 'Owner oversight: Register stores, assign products, track live sales & invoice month-end.'}
          </p>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-ohana-terracotta text-white shadow-sm shadow-ohana-terracotta/20 font-bold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-ohana-sand-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

      </div>

      {/* Footer info: Kenya Operations */}
      <div className="p-4 border-t border-ohana-sand-200 bg-ohana-sand-50/60 text-xs">
        <div className="flex items-center justify-between mb-1 text-[11px] font-bold text-gray-700">
          <span>{isVendor ? 'Store Location' : 'Central Distribution'}</span>
          <span className="text-ohana-green-700">Online ●</span>
        </div>
        <p className="text-[10px] text-gray-700 leading-relaxed truncate">
          {isVendor ? (authSession.user?.storeName || 'Kenya Retail Outlet') : 'Enterprise Rd Warehouse · Kenya Distribution'}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar (md and above) */}
      <aside className="hidden md:flex w-64 bg-white border-r border-ohana-sand-300 flex-col justify-between shrink-0 min-h-[calc(100vh-65px)]">
        {navContent}
      </aside>

      {/* 2. Mobile Slide-Over Drawer (Below md screens) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
          />

          {/* Drawer Sheet */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-2">Navigation Menu</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {navContent}
            </div>
          </div>
        </div>
      )}

      {/* 3. Mobile Bottom Sticky Navigation Bar (Below md screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-ohana-sand-300 py-1 px-2 shadow-lg">
        <div className="flex items-center justify-around">
          {isVendor ? (
            <>
              <button
                onClick={() => handleNavClick('vendor_sales')}
                className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-bold ${
                  activeView === 'vendor_sales' ? 'text-ohana-terracotta' : 'text-gray-500'
                }`}
              >
                <ShoppingBag className="w-5 h-5 mb-0.5" />
                <span>Store</span>
              </button>
              <button
                onClick={() => handleNavClick('invoices')}
                className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-bold relative ${
                  activeView === 'invoices' ? 'text-ohana-terracotta' : 'text-gray-500'
                }`}
              >
                <ReceiptText className="w-5 h-5 mb-0.5" />
                <span>Invoices</span>
                {unpaidInvoicesCount > 0 && (
                  <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-amber-500" />
                )}
              </button>
              <button
                onClick={() => handleNavClick('scanner')}
                className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
                  activeView === 'scanner' ? 'text-ohana-terracotta' : 'text-gray-500'
                }`}
              >
                <ScanLine className="w-5 h-5 mb-0.5" />
                <span>Scan</span>
              </button>
              <button
                onClick={() => handleNavClick('settings')}
                className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
                  activeView === 'settings' ? 'text-ohana-terracotta' : 'text-gray-500'
                }`}
              >
                <Settings className="w-5 h-5 mb-0.5" />
                <span>Settings</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
                  activeView === 'dashboard' ? 'text-ohana-terracotta' : 'text-gray-500'
                }`}
              >
                <LayoutDashboard className="w-5 h-5 mb-0.5" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => handleNavClick('assign_stock')}
                className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
                  activeView === 'assign_stock' ? 'text-ohana-terracotta' : 'text-gray-500'
                }`}
              >
                <PackagePlus className="w-5 h-5 mb-0.5" />
                <span>Assign</span>
              </button>
              <button
                onClick={() => handleNavClick('invoices')}
                className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold relative ${
                  activeView === 'invoices' ? 'text-ohana-terracotta' : 'text-gray-500'
                }`}
              >
                <ReceiptText className="w-5 h-5 mb-0.5" />
                <span>Invoices</span>
                {unpaidInvoicesCount > 0 && (
                  <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-amber-500" />
                )}
              </button>
              <button
                onClick={() => handleNavClick('partners')}
                className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
                  activeView === 'partners' ? 'text-ohana-terracotta' : 'text-gray-500'
                }`}
              >
                <Store className="w-5 h-5 mb-0.5" />
                <span>Stores</span>
              </button>
              <button
                onClick={() => handleNavClick('settings')}
                className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
                  activeView === 'settings' ? 'text-ohana-terracotta' : 'text-gray-500'
                }`}
              >
                <Settings className="w-5 h-5 mb-0.5" />
                <span>Settings</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  ShieldCheck, 
  Bell, 
  Store, 
  LogOut, 
  Menu, 
  X,
  Settings
} from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { AdminNotificationsDrawer } from '../admin/AdminNotificationsDrawer';

export const Header: React.FC = () => {
  const { 
    authSession,
    logout,
    storeAccounts,
    adminNotifications,
    selectedPartnerFilter, 
    setSelectedPartnerFilter,
    setActiveView,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const isVendor = authSession.user?.role === 'vendor';
  const currentStoreId = authSession.user?.storeId;

  // Filter unread notifications relevant to active role
  const unreadNotifsCount = adminNotifications.filter(n => {
    if (n.isRead) return false;
    if (isVendor) {
      return (n.recipientRole === 'vendor' || n.recipientRole === 'all') &&
        (!n.recipientStoreId || n.recipientStoreId === currentStoreId || n.storeId === currentStoreId);
    }
    return n.recipientRole === 'admin' || n.recipientRole === 'all' || !n.recipientRole;
  }).length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-ohana-sand-300 shadow-sm px-3 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-3">
          
          {/* Left: Hamburger Button (Mobile only) + Brand Identity */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-700 hover:text-ohana-charcoal-900 hover:bg-ohana-sand-100 transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-ohana-terracotta" />
              ) : (
                <Menu className="w-5 h-5 text-ohana-charcoal-900" />
              )}
            </button>

            {/* Brand Logo & Title */}
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                setActiveView(isVendor ? 'vendor_sales' : 'dashboard');
              }}
              className="flex items-center gap-2.5 group text-left focus:outline-none"
            >
              <img 
                src={logoImg} 
                alt="Ohana Swimwear" 
                className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105" 
              />
              <div className="hidden sm:block border-l border-ohana-sand-300 pl-3">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-ohana-terracotta block">
                  {isVendor ? 'Retail Partner Portal' : 'Operations Platform'}
                </span>
                <p className="text-xs text-gray-700 font-medium truncate max-w-[180px]">
                  {isVendor ? (authSession.user?.storeName || 'Store') : 'Nationwide Retail Distribution'}
                </p>
              </div>
            </button>
          </div>

          {/* Center: Admin Location Filter (Hidden on mobile) */}
          {!isVendor && (
            <div className="hidden lg:flex items-center gap-2 bg-ohana-sand-100 border border-ohana-sand-300 rounded-xl px-3 py-1.5 text-xs">
              <Store className="w-4 h-4 text-ohana-gold-700 shrink-0" />
              <span className="text-gray-700 font-medium">Filter Location:</span>
              <select
                value={selectedPartnerFilter || 'all'}
                onChange={(e) => setSelectedPartnerFilter(e.target.value === 'all' ? null : e.target.value)}
                className="bg-transparent font-semibold text-gray-800 focus:outline-none cursor-pointer text-xs"
              >
                <option value="all">Whole Business (All Kenya Outlets)</option>
                {storeAccounts.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.locationCity})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Right: Notifications, Currency & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Real-time Notifications Bell (For BOTH Admin & Vendors) */}
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-ohana-sand-100 rounded-xl transition-all focus:outline-none"
              title={isVendor ? "Store Notifications & Invoices" : "Real-Time Activity Notifications"}
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-ohana-charcoal-900" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-ohana-terracotta text-white font-bold text-[9px] rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Currency Pill */}
            <div className="hidden sm:flex items-center gap-1 bg-gray-100 border border-gray-200 px-2 py-1.5 rounded-lg text-xs font-semibold text-gray-700">
              <span>🇰🇪</span>
              <span>KES</span>
            </div>

            {/* Active User Profile Pill (Click to open Settings & Reset Password) */}
            <button
              onClick={() => setActiveView('settings')}
              className="flex items-center gap-1.5 bg-ohana-sand-50 hover:bg-ohana-sand-100 border border-ohana-sand-300 px-2.5 py-1.5 rounded-xl text-xs transition-colors"
              title="Open Account & Security Settings"
            >
              {isVendor ? (
                <Store className="w-3.5 h-3.5 text-ohana-terracotta shrink-0" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              )}
              <span className="font-bold text-gray-900 truncate max-w-[90px] sm:max-w-[140px]">
                {isVendor ? (authSession.user?.storeName || 'Vendor') : 'Ohana Admin'}
              </span>
              <Settings className="w-3.5 h-3.5 text-gray-400 ml-0.5 hover:text-ohana-terracotta transition-colors shrink-0" />
            </button>

            {/* Sign Out Button */}
            <button
              onClick={logout}
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-ohana-terracotta font-semibold p-2 rounded-xl hover:bg-gray-100 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sign Out</span>
            </button>

          </div>
        </div>
      </header>

      {/* Real-Time Notifications Drawer */}
      <AdminNotificationsDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
};

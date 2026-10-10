import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, 
  CheckCircle2, 
  ShoppingBag, 
  KeyRound, 
  Store, 
  PackagePlus, 
  X,
  ArrowRight,
  Receipt,
  CreditCard,
  AlertTriangle,
  FileCheck
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminNotificationsDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const { 
    authSession,
    adminNotifications, 
    markNotificationAsRead, 
    clearAllNotifications, 
    setActiveView,
    generateStoreMonthlyInvoice
  } = useApp();

  if (!isOpen) return null;

  const isVendor = authSession.user?.role === 'vendor';
  const currentStoreId = authSession.user?.storeId;

  // Filter notifications relevant to current role & store
  const relevantNotifications = adminNotifications.filter(n => {
    if (isVendor) {
      if (n.recipientRole === 'vendor' || n.recipientRole === 'all') {
        return !n.recipientStoreId || n.recipientStoreId === currentStoreId || n.storeId === currentStoreId;
      }
      return false;
    }
    // Admin sees admin notifications
    return n.recipientRole === 'admin' || n.recipientRole === 'all' || !n.recipientRole;
  });

  const unreadCount = relevantNotifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'invoice_issued':
        return <Receipt className="w-4 h-4 text-blue-600" />;
      case 'payment_submitted':
        return <CreditCard className="w-4 h-4 text-amber-600" />;
      case 'payment_verified':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'payment_rejected':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'sale_recorded':
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      case 'password_reset':
        return <KeyRound className="w-4 h-4 text-blue-600" />;
      case 'store_registered':
        return <Store className="w-4 h-4 text-ohana-gold-700" />;
      case 'stock_assigned':
        return <PackagePlus className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full sm:max-w-md bg-white h-full shadow-2xl border-l border-ohana-sand-300 p-5 sm:p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell className="w-5 h-5 text-ohana-charcoal-900" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-ohana-terracotta animate-pulse" />
                )}
              </div>
              <h2 className="text-base font-bold text-ohana-charcoal-900 font-display">
                {isVendor ? 'Store Activity & Invoices' : 'Real-Time Store Activity'}
              </h2>
            </div>
            
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between py-2 text-xs text-gray-500">
            <span>{unreadCount} unread update{unreadCount === 1 ? '' : 's'}</span>
            {unreadCount > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-ohana-terracotta font-bold hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="space-y-3 mt-2 max-h-[calc(100vh-190px)] overflow-y-auto pr-1">
            {relevantNotifications.length === 0 ? (
              <div className="py-16 text-center text-gray-400 space-y-2">
                <Bell className="w-10 h-10 mx-auto text-gray-300" />
                <p className="text-xs font-semibold text-gray-600">No notifications yet.</p>
                <p className="text-[11px] text-gray-400">
                  {isVendor 
                    ? 'Invoices, payments, and stock alerts will appear here.'
                    : 'Partner sales, payments, and registrations will appear here.'}
                </p>
              </div>
            ) : (
              relevantNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  className={`p-3.5 rounded-2xl border text-xs transition-all cursor-pointer ${
                    !notif.isRead
                      ? 'bg-ohana-sand-50/80 border-ohana-sand-300 shadow-xs'
                      : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 bg-white rounded-xl border border-gray-200 shadow-xs shrink-0 mt-0.5">
                      {getNotificationIcon(notif.type)}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-ohana-charcoal-900 text-xs">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {notif.timestamp.slice(-5)}
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-600 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Action buttons on notification */}
                      {notif.type === 'payment_submitted' && !isVendor && (
                        <div className="pt-1.5 flex items-center justify-between">
                          <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                            Verification Required
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onClose();
                              setActiveView('invoices');
                            }}
                            className="text-[10px] font-bold text-ohana-terracotta hover:underline flex items-center gap-0.5"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Verify in Finance →</span>
                          </button>
                        </div>
                      )}

                      {notif.type === 'invoice_issued' && isVendor && (
                        <div className="pt-1.5 flex items-center justify-between">
                          <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">
                            Invoice Ready
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onClose();
                              setActiveView('invoices');
                            }}
                            className="text-[10px] font-bold text-ohana-terracotta hover:underline flex items-center gap-0.5"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>View & Pay Invoice →</span>
                          </button>
                        </div>
                      )}

                      {notif.type === 'sale_recorded' && !isVendor && notif.storeId && (
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[10px] text-emerald-700 font-bold">
                            Stock auto-deducted
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              generateStoreMonthlyInvoice(notif.storeId!);
                              onClose();
                              setActiveView('invoices');
                            }}
                            className="text-[10px] font-bold text-ohana-terracotta hover:underline flex items-center gap-0.5"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>Create Month Invoice →</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={() => {
              onClose();
              setActiveView('invoices');
            }}
            className="w-full py-2.5 bg-ohana-charcoal-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <span>{isVendor ? 'View My Invoices & Payment Receipts' : 'View All Partner Invoices & Settlements'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

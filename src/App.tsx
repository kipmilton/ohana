import React from 'react';
import { useApp } from './context/AppContext';
import { LoginView } from './components/auth/LoginView';
import { PasswordResetModal } from './components/auth/PasswordResetModal';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { AssignStockManagementView } from './components/admin/AssignStockManagementView';
import { VendorPortalDashboard } from './components/vendor/VendorPortalDashboard';
import { InventoryLedgerView } from './components/inventory/InventoryLedgerView';
import { RetailPartnerNetwork } from './components/partners/RetailPartnerNetwork';
import { MonthlyReconciliationWorkflow } from './components/reconciliation/MonthlyReconciliationWorkflow';
import { FinanceInvoicingView } from './components/finance/FinanceInvoicingView';
import { FactoryProductionView } from './components/production/FactoryProductionView';
import { BarcodeScannerView } from './components/scanner/BarcodeScannerView';
import { SettingsView } from './components/settings/SettingsView';

export const App: React.FC = () => {
  const { authSession, activeView } = useApp();

  // If unauthenticated, show Login screen
  if (!authSession.user) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    // If vendor, allow invoices, scanner, and settings
    if (authSession.user?.role === 'vendor') {
      switch (activeView) {
        case 'invoices':
          return <FinanceInvoicingView />;
        case 'scanner':
          return <BarcodeScannerView />;
        case 'settings':
          return <SettingsView />;
        default:
          return <VendorPortalDashboard />;
      }
    }

    // Admin view routing
    switch (activeView) {
      case 'dashboard':
        return <ExecutiveDashboard />;
      case 'assign_stock':
        return <AssignStockManagementView />;
      case 'vendor_sales':
        return <VendorPortalDashboard />;
      case 'inventory':
        return <InventoryLedgerView />;
      case 'partners':
        return <RetailPartnerNetwork />;
      case 'reconciliation':
        return <MonthlyReconciliationWorkflow />;
      case 'invoices':
        return <FinanceInvoicingView />;
      case 'production':
        return <FactoryProductionView />;
      case 'scanner':
        return <BarcodeScannerView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <ExecutiveDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-ohana-sand text-ohana-charcoal-900 flex flex-col font-sans selection:bg-ohana-terracotta selection:text-white">
      {/* First-time login Password Reset prompt (required by prompt) */}
      {authSession.user.requiresPasswordReset && <PasswordResetModal />}

      {/* Top Header */}
      <Header />

      {/* Main Body with Sidebar & Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

import { 
  RetailPartner, 
  StockLocation, 
  Product, 
  InventoryLedgerEntry, 
  Dispatch, 
  MonthlySalesReport, 
  Invoice, 
  Payment, 
  FactoryOrder, 
  WooCommerceOrderSync,
  StoreAccount,
  AssignedStoreItem,
  VendorSale,
  AdminNotification
} from '../types';

// ==============================================================================
// OHANA OPERATIONS ECOSYSTEM - CLEAN PRODUCTION SEED DATA
// ==============================================================================

// Central Warehouse & Primary Operations Hub
export const initialLocations: StockLocation[] = [
  {
    id: 'loc-wh-01',
    name: 'Ohana Central Warehouse',
    type: 'central_warehouse',
    address: 'Enterprise Rd, Industrial Area, Nairobi',
    isActive: true,
  }
];

// Clean empty collections ready for real onboarding
export const initialPartners: RetailPartner[] = [];
export const initialProducts: Product[] = [];
export const initialLedger: InventoryLedgerEntry[] = [];
export const initialDispatches: Dispatch[] = [];
export const initialSalesReports: MonthlySalesReport[] = [];
export const initialInvoices: Invoice[] = [];
export const initialPayments: Payment[] = [];
export const initialFactoryOrders: FactoryOrder[] = [];
export const initialWcOrders: WooCommerceOrderSync[] = [];
export const initialStoreAccounts: StoreAccount[] = [];
export const initialAssignedStoreItems: AssignedStoreItem[] = [];
export const initialVendorSales: VendorSale[] = [];
export const initialAdminNotifications: AdminNotification[] = [];

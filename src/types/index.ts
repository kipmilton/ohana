export type AppRole = 'admin' | 'vendor';

export interface AuthSession {
  user: {
    id: string;
    email: string;
    role: AppRole;
    storeId?: string;
    storeName?: string;
    requiresPasswordReset: boolean;
  } | null;
}

export interface StoreAccount {
  id: string;
  code: string;
  name: string;
  locationCity: string;
  address: string;
  contactName: string;
  email: string;
  password?: string;
  requiresPasswordReset: boolean;
  currentBalanceKes: number;
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface AssignedStoreItem {
  id: string;
  storeId: string;
  productId: string;
  variantId: string;
  productName: string;
  sku: string;
  variantDesc: string;
  stockAssigned: number; // remaining stock
  initialStockAssigned: number;
  unitCostKes: number;
  assignedAt: string;
}

export interface VendorSale {
  id: string;
  storeId: string;
  storeName: string;
  assignedItemId: string;
  variantId: string;
  productName: string;
  sku: string;
  variantDesc: string;
  unitsSold: number;
  unitPriceKes: number;
  totalMoneyCollectedKes: number;
  soldAt: string;
  notes?: string;
}

export interface AppNotification {
  id: string;
  recipientRole?: 'admin' | 'vendor' | 'all';
  recipientStoreId?: string;
  type: 
    | 'sale_recorded' 
    | 'stock_assigned' 
    | 'store_registered' 
    | 'password_reset'
    | 'invoice_issued'
    | 'payment_submitted'
    | 'payment_verified'
    | 'payment_rejected'
    | 'factory_received';
  storeId?: string;
  storeName?: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  amountKes?: number;
  invoiceId?: string;
  invoiceNumber?: string;
}

export type AdminNotification = AppNotification;

export type UserRole = 
  | 'owner' 
  | 'operations_manager' 
  | 'warehouse_staff' 
  | 'accountant' 
  | 'production_manager' 
  | 'retail_partner';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  partnerId?: string;
  avatarUrl?: string;
}

export type AgreementType = 
  | 'consignment_fixed_wholesale' 
  | 'consignment_commission_percentage' 
  | 'direct_purchase';

export interface RetailPartner {
  id: string;
  code: string;
  name: string;
  locationCity: string;
  address: string;
  contactName: string;
  phone: string;
  email: string;
  agreementType: AgreementType;
  commissionRate?: number; // e.g. 20%
  wholesaleDiscountPct?: number; // e.g. 35%
  paymentTermsDays: number;
  currentBalanceKes: number;
  totalSalesKes: number;
  complianceRatePct: number;
  status: 'active' | 'pending' | 'suspended';
  stockOnHandUnits: number;
  lastReportMonth?: string;
  lastSyncAt?: string;
}

export interface StockLocation {
  id: string;
  name: string;
  type: 'central_warehouse' | 'retail_partner' | 'in_transit' | 'factory';
  partnerId?: string;
  address: string;
  isActive: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  colorPrint: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'One Size';
  barcode: string;
  reorderThreshold: number;
  stockByLocation: Record<string, number>; // locationId -> qty
  totalManufactured?: number;
  unitCostKes?: number;
}

export interface Product {
  id: string;
  name: string;
  styleCode: string;
  collection: string;
  category: 'Bikini' | 'One-Piece' | 'Cover-up' | 'Men Trunks' | 'Accessories';
  description: string;
  baseCostKes: number;
  retailPriceKes: number;
  wholesalePriceKes: number;
  imageUrl: string;
  status: 'active' | 'archived' | 'in_development';
  variants: ProductVariant[];
}

export type InventoryMovementType = 
  | 'factory_receipt'
  | 'dispatch_to_partner'
  | 'partner_received_confirm'
  | 'transfer_between_locations'
  | 'retailer_reported_sale'
  | 'woocommerce_online_sale'
  | 'consignment_payment_received'
  | 'return_to_warehouse'
  | 'damaged_lost_stock'
  | 'physical_count_adjustment';

export interface InventoryLedgerEntry {
  id: string;
  timestamp: string;
  variantId: string;
  productName: string;
  variantSku: string;
  variantDesc: string; // e.g. "Terracotta Red / M"
  quantity: number; // positive or negative
  movementType: InventoryMovementType;
  sourceLocationId?: string;
  sourceLocationName?: string;
  destinationLocationId?: string;
  destinationLocationName?: string;
  partnerId?: string;
  partnerName?: string;
  referenceId?: string;
  reasonNotes?: string;
  recordedBy: string;
}

export interface DispatchItem {
  id: string;
  variantId: string;
  sku: string;
  productName: string;
  variantDesc: string;
  quantity: number;
  notes?: string;
}

export interface Dispatch {
  id: string;
  dispatchNumber: string;
  partnerId: string;
  partnerName: string;
  sourceLocationId: string;
  destinationLocationId: string;
  status: 'draft' | 'dispatched' | 'received_confirmed';
  totalUnits: number;
  dispatchedAt: string;
  receivedAt?: string;
  driverNotes?: string;
  items: DispatchItem[];
}

export interface MonthlySalesReportItem {
  id: string;
  variantId: string;
  productName: string;
  sku: string;
  variantDesc: string;
  openingQty: number;
  dispatchedQty: number;
  soldQty: number;
  returnedQty: number;
  damagedQty: number;
  expectedClosingQty: number;
  physicalCountQty: number;
  discrepancyQty: number;
  unitWholesaleKes: number;
  unitRetailKes: number;
  lineTotalPayableKes: number;
}

export interface MonthlySalesReport {
  id: string;
  reportNumber: string;
  partnerId: string;
  partnerName: string;
  periodMonth: string; // e.g. "2026-09"
  openingStockUnits: number;
  receivedInPeriodUnits: number;
  reportedSoldUnits: number;
  reportedReturnsUnits: number;
  reportedDamagedUnits: number;
  expectedClosingStockUnits: number;
  physicallyVerifiedClosingUnits: number;
  discrepancyUnits: number;
  grossRetailSalesKes: number;
  payableWholesaleKes: number;
  status: 'pending_submission' | 'submitted_pending_review' | 'approved_for_invoice' | 'discrepancy_flagged';
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  partnerRemarks?: string;
  reconciliationNotes?: string;
  generatedInvoiceId?: string;
  items: MonthlySalesReportItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  variantSku?: string;
  quantity: number;
  unitPriceKes: number;
  totalKes: number;
  weightDesc?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  partnerAddress: string;
  partnerPhone?: string;
  salesReportId?: string;
  period: string;
  issueDate: string;
  dueDate: string;
  subtotalKes: number;
  taxVatKes: number;
  totalAmountKes: number;
  amountPaidKes: number;
  balanceDueKes: number;
  status: 'draft' | 'issued' | 'partially_paid' | 'paid' | 'overdue' | 'void' | 'payment_pending_verification';
  kraPin: string;
  paymentDetails: string;
  paidDate?: string;
  paidMethod?: string;
  notes?: string;
  items: InvoiceItem[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  partnerId: string;
  partnerName: string;
  amountKes: number;
  paymentMethod: 'mpesa' | 'bank_transfer' | 'cheque' | 'cash';
  referenceCode: string;
  paymentDate: string;
  recordedBy: string;
  status: 'pending_verification' | 'verified' | 'rejected';
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
}

export interface FactoryOrderItem {
  id: string;
  variantId: string;
  sku: string;
  productName: string;
  unitsOrdered: number;
  unitsReceived: number;
  unitCostKes: number;
}

export interface FactoryOrder {
  id: string;
  poNumber: string;
  factoryName: string;
  collectionName: string;
  status: 'in_production' | 'shipped' | 'goods_received_qc' | 'completed';
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  totalUnitsOrdered: number;
  totalUnitsReceived: number;
  totalCostKes: number;
  shippingCarrier?: string;
  notes?: string;
  items: FactoryOrderItem[];
}

export interface WooCommerceOrderSync {
  id: string;
  wcOrderId: string;
  customerName: string;
  customerCity: string;
  itemsCount: number;
  totalAmountKes: number;
  orderStatus: 'completed' | 'processing' | 'refunded';
  inventoryDeducted: boolean;
  syncedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
}

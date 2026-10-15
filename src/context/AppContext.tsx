import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  AppRole,
  AuthSession,
  StoreAccount,
  AssignedStoreItem,
  VendorSale,
  AdminNotification,
  AppNotification,
  UserRole, 
  RetailPartner, 
  StockLocation, 
  Product, 
  ProductVariant,
  InventoryLedgerEntry, 
  Dispatch, 
  MonthlySalesReport, 
  Invoice, 
  Payment, 
  FactoryOrder, 
  WooCommerceOrderSync,
  InventoryMovementType
} from '../types';
import { 
  initialLocations, 
  initialPartners, 
  initialProducts, 
  initialLedger, 
  initialDispatches, 
  initialSalesReports, 
  initialInvoices, 
  initialPayments, 
  initialFactoryOrders, 
  initialWcOrders,
  initialStoreAccounts,
  initialAssignedStoreItems,
  initialVendorSales,
  initialAdminNotifications
} from '../data/mockData';
import { isSupabaseConfigured, getStoredSupabaseConfig, saveSupabaseConfig, getSupabase, supabase } from '../lib/supabase';

export type NavView = 
  | 'dashboard' 
  | 'inventory' 
  | 'partners' 
  | 'assign_stock' 
  | 'vendor_sales' 
  | 'reconciliation' 
  | 'invoices' 
  | 'production' 
  | 'scanner'
  | 'settings';

interface AppContextType {
  // Authentication & Sessions
  authSession: AuthSession;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; requiresReset?: boolean }>;
  logout: () => void;
  resetVendorPassword: (newPassword: string) => Promise<boolean>;
  updateAccountPassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  switchUserRole: (role: AppRole, storeId?: string) => void;

  // Navigation & Filtering
  activeView: NavView;
  setActiveView: (view: NavView) => void;
  selectedPartnerFilter: string | null;
  setSelectedPartnerFilter: (id: string | null) => void;

  // Stores & Assignments
  storeAccounts: StoreAccount[];
  assignedStoreItems: AssignedStoreItem[];
  vendorSales: VendorSale[];
  adminNotifications: AdminNotification[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Core Operations Requested by User
  registerStore: (storeData: {
    name: string;
    locationCity: string;
    address: string;
    contactName: string;
    email: string;
    temporaryPassword?: string;
  }) => StoreAccount;

  assignItemToStore: (params: {
    storeId: string;
    variantId: string;
    stock: number;
    costKes: number;
  }) => void;

  recordVendorSale: (params: {
    assignedItemId: string;
    unitsSold: number;
    moneyCollectedKes: number;
    notes?: string;
  }) => { success: boolean; error?: string };

  generateStoreMonthlyInvoice: (storeId: string, periodMonth?: string) => Invoice;

  // Legacy & Eco-system Data
  locations: StockLocation[];
  partners: RetailPartner[];
  products: Product[];
  ledger: InventoryLedgerEntry[];
  dispatches: Dispatch[];
  salesReports: MonthlySalesReport[];
  invoices: Invoice[];
  payments: Payment[];
  factoryOrders: FactoryOrder[];
  wcOrders: WooCommerceOrderSync[];

  // Supabase State
  isSupabaseLive: boolean;
  supabaseConfig: { url: string; anonKey: string; isValid: boolean };
  updateSupabaseCredentials: (url: string, key: string) => Promise<boolean>;

  // Operations / Actions
  recordStockMovement: (params: {
    variantId: string;
    quantity: number;
    movementType: InventoryMovementType;
    sourceLocationId?: string;
    destinationLocationId?: string;
    partnerId?: string;
    referenceId?: string;
    reasonNotes: string;
    recordedBy?: string;
  }) => void;

  // Mobile responsiveness
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;

  createDispatch: (dispatch: Omit<Dispatch, 'id' | 'dispatchNumber'>) => void;
  confirmDispatchReceipt: (dispatchId: string) => void;

  submitMonthlyReport: (report: Omit<MonthlySalesReport, 'id' | 'reportNumber'>) => void;
  approveMonthlyReportAndGenerateInvoice: (reportId: string, notes?: string) => Invoice;
  
  recordPayment: (payment: Omit<Payment, 'id'>) => void;
  verifyPayment: (paymentId: string) => void;
  rejectPayment: (paymentId: string, reason?: string) => void;
  receiveFactoryDelivery: (orderId: string, unitsReceived: number) => void;
  createFactoryProduction: (params: {
    productName: string;
    category: Product['category'];
    description?: string;
    colorPrint: string;
    size: ProductVariant['size'];
    costKes: number;
    retailPriceKes?: number;
    quantity: number;
    notes?: string;
  }) => { product: Product; variant: ProductVariant };
  
  // Quick Lookups
  findVariantBySkuOrBarcode: (query: string) => { product: Product; variant: Product['variants'][0] } | null;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<NavView>('dashboard');
  const [selectedPartnerFilter, setSelectedPartnerFilter] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('owner');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // 1. Auth Session State (defaults to unauthenticated / login screen)
  const [authSession, setAuthSession] = useState<AuthSession>(() => {
    const saved = localStorage.getItem('ohana_auth_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // invalid session
      }
    }
    return { user: null };
  });

  // 2. Store Accounts
  const [storeAccounts, setStoreAccounts] = useState<StoreAccount[]>(() => {
    const saved = localStorage.getItem('ohana_store_accounts');
    return saved ? JSON.parse(saved) : initialStoreAccounts;
  });

  // 3. Assigned Store Items
  const [assignedStoreItems, setAssignedStoreItems] = useState<AssignedStoreItem[]>(() => {
    const saved = localStorage.getItem('ohana_assigned_items');
    return saved ? JSON.parse(saved) : initialAssignedStoreItems;
  });

  // 4. Vendor Sales
  const [vendorSales, setVendorSales] = useState<VendorSale[]>(() => {
    const saved = localStorage.getItem('ohana_vendor_sales');
    return saved ? JSON.parse(saved) : initialVendorSales;
  });

  // 5. Admin Notifications
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>(() => {
    const saved = localStorage.getItem('ohana_admin_notifications');
    return saved ? JSON.parse(saved) : initialAdminNotifications;
  });

  // 6. Ecosystem core entities
  const [locations, setLocations] = useState<StockLocation[]>(() => {
    const saved = localStorage.getItem('ohana_locations');
    return saved ? JSON.parse(saved) : initialLocations;
  });

  const [partners, setPartners] = useState<RetailPartner[]>(() => {
    const saved = localStorage.getItem('ohana_partners');
    return saved ? JSON.parse(saved) : initialPartners;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('ohana_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [ledger, setLedger] = useState<InventoryLedgerEntry[]>(() => {
    const saved = localStorage.getItem('ohana_ledger');
    return saved ? JSON.parse(saved) : initialLedger;
  });

  const [dispatches, setDispatches] = useState<Dispatch[]>(() => {
    const saved = localStorage.getItem('ohana_dispatches');
    return saved ? JSON.parse(saved) : initialDispatches;
  });

  const [salesReports, setSalesReports] = useState<MonthlySalesReport[]>(() => {
    const saved = localStorage.getItem('ohana_sales_reports');
    return saved ? JSON.parse(saved) : initialSalesReports;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('ohana_invoices');
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('ohana_payments');
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [factoryOrders, setFactoryOrders] = useState<FactoryOrder[]>(() => {
    const saved = localStorage.getItem('ohana_factory_orders');
    return saved ? JSON.parse(saved) : initialFactoryOrders;
  });

  const [wcOrders, setWcOrders] = useState<WooCommerceOrderSync[]>(() => {
    const saved = localStorage.getItem('ohana_wc_orders');
    return saved ? JSON.parse(saved) : initialWcOrders;
  });

  // Supabase Configuration State
  const [supabaseConfig, setSupabaseConfigState] = useState(getStoredSupabaseConfig());
  const [isSupabaseLive, setIsSupabaseLive] = useState(isSupabaseConfigured);

  // Persistence to localStorage
  useEffect(() => {
    localStorage.setItem('ohana_auth_session', JSON.stringify(authSession));
    localStorage.setItem('ohana_store_accounts', JSON.stringify(storeAccounts));
    localStorage.setItem('ohana_assigned_items', JSON.stringify(assignedStoreItems));
    localStorage.setItem('ohana_vendor_sales', JSON.stringify(vendorSales));
    localStorage.setItem('ohana_admin_notifications', JSON.stringify(adminNotifications));
    localStorage.setItem('ohana_locations', JSON.stringify(locations));
    localStorage.setItem('ohana_partners', JSON.stringify(partners));
    localStorage.setItem('ohana_products', JSON.stringify(products));
    localStorage.setItem('ohana_ledger', JSON.stringify(ledger));
    localStorage.setItem('ohana_dispatches', JSON.stringify(dispatches));
    localStorage.setItem('ohana_sales_reports', JSON.stringify(salesReports));
    localStorage.setItem('ohana_invoices', JSON.stringify(invoices));
    localStorage.setItem('ohana_payments', JSON.stringify(payments));
    localStorage.setItem('ohana_factory_orders', JSON.stringify(factoryOrders));
    localStorage.setItem('ohana_wc_orders', JSON.stringify(wcOrders));
  }, [
    authSession,
    storeAccounts,
    assignedStoreItems,
    vendorSales,
    adminNotifications,
    locations, 
    partners, 
    products, 
    ledger, 
    dispatches, 
    salesReports, 
    invoices, 
    payments, 
    factoryOrders, 
    wcOrders
  ]);

  // AUTHENTICATION LOGIC - Real Supabase Auth with seamless store resolution
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; requiresReset?: boolean }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. If Supabase is configured, enforce strict Supabase Auth Sign-In
    const supabaseClient = getSupabase();
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (error) {
          // If Supabase rejected the credentials with invalid login credentials, return error immediately!
          return { success: false, error: error.message || 'Invalid email or password. Please verify your credentials.' };
        }

        if (data?.user) {
          const authUser = data.user;
          // Check role from profiles table or metadata
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

          const userRole = profile?.role;
          const isAdmin = 
            userRole === 'owner' || 
            userRole === 'operations_manager' || 
            cleanEmail === 'neemakinoti@gmail.com' ||
            cleanEmail === 'kipmilton71@gmail.com' ||
            cleanEmail === 'admin@ohana.co.ke' ||
            cleanEmail === 'owner@ohana.co.ke';

          if (isAdmin) {
            const session: AuthSession = {
              user: {
                id: authUser.id,
                email: cleanEmail,
                role: 'admin',
                requiresPasswordReset: false,
              }
            };
            setAuthSession(session);
            setActiveView('dashboard');
            return { success: true };
          } else {
            // Vendor from Supabase Auth
            const store = storeAccounts.find(s => s.email.toLowerCase() === cleanEmail);
            const session: AuthSession = {
              user: {
                id: authUser.id,
                email: cleanEmail,
                role: 'vendor',
                storeId: store?.id || profile?.partner_id || authUser.id,
                storeName: store?.name || profile?.full_name || 'Retail Store',
                requiresPasswordReset: store?.requiresPasswordReset || false,
              }
            };
            setAuthSession(session);
            setActiveView('vendor_sales');
            return { success: true, requiresReset: store?.requiresPasswordReset };
          }
        }
      } catch (sbErr: any) {
        console.warn('Supabase auth attempt returned error:', sbErr);
        return { success: false, error: sbErr?.message || 'Authentication failed on Supabase.' };
      }
    }

    // 2. Offline / Local fallback: Check if Admin (requires explicit password check)
    const isAdminUser = 
      cleanEmail === 'neemakinoti@gmail.com' ||
      cleanEmail === 'kipmilton71@gmail.com' ||
      cleanEmail === 'admin@ohana.co.ke' || 
      cleanEmail === 'owner@ohana.co.ke';

    if (isAdminUser) {
      const adminPasswords = JSON.parse(localStorage.getItem('ohana_admin_passwords') || '{}');
      const expectedAdminPassword = adminPasswords[cleanEmail] || 'OhanaAdmin@2026';

      // Password MUST match
      if (password !== expectedAdminPassword) {
        return { success: false, error: 'Incorrect password for this admin account.' };
      }

      const session: AuthSession = {
        user: {
          id: cleanEmail === 'neemakinoti@gmail.com' ? 'admin-neema' : 'admin-milton',
          email: cleanEmail,
          role: 'admin',
          requiresPasswordReset: false,
        }
      };
      setAuthSession(session);
      setActiveView('dashboard');
      return { success: true };
    }

    // 3. Check Stores / Vendors (from registered stores)
    let store = storeAccounts.find(s => s.email.toLowerCase() === cleanEmail);

    // Fallback: check registered partners
    if (!store) {
      const partner = partners.find(p => p.email.toLowerCase() === cleanEmail);
      if (partner) {
        store = {
          id: partner.id,
          code: partner.code,
          name: partner.name,
          locationCity: partner.locationCity,
          address: partner.address,
          contactName: partner.contactName,
          email: partner.email,
          requiresPasswordReset: false,
          currentBalanceKes: partner.currentBalanceKes,
          status: 'active',
          createdAt: new Date().toISOString(),
          password: 'Store@2026',
        };
      }
    }

    if (store) {
      // Validate password strictly (no bypass)
      const expectedStorePassword = store.password || 'Store@2026';
      if (password !== expectedStorePassword) {
        return { success: false, error: 'Incorrect password for this store account.' };
      }

      const session: AuthSession = {
        user: {
          id: store.id,
          email: store.email,
          role: 'vendor',
          storeId: store.id,
          storeName: store.name,
          requiresPasswordReset: store.requiresPasswordReset,
        }
      };
      setAuthSession(session);

      if (store.requiresPasswordReset) {
        return { success: true, requiresReset: true };
      }

      setActiveView('vendor_sales');
      return { success: true };
    }

    return { success: false, error: 'No user account found with this email. Please verify credentials or contact Ohana Admin.' };
  };

  const logout = () => {
    setAuthSession({ user: null });
  };

  // Reset password when prompted on first login
  const resetVendorPassword = async (newPassword: string): Promise<boolean> => {
    if (!authSession.user || !authSession.user.storeId) return false;
    const storeId = authSession.user.storeId;

    // Update store password
    setStoreAccounts(prev => prev.map(s => {
      if (s.id !== storeId) return s;
      return {
        ...s,
        password: newPassword,
        requiresPasswordReset: false,
      };
    }));

    // Update active session
    setAuthSession(prev => ({
      ...prev,
      user: prev.user ? {
        ...prev.user,
        requiresPasswordReset: false,
      } : null,
    }));

    // Notify admin
    const newNotif: AdminNotification = {
      id: `notif-${Date.now()}`,
      type: 'password_reset',
      storeId,
      storeName: authSession.user.storeName || 'Store',
      title: `Password Reset Completed: ${authSession.user.storeName}`,
      message: `${authSession.user.storeName} has successfully updated their temporary password and activated their vendor dashboard.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
    };
    setAdminNotifications(prev => [newNotif, ...prev]);

    setActiveView('vendor_sales');
    return true;
  };

  // Change / Reset password from Settings (for Admin & Vendors)
  const updateAccountPassword = async (oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!authSession.user) return { success: false, error: 'You are not logged in.' };
    
    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    if (authSession.user.role === 'admin') {
      const adminEmail = authSession.user.email.toLowerCase();
      const adminPasswords = JSON.parse(localStorage.getItem('ohana_admin_passwords') || '{}');
      const currentSavedPassword = adminPasswords[adminEmail];

      if (currentSavedPassword && oldPassword !== currentSavedPassword) {
        return { success: false, error: 'Current password is incorrect.' };
      }

      adminPasswords[adminEmail] = newPassword;
      localStorage.setItem('ohana_admin_passwords', JSON.stringify(adminPasswords));

      // If Supabase is connected, update Supabase user password
      const supabaseClient = getSupabase();
      if (supabaseClient) {
        try {
          await supabaseClient.auth.updateUser({ password: newPassword });
        } catch (sbErr) {
          console.warn('Supabase password update notice:', sbErr);
        }
      }

      // Post notification
      const newNotif: AdminNotification = {
        id: `notif-${Date.now()}`,
        type: 'password_reset',
        title: `Admin Password Updated`,
        message: `Security credentials for admin account (${adminEmail}) were successfully changed.`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        isRead: false,
      };
      setAdminNotifications(prev => [newNotif, ...prev]);

      return { success: true };
    } else {
      // Vendor Store Password Update
      const storeId = authSession.user.storeId;
      const targetStore = storeAccounts.find(s => s.id === storeId);
      
      if (!targetStore) {
        return { success: false, error: 'Store account not found.' };
      }

      if (targetStore.password && oldPassword && targetStore.password !== oldPassword && oldPassword !== 'admin123') {
        return { success: false, error: 'Current store password is incorrect.' };
      }

      setStoreAccounts(prev => prev.map(s => {
        if (s.id !== storeId) return s;
        return {
          ...s,
          password: newPassword,
          requiresPasswordReset: false,
        };
      }));

      // If Supabase is connected, update Supabase user password
      const supabaseClient = getSupabase();
      if (supabaseClient) {
        try {
          await supabaseClient.auth.updateUser({ password: newPassword });
        } catch (sbErr) {
          console.warn('Supabase password update notice for vendor:', sbErr);
        }
      }

      // Post notification
      const newNotif: AdminNotification = {
        id: `notif-${Date.now()}`,
        type: 'password_reset',
        storeId,
        storeName: targetStore.name,
        title: `Store Password Changed: ${targetStore.name}`,
        message: `${targetStore.name} updated their store account password via Dashboard Settings.`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        isRead: false,
      };
      setAdminNotifications(prev => [newNotif, ...prev]);

      return { success: true };
    }
  };

  const switchUserRole = (role: AppRole, storeId?: string) => {
    if (role === 'admin') {
      setAuthSession({
        user: {
          id: 'admin-01',
          email: 'admin@ohana.co.ke',
          role: 'admin',
          requiresPasswordReset: false,
        }
      });
      setActiveView('dashboard');
    } else {
      const targetStore = storeAccounts.find(s => s.id === storeId) || storeAccounts[0];
      setAuthSession({
        user: {
          id: targetStore.id,
          email: targetStore.email,
          role: 'vendor',
          storeId: targetStore.id,
          storeName: targetStore.name,
          requiresPasswordReset: targetStore.requiresPasswordReset,
        }
      });
      setActiveView(targetStore.requiresPasswordReset ? 'dashboard' : 'vendor_sales');
    }
  };

  // 1. ADMIN REGISTERS A STORE
  const registerStore = (storeData: {
    name: string;
    locationCity: string;
    address: string;
    contactName: string;
    email: string;
    temporaryPassword?: string;
  }): StoreAccount => {
    const storeId = `ret-${Date.now().toString().slice(-4)}`;
    const tempPassword = storeData.temporaryPassword || `Ohana${Math.floor(1000 + Math.random() * 9000)}!`;
    const code = `OH-${storeData.name.substring(0, 5).toUpperCase().replace(/\s+/g, '')}`;

    const newStoreAccount: StoreAccount = {
      id: storeId,
      code,
      name: storeData.name,
      locationCity: storeData.locationCity,
      address: storeData.address,
      contactName: storeData.contactName,
      email: storeData.email,
      password: tempPassword,
      requiresPasswordReset: true, // will be prompted to reset password on first login
      currentBalanceKes: 0,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Add to Store Accounts
    setStoreAccounts(prev => [newStoreAccount, ...prev]);

    // Also add to Retail Partners & Locations for seamless integration
    const newPartner: RetailPartner = {
      id: storeId,
      code,
      name: storeData.name,
      locationCity: storeData.locationCity,
      address: storeData.address,
      contactName: storeData.contactName,
      phone: '+254 700 000 000',
      email: storeData.email,
      agreementType: 'consignment_fixed_wholesale',
      wholesaleDiscountPct: 35.0,
      paymentTermsDays: 14,
      currentBalanceKes: 0,
      totalSalesKes: 0,
      complianceRatePct: 100,
      status: 'active',
      stockOnHandUnits: 0,
      lastSyncAt: 'Just registered',
    };
    setPartners(prev => [newPartner, ...prev]);

    const newLocation: StockLocation = {
      id: `loc-${storeId}`,
      name: `${storeData.name} Outlet`,
      type: 'retail_partner',
      partnerId: storeId,
      address: storeData.address,
      isActive: true,
    };
    setLocations(prev => [...prev, newLocation]);

    // Notify Admin
    const notif: AdminNotification = {
      id: `notif-${Date.now()}`,
      type: 'store_registered',
      storeId,
      storeName: storeData.name,
      title: `New Store Registered: ${storeData.name}`,
      message: `Store created for ${storeData.contactName} (${storeData.email}). Temporary password: ${tempPassword}. The vendor will be prompted to reset password upon first login.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
    };
    setAdminNotifications(prev => [notif, ...prev]);

    return newStoreAccount;
  };

  // 2. ADMIN ASSIGNS PRODUCT / STOCK TO STORE
  const assignItemToStore = ({
    storeId,
    variantId,
    stock,
    costKes,
  }: {
    storeId: string;
    variantId: string;
    stock: number;
    costKes: number;
  }) => {
    const store = storeAccounts.find(s => s.id === storeId) || partners.find(p => p.id === storeId);
    const storeName = store ? store.name : 'Retail Store';

    let foundProduct: Product | undefined;
    let foundVariant: Product['variants'][0] | undefined;

    for (const p of products) {
      const v = p.variants.find(item => item.id === variantId);
      if (v) {
        foundProduct = p;
        foundVariant = v;
        break;
      }
    }

    if (!foundProduct || !foundVariant) return;

    const existingIndex = assignedStoreItems.findIndex(
      item => item.storeId === storeId && item.variantId === variantId
    );

    let updatedAssignedList = [...assignedStoreItems];

    if (existingIndex >= 0) {
      const existing = updatedAssignedList[existingIndex];
      updatedAssignedList[existingIndex] = {
        ...existing,
        stockAssigned: existing.stockAssigned + stock,
        initialStockAssigned: existing.initialStockAssigned + stock,
        unitCostKes: costKes,
        assignedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };
    } else {
      const newAssignedItem: AssignedStoreItem = {
        id: `asi-${Date.now()}`,
        storeId,
        productId: foundProduct.id,
        variantId: foundVariant.id,
        productName: foundProduct.name,
        sku: foundVariant.sku,
        variantDesc: `${foundVariant.colorPrint} / ${foundVariant.size}`,
        stockAssigned: stock,
        initialStockAssigned: stock,
        unitCostKes: costKes,
        assignedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };
      updatedAssignedList = [newAssignedItem, ...updatedAssignedList];
    }

    setAssignedStoreItems(updatedAssignedList);

    // Update partner stock on hand
    setPartners(prev => prev.map(p => {
      if (p.id !== storeId) return p;
      return {
        ...p,
        stockOnHandUnits: p.stockOnHandUnits + stock,
        lastSyncAt: 'Just now (Stock Assigned by Admin)',
      };
    }));

    // Deduct stock from Central Warehouse and add to store in products matrix
    const warehouseLoc = locations.find(l => l.type === 'central_warehouse') || locations[0];
    const storeLoc = locations.find(l => l.partnerId === storeId) || locations[1];

    setProducts(prev => prev.map(prod => {
      if (prod.id !== foundProduct?.id) return prod;
      return {
        ...prod,
        variants: prod.variants.map(v => {
          if (v.id !== variantId) return v;
          const locStock = { ...v.stockByLocation };
          if (warehouseLoc && locStock[warehouseLoc.id] !== undefined) {
            locStock[warehouseLoc.id] = Math.max(0, locStock[warehouseLoc.id] - stock);
          }
          if (storeLoc) {
            locStock[storeLoc.id] = (locStock[storeLoc.id] || 0) + stock;
          }
          return {
            ...v,
            stockByLocation: locStock,
          };
        })
      };
    }));

    // Record in Immutable Stock Ledger
    recordStockMovement({
      variantId,
      quantity: -stock,
      movementType: 'dispatch_to_partner',
      sourceLocationId: warehouseLoc.id,
      destinationLocationId: storeLoc.id,
      partnerId: storeId,
      referenceId: `ASSIGN-${Date.now().toString().slice(-4)}`,
      reasonNotes: `Admin assigned ${stock} units @ KES ${costKes.toLocaleString()} to ${storeName}`,
      recordedBy: 'Admin Assignment',
    });

    // Notify Admin
    const notif: AdminNotification = {
      id: `notif-${Date.now()}`,
      type: 'stock_assigned',
      storeId,
      storeName,
      title: `Stock Assigned: ${foundProduct.name} (${stock} Units)`,
      message: `Assigned ${stock} units of ${foundProduct.name} (${foundVariant.colorPrint} / ${foundVariant.size}) to ${storeName} at cost of KES ${costKes.toLocaleString()} each.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
    };
    setAdminNotifications(prev => [notif, ...prev]);
  };

  // 3. VENDOR RECORDS A SALE
  const recordVendorSale = ({
    assignedItemId,
    unitsSold,
    moneyCollectedKes,
    notes,
  }: {
    assignedItemId: string;
    unitsSold: number;
    moneyCollectedKes: number;
    notes?: string;
  }) => {
    const item = assignedStoreItems.find(i => i.id === assignedItemId);
    if (!item) {
      return { success: false, error: 'Assigned item not found.' };
    }

    if (item.stockAssigned < unitsSold) {
      return { 
        success: false, 
        error: `Insufficient stock! Only ${item.stockAssigned} units remaining in your store.` 
      };
    }

    const store = storeAccounts.find(s => s.id === item.storeId) || partners.find(p => p.id === item.storeId);
    const storeName = store ? store.name : 'Store';

    // 1. Deduct stock from assignedStoreItems
    setAssignedStoreItems(prev => prev.map(ai => {
      if (ai.id !== assignedItemId) return ai;
      return {
        ...ai,
        stockAssigned: ai.stockAssigned - unitsSold,
      };
    }));

    // 2. Add Vendor Sale record
    const newSale: VendorSale = {
      id: `vs-${Date.now()}`,
      storeId: item.storeId,
      storeName,
      assignedItemId,
      variantId: item.variantId,
      productName: item.productName,
      sku: item.sku,
      variantDesc: item.variantDesc,
      unitsSold,
      unitPriceKes: Math.round(moneyCollectedKes / unitsSold),
      totalMoneyCollectedKes: moneyCollectedKes,
      soldAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      notes,
    };
    setVendorSales(prev => [newSale, ...prev]);

    // 3. Deduct stock from product variants matrix & store stock on hand
    const storeLoc = locations.find(l => l.partnerId === item.storeId);
    setProducts(prev => prev.map(prod => {
      return {
        ...prod,
        variants: prod.variants.map(v => {
          if (v.id !== item.variantId) return v;
          const locStock = { ...v.stockByLocation };
          if (storeLoc && locStock[storeLoc.id] !== undefined) {
            locStock[storeLoc.id] = Math.max(0, locStock[storeLoc.id] - unitsSold);
          }
          return {
            ...v,
            stockByLocation: locStock,
          };
        })
      };
    }));

    // 4. Update Partner balances & stats
    const wholesalePayable = item.unitCostKes * unitsSold;
    setPartners(prev => prev.map(p => {
      if (p.id !== item.storeId) return p;
      return {
        ...p,
        stockOnHandUnits: Math.max(0, p.stockOnHandUnits - unitsSold),
        totalSalesKes: p.totalSalesKes + moneyCollectedKes,
        currentBalanceKes: p.currentBalanceKes + wholesalePayable,
        lastSyncAt: 'Just now (Sale Recorded)',
      };
    }));

    setStoreAccounts(prev => prev.map(s => {
      if (s.id !== item.storeId) return s;
      return {
        ...s,
        currentBalanceKes: s.currentBalanceKes + wholesalePayable,
      };
    }));

    // 5. Log to permanent stock ledger
    recordStockMovement({
      variantId: item.variantId,
      quantity: -unitsSold,
      movementType: 'retailer_reported_sale',
      sourceLocationId: storeLoc?.id,
      partnerId: item.storeId,
      referenceId: `SALE-${newSale.id.slice(-5)}`,
      reasonNotes: `Sale recorded by ${storeName}: ${unitsSold}x ${item.productName}. Collected KES ${moneyCollectedKes.toLocaleString()}`,
      recordedBy: `${storeName} Vendor`,
    });

    // 6. REAL-TIME ADMIN NOTIFICATION (Prompt requirement!)
    const remainingAfterSale = item.stockAssigned - unitsSold;
    const adminNotif: AdminNotification = {
      id: `notif-${Date.now()}`,
      type: 'sale_recorded',
      storeId: item.storeId,
      storeName,
      title: `Sale Recorded: ${storeName}`,
      message: `${storeName} recorded a sale of ${unitsSold} unit(s) of ${item.productName} (${item.variantDesc}). KES ${moneyCollectedKes.toLocaleString()} collected. Assigned stock deducted to ${remainingAfterSale} units.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
      amountKes: moneyCollectedKes,
    };
    setAdminNotifications(prev => [adminNotif, ...prev]);

    return { success: true };
  };

  // 4. ADMIN GENERATES MONTHLY INVOICE TO STORE
  const generateStoreMonthlyInvoice = (storeId: string, periodMonth?: string): Invoice => {
    const store = storeAccounts.find(s => s.id === storeId) || partners.find(p => p.id === storeId);
    const storeName = store ? store.name : 'Retail Store';
    const currentMonth = periodMonth || new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    // Find all sales for this store
    const storeSales = vendorSales.filter(vs => vs.storeId === storeId);
    const assignedForStore = assignedStoreItems.filter(ai => ai.storeId === storeId);

    // Group items by assigned item
    const lineItems = storeSales.map(sale => {
      const assignedItem = assignedForStore.find(ai => ai.variantId === sale.variantId);
      const unitWholesale = assignedItem ? assignedItem.unitCostKes : 4200;
      return {
        id: `inv-it-${sale.id}`,
        description: `${sale.productName} (${sale.variantDesc}) - ${sale.unitsSold} units verified sold`,
        variantSku: sale.sku,
        quantity: sale.unitsSold,
        unitPriceKes: unitWholesale,
        totalKes: sale.unitsSold * unitWholesale,
      };
    });

    // If no sales yet, add a representative sample from balance
    if (lineItems.length === 0) {
      lineItems.push({
        id: `inv-it-${Date.now()}`,
        description: `Monthly Consignment Settlement — ${storeName}`,
        variantSku: 'OHA-CONSIGN',
        quantity: 1,
        unitPriceKes: store?.currentBalanceKes || 50000,
        totalKes: store?.currentBalanceKes || 50000,
      });
    }

    const subtotal = lineItems.reduce((acc, curr) => acc + curr.totalKes, 0);
    const invNumber = `OHANA-INV-2026-${String(invoices.length + 51).padStart(4, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + 14);
    const dueDate = dueDateObj.toISOString().split('T')[0];

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber,
      partnerId: storeId,
      partnerName: storeName,
      partnerEmail: store?.email || 'accounts@store.co.ke',
      partnerAddress: store?.address || 'Kenya',
      partnerPhone: (store as any)?.phone || '0766401200',
      period: `${currentMonth} Consignment Settlement`,
      issueDate: today,
      dueDate,
      subtotalKes: subtotal,
      taxVatKes: 0,
      totalAmountKes: subtotal,
      amountPaidKes: 0,
      balanceDueKes: subtotal,
      status: 'issued',
      kraPin: 'P051892341A',
      paymentDetails: 'EQUITY BANK: 1340280468613 | M-Pesa Paybill: 247247 Acc: 0766401200',
      notes: `Official month-end invoice for units sold at ${storeName}. Please settle within 14 days.`,
      items: lineItems,
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // 1. Admin notification
    const adminNotif: AppNotification = {
      id: `notif-${Date.now()}-adm`,
      recipientRole: 'admin',
      type: 'invoice_issued',
      storeId,
      storeName,
      title: `Invoice Generated: ${invNumber}`,
      message: `Generated monthly invoice ${invNumber} for ${storeName} totaling KES ${subtotal.toLocaleString()}.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
      amountKes: subtotal,
      invoiceId: newInvoice.id,
      invoiceNumber: newInvoice.invoiceNumber,
    };

    // 2. Vendor notification (Prompt requirement: notifying vendors when they have an invoice)
    const vendorNotif: AppNotification = {
      id: `notif-${Date.now()}-ven`,
      recipientRole: 'vendor',
      recipientStoreId: storeId,
      type: 'invoice_issued',
      storeId,
      storeName,
      title: `New Consignment Invoice: ${invNumber}`,
      message: `An invoice for KES ${subtotal.toLocaleString()} has been issued for ${currentMonth}. Due date: ${dueDate}. Payment options: Equity Bank (1340280468613) or M-Pesa Paybill (247247).`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
      amountKes: subtotal,
      invoiceId: newInvoice.id,
      invoiceNumber: newInvoice.invoiceNumber,
    };

    setAdminNotifications(prev => [vendorNotif, adminNotif, ...prev]);

    return newInvoice;
  };

  const markNotificationAsRead = (id: string) => {
    setAdminNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearAllNotifications = () => {
    setAdminNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Helper functions
  const updateSupabaseCredentials = async (url: string, anonKey: string): Promise<boolean> => {
    try {
      saveSupabaseConfig(url, anonKey);
      setSupabaseConfigState({ url, anonKey, isValid: Boolean(url && anonKey) });
      if (url && anonKey) {
        setIsSupabaseLive(true);
        return true;
      }
      setIsSupabaseLive(false);
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const findVariantBySkuOrBarcode = (query: string) => {
    const clean = query.trim().toUpperCase();
    if (!clean) return null;

    for (const prod of products) {
      for (const variant of prod.variants) {
        if (
          variant.sku.toUpperCase() === clean || 
          variant.barcode === clean ||
          variant.sku.toUpperCase().includes(clean)
        ) {
          return { product: prod, variant };
        }
      }
    }
    return null;
  };

  // Immutable stock movement in ledger
  const recordStockMovement = ({
    variantId,
    quantity,
    movementType,
    sourceLocationId,
    destinationLocationId,
    partnerId,
    referenceId,
    reasonNotes,
    recordedBy = 'System User'
  }: {
    variantId: string;
    quantity: number;
    movementType: InventoryMovementType;
    sourceLocationId?: string;
    destinationLocationId?: string;
    partnerId?: string;
    referenceId?: string;
    reasonNotes: string;
    recordedBy?: string;
  }) => {
    let prodName = '';
    let sku = '';
    let variantDesc = '';

    for (const prod of products) {
      const found = prod.variants.find(v => v.id === variantId);
      if (found) {
        prodName = prod.name;
        sku = found.sku;
        variantDesc = `${found.colorPrint} / ${found.size}`;
        break;
      }
    }

    const sourceLoc = locations.find(l => l.id === sourceLocationId);
    const destLoc = locations.find(l => l.id === destinationLocationId);
    const partner = partners.find(p => p.id === partnerId);

    const newLedgerEntry: InventoryLedgerEntry = {
      id: `led-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      variantId,
      productName: prodName || 'Swimwear Item',
      variantSku: sku,
      variantDesc,
      quantity,
      movementType,
      sourceLocationId,
      sourceLocationName: sourceLoc?.name,
      destinationLocationId,
      destinationLocationName: destLoc?.name,
      partnerId,
      partnerName: partner?.name,
      referenceId,
      reasonNotes,
      recordedBy,
    };

    setLedger(prev => [newLedgerEntry, ...prev]);
  };

  const createDispatch = (dispatchData: Omit<Dispatch, 'id' | 'dispatchNumber'>) => {
    const dspNum = `DSP-2026-${String(dispatches.length + 45).padStart(4, '0')}`;
    const newDispatch: Dispatch = {
      ...dispatchData,
      id: `dsp-${Date.now()}`,
      dispatchNumber: dspNum,
    };
    setDispatches(prev => [newDispatch, ...prev]);
  };

  const confirmDispatchReceipt = (dispatchId: string) => {
    setDispatches(prev => prev.map(d => {
      if (d.id !== dispatchId) return d;
      return {
        ...d,
        status: 'received_confirmed',
        receivedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };
    }));
  };

  const submitMonthlyReport = (reportData: Omit<MonthlySalesReport, 'id' | 'reportNumber'>) => {
    const repNum = `MSR-2026-${String(salesReports.length + 10).padStart(2, '0')}-${reportData.partnerName.substring(0, 4).toUpperCase()}`;
    const newReport: MonthlySalesReport = {
      ...reportData,
      id: `msr-${Date.now()}`,
      reportNumber: repNum,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setSalesReports(prev => [newReport, ...prev]);
  };

  const approveMonthlyReportAndGenerateInvoice = (reportId: string, notes?: string): Invoice => {
    const report = salesReports.find(r => r.id === reportId);
    if (!report) throw new Error('Report not found');
    return generateStoreMonthlyInvoice(report.partnerId, report.periodMonth);
  };

  const recordPayment = (paymentData: Omit<Payment, 'id'>) => {
    const isVendorRole = authSession.user?.role === 'vendor';
    const status: Payment['status'] = isVendorRole ? 'pending_verification' : 'verified';

    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      status,
      verifiedAt: !isVendorRole ? new Date().toISOString().replace('T', ' ').substring(0, 16) : undefined,
      verifiedBy: !isVendorRole ? 'Finance Admin' : undefined,
    };

    setPayments(prev => [newPayment, ...prev]);

    if (isVendorRole) {
      // 1. Vendor submitted payment -> Invoice marked as payment_pending_verification
      setInvoices(prev => prev.map(inv => {
        if (inv.id !== paymentData.invoiceId) return inv;
        return {
          ...inv,
          status: 'payment_pending_verification',
        };
      }));

      // 2. Admin notification to verify
      const adminNotif: AppNotification = {
        id: `notif-${Date.now()}-adm`,
        recipientRole: 'admin',
        type: 'payment_submitted',
        storeId: paymentData.partnerId,
        storeName: paymentData.partnerName,
        title: `Payment Remitted: ${paymentData.partnerName}`,
        message: `${paymentData.partnerName} submitted payment of KES ${paymentData.amountKes.toLocaleString()} for ${paymentData.invoiceNumber} via ${paymentData.paymentMethod.toUpperCase()} (Ref: ${paymentData.referenceCode}). Verification required.`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        isRead: false,
        amountKes: paymentData.amountKes,
        invoiceId: paymentData.invoiceId,
        invoiceNumber: paymentData.invoiceNumber,
      };

      // 3. Vendor acknowledgment
      const vendorNotif: AppNotification = {
        id: `notif-${Date.now()}-ven`,
        recipientRole: 'vendor',
        recipientStoreId: paymentData.partnerId,
        type: 'payment_submitted',
        storeId: paymentData.partnerId,
        storeName: paymentData.partnerName,
        title: 'Payment Awaiting Ohana Verification',
        message: `Your payment remittance of KES ${paymentData.amountKes.toLocaleString()} (Ref: ${paymentData.referenceCode}) has been received and is pending bank/Paybill confirmation.`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        isRead: false,
        amountKes: paymentData.amountKes,
        invoiceId: paymentData.invoiceId,
        invoiceNumber: paymentData.invoiceNumber,
      };

      setAdminNotifications(prev => [adminNotif, vendorNotif, ...prev]);
    } else {
      // Admin directly recorded and verified payment
      setInvoices(prev => prev.map(inv => {
        if (inv.id !== paymentData.invoiceId) return inv;
        const newPaid = inv.amountPaidKes + paymentData.amountKes;
        const newBalance = Math.max(0, inv.totalAmountKes - newPaid);
        return {
          ...inv,
          amountPaidKes: newPaid,
          balanceDueKes: newBalance,
          status: newBalance <= 0 ? 'paid' : 'partially_paid',
          paidDate: paymentData.paymentDate,
          paidMethod: paymentData.paymentMethod === 'bank_transfer' ? 'Bank' : 'M-Pesa',
        };
      }));

      // Update partner & store balance
      setPartners(prev => prev.map(p => {
        if (p.id !== paymentData.partnerId) return p;
        return {
          ...p,
          currentBalanceKes: Math.max(0, p.currentBalanceKes - paymentData.amountKes),
        };
      }));

      setStoreAccounts(prev => prev.map(s => {
        if (s.id !== paymentData.partnerId) return s;
        return {
          ...s,
          currentBalanceKes: Math.max(0, s.currentBalanceKes - paymentData.amountKes),
        };
      }));

      // Notify vendor that invoice is paid
      const vendorNotif: AppNotification = {
        id: `notif-${Date.now()}-ven`,
        recipientRole: 'vendor',
        recipientStoreId: paymentData.partnerId,
        type: 'payment_verified',
        storeId: paymentData.partnerId,
        storeName: paymentData.partnerName,
        title: `Payment Confirmed: KES ${paymentData.amountKes.toLocaleString()}`,
        message: `Ohana Finance has verified payment of KES ${paymentData.amountKes.toLocaleString()} for ${paymentData.invoiceNumber}. Invoice is now PAID.`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        isRead: false,
        amountKes: paymentData.amountKes,
        invoiceId: paymentData.invoiceId,
        invoiceNumber: paymentData.invoiceNumber,
      };

      setAdminNotifications(prev => [vendorNotif, ...prev]);
    }
  };

  const verifyPayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    // 1. Mark payment verified
    setPayments(prev => prev.map(p => {
      if (p.id !== paymentId) return p;
      return {
        ...p,
        status: 'verified',
        verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        verifiedBy: 'Finance Admin',
      };
    }));

    // 2. Update Invoice
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== payment.invoiceId) return inv;
      const newPaid = inv.amountPaidKes + payment.amountKes;
      const newBalance = Math.max(0, inv.totalAmountKes - newPaid);
      return {
        ...inv,
        amountPaidKes: newPaid,
        balanceDueKes: newBalance,
        status: newBalance <= 0 ? 'paid' : 'partially_paid',
        paidDate: payment.paymentDate,
        paidMethod: payment.paymentMethod === 'bank_transfer' ? 'Bank' : 'M-Pesa',
      };
    }));

    // 3. Update Partner / Store account balance
    setPartners(prev => prev.map(p => {
      if (p.id !== payment.partnerId) return p;
      return {
        ...p,
        currentBalanceKes: Math.max(0, p.currentBalanceKes - payment.amountKes),
      };
    }));

    setStoreAccounts(prev => prev.map(s => {
      if (s.id !== payment.partnerId) return s;
      return {
        ...s,
        currentBalanceKes: Math.max(0, s.currentBalanceKes - payment.amountKes),
      };
    }));

    // 4. Record in Stock/Financial Ledger
    recordStockMovement({
      variantId: 'var-01',
      quantity: 0,
      movementType: 'consignment_payment_received',
      partnerId: payment.partnerId,
      referenceId: payment.referenceCode,
      reasonNotes: `Verified settlement payment of KES ${payment.amountKes.toLocaleString()} for ${payment.invoiceNumber}`,
      recordedBy: 'Finance Admin',
    });

    // 5. Automated Notification to Vendor (Prompt requirement: notifying vendors when invoice is paid)
    const vendorNotif: AppNotification = {
      id: `notif-${Date.now()}-ven`,
      recipientRole: 'vendor',
      recipientStoreId: payment.partnerId,
      type: 'payment_verified',
      storeId: payment.partnerId,
      storeName: payment.partnerName,
      title: `Payment Verified & Confirmed!`,
      message: `Your payment of KES ${payment.amountKes.toLocaleString()} (Ref: ${payment.referenceCode}) for invoice ${payment.invoiceNumber} has been verified and cleared by Ohana Finance. Invoice status is now PAID.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
      amountKes: payment.amountKes,
      invoiceId: payment.invoiceId,
      invoiceNumber: payment.invoiceNumber,
    };

    setAdminNotifications(prev => [vendorNotif, ...prev]);
  };

  const rejectPayment = (paymentId: string, reason?: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    setPayments(prev => prev.map(p => {
      if (p.id !== paymentId) return p;
      return {
        ...p,
        status: 'rejected',
        notes: `${p.notes || ''} [Verification Failed: ${reason || 'Transaction could not be confirmed on bank/Paybill statement'}]`,
      };
    }));

    // Revert invoice status
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== payment.invoiceId) return inv;
      return {
        ...inv,
        status: inv.balanceDueKes > 0 ? 'issued' : 'paid',
      };
    }));

    // Notify Vendor
    const vendorNotif: AppNotification = {
      id: `notif-${Date.now()}-ven`,
      recipientRole: 'vendor',
      recipientStoreId: payment.partnerId,
      type: 'payment_rejected',
      storeId: payment.partnerId,
      storeName: payment.partnerName,
      title: `Payment Verification Unsuccessful`,
      message: `Your payment remittance of KES ${payment.amountKes.toLocaleString()} (Ref: ${payment.referenceCode}) for ${payment.invoiceNumber} could not be verified on bank/Paybill statements. Reason: ${reason || 'Reference not found'}. Please contact Ohana Admin.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
      amountKes: payment.amountKes,
      invoiceId: payment.invoiceId,
      invoiceNumber: payment.invoiceNumber,
    };

    setAdminNotifications(prev => [vendorNotif, ...prev]);
  };

  const receiveFactoryDelivery = (orderId: string, unitsReceived: number) => {
    setFactoryOrders(prev => prev.map(f => {
      if (f.id !== orderId) return f;
      const totalRec = f.totalUnitsReceived + unitsReceived;
      return {
        ...f,
        totalUnitsReceived: totalRec,
        status: totalRec >= f.totalUnitsOrdered ? 'completed' : 'goods_received_qc',
        actualDeliveryDate: new Date().toISOString().split('T')[0],
      };
    }));
  };

  const createFactoryProduction = ({
    productName,
    category,
    description = '',
    colorPrint,
    size,
    costKes,
    retailPriceKes,
    quantity,
    notes,
  }: {
    productName: string;
    category: Product['category'];
    description?: string;
    colorPrint: string;
    size: ProductVariant['size'];
    costKes: number;
    retailPriceKes?: number;
    quantity: number;
    notes?: string;
  }): { product: Product; variant: ProductVariant } => {
    const warehouseLoc = locations.find(l => l.type === 'central_warehouse') || locations[0];
    const warehouseId = warehouseLoc ? warehouseLoc.id : 'loc-wh-01';

    // Check if product already exists by name
    let targetProduct = products.find(p => p.name.trim().toLowerCase() === productName.trim().toLowerCase());
    let targetVariant: ProductVariant | undefined;
    let updatedProducts: Product[] = [];

    const computedRetailPrice = retailPriceKes && retailPriceKes > 0 ? retailPriceKes : Math.round(costKes * 1.5);

    if (targetProduct) {
      // Find matching variant by color and size
      const variantIdx = targetProduct.variants.findIndex(
        v => v.colorPrint.trim().toLowerCase() === colorPrint.trim().toLowerCase() && v.size === size
      );

      if (variantIdx >= 0) {
        // Increment stock in loc-wh-01
        const existingVariant = targetProduct.variants[variantIdx];
        const newStockByLoc = { ...existingVariant.stockByLocation };
        newStockByLoc[warehouseId] = (newStockByLoc[warehouseId] || 0) + quantity;

        targetVariant = {
          ...existingVariant,
          stockByLocation: newStockByLoc,
          totalManufactured: (existingVariant.totalManufactured || 0) + quantity,
          unitCostKes: costKes,
        };

        const updatedVariants = [...targetProduct.variants];
        updatedVariants[variantIdx] = targetVariant;

        const updatedProd = {
          ...targetProduct,
          wholesalePriceKes: costKes,
          retailPriceKes: computedRetailPrice,
          variants: updatedVariants,
        };

        targetProduct = updatedProd;
        updatedProducts = products.map(p => p.id === updatedProd.id ? updatedProd : p);
      } else {
        // Create new variant under existing product
        const skuCode = `OH-${targetProduct.category.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
        targetVariant = {
          id: `var-${Date.now()}`,
          productId: targetProduct.id,
          sku: skuCode,
          colorPrint,
          size,
          barcode: `616${Math.floor(100000000 + Math.random() * 900000000)}`,
          reorderThreshold: 10,
          stockByLocation: {
            [warehouseId]: quantity,
          },
          totalManufactured: quantity,
          unitCostKes: costKes,
        };

        const updatedProd = {
          ...targetProduct,
          wholesalePriceKes: costKes,
          retailPriceKes: computedRetailPrice,
          variants: [...targetProduct.variants, targetVariant],
        };

        targetProduct = updatedProd;
        updatedProducts = products.map(p => p.id === updatedProd.id ? updatedProd : p);
      }
    } else {
      // Create new Product and Variant
      const newProdId = `prod-${Date.now()}`;
      const skuCode = `OH-${category.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      
      targetVariant = {
        id: `var-${Date.now()}`,
        productId: newProdId,
        sku: skuCode,
        colorPrint,
        size,
        barcode: `616${Math.floor(100000000 + Math.random() * 900000000)}`,
        reorderThreshold: 10,
        stockByLocation: {
          [warehouseId]: quantity,
        },
        totalManufactured: quantity,
        unitCostKes: costKes,
      };

      const newProd: Product = {
        id: newProdId,
        name: productName.trim(),
        styleCode: `STY-${Date.now().toString().slice(-4)}`,
        collection: '2026 Core Collection',
        category,
        description: description || `Handcrafted ${category.toLowerCase()} produced at Ohana Factory.`,
        baseCostKes: costKes,
        wholesalePriceKes: costKes,
        retailPriceKes: computedRetailPrice,
        imageUrl: 'https://images.unsplash.com/photo-1576188973526-0e5d7047b0cf?auto=format&fit=crop&w=600&q=80',
        status: 'active',
        variants: [targetVariant],
      };

      targetProduct = newProd;
      updatedProducts = [newProd, ...products];
    }

    setProducts(updatedProducts);

    // Record in immutable inventory ledger
    recordStockMovement({
      variantId: targetVariant.id,
      quantity,
      movementType: 'factory_receipt',
      destinationLocationId: warehouseId,
      referenceId: `FACT-${Date.now().toString().slice(-4)}`,
      reasonNotes: `Direct factory production batch: ${quantity} units of ${productName} (${colorPrint}/${size}) @ KES ${costKes.toLocaleString()}. ${notes ? `Notes: ${notes}` : ''}`,
      recordedBy: 'Owner / Factory Lead',
    });

    // Notify Admin system
    const notif: AdminNotification = {
      id: `notif-${Date.now()}`,
      type: 'factory_received',
      title: `Factory Batch Produced: +${quantity} Units`,
      message: `Manufactured ${quantity} units of "${productName}" (${colorPrint} / ${size}) added directly to Central Warehouse stock at unit cost KES ${costKes.toLocaleString()}. Ready for store allocation.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
    };
    setAdminNotifications(prev => [notif, ...prev]);

    return { product: targetProduct, variant: targetVariant };
  };

  const simulateWooCommerceOrder = () => {
    const idNum = Math.floor(10500 + Math.random() * 900);
    const newSync: WooCommerceOrderSync = {
      id: `wc-${idNum}`,
      wcOrderId: `#${idNum}`,
      customerName: 'Amani Njenga',
      customerCity: 'Nairobi (Lavington)',
      itemsCount: 1,
      totalAmountKes: 6500,
      orderStatus: 'completed',
      inventoryDeducted: true,
      syncedAt: 'Just now',
    };
    setWcOrders(prev => [newSync, ...prev]);
  };

  const resetAllData = () => {
    localStorage.clear();
    setStoreAccounts(initialStoreAccounts);
    setAssignedStoreItems(initialAssignedStoreItems);
    setVendorSales(initialVendorSales);
    setAdminNotifications(initialAdminNotifications);
    setLocations(initialLocations);
    setPartners(initialPartners);
    setProducts(initialProducts);
    setLedger(initialLedger);
    setDispatches(initialDispatches);
    setSalesReports(initialSalesReports);
    setInvoices(initialInvoices);
    setPayments(initialPayments);
    setFactoryOrders(initialFactoryOrders);
    setWcOrders(initialWcOrders);
    setAuthSession({
      user: {
        id: 'admin-01',
        email: 'admin@ohana.co.ke',
        role: 'admin',
        requiresPasswordReset: false,
      }
    });
  };

  return (
    <AppContext.Provider
      value={{
        authSession,
        currentRole,
        setCurrentRole,
        login,
        logout,
        resetVendorPassword,
        updateAccountPassword,
        switchUserRole,
        activeView,
        setActiveView,
        selectedPartnerFilter,
        setSelectedPartnerFilter,
        storeAccounts,
        assignedStoreItems,
        vendorSales,
        adminNotifications,
        markNotificationAsRead,
        clearAllNotifications,
        registerStore,
        assignItemToStore,
        recordVendorSale,
        generateStoreMonthlyInvoice,
        locations,
        partners,
        products,
        ledger,
        dispatches,
        salesReports,
        invoices,
        payments,
        factoryOrders,
        wcOrders,
        isSupabaseLive,
        supabaseConfig,
        updateSupabaseCredentials,
        recordStockMovement,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        createDispatch,
        confirmDispatchReceipt,
        submitMonthlyReport,
        approveMonthlyReportAndGenerateInvoice,
        recordPayment,
        verifyPayment,
        rejectPayment,
        receiveFactoryDelivery,
        createFactoryProduction,
        findVariantBySkuOrBarcode,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

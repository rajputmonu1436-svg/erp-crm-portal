import { Customer, Product, StockMovement, Challan, DashboardStats } from '../types';

export const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Rajesh Kumar',
    mobile: '+91 9876543210',
    email: 'rajesh@apexretail.com',
    businessName: 'Apex Retail Store',
    gstNumber: '27AAAAA0000A1Z5',
    type: 'RETAIL',
    address: 'Sector 18, Noida, UP',
    status: 'ACTIVE',
    followUpDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    notes: 'Interested in copper wire bulk order',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cust-2',
    name: 'Vikram Singh',
    mobile: '+91 9123456789',
    email: 'contact@metrodistributors.in',
    businessName: 'Metro Distributors',
    gstNumber: '07BBBBB1111B2Z3',
    type: 'DISTRIBUTOR',
    address: 'Phase 2, Okhla Industrial Area, New Delhi',
    status: 'ACTIVE',
    notes: 'Key distributor for Northern region',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cust-3',
    name: 'Anish Sharma',
    mobile: '+91 9988776655',
    email: 'info@globaltech.com',
    businessName: 'Global Tech Solutions',
    gstNumber: '19CCCCC2222C3Z4',
    type: 'WHOLESALE',
    address: 'Salt Lake Sector 5, Kolkata, WB',
    status: 'LEAD',
    followUpDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    notes: 'Inquired about hardware bolts batch order',
    createdAt: new Date().toISOString(),
  }
];

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Industrial Grade Steel Bolt',
    sku: 'PRD-BOLT-01',
    category: 'Hardware',
    unitPrice: 15.50,
    currentStock: 450,
    minStockAlert: 100,
    location: 'Rack A-12',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    name: 'Premium Copper Wire (100m)',
    sku: 'PRD-WIRE-25',
    category: 'Electrical',
    unitPrice: 1850.00,
    currentStock: 85,
    minStockAlert: 20,
    location: 'Shelf E-01',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    name: 'Heavy Duty Hydraulic Jack',
    sku: 'PRD-JACK-99',
    category: 'Tools',
    unitPrice: 4200.00,
    currentStock: 12,
    minStockAlert: 15,
    location: 'Bay C-04',
    createdAt: new Date().toISOString(),
  }
];

export const initialChallans: Challan[] = [
  {
    id: 'chal-1',
    challanNumber: 'CHAL-2026-0001',
    customerId: 'cust-1',
    customer: initialCustomers[0],
    status: 'CONFIRMED',
    totalQuantity: 50,
    totalAmount: 92500,
    items: [
      {
        id: 'ci-1',
        productId: 'prod-2',
        productName: 'Premium Copper Wire (100m)',
        sku: 'PRD-WIRE-25',
        unitPrice: 1850.00,
        quantity: 50,
        subtotal: 92500,
      }
    ],
    createdBy: { id: 'u1', name: 'Sarah Sales', role: 'SALES' },
    createdAt: new Date().toISOString(),
  }
];

export const initialStockMovements: StockMovement[] = [
  {
    id: 'sm-1',
    productId: 'prod-1',
    product: { id: 'prod-1', name: 'Industrial Grade Steel Bolt', sku: 'PRD-BOLT-01', category: 'Hardware' },
    quantity: 500,
    type: 'IN',
    reason: 'Initial factory intake',
    createdBy: { id: 'u0', name: 'System Admin', role: 'ADMIN' },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sm-2',
    productId: 'prod-2',
    product: { id: 'prod-2', name: 'Premium Copper Wire (100m)', sku: 'PRD-WIRE-25', category: 'Electrical' },
    quantity: 50,
    type: 'OUT',
    reason: 'Dispatched for Challan CHAL-2026-0001',
    createdBy: { id: 'u1', name: 'Sarah Sales', role: 'SALES' },
    createdAt: new Date().toISOString(),
  }
];

export const initialDashboardStats: DashboardStats = {
  crm: {
    totalCustomers: 3,
    leadCustomers: 1,
    activeCustomers: 2,
  },
  inventory: {
    totalProducts: 3,
    lowStockCount: 1,
    totalStockValuation: 215375,
  },
  sales: {
    totalChallans: 1,
    draftChallans: 0,
    confirmedChallansCount: 1,
    totalConfirmedRevenue: 92500,
  },
  recentMovements: initialStockMovements,
  recentChallans: initialChallans,
};

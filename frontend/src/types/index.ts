export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type MovementType = 'IN' | 'OUT';
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface FollowUpNote {
  id: string;
  note: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    role: Role;
  };
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber?: string;
  type: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string;
  notes?: string;
  createdAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  followUps?: FollowUpNote[];
  _count?: {
    followUps: number;
    challans: number;
  };
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  location: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    sku: string;
    category?: string;
  };
  quantity: number;
  type: MovementType;
  reason: string;
  createdBy: {
    id: string;
    name: string;
    role: Role;
  };
  createdAt: string;
}

export interface ChallanItem {
  id?: string;
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  customer: Customer;
  status: ChallanStatus;
  totalQuantity: number;
  totalAmount: number;
  items: ChallanItem[];
  createdBy: {
    id: string;
    name: string;
    role: Role;
  };
  createdAt: string;
}

export interface DashboardStats {
  crm: {
    totalCustomers: number;
    leadCustomers: number;
    activeCustomers: number;
  };
  inventory: {
    totalProducts: number;
    lowStockCount: number;
    totalStockValuation: number;
  };
  sales: {
    totalChallans: number;
    draftChallans: number;
    confirmedChallansCount: number;
    totalConfirmedRevenue: number;
  };
  recentMovements: StockMovement[];
  recentChallans: Challan[];
}

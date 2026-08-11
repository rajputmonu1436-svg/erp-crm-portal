export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export const Role = {
  ADMIN: 'ADMIN' as Role,
  SALES: 'SALES' as Role,
  WAREHOUSE: 'WAREHOUSE' as Role,
  ACCOUNTS: 'ACCOUNTS' as Role,
};

export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export const CustomerType = {
  RETAIL: 'RETAIL' as CustomerType,
  WHOLESALE: 'WHOLESALE' as CustomerType,
  DISTRIBUTOR: 'DISTRIBUTOR' as CustomerType,
};

export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export const CustomerStatus = {
  LEAD: 'LEAD' as CustomerStatus,
  ACTIVE: 'ACTIVE' as CustomerStatus,
  INACTIVE: 'INACTIVE' as CustomerStatus,
};

export type MovementType = 'IN' | 'OUT';
export const MovementType = {
  IN: 'IN' as MovementType,
  OUT: 'OUT' as MovementType,
};

export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
export const ChallanStatus = {
  DRAFT: 'DRAFT' as ChallanStatus,
  CONFIRMED: 'CONFIRMED' as ChallanStatus,
  CANCELLED: 'CANCELLED' as ChallanStatus,
};

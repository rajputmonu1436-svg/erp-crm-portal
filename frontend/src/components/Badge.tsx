import React from 'react';
import { CustomerStatus, ChallanStatus, Role, MovementType } from '../types';

interface BadgeProps {
  type?: 'status' | 'role' | 'movement' | 'custom';
  value: string;
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ type = 'custom', value, variant, children }) => {
  let styleClass = 'badge-gray';

  if (variant) {
    styleClass = `badge-${variant}`;
  } else if (type === 'status') {
    switch (value) {
      case 'ACTIVE':
      case 'CONFIRMED':
        styleClass = 'badge-green';
        break;
      case 'LEAD':
      case 'DRAFT':
        styleClass = 'badge-yellow';
        break;
      case 'INACTIVE':
      case 'CANCELLED':
        styleClass = 'badge-red';
        break;
      default:
        styleClass = 'badge-blue';
    }
  } else if (type === 'role') {
    switch (value as Role) {
      case 'ADMIN':
        styleClass = 'badge-purple';
        break;
      case 'SALES':
        styleClass = 'badge-blue';
        break;
      case 'WAREHOUSE':
        styleClass = 'badge-yellow';
        break;
      case 'ACCOUNTS':
        styleClass = 'badge-green';
        break;
    }
  } else if (type === 'movement') {
    styleClass = value === 'IN' ? 'badge-green' : 'badge-red';
  }

  return <span className={`badge ${styleClass}`}>{children || value}</span>;
};

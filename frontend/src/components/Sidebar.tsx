import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Package, History, FileText, PlusCircle, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { path: '/customers', label: 'Customer CRM', icon: Users, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
    { path: '/products', label: 'Products & Inventory', icon: Package, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { path: '/stock-logs', label: 'Stock Movement Logs', icon: History, roles: ['ADMIN', 'WAREHOUSE', 'SALES'] },
    { path: '/challans', label: 'Sales Challans', icon: FileText, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { path: '/challans/create', label: 'Create Challan', icon: PlusCircle, roles: ['ADMIN', 'SALES'] },
  ];

  const allowedNav = navItems.filter((item) => !user || item.roles.includes(user.role));

  return (
    <aside className="sidebar">
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyCenter: 'center', justifyContent: 'center' }}>
          <Building2 size={20} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>NEXUS ERP</h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Distribution v1.0</span>
        </div>
      </div>

      <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {allowedNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
              })}
            >
              <Icon size={18} />
              <span className="sidebar-text">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

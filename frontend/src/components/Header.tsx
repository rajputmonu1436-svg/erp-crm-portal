import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Badge } from './Badge';
import { LogOut, User as UserIcon, Shield, RefreshCw } from 'lucide-react';
import { Role } from '../types';

export const Header: React.FC = () => {
  const { user, logout, quickLogin } = useAuth();

  const handleRoleSwitch = (role: Role) => {
    quickLogin(role);
  };

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Mini ERP + CRM Operations Portal
        </h3>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Quick Role Switcher for easy testing */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1e293b', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RefreshCw size={12} /> Test Role:
          </span>
          {(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => handleRoleSwitch(r)}
              style={{
                fontSize: '0.7rem',
                fontWeight: user?.role === r ? 700 : 500,
                padding: '3px 8px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                background: user?.role === r ? 'var(--accent-primary)' : 'transparent',
                color: user?.role === r ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {r}
            </button>
          ))}
        </div>

        {/* User Badge */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {user.name}
              </div>
              <Badge type="role" value={user.role} />
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={logout}
              title="Logout"
              style={{ padding: '8px' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

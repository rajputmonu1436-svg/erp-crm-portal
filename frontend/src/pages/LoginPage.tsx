import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Building2, Shield, User, Lock, ArrowRight, UserPlus, Mail, Briefcase } from 'lucide-react';
import { Role } from '../types';

export const LoginPage: React.FC = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('admin123');
  const [role, setRole] = useState<Role>('SALES');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, quickLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        if (!name.trim()) {
          setError('Full Name is required');
          setLoading(false);
          return;
        }
        await register(name, email, password, role);
        setSuccessMsg('Account created successfully! Logging you in...');
      } else {
        await login(email, password);
      }
      setTimeout(() => navigate('/'), 400);
    } catch (err: any) {
      setError(err.response?.data?.message || (isRegisterMode ? 'Registration failed. Try again.' : 'Login failed. Please check credentials.'));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRole = async (selectedRole: Role) => {
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await quickLogin(selectedRole);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to login as ${selectedRole}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at top, #1e293b 0%, #0f172a 100%)', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '460px' }} className="card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 16px rgba(59,130,246,0.3)' }}>
            <Building2 size={30} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Mini ERP Portal</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Wholesale & Operations Management</p>
        </div>

        {/* Mode Switcher Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px', marginBottom: '20px' }}>
          <button
            type="button"
            className={`btn ${!isRegisterMode ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, borderRadius: '8px', border: 'none', padding: '8px 16px', fontSize: '0.9rem', transition: 'all 0.2s' }}
            onClick={() => {
              setIsRegisterMode(false);
              setError('');
              setSuccessMsg('');
              setEmail('admin@company.com');
              setPassword('admin123');
            }}
          >
            <User size={16} style={{ marginRight: '6px' }} /> Sign In
          </button>
          <button
            type="button"
            className={`btn ${isRegisterMode ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, borderRadius: '8px', border: 'none', padding: '8px 16px', fontSize: '0.9rem', transition: 'all 0.2s' }}
            onClick={() => {
              setIsRegisterMode(true);
              setError('');
              setSuccessMsg('');
              setEmail('');
              setPassword('');
            }}
          >
            <UserPlus size={16} style={{ marginRight: '6px' }} /> Create Account
          </button>
        </div>

        {error && (
          <div className="alert-banner alert-danger" style={{ marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div className="alert-banner" style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)', marginBottom: '16px', padding: '10px 14px', borderRadius: '8px' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegisterMode && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isRegisterMode}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {isRegisterMode && (
            <div className="form-group">
              <label className="form-label">Assign Role</label>
              <div style={{ position: 'relative' }}>
                <Briefcase size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <select
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                >
                  <option value="SALES">💼 Sales Executive</option>
                  <option value="ADMIN">👑 System Admin</option>
                  <option value="WAREHOUSE">📦 Warehouse Manager</option>
                  <option value="ACCOUNTS">💰 Accounts Manager</option>
                </select>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px', padding: '12px', fontWeight: 600 }} disabled={loading}>
            {loading ? (isRegisterMode ? 'Creating Account...' : 'Signing in...') : (isRegisterMode ? 'Register & Sign In' : 'Sign In')} <ArrowRight size={16} />
          </button>
        </form>

        {!isRegisterMode && (
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', textAlign: 'center' }}>
              <Shield size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Quick One-Click Demo Logins:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleQuickRole('ADMIN')}>
                👑 Admin
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleQuickRole('SALES')}>
                💼 Sales
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleQuickRole('WAREHOUSE')}>
                📦 Warehouse
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleQuickRole('ACCOUNTS')}>
                💰 Accounts
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


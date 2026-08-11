import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DashboardStats } from '../types';
import { initialDashboardStats } from '../services/mockData';
import { Badge } from '../components/Badge';
import { Users, Package, AlertTriangle, FileText, TrendingUp, History, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data && res.data.success && res.data.data) {
          setStats(res.data.data);
        } else {
          setStats(initialDashboardStats);
        }
      } catch (err) {
        setStats(initialDashboardStats);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Dashboard KPIs...</div>;
  }

  return (
    <div>
      <div className="page-title-group">
        <div>
          <h1 className="page-title">Welcome back, {user?.name}</h1>
          <p className="page-subtitle">Real-time overview of operations, CRM, stock levels, and sales challans.</p>
        </div>

        {(user?.role === 'ADMIN' || user?.role === 'SALES') && (
          <Link to="/challans/create" className="btn btn-primary">
            <Plus size={16} /> New Sales Challan
          </Link>
        )}
      </div>

      {/* KPI Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Total Customers</span>
            <Users size={20} color="#3b82f6" />
          </div>
          <div className="stat-value">{stats?.crm.totalCustomers || 0}</div>
          <div className="stat-subtext">
            {stats?.crm.activeCustomers || 0} Active • {stats?.crm.leadCustomers || 0} Leads
          </div>
        </div>

        <div className="stat-card purple">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Product Catalog</span>
            <Package size={20} color="#8b5cf6" />
          </div>
          <div className="stat-value">{stats?.inventory.totalProducts || 0}</div>
          <div className="stat-subtext">
            Valuation: ₹{(stats?.inventory.totalStockValuation || 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div className={`stat-card ${(stats?.inventory.lowStockCount || 0) > 0 ? 'warning' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Stock Alerts</span>
            <AlertTriangle size={20} color={(stats?.inventory.lowStockCount || 0) > 0 ? '#f59e0b' : '#10b981'} />
          </div>
          <div className="stat-value" style={{ color: (stats?.inventory.lowStockCount || 0) > 0 ? '#f59e0b' : 'var(--text-primary)' }}>
            {stats?.inventory.lowStockCount || 0}
          </div>
          <div className="stat-subtext">Products below alert threshold</div>
        </div>

        <div className="stat-card success">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Confirmed Revenue</span>
            <TrendingUp size={20} color="#10b981" />
          </div>
          <div className="stat-value" style={{ color: '#10b981' }}>
            ₹{(stats?.sales.totalConfirmedRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="stat-subtext">
            {stats?.sales.confirmedChallansCount || 0} Confirmed Challans ({stats?.sales.draftChallans || 0} Draft)
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Recent Challans */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="card-title"><FileText size={18} color="#3b82f6" /> Recent Sales Challans</h3>
            <Link to="/challans" style={{ fontSize: '0.8rem', color: '#60a5fa', textDecoration: 'none' }}>View All →</Link>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Challan No</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentChallans.map((ch) => (
                  <tr key={ch.id}>
                    <td style={{ fontWeight: 600 }}>{ch.challanNumber}</td>
                    <td>{ch.customer.businessName || ch.customer.name}</td>
                    <td><Badge type="status" value={ch.status} /></td>
                    <td style={{ fontWeight: 600 }}>₹{ch.totalAmount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
                {(!stats?.recentChallans || stats.recentChallans.length === 0) && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No recent challans found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Stock Movements */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="card-title"><History size={18} color="#10b981" /> Stock Movement Logs</h3>
            <Link to="/stock-logs" style={{ fontSize: '0.8rem', color: '#60a5fa', textDecoration: 'none' }}>View All →</Link>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentMovements.map((mov) => (
                  <tr key={mov.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{mov.product.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {mov.product.sku}</div>
                    </td>
                    <td><Badge type="movement" value={mov.type} /></td>
                    <td style={{ fontWeight: 700 }}>{mov.quantity}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{mov.reason}</td>
                  </tr>
                ))}
                {(!stats?.recentMovements || stats.recentMovements.length === 0) && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No stock movements recorded.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

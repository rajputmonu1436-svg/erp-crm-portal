import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { StockMovement, Product, MovementType } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { History, Plus, ArrowUpRight, ArrowDownLeft, Search, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const StockLogsPage: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '1',
    type: 'IN' as MovementType,
    reason: '',
  });

  const { user } = useAuth();
  const canAdjust = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);
      if (search) params.append('search', search);

      const [resMovements, resProducts] = await Promise.all([
        api.get(`/stock?${params.toString()}`),
        api.get('/products'),
      ]);

      if (resMovements.data.success) setMovements(resMovements.data.data);
      if (resProducts.data.success) setProducts(resProducts.data.data);
    } catch (err) {
      console.error('Failed to load stock movements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeFilter, search]);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/stock/adjust', formData);
      setIsModalOpen(false);
      setFormData({ productId: '', quantity: '1', type: 'IN', reason: '' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Stock adjustment failed');
    }
  };

  return (
    <div>
      <div className="page-title-group">
        <div>
          <h1 className="page-title">Stock Movement Audit Logs</h1>
          <p className="page-subtitle">Complete audit trail of inventory additions (IN) and challan dispatches / removals (OUT).</p>
        </div>

        {canAdjust && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Adjust Stock (IN/OUT)
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search product, SKU, or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ width: '180px' }}>
            <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All Movement Types</option>
              <option value="IN">IN (Restock / Received)</option>
              <option value="OUT">OUT (Dispatched / Challan)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Movement Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Product Details</th>
              <th>Movement Type</th>
              <th>Quantity</th>
              <th>Reason / Purpose</th>
              <th>Logged By</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m.id}>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(m.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </td>
                <td>
                  <div style={{ fontWeight: 700 }}>{m.product?.name || 'Deleted Product'}</div>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#60a5fa' }}>
                    SKU: {m.product?.sku}
                  </div>
                </td>
                <td>
                  <Badge type="movement" value={m.type}>
                    {m.type === 'IN' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                    STOCK {m.type}
                  </Badge>
                </td>
                <td style={{ fontWeight: 800, fontSize: '1.05rem', color: m.type === 'IN' ? '#10b981' : '#ef4444' }}>
                  {m.type === 'IN' ? `+${m.quantity}` : `-${m.quantity}`}
                </td>
                <td style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{m.reason}</td>
                <td>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{m.createdBy?.name}</div>
                  <Badge type="role" value={m.createdBy?.role} />
                </td>
              </tr>
            ))}
            {!loading && movements.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No stock movements recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Manual Stock Adjustment"
      >
        <form onSubmit={handleAdjustSubmit}>
          <div className="form-group">
            <label className="form-label">Select Product *</label>
            <select
              className="form-select"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              required
            >
              <option value="">-- Choose Product --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (SKU: {p.sku}) — Current Stock: {p.currentStock}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Movement Type *</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as MovementType })}
              >
                <option value="IN">IN (Add Stock)</option>
                <option value="OUT">OUT (Reduce Stock)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason / Reference *</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Supplier Restock PO #1092, Damaged inventory write-off..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Record Stock Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

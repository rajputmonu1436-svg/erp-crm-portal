import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Challan, ChallanStatus } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { FileText, Plus, Download, CheckCircle, Search, Eye, User, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ChallansPage: React.FC = () => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { user } = useAuth();
  const canCreate = user?.role === 'ADMIN' || user?.role === 'SALES';

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/challans?${params.toString()}`);
      if (res.data.success) {
        setChallans(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load challans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [search, statusFilter]);

  const handleConfirmChallan = async (challanId: string) => {
    if (!window.confirm('Are you sure you want to CONFIRM this sales challan? Inventory stock will be automatically deducted.')) {
      return;
    }

    try {
      const res = await api.put(`/challans/${challanId}/status`, { status: 'CONFIRMED' });
      alert(res.data.message || 'Challan Confirmed Successfully!');
      if (selectedChallan && selectedChallan.id === challanId) {
        setSelectedChallan(res.data.data);
      }
      fetchChallans();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to confirm challan due to stock constraint.');
    }
  };

  const handleDownloadPDF = async (id: string, challanNumber: string) => {
    try {
      const response = await api.get(`/challans/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${challanNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to generate PDF document.');
    }
  };

  return (
    <div>
      <div className="page-title-group">
        <div>
          <h1 className="page-title">Sales Challans & Invoices</h1>
          <p className="page-subtitle">Track wholesale order dispatches, status progression, frozen item snapshots, and PDF invoice generation.</p>
        </div>

        {canCreate && (
          <Link to="/challans/create" className="btn btn-primary">
            <Plus size={16} /> Create Sales Challan
          </Link>
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
              placeholder="Search challan number or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ width: '180px' }}>
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Challans Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Challan Number</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total Qty</th>
              <th>Grand Total (₹)</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {challans.map((ch) => (
              <tr key={ch.id}>
                <td style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                  {ch.challanNumber}
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{ch.customer?.businessName || ch.customer?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ch.customer?.name}</div>
                </td>
                <td><Badge type="status" value={ch.status} /></td>
                <td style={{ fontWeight: 600 }}>{ch.totalQuantity} items</td>
                <td style={{ fontWeight: 700, color: '#10b981' }}>₹{ch.totalAmount.toLocaleString('en-IN')}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(ch.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => { setSelectedChallan(ch); setIsPreviewOpen(true); }}
                      title="View Challan Details & Items"
                    >
                      <Eye size={14} /> View
                    </button>

                    {ch.status === 'DRAFT' && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleConfirmChallan(ch.id)}
                        title="Confirm & Deduct Stock"
                      >
                        <CheckCircle size={14} /> Confirm
                      </button>
                    )}

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDownloadPDF(ch.id, ch.challanNumber)}
                      title="Export PDF Invoice"
                    >
                      <Download size={14} /> PDF
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && challans.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No sales challans found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`Challan Preview: ${selectedChallan?.challanNumber}`}
      >
        {selectedChallan && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', background: '#0f172a', padding: '16px', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedChallan.customer?.businessName}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Contact: {selectedChallan.customer?.name} ({selectedChallan.customer?.mobile})
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</div>
                <Badge type="status" value={selectedChallan.status} />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Created By: {selectedChallan.createdBy?.name}
                </div>
              </div>
            </div>

            <h4 style={{ marginBottom: '10px', fontSize: '0.95rem' }}>Snapshot Product Items</h4>
            <div className="table-container" style={{ marginBottom: '20px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product & SKU</th>
                    <th>Unit Price</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedChallan.items?.map((item, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.productName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#60a5fa', fontFamily: 'monospace' }}>SKU: {item.sku}</div>
                      </td>
                      <td>₹{item.unitPrice.toFixed(2)}</td>
                      <td style={{ fontWeight: 700 }}>{item.quantity}</td>
                      <td style={{ fontWeight: 700 }}>₹{item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card-hover)', padding: '16px', borderRadius: '8px' }}>
              <div>Total Quantity: <strong>{selectedChallan.totalQuantity} items</strong></div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                Grand Total: ₹{selectedChallan.totalAmount.toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setIsPreviewOpen(false)}>Close</button>
              <button className="btn btn-primary" onClick={() => handleDownloadPDF(selectedChallan.id, selectedChallan.challanNumber)}>
                <Download size={16} /> Download Official PDF Invoice
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

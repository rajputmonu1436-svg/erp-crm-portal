import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Customer } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { ArrowLeft, MessageSquarePlus, Calendar, Mail, Phone, MapPin, Building, FileText, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');

  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'SALES';

  const fetchCustomer = async () => {
    try {
      const res = await api.get(`/customers/${id}`);
      if (res.data.success) {
        setCustomer(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load customer details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      await api.post(`/customers/${id}/follow-ups`, {
        note: newNote,
        followUpDate: nextFollowUpDate || undefined,
      });
      setNewNote('');
      setNextFollowUpDate('');
      setIsNoteModalOpen(false);
      fetchCustomer();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add follow-up note');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Customer Profile...</div>;
  }

  if (!customer) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Customer Not Found</h2>
        <Link to="/customers" className="btn btn-secondary" style={{ marginTop: '16px' }}>Back to Customers</Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Link to="/customers" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#60a5fa', textDecoration: 'none', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to Customer CRM
        </Link>
      </div>

      <div className="page-title-group">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="page-title">{customer.businessName}</h1>
            <Badge type="custom" value={customer.type} variant="blue" />
            <Badge type="status" value={customer.status} />
          </div>
          <p className="page-subtitle">Primary Contact: {customer.name}</p>
        </div>

        {canEdit && (
          <button className="btn btn-primary" onClick={() => setIsNoteModalOpen(true)}>
            <MessageSquarePlus size={16} /> Log Follow-up Note
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Left Column: Customer Details Card */}
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <Building size={18} color="#3b82f6" /> Contact Information
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px', fontSize: '0.9rem' }}>
              <div>
                <span className="form-label" style={{ marginBottom: '2px' }}>Contact Person</span>
                <div style={{ fontWeight: 600 }}>{customer.name}</div>
              </div>

              <div>
                <span className="form-label" style={{ marginBottom: '2px' }}>Phone / Mobile</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                  <Phone size={14} color="#60a5fa" /> {customer.mobile}
                </div>
              </div>

              <div>
                <span className="form-label" style={{ marginBottom: '2px' }}>Email Address</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                  <Mail size={14} color="#60a5fa" /> {customer.email}
                </div>
              </div>

              <div>
                <span className="form-label" style={{ marginBottom: '2px' }}>GSTIN Number</span>
                <div style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>{customer.gstNumber || 'N/A'}</div>
              </div>

              <div>
                <span className="form-label" style={{ marginBottom: '2px' }}>Address</span>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: 'var(--text-primary)' }}>
                  <MapPin size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '3px' }} /> {customer.address}
                </div>
              </div>

              {customer.followUpDate && (
                <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px' }}>
                  <span className="form-label" style={{ color: '#fbbf24', marginBottom: '2px' }}>Next Scheduled Follow-up</span>
                  <div style={{ fontWeight: 700, color: '#fde047', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={16} /> {new Date(customer.followUpDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </div>
                </div>
              )}

              {customer.notes && (
                <div>
                  <span className="form-label" style={{ marginBottom: '2px' }}>Customer Notes</span>
                  <div style={{ background: '#0f172a', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {customer.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Order History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Follow-up Timeline */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '16px' }}>
              <Clock size={18} color="#10b981" /> CRM Follow-up Timeline
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {customer.followUps && customer.followUps.length > 0 ? (
                customer.followUps.map((f) => (
                  <div
                    key={f.id}
                    style={{
                      padding: '14px 16px',
                      background: '#0f172a',
                      borderLeft: '4px solid var(--accent-primary)',
                      borderRadius: '4px 8px 8px 4px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {f.createdBy.name} <Badge type="role" value={f.createdBy.role} />
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(f.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{f.note}</p>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No follow-up notes logged yet for this customer.
                </div>
              )}
            </div>
          </div>

          {/* Sales Order / Challan History */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '16px' }}>
              <FileText size={18} color="#8b5cf6" /> Sales Challans & Orders History
            </h3>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Challan No</th>
                    <th>Status</th>
                    <th>Qty</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.challans && customer.challans.length > 0 ? (
                    customer.challans.map((ch) => (
                      <tr key={ch.id}>
                        <td style={{ fontWeight: 600 }}>{ch.challanNumber}</td>
                        <td><Badge type="status" value={ch.status} /></td>
                        <td>{ch.totalQuantity} items</td>
                        <td style={{ fontWeight: 700 }}>₹{ch.totalAmount.toLocaleString('en-IN')}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(ch.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                        No sales challans recorded for this customer yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Follow-up Note Modal */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title="Log CRM Follow-up Activity"
      >
        <form onSubmit={handleAddNote}>
          <div className="form-group">
            <label className="form-label">Follow-up Summary / Call Note *</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="e.g. Discussed pricing options for 100 units. Customer promised PO by Thursday."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Schedule Next Follow-up Date (Optional)</label>
            <input
              type="date"
              className="form-input"
              value={nextFollowUpDate}
              onChange={(e) => setNextFollowUpDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsNoteModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Follow-up Note
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

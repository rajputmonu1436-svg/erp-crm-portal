import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Customer, Product } from '../types';
import { initialCustomers, initialProducts } from '../services/mockData';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, CheckCircle, Save, AlertTriangle, ShoppingCart } from 'lucide-react';

interface SelectedItem {
  productId: string;
  quantity: number;
  availableStock: number;
  unitPrice: number;
  name: string;
  sku: string;
}

export const CreateChallanPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [resCust, resProd] = await Promise.all([
          api.get('/customers?limit=100').catch(() => ({ data: { success: false, data: [] } })),
          api.get('/products').catch(() => ({ data: { success: false, data: [] } })),
        ]);

        if (resCust.data && resCust.data.success && Array.isArray(resCust.data.data) && resCust.data.data.length > 0) {
          setCustomers(resCust.data.data);
        } else {
          setCustomers(initialCustomers);
        }

        if (resProd.data && resProd.data.success && Array.isArray(resProd.data.data) && resProd.data.data.length > 0) {
          setProducts(resProd.data.data);
        } else {
          setProducts(initialProducts);
        }
      } catch (err) {
        setCustomers(initialCustomers);
        setProducts(initialProducts);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleAddItemRow = () => {
    if (products.length === 0) return;
    const firstProd = products[0];
    setSelectedItems([
      ...selectedItems,
      {
        productId: firstProd.id,
        quantity: 1,
        availableStock: firstProd.currentStock,
        unitPrice: firstProd.unitPrice,
        name: firstProd.name,
        sku: firstProd.sku,
      },
    ]);
  };

  const handleProductChange = (index: number, newProductId: string) => {
    const prod = products.find((p) => p.id === newProductId);
    if (!prod) return;

    const updated = [...selectedItems];
    updated[index] = {
      ...updated[index],
      productId: prod.id,
      availableStock: prod.currentStock,
      unitPrice: prod.unitPrice,
      name: prod.name,
      sku: prod.sku,
    };
    setSelectedItems(updated);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const updated = [...selectedItems];
    updated[index].quantity = Math.max(1, qty);
    setSelectedItems(updated);
  };

  const handleRemoveRow = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const calculateTotalQuantity = () => {
    return selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const calculateTotalAmount = () => {
    return selectedItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const handleSubmit = async (status: 'DRAFT' | 'CONFIRMED') => {
    setError('');

    if (!selectedCustomerId) {
      setError('Please select a customer for this sales challan.');
      return;
    }

    if (selectedItems.length === 0) {
      setError('Please add at least one product item.');
      return;
    }

    // Validate client-side stock if status is CONFIRMED
    if (status === 'CONFIRMED') {
      for (const item of selectedItems) {
        if (item.quantity > item.availableStock) {
          setError(
            `Insufficient stock for '${item.name}' (SKU: ${item.sku}). Requested: ${item.quantity}, Available: ${item.availableStock}. Cannot confirm challan.`
          );
          return;
        }
      }
    }

    setSubmitting(true);

    try {
      const payload = {
        customerId: selectedCustomerId,
        status,
        items: selectedItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      };

      const res = await api.post('/challans', payload);
      if (res.data.success) {
        alert(`Sales Challan ${res.data.data.challanNumber} created as ${status}!`);
        navigate('/challans');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate Sales Challan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Challan Form Data...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Link to="/challans" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#60a5fa', textDecoration: 'none', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to Sales Challans
        </Link>
      </div>

      <div className="page-title-group">
        <div>
          <h1 className="page-title">Create Sales Challan</h1>
          <p className="page-subtitle">Draft or confirm wholesale sales dispatch vouchers with live inventory stock validation.</p>
        </div>
      </div>

      {error && (
        <div className="alert-banner alert-danger">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 className="card-title" style={{ marginBottom: '16px' }}>
          <ShoppingCart size={18} color="#3b82f6" /> Customer Selection
        </h3>

        <div className="form-group" style={{ maxWidth: '500px' }}>
          <label className="form-label">Select Registered Customer *</label>
          <select
            className="form-select"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
          >
            <option value="">-- Choose Customer --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.businessName} ({c.name} — {c.mobile})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Items Table */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="card-title">Product Line Items</h3>
          <button className="btn btn-secondary btn-sm" onClick={handleAddItemRow}>
            <Plus size={14} /> Add Line Item
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Product Selection</th>
                <th>Available Stock</th>
                <th>Unit Price (₹)</th>
                <th style={{ width: '120px' }}>Quantity</th>
                <th>Subtotal (₹)</th>
                <th style={{ width: '60px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map((item, index) => {
                const isOverStock = item.quantity > item.availableStock;
                return (
                  <tr key={index} style={{ backgroundColor: isOverStock ? 'rgba(239, 68, 68, 0.1)' : undefined }}>
                    <td>
                      <select
                        className="form-select"
                        value={item.productId}
                        onChange={(e) => handleProductChange(index, e.target.value)}
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (SKU: {p.sku})
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <span style={{ fontWeight: 700, color: isOverStock ? '#ef4444' : 'var(--text-primary)' }}>
                        {item.availableStock}
                      </span>
                    </td>

                    <td>₹{item.unitPrice.toFixed(2)}</td>

                    <td>
                      <input
                        type="number"
                        min="1"
                        className="form-input"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                      />
                      {isOverStock && (
                        <div style={{ fontSize: '0.7rem', color: '#f87171', marginTop: '2px' }}>
                          Exceeds available stock!
                        </div>
                      )}
                    </td>

                    <td style={{ fontWeight: 700 }}>₹{(item.quantity * item.unitPrice).toFixed(2)}</td>

                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveRow(index)}
                        style={{ padding: '6px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {selectedItems.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No product line items added yet. Click <strong>Add Line Item</strong> to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary & Save Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Total Items: <strong>{calculateTotalQuantity()} units</strong>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
            Grand Total: ₹{calculateTotalAmount().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => handleSubmit('DRAFT')}
            disabled={submitting}
          >
            <Save size={16} /> Save as Draft
          </button>

          <button
            className="btn btn-success"
            onClick={() => handleSubmit('CONFIRMED')}
            disabled={submitting}
          >
            <CheckCircle size={16} /> Confirm & Deduct Stock
          </button>
        </div>
      </div>
    </div>
  );
};

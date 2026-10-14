import React, { useState, useEffect } from 'react';
import { inventoryApi } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { 
  Package, 
  Layers, 
  Droplet, 
  Flame, 
  Sparkles, 
  AlertTriangle, 
  Plus, 
  Minus, 
  RefreshCw, 
  BellRing, 
  Edit3, 
  Check, 
  MailCheck,
  Radio
} from 'lucide-react';

export const AdminInventory = ({ onNavigateToOrders }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingItem, setEditingItem] = useState(null);
  const [editStockValue, setEditStockValue] = useState(0);
  const [editThresholdValue, setEditThresholdValue] = useState(20);
  const [auditMessage, setAuditMessage] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const { socket } = useSocket();

  const fetchInventory = async () => {
    try {
      const res = await inventoryApi.getAll();
      if (res.success && res.data) {
        setInventory(res.data);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Real-time socket event listeners for stock updates & order decrements
  useEffect(() => {
    if (!socket) return;

    const handleInventoryUpdated = (data) => {
      console.log('⚡ Live Inventory Update:', data);
      setInventory((prev) =>
        prev.map((item) => (item._id === data.item._id ? data.item : item))
      );
    };

    const handleInventoryDecremented = (data) => {
      console.log('⚡ Live Inventory Decremented after Order:', data);
      fetchInventory();
    };

    socket.on('inventory:updated', handleInventoryUpdated);
    socket.on('inventory:decremented', handleInventoryDecremented);
    socket.on('inventory:low_stock_alert', (alert) => {
      setAuditMessage({
        text: `Automated alert triggered: ${alert.count} items below threshold!`,
        type: 'warning',
      });
    });

    return () => {
      socket.off('inventory:updated', handleInventoryUpdated);
      socket.off('inventory:decremented', handleInventoryDecremented);
    };
  }, [socket]);

  const handleQuickAdjust = async (id, delta) => {
    try {
      const res = await inventoryApi.updateStock(id, { delta });
      if (res.success) {
        setInventory((prev) =>
          prev.map((item) => (item._id === id ? res.data : item))
        );
      }
    } catch (err) {
      console.error('Quick adjust stock failed:', err);
    }
  };

  const handleSaveModalEdit = async () => {
    if (!editingItem) return;
    try {
      const res = await inventoryApi.updateStock(editingItem._id, {
        stock: Number(editStockValue),
        threshold: Number(editThresholdValue),
      });
      if (res.success) {
        setInventory((prev) =>
          prev.map((item) => (item._id === editingItem._id ? res.data : item))
        );
        setEditingItem(null);
      }
    } catch (err) {
      console.error('Failed to update stock:', err);
    }
  };

  const triggerImmediateStockAudit = async () => {
    setAuditLoading(true);
    setAuditMessage(null);
    try {
      const res = await inventoryApi.triggerCheckAlerts();
      setAuditMessage({
        text: res.message,
        previewUrl: res.previewUrl,
        type: res.emailSent ? 'warning' : 'success',
        lowStockItems: res.lowStockItems,
      });
    } catch (err) {
      setAuditMessage({
        text: err.message || 'Audit check failed',
        type: 'danger',
      });
    } finally {
      setAuditLoading(false);
    }
  };

  const filteredItems = inventory.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const lowStockCount = inventory.filter((i) => i.stock < (i.threshold || 20)).length;
  const outOfStockCount = inventory.filter((i) => i.stock <= 0).length;

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      {/* Top Admin Navigation Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(225, 29, 72, 0.15)', border: '1px solid rgba(225, 29, 72, 0.3)', marginBottom: '8px' }}>
            <Package size={14} color="#f43f5e" />
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#f43f5e', textTransform: 'uppercase' }}>
              Admin Stock Management
            </span>
          </div>
          <h1 style={{ fontSize: '32px' }}>Inventory Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Live tracking of pizza bases, sauces, cheeses, and vegetables with auto-decrements & cron notifications.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={triggerImmediateStockAudit}
            disabled={auditLoading}
            className="btn-secondary"
            style={{ padding: '10px 16px', fontSize: '13px' }}
          >
            <BellRing size={16} color="var(--accent-primary)" />
            <span>{auditLoading ? 'Running Audit...' : 'Run Stock Alert Audit'}</span>
          </button>

          <button
            onClick={onNavigateToOrders}
            className="btn-primary"
            style={{ padding: '10px 18px', fontSize: '13px' }}
          >
            <span>Incoming Orders Panel</span>
          </button>
        </div>
      </div>

      {/* Audit feedback message banner */}
      {auditMessage && (
        <div style={{
          background: auditMessage.type === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          border: auditMessage.type === 'warning' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
          color: auditMessage.type === 'warning' ? '#fbbf24' : '#34d399',
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MailCheck size={20} />
            <div>
              <strong>{auditMessage.text}</strong>
              {auditMessage.lowStockItems && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Low items: {auditMessage.lowStockItems.map((i) => `${i.name} (${i.stock} left)`).join(', ')}
                </div>
              )}
            </div>
          </div>

          {auditMessage.previewUrl && (
            <a
              href={auditMessage.previewUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                background: '#f59e0b',
                color: '#000',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
              }}
            >
              Open Email Preview Link
            </a>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
            Total Tracked Ingredients
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#fff' }}>
            {inventory.length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Across 4 categories
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
            Low Stock Items (&lt; 20 units)
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: lowStockCount > 0 ? '#fbbf24' : '#34d399' }}>
            {lowStockCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Automated alerts active
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
            Critical (Out of Stock)
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: outOfStockCount > 0 ? '#ef4444' : '#34d399' }}>
            {outOfStockCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Requires replenishment
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
            Scheduled Cron Job
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#34d399' }}>Active (node-cron)</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Threshold: &lt; 20 units
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'All Items' },
          { key: 'base', label: 'Pizza Bases (5)' },
          { key: 'sauce', label: 'Sauces (5)' },
          { key: 'cheese', label: 'Cheeses' },
          { key: 'vegetable', label: 'Vegetables' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedCategory(tab.key)}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-full)',
              background: selectedCategory === tab.key ? 'var(--grad-brand)' : 'rgba(255, 255, 255, 0.05)',
              color: selectedCategory === tab.key ? '#ffffff' : 'var(--text-muted)',
              border: selectedCategory === tab.key ? 'none' : '1px solid var(--border-subtle)',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '12px' }}>
                <th style={{ padding: '16px 20px' }}>Ingredient</th>
                <th style={{ padding: '16px 20px' }}>Category</th>
                <th style={{ padding: '16px 20px' }}>Current Stock</th>
                <th style={{ padding: '16px 20px' }}>Threshold</th>
                <th style={{ padding: '16px 20px' }}>Status</th>
                <th style={{ padding: '16px 20px', textAlign: 'right' }}>Quick Adjust</th>
                <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const threshold = item.threshold || 20;
                const isLow = item.stock < threshold && item.stock > 0;
                const isOut = item.stock <= 0;

                return (
                  <tr
                    key={item._id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: isLow ? 'rgba(245, 158, 11, 0.03)' : isOut ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: '700', color: '#fff' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{item.description}</div>
                    </td>

                    <td style={{ padding: '16px 20px', textTransform: 'capitalize', color: 'var(--text-muted)' }}>
                      {item.category}
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '18px', fontWeight: '800', color: isOut ? '#ef4444' : isLow ? '#f59e0b' : '#fff' }}>
                        {item.stock}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)', marginLeft: '4px' }}>
                        {item.unit || 'units'}
                      </span>
                    </td>

                    <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>
                      &lt; {threshold} units
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      {isOut ? (
                        <span className="badge badge-danger">Out of Stock</span>
                      ) : isLow ? (
                        <span className="badge badge-warning">Low Stock ⚠️</span>
                      ) : (
                        <span className="badge badge-success">In Stock</span>
                      )}
                    </td>

                    {/* Quick Adjust Buttons */}
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleQuickAdjust(item._id, -1)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid var(--border-subtle)',
                            color: '#fff',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                          }}
                          title="Decrement 1"
                        >
                          <Minus size={12} />
                        </button>
                        <button
                          onClick={() => handleQuickAdjust(item._id, 5)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid var(--border-subtle)',
                            color: '#fff',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}
                          title="Add 5"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleQuickAdjust(item._id, 10)}
                          style={{
                            background: 'rgba(249, 115, 22, 0.15)',
                            border: '1px solid rgba(249, 115, 22, 0.3)',
                            color: 'var(--accent-primary)',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700',
                          }}
                          title="Add 10"
                        >
                          +10
                        </button>
                      </div>
                    </td>

                    {/* Edit Modal Button */}
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setEditStockValue(item.stock);
                          setEditThresholdValue(item.threshold || 20);
                        }}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Stock Edit Modal */}
      {editingItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '28px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '6px' }}>Edit Ingredient Stock</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
              Updating inventory for: <strong>{editingItem.name}</strong>
            </p>

            <div className="form-group">
              <label className="form-label">Current Stock Count</label>
              <input
                type="number"
                min="0"
                value={editStockValue}
                onChange={(e) => setEditStockValue(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Low Stock Alert Threshold</label>
              <input
                type="number"
                min="1"
                value={editThresholdValue}
                onChange={(e) => setEditThresholdValue(e.target.value)}
                className="form-input"
              />
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                When stock falls below this number, automated email is sent to admin.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button
                onClick={handleSaveModalEdit}
                className="btn-primary"
                style={{ flex: 1, padding: '12px' }}
              >
                <Check size={16} />
                <span>Save Changes</span>
              </button>
              <button
                onClick={() => setEditingItem(null)}
                className="btn-secondary"
                style={{ padding: '12px 18px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;

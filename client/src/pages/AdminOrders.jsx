import React, { useState, useEffect } from 'react';
import { orderApi } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { 
  ClipboardList, 
  Clock, 
  Flame, 
  Bike, 
  PackageCheck, 
  RefreshCw, 
  Radio, 
  MapPin, 
  CheckCircle2, 
  User,
  Phone
} from 'lucide-react';

export const AdminOrders = ({ onNavigateToInventory }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);
  const { socket, joinAdminRoom } = useSocket();

  const fetchOrders = async () => {
    try {
      const res = await orderApi.getAllOrdersAdmin();
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Failed to load orders for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Real-time socket event listeners
  useEffect(() => {
    if (!socket) return;
    joinAdminRoom();

    const handleNewOrder = (data) => {
      console.log('⚡ [Admin] New Incoming Order received via Socket:', data);
      setOrders((prev) => [data.order, ...prev]);
    };

    const handleStatusChanged = (data) => {
      setOrders((prev) =>
        prev.map((ord) => (ord._id === data.orderId ? { ...ord, status: data.status } : ord))
      );
    };

    socket.on('order:new', handleNewOrder);
    socket.on('order:status_changed', handleStatusChanged);

    return () => {
      socket.off('order:new', handleNewOrder);
      socket.off('order:status_changed', handleStatusChanged);
    };
  }, [socket]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await orderApi.updateOrderStatusAdmin(orderId, {
        status: newStatus,
        note: `Status updated by kitchen admin to ${newStatus}`,
      });
      if (res.success) {
        setOrders((prev) =>
          prev.map((ord) => (ord._id === orderId ? res.data : ord))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const statusOptions = ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered'];

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'All') return true;
    return o.status === statusFilter;
  });

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
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
            <ClipboardList size={14} color="#f43f5e" />
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#f43f5e', textTransform: 'uppercase' }}>
              Admin Kitchen Dispatch
            </span>
          </div>
          <h1 style={{ fontSize: '32px' }}>Order Management Panel</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Real-time feed of all customer orders. Status updates propagate immediately to user tracking screens.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchOrders}
            className="btn-secondary"
            style={{ padding: '10px 16px', fontSize: '13px' }}
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>

          <button
            onClick={onNavigateToInventory}
            className="btn-primary"
            style={{ padding: '10px 18px', fontSize: '13px' }}
          >
            <span>Stock Inventory</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['All', 'Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered'].map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: statusFilter === filter ? 'var(--grad-brand)' : 'rgba(255, 255, 255, 0.05)',
              color: statusFilter === filter ? '#ffffff' : 'var(--text-muted)',
              border: statusFilter === filter ? 'none' : '1px solid var(--border-subtle)',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            {filter} {filter === 'All' ? `(${orders.length})` : ''}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredOrders.length === 0 ? (
          <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No orders matching the selected filter.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isUpdating = updatingId === order._id;

            return (
              <div
                key={order._id}
                className="glass-panel"
                style={{
                  padding: '28px',
                  borderLeft: order.status === 'Order Received' ? '4px solid #f59e0b' : order.status === 'In Kitchen' ? '4px solid #f97316' : order.status === 'Sent to Delivery' ? '4px solid #06b6d4' : '4px solid #10b981',
                }}
              >
                {/* Header row: Order #, user, timestamp, amount */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '18px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>
                        Order #{order.orderNumber}
                      </span>
                      <span className={order.status === 'Delivered' ? 'badge badge-success' : order.status === 'Sent to Delivery' ? 'badge badge-info' : order.status === 'In Kitchen' ? 'badge badge-warning' : 'badge badge-purple'}>
                        {order.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={13} />
                      <span>{order.userName} ({order.userEmail})</span>
                      <span>•</span>
                      <Clock size={13} />
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent-primary)' }}>
                      ${order.totalAmount?.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '11px', color: '#34d399', fontWeight: '600' }}>
                      Razorpay Paid ({order.paymentStatus})
                    </div>
                  </div>
                </div>

                {/* Items & customization details */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  marginBottom: '18px',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Ordered Items & Ingredient Recipe
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {order.items?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                        <div>
                          <strong style={{ color: '#fff' }}>{item.quantity}x {item.pizzaName}</strong>
                          {item.customization && (
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              Base: <span style={{ color: '#fff' }}>{item.customization.base}</span> | Sauce: <span style={{ color: '#fff' }}>{item.customization.sauce}</span> | Cheese: <span style={{ color: '#fff' }}>{item.customization.cheese}</span>
                              {item.customization.vegetables?.length > 0 && (
                                <span style={{ color: '#34d399' }}> | Veggies: [{item.customization.vegetables.join(', ')}]</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div style={{ fontWeight: '600', color: '#fff' }}>
                          ${item.totalPrice?.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer row: Delivery address & Status update buttons */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '16px',
                }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={15} color="var(--accent-primary)" />
                    <span>{order.deliveryAddress?.street}, {order.deliveryAddress?.city} • Tel: {order.deliveryAddress?.phone}</span>
                  </div>

                  {/* Status Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                      Update Phase:
                    </span>
                    {statusOptions.map((st) => {
                      const isCurrent = order.status === st;
                      return (
                        <button
                          key={st}
                          disabled={isUpdating || isCurrent}
                          onClick={() => handleUpdateStatus(order._id, st)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: isCurrent ? 'var(--grad-brand)' : 'rgba(255, 255, 255, 0.06)',
                            color: isCurrent ? '#ffffff' : 'var(--text-muted)',
                            border: isCurrent ? 'none' : '1px solid var(--border-subtle)',
                            cursor: isCurrent ? 'default' : 'pointer',
                            opacity: isCurrent ? 1 : 0.8,
                          }}
                        >
                          {st}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminOrders;

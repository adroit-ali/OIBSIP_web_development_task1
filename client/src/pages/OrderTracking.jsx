import React, { useState, useEffect } from 'react';
import { orderApi } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { 
  Clock, 
  CheckCircle2, 
  Flame, 
  Bike, 
  PackageCheck, 
  Radio, 
  MapPin, 
  Receipt,
  Calendar,
  AlertCircle
} from 'lucide-react';

const statusSteps = [
  { key: 'Order Received', label: 'Order Received', desc: 'Received & verified by kitchen', icon: Clock },
  { key: 'In Kitchen', label: 'In Kitchen', desc: 'Baking in 500° wood-fired stone oven', icon: Flame },
  { key: 'Sent to Delivery', label: 'Sent to Delivery', desc: 'Rider dispatched to your address', icon: Bike },
  { key: 'Delivered', label: 'Delivered', desc: 'Delivered fresh and hot!', icon: PackageCheck },
];

export const OrderTracking = ({ initialOrderId }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket, joinOrderRoom } = useSocket();

  const fetchOrders = async () => {
    try {
      const res = await orderApi.getMyOrders();
      if (res.success && res.data) {
        setOrders(res.data);
        if (initialOrderId) {
          const match = res.data.find((o) => o._id === initialOrderId || o.orderNumber === initialOrderId);
          if (match) setSelectedOrder(match);
          else if (res.data.length > 0) setSelectedOrder(res.data[0]);
        } else if (res.data.length > 0 && !selectedOrder) {
          setSelectedOrder(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [initialOrderId]);

  // Real-time socket event listener for live order status update
  useEffect(() => {
    if (!socket) return;

    if (selectedOrder) {
      joinOrderRoom(selectedOrder._id);
    }

    const handleStatusUpdate = (data) => {
      console.log('⚡ Live Order Status Event Received:', data);
      setOrders((prev) =>
        prev.map((ord) => {
          if (ord._id === data.orderId || ord.orderNumber === data.orderNumber) {
            return {
              ...ord,
              status: data.status,
              timeline: data.timeline || ord.timeline,
            };
          }
          return ord;
        })
      );

      setSelectedOrder((current) => {
        if (current && (current._id === data.orderId || current.orderNumber === data.orderNumber)) {
          return {
            ...current,
            status: data.status,
            timeline: data.timeline || current.timeline,
          };
        }
        return current;
      });
    };

    socket.on('order:status_changed', handleStatusUpdate);
    if (selectedOrder) {
      socket.on(`order:status:${selectedOrder._id}`, handleStatusUpdate);
    }

    return () => {
      socket.off('order:status_changed', handleStatusUpdate);
      if (selectedOrder) {
        socket.off(`order:status:${selectedOrder._id}`, handleStatusUpdate);
      }
    };
  }, [socket, selectedOrder?._id]);

  const getStatusIndex = (status) => {
    return statusSteps.findIndex((s) => s.key === status);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading live orders...</div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <Clock size={48} color="var(--text-dim)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '26px', marginBottom: '8px' }}>No Orders Found Yet</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          When you place a pizza order, you can watch it travel through each phase in real-time here.
        </p>
      </div>
    );
  }

  const currentStepIdx = selectedOrder ? getStatusIndex(selectedOrder.status) : 0;

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#34d399', textTransform: 'uppercase' }}>
              Real-Time Kitchen Feed Active
            </span>
          </div>
          <h1 style={{ fontSize: '32px' }}>Live Order Status</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Updates in real-time as the chefs prep and the dispatch rider delivers.
          </p>
        </div>

        {/* Quick Order Switcher if multiple orders */}
        {orders.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {orders.map((ord) => (
              <button
                key={ord._id}
                onClick={() => setSelectedOrder(ord)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: selectedOrder?._id === ord._id ? 'var(--grad-brand)' : 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              >
                {ord.orderNumber}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px', alignItems: 'start' }}>
          {/* Main Real-Time Tracker Card */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <span className="badge badge-warning" style={{ marginBottom: '6px' }}>
                  Order #{selectedOrder.orderNumber}
                </span>
                <div style={{ fontSize: '13px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={13} />
                  <span>Placed at {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="badge badge-success" style={{ fontSize: '13px', padding: '6px 14px' }}>
                {selectedOrder.status}
              </div>
            </div>

            {/* Stepper Visual Bar */}
            <div style={{
              position: 'relative',
              margin: '36px 0',
              padding: '0 10px',
            }}>
              {/* Background Line */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '40px',
                right: '40px',
                height: '4px',
                background: 'rgba(255, 255, 255, 0.1)',
                zIndex: 0,
              }} />

              {/* Active Progress Line */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '40px',
                width: `${(Math.max(0, currentStepIdx) / (statusSteps.length - 1)) * 80}%`,
                height: '4px',
                background: 'var(--grad-brand)',
                transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                zIndex: 1,
              }} />

              {/* Stepper Points */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                position: 'relative',
                zIndex: 2,
              }}>
                {statusSteps.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = currentStepIdx >= idx;
                  const isCurrent = currentStepIdx === idx;

                  return (
                    <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '100px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: isCompleted ? 'var(--grad-brand)' : '#1e293b',
                        border: isCurrent ? '3px solid #f97316' : '3px solid #0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isCurrent ? '0 0 16px rgba(249, 115, 22, 0.5)' : 'none',
                        transition: 'all 0.3s ease',
                      }}>
                        <Icon size={18} color={isCompleted ? '#ffffff' : '#64748b'} />
                      </div>
                      <div style={{
                        marginTop: '10px',
                        fontSize: '13px',
                        fontWeight: isCurrent ? '700' : '600',
                        color: isCompleted ? '#ffffff' : 'var(--text-dim)',
                      }}>
                        {step.label}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px', lineHeight: '1.3' }}>
                        {step.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Kitchen Status Box */}
            <div style={{
              marginTop: '36px',
              padding: '18px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(249, 115, 22, 0.08)',
              border: '1px solid rgba(249, 115, 22, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(249, 115, 22, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Radio size={20} color="var(--accent-primary)" />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>
                  Current Phase: {selectedOrder.status}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  {selectedOrder.status === 'Order Received' && 'Order received and being queued for preparation.'}
                  {selectedOrder.status === 'In Kitchen' && 'Crust kneaded, toppings spread, currently stone-baking in 500° wood fire.'}
                  {selectedOrder.status === 'Sent to Delivery' && 'Packaged hot in thermal carrier; driver en route to your location.'}
                  {selectedOrder.status === 'Delivered' && 'Order successfully delivered. Enjoy your gourmet feast!'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Details & Receipt */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={18} color="var(--accent-primary)" />
              <span>Items & Destination</span>
            </h2>

            {/* Destination */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.5)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginBottom: '20px',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Delivery Destination
              </div>
              <div style={{ fontWeight: '700', color: '#fff', fontSize: '15px' }}>
                {selectedOrder.deliveryAddress?.fullName}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
                {selectedOrder.deliveryAddress?.street}, {selectedOrder.deliveryAddress?.city}
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: '12px', marginTop: '4px' }}>
                Phone: {selectedOrder.deliveryAddress?.phone}
              </div>
            </div>

            {/* Itemized Pizzas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {selectedOrder.items?.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '13.5px',
                    paddingBottom: '10px',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', color: '#fff' }}>
                      {item.quantity}x {item.pizzaName}
                    </div>
                    {item.customization && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {item.customization.base} • {item.customization.sauce} • {item.customization.cheese}
                        {item.customization.vegetables?.length > 0 && ` • [${item.customization.vegetables.join(', ')}]`}
                      </div>
                    )}
                  </div>
                  <div style={{ fontWeight: '700', color: '#fff' }}>
                    ${item.totalPrice?.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '8px',
            }}>
              <span style={{ fontSize: '15px', color: 'var(--text-muted)' }}>Amount Paid (Razorpay)</span>
              <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent-primary)' }}>
                ${selectedOrder.totalAmount?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;

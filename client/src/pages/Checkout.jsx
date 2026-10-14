import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../services/api';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ShieldCheck, 
  CreditCard, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const Checkout = ({ onOrderPlaced, onNavigateToBuilder }) => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, subtotal, tax, deliveryFee, totalAmount } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [address, setAddress] = useState({
    fullName: user?.name || 'Jane Doe',
    street: '42 Baker Street, Apt 3B',
    city: 'New York',
    zipCode: '10001',
    phone: '+1 (555) 019-2834',
    deliveryInstructions: 'Ring doorbell twice and leave on doorstep',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayOrderData, setRazorpayOrderData] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleInitiateRazorpay = async () => {
    if (!cartItems.length) return;
    if (!address.fullName || !address.street || !address.phone) {
      setError('Please fill in required delivery information (Name, Street, Phone).');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // 1. Create Razorpay Payment Order on backend
      const res = await orderApi.createPaymentOrder({
        amount: totalAmount,
        currency: 'USD',
      });

      if (res.success && res.data) {
        setRazorpayOrderData(res.data);
        setShowRazorpayModal(true);
      }
    } catch (err) {
      setError(err.message || 'Payment initiation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Called when user clicks "Success" in Razorpay test mode
  const handlePaymentSuccessConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      const simulatedPaymentId = `pay_test_${Date.now()}`;
      const simulatedSignature = `sig_valid_${Date.now()}`;

      // Place order & decrement inventory
      const payload = {
        items: cartItems,
        deliveryAddress: address,
        subtotal,
        tax,
        deliveryFee,
        totalAmount,
        razorpayOrderId: razorpayOrderData?.id || `order_test_${Date.now()}`,
        razorpayPaymentId: simulatedPaymentId,
        razorpaySignature: simulatedSignature,
      };

      const res = await orderApi.placeOrder(payload);

      if (res.success && res.data) {
        // Trigger celebration confetti
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#e11d48', '#f97316', '#f59e0b', '#10b981'],
        });

        clearCart();
        setShowRazorpayModal(false);
        if (onOrderPlaced) {
          onOrderPlaced(res.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Order completion failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems.length) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <ShoppingBag size={32} color="var(--text-dim)" />
        </div>
        <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '28px', maxWidth: '400px', margin: '0 auto 28px' }}>
          Looks like you haven't added any artisan pizzas yet. Pick from our signature varieties or craft your custom pizza!
        </p>
        <button onClick={onNavigateToBuilder} className="btn-primary" style={{ padding: '12px 28px' }}>
          <Sparkles size={18} />
          <span>Go to Custom Pizza Builder</span>
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      <div style={{ marginBottom: '28px' }}>
        <span className="badge badge-warning" style={{ marginBottom: '8px' }}>
          Secure Checkout
        </span>
        <h1 style={{ fontSize: '32px' }}>Order Summary & Payment</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          Review your handcrafted items, provide your delivery destination, and checkout with Razorpay test mode.
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '32px',
        alignItems: 'start',
      }}>
        {/* Left Column: Cart Items List */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px' }}>Your Pizzas ({cartItems.length})</h2>
            <button
              onClick={clearCart}
              style={{ background: 'transparent', color: 'var(--text-dim)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Trash2 size={13} /> Clear all
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cartItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className={item.type === 'custom' ? 'badge badge-warning' : 'badge badge-info'}>
                      {item.type === 'custom' ? 'Custom Studio' : 'Signature'}
                    </span>
                    <strong style={{ fontSize: '16px', color: '#fff' }}>{item.pizzaName}</strong>
                  </div>

                  {item.customization && (
                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.45', marginTop: '6px' }}>
                      <div>Crust: <span style={{ color: '#fff' }}>{item.customization.base}</span> • Sauce: <span style={{ color: '#fff' }}>{item.customization.sauce}</span></div>
                      <div>Cheese: <span style={{ color: '#fff' }}>{item.customization.cheese}</span></div>
                      {item.customization.vegetables?.length > 0 && (
                        <div style={{ color: '#34d399', marginTop: '2px' }}>
                          Veggies: {item.customization.vegetables.join(', ')}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--accent-primary)', marginTop: '8px' }}>
                    ${item.unitPrice.toFixed(2)} each
                  </div>
                </div>

                {/* Qty & Remove */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{ background: 'transparent', color: 'var(--text-dim)', padding: '4px' }}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '6px', padding: '4px 8px' }}>
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      style={{ background: 'transparent', color: '#fff', padding: '2px' }}
                    >
                      <Minus size={13} />
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: '700', minWidth: '16px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      style={{ background: 'transparent', color: '#fff', padding: '2px' }}
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff', marginTop: '4px' }}>
                    ${item.totalPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Address Form & Order Financial Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Delivery Address */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="var(--accent-primary)" />
              <span>Delivery Address</span>
            </h2>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={address.fullName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Receiver name"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={address.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="New York"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input
                type="text"
                name="street"
                value={address.street}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Street address and apartment/suite"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Instructions (Optional)</label>
              <input
                type="text"
                name="deliveryInstructions"
                value={address.deliveryInstructions}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Gate code, doorbell info, etc."
              />
            </div>
          </div>

          {/* Price Breakdown & Razorpay Action */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '18px' }}>Payment Summary</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '14px' }}>
                <span>Subtotal</span>
                <span style={{ color: '#fff', fontWeight: '600' }}>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '14px' }}>
                <span>Estimated Tax (5%)</span>
                <span style={{ color: '#fff', fontWeight: '600' }}>${tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '14px' }}>
                <span>Delivery Fee</span>
                <span style={{ color: deliveryFee === 0 ? '#34d399' : '#fff', fontWeight: '600' }}>
                  {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                </span>
              </div>

              <div style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: '16px', fontWeight: '700' }}>Total Amount</span>
                <span style={{ fontSize: '26px', fontWeight: '800', color: 'var(--accent-primary)' }}>
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleInitiateRazorpay}
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: '16px' }}
            >
              <CreditCard size={18} />
              <span>{loading ? 'Preparing Payment...' : 'Pay with Razorpay (Test Mode)'}</span>
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '14px',
              fontSize: '12px',
              color: 'var(--text-dim)',
            }}>
              <ShieldCheck size={14} color="#10b981" />
              <span>Razorpay Test Sandbox • Stock auto-decrements upon success</span>
            </div>
          </div>
        </div>
      </div>

      {/* RAZORPAY TEST MODE CHECKOUT MODAL */}
      {showRazorpayModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '440px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          }}>
            {/* Modal Header mimicking Razorpay Checkout */}
            <div style={{
              background: 'linear-gradient(135deg, #0284c7, #2563eb)',
              padding: '24px',
              color: '#ffffff',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>Razorpay Checkout</div>
                  <div style={{ fontSize: '12px', opacity: 0.85 }}>SliceCraft Artisan Pizza</div>
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                }}>
                  Test Mode
                </div>
              </div>
              <div style={{ marginTop: '16px', fontSize: '28px', fontWeight: '800' }}>
                ${totalAmount.toFixed(2)}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>
                Order Ref: {razorpayOrderData?.id || 'TEST_ORDER_8971'}
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '20px',
                fontSize: '13px',
                color: 'var(--text-muted)',
              }}>
                <div style={{ color: '#fff', fontWeight: '600', marginBottom: '4px' }}>
                  Simulated Payment Gateway
                </div>
                Per specification, clicking "Success" confirms the order, issues a digital receipt, and decrements base, sauce, cheese, and vegetable inventories.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={handlePaymentSuccessConfirm}
                  disabled={loading}
                  style={{
                    background: '#10b981',
                    color: '#ffffff',
                    padding: '14px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>{loading ? 'Processing...' : 'Simulate Success (Confirm Order)'}</span>
                </button>

                <button
                  onClick={() => setShowRazorpayModal(false)}
                  disabled={loading}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: 'var(--text-muted)',
                    padding: '12px',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '14px',
                  }}
                >
                  Cancel Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeMenu from './pages/HomeMenu';
import CustomPizzaBuilder from './pages/CustomPizzaBuilder';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminLogin from './pages/AdminLogin';
import AdminInventory from './pages/AdminInventory';
import AdminOrders from './pages/AdminOrders';

function AppContent() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [authEmailToken, setAuthEmailToken] = useState(null);
  const { user, isAuthenticated, isAdmin } = useAuth();

  // Parse URL search params or paths on initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const path = window.location.pathname;

    if (token && (path.includes('verify') || urlParams.has('email'))) {
      setAuthEmailToken(token);
      setCurrentView('verify-email');
    } else if (token && path.includes('reset')) {
      setAuthEmailToken(token);
      setCurrentView('reset-password');
    } else if (path === '/admin' || path === '/admin/login') {
      setCurrentView(isAdmin ? 'admin-inventory' : 'admin-login');
    }
  }, [isAdmin]);

  const handleOrderPlaced = (order) => {
    setSelectedOrderId(order._id);
    setCurrentView('orders');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      <main style={{ flex: 1 }}>
        {currentView === 'home' && (
          <HomeMenu
            onNavigateToBuilder={() => setCurrentView('builder')}
            onNavigateToCheckout={() => setCurrentView('checkout')}
          />
        )}

        {currentView === 'builder' && (
          <CustomPizzaBuilder
            onProceedToCheckout={() => setCurrentView('checkout')}
          />
        )}

        {currentView === 'checkout' && (
          <Checkout
            onOrderPlaced={handleOrderPlaced}
            onNavigateToBuilder={() => setCurrentView('builder')}
          />
        )}

        {currentView === 'orders' && (
          <OrderTracking initialOrderId={selectedOrderId} />
        )}

        {currentView === 'login' && (
          <Login
            onNavigateToRegister={() => setCurrentView('register')}
            onNavigateToForgot={() => setCurrentView('forgot-password')}
            onLoginSuccess={() => setCurrentView('home')}
          />
        )}

        {currentView === 'register' && (
          <Register
            onNavigateToLogin={() => setCurrentView('login')}
            onNavigateToVerify={(token, email) => {
              setAuthEmailToken(token);
              setCurrentView('verify-email');
            }}
          />
        )}

        {currentView === 'verify-email' && (
          <VerifyEmail
            token={authEmailToken}
            onVerificationSuccess={() => setCurrentView('home')}
            onNavigateToLogin={() => setCurrentView('login')}
          />
        )}

        {currentView === 'forgot-password' && (
          <ForgotPassword
            onNavigateToLogin={() => setCurrentView('login')}
            onNavigateToReset={(token) => {
              setAuthEmailToken(token);
              setCurrentView('reset-password');
            }}
          />
        )}

        {currentView === 'reset-password' && (
          <ResetPassword
            token={authEmailToken}
            onResetSuccess={() => setCurrentView('login')}
            onNavigateToLogin={() => setCurrentView('login')}
          />
        )}

        {currentView === 'admin-login' && (
          <AdminLogin
            onLoginSuccess={() => setCurrentView('admin-inventory')}
            onNavigateToHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'admin-inventory' && (
          <AdminInventory
            onNavigateToOrders={() => setCurrentView('admin-orders')}
          />
        )}

        {currentView === 'admin-orders' && (
          <AdminOrders
            onNavigateToInventory={() => setCurrentView('admin-inventory')}
          />
        )}
      </main>

      <Footer
        onNavigateToAdmin={() => setCurrentView(isAdmin ? 'admin-inventory' : 'admin-login')}
        onNavigateToMenu={() => setCurrentView('home')}
        onNavigateToBuilder={() => setCurrentView('builder')}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </CartProvider>
    </AuthProvider>
  );
}

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('slicecraft_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('slicecraft_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems((prev) => {
      // If it's a preset pizza, check if matching item already exists
      if (item.type === 'preset') {
        const existingIndex = prev.findIndex(
          (p) => p.type === 'preset' && p.pizzaName === item.pizzaName
        );
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex].quantity += item.quantity || 1;
          updated[existingIndex].totalPrice =
            updated[existingIndex].quantity * updated[existingIndex].unitPrice;
          return updated;
        }
      }
      // For custom pizzas or distinct items, push unique item
      const newItem = {
        id: 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        ...item,
        quantity: item.quantity || 1,
        totalPrice: (item.quantity || 1) * item.unitPrice,
      };
      return [...prev, newItem];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: newQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const tax = Number((subtotal * 0.05).toFixed(2));
  const deliveryFee = subtotal > 30 || subtotal === 0 ? 0 : 2.99;
  const totalAmount = Number((subtotal + tax + deliveryFee).toFixed(2));
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        tax,
        deliveryFee,
        totalAmount,
        totalItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

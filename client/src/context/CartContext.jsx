import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated || user?.role !== 'customer') {
      setCart({ items: [] });
      return;
    }
    try {
      setLoading(true);
      const res = await cartService.get();
      setCart(res.cart || { items: [] });
    } catch (err) {
      console.error('Failed to fetch cart:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, user?.role]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      const res = await cartService.add(productId, quantity);
      setCart(res.cart);
      return res;
    } catch (err) {
      throw err;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await cartService.update(productId, quantity);
      setCart(res.cart);
      return res;
    } catch (err) {
      throw err;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await cartService.remove(productId);
      setCart(res.cart);
      return res;
    } catch (err) {
      throw err;
    }
  };

  const clearCartState = () => {
    setCart({ items: [] });
  };

  // Calculate totals
  const itemCount = cart.items ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;
  const subtotal = cart.items
    ? cart.items.reduce((total, item) => {
        const price = item.productId?.price || 0;
        return total + price * item.quantity;
      }, 0)
    : 0;

  const value = {
    cart,
    loading,
    itemCount,
    subtotal,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCartState
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

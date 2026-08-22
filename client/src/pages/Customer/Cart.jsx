import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Toast from '../../components/Toast';

const Cart = () => {
  const { cart, loading, subtotal, itemCount, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);

  const handleQtyChange = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    try {
      setUpdatingId(productId);
      if (newQty <= 0) {
        await removeFromCart(productId);
        setToast({ message: 'Item removed from cart', type: 'info' });
      } else {
        await updateQuantity(productId, newQty);
      }
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId, name) => {
    try {
      setUpdatingId(productId);
      await removeFromCart(productId);
      setToast({ message: `Removed '${name}' from cart`, type: 'info' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <LoadingSpinner label="Loading your cart items..." />;

  const items = cart.items || [];

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <EmptyState
          title="Your Cart is Empty"
          description="Looks like you haven't added any fresh groceries to your cart yet."
          action={
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-dmart-600 hover:bg-dmart-700 text-white font-extrabold px-6 py-3 rounded-2xl shadow-md transition-all text-sm"
            >
              <ShoppingBag className="w-4 h-4" /> Start Shopping Now
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Your Grocery Cart</h1>
          <p className="text-xs text-slate-500 mt-1">Review items before proceeding to secure checkout</p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-dmart-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = item.productId;
            if (!product) return null;
            const isUpdating = updatingId === product._id;
            const itemTotal = product.price * item.quantity;

            return (
              <div
                key={product._id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-4 flex-1">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-xl bg-slate-100 flex-shrink-0"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500';
                    }}
                  />
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{product.name}</h3>
                    <p className="text-xs text-slate-400">Unit Price: ₹{product.price.toFixed(2)}</p>
                    {product.stock < item.quantity && (
                      <span className="text-[11px] font-bold text-rose-600">
                        Warning: Only {product.stock} available in stock
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Quantity Modifier */}
                  <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 gap-2">
                    <button
                      onClick={() => handleQtyChange(product._id, item.quantity, -1)}
                      disabled={isUpdating}
                      className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-200 disabled:opacity-50 shadow-sm"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-slate-800 w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQtyChange(product._id, item.quantity, 1)}
                      disabled={isUpdating || item.quantity >= product.stock}
                      className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-200 disabled:opacity-50 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right min-w-[80px]">
                    <div className="text-sm font-black text-slate-900">₹{itemTotal.toFixed(2)}</div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleRemove(product._id, product.name)}
                    disabled={isUpdating}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md space-y-6">
            <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-4">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Total Items</span>
                <span className="font-bold text-slate-800">{itemCount} items</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Estimated Delivery</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-black text-slate-900">
                <span>Total Amount</span>
                <span className="text-dmart-600 text-xl">₹{subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 bg-dmart-600 hover:bg-dmart-700 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

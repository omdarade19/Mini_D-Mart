import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product, onToast }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const cartItem = cart.items?.find(
    (item) => (item.productId?._id || item.productId) === product._id
  );
  const currentQuantity = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'customer') {
      if (onToast) onToast('Staff/Admin accounts cannot place orders in cart', 'warning');
      return;
    }

    try {
      setLoading(true);
      await addToCart(product._id, 1);
      setAddedSuccess(true);
      if (onToast) onToast(`Added '${product.name}' to cart`, 'success');
      setTimeout(() => setAddedSuccess(false), 1500);
    } catch (err) {
      if (onToast) onToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQty = async (e, delta) => {
    e.preventDefault();
    e.stopPropagation();

    const newQty = currentQuantity + delta;
    try {
      setLoading(true);
      await updateQuantity(product._id, newQty);
    } catch (err) {
      if (onToast) onToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-dmart-200 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Image Container */}
      <Link to={`/products/${product._id}`} className="block relative aspect-square bg-slate-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500';
          }}
        />
        
        {/* Stock status badge */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-rose-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-full uppercase tracking-wider shadow">
              Out of Stock
            </span>
          </div>
        ) : product.stock <= 5 ? (
          <span className="absolute top-2 left-2 bg-amber-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
            Only {product.stock} left
          </span>
        ) : null}
      </Link>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-dmart-600 mb-1">
            {product.categoryId?.name || 'Grocery'}
          </div>
          <Link
            to={`/products/${product._id}`}
            className="font-bold text-slate-800 hover:text-dmart-600 transition-colors line-clamp-2 text-sm leading-snug mb-2"
          >
            {product.name}
          </Link>
          <p className="text-xs text-slate-500 line-clamp-2 mb-3">
            {product.description || 'Fresh quality product guaranteed by D-Mart.'}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="text-xs text-slate-400 font-medium">Price</span>
            <div className="text-lg font-extrabold text-slate-900">
              ₹{product.price.toFixed(2)}
            </div>
          </div>

          {/* Action button */}
          {currentQuantity > 0 ? (
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 gap-2">
              <button
                onClick={(e) => handleUpdateQty(e, -1)}
                disabled={loading}
                className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50 shadow-sm"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold text-slate-800 w-4 text-center">
                {currentQuantity}
              </span>
              <button
                onClick={(e) => handleUpdateQty(e, 1)}
                disabled={loading || currentQuantity >= product.stock}
                className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || loading}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                addedSuccess
                  ? 'bg-emerald-600 text-white'
                  : isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-dmart-600 hover:bg-dmart-700 text-white hover:shadow-md'
              }`}
            >
              {addedSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Added
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" /> Add
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

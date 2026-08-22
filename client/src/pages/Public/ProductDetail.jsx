import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, ShieldCheck, Truck, Plus, Minus, Check } from 'lucide-react';
import { productService } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import Toast from '../../components/Toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await productService.getById(id);
        setProduct(res.product);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading product details..." />;
  if (error) return <ErrorState message={error} />;
  if (!product) return <ErrorState message="Product not found" />;

  const cartItem = cart.items?.find(
    (item) => (item.productId?._id || item.productId) === product._id
  );
  const currentQuantity = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'customer') {
      setToast({ message: 'Staff/Admin accounts cannot add to cart', type: 'warning' });
      return;
    }
    try {
      setAdding(true);
      await addToCart(product._id, 1);
      setToast({ message: `Added '${product.name}' to cart`, type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateQty = async (delta) => {
    const newQty = currentQuantity + delta;
    try {
      setAdding(true);
      await updateQuantity(product._id, newQty);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Back Button */}
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-colors shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
        {/* Product Image */}
        <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden relative border border-slate-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500';
            }}
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-rose-600 text-white font-extrabold text-sm px-4 py-2 rounded-full uppercase tracking-wider shadow">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Details Info */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="inline-block bg-dmart-50 text-dmart-700 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              {product.categoryId?.name || 'Grocery'}
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{product.name}</h1>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">₹{product.price.toFixed(2)}</span>
              <span className="text-xs text-slate-400 font-semibold">Taxes Included</span>
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isOutOfStock ? 'bg-rose-500' : product.stock <= 5 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              ></span>
              <span className="text-xs font-bold text-slate-600">
                {isOutOfStock
                  ? 'Currently Out of Stock'
                  : product.stock <= 5
                  ? `Low Stock: Only ${product.stock} items remaining`
                  : `In Stock: ${product.stock} items available`}
              </span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed border-t border-b border-slate-100 py-4">
              {product.description || 'Fresh quality grocery item source-verified by D-Mart.'}
            </p>
          </div>

          {/* Cart Actions */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            {currentQuantity > 0 ? (
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-3">
                <span className="text-xs font-bold text-slate-600">In Your Cart:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleUpdateQty(-1)}
                    disabled={adding}
                    className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-base font-extrabold text-slate-900 w-6 text-center">
                    {currentQuantity}
                  </span>
                  <button
                    onClick={() => handleUpdateQty(1)}
                    disabled={adding || currentQuantity >= product.stock}
                    className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || adding}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-dmart-600 hover:bg-dmart-700 text-white hover:shadow-xl'
                }`}
              >
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2 text-xs font-bold text-slate-500">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-dmart-600" /> Fast Home Delivery
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-dmart-600" /> 7-Day Return Policy
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

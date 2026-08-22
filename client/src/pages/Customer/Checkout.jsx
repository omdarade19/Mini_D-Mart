import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, Store, Calendar, MapPin, CheckCircle, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { orderService } from '../../services/api';
import Toast from '../../components/Toast';

const Checkout = () => {
  const { cart, subtotal, itemCount, clearCartState } = useCart();
  const navigate = useNavigate();

  const [deliveryType, setDeliveryType] = useState('home_delivery');
  const [address, setAddress] = useState('');
  
  // Default pickup date to tomorrow YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];
  
  const [pickupDate, setPickupDate] = useState(defaultDateStr);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const items = cart.items || [];

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Your cart is empty</h2>
        <p className="text-xs text-slate-500">Please add items to your cart before proceeding to checkout.</p>
        <Link
          to="/products"
          className="inline-block px-5 py-2.5 bg-dmart-600 text-white font-bold text-xs rounded-xl shadow"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (deliveryType === 'home_delivery' && !address.trim()) {
      setToast({ message: 'Please enter a valid home delivery address', type: 'error' });
      return;
    }

    if (deliveryType === 'store_pickup' && !pickupDate) {
      setToast({ message: 'Please select a scheduled pickup date', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await orderService.create({
        deliveryType,
        address: deliveryType === 'home_delivery' ? address : '',
        pickupDate: deliveryType === 'store_pickup' ? pickupDate : null
      });

      clearCartState();
      setToast({ message: 'Order placed successfully!', type: 'success' });
      
      setTimeout(() => {
        navigate(`/orders/${res.order._id}`);
      }, 1000);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Checkout & Fulfillment</h1>
          <p className="text-xs text-slate-500 mt-1">Select fulfillment option & confirm order details</p>
        </div>
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-dmart-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Fulfillment Options & Details Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Delivery Type Selector */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              1. Choose Fulfillment Method
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setDeliveryType('home_delivery')}
                className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition-all ${
                  deliveryType === 'home_delivery'
                    ? 'border-dmart-600 bg-dmart-50/50 text-dmart-900 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${deliveryType === 'home_delivery' ? 'bg-dmart-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Truck className="w-5 h-5" />
                  </div>
                  {deliveryType === 'home_delivery' && <CheckCircle className="w-5 h-5 text-dmart-600" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm">Home Delivery</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Doorstep delivery within 24 hours</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('store_pickup')}
                className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition-all ${
                  deliveryType === 'store_pickup'
                    ? 'border-dmart-600 bg-dmart-50/50 text-dmart-900 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${deliveryType === 'store_pickup' ? 'bg-dmart-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Store className="w-5 h-5" />
                  </div>
                  {deliveryType === 'store_pickup' && <CheckCircle className="w-5 h-5 text-dmart-600" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm">Store Pickup</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Scheduled pickup (Max 10/day limit)</p>
                </div>
              </button>
            </div>
          </div>

          {/* Fulfillment Specific Fields */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900">
              2. {deliveryType === 'home_delivery' ? 'Delivery Address' : 'Scheduled Pickup Date'}
            </h3>

            {deliveryType === 'home_delivery' ? (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Full Street Address & Landmark
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder="Enter complete shipping address (e.g. Flat 402, Sunshine Heights, Main Street, Metro City)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dmart-500 focus:bg-white"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Pickup Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-dmart-500"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 font-medium">
                  <strong>Notice:</strong> D-Mart limits store pickup slots to 10 orders per day to guarantee instant zero-wait collection.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary & Confirm Action */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md space-y-6">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-4">
              Items Overview
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.productId?._id || item.productId} className="flex justify-between items-center text-xs">
                  <div className="truncate pr-2">
                    <p className="font-bold text-slate-800 truncate">{item.productId?.name}</p>
                    <p className="text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-black text-slate-900">
                    ₹{((item.productId?.price || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-bold text-slate-800">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Shipping Fee</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-black text-slate-900">
                <span>Total Payable</span>
                <span className="text-dmart-600 text-xl">₹{subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="w-full py-4 bg-dmart-600 hover:bg-dmart-700 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" /> {submitting ? 'Validating Stock & Placing Order...' : 'Confirm & Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

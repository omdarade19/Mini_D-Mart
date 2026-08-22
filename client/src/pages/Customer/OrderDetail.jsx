import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { orderService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await orderService.getById(id);
        setOrder(res.order);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading order receipt..." />;
  if (error) return <ErrorState message={error} />;
  if (!order) return <ErrorState message="Order not found" />;

  const deliverySteps = ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const pickupSteps = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP'];

  const steps = order.deliveryType === 'home_delivery' ? deliverySteps : pickupSteps;
  const currentStepIndex = steps.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-dmart-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </Link>
        <StatusBadge status={order.status} />
      </div>

      {/* Main Order Receipt */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        {/* Receipt Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-dmart-400 uppercase tracking-widest">Official Receipt</span>
            <h1 className="text-2xl font-black mt-1">Order #{order._id.toUpperCase()}</h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Total Amount</div>
            <div className="text-2xl font-black text-amber-400">₹{order.total.toFixed(2)}</div>
          </div>
        </div>

        {/* Lifecycle Status Progress Tracker */}
        {order.status !== 'CANCELLED' && (
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-4">
              Order Lifecycle Tracker
            </h4>
            <div className="flex items-center justify-between relative">
              {/* Line background */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0"></div>
              
              {steps.map((step, idx) => {
                const isCompleted = currentStepIndex >= idx;
                return (
                  <div key={step} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isCompleted
                          ? 'bg-dmart-600 text-white ring-4 ring-dmart-100 shadow'
                          : 'bg-white text-slate-400 border-2 border-slate-200'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 mt-2 text-center max-w-[70px]">
                      {step.replace(/_/g, ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Fulfillment details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Fulfillment Mode
              </span>
              <span className="font-extrabold text-slate-800 capitalize">
                {order.deliveryType.replace('_', ' ')}
              </span>
            </div>

            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                {order.deliveryType === 'home_delivery' ? 'Delivery Address' : 'Pickup Date'}
              </span>
              <span className="font-extrabold text-slate-800">
                {order.deliveryType === 'home_delivery'
                  ? order.address || 'Address provided'
                  : order.pickupDate}
              </span>
            </div>
          </div>

          {/* Itemized List */}
          <div>
            <h4 className="text-sm font-black text-slate-900 mb-3">Itemized Purchased Goods</h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-slate-800">{item.name}</h5>
                    <p className="text-slate-400">Unit Price: ₹{item.price.toFixed(2)} × {item.quantity}</p>
                  </div>
                  <span className="font-black text-slate-900">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-600 max-w-xs ml-auto">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-slate-800">₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Fulfillment Fee</span>
              <span className="font-bold text-emerald-600">FREE</span>
            </div>
            <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-black text-slate-900">
              <span>Total Paid</span>
              <span className="text-dmart-600">₹{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

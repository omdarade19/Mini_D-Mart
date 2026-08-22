import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye, XCircle, RefreshCw, Calendar, Truck, Store } from 'lucide-react';
import { orderService, returnService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Return modal state
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [returnType, setReturnType] = useState('return');
  const [reason, setReason] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getAll();
      setOrders(res.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) return;
    try {
      await orderService.cancel(orderId);
      setToast({ message: 'Order cancelled successfully', type: 'success' });
      fetchOrders();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const openReturnModal = (order) => {
    setSelectedOrder(order);
    if (order.items && order.items.length > 0) {
      setSelectedProductId(order.items[0].productId);
    }
    setReturnType('return');
    setReason('');
    setReturnModalOpen(true);
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !selectedProductId || !reason.trim()) {
      setToast({ message: 'Please select a product and provide a reason', type: 'error' });
      return;
    }

    try {
      setSubmittingReturn(true);
      await returnService.create({
        orderId: selectedOrder._id,
        productId: selectedProductId,
        type: returnType,
        reason: reason.trim()
      });
      setToast({ message: 'Return/Exchange request submitted successfully!', type: 'success' });
      setReturnModalOpen(false);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (loading) return <LoadingSpinner label="Fetching your order history..." />;
  if (error) return <ErrorState message={error} onRetry={fetchOrders} />;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Your Orders</h1>
          <p className="text-xs text-slate-500 mt-1">Track status, cancel eligible orders, or request returns</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No Orders Found"
          description="You haven't placed any orders yet."
          action={
            <Link to="/products" className="px-5 py-2.5 bg-dmart-600 text-white font-bold text-xs rounded-xl shadow">
              Start Shopping Now
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const canCancel = ['PLACED', 'CONFIRMED'].includes(order.status);
            const isDelivered = ['DELIVERED', 'PICKED_UP'].includes(order.status);
            const orderDate = new Date(order.createdAt);
            const formattedDate = orderDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                {/* Top Info Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-dmart-50 text-dmart-600 rounded-2xl">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">
                          Order #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Placed on {formattedDate}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">Total Paid</div>
                    <div className="text-lg font-black text-slate-900">₹{order.total.toFixed(2)}</div>
                  </div>
                </div>

                {/* Items preview */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-xl">
                        {item.name} × {item.quantity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Delivery details */}
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl">
                  {order.deliveryType === 'home_delivery' ? (
                    <>
                      <Truck className="w-4 h-4 text-dmart-600" />
                      <span>Delivery Address: {order.address || 'Address provided'}</span>
                    </>
                  ) : (
                    <>
                      <Store className="w-4 h-4 text-dmart-600" />
                      <span>Store Pickup Date: {order.pickupDate}</span>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <Link
                    to={`/orders/${order._id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-dmart-600 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors"
                  >
                    <Eye className="w-4 h-4" /> View Full Details
                  </Link>

                  <div className="flex items-center gap-2">
                    {canCancel && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-2 rounded-xl transition-colors"
                      >
                        <XCircle className="w-4 h-4" /> Cancel Order
                      </button>
                    )}

                    {isDelivered && (
                      <button
                        onClick={() => openReturnModal(order)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3.5 py-2 rounded-xl transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" /> Return / Exchange
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Return/Exchange Modal */}
      <Modal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title="Request Return or Exchange"
      >
        <form onSubmit={handleReturnSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Item from Order
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-dmart-500"
            >
              {selectedOrder?.items.map((item) => (
                <option key={item.productId} value={item.productId}>
                  {item.name} (Qty: {item.quantity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Request Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setReturnType('return')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  returnType === 'return'
                    ? 'border-dmart-600 bg-dmart-50 text-dmart-700'
                    : 'border-slate-200 text-slate-600 bg-white'
                }`}
              >
                Return for Refund
              </button>
              <button
                type="button"
                onClick={() => setReturnType('exchange')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  returnType === 'exchange'
                    ? 'border-dmart-600 bg-dmart-50 text-dmart-700'
                    : 'border-slate-200 text-slate-600 bg-white'
                }`}
              >
                Exchange Item
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Reason for Return / Exchange
            </label>
            <textarea
              rows={3}
              placeholder="Please explain why you want to return or exchange this product..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dmart-500"
            />
          </div>

          <button
            type="submit"
            disabled={submittingReturn}
            className="w-full py-3 bg-dmart-600 hover:bg-dmart-700 text-white font-extrabold text-xs rounded-xl shadow transition-colors"
          >
            {submittingReturn ? 'Submitting Request...' : 'Submit Request'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Orders;

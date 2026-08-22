import React, { useState, useEffect } from 'react';
import { Package, Truck, Store, Filter, RefreshCw } from 'lucide-react';
import { orderService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import Toast from '../../components/Toast';

const StaffOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.deliveryType = filterType;

      const res = await orderService.getAll(params);
      setOrders(res.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus, filterType]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await orderService.updateStatus(orderId, newStatus);
      setToast({ message: `Order status updated to ${newStatus}`, type: 'success' });
      fetchOrders();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  const getNextAvailableStatuses = (order) => {
    const isDelivery = order.deliveryType === 'home_delivery';
    const statusMap = {
      PLACED: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PREPARING', 'CANCELLED'],
      PREPARING: isDelivery ? ['OUT_FOR_DELIVERY'] : ['READY_FOR_PICKUP'],
      OUT_FOR_DELIVERY: ['DELIVERED'],
      READY_FOR_PICKUP: ['PICKED_UP'],
      DELIVERED: [],
      PICKED_UP: [],
      CANCELLED: []
    };
    return statusMap[order.status] || [];
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Order Operations & Queue</h1>
          <p className="text-xs text-slate-500 mt-1">Advance order fulfillment status through the operational pipeline</p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-xl hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Queue
        </button>
      </div>

      {/* Filter Options */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Filter className="w-4 h-4" /> Filter By:
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="PLACED">PLACED</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="PREPARING">PREPARING</option>
          <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
          <option value="READY_FOR_PICKUP">READY FOR PICKUP</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="PICKED_UP">PICKED UP</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Fulfillment Modes</option>
          <option value="home_delivery">Home Delivery</option>
          <option value="store_pickup">Store Pickup</option>
        </select>
      </div>

      {/* Orders List Table / Card View */}
      {loading ? (
        <LoadingSpinner label="Loading operational order queue..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchOrders} />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders in queue" description="There are currently no orders matching your filter criteria." />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const nextStatuses = getNextAvailableStatuses(order);
            const isUpdating = updatingId === order._id;

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl font-bold">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">
                          Order #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Customer: <strong className="text-slate-700">{order.userId?.name || 'Customer'}</strong> ({order.userId?.email})
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400">Total Value</span>
                    <div className="text-lg font-black text-slate-900">₹{order.total.toFixed(2)}</div>
                  </div>
                </div>

                {/* Details & Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded-2xl space-y-1">
                    <span className="font-bold text-slate-500 uppercase tracking-wider block">Fulfillment Details</span>
                    <div className="flex items-center gap-1.5 font-extrabold text-slate-800">
                      {order.deliveryType === 'home_delivery' ? (
                        <>
                          <Truck className="w-4 h-4 text-blue-600" /> Home Delivery: {order.address || 'Address provided'}
                        </>
                      ) : (
                        <>
                          <Store className="w-4 h-4 text-cyan-600" /> Store Pickup Date: {order.pickupDate}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl space-y-1">
                    <span className="font-bold text-slate-500 uppercase tracking-wider block">Items Summary</span>
                    <p className="font-medium text-slate-700">
                      {order.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                    </p>
                  </div>
                </div>

                {/* Status transition buttons */}
                {nextStatuses.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
                      Advance Status:
                    </span>
                    {nextStatuses.map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(order._id, st)}
                        disabled={isUpdating}
                        className={`px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-sm transition-all ${
                          st === 'CANCELLED'
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isUpdating ? 'Updating...' : `Mark as ${st.replace(/_/g, ' ')}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StaffOrders;

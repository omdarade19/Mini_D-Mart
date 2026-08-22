import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Store, RefreshCw, Layers, CheckCircle2, Clock } from 'lucide-react';
import { orderService, returnService, productService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const StaffDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    placedOrders: 0,
    pickupOrders: 0,
    pendingReturns: 0,
    lowStockCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffStats = async () => {
      try {
        setLoading(true);
        const [ordersRes, returnsRes, productsRes] = await Promise.all([
          orderService.getAll(),
          returnService.getAll(),
          productService.getAll()
        ]);

        const orders = ordersRes.orders || [];
        const returns = returnsRes.returnRequests || [];
        const products = productsRes.products || [];

        setStats({
          totalOrders: orders.length,
          placedOrders: orders.filter((o) => ['PLACED', 'CONFIRMED', 'PREPARING'].includes(o.status)).length,
          pickupOrders: orders.filter((o) => o.deliveryType === 'store_pickup' && o.status !== 'CANCELLED').length,
          pendingReturns: returns.filter((r) => r.status === 'pending').length,
          lowStockCount: products.filter((p) => p.stock <= 5).length
        });
      } catch (err) {
        console.error('Failed to load staff metrics:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStaffStats();
  }, []);

  if (loading) return <LoadingSpinner label="Compiling store operation metrics..." />;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Staff Operations Hub</span>
        <h1 className="text-2xl sm:text-3xl font-black mt-1">Store Processing Dashboard</h1>
        <p className="text-xs text-blue-100 mt-1">Manage order fulfillment, pickup queues, return approvals, and inventory</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.placedOrders}</div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Orders Needing Action</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center font-bold">
            <Store className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.pickupOrders}</div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Store Pickups</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center font-bold">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.pendingReturns}</div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Returns</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.lowStockCount}</div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock Alerts</p>
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/staff/orders"
          className="group bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-black text-lg text-slate-900">Manage & Fulfill Orders</h3>
            <p className="text-xs text-slate-500">Update order status through lifecycle stages (Preparing, Ready for Pickup, Delivered).</p>
          </div>
          <span className="text-xs font-bold text-blue-700 mt-4 inline-block group-hover:underline">Open Orders Panel →</span>
        </Link>

        <Link
          to="/staff/returns"
          className="group bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="font-black text-lg text-slate-900">Process Return Requests</h3>
            <p className="text-xs text-slate-500">Approve or reject customer return and exchange requests. Verify replacement inventory.</p>
          </div>
          <span className="text-xs font-bold text-amber-700 mt-4 inline-block group-hover:underline">Open Returns Panel →</span>
        </Link>

        <Link
          to="/staff/inventory"
          className="group bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-black text-lg text-slate-900">Live Inventory Audit</h3>
            <p className="text-xs text-slate-500">Monitor product stock levels, categories, and inventory health in real-time.</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 mt-4 inline-block group-hover:underline">Open Inventory Audit →</span>
        </Link>
      </div>
    </div>
  );
};

export default StaffDashboard;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Layers,
  Users,
  ShieldAlert,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart2,
  Truck,
  Store,
  ArrowUpRight,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { productService, categoryService, userService, orderService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    products: [],
    categories: [],
    users: [],
    orders: []
  });

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, userRes, orderRes] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        userService.getAll(),
        orderService.getAll()
      ]);

      setData({
        products: prodRes.products || [],
        categories: catRes.categories || [],
        users: userRes.users || [],
        orders: orderRes.orders || []
      });
    } catch (err) {
      console.error('Failed to load admin analytical data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) return <LoadingSpinner label="Compiling business intelligence & visual analytics..." />;

  const { products, categories, users, orders } = data;

  // --- Analytical Calculations ---

  // 1. Revenue & Order Financials
  const validOrders = orders.filter((o) => o.status !== 'CANCELLED');
  const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrdersCount = orders.length;
  const avgOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;
  const customerCount = users.filter((u) => u.role === 'customer').length;

  // 2. Order Status Breakdown (for Donut Chart)
  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const statusColors = {
    DELIVERED: '#10b981', // emerald
    PICKED_UP: '#059669', // dark emerald
    OUT_FOR_DELIVERY: '#8b5cf6', // purple
    READY_FOR_PICKUP: '#06b6d4', // cyan
    PREPARING: '#f59e0b', // amber
    CONFIRMED: '#6366f1', // indigo
    PLACED: '#3b82f6', // blue
    CANCELLED: '#ef4444' // rose
  };

  const statusEntries = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    percentage: totalOrdersCount > 0 ? Math.round((count / totalOrdersCount) * 100) : 0,
    color: statusColors[status] || '#94a3b8'
  }));

  // Donut chart calculations
  let accumulatedAngle = 0;
  const donutSlices = statusEntries.map((item) => {
    const strokeDasharray = `${item.percentage} ${100 - item.percentage}`;
    const strokeDashoffset = 100 - accumulatedAngle;
    accumulatedAngle += item.percentage;
    return { ...item, strokeDasharray, strokeDashoffset };
  });

  // 3. Category Wise Product Distribution & Stock Value
  const categoryAnalytics = categories.map((cat) => {
    const catProducts = products.filter(
      (p) => (p.categoryId?._id || p.categoryId) === cat._id
    );
    const stockCount = catProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
    const totalValue = catProducts.reduce((sum, p) => sum + (p.price || 0) * (p.stock || 0), 0);
    return {
      id: cat._id,
      name: cat.name,
      productCount: catProducts.length,
      stockCount,
      totalValue
    };
  });

  const maxCatValue = Math.max(...categoryAnalytics.map((c) => c.totalValue), 1);

  // 4. Fulfillment Type Analytics (Home Delivery vs Store Pickup)
  const homeDeliveryCount = orders.filter((o) => o.deliveryType === 'home_delivery').length;
  const storePickupCount = orders.filter((o) => o.deliveryType === 'store_pickup').length;
  const homeDeliveryPercent = totalOrdersCount > 0 ? Math.round((homeDeliveryCount / totalOrdersCount) * 100) : 50;
  const storePickupPercent = 100 - homeDeliveryPercent;

  // 5. Daily Revenue Breakdown (last 7 days simulation/grouping for Bar Chart)
  const revenueByDate = {};
  orders.forEach((o) => {
    const dateStr = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (o.status !== 'CANCELLED') {
      revenueByDate[dateStr] = (revenueByDate[dateStr] || 0) + o.total;
    }
  });

  const chartDates = Object.keys(revenueByDate).slice(-7);
  const chartValues = chartDates.map((d) => revenueByDate[d]);
  const maxRevenueInChart = Math.max(...chartValues, 100);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 px-3 py-1 rounded-full text-xs font-bold text-purple-200 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-purple-300" /> Real-time Analytics & Business Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Admin Analytical Dashboard</h1>
          <p className="text-xs text-purple-200 mt-1">Graphical revenue trends, fulfillment metrics, and category breakdown</p>
        </div>

        <button
          onClick={fetchAdminData}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Analytics
        </button>
      </div>

      {/* Financial Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">₹{totalRevenue.toFixed(2)}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Gross sales across all orders
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{totalOrdersCount}</div>
            <p className="text-[11px] font-bold text-slate-500 mt-1">
              {validOrders.length} Completed / Active
            </p>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Order Value</span>
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">₹{avgOrderValue.toFixed(2)}</div>
            <p className="text-[11px] font-bold text-slate-500 mt-1">Per transaction average</p>
          </div>
        </div>

        {/* Customer Base */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Customers</span>
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{customerCount}</div>
            <p className="text-[11px] font-bold text-slate-500 mt-1">Registered customer profiles</p>
          </div>
        </div>
      </div>

      {/* Graphical Section Row 1: Revenue Bar Chart & Order Status Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Trend Bar Chart (2 columns wide) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-purple-600" /> Revenue & Sales Trend
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Daily revenue generation breakdown in Rupees (₹)</p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
              Last 7 Active Days
            </span>
          </div>

          {chartDates.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs font-bold text-slate-400">
              No revenue trend data recorded yet.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-64 flex items-end justify-between gap-4 pt-8 px-2 border-b border-slate-200 relative">
                {/* Background grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 text-[10px] text-slate-400">
                  <div className="border-b border-slate-300 w-full pt-1">₹{maxRevenueInChart.toFixed(0)}</div>
                  <div className="border-b border-slate-300 w-full">₹{(maxRevenueInChart / 2).toFixed(0)}</div>
                  <div className="border-b border-slate-300 w-full">₹0</div>
                </div>

                {chartDates.map((dateStr, idx) => {
                  const val = chartValues[idx] || 0;
                  const heightPercent = Math.max(Math.round((val / maxRevenueInChart) * 100), 8);

                  return (
                    <div key={dateStr} className="flex-1 flex flex-col items-center gap-2 group relative z-10">
                      {/* Floating tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow pointer-events-none whitespace-nowrap">
                        ₹{val.toFixed(2)}
                      </div>

                      {/* Bar fill */}
                      <div className="w-full max-w-[40px] bg-slate-100 rounded-t-xl overflow-hidden flex items-end h-full">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-gradient-to-t from-purple-700 to-indigo-500 rounded-t-xl group-hover:from-purple-600 group-hover:to-indigo-400 transition-all duration-500"
                        ></div>
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 truncate">{dateStr}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Order Status Donut Chart (1 column wide) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-600" /> Status Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Order pipeline lifecycle breakdown</p>
          </div>

          {/* SVG Donut Graphical Render */}
          <div className="flex flex-col items-center justify-center relative py-2">
            <svg viewBox="0 0 36 36" className="w-44 h-44 transform -rotate-90">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="4"
              />
              {donutSlices.map((slice, i) => (
                <circle
                  key={i}
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  stroke={slice.color}
                  strokeWidth="4.2"
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  className="transition-all duration-700 hover:opacity-80"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900">{totalOrdersCount}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Orders</span>
            </div>
          </div>

          {/* Status Segment Legends */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            {statusEntries.map((item) => (
              <div key={item.status} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="font-bold text-slate-700 truncate text-[11px]">
                  {item.status.replace(/_/g, ' ')} ({item.count})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Graphical Section Row 2: Category Valuation Bar Breakdown & Fulfillment Type Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Category Stock Valuation Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" /> Category Inventory & Valuation Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Total stock count and monetary valuation per category</p>
          </div>

          <div className="space-y-4">
            {categoryAnalytics.map((cat) => {
              const valPercent = Math.round((cat.totalValue / maxCatValue) * 100);
              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800">{cat.name} ({cat.productCount} Products)</span>
                    <span className="text-slate-900 font-black">
                      ₹{cat.totalValue.toFixed(2)} <span className="text-slate-400 font-normal">({cat.stockCount} in stock)</span>
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.max(valPercent, 5)}%` }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fulfillment Type Split (Home Delivery vs Store Pickup) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" /> Fulfillment Channel Ratio
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Home Delivery vs Scheduled Store Pickup</p>
          </div>

          <div className="space-y-6 my-auto">
            {/* Home Delivery Card */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-blue-900">
                  <Truck className="w-4 h-4 text-blue-600" /> Home Delivery
                </div>
                <span className="text-sm font-black text-blue-900">{homeDeliveryPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-blue-200 rounded-full overflow-hidden">
                <div
                  style={{ width: `${homeDeliveryPercent}%` }}
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                ></div>
              </div>
              <p className="text-[10px] font-bold text-blue-700">{homeDeliveryCount} Total Doorstep Orders</p>
            </div>

            {/* Store Pickup Card */}
            <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-cyan-900">
                  <Store className="w-4 h-4 text-cyan-600" /> Store Pickup
                </div>
                <span className="text-sm font-black text-cyan-900">{storePickupPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-cyan-200 rounded-full overflow-hidden">
                <div
                  style={{ width: `${storePickupPercent}%` }}
                  className="h-full bg-cyan-600 rounded-full transition-all duration-500"
                ></div>
              </div>
              <p className="text-[10px] font-bold text-cyan-700">{storePickupCount} Scheduled Store Pickups</p>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-400 font-medium">
            Daily Capacity Limit: 10 Pickups/Day
          </div>
        </div>
      </div>

      {/* Admin Action Hub Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200">
        <Link
          to="/admin/products"
          className="group bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-black text-lg text-slate-900">Product Catalog CRUD</h3>
            <p className="text-xs text-slate-500">Create, edit prices/stock, update images, or remove items from catalog.</p>
          </div>
          <span className="text-xs font-bold text-purple-700 mt-4 inline-block group-hover:underline">Manage Products →</span>
        </Link>

        <Link
          to="/admin/categories"
          className="group bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-black text-lg text-slate-900">Category CRUD</h3>
            <p className="text-xs text-slate-500">Add, rename, or delete grocery product categories.</p>
          </div>
          <span className="text-xs font-bold text-blue-700 mt-4 inline-block group-hover:underline">Manage Categories →</span>
        </Link>

        <Link
          to="/admin/users"
          className="group bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-black text-lg text-slate-900">User Role Management</h3>
            <p className="text-xs text-slate-500">Promote or demote user roles between Customer, Staff, and Admin.</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 mt-4 inline-block group-hover:underline">Manage Users & Roles →</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;

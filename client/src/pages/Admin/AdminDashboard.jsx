import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Layers, Users, ShieldAlert, ShoppingBag } from 'lucide-react';
import { productService, categoryService, userService, orderService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    productsCount: 0,
    categoriesCount: 0,
    usersCount: 0,
    ordersCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes, userRes, orderRes] = await Promise.all([
          productService.getAll(),
          categoryService.getAll(),
          userService.getAll(),
          orderService.getAll()
        ]);

        setStats({
          productsCount: prodRes.products?.length || 0,
          categoriesCount: catRes.categories?.length || 0,
          usersCount: userRes.users?.length || 0,
          ordersCount: orderRes.orders?.length || 0
        });
      } catch (err) {
        console.error('Failed to load admin stats:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) return <LoadingSpinner label="Loading admin system overview..." />;

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <span className="text-xs font-bold uppercase tracking-widest text-purple-200">System Administration</span>
        <h1 className="text-2xl sm:text-3xl font-black mt-1">Admin Management Portal</h1>
        <p className="text-xs text-purple-200 mt-1">Manage catalog CRUD, category hierarchies, and user security permissions</p>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 bg-purple-50 text-purple-700 rounded-2xl flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.productsCount}</div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Products</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.categoriesCount}</div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categories</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.usersCount}</div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Users</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.ordersCount}</div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Orders</p>
        </div>
      </div>

      {/* Admin Action Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

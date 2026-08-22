import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Search, ShieldAlert, Store, Package, RefreshCw, Users, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-10 h-10 bg-dmart-600 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              D
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                Mini <span className="text-dmart-600">D-Mart</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Grocery Store</span>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search fresh groceries, dairy, snacks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dmart-500 focus:bg-white transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </form>

          {/* Navigation Links */}
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/products"
              className="text-sm font-semibold text-slate-600 hover:text-dmart-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Browse
            </Link>

            {/* Role Specific Quick Links */}
            {isAuthenticated && user?.role === 'staff' && (
              <Link
                to="/staff"
                className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Store className="w-4 h-4" /> Staff Hub
              </Link>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <ShieldAlert className="w-4 h-4" /> Admin Portal
              </Link>
            )}

            {/* Cart Icon Badge (Customer only or guest) */}
            {(!isAuthenticated || user?.role === 'customer') && (
              <Link
                to="/cart"
                className="relative p-2 text-slate-700 hover:text-dmart-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-dmart-600 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Profile / Auth Action */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-dmart-100 text-dmart-700 font-bold flex items-center justify-center text-sm">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 line-clamp-1">{user.name}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
                    </div>

                    {user.role === 'customer' && (
                      <>
                        <Link
                          to="/orders"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Package className="w-4 h-4 text-slate-400" /> My Orders
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <User className="w-4 h-4 text-slate-400" /> Profile
                        </Link>
                      </>
                    )}

                    {user.role === 'staff' && (
                      <>
                        <Link
                          to="/staff"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Store className="w-4 h-4 text-slate-400" /> Dashboard
                        </Link>
                        <Link
                          to="/staff/orders"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Package className="w-4 h-4 text-slate-400" /> Process Orders
                        </Link>
                        <Link
                          to="/staff/returns"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <RefreshCw className="w-4 h-4 text-slate-400" /> Process Returns
                        </Link>
                        <Link
                          to="/staff/inventory"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Layers className="w-4 h-4 text-slate-400" /> Live Inventory
                        </Link>
                      </>
                    )}

                    {user.role === 'admin' && (
                      <>
                        <Link
                          to="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <ShieldAlert className="w-4 h-4 text-slate-400" /> Dashboard
                        </Link>
                        <Link
                          to="/admin/products"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Package className="w-4 h-4 text-slate-400" /> Manage Products
                        </Link>
                        <Link
                          to="/admin/categories"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Layers className="w-4 h-4 text-slate-400" /> Manage Categories
                        </Link>
                        <Link
                          to="/admin/users"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Users className="w-4 h-4 text-slate-400" /> Manage Users
                        </Link>
                      </>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-semibold"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-dmart-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-bold text-white bg-dmart-600 hover:bg-dmart-700 px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

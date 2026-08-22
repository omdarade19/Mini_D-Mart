import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Public/Home';
import Products from './pages/Public/Products';
import ProductDetail from './pages/Public/ProductDetail';
import Login from './pages/Public/Login';
import Register from './pages/Public/Register';

// Customer Pages
import Cart from './pages/Customer/Cart';
import Checkout from './pages/Customer/Checkout';
import Orders from './pages/Customer/Orders';
import OrderDetail from './pages/Customer/OrderDetail';
import Profile from './pages/Customer/Profile';

// Staff Pages
import StaffDashboard from './pages/Staff/StaffDashboard';
import StaffOrders from './pages/Staff/StaffOrders';
import StaffReturns from './pages/Staff/StaffReturns';
import StaffInventory from './pages/Staff/StaffInventory';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminProducts from './pages/Admin/AdminProducts';
import AdminCategories from './pages/Admin/AdminCategories';
import AdminUsers from './pages/Admin/AdminUsers';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<Cart />} />

                {/* Protected Customer Routes */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}>
                      <OrderDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Staff Routes */}
                <Route
                  path="/staff"
                  element={
                    <ProtectedRoute allowedRoles={['staff', 'admin']}>
                      <StaffDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff/orders"
                  element={
                    <ProtectedRoute allowedRoles={['staff', 'admin']}>
                      <StaffOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff/returns"
                  element={
                    <ProtectedRoute allowedRoles={['staff', 'admin']}>
                      <StaffReturns />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff/inventory"
                  element={
                    <ProtectedRoute allowedRoles={['staff', 'admin']}>
                      <StaffInventory />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminProducts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminCategories />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

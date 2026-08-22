import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Lock, Mail, ShieldAlert, Store, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setToast({ message: 'Please enter both email and password', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const res = await login({ email, password });
      setToast({ message: `Welcome back, ${res.user.name}!`, type: 'success' });
      setTimeout(() => {
        if (res.user.role === 'admin') navigate('/admin');
        else if (res.user.role === 'staff') navigate('/staff');
        else navigate(from);
      }, 500);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fillTestAccount = (testEmail, testPassword) => {
    setEmail(testEmail);
    setPassword(testPassword);
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-dmart-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl mx-auto shadow-lg">
          D
        </div>
        <h1 className="text-2xl font-black text-slate-900">Sign In to Mini D-Mart</h1>
        <p className="text-xs text-slate-500">Access your grocery cart, orders, and account dashboard</p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="customer@dmart.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dmart-500 focus:bg-white"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dmart-500 focus:bg-white"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-dmart-600 hover:bg-dmart-700 text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" /> {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Test Accounts Quick-Fill Panel */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
            Assessment Test Credentials Quick-Fill
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => fillTestAccount('customer@dmart.com', 'Customer@123')}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 flex flex-col items-center gap-1 transition-colors"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" /> Customer
            </button>
            <button
              onClick={() => fillTestAccount('staff@dmart.com', 'Staff@123')}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 flex flex-col items-center gap-1 transition-colors"
            >
              <Store className="w-4 h-4 text-blue-600" /> Staff
            </button>
            <button
              onClick={() => fillTestAccount('admin@dmart.com', 'Admin@123')}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 flex flex-col items-center gap-1 transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-purple-600" /> Admin
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-dmart-600 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ShieldCheck, Sparkles, Store, TrendingUp } from 'lucide-react';
import { productService, categoryService } from '../../services/api';
import ProductCard from '../../components/ProductCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import Toast from '../../components/Toast';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          categoryService.getAll(),
          productService.getAll()
        ]);
        setCategories(catRes.categories || []);
        setFeaturedProducts(prodRes.products ? prodRes.products.slice(0, 8) : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const triggerToast = (msg, type = 'info') => setToast({ message: msg, type });

  return (
    <div className="space-y-10 pb-12">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-dmart-900 via-dmart-700 to-dmart-600 rounded-3xl text-white shadow-2xl p-8 sm:p-12 lg:p-16">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-dmart-100 border border-white/20">
            <Sparkles className="w-4 h-4 text-amber-300" /> Daily Grocery Wholesale Savings
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Fresh Groceries, <br />
            <span className="text-amber-300">Unbeatable Prices.</span>
          </h1>

          <p className="text-slate-100 text-base sm:text-lg font-medium leading-relaxed">
            Order daily fresh produce, dairy, staples, and snacks. Choose fast home delivery or zero-wait scheduled store pickup.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold px-6 py-3.5 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm"
            >
              <ShoppingBag className="w-5 h-5" /> Shop All Items <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3.5 rounded-2xl border border-white/20 transition-all text-sm"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Category Pills Slider */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-dmart-600" /> Browse Top Categories
          </h2>
          <Link to="/products" className="text-xs font-bold text-dmart-600 hover:underline">
            View All →
          </Link>
        </div>

        {categories.length > 0 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat._id}`}
                className="flex-shrink-0 bg-white border border-slate-200/80 hover:border-dmart-500 hover:bg-dmart-50 px-5 py-3 rounded-2xl shadow-sm hover:shadow text-sm font-bold text-slate-700 hover:text-dmart-700 transition-all flex items-center gap-2"
              >
                <Store className="w-4 h-4 text-dmart-600" />
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Popular Daily Staples</h2>
            <p className="text-xs text-slate-500 mt-1">Fresh stock restocked every morning at 6:00 AM</p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-sm font-bold text-dmart-600 hover:text-dmart-700 bg-dmart-50 px-4 py-2 rounded-xl transition-colors"
          >
            Explore Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner label="Fetching fresh products..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} onToast={triggerToast} />
            ))}
          </div>
        )}
      </section>

      {/* Feature Promise Banner */}
      <section className="bg-slate-100 rounded-3xl p-8 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="space-y-2 p-4">
          <div className="w-12 h-12 bg-dmart-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h4 className="font-extrabold text-slate-900">Guaranteed Freshness</h4>
          <p className="text-xs text-slate-500">Every item is quality checked before packaging.</p>
        </div>
        <div className="space-y-2 p-4">
          <div className="w-12 h-12 bg-dmart-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Store className="w-6 h-6" />
          </div>
          <h4 className="font-extrabold text-slate-900">Store Pickup Option</h4>
          <p className="text-xs text-slate-500">Schedule your store pickup with max 10 slots/day.</p>
        </div>
        <div className="space-y-2 p-4">
          <div className="w-12 h-12 bg-dmart-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h4 className="font-extrabold text-slate-900">Hassle-Free Returns</h4>
          <p className="text-xs text-slate-500">7-day post delivery replacement & refund support.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;

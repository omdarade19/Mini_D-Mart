import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, X } from 'lucide-react';
import { productService, categoryService } from '../../services/api';
import ProductCard from '../../components/ProductCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import Toast from '../../components/Toast';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [sortBy, setSortBy] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setSelectedCategory(categoryParam);
    setSearchQuery(searchParam);
  }, [categoryParam, searchParam]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getAll();
        setCategories(res.categories || []);
      } catch (err) {
        console.error('Failed to load categories:', err.message);
      }
    };
    fetchCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (sortBy) params.sort = sortBy;

      const res = await productService.getAll(params);
      setProducts(res.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      newParams.set('search', searchQuery.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
    loadProducts();
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setSortBy('');
    setSearchParams({});
  };

  const triggerToast = (msg, type = 'info') => setToast({ message: msg, type });

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">All Grocery Items</h1>
          <p className="text-xs text-slate-400 mt-1">Explore our complete catalog of fresh produce & daily supplies</p>
        </div>
        {(selectedCategory || searchQuery || sortBy) && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" /> Reset Filters
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <input
            type="text"
            placeholder="Search items by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dmart-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </form>

        <div className="flex items-center gap-3 overflow-x-auto">
          {/* Category Select */}
          <div className="flex items-center gap-2 min-w-[180px]">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                const newParams = new URLSearchParams(searchParams);
                if (e.target.value) newParams.set('category', e.target.value);
                else newParams.delete('category');
                setSearchParams(newParams);
              }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-dmart-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Select */}
          <div className="flex items-center gap-2 min-w-[160px]">
            <ArrowUpDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-dmart-500"
            >
              <option value="">Sort By: Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product List Content */}
      {loading ? (
        <LoadingSpinner label="Searching inventory..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadProducts} />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try clearing your search query or selecting a different category."
          action={
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-dmart-600 text-white rounded-xl font-bold text-xs hover:bg-dmart-700 transition-colors"
            >
              Clear All Filters
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Showing {products.length} Products
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} onToast={triggerToast} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;

import React, { useState, useEffect } from 'react';
import { Layers, Search, RefreshCw } from 'lucide-react';
import { productService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';

const StaffInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getAll();
      setProducts(res.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Live Inventory Audit</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time stock audit across all product categories</p>
        </div>
        <button
          onClick={fetchProducts}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-xl hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Stock
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Filter product by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Auditing product inventory..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchProducts} />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Current Stock</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-xl bg-slate-100"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500';
                        }}
                      />
                      <span className="font-bold text-slate-800">{product.name}</span>
                    </td>
                    <td className="p-4 text-slate-600 font-bold">
                      {product.categoryId?.name || 'Unassigned'}
                    </td>
                    <td className="p-4 font-black text-slate-900">
                      ₹{product.price.toFixed(2)}
                    </td>
                    <td className="p-4 font-extrabold text-slate-800 text-sm">
                      {product.stock}
                    </td>
                    <td className="p-4">
                      {product.stock <= 0 ? (
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                          Out of Stock
                        </span>
                      ) : product.stock <= 5 ? (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                          Low Stock ({product.stock})
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                          In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffInventory;

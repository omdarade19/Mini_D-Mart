import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { productService, categoryService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    stock: '',
    image: '',
    description: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        productService.getAll(),
        categoryService.getAll()
      ]);
      setProducts(prodRes.products || []);
      setCategories(catRes.categories || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditProduct(null);
    setFormData({
      name: '',
      categoryId: categories[0]?._id || '',
      price: '',
      stock: '',
      image: '',
      description: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditProduct(product);
    setFormData({
      name: product.name,
      categoryId: product.categoryId?._id || product.categoryId,
      price: product.price,
      stock: product.stock,
      image: product.image || '',
      description: product.description || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete '${name}'?`)) return;
    try {
      await productService.delete(id);
      setToast({ message: `Deleted product '${name}'`, type: 'success' });
      fetchData();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId || formData.price === '' || formData.stock === '') {
      setToast({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }

    try {
      setSaving(true);
      if (editProduct) {
        await productService.update(editProduct._id, formData);
        setToast({ message: 'Product updated successfully!', type: 'success' });
      } else {
        await productService.create(formData);
        setToast({ message: 'New product created successfully!', type: 'success' });
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Product Management</h1>
          <p className="text-xs text-slate-500 mt-1">Create, update, and remove grocery items in the catalog</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-dmart-600 hover:bg-dmart-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Search product by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading products table..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded-xl bg-slate-100"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500';
                        }}
                      />
                      <span className="font-bold text-slate-800">{p.name}</span>
                    </td>
                    <td className="p-4 text-slate-600 font-bold">
                      {p.categoryId?.name || 'Unassigned'}
                    </td>
                    <td className="p-4 font-black text-slate-900">₹{p.price.toFixed(2)}</td>
                    <td className="p-4 font-extrabold text-slate-800">{p.stock}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id, p.name)}
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editProduct ? 'Edit Product' : 'Add New Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Product Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Fresh Milk (1L)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="66.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                placeholder="50"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Image URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Product description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-black text-xs rounded-xl shadow transition-colors"
          >
            {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminProducts;

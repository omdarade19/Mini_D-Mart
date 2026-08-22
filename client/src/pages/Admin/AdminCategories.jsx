import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers } from 'lucide-react';
import { categoryService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [catName, setCatName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAll();
      setCategories(res.categories || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditCat(null);
    setCatName('');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditCat(cat);
    setCatName(cat.name);
    setModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category '${name}'?`)) return;
    try {
      await categoryService.delete(id);
      setToast({ message: `Deleted category '${name}'`, type: 'success' });
      fetchCategories();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!catName.trim()) {
      setToast({ message: 'Category name is required', type: 'error' });
      return;
    }

    try {
      setSaving(true);
      if (editCat) {
        await categoryService.update(editCat._id, { name: catName.trim() });
        setToast({ message: 'Category updated successfully!', type: 'success' });
      } else {
        await categoryService.create({ name: catName.trim() });
        setToast({ message: 'Category created successfully!', type: 'success' });
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Category Management</h1>
          <p className="text-xs text-slate-500 mt-1">Organize grocery taxonomy and department categories</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow transition-all"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading categories..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCategories} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-slate-900 text-sm">{cat.name}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat._id, cat.name)}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editCat ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Category Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Organic Produce"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              required
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-black text-xs rounded-xl shadow transition-colors"
          >
            {saving ? 'Saving...' : editCat ? 'Update Category' : 'Create Category'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCategories;

import React, { useState, useEffect } from 'react';
import { Users, Shield, RefreshCw } from 'lucide-react';
import { userService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import Toast from '../../components/Toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getAll();
      setUsers(res.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingId(userId);
      await userService.updateRole(userId, newRole);
      setToast({ message: `Updated user role to '${newRole}'`, type: 'success' });
      fetchUsers();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">User Role Management</h1>
          <p className="text-xs text-slate-500 mt-1">Audit platform accounts and assign role security levels</p>
        </div>
        <button
          onClick={fetchUsers}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-xl hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Users
        </button>
      </div>

      {loading ? (
        <LoadingSpinner label="Fetching user accounts..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchUsers} />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Current Role</th>
                  <th className="p-4 text-right">Assign New Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map((u) => {
                  const isUpdating = updatingId === u._id;

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs">
                          {u.name ? u.name[0].toUpperCase() : 'U'}
                        </div>
                        <span className="font-extrabold text-slate-900">{u.name}</span>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{u.email}</td>
                      <td className="p-4">
                        <StatusBadge status={u.role} />
                      </td>
                      <td className="p-4 text-right">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          disabled={isUpdating}
                          className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="customer">Customer</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

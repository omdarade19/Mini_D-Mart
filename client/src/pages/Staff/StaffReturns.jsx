import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { returnService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import Toast from '../../components/Toast';

const StaffReturns = () => {
  const [returnRequests, setReturnRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const res = await returnService.getAll(params);
      setReturnRequests(res.returnRequests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [filterStatus]);

  const handleProcessRequest = async (id, status) => {
    try {
      setProcessingId(id);
      await returnService.process(id, status);
      setToast({ message: `Return request ${status} successfully!`, type: 'success' });
      fetchReturns();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Return & Exchange Requests</h1>
          <p className="text-xs text-slate-500 mt-1">Review 7-day post-delivery returns and authorize inventory restock or exchange</p>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner label="Fetching return request logs..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchReturns} />
      ) : returnRequests.length === 0 ? (
        <EmptyState title="No return requests" description="There are no return or exchange requests matching your criteria." />
      ) : (
        <div className="space-y-4">
          {returnRequests.map((reqItem) => {
            const isProcessing = processingId === reqItem._id;
            const isPending = reqItem.status === 'pending';

            return (
              <div
                key={reqItem._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm capitalize">
                          Type: {reqItem.type} Request
                        </span>
                        <StatusBadge status={reqItem.status} />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Customer: <strong className="text-slate-700">{reqItem.userId?.name || 'User'}</strong> ({reqItem.userId?.email})
                      </p>
                    </div>
                  </div>

                  <span className="text-xs text-slate-400 font-medium">
                    Requested on {new Date(reqItem.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded-2xl space-y-1">
                    <span className="font-bold text-slate-500 uppercase tracking-wider block">Target Item</span>
                    <p className="font-extrabold text-slate-800">{reqItem.productId?.name || 'Product'}</p>
                    <p className="text-slate-400">Current Stock: {reqItem.productId?.stock ?? 'N/A'}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl space-y-1">
                    <span className="font-bold text-slate-500 uppercase tracking-wider block">Customer Reason</span>
                    <p className="italic text-slate-700">"{reqItem.reason}"</p>
                  </div>
                </div>

                {isPending && (
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleProcessRequest(reqItem._id, 'rejected')}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-extrabold transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Reject Request
                    </button>
                    <button
                      onClick={() => handleProcessRequest(reqItem._id, 'approved')}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve & Adjust Stock
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StaffReturns;

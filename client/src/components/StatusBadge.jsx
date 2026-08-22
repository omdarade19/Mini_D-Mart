import React from 'react';

const StatusBadge = ({ status }) => {
  const styles = {
    // Order statuses
    PLACED: 'bg-blue-50 text-blue-700 border-blue-200',
    CONFIRMED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    PREPARING: 'bg-amber-50 text-amber-700 border-amber-200',
    OUT_FOR_DELIVERY: 'bg-purple-50 text-purple-700 border-purple-200',
    READY_FOR_PICKUP: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PICKED_UP: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',

    // Return statuses
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',

    // User roles
    admin: 'bg-purple-100 text-purple-800 border-purple-300 font-bold',
    staff: 'bg-blue-100 text-blue-800 border-blue-300 font-bold',
    customer: 'bg-slate-100 text-slate-700 border-slate-300'
  };

  const style = styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  const label = status ? status.replace(/_/g, ' ') : 'N/A';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      {label}
    </span>
  );
};

export default StatusBadge;

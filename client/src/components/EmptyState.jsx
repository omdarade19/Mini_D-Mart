import React from 'react';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({ title = 'No items found', description = 'There are no records to display at the moment.', action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm my-4">
      <div className="w-16 h-16 bg-dmart-50 text-dmart-600 rounded-2xl flex items-center justify-center mb-4">
        <PackageOpen className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;

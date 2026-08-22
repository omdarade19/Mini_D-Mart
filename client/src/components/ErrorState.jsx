import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorState = ({ message = 'Failed to load data', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-50 border border-rose-100 rounded-2xl my-4">
      <AlertTriangle className="w-10 h-10 text-rose-500 mb-3" />
      <h4 className="font-bold text-rose-900 mb-1">Error Encountered</h4>
      <p className="text-sm text-rose-700 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;

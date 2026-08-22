import React from 'react';

const LoadingSpinner = ({ label = 'Loading fresh items...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
      <div className="w-12 h-12 border-4 border-dmart-200 border-t-dmart-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
};

export default LoadingSpinner;

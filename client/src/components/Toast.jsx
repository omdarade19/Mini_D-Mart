import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const bgStyles = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-rose-600 text-white',
    info: 'bg-slate-800 text-white',
    warning: 'bg-amber-500 text-white'
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
    info: <Info className="w-5 h-5 flex-shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 flex-shrink-0" />
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl animate-bounce-short transition-all">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${bgStyles[type]}`}>
        {icons[type]}
        <span className="text-sm font-medium pr-2">{message}</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;

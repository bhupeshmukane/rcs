import React, { useEffect } from 'react';

const Toast = ({ message, type = 'error', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const base =
    'fixed top-5 right-5 z-50 max-w-sm w-full px-4 py-3 rounded-md shadow-lg border text-sm';
  const styles =
    type === 'success'
      ? 'bg-green-50 border-green-200 text-green-800'
      : 'bg-red-50 border-red-200 text-red-800';

  return (
    <div className={`${base} ${styles}`} role="alert">
      <div className="flex items-start justify-between gap-3">
        <div className="font-medium">{message}</div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold opacity-70 hover:opacity-100"
          aria-label="Close notification"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Toast;

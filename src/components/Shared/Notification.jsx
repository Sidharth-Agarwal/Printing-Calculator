import React, { useEffect } from 'react';

const Notification = ({ message, status = 'success', duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    
    return () => {
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  // Status configurations
  const configs = {
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      textColor: 'text-green-700',
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      textColor: 'text-red-700',
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-700',
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-700',
    }
  };

  const config = configs[status] || configs.success;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className={`rounded-lg shadow-lg ${config.bgColor} border-l-4 ${config.borderColor} p-4 max-w-md`}>
        <div className="flex justify-between items-center">
          <p className={`${config.textColor} font-medium`}>{message}</p>
          <button 
            onClick={onClose}
            className={`ml-4 ${config.textColor} hover:opacity-75`}
          >
            &times;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
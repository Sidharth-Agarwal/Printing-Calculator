import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

const SuccessNotification = ({ message, isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    let timer;
    if (isVisible) {
      timer = setTimeout(() => {
        onClose();
      }, duration);
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 pointer-events-auto animate-fade-in">
        <div className="flex flex-col items-center text-center">
          <div className="text-green-500 mb-2 animate-success-check">
            <CheckCircle size={70} strokeWidth={2} />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{message}</h3>
          <p className="text-gray-600">Your estimate has been created successfully.</p>
        </div>
      </div>
    </div>
  );
};

export default SuccessNotification;
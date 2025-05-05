import React, { useEffect, useState, useRef } from "react";

const ConfirmationModal = ({ isOpen, onClose, message, title, status = "success" }) => {
  const [timeLeft, setTimeLeft] = useState(100);
  const timerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  
  // Status color mapping
  const statusColors = {
    success: "bg-green-50 border-green-500 text-green-700",
    error: "bg-red-50 border-red-500 text-red-700",
    warning: "bg-yellow-50 border-yellow-500 text-yellow-700",
    info: "bg-blue-50 border-blue-500 text-blue-700"
  };

  const buttonColors = {
    success: "bg-green-500 hover:bg-green-600",
    error: "bg-red-500 hover:bg-red-600",
    warning: "bg-yellow-500 hover:bg-yellow-600",
    info: "bg-blue-500 hover:bg-blue-600"
  };

  const progressColors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500"
  };

  const colorClass = statusColors[status] || statusColors.success;
  const buttonClass = buttonColors[status] || buttonColors.success;
  const progressColor = progressColors[status] || progressColors.success;
  
  // Different durations based on message type
  const getDuration = () => {
    switch (status) {
      case 'error': return 5000; // 5 seconds for errors
      case 'warning': return 4000; // 4 seconds for warnings
      default: return 3000; // 3 seconds for success and info
    }
  };
  
  const duration = getDuration();

  // Auto-close the modal after the specified duration
  useEffect(() => {
    if (!isOpen || isPaused) return;
    
    const startTime = Date.now();
    const interval = 50; // Update progress every 50ms for smooth animation
    
    const updateProgress = () => {
      const elapsedTime = Date.now() - startTime;
      const remaining = 100 - (elapsedTime / duration * 100);
      
      if (remaining <= 0) {
        onClose();
        setTimeLeft(0);
      } else {
        setTimeLeft(remaining);
        timerRef.current = setTimeout(updateProgress, interval);
      }
    };
    
    timerRef.current = setTimeout(updateProgress, interval);
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, onClose, duration, isPaused]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center"
      onClick={onClose} // Close when clicking anywhere in the backdrop
    >
      <div 
        className={`bg-white p-6 rounded-lg shadow-lg max-w-md w-full border-l-4 ${colorClass}`}
        onClick={e => e.stopPropagation()} // Prevent clicks on the modal from closing it
        onMouseEnter={() => setIsPaused(true)} // Pause timer on hover
        onMouseLeave={() => setIsPaused(false)} // Resume timer when not hovering
      >
        <h3 className="text-lg font-medium mb-2">{title || "Confirmation"}</h3>
        <p className="mb-4">{message}</p>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
          <div 
            className={`h-1.5 rounded-full ${progressColor}`} 
            style={{ width: `${timeLeft}%`, transition: 'width 50ms linear' }}
          ></div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 text-white rounded ${buttonClass}`}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
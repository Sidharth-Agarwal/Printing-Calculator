import React from "react";

const ConfirmationModal = ({ isOpen, onClose, message, title, status = "success" }) => {
  if (!isOpen) return null;

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

  const colorClass = statusColors[status] || statusColors.success;
  const buttonClass = buttonColors[status] || buttonColors.success;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className={`bg-white p-6 rounded-lg shadow-lg max-w-md w-full border-l-4 ${colorClass}`}>
        <h3 className="text-lg font-medium mb-2">{title || "Confirmation"}</h3>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 text-white rounded ${buttonClass}`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
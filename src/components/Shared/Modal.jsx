import React, { useEffect, useRef } from "react";

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  const modalRef = useRef(null);

  // Updated size class to make modals wider - added "xl" option for extra wide forms
  const sizeClass = {
    sm: "max-w-md",
    md: "max-w-3xl", 
    lg: "max-w-4xl", 
    xl: "max-w-6xl", // Extra wide option for forms with 4 columns
    full: "max-w-full mx-4"
  }[size] || "max-w-3xl";

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Close modal on escape key press
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscKey);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
      // Restore body scrolling when modal is closed
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm" />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center text-center p-4">
        {/* Modal content */}
        <div 
          ref={modalRef}
          className={`${sizeClass} w-full transform overflow-visible bg-white text-left shadow-xl transition-all rounded-lg`}
        >
          {/* Header - using the dark navy blue color */}
          <div className="bg-gray-900 px-6 py-4 flex justify-between items-center rounded-t-lg">
            <h3 className="text-lg font-medium text-white">{title}</h3>
            <button
              type="button"
              className="text-white hover:text-gray-300 focus:outline-none transition-colors"
              onClick={onClose}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
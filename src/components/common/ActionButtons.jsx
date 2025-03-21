import React from "react";

/**
 * Reusable action buttons component for CRUD operations
 */
const ActionButtons = ({ 
  onEdit,
  onDelete,
  onView,
  showEdit = true,
  showDelete = true,
  showView = false,
  confirmDelete = true,
  item,
  className = ""
}) => {
  const handleDelete = () => {
    if (confirmDelete) {
      if (window.confirm("Are you sure you want to delete this item?")) {
        onDelete(item);
      }
    } else {
      onDelete(item);
    }
  };

  return (
    <div className={`flex space-x-3 ${className}`}>
      {showView && onView && (
        <button
          type="button"
          onClick={() => onView(item)}
          className="text-blue-600 hover:underline text-sm"
        >
          View
        </button>
      )}
      
      {showEdit && onEdit && (
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="text-yellow-600 hover:underline text-sm"
        >
          Edit
        </button>
      )}
      
      {showDelete && onDelete && (
        <button
          type="button"
          onClick={handleDelete}
          className="text-red-600 hover:underline text-sm"
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default ActionButtons;
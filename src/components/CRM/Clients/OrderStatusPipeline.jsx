import React from "react";
import { ORDER_STATUSES, updateOrderStatus } from "../../../services/jobTicketService";

/**
 * Visual pipeline: Design → Production → Dispatched → Completed
 * Can be read-only or interactive.
 */
const OrderStatusPipeline = ({ ticketId, currentStatus, onStatusChange, readOnly = false }) => {
  const currentIndex = ORDER_STATUSES.findIndex(s => s.id === currentStatus);

  const handleClick = async (status, index) => {
    if (readOnly || index === currentIndex) return;
    try {
      await updateOrderStatus(ticketId, status.id);
      onStatusChange?.(status.id);
    } catch (err) { console.error("Error updating order status:", err); }
  };

  return (
    <div className="flex items-center w-full">
      {ORDER_STATUSES.map((status, index) => {
        const isDone    = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isNext    = index === currentIndex + 1;

        return (
          <React.Fragment key={status.id}>
            <div className="flex flex-col items-center flex-1 min-w-0">
              <button
                onClick={() => handleClick(status, index)}
                disabled={readOnly}
                title={readOnly ? status.label : `Set to ${status.label}`}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all text-xs font-bold border-2
                  ${isCurrent ? "border-current scale-110 shadow-md" : ""}
                  ${isDone    ? "opacity-100" : ""}
                  ${!isDone && !isCurrent ? "opacity-40" : ""}
                  ${!readOnly && (isNext || isDone) ? "cursor-pointer hover:opacity-80 hover:scale-105" : "cursor-default"}
                `}
                style={{
                  backgroundColor: isDone || isCurrent ? status.color : "#E5E7EB",
                  borderColor:     isDone || isCurrent ? status.color : "#D1D5DB",
                  color:           isDone || isCurrent ? "white" : "#9CA3AF"
                }}
              >
                {isDone ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : index + 1}
              </button>
              <span className={`mt-1 text-xs text-center truncate w-full px-1 ${isCurrent ? "font-semibold" : "text-gray-500"}`}
                style={{ color: isCurrent ? status.color : undefined }}>
                {status.label}
              </span>
            </div>

            {/* Connector line */}
            {index < ORDER_STATUSES.length - 1 && (
              <div className={`flex-shrink-0 h-0.5 w-6 mx-1 rounded-full ${index < currentIndex ? "bg-green-400" : "bg-gray-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default OrderStatusPipeline;
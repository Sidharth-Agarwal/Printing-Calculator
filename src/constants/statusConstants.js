// src/constants/statusConstants.js

/**
 * Estimate status constants
 * Used to track the lifecycle of an estimate
 */
export const ESTIMATE_STATUS = {
    DRAFT: 'Draft',          // Initial status, still being edited
    SENT: 'Sent',            // Estimate has been sent to client
    APPROVED: 'Approved',    // Client has approved the estimate
    REJECTED: 'Rejected',    // Client has rejected the estimate
    REVISED: 'Revised',      // Estimate has been revised (old version)
    CONVERTED: 'Converted',  // Estimate has been converted to an order
    EXPIRED: 'Expired'       // Estimate has expired (past validity period)
};

/**
 * Status color mapping for UI display
 */
export const STATUS_COLORS = {
    [ESTIMATE_STATUS.DRAFT]: '#9ca3af',      // Gray
    [ESTIMATE_STATUS.SENT]: '#3b82f6',       // Blue
    [ESTIMATE_STATUS.APPROVED]: '#10b981',   // Green
    [ESTIMATE_STATUS.REJECTED]: '#ef4444',   // Red
    [ESTIMATE_STATUS.REVISED]: '#8b5cf6',    // Purple
    [ESTIMATE_STATUS.CONVERTED]: '#f59e0b',  // Amber
    [ESTIMATE_STATUS.EXPIRED]: '#6b7280'     // Gray
};

/**
 * Status transition rules
 * Defines which status transitions are allowed
 */
export const ALLOWED_STATUS_TRANSITIONS = {
    [ESTIMATE_STATUS.DRAFT]: [ESTIMATE_STATUS.SENT, ESTIMATE_STATUS.REVISED],
    [ESTIMATE_STATUS.SENT]: [ESTIMATE_STATUS.APPROVED, ESTIMATE_STATUS.REJECTED, ESTIMATE_STATUS.REVISED, ESTIMATE_STATUS.EXPIRED],
    [ESTIMATE_STATUS.APPROVED]: [ESTIMATE_STATUS.CONVERTED, ESTIMATE_STATUS.REVISED],
    [ESTIMATE_STATUS.REJECTED]: [ESTIMATE_STATUS.REVISED],
    [ESTIMATE_STATUS.REVISED]: [], // Terminal state for old versions
    [ESTIMATE_STATUS.CONVERTED]: [], // Terminal state
    [ESTIMATE_STATUS.EXPIRED]: [ESTIMATE_STATUS.REVISED] // Can create new version from expired
};

/**
 * Estimate validity period in days
 */
export const ESTIMATE_VALIDITY_DAYS = 30;
export class User {
    constructor(data = {}) {
        this.id = data.id || '';
        this.email = data.email || '';
        this.displayName = data.displayName || '';
        this.role = data.role || '';
        this.permissions = {
            canCreateEstimates: data.permissions?.canCreateEstimates || false,
            canApproveEstimates: data.permissions?.canApproveEstimates || false,
            canCreateOrders: data.permissions?.canCreateOrders || false,
            canAssignJobs: data.permissions?.canAssignJobs || false,
            canAccessReports: data.permissions?.canAccessReports || false,
            canManageUsers: data.permissions?.canManageUsers || false,
            canManageInventory: data.permissions?.canManageInventory || false
        };
        this.department = data.department || '';
        this.profileImage = data.profileImage || '';
        this.phone = data.phone || '';
        this.notifications = {
            email: data.notifications?.email || false,
            inApp: data.notifications?.inApp || false
        };
        this.lastActive = data.lastActive || new Date();
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }
}
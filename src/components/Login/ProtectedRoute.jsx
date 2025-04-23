import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { ROUTE_ACCESS } from "./routesConfig"; // Import route configuration

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userRole, loading } = useAuth();
  const location = useLocation();
  
  // Check if we're in the middle of user creation
  const userCreationInProgress = localStorage.getItem('userCreationInProgress') === 'true';

  // If still loading auth state, show a loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not logged in and not in user creation process, redirect to login
  if (!currentUser && !userCreationInProgress) {
    return <Navigate to="/" replace />;
  }

  // Get allowed roles for the current route
  const allowedRoles = ROUTE_ACCESS[location.pathname] || [];

  // Determine if access is allowed
  const isAccessAllowed = (
    userCreationInProgress || 
    userRole === 'admin' || // Admin has universal access
    (requiredRole && userRole === requiredRole) || // Specific role check
    allowedRoles.includes(userRole) // Check against route-specific roles
  );

  // If access is not allowed, redirect to unauthorized
  if (!isAccessAllowed) {
    console.log(`Access denied: User role ${userRole} for route ${location.pathname}`);
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and has the required role (or no role is required), render the children
  return children;
};

export default ProtectedRoute;
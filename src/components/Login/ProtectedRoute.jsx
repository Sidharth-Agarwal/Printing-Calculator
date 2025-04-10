import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

// This component wraps protected routes and redirects to login if not authenticated
const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userRole, loading } = useAuth();

  // If still loading auth state, show a loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // If role is required but user doesn't have it (and is not admin), redirect to unauthorized
  if (requiredRole && userRole !== requiredRole && userRole !== "admin") {
    console.log(`Access denied: User role ${userRole} doesn't match required role ${requiredRole}`);
    return <Navigate to="/unauthorized" replace />;
  }

  // Special debug for admin users - they should have access to everything
  if (userRole === "admin" && requiredRole) {
    console.log(`Admin user accessing ${requiredRole} restricted route - should be allowed`);
  }

  // If authenticated and has the required role (or no role is required or is admin), render the children
  return children;
};

export default ProtectedRoute;
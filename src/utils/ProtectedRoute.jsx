import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth(); // Access the current user from context

  // If no user is logged in, redirect to the login page
  if (!currentUser) {
    return <Navigate to="/" />;
  }

  // If the user is logged in, render the child components
  return children;
};

export default ProtectedRoute;

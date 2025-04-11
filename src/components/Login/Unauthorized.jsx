import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

const Unauthorized = () => {
  const { userRole } = useAuth();

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded shadow-md max-w-md w-full text-center">
        <svg
          className="mx-auto h-16 w-16 text-red-500 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">
          Sorry, you don't have permission to access this page. Your current role is{" "}
          <span className="font-semibold">{userRole || "unknown"}</span>.
        </p>
        <Link
          to="/transactions"
          className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
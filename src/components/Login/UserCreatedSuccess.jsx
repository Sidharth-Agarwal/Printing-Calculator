import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const UserCreatedSuccess = () => {
  // Get the user email and name from URL parameters
  const params = new URLSearchParams(window.location.search);
  const email = params.get('email') || 'the user';
  const name = params.get('name') || '';

  useEffect(() => {
    // Auto re-authenticate as admin using stored credentials
    const reAuthenticateAdmin = async () => {
      try {
        const adminEmail = sessionStorage.getItem('adminEmail');
        const adminPassword = sessionStorage.getItem('adminPassword');
        
        if (adminEmail && adminPassword) {
          const auth = getAuth();
          // Re-authenticate as admin
          await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
          console.log("Successfully re-authenticated as admin");
          
          // Clear credentials from session storage for security
          sessionStorage.removeItem('adminEmail');
          sessionStorage.removeItem('adminPassword');
        }
        
        // Clear the user creation flag now that we're done with the process
        localStorage.removeItem('userCreationInProgress');
      } catch (error) {
        console.error("Error re-authenticating admin:", error);
      }
    };
    
    reAuthenticateAdmin();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md max-w-md w-full text-center">
        <svg
          className="mx-auto h-16 w-16 text-green-500 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <h2 className="text-2xl font-bold mb-4">User Created Successfully</h2>
        <p className="text-gray-600 mb-6">
          The user account for <span className="font-semibold">{email}</span> 
          {name && <span> ({name})</span>} has been created successfully.
        </p>
        <div className="flex flex-col space-y-4">
          <Link
            to="/user-management"
            className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Back to User Management
          </Link>
          <Link
            to="/"
            className="inline-block text-gray-500 py-2 px-4 hover:text-gray-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserCreatedSuccess;
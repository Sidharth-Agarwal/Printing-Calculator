import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [adminExists, setAdminExists] = useState(true);
  
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  // Check if admin exists when component mounts
  useEffect(() => {
    const checkForAdmin = async () => {
      try {
        const usersRef = collection(db, "users");
        const adminQuery = query(usersRef, where("role", "==", "admin"));
        const querySnapshot = await getDocs(adminQuery);
        
        setAdminExists(!querySnapshot.empty);
        setCheckingAdmin(false);
      } catch (err) {
        console.error("Error checking for admin:", err);
        setCheckingAdmin(false);
        // Default to assuming admin exists to prevent redirect loops
        setAdminExists(true);
      }
    };

    // Only check if user is not already logged in
    if (!currentUser) {
      checkForAdmin();
    } else {
      setCheckingAdmin(false);
    }
  }, [currentUser]);

  // Redirect to admin setup if no admin exists
  useEffect(() => {
    if (!checkingAdmin && !adminExists) {
      navigate("/setup-admin");
    }
  }, [checkingAdmin, adminExists, navigate]);

  // Redirect if user is already logged in
  useEffect(() => {
    if (currentUser) {
      navigate("/transactions"); // Changed from /material-stock/paper-db to /transactions
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await login(email, password);
      navigate("/transactions"); // Changed from /material-stock/paper-db to /transactions
    } catch (error) {
      console.error("Login error:", error.message);
      setError(
        error.code === "auth/user-not-found" || error.code === "auth/wrong-password"
          ? "Invalid email or password"
          : "Failed to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while checking for admin
  if (checkingAdmin) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow-md max-w-sm w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading authentication system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md max-w-sm w-full"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Famous Letterpress</h2>
        <h3 className="text-lg mb-6 text-center text-gray-600">Login to your account</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
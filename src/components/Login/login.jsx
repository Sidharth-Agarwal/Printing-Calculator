import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import ForgotPasswordModal from "./ForgotPasswordModal";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [adminExists, setAdminExists] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
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
        setAdminExists(true);
      }
    };

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
      const fetchUserRoleAndRedirect = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            if (userData.role === "admin") {
              navigate("/transactions");
            } else if (userData.role === "b2b") {
              navigate("/orders");
            } else if (userData.role === "staff") {
              navigate("/new-bill");
            } else if (userData.role === "production") {
              navigate("/orders");
            } else {
              navigate("/new-bill");
            }
          } else {
            navigate("/new-bill");
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          navigate("/new-bill");
        }
      };
      
      fetchUserRoleAndRedirect();
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const userCredential = await login(email, password);
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === "admin") {
          navigate("/transactions");
        } else if (userData.role === "b2b") {
          navigate("/b2b-dashboard");
        } else {
          navigate("/new-bill");
        }
      } else {
        navigate("/new-bill");
      }
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

  // Loading state
  if (checkingAdmin) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white p-4 rounded text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-xs">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="w-full max-w-sm mx-4 mt-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-gray-900">Famous Letterpress</h1>
            <p className="text-sm text-gray-600 mt-1">Login to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </div>

      <ForgotPasswordModal 
        isOpen={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
      />
    </div>
  );
};

export default Login;
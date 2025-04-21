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
      // When user is already logged in, fetch their role and redirect accordingly
      const fetchUserRoleAndRedirect = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Redirect based on role
            if (userData.role === "admin") {
              // Admin users go to transactions dashboard
              navigate("/transactions");
            } else if (userData.role === "b2b") {
              // B2B users go to their dashboard
              navigate("/b2b-dashboard");
            } else if (userData.role === "staff") {
              // Staff and production users go to the billing form
              navigate("/new-bill");
            } else if (userData.role === "production") {
              // B2B users go to their dashboard
              navigate("/orders");
            } else {
              // Default fallback
              navigate("/new-bill");
            }
          } else {
            // If user document doesn't exist, fallback to new bill
            navigate("/new-bill");
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          navigate("/new-bill"); // Fallback
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
      
      // After login is successful, fetch the user's role from Firestore
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Redirect based on role
        if (userData.role === "admin") {
          navigate("/transactions");
        } else if (userData.role === "b2b") {
          navigate("/b2b-dashboard");
        } else {
          navigate("/new-bill");
        }
      } else {
        // If user document doesn't exist in Firestore, fallback to new bill
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
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Forgot Password?
          </button>
        </div>
      </form>
      
      <ForgotPasswordModal 
        isOpen={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
      />
    </div>
  );
};

export default Login;
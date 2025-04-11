import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";

const AdminUser = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adminExists, setAdminExists] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  
  const navigate = useNavigate();

  // Check if admin user already exists when component mounts
  useEffect(() => {
    console.log("AdminUser component mounted");
    const checkForAdmin = async () => {
      try {
        console.log("Checking for admin users...");
        setCheckingAdmin(true);
        const usersRef = collection(db, "users");
        const adminQuery = query(usersRef, where("role", "==", "admin"));
        const querySnapshot = await getDocs(adminQuery);
        
        // Check if any admin user exists
        const adminUserExists = !querySnapshot.empty;
        console.log("Admin exists:", adminUserExists);
        
        setAdminExists(adminUserExists);
        setCheckingAdmin(false);
        
        // If admin exists, redirect to login after a short delay
        if (adminUserExists) {
          setTimeout(() => {
            navigate("/");
          }, 3000);
        }
      } catch (err) {
        console.error("Error checking for admin:", err);
        setError("Failed to check for existing admin users: " + err.message);
        setCheckingAdmin(false);
      }
    };

    checkForAdmin();
  }, [navigate]);

  // Handle form submission to create admin user
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic form validation
    if (password !== confirmPassword) {
      return setError("Passwords don't match");
    }

    if (password.length < 6) {
      return setError("Password should be at least 6 characters");
    }

    setLoading(true);

    try {
      console.log("Creating admin user...");
      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      console.log("User created in Firebase Auth, now adding to Firestore...");
      
      // Store the user's role and metadata in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        role: "admin",
        displayName: displayName || "System Administrator",
        createdAt: new Date().toISOString(),
        isActive: true
      });
      
      console.log("Admin user created successfully!");
      setSuccess("Admin user created successfully! Redirecting to login...");
      
      // Clear form
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setDisplayName("");
      
      // Set admin exists flag
      setAdminExists(true);
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      console.error("Error creating admin user:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already in use.");
      } else {
        setError("Failed to create admin user: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while checking for admin
  if (checkingAdmin) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow-md max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking for existing admin users...</p>
        </div>
      </div>
    );
  }

  // If admin already exists, show a message and link to login
  if (adminExists) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow-md max-w-md w-full text-center">
          <svg
            className="mx-auto h-12 w-12 text-green-500"
            xmlns="http://www.w3.org/2000/svg"
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
          <h2 className="mt-4 text-2xl font-bold text-gray-800">Admin Already Exists</h2>
          <p className="mt-2 text-gray-600">
            An administrator account has already been created for this application.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show admin creation form
  return (
    <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Admin User</h2>
        <p className="mb-6 text-gray-600 text-center">
          No administrator account was found. Please create one to get started.
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="System Administrator"
              className="w-full px-4 py-2 border rounded"
            />
          </div>
          
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
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Creating Admin..." : "Create Admin User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminUser;
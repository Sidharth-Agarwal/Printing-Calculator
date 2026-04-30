import React, { createContext, useState, useContext, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// ── Role definitions ──────────────────────────────────────────────────────────
// admin  — full access
// staff  — same as previous "staff/employee" role
// sales  — limited: no delete, no badges, no export/import, no analytics
// production / accountant — existing non-CRM roles

export const ROLES = {
  ADMIN:      "admin",
  STAFF:      "staff",
  SALES:      "sales",
  PRODUCTION: "production",
  ACCOUNTANT: "accountant"
};

/**
 * CRM permission map.
 * Use canDo(userRole, "deleteLead") etc. throughout the app.
 */
export const CRM_PERMISSIONS = {
  viewDashboard:    ["admin", "staff", "sales"],
  addEditLeads:     ["admin", "staff", "sales"],
  deleteLead:       ["admin"],
  manageBadges:     ["admin"],
  viewClients:      ["admin", "staff", "sales"],
  manageJobTickets: ["admin", "staff"],
  exportImport:     ["admin"],
  viewAnalytics:    ["admin", "staff"],
  manageTasks:      ["admin", "staff", "sales"]
};

export const canDo = (role, permission) => {
  const allowed = CRM_PERMISSIONS[permission];
  if (!allowed) return false;
  return allowed.includes(role);
};

// ── Provider ──────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [currentUser,     setCurrentUser]     = useState(null);
  const [userRole,        setUserRole]        = useState(null);
  const [userDisplayName, setUserDisplayName] = useState(null);
  const [loading,         setLoading]         = useState(true);

  // Register
  const register = async (email, password, displayName, role = "staff") => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", cred.user.uid), {
        email,
        displayName: displayName || email.split("@")[0],
        role,
        createdAt: new Date().toISOString(),
        isActive: true,
        hasAccount: true
      });
      return cred;
    } catch (err) {
      console.error("Registration error:", err);
      throw err;
    }
  };

  const sendUserPasswordReset = async (email) => {
    try { await sendPasswordResetEmail(auth, email); return true; }
    catch (err) { console.error("Password reset error:", err); throw err; }
  };

  const updateUserStatus = async (userId, isActive, reason = null) => {
    try {
      const data = { isActive, updatedAt: new Date().toISOString(), updatedBy: currentUser?.uid };
      if (!isActive && reason) { data.deactivatedAt = new Date().toISOString(); data.deactivationReason = reason; }
      await updateDoc(doc(db, "users", userId), data);
      return true;
    } catch (err) { console.error("Update status error:", err); throw err; }
  };

  const updateUserProfile = async (userId, profileData) => {
    try {
      await updateDoc(doc(db, "users", userId), { ...profileData, updatedAt: new Date().toISOString(), updatedBy: currentUser?.uid });
      return true;
    } catch (err) { console.error("Update profile error:", err); throw err; }
  };

  const recordUserLogin = async (firestoreDocId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", firestoreDocId));
      if (!userDoc.exists()) return;
      await updateDoc(doc(db, "users", firestoreDocId), {
        lastLoginAt: new Date().toISOString(),
        loginCount: (userDoc.data()?.loginCount || 0) + 1
      });
    } catch (err) { console.error("Record login error:", err); }
  };

  // Login
  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (!result.user) return result;

      // Find by userId field
      const q = query(collection(db, "users"), where("userId", "==", result.user.uid));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const docRef = snap.docs[0];
        const data   = docRef.data();
        if (data.isActive === false) { await signOut(auth); throw new Error("Your account has been deactivated. Please contact an administrator."); }
        await recordUserLogin(docRef.id);
        if (data.temporaryPassword) {
          await updateDoc(doc(db, "users", docRef.id), { temporaryPassword: null, passwordCreatedAt: null, updatedAt: new Date().toISOString() });
        }
      } else {
        // Legacy fallback
        const legacy = await getDoc(doc(db, "users", result.user.uid));
        if (legacy.exists()) {
          const data = legacy.data();
          if (data.isActive === false) { await signOut(auth); throw new Error("Your account has been deactivated. Please contact an administrator."); }
          await recordUserLogin(result.user.uid);
          if (data.temporaryPassword) {
            await updateDoc(doc(db, "users", result.user.uid), { temporaryPassword: null, passwordCreatedAt: null, updatedAt: new Date().toISOString() });
          }
        } else {
          await signOut(auth);
          throw new Error("User account not found. Please contact an administrator.");
        }
      }

      return result;
    } catch (err) { console.error("Login error:", err); throw err; }
  };

  const logout = async () => {
    try { return await signOut(auth); }
    catch (err) { console.error("Logout error:", err); throw err; }
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!currentUser) throw new Error("No user is logged in");
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);

      const q = query(collection(db, "users"), where("userId", "==", currentUser.uid));
      const snap = await getDocs(q);
      const docId = !snap.empty ? snap.docs[0].id : currentUser.uid;
      await updateDoc(doc(db, "users", docId), { temporaryPassword: null, passwordCreatedAt: null, updatedAt: new Date().toISOString() });
      return true;
    } catch (err) { console.error("Change password error:", err); throw err; }
  };

  // ── Role helpers ────────────────────────────────────────────────────────────

  /** True if user has the given role OR is admin */
  const hasRole = (role) => userRole === role || userRole === ROLES.ADMIN;

  /** Check a named CRM permission */
  const can = (permission) => canDo(userRole, permission);

  /** Convenience booleans consumed by UI components */
  const isAdmin = userRole === ROLES.ADMIN;
  const isStaff = userRole === ROLES.STAFF;
  const isSales = userRole === ROLES.SALES;

  // ── Fetch user data ─────────────────────────────────────────────────────────
  const fetchUserData = async (uid) => {
    try {
      const q = query(collection(db, "users"), where("userId", "==", uid));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const data = snap.docs[0].data();
        setUserRole(data.role || null);
        setUserDisplayName(data.displayName || null);
        return data;
      }

      // Legacy fallback
      const legacy = await getDoc(doc(db, "users", uid));
      if (legacy.exists()) {
        const data = legacy.data();
        setUserRole(data.role || null);
        setUserDisplayName(data.displayName || null);
        return data;
      }

      setUserRole(null);
      setUserDisplayName(null);
      return null;
    } catch (err) {
      console.error("Fetch user data error:", err);
      setUserRole(null);
      setUserDisplayName(null);
      return null;
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) await fetchUserData(user.uid);
      else { setUserRole(null); setUserDisplayName(null); }
      setLoading(false);
    });
    return unsub;
  }, []);

  const updateUserDisplayName = async (uid, newDisplayName) => {
    try {
      const q = query(collection(db, "users"), where("userId", "==", uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        await updateDoc(doc(db, "users", snap.docs[0].id), { displayName: newDisplayName, updatedAt: new Date().toISOString() });
      } else {
        await setDoc(doc(db, "users", uid), { displayName: newDisplayName }, { merge: true });
      }
      setUserDisplayName(newDisplayName);
      return true;
    } catch (err) { console.error("Update display name error:", err); throw err; }
  };

  const value = {
    currentUser,
    userRole,
    userDisplayName,
    loading,
    // Auth
    register, login, logout, changePassword,
    // Role helpers
    hasRole, can, isAdmin, isStaff, isSales,
    // Constants (available to any consumer)
    ROLES, CRM_PERMISSIONS, canDo,
    // User management
    sendUserPasswordReset, updateUserStatus, updateUserProfile,
    recordUserLogin, updateUserDisplayName
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
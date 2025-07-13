import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import AddVendorForm from "./AddVendorForm";
import DisplayVendorTable from "./DisplayVendorTable";
import { useAuth } from "../Login/AuthContext";
import Modal from "../Shared/Modal";
import ConfirmationModal from "../Shared/ConfirmationModal";
import DeleteConfirmationModal from "../Shared/DeleteConfirmationModal";
import { 
  validateVendorData, 
  normalizeEmail, 
  normalizePhone, 
  normalizeGstin,
  normalizeAccountNumber,
  normalizeIfscCode
} from "../../services/vendorValidationService";

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userRole } = useAuth();
  
  // State for notifications/confirmation modals
  const [notification, setNotification] = useState({
    isOpen: false,
    message: "",
    title: "",
    status: "success"
  });
  
  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    itemId: null,
    itemName: ""
  });

  // Vendor statistics
  const [vendorStats, setVendorStats] = useState({
    totalVendors: 0,
    activeVendors: 0
  });

  // Permission checks
  const isAdmin = userRole === "admin";
  const isAccountant = userRole === "accountant";
  const isStaff = userRole === "staff";
  const hasFullAccess = isAdmin || isAccountant; // Admin and Accountant have full access
  const hasViewAccess = hasFullAccess || isStaff; // Staff can view but with limited actions

  useEffect(() => {
    const vendorsCollection = collection(db, "vendors");
    const unsubscribe = onSnapshot(vendorsCollection, (snapshot) => {
      const vendorsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Ensure isActive exists for all vendors
        isActive: doc.data().isActive !== undefined ? doc.data().isActive : true,
        // Ensure account details exist
        accountDetails: doc.data().accountDetails || {
          bankName: "",
          accountNumber: "",
          ifscCode: "",
          accountType: "Current",
          upiId: ""
        },
        // Ensure payment terms exist
        paymentTerms: doc.data().paymentTerms || {
          creditDays: 30
        }
      }));
      setVendors(vendorsData);
      
      // Calculate vendor statistics
      const stats = {
        totalVendors: vendorsData.length,
        activeVendors: vendorsData.filter(vendor => vendor.isActive).length
      };
      setVendorStats(stats);
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const checkVendorCodeExists = async (code) => {
    const vendorsCollection = collection(db, "vendors");
    const q = query(vendorsCollection, where("vendorCode", "==", code));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const generateVendorCode = async (vendorName) => {
    try {
      // Clean the name: remove spaces, special characters, and take first 4 letters
      const prefix = "VND-" + vendorName
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 3)
        .toUpperCase();
      
      // Get all vendors with this prefix to find the highest number
      const vendorsCollection = collection(db, "vendors");
      const querySnapshot = await getDocs(vendorsCollection);
      
      let highestNum = 0;
      const pattern = new RegExp(`^${prefix}(\\d+)$`);
      
      // Look for existing codes with the same prefix
      querySnapshot.forEach(doc => {
        const vendorData = doc.data();
        if (vendorData.vendorCode) {
          const match = vendorData.vendorCode.match(pattern);
          if (match && match[1]) {
            const num = parseInt(match[1]);
            if (!isNaN(num) && num > highestNum) {
              highestNum = num;
            }
          }
        }
      });
      
      // Generate new code with incremented number
      const nextNum = highestNum + 1;
      // Pad to ensure at least 3 digits
      const paddedNum = nextNum.toString().padStart(3, '0');
      
      return `${prefix}${paddedNum}`;
    } catch (error) {
      console.error("Error generating vendor code:", error);
      // Fallback to a simple random code if there's an error
      const randomNum = Math.floor(Math.random() * 900) + 100;
      return `VND-${vendorName.substring(0, 3).toUpperCase()}${randomNum}`;
    }
  };

  const handleAddClick = () => {
    if (!hasFullAccess) return; // Only admin and accountant can add
    
    setSelectedVendor(null); // Ensure we're not in edit mode
    setIsFormModalOpen(true);
  };

  // Enhanced addVendor function with validation
  const addVendor = async (vendorData) => {
    if (!hasFullAccess) return false; // Only admin and accountant can add
    
    setIsSubmitting(true);
    try {
      // Validate vendor data including uniqueness checks
      const validation = await validateVendorData(vendorData);
      
      if (!validation.isValid) {
        // Show validation errors to user
        const errorMessages = Object.values(validation.errors).join(', ');
        setNotification({
          isOpen: true,
          message: `Validation failed: ${errorMessages}`,
          title: "Validation Error",
          status: "error"
        });
        setIsSubmitting(false);
        return false;
      }

      // If vendor code not provided or is empty, generate one based on vendor name
      if (!vendorData.vendorCode || vendorData.vendorCode.trim() === "") {
        vendorData.vendorCode = await generateVendorCode(vendorData.name);
      } else {
        // Validate manually entered code is unique
        const exists = await checkVendorCodeExists(vendorData.vendorCode);
        if (exists) {
          setNotification({
            isOpen: true,
            message: "This vendor code already exists. Please use a different code.",
            title: "Duplicate Vendor Code",
            status: "error"
          });
          setIsSubmitting(false);
          return false;
        }
      }
      
      // Normalize data before saving
      const normalizedData = {
        ...vendorData,
        email: normalizeEmail(vendorData.email),
        phone: normalizePhone(vendorData.phone),
        gstin: normalizeGstin(vendorData.gstin),
        accountDetails: {
          ...vendorData.accountDetails,
          accountNumber: normalizeAccountNumber(vendorData.accountDetails.accountNumber),
          ifscCode: normalizeIfscCode(vendorData.accountDetails.ifscCode)
        }
      };
      
      // Add the vendor
      const vendorsCollection = collection(db, "vendors");
      await addDoc(vendorsCollection, {
        ...normalizedData,
        activeOrders: 0,
        totalOrders: 0,
        totalSpend: 0,
        averageOrderValue: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      setNotification({
        isOpen: true,
        message: "Vendor added successfully!",
        title: "Success",
        status: "success"
      });
      setIsFormModalOpen(false);
      setIsSubmitting(false);
      return true;
    } catch (error) {
      console.error("Error adding vendor:", error);
      setNotification({
        isOpen: true,
        message: "Failed to add vendor: " + error.message,
        title: "Error",
        status: "error"
      });
      setIsSubmitting(false);
      return false;
    }
  };

  const handleEditClick = (vendor) => {
    if (!hasFullAccess) return; // Only admin and accountant can edit
    
    setSelectedVendor({...vendor}); // Make a copy to ensure we don't modify the original
    setIsFormModalOpen(true);
  };

  // Enhanced updateVendor function with validation
  const updateVendor = async (id, updatedData) => {
    if (!hasFullAccess) return false; // Only admin and accountant can update
    
    setIsSubmitting(true);
    try {
      // Validate vendor data including uniqueness checks (excluding current vendor)
      const validation = await validateVendorData(updatedData, id);
      
      if (!validation.isValid) {
        // Show validation errors to user
        const errorMessages = Object.values(validation.errors).join(', ');
        setNotification({
          isOpen: true,
          message: `Validation failed: ${errorMessages}`,
          title: "Validation Error",
          status: "error"
        });
        setIsSubmitting(false);
        return false;
      }

      // If vendor code changed, check if the new code is unique
      if (selectedVendor.vendorCode !== updatedData.vendorCode) {
        const exists = await checkVendorCodeExists(updatedData.vendorCode);
        if (exists) {
          setNotification({
            isOpen: true,
            message: "This vendor code already exists. Please use a different code.",
            title: "Duplicate Vendor Code",
            status: "error"
          });
          setIsSubmitting(false);
          return false;
        }
      }
      
      // Normalize data before saving
      const normalizedData = {
        ...updatedData,
        email: normalizeEmail(updatedData.email),
        phone: normalizePhone(updatedData.phone),
        gstin: normalizeGstin(updatedData.gstin),
        accountDetails: {
          ...updatedData.accountDetails,
          accountNumber: normalizeAccountNumber(updatedData.accountDetails.accountNumber),
          ifscCode: normalizeIfscCode(updatedData.accountDetails.ifscCode)
        }
      };
      
      const vendorDoc = doc(db, "vendors", id);
      await updateDoc(vendorDoc, {
        ...normalizedData,
        updatedAt: new Date(),
      });
      
      setIsFormModalOpen(false);
      setSelectedVendor(null);
      setNotification({
        isOpen: true,
        message: "Vendor updated successfully!",
        title: "Success",
        status: "success"
      });
      setIsSubmitting(false);
      return true;
    } catch (error) {
      console.error("Error updating vendor:", error);
      setNotification({
        isOpen: true,
        message: "Failed to update vendor: " + error.message,
        title: "Error",
        status: "error"
      });
      setIsSubmitting(false);
      return false;
    }
  };

  const toggleVendorStatus = async (vendorId, newStatus) => {
    if (!hasFullAccess) return false; // Only admin and accountant can toggle status
    
    try {
      const vendorDoc = doc(db, "vendors", vendorId);
      await updateDoc(vendorDoc, {
        isActive: newStatus,
        updatedAt: new Date()
      });
      
      setNotification({
        isOpen: true,
        message: `Vendor ${newStatus ? 'activated' : 'deactivated'} successfully!`,
        title: "Success",
        status: "success"
      });
      
      return true;
    } catch (error) {
      console.error("Error toggling vendor status:", error);
      setNotification({
        isOpen: true,
        message: "Failed to update vendor status: " + error.message,
        title: "Error",
        status: "error"
      });
      return false;
    }
  };

  const confirmDelete = (id, name) => {
    if (!hasFullAccess) return; // Only admin and accountant can delete
    
    setDeleteConfirmation({
      isOpen: true,
      itemId: id,
      itemName: name
    });
  };

  const closeDeleteModal = () => {
    setDeleteConfirmation({
      isOpen: false,
      itemId: null,
      itemName: ""
    });
  };

  const closeNotification = () => {
    setNotification({
      isOpen: false,
      message: "",
      title: "",
      status: "success"
    });
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedVendor(null);
  };

  const handleDeleteConfirm = async () => {
    if (!hasFullAccess) return; // Only admin and accountant can delete
    
    try {
      // Now delete the vendor
      await deleteDoc(doc(db, "vendors", deleteConfirmation.itemId));
      
      closeDeleteModal();
      
      setNotification({
        isOpen: true,
        message: "Vendor deleted successfully!",
        title: "Success",
        status: "success"
      });
    } catch (error) {
      console.error("Error deleting vendor:", error);
      closeDeleteModal();
      
      setNotification({
        isOpen: true,
        message: "Failed to delete vendor: " + error.message,
        title: "Error",
        status: "error"
      });
    }
  };

  // Redirect non-authorized users
  if (!hasViewAccess) {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-red-800">Unauthorized Access</h2>
          <p className="mt-2 text-red-600">You don't have permission to access vendor management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
        <p className="text-gray-600 mt-1">
          {hasFullAccess 
            ? "Add, edit, and manage your suppliers and service providers"
            : "View suppliers and service providers information"
          }
        </p>
      </div>

      {/* Vendor Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Total Vendors</h2>
          <p className="text-2xl font-bold text-gray-800">{vendorStats.totalVendors}</p>
          <p className="text-xs text-gray-500 mt-1">
            {vendorStats.activeVendors} active vendors
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Inactive Vendors</h2>
          <p className="text-2xl font-bold text-gray-400">{vendorStats.totalVendors - vendorStats.activeVendors}</p>
          <p className="text-xs text-gray-500 mt-1">
            {((vendorStats.totalVendors - vendorStats.activeVendors) / vendorStats.totalVendors * 100 || 0).toFixed(1)}% of total vendors
          </p>
        </div>
      </div>

      {/* Action buttons - Only show for admin and accountant */}
      {hasFullAccess && (
        <div className="flex justify-end mb-4">
          <button 
            onClick={handleAddClick}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Vendor
          </button>
        </div>
      )}
      
      {/* Table component */}
      <div className="bg-white overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <DisplayVendorTable
            vendors={vendors}
            onDelete={hasFullAccess ? (id) => {
              const vendor = vendors.find(v => v.id === id);
              confirmDelete(id, vendor?.name || "this vendor");
            } : null}
            onEdit={hasFullAccess ? handleEditClick : null}
            onToggleStatus={hasFullAccess ? toggleVendorStatus : null}
            hasFullAccess={hasFullAccess}
          />
        )}
      </div>

      {/* Add/Edit Vendor Modal - Only for admin and accountant */}
      {hasFullAccess && (
        <Modal
          isOpen={isFormModalOpen}
          onClose={handleCloseFormModal}
          title={selectedVendor ? "Edit Vendor" : "Add New Vendor"}
          size="lg"
        >
          <AddVendorForm
            onSubmit={addVendor}
            selectedVendor={selectedVendor}
            onUpdate={updateVendor}
            setSelectedVendor={setSelectedVendor}
            generateVendorCode={generateVendorCode}
          />
        </Modal>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        message={notification.message}
        title={notification.title}
        status={notification.status}
      />
      
      {/* Delete Confirmation Modal - Only for admin and accountant */}
      {hasFullAccess && (
        <DeleteConfirmationModal
          isOpen={deleteConfirmation.isOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteConfirm}
          itemName={deleteConfirmation.itemName}
        />
      )}
    </div>
  );
};

export default VendorManagement;
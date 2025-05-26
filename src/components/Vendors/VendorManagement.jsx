import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import AddVendorForm from "./AddVendorForm";
import DisplayVendorTable from "./DisplayVendorTable";
import { useAuth } from "../Login/AuthContext";
import Modal from "../Shared/Modal";
import ConfirmationModal from "../Shared/ConfirmationModal";
import DeleteConfirmationModal from "../Shared/DeleteConfirmationModal";

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

  // Enhanced vendor statistics with SKU data
  const [vendorStats, setVendorStats] = useState({
    totalVendors: 0,
    activeVendors: 0,
    inactiveVendors: 0,
    totalSkus: 0,
    totalMaterialSkus: 0,
    totalPaperSkus: 0,
    totalStockValue: 0,
    vendorsWithLowStock: 0,
    vendorsWithOutOfStock: 0,
    totalTransactions: 0,
    averageSkusPerVendor: 0
  });

  // State for SKU and transaction data
  const [vendorSkuData, setVendorSkuData] = useState({});
  const [isLoadingSkuData, setIsLoadingSkuData] = useState(true);

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
      
      // Calculate basic vendor statistics
      const stats = {
        totalVendors: vendorsData.length,
        activeVendors: vendorsData.filter(vendor => vendor.isActive).length,
        inactiveVendors: vendorsData.filter(vendor => !vendor.isActive).length
      };
      
      // Fetch SKU data for enhanced statistics
      fetchVendorSkuData(vendorsData, stats);
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch SKU and transaction data for enhanced statistics
  const fetchVendorSkuData = async (vendorsData, basicStats) => {
    setIsLoadingSkuData(true);
    
    try {
      const vendorNames = vendorsData.map(v => v.name);
      const skuData = {};
      let totalSkus = 0;
      let totalMaterialSkus = 0;
      let totalPaperSkus = 0;
      let totalStockValue = 0;
      let vendorsWithLowStock = 0;
      let vendorsWithOutOfStock = 0;
      let totalTransactions = 0;

      // Fetch materials data
      if (vendorNames.length > 0) {
        // Split vendor names into chunks of 10 (Firestore limit for 'in' queries)
        const vendorNameChunks = [];
        for (let i = 0; i < vendorNames.length; i += 10) {
          vendorNameChunks.push(vendorNames.slice(i, i + 10));
        }

        for (const chunk of vendorNameChunks) {
          // Fetch materials
          const materialsQuery = query(
            collection(db, "materials"),
            where("company", "in", chunk)
          );
          const materialsSnapshot = await getDocs(materialsQuery);
          
          materialsSnapshot.docs.forEach(doc => {
            const material = doc.data();
            const vendorName = material.company;
            
            if (!skuData[vendorName]) {
              skuData[vendorName] = {
                totalSkus: 0,
                materialSkus: 0,
                paperSkus: 0,
                stockValue: 0,
                lowStockCount: 0,
                outOfStockCount: 0,
                transactions: 0
              };
            }
            
            skuData[vendorName].totalSkus++;
            skuData[vendorName].materialSkus++;
            totalSkus++;
            totalMaterialSkus++;
            
            const stock = parseFloat(material.currentStock) || 0;
            const cost = parseFloat(material.finalCostPerUnit) || 0;
            const stockValue = stock * cost;
            skuData[vendorName].stockValue += stockValue;
            totalStockValue += stockValue;
            
            const minStock = parseFloat(material.minStockLevel) || 0;
            if (stock <= 0) {
              skuData[vendorName].outOfStockCount++;
            } else if (stock <= minStock) {
              skuData[vendorName].lowStockCount++;
            }
          });

          // Fetch papers
          const papersQuery = query(
            collection(db, "papers"),
            where("company", "in", chunk)
          );
          const papersSnapshot = await getDocs(papersQuery);
          
          papersSnapshot.docs.forEach(doc => {
            const paper = doc.data();
            const vendorName = paper.company;
            
            if (!skuData[vendorName]) {
              skuData[vendorName] = {
                totalSkus: 0,
                materialSkus: 0,
                paperSkus: 0,
                stockValue: 0,
                lowStockCount: 0,
                outOfStockCount: 0,
                transactions: 0
              };
            }
            
            skuData[vendorName].totalSkus++;
            skuData[vendorName].paperSkus++;
            totalSkus++;
            totalPaperSkus++;
            
            const stock = parseFloat(paper.currentStock) || 0;
            const cost = parseFloat(paper.finalRate) || 0;
            const stockValue = stock * cost;
            skuData[vendorName].stockValue += stockValue;
            totalStockValue += stockValue;
            
            const minStock = parseFloat(paper.minStockLevel) || 0;
            if (stock <= 0) {
              skuData[vendorName].outOfStockCount++;
            } else if (stock <= minStock) {
              skuData[vendorName].lowStockCount++;
            }
          });

          // Fetch stock transactions
          const transactionsQuery = query(
            collection(db, "stockTransactions"),
            where("vendorName", "in", chunk)
          );
          const transactionsSnapshot = await getDocs(transactionsQuery);
          
          transactionsSnapshot.docs.forEach(doc => {
            const transaction = doc.data();
            const vendorName = transaction.vendorName;
            
            if (skuData[vendorName]) {
              skuData[vendorName].transactions++;
            }
            totalTransactions++;
          });
        }
      }

      // Count vendors with stock issues
      Object.values(skuData).forEach(data => {
        if (data.lowStockCount > 0) vendorsWithLowStock++;
        if (data.outOfStockCount > 0) vendorsWithOutOfStock++;
      });

      // Calculate average SKUs per vendor
      const averageSkusPerVendor = vendorsData.length > 0 ? totalSkus / vendorsData.length : 0;

      // Update statistics
      setVendorStats({
        ...basicStats,
        totalSkus,
        totalMaterialSkus,
        totalPaperSkus,
        totalStockValue,
        vendorsWithLowStock,
        vendorsWithOutOfStock,
        totalTransactions,
        averageSkusPerVendor
      });

      setVendorSkuData(skuData);
      
    } catch (error) {
      console.error("Error fetching SKU data:", error);
    } finally {
      setIsLoadingSkuData(false);
    }
  };

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
    setSelectedVendor(null); // Ensure we're not in edit mode
    setIsFormModalOpen(true);
  };

  const addVendor = async (vendorData) => {
    setIsSubmitting(true);
    try {
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
            title: "Error",
            status: "error"
          });
          setIsSubmitting(false);
          return false;
        }
      }
      
      // Add the vendor
      const vendorsCollection = collection(db, "vendors");
      await addDoc(vendorsCollection, {
        ...vendorData,
        activeOrders: 0,
        totalOrders: 0,
        totalSpend: 0,
        averageOrderValue: 0,
        activeSkus: [], // Initialize empty SKU list
        totalTransactions: 0,
        lastPurchaseDate: null,
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
    setSelectedVendor({...vendor}); // Make a copy to ensure we don't modify the original
    setIsFormModalOpen(true);
  };

  const updateVendor = async (id, updatedData) => {
    setIsSubmitting(true);
    try {
      // If vendor code changed, check if the new code is unique
      if (selectedVendor.vendorCode !== updatedData.vendorCode) {
        const exists = await checkVendorCodeExists(updatedData.vendorCode);
        if (exists) {
          setNotification({
            isOpen: true,
            message: "This vendor code already exists. Please use a different code.",
            title: "Error",
            status: "error"
          });
          setIsSubmitting(false);
          return false;
        }
      }
      
      const vendorDoc = doc(db, "vendors", id);
      await updateDoc(vendorDoc, {
        ...updatedData,
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
    try {
      // Check if vendor has associated SKUs
      const vendor = vendors.find(v => v.id === deleteConfirmation.itemId);
      const vendorSkus = vendorSkuData[vendor?.name];
      
      if (vendorSkus && vendorSkus.totalSkus > 0) {
        setNotification({
          isOpen: true,
          message: `Cannot delete vendor "${vendor.name}". This vendor has ${vendorSkus.totalSkus} associated SKUs. Please remove or reassign the SKUs first.`,
          title: "Cannot Delete Vendor",
          status: "error"
        });
        closeDeleteModal();
        return;
      }
      
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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Format large numbers
  const formatNumber = (number) => {
    return new Intl.NumberFormat("en-IN").format(number || 0);
  };

  // Check if user is admin or staff - only they should access this page
  const isAdmin = userRole === "admin";

  // Redirect non-authorized users
  if (!isAdmin && userRole !== "staff") {
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
          Manage suppliers and service providers with comprehensive SKU tracking
        </p>
      </div>

      {/* Enhanced Vendor Statistics with SKU Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Total Vendors</h2>
          <p className="text-2xl font-bold text-gray-800">{vendorStats.totalVendors}</p>
          <p className="text-xs text-gray-500 mt-1">
            {vendorStats.activeVendors} active
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200 bg-green-50">
          <h2 className="text-sm font-medium text-green-700 mb-2">Active Vendors</h2>
          <p className="text-2xl font-bold text-green-800">{vendorStats.activeVendors}</p>
          <p className="text-xs text-green-600 mt-1">
            {((vendorStats.activeVendors / vendorStats.totalVendors) * 100 || 0).toFixed(1)}% of total
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200 bg-blue-50">
          <h2 className="text-sm font-medium text-blue-700 mb-2">Total SKUs</h2>
          <p className="text-2xl font-bold text-blue-800">{vendorStats.totalSkus}</p>
          <p className="text-xs text-blue-600 mt-1">
            Across all vendors
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-200 bg-indigo-50">
          <h2 className="text-sm font-medium text-indigo-700 mb-2">Materials</h2>
          <p className="text-2xl font-bold text-indigo-800">{vendorStats.totalMaterialSkus}</p>
          <p className="text-xs text-indigo-600 mt-1">
            Material SKUs
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-200 bg-purple-50">
          <h2 className="text-sm font-medium text-purple-700 mb-2">Papers</h2>
          <p className="text-2xl font-bold text-purple-800">{vendorStats.totalPaperSkus}</p>
          <p className="text-xs text-purple-600 mt-1">
            Paper SKUs
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200 bg-green-50">
          <h2 className="text-sm font-medium text-green-700 mb-2">Stock Value</h2>
          <p className="text-lg font-bold text-green-800">{formatCurrency(vendorStats.totalStockValue)}</p>
          <p className="text-xs text-green-600 mt-1">
            Total inventory
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-200 bg-yellow-50">
          <h2 className="text-sm font-medium text-yellow-700 mb-2">Stock Alerts</h2>
          <p className="text-2xl font-bold text-yellow-800">{vendorStats.vendorsWithLowStock + vendorStats.vendorsWithOutOfStock}</p>
          <p className="text-xs text-yellow-600 mt-1">
            Vendors with issues
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Avg SKUs</h2>
          <p className="text-2xl font-bold text-gray-800">{vendorStats.averageSkusPerVendor.toFixed(1)}</p>
          <p className="text-xs text-gray-500 mt-1">
            Per vendor
          </p>
        </div>
      </div>

      {/* Stock Alerts */}
      {(vendorStats.vendorsWithLowStock > 0 || vendorStats.vendorsWithOutOfStock > 0) && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-orange-800 font-medium">Vendor Stock Alert</p>
              <p className="text-orange-700 text-sm">
                {vendorStats.vendorsWithOutOfStock > 0 && `${vendorStats.vendorsWithOutOfStock} vendors have out-of-stock items`}
                {vendorStats.vendorsWithOutOfStock > 0 && vendorStats.vendorsWithLowStock > 0 && ", "}
                {vendorStats.vendorsWithLowStock > 0 && `${vendorStats.vendorsWithLowStock} vendors have low-stock items`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SKU Insights */}
      {!isLoadingSkuData && vendorStats.totalSkus > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-blue-800 font-medium mb-2">SKU Distribution Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <p className="text-blue-800 font-bold text-lg">{formatNumber(vendorStats.totalTransactions)}</p>
              <p className="text-blue-600 text-xs">Total Transactions</p>
            </div>
            <div className="text-center">
              <p className="text-blue-800 font-bold text-lg">
                {((vendorStats.totalMaterialSkus / vendorStats.totalSkus) * 100).toFixed(1)}%
              </p>
              <p className="text-blue-600 text-xs">Materials vs Papers</p>
            </div>
            <div className="text-center">
              <p className="text-blue-800 font-bold text-lg">
                {vendors.filter(v => vendorSkuData[v.name]?.totalSkus > 0).length}
              </p>
              <p className="text-blue-600 text-xs">Vendors with SKUs</p>
            </div>
            <div className="text-center">
              <p className="text-blue-800 font-bold text-lg">
                {formatCurrency(vendorStats.totalStockValue / vendorStats.totalSkus)}
              </p>
              <p className="text-blue-600 text-xs">Avg value per SKU</p>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
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
      
      {/* Table component */}
      <div className="bg-white overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <DisplayVendorTable
            vendors={vendors}
            onDelete={(id) => {
              const vendor = vendors.find(v => v.id === id);
              confirmDelete(id, vendor?.name || "this vendor");
            }}
            onEdit={handleEditClick}
            onToggleStatus={toggleVendorStatus}
            isAdmin={isAdmin}
            vendorSkuData={vendorSkuData}
          />
        )}
      </div>

      {/* Add/Edit Vendor Modal */}
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

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        message={notification.message}
        title={notification.title}
        status={notification.status}
      />
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        itemName={deleteConfirmation.itemName}
      />
    </div>
  );
};

export default VendorManagement;
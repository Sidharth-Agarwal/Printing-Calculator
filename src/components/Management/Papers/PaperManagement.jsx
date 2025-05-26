import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import AddPaperForm from "./AddPaperForm";
import DisplayPaperTable from "./DisplayPaperTable";
import Modal from "../../Shared/Modal";
import ConfirmationModal from "../../Shared/ConfirmationModal";
import DeleteConfirmationModal from "../../Shared/DeleteConfirmationModal";
import { useAuth } from "../../Login/AuthContext";
import DBExportImport from "../../Shared/DBExportImport";
import { generatePaperSKU, getPaperStockStatus } from "../../../constants/paperContants";

const PaperManagement = () => {
  const { userRole } = useAuth();
  const [papers, setPapers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    itemId: null
  });
  const [notification, setNotification] = useState({
    isOpen: false,
    message: "",
    title: "",
    status: "success"
  });

  // Check if user is admin
  const isAdmin = userRole === "admin";

  // Paper statistics with stock tracking
  const [paperStats, setPaperStats] = useState({
    totalPapers: 0,
    activePapers: 0,
    gsmCategories: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalStockValue: 0,
    totalSheets: 0,
    totalAreaCoverage: 0
  });

  useEffect(() => {
    // Fetch papers
    const papersCollection = collection(db, "papers");
    const papersUnsubscribe = onSnapshot(papersCollection, (snapshot) => {
      const papersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setPapers(papersData);
      
      // Calculate statistics with stock data
      const uniqueGsm = new Set(papersData.map(paper => paper.gsm)).size;
      const activeCount = papersData.filter(paper => paper.isActive !== false).length;
      
      // Stock-related statistics
      const lowStockCount = papersData.filter(paper => 
        getPaperStockStatus(paper.currentStock, paper.minStockLevel, paper.maxStockLevel) === 'LOW_STOCK'
      ).length;
      
      const outOfStockCount = papersData.filter(paper => 
        getPaperStockStatus(paper.currentStock, paper.minStockLevel, paper.maxStockLevel) === 'OUT_OF_STOCK'
      ).length;
      
      // Calculate total stock value and coverage
      let totalStockValue = 0;
      let totalSheets = 0;
      let totalAreaCoverage = 0;
      
      papersData.forEach(paper => {
        const stock = parseFloat(paper.currentStock) || 0;
        const rate = parseFloat(paper.finalRate) || 0;
        const length = parseFloat(paper.length) || 0;
        const breadth = parseFloat(paper.breadth) || 0;
        
        totalStockValue += (stock * rate);
        totalSheets += stock;
        totalAreaCoverage += (stock * length * breadth);
      });
      
      setPaperStats({
        totalPapers: papersData.length,
        activePapers: activeCount,
        gsmCategories: uniqueGsm,
        lowStockItems: lowStockCount,
        outOfStockItems: outOfStockCount,
        totalStockValue: totalStockValue,
        totalSheets: totalSheets,
        totalAreaCoverage: totalAreaCoverage
      });
      
      setIsLoading(false);
    });

    // Fetch vendors for company dropdown
    const vendorsCollection = collection(db, "vendors");
    const vendorsUnsubscribe = onSnapshot(vendorsCollection, (snapshot) => {
      const vendorsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Filter to only include active vendors
      const activeVendors = vendorsData.filter(vendor => vendor.isActive !== false);
      setVendors(activeVendors);
    });

    // Cleanup listeners
    return () => {
      papersUnsubscribe();
      vendorsUnsubscribe();
    };
  }, []);

  // Generate unique SKU for papers
  const generateSKUCode = async (type, paperName, company, gsm) => {
    try {
      // Get all existing SKUs to ensure uniqueness
      const papersCollection = collection(db, "papers");
      const snapshot = await getDocs(papersCollection);
      const existingSkus = snapshot.docs.map(doc => doc.data().skuCode).filter(Boolean);
      
      return await generatePaperSKU(paperName, company, gsm, existingSkus);
    } catch (error) {
      console.error("Error generating SKU:", error);
      throw error;
    }
  };

  // Create stock transaction record
  const createStockTransaction = async (skuCode, type, quantity, reference, vendorName = null) => {
    try {
      const stockTransactionsCollection = collection(db, "stockTransactions");
      await addDoc(stockTransactionsCollection, {
        skuCode,
        type, // 'IN', 'OUT', 'ADJUSTMENT'
        quantity: parseFloat(quantity),
        date: new Date(),
        reference,
        vendorName,
        itemType: "Paper",
        createdAt: new Date()
      });
    } catch (error) {
      console.error("Error creating stock transaction:", error);
    }
  };

  // Update vendor SKU relationship
  const updateVendorSkuRelationship = async (vendorName, skuCode) => {
    try {
      const vendorsCollection = collection(db, "vendors");
      const q = query(vendorsCollection, where("name", "==", vendorName));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const vendorDoc = querySnapshot.docs[0];
        const vendorData = vendorDoc.data();
        const currentSkus = vendorData.activeSkus || [];
        
        if (!currentSkus.includes(skuCode)) {
          await updateDoc(vendorDoc.ref, {
            activeSkus: [...currentSkus, skuCode],
            lastPurchaseDate: new Date(),
            updatedAt: new Date()
          });
        }
      }
    } catch (error) {
      console.error("Error updating vendor SKU relationship:", error);
    }
  };

  const addPaper = async (paperData) => {
    if (!isAdmin) return;
    
    setIsSubmitting(true);
    try {
      const papersCollection = collection(db, "papers");
      
      // Prepare paper data with stock tracking
      const newPaperData = {
        ...paperData,
        currentStock: paperData.initialStock || 0,
        totalPurchased: paperData.initialStock || 0,
        totalUsed: 0,
        lastStockUpdate: new Date(),
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add the paper
      const docRef = await addDoc(papersCollection, newPaperData);
      
      // Create initial stock transaction
      if (paperData.initialStock && parseFloat(paperData.initialStock) > 0) {
        await createStockTransaction(
          paperData.skuCode,
          'IN',
          paperData.initialStock,
          'Initial Stock Entry'
        );
      }
      
      // Update vendor relationship if company is specified
      if (paperData.company) {
        await updateVendorSkuRelationship(paperData.company, paperData.skuCode);
      }
      
      setNotification({
        isOpen: true,
        message: `Paper added successfully! SKU: ${paperData.skuCode}`,
        title: "Success",
        status: "success"
      });
      setIsFormModalOpen(false);
    } catch (error) {
      console.error("Error adding paper:", error);
      
      setNotification({
        isOpen: true,
        message: "Error adding paper. Please try again.",
        title: "Error",
        status: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePaper = async (id, updatedData) => {
    if (!isAdmin) return;
    
    setIsSubmitting(true);
    try {
      const paperDoc = doc(db, "papers", id);
      
      // Prepare update data
      const updatePayload = {
        ...updatedData,
        updatedAt: new Date()
      };
      
      // If stock quantity changed, create a transaction
      if (selectedPaper && updatedData.currentStock !== selectedPaper.currentStock) {
        const stockDifference = parseFloat(updatedData.currentStock) - parseFloat(selectedPaper.currentStock || 0);
        
        await createStockTransaction(
          updatedData.skuCode,
          stockDifference > 0 ? 'IN' : 'OUT',
          Math.abs(stockDifference),
          'Manual Stock Adjustment'
        );
        
        updatePayload.lastStockUpdate = new Date();
      }
      
      await updateDoc(paperDoc, updatePayload);
      
      // Update vendor relationship if company changed
      if (updatedData.company && updatedData.company !== selectedPaper?.company) {
        await updateVendorSkuRelationship(updatedData.company, updatedData.skuCode);
      }
      
      setNotification({
        isOpen: true,
        message: "Paper updated successfully!",
        title: "Success",
        status: "success"
      });
      setIsFormModalOpen(false);
      setSelectedPaper(null);
    } catch (error) {
      console.error("Error updating paper:", error);
      
      setNotification({
        isOpen: true,
        message: "Error updating paper. Please try again.",
        title: "Error",
        status: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddClick = () => {
    if (!isAdmin) return;
    
    setSelectedPaper(null); // Ensure we're not in edit mode
    setIsFormModalOpen(true);
  };

  const handleEditClick = (paper) => {
    if (!isAdmin) return;
    
    setSelectedPaper({...paper}); // Make a copy to ensure we don't modify the original
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setSelectedPaper(null);
  };

  const confirmDelete = (id) => {
    if (!isAdmin) return;
    
    setDeleteConfirmation({
      isOpen: true,
      itemId: id
    });
  };

  const closeDeleteModal = () => {
    setDeleteConfirmation({
      isOpen: false,
      itemId: null
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

  // Handle notification from export/import operations
  const handleExportImportSuccess = (message) => {
    setNotification({
      isOpen: true,
      message: message,
      title: "Success",
      status: "success"
    });
  };

  const handleExportImportError = (message) => {
    setNotification({
      isOpen: true,
      message: message,
      title: "Error",
      status: "error"
    });
  };

  const handleDeleteConfirm = async () => {
    if (!isAdmin) return;
    
    try {
      const paper = papers.find(p => p.id === deleteConfirmation.itemId);
      
      // Create transaction for stock removal if there's remaining stock
      if (paper?.currentStock && parseFloat(paper.currentStock) > 0) {
        await createStockTransaction(
          paper.skuCode,
          'OUT',
          paper.currentStock,
          'Paper Deleted'
        );
      }
      
      // Delete the paper
      await deleteDoc(doc(db, "papers", deleteConfirmation.itemId));
      
      closeDeleteModal();
      
      setNotification({
        isOpen: true,
        message: "Paper deleted successfully!",
        title: "Success",
        status: "success"
      });
    } catch (error) {
      console.error("Error deleting paper:", error);
      closeDeleteModal();
      
      setNotification({
        isOpen: true,
        message: "Error deleting paper. Please try again.",
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

  // Redirect non-authorized users
  if (!isAdmin && userRole !== "staff") {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-red-800">Unauthorized Access</h2>
          <p className="mt-2 text-red-600">You don't have permission to access paper management.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Paper Management</h1>
          <div className="animate-pulse w-64 h-8 bg-gray-200 rounded-md"></div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Paper Management</h1>
        <p className="text-gray-600 mt-1">
          Manage paper inventory with sheet-based stock tracking and area coverage
        </p>
      </div>

      {/* Enhanced Statistics with Stock Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Total Papers</h2>
          <p className="text-2xl font-bold text-gray-800">{paperStats.totalPapers}</p>
          <p className="text-xs text-gray-500 mt-1">
            {paperStats.gsmCategories} GSM types
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Active Papers</h2>
          <p className="text-2xl font-bold text-green-600">{paperStats.activePapers}</p>
          <p className="text-xs text-gray-500 mt-1">
            Available for use
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-200 bg-yellow-50">
          <h2 className="text-sm font-medium text-yellow-700 mb-2">Low Stock Items</h2>
          <p className="text-2xl font-bold text-yellow-800">{paperStats.lowStockItems}</p>
          <p className="text-xs text-yellow-600 mt-1">
            Need restocking
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-red-200 bg-red-50">
          <h2 className="text-sm font-medium text-red-700 mb-2">Out of Stock</h2>
          <p className="text-2xl font-bold text-red-800">{paperStats.outOfStockItems}</p>
          <p className="text-xs text-red-600 mt-1">
            Immediate attention
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200 bg-blue-50">
          <h2 className="text-sm font-medium text-blue-700 mb-2">Stock Value</h2>
          <p className="text-lg font-bold text-blue-800">{formatCurrency(paperStats.totalStockValue)}</p>
          <p className="text-xs text-blue-600 mt-1">
            Total inventory value
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200 bg-green-50">
          <h2 className="text-sm font-medium text-green-700 mb-2">Total Sheets</h2>
          <p className="text-xl font-bold text-green-800">{formatNumber(paperStats.totalSheets)}</p>
          <p className="text-xs text-green-600 mt-1">
            Sheets in stock
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-200 bg-purple-50">
          <h2 className="text-sm font-medium text-purple-700 mb-2">Area Coverage</h2>
          <p className="text-lg font-bold text-purple-800">{formatNumber(paperStats.totalAreaCoverage)}</p>
          <p className="text-xs text-purple-600 mt-1">
            Total sqcm available
          </p>
        </div>
      </div>

      {/* Stock Alerts */}
      {(paperStats.lowStockItems > 0 || paperStats.outOfStockItems > 0) && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-orange-800 font-medium">Paper Stock Alert</p>
              <p className="text-orange-700 text-sm">
                {paperStats.outOfStockItems > 0 && `${paperStats.outOfStockItems} papers out of stock`}
                {paperStats.outOfStockItems > 0 && paperStats.lowStockItems > 0 && ", "}
                {paperStats.lowStockItems > 0 && `${paperStats.lowStockItems} papers low on stock`}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Action buttons with Export/Import options */}
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <div className="mb-2 md:mb-0">
          {/* Only show import/export to admins */}
          {isAdmin && (
            <DBExportImport 
              db={db}
              collectionName="papers"
              onSuccess={handleExportImportSuccess}
              onError={handleExportImportError}
              dateFields={['timestamp', 'createdAt', 'updatedAt', 'lastStockUpdate']}
            />
          )}
        </div>
        
        <div>
          {isAdmin && (
            <button 
              onClick={handleAddClick}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Paper
            </button>
          )}
        </div>
      </div>

      {/* Table component - visible to all users */}
      <div className="overflow-hidden">
        <DisplayPaperTable
          papers={papers}
          onDelete={isAdmin ? confirmDelete : null}
          onEdit={isAdmin ? handleEditClick : null}
        />
      </div>

      {/* Modals - only rendered for admins */}
      {isAdmin && (
        <>
          {/* Modal for adding/editing paper */}
          <Modal
            isOpen={isFormModalOpen}
            onClose={handleCloseModal}
            title={selectedPaper ? "Edit Paper" : "Add New Paper"}
            size="lg"
          >
            <AddPaperForm
              onSubmit={addPaper}
              selectedPaper={selectedPaper}
              onUpdate={updatePaper}
              isSubmitting={isSubmitting}
              onCancel={handleCloseModal}
              vendors={vendors}
              generateSKUCode={generateSKUCode}
            />
          </Modal>

          <DeleteConfirmationModal
            isOpen={deleteConfirmation.isOpen}
            onClose={closeDeleteModal}
            onConfirm={handleDeleteConfirm}
            itemName="paper"
          />
          
          <ConfirmationModal
            isOpen={notification.isOpen}
            onClose={closeNotification}
            message={notification.message}
            title={notification.title}
            status={notification.status}
          />
        </>
      )}
    </div>
  );
};

export default PaperManagement;
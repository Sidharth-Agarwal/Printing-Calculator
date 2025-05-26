import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import AddMaterialForm from "./AddMaterialForm";
import DisplayMaterialTable from "./DisplayMaterialTable";
import Modal from "../../Shared/Modal";
import ConfirmationModal from "../../Shared/ConfirmationModal";
import DeleteConfirmationModal from "../../Shared/DeleteConfirmationModal";
import { useAuth } from "../../Login/AuthContext";
import DBExportImport from "../../Shared/DBExportImport";
import { generateMaterialSKU, getStockStatus } from "../../../constants/materialConstants";

const MaterialManagement = () => {
  const { userRole } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
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

  // Material statistics with stock tracking
  const [materialStats, setMaterialStats] = useState({
    totalMaterials: 0,
    activeMaterials: 0,
    materialCategories: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalStockValue: 0
  });

  useEffect(() => {
    // Fetch materials
    const materialsCollection = collection(db, "materials");
    const materialsUnsubscribe = onSnapshot(materialsCollection, (snapshot) => {
      const materialsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setMaterials(materialsData);
      
      // Calculate statistics with stock data
      const uniqueCategories = new Set(materialsData.map(material => material.materialType)).size;
      const activeCount = materialsData.filter(material => material.isActive !== false).length;
      
      // Stock-related statistics
      const lowStockCount = materialsData.filter(material => 
        getStockStatus(material.currentStock, material.minStockLevel, material.maxStockLevel) === 'LOW_STOCK'
      ).length;
      
      const outOfStockCount = materialsData.filter(material => 
        getStockStatus(material.currentStock, material.minStockLevel, material.maxStockLevel) === 'OUT_OF_STOCK'
      ).length;
      
      // Calculate total stock value
      const totalStockValue = materialsData.reduce((sum, material) => {
        const stock = parseFloat(material.currentStock) || 0;
        const cost = parseFloat(material.finalCostPerUnit) || 0;
        return sum + (stock * cost);
      }, 0);
      
      setMaterialStats({
        totalMaterials: materialsData.length,
        activeMaterials: activeCount,
        materialCategories: uniqueCategories,
        lowStockItems: lowStockCount,
        outOfStockItems: outOfStockCount,
        totalStockValue: totalStockValue
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
      materialsUnsubscribe();
      vendorsUnsubscribe();
    };
  }, []);

  // Generate unique SKU for materials
  const generateSKUCode = async (type, materialType, company) => {
    try {
      // Get all existing SKUs to ensure uniqueness
      const materialsCollection = collection(db, "materials");
      const snapshot = await getDocs(materialsCollection);
      const existingSkus = snapshot.docs.map(doc => doc.data().skuCode).filter(Boolean);
      
      return await generateMaterialSKU(materialType, company, existingSkus);
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
        itemType: "Material",
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

  const addMaterial = async (materialData) => {
    if (!isAdmin) return;
    
    setIsSubmitting(true);
    try {
      const materialsCollection = collection(db, "materials");
      
      // Prepare material data with stock tracking
      const newMaterialData = {
        ...materialData,
        currentStock: materialData.initialStock || 0,
        totalPurchased: materialData.initialStock || 0,
        totalUsed: 0,
        lastStockUpdate: new Date(),
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add the material
      const docRef = await addDoc(materialsCollection, newMaterialData);
      
      // Create initial stock transaction
      if (materialData.initialStock && parseFloat(materialData.initialStock) > 0) {
        await createStockTransaction(
          materialData.skuCode,
          'IN',
          materialData.initialStock,
          'Initial Stock Entry'
        );
      }
      
      // Update vendor relationship if company is specified
      if (materialData.company) {
        await updateVendorSkuRelationship(materialData.company, materialData.skuCode);
      }
      
      setNotification({
        isOpen: true,
        message: `Material added successfully! SKU: ${materialData.skuCode}`,
        title: "Success",
        status: "success"
      });
      setIsFormModalOpen(false);
    } catch (error) {
      console.error("Error adding material:", error);
      
      setNotification({
        isOpen: true,
        message: "Error adding material. Please try again.",
        title: "Error",
        status: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateMaterial = async (id, updatedData) => {
    if (!isAdmin) return;
    
    setIsSubmitting(true);
    try {
      const materialDoc = doc(db, "materials", id);
      
      // Prepare update data
      const updatePayload = {
        ...updatedData,
        updatedAt: new Date()
      };
      
      // If stock quantity changed, create a transaction
      if (selectedMaterial && updatedData.currentStock !== selectedMaterial.currentStock) {
        const stockDifference = parseFloat(updatedData.currentStock) - parseFloat(selectedMaterial.currentStock || 0);
        
        await createStockTransaction(
          updatedData.skuCode,
          stockDifference > 0 ? 'IN' : 'OUT',
          Math.abs(stockDifference),
          'Manual Stock Adjustment'
        );
        
        updatePayload.lastStockUpdate = new Date();
      }
      
      await updateDoc(materialDoc, updatePayload);
      
      // Update vendor relationship if company changed
      if (updatedData.company && updatedData.company !== selectedMaterial?.company) {
        await updateVendorSkuRelationship(updatedData.company, updatedData.skuCode);
      }
      
      setNotification({
        isOpen: true,
        message: "Material updated successfully!",
        title: "Success",
        status: "success"
      });
      setIsFormModalOpen(false);
      setSelectedMaterial(null);
    } catch (error) {
      console.error("Error updating material:", error);
      
      setNotification({
        isOpen: true,
        message: "Error updating material. Please try again.",
        title: "Error",
        status: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddClick = () => {
    if (!isAdmin) return;
    
    setSelectedMaterial(null); // Ensure we're not in edit mode
    setIsFormModalOpen(true);
  };

  const handleEditClick = (material) => {
    if (!isAdmin) return;
    
    setSelectedMaterial({...material}); // Make a copy to ensure we don't modify the original
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setSelectedMaterial(null);
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
      const material = materials.find(m => m.id === deleteConfirmation.itemId);
      
      // Create transaction for stock removal if there's remaining stock
      if (material?.currentStock && parseFloat(material.currentStock) > 0) {
        await createStockTransaction(
          material.skuCode,
          'OUT',
          material.currentStock,
          'Material Deleted'
        );
      }
      
      // Delete the material
      await deleteDoc(doc(db, "materials", deleteConfirmation.itemId));
      
      closeDeleteModal();
      
      setNotification({
        isOpen: true,
        message: "Material deleted successfully!",
        title: "Success",
        status: "success"
      });
    } catch (error) {
      console.error("Error deleting material:", error);
      closeDeleteModal();
      
      setNotification({
        isOpen: true,
        message: "Error deleting material. Please try again.",
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

  // Redirect non-authorized users
  if (!isAdmin && userRole !== "staff") {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-red-800">Unauthorized Access</h2>
          <p className="mt-2 text-red-600">You don't have permission to access material management.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Material Management</h1>
          <div className="animate-pulse w-64 h-8 bg-gray-200 rounded-md"></div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
        <h1 className="text-2xl font-bold text-gray-900">Material Management</h1>
        <p className="text-gray-600 mt-1">
          Manage raw materials, supplies, and inventory with stock tracking
        </p>
      </div>

      {/* Enhanced Statistics with Stock Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Total Materials</h2>
          <p className="text-2xl font-bold text-gray-800">{materialStats.totalMaterials}</p>
          <p className="text-xs text-gray-500 mt-1">
            {materialStats.materialCategories} categories
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Active Materials</h2>
          <p className="text-2xl font-bold text-green-600">{materialStats.activeMaterials}</p>
          <p className="text-xs text-gray-500 mt-1">
            Available for use
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-200 bg-yellow-50">
          <h2 className="text-sm font-medium text-yellow-700 mb-2">Low Stock Items</h2>
          <p className="text-2xl font-bold text-yellow-800">{materialStats.lowStockItems}</p>
          <p className="text-xs text-yellow-600 mt-1">
            Need restocking
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-red-200 bg-red-50">
          <h2 className="text-sm font-medium text-red-700 mb-2">Out of Stock</h2>
          <p className="text-2xl font-bold text-red-800">{materialStats.outOfStockItems}</p>
          <p className="text-xs text-red-600 mt-1">
            Immediate attention
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200 bg-blue-50">
          <h2 className="text-sm font-medium text-blue-700 mb-2">Stock Value</h2>
          <p className="text-lg font-bold text-blue-800">{formatCurrency(materialStats.totalStockValue)}</p>
          <p className="text-xs text-blue-600 mt-1">
            Total inventory value
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-200 bg-purple-50">
          <h2 className="text-sm font-medium text-purple-700 mb-2">SKU Coverage</h2>
          <p className="text-2xl font-bold text-purple-800">{materials.filter(m => m.skuCode).length}</p>
          <p className="text-xs text-purple-600 mt-1">
            Materials with SKUs
          </p>
        </div>
      </div>

      {/* Stock Alerts */}
      {(materialStats.lowStockItems > 0 || materialStats.outOfStockItems > 0) && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-orange-800 font-medium">Stock Alert</p>
              <p className="text-orange-700 text-sm">
                {materialStats.outOfStockItems > 0 && `${materialStats.outOfStockItems} items out of stock`}
                {materialStats.outOfStockItems > 0 && materialStats.lowStockItems > 0 && ", "}
                {materialStats.lowStockItems > 0 && `${materialStats.lowStockItems} items low on stock`}
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
              collectionName="materials"
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
              Add New Material
            </button>
          )}
        </div>
      </div>

      {/* Table component - visible to all users */}
      <div className="overflow-hidden">
        <DisplayMaterialTable
          materials={materials}
          onDelete={isAdmin ? confirmDelete : null}
          onEdit={isAdmin ? handleEditClick : null}
        />
      </div>

      {/* Modals - only rendered for admins */}
      {isAdmin && (
        <>
          {/* Modal for adding/editing material */}
          <Modal
            isOpen={isFormModalOpen}
            onClose={handleCloseModal}
            title={selectedMaterial ? "Edit Material" : "Add New Material"}
            size="lg"
          >
            <AddMaterialForm
              onSubmit={addMaterial}
              selectedMaterial={selectedMaterial}
              onUpdate={updateMaterial}
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
            itemName="material"
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

export default MaterialManagement;
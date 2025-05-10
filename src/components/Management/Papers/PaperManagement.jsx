// import React, { useState, useEffect } from "react";
// import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
// import { db } from "../../../firebaseConfig";
// import AddPaperForm from "./AddPaperForm";
// import DisplayPaperTable from "./DisplayPaperTable";
// import Modal from "../../Shared/Modal";
// import ConfirmationModal from "../../Shared/ConfirmationModal";
// import DeleteConfirmationModal from "../../Shared/DeleteConfirmationModal";
// import { useAuth } from "../../Login/AuthContext";

// const PaperManagement = () => {
//   const { userRole } = useAuth();
//   const [papers, setPapers] = useState([]);
//   const [editingPaper, setEditingPaper] = useState(null);
//   const [isFormModalOpen, setIsFormModalOpen] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [deleteConfirmation, setDeleteConfirmation] = useState({
//     isOpen: false,
//     itemId: null
//   });
//   const [notification, setNotification] = useState({
//     isOpen: false,
//     message: "",
//     title: "",
//     status: "success"
//   });

//   // Check if user is admin
//   const isAdmin = userRole === "admin";

//   // Paper statistics
//   const [paperStats, setPaperStats] = useState({
//     totalPapers: 0,
//     activePapers: 0,
//     weightCategories: 0,
//     averageGSM: 0
//   });

//   // Real-time listener for papers
//   useEffect(() => {
//     const papersCollection = collection(db, "papers");
//     const unsubscribe = onSnapshot(papersCollection, (snapshot) => {
//       const papersData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
      
//       setPapers(papersData);
      
//       // Calculate statistics
//       const uniqueWeights = new Set(papersData.map(paper => paper.gsm)).size;
      
//       const activeCount = papersData.filter(paper => paper.isActive !== false).length;
      
//       const avgGSM = papersData.length > 0
//         ? papersData.reduce((sum, paper) => sum + (parseInt(paper.gsm) || 0), 0) / papersData.length
//         : 0;
      
//       setPaperStats({
//         totalPapers: papersData.length,
//         activePapers: activeCount,
//         weightCategories: uniqueWeights,
//         averageGSM: avgGSM
//       });
      
//       setIsLoading(false);
//     });

//     return () => unsubscribe(); // Cleanup listener on unmount
//   }, []);

//   // Add paper to Firestore
//   const addPaper = async (newPaper) => {
//     setIsSubmitting(true);
//     try {
//       const papersCollection = collection(db, "papers");
//       await addDoc(papersCollection, { 
//         ...newPaper, 
//         timestamp: new Date(),
//         createdAt: new Date(),
//         updatedAt: new Date() 
//       });
      
//       setNotification({
//         isOpen: true,
//         message: "Paper added successfully!",
//         title: "Success",
//         status: "success"
//       });
//       setIsFormModalOpen(false);
//     } catch (error) {
//       console.error("Error adding paper:", error);
      
//       setNotification({
//         isOpen: true,
//         message: "Error adding paper. Please try again.",
//         title: "Error",
//         status: "error"
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Update paper in Firestore
//   const updatePaper = async (id, updatedData) => {
//     setIsSubmitting(true);
//     try {
//       const paperDoc = doc(db, "papers", id);
//       await updateDoc(paperDoc, {
//         ...updatedData,
//         updatedAt: new Date()
//       });
      
//       setNotification({
//         isOpen: true,
//         message: "Paper updated successfully!",
//         title: "Success",
//         status: "success"
//       });
//       setIsFormModalOpen(false);
//       setEditingPaper(null); // Clear the editing state
//     } catch (error) {
//       console.error("Error updating paper:", error);
      
//       setNotification({
//         isOpen: true,
//         message: "Error updating paper. Please try again.",
//         title: "Error",
//         status: "error"
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleAddClick = () => {
//     if (!isAdmin) return;
    
//     setEditingPaper(null); // Ensure we're not in edit mode
//     setIsFormModalOpen(true);
//   };

//   const handleEditClick = (paper) => {
//     if (!isAdmin) return;
    
//     setEditingPaper({...paper}); // Make a copy to ensure we don't modify the original
//     setIsFormModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsFormModalOpen(false);
//     setEditingPaper(null);
//   };

//   const confirmDelete = (id) => {
//     if (!isAdmin) return;
    
//     setDeleteConfirmation({
//       isOpen: true,
//       itemId: id
//     });
//   };

//   const closeDeleteModal = () => {
//     setDeleteConfirmation({
//       isOpen: false,
//       itemId: null
//     });
//   };

//   const closeNotification = () => {
//     setNotification({
//       isOpen: false,
//       message: "",
//       title: "",
//       status: "success"
//     });
//   };

//   const handleDeleteConfirm = async () => {
//     if (!isAdmin) return;
    
//     try {
//       await deleteDoc(doc(db, "papers", deleteConfirmation.itemId));
//       closeDeleteModal();
      
//       setNotification({
//         isOpen: true,
//         message: "Paper deleted successfully!",
//         title: "Success",
//         status: "success"
//       });
//     } catch (error) {
//       console.error("Error deleting paper:", error);
//       closeDeleteModal();
      
//       setNotification({
//         isOpen: true,
//         message: "Error deleting paper. Please try again.",
//         title: "Error",
//         status: "error"
//       });
//     }
//   };

//   // Redirect non-authorized users
//   if (!isAdmin && userRole !== "staff") {
//     return (
//       <div className="p-4 max-w-screen-xl mx-auto">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
//           <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//           </svg>
//           <h2 className="mt-4 text-xl font-bold text-red-800">Unauthorized Access</h2>
//           <p className="mt-2 text-red-600">You don't have permission to access paper management.</p>
//         </div>
//       </div>
//     );
//   }

//   // Loading state
//   if (isLoading) {
//     return (
//       <div className="p-4 max-w-screen-xl mx-auto">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold text-gray-900">Paper Management</h1>
//           <div className="animate-pulse w-64 h-8 bg-gray-200 rounded-md"></div>
//         </div>
//         <div className="animate-pulse space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <div className="h-32 bg-gray-200 rounded-lg"></div>
//             <div className="h-32 bg-gray-200 rounded-lg"></div>
//             <div className="h-32 bg-gray-200 rounded-lg"></div>
//             <div className="h-32 bg-gray-200 rounded-lg"></div>
//           </div>
//           <div className="h-64 bg-gray-200 rounded-lg"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 max-w-screen-xl mx-auto">
//       {/* Page Header */}
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-gray-900">Paper Management</h1>
//         <p className="text-gray-600 mt-1">
//           Manage paper types, specifications, and pricing for printing projects
//         </p>
//       </div>
      
//       {/* Paper Statistics */}
//       {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//         <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//           <h2 className="text-sm font-medium text-gray-500 mb-2">Total Papers</h2>
//           <p className="text-2xl font-bold text-gray-800">{paperStats.totalPapers}</p>
//           <p className="text-xs text-gray-500 mt-1">
//             {paperStats.activePapers} papers currently available
//           </p>
//         </div>
        
//         <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//           <h2 className="text-sm font-medium text-gray-500 mb-2">Weight Categories</h2>
//           <p className="text-2xl font-bold text-blue-600">{paperStats.weightCategories}</p>
//           <p className="text-xs text-gray-500 mt-1">
//             Different GSM options available
//           </p>
//         </div>
        
//         <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//           <h2 className="text-sm font-medium text-gray-500 mb-2">Average GSM</h2>
//           <p className="text-2xl font-bold text-red-600">{Math.round(paperStats.averageGSM)}</p>
//           <p className="text-xs text-gray-500 mt-1">
//             Average paper weight in grams per square meter
//           </p>
//         </div>
        
//         <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//           <h2 className="text-sm font-medium text-gray-500 mb-2">Availability</h2>
//           <p className="text-2xl font-bold text-green-600">
//             {((paperStats.activePapers / paperStats.totalPapers) * 100 || 0).toFixed(1)}%
//           </p>
//           <p className="text-xs text-gray-500 mt-1">
//             Percentage of papers currently available
//           </p>
//         </div>
//       </div> */}

//       {/* Action buttons */}
//       {isAdmin && (
//         <div className="flex justify-end mb-4">
//           <button 
//             onClick={handleAddClick}
//             className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//               <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
//             </svg>
//             Add New Paper
//           </button>
//         </div>
//       )}

//       {/* Table component */}
//       <div className="overflow-hidden">
//         <DisplayPaperTable
//           papers={papers}
//           onEditPaper={isAdmin ? handleEditClick : null}
//           onDeletePaper={isAdmin ? confirmDelete : null}
//         />
//       </div>

//       {/* Modal for adding/editing paper - now with lg size */}
//       {isAdmin && (
//         <>
//           <Modal
//             isOpen={isFormModalOpen}
//             onClose={handleCloseModal}
//             title={editingPaper ? "Edit Paper" : "Add New Paper"}
//             size="lg" // Using the larger size for the form
//           >
//             <AddPaperForm
//               onSubmit={editingPaper ? 
//                 (data) => updatePaper(editingPaper.id, data) : 
//                 addPaper
//               }
//               initialData={editingPaper}
//               isSubmitting={isSubmitting}
//               onCancel={handleCloseModal}
//             />
//           </Modal>

//           {/* Confirmation modals */}
//           <DeleteConfirmationModal
//             isOpen={deleteConfirmation.isOpen}
//             onClose={closeDeleteModal}
//             onConfirm={handleDeleteConfirm}
//             itemName="paper"
//           />
          
//           <ConfirmationModal
//             isOpen={notification.isOpen}
//             onClose={closeNotification}
//             message={notification.message}
//             title={notification.title}
//             status={notification.status}
//           />
//         </>
//       )}
//     </div>
//   );
// };

// export default PaperManagement;

import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import AddPaperForm from "./AddPaperForm";
import DisplayPaperTable from "./DisplayPaperTable";
import Modal from "../../Shared/Modal";
import ConfirmationModal from "../../Shared/ConfirmationModal";
import DeleteConfirmationModal from "../../Shared/DeleteConfirmationModal";
import { useAuth } from "../../Login/AuthContext";
import DBExportImport from "../../Shared/DBExportImport";

const PaperManagement = () => {
  const { userRole } = useAuth();
  const [papers, setPapers] = useState([]);
  const [editingPaper, setEditingPaper] = useState(null);
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

  // Paper statistics
  const [paperStats, setPaperStats] = useState({
    totalPapers: 0,
    activePapers: 0,
    weightCategories: 0,
    averageGSM: 0
  });

  // Real-time listener for papers
  useEffect(() => {
    const papersCollection = collection(db, "papers");
    const unsubscribe = onSnapshot(papersCollection, (snapshot) => {
      const papersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setPapers(papersData);
      
      // Calculate statistics
      const uniqueWeights = new Set(papersData.map(paper => paper.gsm)).size;
      
      const activeCount = papersData.filter(paper => paper.isActive !== false).length;
      
      const avgGSM = papersData.length > 0
        ? papersData.reduce((sum, paper) => sum + (parseInt(paper.gsm) || 0), 0) / papersData.length
        : 0;
      
      setPaperStats({
        totalPapers: papersData.length,
        activePapers: activeCount,
        weightCategories: uniqueWeights,
        averageGSM: avgGSM
      });
      
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Add paper to Firestore
  const addPaper = async (newPaper) => {
    setIsSubmitting(true);
    try {
      const papersCollection = collection(db, "papers");
      await addDoc(papersCollection, { 
        ...newPaper, 
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date() 
      });
      
      setNotification({
        isOpen: true,
        message: "Paper added successfully!",
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

  // Update paper in Firestore
  const updatePaper = async (id, updatedData) => {
    setIsSubmitting(true);
    try {
      const paperDoc = doc(db, "papers", id);
      await updateDoc(paperDoc, {
        ...updatedData,
        updatedAt: new Date()
      });
      
      setNotification({
        isOpen: true,
        message: "Paper updated successfully!",
        title: "Success",
        status: "success"
      });
      setIsFormModalOpen(false);
      setEditingPaper(null); // Clear the editing state
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
    
    setEditingPaper(null); // Ensure we're not in edit mode
    setIsFormModalOpen(true);
  };

  const handleEditClick = (paper) => {
    if (!isAdmin) return;
    
    setEditingPaper({...paper}); // Make a copy to ensure we don't modify the original
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setEditingPaper(null);
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

  const handleDeleteConfirm = async () => {
    if (!isAdmin) return;
    
    try {
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          Manage paper types, specifications, and pricing for printing projects
        </p>
      </div>
      
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
              dateFields={['timestamp', 'createdAt', 'updatedAt']}
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

      {/* Table component */}
      <div className="overflow-hidden">
        <DisplayPaperTable
          papers={papers}
          onEditPaper={isAdmin ? handleEditClick : null}
          onDeletePaper={isAdmin ? confirmDelete : null}
        />
      </div>

      {/* Modal for adding/editing paper - now with lg size */}
      {isAdmin && (
        <>
          <Modal
            isOpen={isFormModalOpen}
            onClose={handleCloseModal}
            title={editingPaper ? "Edit Paper" : "Add New Paper"}
            size="lg" // Using the larger size for the form
          >
            <AddPaperForm
              onSubmit={editingPaper ? 
                (data) => updatePaper(editingPaper.id, data) : 
                addPaper
              }
              initialData={editingPaper}
              isSubmitting={isSubmitting}
              onCancel={handleCloseModal}
            />
          </Modal>

          {/* Confirmation modals */}
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
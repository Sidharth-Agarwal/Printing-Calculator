import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

const ProductionAssignmentModal = ({ order, onClose, onAssignmentUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [productionStaff, setProductionStaff] = useState([]);
  const [assignedStaff, setAssignedStaff] = useState('');
  const [updating, setUpdating] = useState(false);

  // Fetch production staff on component mount
  useEffect(() => {
    const fetchProductionStaff = async () => {
      try {
        // Query users with production role
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("role", "==", "production"));
        const querySnapshot = await getDocs(q);
        
        const staff = [];
        querySnapshot.forEach((doc) => {
          staff.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setProductionStaff(staff);
        
        // Initialize assignment from order data if available
        if (order.productionAssignments && order.productionAssignments.assigned) {
          setAssignedStaff(order.productionAssignments.assigned);
        }
        
      } catch (error) {
        console.error("Error fetching production staff:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductionStaff();
  }, [order]);

  // Save assignment
  const saveAssignments = async () => {
    try {
      setUpdating(true);
      const orderRef = doc(db, "orders", order.id);
      
      const productionAssignments = {
        assigned: assignedStaff
      };
      
      await updateDoc(orderRef, {
        productionAssignments,
        updatedAt: new Date().toISOString()
      });
      
      onAssignmentUpdate(productionAssignments);
      onClose();
    } catch (error) {
      console.error("Error updating assignment:", error);
      alert("Failed to update assignment");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-[60] p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold text-gray-700">Assign Production Staff</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={updating}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mb-4"></div>
              <p className="text-gray-600">Loading staff data...</p>
            </div>
          ) : productionStaff.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-700 font-medium">No production staff found</p>
              <p className="text-sm text-gray-500 mt-1">Add production staff in user management first.</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="mb-3 text-gray-600 text-sm">
                  Assign a production staff member to {order.projectName || "this order"}.
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Production Staff
                </label>
                <select
                  value={assignedStaff}
                  onChange={(e) => setAssignedStaff(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">-- Not Assigned --</option>
                  {productionStaff.map(staff => (
                    <option key={staff.id} value={staff.id}>
                      {staff.displayName || staff.email || "Staff Member"}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Order Details */}
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Order Details</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Project:</span>
                    <span className="ml-1 font-medium">{order.projectName || "Unnamed Project"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Client:</span>
                    <span className="ml-1 font-medium">{order.clientName || "Unknown Client"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-1">{order.jobDetails?.jobType || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Quantity:</span>
                    <span className="ml-1">{order.jobDetails?.quantity || "N/A"}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            disabled={updating}
          >
            Cancel
          </button>
          <button
            onClick={saveAssignments}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            disabled={updating || loading || productionStaff.length === 0}
          >
            {updating ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              "Save Assignment"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductionAssignmentModal;
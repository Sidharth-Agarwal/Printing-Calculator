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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center mt-2">Loading staff data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Assign Production Staff</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {productionStaff.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-600">No production staff found.</p>
            <p className="text-sm text-gray-500 mt-1">Add production staff in user management first.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border rounded-md p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned to
              </label>
              <select
                value={assignedStaff}
                onChange={(e) => setAssignedStaff(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Not Assigned --</option>
                {productionStaff.map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {staff.displayName || staff.email}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={saveAssignments}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={updating}
              >
                {updating ? 'Saving...' : 'Save Assignments'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionAssignmentModal;
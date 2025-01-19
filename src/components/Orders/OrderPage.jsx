import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import OrderDetailsModal from "./OrderDetailsModal";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Define the toggle stages in correct sequence
  const stages = ["Design", "Positives", "Printing", "Quality Check", "Delivery"];

  // Initialize toggles based on current stage
  const initializeToggles = (currentStage) => {
    const toggles = {};
    let enableToggles = true;
    
    stages.forEach((stage) => {
      if (!currentStage || currentStage === "Not started yet") {
        toggles[stage] = false;
      } else {
        toggles[stage] = enableToggles;
        if (stage === currentStage) {
          enableToggles = false;
        }
      }
    });
    
    return toggles;
  };

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "orders"));
        const ordersData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            toggles: data.toggleStates || initializeToggles(data.stage)
          };
        });
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Update Firebase with new stage and toggle states
  const updateFirestoreStage = async (orderId, stage, toggles) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      const docSnapshot = await getDoc(orderRef);

      if (!docSnapshot.exists()) {
        console.error(`Order with ID ${orderId} does not exist in Firestore.`);
        return;
      }

      // Update both stage and toggles in Firestore
      await updateDoc(orderRef, {
        stage,
        toggleStates: toggles
      });

      console.log(`Order ${orderId} updated to stage: ${stage}`);
    } catch (error) {
      console.error("Error updating Firestore stage:", error);
    }
  };

  // Handle toggle click for stages
  const handleToggle = async (orderId, clickedStage, e) => {
    e.stopPropagation(); // Prevent row click event

    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          const updatedToggles = { ...order.toggles };
          let enableToggles = true;

          // Update toggles sequentially
          stages.forEach((stage) => {
            if (enableToggles) {
              updatedToggles[stage] = true;
            } else {
              updatedToggles[stage] = false;
            }

            if (stage === clickedStage) {
              enableToggles = false;
            }
          });

          // Find the last checked stage
          const lastCheckedStage = stages.find(stage => 
            updatedToggles[stage] === true && 
            (stages[stages.indexOf(stage) + 1] === undefined || 
             updatedToggles[stages[stages.indexOf(stage) + 1]] === false)
          ) || "Not started yet";

          // Update Firestore
          updateFirestoreStage(order.id, lastCheckedStage, updatedToggles);

          return {
            ...order,
            toggles: updatedToggles,
            stage: lastCheckedStage
          };
        }
        return order;
      })
    );
  };

  // Handle PDF generation
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const modalContent = document.querySelector('#pdf-content');
      if (!modalContent) {
        throw new Error('Modal content not found');
      }

      const originalOverflow = modalContent.style.overflow;
      const originalHeight = modalContent.style.height;
      modalContent.style.overflow = 'visible';
      modalContent.style.height = 'auto';

      const canvas = await html2canvas(modalContent, {
        scale: 2,
        useCORS: true,
        logging: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        windowWidth: modalContent.scrollWidth,
        windowHeight: modalContent.scrollHeight
      });

      modalContent.style.overflow = originalOverflow;
      modalContent.style.height = originalHeight;

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png', 1.0);

      let heightLeft = imgHeight;
      let position = 0;
      let pageData = imgData;

      pdf.addImage(pageData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(pageData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Generate filename using order details
      const clientName = selectedOrder.clientName || 'Unknown';
      const jobType = selectedOrder.jobDetails?.jobType || 'Unknown';
      const quantity = selectedOrder.jobDetails?.quantity || '0';
      const filename = `${clientName}_${jobType}_${quantity}pcs.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold text-gray-600">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Orders Page</h2>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="table-auto w-full bg-white rounded-lg shadow-md overflow-hidden text-center">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">Client Name</th>
              <th className="px-4 py-2">Project Type</th>
              <th className="px-4 py-2">Quantity</th>
              <th className="px-4 py-2">Delivery Date</th>
              <th className="px-4 py-2">Current Stage</th>
              {stages.map((stage) => (
                <th key={stage} className="px-4 py-2">{stage}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr 
                key={order.id} 
                className="border-b hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedOrder(order)}
              >
                <td className="px-4 py-2 text-blue-600 cursor-pointer">
                  {order.clientName || "N/A"}
                </td>
                <td className="px-4 py-2">{order.jobDetails?.jobType || "N/A"}</td>
                <td className="px-4 py-2">{order.jobDetails?.quantity || "N/A"}</td>
                <td className="px-4 py-2">
                  {order.deliveryDate
                    ? new Date(order.deliveryDate).toLocaleDateString("en-GB")
                    : "Not Specified"}
                </td>
                <td className="px-4 py-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium
                    ${order.stage === "Delivery" ? "bg-green-100 text-green-800" :
                      order.stage === "Not started yet" ? "bg-gray-100 text-gray-800" :
                      "bg-blue-100 text-blue-800"}`}
                  >
                    {order.stage || "Not started yet"}
                  </span>
                </td>
                {stages.map((stage) => (
                  <td key={stage} className="px-4 py-2">
                    <div
                      className="flex items-center justify-center cursor-pointer"
                      onClick={(e) => handleToggle(order.id, stage, e)}
                    >
                      <div
                        className={`w-6 h-6 flex items-center justify-center border rounded-full
                          transition-colors duration-200 ${
                          order.toggles[stage]
                            ? "border-blue-400 bg-blue-500"
                            : "border-gray-300 bg-gray-200"
                        }`}
                      >
                        {order.toggles[stage] && (
                          <div className="w-4 h-4 rounded-full bg-white"></div>
                        )}
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onDownloadPdf={handleDownloadPdf}
          isGeneratingPdf={isGeneratingPdf}
        />
      )}
    </div>
  );
};

export default OrdersPage;
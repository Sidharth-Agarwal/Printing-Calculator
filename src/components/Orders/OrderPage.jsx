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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "orders"));
        const ordersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          toggles: stages.reduce((acc, stage) => {
            acc[stage] = false;
            return acc;
          }, {}),
        }));
        console.log("Fetched Orders:", ordersData);
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateFirestoreStage = async (orderId, stage) => {
    console.log("Updating stage for order ID:", orderId);
    try {
      const orderRef = doc(db, "orders", orderId);
      const docSnapshot = await getDoc(orderRef);

      if (!docSnapshot.exists()) {
        console.error(`Order with ID ${orderId} does not exist in Firestore.`);
        return;
      }

      await updateDoc(orderRef, { stage });
      console.log(`Order ${orderId} updated to stage: ${stage}`);
    } catch (error) {
      console.error("Error updating Firestore stage:", error);
    }
  };

  const handleToggle = (orderId, clickedStage) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          const updatedToggles = { ...order.toggles };
          let enableToggles = true;

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

          const lastCheckedStage = stages.findLast((stage) => updatedToggles[stage]);
          updateFirestoreStage(order.id, lastCheckedStage || "Not started yet");

          return {
            ...order,
            toggles: updatedToggles,
            stage: lastCheckedStage || "Not started yet",
          };
        }
        return order;
      })
    );
  };

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

      const imgWidth = 210;
      const pageHeight = 297;
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

  if (loading) return <p>Loading orders...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Orders Page</h2>

      {/* Orders Table */}
      <table className="table-auto w-full bg-white rounded-lg shadow-md overflow-hidden text-center">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2">Client Name</th>
            <th className="px-4 py-2">Project Type</th>
            <th className="px-4 py-2">Quantity</th>
            <th className="px-4 py-2">Delivery Date</th>
            <th className="px-4 py-2">Design</th>
            <th className="px-4 py-2">Positives</th>
            <th className="px-4 py-2">Printing</th>
            <th className="px-4 py-2">Quality Check</th>
            <th className="px-4 py-2">Delivery</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b">
              <td
                className="px-4 py-2 text-blue-600 cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                {order.clientName || "N/A"}
              </td>
              <td className="px-4 py-2">{order.jobDetails?.jobType || "N/A"}</td>
              <td className="px-4 py-2">{order.jobDetails?.quantity || "N/A"}</td>
              <td className="px-4 py-2">
                {order.deliveryDate
                  ? new Date(order.deliveryDate).toLocaleDateString("en-GB")
                  : "Not Specified"}
              </td>
              {stages.map((stage) => (
                <td key={stage} className="px-4 py-2">
                  <div
                    className="flex items-center justify-center cursor-pointer"
                    onClick={() => handleToggle(order.id, stage)}
                  >
                    <div
                      className={`w-6 h-6 flex items-center justify-center border rounded-full ${
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
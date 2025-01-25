import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import OrderDetailsModal from "./OrderDetailsModal";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const stages = ["Design", "Positives", "Printing", "Quality Check", "Delivery"];

  const stageColors = {
    "Design": "bg-yellow-100 text-yellow-800",
    "Positives": "bg-orange-100 text-orange-800", 
    "Printing": "bg-purple-100 text-purple-800",
    "Quality Check": "bg-blue-100 text-blue-800",
    "Delivery": "bg-green-100 text-green-800"
  };

  useEffect(() => {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("lastUpdated", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const orderMap = new Map();
        
        snapshot.docs.forEach(doc => {
          const orderData = { id: doc.id, ...doc.data() };
          const key = `${orderData.clientName}_${orderData.jobDetails?.jobType}_${orderData.jobDetails?.quantity}`;
          
          if (!orderMap.has(key) || 
              new Date(orderData.lastUpdated) > new Date(orderMap.get(key).lastUpdated)) {
            orderMap.set(key, orderData);
          }
        });

        setOrders(Array.from(orderMap.values()));
      } catch (error) {
        console.error("Error loading orders:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleToggle = async (orderId, clickedStage, e) => {
    e.stopPropagation();
    
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    try {
      const updatedToggles = { ...order.toggleStates } || {};
      stages.forEach(stage => {
        const stageIndex = stages.indexOf(stage);
        const clickedIndex = stages.indexOf(clickedStage);
        updatedToggles[stage] = stageIndex <= clickedIndex;
      });

      const lastCheckedStage = stages.find(stage => 
        updatedToggles[stage] === true && 
        (!stages[stages.indexOf(stage) + 1] || !updatedToggles[stages[stages.indexOf(stage) + 1]])
      ) || "Not started yet";

      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        stage: lastCheckedStage,
        toggleStates: updatedToggles,
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error("Error updating stage:", error);
      alert("Failed to update stage. Please try again.");
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedOrder) return;
    
    setIsGeneratingPdf(true);
    try {
      const modalContent = document.querySelector('#pdf-content');
      if (!modalContent) throw new Error('Modal content not found');

      const canvas = await html2canvas(modalContent, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      
      const filename = `${selectedOrder.clientName || 'Unknown'}_Order.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading orders...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Orders Page</h2>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">Client Name</th>
              <th className="px-4 py-2">Project Type</th>
              <th className="px-4 py-2">Quantity</th>
              <th className="px-4 py-2">Delivery Date</th>
              <th className="px-4 py-2">Current Stage</th>
              {stages.map(stage => (
                <th key={stage} className="px-4 py-2">{stage}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr 
                key={order.id} 
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <td className="px-4 py-2 text-blue-600">{order.clientName || "N/A"}</td>
                <td className="px-4 py-2">{order.jobDetails?.jobType || "N/A"}</td>
                <td className="px-4 py-2">{order.jobDetails?.quantity || "N/A"}</td>
                <td className="px-4 py-2">
                  {order.deliveryDate
                    ? new Date(order.deliveryDate).toLocaleDateString("en-GB")
                    : "Not Specified"}
                </td>
                <td className="px-4 py-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium
                    ${order.stage && stageColors[order.stage] 
                      ? stageColors[order.stage] 
                      : "bg-gray-100 text-gray-800"}`}
                  >
                    {order.stage || "Not started yet"}
                  </span>
                </td>
                {stages.map((stage) => (
                  <td key={stage} className="px-4 py-2">
                    <div
                      className="flex justify-center"
                      onClick={(e) => handleToggle(order.id, stage, e)}
                    >
                      <div className={`w-6 h-6 flex items-center justify-center border rounded-full
                        ${order.toggleStates?.[stage]
                          ? "border-blue-400 bg-blue-500"
                          : "border-gray-300 bg-gray-200"}`}
                      >
                        {order.toggleStates?.[stage] && (
                          <div className="w-4 h-4 rounded-full bg-white"/>
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
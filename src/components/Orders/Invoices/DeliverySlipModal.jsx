import React, { useState, useRef, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import DeliverySlipTemplate from './DeliverySlipTemplate';

const DeliverySlipModal = ({ orders, onClose, selectedOrderIds }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [deliveryData, setDeliveryData] = useState({
    date: new Date().toISOString().split('T')[0],
    deliveryDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const contentRef = useRef(null);
  
  // Add state for refreshed orders with complete data
  const [refreshedOrders, setRefreshedOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  // Fetch complete order data from Firebase
  useEffect(() => {
    const fetchCompleteOrderData = async () => {
      if (!Array.isArray(orders) || orders.length === 0) {
        setLoadingOrders(false);
        return;
      }
      
      console.log('Fetching complete order data for Delivery Slip:', orders.length, 'orders');
      
      try {
        const completeOrders = await Promise.all(
          orders.map(async (order) => {
            if (!order.id) return order;
            
            try {
              const orderDoc = await getDoc(doc(db, "orders", order.id));
              if (orderDoc.exists()) {
                const completeOrderData = orderDoc.data();
                console.log(`Delivery Slip - Order ${order.id} serial:`, completeOrderData.orderSerial);
                return {
                  id: order.id,
                  ...completeOrderData
                };
              }
            } catch (error) {
              console.error(`Error fetching order ${order.id}:`, error);
            }
            
            return order; // Return original order if fetch fails
          })
        );
        
        setRefreshedOrders(completeOrders);
        console.log('Delivery Slip - Refreshed orders with complete data:', completeOrders);
        
      } catch (error) {
        console.error('Error fetching complete order data:', error);
        setRefreshedOrders(orders); // Fall back to original orders
      } finally {
        setLoadingOrders(false);
      }
    };
    
    fetchCompleteOrderData();
  }, [orders]);
  
  // Use refreshed orders instead of original orders
  const ordersToUse = refreshedOrders.length > 0 ? refreshedOrders : orders;
  
  // Get client info (all orders should be from the same client)
  const clientInfo = ordersToUse.length > 0 ? {
    name: ordersToUse[0].clientName || ordersToUse[0].clientInfo?.name,
    clientCode: ordersToUse[0].clientInfo?.clientCode || 'N/A',
    address: ordersToUse[0].clientInfo?.address || {},
    id: ordersToUse[0].clientId,
    clientType: ordersToUse[0].clientInfo?.clientType || 'Direct'
  } : { name: 'Unknown Client', id: 'unknown', clientCode: 'N/A', address: {} };
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Generate PDF
  const generatePDF = async () => {
    if (!contentRef.current) return;
    
    setIsGeneratingPDF(true);
    try {
      // Wait for any images to load
      const images = contentRef.current.querySelectorAll('img');
      const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
      });
      
      await Promise.all(imagePromises);
      
      // Clone the element for PDF generation to avoid affecting the display
      const originalElement = contentRef.current;
      const clonedElement = originalElement.cloneNode(true);
      
      // Temporarily add the cloned element to the body with fixed dimensions
      clonedElement.style.position = 'absolute';
      clonedElement.style.top = '-9999px';
      clonedElement.style.left = '-9999px';
      clonedElement.style.width = '800px'; // Fixed width for PDF generation
      document.body.appendChild(clonedElement);
      
      // Generate PDF
      const canvas = await html2canvas(clonedElement, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        allowTaint: true,
        imageTimeout: 0
      });
      
      // Remove the cloned element
      document.body.removeChild(clonedElement);
      
      // Calculate aspect ratio to determine orientation
      const aspectRatio = canvas.width / canvas.height;
      const orientation = aspectRatio > 1 ? 'landscape' : 'portrait';
      
      // Create PDF with the appropriate orientation
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4'
      });
      
      // Get PDF dimensions
      const pdfWidth = orientation === 'landscape' ? 297 : 210; // A4 width in mm
      const pdfHeight = orientation === 'landscape' ? 210 : 297; // A4 height in mm
      
      // Calculate image dimensions to fit in PDF
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If the image height exceeds the PDF height, adjust scale to fit
      if (imgHeight > pdfHeight) {
        const scale = pdfHeight / imgHeight;
        const adjustedWidth = pdfWidth * scale;
        const adjustedHeight = pdfHeight;
        
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 1.0),
          'JPEG',
          (pdfWidth - adjustedWidth) / 2, // Center horizontally
          0,
          adjustedWidth,
          adjustedHeight
        );
      } else {
        // Image fits, add it to PDF
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 1.0),
          'JPEG',
          0,
          (pdfHeight - imgHeight) / 2, // Center vertically
          imgWidth,
          imgHeight
        );
      }
      
      // Save the PDF
      pdf.save(`DeliverySlip_${clientInfo.name}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
      
      onClose();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  // Calculate total quantity
  const totalQuantity = ordersToUse.reduce((total, order) => {
    return total + (parseInt(order.jobDetails?.quantity) || 0);
  }, 0);
  
  // Show loading state while fetching complete order data
  if (loadingOrders) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-700">Loading complete order data...</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Generate Delivery Slip
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:bg-blue-400"
            >
              {isGeneratingPDF ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>Download Delivery Slip</>
              )}
            </button>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isGeneratingPDF}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Modal Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Delivery Slip Controls - Reduced width */}
          <div className="p-4 md:w-1/4 overflow-y-auto border-r border-gray-200">
            <div className="space-y-3">
              <h3 className="text-md font-medium">Delivery Slip Details</h3>
              
              <div>
                <label className="block text-xs font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  name="date"
                  value={deliveryData.date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700">Delivery/Pickup Date</label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={deliveryData.deliveryDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700">Additional Notes</label>
                <textarea
                  name="notes"
                  value={deliveryData.notes}
                  onChange={handleInputChange}
                  rows="2"
                  className="mt-1 block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any additional delivery instructions"
                ></textarea>
              </div>
              
              {/* Orders Summary */}
              <div className="mt-4 bg-gray-50 p-3 rounded-lg text-xs">
                <h4 className="font-medium text-gray-700 mb-2">Order Summary</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Total Orders:</span>
                    <span className="font-mono">{ordersToUse.length}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Total Quantity:</span>
                    <span className="font-mono">{totalQuantity}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Client:</span>
                    <span className="font-mono">{clientInfo.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Delivery Slip Preview - Expanded */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-4">
              <div ref={contentRef} className="bg-white shadow-lg rounded-lg overflow-hidden">
                <DeliverySlipTemplate
                  deliveryData={deliveryData}
                  orders={ordersToUse}
                  clientInfo={clientInfo}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliverySlipModal;
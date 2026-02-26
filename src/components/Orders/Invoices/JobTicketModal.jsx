import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { doc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import JobTicket from './JobTicket';

const JobTicketModal = ({ orders, onClose, selectedOrderIds, onUpdateOrders }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const leftTicketRef = useRef(null);
  const rightTicketRef = useRef(null);
  
  const [ticketNotes, setTicketNotes] = useState({});
  const [refreshedOrders, setRefreshedOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  useEffect(() => {
    const fetchCompleteOrderData = async () => {
      if (!Array.isArray(orders) || orders.length === 0) {
        setLoadingOrders(false);
        return;
      }
      
      console.log('Fetching complete order data for', orders.length, 'orders');
      
      try {
        const completeOrders = await Promise.all(
          orders.map(async (order) => {
            if (!order.id) return order;
            
            try {
              const orderDoc = await getDoc(doc(db, "orders", order.id));
              if (orderDoc.exists()) {
                const completeOrderData = orderDoc.data();
                console.log(`Order ${order.id} production assignments:`, completeOrderData.productionAssignments);

                // ✅ FIX: Fetch the live die image from the dies collection
                const dieCode = completeOrderData.dieDetails?.dieCode;
                if (dieCode) {
                  try {
                    const diesQuery = query(
                      collection(db, "dies"),
                      where("dieCode", "==", dieCode)
                    );
                    const dieSnap = await getDocs(diesQuery);
                    if (!dieSnap.empty) {
                      const liveImageUrl = dieSnap.docs[0].data().imageUrl;
                      // Override the stale image URL stored on the order
                      // Use empty string (not null) so hasValidImage correctly returns false
                      completeOrderData.dieDetails = {
                        ...completeOrderData.dieDetails,
                        image: liveImageUrl || "",
                      };
                    }
                  } catch (dieError) {
                    console.error(`Error fetching die data for dieCode ${dieCode}:`, dieError);
                    // Non-fatal: fall through and use whatever is stored on the order
                  }
                }

                return {
                  id: order.id,
                  ...completeOrderData
                };
              }
            } catch (error) {
              console.error(`Error fetching order ${order.id}:`, error);
            }
            
            return order;
          })
        );
        
        setRefreshedOrders(completeOrders);
        console.log('Refreshed orders with production assignments:', completeOrders);
        
      } catch (error) {
        console.error('Error fetching complete order data:', error);
        setRefreshedOrders(orders);
      } finally {
        setLoadingOrders(false);
      }
    };
    
    fetchCompleteOrderData();
  }, [orders]);
  
  useEffect(() => {
    if (!Array.isArray(refreshedOrders)) return;
    
    const initialNotes = {};
    refreshedOrders.forEach(order => {
      if (order && order.id) {
        initialNotes[order.id] = order.notes || '';
      }
    });
    setTicketNotes(initialNotes);
  }, [refreshedOrders]);
  
  const handleNotesChange = (orderId, value) => {
    if (!orderId) return;
    
    setTicketNotes(prev => ({
      ...prev,
      [orderId]: value
    }));
    
    if (onUpdateOrders && Array.isArray(refreshedOrders)) {
      const updatedOrder = refreshedOrders.find(order => order.id === orderId);
      if (updatedOrder) {
        onUpdateOrders({
          ...updatedOrder,
          notes: value
        });
      }
    }
  };
  
  const ordersToUse = refreshedOrders.length > 0 ? refreshedOrders : orders;
  
  const leftOrder = Array.isArray(ordersToUse) && ordersToUse.length > currentPairIndex * 2 ? 
    ordersToUse[currentPairIndex * 2] : null;
  
  const rightOrder = Array.isArray(ordersToUse) && ordersToUse.length > currentPairIndex * 2 + 1 ? 
    ordersToUse[currentPairIndex * 2 + 1] : null;
  
  const goToNextPair = () => {
    if (!Array.isArray(ordersToUse)) return;
    const maxPairIndex = Math.ceil(ordersToUse.length / 2) - 1;
    if (currentPairIndex < maxPairIndex) {
      setCurrentPairIndex(currentPairIndex + 1);
    }
  };
  
  const goToPreviousPair = () => {
    if (currentPairIndex > 0) {
      setCurrentPairIndex(currentPairIndex - 1);
    }
  };
  
  const generateCurrentPDF = async () => {
    if (!leftTicketRef.current || !leftOrder) return;
    
    setIsGeneratingPDF(true);
    try {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '900px';
      container.style.display = 'flex';
      container.style.flexDirection = 'row';
      container.style.justifyContent = 'space-between';
      container.style.backgroundColor = 'white';
      container.style.padding = '20px';
      
      const leftClone = leftTicketRef.current.cloneNode(true);
      container.appendChild(leftClone);
      
      if (rightTicketRef.current && rightOrder) {
        const rightClone = rightTicketRef.current.cloneNode(true);
        container.appendChild(rightClone);
      }
      
      document.body.appendChild(container);
      
      const allImages = Array.from(container.querySelectorAll('img'));
      const imagePromises = allImages.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      
      await Promise.all(imagePromises);
      
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        imageTimeout: 0
      });
      
      document.body.removeChild(container);
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = 297;
      const pdfHeight = 210;
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0),
        'JPEG',
        0,
        0,
        imgWidth,
        imgHeight <= pdfHeight ? imgHeight : pdfHeight
      );
      
      const filename = rightOrder 
        ? `JobTickets_${leftOrder.projectName || leftOrder.id}_and_${rightOrder.projectName || rightOrder.id}.pdf`
        : `JobTicket_${leftOrder.projectName || leftOrder.id}.pdf`;
      
      pdf.save(filename);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  const generateAllPDFs = async () => {
    if (!Array.isArray(ordersToUse) || ordersToUse.length === 0) return;
    
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = 297;
      const pdfHeight = 210;
      let isFirstPage = true;
      
      for (let i = 0; i < ordersToUse.length; i += 2) {
        const leftOrder = ordersToUse[i];
        const rightOrder = i + 1 < ordersToUse.length ? ordersToUse[i + 1] : null;
        
        if (!leftOrder) continue;
        
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '-9999px';
        container.style.left = '-9999px';
        container.style.width = '900px';
        container.style.display = 'flex';
        container.style.flexDirection = 'row';
        container.style.justifyContent = 'space-between';
        container.style.backgroundColor = 'white';
        container.style.padding = '20px';
        
        const leftElement = document.createElement('div');
        const leftTicketRoot = createRoot(leftElement);
        leftTicketRoot.render(
          <JobTicket 
            order={{
              ...leftOrder,
              notes: ticketNotes[leftOrder.id] || ''
            }}
          />
        );
        
        let rightElement = null;
        if (rightOrder) {
          rightElement = document.createElement('div');
          const rightTicketRoot = createRoot(rightElement);
          rightTicketRoot.render(
            <JobTicket 
              order={{
                ...rightOrder,
                notes: ticketNotes[rightOrder.id] || ''
              }}
            />
          );
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        container.appendChild(leftElement);
        if (rightElement) {
          container.appendChild(rightElement);
        }
        
        document.body.appendChild(container);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const allImages = Array.from(container.querySelectorAll('img'));
        const imagePromises = allImages.map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        });
        
        await Promise.all(imagePromises);
        
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          imageTimeout: 0
        });
        
        document.body.removeChild(container);
        
        if (!isFirstPage) {
          pdf.addPage();
        } else {
          isFirstPage = false;
        }
        
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 1.0),
          'JPEG',
          0,
          0,
          imgWidth,
          imgHeight <= pdfHeight ? imgHeight : pdfHeight
        );
      }
      
      pdf.save(`JobTickets_Batch_${new Date().getTime()}.pdf`);
      onClose();
      
    } catch (error) {
      console.error("Error generating PDFs:", error);
      alert("Failed to generate PDFs. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  if (loadingOrders) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-700">Loading complete order data...</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (!leftOrder) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">No valid orders found</h2>
          <p className="text-gray-600 mb-4">Please select valid orders to generate job tickets.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Generate Job Ticket {Array.isArray(ordersToUse) && ordersToUse.length > 1 ? 
              `(Pair ${currentPairIndex + 1}/${Math.ceil(ordersToUse.length/2)})` : ''}
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={generateCurrentPDF}
              disabled={isGeneratingPDF}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 flex items-center gap-2 disabled:bg-green-400"
            >
              {isGeneratingPDF ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>Download Current Pair</>
              )}
            </button>
            
            {Array.isArray(ordersToUse) && ordersToUse.length > 2 && (
              <button
                onClick={generateAllPDFs}
                disabled={isGeneratingPDF}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:bg-blue-400"
              >
                {isGeneratingPDF ? <>Processing...</> : <>Download All Tickets</>}
              </button>
            )}
            
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
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
            <div className="flex gap-4 justify-center items-start">
              {/* Left Job Ticket */}
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div ref={leftTicketRef}>
                  <JobTicket 
                    order={{
                      ...leftOrder,
                      notes: ticketNotes[leftOrder.id] || ''
                    }}
                  />
                </div>
                <div className="p-4 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes for Job #{leftOrder.id?.substring(0, 8) || 'N/A'}
                  </label>
                  <textarea
                    value={ticketNotes[leftOrder.id] || ''}
                    onChange={(e) => handleNotesChange(leftOrder.id, e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 h-24 text-sm"
                    placeholder="Add any special instructions or notes for this job..."
                  />
                </div>
              </div>
              
              {/* Right Job Ticket */}
              {rightOrder ? (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <div ref={rightTicketRef}>
                    <JobTicket 
                      order={{
                        ...rightOrder,
                        notes: ticketNotes[rightOrder.id] || ''
                      }}
                    />
                  </div>
                  <div className="p-4 border-t">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes for Job #{rightOrder.id?.substring(0, 8) || 'N/A'}
                    </label>
                    <textarea
                      value={ticketNotes[rightOrder.id] || ''}
                      onChange={(e) => handleNotesChange(rightOrder.id, e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 h-24 text-sm"
                      placeholder="Add any special instructions or notes for this job..."
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 border border-dashed border-gray-300 rounded-lg p-8 flex items-center justify-center" style={{ width: '430px', height: '400px' }}>
                  <span className="text-gray-500">No second ticket for this pair</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Pagination Controls */}
          {Array.isArray(ordersToUse) && ordersToUse.length > 2 && (
            <div className="flex justify-between p-4 border-t">
              <button
                onClick={goToPreviousPair}
                disabled={currentPairIndex === 0 || isGeneratingPDF}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Previous Pair
              </button>
              <span className="text-gray-600">
                Pair {currentPairIndex + 1} of {Math.ceil(ordersToUse.length/2)}
              </span>
              <button
                onClick={goToNextPair}
                disabled={currentPairIndex >= Math.ceil(ordersToUse.length/2) - 1 || isGeneratingPDF}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Next Pair
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobTicketModal;
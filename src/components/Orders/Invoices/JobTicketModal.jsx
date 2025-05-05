import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import JobTicket from './JobTicket';

const JobTicketModal = ({ orders, onClose, selectedOrderIds, onUpdateOrders }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [currentTicketIndex, setCurrentTicketIndex] = useState(0);
  const contentRef = useRef(null);
  const secondTicketRef = useRef(null);
  
  // Add new state for notes
  const [ticketNotes, setTicketNotes] = useState({});
  
  // Initialize notes for each order
  useEffect(() => {
    if (!Array.isArray(orders)) return;
    
    const initialNotes = {};
    orders.forEach(order => {
      if (order && order.id) {
        initialNotes[order.id] = order.notes || '';
      }
    });
    setTicketNotes(initialNotes);
  }, [orders]);
  
  // Handle notes change
  const handleNotesChange = (orderId, value) => {
    if (!orderId) return;
    
    setTicketNotes(prev => ({
      ...prev,
      [orderId]: value
    }));
    
    // If onUpdateOrders is provided, call it to persist notes to the database
    if (onUpdateOrders && Array.isArray(orders)) {
      const updatedOrder = orders.find(order => order.id === orderId);
      if (updatedOrder) {
        onUpdateOrders({
          ...updatedOrder,
          notes: value
        });
      }
    }
  };
  
  // Get the current order being displayed
  const currentOrder = Array.isArray(orders) && orders.length > currentTicketIndex ? 
    orders[currentTicketIndex] : null;
  
  // Get the next order if available (for two-up display)
  const nextOrder = Array.isArray(orders) && orders.length > currentTicketIndex + 1 ? 
    orders[currentTicketIndex + 1] : null;
  
  // Navigate between job tickets (by pairs)
  const goToNextTicket = () => {
    if (!Array.isArray(orders)) return;
    
    if (currentTicketIndex < orders.length - 2) {
      setCurrentTicketIndex(currentTicketIndex + 2);
    } else if (currentTicketIndex < orders.length - 1) {
      setCurrentTicketIndex(currentTicketIndex + 1);
    }
  };
  
  const goToPreviousTicket = () => {
    if (currentTicketIndex >= 2) {
      setCurrentTicketIndex(currentTicketIndex - 2);
    } else if (currentTicketIndex > 0) {
      setCurrentTicketIndex(currentTicketIndex - 1);
    }
  };
  
  // Generate PDF for current job ticket pair
  const generateSinglePDF = async () => {
    if (!contentRef.current || !currentOrder) return;
    
    setIsGeneratingPDF(true);
    try {
      // Wait for any images to load in both tickets
      const allContainers = [contentRef.current];
      if (secondTicketRef.current && nextOrder) allContainers.push(secondTicketRef.current);
      
      const allImages = allContainers.flatMap(container => 
        Array.from(container.querySelectorAll('img'))
      );
      
      const imagePromises = allImages.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = resolve; // Use resolve for errors too, to continue even if an image fails
        });
      });
      
      await Promise.all(imagePromises);
      
      // Create container for both tickets
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '800px';
      container.style.padding = '20px';
      container.style.backgroundColor = 'white';
      
      // Clone the first ticket
      const firstClone = contentRef.current.cloneNode(true);
      container.appendChild(firstClone);
      
      // Add separator
      const separator = document.createElement('div');
      separator.style.height = '30px';
      container.appendChild(separator);
      
      // Clone the second ticket if it exists
      if (secondTicketRef.current && nextOrder) {
        const secondClone = secondTicketRef.current.cloneNode(true);
        container.appendChild(secondClone);
      }
      
      document.body.appendChild(container);
      
      // Generate PDF
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        imageTimeout: 0
      });
      
      document.body.removeChild(container);
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Get PDF dimensions
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      
      // Calculate image dimensions to fit in PDF
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0),
        'JPEG',
        0,
        0,
        imgWidth,
        imgHeight <= pdfHeight ? imgHeight : pdfHeight // Ensure it fits on the page
      );
      
      // Save the PDF
      const filename = nextOrder 
        ? `JobTickets_${currentOrder.projectName || currentOrder.id}_and_${nextOrder.projectName || nextOrder.id}.pdf`
        : `JobTicket_${currentOrder.projectName || currentOrder.id}.pdf`;
      
      pdf.save(filename);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  // Generate PDF for all selected job tickets
  const generateAllPDFs = async () => {
    if (!Array.isArray(orders) || orders.length === 0) return;
    
    setIsGeneratingPDF(true);
    try {
      // Create a combined PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      let isFirstPage = true;
      
      // Process each pair of orders
      for (let i = 0; i < orders.length; i += 2) {
        // Get the current pair of orders
        const firstOrder = orders[i];
        const secondOrder = i + 1 < orders.length ? orders[i + 1] : null;
        
        if (!firstOrder) continue;
        
        // Create container for both tickets
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '-9999px';
        container.style.left = '-9999px';
        container.style.width = '800px';
        container.style.padding = '20px';
        container.style.backgroundColor = 'white';
        
        // Create first ticket element
        const firstElement = document.createElement('div');
        firstElement.className = 'bg-white shadow-lg rounded-lg overflow-hidden';
        
        // Render the first job ticket
        const firstTicket = document.createElement('div');
        ReactDOM.render(
          <JobTicket 
            order={{
              ...firstOrder,
              notes: ticketNotes[firstOrder.id] || ''
            }}
          />,
          firstTicket
        );
        
        firstElement.appendChild(firstTicket);
        container.appendChild(firstElement);
        
        // Add separator
        const separator = document.createElement('div');
        separator.style.height = '30px';
        container.appendChild(separator);
        
        // Create second ticket element if needed
        if (secondOrder) {
          const secondElement = document.createElement('div');
          secondElement.className = 'bg-white shadow-lg rounded-lg overflow-hidden';
          
          // Render the second job ticket
          const secondTicket = document.createElement('div');
          ReactDOM.render(
            <JobTicket 
              order={{
                ...secondOrder,
                notes: ticketNotes[secondOrder.id] || ''
              }}
            />,
            secondTicket
          );
          
          secondElement.appendChild(secondTicket);
          container.appendChild(secondElement);
        }
        
        document.body.appendChild(container);
        
        // Wait for a moment to ensure rendering completes
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Generate image of the job tickets
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          imageTimeout: 0
        });
        
        document.body.removeChild(container);
        
        // Add a new page if not the first ticket
        if (!isFirstPage) {
          pdf.addPage();
        } else {
          isFirstPage = false;
        }
        
        // Get PDF dimensions
        const pdfWidth = 210; // A4 width in mm
        const pdfHeight = 297; // A4 height in mm
        
        // Calculate image dimensions to fit in PDF
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 1.0),
          'JPEG',
          0,
          0,
          imgWidth,
          imgHeight <= pdfHeight ? imgHeight : pdfHeight // Ensure it fits on the page
        );
      }
      
      // Save the combined PDF
      pdf.save(`JobTickets_Batch_${new Date().getTime()}.pdf`);
      onClose();
      
    } catch (error) {
      console.error("Error generating PDFs:", error);
      alert("Failed to generate PDFs. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  if (!currentOrder) {
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Generate Job Ticket {Array.isArray(orders) && orders.length > 1 ? 
              `(${Math.floor(currentTicketIndex/2) + 1}/${Math.ceil(orders.length/2)})` : ''}
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={generateSinglePDF}
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
                <>Download Current Page</>
              )}
            </button>
            
            {Array.isArray(orders) && orders.length > 1 && (
              <button
                onClick={generateAllPDFs}
                disabled={isGeneratingPDF}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:bg-blue-400"
              >
                {isGeneratingPDF ? (
                  <>Processing...</>
                ) : (
                  <>Download All Tickets</>
                )}
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
          {/* Job Ticket Previews */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-4 space-y-4">
              {/* First Job Ticket */}
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div ref={contentRef}>
                  <JobTicket 
                    order={{
                      ...currentOrder,
                      notes: ticketNotes[currentOrder.id] || ''
                    }}
                  />
                </div>
                
                {/* Notes for first ticket */}
                <div className="p-4 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes for Job #{currentOrder.id?.substring(0, 8) || 'N/A'}
                  </label>
                  <textarea
                    value={ticketNotes[currentOrder.id] || ''}
                    onChange={(e) => handleNotesChange(currentOrder.id, e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 h-24 text-sm"
                    placeholder="Add any special instructions or notes for this job..."
                  />
                </div>
              </div>
              
              {/* Second Job Ticket (if available) */}
              {nextOrder && (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <div ref={secondTicketRef}>
                    <JobTicket 
                      order={{
                        ...nextOrder,
                        notes: ticketNotes[nextOrder.id] || ''
                      }}
                    />
                  </div>
                  
                  {/* Notes for second ticket */}
                  <div className="p-4 border-t">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes for Job #{nextOrder.id?.substring(0, 8) || 'N/A'}
                    </label>
                    <textarea
                      value={ticketNotes[nextOrder.id] || ''}
                      onChange={(e) => handleNotesChange(nextOrder.id, e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 h-24 text-sm"
                      placeholder="Add any special instructions or notes for this job..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Pagination Controls - Updated for two tickets per page */}
          {Array.isArray(orders) && orders.length > 2 && (
            <div className="flex justify-between p-4 border-t">
              <button
                onClick={goToPreviousTicket}
                disabled={currentTicketIndex === 0 || isGeneratingPDF}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-600">
                {Math.floor(currentTicketIndex/2) + 1} of {Math.ceil(orders.length/2)}
              </span>
              <button
                onClick={goToNextTicket}
                disabled={currentTicketIndex >= orders.length - 1 || isGeneratingPDF}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobTicketModal;
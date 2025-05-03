import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import CompactJobTicket from './CompactJobTicket';

const JobTicketModal = ({ orders, onClose, selectedOrderIds }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [currentTicketIndex, setCurrentTicketIndex] = useState(0);
  const contentRef = useRef(null);
  
  // Get the current order being displayed
  const currentOrder = orders[currentTicketIndex];
  
  // Navigate between job tickets
  const goToNextTicket = () => {
    if (currentTicketIndex < orders.length - 1) {
      setCurrentTicketIndex(currentTicketIndex + 1);
    }
  };
  
  const goToPreviousTicket = () => {
    if (currentTicketIndex > 0) {
      setCurrentTicketIndex(currentTicketIndex - 1);
    }
  };
  
  // Generate PDF for current job ticket
  const generateSinglePDF = async () => {
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
      
      // Clone the element for PDF generation
      const originalElement = contentRef.current;
      const clonedElement = originalElement.cloneNode(true);
      
      clonedElement.style.position = 'absolute';
      clonedElement.style.top = '-9999px';
      clonedElement.style.left = '-9999px';
      clonedElement.style.width = '800px';
      document.body.appendChild(clonedElement);
      
      // Generate PDF
      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        imageTimeout: 0
      });
      
      document.body.removeChild(clonedElement);
      
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
        imgHeight
      );
      
      // Save the PDF
      pdf.save(`JobTicket_${currentOrder.projectName || currentOrder.id}.pdf`);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  // Generate PDF for all selected job tickets
  const generateAllPDFs = async () => {
    setIsGeneratingPDF(true);
    try {
      // Create a combined PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      let isFirstPage = true;
      
      // Process each order
      for (let i = 0; i < orders.length; i++) {
        // Update current ticket index to render the correct order
        setCurrentTicketIndex(i);
        
        // Wait a bit for the component to re-render
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!contentRef.current) continue;
        
        // Clone the element for PDF generation
        const originalElement = contentRef.current;
        const clonedElement = originalElement.cloneNode(true);
        
        clonedElement.style.position = 'absolute';
        clonedElement.style.top = '-9999px';
        clonedElement.style.left = '-9999px';
        clonedElement.style.width = '800px';
        document.body.appendChild(clonedElement);
        
        // Generate image of the job ticket
        const canvas = await html2canvas(clonedElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          imageTimeout: 0
        });
        
        document.body.removeChild(clonedElement);
        
        // Get PDF dimensions
        const pdfWidth = 210; // A4 width in mm
        const pdfHeight = 297; // A4 height in mm
        
        // Calculate image dimensions to fit in PDF
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add a new page if not the first ticket
        if (!isFirstPage) {
          pdf.addPage();
        } else {
          isFirstPage = false;
        }
        
        // Add the job ticket to PDF
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 1.0),
          'JPEG',
          0,
          0,
          imgWidth,
          imgHeight
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
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Generate Job Ticket {orders.length > 1 ? `(${currentTicketIndex + 1}/${orders.length})` : ''}
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
                <>Download Current Ticket</>
              )}
            </button>
            
            {orders.length > 1 && (
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
          {/* Job Ticket Preview */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-4">
              <div ref={contentRef} className="bg-white shadow-lg rounded-lg overflow-hidden">
                <CompactJobTicket order={currentOrder} />
              </div>
            </div>
          </div>
          
          {/* Pagination Controls */}
          {orders.length > 1 && (
            <div className="flex justify-between p-4 border-t">
              <button
                onClick={goToPreviousTicket}
                disabled={currentTicketIndex === 0 || isGeneratingPDF}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-600">
                {currentTicketIndex + 1} of {orders.length}
              </span>
              <button
                onClick={goToNextTicket}
                disabled={currentTicketIndex === orders.length - 1 || isGeneratingPDF}
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
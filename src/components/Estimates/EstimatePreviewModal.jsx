import React from 'react';

const EstimatePreviewModal = ({ isOpen, onClose, onDownload, isGeneratingPDF, error, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Preview Customer Estimate
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={onDownload}
              disabled={isGeneratingPDF}
              className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 flex items-center gap-2 disabled:bg-blue-300"
            >
              {isGeneratingPDF ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close"
              disabled={isGeneratingPDF}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-100">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">PDF Generation Failed</h3>
                <div className="mt-1 text-sm text-red-700">
                  <p>{error}</p>
                  <p className="mt-1">Try again or use browser's print function as an alternative.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Content - Scrollable */}
        <div className="p-6 overflow-y-auto">
          <div className="bg-white shadow rounded-lg p-4 relative">
            {isGeneratingPDF && (
              <div className="absolute inset-0 bg-white bg-opacity-40 flex items-center justify-center z-10">
                <div className="p-4 bg-white bg-opacity-90 rounded-lg shadow-lg text-center">
                  <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
                  <p className="mt-2 text-blue-600">Please wait while we generate your PDF...</p>
                </div>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimatePreviewModal;
import React from "react";
import ClientSelection from "./ClientSelection";
import ClientReadOnly from './ClientReadOnly';
import VersionSelection from "./VersionSelection";
import OrderAndPaper from "./OrderAndPaper";

/**
 * FixedSection component combines client selection, version selection, and project details
 * in a more compact, integrated layout with a red/black color theme
 */
const FixedSection = ({ 
  state, 
  dispatch, 
  isEditMode, 
  selectedClient, 
  setSelectedClient, 
  selectedVersion, 
  handleClientSelect, 
  handleVersionSelect, 
  generateClientCode, 
  isB2BClient, 
  linkedClientData, 
  validationErrors, 
  handleJobTypeChange 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h2 className="text-md font-medium text-gray-800">Project Information</h2>
      </div>
      
      <div className="p-5 grid grid-cols-[30%_70%] gap-4">
        {/* Client and Version Selection - Side by Side */}
        <div className="flex flex-wrap flex-col gap-2">
          {/* Client Selection */}
          <div>
            <h3 className="text-xs uppercase font-medium text-gray-500 mb-2">Client Information</h3>
            {isEditMode ? (
              <ClientReadOnly client={state.client.clientInfo} />
            ) : isB2BClient && linkedClientData ? (
              <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex items-center mb-1">
                  <span className="text-sm font-medium">{linkedClientData.name || linkedClientData.clientInfo?.name}</span>
                  <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                    B2B Client
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  <p>Code: {linkedClientData.clientCode || linkedClientData.clientInfo?.clientCode}</p>
                  {linkedClientData.contactPerson && (
                    <p>Contact: {linkedClientData.contactPerson}</p>
                  )}
                </div>
              </div>
            ) : (
              <ClientSelection 
                onClientSelect={handleClientSelect}
                selectedClient={selectedClient}
                setSelectedClient={setSelectedClient}
                generateClientCode={generateClientCode}
                isEditMode={isEditMode}
              />
            )}
            {validationErrors.clientId && (
              <p className="text-red-500 text-xs mt-1 error-message">{validationErrors.clientId}</p>
            )}
          </div>
          
          {/* Version Selection */}
          <div>
            <h3 className="text-xs uppercase font-medium text-gray-500 mb-1">Version</h3>
            {state.client.clientId ? (
              <VersionSelection 
                clientId={state.client.clientId}
                selectedVersion={selectedVersion}
                onVersionSelect={handleVersionSelect}
                compact={true} // Use compact mode
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md border border-gray-200 text-sm text-gray-500 text-xs">
                Select a client first to choose a version
              </div>
            )}
            {validationErrors.versionId && (
              <p className="text-red-500 text-xs mt-1 error-message">{validationErrors.versionId}</p>
            )}
          </div>
        </div>
        
        {/* Project & Paper Details */}
        <div className="pr-3">
          <h3 className="text-xs uppercase font-medium text-gray-500 mb-2">Project & Paper Details</h3>
          <div>
            <OrderAndPaper 
              state={state} 
              dispatch={dispatch} 
              onNext={() => {}} 
              validationErrors={validationErrors}
              singlePageMode={true}
              onJobTypeChange={handleJobTypeChange}
              compact={true} // Use compact mode
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixedSection;
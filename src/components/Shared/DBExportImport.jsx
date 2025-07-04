import React, { useState } from 'react';
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc, query, where } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { LEAD_SOURCES } from '../../constants/leadSources';
import { ALL_LEAD_STATUSES } from '../../constants/leadStatuses';

// Enhanced utility for exporting/importing Firestore collections with lead-specific support
const DBExportImport = ({ 
  db, 
  collectionName, 
  buttonStyle = "", 
  onSuccess, 
  onError,
  allowImport = true,
  allowExport = true,
  idField = "id",
  dateFields = ['timestamp', 'createdAt', 'updatedAt'],
  qualificationBadges = [] // Pass badges for lead processing
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null);

  // Helper to convert Firestore Timestamp objects to JS Date objects
  const processTimestamps = (data) => {
    const processed = { ...data };
    
    // Process timestamp fields
    dateFields.forEach(field => {
      if (processed[field] && processed[field].seconds) {
        processed[field] = new Date(processed[field].seconds * 1000);
      }
    });
    
    return processed;
  };

  // Lead-specific data processing for export
  const processLeadForExport = (leadData) => {
    // Get badge name from qualification badges
    const badgeName = qualificationBadges.find(b => b.id === leadData.badgeId)?.name || '';
    
    // Get source label from LEAD_SOURCES
    const sourceInfo = LEAD_SOURCES.find(s => s.id === leadData.source);
    const sourceLabel = sourceInfo?.label || leadData.source || '';
    
    // Get status label from ALL_LEAD_STATUSES
    const statusInfo = ALL_LEAD_STATUSES.find(s => s.id === leadData.status);
    const statusLabel = statusInfo?.label || leadData.status || '';
    
    return {
      id: leadData.id,
      name: leadData.name || '',
      company: leadData.company || '',
      email: leadData.email || '',
      phone: leadData.phone || '',
      source: leadData.source || '',
      sourceLabel: sourceLabel,
      status: leadData.status || '',
      statusLabel: statusLabel,
      qualificationBadgeId: leadData.badgeId || '',
      qualificationBadgeName: badgeName,
      jobType: leadData.jobType || '',
      budget: leadData.budget || '',
      urgency: leadData.urgency || '',
      notes: leadData.notes || '',
      // Flatten address object
      address_line1: leadData.address?.line1 || '',
      address_line2: leadData.address?.line2 || '',
      address_city: leadData.address?.city || '',
      address_state: leadData.address?.state || '',
      address_postalCode: leadData.address?.postalCode || '',
      address_country: leadData.address?.country || '',
      // Additional lead fields
      lastDiscussionSummary: leadData.lastDiscussionSummary || '',
      movedToClients: leadData.movedToClients || false,
      order: leadData.order || 0,
      // Process timestamps
      ...processTimestamps(leadData)
    };
  };

  // Lead-specific data processing for import
  const processLeadForImport = (importData) => {
    // Reconstruct address object
    const address = {
      line1: importData.address_line1 || '',
      line2: importData.address_line2 || '',
      city: importData.address_city || '',
      state: importData.address_state || '',
      postalCode: importData.address_postalCode || '',
      country: importData.address_country || 'India'
    };
    
    // Map badge name to ID if provided
    let badgeId = importData.qualificationBadgeId || '';
    if (importData.qualificationBadgeName && !badgeId) {
      const badge = qualificationBadges.find(b => 
        b.name.toLowerCase() === importData.qualificationBadgeName.toLowerCase()
      );
      badgeId = badge?.id || '';
    }
    
    // Use source ID, fallback to mapping from label
    let sourceId = importData.source || '';
    if (!sourceId && importData.sourceLabel) {
      const source = LEAD_SOURCES.find(s => 
        s.label.toLowerCase() === importData.sourceLabel.toLowerCase()
      );
      sourceId = source?.id || '';
    }
    
    // Use status ID, fallback to mapping from label
    let statusId = importData.status || '';
    if (!statusId && importData.statusLabel) {
      const status = ALL_LEAD_STATUSES.find(s => 
        s.label.toLowerCase() === importData.statusLabel.toLowerCase()
      );
      statusId = status?.id || 'newLead'; // Default to newLead
    }
    
    return {
      name: importData.name || '',
      company: importData.company || '',
      email: importData.email || '',
      phone: importData.phone || '',
      source: sourceId,
      status: statusId,
      badgeId: badgeId,
      jobType: importData.jobType || '',
      budget: importData.budget || '',
      urgency: importData.urgency || '',
      notes: importData.notes || '',
      address: address,
      lastDiscussionSummary: importData.lastDiscussionSummary || '',
      movedToClients: importData.movedToClients === true || importData.movedToClients === 'true',
      order: parseInt(importData.order) || Date.now() // Use current timestamp as default order
    };
  };

  // Lead-specific validation
  const validateLeadData = (leadData, index) => {
    const errors = [];
    
    // Required fields
    if (!leadData.name?.trim()) {
      errors.push(`Row ${index + 1}: Name is required`);
    }
    if (!leadData.phone?.trim()) {
      errors.push(`Row ${index + 1}: Phone is required`);
    }
    if (!leadData.source?.trim()) {
      errors.push(`Row ${index + 1}: Source is required`);
    }
    if (!leadData.status?.trim()) {
      errors.push(`Row ${index + 1}: Status is required`);
    }
    
    // Email validation (if provided)
    if (leadData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadData.email)) {
      errors.push(`Row ${index + 1}: Invalid email format`);
    }
    
    // Source validation
    const validSources = LEAD_SOURCES.map(s => s.id);
    if (leadData.source && !validSources.includes(leadData.source)) {
      errors.push(`Row ${index + 1}: Invalid source "${leadData.source}". Valid sources: ${validSources.join(', ')}`);
    }
    
    // Status validation
    const validStatuses = ALL_LEAD_STATUSES.map(s => s.id);
    if (leadData.status && !validStatuses.includes(leadData.status)) {
      errors.push(`Row ${index + 1}: Invalid status "${leadData.status}". Valid statuses: ${validStatuses.join(', ')}`);
    }
    
    // Badge validation (if provided)
    if (leadData.badgeId && !qualificationBadges.find(b => b.id === leadData.badgeId)) {
      errors.push(`Row ${index + 1}: Invalid qualification badge ID "${leadData.badgeId}"`);
    }
    
    return errors;
  };

  // Generic data processor - determines which processor to use
  const processDataForExport = (data) => {
    if (collectionName === 'leads') {
      return processLeadForExport(data);
    }
    return processTimestamps(data); // Default processing
  };

  const processDataForImport = (data) => {
    if (collectionName === 'leads') {
      return processLeadForImport(data);
    }
    return data; // Default processing
  };

  const validateImportData = (data, index) => {
    if (collectionName === 'leads') {
      return validateLeadData(data, index);
    }
    return []; // No validation for other collections
  };

  // Handle export operation
  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Get collection data
      const querySnapshot = await getDocs(collection(db, collectionName));
      
      // Process data for export
      const data = querySnapshot.docs.map(doc => {
        const docData = doc.data();
        const processedData = processDataForExport({
          [idField]: doc.id, // Always include the document ID
          ...docData
        });
        return processedData;
      });
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Set column widths for better readability
      const columnWidths = [];
      if (data.length > 0) {
        Object.keys(data[0]).forEach((key, index) => {
          const maxLength = Math.max(
            key.length,
            ...data.map(row => String(row[key] || '').length)
          );
          columnWidths[index] = { wch: Math.min(maxLength + 2, 50) };
        });
      }
      worksheet['!cols'] = columnWidths;
      
      // Create workbook and add the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, collectionName);
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Save file
      saveAs(blob, `${collectionName}_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
      
      if (onSuccess) onSuccess(`Exported ${data.length} ${collectionName} records successfully`);
    } catch (error) {
      console.error(`Error exporting ${collectionName}:`, error);
      if (onError) onError(`Error exporting ${collectionName}: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle import operation
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setIsImporting(true);
    setImportStatus({ status: 'processing', message: 'Reading file...' });
    
    try {
      // Read the Excel file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Get the first worksheet
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      
      // Convert worksheet to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length === 0) {
        throw new Error('No data found in the file');
      }
      
      setImportStatus({ 
        status: 'processing', 
        message: `Processing ${jsonData.length} records...` 
      });
      
      // Process and validate data
      const processedData = [];
      const validationErrors = [];
      
      for (let i = 0; i < jsonData.length; i++) {
        const item = jsonData[i];
        const processedItem = processDataForImport(item);
        const errors = validateImportData(processedItem, i);
        
        if (errors.length > 0) {
          validationErrors.push(...errors);
        } else {
          processedData.push({
            id: item[idField],
            data: processedItem
          });
        }
      }
      
      // If there are validation errors, show them
      if (validationErrors.length > 0) {
        const errorMessage = `Validation errors found:\n${validationErrors.slice(0, 10).join('\n')}${
          validationErrors.length > 10 ? `\n... and ${validationErrors.length - 10} more errors` : ''
        }`;
        throw new Error(errorMessage);
      }
      
      // Confirmation dialog
      if (!window.confirm(`You're about to import ${processedData.length} valid records to "${collectionName}" collection. This may overwrite existing data. Continue?`)) {
        setImportStatus(null);
        setIsImporting(false);
        return;
      }
      
      setImportStatus({ 
        status: 'processing', 
        message: `Importing ${processedData.length} records...` 
      });
      
      // Process and import data
      let successCount = 0;
      let errorCount = 0;
      
      for (const item of processedData) {
        try {
          const processedItem = { ...item.data };
          
          // Process date strings back to Firestore timestamps
          for (const [key, value] of Object.entries(processedItem)) {
            if (value && (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value))))) {
              const dateValue = value instanceof Date ? value : new Date(value);
              processedItem[key] = {
                seconds: Math.floor(dateValue.getTime() / 1000),
                nanoseconds: 0
              };
            }
          }
          
          // Add timestamps if missing
          const currentTimestamp = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
          if (!processedItem.createdAt) {
            processedItem.createdAt = currentTimestamp;
          }
          if (!processedItem.updatedAt) {
            processedItem.updatedAt = currentTimestamp;
          }
          
          if (item.id) {
            // Update existing document
            await setDoc(doc(db, collectionName, item.id), processedItem);
            successCount++;
          } else {
            // Add new document
            await addDoc(collection(db, collectionName), processedItem);
            successCount++;
          }
        } catch (err) {
          console.error('Error importing item:', err, item);
          errorCount++;
        }
      }
      
      const resultMessage = `Import completed: ${successCount} succeeded${errorCount > 0 ? `, ${errorCount} failed` : ''}`;
      setImportStatus({ 
        status: 'success', 
        message: resultMessage
      });
      
      if (onSuccess) onSuccess(resultMessage);
    } catch (error) {
      console.error(`Error importing ${collectionName}:`, error);
      setImportStatus({ status: 'error', message: error.message });
      if (onError) onError(`Error importing ${collectionName}: ${error.message}`);
    } finally {
      setIsImporting(false);
      // Clear the file input
      event.target.value = '';
    }
  };

  // Button styles
  const defaultButtonStyle = "px-3 py-2 text-sm rounded-md flex items-center";
  const exportButtonStyle = `${defaultButtonStyle} ${buttonStyle || "bg-green-600 text-white hover:bg-green-700"}`;
  const importButtonStyle = `${defaultButtonStyle} ${buttonStyle || "bg-blue-600 text-white hover:bg-blue-700"}`;
  
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {allowExport && (
        <button
          onClick={handleExport}
          disabled={isExporting}
          className={exportButtonStyle}
        >
          {isExporting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exporting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              Export to Excel
            </>
          )}
        </button>
      )}
      
      {allowImport && (
        <div className="relative">
          <button
            disabled={isImporting}
            className={importButtonStyle}
            onClick={() => document.getElementById(`${collectionName}-import-file`).click()}
          >
            {isImporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Importing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                </svg>
                Import from Excel
              </>
            )}
          </button>
          <input
            id={`${collectionName}-import-file`}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleImport}
            className="hidden"
            disabled={isImporting}
          />
        </div>
      )}
      
      {importStatus && (
        <div className={`mt-2 text-sm max-w-md ${importStatus.status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
          <div className="whitespace-pre-wrap">{importStatus.message}</div>
        </div>
      )}
    </div>
  );
};

export default DBExportImport;
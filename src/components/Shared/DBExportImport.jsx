import React, { useState } from 'react';
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc, query, where } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Utility for exporting/importing Firestore collections
const DBExportImport = ({ 
  db, 
  collectionName, 
  buttonStyle = "", 
  onSuccess, 
  onError,
  allowImport = true,
  allowExport = true,
  idField = "id",
  dateFields = ['timestamp', 'createdAt', 'updatedAt']
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

  // Handle export operation
  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Get collection data
      const querySnapshot = await getDocs(collection(db, collectionName));
      
      // Process data for export
      const data = querySnapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          [idField]: doc.id, // Always include the document ID
          ...processTimestamps(docData) // Process any timestamp fields
        };
      });
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);
      
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
        message: `Importing ${jsonData.length} records...` 
      });
      
      // Confirmation dialog
      if (!window.confirm(`You're about to import ${jsonData.length} records to "${collectionName}" collection. This may overwrite existing data. Continue?`)) {
        setImportStatus(null);
        setIsImporting(false);
        return;
      }
      
      // Process and import data
      let successCount = 0;
      let errorCount = 0;
      let skippedCount = 0;
      
      for (const item of jsonData) {
        try {
          // Extract the ID field
          const docId = item[idField];
          delete item[idField]; // Remove ID field from data
          
          // Process date strings back to Firestore timestamps
          const processedItem = { ...item };
          
          // Process fields with dates - convert valid date strings to timestamps
          for (const [key, value] of Object.entries(processedItem)) {
            // If it's a date string or date object, convert to Firestore timestamp
            if (value && (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value))))) {
              const dateValue = value instanceof Date ? value : new Date(value);
              
              // Store as a Firestore-compatible timestamp object
              processedItem[key] = {
                seconds: Math.floor(dateValue.getTime() / 1000),
                nanoseconds: 0
              };
            }
          }
          
          // Add fields if they're missing
          if (!processedItem.timestamp) {
            processedItem.timestamp = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
          }
          if (!processedItem.updatedAt) {
            processedItem.updatedAt = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
          }
          
          if (docId) {
            // Update existing document
            await setDoc(doc(db, collectionName, docId), processedItem);
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
      
      setImportStatus({ 
        status: 'success', 
        message: `Import completed: ${successCount} succeeded, ${errorCount} failed, ${skippedCount} skipped` 
      });
      
      if (onSuccess) onSuccess(`Import completed: ${successCount} succeeded, ${errorCount} failed, ${skippedCount} skipped`);
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
        <div className={`mt-2 text-sm ${importStatus.status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
          {importStatus.message}
        </div>
      )}
    </div>
  );
};

export default DBExportImport;
import React, { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { TRANSACTION_TYPES, TRANSACTION_TYPE_CONFIG, StockHelpers } from "../../../constants/stockConstants";

const StockTransactionForm = ({ onSubmit, onCancel, vendors, allSkus, isSubmitting, selectedSku = null }) => {
  const [formData, setFormData] = useState({
    transactionType: 'IN',
    skuCode: '',
    selectedSku: selectedSku,
    quantity: '',
    reference: '',
    notes: '',
    vendorName: '',
    jobId: '',
    purchaseOrderId: '',
    unitCost: '',
    totalCost: '',
    adjustmentReason: ''
  });

  const [availableSkus, setAvailableSkus] = useState([]);
  const [searchSku, setSearchSku] = useState('');
  const [notification, setNotification] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize with selected SKU if provided
  useEffect(() => {
    if (selectedSku) {
      setFormData(prev => ({
        ...prev,
        selectedSku: selectedSku,
        skuCode: selectedSku.skuCode,
        vendorName: selectedSku.company || '',
        unitCost: selectedSku.finalCostPerUnit || selectedSku.finalRate || ''
      }));
      setSearchSku(selectedSku.skuCode + ' - ' + selectedSku.itemName);
    }
  }, [selectedSku]);

  // Filter SKUs based on search
  useEffect(() => {
    if (searchSku.trim() && !formData.selectedSku) {
      const filtered = allSkus.filter(sku =>
        sku.skuCode.toLowerCase().includes(searchSku.toLowerCase()) ||
        sku.itemName.toLowerCase().includes(searchSku.toLowerCase()) ||
        sku.company.toLowerCase().includes(searchSku.toLowerCase())
      );
      setAvailableSkus(filtered.slice(0, 10)); // Limit to 10 results
    } else {
      setAvailableSkus([]);
    }
  }, [searchSku, allSkus, formData.selectedSku]);

  // Update form when SKU is selected
  useEffect(() => {
    if (formData.selectedSku) {
      setFormData(prev => ({
        ...prev,
        skuCode: formData.selectedSku.skuCode,
        vendorName: formData.selectedSku.company || '',
        unitCost: formData.selectedSku.finalCostPerUnit || formData.selectedSku.finalRate || ''
      }));
    }
  }, [formData.selectedSku]);

  // Calculate total cost when quantity or unit cost changes
  useEffect(() => {
    const quantity = parseFloat(formData.quantity) || 0;
    const unitCost = parseFloat(formData.unitCost) || 0;
    const totalCost = (quantity * unitCost).toFixed(2);
    
    setFormData(prev => ({
      ...prev,
      totalCost: totalCost
    }));
  }, [formData.quantity, formData.unitCost]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkuSelect = (sku) => {
    setFormData(prev => ({
      ...prev,
      selectedSku: sku,
      skuCode: sku.skuCode,
      vendorName: sku.company || '',
      unitCost: sku.finalCostPerUnit || sku.finalRate || ''
    }));
    setSearchSku(sku.skuCode + ' - ' + sku.itemName);
    setAvailableSkus([]);
  };

  const handleClearSku = () => {
    setFormData(prev => ({
      ...prev,
      selectedSku: null,
      skuCode: '',
      vendorName: '',
      unitCost: ''
    }));
    setSearchSku('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.selectedSku) {
      setNotification({
        type: 'error',
        message: 'Please select a valid SKU'
      });
      return;
    }

    // Validate transaction using helper
    const validation = StockHelpers.validateStockTransaction({
      skuCode: formData.skuCode,
      type: formData.transactionType,
      quantity: formData.quantity,
      reference: formData.reference
    });

    if (!validation.isValid) {
      setNotification({
        type: 'error',
        message: validation.errors.join(', ')
      });
      return;
    }

    // Check if stock OUT transaction would result in negative stock
    if (formData.transactionType === TRANSACTION_TYPES.OUT) {
      const currentStock = parseFloat(formData.selectedSku.currentStock) || 0;
      const outQuantity = parseFloat(formData.quantity);
      
      if (outQuantity > currentStock) {
        setNotification({
          type: 'error',
          message: `Cannot remove ${outQuantity} ${formData.selectedSku.type === 'Material' ? 'sqcm' : 'sheets'}. Only ${currentStock} available in stock.`
        });
        return;
      }
    }

    setIsProcessing(true);

    try {
      const transactionData = {
        skuCode: formData.skuCode,
        type: formData.transactionType,
        quantity: parseFloat(formData.quantity),
        date: new Date(),
        reference: formData.reference || StockHelpers.generateTransactionReference(formData.transactionType, 'ADJ-'),
        notes: formData.notes,
        vendorName: formData.vendorName,
        jobId: formData.jobId,
        purchaseOrderId: formData.purchaseOrderId,
        unitCost: parseFloat(formData.unitCost) || 0,
        totalCost: parseFloat(formData.totalCost) || 0,
        itemType: formData.selectedSku.type,
        adjustmentReason: formData.adjustmentReason,
        
        // Source tracking
        source: "SKU_MANAGEMENT",
        sourceId: null,
        sourceAction: "MANUAL_ADJUSTMENT",
        
        // Stock tracking
        previousStock: parseFloat(formData.selectedSku.currentStock) || 0,
        
        // Audit
        createdAt: new Date(),
        createdBy: 'Admin' // You might want to get this from auth context
      };

      // Calculate new stock level
      let newStock = transactionData.previousStock;
      if (formData.transactionType === TRANSACTION_TYPES.IN) {
        newStock += transactionData.quantity;
      } else if (formData.transactionType === TRANSACTION_TYPES.OUT) {
        newStock -= transactionData.quantity;
      } else if (formData.transactionType === TRANSACTION_TYPES.ADJUSTMENT) {
        // For adjustments, the quantity represents the final stock level
        newStock = transactionData.quantity;
        transactionData.quantity = newStock - transactionData.previousStock; // Store the difference
      }

      newStock = Math.max(0, newStock); // Prevent negative stock
      transactionData.newStock = newStock;
      transactionData.stockDifference = newStock - transactionData.previousStock;

      // Create the transaction record
      await addDoc(collection(db, "stockTransactions"), transactionData);
      
      // Update the SKU's current stock
      const skuCollection = formData.selectedSku.type === 'Material' ? 'materials' : 'papers';
      const skuDoc = doc(db, skuCollection, formData.selectedSku.id);
      
      const updateData = {
        currentStock: newStock,
        lastStockUpdate: new Date(),
        updatedAt: new Date()
      };

      // Update purchase/usage totals
      if (formData.transactionType === TRANSACTION_TYPES.IN) {
        updateData.totalPurchased = (parseFloat(formData.selectedSku.totalPurchased) || 0) + parseFloat(formData.quantity);
      } else if (formData.transactionType === TRANSACTION_TYPES.OUT) {
        updateData.totalUsed = (parseFloat(formData.selectedSku.totalUsed) || 0) + parseFloat(formData.quantity);
      }

      await updateDoc(skuDoc, updateData);
      
      // Update vendor relationship if vendor specified and stock IN
      if (formData.vendorName && formData.transactionType === TRANSACTION_TYPES.IN) {
        try {
          const vendorsQuery = query(collection(db, "vendors"), where("name", "==", formData.vendorName));
          const vendorSnapshot = await getDocs(vendorsQuery);
          
          if (!vendorSnapshot.empty) {
            const vendorDoc = vendorSnapshot.docs[0];
            const vendorData = vendorDoc.data();
            const currentSkus = vendorData.activeSkus || [];
            
            if (!currentSkus.includes(formData.skuCode)) {
              await updateDoc(vendorDoc.ref, {
                activeSkus: [...currentSkus, formData.skuCode],
                lastPurchaseDate: new Date(),
                updatedAt: new Date()
              });
            }
          }
        } catch (error) {
          console.warn("Could not update vendor relationship:", error);
        }
      }

      if (onSubmit) {
        onSubmit(transactionData);
      }
      
      // Reset form if not in modal mode (no selectedSku)
      if (!selectedSku) {
        setFormData({
          transactionType: 'IN',
          skuCode: '',
          selectedSku: null,
          quantity: '',
          reference: '',
          notes: '',
          vendorName: '',
          jobId: '',
          purchaseOrderId: '',
          unitCost: '',
          totalCost: '',
          adjustmentReason: ''
        });
        setSearchSku('');
      }
      
      setNotification({
        type: 'success',
        message: 'Stock transaction recorded successfully!'
      });
      
      setTimeout(() => setNotification(null), 3000);
      
    } catch (error) {
      console.error("Error recording transaction:", error);
      setNotification({
        type: 'error',
        message: 'Failed to record transaction: ' + error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const currentTransactionConfig = TRANSACTION_TYPE_CONFIG[formData.transactionType];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        {selectedSku ? `Adjust Stock - ${selectedSku.skuCode}` : 'Record Stock Transaction'}
      </h3>
      
      {/* Notification */}
      {notification && (
        <div className={`mb-4 p-3 rounded-md ${
          notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 
          'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {notification.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transaction Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(TRANSACTION_TYPE_CONFIG).map(([type, config]) => (
              <label key={type} className={`flex items-center justify-center p-3 border rounded-md cursor-pointer transition-colors ${
                formData.transactionType === type 
                  ? `border-green-500 ${config.color}` 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="transactionType"
                  value={type}
                  checked={formData.transactionType === type}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-lg mb-1">{config.icon}</div>
                  <div className="text-sm font-medium">{config.label}</div>
                  <div className="text-xs text-gray-500">{config.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* SKU Selection */}
        {!selectedSku && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select SKU <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchSku}
                onChange={(e) => setSearchSku(e.target.value)}
                placeholder="Search by SKU code, name, or vendor..."
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchSku && !formData.selectedSku && (
                <button
                  type="button"
                  onClick={() => setSearchSku('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            
            {/* SKU Search Results */}
            {availableSkus.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-md shadow-lg bg-white max-h-60 overflow-y-auto">
                {availableSkus.map((sku) => (
                  <button
                    key={sku.id}
                    type="button"
                    onClick={() => handleSkuSelect(sku)}
                    className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{sku.itemName}</p>
                        <p className="text-sm text-gray-600 font-mono">{sku.skuCode}</p>
                        <p className="text-sm text-gray-500">{sku.company}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          sku.type === 'Material' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {sku.type}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          Stock: {sku.currentStock || 0} {sku.type === 'Material' ? 'sqcm' : 'sheets'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {/* Selected SKU Display */}
            {formData.selectedSku && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-blue-900">{formData.selectedSku.itemName}</p>
                    <p className="text-sm text-blue-700 font-mono">{formData.selectedSku.skuCode}</p>
                    <p className="text-sm text-blue-600">
                      Current Stock: {formData.selectedSku.currentStock || 0} {formData.selectedSku.type === 'Material' ? 'sqcm' : 'sheets'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearSku}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transaction Details */}
        {formData.selectedSku && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity ({formData.selectedSku.type === 'Material' ? 'sqcm' : 'sheets'}) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={formData.transactionType === TRANSACTION_TYPES.ADJUSTMENT ? "Final stock level" : "Enter quantity"}
                required
              />
              {formData.transactionType === TRANSACTION_TYPES.ADJUSTMENT && (
                <p className="text-xs text-gray-500 mt-1">
                  Enter the final stock level you want to set
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference {currentTransactionConfig?.requiresReference && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="PO Number, Job ID, etc."
                required={currentTransactionConfig?.requiresReference}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost (₹)</label>
              <input
                type="number"
                name="unitCost"
                value={formData.unitCost}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Cost per unit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost (₹)</label>
              <input
                type="number"
                name="totalCost"
                value={formData.totalCost}
                readOnly
                className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-50"
                placeholder="Auto-calculated"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
              <select
                name="vendorName"
                value={formData.vendorName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select vendor (optional)</option>
                {vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.name}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job ID</label>
              <input
                type="text"
                name="jobId"
                value={formData.jobId}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Related job ID (optional)"
              />
            </div>
          </div>
        )}

        {/* Notes */}
        {formData.selectedSku && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes about this transaction..."
            />
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
              disabled={isProcessing}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isProcessing || isSubmitting || !formData.selectedSku}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Recording...
              </span>
            ) : (
              'Record Transaction'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StockTransactionForm;
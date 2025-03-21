// New component for calculation control
import React from 'react';
import { formatCurrency } from '../../../utils/formatters';

const CalculationControl = ({ 
  isCalculating, 
  onCalculate, 
  autoCalculate, 
  setAutoCalculate, 
  calculationError,
  lastCalculatedAt
}) => {
  return (
    <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-md">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="autoCalculate"
          checked={autoCalculate}
          onChange={() => setAutoCalculate(!autoCalculate)}
          className="h-4 w-4"
        />
        <label htmlFor="autoCalculate" className="text-sm">
          Auto-Calculate
        </label>
        
        {lastCalculatedAt && (
          <span className="text-xs text-gray-500">
            Last calculated: {new Date(lastCalculatedAt).toLocaleTimeString()}
          </span>
        )}
      </div>
      
      <button
        type="button"
        onClick={onCalculate}
        disabled={isCalculating}
        className={`px-4 py-1 rounded-md ${
          isCalculating
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white transition-colors duration-200 text-sm`}
      >
        {isCalculating ? "Calculating..." : "Calculate"}
      </button>
    </div>
  );
};

export default CalculationControl;
import React, { useState, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import OrderJobTicket from './OrderJobTicket';
import TaxInvoice from './TaxInvoice';

const OrderDetailsModal = ({ order, onClose, onStageUpdate }) => {
  const [activeView, setActiveView] = useState('details');
  const [isDownloading, setIsDownloading] = useState(false);
  const contentRef = useRef(null);
  const stages = ['Not started yet', 'Design', 'Positives', 'Printing', 'Quality Check', 'Delivery'];

  const fieldLabels = {
    clientName: "Name of the Client ",
    projectName: "Name of the Project ",
    date: "Order Date ",
    deliveryDate: "Expected Delivery Date ",
    jobType: "Job Type ",
    quantity: "Quantity ",
    paperProvided: "Paper Provided ",
    dieCode: "Die Code ",
    dieSize: "Die Size ",
    dieSelection: "Die Selection ",
    image: "Image ",
    breadth: "Breadth ",
    length: "Length ",
    paperName: "Paper Name ",
    plateSizeType: "Type of Plate Size ",
    noOfColors: "Total number of colors ",
    colorDetails: "Color Details of LP ",
    mrType: "Type of MR ",
    pantoneType: "Type of Pantone ",
    plateDimensions: "Dimensions of Plate ",
    plateType: "Type of Plate ",
    fsType: "Type of FS ",
    foilDetails: "Foil Details of FS ",
    blockSizeType: "Block size Type ",
    blockDimension: "Block Dimensions ",
    foilType: "Type of Foil ",
    blockType: "Type of Block ",
    plateTypeMale: "Male Plate Type ",
    plateTypeFemale: "Female Plate Type ",
    embMR: "Type of MR ",
    digiDie: "Digital Die Selected ",
    digiDimensions: "Digital Die Dimensions ",
    lpDetailsSandwich: "LP Details in Sandwich ",
    fsDetailsSandwich: "FS Details in Sandwich ",
    embDetailsSandwich: "EMB Details in Sandwich ",
    paperCostPerCard: "Cost of Paper ",
    cuttingCostPerCard: "Cost of Cutting ",
    paperAndCuttingCostPerCard: "Total Paper and Cutting Cost ",
    lpCostPerCard: "Cost of LP ",
    fsCostPerCard: "Cost of FS ",
    embCostPerCard: "Cost of EMB ",
    lpCostPerCardSandwich: "Cost of LP in Sandwich ",
    fsCostPerCardSandwich: "Cost of FS in Sandwich ",
    embCostPerCardSandwich: "Cost of EMB in Sandwich ",
    digiCostPerCard: "Digital Print Cost per Unit ",
    pastingType: "Pasting Type "
  };

  const getLabel = (key) => {
    if (fieldLabels[key]) {
      return fieldLabels[key];
    }
    return key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
      .replace(/([a-z])([0-9])/g, "$1 $2")
      .replace(/([0-9])([a-z])/g, "$1 $2")
      .replace(/([A-Z][a-z]+)/g, (match) => match.charAt(0).toUpperCase() + match.slice(1))
      .trim();
  };

  const renderValue = (key, value) => {
    if (value === null || value === undefined || value === "") {
      return "Not Provided";
    }

    if (key.toLowerCase().includes("date") && value) {
      try {
        const date = new Date(value);
        return date.toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      } catch (error) {
        return value || "Not Provided";
      }
    }

    if (key === "dieSize" && typeof value === "string") {
      return value === " x " ? "Not Provided" : value;
    }

    if (key.toLowerCase() === "image" && value) {
      return (
        <img
          src={value}
          alt="Die"
          className="max-w-full max-h-20 object-contain border rounded-md"
        />
      );
    }

    if (Array.isArray(value)) {
      return (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div key={index} className="flex justify-between items-center gap-4 bg-gray-100 p-2 rounded-md">
              {renderValue("item", item)}
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === "object" && value !== null) {
      return (
        <table className="w-full border-collapse border border-gray-300 rounded-md">
          <tbody>
            {Object.entries(value)
              .filter(([key]) => !key.startsWith('is'))
              .map(([subKey, subValue], index) => (
                <tr
                  key={subKey}
                  className={`${
                    index % 2 === 0 ? "bg-gray-100" : "bg-white"
                  } border border-gray-300`}
                >
                  <td className="p-2 font-medium text-gray-600">{getLabel(subKey)}:</td>
                  <td className="p-2 text-gray-800">{renderValue(subKey, subValue)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      );
    }

    return value.toString();
  };

  const renderMultipleTablesInRow = (dataArray) => {
    return (
      <div className="grid grid-cols-3 gap-4">
        {dataArray.map((item, index) => (
          <div key={index} className="bg-white p-2 rounded-md border">
            {renderValue("table", item)}
          </div>
        ))}
      </div>
    );
  };

  const renderSectionInFlex = (heading, sectionData, excludedFields = []) => {
    if (!sectionData || typeof sectionData !== "object" || Object.keys(sectionData).length === 0) {
      return null;
    }

    return (
      <div key={heading} className="mb-6">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">{heading}:</h3>
        <div className="space-y-4 bg-gray-100 p-4 rounded-md">
          {Object.entries(sectionData)
            .filter(([key]) => !excludedFields.includes(key))
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return (
                  <div key={key}>
                    <h4 className="font-medium text-gray-600 mb-2">{getLabel(key)}:</h4>
                    {renderMultipleTablesInRow(value)}
                  </div>
                );
              }
              return (
                <div key={key} className="flex items-center gap-1">
                  <span className="font-medium text-gray-600">{getLabel(key)}:</span>
                  <span className="text-gray-800">{renderValue(key, value)}</span>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  const renderSectionInGrid = (heading, sectionData, excludedFields = []) => {
    if (!sectionData || typeof sectionData !== "object" || Object.keys(sectionData).length === 0) {
      return null;
    }

    return (
      <div key={heading} className="mb-6">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">{heading}:</h3>
        <div className="grid grid-cols-2 gap-3 bg-white">
          {Object.entries(sectionData)
            .filter(([key]) => !excludedFields.includes(key))
            .map(([key, value]) => (
              <div key={key} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
                <span className="font-medium text-gray-600">{getLabel(key)}:</span>
                <span className="text-gray-800">{renderValue(key, value)}</span>
              </div>
            ))}
        </div>
      </div>
    );
  };

  const handleStageUpdate = async (newStage) => {
    try {
      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, { stage: newStage });
      onStageUpdate(newStage);
    } catch (error) {
      console.error("Error updating stage:", error);
      alert("Failed to update stage");
    }
  };

  const calculateTotalCosts = () => {
    const costFields = [
      'paperCostPerCard', 'cuttingCostPerCard', 'paperAndCuttingCostPerCard',
      'lpCostPerCard', 'fsCostPerCard', 'embCostPerCard',
      'lpCostPerCardSandwich', 'fsCostPerCardSandwich', 'embCostPerCardSandwich',
      'digiCostPerCard'
    ];

    const totalPerCard = costFields.reduce((acc, field) => {
      const value = order.calculations?.[field];
      if (value && !isNaN(parseFloat(value))) {
        return acc + parseFloat(value);
      }
      return acc;
    }, 0);

    return {
      perCard: totalPerCard,
      total: totalPerCard * (order.jobDetails?.quantity || 0)
    };
  };

  const generatePDF = async () => {
    if (!contentRef.current) return;
    
    setIsDownloading(true);
    try {
      const images = contentRef.current.getElementsByTagName('img');
      const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      await Promise.all(imagePromises);

      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        imageTimeout: 0
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${order.clientName}_${activeView === 'invoice' ? 'Invoice' : 'Job_Ticket'}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">
              {activeView === 'details' ? 'Order Details' : 
               activeView === 'invoice' ? 'Tax Invoice' : 'Job Ticket'}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView('details')}
                className={`px-3 py-1 rounded-md text-sm ${
                  activeView === 'details' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveView('ticket')}
                className={`px-3 py-1 rounded-md text-sm ${
                  activeView === 'ticket' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Job Ticket
              </button>
              <button
                onClick={() => setActiveView('invoice')}
                className={`px-3 py-1 rounded-md text-sm ${
                  activeView === 'invoice' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Invoice
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {(activeView === 'invoice' || activeView === 'ticket') && (
              <button
                onClick={generatePDF}
                disabled={isDownloading}
                className={`flex items-center gap-2 px-4 py-2 ${
                  isDownloading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                } text-white rounded-md`}
              >
                {isDownloading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>Download {activeView === 'invoice' ? 'Invoice' : 'Job Ticket'}</>
                )}
              </button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {activeView === 'details' ? (
            <div className="p-6" id="order-content">
              {/* Order and Paper Details */}
              {renderSectionInGrid("Order and Paper", {
                clientName: order.clientName,
                projectName: order.projectName,
                date: order.date,
                deliveryDate: order.deliveryDate,
                jobType: order.jobDetails?.jobType,
                quantity: order.jobDetails?.quantity,
                paperProvided: order.jobDetails?.paperProvided,
                paperName: order.jobDetails?.paperName,
                dieCode: order.dieDetails?.dieCode,
                dieSize: `${order.dieDetails?.dieSize?.length || ''} x ${order.dieDetails?.dieSize?.breadth || ''}`,
                image: order.dieDetails?.image
              })}

              {/* Process Details */}
              <div className="space-y-4 bg-white">
                {order.lpDetails?.isLPUsed && 
                  renderSectionInFlex("LP Details", order.lpDetails, ["isLPUsed"])}
                {order.fsDetails?.isFSUsed &&
                  renderSectionInFlex("FS Details", order.fsDetails, ["isFSUsed"])}
                {order.embDetails?.isEMBUsed &&
                  renderSectionInFlex("EMB Details", order.embDetails, ["isEMBUsed"])}
                {order.digiDetails?.isDigiUsed &&
                  renderSectionInFlex("Digi Details", order.digiDetails, ["isDigiUsed"])}
                {order.dieCutting?.isDieCuttingUsed &&
                  renderSectionInFlex("Die Cutting", order.dieCutting, ["isDieCuttingUsed"])}
                {order.sandwich?.isSandwichComponentUsed && (
                  <div>
                    {order.sandwich.lpDetailsSandwich?.isLPUsed &&
                      renderSectionInFlex("Sandwich LP Details", order.sandwich.lpDetailsSandwich, ["isLPUsed"])}
                    {order.sandwich.fsDetailsSandwich?.isFSUsed &&
                      renderSectionInFlex("Sandwich FS Details", order.sandwich.fsDetailsSandwich, ["isFSUsed"])}
                    {order.sandwich.embDetailsSandwich?.isEMBUsed &&
                      renderSectionInFlex("Sandwich EMB Details", order.sandwich.embDetailsSandwich, ["isEMBUsed"])}
                  </div>
                )}
                {order.pasting?.isPastingUsed &&
                  renderSectionInFlex("Pasting Details", order.pasting, ["isPastingUsed"])}
              </div>

              {/* Cost Information */}
              {order.calculations && (
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Cost Calculations (per card)</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {['paperCostPerCard', 'cuttingCostPerCard', 'paperAndCuttingCostPerCard', 
                      'lpCostPerCard', 'fsCostPerCard', 'embCostPerCard', 
                      'lpCostPerCardSandwich', 'fsCostPerCardSandwich', 'embCostPerCardSandwich', 
                      'digiCostPerCard']
                      .filter(key => 
                        order.calculations[key] !== null && 
                        order.calculations[key] !== "Not Provided" && 
                        parseFloat(order.calculations[key]) !== 0
                      )
                      .map((key) => (
                        <div
                          key={key}
                          className="flex justify-between items-center bg-gray-100 p-2 rounded-md"
                        >
                          <span className="font-medium text-gray-600">{getLabel(key)}:</span>
                          <span className="text-gray-800">₹ {parseFloat(order.calculations[key]).toFixed(2)}</span>
                        </div>
                      ))}
                  </div>

                  {/* Total Cost Summary */}
                  <div className="mt-6 bg-gray-100 p-4 rounded-md">
                    <div className="flex justify-between items-center border-b border-gray-300 pb-3">
                      <span className="text-lg font-bold text-gray-700">Total Cost per Card:</span>
                      <span className="text-lg font-bold text-gray-900">
                        ₹ {calculateTotalCosts().perCard.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3">
                      <span className="text-lg font-bold text-gray-700">
                        Total Cost ({order.jobDetails?.quantity || 0} pcs):
                      </span>
                      <span className="text-xl font-bold text-blue-600">
                        ₹ {calculateTotalCosts().total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div ref={contentRef} className="p-6">
              {activeView === 'invoice' ? (
                <TaxInvoice order={order} />
              ) : (
                <OrderJobTicket order={order} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
// // // // // import jsPDF from 'jspdf';
// // // // // import 'jspdf-autotable';

// // // // // export const generateGroupEstimatePDF = (estimates) => {
// // // // //   if (!estimates || estimates.length === 0) {
// // // // //     console.error('No estimates to generate PDF');
// // // // //     return;
// // // // //   }

// // // // //   const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
// // // // //   doc.setFontSize(10);

// // // // //   // Company Header
// // // // //   doc.text('FAMOUS LETTERPRESS', 15, 15);
// // // // //   doc.text('Estimate Group Report', 15, 22);

// // // // //   // Group Details
// // // // //   const firstEstimate = estimates[0];
// // // // //   doc.text(`Client: ${firstEstimate.clientName}`, 15, 30);
// // // // //   doc.text(`Project: ${firstEstimate.projectName}`, 15, 37);
// // // // //   doc.text(`Generated On: ${new Date().toLocaleDateString('en-GB')}`, 15, 44);

// // // // //   // Prepare table columns and rows
// // // // //   const tableColumns = [
// // // // //     'Estimate No',
// // // // //     'Job Type',
// // // // //     'Quantity',
// // // // //     'Paper',
// // // // //     'Die Code',
// // // // //     'Die Size',
// // // // //     'LP',
// // // // //     'FS',
// // // // //     'EMB',
// // // // //     'Digi',
// // // // //     'Die Cutting',
// // // // //     'Pasting'
// // // // //   ];

// // // // //   const tableRows = estimates.map((estimate, index) => [
// // // // //     `Estimate ${index + 1}`,
// // // // //     estimate.jobDetails?.jobType || 'N/A',
// // // // //     estimate.jobDetails?.quantity || 'N/A',
// // // // //     estimate.jobDetails?.paperName || 'N/A',
// // // // //     estimate.dieDetails?.dieCode || 'N/A',
// // // // //     estimate.dieDetails?.dieSize 
// // // // //       ? `${estimate.dieDetails.dieSize.length} x ${estimate.dieDetails.dieSize.breadth}` 
// // // // //       : 'N/A',
// // // // //     formatProcessDetail(estimate.lpDetails),
// // // // //     formatProcessDetail(estimate.fsDetails),
// // // // //     formatProcessDetail(estimate.embDetails),
// // // // //     formatProcessDetail(estimate.digiDetails),
// // // // //     formatProcessDetail(estimate.dieCutting),
// // // // //     formatProcessDetail(estimate.pasting)
// // // // //   ]);

// // // // //   // Generate main estimates table
// // // // //   doc.autoTable({
// // // // //     head: [tableColumns],
// // // // //     body: tableRows,
// // // // //     startY: 52,
// // // // //     styles: { 
// // // // //       fontSize: 8,
// // // // //       cellPadding: 2,
// // // // //       overflow: 'linebreak'
// // // // //     },
// // // // //     columnStyles: {
// // // // //       0: { cellWidth: 20 },
// // // // //       1: { cellWidth: 20 },
// // // // //       2: { cellWidth: 15 }
// // // // //     },
// // // // //     headStyles: { 
// // // // //       fillColor: [200, 200, 200],
// // // // //       textColor: 0 
// // // // //     }
// // // // //   });

// // // // //   // Detailed Breakdown Section
// // // // //   let currentY = doc.previousAutoTable.finalY + 10;
// // // // //   estimates.forEach((estimate, index) => {
// // // // //     if (currentY > 250) {
// // // // //       doc.addPage();
// // // // //       currentY = 20;
// // // // //     }

// // // // //     doc.setFontSize(12);
// // // // //     doc.text(`Estimate ${index + 1} - Detailed Breakdown`, 15, currentY);
// // // // //     currentY += 8;

// // // // //     const detailSections = [
// // // // //       { title: 'Order & Paper Details', data: extractOrderPaperDetails(estimate) },
// // // // //       { title: 'Letter Press Details', data: extractLPDetails(estimate) },
// // // // //       { title: 'Foil Stamping Details', data: extractFSDetails(estimate) },
// // // // //       { title: 'Embossing Details', data: extractEMBDetails(estimate) },
// // // // //       { title: 'Digital Printing Details', data: extractDigiDetails(estimate) },
// // // // //       { title: 'Die Cutting Details', data: extractDieCuttingDetails(estimate) },
// // // // //       { title: 'Pasting Details', data: extractPastingDetails(estimate) },
// // // // //     ];

// // // // //     detailSections.forEach(section => {
// // // // //       if (Object.keys(section.data).length > 0) {
// // // // //         doc.setFontSize(10);
// // // // //         doc.text(section.title, 15, currentY);
// // // // //         currentY += 6;

// // // // //         const detailRows = Object.entries(section.data).map(([key, value]) => [key, value]);
        
// // // // //         doc.autoTable({
// // // // //           body: detailRows,
// // // // //           startY: currentY,
// // // // //           styles: { fontSize: 8 },
// // // // //           columnStyles: {
// // // // //             0: { cellWidth: 50, fontStyle: 'bold' },
// // // // //             1: { cellWidth: 100 }
// // // // //           },
// // // // //           theme: 'plain'
// // // // //         });

// // // // //         currentY = doc.previousAutoTable.finalY + 5;
// // // // //       }
// // // // //     });

// // // // //     currentY += 10;
// // // // //   });

// // // // //   // Save the PDF
// // // // //   doc.save(`${firstEstimate.clientName}_Group_Estimate.pdf`);
// // // // // };

// // // // // // Helper function to format process details
// // // // // const formatProcessDetail = (processDetails) => {
// // // // //   if (!processDetails) return 'N/A';
// // // // //   return processDetails.isLPUsed || 
// // // // //          processDetails.isFSUsed || 
// // // // //          processDetails.isEMBUsed || 
// // // // //          processDetails.isDigiUsed || 
// // // // //          processDetails.isDieCuttingUsed || 
// // // // //          processDetails.isPastingUsed 
// // // // //     ? 'Yes' 
// // // // //     : 'No';
// // // // // };

// // // // // // Detail extraction functions
// // // // // const extractOrderPaperDetails = (estimate) => {
// // // // //   const details = {};
// // // // //   const jobDetails = estimate.jobDetails || {};
// // // // //   const dieDetails = estimate.dieDetails || {};

// // // // //   details['Client Name'] = estimate.clientName;
// // // // //   details['Project Name'] = estimate.projectName;
// // // // //   details['Order Date'] = formatDate(estimate.date);
// // // // //   details['Delivery Date'] = formatDate(estimate.deliveryDate);
// // // // //   details['Job Type'] = jobDetails.jobType;
// // // // //   details['Quantity'] = jobDetails.quantity;
// // // // //   details['Paper Provided'] = jobDetails.paperProvided;
// // // // //   details['Paper Name'] = jobDetails.paperName;
// // // // //   details['Die Code'] = dieDetails.dieCode;
// // // // //   details['Die Size'] = dieDetails.dieSize 
// // // // //     ? `${dieDetails.dieSize.length} x ${dieDetails.dieSize.breadth}` 
// // // // //     : 'N/A';

// // // // //   return details;
// // // // // };

// // // // // const extractLPDetails = (estimate) => {
// // // // //   const lpDetails = estimate.lpDetails || {};
// // // // //   if (!lpDetails.isLPUsed) return {};

// // // // //   const details = {
// // // // //     'Total Colors': lpDetails.noOfColors || 0
// // // // //   };

// // // // //   (lpDetails.colorDetails || []).forEach((color, index) => {
// // // // //     details[`Color ${index + 1} Pantone Type`] = color.pantoneType;
// // // // //     details[`Color ${index + 1} Plate Type`] = color.plateType;
// // // // //     details[`Color ${index + 1} MR Type`] = color.mrType;
// // // // //   });

// // // // //   return details;
// // // // // };

// // // // // const extractFSDetails = (estimate) => {
// // // // //   const fsDetails = estimate.fsDetails || {};
// // // // //   if (!fsDetails.isFSUsed) return {};

// // // // //   const details = {
// // // // //     'FS Type': fsDetails.fsType
// // // // //   };

// // // // //   (fsDetails.foilDetails || []).forEach((foil, index) => {
// // // // //     details[`Foil ${index + 1} Type`] = foil.foilType;
// // // // //     details[`Foil ${index + 1} Block Type`] = foil.blockType;
// // // // //     details[`Foil ${index + 1} MR Type`] = foil.mrType;
// // // // //   });

// // // // //   return details;
// // // // // };

// // // // // const extractEMBDetails = (estimate) => {
// // // // //   const embDetails = estimate.embDetails || {};
// // // // //   if (!embDetails.isEMBUsed) return {};

// // // // //   return {
// // // // //     'Plate Size Type': embDetails.plateSizeType,
// // // // //     'Plate Dimensions': embDetails.plateDimensions 
// // // // //       ? `${embDetails.plateDimensions.length} x ${embDetails.plateDimensions.breadth}` 
// // // // //       : 'N/A',
// // // // //     'Plate Type Male': embDetails.plateTypeMale,
// // // // //     'Plate Type Female': embDetails.plateTypeFemale,
// // // // //     'EMB MR': embDetails.embMR
// // // // //   };
// // // // // };

// // // // // const extractDigiDetails = (estimate) => {
// // // // //   const digiDetails = estimate.digiDetails || {};
// // // // //   if (!digiDetails.isDigiUsed) return {};

// // // // //   return {
// // // // //     'Digi Die': digiDetails.digiDie,
// // // // //     'Digi Dimensions': digiDetails.digiDimensions 
// // // // //       ? `${digiDetails.digiDimensions.length} x ${digiDetails.digiDimensions.breadth}` 
// // // // //       : 'N/A'
// // // // //   };
// // // // // };

// // // // // const extractDieCuttingDetails = (estimate) => {
// // // // //   const dieCutting = estimate.dieCutting || {};
// // // // //   if (!dieCutting.isDieCuttingUsed) return {};

// // // // //   return {
// // // // //     'Difficulty': dieCutting.difficulty,
// // // // //     'PDC': dieCutting.pdc,
// // // // //     'DC MR': dieCutting.dcMR
// // // // //   };
// // // // // };

// // // // // const extractPastingDetails = (estimate) => {
// // // // //   const pasting = estimate.pasting || {};
// // // // //   if (!pasting.isPastingUsed) return {};

// // // // //   return {
// // // // //     'Pasting Type': pasting.pastingType
// // // // //   };
// // // // // };

// // // // // const formatDate = (dateString) => {
// // // // //   if (!dateString) return 'N/A';
// // // // //   return new Date(dateString).toLocaleDateString('en-GB');
// // // // // };

// // // // import jsPDF from 'jspdf';
// // // // import 'jspdf-autotable';

// // // // export const generateGroupEstimatePDF = (estimates) => {
// // // //   if (!estimates || estimates.length === 0) {
// // // //     console.error('No estimates to generate PDF');
// // // //     return;
// // // //   }

// // // //   const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
// // // //   doc.setFontSize(10);

// // // //   // Company Header
// // // //   doc.text('FAMOUS LETTERPRESS', 15, 15);
// // // //   doc.text('Estimate Group Report', 15, 22);

// // // //   // Group Details
// // // //   const firstEstimate = estimates[0];
// // // //   doc.text(`Client: ${firstEstimate.clientName}`, 15, 30);
// // // //   doc.text(`Project: ${firstEstimate.projectName}`, 15, 37);
// // // //   doc.text(`Generated On: ${new Date().toLocaleDateString('en-GB')}`, 15, 44);

// // // //   // Prepare table columns and rows
// // // //   const tableColumns = [
// // // //     'Estimate No',
// // // //     'Job Type',
// // // //     'Quantity',
// // // //     'Paper',
// // // //     'Die Code',
// // // //     'Die Size',
// // // //     'LP',
// // // //     'FS',
// // // //     'EMB',
// // // //     'Digi',
// // // //     'Die Cutting',
// // // //     'Pasting'
// // // //   ];

// // // //   const tableRows = estimates.map((estimate, index) => [
// // // //     `Estimate ${index + 1}`,
// // // //     estimate.jobDetails?.jobType || 'N/A',
// // // //     estimate.jobDetails?.quantity || 'N/A',
// // // //     estimate.jobDetails?.paperName || 'N/A',
// // // //     estimate.dieDetails?.dieCode || 'N/A',
// // // //     estimate.dieDetails?.dieSize 
// // // //       ? `${estimate.dieDetails.dieSize.length} x ${estimate.dieDetails.dieSize.breadth}` 
// // // //       : 'N/A',
// // // //     formatProcessDetail(estimate.lpDetails),
// // // //     formatProcessDetail(estimate.fsDetails),
// // // //     formatProcessDetail(estimate.embDetails),
// // // //     formatProcessDetail(estimate.digiDetails),
// // // //     formatProcessDetail(estimate.dieCutting),
// // // //     formatProcessDetail(estimate.pasting)
// // // //   ]);

// // // //   // Generate main estimates table
// // // //   doc.autoTable({
// // // //     head: [tableColumns],
// // // //     body: tableRows,
// // // //     startY: 52,
// // // //     styles: { 
// // // //       fontSize: 8,
// // // //       cellPadding: 2,
// // // //       overflow: 'linebreak'
// // // //     },
// // // //     columnStyles: {
// // // //       0: { cellWidth: 20 },
// // // //       1: { cellWidth: 20 },
// // // //       2: { cellWidth: 15 }
// // // //     },
// // // //     headStyles: { 
// // // //       fillColor: [200, 200, 200],
// // // //       textColor: 0 
// // // //     }
// // // //   });

// // // //   // Save the PDF
// // // //   doc.save(`${firstEstimate.clientName}_Group_Estimate.pdf`);
// // // // };

// // // // export const generateGroupJobTicket = (estimates) => {
// // // //   if (!estimates || estimates.length === 0) {
// // // //     console.error('No estimates to generate Job Ticket');
// // // //     return;
// // // //   }

// // // //   const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
// // // //   doc.setFontSize(10);

// // // //   // Company Header
// // // //   doc.text('FAMOUS LETTERPRESS', 15, 15);
// // // //   doc.text('Group Job Ticket', 15, 22);

// // // //   // Group Details
// // // //   const firstEstimate = estimates[0];
// // // //   doc.text(`Client: ${firstEstimate.clientName}`, 15, 30);
// // // //   doc.text(`Project: ${firstEstimate.projectName}`, 15, 37);
// // // //   doc.text(`Generated On: ${new Date().toLocaleDateString('en-GB')}`, 15, 44);

// // // //   // Prepare table columns and rows
// // // //   const tableColumns = [
// // // //     'Job Ticket No',
// // // //     'Job Type',
// // // //     'Paper',
// // // //     'Die Code',
// // // //     'Final Size',
// // // //     'Closed Size',
// // // //     'Total Qty',
// // // //     'Total Sheets'
// // // //   ];

// // // //   const tableRows = estimates.map((estimate, index) => [
// // // //     `JT-${index + 1}`,
// // // //     estimate.jobDetails?.jobType || 'N/A',
// // // //     estimate.jobDetails?.paperName || 'N/A',
// // // //     estimate.dieDetails?.dieCode || 'N/A',
// // // //     estimate.dieDetails?.dieSize 
// // // //       ? `${estimate.dieDetails.dieSize.length} x ${estimate.dieDetails.dieSize.breadth}` 
// // // //       : 'N/A',
// // // //     estimate.dieDetails?.dieSize 
// // // //       ? `${estimate.dieDetails.dieSize.length} x ${estimate.dieDetails.dieSize.breadth}` 
// // // //       : 'N/A',
// // // //     estimate.jobDetails?.quantity || 'N/A',
// // // //     'N/A' // You might want to calculate total sheets based on your logic
// // // //   ]);

// // // //   // Generate job ticket table
// // // //   doc.autoTable({
// // // //     head: [tableColumns],
// // // //     body: tableRows,
// // // //     startY: 52,
// // // //     styles: { 
// // // //       fontSize: 8,
// // // //       cellPadding: 2,
// // // //       overflow: 'linebreak'
// // // //     },
// // // //     headStyles: { 
// // // //       fillColor: [200, 200, 200],
// // // //       textColor: 0 
// // // //     }
// // // //   });

// // // //   // Save the PDF
// // // //   doc.save(`${firstEstimate.clientName}_Group_JobTicket.pdf`);
// // // // };

// // // // // Helper function to format process details
// // // // const formatProcessDetail = (processDetails) => {
// // // //   if (!processDetails) return 'N/A';
// // // //   return processDetails.isLPUsed || 
// // // //          processDetails.isFSUsed || 
// // // //          processDetails.isEMBUsed || 
// // // //          processDetails.isDigiUsed || 
// // // //          processDetails.isDieCuttingUsed || 
// // // //          processDetails.isPastingUsed 
// // // //     ? 'Yes' 
// // // //     : 'No';
// // // // };

// // // import jsPDF from 'jspdf';
// // // import 'jspdf-autotable';

// // // export const generateGroupEstimatePDF = (estimates) => {
// // //   if (!estimates || estimates.length === 0) {
// // //     console.error('No estimates to generate PDF');
// // //     return;
// // //   }

// // //   const doc = new jsPDF('l', 'mm', 'a4');
// // //   const pageWidth = doc.internal.pageSize.width;

// // //   const firstEstimate = estimates[0];
// // //   const clientName = firstEstimate.clientName;
// // //   const currentDate = new Date();
// // //   const deliveryDate = firstEstimate.deliveryDate ? new Date(firstEstimate.deliveryDate) : null;

// // //   // Company Header
// // //   doc.setFontSize(12);
// // //   doc.text('FAMOUS LETTERPRESS', 15, 20);
// // //   doc.setFontSize(9);
// // //   doc.text('1 Tetris Building, Subajil Tinali', 15, 26);
// // //   doc.text('Nagaland, India', 15, 32);
// // //   doc.text('GSTIN: 13ALPPA2458Q2ZO', 15, 38);
// // //   doc.text('Phone no.: +919233152718', 15, 44);
// // //   doc.text('Email: info@famousletterpress.com', 15, 50);

// // //   // Client and Estimate Details
// // //   doc.setTextColor(255, 0, 0);
// // //   doc.text('VERSION', pageWidth - 50, 20);
// // //   doc.setTextColor(0, 0, 0);
  
// // //   doc.text(`Client: ${clientName}`, pageWidth - 80, 26);
// // //   doc.text(`Estimate No: ${generateEstimateNumber(firstEstimate)}`, pageWidth - 80, 32);
// // //   doc.text(`Date: ${formatDate(currentDate)}`, pageWidth - 80, 38);
// // //   doc.text(`Delivery Date: ${formatDate(deliveryDate)}`, pageWidth - 80, 44);

// // //   // Bank Details
// // //   doc.text('Bank Details', 15, 60);
// // //   doc.text('FAMOUS', 15, 66);
// // //   doc.text('A/C No: 91202000543206', 15, 72);
// // //   doc.text('IFSC Code: UTIB0000378', 15, 78);
// // //   doc.text('Axis Bank, Circular Road, Dimapur', 15, 84);

// // //   // Legend
// // //   doc.text('*LP: Letter Press', 15, 94);
// // //   doc.text('*FS: Foil Stamping', 15, 99);
// // //   doc.text('*EMB: Embossing', 15, 104);
// // //   doc.text('*DIGI: Digital Printing', 15, 109);

// // //   // Estimate Table Columns
// // //   const tableColumns = [
// // //     'SL NO', 'Details', 'Job', 'PAPER', 'DIE NO', 
// // //     'Qty.', 'No.of Pages', 'Unit Cost (₹)', 'Total (₹)', 
// // //     'Disc. %', 'Total (₹)', 'GST Amt. (₹)', 'Grand total (₹)'
// // //   ];

// // //   // Calculate table rows
// // //   const tableRows = estimates.map((estimate, index) => {
// // //     const jobDetails = estimate.jobDetails || {};
// // //     const calculations = estimate.calculations || {};
// // //     const dieDetails = estimate.dieDetails || {};
// // //     const lpDetails = estimate.lpDetails || {};

// // //     // Safely extract and calculate values
// // //     const quantity = parseInt(jobDetails.quantity) || 0;
// // //     const paperCostPerCard = parseFloat(calculations.paperAndCuttingCostPerCard) || 0;
// // //     const unitCost = paperCostPerCard;
// // //     const totalCost = (quantity * unitCost).toFixed(2);
// // //     const discountPercentage = '12%';
// // //     const gstAmount = (parseFloat(totalCost) * 0.12).toFixed(2);
// // //     const grandTotal = (parseFloat(totalCost) * 1.12).toFixed(2);

// // //     // Dynamically generate details string
// // //     const detailsString = [
// // //       jobDetails.jobType,
// // //       lpDetails.isLPUsed ? `LP ${lpDetails.noOfColors || ''} Colour` : '',
// // //       dieDetails.dieSize ? `${dieDetails.dieSize.length}"x${dieDetails.dieSize.breadth}"` : ''
// // //     ].filter(Boolean).join(' - ');

// // //     return [
// // //       String.fromCharCode(65 + index), // A, B, C, etc.
// // //       detailsString || 'N/A',
// // //       jobDetails.jobType || 'N/A',
// // //       jobDetails.paperName || 'N/A',
// // //       dieDetails.dieCode || 'N/A',
// // //       quantity,
// // //       '3', // Default pages value
// // //       unitCost.toFixed(2),
// // //       totalCost,
// // //       discountPercentage,
// // //       totalCost,
// // //       gstAmount,
// // //       grandTotal
// // //     ];
// // //   });

// // //   // Render the table
// // //   doc.autoTable({
// // //     startY: 120,
// // //     head: [tableColumns],
// // //     body: tableRows,
// // //     theme: 'plain',
// // //     styles: { 
// // //       fontSize: 8,
// // //       cellPadding: 2
// // //     },
// // //     headStyles: {
// // //       fontStyle: 'bold'
// // //     }
// // //   });

// // //   doc.save(`${clientName}_Estimate.pdf`);
// // // };

// // // export const generateGroupJobTicket = (estimates) => {
// // //   if (!estimates || estimates.length === 0) {
// // //     console.error('No estimates to generate Job Ticket');
// // //     return;
// // //   }

// // //   const doc = new jsPDF('l', 'mm', 'a4');
// // //   const firstEstimate = estimates[0];
// // //   const clientName = firstEstimate.clientName;

// // //   // Company Logo Placeholder
// // //   doc.setFontSize(12);
// // //   doc.text('FAMOUS LETTERPRESS', 15, 20);

// // //   // Job Ticket Details
// // //   doc.setFontSize(10);
// // //   doc.text(`Job Ticket No.: ${generateJobTicketNumber(firstEstimate)}`, 15, 30);
// // //   doc.text(`Client: ${clientName}`, 15, 37);
// // //   doc.text(`Assigned to: Press Team`, 15, 44);
// // //   doc.text(`Order No.: ${generateOrderNumber(firstEstimate)}`, 15, 51);
// // //   doc.text(`Delivery Date: ${formatDate(new Date(firstEstimate.deliveryDate))}`, 15, 58);

// // //   // Table Columns
// // //   const tableColumns = [
// // //     'Job', 'Paper & GSM', 'Die. No', 'Final Size', 
// // //     'Closed Size', 'Total Ontv.', 'Rabies Ontv.', 
// // //     'Frags Ontv.', 'Total Sheets', 'Total No. of Pages'
// // //   ];

// // //   // Generate Table Rows
// // //   const tableRows = estimates.map((estimate) => {
// // //     const jobDetails = estimate.jobDetails || {};
// // //     const dieDetails = estimate.dieDetails || {};

// // //     return [
// // //       jobDetails.jobType || 'N/A',
// // //       jobDetails.paperName || 'N/A',
// // //       dieDetails.dieCode || 'N/A',
// // //       `${dieDetails.dieSize?.length || 'N/A'}" x ${dieDetails.dieSize?.breadth || 'N/A'}"`,
// // //       `${dieDetails.dieSize?.length || 'N/A'}" x ${dieDetails.dieSize?.breadth || 'N/A'}"`,
// // //       jobDetails.quantity || 'N/A',
// // //       jobDetails.quantity ? Math.floor(jobDetails.quantity / 10).toString() : 'N/A', // Rabies Ontv
// // //       jobDetails.quantity ? Math.floor(jobDetails.quantity / 10).toString() : 'N/A', // Frags Ontv
// // //       jobDetails.quantity ? Math.floor(jobDetails.quantity / 10).toString() : 'N/A', // Total Sheets
// // //       '3'
// // //     ];
// // //   });

// // //   // Render Table
// // //   doc.autoTable({
// // //     startY: 70,
// // //     head: [tableColumns],
// // //     body: tableRows,
// // //     theme: 'plain',
// // //     styles: { 
// // //       fontSize: 8,
// // //       cellPadding: 2
// // //     }
// // //   });

// // //   // Printing Details Section
// // //   const printingDetails = [
// // //     ['LETTER PRESS', estimates.some(e => e.lpDetails?.isLPUsed) ? 'YES' : 'NO'],
// // //     ['FOIL STAMPING', estimates.some(e => e.fsDetails?.isFSUsed) ? 'YES' : 'NO'],
// // //     ['EMBOSSING', estimates.some(e => e.embDetails?.isEMBUsed) ? 'YES' : 'NO'],
// // //     ['DIGITAL', estimates.some(e => e.digiDetails?.isDigiUsed) ? 'YES' : 'NO']
// // //   ];

// // //   doc.autoTable({
// // //     startY: doc.previousAutoTable.finalY + 10,
// // //     body: printingDetails,
// // //     theme: 'plain',
// // //     styles: { 
// // //       fontSize: 8,
// // //       cellPadding: 2
// // //     }
// // //   });

// // //   doc.save(`${clientName}_JobTicket.pdf`);
// // // };

// // // // Helper Functions
// // // const generateEstimateNumber = (estimate) => {
// // //   const date = new Date(estimate.date || new Date());
// // //   return `${estimate.clientName.slice(0,4)}_V1/FLP/${date.getFullYear()}`;
// // // };

// // // const generateJobTicketNumber = (estimate) => {
// // //   const date = new Date(estimate.date || new Date());
// // //   return `ROD-${date.getMonth() + 1}${date.getFullYear().toString().slice(-2)}`;
// // // };

// // // const generateOrderNumber = (estimate) => {
// // //   const date = new Date(estimate.date || new Date());
// // //   return `${estimate.clientName.slice(0,4)}_V1/${date.getFullYear()}`;
// // // };

// // // const formatDate = (date) => {
// // //   if (!date) return 'N/A';
// // //   return date.toLocaleDateString('en-GB', { 
// // //     day: '2-digit', 
// // //     month: 'short', 
// // //     year: 'numeric' 
// // //   });
// // // };

// // import jsPDF from 'jspdf';
// // import 'jspdf-autotable';

// // export const generateGroupEstimatePDF = (estimates) => {
// //   if (!estimates || estimates.length === 0) {
// //     console.error('No estimates to generate PDF');
// //     return;
// //   }

// //   const doc = new jsPDF('l', 'mm', 'a4');
// //   const firstEstimate = estimates[0];
// //   const clientName = firstEstimate.clientName;

// //   // Company Header
// //   doc.setFontSize(12);
// //   doc.text('FAMOUS LETTERPRESS', 15, 20);
// //   doc.setFontSize(10);
// //   doc.text('Estimate Report', 15, 28);

// //   // Client Details
// //   doc.text(`Client: ${clientName}`, 15, 40);
// //   doc.text(`Project: ${firstEstimate.projectName || 'N/A'}`, 15, 47);
// //   doc.text(`Date: ${formatDate(new Date())}`, 15, 54);

// //   // Create table rows for estimates
// //   const tableColumns = [
// //     'Estimate', 
// //     'Job Type', 
// //     'Quantity', 
// //     'Paper', 
// //     'Die Code', 
// //     'Die Size', 
// //     'Processes'
// //   ];

// //   const tableRows = estimates.map((estimate, index) => {
// //     const jobDetails = estimate.jobDetails || {};
// //     const dieDetails = estimate.dieDetails || {};

// //     // Collect active processes
// //     const processes = [
// //       estimate.lpDetails?.isLPUsed ? 'LP' : null,
// //       estimate.fsDetails?.isFSUsed ? 'FS' : null,
// //       estimate.embDetails?.isEMBUsed ? 'EMB' : null,
// //       estimate.digiDetails?.isDigiUsed ? 'Digital' : null
// //     ].filter(Boolean).join(', ');

// //     return [
// //       `Estimate ${index + 1}`,
// //       jobDetails.jobType || 'N/A',
// //       jobDetails.quantity || 'N/A',
// //       jobDetails.paperName || 'N/A',
// //       dieDetails.dieCode || 'N/A',
// //       dieDetails.dieSize 
// //         ? `${dieDetails.dieSize.length}" x ${dieDetails.dieSize.breadth}"` 
// //         : 'N/A',
// //       processes || 'None'
// //     ];
// //   });

// //   // Render the estimates table
// //   doc.autoTable({
// //     startY: 65,
// //     head: [tableColumns],
// //     body: tableRows,
// //     theme: 'plain',
// //     styles: { 
// //       fontSize: 10,
// //       cellPadding: 3
// //     },
// //     headStyles: {
// //       fillColor: [240, 240, 240],
// //       textColor: [0, 0, 0],
// //       fontStyle: 'bold'
// //     }
// //   });

// //   // Calculations Summary
// //   const calculationsSummary = calculateEstimatesSummary(estimates);
  
// //   doc.autoTable({
// //     startY: doc.previousAutoTable.finalY + 10,
// //     head: [['Cost Type', 'Per Card (₹)', 'Total (₹)']],
// //     body: Object.entries(calculationsSummary).map(([key, value]) => [
// //       key, 
// //       value.perCard.toFixed(2), 
// //       value.total.toFixed(2)
// //     ]),
// //     theme: 'plain',
// //     styles: { 
// //       fontSize: 10,
// //       cellPadding: 3
// //     },
// //     headStyles: {
// //       fillColor: [240, 240, 240],
// //       textColor: [0, 0, 0],
// //       fontStyle: 'bold'
// //     }
// //   });

// //   doc.save(`${clientName}_Estimate.pdf`);
// // };

// // // Helper function to calculate summary
// // const calculateEstimatesSummary = (estimates) => {
// //   const summaryInitialState = {
// //     'Paper Cost': { perCard: 0, total: 0 },
// //     'LP Cost': { perCard: 0, total: 0 },
// //     'FS Cost': { perCard: 0, total: 0 },
// //     'EMB Cost': { perCard: 0, total: 0 },
// //     'Digital Cost': { perCard: 0, total: 0 }
// //   };

// //   return estimates.reduce((summary, estimate) => {
// //     const jobDetails = estimate.jobDetails || {};
// //     const calculations = estimate.calculations || {};
// //     const quantity = parseInt(jobDetails.quantity) || 0;

// //     // Paper Cost
// //     const paperCost = parseFloat(calculations.paperAndCuttingCostPerCard) || 0;
// //     summary['Paper Cost'].perCard += paperCost;
// //     summary['Paper Cost'].total += paperCost * quantity;

// //     // LP Cost
// //     const lpCost = parseFloat(calculations.lpCostPerCard) || 0;
// //     summary['LP Cost'].perCard += lpCost;
// //     summary['LP Cost'].total += lpCost * quantity;

// //     // FS Cost
// //     const fsCost = parseFloat(calculations.fsCostPerCard) || 0;
// //     summary['FS Cost'].perCard += fsCost;
// //     summary['FS Cost'].total += fsCost * quantity;

// //     // EMB Cost
// //     const embCost = parseFloat(calculations.embCostPerCard) || 0;
// //     summary['EMB Cost'].perCard += embCost;
// //     summary['EMB Cost'].total += embCost * quantity;

// //     // Digital Cost
// //     const digiCost = parseFloat(calculations.digiCostPerCard) || 0;
// //     summary['Digital Cost'].perCard += digiCost;
// //     summary['Digital Cost'].total += digiCost * quantity;

// //     return summary;
// //   }, summaryInitialState);
// // };

// // // Date formatting helper
// // const formatDate = (date) => {
// //   if (!date) return 'N/A';
// //   return date.toLocaleDateString('en-GB', { 
// //     day: '2-digit', 
// //     month: 'short', 
// //     year: 'numeric' 
// //   });
// // };

// // export const generateGroupJobTicket = (estimates) => {
// //   if (!estimates || estimates.length === 0) {
// //     console.error('No estimates to generate Job Ticket');
// //     return;
// //   }

// //   const doc = new jsPDF('l', 'mm', 'a4');
// //   const firstEstimate = estimates[0];
// //   const clientName = firstEstimate.clientName;

// //   // Company Header
// //   doc.setFontSize(12);
// //   doc.text('FAMOUS LETTERPRESS', 15, 20);
// //   doc.setFontSize(10);
// //   doc.text('Job Ticket', 15, 28);

// //   // Client Details
// //   doc.text(`Client: ${clientName}`, 15, 40);
// //   doc.text(`Project: ${firstEstimate.projectName || 'N/A'}`, 15, 47);
// //   doc.text(`Date: ${formatDate(new Date())}`, 15, 54);

// //   // Job Ticket Table
// //   const tableColumns = [
// //     'Job', 
// //     'Paper', 
// //     'Die No', 
// //     'Final Size', 
// //     'Closed Size', 
// //     'Total Qty', 
// //     'Processes'
// //   ];

// //   const tableRows = estimates.map((estimate, index) => {
// //     const jobDetails = estimate.jobDetails || {};
// //     const dieDetails = estimate.dieDetails || {};

// //     // Collect active processes
// //     const processes = [
// //       estimate.lpDetails?.isLPUsed ? 'LP' : null,
// //       estimate.fsDetails?.isFSUsed ? 'FS' : null,
// //       estimate.embDetails?.isEMBUsed ? 'EMB' : null,
// //       estimate.digiDetails?.isDigiUsed ? 'Digital' : null
// //     ].filter(Boolean).join(', ');

// //     return [
// //       jobDetails.jobType || 'N/A',
// //       jobDetails.paperName || 'N/A',
// //       dieDetails.dieCode || 'N/A',
// //       dieDetails.dieSize 
// //         ? `${dieDetails.dieSize.length}" x ${dieDetails.dieSize.breadth}"` 
// //         : 'N/A',
// //       dieDetails.dieSize 
// //         ? `${dieDetails.dieSize.length}" x ${dieDetails.dieSize.breadth}"` 
// //         : 'N/A',
// //       jobDetails.quantity || 'N/A',
// //       processes || 'None'
// //     ];
// //   });

// //   doc.autoTable({
// //     startY: 65,
// //     head: [tableColumns],
// //     body: tableRows,
// //     theme: 'plain',
// //     styles: { 
// //       fontSize: 10,
// //       cellPadding: 3
// //     },
// //     headStyles: {
// //       fillColor: [240, 240, 240],
// //       textColor: [0, 0, 0],
// //       fontStyle: 'bold'
// //     }
// //   });

// //   doc.save(`${clientName}_JobTicket.pdf`);
// // };

// import jsPDF from 'jspdf';
// import 'jspdf-autotable';

// export const generateGroupEstimatePDF = (estimates) => {
//   if (!estimates || estimates.length === 0) {
//     console.error('No estimates to generate PDF');
//     return;
//   }

//   const doc = new jsPDF('l', 'mm', 'a4');
//   const pageWidth = doc.internal.pageSize.width;
//   const pageHeight = doc.internal.pageSize.height;

//   const firstEstimate = estimates[0];
//   const clientName = firstEstimate.clientName;
//   const currentDate = new Date();
//   const deliveryDate = firstEstimate.deliveryDate ? new Date(firstEstimate.deliveryDate) : null;

//   // Company Header
//   doc.setFontSize(12);
//   doc.text('FAMOUS LETTERPRESS', 15, 20);
//   doc.setFontSize(9);
//   doc.text('1 Tetris Building, Subajil Tinali', 15, 26);
//   doc.text('Nagaland, India', 15, 32);
//   doc.text('GSTIN: 13ALPPA2458Q2ZO', 15, 38);
//   doc.text('Phone no.: +919233152718', 15, 44);
//   doc.text('Email: info@famousletterpress.com', 15, 50);

//   // Client and Estimate Details
//   doc.setTextColor(255, 0, 0);
//   doc.text('VERSION', pageWidth - 50, 20);
//   doc.setTextColor(0, 0, 0);
  
//   doc.text(`Client: ${clientName}`, pageWidth - 80, 26);
//   doc.text(`Estimate No: ${generateEstimateNumber(firstEstimate)}`, pageWidth - 80, 32);
//   doc.text(`Date: ${formatDate(currentDate)}`, pageWidth - 80, 38);
//   doc.text(`Delivery Date: ${formatDate(deliveryDate)}`, pageWidth - 80, 44);

//   // Bank Details
//   doc.text('Bank Details', 15, 60);
//   doc.text('FAMOUS', 15, 66);
//   doc.text('A/C No: 91202000543206', 15, 72);
//   doc.text('IFSC Code: UTIB0000378', 15, 78);
//   doc.text('Axis Bank, Circular Road, Dimapur', 15, 84);

//   // Legend
//   doc.text('*LP: Letter Press', 15, 94);
//   doc.text('*FS: Foil Stamping', 15, 99);
//   doc.text('*EMB: Embossing', 15, 104);
//   doc.text('*DIGI: Digital Printing', 15, 109);

//   // Estimate Table Columns
//   const tableColumns = [
//     'SL NO', 'Details', 'Job', 'PAPER', 'DIE NO', 
//     'Qty.', 'No.of Pages', 'Unit Cost (₹)', 'Total (₹)', 
//     'Disc. %', 'Total (₹)', 'GST Amt. (₹)', 'Grand total (₹)'
//   ];

//   // Calculate table rows
//   const tableRows = estimates.map((estimate, index) => {
//     const jobDetails = estimate.jobDetails || {};
//     const calculations = estimate.calculations || {};
//     const dieDetails = estimate.dieDetails || {};
//     const lpDetails = estimate.lpDetails || {};

//     // Safely extract and calculate values
//     const quantity = parseInt(jobDetails.quantity) || 0;
//     const paperCostPerCard = parseFloat(calculations.paperAndCuttingCostPerCard) || 0;
//     const unitCost = paperCostPerCard;
//     const totalCost = (quantity * unitCost).toFixed(2);
//     const discountPercentage = '12%';
//     const gstAmount = (parseFloat(totalCost) * 0.12).toFixed(2);
//     const grandTotal = (parseFloat(totalCost) * 1.12).toFixed(2);

//     // Dynamically generate details string
//     const detailsString = [
//       jobDetails.jobType,
//       lpDetails.isLPUsed ? `LP ${lpDetails.noOfColors || ''} Colour` : '',
//       dieDetails.dieSize ? `${dieDetails.dieSize.length}"x${dieDetails.dieSize.breadth}"` : ''
//     ].filter(Boolean).join(' - ');

//     return [
//       String.fromCharCode(65 + index), // A, B, C, etc.
//       detailsString || 'N/A',
//       jobDetails.jobType || 'N/A',
//       jobDetails.paperName || 'N/A',
//       dieDetails.dieCode || 'N/A',
//       quantity,
//       '3', // Default pages value
//       unitCost.toFixed(2),
//       totalCost,
//       discountPercentage,
//       totalCost,
//       gstAmount,
//       grandTotal
//     ];
//   });

//   // Render the table
//   doc.autoTable({
//     startY: 120,
//     head: [tableColumns],
//     body: tableRows,
//     theme: 'plain',
//     styles: { 
//       fontSize: 8,
//       cellPadding: 2
//     },
//     headStyles: {
//       fontStyle: 'bold'
//     }
//   });

//   // Process Details Section
//   let processDetailsY = doc.previousAutoTable.finalY + 10;
  
//   estimates.forEach((estimate, index) => {
//     doc.setFontSize(12);
//     doc.text(`Estimate ${index + 1} - Process Details`, 15, processDetailsY);
//     processDetailsY += 8;

//     // Letter Press Details
//     if (estimate.lpDetails?.isLPUsed) {
//       const lpDetails = estimate.lpDetails;
//       let lpDetailsText = `Letter Press: ${lpDetails.noOfColors} Colors`;
      
//       if (lpDetails.colorDetails && lpDetails.colorDetails.length > 0) {
//         lpDetails.colorDetails.forEach((color, colorIndex) => {
//           lpDetailsText += `\n  Color ${colorIndex + 1}: 
//             Pantone: ${color.pantoneType || 'N/A'}, 
//             Plate Type: ${color.plateType || 'N/A'}, 
//             MR Type: ${color.mrType || 'N/A'}`;
//         });
//       }
      
//       doc.setFontSize(10);
//       doc.text(lpDetailsText, 15, processDetailsY);
//       processDetailsY += (lpDetails.colorDetails.length + 1) * 6;
//     }

//     // Foil Stamping Details
//     if (estimate.fsDetails?.isFSUsed) {
//       const fsDetails = estimate.fsDetails;
//       let fsDetailsText = `Foil Stamping: ${fsDetails.fsType}`;
      
//       if (fsDetails.foilDetails && fsDetails.foilDetails.length > 0) {
//         fsDetails.foilDetails.forEach((foil, foilIndex) => {
//           fsDetailsText += `\n  Foil ${foilIndex + 1}: 
//             Foil Type: ${foil.foilType || 'N/A'}, 
//             Block Type: ${foil.blockType || 'N/A'}, 
//             MR Type: ${foil.mrType || 'N/A'}`;
//         });
//       }
      
//       doc.text(fsDetailsText, 15, processDetailsY);
//       processDetailsY += (fsDetails.foilDetails.length + 1) * 6;
//     }

//     // Embossing Details
//     if (estimate.embDetails?.isEMBUsed) {
//       const embDetails = estimate.embDetails;
//       const embDetailsText = `Embossing: 
//         Plate Size Type: ${embDetails.plateSizeType || 'N/A'}
//         Plate Dimensions: ${embDetails.plateDimensions ? `${embDetails.plateDimensions.length} x ${embDetails.plateDimensions.breadth}` : 'N/A'}
//         Plate Type Male: ${embDetails.plateTypeMale || 'N/A'}
//         Plate Type Female: ${embDetails.plateTypeFemale || 'N/A'}
//         EMB MR: ${embDetails.embMR || 'N/A'}`;
      
//       doc.text(embDetailsText, 15, processDetailsY);
//       processDetailsY += 6 * 6;
//     }

//     // Digital Printing Details
//     if (estimate.digiDetails?.isDigiUsed) {
//       const digiDetails = estimate.digiDetails;
//       const digiDetailsText = `Digital Printing:
//         Digi Die: ${digiDetails.digiDie || 'N/A'}
//         Dimensions: ${digiDetails.digiDimensions ? `${digiDetails.digiDimensions.length} x ${digiDetails.digiDimensions.breadth}` : 'N/A'}`;
      
//       doc.text(digiDetailsText, 15, processDetailsY);
//       processDetailsY += 3 * 6;
//     }

//     // Add some spacing between estimates
//     processDetailsY += 10;
//   });

//   doc.save(`${clientName}_Estimate.pdf`);
// };

// export const generateGroupJobTicket = (estimates) => {
//   if (!estimates || estimates.length === 0) {
//     console.error('No estimates to generate Job Ticket');
//     return;
//   }

//   const doc = new jsPDF('l', 'mm', 'a4');
//   const firstEstimate = estimates[0];
//   const clientName = firstEstimate.clientName;

//   // Company Logo Placeholder
//   doc.setFontSize(12);
//   doc.text('FAMOUS LETTERPRESS', 15, 20);

//   // Job Ticket Details
//   doc.setFontSize(10);
//   doc.text(`Job Ticket No.: ${generateJobTicketNumber(firstEstimate)}`, 15, 30);
//   doc.text(`Client: ${clientName}`, 15, 37);
//   doc.text(`Assigned to: Press Team`, 15, 44);
//   doc.text(`Order No.: ${generateOrderNumber(firstEstimate)}`, 15, 51);
//   doc.text(`Delivery Date: ${formatDate(new Date(firstEstimate.deliveryDate))}`, 15, 58);

//   // Table Columns
//   const tableColumns = [
//     'Job', 'Paper & GSM', 'Die. No', 'Final Size', 
//     'Closed Size', 'Total Ontv.', 'Rabies Ontv.', 
//     'Frags Ontv.', 'Total Sheets', 'Total No. of Pages'
//   ];

//   // Generate Table Rows
//   const tableRows = estimates.map((estimate) => {
//     const jobDetails = estimate.jobDetails || {};
//     const dieDetails = estimate.dieDetails || {};

//     return [
//       jobDetails.jobType || 'N/A',
//       jobDetails.paperName || 'N/A',
//       dieDetails.dieCode || 'N/A',
//       `${dieDetails.dieSize?.length || 'N/A'}" x ${dieDetails.dieSize?.breadth || 'N/A'}"`,
//       `${dieDetails.dieSize?.length || 'N/A'}" x ${dieDetails.dieSize?.breadth || 'N/A'}"`,
//       jobDetails.quantity || 'N/A',
//       jobDetails.quantity ? Math.floor(jobDetails.quantity / 10).toString() : 'N/A',
//       jobDetails.quantity ? Math.floor(jobDetails.quantity / 10).toString() : 'N/A',
//       jobDetails.quantity ? Math.floor(jobDetails.quantity / 10).toString() : 'N/A',
//       '3'
//     ];
//   });

//   // Render Table
//   doc.autoTable({
//     startY: 70,
//     head: [tableColumns],
//     body: tableRows,
//     theme: 'plain',
//     styles: { 
//       fontSize: 8,
//       cellPadding: 2
//     }
//   });

//   // Printing Details Section
//   const printingDetails = [
//     ['LETTER PRESS', estimates.some(e => e.lpDetails?.isLPUsed) ? 'YES' : 'NO'],
//     ['FOIL STAMPING', estimates.some(e => e.fsDetails?.isFSUsed) ? 'YES' : 'NO'],
//     ['EMBOSSING', estimates.some(e => e.embDetails?.isEMBUsed) ? 'YES' : 'NO'],
//     ['DIGITAL', estimates.some(e => e.digiDetails?.isDigiUsed) ? 'YES' : 'NO']
//   ];

//   doc.autoTable({
//     startY: doc.previousAutoTable.finalY + 10,
//     body: printingDetails,
//     theme: 'plain',
//     styles: { 
//       fontSize: 8,
//       cellPadding: 2
//     }
//   });

//   doc.save(`${clientName}_JobTicket.pdf`);
// };

// // Helper Functions
// const generateEstimateNumber = (estimate) => {
//   const date = new Date(estimate.date || new Date());
//   return `${estimate.clientName.slice(0,4)}_V1/FLP/${date.getFullYear()}`;
// };

// const generateJobTicketNumber = (estimate) => {
//   const date = new Date(estimate.date || new Date());
//   return `ROD-${date.getMonth() + 1}${date.getFullYear().toString().slice(-2)}`;
// };

// const generateOrderNumber = (estimate) => {
//   const date = new Date(estimate.date || new Date());
//   return `${estimate.clientName.slice(0,4)}_V1/${date.getFullYear()}`;
// };

// const formatDate = (date) => {
//   if (!date) return 'N/A';
//   return date.toLocaleDateString('en-GB', { 
//     day: '2-digit', 
//     month: 'short', 
//     year: 'numeric' 
//   });
// };

import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateGroupEstimatePDF = (estimates) => {
  if (!estimates || estimates.length === 0) {
    console.error('No estimates to generate PDF');
    return;
  }

  const doc = new jsPDF('l', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.width;
  const firstEstimate = estimates[0];
  const clientName = firstEstimate.clientName;
  const currentDate = new Date();
  const deliveryDate = firstEstimate.deliveryDate ? new Date(firstEstimate.deliveryDate) : null;

  // Company Header
  doc.setFontSize(12);
  doc.text('FAMOUS LETTERPRESS', 15, 20);
  doc.setFontSize(9);
  doc.text('1 Tetris Building, Subajil Tinali', 15, 26);
  doc.text('Nagaland, India', 15, 32);
  doc.text('GSTIN: 13ALPPA2458Q2ZO', 15, 38);
  doc.text('Phone no.: +919233152718', 15, 44);
  doc.text('Email: info@famousletterpress.com', 15, 50);

  // Client and Estimate Details
  doc.setTextColor(255, 0, 0);
  doc.text('VERSION', pageWidth - 50, 20);
  doc.setTextColor(0, 0, 0);
  
  doc.text(`Client: ${clientName}`, pageWidth - 80, 26);
  doc.text(`Estimate No: ${generateEstimateNumber(firstEstimate)}`, pageWidth - 80, 32);
  doc.text(`Date: ${formatDate(currentDate)}`, pageWidth - 80, 38);
  doc.text(`Delivery Date: ${formatDate(deliveryDate)}`, pageWidth - 80, 44);

  // Bank Details
  doc.text('Bank Details', 15, 60);
  doc.text('FAMOUS', 15, 66);
  doc.text('A/C No: 91202000543206', 15, 72);
  doc.text('IFSC Code: UTIB0000378', 15, 78);
  doc.text('Axis Bank, Circular Road, Dimapur', 15, 84);

  // Legend
  doc.text('*LP: Letter Press', 15, 94);
  doc.text('*FS: Foil Stamping', 15, 99);
  doc.text('*EMB: Embossing', 15, 104);
  doc.text('*DIGI: Digital Printing', 15, 109);

  // Determine columns with data
  const allColumns = [
    'SL NO', 'Details', 'Job', 'PAPER', 'DIE NO', 
    'Qty.', 'No.of Pages', 'Unit Cost (₹)', 'Total (₹)', 
    'Disc. %', 'Total (₹)', 'GST Amt. (₹)', 'Grand total (₹)'
  ];

  const usedColumns = allColumns.filter(column => 
    estimates.some(estimate => {
      const jobDetails = estimate.jobDetails || {};
      const calculations = estimate.calculations || {};
      const dieDetails = estimate.dieDetails || {};

      switch(column) {
        case 'Details': 
          return jobDetails.jobType || 
                 (estimate.lpDetails?.isLPUsed) || 
                 dieDetails.dieSize;
        case 'Job': return jobDetails.jobType;
        case 'PAPER': return jobDetails.paperName;
        case 'DIE NO': return dieDetails.dieCode;
        case 'Qty.': return jobDetails.quantity;
        case 'No.of Pages': return true; // Always show
        case 'Unit Cost (₹)': return calculations.paperAndCuttingCostPerCard;
        case 'Total (₹)': return jobDetails.quantity && calculations.paperAndCuttingCostPerCard;
        case 'Disc. %': return true; // Always show
        case 'GST Amt. (₹)': return jobDetails.quantity && calculations.paperAndCuttingCostPerCard;
        case 'Grand total (₹)': return jobDetails.quantity && calculations.paperAndCuttingCostPerCard;
        default: return false;
      }
    })
  );

  // Calculate table rows
  const tableRows = estimates.map((estimate, index) => {
    const jobDetails = estimate.jobDetails || {};
    const calculations = estimate.calculations || {};
    const dieDetails = estimate.dieDetails || {};
    const lpDetails = estimate.lpDetails || {};

    const quantity = parseInt(jobDetails.quantity) || 0;
    const paperCostPerCard = parseFloat(calculations.paperAndCuttingCostPerCard) || 0;
    const totalCost = (quantity * paperCostPerCard).toFixed(2);
    const discountPercentage = '12%';
    const gstAmount = (parseFloat(totalCost) * 0.12).toFixed(2);
    const grandTotal = (parseFloat(totalCost) * 1.12).toFixed(2);

    const row = [];

    if (usedColumns.includes('SL NO')) {
      row.push(String.fromCharCode(65 + index));
    }
    if (usedColumns.includes('Details')) {
      const detailsString = [
        jobDetails.jobType,
        lpDetails.isLPUsed ? `LP ${lpDetails.noOfColors || ''} Colour` : '',
        dieDetails.dieSize ? `${dieDetails.dieSize.length}"x${dieDetails.dieSize.breadth}"` : ''
      ].filter(Boolean).join(' - ');
      row.push(detailsString || 'N/A');
    }
    if (usedColumns.includes('Job')) {
      row.push(jobDetails.jobType || 'N/A');
    }
    if (usedColumns.includes('PAPER')) {
      row.push(jobDetails.paperName || 'N/A');
    }
    if (usedColumns.includes('DIE NO')) {
      row.push(dieDetails.dieCode || 'N/A');
    }
    if (usedColumns.includes('Qty.')) {
      row.push(quantity || 'N/A');
    }
    if (usedColumns.includes('No.of Pages')) {
      row.push('3');
    }
    if (usedColumns.includes('Unit Cost (₹)')) {
      row.push(paperCostPerCard.toFixed(2));
    }
    if (usedColumns.includes('Total (₹)')) {
      row.push(totalCost);
    }
    if (usedColumns.includes('Disc. %')) {
      row.push(discountPercentage);
    }
    if (usedColumns.includes('GST Amt. (₹)')) {
      row.push(gstAmount);
    }
    if (usedColumns.includes('Grand total (₹)')) {
      row.push(grandTotal);
    }

    return row;
  });

  // Render the table
  doc.autoTable({
    startY: 120,
    head: [usedColumns],
    body: tableRows,
    theme: 'plain',
    styles: { 
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fontStyle: 'bold'
    }
  });

  doc.save(`${clientName}_Estimate.pdf`);
};

export const generateGroupJobTicket = (estimates) => {
  // Job Ticket implementation from the previous response
  if (!estimates || estimates.length === 0) {
    console.error('No estimates to generate Job Ticket');
    return;
  }

  const doc = new jsPDF('l', 'mm', 'a4');
  const firstEstimate = estimates[0];
  const clientName = firstEstimate.clientName;

  // Company Logo
  doc.setFontSize(12);
  doc.text('FAMOUS LETTERPRESS', 15, 20);

  // Job Ticket Details
  doc.setFontSize(10);
  doc.text(`Client: ${clientName}`, 15, 30);
  doc.text(`Assigned to: Press Team`, 15, 37);
  doc.text(`Delivery Date: ${formatDate(firstEstimate.deliveryDate)}`, 15, 44);

  // Determine which columns are actually present in the estimates
  const allColumns = [
    'Job', 
    'Paper & GSM', 
    'Die. No', 
    'Final Size', 
    'Closed Size', 
    'Total Ontv.', 
    'Rabies Ontv.', 
    'Frags Ontv.', 
    'Total Sheets', 
    'Total No. of Pages'
  ];

  // Find which columns have data
  const usedColumns = allColumns.filter(column => 
    estimates.some(estimate => {
      switch(column) {
        case 'Job': return estimate.jobDetails?.jobType;
        case 'Paper & GSM': return estimate.jobDetails?.paperName;
        case 'Die. No': return estimate.dieDetails?.dieCode;
        case 'Final Size': return estimate.dieDetails?.dieSize;
        case 'Closed Size': return estimate.dieDetails?.dieSize;
        case 'Total Ontv.': return estimate.jobDetails?.quantity;
        case 'Rabies Ontv.': return estimate.jobDetails?.rabiesOntv;
        case 'Frags Ontv.': return estimate.jobDetails?.fragsOntv;
        case 'Total Sheets': return estimate.jobDetails?.totalSheets;
        case 'Total No. of Pages': return estimate.jobDetails?.totalPages;
        default: return false;
      }
    })
  );

  // Generate Table Rows
  const tableRows = estimates.map((estimate) => {
    const jobDetails = estimate.jobDetails || {};
    const dieDetails = estimate.dieDetails || {};

    const row = [];

    if (usedColumns.includes('Job')) {
      row.push(jobDetails.jobType || 'N/A');
    }
    if (usedColumns.includes('Paper & GSM')) {
      row.push(jobDetails.paperName || 'N/A');
    }
    if (usedColumns.includes('Die. No')) {
      row.push(dieDetails.dieCode || 'N/A');
    }
    if (usedColumns.includes('Final Size')) {
      row.push(dieDetails.dieSize 
        ? `${dieDetails.dieSize.length}" x ${dieDetails.dieSize.breadth}"` 
        : 'N/A');
    }
    if (usedColumns.includes('Closed Size')) {
      row.push(dieDetails.dieSize 
        ? `${dieDetails.dieSize.length}" x ${dieDetails.dieSize.breadth}"` 
        : 'N/A');
    }
    if (usedColumns.includes('Total Ontv.')) {
      row.push(jobDetails.quantity || 'N/A');
    }
    if (usedColumns.includes('Rabies Ontv.')) {
      row.push(jobDetails.rabiesOntv || 'N/A');
    }
    if (usedColumns.includes('Frags Ontv.')) {
      row.push(jobDetails.fragsOntv || 'N/A');
    }
    if (usedColumns.includes('Total Sheets')) {
      row.push(jobDetails.totalSheets || 'N/A');
    }
    if (usedColumns.includes('Total No. of Pages')) {
      row.push(jobDetails.totalPages || 'N/A');
    }

    return row;
  });

  // Render Table
  doc.autoTable({
    startY: 70,
    head: [usedColumns],
    body: tableRows,
    theme: 'plain',
    styles: { 
      fontSize: 8,
      cellPadding: 2
    }
  });

  // Printing Details Section
  const printingDetails = [
    ['LETTER PRESS', estimates.some(e => e.lpDetails?.isLPUsed) ? 'YES' : 'NO'],
    ['FOIL STAMPING', estimates.some(e => e.fsDetails?.isFSUsed) ? 'YES' : 'NO'],
    ['EMBOSSING', estimates.some(e => e.embDetails?.isEMBUsed) ? 'YES' : 'NO'],
    ['DIGITAL', estimates.some(e => e.digiDetails?.isDigiUsed) ? 'YES' : 'NO']
  ];

  doc.autoTable({
    startY: doc.previousAutoTable.finalY + 10,
    body: printingDetails,
    theme: 'plain',
    styles: { 
      fontSize: 8,
      cellPadding: 2
    }
  });

  doc.save(`${clientName}_JobTicket.pdf`);
};

// Helper Functions
const generateEstimateNumber = (estimate) => {
  const date = new Date(estimate.date || new Date());
  return `${estimate.clientName.slice(0,4)}_V1/FLP/${date.getFullYear()}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generateGroupedJobTicketPDF = async (contentRef, groupKey) => {
  if (!contentRef) return;
  const [clientName, projectName] = groupKey.split('-');

  try {
    // Wait for all images to load
    const images = contentRef.getElementsByTagName('img');
    const imagePromises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
    });

    await Promise.all(imagePromises);

    // Generate canvas from the HTML content
    const canvas = await html2canvas(contentRef, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Enable CORS for images
      logging: false,
      allowTaint: true,
      imageTimeout: 0
    });
    
    // Convert canvas to image data
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    
    // Initialize PDF with A4 format
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Calculate dimensions
    const imgWidth = 210; // A4 width in mm
    const imgHeight = canvas.height * imgWidth / canvas.width;
    
    // Handle multiple pages if content is too long
    let position = 0;
    while (position < imgHeight) {
      // Add new page if not first page
      if (position > 0) {
        pdf.addPage();
      }
      
      // Add image to page
      pdf.addImage(
        imgData,
        'JPEG',
        0,
        position === 0 ? 0 : -position, // Adjust position for continuation
        imgWidth,
        imgHeight
      );
      
      position += 297; // A4 height in mm
    }

    // Save the PDF
    pdf.save(`Group_Job_Ticket_${clientName}_${projectName}_${new Date().toISOString().split('T')[0]}.pdf`);
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

// Helper function to calculate page height
const calculatePDFHeight = (element) => {
  const { height } = element.getBoundingClientRect();
  return height * (210 / element.offsetWidth); // Convert to mm based on A4 width (210mm)
};
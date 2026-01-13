import jsPDF from "jspdf";
import "jspdf-autotable";

export const generateGroupEstimatePDF = (estimates) => {
  if (!estimates || estimates.length === 0) {
    console.error("No estimates to generate PDF");
    return;
  }

  const doc = new jsPDF("l", "mm", "a4");
  const pageWidth = doc.internal.pageSize.width;
  const firstEstimate = estimates[0];
  const clientName = firstEstimate.clientName;
  const currentDate = new Date();
  const deliveryDate = firstEstimate.deliveryDate
    ? new Date(firstEstimate.deliveryDate)
    : null;

  // Company Header
  doc.setFontSize(12);
  doc.text("FAMOUS LETTERPRESS", 15, 20);
  doc.setFontSize(9);
  doc.text("1 Tetris Building, Subajil Tinali", 15, 26);
  doc.text("Nagaland, India", 15, 32);
  doc.text("GSTIN: 13ALPPA2458Q2ZO", 15, 38);
  doc.text("Phone no.: +919233152718", 15, 44);
  doc.text("Email: info@famousletterpress.com", 15, 50);

  // Client and Estimate Details
  doc.setTextColor(255, 0, 0);
  doc.text("VERSION", pageWidth - 50, 20);
  doc.setTextColor(0, 0, 0);

  doc.text(`Client: ${clientName}`, pageWidth - 80, 26);
  doc.text(
    `Estimate No: ${generateEstimateNumber(firstEstimate)}`,
    pageWidth - 80,
    32
  );
  doc.text(`Date: ${formatDate(currentDate)}`, pageWidth - 80, 38);
  doc.text(`Delivery Date: ${formatDate(deliveryDate)}`, pageWidth - 80, 44);

  // Bank Details
  doc.text("Bank Details", 15, 60);
  doc.text("FAMOUS", 15, 66);
  doc.text("A/C No: 91202000543206", 15, 72);
  doc.text("IFSC Code: IBKL0000160", 15, 78);
  doc.text("IDBI Bank, Circular Road, Dimapur", 15, 84);

  // Legend
  doc.text("*LP: Letter Press", 15, 94);
  doc.text("*FS: Foil Stamping", 15, 99);
  doc.text("*EMB: Embossing", 15, 104);
  doc.text("*DIGI: Digital Printing", 15, 109);

  // Determine columns with data
  const allColumns = [
    "SL NO",
    "Details",
    "Job",
    "PAPER",
    "DIE NO",
    "Qty.",
    "No.of Pages",
    "Unit Cost (₹)",
    "Total (₹)",
    "Disc. %",
    "Total (₹)",
    "GST Amt. (₹)",
    "Grand total (₹)",
  ];

  const usedColumns = allColumns.filter((column) =>
    estimates.some((estimate) => {
      const jobDetails = estimate.jobDetails || {};
      const calculations = estimate.calculations || {};
      const dieDetails = estimate.dieDetails || {};

      switch (column) {
        case "Details":
          return (
            jobDetails.jobType ||
            estimate.lpDetails?.isLPUsed ||
            dieDetails.dieSize
          );
        case "Job":
          return jobDetails.jobType;
        case "PAPER":
          return jobDetails.paperName;
        case "DIE NO":
          return dieDetails.dieCode;
        case "Qty.":
          return jobDetails.quantity;
        case "No.of Pages":
          return true; // Always show
        case "Unit Cost (₹)":
          return calculations.paperAndCuttingCostPerCard;
        case "Total (₹)":
          return jobDetails.quantity && calculations.paperAndCuttingCostPerCard;
        case "Disc. %":
          return true; // Always show
        case "GST Amt. (₹)":
          return jobDetails.quantity && calculations.paperAndCuttingCostPerCard;
        case "Grand total (₹)":
          return jobDetails.quantity && calculations.paperAndCuttingCostPerCard;
        default:
          return false;
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
    const paperCostPerCard =
      parseFloat(calculations.paperAndCuttingCostPerCard) || 0;
    const totalCost = (quantity * paperCostPerCard).toFixed(2);
    const discountPercentage = "12%";
    const gstAmount = (parseFloat(totalCost) * 0.12).toFixed(2);
    const grandTotal = (parseFloat(totalCost) * 1.12).toFixed(2);

    const row = [];

    if (usedColumns.includes("SL NO")) {
      row.push(String.fromCharCode(65 + index));
    }
    if (usedColumns.includes("Details")) {
      const detailsString = [
        jobDetails.jobType,
        lpDetails.isLPUsed ? `LP ${lpDetails.noOfColors || ""} Colour` : "",
        dieDetails.dieSize
          ? `${dieDetails.dieSize.length}"x${dieDetails.dieSize.breadth}"`
          : "",
      ]
        .filter(Boolean)
        .join(" - ");
      row.push(detailsString || "N/A");
    }
    if (usedColumns.includes("Job")) {
      row.push(jobDetails.jobType || "N/A");
    }
    if (usedColumns.includes("PAPER")) {
      row.push(jobDetails.paperName || "N/A");
    }
    if (usedColumns.includes("DIE NO")) {
      row.push(dieDetails.dieCode || "N/A");
    }
    if (usedColumns.includes("Qty.")) {
      row.push(quantity || "N/A");
    }
    if (usedColumns.includes("No.of Pages")) {
      row.push("3");
    }
    if (usedColumns.includes("Unit Cost (₹)")) {
      row.push(paperCostPerCard.toFixed(2));
    }
    if (usedColumns.includes("Total (₹)")) {
      row.push(totalCost);
    }
    if (usedColumns.includes("Disc. %")) {
      row.push(discountPercentage);
    }
    if (usedColumns.includes("GST Amt. (₹)")) {
      row.push(gstAmount);
    }
    if (usedColumns.includes("Grand total (₹)")) {
      row.push(grandTotal);
    }

    return row;
  });

  // Render the table
  doc.autoTable({
    startY: 120,
    head: [usedColumns],
    body: tableRows,
    theme: "plain",
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fontStyle: "bold",
    },
  });

  doc.save(`${clientName}_Estimate.pdf`);
};

export const generateGroupJobTicket = (estimates) => {
  // Job Ticket implementation from the previous response
  if (!estimates || estimates.length === 0) {
    console.error("No estimates to generate Job Ticket");
    return;
  }

  const doc = new jsPDF("l", "mm", "a4");
  const firstEstimate = estimates[0];
  const clientName = firstEstimate.clientName;

  // Company Logo
  doc.setFontSize(12);
  doc.text("FAMOUS LETTERPRESS", 15, 20);

  // Job Ticket Details
  doc.setFontSize(10);
  doc.text(`Client: ${clientName}`, 15, 30);
  doc.text(`Assigned to: Press Team`, 15, 37);
  doc.text(`Delivery Date: ${formatDate(firstEstimate.deliveryDate)}`, 15, 44);

  // Determine which columns are actually present in the estimates
  const allColumns = [
    "Job",
    "Paper & GSM",
    "Die. No",
    "Final Size",
    "Closed Size",
    "Total Ontv.",
    "Rabies Ontv.",
    "Frags Ontv.",
    "Total Sheets",
    "Total No. of Pages",
  ];

  // Find which columns have data
  const usedColumns = allColumns.filter((column) =>
    estimates.some((estimate) => {
      switch (column) {
        case "Job":
          return estimate.jobDetails?.jobType;
        case "Paper & GSM":
          return estimate.jobDetails?.paperName;
        case "Die. No":
          return estimate.dieDetails?.dieCode;
        case "Final Size":
          return estimate.dieDetails?.dieSize;
        case "Closed Size":
          return estimate.dieDetails?.dieSize;
        case "Total Ontv.":
          return estimate.jobDetails?.quantity;
        case "Rabies Ontv.":
          return estimate.jobDetails?.rabiesOntv;
        case "Frags Ontv.":
          return estimate.jobDetails?.fragsOntv;
        case "Total Sheets":
          return estimate.jobDetails?.totalSheets;
        case "Total No. of Pages":
          return estimate.jobDetails?.totalPages;
        default:
          return false;
      }
    })
  );

  // Generate Table Rows
  const tableRows = estimates.map((estimate) => {
    const jobDetails = estimate.jobDetails || {};
    const dieDetails = estimate.dieDetails || {};

    const row = [];

    if (usedColumns.includes("Job")) {
      row.push(jobDetails.jobType || "N/A");
    }
    if (usedColumns.includes("Paper & GSM")) {
      row.push(jobDetails.paperName || "N/A");
    }
    if (usedColumns.includes("Die. No")) {
      row.push(dieDetails.dieCode || "N/A");
    }
    if (usedColumns.includes("Final Size")) {
      row.push(
        dieDetails.dieSize
          ? `${dieDetails.dieSize.length}" x ${dieDetails.dieSize.breadth}"`
          : "N/A"
      );
    }
    if (usedColumns.includes("Closed Size")) {
      row.push(
        dieDetails.dieSize
          ? `${dieDetails.dieSize.length}" x ${dieDetails.dieSize.breadth}"`
          : "N/A"
      );
    }
    if (usedColumns.includes("Total Ontv.")) {
      row.push(jobDetails.quantity || "N/A");
    }
    if (usedColumns.includes("Rabies Ontv.")) {
      row.push(jobDetails.rabiesOntv || "N/A");
    }
    if (usedColumns.includes("Frags Ontv.")) {
      row.push(jobDetails.fragsOntv || "N/A");
    }
    if (usedColumns.includes("Total Sheets")) {
      row.push(jobDetails.totalSheets || "N/A");
    }
    if (usedColumns.includes("Total No. of Pages")) {
      row.push(jobDetails.totalPages || "N/A");
    }

    return row;
  });

  // Render Table
  doc.autoTable({
    startY: 70,
    head: [usedColumns],
    body: tableRows,
    theme: "plain",
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
  });

  // Printing Details Section
  const printingDetails = [
    [
      "LETTER PRESS",
      estimates.some((e) => e.lpDetails?.isLPUsed) ? "YES" : "NO",
    ],
    [
      "FOIL STAMPING",
      estimates.some((e) => e.fsDetails?.isFSUsed) ? "YES" : "NO",
    ],
    [
      "EMBOSSING",
      estimates.some((e) => e.embDetails?.isEMBUsed) ? "YES" : "NO",
    ],
    [
      "DIGITAL",
      estimates.some((e) => e.digiDetails?.isDigiUsed) ? "YES" : "NO",
    ],
  ];

  doc.autoTable({
    startY: doc.previousAutoTable.finalY + 10,
    body: printingDetails,
    theme: "plain",
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
  });

  doc.save(`${clientName}_JobTicket.pdf`);
};

// Helper Functions
const generateEstimateNumber = (estimate) => {
  const date = new Date(estimate.date || new Date());
  return `${estimate.clientName.slice(0, 4)}_V1/FLP/${date.getFullYear()}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { createRoot } from "react-dom/client";

export const generateGroupedJobTicketPDF = async (contentRef, groupKey) => {
  if (!contentRef) return;
  const [clientName, projectName] = groupKey.split("-");

  try {
    // Pre-process all images
    const images = contentRef.getElementsByTagName("img");
    const imagePromises = Array.from(images).map(async (img) => {
      try {
        if (img.src.startsWith("blob:")) {
          return; // Skip if already blob URL
        }
        const response = await fetch(img.src);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        img.src = objectUrl;
        return objectUrl;
      } catch (error) {
        console.error("Error loading image:", error);
        img.src = "/api/placeholder/400/320";
      }
    });

    const objectUrls = (await Promise.all(imagePromises)).filter(Boolean);

    // Wait for all images to load
    const loadImagePromises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = () => {
          img.src = "/api/placeholder/400/320";
          resolve();
        };
      });
    });

    await Promise.all(loadImagePromises);

    // Generate canvas from the HTML content
    const canvas = await html2canvas(contentRef, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      imageTimeout: 0,
      onclone: (clonedDoc) => {
        Array.from(clonedDoc.getElementsByTagName("img")).forEach((img) => {
          if (!img.complete || img.naturalHeight === 0) {
            img.src = "/api/placeholder/400/320";
          }
          img.crossOrigin = "anonymous";
        });
      },
    });

    // Convert canvas to image data
    const imgData = canvas.toDataURL("image/jpeg", 1.0);

    // Initialize PDF with A4 format
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Calculate dimensions
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Handle multiple pages if content is too long
    let position = 0;
    while (position < imgHeight) {
      if (position > 0) {
        pdf.addPage();
      }

      pdf.addImage(
        imgData,
        "JPEG",
        0,
        position === 0 ? 0 : -position,
        imgWidth,
        imgHeight
      );

      position += 297; // A4 height in mm
    }

    // Cleanup object URLs
    objectUrls.forEach(URL.revokeObjectURL);

    // Save the PDF
    pdf.save(
      `Group_Job_Ticket_${clientName}_${projectName}_${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

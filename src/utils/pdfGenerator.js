import jsPDF from "jspdf";

export async function generatePDF(formData, report, photoAnalysis, photos) {
  const pdf = new jsPDF("p", "mm", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  let cursor = 45;

  const addPageBorder = () => {
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.4);
    pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);
  };

  const addFooter = () => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(120);

    pdf.text(
      `NimaStruc • Professional Structural Audit Platform`,
      pageWidth / 2,
      pageHeight - 5,
      { align: "center" }
    );
  };

  const checkPageBreak = (spaceNeeded = 15) => {
    if (cursor + spaceNeeded > pageHeight - 20) {
      pdf.addPage();
      addPageBorder();
      addFooter();
      pdf.setTextColor(40);
pdf.setFont("helvetica", "normal");
pdf.setFontSize(10);
      cursor = 20;
    }
  };

  const addSectionTitle = (title) => {
    checkPageBreak(20);

    pdf.setFillColor(240, 244, 248);
    pdf.roundedRect(margin, cursor - 5, contentWidth, 10, 2, 2, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(30, 58, 138);

    pdf.text(title, margin + 3, cursor + 2);

    cursor += 15;
  };

  const addParagraph = (text) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(40);

    const lines = pdf.splitTextToSize(text, contentWidth);

    lines.forEach((line) => {
      checkPageBreak(8);
      pdf.text(line, margin, cursor);
      cursor += 6;
    });

    cursor += 2;
  };

  addPageBorder();
  addFooter();

  // HEADER
 
  pdf.setFillColor(29, 78, 216);
  pdf.rect(0, 0, pageWidth, 32, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(255, 255, 255);
  pdf.text("NimaStruc", margin, 15);

  pdf.setFontSize(10);
  pdf.text("Professional Structural Audit Report", margin, 23);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);

  pdf.text(
    `Generated: ${new Date().toLocaleDateString()}`,
    pageWidth - margin,
    15,
    { align: "right" }
  );

   // BUILDING DETAILS
 
  addSectionTitle("Building Information");

  addParagraph(`Building Name: ${formData.buildingName || "N/A"}`);
  addParagraph(`Address: ${formData.address || "N/A"}`);
  addParagraph(`Building Age: ${formData.buildingAge || "N/A"} Years`);
  addParagraph(`Number of Floors: ${formData.floors || "N/A"}`);
  addParagraph(`Inspector: ${formData.inspector || "N/A"}`);
  addParagraph(`Inspection Date: ${new Date().toLocaleDateString()}`);

  // PHOTO ANALYSIS
  
  if (photoAnalysis) {
    addSectionTitle("AI Photo Analysis");

    addParagraph(
      photoAnalysis.summary || "No significant issues detected."
    );

    if (
      photoAnalysis.imageIssues &&
      photoAnalysis.imageIssues.length > 0
    ) {
      photoAnalysis.imageIssues.forEach((issue) => {
        addParagraph(
          `Image ${issue.imageIndex}: ${issue.issueType} - ${issue.description}`
        );
      });
    }
  }

    // AUDIT REPORT
  
  addSectionTitle("Structural Findings & Assessment");

  let cleanedReport = report || "No report generated.";

cleanedReport = cleanedReport.replace(
  /STRUCTURAL AUDIT REPORT[\s\S]*?OBSERVATIONS:/i,
  "OBSERVATIONS:"
);

addParagraph(cleanedReport);

  // =====================
  // PHOTOS
  // =====================

  if (photos && photos.length > 0) {
    addSectionTitle("Inspection Photos");

    const imageWidth = 80;
    const imageHeight = 55;

    let x = margin;

   for (let i = 0; i < photos.length; i++) {
  checkPageBreak(imageHeight + 20);

  try {
    console.log(`Adding photo ${i + 1}`);

    const format = photos[i]?.includes?.("image/png")
      ? "PNG"
      : "JPEG";

    pdf.addImage(
      photos[i],
      format,
      x,
      cursor,
      imageWidth,
      imageHeight
    );

    pdf.setFontSize(9);
    pdf.text(
      `Photo ${i + 1}`,
      x,
      cursor + imageHeight + 5
    );
  } catch (err) {
    console.error(`Failed photo ${i + 1}`, err);
  }

  if (x === margin) {
    x = margin + imageWidth + 10;
  } else {
    x = margin;
    cursor += imageHeight + 15;
  }
}

    cursor += imageHeight + 10;
  }

  // =====================
  // DISCLAIMER
  // =====================

  addSectionTitle("Remarks");

  addParagraph(
    "This report is generated based on the information and photographs provided during inspection. Detailed structural investigation may be required for final engineering recommendations."
  );

  // =====================
  // PAGE NUMBERS
  // =====================

  const totalPages = pdf.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);

    pdf.setFontSize(8);
    pdf.setTextColor(120);

    pdf.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - 15,
      pageHeight - 5,
      { align: "right" }
    );
  }

  return pdf;
}
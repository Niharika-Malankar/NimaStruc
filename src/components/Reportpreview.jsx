import { generatePDF } from "../utils/pdfGenerator";

export default function ReportPreview({
  formData,
  report,
  photoAnalysis,
  photos,
  analysisEnabled,
  onDownloadPDF,
  onNewAudit,
  reportRef,
}) {
  const handleDownload = async () => {
    console.log("Photos count:", photos.length);
console.log("Photos:", photos);
    try {
      const pdf = await generatePDF(formData, report, photoAnalysis, photos);
      pdf.save(
        `${(formData.buildingName || "Building").replace(/\s+/g, "_")}_Structural_Audit_Report.pdf`
      );
    } catch (error) {
      console.error("PDF Download Error:", error);
      alert("Failed to download PDF. Please try again.");
    }
  };

  return (
    <div className="preview-section container">
      <div className="preview-header mb-4">
        <div>
          <h1>Report Preview</h1>
          <p>Review the generated report before downloading</p>
          {!analysisEnabled && (
            <div
              style={{
                background: "#fff7db",
                color: "#92400e",
                padding: "0.55rem 0.75rem",
                borderRadius: "0.75rem",
                marginTop: "0.75rem",
                border: "1px solid #f5deb3",
                maxWidth: "max-content",
              }}
            >
              Demo Mode: photo analysis is disabled because the quota is unavailable.
            </div>
          )}
        </div>
        <div className="preview-actions">
          <button className="btn-success btn-large" onClick={handleDownload}>
            📥 Download PDF
          </button>
          <button className="btn-secondary" onClick={onNewAudit}>
            ↩️ New Audit
          </button>
        </div>
      </div>

      <div className="report-container card" ref={reportRef}>
        <div className="report-header">
          <div className="report-title-section">
            <h1>STRUCTURAL AUDIT REPORT</h1>
            <p className="report-subtitle">NimaStruc</p>
          </div>
          <div className="report-meta">
            <div className="meta-item">
              <span className="meta-label">Report Date</span>
              <span className="meta-value">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Building</span>
              <span className="meta-value">{formData.buildingName}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Inspector</span>
              <span className="meta-value">{formData.inspector}</span>
            </div>
          </div>
        </div>

        <div className="report-building-info">
          <h3>Building Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Building Name</span>
              <span className="value">{formData.buildingName}</span>
            </div>
            <div className="info-item">
              <span className="label">Address</span>
              <span className="value">{formData.address}</span>
            </div>
            <div className="info-item">
              <span className="label">Age</span>
              <span className="value">{formData.buildingAge} years</span>
            </div>
            <div className="info-item">
              <span className="label">Floors</span>
              <span className="value">{formData.floors}</span>
            </div>
          </div>
        </div>

        {photos.length > 0 && (
          <div className="report-photos">
            <h3>📸 Inspection Photos</h3>
            <div className="photo-gallery-report">
              {photos.map((photo, index) => (
                <div key={index} className="photo-report-item">
                  <img src={photo} alt={`Inspection ${index + 1}`} />
                  <p>Photo {index + 1}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {photoAnalysis && (
          <div className="report-photo-analysis">
            <h3>Photo Issue Identification</h3>
            <p>{photoAnalysis.summary}</p>
            {photoAnalysis.imageIssues && photoAnalysis.imageIssues.length > 0 && (
              <ul>
                {photoAnalysis.imageIssues.map((issue, index) => (
                  <li key={index}>
                    <strong>Image {issue.imageIndex}:</strong> {issue.issueType} — {issue.description}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="report-content">
          <h3>Audit Report</h3>
          <div className="report-text">
            {report.split("\n").map((line, index) => {
              if (line.trim() === "") {
                return <br key={index} />;
              }
              return <p key={index}>{line}</p>;
            })}
          </div>
        </div>

        <div className="report-footer">
          <p>Generated by NimaStruc - Professional Structural Audit Platform</p>
        </div>
      </div>
    </div>
  );
}

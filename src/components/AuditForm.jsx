import { useState } from "react";

export default function AuditForm({
  formData,
  onFormChange,
  onPhotoUpload,
  onPhotoRemove,
  onGenerateReport,
  onRunAnalysis,
  photos,
  errors,
  loading,
  generalError,
  analysisOutput,
  analysisError,
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFormChange(name, value);
  };

  const handlePhotoUpload = (e) => {
    onPhotoUpload(e);
  };

  return (
    <div className="form-section container">
      <div className="form-header mb-6">
        <h1>Structural Audit Form</h1>
        <p>
          Complete this form to generate a professional structural audit
          report using the inspection assistant.
        </p>
      </div>

      {generalError && (
        <div className="alert alert-error mb-4">
          <span>⚠️</span>
          {generalError}
        </div>
      )}

      <div className="form-grid">
        {/* Building Information Card */}
        <div className="card">
          <div className="card-header">
            <h2>🏢 Building Information</h2>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="buildingName">Building Name *</label>
              <input
                id="buildingName"
                type="text"
                name="buildingName"
                placeholder="e.g., Main Office Building"
                value={formData.buildingName}
                onChange={handleChange}
                className={errors.buildingName ? "error" : ""}
              />
              {errors.buildingName && (
                <span className="error-text">{errors.buildingName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <input
                id="address"
                type="text"
                name="address"
                placeholder="e.g., 123 Main Street, City"
                value={formData.address}
                onChange={handleChange}
                className={errors.address ? "error" : ""}
              />
              {errors.address && (
                <span className="error-text">{errors.address}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="buildingAge">Building Age (years) *</label>
                <input
                  id="buildingAge"
                  type="number"
                  name="buildingAge"
                  placeholder="e.g., 15"
                  value={formData.buildingAge}
                  onChange={handleChange}
                  className={errors.buildingAge ? "error" : ""}
                />
                {errors.buildingAge && (
                  <span className="error-text">{errors.buildingAge}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="floors">Number of Floors *</label>
                <input
                  id="floors"
                  type="number"
                  name="floors"
                  placeholder="e.g., 5"
                  value={formData.floors}
                  onChange={handleChange}
                  className={errors.floors ? "error" : ""}
                />
                {errors.floors && (
                  <span className="error-text">{errors.floors}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="inspector">Inspector Name *</label>
              <input
                id="inspector"
                type="text"
                name="inspector"
                placeholder="Your name"
                value={formData.inspector}
                onChange={handleChange}
                className={errors.inspector ? "error" : ""}
              />
              {errors.inspector && (
                <span className="error-text">{errors.inspector}</span>
              )}
            </div>
          </div>
        </div>

        {/* Inspection Findings Card */}
        <div className="card">
          <div className="card-header">
            <h2>🔍 Inspection Findings</h2>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="cracks">Cracks Observed</label>
              <textarea
                id="cracks"
                name="cracks"
                placeholder="Describe any cracks observed (location, size, pattern, etc.)"
                value={formData.cracks}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="leakage">Leakage Issues</label>
              <textarea
                id="leakage"
                name="leakage"
                placeholder="Describe any water leakage or seepage (location, severity)"
                value={formData.leakage}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="corrosion">Corrosion</label>
              <textarea
                id="corrosion"
                name="corrosion"
                placeholder="Describe any corrosion observed (reinforcement, steel, etc.)"
                value={formData.corrosion}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="remarks">Additional Remarks</label>
              <textarea
                id="remarks"
                name="remarks"
                placeholder="Any other observations or notes"
                value={formData.remarks}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Photo Upload Card */}
        <div className="card">
          <div className="card-header">
            <h2>📸 Upload Inspection Photos</h2>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="photo-upload">Upload Photos (Max 5)</label>
              <div className="photo-upload-area">
                <input
                  id="photo-upload"
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  onChange={handlePhotoUpload}
                  disabled={photos.length >= 5}
                />
                <div className="upload-hint">
                  <span>📁</span>
                  <p>Click to select or drag photos here</p>
                  <small>The system checks images for crack or bulging patterns.</small>
                </div>
              </div>
              {errors.photos && (
                <span className="error-text">{errors.photos}</span>
              )}
            </div>

            {photos.length > 0 && (
              <div className="photo-gallery">
                <p className="font-semibold mb-2">
                  {photos.length} photo(s) selected
                </p>
                <div className="photo-grid">
                  {photos.map((photo, index) => (
                    <div key={index} className="photo-item">
                      <img src={photo} alt={`Upload ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-photo"
                        onClick={() => onPhotoRemove(index)}
                        title="Remove photo"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="form-actions mt-6">
        <button
          className="btn-primary btn-large"
          onClick={onGenerateReport}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Generating Report...
            </>
          ) : (
            <>✨ Generate Report</>
          )}
        </button>

        <button
          type="button"
          className="btn-secondary btn-large"
          onClick={onRunAnalysis}
          disabled={loading}
        >
          🧪 Review Photo Analysis
        </button>
      </div>

      {(analysisError || analysisOutput) && (
        <div className="debug-panel card mt-4">
          <div className="card-header">
            <h3>Analysis Output</h3>
          </div>
          <div className="card-body">
            {analysisError ? (
              <div className="alert alert-error">{analysisError}</div>
            ) : (
              <pre className="debug-output">{analysisOutput}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

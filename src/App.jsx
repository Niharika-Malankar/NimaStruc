import { useState, useRef } from "react";
import { generateInspectionReport } from "./services/gemini";
import Navbar from "./components/Navbar";
import AuditForm from "./components/AuditForm";
import ReportPreview from "./components/ReportPreview";
import "./App.css";

function App() {
  const reportRef = useRef();

  const [currentStep, setCurrentStep] = useState("form");
  const [formData, setFormData] = useState({
    buildingName: "",
    address: "",
    buildingAge: "",
    floors: "",
    inspector: "",
    cracks: "",
    leakage: "",
    corrosion: "",
    remarks: "",
  });

  const [photos, setPhotos] = useState([]);
  const [inspectionResult, setInspectionResult] = useState(null);
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [analysisOutput, setAnalysisOutput] = useState("");
  const [analysisError, setAnalysisError] = useState("");
  const [analysisEnabled, setAnalysisEnabled] = useState(true);

  const handleFormChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

const handlePhotoUpload = (e) => {
  const files = Array.from(e.target.files);

  const unsupportedFiles = files.filter(
    (file) =>
      file.type === "image/avif" ||
      file.name.toLowerCase().endsWith(".avif")
  );

  if (unsupportedFiles.length > 0) {
    setErrors({
      photos:
        "AVIF images are not supported. Please upload JPG, JPEG, or PNG files.",
    });
    return;
  }

  if (photos.length + files.length > 5) {
    setErrors({ photos: "Maximum 5 photos allowed" });
    return;
  }

  const readers = files.map((file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  });

  Promise.all(readers).then((results) => {
    setPhotos([...photos, ...results]);
    setErrors({ photos: "" });
  });
};
  const handlePhotoRemove = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.buildingName.trim()) newErrors.buildingName = "Building name is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.buildingAge) newErrors.buildingAge = "Building age is required";
    if (!formData.floors) newErrors.floors = "Number of floors is required";
    if (!formData.inspector.trim()) newErrors.inspector = "Inspector name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateReport = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setAnalysisOutput("");
    setAnalysisError("");

    try {
      const inspectionData = {
        ...formData,
        photos,
      };
      const result = await generateInspectionReport(inspectionData);
      setReport(result.reportText);
      setInspectionResult(result.photoAnalysis);
      setAnalysisEnabled(result.analysisAvailable !== false);
      setCurrentStep("preview");
    } catch (error) {
      console.error(error);
      setErrors({ general: "Failed to generate report. Please try again." });
    }

    setLoading(false);
  };

  const runAnalysisCheck = async () => {
    setLoading(true);
    setAnalysisOutput("");
    setAnalysisError("");

    try {
      const inspectionData = {
        ...formData,
        photos,
      };
      const result = await generateInspectionReport(inspectionData);
      setAnalysisOutput(JSON.stringify(result, null, 2));
      setAnalysisEnabled(result.analysisAvailable !== false);
    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalysisError("Analysis failed. Check the console and your API key.");
    }

    setLoading(false);
  };

  const handleResetForm = () => {
    setFormData({
      buildingName: "",
      address: "",
      buildingAge: "",
      floors: "",
      inspector: "",
      cracks: "",
      leakage: "",
      corrosion: "",
      remarks: "",
    });
    setPhotos([]);
    setReport("");
    setInspectionResult(null);
    setErrors({});
    setCurrentStep("form");
  };

  return (
    <div className="app">
      <Navbar />

      <div className="app-content">
        {currentStep === "form" && (
          <AuditForm
            formData={formData}
            onFormChange={handleFormChange}
            onPhotoUpload={handlePhotoUpload}
            onPhotoRemove={handlePhotoRemove}
            onGenerateReport={handleGenerateReport}
            onRunAnalysis={runAnalysisCheck}
            photos={photos}
            errors={errors}
            loading={loading}
            generalError={errors.general}
            analysisOutput={analysisOutput}
            analysisError={analysisError}
          />
        )}

        {currentStep === "preview" && (
          <ReportPreview
            formData={formData}
            report={report}
            photoAnalysis={inspectionResult}
            photos={photos}
            analysisEnabled={analysisEnabled}
            onNewAudit={handleResetForm}
            reportRef={reportRef}
          />
        )}
      </div>
    </div>
  );
}

export default App;
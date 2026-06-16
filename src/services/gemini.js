console.log(import.meta.env.VITE_GEMINI_API_KEY);
import { GoogleGenerativeAI } from "@google/generative-ai";

const modelClient = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

function parsePhotoAnalysis(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    // try direct parse as fallback
    try {
      return { ...JSON.parse(text), rawJson: text };
    } catch (e) {
      return null;
    }
  }

  const jsonString = text.slice(start, end + 1);
  try {
    const parsed = JSON.parse(jsonString);
    return { ...parsed, rawJson: jsonString };
  } catch (error) {
    console.warn("Failed to parse JSON from model response", error);
    return null;
  }
}

// Simple client-side image resize to limit upload size and improve visibility
async function preprocessPhoto(dataUrl) {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const MAX_WIDTH = 1600;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        // export as high-quality jpeg
        const out = canvas.toDataURL("image/jpeg", 0.92);
        resolve(out);
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    } catch (e) {
      resolve(dataUrl);
    }
  });
}

export async function generateInspectionReport(data) {
  try {
    const model = modelClient.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const imageParts = [];
    // Process uploaded images (preprocess to reasonable size)
    if (data.photos && data.photos.length > 0) {
      for (let i = 0; i < data.photos.length; i++) {
        const raw = data.photos[i];
        const pre = await preprocessPhoto(raw);
        imageParts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: pre.split(",")[1], // Get base64 part
          },
        });
      }
    }

    const promptParts = [
      "You are a professional structural engineer. Analyze the uploaded inspection photos for visible structural issues, especially cracks or bulging on walls, beams, slabs, or columns. Reply ONLY with valid JSON. Do NOT include any extra commentary.",
      "",
      "Return JSON using this structure and include a confidence (0.0-1.0) per image. Example:",
      "{",
      '  "photoAnalysis": {',
      '    "summary": "Two images show small hairline cracks; one image shows no visible issue.",',
      '    "imageIssues": [',
      '      {"imageIndex": 1, "issueType": "crack", "confidence": 0.92, "description": "Hairline vertical crack near corner, ~10cm"},',
      '      {"imageIndex": 2, "issueType": "none", "confidence": 0.15, "description": "No visible cracks or bulging."}',
      '    ]',
      '  },',
      '  "reportText": "A professional structural audit report using the building information and photo findings."',
      '}',
      "",
      "Now produce JSON for these images. If uncertain about an image, set 'issueType' to \"none\" and use a low confidence (<0.5). Do not fabricate measurements. Use the BUILDING INFORMATION and OBSERVED CONDITIONS below to write the 'reportText' section.",
      "",
      "BUILDING INFORMATION:",
      "- Name: " + (data.buildingName || "N/A"),
      "- Address: " + (data.address || "N/A"),
      "- Age: " + (data.buildingAge || "N/A") + " years",
      "- Number of Floors: " + (data.floors || "N/A"),
      "- Inspector: " + (data.inspector || "N/A"),
      "- Inspection Date: " + (new Date().toLocaleDateString()),
      "",
      "OBSERVED CONDITIONS:",
      "- Cracks: " + (data.cracks || "No cracks observed"),
      "- Leakage Issues: " + (data.leakage || "No leakage issues observed"),
      "- Corrosion: " + (data.corrosion || "No corrosion observed"),
      "- Additional Remarks: " + (data.remarks || "None"),
    ];

    const prompt = promptParts.join("\n");

    const result = await model.generateContent([
      ...imageParts,
      prompt,
    ]);

    const responseText = result.response.text();
    console.debug("Model raw response:", responseText);
    const parsed = parsePhotoAnalysis(responseText);

    const photoAnalysis = parsed?.photoAnalysis || {
      summary: "No photo issue details were detected.",
      imageIssues: [],
    };

    const reportText = parsed?.reportText
      ? parsed.reportText.trim()
      : responseText.replace(parsed?.rawJson || "", "").trim();

    return { reportText, photoAnalysis, analysisAvailable: true };

  } catch (error) {
    console.error("Model error:", error);

    const quotaMessage =
      (error?.message || "").toLowerCase().includes("quota") ||
      (error?.message || "").includes("429") ||
      (error?.message || "").includes("free_tier")
        ? "Gemini quota exceeded. AI photo analysis is currently unavailable. The report has been generated using manual inspection data only."
        : "Photo analysis is unavailable at this time.";

    return {
      reportText: `OBSERVATIONS:
• Cracks: ${data.cracks || "None observed"}
• Leakage: ${data.leakage || "None observed"}
• Corrosion: ${data.corrosion || "None observed"}

NOTE:
${quotaMessage}

RISK ASSESSMENT:
Based on the observations provided, the building shows moderate structural characteristics.

REMEDIAL MEASURES & SUGGESTIONS:
1. Conduct detailed inspection of identified issues
2. Repair visible cracks with appropriate materials
3. Investigate water seepage sources and apply waterproofing
4. Inspect reinforcement for corrosion damage
5. Schedule follow-up inspection in 6–12 months

MAINTENANCE RECOMMENDATIONS:
• Regular visual inspections every 6 months
• Preventive maintenance as needed
• Keep documentation of all repairs

Remarks:
${data.remarks || "None"}
`,
      photoAnalysis: {
        summary: `Photo analysis unavailable. ${quotaMessage}`,
        imageIssues: [],
      },
      analysisAvailable: false,
    };
  }
}
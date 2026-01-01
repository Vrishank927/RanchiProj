import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = process.env.PORT || 5000;

// --------------------
// Path setup (ESM fix)
// --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------
// Middleware
// --------------------
app.use(cors());
app.use(express.json());

// --------------------
// Environment variables
// --------------------
const MONGO_URI = process.env.MONGO_URI;
const API_KEY = process.env.API_KEY;

// --------------------
// MongoDB Connection
// --------------------
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas Cluster"))
  .catch((err) =>
    console.error("❌ MongoDB Connection Error:", err)
  );

// --------------------
// Mongoose Schema
// --------------------
const HistorySchema = new mongoose.Schema({
  riskLevel: String,
  confidenceScore: Number,
  category: String,
  reason: String,
  recommendedAction: String,
  parentAlert: String,
  contentSnippet: String,
  timestamp: { type: Date, default: Date.now }
});

const History = mongoose.model("History", HistorySchema);

// --------------------
// API: Security Scan
// --------------------
app.post("/api/scan", async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res
      .status(400)
      .json({ error: "Payload missing content field." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this content for child safety: "${content}"`,
      config: {
        systemInstruction: `
You are SafeBrowse AI, an online child-safety engine.
Classify content risk as LOW, MEDIUM, or HIGH.
Detect grooming, manipulation, sexual content,
secrecy requests, cyberbullying, or self-harm.
Return ONLY valid JSON.
        `,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
            category: { type: Type.STRING },
            reason: { type: Type.STRING },
            recommendedAction: { type: Type.STRING },
            parentAlert: { type: Type.STRING }
          },
          required: [
            "riskLevel",
            "confidenceScore",
            "category",
            "reason",
            "recommendedAction",
            "parentAlert"
          ]
        }
      }
    });

    const aiResult = JSON.parse(response.text);

    const logEntry = new History({
      ...aiResult,
      contentSnippet:
        content.slice(0, 500) + (content.length > 500 ? "..." : "")
    });

    const savedLog = await logEntry.save();
    res.json(savedLog);

  } catch (error) {
    console.error("Security Scan Logic Error:", error);
    res.status(500).json({
      error: "The AI protection engine failed to process the request."
    });
  }
});

// --------------------
// API: History
// --------------------
app.get("/api/history", async (req, res) => {
  try {
    const history = await History.find()
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(history);
  } catch {
    res.status(500).json({ error: "Database retrieval error." });
  }
});

// --------------------
// API: Clear History
// --------------------
app.delete("/api/history", async (req, res) => {
  try {
    await History.deleteMany({});
    res.json({ message: "Audit logs cleared successfully." });
  } catch {
    res.status(500).json({ error: "Database write error." });
  }
});

// --------------------
// ✅ Serve React Frontend
// --------------------
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// --------------------
// Start Server
// --------------------
app.listen(PORT, () => {
  console.log(`🚀 SafeBrowse AI Backend running on port ${PORT}`);
});

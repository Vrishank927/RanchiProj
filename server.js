import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = process.env.PORT || 10000;

// Needed for ES modules (__dirname replacement)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------- Middleware --------------------
app.use(cors());
app.use(express.json());

// -------------------- MongoDB --------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas Cluster"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// -------------------- Schema --------------------
const HistorySchema = new mongoose.Schema({
  riskLevel: String,
  confidenceScore: Number,
  category: String,
  reason: String,
  recommendedAction: String,
  parentAlert: String,
  contentSnippet: String,
  timestamp: { type: Date, default: Date.now },
});

const History = mongoose.model("History", HistorySchema);

// -------------------- API ROUTES --------------------
app.post("/api/scan", async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: "Content missing" });

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this content for child safety: "${content}"`,
      config: {
        systemInstruction:
          "Classify content risk as LOW, MEDIUM, or HIGH. Return JSON only.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
            category: { type: Type.STRING },
            reason: { type: Type.STRING },
            recommendedAction: { type: Type.STRING },
            parentAlert: { type: Type.STRING },
          },
          required: [
            "riskLevel",
            "confidenceScore",
            "category",
            "reason",
            "recommendedAction",
            "parentAlert",
          ],
        },
      },
    });

    const aiResult = JSON.parse(response.text);

    const log = await History.create({
      ...aiResult,
      contentSnippet: content.slice(0, 500),
    });

    res.json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI scan failed" });
  }
});

app.get("/api/history", async (_, res) => {
  const data = await History.find().sort({ timestamp: -1 }).limit(100);
  res.json(data);
});

app.delete("/api/history", async (_, res) => {
  await History.deleteMany({});
  res.json({ message: "History cleared" });
});

// -------------------- SERVE FRONTEND --------------------
// 🔥 THIS IS WHAT YOU WERE MISSING
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// -------------------- START SERVER --------------------
app.listen(PORT, () => {
  console.log(`🚀 SafeBrowse AI running on port ${PORT}`);
});

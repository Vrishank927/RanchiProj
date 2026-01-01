import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ❗ IMPORTANT: Move secrets to environment variables
const MONGO_URI = process.env.MONGO_URI;

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas Cluster'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Incident Schema for Parental Auditing
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

const History = mongoose.model('History', HistorySchema);

// 🔐 Security Scan Endpoint
app.post('/api/scan', async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Payload missing content field.' });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.API_KEY
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this content for child safety: "${content}"`,
      config: {
        systemInstruction: `
You are SafeBrowse AI, an online child-safety engine.
Classify content risk as LOW, MEDIUM, or HIGH.
Detect grooming, manipulation, sexual content, secrecy requests,
cyberbullying, or self-harm.
Return ONLY valid JSON.
        `,
        responseMimeType: 'application/json',
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
            'riskLevel',
            'confidenceScore',
            'category',
            'reason',
            'recommendedAction',
            'parentAlert'
          ]
        }
      }
    });

    const aiResult = JSON.parse(response.text);

    const logEntry = new History({
      ...aiResult,
      contentSnippet:
        content.slice(0, 500) + (content.length > 500 ? '...' : '')
    });

    const savedLog = await logEntry.save();
    res.json(savedLog);

  } catch (error) {
    console.error('Security Scan Logic Error:', error);
    res.status(500).json({
      error: 'The AI protection engine failed to process the request.'
    });
  }
});

// 📊 History Retrieval
app.get('/api/history', async (req, res) => {
  try {
    const history = await History
      .find()
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(history);
  } catch {
    res.status(500).json({ error: 'Database retrieval error.' });
  }
});

// 🧹 Privacy Purge
app.delete('/api/history', async (req, res) => {
  try {
    await History.deleteMany({});
    res.json({ message: 'Audit logs cleared successfully.' });
  } catch {
    res.status(500).json({ error: 'Database write error.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 SafeBrowse AI Backend running on port ${PORT}`);
});


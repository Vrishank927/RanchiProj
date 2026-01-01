
import { GoogleGenAI, Type } from "@google/genai";
import { ScanResult } from "../types";

export class GeminiService {
  async scanContent(content: string): Promise<ScanResult> {
    try {
      // Initialize inside the method to ensure fresh context and API key access
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this content for child safety: "${content}"`,
        config: {
          systemInstruction: "You are SafeBrowse AI, an online child-safety engine. Analyze content for minors and classify risk as LOW, MEDIUM, or HIGH. Detect grooming, manipulation, sexual content, secrecy requests, cyberbullying, or self-harm. Return ONLY valid JSON.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskLevel: {
                type: Type.STRING,
                description: "Risk classification (LOW, MEDIUM, HIGH)",
              },
              confidenceScore: {
                type: Type.NUMBER,
                description: "AI confidence from 0 to 1",
              },
              category: {
                type: Type.STRING,
                description: "The type of threat detected (e.g., Grooming, Bullying, Normal)",
              },
              reason: {
                type: Type.STRING,
                description: "Brief explanation of the finding",
              },
              recommendedAction: {
                type: Type.STRING,
                description: "Action for the filter (ALLOW, MONITOR, BLOCK)",
              },
              parentAlert: {
                type: Type.STRING,
                description: "Message for the parent dashboard",
              },
            },
            required: ["riskLevel", "confidenceScore", "category", "reason", "recommendedAction", "parentAlert"],
          },
        },
      });

      const resultText = response.text;
      if (!resultText) throw new Error("No response from AI");
      
      return JSON.parse(resultText) as ScanResult;
    } catch (error) {
      console.error("Gemini Scan Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();

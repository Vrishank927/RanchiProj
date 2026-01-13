
import { GoogleGenAI, Type } from "@google/genai";
import { ScanResult, RiskType } from "../types";

export class GeminiService {
  async scanContent(content: string): Promise<ScanResult> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this content/URL for child safety, phishing, and grooming: "${content}"`,
        config: {
          systemInstruction: `You are SafeBrowse AI, a cybersecurity and child-safety engine.
          
          TASK 1: PHISHING DETECTION
          - Check if the input is a URL. Look for typosquatting (e.g., 'g00gle.com'), fake login prompts, or urgency/scam language.
          - Flag credential harvesting or financial requests.
          
          TASK 2: GROOMING DETECTION
          - Analyze language for early signs of online grooming: secrecy requests ('don't tell anyone'), trust-building, isolation, or boundary pushing.
          - Assign a Grooming Risk Score. Do NOT be accusatory, but be vigilant about patterns.
          
          TASK 3: OUTPUT
          Return a JSON object classifying the 'riskType' as PHISHING, GROOMING, or GENERAL_SAFETY.
          Include 'signalsDetected' (e.g., ['typosquatting', 'urgency'] or ['secrecy_request']).
          Maintain an educational tone for children and a detailed alert tone for parents.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskType: { type: Type.STRING, description: "PHISHING, GROOMING, or GENERAL_SAFETY" },
              riskLevel: { type: Type.STRING },
              confidenceScore: { type: Type.NUMBER },
              category: { type: Type.STRING },
              reason: { type: Type.STRING },
              recommendedAction: { type: Type.STRING },
              parentAlert: { type: Type.STRING },
              educationalGuidance: { type: Type.STRING },
              safetyConsequences: { type: Type.STRING },
              signalsDetected: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Specific triggers found (e.g., 'credential_harvesting', 'emotional_dependency')"
              },
            },
            required: ["riskType", "riskLevel", "confidenceScore", "category", "reason", "recommendedAction", "parentAlert", "educationalGuidance", "safetyConsequences"],
          },
        },
      });

      const resultText = response.text;
      if (!resultText) throw new Error("No response from AI");
      
      return JSON.parse(resultText) as ScanResult;
    } catch (error) {
      console.error("Gemini Security Engine Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();

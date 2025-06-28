
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// IMPORTANT: This relies on process.env.API_KEY being available in the execution environment.
// For client-side browser applications, this typically means it's been set via a build process (e.g., Vite, Webpack)
// or is globally available on the window object. The prompt specifies to assume its availability.
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn(
    "Gemini API Key not found in process.env.API_KEY. AI features will be disabled or use mock data. " +
    "Ensure the API_KEY environment variable is configured and accessible."
  );
}

const modelName = 'gemini-2.5-flash-preview-04-17';

export const suggestItemDescriptions = async (keyword: string): Promise<string[]> => {
  if (!ai) {
    console.warn("Gemini API not initialized. Returning mock item descriptions.");
    return [`Mock description for '${keyword}' 1`, `Detailed item: ${keyword} (mocked)`, `Another suggestion for ${keyword}`];
  }

  try {
    const prompt = `Generate 3 concise and distinct item descriptions for an invoice, based on the keyword: "${keyword}". Each description should be suitable for a line item. Provide each on a new line. Do not use markdown list styling (like '-' or '*').`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 0.7,
        topK: 10,
        // thinkingConfig: { thinkingBudget: 0 } // Optional: for lower latency if quality is less critical
      }
    });

    const text = response.text;
    if (!text) return [];

    return text.split('\n').map(desc => desc.trim()).filter(desc => desc.length > 5 && desc.length < 150);
  } catch (error) {
    console.error("Error suggesting item descriptions from Gemini:", error);
    // Provide a more user-friendly error or specific fallback
    return [`Error fetching suggestions. Please try again or enter manually.`];
  }
};

export const suggestInvoiceNote = async (context: string): Promise<string> => {
  if (!ai) {
    console.warn("Gemini API not initialized. Returning mock invoice note.");
    return `Thank you for your business. This is a mock note based on context: "${context}".`;
  }

  try {
    const prompt = `Generate a short, professional, and friendly invoice note. The context for the note is: "${context}". If no specific context is given, provide a general thank you note. The note should be 1-2 sentences.`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 0.5,
        // thinkingConfig: { thinkingBudget: 0 } 
      }
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error suggesting invoice note from Gemini:", error);
    return `Error fetching note suggestion. Please write one manually.`;
  }
};


import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

/**
 * Conceptual Backend API Route
 * In a real-world scenario, this logic would live on a server (e.g., Next.js API route).
 * For this implementation, it's encapsulated here to be called by the frontend.
 */
export const processStatement = async (file: File): Promise<Transaction[]> => {
  // SSR check: FileReader is a browser-only API
  if (typeof window === 'undefined') {
    throw new Error("Cannot process file in a non-browser environment.");
  }

  // Step 1: Convert File to Base64 (Simulating reading the request body)
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Step 2: Initialize Gemini (Backend Logic)
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Data,
            },
          },
          {
            text: "Extract all individual transactions from this bank statement. Ignore headers, footers, and summary sections. Categorize each transaction into one of these: 'Food & Dining', 'Travel', 'Savings/Investments', 'Shopping', 'Utilities', 'Entertainment', 'Health', or 'Others'. Return a clean JSON array of objects.",
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING, description: "ISO 8601 date (YYYY-MM-DD)" },
            description: { type: Type.STRING },
            amount: { type: Type.NUMBER, description: "Absolute positive value" },
            type: { type: Type.STRING, enum: ["DEBIT", "CREDIT"] },
            category: { type: Type.STRING, enum: ['Food & Dining', 'Travel', 'Savings/Investments', 'Shopping', 'Utilities', 'Entertainment', 'Health', 'Others'] }
          },
          required: ["date", "description", "amount", "type", "category"],
        },
      },
    },
  });

  // Step 3: Parse and Return JSON
  try {
    const rawText = response.text || "[]";
    const transactions = JSON.parse(rawText) as any[];
    return transactions.map((t, index) => ({
      ...t,
      id: `${t.date}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.abs(t.amount),
    }));
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Could not extract transactions from PDF. Invalid statement format.");
  }
};

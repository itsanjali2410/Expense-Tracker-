
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

export const processStatement = async (file: File): Promise<Transaction[]> => {
  if (typeof window === 'undefined') {
    throw new Error("Cannot process file in a non-browser environment.");
  }

  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

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
            text: `Extract every individual transaction from this bank statement. 
            
            Strictly categorize each into exactly one of these granular categories: 
            'Groceries', 'Dining Out', 'Electronics', 'Clothing', 'Travel', 'Healthcare', 
            'Education', 'Entertainment', 'Home Improvement', 'Utilities & Bills', 
            'Subscriptions', 'Salary', 'Investments', 'Bank Fees', 'Transfers', 'Misc'.
            
            Guidelines:
            - Break down 'Shopping' into 'Electronics' (gadgets, hardware) or 'Clothing' (apparel, shoes).
            - 'Groceries' are supermarket or food supply runs.
            - 'Dining Out' covers restaurants, cafes, and food delivery.
            - 'Utilities & Bills' includes electricity, water, internet, and phone.
            - 'Subscriptions' are recurring digital services (Netflix, Spotify, Amazon Prime).
            - Identify 'Salary' or 'Income' for credits.
            - Ignore balance carry-forwards or summary sections.
            - Return a clean JSON array of transaction objects.`,
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
            date: { type: Type.STRING, description: "YYYY-MM-DD format" },
            description: { type: Type.STRING },
            amount: { type: Type.NUMBER, description: "Absolute positive value" },
            type: { type: Type.STRING, enum: ["DEBIT", "CREDIT"] },
            category: { type: Type.STRING, enum: [
              'Groceries', 'Dining Out', 'Electronics', 'Clothing', 'Travel', 'Healthcare', 
              'Education', 'Entertainment', 'Home Improvement', 'Utilities & Bills', 
              'Subscriptions', 'Salary', 'Investments', 'Bank Fees', 'Transfers', 'Misc'
            ]}
          },
          required: ["date", "description", "amount", "type", "category"],
        },
      },
    },
  });

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
    throw new Error("Could not extract granular transactions from PDF. Invalid format.");
  }
};

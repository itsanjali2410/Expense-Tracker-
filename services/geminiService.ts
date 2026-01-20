
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, TransactionType } from "../types";

export const extractTransactionsFromPDF = async (base64Data: string): Promise<Transaction[]> => {
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
            text: "Extract all individual transactions from this bank statement. Ignore headers, footers, summary sections, and opening/closing balances. Categorize each transaction into one of these: 'Food & Dining', 'Travel', 'Savings/Investments', 'Shopping', 'Utilities', 'Entertainment', 'Health', or 'Others'. Return a clean JSON array of objects.",
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
            amount: { type: Type.NUMBER, description: "Absolute positive value of the transaction" },
            type: { type: Type.STRING, enum: ["DEBIT", "CREDIT"], description: "DEBIT for money out (expenses), CREDIT for money in (income)" },
            category: { type: Type.STRING, enum: ['Food & Dining', 'Travel', 'Savings/Investments', 'Shopping', 'Utilities', 'Entertainment', 'Health', 'Others'] }
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
    throw new Error("Could not extract transactions from PDF. Please ensure it is a valid bank statement.");
  }
};

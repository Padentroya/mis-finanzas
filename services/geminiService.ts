import { GoogleGenAI } from "@google/genai";
import { Transaction } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (transactions: Transaction[]): Promise<string> => {
  try {
    // Filter last 50 transactions to avoid token limits if list is huge
    const recentTransactions = transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 50);

    const transactionsJson = JSON.stringify(recentTransactions);

    const prompt = `
      Actúa como un experto asesor financiero personal. Analiza mis transacciones recientes y dame un resumen breve, 
      identifica patrones de gasto preocupantes y dame 3 consejos concretos para mejorar mi salud financiera y acercarme a la libertad financiera.
      
      Mis datos (formato JSON):
      ${transactionsJson}
      
      Responde en formato Markdown. Sé motivador pero directo.
      Usa emojis para hacerlo amigable.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No se pudo generar el consejo en este momento.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Lo siento, hubo un error al conectar con tu asesor financiero IA. Por favor intenta más tarde.";
  }
};

export const analyzeReceiptImage = async (base64Image: string): Promise<{ amount: number; date: string; description: string; category?: string } | null> => {
  try {
    // Extract the base64 data part if it contains the header
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const prompt = `
      Analiza esta imagen de un recibo/ticket/factura.
      Extrae la siguiente información en formato JSON estricto:
      
      1. "amount": El total final a pagar (número).
      2. "date": La fecha de la transacción en formato YYYY-MM-DD. Si no hay año, asume el año actual.
      3. "description": El nombre del comercio o establecimiento.
      4. "category": Una categoría sugerida basada en el comercio (ej: "Alimentación", "Transporte", "Ocio", "Salud", "Otros").

      JSON Schema:
      {
        "amount": number,
        "date": "string",
        "description": "string",
        "category": "string"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Error analyzing receipt with Gemini:", error);
    return null;
  }
};

export const analyzeForAlerts = async (transactions: Transaction[]): Promise<{ title: string; message: string; type: 'warning' | 'info' }[]> => {
  try {
    const recentTransactions = transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);

    const prompt = `
      Analiza estas últimas transacciones y genera ALERTA si detectas algo inusual.
      Busca:
      1. Gastos duplicados.
      2. Suscripciones que han subido de precio.
      3. Gastos hormiga excesivos en poco tiempo.
      
      Devuelve un JSON array. Si no hay alertas, devuelve array vacío.
      Formato: [{ "title": "...", "message": "...", "type": "warning" | "info" }]
      
      Datos: ${JSON.stringify(recentTransactions)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Error analyzing alerts:", error);
    return [];
  }
};
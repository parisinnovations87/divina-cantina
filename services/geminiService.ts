import { GoogleGenAI, Type } from "@google/genai";
import { WineType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeWineLabel = async (base64Image: string): Promise<any> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: `Analizza questa etichetta di vino e estrai i dettagli in formato JSON. 
                   Cerca di identificare: Nome, Produttore, Annata (Vintage), Tipo (Rosso, Bianco, Rosato, Bollicine, Dolce/Passito), Vitigno (Grape), Regione, Grado Alcolico (AlcoholContent es. "13.5%") e suggerisci un abbinamento cibo (Pairing).
                   Se non riesci a trovare un dato, metti una stringa vuota o stima in base al contesto.`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            producer: { type: Type.STRING },
            vintage: { type: Type.STRING },
            type: { type: Type.STRING, enum: [WineType.RED, WineType.WHITE, WineType.ROSE, WineType.SPARKLING, WineType.DESSERT] },
            grape: { type: Type.STRING },
            region: { type: Type.STRING },
            alcoholContent: { type: Type.STRING, description: "Es. 13.5% vol" },
            pairing: { type: Type.STRING },
            description: { type: Type.STRING, description: "Breve descrizione organolettica stimata" }
          },
          required: ["name", "producer", "type"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);

  } catch (error) {
    console.error("Errore analisi Gemini:", error);
    throw error;
  }
};

export const suggestWineDetails = async (query: string): Promise<any> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `L'utente vuole inserire un vino chiamato: "${query}". 
                 Restituisci un oggetto JSON con i dettagli probabili per questo vino.
                 Campi: name, producer, vintage (se non specificato usa "NV"), type (Rosso, Bianco, Rosato, Bollicine, Dolce/Passito), grape, region, alcoholContent, pairing.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            producer: { type: Type.STRING },
            vintage: { type: Type.STRING },
            type: { type: Type.STRING, enum: [WineType.RED, WineType.WHITE, WineType.ROSE, WineType.SPARKLING, WineType.DESSERT] },
            grape: { type: Type.STRING },
            region: { type: Type.STRING },
            alcoholContent: { type: Type.STRING },
            pairing: { type: Type.STRING },
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Errore suggerimento Gemini:", error);
    return null;
  }
}
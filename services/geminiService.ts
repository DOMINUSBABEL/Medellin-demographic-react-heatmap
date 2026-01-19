import { GoogleGenAI } from "@google/genai";
import { ZoneData } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize client (only if key exists, handled in hook)
const getAiClient = () => {
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
};

export const analyzeDemographics = async (zone: ZoneData): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "Error: API Key no configurada.";

    const prompt = `
        Actúa como un sociólogo experto en demografía urbana de Latinoamérica.
        Analiza los siguientes datos de una zona específica de Medellín, Colombia y genera un breve perfil sociológico (máximo 100 palabras)
        sobre las dinámicas posibles en este sector.

        Datos:
        - Estrato Socioeconómico: ${zone.strata}
        - Densidad Poblacional (0-1): ${zone.density.toFixed(2)}
        - Edad Promedio: ${zone.avgAge} años
        - Nivel Educativo Predominante: ${zone.educationLevel}
        - Ocupación Principal: ${zone.mainOccupation}
        - Interés Principal en Redes: ${zone.topInterest}

        Enfócate en oportunidades de desarrollo o desafíos sociales.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text || "No se pudo generar el análisis.";
    } catch (error) {
        console.error("Error calling Gemini:", error);
        return "Error al contactar con el servicio de inteligencia artificial.";
    }
};

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

    // Updated prompt to leverage the new Specific Sector and Cardinal Bounds
    const prompt = `
        Actúa como un analista de datos sociodemográficos experto en Medellín, Colombia.
        Tienes acceso a los reportes del DANE y tendencias de Open Source Intelligence (OSINT).

        Analiza la siguiente zona específica:
        
        Ubicación: ${zone.specificSector} (${zone.locationName})
        Contexto Geográfico: ${zone.geoContext}
        Límites Exactos: ${zone.cardinalLimits}
        
        Datos detectados:
        - Estrato: ${zone.strata}
        - Ingresos Hogar: $${(zone.householdIncome/1000000).toFixed(1)}M COP
        - Edad Promedio: ${zone.avgAge} años
        - Educación Predominante: ${zone.educationLevel}
        - Interés Digital Principal: ${zone.topInterest}

        Genera un perfil conciso (máx 80 palabras) conectando estos datos con la realidad conocida de este barrio o sector específico. Menciona dinámicas locales (ej. comercio, turismo, seguridad, pendientes/laderas, transformación urbana).
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
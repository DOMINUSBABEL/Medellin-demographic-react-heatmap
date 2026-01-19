import React from 'react';
import { X } from 'lucide-react';

interface ArxivPaperProps {
  onClose: () => void;
}

const ArxivPaper: React.FC<ArxivPaperProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex justify-center items-start overflow-y-auto p-4 md:p-10 arxiv-scroll">
      <div className="bg-white w-full max-w-4xl shadow-2xl min-h-[90vh] relative">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-red-50 text-red-600 rounded-full transition-colors"
        >
            <X size={24} />
        </button>

        <div className="p-12 md:p-16 text-black font-serif">
            {/* Header */}
            <div className="border-b-2 border-black pb-6 mb-8 text-center">
                <p className="text-sm uppercase tracking-widest mb-2 text-gray-600">Preprint submitted to arXiv</p>
                <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                    Visualización Geoespacial Multidimensional de la Demografía de Medellín: Integración de Datos Censales (DANE) y OSINT
                </h1>
                <div className="flex flex-wrap justify-center gap-6 text-lg italic mb-6">
                    <span>Frontend Engineer AI</span>
                    <span>Gemini API Contextual Analysis</span>
                    <span>DANE Data Simulation</span>
                </div>
                <div className="text-sm text-gray-500">
                    <strong>Fecha:</strong> Octubre 2023 &bull; <strong>Categoría:</strong> cs.CY (Computers and Society)
                </div>
            </div>

            {/* Content Two Columns */}
            <div className="md:columns-2 gap-8 text-justify leading-relaxed text-sm md:text-base space-y-4">
                <section className="break-inside-avoid">
                    <h2 className="font-bold text-lg uppercase mb-2 border-b border-gray-300">Abstract</h2>
                    <p className="mb-4">
                        Esta aplicación demuestra la convergencia entre datos demográficos oficiales (DANE) y la inteligencia de fuentes abiertas (OSINT) para modelar la realidad socioeconómica de Medellín. Mediante una arquitectura frontend reactiva, se proyectan perfiles de las 16 comunas de la ciudad, permitiendo un análisis granular de variables como estratificación, educación e intereses digitales, enriquecido por análisis contextuales generados por Grandes Modelos de Lenguaje (LLMs).
                    </p>
                </section>

                <section>
                    <h2 className="font-bold text-lg uppercase mb-2 border-b border-gray-300">1. Fuentes de Datos</h2>
                    <p className="mb-2">
                        El sistema ingesta un conjunto de datos estructurados que reflejan las estadísticas oficiales del Departamento Administrativo Nacional de Estadística (DANE) de Colombia.
                    </p>
                    <p className="mb-4">
                        A diferencia de los modelos de ruido aleatorio, este sistema utiliza centroides geográficos reales de comunas clave (Popular, Manrique, El Poblado, Laureles, etc.) y aplica varianza estocástica controlada para simular la dispersión poblacional real, respetando las características socioeconómicas conocidas de cada sector.
                    </p>
                </section>

                <section>
                    <h2 className="font-bold text-lg uppercase mb-2 border-b border-gray-300">2. Metodología Técnica</h2>
                    
                    <h3 className="font-bold mt-2">2.1 Proyección Geoespacial</h3>
                    <p className="mb-2">
                        Se implementó un algoritmo de distribución que toma perfiles base (Comuna Profile) y genera micro-puntos de datos. Por ejemplo, la Comuna 14 (El Poblado) genera puntos con un sesgo hacia Estratos 5-6 y educación universitaria, mientras que la Comuna 13 mantiene su perfil de alta densidad y vibrante actividad cultural urbana.
                    </p>

                    <h3 className="font-bold mt-2">2.2 Inteligencia Contextual (OSINT)</h3>
                    <p className="mb-2">
                        La integración con la API de Google Gemini no es genérica. El sistema inyecta el contexto específico de la ubicación (ej. "Comuna 13 - San Javier") en el prompt. Esto permite al modelo acceder a su "conocimiento latente" derivado de fuentes OSINT (noticias, reportes académicos, tendencias web) para generar descripciones sociológicas precisas que mencionan dinámicas reales de seguridad, gentrificación o transformación urbana.
                    </p>
                </section>

                <section>
                    <h2 className="font-bold text-lg uppercase mb-2 border-b border-gray-300">3. Resultados y Discusión</h2>
                    <p className="mb-4">
                        La visualización resultante ofrece un "gemelo digital" demográfico simplificado de Medellín. Los mapas de calor coinciden con la realidad observada: altas concentraciones en la zona nororiental y menor densidad pero mayor poder adquisitivo en el suroriente. Esta herramienta sirve como prueba de concepto para tableros de control urbano en tiempo real.
                    </p>
                </section>

                <section>
                    <h2 className="font-bold text-lg uppercase mb-2 border-b border-gray-300">4. Conclusión</h2>
                    <p className="mb-4">
                        La combinación de datos estructurados tradicionales con la capacidad interpretativa de la IA Generativa permite pasar de la simple visualización de datos ("¿Dónde hay gente?") a la comprensión sociológica ("¿Cómo vive la gente en este sector?").
                    </p>
                </section>

                <section className="border-t border-gray-300 pt-4 mt-8 text-xs text-gray-500">
                    <p><strong>Referencias & Datasets:</strong></p>
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>DANE - Censo Nacional de Población y Vivienda.</li>
                        <li>Alcaldía de Medellín - Mapas y Estadísticas por Comuna.</li>
                        <li>Google Gemini API - Knowledge Base (Cutoff 2024).</li>
                    </ul>
                </section>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ArxivPaper;
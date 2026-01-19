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
                    Visualización Geoespacial Multidimensional de la Demografía de Medellín: Un Enfoque Interactivo Basado en React
                </h1>
                <div className="flex flex-wrap justify-center gap-6 text-lg italic mb-6">
                    <span>Frontend Engineer AI</span>
                    <span>Gemini API Integration</span>
                    <span>Open Data Simulator</span>
                </div>
                <div className="text-sm text-gray-500">
                    <strong>Fecha:</strong> Octubre 2023 &bull; <strong>Categoría:</strong> cs.HC (Human-Computer Interaction)
                </div>
            </div>

            {/* Content Two Columns */}
            <div className="md:columns-2 gap-8 text-justify leading-relaxed text-sm md:text-base space-y-4">
                <section className="break-inside-avoid">
                    <h2 className="font-bold text-lg uppercase mb-2 border-b border-gray-300">Abstract</h2>
                    <p className="mb-4">
                        Este aplicativo presenta una metodología novedosa para la visualización de datos demográficos complejos en entornos urbanos, específicamente en la ciudad de Medellín, Colombia. Utilizando tecnologías web modernas (React, Leaflet, Tailwind) y generación de datos sintéticos, se construye un mapa de calor interactivo que permite a los usuarios explorar capas multidimensionales como densidad poblacional, estratificación socioeconómica, niveles educativos e intereses digitales. Además, se integra inteligencia artificial generativa (Gemini) para proporcionar análisis sociológicos contextuales en tiempo real.
                    </p>
                </section>

                <section>
                    <h2 className="font-bold text-lg uppercase mb-2 border-b border-gray-300">1. Introducción</h2>
                    <p className="mb-2">
                        La comprensión de la dinámica urbana requiere herramientas que trasciendan los mapas estáticos tradicionales. Medellín, una ciudad caracterizada por su compleja topografía y marcada estratificación social, presenta desafíos únicos para la visualización de datos.
                    </p>
                    <p className="mb-4">
                        Este trabajo propone una interfaz que no solo muestra la densidad ("mapa de calor"), sino que permite descomponer esta densidad en vectores cualitativos (ocupación, educación), facilitando la toma de decisiones para urbanistas y ciudadanos.
                    </p>
                </section>

                <section>
                    <h2 className="font-bold text-lg uppercase mb-2 border-b border-gray-300">2. Metodología Técnica</h2>
                    
                    <h3 className="font-bold mt-2">2.1 Arquitectura del Frontend</h3>
                    <p className="mb-2">
                        El sistema está construido sobre <strong>React 18</strong>, aprovechando el paradigma de componentes funcionales. La gestión de estados complejos se maneja mediante Hooks, permitiendo una transición fluida entre diferentes capas de datos (Layers).
                    </p>

                    <h3 className="font-bold mt-2">2.2 Renderizado Geoespacial</h3>
                    <p className="mb-2">
                        Se utiliza <strong>Leaflet</strong> como motor de renderizado de mapas. A diferencia de las implementaciones tradicionales de mapas de calor rasterizados, aquí empleamos un enfoque vectorial con <code>CircleMarkers</code>. El radio y la opacidad de cada marcador se vinculan dinámicamente a la variable de "Densidad", mientras que el color se interpola basado en la capa seleccionada (ej. Estrato, Educación).
                    </p>
                    
                    <h3 className="font-bold mt-2">2.3 Simulación de Datos</h3>
                    <p className="mb-4">
                        Ante la ausencia de una API censal en tiempo real pública y abierta para este demo, se implementó un algoritmo estocástico en <code>dataService.ts</code>. Este algoritmo genera puntos geográficos con sesgos probabilísticos que imitan la realidad de Medellín: mayor nivel socioeconómico en el sureste (El Poblado) y mayor densidad en el norte y centro.
                    </p>
                </section>

                <section>
                    <h2 className="font-bold text-lg uppercase mb-2 border-b border-gray-300">3. Integración de IA</h2>
                    <p className="mb-4">
                        Una característica distintiva es el uso del SDK <code>@google/genai</code>. Al seleccionar una zona, el sistema serializa el perfil demográfico (edad, ocupación, interés) y construye un prompt para el modelo Gemini Flash. El modelo actúa como un "sociólogo virtual", devolviendo un análisis narrativo sobre las oportunidades y retos de esa micro-zona específica.
                    </p>
                </section>

                <section>
                    <h2 className="font-bold text-lg uppercase mb-2 border-b border-gray-300">4. Resultados y Discusión</h2>
                    <p className="mb-4">
                        La herramienta demuestra que la visualización web moderna puede manejar eficientemente cientos de puntos de datos interactivos. La superposición de capas permite correlaciones visuales inmediatas: por ejemplo, observar cómo las áreas de alta densidad en el norte se correlacionan a menudo con poblaciones más jóvenes y niveles educativos en desarrollo.
                    </p>
                </section>

                <section>
                    <h2 className="font-bold text-lg uppercase mb-2 border-b border-gray-300">5. Conclusión</h2>
                    <p className="mb-4">
                        Este prototipo sienta las bases para sistemas de información geográfica (GIS) accesibles al público, democratizando el acceso a la información demográfica y potenciando el análisis urbano mediante inteligencia artificial.
                    </p>
                </section>

                <section className="border-t border-gray-300 pt-4 mt-8 text-xs text-gray-500">
                    <p><strong>Referencias:</strong></p>
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>React Documentation (2024).</li>
                        <li>LeafletJS Interactive Maps.</li>
                        <li>DANE (Departamento Administrativo Nacional de Estadística) - Conceptos básicos de estratificación.</li>
                        <li>Google DeepMind - Gemini API Technical Report.</li>
                    </ul>
                </section>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ArxivPaper;
import React from 'react';
import { X } from 'lucide-react';

interface ArxivPaperProps {
  onClose: () => void;
}

const ArxivPaper: React.FC<ArxivPaperProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-md flex justify-center items-start overflow-y-auto p-4 md:p-8 arxiv-scroll">
      <div className="bg-white w-full max-w-5xl shadow-2xl min-h-[90vh] relative rounded-sm">
        <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 text-gray-800 rounded-full transition-colors border border-gray-200"
        >
            <X size={24} />
        </button>

        <div className="p-10 md:p-20 text-black font-serif leading-relaxed">
            {/* Header */}
            <div className="border-b border-gray-900 pb-8 mb-10 text-center">
                <p className="text-sm font-bold uppercase tracking-widest mb-4 text-gray-500">
                    Preprint Series [cs.CY] &bull; Enero 2026
                </p>
                <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-gray-900">
                    High-Resolution Socio-Demographic Tesselation of Medellín: <br/>
                    <span className="text-3xl md:text-4xl font-normal text-gray-600 mt-2 block">
                        A Hybrid K-D Tree & Voronoi Approach for Urban Analytics
                    </span>
                </h1>
                
                <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-lg italic mb-8 text-gray-700">
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-gray-900 not-italic">Isaac Mendoza</span>
                        <span className="text-sm text-gray-500">Lead Architect</span>
                    </div>
                    <span className="hidden md:inline text-gray-300">&mdash;</span>
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-gray-900 not-italic">Juan Esteban Gómez Bernal</span>
                        <span className="text-sm text-gray-500">Research Director</span>
                    </div>
                </div>

                <div className="flex justify-center items-center gap-2 mb-8">
                     <span className="px-3 py-1 bg-gray-100 rounded text-sm font-semibold text-gray-700 tracking-wide uppercase">
                        Consultora Talleyrand
                     </span>
                     <span className="text-gray-400">|</span>
                     <span className="text-sm text-gray-600">Medellín, Colombia</span>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-left max-w-3xl mx-auto">
                    <h3 className="font-bold text-sm uppercase mb-2 text-gray-500">Abstract</h3>
                    <p className="text-sm md:text-base mb-0">
                        Urban demographic visualization typically suffers from the modifiable areal unit problem (MAUP), where arbitrary administrative boundaries obscure local realities. This research presents a method for generating a high-resolution, population-weighted mesh of Medellín, Colombia. Utilizing a recursive K-D Tree partitioning algorithm (Depth=10) combined with Centroidal Voronoi Tessellation, we subdivided the city into 1,024 micro-quadrants, each containing approximately 2,500 inhabitants (±300). The system integrates synthetic census data based on DANE statistics with Open Source Intelligence (OSINT) to project detailed socio-economic variables—strata, income, and digital behaviors—onto a granular map. This architecture enables real-time interaction with demographic data at a barrio-level scale previously unavailable in public dashboards.
                    </p>
                </div>
            </div>

            {/* Academic Content */}
            <div className="md:columns-2 gap-12 text-justify text-base space-y-8 text-gray-800">
                
                {/* Section 1 */}
                <section className="break-inside-avoid">
                    <h2 className="text-xl font-bold uppercase mb-3 border-b-2 border-gray-900 inline-block">1. Introduction</h2>
                    <p className="mb-4">
                        Medellín constitutes a complex urban morphology defined by steep topographies and sharp socio-economic gradients. Traditional choropleth maps aggregated by "Comunas" (Districts) often homogenize these distinct variations. For instance, Comuna 14 (El Poblado) contains both hyper-affluent zones like <em>Los Balsos</em> and commercial corridors like <em>La Aguacatala</em>, which possess distinct demographic signatures.
                    </p>
                    <p>
                        Our objective at <strong>Consultora Talleyrand</strong> was to construct a "Digital Twin" of the city's demographic density that respects these local heterogeneities while maintaining statistical coherence with official census projections.
                    </p>
                </section>

                {/* Section 2 */}
                <section>
                    <h2 className="text-xl font-bold uppercase mb-3 border-b-2 border-gray-900 inline-block">2. Data Architecture</h2>
                    <h3 className="font-bold mt-4 mb-2 text-gray-900">2.1 Synthetic Population Generation</h3>
                    <p className="mb-3">
                        We generated a synthetic population of $N=26,000$ representative data points, projected to model a total population of approximately 2.6 million inhabitants. This generation process was seeded using a database of over 100 specific neighborhood centroids (`DETAILED_BARRIOS`), ranging from <em>Santo Domingo Savio</em> in the north to <em>San Antonio de Prado</em> in the south.
                    </p>
                    <p className="mb-3">
                        Each seed point applies a Gaussian distribution mechanism to disperse individuals spatially (sigma ~ 0.0030 deg), simulating realistic urban sprawl while adhering to the specific land-use constraints (Residential, Industrial, Mixed) of the seed barrio.
                    </p>
                </section>

                {/* Section 3 */}
                <section>
                    <h2 className="text-xl font-bold uppercase mb-3 border-b-2 border-gray-900 inline-block">3. Algorithmic Methodology</h2>
                    
                    <h3 className="font-bold mt-4 mb-2 text-gray-900">3.1 K-D Tree Partitioning</h3>
                    <p className="mb-3">
                        To achieve the specific requirement of uniform population distribution per cell, we implemented a K-Dimensional Tree (K-D Tree) algorithm operating on the latitude-longitude plane.
                    </p>
                    <p className="mb-3 pl-4 border-l-4 border-gray-300 italic">
                        The recursion depth was set to $D=10$, resulting in $2^&#123;10&#125; = 1,024$ leaf nodes. The algorithm recursively splits the dataset along the median of alternating spatial axes, ensuring that each resulting partition contains an equal weight of population ($P_&#123;cell&#125; \approx P_&#123;total&#125; / 1024$).
                    </p>

                    <h3 className="font-bold mt-4 mb-2 text-gray-900">3.2 Voronoi Tesselation</h3>
                    <p className="mb-3">
                        While K-D Trees provide balanced populations, they result in rectangular artifacts. To recover organic urban boundaries, we utilized the centroids of the K-D Tree clusters as generators for a Voronoi Diagram. This transforms the rectangular partitions into polygonal regions that naturally conform to the density gradients of the underlying points.
                    </p>
                </section>

                {/* Section 4 */}
                <section>
                    <h2 className="text-xl font-bold uppercase mb-3 border-b-2 border-gray-900 inline-block">4. Results: Granularity Metrics</h2>
                    <p className="mb-4">
                        The resulting mesh achieves a spatial resolution significantly higher than standard administrative maps.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                        <li><strong>Mean Population per Quadrant:</strong> ~2,540 inhabitants.</li>
                        <li><strong>Tolerance Interval:</strong> ±300 inhabitants (Standard Deviation).</li>
                        <li><strong>Spatial Fidelity:</strong> High-density zones (e.g., <em>Santa Cruz, Popular</em>) generate smaller polygons, while low-density zones (e.g., <em>Altavista, Santa Elena</em>) generate larger polygons, providing immediate visual feedback on urban density.</li>
                    </ul>
                </section>

                {/* Section 5 */}
                <section>
                    <h2 className="text-xl font-bold uppercase mb-3 border-b-2 border-gray-900 inline-block">5. Semantic Enrichment (AI)</h2>
                    <p className="mb-3">
                        Beyond raw coordinates, each quadrant is semantically enriched using Google's Gemini Flash model. By injecting the specific barrio name (e.g., "Belén Rincón"), stratum, and inferred land use into the LLM prompt, the system generates qualitative sociodemographic profiles that describe dynamics such as "gentrification," "informal commerce," or "student housing hubs" that cannot be captured by numerical data alone.
                    </p>
                </section>

                <section className="break-inside-avoid pt-8">
                    <h2 className="text-xl font-bold uppercase mb-3 border-b-2 border-gray-900 inline-block">6. Conclusion</h2>
                    <p>
                        This "GeoMedellín" system, developed by Consultora Talleyrand, demonstrates that recursive spatial partitioning combined with generative AI can produce highly granular, functionally accurate maps of Latin American cities. This approach is scalable and can be applied to other complex urban environments to aid in policy-making, resource allocation, and market analysis.
                    </p>
                </section>
            </div>

            {/* Footer / References */}
            <div className="mt-16 pt-8 border-t border-gray-300 text-sm text-gray-600">
                <h4 className="font-bold mb-2 uppercase">References</h4>
                <ol className="list-decimal pl-5 space-y-1 font-mono text-xs">
                    <li>DANE (2018). Censo Nacional de Población y Vivienda. Bogotá, Colombia.</li>
                    <li>De Berg, M., et al. (2008). Computational Geometry: Algorithms and Applications. Springer.</li>
                    <li>Google AI (2024). Gemini 1.5 Pro/Flash Technical Report. arXiv.</li>
                    <li>Alcaldía de Medellín. (2023). Encuesta de Calidad de Vida.</li>
                </ol>
                <div className="mt-8 text-center text-gray-400 uppercase tracking-widest text-xs">
                    &copy; 2026 Consultora Talleyrand. Open Access.
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ArxivPaper;
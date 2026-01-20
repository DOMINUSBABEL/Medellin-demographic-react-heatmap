import React, { useState, useMemo } from 'react';
import MapVisualizer from './components/MapVisualizer';
import Dashboard from './components/Dashboard';
import ArxivPaper from './components/ArxivPaper';
import { generateMedellinData, processQuadtree } from './services/dataService';
import { MapLayer, ZoneData } from './types';

const App: React.FC = () => {
  // 1. Generate Raw Points (Simulated Individuals)
  // We use more points now (2000) to ensure the Quadtree has enough data to make interesting shapes
  const rawPoints = useMemo(() => generateMedellinData(2000), []);
  
  // 2. Process into Adaptive Grid (Quadtree Polygons)
  // Capacity = 15 points per cell. Lower capacity = finer grid in dense areas.
  const adaptiveGridData = useMemo(() => processQuadtree(rawPoints, 15), [rawPoints]);

  // State for Filters
  const [activeLayer, setActiveLayer] = useState<MapLayer>(MapLayer.Density);
  const [selectedZone, setSelectedZone] = useState<ZoneData | null>(null);
  const [isPaperOpen, setIsPaperOpen] = useState(false);
  
  const [strataFilter, setStrataFilter] = useState<string>('all'); 
  const [comunaFilter, setComunaFilter] = useState<string>('all');

  // Extract unique Comuna names for the dropdown (from the aggregated grid)
  const comunaOptions = useMemo(() => {
    const uniqueNames = Array.from(new Set(adaptiveGridData.map(d => d.locationName)));
    return uniqueNames.sort();
  }, [adaptiveGridData]);

  // Filter Data Logic
  const filteredData = useMemo(() => {
    return adaptiveGridData.filter(item => {
      // 1. Filter by Strata Range
      let matchesStrata = true;
      if (strataFilter === '1-2') matchesStrata = item.strata >= 1 && item.strata <= 2;
      else if (strataFilter === '3-4') matchesStrata = item.strata >= 3 && item.strata <= 4;
      else if (strataFilter === '5-6') matchesStrata = item.strata >= 5 && item.strata <= 6;

      // 2. Filter by Comuna
      let matchesComuna = true;
      if (comunaFilter !== 'all') {
        matchesComuna = item.locationName === comunaFilter;
      }

      return matchesStrata && matchesComuna;
    });
  }, [adaptiveGridData, strataFilter, comunaFilter]);

  const handleZoneSelect = (zone: ZoneData | null) => {
    setSelectedZone(zone);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100 font-sans">
      {/* Sidebar Controls */}
      <div className="w-96 shrink-0 h-full relative z-20">
        <Dashboard 
          activeLayer={activeLayer} 
          setActiveLayer={setActiveLayer}
          selectedZone={selectedZone}
          onOpenPaper={() => setIsPaperOpen(true)}
          
          // Filter Props
          strataFilter={strataFilter}
          setStrataFilter={setStrataFilter}
          comunaFilter={comunaFilter}
          setComunaFilter={setComunaFilter}
          comunaOptions={comunaOptions}
        />
      </div>

      {/* Main Map Area */}
      <div className="flex-1 h-full relative z-10">
        <MapVisualizer 
          data={filteredData}
          activeLayer={activeLayer}
          onZoneSelect={handleZoneSelect}
          selectedZone={selectedZone}
        />
      </div>

      {/* Arxiv Preprint Modal */}
      {isPaperOpen && (
        <ArxivPaper onClose={() => setIsPaperOpen(false)} />
      )}
    </div>
  );
};

export default App;
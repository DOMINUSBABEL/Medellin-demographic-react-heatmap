import React, { useState, useMemo } from 'react';
import MapVisualizer from './components/MapVisualizer';
import Dashboard from './components/Dashboard';
import ArxivPaper from './components/ArxivPaper';
import { generateMedellinData, processKDTree } from './services/dataService';
import { MapLayer, ZoneData } from './types';

const App: React.FC = () => {
  // 1. Generate Raw Points (Simulated Individuals)
  // To achieve ~4000 people per cell with Depth 9 (512 cells), we need Total Pop ~2,048,000.
  // Using ~21,000 points with avg weight of 100 people/point gives ~2.1M total.
  const rawPoints = useMemo(() => generateMedellinData(21000), []);
  
  // 2. Process into K-D Tree Grid (Equivalent Population)
  // Depth 9 = 2^9 = 512 cells.
  // 2,100,000 / 512 = ~4,100 people per cell.
  // This fits the requirement of ~4000 (+/- 300) per quadrant.
  const adaptiveGridData = useMemo(() => processKDTree(rawPoints, 9), [rawPoints]);

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
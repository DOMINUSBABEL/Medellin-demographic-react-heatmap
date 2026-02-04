import React, { useState, useMemo, useEffect } from 'react';
import MapVisualizer from './components/MapVisualizer';
import Dashboard from './components/Dashboard';
import ArxivPaper from './components/ArxivPaper';
import { generateData, processKDTree } from './services/dataService';
import { MapLayer, ZoneData, City } from './types';

const App: React.FC = () => {
  const [city, setCity] = useState<City>('Medellin');

  // Reset selected zone and filters when city changes
  useEffect(() => {
    setSelectedZone(null);
    setComunaFilter('all');
  }, [city]);

  // 1. Generate Raw Points (Simulated Individuals)
  // Target: ~2500 people per cell.
  // Calculation: Depth 10 = 1024 cells.
  // 1024 cells * 2550 avg pop = ~2,611,200 Total Simulated Population.
  // Using 26,000 points with weight ~100 gives exactly this scale.
  const rawPoints = useMemo(() => generateData(city, 26000), [city]);
  
  // 2. Process into K-D Tree Grid (High Resolution)
  // Depth 10 provides 1024 distinct micro-zones.
  const adaptiveGridData = useMemo(() => processKDTree(rawPoints, 10, city), [rawPoints, city]);

  // State for Filters
  const [activeLayer, setActiveLayer] = useState<MapLayer>(MapLayer.Density);
  const [selectedZone, setSelectedZone] = useState<ZoneData | null>(null);
  const [isPaperOpen, setIsPaperOpen] = useState(false);
  
  const [strataFilter, setStrataFilter] = useState<string>('all'); 
  const [comunaFilter, setComunaFilter] = useState<string>('all');
  const [spectrumFilter, setSpectrumFilter] = useState<string>('all');

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

      // 3. Filter by Political Spectrum
      let matchesSpectrum = true;
      if (spectrumFilter !== 'all') {
          matchesSpectrum = item.politicalSpectrum === spectrumFilter;
      }

      return matchesStrata && matchesComuna && matchesSpectrum;
    });
  }, [adaptiveGridData, strataFilter, comunaFilter, spectrumFilter]);

  const handleZoneSelect = (zone: ZoneData | null) => {
    setSelectedZone(zone);
  };

  // Dynamic center based on city
  const center: [number, number] = city === 'Bogota' ? [4.65, -74.09] : [6.2442, -75.5812];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100 font-sans">
      {/* Sidebar Controls */}
      <div className="w-96 shrink-0 h-full relative z-20">
        <Dashboard 
          activeLayer={activeLayer} 
          setActiveLayer={setActiveLayer}
          selectedZone={selectedZone}
          onOpenPaper={() => setIsPaperOpen(true)}
          
          city={city}
          setCity={setCity}

          // Filter Props
          strataFilter={strataFilter}
          setStrataFilter={setStrataFilter}
          comunaFilter={comunaFilter}
          setComunaFilter={setComunaFilter}
          spectrumFilter={spectrumFilter}
          setSpectrumFilter={setSpectrumFilter}
          comunaOptions={comunaOptions}
        />
      </div>

      {/* Main Map Area */}
      <div className="flex-1 h-full relative z-10">
        <MapVisualizer 
          key={city} // Force remount on city change to reset view properly
          data={filteredData}
          activeLayer={activeLayer}
          onZoneSelect={handleZoneSelect}
          selectedZone={selectedZone}
          center={center}
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
import React, { useEffect, useState, memo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { ZoneData, MapLayer, EducationLevel, SocialInterest, PoliticalParty, PoliticalSpectrum, GovernorVote, PublicCorporationParty } from '../types';
import L from 'leaflet';
import { X, Maximize2, Minimize2 } from 'lucide-react';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapVisualizerProps {
  data: ZoneData[];
  activeLayer: MapLayer;
  onZoneSelect: (zone: ZoneData | null) => void;
  selectedZone: ZoneData | null;
}

const getColor = (zone: ZoneData, layer: MapLayer): string => {
  switch (layer) {
    case MapLayer.Density:
      if (zone.density > 0.8) return '#7f1d1d'; // Very High
      if (zone.density > 0.6) return '#c2410c'; // High
      if (zone.density > 0.4) return '#eab308'; // Medium
      if (zone.density > 0.2) return '#15803d'; // Low
      return '#3b82f6'; // Very Low
    case MapLayer.Age:
      return zone.avgAge > 55 ? '#7c2d12' : zone.avgAge > 40 ? '#ea580c' : zone.avgAge > 25 ? '#fdba74' : '#fef3c7';
    case MapLayer.Strata:
      return zone.strata >= 5 ? '#16a34a' : zone.strata >= 3 ? '#eab308' : '#dc2626';
    case MapLayer.Education:
      switch(zone.educationLevel) {
        case EducationLevel.Postgrad: return '#1e40af';
        case EducationLevel.University: return '#3b82f6';
        case EducationLevel.Technical: return '#93c5fd';
        default: return '#cbd5e1';
      }
    case MapLayer.Interest:
      switch(zone.topInterest) {
        case SocialInterest.Tech: return '#0ea5e9'; 
        case SocialInterest.Sports: return '#10b981'; 
        case SocialInterest.Fashion: return '#db2777'; 
        case SocialInterest.Politics: return '#64748b'; 
        case SocialInterest.Music: return '#8b5cf6'; 
        case SocialInterest.Travel: return '#f59e0b'; 
        default: return '#94a3b8';
      }
    case MapLayer.Voting:
        switch(zone.votingPreference) {
            case PoliticalParty.Creemos: return '#581c87'; // Purple
            case PoliticalParty.Independientes: return '#eab308'; // Yellow
            case PoliticalParty.Pacto: return '#be123c'; // Red
            case PoliticalParty.Centro: return '#10b981'; // Green
            default: return '#94a3b8';
        }
    case MapLayer.Governor:
        switch(zone.votingGovernor) {
            case GovernorVote.Rendon: return '#1e3a8a'; // Dark Blue (CD)
            case GovernorVote.LuisPerez: return '#14b8a6'; // Teal
            case GovernorVote.Suarez: return '#64748b'; // Slate
            case GovernorVote.Bedoya: return '#f59e0b'; // Orange
            default: return '#cbd5e1';
        }
    // Shared Colors for Corporations
    case MapLayer.Council:
    case MapLayer.Assembly:
    case MapLayer.Congress:
        const val = layer === MapLayer.Council ? zone.votingCouncil : layer === MapLayer.Assembly ? zone.votingAssembly : zone.votingCongress;
        switch(val) {
            case PublicCorporationParty.Creemos: return '#581c87';
            case PublicCorporationParty.CentroDemocratico: return '#1e3a8a';
            case PublicCorporationParty.PartidoConservador: return '#0369a1'; // Light Blue
            case PublicCorporationParty.PartidoLiberal: return '#dc2626'; // Red
            case PublicCorporationParty.PactoHistorico: return '#be123c'; // Dark Red
            case PublicCorporationParty.AlianzaVerde: return '#15803d'; // Green
            default: return '#94a3b8';
        }

    case MapLayer.Spectrum:
        switch(zone.politicalSpectrum) {
            case PoliticalSpectrum.Derecha: return '#1e3a8a'; // Dark Blue
            case PoliticalSpectrum.CentroDerecha: return '#3b82f6'; // Blue
            case PoliticalSpectrum.Centro: return '#10b981'; // Green
            case PoliticalSpectrum.CentroIzquierda: return '#f59e0b'; // Orange
            case PoliticalSpectrum.Izquierda: return '#dc2626'; // Red
            default: return '#94a3b8';
        }
    default:
      return '#3b82f6';
  }
};

interface ZonePolygonProps {
    zone: ZoneData;
    activeLayer: MapLayer;
    isSelected: boolean;
    onZoneSelect: (zone: ZoneData | null) => void;
}

const ZonePolygon = memo(({ zone, activeLayer, isSelected, onZoneSelect }: ZonePolygonProps) => {
    const fillColor = getColor(zone, activeLayer);

    // Define styles based on state
    const baseWeight = isSelected ? 3 : 1;
    const baseColor = isSelected ? '#ffffff' : '#333333'; // White if selected, Dark Grey if not
    const baseOpacity = isSelected ? 0.85 : 0.6;

    if (!zone.polygon || zone.polygon.length === 0) {
        return null;
    }

    return (
        <Polygon
            positions={zone.polygon}
            pathOptions={{
            fillColor: fillColor,
            color: baseColor,
            weight: baseWeight,
            fillOpacity: baseOpacity,
            }}
            eventHandlers={{
            click: (e) => {
                L.DomEvent.stopPropagation(e);
                onZoneSelect(zone);
            },
            mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({
                    weight: 3,
                    color: '#d1d5db', // Light gray hover
                    fillOpacity: 0.9
                });
                layer.bringToFront();
            },
            mouseout: (e) => {
                const layer = e.target;
                // Reset to base styles
                layer.setStyle({
                    weight: isSelected ? 3 : 1,
                    color: isSelected ? '#ffffff' : '#333333',
                    fillOpacity: isSelected ? 0.85 : 0.6
                });
            }
            }}
        >
            {/* Persistent Tooltip on Hover */}
            <Tooltip sticky direction="top" opacity={1} className="custom-map-tooltip">
            <div className="font-sans text-xs leading-tight text-slate-700">
                <span className="font-bold block text-sm text-slate-900">{zone.specificSector}</span>
                <span className="text-slate-500 uppercase tracking-wide text-[10px]">{zone.locationName}</span>
                <div className="mt-1 pt-1 border-t border-gray-200 flex gap-2">
                    <span className="font-semibold text-blue-600">Estrato {zone.strata}</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-slate-600">{zone.population} Hab.</span>
                </div>
            </div>
            </Tooltip>

            <Popup className="font-sans" closeButton={false} minWidth={280} maxWidth={320}>
            <div className="relative text-slate-700">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        {/* Detailed Naming */}
                        <strong className="block text-slate-900 text-sm font-bold leading-tight">
                        {zone.specificSector}
                        </strong>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                        {zone.locationName}
                        </span>
                    </div>
                    <button
                        onClick={() => onZoneSelect(null)}
                        className="text-gray-400 hover:text-gray-700 transition-colors -mt-1 -mr-1"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="border-t border-gray-200 my-2"></div>

                {/* Precision Address */}
                <div className="bg-slate-50 p-2 rounded mb-2 border border-slate-100">
                    <div className="text-[10px] text-blue-700 font-bold mb-0.5">
                        {zone.address}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono leading-tight">
                        {zone.cardinalLimits}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-600">
                    <span>Población (Eq):</span> <span className="font-medium text-gray-900">{zone.population} hab</span>
                    <span>Edad Prom.:</span> <span className="font-medium text-gray-900">{zone.avgAge}</span>
                    <span>Estrato Dom.:</span> <span className="font-medium text-gray-900">{zone.strata}</span>
                    <span>Ingreso Prom.:</span> <span className="font-medium text-green-700">
                        ${(zone.householdIncome/1000000).toFixed(1)}M
                    </span>
                </div>
            </div>
            </Popup>
        </Polygon>
    );
});

const MapEffect: React.FC<{ selectedZone: ZoneData | null }> = ({ selectedZone }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedZone) {
      map.flyTo([selectedZone.lat, selectedZone.lng], 15, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [selectedZone, map]);
  return null;
};

const MapEvents: React.FC<{ onDeselect: () => void }> = ({ onDeselect }) => {
    useMapEvents({ click: () => onDeselect() });
    return null;
}

const MapVisualizer: React.FC<MapVisualizerProps> = ({ data, activeLayer, onZoneSelect, selectedZone }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const center: [number, number] = [6.2442, -75.5812];

  // Stable callback pattern to ensure React.memo works in ZonePolygon
  const onZoneSelectRef = useRef(onZoneSelect);
  useEffect(() => {
    onZoneSelectRef.current = onZoneSelect;
  }, [onZoneSelect]);

  const handleZoneSelect = useCallback((zone: ZoneData | null) => {
    if (onZoneSelectRef.current) {
        onZoneSelectRef.current(zone);
    }
  }, []);

  return (
    <div className={`${isFullScreen ? 'fixed inset-0 z-[5000]' : 'relative h-full w-full z-0'}`}>
      
      {/* Full Screen Toggle Button */}
      <button 
        onClick={() => setIsFullScreen(!isFullScreen)}
        className="absolute top-4 right-4 z-[10000] bg-white text-slate-800 p-2 rounded-lg shadow-xl hover:bg-slate-100 transition-colors border border-gray-300"
        title={isFullScreen ? "Salir de Pantalla Completa" : "Pantalla Completa"}
      >
        {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </button>

      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="h-full w-full bg-slate-900" 
      >
        <MapEffect selectedZone={selectedZone} />
        <MapEvents onDeselect={() => handleZoneSelect(null)} />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {data.map((zone) => (
            <ZonePolygon
                key={zone.id}
                zone={zone}
                activeLayer={activeLayer}
                isSelected={selectedZone?.id === zone.id}
                onZoneSelect={handleZoneSelect}
            />
        ))}
      </MapContainer>
      
      {/* Legend Overlay */}
      <div className="absolute bottom-6 right-6 z-[1000] bg-white/95 backdrop-blur-md p-4 rounded-lg shadow-2xl border border-slate-200 max-w-xs text-slate-800">
         <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 border-b border-slate-100 pb-2">Leyenda: {activeLayer}</h4>
         <div className="flex flex-col gap-1 text-xs max-h-48 overflow-y-auto pr-1 legend-scroll">
            {activeLayer === MapLayer.Density && (
                <div className="flex items-center gap-2">
                    <div className="w-full h-3 bg-gradient-to-r from-blue-500 via-green-600 via-yellow-500 via-orange-500 to-red-900 rounded"></div>
                    <div className="flex justify-between w-full text-[10px] text-slate-600 mt-1">
                        <span>Disperso (Grande)</span>
                        <span>Denso (Pequeño)</span>
                    </div>
                </div>
            )}
            {activeLayer === MapLayer.Strata && (
                <div className="flex items-center gap-2">
                    <div className="w-24 h-3 bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 rounded"></div>
                    <span className="text-slate-700">Estrato 1 &rarr; 6</span>
                </div>
            )}
            {activeLayer === MapLayer.Education && (
                <div className="flex items-center gap-2">
                    <div className="w-24 h-3 bg-gradient-to-r from-slate-300 to-blue-700 rounded"></div>
                    <span className="text-slate-700">Básico &rarr; Posgrado</span>
                </div>
            )}
            {activeLayer === MapLayer.Interest && (
               <div className="grid grid-cols-2 gap-2">
                  {Object.values(SocialInterest).map(i => (
                     <div key={i} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{backgroundColor: getColor({topInterest: i} as any, MapLayer.Interest)}}></span>
                        <span>{i}</span>
                     </div>
                  ))}
               </div>
            )}
            {activeLayer === MapLayer.Age && (
               <div className="flex items-center gap-2">
                   <div className="w-24 h-3 bg-gradient-to-r from-orange-100 to-amber-900 rounded"></div>
                   <span className="text-slate-700">Joven &rarr; Mayor</span>
               </div>
           )}
           {activeLayer === MapLayer.Voting && (
               <div className="flex flex-col gap-1">
                   {Object.values(PoliticalParty).map(p => (
                       <div key={p} className="flex items-center gap-1">
                           <span className="w-3 h-3 rounded-full" style={{backgroundColor: getColor({votingPreference: p} as any, MapLayer.Voting)}}></span>
                           <span>{p}</span>
                       </div>
                   ))}
               </div>
           )}
           {activeLayer === MapLayer.Governor && (
               <div className="flex flex-col gap-1">
                   {Object.values(GovernorVote).map(p => (
                       <div key={p} className="flex items-center gap-1">
                           <span className="w-3 h-3 rounded-full" style={{backgroundColor: getColor({votingGovernor: p} as any, MapLayer.Governor)}}></span>
                           <span>{p}</span>
                       </div>
                   ))}
               </div>
           )}
           {(activeLayer === MapLayer.Council || activeLayer === MapLayer.Assembly || activeLayer === MapLayer.Congress) && (
               <div className="flex flex-col gap-1">
                   {Object.values(PublicCorporationParty).map(p => (
                       <div key={p} className="flex items-center gap-1">
                           <span className="w-3 h-3 rounded-full" style={{backgroundColor: getColor({votingCouncil: p} as any, MapLayer.Council)}}></span>
                           <span>{p}</span>
                       </div>
                   ))}
               </div>
           )}
           {activeLayer === MapLayer.Spectrum && (
               <div className="flex flex-col gap-1">
                   {Object.values(PoliticalSpectrum).map(p => (
                       <div key={p} className="flex items-center gap-1">
                           <span className="w-3 h-3 rounded-full" style={{backgroundColor: getColor({politicalSpectrum: p} as any, MapLayer.Spectrum)}}></span>
                           <span>{p}</span>
                       </div>
                   ))}
               </div>
           )}
         </div>
      </div>
    </div>
  );
};

export default MapVisualizer;
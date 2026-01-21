import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMap, useMapEvents } from 'react-leaflet';
import { ZoneData, MapLayer, EducationLevel, SocialInterest } from '../types';
import L from 'leaflet';
import { X, Compass, MapPin } from 'lucide-react';

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
      return zone.density > 0.8 ? '#b91c1c' : zone.density > 0.6 ? '#c2410c' : zone.density > 0.4 ? '#eab308' : '#15803d';
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
    default:
      return '#3b82f6';
  }
};

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
  const center: [number, number] = [6.2442, -75.5812];

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="h-full w-full bg-slate-900" 
      >
        <MapEffect selectedZone={selectedZone} />
        <MapEvents onDeselect={() => onZoneSelect(null)} />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {data.map((zone) => {
            const isSelected = selectedZone?.id === zone.id;
            const fillColor = getColor(zone, activeLayer);
            
            if (zone.polygon && zone.polygon.length > 0) {
               return (
                  <Polygon
                     key={zone.id}
                     positions={zone.polygon}
                     pathOptions={{
                        fillColor: fillColor,
                        color: isSelected ? '#ffffff' : '#111111',
                        weight: isSelected ? 2 : 0.5,
                        fillOpacity: isSelected ? 0.9 : 0.6,
                     }}
                     eventHandlers={{
                        click: (e) => {
                           L.DomEvent.stopPropagation(e);
                           onZoneSelect(zone);
                        }
                     }}
                  >
                     <Popup className="font-sans" closeButton={false} minWidth={280} maxWidth={320}>
                        <div className="relative">
                           <div className="flex justify-between items-start mb-2">
                                <div>
                                  {/* Detailed Naming */}
                                  <strong className="block text-gray-900 text-sm font-bold leading-tight">
                                    {zone.specificSector}
                                  </strong>
                                  <span className="text-[10px] text-gray-500 uppercase tracking-wide">
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
                            
                            {/* New: Context & Boundaries Section */}
                            <div className="bg-slate-50 p-2 rounded mb-2 border border-slate-100">
                                <div className="flex items-center gap-1 text-[10px] text-blue-700 font-semibold mb-1">
                                  <Compass size={12} />
                                  <span>{zone.geoContext}</span>
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
               )
            }
            return null;
        })}
      </MapContainer>
      
      {/* Legend Overlay */}
      <div className="absolute bottom-6 right-6 z-[1000] bg-white/90 backdrop-blur p-4 rounded-lg shadow-xl border border-gray-200 max-w-xs">
         <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Leyenda: {activeLayer}</h4>
         <div className="flex flex-col gap-1 text-xs">
            {activeLayer === MapLayer.Density && (
                <div className="flex items-center gap-2">
                    <div className="w-24 h-3 bg-gradient-to-r from-green-700 via-yellow-500 to-red-700 rounded"></div>
                    <span className="text-gray-700">Concentración Geográfica</span>
                </div>
            )}
            {activeLayer === MapLayer.Strata && (
                <div className="flex items-center gap-2">
                    <div className="w-24 h-3 bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 rounded"></div>
                    <span className="text-gray-700">Estrato 1 &rarr; 6</span>
                </div>
            )}
            {activeLayer === MapLayer.Education && (
                <div className="flex items-center gap-2">
                    <div className="w-24 h-3 bg-gradient-to-r from-slate-300 to-blue-700 rounded"></div>
                    <span className="text-gray-700">Básico &rarr; Posgrado</span>
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
                   <span className="text-gray-700">Joven &rarr; Mayor</span>
               </div>
           )}
         </div>
      </div>
    </div>
  );
};

export default MapVisualizer;
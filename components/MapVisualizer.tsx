import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { ZoneData, MapLayer, EducationLevel, SocialInterest } from '../types';
import L from 'leaflet';

// Fix for default markers (though we use circles primarily)
// Note: We do not import CSS here as it is loaded in index.html to avoid ESM loader issues.
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapVisualizerProps {
  data: ZoneData[];
  activeLayer: MapLayer;
  onZoneSelect: (zone: ZoneData) => void;
  selectedZone: ZoneData | null;
}

const getColor = (zone: ZoneData, layer: MapLayer): string => {
  switch (layer) {
    case MapLayer.Density:
      // Heatmap style: Yellow to Red
      return zone.density > 0.8 ? '#ef4444' : zone.density > 0.5 ? '#f97316' : '#eab308';
    case MapLayer.Age:
      return zone.avgAge > 50 ? '#7c2d12' : zone.avgAge > 30 ? '#ea580c' : '#fdba74';
    case MapLayer.Strata:
      // Richer = Green, Poorer = Red/Orange
      return zone.strata >= 5 ? '#15803d' : zone.strata >= 3 ? '#84cc16' : '#ef4444';
    case MapLayer.Education:
      switch(zone.educationLevel) {
        case EducationLevel.Postgrad: return '#1e3a8a';
        case EducationLevel.University: return '#2563eb';
        case EducationLevel.Technical: return '#60a5fa';
        default: return '#93c5fd';
      }
    case MapLayer.Interest:
      switch(zone.topInterest) {
        case SocialInterest.Tech: return '#0ea5e9'; // Cyan
        case SocialInterest.Sports: return '#22c55e'; // Green
        case SocialInterest.Fashion: return '#ec4899'; // Pink
        case SocialInterest.Politics: return '#64748b'; // Slate
        case SocialInterest.Music: return '#8b5cf6'; // Violet
        case SocialInterest.Travel: return '#f59e0b'; // Amber
        default: return '#94a3b8';
      }
    default:
      return '#3b82f6';
  }
};

const MapController = () => {
    const map = useMap();
    useEffect(() => {
        // Force invalidate size on mount to ensure tiles load correctly if container resized
        map.invalidateSize();
    }, [map]);
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
        className="h-full w-full"
      >
        <MapController />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {data.map((zone) => (
          <CircleMarker
            key={zone.id}
            center={[zone.lat, zone.lng]}
            pathOptions={{
              fillColor: getColor(zone, activeLayer),
              color: selectedZone?.id === zone.id ? '#ffffff' : 'transparent',
              weight: 2,
              fillOpacity: activeLayer === MapLayer.Density ? zone.density * 0.9 : 0.7,
            }}
            radius={activeLayer === MapLayer.Density ? 20 * zone.density + 5 : 12}
            eventHandlers={{
              click: () => onZoneSelect(zone),
            }}
          >
            <Popup className="font-sans">
              <div className="text-sm min-w-[150px]">
                <strong className="block text-gray-800 text-sm mb-1 uppercase tracking-wider">{zone.locationName}</strong>
                <div className="border-t border-gray-200 my-1"></div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-gray-600 mt-2">
                    <span>Población:</span> <span className="font-medium text-gray-900">{zone.population}</span>
                    <span>Edad Prom.:</span> <span className="font-medium text-gray-900">{zone.avgAge}</span>
                    <span>Estrato:</span> <span className="font-medium text-gray-900">{zone.strata}</span>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      
      {/* Legend Overlay */}
      <div className="absolute bottom-6 right-6 z-[1000] bg-white/90 backdrop-blur p-4 rounded-lg shadow-xl border border-gray-200 max-w-xs">
         <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Leyenda: {activeLayer}</h4>
         <div className="flex flex-col gap-1 text-xs">
            {activeLayer === MapLayer.Density && (
                <div className="flex items-center gap-2">
                    <div className="w-24 h-3 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded"></div>
                    <span className="text-gray-700">Baja &rarr; Alta Densidad</span>
                </div>
            )}
            {activeLayer === MapLayer.Strata && (
                <div className="flex items-center gap-2">
                    <div className="w-24 h-3 bg-gradient-to-r from-red-500 via-green-400 to-green-800 rounded"></div>
                    <span className="text-gray-700">Estrato 1 &rarr; 6</span>
                </div>
            )}
            {activeLayer === MapLayer.Education && (
                <div className="flex items-center gap-2">
                    <div className="w-24 h-3 bg-gradient-to-r from-blue-200 to-blue-900 rounded"></div>
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
                   <div className="w-24 h-3 bg-gradient-to-r from-orange-200 to-amber-900 rounded"></div>
                   <span className="text-gray-700">Joven &rarr; Mayor</span>
               </div>
           )}
         </div>
      </div>
    </div>
  );
};

export default MapVisualizer;
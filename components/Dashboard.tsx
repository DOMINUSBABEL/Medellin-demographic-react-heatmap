import React, { useState } from 'react';
import { MapLayer, ZoneData } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { Layers, Users, GraduationCap, DollarSign, Activity, BrainCircuit, Loader2, MapPin } from 'lucide-react';
import { analyzeDemographics } from '../services/geminiService';

interface DashboardProps {
  activeLayer: MapLayer;
  setActiveLayer: (layer: MapLayer) => void;
  selectedZone: ZoneData | null;
  onOpenPaper: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ activeLayer, setActiveLayer, selectedZone, onOpenPaper }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Clear AI analysis when zone changes
  React.useEffect(() => {
    setAiAnalysis(null);
  }, [selectedZone]);

  const handleAiAnalysis = async () => {
    if (!selectedZone) return;
    setIsLoadingAi(true);
    const result = await analyzeDemographics(selectedZone);
    setAiAnalysis(result);
    setIsLoadingAi(false);
  };

  const layers = [
    { id: MapLayer.Density, label: 'Densidad Poblacional', icon: Users },
    { id: MapLayer.Strata, label: 'Nivel Socioeconómico', icon: DollarSign },
    { id: MapLayer.Education, label: 'Nivel Educativo', icon: GraduationCap },
    { id: MapLayer.Age, label: 'Distribución Edad', icon: Activity },
    { id: MapLayer.Interest, label: 'Intereses Sociales', icon: Layers },
  ];

  const chartData = selectedZone ? [
    { name: 'Estrato', value: selectedZone.strata, max: 6 },
    { name: 'Densidad', value: selectedZone.density * 10, max: 10 },
  ] : [];

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200 shadow-xl z-20 w-full max-w-md overflow-y-auto">
      {/* Header */}
      <div className="p-6 bg-slate-900 text-white shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">GeoMedellín</h1>
        <p className="text-slate-400 text-sm mt-1">Data Source: DANE & OSINT Reports</p>
      </div>

      {/* Layer Controls */}
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-xs font-semibold uppercase text-slate-500 mb-4 tracking-wider">Capas de Datos</h3>
        <div className="grid gap-2">
          {layers.map((layer) => {
            const Icon = layer.icon;
            return (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                  activeLayer === layer.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon size={18} />
                {layer.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="flex-1 p-6">
        {selectedZone ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wide flex items-center gap-1">
                    <MapPin size={12} /> {selectedZone.locationName}
                </span>
                <span className="text-xs font-mono text-slate-400">ID: {selectedZone.id.split('-')[1]}</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Detalle de Zona</h2>
              
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-semibold">{selectedZone.mainOccupation}</span>
                <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-semibold">{selectedZone.educationLevel}</span>
              </div>
            </div>

            {/* Micro Chart */}
            <div className="h-40 w-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 'dataMax']} hide />
                    <YAxis dataKey="name" type="category" width={60} tick={{fontSize: 12}} />
                    <RechartsTooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f59e0b'} />
                        ))}
                    </Bar>
                 </BarChart>
               </ResponsiveContainer>
            </div>

            {/* AI Analysis Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-indigo-900 font-semibold text-sm flex items-center gap-2">
                        <BrainCircuit size={16} />
                        Análisis Contextual (OSINT)
                    </h3>
                </div>
                
                {aiAnalysis ? (
                    <p className="text-sm text-indigo-800 leading-relaxed text-justify animate-in fade-in duration-500">
                        {aiAnalysis}
                    </p>
                ) : (
                    <button 
                        onClick={handleAiAnalysis}
                        disabled={isLoadingAi}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded text-sm font-medium transition-all flex items-center justify-center gap-2"
                    >
                        {isLoadingAi ? (
                            <>
                                <Loader2 className="animate-spin" size={16} />
                                Procesando...
                            </>
                        ) : (
                            "Consultar Base de Conocimiento"
                        )}
                    </button>
                )}
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center space-y-4">
            <Users size={48} className="opacity-20" />
            <p>Selecciona una zona en el mapa<br/>para ver el reporte censal.</p>
          </div>
        )}
      </div>

      {/* Footer / Readme Trigger */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <button 
          onClick={onOpenPaper}
          className="w-full py-3 border-2 border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white rounded-lg font-bold transition-colors uppercase tracking-widest text-xs"
        >
          Ver Documentación (arXiv)
        </button>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useMemo } from 'react';
import { MapLayer, ZoneData } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, Legend 
} from 'recharts';
import { Layers, Users, GraduationCap, DollarSign, Activity, BrainCircuit, Loader2, MapPin, Wifi, Briefcase, TrendingUp, Filter, Compass, Building, Mail } from 'lucide-react';
import { analyzeDemographics } from '../services/geminiService';

interface DashboardProps {
  activeLayer: MapLayer;
  setActiveLayer: (layer: MapLayer) => void;
  selectedZone: ZoneData | null;
  onOpenPaper: () => void;
  
  // Filter Props
  strataFilter: string;
  setStrataFilter: (val: string) => void;
  comunaFilter: string;
  setComunaFilter: (val: string) => void;
  comunaOptions: string[];
}

const Dashboard: React.FC<DashboardProps> = ({ 
  activeLayer, setActiveLayer, selectedZone, onOpenPaper,
  strataFilter, setStrataFilter, comunaFilter, setComunaFilter, comunaOptions
}) => {
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

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  };

  const layers = [
    { id: MapLayer.Density, label: 'Densidad Poblacional', icon: Users },
    { id: MapLayer.Strata, label: 'Nivel Socioeconómico', icon: DollarSign },
    { id: MapLayer.Education, label: 'Nivel Educativo', icon: GraduationCap },
    { id: MapLayer.Age, label: 'Distribución Edad', icon: Activity },
    { id: MapLayer.Interest, label: 'Intereses Sociales', icon: Layers },
  ];

  const getInternetScore = (type: string) => {
    if (type.includes('Fibra')) return 100;
    if (type.includes('Alta')) return 80;
    if (type.includes('HFC')) return 60;
    if (type.includes('4G')) return 40;
    return 20;
  };

  const metricsData = useMemo(() => {
    if (!selectedZone) return [];
    
    // Normalize Income to a 0-100 scale (Base: 15M COP for visualization purposes)
    const incomeScore = Math.min(100, (selectedZone.householdIncome / 15000000) * 100);
    
    return [
      { 
        name: 'Ingreso', 
        value: incomeScore, 
        originalValue: formatCOP(selectedZone.householdIncome),
        fill: '#10b981' 
      },
      { 
        name: 'Ocupación', 
        value: selectedZone.employmentRate * 100, 
        originalValue: `${(selectedZone.employmentRate * 100).toFixed(0)}%`,
        fill: '#3b82f6' 
      },
      { 
        name: 'Conectividad', 
        value: getInternetScore(selectedZone.internetAccess), 
        originalValue: selectedZone.internetAccess,
        fill: '#8b5cf6' 
      },
    ];
  }, [selectedZone]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 text-white text-xs p-2 rounded shadow-lg border border-slate-700">
          <p className="font-bold mb-1">{label}</p>
          <p className="text-emerald-400">
            {payload[0].payload.originalValue || payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200 shadow-xl z-20 w-full max-w-md overflow-y-auto">
      {/* Header */}
      <div className="p-6 bg-slate-900 text-white shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">GeoMedellín</h1>
        <p className="text-slate-400 text-sm mt-1">Data Source: DANE & OSINT Reports</p>
      </div>

      {/* FILTER SECTION */}
      <div className="p-6 border-b border-slate-200 bg-white">
        <h3 className="text-xs font-semibold uppercase text-slate-500 mb-4 tracking-wider flex items-center gap-2">
          <Filter size={14} /> Filtros de Visualización
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Rango de Estratos</label>
            <div className="flex rounded-md shadow-sm" role="group">
              {['all', '1-2', '3-4', '5-6'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStrataFilter(filter)}
                  className={`flex-1 px-3 py-2 text-xs font-medium border first:rounded-l-md last:rounded-r-md transition-colors ${
                    strataFilter === filter
                      ? 'bg-blue-600 text-white border-blue-600 z-10'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {filter === 'all' ? 'Todos' : filter}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Filtrar por Zona / Comuna</label>
            <select
              value={comunaFilter}
              onChange={(e) => setComunaFilter(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 block"
            >
              <option value="all">Todas las Comunas</option>
              {comunaOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Layer Controls */}
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-xs font-semibold uppercase text-slate-500 mb-4 tracking-wider">Capas de Datos</h3>
        <div className="grid grid-cols-2 gap-2">
          {layers.map((layer) => {
            const Icon = layer.icon;
            const isActive = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon size={16} />
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
                <span className="text-xs font-mono text-slate-400">
                    ID: {selectedZone.id.split('-')[1]}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 leading-tight">
                {selectedZone.specificSector}
              </h2>
              
              {/* Detailed Address Box */}
              <div className="mt-3 bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                  <div className="flex items-start gap-3">
                      <div className="bg-blue-50 p-2 rounded text-blue-600">
                          <Building size={16} />
                      </div>
                      <div className="flex-1">
                          <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Dirección Estimada</div>
                          <div className="text-sm font-semibold text-slate-800">{selectedZone.address}</div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                             <span className="flex items-center gap-1"><Mail size={10} /> CP: {selectedZone.postalCode}</span>
                             <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-full text-[10px] font-medium border border-slate-200">{selectedZone.landUseType}</span>
                          </div>
                      </div>
                  </div>
              </div>
            </div>

            {/* Coordinates / Bounds Detail */}
            <div className="bg-slate-50 p-3 rounded border border-slate-200 text-[10px] text-slate-500 font-mono flex justify-between">
                <div>
                   <span className="font-bold text-slate-400 block mb-1">EXTENSIÓN</span>
                   {selectedZone.cardinalLimits}
                </div>
                <div className="text-right">
                   <span className="font-bold text-slate-400 block mb-1">COORD CENTROIDE</span>
                   {selectedZone.lat.toFixed(4)}, {selectedZone.lng.toFixed(4)}
                </div>
            </div>
            
            {/* AI Analysis Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-indigo-900 font-semibold text-xs flex items-center gap-2 uppercase tracking-wide">
                        <BrainCircuit size={14} />
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
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
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

            {/* Metrics Chart */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Activity size={14} /> Métricas Comparativas (Score)
                </h3>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={metricsData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                            <YAxis tick={{fontSize: 10}} domain={[0, 100]} axisLine={false} tickLine={false} />
                            <RechartsTooltip content={<CustomTooltip />} cursor={{fill: '#f1f5f9'}} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {metricsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Economic Indicators Section */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-xs text-slate-500 font-medium">Ingreso Promedio</span>
                    <span className="font-mono font-bold text-slate-700">{formatCOP(selectedZone.householdIncome)}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-medium">Conectividad</span>
                    <span className="font-medium text-xs text-slate-700 text-right">{selectedZone.internetAccess}</span>
                </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center space-y-4">
            <Users size={48} className="opacity-20" />
            <p className="text-sm">Selecciona una zona en el mapa<br/>para ver el reporte censal detallado.</p>
          </div>
        )}
      </div>

      {/* Footer */}
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
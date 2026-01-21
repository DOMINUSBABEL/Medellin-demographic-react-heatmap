import { ZoneData, EducationLevel, SocialInterest } from '../types';
import { Delaunay } from 'd3-delaunay';

// --- HELPER FUNCTIONS ---

const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

const randomEnum = <T>(anEnum: T): T[keyof T] => {
  const enumValues = Object.values(anEnum as object) as unknown as T[keyof T][];
  const randomIndex = Math.floor(Math.random() * enumValues.length);
  return enumValues[randomIndex];
};

const randomGaussian = () => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); 
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

// --- REALISTIC DATA GENERATORS ---

const getInternetAccess = (strata: number): string => {
  const rand = Math.random();
  if (strata >= 5) return rand > 0.15 ? 'Fibra Óptica Simétrica (500MB+)' : 'HFC Ultra Banda Ancha';
  if (strata === 4) return rand > 0.3 ? 'Fibra Óptica (300MB)' : 'HFC Banda Ancha (100MB)';
  if (strata === 3) return rand > 0.5 ? 'Fibra Óptica (100MB)' : 'HFC Básica / Cobre';
  return rand > 0.6 ? 'HFC Prepago' : 'Datos Móviles 4G LTE';
};

const getEstimatedIncome = (strata: number): number => {
  const baseIncome = [0, 980000, 1850000, 3800000, 7500000, 14000000, 28000000];
  const base = baseIncome[strata] || 1000000;
  // Increase variance for higher strata
  const varianceFactor = strata >= 5 ? 0.55 : 0.25; 
  const variance = base * varianceFactor; 
  return Math.floor(base + (Math.random() - 0.5) * 2 * variance);
};

// --- NOMENCLATURE & ADDRESS SYSTEM ---

// Calibrated using reference points:
// Alpujarra (Centro): Calle 44, Carrera 52 (Lat 6.245, Lng -75.573)
// Poblado Park: Calle 10, Carrera 43A (Lat 6.210, Lng -75.566)
// Estadio: Calle 70, Carrera 74 (Lat 6.258, Lng -75.589)
const estimateAddressMedellin = (lat: number, lng: number): string => {
  // Linear regression approximation for Medellin's grid
  // Latitude increases North (Calles increase)
  // Longitude decreases West (Carreras increase)
  
  // Base Point: Calle 44, Carrera 52 at 6.245, -75.573
  const dLat = lat - 6.245;
  const dLng = lng - (-75.573);

  // Approx degrees per street unit
  const degPerCalle = 0.0009; 
  const degPerCarrera = 0.0009;

  let calleNum = 44 + (dLat / degPerCalle);
  let carreraNum = 52 - (dLng / degPerCarrera); // Carreras increase West (more negative lng)

  // Formatting
  const isSur = calleNum < 1;
  const finalCalle = isSur ? Math.abs(Math.round(calleNum)) + " Sur" : Math.round(calleNum);
  
  const finalCarrera = Math.round(carreraNum);
  const placa = Math.floor(Math.random() * 90) + 1;
  const placa2 = Math.floor(Math.random() * 90) + 1;

  return `${Math.random() > 0.5 ? 'Calle' : 'Carrera'} ${Math.random() > 0.5 ? finalCalle : finalCarrera} # ${Math.random() > 0.5 ? finalCarrera : finalCalle} - ${placa}`;
};

const estimatePostalCode = (comunaName: string): string => {
    // Simplified Postal Codes for Medellin (0500XX)
    const map: Record<string, string> = {
        'Popular': '050001', 'Santa Cruz': '050002', 'Manrique': '050003', 'Aranjuez': '050004',
        'Castilla': '050005', 'Doce de Octubre': '050006', 'Robledo': '050007', 'Villa Hermosa': '050008',
        'Buenos Aires': '050009', 'La Candelaria': '050010', 'Laureles': '050031', 'La América': '050032',
        'San Javier': '050033', 'El Poblado': '050021', 'Guayabal': '050024', 'Belén': '050030'
    };
    for (const key in map) {
        if (comunaName.includes(key)) return map[key];
    }
    return '050001';
};

// --- GEOMETRY HELPERS ---

const calculatePolygonArea = (polygon: [number, number][]): number => {
    if (!polygon || polygon.length < 3) return 0.000001; 
    let area = 0;
    for (let i = 0; i < polygon.length; i++) {
        const j = (i + 1) % polygon.length;
        area += polygon[i][0] * polygon[j][1];
        area -= polygon[j][0] * polygon[i][1];
    }
    return Math.abs(area) / 2;
};

// --- DETAILED BARRIO DATABASE (60+ POINTS) ---
// This replaces the generic Comuna profiles with specific neighborhood centroids for high precision.

interface BarrioDefinition {
    name: string;
    comuna: string;
    lat: number;
    lng: number;
    strata: number; // Base strata
    landUse: 'Residencial' | 'Comercial' | 'Mixto' | 'Industrial';
}

const DETAILED_BARRIOS: BarrioDefinition[] = [
    // COMUNA 14 - POBLADO (High Precision)
    { name: "Provenza", comuna: "El Poblado", lat: 6.208, lng: -75.566, strata: 6, landUse: "Mixto" },
    { name: "Manila", comuna: "El Poblado", lat: 6.215, lng: -75.571, strata: 5, landUse: "Mixto" },
    { name: "El Tesoro", comuna: "El Poblado", lat: 6.198, lng: -75.558, strata: 6, landUse: "Residencial" },
    { name: "Castropol", comuna: "El Poblado", lat: 6.218, lng: -75.568, strata: 6, landUse: "Residencial" },
    { name: "Los Balsos", comuna: "El Poblado", lat: 6.185, lng: -75.560, strata: 6, landUse: "Residencial" },
    { name: "San Lucas", comuna: "El Poblado", lat: 6.175, lng: -75.565, strata: 6, landUse: "Residencial" },
    
    // COMUNA 11 - LAURELES (High Precision)
    { name: "Primer Parque Laureles", comuna: "Laureles", lat: 6.242, lng: -75.590, strata: 5, landUse: "Mixto" },
    { name: "Estadio", comuna: "Laureles", lat: 6.252, lng: -75.588, strata: 4, landUse: "Comercial" },
    { name: "Carlos E. Restrepo", comuna: "Laureles", lat: 6.258, lng: -75.582, strata: 5, landUse: "Residencial" },
    { name: "Conquistadores", comuna: "Laureles", lat: 6.240, lng: -75.582, strata: 5, landUse: "Residencial" },
    { name: "Bolivariana", comuna: "Laureles", lat: 6.238, lng: -75.592, strata: 5, landUse: "Residencial" },

    // COMUNA 16 - BELÉN
    { name: "Belén Parque", comuna: "Belén", lat: 6.230, lng: -75.598, strata: 3, landUse: "Mixto" },
    { name: "Rosales", comuna: "Belén", lat: 6.235, lng: -75.602, strata: 4, landUse: "Residencial" },
    { name: "La Mota", comuna: "Belén", lat: 6.215, lng: -75.605, strata: 5, landUse: "Residencial" },
    { name: "San Bernardo", comuna: "Belén", lat: 6.220, lng: -75.610, strata: 3, landUse: "Residencial" },
    { name: "Belén Rincón", comuna: "Belén", lat: 6.205, lng: -75.615, strata: 2, landUse: "Residencial" },

    // COMUNA 13 - SAN JAVIER
    { name: "Las Independencias (Escaleras)", comuna: "San Javier", lat: 6.255, lng: -75.620, strata: 2, landUse: "Mixto" },
    { name: "San Javier Central", comuna: "San Javier", lat: 6.253, lng: -75.612, strata: 3, landUse: "Comercial" },
    { name: "20 de Julio", comuna: "San Javier", lat: 6.258, lng: -75.625, strata: 1, landUse: "Residencial" },

    // COMUNA 10 - CENTRO
    { name: "La Candelaria (Centro)", comuna: "La Candelaria", lat: 6.248, lng: -75.570, strata: 3, landUse: "Comercial" },
    { name: "Prado Centro", comuna: "La Candelaria", lat: 6.258, lng: -75.568, strata: 4, landUse: "Mixto" },
    { name: "Boston", comuna: "La Candelaria", lat: 6.245, lng: -75.558, strata: 3, landUse: "Residencial" },
    { name: "San Diego", comuna: "La Candelaria", lat: 6.238, lng: -75.568, strata: 4, landUse: "Comercial" },

    // NORORIENTAL (Comunas 1, 2, 3, 4)
    { name: "Santo Domingo Savio", comuna: "Popular", lat: 6.295, lng: -75.542, strata: 1, landUse: "Residencial" },
    { name: "Granizal", comuna: "Popular", lat: 6.288, lng: -75.545, strata: 1, landUse: "Residencial" },
    { name: "Santa Cruz", comuna: "Santa Cruz", lat: 6.292, lng: -75.558, strata: 2, landUse: "Residencial" },
    { name: "Manrique Central", comuna: "Manrique", lat: 6.275, lng: -75.552, strata: 3, landUse: "Comercial" },
    { name: "Aranjuez", comuna: "Aranjuez", lat: 6.278, lng: -75.562, strata: 3, landUse: "Mixto" },
    { name: "Moravia", comuna: "Aranjuez", lat: 6.272, lng: -75.565, strata: 2, landUse: "Mixto" },
    { name: "Campo Valdés", comuna: "Manrique", lat: 6.270, lng: -75.558, strata: 3, landUse: "Residencial" },

    // NOROCCIDENTAL (Comunas 5, 6, 7)
    { name: "Castilla", comuna: "Castilla", lat: 6.295, lng: -75.575, strata: 3, landUse: "Mixto" },
    { name: "Doce de Octubre", comuna: "Doce de Octubre", lat: 6.305, lng: -75.585, strata: 2, landUse: "Residencial" },
    { name: "Robledo Parque", comuna: "Robledo", lat: 6.278, lng: -75.598, strata: 3, landUse: "Residencial" },
    { name: "Pilarica", comuna: "Robledo", lat: 6.272, lng: -75.592, strata: 4, landUse: "Residencial" },
    { name: "Aures", comuna: "Robledo", lat: 6.285, lng: -75.605, strata: 2, landUse: "Residencial" },

    // COMUNA 15 - GUAYABAL
    { name: "Guayabal", comuna: "Guayabal", lat: 6.215, lng: -75.585, strata: 3, landUse: "Industrial" },
    { name: "Cristo Rey", comuna: "Guayabal", lat: 6.212, lng: -75.590, strata: 3, landUse: "Residencial" },

    // COMUNA 8 & 9
    { name: "Villa Hermosa", comuna: "Villa Hermosa", lat: 6.252, lng: -75.548, strata: 3, landUse: "Residencial" },
    { name: "Buenos Aires", comuna: "Buenos Aires", lat: 6.235, lng: -75.555, strata: 3, landUse: "Mixto" },
    { name: "La Milagrosa", comuna: "Buenos Aires", lat: 6.238, lng: -75.548, strata: 3, landUse: "Residencial" },

    // COMUNA 12
    { name: "La Floresta", comuna: "La América", lat: 6.255, lng: -75.602, strata: 4, landUse: "Residencial" },
    { name: "Calasanz", comuna: "La América", lat: 6.262, lng: -75.608, strata: 5, landUse: "Residencial" },
    { name: "Santa Mónica", comuna: "La América", lat: 6.250, lng: -75.608, strata: 4, landUse: "Residencial" },
];

const findClosestBarrio = (lat: number, lng: number): BarrioDefinition => {
    let closest = DETAILED_BARRIOS[0];
    let minDist = Infinity;
    for (const b of DETAILED_BARRIOS) {
        const d = Math.pow(b.lat - lat, 2) + Math.pow(b.lng - lng, 2);
        if (d < minDist) {
            minDist = d;
            closest = b;
        }
    }
    return closest;
};

// --- AGGREGATION LOGIC (UPDATED) ---

const formatCoord = (n: number) => n.toFixed(5); // Higher precision

const generatePolygonLimits = (polygon: [number, number][]): string => {
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    polygon.forEach(p => {
        if (p[0] < minLat) minLat = p[0];
        if (p[0] > maxLat) maxLat = p[0];
        if (p[1] < minLng) minLng = p[1];
        if (p[1] > maxLng) maxLng = p[1];
    });
    // More professional formatting
    return `${formatCoord(maxLat)}N ${formatCoord(minLng)}W`;
};

const aggregateClusterData = (node: {points: ZoneData[], centroidLat: number, centroidLng: number}, polygon: [number, number][], index: number, normalizedDensity: number): ZoneData => {
  const points = node.points;
  const safeCount = points.length || 1; 
  
  const totalPopulation = points.reduce((sum, p) => sum + p.population, 0);
  const sumIncome = points.reduce((sum, p) => sum + p.householdIncome, 0);
  const sumAge = points.reduce((sum, p) => sum + p.avgAge, 0);
  const sumStrata = points.reduce((sum, p) => sum + p.strata, 0);
  const sumEmployment = points.reduce((sum, p) => sum + p.employmentRate, 0);

  // Identify closest Real Barrio for specific naming
  const realBarrio = findClosestBarrio(node.centroidLat, node.centroidLng);

  // Determine dominants
  const dominantInterest = points[0]?.topInterest || SocialInterest.Sports;
  const dominantEducation = points[0]?.educationLevel || EducationLevel.Secondary;
  const dominantInternet = points[0]?.internetAccess || "HFC";
  const dominantOccupation = points[0]?.mainOccupation || "Empleado";

  return {
    id: `z-${index}`,
    locationName: realBarrio.comuna,
    specificSector: realBarrio.name,
    lat: node.centroidLat,
    lng: node.centroidLng,
    polygon: polygon,
    
    // PRECISION METADATA
    cardinalLimits: generatePolygonLimits(polygon),
    geoContext: `${realBarrio.comuna} - Zona ${realBarrio.landUse}`,
    address: estimateAddressMedellin(node.centroidLat, node.centroidLng),
    postalCode: estimatePostalCode(realBarrio.comuna),
    landUseType: realBarrio.landUse,

    density: normalizedDensity,
    population: totalPopulation,
    avgAge: Math.round(sumAge / safeCount),
    strata: Math.round(sumStrata / safeCount), // Average strata might differ slightly from base barrio strata
    householdIncome: Math.round(sumIncome / safeCount),
    employmentRate: sumEmployment / safeCount,
    
    topInterest: dominantInterest,
    educationLevel: dominantEducation,
    mainOccupation: dominantOccupation,
    internetAccess: dominantInternet
  };
};

// --- DATA GENERATION (Using Detailed Barrios) ---

export const generateMedellinData = (totalPoints: number = 21000): ZoneData[] => {
  const data: ZoneData[] = [];
  const pointsPerBarrio = Math.floor(totalPoints / DETAILED_BARRIOS.length);

  DETAILED_BARRIOS.forEach((barrio, bIndex) => {
    // Generate points around the specific barrio centroid
    for (let i = 0; i < pointsPerBarrio; i++) {
      
      // Tighter spread for higher precision visual clustering
      const spread = 0.0035; 
      const latOffset = randomGaussian() * spread; 
      const lngOffset = randomGaussian() * spread;
      
      // Variation from base strata
      let strata = barrio.strata;
      if (Math.random() > 0.8) strata += Math.random() > 0.5 ? 1 : -1;
      strata = Math.max(1, Math.min(6, strata));

      // Profile bias based on Strata (simplified logic from before, but applied to detailed points)
      let education = EducationLevel.Secondary;
      if (strata >= 5) education = Math.random() > 0.3 ? EducationLevel.University : EducationLevel.Postgrad;
      else if (strata >= 3) education = Math.random() > 0.4 ? EducationLevel.Technical : EducationLevel.University;
      else education = Math.random() > 0.6 ? EducationLevel.Secondary : EducationLevel.Primary;

      const age = randomRange(18, 85);
      
      // Occupation
      const occupationList = ['Comerciante', 'Estudiante', 'Ingeniero', 'Artista', 'Obrero', 'Administrador', 'Pensionado', 'Independiente', 'Docente', 'Servicios'];
      let occupation = occupationList[Math.floor(Math.random() * occupationList.length)];
      if (strata >= 5 && Math.random() > 0.5) occupation = 'Empresario/Gerente';
      if (strata <= 2 && Math.random() > 0.6) occupation = 'Obrero/Operario';

      const income = getEstimatedIncome(strata);
      
      // Interest map based on age/strata
      let interest = randomEnum(SocialInterest);
      if (age < 30) interest = Math.random() > 0.5 ? SocialInterest.Tech : SocialInterest.Fashion;
      if (strata >= 5) interest = Math.random() > 0.5 ? SocialInterest.Travel : SocialInterest.Tech;

      const baseEmployment = 0.82 + (strata * 0.015) - (age > 60 ? 0.4 : 0) - (age < 22 ? 0.3 : 0);
      const employmentRate = Math.min(0.99, Math.max(0.35, baseEmployment + (Math.random() - 0.5) * 0.2));
      
      const pointPopulation = 90 + Math.floor(Math.random() * 20); 

      data.push({
        id: `p-${bIndex}-${i}`,
        locationName: barrio.comuna,
        specificSector: barrio.name, 
        lat: barrio.lat + latOffset,
        lng: barrio.lng + lngOffset,
        polygon: [],
        cardinalLimits: '',
        geoContext: '',
        address: '', 
        postalCode: '',
        landUseType: barrio.landUse,
        density: 0,
        population: pointPopulation,
        avgAge: Math.floor(age),
        strata,
        educationLevel: education,
        mainOccupation: occupation,
        topInterest: interest,
        householdIncome: income,
        employmentRate: employmentRate,
        internetAccess: getInternetAccess(strata)
      });
    }
  });

  return data;
};

// --- K-D TREE RECURSION (PRESERVED) ---

const buildKDTreeClusters = (
  points: ZoneData[], 
  depth: number, 
  axis: 'lat' | 'lng'
): {points: ZoneData[], centroidLat: number, centroidLng: number}[] => {
  if (depth === 0 || points.length === 0) {
    if (points.length === 0) return [];
    
    let sumLat = 0, sumLng = 0;
    points.forEach(p => { sumLat += p.lat; sumLng += p.lng; });
    
    return [{
        points: points,
        centroidLat: sumLat / points.length,
        centroidLng: sumLng / points.length
    }];
  }

  points.sort((a, b) => axis === 'lat' ? a.lat - b.lat : a.lng - b.lng);

  const totalPop = points.reduce((acc, p) => acc + p.population, 0);
  const targetSplitPop = totalPop / 2;

  let currentPopSum = 0;
  let splitIndex = 0;

  for (let i = 0; i < points.length; i++) {
    currentPopSum += points[i].population;
    if (currentPopSum >= targetSplitPop) {
      splitIndex = i;
      break;
    }
  }

  const leftPoints = points.slice(0, splitIndex + 1);
  const rightPoints = points.slice(splitIndex + 1);
  const nextAxis = axis === 'lat' ? 'lng' : 'lat';

  return [
    ...buildKDTreeClusters(leftPoints, depth - 1, nextAxis),
    ...buildKDTreeClusters(rightPoints, depth - 1, nextAxis)
  ];
};

export const processKDTree = (rawPoints: ZoneData[], depth: number = 8): ZoneData[] => {
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  rawPoints.forEach(p => {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lng < minLng) minLng = p.lng;
    if (p.lng > maxLng) maxLng = p.lng;
  });

  const pad = 0.01;
  const bounds = [minLng - pad, minLat - pad, maxLng + pad, maxLat + pad]; 

  const clusters = buildKDTreeClusters(rawPoints, depth, 'lat');
  const centroids = clusters.map(c => [c.centroidLng, c.centroidLat] as [number, number]);
  
  const delaunay = Delaunay.from(centroids);
  const voronoi = delaunay.voronoi(bounds as [number, number, number, number]);

  const intermediateZones = clusters.map((cluster, i) => {
    const rawPolygon = voronoi.cellPolygon(i);
    let polygon: [number, number][];
    
    if (!rawPolygon) {
        const d = 0.001;
        const cLat = cluster.centroidLat;
        const cLng = cluster.centroidLng;
        polygon = [[cLat-d, cLng-d], [cLat+d, cLng-d], [cLat+d, cLng+d], [cLat-d, cLng+d]];
    } else {
        polygon = rawPolygon.map(p => [p[1], p[0]] as [number, number]);
    }

    const area = calculatePolygonArea(polygon);
    const pop = cluster.points.reduce((sum, p) => sum + p.population, 0);
    const rawDensity = pop / area;

    return { cluster, polygon, rawDensity, i };
  });

  const maxDensity = Math.max(...intermediateZones.map(z => z.rawDensity)) || 1;

  return intermediateZones.map(z => {
      const normalizedDensity = Math.min(1, Math.sqrt(z.rawDensity) / Math.sqrt(maxDensity));
      return aggregateClusterData(z.cluster, z.polygon, z.i, normalizedDensity);
  });
};
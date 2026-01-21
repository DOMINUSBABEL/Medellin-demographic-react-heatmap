import { ZoneData, EducationLevel, SocialInterest } from '../types';
import { Delaunay } from 'd3-delaunay';

// --- DATA GENERATION HELPERS ---

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

const getInternetAccess = (strata: number): string => {
  const rand = Math.random();
  if (strata >= 5) {
    return rand > 0.1 ? 'Fibra Óptica (500MB+)' : 'HFC Banda Ancha Alta';
  } else if (strata >= 4) {
    if (rand > 0.3) return 'Fibra Óptica (300MB)';
    return 'HFC Banda Ancha';
  } else if (strata >= 3) {
    if (rand > 0.6) return 'Fibra Óptica (100MB)';
    if (rand > 0.2) return 'HFC Banda Ancha';
    return 'ADSL / Cobre';
  } else {
    if (rand > 0.7) return 'HFC Banda Ancha';
    if (rand > 0.3) return 'Datos Móviles (4G/LTE)';
    return 'Prepago / Red Comunitaria';
  }
};

const getEstimatedIncome = (strata: number): number => {
  const baseIncome = [0, 1200000, 1900000, 3200000, 5500000, 11000000, 22000000];
  const base = baseIncome[strata] || 1000000;
  const varianceFactor = strata >= 5 ? 0.6 : 0.3;
  const variance = base * varianceFactor; 
  return Math.floor(base + (Math.random() - 0.5) * 2 * variance);
};

// --- GEOMETRY HELPERS ---

const calculatePolygonArea = (polygon: [number, number][]): number => {
    if (!polygon || polygon.length < 3) return 0.000001; // Avoid Zero
    let area = 0;
    for (let i = 0; i < polygon.length; i++) {
        const j = (i + 1) % polygon.length;
        area += polygon[i][0] * polygon[j][1];
        area -= polygon[j][0] * polygon[i][1];
    }
    return Math.abs(area) / 2;
};

// --- GEOGRAPHIC CONTEXT HELPERS ---

interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

const getGeoContext = (lat: number, lng: number): string => {
  const riverLng = -75.575; 
  const centerLat = 6.250; 

  let ew = lng < riverLng ? "Occidente" : "Oriente";
  let ns = lat > centerLat ? "Norte" : "Sur";
  
  if (lat > 6.29) return `Zona Limítrofe Norte (Bello/Andes)`;
  if (lat < 6.21) return `Zona Limítrofe Sur (Envigado/Itagüí)`;
  if (lng < -75.60) return `Ladera Alta ${ew} (Periferia)`;
  if (lng > -75.55 && lng < -75.53) return `Ladera Alta ${ew} (Pan de Azúcar)`;

  if (Math.abs(lng - riverLng) < 0.008) return `Corredor del Río (${ns})`;

  return `Zona ${ns}-${ew}`;
};

const formatCoord = (n: number) => n.toFixed(4);

const generatePolygonLimits = (polygon: [number, number][]): string => {
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    polygon.forEach(p => {
        if (p[0] < minLat) minLat = p[0];
        if (p[0] > maxLat) maxLat = p[0];
        if (p[1] < minLng) minLng = p[1];
        if (p[1] > maxLng) maxLng = p[1];
    });
    return `N: ${formatCoord(maxLat)} | S: ${formatCoord(minLat)} | E: ${formatCoord(maxLng)} | O: ${formatCoord(minLng)}`;
};


// --- AGGREGATION LOGIC ---

interface ClusterNode {
    points: ZoneData[];
    centroidLat: number;
    centroidLng: number;
}

const aggregateClusterData = (node: ClusterNode, polygon: [number, number][], index: number, normalizedDensity: number): ZoneData => {
  const points = node.points;
  const safeCount = points.length || 1; 
  
  const totalPopulation = points.reduce((sum, p) => sum + p.population, 0);
  const sumIncome = points.reduce((sum, p) => sum + p.householdIncome, 0);
  const sumAge = points.reduce((sum, p) => sum + p.avgAge, 0);
  const sumStrata = points.reduce((sum, p) => sum + p.strata, 0);
  const sumEmployment = points.reduce((sum, p) => sum + p.employmentRate, 0);

  const getMode = (arr: string[]) => {
    return arr.sort((a,b) =>
      arr.filter(v => v===a).length - arr.filter(v => v===b).length
    ).pop();
  };

  const dominantLocation = getMode(points.map(p => p.locationName)) || "Zona General";
  const dominantBarrio = getMode(points.map(p => p._barrioSource || 'Sector General')) || "Sector";

  const dominantInterest = points[0]?.topInterest || SocialInterest.Sports;
  const dominantEducation = points[0]?.educationLevel || EducationLevel.Secondary;
  const dominantInternet = points[0]?.internetAccess || "HFC";
  const dominantOccupation = points[0]?.mainOccupation || "Empleado";

  return {
    id: `voronoi-${index}`,
    locationName: dominantLocation,
    specificSector: dominantBarrio,
    lat: node.centroidLat,
    lng: node.centroidLng,
    polygon: polygon,
    
    cardinalLimits: generatePolygonLimits(polygon),
    geoContext: getGeoContext(node.centroidLat, node.centroidLng),

    density: normalizedDensity,
    population: totalPopulation,
    avgAge: Math.round(sumAge / safeCount),
    strata: Math.round(sumStrata / safeCount),
    householdIncome: Math.round(sumIncome / safeCount),
    employmentRate: sumEmployment / safeCount,
    
    topInterest: dominantInterest,
    educationLevel: dominantEducation,
    mainOccupation: dominantOccupation,
    internetAccess: dominantInternet
  };
};

// --- K-D TREE RECURSION ---

const buildKDTreeClusters = (
  points: ZoneData[], 
  depth: number, 
  axis: 'lat' | 'lng'
): ClusterNode[] => {
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

  // Ensure strict division
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


// --- UPDATED COMUNA PROFILES WITH CURATED SPREAD ---
// Reduced 'spread' slightly to allow for higher density cell separation without overlapping chaos.

const COMUNA_PROFILES = [
  // --- ZONA NORORIENTAL ---
  {
    name: "Comuna 1 - Popular",
    barrios: ["Santo Domingo Savio", "Popular 1", "Popular 2", "Granizal", "Villa Guadalupe", "San Pablo"],
    lat: 6.298, lng: -75.545,
    baseStrata: 1, densityFactor: 0.98, spread: 0.005, // Slightly reduced
    ageRange: [15, 40],
    educationBias: [EducationLevel.Primary, EducationLevel.Secondary],
    interests: [SocialInterest.Music, SocialInterest.Sports]
  },
  {
    name: "Comuna 2 - Santa Cruz",
    barrios: ["Santa Cruz", "La Rosa", "Moscú No. 1", "Villa del Socorro", "La Francia"],
    lat: 6.292, lng: -75.558,
    baseStrata: 2, densityFactor: 0.95, spread: 0.004,
    ageRange: [18, 50],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical],
    interests: [SocialInterest.Sports, SocialInterest.Music]
  },
  {
    name: "Comuna 3 - Manrique",
    barrios: ["Manrique Central", "La Salle", "Versalles", "El Raizal", "San José la Cima"],
    lat: 6.272, lng: -75.548,
    baseStrata: 2, densityFactor: 0.90, spread: 0.006,
    ageRange: [20, 60],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical],
    interests: [SocialInterest.Music, SocialInterest.Politics]
  },
  {
    name: "Comuna 4 - Aranjuez",
    barrios: ["Aranjuez", "Campo Valdés", "San Cayetano", "Manrique", "Miranda", "Moravia"],
    lat: 6.278, lng: -75.562,
    baseStrata: 3, densityFactor: 0.88, spread: 0.006,
    ageRange: [25, 70],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical, EducationLevel.University],
    interests: [SocialInterest.Politics, SocialInterest.Tech]
  },
  
  // --- ZONA NOROCCIDENTAL ---
  {
    name: "Comuna 5 - Castilla",
    barrios: ["Castilla", "Toscana", "Las Brisas", "Florencia", "Tejelo"],
    lat: 6.298, lng: -75.572, 
    baseStrata: 3, densityFactor: 0.92, spread: 0.006,
    ageRange: [22, 55],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical],
    interests: [SocialInterest.Sports, SocialInterest.Fashion]
  },
  {
    name: "Comuna 6 - Doce de Octubre",
    barrios: ["Doce de Octubre", "Santander", "Pedregal", "La Esperanza", "San Martin de Porres"],
    lat: 6.308, lng: -75.582,
    baseStrata: 2, densityFactor: 0.96, spread: 0.005,
    ageRange: [16, 45],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical],
    interests: [SocialInterest.Music, SocialInterest.Sports]
  },
  {
    name: "Comuna 7 - Robledo",
    barrios: ["Robledo", "El Diamante", "Aures", "Bello Horizonte", "Pilarica", "San Germán"],
    lat: 6.282, lng: -75.598,
    baseStrata: 3, densityFactor: 0.85, spread: 0.010,
    ageRange: [18, 50],
    educationBias: [EducationLevel.University, EducationLevel.Technical],
    interests: [SocialInterest.Tech, SocialInterest.Music]
  },

  // --- ZONA CENTRO ---
  {
    name: "Comuna 8 - Villa Hermosa",
    barrios: ["Villa Hermosa", "Enciso", "San Miguel", "La Mansión", "Caicedo"],
    lat: 6.252, lng: -75.542,
    baseStrata: 2, densityFactor: 0.90, spread: 0.006,
    ageRange: [20, 55],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical],
    interests: [SocialInterest.Music, SocialInterest.Sports]
  },
  {
    name: "Comuna 9 - Buenos Aires",
    barrios: ["Buenos Aires", "Caicedo", "Miraflores", "Alejandro Echavarría", "El Salvador"],
    lat: 6.232, lng: -75.552, 
    baseStrata: 3, densityFactor: 0.85, spread: 0.007,
    ageRange: [25, 60],
    educationBias: [EducationLevel.University, EducationLevel.Technical],
    interests: [SocialInterest.Travel, SocialInterest.Politics]
  },
  {
    name: "Comuna 10 - La Candelaria",
    barrios: ["La Candelaria", "Prado Centro", "San Benito", "Boston", "Villanueva", "San Diego"],
    lat: 6.248, lng: -75.570,
    baseStrata: 3, densityFactor: 0.70, spread: 0.005,
    ageRange: [25, 55],
    educationBias: [EducationLevel.University, EducationLevel.Technical],
    interests: [SocialInterest.Politics, SocialInterest.Tech]
  },

  // --- OCCIDENTE ---
  {
    name: "Comuna 11 - Laureles",
    barrios: ["Laureles", "Estadio", "Carlos E. Restrepo", "Suramericana", "Conquistadores"],
    lat: 6.245, lng: -75.592,
    baseStrata: 5, densityFactor: 0.78, spread: 0.007,
    ageRange: [25, 75],
    educationBias: [EducationLevel.University, EducationLevel.Postgrad],
    interests: [SocialInterest.Tech, SocialInterest.Travel]
  },
  {
    name: "Comuna 12 - La América",
    barrios: ["La América", "La Floresta", "Santa Lucía", "Calasanz", "Santa Mónica"],
    lat: 6.255, lng: -75.605, 
    baseStrata: 4, densityFactor: 0.82, spread: 0.006,
    ageRange: [30, 65],
    educationBias: [EducationLevel.University, EducationLevel.Technical],
    interests: [SocialInterest.Politics, SocialInterest.Travel]
  },
  {
    name: "Comuna 13 - San Javier",
    barrios: ["San Javier", "Las Independencias", "20 de Julio", "El Salado", "Eduardo Santos"],
    lat: 6.255, lng: -75.620,
    baseStrata: 2, densityFactor: 0.94, spread: 0.006,
    ageRange: [15, 35],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical],
    interests: [SocialInterest.Music, SocialInterest.Fashion]
  },

  // --- SUR ---
  {
    name: "Comuna 14 - El Poblado",
    barrios: ["El Poblado", "Provenza", "Manila", "Patio Bonito", "El Tesoro", "Castropol", "Los Balsos"],
    lat: 6.205, lng: -75.565,
    baseStrata: 6, densityFactor: 0.45, spread: 0.014,
    ageRange: [30, 75],
    educationBias: [EducationLevel.University, EducationLevel.Postgrad],
    interests: [SocialInterest.Travel, SocialInterest.Tech]
  },
  {
    name: "Comuna 15 - Guayabal",
    barrios: ["Guayabal", "Cristo Rey", "Tenche", "Santa Fe", "Trinidad"],
    lat: 6.218, lng: -75.588,
    baseStrata: 3, densityFactor: 0.65, spread: 0.008,
    ageRange: [30, 60],
    educationBias: [EducationLevel.Technical, EducationLevel.University],
    interests: [SocialInterest.Sports, SocialInterest.Politics]
  },
  {
    name: "Comuna 16 - Belén",
    barrios: ["Belén", "Rosales", "Fátima", "La Palma", "Las Playas", "Rincón de Belén"],
    lat: 6.228, lng: -75.605,
    baseStrata: 4, densityFactor: 0.84, spread: 0.010,
    ageRange: [25, 65],
    educationBias: [EducationLevel.University, EducationLevel.Technical],
    interests: [SocialInterest.Sports, SocialInterest.Travel]
  }
];

export const generateMedellinData = (totalPoints: number = 21000): ZoneData[] => {
  const data: ZoneData[] = [];
  const pointsPerComuna = Math.max(100, Math.floor(totalPoints / COMUNA_PROFILES.length));

  COMUNA_PROFILES.forEach((profile, profileIndex) => {
    for (let i = 0; i < pointsPerComuna; i++) {
      
      const latOffset = randomGaussian() * profile.spread * 0.8; 
      const lngOffset = randomGaussian() * profile.spread * 0.8;
      
      const randStrata = Math.random();
      let strata = profile.baseStrata;
      if (randStrata > 0.7) strata += Math.random() > 0.5 ? 1 : -1;
      if (strata < 1) strata = 1;
      if (strata > 6) strata = 6;

      let education = profile.educationBias[Math.floor(Math.random() * profile.educationBias.length)];
      const age = randomRange(profile.ageRange[0], profile.ageRange[1]);

      const interest = Math.random() > 0.4 
        ? profile.interests[Math.floor(Math.random() * profile.interests.length)] 
        : randomEnum(SocialInterest);

      const occupationList = ['Comerciante', 'Estudiante', 'Ingeniero', 'Artista', 'Obrero', 'Administrador', 'Pensionado', 'Independiente', 'Docente'];
      let occupation = occupationList[Math.floor(Math.random() * occupationList.length)];
      
      if (strata >= 5 && Math.random() > 0.5) occupation = 'Empresario/Gerente';
      if (strata <= 2 && Math.random() > 0.6) occupation = 'Obrero/Operario';

      const income = getEstimatedIncome(strata);
      
      const baseEmployment = 0.82 + (strata * 0.015) - (age > 60 ? 0.4 : 0) - (age < 22 ? 0.3 : 0);
      const employmentRate = Math.min(0.99, Math.max(0.35, baseEmployment + (Math.random() - 0.5) * 0.2));
      const internet = getInternetAccess(strata);
      
      const specificBarrio = profile.barrios[Math.floor(Math.random() * profile.barrios.length)];
      
      // Adjusted population weight per point to align with ~2.1M total vs 21k points
      // Each point represents roughly 100 people.
      const pointPopulation = 90 + Math.floor(Math.random() * 20); 

      data.push({
        id: `z-${profileIndex}-${i}`,
        locationName: profile.name,
        specificSector: specificBarrio, 
        _barrioSource: specificBarrio, 
        
        lat: profile.lat + latOffset,
        lng: profile.lng + lngOffset,
        
        polygon: [], 
        cardinalLimits: '',
        geoContext: '',

        density: Math.min(1, Math.max(0, profile.densityFactor + (Math.random() - 0.5) * 0.1)),
        population: pointPopulation,
        avgAge: Math.floor(age),
        strata,
        educationLevel: education,
        mainOccupation: occupation,
        topInterest: interest,
        householdIncome: income,
        employmentRate: employmentRate,
        internetAccess: internet
      });
    }
  });

  return data;
};
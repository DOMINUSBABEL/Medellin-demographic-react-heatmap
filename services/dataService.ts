import { ZoneData, EducationLevel, SocialInterest } from '../types';

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

// --- QUADTREE LOGIC FOR ADAPTIVE GRID ---

interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

class QuadtreeNode {
  bounds: BoundingBox;
  points: ZoneData[];
  children: QuadtreeNode[];
  capacity: number;

  constructor(bounds: BoundingBox, capacity: number) {
    this.bounds = bounds;
    this.capacity = capacity;
    this.points = [];
    this.children = [];
  }

  // Check if a point is within this node's bounds
  contains(point: ZoneData): boolean {
    return (
      point.lat >= this.bounds.minLat &&
      point.lat < this.bounds.maxLat &&
      point.lng >= this.bounds.minLng &&
      point.lng < this.bounds.maxLng
    );
  }

  subdivide() {
    const { minLat, maxLat, minLng, maxLng } = this.bounds;
    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;

    const nw = new QuadtreeNode({ minLat: midLat, maxLat, minLng, maxLng: midLng }, this.capacity);
    const ne = new QuadtreeNode({ minLat: midLat, maxLat, minLng: midLng, maxLng }, this.capacity);
    const sw = new QuadtreeNode({ minLat, maxLat: midLat, minLng, maxLng: midLng }, this.capacity);
    const se = new QuadtreeNode({ minLat, maxLat: midLat, minLng: midLng, maxLng }, this.capacity);

    this.children = [nw, ne, sw, se];
  }

  insert(point: ZoneData): boolean {
    if (!this.contains(point)) return false;

    // If this node has children, try to insert into them
    if (this.children.length > 0) {
      for (const child of this.children) {
        if (child.insert(point)) return true;
      }
      return false;
    }

    // Otherwise, add to this node
    this.points.push(point);

    // If capacity exceeded, subdivide and redistribute
    if (this.points.length > this.capacity) {
      this.subdivide();
      for (const p of this.points) {
        for (const child of this.children) {
          child.insert(p);
        }
      }
      this.points = []; // Clear points from this node as they are now in children
    }
    return true;
  }

  // Collect all leaf nodes (the final zones)
  getLeaves(): QuadtreeNode[] {
    if (this.children.length > 0) {
      return this.children.flatMap(child => child.getLeaves());
    }
    return this.points.length > 0 ? [this] : [];
  }
}

// Function to aggregate data from a set of points in a node
const aggregateNodeData = (node: QuadtreeNode, index: number): ZoneData => {
  const points = node.points;
  const count = points.length;
  
  // Calculate Averages / Modes
  const sumIncome = points.reduce((sum, p) => sum + p.householdIncome, 0);
  const sumAge = points.reduce((sum, p) => sum + p.avgAge, 0);
  const sumStrata = points.reduce((sum, p) => sum + p.strata, 0);
  const sumEmployment = points.reduce((sum, p) => sum + p.employmentRate, 0);
  const sumDensity = points.reduce((sum, p) => sum + p.density, 0);

  // Find Mode for Location Name (Dominant Comuna in this specific grid cell)
  const locations = points.map(p => p.locationName);
  const dominantLocation = locations.sort((a,b) =>
        locations.filter(v => v===a).length - locations.filter(v => v===b).length
  ).pop() || "Zona Mixta";

  // Mode for Interests
  const interests = points.map(p => p.topInterest);
  const dominantInterest = interests.sort((a,b) =>
      interests.filter(v => v===a).length - interests.filter(v => v===b).length
  ).pop() || SocialInterest.Sports;

  // Mode for Education
   const education = points.map(p => p.educationLevel);
   const dominantEducation = education.sort((a,b) =>
       education.filter(v => v===a).length - education.filter(v => v===b).length
   ).pop() || EducationLevel.Secondary;

   // Mode for Internet
   const internet = points.map(p => p.internetAccess);
   const dominantInternet = internet.sort((a,b) =>
       internet.filter(v => v===a).length - internet.filter(v => v===b).length
   ).pop() || "HFC Banda Ancha";

   // Mode for Occupation
   const occupation = points.map(p => p.mainOccupation);
   const dominantOccupation = occupation.sort((a,b) =>
       occupation.filter(v => v===a).length - occupation.filter(v => v===b).length
   ).pop() || "Empleado";

  return {
    id: `q-zone-${index}`,
    locationName: dominantLocation,
    lat: (node.bounds.minLat + node.bounds.maxLat) / 2,
    lng: (node.bounds.minLng + node.bounds.maxLng) / 2,
    bounds: [[node.bounds.minLat, node.bounds.minLng], [node.bounds.maxLat, node.bounds.maxLng]],
    
    // Normalized density of the cell itself relative to point count
    density: Math.min(1, (count / 15) * (sumDensity/count)), 
    population: points.reduce((sum, p) => sum + p.population, 0),
    avgAge: Math.round(sumAge / count),
    strata: Math.round(sumStrata / count),
    householdIncome: Math.round(sumIncome / count),
    employmentRate: sumEmployment / count,
    
    topInterest: dominantInterest,
    educationLevel: dominantEducation,
    mainOccupation: dominantOccupation,
    internetAccess: dominantInternet
  };
};

export const processQuadtree = (rawPoints: ZoneData[], capacity: number = 8): ZoneData[] => {
  // 1. Determine Bounding Box of all points
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  
  rawPoints.forEach(p => {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lng < minLng) minLng = p.lng;
    if (p.lng > maxLng) maxLng = p.lng;
  });

  // Add a small buffer
  const pad = 0.005;
  const bounds: BoundingBox = {
    minLat: minLat - pad,
    maxLat: maxLat + pad,
    minLng: minLng - pad,
    maxLng: maxLng + pad
  };

  // 2. Build Tree
  const qt = new QuadtreeNode(bounds, capacity);
  rawPoints.forEach(p => qt.insert(p));

  // 3. Get Leaves and Aggregate
  const leaves = qt.getLeaves();
  return leaves.map((node, i) => aggregateNodeData(node, i));
};


// --- EXISTING PROFILES (Kept for raw point generation) ---
const COMUNA_PROFILES = [
  // --- ZONA NORORIENTAL ---
  {
    name: "Comuna 1 - Popular",
    lat: 6.298, lng: -75.545,
    baseStrata: 1,
    densityFactor: 0.98, // Muy alta densidad
    spread: 0.006,
    ageRange: [15, 40],
    educationBias: [EducationLevel.Primary, EducationLevel.Secondary],
    interests: [SocialInterest.Music, SocialInterest.Sports, SocialInterest.Fashion]
  },
  {
    name: "Comuna 2 - Santa Cruz",
    lat: 6.292, lng: -75.558,
    baseStrata: 2,
    densityFactor: 0.95,
    spread: 0.005, // Compacta
    ageRange: [18, 50],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical],
    interests: [SocialInterest.Sports, SocialInterest.Music]
  },
  {
    name: "Comuna 3 - Manrique",
    lat: 6.272, lng: -75.548,
    baseStrata: 2, // Mezcla 2 y 3
    densityFactor: 0.90,
    spread: 0.007,
    ageRange: [20, 60],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical],
    interests: [SocialInterest.Music, SocialInterest.Politics, SocialInterest.Travel] // Tango/Cultural history
  },
  {
    name: "Comuna 4 - Aranjuez",
    lat: 6.278, lng: -75.562,
    baseStrata: 3,
    densityFactor: 0.88,
    spread: 0.007,
    ageRange: [25, 70],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical, EducationLevel.University],
    interests: [SocialInterest.Politics, SocialInterest.Tech, SocialInterest.Music]
  },
  
  // --- ZONA NOROCCIDENTAL ---
  {
    name: "Comuna 5 - Castilla",
    lat: 6.298, lng: -75.572, 
    baseStrata: 3,
    densityFactor: 0.92,
    spread: 0.007,
    ageRange: [22, 55],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical],
    interests: [SocialInterest.Sports, SocialInterest.Fashion, SocialInterest.Music]
  },
  {
    name: "Comuna 6 - Doce de Octubre",
    lat: 6.308, lng: -75.582,
    baseStrata: 2,
    densityFactor: 0.96, // Muy densa, laderas
    spread: 0.006,
    ageRange: [16, 45],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical],
    interests: [SocialInterest.Music, SocialInterest.Sports]
  },
  {
    name: "Comuna 7 - Robledo",
    lat: 6.282, lng: -75.598,
    baseStrata: 3, // Zonas de estrato 2, 3 y 4
    densityFactor: 0.85,
    spread: 0.012, // Geográficamente muy grande
    ageRange: [18, 50],
    educationBias: [EducationLevel.University, EducationLevel.Technical, EducationLevel.Postgrad], // Muchas universidades cerca
    interests: [SocialInterest.Tech, SocialInterest.Music, SocialInterest.Politics]
  },

  // --- ZONA CENTRO ORIENTAL ---
  {
    name: "Comuna 8 - Villa Hermosa",
    lat: 6.252, lng: -75.542,
    baseStrata: 2, // Predomina 2 y 3
    densityFactor: 0.90,
    spread: 0.007,
    ageRange: [20, 55],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical],
    interests: [SocialInterest.Music, SocialInterest.Sports]
  },
  {
    name: "Comuna 9 - Buenos Aires",
    lat: 6.232, lng: -75.552, 
    baseStrata: 3, // Transformación con Tranvía (3 y 4)
    densityFactor: 0.85,
    spread: 0.008,
    ageRange: [25, 60],
    educationBias: [EducationLevel.University, EducationLevel.Technical],
    interests: [SocialInterest.Travel, SocialInterest.Politics, SocialInterest.Fashion]
  },
  {
    name: "Comuna 10 - La Candelaria (Centro)",
    lat: 6.248, lng: -75.570,
    baseStrata: 3,
    densityFactor: 0.70, // Alta población flotante, menos residentes fijos
    spread: 0.006,
    ageRange: [25, 55],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical, EducationLevel.University],
    interests: [SocialInterest.Politics, SocialInterest.Tech, SocialInterest.Travel]
  },

  // --- ZONA CENTRO OCCIDENTAL ---
  {
    name: "Comuna 11 - Laureles-Estadio",
    lat: 6.245, lng: -75.592,
    baseStrata: 5, // 4 y 5 predominan
    densityFactor: 0.78,
    spread: 0.008,
    ageRange: [25, 75], // Población mayor y estudiantes
    educationBias: [EducationLevel.University, EducationLevel.Postgrad],
    interests: [SocialInterest.Tech, SocialInterest.Travel, SocialInterest.Politics, SocialInterest.Fashion]
  },
  {
    name: "Comuna 12 - La América",
    lat: 6.255, lng: -75.605, 
    baseStrata: 4,
    densityFactor: 0.82,
    spread: 0.007,
    ageRange: [30, 65],
    educationBias: [EducationLevel.University, EducationLevel.Technical],
    interests: [SocialInterest.Politics, SocialInterest.Travel, SocialInterest.Sports]
  },
  {
    name: "Comuna 13 - San Javier",
    lat: 6.255, lng: -75.620, // Hacia el borde occidental
    baseStrata: 2,
    densityFactor: 0.94,
    spread: 0.007,
    ageRange: [15, 35],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical, EducationLevel.Technical], // Enfoque cultural
    interests: [SocialInterest.Music, SocialInterest.Fashion, SocialInterest.Tech]
  },

  // --- ZONA SUR ---
  {
    name: "Comuna 14 - El Poblado",
    lat: 6.205, lng: -75.565,
    baseStrata: 6,
    densityFactor: 0.45, // Baja densidad residencial, torres altas separadas
    spread: 0.016, // Área geográfica extensa
    ageRange: [30, 75],
    educationBias: [EducationLevel.University, EducationLevel.Postgrad],
    interests: [SocialInterest.Travel, SocialInterest.Tech, SocialInterest.Politics, SocialInterest.Sports]
  },
  {
    name: "Comuna 15 - Guayabal",
    lat: 6.218, lng: -75.588,
    baseStrata: 3, // Zona mixta industrial/residencial (3 y 4)
    densityFactor: 0.65,
    spread: 0.009,
    ageRange: [30, 60],
    educationBias: [EducationLevel.Technical, EducationLevel.Secondary, EducationLevel.University],
    interests: [SocialInterest.Sports, SocialInterest.Politics, SocialInterest.Tech]
  },
  {
    name: "Comuna 16 - Belén",
    lat: 6.228, lng: -75.605,
    baseStrata: 4, // Muy variado (desde Rincón hasta Rosales), promedio 4
    densityFactor: 0.84,
    spread: 0.012, // Muy grande
    ageRange: [25, 65],
    educationBias: [EducationLevel.University, EducationLevel.Technical],
    interests: [SocialInterest.Sports, SocialInterest.Travel, SocialInterest.Fashion]
  }
];

export const generateMedellinData = (totalPoints: number = 2000): ZoneData[] => {
  const data: ZoneData[] = [];
  // Ensure we have enough points per comuna to look good
  const pointsPerComuna = Math.max(50, Math.floor(totalPoints / COMUNA_PROFILES.length));

  COMUNA_PROFILES.forEach((profile, profileIndex) => {
    for (let i = 0; i < pointsPerComuna; i++) {
      
      const latOffset = randomGaussian() * profile.spread * 0.8; 
      const lngOffset = randomGaussian() * profile.spread * 0.8;
      
      const randStrata = Math.random();
      let strata = profile.baseStrata;
      
      if (randStrata > 0.7) {
        strata += Math.random() > 0.5 ? 1 : -1;
      }
      
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

      data.push({
        id: `z-${profileIndex}-${i}`,
        locationName: profile.name,
        lat: profile.lat + latOffset,
        lng: profile.lng + lngOffset,
        density: Math.min(1, Math.max(0, profile.densityFactor + (Math.random() - 0.5) * 0.1)),
        population: Math.floor(profile.densityFactor * 8500 * randomRange(0.8, 1.2)),
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
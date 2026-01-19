import { ZoneData, EducationLevel, SocialInterest } from '../types';

// Helper to generate random number in range
const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

// Helper to pick random enum
const randomEnum = <T>(anEnum: T): T[keyof T] => {
  const enumValues = Object.values(anEnum as object) as unknown as T[keyof T][];
  const randomIndex = Math.floor(Math.random() * enumValues.length);
  return enumValues[randomIndex];
};

// Box-Muller transform for Gaussian (Normal) distribution
const randomGaussian = () => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

// Helper to determine internet access based on strata
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

// Helper to estimate income based on strata (approx monthly COP)
const getEstimatedIncome = (strata: number): number => {
  const baseIncome = [
    0, // index 0 unused
    1200000,  // Strata 1: Salario Mínimo aprox + Informalidad
    1900000,  // Strata 2
    3200000,  // Strata 3
    5500000,  // Strata 4
    11000000, // Strata 5
    22000000  // Strata 6
  ];
  
  const base = baseIncome[strata] || 1000000;
  // Mayor varianza en estratos altos (algunos ganan mucho más) y bajos (informalidad variable)
  const varianceFactor = strata >= 5 ? 0.6 : 0.3;
  const variance = base * varianceFactor; 
  return Math.floor(base + (Math.random() - 0.5) * 2 * variance);
};

// DATASET: Perfiles detallados de las 16 Comunas de Medellín
// Coordenadas calibradas para evitar superposiciones excesivas y reflejar la morfología del valle.
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

export const generateMedellinData = (totalPoints: number = 1000): ZoneData[] => {
  const data: ZoneData[] = [];
  // Ensure we have enough points per comuna to look good
  const pointsPerComuna = Math.max(25, Math.floor(totalPoints / COMUNA_PROFILES.length));

  COMUNA_PROFILES.forEach((profile, profileIndex) => {
    for (let i = 0; i < pointsPerComuna; i++) {
      
      const latOffset = randomGaussian() * profile.spread * 0.8; 
      const lngOffset = randomGaussian() * profile.spread * 0.8;
      
      // Strata logic with probability of variation
      // 70% chance to be base strata, 20% +/- 1, 10% outlier
      const randStrata = Math.random();
      let strata = profile.baseStrata;
      
      if (randStrata > 0.7) {
        strata += Math.random() > 0.5 ? 1 : -1;
      }
      
      if (strata < 1) strata = 1;
      if (strata > 6) strata = 6;

      // Education correlates somewhat with strata but has randomness
      let education = profile.educationBias[Math.floor(Math.random() * profile.educationBias.length)];
      
      // Age distribution
      const age = randomRange(profile.ageRange[0], profile.ageRange[1]);

      // Interests
      const interest = Math.random() > 0.4 
        ? profile.interests[Math.floor(Math.random() * profile.interests.length)] 
        : randomEnum(SocialInterest);

      // Occupation logic
      const occupationList = ['Comerciante', 'Estudiante', 'Ingeniero', 'Artista', 'Obrero', 'Administrador', 'Pensionado', 'Independiente', 'Docente'];
      let occupation = occupationList[Math.floor(Math.random() * occupationList.length)];
      
      // Refine occupation probability by strata/education
      if (strata >= 5 && Math.random() > 0.5) occupation = 'Empresario/Gerente';
      if (strata <= 2 && Math.random() > 0.6) occupation = 'Obrero/Operario';

      // Calculate economic indicators based on profile and strata
      const income = getEstimatedIncome(strata);
      
      // Employment rate roughly correlates with strata and age, but with noise
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
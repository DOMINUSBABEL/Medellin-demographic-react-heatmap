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
    return rand > 0.1 ? 'Fibra Óptica (300MB+)' : 'HFC Banda Ancha';
  } else if (strata >= 3) {
    if (rand > 0.6) return 'Fibra Óptica';
    if (rand > 0.3) return 'HFC Banda Ancha';
    return 'ADSL / Cobre';
  } else {
    if (rand > 0.7) return 'HFC Banda Ancha';
    if (rand > 0.4) return 'Datos Móviles (4G)';
    return 'Prepago / Satelital';
  }
};

// Helper to estimate income based on strata (approx monthly COP)
const getEstimatedIncome = (strata: number): number => {
  const baseIncome = [
    0, // index 0 unused
    1100000,  // Strata 1: ~1.1M (Min wage approx)
    1800000,  // Strata 2
    3500000,  // Strata 3
    6500000,  // Strata 4
    13000000, // Strata 5
    25000000  // Strata 6
  ];
  
  const base = baseIncome[strata] || 1000000;
  const variance = base * 0.35; // 35% variance
  return Math.floor(base + (Math.random() - 0.5) * 2 * variance);
};

// DATASET: Simulated "Import" from DANE & OSINT Reports
// COMPREHENSIVE LIST OF MEDELLIN COMUNAS (1-16)
// Coordenadas ajustadas para reflejar mejor la geografía real del Valle de Aburrá.
const COMUNA_PROFILES = [
  // ZONA NORORIENTAL (1-4)
  {
    name: "Comuna 1 - Popular",
    lat: 6.295, lng: -75.542,
    baseStrata: 1,
    densityFactor: 0.95,
    spread: 0.007,
    ageRange: [15, 40],
    educationBias: [EducationLevel.Primary, EducationLevel.Secondary],
    interests: [SocialInterest.Music, SocialInterest.Sports]
  },
  {
    name: "Comuna 2 - Santa Cruz",
    lat: 6.290, lng: -75.555,
    baseStrata: 2,
    densityFactor: 0.92,
    spread: 0.006,
    ageRange: [18, 50],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical],
    interests: [SocialInterest.Sports, SocialInterest.Music]
  },
  {
    name: "Comuna 3 - Manrique",
    lat: 6.275, lng: -75.548,
    baseStrata: 2,
    densityFactor: 0.88,
    spread: 0.007,
    ageRange: [20, 60],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical],
    interests: [SocialInterest.Music, SocialInterest.Politics]
  },
  {
    name: "Comuna 4 - Aranjuez",
    lat: 6.280, lng: -75.562,
    baseStrata: 3,
    densityFactor: 0.85,
    spread: 0.007,
    ageRange: [25, 65],
    educationBias: [EducationLevel.Secondary, EducationLevel.University],
    interests: [SocialInterest.Politics, SocialInterest.Tech]
  },
  
  // ZONA NOROCCIDENTAL (5-7)
  {
    name: "Comuna 5 - Castilla",
    lat: 6.295, lng: -75.575, 
    baseStrata: 3,
    densityFactor: 0.88,
    spread: 0.008,
    ageRange: [22, 55],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical],
    interests: [SocialInterest.Sports, SocialInterest.Fashion]
  },
  {
    name: "Comuna 6 - Doce de Octubre",
    lat: 6.310, lng: -75.585,
    baseStrata: 2,
    densityFactor: 0.90,
    spread: 0.007,
    ageRange: [18, 45],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical],
    interests: [SocialInterest.Music, SocialInterest.Sports]
  },
  {
    name: "Comuna 7 - Robledo",
    lat: 6.280, lng: -75.595,
    baseStrata: 3,
    densityFactor: 0.80,
    spread: 0.010, // Robledo is geographically large
    ageRange: [18, 45],
    educationBias: [EducationLevel.University, EducationLevel.Technical],
    interests: [SocialInterest.Tech, SocialInterest.Music]
  },

  // ZONA CENTRO ORIENTAL (8-10)
  {
    name: "Comuna 8 - Villa Hermosa",
    lat: 6.255, lng: -75.545,
    baseStrata: 2,
    densityFactor: 0.88,
    spread: 0.007,
    ageRange: [20, 55],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical],
    interests: [SocialInterest.Music, SocialInterest.Sports]
  },
  {
    name: "Comuna 9 - Buenos Aires",
    lat: 6.235, lng: -75.558, 
    baseStrata: 3,
    densityFactor: 0.82,
    spread: 0.008,
    ageRange: [25, 60],
    educationBias: [EducationLevel.University, EducationLevel.Technical],
    interests: [SocialInterest.Travel, SocialInterest.Politics]
  },
  {
    name: "Comuna 10 - La Candelaria (Centro)",
    lat: 6.248, lng: -75.570,
    baseStrata: 3,
    densityFactor: 0.70, // Commercial zone, residential lower
    spread: 0.006,
    ageRange: [25, 55],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical, EducationLevel.University],
    interests: [SocialInterest.Politics, SocialInterest.Tech]
  },

  // ZONA CENTRO OCCIDENTAL (11-13)
  {
    name: "Comuna 11 - Laureles-Estadio",
    lat: 6.245, lng: -75.590,
    baseStrata: 5,
    densityFactor: 0.75,
    spread: 0.008,
    ageRange: [25, 70],
    educationBias: [EducationLevel.University, EducationLevel.Postgrad],
    interests: [SocialInterest.Tech, SocialInterest.Travel, SocialInterest.Fashion]
  },
  {
    name: "Comuna 12 - La América",
    lat: 6.255, lng: -75.602, 
    baseStrata: 4,
    densityFactor: 0.80,
    spread: 0.007,
    ageRange: [30, 65],
    educationBias: [EducationLevel.University, EducationLevel.Technical],
    interests: [SocialInterest.Politics, SocialInterest.Travel]
  },
  {
    name: "Comuna 13 - San Javier",
    lat: 6.255, lng: -75.615, // Adjusted west
    baseStrata: 2,
    densityFactor: 0.95,
    spread: 0.007,
    ageRange: [15, 35],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical],
    interests: [SocialInterest.Music, SocialInterest.Fashion]
  },

  // ZONA SUR (14-16)
  {
    name: "Comuna 14 - El Poblado",
    lat: 6.205, lng: -75.565, // Adjusted south
    baseStrata: 6,
    densityFactor: 0.50,
    spread: 0.015, // Large geographic area
    ageRange: [30, 75],
    educationBias: [EducationLevel.University, EducationLevel.Postgrad],
    interests: [SocialInterest.Travel, SocialInterest.Tech, SocialInterest.Politics]
  },
  {
    name: "Comuna 15 - Guayabal",
    lat: 6.215, lng: -75.585,
    baseStrata: 3,
    densityFactor: 0.60,
    spread: 0.008,
    ageRange: [30, 60],
    educationBias: [EducationLevel.Technical, EducationLevel.Secondary],
    interests: [SocialInterest.Sports, SocialInterest.Politics]
  },
  {
    name: "Comuna 16 - Belén",
    lat: 6.225, lng: -75.600,
    baseStrata: 4,
    densityFactor: 0.80,
    spread: 0.010,
    ageRange: [25, 60],
    educationBias: [EducationLevel.University, EducationLevel.Technical],
    interests: [SocialInterest.Sports, SocialInterest.Travel]
  }
];

export const generateMedellinData = (totalPoints: number = 500): ZoneData[] => {
  const data: ZoneData[] = [];
  // Ensure we have enough points per comuna to look good
  const pointsPerComuna = Math.max(20, Math.floor(totalPoints / COMUNA_PROFILES.length));

  COMUNA_PROFILES.forEach((profile, profileIndex) => {
    for (let i = 0; i < pointsPerComuna; i++) {
      
      const latOffset = randomGaussian() * profile.spread * 0.8; 
      const lngOffset = randomGaussian() * profile.spread * 0.8;
      
      const strataVariance = Math.random() > 0.85 ? (Math.random() > 0.5 ? 1 : -1) : 0;
      let strata = profile.baseStrata + strataVariance;
      if (strata < 1) strata = 1;
      if (strata > 6) strata = 6;

      const eduIndex = Math.floor(Math.random() * profile.educationBias.length);
      const education = profile.educationBias[eduIndex];

      const age = randomRange(profile.ageRange[0], profile.ageRange[1]);

      const interest = Math.random() > 0.4 
        ? profile.interests[Math.floor(Math.random() * profile.interests.length)] 
        : randomEnum(SocialInterest);

      const occupation = ['Comerciante', 'Estudiante', 'Ingeniero', 'Artista', 'Obrero', 'Administrador', 'Pensionado'][Math.floor(Math.random() * 7)];

      // Calculate economic indicators based on profile and strata
      const income = getEstimatedIncome(strata);
      // Employment rate roughly correlates with strata and age, but with noise
      const baseEmployment = 0.8 + (strata * 0.02) - (age > 60 ? 0.3 : 0);
      const employmentRate = Math.min(0.98, Math.max(0.4, baseEmployment + (Math.random() - 0.5) * 0.2));
      const internet = getInternetAccess(strata);

      data.push({
        id: `z-${profileIndex}-${i}`,
        locationName: profile.name,
        lat: profile.lat + latOffset,
        lng: profile.lng + lngOffset,
        density: Math.min(1, Math.max(0, profile.densityFactor + (Math.random() - 0.5) * 0.15)),
        population: Math.floor(profile.densityFactor * 8000 * randomRange(0.8, 1.2)),
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
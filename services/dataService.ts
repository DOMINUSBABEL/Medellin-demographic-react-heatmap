import { ZoneData, EducationLevel, SocialInterest } from '../types';

// Helper to generate random number in range
const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

// Helper to pick random enum
const randomEnum = <T>(anEnum: T): T[keyof T] => {
  const enumValues = Object.values(anEnum as object) as unknown as T[keyof T][];
  const randomIndex = Math.floor(Math.random() * enumValues.length);
  return enumValues[randomIndex];
};

// DATASET: Simulated "Import" from DANE & OSINT Reports
// Coordinates and profiles for Medellín's 16 Comunas + Center
const COMUNA_PROFILES = [
  {
    name: "Comuna 1 - Popular",
    lat: 6.293, lng: -75.545,
    baseStrata: 1,
    densityFactor: 0.95, // High density
    ageRange: [15, 40],
    educationBias: [EducationLevel.Primary, EducationLevel.Secondary],
    interests: [SocialInterest.Music, SocialInterest.Sports]
  },
  {
    name: "Comuna 2 - Santa Cruz",
    lat: 6.285, lng: -75.558,
    baseStrata: 2,
    densityFactor: 0.90,
    ageRange: [18, 50],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical],
    interests: [SocialInterest.Sports, SocialInterest.Music]
  },
  {
    name: "Comuna 3 - Manrique",
    lat: 6.270, lng: -75.550,
    baseStrata: 2, // 2-3
    densityFactor: 0.85,
    ageRange: [20, 60],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical],
    interests: [SocialInterest.Music, SocialInterest.Politics]
  },
  {
    name: "Comuna 4 - Aranjuez",
    lat: 6.275, lng: -75.565,
    baseStrata: 3,
    densityFactor: 0.80,
    ageRange: [25, 65],
    educationBias: [EducationLevel.Secondary, EducationLevel.University],
    interests: [SocialInterest.Politics, SocialInterest.Tech]
  },
  {
    name: "Comuna 13 - San Javier",
    lat: 6.255, lng: -75.605,
    baseStrata: 2,
    densityFactor: 0.92,
    ageRange: [15, 35],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical],
    interests: [SocialInterest.Music, SocialInterest.Fashion] // Urban culture hub
  },
  {
    name: "Comuna 14 - El Poblado",
    lat: 6.210, lng: -75.570,
    baseStrata: 6,
    densityFactor: 0.40, // Towers but spread out
    ageRange: [30, 75],
    educationBias: [EducationLevel.University, EducationLevel.Postgrad],
    interests: [SocialInterest.Travel, SocialInterest.Tech, SocialInterest.Politics]
  },
  {
    name: "Comuna 11 - Laureles-Estadio",
    lat: 6.245, lng: -75.590,
    baseStrata: 5,
    densityFactor: 0.60,
    ageRange: [25, 70],
    educationBias: [EducationLevel.University, EducationLevel.Postgrad],
    interests: [SocialInterest.Tech, SocialInterest.Travel, SocialInterest.Fashion]
  },
  {
    name: "Comuna 10 - La Candelaria (Centro)",
    lat: 6.248, lng: -75.570,
    baseStrata: 3, // Commercial mixed
    densityFactor: 0.70, // High floating population, varying resident density
    ageRange: [20, 50],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical, EducationLevel.University],
    interests: [SocialInterest.Politics, SocialInterest.Tech]
  },
  {
    name: "Comuna 16 - Belén",
    lat: 6.230, lng: -75.600,
    baseStrata: 4, // 3-4-5
    densityFactor: 0.75,
    ageRange: [25, 60],
    educationBias: [EducationLevel.University, EducationLevel.Technical],
    interests: [SocialInterest.Sports, SocialInterest.Travel]
  },
  {
    name: "Comuna 7 - Robledo",
    lat: 6.280, lng: -75.595,
    baseStrata: 3,
    densityFactor: 0.80,
    ageRange: [18, 45], // Student area
    educationBias: [EducationLevel.University, EducationLevel.Technical],
    interests: [SocialInterest.Tech, SocialInterest.Music]
  },
  {
    name: "Comuna 15 - Guayabal",
    lat: 6.220, lng: -75.585,
    baseStrata: 3,
    densityFactor: 0.50, // Industrial
    ageRange: [30, 60],
    educationBias: [EducationLevel.Technical, EducationLevel.Secondary],
    interests: [SocialInterest.Sports, SocialInterest.Politics]
  },
  {
    name: "Comuna 8 - Villa Hermosa",
    lat: 6.250, lng: -75.550,
    baseStrata: 2, // 2-3
    densityFactor: 0.88,
    ageRange: [20, 55],
    educationBias: [EducationLevel.Secondary, EducationLevel.Technical],
    interests: [SocialInterest.Music, SocialInterest.Sports]
  }
];

export const generateMedellinData = (totalPoints: number = 400): ZoneData[] => {
  const data: ZoneData[] = [];
  const pointsPerComuna = Math.floor(totalPoints / COMUNA_PROFILES.length);

  COMUNA_PROFILES.forEach((profile, profileIndex) => {
    for (let i = 0; i < pointsPerComuna; i++) {
      // Gaussian-ish scatter around the comuna center
      // Use Box-Muller transform for better clustering or simple random offset
      const radius = 0.015; // Approx 1.5km spread
      const latOffset = (Math.random() - 0.5) * radius * 2;
      const lngOffset = (Math.random() - 0.5) * radius * 2;
      
      // Add some randomness to attributes based on the profile
      const strataVariance = Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0;
      let strata = profile.baseStrata + strataVariance;
      if (strata < 1) strata = 1;
      if (strata > 6) strata = 6;

      // Select education based on bias
      const eduIndex = Math.floor(Math.random() * profile.educationBias.length);
      const education = profile.educationBias[eduIndex];

      // Age calculation
      const age = randomRange(profile.ageRange[0], profile.ageRange[1]);

      // Interest calculation (weighted towards profile interests, but can be random)
      const interest = Math.random() > 0.4 
        ? profile.interests[Math.floor(Math.random() * profile.interests.length)] 
        : randomEnum(SocialInterest);

      const occupation = ['Comerciante', 'Estudiante', 'Ingeniero', 'Artista', 'Obrero', 'Administrador', 'Pensionado'][Math.floor(Math.random() * 7)];

      data.push({
        id: `z-${profileIndex}-${i}`,
        locationName: profile.name,
        lat: profile.lat + latOffset,
        lng: profile.lng + lngOffset,
        density: Math.min(1, Math.max(0, profile.densityFactor + (Math.random() - 0.5) * 0.2)),
        population: Math.floor(profile.densityFactor * 8000 * randomRange(0.8, 1.2)),
        avgAge: Math.floor(age),
        strata,
        educationLevel: education,
        mainOccupation: occupation,
        topInterest: interest
      });
    }
  });

  return data;
};

import { ZoneData, EducationLevel, SocialInterest } from '../types';

// Approximate center of Medellín
const MEDELLIN_CENTER = { lat: 6.2442, lng: -75.5812 };

// Helper to generate random number in range
const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

// Helper to pick random enum
const randomEnum = <T>(anEnum: T): T[keyof T] => {
  const enumValues = Object.values(anEnum as object) as unknown as T[keyof T][];
  const randomIndex = Math.floor(Math.random() * enumValues.length);
  return enumValues[randomIndex];
};

export const generateMedellinData = (count: number = 300): ZoneData[] => {
  const data: ZoneData[] = [];

  for (let i = 0; i < count; i++) {
    // Generate points around Medellín
    // Biasing slightly to creating clusters
    const latOffset = (Math.random() - 0.5) * 0.12;
    const lngOffset = (Math.random() - 0.5) * 0.10;
    
    const lat = MEDELLIN_CENTER.lat + latOffset;
    const lng = MEDELLIN_CENTER.lng + lngOffset;

    // Simulate socio-economic geography of Medellín
    // El Poblado (SE) -> Higher strata, older, educated
    // North (N) -> Lower strata, dense, younger
    // Center -> Mixed
    
    const isSouthEast = lat < MEDELLIN_CENTER.lat && lng > MEDELLIN_CENTER.lng;
    const isNorth = lat > MEDELLIN_CENTER.lat + 0.02;
    
    let strata = Math.floor(randomRange(1, 4));
    let education = EducationLevel.Secondary;
    let age = randomRange(18, 60);
    let density = randomRange(0.2, 0.8);

    if (isSouthEast) {
      strata = Math.floor(randomRange(4, 7)); // 4, 5, 6
      education = Math.random() > 0.3 ? EducationLevel.Postgrad : EducationLevel.University;
      age = randomRange(30, 75);
      density = randomRange(0.1, 0.6); // Less dense, more space
    } else if (isNorth) {
      strata = Math.floor(randomRange(1, 3)); // 1, 2
      education = Math.random() > 0.6 ? EducationLevel.Secondary : EducationLevel.Primary;
      age = randomRange(15, 45);
      density = randomRange(0.6, 1.0); // Very dense
    }

    // Clamp strata
    if (strata > 6) strata = 6;
    if (strata < 1) strata = 1;

    data.push({
      id: `zone-${i}`,
      lat,
      lng,
      density,
      population: Math.floor(density * 5000) + 500,
      avgAge: Math.floor(age),
      strata,
      educationLevel: education,
      mainOccupation: ['Comerciante', 'Estudiante', 'Ingeniero', 'Artista', 'Obrero', 'Administrador'][Math.floor(Math.random() * 6)],
      topInterest: randomEnum(SocialInterest)
    });
  }

  return data;
};

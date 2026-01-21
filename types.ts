export enum SocialInterest {
  Tech = 'Tecnología',
  Sports = 'Deportes',
  Fashion = 'Moda',
  Politics = 'Política',
  Music = 'Música',
  Travel = 'Viajes'
}

export enum EducationLevel {
  None = 'Sin Escolaridad',
  Primary = 'Primaria',
  Secondary = 'Secundaria',
  Technical = 'Técnico',
  University = 'Universitario',
  Postgrad = 'Posgrado'
}

export interface ZoneData {
  id: string;
  locationName: string; // Comuna Name
  specificSector: string; // Specific Barrio or Sector (New)
  
  lat: number;
  lng: number;
  
  // Changed from fixed bounds to flexible polygon
  polygon: [number, number][]; 
  
  // New: Human readable boundary limits
  cardinalLimits: string; 
  geoContext: string; // "West Bank", "Northern Hills", etc.

  density: number; // 0-1 normalized
  population: number; // Est. count
  avgAge: number;
  mainOccupation: string;
  educationLevel: EducationLevel;
  topInterest: SocialInterest;
  strata: number; // 1-6 Socio-economic strata in Colombia
  
  householdIncome: number; // Monthly COP
  employmentRate: number; // 0.0 to 1.0
  internetAccess: string; // Type of connection
  
  // Internal helper for aggregation
  _barrioSource?: string;
}

export enum MapLayer {
  Density = 'density',
  Age = 'age',
  Education = 'education',
  Strata = 'strata',
  Interest = 'interest'
}
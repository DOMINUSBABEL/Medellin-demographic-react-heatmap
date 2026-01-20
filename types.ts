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
  locationName: string;
  lat: number;
  lng: number;
  // New: Bounds for the Quadtree Rectangle [[lat1, lng1], [lat2, lng2]]
  bounds?: [[number, number], [number, number]]; 
  
  density: number; // 0-1 normalized
  population: number; // Est. count
  avgAge: number;
  mainOccupation: string;
  educationLevel: EducationLevel;
  topInterest: SocialInterest;
  strata: number; // 1-6 Socio-economic strata in Colombia
  
  // New Demographics
  householdIncome: number; // Monthly COP
  employmentRate: number; // 0.0 to 1.0
  internetAccess: string; // Type of connection
}

export enum MapLayer {
  Density = 'density',
  Age = 'age',
  Education = 'education',
  Strata = 'strata',
  Interest = 'interest'
}
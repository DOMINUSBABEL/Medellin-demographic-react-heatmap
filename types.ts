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

export enum PoliticalParty {
  Creemos = 'Creemos (Fico)',
  Independientes = 'Independientes (Upegui)',
  Pacto = 'Pacto Histórico',
  Centro = 'Compromiso / Centro',
  VotoEnBlanco = 'Voto en Blanco'
}

export enum PoliticalSpectrum {
  Derecha = 'Derecha',
  CentroDerecha = 'Centro-Derecha',
  Centro = 'Centro',
  CentroIzquierda = 'Centro-Izquierda',
  Izquierda = 'Izquierda'
}

export interface ZoneData {
  id: string;
  locationName: string; // Comuna Name
  specificSector: string; // Specific Barrio Name (Verified)
  
  lat: number;
  lng: number;
  
  polygon: [number, number][]; 
  
  // Precision Metadata
  cardinalLimits: string; 
  geoContext: string;
  address: string; // New: Estimated Nomenclature (e.g., Calla 10 # 43A)
  postalCode: string; // New: Estimated Postal Code
  landUseType: string; // New: Residential, Commercial, Mixed, Industrial

  density: number; // 0-1 normalized
  population: number; 
  avgAge: number;
  mainOccupation: string;
  educationLevel: EducationLevel;
  topInterest: SocialInterest;
  strata: number; 
  
  householdIncome: number; 
  employmentRate: number; 
  internetAccess: string; 
  
  // Voting Data 2023
  votingPreference: PoliticalParty;
  politicalSpectrum: PoliticalSpectrum;
  
  _barrioSource?: string;
}

export enum MapLayer {
  Density = 'density',
  Age = 'age',
  Education = 'education',
  Strata = 'strata',
  Interest = 'interest',
  Voting = 'voting',
  Spectrum = 'spectrum'
}
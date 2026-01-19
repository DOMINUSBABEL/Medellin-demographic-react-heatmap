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
  locationName: string; // New field for Comuna/Barrio name
  lat: number;
  lng: number;
  density: number; // 0-1 normalized
  population: number; // Est. count
  avgAge: number;
  mainOccupation: string;
  educationLevel: EducationLevel;
  topInterest: SocialInterest;
  strata: number; // 1-6 Socio-economic strata in Colombia
}

export enum MapLayer {
  Density = 'density',
  Age = 'age',
  Education = 'education',
  Strata = 'strata',
  Interest = 'interest'
}
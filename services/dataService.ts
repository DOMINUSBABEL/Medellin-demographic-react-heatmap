import { ZoneData, EducationLevel, SocialInterest, PoliticalParty, PoliticalSpectrum, GovernorVote, PublicCorporationParty, City } from '../types';
import { Delaunay } from 'd3-delaunay';

// --- HELPER FUNCTIONS ---

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

// --- REALISTIC DATA GENERATORS ---

const getInternetAccess = (strata: number): string => {
  const rand = Math.random();
  if (strata >= 5) return rand > 0.15 ? 'Fibra Óptica Simétrica (500MB+)' : 'HFC Ultra Banda Ancha';
  if (strata === 4) return rand > 0.3 ? 'Fibra Óptica (300MB)' : 'HFC Banda Ancha (100MB)';
  if (strata === 3) return rand > 0.5 ? 'Fibra Óptica (100MB)' : 'HFC Básica / Cobre';
  return rand > 0.6 ? 'HFC Prepago' : 'Datos Móviles 4G LTE';
};

const getEstimatedIncome = (strata: number): number => {
  const baseIncome = [0, 980000, 1850000, 3800000, 7500000, 14000000, 28000000];
  const base = baseIncome[strata] || 1000000;
  const varianceFactor = strata >= 5 ? 0.55 : 0.25; 
  const variance = base * varianceFactor; 
  return Math.floor(base + (Math.random() - 0.5) * 2 * variance);
};

// --- POLITICS GENERATOR (MEDELLIN) ---

const getPoliticalProfileMedellin = (strata: number, age: number, comunaName: string) => {
    const r = Math.random();
    const r2 = Math.random();
    const r3 = Math.random();

    let mayor = PoliticalParty.Creemos;
    let governor = GovernorVote.Rendon;
    let council = PublicCorporationParty.Creemos;
    let assembly = PublicCorporationParty.CentroDemocratico;
    let congress = PublicCorporationParty.CentroDemocratico;
    let spectrum = PoliticalSpectrum.Derecha;

    // 1. ZONA SUR-OCCIDENTE Y ELITES (Poblado, Laureles, Belén)
    if (['El Poblado', 'Laureles', 'Belén'].some(c => comunaName.includes(c))) {
        spectrum = PoliticalSpectrum.Derecha;
        if (comunaName.includes('Laureles') && r > 0.85) spectrum = PoliticalSpectrum.Centro;

        // Mayor 2023 (Fico Landslide 80%+)
        if (r < 0.85) mayor = PoliticalParty.Creemos;
        else if (r < 0.92) mayor = PoliticalParty.Centro; 
        else if (r < 0.96) mayor = PoliticalParty.VotoEnBlanco;
        else mayor = PoliticalParty.Independientes;

        // Governor 2023 
        if (r < 0.75) governor = GovernorVote.Rendon;
        else if (r < 0.90) governor = GovernorVote.Suarez;
        else governor = GovernorVote.Bedoya;

        // Congress 2022 
        if (r2 < 0.70) congress = PublicCorporationParty.CentroDemocratico;
        else if (r2 < 0.85) congress = PublicCorporationParty.Creemos; 
        else if (r2 < 0.95) congress = PublicCorporationParty.AlianzaVerde;
        else congress = PublicCorporationParty.PactoHistorico;
        
        council = r < 0.6 ? PublicCorporationParty.Creemos : PublicCorporationParty.CentroDemocratico;
        assembly = PublicCorporationParty.CentroDemocratico;
    }
    // 2. ZONA NOR-ORIENTAL (Popular, Santa Cruz, Manrique, Aranjuez)
    else if (['Popular', 'Santa Cruz', 'Manrique', 'Aranjuez'].some(c => comunaName.includes(c))) {
        spectrum = r > 0.5 ? PoliticalSpectrum.CentroDerecha : PoliticalSpectrum.Izquierda;

        if (r < 0.60) mayor = PoliticalParty.Creemos;
        else if (r < 0.85) mayor = PoliticalParty.Independientes;
        else mayor = PoliticalParty.Pacto;

        if (r < 0.50) governor = GovernorVote.LuisPerez;
        else if (r < 0.75) governor = GovernorVote.Bedoya;
        else if (r < 0.90) governor = GovernorVote.Rendon;
        else governor = GovernorVote.VotoEnBlanco;

        if (r2 < 0.45) congress = PublicCorporationParty.PactoHistorico;
        else if (r2 < 0.70) congress = PublicCorporationParty.PartidoLiberal; 
        else if (r2 < 0.85) congress = PublicCorporationParty.PartidoConservador;
        else congress = PublicCorporationParty.CentroDemocratico;

        council = r3 > 0.5 ? PublicCorporationParty.PartidoLiberal : PublicCorporationParty.ASI;
        assembly = PublicCorporationParty.PartidoConservador;
    }
    // 3. ZONA NOR-OCCIDENTAL (Castilla, 12 de Octubre, Robledo)
    else if (['Castilla', 'Doce de Octubre', 'Robledo'].some(c => comunaName.includes(c))) {
        spectrum = PoliticalSpectrum.CentroIzquierda;

        if (r < 0.65) mayor = PoliticalParty.Creemos;
        else if (r < 0.85) mayor = PoliticalParty.Independientes;
        else mayor = PoliticalParty.Pacto;

        if (r < 0.40) governor = GovernorVote.LuisPerez;
        else if (r < 0.70) governor = GovernorVote.Suarez;
        else governor = GovernorVote.Rendon;

        if (r2 < 0.35) congress = PublicCorporationParty.PactoHistorico;
        else if (r2 < 0.65) congress = PublicCorporationParty.AlianzaVerde; 
        else congress = PublicCorporationParty.CentroDemocratico;

        council = PublicCorporationParty.AlianzaVerde;
        assembly = PublicCorporationParty.PartidoLiberal;
    }
    // 4. CENTRO ORIENTAL (Villa Hermosa, Buenos Aires, La Candelaria)
    else if (['Villa Hermosa', 'Buenos Aires', 'La Candelaria'].some(c => comunaName.includes(c))) {
        spectrum = PoliticalSpectrum.Centro;

        if (r < 0.70) mayor = PoliticalParty.Creemos;
        else if (r < 0.85) mayor = PoliticalParty.Centro; 
        else mayor = PoliticalParty.Independientes;

        if (r < 0.40) governor = GovernorVote.Suarez;
        else if (r < 0.70) governor = GovernorVote.Rendon;
        else governor = GovernorVote.LuisPerez;

        if (r2 < 0.30) congress = PublicCorporationParty.PactoHistorico;
        else if (r2 < 0.60) congress = PublicCorporationParty.AlianzaVerde;
        else congress = PublicCorporationParty.CentroDemocratico;

        council = PublicCorporationParty.AlianzaVerde;
        assembly = PublicCorporationParty.ASI;
    }
    // 5. ZONA OCCIDENTAL Y CORREGIMIENTOS
    else {
        spectrum = PoliticalSpectrum.CentroDerecha;

        if (r < 0.65) mayor = PoliticalParty.Creemos;
        else if (r < 0.80) mayor = PoliticalParty.Independientes; 
        else mayor = PoliticalParty.Pacto;

        if (r < 0.45) governor = GovernorVote.LuisPerez; 
        else if (r < 0.70) governor = GovernorVote.Rendon;
        else governor = GovernorVote.Bedoya;

        if (r2 < 0.35) congress = PublicCorporationParty.PactoHistorico; 
        else if (r2 < 0.65) congress = PublicCorporationParty.PartidoConservador; 
        else congress = PublicCorporationParty.CentroDemocratico;

        council = PublicCorporationParty.PartidoConservador;
        assembly = PublicCorporationParty.ASI;
    }

    return { mayor, spectrum, governor, council, assembly, congress };
};

// --- POLITICS GENERATOR (BOGOTA) ---

const getPoliticalProfileBogota = (strata: number, age: number, comunaName: string) => {
    const r = Math.random();
    const r2 = Math.random();
    const r3 = Math.random();

    let mayor = PoliticalParty.Galan;
    let governor = GovernorVote.Rey; // Jorge Emilio Rey (Cundinamarca)
    let council = PublicCorporationParty.AlianzaVerde;
    let assembly = PublicCorporationParty.AlianzaVerde;
    let congress = PublicCorporationParty.PactoHistorico;
    let spectrum = PoliticalSpectrum.CentroIzquierda;

    // LOGIC BASED ON BOGOTA GEOGRAPHY

    // 1. NORTH & ELITE (Usaquén, Chapinero - High Income)
    if (['Usaquén', 'Chapinero'].some(c => comunaName.includes(c))) {
        spectrum = PoliticalSpectrum.CentroDerecha;
        if (comunaName.includes('Chapinero') && r > 0.7) spectrum = PoliticalSpectrum.Centro;

        // Mayor 2023 (Galán strong, Oviedo runner up)
        if (r < 0.60) mayor = PoliticalParty.Galan;
        else if (r < 0.90) mayor = PoliticalParty.Oviedo;
        else mayor = PoliticalParty.Bolivar;

        // Governor 2023 (Cundinamarca influence less direct in city vote but used for sim)
        if (r < 0.60) governor = GovernorVote.Rey;
        else governor = GovernorVote.Nancy;

        // Congress 2022
        if (r2 < 0.40) congress = PublicCorporationParty.AlianzaVerde;
        else if (r2 < 0.70) congress = PublicCorporationParty.CentroDemocratico;
        else if (r2 < 0.90) congress = PublicCorporationParty.PactoHistorico;
        else congress = PublicCorporationParty.PartidoLiberal;

        council = r3 < 0.5 ? PublicCorporationParty.AlianzaVerde : PublicCorporationParty.CentroDemocratico;
        assembly = PublicCorporationParty.CentroDemocratico;
    }

    // 2. WEST & WORKING CLASS (Engativá, Fontibón)
    else if (['Engativá', 'Fontibón'].some(c => comunaName.includes(c))) {
        spectrum = PoliticalSpectrum.Centro;

        if (r < 0.55) mayor = PoliticalParty.Galan;
        else if (r < 0.80) mayor = PoliticalParty.Bolivar;
        else mayor = PoliticalParty.Oviedo;

        if (r < 0.70) governor = GovernorVote.Rey;
        else governor = GovernorVote.Nancy;

        if (r2 < 0.50) congress = PublicCorporationParty.PactoHistorico;
        else if (r2 < 0.80) congress = PublicCorporationParty.AlianzaVerde;
        else congress = PublicCorporationParty.PartidoLiberal;

        council = PublicCorporationParty.AlianzaVerde;
        assembly = PublicCorporationParty.PartidoLiberal;
    }

    // 3. SOUTH (Kennedy, Bosa, Ciudad Bolívar - Strong Left)
    else if (['Kennedy', 'Bosa', 'Ciudad Bolívar', 'Usme'].some(c => comunaName.includes(c))) {
        spectrum = PoliticalSpectrum.Izquierda;

        if (r < 0.40) mayor = PoliticalParty.Galan;
        else if (r < 0.85) mayor = PoliticalParty.Bolivar;
        else mayor = PoliticalParty.Molano; // Some right wing opposition

        if (r < 0.80) governor = GovernorVote.Rey;
        else governor = GovernorVote.Nancy;

        if (r2 < 0.65) congress = PublicCorporationParty.PactoHistorico;
        else if (r2 < 0.85) congress = PublicCorporationParty.PartidoLiberal;
        else congress = PublicCorporationParty.AlianzaVerde;

        council = PublicCorporationParty.PactoHistorico;
        assembly = PublicCorporationParty.PactoHistorico;
    }

    // 4. CENTER (Santa Fe, Candelaria, Teusaquillo - Progressive/Intellectual)
    else if (['Santa Fe', 'La Candelaria', 'Teusaquillo'].some(c => comunaName.includes(c))) {
        spectrum = PoliticalSpectrum.CentroIzquierda;

        if (r < 0.50) mayor = PoliticalParty.Galan;
        else if (r < 0.80) mayor = PoliticalParty.Bolivar;
        else mayor = PoliticalParty.Oviedo;

        if (r2 < 0.50) congress = PublicCorporationParty.PactoHistorico;
        else if (r2 < 0.80) congress = PublicCorporationParty.AlianzaVerde;
        else congress = PublicCorporationParty.CentroDemocratico;

        council = PublicCorporationParty.PactoHistorico;
        assembly = PublicCorporationParty.AlianzaVerde;
    }
    else {
         // Suba and others
        spectrum = PoliticalSpectrum.Centro;
        if (r < 0.60) mayor = PoliticalParty.Galan;
        else if (r < 0.80) mayor = PoliticalParty.Oviedo;
        else mayor = PoliticalParty.Bolivar;

        if (r < 0.65) governor = GovernorVote.Rey;
        else governor = GovernorVote.Nancy;

        if (r2 < 0.40) congress = PublicCorporationParty.AlianzaVerde;
        else if (r2 < 0.70) congress = PublicCorporationParty.PactoHistorico;
        else congress = PublicCorporationParty.CentroDemocratico;

        council = PublicCorporationParty.AlianzaVerde;
        assembly = PublicCorporationParty.PartidoLiberal;
    }

    return { mayor, spectrum, governor, council, assembly, congress };
};

// --- NOMENCLATURE & ADDRESS SYSTEM ---

const estimateAddressMedellin = (lat: number, lng: number): string => {
  const dLat = lat - 6.245;
  const dLng = lng - (-75.573);

  const degPerCalle = 0.0009; 
  const degPerCarrera = 0.0009;

  let calleNum = 44 + (dLat / degPerCalle);
  let carreraNum = 52 - (dLng / degPerCarrera); 

  const isSur = calleNum < 1;
  const finalCalle = isSur ? Math.abs(Math.round(calleNum)) + " Sur" : Math.round(calleNum);
  const finalCarrera = Math.round(carreraNum);
  const placa = Math.floor(Math.random() * 90) + 1;
  const prefix = Math.random() > 0.9 ? (Math.random() > 0.5 ? 'Transversal' : 'Circular') : (Math.random() > 0.5 ? 'Calle' : 'Carrera');

  return `${prefix} ${Math.random() > 0.5 ? finalCalle : finalCarrera} # ${Math.random() > 0.5 ? finalCarrera : finalCalle} - ${placa}`;
};

const estimateAddressBogota = (lat: number, lng: number): string => {
    // Bogota Approx Center: Calle 26, Carrera 30 (~ 4.63, -74.08)
    const dLat = lat - 4.63;
    const dLng = lng - (-74.08);

    const degPerCalle = 0.0009;
    const degPerCarrera = 0.0009;

    let calleNum = 26 + (dLat / degPerCalle);
    let carreraNum = 30 - (dLng / degPerCarrera);

    const isSur = calleNum < 1;
    const finalCalle = isSur ? Math.abs(Math.round(calleNum)) + " Sur" : Math.round(calleNum);
    const finalCarrera = Math.round(carreraNum);
    const placa = Math.floor(Math.random() * 90) + 1;
    const prefix = Math.random() > 0.8 ? 'Transversal' : (Math.random() > 0.5 ? 'Calle' : 'Carrera');

    return `${prefix} ${Math.random() > 0.5 ? finalCalle : finalCarrera} # ${Math.random() > 0.5 ? finalCarrera : finalCalle} - ${placa}`;
};

const estimatePostalCodeMedellin = (comunaName: string): string => {
    const map: Record<string, string> = {
        'Popular': '050001', 'Santa Cruz': '050002', 'Manrique': '050003', 'Aranjuez': '050004',
        'Castilla': '050005', 'Doce de Octubre': '050006', 'Robledo': '050007', 'Villa Hermosa': '050008',
        'Buenos Aires': '050009', 'La Candelaria': '050010', 'Laureles': '050031', 'La América': '050032',
        'San Javier': '050033', 'El Poblado': '050021', 'Guayabal': '050024', 'Belén': '050030',
        'San Antonio de Prado': '050036', 'Altavista': '050035'
    };
    for (const key in map) {
        if (comunaName.includes(key)) return map[key];
    }
    return '050001';
};

const estimatePostalCodeBogota = (localidadName: string): string => {
    // Basic mapping for Bogota
    const map: Record<string, string> = {
        'Usaquén': '110111', 'Chapinero': '110221', 'Santa Fe': '110311', 'San Cristóbal': '110411',
        'Usme': '110511', 'Tunjuelito': '110611', 'Bosa': '110711', 'Kennedy': '110811',
        'Fontibón': '110911', 'Engativá': '111011', 'Suba': '111111', 'Barrios Unidos': '111211',
        'Teusaquillo': '111311', 'Los Mártires': '111411', 'Antonio Nariño': '111511', 'Puente Aranda': '111611',
        'La Candelaria': '111711', 'Rafael Uribe': '111811', 'Ciudad Bolívar': '111911', 'Sumapaz': '112011'
    };
    for (const key in map) {
        if (localidadName.includes(key)) return map[key];
    }
    return '110111';
};

// --- GEOMETRY HELPERS ---

const calculatePolygonArea = (polygon: [number, number][]): number => {
    if (!polygon || polygon.length < 3) return 0.000001; 
    let area = 0;
    for (let i = 0; i < polygon.length; i++) {
        const j = (i + 1) % polygon.length;
        area += polygon[i][0] * polygon[j][1];
        area -= polygon[j][0] * polygon[i][1];
    }
    return Math.abs(area) / 2;
};

// --- BARRIO DATABASES ---

interface BarrioDefinition {
    name: string;
    comuna: string; // or Localidad
    lat: number;
    lng: number;
    strata: number; 
    landUse: 'Residencial' | 'Comercial' | 'Mixto' | 'Industrial' | 'Rural' | 'Institucional';
}

const MEDELLIN_BARRIOS: BarrioDefinition[] = [
    // --- COMUNA 14 - EL POBLADO ---
    { name: "Provenza", comuna: "El Poblado", lat: 6.208, lng: -75.566, strata: 6, landUse: "Mixto" },
    { name: "Manila", comuna: "El Poblado", lat: 6.215, lng: -75.571, strata: 5, landUse: "Mixto" },
    { name: "El Tesoro", comuna: "El Poblado", lat: 6.198, lng: -75.558, strata: 6, landUse: "Residencial" },
    { name: "Castropol", comuna: "El Poblado", lat: 6.218, lng: -75.568, strata: 6, landUse: "Residencial" },
    { name: "Los Balsos No.1", comuna: "El Poblado", lat: 6.190, lng: -75.560, strata: 6, landUse: "Residencial" },
    { name: "Los Balsos No.2", comuna: "El Poblado", lat: 6.185, lng: -75.555, strata: 6, landUse: "Residencial" },
    { name: "San Lucas", comuna: "El Poblado", lat: 6.175, lng: -75.565, strata: 6, landUse: "Residencial" },
    { name: "La Aguacatala", comuna: "El Poblado", lat: 6.195, lng: -75.578, strata: 5, landUse: "Comercial" },
    { name: "Santa María de los Ángeles", comuna: "El Poblado", lat: 6.192, lng: -75.580, strata: 6, landUse: "Residencial" },
    { name: "El Castillo", comuna: "El Poblado", lat: 6.182, lng: -75.575, strata: 6, landUse: "Residencial" },
    { name: "Loma del Indio", comuna: "El Poblado", lat: 6.220, lng: -75.555, strata: 4, landUse: "Residencial" },

    // --- COMUNA 11 - LAURELES ---
    { name: "Primer Parque Laureles", comuna: "Laureles", lat: 6.242, lng: -75.590, strata: 5, landUse: "Mixto" },
    { name: "Segundo Parque Laureles", comuna: "Laureles", lat: 6.246, lng: -75.595, strata: 5, landUse: "Residencial" },
    { name: "Estadio", comuna: "Laureles", lat: 6.252, lng: -75.588, strata: 4, landUse: "Comercial" },
    { name: "Carlos E. Restrepo", comuna: "Laureles", lat: 6.258, lng: -75.582, strata: 5, landUse: "Residencial" },
    { name: "Conquistadores", comuna: "Laureles", lat: 6.240, lng: -75.582, strata: 5, landUse: "Residencial" },
    { name: "Bolivariana", comuna: "Laureles", lat: 6.238, lng: -75.592, strata: 5, landUse: "Residencial" },
    { name: "Las Acacias", comuna: "Laureles", lat: 6.235, lng: -75.598, strata: 4, landUse: "Residencial" },
    { name: "Naranjal", comuna: "Laureles", lat: 6.250, lng: -75.578, strata: 3, landUse: "Comercial" },

    // --- COMUNA 16 - BELÉN ---
    { name: "Belén Parque", comuna: "Belén", lat: 6.230, lng: -75.598, strata: 3, landUse: "Mixto" },
    { name: "Rosales", comuna: "Belén", lat: 6.235, lng: -75.602, strata: 4, landUse: "Residencial" },
    { name: "La Mota", comuna: "Belén", lat: 6.215, lng: -75.605, strata: 5, landUse: "Residencial" },
    { name: "San Bernardo", comuna: "Belén", lat: 6.220, lng: -75.610, strata: 3, landUse: "Residencial" },
    { name: "Belén Rincón", comuna: "Belén", lat: 6.205, lng: -75.615, strata: 2, landUse: "Residencial" },
    { name: "Loma de los Bernal", comuna: "Belén", lat: 6.218, lng: -75.620, strata: 5, landUse: "Residencial" },
    { name: "Belén Aliadas", comuna: "Belén", lat: 6.210, lng: -75.612, strata: 3, landUse: "Residencial" },
    { name: "Fatima", comuna: "Belén", lat: 6.235, lng: -75.585, strata: 3, landUse: "Residencial" },

    // --- COMUNA 12 - LA AMÉRICA ---
    { name: "La Floresta", comuna: "La América", lat: 6.255, lng: -75.602, strata: 4, landUse: "Residencial" },
    { name: "Calasanz Parte Alta", comuna: "La América", lat: 6.265, lng: -75.610, strata: 5, landUse: "Residencial" },
    { name: "Calasanz", comuna: "La América", lat: 6.260, lng: -75.605, strata: 4, landUse: "Residencial" },
    { name: "Santa Mónica", comuna: "La América", lat: 6.250, lng: -75.608, strata: 4, landUse: "Residencial" },
    { name: "Barrio Cristobal", comuna: "La América", lat: 6.252, lng: -75.612, strata: 3, landUse: "Residencial" },
    { name: "Los Pinos", comuna: "La América", lat: 6.258, lng: -75.615, strata: 3, landUse: "Residencial" },

    // --- COMUNA 13 - SAN JAVIER ---
    { name: "Las Independencias I", comuna: "San Javier", lat: 6.255, lng: -75.620, strata: 2, landUse: "Mixto" },
    { name: "Las Independencias II", comuna: "San Javier", lat: 6.257, lng: -75.622, strata: 1, landUse: "Residencial" },
    { name: "San Javier Central", comuna: "San Javier", lat: 6.253, lng: -75.612, strata: 3, landUse: "Comercial" },
    { name: "20 de Julio", comuna: "San Javier", lat: 6.258, lng: -75.625, strata: 1, landUse: "Residencial" },
    { name: "El Salado", comuna: "San Javier", lat: 6.262, lng: -75.628, strata: 2, landUse: "Residencial" },
    { name: "Eduardo Santos", comuna: "San Javier", lat: 6.250, lng: -75.625, strata: 1, landUse: "Residencial" },

    // --- COMUNA 10 - CENTRO (LA CANDELARIA) ---
    { name: "La Candelaria", comuna: "La Candelaria", lat: 6.248, lng: -75.570, strata: 3, landUse: "Comercial" },
    { name: "Prado Centro", comuna: "La Candelaria", lat: 6.258, lng: -75.568, strata: 4, landUse: "Mixto" },
    { name: "Boston", comuna: "La Candelaria", lat: 6.245, lng: -75.558, strata: 3, landUse: "Residencial" },
    { name: "San Diego", comuna: "La Candelaria", lat: 6.238, lng: -75.568, strata: 4, landUse: "Comercial" },
    { name: "Estación Villa", comuna: "La Candelaria", lat: 6.252, lng: -75.575, strata: 2, landUse: "Comercial" },
    { name: "San Benito", comuna: "La Candelaria", lat: 6.255, lng: -75.572, strata: 2, landUse: "Comercial" },
    { name: "Villanueva", comuna: "La Candelaria", lat: 6.256, lng: -75.565, strata: 3, landUse: "Institucional" },
    { name: "Corazón de Jesús", comuna: "La Candelaria", lat: 6.242, lng: -75.575, strata: 2, landUse: "Comercial" },

    // --- COMUNA 7 - ROBLEDO ---
    { name: "Robledo Parque", comuna: "Robledo", lat: 6.278, lng: -75.598, strata: 3, landUse: "Residencial" },
    { name: "Pilarica", comuna: "Robledo", lat: 6.272, lng: -75.592, strata: 4, landUse: "Residencial" },
    { name: "Los Colores", comuna: "Robledo", lat: 6.265, lng: -75.595, strata: 4, landUse: "Residencial" },
    { name: "Aures", comuna: "Robledo", lat: 6.285, lng: -75.605, strata: 2, landUse: "Residencial" },
    { name: "El Diamante", comuna: "Robledo", lat: 6.275, lng: -75.588, strata: 3, landUse: "Residencial" },
    { name: "Bello Horizonte", comuna: "Robledo", lat: 6.282, lng: -75.592, strata: 2, landUse: "Residencial" },
    { name: "Villa Flora", comuna: "Robledo", lat: 6.280, lng: -75.585, strata: 3, landUse: "Residencial" },

    // --- COMUNA 5 - CASTILLA ---
    { name: "Castilla", comuna: "Castilla", lat: 6.295, lng: -75.575, strata: 3, landUse: "Mixto" },
    { name: "Toscana", comuna: "Castilla", lat: 6.300, lng: -75.570, strata: 2, landUse: "Residencial" },
    { name: "Las Brisas", comuna: "Castilla", lat: 6.292, lng: -75.572, strata: 2, landUse: "Residencial" },
    { name: "Florencia", comuna: "Castilla", lat: 6.288, lng: -75.575, strata: 3, landUse: "Residencial" },
    { name: "Boyaca", comuna: "Castilla", lat: 6.298, lng: -75.568, strata: 2, landUse: "Residencial" },

    // --- COMUNA 6 - DOCE DE OCTUBRE ---
    { name: "Doce de Octubre", comuna: "Doce de Octubre", lat: 6.305, lng: -75.585, strata: 2, landUse: "Residencial" },
    { name: "El Picacho", comuna: "Doce de Octubre", lat: 6.312, lng: -75.590, strata: 1, landUse: "Residencial" },
    { name: "Kennedy", comuna: "Doce de Octubre", lat: 6.298, lng: -75.582, strata: 2, landUse: "Residencial" },
    { name: "Santander", comuna: "Doce de Octubre", lat: 6.302, lng: -75.578, strata: 2, landUse: "Residencial" },

    // --- COMUNA 1 - POPULAR ---
    { name: "Santo Domingo Savio", comuna: "Popular", lat: 6.295, lng: -75.542, strata: 1, landUse: "Residencial" },
    { name: "Granizal", comuna: "Popular", lat: 6.288, lng: -75.545, strata: 1, landUse: "Residencial" },
    { name: "Popular No.1", comuna: "Popular", lat: 6.292, lng: -75.548, strata: 1, landUse: "Residencial" },
    { name: "Popular No.2", comuna: "Popular", lat: 6.298, lng: -75.545, strata: 1, landUse: "Residencial" },
    { name: "La Avanzada", comuna: "Popular", lat: 6.290, lng: -75.540, strata: 1, landUse: "Residencial" },

    // --- COMUNA 2 - SANTA CRUZ ---
    { name: "Santa Cruz", comuna: "Santa Cruz", lat: 6.292, lng: -75.558, strata: 2, landUse: "Residencial" },
    { name: "La Rosa", comuna: "Santa Cruz", lat: 6.288, lng: -75.555, strata: 2, landUse: "Residencial" },
    { name: "Moscú No. 1", comuna: "Santa Cruz", lat: 6.295, lng: -75.552, strata: 2, landUse: "Residencial" },
    { name: "Villa del Socorro", comuna: "Santa Cruz", lat: 6.298, lng: -75.555, strata: 2, landUse: "Residencial" },

    // --- COMUNA 3 - MANRIQUE ---
    { name: "Manrique Central", comuna: "Manrique", lat: 6.275, lng: -75.552, strata: 3, landUse: "Comercial" },
    { name: "La Salle", comuna: "Manrique", lat: 6.272, lng: -75.548, strata: 3, landUse: "Residencial" },
    { name: "Las Granjas", comuna: "Manrique", lat: 6.268, lng: -75.545, strata: 2, landUse: "Residencial" },
    { name: "El Raizal", comuna: "Manrique", lat: 6.280, lng: -75.545, strata: 2, landUse: "Residencial" },
    { name: "Versalles No.1", comuna: "Manrique", lat: 6.278, lng: -75.550, strata: 2, landUse: "Residencial" },

    // --- COMUNA 4 - ARANJUEZ ---
    { name: "Aranjuez", comuna: "Aranjuez", lat: 6.278, lng: -75.562, strata: 3, landUse: "Mixto" },
    { name: "Moravia", comuna: "Aranjuez", lat: 6.272, lng: -75.565, strata: 2, landUse: "Mixto" },
    { name: "Campo Valdés", comuna: "Aranjuez", lat: 6.270, lng: -75.558, strata: 3, landUse: "Residencial" },
    { name: "San Cayetano", comuna: "Aranjuez", lat: 6.275, lng: -75.558, strata: 3, landUse: "Residencial" },
    { name: "Miranda", comuna: "Aranjuez", lat: 6.278, lng: -75.568, strata: 3, landUse: "Residencial" },

    // --- COMUNA 8 - VILLA HERMOSA ---
    { name: "Villa Hermosa", comuna: "Villa Hermosa", lat: 6.252, lng: -75.548, strata: 3, landUse: "Residencial" },
    { name: "Enciso", comuna: "Villa Hermosa", lat: 6.248, lng: -75.545, strata: 2, landUse: "Residencial" },
    { name: "La Mansión", comuna: "Villa Hermosa", lat: 6.255, lng: -75.550, strata: 3, landUse: "Residencial" },
    { name: "La Ladera", comuna: "Villa Hermosa", lat: 6.250, lng: -75.540, strata: 1, landUse: "Residencial" },
    { name: "Caicedo", comuna: "Villa Hermosa", lat: 6.245, lng: -75.542, strata: 2, landUse: "Residencial" },
    { name: "La Sierra", comuna: "Villa Hermosa", lat: 6.238, lng: -75.535, strata: 1, landUse: "Rural" },

    // --- COMUNA 9 - BUENOS AIRES ---
    { name: "Buenos Aires", comuna: "Buenos Aires", lat: 6.235, lng: -75.555, strata: 3, landUse: "Mixto" },
    { name: "La Milagrosa", comuna: "Buenos Aires", lat: 6.238, lng: -75.548, strata: 3, landUse: "Residencial" },
    { name: "El Salvador", comuna: "Buenos Aires", lat: 6.240, lng: -75.560, strata: 3, landUse: "Residencial" },
    { name: "Loreto", comuna: "Buenos Aires", lat: 6.230, lng: -75.550, strata: 3, landUse: "Residencial" },
    { name: "Miraflores", comuna: "Buenos Aires", lat: 6.232, lng: -75.545, strata: 3, landUse: "Residencial" },
    { name: "Alejandro Echavarría", comuna: "Buenos Aires", lat: 6.235, lng: -75.540, strata: 3, landUse: "Residencial" },

    // --- COMUNA 15 - GUAYABAL ---
    { name: "Guayabal", comuna: "Guayabal", lat: 6.215, lng: -75.585, strata: 3, landUse: "Industrial" },
    { name: "Cristo Rey", comuna: "Guayabal", lat: 6.212, lng: -75.590, strata: 3, landUse: "Residencial" },
    { name: "Santa Fe", comuna: "Guayabal", lat: 6.220, lng: -75.582, strata: 3, landUse: "Mixto" },
    { name: "Campo Amor", comuna: "Guayabal", lat: 6.208, lng: -75.588, strata: 3, landUse: "Residencial" },
    { name: "Tenche", comuna: "Guayabal", lat: 6.225, lng: -75.580, strata: 2, landUse: "Industrial" },

    // --- CORREGIMIENTOS/PERIFERIA (Context) ---
    { name: "Altavista Centro", comuna: "Altavista", lat: 6.210, lng: -75.630, strata: 1, landUse: "Rural" },
    { name: "San Antonio de Prado", comuna: "San Antonio de Prado", lat: 6.185, lng: -75.645, strata: 2, landUse: "Rural" },
    { name: "Santa Elena (Entrada)", comuna: "Santa Elena", lat: 6.240, lng: -75.520, strata: 3, landUse: "Rural" }
];

const BOGOTA_BARRIOS: BarrioDefinition[] = [
    { name: "Chapinero Alto", comuna: "Chapinero", lat: 4.646, lng: -74.055, strata: 5, landUse: "Mixto" },
    { name: "Chicó Norte", comuna: "Chapinero", lat: 4.680, lng: -74.050, strata: 6, landUse: "Residencial" },
    { name: "Usaquén", comuna: "Usaquén", lat: 4.698, lng: -74.030, strata: 6, landUse: "Mixto" },
    { name: "Cedritos", comuna: "Usaquén", lat: 4.725, lng: -74.045, strata: 4, landUse: "Residencial" },
    { name: "Suba Centro", comuna: "Suba", lat: 4.743, lng: -74.085, strata: 3, landUse: "Mixto" },
    { name: "Niza", comuna: "Suba", lat: 4.708, lng: -74.070, strata: 5, landUse: "Residencial" },
    { name: "Engativá Centro", comuna: "Engativá", lat: 4.705, lng: -74.110, strata: 3, landUse: "Residencial" },
    { name: "Normandía", comuna: "Engativá", lat: 4.665, lng: -74.110, strata: 4, landUse: "Residencial" },
    { name: "Fontibón Centro", comuna: "Fontibón", lat: 4.673, lng: -74.143, strata: 3, landUse: "Mixto" },
    { name: "Modelia", comuna: "Fontibón", lat: 4.655, lng: -74.125, strata: 4, landUse: "Residencial" },
    { name: "Kennedy Central", comuna: "Kennedy", lat: 4.630, lng: -74.155, strata: 3, landUse: "Comercial" },
    { name: "Castilla", comuna: "Kennedy", lat: 4.650, lng: -74.145, strata: 3, landUse: "Residencial" },
    { name: "Patio Bonito", comuna: "Kennedy", lat: 4.640, lng: -74.175, strata: 2, landUse: "Residencial" },
    { name: "Bosa Centro", comuna: "Bosa", lat: 4.608, lng: -74.195, strata: 2, landUse: "Mixto" },
    { name: "Ciudad Bolívar (Arborizadora)", comuna: "Ciudad Bolívar", lat: 4.580, lng: -74.165, strata: 1, landUse: "Residencial" },
    { name: "San Francisco", comuna: "Ciudad Bolívar", lat: 4.570, lng: -74.155, strata: 1, landUse: "Residencial" },
    { name: "Usme Centro", comuna: "Usme", lat: 4.530, lng: -74.115, strata: 1, landUse: "Rural" },
    { name: "Teusaquillo", comuna: "Teusaquillo", lat: 4.630, lng: -74.070, strata: 4, landUse: "Institucional" },
    { name: "Salitre Greco", comuna: "Teusaquillo", lat: 4.650, lng: -74.100, strata: 4, landUse: "Residencial" },
    { name: "La Candelaria", comuna: "La Candelaria", lat: 4.596, lng: -74.074, strata: 3, landUse: "Institucional" },
    { name: "Las Nieves", comuna: "Santa Fe", lat: 4.605, lng: -74.070, strata: 3, landUse: "Comercial" },
    { name: "San Victorino", comuna: "Santa Fe", lat: 4.600, lng: -74.080, strata: 2, landUse: "Comercial" },
    { name: "Tunjuelito", comuna: "Tunjuelito", lat: 4.590, lng: -74.135, strata: 2, landUse: "Industrial" }
];

const findClosestBarrio = (lat: number, lng: number, barrios: BarrioDefinition[]): BarrioDefinition => {
    let closest = barrios[0];
    let minDist = Infinity;
    for (const b of barrios) {
        const d = Math.pow(b.lat - lat, 2) + Math.pow(b.lng - lng, 2);
        if (d < minDist) {
            minDist = d;
            closest = b;
        }
    }
    return closest;
};

// --- AGGREGATION LOGIC (UPDATED) ---

const formatCoord = (n: number) => n.toFixed(5); 

const generatePolygonLimits = (polygon: [number, number][]): string => {
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    polygon.forEach(p => {
        if (p[0] < minLat) minLat = p[0];
        if (p[0] > maxLat) maxLat = p[0];
        if (p[1] < minLng) minLng = p[1];
        if (p[1] > maxLng) maxLng = p[1];
    });
    return `${formatCoord(maxLat)}N ${formatCoord(minLng)}W`;
};

const getModeFromRecord = (counts: Record<string, number>): string => {
    let maxEl = '', maxCount = 0;
    for (const key in counts) {
        if (counts[key] > maxCount) {
            maxEl = key;
            maxCount = counts[key];
        }
    }
    return maxEl;
};

const getVoteBreakdownFromRecord = (counts: Record<string, number>, total: number): { party: string; percent: number }[] => {
    if (total === 0) return [];
    return Object.entries(counts)
        .map(([party, count]) => ({
            party,
            percent: parseFloat(((count / total) * 100).toFixed(1))
        }))
        .sort((a, b) => b.percent - a.percent)
        .slice(0, 3);
};

const aggregateClusterData = (node: {points: ZoneData[], centroidLat: number, centroidLng: number}, polygon: [number, number][], index: number, normalizedDensity: number, city: City): ZoneData => {
  const points = node.points;
  const safeCount = points.length || 1; 
  
  let totalPopulation = 0;
  let sumIncome = 0;
  let sumAge = 0;
  let sumStrata = 0;
  let sumEmployment = 0;

  const votingPreferenceCounts: Record<string, number> = {};
  const politicalSpectrumCounts: Record<string, number> = {};
  const votingGovernorCounts: Record<string, number> = {};
  const votingCouncilCounts: Record<string, number> = {};
  const votingAssemblyCounts: Record<string, number> = {};
  const votingCongressCounts: Record<string, number> = {};

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    totalPopulation += p.population;
    sumIncome += p.householdIncome;
    sumAge += p.avgAge;
    sumStrata += p.strata;
    sumEmployment += p.employmentRate;

    votingPreferenceCounts[p.votingPreference] = (votingPreferenceCounts[p.votingPreference] || 0) + 1;
    politicalSpectrumCounts[p.politicalSpectrum] = (politicalSpectrumCounts[p.politicalSpectrum] || 0) + 1;
    votingGovernorCounts[p.votingGovernor] = (votingGovernorCounts[p.votingGovernor] || 0) + 1;
    votingCouncilCounts[p.votingCouncil] = (votingCouncilCounts[p.votingCouncil] || 0) + 1;
    votingAssemblyCounts[p.votingAssembly] = (votingAssemblyCounts[p.votingAssembly] || 0) + 1;
    votingCongressCounts[p.votingCongress] = (votingCongressCounts[p.votingCongress] || 0) + 1;
  }

  const barrios = city === 'Bogota' ? BOGOTA_BARRIOS : MEDELLIN_BARRIOS;
  const realBarrio = findClosestBarrio(node.centroidLat, node.centroidLng, barrios);

  const dominantInterest = points[0]?.topInterest || SocialInterest.Sports;
  const dominantEducation = points[0]?.educationLevel || EducationLevel.Secondary;
  const dominantInternet = points[0]?.internetAccess || "HFC";
  const dominantOccupation = points[0]?.mainOccupation || "Empleado";
  
  // Calculate categorical modes for politics
  const dominantParty = (getModeFromRecord(votingPreferenceCounts) as PoliticalParty) || PoliticalParty.VotoEnBlanco;
  const dominantSpectrum = (getModeFromRecord(politicalSpectrumCounts) as PoliticalSpectrum) || PoliticalSpectrum.Centro;
  const dominantGovernor = (getModeFromRecord(votingGovernorCounts) as GovernorVote) || GovernorVote.VotoEnBlanco;
  const dominantCouncil = (getModeFromRecord(votingCouncilCounts) as PublicCorporationParty) || PublicCorporationParty.ASI;
  const dominantAssembly = (getModeFromRecord(votingAssemblyCounts) as PublicCorporationParty) || PublicCorporationParty.ASI;
  const dominantCongress = (getModeFromRecord(votingCongressCounts) as PublicCorporationParty) || PublicCorporationParty.ASI;

  // New: Calculate vote breakdown for ALL elections
  const mayorBreakdown = getVoteBreakdownFromRecord(votingPreferenceCounts, points.length);
  const governorBreakdown = getVoteBreakdownFromRecord(votingGovernorCounts, points.length);
  const councilBreakdown = getVoteBreakdownFromRecord(votingCouncilCounts, points.length);
  const assemblyBreakdown = getVoteBreakdownFromRecord(votingAssemblyCounts, points.length);
  const congressBreakdown = getVoteBreakdownFromRecord(votingCongressCounts, points.length);

  const address = city === 'Bogota'
      ? estimateAddressBogota(node.centroidLat, node.centroidLng)
      : estimateAddressMedellin(node.centroidLat, node.centroidLng);

  const postalCode = city === 'Bogota'
      ? estimatePostalCodeBogota(realBarrio.comuna)
      : estimatePostalCodeMedellin(realBarrio.comuna);

  return {
    id: `z-${index}`,
    locationName: realBarrio.comuna,
    specificSector: realBarrio.name,
    lat: node.centroidLat,
    lng: node.centroidLng,
    polygon: polygon,
    
    // PRECISION METADATA
    cardinalLimits: generatePolygonLimits(polygon),
    geoContext: `${realBarrio.comuna} - Zona ${realBarrio.landUse}`,
    address: address,
    postalCode: postalCode,
    landUseType: realBarrio.landUse,

    density: normalizedDensity,
    population: totalPopulation,
    avgAge: Math.round(sumAge / safeCount),
    strata: Math.round(sumStrata / safeCount), 
    householdIncome: Math.round(sumIncome / safeCount),
    employmentRate: sumEmployment / safeCount,
    
    topInterest: dominantInterest,
    educationLevel: dominantEducation,
    mainOccupation: dominantOccupation,
    internetAccess: dominantInternet,
    
    // Politics (Aggregated)
    votingPreference: dominantParty,
    mayorBreakdown,
    votingGovernor: dominantGovernor,
    governorBreakdown,
    votingCouncil: dominantCouncil,
    councilBreakdown,
    votingAssembly: dominantAssembly,
    assemblyBreakdown,
    votingCongress: dominantCongress,
    congressBreakdown,
    
    politicalSpectrum: dominantSpectrum
  };
};

// --- DATA GENERATION (Using Detailed Barrios) ---

const generateCityData = (city: City, totalPoints: number): ZoneData[] => {
  const data: ZoneData[] = [];
  const barrios = city === 'Bogota' ? BOGOTA_BARRIOS : MEDELLIN_BARRIOS;
  const pointsPerBarrio = Math.floor(totalPoints / barrios.length);

  barrios.forEach((barrio, bIndex) => {
    // Generate points around the specific barrio centroid
    for (let i = 0; i < pointsPerBarrio; i++) {
      
      const spread = 0.0030; 
      const latOffset = randomGaussian() * spread; 
      const lngOffset = randomGaussian() * spread;
      
      let strata = barrio.strata;
      if (Math.random() > 0.85) strata += Math.random() > 0.5 ? 1 : -1;
      strata = Math.max(1, Math.min(6, strata));

      // Profile bias
      let education = EducationLevel.Secondary;
      if (strata >= 5) education = Math.random() > 0.3 ? EducationLevel.University : EducationLevel.Postgrad;
      else if (strata >= 3) education = Math.random() > 0.4 ? EducationLevel.Technical : EducationLevel.University;
      else education = Math.random() > 0.6 ? EducationLevel.Secondary : EducationLevel.Primary;

      const age = randomRange(18, 85);
      
      const occupationList = ['Comerciante', 'Estudiante', 'Ingeniero', 'Artista', 'Obrero', 'Administrador', 'Pensionado', 'Independiente', 'Docente', 'Servicios', 'Transportador'];
      let occupation = occupationList[Math.floor(Math.random() * occupationList.length)];
      if (strata >= 5 && Math.random() > 0.5) occupation = 'Empresario/Gerente';
      if (strata <= 2 && Math.random() > 0.6) occupation = 'Obrero/Operario';

      const income = getEstimatedIncome(strata);
      
      let interest = randomEnum(SocialInterest);
      if (age < 30) interest = Math.random() > 0.5 ? SocialInterest.Tech : SocialInterest.Fashion;
      if (strata >= 5) interest = Math.random() > 0.5 ? SocialInterest.Travel : SocialInterest.Tech;

      const baseEmployment = 0.82 + (strata * 0.015) - (age > 60 ? 0.4 : 0) - (age < 22 ? 0.3 : 0);
      const employmentRate = Math.min(0.99, Math.max(0.35, baseEmployment + (Math.random() - 0.5) * 0.2));
      
      // Politics
      const politics = city === 'Bogota'
          ? getPoliticalProfileBogota(strata, age, barrio.comuna)
          : getPoliticalProfileMedellin(strata, age, barrio.comuna);

      const pointPopulation = 95 + Math.floor(Math.random() * 15); 

      data.push({
        id: `p-${bIndex}-${i}`,
        locationName: barrio.comuna,
        specificSector: barrio.name, 
        lat: barrio.lat + latOffset,
        lng: barrio.lng + lngOffset,
        polygon: [],
        cardinalLimits: '',
        geoContext: '',
        address: '', 
        postalCode: '',
        landUseType: barrio.landUse,
        density: 0,
        population: pointPopulation,
        avgAge: Math.floor(age),
        strata,
        educationLevel: education,
        mainOccupation: occupation,
        topInterest: interest,
        householdIncome: income,
        employmentRate: employmentRate,
        internetAccess: getInternetAccess(strata),
        
        // Mapped Politics
        votingPreference: politics.mayor,
        mayorBreakdown: [],
        votingGovernor: politics.governor,
        governorBreakdown: [],
        votingCouncil: politics.council,
        councilBreakdown: [],
        votingAssembly: politics.assembly,
        assemblyBreakdown: [],
        votingCongress: politics.congress,
        congressBreakdown: [],

        politicalSpectrum: politics.spectrum
      });
    }
  });

  return data;
}

export const generateMedellinData = (totalPoints: number = 26000): ZoneData[] => {
    return generateCityData('Medellin', totalPoints);
};

export const generateBogotaData = (totalPoints: number = 26000): ZoneData[] => {
    return generateCityData('Bogota', totalPoints);
};

export const generateData = (city: City, totalPoints: number = 26000): ZoneData[] => {
    return generateCityData(city, totalPoints);
}

// --- K-D TREE RECURSION (PRESERVED) ---

const buildKDTreeClusters = (
  points: ZoneData[], 
  depth: number, 
  axis: 'lat' | 'lng'
): {points: ZoneData[], centroidLat: number, centroidLng: number}[] => {
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

  const leftPoints = points.slice(0, splitIndex + 1);
  const rightPoints = points.slice(splitIndex + 1);
  const nextAxis = axis === 'lat' ? 'lng' : 'lat';

  return [
    ...buildKDTreeClusters(leftPoints, depth - 1, nextAxis),
    ...buildKDTreeClusters(rightPoints, depth - 1, nextAxis)
  ];
};

export const processKDTree = (rawPoints: ZoneData[], depth: number = 8, city: City = 'Medellin'): ZoneData[] => {
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
      return aggregateClusterData(z.cluster, z.polygon, z.i, normalizedDensity, city);
  });
};
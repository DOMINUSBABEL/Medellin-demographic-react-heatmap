# GeoMedellín: High-Resolution Demographic Tesselation

**Desarrollado por:** Isaac Mendoza & Juan Esteban Gómez Bernal  
**Afiliación:** Consultora Talleyrand  
**Fecha:** Enero 2026  

## Visión General

GeoMedellín es una plataforma de analítica urbana que resuelve el problema de la unidad de área modificable (MAUP) en la visualización demográfica tradicional. En lugar de utilizar límites administrativos estáticos (Comunas), este sistema genera una malla dinámica ponderada por población utilizando algoritmos de **Árboles K-D (K-Dimensional Trees)** y **Teselación de Voronoi Centroidal**.

El resultado es un mapa de calor de alta fidelidad donde cada celda (polígono) representa aproximadamente **2,500 habitantes (±300)**, permitiendo una granularidad sin precedentes para el análisis socioeconómico.

## Metodología Técnica

### 1. Generación de Población Sintética
El sistema simula 2.6 millones de agentes distribuidos geográficamente basándose en:
- **Puntos de Anclaje:** Más de 100 centroides de barrios reales (e.g., *Provenza, Moravia, Altavista*).
- **Dispersión Gaussiana:** Los agentes se dispersan estocásticamente desde los centroides respetando la topografía y el uso del suelo (Residencial, Industrial, Mixto).
- **Perfiles Sociodemográficos:** Cada agente tiene atributos de Estrato (1-6), Ingreso, Edad, Ocupación y Acceso a Internet basados en proyecciones del DANE y Encuestas de Calidad de Vida.

### 2. Particionamiento Espacial Recursivo (K-D Tree)
Para garantizar una densidad uniforme:
1. El espacio latitud-longitud se divide recursivamente.
2. Profundidad de recursión: **10 niveles** ($2^{10} = 1024$ nodos hoja).
3. Cada partición busca equilibrar la carga poblacional, resultando en áreas geográficas más pequeñas en zonas densas (e.g., Comuna 1) y áreas más grandes en zonas dispersas (e.g., Corregimientos).

### 3. Teselación de Voronoi
Los centroides de las hojas del Árbol K-D se utilizan como semillas para generar un diagrama de Voronoi. Esto convierte las divisiones rectangulares del árbol en polígonos orgánicos que se adaptan mejor a la morfología urbana de Medellín.

### 4. Enriquecimiento Semántico (Gemini AI)
Se integra la API de Google Gemini (modelo `gemini-3-flash-preview`) para generar análisis cualitativos en tiempo real. Al seleccionar un cuadrante, el sistema envía los metadatos numéricos y el contexto geográfico (barrio, límites cardinales) al LLM, el cual devuelve un perfil narrativo sobre las dinámicas del sector.

## Stack Tecnológico

- **Frontend:** React 18, TypeScript, Tailwind CSS.
- **Geospatial:** Leaflet, React-Leaflet, D3-Delaunay.
- **Data Viz:** Recharts.
- **AI/LLM:** Google GenAI SDK (`@google/genai`).

## Referencias y Fuentes (APA)

A continuación se listan las fuentes primarias utilizadas para la construcción de los modelos de datos, con sus respectivos enlaces de acceso público:

### Fuentes de Datos Demográficos y Electorales
*   **Alcaldía de Medellín.** (2023). *Encuesta de Calidad de Vida 2023: Indicadores por Comuna y Corregimiento*. Departamento Administrativo de Planeación.  
    [Acceder al Reporte](https://www.medellin.gov.co/es/departamento-administrativo-de-planeacion/encuesta-calidad-de-vida/)
*   **Departamento Administrativo Nacional de Estadística (DANE).** (2018). *Censo Nacional de Población y Vivienda 2018: Visualizador de Información Censal y Microdatos*. Bogotá: DANE.  
    [Acceder al Geovisor CNPV](https://sitios.dane.gov.co/cnpv/) | [Microdatos](https://microdatos.dane.gov.co/index.php/catalog/643)
*   **Medellín Cómo Vamos.** (2023). *Informe de Calidad de Vida de Medellín, 2020-2023*.  
    [Biblioteca de Publicaciones](https://www.medellincomovamos.org/calidad-de-vida)
*   **Registraduría Nacional del Estado Civil.** (2022). *Resultados Electorales Congreso de la República 2022*. (Senado y Cámara).  
    [Resultados Oficiales 2022](https://resultados.registraduria.gov.co/congreso/2022)
*   **Registraduría Nacional del Estado Civil.** (2023). *Elecciones de Autoridades Territoriales 2023: Consolidados Alcaldía, Gobernación, Concejo y Asamblea*.  
    [Resultados Oficiales 2023](https://resultados.registraduria.gov.co/autoridades/2023)

### Literatura Algorítmica y Técnica
*   **De Berg, M., Cheong, O., van Kreveld, M., & Overmars, M.** (2008). *Computational Geometry: Algorithms and Applications* (3rd ed.). Springer Berlin, Heidelberg.  
    [DOI: 10.1007/978-3-540-77974-2](https://doi.org/10.1007/978-3-540-77974-2)
*   **Google DeepMind.** (2024). *Gemini 1.5: Unlocking multimodal understanding across millions of tokens of context*. arXiv preprint.  
    [arXiv:2403.05530](https://arxiv.org/abs/2403.05530)
*   **Lloyd, S.** (1982). Least squares quantization in PCM. *IEEE Transactions on Information Theory*, 28(2), 129–137. (Algoritmo base para la optimización de Voronoi).  
    [IEEE Xplore](https://ieeexplore.ieee.org/document/1056489)

## Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Configurar API Key de Gemini
export API_KEY="tu_api_key_aqui"

# Ejecutar servidor de desarrollo
npm run dev
```

## Licencia y Créditos

Investigación técnica desarrollada por **Consultora Talleyrand**.
Este software es de acceso abierto para fines académicos y de investigación urbana.

&copy; 2026 Consultora Talleyrand.
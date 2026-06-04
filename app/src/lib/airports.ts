// Aeropuertos principales para elegir el origen del viaje. No es exhaustivo:
// cubre los hubs más usados por país para que casi cualquiera encuentre el suyo
// o uno cercano. lat/lng se usan para autodetección por geolocalización y para
// recalcular las horas de vuelo a cada destino.

export type Airport = {
  /** Código IATA */
  code: string;
  name: string;
  city: string;
  country: string;
  /** ISO 3166-1 alpha-2 */
  countryCode: string;
  lat: number;
  lng: number;
};

export const AIRPORTS: Airport[] = [
  // Argentina
  { code: "EZE", name: "Ministro Pistarini", city: "Buenos Aires", country: "Argentina", countryCode: "AR", lat: -34.82, lng: -58.54 },
  { code: "AEP", name: "Aeroparque Jorge Newbery", city: "Buenos Aires", country: "Argentina", countryCode: "AR", lat: -34.56, lng: -58.42 },
  { code: "COR", name: "Ingeniero Taravella", city: "Córdoba", country: "Argentina", countryCode: "AR", lat: -31.32, lng: -64.21 },
  { code: "MDZ", name: "El Plumerillo", city: "Mendoza", country: "Argentina", countryCode: "AR", lat: -32.83, lng: -68.79 },
  { code: "ROS", name: "Islas Malvinas", city: "Rosario", country: "Argentina", countryCode: "AR", lat: -32.90, lng: -60.79 },
  // Brasil
  { code: "GRU", name: "Guarulhos", city: "São Paulo", country: "Brasil", countryCode: "BR", lat: -23.43, lng: -46.47 },
  { code: "GIG", name: "Galeão", city: "Rio de Janeiro", country: "Brasil", countryCode: "BR", lat: -22.81, lng: -43.25 },
  { code: "BSB", name: "Brasília", city: "Brasília", country: "Brasil", countryCode: "BR", lat: -15.87, lng: -47.92 },
  { code: "REC", name: "Guararapes", city: "Recife", country: "Brasil", countryCode: "BR", lat: -8.13, lng: -34.92 },
  { code: "POA", name: "Salgado Filho", city: "Porto Alegre", country: "Brasil", countryCode: "BR", lat: -29.99, lng: -51.17 },
  // Chile / Uruguay / Paraguay / Bolivia
  { code: "SCL", name: "Arturo Merino Benítez", city: "Santiago", country: "Chile", countryCode: "CL", lat: -33.39, lng: -70.79 },
  { code: "MVD", name: "Carrasco", city: "Montevideo", country: "Uruguay", countryCode: "UY", lat: -34.84, lng: -56.03 },
  { code: "ASU", name: "Silvio Pettirossi", city: "Asunción", country: "Paraguay", countryCode: "PY", lat: -25.24, lng: -57.52 },
  { code: "VVI", name: "Viru Viru", city: "Santa Cruz", country: "Bolivia", countryCode: "BO", lat: -17.64, lng: -63.14 },
  // Perú / Colombia / Ecuador / Venezuela
  { code: "LIM", name: "Jorge Chávez", city: "Lima", country: "Perú", countryCode: "PE", lat: -12.02, lng: -77.11 },
  { code: "BOG", name: "El Dorado", city: "Bogotá", country: "Colombia", countryCode: "CO", lat: 4.70, lng: -74.15 },
  { code: "MDE", name: "José María Córdova", city: "Medellín", country: "Colombia", countryCode: "CO", lat: 6.16, lng: -75.42 },
  { code: "UIO", name: "Mariscal Sucre", city: "Quito", country: "Ecuador", countryCode: "EC", lat: -0.13, lng: -78.36 },
  { code: "CCS", name: "Maiquetía", city: "Caracas", country: "Venezuela", countryCode: "VE", lat: 10.60, lng: -66.99 },
  // México / Centroamérica
  { code: "MEX", name: "Benito Juárez", city: "Ciudad de México", country: "México", countryCode: "MX", lat: 19.44, lng: -99.07 },
  { code: "CUN", name: "Cancún", city: "Cancún", country: "México", countryCode: "MX", lat: 21.04, lng: -86.87 },
  { code: "GDL", name: "Miguel Hidalgo", city: "Guadalajara", country: "México", countryCode: "MX", lat: 20.52, lng: -103.31 },
  { code: "PTY", name: "Tocumen", city: "Ciudad de Panamá", country: "Panamá", countryCode: "PA", lat: 9.07, lng: -79.38 },
  { code: "SJO", name: "Juan Santamaría", city: "San José", country: "Costa Rica", countryCode: "CR", lat: 9.99, lng: -84.21 },
  // Estados Unidos / Canadá
  { code: "MIA", name: "Miami Intl", city: "Miami", country: "Estados Unidos", countryCode: "US", lat: 25.80, lng: -80.29 },
  { code: "JFK", name: "John F. Kennedy", city: "Nueva York", country: "Estados Unidos", countryCode: "US", lat: 40.64, lng: -73.78 },
  { code: "LAX", name: "Los Ángeles Intl", city: "Los Ángeles", country: "Estados Unidos", countryCode: "US", lat: 33.94, lng: -118.41 },
  { code: "ORD", name: "O'Hare", city: "Chicago", country: "Estados Unidos", countryCode: "US", lat: 41.98, lng: -87.90 },
  { code: "YYZ", name: "Pearson", city: "Toronto", country: "Canadá", countryCode: "CA", lat: 43.68, lng: -79.61 },
  // Europa
  { code: "MAD", name: "Barajas", city: "Madrid", country: "España", countryCode: "ES", lat: 40.47, lng: -3.56 },
  { code: "BCN", name: "El Prat", city: "Barcelona", country: "España", countryCode: "ES", lat: 41.30, lng: 2.08 },
  { code: "LIS", name: "Humberto Delgado", city: "Lisboa", country: "Portugal", countryCode: "PT", lat: 38.77, lng: -9.13 },
  { code: "CDG", name: "Charles de Gaulle", city: "París", country: "Francia", countryCode: "FR", lat: 49.01, lng: 2.55 },
  { code: "LHR", name: "Heathrow", city: "Londres", country: "Reino Unido", countryCode: "GB", lat: 51.47, lng: -0.45 },
  { code: "FCO", name: "Fiumicino", city: "Roma", country: "Italia", countryCode: "IT", lat: 41.80, lng: 12.25 },
  { code: "FRA", name: "Frankfurt", city: "Frankfurt", country: "Alemania", countryCode: "DE", lat: 50.04, lng: 8.56 },
  { code: "AMS", name: "Schiphol", city: "Ámsterdam", country: "Países Bajos", countryCode: "NL", lat: 52.31, lng: 4.76 },
  // África / Medio Oriente / Asia / Oceanía
  { code: "JNB", name: "O. R. Tambo", city: "Johannesburgo", country: "Sudáfrica", countryCode: "ZA", lat: -26.13, lng: 28.24 },
  { code: "DXB", name: "Dubái Intl", city: "Dubái", country: "Emiratos Árabes", countryCode: "AE", lat: 25.25, lng: 55.36 },
  { code: "IST", name: "İstanbul", city: "Estambul", country: "Turquía", countryCode: "TR", lat: 41.28, lng: 28.75 },
  { code: "NRT", name: "Narita", city: "Tokio", country: "Japón", countryCode: "JP", lat: 35.77, lng: 140.39 },
  { code: "SIN", name: "Changi", city: "Singapur", country: "Singapur", countryCode: "SG", lat: 1.36, lng: 103.99 },
  { code: "SYD", name: "Kingsford Smith", city: "Sídney", country: "Australia", countryCode: "AU", lat: -33.95, lng: 151.18 },
];

/** Agrupa aeropuertos por país, en el orden en que aparecen. */
export function airportsByCountry(): { country: string; countryCode: string; airports: Airport[] }[] {
  const groups: { country: string; countryCode: string; airports: Airport[] }[] = [];
  for (const a of AIRPORTS) {
    let g = groups.find((x) => x.country === a.country);
    if (!g) {
      g = { country: a.country, countryCode: a.countryCode, airports: [] };
      groups.push(g);
    }
    g.airports.push(a);
  }
  return groups;
}

export function findAirport(code: string): Airport | undefined {
  return AIRPORTS.find((a) => a.code === code);
}

/** Bandera emoji a partir del código ISO de país (ej: "AR" → 🇦🇷). */
export function flagEmoji(countryCode: string): string {
  if (countryCode.length !== 2) return "🏳️";
  const base = 0x1f1e6;
  const cc = countryCode.toUpperCase();
  return String.fromCodePoint(base + (cc.charCodeAt(0) - 65), base + (cc.charCodeAt(1) - 65));
}

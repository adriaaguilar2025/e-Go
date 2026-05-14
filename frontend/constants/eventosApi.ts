/**
 * API externa d’esdeveniments. Al `.env` del frontend (reinicia Metro):
 *
 *   EXPO_PUBLIC_EVENTOS_API_BASE_URL=http://13.38.238.95/api/external/eventos
 *   EXPO_PUBLIC_EVENTOS_API_TOKEN=...
 *
 * Capçalera: Authorization: Token <token>
 */
export function getEventosApiBaseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_EVENTOS_API_BASE_URL?.trim();
  return (raw || 'http://13.38.238.95/api/external/eventos').replace(/\/+$/, '');
}

export function getEventosApiToken(): string {
  return process.env.EXPO_PUBLIC_EVENTOS_API_TOKEN?.trim() || '';
}

export const EVENTOS_RADIO_KM_DEFAULT = 0.25;

export function buildEventosNearbyUrl(lat: number, lon: number, radioKm: number = EVENTOS_RADIO_KM_DEFAULT): string {
  const base = getEventosApiBaseUrl();
  return `${base}/?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}&radio_km=${encodeURIComponent(String(radioKm))}`;
}

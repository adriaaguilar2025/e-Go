/**
 * API externa d’esdeveniments. Al `.env` del frontend (reinicia Metro):
 *
 *   EXPO_PUBLIC_EVENTOS_API_BASE_URL=http://13.38.238.95/api/external/eventos
 *   EXPO_PUBLIC_EVENTOS_API_TOKEN=c0ba6f...   (només la clau; sense prefix "Token ")
 *
 * El client envia: Authorization: Token <valor>
 * Si poses "Token ..." al .env, es normalitza per evitar "Token Token ..." (401).
 */
export function getEventosApiBaseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_EVENTOS_API_BASE_URL?.trim();
  return (raw || 'http://13.38.238.95/api/external/eventos').replace(/\/+$/, '');
}

/** Retorna només el secret del token (sense prefix Authorization/Token). */
export function getEventosApiToken(): string {
  let t = process.env.EXPO_PUBLIC_EVENTOS_API_TOKEN?.trim() || '';
  // Usuaris que enganxen el valor com al curl: "Token abc123..."
  t = t.replace(/^Token\s+/i, '').trim();
  // Cometes literals per error al .env
  if ((t.startsWith("'") && t.endsWith("'")) || (t.startsWith('"') && t.endsWith('"'))) {
    t = t.slice(1, -1).trim();
    t = t.replace(/^Token\s+/i, '').trim();
  }
  return t;
}

export const EVENTOS_RADIO_KM_DEFAULT = 1;

export function buildEventosNearbyUrl(lat: number, lon: number, radioKm: number = EVENTOS_RADIO_KM_DEFAULT): string {
  const base = getEventosApiBaseUrl();
  return `${base}/?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}&radio_km=${encodeURIComponent(String(radioKm))}`;
}

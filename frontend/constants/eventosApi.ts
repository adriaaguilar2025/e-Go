/** Normalitza el token (ENV o string) sense prefix `Token ` ni cometes duplicades. */
export function normalizeEventosApiTokenString(raw: string | undefined): string {
  let t = raw?.trim() ?? '';
  t = t.replace(/^Token\s+/i, '').trim();
  if ((t.startsWith("'") && t.endsWith("'")) || (t.startsWith('"') && t.endsWith('"'))) {
    t = t.slice(1, -1).trim();
    t = t.replace(/^Token\s+/i, '').trim();
  }
  return t;
}

/** Retorna només el secret del token (sense prefix Authorization/Token). */
export function getEventosApiToken(): string {
  return normalizeEventosApiTokenString(process.env.EXPO_PUBLIC_EVENTOS_API_TOKEN);
}

/** Base URL amb trailing slash retallat; fallback si ve buit. */
export function normalizeEventosApiBaseUrl(raw: string | undefined): string {
  const fallback = 'http://13.38.238.95/api/external/eventos';
  return (raw?.trim() || fallback).replace(/\/+$/, '');
}

export function getEventosApiBaseUrl(): string {
  return normalizeEventosApiBaseUrl(process.env.EXPO_PUBLIC_EVENTOS_API_BASE_URL);
}

export const EVENTOS_RADIO_KM_DEFAULT = 1;

/** Texto corto para mensajes de UI (p. ej. "1 km", "0,25 km" con coma en español). */
export function formatRadioKmForUi(km: number): string {
  const n = Math.round(km * 100) / 100;
  const s = n % 1 === 0 ? String(n) : n.toFixed(2).replace(/\.?0+$/, '');
  return `${s.replace('.', ',')} km`;
}

export function buildEventosNearbyUrl(lat: number, lon: number, radioKm: number = EVENTOS_RADIO_KM_DEFAULT): string {
  const base = getEventosApiBaseUrl();
  return `${base}/?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}&radio_km=${encodeURIComponent(String(radioKm))}`;
}

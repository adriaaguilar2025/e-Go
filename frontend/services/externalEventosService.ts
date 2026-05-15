import { buildEventosNearbyUrl, getEventosApiBaseUrl, getEventosApiToken, EVENTOS_RADIO_KM_DEFAULT } from '@/constants/eventosApi';

export interface EventoExterno {
  id: number;
  titulo: string;
  imagen_url: string | null;
  distancia_km: number;
  /** API pot enviar lat/lon, o latitud/longitud, etc. */
  lat?: string | number | null;
  lon?: string | number | null;
  latitud?: string | number | null;
  longitud?: string | number | null;
}

function parseCoord(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Punt a distància i rumb des d’una coordenada (WGS84). */
function destinationPointKm(
  latDeg: number,
  lonDeg: number,
  distanceKm: number,
  bearingDeg: number
): { latitude: number; longitude: number } {
  const R = 6371;
  const δ = distanceKm / R;
  const θ = (bearingDeg * Math.PI) / 180;
  const φ1 = (latDeg * Math.PI) / 180;
  const λ1 = (lonDeg * Math.PI) / 180;
  const sinφ1 = Math.sin(φ1);
  const cosφ1 = Math.cos(φ1);
  const sinδ = Math.sin(δ);
  const cosδ = Math.cos(δ);
  const sinφ2 = sinφ1 * cosδ + cosφ1 * sinδ * Math.cos(θ);
  const φ2 = Math.asin(sinφ2);
  const y = Math.sin(θ) * sinδ * cosφ1;
  const x = cosδ - sinφ1 * sinφ2;
  const λ2 = λ1 + Math.atan2(y, x);
  const lat2 = (φ2 * 180) / Math.PI;
  const lon2 = (((λ2 * 180) / Math.PI + 540) % 360) - 180;
  return { latitude: lat2, longitude: lon2 };
}

/**
 * Coordenades per marcar l’event al mapa: API si n’hi ha, sinó aproximació amb distància_km des de l’estació.
 */
export function getEventoMapCoordinates(
  item: EventoExterno,
  stationLat: number,
  stationLon: number
): { latitude: number; longitude: number } | null {
  const extra = item as EventoExterno & {
    latitude?: number | string | null;
    longitude?: number | string | null;
    lng?: number | string | null;
  };
  const lat =
    parseCoord(item.lat) ??
    parseCoord(item.latitud) ??
    parseCoord(extra.latitude);
  const lon =
    parseCoord(item.lon) ??
    parseCoord(item.longitud) ??
    parseCoord(extra.longitude) ??
    parseCoord(extra.lng);
  if (lat !== null && lon !== null) return { latitude: lat, longitude: lon };

  const d = item.distancia_km;
  if (typeof d === 'number' && d > 0 && Number.isFinite(stationLat) && Number.isFinite(stationLon)) {
    const bearingDeg = (item.id * 137) % 360;
    return destinationPointKm(stationLat, stationLon, d, bearingDeg);
  }
  return null;
}

export interface EventosPaginated {
  count: number;
  next: string | null;
  previous: string | null;
  results: EventoExterno[];
}

function authHeaders(): HeadersInit {
  const token = getEventosApiToken();
  if (!token) {
    throw new Error('MISSING_EVENTOS_TOKEN');
  }
  return {
    Accept: 'application/json',
    Authorization: `Token ${token}`,
  };
}

export async function fetchEventosCercaDeEstacion(
  lat: number,
  lon: number,
  radioKm: number = EVENTOS_RADIO_KM_DEFAULT
): Promise<EventosPaginated> {
  const url = buildEventosNearbyUrl(lat, lon, radioKm);
  if (__DEV__) {
    const token = getEventosApiToken();
    console.log('[Eventos] base URL:', getEventosApiBaseUrl());
    console.log('[Eventos] full request URL:', url);
    console.log('[Eventos] token configured:', token.length > 0, token.length ? `(length ${token.length})` : '');
  }
  const res = await fetch(url, { headers: authHeaders() });
  if (__DEV__) {
    console.log('[Eventos] response status:', res.status, res.ok ? 'OK' : 'FAIL');
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    if (__DEV__) {
      console.log('[Eventos] error body (truncated):', body.slice(0, 300));
    }
    throw new Error(`Eventos ${res.status}: ${body.slice(0, 160)}`);
  }
  const json = (await res.json()) as EventosPaginated;
  if (__DEV__) {
    console.log('[Eventos] results count:', json?.count ?? json?.results?.length ?? 0);
  }
  return json;
}

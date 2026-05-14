import { buildEventosNearbyUrl, getEventosApiToken } from '@/constants/eventosApi';

export interface EventoExterno {
  id: number;
  titulo: string;
  imagen_url: string | null;
  distancia_km: number;
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
  radioKm: number = 0.25
): Promise<EventosPaginated> {
  const url = buildEventosNearbyUrl(lat, lon, radioKm);
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Eventos ${res.status}: ${body.slice(0, 160)}`);
  }
  return res.json() as Promise<EventosPaginated>;
}

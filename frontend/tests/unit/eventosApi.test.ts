import { afterEach, beforeEach, describe, expect, test } from '@jest/globals';

import {
  buildEventosNearbyUrl,
  EVENTOS_RADIO_KM_DEFAULT,
  formatRadioKmForUi,
  getEventosApiBaseUrl,
  getEventosApiToken,
  normalizeEventosApiBaseUrl,
} from '@/constants/eventosApi';


describe('getEventosApiToken', () => {
  const envKey = 'EXPO_PUBLIC_EVENTOS_API_TOKEN';
  let previous: string | undefined;

  beforeEach(() => {
    previous = process.env[envKey];
  });

  afterEach(() => {
    if (previous === undefined) {
      delete process.env[envKey];
    } else {
      process.env[envKey] = previous;
    }
  });

  // Lee la variable de entorno de Expo y aplica la misma normalización que el formulario manual.
  test('normaliza el valor de process.env', () => {
    process.env[envKey] = 'Token from-env';
    expect(getEventosApiToken()).toBe('from-env');
  });

  test('devuelve vacío si la variable no está definida', () => {
    delete process.env[envKey];
    expect(getEventosApiToken()).toBe('');
  });
});

describe('formatRadioKmForUi', () => {
  // Texto del mensaje vacío del carrusel ("1 km", "5 km").
  test('enteros en español (coma decimal no aplica)', () => {
    expect(formatRadioKmForUi(1)).toBe('1 km');
    expect(formatRadioKmForUi(5)).toBe('5 km');
  });
});

describe('getEventosApiBaseUrl', () => {
  const envKey = 'EXPO_PUBLIC_EVENTOS_API_BASE_URL';
  let previous: string | undefined;

  beforeEach(() => {
    previous = process.env[envKey];
  });

  afterEach(() => {
    if (previous === undefined) {
      delete process.env[envKey];
    } else {
      process.env[envKey] = previous;
    }
  });

  test('usa normalizeEventosApiBaseUrl sobre la variable de entorno', () => {
    process.env[envKey] = 'https://custom.example/eventos/';
    expect(getEventosApiBaseUrl()).toBe('https://custom.example/eventos');
  });
});

describe('buildEventosNearbyUrl', () => {
  const baseEnvKey = 'EXPO_PUBLIC_EVENTOS_API_BASE_URL';
  let previousBase: string | undefined;

  beforeEach(() => {
    previousBase = process.env[baseEnvKey];
    delete process.env[baseEnvKey];
  });

  afterEach(() => {
    if (previousBase === undefined) {
      delete process.env[baseEnvKey];
    } else {
      process.env[baseEnvKey] = previousBase;
    }
  });

  // Contrato de la API: lat, lon y radio_km en query string.
  test('incluye lat, lon y radio_km por defecto (1 km)', () => {
    const base = normalizeEventosApiBaseUrl(undefined);
    const url = buildEventosNearbyUrl(41.387, 2.168);
    expect(url).toBe(
      `${base}/?lat=41.387&lon=2.168&radio_km=${encodeURIComponent(String(EVENTOS_RADIO_KM_DEFAULT))}`
    );
  });

  // El servicio puede pasar otro radio aunque la UI use el valor por defecto.
  test('permite radio_km explícito en la query', () => {
    const base = normalizeEventosApiBaseUrl(undefined);
    const url = buildEventosNearbyUrl(10, 20, 0.5);
    expect(url).toBe(`${base}/?lat=10&lon=20&radio_km=${encodeURIComponent('0.5')}`);
  });

  // Coordenadas negativas o con muchos decimales deben ir codificadas.
  test('codifica correctamente lat y lon en la URL', () => {
    const url = buildEventosNearbyUrl(-33.45, -70.66);
    expect(url).toContain('lat=-33.45');
    expect(url).toContain('lon=-70.66');
  });

  test('usa la base URL de entorno cuando está configurada', () => {
    process.env[baseEnvKey] = 'https://api.test/eventos';
    const url = buildEventosNearbyUrl(1, 2);
    expect(url.startsWith('https://api.test/eventos/?')).toBe(true);
  });
});

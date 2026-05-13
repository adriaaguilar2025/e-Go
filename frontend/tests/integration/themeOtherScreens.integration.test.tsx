import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView, StyleSheet, View } from 'react-native';

import VehiclesScreen from '@/app/(tabs)/car';
import PaymentsScreen from '@/app/(tabs)/payments';
import RankingScreen from '@/app/(tabs)/ranking';
import { ColorblindPreferenceProvider } from '@/contexts/ColorblindPreferenceContext';
import { ThemePreferenceProvider } from '@/contexts/ThemePreferenceContext';
import { useAuth } from '@/contexts/AuthContext';

const THEME_STORAGE_KEY = 'theme-preference-v1';
const BG_LIGHT = '#f8fafc';
const BG_DARK = '#0f172a';

function fetchInputToUrlString(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

/** Mock de fetch compartido: garaje, ranking y suscripción usan URLs distintas. */
function setupSharedFetch() {
  globalThis.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = fetchInputToUrlString(input);
    if (url.includes('/car?') && init?.method === undefined) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (url.includes('/ranking')) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (url.includes('/subscription/status')) {
      return new Response(
        JSON.stringify({
          status: 'inactive',
          isPremium: false,
          current_period_end: null,
          cancel_at_period_end: false,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(JSON.stringify({}), { status: 404 });
  });
}

jest.mock('expo-router', () => ({
  useRouter: () => ({
    navigate: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  }),
  Stack: { Screen: () => null },
  useLocalSearchParams: () => ({}),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
}));

jest.mock('@expo/vector-icons/MaterialIcons', () => {
  const { createElement } = require('react');
  const { Text } = require('react-native');
  function MockMaterialIcons({ name }: { name: string }) {
    return createElement(Text, null, name);
  }
  MockMaterialIcons.displayName = 'MockMaterialIcons';
  return MockMaterialIcons;
});

function renderWithThemeProviders(ui: React.ReactElement) {
  return render(
    <ThemePreferenceProvider>
      <ColorblindPreferenceProvider>{ui}</ColorblindPreferenceProvider>
    </ThemePreferenceProvider>
  );
}

describe('Tema claro/oscuro en otras pantallas (integración)', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    setupSharedFetch();
    (useAuth as unknown as jest.Mock).mockReturnValue({
      user: { id: 1, email: 'u@test.com', username: 'u', created_at: '', updated_at: '' },
      logout: jest.fn(),
      isLoading: false,
      setUser: jest.fn(),
    });
  });

  // La pantalla Garaje expone `testID="garage-screen-root"` en el contenedor raíz para comprobar el tema sin usar SafeAreaView deprecado en el test.
  test('Garaje (car): con tema claro el contenedor raíz usa fondo claro', async () => {
    const screen = renderWithThemeProviders(<VehiclesScreen />);

    await waitFor(() => {
      expect(screen.getByText('Garaje')).toBeTruthy();
    });

    expect(screen.getByTestId('garage-screen-root')).toHaveStyle({ backgroundColor: BG_LIGHT });
  });

  // Con preferencia oscura persistida, el contenedor raíz usa fondo oscuro del tema.
  test('Garaje (car): con tema oscuro persistido el contenedor raíz usa fondo oscuro', async () => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, 'dark');

    const screen = renderWithThemeProviders(<VehiclesScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('garage-screen-root')).toHaveStyle({ backgroundColor: BG_DARK });
    });
  });

  // Pagos aplica el fondo al contentContainer del ScrollView principal (en modo claro)
  test('Pagos (payments): tema claro → ScrollView con fondo claro', async () => {
    const screen = renderWithThemeProviders(<PaymentsScreen />);

    await waitFor(() => {
      expect(screen.getByText('Escoger plan')).toBeTruthy();
    });

    const scroll = screen.UNSAFE_getByType(ScrollView);
    const flat = StyleSheet.flatten(scroll.props.contentContainerStyle);
    expect(flat.backgroundColor).toBe(BG_LIGHT);
  });

  test('Pagos (payments): tema oscuro persistido → ScrollView con fondo oscuro', async () => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, 'dark');

    const screen = renderWithThemeProviders(<PaymentsScreen />);

    await waitFor(() => {
      const scroll = screen.UNSAFE_getByType(ScrollView);
      expect(StyleSheet.flatten(scroll.props.contentContainerStyle).backgroundColor).toBe(BG_DARK);
    });
  });

  // Ranking empieza en carga; el contenedor ya refleja el tema antes de listar usuarios (en modo claro)
  test('Ranking: tema claro → contenedor de carga con fondo claro', async () => {
    const pendingFetch: typeof fetch = () => new Promise<Response>(() => {});
    globalThis.fetch = jest.fn(pendingFetch);

    const screen = renderWithThemeProviders(<RankingScreen />);

    await waitFor(() => {
      expect(screen.getByText('Cargando líderes...')).toBeTruthy();
    });

    const root = screen.UNSAFE_getByType(View);
    const bg = StyleSheet.flatten(root.props.style).backgroundColor;
    expect(bg).toBe(BG_LIGHT);
  });

  // Ranking cargado: el `SafeAreaView` raíz tiene `testID="ranking-screen-root"` para asertar el fondo sin importar el tipo deprecado.
  test('Ranking: tras cargar con tema oscuro el contenedor raíz usa fondo oscuro', async () => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, 'dark');
    setupSharedFetch();

    const screen = renderWithThemeProviders(<RankingScreen />);

    await waitFor(() => {
      expect(screen.getByText('Ranking e-Go')).toBeTruthy();
    });

    expect(screen.getByTestId('ranking-screen-root')).toHaveStyle({ backgroundColor: BG_DARK });
  });
});

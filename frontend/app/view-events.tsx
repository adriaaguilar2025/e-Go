import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { MapView, Marker } from './_components/MapWrapper';

const DEFAULT_REGION = {
  latitude: 41.3879,
  longitude: 2.16992,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const DEFAULT_RADIUS_KM = 10;
const MIN_RADIUS_KM = 1;
const MAX_RADIUS_KM = 100;
const RADIUS_STEP_KM = 1;
// TODO: Replace with the real backend URL when endpoint is available.
const NEARBY_EVENTS_ENDPOINT = 'https://YOUR_NEARBY_EVENTS_ENDPOINT';

type EventPoint = {
  lat: number;
  lng: number;
};

export default function ViewEventsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mapRef = useRef<any>(null);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [eventPoints, setEventPoints] = useState<EventPoint[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState('');

  const originLatRaw = params.originLat as string | undefined;
  const originLngRaw = params.originLng as string | undefined;
  const radiusParam = params.radiusKm as string | undefined;

  const originLat = originLatRaw ? Number.parseFloat(originLatRaw) : Number.NaN;
  const originLng = originLngRaw ? Number.parseFloat(originLngRaw) : Number.NaN;
  const hasOrigin = Number.isFinite(originLat) && Number.isFinite(originLng);

  useEffect(() => {
    const parsedRadius = radiusParam ? Number.parseInt(radiusParam, 10) : DEFAULT_RADIUS_KM;
    if (!Number.isNaN(parsedRadius)) {
      setRadiusKm(Math.min(MAX_RADIUS_KM, Math.max(MIN_RADIUS_KM, parsedRadius)));
    }
  }, [radiusParam]);

  useEffect(() => {
    if (!hasOrigin || !mapRef.current || typeof mapRef.current.animateToRegion !== 'function') return;
    mapRef.current.animateToRegion({
      latitude: originLat,
      longitude: originLng,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    }, 500);
  }, [hasOrigin, originLat, originLng]);

  useEffect(() => {
    if (!hasOrigin) {
      setEventPoints([]);
      setEventsError('');
      return;
    }

    const controller = new AbortController();

    const fetchNearbyEvents = async () => {
      setLoadingEvents(true);
      setEventsError('');
      try {
        const response = await fetch(
          `${NEARBY_EVENTS_ENDPOINT}?lat=${originLat}&lng=${originLng}&km=${radiusKm}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          setEventPoints([]);
          return;
        }

        const normalizedPoints = data
          .map((point: any) => {
            const lat = Number.parseFloat(String(point.lat ?? point.latitude));
            const lng = Number.parseFloat(String(point.lng ?? point.lon ?? point.longitude));
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
            return { lat, lng };
          })
          .filter(Boolean) as EventPoint[];

        setEventPoints(normalizedPoints);
      } catch (error: any) {
        if (error?.name === 'AbortError') return;
        console.error('Error fetching nearby events:', error);
        setEventPoints([]);
        setEventsError('No se pudieron cargar los eventos cercanos.');
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchNearbyEvents();
    return () => controller.abort();
  }, [hasOrigin, originLat, originLng, radiusKm]);

  const eventSuffix = eventPoints.length === 1 ? '' : 's';

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
          <MaterialIcons name="arrow-back" size={22} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Ver eventos</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={hasOrigin ? {
            latitude: originLat,
            longitude: originLng,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          } : DEFAULT_REGION}
          showsUserLocation={true}
        >
          {hasOrigin && (
            <Marker
              coordinate={{ latitude: originLat, longitude: originLng }}
              pinColor="blue"
            />
          )}

          {eventPoints.map((point, idx) => (
            <Marker
              key={`event-${idx}-${point.lat}-${point.lng}`}
              coordinate={{ latitude: point.lat, longitude: point.lng }}
              pinColor="orange"
            />
          ))}
        </MapView>

        {hasOrigin && (
          <View style={styles.radiusPanel}>
            <View style={styles.radiusHeader}>
              <Text style={styles.radiusTitle}>Radio de eventos</Text>
              <Text style={styles.radiusValue}>{radiusKm} km</Text>
            </View>
            <Slider
              minimumValue={MIN_RADIUS_KM}
              maximumValue={MAX_RADIUS_KM}
              step={RADIUS_STEP_KM}
              value={radiusKm}
              onValueChange={setRadiusKm}
              minimumTrackTintColor="#10b981"
              maximumTrackTintColor="#d1d5db"
              thumbTintColor="#10b981"
            />
            <View style={styles.radiusLegend}>
              <Text style={styles.radiusLegendText}>{MIN_RADIUS_KM} km</Text>
              <Text style={styles.radiusLegendText}>{MAX_RADIUS_KM} km</Text>
            </View>
            {loadingEvents ? (
              <View style={styles.eventsStatusRow}>
                <ActivityIndicator size="small" color="#10b981" />
                <Text style={styles.eventsStatusText}>Buscando eventos cercanos...</Text>
              </View>
            ) : eventsError ? (
              <Text style={[styles.eventsStatusText, styles.eventsErrorText]}>{eventsError}</Text>
            ) : (
              <Text style={styles.eventsStatusText}>
                {eventPoints.length} evento{eventSuffix} encontrado{eventSuffix}
              </Text>
            )}
          </View>
        )}

        {!hasOrigin && (
          <View style={styles.emptyStatePanel}>
            <Text style={styles.emptyStateText}>
              Selecciona una estación en el mapa principal y pulsa "Buscar eventos cercanos".
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerSpacer: {
    width: 36,
    height: 36,
  },
  mapContainer: {
    flex: 1,
  },
  radiusPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    elevation: 4,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.12)',
  },
  radiusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  radiusTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  radiusValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10b981',
  },
  radiusLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radiusLegendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  eventsStatusRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventsStatusText: {
    marginTop: 8,
    fontSize: 13,
    color: '#374151',
  },
  eventsErrorText: {
    color: '#b91c1c',
  },
  emptyStatePanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    elevation: 4,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.12)',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#374151',
  },
});

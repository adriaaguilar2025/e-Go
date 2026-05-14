import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Colors } from '@/constants/theme';
import { getEventosApiToken } from '@/constants/eventosApi';
import { fetchEventosCercaDeEstacion, type EventoExterno } from '@/services/externalEventosService';

const ARROW_SLOT = 40;

interface StationNearbyEventsCarouselProps {
  stationLat: number;
  stationLon: number;
  isDark: boolean;
}

export function StationNearbyEventsCarousel({
  stationLat,
  stationLon,
  isDark,
}: StationNearbyEventsCarouselProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [slideWidth, setSlideWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [events, setEvents] = useState<EventoExterno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const styles = useMemo(() => createStyles(isDark), [isDark]);

  const load = useCallback(async () => {
    if (!Number.isFinite(stationLat) || !Number.isFinite(stationLon)) {
      setEvents([]);
      setLoading(false);
      setError(null);
      return;
    }
    if (!getEventosApiToken()) {
      setError('token');
      setEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEventosCercaDeEstacion(stationLat, stationLon, 0.25);
      setEvents(Array.isArray(data.results) ? data.results : []);
    } catch (e) {
      setEvents([]);
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, [stationLat, stationLon]);

  useEffect(() => {
    setActiveIndex(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
    void load();
  }, [load]);

  useEffect(() => {
    if (slideWidth > 0) {
      scrollRef.current?.scrollTo({ x: 0, animated: false });
      setActiveIndex(0);
    }
  }, [slideWidth]);

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (slideWidth <= 0) return;
      const x = e.nativeEvent.contentOffset.x;
      const idx = Math.round(x / slideWidth);
      setActiveIndex(Math.min(Math.max(0, idx), Math.max(0, events.length - 1)));
    },
    [slideWidth, events.length]
  );

  const goPrev = () => {
    if (activeIndex <= 0 || slideWidth <= 0) return;
    const next = activeIndex - 1;
    scrollRef.current?.scrollTo({ x: next * slideWidth, animated: true });
    setActiveIndex(next);
  };

  const goNext = () => {
    if (activeIndex >= events.length - 1 || slideWidth <= 0) return;
    const next = activeIndex + 1;
    scrollRef.current?.scrollTo({ x: next * slideWidth, animated: true });
    setActiveIndex(next);
  };

  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Eventos cercanos</Text>
        <View style={styles.loadingBox}>
          <ActivityIndicator color={isDark ? '#34d399' : '#10b981'} />
        </View>
      </View>
    );
  }

  if (error === 'token') {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Eventos cercanos</Text>
        <Text style={styles.hint}>
          Configura EXPO_PUBLIC_EVENTOS_API_TOKEN en el .env del frontend y reinicia Metro.
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Eventos cercanos</Text>
        <Text style={styles.errorSmall}>{error}</Text>
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Eventos cercanos</Text>
        <Text style={styles.hint}>No hay eventos en un radio de 250 m.</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Eventos cercanos</Text>
      <View style={styles.panel}>
        <View style={styles.carouselRow}>
          <TouchableOpacity
            style={[styles.arrowBtn, activeIndex === 0 && styles.arrowBtnDisabled]}
            onPress={goPrev}
            disabled={activeIndex === 0}
            accessibilityLabel="Evento anterior"
          >
            <MaterialIcons
              name="chevron-left"
              size={28}
              color={activeIndex === 0 ? (isDark ? '#475569' : '#cbd5e1') : isDark ? '#e2e8f0' : '#334155'}
            />
          </TouchableOpacity>

          <View
            style={styles.slideColumn}
            onLayout={(e) => setSlideWidth(Math.floor(e.nativeEvent.layout.width))}
          >
            {slideWidth > 0 ? (
              <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled
                decelerationRate="fast"
                onMomentumScrollEnd={onScrollEnd}
                scrollEventThrottle={16}
                style={{ width: slideWidth }}
              >
                {events.map((item) => (
                  <View key={item.id} style={[styles.slide, { width: slideWidth }]}>
                    {item.imagen_url ? (
                      <Image
                        source={{ uri: item.imagen_url }}
                        style={styles.slideImage}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={[styles.slideImage, styles.slideImagePlaceholder]}>
                        <MaterialIcons name="event" size={48} color={isDark ? '#64748b' : '#94a3b8'} />
                      </View>
                    )}
                    <Text style={styles.eventTitle} numberOfLines={3}>
                      {item.titulo}
                    </Text>
                    <Text style={styles.eventDistance}>
                      {typeof item.distancia_km === 'number'
                        ? `${item.distancia_km.toFixed(2)} km`
                        : '—'}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.slideMeasurePlaceholder} />
            )}
          </View>

          <TouchableOpacity
            style={[styles.arrowBtn, activeIndex >= events.length - 1 && styles.arrowBtnDisabled]}
            onPress={goNext}
            disabled={activeIndex >= events.length - 1}
            accessibilityLabel="Siguiente evento"
          >
            <MaterialIcons
              name="chevron-right"
              size={28}
              color={
                activeIndex >= events.length - 1
                  ? isDark
                    ? '#475569'
                    : '#cbd5e1'
                  : isDark
                    ? '#e2e8f0'
                    : '#334155'
              }
            />
          </TouchableOpacity>
        </View>
        {events.length > 1 ? (
          <Text style={styles.pageHint}>
            {activeIndex + 1} / {events.length}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    section: { marginBottom: 8 },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: 10,
    },
    panel: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#e2e8f0',
      backgroundColor: isDark ? '#0f172a' : '#fff',
      paddingVertical: 10,
      paddingHorizontal: 4,
    },
    carouselRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    slideColumn: {
      flex: 1,
      minWidth: 0,
    },
    arrowBtn: {
      width: ARROW_SLOT,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 8,
    },
    arrowBtnDisabled: { opacity: 0.45 },
    slide: {
      paddingHorizontal: 6,
      alignItems: 'stretch',
    },
    slideImage: {
      width: '100%',
      height: 120,
      borderRadius: 10,
      backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
    },
    slideImagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
    eventTitle: {
      marginTop: 10,
      fontSize: 15,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : '#0f172a',
      lineHeight: 20,
    },
    eventDistance: {
      marginTop: 6,
      fontSize: 13,
      color: isDark ? '#94a3b8' : '#64748b',
      fontWeight: '600',
    },
    pageHint: {
      textAlign: 'center',
      marginTop: 8,
      fontSize: 12,
      color: isDark ? '#64748b' : '#94a3b8',
    },
    loadingBox: { paddingVertical: 24, alignItems: 'center' },
    slideMeasurePlaceholder: { height: 200 },
    hint: {
      fontSize: 13,
      color: isDark ? '#94a3b8' : '#64748b',
      lineHeight: 18,
    },
    errorSmall: {
      fontSize: 13,
      color: isDark ? '#f87171' : '#dc2626',
    },
  });

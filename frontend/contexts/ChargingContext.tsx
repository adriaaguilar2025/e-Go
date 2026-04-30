import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { getApiUrl } from '@/constants/api';
import { calculateDistanceInMeters, startLocationTracking, stopLocationTracking } from '@/services/chargingLocationService';

interface ChargingSession {
  id?: number;
  sessionStartTime: number; // timestamp en ms
  stationId: number;
  stationLat: number;
  stationLon: number;
  userLat: number;
  userLon: number;
  distanceToStation: number; // en metros
  elapsedSeconds: number;
}

interface ChargingContextType {
  isCharging: boolean;
  session: ChargingSession | null;
  distanceToStation: number;
  elapsedSeconds: number;
  startChargingSession: (stationId: number, stationLat: number, stationLon: number, userLat: number, userLon: number) => Promise<boolean>;
  stopChargingSession: (reason: 'manual' | 'distance_exceeded' | 'signal_loss') => Promise<void>;
  cancelChargingSession: () => void;
}

const ChargingContext = createContext<ChargingContextType | null>(null);

export function ChargingProvider({ children }: { children: React.ReactNode }) {
  const [isCharging, setIsCharging] = useState(false);
  const [session, setSession] = useState<ChargingSession | null>(null);
  const [distanceToStation, setDistanceToStation] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const locationUnsubscribeRef = useRef<(() => void) | null>(null);
  const signalLossTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastLocationUpdateRef = useRef<number>(Date.now());

  // Timer que actualiza cada segundo
  useEffect(() => {
    if (!isCharging || !session) return;

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        setSession((prevSession) => {
          if (prevSession) {
            return {
              ...prevSession,
              elapsedSeconds: prev + 1,
            };
          }
          return null;
        });
        return prev + 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCharging, session]);

  // Monitoreo de señal GPS
  useEffect(() => {
    if (!isCharging) return;

    // Si no hay actualización de ubicación en 30 segundos, considerar pérdida de señal
    signalLossTimerRef.current = setInterval(() => {
      const timeSinceLastUpdate = Date.now() - lastLocationUpdateRef.current;
      if (timeSinceLastUpdate > 30000) {
        console.warn('Pérdida de señal GPS detectada');
        // Detener automáticamente la sesión
        stopChargingSession('signal_loss');
      }
    }, 5000);

    return () => {
      if (signalLossTimerRef.current) clearInterval(signalLossTimerRef.current);
    };
  }, [isCharging]);

  const startChargingSession = useCallback(
    async (stationId: number, stationLat: number, stationLon: number, userLat: number, userLon: number): Promise<boolean> => {
      try {
        // Calcular distancia inicial
        const initialDistance = calculateDistanceInMeters(userLat, userLon, stationLat, stationLon);

        if (initialDistance > 30) {
          return false; // Demasiado lejos
        }

        // Crear sesión
        const newSession: ChargingSession = {
          sessionStartTime: Date.now(),
          stationId,
          stationLat,
          stationLon,
          userLat,
          userLon,
          distanceToStation: initialDistance,
          elapsedSeconds: 0,
        };

        setSession(newSession);
        setIsCharging(true);
        setElapsedSeconds(0);
        setDistanceToStation(initialDistance);
        lastLocationUpdateRef.current = Date.now();

        // Iniciar monitoreo de ubicación
        const unsubscribe = await startLocationTracking((location) => {
          lastLocationUpdateRef.current = Date.now();

          // Calcular nueva distancia
          const newDistance = calculateDistanceInMeters(
            location.coords.latitude,
            location.coords.longitude,
            stationLat,
            stationLon
          );

          setDistanceToStation(newDistance);
          setSession((prevSession) => {
            if (prevSession) {
              return {
                ...prevSession,
                userLat: location.coords.latitude,
                userLon: location.coords.longitude,
                distanceToStation: newDistance,
              };
            }
            return null;
          });

          // Si se aleja más de 30 metros, detener automáticamente
          if (newDistance > 30) {
            stopChargingSession('distance_exceeded');
          }
        });

        if (unsubscribe) {
          locationUnsubscribeRef.current = unsubscribe;
        }

        return true;
      } catch (error) {
        console.error('Error iniciando sesión de carga:', error);
        return false;
      }
    },
    []
  );

  const stopChargingSession = useCallback(
    async (reason: 'manual' | 'distance_exceeded' | 'signal_loss') => {
      if (!session) return;

      try {
        // Detener timer
        if (timerRef.current) clearInterval(timerRef.current);
        if (signalLossTimerRef.current) clearInterval(signalLossTimerRef.current);

        // Detener monitoreo de ubicación
        if (locationUnsubscribeRef.current) {
          stopLocationTracking(locationUnsubscribeRef.current);
          locationUnsubscribeRef.current = null;
        }

        // Calcular duración en minutos
        const durationMs = Date.now() - session.sessionStartTime;
        const durationMinutes = Math.round(durationMs / 60000);

        setIsCharging(false);

        // Retornar datos de la sesión para que el componente los envíe al backend
        return {
          durationMinutes,
          reason,
          session,
        };
      } catch (error) {
        console.error('Error deteniendo sesión de carga:', error);
        setIsCharging(false);
      }
    },
    [session]
  );

  const cancelChargingSession = useCallback(() => {
    // Detener timer
    if (timerRef.current) clearInterval(timerRef.current);
    if (signalLossTimerRef.current) clearInterval(signalLossTimerRef.current);

    // Detener monitoreo de ubicación
    if (locationUnsubscribeRef.current) {
      stopLocationTracking(locationUnsubscribeRef.current);
      locationUnsubscribeRef.current = null;
    }

    setIsCharging(false);
    setSession(null);
    setElapsedSeconds(0);
    setDistanceToStation(0);
  }, []);

  return (
    <ChargingContext.Provider
      value={{
        isCharging,
        session,
        distanceToStation,
        elapsedSeconds,
        startChargingSession,
        stopChargingSession,
        cancelChargingSession,
      }}
    >
      {children}
    </ChargingContext.Provider>
  );
}

export function useCharging() {
  const context = useContext(ChargingContext);
  if (!context) throw new Error('useCharging debe usarse dentro de ChargingProvider');
  return context;
}


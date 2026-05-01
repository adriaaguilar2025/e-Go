import React, { useState, useEffect } from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getApiUrl } from '@/constants/api';
import { useAuth } from '@/contexts/AuthContext';

import { useRouter, Stack, useLocalSearchParams } from 'expo-router';

const LOGO = require('./_assets/favicon.png'); // Ruta a tu imagen de perfil (el logo de momento)
const RAINBOW_COLORS = ['#f97316', '#facc15', '#22c55e', '#14b8a6', '#3b82f6', '#a855f7', '#ec4899'];

interface PerfilUser {
  id: number;
  username: string;
  email: string;
  punts: number;
  data_creacio: string;
  premium: boolean;
  admin: boolean;
  empresa: boolean;
}

export default function RankingScreen() {
  const { user } = useAuth();

  const [perfil, setPerfil] = useState<PerfilUser>();
  const [isLoading, setIsLoading] = useState(true);
  const userIdParam = useLocalSearchParams().userId;
  const idUser = userIdParam ? Number(userIdParam) : user?.id ?? 1;

  const router = useRouter();

  useEffect(() => {
    fetchPerfil();
  }, [idUser]);

  
  
  const fetchPerfil = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/user?usuari_id=${idUser}`); // dades de l'usuari
      const data = await response.json();
      setPerfil(data);
    } catch (error) {
      console.error("Error cargando perfil:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileName = () => {
    const name = perfil?.username ?? 'Usuario';
    if (!perfil?.premium) {
      return <Text style={styles.profileName}>{name}</Text>;
    }

    return (
      <Text style={styles.profileName}>
        {name.split('').map((char, index) => (
          <Text key={`${char}-${index}`} style={{ color: RAINBOW_COLORS[index % RAINBOW_COLORS.length] }}>
            {char}
          </Text>
        ))}
        {' '}👑
      </Text>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Capçalera */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Perfil</Text>
        {/* Espai buit per centrar el títol */}
        <View style={{ width: 24 }} />
      </View>
      {/* Contingut del perfil */}
      <View style={styles.profileContainer}>
        <View style={styles.profileCard}>
          <View style={styles.profileAvatarWrapper}>
            <Image source={LOGO} style={styles.avatar} resizeMode="contain" />
          </View>
          <View style={styles.profileContent}>
            {renderProfileName()}
            <Text>userIdParam (debug): {userIdParam}</Text>
            { perfil?.id === user?.id && (
              <Text style={styles.profileEmail}>{perfil?.email ?? 'email@ejemplo.com'}</Text>
            )}
            <Text style={styles.profileSubtitle}>Foto de perfil pendiente</Text>
            {(perfil?.empresa || perfil?.admin) && (
              <View style={styles.badgeRow}>
                {perfil?.empresa && (
                  <View style={styles.badge}>
                    <MaterialIcons name="business" size={16} color="#2563eb" />
                    <Text style={styles.badgeLabel}>Empresa</Text>
                  </View>
                )}
                {perfil?.admin && (
                  <View style={styles.badge}>
                    <MaterialIcons name="shield" size={16} color="#f59e0b" />
                    <Text style={styles.badgeLabel}>Admin</Text>
                  </View>
                )}
                
              </View>
              
            )}
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0f766e" />
            <Text style={styles.loadingText}>Cargando perfil...</Text>
          </View>
        ) : perfil ? (
          <View style={[styles.statsCard, styles.centered]}>
            <Text style={styles.points}>{perfil.punts}</Text>
            <Text style={styles.ptsLabel}>Puntos</Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>No existe el usuario</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  profileContainer: {
    padding: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  profileAvatarWrapper: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
  },
  profileContent: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  profileEmail: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
  },
  profileSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  badgeLabel: {
    marginLeft: 6,
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: '#e0f2fe',
    borderRadius: 18,
    padding: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  backButton: {
    padding: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  topCard: {
    backgroundColor: '#ecfdf5', // Fondo verdecito para el Top 3
    borderColor: '#a7f3d0',
  },
  rankCol: {
    width: 40,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#94a3b8',
  },
  nameCol: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  topUsername: {
    color: '#065f46',
    fontWeight: '700',
  },
  pointsCol: {
    alignItems: 'flex-end',
  },
  points: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10b981',
  },
  ptsLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 40,
    fontSize: 16,
  },
});
import React, { useState } from 'react';
import { TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { API_URL } from '@/constants/api';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  estacio_id: number;
  isInitiallyFavorite: boolean;
}

export function FavoriteButton({ estacio_id, isInitiallyFavorite }: Props) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(isInitiallyFavorite);
  const [loading, setLoading] = useState(false);

  const toggleFavorite = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Usamos el método correcto: POST para añadir, DELETE para quitar
      const method = isFavorite ? 'DELETE' : 'POST';
      const res = await fetch(`${API_URL}/favorites`, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuari_id: user.id, estacio_id }),
      });

      if (res.ok) {
        setIsFavorite(!isFavorite); // Invertimos el estado local solo si el servidor respondió bien
      }
    } catch (e) {
      console.error('Error al cambiar favorito', e);
      Alert.alert("Error", "No se pudo actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity onPress={toggleFavorite} disabled={loading} style={{ padding: 8 }}>
      {loading ? (
        <ActivityIndicator size="small" color="#ef4444" />
      ) : (
        <MaterialIcons
          name={isFavorite ? 'favorite' : 'favorite-border'}
          size={28}
          color={isFavorite ? '#ef4444' : '#6b7280'}
        />
      )}
    </TouchableOpacity>
  );
}
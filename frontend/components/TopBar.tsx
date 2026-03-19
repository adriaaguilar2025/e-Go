import React from 'react';
import { View, TextInput, StyleSheet, Image, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TopBarProps {
  onPressMenu: () => void;
}

export default function TopBar({ onPressMenu }: TopBarProps) {
  return (
    <View style={styles.headerContainer}>
      {/* Logo d'e-Go */}
      <TouchableOpacity style={styles.logoContainer}>
        <Image
          source={require('../assets/images/favicon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar"
          placeholderTextColor="#888"
        />
      </View>

      {/* Menú d'opcions (Hamburguesa) */}
      <TouchableOpacity style={styles.menuButton} onPress={onPressMenu}>
        <Ionicons name="menu" size={32} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingBottom: 10,
    // Deixem espai per la barra d'estat d'Android (bateria, hora...)
    paddingTop: (StatusBar.currentHeight || 24),
    // Ombra específica per a Android (dóna un efecte de relleu)
    elevation: 4,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 60,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 25,
    marginHorizontal: 15,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '',
  },
  menuButton: {
    padding: 2,
  },
});
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Switch,
  Modal
} from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { createFilterFormScreenStyles } from '@/constants/filterFormScreenStyles';
import { useScreenTheme } from '@/hooks/use-screen-theme';

export default function FiltersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const theme = useScreenTheme();
  const styles = useMemo(() => createFilterFormScreenStyles(theme), [theme.isDark, theme.sem]);

  // Estats per guardar els valors temporals abans d'aplicar
  const [minKw, setMinKw] = useState((params.minKw as string) || '');
  const [maxKw, setMaxKw] = useState((params.maxKw as string) || '');
  const [connectorType, setConnectorType] = useState((params.connectorType as string) || '');
  const [acDc, setAcDc] = useState((params.ac_dc as string) || '');
  const [errorMessage, setErrorMessage] = useState('');

  // Llista de connectors més habituals
  const CONNECTOR_TYPES = ['CCS Combo2', 'CHAdeMO', 'Schuko', 'MENNEKES', 'TESLA'];

  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const [showFavorites, setShowFavorites] = useState(params.showFavorites === 'true');

  const handleApply = () => {
    setErrorMessage('');

    if (minKw !== '' && maxKw !== '') {
      const min = parseFloat(minKw);
      const max = parseFloat(maxKw);

      if (min > max) {
        setErrorMessage(t('mapFilters.minGreaterThanMax'));
        return;
      }
    }

    router.navigate({
      pathname: '/',
      params: {
          minKw,
          maxKw,
          showFavorites: showFavorites ? 'true' : '',
          ac_dc: acDc,
          connectorType
      }
    });
  };

  const handleClear = () => {
    setMinKw('');
    setMaxKw('');
    if (setAcDc) setAcDc('');
    if (setConnectorType) setConnectorType('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Capçalera */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.title} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('mapFilters.title')}</Text>
        {/* Espai buit per centrar el títol */}
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={{flex: 1}}>

          <Text style={styles.description}>{t('mapFilters.description')}</Text>

              {/* INTERRUPTOR DE FAVORITOS */}
              <View style={styles.switchGroup}>
                <Text style={styles.label}>{t('mapFilters.myStations')}</Text>
                <View style={styles.switchRow}>
                  <MaterialIcons name={showFavorites ? "favorite" : "favorite-border"} size={22} color={showFavorites ? theme.sem.favorite : theme.mutedText} />
                  <Text style={styles.switchDescription}>{t('mapFilters.favoritesOnly')}</Text>
                  <Switch
                    value={showFavorites}
                    onValueChange={setShowFavorites}
                    trackColor={{ false: theme.switchTrackFalse, true: theme.sem.accent }}
                    thumbColor="#fff"
                  />
                </View>
              </View>

            {/* Input Mínim */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('mapFilters.minPower')}</Text>
              <TextInput
                style={[
                  styles.input, focusedInput === 'min' && styles.inputFocused,
                  Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}
                ]}
                placeholder="50"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                cursorColor={theme.sem.accent}
                value={minKw}
                onChangeText={setMinKw}
                maxLength={4}
                onFocus={() => setFocusedInput('min')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            {/* Input Màxim */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('mapFilters.maxPower')}</Text>
              <TextInput
                style={[
                  styles.input, focusedInput === 'max' && styles.inputFocused,
                  Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}
                ]}
                placeholder="150"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                cursorColor={theme.sem.accent}
                value={maxKw}
                onChangeText={setMaxKw}
                maxLength={4}
                onFocus={() => setFocusedInput('max')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            {/* Secció Tipo de corriente */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('mapFilters.currentType')}</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {['AC', 'DC'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeBtn,
                      acDc === type && styles.typeBtnActive
                    ]}
                    onPress={() => setAcDc(acDc === type ? '' : type)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.typeBtnText,
                      acDc === type && styles.typeBtnTextActive
                    ]}>
                      {type === 'AC' ? 'AC' : 'DC'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Secció Tipus de Connector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('mapFilters.connectorType')}</Text>
              <View style={styles.chipContainer}>
                {CONNECTOR_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.chip,
                      connectorType === type && styles.chipActive
                    ]}
                    onPress={() => setConnectorType(connectorType === type ? '' : type)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.chipText,
                      connectorType === type && styles.chipTextActive
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>

      {/* Botons d'acció */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear} activeOpacity={0.8}>
          <Text style={styles.clearBtnText}>{t('common.clear')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.8}>
          <Text style={styles.applyBtnText}>{t('mapFilters.apply')}</Text>
        </TouchableOpacity>
      </View>

      {/* --- POP-UP FLOTANT D'ERROR --- */}
      <Modal
        visible={errorMessage !== ''}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setErrorMessage('')}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalPopup}>
            <View style={styles.modalContent}>
              <MaterialIcons name="error" size={28} color={theme.sem.error} />
              <Text style={styles.modalText}>{errorMessage}</Text>
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setErrorMessage('')}
            >
              <MaterialIcons name="close" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

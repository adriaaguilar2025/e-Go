import { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { appFetch } from '@/services/appFetch';
import { createFilterFormScreenStyles } from '@/constants/filterFormScreenStyles';
import type { ScreenTheme } from '@/constants/screenTheme';
import { FilterFormScreenShell } from '@/components/layout/FilterFormScreenShell';
import { useAuth } from '@/contexts/AuthContext';
import { useScreenTheme } from '@/hooks/use-screen-theme';
import { useTranslation } from 'react-i18next';

interface Vehicle {
  usuari: number;
  nom: string;
  kw: string;
  tipus_connexio: string;
  ac_dc: string;
}

export default function VehiclesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useScreenTheme();
  const styles = useMemo(() => {
    const shared = createFilterFormScreenStyles(theme);
    const garage = createGarageStyles(theme);
    return { ...shared, ...garage };
  }, [theme.isDark, theme.sem]);

  const [nom, setNom] = useState('');
  const [potencia, setPotencia] = useState('');
  const [connectorType, setConnectorType] = useState('');
  const [acDc, setAcDc] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const { user } = useAuth();
  const CONNECTOR_TYPES = ['CCS Combo2', 'CHAdeMO', 'Schuko', 'MENNEKES', 'TESLA'];
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const fetchVehicles = async () => {
    if (!user?.id) return;
    try {
      const response = await appFetch(`/car?usuari_id=${user.id}`);
      const data = await response.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando vehiculos:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchVehicles();
    }
  }, [user]);

  const saveCar = async () => {
    setErrorMessage('');

    if (nom === '' || potencia === '' || connectorType === '' || acDc === '') {
      setErrorMessage(t('car.validationIncomplete'));
      return;
    }

    try {
      const res = await appFetch('/car', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuari_id: user!.id,
          v_nom: nom,
          v_potencia: potencia,
          v_conector: connectorType,
          v_corrent: acDc,
        }),
      });

      if (res.ok) {
        try {
          const response = await appFetch(`/car?usuari_id=${user!.id}`);
          const data = await response.json();
          setVehicles(Array.isArray(data) ? data : []);
          router.navigate({
            pathname: '/',
            params: {
              maxKw: Number(potencia),
              ac_dc: acDc,
              connectorType: connectorType,
            },
          });
          setNom('');
          setPotencia('');
          setConnectorType('');
          setAcDc('');
        } catch (error) {
          console.error('Error cargando vehiculos:', error);
        }
      } else {
        Alert.alert(t('common.error'), t('car.saveError'));
      }
    } catch (e) {
      console.error('Error al guardar vehiculo', e);
      Alert.alert(t('common.error'), t('car.connectionError'));
    }
  };

  const deleteCar = async (nomV: string) => {
    setErrorMessage('');

    try {
      const res = await appFetch('/car', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuari_id: user!.id, v_nom: nomV }),
      });

      if (res.ok) {
        try {
          const response = await appFetch(`/car?usuari_id=${user!.id}`);
          const data = await response.json();
          setVehicles(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error('Error cargando vehiculos:', error);
        }
      } else {
        Alert.alert(t('common.error'), t('car.deleteError'));
      }
    } catch (e) {
      console.error('Error al eliminar vehiculo', e);
      Alert.alert(t('common.error'), t('car.connectionError'));
    }
  };

  return (
    <>
      <FilterFormScreenShell
        theme={theme}
        testID="garage-screen-root"
        headerCentered
        header={<Text style={styles.title}>{t('car.garage')}</Text>}
      >
        {vehicles.map((v) => (
          <View key={v.nom} style={styles.infoPanel}>
            <Text style={styles.vehicleTitle}>{v.nom}</Text>
            <View style={styles.infoBadgeRow}>
              <View style={[styles.badge, { backgroundColor: theme.sem.badgeBg }]}>
                <MaterialIcons name="bolt" size={14} color={theme.sem.badgeIcon} />
                <Text style={[styles.badgeText, { color: theme.sem.badgeLabel }]}>{v.kw} kW</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: theme.sem.badgeBg }]}>
                <MaterialIcons name="ev-station" size={14} color={theme.sem.badgeIcon} />
                <Text style={[styles.badgeText, { color: theme.sem.badgeLabel }]}>{v.ac_dc}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: theme.sem.badgeBg }]}>
                <MaterialIcons name="electrical-services" size={14} color={theme.sem.badgeIcon} />
                <Text style={[styles.badgeText, { color: theme.sem.badgeLabel }]}>{v.tipus_connexio}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.panelApplyBtn}
              onPress={() =>
                router.navigate({
                  pathname: '/',
                  params: {
                    maxKw: Number(v.kw),
                    ac_dc: v.ac_dc,
                    connectorType: v.tipus_connexio,
                  },
                })
              }
              activeOpacity={0.8}
            >
              <Text style={styles.applyBtnText}>{t('car.searchStations')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => deleteCar(v.nom)}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteBtnText}>{t('car.deleteVehicle')}</Text>
            </TouchableOpacity>
          </View>
        ))}

        <Text style={styles.sectionTitle}>{t('car.newVehicle')}</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('car.name')}</Text>
          <TextInput
            style={[
              styles.input,
              focusedInput === 'nom' && styles.inputFocused,
              Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {},
            ]}
            keyboardType="default"
            cursorColor={theme.sem.accent}
            value={nom}
            onChangeText={setNom}
            maxLength={50}
            onFocus={() => setFocusedInput('nom')}
            onBlur={() => setFocusedInput(null)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('car.maxPower')}</Text>
          <TextInput
            style={[
              styles.input,
              focusedInput === 'max' && styles.inputFocused,
              Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {},
            ]}
            placeholderTextColor={theme.placeholder}
            keyboardType="numeric"
            cursorColor={theme.sem.accent}
            value={potencia}
            onChangeText={setPotencia}
            maxLength={4}
            onFocus={() => setFocusedInput('max')}
            onBlur={() => setFocusedInput(null)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('car.currentType')}</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {['AC', 'DC'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.typeBtn, acDc === type && styles.typeBtnActive]}
                onPress={() => setAcDc(acDc === type ? '' : type)}
                activeOpacity={0.8}
              >
                <Text style={[styles.typeBtnText, acDc === type && styles.typeBtnTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('car.connectorType')}</Text>
          <View style={styles.chipContainer}>
            {CONNECTOR_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, connectorType === type && styles.chipActive]}
                onPress={() => setConnectorType(connectorType === type ? '' : type)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, connectorType === type && styles.chipTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            testID="garage-save-vehicle-button"
            style={[styles.applyBtn, styles.saveBtnFull]}
            onPress={saveCar}
            activeOpacity={0.8}
          >
            <Text style={styles.applyBtnText}>{t('car.saveVehicle')}</Text>
          </TouchableOpacity>
        </View>
      </FilterFormScreenShell>

      <Modal
        visible={errorMessage !== ''}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorMessage('')}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalPopup}>
            <View style={styles.modalContent}>
              <MaterialIcons name="error" size={28} color={theme.error} />
              <Text style={styles.modalText}>{errorMessage}</Text>
            </View>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setErrorMessage('')}>
              <MaterialIcons name="close" size={24} color={theme.mutedText} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const createGarageStyles = (theme: ScreenTheme) =>
  StyleSheet.create({
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.title,
      marginBottom: 16,
      marginTop: 8,
    },
    vehicleTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.title,
    },
    infoPanel: {
      backgroundColor: theme.surface,
      borderRadius: 24,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    panelApplyBtn: {
      paddingVertical: 16,
      borderRadius: 12,
      backgroundColor: theme.sem.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 15,
    },
    deleteBtn: {
      paddingVertical: 16,
      borderRadius: 12,
      backgroundColor: theme.error,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 15,
    },
    deleteBtnText: {
      color: theme.textOnAccent,
      fontSize: 16,
      fontWeight: '700',
    },
    saveBtnFull: {
      flex: 1,
      marginTop: 0,
    },
    infoBadgeRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 4,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      gap: 4,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '600',
    },
  });

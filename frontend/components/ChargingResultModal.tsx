import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface ChargingResultModalProps {
  visible: boolean;
  durationMinutes: number;
  basePoints: number;
  totalPoints: number;
  multiplier: number;
  isPremium: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ChargingResultModal({
  visible,
  durationMinutes,
  basePoints,
  totalPoints,
  multiplier,
  isPremium,
  isLoading,
  onClose,
  onConfirm,
}: ChargingResultModalProps) {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icono de éxito */}
          <View style={styles.iconSection}>
            <View style={styles.iconBackground}>
              <MaterialIcons name="check-circle" size={64} color="#10b981" />
            </View>
          </View>

          {/* Título */}
          <Text style={styles.title}>¡Sesión Completada!</Text>

          {/* Detalles de puntos */}
          <View style={styles.detailsSection}>
            {/* Duración */}
            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <MaterialIcons name="timer" size={18} color="#64748b" />
                <Text style={styles.detailText}>Tiempo de carga</Text>
              </View>
              <Text style={styles.detailValue}>{durationMinutes} min</Text>
            </View>

            {/* Puntos base */}
            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <MaterialIcons name="star" size={18} color="#f59e0b" />
                <Text style={styles.detailText}>Puntos base</Text>
              </View>
              <Text style={styles.detailValue}>{basePoints}</Text>
            </View>

            {/* Multiplicador Premium (si aplica) */}
            {isPremium && (
              <View style={styles.detailRow}>
                <View style={styles.detailLabel}>
                  <MaterialIcons name="auto-awesome" size={18} color="#a855f7" />
                  <Text style={styles.detailText}>Bonus Premium</Text>
                </View>
                <Text style={styles.detailValue}>x{multiplier}</Text>
              </View>
            )}

            {/* Línea separadora */}
            <View style={styles.divider} />

            {/* Total de puntos */}
            <View style={[styles.detailRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Puntos Ganados</Text>
              <Text style={styles.totalPoints}>{totalPoints}</Text>
            </View>
          </View>

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.secondaryButtonText}>Volver</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="cloud-upload" size={18} color="#fff" />
                  <Text style={styles.primaryButtonText}>Guardar Puntos</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    maxWidth: '90%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 20,
  },
  detailsSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  totalRow: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  divider: {
    height: 1,
    backgroundColor: '#cbd5e1',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  totalPoints: {
    fontSize: 28,
    fontWeight: '800',
    color: '#10b981',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#10b981',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#f1f5f9',
  },
  secondaryButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
});


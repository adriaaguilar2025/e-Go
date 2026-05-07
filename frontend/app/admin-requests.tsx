import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { StationRequestCard } from '@/components/stations/StationRequestCard';
import { StationRequest } from '@/components/stations/types';
import { approveRequest, listPendingRequests, rejectRequest } from '@/services/stationModeration';

export default function AdminRequestsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState<StationRequest[]>([]);
  const [rejecting, setRejecting] = useState<StationRequest | null>(null);
  const [reason, setReason] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      setRequests(await listPendingRequests());
    } catch (err) {
      setError(err instanceof Error && err.message === 'NO_SESSION' ? 'No hay sesion admin' : 'No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onApprove(id: number) {
    setSubmitting(true);
    try {
      const res = await approveRequest(id);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'No se pudo aprobar');
        return;
      }
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function onReject() {
    if (!rejecting) return;
    setSubmitting(true);
    try {
      const res = await rejectRequest(rejecting.id, reason.trim());
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'No se pudo rechazar');
        return;
      }
      setRejecting(null);
      setReason('');
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll} style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Solicitudes pendientes</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/admin-home')}>
          <Text style={styles.backText}>Volver al panel admin</Text>
        </TouchableOpacity>
        {loading ? (
          <ActivityIndicator size="large" color="#111827" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : requests.length === 0 ? (
          <Text style={styles.muted}>No hay solicitudes pendientes.</Text>
        ) : (
          requests.map((request) => (
            <View key={request.id}>
              <StationRequestCard request={request} showCompany />
              <View style={styles.actions}>
                <TouchableOpacity style={styles.approve} onPress={() => onApprove(request.id)} disabled={submitting}>
                  <Text style={styles.approveText}>Aprobar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.reject} onPress={() => setRejecting(request)} disabled={submitting}>
                  <Text style={styles.rejectText}>Rechazar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
      <Modal visible={!!rejecting} transparent animationType="fade" onRequestClose={() => setRejecting(null)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Motivo del rechazo</Text>
            <TextInput style={styles.input} value={reason} onChangeText={setReason} placeholder="Escribe un motivo (opcional)" placeholderTextColor="#9ca3af" multiline />
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancel} onPress={() => setRejecting(null)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.reject} onPress={onReject} disabled={submitting}>
                <Text style={styles.rejectText}>Enviar rechazo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24, paddingVertical: 40 },
  card: { width: '100%', maxWidth: 620, backgroundColor: '#fff', borderRadius: 16, padding: 24, elevation: 3 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  backButton: { marginBottom: 12, alignSelf: 'center' },
  backText: { color: '#6b7280', fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  approve: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#111827', alignItems: 'center' },
  approveText: { color: '#fff', fontWeight: '700' },
  reject: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#fee2e2', alignItems: 'center' },
  rejectText: { color: '#b91c1c', fontWeight: '700' },
  cancel: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#e5e7eb', alignItems: 'center' },
  cancelText: { color: '#111827', fontWeight: '700' },
  errorText: { color: '#dc2626', textAlign: 'center' },
  muted: { color: '#6b7280', textAlign: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(17,24,39,0.45)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  input: { minHeight: 80, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 10, marginBottom: 12, color: '#111827' },
});

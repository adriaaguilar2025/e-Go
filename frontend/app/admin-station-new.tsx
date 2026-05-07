import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ManualStationForm } from '@/components/stations/ManualStationForm';
import { FormState, initialStationFormState } from '@/components/stations/types';
import { createAdminStation, updateAdminStation } from '@/services/stationModeration';

export default function AdminStationNewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const getParam = (key: string) => {
    const value = params[key as keyof typeof params];
    if (Array.isArray(value)) return value[0];
    return value as string | undefined;
  };
  const isEdit = getParam('mode') === 'edit';
  const stationId = getParam('id') ? Number(getParam('id')) : null;
  const [form, setForm] = useState<FormState>(initialStationFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    setForm({
      nom: getParam('nom') || '',
      latitud: getParam('latitud') || '',
      longitud: getParam('longitud') || '',
      kw: getParam('kw') || '',
      ac_dc: getParam('ac_dc') || '',
      tipus_connexio: getParam('tipus_connexio') || '',
      tipus_velocitat: getParam('tipus_velocitat') || '',
      adreca: getParam('adreca') || '',
      municipi: getParam('municipi') || '',
      provincia: getParam('provincia') || '',
      promotor: getParam('promotor') || '',
      acces: getParam('acces') || '',
    });
  }, [isEdit]);

  function updateField(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
    setSuccess('');
  }

  async function submit() {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      let res;
      if (isEdit && Number.isFinite(stationId)) {
        res = await updateAdminStation(stationId!, form);
      } else if (isEdit) {
        setError('ID de estacion invalido');
        return;
      } else {
        res = await createAdminStation(form);
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'No se pudo guardar la estacion');
        return;
      }
      setSuccess(isEdit ? 'Estacion actualizada' : 'Estacion creada correctamente');
      if (!isEdit) setForm(initialStationFormState);
    } catch (err) {
      setError(err instanceof Error && err.message === 'NO_SESSION' ? 'No hay sesion admin' : 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ManualStationForm
      title={isEdit ? 'Editar estacion manual' : 'Nueva estacion manual'}
      subtitle="Solo visible en el backoffice admin"
      submitLabel={isEdit ? 'Guardar cambios' : 'Crear estacion'}
      loading={loading}
      error={error}
      success={success}
      form={form}
      onChange={updateField}
      onSubmit={submit}
      onBack={() => router.back()}
    />
  );
}

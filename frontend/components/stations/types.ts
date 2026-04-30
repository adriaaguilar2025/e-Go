export type FormState = {
  nom: string;
  latitud: string;
  longitud: string;
  kw: string;
  ac_dc: string;
  tipus_connexio: string;
  tipus_velocitat: string;
  adreca: string;
  municipi: string;
  provincia: string;
  promotor: string;
  acces: string;
};

export const initialStationFormState: FormState = {
  nom: '',
  latitud: '',
  longitud: '',
  kw: '',
  ac_dc: '',
  tipus_connexio: '',
  tipus_velocitat: '',
  adreca: '',
  municipi: '',
  provincia: '',
  promotor: '',
  acces: '',
};

export type ManualStation = {
  id: number;
  nom: string;
  created_at: string;
  external_id?: string | null;
  latitud?: string | number | null;
  longitud?: string | number | null;
  tipus_connexio?: string | null;
  tipus_velocitat?: string | null;
  adreca?: string | null;
  municipi?: string;
  provincia?: string;
  kw?: string | number;
  ac_dc?: string | null;
  promotor?: string | null;
  acces?: string | null;
};

export type StationRequest = {
  id: number;
  station_id: number | null;
  empresa_id: number;
  action: 'create' | 'update' | 'delete';
  payload: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string | null;
  rejection_reason?: string | null;
  empresa_nombre?: string | null;
  empresa_email?: string | null;
  empresa_username?: string | null;
};

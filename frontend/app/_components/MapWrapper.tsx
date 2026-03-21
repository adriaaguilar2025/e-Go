// MapWrapper.tsx (Esta será la versión nativa por defecto)
// La web usará automáticamente MapWrapper.web.tsx sin que tú hagas nada.

import MapView, { Marker } from 'react-native-maps';

export { MapView, Marker };

// Default export para que Expo Router no se queje
export default function MapWrapper() {
  return null;
}
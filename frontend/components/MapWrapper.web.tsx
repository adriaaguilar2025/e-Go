import React from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker as GoogleMarker,
  MarkerClusterer,
} from '@react-google-maps/api';
import { View, Text } from 'react-native';

const containerStyle = { width: '100%', height: '100%' };

const defaultOptions = {
  fullscreenControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  zoomControl: false,
  panControl: false,
  scaleControl: false,
  rotateControl: false,
  keyboardShortcuts: false,
  gestureHandling: 'greedy',
  disableDefaultUI: true,
};

export const MapView = ({
  children,
  initialRegion,
  style,
  onPress,
  onRegionChangeComplete,
  options,
  ...props
}: any) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  // Memorizamos el centro inicial para evitar que el mapa "salte" al recibir datos
  const initialCenter = React.useMemo(
    () => ({
      lat: initialRegion?.latitude || 41.3879,
      lng: initialRegion?.longitude || 2.16992,
    }),
    []
  );

  const handleIdle = () => {
    if (map && onRegionChangeComplete) {
      const center = map.getCenter();
      const bounds = map.getBounds();
      if (center && bounds) {
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        onRegionChangeComplete({
          latitude: center.lat(),
          longitude: center.lng(),
          latitudeDelta: ne.lat() - sw.lat(),
          longitudeDelta: ne.lng() - sw.lng(),
        });
      }
    }
  };

  if (!isLoaded) return <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center' }, style]}><Text>Cargando Mapa...</Text></View>;

  // Separamos los marcadores de las estaciones para agruparlos
  const clusterableMarkers: any[] = [];
  const otherChildren: any[] = [];

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      // Si el marcador es de usuario (tu punto azul), NO lo agrupamos
      if ((child.props as any).isUserLocation) {
        otherChildren.push(child);
      } else {
        clusterableMarkers.push(child);
      }
    }
  });

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={initialCenter}
        zoom={12}
        onClick={(e) => onPress && onPress({ nativeEvent: { coordinate: { latitude: e.latLng.lat(), longitude: e.latLng.lng() } } })}
        onLoad={setMap}
        onIdle={handleIdle}
        options={{ ...defaultOptions, ...options }}
        {...props}
      >
        <MarkerClusterer
          options={{
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
            gridSize: 60,
            maxZoom: 15,
            zoomOnClick: true,
          }}
        >
          {(clusterer) => (
            <>
              {clusterableMarkers.map((child, index) =>
                React.cloneElement(child, { key: `marker-cluster-${index}`, clusterer })
              )}
            </>
          )}
        </MarkerClusterer>
        {otherChildren}
      </GoogleMap>
    </div>
  );
};

export const Marker = ({ coordinate, position, onPress, clusterer, isUserLocation, ...props }: any) => {
  const markerPosition = position || (coordinate ? { lat: coordinate.latitude, lng: coordinate.longitude } : null);
  if (!markerPosition) return null;

  return (
    <GoogleMarker
      position={markerPosition}
      clusterer={clusterer}
      onClick={() => onPress && onPress({ stopPropagation: () => {}, nativeEvent: { coordinate: markerPosition } })}
      {...props}
    />
  );
};

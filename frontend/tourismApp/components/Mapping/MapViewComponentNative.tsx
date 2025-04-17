import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Constants from 'expo-constants';

// Utility imports
import { requestLocationPermission } from './utils/requestLocationPermission';
import { useUserLocation } from './Hooks/useUserLocation';
import { usePOIs } from './utils/POI/usePOIs';

// Set your Mapbox access token from env
MapboxGL.setAccessToken(Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN);
MapboxGL.setTelemetryEnabled(false);

export default function MapViewComponent() {
  const { coords, error, heading } = useUserLocation();
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const { pois } = usePOIs();

  useEffect(() => {
    requestLocationPermission();
  }, []);

  return (
    <View style={styles.container}>
      <MapboxGL.MapView style={styles.map}>
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={14}
          centerCoordinate={coords ?? [-1.615, 54.978]}
        />

        {coords && (
          <MapboxGL.PointAnnotation id="user-location" coordinate={coords}>
            <Animated.View
              style={[
                styles.marker,
                { transform: [{ rotate: `${heading}deg` }] },
              ]}
            />
          </MapboxGL.PointAnnotation>
        )}

        {pois.map((poi) => (
          <MapboxGL.PointAnnotation
            key={poi.id}
            id={poi.id}
            coordinate={[poi.lng, poi.lat]}
          >
            <View style={styles.poiMarker} />
          </MapboxGL.PointAnnotation>
        ))}
      </MapboxGL.MapView>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Location error: {error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  marker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2A9D8F',
    borderColor: '#fff',
    borderWidth: 2,
  },
  poiMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E9C46A',
    borderColor: '#333',
    borderWidth: 1,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff3f3',
    padding: 10,
    borderRadius: 8,
  },
  errorText: {
    color: '#cc0000',
    textAlign: 'center',
  },
});

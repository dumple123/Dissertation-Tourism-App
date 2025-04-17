import React, { useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Constants from 'expo-constants';
import { requestLocationPermission } from './utils/requestLocationPermission';
import { useUserLocation } from './Hooks/useUserLocation'; // 

// Set your Mapbox access token from env
MapboxGL.setAccessToken(Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN);
MapboxGL.setTelemetryEnabled(false);

export default function MapViewComponent() {
  // Pull location from your reusable hook
  const { coords, error } = useUserLocation();

  // Ref to control the map camera
  const cameraRef = useRef<MapboxGL.Camera>(null);

  return (
    <View style={styles.container}>
      <MapboxGL.MapView style={styles.map}>
        {/* Automatically center the camera on current location (or fallback) */}
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={14}
          centerCoordinate={coords ?? [-1, 51]}
        />

        {/* Drop a simple custom puck if we have location */}
        {coords && (
          <MapboxGL.PointAnnotation id="user-location" coordinate={coords}>
            <View style={styles.marker} />
          </MapboxGL.PointAnnotation>
        )}
      </MapboxGL.MapView>

      {/* Optional: display error if location fails */}
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

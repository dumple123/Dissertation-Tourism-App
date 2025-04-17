import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Constants from 'expo-constants';

// Utility imports
import { requestLocationPermission } from './utils/requestLocationPermission';
import { useUserLocation } from './Hooks/useUserLocation';
import { usePOIs } from './utils/POI/usePOIs';
import { createPOI } from './utils/POI/createPOI';

// Set your Mapbox access token from env
MapboxGL.setAccessToken(Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN);
MapboxGL.setTelemetryEnabled(false);

export default function MapViewComponent() {
  // Pull location and heading from reusable hook
  const { coords, error, heading } = useUserLocation();

  // Ref to control the map camera
  const cameraRef = useRef<MapboxGL.Camera>(null);

  // Hook to manage POIs
  const { pois, addPOI } = usePOIs();

  useEffect(() => {
    requestLocationPermission();
  }, []);

  return (
    <View style={styles.container}>
      <MapboxGL.MapView style={styles.map}>
        {/* Automatically center the camera on current location (or fallback) */}
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={14}
          centerCoordinate={coords ?? [-1.615, 54.978]}
        />

        {/* Drop a custom directional puck if we have location */}
        {coords && (
          <MapboxGL.PointAnnotation id="user-location" coordinate={coords}>
            <Animated.View
              style={[
                styles.marker,
                {
                  transform: [{ rotate: `${heading}deg` }],
                },
              ]}
            />
          </MapboxGL.PointAnnotation>
        )}

        {/* Render POIs */}
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

      {/* Floating button to add a POI based on current location */}
      <TouchableOpacity style={styles.button} onPress={() => createPOI(addPOI)}>
        <Text style={styles.buttonText}>Add POI</Text>
      </TouchableOpacity>

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
  poiMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E9C46A',
    borderColor: '#333',
    borderWidth: 1,
  },
  button: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: '#2A9D8F',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
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

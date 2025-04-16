import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Constants from 'expo-constants';

// Utility functions
import { requestLocationPermission } from './utils/requestLocationPermission';
import { getInitialLocation } from './utils/getInitialLocation';
import { handleLocationUpdate } from './utils/handleLocationUpdate';

// Set your Mapbox token from environment variables
MapboxGL.setAccessToken(Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN);

export default function MapViewComponent() {
  // State for user's coordinates
  const [coords, setCoords] = useState<[number, number] | null>(null);

  // Flag to ensure camera only centers once
  const [hasCentered, setHasCentered] = useState(false);

  // Flag to track if location permission was granted
  const [locationReady, setLocationReady] = useState(false);

  // Ref to access the Mapbox camera
  const cameraRef = useRef<MapboxGL.Camera>(null);

  // Request location permissions on mount
  useEffect(() => {
    const checkPermission = async () => {
      const granted = await requestLocationPermission();
      setLocationReady(granted);
    };
    checkPermission();
  }, []);

  // Fetch user's last known location once permission is granted
  useEffect(() => {
    const initLocation = async () => {
      if (!locationReady) return;

      const initialCoords = await getInitialLocation();
      if (initialCoords) {
        setCoords(initialCoords);
      }
    };
    initLocation();
  }, [locationReady]);

  return (
    <View style={styles.container}>
      <MapboxGL.MapView style={styles.map}>
        {/* Map camera that centers and zooms */}
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={14}
          centerCoordinate={coords ?? [-1, 51]} // Default fallback center
        />

        {/* Track user location in the background */}
        {locationReady && (
          <MapboxGL.UserLocation
            visible={false}
            onUpdate={(loc) =>
              handleLocationUpdate(loc, setCoords, cameraRef, hasCentered, setHasCentered)
            }
          />
        )}

        {/* Display user location as a custom marker */}
        {coords && (
          <MapboxGL.PointAnnotation id="user-location" coordinate={coords}>
            <View style={styles.marker} />
          </MapboxGL.PointAnnotation>
        )}
      </MapboxGL.MapView>
    </View>
  );
}

// Styles for the map container and custom marker
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
});

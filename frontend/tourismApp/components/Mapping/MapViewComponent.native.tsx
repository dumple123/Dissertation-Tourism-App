import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Constants from 'expo-constants';

MapboxGL.setAccessToken(Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN);

export default function MapViewComponent() {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [hasCentered, setHasCentered] = useState(false);
  const cameraRef = useRef<MapboxGL.Camera>(null);

  // Request location permission (Android only)
  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "This app needs access to your location to show your position on the map.",
            buttonPositive: "OK",
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Location permission granted");
        } else {
          console.warn("Location permission denied");
        }
      }
    };

    requestPermission();
  }, []);

  // Fetch last known location on mount
  useEffect(() => {
    const fetchInitialLocation = async () => {
      console.log("Fetching last known location...");
      try {
        const loc = await MapboxGL.locationManager.getLastKnownLocation();
        if (loc?.coords) {
          const initialCoords: [number, number] = [
            loc.coords.longitude,
            loc.coords.latitude,
          ];
          console.log("Initial location:", initialCoords);
          setCoords(initialCoords);
        } else {
          console.warn("No initial location available (GPS off or denied)");
        }
      } catch (err) {
        console.error("Error fetching initial location:", err);
      }
    };

    fetchInitialLocation();
  }, []);

  // Handle live updates
  const handleLocationUpdate = (loc: MapboxGL.Location) => {
    const newCoords: [number, number] = [
      loc.coords.longitude,
      loc.coords.latitude,
    ];
    console.log("Live location update:", newCoords);

    setCoords(newCoords);

    if (!hasCentered) {
      cameraRef.current?.flyTo(newCoords, 1000);
      setHasCentered(true);
    }
  };

  return (
    <View style={styles.container}>
      <MapboxGL.MapView style={styles.map}>
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={14}
          centerCoordinate={coords ?? [-1, 51]} // Default center (won't render marker)
        />
        <MapboxGL.UserLocation
          visible={false}
          onUpdate={handleLocationUpdate}
        />
        {coords && (
          <MapboxGL.PointAnnotation id="user-location" coordinate={coords}>
            <View style={styles.marker} />
          </MapboxGL.PointAnnotation>
        )}
      </MapboxGL.MapView>
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
});

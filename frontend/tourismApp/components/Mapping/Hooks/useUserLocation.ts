import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Magnetometer } from 'expo-sensors';
import { Platform } from 'react-native';

export function useUserLocation() {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [heading, setHeading] = useState<number>(0);

  // Minimum distance (in meters) to trigger location update
  const DISTANCE_THRESHOLD_METERS = 5;

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let watchId: number | null = null; // Used for web geolocation tracking
    let lastCoords: [number, number] | null = null;

    // Convert degrees to radians
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    // Haversine formula to calculate distance between two lat/lng points
    const haversineDistance = (a: [number, number], b: [number, number]): number => {
      const R = 6371000; // Earth radius in meters
      const dLat = toRad(b[1] - a[1]);
      const dLng = toRad(b[0] - a[0]);
      const lat1 = toRad(a[1]);
      const lat2 = toRad(b[1]);

      const aHarv =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

      return R * 2 * Math.atan2(Math.sqrt(aHarv), Math.sqrt(1 - aHarv));
    };

    const startTracking = async () => {
      // Request location permissions
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) {
        setError('Permission not granted');
        return;
      }

      if (Platform.OS === 'web') {
        // Use native browser geolocation API on web
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const newCoords: [number, number] = [
              position.coords.longitude,
              position.coords.latitude,
            ];

            // Only update location if distance threshold is met
            if (!lastCoords || haversineDistance(lastCoords, newCoords) >= DISTANCE_THRESHOLD_METERS) {
              lastCoords = newCoords;
              setCoords(newCoords);
            }
          },
          (err) => {
            setError(err.message);
          },
          { enableHighAccuracy: true }
        );
      } else {
        // Use expo-location on native platforms (iOS/Android)
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 1,
          },
          (position) => {
            const newCoords: [number, number] = [
              position.coords.longitude,
              position.coords.latitude,
            ];

            // Only update location if distance threshold is met
            if (!lastCoords || haversineDistance(lastCoords, newCoords) >= DISTANCE_THRESHOLD_METERS) {
              lastCoords = newCoords;
              setCoords(newCoords);
            }
          }
        );
      }
    };

    // Start tracking location
    startTracking();

    // Clean up location subscription on component unmount
    return () => {
      if (Platform.OS === 'web') {
        // Use browser API to remove location watch on web
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
        }
      } else {
        // Remove native subscription if present
        subscription?.remove?.();
      }
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      // Subscribe to device magnetometer sensor on native platforms
      const subscription = Magnetometer.addListener((data) => {
        let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
        angle = angle >= 0 ? angle : 360 + angle;
        setHeading(angle);
      });

      // Set magnetometer update interval (in milliseconds)
      Magnetometer.setUpdateInterval(100);

      // Clean up subscription on unmount
      return () => {
        subscription.remove();
      };
    } else {
      // Set a default/fallback heading for web
      setHeading(0);
    }
  }, []);

  return { coords, error, heading };
}

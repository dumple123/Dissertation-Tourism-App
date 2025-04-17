import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export function useUserLocation() {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const DISTANCE_THRESHOLD_METERS = 10;

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let lastCoords: [number, number] | null = null;

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const haversineDistance = (a: [number, number], b: [number, number]): number => {
      const R = 6371000;
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
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) {
        setError('Permission not granted');
        return;
      }

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

          if (!lastCoords || haversineDistance(lastCoords, newCoords) >= DISTANCE_THRESHOLD_METERS) {
            lastCoords = newCoords;
            setCoords(newCoords);
          }
        }
      );
    };

    startTracking();

    return () => {
      subscription?.remove();
    };
  }, []);

  return { coords, error };
}

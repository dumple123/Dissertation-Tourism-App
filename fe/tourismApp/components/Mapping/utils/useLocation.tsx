import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as Location from 'expo-location';

interface LocationContextType {
  coords: [number, number];
}

const LocationContext = createContext<LocationContextType>({
  coords: [-1.615, 54.978], // Default Newcastle center
});

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [coords, setCoords] = useState<[number, number]>([-1.615, 54.978]); // Start with safe fallback

  useEffect(() => {
    const startLocationTracking = async () => {
      // Request permission using Expo Location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }

      let lastCoords: [number, number] = [-1.615, 54.978];

      // Start watching position
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000, // every 1 second
          distanceInterval: 2, // or every 2 meters
        },
        (location) => {
          if (location?.coords) {
            const newCoords: [number, number] = [
              location.coords.longitude,
              location.coords.latitude,
            ];

            if (newCoords[0] === 0 || newCoords[1] === 0) {
              return;
            }

            const distance = getDistanceMeters(lastCoords, newCoords);

            if (distance > 10) {
              // Large jump (e.g. GPS jump / teleport) — instantly move
              setCoords(newCoords);
              lastCoords = newCoords;
            } else {
              // Small adjustment (e.g. walking) — smooth move
              setCoords((prev) => [
                prev[0] + (newCoords[0] - prev[0]) * 0.2, // 20% toward new
                prev[1] + (newCoords[1] - prev[1]) * 0.2,
              ]);
              lastCoords = newCoords;
            }
          }
        }
      );
    };

    startLocationTracking();
  }, []); // <-- IMPORTANT: empty array = run once on mount

  return (
    <LocationContext.Provider value={{ coords }}>
      {children}
    </LocationContext.Provider>
  );
};

export function useLocation() {
  return useContext(LocationContext);
}

// Calculate distance in meters between two lat/lng points
function getDistanceMeters(coord1: [number, number], coord2: [number, number]): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters

  const dLat = toRad(coord2[1] - coord1[1]);
  const dLng = toRad(coord2[0] - coord1[0]);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1[1])) *
      Math.cos(toRad(coord2[1])) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

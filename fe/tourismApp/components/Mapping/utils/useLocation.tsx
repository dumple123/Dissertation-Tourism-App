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

            if (newCoords[0] !== 0 && newCoords[1] !== 0) {
              setCoords(newCoords);
            }
          }
        }
      );
    };

    startLocationTracking();
  }, []);

  return (
    <LocationContext.Provider value={{ coords }}>
      {children}
    </LocationContext.Provider>
  );
};

export function useLocation() {
  return useContext(LocationContext);
}

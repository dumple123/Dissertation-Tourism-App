import { useState, useCallback } from 'react';
import seedPOIsRaw from './seedPOIs.json';

export type POI = {
  id: string;
  lng: number;
  lat: number;
  label?: string;
};

// Ensure each POI has a unique ID
const seedPOIs: POI[] = seedPOIsRaw.map((poi) => ({
  ...poi,
  id: crypto.randomUUID(),
}));

export function usePOIs() {
  const [pois, setPOIs] = useState<POI[]>(seedPOIs);

  const addPOI = useCallback((lng: number, lat: number, label?: string) => {
    const newPOI: POI = {
      id: crypto.randomUUID(),
      lng,
      lat,
      label,
    };
    setPOIs((prev) => [...prev, newPOI]);
  }, []);

  return { pois, addPOI };
}

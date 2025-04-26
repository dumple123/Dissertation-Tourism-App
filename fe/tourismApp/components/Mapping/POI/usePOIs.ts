import { useState, useCallback } from 'react';
import seedPOIsRaw from './seedPOIs.json';

export type POI = {
  id: string;
  lng: number;
  lat: number;
  label?: string;
};

// Simple ID generator (timestamp + random)
const generateId = () => `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

// Generate initial POIs with unique-enough IDs
const seedPOIs: POI[] = seedPOIsRaw.map((poi) => ({
  ...poi,
  id: generateId(),
}));

export function usePOIs() {
  const [pois, setPOIs] = useState<POI[]>(seedPOIs);

  const addPOI = useCallback((lng: number, lat: number, label?: string) => {
    const newPOI: POI = {
      id: generateId(),
      lng,
      lat,
      label,
    };
    setPOIs((prev) => [...prev, newPOI]);
  }, []);

  return { pois, addPOI };
}

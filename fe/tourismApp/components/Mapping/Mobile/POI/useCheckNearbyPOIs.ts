import { useEffect, useRef } from 'react';
import { getDistance } from 'geolib';
import { useLocation } from '~/components/Mapping/utils/useLocation';
import { markPOIAsVisited } from '~/api/poiProgress';

interface POI {
  id: string;
  geojson: {
    coordinates: [number, number];
  };
}

interface UseCheckNearbyPOIsOptions {
  pois: POI[];
  userId: string;
  visitedPOIIds: Set<string>;
  radiusMeters?: number;
  refreshProgress: () => Promise<void>; 
}

export function useCheckNearbyPOIs({
  pois,
  userId,
  visitedPOIIds,
  radiusMeters = 30,
  refreshProgress,
}: UseCheckNearbyPOIsOptions) {
  const { coords } = useLocation();
  const sessionVisited = useRef<Set<string>>(new Set());

  // --- Memoized check function ---
  useEffect(() => {
    if (!coords || !userId || pois.length === 0) return;

    const checkNearby = async () => {
      let visitedAny = false;

      for (const poi of pois) {
        const poiId = poi.id;

        // Skip if already visited this session or previously
        if (visitedPOIIds.has(poiId) || sessionVisited.current.has(poiId)) continue;

        const [lng, lat] = poi.geojson.coordinates;
        const distance = getDistance(
          { latitude: coords[1], longitude: coords[0] },
          { latitude: lat, longitude: lng }
        );

        if (distance <= radiusMeters) {
          try {
            await markPOIAsVisited({ userId, poiId });
            sessionVisited.current.add(poiId);
            console.log(`Marked POI ${poiId} as visited (distance: ${distance}m)`);
            visitedAny = true;
          } catch (err) {
            console.error('Failed to mark POI as visited:', err);
          }
        }
      }

      if (visitedAny) {
        await refreshProgress(); // Update global context
      }
    };

    const interval = setInterval(checkNearby, 3000); // More responsive

    return () => clearInterval(interval);
  }, [coords?.[0], coords?.[1], pois, userId, radiusMeters]); // minimal, stable deps
}

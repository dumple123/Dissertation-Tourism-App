import { useEffect } from 'react';
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
  radiusMeters = 25,
  refreshProgress,
}: UseCheckNearbyPOIsOptions) {
  const { coords } = useLocation();

  useEffect(() => {
    if (!coords || !userId) return;

    const checkNearby = async () => {
      let visitedAny = false;

      for (const poi of pois) {
        if (visitedPOIIds.has(poi.id)) continue;

        const poiCoords = poi.geojson.coordinates;

        const distance = getDistance(
          { latitude: coords[1], longitude: coords[0] },
          { latitude: poiCoords[1], longitude: poiCoords[0] }
        );

        if (distance <= radiusMeters) {
          try {
            await markPOIAsVisited({ userId, poiId: poi.id });
            console.log(`✅ Marked POI ${poi.id} as visited (distance: ${distance}m)`);
            visitedAny = true;
          } catch (err) {
            console.error('❌ Failed to mark POI as visited:', err);
          }
        }
      }

      // Only refresh progress if any POIs were actually visited
      if (visitedAny) {
        await refreshProgress();
      }
    };

    const interval = setInterval(checkNearby, 5000);

    return () => clearInterval(interval);
  }, [coords, pois, userId, visitedPOIIds, radiusMeters, refreshProgress]);
}

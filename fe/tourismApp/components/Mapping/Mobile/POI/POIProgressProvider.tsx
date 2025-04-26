import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useAuth } from '~/components/User/AuthContext'; 
import { getUserPOIProgress } from '~/api/poiProgress';
import { useCheckNearbyPOIs } from './useCheckNearbyPOIs';
import { getPOIsForMap } from '~/api/pois'; 
import { useSelectedMap } from '~/components/Mapping/Mobile/SelectedMapContext';

interface POIProgressContextType {
  visitedPOIIds: Set<string>;
  refreshProgress: (force?: boolean) => Promise<void>;
}

const POIProgressContext = createContext<POIProgressContextType>({
  visitedPOIIds: new Set(),
  refreshProgress: async () => {},
});

export const POIProgressProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { selectedMap } = useSelectedMap();
  const [visitedPOIIds, setVisitedPOIIds] = useState<Set<string>>(new Set());
  const [pois, setPOIs] = useState<any[]>([]);
  
  const lastFetchedMapId = useRef<string | null>(null); 
  const hasFetchedOnce = useRef(false);

  const refreshProgress = async (force = false) => {
    if (!user?.id || !selectedMap?.id) return;

    if (!force && lastFetchedMapId.current === selectedMap.id && hasFetchedOnce.current) {
      console.log('Skipping fetch: already loaded for this map.');
      return;
    }

    try {
      const progress = await getUserPOIProgress(user.id);
      const visitedIds = progress.map((record: any) => record.poiId);
      setVisitedPOIIds(new Set(visitedIds));

      const pois = await getPOIsForMap(selectedMap.id);
      setPOIs(pois);

      lastFetchedMapId.current = selectedMap.id;
      hasFetchedOnce.current = true;

    } catch (err) {
      console.error('Failed to refresh POI progress:', err);
    }
  };

  useEffect(() => {
    refreshProgress();
  }, [user?.id, selectedMap?.id]);

  useCheckNearbyPOIs({
    pois,
    userId: user?.id ?? '',
    visitedPOIIds,
    radiusMeters: 25,
    refreshProgress,
  });

  return (
    <POIProgressContext.Provider value={{ visitedPOIIds, refreshProgress }}>
      {children}
    </POIProgressContext.Provider>
  );
};

export function usePOIProgress() {
  return useContext(POIProgressContext);
}

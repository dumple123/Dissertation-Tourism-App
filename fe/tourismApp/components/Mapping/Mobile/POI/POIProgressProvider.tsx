import { useSelectedMap } from '~/components/Mapping/Mobile/SelectedMapContext';
import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { useAuth } from '~/components/User/AuthContext';
import { getUserPOIProgress } from '~/api/poiProgress';
import { getPOIsForMap } from '~/api/pois';
import { useCheckNearbyPOIs } from './useCheckNearbyPOIs';

interface POIProgressContextType {
  visitedPOIIds: Set<string>;
  totalPOIs: number;
  refreshProgress: () => Promise<void>; 
}

const POIProgressContext = createContext<POIProgressContextType>({
  visitedPOIIds: new Set(),
  totalPOIs: 0,
  refreshProgress: async () => {}, 
});

export const POIProgressProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { selectedMap } = useSelectedMap();
  const [visitedPOIIds, setVisitedPOIIds] = useState<Set<string>>(new Set());
  const [pois, setPOIs] = useState<any[]>([]);

  const refreshProgress = async () => {
    if (!user?.id || !selectedMap?.id) return;

    try {
      const [progress, fetchedPOIs] = await Promise.all([
        getUserPOIProgress(user.id),
        getPOIsForMap(selectedMap.id),
      ]);

      const visitedIds = progress.map((record: any) => record.poiId);
      setVisitedPOIIds(new Set(visitedIds));
      setPOIs(fetchedPOIs);

      console.log('Refreshed POIs:', fetchedPOIs.length);
    } catch (err) {
      console.error('Failed to refresh POI progress:', err);
    }
  };

  useEffect(() => {
    if (user?.id && selectedMap?.id) {
      refreshProgress();
    }
  }, [user?.id, selectedMap?.id]);
  

  useCheckNearbyPOIs({
    pois,
    userId: user?.id ?? '',
    visitedPOIIds,
    radiusMeters: 25,
    refreshProgress,
  });

  return (
    <POIProgressContext.Provider value={{
      visitedPOIIds,
      totalPOIs: pois.length,
      refreshProgress,
    }}>
      {children}
    </POIProgressContext.Provider>
  );
};

export function usePOIProgress() {
  return useContext(POIProgressContext);
}

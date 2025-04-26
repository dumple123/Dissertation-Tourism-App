import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '~/components/User/AuthContext'; 
import { getUserPOIProgress } from '~/api/poiProgress';
import { useCheckNearbyPOIs } from './useCheckNearbyPOIs';
import { getPOIsForMap } from '~/api/pois'; 

interface POIProgressContextType {
    visitedPOIIds: Set<string>;
    refreshProgress: () => Promise<void>;
  }

  const POIProgressContext = createContext<POIProgressContextType>({
    visitedPOIIds: new Set(),
    refreshProgress: async () => {}, // <-- Add a no-op async function here
  });

export const POIProgressProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [visitedPOIIds, setVisitedPOIIds] = useState<Set<string>>(new Set());
    const [pois, setPOIs] = useState<any[]>([]);
  
    const refreshProgress = async () => {
      if (!user?.id) return;
      try {
        const progress = await getUserPOIProgress(user.id);
        const visitedIds = progress.map((record: any) => record.poiId);
        setVisitedPOIIds(new Set(visitedIds));
      } catch (err) {
        console.error('Failed to refresh POI progress:', err);
      }
    };
  
    useEffect(() => {
      async function fetchPOIs() {
        try {
          const mapId = "your-default-map-id"; // Change later
          const data = await getPOIsForMap(mapId);
          setPOIs(data);
        } catch (err) {
          console.error('Failed to fetch POIs:', err);
        }
      }
  
      fetchPOIs();
    }, []);
  
    useEffect(() => {
      refreshProgress();
    }, [user?.id]);
  
    useCheckNearbyPOIs({
      pois,
      userId: user?.id ?? '', // always string
      visitedPOIIds,
      radiusMeters: 25,
      refreshProgress, // Pass this into useCheckNearbyPOIs
    });
  
    return (
      <POIProgressContext.Provider value={{ visitedPOIIds, refreshProgress }}>
        {children}
      </POIProgressContext.Provider>
    );
  };

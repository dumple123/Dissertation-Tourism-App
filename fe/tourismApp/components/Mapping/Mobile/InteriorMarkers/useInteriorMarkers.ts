import { useEffect, useState } from 'react';
import { getMarkersForBuilding } from '~/api/interiorMarkers';

export function useInteriorMarkers(buildingId: string | null) {
  const [markers, setMarkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!buildingId) {
      setMarkers([]);
      return;
    }

    setLoading(true);
    getMarkersForBuilding(buildingId)
      .then(setMarkers)
      .catch((err) => {
        console.error('Failed to load interior markers:', err);
        setMarkers([]);
      })
      .finally(() => setLoading(false));
  }, [buildingId]);

  return { markers, loading };
}

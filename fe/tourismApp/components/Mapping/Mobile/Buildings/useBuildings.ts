import { useEffect, useState } from 'react';
import { getBuildingsForMap } from '~/api/building';

export function useBuildings(mapId: string | null) {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapId) return;

    const fetch = async () => {
      try {
        const data = await getBuildingsForMap(mapId);
        setBuildings(data);
      } catch (err: any) {
        console.error('Error loading buildings:', err);
        setError(err.message ?? 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [mapId]);

  return { buildings, loading, error };
}
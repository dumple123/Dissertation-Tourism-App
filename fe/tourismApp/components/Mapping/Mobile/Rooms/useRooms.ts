import { useEffect, useState } from 'react';
import { getRoomsForBuilding } from '~/api/room';

interface Room {
  id: string;
  name: string;
  floor: number;
  buildingId: string;
  accessible: boolean;
  isArea: boolean;
  geojson: any;
}

export function useRooms(buildingId: string | null) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!buildingId) {
      setRooms([]);
      return;
    }

    setLoading(true);
    getRoomsForBuilding(buildingId)
      .then(setRooms)
      .catch((err) => {
        console.error('Failed to load rooms:', err);
        setRooms([]);
      })
      .finally(() => setLoading(false));
  }, [buildingId]);

  return { rooms, loading };
}

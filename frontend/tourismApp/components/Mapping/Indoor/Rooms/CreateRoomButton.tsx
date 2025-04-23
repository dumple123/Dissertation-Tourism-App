import { useDrawingContext } from '../Drawing/useDrawing';
import { useEffect, useState } from 'react';
import { getBuildingById } from '~/api/building';

export default function CreateRoomButton({
  buildingId,
  currentFloor,
}: {
  buildingId: string;
  currentFloor: number;
}) {
  const { startDrawing, setSnapTargets } = useDrawingContext();
  const [buildingGeometry, setBuildingGeometry] = useState<[number, number][][]>([]);

  // Fetch building geometry when button mounts
  useEffect(() => {
    const loadBuilding = async () => {
      try {
        const building = await getBuildingById(buildingId);
        const coordinates = building?.geojson?.geometry?.coordinates;
        if (Array.isArray(coordinates)) {
          // Strip closing vertex from each ring
          const transformed = coordinates.map((ring: [number, number][]) =>
            ring.length > 1 && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]
              ? ring.slice(0, -1)
              : ring
          );
          setBuildingGeometry(transformed);
        }
      } catch (err) {
        console.error('Failed to load building geometry:', err);
      }
    };

    loadBuilding();
  }, [buildingId]);

  const handleClick = () => {
    const name = prompt('Enter room name:');
    if (name?.trim()) {
      startDrawing(`${name.trim()}|${currentFloor}|${buildingId}`);
      setSnapTargets(buildingGeometry);
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        padding: '8px 12px',
        backgroundColor: '#219ebc',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
      }}
    >
      + Add Room
    </button>
  );
}
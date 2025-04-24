import React, { useEffect, useState } from 'react';
import { useDrawingContext } from '../Drawing/useDrawing';
import { getBuildingById } from '~/api/building';
import { getRoomsForBuilding } from '~/api/room';

export default function CreateRoomButton({
  buildingId,
  currentFloor,
}: {
  buildingId: string;
  currentFloor: number;
}) {
  const { startDrawing, setSnapTargets } = useDrawingContext();
  const [buildingGeometry, setBuildingGeometry] = useState<[number, number][][]>([]);

  // Fetch building + existing room geometry on mount
  useEffect(() => {
    const loadBuilding = async () => {
      try {
        const building = await getBuildingById(buildingId);
        const buildingCoords: [number, number][][] = building?.geojson?.geometry?.coordinates || [];

        const rooms: {
          geojson: {
            geometry: {
              coordinates: [number, number][][];
            };
          };
        }[] = await getRoomsForBuilding(buildingId);

        // Extract first ring from each room polygon
        const roomRings = rooms
          .map((r) => r.geojson?.geometry?.coordinates?.[0])
          .filter((ring): ring is [number, number][] => Array.isArray(ring) && ring.length > 2);

        // Merge building outline and room rings, remove closing vertex if present
        const allSnapTargets = [...buildingCoords, ...roomRings].map((ring) =>
          ring.length > 1 && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]
            ? ring.slice(0, -1)
            : ring
        );

        setBuildingGeometry(allSnapTargets);
      } catch (err) {
        console.error('Failed to load building/room geometry:', err);
      }
    };

    loadBuilding();
  }, [buildingId]);

  // Start room drawing with metadata embedded in name string
  const handleClick = () => {
    const name = prompt('Enter room name:');
    if (name?.trim()) {
      setSnapTargets(buildingGeometry); // Set snap targets before drawing starts
      startDrawing(`${name.trim()}|${currentFloor}|${buildingId}`);
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

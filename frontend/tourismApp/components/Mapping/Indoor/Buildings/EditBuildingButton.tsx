import { useDrawingContext } from '../Drawing/useDrawing';
import { getTokens } from '~/utils/tokenUtils';

export default function EditBuildingButton({ buildingId }: { buildingId: string }) {
  const { startDrawing, setRings } = useDrawingContext();

  const handleClick = async () => {
    try {
      const { accessToken } = await getTokens();
      const res = await fetch(`http://localhost:3000/api/buildings/${buildingId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const building = await res.json();
      const name = building.name;
      const coordinates = building.geojson.geometry.coordinates;

      // Start drawing and load building geometry
      startDrawing(name);

      // Remove the closing coordinate from each ring
      const transformed = coordinates.map(
        (ring: [number, number][]) => ring.slice(0, -1)
      );

      setRings(transformed);
    } catch (err) {
      console.error('Error loading building for edit:', err);
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        padding: '8px 12px',
        backgroundColor: '#E9C46A',
        color: '#000',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
      }}
    >
      Edit
    </button>
  );
}

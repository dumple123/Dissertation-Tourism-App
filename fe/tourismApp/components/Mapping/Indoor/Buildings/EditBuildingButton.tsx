import { useDrawingContext } from '../Drawing/useDrawing';
import { getBuildingById } from '~/api/building';

export default function EditBuildingButton({
  buildingId,
  onEditSuccess,
}: {
  buildingId: string;
  onEditSuccess: () => void;
}) {
  const { startDrawing, setRings } = useDrawingContext();

  const handleClick = async () => {
    try {
      const building = await getBuildingById(buildingId);
      const name = building.name;
      const coordinates = building.geojson.geometry.coordinates;

      // Start drawing and load building geometry
      startDrawing(name);

      const transformed = coordinates.map(
        (ring: [number, number][]) => ring.slice(0, -1)
      );
      setRings(transformed);

      onEditSuccess();
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
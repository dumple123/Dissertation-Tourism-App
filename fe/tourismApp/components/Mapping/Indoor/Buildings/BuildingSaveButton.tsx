import { useDrawingContext } from '../Drawing/useDrawing';
import { createBuilding } from '~/api/building';

export default function SaveButton({
  mapId,
  onSaveSuccess,
}: {
  mapId: string;
  onSaveSuccess: () => void;
}) {
  const { rings, buildingName, exitDrawing } = useDrawingContext();

  const handleSave = async () => {
    if (!rings || rings.length === 0) return;

    // Filter out invalid rings (less than 3 points)
    const validRings = rings.filter((ring) => ring.length >= 3);
    if (validRings.length === 0) return;

    const geojson = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: validRings.map((ring) => [...ring, ring[0]]), // ensure closed rings
      },
      properties: {
        name: buildingName,
      },
    };
    try {
      await createBuilding({name: buildingName!, mapId, numFloors: 1, bottomFloor: 0, geojson,});
      alert(`Saved "${buildingName}" to backend!`);
      exitDrawing();
      onSaveSuccess();
    } catch (err) {
      console.error('Failed to save building:', err);
      alert('Failed to save building');
    }
  };

  return (
    <button
      onClick={handleSave}
      style={{
        padding: '8px 12px',
        backgroundColor: '#264653',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        width: '100%',
      }}
    >
      Save Building
    </button>
  );
}
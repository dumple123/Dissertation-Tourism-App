import { useDrawingContext } from '~/components/Mapping/Indoor/Drawing/useDrawing';
import { createRoom } from '~/api/room';

export default function RoomSaveButton() {
  const { rings, roomInfo, completeShape } = useDrawingContext();

  const handleSave = async () => {
    if (!roomInfo || !rings || rings.length === 0) return;

    // Filter out any empty or invalid rings
    const validRings = rings.filter((ring) => ring.length >= 3);
    if (validRings.length === 0) return;

    const geojson = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: validRings.map((ring) => [...ring, ring[0]]), // ensure closed rings
      },
      properties: {},
    };

    try {
      await createRoom({
        name: roomInfo.name,
        floor: roomInfo.floor,
        buildingId: roomInfo.buildingId,
        geojson,
      });

      alert(`Room "${roomInfo.name}" saved successfully.`);
    } catch (err) {
      console.error('Failed to save room:', err);
      alert('Failed to save room');
    }

    completeShape();
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
      Save Room
    </button>
  );
}

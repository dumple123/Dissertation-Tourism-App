import { useDrawingContext } from '~/components/Mapping/Indoor/Drawing/useDrawing';
import { createRoom, updateRoom } from '~/api/room';

export default function RoomSaveButton({ onSaveSuccess }: { onSaveSuccess: () => void }) {
  const {
    rings,
    roomInfo,
    editingRoomId,
    setEditingRoomId,
    completeShape,
    exitDrawing,
  } = useDrawingContext();

  const handleSave = async () => {
    if (!roomInfo || !rings || rings.length === 0) return;

    // Filter out short/invalid rings
    const validRings = rings.filter((ring) => ring.length >= 3);
    if (validRings.length === 0) return;

    // Build GeoJSON object
    const geojson = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: validRings.map((ring) => [...ring, ring[0]]), // Ensure closed rings
      },
      properties: {},
    };

    try {
      if (editingRoomId) {
        // Debug: confirm edit mode
        console.log('Updating room:', editingRoomId);

        // Update existing room
        await updateRoom(editingRoomId, {
          name: roomInfo.name,
          floor: roomInfo.floor,
          buildingId: roomInfo.buildingId,
          geojson,
        });
        alert(`Room "${roomInfo.name}" updated successfully.`);
      } else {
        // Debug: confirm creation mode
        console.log('Creating new room');

        // Create new room
        await createRoom({
          name: roomInfo.name,
          floor: roomInfo.floor,
          buildingId: roomInfo.buildingId,
          geojson,
        });
        alert(`Room "${roomInfo.name}" created successfully.`);
      }

      onSaveSuccess();
    } catch (err) {
      console.error('Failed to save room:', err);
      alert('Failed to save room');
    }

    // Cleanup state
    completeShape();
    setEditingRoomId(null);
    exitDrawing();
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

import { useDrawingContext } from '../Drawing/useDrawing';

export default function CreateRoomButton({
  buildingId,
  currentFloor,
}: {
  buildingId: string;
  currentFloor: number;
}) {
  const { startDrawing } = useDrawingContext();

  const handleClick = () => {
    const name = prompt('Enter room name:');
    if (name?.trim()) {
      // Pass name, floor, and buildingId to the drawing context
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
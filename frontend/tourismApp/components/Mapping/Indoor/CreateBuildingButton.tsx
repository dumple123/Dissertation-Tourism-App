import { useDrawingContext } from './useDrawing';

export default function CreateBuildingButton() {
  const { startDrawing } = useDrawingContext();

  const handleClick = () => {
    const name = prompt('Enter building name:');
    if (name?.trim()) {
      startDrawing(name.trim());
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        padding: '8px 12px',
        backgroundColor: '#E76F51',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
      }}
    >
      Create Building
    </button>
  );
}

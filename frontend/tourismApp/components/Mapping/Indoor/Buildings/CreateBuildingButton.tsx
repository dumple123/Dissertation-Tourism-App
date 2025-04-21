import { useDrawingContext } from '../Drawing/useDrawing';

export default function CreateBuildingButton() {
  const { startDrawing } = useDrawingContext();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const name = prompt('Enter building name:');
    if (name?.trim()) {
      // Defers the drawing start to ensure context and map state is stable
      setTimeout(() => {
        startDrawing(name.trim());
      }, 0);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        padding: '8px 12px',
        backgroundColor: '#264653',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
      }}
    >
      + Create Building
    </button>
  );
}

import { useDrawingContext } from '../Drawing/useDrawing';
import { deleteBuilding } from '~/api/building';

export default function DeleteBuildingButton({
  buildingId,
  onDeleteSuccess,
}: {
  buildingId: string;
  onDeleteSuccess: () => void;
}) {
  const { exitDrawing } = useDrawingContext();

  const handleDelete = async () => {
    const confirmDelete = confirm('Are you sure you want to delete this building?');
    if (!confirmDelete) return;

    try {
      await deleteBuilding(buildingId);
      alert('Building deleted successfully');
      exitDrawing();
      onDeleteSuccess();
    } catch (err) {
      console.error('Delete error:', err);
      alert('An error occurred while deleting');
    }
  };

  return (
    <button
      onClick={handleDelete}
      style={{
        padding: '8px 12px',
        backgroundColor: '#e63946',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
      }}
    >
      Delete
    </button>
  );
}
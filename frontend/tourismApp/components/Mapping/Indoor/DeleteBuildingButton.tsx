import { getTokens } from '~/utils/tokenUtils';
import { useDrawingContext } from './useDrawing';

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
      const { accessToken } = await getTokens();
      const res = await fetch(`http://localhost:3000/api/buildings/${buildingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to delete building:', errorText);
        alert('Failed to delete building');
        return;
      }

      alert('Building deleted successfully');
      exitDrawing(); // now fully exits drawing mode
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

import { useDrawingContext } from './useDrawing';
import { getTokens } from '~/utils/tokenUtils';

export default function SaveButton({ mapId }: { mapId: string }) {
  const { rings, buildingName, completeShape } = useDrawingContext();

  const handleSave = async () => {
    if (!rings || rings.length === 0 || rings[0].length < 3) return;

    const geojson = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: rings.map((ring: any[]) => [...ring, ring[0]]),
      },
      properties: {
        name: buildingName,
      },
    };

    try {
      const { accessToken } = await getTokens();
      if (!accessToken) throw new Error("No access token");

      const response = await fetch('http://localhost:3000/api/buildings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: buildingName,
          mapId,
          numFloors: 1, // Defaulting to 1 floor; adjust if needed
          geojson,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to save building');
      }

      alert(`Saved "${buildingName}" to backend!`);
    } catch (err) {
      console.error('Failed to save building:', err);
      alert('Failed to save building');
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
      Save Building
    </button>
  );
}

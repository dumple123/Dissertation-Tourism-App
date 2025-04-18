import { useDrawingContext } from './useDrawing';

export default function SaveButton() {
  const { rings, buildingName, completeShape } = useDrawingContext();

  const handleSave = () => {
    if (!rings || rings.length === 0 || rings[0].length < 3) return;

    const geojson = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: rings.map((ring) => [...ring, ring[0]]),
      },
      properties: {
        name: buildingName,
      },
    };

    // Save to localStorage
    const existing = localStorage.getItem('savedBuildings');
    const parsed = existing ? JSON.parse(existing) : [];

    parsed.push(geojson);

    localStorage.setItem('savedBuildings', JSON.stringify(parsed));

    alert(`Saved "${buildingName}" locally!`);

    // 🔒 Lock editing
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

import { useDrawingContext } from './useDrawing';

export default function SaveButton() {
  const { rings, buildingName } = useDrawingContext();

  const handleSave = () => {
    if (!rings || rings.length === 0 || rings[0].length < 3) return;

    const geojson = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: rings.map((ring) => [...ring, ring[0]]), // Close each ring
      },
      properties: {
        name: buildingName,
      },
    };

    const blob = new Blob([JSON.stringify(geojson)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${buildingName || 'building'}-outline.geojson`;
    a.click();
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

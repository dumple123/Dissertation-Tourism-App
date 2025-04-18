import { useDrawingContext } from './useDrawing';

export default function SaveButton() {
  const { points, buildingName } = useDrawingContext();

  const handleSave = () => {
    if (points.length < 3) return;

    const geojson = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[...points, points[0]]],
      },
      properties: {
        name: buildingName,
      },
    };

    const blob = new Blob([JSON.stringify(geojson)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'building-outline.geojson';
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

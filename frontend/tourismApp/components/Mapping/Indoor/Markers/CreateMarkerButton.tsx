import { useState } from 'react';
import { createInteriorMarker } from '~/api/interiorMarkers';

interface Props {
  buildingId: string;
  currentFloor: number;
  onMarkerCreated: () => void;
  map: mapboxgl.Map;
}

export default function CreateInteriorMarkerButton({ buildingId, currentFloor, onMarkerCreated, map }: Props) {
  const [isPlacing, setIsPlacing] = useState(false);

  const handlePlaceMarker = () => {
    setIsPlacing(true);

    const clickHandler = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
      const lngLat = e.lngLat;

      // Optional: show confirm dialog
      const label = prompt('Enter label for this marker:');
      if (!label) {
        setIsPlacing(false);
        map.off('click', clickHandler);
        return;
      }

      const type = prompt('Enter marker type (e.g., entrance, lift, stair):') || 'custom';
      const accessible = confirm('Is this marker accessible?');

      createInteriorMarker({
        buildingId,
        floor: currentFloor,
        type,
        label,
        accessible,
        coordinates: [lngLat.lng, lngLat.lat],
      })
        .then(() => {
          alert('Marker created!');
          onMarkerCreated();
        })
        .catch((err) => {
          console.error('Failed to create marker:', err);
          alert('Failed to create marker');
        })
        .finally(() => {
          setIsPlacing(false);
          map.off('click', clickHandler);
        });
    };

    map.once('click', clickHandler);
  };

  return (
    <button
      onClick={handlePlaceMarker}
      disabled={isPlacing}
      style={{
        padding: '8px 12px',
        backgroundColor: '#E76F51',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        width: '100%',
      }}
    >
      {isPlacing ? 'Click on map…' : '+ Add Interior Marker'}
    </button>
  );
}

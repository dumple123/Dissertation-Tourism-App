import { useState } from 'react';
import { createInteriorMarker } from '~/api/interiorMarkers';
import { markerTypes, MarkerType } from '~/components/Mapping/Indoor/Markers/markerTypes';

interface Props {
  buildingId: string;
  currentFloor: number;
  onMarkerCreated: () => void;
  map: mapboxgl.Map;
}

export default function CreateInteriorMarkerButton({
  buildingId,
  currentFloor,
  onMarkerCreated,
  map,
}: Props) {
  const markerKeys = Object.keys(markerTypes) as MarkerType[];
  const [selectedType, setSelectedType] = useState<MarkerType>(markerKeys[0]);
  const [isPlacing, setIsPlacing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handlePlaceMarker = () => {
    if (!selectedType) return alert('Please select a marker type first');
    setIsPlacing(true);

    const clickHandler = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
      const lngLat = e.lngLat;
      const label = prompt(`Enter label (optional):`) || markerTypes[selectedType].label;
      const accessible = confirm('Is this marker accessible?');

      createInteriorMarker({
        buildingId,
        floor: currentFloor,
        type: selectedType,
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
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Marker type selector (icons) */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 8,
        }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {markerKeys
          .slice()
          .reverse()
          .map((type, index) => {
            const isSelected = selectedType === type;
            const visible = expanded || isSelected;
            const typeData = markerTypes[type];
            const icon = typeData.icon;

            return (
              <div
                key={type}
                onClick={() => setSelectedType(type)}
                style={{
                  zIndex: visible ? 10 + index : 0,
                  marginLeft: visible && index !== markerKeys.length - 1 ? 4 : 0,
                  opacity: visible ? 1 : 0,
                  transition: 'all 0.2s ease',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: isSelected ? '#E76F51' : '#fff',
                  border: isSelected ? '2px solid #E76F51' : '1px solid #ccc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {icon ? (
                  <img
                    src={icon}
                    alt={typeData.label}
                    title={typeData.label}
                    style={{ width: 16, height: 16 }}
                  />
                ) : (
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: '#aaa',
                    }}
                    title={typeData.label}
                  />
                )}
              </div>
            );
          })}
      </div>

      {/* Place marker button */}
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
    </div>
  );
}

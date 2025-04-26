import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';

type POIRendererProps = {
  map: mapboxgl.Map;
  pois: any[];
  selectedPOI?: any;
  isEditingPosition?: boolean;
  onPOISelect?: (poi: any) => void;
  onPositionUpdate?: (newCoords: [number, number]) => void;
};

export default function POIRenderer({
  map,
  pois,
  selectedPOI,
  isEditingPosition,
  onPOISelect,
  onPositionUpdate,
}: POIRendererProps) {
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);

  useEffect(() => {
    markers.forEach((m) => m.remove());

    const newMarkers: mapboxgl.Marker[] = pois.map((poi) => {
      const coords = poi.geojson?.coordinates;
      if (!coords || coords.length !== 2) return null;

      const el = document.createElement('div');
      el.style.width = '12px';
      el.style.height = '12px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = poi.hidden ? '#888' : '#F4A261';
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([coords[0], coords[1]])
        .addTo(map);

      if (onPOISelect) {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onPOISelect(poi);
        });
      }

      if (selectedPOI && selectedPOI.id === poi.id && isEditingPosition) {
        marker.setDraggable(true);

        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          if (onPositionUpdate) {
            onPositionUpdate([lngLat.lng, lngLat.lat]);
          }
        });
      }

      return marker;
    }).filter(Boolean) as mapboxgl.Marker[];

    setMarkers(newMarkers);

    return () => {
      newMarkers.forEach((m) => m.remove());
    };
  }, [pois, map, onPOISelect, selectedPOI, isEditingPosition, onPositionUpdate]);

  return null;
}

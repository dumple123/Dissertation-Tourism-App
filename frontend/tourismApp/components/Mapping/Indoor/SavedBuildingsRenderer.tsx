// components/Mapping/Indoor/SavedBuildingsRenderer.tsx
import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import type { FeatureCollection } from 'geojson';

export default function SavedBuildingsRenderer({ map }: { map: mapboxgl.Map }) {
  useEffect(() => {
    const raw = localStorage.getItem('savedBuildings');
    const buildings: FeatureCollection = {
      type: 'FeatureCollection',
      features: raw ? JSON.parse(raw) : [],
    };

    if (!map || buildings.features.length === 0) return;

    const sourceId = 'saved-buildings';

    // Add source if it doesn't exist
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: buildings,
      });

      map.addLayer({
        id: 'saved-buildings-fill',
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': '#E76F51',
          'fill-opacity': 0.2,
        },
      });

      map.addLayer({
        id: 'saved-buildings-outline',
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#E76F51',
          'line-width': 2,
        },
      });
    }

    return () => {
      if (map.getLayer('saved-buildings-fill')) map.removeLayer('saved-buildings-fill');
      if (map.getLayer('saved-buildings-outline')) map.removeLayer('saved-buildings-outline');
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [map]);

  return null;
}

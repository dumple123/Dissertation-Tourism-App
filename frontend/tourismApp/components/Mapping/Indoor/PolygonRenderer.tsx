import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useDrawingContext } from './useDrawing';
import type { Feature, Polygon } from 'geojson';

export default function PolygonRenderer({ map }: { map: mapboxgl.Map }) {
  const { points } = useDrawingContext();

  useEffect(() => {
    if (!map || points.length < 3) return;

    const polygon: Feature<Polygon> = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[...points, points[0]]],
      },
      properties: {},
    };

    // Add or update source
    if (map.getSource('building-outline')) {
      (map.getSource('building-outline') as mapboxgl.GeoJSONSource).setData(polygon);
    } else {
      map.addSource('building-outline', {
        type: 'geojson',
        data: polygon,
      });

      map.addLayer({
        id: 'building-outline-fill',
        type: 'fill',
        source: 'building-outline',
        paint: {
          'fill-color': '#2A9D8F',
          'fill-opacity': 0.3,
        },
      });

      map.addLayer({
        id: 'building-outline-border',
        type: 'line',
        source: 'building-outline',
        paint: {
          'line-color': '#264653',
          'line-width': 2,
        },
      });
    }

    return () => {
      if (map.getLayer('building-outline-fill')) map.removeLayer('building-outline-fill');
      if (map.getLayer('building-outline-border')) map.removeLayer('building-outline-border');
      if (map.getSource('building-outline')) map.removeSource('building-outline');
    };
  }, [map, points]);

  return null;
}

import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useDrawingContext } from './useDrawing';
import type { Feature, Polygon, Point, FeatureCollection } from 'geojson';

export default function PolygonRenderer({ map }: { map: mapboxgl.Map }) {
  const { rings } = useDrawingContext();

  useEffect(() => {
    if (!map || rings.length === 0 || rings[0].length < 1) return;

    // Create polygon feature from current rings
    const polygon: Feature<Polygon> = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: rings.map((ring) => [...ring, ring[0]]),
      },
      properties: {},
    };

    // Create point features for each vertex
    const vertexFeatures: Feature<Point>[] = rings.flatMap((ring) =>
      ring.map((pt) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: pt },
        properties: {},
      }))
    );

    const vertexCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: vertexFeatures,
    };

    // Add or update polygon source/layers
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

    // Add or update vertex source/layer
    if (map.getSource('vertex-points')) {
      (map.getSource('vertex-points') as mapboxgl.GeoJSONSource).setData(vertexCollection);
    } else {
      map.addSource('vertex-points', {
        type: 'geojson',
        data: vertexCollection,
      });

      map.addLayer({
        id: 'vertex-points-layer',
        type: 'circle',
        source: 'vertex-points',
        paint: {
          'circle-radius': 5,
          'circle-color': '#F4A261',
          'circle-stroke-color': '#264653',
          'circle-stroke-width': 1,
        },
      });
    }

    return () => {
      if (map.getLayer('building-outline-fill')) map.removeLayer('building-outline-fill');
      if (map.getLayer('building-outline-border')) map.removeLayer('building-outline-border');
      if (map.getSource('building-outline')) map.removeSource('building-outline');

      if (map.getLayer('vertex-points-layer')) map.removeLayer('vertex-points-layer');
      if (map.getSource('vertex-points')) map.removeSource('vertex-points');
    };
  }, [map, rings]);

  return null;
}

import { useEffect, useRef } from 'react';
import mapboxgl, { Marker } from 'mapbox-gl';
import { useDrawingContext } from './useDrawing';
import type { Feature, Polygon as GeoJsonPolygon } from 'geojson';

interface Props {
  map: mapboxgl.Map;
}

// Renders and manages interactive polygon editing using native Mapbox markers
export default function PolygonRenderer({ map }: Props) {
  const { rings, updatePoint, insertPoint } = useDrawingContext();
  const outerRing = rings[0] || [];

  // References to all markers for cleanup
  const vertexMarkersRef = useRef<Marker[]>([]);
  const midpointMarkersRef = useRef<Marker[]>([]);

  // Initial polygon fill update (triggered by React state change)
  useEffect(() => {
    if (!map.getSource('drawing-polygon') || outerRing.length < 3) return;

    const geojson: Feature<GeoJsonPolygon> = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [outerRing],
      },
      properties: {},
    };

    (map.getSource('drawing-polygon') as mapboxgl.GeoJSONSource).setData(geojson);
  }, [outerRing, map]);

  // Create draggable vertex markers and clickable midpoints
  useEffect(() => {
    // Clean up all previous markers
    vertexMarkersRef.current.forEach(marker => marker.remove());
    midpointMarkersRef.current.forEach(marker => marker.remove());
    vertexMarkersRef.current = [];
    midpointMarkersRef.current = [];

    // Add vertex markers
    outerRing.forEach(([lng, lat], index) => {
      const markerEl = document.createElement('div');
      markerEl.style.width = '10px';
      markerEl.style.height = '10px';
      markerEl.style.borderRadius = '50%';
      markerEl.style.backgroundColor = 'blue';
      markerEl.style.border = '2px solid white';
      markerEl.style.cursor = 'move';

      const marker = new mapboxgl.Marker({
        element: markerEl,
        draggable: true,
      })
        .setLngLat([lng, lat])
        .addTo(map);

      // Smoothly update the polygon fill on drag (without state change)
      marker.on('drag', () => {
        const draggedPosition = marker.getLngLat();
        const tempRing = [...outerRing];
        tempRing[index] = [draggedPosition.lng, draggedPosition.lat];

        const geojson: Feature<GeoJsonPolygon> = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [tempRing],
          },
          properties: {},
        };

        (map.getSource('drawing-polygon') as mapboxgl.GeoJSONSource).setData(geojson);
      });

      // Commit the final position to state when dragging ends
      marker.on('dragend', () => {
        const { lng, lat } = marker.getLngLat();
        updatePoint(index, [lng, lat]);
      });

      vertexMarkersRef.current.push(marker);
    });

    // Add midpoint markers between each pair of vertices
    outerRing.forEach((point, index) => {
      const next = outerRing[(index + 1) % outerRing.length];
      const mid: [number, number] = [
        (point[0] + next[0]) / 2,
        (point[1] + next[1]) / 2,
      ];

      const midEl = document.createElement('div');
      midEl.style.width = '6px';
      midEl.style.height = '6px';
      midEl.style.borderRadius = '50%';
      midEl.style.backgroundColor = 'gray';
      midEl.style.opacity = '0.6';
      midEl.style.border = '1px solid white';
      midEl.style.cursor = 'pointer';

      // Insert a new vertex into the polygon at midpoint
      midEl.onclick = () => insertPoint(index + 1, mid);

      const midpointMarker = new mapboxgl.Marker({ element: midEl })
        .setLngLat(mid)
        .addTo(map);

      midpointMarkersRef.current.push(midpointMarker);
    });

    // Cleanup markers on polygon change or unmount
    return () => {
      vertexMarkersRef.current.forEach(marker => marker.remove());
      midpointMarkersRef.current.forEach(marker => marker.remove());
      vertexMarkersRef.current = [];
      midpointMarkersRef.current = [];
    };
  }, [outerRing, map, updatePoint, insertPoint]);

  return null;
}

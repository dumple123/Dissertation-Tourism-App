import { useEffect, useRef } from 'react';
import mapboxgl, { Marker } from 'mapbox-gl';
import { useDrawingContext } from './useDrawing';
import { useMapStyleReady } from '~/components/Mapping/useMapStyleReady';
import type { Feature, Polygon as GeoJsonPolygon } from 'geojson';

interface Props {
  map: mapboxgl.Map | undefined;
}

export default function PolygonRenderer({ map }: Props) {
  const { rings, updatePoint, insertPoint } = useDrawingContext();

  const vertexMarkersRef = useRef<Marker[]>([]);
  const midpointMarkersRef = useRef<Marker[]>([]);
  const styleReady = useMapStyleReady(map);

  // Update polygon GeoJSON preview
  useEffect(() => {
    if (!map || !styleReady) return;

    const source = map.getSource('drawing-polygon') as mapboxgl.GeoJSONSource | undefined;
    if (!source || rings.length === 0 || rings[0].length < 3) return;

    const geojson: Feature<GeoJsonPolygon> = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: rings,
      },
      properties: {},
    };

    source.setData(geojson);
  }, [map, rings, styleReady]);

  // Render interactive markers for all rings
  useEffect(() => {
    if (!map || !styleReady) return;

    vertexMarkersRef.current.forEach(marker => marker.remove());
    midpointMarkersRef.current.forEach(marker => marker.remove());
    vertexMarkersRef.current = [];
    midpointMarkersRef.current = [];

    rings.forEach((ring, ringIndex) => {
      // Vertex markers
      ring.forEach(([lng, lat], index) => {
        const markerEl = document.createElement('div');
        markerEl.style.cssText = `
          width: 10px; height: 10px; border-radius: 50%;
          background: ${ringIndex === 0 ? 'blue' : 'orange'};
          border: 2px solid white; cursor: move;
        `;

        const marker = new mapboxgl.Marker({ element: markerEl, draggable: true })
          .setLngLat([lng, lat])
          .addTo(map);

        marker.on('drag', () => {
          const { lng, lat } = marker.getLngLat();
          const tempRings = [...rings];
          const tempRing = [...tempRings[ringIndex]];
          tempRing[index] = [lng, lat];
          tempRings[ringIndex] = tempRing;

          const geojson: Feature<GeoJsonPolygon> = {
            type: 'Feature',
            geometry: { type: 'Polygon', coordinates: tempRings },
            properties: {},
          };

          const src = map.getSource('drawing-polygon') as mapboxgl.GeoJSONSource;
          if (src) src.setData(geojson);
        });

        marker.on('dragend', () => {
          const { lng, lat } = marker.getLngLat();
          updatePoint(index, [lng, lat], ringIndex);
        });

        vertexMarkersRef.current.push(marker);
      });

      // Midpoint markers
      ring.forEach((pt, index) => {
        const next = ring[(index + 1) % ring.length];
        const mid: [number, number] = [(pt[0] + next[0]) / 2, (pt[1] + next[1]) / 2];

        const midEl = document.createElement('div');
        midEl.style.cssText = `
          width: 6px; height: 6px; border-radius: 50%;
          background: gray; border: 1px solid white; opacity: 0.6; cursor: pointer;
        `;
        midEl.onclick = () => insertPoint(index + 1, mid, ringIndex);

        const midMarker = new mapboxgl.Marker({ element: midEl })
          .setLngLat(mid)
          .addTo(map);

        midpointMarkersRef.current.push(midMarker);
      });
    });

    return () => {
      vertexMarkersRef.current.forEach(marker => marker.remove());
      midpointMarkersRef.current.forEach(marker => marker.remove());
    };
  }, [map, rings, styleReady, insertPoint, updatePoint]);

  return null;
}

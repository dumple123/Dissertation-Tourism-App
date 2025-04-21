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
  const outerRing = rings[0] || [];

  const vertexMarkersRef = useRef<Marker[]>([]);
  const midpointMarkersRef = useRef<Marker[]>([]);
  const styleReady = useMapStyleReady(map);

  useEffect(() => {
    if (!map || !styleReady) return;

    const source = map.getSource('drawing-polygon') as mapboxgl.GeoJSONSource | undefined;
    if (!source || outerRing.length < 3) return;

    const geojson: Feature<GeoJsonPolygon> = {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [outerRing] },
      properties: {},
    };

    source.setData(geojson);
  }, [map, outerRing, styleReady]);

  useEffect(() => {
    if (!map || !styleReady) return;

    const source = map.getSource('drawing-polygon');
    if (!source) return;

    vertexMarkersRef.current.forEach(marker => marker.remove());
    midpointMarkersRef.current.forEach(marker => marker.remove());
    vertexMarkersRef.current = [];
    midpointMarkersRef.current = [];

    outerRing.forEach(([lng, lat], index) => {
      const markerEl = document.createElement('div');
      markerEl.style.cssText = `
        width: 10px; height: 10px; border-radius: 50%;
        background: blue; border: 2px solid white; cursor: move;
      `;

      const marker = new mapboxgl.Marker({ element: markerEl, draggable: true })
        .setLngLat([lng, lat])
        .addTo(map);

      marker.on('drag', () => {
        const { lng, lat } = marker.getLngLat();
        const tempRing = [...outerRing];
        tempRing[index] = [lng, lat];

        const geojson: Feature<GeoJsonPolygon> = {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [tempRing] },
          properties: {},
        };

        const src = map.getSource('drawing-polygon') as mapboxgl.GeoJSONSource;
        if (src) src.setData(geojson);
      });

      marker.on('dragend', () => {
        const { lng, lat } = marker.getLngLat();
        updatePoint(index, [lng, lat]);
      });

      vertexMarkersRef.current.push(marker);
    });

    outerRing.forEach((pt, index) => {
      const next = outerRing[(index + 1) % outerRing.length];
      const mid: [number, number] = [(pt[0] + next[0]) / 2, (pt[1] + next[1]) / 2];

      const midEl = document.createElement('div');
      midEl.style.cssText = `
        width: 6px; height: 6px; border-radius: 50%;
        background: gray; border: 1px solid white; opacity: 0.6; cursor: pointer;
      `;
      midEl.onclick = () => insertPoint(index + 1, mid);

      const midMarker = new mapboxgl.Marker({ element: midEl })
        .setLngLat(mid)
        .addTo(map);

      midpointMarkersRef.current.push(midMarker);
    });

    return () => {
      vertexMarkersRef.current.forEach(marker => marker.remove());
      midpointMarkersRef.current.forEach(marker => marker.remove());
    };
  }, [map, outerRing, styleReady, insertPoint, updatePoint]);

  return null;
}

import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useDrawingContext } from './useDrawing';
import { useMapStyleReady } from '~/components/Mapping/useMapStyleReady';

export default function DrawingHandler({ map }: { map: mapboxgl.Map }) {
  const { rings, addPoint, completeRing, completeShape, isDrawing } = useDrawingContext();
  const isStyleReady = useMapStyleReady(map); // Use centralized hook to ensure style is loaded

  useEffect(() => {
    if (!map || !isDrawing || !isStyleReady || typeof map.getCanvas !== 'function') return;

    // Safely get canvas and confirm it exists
    const canvas = map.getCanvas?.();
    if (!canvas) return;

    // Setup drawing preview marker (once style is loaded)
    const initializeCursorPreview = () => {
      if (!map.getSource('cursor-point')) {
        map.addSource('cursor-point', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [],
          },
        });

        map.addLayer({
          id: 'cursor-point-layer',
          type: 'circle',
          source: 'cursor-point',
          paint: {
            'circle-radius': 5,
            'circle-color': '#F4A261',
            'circle-stroke-color': '#264653',
            'circle-stroke-width': 1,
          },
        });
      }
    };

    initializeCursorPreview();

    // Drawing utilities
    const project = (pt: [number, number]) => {
      const projected = map.project({ lng: pt[0], lat: pt[1] });
      return [projected.x, projected.y];
    };

    let mouseMoveHandler: ((e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => void) | null = null;

    // Hide default cursor
    canvas.style.cursor = 'none';

    mouseMoveHandler = (e) => {
      let pt: [number, number] = [e.lngLat.lng, e.lngLat.lat];

      const pixelPt = project(pt);
      for (const ring of rings) {
        for (const existing of ring) {
          const pixelExisting = project(existing);
          const dx = pixelExisting[0] - pixelPt[0];
          const dy = pixelExisting[1] - pixelPt[1];
          const distPx = Math.sqrt(dx * dx + dy * dy);

          if (distPx < 10) {
            pt = existing;
            break;
          }
        }
      }

      const source = map.getSource('cursor-point') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: pt },
              properties: {},
            },
          ],
        });
      }
    };

    const handleClick = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
      let pt: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      const currentRing = rings[rings.length - 1];

      const pixelPt = project(pt);
      for (const ring of rings) {
        for (const existing of ring) {
          const pixelExisting = project(existing);
          const dx = pixelExisting[0] - pixelPt[0];
          const dy = pixelExisting[1] - pixelPt[1];
          const distPx = Math.sqrt(dx * dx + dy * dy);

          if (distPx < 10) {
            pt = existing;
            break;
          }
        }
      }

      if (
        currentRing.length > 2 &&
        e.originalEvent.shiftKey
      ) {
        const pixelPt = map.project(pt);
        const pixelFirst = map.project(currentRing[0]);
        const dx = pixelFirst.x - pixelPt.x;
        const dy = pixelFirst.y - pixelPt.y;
        const distPx = Math.sqrt(dx * dx + dy * dy);
      
        if (distPx < 10) {
          completeRing();
          return;
        }
      }

      addPoint(pt);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        completeShape();
      }
    };

    // Attach event listeners
    window.addEventListener('keydown', handleKeyDown);
    map.on('click', handleClick);
    map.on('mousemove', mouseMoveHandler);
    canvas.focus();

    // Cleanup
    return () => {
      map.off('click', handleClick);
      if (mouseMoveHandler) map.off('mousemove', mouseMoveHandler);
      window.removeEventListener('keydown', handleKeyDown);
    
      if (map.getLayer('cursor-point-layer')) map.removeLayer('cursor-point-layer');
      if (map.getSource('cursor-point')) map.removeSource('cursor-point');
    
      // Clear drawing polygon geometry
      const drawingSource = map.getSource('drawing-polygon') as mapboxgl.GeoJSONSource;
      if (drawingSource) {
        drawingSource.setData({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[]],
          },
          properties: {},
        });
      }
    
      canvas.style.cursor = '';
    };
  }, [map, rings, isDrawing, isStyleReady, addPoint, completeRing, completeShape]);

  return null;
}

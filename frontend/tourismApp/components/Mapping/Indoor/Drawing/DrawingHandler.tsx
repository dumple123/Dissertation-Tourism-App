import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useDrawingContext } from './useDrawing';

export default function DrawingHandler({ map }: { map: mapboxgl.Map }) {
  const { rings, addPoint, completeRing, completeShape, isDrawing } = useDrawingContext();

  useEffect(() => {
    if (!map || !isDrawing) return;
  
    const initializeCursorPreview = () => {
      // Only add the source/layer if it doesn't already exist
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
  
    // If style is already loaded, initialize immediately
    if (map.isStyleLoaded()) {
      initializeCursorPreview();
    } else {
      // Otherwise, wait for style to load before initializing
      const handleStyleLoad = () => {
        initializeCursorPreview();
        map.off('style.load', handleStyleLoad); // cleanup
      };
      map.on('style.load', handleStyleLoad);
    }
  
    // Drawing logic continues
    const project = (pt: [number, number]) => {
      const projected = map.project({ lng: pt[0], lat: pt[1] });
      return [projected.x, projected.y];
    };
  
    let mouseMoveHandler: ((e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => void) | null = null;
  
    map.getCanvas().style.cursor = 'none';
  
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
  
      if (currentRing.length > 2) {
        const [fx, fy] = currentRing[0];
        const dist = Math.hypot(fx - pt[0], fy - pt[1]);
        if (dist < 0.0001) {
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
  
    map.getCanvas().addEventListener('keydown', handleKeyDown);
    map.on('click', handleClick);
    map.on('mousemove', mouseMoveHandler);
    map.getCanvas().focus();
  
    return () => {
      map.off('click', handleClick);
      if (mouseMoveHandler) map.off('mousemove', mouseMoveHandler);
      map.getCanvas().removeEventListener('keydown', handleKeyDown);
  
      if (map.getLayer('cursor-point-layer')) map.removeLayer('cursor-point-layer');
      if (map.getSource('cursor-point')) map.removeSource('cursor-point');
  
      map.getCanvas().style.cursor = '';
    };
  }, [map, rings, isDrawing, addPoint, completeRing, completeShape]);  

  return null;
}

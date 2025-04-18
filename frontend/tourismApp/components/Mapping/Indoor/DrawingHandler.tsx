import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useDrawingContext } from './useDrawing';

export default function DrawingHandler({ map }: { map: mapboxgl.Map }) {
  const { rings, addPoint, completeRing, completeShape, isDrawing } = useDrawingContext();

  useEffect(() => {
    if (!map || !isDrawing) return;

    const handleClick = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
      const pt: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      const currentRing = rings[rings.length - 1];

      // If user clicks near the first point of the current ring, close the ring
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
    map.getCanvas().focus(); // to receive key events

    return () => {
      map.off('click', handleClick);
      map.getCanvas().removeEventListener('keydown', handleKeyDown);
    };
  }, [map, rings, isDrawing, addPoint, completeRing, completeShape]);

  return null;
}

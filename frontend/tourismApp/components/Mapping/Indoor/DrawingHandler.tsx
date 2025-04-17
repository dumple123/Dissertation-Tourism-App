import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useDrawingContext } from './useDrawing';

export default function DrawingHandler({ map }: { map: mapboxgl.Map }) {
  const { points, addPoint, completeShape, isDrawing } = useDrawingContext();

  useEffect(() => {
    if (!map || !isDrawing) return;

    const handleClick = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
      const pt: [number, number] = [e.lngLat.lng, e.lngLat.lat];

      // If user clicks near the first point, complete the shape
      if (points.length > 2) {
        const [fx, fy] = points[0];
        const dist = Math.hypot(fx - pt[0], fy - pt[1]);
        if (dist < 0.0001) {
          completeShape();
          return;
        }
      }

      addPoint(pt);
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, points, isDrawing, addPoint, completeShape]);

  return null;
}

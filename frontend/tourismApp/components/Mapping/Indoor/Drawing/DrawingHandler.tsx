import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useDrawingContext } from './useDrawing';
import { useMapStyleReady } from '~/components/Mapping/useMapStyleReady';

export default function DrawingHandler({ map }: { map: mapboxgl.Map }) {
  const {
    rings,
    snapTargets,
    addPoint,
    completeRing,
    completeShape,
    isDrawing,
  } = useDrawingContext();
  const isStyleReady = useMapStyleReady(map);

  const SNAP_THRESHOLD_PX = 12;

  // Compute the nearest point to snap to
  function getSnappedPoint(
    lngLat: [number, number],
    allRings: [number, number][][],
    project: (pt: [number, number]) => [number, number]
  ): [number, number] {
    let pt: [number, number] = lngLat;
    const pixelPt = project(pt);

    // Snap to vertex
    for (const ring of allRings) {
      for (const existing of ring) {
        const pixelExisting = project(existing);
        const dx = pixelExisting[0] - pixelPt[0];
        const dy = pixelExisting[1] - pixelPt[1];
        const distPx = Math.sqrt(dx * dx + dy * dy);
        if (distPx < SNAP_THRESHOLD_PX) {
          return existing;
        }
      }
    }

    // Snap to edge
    let nearestEdgePoint: [number, number] | null = null;
    let minEdgeDist = Infinity;

    for (const ring of allRings) {
      for (let i = 0; i < ring.length; i++) {
        const a = ring[i];
        const b = ring[(i + 1) % ring.length];

        const candidate = nearestPointOnSegment(pt, a, b);
        const projected = project(candidate);
        const dx = projected[0] - pixelPt[0];
        const dy = projected[1] - pixelPt[1];
        const distPx = Math.sqrt(dx * dx + dy * dy);

        if (distPx < minEdgeDist && distPx < SNAP_THRESHOLD_PX) {
          nearestEdgePoint = candidate;
          minEdgeDist = distPx;
        }
      }
    }

    return nearestEdgePoint ?? pt;
  }

  function nearestPointOnSegment(p: [number, number], a: [number, number], b: [number, number]): [number, number] {
    const ax = a[0], ay = a[1];
    const bx = b[0], by = b[1];
    const px = p[0], py = p[1];

    const abx = bx - ax;
    const aby = by - ay;
    const apx = px - ax;
    const apy = py - ay;

    const ab2 = abx * abx + aby * aby;
    const ap_ab = apx * abx + apy * aby;
    const t = Math.max(0, Math.min(1, ab2 === 0 ? 0 : ap_ab / ab2));

    return [ax + abx * t, ay + aby * t];
  }

  useEffect(() => {
    if (!map || !isDrawing || !isStyleReady || typeof map.getCanvas !== 'function') return;

    const canvas = map.getCanvas?.();
    if (!canvas) return;

    canvas.style.cursor = 'none';

    const project = (pt: [number, number]): [number, number] => {
      const projected = map.project({ lng: pt[0], lat: pt[1] });
      return [projected.x, projected.y] as [number, number];
    };
    
    // Setup cursor preview source + layer
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

    const allRings = [...rings, ...snapTargets];

    const handleMouseMove = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
      const pt = getSnappedPoint([e.lngLat.lng, e.lngLat.lat], allRings, project);

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
      const currentRing = rings[rings.length - 1];
      const pt = getSnappedPoint([e.lngLat.lng, e.lngLat.lat], allRings, project);
      const pixelPt = project(pt);

      if (currentRing.length > 2 && e.originalEvent.shiftKey) {
        const pixelFirst = project(currentRing[0]);
        const dx = pixelFirst[0] - pixelPt[0];
        const dy = pixelFirst[1] - pixelPt[1];
        const distPx = Math.sqrt(dx * dx + dy * dy);

        if (distPx < SNAP_THRESHOLD_PX) {
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

    window.addEventListener('keydown', handleKeyDown);
    map.on('click', handleClick);
    map.on('mousemove', handleMouseMove);
    canvas.focus();

    return () => {
      map.off('click', handleClick);
      map.off('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);

      if (map.getLayer('cursor-point-layer')) map.removeLayer('cursor-point-layer');
      if (map.getSource('cursor-point')) map.removeSource('cursor-point');

      canvas.style.cursor = '';
    };
  }, [map, rings, snapTargets, isDrawing, isStyleReady, addPoint, completeRing, completeShape]);

  return null;
}
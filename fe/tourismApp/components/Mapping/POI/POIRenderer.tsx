import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { getPOIsForMap } from '~/api/pois';

type POIRendererProps = {
  map: mapboxgl.Map;
  mapId: string;
  refreshKey?: number;
};

export default function POIRenderer({ map, mapId, refreshKey }: POIRendererProps) {
  const [pois, setPOIs] = useState<any[]>([]);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);

  useEffect(() => {
    const loadPOIs = async () => {
      try {
        const result = await getPOIsForMap(mapId);
        setPOIs(result);
      } catch (err) {
        console.error('Failed to load POIs:', err);
      }
    };

    loadPOIs();
  }, [mapId, refreshKey]);

  useEffect(() => {
    markers.forEach((m) => m.remove());

    const newMarkers: mapboxgl.Marker[] = pois.map((poi) => {
      const coords = poi.geojson?.coordinates;
      if (!coords || coords.length !== 2) return null;

      const el = document.createElement('div');
      el.style.width = '12px';
      el.style.height = '12px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = poi.hidden ? '#888' : '#F4A261';
      el.style.border = '2px solid white';

      return new mapboxgl.Marker({ element: el })
        .setLngLat([coords[0], coords[1]])
        .addTo(map);
    }).filter(Boolean) as mapboxgl.Marker[];

    setMarkers(newMarkers);

    return () => {
      newMarkers.forEach((m) => m.remove());
    };
  }, [pois, map]);

  return null;
}
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface Props {
  map: mapboxgl.Map;
  markers: {
    id: string;
    type: string;
    coordinates: [number, number];
    label?: string;
    accessible?: boolean;
  }[];
}

export default function SavedInteriorMarkersRenderer({ map, markers }: Props) {
  const markerRefs = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    // Clear previous markers
    markerRefs.current.forEach(marker => marker.remove());
    markerRefs.current = [];

    // Add markers to the map
    markers.forEach((markerData) => {
      const el = document.createElement('div');
      el.style.cssText = `
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: ${markerData.accessible ? '#2A9D8F' : '#F4A261'};
        border: 2px solid white;
      `;
      el.title = markerData.label || markerData.type;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(markerData.coordinates)
        .addTo(map);

      markerRefs.current.push(marker);
    });

    return () => {
      markerRefs.current.forEach(marker => marker.remove());
      markerRefs.current = [];
    };
  }, [map, markers]);

  return null;
}
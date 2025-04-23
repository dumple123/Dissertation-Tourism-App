import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { markerTypes, type MarkerTypeInfo, type MarkerType } from '~/components/Mapping/Indoor/Markers/markerTypes';

interface Props {
  map: mapboxgl.Map;
  markers: {
    id: string;
    type: string;
    coordinates: [number, number];
    label?: string;
    accessible?: boolean;
  }[];
  onMarkerSelect?: (marker: any) => void;
}

// Safely access marker type from known types
function getMarkerType(type: string): MarkerTypeInfo {
  return markerTypes[type as MarkerType] ?? markerTypes.other;
}

export default function SavedInteriorMarkersRenderer({ map, markers, onMarkerSelect }: Props) {
  const markerRefs = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    // Remove old markers
    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = [];

    // Render each marker
    markers.forEach((markerData) => {
      const markerType = getMarkerType(markerData.type);

      let el: HTMLElement;

      // Use an image marker if available
      if (markerType.icon) {
        const img = document.createElement('img');
        img.src = markerType.icon;
        img.alt = markerType.label;
        img.title = markerData.label || markerType.label;
        img.style.cssText = `
          width: 24px;
          height: 24px;
          background-color: ${markerData.accessible ? '#2A9D8F' : '#F4A261'};
          border-radius: 50%;
          padding: 2px;
          box-sizing: border-box;
        `;
        el = img;
      } else {
        // Fallback: plain div circle if no icon
        const div = document.createElement('div');
        div.title = markerData.label || markerType.label;
        div.style.cssText = `
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: ${markerData.accessible ? '#2A9D8F' : '#F4A261'};
          border: 2px solid white;
        `;
        el = div;
      }

      el.style.cursor = 'pointer';
      el.onclick = () => {
        if (onMarkerSelect) onMarkerSelect(markerData); // call selection
      };

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(markerData.coordinates)
        .addTo(map);

      markerRefs.current.push(marker);
    });

    return () => {
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
    };
  }, [map, markers]);

  return null;
}

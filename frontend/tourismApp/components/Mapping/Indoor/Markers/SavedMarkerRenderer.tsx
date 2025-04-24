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

function getMarkerType(type: string): MarkerTypeInfo {
  return markerTypes[type as MarkerType] ?? markerTypes.other;
}

export default function SavedInteriorMarkersRenderer({ map, markers, onMarkerSelect }: Props) {
  const markerRefs = useRef<Record<string, { marker: mapboxgl.Marker; el: HTMLElement; shown: boolean }>>({});

  useEffect(() => {
    const updateMarkerVisibility = () => {
      const zoom = map.getZoom();
      const shouldShow = zoom >= 16.5;
  
      for (const id in markerRefs.current) {
        const { el, shown } = markerRefs.current[id];
        if (shouldShow) {
          el.style.display = 'block';
          if (!shown) {
            el.style.opacity = '0';
            requestAnimationFrame(() => {
              el.style.transition = 'opacity 300ms ease-in';
              el.style.opacity = '1';
              markerRefs.current[id].shown = true;
            });
          }
        } else {
          el.style.display = 'none';
        }
      }
    };
  
    map.on('zoom', updateMarkerVisibility);
    updateMarkerVisibility(); // run immediately on mount
  
    return () => {
      map.off('zoom', updateMarkerVisibility);
    };
  }, [map]);

  useEffect(() => {
    // Remove any old markers no longer in use
    Object.keys(markerRefs.current).forEach((id) => {
      if (!markers.find((m) => m.id === id)) {
        markerRefs.current[id].marker.remove();
        delete markerRefs.current[id];
      }
    });

    markers.forEach((markerData) => {
      if (markerRefs.current[markerData.id]) return;

      const markerType = getMarkerType(markerData.type);
      let el: HTMLElement;

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
          opacity: 0;
        `;
        el = img;
      } else {
        const div = document.createElement('div');
        div.title = markerData.label || markerType.label;
        div.style.cssText = `
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: ${markerData.accessible ? '#2A9D8F' : '#F4A261'};
          border: 2px solid white;
          opacity: 0;
        `;
        el = div;
      }

      el.style.cursor = 'pointer';
      el.style.transition = 'opacity 300ms ease-in';
      el.style.display = 'none';

      el.onclick = () => {
        if (onMarkerSelect) onMarkerSelect(markerData);
      };

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(markerData.coordinates)
        .addTo(map);

      markerRefs.current[markerData.id] = { marker, el, shown: false };
      const zoom = map.getZoom();
      if (zoom >= 16.5) {
        el.style.display = 'block';
        el.style.opacity = '0';
        requestAnimationFrame(() => {
          el.style.transition = 'opacity 300ms ease-in';
          el.style.opacity = '1';
          markerRefs.current[markerData.id].shown = true;
        });
      } else {
        el.style.display = 'none';
}
    });

    return () => {
      Object.values(markerRefs.current).forEach(({ marker }) => marker.remove());
      markerRefs.current = {};
    };
  }, [map, markers, onMarkerSelect]);

  return null;
}

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createUserLocationMarker } from './utils/createUserLocationMarker';
import Constants from 'expo-constants';

mapboxgl.accessToken = Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN;

export default function MapViewComponent() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [hasCentered, setHasCentered] = useState(false);
  const markerEl = createUserLocationMarker();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-1.615, 54.978],
      zoom: 14,
    });

    mapRef.current = map;

    map.on('load', () => {
      console.log('🗺️ Map loaded');

      navigator.geolocation.watchPosition(
        (position) => {
          const coords: [number, number] = [
            position.coords.longitude,
            position.coords.latitude,
          ];
          console.log('📍 Position update:', coords);

          if (!markerRef.current) {
            markerRef.current = new mapboxgl.Marker({ element: markerEl })
              .setLngLat(coords)
              .addTo(map);
          } else {
            markerRef.current.setLngLat(coords);
          }

          if (!hasCentered) {
            map.flyTo({ center: coords, zoom: 14 });
            setHasCentered(true);
          }
        },
        (err) => console.warn('Geolocation error:', err),
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 10000,
        }
      );
    });

    return () => map.remove();
  }, []);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100vh' }} />;
}

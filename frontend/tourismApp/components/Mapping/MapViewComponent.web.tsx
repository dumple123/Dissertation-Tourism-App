import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Constants from 'expo-constants';

// Utility imports
import { createUserLocationPuck } from './utils/createUserLocationPuck';
import { usePOIs } from './utils/POI/usePOIs';
import { renderPOIs } from './utils/POI/renderPOIs';
import { createPOI } from './utils/POI/createPOI';

// Set Mapbox access token from environment config
mapboxgl.accessToken = Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN;

export default function MapViewComponent() {
  // DOM reference for the map container
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Internal references to the map and puck manager
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const puckRef = useRef<ReturnType<typeof createUserLocationPuck> | null>(null);

  // Hook to manage POIs (state + add function)
  const { pois, addPOI } = usePOIs();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create the Mapbox map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-1.615, 54.978], // Default center: Newcastle
      zoom: 14,
    });

    mapRef.current = map;

    map.on('load', () => {
      console.log('Map loaded');

      // Create and set up the simple puck marker
      puckRef.current = createUserLocationPuck(map);

      // Track and update location
      navigator.geolocation.watchPosition(
        (position) => {
          const coords: [number, number] = [
            position.coords.longitude,
            position.coords.latitude,
          ];
          puckRef.current?.update(coords);
        },
        (err) => console.warn('Geolocation error:', err),
        { enableHighAccuracy: true }
      );
    });

    return () => map.remove();
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const markers = renderPOIs(pois, mapRef.current);
    return () => markers.forEach((m) => m.remove());
  }, [pois]);

  return (
    <>
      {/* Map container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100vh' }} />

      {/* Floating button to add a POI based on current location */}
      <button
        onClick={() => createPOI(addPOI)}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 10,
          padding: '8px 12px',
          backgroundColor: '#2A9D8F',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        Add POI
      </button>
    </>
  );
}

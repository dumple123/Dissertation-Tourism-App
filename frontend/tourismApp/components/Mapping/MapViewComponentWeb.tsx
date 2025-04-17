import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Constants from 'expo-constants';

// Utility imports
import { createUserLocationPuck } from './utils/createUserLocationPuck';
import { usePOIs } from './utils/POI/usePOIs';
import { renderPOIs } from './utils/POI/renderPOIs';
import { createPOI } from './utils/POI/createPOI';
import { useUserLocation } from './Hooks/useUserLocation';

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

  // Hook to get user location
  const { coords, error } = useUserLocation();

  useEffect(() => {
    const containerElement = mapContainerRef.current;
    if (!containerElement || !coords) return;

    if (!mapboxgl.accessToken) {
      console.warn('Missing Mapbox access token!');
    }

    const map = new mapboxgl.Map({
      container: containerElement as HTMLElement, // Ensure type compatibility
      style: 'mapbox://styles/mapbox/streets-v11',
      center: coords,
      zoom: 14,
    });

    mapRef.current = map;

    map.on('load', () => {
      console.log('Map loaded');

      // Create and set up the simple puck marker
      puckRef.current = createUserLocationPuck(map);

      // Update puck location when coords change
      puckRef.current?.update(coords);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [coords]);

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
        aria-label="Add Point of Interest"
      >
        Add POI
      </button>

      {/* Optional: display error if location fails */}
      {error && (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            backgroundColor: '#fff3f3',
            padding: 10,
            borderRadius: 8,
            color: '#cc0000',
            textAlign: 'center',
          }}
        >
          Location error: {error}
        </div>
      )}
    </>
  );
}

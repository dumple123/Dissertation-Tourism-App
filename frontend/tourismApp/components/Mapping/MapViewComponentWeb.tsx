import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Constants from 'expo-constants';

// Hooks & utilities
import { createUserLocationPuck } from './utils/createUserLocationPuck';
import { usePOIs } from './utils/POI/usePOIs';
import { renderPOIs } from './utils/POI/renderPOIs';
import { createPOI } from './utils/POI/createPOI';
import { useUserLocation } from './Hooks/useUserLocation';

// Indoor drawing tools
import {
  DrawingProvider,
  DrawingHandler,
  PolygonRenderer,
  SaveButton,
  useDrawingContext,
} from '~/components/Mapping/Indoor';
import CreateBuildingButton from '~/components/Mapping/Indoor/CreateBuildingButton';

// Set Mapbox access token from environment config
mapboxgl.accessToken = Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN;

function DrawingTools({ map }: { map: mapboxgl.Map }) {
  const { isDrawing } = useDrawingContext();

  if (!isDrawing) return null;

  return (
    <>
      <DrawingHandler map={map} />
      <PolygonRenderer map={map} />
      <SaveButton />
    </>
  );
}

export default function MapViewComponent() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const puckRef = useRef<ReturnType<typeof createUserLocationPuck> | null>(null);

  const { pois, addPOI } = usePOIs();
  const { coords, error } = useUserLocation();

  // Initialize map when coordinates are available
  useEffect(() => {
    const containerElement = mapContainerRef.current;
    if (!containerElement || !coords) return;

    if (!mapboxgl.accessToken) {
      console.warn('Missing Mapbox access token!');
    }

    const map = new mapboxgl.Map({
      container: containerElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: coords,
      zoom: 14,
    });

    mapRef.current = map;

    map.on('load', () => {
      console.log('Map loaded');

      // Create and update user location puck
      puckRef.current = createUserLocationPuck(map);
      puckRef.current?.update(coords);
    });

    return () => {
      map.remove();
    };
  }, [coords]);

  // Render POIs
  useEffect(() => {
    if (!mapRef.current) return;

    const markers = renderPOIs(pois, mapRef.current);
    return () => markers.forEach((m) => m.remove());
  }, [pois]);

  return (
    <DrawingProvider>
      {/* Map container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100vh' }} />

      {/* Drawing UI, only if drawing has been started */}
      {mapRef.current && <DrawingTools map={mapRef.current} />}

      {/* Create Building Button */}
      <CreateBuildingButton />

      {/* Add POI button */}
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

      {/* Optional: location error */}
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
    </DrawingProvider>
  );
}

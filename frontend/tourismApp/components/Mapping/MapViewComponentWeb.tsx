import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Constants from 'expo-constants';
import { createUserLocationPuck } from './utils/createUserLocationPuck';
import { renderPOIs } from './utils/POI/renderPOIs';
import { createPOI } from './utils/POI/createPOI';
import { useUserLocation } from './Hooks/useUserLocation';
import { usePOIs } from './utils/POI/usePOIs';
import {
  DrawingProvider,
  DrawingHandler,
  PolygonRenderer,
  SaveButton,
} from '~/components/Mapping/Indoor';
import { useDrawingContext } from '~/components/Mapping/Indoor/useDrawing';
import CreateBuildingButton from '~/components/Mapping/Indoor/CreateBuildingButton';

mapboxgl.accessToken = Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN;

function InnerMapComponent() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const puckRef = useRef<ReturnType<typeof createUserLocationPuck> | null>(null);

  const { coords, error } = useUserLocation();
  const { pois, addPOI } = usePOIs();
  const { isDrawing } = useDrawingContext();

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || !coords) return;

    const map = new mapboxgl.Map({
      container,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: coords,
      zoom: 14,
    });

    mapRef.current = map;

    map.on('load', () => {
      puckRef.current = createUserLocationPuck(map);
      puckRef.current?.update(coords);
    });

    return () => map.remove();
  }, [coords]);

  useEffect(() => {
    if (!mapRef.current) return;
    const markers = renderPOIs(pois, mapRef.current);
    return () => markers.forEach((m) => m.remove());
  }, [pois]);

  return (
    <>
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100vh',
          cursor: isDrawing ? 'crosshair' : 'grab',
        }}
      />

      {/* Drawing tools */}
      {mapRef.current && isDrawing && (
        <>
          <DrawingHandler map={mapRef.current} />
          <PolygonRenderer map={mapRef.current} />
          <div
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              zIndex: 10,
            }}
          >
            <SaveButton />
          </div>
        </>
      )}

      {/* Top-right button stack */}
      {!isDrawing && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            alignItems: 'flex-end',
          }}
        >
          <button
            onClick={() => createPOI(addPOI)}
            style={{
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
          <CreateBuildingButton />
        </div>
      )}

      {/* Error message */}
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

export default function MapViewComponent() {
  return (
    <DrawingProvider>
      <InnerMapComponent />
    </DrawingProvider>
  );
}

import React, { useEffect, useRef, useState } from 'react';
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
import SavedBuildingsRenderer from '~/components/Mapping/Indoor/SavedBuildingsRenderer';
import SelectMapDropdown from '~/components/Mapping/SelectMapDropdown';

// Set the Mapbox access token from Expo config
mapboxgl.accessToken = Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN;

function InnerMapComponent() {
  const mapContainerRef = useRef<HTMLDivElement>(null); // DOM ref for map container
  const mapRef = useRef<mapboxgl.Map | null>(null);     // Ref for the Mapbox map instance
  const puckRef = useRef<ReturnType<typeof createUserLocationPuck> | null>(null); // Ref for user puck

  const { coords, error } = useUserLocation(); // User's current coordinates
  const { pois, addPOI } = usePOIs(); // POIs from local state
  const { isDrawing, completeRing } = useDrawingContext(); // Drawing context

  const [selectedMap, setSelectedMap] = useState<{ id: string; name: string } | null>(null); // Currently selected map

  // Log useful info for debugging
  console.log('User coords:', coords);
  console.log('Location error:', error);

  // Initialize the map once coordinates are available
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

    // Add user location puck when the map loads
    map.on('load', () => {
      puckRef.current = createUserLocationPuck(map);
      puckRef.current?.update(coords);
    });

    return () => map.remove();
  }, [coords]);

  // Render POIs when they change
  useEffect(() => {
    if (!mapRef.current) return;
    const markers = renderPOIs(pois, mapRef.current);
    return () => markers.forEach((m) => m.remove());
  }, [pois]);

  // Show loading screen while waiting for location
  if (!coords && !error) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p>Loading map…</p>
      </div>
    );
  }

  return (
    <>
      {/* Dropdown to select or create a map */}
      <SelectMapDropdown onSelectMap={setSelectedMap} />

      {/* Main map container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100vh',
          backgroundColor: '#e0e0e0',
          cursor: isDrawing ? 'crosshair' : 'grab',
        }}
      />

      {/* Render saved buildings only after a map is selected and map is initialized */}
      {mapRef.current && selectedMap && (
        <SavedBuildingsRenderer map={mapRef.current} mapId={selectedMap.id} />
      )}

      {/* Render drawing controls and buttons only if a map is selected */}
      {selectedMap && (
        <>
          {/* Show drawing handlers when in drawing mode */}
          {mapRef.current && isDrawing && (
            <>
              <DrawingHandler map={mapRef.current} />
              <PolygonRenderer map={mapRef.current} />
            </>
          )}

          {/* UI controls for adding POIs and buildings */}
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
            {mapRef.current && isDrawing ? (
              <>
                <SaveButton mapId={selectedMap.id} />
                <button
                  onClick={() => completeRing()}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#F4A261',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  + Add Hole
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </>
      )}

      {/* Show location error message if location failed */}
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

// Wrap the entire map in DrawingProvider context
export default function MapViewComponent() {
  return (
    <DrawingProvider>
      <InnerMapComponent />
    </DrawingProvider>
  );
}

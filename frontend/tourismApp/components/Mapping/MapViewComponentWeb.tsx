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
} from '~/components/Mapping/Indoor/Drawing';
import { useDrawingContext } from '~/components/Mapping/Indoor/Drawing/useDrawing';
import CreateBuildingButton from '~/components/Mapping/Indoor/Buildings/CreateBuildingButton';
import SavedBuildingsRenderer from '~/components/Mapping/Indoor/Buildings/SavedBuildingsRenderer';
import SelectMapDropdown from '~/components/Mapping/SelectMapDropdown';
import BuildingSidebar from '~/components/Mapping/Indoor/Buildings/BuildingSidebar';
import EditBuildingButton from '~/components/Mapping/Indoor/Buildings/EditBuildingButton';
import DeleteBuildingButton from '~/components/Mapping/Indoor/Buildings/DeleteBuildingButton';

// Set the Mapbox access token from Expo config
type MapRef = mapboxgl.Map;
mapboxgl.accessToken = Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN;

function InnerMapComponent() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapRef | null>(null);
  const puckRef = useRef<ReturnType<typeof createUserLocationPuck> | null>(null);

  const { coords, error } = useUserLocation();
  const { pois, addPOI } = usePOIs();
  const { isDrawing, completeRing } = useDrawingContext();

  const [selectedMap, setSelectedMap] = useState<{ id: string; name: string } | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<{ name: string; id: string } | null>(null);
  const [buildingRefreshKey, setBuildingRefreshKey] = useState(0); // Triggers map refresh when a building is deleted

  // Initialize the map once user coordinates are available
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
      // Add user location puck
      puckRef.current = createUserLocationPuck(map);
      puckRef.current?.update(coords);

      // Add drawing polygon source and layers if not already present
      if (!map.getSource('drawing-polygon')) {
        map.addSource('drawing-polygon', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: { type: 'Polygon', coordinates: [[]] },
            properties: {},
          },
        });

        map.addLayer({
          id: 'drawing-polygon-fill',
          type: 'fill',
          source: 'drawing-polygon',
          paint: {
            'fill-color': '#2A9D8F',
            'fill-opacity': 0.3,
          },
        });

        map.addLayer({
          id: 'drawing-polygon-outline',
          type: 'line',
          source: 'drawing-polygon',
          paint: {
            'line-color': '#264653',
            'line-width': 2,
          },
        });
      }

      // Show building metadata on click
      map.on('click', 'saved-buildings-fill', (e) => {
        const feature = e.features?.[0];
        const name = feature?.properties?.name;
        const id = feature?.properties?.id;

        if (!isDrawing && name && id) {
          setSelectedBuilding({ name, id });
        }
      });

      // Clear metadata when clicking elsewhere
      map.on('click', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['saved-buildings-fill'],
        });

        if (features.length === 0) {
          setSelectedBuilding(null);
        }
      });
    });

    return () => map.remove();
  }, [coords]);

  // Render POIs each time they update
  useEffect(() => {
    if (!mapRef.current) return;
    const markers = renderPOIs(pois, mapRef.current);
    return () => markers.forEach((m) => m.remove());
  }, [pois]);

  // Show loading indicator if location is still being fetched
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
      {/* Map selection dropdown */}
      <SelectMapDropdown onSelectMap={setSelectedMap} />

      {/* Map container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100vh',
          backgroundColor: '#e0e0e0',
          cursor: isDrawing ? 'crosshair' : 'grab',
        }}
      />

      {/* Building metadata sidebar */}
      {selectedBuilding && (
        <BuildingSidebar
          name={selectedBuilding.name}
          id={selectedBuilding.id}
          onDeleteSuccess={() => {
            setSelectedBuilding(null); // Close the sidebar on delete
            setBuildingRefreshKey((prev) => prev + 1); // Trigger SavedBuildingsRenderer reload
          }}
        />
      )}

      {/* Render saved buildings if a map is selected */}
      {mapRef.current && selectedMap && (
        <SavedBuildingsRenderer
          key={buildingRefreshKey} // Key forces re-render when incremented
          map={mapRef.current}
          mapId={selectedMap.id}
        />
      )}

      {/* Drawing and interaction controls */}
      {selectedMap && (
        <>
          {mapRef.current && isDrawing && (
            <>
              <DrawingHandler map={mapRef.current} />
              <PolygonRenderer map={mapRef.current} />
            </>
          )}

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

      {/* Display location error if one exists */}
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

// Wrap map component with drawing context
export default function MapViewComponent() {
  return (
    <DrawingProvider>
      <InnerMapComponent />
    </DrawingProvider>
  );
}

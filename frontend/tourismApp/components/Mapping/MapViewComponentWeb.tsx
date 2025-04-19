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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const puckRef = useRef<ReturnType<typeof createUserLocationPuck> | null>(null);

  const { coords, error } = useUserLocation();
  const { pois, addPOI } = usePOIs();
  const { isDrawing, completeRing } = useDrawingContext();

  const [selectedMap, setSelectedMap] = useState<{ id: string; name: string } | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<{ name: string } | null>(null); // Tracks clicked building

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

      if (!map.getSource('drawing-polygon')) {
        map.addSource('drawing-polygon', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[]],
            },
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

      // Show metadata when a building is clicked
      map.on('click', 'saved-buildings-fill', (e) => {
        const feature = e.features?.[0];
        const name = feature?.properties?.name;

        if (!isDrawing && name) {
          setSelectedBuilding({ name });
        }
      });

      // Clear metadata if clicking anywhere else
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

  useEffect(() => {
    if (!mapRef.current) return;
    const markers = renderPOIs(pois, mapRef.current);
    return () => markers.forEach((m) => m.remove());
  }, [pois]);

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
      <SelectMapDropdown onSelectMap={setSelectedMap} />

      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100vh',
          backgroundColor: '#e0e0e0',
          cursor: isDrawing ? 'crosshair' : 'grab',
        }}
      />

      {/* Metadata sidebar for selected building */}
      {selectedBuilding && (
        <div
          style={{
            position: 'absolute',
            top: 80,
            left: 20,
            backgroundColor: '#ffffff',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 11,
            minWidth: 200,
          }}
        >
          <h3 style={{ margin: 0, marginBottom: 8, fontSize: 16 }}>
            {selectedBuilding.name}
          </h3>
        </div>
      )}

      {mapRef.current && selectedMap && (
        <SavedBuildingsRenderer map={mapRef.current} mapId={selectedMap.id} />
      )}

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

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
} from '~/components/Mapping/Indoor/Drawing';
import SaveButton from '~/components/Mapping/Indoor/Rooms/RoomSaveButton';
import RoomSaveButton from '~/components/Mapping/Indoor/Rooms/RoomSaveButton';
import { useDrawingContext } from '~/components/Mapping/Indoor/Drawing/useDrawing';

import CreateBuildingButton from '~/components/Mapping/Indoor/Buildings/CreateBuildingButton';
import CreateRoomButton from '~/components/Mapping/Indoor/Rooms/CreateRoomButton';
import SavedBuildingsRenderer from '~/components/Mapping/Indoor/Buildings/SavedBuildingsRenderer';
import SelectMapDropdown from '~/components/Mapping/SelectMapDropdown';
import BuildingSidebar from '~/components/Mapping/Indoor/Buildings/BuildingSidebar';
import FloorSelector from '~/components/Mapping/Indoor/Buildings/FloorSelector';
import { getRoomsForBuilding } from '~/api/room';

// Set the Mapbox access token from Expo config
type MapRef = mapboxgl.Map;
mapboxgl.accessToken = Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN;

function InnerMapComponent() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapRef | null>(null);
  const puckRef = useRef<ReturnType<typeof createUserLocationPuck> | null>(null);

  const { coords, error } = useUserLocation();
  const { pois, addPOI } = usePOIs();
  const { isDrawing, completeRing, roomInfo } = useDrawingContext();

  const [selectedMap, setSelectedMap] = useState<{ id: string; name: string } | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<{ name: string; id: string } | null>(null);
  const [buildingRefreshKey, setBuildingRefreshKey] = useState(0);

  const [availableFloors, setAvailableFloors] = useState<number[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number>(0);

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

    map.on('load', () => {
      // Add user location indicator
      puckRef.current = createUserLocationPuck(map);
      puckRef.current?.update(coords);

      // Setup source/layers for active polygon drawing
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

      // Handle building click
      map.on('click', 'saved-buildings-fill', (e) => {
        const feature = e.features?.[0];
        const name = feature?.properties?.name;
        const id = feature?.properties?.id;

        if (!isDrawing && name && id) {
          setSelectedBuilding({ name, id });
        }
      });

      // Deselect building when clicking elsewhere
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

  // Render POIs when they update
  useEffect(() => {
    if (!mapRef.current) return;
    const markers = renderPOIs(pois, mapRef.current);
    return () => markers.forEach((m) => m.remove());
  }, [pois]);

  // Load available floors from rooms for selected building
  useEffect(() => {
    const loadFloors = async () => {
      if (!selectedBuilding) {
        setAvailableFloors([]);
        return;
      }

      try {
        const rooms = await getRoomsForBuilding(selectedBuilding.id);
        const uniqueFloors = Array.from(new Set(rooms.map((r: any) => r.floor))) as number[];
        setAvailableFloors(uniqueFloors);

        if (!uniqueFloors.includes(selectedFloor)) {
          setSelectedFloor(uniqueFloors[0] ?? 0);
        }
      } catch (err) {
        console.error('Failed to fetch room floors:', err);
      }
    };

    loadFloors();
  }, [selectedBuilding]);

  // Show loading indicator while coordinates are resolving
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

      {/* Mapbox container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100vh',
          backgroundColor: '#e0e0e0',
          cursor: isDrawing ? 'crosshair' : 'grab',
        }}
      />

      {/* Building sidebar */}
      {selectedBuilding && (
        <BuildingSidebar
          name={selectedBuilding.name}
          id={selectedBuilding.id}
          onDeleteSuccess={() => {
            setSelectedBuilding(null);
            setBuildingRefreshKey((prev) => prev + 1);
          }}
        />
      )}

      {/* Floor selector */}
      {selectedBuilding && availableFloors.length > 0 && (
        <FloorSelector
          availableFloors={availableFloors}
          selectedFloor={selectedFloor}
          onSelect={setSelectedFloor}
        />
      )}

      {/* Saved building polygons */}
      {mapRef.current && selectedMap && (
        <SavedBuildingsRenderer
          key={buildingRefreshKey}
          map={mapRef.current}
          mapId={selectedMap.id}
        />
      )}

      {/* Drawing tools and buttons */}
      {selectedMap && (
        <>
          {mapRef.current && isDrawing && (
            <>
              <DrawingHandler map={mapRef.current} />
              <PolygonRenderer map={mapRef.current} />
            </>
          )}

          {/* Top right button stack */}
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
            {/* Show correct save button depending on drawing context */}
            {mapRef.current && isDrawing ? (
              <>
                {roomInfo ? (
                  <RoomSaveButton />
                ) : (
                  <SaveButton />
                )}
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

                {/* Show room or building creation button */}
                {selectedBuilding ? (
                  <CreateRoomButton
                    buildingId={selectedBuilding.id}
                    currentFloor={selectedFloor}
                  />
                ) : (
                  <CreateBuildingButton />
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Display location error if present */}
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

// Top-level map component with drawing context
export default function MapViewComponent() {
  return (
    <DrawingProvider>
      <InnerMapComponent />
    </DrawingProvider>
  );
}

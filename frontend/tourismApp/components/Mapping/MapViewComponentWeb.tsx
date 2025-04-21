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
import BuildingSaveButton from '~/components/Mapping/Indoor/Buildings/BuildingSaveButton';
import RoomSaveButton from '~/components/Mapping/Indoor/Rooms/RoomSaveButton';
import { useDrawingContext } from '~/components/Mapping/Indoor/Drawing/useDrawing';

import CreateBuildingButton from '~/components/Mapping/Indoor/Buildings/CreateBuildingButton';
import CreateRoomButton from '~/components/Mapping/Indoor/Rooms/CreateRoomButton';
import SavedBuildingsRenderer from '~/components/Mapping/Indoor/Buildings/SavedBuildingsRenderer';
import SelectMapDropdown from '~/components/Mapping/SelectMapDropdown';
import BuildingSidebar from '~/components/Mapping/Indoor/Buildings/BuildingSidebar';
import FloorSelector from '~/components/Mapping/Indoor/Buildings/FloorSelector';

import { getBuildingById } from '~/api/building';
import { useMapStyleReady } from '~/components/Mapping/useMapStyleReady';

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
  const [selectedBuilding, setSelectedBuilding] = useState<{
    id: string;
    name: string;
    bottomFloor: number;
    numFloors: number;
  } | null>(null);
  const [buildingRefreshKey, setBuildingRefreshKey] = useState(0);

  const [availableFloors, setAvailableFloors] = useState<number[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number>(0);

  // Wait for the map style to be ready before interacting with layers
  const styleReady = useMapStyleReady(mapRef.current ?? undefined);

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
      // Add user location puck
      puckRef.current = createUserLocationPuck(map);
      puckRef.current?.update(coords);
    });

    return () => map.remove();
  }, [coords]);

  // Map click handler to select or deselect buildings
  useEffect(() => {
    // Ensure the map is ready before attaching listeners
    if (!mapRef.current || !styleReady) return;
  
    const map = mapRef.current;
  
    const handleClick = async (e: mapboxgl.MapMouseEvent) => {
      if (isDrawing) return;
  
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['saved-buildings-fill'],
      });
  
      if (features.length > 0) {
        const feature = features[0];
        const id = feature?.properties?.id;
  
        if (id) {
          try {
            const data = await getBuildingById(id);
            setSelectedBuilding({
              id: data.id,
              name: data.name,
              numFloors: data.numFloors,
              bottomFloor: data.bottomFloor,
            });
          } catch (err) {
            console.error('Failed to fetch building metadata:', err);
          }
        }
      } else {
        setSelectedBuilding(null);
      }
    };
  
    // Attach click listener
    map.on('click', handleClick);
  
    // Clean up listener on unmount or dependency change
    return () => {
      map.off('click', handleClick);
    };
  }, [styleReady, isDrawing]);

  // Render POIs when they update
  useEffect(() => {
    if (!mapRef.current) return;
    const markers = renderPOIs(pois, mapRef.current);
    return () => markers.forEach((m) => m.remove());
  }, [pois]);

  // Generate available floor numbers from selected building
  useEffect(() => {
    if (!selectedBuilding) return;

    const { bottomFloor, numFloors } = selectedBuilding;

    if (
      typeof bottomFloor === 'number' &&
      typeof numFloors === 'number' &&
      numFloors > 0
    ) {
      const floors = Array.from({ length: numFloors }, (_, i) => bottomFloor + i);
      setAvailableFloors(floors);

      if (!floors.includes(selectedFloor)) {
        setSelectedFloor(floors[0]);
      }
    } else {
      setAvailableFloors([]);
    }
  }, [selectedBuilding]);

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
            setSelectedBuilding(null);
            setBuildingRefreshKey((prev) => prev + 1);
          }}
        />
      )}

      {/* Floor selector (based on selected building metadata) */}
      {selectedBuilding && availableFloors.length > 0 && (
        <FloorSelector
          availableFloors={availableFloors}
          selectedFloor={selectedFloor}
          onSelect={setSelectedFloor}
        />
      )}

      {/* Render saved buildings for the selected map */}
      {mapRef.current && selectedMap && (
        <SavedBuildingsRenderer
          key={buildingRefreshKey}
          map={mapRef.current}
          mapId={selectedMap.id}
        />
      )}

      {/* Drawing tools and controls */}
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
            {/* Show correct save button based on context */}
            {mapRef.current && isDrawing ? (
              <>
                {roomInfo ? (
                  <RoomSaveButton />
                ) : (
                  <BuildingSaveButton mapId={selectedMap.id} />
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

// Wrap component in drawing context
export default function MapViewComponent() {
  return (
    <DrawingProvider>
      <InnerMapComponent />
    </DrawingProvider>
  );
}

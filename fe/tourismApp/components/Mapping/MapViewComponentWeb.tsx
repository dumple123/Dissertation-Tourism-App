import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Constants from 'expo-constants';

import { createUserLocationPuck } from './utils/createUserLocationPuck';
import { useUserLocation } from './Hooks/useUserLocation';
import { getMarkersForBuilding, deleteInteriorMarker } from '~/api/interiorMarkers';
import { createPOI } from '~/api/pois';

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
import SavedRoomsRenderer from './Indoor/Rooms/SavedRoomsRenderer';
import SelectMapDropdown from '~/components/Mapping/SelectMapDropdown';
import BuildingSidebar from '~/components/Mapping/Indoor/Buildings/BuildingSidebar';
import RoomSidebar from '~/components/Mapping/Indoor/Rooms/RoomSidebar';
import FloorSelector from '~/components/Mapping/Indoor/Buildings/FloorSelector';
import CreateInteriorMarkerButton from '~/components/Mapping/Indoor/Markers/CreateMarkerButton';
import SavedInteriorMarkersRenderer from '~/components/Mapping/Indoor/Markers/SavedMarkerRenderer';
import FloorImageOverlayButton from '~/components/Mapping/Indoor/Stencil/FloorImageOverlayButton';
import CreatePOIButton from '~/components/Mapping/POI/CreatePOIButton';

import { getBuildingsForMap, getBuildingById } from '~/api/building';
import { getRoomsForBuilding } from '~/api/room';
import { useMapStyleReady } from '~/components/Mapping/useMapStyleReady';

// Set Mapbox access token from Expo config
mapboxgl.accessToken = Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN;

function InnerMapComponent() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const puckRef = useRef<ReturnType<typeof createUserLocationPuck> | null>(null);
  const selectedRoomsRef = useRef<any[]>([]);
  const [placingPOI, setPlacingPOI] = useState(false);
  const [ghostPOICoords, setGhostPOICoords] = useState<{ lng: number; lat: number } | null>(null);

  const { coords, error } = useUserLocation();
  const { isDrawing, completeRing, roomInfo } = useDrawingContext();
  const styleReady = useMapStyleReady(mapRef.current ?? undefined);

  // Map and selection state
  const [selectedMap, setSelectedMap] = useState<{ id: string; name: string } | null>(null);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [roomsByBuilding, setRoomsByBuilding] = useState<Record<string, any[]>>({});
  const [selectedBuilding, setSelectedBuilding] = useState<any | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number>(0);
  const [availableFloors, setAvailableFloors] = useState<number[]>([]);
  const [buildingRefreshKey, setBuildingRefreshKey] = useState(0);
  const [interiorMarkers, setInteriorMarkers] = useState<any[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<any | null>(null);
  const [selectedRooms, setSelectedRooms] = useState<any[]>([]);

  // BuildingSidebar ref and dynamic height tracking
  const buildingSidebarRef = useRef<HTMLDivElement | null>(null);
  const [buildingSidebarHeight, setBuildingSidebarHeight] = useState(0);

  // Use ResizeObserver to measure and track the height of the BuildingSidebar
  useEffect(() => {
    if (!buildingSidebarRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setBuildingSidebarHeight(entry.contentRect.height);
        }
      }
    });

    observer.observe(buildingSidebarRef.current);
    return () => observer.disconnect();
  }, [selectedBuilding]);

  // Load all buildings and rooms for the selected map
  useEffect(() => {
    if (!selectedMap) return;

    const loadMapData = async () => {
      try {
        const loadedBuildings = await getBuildingsForMap(selectedMap.id);
        setBuildings(loadedBuildings);

        const roomsMap: Record<string, any[]> = {};
        for (const building of loadedBuildings) {
          const rooms = await getRoomsForBuilding(building.id);
          roomsMap[building.id] = rooms;
        }

        setRoomsByBuilding(roomsMap);
      } catch (err) {
        console.error('Failed to load map data:', err);
      }
    };

    loadMapData();
  }, [selectedMap, buildingRefreshKey]);

  // Load all markers for a building
  useEffect(() => {
    if (!selectedBuilding) return;

    const loadMarkers = async () => {
      try {
        const markers = await getMarkersForBuilding(selectedBuilding.id);
        setInteriorMarkers(markers);
      } catch (err) {
        console.error('Failed to load interior markers:', err);
      }
    };

    loadMarkers();
  }, [selectedBuilding, buildingRefreshKey]);

  // Track mouse position on the map while placing a POI
  useEffect(() => {
    if (!styleReady || !mapRef.current || !placingPOI) return;

    const map = mapRef.current;

    const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
      setGhostPOICoords({
        lng: e.lngLat.lng,
        lat: e.lngLat.lat,
      });
    };

    map.on('mousemove', handleMouseMove);

    return () => {
      map.off('mousemove', handleMouseMove);
    };
  }, [styleReady, placingPOI]);

  // Handle map click event to create a POI when in placing mode
  useEffect(() => {
    if (!styleReady || !mapRef.current || !placingPOI || !selectedMap) return;

    const map = mapRef.current;

    const handleClick = async (e: mapboxgl.MapMouseEvent) => {
      try {
        await createPOI({
          mapId: selectedMap.id,
          name: 'New POI',
          description: 'Placed manually.',
          geojson: {
            type: 'Point',
            coordinates: [e.lngLat.lng, e.lngLat.lat],
          },
          hidden: false,
        });
        alert('POI created!');
      } catch (err) {
        console.error('Failed to create POI:', err);
        alert('Failed to create POI.');
      } finally {
        setPlacingPOI(false);
        setGhostPOICoords(null);
      }
    };

    map.once('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [styleReady, placingPOI, selectedMap]);

  // Compute and update selected rooms when building or floor changes
  useEffect(() => {
    if (!selectedBuilding || !roomsByBuilding[selectedBuilding.id]) {
      setSelectedRooms([]);
      return;
    }

    const filtered = roomsByBuilding[selectedBuilding.id].filter(
      (room) => room.floor === selectedFloor
    );

    setSelectedRooms(filtered);
  }, [selectedBuilding, roomsByBuilding, selectedFloor]);

  // Keep a ref to the current selectedRooms for use in closures
  useEffect(() => {
    selectedRoomsRef.current = selectedRooms;
  }, [selectedRooms]);

  // Generate available floor numbers from selected building
  useEffect(() => {
    if (!selectedBuilding) return;
    const { bottomFloor, numFloors } = selectedBuilding;

    if (typeof bottomFloor === 'number' && typeof numFloors === 'number') {
      const floors = Array.from({ length: numFloors }, (_, i) => bottomFloor + i);
      setAvailableFloors(floors);
      setSelectedFloor(floors[0]); // Always reset to first available floor
    }
  }, [selectedBuilding]);

  // Initialize the map once coordinates are available
  useEffect(() => {
    if (!mapContainerRef.current || !coords) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: coords,
      zoom: 14,
    });

    mapRef.current = map;

    map.on('load', () => {
      // Add user location puck
      puckRef.current = createUserLocationPuck(map);
      puckRef.current?.update(coords);

      // Add the drawing polygon source and layers for user-created buildings
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
    });

    return () => map.remove();
  }, [coords]);

  // Map click handler to select rooms
  useEffect(() => {
    if (!styleReady || !mapRef.current) return;

    const map = mapRef.current;

    const handleRoomClick = (e: mapboxgl.MapMouseEvent) => {
      if (isDrawing) return;

      const features = map.queryRenderedFeatures(e.point, { layers: ['saved-rooms-fill'] });

      if (features.length > 0) {
        const feature = features[0];
        const props = feature?.properties;

        // Type-safe check to avoid TS18047
        if (props && typeof props.id === 'string') {
          const room = selectedRoomsRef.current.find((r) => r.id === props.id);
          if (room) {
            setSelectedRoom(room);
            return;
          }
        }
      }

      // If no room feature found or not matched
      setSelectedRoom(null);
    };

    const waitForLayer = () => {
      if (map.getLayer('saved-rooms-fill')) {
        map.on('click', handleRoomClick);
      } else {
        map.once('sourcedata', waitForLayer);
      }
    };

    waitForLayer();

    return () => {
      map.off('click', handleRoomClick);
    };
  }, [styleReady, isDrawing]);

  // Map click handler to select buildings
  useEffect(() => {
    if (!styleReady || !mapRef.current) return;

    const map = mapRef.current;

    const handleBuildingClick = (e: mapboxgl.MapMouseEvent) => {
      if (isDrawing) return;

      const roomHits = map.queryRenderedFeatures(e.point, { layers: ['saved-rooms-fill'] });
      if (roomHits.length > 0) return;

      const buildingHits = map.queryRenderedFeatures(e.point, { layers: ['saved-buildings-fill'] });
      if (buildingHits.length > 0) {
        const feature = buildingHits[0];
        const props = feature?.properties;

        if (props && typeof props.id === 'string') {
          const building = buildings.find((b) => b.id === props.id);
          if (building) {
            setSelectedBuilding(building);
            return;
          }
        }
      }

      setSelectedBuilding(null);
    };

    map.on('click', handleBuildingClick);

    return () => {
      map.off('click', handleBuildingClick);
    };
  }, [styleReady, isDrawing, buildings]);

  // Show loading screen while waiting for location
  if (!coords && !error) {
    return (
      <div style={{ width: '100%', height: '100vh', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading map…</p>
      </div>
    );
  }

  return (
    <>
      {/* Map selection dropdown */}
      <SelectMapDropdown onSelectMap={setSelectedMap} />

      {/* Map container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100vh', backgroundColor: '#e0e0e0', cursor: isDrawing ? 'crosshair' : 'grab' }} />

      {/* floor plan image */}
      {mapRef.current && <FloorImageOverlayButton map={mapRef.current} />}

      {/* POI BUTTON */}
      {placingPOI && ghostPOICoords && mapRef.current && (
        <div
          style={{
            position: 'absolute',
            top: mapRef.current.project(ghostPOICoords).y,
            left: mapRef.current.project(ghostPOICoords).x,
            transform: 'translate(-50%, -50%)',
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: '#E76F51',
            opacity: 0.8,
            pointerEvents: 'none',
            zIndex: 999,
          }}
        />
      )}

    {/* Combined sidebar container */}
    {(selectedBuilding || selectedRoom) && (
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 20,
        }}
      >
        {/* Render BuildingSidebar first to measure height */}
        {selectedBuilding && (
          <div ref={buildingSidebarRef} style={{ position: 'relative', zIndex: 11 }}>
            <BuildingSidebar
              building={selectedBuilding}
              onDeleteSuccess={() => {
                setSelectedBuilding(null);
                setBuildingRefreshKey((k) => k + 1);
              }}
              onEditSuccess={async () => {
                // Refresh buildings list
                setBuildingRefreshKey((k) => k + 1);

                // Re-fetch and re-select updated building to sync sidebar
                if (selectedBuilding) {
                  const fresh = await getBuildingById(selectedBuilding.id);
                  setSelectedBuilding(fresh);
                }
              }}
            />
          </div>
        )}

        {/* Then render RoomSidebar using measured height */}
        {selectedRoom && (
          <div style={{ position: 'absolute', zIndex: 9 }}>
            <RoomSidebar
              room={selectedRoom}
              topOffset={80 + (buildingSidebarHeight || 300) + 24}
              onDeleteSuccess={() => {
                setSelectedRoom(null);
                setBuildingRefreshKey((prev) => prev + 1);
              }}
              onStartEdit={() => {}}
            />
          </div>
        )}
      </div>
    )}

      {/* Floor selector (based on selected building metadata) */}
      {selectedBuilding && availableFloors.length > 0 && (
        <FloorSelector availableFloors={availableFloors} selectedFloor={selectedFloor} onSelect={setSelectedFloor} />
      )}

      {/* Render saved buildings and rooms */}
      {mapRef.current && selectedMap && <SavedBuildingsRenderer map={mapRef.current} buildings={buildings} />}
      {mapRef.current && selectedBuilding && <SavedRoomsRenderer map={mapRef.current} rooms={selectedRooms} />}

      {mapRef.current && selectedBuilding && (
        <SavedInteriorMarkersRenderer
          map={mapRef.current}
          markers={interiorMarkers.filter(m => m.floor === selectedFloor)}
          onMarkerSelect={setSelectedMarker}
        />
      )}

      {/* Drawing interaction layers */}
      {mapRef.current && isDrawing && (
        <>
          <DrawingHandler map={mapRef.current} />
          <PolygonRenderer map={mapRef.current} />
        </>
      )}

      {/* Drawing tools and controls */}
          {selectedMap && (
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
          paddingBottom: 80,
        }}
      >
        {mapRef.current && isDrawing ? (
          <>
            {roomInfo ? (
              <RoomSaveButton onSaveSuccess={() => setBuildingRefreshKey((k) => k + 1)} />
            ) : (
              <BuildingSaveButton
                mapId={selectedMap!.id}
                onSaveSuccess={() => setBuildingRefreshKey((k) => k + 1)}
              />
            )}
            <button
              onClick={completeRing}
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
            <CreatePOIButton onStartPlacing={() => setPlacingPOI(true)} />

            {selectedBuilding ? (
              <>
                <CreateRoomButton buildingId={selectedBuilding.id} currentFloor={selectedFloor} />
                <CreateInteriorMarkerButton
                  buildingId={selectedBuilding.id}
                  currentFloor={selectedFloor}
                  map={mapRef.current!}
                  selectedMarker={selectedMarker}
                  onMarkerCreated={() => {
                    setSelectedMarker(null);
                    setBuildingRefreshKey((k) => k + 1);
                  }}
                  onDeleteMarker={() => {
                    setSelectedMarker(null);
                    setBuildingRefreshKey((k) => k + 1);
                  }}
                />
              </>
            ) : (
              <CreateBuildingButton />
            )}
          </>
        )}
      </div>
    )}

      {/* Display location error if present */}
      {error && (
        <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#fff3f3', padding: 10, borderRadius: 8, color: '#cc0000', textAlign: 'center' }}>
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

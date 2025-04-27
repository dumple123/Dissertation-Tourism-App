import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Constants from 'expo-constants';
import { router } from 'expo-router';

// Utilities and hooks
import { useLocation } from './utils/useLocation';
import { useBuildings } from './Mobile/Buildings/useBuildings';
import { useRooms } from './Mobile/Rooms/useRooms';
import { useInteriorMarkers } from './Mobile/InteriorMarkers/useInteriorMarkers';
import { getPOIsForMap } from '~/api/pois';
import { useSelectedMap } from '~/components/Mapping/Mobile/SelectedMapContext';
import { useItineraryPOIs } from '~/components/Itinerary/ItineraryPOIProvider';

// Map subcomponents
import MobileSavedBuildingsRenderer from './Mobile/Buildings/MobileSavedBuildingsRenderer';
import MobileSavedRoomsRenderer from './Mobile/Rooms/MobileSavedRoomsRenderer';
import MobileInteriorMarkersRenderer from './Mobile/InteriorMarkers/MobileInteriorMarkersRenderer';
import MapSelectorModal from './Mobile/MapSelectorModal';
import FloorSelector from './Mobile/Buildings/FloorSelectorMobile';
import MobilePOIRenderer from './Mobile/POI/MobilePOIRenderer';
import MobileClusteredPOIRenderer from './Mobile/POI/MobileClusteredPOIRenderer';
import POIPopupModal from './Mobile/POI/MobilePOIPopupModal';
import LocateMeButton from './Mobile/LocationUtils/LocateMeButton';
import MobileUserPuck from './Mobile/LocationUtils/MobileUserPuck';
import POIProgressCircle from '~/components/Mapping/Mobile/POI/POIProgressCircle';

// Mapbox token setup
MapboxGL.setAccessToken(Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN);
MapboxGL.setTelemetryEnabled(false);

interface Map {
  id: string;
  name: string;
}

interface Building {
  id: string;
  name: string;
  geojson: any;
  bottomFloor: number;
  numFloors: number;
}

export default function MapViewComponent() {
  const { coords } = useLocation();
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const mapRef = useRef<MapboxGL.MapView>(null);

  const { selectedMap, setSelectedMap } = useSelectedMap();
  const [showModal, setShowModal] = useState(Platform.OS !== 'web');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [availableFloors, setAvailableFloors] = useState<number[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(8);
  const [pois, setPois] = useState<any[]>([]);
  const [selectedPOI, setSelectedPOI] = useState<any | null>(null);
  const [hasInitialFlyTo, setHasInitialFlyTo] = useState(false);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const { itinerary } = useItineraryPOIs();

  const markerOpacity = useRef(new Animated.Value(0)).current;

  const mapId = selectedMap?.id ?? null;
  const { buildings } = useBuildings(mapId);
  const { rooms } = useRooms(selectedBuilding?.id ?? null);
  const { markers } = useInteriorMarkers(selectedBuilding?.id ?? null);

  // Handle map selection
  const handleMapSelect = (map: Map) => {
    setSelectedMap(map);
    setShowModal(false);
    setSelectedBuilding(null);
    setPois([]);
  };

  // Handle return to home if modal closed
  const handleModalCloseToHome = () => {
    router.replace('/');
  };

  // Handle map press (deselect building + poi)
  const handleMapPress = (e: any) => {
    const screenPoint = e.geometry.coordinates;
    console.log('Tapped map at:', screenPoint);
    setSelectedBuilding(null);
    setSelectedPOI(null);
  };

  // Handle building press
  const handleBuildingPress = (id: string) => {
    const building = buildings.find((b) => b.id === id);
    if (building) {
      console.log('Tapped building:', building.name);
      setSelectedBuilding(building);
      setSelectedPOI(null);
    }
  };

  // Handle zoom changes
  const handleRegionIsChanging = (e: any) => {
    const zoom = e?.properties?.zoomLevel;
    if (typeof zoom === 'number') {
      setZoomLevel(zoom);
    }
    if (isFollowingUser) {
      setIsFollowingUser(false);
    }
  };

  // Handle available floors when building selected
  useEffect(() => {
    if (selectedBuilding) {
      const { bottomFloor, numFloors } = selectedBuilding;
      if (typeof bottomFloor === 'number' && typeof numFloors === 'number') {
        const floors = Array.from({ length: numFloors }, (_, i) => bottomFloor + i);
        setAvailableFloors(floors);
        setSelectedFloor((prev) => (prev !== null && floors.includes(prev) ? prev : floors[0]));
      }
    } else {
      setAvailableFloors([]);
      setSelectedFloor(null);
    }
  }, [selectedBuilding]);

  // Fly to user location after map is selected
  useEffect(() => {
    if (!coords || !selectedMap || hasInitialFlyTo) return;

    const [lng, lat] = coords;
    const isValidLocation = lat !== 0 && lng !== 0 && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    if (!isValidLocation) {
      console.warn('Ignoring invalid location:', coords);
      return;
    }

    const timeout = setTimeout(() => {
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: coords,
          zoomLevel: 16,
          animationDuration: 3000,
        });
        setHasInitialFlyTo(true);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [coords, selectedMap, hasInitialFlyTo]);

  // Follow user if following is enabled
  useEffect(() => {
    if (!coords || !selectedMap || !isFollowingUser) return;

    const timeout = setTimeout(() => {
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: coords,
          zoomLevel: 16,
          animationDuration: 500,
        });
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [coords, selectedMap, isFollowingUser]);

  // Load POIs when map selected
  useEffect(() => {
    if (!selectedMap) return;

    const loadPOIs = async () => {
      try {
        const result = await getPOIsForMap(selectedMap.id);
        setPois(result);
      } catch (err) {
        console.error('Failed to load POIs:', err);
      }
    };

    loadPOIs();
  }, [selectedMap]);

  const filteredRooms = rooms.filter((r) => r.floor === selectedFloor);
  const filteredMarkers = markers.filter((m) => m.floor === selectedFloor);

  return (
    <View style={styles.container}>
      {coords && Array.isArray(coords) && coords[0] !== 0 && coords[1] !== 0 ? (
        <>
          <MapboxGL.MapView
            ref={mapRef}
            style={styles.map}
            onPress={handleMapPress}
            onRegionIsChanging={handleRegionIsChanging}
            logoEnabled={false}
            attributionEnabled={false}
            compassEnabled={false}
            compassFadeWhenNorth={false}
            styleURL={MapboxGL.StyleURL.Street}
            scaleBarEnabled={false}
          >
            <MapboxGL.Camera
              ref={cameraRef}
              centerCoordinate={coords}
              animationMode="flyTo"
              animationDuration={1000}
            />

            {/* Custom user puck */}
            {coords && <MobileUserPuck coords={coords} />}

            {/* Render saved buildings */}
            {mapId && (
              <MobileSavedBuildingsRenderer
                buildings={buildings}
                selectedFloor={selectedFloor ?? undefined}
                selectedBuildingId={selectedBuilding?.id}
                onBuildingPress={handleBuildingPress}
              />
            )}

            {/* Render POIs */}
            {mapId && (pois.length > 0 || itinerary.length > 0) && ( 
              (() => {
                const itineraryPOIsForMap = itinerary.map((poi) => ({
                  id: poi.id,
                  name: poi.name,
                  type: 'itinerary', // important
                  geojson: {
                    type: 'Point',
                    coordinates: poi.coords,
                  },
                }));

                const allPOIs = [...pois, ...itineraryPOIsForMap];

                return zoomLevel >= 12 ? (
                  <MobilePOIRenderer
                    pois={allPOIs}
                    selectedPOI={selectedPOI}
                    zoomLevel={zoomLevel}
                    onPOISelect={(poi) => {
                      setSelectedPOI(poi);
                      setSelectedBuilding(null);

                      const coords = poi.geojson?.coordinates;
                      if (coords && coords.length === 2 && cameraRef.current) {
                        cameraRef.current.flyTo(coords, 1000);
                        setTimeout(() => {
                          cameraRef.current?.setCamera({
                            centerCoordinate: coords,
                            zoomLevel: Math.max(zoomLevel, 17),
                            animationDuration: 500,
                          });
                        }, 1000);
                      }
                    }}
                  />
                ) : (
                  <MobileClusteredPOIRenderer
                    pois={allPOIs}
                    zoomLevel={zoomLevel}
                    cameraRef={cameraRef}
                    onPOISelect={(poi) => {
                      setSelectedPOI(poi);
                      setSelectedBuilding(null);
                    }}
                  />
                );
              })()
            )}

            {/* No POIs fallback */}
            {mapId && pois.length === 0 && (
              <View style={styles.noPoisContainer}>
                <Text style={styles.noPoisText}>No POIs found for this map.</Text>
              </View>
            )}

            {/* Render saved rooms */}
            {selectedBuilding && selectedFloor !== null && (
              <>
                <MobileSavedRoomsRenderer rooms={filteredRooms} />
                {zoomLevel >= 15 && (
                  <MobileInteriorMarkersRenderer
                    markers={filteredMarkers}
                    selectedFloor={selectedFloor}
                    markerOpacity={markerOpacity}
                  />
                )}
              </>
            )}
          </MapboxGL.MapView>

          {/* POI progress circle */}
          <View style={styles.poiProgressWrapper}>
            <POIProgressCircle />
          </View>

          {/* Locate Me button */}
          <LocateMeButton
            onPress={() => {
              if (coords && cameraRef.current) {
                setIsFollowingUser(true);
                cameraRef.current.setCamera({
                  centerCoordinate: coords,
                  zoomLevel: 16,
                  animationDuration: 3000,
                });
              }
            }}
          />
        </>
      ) : (
        <View style={styles.loadingLocationContainer}>
          <Text style={styles.loadingLocationText}>Locating you...</Text>
        </View>
      )}

      {/* Show map selector */}
      {Platform.OS !== 'web' && !selectedMap && (
        <MapSelectorModal
          isVisible={showModal}
          onClose={handleModalCloseToHome}
          onSelect={handleMapSelect}
        />
      )}

      {/* Show floor selector */}
      {selectedBuilding && availableFloors.length > 0 && selectedFloor !== null && (
        <FloorSelector
          availableFloors={availableFloors}
          selectedFloor={selectedFloor}
          onSelect={setSelectedFloor}
        />
      )}

      {/* Show POI popup */}
      {selectedPOI && (
        <POIPopupModal
          poi={selectedPOI}
          onClose={() => setSelectedPOI(null)}
        />
      )}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  poiMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E9C46A',
    borderColor: '#333',
    borderWidth: 1,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff3f3',
    padding: 10,
    borderRadius: 8,
  },
  errorText: {
    color: '#cc0000',
    textAlign: 'center',
  },
  noPoisContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    elevation: 2,
  },
  noPoisText: {
    fontSize: 14,
    color: '#777',
  },
  loadingLocationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingLocationText: {
    fontSize: 16,
    color: '#333',
  },
  poiProgressWrapper: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
});

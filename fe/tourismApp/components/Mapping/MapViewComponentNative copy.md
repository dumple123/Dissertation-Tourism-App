import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Constants from 'expo-constants';
import { router } from 'expo-router';

// Utilities and hooks
import { requestLocationPermission } from './utils/requestLocationPermission';
import { useUserLocation } from './Hooks/useUserLocation';
import { useBuildings } from './Mobile/Buildings/useBuildings';
import { useRooms } from './Mobile/Rooms/useRooms';
import { useInteriorMarkers } from './Mobile/InteriorMarkers/useInteriorMarkers';

// Map subcomponents
import MobileSavedBuildingsRenderer from './Mobile/Buildings/MobileSavedBuildingsRenderer';
import MobileSavedRoomsRenderer from './Mobile/Rooms/MobileSavedRoomsRenderer';
import MobileInteriorMarkersRenderer from './Mobile/InteriorMarkers/MobileInteriorMarkersRenderer';
import MapSelectorModal from './Mobile/MapSelectorModal';
import FloorSelector from './Mobile/Buildings/FloorSelectorMobile';
import MobilePOIRenderer from './Mobile/POI/MobilePOIRenderer';

// Set up Mapbox configuration
MapboxGL.setAccessToken(Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN);
MapboxGL.setTelemetryEnabled(false);

// Type definitions for Map and Building objects
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
  // Location and camera references
  const { coords, error, heading } = useUserLocation();
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const mapRef = useRef<MapboxGL.MapView>(null);

  // State management
  const [selectedMap, setSelectedMap] = useState<Map | null>(null);
  const [showModal, setShowModal] = useState(Platform.OS !== 'web');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [availableFloors, setAvailableFloors] = useState<number[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(14);
  const [pois, setPois] = useState<any[]>([]);
  const [selectedPOI, setSelectedPOI] = useState<any | null>(null);

  // Animated value for marker opacity based on zoom level
  const markerOpacity = useRef(new Animated.Value(0)).current;

  // Load map, building, room, and interior marker data
  const mapId = selectedMap?.id ?? null;
  const { buildings } = useBuildings(mapId);
  const { rooms } = useRooms(selectedBuilding?.id ?? null);
  const { markers } = useInteriorMarkers(selectedBuilding?.id ?? null);

  // Handle selecting a map
  const handleMapSelect = (map: Map) => {
    setSelectedMap(map);
    setShowModal(false);
  };

  // Handle closing the modal and navigating back to home
  const handleModalCloseToHome = () => {
    router.replace('/');
  };

  // Handle pressing anywhere on the map
  const handleMapPress = (e: any) => {
    const screenPoint = e.geometry.coordinates;
    console.log('Tapped map at:', screenPoint);
    setSelectedBuilding(null);
  };

  // Handle pressing a building
  const handleBuildingPress = (id: string) => {
    const building = buildings.find((b) => b.id === id);
    if (building) {
      console.log('Tapped building:', building.name);
      setSelectedBuilding(building);
    }
  };

  // Handle zoom level changes
  const handleRegionDidChange = (e: any) => {
    const zoom = e?.properties?.zoomLevel;
    if (typeof zoom === 'number') {
      setZoomLevel(zoom);

      Animated.timing(markerOpacity, {
        toValue: zoom >= 15.5 ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  // Update available floors when a building is selected
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

  // Request user location permission on mount
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Filter rooms and markers for the currently selected floor
  const filteredRooms = rooms.filter((r) => r.floor === selectedFloor);
  const filteredMarkers = markers.filter((m) => m.floor === selectedFloor);

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        ref={mapRef}
        style={styles.map}
        onPress={handleMapPress}
        onRegionDidChange={handleRegionDidChange}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={14}
          centerCoordinate={coords ?? [-1.615, 54.978]}
        />

        {/* Render saved buildings */}
        {mapId && (
          <MobileSavedBuildingsRenderer
            buildings={buildings}
            selectedFloor={selectedFloor ?? undefined}
            selectedBuildingId={selectedBuilding?.id}
            onBuildingPress={handleBuildingPress}
          />
        )}

        {/* Render rooms and markers for selected building and floor */}
        {selectedBuilding && selectedFloor !== null ? (
          <>
            <MobileSavedRoomsRenderer rooms={filteredRooms} />

            {zoomLevel >= 15 && (
              <>
                <MobileInteriorMarkersRenderer
                  markers={filteredMarkers}
                  selectedFloor={selectedFloor}
                  markerOpacity={markerOpacity}
                />
              </>
            )}
          </>
        ) : null}

        {/* Render user location marker */}
        {coords && (
          <MapboxGL.PointAnnotation id="user-location" coordinate={coords}>
            <Animated.View
              style={[styles.marker, { transform: [{ rotate: `${heading}deg` }] }]}
            />
          </MapboxGL.PointAnnotation>
        )}
      </MapboxGL.MapView>

      {/* Display error message if location cannot be fetched */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Location error: {error}</Text>
        </View>
      )}

      {/* Show map selector modal on startup */}
      {Platform.OS !== 'web' && (
        <MapSelectorModal
          isVisible={showModal}
          onClose={handleModalCloseToHome}
          onSelect={handleMapSelect}
        />
      )}

      {/* Display floor selector when building is selected */}
      {selectedBuilding && availableFloors.length > 0 && selectedFloor !== null && (
        <FloorSelector
          availableFloors={availableFloors}
          selectedFloor={selectedFloor}
          onSelect={setSelectedFloor}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  marker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2A9D8F',
    borderColor: '#fff',
    borderWidth: 2,
  },
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
});

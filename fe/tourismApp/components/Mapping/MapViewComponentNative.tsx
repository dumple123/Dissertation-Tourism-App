import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Constants from 'expo-constants';

// Utility imports
import { requestLocationPermission } from './utils/requestLocationPermission';
import { useUserLocation } from './Hooks/useUserLocation';
import { usePOIs } from './utils/POI/usePOIs';
import { useBuildings } from './Mobile/Buildings/useBuildings';
import MobileSavedBuildingsRenderer from './Mobile/Buildings/MobileSavedBuildingsRenderer';
import MapSelectorModal from './Mobile/MapSelectorModal'; 

MapboxGL.setAccessToken(Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN);
MapboxGL.setTelemetryEnabled(false);

interface Map {
  id: string;
  name: string;
}

export default function MapViewComponent() {
  const { coords, error, heading } = useUserLocation();
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const { pois } = usePOIs();

  const [selectedMap, setSelectedMap] = useState<Map | null>(null);
  const [showModal, setShowModal] = useState(Platform.OS !== 'web');

  const handleMapSelect = (map: Map) => {
    setSelectedMap(map);
    setShowModal(false);
  };

  // Conditionally load buildings by mapId (only once selected)
  const mapId = selectedMap?.id ?? null;
  const { buildings } = useBuildings(mapId);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  return (
    <View style={styles.container}>
      <MapboxGL.MapView style={styles.map}>
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={14}
          centerCoordinate={coords ?? [-1.615, 54.978]}
        />

        {/* Render saved buildings for selected map */}
        {mapId && <MobileSavedBuildingsRenderer buildings={buildings} />}

        {/* User location marker */}
        {coords && (
          <MapboxGL.PointAnnotation id="user-location" coordinate={coords}>
            <Animated.View
              style={[
                styles.marker,
                { transform: [{ rotate: `${heading}deg` }] },
              ]}
            />
          </MapboxGL.PointAnnotation>
        )}

        {/* POIs */}
        {pois.map((poi) => (
          <MapboxGL.PointAnnotation
            key={poi.id}
            id={poi.id}
            coordinate={[poi.lng, poi.lat]}
          >
            <View style={styles.poiMarker} />
          </MapboxGL.PointAnnotation>
        ))}
      </MapboxGL.MapView>

      {/* Location error display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Location error: {error}</Text>
        </View>
      )}

      {/* Mobile-only map selection modal */}
      {Platform.OS !== 'web' && (
        <MapSelectorModal
          isVisible={showModal}
          onClose={() => setShowModal(false)}
          onSelect={handleMapSelect}
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

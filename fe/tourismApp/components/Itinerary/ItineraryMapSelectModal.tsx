import React, { useState, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Constants from 'expo-constants';

import { useItineraryPOIs } from '~/components/Itinerary/ItineraryPOIProvider';
import { useLocation } from '~/components/Mapping/utils/useLocation';
import LocateMeButton from '~/components/Mapping/Mobile/LocationUtils/LocateMeButton';
import MobileUserPuck from '~/components/Mapping/Mobile/LocationUtils/MobileUserPuck';

MapboxGL.setAccessToken(Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN);

type ItineraryMapSelectModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function ItineraryMapSelectModal({ visible, onClose }: ItineraryMapSelectModalProps) {
  const { addPOI } = useItineraryPOIs();
  const { coords: userCoords } = useLocation();
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const [selectedPlaceName, setSelectedPlaceName] = useState<string | null>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);

  const handleMapPress = async (e: any) => {
    const coords = e.geometry.coordinates;
    setSelectedCoords(coords);

    try {
      const accessToken = Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN;
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?access_token=${accessToken}`;

      const res = await fetch(url);
      const data = await res.json();
      const placeName = data.features?.[0]?.place_name ?? null;

      if (placeName) {
        setSelectedPlaceName(placeName);
      } else {
        setSelectedPlaceName(null);
      }
    } catch (error) {
      console.error('Failed to reverse geocode location:', error);
      setSelectedPlaceName(null);
    }
  };

  const handleConfirm = async () => {
    if (!selectedCoords) return;

    await addPOI({
      name: selectedPlaceName || `Pinned (${selectedCoords[1].toFixed(5)}, ${selectedCoords[0].toFixed(5)})`,
      coords: selectedCoords,
    });

    setSelectedCoords(null);
    setSelectedPlaceName(null);
    onClose();
  };

  const handleCancel = () => {
    setSelectedCoords(null);
    setSelectedPlaceName(null);
    onClose();
  };

  const handleLocateMe = () => {
    if (userCoords && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: userCoords,
        zoomLevel: 14,
        animationDuration: 1000,
      });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        {/* Top Text Box */}
        {selectedCoords && (
          <View style={styles.locationInfoBox}>
            <Text style={styles.locationInfoText}>
              {selectedPlaceName || `Pinned (${selectedCoords[1].toFixed(5)}, ${selectedCoords[0].toFixed(5)})`}
            </Text>
          </View>
        )}

        <MapboxGL.MapView
          style={styles.map}
          onPress={handleMapPress}
          logoEnabled={false}
          attributionEnabled={false}
          compassEnabled={false}
          styleURL={MapboxGL.StyleURL.Street}
        >
          <MapboxGL.Camera
            ref={cameraRef}
            zoomLevel={14}
            centerCoordinate={userCoords ?? [-1.615, 54.978]}
          />

          {userCoords && (
            <MobileUserPuck coords={userCoords} heading={0} />
          )}

          {selectedCoords && (
            <MapboxGL.PointAnnotation id="selected-point" coordinate={selectedCoords}>
              <View style={styles.marker} />
            </MapboxGL.PointAnnotation>
          )}
        </MapboxGL.MapView>

        {/* Locate Me button */}
        <View style={styles.locateButtonWrapper}>
          <LocateMeButton onPress={handleLocateMe} />
        </View>

        {/* Bottom bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          {selectedCoords && (
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30, 
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  cancelButton: {
    backgroundColor: '#FF5733',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cancelText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  marker: {
    width: 20,
    height: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  locateButtonWrapper: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    zIndex: 10,
  },
  locationInfoBox: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    elevation: 3,
    zIndex: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  locationInfoText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});

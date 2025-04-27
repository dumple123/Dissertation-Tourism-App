import React, { useState, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { useItineraryPOIs } from '~/components/Itinerary/ItineraryPOIProvider';
import Constants from 'expo-constants';

MapboxGL.setAccessToken(Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN);

type ItineraryMapSelectModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function ItineraryMapSelectModal({ visible, onClose }: ItineraryMapSelectModalProps) {
  const { addPOI } = useItineraryPOIs();
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);

  const handleMapPress = (e: any) => {
    const coords = e.geometry.coordinates;
    setSelectedCoords(coords);
  };

  const handleConfirm = async () => {
    if (!selectedCoords) return;
    await addPOI({
      name: `Pinned (${selectedCoords[1].toFixed(5)}, ${selectedCoords[0].toFixed(5)})`,
      coords: selectedCoords,
    });
    setSelectedCoords(null);
    onClose();
  };

  const handleCancel = () => {
    setSelectedCoords(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
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
            centerCoordinate={selectedCoords ?? [-0.1276, 51.5072]} // fallback: London
          />

          {selectedCoords && (
            <MapboxGL.PointAnnotation id="selected-point" coordinate={selectedCoords}>
                <View style={styles.marker} />
            </MapboxGL.PointAnnotation>
          )}
        </MapboxGL.MapView>

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
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#4CAF50',
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
});

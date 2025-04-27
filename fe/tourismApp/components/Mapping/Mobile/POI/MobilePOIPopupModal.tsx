import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePOIProgress } from '~/components/Mapping/Mobile/POI/POIProgressProvider'; // Make sure you import this

type POIPopupModalProps = {
  poi: any;
  onClose: () => void;
};

export default function POIPopupModal({ poi, onClose }: POIPopupModalProps) {
  const { visitedPOIIds } = usePOIProgress();
  const isVisited = visitedPOIIds.has(poi.id);

  const showHiddenPlaceholder = poi.hidden && !isVisited;

  return (
    <Modal
      visible={!!poi}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[
              styles.modalContent,
              isVisited && styles.visitedModalContent, // Make modal green if visited
            ]}>
              <Text style={styles.modalTitle}>
                {showHiddenPlaceholder
                  ? 'Hidden POI'
                  : (
                    <>
                      {poi.name}
                      {isVisited && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="white"
                          style={{ marginLeft: 8 }}
                        />
                      )}
                    </>
                  )
                }
              </Text>

              <Text style={styles.modalDescription}>
                {showHiddenPlaceholder
                  ? 'This Point of Interest is hidden. Explore nearby to reveal it!'
                  : (poi.description || 'No description available.')
                }
              </Text>

              <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  visitedModalContent: {
    backgroundColor: '#32CD32', // Bright green if visited!
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  modalDescription: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalCloseButton: {
    backgroundColor: '#2A9D8F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

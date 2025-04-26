import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';

type POIPopupModalProps = {
  poi: any;
  onClose: () => void;
};

export default function POIPopupModal({ poi, onClose }: POIPopupModalProps) {
  return (
    <Modal
      visible={!!poi}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Outer touchable area to dismiss modal when tapped */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalContainer}>
          {/* Prevent closing when tapping inside the content */}
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{poi.name}</Text>
              <Text style={styles.modalDescription}>
                {poi.description || 'No description available.'}
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
  /* Modal container background */
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Modal box */
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },

  /* Modal title */
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },

  /* Modal description text */
  modalDescription: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },

  /* Close button */
  modalCloseButton: {
    backgroundColor: '#2A9D8F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  /* Close button text */
  modalCloseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { getMaps } from '~/api/map';

interface Map {
  id: string;
  name: string;
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (map: Map) => void;
}

export default function MapSelectorModal({ isVisible, onClose, onSelect }: Props) {
  const [maps, setMaps] = useState<Map[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setLoading(true);
      getMaps()
        .then(setMaps)
        .catch((err: unknown) => {
          console.error('Failed to fetch maps:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [isVisible]);

  const handleCloseToHome = () => {
    router.replace('/'); // navigate to home
    onClose();           // optional: reset parent state if needed
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={isVisible}
      onRequestClose={() => {}} // disables back button on Android
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={handleCloseToHome}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Select a Map</Text>

          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <FlatList
              data={maps}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => onSelect(item)}
                >
                  <Text style={styles.itemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 12,
    zIndex: 10,
  },
  closeText: {
    fontSize: 28,
    color: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  itemText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

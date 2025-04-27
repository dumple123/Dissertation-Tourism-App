import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useItineraryPOIs } from '~/components/Itinerary/ItineraryPOIProvider';
import ItineraryList from '~/components/Itinerary/ItineraryList';
import ItinerarySearchLocationBar from '~/components/Itinerary/ItinerarySearchLocationBar';
import ItineraryMapSelectModal from '~/components/Itinerary/ItineraryMapSelectModal'; // make sure correct path

export default function ItineraryPage() {
  const { itinerary, addPOI, removePOI } = useItineraryPOIs();
  const [mapModalVisible, setMapModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <ItinerarySearchLocationBar
        onLocationSelect={(location) => {
          addPOI({ name: location.name, coords: location.coords });
        }}
      />

      <ItineraryList
        itinerary={itinerary}
        onDeleteItem={(index) => {
          const poi = itinerary[index];
          if (poi) removePOI(poi.id);
        }}
        ListFooterComponent={(
          <TouchableOpacity
            style={styles.addFromMapButton}
            onPress={() => setMapModalVisible(true)}
          >
            <Text style={styles.addFromMapButtonText}>➕ Add Location from Map</Text>
          </TouchableOpacity>
        )}
      />

      <ItineraryMapSelectModal
        visible={mapModalVisible}
        onClose={() => setMapModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fafafa',
  },
  addFromMapButton: {
    marginTop: 20,
    backgroundColor: '#2A9D8F',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addFromMapButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

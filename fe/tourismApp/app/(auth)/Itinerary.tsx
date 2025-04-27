import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useItineraryPOIs } from '~/components/Itinerary/ItineraryPOIProvider';
import ItineraryList from '~/components/Itinerary/ItineraryList';
import ItinerarySearchLocationBar from '~/components/Itinerary/ItinerarySearchLocationBar';
import uuid from 'react-native-uuid';

export default function ItineraryPage() {
  const { itinerary, addPOI, removePOI } = useItineraryPOIs();

  return (
    <View style={styles.container}>
      
      {/* Search Bar */}
      <ItinerarySearchLocationBar
        onLocationSelect={(location) => {
          const newPOI = {
            id: uuid.v4() as string,
            name: location.name,
            coords: location.coords,
          };
          addPOI(newPOI);
        }}
      />

      {/* Itinerary List */}
      <ItineraryList
        itinerary={itinerary}
        onDeleteItem={(index) => {
          const poi = itinerary[index];
          if (poi) {
            removePOI(poi.id);
          }
        }}
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
});
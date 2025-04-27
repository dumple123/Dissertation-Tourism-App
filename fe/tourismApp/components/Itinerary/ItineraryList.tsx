import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

type ItineraryItem = {
  name: string;
  coords: [number, number];
};

type ItineraryListProps = {
  itinerary: ItineraryItem[];
  onDeleteItem?: (index: number) => void;
};

export default function ItineraryList({ itinerary, onDeleteItem }: ItineraryListProps) {
  return (
    <FlatList
      data={itinerary}
      keyExtractor={(item, index) => `${item.name}-${index}`}
      renderItem={({ item, index }) => (
        <View style={styles.item}>
          <Text style={styles.itemText}>{item.name}</Text>
          {onDeleteItem && (
            <TouchableOpacity onPress={() => onDeleteItem(index)} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      ListEmptyComponent={<Text style={styles.emptyText}>No places added yet.</Text>}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  deleteButton: {
    marginLeft: 10,
    backgroundColor: '#ff4d4d',
    borderRadius: 20,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#777',
    fontSize: 16,
  },
});

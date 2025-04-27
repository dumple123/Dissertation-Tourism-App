import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { debounce } from 'lodash'; 
import Constants from 'expo-constants';

const MAPBOX_ACCESS_TOKEN = Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN;

type SearchLocationBarProps = {
  onLocationSelect: (location: { name: string; coords: [number, number] }) => void;
};

export default function ItinerarySearchLocationBar({ onLocationSelect }: SearchLocationBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchPlaces = async (searchTerm: string) => {
    if (!searchTerm) {
      setResults([]);
      return;
    }

    try {
      setIsSearching(true);

      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchTerm)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&autocomplete=true&limit=5`
      );

      const data = await res.json();
      setResults(data.features || []);
    } catch (error) {
      console.error('Failed to search places:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = debounce(searchPlaces, 500);

  useEffect(() => {
    debouncedSearch(query);

    return () => {
      debouncedSearch.cancel();
    };
  }, [query]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search locations to add..."
        value={query}
        onChangeText={setQuery}
      />

      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => {
                onLocationSelect({
                  name: item.place_name,
                  coords: [item.center[0], item.center[1]], // [longitude, latitude]
                });
                setQuery('');
                setResults([]);
              }}
            >
              <Text style={styles.resultText}>{item.place_name}</Text>
            </TouchableOpacity>
          )}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
    zIndex: 10,
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    elevation: 2,
  },
  resultItem: {
    backgroundColor: 'white',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultText: {
    fontSize: 14,
    color: '#333',
  },
});

import React, { useState, useMemo } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import centroid from '@turf/centroid';
import { Feature, Polygon, MultiPolygon } from 'geojson';

export interface Building {
  id: string;
  name: string;
  mapId: string;
  geojson: any;
}

export interface Room {
  id: string;
  name: string;
  buildingId: string;
  floor: number;
  geojson: any;
}

export interface POI {
  id: string;
  name: string;
  mapId: string;
  hidden: boolean;
  geojson: any;
}

export interface ItineraryPOI {
  id: string;
  name: string;
  coords: [number, number];
}

export interface SearchableItem {
  type: 'building' | 'room' | 'poi' | 'itinerary';
  id: string;
  name: string;
  coords: [number, number];
  buildingId?: string;
  floor?: number;
}

interface MapSearchBarProps {
  buildings: Building[];
  rooms: Room[];
  pois: POI[];
  itineraryPOIs: ItineraryPOI[];
  mapId: string | null;
  onSelect: (item: SearchableItem) => void;
}

export default function MapSearchBar({ buildings, rooms, pois, itineraryPOIs, mapId, onSelect }: MapSearchBarProps) {
  const [query, setQuery] = useState('');

  const searchData = useMemo(() => {
    if (!mapId) return [];

    const getGeoJSONCenter = (geojson: any): [number, number] => {
      try {
        const center = centroid(geojson as Feature<Polygon | MultiPolygon>);
        return center.geometry.coordinates as [number, number];
      } catch (err) {
        console.error('Failed to get center of geojson:', err);
        return [0, 0];
      }
    };

    const buildingItems = buildings
      .filter(b => b.mapId === mapId)
      .map(b => ({
        type: 'building' as const,
        id: b.id,
        name: b.name,
        buildingId: b.id,
        coords: getGeoJSONCenter(b.geojson),
      }));

    const buildingMap = new Map(buildings.map(b => [b.id, b]));

    const roomItems = rooms
      .filter(r => {
        const building = buildingMap.get(r.buildingId);
        return building?.mapId === mapId;
      })
      .map(r => ({
        type: 'room' as const,
        id: r.id,
        name: r.name,
        buildingId: r.buildingId,
        floor: r.floor,
        coords: getGeoJSONCenter(r.geojson),
      }));

    const poiItems = pois
      .filter(p => p.mapId === mapId && !p.hidden)
      .map(p => ({
        type: 'poi' as const,
        id: p.id,
        name: p.name,
        coords: p.geojson?.coordinates,
      }));

    const itineraryItems = itineraryPOIs.map(i => ({
      type: 'itinerary' as const,
      id: i.id,
      name: i.name,
      coords: i.coords,
    }));

    return [...buildingItems, ...roomItems, ...poiItems, ...itineraryItems];
  }, [buildings, rooms, pois, itineraryPOIs, mapId]);

  const filtered = searchData.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search rooms, buildings, POIs..."
        value={query}
        onChangeText={setQuery}
      />

      {query.length > 0 && filtered.length > 0 && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => {
                onSelect(item);
                setQuery('');
              }}
            >
              <Text style={styles.itemText}>
                {item.name} ({item.type})
              </Text>
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
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    elevation: 2,
  },
  item: {
    backgroundColor: 'white',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  itemText: {
    fontSize: 14,
    color: '#333',
  },
});

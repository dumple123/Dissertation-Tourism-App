import React, { useState, useMemo } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet, Modal } from 'react-native';
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
  userCoords: [number, number] | null;
  placeholder: string;
  onSelect: (item: SearchableItem) => void;
}

export default function MapSearchBar({ buildings, rooms, pois, itineraryPOIs, mapId, userCoords, placeholder, onSelect }: MapSearchBarProps) {
  const [query, setQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'buildings' | 'pois' | 'itinerary' | 'rooms'>('buildings');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

  const getDistance = (from: [number, number], to: [number, number]) => {
    const [lng1, lat1] = from;
    const [lng2, lat2] = to;
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  };

  const searchData = useMemo(() => {
    if (!mapId) return [];
    const getGeoJSONCenter = (geojson: any): [number, number] => {
      try {
        const center = centroid(geojson as Feature<Polygon | MultiPolygon>);
        return center.geometry.coordinates as [number, number];
      } catch {
        return [0, 0];
      }
    };
    const buildingItems = buildings.filter(b => b.mapId === mapId).map(b => ({
      type: 'building' as const,
      id: b.id,
      name: b.name,
      buildingId: b.id,
      coords: getGeoJSONCenter(b.geojson),
    }));
    const buildingMap = new Map(buildings.map(b => [b.id, b]));
    const roomItems = rooms.filter(r => {
      const building = buildingMap.get(r.buildingId);
      return building?.mapId === mapId;
    }).map(r => ({
      type: 'room' as const,
      id: r.id,
      name: r.name,
      buildingId: r.buildingId,
      floor: r.floor,
      coords: getGeoJSONCenter(r.geojson),
    }));
    const poiItems = pois.filter(p => p.mapId === mapId && !p.hidden).map(p => ({
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

  const filtered = useMemo(() => {
    let list: SearchableItem[] = [];
    if (selectedTab === 'buildings') list = searchData.filter(i => i.type === 'building');
    if (selectedTab === 'pois') list = searchData.filter(i => i.type === 'poi');
    if (selectedTab === 'itinerary') list = searchData.filter(i => i.type === 'itinerary');
    if (selectedTab === 'rooms' && selectedBuildingId) list = searchData.filter(i => i.type === 'room' && i.buildingId === selectedBuildingId);
    if (query.length > 0) list = list.filter(i => i.name.toLowerCase().includes(query.toLowerCase()));
    if (userCoords && query.length === 0) list.sort((a, b) => getDistance(userCoords, a.coords) - getDistance(userCoords, b.coords));
    return list;
  }, [searchData, selectedTab, query, userCoords, selectedBuildingId]);

  const styles = StyleSheet.create({
    container: { position: 'absolute', top: 10, left: 10, right: 10, zIndex: 10 },
    input: { backgroundColor: 'white', padding: 12, borderRadius: 8, fontSize: 16, elevation: 2, justifyContent: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
    modalContainer: { flex: 1, justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, maxHeight: '80%' },
    tabRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
    tabButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#eee' },
    activeTabButton: { backgroundColor: '#2A9D8F' },
    tabText: { fontSize: 14, color: '#333' },
    activeTabText: { color: 'white' },
    modalInput: { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 10 },
    item: { backgroundColor: 'white', padding: 10, borderBottomWidth: 1, borderColor: '#eee' },
    itemText: { fontSize: 14, color: '#333' },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <View style={styles.input}>
          <Text style={{ color: '#999' }}>{query || placeholder}</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableOpacity activeOpacity={1} style={styles.modalContent} onPress={() => {}}>
              <View style={styles.tabRow}>
                <TouchableOpacity style={[styles.tabButton, selectedTab === 'buildings' && styles.activeTabButton]} onPress={() => setSelectedTab('buildings')}>
                  <Text style={[styles.tabText, selectedTab === 'buildings' && styles.activeTabText]}>Buildings</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tabButton, selectedTab === 'pois' && styles.activeTabButton]} onPress={() => setSelectedTab('pois')}>
                  <Text style={[styles.tabText, selectedTab === 'pois' && styles.activeTabText]}>POIs</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tabButton, selectedTab === 'itinerary' && styles.activeTabButton]} onPress={() => setSelectedTab('itinerary')}>
                  <Text style={[styles.tabText, selectedTab === 'itinerary' && styles.activeTabText]}>Itinerary</Text>
                </TouchableOpacity>
                {selectedBuildingId && (
                  <TouchableOpacity style={[styles.tabButton, selectedTab === 'rooms' && styles.activeTabButton]} onPress={() => setSelectedTab('rooms')}>
                    <Text style={[styles.tabText, selectedTab === 'rooms' && styles.activeTabText]}>Rooms</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={styles.modalInput}
                placeholder={placeholder}
                value={query}
                onChangeText={setQuery}
                autoFocus
              />
              <FlatList
                data={filtered}
                keyExtractor={(item) => `${item.type}-${item.id}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.item}
                    onPress={() => {
                      if (item.type === 'building') {
                        setSelectedBuildingId(item.id);
                        setSelectedTab('rooms');
                      }
                      onSelect(item);
                      setModalVisible(false);
                      setQuery('');
                    }}
                  >
                    <Text style={styles.itemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                keyboardShouldPersistTaps="handled"
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

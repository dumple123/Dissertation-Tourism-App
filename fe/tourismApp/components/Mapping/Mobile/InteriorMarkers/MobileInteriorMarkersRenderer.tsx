import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { markerTypesMobile, MarkerType } from './markerTypesMobile';

interface Marker {
  id: string;
  type: string;
  label?: string;
  coordinates: [number, number];
  floor: number;
  accessible?: boolean;
}

interface Props {
  markers: Marker[];
  selectedFloor: number;
}

export default function MobileInteriorMarkersRenderer({ markers, selectedFloor }: Props) {
  const visibleMarkers = markers.filter((m) => m.floor === selectedFloor);

  return (
    <>
      {visibleMarkers.map((marker) => {
        const { id, coordinates, type, accessible } = marker;
        const markerInfo = markerTypesMobile[type as MarkerType] || markerTypesMobile.other;
        const Icon = markerInfo.Component;

        return (
          <MapboxGL.PointAnnotation key={id} id={id} coordinate={coordinates}>
            <View
              style={[
                styles.markerContainer,
                { backgroundColor: accessible ? '#2A9D8F' : '#F4A261' },
              ]}
            >
              {Icon ? (
                <Icon width={18} height={18} />
              ) : (
                <Text style={styles.fallbackText}>
                  {markerInfo.fallbackEmoji ?? '❓'}
                </Text>
              )}
            </View>
          </MapboxGL.PointAnnotation>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'white',
    borderWidth: 2,
  },
  fallbackText: {
    fontSize: 14,
  },
});

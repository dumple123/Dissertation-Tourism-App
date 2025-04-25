import React, { useState } from 'react';
import MapboxGL from '@rnmapbox/maps';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
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
  markerOpacity: Animated.Value;
}

export default function MobileInteriorMarkersRenderer({
  markers,
  selectedFloor,
  markerOpacity,
}: Props) {
  const [pressedId, setPressedId] = useState<string | null>(null);

  const visibleMarkers = markers.filter((m) => m.floor === selectedFloor);

  return (
    <>
      {visibleMarkers.map((marker) => {
        const { id, coordinates, type, accessible, label } = marker;
        const markerInfo = markerTypesMobile[type as MarkerType] || markerTypesMobile.other;
        const Icon = markerInfo.Component;

        return (
          <MapboxGL.PointAnnotation key={id} id={id} coordinate={coordinates}>
            <Animated.View style={{ alignItems: 'center', opacity: markerOpacity }}>
              <Pressable
                onPressIn={() => setPressedId(id)}
                onPressOut={() => setPressedId(null)}
                style={[
                  styles.markerContainer,
                  {
                    backgroundColor: accessible ? '#2A9D8F' : '#e63946',
                  },
                ]}
              >
                {Icon ? (
                  <Icon width={18} height={18} />
                ) : (
                  <Text style={styles.fallbackText}>{markerInfo.fallbackEmoji ?? '?'}</Text>
                )}
              </Pressable>

              {pressedId === id && !!label && typeof label === 'string' && (
                <View style={styles.callout}>
                  <Text style={styles.calloutText}>{label}</Text>
                </View>
              )}
            </Animated.View>
          </MapboxGL.PointAnnotation>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#fff',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  fallbackText: {
    fontSize: 12,
    color: '#fff',
  },
  callout: {
    position: 'absolute',
    top: 32,
    backgroundColor: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  calloutText: {
    fontSize: 10,
    color: '#333',
  },
});

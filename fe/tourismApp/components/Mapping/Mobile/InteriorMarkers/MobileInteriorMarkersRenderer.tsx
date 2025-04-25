import React from 'react';
import { View, Text } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { markerTypes, MarkerType } from '~/components/Mapping/Indoor/Markers/markerTypes';

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
        const { id, coordinates, label, type, accessible } = marker;
        const markerInfo = markerTypes[type as MarkerType] || markerTypes.other;

        return (
            <MapboxGL.PointAnnotation
            key={id}
            id={id}
            coordinate={coordinates}
          >
            <View
              style={{
                backgroundColor: accessible ? '#2A9D8F' : '#F4A261',
                borderRadius: 20,
                padding: 6,
              }}
            >
              <Text style={{ fontSize: 14 }}>{markerInfo.fallbackEmoji}</Text>
            </View>
          
            <MapboxGL.Callout title={label || markerInfo.label} />
          </MapboxGL.PointAnnotation>
        );
      })}
    </>
  );
}

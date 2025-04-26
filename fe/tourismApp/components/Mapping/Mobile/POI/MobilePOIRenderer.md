import React from 'react';
import MapboxGL from '@rnmapbox/maps';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

// Props type definition for the MobilePOIRenderer component
type MobilePOIRendererProps = {
  pois: any[];
  selectedPOI?: any;
  onPOISelect?: (poi: any) => void;
};

// MobilePOIRenderer component for displaying POIs on the mobile map
export default function MobilePOIRenderer({
  pois,
  selectedPOI,
  onPOISelect,
}: MobilePOIRendererProps) {
  if (!pois || pois.length === 0) return null;

  return (
    <>
      {pois.map((poi) => {
        const coords = poi.geojson?.coordinates;
        if (!coords || coords.length !== 2) return null;

        return (
          <MapboxGL.PointAnnotation
            key={poi.id}
            id={`poi-${poi.id}`}
            coordinate={[coords[0], coords[1]]}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onPOISelect?.(poi)}
            >
              <View
                style={[
                  styles.poiMarker,
                  selectedPOI?.id === poi.id && styles.selectedMarker,
                  poi.hidden && styles.hiddenMarker,
                ]}
              />
            </TouchableOpacity>
          </MapboxGL.PointAnnotation>
        );
      })}
    </>
  );
}

// Styles for POI markers
const styles = StyleSheet.create({
  poiMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F4A261', // Normal visible POI
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  selectedMarker: {
    backgroundColor: '#2A9D8F', // Selected POI color
  },
  hiddenMarker: {
    backgroundColor: '#cccccc', // Hidden POI color
  },
});
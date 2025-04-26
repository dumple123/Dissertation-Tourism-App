import React from 'react';
import MapboxGL from '@rnmapbox/maps';
import { View, Text, StyleSheet } from 'react-native';

// Props type definition for the MobilePOIRenderer component
type MobilePOIRendererProps = {
  pois: any[];
  selectedPOI?: any;
  onPOISelect?: (poi: any) => void;
  zoomLevel: number;
};

// MobilePOIRenderer component for displaying POIs on the mobile map
export default function MobilePOIRenderer({
  pois,
  selectedPOI,
  onPOISelect,
  zoomLevel,
}: MobilePOIRendererProps) {
  if (!pois || pois.length === 0) return null;

  // Function to dynamically calculate marker size based on zoom level
  const getMarkerSize = () => {
    const minZoom = 12;
    const maxZoom = 20;
    const minSize = 8;   // Tiny marker at zoom 12
    const maxSize = 40;  // Big marker at zoom 20

    const clampedZoom = Math.min(Math.max(zoomLevel, minZoom), maxZoom);

    // Linear interpolation
    const t = (clampedZoom - minZoom) / (maxZoom - minZoom);
    return minSize + (maxSize - minSize) * t;
  };

  const markerSize = getMarkerSize();

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
            onSelected={() => onPOISelect?.(poi)}
          >
            {poi.hidden ? (
              <Text style={[
                styles.hiddenMarkerText,
                {
                  fontSize: markerSize * 0.6, // Scale the ? text size too
                }
              ]}>?</Text>
            ) : (
              <View
                style={[
                  styles.poiMarker,
                  {
                    width: markerSize,
                    height: markerSize,
                    borderRadius: markerSize / 2,
                  },
                  selectedPOI?.id === poi.id && styles.selectedMarker,
                ]}
              />
            )}
          </MapboxGL.PointAnnotation>
        );
      })}
    </>
  );
}

// Styles for POI markers
const styles = StyleSheet.create({
  /* Style for normal (visible) POI marker */
  poiMarker: {
    backgroundColor: '#F4A261',
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Style for selected POI marker */
  selectedMarker: {
    backgroundColor: '#2A9D8F',
  },

  /* Style for hidden POI marker (question mark) */
  hiddenMarkerText: {
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
});

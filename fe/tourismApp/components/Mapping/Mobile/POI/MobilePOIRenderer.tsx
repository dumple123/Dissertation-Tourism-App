import React from 'react';
import MapboxGL from '@rnmapbox/maps';
import { View, Text, StyleSheet } from 'react-native';
import { usePOIProgress } from '~/components/Mapping/Mobile/POI/POIProgressProvider';
import { Ionicons } from '@expo/vector-icons';

type MobilePOIRendererProps = {
  pois: any[];
  selectedPOI?: any;
  onPOISelect?: (poi: any) => void;
  zoomLevel: number;
};

export default function MobilePOIRenderer({
  pois,
  selectedPOI,
  onPOISelect,
  zoomLevel,
}: MobilePOIRendererProps) {
  const { visitedPOIIds } = usePOIProgress();

  if (!pois || pois.length === 0) return null;

  const getMarkerSize = () => {
    const minZoom = 12;
    const maxZoom = 20;
    const minSize = 8;
    const maxSize = 40;
    const clampedZoom = Math.min(Math.max(zoomLevel, minZoom), maxZoom);
    const t = (clampedZoom - minZoom) / (maxZoom - minZoom);
    return minSize + (maxSize - minSize) * t;
  };

  const markerSize = getMarkerSize();

  return (
    <>
      {pois.map((poi) => {
        const coords = poi.geojson?.coordinates;
        if (!coords || coords.length !== 2) return null;

        const isVisited = visitedPOIIds.has(poi.id);
        const shouldShowAsNormal = !poi.hidden || isVisited;

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
                { fontSize: markerSize * 0.6 }
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
                  isVisited && styles.visitedMarker,
                  selectedPOI?.id === poi.id && styles.selectedMarker,
                ]}
              >
                {isVisited && (
                  <Ionicons
                    name="checkmark"
                    size={markerSize * 0.5}  // Big tick
                    color="white"
                    style={styles.checkmarkIcon}
                  />
                )}
              </View>
            )}
          </MapboxGL.PointAnnotation>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  poiMarker: {
    backgroundColor: '#0077b6', // Default = Blue for unvisited
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedMarker: {
    borderColor: '#FFD700', // Highlight selected (gold border maybe?)
    borderWidth: 3,
  },
  visitedMarker: {
    backgroundColor: '#32CD32', // BRIGHT FRIENDLY GREEN
  },
  hiddenMarkerText: {
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  checkmarkIcon: {
    textAlign: 'center',
    textAlignVertical: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)', // Subtle shadow for pop effect
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

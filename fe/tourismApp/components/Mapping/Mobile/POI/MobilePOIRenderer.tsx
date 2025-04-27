import React, { useEffect, useRef } from 'react';
import MapboxGL from '@rnmapbox/maps';
import { View, Text, StyleSheet, Animated } from 'react-native';
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
    if (zoomLevel >= 16) {
      return 40; 
    } else if (zoomLevel >= 12) {
      const minZoom = 12;
      const maxZoom = 16;
      const minSize = 12;
      const maxSize = 40;
      const t = (zoomLevel - minZoom) / (maxZoom - minZoom);
      return minSize + (maxSize - minSize) * t; 
    } else {
      return 18; 
    }
  };

  const markerSize = getMarkerSize();

  // Sort POIs: itinerary first, then normal ones
  const sortedPOIs = [...pois].sort((a, b) => {
    if (a.type === 'itinerary' && b.type !== 'itinerary') return -1;
    if (b.type === 'itinerary' && a.type !== 'itinerary') return 1;
    return 0;
  });

  return (
    <>
      {sortedPOIs.map((poi) => {
        // Always declare hooks first!
        const scaleAnim = useRef(new Animated.Value(1)).current;
        const wasVisited = useRef(false);

        const coords = poi.geojson?.coordinates ?? poi.coords;
        const isVisited = visitedPOIIds.has(poi.id);
        const isItinerary = poi.type === 'itinerary';

        useEffect(() => {
          if (isVisited && !wasVisited.current) {
            wasVisited.current = true;
            Animated.sequence([
              Animated.timing(scaleAnim, {
                toValue: 2.2,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.delay(200),
              Animated.timing(scaleAnim, {
                toValue: 1.3,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
            ]).start();
          }
        }, [isVisited]);

        // Now safe to conditionally return
        if (!coords || coords.length !== 2) return null;

        return (
          <MapboxGL.PointAnnotation
            key={poi.id}
            id={`poi-${poi.id}`}
            coordinate={[coords[0], coords[1]]}
            onSelected={() => onPOISelect?.(poi)}
          >
            {poi.hidden && !isVisited ? (
              <Text style={[styles.hiddenMarkerText, { fontSize: markerSize * 1.2 }]}>?</Text>
            ) : (
              <Animated.View
                style={[
                  { transform: [{ scale: scaleAnim }] },
                  isItinerary ? styles.itineraryMarker : styles.poiMarker,
                  {
                    width: markerSize,
                    height: markerSize,
                    borderRadius: isItinerary ? 6 : markerSize / 2,
                  },
                  isVisited && styles.visitedMarker,
                  selectedPOI?.id === poi.id && styles.selectedMarker,
                ]}
              >
                {isVisited && (
                  <Ionicons
                    name="checkmark"
                    size={markerSize * 0.5}
                    color="white"
                    style={styles.checkmarkIcon}
                  />
                )}
              </Animated.View>
            )}
          </MapboxGL.PointAnnotation>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  poiMarker: {
    backgroundColor: '#0077b6',
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itineraryMarker: {
    backgroundColor: '#800080', 
    borderWidth: 3,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedMarker: {
    borderColor: '#FFD700', 
    borderWidth: 3,
  },
  visitedMarker: {
    backgroundColor: '#2ecc71', 
  },
  hiddenMarkerText: {
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  checkmarkIcon: {
    textAlign: 'center',
    textAlignVertical: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

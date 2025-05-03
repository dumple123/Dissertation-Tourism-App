import React, { useEffect, useRef, useState, useMemo } from 'react';
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
  const visitedThisSession = useRef<Set<string>>(new Set());

  // Per-POI animation state
  const animations = useMemo(() => {
    const animMap: Record<string, Animated.Value> = {};
    pois.forEach((poi) => {
      animMap[poi.id] = new Animated.Value(1);
    });
    return animMap;
  }, [pois]);

  const getMarkerSize = () => {
    if (zoomLevel >= 16) return 40;
    if (zoomLevel >= 12) return 12 + (zoomLevel - 12) * 7;
    return 18;
  };

  const markerSize = getMarkerSize();

  const sortedPOIs = [...pois].sort((a, b) =>
    a.type === 'itinerary' && b.type !== 'itinerary' ? -1 : 0
  );

  return (
    <>
      {sortedPOIs.map((poi) => {
        const coords = poi.geojson?.coordinates ?? poi.coords;
        if (!coords || coords.length !== 2) return null;

        const isVisited = visitedPOIIds.has(poi.id);
        const isItinerary = poi.type === 'itinerary';
        const scaleAnim = animations[poi.id];

        // Run animation once per POI visit
        useEffect(() => {
          if (isVisited && !visitedThisSession.current.has(poi.id)) {
            visitedThisSession.current.add(poi.id);
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

        return (
          <MapboxGL.PointAnnotation
            key={`${poi.id}-${isVisited ? 'v' : 'u'}`} // This is critical to force re-render
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

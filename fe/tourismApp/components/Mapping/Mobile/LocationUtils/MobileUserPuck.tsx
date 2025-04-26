import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import MapboxGL from '@rnmapbox/maps';

interface MobileUserPuckProps {
  coords: [number, number];
  heading?: number;
  zoomLevel?: number;
}

export default function MobileUserPuck({ coords, heading = 0, zoomLevel = 14 }: MobileUserPuckProps) {
  const [smoothedCoords, setSmoothedCoords] = useState<[number, number]>(coords);
  const sizeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Smooth movement
  useEffect(() => {
    const SMOOTHING_FACTOR = 0.2;
    setSmoothedCoords((prev) => {
      if (!prev) return coords;
      return [
        prev[0] + (coords[0] - prev[0]) * SMOOTHING_FACTOR,
        prev[1] + (coords[1] - prev[1]) * SMOOTHING_FACTOR,
      ];
    });
  }, [coords]);

  // Pulsing animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Smooth size scaling based on zoom level
  useEffect(() => {
    const getSize = () => {
      const minZoom = 12;
      const maxZoom = 20;
      const minSize = 16;
      const maxSize = 40;
      const clampedZoom = Math.min(Math.max(zoomLevel || 14, minZoom), maxZoom);
      const t = (clampedZoom - minZoom) / (maxZoom - minZoom);
      return minSize + (maxSize - minSize) * t;
    };

    const newSize = getSize() / 24; 
    Animated.timing(sizeAnim, {
      toValue: newSize,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [zoomLevel]);

  if (!coords) return null;

  return (
    <MapboxGL.PointAnnotation id="mobile-user-puck" coordinate={smoothedCoords}>
      <Animated.View style={[styles.container, { transform: [{ scale: sizeAnim }] }]}>
        
        {/* FOV Cone */}
        <Animated.View
          style={[
            styles.fovCone,
            {
              transform: [
                { translateY: -30 },
                { rotate: `${heading}deg` },
              ],
            },
          ]}
        />

        {/* Outer pulsing circle */}
        <Animated.View style={[styles.outerCircle, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.innerCircle} />
        </Animated.View>
      </Animated.View>
    </MapboxGL.PointAnnotation>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fovCone: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: 'rgba(42, 157, 143, 0.2)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  outerCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(42, 157, 143, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2A9D8F',
  },
});

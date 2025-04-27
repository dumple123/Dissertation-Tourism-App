import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import * as turf from '@turf/turf';
import type { FeatureCollection, Geometry } from 'geojson';

interface MobileUserPuckProps {
  coords: [number, number];
  heading?: number;
}

export default function MobileUserPuck({ coords, heading = 0 }: MobileUserPuckProps) {
  const [smoothedCoords, setSmoothedCoords] = useState<[number, number]>(coords);

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

  if (!coords) return null;

  const buffered = turf.buffer(turf.point(smoothedCoords), 30, { units: 'meters' });

  const circleGeoJSON: FeatureCollection<Geometry> = {
    type: 'FeatureCollection',
    features: buffered ? [buffered as any] : [],
  };

  return (
    <>
      {/* 30m Real Range Circle */}
      <MapboxGL.ShapeSource id="user-puck-buffer" shape={circleGeoJSON}>
        <MapboxGL.FillLayer
          id="user-range-fill"
          style={{
            fillColor: 'rgba(0, 119, 182, 0.2)',
            fillOutlineColor: 'rgba(0, 119, 182, 0.5)',
          }}
        />
      </MapboxGL.ShapeSource>

      {/* Central User Puck */}
      <MapboxGL.PointAnnotation id="mobile-user-puck" coordinate={smoothedCoords}>
        <View style={styles.container}>
          <View style={styles.innerCircle} />
        </View>
      </MapboxGL.PointAnnotation>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 20,
    height: 20,
    backgroundColor: '#2A9D8F',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 10,
    height: 10,
    backgroundColor: '#2A9D8F',
    borderRadius: 5,
  },
});

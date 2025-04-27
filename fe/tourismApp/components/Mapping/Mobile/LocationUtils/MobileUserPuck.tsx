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

  // 30m full circle
  const buffered = turf.buffer(turf.point(smoothedCoords), 30, { units: 'meters' });

  // 30m 200° sector
  const sectorPolygon = generateSector(smoothedCoords, heading, 30, 120);

  const circleGeoJSON: FeatureCollection<Geometry> = {
    type: 'FeatureCollection',
    features: buffered ? [buffered as any] : [],
  };

  const sectorGeoJSON: FeatureCollection<Geometry> = {
    type: 'FeatureCollection',
    features: sectorPolygon ? [sectorPolygon as any] : [],
  };

  return (
    <>
      {/* 30m Circle */}
      <MapboxGL.ShapeSource id="user-circle-buffer" shape={circleGeoJSON}>
        <MapboxGL.FillLayer
          id="user-range-fill"
          style={{
            fillColor: 'rgba(0, 119, 182, 0.2)',
            fillOutlineColor: 'rgba(0, 119, 182, 0.5)',
          }}
        />
      </MapboxGL.ShapeSource>

      {/* 30m FOV Sector */}
      <MapboxGL.ShapeSource id="user-fov-sector" shape={sectorGeoJSON}>
        <MapboxGL.FillLayer
          id="user-fov-fill"
          style={{
            fillColor: 'rgba(0, 119, 182, 0.35)', // darker blue
            fillOutlineColor: 'rgba(0, 119, 182, 0.5)',
          }}
        />
      </MapboxGL.ShapeSource>

      {/* Center user puck */}
      <MapboxGL.PointAnnotation id="mobile-user-puck" coordinate={smoothedCoords}>
        <View style={styles.container}>
          <View style={styles.innerCircle} />
        </View>
      </MapboxGL.PointAnnotation>
    </>
  );
}

// -- Generate a 200 degree sector centered at heading
function generateSector(center: [number, number], heading: number, radiusMeters: number, angleWidth: number) {
  const steps = 64;
  const coords = [];
  const startAngle = heading - angleWidth / 2;
  const endAngle = heading + angleWidth / 2;

  coords.push(center); 

  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + (i / steps) * (endAngle - startAngle);
    const point = turf.destination(center, radiusMeters, angle, { units: 'meters' });
    coords.push(point.geometry.coordinates);
  }
  coords.push(center); 

  return turf.polygon([coords]);
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

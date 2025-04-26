import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { usePOIProgress } from './POIProgressProvider';

const SIZE = 90;
const STROKE_WIDTH = 8;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function POIProgressCircle() {
  const { visitedPOIIds, totalPOIs } = usePOIProgress();
  const [warnedNoPOIs, setWarnedNoPOIs] = useState(false);

  useEffect(() => {
    if (totalPOIs === 0 && !warnedNoPOIs) {
      console.log('[POIProgressCircle] No POIs loaded yet, hiding tracker');
      setWarnedNoPOIs(true); // Only log once until POIs appear
    }
    if (totalPOIs > 0 && warnedNoPOIs) {
      setWarnedNoPOIs(false); // Reset if POIs later load
    }
  }, [totalPOIs, warnedNoPOIs]);

  if (totalPOIs === 0) {
    return null;
  }

  const visitedPOIs = visitedPOIIds.size;
  const progress = visitedPOIs / totalPOIs;
  const percentage = Math.round(progress * 100);

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        {/* Background Circle */}
        <Circle
          stroke="#d3d3d3"
          fill="none"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE_WIDTH}
        />
        {/* Progress Arc */}
        <Circle
          stroke="#2A9D8F"
          fill="none"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>

      {/* Percentage Text */}
      <View style={styles.textContainer}>
        <Text style={styles.percentageText}>
          {`${percentage}%`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: SIZE / 2,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  textContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#264653',
  },
});

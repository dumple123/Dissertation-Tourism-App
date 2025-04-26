import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { usePOIProgress } from './POIProgressProvider'; 
import { useSelectedMap } from '../SelectedMapContext'; 

const SIZE = 90;            // Overall size (slightly smaller for subtle look)
const STROKE_WIDTH = 8;     // Stroke width
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function POIProgressCircle() {
  const { visitedPOIIds } = usePOIProgress();
  const { selectedMap } = useSelectedMap();

  const totalPOIs = 20; //TEMPORARY: Replace with real total from your selectedMap
  const visitedPOIs = visitedPOIIds.size;

  const progress = totalPOIs > 0 ? visitedPOIs / totalPOIs : 0;
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
        <Text style={styles.percentageText}>{percentage}%</Text>
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
    elevation: 6, // Android shadow
    shadowColor: '#000', // iOS shadow
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
    color: '#264653', // Slightly darker for better contrast
  },
});

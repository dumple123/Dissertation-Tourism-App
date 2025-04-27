import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { usePOIProgress } from './POIProgressProvider';

const SIZE = 90;
const STROKE_WIDTH = 14;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function POIProgressCircle() {
  const { visitedPOIIds, totalPOIs } = usePOIProgress();
  const [warnedNoPOIs, setWarnedNoPOIs] = useState(false);
  const [showRawCount, setShowRawCount] = useState(false);

  useEffect(() => {
    if (totalPOIs === 0 && !warnedNoPOIs) {
      console.log('[POIProgressCircle] No POIs loaded yet, hiding tracker');
      setWarnedNoPOIs(true);
    }
    if (totalPOIs > 0 && warnedNoPOIs) {
      setWarnedNoPOIs(false);
    }
  }, [totalPOIs, warnedNoPOIs]);

  if (totalPOIs === 0) {
    return null;
  }

  const visitedPOIs = visitedPOIIds.size;
  const progress = visitedPOIs / totalPOIs;
  const percentage = Math.round(progress * 100);

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const handleToggle = () => {
    setShowRawCount((prev) => !prev);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleToggle} activeOpacity={0.8}>
      <Svg width={SIZE} height={SIZE}>
        {/* Background Circle */}
        <Circle
          stroke="#e0e0e0"
          fill="none"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE_WIDTH}
        />
        {/* Progress Arc */}
        <Circle
          stroke="#0077b6"
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

      {/* Text */}
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.percentageText,
            showRawCount && styles.rawCountText, 
          ]}
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {showRawCount
            ? `${visitedPOIs}/${totalPOIs} POIs Visited`
            : `${percentage}%`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: SIZE / 2,
  },
  textContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  percentageText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#264653',
    textAlign: 'center',
  },
  rawCountText: {
    fontSize: 14, // Slightly smaller for x/y POIs
  },
});

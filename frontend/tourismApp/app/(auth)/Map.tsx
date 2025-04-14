import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapViewComponent from '~/components/Mapping/MapViewComponent';

export default function MapPage() {
  return (
    <View style={styles.container}>
      <MapViewComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
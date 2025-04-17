import React, { useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

export default function MapPage() {
  const MapViewComponent = useMemo(() => {
    if (Platform.OS === 'web') {
      return require('~/components/Mapping/MapViewComponentWeb').default;
    } else {
      return require('~/components/Mapping/MapViewComponentNative').default;
    }
  }, []);

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

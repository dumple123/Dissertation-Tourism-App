import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Constants from 'expo-constants';

MapboxGL.setAccessToken(Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN);

export default function MapViewComponent() {
  const [coords, setCoords] = useState<[number, number]>([-1.615, 54.978]);

  return (
    <View style={styles.container}>
      <MapboxGL.MapView style={styles.map}>
        <MapboxGL.Camera zoomLevel={14} centerCoordinate={coords} />
        <MapboxGL.UserLocation visible={true} onUpdate={(loc) => {
          setCoords([loc.coords.longitude, loc.coords.latitude]);
        }} />
      </MapboxGL.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
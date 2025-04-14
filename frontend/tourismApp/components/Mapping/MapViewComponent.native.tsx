import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';

MapboxGL.setAccessToken('pk.eyJ1IjoiZHVtcGxlMTIzIiwiYSI6ImNtOWFhbDd2YzAzMWoyaXNnemY3ZmkxamEifQ.l0vmJeNqgqNpL7vD94RrMA');

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
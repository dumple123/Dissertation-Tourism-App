import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { getUserCompletedMaps } from '~/api/map';
import Constants from 'expo-constants';

MapboxGL.setAccessToken(Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN);

interface CompletedMap {
  id: string;
  name: string;
  completionRate: number;
  pois: { geojson: any }[];
}

export default function CompletedMapsProfile({ userId }: { userId: string }) {
  const [completedMaps, setCompletedMaps] = useState<CompletedMap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompletedMaps() {
      try {
        const data = await getUserCompletedMaps(userId);
        setCompletedMaps(data);
      } catch (err) {
        console.error('Failed to fetch completed maps:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCompletedMaps();
  }, [userId]);

  const getCenter = (pois: { geojson: any }[]) => {
    const coords = pois
      .map(poi => {
        if (
          poi?.geojson?.coordinates &&
          Array.isArray(poi.geojson.coordinates) &&
          poi.geojson.coordinates.length === 2
        ) {
          const [lng, lat] = poi.geojson.coordinates;
          return { lat, lng }; 
        }
        return null;
      })
      .filter((c): c is { lat: number; lng: number } => c !== null);
  
    if (coords.length === 0) {
      return { latitude: 0, longitude: 0 };
    }
  
    const avgLat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
    const avgLng = coords.reduce((sum, c) => sum + c.lng, 0) / coords.length;
  
    return { latitude: avgLat, longitude: avgLng };
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL={MapboxGL.StyleURL.Street}
        scrollEnabled={true}  
        zoomEnabled={false}    
        rotateEnabled={false}  
        pitchEnabled={false}   
        scaleBarEnabled={false}
        attributionEnabled={false}
        logoEnabled={false}
      >
        <MapboxGL.Camera
          centerCoordinate={[0, 0]}
          zoomLevel={1.5}
          animationMode="flyTo"
          animationDuration={0}
        />

        {completedMaps.map(map => {
          const center = getCenter(map.pois);
          return (
            <MapboxGL.PointAnnotation
              key={map.id}
              id={map.id}
              coordinate={[center.longitude, center.latitude]}
            >
              <View style={styles.marker} />
              <MapboxGL.Callout title={`${map.name} (${(map.completionRate * 100).toFixed(0)}%)`} />
            </MapboxGL.PointAnnotation>
          );
        })}
      </MapboxGL.MapView>

      {/* Friendly overlay if no completions */}
      {completedMaps.length === 0 && (
        <View style={styles.noPinsOverlay}>
          <Text style={styles.noPinsText}>No completed maps yet. Explore to unlock pins!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 400,
    width: '100%',
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2A9D8F',
    borderWidth: 2,
    borderColor: 'white',
  },
  noPinsOverlay: {
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
    marginTop: -10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  noPinsText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
});

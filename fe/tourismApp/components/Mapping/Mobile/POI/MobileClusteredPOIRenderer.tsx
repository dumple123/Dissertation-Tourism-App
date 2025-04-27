import React, { useMemo } from 'react';
import MapboxGL from '@rnmapbox/maps';
import { StyleSheet } from 'react-native';
import type { FeatureCollection, Point } from 'geojson';

// Props type definition for the MobileClusteredPOIRenderer component
type MobileClusteredPOIRendererProps = {
  pois: any[];
  onPOISelect?: (poi: any) => void;
  cameraRef?: React.RefObject<MapboxGL.Camera>;
  zoomLevel: number;
};

export default function MobileClusteredPOIRenderer({ pois, onPOISelect, cameraRef, zoomLevel }: MobileClusteredPOIRendererProps) {
  // Create GeoJSON FeatureCollection dynamically from POIs
  const poiGeoJSON = useMemo<FeatureCollection<Point>>(() => ({
    type: "FeatureCollection",
    features: pois.map((poi: any) => ({
      type: "Feature",
      geometry: poi.geojson,
      properties: {
        id: poi.id,
        name: poi.name,
        hidden: poi.hidden,
        type: poi.type ?? 'normal',
      },
    })),
  }), [pois]);

  if (!pois || pois.length === 0) return null;

  return (
    <MapboxGL.ShapeSource
      id="poi-source"
      shape={poiGeoJSON}
      cluster={true}
      clusterRadius={50}
      onPress={(e) => {
        const feature = e.features?.[0];
        if (!feature || !feature.properties) return;
      
        const isCluster = feature.properties.cluster;
        const coordinates = (feature.geometry as Point).coordinates; 
      
        if (isCluster) {
          // If cluster tapped, zoom in closer manually (no need to call getClusterExpansionZoom)
          cameraRef?.current?.setCamera({
            centerCoordinate: coordinates,
            zoomLevel: zoomLevel + 2,
            animationDuration: 500,
          });
        } else {
          // Individual POI tapped
          const poiId = feature.properties.id;
          const poi = pois.find((p) => p.id === poiId);
          if (poi) {
            onPOISelect?.(poi);

            // Also pan to the POI
            cameraRef?.current?.setCamera({
              centerCoordinate: coordinates,
              zoomLevel: 17,
              animationDuration: 500,
            });
          }
        }
      }}
    >
      {/* Render unclustered individual POI markers */}
      <MapboxGL.SymbolLayer
        id="poi-symbols"
        filter={['!', ['has', 'point_count']]}
        style={layerStyles.poiMarker}
      />

      {/* Render clusters with animated pop apart */}
      <MapboxGL.CircleLayer
        id="clustered-points"
        filter={['has', 'point_count']}
        style={layerStyles.clusteredCircle}
      />

      {/* Render cluster count numbers */}
      <MapboxGL.SymbolLayer
        id="cluster-count"
        filter={['has', 'point_count']}
        style={layerStyles.clusterCountText}
      />
    </MapboxGL.ShapeSource>
  );
}

// Styles for marker layers
const layerStyles = {
  /* Style for individual (unclustered) POI markers */
  poiMarker: {
    iconImage: 'marker-15',
    iconSize: [
      'interpolate',
      ['linear'],
      ['zoom'],
      0, 1.3,   
      5, 1.3,
      10, 1.2,  
      16, 1.4,   
      20, 1.6,   
    ],
    iconAllowOverlap: true,
    iconIgnorePlacement: true,
    textIgnorePlacement: true,
  },

  /* Style for clustered points (animated circle pop apart effect) */
  clusteredCircle: {
    circleRadius: [
      'interpolate',
      ['linear'],
      ['zoom'],
      0, 20,
      15, 16,
      18, 0
    ],
    circleColor: '#E76F51',
    circleOpacity: [
      'interpolate',
      ['linear'],
      ['zoom'],
      0, 0.8,
      15, 0.6,
      18, 0
    ],
    circleStrokeWidth: 2,
    circleStrokeColor: '#ffffff',
  },

  /* Style for cluster count label */
  clusterCountText: {
    textField: '{point_count_abbreviated}',
    textSize: 12,
    textColor: '#ffffff',
    textIgnorePlacement: true,
    textAllowOverlap: true,
  },
};

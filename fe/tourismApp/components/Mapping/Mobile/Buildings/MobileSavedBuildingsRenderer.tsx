import React from 'react';
import MapboxGL from '@rnmapbox/maps';
import type { FeatureCollection, Feature } from 'geojson';

interface Building {
  id: string;
  name: string;
  geojson: Feature;
}

interface Props {
  buildings: Building[];
  selectedFloor?: number;
  onBuildingPress?: (buildingId: string) => void;
}

const MobileSavedBuildingsRenderer: React.FC<Props> = ({
  buildings,
  selectedFloor,
  onBuildingPress,
}) => {
  const filteredFeatures: Feature[] = buildings
    .filter((b) => {
      const floor = b.geojson?.properties?.floor;
      return selectedFloor === undefined || floor === selectedFloor;
    })
    .map((b): Feature => ({
      ...b.geojson,
      properties: {
        ...(b.geojson.properties ?? {}),
        id: b.id,
        name: b.name,
      },
    }))
    .filter((f) => f && f.type === 'Feature');

  const featureCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features: filteredFeatures,
  };

  if (filteredFeatures.length === 0) return null;

  return (
    <MapboxGL.ShapeSource
      id="mobile-saved-buildings"
      shape={featureCollection}
      onPress={(e) => {
        const feature = e.features?.[0];
        if (feature?.properties?.id) {
          onBuildingPress?.(feature.properties.id); // pass id back to parent
        }
      }}
    >
      <MapboxGL.FillLayer
        id="mobile-saved-buildings-fill"
        style={{
          fillColor: '#E76F51',
          fillOpacity: 0.2,
        }}
      />
      <MapboxGL.LineLayer
        id="mobile-saved-buildings-outline"
        style={{
          lineColor: '#E76F51',
          lineWidth: 2,
        }}
      />
    </MapboxGL.ShapeSource>
  );
};

export default MobileSavedBuildingsRenderer;
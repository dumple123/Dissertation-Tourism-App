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
  selectedBuildingId?: string;
  onBuildingPress?: (buildingId: string) => void;
}

const MobileSavedBuildingsRenderer: React.FC<Props> = ({
  buildings,
  selectedFloor,
  selectedBuildingId,
  onBuildingPress,
}) => {
  const features: Feature[] = buildings.map((b) => {
    const floor = b.geojson?.properties?.floor;
    const isSelected = b.id === selectedBuildingId;

    return {
      ...b.geojson,
      properties: {
        ...(b.geojson.properties ?? {}),
        id: b.id,
        name: b.name,
        selected: isSelected,
        hidden:
          isSelected &&
          selectedFloor !== undefined &&
          floor !== undefined &&
          floor !== selectedFloor,
      },
    };
  });

  const featureCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features,
  };

  return (
    <MapboxGL.ShapeSource
      id="mobile-saved-buildings"
      shape={featureCollection}
      onPress={(e) => {
        const feature = e.features?.[0];
        if (feature?.properties?.id) {
          onBuildingPress?.(feature.properties.id);
        }
      }}
    >
      <MapboxGL.FillLayer
        id="mobile-saved-buildings-fill"
        style={{
          fillColor: [
            'case',
            ['==', ['get', 'selected'], true],
            '#264653',
            '#E76F51',
          ],
          fillOpacity: [
            'case',
            ['==', ['get', 'hidden'], true],
            0,
            0.2,
          ],
        }}
      />
      <MapboxGL.LineLayer
        id="mobile-saved-buildings-outline"
        style={{
          lineColor: '#E76F51',
          lineWidth: [
            'case',
            ['==', ['get', 'hidden'], true],
            0,
            2,
          ],
        }}
      />
    </MapboxGL.ShapeSource>
  );
};

export default MobileSavedBuildingsRenderer;

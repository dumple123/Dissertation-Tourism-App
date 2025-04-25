import React from 'react';
import MapboxGL from '@rnmapbox/maps';
import type { FeatureCollection, Feature } from 'geojson';

interface Room {
  id: string;
  name: string;
  floor: number;
  buildingId: string;
  accessible: boolean;
  isArea: boolean;
  geojson: Feature;
}

interface Props {
  rooms: Room[];
  selectedFloor?: number;
}

const MobileSavedRoomsRenderer: React.FC<Props> = ({ rooms, selectedFloor }) => {
  // Convert rooms to feature collection filtered by floor
  const features: Feature[] = rooms
    .filter((room) => selectedFloor === undefined || room.floor === selectedFloor)
    .map((room) => ({
      ...room.geojson,
      properties: {
        ...(room.geojson.properties ?? {}),
        id: room.id,
        name: room.name,
        floor: room.floor,
        accessible: room.accessible,
        isArea: room.isArea,
      },
    }));

  const featureCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features,
  };

  if (features.length === 0) return null;

  return (
    <MapboxGL.ShapeSource id="mobile-saved-rooms" shape={featureCollection}>
      <MapboxGL.FillLayer
        id="mobile-saved-rooms-fill"
        style={{
          fillColor: [
            'case',
            ['==', ['get', 'accessible'], false],
            '#e63946', // red if inaccessible
            '#219ebc', // blue if accessible
          ],
          fillOpacity: 0.4,
        }}
      />
      <MapboxGL.LineLayer
        id="mobile-saved-rooms-outline"
        filter={['==', ['get', 'isArea'], false]}
        style={{
          lineColor: '#023047',
          lineWidth: 1.5,
        }}
      />
    </MapboxGL.ShapeSource>
  );
};

export default MobileSavedRoomsRenderer;

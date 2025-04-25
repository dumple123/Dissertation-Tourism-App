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
}

export default function MobileSavedRoomsRenderer({ rooms }: Props) {
  const roomFeatures: Feature[] = rooms.map((r) => ({
    ...r.geojson,
    properties: {
      ...(r.geojson.properties ?? {}),
      id: r.id,
      name: r.name,
      floor: r.floor,
      accessible: r.accessible,
      isArea: r.isArea,
    },
  }));

  const featureCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features: roomFeatures,
  };

  if (roomFeatures.length === 0) return null;

  return (
    <MapboxGL.ShapeSource id="mobile-saved-rooms" shape={featureCollection}>
      {/* Fill layer with conditional red for non-accessible */}
      <MapboxGL.FillLayer
        id="mobile-saved-rooms-fill"
        style={{
          fillColor: [
            'case',
            ['==', ['get', 'accessible'], false],
            '#e63946', // red for non-accessible
            '#219ebc', // blue for accessible
          ],
          fillOpacity: 0.4,
        }}
      />

      {/* Outline only for rooms that are not areas */}
      <MapboxGL.LineLayer
        id="mobile-saved-rooms-outline"
        filter={['==', ['get', 'isArea'], false]}
        style={{
          lineColor: '#023047',
          lineWidth: 1.5,
        }}
      />

      {/* Label layer for room names */}
      <MapboxGL.SymbolLayer
        id="mobile-saved-rooms-label"
        style={{
          textField: ['get', 'name'],
          textSize: 12,
          textColor: '#000',
          textHaloColor: '#fff',
          textHaloWidth: 1,
          textAllowOverlap: false,
          textAnchor: 'center',
        }}
      />
    </MapboxGL.ShapeSource>
  );
}


import React from 'react';
import MapboxGL from '@rnmapbox/maps';
import type { FeatureCollection, Feature } from 'geojson';
import area from '@turf/area';
import { feature as turfFeature } from '@turf/helpers';

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
  const processedFeatures: Feature[] = rooms.map((r) => {
    const turf = turfFeature(r.geojson.geometry);
    const roomArea = area(turf); // in square meters

    const TRUNCATE_LENGTH = roomArea < 40 ? 8 : 20;
    let label = r.name;

    if (label.length > TRUNCATE_LENGTH) {
      label = label.slice(0, TRUNCATE_LENGTH - 1) + '…';
    }

    return {
      ...r.geojson,
      properties: {
        ...(r.geojson.properties ?? {}),
        id: r.id,
        name: label,
        floor: r.floor,
        accessible: r.accessible,
        isArea: r.isArea,
      },
    };
  });

  const featureCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features: processedFeatures,
  };

  if (processedFeatures.length === 0) return null;

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
        minZoomLevel={16}
        style={{
          textField: ['get', 'name'],
          textSize: 12,
          textColor: '#000',
          textHaloColor: '#fff',
          textHaloWidth: 1,
          textAllowOverlap: false,
          textAnchor: 'center',
          textJustify: 'center',
          textMaxWidth: 6,
        }}
      />
    </MapboxGL.ShapeSource>
  );
}

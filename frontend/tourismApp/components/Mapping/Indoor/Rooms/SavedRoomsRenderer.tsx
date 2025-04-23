import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import type { FeatureCollection } from 'geojson';
import { useDrawingContext } from '../Drawing/useDrawing';

interface Props {
  map: mapboxgl.Map;
  rooms: {
    id: string;
    name: string;
    floor: number;
    buildingId: string;
    geojson: {
      type: 'Feature';
      geometry: {
        type: 'Polygon';
        coordinates: [number, number][][];
      };
      properties: any;
    };
  }[];
}

export default function SavedRoomsRenderer({ map, rooms }: Props) {
  const { isDrawing } = useDrawingContext();

  useEffect(() => {
    // Hide saved rooms while in drawing mode
    if (isDrawing || rooms.length === 0) return;

    const sourceId = 'saved-rooms';
    const fillId = 'saved-rooms-fill';
    const outlineId = 'saved-rooms-outline';
    const labelId = 'saved-rooms-label'; // Symbol layer for room names

    // Convert rooms to GeoJSON FeatureCollection
    const features = rooms
      .map((r) => ({
        ...r.geojson,
        properties: {
          ...r.geojson.properties,
          id: r.id,
          name: r.name,
          floor: r.floor,
          buildingId: r.buildingId,
        },
      }))
      .filter((f) => f && f.type === 'Feature');

    const featureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features,
    };

    const addLayers = () => {
      // If source exists, update data
      if (map.getSource(sourceId)) {
        const src = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
        src.setData(featureCollection);
        return;
      }

      // Add source for saved rooms
      map.addSource(sourceId, {
        type: 'geojson',
        data: featureCollection,
      });

      // Fill layer
      map.addLayer({
        id: fillId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': '#219ebc',
          'fill-opacity': 0.4,
        },
      });

      // Outline layer
      map.addLayer({
        id: outlineId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#023047',
          'line-width': 1.5,
        },
      });

      // Label layer for room names
      map.addLayer({
        id: labelId,
        type: 'symbol',
        source: sourceId,
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 12,
          'text-anchor': 'center',
        },
        paint: {
          'text-color': '#000',
          'text-halo-color': '#fff',
          'text-halo-width': 1.5,
        },
      });
    };

    if (!map.isStyleLoaded()) {
      map.once('style.load', addLayers);
    } else {
      addLayers();
    }

    return () => {
      // Cleanup on unmount or rerender
      try {
        if (map.getLayer(fillId)) map.removeLayer(fillId);
        if (map.getLayer(outlineId)) map.removeLayer(outlineId);
        if (map.getLayer(labelId)) map.removeLayer(labelId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch (err) {
        console.warn('Error cleaning up saved room layers:', err);
      }
    };
  }, [map, rooms, isDrawing]);

  return null;
}

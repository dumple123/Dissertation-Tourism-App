import { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import type { FeatureCollection } from 'geojson';
import area from '@turf/area';
import { feature as turfFeature } from '@turf/helpers';
import { useDrawingContext } from '../Drawing/useDrawing';

interface Props {
  map: mapboxgl.Map;
  rooms: {
    id: string;
    name: string;
    floor: number;
    buildingId: string;
    accessible: boolean;
    isArea: boolean;
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
  const [refreshKey, setRefreshKey] = useState(0);

  // Trigger label refresh on zoom change
  useEffect(() => {
    const update = () => setRefreshKey((n) => n + 1);
    map.on('zoom', update);
    return () => {
      map.off('zoom', update);
    };
  }, [map]);

  // Render static room shapes (fill and outline)
  useEffect(() => {
    if (isDrawing || rooms.length === 0) return;

    const sourceId = 'saved-rooms';
    const fillId = 'saved-rooms-fill';
    const outlineId = 'saved-rooms-outline';

    const staticFeatures: FeatureCollection = {
      type: 'FeatureCollection',
      features: rooms.map((r) => ({
        ...r.geojson,
        type: 'Feature' as const,
        properties: {
          id: r.id,
          floor: r.floor,
          buildingId: r.buildingId,
          accessible: r.accessible,
          isArea: r.isArea,
        },
      })),
    };

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: staticFeatures,
      });

      map.addLayer({
        id: fillId,
        type: 'fill',
        source: sourceId,
        paint: {
          // Fill red with stripes for inaccessible rooms, else blue
          'fill-color': [
            'case',
            ['==', ['get', 'accessible'], false],
            '#e63946', // red
            '#219ebc', // default blue
          ],
          'fill-opacity': 0.4,
          'fill-pattern': [
            'case',
            ['==', ['get', 'accessible'], false],
            'diagonal-stripe',
            '',
          ],
        },
      });

      map.addLayer({
        id: outlineId,
        type: 'line',
        source: sourceId,
        filter: ['==', ['get', 'isArea'], false], // hide border for areas
        paint: {
          'line-color': '#023047',
          'line-width': 1.5,
        },
      });

      // Add stripe pattern if not already added
      if (!map.hasImage('diagonal-stripe')) {
        const canvas = document.createElement('canvas');
        canvas.width = 8;
        canvas.height = 8;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = 'rgba(230, 57, 70, 0.5)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, 8);
          ctx.lineTo(8, 0);
          ctx.stroke();
        }
        createImageBitmap(canvas).then((imageBitmap) => {
          map.addImage('diagonal-stripe', imageBitmap, { pixelRatio: 2 });
        });
      }
    }

    return () => {
      try {
        if (map.getLayer(fillId)) map.removeLayer(fillId);
        if (map.getLayer(outlineId)) map.removeLayer(outlineId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch (err) {
        console.warn('Error cleaning up saved room layers:', err);
      }
    };
  }, [map, rooms, isDrawing]);

  // Render or update labels dynamically on zoom
  useEffect(() => {
    if (isDrawing || rooms.length === 0) return;

    const sourceId = 'saved-room-labels';
    const labelId = 'saved-rooms-label';
    const MIN_AREA_METERS = 10;
    const TRUNCATE_NAME_LENGTH = 10;

    const zoom = map.getZoom();

    const labelFeatures: FeatureCollection = {
      type: 'FeatureCollection',
      features: rooms.map((r) => {
        const turf = turfFeature(r.geojson.geometry);
        const roomArea = area(turf);

        const minZoomToShowLabel =
          roomArea < 20 ? 20 :
          roomArea < 40 ? 19 :
          roomArea < 80 ? 18 :
          roomArea < 150 ? 17 :
          16;

        let label = r.name;
        if (zoom < minZoomToShowLabel || roomArea < MIN_AREA_METERS) {
          label = '';
        } else if (roomArea < 40 && label.length > TRUNCATE_NAME_LENGTH) {
          label = label.slice(0, TRUNCATE_NAME_LENGTH - 1) + '…';
        }

        return {
          type: 'Feature' as const,
          geometry: r.geojson.geometry,
          properties: {
            id: r.id,
            name: label,
            floor: r.floor,
            buildingId: r.buildingId,
          },
        };
      }),
    };

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: labelFeatures,
      });

      map.addLayer({
        id: labelId,
        type: 'symbol',
        source: sourceId,
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 12,
          'text-max-width': 6,
          'text-anchor': 'center',
          'text-justify': 'center',
          'text-offset': [0, 0],
          'text-allow-overlap': false,
          'symbol-placement': 'point',
          'symbol-avoid-edges': true,
        },
        paint: {
          'text-color': '#000',
          'text-halo-color': '#fff',
          'text-halo-width': 1.5,
        },
      });
    } else {
      const src = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
      src.setData(labelFeatures);
    }

    return () => {
      try {
        if (map.getLayer(labelId)) map.removeLayer(labelId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch (err) {
        console.warn('Error cleaning up room label layer:', err);
      }
    };
  }, [map, rooms, isDrawing, refreshKey]);

  return null;
}

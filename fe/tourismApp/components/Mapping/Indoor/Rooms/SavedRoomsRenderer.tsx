import { useEffect } from 'react';
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
  const sourceId = 'saved-rooms';
  const fillId = 'saved-rooms-fill';
  const outlineId = 'saved-rooms-outline';
  const labelSourceId = 'saved-room-labels';
  const labelId = 'saved-rooms-label';

  // render room shapes (fill and outline)
  useEffect(() => {
    if (!map) return;

    // cleanup old layers and sources
    const cleanup = () => {
      try {
        if (map.getLayer(fillId)) map.removeLayer(fillId);
        if (map.getLayer(outlineId)) map.removeLayer(outlineId);
        if (map.getLayer(labelId)) map.removeLayer(labelId);

        if (map.getSource(sourceId)) map.removeSource(sourceId);
        if (map.getSource(labelSourceId)) map.removeSource(labelSourceId);
      } catch (err) {
        console.warn('error cleaning up old room layers:', err);
      }
    };

    cleanup(); // always cleanup first

    if (rooms.length === 0) return; // nothing to draw if no rooms

    const features: FeatureCollection = {
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
          name: r.name,
        },
      })),
    };

    // add source
    map.addSource(sourceId, { type: 'geojson', data: features });

    // add fill layer
    map.addLayer({
      id: fillId,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': [
          'case',
          ['==', ['get', 'accessible'], false],
          '#e63946',
          '#219ebc',
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

    // add outline layer
    map.addLayer({
      id: outlineId,
      type: 'line',
      source: sourceId,
      filter: ['==', ['get', 'isArea'], false],
      paint: {
        'line-color': '#023047',
        'line-width': 1.5,
      },
    });

    const zoom = map.getZoom();
    const MIN_AREA_METERS = 10;
    const TRUNCATE_NAME_LENGTH = 10;

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

    // add label source
    map.addSource(labelSourceId, { type: 'geojson', data: labelFeatures });

    // add label layer
    map.addLayer({
      id: labelId,
      type: 'symbol',
      source: labelSourceId,
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

    // add striped image pattern if missing
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

    // cleanup on unmount
    return () => {
      cleanup();
    };
  }, [map, rooms]);

  return null;
}

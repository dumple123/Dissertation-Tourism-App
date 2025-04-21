import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import type { FeatureCollection } from 'geojson';
import { getRoomsForBuilding } from '~/api/room';

interface Props {
  map: mapboxgl.Map;
  buildingId: string;
  floor: number;
}

export default function SavedRoomsRenderer({ map, buildingId, floor }: Props) {
  useEffect(() => {
    let mounted = true;

    const fetchRooms = async () => {
      try {
        const rawRooms = await getRoomsForBuilding(buildingId);

        const features = rawRooms
          .filter((r: any) => r.floor === floor)
          .map((r: any) => ({
            ...r.geojson,
            properties: {
              ...r.geojson.properties,
              id: r.id,
              name: r.name,
              floor: r.floor,
              buildingId: r.buildingId,
            },
          }))
          .filter((f: any) => f && f.type === 'Feature');

        const rooms: FeatureCollection = {
          type: 'FeatureCollection',
          features,
        };

        if (!map || !mounted || rooms.features.length === 0) return;

        const sourceId = 'saved-rooms';

        if (!map.isStyleLoaded()) {
          map.once('style.load', () => addLayers(map, rooms, sourceId));
        } else {
          addLayers(map, rooms, sourceId);
        }
      } catch (err) {
        console.error('Error loading rooms from backend:', err);
      }
    };

    const addLayers = (
      map: mapboxgl.Map,
      rooms: FeatureCollection,
      sourceId: string
    ) => {
      if (map.getSource(sourceId)) {
        (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(rooms);
        return;
      }

      map.addSource(sourceId, {
        type: 'geojson',
        data: rooms,
      });

      map.addLayer({
        id: 'saved-rooms-fill',
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': '#219ebc',
          'fill-opacity': 0.4,
        },
      });

      map.addLayer({
        id: 'saved-rooms-outline',
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#023047',
          'line-width': 1.5,
        },
      });
    };

    fetchRooms();

    return () => {
      mounted = false;

      try {
        if (map.getLayer('saved-rooms-fill')) {
          map.removeLayer('saved-rooms-fill');
        }
        if (map.getLayer('saved-rooms-outline')) {
          map.removeLayer('saved-rooms-outline');
        }
        if (map.getSource('saved-rooms')) {
          map.removeSource('saved-rooms');
        }
      } catch (err) {
        console.warn('Error cleaning up saved room layers:', err);
      }
    };
  }, [map, buildingId, floor]);

  return null;
}

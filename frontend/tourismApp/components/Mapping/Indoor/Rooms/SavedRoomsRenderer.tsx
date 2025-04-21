import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import type { FeatureCollection } from 'geojson';

interface Props {
  map: mapboxgl.Map;
  rooms: any[]; // Preloaded rooms for the current building and floor
}

export default function SavedRoomsRenderer({ map, rooms }: Props) {
  useEffect(() => {
    let mounted = true;

    // Transform room GeoJSON into a FeatureCollection
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

    if (!map || !mounted || features.length === 0) return;

    const sourceId = 'saved-rooms';

    const addLayers = () => {
      // If source already exists, update it
      if (map.getSource(sourceId)) {
        const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
        source.setData(featureCollection);
        return;
      }

      // Add room GeoJSON source
      map.addSource(sourceId, {
        type: 'geojson',
        data: featureCollection,
      });

      // Add fill layer for rooms (above building fill)
      map.addLayer({
        id: 'saved-rooms-fill',
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': '#219ebc',
          'fill-opacity': 0.4,
        },
      });

      // Add outline for rooms
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

    // Ensure layers are added only after the map style is loaded
    if (!map.isStyleLoaded()) {
      map.once('style.load', addLayers);
    } else {
      addLayers();
    }

    return () => {
      mounted = false;

      // Clean up layers and source when component unmounts or updates
      try {
        if (map.getLayer('saved-rooms-fill')) {
          map.removeLayer('saved-rooms-fill');
        }
        if (map.getLayer('saved-rooms-outline')) {
          map.removeLayer('saved-rooms-outline');
        }
        if (map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }
      } catch (err) {
        console.warn('Error cleaning up saved room layers:', err);
      }
    };
  }, [map, rooms]);

  return null;
}

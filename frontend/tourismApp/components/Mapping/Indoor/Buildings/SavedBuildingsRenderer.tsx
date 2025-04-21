import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import type { FeatureCollection } from 'geojson';

interface Props {
  map: mapboxgl.Map;
  buildings: any[]; // List of buildings passed from preload logic
}

export default function SavedBuildingsRenderer({ map, buildings }: Props) {
  useEffect(() => {
    let mounted = true;

    // Transform building GeoJSON into a FeatureCollection
    const features = buildings
      .map((b) => ({
        ...b.geojson,
        properties: {
          ...b.geojson.properties,
          id: b.id,
          name: b.name,
        },
      }))
      .filter((f) => f && f.type === 'Feature');

    const featureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features,
    };

    if (!map || !mounted || features.length === 0) return;

    const sourceId = 'saved-buildings';

    const addLayers = () => {
      if (!map.getSource(sourceId)) {
        // Add GeoJSON source for buildings
        map.addSource(sourceId, {
          type: 'geojson',
          data: featureCollection,
        });

        // Add building fill layer (appears under rooms if present)
        map.addLayer({
          id: 'saved-buildings-fill',
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': '#E76F51',
            'fill-opacity': 0.2,
          },
          // If room layer exists, place this underneath
          ...(map.getLayer('saved-rooms-fill') && { beforeId: 'saved-rooms-fill' }),
        });

        // Add building outline layer
        map.addLayer({
          id: 'saved-buildings-outline',
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': '#E76F51',
            'line-width': 2,
          },
        });
      } else {
        // Update data if the source already exists
        const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
        source.setData(featureCollection);
      }
    };

    // Ensure layers are only added after the map style is loaded
    if (!map.isStyleLoaded()) {
      map.once('style.load', addLayers);
    } else {
      addLayers();
    }

    // Cleanup layers and source on unmount or prop change
    return () => {
      mounted = false;

      try {
        if (map.getLayer('saved-buildings-fill')) {
          map.removeLayer('saved-buildings-fill');
        }
        if (map.getLayer('saved-buildings-outline')) {
          map.removeLayer('saved-buildings-outline');
        }
        if (map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }
      } catch (err) {
        console.warn('Error cleaning up saved buildings layers:', err);
      }
    };
  }, [map, buildings]);

  return null;
}

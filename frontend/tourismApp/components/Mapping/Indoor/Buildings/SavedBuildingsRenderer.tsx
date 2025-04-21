import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import type { FeatureCollection } from 'geojson';
import { getBuildingsForMap } from '~/api/building';

interface Props {
  map: mapboxgl.Map;
  mapId: string;
}

export default function SavedBuildingsRenderer({ map, mapId }: Props) {
  useEffect(() => {
    let mounted = true;

    const fetchBuildings = async () => {
      try {
        const rawBuildings = await getBuildingsForMap(mapId);

        // Convert to FeatureCollection by extracting each building's GeoJSON
        const features = rawBuildings
          .map((b: any) => ({
            ...b.geojson,
            properties: {
              ...b.geojson.properties,
              id: b.id,
              name: b.name,
            },
          }))
          .filter((f: any) => f && f.type === 'Feature');

        const buildings: FeatureCollection = {
          type: 'FeatureCollection',
          features,
        };

        console.log("GeoJSON FeatureCollection to render:", buildings);

        if (!map || !mounted || buildings.features.length === 0) return;

        const sourceId = 'saved-buildings';

        if (!map.isStyleLoaded()) {
          map.once('style.load', () => addLayers(map, buildings, sourceId));
        } else {
          addLayers(map, buildings, sourceId);
        }
      } catch (err) {
        console.error("Error loading buildings from backend:", err);
      }
    };

    const addLayers = (
      map: mapboxgl.Map,
      buildings: FeatureCollection,
      sourceId: string
    ) => {
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: 'geojson',
          data: buildings,
        });

        map.addLayer({
          id: 'saved-buildings-fill',
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': '#E76F51',
            'fill-opacity': 0.2,
          },
        });

        map.addLayer({
          id: 'saved-buildings-outline',
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': '#E76F51',
            'line-width': 2,
          },
        });
      }
    };

    fetchBuildings();

    return () => {
      mounted = false;

      if (map.getLayer('saved-buildings-fill')) map.removeLayer('saved-buildings-fill');
      if (map.getLayer('saved-buildings-outline')) map.removeLayer('saved-buildings-outline');
      if (map.getSource('saved-buildings')) map.removeSource('saved-buildings');
    };
  }, [map, mapId]);

  return null;
}

import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import type { FeatureCollection } from 'geojson';
import { getTokens } from '~/utils/tokenUtils';

interface Props {
  map: mapboxgl.Map;
  mapId: string;
}

export default function SavedBuildingsRenderer({ map, mapId }: Props) {
  useEffect(() => {
    let mounted = true;

    const fetchBuildings = async () => {
      try {
        const { accessToken } = await getTokens();
        if (!accessToken) {
          console.warn("No access token for fetching buildings");
          return;
        }

        const res = await fetch(`http://localhost:3000/api/buildings/map/${mapId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) {
          console.error("Failed to fetch buildings:", await res.text());
          return;
        }

        // Fetch raw building array from backend
        const rawBuildings = await res.json();

        // Convert to FeatureCollection by extracting each building's GeoJSON
        const features = rawBuildings
          .map((b: any) => ({
            ...b.geojson,
            // Add building ID and name to each feature's properties so they can be accessed on click
            properties: {
              ...b.geojson.properties,
              id: b.id,           // Added: include building ID for sidebar actions
              name: b.name,       // Added: ensure building name is present
            },
          }))
          .filter((f: any) => f && f.type === 'Feature');

        const buildings: FeatureCollection = {
          type: 'FeatureCollection',
          features,
        };

        // Debug output to verify what is being added to the map
        console.log("GeoJSON FeatureCollection to render:", buildings);

        if (!map || !mounted || buildings.features.length === 0) return;

        const sourceId = 'saved-buildings';

        // Wait for the map's style to load before adding layers/sources
        if (!map.isStyleLoaded()) {
          map.once('style.load', () => addLayers(map, buildings, sourceId));
        } else {
          addLayers(map, buildings, sourceId);
        }
      } catch (err) {
        console.error("Error loading buildings from backend:", err);
      }
    };

    // Adds source and layers to the map
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

      // Clean up layers and sources on unmount
      if (map.getLayer('saved-buildings-fill')) map.removeLayer('saved-buildings-fill');
      if (map.getLayer('saved-buildings-outline')) map.removeLayer('saved-buildings-outline');
      if (map.getSource('saved-buildings')) map.removeSource('saved-buildings');
    };
  }, [map, mapId]);

  return null;
}

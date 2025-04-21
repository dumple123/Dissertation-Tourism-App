import { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export function useMapStyleReady(map: mapboxgl.Map | undefined): boolean {
  const [styleReady, setStyleReady] = useState(false);

  useEffect(() => {
    if (!map) return;

    const handleStyleLoad = () => setStyleReady(true);

    if (map.isStyleLoaded()) {
      setStyleReady(true);
    } else {
      map.once('style.load', handleStyleLoad);
    }

    return () => {
      if (map) map.off('style.load', handleStyleLoad);
    };
  }, [map]);

  return styleReady;
}

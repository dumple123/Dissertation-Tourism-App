import mapboxgl from 'mapbox-gl';
import { POI } from './usePOIs';

export function renderPOIs(pois: POI[], map: mapboxgl.Map) {
  const markers: mapboxgl.Marker[] = [];

  pois.forEach((poi) => {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.width = '24px';
    el.style.height = '24px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#E9C46A';
    el.style.border = '2px solid #264653';

    const popup = new mapboxgl.Popup({ offset: 25 }).setText(poi.label || 'Point of Interest');

    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat([poi.lng, poi.lat])
      .setPopup(popup)
      .addTo(map);

    markers.push(marker);
  });

  return markers;
}

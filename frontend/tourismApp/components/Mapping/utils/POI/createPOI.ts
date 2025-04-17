import { POI } from './usePOIs';

export function createPOI(addPOI: (lng: number, lat: number, label?: string) => void) {
  const label = prompt('Enter a label for this point of interest:');
  if (!label) return;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lng = position.coords.longitude;
      const lat = position.coords.latitude;
      addPOI(lng, lat, label);
    },
    (err) => {
      console.warn('Geolocation error when creating POI:', err);
      alert('Failed to get location for POI.');
    },
    { enableHighAccuracy: true }
  );
}

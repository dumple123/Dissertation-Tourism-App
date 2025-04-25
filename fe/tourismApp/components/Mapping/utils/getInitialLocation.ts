import MapboxGL from '@rnmapbox/maps';

export async function getInitialLocation(): Promise<[number, number] | null> {
  try {
    const loc = await MapboxGL.locationManager.getLastKnownLocation();

    // Check if location is valid
    if (loc?.coords) {
      return [loc.coords.longitude, loc.coords.latitude];
    } else {
      console.warn('No initial location available');
    }
  } catch (err) {
    console.error('Error fetching initial location:', err);
  }

  // Return null if location cannot be fetched
  return null;
}

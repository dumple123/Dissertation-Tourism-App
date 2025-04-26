import MapboxGL from '@rnmapbox/maps';

/**
 * Handles live location updates from Mapbox's UserLocation component.
 * Smooths the user movement to avoid GPS jumpiness.
 * 
 * @param loc - Mapbox Location object containing coordinate data.
 * @param coords - Current user coordinates
 * @param setCoords - React state setter to update current user coordinates.
 * @param cameraRef - Reference to the Mapbox camera used for moving the map.
 * @param hasCentered - Boolean indicating if map has already centered on user.
 * @param setHasCentered - Setter to update the centering state.
 */
export function handleLocationUpdate(
  loc: MapboxGL.Location,
  coords: [number, number] | null,
  setCoords: React.Dispatch<React.SetStateAction<[number, number] | null>>,
  cameraRef: React.RefObject<MapboxGL.Camera>,
  hasCentered: boolean,
  setHasCentered: (value: boolean) => void
) {
  const newCoords: [number, number] = [
    loc.coords.longitude,
    loc.coords.latitude,
  ];

  console.log('Live location update:', newCoords);

  if (!coords) {
    // No previous coords, just set immediately
    setCoords(newCoords);
    return;
  }

  // Interpolate between old and new coordinates
  const SMOOTHING_FACTOR = 0.2; // 0.0 = no smoothing, 1.0 = instant jump

  const smoothedCoords: [number, number] = [
    coords[0] + (newCoords[0] - coords[0]) * SMOOTHING_FACTOR,
    coords[1] + (newCoords[1] - coords[1]) * SMOOTHING_FACTOR,
  ];

  setCoords(smoothedCoords);

  // Only fly the camera the first time
  if (!hasCentered) {
    cameraRef.current?.flyTo(smoothedCoords, 1000);
    setHasCentered(true);
  }
}
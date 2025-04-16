import MapboxGL from '@rnmapbox/maps';

/**
 * Handles live location updates from Mapbox's UserLocation component.
 * 
 * @param loc - Mapbox Location object containing coordinate data.
 * @param setCoords - React state setter to update current user coordinates.
 * @param cameraRef - Reference to the Mapbox camera used for moving the map.
 * @param hasCentered - Boolean indicating if map has already centered on user.
 * @param setHasCentered - Setter to update the centering state.
 */
export function handleLocationUpdate(
  loc: MapboxGL.Location,
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

  // Update user coordinates state
  setCoords(newCoords);

  // Only fly the map to the user location once
  if (!hasCentered) {
    cameraRef.current?.flyTo(newCoords, 1000);
    setHasCentered(true);
  }
}

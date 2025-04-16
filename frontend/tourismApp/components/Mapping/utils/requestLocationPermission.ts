import { PermissionsAndroid, Platform } from 'react-native';

/**
 * Requests location permission from the user (Android only).
 * iOS does not require runtime permission for location in this context.
 * 
 * @returns {Promise<boolean>} - Whether the permission was granted.
 */
export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'This app needs access to your location to show your position on the map.',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  // iOS is considered always ready
  return true;
}

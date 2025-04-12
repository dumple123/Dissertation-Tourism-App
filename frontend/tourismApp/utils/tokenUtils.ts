import * as SecureStore from 'expo-secure-store'; // For React Native

// Store tokens securely (for React Native with expo-secure-store)
export const saveTokens = async (accessToken: string, refreshToken: string) => {
  // React Native: Store tokens using expo-secure-store
  await SecureStore.setItemAsync('accessToken', accessToken);
  await SecureStore.setItemAsync('refreshToken', refreshToken);

  // Web: Use AsyncStorage if you're building for React Native Web
  if (typeof window !== 'undefined') {
    // Use SecureStorage for better security in React Native Web
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
  }
};

// Retrieve tokens securely
export const getTokens = async () => {
  let accessToken = null;
  let refreshToken = null;

  // React Native: Retrieve tokens using expo-secure-store
  accessToken = await SecureStore.getItemAsync('accessToken');
  refreshToken = await SecureStore.getItemAsync('refreshToken');

  // Web: Use AsyncStorage for React Native Web
  if (typeof window !== 'undefined') {
    accessToken = await SecureStore.getItemAsync('accessToken');
    refreshToken = await SecureStore.getItemAsync('refreshToken');
  }

  return { accessToken, refreshToken };
};

// Remove tokens on logout
export const removeTokens = async () => {
  // React Native: Delete tokens from expo-secure-store
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');

  // Web: Clear tokens from localStorage for React Native Web
  if (typeof window !== 'undefined') {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  }
};

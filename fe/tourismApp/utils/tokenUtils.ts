import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// -- Utility: Get Storage Engine --

const storage = {
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  getItem: async (key: string) => {
    let value;
    if (Platform.OS === 'web') {
      value = localStorage.getItem(key);
    } else {
      value = await SecureStore.getItemAsync(key);
    }
    return value;
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }
};

// -- Public Token API --

export const saveTokens = async (accessToken: string, refreshToken: string) => {
  await storage.setItem('accessToken', accessToken);
  await storage.setItem('refreshToken', refreshToken);
};

export const getTokens = async () => {
  const accessToken = await storage.getItem('accessToken') ?? null;
  const refreshToken = await storage.getItem('refreshToken') ?? null;
  return { accessToken, refreshToken };
};

export const removeTokens = async () => {
  await storage.removeItem('accessToken');
  await storage.removeItem('refreshToken');
};

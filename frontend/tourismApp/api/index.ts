import axios, { AxiosInstance, AxiosError } from "axios";
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL;
console.log("👉 API_URL (runtime):", API_URL);

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Function to set Authorization header with the access token
export const setAuthHeader = (token: string) => {
  axiosInstance.defaults.headers['Authorization'] = `Bearer ${token}`;
};

// Optionally, clear the token on logout
export const clearAuthHeader = () => {
  delete axiosInstance.defaults.headers['Authorization'];
};

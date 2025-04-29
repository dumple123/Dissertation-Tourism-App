import axios, { AxiosInstance } from "axios";
import Constants from "expo-constants";
import { getTokens, removeTokens, saveTokens } from "~/utils/tokenUtils";
import { refreshAccessToken } from "~/api/user";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Set Authorization header globally
export const setAuthHeader = (token: string) => {
  axiosInstance.defaults.headers['Authorization'] = `Bearer ${token}`;
};

// Clear Authorization header
export const clearAuthHeader = () => {
  delete axiosInstance.defaults.headers['Authorization'];
};

// Automatically attach access token to every request
axiosInstance.interceptors.request.use(async (config) => {
  const { accessToken } = await getTokens();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Automatically refresh token on 401
axiosInstance.interceptors.response.use(
  (response) => response, // normal responses
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // prevent infinite loop

      const { refreshToken } = await getTokens();
      if (refreshToken) {
        try {
          const { accessToken } = await refreshAccessToken(refreshToken); // extract new access token

          if (accessToken) {
            await saveTokens(accessToken, refreshToken); // save new access token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`; // retry request with new token
            return axiosInstance(originalRequest); // retry original request
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }
      }

      // If refresh also fails: logout
      await removeTokens();
      clearAuthHeader();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

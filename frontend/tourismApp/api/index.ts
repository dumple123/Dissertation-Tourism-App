import axios, { AxiosInstance, AxiosError } from "axios";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: "http://localhost:3000",
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

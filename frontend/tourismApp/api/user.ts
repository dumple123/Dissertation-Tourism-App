import axios, { AxiosInstance } from "axios";
import {
  saveTokens,
  getTokens,
  removeTokens,
} from "~/utils/tokenUtils"; // path may vary depending on your structure

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// -- Auth Header --
export const setAuthHeader = (token: string) => {
  axiosInstance.defaults.headers['Authorization'] = `Bearer ${token}`;
};

export const clearAuthHeader = () => {
  delete axiosInstance.defaults.headers['Authorization'];
};

// -- Session Management --
export const initializeAuth = async () => {
  const { accessToken } = await getTokens();
  if (accessToken) {
    setAuthHeader(accessToken);
    return true;
  }
  return false;
};

export const logout = async () => {
  await removeTokens();
  clearAuthHeader();
  return { success: true };
};

// -- Auth API calls with centralized error handling --
export const login = async (email: string, password: string) => {
  try {
    const res = await axiosInstance.post("/login", { email, password });
    const { accessToken, refreshToken, user } = res.data;

    await saveTokens(accessToken, refreshToken);
    setAuthHeader(accessToken);

    return { accessToken, user };
  } catch (error: any) {
    const message = extractErrorMessage(error, "Login failed");
    return { error: message };
  }
};

export const signup = async (username: string, email: string, password: string) => {
  try {
    const res = await axiosInstance.post("/signup", { username, email, password });
    const { accessToken, refreshToken, user } = res.data;

    await saveTokens(accessToken, refreshToken);
    setAuthHeader(accessToken);

    return { accessToken, user };
  } catch (error: any) {
    const message = extractErrorMessage(error, "Signup failed");
    return { error: message };
  }
};

// -- Shared Error Formatter --
const extractErrorMessage = (error: any, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }
  return fallback;
};

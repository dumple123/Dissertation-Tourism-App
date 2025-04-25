import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { saveTokens, getTokens, removeTokens } from "~/utils/tokenUtils";
import { axiosInstance, setAuthHeader, clearAuthHeader } from "~/api/index";

interface DecodedToken {
  exp: number; // expiration time (seconds since epoch)
}

// Attempts to refresh the access token using the refresh token
const refreshAccessToken = async (refreshToken: string) => {
  try {
    const res = await axiosInstance.post("/refresh", { refreshToken });
    const newAccessToken = res.data.accessToken;

    // Save the new access token alongside the existing refresh token
    await saveTokens(newAccessToken, refreshToken);

    // Set the global auth header so future requests use the new token
    setAuthHeader(newAccessToken);

    return newAccessToken;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    return null;
  }
};

// Initializes the authentication state on app load
// Checks for an existing access token or attempts to refresh it if missing/expired
export const initializeAuth = async () => {
  const { accessToken, refreshToken } = await getTokens();

  if (accessToken) {
    try {
      const decoded = jwtDecode<DecodedToken>(accessToken);
      const currentTime = Date.now() / 1000; // current time in seconds

      if (decoded.exp > currentTime) {
        // Token is still valid
        setAuthHeader(accessToken);
        return true;
      }
    } catch (error) {
      console.error("Error decoding access token:", error);
      // If decoding fails, treat it as invalid
    }
  }

  // If token expired or no accessToken but we have a refresh token, try refreshing
  if (refreshToken) {
    const newAccessToken = await refreshAccessToken(refreshToken);
    if (newAccessToken) {
      return true;
    }
  }

  // No valid token
  return false;
};

// Logs the user out by clearing stored tokens and auth headers
export const logout = async () => {
  await removeTokens();
  clearAuthHeader();
  return { success: true };
};

// Sends a login request and stores tokens if successful
export const login = async (email: string, password: string) => {
  try {
    const res = await axiosInstance.post("/login", { email, password });

    const { accessToken, refreshToken } = res.data.tokens;
    const user = {
      id: res.data.userId,
      username: res.data.username,
    };

    await saveTokens(accessToken, refreshToken);
    setAuthHeader(accessToken);

    return { accessToken, user };
  } catch (error: any) {
    console.error("Login error:", error);
    const message = extractErrorMessage(error, "Login failed");
    return { error: message };
  }
};

// Sends a signup request and stores tokens if successful
export const signup = async (
  username: string,
  email: string,
  password: string
) => {
  try {
    const res = await axiosInstance.post("/signup", {
      username,
      email,
      password,
    });

    const { accessToken, refreshToken } = res.data.tokens;
    const user = {
      id: res.data.userId,
      username: res.data.username,
    };

    await saveTokens(accessToken, refreshToken);
    setAuthHeader(accessToken);

    return { accessToken, user };
  } catch (error: any) {
    console.error("Signup error:", error);
    const message = extractErrorMessage(error, "Signup failed");
    return { error: message };
  }
};

// Extracts a readable error message from an axios error response
const extractErrorMessage = (error: any, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }
  return fallback;
};

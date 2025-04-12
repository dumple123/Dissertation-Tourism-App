import { axiosInstance, setAuthHeader, clearAuthHeader } from './index';
import { saveTokens, getTokens, removeTokens } from '../utils/tokenUtils'; // Import the utility functions
import { LoginResponse } from '~/types/api/user';

// Login function
export const login = async (email: string, password: string) => {
  try {
    const login = await axiosInstance.post<LoginResponse>('/login', {
      email,
      password,
    });

    // Store the tokens (Access and Refresh tokens)
    const { accessToken, refreshToken } = login.data.tokens;

    // Set the Authorization header for future requests
    setAuthHeader(accessToken);

    // Store both tokens securely (for mobile/web)
    await saveTokens(accessToken, refreshToken);

    return login.data; // Return login data or whatever is required
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Signup function
export const signup = async (username: string, email: string, password: string) => {
  try {
    // Send signup request to backend
    const response = await axiosInstance.post<LoginResponse>('/signup', {
      username,
      email,
      password,
    });

    // Store the tokens (Access and Refresh tokens) after successful signup
    const { accessToken, refreshToken } = response.data.tokens;

    // Set the Authorization header for future requests
    setAuthHeader(accessToken);

    // Store both tokens securely (for mobile/web)
    await saveTokens(accessToken, refreshToken);

    return response.data; // Return signup response or data as required
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

// Refresh token function (using the refresh token stored in SecureStore)
export const refreshToken = async () => {
  const { refreshToken } = await getTokens(); // Retrieve securely stored refresh token
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axiosInstance.post<{ accessToken: string }>('/refreshToken', {
      refreshToken,
    });

    const { accessToken } = response.data;

    // Set the new access token in the Authorization header
    setAuthHeader(accessToken);

    // Optionally, you can save the new tokens (if your logic allows new refresh tokens)
    await saveTokens(accessToken, refreshToken);

    return accessToken; // Return the new access token
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

// Logout function
export const logout = async () => {
  // Clear the stored token and refresh token
  clearAuthHeader();
  await removeTokens(); // Clear tokens securely
};

import { axiosInstance } from './index';
import { LoginResponse } from '~/types/api/user';

export const login = async (email: string, password: string) => {
  try {
    const login = await axiosInstance.post<LoginResponse>('/login', {
      email,
      password,
    });
    return login.data;
  } catch (error) {
    console.error(error);
  }
};

export const signup = async (username: string, email: string, password: string) => {
  try {
    const response = await axiosInstance.post<LoginResponse>('/signup', {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

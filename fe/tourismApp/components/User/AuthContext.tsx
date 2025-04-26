import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeAuth, login, signup, logout as userLogout } from '~/api/user';
import { AuthContextType } from '~/types/api/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

type UserType = {
  id: string;
  username: string;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { isLoggedIn, user } = await initializeAuth();
      setIsAuthenticated(isLoggedIn);
      setUser(user);
    };
    checkAuth();
  }, []);

  const loginUser = async (email: string, password: string) => {
    const result = await login(email, password);
    if (result.error) {
      return { error: result.error as string };
    }

    if (result.user) {
      setUser(result.user);
      await AsyncStorage.setItem('user', JSON.stringify(result.user)); // Save to storage
    }

    setIsAuthenticated(true);
    return { success: true as const };
  };

  const signupUser = async (username: string, email: string, password: string) => {
    const result = await signup(username, email, password);
    if (result.error) {
      return { error: result.error as string };
    }

    if (result.user) {
      setUser(result.user);
      await AsyncStorage.setItem('user', JSON.stringify(result.user)); // Save to storage
    }

    setIsAuthenticated(true);
    return { success: true as const };
  };

  const logout = async () => {
    await userLogout();
    setIsAuthenticated(false);
    setUser(null);
    await AsyncStorage.removeItem('user'); // Clear storage
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loginUser, signupUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

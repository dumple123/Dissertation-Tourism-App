import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeAuth, login, signup, logout as userLogout } from '~/api/user';
import { AuthContextType } from '~/types/api/authContext';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = await initializeAuth();
      setIsAuthenticated(isLoggedIn);
    };
    checkAuth();
  }, []);

  const loginUser = async (email: string, password: string) => {
    const result = await login(email, password);

    if (result.error) {
      return { error: result.error as string };
    }

    setIsAuthenticated(true);
    return { success: true as const };
  };

  const signupUser = async (username: string, email: string, password: string) => {
    const result = await signup(username, email, password);

    if (result.error) {
      return { error: result.error as string };
    }

    setIsAuthenticated(true);
    return { success: true as const };
  };

  const logout = async () => {
    await userLogout();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loginUser, signupUser, logout }}>
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

export type AuthContextType = {
    isAuthenticated: boolean;
    loginUser: (email: string, password: string) => Promise<{ success: true } | { error: string }>;
    signupUser: (
      username: string,
      email: string,
      password: string
    ) => Promise<{ success: true } | { error: string }>;
    logout: () => Promise<void>;
  };
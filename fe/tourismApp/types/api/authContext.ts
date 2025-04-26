export interface AuthContextType {
  isAuthenticated: boolean;
  user: {
    id: string;
    username: string;
  } | null;
  loginUser: (email: string, password: string) => Promise<{ success: true } | { error: string }>;
  signupUser: (username: string, email: string, password: string) => Promise<{ success: true } | { error: string }>;
  logout: () => Promise<void>;
}
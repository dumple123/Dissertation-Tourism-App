export type LoginResponse = {
  success: boolean;
  userId: string;
  username: string;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};
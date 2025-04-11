export type LoginResponse = {
    success: boolean,
      token: {accessToken: string, refreshToken: string},
      userId: string,
      username: string,
}
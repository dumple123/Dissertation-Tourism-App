import { axiosInstance } from "./index"
import { LoginResponse } from "~/types/api/user";

export const login = async (email: string, password: string) => {
    try {
      const login = await axiosInstance.post<LoginResponse>("/login", {
        email,
        password,
      });
      return login.data;
    } catch (error) {
      console.error(error);
    }
  };
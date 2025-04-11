import axios, { AxiosInstance, AxiosError } from "axios";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
    Authorization: "",
  },
});

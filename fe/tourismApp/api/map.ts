import { axiosInstance } from "~/api/index";

// Create a new map
export const createMap = async (name: string) => {
  try {
    const res = await axiosInstance.post('/api/maps', { name });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || "Failed to create map");
  }
};

// Get all maps
export const getMaps = async () => {
  try {
    const res = await axiosInstance.get('/api/maps');
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || "Failed to fetch maps");
  }
};

// Get all maps where user has completed 50% or more
export const getUserCompletedMaps = async (userId: string) => {
  try {
    const res = await axiosInstance.get(`/api/maps/completed/${userId}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || "Failed to fetch completed maps");
  }
};

import { axiosInstance } from '~/api/index';

// Get a single building by ID
export async function getBuildingById(id: string) {
  try {
    const res = await axiosInstance.get(`/api/buildings/${id}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || 'Failed to fetch building');
  }
}

// Update a building
export async function updateBuilding(id: string, data: {
  name?: string;
  numFloors?: number;
  bottomFloor?: number;
  geojson?: any;
}) {
  try {
    const res = await axiosInstance.put(`/api/buildings/${id}`, data);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || 'Failed to update building');
  }
}

// Delete a building
export async function deleteBuilding(id: string) {
  try {
    await axiosInstance.delete(`/api/buildings/${id}`);
  } catch (err: any) {
    throw new Error(err.response?.data?.error || 'Failed to delete building');
  }
}

// Get all buildings for a map
export async function getBuildingsForMap(mapId: string) {
  try {
    const res = await axiosInstance.get(`/api/buildings/map/${mapId}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || 'Failed to fetch buildings');
  }
}

// Create a new building
export async function createBuilding(data: {
  name: string;
  mapId: string;
  numFloors: number;
  bottomFloor: number;
  geojson: any;
}) {
  try {
    const res = await axiosInstance.post(`/api/buildings`, data);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || 'Failed to create building');
  }
}

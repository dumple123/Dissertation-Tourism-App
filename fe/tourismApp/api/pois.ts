import { axiosInstance } from '~/api/index';

// Get all POIs for a specific map
export async function getPOIsForMap(mapId: string) {
  try {
    const res = await axiosInstance.get(`/api/pois/map/${mapId}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || 'Failed to fetch POIs');
  }
}

// Get a single POI
export async function getPOIById(id: string) {
  try {
    const res = await axiosInstance.get(`/api/pois/${id}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || 'Failed to fetch POI');
  }
}

// Create a new POI
export async function createPOI(data: {
  mapId: string;
  name: string;
  description?: string;
  geojson: any;
  hidden?: boolean;
}) {
  try {
    const res = await axiosInstance.post(`/api/pois`, data);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || 'Failed to create POI');
  }
}

// Update a POI
export async function updatePOI(id: string, data: Partial<{
  name: string;
  description?: string;
  geojson: any;
  hidden?: boolean;
}>) {
  try {
    const res = await axiosInstance.put(`/api/pois/${id}`, data);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || 'Failed to update POI');
  }
}

// Delete a POI
export async function deletePOI(id: string) {
  try {
    await axiosInstance.delete(`/api/pois/${id}`);
  } catch (err: any) {
    throw new Error(err.response?.data?.error || 'Failed to delete POI');
  }
}
import { axiosInstance } from '~/api/index';

// Create a new room
export async function createRoom(data: {
  name: string;
  floor: number;
  buildingId: string;
  geojson: any;
}) {
  try {
    const res = await axiosInstance.post('/api/rooms', data);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || 'Failed to create room');
  }
}

// Get all rooms for a building
export async function getRoomsForBuilding(buildingId: string) {
  try {
    const res = await axiosInstance.get(`/api/rooms/building/${buildingId}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || 'Failed to fetch rooms');
  }
}

// Update a room
export async function updateRoom(id: string, data: {
  name?: string;
  floor?: number;
  buildingId?: string;
  geojson?: any;
  accessible?: boolean;
  isArea?: boolean;
}) {
  try {
    const res = await axiosInstance.put(`/api/rooms/${id}`, data);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || 'Failed to update room');
  }
}

// Delete a room
export async function deleteRoom(id: string) {
  try {
    await axiosInstance.delete(`/api/rooms/${id}`);
  } catch (err: any) {
    throw new Error(err.response?.data?.error || 'Failed to delete room');
  }
}

import { axiosInstance } from '~/api/index';

// Get all markers for a specific building
export async function getMarkersForBuilding(buildingId: string) {
  try {
    const res = await axiosInstance.get(`/api/markers/building/${buildingId}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || 'Failed to fetch markers');
  }
}

// Get a single marker (optional if you want detail view/editing)
export async function getMarkerById(id: string) {
  try {
    const res = await axiosInstance.get(`/api/markers/${id}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || 'Failed to fetch marker');
  }
}

// Create a new interior marker
export async function createInteriorMarker(data: {
  buildingId: string;
  floor: number;
  type: string;
  coordinates: [number, number];
  label?: string;
  accessible?: boolean;
  metadata?: Record<string, any>;
}) {
  try {
    const res = await axiosInstance.post(`/api/markers`, data);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || 'Failed to create marker');
  }
}

// Update an interior marker
export async function updateInteriorMarker(id: string, data: Partial<{
  buildingId: string;
  floor: number;
  type: string;
  coordinates: [number, number];
  label?: string;
  accessible?: boolean;
  metadata?: Record<string, any>;
}>) {
  try {
    const res = await axiosInstance.put(`/api/markers/${id}`, data);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || 'Failed to update marker');
  }
}

// Delete an interior marker
export async function deleteInteriorMarker(id: string) {
  try {
    await axiosInstance.delete(`/api/markers/${id}`);
  } catch (err: any) {
    throw new Error(err.response?.data?.error || 'Failed to delete marker');
  }
}

import { axiosInstance } from '~/api/index';

// Get all POIs a user has visited
export async function getUserPOIProgress(userId: string) {
  try {
    const res = await axiosInstance.get(`/api/poi-progress/user/${userId}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || 'Failed to fetch POI progress');
  }
}

// Get latest POIs visited globally (default 10, optional limit)
export async function getLatestPOIVisits(limit?: number) {
  try {
    const query = limit ? `?limit=${limit}` : '';
    const res = await axiosInstance.get(`/api/poi-progress/latest${query}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || 'Failed to fetch latest POI visits');
  }
}

// Get latest POIs visited by a specific user (default 10, optional limit)
export async function getLatestUserPOIVisits(userId: string, limit?: number) {
  try {
    const query = limit ? `?limit=${limit}` : '';
    const res = await axiosInstance.get(`/api/poi-progress/user/${userId}/latest${query}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || 'Failed to fetch user-specific POI visits');
  }
}

// Mark a POI as visited
export async function markPOIAsVisited(data: {
  userId: string;
  poiId: string;
}) {
  try {
    const res = await axiosInstance.post(`/api/poi-progress`, data);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || 'Failed to mark POI as visited');
  }
}

// Delete a visit record (unvisit)
export async function deletePOIProgress(id: string) {
  try {
    await axiosInstance.delete(`/api/poi-progress/${id}`);
  } catch (err: any) {
    throw new Error(err.response?.data?.error || 'Failed to delete POI progress');
  }
}
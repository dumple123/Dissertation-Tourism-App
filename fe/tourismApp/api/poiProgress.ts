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

import { getTokens } from '~/utils/tokenUtils';
import Constants from 'expo-constants';

const API_BASE = `${Constants.expoConfig?.extra?.API_URL}/api/poi-progress`;

// Get all POIs a user has visited
export async function getUserPOIProgress(userId: string) {
  const { accessToken } = await getTokens();

  const res = await fetch(`${API_BASE}/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

// Mark a POI as visited
export async function markPOIAsVisited(data: {
  userId: string;
  poiId: string;
}) {
  const { accessToken } = await getTokens();

  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

// Delete a visit record (unvisit)
export async function deletePOIProgress(id: string) {
  const { accessToken } = await getTokens();

  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error(await res.text());
}

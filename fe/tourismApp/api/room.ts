import { getTokens } from '~/utils/tokenUtils';
import Constants from 'expo-constants';

const API_BASE = `${Constants.expoConfig?.extra?.API_URL}/api/rooms`;

// Create a new room
export async function createRoom(data: {
  name: string;
  floor: number;
  buildingId: string;
  geojson: any;
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

// Get all rooms for a building
export async function getRoomsForBuilding(buildingId: string) {
  const { accessToken } = await getTokens();
  const res = await fetch(`${API_BASE}/building/${buildingId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json();
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
  const { accessToken } = await getTokens();
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

// Delete a room
export async function deleteRoom(id: string) {
  const { accessToken } = await getTokens();
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error(await res.text());
}

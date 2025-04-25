import { getTokens } from '~/utils/tokenUtils';
import Constants from 'expo-constants';

const API_BASE = `${Constants.expoConfig?.extra?.API_URL}/api/buildings`;

export async function getBuildingById(id: string) {
  const { accessToken } = await getTokens();
  const res = await fetch(`${API_BASE}/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function updateBuilding(id: string, data: {
  name?: string;
  numFloors?: number;
  bottomFloor?: number;
  geojson?: any;
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

export async function deleteBuilding(id: string) {
  const { accessToken } = await getTokens();
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error(await res.text());
}

export async function getBuildingsForMap(mapId: string) {
  const { accessToken } = await getTokens();
  const res = await fetch(`${API_BASE}/map/${mapId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function createBuilding(data: {
  name: string;
  mapId: string;
  numFloors: number;
  bottomFloor: number;
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

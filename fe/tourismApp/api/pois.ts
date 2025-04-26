import { getTokens } from '~/utils/tokenUtils';
import Constants from 'expo-constants';

const API_BASE = `${Constants.expoConfig?.extra?.API_URL}/api/pois`;

// Get all POIs for a specific map
export async function getPOIsForMap(mapId: string) {
  const { accessToken } = await getTokens();

  const res = await fetch(`${API_BASE}/map/${mapId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

// Get a single POI
export async function getPOIById(id: string) {
  const { accessToken } = await getTokens();

  const res = await fetch(`${API_BASE}/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

// Create a new POI
export async function createPOI(data: {
  mapId: string;
  name: string;
  description?: string;
  geojson: any;
  hidden?: boolean;
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

// Update a POI
export async function updatePOI(id: string, data: Partial<{
  name: string;
  description?: string;
  geojson: any;
  hidden?: boolean;
}>) {
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

// Delete a POI
export async function deletePOI(id: string) {
  const { accessToken } = await getTokens();

  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error(await res.text());
}

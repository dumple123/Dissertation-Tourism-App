import { getTokens } from '~/utils/tokenUtils';

const API_BASE = 'http://localhost:3000/api/rooms';

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

export async function updateRoom(id: string, data: {
  name?: string;
  floor?: number;
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

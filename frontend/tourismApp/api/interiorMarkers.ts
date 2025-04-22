import { getTokens } from '~/utils/tokenUtils';

const API_BASE = 'http://localhost:3000/api/markers';

// Get all markers for a specific building
export async function getMarkersForBuilding(buildingId: string) {
  const { accessToken } = await getTokens();

  const res = await fetch(`${API_BASE}/building/${buildingId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

// Get a single marker (optional if you want detail view/editing)
export async function getMarkerById(id: string) {
  const { accessToken } = await getTokens();

  const res = await fetch(`${API_BASE}/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json();
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

// Delete an interior marker
export async function deleteInteriorMarker(id: string) {
  const { accessToken } = await getTokens();

  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error(await res.text());
}

import { getTokens } from "../utils/tokenUtils";
import Constants from "expo-constants";

const API_BASE = `${Constants.expoConfig?.extra?.API_URL}/api/maps`;

export const createMap = async (name: string) => {
  const { accessToken } = await getTokens();
  if (!accessToken) throw new Error("No token found");

  const res = await fetch(API_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create map");
  }

  return await res.json();
};

export const getMaps = async () => {
  const { accessToken } = await getTokens();
  if (!accessToken) throw new Error("No token found");

  const res = await fetch(API_BASE, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to fetch maps");
  }

  return await res.json();
};
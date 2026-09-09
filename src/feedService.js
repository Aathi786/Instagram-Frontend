
import { apiFetch } from "./api";

export const getFeed = async (userId) => {

  const response = await apiFetch(
    `/api/feed/${userId}`
  );

  if (!response.ok) {
    throw new Error("Failed to load feed");
  }

  return await response.json();
};


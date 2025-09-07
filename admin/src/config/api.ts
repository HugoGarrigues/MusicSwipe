export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const api = {
  me: () => `${API_URL}/auth/me`,
  users: () => `${API_URL}/users`,
  comments: () => `${API_URL}/comments`,
  ratings: () => `${API_URL}/ratings`,
  tracks: () => `${API_URL}/tracks`,
  ratingAverageByTrack: (trackId: number | string) => `${API_URL}/ratings/track/${trackId}/average`,
} as const;


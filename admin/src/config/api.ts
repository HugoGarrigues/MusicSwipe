export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const api = {
  me: () => `${API_URL}/auth/me`,
  users: () => `${API_URL}/users`,
  user: (id: number | string) => `${API_URL}/users/${id}`,
  comments: () => `${API_URL}/comments`,
  comment: (id: number | string) => `${API_URL}/comments/${id}`,
  ratings: () => `${API_URL}/ratings`,
  tracks: () => `${API_URL}/tracks`,
  ratingAverageByTrack: (trackId: number | string) => `${API_URL}/ratings/track/${trackId}/average`,
  commentsByTrack: (trackId: number | string) => `${API_URL}/comments?trackId=${trackId}`,
  likeStatusByTrack: (trackId: number | string) => `${API_URL}/likes/track/${trackId}`,
  likeCountByTrack: (trackId: number | string) => `${API_URL}/likes/track/${trackId}/count`,
  likeTrack: () => `${API_URL}/likes`,
  unlikeTrack: (trackId: number | string) => `${API_URL}/likes/track/${trackId}`,
} as const;

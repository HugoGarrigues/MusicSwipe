export type User = {
  id: number;
  email: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  avatarUrl: string | null;
};

export type Track = {
  id: number;
  spotifyId: string | null;
  title: string;
  artistName: string | null;
  albumName: string | null;
  duration: number | null;
  previewUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  id: number;
  userId: number;
  trackId: number;
  content: string;
  createdAt: string;
};

export type Like = {
  id: number;
  userId: number;
  trackId: number;
  createdAt: string;
};

export type Rating = {
  id: number;
  userId: number;
  trackId: number;
  score: number; // 1..5
  createdAt: string;
  updatedAt: string;
};

export type RatingAverage = {
  trackId: number;
  average: number;
  count: number;
};

export type FollowStats = {
  followers: number;
  following: number;
};

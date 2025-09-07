export type User = {
  id: number;
  email: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string | null;
};

export type Me = {
  id: number;
  email: string;
  username: string;
  isAdmin: boolean;
  avatarUrl?: string | null;
};

export type Comment = {
  id: number;
  userId: number;
  trackId: number;
  content: string;
  createdAt: string;
};

export type Rating = {
  id: number;
  userId: number;
  trackId: number;
  score: number;
  createdAt: string;
  updatedAt: string;
};

export type Like = {
  id: number;
  userId: number;
  trackId: number;
  createdAt: string;
};

export type Track = {
  id: number;
  spotifyId?: string | null;
  title: string;
  artistName?: string | null;
  albumName?: string | null;
  duration?: number | null;
  createdAt: string;
  updatedAt: string;
};

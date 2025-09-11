"use client";

import type { Track } from "@/types";

export type DiscoverState = {
  track: Track | null;
  liked: boolean;
};

export type DiscoverActions = {
  prev: () => void;
  next: () => void;
  toggleLike: () => Promise<void> | void;
  rate: (score: number) => Promise<void> | void;
};

type Listener = (state: DiscoverState) => void;

const state: DiscoverState = {
  track: null,
  liked: false,
};

let actions: DiscoverActions = {
  prev: () => {},
  next: () => {},
  toggleLike: async () => {},
  rate: async () => {},
};

const listeners = new Set<Listener>();

export function getDiscoverState(): DiscoverState {
  return state;
}

export function getDiscoverActions(): DiscoverActions {
  return actions;
}

export function setDiscoverState(partial: Partial<DiscoverState>) {
  Object.assign(state, partial);
  for (const fn of listeners) fn(state);
}

export function setDiscoverActions(partial: Partial<DiscoverActions>) {
  actions = { ...actions, ...partial };
}

export function subscribeDiscover(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

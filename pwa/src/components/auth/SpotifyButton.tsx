"use client";
import React, { useState } from "react";
import { API_URL } from "@/lib/config";

export const SpotifyButton: React.FC<{ label?: string }> = ({
  label = "Spotify",
}) => {
  const [loading, setLoading] = useState(false);

  const handleSpotify = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/spotify/auth-url`);
      if (!res.ok) throw new Error("Impossible de générer l'URL Spotify");
      const { authUrl } = (await res.json()) as { authUrl: string };
      window.location.href = authUrl;
    } catch (e) {
      console.error(e);
      setLoading(false);
      alert("Erreur Spotify. Réessayez.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleSpotify}
      disabled={loading}
      className="w-full inline-flex items-center gap-2 justify-center h-11 rounded-md bg-emerald-600/20 border border-emerald-500/30 text-emerald-200 hover:bg-emerald-600/30 hover:text-emerald-100 backdrop-blur-md transition-colors"
    >
      {/* Spotify icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
        aria-hidden
      >
        <path d="M12 1.5C6.21 1.5 1.5 6.21 1.5 12S6.21 22.5 12 22.5 22.5 17.79 22.5 12 17.79 1.5 12 1.5Zm4.77 14.3a.75.75 0 0 1-1.03.25 12.55 12.55 0 0 0-9.48-.79.75.75 0 1 1-.5-1.41 14.05 14.05 0 0 1 10.61.89c.36.19.5.64.28 1.06Zm.7-3.14a.94.94 0 0 1-1.28.31 14.72 14.72 0 0 0-11.12-.93.94.94 0 1 1-.6-1.79 16.61 16.61 0 0 1 12.55 1.05c.45.24.61.8.35 1.36Zm.13-3.12c-.2.34-.62.47-.96.28-3.2-1.9-7.72-2.35-12.2-1.27a.94.94 0 0 1-.45-1.84c5.04-1.24 10.01-.73 13.6 1.36.4.24.53.74.3 1.21Z" />
      </svg>
      <span> {loading ? "Connexion..." : label} </span>
    </button>
  );
};


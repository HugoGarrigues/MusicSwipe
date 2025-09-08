"use client";
import Image from "next/image";
import React from "react";

type Props = {
  title: string;
  subtitle: string;
  logoUrl?: string;
};

export const AuthHeader: React.FC<Props> = ({
  title,
  subtitle,
  logoUrl = "/assets/branding/logo.png",
}) => {
  return (
    <div className="mb-6 text-center">
      <div className="mx-auto mb-4 h-16 w-16 relative">
        <Image
          src={logoUrl}
          alt="MusicSwipe logo"
          fill
          className="object-contain drop-shadow-[0_8px_30px_rgba(255,255,255,0.12)]"
          sizes="64px"
          priority
        />
      </div>
      <h1 className="text-white text-2xl font-semibold">{title}</h1>
      <p className="text-white/70 text-sm">{subtitle}</p>
    </div>
  );
};


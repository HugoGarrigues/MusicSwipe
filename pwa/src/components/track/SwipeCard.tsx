"use client";

import React, { useRef, useState } from "react";
import Card from "@/components/ui/Card";

type Props = {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
};

export default function SwipeCard({ children, onSwipeLeft, onSwipeRight, className = "" }: Props) {
  const startX = useRef<number | null>(null);
  const [dx, setDx] = useState(0);

  function handleStart(clientX: number) {
    startX.current = clientX;
  }
  function handleMove(clientX: number) {
    if (startX.current == null) return;
    setDx(clientX - startX.current);
  }
  function handleEnd() {
    const threshold = 80;
    if (dx > threshold) onSwipeRight?.();
    else if (dx < -threshold) onSwipeLeft?.();
    setDx(0);
    startX.current = null;
  }

  return (
    <Card
      variant="plain"
      className={`select-none touch-pan-y bg-transparent border-0 shadow-none ${className}`}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => startX.current != null && handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={() => startX.current != null && handleEnd()}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
      style={{ transform: `translateX(${dx}px) rotate(${dx / 40}deg)` }}
    >
      {children}
    </Card>
  );
}

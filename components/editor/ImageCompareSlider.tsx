"use client";

import React, { useState, useRef, useCallback } from "react";
import { Icon } from "@/components/icons/Icon";

interface ImageCompareSliderProps {
  beforeImage: string | null;
  afterImage: string;
}

export const ImageCompareSlider: React.FC<ImageCompareSliderProps> = ({
  beforeImage,
  afterImage,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging.current) {
      handleMove(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  if (!beforeImage) {
    return (
      <img
        src={afterImage}
        alt="Result"
        className="max-w-full max-h-full object-contain rounded-md"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden rounded-md cursor-ew-resize group/slider"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <img
        src={beforeImage}
        alt="Before"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        draggable={false}
      />
      <div
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={afterImage}
          alt="After"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          draggable={false}
        />
      </div>
      <div
        className="absolute top-0 bottom-0 w-1 bg-white/50 pointer-events-none z-10"
        style={{ left: `calc(${sliderPosition}% - 0.5px)` }}
      ></div>
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-[var(--bg-surface-4)]/80 backdrop-blur-sm border-2 border-white/50 rounded-full flex items-center justify-center text-white pointer-events-none shadow-lg transition-transform group-hover/slider:scale-110 z-10"
        style={{ left: `${sliderPosition}%` }}
      >
        <Icon name="arrows-right-left" className="w-5 h-5" />
      </div>
      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-md pointer-events-none z-10">
        Ảnh Gốc
      </div>
      <div
        className="absolute top-2 right-2 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-md pointer-events-none z-10"
        style={{
          opacity: sliderPosition > 60 ? 1 : 0,
          transition: "opacity 0.2s",
        }}
      >
        Kết Quả
      </div>
    </div>
  );
};

"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Icon } from "@/components/icons/Icon";

interface ImageViewerModalProps {
  images: string[];
  startIndex: number;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  images,
  startIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const imageUrl = images[currentIndex];

  const handlePrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : prev));
    },
    [images.length]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : prev));
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, onClose]);

  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-surface-4)]/80 backdrop-blur-lg border border-[var(--border-1)] rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-[var(--bg-interactive)] text-white rounded-full p-2 hover:bg-[var(--bg-interactive-hover)] transition-transform duration-200 hover:scale-110 z-20"
          aria-label="Close"
        >
          <Icon name="x-mark" className="w-6 h-6" />
        </button>
        <div className="p-2 flex-grow overflow-auto flex items-center justify-center relative">
          <img
            src={imageUrl}
            alt={`Fullscreen view ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-md"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 text-white rounded-full p-2 hover:bg-black/70 transition-all disabled:opacity-0 disabled:cursor-not-allowed"
                aria-label="Previous image"
              >
                <Icon name="chevron-left" className="w-8 h-8" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === images.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 text-white rounded-full p-2 hover:bg-black/70 transition-all disabled:opacity-0 disabled:cursor-not-allowed"
                aria-label="Next image"
              >
                <Icon name="chevron-right" className="w-8 h-8" />
              </button>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div className="text-center text-white/80 pb-2 font-mono">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

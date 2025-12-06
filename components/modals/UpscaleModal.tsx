"use client";

import React from "react";
import { Icon } from "@/components/icons/Icon";
import type { SourceImage } from "@/types";

interface UpscaleModalProps {
  image: SourceImage;
  onClose: () => void;
  onUpscale: (targetQuality: "2K" | "4K") => Promise<void>;
  isLoading?: boolean;
  progress?: number;
}

export const UpscaleModal: React.FC<UpscaleModalProps> = ({
  image,
  onClose,
  onUpscale,
  isLoading = false,
  progress = 0,
}) => {
  const handleUpscale = async (quality: "2K" | "4K") => {
    await onUpscale(quality);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-surface-4)]/80 backdrop-blur-lg border border-[var(--border-1)] rounded-xl shadow-2xl max-w-4xl max-h-[90vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-[var(--bg-interactive)] text-white rounded-full p-2 hover:bg-[var(--bg-interactive-hover)] transition-transform duration-200 hover:scale-110 z-10"
          aria-label="Close"
          disabled={isLoading}
        >
          <Icon name="x-mark" className="w-6 h-6" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            Upscale Ảnh
          </h2>

          {/* Image Preview */}
          <div className="mb-6 overflow-auto max-h-[50vh]">
            <img
              src={image.dataUrl}
              alt="Preview"
              className="w-full h-auto object-contain rounded-md"
            />
          </div>

          {/* Progress Bar */}
          {isLoading && (
            <div className="mb-4">
              <div className="w-full bg-[var(--bg-surface-2)] rounded-full h-2">
                <div
                  className="bg-[var(--bg-accent)] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-2 text-center">
                Đang upscale... {progress}%
              </p>
            </div>
          )}

          {/* Quality Selection */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleUpscale("2K")}
              disabled={isLoading}
              className="flex-1 bg-[var(--bg-interactive)] hover:bg-[var(--bg-interactive-hover)] text-white font-bold py-3 px-6 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Icon name="arrow-up-circle" className="w-5 h-5" />
              Upscale 2K (2048x2048)
            </button>
            <button
              onClick={() => handleUpscale("4K")}
              disabled={isLoading}
              className="flex-1 bg-[var(--bg-interactive)] hover:bg-[var(--bg-interactive-hover)] text-white font-bold py-3 px-6 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Icon name="arrow-up-circle" className="w-5 h-5" />
              Upscale 4K (4096x4096)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

"use client";

import React from "react";
import type { SourceImage } from "@/types";
import { ImageCompareSlider } from "./ImageCompareSlider";
import { Icon } from "@/components/icons/Icon";

interface ResultDisplayProps {
  sourceImage: SourceImage | null;
  images: string[];
  isLoading: boolean;
  onUpscale: (index: number, target: "2k" | "4k") => void;
  upscalingIndex: number | null;
  onEditRequest: (image: string) => void;
  selectedImageIndex: number;
  onSelectImageIndex: (index: number) => void;
  onChangeAngle: (index: number) => void;
  onFullscreen: (index: number) => void;
  onCreateVideoRequest: (image: string) => void;
  onColorAdjustmentRequest: (image: string) => void;
  showChangeAngleButton: boolean;
  progressState: { message: string; image: string | null } | null;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  sourceImage,
  images,
  isLoading,
  onUpscale,
  upscalingIndex,
  onEditRequest,
  selectedImageIndex,
  onSelectImageIndex,
  onChangeAngle,
  onFullscreen,
  onCreateVideoRequest,
  onColorAdjustmentRequest,
  showChangeAngleButton,
  progressState,
}) => {
  const selectedImage = images[selectedImageIndex];
  const sourceImageUrl = sourceImage
    ? `data:${sourceImage.mimeType};base64,${sourceImage.base64}`
    : null;

  return (
    <div className="bg-[var(--bg-surface-1)] backdrop-blur-md border border-[var(--border-1)] shadow-2xl shadow-[var(--shadow-color)] p-6 rounded-xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Kết Quả Render
        </h2>
        {images.length > 0 && (
          <span className="text-sm text-[var(--text-secondary)]">
            {images.length} ảnh
          </span>
        )}
      </div>

      <div className="flex-grow flex items-center justify-center bg-black/20 rounded-lg mb-4 min-h-[300px] md:min-h-[400px]">
        {isLoading ? (
          <div className="w-full h-full relative flex items-center justify-center">
            {progressState?.image ? (
              <img
                src={progressState.image}
                alt="Progress step"
                className="max-h-full max-w-full object-contain rounded"
              />
            ) : (
              <div className="w-full h-full bg-[var(--bg-surface-2)] rounded-lg animate-pulse"></div>
            )}
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg z-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-100"></div>
              <p className="mt-3 font-semibold text-sm text-slate-200">
                {progressState?.message || "Đang tạo..."}
              </p>
            </div>
          </div>
        ) : selectedImage ? (
          <div className="relative group w-full h-full flex items-center justify-center">
            <ImageCompareSlider
              beforeImage={sourceImageUrl}
              afterImage={selectedImage}
            />

            {upscalingIndex === selectedImageIndex && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center rounded-lg z-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-100"></div>
                <p className="mt-3 font-semibold text-sm text-slate-200">
                  Đang upscale...
                </p>
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  onClick={() => onSelectImageIndex(selectedImageIndex - 1)}
                  disabled={selectedImageIndex === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 text-white rounded-full p-2 hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed"
                  aria-label="Previous image"
                >
                  <Icon name="chevron-left" className="w-6 h-6" />
                </button>
                <button
                  onClick={() => onSelectImageIndex(selectedImageIndex + 1)}
                  disabled={selectedImageIndex === images.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 text-white rounded-full p-2 hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed"
                  aria-label="Next image"
                >
                  <Icon name="chevron-right" className="w-6 h-6" />
                </button>
              </>
            )}

            {upscalingIndex === null && (
              <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <button
                  onClick={() => onFullscreen(selectedImageIndex)}
                  className="bg-[var(--bg-surface-3)]/80 backdrop-blur-sm border border-[var(--border-2)] hover:bg-[var(--bg-interactive)] text-[var(--text-primary)] hover:text-[var(--text-interactive)] font-bold text-xs px-3 py-2 rounded-md transition-colors flex items-center gap-1.5"
                  title="Xem Toàn Màn Hình"
                >
                  <Icon name="arrows-expand" className="w-4 h-4" />
                  <span>Phóng To</span>
                </button>
                <button
                  onClick={() => onColorAdjustmentRequest(selectedImage)}
                  className="bg-[var(--bg-surface-3)]/80 backdrop-blur-sm border border-[var(--border-2)] hover:bg-[var(--bg-interactive)] text-[var(--text-primary)] hover:text-[var(--text-interactive)] font-bold text-xs px-3 py-2 rounded-md transition-colors flex items-center gap-1.5"
                  title="Chỉnh Sửa Màu Sắc"
                >
                  <Icon name="adjustments-horizontal" className="w-4 h-4" />
                  <span>Chỉnh Màu</span>
                </button>
                <button
                  onClick={() => onEditRequest(selectedImage)}
                  className="bg-[var(--bg-surface-3)]/80 backdrop-blur-sm border border-[var(--border-2)] hover:bg-[var(--bg-interactive)] text-[var(--text-primary)] hover:text-[var(--text-interactive)] font-bold text-xs px-3 py-2 rounded-md transition-colors flex items-center gap-1.5"
                  title="Chỉnh Sửa Ảnh Này"
                >
                  <Icon name="pencil" className="w-4 h-4" />
                  <span>Sửa</span>
                </button>
                <button
                  onClick={() => onCreateVideoRequest(selectedImage)}
                  className="bg-[var(--bg-surface-3)]/80 backdrop-blur-sm border border-[var(--border-2)] hover:bg-[var(--bg-interactive)] text-[var(--text-primary)] hover:text-[var(--text-interactive)] font-bold text-xs px-3 py-2 rounded-md transition-colors flex items-center gap-1.5"
                  title="Tạo Video từ ảnh này"
                >
                  <Icon name="film" className="w-4 h-4" />
                  <span>Tạo Video</span>
                </button>
                {showChangeAngleButton && (
                  <button
                    onClick={() => onChangeAngle(selectedImageIndex)}
                    className="bg-[var(--bg-surface-3)]/80 backdrop-blur-sm border border-[var(--border-2)] hover:bg-[var(--bg-interactive)] text-[var(--text-primary)] hover:text-[var(--text-interactive)] font-bold text-xs px-3 py-2 rounded-md transition-colors flex items-center gap-1.5"
                    title="Đổi Góc Chụp Ảnh Này"
                  >
                    <Icon name="viewfinder" className="w-4 h-4" />
                    <span>Đổi Góc Chụp</span>
                  </button>
                )}
                <a
                  href={selectedImage}
                  download={`nbox-ai-render-${Date.now()}.png`}
                  className="bg-[var(--bg-surface-3)]/80 backdrop-blur-sm border border-[var(--border-2)] hover:bg-[var(--bg-interactive)] text-[var(--text-primary)] hover:text-[var(--text-interactive)] font-bold text-xs px-3 py-2 rounded-md transition-colors flex items-center gap-1.5"
                  aria-label="Tải ảnh"
                  title="Tải ảnh"
                >
                  <Icon name="download" className="w-4 h-4" />
                  <span>Tải</span>
                </a>
              </div>
            )}

            {upscalingIndex === null && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <button
                  onClick={() => onUpscale(selectedImageIndex, "2k")}
                  className="bg-[var(--bg-surface-3)]/80 backdrop-blur-sm border border-[var(--border-2)] hover:bg-[var(--bg-surface-2)] text-[var(--text-primary)] font-bold text-xs px-2 py-1 rounded-md transition-colors"
                  title="Upscale lên 2K"
                >
                  UPSCALE 2K
                </button>
                <button
                  onClick={() => onUpscale(selectedImageIndex, "4k")}
                  className="bg-[var(--bg-surface-3)]/80 backdrop-blur-sm border border-[var(--border-2)] hover:bg-[var(--bg-surface-2)] text-[var(--text-primary)] font-bold text-xs px-2 py-1 rounded-md transition-colors"
                  title="Upscale lên 4K"
                >
                  UPSCALE 4K
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-[var(--text-tertiary)]">
            <p>Hình ảnh được tạo sẽ xuất hiện ở đây.</p>
          </div>
        )}
      </div>

      <div
        className={`grid gap-3 ${
          images.length > 1 ? "grid-cols-4" : "grid-cols-1"
        }`}
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square bg-[var(--bg-surface-2)] rounded-lg animate-pulse"
              ></div>
            ))
          : images.map((image, index) => (
              <div
                key={index}
                className={`relative group aspect-square bg-[var(--bg-surface-2)] rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                  selectedImageIndex === index
                    ? "ring-2 ring-offset-2 ring-offset-[var(--bg-surface-1)] ring-[var(--ring-active)]"
                    : "opacity-70 hover:opacity-100"
                }`}
                onClick={() => onSelectImageIndex(index)}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
      </div>
    </div>
  );
};

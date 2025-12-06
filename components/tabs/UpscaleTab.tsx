"use client";

import React, { useState, useRef } from "react";
import { Icon } from "@/components/icons/Icon";
import { upscaleImage } from "@/services/geminiService";
import type { SourceImage } from "@/types";
import Section from "@/components/ui/Section";
// Simple fullscreen modal for single image
const ImageViewerModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({
  imageUrl,
  onClose,
}) => (
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
        className="absolute -top-4 -right-4 bg-[var(--bg-interactive)] text-white rounded-full p-2 hover:bg-[var(--bg-interactive-hover)] transition-transform duration-200 hover:scale-110 z-10"
        aria-label="Close"
      >
        <Icon name="x-mark" className="w-6 h-6" />
      </button>
      <div className="p-2 flex-grow overflow-auto flex items-center justify-center">
        <img
          src={imageUrl}
          alt="Fullscreen view"
          className="max-w-full max-h-full object-contain rounded-md"
        />
      </div>
    </div>
  </div>
);

const ImageUpload: React.FC<{
  sourceImage: SourceImage | null;
  onImageUpload: (image: SourceImage) => void;
  onRemove: () => void;
}> = ({ sourceImage, onImageUpload, onRemove }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const processFile = (file: File) => {
    if (file?.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const base64 = dataUrl.split(",")[1];
        if (base64)
          onImageUpload({
            base64,
            mimeType: file.type,
            dataUrl,
            name: file.name,
          });
      };
      reader.readAsDataURL(file);
    } else {
      alert("Vui lòng tải lên một tệp ảnh hợp lệ (PNG, JPG, WEBP).");
    }
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDraggingOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) processFile(file);
        }}
        className={`relative group border-2 border-dashed rounded-lg p-4 flex items-center justify-center h-64 mb-4 hover:border-[var(--border-interactive)] transition-colors cursor-pointer ${
          isDraggingOver
            ? "border-[var(--border-interactive)] bg-[var(--bg-surface-2)]"
            : "border-[var(--border-2)]"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        {sourceImage ? (
          <>
            <img
              src={`data:${sourceImage.mimeType};base64,${sourceImage.base64}`}
              alt="Source"
              className="max-h-full max-w-full object-contain rounded"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="absolute top-1 right-1 bg-black/50 rounded-full text-white hover:bg-black/80 p-0.5 transition-colors opacity-0 group-hover:opacity-100 z-10"
              aria-label="Remove source image"
            >
              <Icon name="x-circle" className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="text-center text-[var(--text-secondary)] pointer-events-none">
            <Icon
              name="photo"
              className="w-12 h-12 mx-auto mb-2 text-[var(--text-tertiary)]"
            />
            <p>Nhấp hoặc kéo ảnh cần Upscale vào đây</p>
            <p className="text-xs">PNG, JPG, WEBP</p>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full bg-[var(--bg-interactive)] hover:bg-[var(--bg-interactive-hover)] text-[var(--text-interactive)] font-bold py-2 px-4 rounded transition-colors"
      >
        {sourceImage ? "Đổi Ảnh Khác" : "Tải Lên Ảnh"}
      </button>
    </div>
  );
};

export const UpscaleTab: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<SourceImage | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [targetResolution, setTargetResolution] = useState<"2k" | "4k">("2k");
  const [isLoading, setIsLoading] = useState(false);
  const [isResultFullscreen, setIsResultFullscreen] = useState(false);

  const handleUpscale = async () => {
    if (!sourceImage) return;
    try {
      const aistudio = (window as any).aistudio;
      if (aistudio?.openSelectKey) {
        const hasKey = await aistudio.hasSelectedApiKey();
        if (!hasKey) await aistudio.openSelectKey();
      }
    } catch (e) {
      console.warn("Failed to check API key state", e);
    }
    setIsLoading(true);
    setResultImage(null);
    try {
      const result = await upscaleImage(sourceImage, targetResolution, "pro");
      if (result) setResultImage(result);
      else throw new Error("AI did not return an image.");
    } catch (error) {
      console.error("Upscale failed:", error);
      alert(
        `Đã xảy ra lỗi khi upscale: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-8">
          <Section title="1. Ảnh Cần Upscale">
            <ImageUpload
              sourceImage={sourceImage}
              onImageUpload={(img) => {
                setSourceImage(img);
                setResultImage(null);
              }}
              onRemove={() => {
                setSourceImage(null);
                setResultImage(null);
              }}
            />
          </Section>
          {sourceImage && (
            <Section title="2. Tùy Chọn Độ Phân Giải">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setTargetResolution("2k")}
                    className={`flex-1 py-4 px-2 rounded-lg border-2 font-bold text-center transition-all ${
                      targetResolution === "2k"
                        ? "border-[var(--border-accent)] bg-[var(--bg-surface-3)] text-[var(--text-accent)] shadow-md"
                        : "border-[var(--border-2)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--text-secondary)]"
                    }`}
                  >
                    2K Resolution
                  </button>
                  <button
                    onClick={() => setTargetResolution("4k")}
                    className={`flex-1 py-4 px-2 rounded-lg border-2 font-bold text-center transition-all ${
                      targetResolution === "4k"
                        ? "border-[var(--border-accent)] bg-[var(--bg-surface-3)] text-[var(--text-accent)] shadow-md"
                        : "border-[var(--border-2)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--text-secondary)]"
                    }`}
                  >
                    4K Resolution
                  </button>
                </div>
                <div className="p-3 bg-[var(--bg-surface-2)] rounded-md text-xs text-[var(--text-secondary)]">
                  <p className="font-semibold mb-1 flex items-center gap-1">
                    <Icon name="sparkles" className="w-3 h-3" /> Sử dụng mô hình
                    Nano Banana Pro
                  </p>
                  <p>
                    Mô hình chuyên dụng cho việc tái tạo chi tiết và nâng cao
                    chất lượng hình ảnh sắc nét.
                  </p>
                </div>
                <button
                  onClick={handleUpscale}
                  disabled={isLoading}
                  className="w-full bg-[var(--bg-interactive)] hover:bg-[var(--bg-interactive-hover)] text-[var(--text-interactive)] font-bold py-4 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg disabled:bg-[var(--bg-disabled)] disabled:cursor-not-allowed transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      <span>Đang Upscale...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="arrow-up-circle" className="w-6 h-6" />
                      <span>
                        Bắt Đầu Upscale {targetResolution.toUpperCase()}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </Section>
          )}
        </div>
        <div className="lg:col-span-2">
          <Section title="Kết Quả">
            <div className="w-full aspect-video bg-black/20 rounded-lg flex items-center justify-center min-h-[500px] relative group">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-100"></div>
                  <p className="mt-4 font-semibold text-lg text-[var(--text-primary)]">
                    AI đang xử lý ảnh...
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] mt-2">
                    Quá trình này có thể mất vài giây đến một phút.
                  </p>
                </div>
              ) : resultImage ? (
                <>
                  <img
                    src={resultImage}
                    alt="Upscaled result"
                    className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
                  />
                  <div className="absolute top-4 right-4 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <button
                      onClick={() => setIsResultFullscreen(true)}
                      className="bg-[var(--bg-surface-3)]/90 backdrop-blur-md border border-[var(--border-2)] hover:bg-[var(--bg-interactive)] text-[var(--text-primary)] hover:text-[var(--text-interactive)] font-bold text-sm px-4 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-lg"
                      title="Xem Toàn Màn Hình"
                    >
                      <Icon name="arrows-expand" className="w-5 h-5" />
                      <span>Phóng To</span>
                    </button>
                    <a
                      href={resultImage}
                      download={`nbox-ai-upscale-${targetResolution}-${Date.now()}.png`}
                      className="bg-[var(--bg-surface-3)]/90 backdrop-blur-md border border-[var(--border-2)] hover:bg-[var(--bg-interactive)] text-[var(--text-primary)] hover:text-[var(--text-interactive)] font-bold text-sm px-4 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-lg"
                      aria-label="Tải ảnh"
                      title="Tải ảnh"
                    >
                      <Icon name="download" className="w-5 h-5" />
                      <span>Tải Ảnh Về</span>
                    </a>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-mono pointer-events-none">
                    Nano Banana Pro • {targetResolution.toUpperCase()}
                  </div>
                </>
              ) : (
                <div className="text-center text-[var(--text-tertiary)]">
                  <Icon
                    name="arrow-up-circle"
                    className="w-20 h-20 mx-auto mb-6 opacity-50"
                  />
                  <p className="text-lg font-medium">
                    Kết quả Upscale sẽ xuất hiện tại đây.
                  </p>
                </div>
              )}
            </div>
          </Section>
        </div>
      </div>
      {isResultFullscreen && resultImage && (
        <ImageViewerModal
          imageUrl={resultImage}
          onClose={() => setIsResultFullscreen(false)}
        />
      )}
    </>
  );
};

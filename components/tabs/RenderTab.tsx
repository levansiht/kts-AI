"use client";

import { useState } from "react";
import type { SourceImage, RenderHistoryItem } from "@/types";
import { ImageUpload } from "@/components/render";
import { Icon } from "@/components/icons/Icon";

interface RenderTabProps {
  type: "exterior" | "interior" | "floorplan";
  sourceImage: SourceImage | null;
  referenceImage: SourceImage | null;
  generatedImages: string[];
  selectedImageIndex: number;
  onSourceImageUpload: (image: SourceImage) => void;
  onReferenceImageUpload: (image: SourceImage) => void;
  onSourceImageRemove: () => void;
  onReferenceImageRemove: () => void;
  onGenerate: () => void;
  isGenerating?: boolean;
}

export function RenderTab({
  type,
  sourceImage,
  referenceImage,
  generatedImages,
  onSourceImageUpload,
  onReferenceImageUpload,
  onSourceImageRemove,
  onReferenceImageRemove,
  onGenerate,
  isGenerating = false,
}: RenderTabProps) {
  const getTitle = () => {
    switch (type) {
      case "exterior":
        return "Render Ngoại Thất";
      case "interior":
        return "Render Nội Thất";
      case "floorplan":
        return "Floorplan to 3D";
    }
  };

  const getDescription = () => {
    switch (type) {
      case "exterior":
        return "Upload ảnh ngoại thất và ảnh tham khảo để tạo render chất lượng cao";
      case "interior":
        return "Upload ảnh nội thất và ảnh tham khảo để tạo render chất lượng cao";
      case "floorplan":
        return "Upload mặt bằng và ảnh tham khảo để tạo mô hình 3D";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          {getTitle()}
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          {getDescription()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Image Upload */}
        <div className="bg-[var(--bg-surface-1)] backdrop-blur-md border border-[var(--border-1)] shadow-[var(--shadow-color)] p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Ảnh Gốc
          </h3>
          <ImageUpload
            sourceImage={sourceImage}
            onImageUpload={onSourceImageUpload}
            onRemove={onSourceImageRemove}
          />
        </div>

        {/* Reference Image Upload */}
        <div className="bg-[var(--bg-surface-1)] backdrop-blur-md border border-[var(--border-1)] shadow-[var(--shadow-color)] p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Ảnh Tham Khảo
          </h3>
          <ImageUpload
            sourceImage={referenceImage}
            onImageUpload={onReferenceImageUpload}
            onRemove={onReferenceImageRemove}
          />
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={onGenerate}
          disabled={!sourceImage || isGenerating}
          className="px-8 py-3 bg-[var(--bg-accent)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Icon name="sparkles" className="w-5 h-5" />
          {isGenerating ? "Đang xử lý..." : "Tạo Render"}
        </button>
      </div>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div className="bg-[var(--bg-surface-1)] backdrop-blur-md border border-[var(--border-1)] shadow-[var(--shadow-color)] p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Kết Quả
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {generatedImages.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-lg overflow-hidden border border-[var(--border-1)] hover:border-[var(--border-accent)] transition-colors cursor-pointer"
              >
                <img
                  src={img}
                  alt={`Generated ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

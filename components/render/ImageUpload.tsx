"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/icons/Icon";
import type { SourceImage } from "@/types";

interface ImageUploadProps {
  sourceImage: SourceImage | null;
  onImageUpload: (image: SourceImage) => void;
  onRemove: () => void;
}

export default function ImageUpload({
  sourceImage,
  onImageUpload,
  onRemove,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const processFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        if (base64) {
          onImageUpload({ base64, mimeType: file.type });
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert("Vui lòng tải lên một tệp ảnh hợp lệ (PNG, JPG, WEBP).");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  };

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group border-2 border-dashed rounded-lg p-4 flex items-center justify-center h-48 mb-4 hover:border-[var(--border-interactive)] transition-colors cursor-pointer ${
          isDraggingOver
            ? "border-[var(--border-interactive)] bg-[var(--bg-surface-2)]"
            : "border-[var(--border-2)]"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        {sourceImage ? (
          <>
            <Image
              src={`data:${sourceImage.mimeType};base64,${sourceImage.base64}`}
              alt="Source"
              width={500}
              height={500}
              className="max-h-full max-w-full object-contain rounded"
              unoptimized
            />
            <button
              onClick={handleRemove}
              className="absolute top-1 right-1 bg-black/50 rounded-full text-white hover:bg-black/80 p-0.5 transition-colors opacity-0 group-hover:opacity-100 z-10"
              aria-label="Remove source image"
            >
              <Icon name="x-circle" className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="text-center text-[var(--text-secondary)] pointer-events-none">
            <p>Nhấp hoặc kéo tệp vào đây</p>
            <p className="text-xs">PNG, JPG, WEBP</p>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
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
}

"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/icons/Icon";
import type { SourceImage } from "@/types";

interface ReferenceImageUploadProps {
  image: SourceImage | null;
  onUpload: (image: SourceImage) => void;
  onRemove: () => void;
}

export default function ReferenceImageUpload({
  image,
  onUpload,
  onRemove,
}: ReferenceImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const processFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const base64 = dataUrl.split(",")[1];
        if (base64) {
          onUpload({
            base64,
            mimeType: file.type,
            dataUrl,
            name: file.name,
          });
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

  const handleDragOver = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  if (image) {
    return (
      <div className="relative group">
        <Image
          src={`data:${image.mimeType};base64,${image.base64}`}
          alt="Reference"
          width={500}
          height={224}
          className="w-full h-56 object-cover rounded-md"
          unoptimized
        />
        <button
          onClick={onRemove}
          className="absolute top-1 right-1 bg-black/50 rounded-full text-white hover:bg-black/80 p-0.5 transition-colors opacity-0 group-hover:opacity-100 z-10"
          aria-label="Remove reference image"
        >
          <Icon name="x-circle" className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full border-2 border-dashed rounded-lg p-4 flex items-center justify-center h-56 text-center text-[var(--text-secondary)] text-sm hover:border-[var(--border-interactive)] transition-colors ${
          isDraggingOver
            ? "border-[var(--border-interactive)] bg-[var(--bg-surface-2)]"
            : "border-[var(--border-2)]"
        }`}
      >
        + Thêm ảnh tham khảo (Tone/Mood)
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
    </>
  );
}

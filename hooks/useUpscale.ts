"use client";

import { useState } from "react";
import type { SourceImage } from "@/types";
import { generateImage } from "@/services/geminiService";

export interface UpscaleState {
  isUpscaleModalOpen: boolean;
  imageToUpscale: SourceImage | null;
  upscaleLoading: boolean;
  upscaleProgress: number;
  openUpscaleModal: (image: SourceImage) => void;
  closeUpscaleModal: () => void;
  handleUpscale: (
    targetQuality: "2K" | "4K",
    modelTier: "free" | "pro"
  ) => Promise<SourceImage | null>;
}

/**
 * Custom hook to manage upscaling operations
 *
 * Upscaling Process:
 * 1. User selects an image to upscale
 * 2. Modal opens with quality options (2K or 4K)
 * 3. Uses geminiService to upscale the image
 * 4. Returns upscaled image
 */
export function useUpscale(): UpscaleState {
  const [isUpscaleModalOpen, setIsUpscaleModalOpen] = useState(false);
  const [imageToUpscale, setImageToUpscale] = useState<SourceImage | null>(
    null
  );
  const [upscaleLoading, setUpscaleLoading] = useState(false);
  const [upscaleProgress, setUpscaleProgress] = useState(0);

  const openUpscaleModal = (image: SourceImage) => {
    setImageToUpscale(image);
    setIsUpscaleModalOpen(true);
  };

  const closeUpscaleModal = () => {
    setIsUpscaleModalOpen(false);
    setImageToUpscale(null);
    setUpscaleProgress(0);
  };

  const handleUpscale = async (
    targetQuality: "2K" | "4K",
    modelTier: "free" | "pro"
  ): Promise<SourceImage | null> => {
    if (!imageToUpscale) return null;

    setUpscaleLoading(true);
    setUpscaleProgress(0);

    try {
      const targetSize = targetQuality === "2K" ? 2048 : 4096;
      const prompt = `Upscale this architectural rendering to ${targetQuality} resolution while maintaining all details, textures, and lighting. Enhance clarity and sharpness without changing the original design.`;

      const progressInterval = setInterval(() => {
        setUpscaleProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const result = await generateImage({
        sourceImageBase64: imageToUpscale.dataUrl,
        prompt,
        modelType: modelTier,
        targetWidth: targetSize,
        targetHeight: targetSize,
      });

      clearInterval(progressInterval);
      setUpscaleProgress(100);

      if (result.success && result.imageUrl) {
        const upscaledImage: SourceImage = {
          dataUrl: result.imageUrl,
          base64: result.imageUrl.split(",")[1] || result.imageUrl,
          mimeType: "image/png",
          name: `${imageToUpscale.name.replace(
            /\.[^/.]+$/,
            ""
          )}_${targetQuality}.png`,
          dimensions: { width: targetSize, height: targetSize },
        };

        setUpscaleLoading(false);
        closeUpscaleModal();
        return upscaledImage;
      } else {
        throw new Error(result.error || "Upscale failed");
      }
    } catch (error) {
      console.error("Upscale error:", error);
      setUpscaleLoading(false);
      setUpscaleProgress(0);
      return null;
    }
  };

  return {
    isUpscaleModalOpen,
    imageToUpscale,
    upscaleLoading,
    upscaleProgress,
    openUpscaleModal,
    closeUpscaleModal,
    handleUpscale,
  };
}

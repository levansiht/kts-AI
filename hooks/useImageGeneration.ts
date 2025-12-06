"use client";

import { useState } from "react";
import type { SourceImage } from "@/types";
import { generateImage } from "@/services/geminiService";

export interface ImageGenerationState {
  isGenerating: boolean;
  generationProgress: number;
  generationStatus: string;
  generatedImages: SourceImage[];
  selectedImageIndex: number | null;
  generateImages: (params: GenerateImagesParams) => Promise<void>;
  setSelectedImageIndex: (index: number | null) => void;
  clearGeneratedImages: () => void;
}

export interface GenerateImagesParams {
  sourceImage: SourceImage;
  referenceImage?: SourceImage | null;
  prompt: string;
  modelTier: "free" | "pro";
  imageQuality: "1K" | "2K" | "4K";
  numberOfImages?: number;
  onComplete?: (images: SourceImage[]) => void;
}

/**
 * Custom hook to manage AI image generation workflow
 *
 * Features:
 * - Generate multiple images from a source image and prompt
 * - Track generation progress
 * - Support for reference images (style transfer)
 * - Model tier selection (free/pro)
 * - Quality selection (1K/2K/4K)
 */
export function useImageGeneration(): ImageGenerationState {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState("");
  const [generatedImages, setGeneratedImages] = useState<SourceImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  const generateImages = async ({
    sourceImage,
    referenceImage,
    prompt,
    modelTier,
    imageQuality,
    numberOfImages = 4,
    onComplete,
  }: GenerateImagesParams): Promise<void> => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus("Đang chuẩn bị...");
    setGeneratedImages([]);
    setSelectedImageIndex(null);

    const targetSize =
      imageQuality === "1K" ? 1024 : imageQuality === "2K" ? 2048 : 4096;
    const results: SourceImage[] = [];

    try {
      for (let i = 0; i < numberOfImages; i++) {
        setGenerationStatus(`Đang tạo ảnh ${i + 1}/${numberOfImages}...`);
        setGenerationProgress((i / numberOfImages) * 90);

        // Build complete prompt
        let completePrompt = prompt;

        if (referenceImage) {
          completePrompt +=
            " Use the reference image as a style guide for colors, materials, and overall aesthetic.";
        }

        const result = await generateImage({
          sourceImageBase64: sourceImage.dataUrl,
          referenceImageBase64: referenceImage?.dataUrl,
          prompt: completePrompt,
          modelType: modelTier,
          targetWidth: targetSize,
          targetHeight: targetSize,
        });

        if (result.success && result.imageUrl) {
          const generatedImage: SourceImage = {
            dataUrl: result.imageUrl,
            base64: result.imageUrl.split(",")[1] || result.imageUrl,
            mimeType: "image/png",
            name: `generated_${i + 1}_${Date.now()}.png`,
            dimensions: { width: targetSize, height: targetSize },
          };
          results.push(generatedImage);
        } else {
          console.error(`Failed to generate image ${i + 1}:`, result.error);
        }

        // Update progress
        setGenerationProgress(((i + 1) / numberOfImages) * 90);
      }

      setGenerationProgress(100);
      setGenerationStatus("Hoàn thành!");
      setGeneratedImages(results);

      if (results.length > 0) {
        setSelectedImageIndex(0);
      }

      if (onComplete) {
        onComplete(results);
      }

      // Reset after a delay
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
        setGenerationStatus("");
      }, 1000);
    } catch (error) {
      console.error("Image generation error:", error);
      setGenerationStatus("Lỗi khi tạo ảnh!");
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const clearGeneratedImages = () => {
    setGeneratedImages([]);
    setSelectedImageIndex(null);
  };

  return {
    isGenerating,
    generationProgress,
    generationStatus,
    generatedImages,
    selectedImageIndex,
    generateImages,
    setSelectedImageIndex,
    clearGeneratedImages,
  };
}

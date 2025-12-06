import type { SourceImage } from "@/types";

export type TourMoveType =
  | "pan-up"
  | "pan-down"
  | "pan-left"
  | "pan-right"
  | "orbit-left"
  | "orbit-right"
  | "zoom-in"
  | "zoom-out";

export async function generateVirtualTourImage(
  sourceImage: SourceImage,
  moveType: TourMoveType,
  magnitude: 15 | 30 | 45
): Promise<string | null> {
  // Placeholder - bạn cần implement logic thực tế
  throw new Error("Not implemented");
}

export async function generateImages(
  sourceImage: SourceImage,
  prompt: string,
  renderType: "exterior" | "interior" | "floorplan" | "masterplan",
  numImages: number,
  aspectRatio: string,
  referenceImage: SourceImage | null,
  isAnglePrompt: boolean,
  useSketchIntermediate: boolean,
  modelTier: "free" | "pro" = "pro",
  imageQuality: "1K" | "2K" | "4K" = "2K"
): Promise<string[]> {
  // Placeholder - bạn cần implement logic thực tế
  throw new Error("Not implemented");
}

export async function upscaleImage(
  image: SourceImage,
  target: "2k" | "4k",
  modelTier: "free" | "pro"
): Promise<string | null> {
  // Placeholder - bạn cần implement logic thực tế
  throw new Error("Not implemented");
}

export async function generateInteriorRenderTwoStep(
  sourceImage: SourceImage,
  prompt: string,
  numImages: number,
  aspectRatio: string,
  referenceImage: SourceImage | null,
  onProgress: (message: string, currentImage: string | null) => void,
  modelTier: "free" | "pro",
  imageQuality: "1K" | "2K" | "4K"
): Promise<string[]> {
  // Placeholder - bạn cần implement logic thực tế
  throw new Error("Not implemented");
}

export async function editImage(
  sourceImage: SourceImage,
  maskImage: SourceImage,
  prompt: string
): Promise<string | null> {
  // Placeholder - bạn cần implement logic thực tế
  throw new Error("Not implemented");
}

export async function generateImageFromText(
  prompt: string
): Promise<string | null> {
  // Placeholder - bạn cần implement logic thực tế
  throw new Error("Not implemented");
}

export async function generatePromptsFromImage(
  sourceImage: SourceImage
): Promise<{ medium: string[]; closeup: string[]; interior: string[] }> {
  // Placeholder - bạn cần implement logic thực tế
  throw new Error("Not implemented");
}

export async function generateMoodImages(
  sourceImage: SourceImage
): Promise<string[]> {
  // Placeholder - bạn cần implement logic thực tế
  throw new Error("Not implemented");
}

export async function generateVideo(
  prompt: string,
  sourceImage: SourceImage | null,
  onProgress: (status: string) => void
): Promise<string | null> {
  // Placeholder - bạn cần implement logic thực tế
  throw new Error("Not implemented");
}

export async function generateCompletionPrompts(
  sourceImage: SourceImage
): Promise<string[]> {
  // Placeholder - bạn cần implement logic thực tế
  throw new Error("Not implemented");
}

export async function generateInteriorCompletionPrompts(
  sourceImage: SourceImage
): Promise<string[]> {
  // Placeholder - bạn cần implement logic thực tế
  throw new Error("Not implemented");
}

export async function improveExteriorRender(
  sourceImage: SourceImage,
  prompt: string,
  onProgress: (message: string, currentImage: string | null) => void
): Promise<string | null> {
  // Placeholder - bạn cần implement logic thực tế
  throw new Error("Not implemented");
}

export async function improveInteriorRender(
  sourceImage: SourceImage,
  prompt: string,
  onProgress: (message: string, currentImage: string | null) => void
): Promise<string | null> {
  // Placeholder - bạn cần implement logic thực tế
  throw new Error("Not implemented");
}

/**
 * Simplified wrapper for single image generation
 * Used by hooks like useImageGeneration and useUpscale
 */
export async function generateImage(params: {
  sourceImageBase64: string;
  referenceImageBase64?: string;
  prompt: string;
  modelType: "free" | "pro";
  targetWidth: number;
  targetHeight: number;
}): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    // Create SourceImage from base64
    const sourceImage: SourceImage = {
      base64:
        params.sourceImageBase64.split(",")[1] || params.sourceImageBase64,
      mimeType: "image/png",
      dataUrl: params.sourceImageBase64,
      name: "source.png",
    };

    const referenceImage = params.referenceImageBase64
      ? {
          base64:
            params.referenceImageBase64.split(",")[1] ||
            params.referenceImageBase64,
          mimeType: "image/png",
          dataUrl: params.referenceImageBase64,
          name: "reference.png",
        }
      : null;

    // Determine quality based on target size
    let imageQuality: "1K" | "2K" | "4K" = "1K";
    if (params.targetWidth >= 4096 || params.targetHeight >= 4096) {
      imageQuality = "4K";
    } else if (params.targetWidth >= 2048 || params.targetHeight >= 2048) {
      imageQuality = "2K";
    }

    // Call existing generateImages function
    const results = await generateImages(
      sourceImage,
      params.prompt,
      "exterior", // Default type
      1, // Generate 1 image
      "1:1", // Square aspect ratio
      referenceImage,
      false, // isAnglePrompt
      false, // useSketchIntermediate
      params.modelType,
      imageQuality
    );

    if (results && results.length > 0) {
      return {
        success: true,
        imageUrl: results[0],
      };
    } else {
      return {
        success: false,
        error: "No image generated",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

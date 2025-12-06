"use client";

import { useState } from "react";

export type ModelTier = "free" | "pro";
export type ImageQuality = "1K" | "2K" | "4K";

export interface ModelSelectionState {
  modelTier: ModelTier;
  imageQuality: ImageQuality;
  setModelTier: (tier: ModelTier) => void;
  setImageQuality: (quality: ImageQuality) => void;
  canUseQuality: (quality: ImageQuality) => boolean;
}

/**
 * Custom hook to manage model tier and image quality selection
 *
 * Model Tiers:
 * - free: Uses Gemini Flash 2.0 model (faster, lower cost)
 * - pro: Uses Gemini Pro 2.0 Experimental model (higher quality)
 *
 * Image Quality:
 * - 1K: 1024x1024 (available for all tiers)
 * - 2K: 2048x2048 (available for all tiers)
 * - 4K: 4096x4096 (available for all tiers, but slower)
 */
export function useModelSelection(): ModelSelectionState {
  const [modelTier, setModelTier] = useState<ModelTier>("free");
  const [imageQuality, setImageQuality] = useState<ImageQuality>("1K");

  /**
   * Check if a quality level is available for current model tier
   * All qualities are available for both free and pro tiers
   */
  const canUseQuality = (quality: ImageQuality): boolean => {
    // All qualities available for all tiers
    return true;
  };

  return {
    modelTier,
    imageQuality,
    setModelTier,
    setImageQuality,
    canUseQuality,
  };
}

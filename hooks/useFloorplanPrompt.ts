"use client";

import { useState, useEffect } from "react";

export interface FloorplanPromptState {
  customPrompt: string;
  buildingType: string;
  viewAngle: string;
  style: string;
  finalPrompt: string;
  setCustomPrompt: (prompt: string) => void;
  setBuildingType: (type: string) => void;
  setViewAngle: (angle: string) => void;
  setStyle: (style: string) => void;
  buildingTypeOptions: string[];
  viewAngleOptions: string[];
  styleOptions: string[];
}

const BUILDING_TYPES = [
  "Nhà phố",
  "Biệt thự",
  "Chung cư",
  "Văn phòng",
  "Khách sạn",
  "Nhà hàng",
  "Cửa hàng",
  "Nhà xưởng",
  "... Khác",
];

const VIEW_ANGLES = [
  "Góc nhìn chính diện",
  "Góc nhìn 3/4",
  "Góc nhìn từ trên cao",
  "Góc nhìn mắt người",
  "Góc nhìn toàn cảnh",
  "... Khác",
];

const STYLES = [
  "Hiện đại",
  "Cổ điển",
  "Tân cổ điển",
  "Minimalist",
  "Industrial",
  "Scandinavian",
  "Tropical",
  "Mediterranean",
  "Asian Contemporary",
  "... Khác",
];

/**
 * Custom hook to manage floorplan to 3D rendering prompt construction
 *
 * Combines:
 * - Custom prompt text
 * - Building type (house, villa, apartment, etc.)
 * - View angle (front, 3/4, aerial, etc.)
 * - Architectural style (modern, classical, minimalist, etc.)
 */
export function useFloorplanPrompt(): FloorplanPromptState {
  const [customPrompt, setCustomPrompt] = useState("");
  const [buildingType, setBuildingType] = useState("");
  const [viewAngle, setViewAngle] = useState("");
  const [style, setStyle] = useState("");
  const [finalPrompt, setFinalPrompt] = useState("");

  // Auto-generate final prompt when inputs change
  useEffect(() => {
    const parts: string[] = [];

    if (customPrompt.trim()) {
      parts.push(customPrompt.trim());
    }

    if (buildingType && buildingType !== "... Khác") {
      parts.push(buildingType);
    }

    if (viewAngle && viewAngle !== "... Khác") {
      parts.push(viewAngle);
    }

    if (style && style !== "... Khác") {
      parts.push(`Phong cách ${style}`);
    }

    // Default floorplan conversion prompt
    const basePrompt =
      "Convert this 2D floor plan into a realistic 3D architectural visualization with proper proportions, materials, lighting, and environmental context.";

    const combinedPrompt =
      parts.length > 0 ? `${basePrompt} ${parts.join(", ")}` : basePrompt;

    setFinalPrompt(combinedPrompt);
  }, [customPrompt, buildingType, viewAngle, style]);

  return {
    customPrompt,
    buildingType,
    viewAngle,
    style,
    finalPrompt,
    setCustomPrompt,
    setBuildingType,
    setViewAngle,
    setStyle,
    buildingTypeOptions: BUILDING_TYPES,
    viewAngleOptions: VIEW_ANGLES,
    styleOptions: STYLES,
  };
}

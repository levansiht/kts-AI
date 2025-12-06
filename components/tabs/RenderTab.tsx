"use client";

import { useState, useRef } from "react";
import type { SourceImage, RenderHistoryItem } from "@/types";
import ImageUpload from "@/components/render/ImageUpload";
import ReferenceImageUpload from "@/components/render/ReferenceImageUpload";
import { Icon } from "@/components/icons/Icon";
import Section from "@/components/ui/Section";
import { ResultDisplay } from "@/components/editor/ResultDisplay";
import { HistoryPanel } from "@/components/history/HistoryPanel";
import { useExteriorPrompt } from "@/hooks/useExteriorPrompt";
import { useInteriorPrompt } from "@/hooks/useInteriorPrompt";
import { useFloorplanPrompt } from "@/hooks/useFloorplanPrompt";

interface RenderTabProps {
  type: "exterior" | "interior" | "floorplan";
  sourceImage: SourceImage | null;
  referenceImage: SourceImage | null;
  generatedImages: string[];
  selectedImageIndex: number;
  history: RenderHistoryItem[];
  onSourceImageUpload: (image: SourceImage) => void;
  onReferenceImageUpload: (image: SourceImage) => void;
  onSourceImageRemove: () => void;
  onReferenceImageRemove: () => void;
  onGenerate: (prompt: string, isAngleChange?: boolean) => void;
  onSelectImageIndex: (index: number) => void;
  onChangeAngle: (index: number) => void;
  onFullscreen: (index: number) => void;
  onUpscale: (index: number, target: "2k" | "4k") => void;
  onEditRequest: (image: string) => void;
  onCreateVideoRequest: (image: string) => void;
  onColorAdjustmentRequest: (image: string) => void;
  onClearHistory: () => void;
  onSelectHistoryItem: (item: RenderHistoryItem) => void;
  isGenerating?: boolean;
  upscalingIndex: number | null;
  progressState: { message: string; image: string | null } | null;
  modelTier: "free" | "pro";
  imageQuality: "1K" | "2K" | "4K";
  onModelTierChange: (tier: "free" | "pro") => void;
  onImageQualityChange: (quality: "1K" | "2K" | "4K") => void;
  numImages: number;
  onNumImagesChange: (num: number) => void;
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;
}

export function RenderTab({
  type,
  sourceImage,
  referenceImage,
  generatedImages,
  selectedImageIndex,
  history,
  onSourceImageUpload,
  onReferenceImageUpload,
  onSourceImageRemove,
  onReferenceImageRemove,
  onGenerate,
  onSelectImageIndex,
  onChangeAngle,
  onFullscreen,
  onUpscale,
  onEditRequest,
  onCreateVideoRequest,
  onColorAdjustmentRequest,
  onClearHistory,
  onSelectHistoryItem,
  isGenerating = false,
  upscalingIndex,
  progressState,
  modelTier,
  imageQuality,
  onModelTierChange,
  onImageQualityChange,
  numImages,
  onNumImagesChange,
  aspectRatio,
  onAspectRatioChange,
}: RenderTabProps) {
  const angleSectionRef = useRef<HTMLDivElement>(null);
  const [anglePrompt, setAnglePrompt] = useState("");

  // Get the appropriate prompt hook based on tab type
  const exteriorPrompt = useExteriorPrompt();
  const interiorPrompt = useInteriorPrompt();
  const floorplanPrompt = useFloorplanPrompt();

  const currentPromptHook =
    type === "exterior"
      ? exteriorPrompt
      : type === "interior"
      ? interiorPrompt
      : floorplanPrompt;

  const selectCommonStyles =
    "w-full bg-[var(--bg-surface-3)] p-3 rounded-md text-sm focus:ring-2 focus:ring-[var(--ring-focus)] focus:outline-none appearance-none";

  const getTitle = () => {
    switch (type) {
      case "exterior":
        return "Tải Lên Ảnh Ngoại Thất";
      case "interior":
        return "Tải Lên Ảnh Nội Thất";
      case "floorplan":
        return "Tải Lên Bản Vẽ Mặt Bằng";
    }
  };

  const getHistoryTitle = () => {
    switch (type) {
      case "exterior":
        return "Lịch Sử Render Ngoại Thất";
      case "interior":
        return "Lịch Sử Render Nội Thất";
      case "floorplan":
        return "Lịch Sử Render Mặt Bằng";
    }
  };

  const handleAnglePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAnglePrompt(e.target.value);
  };

  // Render Options UI (Model tier, quality, count, aspect ratio)
  const renderOptionsUI = (
    <div className="space-y-4 border-t border-[var(--border-2)] pt-4">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
        Mô Hình AI
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onModelTierChange("free")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            modelTier === "free"
              ? "bg-[var(--bg-interactive)] text-[var(--text-interactive)]"
              : "bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-4)]"
          }`}
        >
          Gemini 2.0 Flash (Free)
        </button>
        <button
          onClick={() => onModelTierChange("pro")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            modelTier === "pro"
              ? "bg-[var(--bg-interactive)] text-[var(--text-interactive)]"
              : "bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-4)]"
          }`}
        >
          Gemini 2.0 Flash Thinking (Pro)
        </button>
      </div>

      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
        Chất Lượng Ảnh
      </label>
      <div className="grid grid-cols-3 gap-2">
        {(["1K", "2K", "4K"] as const).map((quality) => (
          <button
            key={quality}
            onClick={() => onImageQualityChange(quality)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              imageQuality === quality
                ? "bg-[var(--bg-interactive)] text-[var(--text-interactive)]"
                : "bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-4)]"
            }`}
          >
            {quality}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Số Lượng Ảnh: {numImages}
        </label>
        <input
          type="range"
          min="1"
          max="8"
          value={numImages}
          onChange={(e) => onNumImagesChange(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Tỷ Lệ Khung Hình
        </label>
        <select
          value={aspectRatio}
          onChange={(e) => onAspectRatioChange(e.target.value)}
          className={`${selectCommonStyles} pr-10`}
          style={{
            backgroundImage: "var(--select-arrow-svg)",
            backgroundPosition: "right 0.5rem center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "1.5em 1.5em",
          }}
        >
          <option value="Auto">Auto (Theo ảnh gốc)</option>
          <option value="1:1">1:1 (Vuông)</option>
          <option value="16:9">16:9 (Ngang)</option>
          <option value="9:16">9:16 (Dọc)</option>
          <option value="4:3">4:3 (Cổ điển ngang)</option>
          <option value="3:4">3:4 (Cổ điển dọc)</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Controls */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          {/* Section 1: Image Upload */}
          <Section title={`1. ${getTitle()}`}>
            <ImageUpload
              sourceImage={sourceImage}
              onImageUpload={onSourceImageUpload}
              onRemove={onSourceImageRemove}
            />
          </Section>

          {/* Section 2: Description & Options */}
          <Section title="2. Mô Tả & Tùy Chọn">
            <div className="space-y-4">
              <ReferenceImageUpload
                image={referenceImage}
                onUpload={onReferenceImageUpload}
                onRemove={onReferenceImageRemove}
              />

              {/* Exterior-specific controls */}
              {type === "exterior" && (
                <>
                  <textarea
                    value={exteriorPrompt.customPrompt}
                    onChange={(e) => exteriorPrompt.setCustomPrompt(e.target.value)}
                    placeholder="Thêm mô tả tùy chỉnh (ví dụ: nhà 1 tầng, có gara...)"
                    className="w-full bg-[var(--bg-surface-3)] p-2 rounded-md h-20 resize-none text-sm focus:ring-2 focus:ring-[var(--ring-focus)] focus:outline-none"
                  />
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Bối cảnh
                      </label>
                      <select
                        onChange={(e) => exteriorPrompt.setContext(e.target.value)}
                        value={exteriorPrompt.context}
                        className={`${selectCommonStyles} pr-10`}
                        style={{
                          backgroundImage: "var(--select-arrow-svg)",
                          backgroundPosition: "right 0.5rem center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "1.5em 1.5em",
                        }}
                      >
                        <option value="">Chọn một bối cảnh...</option>
                        {exteriorPrompt.contextOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Ánh sáng
                      </label>
                      <select
                        onChange={(e) => exteriorPrompt.setLighting(e.target.value)}
                        value={exteriorPrompt.lighting}
                        className={`${selectCommonStyles} pr-10`}
                        style={{
                          backgroundImage: "var(--select-arrow-svg)",
                          backgroundPosition: "right 0.5rem center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "1.5em 1.5em",
                        }}
                      >
                        <option value="">Chọn một loại ánh sáng...</option>
                        {exteriorPrompt.lightingOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Tone màu
                      </label>
                      <select
                        onChange={(e) => exteriorPrompt.setTone(e.target.value)}
                        value={exteriorPrompt.tone}
                        className={`${selectCommonStyles} pr-10`}
                        style={{
                          backgroundImage: "var(--select-arrow-svg)",
                          backgroundPosition: "right 0.5rem center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "1.5em 1.5em",
                        }}
                      >
                        <option value="">Chọn một tone màu...</option>
                        {exteriorPrompt.toneOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="pt-2">
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                        Prompt cuối cùng:
                      </label>
                      <div className="bg-[var(--bg-surface-4)]/50 p-3 rounded-md text-sm text-[var(--text-primary)] border border-[var(--border-2)] min-h-[5rem] select-all">
                        {exteriorPrompt.finalPrompt}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Interior-specific controls */}
              {type === "interior" && (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Loại Phòng
                      </label>
                      <select
                        onChange={(e) => interiorPrompt.setRoomType(e.target.value)}
                        value={interiorPrompt.roomType}
                        className={`${selectCommonStyles} pr-10`}
                        style={{
                          backgroundImage: "var(--select-arrow-svg)",
                          backgroundPosition: "right 0.5rem center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "1.5em 1.5em",
                        }}
                      >
                        {interiorPrompt.roomTypeOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Phong Cách
                      </label>
                      <select
                        onChange={(e) => interiorPrompt.setRoomStyle(e.target.value)}
                        value={interiorPrompt.roomStyle}
                        className={`${selectCommonStyles} pr-10`}
                        style={{
                          backgroundImage: "var(--select-arrow-svg)",
                          backgroundPosition: "right 0.5rem center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "1.5em 1.5em",
                        }}
                      >
                        {interiorPrompt.roomStyleOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Ánh sáng
                      </label>
                      <select
                        onChange={(e) => interiorPrompt.setLighting(e.target.value)}
                        value={interiorPrompt.lighting}
                        className={`${selectCommonStyles} pr-10`}
                        style={{
                          backgroundImage: "var(--select-arrow-svg)",
                          backgroundPosition: "right 0.5rem center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "1.5em 1.5em",
                        }}
                      >
                        <option value="">Chọn một loại ánh sáng...</option>
                        {interiorPrompt.lightingOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <textarea
                    value={interiorPrompt.customPrompt}
                    onChange={(e) => interiorPrompt.setCustomPrompt(e.target.value)}
                    placeholder="Thêm mô tả tùy chỉnh..."
                    className="w-full bg-[var(--bg-surface-3)] p-2 rounded-md h-20 resize-none text-sm focus:ring-2 focus:ring-[var(--ring-focus)] focus:outline-none"
                  />
                  <div className="pt-2">
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Prompt cuối cùng:
                    </label>
                    <div className="bg-[var(--bg-surface-4)]/50 p-3 rounded-md text-sm text-[var(--text-primary)] border border-[var(--border-2)] min-h-[5rem] select-all">
                      {interiorPrompt.finalPrompt}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={interiorPrompt.useSketchIntermediate}
                      onChange={(e) =>
                        interiorPrompt.setUseSketchIntermediate(e.target.checked)
                      }
                      className="w-4 h-4 rounded border-[var(--border-2)] bg-[var(--bg-surface-3)] focus:ring-2 focus:ring-[var(--ring-focus)]"
                    />
                    Sử dụng sketch trung gian (chất lượng tốt hơn, chậm hơn)
                  </label>
                </>
              )}

              {/* Floorplan-specific controls */}
              {type === "floorplan" && "finalPrompt" in currentPromptHook && (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Loại Phòng
                      </label>
                      <select
                        onChange={(e) =>
                          "setRoomType" in currentPromptHook &&
                          currentPromptHook.setRoomType(e.target.value)
                        }
                        value={
                          "roomType" in currentPromptHook
                            ? currentPromptHook.roomType
                            : ""
                        }
                        className={`${selectCommonStyles} pr-10`}
                        style={{
                          backgroundImage: "var(--select-arrow-svg)",
                          backgroundPosition: "right 0.5rem center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "1.5em 1.5em",
                        }}
                      >
                        {"roomTypeOptions" in currentPromptHook &&
                          currentPromptHook.roomTypeOptions.map((opt: string) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Phong Cách
                      </label>
                      <select
                        onChange={(e) =>
                          "setRoomStyle" in currentPromptHook &&
                          currentPromptHook.setRoomStyle(e.target.value)
                        }
                        value={
                          "roomStyle" in currentPromptHook
                            ? currentPromptHook.roomStyle
                            : ""
                        }
                        className={`${selectCommonStyles} pr-10`}
                        style={{
                          backgroundImage: "var(--select-arrow-svg)",
                          backgroundPosition: "right 0.5rem center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "1.5em 1.5em",
                        }}
                      >
                        {"roomStyleOptions" in currentPromptHook &&
                          currentPromptHook.roomStyleOptions.map((opt: string) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div className="pt-2">
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Prompt cuối cùng:
                    </label>
                    <div className="bg-[var(--bg-surface-4)]/50 p-3 rounded-md text-sm text-[var(--text-primary)] border border-[var(--border-2)] min-h-[5rem] select-all">
                      {currentPromptHook.finalPrompt}
                    </div>
                  </div>
                </>
              )}

              {renderOptionsUI}

              <button
                onClick={() =>
                  onGenerate(
                    "finalPrompt" in currentPromptHook
                      ? currentPromptHook.finalPrompt
                      : "",
                    false
                  )
                }
                disabled={isGenerating || !sourceImage}
                className="w-full bg-[var(--bg-interactive)] hover:bg-[var(--bg-interactive-hover)] text-[var(--text-interactive)] font-bold py-3 px-4 rounded transition-colors flex items-center justify-center gap-2 disabled:bg-[var(--bg-disabled)] disabled:cursor-not-allowed"
              >
                <Icon name="sparkles" className="w-5 h-5" />
                Tạo Ảnh Thực Tế
              </button>
            </div>
          </Section>

          {/* Section 3: Change Angle */}
          <div ref={angleSectionRef}>
            <Section title="3. Đổi Góc Chụp">
              <div className="space-y-4">
                <textarea
                  value={anglePrompt}
                  onChange={(e) => setAnglePrompt(e.target.value)}
                  placeholder="Ví dụ: Góc chụp từ dưới lên (low angle)..."
                  className="w-full bg-[var(--bg-surface-3)] p-2 rounded-md h-24 resize-none text-sm focus:ring-2 focus:ring-[var(--ring-focus)] focus:outline-none"
                />
                <select
                  onChange={handleAnglePresetChange}
                  value=""
                  className={selectCommonStyles}
                  style={{
                    backgroundImage: "var(--select-arrow-svg)",
                    backgroundPosition: "right 0.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                    paddingRight: "2.5rem",
                  }}
                >
                  <option value="" disabled>
                    Hoặc chọn một góc chụp có sẵn
                  </option>
                  {"angleOptions" in currentPromptHook &&
                    currentPromptHook.angleOptions.map((option: string) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                </select>
                <button
                  onClick={() => onGenerate(anglePrompt, true)}
                  disabled={isGenerating || !sourceImage}
                  className="w-full bg-[var(--bg-interactive)] hover:bg-[var(--bg-interactive-hover)] text-[var(--text-interactive)] font-bold py-3 px-4 rounded transition-colors flex items-center justify-center gap-2 disabled:bg-[var(--bg-disabled)] disabled:cursor-not-allowed"
                >
                  <Icon name="sparkles" className="w-5 h-5" />
                  Tạo Góc Chụp Mới
                </button>
              </div>
            </Section>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <ResultDisplay
            sourceImage={sourceImage}
            images={generatedImages}
            isLoading={isGenerating}
            onUpscale={onUpscale}
            upscalingIndex={upscalingIndex}
            onEditRequest={onEditRequest}
            selectedImageIndex={selectedImageIndex}
            onSelectImageIndex={onSelectImageIndex}
            onChangeAngle={onChangeAngle}
            onFullscreen={onFullscreen}
            onCreateVideoRequest={onCreateVideoRequest}
            onColorAdjustmentRequest={onColorAdjustmentRequest}
            showChangeAngleButton={true}
            progressState={progressState}
          />
          <HistoryPanel
            title={getHistoryTitle()}
            history={history}
            onClear={onClearHistory}
            onSelect={onSelectHistoryItem}
          />
        </div>
      </div>
    </div>
  );
}
